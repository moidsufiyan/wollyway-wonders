# Stage 1: Build compilation stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lock files and TS configuration
COPY package*.json tsconfig.json ./

# Install all development and build dependencies
RUN npm ci

# Copy raw source modules
COPY src ./src

# Build code output to dist/
RUN npm run build

# Stage 2: Clean production execution environment
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy configuration descriptors
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy build artifacts from compilation phase
COPY --from=builder /app/dist ./dist

# Expose server listener port
EXPOSE 5000

# Execute server boot
CMD ["node", "dist/server.js"]
