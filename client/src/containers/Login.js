import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { AddNoti } from "../helpers/Notification";
import RequireLogin from "../middleware/RequireLogin";
import { GetParamValue } from "../helpers/constant";
import RequireLogout from "../middleware/RequireLogout";

import * as actions from "../actions/index";

const initialState = {
  email: "",
  password: "",
  redirect: false,
  redirectTo: "/",
  error: null,
  success: null,
};

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.companyLogoInput = React.createRef();

    this.handleLogInPost = this.handleLogInPost.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
  }

  setRedirect = () => {
    this.setState({
      redirect: true,
    });
  };

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirectTo} />;
    }
  };

  handleLogInPost() {
    this.props.login({
      email: this.state.email,
      password: this.state.password,
    });
  }

  componentWillReceiveProps(nextProps) {
    let { success, error, v } = nextProps.auth;

    // console.log(":login :auth", v, this.props.auth.v, error);

    if (success && v !== this.props.auth.v) {
      AddNoti("Welcome", { type: "success" });
    }

    if (error && v !== this.props.auth.v) {
      AddNoti(error, { type: "error" });
    }
  }

  render() {
    let { loading, isLoggedIn } = this.props.auth;
    let btnMsg = "Submit";

    if (loading) {
      btnMsg = "loading";
    }

    if (isLoggedIn) {
      this.setState({ redirect: true, redirectTo: "/liquidity" });
    }

    return (
      <div>
        {/* <RequireLogout /> */}
        {this.renderRedirect()}
        <div className="sign-up main-panel">
          <Container>
            <Row>
              <Col></Col>
              <Col xs="12" sm="12" md="8" lg="6" xl="6">
                <div className="center-form">
                  <div className="center-form__title">Log In</div>
                  <hr />
                  <div className="center-form__content">
                    <Form>
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          value={this.state.email}
                          onChange={(e) => {
                            this.setState({ email: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          value={this.state.password}
                          onChange={(e) => {
                            this.setState({ password: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="button"
                        onClick={this.handleLogInPost}
                      >
                        {btnMsg}
                      </Button>
                    </Form>
                  </div>
                </div>
              </Col>
              <Col></Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

function mapDispathToProps(dispatch) {
  return {
    login: (data) => dispatch(actions.login(data)),
  };
}

export default connect(mapStateToProps, mapDispathToProps)(SignUp);
