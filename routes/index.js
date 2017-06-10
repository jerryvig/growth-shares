const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const PAGE_TITLE = 'Growth Shares'
const DB_FILE_NAME = 'morningstar_data.sqlite3';

function getHrTimeDiffMilliseconds(startTime, endTime) {
    return (endTime[0] - startTime[0])*1000 + (endTime[1] - startTime[1])/1e6;
}

function fetchTickersListFromDb(response) {
    var tickerRows = [];
    var start = process.hrtime();
    var db = new sqlite3.Database(DB_FILE_NAME);
    db.all('SELECT DISTINCT ticker, company_name, exchange FROM ticker_list ORDER BY ticker ASC', (err, rows) => {
        for (var i=0; i<rows.length; i++) {
            tickerRows.push({
                'index': i+1,
                'ticker': rows[i].ticker,
                'companyName': rows[i].company_name,
                'exchange': rows[i].exchange.charAt(0).toUpperCase() + rows[i].exchange.slice(1)
            });
        }
        db.close();
        var end = process.hrtime(); 
        console.log('Read %d ticker symbols from the database in %f ms.', i,
            getHrTimeDiffMilliseconds(start, end));
        //response.json(tickerRows);
        response.render('ticker_list', {'title': 'AMEX Ticker List', 'tickerRows': tickerRows});
    });
}

/* GET home page. */
router.get('/', (request, response, next) => {
    response.render('index', { title: PAGE_TITLE });
});

router.get('/ticker_list', (request, response, next) => {
    fetchTickersListFromDb(response);
});

module.exports = router;
