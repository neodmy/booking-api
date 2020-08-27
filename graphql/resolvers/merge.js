/* eslint-disable no-use-before-define */
const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');

const getEvent = async (eventId) => {
  const event = await Event.findById({ _id: eventId });
  return transformEvent(event);
};

const getEvents = async (eventIds) => {
  const events = await Event.find({ _id: { $in: eventIds } });
  return events.map((event) => transformEvent(event));
};

const getUser = async (userId) => {
  const { _doc: user } = await User.findById(userId);
  return {
    ...user,
    createdEvents: getEvents.bind(this, user.createdEvents),
  };
};

const transformBooking = (inputBooking) => {
  const { _doc: booking } = inputBooking;
  return {
    ...booking,
    user: getUser.bind(this, booking.user),
    event: getEvent.bind(this, booking.event),
    createdAt: dateToString(booking.createdAt),
    updatedAt: dateToString(booking.updatedAt),
  };
};

const transformEvent = (inputEvent) => {
  const { _doc: event } = inputEvent;
  return {
    ...event,
    date: dateToString(event.date),
    creator: getUser.bind(this, event.creator),
  };
};

module.exports = {
  transformBooking,
  transformEvent,
};
