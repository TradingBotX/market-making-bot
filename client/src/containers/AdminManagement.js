import React, { Component } from "react";
import { Row, Card, Col, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";
import StaticTable from "../components/StaticTable";
import { RenderInput } from "../components/FormHelper";
import * as actions from "../actions/index";
import { connect } from "react-redux";
import { AddNoti } from "../helpers/Notification";
import { Capitalize } from "../helpers/constant";

const columns = [
  {
    dataField: "email",
    text: "Email",
    headerStyle: () => {
      return { width: "150px" };
    },
  },
  {
    dataField: "name",
    text: "Name",
  },
  {
    dataField: "level",
    text: "Level",
  },
  {
    dataField: "alert",
    text: "Alert",
  },
];

const prepopulatedAdmin = [
  {
    id: 1,
    level: (
      <div className="table-one__loader">
        <FontAwesomeIcon icon={faCogs} size="5x" />
        <div>LOADING</div>
      </div>
    ),
  },
];

const EmptyData = [
  {
    id: 1,
    level: (
      <div className="table-one__loader">
        <div>No Data</div>
      </div>
    ),
  },
];

const initialState = {
  addAdmin: null,
  removeAdmin: null,
};
class AdminManagement extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    this.props.getAdmin();
  }

  componentDidUpdate(prevProps) {
    let data = Object.keys(this.props.adminReducer);
    for (let i = 0; i < data.length; i++) {
      let adminData = this.props.adminReducer[data[i]];
      if (
        adminData.success &&
        prevProps.adminReducer[data[i]].v !== adminData.v
      ) {
        AddNoti(adminData.success, { type: "info", position: "bottom-right" });
        if (data[i] !== "status") this.props.getAdmin();
      }
      if (adminData.error && prevProps.adminReducer[data[i]].v !== adminData.v) {
        AddNoti(adminData.error, { type: "error", position: "bottom-right" });
        if (data[i] !== "status") this.props.getAdmin();
      }
    }
  }

  renderAdminData(allData) {
    if (!allData || allData.length === 0) {
      return EmptyData;
    }
    return allData.map((e, i) => {
      return {
        id: i,
        email: e.email,
        name: Capitalize(e.name),
        level: e.level,
        alert: e.alerts || 0,
      };
    });

  }

  render() {
    return (
      <div className="management main-panel">
        <div className="section-title">Admin Management</div>
        <Row>
          <Col md={6} lg={6} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--header">Admin Info</div>
              <div className="simple-card--body">
                <StaticTable
                  columns={columns}
                  renderData={this.renderAdminData}
                  data={this.props.adminReducer.status.data}
                  prepopulatedData={prepopulatedAdmin}
                />
              </div>
            </Card>
          </Col>
          <Col md={6} lg={6} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--header">Add Admin</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Add Admin"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Enter Email"
                        value={this.state.addAdmin}
                        onChange={(e) =>
                          this.setState({
                            addAdmin: e.target.value,
                          })
                        }
                      />
                    }
                  />
                  <div className="u-float-right">
                    <Button
                      onClick={() => {
                        this.props.addAdmin({ email: this.state.addAdmin });
                      }}
                    >
                      Add Admin
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>
            <Card className="simple-card">
              <div className="simple-card--header">Remove Admin</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Remove Admin"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Enter Email"
                        value={this.state.removeAdmin}
                        onChange={(e) =>
                          this.setState({
                            removeAdmin: e.target.value,
                          })
                        }
                      />
                    }
                  />
                  <div className="u-float-right">
                    <Button
                      onClick={() => {
                        this.props.removeAdmin({
                          email: this.state.removeAdmin,
                        });
                      }}
                    >
                      Remove Admin
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps({ adminReducer }) {
  return { adminReducer };
}

function mapDispathToProps(dispatch) {
  return {
    getAdmin: () => dispatch(actions.GetAdmin()),
    addAdmin: (data) => dispatch(actions.AddAdmin(data)),
    removeAdmin: (data) => dispatch(actions.RemoveAdmin(data)),
  };
}
export default connect(mapStateToProps, mapDispathToProps)(AdminManagement);
