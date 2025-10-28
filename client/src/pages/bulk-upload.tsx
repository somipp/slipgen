import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Step = "upload" | "mapping" | "validation" | "generation";

export default function BulkUpload() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: "upload", label: "Upload CSV", number: 1 },
    { id: "mapping", label: "Map Columns", number: 2 },
    { id: "validation", label: "Validate Data", number: 3 },
    { id: "generation", label: "Generate PDFs", number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">Bulk Upload Payslips</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload CSV file to generate multiple payslips at once
          </p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        index <= currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.number}
                    </div>
                    <p
                      className={`text-xs mt-2 text-center ${
                        index <= currentStepIndex ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-muted mx-2 -mt-8">
                      <div
                        className={`h-full transition-all ${
                          index < currentStepIndex ? "bg-primary w-full" : "bg-muted w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover-elevate cursor-pointer transition-colors"
                onClick={() => document.getElementById("file-upload")?.click()}
                data-testid="dropzone-upload"
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                  data-testid="input-file-upload"
                />
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base font-medium text-foreground mb-2">
                  Drop CSV file or click to browse
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: .csv, .xlsx (Max 10MB)
                </p>
                {uploadedFile && (
                  <Badge variant="secondary" className="mt-2">
                    <FileText className="w-3 h-3 mr-1" />
                    {uploadedFile.name}
                  </Badge>
                )}
              </div>

              <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-md">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">CSV Format Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>First row must contain column headers</li>
                    <li>Required columns: Employee No, Name, Pay Period, Pay Date</li>
                    <li>All earning and deduction amounts should be numeric</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" data-testid="button-download-template">
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample CSV
                </Button>
                <Button
                  disabled={!uploadedFile}
                  onClick={() => setCurrentStep("mapping")}
                  data-testid="button-next-mapping"
                >
                  Continue to Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "mapping" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 2: Map CSV Columns to Payslip Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Map your CSV column names to the corresponding payslip fields
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[
                  "Employee Number",
                  "Name",
                  "Pay Period",
                  "Pay Date",
                  "Basic Salary (Full)",
                  "Basic Salary (Actual)",
                  "HRA (Full)",
                  "HRA (Actual)",
                  "PF Deduction",
                  "Professional Tax",
                ].map((field) => (
                  <div key={field} className="grid grid-cols-2 gap-4 items-center p-3 bg-muted/30 rounded-md">
                    <div className="text-sm font-medium">{field}</div>
                    <select className="text-sm border border-input bg-background rounded-md px-3 py-2">
                      <option value="">Auto-detect</option>
                      <option value="col1">Column A</option>
                      <option value="col2">Column B</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep("upload")} data-testid="button-back-upload">
                  Back
                </Button>
                <Button onClick={() => setCurrentStep("validation")} data-testid="button-next-validation">
                  Continue to Validation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "validation" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 3: Validate Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-md">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">Validation Complete</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    0 rows validated successfully, 0 errors found
                  </p>
                </div>
              </div>

              <div className="border border-border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 text-sm font-medium">Preview (First 5 rows)</div>
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No data to preview
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep("mapping")} data-testid="button-back-mapping">
                  Back
                </Button>
                <Button onClick={() => setCurrentStep("generation")} data-testid="button-next-generation">
                  Start Generation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "generation" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 4: Generate PDFs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">0 / 0</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-muted-foreground">Processing payslips...</p>
              </div>

              <div className="p-8 text-center border border-dashed border-border rounded-md">
                <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Preparing to generate payslips...
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" disabled={isProcessing} data-testid="button-cancel-generation">
                  Cancel
                </Button>
                <Button disabled data-testid="button-download-zip">
                  <Download className="w-4 h-4 mr-2" />
                  Download ZIP
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
