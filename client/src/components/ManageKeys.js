import React, { Component } from "react";
import { Col, Row, Button, Form, Container, Card } from "react-bootstrap";
import { connect } from "react-redux";
import { AddNoti } from "../helpers/Notification";
import * as actions from "../actions/index";
import { RenderInput } from "../components/FormHelper";
import { Accounts, AxiosInstance, FormatDateTime } from "../helpers/constant";
import { ParseError } from "../helpers/ResponseHelper";
import DataTable from "./DataTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";

const columns = [
  {
    dataField: "exchange",
    text: "Exchange",
  },
  {
    dataField: "actionbtn",
    text: "Action",
  },
];

const prepopulatedData = [
  {
    id: 1,
    maxVolume: (
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
    maxVolume: (
      <div className="table-one__loader">
        <div>No Data</div>
      </div>
    ),
  },
];

let initialState = {
  botName: "AB",
  exchanges: [],
  exchange: null,
  apiKey: "",
  apiSecret: "",
  passPhrase: "",
  subAccUserId: "",
  accountId: "",
};

class ManageKeys extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.renderData = this.renderData.bind(this);
  }

  componentDidMount() {
    this.props.getExchanges();
    this.props.getKeys();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.exchangeReducer.status.v !== this.props.exchangeReducer.status.v
    ) {
      this.setState({
        exchanges: [
          <option key={0} value={"select"}>
            {"select"}
          </option>,
          ...this.props.exchangeReducer.status.exchanges.map((e, i) => (
            <option key={i + 1} value={e}>
              {e}
            </option>
          )),
        ],
      });
    }
    let data = Object.keys(this.props.ManageKeysReducer);
    data.forEach((d) => {
      if (
        prevProps.ManageKeysReducer[d].v !== this.props.ManageKeysReducer[d].v
      ) {
        if (this.props.ManageKeysReducer[d].success) {
          AddNoti(this.props.ManageKeysReducer[d].success, {
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
        }
        if (this.props.ManageKeysReducer[d].error) {
          AddNoti(this.props.ManageKeysReducer[d].error, {
            type: "error",
            duration: 2000,
            position: "bottom-right",
          });
        }
        if (this.props.ManageKeysReducer.delete.success) {
          this.props.getKeys();
        }
      }
    });
  }

  renderData(allData) {
    if (!allData) return null;
    let obj,
      returnData = [];
    for (let i = 0; i < allData.length; i++) {
      obj = {
        id: i + 1,
        exchange: allData[i].exchange,
        actionbtn: (
          <>
            <Button
              className="action-btn"
              onClick={() => {
                this.props.deleteKey({
                  keyId: allData[i].uniqueId,
                });
              }}
            >
              Remove
            </Button>
          </>
        ),
      };
      returnData.push(obj);
    }
    return returnData;
  }

  render() {
    return (
      <div className="main-panel">
        <Row>
          <Col xs="12" sm="12" md="12" lg="8" xl="8">
            <Card className="simple-card">
              <div className="simple-card--header">Add ManageKeys</div>
              <div className="simple-card--body">
                <Form>
                  <Form.Group>
                    <RenderInput
                      label="Exchange Name"
                      element={
                        <select
                          onChange={(e) => {
                            this.setState({
                              ...this.state,
                              exchange: e.target.value,
                              pairs: this.props.exchangeReducer.status
                                .exchangePairs[e.target.value]
                                ? [
                                    <option key={0} value={"select"}>
                                      {"select"}
                                    </option>,
                                    ...this.props.exchangeReducer.status.exchangePairs[
                                      e.target.value
                                    ]
                                      .map((e) => e.name)
                                      .map((e, i) => (
                                        <option key={i + 1} value={e}>
                                          {e}
                                        </option>
                                      )),
                                  ]
                                : [],
                            });
                          }}
                        >
                          {this.state.exchanges}
                        </select>
                      }
                    />
                    <RenderInput
                      label="API Key"
                      element={
                        <Form.Control
                          type="text"
                          placeholder="Enter Api Key"
                          value={this.state.apiKey}
                          onChange={(e) =>
                            this.setState({
                              apiKey: e.target.value,
                            })
                          }
                        />
                      }
                    />
                    <RenderInput
                      label="API Secret"
                      element={
                        <Form.Control
                          type="text"
                          placeholder="Enter Api Secret"
                          value={this.state.apiSecret}
                          onChange={(e) =>
                            this.setState({
                              apiSecret: e.target.value,
                            })
                          }
                        />
                      }
                    />
                    {this.state.exchange === "kucoin" ? (
                      <>
                        <RenderInput
                          label="Passphrase"
                          element={
                            <Form.Control
                              type="text"
                              placeholder="Enter Passphrase"
                              value={this.state.passPhrase}
                              onChange={(e) =>
                                this.setState({
                                  passPhrase: e.target.value,
                                })
                              }
                            />
                          }
                        />
                        <RenderInput
                          label="Sub Account Id(if applicable)"
                          element={
                            <Form.Control
                              type="text"
                              placeholder="Enter Sub Account Id"
                              value={this.state.subAccUserId}
                              onChange={(e) =>
                                this.setState({
                                  subAccUserId: e.target.value,
                                })
                              }
                            />
                          }
                        />
                      </>
                    ) : null}
                    {/* {this.state.exchange === "huobi" ? (
                      <RenderInput
                        label="Account Id"
                        element={
                          <Form.Control
                            type="text"
                            placeholder="Enter Account Id"
                            value={this.state.accountId}
                            onChange={(e) =>
                              this.setState({
                                accountId: e.target.value,
                              })
                            }
                          />
                        }
                      />
                    ) : null} */}
                    <Col style={{ marginTop: "10px" }}>
                      <Button
                        variant="primary"
                        type="button"
                        disabled={this.state.placing}
                        onClick={() => {
                          this.setState({ placing: true });
                          AxiosInstance.post(
                            "/admin/addkey",
                            {
                              exchange: this.state.exchange,
                              apiKey: this.state.apiKey,
                              apiSecret: this.state.apiSecret,
                              passPhrase: this.state.passPhrase,
                              subAccUserId: this.state.subAccUserId,
                              accountId: this.state.accountId,
                            },
                            {
                              headers: {
                                Authorization:
                                  localStorage.getItem("crypbot_jwt"),
                              },
                            }
                          )
                            .then((resp) => {
                              resp = resp.data;
                              if (resp.statusCode === 200) {
                                AddNoti(resp.message, {
                                  type: "info",
                                  position: "bottom-right",
                                });
                                this.props.getKeys();
                              } else {
                                AddNoti(ParseError(resp), {
                                  type: "error",
                                  position: "bottom-right",
                                });
                              }
                            })
                            .catch((e) => {
                              AddNoti(ParseError(e), {
                                type: "error",
                                position: "bottom-right",
                              });
                            })
                            .finally(() => {
                              this.setState({ placing: false });
                            });
                        }}
                      >
                        Add Key
                      </Button>
                    </Col>
                  </Form.Group>
                </Form>
              </div>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={12} md={12} sm={12} xs={12}>
            <DataTable
              data={this.props.ManageKeysReducer.status.data}
              renderData={this.renderData}
              columns={columns}
              prepopulatedData={prepopulatedData}
              emptyData={EmptyData}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps({ exchangeReducer, ManageKeysReducer }) {
  return {
    exchangeReducer,
    ManageKeysReducer,
  };
}

function mapDispathToProps(dispatch) {
  return {
    getExchanges: () => dispatch(actions.GetExchanges()),
    getKeys: () => dispatch(actions.getKeys()),
    deleteKey: (data) => dispatch(actions.deleteKey(data)),
  };
}

export default connect(mapStateToProps, mapDispathToProps)(ManageKeys);
