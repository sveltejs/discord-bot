FROM golang:1.24-alpine AS build

WORKDIR /app
COPY . .

RUN go build

FROM alpine:3.14

RUN apk add --no-cache curl

WORKDIR /app
COPY --from=build /app/svelte-bot-db .

CMD ["./svelte-bot-db", "serve", "--http", "0.0.0.0:8090"]
