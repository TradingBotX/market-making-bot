import React from "react";
import { connect } from "react-redux";
import {
  Card,
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import DatePicker from "react-datepicker";

import * as actions from "../actions/index";
import {
  FormatDateTime,
  FormatTime,
  GetMax,
  GetMin,
  GenericAccounts,
} from "../helpers/constant";

import LineChart from "../components/Charts/LineChart";
import Wallet from "../components/Wallet";
import { initial } from "lodash";
import DataTable from "../components/DataTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";
import { CurrencyAmount } from "../components/Exchange";
import { RenderInput } from "../components/FormHelper";
import { AddNoti } from "../helpers/Notification";

const rooms = ["monitor"];

const prepopulatedData = [
  {
    id: 1,
    account: (
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
    account: (
      <div className="table-one__loader">
        <div>No Data</div>
      </div>
    ),
  },
];

class Monitor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      seriesData: [],
      seriesDataCap: 10,
      socketConnections: 0,
      exchanges: [],
    };
  }

  componentDidMount() {
    this.props.connectSocket(rooms);

    this.props.getExchanges();
    this.props.getExchangeCurrency();
  }

  componentWillUnmount() {
    if (this.props.socketReducer.socket) {
      this.props.socketReducer.socket.removeAllListeners();
    }
  }

  componentWillReceiveProps(nextProps) {
    let seriesData = this.state.seriesData;
    let seriesDataCap = 10;

    let updateState = {};

    if (nextProps.socketReducer.status === "connected") {
      nextProps.socketReducer.socket.emit("joinRooms", rooms);

      nextProps.socketReducer.socket.on("memory_usage", ({ heapUsed }) => {
        seriesData.push(heapUsed);
        if (seriesData.length > seriesDataCap) {
          seriesData.shift();
        }

        this.setState({
          seriesData,
          max: GetMax(seriesData),
          min: GetMin(seriesData),
        });
      });

      nextProps.socketReducer.socket.on("socket_count", (count) => {
        this.setState({ socketConnections: count });
      });

      nextProps.socketReducer.socket.on("disconnect", () => {
        this.props.connectSocket(rooms);
      });

      nextProps.socketReducer.socket.on("live_snapshot", (data) => {
        // console.log("snapSummary live_snapshot", data);
        this.setState({ targetSnapSummary: data });
      });
    }

    if (nextProps.socketReducer.status !== "connected") {
      this.props.connectSocket(rooms);
    }

    if (
      this.props.exchangeReducer.status.v !==
        nextProps.exchangeReducer.status.v &&
      nextProps.exchangeReducer.status.exchanges
    ) {
      updateState = {
        ...updateState,
        exchanges: [
          <option key={0} value={"select"}>
            {"select"}
          </option>,
          ...nextProps.exchangeReducer.status.exchanges.map((e, i) => (
            <option key={i + 1} value={e}>
              {e}
            </option>
          )),
        ],
      };
    }

    if (
      this.props.exchangeReducer.getCurrency.v !==
        nextProps.exchangeReducer.getCurrency.v &&
      nextProps.exchangeReducer.getCurrency.exchangeToCurrency
    ) {
      updateState = {
        ...updateState,
        exchangeToCurrency:
          nextProps.exchangeReducer.getCurrency.exchangeToCurrency,
      };
    }

    if (updateState !== {}) this.setState({ ...updateState });
  }

  getAverageRate() {
    let data = this.state.seriesData;
    if (data.length <= 1) return null;
    let sum = (data[data.length - 1] - data[0]) / data.length;
    return ((sum * 6 * 60) / ((data.length - 1) * 1000000)).toFixed(4);
  }

  getHeapStatus(rate) {
    if (rate === null)
      return <div className="heap-status">Insufficient Data</div>;
    if (rate > 20) {
      return <div className="heap-status red">Growing</div>;
    } else if (rate < -20) {
      return <div className="heap-status green">Cutting Down</div>;
    }
    return <div className=" heap-status blue">Permittable</div>;
  }

  renderRowStyle(row, i) {
    if (row._className === "profit") {
      return {
        backgroundColor: "#25ac37",
        color: "white",
      };
    }
    if (row._className === "loss") {
      return {
        backgroundColor: "#ff0000",
        color: "white",
      };
    }
    if (row._className === "neutral") {
      return {
        backgroundColor: "#ebebeb",
        color: "#343a40",
      };
    }
  }

  render() {
    const memRate = this.getAverageRate();

    return (
      <div className="monitor main-panel">
        <Row>
          <Col lg={6} md={6} sm={12} xs={12}>
            <Card className="simple-card">
              <div className="simple-card--header">Heap Used</div>
              <LineChart
                data={{ series: [this.state.seriesData], labels: [] }}
                type="Line"
                options={{
                  height: "50vh",
                  showArea: true,
                  high: this.state.max ? this.state.max * 2 : 50000000,
                  low: this.state.min ? this.state.min / 2 : 30000000,
                }}
              />
            </Card>
          </Col>
          <Col lg={6} md={6} sm={12} xs={12}>
            <Card className="simple-card">
              <div className="simple-card--header">
                Active Socket Connections
              </div>
              <div className="simple-card--body">
                <Row>
                  <Col className="col-md-4 col-lg-4 col-sm-4">
                    Active Connections
                  </Col>
                  <Col className="col-md-8 col-lg-8 col-sm-8">
                    {this.state.socketConnections}
                  </Col>
                </Row>
              </div>
            </Card>
            <Card className="simple-card">
              <div className="simple-card--header">Heap Analysis</div>
              <div className="simple-card--body">
                <Row>
                  <Col className="col-md-4 col-lg-4 col-sm-4">MB/HR</Col>
                  <Col className="col-md-8 col-lg-8 col-sm-8">
                    {memRate ? memRate : "Insufficient Data"}
                  </Col>
                </Row>
                <br />
                <Row>
                  <Col className="col-md-4 col-lg-4 col-sm-4">Status</Col>
                  <Col className="col-md-8 col-lg-8 col-sm-8">
                    {this.getHeapStatus(memRate)}
                  </Col>
                </Row>
              </div>
            </Card>
            <Card className="simple-card">
              <div className="simple-card--header">Wallet Details</div>
              <div className="simple-card--body">
                <Row>
                  <Wallet />
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps({ socketReducer, exchangeReducer }) {
  return {
    socketReducer,
    exchangeReducer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    connectSocket: () => dispatch(actions.ConnectSocket()),
    getExchanges: () => dispatch(actions.GetExchanges()),
    getExchangeCurrency: () => dispatch(actions.GetExchangeCurrency()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Monitor);
