/**
 * useAdminUpload
 * Opens the native device file picker (works on phone + PC),
 * reads the file as base64, sends to server → S3 CDN,
 * returns the public CDN URL.
 */
import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface UploadOptions {
  folder?: string;
  accept?: string; // e.g. "image/*"
  onSuccess?: (url: string) => void;
}

export function useAdminUpload(options: UploadOptions = {}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const uploadMutation = trpc.upload.uploadFile.useMutation({
    onError: (err) => {
      toast.error("Upload failed: " + err.message);
      setUploading(false);
    },
  });

  function openPicker() {
    if (!inputRef.current) {
      // Create a hidden input on the fly
      const input = document.createElement("input");
      input.type = "file";
      input.accept = options.accept ?? "image/*";
      input.style.display = "none";
      document.body.appendChild(input);
      inputRef.current = input;
    }
    inputRef.current.accept = options.accept ?? "image/*";
    inputRef.current.onchange = handleFileChange;
    inputRef.current.click();
  }

  function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    processFile(file);
    // Reset so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function processFile(file: File) {
    setUploading(true);
    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const result = await uploadMutation.mutateAsync({
          base64,
          filename: file.name,
          contentType: file.type || "image/jpeg",
          folder: options.folder ?? "admin-uploads",
        });
        setPreviewUrl(result.url);
        options.onSuccess?.(result.url);
        toast.success("Image uploaded successfully");
      } catch {
        // error handled by onError
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return { openPicker, uploading, previewUrl, setPreviewUrl };
}
