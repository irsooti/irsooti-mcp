import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { execSync } from "child_process";
import { z } from "zod";

const server = new McpServer({
  name: "irsooti-mcp",
  version: "1.0.1",
});

server.tool(
  "summarize-changes-between-branches",
  `Get the list of files changed between the current branch and the target branch, propose to use the current project absolute path as default chose by the user, or the path passed as parameter. Don't use "." as path. Create a detailed summary of the changes without showing the actual code.`,
  {
    targetBranch: z.string().describe("The target branch"),
    path: z.string().describe("The path of the file"),
  },
  async ({ targetBranch, path }) => {
    try {
      const command = `cd ${path} && git --no-pager diff ${targetBranch}`;

      const stdout = execSync(command, { encoding: "utf8" });

      return {
        content: [
          {
            mimeType: "text/plain",
            text: stdout,
            type: "text",
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            mimeType: "text/plain",
            text: `Error executing command: ${error}`,
            type: "text",
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
