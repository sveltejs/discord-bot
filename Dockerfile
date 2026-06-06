FROM ghcr.io/ghostdevv/node:26-alpine

WORKDIR /app
COPY . .

RUN pnpm install

CMD ["pnpm", "start"]
