# Use an official Node.js runtime as the base image
FROM node:16

# Install PM2 globally
RUN npm install pm2 -g

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install
RUN npm install bcrypt

# Copy the rest of the application code
COPY . .

# Expose the port that your Node.js app will run on
EXPOSE 3000

# Use PM2 to start your Node.js app
CMD [ "npm", "start" ]
