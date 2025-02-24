import prisma from "@/db/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//getMyinterviews
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json([], { status: 401});

        const interviews = await prisma.interviews.findMany({
            where: {
                candidateId: userId
            },
            orderBy: {
                startTime: "asc",
            },
        });
        return NextResponse.json(interviews);
    } catch (error) {
        console.log("Error fetching interviews: ", error);
        return NextResponse.json({ error: "Failed to fetch Interviews"}, { status: 500 })
    }
}