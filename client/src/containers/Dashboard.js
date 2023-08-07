import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Switch, Route } from "react-router-dom";

class DashboardContainer extends Component {
  componentWillMount() {}

  render() {
    if (this.props.auth.isLoggedIn === true) {
      return <Redirect to="/liquidity" />;
    } else {
      return <Redirect to="/login" />;
    }
  }
}

function mapStateToProps({ auth, siteStats }) {
  return { auth, siteStats };
}

export default connect(mapStateToProps, null)(DashboardContainer);
