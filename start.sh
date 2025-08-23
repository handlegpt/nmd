#!/bin/sh

# Start SMTP server in background
echo "Starting SMTP server..."
node server/smtp-server.js &

# Wait a moment for SMTP server to start
sleep 2

# Start static file server
echo "Starting frontend server..."
serve -s dist -l 19006
