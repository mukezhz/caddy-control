import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const username = "admin";
const password = "admin";

export const seedFirstUser = async () => {
  const user = await prisma.user.findFirst({
    select: {
      id: true,
    },
  });
  if (user) return;
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      username,
      hashedPassword,
      forcePasswordChange: true,
    },
  });
};

export const getUserFromHeader = async (req: NextRequest) => {
  const userId = req.headers.get("x-user-id");
  if(!userId) return null;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      hashedPassword: true,
    },
  });
  return user;
};
