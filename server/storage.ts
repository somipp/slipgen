// Using javascript_database blueprint - DatabaseStorage implementation
import {
  employees,
  companySettings,
  payslips,
  type Employee,
  type InsertEmployee,
  type CompanySettings,
  type InsertCompanySettings,
  type Payslip,
  type InsertPayslip,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Employee operations
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByNo(employeeNo: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;

  // Company settings operations
  getCompanySettings(): Promise<CompanySettings | undefined>;
  updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;

  // Payslip operations
  getPayslips(): Promise<Payslip[]>;
  getPayslip(id: string): Promise<Payslip | undefined>;
  getPayslipsByEmployee(employeeId: string): Promise<Payslip[]>;
  createPayslip(payslip: InsertPayslip): Promise<Payslip>;
  updatePayslipPdfUrl(id: string, pdfUrl: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByNo(employeeNo: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.employeeNo, employeeNo));
    return employee || undefined;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values(insertEmployee)
      .returning();
    return employee;
  }

  async updateEmployee(id: string, insertEmployee: Partial<InsertEmployee>): Promise<Employee> {
    const [employee] = await db
      .update(employees)
      .set(insertEmployee)
      .where(eq(employees.id, id))
      .returning();
    return employee;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Company settings operations
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const [settings] = await db.select().from(companySettings).limit(1);
    return settings || undefined;
  }

  async updateCompanySettings(insertSettings: InsertCompanySettings): Promise<CompanySettings> {
    const existing = await this.getCompanySettings();
    
    if (existing) {
      const [settings] = await db
        .update(companySettings)
        .set({ ...insertSettings, updatedAt: new Date() })
        .where(eq(companySettings.id, existing.id))
        .returning();
      return settings;
    } else {
      const [settings] = await db
        .insert(companySettings)
        .values(insertSettings)
        .returning();
      return settings;
    }
  }

  // Payslip operations
  async getPayslips(): Promise<Payslip[]> {
    return await db.select().from(payslips).orderBy(desc(payslips.createdAt));
  }

  async getPayslip(id: string): Promise<Payslip | undefined> {
    const [payslip] = await db.select().from(payslips).where(eq(payslips.id, id));
    return payslip || undefined;
  }

  async getPayslipsByEmployee(employeeId: string): Promise<Payslip[]> {
    return await db.select().from(payslips).where(eq(payslips.employeeId, employeeId));
  }

  async createPayslip(insertPayslip: InsertPayslip): Promise<Payslip> {
    const [payslip] = await db
      .insert(payslips)
      .values(insertPayslip)
      .returning();
    return payslip;
  }

  async updatePayslipPdfUrl(id: string, pdfUrl: string): Promise<void> {
    await db
      .update(payslips)
      .set({ pdfUrl })
      .where(eq(payslips.id, id));
  }
}

export const storage = new DatabaseStorage();
