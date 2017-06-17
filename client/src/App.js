import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import './App.css';

class RevenueGrowthRow extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    let row = this.props.row;
    return (
      <TableRow key={row.ticker}>
        <TableRowColumn><strong>{row.index}</strong></TableRowColumn>
        <TableRowColumn><strong>{row.ticker}</strong></TableRowColumn>
        <TableRowColumn><strong>{row.ttm}</strong></TableRowColumn>
        <TableRowColumn><strong>{row.mean}</strong></TableRowColumn>
        <TableRowColumn><strong>{row.stdev}</strong></TableRowColumn>
        <TableRowColumn><strong>{row.cum_growth}</strong></TableRowColumn>
        <TableRowColumn><strong>{row.sharpe_ratio}</strong></TableRowColumn>
      </TableRow>
    );
  }
}

class RevenueGrowthTable extends Component {
  constructor() {
    super();
    this.state = {
      'rows': [],
    };
  }

  componentDidMount() {
    fetch('/revenue_growth_stats')
      .then(res => res.json())
      .then(rows => this.setState({
        'rows': rows
      }));
  }

  render() {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn><strong>#</strong></TableHeaderColumn>
            <TableHeaderColumn><strong>Ticker</strong></TableHeaderColumn>
            <TableHeaderColumn><strong>TTM Growth</strong></TableHeaderColumn>
            <TableHeaderColumn><strong>5 Yr. Mean Growth</strong></TableHeaderColumn>
            <TableHeaderColumn><strong>5 Yr. Growth Standard Deviation</strong></TableHeaderColumn>
            <TableHeaderColumn><strong>5 Yr. Cumulative Growth</strong></TableHeaderColumn>
            <TableHeaderColumn><strong>Sharpe Ratio</strong></TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.state.rows.map((row) => 
            <RevenueGrowthRow row={row}></RevenueGrowthRow>
          )}
        </TableBody>
      </Table>
    )
  }
}

class TickerListRow extends Component {
  constructor() {
    super()
    this.state = {};
  }

  render() {
    let row = this.props.row;
    return (
      <TableRow>
        <TableRowColumn>{row.index}</TableRowColumn>
        <TableRowColumn>{row.ticker}</TableRowColumn>
        <TableRowColumn>{row.companyName}</TableRowColumn>
        <TableRowColumn>{row.exchange}</TableRowColumn>
      </TableRow>
    );
  }
}

class TickerListTable extends Component {
  constructor() {
    super();
    this.state = {
      'rows': [],
    };
  }

  componentDidMount() {
    fetch('/ticker_list')
      .then(res => res.json())
      .then(rows => this.setState({
        'rows': rows
      }));
  }

  render() {
    return (
      <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>#</TableHeaderColumn>
              <TableHeaderColumn>Ticker</TableHeaderColumn>
              <TableHeaderColumn>Company Name</TableHeaderColumn>
              <TableHeaderColumn>Exchange</TableHeaderColumn>
            </TableRow>
          </TableHeader>
        <TableBody>
          {this.state.rows.map((row) => 
            <TickerListRow row={row}></TickerListRow>
          )}
        </TableBody>
      </Table>
    );
  }
}

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      rows: [],
    };
  }

  render() {
    return (
      <div className="App">
        <MuiThemeProvider>
          {/* <TickerListTable></TickerListTable> */}
          <RevenueGrowthTable></RevenueGrowthTable>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
