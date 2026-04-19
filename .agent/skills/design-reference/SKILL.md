---
name: design-reference
description: DEPRECATED -- Design reading now uses Figma MCP exclusively. This skill is kept for backward compatibility but contains no logic. Use figma_read/figma_write tools directly.
---

# Design Reference -- DEPRECATED

> **This skill is DEPRECATED.** Design data is now read exclusively from **Figma MCP** (figma-ui-mcp).
> Local design images, `.design-archive/`, and `{PIPELINE_ROOT}\designs\` are NO LONGER USED.

## How to read designs now:

1. Ensure Figma Desktop is open with the MCP plugin running
2. Use `figma_read` tools to get design data
3. Use `figma_status` to verify connection

> See `figma-reader` skill in BA or FE Web workspace for full protocol.
