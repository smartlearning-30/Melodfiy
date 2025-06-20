FROM node:18

# Install yt-dlp
RUN apt-get update && apt-get install -y yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
