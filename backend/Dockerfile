# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source and config
COPY . .

# Generate Prisma client (Prisma 7 style)
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Install PostgreSQL client for running SQL scripts
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy built app
COPY --from=builder /app/dist ./dist

# Copy Prisma files and SQL scripts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x startup.sh

# Copy Prisma client generated files
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Startup script handles migrations, triggers, seeding, and server
CMD ["./startup.sh"]
