import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
      forcePasswordChange: true
    },
  });
};
