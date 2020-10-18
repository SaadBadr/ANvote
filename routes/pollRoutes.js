const express = require('express');
const pollController = require('./../controllers/pollController');
const router = express.Router();

router.route('/').post(pollController.createPoll);

router
  .route('/:id')
  .get(pollController.getPoll)
  .patch(pollController.requestVote);

router.route('/vote/:token').get(pollController.commitVote);

module.exports = router;
