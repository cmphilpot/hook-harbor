# Build the React app
FROM node:24-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build the Express server
FROM node:24-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Final image: only what's needed to run
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=client-build /app/client/dist ./client/dist
USER node
EXPOSE 3000
CMD ["node", "server/dist/index.js"]
