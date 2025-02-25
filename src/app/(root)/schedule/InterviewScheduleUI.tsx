import MeetingCard from '@/components/MeetingCard';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import UserInfo from '@/components/UserInfo';
import { TIME_SLOTS } from '@/constants';
import { useUser } from '@clerk/nextjs';
import { interviews, User } from '@prisma/client';
import { useStreamVideoClient } from '@stream-io/video-react-sdk'
import { Loader2Icon, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const InterviewScheduleUI = () => {
    const client = useStreamVideoClient();
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [interviews, setInterviews] = useState<interviews[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [interviewsRes, usersRes] = await Promise.all([
                    fetch("/api/interviews").then((res) => res.json()),
                    fetch("/api/users").then((res) => res.json()),
                ]);
                setInterviews(interviewsRes);
                setUsers(usersRes);

            } catch(error) {
                console.log("Failed to fetch data", error);
            } finally {
                setLoading(false)
            }
        }
        fetchData();
    },[]);

    const candidates = users?.filter((u) => u.role === "candidate");
    const interviewers = users?.filter((u) => u.role === "interviewer");

    console.log("Interviewers :", interviewers)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: new Date(),
        time: "09:00",
        candidateId: "",
        interviewerIds: user?.id ? [user.id] : []
    });

    const scheduleMeeting = async () => {
        if (!client || !user) return;
        if (!formData.candidateId || formData.interviewerIds.length === 0) {
            toast.error("Please select both candidate and at least one interviewer");
            return;
        }

        setIsCreating(true);
        

        try {
            const { title, description, date, time, candidateId, interviewerIds } = formData;
            const [hours, minutes] = time.split(":");
            const meetingDate = new Date(date);
            meetingDate.setHours(parseInt(hours), parseInt(minutes), 0);

            const id = crypto.randomUUID();
            const call = client.call("default", id);

            await call.getOrCreate({
                data: {
                    starts_at: meetingDate.toISOString(),
                    custom: {
                        description: title,
                        additionalDetails: description,
                    }
                }
            });


            const res = await fetch("/api/interviews", {
                method: "POST",
                headers: { "Content-type": "application/json"},
                body: JSON.stringify({
                    title,
                    description,
                    startTime: meetingDate.getTime(),
                    status: "upcoming",
                    streamCallId: id,
                    candidateId,
                    interviewerIds,
                })
            });

            console.log("inside the meeting SChedule: ",res);
            
            const newInterview = await res.json();

            setInterviews((prevInterviews) => [...prevInterviews, newInterview])

            setOpen(false);
            toast.success("Meeting scheduled successfully");

            setFormData({
                title: "",
                description: "",
                date: new Date(),
                time: "09:00",
                candidateId: "",
                interviewerIds: user?.id ? [user.id] : [],
            })
        } catch (error) {
            console.error(error);
            toast.error("Failed to Schedule meeting. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const addInterviewer = (interviewerId: string) => {
        if (!formData.interviewerIds.includes(interviewerId)) {
            setFormData((prev) => ({
                ...prev,
                interviewerIds: [...prev.interviewerIds, interviewerId],
            }));
        }
    };

    const removeInterviewer = (interviewerId: string) => {
        if (interviewerId === user?.id) return;
        setFormData((prev) => ({
            ...prev,
            interviewerIds: prev.interviewerIds.filter((id) => id !== interviewerId),
        }));
    };

    const selectedInterviewers = interviewers.filter((i) => 
        formData.interviewerIds.includes(i.clerkId)
    );

    const availableInterviewers = interviewers.filter(
        (i) => !formData.interviewerIds.includes(i.clerkId)
    )

  return (
    <div className='container max-w-7xl mx-auto p-6 space-y-8'>
        <div className='flex items-center justify-between'> 
            {/* HEADER INFO */}
            <div>
                <h1 className='text-3xl font-bold'>Interviews</h1>
                <p className='text-muted-foreground'>Schedule and manage interviews</p>
            </div>

            {/* DIALOG */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="lg">Schedule Interview</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[500px]  h-[calc(100vh-200px)] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Schedule Interview</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        {/* INTERVIEW TITLE */}
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Title</label>
                            <Input
                                placeholder='Interview title'
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        {/* Interview Desc */}
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Description</label>
                            <Textarea
                                placeholder='Interview description'
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={3}
                            />
                        </div>

                        {/* Candidate */}
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Candidate</label>
                            <Select 
                                value={formData.candidateId}
                                onValueChange={(candidateId) => setFormData({ ...formData, candidateId })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select candidate" />
                                </SelectTrigger>
                                <SelectContent>
                                    {candidates.map((candidate) => (
                                        <SelectItem key={candidate.clerkId} value={candidate.clerkId}>
                                            <UserInfo user={candidate} />
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Interviewers */}
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Interviewers</label>
                            <div className='flex flex-wrap'>
                                {selectedInterviewers.map((interviewer) => (
                                    <div
                                        key={interviewer.id}
                                        className='inline-flex items-center gap-2 bg-secondary px-2 py-1 rounded-md text-sm'
                                    >
                                        <UserInfo user={interviewer} />
                                        {interviewer.clerkId !== user?.id && (
                                            <button
                                                onClick={()=> removeInterviewer(interviewer.clerkId)}
                                                className='hover:text-destructive transition-colors'
                                            >
                                                <XIcon className='h-4 w-4' />
                                            </button>
                                        )}
                                    </div> 
                                ))}
                            </div>
                            {availableInterviewers.length > 0 && (
                                <Select onValueChange={addInterviewer}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Add Interviewer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableInterviewers.map((interviewer) => (
                                            <SelectItem key={interviewer.clerkId} value={interviewer.clerkId}>
                                                <UserInfo user={interviewer} />
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* DATE AND TIME */}
                        <div className='flex gap-2'>
                            {/* Calendar */}
                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>Date</label>
                                <Calendar
                                    mode='single'
                                    selected={formData.date}
                                    onSelect={(date) => date && setFormData({ ...formData, date })}
                                    disabled={(date) => date < new Date() }
                                />
                            </div>

                            {/* Time */}
                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>Time</label>
                                <Select
                                    value={formData.time}
                                    onValueChange={(time) => setFormData({ ...formData, time})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_SLOTS.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex justify-center gap-3 pt-4'>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                cancel
                            </Button>
                            <Button onClick={scheduleMeeting} disabled={isCreating}>
                                {isCreating ? (
                                    <>
                                        <Loader2Icon className='mr-2 size-4 animate-spin' />
                                        Scheduling...
                                    </>
                                ) : (
                                    "Schedule Interview"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        {/* Loading State and Meeting Card */}
        {loading ? (
            <div className='flex justify-center py-12'>
                <Loader2Icon className='size-8 animate-spin text-muted-foreground' />
            </div>
        ):(
            interviewers.length > 0 ? (
                <div className='space-y-4'>
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {interviews.map((interview) => (
                            <MeetingCard key={interview.id} interview={interview} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className='text-center py-12 text-muted-foreground'>
                    NO interviews scheduled
                </div>
            )
        )}
    </div>
  )
}

export default InterviewScheduleUI