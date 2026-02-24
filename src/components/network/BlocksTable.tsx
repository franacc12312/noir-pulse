"use client";

import type { NetworkData } from "@/lib/types";
import { formatNumber } from "@/lib/format";

interface BlocksTableProps {
  data: NetworkData;
}

export default function BlocksTable({ data }: BlocksTableProps) {
  // Generate a list of recent blocks based on current block height
  const recentBlocks = Array.from({ length: Math.min(10, data.blockHeight) }, (_, i) => {
    const blockNum = data.blockHeight - i;
    const isProven = blockNum <= data.provenBlockHeight;
    return { number: blockNum, isProven };
  });

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-text-secondary mb-4">
        Recent Blocks
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-text-secondary font-medium">Block</th>
              <th className="text-right py-2 text-text-secondary font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBlocks.map((block) => (
              <tr key={block.number} className="border-b border-border last:border-0">
                <td className="py-2.5 font-mono text-white">
                  #{formatNumber(block.number)}
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      block.isProven ? "text-accent-green" : "text-accent-orange"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        block.isProven ? "bg-accent-green" : "bg-accent-orange"
                      }`}
                    />
                    {block.isProven ? "Proven" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
