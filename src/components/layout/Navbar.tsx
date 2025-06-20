import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import UserProfile from "./user-profile";
import AuthNav from "./auth-nav";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="text-xl font-bold">
          Dividend Research AI
        </Link>
        <div className="flex gap-4 items-center">
          <AuthNav />
        </div>
      </div>
    </nav>
  );
}
