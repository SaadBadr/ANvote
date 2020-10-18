const Poll = require('./../models/pollModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

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
  schedule.scheduleJob(
    endsAt,
    catchAsync(async function() {
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
    })
  );
exports.createPoll = catchAsync(async (req, res, next) => {
  if (!req.body.options)
    return next(new AppError('please provide valid poll options.', 400));

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
});

exports.getPoll = catchAsync(async (req, res, next) => {
  const poll = await await Poll.findById(req.params.id);

  if (!poll) return next(new AppError('poll not found.', 404));

  res.status(200).json({
    status: 'success',
    data: {
      poll
    }
  });
});

exports.requestVote = catchAsync(async (req, res, next) => {
  if (!req.body.email)
    return next(new AppError('please provide your email.', 400));

  const poll = await Poll.findById(req.params.id);
  if (!poll) return next(new AppError('poll not found.', 404));

  const option = poll.options.find(el => el._id == req.body.option);
  if (!option)
    return next(
      new AppError('option not found, please provide a valid option id.', 404)
    );
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
});

exports.commitVote = catchAsync(async (req, res, next) => {
  const decoded = await promisify(jwt.verify)(
    req.params.token,
    process.env.JWT_SECRET
  );

  const poll = await Poll.findById(decoded.poll);
  if (!poll) return next(new AppError('This poll expired.', 404));
  const option = poll.options.find(el => el._id == decoded.option);
  if (!option) return next(new AppError('This poll expired.', 400));
  option.votes++;

  poll.voters.push(decoded.email);

  await poll.save();

  return res.status(200).send('VOTE DONE!');
});
