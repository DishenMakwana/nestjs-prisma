#!/bin/bash
set -eu


if [[ "$RUN_MIGRATION" =~ [Tt]rue ]]; then
    npx prisma migrate deploy
fi

if [[ "$RUN_SEED" =~ [Tt]rue ]]; then
    npx prisma db seed
fi


echo "Running: '$@'"
exec $@

node ./dist/src/main
