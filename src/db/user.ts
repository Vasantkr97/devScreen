"use server"


import prisma from "@/db/client";
import { Role } from "@prisma/client";


type createUserInput = {
    clerkId: string;
    email: string;
    name: string;
    image?: string;
    role: Role;
}

export const createUser = async ({ clerkId, email, name, image, role } : createUserInput) => {

    try {
        const user = await prisma.user.create({
            data: {
                clerkId,
                email,
                name,
                image,
                role
            },
        })
        return user
    } catch (error) {
        console.log("error creating User: ", error);
        throw new Error("Failed to create User");
    }
};


export const getUsers = async () => {
    try {
        const users = await prisma.user.findMany();
        return users
    } catch (error) {
        console.log("Error while getting Users: ", error);
        throw new Error("Failed to get User");
    }
};


export const  getUserByclerkId = async (clerkId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                clerkId
            }
        });
        return user
    } catch (error) {
        console.log("Error fetching User by Id: ", Error);
        throw new Error("Faield to fetch User");
    }
}