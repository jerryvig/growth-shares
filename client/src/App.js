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
import Paper from 'material-ui/Paper';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import './App.css';

class RevenueGrowthRow extends Component {
  constructor() {
    super();
    this.state = {};
    
    this.textStyle = {
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      textAlign: 'left',
      fontWeight: 'bold',
      fontSize: 'medium',
    };

    this.numberStyle = {
      whiteSpace: 'normal',
      textAlign: 'right',
      fontWeight: 'bold',
      fontSize: 'medium',
    }
  }

  render() {
    let row = this.props.row;
    return (
      <TableRow key={row.ticker} >
        <TableRowColumn style={ this.textStyle }>
          { row.ticker }
        </TableRowColumn>
        <TableRowColumn style={ this.textStyle }>
          { row.companyName }
        </TableRowColumn>
        <TableRowColumn style={ this.numberStyle }>
          { row.ttmRevenue }
        </TableRowColumn>
        <TableRowColumn style={ this.numberStyle }>
          { row.ttmGrowth }
        </TableRowColumn>
        <TableRowColumn style={ this.numberStyle }>
          { row.mean }
        </TableRowColumn>
        <TableRowColumn style={ this.numberStyle }>
          { row.stdev }
        </TableRowColumn>
        <TableRowColumn style={ this.numberStyle }>
          { row.cum_growth }
        </TableRowColumn>
        <TableRowColumn style={ this.numberStyle }>
          { row.sharpe_ratio }
        </TableRowColumn>
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
      color: 'black',
      fontWeight: 'bold',
      fontSize: 'medium',
    };

    this.cardStyle = {
      width: '96%',
      margin: 'auto',
      textAlign: 'center',
      marginTop: '1%'
    };

    this.cardHeaderStyle = {
      textAlign: 'center',
      color: 'black',
      fontWeight: 'bold'
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
      <Card style={ this.cardStyle } zDepth={2}>
        <CardHeader style={ this.cardHeaderStyle } title="Revenue Growth Statistics"></CardHeader>
      <Table height={ window.innerHeight*0.7 } fixedHeader={true} fixedFooter={true}>
        <TableHeader enableSelectAll={ false } displaySelectAll={ false } fixedHeader={ true }>
          <TableRow>
            <TableHeaderColumn style={ this.headerStyle }>
              Ticker
            </TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }>
              Company Name
            </TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }>
              Trailing 12 Mo. Revenue
            </TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }>
              Trailing 12 Mo. Growth
            </TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }>
              5 Yr. Mean Growth
            </TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }>
              5 Yr. Growth Standard Deviation
            </TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }>
              5 Yr. Cumulative Growth
            </TableHeaderColumn>
            <TableHeaderColumn style={ this.headerStyle }>
              Sharpe Ratio
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody stripedRows={ true }>
          {this.state.rows.map((row) => 
            <RevenueGrowthRow row={row}></RevenueGrowthRow>
          )}
        </TableBody>
      </Table>
      </Card>
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
