import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import BookmarkManager from "@/components/BookmarkManager";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen relative z-10">
      <Navbar user={user} />
      <main className="max-w-3xl mx-auto px-8 py-10 space-y-10">
        <BookmarkManager
          initialBookmarks={bookmarks ?? []}
          userId={user.id}
        />
      </main>
    </div>
  );
}
