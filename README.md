# User tasks challenge

### Badges
[![CircleCI](https://dl.circleci.com/status-badge/img/circleci/WHSMgy394bmpxbuxPs3Xpa/CbDH9157LcvoG7mRJh28vH/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/circleci/WHSMgy394bmpxbuxPs3Xpa/CbDH9157LcvoG7mRJh28vH/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/santiagopedrozo/user-tasks-api/badge.svg?branch=coveralls-integration-v2)](https://coveralls.io/github/santiagopedrozo/user-tasks-api?branch=coveralls-integration-v2)


#### Things that can be done to improve:
1. All the unit and integration test are skipped and must be resolved in the future, the critics endpoints of business logic are covered with e2e
2. The redis implementation is only used to satisfy the sql queries cache, the implementation should be abstracted to another layer to make it easier to use if any new features needs redis as well
3. The sync implementation for the tasks API is optimized for low-volume operations (e.g., around 2,000 records). For larger datasets, this solution is not well-suited, and more robust strategies such as batching or connection pooling will be necessary

### Decisions taken

- Service, Repository and client were created to split business logic from storage (Even when the storage is another API).
- Added an extra abstract layer to Client of external tasks to change easily the API if needed.
- Used clean architecture by splitting outside communication from app domain. And the app domains is splitted into controller, service, repository and client. This makes the application easy to extend and modify without having to affect further functionalities.
- All the domain errors are mapped by a http error mapper to avoid http implementations on the service, also implemented a global exception filter to avoid unhandled rejects
- Used logger pino to normalize all logging implementation
- JWT-Based Authentication (Access + Refresh Tokens). More info on `jwt-auth-readme`.
- Selected endpoints implements cache with redis
- Added a layer to the postgres connection to implement the migration configurations.
- The rate limit security is based on the nest throttler module
- The basic API doc is covered with swagger to give a nice approach to the whole App
- E2E tests were prioritized due lack of time, the selected endpoints to test represents the core business logic 
- Env vars were handled with `config` library.
- Docker was used to make the app more reproducible and easier to deploy in cloud providers.
- Nest was chosen because it has a very nice approach to apply clean architecture out of the box by fostering dependency inversion principle with modules.
- Typescript was used because static type checks help a lot by preventing some bugs.

### Features

- [] Register a new `user`, then login and start adding tasks.
- [] A regular user can access a crud of their own tasks.
- [] With an admin user the external tasks can be synced if found tasks for existing users.
- [] Also, with an admin user can create, update, delete tasks of another user.

## Table of contents

- [Technology](#Technology)
- [Routes](#Routes)
- [PreRequisites](#Pre-requisites)
- [Run APP](#Run-APP)
- [Run tests](#Run-tests)


## Technology

- Programming languaje: Typesscript
- APP Framework: Nest JS
- Containers: Docker, Docker-compose
- Deployment: Coveralls and Travis

## Routes

- API swagger: http://localhost:3000/api#/
- 
## Pre-requisites

- Docker and docker compose installed.
- Linux/Mac terminal (Or emulated linux on Windows)
- No services running on localhost port 3000.

### Run APP with Docker

1. Execute script to run the app.

```
chmod 777 ./up_dev.sh
./up_dev.sh
```

2. Go to the swagger http://localhost:3000/api and test the app or consume api through curl or postman with default api key: `defaultApiKey`

3. Press Control + C to stop the app.

### Run tests with Docker

Being at the same point before last step type:

```
chmod 777 ./up_test.sh
./up_test.sh
```

### Author

Santiago Pedrozo

- GitHub: https://github.com/santiagopedrozo
- LinkedIn: https://www.linkedin.com/feed/