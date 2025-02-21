import { createUser, getUserByclerkId, getUsers } from "@/db/user";
import { NextResponse } from "next/server";


//Fetch all users 
export async function GET(req: Request) {
    try {
        const users = await getUsers();
        return NextResponse.json(users)
    } catch (error) {
        console.log("Error fetching user(s): ", error);
        return NextResponse.json({ error: "Failed to fetch users"}, { status: 500})
    }
};

//Create User
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clerkId, email, name, image, role } = body;

        if (!clerkId || !email || !name || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        };

        const existingUser = await getUserByclerkId(clerkId);
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        const newUser = await createUser({ clerkId, email, name, image, role});
        return NextResponse.json(newUser,{ status: 201})
    } catch (error) {
        console.error("Error creating user: ", error);
        return NextResponse.json({ error: "Failed to create user"}, { status: 500 })
    }
};

