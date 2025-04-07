import fs from "fs";
import {
  DiagnosticMetric,
  Condition,
  DiagnosticGroup,
  Diagnostic,
} from "./types";

/**
 * Split a comma-separated string into an array, handling quoted values
 */
function splitArray(value: string): string[] {
  if (!value) return [];
  // Remove any surrounding quotes and split by comma
  return value
    .replace(/^["']|["']$/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Load diagnostic metrics from CSV file
 */
export function loadDiagnosticMetrics(filePath: string): DiagnosticMetric[] {
  try {
    // For Next.js server components, we need to use the fs module directly
    const content = fs.readFileSync(filePath, "utf-8");

    // Simple CSV parsing since we're in a server component and can't use csv-parse
    const lines = content.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((header) => header.trim());

    const records = lines.slice(1).map((line) => {
      // Handle commas within quotes
      let inQuotes = false;
      let currentField = "";
      const fields: string[] = [];

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          fields.push(currentField);
          currentField = "";
        } else {
          currentField += char;
        }
      }

      fields.push(currentField);

      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = fields[index]
          ? fields[index].replace(/^"|"$/g, "")
          : "";
      });

      return record;
    });

    return records.map((record) => ({
      name: record.name || "",
      oru_sonic_codes: splitArray(record.oru_sonic_codes || ""),
      diagnostic_groups: splitArray(record.diagnostic_groups || ""),
      units: record.units || "",
      age_ranges: splitArray(record.age_ranges || ""),
      gender: record.gender || "",
      reference_ranges: splitArray(record.reference_ranges || ""),
    }));
  } catch (error) {
    console.error(`Error loading diagnostic metrics from ${filePath}:`, error);
    return [];
  }
}

/**
 * Load conditions from CSV file
 */
export function loadConditions(filePath: string): Condition[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // Parse CSV manually
    const lines = content.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((header) => header.trim());

    const records = lines.slice(1).map((line) => {
      // Handle commas within quotes
      let inQuotes = false;
      let currentField = "";
      const fields: string[] = [];

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          fields.push(currentField);
          currentField = "";
        } else {
          currentField += char;
        }
      }

      fields.push(currentField);

      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = fields[index]
          ? fields[index].replace(/^"|"$/g, "")
          : "";
      });

      return record;
    });

    return records.map((record) => ({
      name: record.name || "",
      diagnostic_metrics: splitArray(record.diagnostic_metrics || ""),
      diagnostic_groups: splitArray(record.diagnostic_groups || ""),
      diagnostics: splitArray(record.diagnostics || ""),
    }));
  } catch (error) {
    console.error(`Error loading conditions from ${filePath}:`, error);
    return [];
  }
}

/**
 * Load diagnostic groups from CSV file
 */
export function loadDiagnosticGroups(filePath: string): DiagnosticGroup[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // Parse CSV manually
    const lines = content.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((header) => header.trim());

    const records = lines.slice(1).map((line) => {
      // Handle commas within quotes
      let inQuotes = false;
      let currentField = "";
      const fields: string[] = [];

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          fields.push(currentField);
          currentField = "";
        } else {
          currentField += char;
        }
      }

      fields.push(currentField);

      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = fields[index]
          ? fields[index].replace(/^"|"$/g, "")
          : "";
      });

      return record;
    });

    return records.map((record) => ({
      name: record.name || "",
      diagnostic_metrics: splitArray(record.diagnostic_metrics || ""),
      diagnostics: splitArray(record.diagnostics || ""),
    }));
  } catch (error) {
    console.error(`Error loading diagnostic groups from ${filePath}:`, error);
    return [];
  }
}

/**
 * Load diagnostics from CSV file
 */
export function loadDiagnostics(filePath: string): Diagnostic[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // Parse CSV manually
    const lines = content.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((header) => header.trim());

    const records = lines.slice(1).map((line) => {
      // Handle commas within quotes
      let inQuotes = false;
      let currentField = "";
      const fields: string[] = [];

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          fields.push(currentField);
          currentField = "";
        } else {
          currentField += char;
        }
      }

      fields.push(currentField);

      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = fields[index]
          ? fields[index].replace(/^"|"$/g, "")
          : "";
      });

      return record;
    });

    return records.map((record) => ({
      name: record.name || "",
      diagnostic_metrics: splitArray(record.diagnostic_metrics || ""),
    }));
  } catch (error) {
    console.error(`Error loading diagnostics from ${filePath}:`, error);
    return [];
  }
}
