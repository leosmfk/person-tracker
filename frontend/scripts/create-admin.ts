/**
 * Script manual para criar o usuario admin inicial.
 * Uso: bun run scripts/create-admin.ts
 */
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { randomBytes } from "crypto";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password.normalize("NFKC"), salt, {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64,
    maxmem: 128 * 16384 * 16 * 2,
  });
  const hashHex = Buffer.from(key).toString("hex");
  return `${salt}:${hashHex}`;
}

async function main() {
  const adminEmail = "admin@teste.com";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(`Admin user ${adminEmail} already exists, skipping.`);
    return;
  }

  const userId = randomBytes(16).toString("hex");

  await prisma.user.create({
    data: {
      id: userId,
      name: "Admin",
      email: adminEmail,
      emailVerified: true,
      role: "admin",
    },
  });

  await prisma.account.create({
    data: {
      id: randomBytes(16).toString("hex"),
      accountId: userId,
      providerId: "credential",
      userId: userId,
      password: await hashPassword("admin123"),
    },
  });

  console.log(`Admin user created: ${adminEmail} / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
