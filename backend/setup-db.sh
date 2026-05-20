#!/bin/bash
# setup-db.sh - Complete database setup for Speak Up Academy
# Usage: ./setup-db.sh

set -e

cd "$(dirname "$0")"

echo "🔍 Checking Docker..."
if ! docker compose ps postgres >/dev/null 2>&1; then
  echo "🐳 Starting PostgreSQL container..."
  docker compose up -d postgres
  echo "⏳ Waiting for database to be ready..."
  sleep 5
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Running Prisma migrations..."
npx prisma migrate dev --name init

echo "🔧 Applying constraints, triggers and stored procedures..."
PGPASSWORD=academy_pass psql -h localhost -U academy -d english_academy_db -f prisma/extra_constraints_and_triggers.sql

echo "🌱 Seeding database with test data..."
node prisma/seed.js

echo "✅ Database setup complete!"
echo "   - 7 tables created via Prisma"
echo "   - CHECK constraints applied"
echo "   - Trigger trg_multa_por_inasistencia active"
echo "   - Stored procedure inscribir_estudiante ready"
echo "   - Test data seeded (≥10 records per table)"
