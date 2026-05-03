"use client";
import SufiCard from "@/components/ui/SufiCard";
import SufiButton from "@/components/ui/SufiButton";

const tiers = [
  { name: "Basic", price: "Free", boost: "1×", features: ["Listed in discovery", "Basic analytics", "Up to 5 tables"] },
  { name: "Standard", price: "₹999/mo", boost: "1.5×", features: ["Everything in Basic", "Promotion campaigns", "Up to 20 tables", "Priority support"] },
  { name: "Premium", price: "₹2,499/mo", boost: "2×", features: ["Everything in Standard", "AI demand forecasting", "Unlimited tables", "Dedicated account manager"] },
  { name: "Elite", price: "₹4,999/mo", boost: "3×", features: ["Everything in Premium", "White-label dashboard", "Multi-location chain tools", "Custom integrations"] },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Billing & Subscription</h2>
        <p className="text-sm text-gray-500 mt-1">
          Higher tiers boost your restaurant's ranking in discovery and search results.
        </p>
      </div>

      {/* Current plan */}
      <SufiCard glow>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current plan</p>
            <p className="font-semibold text-lg">Standard</p>
            <p className="text-sm text-gray-400 mt-0.5">₹999 / month · Next billing 01 Jun 2026</p>
          </div>
          <SufiButton variant="ghost">Manage</SufiButton>
        </div>
      </SufiCard>

      {/* Tier comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <SufiCard key={tier.name} className={tier.name === "Standard" ? "border-accent/30" : ""}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold">{tier.name}</p>
              {tier.name === "Standard" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent">Current</span>
              )}
            </div>
            <p className="text-xl font-bold mb-1">{tier.price}</p>
            <p className="text-xs text-gray-500 mb-4">Ranking boost: {tier.boost}</p>
            <ul className="flex flex-col gap-1.5 mb-5">
              {tier.features.map((f) => (
                <li key={f} className="text-xs text-gray-400 flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            {tier.name !== "Standard" && (
              <SufiButton variant="ghost" className="w-full text-xs">
                {tier.name === "Basic" ? "Downgrade" : "Upgrade"}
              </SufiButton>
            )}
          </SufiCard>
        ))}
      </div>
    </div>
  );
}
