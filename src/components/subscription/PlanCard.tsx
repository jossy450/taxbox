import type { Plan } from '../../context/SubscriptionContext';
import { useSubscription } from '../../context/SubscriptionContext';

interface PlanCardProps {
  plan: Plan;
}

export default function PlanCard({ plan }: PlanCardProps) {
  const { currentSubscription, subscribe } = useSubscription();

  const isCurrent = currentSubscription?.tier === plan.id && currentSubscription?.status === 'active';
  const isDowngrade = currentSubscription && plan.id === 'free' && currentSubscription.tier !== 'free';

  return (
    <div className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${
      plan.highlighted ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200 shadow-sm'
    }`}>
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-semibold">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
        <p className="text-3xl font-bold text-gray-900 mt-4">
          {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
          {plan.price > 0 && <span className="text-base font-normal text-gray-500">/yr</span>}
        </p>
      </div>

      <ul className="space-y-3 flex-1 mb-6">
        {plan.features.map((f, i) => (
          <li key={i} className={`flex items-center gap-3 text-sm ${f.included ? 'text-gray-700' : 'text-gray-400'}`}>
            <span className={`text-lg ${f.included ? '' : 'opacity-30'}`}>
              {f.included ? '✓' : '—'}
            </span>
            {f.name}
          </li>
        ))}
      </ul>

      <button
        onClick={() => subscribe(plan.id)}
        disabled={!!(isCurrent || isDowngrade)}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
          isCurrent
            ? 'bg-gray-100 text-gray-400 cursor-default'
            : plan.highlighted
              ? 'bg-blue-900 text-white hover:bg-blue-800'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {isCurrent ? 'Current Plan' : isDowngrade ? 'Contact Support' : 'Subscribe'}
      </button>
    </div>
  );
}
