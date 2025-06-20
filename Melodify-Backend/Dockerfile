# Use Node.js base image
FROM node:18

# Install yt-dlp and ffmpeg
RUN apt-get update && \
    apt-get install -y python3-pip ffmpeg && \
    pip3 install yt-dlp

# Create app directory
WORKDIR /app

# Copy all project files into container
COPY . .

# Install Node.js dependencies
RUN npm install

# Expose port used by the app
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]