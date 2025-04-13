import { gemini25ProExp0325 } from '@genkit-ai/googleai';
import { googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";
import { dirname } from "path";
import { fileURLToPath } from "url";

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini25ProExp0325,
  promptDir: dirname(fileURLToPath(import.meta.url)),
});

export { z } from "genkit";
