"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef, useCallback } from "react";

type Bookmark = {
  id: string;
  url: string;
  title: string;
  created_at: string;
  user_id: string;
};

export default function BookmarkManager({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[];
  userId: string;
}) {
  const supabase = useRef(createClient()).current;
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Realtime subscription (for cross-tab sync)
  useEffect(() => {
    const channel = supabase
      .channel(`bookmarks-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark;
          setBookmarks((prev) => {
            if (prev.some((b) => b.id === newBookmark.id)) return prev;
            return [newBookmark, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setBookmarks((prev) =>
            prev.filter((b) => b.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  // Add bookmark
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    setLoading(true);
    setError("");

    try {
      const trimmedUrl = url.trim();
      const trimmedTitle = title.trim();

      const { error: insertError } = await supabase
        .from("bookmarks")
        .insert({
          url: trimmedUrl,
          title: trimmedTitle,
          user_id: userId,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        setError(insertError.message);
      } else {
        // Add to local state immediately with a temporary bookmark
        const newBookmark: Bookmark = {
          id: crypto.randomUUID(),
          url: trimmedUrl,
          title: trimmedTitle,
          user_id: userId,
          created_at: new Date().toISOString(),
        };
        setBookmarks((prev) => [newBookmark, ...prev]);
        setUrl("");
        setTitle("");

        // Re-fetch to get the real data from DB (correct id, timestamp)
        const { data: fresh } = await supabase
          .from("bookmarks")
          .select("*")
          .order("created_at", { ascending: false });
        if (fresh) setBookmarks(fresh);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete bookmark
  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      // Optimistically remove
      setBookmarks((prev) => prev.filter((b) => b.id !== id));

      try {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Delete error:", error);
          // Re-fetch if delete failed
          const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .order("created_at", { ascending: false });
          if (data) setBookmarks(data);
        }
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setDeletingId(null);
      }
    },
    [supabase]
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDomain = (urlStr: string) => {
    try {
      return new URL(urlStr).hostname.replace("www.", "");
    } catch {
      return urlStr;
    }
  };

  return (
    <>
      {/* Add Bookmark Form */}
      <div className="notepad-card px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl opacity-60">&#9997;</span>
          <h2
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            jot down a bookmark
          </h2>
        </div>
        {error && (
          <p className="text-red-500 text-sm italic mb-4">* {error}</p>
        )}
        <form onSubmit={handleAdd}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="text-base text-gray-400 italic mb-2 block">
                  title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cool article about space"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="sketchy-input"
                />
              </div>
              <div className="flex-1">
                <label className="text-base text-gray-400 italic mb-2 block">
                  url:
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="sketchy-input"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="pencil-btn-fill disabled:opacity-50"
              >
                {loading ? "pinning..." : "📌 pin it!"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bookmark List */}
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <p
            className="text-[6rem] sm:text-[8rem] font-bold leading-none select-none text-gray-200"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            no bookmarks
          </p>
          <p
            className="text-gray-400 text-2xl mt-6 mb-2"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            nothing pinned yet...
          </p>
          <p className="text-gray-400 text-base italic">
            add your first bookmark above!
          </p>
        </div>
      ) : (
        <div>
          <h2
            className="text-3xl font-semibold mb-5 flex items-center gap-2"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            <span className="opacity-60">&#128204;</span>
            my bookmarks
            <span className="text-lg font-normal text-gray-400 ml-1">
              ({bookmarks.length})
            </span>
          </h2>
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className={`bookmark-card p-5 pl-7 flex items-center gap-5 ${
                  deletingId === bookmark.id ? "scratch-out" : ""
                }`}
              >
                {/* Favicon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=32`}
                    alt=""
                    className="w-5 h-5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3 className="text-xl font-medium truncate">
                      {bookmark.title}
                    </h3>
                    <span className="text-sm text-gray-400 italic flex-shrink-0">
                      {formatDate(bookmark.created_at)}
                    </span>
                  </div>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-amber-700 hover:text-amber-900 truncate block underline decoration-dashed underline-offset-4 decoration-amber-300"
                  >
                    {getDomain(bookmark.url)} &#8599;
                  </a>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="delete-btn flex-shrink-0"
                  title="Remove bookmark"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
