"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const supabase = createClient();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="notepad-card tape px-10 py-14 max-w-md w-full text-center">
        {/* Notebook spiral holes */}
        <div className="absolute -left-3 top-10 flex flex-col gap-7">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border-2 border-gray-300 bg-[#faf8f4]"
            />
          ))}
        </div>

        <div className="text-5xl mb-5 opacity-60">&#128278;</div>

        <h1
          className="text-6xl font-bold mb-3"
          style={{ fontFamily: "var(--font-caveat), cursive" }}
        >
          Smart Bookmarks
        </h1>

        <div className="w-40 h-[2px] bg-[#e8b44e] mx-auto mb-5 rotate-[-0.5deg]" />

        <p className="text-xl text-gray-500 mb-10 italic leading-relaxed">
          your personal bookmark notebook
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={signingIn}
          className="pencil-btn w-full flex items-center justify-center gap-3 py-4 text-lg disabled:cursor-not-allowed"
        >
          {signingIn ? (
            "signing in..."
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              sign in with Google
            </>
          )}
        </button>

        <p className="mt-8 text-base text-gray-400 italic">
          * no password needed, just Google *
        </p>
      </div>
    </div>
  );
}
