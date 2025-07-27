FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    bash \
    curl \
    wget \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p assets

# Expose ports for Expo development server
EXPOSE 19000 19001 19002

# Set environment variables
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start command
CMD ["npm", "start"] 