const Poll = require('./../models/pollModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { stat } = require('fs');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');

const sendmail = mail => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  transport.sendMail(mail, () => console.log('mail sent!'));
};

const endVote = (poll_id, endsAt) =>
  schedule.scheduleJob(endsAt, async function() {
    const poll = await Poll.findByIdAndDelete(poll_id);
    let text = '<strong>Results:<strong><br><ul>';
    poll.options.forEach(el => {
      text += `<li>${el.option}: ${el.votes}</li>`;
    });
    text += '</ul><strong>Voters:<strong><br><ul>';
    poll.voters.forEach(el => {
      text += `<li>${el}</li>`;
    });
    text += '</ul>';

    const mail = {
      to: poll.creator,
      subject: `${poll.title} results!!`,
      html: text
    };
    sendmail(mail);
  });
exports.createPoll = async (req, res, next) => {
  const options = req.body.options.map(option => {
    return { option };
  });

  const { creator, title, endsAt } = req.body;
  const poll = await Poll.create({ creator, title, options, endsAt });
  endVote(poll._id, poll.endsAt);
  res.status(201).json({
    status: 'success',
    data: {
      poll
    }
  });
};

exports.getPoll = async (req, res, next) => {
  const poll = await await Poll.findById(req.params.id);
  res.status(200).json({
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

  const url = process.env.DOMAIN + 'vote/' + token;
  sendmail({
    to: req.body.email,
    subject: `ANvote: ${poll.title}`,
    html: `<a href="${url}">Click here to vote!</a> <br> if the above button doesn't work please copy the following url and paste it in your browser: ${url}`
  });
  res.status(200).json({
    status: 'success',
    data: {
      message: 'please check your mail!'
    }
  });
};

exports.commitVote = async (req, res, next) => {
  const decoded = await promisify(jwt.verify)(
    req.params.token,
    process.env.JWT_SECRET
  );

  const poll = await Poll.findById(decoded.poll);
  const option = poll.options.find(el => el._id == decoded.option);
  option.votes++;

  poll.voters.push(decoded.email);

  await poll.save();

  return res.status(200).send('VOTE DONE!');
};
