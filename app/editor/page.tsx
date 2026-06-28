"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";

const MarkdownEditor = dynamic(() => import("@/components/editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  ),
});

function EditorContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!postId);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (postId) {
      fetch(`/api/posts/${postId}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title);
          setContent(data.content);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          alert("加载文章失败");
        });
    }
  }, [postId]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert("请输入标题");
      return;
    }
    if (!content.trim()) {
      alert("请输入内容");
      return;
    }

    setSaving(true);
    try {
      const url = postId ? `/api/posts/${postId}` : "/api/posts";
      const method = postId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        alert(data.error || "保存失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{postId ? "编辑文章" : "新建文章"}</h1>
        <div className="space-x-3">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="文章标题"
        className="w-full text-2xl font-bold mb-4 p-3 border-b-2 border-transparent focus:border-blue-500 outline-none bg-transparent dark:text-white"
      />

      <MarkdownEditor value={content} onChange={setContent} />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
