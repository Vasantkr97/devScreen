import prisma from "@/db/client";
import { NextResponse } from "next/server";



export async function GET() {
    try {
        const interviews = await prisma.interviews.findMany();

        return NextResponse.json(interviews, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500})
    }

}

