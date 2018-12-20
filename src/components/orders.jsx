import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import QTButton from './ui/button.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'

import {cancelTransaction} from "../redux/actions/app.jsx";


const container = css`
  position: relative;
  width: 100%;
  padding: 20px 35px;
  margin-bottom: 54px;

  .order-list {
    margin-top: 15px;
    height: 300px;
    table {
      tbody tr {
        border-top: 1px solid #333;
      }
      tbody td {
        padding: 4px 0;
      }
    }
  }

  .order-list.inactive {
    display: none;
  }

  .order-list-pairs {
    min-width: 64px;
  }

  .order-list-sloss, .order-list-limit, .order-list-amount, .order-list-total-btc {
    min-width: 82px;
  }

  .order-list-type {
    min-width: 28px;
  }

  .order-list-status {
    min-width: 42px;
  }

  .order-list-date {
    min-width: 96px;
  }

  .order-list-empty {
    width: 66px;
  }

  .order-list-btn {
    width: 66px;
    height:19px;
    line-height:17px;
    color: rgba(255, 255, 255, 0.62);
    border-radius: 2px;
    border: solid 1px #ffffff;
    opacity: 0.27;
    text-align:center;
  }

  .order-list-data {
    height:20px;
    cursor:pointer;

    &:hover {
      border-radius: 2px;
      background-color: rgba(52, 62, 68, 0.4);
    }
  }

  .scroll-up {
    position: absolute;
    right: 30px;
    top: 25px;
    background-image: url(/public/images/up-arrow.svg);
    background-repeat-x: no-repeat;
    background-position: right;
    background-position-y: 0;
    height: 18px;
    padding-right: 20px;
    line-height: 20px;
    color: #999;
    font-size: 12px;
    cursor: pointer;
  }
`;

class Orders extends Component {
  handleSwitch(index, selected) {
    window.scrollTo(0,document.body.scrollHeight);
    // const list = document.getElementsByClassName("order-list")[0]
    // if (index != selected || list.classList.contains("inactive")) {
    //   list.classList.remove("inactive")
      
    // } else {
    //   list.classList.add("inactive")
    // }
  }

  goToTop() {
    window.scrollTo(0,0);
  }

  handleCancel(market, order) {
    this.props.dispatch(cancelTransaction(market, order))
  }

  render() {
    // const orders_data = [
    //   ["BNCBTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","BUY","Filled","12 JAN, 12:34:15"],
    //   ["BNCBTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","BUY","Filled","12 JAN, 12:34:15"]
    // ]
    console.log('!!!?', this.props)
    const tabs = {
      names: ['ACTIVE ORDERS','CLOSED ORDERS'],
      selectedTabIndex: 0,
    }

    return (
      <div className={container}>
        <div className="scroll-up" onClick={this.goToTop.bind(this)}>SCROLL UP</div>
        <QTTabBar
          className="underline small static set-width qt-font-bold d-flex justify-content-center"
          width={200}
          gutter={10}
          tabs = {tabs}
          switchTab = {this.handleSwitch.bind(this)}
        />
        <section className="order-list container-fluid no-scroll-bar">
          <div>
            <QTTableViewSimple dataSource={this.props.openOrders.dataSource} columns={this.props.openOrders.columns}
              cancelOrder={this.handleCancel.bind(this)} />
          </div>
				</section>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  	bids: state.app.tradeBook.bids,
  	asks: state.app.tradeBook.asks,
		currentPrice: state.app.currentPrice,
    openOrders:state.app.openOrders,
    currentTicker: state.app.currentTicker
	});

export default connect(mapStateToProps)(Orders);
