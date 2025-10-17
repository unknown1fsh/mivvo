# Simple Dockerfile for Mivvo Expertiz App
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Copy Prisma schema first
COPY backend/prisma ./backend/prisma

# Install all dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy remaining source code
COPY . .

# Generate Prisma client
RUN cd backend && npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "run", "start"]