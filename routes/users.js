const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (request, response, next) => {
	response.json([{
		'id': 1,
		'username': 'Jane'
	},{
		'id': 2,
		'username': 'John'
	}]);
});

router.get('/:userId', (request, response, next) => {
	response.send(`Hello there user with name = ${request.params.userId}`);
});

module.exports = router;
