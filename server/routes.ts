import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePayslipPDF } from "./pdf-generator";
import { insertEmployeeSchema, insertCompanySettingsSchema, insertPayslipSchema } from "@shared/schema";
import express from "express";
import multer from "multer";
import Papa from "papaparse";
import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error as Error, uploadDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());

  // Employee endpoints
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      
      // Check if employee number already exists
      const existing = await storage.getEmployeeByNo(validatedData.employeeNo);
      if (existing) {
        return res.status(400).json({ error: "Employee number already exists" });
      }

      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error: any) {
      console.error("Error creating employee:", error);
      res.status(400).json({ error: error.message || "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const existing = await storage.getEmployee(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const employee = await storage.updateEmployee(req.params.id, req.body);
      res.json(employee);
    } catch (error: any) {
      console.error("Error updating employee:", error);
      res.status(400).json({ error: error.message || "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const existing = await storage.getEmployee(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Employee not found" });
      }

      await storage.deleteEmployee(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Company settings endpoints
  app.get("/api/company-settings", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings || null);
    } catch (error) {
      console.error("Error fetching company settings:", error);
      res.status(500).json({ error: "Failed to fetch company settings" });
    }
  });

  app.put("/api/company-settings", async (req, res) => {
    try {
      const validatedData = insertCompanySettingsSchema.parse(req.body);
      const settings = await storage.updateCompanySettings(validatedData);
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating company settings:", error);
      res.status(400).json({ error: error.message || "Failed to update company settings" });
    }
  });

  // File upload endpoints
  app.post("/api/upload/logo", upload.single("logo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const logoUrl = `/uploads/${req.file.filename}`;
      res.json({ url: logoUrl });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ error: "Failed to upload logo" });
    }
  });

  app.post("/api/upload/signature", upload.single("signature"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const signatureUrl = `/uploads/${req.file.filename}`;
      res.json({ url: signatureUrl });
    } catch (error) {
      console.error("Error uploading signature:", error);
      res.status(500).json({ error: "Failed to upload signature" });
    }
  });

  // CSV upload and parsing
  app.post("/api/upload/csv", upload.single("csv"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = await fs.readFile(req.file.path, "utf-8");
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      res.json({
        data: parsed.data,
        headers: parsed.meta.fields || [],
        rowCount: parsed.data.length,
      });

      // Clean up uploaded file
      await fs.unlink(req.file.path);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      res.status(500).json({ error: "Failed to parse CSV file" });
    }
  });

  // Download CSV template
  app.get("/api/csv-template", (req, res) => {
    const template = `employeeNo,name,joiningDate,designation,department,location,bankName,bankAccountNo,ifscCode,panNumber,pfNumber,pfUan,payPeriod,payDate,effectiveWorkDays,lop,elAvailed,basicFull,basicActual,hraFull,hraActual,conveyanceAllowanceFull,conveyanceAllowanceActual,otherAllowanceFull,otherAllowanceActual,specialAllowanceFull,specialAllowanceActual,bounsIncentiveFull,bounsIncentiveActual,pfActual,profTaxActual,employerPf
EMP001,John Doe,01 Jan 2020,Software Engineer,Engineering,Bangalore,State Bank of India,1234567890,SBIN0001234,ABCDE1234F,PF12345678,123456789012,Jan 2025,31/01/2025,31,0,0,40000,40000,15000,15000,3000,3000,3000,3000,10000,10000,5000,5000,7250,200,7250
EMP002,Jane Smith,15 Mar 2021,Senior Developer,Engineering,Mumbai,HDFC Bank,9876543210,HDFC0001234,XYZAB5678C,PF87654321,987654321098,Jan 2025,31/01/2025,31,0,0,50000,50000,20000,20000,4000,4000,4000,4000,12000,12000,6000,6000,9000,200,9000`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=payslip-template.csv");
    res.send(template);
  });

  // Single payslip generation
  app.post("/api/payslips/generate", async (req, res) => {
    try {
      const { employeeId, payslipData, format = "A4" } = req.body;

      // Get employee
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Get company settings
      const companySettings = await storage.getCompanySettings();

      // Validate payslip data
      const validatedPayslip = insertPayslipSchema.parse({
        ...payslipData,
        employeeId,
      });

      // Generate PDF
      const pdfBuffer = await generatePayslipPDF(
        { employee, payslip: validatedPayslip, companySettings },
        format
      );

      // Save payslip record
      const payslip = await storage.createPayslip(validatedPayslip);

      // Return PDF as download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=payslip-${employee.employeeNo}-${payslipData.payPeriod}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("Error generating payslip:", error);
      res.status(500).json({ error: error.message || "Failed to generate payslip" });
    }
  });

  // Bulk payslip generation
  app.post("/api/payslips/bulk-generate", async (req, res) => {
    try {
      const { csvData, format = "A4" } = req.body;

      if (!Array.isArray(csvData) || csvData.length === 0) {
        return res.status(400).json({ error: "No CSV data provided" });
      }

      const companySettings = await storage.getCompanySettings();
      const zip = new JSZip();
      const errors: any[] = [];
      let successCount = 0;

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        try {
          // Find or create employee
          let employee = await storage.getEmployeeByNo(row.employeeNo);
          
          if (!employee) {
            // Create new employee from CSV data
            const employeeData = {
              employeeNo: row.employeeNo,
              name: row.name,
              joiningDate: row.joiningDate,
              designation: row.designation,
              department: row.department,
              location: row.location,
              bankName: row.bankName,
              bankAccountNo: row.bankAccountNo,
              ifscCode: row.ifscCode,
              panNumber: row.panNumber,
              pfNumber: row.pfNumber || "",
              pfUan: row.pfUan || "",
            };
            employee = await storage.createEmployee(employeeData);
          }

          // Calculate totals
          const totalEarningsFull = 
            parseFloat(row.basicFull || "0") +
            parseFloat(row.hraFull || "0") +
            parseFloat(row.conveyanceAllowanceFull || "0") +
            parseFloat(row.otherAllowanceFull || "0") +
            parseFloat(row.specialAllowanceFull || "0") +
            parseFloat(row.bounsIncentiveFull || "0");

          const totalEarningsActual =
            parseFloat(row.basicActual || "0") +
            parseFloat(row.hraActual || "0") +
            parseFloat(row.conveyanceAllowanceActual || "0") +
            parseFloat(row.otherAllowanceActual || "0") +
            parseFloat(row.specialAllowanceActual || "0") +
            parseFloat(row.bounsIncentiveActual || "0");

          const totalDeductions =
            parseFloat(row.pfActual || "0") +
            parseFloat(row.profTaxActual || "0");

          const netPay = totalEarningsActual - totalDeductions;

          // Create payslip data
          const payslipData = {
            employeeId: employee.id,
            payslipNumber: `PSL-${employee.employeeNo}-${row.payPeriod}`,
            payPeriod: row.payPeriod,
            payDate: row.payDate,
            effectiveWorkDays: parseInt(row.effectiveWorkDays || "31"),
            lop: parseInt(row.lop || "0"),
            elAvailed: parseInt(row.elAvailed || "0"),
            basicFull: row.basicFull || "0",
            basicActual: row.basicActual || "0",
            hraFull: row.hraFull || "0",
            hraActual: row.hraActual || "0",
            conveyanceAllowanceFull: row.conveyanceAllowanceFull,
            conveyanceAllowanceActual: row.conveyanceAllowanceActual,
            otherAllowanceFull: row.otherAllowanceFull,
            otherAllowanceActual: row.otherAllowanceActual,
            specialAllowanceFull: row.specialAllowanceFull,
            specialAllowanceActual: row.specialAllowanceActual,
            bounsIncentiveFull: row.bounsIncentiveFull,
            bounsIncentiveActual: row.bounsIncentiveActual,
            pfActual: row.pfActual,
            profTaxActual: row.profTaxActual,
            totalEarningsFull: totalEarningsFull.toString(),
            totalEarningsActual: totalEarningsActual.toString(),
            totalDeductionsActual: totalDeductions.toString(),
            netPay: netPay.toString(),
            employerPf: row.employerPf,
          };

          // Generate PDF
          const pdfBuffer = await generatePayslipPDF(
            { employee, payslip: payslipData, companySettings },
            format
          );

          // Add to ZIP
          const filename = `payslip-${employee.employeeNo}-${row.payPeriod}.pdf`;
          zip.file(filename, pdfBuffer);

          // Save payslip record
          await storage.createPayslip(payslipData);
          
          successCount++;
        } catch (error: any) {
          errors.push({
            row: i + 1,
            employeeNo: row.employeeNo,
            error: error.message,
          });
        }
      }

      // Generate ZIP file
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      // Return ZIP with summary
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename=payslips-bulk-${Date.now()}.zip`);
      res.setHeader("X-Success-Count", successCount.toString());
      res.setHeader("X-Error-Count", errors.length.toString());
      res.setHeader("X-Errors", JSON.stringify(errors));
      res.send(zipBuffer);
    } catch (error: any) {
      console.error("Error generating bulk payslips:", error);
      res.status(500).json({ error: error.message || "Failed to generate bulk payslips" });
    }
  });

  // Payslip listing
  app.get("/api/payslips", async (req, res) => {
    try {
      const payslips = await storage.getPayslips();
      res.json(payslips);
    } catch (error) {
      console.error("Error fetching payslips:", error);
      res.status(500).json({ error: "Failed to fetch payslips" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  const httpServer = createServer(app);
  return httpServer;
}
