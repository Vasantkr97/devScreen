import { getUserByclerkId } from "@/db/user";
import { NextResponse } from "next/server";

//get Users by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }>}) {
    try {
        const userId = (await params).id;
        if(!userId) {
            return NextResponse.json({ error: "user Id is required "}, { status: 400 });
        };

        const user = await getUserByclerkId(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error("Error fetching user by Id: ", error);
        return NextResponse.json({ error: "Failed to fetch User"}, { status: 500})
    }
}