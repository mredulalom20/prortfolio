# Graph Report - mobarok-portfolio  (2026-05-23)

## Corpus Check
- 59 files · ~108,036 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 151 nodes · 156 edges · 7 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 16 edges
2. `DELETE()` - 11 edges
3. `POST()` - 9 edges
4. `PATCH()` - 7 edges
5. `createDbClient()` - 7 edges
6. `generateMetadata()` - 6 edges
7. `Home Page (index.html)` - 6 edges
8. `PUT()` - 5 edges
9. `UPLOAD_DIR()` - 5 edges
10. `TRASH_DIR()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `DELETE()` --calls--> `deleteRowById()`  [INFERRED]
  app\api\team\route.js → mcp\cms-mcp-server.mjs
- `GET()` --calls--> `POST()`  [INFERRED]
  app\api\team\[id]\route.js → app\api\team\route.js
- `POST()` --calls--> `GET()`  [INFERRED]
  app\api\upload\route.js → app\seo\route.js
- `GET()` --calls--> `UPLOAD_DIR()`  [EXTRACTED]
  app\api\team\[id]\route.js → app\api\media\trash\route.js
- `GET()` --calls--> `TRASH_DIR()`  [EXTRACTED]
  app\api\team\[id]\route.js → app\api\media\trash\route.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.24
Nodes (7): DELETE(), GET(), PATCH(), POST(), PUT(), TRASH_DIR(), UPLOAD_DIR()

### Community 1 - "Community 1"
Cohesion: 0.19
Nodes (11): blogSlugExists(), createDbClient(), deleteRowById(), fetchSingleRow(), insertSingleRow(), loadEnvFile(), parseEnvLine(), slugify() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (7): BlogPostPage(), generateMetadata(), getBlog(), getMember(), getProject(), ProjectCaseStudyPage(), TeamMemberPage()

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (7): About Page, Blog Page, Graphic Design Service, Home Page (index.html), Meta Ads Management, UI/UX Design Service, WordPress CMS Development

### Community 5 - "Community 5"
Cohesion: 0.53
Nodes (4): getFileTooLargeMessage(), getMaxUploadBytes(), getMaxUploadMb(), getUploadErrorMessage()

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (3): GET(), POST(), sanitizeFilename()

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (2): BlogPage(), getBlogs()

## Knowledge Gaps
- **6 isolated node(s):** `About Page`, `Graphic Design Service`, `UI/UX Design Service`, `Meta Ads Management`, `WordPress CMS Development` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 12`** (3 nodes): `page.js`, `BlogPage()`, `getBlogs()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DELETE()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `deleteRowById()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `About Page`, `Graphic Design Service`, `UI/UX Design Service` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._