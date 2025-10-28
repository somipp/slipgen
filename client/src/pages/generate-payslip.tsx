import { useState, useEffect } from "react";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "@shared/schema";

export default function GeneratePayslip() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [formData, setFormData] = useState({
    payPeriod: "",
    payDate: "",
    effectiveWorkDays: 31,
    lop: 0,
    elAvailed: 0,
    basicFull: 0,
    basicActual: 0,
    hraFull: 0,
    hraActual: 0,
    conveyanceAllowanceFull: 0,
    conveyanceAllowanceActual: 0,
    otherAllowanceFull: 0,
    otherAllowanceActual: 0,
    specialAllowanceFull: 0,
    specialAllowanceActual: 0,
    bounsIncentiveFull: 0,
    bounsIncentiveActual: 0,
    pfActual: 0,
    profTaxActual: 0,
    employerPf: 0,
  });
  const { toast } = useToast();

  const { data: employees, isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/payslips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate payslip");
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${data.payslipData.payPeriod}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payslip generated and downloaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate payslip",
        variant: "destructive",
      });
    },
  });

  // Calculate totals
  const totalEarningsFull =
    formData.basicFull +
    formData.hraFull +
    formData.conveyanceAllowanceFull +
    formData.otherAllowanceFull +
    formData.specialAllowanceFull +
    formData.bounsIncentiveFull;

  const totalEarningsActual =
    formData.basicActual +
    formData.hraActual +
    formData.conveyanceAllowanceActual +
    formData.otherAllowanceActual +
    formData.specialAllowanceActual +
    formData.bounsIncentiveActual;

  const totalDeductions = formData.pfActual + formData.profTaxActual;
  const netPay = totalEarningsActual - totalDeductions;

  const handleGenerate = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }

    if (!formData.payPeriod || !formData.payDate) {
      toast({
        title: "Error",
        description: "Please fill in pay period and pay date",
        variant: "destructive",
      });
      return;
    }

    const payslipData = {
      payslipNumber: `PSL-${Date.now()}`,
      ...formData,
      totalEarningsFull: totalEarningsFull.toString(),
      totalEarningsActual: totalEarningsActual.toString(),
      totalDeductionsActual: totalDeductions.toString(),
      netPay: netPay.toString(),
    };

    generateMutation.mutate({
      employeeId: selectedEmployeeId,
      payslipData,
      format: "A4",
    });
  };

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
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger id="select-employee" data-testid="select-employee">
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading employees...
                        </SelectItem>
                      ) : employees && employees.length > 0 ? (
                        employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} ({emp.employeeNo})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No employees found
                        </SelectItem>
                      )}
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
                    <Input
                      id="pay-period"
                      value={formData.payPeriod}
                      onChange={(e) => setFormData({ ...formData, payPeriod: e.target.value })}
                      placeholder="Jan 2025"
                      data-testid="input-pay-period"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pay-date">
                      Pay Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="pay-date"
                      value={formData.payDate}
                      onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
                      placeholder="31/01/2025"
                      data-testid="input-pay-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work-days">Effective Work Days</Label>
                    <Input
                      id="work-days"
                      type="number"
                      value={formData.effectiveWorkDays}
                      onChange={(e) =>
                        setFormData({ ...formData, effectiveWorkDays: parseInt(e.target.value) || 31 })
                      }
                      className="text-right"
                      data-testid="input-work-days"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lop">LOP</Label>
                    <Input
                      id="lop"
                      type="number"
                      value={formData.lop}
                      onChange={(e) =>
                        setFormData({ ...formData, lop: parseInt(e.target.value) || 0 })
                      }
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
                  { label: "BASIC", key: "basic" },
                  { label: "HRA", key: "hra" },
                  { label: "Conveyance", key: "conveyanceAllowance" },
                  { label: "Other", key: "otherAllowance" },
                  { label: "Special", key: "specialAllowance" },
                  { label: "Bonus", key: "bounsIncentive" },
                ].map((item) => (
                  <div key={item.key} className="grid grid-cols-3 gap-2 items-center">
                    <Label htmlFor={`${item.key}-full`} className="text-xs">
                      {item.label}
                    </Label>
                    <Input
                      id={`${item.key}-full`}
                      type="number"
                      value={(formData as any)[`${item.key}Full`]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [`${item.key}Full`]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-right text-sm h-9"
                      data-testid={`input-${item.key}-full`}
                    />
                    <Input
                      id={`${item.key}-actual`}
                      type="number"
                      value={(formData as any)[`${item.key}Actual`]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [`${item.key}Actual`]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-right text-sm h-9"
                      data-testid={`input-${item.key}-actual`}
                    />
                  </div>
                ))}

                <Separator />
                <div className="grid grid-cols-3 gap-2 items-center font-medium">
                  <div className="text-sm">Total Earnings</div>
                  <div className="text-right text-sm">₹{totalEarningsFull.toFixed(0)}</div>
                  <div className="text-right text-sm">₹{totalEarningsActual.toFixed(0)}</div>
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
                        value={formData.pfActual}
                        onChange={(e) =>
                          setFormData({ ...formData, pfActual: parseFloat(e.target.value) || 0 })
                        }
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
                        value={formData.profTaxActual}
                        onChange={(e) =>
                          setFormData({ ...formData, profTaxActual: parseFloat(e.target.value) || 0 })
                        }
                        className="text-right"
                        data-testid="input-prof-tax"
                      />
                    </div>
                  </div>

                  <Separator />
                  <div className="flex justify-between items-center font-medium">
                    <div className="text-sm">Total Deductions</div>
                    <div className="text-sm">₹{totalDeductions.toFixed(0)}</div>
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
                  <span className="font-medium">₹{totalEarningsActual.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Deductions</span>
                  <span className="font-medium">₹{totalDeductions.toFixed(0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Net Pay</span>
                  <span className="text-xl font-semibold text-primary">₹{netPay.toFixed(0)}</span>
                </div>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="employer-pf" className="text-xs">
                    Employer PF
                  </Label>
                  <Input
                    id="employer-pf"
                    type="number"
                    value={formData.employerPf}
                    onChange={(e) =>
                      setFormData({ ...formData, employerPf: parseFloat(e.target.value) || 0 })
                    }
                    className="text-right"
                    data-testid="input-employer-pf"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                data-testid="button-generate-pdf"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate & Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview - 60% */}
          <div className="lg:col-span-3">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-md bg-muted/30 aspect-[1/1.414] flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      PDF preview will appear after generation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fill in the form and click generate to download
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
