FROM ghcr.io/ghostdevv/node:22-alpine

WORKDIR /app
COPY . .

RUN pnpm install

CMD ["pnpm", "start"]
