import { faCogs } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Component } from "react";
import { Card, Button } from "react-bootstrap";
import { connect } from "react-redux";

import * as actions from "../actions/index";
import {
  AddDelimiter,
  GetDateLocalFormat,
  PairDecimalsAmount,
} from "../helpers/constant";
import StaticTable from "./StaticTable";

const initialState = { balances: { data: [], ts: null } };

const rooms = ["wallet"];

const columns = [
  {
    dataField: "exchange",
    text: "Exchange",
  },
  {
    dataField: "currency",
    text: "Currency",
  },
  {
    dataField: "account",
    text: "Account",
  },
  {
    dataField: "balance",
    text: "Balance",
    headerStyle: () => {
      return { width: "100px", textAlign: "left" };
    },
  },
  {
    dataField: "inTrade",
    text: "In Trade",
    headerStyle: () => {
      return { width: "100px", textAlign: "left" };
    },
  },
];

const prepopulatedExchange = [
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

class Wallet extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
  }

  componentDidMount() {
    this.props.connectSocket(rooms);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.socketReducer.status !== "connected") {
      this.props.connectSocket(rooms);
    } else {
      if (this.props.socketReducer.socket)
        this.props.socketReducer.socket.removeAllListeners();

      nextProps.socketReducer.socket.emit("joinRooms", rooms);

      nextProps.socketReducer.socket.on("balances", (balances) => {
        // console.log("balances", balances);
        const exchanges = Object.keys(balances);
        let data = [],
          ts;
        for (let exchange of exchanges) {
          data = data.concat(balances[exchange].data);
          ts = balances[exchange].ts;
        }
        this.setState({ balances: { data, ts } });
      });
    }
  }

  renderBalances(balances) {
    return balances.map((balance, i) => {
      return {
        id: i,
        account: balance.botName,
        exchange: balance.exchange,
        currency: balance.currency,
        inTrade: balance.inTrade,
        balance:
          balance.balance >= balance.minBalance ? (
            <span className="blue">
              {AddDelimiter(
                parseFloat(balance.balance).toFixed(
                  PairDecimalsAmount[`${balance.currency}-USDT`]
                )
              )}
            </span>
          ) : (
            <span className="red">
              {AddDelimiter(
                parseFloat(balance.balance).toFixed(
                  PairDecimalsAmount[`${balance.currency}-USDT`]
                )
              )}
            </span>
          ),
      };
    });
  }

  render() {
    return (
      <>
        <Card className="simple-card">
          <div className="simple-card--header">{this.props.header || ""}</div>
          <div className="simple-card--body">
            <StaticTable
              columns={columns}
              renderData={this.renderBalances}
              data={this.state.balances.data}
              prepopulatedData={prepopulatedExchange}
              sizePerPage={4}
            />
          </div>
        </Card>
        <div className="u-width-full">
          <div className="u-float-left">
            Last Updatded:{" "}
            {this.state.balances.ts
              ? GetDateLocalFormat(this.state.balances.ts)
              : "loading"}
          </div>
          <div className="u-float-right">
            <Button
              onClick={() => {
                this.props.socketReducer.socket.emit("get_wallet_balance");
              }}
            >
              Check Now
            </Button>
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps({ socketReducer, exchangeReducer }) {
  return { socketReducer, exchangeReducer };
}

function mapDispatchToProps(dispatch) {
  return {
    connectSocket: () => dispatch(actions.ConnectSocket()),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Wallet);
