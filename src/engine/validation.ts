import { z } from 'zod/v4';

export const grossIncomeSchema = z.object({
  basic: z.number().nonnegative(),
  housing: z.number().nonnegative(),
  transport: z.number().nonnegative(),
  utility: z.number().nonnegative(),
  wardrobe: z.number().nonnegative(),
  lunch: z.number().nonnegative(),
  bonus: z.number().nonnegative(),
  thirteenthMonth: z.number().nonnegative(),
  commission: z.number().nonnegative(),
  otherAllowances: z.number().nonnegative(),
});

export const preTaxDeductionsSchema = z.object({
  nhfPercentage: z.number().min(0).max(100),
  nhis: z.number().nonnegative(),
  pensionPercentage: z.number().min(0).max(100),
  lifeAssurance: z.number().nonnegative(),
});

export const rentInfoSchema = z.object({
  annualRentPaid: z.number().nonnegative(),
  hasRentReceipt: z.boolean(),
});

export const payeInputSchema = z.object({
  grossIncome: grossIncomeSchema,
  deductions: preTaxDeductionsSchema,
  rent: rentInfoSchema,
});

export const employeeRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  grossIncome: grossIncomeSchema,
  deductions: preTaxDeductionsSchema,
  rent: rentInfoSchema,
  joinDate: z.string().optional(),
  exitDate: z.string().optional(),
  isMidYear: z.boolean(),
});

export const batchUploadSchema = z.array(employeeRecordSchema);

export type ValidatedPayeInput = z.infer<typeof payeInputSchema>;
export type ValidatedEmployeeRecord = z.infer<typeof employeeRecordSchema>;
