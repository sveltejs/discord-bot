# Svelte Bot

Welcome to the repo for the official Svelte Discord bot!

# Documentation

Click on the links below to view the documentation on the different parts of the bot's tech stack:

-   [TypeScript](https://www.typescriptlang.org/docs/)
-   [JellyCommands](https://github.com/ghostdevv/jellycommands)
-   [SupaBase](https://supabase.com/docs)

# Config

-   The bots main config is located at [src/config.ts](src/config.ts), by default it will have the Svelte Discord & Testing configurations.

-   All secrets should be in a `.env` file, the template/example can be found [here](./.env.example).

# Contributing

All contributions are welcome, please try and make an issue first since most new features might warrant a discussion beforehand. Bug fixes probably won't need an issue and direct pull requests are ok for them.

## Running for development

1. Once you have the bot cloned and have run `pnpm install` then you need to make a .env file and fill out the fields:

    ```sh
    cp .env.example .env
    ```

2. Run the bot with `pnpm dev`

> You might get a `MODULE_NOT_FOUND` error, just wait a while for tsc to finish compiling the files and nodemon will restart.

## Code Conventions
Since there is no user facing code, prefer `snake_case` for variables and function names wherever possible. Local constants follow the same, whereas global constants should be in `SCREAMING_SNAKE_CASE`.

# Deploying

The bot can be ran in any Node 16+ environment. It's written in typescript so you have to build it before running it:

```sh
pnpm build
pnpm start
```
