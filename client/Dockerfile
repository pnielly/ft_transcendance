FROM node:16.15.1-alpine  as development
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

# uncomment this to make it work on Ubuntu 20.04.4 LTS
# RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache
# COPY --chown=node:node . .
# USER node

# comment this to make it work on linux laptop Ubuntu 20.04.4 LTS
COPY . ./

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
