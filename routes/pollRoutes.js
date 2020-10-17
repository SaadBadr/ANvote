const express = require('express');
const pollController = require('./../controllers/pollController');
const router = express.Router();

router.route('/').post(pollController.createPoll);
router.route('/:id').get(pollController.getPoll);
router.route('/vote').post(pollController.requestVote);
router.route('/vote/:token').get(pollController.commitVote);

module.exports = router;
