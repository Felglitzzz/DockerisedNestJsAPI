FROM node:8.4.0

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ../../DockerisedNestJsAPI /usr/src/app

RUN npm install

CMD [ "npm", "start" ]
