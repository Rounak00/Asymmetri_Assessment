import { auth, signOut } from "@/config/authHandler";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function Home() {
  // session check from db
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }


  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">
        Welcome back, {session.user.name}!
      </h1>
      <p className="text-gray-500">You are securely logged in.</p>
      
      {/* Signout button */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button variant="destructive">Sign Out</Button>
      </form>
    </div>
  );
}