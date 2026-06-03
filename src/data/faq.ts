export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const defaultFaq: FaqEntry[] = [
  {
    id: '1',
    question: 'What is TaxBox NG?',
    answer: 'TaxBox NG is a Lagos PAYE 2026 calculator that helps individuals, HR managers, and tax consultants compute Pay-As-You-Earn tax under the new Nigeria Tax Act (NTA) 2026.',
    category: 'general',
  },
  {
    id: '2',
    question: 'How do I calculate PAYE?',
    answer: 'Navigate to the Tax Calculator from the sidebar. Enter the employee\'s gross income, select the tax year, and the engine will compute chargeable income, PAYE deducted, net pay, and effective tax rate automatically.',
    category: 'calculator',
  },
  {
    id: '3',
    question: 'What tax rates apply under NTA 2026?',
    answer: 'The NTA 2026 uses a progressive tax system with multiple brackets. The first ₦300,000 of chargeable income is tax-free ( Consolidated Relief Allowance ). Higher bands are taxed at increasing rates up to 25%. The exact brackets are displayed in the calculator results.',
    category: 'tax',
  },
  {
    id: '4',
    question: 'What deductions are available?',
    answer: 'Available deductions include: National Housing Fund (NHF), National Health Insurance Scheme (NHIS), Pension (statutory 8% or 10%), Life Assurance Premium, and Rent Relief (up to 20% of rent). These reduce your chargeable income before tax is applied.',
    category: 'tax',
  },
  {
    id: '5',
    question: 'How does the Consolidated Relief Allowance work?',
    answer: 'The Consolidated Relief Allowance (CRA) is the portion of income exempt from tax. Under NTA 2026, it is the higher of ₦300,000 or 1% of gross income. This is applied before calculating tax on the remaining chargeable income.',
    category: 'tax',
  },
  {
    id: '6',
    question: 'Can I process multiple employees at once?',
    answer: 'Yes. HR and Admin users can upload a CSV or Excel file with employee salary data in the Batch Upload section of the Tax Calculator. The system computes PAYE for all employees simultaneously and allows you to download the results.',
    category: 'calculator',
  },
  {
    id: '7',
    question: 'How do I create an account?',
    answer: 'Click "Register" on the login page, fill in your name, email, password, and select your account type (Individual, Corporate HR, Tax Consultant, or Admin). You\'ll be logged in automatically after registration.',
    category: 'account',
  },
  {
    id: '8',
    question: 'I forgot my password. What should I do?',
    answer: 'Click "Forgot password?" on the login page, enter your email, and you\'ll receive a reset token. Use that token on the Reset Password page to set a new password. (In demo mode, the token is returned directly on screen.)',
    category: 'account',
  },
  {
    id: '9',
    question: 'What subscription plans are available?',
    answer: 'We offer Free (basic calculations, limited history), Pro (unlimited calculations, CSV export, priority support), and Enterprise (all features, API access, dedicated support, custom integrations). Visit the Subscription page for pricing.',
    category: 'subscription',
  },
  {
    id: '10',
    question: 'How do I upgrade my subscription?',
    answer: 'Go to the Subscription page from the sidebar, choose your desired plan, and click "Subscribe". In demo mode, subscriptions are processed instantly without payment.',
    category: 'subscription',
  },
  {
    id: '11',
    question: 'Is my data secure?',
    answer: 'Yes. All data is stored locally in your browser\'s storage and our secure SQLite database. Passwords are hashed using bcrypt, and API communications use JWT authentication. We follow GDPR-compliant data handling practices.',
    category: 'general',
  },
  {
    id: '12',
    question: 'What is the difference between chargeable income and gross income?',
    answer: 'Gross income is your total earnings before any deductions. Chargeable income is what remains after subtracting all allowable deductions (NHF, NHIS, Pension, Life Assurance, Rent Relief). PAYE tax is calculated on chargeable income, not gross income.',
    category: 'tax',
  },
  {
    id: '13',
    question: 'Can I export my tax calculations?',
    answer: 'Yes. After computing PAYE, you can download results as an Excel (.xlsx) file. Pro and Enterprise subscribers also get CSV export capabilities and batch export for multiple records.',
    category: 'calculator',
  },
  {
    id: '14',
    question: 'How do I manage employees?',
    answer: 'HR and Admin users can manage employees from the "Employees" section in the sidebar. You can add, edit, deactivate, or delete employee records. Each employee can have salary components and department details.',
    category: 'account',
  },
  {
    id: '15',
    question: 'What is the effective tax rate?',
    answer: 'The effective tax rate is your total PAYE divided by your gross income, expressed as a percentage. It gives you the real tax burden after all deductions and reliefs, as opposed to the marginal rate which only applies to the highest income band.',
    category: 'tax',
  },
  {
    id: '16',
    question: 'Who can use TaxBox NG?',
    answer: 'TaxBox NG serves three main personas: Individual Taxpayers (calculate personal PAYE), Corporate HR/Payroll Managers (manage company payroll), and Tax Consultants (audit and optimisation tools for clients).',
    category: 'general',
  },
  {
    id: '17',
    question: 'How often is the tax data updated?',
    answer: 'Tax rates and regulations are updated in line with the Nigeria Tax Act. The system uses the NTA 2026 rates by default. Check the release notes or contact support for updates on new tax years.',
    category: 'general',
  },
  {
    id: '18',
    question: 'Can I use TaxBox NG on mobile?',
    answer: 'Yes. TaxBox NG is fully responsive and works on desktop, tablet, and mobile devices. The interface adapts to your screen size for a seamless experience.',
    category: 'general',
  },
  {
    id: '19',
    question: 'How do I provide feedback?',
    answer: 'You can submit feedback from the "Feedback" page in the sidebar. All feedback is reviewed by our team to improve the platform.',
    category: 'general',
  },
  {
    id: '20',
    question: 'What is PAYE?',
    answer: 'PAYE (Pay-As-You-Earn) is a system of tax withholding where employers deduct income tax from employees\' salaries and remit it directly to the tax authorities. It ensures tax is collected at source.',
    category: 'tax',
  },
];
