# Base stage for building the static files
FROM node:lts-trixie-slim AS source
WORKDIR /app

# Install pnpm
RUN npm install -g corepack \
    && corepack enable \
    && corepack prepare pnpm@11.3.0 --activate

# Copy package.json and lock files to the working directory
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code to the working directory
COPY . .

# Build stage for creating the production-ready static files
CMD ["pnpm", "run", "build"]
