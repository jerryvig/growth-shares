const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const stats = require('stats-lite');

const PAGE_TITLE = 'Growth Shares';
const DB_FILE_NAME = 'morningstar_data.sqlite3';

function getHrTimeDiffMilliseconds(startTime, endTime) {
    return (endTime[0] - startTime[0])*1e3 + (endTime[1] - startTime[1])/1e6;
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

function computeRevenueGrowth(request, response, next) {
    var start = process.hrtime();
    var db = new sqlite3.Database(DB_FILE_NAME);
    var revenueRecords = {};
    db.all('SELECT * FROM revenue', (error, rows) => {
        for (var i=0; i<rows.length; i++) {
            if (!(rows[i].ticker in revenueRecords)) {
                revenueRecords[rows[i].ticker] = {};
            }
            revenueRecords[rows[i].ticker][rows[i].year_index] = rows[i].revenue;
        }
        
        var revenueGrowthRecords = {};
        for (var ticker in revenueRecords) {
            revenueGrowthRecords[ticker] = {};
            for (var i=2; i<7; i++) {
                var k1 = 'Y_' + i;
                var k0 = 'Y_' + (i - 1);
                if (revenueRecords[ticker][k0] > 0) {
                    revenueGrowthRecords[ticker][k1] = (revenueRecords[ticker][k1] - revenueRecords[ticker][k0])/revenueRecords[ticker][k0];
                } else {
                    revenueGrowthRecords[ticker][k1] = 0;
                }
            }
        }

        db.run('DROP TABLE IF EXISTS revenue_growth', () => {
            db.run('CREATE TABLE revenue_growth ( ticker TEXT, y2 REAL, y3 REAL, y4 REAL, y5 REAL, y6 REAL )', () => {
                db.run('BEGIN');
                var insertStatement = db.prepare('INSERT INTO revenue_growth VALUES (?, ?, ?, ?, ?, ?)');
                for (var symbol in revenueGrowthRecords) {
                    insertStatement.run(symbol, revenueGrowthRecords[symbol]['Y_2'], revenueGrowthRecords[symbol]['Y_3'], revenueGrowthRecords[symbol]['Y_4'], revenueGrowthRecords[symbol]['Y_5'], revenueGrowthRecords[symbol]['Y_6']  );
                }
                insertStatement.finalize(() => {
                    db.run('COMMIT');
                    db.close();
                    var end = process.hrtime();
                    console.log('Inserted revenue growth records in %f ms.', getHrTimeDiffMilliseconds(start, end));
                    response.json(revenueGrowthRecords);
                });
            });
        });
    });
}

function computeRevenueGrowthStatistics(request, response, next) {
    var start = process.hrtime();
    var db = new sqlite3.Database(DB_FILE_NAME);
    db.all('SELECT * FROM revenue_growth', (error, rows) => {
        var revenueGrowthByTicker = {};
        for (var i=0; i<rows.length; i++) {
            revenueGrowthByTicker[rows[i].ticker] = [rows[i].y2, rows[i].y3, rows[i].y4, rows[i].y5, rows[i].y6];
        }
        

        for (var ticker in revenueGrowthByTicker) {
            var avgGrowth = revenueGrowthByTicker[ticker].reduce((a,b) => a+b, 0)/5.0;
            console.log('avgGrowth for %s = %f', ticker, avgGrowth);
        }

        db.close();
        var end = process.hrtime();
        console.log('Finished in %f ms.', getHrTimeDiffMilliseconds(start, end));
        response.json(revenueGrowthByTicker);
    });
}

/* GET home page. */
router.get('/', (request, response, next) => {
    response.render('index', { title: PAGE_TITLE });
});

router.get('/ticker_list', (request, response, next) => {
    fetchTickersListFromDb(response);
});

router.post('/compute_revenue_growth', computeRevenueGrowth);

router.post('/compute_revenue_growth_statistics', computeRevenueGrowthStatistics);

module.exports = router;
