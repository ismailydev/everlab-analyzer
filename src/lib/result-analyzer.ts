import {
  DiagnosticMetric,
  Condition,
  DiagnosticGroup,
  Diagnostic,
} from "./types";
import { HL7Result } from "./types";
import { AnalysisResponse, AnalyzedTestResult } from "./types";

function normalizeString(str: string | undefined): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findMatchingMetric(
  testName: string,
  metrics: DiagnosticMetric[],
  units?: string
): DiagnosticMetric | undefined {
  if (!testName) return undefined;
  const normalizedTestName = normalizeString(testName);

  // First try direct matching with name and units if provided
  let match = metrics.find((metric) => {
    if (!metric || !metric.name) return false;
    const nameMatch = normalizeString(metric.name) === normalizedTestName;
    return units ? nameMatch && metric.units === units : nameMatch;
  });

  // If no direct match, try to match by ORU codes
  if (!match) {
    match = metrics.find((metric) => {
      if (!metric || !metric.name) return false;

      // Check ORU sonic codes
      if (
        metric.oru_sonic_codes &&
        metric.oru_sonic_codes.some((code) => {
          const normalizedCode = normalizeString(code);
          return (
            normalizedCode &&
            (normalizedCode === normalizedTestName ||
              normalizedTestName.includes(normalizedCode) ||
              normalizedCode.includes(normalizedTestName))
          );
        })
      ) {
        return true;
      }

      // Check for partial matches in either direction
      const normalizedMetricName = normalizeString(metric.name);
      return (
        normalizedMetricName.includes(normalizedTestName) ||
        normalizedTestName.includes(normalizedMetricName)
      );
    });
  }

  return match;
}

function parseReferenceRange(referenceRange: string): {
  min?: number;
  max?: number;
  type: string;
} {
  if (!referenceRange || typeof referenceRange !== "string")
    return { type: "unknown" };

  // Clean up the reference range string
  const trimmedRange = referenceRange.trim();

  // First handle '<' cases (must check before checking for '-')
  if (trimmedRange.match(/^<\s*\d/)) {
    const maxStr = trimmedRange.replace(/^<\s*/, "");
    const max = parseFloat(maxStr);
    if (!isNaN(max)) {
      return { max, type: "less_than" };
    }
  }

  // Then handle '<=' cases
  if (trimmedRange.match(/^<=\s*\d/)) {
    const maxStr = trimmedRange.replace(/^<=\s*/, "");
    const max = parseFloat(maxStr);
    if (!isNaN(max)) {
      return { max, type: "less_than_equal" };
    }
  }

  // Then handle '>' cases
  if (trimmedRange.match(/^>\s*\d/)) {
    const minStr = trimmedRange.replace(/^>\s*/, "");
    const min = parseFloat(minStr);
    if (!isNaN(min)) {
      return { min, type: "greater_than" };
    }
  }

  // Then handle '>=' cases
  if (trimmedRange.match(/^>=\s*\d/)) {
    const minStr = trimmedRange.replace(/^>=\s*/, "");
    const min = parseFloat(minStr);
    if (!isNaN(min)) {
      return { min, type: "greater_than_equal" };
    }
  }

  // Finally handle range format (min-max)
  if (trimmedRange.includes("-")) {
    const [minStr, maxStr] = trimmedRange.split("-").map((s) => s.trim());
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);

    if (!isNaN(min) && !isNaN(max)) {
      return { min, max, type: "range" };
    }
  }

  return { type: "unknown" };
}

function determineSeverity(
  value: string,
  referenceRange?: string,
  abnormalFlag?: string
): "normal" | "abnormal" | "critical" {
  // If there's an abnormal flag, use it as the primary indicator
  if (abnormalFlag) {
    const flag = abnormalFlag.toUpperCase();
    if (["C", "HH", "LL", "CC", "CL", "CH"].includes(flag)) {
      return "critical";
    }
    if (["H", "L", "A", "AA", "W"].includes(flag)) {
      return "abnormal";
    }
  }

  // If there's a reference range, check against it
  if (referenceRange) {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      return "normal";
    }

    const range = parseReferenceRange(referenceRange);

    switch (range.type) {
      case "range":
        if (range.min !== undefined && range.max !== undefined) {
          if (numericValue < range.min) {
            const rangeWidth = range.max - range.min;
            const deviation = (range.min - numericValue) / rangeWidth;
            return deviation > 0.3 ? "critical" : "abnormal";
          }

          if (numericValue > range.max) {
            const rangeWidth = range.max - range.min;
            const deviation = (numericValue - range.max) / rangeWidth;
            return deviation > 0.3 ? "critical" : "abnormal";
          }
        }
        break;

      case "less_than":
        if (range.max !== undefined) {
          if (numericValue >= range.max) {
            const deviation = numericValue / range.max - 1;
            return deviation > 0.5 ? "critical" : "abnormal";
          }
        }
        break;

      case "less_than_equal":
        if (range.max !== undefined) {
          if (numericValue > range.max) {
            const deviation = numericValue / range.max - 1;
            return deviation > 0.5 ? "critical" : "abnormal";
          }
        }
        break;

      case "greater_than":
        if (range.min !== undefined) {
          if (numericValue <= range.min) {
            const deviation = 1 - numericValue / range.min;
            return deviation > 0.3 ? "critical" : "abnormal";
          }
        }
        break;

      case "greater_than_equal":
        if (range.min !== undefined) {
          if (numericValue < range.min) {
            const deviation = 1 - numericValue / range.min;
            return deviation > 0.3 ? "critical" : "abnormal";
          }
        }
        break;
    }
  }

  return "normal";
}

function getInterpretations(result: HL7Result, severity: string): string[] {
  const interpretations: string[] = [];
  const value = parseFloat(result.value);

  // Add basic interpretation based on severity
  if (severity === "critical") {
    interpretations.push(`Critical ${result.testName} level detected.`);
    interpretations.push(`Immediate clinical attention may be required.`);
  } else if (severity === "abnormal") {
    interpretations.push(`Abnormal ${result.testName} level detected.`);
  }

  // Add specific interpretations for common tests
  if (result.testName.includes("Cholesterol") && value > 5.5) {
    interpretations.push(
      `Elevated cholesterol increases risk of cardiovascular disease.`
    );
  }

  if (result.testName.includes("Glucose") && value > 7.0) {
    interpretations.push(`Elevated fasting glucose may indicate diabetes.`);
  }

  if (
    result.testName.includes("Haemoglobin") &&
    value < 120 &&
    result.gender === "F"
  ) {
    interpretations.push(`Low hemoglobin may indicate anemia.`);
  }

  if (
    result.testName.includes("Haemoglobin") &&
    value < 130 &&
    result.gender === "M"
  ) {
    interpretations.push(`Low hemoglobin may indicate anemia.`);
  }

  return interpretations;
}

function calculateRiskLevel(
  result: HL7Result,
  severity: string
): "low" | "moderate" | "high" | undefined {
  // Only calculate risk for certain test types
  if (
    result.testName.includes("Cholesterol") ||
    result.testName.includes("Glucose") ||
    result.testName.includes("Blood Pressure") ||
    result.testName.includes("HbA1c")
  ) {
    if (severity === "critical") return "high";
    if (severity === "abnormal") return "moderate";
    return "low";
  }

  return undefined;
}

export function analyzeResults(
  hl7Results: HL7Result[],
  diagnosticMetrics: DiagnosticMetric[],
  conditions: Condition[],
  diagnosticGroups: DiagnosticGroup[],
  diagnostics: Diagnostic[]
): AnalyzedTestResult[] {
  return hl7Results.map((result) => {
    const metric = findMatchingMetric(
      result.testName,
      diagnosticMetrics,
      result.units
    );

    // Find related conditions, diagnostic groups, and diagnostics
    let relatedConditions: string[] = [];
    let relatedDiagnosticGroups: string[] = [];
    let relatedDiagnostics: string[] = [];

    const normalizedTestName = normalizeString(result.testName);

    if (metric) {
      const normalizedMetricName = normalizeString(metric.name);

      // Find related conditions
      relatedConditions = conditions
        .filter((c) => {
          if (!c || !c.diagnostic_metrics) return false;

          return c.diagnostic_metrics.some((m) => {
            const normalizedMetric = normalizeString(m);
            return (
              normalizedMetric === normalizedMetricName ||
              normalizedMetric === normalizedTestName ||
              normalizedMetric.includes(normalizedTestName) ||
              normalizedTestName.includes(normalizedMetric)
            );
          });
        })
        .map((c) => c.name);

      // Find related diagnostic groups through direct metric matching
      relatedDiagnosticGroups = diagnosticGroups
        .filter((g) => {
          if (!g || !g.diagnostic_metrics) return false;

          return g.diagnostic_metrics.some((m) => {
            const normalizedMetric = normalizeString(m);
            return (
              normalizedMetric === normalizedMetricName ||
              normalizedMetric === normalizedTestName ||
              normalizedMetric.includes(normalizedTestName) ||
              normalizedTestName.includes(normalizedMetric)
            );
          });
        })
        .map((g) => g.name);

      // Check for relationships through related conditions
      const conditionRelatedGroups = relatedConditions.flatMap((condition) => {
        const matchingCondition = conditions.find((c) => c.name === condition);
        return matchingCondition?.diagnostic_groups || [];
      });

      // Add diagnostic groups related through conditions
      if (conditionRelatedGroups.length > 0) {
        const groupNames = diagnosticGroups
          .filter((g) =>
            conditionRelatedGroups.some(
              (groupName) =>
                normalizeString(g.name) === normalizeString(groupName)
            )
          )
          .map((g) => g.name);

        relatedDiagnosticGroups = [
          ...new Set([...relatedDiagnosticGroups, ...groupNames]),
        ];
      }

      // Find related diagnostics
      relatedDiagnostics = diagnostics
        .filter((d) => {
          if (!d || !d.diagnostic_metrics) return false;

          return d.diagnostic_metrics.some((m) => {
            const normalizedMetric = normalizeString(m);
            return (
              normalizedMetric === normalizedMetricName ||
              normalizedMetric === normalizedTestName ||
              normalizedMetric.includes(normalizedTestName) ||
              normalizedTestName.includes(normalizedMetric)
            );
          });
        })
        .map((d) => d.name);
    }

    const severity = determineSeverity(
      result.value,
      result.referenceRange,
      result.abnormalFlag
    );
    const interpretations = getInterpretations(result, severity);
    const riskLevel = calculateRiskLevel(result, severity);

    return {
      testName: result.testName,
      value: result.value,
      units: result.units,
      referenceRange: result.referenceRange,
      severity,
      relatedConditions,
      relatedDiagnosticGroups,
      relatedDiagnostics,
      interpretations: interpretations.length > 0 ? interpretations : undefined,
      riskLevel,
    };
  });
}

/**
 * Function to prepare analysis results for API response
 * This function can be called from an API endpoint
 */
export function prepareAnalysisResponse(
  hl7Results: HL7Result[],
  diagnosticMetrics: DiagnosticMetric[],
  conditions: Condition[],
  diagnosticGroups: DiagnosticGroup[],
  diagnostics: Diagnostic[]
): AnalysisResponse {
  // Get the analyzed results
  const analyzedResults = analyzeResults(
    hl7Results,
    diagnosticMetrics,
    conditions,
    diagnosticGroups,
    diagnostics
  );

  // Group the results by severity
  const criticalResults = analyzedResults.filter(
    (result) => result.severity === "critical"
  );
  const abnormalResults = analyzedResults.filter(
    (result) => result.severity === "abnormal"
  );
  const normalResults = analyzedResults.filter(
    (result) => result.severity === "normal"
  );

  // Extract patient info from the first result if available
  const patientInfo = hl7Results[0]
    ? {
        age: hl7Results[0].age,
        gender: hl7Results[0].gender,
      }
    : undefined;

  // Create the response object
  return {
    results: analyzedResults,
    summary: {
      totalResults: analyzedResults.length,
      criticalCount: criticalResults.length,
      abnormalCount: abnormalResults.length,
      normalCount: normalResults.length,
      patientInfo,
    },
    groupedResults: {
      critical: criticalResults,
      abnormal: abnormalResults,
      normal: normalResults,
    },
  };
}
