FROM golang:1.23-alpine

WORKDIR /app
COPY . .

RUN go build
RUN ./svelte-bot-db migrate up

CMD ["./svelte-bot-db", "serve"]
