export interface CompanyProfile {
  id: string;
  name: string;
  rcNumber: string;
  taxId: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollPeriod {
  id: string;
  companyId: string;
  taxYear: number;
  month: number;
  preparedBy: string;
  approvedBy?: string;
  status: 'draft' | 'submitted' | 'approved';
  totalGrossPay: number;
  totalTaxDeducted: number;
  totalNetPay: number;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRun {
  id: string;
  companyId: string;
  periodId: string;
  employeeId: string;
  employeeName: string;
  grossPay: number;
  nhf: number;
  nhis: number;
  pension: number;
  lifeAssurance: number;
  rentRelief: number;
  chargeableIncome: number;
  taxDeducted: number;
  netPay: number;
  bankName?: string;
  accountNumber?: string;
  createdAt: string;
}

export interface TaxHistoryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  companyId: string;
  taxYear: number;
  payeAmount: number;
  grossIncome: number;
  chargeableIncome: number;
  effectiveRate: number;
  taxBrackets: string;
  createdAt: string;
}

export interface ConsultantClient {
  id: string;
  consultantId: string;
  companyId: string;
  companyName: string;
  engagementType: 'audit' | 'optimization' | 'full-service';
  status: 'active' | 'archived';
  createdAt: string;
}

export const defaultCompanyProfile = (): CompanyProfile => ({
  id: crypto.randomUUID(),
  name: '',
  rcNumber: '',
  taxId: '',
  address: '',
  contactEmail: '',
  contactPhone: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export interface TaxSummary {
  totalEmployees: number;
  totalGrossPay: number;
  totalTaxDeducted: number;
  totalNetPay: number;
  averageEffectiveRate: number;
}
