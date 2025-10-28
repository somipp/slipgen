import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Step = "upload" | "mapping" | "validation" | "generation";

export default function BulkUpload() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const { toast } = useToast();

  const steps = [
    { id: "upload", label: "Upload CSV", number: 1 },
    { id: "mapping", label: "Map Columns", number: 2 },
    { id: "validation", label: "Validate Data", number: 3 },
    { id: "generation", label: "Generate PDFs", number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("csv", file);

      const response = await fetch("/api/upload/csv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload CSV");
      }

      const result = await response.json();
      setCsvData(result.data);
      setCsvHeaders(result.headers);

      toast({
        title: "Success",
        description: `CSV file uploaded successfully. ${result.rowCount} rows found.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload CSV",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/csv-template");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "payslip-template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const handleValidation = () => {
    // Simple validation check
    const errors: any[] = [];
    
    csvData.forEach((row, index) => {
      if (!row.employeeNo) {
        errors.push({ row: index + 1, field: "employeeNo", message: "Employee number is required" });
      }
      if (!row.name) {
        errors.push({ row: index + 1, field: "name", message: "Name is required" });
      }
      if (!row.payPeriod) {
        errors.push({ row: index + 1, field: "payPeriod", message: "Pay period is required" });
      }
    });

    setValidationErrors(errors);
    
    if (errors.length === 0) {
      toast({
        title: "Success",
        description: "All rows validated successfully",
      });
    } else {
      toast({
        title: "Validation Errors",
        description: `Found ${errors.length} errors in CSV data`,
        variant: "destructive",
      });
    }
  };

  const handleBulkGeneration = async () => {
    setIsProcessing(true);
    setCurrentStep("generation");

    try {
      const response = await fetch("/api/payslips/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvData,
          format: "A4",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate payslips");
      }

      // Get success/error counts from headers
      const successCount = parseInt(response.headers.get("X-Success-Count") || "0");
      const errorCount = parseInt(response.headers.get("X-Error-Count") || "0");
      
      setSuccessCount(successCount);
      setErrorCount(errorCount);

      // Download ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslips-bulk-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Generated ${successCount} payslips successfully. ${errorCount > 0 ? `${errorCount} failed.` : ""}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate payslips",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
                {isProcessing ? (
                  <>
                    <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                    <h3 className="text-base font-medium text-foreground mb-2">
                      Processing CSV file...
                    </h3>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-base font-medium text-foreground mb-2">
                      Drop CSV file or click to browse
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supported formats: .csv, .xlsx (Max 10MB)
                    </p>
                  </>
                )}
                {uploadedFile && !isProcessing && (
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
                <Button variant="outline" onClick={handleDownloadTemplate} data-testid="button-download-template">
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample CSV
                </Button>
                <Button
                  disabled={!uploadedFile || isProcessing}
                  onClick={() => {
                    handleValidation();
                    setCurrentStep("validation");
                  }}
                  data-testid="button-next-validation"
                >
                  Continue to Validation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "validation" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 2: Validate Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationErrors.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-md">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Validation Complete</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {csvData.length} rows validated successfully, 0 errors found
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Validation Errors Found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {validationErrors.length} errors found in CSV data
                    </p>
                  </div>
                </div>
              )}

              <div className="border border-border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 text-sm font-medium">Preview (First 5 rows)</div>
                <div className="overflow-x-auto">
                  {csvData.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          {csvHeaders.slice(0, 5).map((header) => (
                            <th key={header} className="px-3 py-2 text-left">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 5).map((row, index) => (
                          <tr key={index} className="border-t">
                            {csvHeaders.slice(0, 5).map((header) => (
                              <td key={header} className="px-3 py-2">
                                {row[header]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No data to preview
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("upload")}
                  data-testid="button-back-upload"
                >
                  Back
                </Button>
                <Button
                  onClick={handleBulkGeneration}
                  disabled={validationErrors.length > 0}
                  data-testid="button-start-generation"
                >
                  Start Generation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "generation" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 3: Generate PDFs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isProcessing ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">Generating...</span>
                    </div>
                    <Progress value={50} className="h-2" />
                    <p className="text-xs text-muted-foreground">Processing payslips...</p>
                  </div>

                  <div className="p-8 text-center border border-dashed border-border rounded-md">
                    <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Generating payslips, please wait...
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-md">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Generation Complete</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {successCount} payslips generated successfully
                        {errorCount > 0 && `, ${errorCount} failed`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentStep("upload");
                        setUploadedFile(null);
                        setCsvData([]);
                        setSuccessCount(0);
                        setErrorCount(0);
                      }}
                      data-testid="button-upload-another"
                    >
                      Upload Another File
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
