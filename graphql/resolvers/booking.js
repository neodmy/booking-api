const Booking = require('../../models/booking');
const Event = require('../../models/event');

const { transformBooking, transformEvent } = require('./merge');

module.exports = {
  bookings: async () => {
    const bookings = await Booking.find();
    return bookings.map((booking) => transformBooking(booking));
  },
  bookEvent: async (args) => {
    const { eventId } = args;
    const event = await Event.findOne({ _id: eventId });
    const booking = new Booking({
      user: '5f4801955b867a25723363bb',
      event,
    });
    const savedBooking = await booking.save();

    return transformBooking(savedBooking);
  },
  cancelBooking: async (args) => {
    const { bookingId } = args;
    const booking = await Booking.findById(bookingId).populate('event');
    const event = transformEvent(booking.event);
    await Booking.deleteOne({ _id: bookingId });

    return event;
  },
};
