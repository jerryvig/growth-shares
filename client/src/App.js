import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import AutoComplete from 'material-ui/AutoComplete';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Drawer from 'material-ui/Drawer';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import SearchBar from 'material-ui-search-bar'
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
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
} from 'react-router-dom';
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
        <TableRowColumn width={250}>
          <img src={ 'images/logos/' + row.logo }></img>
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
      fontSize: 'medium'
    };

    this.logoHeaderStyle = {
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        textAlign: 'left',
        color: 'black',
        fontWeight: 'bold',
        fontSize: 'medium',
        minWidth: '250px'
    };

    this.cardStyle = {
      width: '96%',
      margin: 'auto',
      marginTop: '1%',
    };

    this.cardHeaderStyle = {
      textAlign: 'center',
      color: 'black',
      fontWeight: 'bold',
      fontSize: '18px',
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
        <CardHeader style={{ backgroundColor: '#E8E8E8'}} titleStyle={ this.cardHeaderStyle } title="Revenue Growth Statistics"></CardHeader>
        <Table height={ '77vh' } fixedHeader={ true } fixedFooter={ true }>
          <TableHeader enableSelectAll={ false } displaySelectAll={ false } adjustForCheckbox={ false }>
            <TableRow>
              <TableHeaderColumn style={ this.headerStyle }>
                Ticker
              </TableHeaderColumn>
                <TableHeaderColumn style={ this.headerStyle } width={250}>
                  Logo
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

    this.textStyle = {
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      textAlign: 'left',
      fontWeight: 'bold',
      fontSize: 'medium',
    };
  }

  render() {
    let row = this.props.row;
    return (
      <TableRow key={ row.index }>
        <TableRowColumn style={ this.textStyle }>
          {row.index}
        </TableRowColumn>
        <TableRowColumn>
          <img src={ 'images/logos/' + row.logo } height="50px"></img>
        </TableRowColumn>
        <TableRowColumn style={ this.textStyle }>
          {row.ticker}
        </TableRowColumn>
        <TableRowColumn style={ this.textStyle }>
          {row.companyName}
        </TableRowColumn>
        <TableRowColumn style={ this.textStyle }>
         {row.exchange}
        </TableRowColumn>
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
        fontSize: '18px'
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
      <Card style={ this.cardStyle } zDepth={ 2 }>
        <CardHeader style={{ backgroundColor: '#E8E8E8'}} titleStyle={ this.cardHeaderStyle } title="Full Ticker List"></CardHeader>
        <Table height={ '77vh' } fixedHeader={ true } fixedFooter={ true }>
            <TableHeader enableSelectAll={ false } displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn style={ this.headerStyle }>#</TableHeaderColumn>
                <TableHeaderColumn style={ this.headerStyle }>Logo</TableHeaderColumn>
                <TableHeaderColumn style={ this.headerStyle }>Ticker</TableHeaderColumn>
                <TableHeaderColumn style={ this.headerStyle }>Company Name</TableHeaderColumn>
                <TableHeaderColumn style={ this.headerStyle }>Exchange</TableHeaderColumn>
              </TableRow>
            </TableHeader>
          <TableBody>
            {this.state.rows.map((row) =>
              <TickerListRow key={ row.index } row={row}></TickerListRow>
            )}
          </TableBody>
        </Table>
      </Card>
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
      autoCompleteDataSource: [],
    };

    this.onAppBarLeftTouchTap = () => {
      this.setState({ drawerOpen: !this.state.drawerOpen });
    };

    this.closeDrawer = () => {
      this.setState({ drawerOpen: false });
    };

    this.handleUpdateInput = (value) => {
      this.setState({
        autoCompleteDataSource: [
          value,
          value + value,
          value + value + value,
        ],
      });
    };
  }

  render() {
    return (
      <div className="App">
        <MuiThemeProvider>
          <Router>
          <div>
            <Drawer
              open={ this.state.drawerOpen }
              zDepth={ 4 }
              docked={ false }
              onRequestChange={ this.closeDrawer }
              >
              <AppBar title="Growth Shares" zDepth={ 2 }
                onLeftIconButtonTouchTap={ this.onAppBarLeftTouchTap }
                titleStyle={{ fontSize: '20px', fontWeight: 'bold' }}
              >
              </AppBar>
              <Link style={{ color: 'black', textDecoration: 'none' }} to="/">
                <MenuItem style={{ fontWeight: 'bold' }} onTouchTap={ this.closeDrawer }>
                  Revenue Growth
                </MenuItem>
              </Link>
              <Link style={{ color: 'black', textDecoration: 'none' }}to="/full_ticker_list">
                <MenuItem style={{ fontWeight: 'bold' }} onTouchTap={ this.closeDrawer }>
                  Full Ticker List
                </MenuItem>
              </Link>
            </Drawer>
            <AppBar
              iconElementLeft={
                  <FlatButton
                   labelPosition="after"
                   label="Growth Shares"
                   icon={ <MenuIcon/> }
                   style={{ color: 'white' }}
                   labelStyle={{ color: 'white', fontSize: '22px', fontWeight: 'bold', textTransform: 'none'}}
                   >
                  </FlatButton> }
              iconElementRight={ <Logged></Logged> }
              onLeftIconButtonTouchTap={ this.onAppBarLeftTouchTap }
              iconStyleLeft={{ fontSize: '26px', fontWeight: 'bold', color:'white' }}
              zDepth={ 2 }
              title={
                  <div>
                  <SearchBar
                    hintText="Enter symbol, name, or keyword"
                    style={{width: '70%', margin: 'auto', position: 'relative', top: '8px'}}
                  />
                  </div>
              } >
            </AppBar>
            <Switch>
              <Route path="/" exact component={RevenueGrowthTable}></Route>
              <Route path="/revenue_growth" component={RevenueGrowthTable}></Route>
              <Route path="/full_ticker_list" component={TickerListTable}></Route>
            </Switch>
          </div>
          </Router>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
