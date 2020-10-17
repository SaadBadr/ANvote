const Poll = require('./../models/pollModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
exports.createPoll = async (req, res, next) => {
  const options = req.body.options.map(option => {
    return { option };
  });
  console.log(options, req.body.options);
  const { email, title } = req.body;
  const poll = await Poll.create({ email, title, options });
  res.status(201).json({
    status: 'success',
    data: {
      poll
    }
  });
};

exports.requestVote = async (req, res, next) => {
  const poll = await Poll.findById(req.body.poll);
  const option = poll.options.find(el => el._id == req.body.option);

  const token = jwt.sign(
    {
      poll: poll._id,
      option: option._id,
      email: req.body.email
    },
    process.env.JWT_SECRET
  );

  res.status(200).json({
    status: 'success',
    data: {
      url: process.env.DOMAIN + 'vote/' + token
    }
  });
};

exports.commitVote = async (req, res, next) => {
  const decoded = await promisify(jwt.verify)(
    req.params.token,
    process.env.JWT_SECRET
  );
  console.log(decoded);
  return res.status(200).send('VOTE DONE!');
};
