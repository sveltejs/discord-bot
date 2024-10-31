FROM golang:1.23-alpine

RUN apk add --no-cache curl

WORKDIR /app
COPY . .

RUN go build
RUN ./svelte-bot-db migrate up

CMD ["./svelte-bot-db", "serve", "--http", "0.0.0.0:8090"]
