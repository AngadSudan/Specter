import { NextResponse,NextRequest } from "next/server";
import axios from 'axios';

export async function GET(req: NextRequest) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing OPENAI_API_KEY" },
                { status: 500 }
            );
        }

        const apiUrl = "https://api.openai.com/v1/realtime/client_secrets";

        const ephemKeyResponse = await axios.post(
            apiUrl,
            {
                session: {
                    type: "realtime",
                    model: "gpt-realtime"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(ephemKeyResponse)

        const token = ephemKeyResponse.data.value;

        return NextResponse.json({ token });
    } catch (err: any) {
        console.error("Realtime Token Error:", err.response?.data || err.message);

        return NextResponse.json(
            {
                error: "Failed to generate Realtime token",
                details: err.response?.data || err
            },
            { status: 500 }
        );
    }
}
