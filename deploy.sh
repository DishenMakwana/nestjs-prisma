git pull

# Run yarn commands
yarn run prisma:migrate
yarn run build

# Restart the process with PM2
pm2 restart 0
pm2 save
