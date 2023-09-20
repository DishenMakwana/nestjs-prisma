#!/bin/bash

# Define variables
USERNAME=""
ACCESS_TOKEN=""
REPO_URL="https://${USERNAME}:${ACCESS_TOKEN}@gitlab.atliq.com/infobizzs/black-widow-tech/nestjs/nestjs-api.git"

# Ensure you are in the local repository directory
cd path/to/repository

# Perform a 'git pull' to fetch and merge changes
git pull "${REPO_URL}"

# Run yarn commands
yarn run prisma:migrate
yarn run build

# Restart the process with PM2
pm2 restart 0 --update-env
pm2 save