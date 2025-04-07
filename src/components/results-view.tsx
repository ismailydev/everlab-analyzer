"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnalyzedTestResult } from "@/lib/types";

interface ResultsViewProps {
  results: AnalyzedTestResult[];
}

export function ResultsView({ results }: ResultsViewProps) {
  if (!results || results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No results found in this category.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Test Name</TableHead>
                <TableHead className="w-[100px]">Value</TableHead>
                <TableHead className="w-[100px]">Units</TableHead>
                <TableHead className="w-[200px]">Reference Range</TableHead>
                <TableHead className="w-[200px]">Related Conditions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {result.testName}
                  </TableCell>
                  <TableCell>{result.value}</TableCell>
                  <TableCell>{result.units}</TableCell>
                  <TableCell>{result.referenceRange}</TableCell>
                  <TableCell>
                    {result.relatedConditions.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {result.relatedConditions.map(
                          (condition: string, i: number) => (
                            <li key={i}>{condition}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      "None"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
