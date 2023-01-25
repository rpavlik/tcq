FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./src ./src

RUN npm run build-production

EXPOSE 3000
CMD [ "npm", "run", "start"]
