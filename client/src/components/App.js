import React from "react";
import { connect } from "react-redux";
import { Redirect, Switch, Route } from "react-router-dom";
import "../assets/scss/main.scss";
import Header from "../containers/Header";
import Dashboard from "../containers/Dashboard";
import SignUp from "../containers/Signup";
import Login from "../containers/Login";
import ReactNotification from "react-notifications-component";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";

import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

import "react-notifications-component/dist/theme.css";
import "react-toastify/dist/ReactToastify.css";

import ReactTooltip from "react-tooltip";

// import LineChart from "./Charts/LineChart";
// import ResistanceCard from "./ResistanceCard";

import Management from "../containers/Management";
import Monitor from "../containers/Monitor";
import Sidebar from "../containers/Sidebar";
import AdminManagement from "../containers/AdminManagement";
import AdminProfile from "../containers/AdminProfile";
import DailyStats from "../containers/DailyStats";
import Liquidity from "./Liquidity";
import ManageKeys from "./ManageKeys";
import LiquidityDetails from "./LiquidityDetails";
// import OrderBookSharing from "../containers/OrderBookSharing";

class App extends React.Component {
  renderSwitch() {
    if (this.props.auth.isLoggedIn) {
      return (
        <Switch>
          <Route exact path="/" component={Dashboard} />
          {/* <Route exact path="/signup" component={SignUp} /> */}
          <Route exact path="/login" component={Login} />
          {/* <Route exact path="/chart" component={LineChart} /> */}
          <Route exact path="/monitor" component={Monitor} />
          <Route exact path="/management" component={Management} />
          {/* <Route exact path="/admin-management" component={AdminManagement} /> */}
          {/* <Route exact path="/admin-profile" component={AdminProfile} /> */}
          <Route exact path="/daily-stats" component={DailyStats} />
          <Route exact path="/liquidity" component={Liquidity} />
          <Route exact path="/manage-keys" component={ManageKeys} />
          <Route
            path="/liquidity-details/:uniqueId"
            component={LiquidityDetails}
          />
          <Redirect from="*" to="/" />
        </Switch>
      );
    } else {
      return (
        <>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            {/* <Route exact path="/signup" component={SignUp} /> */}
            <Route exact path="/login" component={Login} />
            <Redirect from="*" to="/" />
          </Switch>
        </>
      );
    }
  }

  render() {
    return (
      <div className="App">
        <ReactNotification />
        <ToastContainer />
        <ReactTooltip delayShow={1000} place="right" />
        <Header />
        <Sidebar />
        {this.renderSwitch()}
        {/* <Route exact path="/404" component={NotFound} /> */}
        {/* <Footer /> */}
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps, null)(App);
