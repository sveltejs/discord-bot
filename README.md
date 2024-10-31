# Svelte Bot - Cybernetically enhanced discord servers

Welcome to the repo for the official Svelte Discord bot!

<div align="center"><img src="https://cdn.discordapp.com/avatars/918868862198509639/41ca0acf7bdbce019a1bf05fa0ea7062.png"></div>

# Documentation

## Commands

-   Bookmark

    -   Message command that lets you save a reference to a message from the server in your DMs. Right click any message then go to `Apps` in the context menu to use.

-   Docs

    -   `/docs svelte` or `/docs sveltekit`: Quickly search the Svelte or SvelteKit docs and send a link in the chat.
    -   `/mdn` Same as above but for the MDN web docs.

-   Github

    -   `/discussion`, `/issue` or `/pr` search for matching discussions, issues or PRs in some of the `sveltejs/*` repositories and send links to the results in the chat.

-   Tags: Tags are a way to store and reuse frequent responses so that you don't have to look up and type them out every time.

    -   `/tag` Sends an existing tag to the chat.
    -   `/tags create` Create a tag. You must have the threadlord role to use it.
    -   `/tags update` Edit a tag. You must be the author of the tag to use it.
    -   `/tags delete` Delete a tag. You must be the author of the tag or have the threadlord role.

-   Threads: These are commands to manage the autothreads created by the bot. They can be used by the person who initiated the thread or by people with the threadlord role.

    -   `/thread rename`
    -   `/thread solve` Renames the thread to have a green checkmark at the start and sets the archive duration to 1hr.
    -   `/thread archive` Archive an active thread without marking it as solved.
    -   `/thread reopen` Reopen a thread that's been accidentally marked as solved.

-   Stats: _Currently disabled_ commands which let you see how many cookies‡ a user has and the server leaderboard.  
    <span style="margin-inline-start: 4ch; font-size: 0.8em;">‡ internet points for solving threads, not the evil tracking ones</small>

# Stack

Click on the links below to view the documentation on the different parts of the bot's tech stack:

-   [TypeScript](https://www.typescriptlang.org/docs/)
-   [JellyCommands](https://github.com/ghostdevv/jellycommands)
-   [Pocketbase](https://pocketbase.io)

# Config

-   The bots main config is located at [src/config.ts](src/config.ts), by default it will have the Svelte Discord & Testing configurations.
-   All secrets should be in a `.env` file, the template/example can be found [here](./.env.example).

# Contributing

All contributions are welcome, please try and make an issue first since most new features might warrant a discussion beforehand. Bug fixes probably won't need an issue and direct pull requests are ok for them.

## Running for development

You'll need at least Node 22.10, pnpm 9.12.3, and go 1.23.2.

1. Once you have the bot cloned and have run `pnpm install` then you need to make a .env file and fill out the fields:

    ```sh
    cp .env.example .env
    ```

2. Run the database locally with `pnpm db:dev`. This will also create a pocketbase admin account for you with the email `dev@local.host` and password `testtest`.

3. Run the bot with `pnpm dev`

## Code Conventions

Since there is no user facing code, prefer `snake_case` for variables and function names wherever possible. Local constants follow the same, whereas global constants should be in `SCREAMING_SNAKE_CASE`.

# Deploying

The bot uses the [tsm](https://github.com/lukeed/tsm) module loader to transpile its Typescript code on the fly so there's no build step involved.

```sh
pnpm install
pnpm start
```
