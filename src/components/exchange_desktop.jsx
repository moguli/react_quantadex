import React, { Component } from 'react';
import Header from './header.jsx';
import Chart from './chart.jsx';
import DepthChart from './chart_depth.jsx';
import TradingHistory from './trading_history.jsx';
import OrderBook from './order_book.jsx';
import Dashboard from './dashboard.jsx';
import Menu from './menu.jsx';
import Orders from './orders.jsx';
import Trade from './trade.jsx';
import Leaderboard from './leaderboard.jsx'
import Status from './status.jsx'
import FirstTime from './first_time.jsx'
import QTTableView from './ui/tableView.jsx'
import Order from './order.jsx';
import Markets from './markets.jsx';
import OpenOrders from './open_orders.jsx';

import {switchTicker, initBalance, getMarketQuotes} from "../redux/actions/app.jsx";
import { connect } from 'react-redux'

import { css } from 'emotion'
import globalcss from './global-css.js'

import { Link } from 'react-router-dom'

import QTTableViewSimple from './ui/tableViewSimple.jsx'

const container = css`
	background-color: #121517;
	position: relative;
	height: 100vh;

	section {
		background-color: #23282c;
		margin-right: 5px;
	}

	.content {
		.cols, .left-cols {
			flex: 0 0 260px;
		}
		.left-cols {
			padding: 10px;
			height: calc(100vh - 92px);
		}
	}

	.status {
		position: fixed;
		bottom: 0;
		justify-content: center;
		width: 100%;
		z-index: 99;
	}
	
	#tv_chart_container, #depth_chart_container {
		height: calc(100vh - 433px);
		min-height: 370px !important;
		width: 100%;
	}

	.trade-history {
		position: absolute;
		right: 10px;
		float: right;
		display: flex;
		font-size: 16px;
		padding: 8px 10px 0px
		
		.toggle {
			margin-left: 73px;
			color: #66d7d7;
			padding-left: 14px;
			font-size: 12px;
			background: url('/public/images/left-arrow.svg') no-repeat 0 4px;
		}
	}

	.switch-chart {
		padding-left: 10px;
		z-index: 1;

		button {
			margin: 5px 10px 0 0;
			padding: 2px 10px;
			font-size: 12px;
			border-radius: 20px;
			font-weight: bold;
			background: transparent;
			color: #ddd;
			border: 2px solid #4a4a4a;
			cursor: pointer;
		}
		button.active {
			border-color: #50b3b7;
			color: #fff;
		}
	}

	.exchange-dashboard {
		border-bottom: solid 1px #121517;
	}

	.no-scroll-bar {
		position: relative;
		overflow: hidden;
		margin-right: -10px;
	}
	.no-scroll-bar > div {
		height: 100%;
		position: absolute;
		padding-right: 5px;
		left: 0;
		right: 0;
		overflow-y: scroll;

		::-webkit-scrollbar {
			width: 6px;
			height: 6px;
		}
		
		::-webkit-scrollbar-track {
		background: transparent; 
		}
		
		::-webkit-scrollbar-thumb {
		background: rgba(255,255,255,0.1); 
		border-radius: 10px;
		}
		
		::-webkit-scrollbar-thumb:hover {
		background: rgba(255,255,255,0.2); 
		}

		scrollbar-width: thin;
		scrollbar-color: rgba(255,255,255,0.1) transparent;
	}

	
`;

class Exchange extends Component {
	constructor(props) {
		super(props)
		this.state = {
			chart: "tv",
			toggle_trade: false
		}
		
	}

	toggleChart(chart) {
		this.setState({ chart: chart })
	}

	render() {
		const Switchchart = () => {
			return(
				<div className="switch-chart d-flex">
					<button className={this.state.chart === "tv" ? "active": ""} onClick={() => this.toggleChart("tv")}>Price Chart</button>
					<button className={this.state.chart === "depth" ? "active": ""} onClick={() => this.toggleChart("depth")}>Depth Chart</button>
				</div>
			)
		}
		return (
			<div className={container}>
				<div className="d-flex">
					<Header />
					<Menu />
				</div>
				<div className="content d-flex">
					<section className="left-cols">
						<Trade />
					</section>
					<section className="left-cols">
						<OrderBook />
					</section>

					<div className="d-flex flex-column" style={{width: "calc(100% - 530px)"}}>
						<div className="d-flex mb-2">
							<div className="trade-history align-items-center">TRADE HISTORY
									<div className="toggle cursor-pointer" onClick={() => this.setState({toggle_trade: !this.state.toggle_trade})}>SHOW</div>
								</div>
							<section style={this.state.toggle_trade ? {width: "calc(100% - 270px)"} : {width: "100%"}}>
								

								<Switchchart />
								<Chart chartTools={true} className={this.state.chart === "tv" ? "d-block": "d-none"} />
								<DepthChart  className={this.state.chart === "depth" ? "d-block": "d-none"} />
							</section>

							<section className={"cols" + (this.state.toggle_trade ? "" : " d-none")}>
								<TradingHistory />
							</section>
						</div>
						
						
						<section>
							<Orders />
						</section>
					</div>
				</div>
				

				<section className="status">
					<Status />
				</section>
				
			</div>


		// <div className={container + " container-fluid"}>
		// 	<div className="row flex-nowrap" style={{overflow:"hidden",minHeight:"calc(100vh - 120px)"}}>
		// 		<div className="exchange-left" style={{ display: this.props.leftOpen ? 'block': 'none'}}>
		// 			<OrderBook />
		// 		</div>
		// 		<div className="exchange-middle">
		// 			<Header />
		// 			<Switchchart />
		// 			<Chart chartTools={true} className={this.state.chart === "tv" ? "d-block": "d-none"} />
		// 			<DepthChart  className={this.state.chart === "depth" ? "d-block": "d-none"} />
		// 			<div className="d-flex">
		// 				<Dashboard />
		// 				<Trade />
		// 			</div>
					
		// 		</div>
		// 		<div className="exchange-right" style={{ display: this.props.rightOpen ? 'block' : 'none'}}>
		// 			<Menu />
		// 			<Leaderboard />

		// 			<TradingHistory />
		// 		</div>
		// 	</div>
		// 	<div className="row exchange-bottom">
		// 		<Orders />
		// 		<Status />
		// 	</div>
		// 	{ localStorage.getItem("firstTimeComplete") ? null : <FirstTime /> }
		// </div>
		);
	}
}

const mapStateToProps = (state) => ({
		private_key: state.app.private_key,
		leftOpen: state.app.ui.leftOpen,
		rightOpen: state.app.ui.rightOpen,
		currentTicker: state.app.currentTicker,
	});


export default connect(mapStateToProps)(Exchange);
