# Privacy Policy

This policy covers the data collected by the Svelte Discord bot ("the bot") when it operates in the Svelte community Discord server.

## What we collect and why

### Reputation counts ("cookies")

When you are credited as a helpful participant after a question thread is marked as solved, your Discord user ID and a running count of how many times you have been credited are stored in the database. This powers the thread solver leaderboard.

### Tag authorship

When a tag (a saved response snippet) is created, the author's Discord user ID is stored alongside it. This is used to determine who is permitted to edit or delete that tag.

### Server analytics

Every six hours, the server's approximate total member count and approximate online member count are logged as a pair of numbers. These are server-wide aggregate figures and are not linked to any individual user.

## What we do not collect

- **Message content.** The bot reads message text in memory to perform moderation and automation tasks (spam detection, link checking, thread naming, etc.), but none of this content is ever written to the database.
- **Full member profiles.** Guild member data (roles, display names) is fetched from the Discord API on demand when needed for a moderation decision or to build a solver attribution menu. It is not cached or stored.
- **Presence or activity data.** The bot does not access or store individual users' online status or activity.

## Data retention

Reputation counts and tag authorship records are stored indefinitely, as they are part of the bot's ongoing functionality. Server analytics snapshots are retained indefinitely as a growth log. If you would like your data removed, see the section below.

## Your rights

You can request deletion of any data linked to your Discord user ID (reputation counts, tag authorship) by emailing `coc@sveltesociety.dev`. We will action the request promptly.

## Third parties

The bot does not share your data with any third parties. Data is held solely on the self-hosted server that runs this bot.

## Changes to this policy

If the data we collect changes meaningfully, this document will be updated in the same repository. The commit history serves as a record of changes.
