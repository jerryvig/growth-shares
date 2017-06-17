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


class RevenueGrowthTable extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    
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
          <TickerListTable></TickerListTable>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
