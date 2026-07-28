FROM node:18-bullseye
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --production
COPY . .
RUN mkdir -p data
EXPOSE 3456
CMD ["node", "server.js"]
