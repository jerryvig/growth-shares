const express = require('express');
const router = express.Router();

const PAGE_TITLE = 'Growth Shares'

/* GET home page. */
router.get('/', (request, response, next) => {
	response.render('index', { title: PAGE_TITLE });
});

router.get('/ticker_list',  (request, response, next) => {
	response.send('This is for showing the ticker list.');
});

module.exports = router;
