import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function GeneratePayslip() {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">Generate Payslip</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a single payslip with live preview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form - 40% */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employee Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="select-employee">
                    Select Employee <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger id="select-employee" data-testid="select-employee">
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>
                        No employees found
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Or{" "}
                    <a href="/employees" className="text-primary hover:underline">
                      add a new employee
                    </a>
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pay-period">
                      Pay Period <span className="text-destructive">*</span>
                    </Label>
                    <Input id="pay-period" placeholder="Jan 2025" data-testid="input-pay-period" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pay-date">
                      Pay Date <span className="text-destructive">*</span>
                    </Label>
                    <Input id="pay-date" type="date" data-testid="input-pay-date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work-days">Effective Work Days</Label>
                    <Input
                      id="work-days"
                      type="number"
                      defaultValue="31"
                      className="text-right"
                      data-testid="input-work-days"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lop">LOP</Label>
                    <Input
                      id="lop"
                      type="number"
                      defaultValue="0"
                      className="text-right"
                      data-testid="input-lop"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Earnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
                  <div>Component</div>
                  <div className="text-right">Full</div>
                  <div className="text-right">Actual</div>
                </div>
                <Separator />

                {[
                  { label: "BASIC", id: "basic" },
                  { label: "HRA", id: "hra" },
                  { label: "Conveyance Allowance", id: "conveyance" },
                  { label: "Other Allowance", id: "other" },
                  { label: "Special Allowance", id: "special" },
                  { label: "Bonus/Incentive", id: "bonus" },
                ].map((item) => (
                  <div key={item.id} className="grid grid-cols-3 gap-2 items-center">
                    <Label htmlFor={`${item.id}-full`} className="text-xs">
                      {item.label}
                    </Label>
                    <Input
                      id={`${item.id}-full`}
                      type="number"
                      placeholder="0"
                      className="text-right text-sm h-9"
                      data-testid={`input-${item.id}-full`}
                    />
                    <Input
                      id={`${item.id}-actual`}
                      type="number"
                      placeholder="0"
                      className="text-right text-sm h-9"
                      data-testid={`input-${item.id}-actual`}
                    />
                  </div>
                ))}

                <Separator />
                <div className="grid grid-cols-3 gap-2 items-center font-medium">
                  <div className="text-sm">Total Earnings</div>
                  <div className="text-right text-sm">₹0</div>
                  <div className="text-right text-sm">₹0</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deductions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pf-deduction" className="text-xs">
                        PF
                      </Label>
                      <Input
                        id="pf-deduction"
                        type="number"
                        placeholder="0"
                        className="text-right"
                        data-testid="input-pf-deduction"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prof-tax" className="text-xs">
                        Professional Tax
                      </Label>
                      <Input
                        id="prof-tax"
                        type="number"
                        placeholder="0"
                        className="text-right"
                        data-testid="input-prof-tax"
                      />
                    </div>
                  </div>

                  <Separator />
                  <div className="flex justify-between items-center font-medium">
                    <div className="text-sm">Total Deductions</div>
                    <div className="text-sm">₹0</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Earnings</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Deductions</span>
                  <span className="font-medium">₹0</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Net Pay</span>
                  <span className="text-xl font-semibold text-primary">₹0</span>
                </div>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="employer-pf" className="text-xs">
                    Employer PF
                  </Label>
                  <Input
                    id="employer-pf"
                    type="number"
                    placeholder="0"
                    className="text-right"
                    data-testid="input-employer-pf"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button className="flex-1" disabled={isGenerating} data-testid="button-generate-pdf">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview - 60% */}
          <div className="lg:col-span-3">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">Preview</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="100">
                      <SelectTrigger className="w-24 h-8 text-xs" data-testid="select-zoom">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
                        <SelectItem value="100">100%</SelectItem>
                        <SelectItem value="125">125%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-md bg-muted/30 aspect-[1/1.414] flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      PDF preview will appear here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fill in the form to generate preview
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
