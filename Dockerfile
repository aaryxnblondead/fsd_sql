# Stage 1: Frontend build
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend build
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./

# Stage 3: Final image
FROM node:18-alpine
WORKDIR /app

# Install production dependencies for backend
COPY --from=backend-build /app/backend/package*.json ./
RUN npm ci --only=production

# Copy backend build
COPY --from=backend-build /app/backend/ ./

# Copy frontend build to public directory
COPY --from=frontend-build /app/frontend/dist ./public

# Create directory for SQLite databases
RUN mkdir -p ./databases && chmod 777 ./databases

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start the app
CMD ["node", "src/server.js"] 