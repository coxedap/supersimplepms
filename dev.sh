#!/usr/bin/env bash

set -e

echo "Starting Backend..."
(cd backend && npm run dev) &
BACKEND_PID=$!

echo "Starting Frontend..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

cleanup() {
  echo ""
  echo "Stopping services..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit
}

trap cleanup SIGINT SIGTERM

wait