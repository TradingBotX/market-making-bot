import React, { Component } from "react";
import { RenderInput } from "../components/FormHelper";
import { Row, Col, Card, Form } from "react-bootstrap";
import { connect } from "react-redux";
import StaticTable from "../components/StaticTable";
import * as actions from "../actions/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";
import { AddNoti } from "../helpers/Notification";

const columns = [
  {
    dataField: "exchange",
    text: "Exchange",
  },
  // {
  //   dataField: "amount",
  //   text: "Amount",
  // },
  {
    dataField: "currency",
    text: "Currency",
  },
  {
    dataField: "yesterday",
    text: "Yesterday",
  },
  {
    dataField: "today",
    text: "Today",
  },
  {
    dataField: "diff",
    text: "Difference",
  },
  {
    dataField: "diffUSDT",
    text: "Difference(USDT)",
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
export class DailyStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      times: null,
      time: null,
    };
  }
  componentDidMount() {
    this.props.getStatsTime();
  }
  componentDidUpdate(prevProps, prevState) {
    const keys = Object.keys(this.props.dailyStatsReducer);
    keys.forEach((prop) => {
      if (
        prevProps.dailyStatsReducer[prop].v !==
        this.props.dailyStatsReducer[prop].v
      ) {
        if (this.props.dailyStatsReducer[prop].success) {
          AddNoti(this.props.dailyStatsReducer[prop].success, {
            type: "info",
            position: "bottom-right",
          });
        }
        if (this.props.dailyStatsReducer[prop].error) {
          AddNoti(this.props.dailyStatsReducer[prop].error, {
            type: "error",
            position: "bottom-right",
          });
        }
      }
    });
    if (
      prevProps.dailyStatsReducer.getStatsTime.v !==
      this.props.dailyStatsReducer.getStatsTime.v
    ) {
      this.setState({
        times: [
          <option key={0} value={null}>
            {"Select"}
          </option>,
          ...this.props.dailyStatsReducer.getStatsTime.data.map((e, i) => (
            <option key={i + 1} value={e}>
              {e}
            </option>
          )),
        ],
      });
    }
  }

  renderDataAB(allData) {
    if (!allData) return null;
    let returnData = [],
      obj = {};
    for (let i = 0; i < allData.length; i++) {
      let data = allData[i];

      if (!data.account.includes("total")) {
        if (!data.stats.length) {
          obj = {
            exchange: data.exchange,
            // amount: data.account,
            currency: "No Data Available",
          };
          returnData.push(obj);
        } else {
          for (let j = 0; j < data.stats.length; j++) {
            obj = {
              exchange: data.exchange,
              // amount: data.account,
              currency: data.stats[j].currency,
              yesterday: data.stats[j].yesterdayBalance,
              today: data.stats[j].todayBalance,
              diff: data.stats[j].balanceChange,
              diffUSDT: data.stats[j].diffUSDT || 0,
            };
            returnData.push(obj);
          }
        }
      }
    }
    return returnData;
  }

  // renderDataVB(allData) {
  //   if (!allData) return null;
  //   let returnData = [], obj = {};
  //   for (let i = 0; i < allData.length; i++) {
  //     let data = allData[i];
  //     if (data.account.includes("VB")) {
  //       if (!data.stats.length) {
  //         obj = {
  //           exchange: data.exchange,
  //           amount: data.account,
  //           currency: "No Data Available"
  //         };
  //         returnData.push(obj);
  //       } else {
  //         for (let j = 0; j < data.stats.length; j++) {
  //           obj = {
  //             exchange: data.exchange,
  //             amount: data.account,
  //             currency: data.stats[j].currency,
  //             yesterday: data.stats[j].yesterdayBalance,
  //             today: data.stats[j].todayBalance,
  //             diff: data.stats[j].balanceChange,
  //             diffUSDT: data.stats[j].diffUSDT || 0
  //           };
  //           returnData.push(obj);
  //         }
  //       }
  //     }
  //   }
  //   return returnData;
  // }

  renderDataTotal(allData) {
    if (!allData) return null;
    let returnData = [],
      obj = {};
    for (let i = 0; i < allData.length; i++) {
      let data = allData[i];
      if (data.account.includes("total")) {
        if (!data.stats.length) {
          obj = {
            exchange: data.exchange,
            // amount: data.account,
            currency: "No Data Available",
          };
          returnData.push(obj);
        } else {
          for (let j = 0; j < data.stats.length; j++) {
            obj = {
              exchange: data.exchange,
              amount: data.account,
              currency: data.stats[j].currency,
              yesterday: data.stats[j].yesterdayBalance,
              today: data.stats[j].todayBalance,
              diff: data.stats[j].balanceChange,
              diffUSDT: data.stats[j].diffUSDT || 0,
            };
            returnData.push(obj);
          }
        }
      }
    }
    return returnData;
  }

  render() {
    return (
      <div className="management main-panel">
        <div className="section-title">Daily Stats</div>
        <Row>
          <Col md={12} lg={8} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Time"
                    element={
                      <select
                        value={this.state.time}
                        onChange={(e) => {
                          this.props.getStatsData({
                            timestamp: e.target.value,
                          });
                        }}
                      >
                        {this.state.times}
                      </select>
                    }
                  />
                </Form>
              </div>
            </Card>
          </Col>
        </Row>
        <div className="section-title">Daily Stats Data</div>
        <Row>
          <Col md={12} lg={12} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--body">
                <StaticTable
                  columns={columns}
                  renderData={this.renderDataAB}
                  data={this.props.dailyStatsReducer.getStatsData.data}
                  prepopulatedData={prepopulatedData}
                  sizePerPage={20}
                />
              </div>
            </Card>
          </Col>
        </Row>
        {/* <div className="section-title">Volume Daily Stats Data</div>
        <Row>
          <Col md={12} lg={12} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--body">
                <StaticTable
                  columns={columns}
                  renderData={this.renderDataVB}
                  data={this.props.dailyStatsReducer.getStatsData.data}
                  prepopulatedData={prepopulatedData}
                  sizePerPage={20}
                />
              </div>
            </Card>
          </Col>
        </Row> */}
        <div className="section-title">Total Daily Stats Data</div>
        <Row>
          <Col md={12} lg={12} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--body">
                <StaticTable
                  columns={columns}
                  renderData={this.renderDataTotal}
                  data={this.props.dailyStatsReducer.getStatsData.data}
                  prepopulatedData={prepopulatedData}
                  sizePerPage={20}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps({ auth, dailyStatsReducer }) {
  return { auth, dailyStatsReducer };
}

function mapDispathToProps(dispatch) {
  return {
    getStatsTime: () => dispatch(actions.getDailyStatsTime()),
    getStatsData: (data) => dispatch(actions.getDailyStatsData(data)),
  };
}

export default connect(mapStateToProps, mapDispathToProps)(DailyStats);
