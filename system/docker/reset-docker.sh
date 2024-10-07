#!/bin/bash

# Confirmation prompt
echo "This script will stop all containers, remove all containers, volumes, images, and prune the Docker system."
read -p "Are you sure you want to proceed? (y/N): " CONFIRMATION

# Default to No if no input is provided
CONFIRMATION=${CONFIRMATION:-N}

if [[ "$CONFIRMATION" != "y" && "$CONFIRMATION" != "Y" ]]; then
  echo "Operation cancelled. No changes were made."
  exit 0
fi

# Stop all containers if any are running
CONTAINERS=$(docker ps -aq)
if [ -n "$CONTAINERS" ]; then
  echo "Stopping all containers..."
  docker stop $CONTAINERS
fi

# Forcefully remove all containers if any exist
if [ -n "$CONTAINERS" ]; then
  echo "Removing all containers..."
  docker rm -f $CONTAINERS
fi

# Remove all volumes if any exist
VOLUMES=$(docker volume ls -q)
if [ -n "$VOLUMES" ]; then
  echo "Removing all volumes..."
  docker volume rm -f $VOLUMES
fi

# Remove all images if any exist
IMAGES=$(docker images -q)
if [ -n "$IMAGES" ]; then
  echo "Removing all images..."
  docker rmi -f $IMAGES
fi

# Prune the Docker system to clean up any remaining resources
echo "Pruning Docker system..."
docker system prune -a --volumes -f

echo "Docker environment cleaned up successfully."