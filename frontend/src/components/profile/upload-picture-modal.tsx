"use client";

import { AlertCircle, Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { employeeApi } from "@/lib/api/employees";

interface UploadPictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUrl: string) => void;
}

export function UploadPictureModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadPictureModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, and WebP image formats are permitted.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await employeeApi.uploadProfilePicture(selectedFile);
      onSuccess(res.profile_picture_url);
      onClose();
    } catch (err: unknown) {
      let msg = "Failed to upload image. Please try again.";
      if (typeof err === "object" && err !== null && "response" in err) {
        const resp = (err as { response?: { data?: Record<string, unknown> } })
          .response;
        if (resp?.data?.profile_picture) {
          msg = String(resp.data.profile_picture);
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-[#1b2b24] dark:bg-[#0e1512]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1b2b24]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Upload Profile Picture
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col items-center justify-center">
          {previewUrl ? (
            <div className="relative size-32 rounded-full overflow-hidden border-2 border-emerald-600 shadow-md">
              <Image
                src={previewUrl}
                alt="Selected preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="size-32 rounded-full border-2 border-dashed border-slate-300 dark:border-[#1b2b24] flex flex-col items-center justify-center text-slate-400 hover:border-emerald-600 hover:text-emerald-600 transition-colors"
            >
              <UploadCloud size={32} />
              <span className="text-[11px] font-semibold mt-1">
                Select Image
              </span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              {previewUrl ? "Choose different image" : "Browse files"}
            </button>
            <p className="text-[10px] text-slate-400 mt-1">
              Supported formats: JPEG, PNG, WebP (Max 5MB)
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-[#1b2b24]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1b2b24] text-slate-600 text-xs font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isLoading || !selectedFile}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#063c35] text-white hover:bg-[#084b42] text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            {isLoading && <Loader2 size={13} className="animate-spin" />}
            <span>Upload Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
