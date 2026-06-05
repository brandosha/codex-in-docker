# Start with the Node slim base for your supervisor
FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    bubblewrap \
    netcat-openbsd \
    git \
    openssh-client \
    openssh-server \
    curl \
    ca-certificates \
    build-essential \
    php \
    && rm -rf /var/lib/apt/lists/*

# (Since you use pnpm for the manager app, enable it natively)
RUN corepack enable pnpm

WORKDIR /app

# Install dependencies
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy and build the app
COPY . .
EXPOSE 80
RUN chmod +x /app/entrypoint.sh


# Set up SSH server
RUN mkdir /var/run/sshd

# Allow root login via SSH
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Expose the SSH port
EXPOSE 22

# Start the SSH daemon
CMD ["/app/entrypoint.sh"]