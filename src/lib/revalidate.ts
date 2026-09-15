import { revalidatePath } from "next/cache";

export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (error) {
    // Suppress invariant error when running server actions in standalone test environment
  }
}
