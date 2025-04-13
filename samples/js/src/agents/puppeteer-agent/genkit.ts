import { genkit } from "genkit/beta";
import {anthropic,claude37Sonnet} from 'genkitx-anthropic';
import { mcpClient } from 'genkitx-mcp';
import { defineCodeFormat } from "./code-format.js";
const puppeteerMcpClient = mcpClient({
  name: "puppeteer",
  serverProcess: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  },
});

// もし他にmcpを使う場合は同様に追加し、pluginsに追加してください
// const puppeteerMcpClient = mcpClient({
//   name: "filesystem",
//   serverProcess: {
//     command: "npx",
//     args: ["-y", "@modelcontextprotocol/server-everything"],
//   },
// });

export const ai = genkit({
  plugins: [anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }), puppeteerMcpClient],
  model: claude37Sonnet,
});

defineCodeFormat(ai);

export { z } from "genkit/beta";
