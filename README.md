# nestjs-api

## Getting started

- use [volta](https://volta.sh/) for node version management and use project node version define in package.json

```bash
yarn install
yarn run prisma:generate
yarn run build
cp .env.dev .env
```

Changes in .env file according the project and change in prisma.schema file according to the usage

_Note: One can delete the migration for the first time, if there is change in the schema of user._

### Migration

```bash
yarn run prisma:migrate
```

#### If prompt to enter migration name give appropriate name

```bash
yarn run prisma:seed
```

### UI for database / Model

```bash
yarn run prisma:studio
```

### Server

```bash
Development - yarn run start:dev
Production - yarn run start
Staging - yarn run start or yarn start
```

### API Docs / Swagger

Go to: {base-url}/api/docs
Enter below credentials:

```bash
username: admin
password: Admin@123
```

#### Generate only migration file for changes in schema

```bash
npx prisma migrate dev --create-only
```

#### Share Live API

```bash
npx localtunnel --port 5003 --subdomain=nestjs-api
```

#### Run debugger

- add .vscode/launch.json file

```bash
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach",
      "port": 9229,
      "type": "node",
      "request": "attach",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Generate ES512 private key for JWT Secret

```bash
openssl ecparam -name secp521r1 -genkey -noout -out private.pem

```

#### [Mailpit](https://github.com/axllent/mailpit) for testing email

```bash
docker compose -f docker-compose-mailpit.yml up -d
```

- set mailpit config in .env file

```bash
MAIL_HOST=localhost
MAIL_PORT=1025
```

#### [Soketi](https://docs.soketi.app/) for communication between server and client in real time using pusher

```bash
docker compose -f docker-compose-soketi.yml up -d
```

- update inbound rules in aws security group for port 6001
- if you are using cloudpanel then update inbound rules in cloudpanel for port 6001 from Admin Area Security Tab

#### Connect Cloudpanel database locally

- update inbound rules in cloudpanel for port 3306 from Admin Area Security Tab
- create one user with all privileges to access database locally

#### TODO

- Store email sent with subject in database with timestamp
- Store otp expiry time and maintain separate table for otp
- For reset-password use link instead of otp
