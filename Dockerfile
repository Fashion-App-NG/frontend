# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:24.3.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for build scripts)
RUN npm ci --include=dev

# Copy all source code and scripts
COPY . .

# Build argument for UI type
ARG UI_TYPE=designer
ENV UI_TYPE=${UI_TYPE}

# Ensure UI components are set up and build
RUN node scripts/ensure-ui.js && npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]