import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { LOGIN, switchTicker } from '../redux/actions/app.jsx'
import { PrivateKey } from "@quantadex/bitsharesjs";
import QTTabBar from './ui/tabBar.jsx'

const container = css`
    text-align: center;
    margin: auto;
    padding: 20px;
    font-size: 12px;

    button {
        color: #fff;
        background-color: transparent;
        border: 2px solid #66d7d7;
        padding: 10px 30px;
        border-radius: 20px;
        margin: 10px;
        cursor: pointer;
    }

    .connect-link {
        display: inline;
        color: #fff;
        text-decoration: underline;
        cursor: pointer;
    }

    &.link {
        color: #66d7d7;
        white-space: nowrap;
        padding-right: 20px;
        margin-right: 20px;
        background: url('/public/images/right-arrow.svg') no-repeat 100% 52%;
    }
    &.link.mobile {
        background: none;
    }

    &.mobile  {
        padding: 0;
        margin: 0;
    }

`

const dialog = css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0,0,0,0.6);
    font-size: 13px;
    z-index: 999;

    .link {
        color: #66d7d7;
        cursor: pointer;
    }

    .info {
        font-size: 12px;
        line-height: 12px;
    }

    .container {
        position: relative;
        width: auto;
        max-width: 750px;
        background-color: #4f637e;
        border-radius: 5px;
        padding: 20px;
        align-self: center;

        .close-btn {
            position: absolute;
            right: 20px;
            cursor: pointer;

            img {
                height: 20px;
            }
        }

        .input-container {
            position: relative;
            background-color: #fff;
            padding: 20px;
            margin: 20px 0;
            color: #999;
            font-size: 15px;

            input {
                color: #333;
                border: 1px solid #999;
                text-align: left;
                padding: 20px;
                width: 100%;
                border-radius: 4px;
            }

            .error {
                position: absolute;
                right: 20px;
                color: #f0185c;
                font-size: 11px;
            }

            button {
                background-color: #66d7d7;
                padding: 10px 20px;
                color: #fff;
                border-radius: 4px;
                white-space: nowrap;
                cursor: pointer;
            }
        }
    }

    #key-create, #key-connect {
        display: none;
    }

    .warning {
        background-color: rgba(255, 50, 130, 0.03);
        border: 2px solid #f0185c;
        padding: 15px;
        border-radius: 5px;
        color: #333;
        font-size: 14px;

        h5{
            color: #f0185c;
        }

        ul {
            padding: 2px 18px;
            margin: 0;
            list-style: none;
            li::before {content: "•"; color: #aaa;
                display: inline-block; width: 1em;
                margin-left: -1em}
        }
    }

    .agreements {
        margin-left: 20px;
        font-size: 13px;
        color: #333;
        div {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        input {
            width: auto !important;
            height: auto;
            margin-right: 10px;
        }
        label {
            margin: 0;
        }
    }

    .drop-zone {
        height: 70px;
        color: #333;
        font-size: 14px;
        padding-left: 70px;
        border: 1px dashed #979797;
        background: rgba(80, 227, 194, 0.5) url("/public/images/drag_drop.png") no-repeat 10px;
    }

    &.mobile {
        .container {
            width: 100% !important;

            .input-container {
                button {
                    margin: 0;
                    width: 100%;
                }
            }
        }
    }
`

function goTo(type) {
    let connect = document.getElementById("key-connect")
    let create = document.getElementById("key-create")

    if (type === "connect") {
        create.style.display = "none"
        connect.style.display = "block"
        document.getElementById("pkey-input").focus()
    } else {
        connect.style.display = "none"
        create.style.display = "block"
        document.getElementById("name-input").focus()
    }
    
}

function toggleDialog(type) {
    const dialog = document.getElementById("connect-dialog")
    let connect = document.getElementById("key-connect")
    let create = document.getElementById("key-create")

    if (dialog.style.display == "none") {
        dialog.style.display = "flex"
        goTo(type)
    } else {
        connect.style.display= "none"
        create.style.display= "none"
        dialog.style.display = "none"
    }
    
}

class ConnectLink extends Component {
    render() {
        return (
            <div className={container + " link cursor-pointer" + (this.props.isMobile ? " mobile" : "")} onClick={() => toggleDialog("connect")}>CONNECT WALLET</div>
        )
    }
    
} 

class Connect extends Component {
    render() {
        return (
            <div className={container}>
                <p>Connect your <span className="qt-font-bold">Quanta</span> wallet to start trading in this market.</p>
                <button onClick={() => toggleDialog("create")}>GET STARTED</button>
                <div>
                    or<br/>
                    <div className="connect-link" onClick={() => toggleDialog("connect")}>Connect Wallet</div>
                </div>
            </div>
        )
    }
}

class ConnectDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            private_key: "",
            has_input: false,
            authError: false,
            regStep: 1,
            downloaded: false,
        };
    }

    handleChange(e) {
		this.setState({private_key: e.target.value, has_input: e.target.value.length > 0})
	}
    
    ConnectWallet() {
        try {
			const pKey = PrivateKey.fromWif(this.state.private_key);
			this.props.dispatch({
                type: LOGIN,
                private_key: this.state.private_key
            });
            this.props.dispatch(switchTicker(this.props.currentTicker))
		} catch(e) {
			console.log(e)
			this.setState({authError: true})
		}
    }

    Register() {
        this.setState({regStep:2})
    }

    DownloadKey() {
        this.setState({downloaded: true})
    }

    render() {
        const tabs = {
            names: ["Encrypted Key", "Private Key"],
            selectedTabIndex: 0,
        }

        const ConnectEncrypted = () => {
            return (
                <div className="input-container">
                    <div className="drop-zone d-flex align-items-center">
                        Drop your backup file in this area or browse your files.
                    </div>
                    <div className="link qt-font-small text-right mb-4">I don’t have a .bin-file</div>

                    <label>PASSWORD</label><br/>
                    <input id="pw-input" type="password" placeholder="Input Text"/><br/>
                    <span className="error" hidden={!this.state.authError}>Incorrect Password</span><br/>
                    <div className="text-center">
                        <button onClick={this.ConnectWallet.bind(this)}>Connect Wallet</button>
                    </div>
                </div>
            )
        }

        const ConnectPrivateKey = () => {
            return (
                <div className="input-container">
                    <label>Private Key</label><br/>
                    <input id="pkey-input" type="text" autoComplete="off" placeholder="Input Text"
                    spellCheck="false" onChange={(e) => this.handleChange(e)}/><br/>
                    <span className="error" hidden={!this.state.authError}>Invalid Key</span><br/>
                    <div className="text-center">
                        <button onClick={this.ConnectWallet.bind(this)}>Connect Wallet</button>
                    </div>
                </div>
            )
        }
        
        const KeyConnect = () => {
            return (
                <div id="key-connect">
                    <div className="d-flex justify-content-between">
                        <h4>CONNECT WALLET</h4>
                        <div className="link mr-5" onClick={() => goTo("create")}>Don’t have an account?</div>
                    </div>
                    <QTTabBar
                        className="underline small static set-width qt-font-bold d-flex justify-content-left"
                        width={120}
                        gutter={10}
                        tabs = {tabs}
                    />

                    <ConnectEncrypted />
                </div>
            )
        }

        const KeyCreate = () => {
            return (
                <div id="key-create">
                    <div className="d-flex justify-content-between">
                        <h4>CREATE WALLET</h4>
                        <div className="link mr-5" onClick={() => goTo("connect")}>Already have a key?</div>
                    </div>
                    <div className="input-container">
                        <p className="info">
                            The QUANTA blockchain is Graphene-based Architecture which uses 
                            an account system based on username, and public-private key signature. 
                            This wallet creation will generate you a random public-private key, 
                            and register your account with the blockchain, then encrypt your private 
                            key with a password into a private “bin” key to download to your computer. 
                            Beware, if you lose the password, you will lose your funds forever.
                        </p>

                        <label>USERNAME</label><br/>
                        <input id="name-input" type="text" autoComplete="off" placeholder="Input Text"
                        spellCheck="false" onChange={(e) => this.handleChange(e)}/><br/>
                        <span className="error" hidden={!this.state.authError}>Invalid Key</span><br/>

                        <label>PASSWORD</label><br/>
                        <input id="pw-input" type="password" placeholder="Input Text"
                        spellCheck="false" onChange={(e) => this.handleChange(e)}/><br/><br/>

                        <label>CONFIRM PASSWORD</label><br/>
                        <input id="pwconf-input" type="password" placeholder="Input Text"
                        spellCheck="false" onChange={(e) => this.handleChange(e)}/><br/>
                        <span className="error" hidden={!this.state.pwError}>Need to be the same as password</span><br/>

                        <div className="text-center">
                            <button onClick={this.Register.bind(this)}>REGISTER ACCOUNT</button>
                        </div>
                    </div>
                </div>
            )
        }

        const KeyDownload = () => {
            return (
                <div id="key-create" style={{display: "block"}}>
                    <div className="d-flex justify-content-between">
                        <h4>CREATE WALLET</h4>
                        <div className="link mr-5" onClick={() => goTo("connect")}>Already have a key?</div>
                    </div>
                    <div className="input-container">
                        <h5>ACCOUNT REGISTERED</h5>
                        <div className="warning qt-font-light">
                            <h5>IMPORTANT INFORMATION</h5>
                            <ul>
                                <li>Store this wallet securely. QUANTA does not have your keys.</li>
                                <li>If you lose it you will lose your tokens.</li>
                                <li>Do not share it! Your funds will be stolen if you use this file on a malicious/phishing site.</li>
                                <li>Make a backup! Secure it like the millions of dollars it may one day be worth.</li>
                                <li>This is not a ERC-20.</li>
                            </ul>
                        </div>

                        <div className="agreements my-5">
                            <div>
                                <input type="checkbox" id="pw" name="pw" />
                                <label for="pw">I have remembered or otherwise stored my password.</label>
                            </div>
                            <div>
                                <input type="checkbox" id="rc" name="rc" />
                                <label for="rc">I understand that no one can recover my password or file 
                                    if I lose or forget it. Thus if I lose access to my account, I will lose 
                                    access to my funds without a recovery opportunity.</label>
                            </div>
                            <div>
                                <input type="checkbox" id="ts" name="ts" />
                                <label for="ts">I agree with Terms of Service and Privacy Policy.</label>
                            </div>
                        </div>

                        <div className="text-center">
                            <button className="mb-2" onClick={this.DownloadKey}>DOWNLOAD FILE</button>
                            <div className="link qt-font-small" onClick={() => goTo("connect")}>
                                <u>Proceed to Connect your Wallet</u>
                            </div>
                        </div>

                    </div>
                </div>
            )
        }

        return (
            <div id="connect-dialog" className={dialog + (this.props.isMobile ? " mobile" : "")} style={{display: "none"}}>
                <div className="container">
                    <div className="close-btn" onClick={toggleDialog}><img src="/public/images/close_btn.svg" /></div>
                    {this.state.regStep == 1 ? <KeyCreate /> : <KeyDownload />}
                    <KeyConnect />
                    <p>Your private keys are not sent to QUANTA. All transactions are signed within your browser <br/>
                        and keys are not exposed over the internet.</p>
                </div>
            </div>
        )
    }
    
} 

const mapStateToProps = (state) => ({
    currentTicker: state.app.currentTicker
});
export default connect(mapStateToProps)(ConnectDialog)
export { Connect, ConnectLink }
