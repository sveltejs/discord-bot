FROM ghcr.io/ghostdevv/node:24-alpine

WORKDIR /app
COPY . .

RUN pnpm install

CMD ["pnpm", "start"]
