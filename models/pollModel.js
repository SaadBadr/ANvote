const mongoose = require('mongoose');
const validator = require('validator');
const isUnique = array => new Set(array).size === array.length;
const poleSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: 'Untitled poll'
  },

  options: {
    type: [
      {
        option: String,
        votes: {
          type: Number,
          default: 0
        }
      }
    ],
    validate: {
      validator: function(op) {
        if (op.length < 2) return false;
        const arr = op.map(el => el.option);
        return arr.length === new Set(arr).size;
      },
      message: 'poll options should be at least two with no duplicates.'
    }
  },
  voters: {
    type: [
      {
        type: String,
        validate: [validator.isEmail, 'please provide valid email.']
      }
    ],
    validate: {
      validator: function(users) {
        return users.length === new Set(users).size;
      },
      message: 'this user already made a vote.'
    }
  },
  creator: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'please provide correct email.']
  },
  endsAt: {
    type: Date
    // max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    // default: new Date(Date.now() + 2 * 60 * 60 * 1000),
    // expires: Date.now() + 30 * 24 * 60 * 60 * 1000
  }
});

const pollModel = mongoose.model('Polls', poleSchema);

module.exports = pollModel;
