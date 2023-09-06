import React, { Component } from "react";
import { faCogs } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as actions from "../actions/index";
import { connect } from "react-redux";
import withRouter from "../helpers/withRouter";
import { AddNoti } from "../helpers/Notification";
import { Col, Row } from "react-bootstrap";
import DataTable from "./DataTable";

const columns = [
  {
    dataField: "type",
    text: "Type",
  },
  {
    dataField: "price",
    text: "Price",
  },
  {
    dataField: "usdtPrice",
    text: "USDT Price",
  },
  {
    dataField: "originalQty",
    text: "Amount",
  },
  {
    dataField: "filledQty",
    text: "Filled Amount",
  },
  {
    dataField: "total",
    text: "Total",
  },
  {
    dataField: "usdtTotal",
    text: "USDT Total",
  },
  {
    dataField: "updatedTotal",
    text: "Filled Total",
  },
  {
    dataField: "updatedUsdtTotal",
    text: "Filled USDT Total",
  },
  {
    dataField: "status",
    text: "Status",
  },
];

const columnsDetails = [
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
    text: "Buy Order Amount",
  },
  {
    dataField: "amountSell",
    text: "Sell Order Amount",
  },
  { dataField: "percentGap", text: "Gap Percent" },
  // {
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
  orderDetails: {},
  orders: [],
};

class LiquidityDetails extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.renderData = this.renderData.bind(this);
  }

  componentDidMount() {
    this.props.getLiquidityOrderDetails({
      uniqueId: this.props.params.uniqueId,
    });
    this.interval = setInterval(() => {
      this.props.getLiquidityOrderDetails({
        uniqueId: this.props.params.uniqueId,
      });
    }, 1000 * 60 * 2);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentDidUpdate(prevProps) {
    let data = Object.keys(this.props.LiquidityDetailsBotReducer);
    data.forEach((d) => {
      if (
        prevProps.LiquidityDetailsBotReducer[d].v !==
        this.props.LiquidityDetailsBotReducer[d].v
      ) {
        if (this.props.LiquidityDetailsBotReducer[d].success) {
          AddNoti(this.props.LiquidityDetailsBotReducer[d].success, {
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
        }
        if (this.props.LiquidityDetailsBotReducer[d].error) {
          AddNoti(this.props.LiquidityDetailsBotReducer[d].error, {
            type: "error",
            duration: 2000,
            position: "bottom-right",
          });
        }
      }
    });
  }

  renderData(allData) {
    if (!allData) return null;
    if (!allData.orders) return null;
    let obj,
      returnData = [],
      i;
    for (i = 0; i < allData.orders.length; i++) {
      obj = {
        id: i + 1,
        type: allData.orders[i].type,
        price: allData.orders[i].price,
        usdtPrice: parseFloat(
          parseFloat(allData.orders[i].usdtPrice).toFixed(6)
        ),
        originalQty: allData.orders[i].originalQty,
        filledQty: allData.orders[i].filledQty,
        total: parseFloat(parseFloat(allData.orders[i].total).toFixed(2)),
        usdtTotal: parseFloat(
          parseFloat(allData.orders[i].usdtTotal).toFixed(2)
        ),
        updatedTotal: parseFloat(
          parseFloat(allData.orders[i].updatedTotal).toFixed(2)
        ),
        updatedUsdtTotal: parseFloat(
          parseFloat(allData.orders[i].updatedUsdtTotal).toFixed(2)
        ),
        status: allData.orders[i].status,
      };
      returnData.push(obj);
    }
    return returnData;
  }

  renderDetails(allData) {
    if (!allData) return null;
    if (!allData.orderDetails) return null;
    let obj,
      returnData = [];
    obj = {
      id: 1,
      exchange: allData.orderDetails.exchange,
      pair: allData.orderDetails.pair,
      amountBuy: allData.orderDetails.amountBuy,
      amountSell: allData.orderDetails.amountSell,
      percentGap: allData.orderDetails.percentGap * 1000,
      currentBuyTotal: parseInt(allData.orderDetails.currentBuyTotal),
      currentBuyUSDT: parseInt(allData.orderDetails.currentBuyUSDT),
      currentSellTotal: parseInt(allData.orderDetails.currentSellTotal),
      currentSellUSDT: parseInt(allData.orderDetails.currentSellUSDT),
    };
    returnData.push(obj);
    return returnData;
  }

  render() {
    return (
      <div className="main-panel">
        <Row>
          <Col lg={12} md={12} sm={12} xs={12}>
            <DataTable
              data={this.props.LiquidityDetailsBotReducer.status.data}
              renderData={this.renderDetails}
              columns={columnsDetails}
              prepopulatedData={prepopulatedData}
              emptyData={EmptyData}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={12} md={12} sm={12} xs={12}>
            <DataTable
              data={this.props.LiquidityDetailsBotReducer.status.data}
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

function mapStateToProps({ LiquidityDetailsBotReducer }) {
  return {
    LiquidityDetailsBotReducer,
  };
}

function mapDispathToProps(dispatch) {
  return {
    getLiquidityOrderDetails: (data) =>
      dispatch(actions.getLiquidityOrderDetails(data)),
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispathToProps)(LiquidityDetails)
);
