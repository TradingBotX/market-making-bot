import React from "react";
import { connect } from "react-redux";
import { Button } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faGlobe,
  faChartArea,
  faGripLines,
  faUserShield,
  faAnkh,
  faPoll,
  faUserLock,
  faUserCog,
  faPercent,
  faCalendarDay,
  faBahai,
  faDollarSign,
  faKey,
} from "@fortawesome/free-solid-svg-icons";

import SuperAdminComponent from "../components/SuperAdminComponent";

import RouteButton from "../hooks/RouteButton";

class Sidebar extends React.Component {
  constructor() {
    super();

    this.state = {
      sidebarCollapsed: false,
      activeLink: null,
    };
  }

  renderRouteButton(title, icon, to, onClick = null) {
    let className = "sidebar-nav";

    const url = document.location.pathname;

    if (url === to) {
      className += " sidebar-nav__active";
    }

    return (
      <RouteButton
        value={
          <div className={className} data-tip={title}>
            <div className="sidebar-nav--icon">
              <FontAwesomeIcon icon={icon} />
            </div>
            <div className="sidebar-nav--text no-select">{title}</div>
          </div>
        }
        to={to}
        onClick={onClick}
      />
    );
  }

  render() {
    let sidebarClass = "sidebar";

    if (!this.state.sidebarCollapsed) {
      sidebarClass += " sidebar-open";
    }

    if (!this.props.auth.isLoggedIn) sidebarClass += " sidebar-none";
    return (
      <div className={sidebarClass}>
        <div className="sidebar__nav-wrapper">
          {this.renderRouteButton(
            "Add Liquidity",
            faDollarSign,
            "/liquidity",
            () => {
              this.setState({ activeLink: "/liquidity" });
            }
          )}

          {this.renderRouteButton(
            "Management",
            faUserShield,
            "/management",
            () => {
              this.setState({ activeLink: "/management" });
            }
          )}

          {this.renderRouteButton("Manage Key", faKey, "/manage-keys", () =>
            this.setState({ activeLink: "/manage-keys" })
          )}

          {this.renderRouteButton(
            "Admin Profile",
            faUserCog,
            "/admin-profile",
            () => {
              this.setState({ activeLink: "/admin-profile" });
            }
          )}

          {this.renderRouteButton(
            "Daily Stats",
            faCalendarDay,
            "/daily-stats",
            () => {
              this.setState({ activeLink: "/daily-stats" });
            }
          )}

          <SuperAdminComponent
            element={this.renderRouteButton(
              "Admin",
              faUserLock,
              "/admin-management",
              () => {
                this.setState({ activeLink: "/admin-management" });
              }
            )}
          />

          {this.renderRouteButton("Monitor", faChartArea, "/monitor", () => {
            this.setState({ activeLink: "/monitor" });
          })}
        </div>

        <div>
          <Button
            className="sidebar-toggle"
            onClick={() => {
              if (this.state.sidebarCollapsed) {
                document.documentElement.style.setProperty(
                  "--sidebar-width",
                  "20rem"
                );
              } else {
                document.documentElement.style.setProperty(
                  "--sidebar-width",
                  "7rem"
                );
              }
              this.setState({ sidebarCollapsed: !this.state.sidebarCollapsed });
            }}
          >
            <FontAwesomeIcon icon={faGripLines}></FontAwesomeIcon>
          </Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps, null)(Sidebar);
