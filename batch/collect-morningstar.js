const http = require('http');
const htmlparser = require('htmlparser2');
const sqlite3 = require('sqlite3').verbose();

const MORNINGSTAR_BASE_URL = 'http://financials.morningstar.com/ajax/' +
    'ReportProcess4HtmlAjax.html?&t=';
const NASDAQ_TICKERS_URL = 'http://www.nasdaq.com/screening/' +
    'companies-by-name.aspx?letter=0&render=download&exchange=';
const THROTTLE_DELAY = 1500;
const YEARS = ['Y_1', 'Y_2', 'Y_3', 'Y_4', 'Y_5', 'Y_6'];
const EXCHANGES = ['nasdaq', 'nyse', 'amex'];
const DB_FILE_NAME = 'morningstar_data.sqlite3';

function ResultParser() {
    this.currentYear = null;
    this.years = {};
    this.revenueByYear = {};
    this.yearIndex = 0;
    this.parser = new htmlparser.Parser({
        onopentag: this.onopentag.bind(this),
        ontext: this.ontext.bind(this),
        onclosetag: this.onclosetag.bind(this)
    }, {decodeEntities: true});
}

ResultParser.prototype.onopentag = function(name, attrs) {
    if (name === 'div') {
        if (attrs.class === 'year' && YEARS.indexOf(attrs.id) !== -1) {
            this.currentYear = attrs.id;
        }
        if (attrs.class === 'pos' &&
            YEARS.indexOf(attrs.id) !== -1 &&
            attrs.rawvalue !== undefined &&
            attrs.style === 'overflow:hidden;white-space: nowrap;') {
            if (this.yearIndex < 6) {
                var revenue = Number(attrs.rawvalue);
                if (attrs.rawvalue === String.fromCharCode(8212)) {
                    revenue = 0;
                }
                this.revenueByYear[attrs.id] = revenue;
            }
            this.yearIndex++;
        }
    }
};

ResultParser.prototype.ontext = function(text) {
    if (this.currentYear !== null) {
        this.years[this.currentYear] = text.trim();
    }
};

ResultParser.prototype.onclosetag = function(name) {
    if (name === 'div') {
        this.currentYear = null;
    }
};

function MorningstarCollector(resolver) {
    this.tickers = [];
    this.resolver = resolver;
    this.currentTicker = null;
    this.count = 0;
}

MorningstarCollector.prototype.insertResultData = function(years,
    revenueByYear) {
    console.log('Inserting results for %s.', this.currentTicker);
    var startTime = process.hrtime();
    var db = new sqlite3.Database(DB_FILE_NAME);
    db.run('BEGIN');
    var year_stmt = db.prepare('INSERT INTO years VALUES (?, ?, ?)');
    var revenue_stmt = db.prepare('INSERT INTO revenue VALUES (?, ?, ?)');
    for (var yearIndex in years) {
        year_stmt.run(this.currentTicker, yearIndex, years[yearIndex]);
    }
    year_stmt.finalize(() => {
        for (var yearIndex in revenueByYear) {
            revenue_stmt.run(this.currentTicker, yearIndex,
                revenueByYear[yearIndex]);
        }
        revenue_stmt.finalize(() => {
            db.run('COMMIT');
            db.close();
            var endTime = process.hrtime();
            var insertTime = getHrTimeDiffMilliseconds(startTime, endTime);
            console.log('Results insertion completed for %s in %f ms.',
                this.currentTicker, insertTime);
            this.getNextTicker();
        });
    });
};

MorningstarCollector.prototype.processResult = function(result) {
    console.log('Parsing html result.');
    var rp = new ResultParser();
    rp.parser.write(result);
    rp.parser.end();

    console.log('Finished parsing html for %s.', this.currentTicker);
    console.log('Years: %s', JSON.stringify(rp.years));
    console.log('Revenue: %s', JSON.stringify(rp.revenueByYear));
    
    this.insertResultData(rp.years, rp.revenueByYear);
};

MorningstarCollector.prototype.handleResponseEnd = function() {
    console.log('Processing response end event for ticker %s.', this.currentTicker);
    try {
        var parsedData = JSON.parse(this.rawData);
        if (parsedData.result !== undefined) {
            this.processResult(parsedData.result);
        } else {
            console.log(`No "result" property found in returned JSON for ticker ${nextTicker}. Cannot process data.`);
            this.getNextTicker();
        }
    } catch (error) {
        console.log(`Error thrown when parsing JSON: ${error.message}.`);
        this.getNextTicker();
    }
};

MorningstarCollector.prototype.handleResponseData = function(chunk) {
	this.rawData += chunk;
};

MorningstarCollector.prototype.handleMorningstarResponse = function(response) {
	if (response.statusCode !== 200) {
		console.log(`Error: Server reponded with status code ${response.statusCode}`);
		response.resume();
		this.getNextTicker();
	}

	this.rawData = '';
	response.on('data', this.handleResponseData.bind(this));
	response.on('end', this.handleResponseEnd.bind(this));
};

MorningstarCollector.prototype.getNextTicker = function() {
	var nextTicker = this.tickers.shift();
	this.currentTicker = nextTicker;
	if (nextTicker === undefined) {
		console.log(`Finished retrieiving morningstar data for ${this.count} tickers.`);
		this.resolver();
		return;
	}

	console.log(`---------------------\nRetrieving morningstar data for ticker ${nextTicker}.`);
	if (this.count > 0) {
		setTimeout(() => {
			http.get(MORNINGSTAR_BASE_URL + nextTicker, this.handleMorningstarResponse.bind(this));
		}, THROTTLE_DELAY);
	} else {
		http.get(MORNINGSTAR_BASE_URL + nextTicker, this.handleMorningstarResponse.bind(this));
	}
	this.count++;
};

MorningstarCollector.prototype.readTickersFromDatabase = function() {
	console.log('Reading ticker list from database %s.', DB_FILE_NAME);
	return new Promise((resolve, reject) => {
		var db = new sqlite3.Database(DB_FILE_NAME);
		db.all('SELECT ticker FROM ticker_list ORDER BY ticker ASC', (err, rows) => {
			var ticker_count = 0;
			for (row of rows) {
				ticker_count++;
				this.tickers.push(row.ticker);
			}
			console.log('Read %d ticker symbols from the database.', ticker_count);
			db.close();
			console.log('Proceeding to load data for %d tickers from morningstar.', ticker_count);
			resolve();
		});
	});
};

function loadMorningstarData() {
	return new Promise((resolver, rejector) => {
		console.log('Instantiating MorningstarCollector.');
		var morningstarCollector = new MorningstarCollector(resolver);
		morningstarCollector.readTickersFromDatabase()
			.then(morningstarCollector.getNextTicker.bind(morningstarCollector));
	});
}

function TickerListLoader(exchanges, resolver) {
	this.tickerList = [];
	this.exchanges = exchanges;
	this.resolver = resolver;
	this.count = 0;
	this.tickerCount = 0;
	this.rawData = '';
}

TickerListLoader.prototype.handleResponseData = function(chunk) {
	this.rawData += chunk;
};

TickerListLoader.prototype.insertTickers = function() {
	console.log(`Inserting ${this.tickerList.length} tickers into db.`);
	var startTime = process.hrtime();
	var db = new sqlite3.Database(DB_FILE_NAME);
	db.run('BEGIN');
	var stmt = db.prepare('INSERT INTO ticker_list VALUES (?)');
	for (var i=0; i<this.tickerList.length; i++) {
		stmt.run(this.tickerList[i]);
	}
	console.log('Running SQL ', stmt, '.');
	stmt.finalize(() => {
		db.run('COMMIT');
		db.close();
		var endTime = process.hrtime();
		console.log('Inserted %d tickers in %f ms.', this.tickerList.length,
            getHrTimeDiffMilliseconds(startTime, endTime));
		this.tickerList = [];
		this.getNextExchange();
	});
};

TickerListLoader.prototype.checkNoBadStrs = function(tickerString) {
    var badChars = ['Symbol', '^', '.'];
    for (var i=0; i<badChars.length; i++) {
        if (tickerString.includes(badChars[i])) {
            return false;
        }
    }
    return true;
};

TickerListLoader.prototype.handleResponseEnd = function(rawData) {
	console.log('Processing nasdaq response end event. Appending tickers.');
	var lines = this.rawData.split('\n');
	for (var line of lines) {
		var cols = line.split(',');
		var ticker = cols[0].replace(/"/g, '').trim();
		if (ticker.length > 0 && this.checkNoBadStrs(ticker)) {
			this.tickerList.push(ticker);
			this.tickerCount++;
		}
	}

	if (this.tickerList.length > 0) {
		this.insertTickers();
	} else {
		this.tickerList = [];
		this.getNextExchange();
	}
};

TickerListLoader.prototype.handleNasdaqResponse = function(response) {
	if (response.statusCode !== 200) {
		console.log(`Error: Nasdaq server responded with status code ${response.statusCode}.`);
		response.resume();
		return;
	}

	response.on('data', this.handleResponseData.bind(this));
	response.on('end', this.handleResponseEnd.bind(this));
};

TickerListLoader.prototype.getNextExchange = function() {
	if (this.count === 0) {
		console.log(`Loading ticker lists from exchanges ${this.exchanges.join(', ')}.`);
	}

	var nextExchange = this.exchanges.shift();
	if (nextExchange === undefined) {
		console.log('Finished loading %s tickers for %s exchanges.', this.tickerCount, this.count);
		console.log('Calling promise resolver for TickerListLoader.');
		this.resolver();
		return;
	}

	console.log(`------------------------\nLoading data for exchange ${nextExchange}.`);
	if (this.count === 0) {
		http.get(NASDAQ_TICKERS_URL + nextExchange, this.handleNasdaqResponse.bind(this));
	} else {
		setTimeout(() => {
			http.get(NASDAQ_TICKERS_URL + nextExchange, this.handleNasdaqResponse.bind(this));
		}, THROTTLE_DELAY);
	}
	this.count++;
};

function getHrTimeDiffMilliseconds(startTime, endTime) {
    return (endTime[0] - startTime[0])*1000 + (endTime[1] - startTime[1])/1e6;
}

function initializeDatabase() {
	var startTime = process.hrtime();
	var ddl_statments = [
		'DROP TABLE IF EXISTS years',
		'DROP TABLE IF EXISTS revenue',
		'DROP TABLE IF EXISTS ticker_list',
		'CREATE TABLE years ( ticker TEXT, year_index TEXT, year TEXT )',
		'CREATE TABLE revenue ( ticker TEXT, year_index TEXT, revenue INTEGER )',
		'CREATE TABLE ticker_list ( ticker TEXT )'
	];
	console.log('Opening database %s for initialization.', DB_FILE_NAME);
	var db = new sqlite3.Database(DB_FILE_NAME);
	db.run('BEGIN');
	return new Promise((resolve, reject) => {
		function runNextStatment() {
			var nextStmt = ddl_statments.shift();
			if (nextStmt === undefined) {
				db.run('COMMIT');
				db.close();
				var endTime = process.hrtime();
				console.log('Finished executing schema drop and creation statements in %f ms.',
                    getHrTimeDiffMilliseconds(startTime, endTime));
				resolve();
				return;
			}
			console.log(`Running SQL statement: "${nextStmt}".`);
			db.run(nextStmt, runNextStatment);
		}
		runNextStatment();
	});
}

function loadTickerLists() {
    return new Promise((resolve, reject) => {
        var tickerLoader = new TickerListLoader(['nasdaq'], resolve);
        tickerLoader.getNextExchange();
    });
}

function main(args) {
    var startTime = process.hrtime();
    initializeDatabase()
        .then(loadTickerLists)
        .then(loadMorningstarData)
        .then(() => {
            var endTime = process.hrtime();
            console.log('Morningstar data collection completed in %fs.', getHrTimeDiffMilliseconds(startTime, endTime));
        });
	/* initializeDatabase()
		.then(loadTickerLists)
		.then(() => {
			var endTime = process.hrtime();
			console.log('Finished loading ticker lists in %fs.', getHrTimeDiffMilliseconds(startTime, endTime));
		}); */
	//initializeDatabase().then(() => { console.log('done')});
}

const args = process.argv;
main(args);
