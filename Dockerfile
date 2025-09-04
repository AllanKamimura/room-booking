# Build stage
FROM node:18-alpine AS build

WORKDIR /app
# Copy only necessary files for build
COPY package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm ci
RUN npm run build

# Production stage
FROM node:18-alpine AS prod

ARG ROOM_API_BASE_URL
ENV VITE_ROOM_API_BASE_URL=$ROOM_API_BASE_URL

WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
