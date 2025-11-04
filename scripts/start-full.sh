#!/bin/bash
# Railway start script - starts both backend and frontend

# Backend runs on Railway's PORT
# Frontend runs on PORT+1
BACKEND_PORT=${PORT:-3001}
FRONTEND_PORT=$((BACKEND_PORT + 1))

# Export ports for child processes
export PORT=$BACKEND_PORT
export NEXT_PORT=$FRONTEND_PORT

# Start backend
cd backend && npx prisma migrate deploy && cross-env NODE_ENV=production PORT=$BACKEND_PORT npm run start &
BACKEND_PID=$!

# Start frontend
cd frontend && cross-env NODE_ENV=production PORT=$FRONTEND_PORT npm run start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

