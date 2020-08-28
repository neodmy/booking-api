# booking-api

A simple Node.js app using GraphQL, Express and MongoDB (with Mongoose) from the @academind [YouTube series](https://www.youtube.com/watch?v=7giZGFDGnkc&list=PL55RiY5tL51rG1x02Yyj93iypUuHYXcB_&index=1)

## Table of content
1. [Env](#env)
2. [Run](#run)
3. [GraphQL Schema](#graphql-schema)

---

### Env

You will need the following env variables:

- `PORT`: Port for the App. Default is 4000
- `SECRET_KEY`: Secret key for JWT related actions
- `MONGO_DB`: Database name
- `MONGO_HOST`
- `MONGO_PORT`

### Run

#### Local
To run in local, you need a MongoDB instance:

```bash
npm run infra:start
```

getting a MongoDB docker container listening on port `27017`. Then, you can run the app:

```bash
npm run start
```

To stop the MongoDB container:

```bash
npm run infra:stop
```

#### Dev
To set up both the app and MongoDB:

```bash
npm run app:start
```

App will be running on port `4000` and MongoDB on port `27017`

To stop both

```bash
npm run app:stop
```

### GraphQL Schema

```graphql
type Event {
  _id: ID!
  title: String!
  description: String!
  price: Float!
  date: String!
  creator: User!
}

type User {
  _id: ID!
  email: String
  password: String
  createdEvents: [Event!]
}

type Booking {
  _id: ID!
  event: Event!
  user: User!
  createdAt: String!
  updatedAt: String!
}

type AuthData {
  userId: ID!
  token: String!
  tokenExpiration: Int!
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
  # Requires authentication
  bookings: [Booking!]!
  login(email: String!, password: String!): AuthData!
}

type RootMutation {
  # Requires authentication
  createEvent(eventInput: EventInput): Event
  createUser(userInput: UserInput): User
  # Requires authentication
  bookEvent(eventId: ID!): Booking!
  # Requires authentication
  cancelBooking(bookingId: ID!): Event!
}

schema {
  query: RootQuery
  mutation: RootMutation
}
```