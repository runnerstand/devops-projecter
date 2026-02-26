# ===========================================
# STUDENT TODO: Create Frontend Dockerfile
# ===========================================
#
# Requirements:
# 1. Must use multi-stage build
# 2. Stage 1 (builder):
#    - Use node:18-alpine
#    - Install dependencies with npm ci
#    - Build the React app with npm run build
#
# 3. Stage 2 (production):
#    - Use node:18-alpine
#    - Install 'serve' package globally to serve static files
#    - Copy only the build folder from builder stage
#    - Expose port 3000
#    - Use serve to run the app
#
# Hints:
# - npm run build creates a 'build' folder
# - serve -s build -l 3000 serves the static files
# - Research: "Docker multi-stage React production"
# ===========================================
# Stage 1: Build the React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Stage 2: Serve the built app
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]