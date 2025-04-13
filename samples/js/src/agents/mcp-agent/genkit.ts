import { genkit } from "genkit";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { mcpClient } from "genkitx-mcp";
import  openAI, { gpt4o } from "genkitx-openai";

const filesystemClient = mcpClient({
  name: 'filesystem',   // クライアント名（名前空間の指定）
  serverProcess: {      // ローカルでMCPサーバプロセスを起動する設定
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-everything', '/home/user/allowed_dir'],
  }
});

export const ai = genkit({
  plugins: [openAI({ apiKey: process.env.OPENAI_API_KEY })],
  model: gpt4o,
  promptDir: dirname(fileURLToPath(import.meta.url)),
});

export { z } from "genkit";
