# Svelte Bot

Welcome to the repo for the official Svelte Discord bot!

# Running for development

1. Once you have the bot cloned and have run `pnpm install` then you need to make a .env file and fill out the fields:

    ```sh
    cp .env.example .env
    ```

2. Run the bot with `pnpm dev`

> if the bot has a error of cannot find module dist/index.js just give it a sec to compile and nodemon will auto restart!

# Documentation

Click on the links below to view the documentation on the different parts of the bot's tech stack:

-   [TypeScript](https://www.typescriptlang.org/docs/)
-   [JellyCommands](https://github.com/ghostdevv/jellycommands)
-   [SupaBase](https://supabase.com/docs)

# Config

-   The bots main config is located `src/config.ts`, by default it will have the Svelte Discord & Testing configuartions.

-   All secrets should be in a `.env` file, the template/example one can be found in .env.example
