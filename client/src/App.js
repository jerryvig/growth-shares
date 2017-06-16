import React, { Component } from 'react';
import './App.css';

class TickerListRow extends Component {
  constructor() {
    super()
    this.state = {};
  }

  render() {
    return (
      <tr key={this.props.ticker}>
        <td>{this.props.index}</td>
        <td>{this.props.ticker}</td>
        <td>{this.props.companyName}</td>
        <td>{this.props.exchange}</td>
      </tr>
    );
  }
}

class TickerListTable extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Symbol</th>
            <th>Company Name</th>
            <th>Exchange</th>
          </tr>
        </thead>
        <tbody>
          {this.props.rows.map(row => 
            <TickerListRow index={row.index} ticker={row.ticker} companyName={row.companyName} exchange={row.exchange} />
          )}
        </tbody>
      </table>
    );
  }
}

class App extends Component {
  state = {
    rows: []
  };

  componentDidMount() {
    fetch('/ticker_list')
      .then(res => res.json())
      .then(rows => this.setState({ rows }));
  }

  render() {
    return (
      <div className="App">
        <TickerListTable rows={this.state.rows} />
      </div>
    );
  }
}

export default App;
