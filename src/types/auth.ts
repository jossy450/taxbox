export type UserRole = 'admin' | 'corporate' | 'consultant' | 'individual';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  jobRole: string;
  joinDate: string;
  basicSalary: number;
  housing: number;
  transport: number;
  others: number;
  status: 'active' | 'inactive';
}

export interface TaxRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  companyId: string;
  taxYear: number;
  month: number;
  grossPay: number;
  taxDeducted: number;
  netPay: number;
  chargeableIncome: number;
  effectiveRate: number;
  status: 'computed' | 'submitted' | 'approved';
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalPayeCollected: number;
  totalGrossPayroll: number;
  averageEffectiveRate: number;
  activeUsers: number;
  pendingFiling: number;
}

export interface StaffCostAnalysis {
  id: string;
  companyId: string;
  year: number;
  totalStaffCost: number;
  numberStaff: number;
  salariesWages: number;
  pensionContribution: number;
  otherBenefits: number;
  residentsInLagos: number;
  lagosStaffNumber: number;
  lagosSalariesWages: number;
  lagosPension: number;
  lagosOtherBenefits: number;
}

export interface AuditChecklistItem {
  id: string;
  companyId: string;
  year: number;
  category: 'general' | 'paye' | 'directors' | 'expatriate' | 'wht';
  item: string;
  status: 'available' | 'not_available' | 'na';
  remarks: string;
}

export interface ExpatriateRecord {
  id: string;
  companyId: string;
  year: number;
  staffNumber: string;
  lastName: string;
  firstName: string;
  otherName: string;
  designation: string;
  abcId: string;
  location: string;
  months: number;
  basic: number;
  housing: number;
  transport: number;
  utility: number;
  dressing: number;
  lunch: number;
  leave: number;
  otherAllowances: number;
  oneOffAllowances: number;
  totalPay: number;
  pension: number;
  nhis: number;
  gratuity: number;
  nhf: number;
  lifeAssurance: number;
}

export interface WHTRecord {
  id: string;
  companyId: string;
  year: number;
  vendorName: string;
  vendorType: string;
  grossPayment: number;
  whtRate: number;
  whtAmount: number;
  remitted: boolean;
  remittanceDate: string;
  receiptNumber: string;
}

export interface PAYERemittance {
  id: string;
  companyId: string;
  year: number;
  month: number;
  amount: number;
  receiptNumber: string;
  remittanceDate: string;
  status: 'pending' | 'remitted' | 'verified';
}

export interface DirectAssessment {
  id: string;
  companyId: string;
  year: number;
  grossIncome: number;
  chargeableIncome: number;
  taxComputed: number;
  paid: boolean;
  paymentDate: string;
  receiptNumber: string;
}

export interface BusinessPremise {
  id: string;
  companyId: string;
  year: number;
  address: string;
  lga: string;
  premiseType: string;
  evidenceProvided: boolean;
  amountPaid: number;
  receiptNumber: string;
}

export interface DevelopmentLevy {
  id: string;
  companyId: string;
  year: number;
  staffCount: number;
  amountPerStaff: number;
  totalAmount: number;
  paid: boolean;
  paymentDate: string;
  receiptNumber: string;
}

export interface PaymentSchedule {
  id: string;
  companyId: string;
  year: number;
  paymentDate: string;
  paymentType: 'paye' | 'wht' | 'direct_assessment' | 'development_levy' | 'business_premises';
  amount: number;
  receiptNumber: string;
  remarks: string;
}
