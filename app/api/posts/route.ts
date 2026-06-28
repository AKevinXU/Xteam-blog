import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - 获取所有文章
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("获取文章失败:", error);
    return NextResponse.json(
      { error: "获取文章失败" },
      { status: 500 }
    );
  }
}

// POST - 创建文章
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容不能为空" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("创建文章失败:", error);
    return NextResponse.json(
      { error: "创建文章失败" },
      { status: 500 }
    );
  }
}
