"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { INTERVIEW_CATEGORY } from "@/constants";
import { getCandidateInfo, groupInterviews } from "@/lib/utils";
import { interviews } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";



const DashboardPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await  fetch("/api/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch Users")
        }

        const data = await res.json();
        console.log("User in dashboard: ", data);
        setUsers(data);
      } catch (error) {
        console.log("Error fetching Users", error);
      }
    }
    fetchUsers();
  },[])

  useEffect(() => {
      const fetchInterviews = async () => {
        try {
          const res = await fetch(`/api/interviews`, {
            "method": "GET",
            headers: {
              "Content-Type": "application/json"
            },
          })
          
          if (!res.ok) {
            throw new Error("Failed to fetch interviews")
          }
  
          const data = await res.json();
          console.log("interviews in dashboard",data);
          setInterviews(data)

        } catch (error) {
          console.log("Error fetching interviews:", error);
        }
      }

      fetchInterviews();
  },[]);

  const handleStatusUpdate = async (interviewId: string, status: string) => {
    try {
      await updateStatus({ id: interviewId, status});
      toast.success(`Interview marked as ${status}`)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const groupedInterviews = groupInterviews(interviews);

  return (
    <div className="container mx-auto py-10">
        <div className="flex items-center mb-8">
          <Link href="/schedule">
            <Button>Schedule New Interview</Button>
          </Link>
        </div>

        <div className="space-y-8">
          {INTERVIEW_CATEGORY.map(
            (category) => 
              groupedInterviews[category.id]?.length > 0 && (
                <section key={category.id}>
                  {/* Category title */}
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold">{category.title}</h2>
                    <Badge variant={category.variant}>{groupedInterviews[category.id].length}</Badge>
                  </div>

                  <div className="grid grid-cols md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedInterviews[category.id].map((interview: interviews) => {
                      const candidateInfo = getCandidateInfo(users, interview.candidateId);
                      const startTime = new Date(interview.startTime);

                      return (
                        <Card className="hover:shadow-md transition-all">
                          {/* candidate Info */}
                          <CardHeader className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={candidateInfo.image}/>
                                <AvatarFallback>{candidateInfo.initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">{candidateInfo.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{interview.title}</p>
                              </div>
                            </div>
                          </CardHeader>


                          {/* Date and Time */}
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {format(startTime, "MM dd")}
                              </div>

                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                {format(startTime, "hh:mm a")}
                              </div>
                            </div>
                          </CardContent>

                          {/* Pass & Fail Buttons */}
                          <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                            {interview.status === "completed" && (
                              <div className="flex gap-2 w-full">
                                <Button
                                  className="flex-1"
                                  onClick={() => handleStatusUpdate(interview.id, "succeeded")}
                                >
                                  <CheckCircle2Icon className="h-4 w-4 mr-2" />
                                  pass
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="flex-1"
                                  onClick={()=> handleStatusUpdate(interview.id, "failed")}
                                >
                                  <XCircleIcon className="h-4 w-4 mr-2" />
                                  Fail
                                </Button>
                              </div>
                            )}
                          </CardFooter>
                        </Card>
                      )
                    })}
                  </div>
                </section>
              )
          )}
        </div>
    </div>
  )
}

export default DashboardPage

function updateStatus(arg0: { id: string; status: string; }) {
  throw new Error("Function not implemented.");
}
