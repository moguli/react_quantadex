import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion'

import { Link } from 'react-router-dom'
import HamburgerMenu from './ui/hamburger_menu.jsx'
import Connect, { ConnectDialog } from './connect.jsx';

const container = css`
	height: 52px;
  width:100%;

  .back-link:before {
    background-image: url(${devicePath("public/images/menu-arrow-left.svg")});
    width:6px;
    height:10px;
    background-size: 6px 10px;
    display:inline-block;
    margin-right:5px;
    vertical-align:middle;
    content:"";
  }

  .menu {
		display:flex;

		.name {
			margin-right:10px;
		}
  }

  .logo {
    width:119px;
    height:19px;
    background-image: url(${devicePath("public/images/group-4.svg")});
    background-size:cover;
  }
`;

class Header extends Component {
  
	render() {
		return (
      <React.Fragment>
        <div className={container + " qt-font-small d-flex justify-content-between align-items-center"}>
          <Link to={"/" + this.props.network + "/exchange/" + (this.props.currentTicker ? this.props.currentTicker.replace("/", "_") : "")} className="back-link">Back to Exchange</Link>

          <Link to={"/" + this.props.network + "/exchange/" + (this.props.currentTicker ? this.props.currentTicker.replace("/", "_") : "")} className="logo"></Link>
          <div className="menu">
            <span className="name mr-3">{this.props.name}</span>
            <Connect type="lock" />
            <HamburgerMenu />
          </div>
        </div>
        { this.props.connectDialog ? 
					<ConnectDialog default={this.props.connectDialog} 
						network={this.props.network} 
						dispatch={this.props.dispatch}/> 
					: null
				}
      </React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
    private_key: state.app.private_key,
		currentTicker: state.app.currentTicker,
    currentPrice: state.app.currentPrice,
    name: state.app.name,
    network: state.app.network,
    connectDialog: state.app.ui.connectDialog
	});

export default connect(mapStateToProps)(Header);
