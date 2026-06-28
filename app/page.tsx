"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
    email: string | null;
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts();
    }
  }, [status]);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("获取文章失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？")) return;
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      setPosts(posts.filter((p) => p.id !== id));
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">知识库</h1>
        <Link
          href="/editor"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          新建文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">还没有文章</p>
          <Link href="/editor" className="text-blue-500 hover:underline">
            写第一篇文章 →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link href={`/editor?id=${post.id}`}>
                    <h2 className="text-xl font-semibold mb-2 hover:text-blue-500">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">
                    {post.content.substring(0, 200)}...
                  </p>
                  <div className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleString("zh-CN")}
                    {" · "}
                    {post.author.name || post.author.email}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="ml-4 text-red-500 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
