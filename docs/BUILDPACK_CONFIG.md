# Cloud Native Buildpack Configuration Documentation

This document explains the configuration choices made for the Cloud Native Buildpack implementation of the tic-tac-vibe application.

## Builder Selection

**Selected Builder:** `paketobuildpacks/builder-jammy-base`

### Rationale:
- Includes both Node.js and NGINX buildpacks needed for our application
- Based on Ubuntu 22.04 LTS (Jammy Jellyfish) for stability
- Provides the `web-servers` buildpack group that combines Node.js build with NGINX serving
- Well-maintained by the Paketo community with regular updates

### Alternative Considered:
- `heroku/builder:24` - Also includes Node.js but less suited for static file serving with NGINX

## Configuration Files

### project.toml

The `project.toml` file configures the buildpack behavior:

```toml
[_]
schema-version = "0.2"

[build]
exclude = [
  "node_modules",
  "dist",
  ".git",
  ".gitignore",
  "cypress",
  "cypress.config.ts",
  "Dockerfile",
  "build-and-run.sh",
  "*.md",
  "Makefile",
  ".DS_Store"
]

[[build.env]]
name = "BP_NODE_RUN_SCRIPTS"
value = "build"

[[build.env]]
name = "BP_WEB_SERVER"
value = "nginx"

[[build.env]]
name = "BP_WEB_SERVER_ROOT"
value = "/workspace"

[[build.env]]
name = "BP_NGINX_CONF_LOCATION"
value = "/workspace/nginx.conf"

[io.buildpacks]
builder = "paketobuildpacks/builder-jammy-base"

[[io.buildpacks.group]]
uri = "paketo-buildpacks/web-servers"
```

### Key Configuration Decisions:

1. **Exclusions**: We exclude development files, build artifacts, and documentation from the container to reduce size.

2. **Build Script**: `BP_NODE_RUN_SCRIPTS=build` ensures webpack runs during the build phase to generate the JavaScript bundle.

3. **Web Server**: `BP_WEB_SERVER=nginx` selects NGINX over Node.js for serving static files, matching the original Dockerfile approach.

4. **NGINX Configuration**: Custom `nginx.conf` is used to properly route requests and serve assets with appropriate caching headers.

### nginx.conf

The custom NGINX configuration:

1. **Port Configuration**: Uses port 8080 (standard for buildpack containers)
2. **MIME Types**: Explicitly defines MIME types since buildpack environments may not have default mime.types
3. **Asset Caching**: Long cache headers (1 year) for `/dist/` and `/assets/` directories
4. **Security Headers**: Includes X-Frame-Options, X-Content-Type-Options, and X-XSS-Protection

## Trade-offs

### Container Size
- **Buildpack**: 167MB (Ubuntu base + full Node.js runtime)
- **Dockerfile**: 60.4MB (Alpine Linux + minimal runtime)
- The larger size is acceptable for the benefits of automated dependency management and security updates

### Build Time
- Initial builds take longer due to downloading builders and buildpacks
- Subsequent builds are faster due to layer caching
- Development iteration is improved with the standardized build process

### Benefits Over Dockerfile
1. **Automatic dependency updates**: Buildpacks handle Node.js version updates
2. **Security patches**: Base images are regularly updated by Paketo
3. **No manual configuration**: No need to maintain multi-stage Dockerfile
4. **Consistent builds**: Same build process works locally and in CI/CD
5. **Built-in best practices**: Includes memory optimization and health checks

## Future Considerations

1. **Multi-architecture builds**: Currently builds for linux/amd64; could add ARM64 support
2. **Size optimization**: Could investigate slimmer builders if size becomes critical
3. **Custom buildpack**: Could create a custom buildpack for game-specific optimizations
4. **CI/CD integration**: Buildpacks work well with modern CI/CD platforms