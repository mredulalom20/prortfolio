export const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const DEFAULT_MAX_UPLOAD_MB = 10;

export const getMaxUploadMb = () => {
  const raw = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || DEFAULT_MAX_UPLOAD_MB);
  if (Number.isFinite(raw) && raw > 0) return raw;
  return DEFAULT_MAX_UPLOAD_MB;
};

export const getMaxUploadBytes = () => getMaxUploadMb() * 1024 * 1024;

export const getFileTooLargeMessage = () => `File too large. Max ${getMaxUploadMb()}MB.`;

export const getUploadErrorMessage = (res, data) => {
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (res?.status === 413) return getFileTooLargeMessage();
  if (res?.status) return `Upload failed (status ${res.status}).`;
  return "Upload failed.";
};
