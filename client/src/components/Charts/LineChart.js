import React, { Component } from "react";
import ChartistGraph from "react-chartist";

let initalState = {
  // data: 0
  data: {
    labels: [1, 2, 3, 4, 5, 6, 7, 8],
    series: [[5, 9, 7, 8, 5, 3, 5, 11]],
  },
  options: {
    height: "50vh",
    showArea: true,
  },
  type: "Line",
};

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = initalState;
  }

  /**
   * 
   */

  componentDidMount() {
    setInterval(() => {
      this.setState({
        data: {
          ...this.state.data,
          series: [
            this.state.data.series[0].map((e) => {
              return e + Math.sign(0.5 * Math.random()) * Math.random();
            }),
          ],
        },
      });
    }, 2000);
  }

  render() {
    return (
      <div>
        <ChartistGraph
          data={this.props.data || this.state.data}
          options={this.props.options || this.state.options}
          type={this.props.type || this.state.type}
        />
      </div>
    );
  }
}

export default Chart;
