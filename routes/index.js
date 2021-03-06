import express from 'express';
import sqlite3 from 'sqlite3';
import stats from 'stats-lite';

const router = express.Router();
const PAGE_TITLE = 'Growth Shares';
const DB_FILE_NAME = 'morningstar_data.sqlite3';

const getHrTimeDiffMilliseconds  = (startTime, endTime) => {
    return (endTime[0] - startTime[0])*1e3 + (endTime[1] - startTime[1])/1e6;
};

const fetchTickersListFromDb = (response) => {
    var tickerRows = [];
    var start = process.hrtime();
    var db = new sqlite3.Database(DB_FILE_NAME);
    db.all('SELECT DISTINCT ticker, company_name, exchange, logo_filename FROM (SELECT t1.*, t2.logo_filename FROM ticker_list t1 LEFT OUTER JOIN logos_by_ticker t2 ON t1.ticker=t2.ticker)', (err, rows) => {
        for (var i=0; i<rows.length; i++) {
            tickerRows.push({
                'index': i+1,
                'ticker': rows[i].ticker,
                'companyName': rows[i].company_name,
                'exchange': rows[i].exchange.charAt(0).toUpperCase() + rows[i].exchange.slice(1),
                'logo': rows[i].logo_filename !== null ? rows[i].logo_filename : undefined
            });
        }
        db.close();
        var end = process.hrtime(); 
        console.log('Read %d ticker symbols from the database in %f ms.', i,
            getHrTimeDiffMilliseconds(start, end));
        response.json(tickerRows);
        //response.render('ticker_list', {'title': 'AMEX Ticker List', 'tickerRows': tickerRows});
    });
};

const getPercentageString = (value) => {
    return (value *100).toFixed(2) + '%';
};

const fetchRevenueGrowthStats = (response) => {
    var growthStats = [];
    var start = process.hrtime();
    var db = new sqlite3.Database(DB_FILE_NAME);
    db.all('SELECT DISTINCT t1.*, t2.logo_filename FROM revenue_growth_stats t1 LEFT OUTER JOIN logos_by_ticker t2 ON t2.ticker=t1.ticker WHERE mean!=0 ORDER BY sharpe_ratio DESC',
        (error, rows) => {
            
        for (var i=0; i<rows.length; i++) {
            growthStats.push({
                'index': i+1,
                'ticker': rows[i].ticker,
                'companyName': rows[i].company_name,
                'ttmRevenue': (rows[i].ttm_revenue/1.0e6).toFixed(2) + ' M',
                'ttmGrowth': getPercentageString(rows[i].ttm_growth),
                'mean': getPercentageString(rows[i].mean),
                'stdev': getPercentageString(rows[i].stdev),
                'geomean': getPercentageString(rows[i].geomean),
                'cum_growth': getPercentageString(rows[i].cum_growth),
                'sharpe_ratio': rows[i].sharpe_ratio.toFixed(3),
                'logo': rows[i].logo_filename !== null ? rows[i].logo_filename : undefined
            });
        }
        db.close();
        var end = process.hrtime();
        response.json(growthStats);
        /*response.render('growth_statistics', {'title': 'Revenue Growth Statistics',
            'growthStats': growthStats}); */
    });
};

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
    db.all('SELECT t1.*, t2.company_name, t3.revenue AS ttm_revenue FROM revenue_growth t1, ticker_list t2, revenue t3 WHERE t1.ticker=t2.ticker AND t3.ticker=t1.ticker AND t3.year_index="Y_6"',
        (error, rows) => {
        var revenueGrowthByTicker = {};
        var metaInfo = {};
        for (var i=0; i<rows.length; i++) {
            revenueGrowthByTicker[rows[i].ticker] = [rows[i].y2, rows[i].y3, rows[i].y4, rows[i].y5, rows[i].y6];
            metaInfo[rows[i].ticker] = {
                'companyName': rows[i].company_name,
                'ttmRevenue': rows[i].ttm_revenue,
            }
        }
        
        var growthStatsByTicker = {};
        for (var ticker in revenueGrowthByTicker) {
            growthStatsByTicker[ticker] = {
                'companyName': metaInfo[ticker].companyName,
                'ttmRevenue': metaInfo[ticker].ttmRevenue,
                'ttmGrowth': revenueGrowthByTicker[ticker][4],
                'mean': stats.mean(revenueGrowthByTicker[ticker]),
                'stdev': stats.stdev(revenueGrowthByTicker[ticker]),
                'variance': stats.variance(revenueGrowthByTicker[ticker]),
                'cum_growth': revenueGrowthByTicker[ticker].reduce((a,b) => a*(1+b), 1)-1.0,
                'geomean': Math.pow(revenueGrowthByTicker[ticker].reduce((a,b) => a*(1+b), 1), 1/5)-1.0,
                'median': stats.median(revenueGrowthByTicker[ticker])
            };
            growthStatsByTicker[ticker]['sharpe_ratio'] = growthStatsByTicker[ticker]['mean']/growthStatsByTicker[ticker]['stdev'];
            if (growthStatsByTicker[ticker]['stdev'] === 0) {
                growthStatsByTicker[ticker]['sharpe_ratio'] = 0;
            }
        }

        db.run('BEGIN');
        db.run('DROP TABLE IF EXISTS revenue_growth_stats', () => {
            db.run('CREATE TABLE revenue_growth_stats ( ticker TEXT, company_name TEXT, ttm_revenue INTEGER, ttm_growth REAL, mean REAL, stdev REAL, variance REAL, cum_growth REAL, geomean REAL, median REAL, sharpe_ratio REAL )', () => {

                var stmt = db.prepare('INSERT INTO revenue_growth_stats VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                for (var ticker in growthStatsByTicker) {
                    var gStats = growthStatsByTicker[ticker];
                    stmt.run(ticker, gStats['companyName'], gStats['ttmRevenue'], gStats['ttmGrowth'], gStats['mean'],
                        gStats['stdev'], gStats['variance'], gStats['cum_growth'], gStats['geomean'],
                        gStats['median'],  gStats['sharpe_ratio']);
                }

                stmt.finalize(() => {
                    db.run('COMMIT');
                    db.close();

                    var end = process.hrtime();
                    console.log('Computed and inserted revenue growth statistics in %f ms.',
                        getHrTimeDiffMilliseconds(start, end));
                    response.json(growthStatsByTicker);
                });
            });
        });
    });
}

/* GET pages. */
router.get('/', (request, response, next) => {
    response.render('index', { title: PAGE_TITLE });
});

router.get('/ticker_list', (request, response, next) => {
    fetchTickersListFromDb(response);
});

router.get('/revenue_growth_stats', (request, response, next) => {
    fetchRevenueGrowthStats(response);
});

/* POST pages */
router.post('/compute_revenue_growth', computeRevenueGrowth);

router.post('/compute_revenue_growth_statistics', computeRevenueGrowthStatistics);

module.exports = router;
