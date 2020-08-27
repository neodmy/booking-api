FROM node:12-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk --no-cache add bash
RUN apk --no-cache add git

COPY . .

RUN npm install

EXPOSE 4000

CMD [ "./wait-for-it.sh", "mongo-booking-api-dev:27017", "--", "npm", "start" ]
