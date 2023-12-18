FROM node:18
WORKDIR /website_manager_frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]