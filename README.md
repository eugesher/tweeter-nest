<h1 align="center">Tweeter</h1>

<div align="center">
   Solution for a challenge from  <a href="https://devchallenges.io" target="_blank">devchallenges.io</a>.
</div>

<div align="center">
  <h3>
    <a href="https://devchallenges.io/challenges/rleoQc34THclWx1cFFKH">
      Challenge
    </a>
  </h3>
</div>

## Features

This application was created as a submission to a [DevChallenges](https://devchallenges.io) challenge. The [challenge](https://devchallenges.io/challenges/rleoQc34THclWx1cFFKH) was to build an application to complete the given user stories.

### Authentication

* Register new account
* Log in
* Return JWT token

### Users

* Edit profile
* Get profile details by username

### Tweets

* Create tweet
* Delete tweet
* Explore tweets by latest
* Like tweet
* Reply tweet
* Get profile tweets and retweets
* Get profile liked tweets

## Upcoming features

* Follow profile
* Get following profiles
* Get follower profiles
* Save tweet to bookmarks
* Get bookmarks
* Set tweet to be public or only follower
* Get feed by following profiles
* Create comment
* Like comment
* Add hashtags to tweets
* Get most popular hashtags
* Explore tweets by top
* Get most popular profiles
* Authenticate with at least one of the following services: Google, Facebook, Twitter or GitHub

## Built With

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Database

```bash
# drop database
$ npm run db:drop

# run migrations
$ npm run db:migrate

# seed fake data
$ npm run db:seed
```
