docker compose up -d --force-recreate
docker compose up -d --force-recreate --build
docker compose down && docker compose up -d --build
