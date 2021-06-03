FROM node:16-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
VOLUME /app/src/ /app/public /app/node_modules
ENV PATH /app/node_modules/.bin:$PATH
RUN npm install
EXPOSE $PORT
CMD ["npm", "start"]
