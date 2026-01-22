import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { trainId } = await req.json();
  if (!trainId) return NextResponse.json({ error: "No trainId provided" }, { status: 400 });

  const existing = await prisma.favoriteTrain.findUnique({
    where: { userId_trainId: { userId: session.user.id, trainId } },
  });

  if (existing) {
    await prisma.favoriteTrain.delete({
      where: { userId_trainId: { userId: session.user.id, trainId } },
    });
    return NextResponse.json({ favorite: false });
  }

  await prisma.favoriteTrain.create({
    data: { userId: session.user.id, trainId },
  });

  return NextResponse.json({ favorite: true });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favorites = await prisma.favoriteTrain.findMany({
    where: { userId: session.user.id },
    select: { trainId: true },
  });

  return NextResponse.json({favoriteTrainIds: favorites.map((f: { trainId: string }) => f.trainId),});
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.error();

  const { trainId } = await req.json();

  await prisma.favoriteTrain.deleteMany({
    where: { userId: session.user.id, trainId },
  });

  return NextResponse.json({ success: true });
}