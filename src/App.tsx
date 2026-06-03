import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layouts/AppLayout';
import DashboardPage from './components/dashboard/DashboardPage';
import CalculatorPage from './pages/CalculatorPage';
import EmployeeCrud from './components/crud/EmployeeCrud';
import TaxRecordCrud from './components/crud/TaxRecordCrud';
import AuditChecklistCrud from './components/crud/AuditChecklistCrud';
import ExpatriateCrud from './components/crud/ExpatriateCrud';
import StaffCostAnalysisCrud from './components/crud/StaffCostAnalysisCrud';
import WhtScheduleCrud from './components/crud/WhtScheduleCrud';
import PayeRemittanceCrud from './components/crud/PayeRemittanceCrud';
import DirectAssessmentCrud from './components/crud/DirectAssessmentCrud';
import BusinessPremisesCrud from './components/crud/BusinessPremisesCrud';
import DevelopmentLevyCrud from './components/crud/DevelopmentLevyCrud';
import PaymentScheduleCrud from './components/crud/PaymentScheduleCrud';
import SubscriptionPage from './components/subscription/SubscriptionPage';
import DisclaimerPage from './components/legal/DisclaimerPage';
import CookiesPage from './components/legal/CookiesPage';
import PrivacyPage from './components/legal/PrivacyPage';
import FeedbackPage from './components/legal/FeedbackPage';
import CookieConsentBanner from './components/legal/CookieConsentBanner';
import PublicLegalLayout from './components/layouts/PublicLegalLayout';
import ChatBotAdmin from './components/chatbot/ChatBotAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route element={<PublicLegalLayout />}>
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Route>

            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="calculator" element={<CalculatorPage />} />
              <Route path="employees" element={
                <ProtectedRoute roles={['admin', 'corporate']}>
                  <EmployeeCrud />
                </ProtectedRoute>
              } />
              <Route path="tax-records" element={
                <ProtectedRoute roles={['admin', 'corporate', 'consultant']}>
                  <TaxRecordCrud />
                </ProtectedRoute>
              } />
              <Route path="audit-checklist" element={
                <ProtectedRoute roles={['admin', 'corporate', 'consultant']}>
                  <AuditChecklistCrud />
                </ProtectedRoute>
              } />
              <Route path="expatriates" element={
                <ProtectedRoute roles={['admin', 'corporate']}>
                  <ExpatriateCrud />
                </ProtectedRoute>
              } />
              <Route path="staff-cost" element={
                <ProtectedRoute roles={['admin', 'corporate']}>
                  <StaffCostAnalysisCrud />
                </ProtectedRoute>
              } />
              <Route path="wht-schedule" element={
                <ProtectedRoute roles={['admin', 'corporate', 'consultant']}>
                  <WhtScheduleCrud />
                </ProtectedRoute>
              } />
              <Route path="paye-remittance" element={
                <ProtectedRoute roles={['admin', 'corporate']}>
                  <PayeRemittanceCrud />
                </ProtectedRoute>
              } />
              <Route path="direct-assessment" element={
                <ProtectedRoute roles={['admin', 'corporate', 'consultant']}>
                  <DirectAssessmentCrud />
                </ProtectedRoute>
              } />
              <Route path="business-premises" element={
                <ProtectedRoute roles={['admin', 'corporate']}>
                  <BusinessPremisesCrud />
                </ProtectedRoute>
              } />
              <Route path="development-levy" element={
                <ProtectedRoute roles={['admin', 'corporate']}>
                  <DevelopmentLevyCrud />
                </ProtectedRoute>
              } />
              <Route path="payments" element={
                <ProtectedRoute roles={['admin', 'corporate', 'consultant']}>
                  <PaymentScheduleCrud />
                </ProtectedRoute>
              } />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="disclaimer" element={<DisclaimerPage />} />
              <Route path="cookies" element={<CookiesPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="chatbot" element={
                <ProtectedRoute roles={['admin']}>
                  <ChatBotAdmin />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <CookieConsentBanner />
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
