import React, { Component } from "react";
import { connect } from "react-redux";

class SuperAdminComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let element = <></>;
    if (
      this.props.auth.isLoggedIn == true &&
      this.props.auth.data.level === 2
    ) {
      element = <>{this.props.element}</>;
    }
    return <>{element}</>;
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps, null)(SuperAdminComponent);
