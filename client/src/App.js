import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import Paper from 'material-ui/Paper';
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
      marginTop: '1%'
    };

    this.cardHeaderStyle = {
      textAlign: 'center',
      color: 'black',
      fontWeight: 'bold',
      fontSize: 'medium',
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
      <Card style={ this.cardStyle } zDepth={ 2 }>
        <CardHeader style={ this.cardHeaderStyle } title="Revenue Growth Statistics"></CardHeader>
      <Table height={ String(Math.floor(window.innerHeight*0.6))+'px' } fixedHeader={ true } fixedFooter={ true }>
        <TableHeader enableSelectAll={ false } displaySelectAll={ false } adjustForCheckbox={ false }>
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
        <TableBody stripedRows={ false }>
          {this.state.rows.map((row) => 
            <RevenueGrowthRow key={ row.index } row={row}></RevenueGrowthRow>
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

class Logged extends Component {
  constructor() {
    super();
    this.state = {
      'rows': [],
    }
  }

  render() {
    return (
      <IconMenu
        {...this.props}
        iconButtonElement={ <IconButton><MoreVertIcon></MoreVertIcon></IconButton> }
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem primaryText="Sign Out"></MenuItem>
        <MenuItem primaryText="Settings"></MenuItem>
        <MenuItem primaryText="Profile"></MenuItem>
        <MenuItem primaryText="Other Menu Item"></MenuItem>
      </IconMenu>
    )
  }
}

Logged.muiName = 'IconMenu';

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      rows: [],
      drawerOpen: false,
    };

    this.onAppBarLeftTouchTap = () => {
      this.setState({ drawerOpen: !this.state.drawerOpen }); 
    };
  }

  render() {
    return (
      <div className="App">
        <MuiThemeProvider>
          <div>
            <Drawer open={ this.state.drawerOpen } zDepth={ 4 }>
              <AppBar title="Growth Shares" zDepth={ 2 }
                onLeftIconButtonTouchTap={ this.onAppBarLeftTouchTap }
              >
              </AppBar>
              <MenuItem>Revenue Growth</MenuItem>
              <MenuItem>Full Ticker List</MenuItem>
            </Drawer>
            <Paper zDepth={ 2 } >
              <AppBar title="Growth Shares"
                iconElementRight={ <Logged></Logged> }
                onLeftIconButtonTouchTap={ this.onAppBarLeftTouchTap }
                >
              </AppBar>
            </Paper>
            {/* <TickerListTable></TickerListTable> */}
            <RevenueGrowthTable></RevenueGrowthTable>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
