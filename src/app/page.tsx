import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div>
     <SignedOut>
      <SignInButton />
    </SignedOut>
    HOme
    <SignedIn>
      <UserButton />
    </SignedIn>
    </div>
  );
}
