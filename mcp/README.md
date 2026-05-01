# CMS MCP Server

This workspace includes a small stdio MCP server for managing the Supabase-backed CMS content for blogs, reviews/testimonials, and projects.

## Run Locally

```bash
npm run mcp:cms
```

The server loads `.env.local` from the repo root if it exists. It expects these variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Claude Desktop Example

```json
{
  "mcpServers": {
    "mobarok-cms": {
      "command": "npm",
      "args": ["run", "mcp:cms"],
      "cwd": "e:\\mobarok-portfolio"
    }
  }
}
```

## Tools

- `blog_list`, `blog_get`, `blog_create`, `blog_update`, `blog_delete`
- `review_list`, `review_get`, `review_create`, `review_update`, `review_delete`
- `project_list`, `project_get`, `project_create`, `project_update`, `project_delete`