FROM node:10-alpine

WORKDIR /app
COPY . ./

RUN yarn install

EXPOSE 5000

CMD [ "node", "src/server.js" ]
