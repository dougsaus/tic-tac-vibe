#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the container name
CONTAINER_NAME="tic-tac-vibe"

# 1. Build the application
echo "Building the application..."
npm run build

# 2. Build the Docker container
echo "Building the Docker container..."
docker build -t $CONTAINER_NAME .

# 3. Clean up old containers (forcefully stop and remove if exists)
if docker ps -a --filter "name=${CONTAINER_NAME}" --format "{{.ID}}" | grep -q .; then
    echo "Stopping and removing existing container: ${CONTAINER_NAME}"
    docker stop ${CONTAINER_NAME} || true # Stop the container, ignore if already stopped
    docker rm -f ${CONTAINER_NAME}

    # Wait until the container is no longer listed
    echo "Waiting for container to be fully removed..."
    while docker ps -a --filter "name=${CONTAINER_NAME}" --format "{{.ID}}" | grep -q .; do
        sleep 0.5
    done
    echo "Container ${CONTAINER_NAME} removed."
fi

# 4. Run the new container
echo "Running the new container..."
docker run -d -p 8080:80 --name $CONTAINER_NAME $CONTAINER_NAME

echo "Application is running on http://localhost:8080"