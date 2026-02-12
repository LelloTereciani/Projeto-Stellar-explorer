#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.edge.yml"

if ! docker network inspect edge >/dev/null 2>&1; then
  docker network create edge
fi

docker compose -f "$COMPOSE_FILE" up -d --build backend

echo "Stellar Explorer backend publicado na rede edge (alias: stellar-explorer-backend)."
