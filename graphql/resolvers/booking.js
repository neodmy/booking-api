const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking, transformEvent } = require('./merge');
const { checkIsAuth } = require('../../helpers/isAuth');

module.exports = {
  bookings: async (args, req) => {
    checkIsAuth(req);
    const bookings = await Booking.find();
    return bookings.map((booking) => transformBooking(booking));
  },
  bookEvent: async (args, req) => {
    const userId = checkIsAuth(req);
    const { eventId } = args;
    const event = await Event.findOne({ _id: eventId });
    const booking = new Booking({
      user: userId,
      event,
    });
    const savedBooking = await booking.save();

    return transformBooking(savedBooking);
  },
  cancelBooking: async (args, req) => {
    checkIsAuth(req);
    const { bookingId } = args;
    const booking = await Booking.findById(bookingId).populate('event');
    const event = transformEvent(booking.event);
    await Booking.deleteOne({ _id: bookingId });

    return event;
  },
};
