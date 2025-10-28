import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Company Settings Table
export const companySettings = pgTable("company_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  companyAddress: text("company_address").notNull(),
  companyGst: text("company_gst"),
  logoUrl: text("logo_url"),
  signatureUrl: text("signature_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Employees Table
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeNo: text("employee_no").notNull().unique(),
  name: text("name").notNull(),
  joiningDate: text("joining_date").notNull(),
  designation: text("designation").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  bankName: text("bank_name").notNull(),
  bankAccountNo: text("bank_account_no").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  panNumber: text("pan_number").notNull(),
  pfNumber: text("pf_number"),
  pfUan: text("pf_uan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payslips Table - for tracking generated payslips
export const payslips = pgTable("payslips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  payslipNumber: text("payslip_number").notNull(),
  payPeriod: text("pay_period").notNull(), // "Jan 2025"
  payDate: text("pay_date").notNull(),
  effectiveWorkDays: integer("effective_work_days").notNull().default(31),
  lop: integer("lop").notNull().default(0),
  elAvailed: integer("el_availed").notNull().default(0),
  
  // Earnings
  basicFull: decimal("basic_full", { precision: 10, scale: 2 }).notNull(),
  basicActual: decimal("basic_actual", { precision: 10, scale: 2 }).notNull(),
  hraFull: decimal("hra_full", { precision: 10, scale: 2 }).notNull(),
  hraActual: decimal("hra_actual", { precision: 10, scale: 2 }).notNull(),
  conveyanceAllowanceFull: decimal("conveyance_allowance_full", { precision: 10, scale: 2 }),
  conveyanceAllowanceActual: decimal("conveyance_allowance_actual", { precision: 10, scale: 2 }),
  otherAllowanceFull: decimal("other_allowance_full", { precision: 10, scale: 2 }),
  otherAllowanceActual: decimal("other_allowance_actual", { precision: 10, scale: 2 }),
  specialAllowanceFull: decimal("special_allowance_full", { precision: 10, scale: 2 }),
  specialAllowanceActual: decimal("special_allowance_actual", { precision: 10, scale: 2 }),
  bounsIncentiveFull: decimal("bouns_incentive_full", { precision: 10, scale: 2 }),
  bounsIncentiveActual: decimal("bouns_incentive_actual", { precision: 10, scale: 2 }),
  
  // Deductions
  pfActual: decimal("pf_actual", { precision: 10, scale: 2 }),
  profTaxActual: decimal("prof_tax_actual", { precision: 10, scale: 2 }),
  
  // Calculated totals
  totalEarningsFull: decimal("total_earnings_full", { precision: 10, scale: 2 }).notNull(),
  totalEarningsActual: decimal("total_earnings_actual", { precision: 10, scale: 2 }).notNull(),
  totalDeductionsActual: decimal("total_deductions_actual", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  employerPf: decimal("employer_pf", { precision: 10, scale: 2 }),
  
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod Schemas
export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  updatedAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertPayslipSchema = createInsertSchema(payslips).omit({
  id: true,
  createdAt: true,
  pdfUrl: true,
}).extend({
  // Allow decimal numbers as strings or numbers
  basicFull: z.union([z.string(), z.number()]).transform(val => String(val)),
  basicActual: z.union([z.string(), z.number()]).transform(val => String(val)),
  hraFull: z.union([z.string(), z.number()]).transform(val => String(val)),
  hraActual: z.union([z.string(), z.number()]).transform(val => String(val)),
  totalEarningsFull: z.union([z.string(), z.number()]).transform(val => String(val)),
  totalEarningsActual: z.union([z.string(), z.number()]).transform(val => String(val)),
  totalDeductionsActual: z.union([z.string(), z.number()]).transform(val => String(val)),
  netPay: z.union([z.string(), z.number()]).transform(val => String(val)),
});

// TypeScript Types
export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Payslip = typeof payslips.$inferSelect;
export type InsertPayslip = z.infer<typeof insertPayslipSchema>;

// CSV Bulk Upload Types
export interface CSVRowMapping {
  employeeNo?: string;
  name?: string;
  joiningDate?: string;
  designation?: string;
  department?: string;
  location?: string;
  bankName?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  panNumber?: string;
  pfNumber?: string;
  pfUan?: string;
  payPeriod?: string;
  payDate?: string;
  effectiveWorkDays?: number;
  lop?: number;
  elAvailed?: number;
  basicFull?: string;
  basicActual?: string;
  hraFull?: string;
  hraActual?: string;
  conveyanceAllowanceFull?: string;
  conveyanceAllowanceActual?: string;
  otherAllowanceFull?: string;
  otherAllowanceActual?: string;
  specialAllowanceFull?: string;
  specialAllowanceActual?: string;
  bounsIncentiveFull?: string;
  bounsIncentiveActual?: string;
  pfActual?: string;
  profTaxActual?: string;
  employerPf?: string;
}

export interface BulkUploadValidationError {
  row: number;
  field: string;
  message: string;
}
