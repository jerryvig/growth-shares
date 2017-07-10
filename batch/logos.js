// Run from command line using babel-node with "node_modules/babel-cli/bin/babel-node.js batch/logos.js".
import * as https from 'https';
import * as fs from 'fs';
import * as sqlite3 from 'sqlite3';


const LOGOS_LINKS_PATH = 'batch/logo_links.csv';
const LOGOS_BASE_PATH = 'batch/logos/';
const DB_FILE_PATH = 'morningstar_data.sqlite3';
const TYPE_FILE_EXTENSIONS = {
	'image/svg+xml': 'svg',
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/gif': 'gif'
};

let logosByTicker = [];

const getHrTimeDiffMilliseconds = (startTime, endTime) => {
    return (endTime[0] - startTime[0]) * 1000 + (endTime[1] - startTime[1])/1e6;
};

const writeLogoFile = (logo_filename, data) => {
	return new Promise((resolve, reject) => {
		let fullLogoFilename = LOGOS_BASE_PATH + logo_filename;
		fs.unlink(fullLogoFilename, () => {
			fs.writeFile(fullLogoFilename, data, () => {
				console.log('Wrote logo file %s.', fullLogoFilename);
				resolve();
			});
		});
	});
};

const insertLogoRecord = (symbol, logo_filename, url) => {
	return new Promise((resolve, reject) => {
 		let db = new sqlite3.Database(DB_FILE_PATH, () => {
		db.run('BEGIN');
		let stmt = db.prepare('INSERT INTO logos_by_ticker VALUES (?, ?, ?)');
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
};

const getNextLogo = (symbol, url) => {
	return new Promise((resolve, reject) => {
		console.log('Fetching logo for ticker %s.', symbol);
		https.get(url, (response) => {
			if (response.statusCode !== 200) {
				console.log('Failed to get logo file for symbol %s with url %s.', symbol, url);
				res.resume();
				resolve();
				return;
			}

			let contentType = response.headers['content-type'];
			let rawData = '';
			response.on('data', (chunk) => {
				rawData += chunk;
			});

			response.on('end', () => {
				response.resume();

				let extension = TYPE_FILE_EXTENSIONS[contentType];
				let logo_filename = `${symbol}.${extension}`;
				writeLogoFile(logo_filename, rawData)
					.then(insertLogoRecord.bind(null, symbol, logo_filename, url))
					.then(resolve);
			});
		}).on('error', (err) => {
			console.log('error = ' + err);
			resolve();
		});
	});
};

const fetchLogos = (resolver) => {
	return new Promise((resolve, reject) => {
		if (logosByTicker.length === 0) {
			console.log('Finished collecting all logos.');
			resolver();
			return;
		}

		let nextLogo = logosByTicker.shift();
		getNextLogo(nextLogo.symbol, nextLogo.url).then(() => {
			if (resolver) {
				setTimeout(fetchLogos, 500, resolver);
			} else {
				setTimeout(fetchLogos, 500, resolve);
			}
		});
	});
};

const createLogosDatabaseSchema = ()  => {
	return new Promise((resolve, reject) => {
		let start = process.hrtime();
		let db = new sqlite3.Database(DB_FILE_PATH, () => {
			db.run('BEGIN');
			db.run('DROP TABLE IF EXISTS logos_by_ticker', () => {
				db.run('CREATE TABLE logos_by_ticker ( ticker TEXT, logo_filename TEXT, logo_url TEXT )', () => {
					db.run('COMMIT', () => {
						db.close();
						let end = process.hrtime();
						console.log('Finished creating logo schemas in %d ms.', getHrTimeDiffMilliseconds(start, end));
						resolve();
					});
				});
			});
		});
	});
};

const loadLogoList = () => {
	return new Promise((resolve, reject) => {
		fs.readFile(LOGOS_LINKS_PATH, 'utf8', (err, data) =>{
			if (err) throw err;

			let lines = data.split('\n');
			let tickerCount = 0;
			for (let line of lines) {
				let parts = line.split(',')
				if (parts.length > 1) {
					logosByTicker.push({'symbol': parts[0].trim(), 'url': parts[1].trim()});
					tickerCount++;
				}
			}
			console.log('Loaded %d symbols and URLs from %s.', tickerCount, LOGOS_LINKS_PATH);
			resolve();
		});
	});
};

function main(args) {
	let startTime = process.hrtime();
	createLogosDatabaseSchema()
		.then(loadLogoList)
		.then(fetchLogos)
		.then(() => {
			let endTime = process.hrtime();
			console.log('Process completed in %d ms.', getHrTimeDiffMilliseconds(startTime, endTime));
		});
}

const args = process.argv;
setImmediate(main, args);
