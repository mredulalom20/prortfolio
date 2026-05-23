import { supabaseBrowser } from "./supabaseClient";

export const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const DEFAULT_MAX_UPLOAD_MB = 10;
const DEFAULT_STORAGE_BUCKET = "uploads";

export const getMaxUploadMb = () => {
  const raw = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || DEFAULT_MAX_UPLOAD_MB);
  if (Number.isFinite(raw) && raw > 0) return raw;
  return DEFAULT_MAX_UPLOAD_MB;
};

export const getMaxUploadBytes = () => getMaxUploadMb() * 1024 * 1024;

export const getStorageBucket = () => process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || DEFAULT_STORAGE_BUCKET;

export const getFileTooLargeMessage = () => `File too large. Max ${getMaxUploadMb()}MB.`;

export const getUploadErrorMessage = (res, data) => {
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (res?.status === 413) return getFileTooLargeMessage();
  if (res?.status) return `Upload failed (status ${res.status}).`;
  return "Upload failed.";
};

export const uploadDirectToStorage = async (file) => {
  if (!file) throw new Error("No file selected.");

  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, size: file.size }),
  });

  const signData = await parseJsonSafe(signRes);
  if (!signRes.ok || !signData?.path || !signData?.token) {
    throw new Error(getUploadErrorMessage(signRes, signData));
  }

  const bucket = signData?.bucket || getStorageBucket();
  const { error } = await supabaseBrowser
    .storage
    .from(bucket)
    .uploadToSignedUrl(signData.path, signData.token, file, {
      contentType: file.type || "application/octet-stream",
    });

  if (error) throw new Error(error.message || "Upload failed.");

  if (signData?.publicUrl) return { url: signData.publicUrl, path: signData.path };

  const { data: publicData } = supabaseBrowser.storage.from(bucket).getPublicUrl(signData.path);
  if (!publicData?.publicUrl) throw new Error("Upload succeeded, but URL is missing.");

  return { url: publicData.publicUrl, path: signData.path };
};
