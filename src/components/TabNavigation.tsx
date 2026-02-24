"use client";

export type TabId = "token" | "network" | "developer" | "tvl";

interface TabNavigationProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; disabled?: boolean }[] = [
  { id: "developer", label: "Noir" },
  { id: "token", label: "Token" },
  { id: "network", label: "Network", disabled: true },
  { id: "tvl", label: "TVL", disabled: true },
];

export default function TabNavigation({ active, onChange }: TabNavigationProps) {
  return (
    <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onChange(tab.id)}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            tab.disabled
              ? "text-text-secondary/40 cursor-default"
              : active === tab.id
                ? "bg-surface-elevated text-white"
                : "text-text-secondary hover:text-white"
          }`}
        >
          {tab.label}
          {tab.disabled && <span className="ml-1.5 text-[10px] opacity-60">Soon</span>}
        </button>
      ))}
    </div>
  );
}
