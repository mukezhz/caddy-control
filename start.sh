#!/bin/sh
echo "Running migrations..."
pnpx prisma@6.5.0 migrate deploy

# check if migration was successful
if [ $? -eq 0 ]; then
  echo "Migrations completed successfully"
else
  echo "Migration failed! The application may not work correctly."
  # We continue anyways, as the application might still work with the existing schema
fi

# Start the application
echo "Starting Next.js application..."
exec node server.js
