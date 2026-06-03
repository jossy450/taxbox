import { useSubscription } from '../../context/SubscriptionContext';
import PlanCard from './PlanCard';

export default function SubscriptionPage() {
  const { plans, currentSubscription, cancelSubscription } = useSubscription();

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-500 mt-2">
          Unlock the right tools for your role. All plans include the NTA 2026-compliant PAYE engine.
        </p>
      </div>

      {currentSubscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto text-center">
          <p className="text-sm text-blue-800">
            You are currently on the <strong className="uppercase">{currentSubscription.tier}</strong> plan.
            Status: <strong className="capitalize">{currentSubscription.status}</strong>
            {currentSubscription.endDate && (
              <> &middot; Expires {new Date(currentSubscription.endDate).toLocaleDateString()}</>
            )}
          </p>
          {currentSubscription.tier !== 'free' && currentSubscription.status === 'active' && (
            <button onClick={cancelSubscription}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline">
              Cancel Subscription
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-900">Can I switch plans later?</p>
            <p className="mt-1">Yes. You can upgrade at any time. Downgrades take effect at the end of your billing period.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Is my data secure?</p>
            <p className="mt-1">All data is stored locally in your browser. No data is sent to external servers. For enterprise deployments, we offer on-premise hosting.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Do you offer LIRS e-filing integration?</p>
            <p className="mt-1">The Enterprise plan includes API access for integration with LIRS e-filing systems and third-party payroll software.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">What payment methods are accepted?</p>
            <p className="mt-1">We accept bank transfers, card payments (Paystack), and corporate invoicing for Enterprise plans.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
