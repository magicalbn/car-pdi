"use client";

// Save an image to the phone's photo library / device.
//
// Browsers cannot write to the camera roll directly, but on mobile the Web
// Share API opens the native share sheet which offers "Save Image" (iOS →
// Photos) / "Save to device" (Android → Gallery). On desktop / unsupported
// browsers we fall back to a normal file download.

export type SaveResult = "shared" | "downloaded" | "cancelled";

export function canShareFiles(): boolean {
  if (typeof navigator === "undefined") return false;
  if (
    typeof navigator.share !== "function" ||
    typeof navigator.canShare !== "function"
  ) {
    return false;
  }
  try {
    const probe = new File([new Blob()], "probe.jpg", { type: "image/jpeg" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export async function saveImageToDevice(
  blob: Blob,
  filename: string
): Promise<SaveResult> {
  const type = blob.type || "image/jpeg";
  const file = new File([blob], filename, { type });

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: filename });
      return "shared";
    } catch (err) {
      // User dismissed the share sheet — don't fall back to a download.
      if ((err as Error)?.name === "AbortError") return "cancelled";
      // Otherwise fall through to download.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
