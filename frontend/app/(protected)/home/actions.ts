"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createPerson(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const linkedinUrl = formData.get("linkedinUrl") as string;
  const rawPhone = formData.get("phone") as string;
  const phone = rawPhone ? rawPhone.replace(/\D/g, "") || null : null;
  const email = (formData.get("email") as string) || null;

  if (!name || !linkedinUrl) {
    throw new Error("Name and LinkedIn URL are required");
  }

  await prisma.person.create({
    data: {
      name,
      linkedinUrl,
      phone,
      email,
    },
  });

  revalidatePath("/home");
}
