"use client";

import useUserRole from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import InterviewScheduleUI from "./InterviewScheduleUI";
import { useEffect } from "react";


const SchedulePage = () => {
  const router = useRouter();

  const { isInterviewer, loading } = useUserRole();

  if (loading) return <p>Loading...</p>

  if (!isInterviewer) return router.push("/")

  return <InterviewScheduleUI/>
}

export default SchedulePage