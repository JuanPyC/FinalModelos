#!/bin/sh
set -e

echo "=== Running migrations ==="
npx prisma migrate deploy

echo "=== Applying triggers and stored procedures ==="
# Extract connection details from DATABASE_URL
export DB_HOST=$(echo $DATABASE_URL | sed -n 's|.*://[^@]*@\([^:]*\):.*|\1|p')
export DB_PORT=$(echo $DATABASE_URL | sed -n 's|.*://[^@]*@[^:]*:\([0-9]*\)/.*|\1|p')
export DB_USER=$(echo $DATABASE_URL | sed -n 's|.*://\([^:]*\):.*|\1|p')
export DB_PASS=$(echo $DATABASE_URL | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
export DB_NAME=$(echo $DATABASE_URL | sed -n 's|.*/\([^?]*\).*|\1|p')

# Run each statement independently (ignore constraint already exists errors)
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --set ON_ERROR_STOP=off -f prisma/extra_constraints_and_triggers.sql 2>&1 || true

echo "=== Seeding database ==="
node prisma/seed.js

echo "=== Starting server ==="
node dist/server.js
