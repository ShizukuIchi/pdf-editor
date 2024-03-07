FROM node:lts-alpine

WORKDIR /app
ADD package.json .
ADD yarn.lock .
RUN yarn install

ADD . .
RUN yarn build

CMD [ "yarn", "start" ]