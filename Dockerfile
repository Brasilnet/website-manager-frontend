FROM node:18
WORKDIR /website_manager_frontend
COPY package*.json ./
RUN yarn
COPY . .
RUN yarn build
CMD ["yarn", "start"]