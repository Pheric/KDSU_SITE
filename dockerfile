FROM node:10.15.1-alpine AS Front-End-Builder

COPY .npmrc package-lock.json package.json tsconfig.json ./

RUN npm install

COPY ./src ./src
COPY ./public ./public

RUN npm run build


FROM golang:1.11.3-alpine3.8 AS Back-End-Builder

# Add ca-certificates to get the proper certs for making requests,
# gcc and musl-dev for any cgo dependencies, and
# git for getting dependencies residing on github
RUN apk update && \
    apk add --no-cache ca-certificates gcc git musl-dev

WORKDIR /go/src/github.com/the-rileyj/KDSU_SITE/

COPY ./back-end/server.go .

# Get dependencies locally, but don't install
RUN go get -d -v ./...

# Compile program statically with local dependencies
RUN env CGO_ENABLED=0 go build -ldflags '-extldflags "-static"' -a -v -o server

# Last stage of build, adding in files and running
# newly compiled webserver
FROM scratch

# Copy the Go program compiled in the second stage
COPY --from=Back-End-Builder /go/src/github.com/the-rileyj/KDSU_SITE/ /

# Copy the static front-end files transpiled in the first stage
COPY --from=Front-End-Builder /build /static

COPY ./back-end/info.json /

# Add HTTPS Certificates for making HTTP requests from the webserver
COPY --from=Back-End-Builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Expose ports 80 to host machine
EXPOSE 8001

# Run program
ENTRYPOINT ["/server"]