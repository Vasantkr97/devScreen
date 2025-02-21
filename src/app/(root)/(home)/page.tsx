'use client'
import ActionCard from "@/components/ActionCard";
import MeetingModal from "@/components/MeetingModal";
import { QUICK_ACTIONS } from "@/constants";
import useUserRole from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Home() {
  const router = useRouter();

  const { isInterviewer, isCandidate } = useUserRole();
  const [showModel, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">()
  
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

  if (isInterviewer === isCandidate) return null
  

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
        </>
      )}
    </div>
  );
}
