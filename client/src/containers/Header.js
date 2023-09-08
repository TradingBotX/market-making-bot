import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../actions/index";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPowerOff,
  faDesktop,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import RouteButton from "../hooks/RouteButton";

const initialAuth = localStorage.getItem("corp-auth-status");

const AppName = process.env.REACT_APP_NAME || "CrypBot";

class Header extends Component {
  constructor(props) {
    super(props);

    this.renderAccount = this.renderAccount.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
  }

  componentWillMount() {
    this.props.fetchUserStatus();
  }

  componentDidUpdate() {
    if (this.props.auth.isLoggedIn === true) this.props.connectSocket();
  }

  renderLogin() {
    return (
      <div className="navbar__links">
        <Nav>
          <RouteButton
            className="u-back-light"
            to={"/login"}
            value={<Nav.Link>Log In</Nav.Link>}
          />
          {/* <RouteButton
            className="u-back-light"
            to={"/signup"}
            value={<Nav.Link>Sign Up</Nav.Link>}
          /> */}
        </Nav>
      </div>
    );
  }

  renderAccount() {
    return (
      <div className="navbar__dropdown">
        <Nav>
          <NavDropdown
            title={
              <span>
                <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
                &nbsp;&nbsp;Account&nbsp;&nbsp;
              </span>
            }
            alignRight
            id="basic-nav-dropdown"
          >
            <RouteButton
              to={"/"}
              value={
                <NavDropdown.Item>
                  <>
                    <FontAwesomeIcon icon={faDesktop}></FontAwesomeIcon>
                    &nbsp;&nbsp;Dashboard
                  </>
                </NavDropdown.Item>
              }
            />

            <NavDropdown.Item onClick={this.props.logout}>
              <>
                <FontAwesomeIcon icon={faPowerOff}></FontAwesomeIcon>
                &nbsp;&nbsp;Logout
              </>
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </div>
    );
  }

  render() {
    const vert_align = {
      display: "flex",
      flexDirection: "column",
    };

    return (
      <div style={vert_align} fixed="top">
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
          <RouteButton
            className="navbar__brand"
            to={"/"}
            value={
              <>
                <Navbar.Brand style={{ paddingLeft: "15px" }}>
                  <FontAwesomeIcon icon={faRobot}></FontAwesomeIcon>
                  &nbsp;&nbsp;{AppName}
                </Navbar.Brand>
              </>
            }
          />

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse
            id="responsive-navbar-nav"
            className="justify-content-end"
          >
            {this.props.auth
              ? this.props.auth.isLoggedIn === true
                ? this.renderAccount()
                : this.renderLogin()
              : initialAuth == "true"
              ? this.renderAccount()
              : this.renderLogin()}
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch(actions.logout()),
    fetchUserStatus: () => dispatch(actions.fetchUserStatus()),
    connectSocket: () => dispatch(actions.ConnectSocket()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
