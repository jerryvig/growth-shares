const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (request, response, next) => {
	response.send('respond with some user resource');
});

router.get('/:userId', (request, response, next) => {
	response.send(`Hello there user with name = ${request.params.userId}`);
});

module.exports = router;
