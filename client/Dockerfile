FROM node:16-alpine as development
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm i

RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache

COPY --chown=node:node . .
USER node
# add app

# COPY . ./
CMD ["npm", "start"]

# FROM node:16-alpine as development
# WORKDIR /usr/src/app
# COPY --chown=node:node package.json .

# RUN npm config set unsafe-perm true

# RUN npm install
# RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache

# COPY --chown=node:node . .
# USER node

# # RUN npm run build
# ENV HOST 0.0.0.0
# CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "3000"]
