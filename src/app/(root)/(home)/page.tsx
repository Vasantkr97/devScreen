'use client'
import ActionCard from "@/components/ActionCard";
import MeetingCard from "@/components/MeetingCard";
import MeetingModal from "@/components/MeetingModal";
import { QUICK_ACTIONS } from "@/constants";
import useUserRole from "@/hooks/useUserRole";
import { interviews } from "@prisma/client";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Home() {
  const router = useRouter();

  const { isInterviewer, isCandidate } = useUserRole();
  const [showModel, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">()
  const [interviews, setInterviews] = useState<interviews[]>([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch("/api/interviews/getMyInterview");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setInterviews(data);
      } catch (error) {
        console.log(error);
        };
    }
    fetchInterviews();
  }, []);
  
  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join")
        setShowModal(true)
        break;
      default:
        router.push(`/${title.toLowerCase()}`)

    }
  };

  if (isInterviewer === undefined ||  isCandidate === undefined) {
    return <div>Loading...</div>
  }
  

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* welcome section */}
      <div className="rounded-lg bg-card p-6 border shadow-sm mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          Welcome back!
        </h1>
        <p>
          {isInterviewer 
            ? "Manage your interviews and review candidates effectively" 
            : "Access your upcoming interviews and preparations"
            }
        </p>
      </div>
      {isInterviewer ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard 
                key={action.title}
                action={action}
                onClick={() => handleQuickAction(action.title)}
              />
            ))}
          </div>

          <MeetingModal
            isOpen={showModel}
            onClose={() => setShowModal(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join" }
          />
        </>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold">Your Interviews</h1>
            <p className="text-muted-foreground mt-1">View and join your scheduled interviews</p>
          </div>

          <div className="mt-8">
            {interviews === undefined ? (
              <div className="flex justify-center py-12">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : interviews.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {interviews.map((interview) => (
                  <MeetingCard key={interview.id} interview={interview}/>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                You have no scheduled interviews at the moment
              </div>
            )
            }
          </div>
        </>
      )}
    </div>
  );
}
