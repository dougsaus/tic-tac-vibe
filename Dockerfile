# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the application from a lightweight server
FROM nginx:stable-alpine

# Copy the index.html file
COPY --from=builder /app/index.html /usr/share/nginx/html/

# Copy the built assets into a 'dist' directory
COPY --from=builder /app/dist/ /usr/share/nginx/html/dist/

# Copy the sound assets
COPY --from=builder /app/assets/ /usr/share/nginx/html/assets/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]