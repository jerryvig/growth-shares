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
    
    this.textStyle = {
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      textAlign: 'left',
    };

    this.numberStyle = {
      whiteSpace: 'normal',
      textAlign: 'right',
    }
  }

  render() {
    let row = this.props.row;
    return (
      <TableRow key={row.ticker} >
        <TableRowColumn style={ this.numberStyle }><strong><h3>{ row.index }</h3></strong></TableRowColumn>
        <TableRowColumn style={ this.textStyle }><strong><h3>{ row.ticker }</h3></strong></TableRowColumn>
        <TableRowColumn style={ this.textStyle }><strong><h3>{ row.companyName }</h3></strong></TableRowColumn>
        <TableRowColumn style={ this.numberStyle }><strong><h3>{ row.ttmRevenue }</h3></strong></TableRowColumn>
        <TableRowColumn style={ this.numberStyle }><strong><h3>{ row.ttmGrowth }</h3></strong></TableRowColumn>
        <TableRowColumn style={ this.numberStyle }><strong><h3>{ row.mean }</h3></strong></TableRowColumn>
        <TableRowColumn style={ this.numberStyle }><strong><h3>{ row.stdev }</h3></strong></TableRowColumn>
        <TableRowColumn style={ this.numberStyle }><strong><h3>{ row.cum_growth }</h3></strong></TableRowColumn>
        <TableRowColumn style={ this.numberStyle }><strong><h3>{ row.sharpe_ratio }</h3></strong></TableRowColumn>
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

    this.headerStyle = {
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      textAlign: 'left',
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
      <Table fixedHeader={true}>
        <TableHeader enableSelectAll={ false } displaySelectAll={ false }>
          <TableRow>
            <TableHeaderColumn colSpan="9" tooltip="Super Header" style={{textAlign: 'center'}}>
               <h2>Revenue Growth Statistics</h2>
            </TableHeaderColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn style={ this.headerStyle }><strong><h2>#</h2></strong></TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }><strong><h2>Ticker</h2></strong></TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }><strong><h2>Company Name</h2></strong></TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }><strong><h2>Trailing 12 Mo. Revenue</h2></strong></TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }><strong><h2>Trailing 12 Mo. Growth</h2></strong></TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }><strong><h2>5 Yr. Mean Growth</h2></strong></TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }><strong><h2>5 Yr. Growth Standard Deviation</h2></strong></TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }><strong><h2>5 Yr. Cumulative Growth</h2></strong></TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }><strong><h2>Sharpe Ratio</h2></strong></TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody stripedRows={ true }>
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
