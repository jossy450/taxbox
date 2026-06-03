export interface GrossIncome {
  basic: number;
  housing: number;
  transport: number;
  utility: number;
  wardrobe: number;
  lunch: number;
  bonus: number;
  thirteenthMonth: number;
  commission: number;
  otherAllowances: number;
}

export interface PreTaxDeductions {
  nhfPercentage: number;
  nhis: number;
  pensionPercentage: number;
  lifeAssurance: number;
}

export interface RentInfo {
  annualRentPaid: number;
  hasRentReceipt: boolean;
}

export interface PayeInput {
  grossIncome: GrossIncome;
  deductions: PreTaxDeductions;
  rent: RentInfo;
}

export interface TaxBracket {
  label: string;
  from: number;
  to: number;
  rate: number;
  taxableInBand: number;
  taxInBand: number;
}

export interface DeductionBreakdown {
  nhf: number;
  nhis: number;
  pension: number;
  lifeAssurance: number;
  total: number;
}

export interface MonthlyBreakdown {
  grossPay: number;
  totalDeductions: number;
  taxDeducted: number;
  netPay: number;
}

export interface PayeResult {
  grossIncome: number;
  statutoryDeductions: DeductionBreakdown;
  incomeAfterStatutoryDeductions: number;
  rentRelief: number;
  chargeableIncome: number;
  taxBrackets: TaxBracket[];
  totalTax: number;
  effectiveTaxRate: number;
  netIncome: number;
  monthly: MonthlyBreakdown;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  grossIncome: GrossIncome;
  deductions: PreTaxDeductions;
  rent: RentInfo;
  joinDate?: string;
  exitDate?: string;
  isMidYear: boolean;
}

export interface BatchResult {
  employee: EmployeeRecord;
  result: PayeResult;
  errors: string[];
}
