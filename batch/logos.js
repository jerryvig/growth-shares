const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const LOGOS_LINKS_PATH = 'batch/logo_links.csv';
const LOGOS_BASE_PATH = 'batch/';
const DB_FILE_PATH = 'morningstar_data.sqlite3';
const TYPE_FILE_EXTENSIONS = {
	'image/svg+xml': 'svg',
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/gif': 'gif'
};

var logosByTicker = [];

function getHrTimeDiffMilliseconds(startTime, endTime) {
    return (endTime[0] - startTime[0]) * 1000 + (endTime[1] - startTime[1])/1e6;
}

function writeLogoFile(logo_filename, data) {
	return new Promise((resolve, reject) => {
		var fullLogoFilename = LOGOS_BASE_PATH + logo_filename;
		fs.unlink(fullLogoFilename, () => {
			fs.writeFile(fullLogoFilename, data, () => {
				console.log('Wrote logo file %s.', fullLogoFilename);
				resolve();
			});
		});
	});
}

function insertLogoRecord(symbol, logo_filename, url) {
	return new Promise((resolve, reject) => {
 		var db = new sqlite3.Database(DB_FILE_PATH, () => {
		db.run('BEGIN');
		var stmt = db.prepare('INSERT INTO logos_by_ticker VALUES (?, ?, ?)');
			stmt.run(symbol, logo_filename, url);
			stmt.finalize(() => {
				db.run('COMMIT', () => {
					db.close();
					console.log(`Inserted record for ${symbol}.`);
					resolve();
				});
			});
		});
 	});
}

function getNextLogo(symbol, url) {
	return new Promise((resolve, reject) => {
		console.log('Fetching logo for ticker %s.', symbol);
		https.get(url, (response) => {
			if (response.statusCode !== 200) {
				console.log('Failed to get logo file for symbol %s with url %s.', symbol, url);
				res.resume();
				resolve();
				return;
			}

			var contentType = response.headers['content-type'];
			var rawData = '';
			response.on('data', (chunk) => {
				rawData += chunk;
			});

			response.on('end', () => {
				response.resume();

				var extension = TYPE_FILE_EXTENSIONS[contentType];
				var logo_filename = `${symbol}.${extension}`;
				writeLogoFile(logo_filename, rawData)
					.then(insertLogoRecord.bind(null, symbol, logo_filename, url))
					.then(resolve);
			});
		}).on('error', (err) => {
			console.log('error = ' + err);
			resolve();
		});
	});
}

function fetchLogos(resolver) {
	return new Promise((resolve, reject) => {
		if (logosByTicker.length === 0) {
			console.log('Finished collecting all logos.');
			resolver();
			return;
		}

		var nextLogo = logosByTicker.shift();
		getNextLogo(nextLogo.symbol, nextLogo.url).then(() => {
			if (resolver) {
				setTimeout(fetchLogos, 500, resolver);
			} else {
				setTimeout(fetchLogos, 500, resolve);
			}
		});
	});
}

function createLogosDatabaseSchema() {
	return new Promise((resolve, reject) => {
		var start = process.hrtime();
		var db = new sqlite3.Database(DB_FILE_PATH, () => {
			db.run('BEGIN');
			db.run('DROP TABLE IF EXISTS logos_by_ticker', () => {
				db.run('CREATE TABLE logos_by_ticker ( ticker TEXT, logo_filename TEXT, logo_url TEXT )', () => {
					db.run('COMMIT', () => {
						db.close();
						var end = process.hrtime();
						console.log('Finished creating logo schemas in %d ms.', getHrTimeDiffMilliseconds(start, end));
						resolve();
					});
				});
			});
		});
	});
}

function loadLogoList() {
	return new Promise((resolve, reject) => {
		fs.readFile(LOGOS_LINKS_PATH, 'utf8', (err, data) =>{
			if (err) throw err;
			
			var lines = data.split('\n');
			var tickerCount = 0;
			for (var line of lines) {
				var parts = line.split(',')
				if (parts.length > 1) {
					logosByTicker.push({'symbol': parts[0].trim(), 'url': parts[1].trim()});
					tickerCount++;
				}
			}
			console.log('Loaded %d symbols and URLs from %s', tickerCount, LOGOS_LINKS_PATH);
			resolve();
		});
	});
}

function main(args) {
	var startTime = process.hrtime();
	createLogosDatabaseSchema()
		.then(loadLogoList)
		.then(fetchLogos)
		.then(() => {
			var endTime = process.hrtime();
			console.log('Process completed in %d ms.', getHrTimeDiffMilliseconds(startTime, endTime));
		});
}

const args = process.argv;
setImmediate(main, args);
