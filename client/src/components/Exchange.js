import React, { Component } from "react";
import { connect } from "react-redux";
import { RemoveExpo, CurrencyDecimalsAmount } from "../helpers/constant";

class PairPriceClass extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let n = this.props.value;
    let pair = this.props.pair;
    let exchange = this.props.exchange;

    if (
      this.props.exchangeReducer.status &&
      this.props.exchangeReducer.status.exchangePairDecimals[exchange] &&
      this.props.exchangeReducer.status.exchangePairDecimals[exchange][pair]
    ) {
      n = parseFloat(n).toFixed(
        this.props.exchangeReducer.status.exchangePairDecimals[exchange][pair]
          .decimalsPrice
      );
    }
    return <>{RemoveExpo(n)}</>;
  }
}

class PairAmountClass extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let n = this.props.value;
    let pair = this.props.pair;
    let exchange = this.props.exchange;

    let className = "";

    if (
      this.props.exchangeReducer.status &&
      this.props.exchangeReducer.status.exchangePairDecimals[exchange] &&
      this.props.exchangeReducer.status.exchangePairDecimals[exchange][pair]
    ) {
      n = parseFloat(n).toFixed(
        this.props.exchangeReducer.status.exchangePairDecimals[exchange][pair]
          .decimalsAmount
      );
      if (
        n <
        this.props.exchangeReducer.status.exchangePairDecimals[exchange][pair]
          .minAmount
      )
        className = "lighten";
    }

    return <span className={className}>{RemoveExpo(n)}</span>;
  }
}

class CurrencyAmountClass extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let n = this.props.value;
    let currency = this.props.currency;

    let className = "";

    if (
      CurrencyDecimalsAmount[currency] !== null ||
      CurrencyDecimalsAmount[currency] !== undefined
    ) {
      n = parseFloat(n).toFixed(CurrencyDecimalsAmount[currency]);
    } else {
      n = parseFloat(n).toFixed(2);
    }
    
    return <span className={className}>{RemoveExpo(n)}</span>;
  }
}

function mapStateToProps({ exchangeReducer }) {
  return { exchangeReducer };
}

const components = [PairAmountClass, PairPriceClass];
const connectedComponents = components.map(connect(mapStateToProps));
const [ConnectedPairAmount, ConnectedPairPrice] = connectedComponents;

export const PairAmount = ConnectedPairAmount;
export const PairPrice = ConnectedPairPrice;
export const CurrencyAmount = CurrencyAmountClass;
