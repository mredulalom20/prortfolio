import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), "..");
const shellEnvKeys = new Set(Object.keys(process.env));

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const withoutExport = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
  const separatorIndex = withoutExport.indexOf("=");
  if (separatorIndex === -1) {
    return null;
  }

  const key = withoutExport.slice(0, separatorIndex).trim();
  if (!key) {
    return null;
  }

  let value = withoutExport.slice(separatorIndex + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

async function loadEnvFile(filePath, { override = false } = {}) {
  try {
    const contents = await fs.readFile(filePath, "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        continue;
      }

      if (shellEnvKeys.has(parsed.key)) {
        continue;
      }

      if (!override && Object.prototype.hasOwnProperty.call(process.env, parsed.key)) {
        continue;
      }

      process.env[parsed.key] = parsed.value;
    }
  } catch (error) {
    if (error?.code === "ENOENT") {
      return;
    }

    throw error;
  }
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeList(value, fieldName) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(String(item))).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => normalizeText(String(item))).filter(Boolean);
        }
      } catch {
        // Fall back to simple splitting.
      }
    }

    return trimmed
      .split(/[\n,]/)
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  throw new Error(`${fieldName} must be a string or an array of strings`);
}

function normalizeJsonObject(value, fieldName) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    try {
      return normalizeJsonObject(JSON.parse(trimmed), fieldName);
    } catch {
      throw new Error(`${fieldName} must be valid JSON`);
    }
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  throw new Error(`${fieldName} must be an object or JSON object string`);
}

function compactObject(entries) {
  return Object.fromEntries(
    Object.entries(entries).filter(([, value]) => value !== undefined)
  );
}

function slugify(value) {
  const base = String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return base || `post-${Date.now().toString(36)}`;
}

function jsonResult(payload) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

let supabaseClient;

function createDbClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

async function fetchSingleRow(table, column, value, label) {
  const { data, error } = await createDbClient()
    .from(table)
    .select("*")
    .eq(column, value)
    .limit(1);

  if (error) {
    throw error;
  }

  const record = data?.[0];
  if (!record) {
    throw new Error(`${label} not found`);
  }

  return record;
}

async function insertSingleRow(table, payload, label) {
  const { data, error } = await createDbClient()
    .from(table)
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(`Unable to create ${label.toLowerCase()}`);
  }

  return data;
}

async function updateSingleRow(table, id, payload, label) {
  const { data, error } = await createDbClient()
    .from(table)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(`${label} not found`);
  }

  return data;
}

async function deleteRowById(table, id, label) {
  const { error } = await createDbClient().from(table).delete().eq("id", id);
  if (error) {
    throw error;
  }

  return { success: true, label, id };
}

async function blogSlugExists(slug, excludeId) {
  let query = createDbClient().from("blogs").select("id").eq("slug", slug).limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return Array.isArray(data) && data.length > 0;
}

async function uniqueBlogSlug(source, excludeId) {
  const base = slugify(source);
  let candidate = base;
  let suffix = 2;

  while (await blogSlugExists(candidate, excludeId)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function startCmsMcpServer() {
  await loadEnvFile(path.join(projectRoot, ".env"));
  await loadEnvFile(path.join(projectRoot, ".env.local"), { override: true });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment or .env.local file."
    );
  }

  createDbClient();

  const server = new McpServer(
    {
      name: "mobarok-cms",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
      instructions:
        "Use these tools to manage the Supabase-backed CMS for blogs, reviews, and projects. This server writes directly with the service role key, so only run it in a trusted local environment.",
    }
  );

  server.registerTool(
    "blog_list",
    {
      title: "List Blog Posts",
      description:
        "List blog posts from the CMS. Set publishedOnly to true to restrict the results to public posts.",
      inputSchema: z.object({
        publishedOnly: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      }),
    },
    async ({ publishedOnly, limit }) => {
      let query = createDbClient()
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit ?? 20);

      if (publishedOnly === true) {
        query = query.eq("published", true);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return jsonResult({
        entity: "blog",
        action: "list",
        count: data?.length ?? 0,
        blogs: data ?? [],
      });
    }
  );

  server.registerTool(
    "blog_get",
    {
      title: "Get Blog Post",
      description: "Fetch a blog post by id or slug.",
      inputSchema: z
        .object({
          id: z.string().trim().min(1).optional(),
          slug: z.string().trim().min(1).optional(),
        })
        .refine((value) => Boolean(value.id || value.slug), {
          message: "Provide either id or slug",
        }),
    },
    async ({ id, slug }) => {
      const column = slug ? "slug" : "id";
      const value = slug || id;
      const blog = await fetchSingleRow("blogs", column, value, "Blog");

      return jsonResult({
        entity: "blog",
        action: "get",
        blog,
      });
    }
  );

  server.registerTool(
    "blog_create",
    {
      title: "Create Blog Post",
      description: "Create a blog post in the CMS.",
      inputSchema: z.object({
        title: z.string().trim().min(1),
        slug: z.string().trim().min(1).optional(),
        content: z.string().trim().min(1),
        featuredImage: z.string().trim().min(1).optional(),
        metaTitle: z.string().trim().min(1).optional(),
        metaDescription: z.string().trim().min(1).optional(),
        published: z.boolean().optional(),
      }),
    },
    async ({ title, slug, content, featuredImage, metaTitle, metaDescription, published }) => {
      const resolvedSlug = await uniqueBlogSlug(slug || title);
      const blog = await insertSingleRow(
        "blogs",
        compactObject({
          title: normalizeText(title),
          slug: resolvedSlug,
          content: normalizeText(content),
          featuredImage: normalizeText(featuredImage),
          metaTitle: normalizeText(metaTitle),
          metaDescription: normalizeText(metaDescription),
          published: published ?? false,
        }),
        "Blog"
      );

      return jsonResult({
        entity: "blog",
        action: "create",
        blog,
      });
    }
  );

  server.registerTool(
    "blog_update",
    {
      title: "Update Blog Post",
      description: "Update an existing blog post.",
      inputSchema: z.object({
        id: z.string().trim().min(1),
        title: z.string().trim().min(1).optional(),
        slug: z.string().trim().min(1).optional(),
        content: z.string().trim().min(1).optional(),
        featuredImage: z.string().trim().min(1).optional(),
        metaTitle: z.string().trim().min(1).optional(),
        metaDescription: z.string().trim().min(1).optional(),
        published: z.boolean().optional(),
      }),
    },
    async ({ id, title, slug, content, featuredImage, metaTitle, metaDescription, published }) => {
      const payload = compactObject({
        title: normalizeText(title),
        slug: slug ? await uniqueBlogSlug(slug, id) : undefined,
        content: normalizeText(content),
        featuredImage: normalizeText(featuredImage),
        metaTitle: normalizeText(metaTitle),
        metaDescription: normalizeText(metaDescription),
        published,
      });

      if (Object.keys(payload).length === 0) {
        throw new Error("No fields were provided for the blog update");
      }

      const blog = await updateSingleRow("blogs", id, payload, "Blog");

      return jsonResult({
        entity: "blog",
        action: "update",
        blog,
      });
    }
  );

  server.registerTool(
    "blog_delete",
    {
      title: "Delete Blog Post",
      description: "Delete a blog post by id.",
      inputSchema: z.object({
        id: z.string().trim().min(1),
      }),
    },
    async ({ id }) => {
      const result = await deleteRowById("blogs", id, "Blog");
      return jsonResult({
        entity: "blog",
        action: "delete",
        ...result,
      });
    }
  );

  server.registerTool(
    "review_list",
    {
      title: "List Reviews",
      description:
        "List reviews or testimonials from the CMS. Set publishedOnly to true to restrict the results to public reviews.",
      inputSchema: z.object({
        publishedOnly: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      }),
    },
    async ({ publishedOnly, limit }) => {
      let query = createDbClient()
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit ?? 20);

      if (publishedOnly === true) {
        query = query.eq("published", true);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return jsonResult({
        entity: "review",
        action: "list",
        count: data?.length ?? 0,
        reviews: data ?? [],
      });
    }
  );

  server.registerTool(
    "review_get",
    {
      title: "Get Review",
      description: "Fetch a review or testimonial by id.",
      inputSchema: z.object({
        id: z.string().trim().min(1),
      }),
    },
    async ({ id }) => {
      const review = await fetchSingleRow("reviews", "id", id, "Review");

      return jsonResult({
        entity: "review",
        action: "get",
        review,
      });
    }
  );

  server.registerTool(
    "review_create",
    {
      title: "Create Review",
      description: "Create a review or testimonial in the CMS.",
      inputSchema: z.object({
        name: z.string().trim().min(1),
        role: z.string().trim().min(1).optional(),
        message: z.string().trim().min(1),
        avatar_url: z.string().trim().min(1).optional(),
        published: z.boolean().optional(),
      }),
    },
    async ({ name, role, message, avatar_url, published }) => {
      const review = await insertSingleRow(
        "reviews",
        compactObject({
          name: normalizeText(name),
          role: normalizeText(role),
          message: normalizeText(message),
          avatar_url: normalizeText(avatar_url),
          published: published ?? true,
        }),
        "Review"
      );

      return jsonResult({
        entity: "review",
        action: "create",
        review,
      });
    }
  );

  server.registerTool(
    "review_update",
    {
      title: "Update Review",
      description: "Update an existing review or testimonial.",
      inputSchema: z.object({
        id: z.string().trim().min(1),
        name: z.string().trim().min(1).optional(),
        role: z.string().trim().min(1).optional(),
        message: z.string().trim().min(1).optional(),
        avatar_url: z.string().trim().min(1).optional(),
        published: z.boolean().optional(),
      }),
    },
    async ({ id, name, role, message, avatar_url, published }) => {
      const payload = compactObject({
        name: normalizeText(name),
        role: normalizeText(role),
        message: normalizeText(message),
        avatar_url: normalizeText(avatar_url),
        published,
      });

      if (Object.keys(payload).length === 0) {
        throw new Error("No fields were provided for the review update");
      }

      const review = await updateSingleRow("reviews", id, payload, "Review");

      return jsonResult({
        entity: "review",
        action: "update",
        review,
      });
    }
  );

  server.registerTool(
    "review_delete",
    {
      title: "Delete Review",
      description: "Delete a review or testimonial by id.",
      inputSchema: z.object({
        id: z.string().trim().min(1),
      }),
    },
    async ({ id }) => {
      const result = await deleteRowById("reviews", id, "Review");
      return jsonResult({
        entity: "review",
        action: "delete",
        ...result,
      });
    }
  );

  server.registerTool(
    "project_list",
    {
      title: "List Projects",
      description:
        "List projects from the CMS. Filter by category or service when you need a narrower result set.",
      inputSchema: z.object({
        category: z.string().trim().min(1).optional(),
        service: z.union([z.array(z.string().trim().min(1)), z.string().trim().min(1)]).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      }),
    },
    async ({ category, service, limit }) => {
      let query = createDbClient()
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit ?? 20);

      if (category) {
        query = query.ilike("category", `%${category}%`);
      }

      const serviceFilter = normalizeList(service, "service");
      if (serviceFilter && serviceFilter.length > 0) {
        query = query.contains("service", serviceFilter);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return jsonResult({
        entity: "project",
        action: "list",
        count: data?.length ?? 0,
        projects: data ?? [],
      });
    }
  );

  server.registerTool(
    "project_get",
    {
      title: "Get Project",
      description: "Fetch a project by id.",
      inputSchema: z.object({
        id: z.string().trim().min(1),
      }),
    },
    async ({ id }) => {
      const project = await fetchSingleRow("projects", "id", id, "Project");

      return jsonResult({
        entity: "project",
        action: "get",
        project,
      });
    }
  );

  server.registerTool(
    "project_create",
    {
      title: "Create Project",
      description: "Create a project or case study in the CMS.",
      inputSchema: z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
        category: z.string().trim().min(1),
        service: z.union([z.array(z.string().trim().min(1)), z.string().trim().min(1)]).optional(),
        images: z.union([z.array(z.string().trim().min(1)), z.string().trim().min(1)]).optional(),
        thumbnail: z.string().trim().min(1).optional(),
        externalLink: z.string().trim().min(1).optional(),
        additionalFields: z.any().optional(),
      }),
    },
    async ({ title, description, category, service, images, thumbnail, externalLink, additionalFields }) => {
      const project = await insertSingleRow(
        "projects",
        compactObject({
          title: normalizeText(title),
          description: normalizeText(description),
          category: normalizeText(category),
          service: normalizeList(service, "service") ?? [],
          images: normalizeList(images, "images"),
          thumbnail: normalizeText(thumbnail),
          externalLink: normalizeText(externalLink),
          additionalFields: normalizeJsonObject(additionalFields, "additionalFields"),
        }),
        "Project"
      );

      return jsonResult({
        entity: "project",
        action: "create",
        project,
      });
    }
  );

  server.registerTool(
    "project_update",
    {
      title: "Update Project",
      description: "Update an existing project or case study.",
      inputSchema: z.object({
        id: z.string().trim().min(1),
        title: z.string().trim().min(1).optional(),
        description: z.string().trim().min(1).optional(),
        category: z.string().trim().min(1).optional(),
        service: z.union([z.array(z.string().trim().min(1)), z.string().trim().min(1)]).optional(),
        images: z.union([z.array(z.string().trim().min(1)), z.string().trim().min(1)]).optional(),
        thumbnail: z.string().trim().min(1).optional(),
        externalLink: z.string().trim().min(1).optional(),
        additionalFields: z.any().optional(),
      }),
    },
    async ({ id, title, description, category, service, images, thumbnail, externalLink, additionalFields }) => {
      const payload = compactObject({
        title: normalizeText(title),
        description: normalizeText(description),
        category: normalizeText(category),
        service: service === undefined ? undefined : normalizeList(service, "service") ?? [],
        images: images === undefined ? undefined : normalizeList(images, "images"),
        thumbnail: normalizeText(thumbnail),
        externalLink: normalizeText(externalLink),
        additionalFields: normalizeJsonObject(additionalFields, "additionalFields"),
      });

      if (Object.keys(payload).length === 0) {
        throw new Error("No fields were provided for the project update");
      }

      const project = await updateSingleRow("projects", id, payload, "Project");

      return jsonResult({
        entity: "project",
        action: "update",
        project,
      });
    }
  );

  server.registerTool(
    "project_delete",
    {
      title: "Delete Project",
      description: "Delete a project or case study by id.",
      inputSchema: z.object({
        id: z.string().trim().min(1),
      }),
    },
    async ({ id }) => {
      const result = await deleteRowById("projects", id, "Project");
      return jsonResult({
        entity: "project",
        action: "delete",
        ...result,
      });
    }
  );

  const transport = new StdioServerTransport();

  const shutdown = async () => {
    await server.close();
  };

  process.once("SIGINT", () => {
    void shutdown().finally(() => process.exit(0));
  });

  process.once("SIGTERM", () => {
    void shutdown().finally(() => process.exit(0));
  });

  await server.connect(transport);
}

export { startCmsMcpServer };

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  startCmsMcpServer().catch((error) => {
    console.error("[mobarok-cms] Failed to start MCP server:", error);
    process.exit(1);
  });
}