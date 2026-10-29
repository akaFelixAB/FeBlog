#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

# Stop the all containers, including the dependencies.
podman compose \
  -f compose.yaml \
  -f compose.prod.yaml \
  down -v
