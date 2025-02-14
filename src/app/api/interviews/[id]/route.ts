import prisma from "@/db/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



export async function GET(req: Request, { params,}: { params: Promise<{ id: string }>})  {
    try {
        const id = (await params)?.id;

        const { userId } = await auth()
        console.log("Auth UserID: ", userId)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        // const getUser = await getUserByclerkId(userId);

        // if (!getUser) {
        //     return NextResponse.json({ error: "User not found"}, { status: 401})
        // }

        const myInterviews = await prisma.interviews.findMany({
            where: {
                candidateId: id
            }
        })

        return NextResponse.json(myInterviews, { status: 200 });

    } catch (error) {
        console.log("Error while fetching the your Interviews: ", error);
        return NextResponse.json({ error: "Interval Server Error"}, { status: 500 })
    }
}







