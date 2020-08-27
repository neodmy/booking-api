/* eslint-disable no-use-before-define */
const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const getEvents = async (eventIds) => {
  const events = await Event.find({ _id: { $in: eventIds } });
  return events.map(({ _doc: event }) => ({
    ...event,
    date: new Date(event.date).toISOString(),
    creator: getUser.bind(this, event.creator),
  }));
};

const getUser = async (userId) => {
  const { _doc: user } = await User.findById(userId);
  return {
    ...user,
    createdEvents: getEvents.bind(this, user.createdEvents),
  };
};

module.exports = {
  events: async () => {
    const events = await Event.find();
    return events.map(({ _doc: event }) => ({
      ...event,
      date: new Date(event.date).toISOString(),
      creator: getUser.bind(this, event.creator),
    }));
  },
  createEvent: async (args) => {
    const {
      title, description, price, date,
    } = args.eventInput;
    const event = new Event({
      title, description, price, date: new Date(date), creator: '5f4801955b867a25723363bb',
    });

    const { _doc: savedEvent } = await event.save();
    const createdEvent = {
      ...savedEvent,
      date: new Date(savedEvent.date).toISOString(),
      creator: getUser.bind(this, savedEvent.creator),
    };

    const user = await User.findById('5f4801955b867a25723363bb');

    if (!user) {
      throw new Error('User not found.');
    }
    user.createdEvents.push(event);
    await user.save();

    return createdEvent;
  },
  createUser: async (args) => {
    const { email, password } = args.userInput;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error('User exists already.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
    });
    const { _doc: savedUser } = await user.save();

    return { ...savedUser, password: null };
  },
};
