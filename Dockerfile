FROM node:16

USER node

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN npm ci

CMD npm start

#docker  build -f ./Dockerfile.txt -t todo-backend .