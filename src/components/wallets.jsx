import React, { Component } from 'react';
import CONFIG from '../config.js'
import QTTableView from './ui/tableView.jsx'
import { connect } from 'react-redux'
import { css } from 'emotion'
import globalcss from './global-css.js'
import QTDeposit from './ui/deposit.jsx'
import QTWithdraw from './ui/withdraw.jsx'
import SearchBox from "./ui/searchBox.jsx"
import Loader from "./ui/loader.jsx"
import Switch from "./ui/switch.jsx"
import { updateUserData, TOGGLE_CONNECT_DIALOG } from '../redux/actions/app.jsx'
import SendWyre from './sendwyre.jsx'
import { getItem } from "../common/storage.js";
import ReactGA from 'react-ga';

const container = css`
  padding-bottom: 30vh !important;

  .public-address-container {
    background-color: #2a3135;
    border-radius: 2px;
    padding: 25px 30px;
    #public-address {
      font-size: 16px;
      color: #bbb;
    }
    a {
      vertical-align: baseline;
      margin-left: 10px;
    }
  }
  .sendwyre {
    position: relative;
    button {
      background: transparent;
      color: ${globalcss.COLOR_THEME};
      border: 1px solid ${globalcss.COLOR_THEME};
      border-radius: 2px;
      padding: 5px 10px;
    }

    span {
      position: absolute;    
      right: 0;
      bottom: -20px;
    }
  }
  
  &.mobile {
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
    }

    .filter-container input {
      flex: auto;
    }

    [data-key="on_orders"], span.on_orders, [data-key="usd_value"], span.usd_value {
      display: none;
    }

    span.usd_value {
      background: url(${devicePath("public/images/menu-arrow-down.svg")}) no-repeat 100% 50%;
    }

    .action-btn {
      display: flex !important;
    }
  }
`;

class Wallets extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      unlisted: [],
      filter: "",
      hideZero: false,
      confirmDialog: false,
      show_sendwyre: false,
    }

    this.PublicAddress = this.PublicAddress.bind(this)
    this.SendWyre = this.SendWyre.bind(this)
  }

  async componentDidMount() {
    const { balance, dispatch } = this.props
    dispatch(updateUserData())
    this.setDataSource(balance)
    this.DEVICE_TOKEN = await getItem("DEVICE_TOKEN")
  }

	componentWillReceiveProps(nextProps) {
    if (this.props.name !== nextProps.name) {
      this.componentDidMount(nextProps.name)
    }
    if (this.props.balance != nextProps.balance) {
      this.setDataSource(nextProps.balance)
    }
  }

  setDataSource(balance) {
    if (!window.assets || !window.wallet_listing) return
    const { onOrdersFund } = this.props

    const dataSource = []
    const in_wallet = []
    const unlisted = []

    Object.keys(balance).forEach(symbol => {
      let currency = balance[symbol]
      const data = {
        pairs: symbol,
        balance: currency.balance,
        on_orders: onOrdersFund[currency.asset] || 0,
        usd_value: currency.usd > 0 ? currency.usd.toLocaleString(navigator.language, {maximumFractionDigits: 2, minimumFractionDigits: 2}) : "N/A"
      }
      if (window.wallet_listing.includes(symbol) || symbol == "QDEX") {
        dataSource.push(data)
      } else {
        unlisted.push(data)
      }
      in_wallet.push(symbol)
    });

    for (let coin of (Object.keys(window.assetsBySymbol) || [])) {
      if (in_wallet.indexOf(coin) === -1) {
        let data = {
          pairs: coin,
          balance: 0,
          on_orders: 0,
          usd_value: "N/A"
        }
        if (window.wallet_listing.includes(coin)) {
          dataSource.push(data)
        } else {
          unlisted.push(data)
        }
      }
    }

    dataSource.push({
      pairs: "Deposit New ERC20",
      balance: 0,
      on_orders: 0,
      usd_value: 0
    })

    this.setState({dataSource, unlisted})
  }
  
  handleChange(e) {
		this.setState({filter: e.target.value})
  }
  
  hideZeroBalance() {
    this.setState({hideZero: !this.state.hideZero})
  }

  PublicAddress() {
    return (
      <div className="public-address-container d-flex justify-content-between">
        <div id='public-address'>
          <h3>Your QUANTA Wallet Account</h3>
          <span className="qt-font-light">{this.props.name}</span>
          <a href={CONFIG.getEnv().EXPLORER_URL + "/account/" + this.props.name} target="_blank"><img src={devicePath("public/images/external-link-light.svg")} /></a>
        </div>
        <div className="est-fund text-right align-self-center">
          <span className="qt-font-extra-small qt-white-62">On-chain custody estimated funds</span>
          <div><span className="qt-font-huge">${this.props.estimated_fund.toLocaleString(navigator.language, {maximumFractionDigits: 4})} </span><span className="currency">USD</span></div>
        </div>
        
      </div>
    )
  }

  SendWyre() {
    const { dispatch, private_key } = this.props
    return (
      <div className="d-flex ml-auto my-2 sendwyre">
        <img className="mr-3" src={devicePath("public/images/bank.svg")} alt="ACH" />
        <img className="mr-3" src={devicePath("public/images/visa-logo.svg")} alt="Visa" />
        <img className="mr-3" src={devicePath("public/images/mastercard-logo.svg")} alt="Mastercard" />
        <button onClick={() => {
          if (this.DEVICE_TOKEN || private_key) {
            ReactGA.event({
              category: 'WALLET',
              action: "SendWyre",
            });
            this.setState({show_sendwyre: true})
          } else {
            dispatch({
              type: TOGGLE_CONNECT_DIALOG,
              data: "connect"
            })
          }
        }}>
          Buy with Cash
        </button>
        <span className="small text-muted">
          <img 
            className="mr-2 align-bottom"
            data-tip="Copy & paste your BTC deposit address to Changelly, and buy with your credit card" 
            src={devicePath("public/images/question.png")} 
          /> 
          Powered by Wyre
        </span>
      </div>
    )
  }

  shortName(coin) {
    const pair = coin.split('0X')
		return pair[0] + (pair[1] ? "0X" + pair[1].substr(0,4) : "")
	}

  render() {
    const { network, private_key, publicKey, name, isMobile, mobile_nav, dispatch } = this.props
    const { dataSource, hideZero, filter, unlisted, show_sendwyre } = this.state
    const columns = [{
        title: "PAIRS",
        key: "pairs",
        type: "symbol",
        width: isMobile ? "60" : "80"
    }, {
        title: "TOTAL BALANCE",
        key: "balance",
        type: "number",
        width: isMobile ? "100" : "125"
    }, {
        title: "ON ORDERS",
        key: "on_orders",
        type: "number",
        width:"90"
    }, {
        title: "USD VALUE",
        key: "usd_value",
        type: "number",
        width:"90"
    }, {
        buttons: [{
          label: "WITHDRAW",
          color:"theme unite",
          handleClick: (asset, close) => {
						return <QTWithdraw asset={asset} handleClick={close} />
          }
        }, {
          label: "DEPOSIT",
          color:"theme unite",
          handleClick: (asset, close) => {
            ReactGA.event({
              category: 'DEPOSIT_EXPAND',
              action: asset
            });
            return <QTDeposit asset={asset} handleClick={close} quantaAddress={name} 
            isETH={(["ETH", "ERC20"].includes(asset) || asset.split("0X").length == 2)} />
          }
        }, {
          label: "TRADE",
          color:"theme unite"
        }],
        type: "buttons"
    }]
    
    return (
      <div className={container + " content" + (isMobile ? " mobile" : "")}>
        { publicKey ? <this.PublicAddress /> : null }
          
          
          <div className='filter-container d-flex flex-wrap mt-5 align-items-center'>
          <SearchBox placeholder="Search Coin" onChange={this.handleChange.bind(this)} style={{marginRight: "20px"}}/>
          <Switch label="Hide Zero Balances" active={hideZero} onToggle={this.hideZeroBalance.bind(this)} />
          <this.SendWyre />
          </div>

          {dataSource.length == 0 ?
            <Loader size={50} />
            :
            <div className="table-row">
              <QTTableView dataSource={dataSource.filter(data => this.shortName(data.pairs).toLowerCase().includes(filter.toLowerCase()) && 
                  (!hideZero || data.balance > 0))} 
                  network={network}
                  dispatch={dispatch}
                  mobile_nav={mobile_nav}
                  columns={columns} mobile={isMobile} 
                  unlocked={private_key && true}/>
            </div>
          }

          {unlisted.length > 0 ?
            <div className="table-row">
              <h5>Unofficial Coins</h5>
              <QTTableView dataSource={unlisted.filter(data => this.shortName(data.pairs).toLowerCase().includes(filter.toLowerCase()) && 
                  (!hideZero || data.balance > 0))} 
                  network={network}
                  dispatch={dispatch}
                  mobile_nav={mobile_nav}
                  columns={columns} mobile={isMobile} 
                  unlocked={private_key && true}/>
            </div>
            : null
          }

          { show_sendwyre ?
            <SendWyre close={() => this.setState({show_sendwyre: false})} user={name} private_key={private_key} />
            : null
          }
      </div>
    );
	}
}

const mapStateToProps = (state) => ({
    isMobile: state.app.isMobile,
    balance: state.app.balance || {},
    onOrdersFund: state.app.onOrdersFund || [],
    publicKey: state.app.publicKey || "",
    private_key: state.app.private_key,
    estimated_fund: state.app.totalFundValue || 0,
    usd_value: state.app.usd_value,
    name: state.app.name,
    network: state.app.network,
	});


export default connect(mapStateToProps)(Wallets);
