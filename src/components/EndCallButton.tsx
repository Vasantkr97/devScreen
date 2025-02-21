"use client"
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import toast from 'react-hot-toast';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const [interviewId, setInterviewId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!call?.id) return;

      try {
        console.log("Fetching interview for Call ID:", call.id);
        const response = await fetch(`/api/interviews/${call.id}`);
        if (!response.ok) throw new Error("Failed to fetch Interview");

        const data = await response.json();
        console.log("Fetched Interview Data:", data[0]);

        if (!data || data.length === 0 || !data[0]?.id) {
          console.error("No interview ID found in response!");
          return;
        }

        setInterviewId(data[0].id);
      } catch (error) {
        console.log("Error Fetching Interviews", error);
      }
     }
     fetchInterview();
  },[call?.id, interviewId])

  if (!call || !interviewId) return null;

  const isMeetingOwner = localParticipant?.userId === call.state.createdBy?.id;
  
  if (!isMeetingOwner) return null;


  const endCall = async () => {

    try {
      await call.endCall();

      const res = await fetch(`/api/interviews/updateStatus/${interviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" })
      });

      if (!res.ok) throw new Error("Failed to update interview status");


      router.push("/")
      toast.success("Meeting ended for EveryOne");
    } catch (error) {
      console.log(error)
      toast.error("Failed to end meeting")
    }
  }

  return (
    <Button variant={"destructive"} onClick={endCall}>
      End Meeting
    </Button>
  )
}

export default EndCallButton;