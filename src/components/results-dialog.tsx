import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnalysisResult, AnalyzedTestResult } from "@/lib/types";
import { ResultsView } from "./results-view";

interface ResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  results: AnalysisResult | null;
}

export function ResultsDialog({
  isOpen,
  onClose,
  results,
}: ResultsDialogProps) {
  if (!results) return null;

  const { groupedResults, patient } = results;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle>Test Results Analysis</DialogTitle>
        </DialogHeader>

        {/* Patient Information */}
        {patient && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
            <h3 className="text-sm font-semibold mb-1">Patient Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium">{patient.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">ID</p>
                <p className="font-medium">{patient.patientId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Date of Birth
                </p>
                <p className="font-medium">{patient.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Gender
                </p>
                <p className="font-medium">{patient.gender}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-2 text-center">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
              Critical
            </h3>
            <p className="text-xl font-bold text-red-600 dark:text-red-300">
              {results.summary.criticalCount}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 text-center">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              Abnormal
            </h3>
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-300">
              {results.summary.abnormalCount}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-2 text-center">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
              Normal
            </h3>
            <p className="text-xl font-bold text-green-600 dark:text-green-300">
              {results.summary.normalCount}
            </p>
          </div>
        </div>

        {/* Results Tables */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Critical Results */}
          {groupedResults.critical.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Critical Results
              </h2>
              <div className="overflow-x-auto">
                <ResultsView
                  results={groupedResults.critical as AnalyzedTestResult[]}
                />
              </div>
            </div>
          )}

          {/* Abnormal Results */}
          {groupedResults.abnormal.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                Abnormal Results
              </h2>
              <div className="overflow-x-auto">
                <ResultsView
                  results={groupedResults.abnormal as AnalyzedTestResult[]}
                />
              </div>
            </div>
          )}

          {/* Normal Results */}
          {groupedResults.normal.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-green-600 dark:text-green-400">
                Normal Results
              </h2>
              <div className="overflow-x-auto">
                <ResultsView
                  results={groupedResults.normal as AnalyzedTestResult[]}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
