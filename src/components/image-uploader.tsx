"use client";

import { useRef, useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { ImagePlus, X, Loader2 } from "lucide-react";
import type { FunctionReference } from "convex/server";

interface ImageUploaderProps {
  /** Current image URL (if any) */
  imageUrl?: string | null;
  /** Convex mutation reference for generating upload URLs */
  generateUploadUrlRef: FunctionReference<"mutation", "public", Record<string, never>, string>;
  /** Convex mutation reference for updating the image on the record */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateImageRef: FunctionReference<"mutation", "public", any, any>;
  /** Convex mutation reference for removing the image from the record */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeImageRef: FunctionReference<"mutation", "public", any, any>;
  /** Args to pass to updateImage (e.g. { sectionId, storageId }) — storageId will be injected */
  updateArgs: Record<string, unknown>;
  /** Args to pass to removeImage (e.g. { sectionId }) */
  removeArgs: Record<string, unknown>;
  /** Key name for the storageId arg in updateImage */
  storageIdKey?: string;
  /** Max file size in bytes (default 5MB) */
  maxSize?: number;
  /** Shape of the thumbnail. "panel" renders a 4:3 wide preview matching portfolio cards */
  shape?: "rounded" | "square" | "panel";
  /** Additional class names */
  className?: string;
}

export function ImageUploader({
  imageUrl,
  generateUploadUrlRef,
  updateImageRef,
  removeImageRef,
  updateArgs,
  removeArgs,
  storageIdKey = "storageId",
  maxSize = 5_000_000,
  shape = "rounded",
  className = "",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateUploadUrl = useMutation(generateUploadUrlRef as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateImage = useMutation(updateImageRef as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removeImage = useMutation(removeImageRef as any);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > maxSize) {
        toast.error(`Image must be under ${Math.round(maxSize / 1_000_000)}MB`);
        return;
      }
      setUploading(true);
      try {
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await res.json();
        await updateImage({
          ...updateArgs,
          [storageIdKey]: storageId,
        });
        toast.success("Image uploaded");
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, updateImage, updateArgs, storageIdKey, maxSize]
  );

  const handleRemove = useCallback(async () => {
    setRemoving(true);
    try {
      await removeImage(removeArgs);
      toast.success("Image removed");
    } catch {
      toast.error("Failed to remove image");
    } finally {
      setRemoving(false);
    }
  }, [removeImage, removeArgs]);

  const isPanel = shape === "panel";
  const rounding = shape === "rounded" ? "rounded-xl" : "rounded-lg";

  if (isPanel) {
    return (
      <div className={`relative w-full ${className}`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
        {imageUrl ? (
          <div className="group relative w-full overflow-hidden rounded-xl border" style={{ aspectRatio: "4/3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-xs text-white/70">Panel preview (4:3)</p>
              <div className="flex gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1 rounded-md bg-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/30"
                  title="Replace image"
                >
                  <ImagePlus className="h-3.5 w-3.5" /> Replace
                </button>
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="flex items-center gap-1 rounded-md bg-red-500/60 px-3 py-1.5 text-xs text-white hover:bg-red-500/80"
                  title="Remove image"
                >
                  {removing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            style={{ aspectRatio: "4/3" }}
            title="Upload cover image"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">Upload cover image</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      {imageUrl ? (
        <div className={`group relative h-16 w-16 ${rounding} overflow-hidden border`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded p-1 text-white hover:bg-white/20"
              title="Replace image"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="rounded p-1 text-white hover:bg-white/20"
              title="Remove image"
            >
              {removing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex h-16 w-16 items-center justify-center ${rounding} border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary`}
          title="Upload image"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
}
