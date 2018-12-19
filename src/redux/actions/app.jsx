import lodash from 'lodash';
import API from "../../api.jsx"
import SortedSet from 'js-sorted-set'
import QuantaClient from "@quantadex/quanta_js"
import { Apis } from "@quantadex/bitsharesjs-ws";
import { Price, Asset, FillOrder, LimitOrderCreate } from "../../common/MarketClasses";
import { PrivateKey, PublicKey, Aes, key, ChainStore } from "@quantadex/bitsharesjs";
import { createLimitOrderWithPrice, createLimitOrder2, signAndBroadcast } from "../../common/Transactions";

export const INIT_DATA = 'INIT_DATA';
export const LOGIN = 'LOGIN';
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';
export const SET_MARKET_QUOTE = 'SET_MARKET_QUOTE';
export const APPEND_TRADE = 'APPEND_TRADE';
export const UPDATE_TICKER = 'UPDATE_TICKER';
export const UPDATE_ORDER = 'UPDATE_ORDER';
export const SET_AMOUNT = 'SET_AMOUNT';
export const UPDATE_USER_ORDER = 'UPDATE_USER_ORDER';
export const UPDATE_TRADES = 'UPDATE_TRADES'
export const UPDATE_DIGITS = 'UPDATE_DIGITS'

export const TOGGLE_LEFT_PANEL = 'TOGGLE_LEFT_PANEL';
export const TOGGLE_RIGHT_PANEL = 'TOGGLE_RIGHT_PANEL';

export const TOGGLE_FAVORITE_LIST = 'TOGGLE_FAVORITE_LIST';
export const INIT_BALANCE = 'INIT_BALANCE'
export const UPDATE_OPEN_ORDERS = 'UPDATE_OPEN_ORDERS'

export const toggleFavoriteList = pair => ({
	type: TOGGLE_FAVORITE_LIST,
	pair
})

export function getMarketQuotes() {
	return function(dispatch) {
		qClient.getQuotes().then((e) => {
			dispatch({
				type: SET_MARKET_QUOTE,
				data: e
			})
		})
	} 
}

export function initBalance() {
	return function(dispatch) {
	}
}

function getBaseCounter(market) {
	const parts = market.split("/")
	return {
		base: assetsBySymbol[parts[0]],
		counter: assetsBySymbol[parts[1]]
	}
}

export function buyTransaction(market, price, amount) {
	return (dispatch, getState) => {
		var {base, counter} = getBaseCounter(market)
		var user_id = getState().app.userId;

		const pKey = PrivateKey.fromWif(getState().app.private_key);
		console.log(pKey, assets[base.id], price, amount, user_id);

		const order = createLimitOrderWithPrice(user_id, true, window.assets, base.id, counter.id, price, amount)

		console.log("order prepare", order);
		const tr = createLimitOrder2(order)
		return signAndBroadcast(tr, pKey)
			.then((e) => {
				console.log("order result ", e);
			})
	}
}

export function sellTransaction(market, price, amount) {
	return (dispatch, getState) => {
		var { base, counter } = getBaseCounter(market)
		var user_id = getState().app.userId;

		const pKey = PrivateKey.fromWif(getState().app.private_key);
		console.log(pKey, assets[base.id], user_id);

		const order = createLimitOrderWithPrice(user_id, false, window.assets, base.id, counter.id, price, amount)

		console.log("order prepare", order);
		const tr = createLimitOrder2(order)
		return signAndBroadcast(tr, pKey)
			.then((e) => {
				console.log("order result ", e);
			})
	}

}

var initAPI = false;
var wsString = "ws://testnet-01.quantachain.io:8090";

function updateChainState(state) {
	// console.log("updateChainState", state);
	// var c = ChainStore.getAccountRefsOfKey("QA6nkaBAz1vV6cb25vSHXJqHos1AeADzqRAXPvtASXMAhM3SbRFA");
	// console.log(c);
	// if (c){
	// 	c.forEach(chain_account_id => {
	// 		console.log(chain_account_id);
	// 		ChainStore.getAccount(chain_account_id);
	// 	})
	// }
}

export function switchTicker(ticker) {
	console.log("Switch ticker ", ticker);

	return function (dispatch,getState) {
		const pKey = PrivateKey.fromWif(getState().app.private_key);
		const publicKey = pKey.toPublicKey().toString()

		if (initAPI == false) {
			Apis.instance(wsString, true, 1000, { enableOrders: true }).init_promise.then((res) => {
				console.log("connected to:", res[0].network, publicKey);

				//Apis.instance().db_api().exec("set_subscribe_callback", [updateListener, true]);
				initAPI = true;				
			})
			.then((e) => {
				return Promise.all([Apis.instance()
					.db_api()
					.exec("get_key_references", [[publicKey]])
					.then(vec_account_id => {
						console.log("get_key_references ", vec_account_id[0][0]);

						Apis.instance()
							.db_api()
							.exec("get_objects", [[vec_account_id[0][0]]])
							.then((data) => {
								console.log("get account ", data);
								dispatch({
									type: UPDATE_ACCOUNT,
									data: data[0]
								})
							})

					}), Apis.instance().db_api().exec("list_assets", ["A", 100]).then((assets) => {
						console.log("assets ", assets);
						window.assets = lodash.keyBy(assets, "id")
						window.assetsBySymbol = lodash.keyBy(assets, "symbol")
						return assets;
					})]);
			})
			.then((e) => {
				action()
			});
		} else {
			action()
		}

		function action() {
			var {base, counter} = getBaseCounter(getState().app.currentTicker)
			
			const trades = Apis.instance().history_api().exec("get_fill_order_history", [base.id, counter.id, 100]).then((filled) => {
				console.log("history filled ", filled);
				var trade_history = [];
				filled.forEach((filled) => {
					var fill = new FillOrder(
						filled,
						window.assets,
						counter
					);
					console.log("normalized ", fill, fill.getPrice(), fill.fill_price.toReal());
					trade_history.push(fill)
				})
				return trade_history
			})

			const orderBook = Apis.instance().db_api().exec("get_order_book", [base.id, counter.id, 50]).then((ob) => {
				console.log("ob  ", ob);
				return ob
			})

			Apis.instance().db_api().exec("subscribe_to_market", [(data) => {
				console.log("Got a market change ", data);
			}, base.id, counter.id])

			Apis.instance()
				.db_api()
				.exec("get_limit_orders", [
					base.id,
					counter.id,
					300
				]).then((limitorders) => {
					console.log("ob  ", limitorders);
				})

			Apis.instance()
				.db_api()
				.exec("get_full_accounts", [["1.2.8"], false])
				.then(results => {
					console.log("full accounts ", results);
				});

			return Promise.all([orderBook,trades])
			.then((data) => {
				dispatch({
					type: INIT_DATA,
					data: {
						orderBook:data[0],
						trades:data[1],
					}
				})
			})


		}
		// const orderBook = fetch("http://orderbook-api-792236404.us-west-2.elb.amazonaws.com/depth/"+ticker).then((res) => {return res.json()})
		// const trades = fetch("http://orderbook-api-792236404.us-west-2.elb.amazonaws.com/settlement/"+ticker).then((res) => {return res.json()})
		// const openOrders = fetch("http://orderbook-api-792236404.us-west-2.elb.amazonaws.com/status").then((res) => {return res.json()})

		// return Promise.all([orderBook,trades,openOrders])
		// 	.then((data) => {
		// 		dispatch({
		// 			type: INIT_DATA,
		// 			data: {
		// 				orderBook:data[0],
		// 				trades:data[1],
		// 				openOrders:data[2],
		// 				ticker:ticker,
		// 			}
		// 		})

		// 		var orderbookws = new EventSource('http://testnet-02.quantachain.io:7200/stream/depth/'+ticker);

		// 		// Log errors
		// 		orderbookws.onerror = function (error) {
		// 		  console.log('EventSource Error ' + error);
		// 		};

		// 		// Log messages from the server
		// 		orderbookws.onmessage = function (e) {
		// 			dispatch({
		// 				type: UPDATE_ORDER,
		// 				data: e.data
		// 			})
		// 		};

		// 		var tradesws = new WebSocket('ws://backend-dev.env.quantadex.com:8080/ws/v1/trades/BTC/USD');

		// 		// Log errors
		// 		tradesws.onerror = function (error) {
		// 		  console.log('WebSocket Error ' + error);
		// 		};

		// 		// Log messages from the server
		// 		tradesws.onmessage = function (e) {
		// 			dispatch({
		// 				type: UPDATE_TRADES,
		// 				data: e.data
		// 			})
		// 		};
		// 	})
	}

}
