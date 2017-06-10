const express = require('express');
const router = express.Router();

const PAGE_TITLE = 'Growth Shares'

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: PAGE_TITLE });
});

module.exports = router;
