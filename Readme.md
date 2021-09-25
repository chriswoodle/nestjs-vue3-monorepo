# NestJS + Vue 3 Monorepo


## Setup
```
yarn install
```

## Dev 

### Build and run the API
> Obtain a `.env` file with the appropiate settings and put in `./api`

```
cd api
yarn build
yarn start:dev
```
Open web browser and navigate to swagger ui (defaults to localhost:3000)

### Build the Client SDK
> First build and run the API, it will write the openapi spec to `/api/docs/api-json.json` on startup.

```
cd .
yarn generate-client
cd @app/client
yarn build
```

### Run the Web
> First build the Client SDK

Obtain a `.env` file with the appropiate settings and put in `./web`
```
cd web
yarn dev
```
Open web browser and navigate to the application (defaults to localhost:8080)


## More notes

1. yarn watch (to run nodemon and rebuild swagger everytime)