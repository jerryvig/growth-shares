import React, { Component } from 'react';
import './App.css';

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
            {this.state.rows.map(row => 
              <tr>
                <td>{row.index}</td>
                <td>{row.ticker}</td>
                <td>{row.companyName}</td>
                <td>{row.exchange}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
