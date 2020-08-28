/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');

const { app: { port }, mongo: { host, port: dbPort, database } } = require('./config/default');
const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());

app.use(isAuth);

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true,
}));

mongoose.connect(`mongodb://${host}:${dbPort}/${database}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    process.stdout.write(`App started on port ${port}\n`);
    app.listen(port);
  })
  .catch((err) => {
    process.stderr.write(err);
    process.exit(1);
  });
