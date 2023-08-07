import React, { Component } from "react";
import Formdata from "form-data";
import { Redirect } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import RequireLogout from "../middleware/RequireLogout";

import { AxiosInstance, PostConfig } from "../helpers/constant";

import { AddNoti } from "../helpers/Notification";
import ScrollToTop from "../hooks/ScrollToTop";
import { ParseError } from "../helpers/ResponseHelper";

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  redirect: false,
  redirectTo: "/",
};

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.companyLogoInput = React.createRef();

    this.handleSignUpPost = this.handleSignUpPost.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
  }

  handleSignUpPost() {
    const email = this.state.email;
    const password = this.state.password;

    const newForm = {
      name: this.state.name,
      email,
      password,
    };

    AxiosInstance.post("/admin/sign-up", newForm, PostConfig)
      .then((resp) => {
        resp = resp.data;
        if (resp.statusCode === 201) {
          AddNoti("Please login to continue!", {
            type: "success",
          });
          this.setState({
            ...initialState,
            redirect: true,
            redirectTo: "/login",
          });
        } else {
          AddNoti(resp.error || resp.message, {
            type: "error",
          });
        }
      })
      .catch((e) => {
        AddNoti(ParseError(e), {
          type: "error",
        });
      });
  }

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirectTo} />;
    }
  };

  render() {
    return (
      <div>
        <ScrollToTop />
        {/* <RequireLogout /> */}
        {this.renderRedirect()}
        <div className="sign-up main-panel">
          <Container>
            <Row>
              <Col></Col>
              <Col xs="6" sm="8" md="8" lg="6" xl="6">
                <div className="center-form">
                  <div className="center-form__title">Sign Up</div>
                  <hr />
                  <div className="center-form__content">
                    <Form>
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter name"
                          value={this.state.name}
                          onChange={(e) => {
                            this.setState({ name: e.target.value });
                          }}
                        />
                      </Form.Group>

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

                      <Form.Group controlId="formBasicCfmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm Password"
                          value={this.state.confirmPassword}
                          onChange={(e) => {
                            this.setState({ confirmPassword: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="button"
                        onClick={this.handleSignUpPost}
                      >
                        Submit
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

export default SignUp;
