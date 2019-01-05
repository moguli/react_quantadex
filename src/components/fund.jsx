import React, { Component } from 'react';
import Header from './headersimple.jsx';
import QTTableView from './ui/tableView.jsx'
import { connect } from 'react-redux'
import { css } from 'emotion'
import globalcss from './global-css.js'
import { Link } from 'react-router-dom'
import QTDeposit from './ui/deposit.jsx'
import QTWithdraw from './ui/withdraw.jsx'
import SearchBox from "./ui/searchBox.jsx"
import Switch from "./ui/switch.jsx"
import MobileHeader from './ui/mobileHeader.jsx';

const container = css`
	background-color:${globalcss.COLOR_BACKGROUND};
  min-height: 100vh;

  .header-row {
    padding:0 20px;
  }

  .tab-row {
    background-color: rgba(52, 62, 68, 0.4);
    height:72px;
    border-top: 1px solid rgba(255,255,255,0.09);
    border-bottom: 1px solid rgba(255,255,255,0.09);

		.tabs {
			font-size: 16px;
			margin-top:auto;

			a {
		    padding:10px 30px;
		    display:inline-block;
		  }

			a.active {
		    border-bottom: solid 1px #fff;
		  }

			a:last-child {
				margin-right:0
			}
		}
  }

  .content {
    margin: auto;
    max-width: 1000px;
  }

  .table-row {
    margin-top: 40px;
  }

  .deposit-only .unite {
    background-color: #1cdad8 !important;
    color: #000 !important;
  }

  .public-address-container {
    margin-top: 40px;
    background-color: #2a3135;
    border-radius: 2px;
    padding: 25px 30px;
    #public-address {
      font-size: 16px;
      color: #bbb;
    }
    a {
      vertical-align: text-bottom;
      margin-left: 10px;
    }
  }
  .erc20 .row{
    height: 30px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .erc20 button {
    background-color: #1cdad8;
    border-color: #1cdad8;
    color: #000;
    width: 80px;
    height: 20px;
    border-radius: 2px;
  }
  .erc20 button:disabled {
    background-color: #555;
    border-color: #555;
    color: #222 !important;
    cursor: not-allowed;
  }

  &.mobile {
    padding: 0;

    .tab-row {
      display: none !important;
    }
    .public-address-container {
      margin: 0;
      padding: 10px 0;
      flex-direction: column;
      background-color: transparent;
      border-bottom: 1px solid #333;
      text-align: center;
      
      h3 {
        font-size: 13px;
      }

      #public-address {
        word-wrap: break-word;
        padding: 0 15px;
        line-height: 20px;
      }

      .est-fund {
        margin-top: 10px;
        padding-top: 10px;
        width: 100%;
        border-top: 1px solid #333;
        text-align: center !important;
      }
    }

    .filter-container, .table-row {
      padding: 0 15px;
      margin-top: 20px !important;
    }

    .filter-container input {
      flex: auto;
    }

    [data-key="on_orders"], span.on_orders {
      display: none;
    }

    [data-key="usd_value"], span.usd_value {
      text-align: right;
      padding-right: 20px;
    }

    span.usd_value {
      background: url("../public/images/menu-arrow-down.svg") no-repeat 100% 50%;
    }

    .table-row .row {
      height: auto;
      padding: 5px 0;
    }

    .action-btn {
      display: none !important;
      margin-top: 5px;
    }

    .active .action-btn {
      display: flex !important;
    }
  }
`;

const screenWidth = screen.width

class Fund extends Component {

  constructor(props) {
    super(props)
		var selectedTabIndex
		switch (this.props.page) {
			case "wallets":
				selectedTabIndex = 0
				break
			case "history":
				selectedTabIndex = 1
				break
			case "orders":
				selectedTabIndex = 2
				break
			default:
				selectedTabIndex = 0
				break
		}
    this.state = {
      selectedTabIndex: selectedTabIndex,
      page: this.props.page,
      filter: "",
      hideZero: false,
      isMobile: screenWidth <= 992
    }

  }

	componentWillReceiveProps(nextProps) {
		var selectedTabIndex
		switch (nextProps.page) {
			case "wallets":
				selectedTabIndex = 0
				break
			case "history":
				selectedTabIndex = 1
				break
			case "orders":
				selectedTabIndex = 2
				break
			default:
				selectedTabIndex = 0
				break
		}
		this.setState({
			page:nextProps.page,
			selectedTabIndex:selectedTabIndex,
		})
  }
  
  handleChange(e) {
		this.setState({filter: e.target.value})
  }
  
  hideZeroBalance(hide) {
    this.setState({hideZero: hide})
  }

	render() {
    if (this.props.private_key == null) {
			window.location.assign('/login')
    } 
    const tabs = [
      {
        name:'Wallets / Deposit / Withdraw',
        url:'wallets'
      },
      // {
      //   name:'Fund History',
      //   url:'history'
      // },
      // {
      //   name:'Orders',
      //   url:'orders'
      // }
    ]
    
    const dataSourceWallets = []
    this.props.balance.forEach(currency => {
      const data = {
        pairs: window.assets[currency.asset].symbol,
        balance: currency.balance,
        on_orders: "0.00000000",
        usd_value: currency.usd.toFixed(2)
      }
      dataSourceWallets.push(data)
    });

    const columnsWallets = [{
        title: "PAIRS",
        key: "pairs",
        type: "string",
        width:"80"
    }, {
        title: "TOTAL BALANCE",
        key: "balance",
        type: "number",
        width:"125"
    }, {
        title: "ON ORDERS",
        key: "on_orders",
        type: "number",
        width:"90"
    }, {
        title: "USD VALUE",
        key: "usd_value",
        type: "string",
        width:"90"
    }, {
        buttons: [{
          label:"WITHDRAW",
          color:"theme unite",
          handleClick: () => {
						return <QTWithdraw />
          }
        }, {
          label:"DEPOSIT",
          color:"theme unite",
          handleClick: () => {
						return <QTDeposit />
					}
        }],
        type: "buttons"
    }]

    const dataSourceHistory = [
      {
        coin: "BTC",
        name: "Amber",
        type: "Deposit",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Complete"
      },
      {
        coin: "BTC",
        name: "Amber",
        type: "Deposit",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Complete"
      },
      {
        coin: "BTC",
        name: "Amber",
        type: "Deposit",
        amount: "0.0019800",
        datetime: "Feb 13, 2018 / 21:00",
        status: "Pending"
      }
    ]

    const columnsHistory = [
      {
          title: "COIN",
          key: "coin",
          type: "string",
          width:"80"
      },
      {
          title: "NAME",
          key: "name",
          type: "string",
          width:"150"
      },
      {
          title: "TYPE",
          key: "type",
          type: "coloredString",
          colors: {
            Withdraw:globalcss.COLOR_RED,
            Deposit:globalcss.COLOR_THEME
          },
          width:"66"
      },
      {
          title: "AMOUNT",
          key: "amount",
          type: "number",
          width:"84"
      },
      {
          title: "DATE/TIME",
          key: "datetime",
          type: "string",
          width:"135"
      },
      {
          title: "STATUS",
          key: "status",
          type: "coloredString",
          colors: {
            Complete: "white",
            Pending: globalcss.COLOR_WHITE_27
          },
          width:"66"
      },
    ]

    const dataSourceOrders = [
      {
        pair: "BNCBTC",
        stoploss: "0.234567 BTC",
        limit: "0.234567 BTC",
        amount: "0.234567 BTC",
        total: "0.234567 BTC",
        type:"BUY",
        status:"Waiting",
        datetime:"12 Jan, 12:34:15"
      },
      {
        pair: "BNCBTC",
        stoploss: "0.234567 BTC",
        limit: "0.234567 BTC",
        amount: "0.234567 BTC",
        total: "0.234567 BTC",
        type:"SELL",
        status:"Filled",
        datetime:"12 Jan, 12:34:15"
      },
      {
        pair: "BNCBTC",
        stoploss: "0.234567 BTC",
        limit: "0.234567 BTC",
        amount: "0.234567 BTC",
        total: "0.234567 BTC",
        type:"BUY",
        status:"Filled",
        datetime:"12 Jan, 12:34:15"
      }
    ]

    const columnsOrders = [
      {
          title: "PAIR",
          key: "pair",
          type: "string",
          width:"64"
      },
      {
          title: "STOP LOSS",
          key: "stoploss",
          type: "string",
          width:"82"
      },
      {
          title: "LIMIT",
          key: "limit",
          type: "string",
          width:"82"
      },
      {
          title: "AMOUNT BTC",
          key: "amount",
          type: "string",
          width:"82"
      },
      {
          title: "TOTAL BTC",
          key: "total",
          type: "string",
          width:"82"
      },
      {
          title: "TYPE",
          key: "type",
          type: "coloredString",
          colors: {
            BUY:globalcss.COLOR_THEME,
            SELL:globalcss.COLOR_RED
          },
          width:"50"
      },
      {
          title: "STATUS",
          key: "status",
          type: "string",
          width:"52"
      },
      {
          title: "DATE",
          key: "datetime",
          type: "string",
          width:"96"
      },
      {
        buttons: [{
          label:"CANCEL",
          color:"grey inverse",
          handleClick: () => {

          }
        }],
        type: "buttons"
      }
    ]

    var dataSource,columns

    switch (this.state.page) {
      case "wallets":
        dataSource = dataSourceWallets
        columns = columnsWallets
        break
      case "history":
        dataSource = dataSourceHistory
        columns = columnsHistory
        break
      case "orders":
        dataSource = dataSourceOrders
        columns = columnsOrders
        break;
    }

    const PublicAddress = () => {
      return (
        <div className="public-address-container d-flex justify-content-between">
          <div id='public-address'>
            <h3>Your QUANTA Wallet Public Address</h3>
            <span className="qt-font-light">{this.props.publicKey}</span>
            <a><img src="/public/images/external-link-light.svg" /></a>
          </div>
          <div className="est-fund text-right align-self-center">
            <span className="qt-font-extra-small qt-white-62">On-chain custody estimated funds</span>
            <div><span className="qt-font-huge">${this.props.estimated_fund.toFixed(4)} </span><span className="currency">USD</span></div>
          </div>
          
        </div>
      )
    }

    const ERC20 = () => {
      return (
        <div className="container-fluid erc20">
          <div className="row justify-content-between align-items-center table-body-row">
            <div className="qt-font-extra-small">Deposit ERC20</div>
            <button className="qt-font-base qt-font-semibold" disabled>DEPOSIT</button>
          </div>
        </div>
      )
    }
    
		return (
		<div className={container + " container-fluid" + (this.state.isMobile ? " mobile" : "")}>
      {this.state.isMobile ? 
          <MobileHeader />
        :
        <div className="row header-row">
          <Header />
        </div>
      }
      
      <div className="row tab-row d-flex flex-column align-items-center">
        <div className="tabs">
          {
            tabs.map((tab,index) => {
              return (
                <Link to={"/exchange/" + tab.url}
                      data-index={index}
                      data-url={tab.url}
                      className={this.state.selectedTabIndex == index ? "active" : ""}
                      onClick={(e) =>{this.setState({selectedTabIndex:e.target.dataset.index,page:e.target.dataset.url})}}>
                 {tab.name}</Link>
              )
            })
          }
        </div>
      </div>
      <div className="content">
        { this.state.page == 'wallets' ? <PublicAddress /> : null }
        
        <div class='filter-container d-flex mt-5 align-items-center'>
          <SearchBox placeholder="Search Coin" onChange={this.handleChange.bind(this)} style={{marginRight: "20px"}}/>
          <Switch label="Hide Zero Balances" onToggle={this.hideZeroBalance.bind(this)} />
        </div>
        

        <div className="table-row">
          <QTTableView dataSource={dataSource.filter(data => data.pairs.toLowerCase().includes(this.state.filter) && 
            (!this.state.hideZero || data.balance > 0))} columns={columns} mobile={this.state.isMobile}/>
          {
            this.state.page == 'wallets' ? <ERC20 /> : null
          }
        </div>
      </div>
      
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
		leftOpen: state.app.ui.leftOpen,
    rightOpen: state.app.ui.rightOpen,
    balance: state.app.balance,
    publicKey: state.app.publicKey || "",
    private_key: state.app.private_key,
    estimated_fund: state.app.totalFundValue,
    usd_value: state.app.usd_value
	});


export default connect(mapStateToProps)(Fund);
