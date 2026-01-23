# Display the list of recipes
default:
    @just --list
up:
  podman-compose up -d --force-recreate
down:
  podman-compose down
