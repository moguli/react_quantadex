import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { css } from 'emotion'
import globalcss from './global-css.js'

import QTTabBar from './ui/tabBar.jsx'
import QTButton from './ui/button.jsx'
import QTTableViewSimple from './ui/tableViewSimple.jsx'

import {cancelTransaction} from "../redux/actions/app.jsx";
import ReactGA from 'react-ga';


const container = css`
  position: relative;
  width: 100%;
  padding: 10px;

  .order-list {
    margin-top: 13px;
    height: 241px;
    overflow: hidden;
    overflow-y: scroll;

    table {
      tr {
        border-bottom: 1px solid #333;
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

  .sticky, thead th {
    position: sticky;
    position: -webkit-sticky;
    background: #23282c;
  }

  .sticky {
    top: 0;
    z-index: 2;
  }
  thead th {
    top: 0;
    z-index: 1;
  }

  .scroll-up {
    position: absolute;
    right: 15px;
    top: 4px;
    background: url(/public/images/up-arrow.svg) repeat-y 100%;
    height: 18px;
    padding-right: 20px;
    line-height: 20px;
    color: #999;
    font-size: 12px;
    cursor: pointer;
  }

  .empty-list {
    text-align: center;
    font-size: 16px;
    color: #777;
  }
  
  .loader {
    display: none;
    border: 2px solid rgba(255,255,255,0.5);
    border-radius: 50%;
    border-top: 2px solid #fff;
    width: 15px;
    height: 15px;
    float: right;
    margin-right: 28px;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
  }
  
  @-webkit-keyframes spin {
      0% { -webkit-transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); }
  }
      
  @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }

  &.mobile {
    padding: 15px;
    margin: 0;
    .scroll-up {
      display: none;
    }

    .order-list {
      padding: 0;

      .list-row {
        padding: 5px 0;
        border-bottom: 1px solid #333;
      }

      .item-assets {
        width: 30%;
      }
      .item-price {
        width:50%;
      }

      .item-type-BUY, .item-type-SELL {
        width: 20%;
        padding-right: 20px;
        background: url("../public/images/menu-arrow-down.svg") no-repeat 100% 50%;
      }

      .item-type-BUY {
        color: #2ed4cf;
      }
      .item-type-SELL {
        color: #ff3282;
      }

      .item-details {
        display: none;
        .label {
          color: #777;
          padding-right: 10px;
        }
        .item {
          margin-right: 20px;
        }
        button {
          float: right;
          border: 1px solid #aaa;
          border-radius: 2px;
          color: #aaa;
          background-color: transparent;
          padding: 0 10px;
        }
      }
      .item-details.active {
        display: block;
      }
    }
  }
`;

class Orders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTabIndex: 0,
      isFocused: false,
      cancelling: [],
      selectedRow: null
    };
  }

  goToTop() {
    window.scrollTo(0,0);
    this.setState({isFocused: false})
  }

  handleSwitch(index, selected) {
    this.setState({selectedTabIndex: index})
    if(index == selected && this.state.isFocused) {
      this.goToTop()
    } else {
      window.scrollTo(0,document.body.scrollHeight);
      this.setState({isFocused: true})
    }
  }

  notify_success = (toastId) => toast.update(toastId, {
    render: "Order cancelled",
    type: toast.TYPE.SUCCESS,
    autoClose: 5000,
    position: toast.POSITION.TOP_CENTER
  });
  notify_failed = (toastId) => toast.update(toastId, {
    render: "Unable to cancel order",
    type: toast.TYPE.ERROR,
    autoClose: 5000,
    position: toast.POSITION.TOP_CENTER
  });

  handleCancel(market, order) {
    const toastId = toast("CANCELING...", { autoClose: false, position: toast.POSITION.TOP_CENTER });
    if (!this.props.mobile) {
      var id = order.replace(/\./g, '-')
      document.querySelectorAll('#cancel-' + id + ' button')[0].style.display = 'none';
      document.querySelectorAll('#cancel-' + id + ' .loader')[0].style.display = 'block';
    }

    ReactGA.event({
      category: 'CANCEL',
      action: market
    });
    this.props.dispatch(cancelTransaction(market, order))
    .then((e) => {
      if (!this.props.mobile) {
        document.querySelectorAll('#cancel-' + id + ' .loader')[0].style.display = 'none';
      }
      
      this.notify_success(toastId)
    }).catch((e) => {
      if (!this.props.mobile) {
        document.querySelectorAll('#cancel-' + id + ' button')[0].style.display = 'inherit';
        document.querySelectorAll('#cancel-' + id + ' .loader')[0].style.display = 'none';
      }
      this.notify_failed(toastId)
    })
  }

  toggleDetails(id) {
    if (this.state.selectedRow == id) {
      return // this.setState({selectedRow: null})
    } else {
      this.setState({selectedRow: id})
    }
  }

  render() {
    // const orders_data = [
    //   ["BNCBTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","BUY","Filled","12 JAN, 12:34:15"],
    //   ["BNCBTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","0.234567 BTC","BUY","Filled","12 JAN, 12:34:15"]
    // ]
    const tabs = {
      names: ['Open Orders', 'Order History'],
      selectedTabIndex: 0,
    }
    
    const OrdersList = () => {
      if (this.state.selectedTabIndex == 0) {
        if (this.props.openOrders.dataSource.length == 0) {
          return <div className="empty-list">You have no active orders</div>
        }
        if (this.props.mobile) {
          return (
            <div>
              {this.props.openOrders.dataSource.map(row => {
                return (
                  <div key={row.id} className="list-row" onClick={() => this.toggleDetails(row.id)}>
                    <div className="d-flex list-item">
                      <span className="item-assets">{row.assets}</span>
                      <span className="item-price text-right">{row.price}</span>
                      <span className={"text-right item-type-" + row.type}>{row.type}</span>
                    </div>
                    <div className={"item-details" + (this.state.selectedRow == row.id ? " active" : "")}>
                      <span className="item"><span className="label">AMOUNT</span> {row.amount}</span>
                      <span className="item"><span className="label">TOTAL</span> {row.total}</span>
                      <button onClick={() => this.handleCancel(row.assets, row.id)}>CANCEL</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        } else {
          return (
            <QTTableViewSimple dataSource={this.props.openOrders.dataSource} columns={this.props.openOrders.columns}
            cancelOrder={this.handleCancel.bind(this)} />
          )
        }
          
      } else {
        if (this.props.filledOrders.dataSource.length == 0) {
          return <div className="empty-list">You have no recent filled orders in this market</div>
        }

        if (this.props.mobile) {
          return (
            <div>
              {this.props.filledOrders.dataSource.map(row => {
                return (
                  <div key={row.id} className="list-row" onClick={() => this.toggleDetails(row.id)}>
                    <div className="d-flex list-item">
                      <span className="item-assets">{row.assets}</span>
                      <span className="item-price text-right">{row.price}</span>
                      <span className={"text-right item-type-" + row.type}>{row.type}</span>
                    </div>
                    <div className={"item-details" + (this.state.selectedRow == row.id ? " active" : "")}>
                      <span className="item"><span className="label">AMOUNT</span> {row.amount}</span>
                      <span className="item"><span className="label">TOTAL</span> {row.total}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        } else {
          return (
            <QTTableViewSimple dataSource={this.props.filledOrders.dataSource} columns={this.props.filledOrders.columns}/>
          )
        }
      }
    }

    return (
      <div className={container + (this.props.mobile ? " mobile" : "")}>
      <div className="sticky">
          <QTTabBar
            className="button small static set-width qt-font-bold d-flex justify-content-left"
            width={120}
            gutter={10}
            tabs = {tabs}
            switchTab = {this.handleSwitch.bind(this)}
          />
        </div>
        <section className="order-list no-scroll-bar">
          <div>
            <OrdersList />
          </div>
          
				</section>
        <ToastContainer />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  	bids: state.app.tradeBook.bids,
  	asks: state.app.tradeBook.asks,
		currentPrice: state.app.currentPrice,
    openOrders:state.app.openOrders,
    filledOrders:state.app.filledOrders,
    currentTicker: state.app.currentTicker
	});

export default connect(mapStateToProps)(Orders);
