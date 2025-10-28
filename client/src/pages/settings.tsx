import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, Image as ImageIcon, FileSignature, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CompanySettings } from "@shared/schema";

export default function Settings() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    companyGst: "",
    logoUrl: "",
    signatureUrl: "",
  });
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<CompanySettings | null>({
    queryKey: ["/api/company-settings"],
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || "",
        companyAddress: settings.companyAddress || "",
        companyGst: settings.companyGst || "",
        logoUrl: settings.logoUrl || "",
        signatureUrl: settings.signatureUrl || "",
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", "/api/company-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-settings"] });
      toast({
        title: "Success",
        description: "Company settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload logo");
      return response.json();
    },
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, logoUrl: data.url }));
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    },
  });

  const uploadSignatureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("signature", file);
      const response = await fetch("/api/upload/signature", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload signature");
      return response.json();
    },
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, signatureUrl: data.url }));
      toast({
        title: "Success",
        description: "Signature uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload signature",
        variant: "destructive",
      });
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      uploadLogoMutation.mutate(file);
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignatureFile(file);
      uploadSignatureMutation.mutate(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">Company Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure company information and branding for payslips
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
              <CardDescription>
                This information will appear on all generated payslips
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company-name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Hanva Technologies Pvt Ltd"
                  required
                  data-testid="input-company-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-address">
                  Company Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="company-address"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  placeholder="Enter complete address with city, state, and pincode"
                  rows={3}
                  required
                  data-testid="input-company-address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-gst">GST Number (Optional)</Label>
                <Input
                  id="company-gst"
                  value={formData.companyGst}
                  onChange={(e) => setFormData({ ...formData, companyGst: e.target.value.toUpperCase() })}
                  placeholder="22AAAAA0000A1Z5"
                  className="font-mono uppercase"
                  data-testid="input-company-gst"
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Logo</CardTitle>
              <CardDescription>
                Upload your company logo (PNG or JPG, max 2MB). Logo will appear on top-left of payslips
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 border-2 border-dashed border-border rounded-md flex items-center justify-center bg-muted/30">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Company logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleLogoChange}
                    data-testid="input-logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    disabled={uploadLogoMutation.isPending}
                    data-testid="button-upload-logo"
                  >
                    {uploadLogoMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.logoUrl ? "Change Logo" : "Upload Logo"}
                      </>
                    )}
                  </Button>
                  {logoFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {logoFile.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signature */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authorized Signature</CardTitle>
              <CardDescription>
                Upload signature image (PNG or JPG, max 1MB). Signature will appear at the bottom of payslips
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-48 h-24 border-2 border-dashed border-border rounded-md flex items-center justify-center bg-muted/30">
                  {formData.signatureUrl ? (
                    <img
                      src={formData.signatureUrl}
                      alt="Signature"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <FileSignature className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    id="signature-upload"
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleSignatureChange}
                    data-testid="input-signature-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("signature-upload")?.click()}
                    disabled={uploadSignatureMutation.isPending}
                    data-testid="button-upload-signature"
                  >
                    {uploadSignatureMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.signatureUrl ? "Change Signature" : "Upload Signature"}
                      </>
                    )}
                  </Button>
                  {signatureFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {signatureFile.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateSettingsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
