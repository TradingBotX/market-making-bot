import React, { Component } from "react";
import * as actions from "../actions/index";
import { connect } from "react-redux";
import { AddNoti } from "../helpers/Notification";
import { Row, Card, Col, Form, Button, FormControl } from "react-bootstrap";
import { RenderInput } from "../components/FormHelper";
import { alertLevel } from "../helpers/constant";

const initialState = {
  alertLevel: null,
  name: null,
  email: null,
};

class AdminProfile extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidUpdate(prevProps) {
    let data = this.props.adminProfileReducer.updateProfile;
    if (
      data.success &&
      prevProps.adminProfileReducer.updateProfile.v !== data.v
    ) {
      AddNoti(data.success, { type: "info", position: "bottom-right" });
    }
    if (
      data.error &&
      prevProps.adminProfileReducer.updateProfile.v !== data.v
    ) {
      AddNoti(data.error, { type: "error", position: "bottom-right" });
    }
    // if (this.props.auth.success && prevProps.auth.v !== this.props.auth.v) {
    //   AddNoti(this.props.auth.success, { type: "info", position: "bottom-right" });
    // }
    // if (this.props.auth.error && prevProps.auth.v !== this.props.auth.v) {
    //   AddNoti(this.props.auth.error, { type: "info", position: "bottom-right" });
    // }
  }

  render() {

    if (
      this.props.auth &&
      this.props.auth.data
    ) {
      var name = this.props.auth.data.name;
      var email = this.props.auth.data.email;
      var alerts = this.props.auth.data.alerts;
      var level = this.props.auth.data.level;
    }

    return (
      <div className="management main-panel">
        <Row>
          <Col md={6} lg={6} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--header">Admin Alert Level</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Alert Level"
                    element={
                      <select
                        value={this.state.alertLevel}
                        onChange={(e) => {
                          this.setState({
                            alertLevel: e.target.value,
                          });
                        }}
                      >
                        <option value="0">Select(0)</option>
                        <option value="1">Balance(1)</option>
                        <option value="2">All(2)</option>
                      </select>
                    }
                  />
                  <div className="u-float-right">
                    <Button
                      onClick={() => {
                        this.props.updateMailProfile({
                          level: this.state.alertLevel,
                        });
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>
          </Col>
          <Col md={6} lg={6} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--header">Admin Profile Info</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Name"
                        disabled
                        value={name}
                      />
                    }
                  />
                  <RenderInput
                    label="Email"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Email"
                        disabled
                        value={email}
                      />
                    }
                  />
                  <RenderInput
                    label="Alerts"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Alerts"
                        disabled
                        value={alerts}
                      />
                    }
                  />
                  <RenderInput
                    label="Level"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Level"
                        disabled
                        value={level}
                      />
                    }
                  />
                </Form>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps({ auth, adminProfileReducer }) {
  return { auth, adminProfileReducer };
}

function mapDispathToProps(dispatch) {
  return {
    updateMailProfile: (data) => dispatch(actions.UpdateMailProfile(data)),
  };
}
export default connect(mapStateToProps, mapDispathToProps)(AdminProfile);
