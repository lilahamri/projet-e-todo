FROM node:latest 
WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
COPY . /app
EXPOSE 3001
CMD ["npm", "start"]