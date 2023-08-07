import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Card, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";
import StaticTable from "../components/StaticTable";
import DataTable from "../components/DataTable";
import { RenderInput } from "../components/FormHelper";
import { AddNoti } from "../helpers/Notification";
import * as actions from "../actions/index";
import EditCurrencyCard from "../components/EditCurrencyCard";

const columns = [
  {
    dataField: "exchange",
    text: "Exchange",
  },
  {
    dataField: "pairs",
    text: "Pairs",
  },
  {
    dataField: "tradeFee",
    text: "Trade Fee",
  },
  {
    dataField: "disabled",
    text: "Disabled",
  },
];

const exchangeCurrencyColumns = [
  {
    dataField: "exchange",
    text: "Exchange",
  },
  {
    dataField: "symbol",
    text: "Symbol",
  },
  {
    dataField: "name",
    text: "Name",
  },
  {
    dataField: "currencyId",
    text: "Currency ID",
  },
  {
    dataField: "exchangeSymbol",
    text: "Exchange Symbol",
  },
  {
    dataField: "minimumBalance",
    text: "Minimum Balance",
  },
  {
    dataField: "edit",
    text: "Edit",
  },
];

const columnsPairDecimals = [
  {
    dataField: "exchange",
    text: "Exchange",
  },
  {
    dataField: "pair",
    text: "Pair",
  },
  {
    dataField: "minAmount",
    text: "Min. Amount",
  },
  {
    dataField: "maxAmount",
    text: "Max. Amount",
  },
  {
    dataField: "decimalsAmount",
    text: "Amount Decimals",
  },
  {
    dataField: "decimalsPrice",
    text: "Decimals Price",
  },
];

const initialState = {
  exchange: {
    addExchange: {
      exchange: null,
      tradeFee: null,
    },
    addExchangePair: {
      exchange: null,
      decimalsAmount: null,
      decimalsPrice: null,
      minAmount: null,
      maxAmount: null,
      pair: null,
    },
    updateExchangePair: {
      exchange: null,
      decimalsAmount: null,
      decimalsPrice: null,
      minAmount: null,
      pair: null,
    },
    updateTradeFee: {
      exchange: null,
      tradeFee: null,
    },
    activateExchange: {
      exchange: null,
    },
    deactivateExchange: {
      exchange: null,
    },
    currency: {
      name: null,
      symbol: null,
      exchange: null,
      exchangeSymbol: null,
      minimumBalance: null,
    },
    exchangeAdd: {
      exchange: null,
    },
  },
  arbitrage: {},
};

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

const prepopulatedExchange = [
  {
    id: 1,
    tradeFee: (
      <div className="table-one__loader">
        <FontAwesomeIcon icon={faCogs} size="5x" />
        <div>LOADING</div>
      </div>
    ),
  },
];

class Management extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
  }

  componentDidMount() {
    this.props.getExchanges();
    this.props.getArbitrageOperation();
    this.props.getExchangeCurrency();
  }

  componentDidUpdate(prevProps) {
    let data = Object.keys(this.props.exchangeReducer);
    for (let i = 0; i < data.length; i++) {
      let currData = this.props.exchangeReducer[data[i]];
      if (
        currData.success &&
        prevProps.exchangeReducer[data[i]].v != currData.v
      ) {
        AddNoti(currData.success, { type: "info", position: "bottom-right" });
        // if (data[i] !== "status") this.props.getExchanges();
      }
      if (
        currData.error &&
        prevProps.exchangeReducer[data[i]].v != currData.v
      ) {
        AddNoti(currData.error, { type: "error", position: "bottom-right" });
        // if (data[i] !== "status") this.props.getExchanges();
      }
    }

    data = Object.keys(this.props.arbitrageReducer);
    for (let i = 0; i < data.length; i++) {
      let currData = this.props.arbitrageReducer[data[i]];
      if (
        currData.success &&
        prevProps.arbitrageReducer[data[i]].v != currData.v
      ) {
        AddNoti(currData.success, { type: "info", position: "bottom-right" });
        if (data[i] !== "status") this.props.getArbitrageOperation();
      }
      if (
        currData.error &&
        prevProps.arbitrageReducer[data[i]].v != currData.v
      ) {
        AddNoti(currData.error, { type: "error", position: "bottom-right" });
        if (data[i] !== "status") this.props.getArbitrageOperation();
      }
    }
  }

  renderCurrencyInfo(allData) {
    let returnData = [];

    Object.keys(allData).map((d) => {
      Object.keys(allData[d].currency).map((f) => {
        let obj = {
          exchange: allData[d].exchange,
          symbol: allData[d].currency[f].symbol,
          name: allData[d].currency[f].name,
          currencyId: allData[d].currency[f].currencyId,
          exchangeSymbol: allData[d].currency[f].exchangeSymbol,
          minimumBalance: allData[d].currency[f].minimumBalance,
          edit: (
            <>
              <Button
                className="action-btn"
                onClick={() => {
                  // console.log("Data of exchange Currency", allData[d].exchange);
                  this.setState({
                    modalForm: (
                      <EditCurrencyCard
                        exchangeCurrencyUpdate={
                          this.props.exchangeCurrencyUpdate
                        }
                        exchange={allData[d].exchange}
                        symbol={allData[d].currency[f].symbol}
                        name={allData[d].currency[f].name}
                        currencyId={allData[d].currency[f].currencyId}
                        exchangeSymbol={allData[d].currency[f].exchangeSymbol}
                        minimumBalance={allData[d].currency[f].minimumBalance}
                      />
                    ),
                    modalTitle: "Edit Echange Currency",
                    showModal: true,
                  });
                }}
              >
                Edit
              </Button>
            </>
          ),
        };
        returnData.push(obj);
      });
    });
    return returnData;
  }

  renderExchangeData(allData) {
    let returnData = [];
    for (let i = 0; i < allData.length; i++) {
      let data = allData[i];
      let cnt = 0;
      let obj = {
        id: i + "",
        exchange: data.exchange,
        pairs: (
          <ul className="u-no-list">
            {data.pair.map(({ name }) => (
              <li key={cnt++}>{name}</li>
            ))}
          </ul>
        ),
        tradeFee: data.tradeFee,
        disabled: data.disabled,
      };
      returnData.push(obj);
    }
    return returnData;
  }

  renderExchangeInfoData(allData) {
    let returnData = [];
    let c = 0;
    for (let i = 0; i < allData.length; i++) {
      let data = allData[i];

      returnData = [
        ...returnData,
        ...data.pair.map(
          ({
            name,
            decimalsAmount = "Default",
            decimalsPrice = "Default",
            minAmount = "Default",
            maxAmount = "Default",
          }) => {
            let obj = {
              id: c++ + "",
              exchange: data.exchange,
              pair: name,
              decimalsAmount,
              decimalsPrice,
              minAmount,
              maxAmount,
            };
            return obj;
          }
        ),
      ];
    }
    return returnData;
  }

  render() {
    return (
      <div className="management main-panel">
        <div className="section-title">Exchange Cron Management</div>
        <Row>
          <Col className="u-position-sticky" md={6} lg={6} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--header">Exchange Table</div>
              <div className="simple-card--body">
                <StaticTable
                  columns={columns}
                  renderData={this.renderExchangeData}
                  data={this.props.exchangeReducer.status.data}
                  prepopulatedData={prepopulatedExchange}
                />
              </div>
            </Card>
            <Card className="simple-card">
              <div className="simple-card--header">Exchange Pair Info</div>
              <div className="simple-card--body">
                <StaticTable
                  columns={columnsPairDecimals}
                  renderData={this.renderExchangeInfoData}
                  data={this.props.exchangeReducer.status.data}
                  prepopulatedData={prepopulatedExchange}
                />
              </div>
            </Card>
            <div className="u-float-right">
              <Button onClick={this.props.getExchanges}>Refresh</Button>
            </div>
          </Col>
          <Col md={6} lg={6} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--header">Add Exchange</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Exchange Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="name of the exchange"
                        value={this.state.exchange.addExchange.exchange}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              addExchange: {
                                ...this.state.exchange.addExchange,
                                exchange: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Trade Fee"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="trade fee of exchange"
                        value={this.state.exchange.addExchange.tradeFee}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              addExchange: {
                                ...this.state.exchange.addExchange,
                                tradeFee: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <div className="u-float-right">
                    <Button
                      onClick={() => {
                        this.props.addExchange(this.state.exchange.addExchange);
                      }}
                    >
                      Add Exchange
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>

            <Card className="simple-card">
              <div className="simple-card--header">Add Exchange Pair</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Exchange Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="name of the exchange"
                        value={this.state.exchange.addExchangePair.exchange}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              addExchangePair: {
                                ...this.state.exchange.addExchangePair,
                                exchange: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Minimum Amount"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="min amount of the pair-exchange"
                        value={this.state.exchange.addExchangePair.minAmount}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              addExchangePair: {
                                ...this.state.exchange.addExchangePair,
                                minAmount: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Maximum Amount"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="max amount of the pair-exchange"
                        value={this.state.exchange.addExchangePair.maxAmount}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              addExchangePair: {
                                ...this.state.exchange.addExchangePair,
                                maxAmount: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Decimals Amount"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="decimals in amount"
                        value={
                          this.state.exchange.addExchangePair.decimalsAmount
                        }
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              addExchangePair: {
                                ...this.state.exchange.addExchangePair,
                                decimalsAmount: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Decimals Price"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="decimals in price"
                        value={
                          this.state.exchange.addExchangePair.decimalsPrice
                        }
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              addExchangePair: {
                                ...this.state.exchange.addExchangePair,
                                decimalsPrice: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Pair Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="name of the pair"
                        value={this.state.exchange.addExchangePair.pair}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              addExchangePair: {
                                ...this.state.exchange.addExchangePair,
                                pair: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <div className="u-float-right">
                    <Button
                      onClick={() =>
                        this.props.addExchangePair(
                          this.state.exchange.addExchangePair
                        )
                      }
                    >
                      Add Pair
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>

            <Card className="simple-card">
              <div className="simple-card--header">
                Update Exchange Pair Decimals
              </div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Exchange Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="name of the exchange"
                        value={this.state.exchange.updateExchangePair.exchange}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              updateExchangePair: {
                                ...this.state.exchange.updateExchangePair,
                                exchange: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Minimum Amount"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="min amount of the pair-exchange"
                        value={this.state.exchange.updateExchangePair.minAmount}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              updateExchangePair: {
                                ...this.state.exchange.updateExchangePair,
                                minAmount: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Decimals Amount"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="decimals in amount"
                        value={
                          this.state.exchange.updateExchangePair.decimalsAmount
                        }
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              updateExchangePair: {
                                ...this.state.exchange.updateExchangePair,
                                decimalsAmount: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Decimals Price"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="decimals in price"
                        value={
                          this.state.exchange.updateExchangePair.decimalsPrice
                        }
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              updateExchangePair: {
                                ...this.state.exchange.updateExchangePair,
                                decimalsPrice: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Pair Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="name of the pair"
                        value={this.state.exchange.updateExchangePair.pair}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              updateExchangePair: {
                                ...this.state.exchange.updateExchangePair,
                                pair: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <div className="u-float-right">
                    <Button
                      onClick={() =>
                        this.props.updateExchangePair(
                          this.state.exchange.updateExchangePair
                        )
                      }
                    >
                      Update Pair
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>

            {/* <Card className="simple-card">
              <div className="simple-card--header">Update Exchange Fee</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Exchange Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="name of the exchange"
                        value={this.state.exchange.updateTradeFee.exchange}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              updateTradeFee: {
                                ...this.state.exchange.updateTradeFee,
                                exchange: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />

                  <RenderInput
                    label="Trade Fee"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="trade fee in percent"
                        value={this.state.exchange.updateTradeFee.tradeFee}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              updateTradeFee: {
                                ...this.state.exchange.updateTradeFee,
                                tradeFee: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />

                  <div className="u-float-right">
                    <Button
                      onClick={() =>
                        this.props.updateExchangeFee(
                          this.state.exchange.updateTradeFee
                        )
                      }
                    >
                      Update Fee
                    </Button>
                  </div>
                </Form>
              </div>
            </Card> */}

            <Card className="simple-card">
              <div className="simple-card--header">Activate Exchange</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Exchange Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="name of the exchange"
                        value={this.state.exchange.activateExchange.exchange}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              activateExchange: {
                                ...this.state.exchange.activateExchange,
                                exchange: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />

                  <div className="u-float-right">
                    <Button
                      onClick={() =>
                        this.props.activateExchange(
                          this.state.exchange.activateExchange
                        )
                      }
                    >
                      Activate Exchange
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>

            <Card className="simple-card">
              <div className="simple-card--header">Deactivate Exchange</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Exchange Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="name of the exchange"
                        value={this.state.exchange.deactivateExchange.exchange}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              deactivateExchange: {
                                ...this.state.exchange.deactivateExchange,
                                exchange: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />

                  <div className="u-float-right">
                    <Button
                      onClick={() =>
                        this.props.deactivateExchange(
                          this.state.exchange.deactivateExchange
                        )
                      }
                    >
                      Deactivate Exchange
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>
          </Col>
        </Row>
        <hr />
        <div className="section-title">Exchange Currency Management</div>
        <Row>
          <Col md={6} lg={6} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--header">Exchange Currency Info</div>
              <div className="simple-card--body">
                <DataTable
                  tableClass="static-table"
                  columns={exchangeCurrencyColumns}
                  emptyData={EmptyData}
                  renderData={this.renderCurrencyInfo}
                  exchangeCurrencyUpdate={this.props.exchangeCurrencyUpdate}
                  data={this.props.exchangeReducer.getCurrency.data}
                  prepopulatedData={prepopulatedExchange}
                  sizePerPage={6}
                />
              </div>
            </Card>
            <div className="u-float-right">
              <Button onClick={this.props.getExchangeCurrency}>Refresh</Button>
            </div>
          </Col>
          <Col md={6} lg={6} sm={12}>
            <Card className="simple-card">
              <div className="simple-card--header">Add Exchange Currency</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Exchange"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Enter Exchange"
                        value={this.state.exchange.exchangeAdd.exchange}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              exchangeAdd: {
                                ...this.state.exchange.exchangeAdd,
                                exchange: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <div className="u-float-right">
                    <Button
                      onClick={() =>
                        this.props.exchangeCurrencyAdd({
                          exchange: this.state.exchange.exchangeAdd.exchange,
                        })
                      }
                    >
                      Add Exchange
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>
            <Card className="simple-card">
              <div className="simple-card--header">Exchange Currency Info</div>
              <div className="simple-card--body">
                <Form>
                  <RenderInput
                    label="Exchange Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Enter Exchange"
                        value={this.state.exchange.currency.exchange}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              currency: {
                                ...this.state.exchange.currency,
                                exchange: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Symbol"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Enter Symbol"
                        value={this.state.exchange.currency.symbol}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              currency: {
                                ...this.state.exchange.currency,
                                symbol: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Currency Name"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Enter Currency Name"
                        value={this.state.exchange.currency.name}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              currency: {
                                ...this.state.exchange.currency,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Exchange Symbol"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Enter Symbol"
                        value={this.state.exchange.currency.exchangeSymbol}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              currency: {
                                ...this.state.exchange.currency,
                                exchangeSymbol: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <RenderInput
                    label="Minimum Balance"
                    element={
                      <Form.Control
                        type="text"
                        placeholder="Enter Minimum Balance"
                        value={this.state.exchange.currency.minimumBalance}
                        onChange={(e) =>
                          this.setState({
                            exchange: {
                              ...this.state.exchange,
                              currency: {
                                ...this.state.exchange.currency,
                                minimumBalance: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    }
                  />
                  <div className="u-float-right">
                    <Button
                      onClick={() =>
                        this.props.addExchangeCurrency({
                          name: this.state.exchange.currency.name,
                          symbol: this.state.exchange.currency.symbol,
                          exchange: this.state.exchange.currency.exchange,
                          exchangeSymbol:
                            this.state.exchange.currency.exchangeSymbol,
                          minimumBalance:
                            this.state.exchange.currency.minimumBalance,
                        })
                      }
                    >
                      Add Currency
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

function mapStateToProps({ exchangeReducer, arbitrageReducer }) {
  return {
    exchangeReducer,
    arbitrageReducer,
  };
}

function mapDisptachToProps(dispatch) {
  return {
    getExchanges: () => dispatch(actions.GetExchanges()),
    addExchange: (data) => dispatch(actions.AddExchange(data)),
    addExchangePair: (data) => dispatch(actions.AddExchangePair(data)),
    activateExchange: (data) => dispatch(actions.ActivateExchange(data)),
    deactivateExchange: (data) => dispatch(actions.DeactivateExchange(data)),
    updateExchangeFee: (data) => dispatch(actions.ExchangeUpdateFee(data)),
    getArbitrageOperation: () => dispatch(actions.GetArbitrage()),
    updateExchangePair: (data) => dispatch(actions.UpdateExchangePair(data)),
    addExchangeCurrency: (data) => dispatch(actions.AddExchangeCurrency(data)),
    getExchangeCurrency: () => dispatch(actions.GetExchangeCurrency()),
    exchangeCurrencyAdd: (data) => dispatch(actions.ExchangeCurrencyAdd(data)),
    exchangeCurrencyUpdate: (data) =>
      dispatch(actions.ExchangeCurrencyUpdate(data)),
  };
}

export default connect(mapStateToProps, mapDisptachToProps)(Management);
