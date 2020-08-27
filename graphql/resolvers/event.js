const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    const events = await Event.find();
    return events.map((event) => transformEvent(event));
  },
  createEvent: async (args) => {
    const {
      title, description, price, date,
    } = args.eventInput;
    const event = new Event({
      title, description, price, date: new Date(date), creator: '5f4801955b867a25723363bb',
    });

    const savedEvent = await event.save();
    const createdEvent = transformEvent(savedEvent);

    const user = await User.findById('5f4801955b867a25723363bb');

    if (!user) {
      throw new Error('User not found.');
    }
    user.createdEvents.push(event);
    await user.save();

    return createdEvent;
  },
};
