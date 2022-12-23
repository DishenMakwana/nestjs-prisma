# NestJS Template

## Getting started

```sh
npm install
npm run prisma:generate
npm run prepare
npm run build
cp .env.dev .env
```

##### Changes in .env file according the project and change in prisma.schema file according to the usage.

_Note: One can delete the migration for the first time, if there is change in the schema of user. Then migrate_

### Migration

```sh
npm run prisma:migrate
```

- If prompt to enter migration name give appropriate name

```sh
npm run prisma:seed
```

- If not seed during migration run above command

### UI for database / Model

```sh
npm run prisma:studio
```

### Server

```sh
Development - npm run start:dev
Production - npm run start:prod
Staging - npm run start or npm start
```

### API Docs / Swagger

Go to: <base-url>/api/docs
Enter below credentials:

```
username: admin
password: Admin@123
```

### Watchtower

[Watchtower](https://containrrr.dev/watchtower)

### Docker multi-stage build

```bash
docker buildx build --push --platform linux/amd64,linux/arm64,linux/arm/v7 -t dishenmakwana/nestjs-prisma .
```
