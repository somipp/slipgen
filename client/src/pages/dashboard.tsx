import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Users } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: employees, isLoading: employeesLoading } = useQuery<any[]>({
    queryKey: ["/api/employees"],
  });

  const { data: payslips, isLoading: payslipsLoading } = useQuery<any[]>({
    queryKey: ["/api/payslips"],
  });

  const stats = [
    {
      title: "Total Payslips",
      value: payslipsLoading ? "..." : (payslips?.length || 0).toString(),
      icon: FileText,
      description: "Generated payslips",
      loading: payslipsLoading,
    },
    {
      title: "Active Employees",
      value: employeesLoading ? "..." : (employees?.length || 0).toString(),
      icon: Users,
      description: "Registered in system",
      loading: employeesLoading,
    },
    {
      title: "Bulk Uploads",
      value: "0",
      icon: Upload,
      description: "Completed",
      loading: false,
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome to Hanva Payslip Generator. Manage your payroll efficiently.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stat.loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover-elevate cursor-pointer" data-testid="card-quick-generate">
              <Link href="/generate">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Generate Single Payslip</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create payslip for individual employee
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover-elevate cursor-pointer" data-testid="card-quick-bulk">
              <Link href="/bulk-upload">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Bulk Upload Payslips</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload CSV and generate multiple payslips
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </div>

        {/* Getting Started Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Configure Company Settings</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Upload your company logo and signature, set company details
                  </p>
                  <Link href="/settings">
                    <Button variant="link" className="h-auto p-0 mt-1 text-xs">
                      Go to Settings →
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Add Employees</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Create employee profiles with bank details and statutory information
                  </p>
                  <Link href="/employees">
                    <Button variant="link" className="h-auto p-0 mt-1 text-xs">
                      Manage Employees →
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Generate Payslips</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Create single payslips or bulk upload CSV for multiple employees
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
