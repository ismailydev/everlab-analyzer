import { NextRequest, NextResponse } from "next/server";
import { parseHL7 } from "@/lib/hl7-parser";
import {
  loadDiagnosticMetrics,
  loadConditions,
  loadDiagnosticGroups,
  loadDiagnostics,
} from "@/lib/csv-parser";
import { prepareAnalysisResponse } from "@/lib/result-analyzer";
import { HL7Result } from "@/lib/types";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        { status: 400 }
      );
    }

    // Convert file to string
    const fileBuffer = await file.arrayBuffer();
    const fileContent = new TextDecoder().decode(fileBuffer);

    // Replace all types of line endings with \n
    const normalizedContent = fileContent.replace(/\r\n|\r|\n/g, "\n");

    // Parse the HL7 file
    const { patient, results } = parseHL7(normalizedContent);

    // Load diagnostic data
    const filesPath = path.join(process.cwd(), "src/data");

    try {
      const diagnosticMetrics = loadDiagnosticMetrics(
        path.join(filesPath, "diagnostic_metrics.csv")
      );
      const conditions = loadConditions(path.join(filesPath, "conditions.csv"));
      const diagnosticGroups = loadDiagnosticGroups(
        path.join(filesPath, "diagnostic_groups.csv")
      );
      const diagnostics = loadDiagnostics(
        path.join(filesPath, "diagnostics.csv")
      );

      // Convert results to HL7Result format
      const hl7Results: HL7Result[] = results.map((result) => ({
        testName: result.testName,
        value: String(result.value),
        units: result.units,
        referenceRange: result.referenceRange,
        abnormalFlag: result.abnormalFlag,
        age: patient.dateOfBirth
          ? new Date().getFullYear() -
            parseInt(patient.dateOfBirth.substring(0, 4))
          : undefined,
        gender: patient.gender,
      }));

      // Process the results with our analyzer
      const analysisResponse = prepareAnalysisResponse(
        hl7Results,
        diagnosticMetrics,
        conditions,
        diagnosticGroups,
        diagnostics
      );

      // Return the response
      return NextResponse.json({
        success: true,
        message: "File processed successfully",
        patient,
        ...analysisResponse,
      });
    } catch (error) {
      console.error("Error loading diagnostic files:", error);

      // Even if we couldn't load the diagnostic files, we can still return basic patient info
      return NextResponse.json(
        {
          success: false,
          message:
            "Error loading diagnostic files. Make sure files directory is accessible.",
          patient,
          results: [],
          summary: {
            totalResults: 0,
            criticalCount: 0,
            abnormalCount: 0,
            normalCount: 0,
          },
          groupedResults: {
            critical: [],
            abnormal: [],
            normal: [],
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error processing file",
      },
      { status: 500 }
    );
  }
}
