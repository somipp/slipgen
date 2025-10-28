import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, User, Loader2 } from "lucide-react";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Employee, InsertEmployee } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<InsertEmployee>>({});
  const { toast } = useToast();

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertEmployee) => apiRequest("POST", "/api/employees", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsAddDialogOpen(false);
      setFormData({});
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertEmployee> }) =>
      apiRequest("PUT", `/api/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      setFormData({});
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data: formData });
    } else {
      createMutation.mutate(formData as InsertEmployee);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setIsEditDialogOpen(true);
  };

  const filteredEmployees = employees?.filter((emp) =>
    searchQuery
      ? emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const EmployeeForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employee-no">
            Employee No <span className="text-destructive">*</span>
          </Label>
          <Input
            id="employee-no"
            value={formData.employeeNo || ""}
            onChange={(e) => setFormData({ ...formData, employeeNo: e.target.value })}
            placeholder="EMP001"
            required
            data-testid="input-employee-no"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
            data-testid="input-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="joining-date">
            Joining Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="joining-date"
            value={formData.joiningDate || ""}
            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
            placeholder="01 Jan 2020"
            required
            data-testid="input-joining-date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="designation">
            Designation <span className="text-destructive">*</span>
          </Label>
          <Input
            id="designation"
            value={formData.designation || ""}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="Software Engineer"
            required
            data-testid="input-designation"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">
            Department <span className="text-destructive">*</span>
          </Label>
          <Input
            id="department"
            value={formData.department || ""}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Engineering"
            required
            data-testid="input-department"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            value={formData.location || ""}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Bangalore"
            required
            data-testid="input-location"
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium text-foreground mb-3">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bank-name">
              Bank Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bank-name"
              value={formData.bankName || ""}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="State Bank of India"
              required
              data-testid="input-bank-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-no">
              Account Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="account-no"
              value={formData.bankAccountNo || ""}
              onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
              placeholder="1234567890"
              className="font-mono"
              required
              data-testid="input-account-no"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifsc">
              IFSC Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ifsc"
              value={formData.ifscCode || ""}
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
              placeholder="SBIN0001234"
              className="font-mono"
              required
              data-testid="input-ifsc"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pan">
              PAN Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pan"
              value={formData.panNumber || ""}
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
              placeholder="ABCDE1234F"
              className="font-mono uppercase"
              required
              data-testid="input-pan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-number">PF Number</Label>
            <Input
              id="pf-number"
              value={formData.pfNumber || ""}
              onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
              placeholder="PF12345678"
              className="font-mono"
              data-testid="input-pf-number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-uan">PF UAN</Label>
            <Input
              id="pf-uan"
              value={formData.pfUan || ""}
              onChange={(e) => setFormData({ ...formData, pfUan: e.target.value })}
              placeholder="123456789012"
              className="font-mono"
              data-testid="input-pf-uan"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setFormData({});
            setEditingEmployee(null);
          }}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-employee">
          {(createMutation.isPending || updateMutation.isPending) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Save Employee
        </Button>
      </DialogFooter>
    </form>
  );

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
              <EmployeeForm />
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Employee</DialogTitle>
                <DialogDescription>
                  Update employee details
                </DialogDescription>
              </DialogHeader>
              <EmployeeForm />
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-20 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEmployees && filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                {searchQuery ? "No employees found" : "No employees yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Start by adding your first employee to the database"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-employee">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Employee
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees?.map((employee) => (
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(employee)}
                        data-testid={`button-edit-${employee.id}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this employee?")) {
                            deleteMutation.mutate(employee.id);
                          }
                        }}
                        data-testid={`button-delete-${employee.id}`}
                      >
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
