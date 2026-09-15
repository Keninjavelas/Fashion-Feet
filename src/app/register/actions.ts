"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { checkRateLimit } from "@/lib/rateLimit";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (name.trim().length < 2) {
    return { error: "Name must be at least 2 characters." };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const limit = checkRateLimit(`reg_${normalizedEmail}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000, lockoutMs: 30 * 60 * 1000 });
  if (!limit.allowed) {
    return { error: `Too many registration attempts. Please try again in ${limit.retryAfterSeconds} seconds.` };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return { error: "Email already exists" };
    }

    // Cryptographically secure password hash with Argon2id
    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword, 
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account" };
  }
}
