'use client'
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function useUserRole() { 
    const { user } = useUser();
    const [role, setRole] = useState({
        isInterviewer: false,
        isCandidate: false,
        loading: true, //Add loading state 
    });

    useEffect(() => {
        if (!user?.id) return;

        const fetchUserRole = async () => {
            try {
                const response = await fetch(`/api/users/${user.id}`);
                if (!response.ok) throw new Error("Failed to fetch user role");

                const userData = await response.json();
                
                if (userData) {
                    setRole({
                        isInterviewer: userData.role === "interviewer",
                        isCandidate: userData.role === "candidate",
                        loading: false,
                    });
                }
            } catch(error) {
                console.log("Error fetching user Role: ", error);
            }
        };

        fetchUserRole();
    }, [user?.id]);
    
    return role;
}
