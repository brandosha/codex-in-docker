#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

export PATH="$PATH:/app/node_modules/.bin"
# export CODEX_HOME="/app/data/.codex"
echo 'export PATH="$PATH:/app/node_modules/.bin"' >> /etc/profile
echo 'export CODEX_HOME="$CODEX_HOME"' >> /etc/profile

echo "Starting SSH daemon..."
# Start the SSH daemon in the background
# (Omitting the -D flag allows it to detach, or we can use & to background it)
/usr/sbin/sshd

env

echo "Starting Node.js server..."
# Use 'exec' to hand over PID 1 to the Node.js process.
# This ensures your Node app receives shutdown signals (SIGTERM/SIGINT) properly.
exec pnpm start