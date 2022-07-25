# elvis

```
If npm install doesnt work, try setting your node version to any version above 10.*
```
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Start Keycloak in docker
```
docker run -p 8443:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -e JAVA_OPTS="-Dkeycloak.profile.feature.upload_scripts=enabled" quay.io/keycloak/keycloak:10.0.2
```
See [Keycloak documentation](https://www.keycloak.org/docs/latest/getting_started/)

### Keycloak
To run Keyсloak along with previously imported users, you need to run the backend in user import mode:
```
make start-with-dev-users
```
A list of users:
* requester@picturae.com (Test12345) 
* admin@picturae.com (Test12345) 
* va_coordinator@picturae.com (Test12345) 