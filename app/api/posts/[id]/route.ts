import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - 获取单篇文章
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("获取文章失败:", error);
    return NextResponse.json(
      { error: "获取文章失败" },
      { status: 500 }
    );
  }
}

// PUT - 更新文章
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const { title, content } = await req.json();

    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      include: { author: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || existingPost.authorId !== user.id) {
      return NextResponse.json(
        { error: "无权修改" },
        { status: 403 }
      );
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: { title, content },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("更新文章失败:", error);
    return NextResponse.json(
      { error: "更新文章失败" },
      { status: 500 }
    );
  }
}

// DELETE - 删除文章
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      include: { author: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || existingPost.authorId !== user.id) {
      return NextResponse.json(
        { error: "无权删除" },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除文章失败:", error);
    return NextResponse.json(
      { error: "删除文章失败" },
      { status: 500 }
    );
  }
}
