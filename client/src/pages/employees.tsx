import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock employee data - will be replaced with real data
  const employees: any[] = [];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground leading-tight">Employee Database</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage employee profiles and information
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-employee">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter employee details to create a new profile
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee-no">
                      Employee No <span className="text-destructive">*</span>
                    </Label>
                    <Input id="employee-no" placeholder="EMP001" data-testid="input-employee-no" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="John Doe" data-testid="input-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joining-date">
                      Joining Date <span className="text-destructive">*</span>
                    </Label>
                    <Input id="joining-date" type="date" data-testid="input-joining-date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">
                      Designation <span className="text-destructive">*</span>
                    </Label>
                    <Input id="designation" placeholder="Software Engineer" data-testid="input-designation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Input id="department" placeholder="Engineering" data-testid="input-department" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-destructive">*</span>
                    </Label>
                    <Input id="location" placeholder="Bangalore" data-testid="input-location" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-foreground mb-3">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">
                        Bank Name <span className="text-destructive">*</span>
                      </Label>
                      <Input id="bank-name" placeholder="State Bank of India" data-testid="input-bank-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-no">
                        Account Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="account-no"
                        placeholder="1234567890"
                        className="font-mono"
                        data-testid="input-account-no"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc">
                        IFSC Code <span className="text-destructive">*</span>
                      </Label>
                      <Input id="ifsc" placeholder="SBIN0001234" className="font-mono" data-testid="input-ifsc" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pan">
                        PAN Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="pan"
                        placeholder="ABCDE1234F"
                        className="font-mono uppercase"
                        data-testid="input-pan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pf-number">PF Number</Label>
                      <Input id="pf-number" placeholder="PF12345678" className="font-mono" data-testid="input-pf-number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pf-uan">PF UAN</Label>
                      <Input id="pf-uan" placeholder="123456789012" className="font-mono" data-testid="input-pf-uan" />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button data-testid="button-save-employee">Save Employee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, employee no, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-employees"
            />
          </div>
        </div>

        {/* Employee List */}
        {employees.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No employees yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Start by adding your first employee to the database
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-employee">
                <Plus className="w-4 h-4 mr-2" />
                Add First Employee
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee: any) => (
              <Card key={employee.id} className="hover-elevate" data-testid={`card-employee-${employee.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{employee.name}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {employee.employeeNo}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-edit-${employee.id}`}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-delete-${employee.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Designation</p>
                    <p className="text-sm text-foreground">{employee.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <Badge variant="secondary" className="text-xs">
                      {employee.department}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm text-foreground">{employee.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
