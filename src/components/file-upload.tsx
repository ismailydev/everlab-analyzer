"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { AnalysisResult } from "@/lib/types";

interface FileUploadProps {
  onResults: (results: AnalysisResult) => void;
}

export function FileUpload({ onResults }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsDragging(false);
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.name.endsWith(".txt")) {
        toast.error("Invalid file type", {
          description: "Please upload a .txt file",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const loadingToast = toast.loading("Analyzing HL7 file...");

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to analyze file");
        }

        const data = await response.json();
        onResults(data);

        toast.success("Analysis complete");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error occurred";
        toast.error(`Error: ${message}`);
      } finally {
        toast.dismiss(loadingToast);
      }
    },
    [onResults]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
    },
    multiple: false,
    noClick: true,
  });

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    open();
  };

  // Handle global drag events
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Only set to false if we're leaving the window
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <div {...getRootProps()} className="w-full">
      <input {...getInputProps()} />

      {/* Full screen overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${
          isDragging ? "opacity-100" : "opacity-0 pointer-events-none"
        } bg-background/80 backdrop-blur-sm`}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4 inline-block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium">
                Drop your file anywhere on the screen
              </h3>
              <p className="text-sm text-muted-foreground">
                Release to upload your HL7/ORU file
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual upload zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20"
        }`}
      >
        <div className="space-y-4">
          <div className="rounded-full bg-primary/10 p-4 inline-block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              Drag & drop your HL7/ORU file
            </h3>
            <p className="text-sm text-muted-foreground">
              Or click to browse from your computer
            </p>
          </div>
          <button
            type="button"
            onClick={handleButtonClick}
            className="inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Select File
          </button>
        </div>
      </div>
    </div>
  );
}
