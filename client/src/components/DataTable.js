import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import QRCode from "qrcode.react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";

import BootstrapTable from "react-bootstrap-table-next"; // React Bootstrap Table Next
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";

import * as actions from "../actions/index";
import xdc_favicon from "../assets/img/xdcFavicons/favicon.ico";
import { AddNoti, RemoveNoti } from "../helpers/Notification";
import RouteButton from "../hooks/RouteButton";
import PaymentModal from "../helpers/PaymentModal";

const { SearchBar } = Search;

const initialState = {
  tableData: null,
  showDescModal: false,
  showPayXdcModal: false,
  payXdcAddr: "",
  payXdcAmt: null,
  descData: null,
  processingXdc: false,
  selectedRows: [],
  allSelected: false,
};

class DataTable extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.renderData = this.props.renderData.bind(this);
  }

  render() {
    let tableData;
    if (!this.props.data) {
      tableData = this.props.prepopulatedData;
    } else if (this.props.data && this.props.data.length === 0) {
      tableData = this.props.emptyData;
    } else {
      tableData =
        this.renderData(this.props.data) || this.props.prepopulatedData;
    }
    let columns = this.props.columns;

    let returnArray = [];
    let selectedRows = this.state.selectedRows;
    const tableClass = this.props.tableClass || "table-one";

    for (let i = 0; i < selectedRows.length; i++) {
      if (selectedRows[i] === true) {
        returnArray.push(i + "");
      }
    }

    let selectRow = {
      mode: "checkbox",
      clickToSelect: false,
      onSelect: (row, isSelect, rowIndex, e) => {
        let selectedRows = this.state.selectedRows;
        selectedRows[rowIndex + ""] = isSelect;
        this.setState({ selectedRows });
        // console.log("selectedRows: ", selectedRows);
      },
      onSelectAll: (isSelect, rows, e) => {
        let selectedRows = this.state.selectedRows;
        let allSelected = this.state.allSelected;

        allSelected = isSelect;
        for (let i = 0; i < selectedRows.length; i++) {
          selectedRows[i] = isSelect;
        }
        this.setState({ selectedRows, allSelected });
      },
      selected: returnArray,
    };

    return (
      <div>
        <div className="dashboard">
          {/**
           * --------------------------------------------------------------------------
           *
           * Table Starts
           *
           * --------------------------------------------------------------------------
           */}

          <PaginationProvider
            pagination={paginationFactory({
              paginationSize: 4,
              pageStartIndex: 1,
              hideSizePerPage: true,
              firstPageText: "First",
              prePageText: "Back",
              nextPageText: "Next",
              lastPageText: "Last",
              nextPageTitle: "First page",
              prePageTitle: "Pre page",
              firstPageTitle: "Next page",
              lastPageTitle: "Last page",
              showTotal: true,
              disablePageTitle: true,
              sizePerPage: this.props.sizePerPage || 10,
            })}
          >
            {({ paginationProps, paginationTableProps }) => (
              <div className={tableClass}>
                <div>
                  {/* <PaginationListStandalone {...paginationProps} /> */}
                  <ToolkitProvider
                    keyField="id"
                    columns={columns}
                    data={tableData}
                    search
                  >
                    {(toolkitprops) => (
                      <>
                        <SearchBar {...toolkitprops.searchProps} />
                        {this.props.selectableRows ? (
                          <BootstrapTable
                            keyField="id"
                            data={tableData}
                            columns={columns}
                            selectRow={selectRow}
                            {...toolkitprops.baseProps}
                            {...paginationTableProps}
                            rowStyle={this.props.rowStyle}
                          />
                        ) : (
                          <BootstrapTable
                            keyField="id"
                            data={tableData}
                            columns={columns}
                            {...toolkitprops.baseProps}
                            {...paginationTableProps}
                            rowStyle={this.props.rowStyle}
                            rowClasses={this.props.rowClasses}
                          />
                        )}
                      </>
                    )}
                  </ToolkitProvider>
                </div>
                <div>{this.props.tableFooter || <></>}</div>
              </div>
            )}
          </PaginationProvider>

          {/**
           * --------------------------------------------------------------------------
           *
           * Table Stops
           *
           * --------------------------------------------------------------------------
           */}

          <Modal
            onHide={() => {
              this.setState({ descData: null, showModal: false });
            }}
            show={this.state.showModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            dialogClassName="description-modal blockdegree-modal"
          >
            <Modal.Header className="description-modal__header" closeButton>
              <Modal.Title className="description-modal__header--title">
                {this.state.modalTitle || "Form"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="description-modal__body">
              <div>{this.state.modalForm}</div>
            </Modal.Body>
          </Modal>

          <Modal
            onHide={() => {
              this.setState({
                payXdcAddr: "",
                amountUsd: null,
                amountXdc: null,
                showPayXdcModal: false,
              });
            }}
            show={this.state.showPayXdcModal}
            size="lg"
            dialogClassName="qr-modal blockdegree-modal"
          >
            <Modal.Header className="qr-modal__header" closeButton>
              <Modal.Title className="qr-modal__header--title">
                Pay By XDC
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="qr-modal__body">
              <div className="qr-modal__body--pretext">
                Send Amount&nbsp;
                <strong>
                  <span>{this.state.payXdcAmt}</span>&nbsp;XDC coin
                </strong>
                &nbsp; to the address below using your&nbsp;
                <strong>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.xdcwallet&hl=en_IN"
                    target="_blank"
                  >
                    XDC Wallet
                  </a>
                </strong>
              </div>
              <div className="qr-modal__body--wrap">
                <div className="qr-modal__body--img">
                  <QRCode value={this.state.payXdcAddr} />
                </div>
                <div className="address">{this.state.payXdcAddr}</div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "xdc687B8b567D12d2564141cbe5d44a5f04DFd9Ba5a"
                    );
                    AddNoti("Copied", "XDC Address Copied", {
                      type: "info",
                      duration: 1000,
                    });
                  }}
                  className="copy-btn"
                >
                  Copy
                </Button>
              </div>
              <hr />
              <div>
                <div>
                  Don't have&nbsp;
                  <strong>
                    XDC&nbsp;
                    <img src={xdc_favicon}></img>
                    &nbsp;
                  </strong>
                  ?&nbsp;Buy from{" "}
                  <a href="https://alphaex.net" target="_blank">
                    AlphaEx
                  </a>{" "}
                  or{" "}
                  <a href="https://stex.com" target="_blank">
                    Stex
                  </a>
                </div>
              </div>
              <div>
                Download XDC Wallet&nbsp;
                <a
                  href="https://play.google.com/store/apps/details?id=com.xdcwallet&hl=en_IN"
                  target="_blank"
                >
                  Android
                </a>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    );
  }
}

export default DataTable;
