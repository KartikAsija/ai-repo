#!/usr/bin/env bash
set -e

echo "==================================================="
echo "Starting Your AI Career Navigator (Localhost)"
echo "==================================================="

# Start FastAPI Backend in background
echo "[1/2] Starting FastAPI Backend on http://localhost:8001 ..."
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!

# Start Vite Frontend
echo "[2/2] Starting Vite Frontend on http://localhost:5173 ..."
cd frontend
npm run dev -- --host localhost --port 5173 &
FRONTEND_PID=$!

echo "==================================================="
echo "App running!"
echo "Frontend: http://localhost:5173"
echo "Backend API Docs: http://localhost:8001/docs"
echo "Press Ctrl+C to terminate both servers."
echo "==================================================="

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait

