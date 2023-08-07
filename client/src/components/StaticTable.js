import React, { Component } from "react";

import BootstrapTable from "react-bootstrap-table-next"; // React Bootstrap Table Next
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
} from "react-bootstrap-table2-paginator";

class DataTable extends Component {
  constructor(props) {
    super(props);
    this.renderData = this.props.renderData.bind(this);
  }

  render() {
    let tableData = [];
    if (!this.props.data) {
      tableData = this.props.prepopulatedData;
    } else if (this.props.data && this.props.data.length === 0) {
      tableData = this.props.emptyData || [];
    } else {
      tableData =
        this.renderData(this.props.data) || this.props.prepopulatedData;
    }
    let columns = this.props.columns;

    return (
      <div>
        <div>
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
              <div className="static-table">
                <div>
                  {/* <PaginationListStandalone {...paginationProps} /> */}

                  <BootstrapTable
                    keyField="id"
                    data={tableData}
                    columns={columns}
                    {...paginationTableProps}
                    rowStyle={this.props.rowStyle}
                  />
                </div>
                <div>{this.props.tableFooter || <></>}</div>
              </div>
            )}
          </PaginationProvider>
        </div>
      </div>
    );
  }
}

export default DataTable;
