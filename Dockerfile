# Use the official Node.js runtime as base image
FROM node:20-slim

# Install system dependencies including libatomic1
# Use retry mechanism for network issues on Railway
RUN set -eux; \
    for i in 1 2 3; do \
        apt-get update --fix-missing && \
        apt-get install -y --no-install-recommends \
            libatomic1 \
            ca-certificates && \
        rm -rf /var/lib/apt/lists/* && \
        break || sleep 5; \
    done

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* .npmrc* ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Start the application using standalone server
# Standalone build creates .next/standalone/server.js
CMD ["node", ".next/standalone/server.js"]

