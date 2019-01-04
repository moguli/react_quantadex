import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'

const container = css`
    display: flex;
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #ffffff;
    overflow: hidden;
    z-index: 2;

    .status-info {
        width: 100%;
        padding: 5px 0px 5px 30px;
        color: #000;
        font-size: 15px;
        font-weight: bold;
        white-space: nowrap;

        a {
            margin-left: 5px;
            color: #000;
        }
    }

    .status-info.brand {
        background: #eeeeef linear-gradient(to right, #ffffff, #eeeeef);
        flex: 0 0 260px;
    }
    .label {
        font-size: 12px;
        color: #999;
        font-weight: 100;
    }

    &.mobile {
        position: relative;
        font-size: 13px;
        justify-content: space-evenly;

        .status-info {
            display: none;
            padding: 5px 0;
            width: auto;
            .label {
                margin-right: 5px;
            }
            a {
                margin: 0;
            }
        }
        .explorer, .avg-lat {
            display: inline-block;
        }
        div {
            display: inline-block;
        }
    }
`;

class Status extends Component {
    render() {
        return (
            <div id="quanta-status" className={container + (this.props.mobile ? " mobile" : "")}>
                <div className="status-info brand">
                    <span className="label">Powered by </span>
                    <div>QUANTA - Fair Trading Protocol</div>
                </div>
                <div className="status-info explorer">
                    <span className="label">QUANTA </span>
                    <div><a href="http://testnet.quantadex.com" target="_blank">Explorer <img src="/public/images/external-link.svg" /></a></div>
                </div>
                <div className="status-info">
                    <span className="label">HIGHEST BLOCK</span>
                    <div>{this.props.blockInfo.blockNumber} <a><img src="/public/images/external-link.svg" /></a></div>
                </div>
                <div className="status-info avg-lat">
                    <span className="label">{this.props.mobile ? "Avg. Block latency" : "AVERAGE BLOCK LATENCY"}</span>
                    <div>{ this.props.blockInfo.blockTime} ms</div>
                </div>
                <div className="status-info">
                    <span className="label">NUMBER OF NODES </span>
                    <div>5</div>
                </div>
                <div className="status-info">
                    <span className="label">ON-CHAIN CUSTODY </span>
                    <div>2 tokens <a><img src="/public/images/external-link.svg" /></a></div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    blockInfo: state.app.blockInfo || {}
});

export default connect(mapStateToProps)(Status);
