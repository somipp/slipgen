import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, Image as ImageIcon, FileSignature } from "lucide-react";

export default function Settings() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoFile(file);
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSignatureFile(file);
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
                placeholder="Hanva Technologies Pvt Ltd"
                data-testid="input-company-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-address">
                Company Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="company-address"
                placeholder="Enter complete address with city, state, and pincode"
                rows={3}
                data-testid="input-company-address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-gst">GST Number (Optional)</Label>
              <Input
                id="company-gst"
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
                {logoFile ? (
                  <img
                    src={URL.createObjectURL(logoFile)}
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
                  variant="outline"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                  data-testid="button-upload-logo"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {logoFile ? "Change Logo" : "Upload Logo"}
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
                {signatureFile ? (
                  <img
                    src={URL.createObjectURL(signatureFile)}
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
                  variant="outline"
                  onClick={() => document.getElementById("signature-upload")?.click()}
                  data-testid="button-upload-signature"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {signatureFile ? "Change Signature" : "Upload Signature"}
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
          <Button size="lg" data-testid="button-save-settings">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
