FROM node:12

# Setup normal user.
ENV USER=operator-user
RUN adduser --disabled-password --gecos "" $USER

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .
RUN npm install --production

COPY ./scripts ./scripts
COPY ./migrations ./migrations
COPY ./lib ./lib
COPY ./wait-for-postgres.js .

# Use normal user.
USER $USER

CMD npm start
