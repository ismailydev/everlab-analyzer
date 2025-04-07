"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { ResultsDialog } from "@/components/results-dialog";
import { AnalysisResult } from "@/lib/types";

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(
    null
  );

  const handleResults = (results: AnalysisResult) => {
    setAnalysisResults(results);
    setIsDialogOpen(true);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">HL7 Pathology Report Analyzer</h1>
          <p className="text-lg text-muted-foreground">
            Upload an ORU file to see analyzed test results
          </p>
        </div>
        <FileUpload onResults={handleResults} />
      </div>
      <ResultsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        results={analysisResults}
      />
    </main>
  );
}
