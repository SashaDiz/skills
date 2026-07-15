# PosteAhora — Agent Skills

Agent **skills** + **MCP connector** that let Claude (and other agents) plan
content, collect post ideas, schedule and publish across your connected social
networks — Instagram, X/Twitter, LinkedIn, Threads, Facebook, TikTok and more —
straight from a chat, powered by [PosteAhora](https://posteahora.com).

## Install

Install every skill into your agent in one command ([`skills` CLI](https://github.com/vercel-labs/skills)):

```bash
npx skills add posteahora/agent
```

This drops the skills into `.claude/skills/` (or your agent's skills directory).
Or clone this repo and copy the `skills/` folders manually.

## Connect the MCP server

The skills call PosteAhora's hosted **MCP connector**:

1. In PosteAhora → **Settings → API & integrations**, generate your **Connector
   URL** (requires the API/MCP add-on). It looks like `https://mcp.posteahora.com/mcp/u_…`.
2. Add it to your MCP client — either edit [`.mcp.json`](.mcp.json) and replace
   `REPLACE_WITH_YOUR_CONNECTOR_TOKEN`, or paste the URL in your agent's
   **Settings → Connectors**.

Prefer a local (stdio) setup with an API key instead of the hosted connector? Use
the [`@posteahora/mcp`](https://github.com/posteahora/mcp) package.

## Skills

| Skill | What it does |
|-------|--------------|
| `collect-post-ideas` | Brainstorm post ideas straight into your Ideas board (never publishes). |
| `schedule-content` | Create, schedule and publish posts across your connected channels. |
| `analytics-report` | Summarize how your posts are performing, and seed follow-up ideas. |

Just talk to your agent:

- *"Brainstorm 8 post ideas about our launch, tag them launch"* → `collect-post-ideas`
- *"Schedule these 3 posts to Instagram and X for Tuesday morning"* → `schedule-content`
- *"How did my posts do over the last month?"* → `analytics-report`

## Tools exposed by the MCP server

`list_accounts`, `list_ideas`, `create_idea`, `update_idea`, `delete_idea`,
`create_post`, `update_post`, `delete_post`, `publish_post_now`, `schedule_post`,
`list_posts`, `get_post_status`, `get_analytics`, `create_upload_url`,
`upload_media`.

## Security

The connector URL is a **capability URL** — the secret lives in the URL, so treat
it like a password. If it leaks, hit **Revoke** in Settings → API & integrations
and a new one replaces it.

## License

MIT
