import { MessageData } from "genkit";
import { TaskYieldUpdate } from "../../server/handler.js";
import {
  TaskContext,
  A2AServer,
} from "../../server/index.js"; // Import server components
import * as schema from "../../schema.js"; // Import schema for types
import { ai } from "./genkit.js";

async function* puppeteerAgent({
  task,
  history, // Extract history from context
}: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
  // Use AsyncGenerator and correct return type
  // Map A2A history to Genkit messages
  const messages: MessageData[] = (history ?? [])
    .map((m) => ({
      role: (m.role === "agent" ? "model" : "user") as "user" | "model",
      content: m.parts
        .filter((p): p is schema.TextPart => !!(p as schema.TextPart).text)
        .map((p) => ({ text: p.text })),
    }))
    .filter((m) => m.content.length > 0);

  if (messages.length === 0) {
    console.warn(`[PuppeteerAgent] No history/messages found for task ${task.id}`);
    yield {
      state: "failed",
      message: {
        role: "agent",
        parts: [{ text: "No input message found." }],
      },
    };
    return;
  }

  yield {
    state: "working",
    message: {
      role: "agent",
      parts: [{ type: "text", text: "Analyzing webpage structure..." }],
    },
  };

  const { stream, response } = await ai.generateStream({
    system: `You are an expert web analysis assistant. Your task is to analyze the webpage based on the user's request in the messages and provide a detailed report in Markdown format.

Follow these guidelines:
1. Carefully read and understand the user's request in the messages
2. Analyze the webpage according to the specific requirements mentioned
3. Always format your response in Markdown
4. Use appropriate headings, lists, and sections
5. Never generate code or scripts
6. Focus on providing clear, structured analysis based on the user's request

Your response should be a well-organized Markdown document that directly addresses the user's analysis needs.`,
    output: { format: "text" },
    messages, // Pass mapped history
  });

  let reportContent = "";
  for await (const chunk of stream) {
    const output = chunk.output as { text?: string };
    if (output?.text) {
      reportContent += output.text;
      yield {
        state: "working",
        message: {
          role: "agent",
          parts: [{ type: "text", text: `Analyzing...\n${reportContent}` }],
        },
      };
    }
  }

  const finalResponse = await response;
  const finalOutput = finalResponse.output as { text?: string };
  yield {
    state: "completed",
    message: {
      role: "agent",
      parts: [
        {
          type: "text",
          text: `Web Analysis Report:\n\n${reportContent}`,
        },
      ],
    },
  };
}

// --- Server Setup ---

const puppeteerAgentCard: schema.AgentCard = {
  name: "Puppeteer Agent",
  description: "An agent that analyzes webpages and provides detailed structural and content reports.",
  url: "http://localhost:41242",
  provider: {
    organization: "A2A Samples",
  },
  version: "0.0.1",
  capabilities: {
    // It yields artifact updates progressively, matching the definition of streaming.
    streaming: true,
    pushNotifications: false, // No indication of pushNotifications support
    stateTransitionHistory: true, // Uses history for context
  },
  authentication: null, // No auth mentioned
  defaultInputModes: ["text"],
  defaultOutputModes: ["text"],
  skills: [
    {
      id: "web_analysis",
      name: "Web Analysis",
      description: "Analyzes webpages and provides detailed reports about their structure, content, and functionality.",
      tags: ["web", "analysis", "report"],
      examples: [
        "Analyze the structure of this webpage and provide a detailed report.",
        "What are the main sections of this webpage?",
        "List all the interactive elements on this page.",
        "What is the main content of this webpage?",
        "How is this webpage organized?",
      ],
      // Although the agent outputs 'file' type via artifacts, the default is suitable here.
      // Output modes could also be refined if the agent explicitly handled different file types.
    },
  ],
};

const server = new A2AServer(puppeteerAgent, {
  card: puppeteerAgentCard,
});

server.start(41242);

console.log("[PuppeteerAgent] Server started on http://localhost:41242");
console.log("[PuppeteerAgent] Press Ctrl+C to stop the server");
