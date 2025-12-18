import { auth, signIn } from "@/config/authHandler";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default async function LoginPage() {
  // check the sesssion first
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Asymmetri AI</CardTitle>
          <CardDescription>
            Sign in to start chatting
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          
          {/* gitHub login Button */}
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/" });
            }}
          >
            <Button className="w-full" variant="outline" type="submit">
              <FaGithub className="h-5 w-5" />
              Sign in with GitHub
            </Button>
          </form>

          {/* Google  button */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <Button className="w-full" variant="outline" type="submit">
              <FcGoogle className="h-5 w-5" />
              Sign in with Google
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}