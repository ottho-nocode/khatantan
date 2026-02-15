import React from "react";
import { supabase } from "@/lib/supabase";

export interface IFile {
  name: string;
  mimetype: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
}

function getImageSize(file: File): Promise<{ height: number; width: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        resolve({ width: img.width, height: img.height });
      };
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface UseFileUploadProps {
  bucket: string;
  folder?: string;
  mimeType?: string;
  onSuccess?: (file: IFile) => void;
}

interface UseFileUploadReturn {
  file: IFile | null;
  isLoading: boolean;
  error: string | null;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  clearFile: () => void;
}

export function useFileUpload({
  bucket,
  folder = "",
  mimeType,
  onSuccess,
}: UseFileUploadProps): UseFileUploadReturn {
  const [file, setFile] = React.useState<IFile | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processFile = async (rawFile: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a unique filename
      const ext = rawFile.name.split(".").pop();
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const path = folder ? `${folder}/${uniqueName}` : uniqueName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, rawFile, {
          contentType: rawFile.type,
          upsert: false,
        });

      if (uploadError) throw uploadError.message;

      // Get the public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      const url = urlData.publicUrl;

      let dimensions: { width?: number; height?: number } = {};
      if (rawFile.type.startsWith("image/")) {
        dimensions = await getImageSize(rawFile);
      }

      const processedFile: IFile = {
        name: rawFile.name,
        mimetype: rawFile.type,
        size: rawFile.size,
        url,
        ...dimensions,
      };

      setFile(processedFile);
      onSuccess?.(processedFile);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "An error occurred while uploading the file"
      );
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const onClick = () => {
    fileInputRef.current?.click();
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return { file, isLoading, error, onDrop, onClick, onChange, fileInputRef, clearFile };
}
