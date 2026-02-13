"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({ user }: { user: { email?: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    router.refresh();
  };

  return (
    <nav className="bg-[#fffef9]/80 backdrop-blur-sm border-b-2 border-dashed border-gray-300 px-8 py-5 sticky top-0 z-20">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
          className="text-xl sm:text-3xl font-bold flex items-center gap-2"
          style={{ fontFamily: "var(--font-caveat), cursive" }}
        >
          <span className="opacity-60">🔖</span>
          <span className="sketchy-underline">Smart Bookmarks</span>
        </h1>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-sm sm:text-base text-gray-500 hidden sm:inline italic">
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="pencil-btn-fill text-xs sm:text-sm !py-1.5 sm:!py-2 !px-3 sm:!px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signingOut ? "signing out..." : "sign out"}
            sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
