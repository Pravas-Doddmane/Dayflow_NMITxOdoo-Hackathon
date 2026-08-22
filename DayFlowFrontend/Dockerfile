# =========================================================
# Stage 1: Build the React/Vite frontend
# =========================================================
FROM node:22-alpine AS builder

WORKDIR /build

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build
COPY . .

# Accept build-time API URL (injected at docker build)
ARG VITE_API_BASE_URL=http://localhost:8081
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# =========================================================
# Stage 2: Serve with Nginx
# =========================================================
FROM nginx:1.27-alpine

LABEL maintainer="TechTitans <dev@dayflow.local>"
LABEL description="DayFlow HRMS Frontend (React + Vite)"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /build/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
