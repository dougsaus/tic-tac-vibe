# Makefile for tic-tac-vibe application using Cloud Native Buildpacks

# Variables
IMAGE_NAME := tic-tac-vibe
BUILDER := paketobuildpacks/builder-jammy-base

# Default target: build JS, then build container and run
all: build-js build run

# Lint the code
lint:
	@echo "Running ESLint..."
	npm run lint

# Build local JavaScript bundle
build-js: lint
	@echo "Building JavaScript bundle..."
	npm run build

# Build the container using buildpacks
build:
	@echo "Building $(IMAGE_NAME) using Cloud Native Buildpacks..."
	pack build $(IMAGE_NAME) --builder $(BUILDER) --trust-builder

# Run the container (with proper port mapping)
run:
	@echo "Running $(IMAGE_NAME) on http://localhost:8080..."
	docker run -d -p 8080:8080 --name $(IMAGE_NAME) $(IMAGE_NAME)

# Stop and remove the container
stop:
	@echo "Stopping and removing $(IMAGE_NAME) container..."
	@docker stop $(IMAGE_NAME) 2>/dev/null || true
	@docker rm $(IMAGE_NAME) 2>/dev/null || true
	@echo "Container stopped and removed."

# Clean up containers and images
clean: stop
	@echo "Removing $(IMAGE_NAME) image..."
	@docker rmi $(IMAGE_NAME) 2>/dev/null || true
	@echo "Cleaned up containers and images."

# Run development server locally
dev:
	@echo "Starting development server on http://localhost:8080..."
	npm start

# Run tests
test:
	@echo "Running tests in headless mode..."
	npm run test:headless

.PHONY: all build run stop clean dev test lint build-js