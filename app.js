/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type User {
      _id: ID!
      email: String
      password: String
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
    `),
  rootValue: {
    events: () => Event.find()
      .then((events) => events)
      .catch((err) => { throw err; }),
    createEvent: (args) => {
      const {
        title, description, price, date,
      } = args.eventInput;
      const event = new Event({
        title, description, price, date: new Date(date), creator: '5f47e519681cfc1f9c6ec678',
      });
      let createdEvent;

      return event.save()
        .then(({ _doc: result }) => {
          createdEvent = result;
          return User.findById('5f47e519681cfc1f9c6ec678');
        })
        .then((user) => {
          if (!user) {
            throw new Error('User not found.');
          }
          user.createdEvents.push(event);
          return user.save();
        })
        .then(() => createdEvent)
        .catch((err) => {
          throw err;
        });
    },
    createUser: (args) => {
      const { email, password } = args.userInput;
      return User.findOne({ email })
        .then((user) => {
          if (user) {
            throw new Error('User exists already.');
          }
          return bcrypt.hash(password, 12);
        })
        .then((hashedPassword) => {
          const user = new User({
            email,
            password: hashedPassword,
          });
          return user.save();
        })
        .then(({ _doc: result }) => ({ ...result, password: null }))
        .catch((err) => { throw err; });
    },
  },
  graphiql: true,
}));

mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const port = 4000;
    process.stdout.write(`App started on port ${port}\n`);
    app.listen(port);
  })
  .catch((err) => {
    process.stderr.write(err);
    process.exit(1);
  });
