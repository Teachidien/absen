import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new Server(
    {
        name: "absensi-tni-mcp",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Tool Definitions
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_personnel",
                description: "Retrieve a list of all personnel (users) from the database.",
                inputSchema: {
                    type: "object",
                    properties: {
                        satuan: {
                            type: "string",
                            description: "Optional: Filter by unit (satuan).",
                        },
                    },
                },
            },
            {
                name: "get_attendance",
                description: "Fetch attendance records for a specific date or personnel.",
                inputSchema: {
                    type: "object",
                    properties: {
                        date: {
                            type: "string",
                            description: "The date in YYYY-MM-DD format.",
                        },
                        nrp: {
                            type: "string",
                            description: "Optional: Filter by personnel NRP.",
                        },
                    },
                    required: ["date"],
                },
            },
            {
                name: "record_attendance",
                description: "Add a new attendance entry for a personnel.",
                inputSchema: {
                    type: "object",
                    properties: {
                        nrp: {
                            type: "string",
                            description: "NRP of the personnel.",
                        },
                        date: {
                            type: "string",
                            description: "Date in YYYY-MM-DD format.",
                        },
                        apel_type: {
                            type: "string",
                            description: "Type of roll call (e.g., 'Apel Pagi', 'Apel Siang').",
                        },
                        status: {
                            type: "string",
                            enum: ["hadir", "izin", "sakit", "terlambat", "alfa"],
                            description: "Attendance status.",
                        },
                        description: {
                            type: "string",
                            description: "Optional: Reason for permission/sickness.",
                        },
                    },
                    required: ["nrp", "date", "apel_type", "status"],
                },
            },
            {
                name: "get_personnel_stats",
                description: "Get summary of attendance for a specific personnel.",
                inputSchema: {
                    type: "object",
                    properties: {
                        nrp: {
                            type: "string",
                            description: "NRP of the personnel.",
                        },
                    },
                    required: ["nrp"],
                },
            },
        ],
    };
});

/**
 * Tool Implementations
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "list_personnel") {
            let query = supabase.from("users").select("*");
            if (args?.satuan) {
                query = query.eq("satuan", args.satuan);
            }
            const { data, error } = await query;
            if (error) throw error;
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }

        if (name === "get_attendance") {
            const { date, nrp } = z
                .object({ date: z.string(), nrp: z.string().optional() })
                .parse(args);

            let query = supabase
                .from("attendances")
                .select("*, users!inner(*)")
                .eq("date", date);

            if (nrp) {
                query = query.eq("users.nrp", nrp);
            }

            const { data, error } = await query;
            if (error) throw error;
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }

        if (name === "record_attendance") {
            const { nrp, date, apel_type, status, description } = z
                .object({
                    nrp: z.string(),
                    date: z.string(),
                    apel_type: z.string(),
                    status: z.enum(["hadir", "izin", "sakit", "terlambat", "alfa"]),
                    description: z.string().optional(),
                })
                .parse(args);

            // First, find the user ID from NRP
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("id")
                .eq("nrp", nrp)
                .single();

            if (userError || !userData) {
                return {
                    content: [
                        { type: "text", text: `Error: Personnel with NRP ${nrp} not found.` },
                    ],
                    isError: true,
                };
            }

            const { data, error } = await supabase
                .from("attendances")
                .upsert({
                    user_id: userData.id,
                    date,
                    apel_type,
                    status,
                    description,
                })
                .select();

            if (error) throw error;
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }

        if (name === "get_personnel_stats") {
            const { nrp } = z.object({ nrp: z.string() }).parse(args);

            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("id, name, nrp")
                .eq("nrp", nrp)
                .single();

            if (userError || !userData) {
                return {
                    content: [{ type: "text", text: `Error: Personnel with NRP ${nrp} not found.` }],
                    isError: true,
                };
            }

            const { data, error } = await supabase
                .from("attendances")
                .select("status")
                .eq("user_id", userData.id);

            if (error) throw error;

            const stats = data.reduce((acc: Record<string, number>, curr: { status: string }) => {
                acc[curr.status] = (acc[curr.status] || 0) + 1;
                return acc;
            }, {});

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({ personnel: userData, stats }, null, 2),
                    },
                ],
            };
        }

        throw new Error(`Tool not found: ${name}`);
    } catch (error: unknown) {
        const err = Object(error);
        return {
            content: [{ type: "text", text: `Error: ${err.message || String(error)}` }],
            isError: true,
        };
    }
});

/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Absensi TNI MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
