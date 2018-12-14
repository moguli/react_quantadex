import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';
import { UPDATE_DIGITS } from '../redux/actions/app.jsx'
import QTDropdown from './ui/dropdown.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'
import lodash from 'lodash';

import { css } from 'emotion'
import globalcss from './global-css.js'

const container = css`

	.orderbook-ask, .orderbook-bid {
		height:260px;
	}

	.orderbook-middle {
		height:57px;
		border-top: 1px solid rgba(255, 255, 255, .09);
		border-bottom: 1px solid rgba(255, 255, 255, .09);
	}
`;

class OrderBook extends Component {
	constructor(props) {
			super(props)
			this.updateDigits = this.updateDigits.bind(this)
	}

	updateDigits(value) {
		this.props.dispatch({
			type: 'UPDATE_DIGITS',
			value: value
		})
	}

	render() {
		// const asksDataSource = lodash.takeRight(this.props.asks.dataSource,20).map((ask) => {
		// 	return {
		// 		...ask,
		// 		price: parseFloat(ask.price).toFixed(this.props.decimals.value),
		// 		total: parseFloat(ask.total).toFixed(this.props.decimals.maxTotalDecimals)
		// 	}
		// })
		
		var asksIterator = this.props.asks.dataSource.beginIterator();
		var asksDataSource = []
		while (asksIterator.value() !== null && asksDataSource.length < 20) {
			const ask = JSON.parse(asksIterator.value())
			asksDataSource.push({
				...ask,
				price: parseFloat(ask.price).toFixed(this.props.decimals.value),
				total: parseFloat(ask.total).toFixed(this.props.decimals.maxTotalDecimals)
			})
			asksIterator = asksIterator.next()
		}

		asksDataSource.reverse()


		var bidsIterator = this.props.bids.dataSource.beginIterator();
		var bidsDataSource = []
		while (bidsIterator.value() !== null && bidsDataSource.length < 20) {
			const bid = JSON.parse(bidsIterator.value())
			bidsDataSource.push({
				...bid,
				price: parseFloat(bid.price).toFixed(this.props.decimals.value),
				total: parseFloat(bid.total).toFixed(this.props.decimals.maxTotalDecimals)
			})
			bidsIterator = bidsIterator.next()
		}

		return (
			<div className={container}>
				<section className="orderbook-title">
					<div className="d-flex justify-content-between align-items-center">
						<div className="qt-font-bold qt-font-normal">ORDER BOOK</div>
						<QTDropdown
							items={this.props.decimals.allowedDecimals}
							value={this.props.decimals.value}
							className="icon-after down light qt-font-small qt-font-semibold"
							width="31"
							height="31"
							onChange={this.updateDigits}/>
					</div>
				</section>
				<section className="orderbook-ask no-scroll-bar">
					<div>
						<QTTableViewSimple dataSource={asksDataSource} columns={this.props.asks.columns} />
					</div>
				</section>
				<section className="orderbook-middle d-flex justify-content-between">
					<div className="d-flex flex-column justify-content-center">
						<div className="qt-color-theme qt-font-huge">{this.props.mostRecentTrade.price}</div>
						<div className="qt-number-normal qt-opacity-64">${this.props.spreadDollar}</div>
					</div>
					<div className="d-flex flex-column justify-content-center">
						<div className="qt-opacity-half qt-font-base text-right">Spread</div>
						<div className="qt-number-small text-right">{this.props.spread != undefined ? this.props.spread.toFixed(2) + "%" : "N/A"}</div>
					</div>
				</section>
				<section className="orderbook-bid no-scroll-bar">
					<div>
						<QTTableViewSimple
							dataSource={bidsDataSource}
							columns={this.props.bids.columns}
							HideHeader={true}
						/>
					 </div>
				</section>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
  	bids: state.app.orderBook.bids,
  	asks: state.app.orderBook.asks,
	decimals: state.app.orderBook.decimals,
	spread: state.app.orderBook.spread,
	spreadDollar:state.app.orderBook.spreadDollar,
	mostRecentTrade: state.app.mostRecentTrade,
	});

export default connect(mapStateToProps)(OrderBook);
