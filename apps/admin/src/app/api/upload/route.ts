import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import { replaceManagedMediaAsset } from "@/lib/media";

const UPLOADS_DIR = path.resolve(process.cwd(), "..", "..", "public", "uploads");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customName = (formData.get("name") as string || "").trim();
    const folder = (formData.get("folder") as string || "branding").trim();
    const altText = (formData.get("altText") as string || "").trim();
    const status = (formData.get("status") as string || "DRAFT").trim();
    const replaceAssetId = (formData.get("replaceAssetId") as string || "").trim();

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported formats: JPEG, PNG, WebP, AVIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 4MB size limit." },
        { status: 400 }
      );
    }
    if (status !== "DRAFT" && status !== "PUBLISHED") {
      return NextResponse.json({ error: "Invalid publication status." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // The extension is derived from the already-validated MIME type, never from
    // the client-supplied filename, so an unexpected extension (e.g. .html)
    // cannot be persisted into the publicly served /uploads directory.
    const safeExtension = EXTENSION_BY_MIME_TYPE[file.type] || ".png";
    const randomHash = crypto.randomBytes(8).toString("hex");
    const sanitizedBase =
      file.name
        .replace(/\.[^.]*$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 30) || "upload";
    const finalFilename = `${sanitizedBase}_${Date.now()}_${randomHash}${safeExtension}`;
    let publicUrl: string;
    if (process.env.VERCEL) {
      const blob = await put(`uploads/${finalFilename}`, buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
      });
      publicUrl = blob.url;
    } else {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS_DIR, finalFilename), buffer);
      publicUrl = `${process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000"}/uploads/${finalFilename}`;
    }
    const fileSizeFormatted = file.size < 1024
      ? "< 1 KB"
      : file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const assetName = customName || file.name.replace(/\.[^.]*$/, "");

    const asset = replaceAssetId
      ? await replaceManagedMediaAsset(replaceAssetId, publicUrl, fileSizeFormatted, finalFilename)
      : await prisma.mediaAsset.create({
          data: {
            name: assetName,
            filename: finalFilename,
            url: publicUrl,
            folder,
            altText: altText || assetName,
            fileSize: fileSizeFormatted,
            type: "IMAGE",
            status,
            usedIn: "[]",
          },
        });

    await logAdminAudit({
      adminId: admin.id,
      action: replaceAssetId ? "MEDIA_REPLACED" : "MEDIA_UPLOAD",
      resourceType: "MediaAsset",
      resourceId: asset.id,
      metadata: { filename: finalFilename, size: fileSizeFormatted, folder, status: asset.status },
    });

    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Failed to process image upload." },
      { status: 500 }
    );
  }
}
