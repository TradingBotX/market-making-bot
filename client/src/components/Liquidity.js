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
    dataField: "pair",
    text: "Pair",
  },
  {
    dataField: "amountBuy",
    text: "Buy Order Amount(USDT)",
  },
  {
    dataField: "amountSell",
    text: "Sell Order Amount(USDT)",
  },
  { dataField: "percentGap", text: "Gap Percent" },
  // {
  //   dataField: "maxOrders",
  //   text: "Max Orders on each side",
  // },
  {
    dataField: "currentBuyTotal",
    text: "Base Currency Buy Total(Open)",
  },
  {
    dataField: "currentBuyUSDT",
    text: "USDT Buy Total(Open)",
  },
  {
    dataField: "currentSellTotal",
    text: "Base Currency Sell Total(Open)",
  },
  {
    dataField: "currentSellUSDT",
    text: "USDT Sell Total(Open)",
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
  pairs: [],
  amountBuy: 0,
  amountSell: 0,
  percentGap: 0,
  maxOrders: 10,
};

class Liquidity extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.renderData = this.renderData.bind(this);
  }

  componentDidMount() {
    this.props.getExchanges();
    this.props.getLiquidityDetails();
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
    let data = Object.keys(this.props.LiquidityBotReducer);
    data.forEach((d) => {
      if (
        prevProps.LiquidityBotReducer[d].v !==
        this.props.LiquidityBotReducer[d].v
      ) {
        if (this.props.LiquidityBotReducer[d].success) {
          AddNoti(this.props.LiquidityBotReducer[d].success, {
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
        }
        if (this.props.LiquidityBotReducer[d].error) {
          AddNoti(this.props.LiquidityBotReducer[d].error, {
            type: "error",
            duration: 2000,
            position: "bottom-right",
          });
        }
        if (this.props.LiquidityBotReducer.cancel.success) {
          this.props.getLiquidityDetails();
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
        pair: allData[i].pair,
        amountBuy: allData[i].amountBuy,
        amountSell: allData[i].amountSell,
        percentGap: allData[i].percentGap * 100,
        // maxOrders: allData[i].maxOrders,
        currentBuyTotal: parseInt(allData[i].currentBuyTotal),
        currentBuyUSDT: parseInt(allData[i].currentBuyUSDT),
        currentSellTotal: parseInt(allData[i].currentSellTotal),
        currentSellUSDT: parseInt(allData[i].currentSellUSDT),
        // processFrom: FormatDateTime(allData[i].processFrom),
        actionbtn:
          allData[i].status === "active" ? (
            <>
              <Button
                className="action-btn"
                onClick={() => {
                  this.props.cancelLiquidityBotDetails({
                    orderId: allData[i].uniqueId,
                  });
                }}
              >
                CANCEL
              </Button>
              {/* <Button className="action-btn">Details</Button> */}
            </>
          ) : (
            // <>
            //   <span
            //     style={{
            //       color: allData[i].status === "completed" ? "green" : "red",
            //       textTransform: "uppercase",
            //     }}
            //   >
            //     {allData[i].status}
            //   </span>
            //   <Button className="action-btn">Details</Button>
            // </>
            <></>
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
              <div className="simple-card--header">Add Liquidity</div>
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
                      label="Pair Name"
                      element={
                        <select
                          onChange={(e) => {
                            this.setState({
                              ...this.state,
                              pair: e.target.value,
                            });
                          }}
                        >
                          {this.state.pairs}
                        </select>
                      }
                    />
                    <RenderInput
                      label="Buy Order Amount USDT (Each Order)"
                      element={
                        <Form.Control
                          type="text"
                          placeholder="Enter Amount"
                          value={this.state.buyAmount}
                          onChange={(e) => {
                            this.setState({
                              ...this.state,
                              amountBuy: e.target.value,
                            });
                          }}
                        />
                      }
                    />
                    <RenderInput
                      label="Sell Order Amount USDT (Each Order)"
                      element={
                        <Form.Control
                          type="text"
                          placeholder="Enter Amount"
                          value={this.state.sellAmount}
                          onChange={(e) => {
                            this.setState({
                              ...this.state,
                              amountSell: e.target.value,
                            });
                          }}
                        />
                      }
                    />
                    <RenderInput
                      label="Percent Gap (Between Each Order)"
                      element={
                        <Form.Control
                          type="text"
                          placeholder="Gap in percent between each order"
                          value={this.state.percentGap}
                          onChange={(e) => {
                            this.setState({
                              ...this.state,
                              percentGap: e.target.value,
                            });
                          }}
                        />
                      }
                    />
                    <RenderInput
                      label="Max Orders per Side"
                      element={
                        <Form.Control
                          type="text"
                          placeholder="Max number of orders"
                          value={this.state.maxOrders}
                          disabled
                          onChange={(e) => {
                            this.setState({
                              ...this.state,
                              maxOrders: e.target.value,
                            });
                          }}
                        />
                      }
                    />{" "}
                    <Col style={{ marginTop: "10px" }}>
                      <Button
                        variant="primary"
                        type="button"
                        disabled={this.state.placing}
                        onClick={() => {
                          this.setState({ placing: true });
                          AxiosInstance.post("/spreadbot/addorder", {
                            exchange: this.state.exchange,
                            pair: this.state.pair,
                            botName: this.state.botName,
                            amountBuy: this.state.amountBuy,
                            amountSell: this.state.amountSell,
                            percentGap: this.state.percentGap,
                            maxOrders: this.state.maxOrders,
                          })
                            .then((resp) => {
                              resp = resp.data;
                              if (resp.statusCode === 200) {
                                AddNoti(resp.message, {
                                  type: "info",
                                  position: "bottom-right",
                                });
                                this.props.getLiquidityDetails();
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
                        Place Order
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
              data={this.props.LiquidityBotReducer.status.data}
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

function mapStateToProps({ exchangeReducer, LiquidityBotReducer }) {
  return {
    exchangeReducer,
    LiquidityBotReducer,
  };
}

function mapDispathToProps(dispatch) {
  return {
    getExchanges: () => dispatch(actions.GetExchanges()),
    getLiquidityDetails: () => dispatch(actions.getLiquidityDetails()),
    cancelLiquidityBotDetails: (data) => {
      dispatch(actions.cancelLiquidityBotDetails(data));
    },
  };
}

export default connect(mapStateToProps, mapDispathToProps)(Liquidity);
