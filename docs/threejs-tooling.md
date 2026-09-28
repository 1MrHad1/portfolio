# Three.js tooling

What was used to build the 3D layer, and how to set it up on another machine.

## Three.js Resources MCP

A free, read-only MCP server with Three.js guides, tested code snippets, a GLSL → TSL
converter, and a showcase and tools directory. It needs no API key.

It's already declared for this repo in `.mcp.json`, so Claude Code offers to enable it when you
open the project. To install it for every project instead:

```bash
claude mcp add -s user --transport http threejsresources https://threejsresources.com/api/mcp
```

Useful tools: `threejs_search_guides` → `threejs_get_guide`, `threejs_get_code_snippet`,
`threejs_convert_glsl_to_tsl` (for a future move to the WebGPU renderer).

The particle field follows its `/guides/particles` advice: keep the simulation on the GPU and
never re-upload position buffers each frame.

## Claude skills

The ten skills from [CloudAI-X/threejs-skills](https://github.com/cloudai-x/threejs-skills) (MIT)
are installed user-wide in `~/.claude/skills/`:

`threejs-fundamentals` · `threejs-geometry` · `threejs-materials` · `threejs-lighting` ·
`threejs-textures` · `threejs-animation` · `threejs-loaders` · `threejs-shaders` ·
`threejs-postprocessing` · `threejs-interaction`

They are reference documents only, with no scripts. To install them on another machine:

```bash
git clone --depth 1 https://github.com/CloudAI-X/threejs-skills /tmp/threejs-skills
cp -R /tmp/threejs-skills/skills/* ~/.claude/skills/
```

## Design references

- **Inspo MCP**: dark, technical developer and dev-tool sites. It pointed to a bento grid for
  case studies and a grotesk display face (Geist).
- **21st.dev MCP**: the React island layer (`ScrollReveal`, `CountUp`); see
  `docs/21st-dev-mcp.md`.
