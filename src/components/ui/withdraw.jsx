import React, {PropTypes} from 'react';
import { connect } from 'react-redux'
import CONFIG from '../../config.js'
import { TransactionBuilder } from "@quantadex/bitsharesjs"
import { GetName } from '../../redux/actions/app.jsx'
import {SymbolToken} from './ticker.jsx'
import WAValidator from 'wallet-address-validator'

import { css } from 'emotion'
import globalcss from '../global-css.js'
import { toast } from 'react-toastify';
import TxDialog from './transaction_dialog.jsx'
import { transferFund } from '../../redux/actions/app.jsx'

const container = css`
  margin:0 -15px;
  background-color:white;
  color: #28303c;

  input {
    width: 100%;
    color: #777;
    padding: 0 10px;
    text-align: left;
    border: solid 1px rgba(34, 40, 44,0.27);
    border-radius: 2px;
  }

  input:read-only {
    background-color: #E1E1E1;
    color: #777;
  }
  
  button {
    width: 130px;
    background-color: ${globalcss.COLOR_THEME};
    color: #ffffff;
    text-align:center;
    border-radius: 2px;
  }

  button:disabled {
    background-color: #999;
  }

  .input-container {
    width: 100%;
    padding: 15px 30px;
    border-left: 1px solid #eee;
  }

  .toggle {
    position: absolute;
    top: 10px;
    right: 15px;
    text-decoration: underline;
    color: ${globalcss.COLOR_THEME};
    cursor: pointer;
  }

  .tooltip {
    margin-left: 5px;
    opacity:0.9!important;
  }

  img {
    vertical-align: baseline;
  }
`

const coin_details = css`
  font-size: 14px;
  color: #4F637E;

  h1 {
    font-weight: bold;
  }

  span.value {
    color: #333;
  }

  .issuer-tag {
    font-size: 15px !important;
    color: #fff !important;
    vertical-align: middle;
  }

  a img {
    vertical-align: baseline;
  }
`

class QTWithdraw extends React.Component {
  constructor(props) {
    super(props);
    const isCrosschain = CONFIG.SETTINGS.CROSSCHAIN_COINS.includes(this.props.asset) || this.props.asset.split("0X").length == 2
    this.state = {
      isCrosschain: isCrosschain,
      showTransfer: !isCrosschain,
      issuer: undefined,
      destination: "",
      amount: "",
      memo: "",
      asset: this.props.asset,
      fee: {amount: 0, asset: 'QDEX'}
    }

    this.CoinDetails = this.CoinDetails.bind(this)
    this.toggleTransfer = this.toggleTransfer.bind(this)
    this.Transfer = this.Transfer.bind(this)
    this.Withdraw = this.Withdraw.bind(this)
  }

  componentDidMount() {
    $(function(){
      $('[data-toggle="tooltip"]').tooltip();   
    });

    let fee_asset = "1.3.0"
    let tr = new TransactionBuilder();
    let transfer_op = tr.get_type_operation("transfer", {
        fee: {
            amount: 0,
            asset_id: fee_asset
        },
        from: 0,
        to: 0,
        amount: {amount: 0, asset_id: fee_asset}
    });
    tr.add_operation(transfer_op)
    tr.set_required_fees().then(() => {
      this.setState({
        fee: {amount: tr.operations[0][1].fee.amount / Math.pow(10, window.assets[tr.operations[0][1].fee.asset_id].precision), 
          asset: window.assets[tr.operations[0][1].fee.asset_id].symbol
        },
      })
    })
  }

  toggleTransfer() {
    this.setState({showTransfer: !this.state.showTransfer, destination: "", amount: "", memo: "", error: false})
  }

  validateAddress(address) {
    let coin = this.state.asset == "BTC" ? "BTC" : "ETH"
    let valid = WAValidator.validate(address, coin, 'testnet')

    if (!valid) {
      this.setState({error: true, errorMsg: "Invalid address"})
      return
    }
    if (this.state.error) {
      this.setState({error: false, errorMsg: ""})
    }
  }

  confirmTransaction() {
		if (!this.state.error) {
			this.setState({confirmDialog: true})
    }
  }

  closeTransaction() {
    this.setState({ confirmDialog: false})
  }

  submitTransfer() {
    const token = this.state.asset.split("0X")
    this.props.dispatch(transferFund(this.state))
      .then(() => {
        toast.success(`Successfully transfer ${this.state.amount} ${token[0]} ${token[1] ? ("0x" + token[1].substr(0, 4)) : ""} to ${this.state.showTransfer ? this.state.destination : this.state.issuer}.`, {
          position: toast.POSITION.TOP_CENTER
        });
      }).then(() => {
        this.setState({destination: "", amount: "", memo: ""})
      })
      .catch((e) => {
        var msg = "Please make sure the destination account name is correct."
        if (String(e).includes("insufficient_balance")) {
          msg = "Insufficient Balance."
        }

        toast.error("Unable to transfer. " + msg, {
          position: toast.POSITION.TOP_CENTER
        });
      })
      .finally(() => {
        this.closeTransaction()
      })
  }
  
  CoinDetails() {
    const coin = window.assetsBySymbol[this.props.asset]

    !this.state.issuer && GetName(coin.issuer).then(issuer => {
      this.setState({issuer: (issuer == "null-account" ? "Native": issuer)})
    })

    return (
      <div className={coin_details + " mx-auto"}>
        <h1>{this.state.showTransfer ? "TRANSFER" : "WITHDRAW"}<br/><SymbolToken name={coin.symbol} showIcon={false} /></h1>
        <div>
          Asset ID: <span className="value">{coin.id}</span> <a href={CONFIG.SETTINGS.EXPLORER_URL + "/object/" + coin.id} target="_blank"><img src="/public/images/external-link.svg" /></a><br/>
          Issuer: <span className="value">{this.state.issuer}</span><br/>
          Precision: <span className="value">{coin.precision}</span><br/>
          Max Supply: <span className="value">{(parseInt(coin.options.max_supply)/Math.pow(10, coin.precision)).toLocaleString(navigator.language)}</span>
        </div>
      </div>
    )
  }

  Transfer() {
    return (
      <div className="input-container">
        <div className="mb-3">
          <label className="my-0">DESTINATION ACCOUNT</label>
          <input type="text" spellCheck="false" value={this.state.destination} onChange={(e) => this.setState({destination: e.target.value.toLowerCase()})}/>
        </div>
        <div className="mb-3">
          <label className="my-0">AMOUNT</label>
          <input type="number" value={this.state.amount} onChange={(e) => this.setState({amount: e.target.value})}/>
        </div>
        <div className="mb-3">
          <label className="my-0">MEMO (OPTIONAL)</label>
          <input type="text" value={this.state.memo} onChange={(e) => this.setState({memo: e.target.value})}/>
        </div>

        <div className="d-flex justify-content-between mt-3">
          <div>
            <b>TRANSACTION FEE</b><br/>
            {this.state.fee.amount} {this.state.fee.asset}
          </div>
          <button className="cursor-pointer" onClick={() => this.confirmTransaction({type: "Transfer"})}
            disabled={this.state.destination.length == 0 || this.state.amount == 0}>SEND</button>
        </div>
      </div>
    )
  }

  Withdraw() {
    return (
      <div className="input-container">
        <div className="mb-3">
          <label className="my-0">DESTINATION ACCOUNT</label>
          <div className="d-inline ml-2 cursor-pointer" data-toggle="tooltip" data-placement="right" 
            title="Withdraw requires funds to go back to the QUANTA cross-chain issuer for processing.">
              <img src="/public/images/question.svg" />
          </div>
          <input type="text" readOnly value={this.state.issuer || ""}/>
        </div>
        <div className="mb-3">
          <label className="my-0">AMOUNT</label>
          <input type="number" value={this.state.amount} onChange={(e) => this.setState({amount: e.target.value})}/>
        </div>
        <div className="mb-3">
          <label className="my-0">BENEFICIARY ADDRESS</label>
          <div className="d-inline ml-2 cursor-pointer" data-toggle="tooltip" data-placement="right" 
            title="Specify the outgoing address where you want to withdraw your tokens.">
              <img src="/public/images/question.svg" />
          </div>
          {this.state.error && <span className="text-danger float-right">{this.state.errorMsg}</span>}
          <input type="text" spellCheck="false" value={this.state.memo} 
            onChange={(e) => {
              this.setState({memo: e.target.value})
              this.validateAddress(e.target.value)
            }}/>
        </div>

        <div className="d-flex justify-content-between mt-3">
          <div>
            <b>TRANSACTION FEE</b><br/>
            {this.state.fee.amount} {this.state.fee.asset}
          </div>
          <button className="cursor-pointer" onClick={() => this.confirmTransaction({type: "Withdraw"})}
            disabled={this.state.memo.length == 0 || this.state.amount == 0 || this.state.error}>SEND</button>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className={container + " d-flex"}>
        <div className="d-none d-md-flex w-75 align-items-center position-relative">
          {this.state.isCrosschain ? 
            <div className="toggle qt-font-small" onClick={this.toggleTransfer}>Switch to {this.state.showTransfer ? "Withdraw" : "Transfer"}</div> 
            : null}
          <this.CoinDetails />
        </div>
        {this.state.showTransfer ? <this.Transfer /> : <this.Withdraw />}

        {this.state.confirmDialog && 
        <TxDialog data={this.state} 
          cancel={() => this.closeTransaction()} 
          submit={() => this.submitTransfer()} />
      }
      </div>
    );
  }
}

export default connect()(QTWithdraw);