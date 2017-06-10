const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const PAGE_TITLE = 'Growth Shares'
const DB_FILE_NAME = 'morningstar_data.sqlite3';

/* GET home page. */
router.get('/', (request, response, next) => {
	response.render('index', { title: PAGE_TITLE });
});

router.get('/ticker_list',  (request, response, next) => {
	var tickerList = [];
	var db = new sqlite3.Database(DB_FILE_NAME);
	db.all('SELECT DISTINCT ticker, company_name FROM ticker_list ORDER BY ticker ASC', (err, rows) => {
		var ticker_count = 0;
		for (row of rows) {
			tickerList.push(`${row.ticker}, ${row.company_name}`);
		}
		console.log('Read %d ticker symbols from the database.', ticker_count);
		db.close();
		var responseStr = tickerList.join('<br>');
		response.send(responseStr);
	});
});

module.exports = router;
