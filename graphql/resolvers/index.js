/* eslint-disable no-use-before-define */
const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const getEvents = async (eventIds) => {
  const events = await Event.find({ _id: { $in: eventIds } });
  return events.map(({ _doc: event }) => ({
    ...event,
    date: new Date(event.date).toISOString(),
    creator: getUser.bind(this, event.creator),
  }));
};

const getEvent = async (eventId) => {
  const { _doc: event } = await Event.findById({ _id: eventId });
  return {
    ...event,
    creator: getUser.bind(this, event.creator),
  };
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
  bookings: async () => {
    const bookings = await Booking.find();
    return bookings.map(({ _doc: booking }) => ({
      ...booking,
      user: getUser.bind(this, booking.user),
      event: getEvent.bind(this, booking.event),
      createdAt: new Date(booking.createdAt).toISOString(),
      updatedAt: new Date(booking.updatedAt).toISOString(),
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
  bookEvent: async (args) => {
    const { eventId } = args;
    const event = await Event.findOne({ _id: eventId });
    const booking = new Booking({
      user: '5f4801955b867a25723363bb',
      event,
    });
    const { _doc: savedBooking } = await booking.save();
    return {
      ...savedBooking,
      user: getUser.bind(this, booking.user),
      event: getEvent.bind(this, booking.event),
      createdAt: new Date(savedBooking.createdAt).toISOString(),
      updatedAt: new Date(savedBooking.updatedAt).toISOString(),
    };
  },
  cancelBooking: async (args) => {
    const { bookingId } = args;
    const { _doc: booking } = await Booking.findById(bookingId).populate('event');
    const { _doc: savedEvent } = booking.event;
    const event = { ...savedEvent, creator: getUser.bind(this, savedEvent.creator) };
    await Booking.deleteOne({ _id: bookingId });

    return event;
  },
};
