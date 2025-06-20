'use client';

import Link from "next/link";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import UserProfile from "./user-profile";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return user ? (
    <>
      <Link
        href="/dashboard"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <Button>Dashboard</Button>
      </Link>
      <UserProfile />
    </>
  ) : (
    <>
      <Link
        href="/sign-in"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
      >
        Sign Up
      </Link>
    </>
  );
} 