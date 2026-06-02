#!/bin/bash
# Kill any existing processes on our ports
pkill -f "node src/index.js" 2>/dev/null || true
sleep 1

# Start backend server in background
cd /home/runner/workspace/server && node src/index.js &
SERVER_PID=$!
echo "Backend started with PID $SERVER_PID"

# Wait for backend to be ready
sleep 3

# Start frontend dev server (blocks)
cd /home/runner/workspace/client && npm run dev

# If frontend exits, kill backend too
kill $SERVER_PID 2>/dev/null
