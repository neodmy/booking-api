/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

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

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
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
        title, description, price, date: new Date(date),
      });
      return event.save()
        .then((result) => result)
        .catch((err) => {
          throw err;
        });
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
