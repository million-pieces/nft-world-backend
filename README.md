<p align="center">
  <img src="./public/files/logo.svg" />
</p>

<p align="center">
  <strong>
    A digital art <a href="https://millionpieces.io/">project</a> consisting 10.000 individual NFT tokents
  </strong>
</p>

## Description

---

- NFT world (Million Pieces) is an NFT digital art project consisting of **10,000** individual "pieces" created on the Ethereum Blockchain. 
- Pieces make up over **163** countries and **20** cities.
- By owning a piece, you can co-create the NFT world metaverse with thousands of others by uploading and displaying images within your regions.

## Deploy

---

#### Setup on local machine

**WARNING!** Current confifuration of docker-compose collects Docker logs through Loki, [read about this](#Docker logging) before moving forward.

1. Install [Docker](https://docs.docker.com/engine/install/) and [Docker composer](https://docs.docker.com/compose/install/).

2. Setup environmental variables at .APP_ENV.env file.
You can see example [here](https://github.com/million-pieces/millionpieces-backend/blob/development/.example.env).

3. Set the folder for your static files (`/million-public` by default):

```yaml
  mounts:
    /million-public-${APP_ENV}:/app/public
```

4. Then launch a project with `docker-compose --env-file .APP_ENV.env up -d`

5. After that run database migrations:

```shell
docker-compose exec backend npm run migration:up
```

##### Docker logging

If you don't want to use it, remove the following lines from docker-compose.yml:

```yml
x-logging: &logging
  logging:
    driver: loki
    options:
      loki-url: "https://${LOKI_USER}:${LOKI_PASSWORD}@${LOKI_URL}/loki/api/v1/push"
      loki-external-labels: "type=dev,repo=millionpieces-backend,job=docker,container_name={{.Name}}"
```

```yml
  <<:* logging
```

If you already have a Loki server ready, you can set related variables in .APP_ENV.env:

- `LOKI_URL` - domain name of your Loki isntance
- `LOKI_USER` - user, if your server sits behind a web server with basic authentication
- `LOKI_PASSWORD` - password for the user
- And don't forget, that you need to install a [Docker Loki plugin](https://docs.docker.com/engine/install/) on your local machine/server


## Important link and docs.

---

You can see newest version of this project [here](https://millionpieces.io/).

If you have some issues contact us via [discord](https://discord.com/invite/ZyXmhH9AwF).

Server uses NestJS framework, you cant get started with it and read the docs [here](https://docs.nestjs.com/).

Also helpful information:
- [What is NFT?](https://en.wikipedia.org/wiki/Non-fungible_token)
- [GraphQL docs](https://graphql.org/learn/)
- [TypeORM docs](https://typeorm.io/)
- [Docker docs](https://docs.docker.com/)

## License

---

The code falls under No License and cannot be reused.
All media assets (images and music) are not available for use in commercial or private projects.
