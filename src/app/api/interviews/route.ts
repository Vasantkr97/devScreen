import prisma from "@/db/client";
import { NextResponse } from "next/server";


//get interviews
export async function GET() {
    try {
        const interviews = await prisma.interviews.findMany();

        return NextResponse.json(interviews, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500})
    }

}


//create a Interview
export async function POST(req: Request) {
    try {
        const { title, description, startTime, status, streamCallId, candidateId, interviewerIds } = await req.json();

        if (!title || !startTime || !status || !streamCallId || !candidateId || !interviewerIds) {
            return NextResponse.json({error: "Missing Required fields"}, { status: 400 });
        };

        const newInterview = await prisma.interviews.create({
            data: {
                title,
                description,
                startTime: new Date(startTime),
                status,
                streamCallId,
                candidateId,
                interviewerIds
            }
        })

        return NextResponse.json(newInterview, { status: 201 });
    } catch(error) {
        console.log("error creating Interview: ", error);
        return NextResponse.json({ error: "Internal server Error"}, { status: 500 })
    };
};
