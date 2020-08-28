const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');
const { checkAuthUser } = require('../../helpers/isAuth');

module.exports = {
  events: async () => {
    const events = await Event.find();
    return events.map((event) => transformEvent(event));
  },
  createEvent: async (args, req) => {
    const userId = checkAuthUser(req);
    const {
      title, description, price, date,
    } = args.eventInput;
    const event = new Event({
      title, description, price, date: new Date(date), creator: userId,
    });

    const savedEvent = await event.save();
    const createdEvent = transformEvent(savedEvent);

    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found.');
    }
    user.createdEvents.push(event);
    await user.save();

    return createdEvent;
  },
};
