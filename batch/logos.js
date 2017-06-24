const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const LOGOS_LINKS_PATH = 'batch/logo_links.csv';
const DB_FILE_PATH = 'morningstar_data.sqlite3';
const TYPE_FILE_EXTENSIONS = {
	'image/svg+xml': 'svg',
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/gif': 'gif'
};

var logosByTicker = [];

function getHrTimeDiffMilliseconds(startTime, endTime) {
    return (endTime[0] - startTime[0])*1000 + (endTime[1] - startTime[1])/1e6;
}

function getNextLogo(symbol, url) {
	return new Promise((resolve, reject) => {
		console.log('Fetching logo for ticker %s.', symbol);
		https.get(url, (response) => {
			if (response.statusCode !== 200) {
				console.log('Failed to get logo file for symbol %s with url %s.', symbol, url);
				resolve();
				res.resume();
				return;
			}
			
			var contentType = response.headers['content-type'];
			var rawData = '';
			response.on('data', (chunk) => {
				rawData += chunk;
			});

			response.on('end', () => {
				response.resume();
				//Need to write symbol, url, and saved filename to sqlite table.
				// Need to determine the type of file that we saved.

				var extension = TYPE_FILE_EXTENSIONS[contentType];
				var logo_filename = `${symbol}.${extension}`;

				console.log('logo filename = ' + logo_filename);
				var db = new sqlite3.Database(DB_FILE_PATH, () => {
					db.run('BEGIN');
					var stmt = db.prepare('INSERT INTO logos_by_ticker VALUES (?, ?, ?)');
					stmt.run(symbol, logo_filename, url);
					stmt.finalize(() => {
						db.run('COMMIT', () => {
							db.close();
							resolve();
						});
					});
				});
			});
		});
	});
}

function fetchLogos() {
	return new Promise((resolve, reject) => {
		if (logosByTicker.length === 0) {
			resolve();
			console.log('Finished collecting logos.');
			return;
		}

		var nextLogo = logosByTicker.shift();
		getNextLogo(nextLogo.symbol, nextLogo.url).then(() => {
			setTimeout(fetchLogos, 500);
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

function main() {
	var startTime = process.hrtime();
	/* loadLogoList().then(() => {
		fetchLogos();
	}); */
	createLogosDatabaseSchema()
		.then(loadLogoList)
		.then(fetchLogos)
		.then(() => {
			console.log('done');
		});
}

const args = process.argv;
main(args);
