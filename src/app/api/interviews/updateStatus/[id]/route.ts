import prisma from "@/db/client";
import { NextResponse } from "next/server";


//Update Interview Status
export async function PATCH(req: Request, { params }: { params: { id: string }}) {
    try {
        const { id } = params;
        const { status } = await req.json();
        
        console.log("Message Received to update the status")

        if (!id || !status) {
            return NextResponse.json({ error: "Missing required fields"}, { status: 400 })
        }

        const updateInterview = await prisma.interviews.update({
            where: { id },
            data: {
                status,
                ...(status === "completed" ? { endTime: new Date() } : {}),
            },
        });
        
        return NextResponse.json(updateInterview, { status: 200 });
    } catch (error) {
        console.log("Error updating interview status: ", error);
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500 })
    }
}