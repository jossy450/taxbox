import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import type { Subscription, SubscriptionTier, SubscriptionStatus } from '../types/auth';

interface PlanFeature {
  name: string;
  included: boolean;
}

export interface Plan {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: 'Free',
    description: 'For individual taxpayers',
    features: [
      { name: 'Basic PAYE Calculator', included: true },
      { name: 'Reverse Calculator (Gross-Up)', included: true },
      { name: 'Annual tax estimate', included: true },
      { name: 'RRA Rent Relief computation', included: true },
      { name: 'Batch Payroll Upload', included: false },
      { name: 'CSV/Excel Export', included: false },
      { name: 'Old vs New Regime Comparison', included: false },
      { name: 'Tax Optimisation Sandbox', included: false },
      { name: 'Employee CRUD Management', included: false },
      { name: 'API Access', included: false },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15000,
    priceLabel: '₦15,000/yr',
    description: 'For corporate HR & tax consultants',
    features: [
      { name: 'Basic PAYE Calculator', included: true },
      { name: 'Reverse Calculator (Gross-Up)', included: true },
      { name: 'Annual tax estimate', included: true },
      { name: 'RRA Rent Relief computation', included: true },
      { name: 'Batch Payroll Upload', included: true },
      { name: 'CSV/Excel Export', included: true },
      { name: 'Old vs New Regime Comparison', included: true },
      { name: 'Tax Optimisation Sandbox', included: true },
      { name: 'Employee CRUD Management', included: true },
      { name: 'API Access', included: false },
      { name: 'Priority Support', included: false },
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 75000,
    priceLabel: '₦75,000/yr',
    description: 'For large firms & tax firms',
    features: [
      { name: 'Basic PAYE Calculator', included: true },
      { name: 'Reverse Calculator (Gross-Up)', included: true },
      { name: 'Annual tax estimate', included: true },
      { name: 'RRA Rent Relief computation', included: true },
      { name: 'Batch Payroll Upload', included: true },
      { name: 'CSV/Excel Export', included: true },
      { name: 'Old vs New Regime Comparison', included: true },
      { name: 'Tax Optimisation Sandbox', included: true },
      { name: 'Employee CRUD Management', included: true },
      { name: 'API Access', included: true },
      { name: 'Priority Support', included: true },
    ],
  },
];

const SUBSCRIPTION_KEY = 'taxbox_subscriptions';

interface SubscriptionContextType {
  plans: Plan[];
  currentSubscription: Subscription | null;
  subscribe: (tier: SubscriptionTier) => void;
  cancelSubscription: () => void;
  canAccess: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

const FEATURE_MAP: Record<SubscriptionTier, string[]> = {
  free: ['calculator'],
  pro: ['calculator', 'batch', 'export', 'comparison', 'sandbox', 'crud'],
  enterprise: ['calculator', 'batch', 'export', 'comparison', 'sandbox', 'crud', 'api', 'priority-support'],
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useLocalStorage<Record<string, Subscription>>(SUBSCRIPTION_KEY, {});

  const currentSubscription = user ? subscriptions[user.id] ?? null : null;

  const subscribe = useCallback((tier: SubscriptionTier) => {
    if (!user) return;
    const sub: Subscription = {
      id: crypto.randomUUID(),
      userId: user.id,
      tier,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: tier === 'free' ? undefined : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: tier !== 'free',
    };
    setSubscriptions(prev => ({ ...prev, [user.id]: sub }));
  }, [user, setSubscriptions]);

  const cancelSubscription = useCallback(() => {
    if (!user || !subscriptions[user.id]) return;
    setSubscriptions(prev => ({
      ...prev,
      [user.id]: { ...prev[user.id], status: 'canceled' as SubscriptionStatus },
    }));
  }, [user, subscriptions, setSubscriptions]);

  const canAccess = useCallback((feature: string) => {
    if (!currentSubscription) return feature === 'calculator';
    if (currentSubscription.status !== 'active') return feature === 'calculator';
    return FEATURE_MAP[currentSubscription.tier]?.includes(feature) ?? false;
  }, [currentSubscription]);

  return (
    <SubscriptionContext.Provider value={{ plans: PLANS, currentSubscription, subscribe, cancelSubscription, canAccess }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
