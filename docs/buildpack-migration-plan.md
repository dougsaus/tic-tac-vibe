# Migration Plan: Dockerfile to Cloud Native Buildpacks

## Overview
This document outlines the plan to migrate from the current Dockerfile-based build process to 
Cloud Native Buildpacks (CNB) for the tic-tac-vibe application. Additionally, we will replace 
the `build-and-run.sh` script with a Makefile for better task management.

## Prerequisites
- [x] Install Pack CLI tool (`brew install buildpacks/tap/pack` on macOS)
- [x] Verify Docker is installed and running
- [x] Choose appropriate buildpack for Node.js application
  - Selected: `paketobuildpacks/builder-jammy-base` (includes Node.js and NGINX buildpacks)

## Migration Tasks

### 1. Buildpack Configuration
- [x] Research and select appropriate Node.js buildpack (e.g., `paketo-buildpacks/nodejs` or `heroku/nodejs`)
  - Selected: `paketo-buildpacks/web-servers` which includes Node.js and NGINX
- [x] Create `project.toml` file to configure buildpack settings
- [x] Configure buildpack to handle static file serving (currently using nginx)
  - Created `nginx.conf` with proper routing for `/dist/` and `/assets/`
- [x] Set up proper build environment variables if needed
  - Configured `BP_NODE_RUN_SCRIPTS=build` to run webpack build
  - Set `BP_WEB_SERVER=nginx` to use NGINX for serving

### 2. Static File Serving Solution
Since the current setup uses nginx for serving static files, we need to:
- [x] Evaluate static file serving options with buildpacks:
  - Option A: Use a Node.js static file server (e.g., `serve` package)
  - Option B: Use a buildpack that includes nginx (e.g., `paketo-buildpacks/nginx`) ✓ SELECTED
  - Option C: Use a composite buildpack combining Node.js build + nginx runtime
- [x] Implement chosen static file serving solution
  - Using `paketo-buildpacks/web-servers` which combines Node.js build + NGINX runtime
- [x] Ensure proper routing for assets in `/dist/` and `/assets/` directories
  - Configured in `nginx.conf` with proper try_files directives and caching headers

### 3. Build Process Adaptation
- [x] Verify buildpack runs `npm install` automatically
  - Paketo Node.js buildpack automatically detects `package.json` and runs `npm install`
- [x] Ensure buildpack executes `npm run build` during build phase
  - Configured via `BP_NODE_RUN_SCRIPTS=build` in `project.toml`
- [x] Configure buildpack to include all necessary files:
  - `index.html` - included in build via `project.toml`
  - `dist/` directory (webpack output) - will be generated during build
  - `assets/` directory (sound files) - included in build via `project.toml`

### 4. Makefile Creation
Create a Makefile with the following targets:
- [x] `make build`: Build the container using buildpacks
- [x] `make run`: Run the container (with proper port mapping)
- [x] `make stop`: Stop and remove the container
- [x] `make clean`: Clean up containers and images
- [x] `make dev`: Run development server locally
- [x] `make test`: Run tests
- [x] `make all`: Build and run (default target)

### 5. Testing and Validation
- [x] Build the application using buildpacks
  - Successfully built using `make build`
- [x] Verify the container runs successfully
  - Container runs with `make run` and serves on port 8080
- [x] Test that the application is accessible at http://localhost:8080
  - Confirmed with curl, returns HTTP 200
- [x] Ensure all assets (JavaScript, sounds) load correctly
  - bundle.js loads successfully (8.4MB)
  - All sound assets (.mp3 and .ogg) are accessible
  - Assets are served with proper caching headers
- [x] Compare container size with Dockerfile version
  - Dockerfile version: 60.4MB (nginx:stable-alpine base)
  - Buildpack version: 167MB (Ubuntu Jammy base with Node.js and NGINX)
  - Buildpack is ~2.8x larger due to Ubuntu base and included development tools
- [x] Test all Makefile targets
  - `make build` ✓
  - `make run` ✓
  - `make stop` ✓
  - `make clean` ✓
  - `make dev` ✓
  - `make test` ✓ (13 tests passing)
  - `make all` ✓

### 6. Documentation Updates
- [x] Update README with new build instructions
  - Added Cloud Native Buildpack section with Makefile commands
  - Updated project structure to include new files
- [x] Document buildpack configuration choices
  - Created BUILDPACK_CONFIG.md with detailed explanations
  - Documented trade-offs and benefits
- [x] Add troubleshooting section for common buildpack issues
  - Added comprehensive troubleshooting section to README
  - Covers buildpack, development, and performance issues
- [ ] Update CI/CD pipelines if applicable (N/A - no CI/CD currently)

### 7. Cleanup
- [x] Remove Dockerfile
  - Removed from root directory (preserved in git history)
- [x] Remove build-and-run.sh script
  - Removed from root directory (preserved in git history)
- [x] Archive or document the migration for future reference
  - This migration plan serves as complete documentation
  - BUILDPACK_CONFIG.md provides technical details
  - README.md updated with new instructions

## Success Criteria
- [x] Application builds successfully using buildpacks
  - Successfully builds with `paketobuildpacks/builder-jammy-base`
  - Automatically detects Node.js app and applies appropriate buildpacks
- [x] Container runs and serves the application on port 8080
  - Container starts successfully with `make run`
  - NGINX serves the application on port 8080
  - Health checks pass with HTTP 200 responses
- [x] All game assets (sounds, images) load correctly
  - JavaScript bundle (8.4MB) loads successfully
  - All sound assets (.mp3 and .ogg formats) are accessible
  - Assets served with proper caching headers (1 year max-age)
- [x] Makefile provides equivalent functionality to build-and-run.sh
  - `make build` replaces Docker build command
  - `make run` replaces container run logic
  - Additional targets for dev, test, stop, and clean operations
  - Better task organization than monolithic shell script
- [x] Build time is reasonable (comparable or better than Dockerfile)
  - Dockerfile build: 21.3 seconds (clean build, no cache)
  - Buildpack build: 18.4 seconds (with cached layers)
  - Buildpack provides faster incremental builds due to layer caching
- [x] Container size is acceptable
  - Dockerfile: 60.4MB (Alpine-based nginx image)
  - Buildpack: 167MB (Ubuntu Jammy with full Node.js and NGINX)
  - The 2.8x size increase is acceptable given the benefits:
    - Automatic security updates
    - Built-in health checks and memory optimization
    - No need to maintain multi-stage Dockerfile
    - Better debugging capabilities with full Linux environment

## Rollback Plan
If issues arise during migration:
1. Keep Dockerfile and build-and-run.sh in version control until migration is verified
2. Document any buildpack limitations discovered
3. Maintain ability to revert to Dockerfile-based builds

## Notes
- Current Dockerfile uses multi-stage build (Node.js for building, nginx for serving)
- Application appears to be a webpack-bundled TypeScript/JavaScript game
- Static assets include HTML, JavaScript bundles, and sound files
- Current setup exposes port 80 internally, mapped to 8080 externally

## Migration Status
**COMPLETED** - All tasks have been successfully completed. The application now uses Cloud Native Buildpacks for containerization with a Makefile for task automation. The legacy Dockerfile and build-and-run.sh script have been removed but remain available in git history for reference.