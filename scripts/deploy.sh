#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

# Prepare the database first, so that the app can start successfully.
podman compose -f compose.yaml up -d --wait mongodb

pnpm install --frozen-lockfile

# Simple downtime deployment to avoid accessing the dist being rewritten.
podman compose \
  -f compose.yaml \
  -f compose.prod.yaml \
  stop app

pnpm run build

test -f dist/index.html

# Start the app container without starting the dependencies, 
# since they are already running.
podman compose \
  -f compose.yaml \
  -f compose.prod.yaml \
  up -d --no-deps app