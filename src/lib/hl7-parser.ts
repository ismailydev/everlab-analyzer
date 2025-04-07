import { Patient, TestResult, ParsedHL7Result } from "./types";

/**
 * Parse an HL7 message into patient info and test results
 */
export function parseHL7(content: string): ParsedHL7Result {
  try {
    // Split content into lines and filter out empty lines
    const lines = content.split("\n").filter((line) => line.trim());

    // Find PID segment
    const pidSegment = lines.find((line) => line.startsWith("PID"));
    if (!pidSegment) {
      throw new Error("No PID segment found");
    }

    // Parse PID segment
    const pidFields = pidSegment.split("|");
    const patient: Patient = {
      patientId: getComponent(pidFields[3], 0),
      patientName: formatName(pidFields[5]),
      dateOfBirth: formatDate(pidFields[7]),
      gender: pidFields[8],
      address: formatAddress(pidFields[11]),
      phone: getComponent(pidFields[13], 0),
    };

    const results: TestResult[] = [];
    lines.forEach((line) => {
      if (line.startsWith("OBX")) {
        const fields = line.split("|");
        const testInfo = fields[3]?.split("^");
        const testName = testInfo?.[1] || testInfo?.[0];
        const value = fields[5];
        const units = getComponent(fields[6], 0);
        const referenceRange = fields[7];
        const abnormalFlag = fields[8];

        if (testName && value) {
          results.push({
            testName: testName.replace(":", ""),
            value: String(parseValue(value)),
            units,
            referenceRange,
            abnormalFlag,
            severity: getSeverity(abnormalFlag),
          });
        }
      }
    });

    return { patient, results };
  } catch (error) {
    console.error("Error parsing HL7:", error);
    throw new Error("Failed to parse HL7 message");
  }
}

/**
 * Extract a component from a field at a specific index
 */
function getComponent(field: string | undefined, index: number): string {
  if (!field) return "";
  const components = field.split("^");
  return components[index] || "";
}

/**
 * Format a name from a field
 */
function formatName(field: string | undefined): string {
  if (!field) return "";
  const components = field.split("^");
  const lastName = components[0] || "";
  const firstName = components[1] || "";
  return `${firstName} ${lastName}`.trim();
}

/**
 * Format a date from a string
 */
function formatDate(date: string | undefined): string {
  if (!date) return "";
  if (date.length === 8) {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return date;
}

/**
 * Format an address from a field
 */
function formatAddress(field: string | undefined): string {
  if (!field) return "";
  return field.split("^").filter(Boolean).join(", ");
}

/**
 * Parse a value to the appropriate type
 */
function parseValue(value: string | undefined): string | number {
  if (!value) return "";
  const numValue = Number(value);
  return isNaN(numValue) ? value : numValue;
}

/**
 * Get the severity from an abnormal flag
 */
function getSeverity(
  flag: string | undefined
): "normal" | "low" | "high" | "critical" {
  if (!flag) return "normal";

  switch (flag.toUpperCase()) {
    case "H":
      return "high";
    case "L":
      return "low";
    case "HH":
    case "CH":
    case "LL":
    case "CL":
      return "critical";
    default:
      return "normal";
  }
}

/**
 * Get all abnormal results from a list of test results
 */
export function getAbnormalResults(results: TestResult[]): TestResult[] {
  return results.filter((result) => {
    // Check for explicit abnormal flags
    if (result.abnormalFlag && result.severity !== "normal") {
      return true;
    }

    // Check numeric values against reference range if no flag
    if (
      !result.abnormalFlag &&
      typeof result.value === "number" &&
      result.referenceRange
    ) {
      const [min, max] = result.referenceRange.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        return result.value < min || result.value > max;
      }
    }

    return false;
  });
}
