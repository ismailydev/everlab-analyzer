export interface HL7Result {
  testName: string;
  value: string;
  units?: string;
  referenceRange?: string;
  abnormalFlag?: string;
  age?: number;
  gender?: string;
}

export interface DiagnosticMetric {
  name: string;
  oru_sonic_codes: string[];
  diagnostic_groups: string[];
  units: string;
  age_ranges: string[];
  gender: string;
  reference_ranges: string[];
}

export interface Condition {
  name: string;
  diagnostic_metrics: string[];
  diagnostic_groups: string[];
  diagnostics: string[];
}

export interface DiagnosticGroup {
  name: string;
  diagnostic_metrics: string[];
  diagnostics: string[];
}

export interface Diagnostic {
  name: string;
  diagnostic_metrics: string[];
}

export interface Patient {
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  phone?: string;
}

export interface TestResult {
  testName: string;
  value: string;
  units?: string;
  referenceRange?: string;
  abnormalFlag?: string;
  severity?: string;
  conditions?: string[];
}

export interface ResultsSummary {
  totalResults: number;
  criticalCount: number;
  abnormalCount: number;
  normalCount: number;
}

export interface GroupedResults {
  critical: TestResult[];
  abnormal: TestResult[];
  normal: TestResult[];
}

export interface AnalysisResult {
  success: boolean;
  message: string;
  patient?: {
    patientId: string;
    patientName: string;
    dateOfBirth: string;
    gender: string;
    address?: string;
    phone?: string;
  };
  summary: ResultsSummary;
  groupedResults: GroupedResults;
}

export interface ParsedHL7Result {
  patient: Patient;
  results: TestResult[];
}

// Front-end specific types
export interface AnalysisResponse {
  results: AnalyzedTestResult[];
  summary: {
    totalResults: number;
    criticalCount: number;
    abnormalCount: number;
    normalCount: number;
    patientInfo?: {
      age?: number;
      gender?: string;
    };
  };
  groupedResults: {
    critical: AnalyzedTestResult[];
    abnormal: AnalyzedTestResult[];
    normal: AnalyzedTestResult[];
  };
}

export interface AnalyzedTestResult {
  testName: string;
  value: string;
  units?: string;
  referenceRange?: string;
  severity: 'normal' | 'abnormal' | 'critical';
  relatedConditions: string[];
  relatedDiagnosticGroups: string[];
  relatedDiagnostics: string[];
  interpretations?: string[];
  riskLevel?: 'low' | 'moderate' | 'high';
} 