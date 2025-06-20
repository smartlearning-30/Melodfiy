# Use Node.js base image
FROM node:18

# Install yt-dlp and ffmpeg
RUN apt-get update && \
    apt-get install -y python3-pip ffmpeg && \
    pip3 install yt-dlp

# Create app directory
WORKDIR /app

# Copy all files to container
COPY . .

# Install Node.js dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Start your app
CMD ["node", "server.js"]
