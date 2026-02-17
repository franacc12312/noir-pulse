"use client";

import { useState } from "react";

export default function Methodology() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-elevated transition-colors"
      >
        <h3 className="text-sm font-medium text-text-secondary">
          Methodology
        </h3>
        <svg
          className={`w-4 h-4 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-text-secondary space-y-4 border-t border-border pt-4">
          <div>
            <h4 className="text-white font-medium mb-1">
              What is a &ldquo;Noir Repo&rdquo;?
            </h4>
            <p>
              A public GitHub repository where GitHub&apos;s Linguist detects
              Noir as a language. This means the repo contains{" "}
              <code className="text-accent-salmon bg-surface-elevated px-1 py-0.5 rounded text-xs">
                .nr
              </code>{" "}
              files and/or{" "}
              <code className="text-accent-salmon bg-surface-elevated px-1 py-0.5 rounded text-xs">
                Nargo.toml
              </code>
              . Forks are excluded by default.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">
              What is a &ldquo;Noir Commit&rdquo;?
            </h4>
            <p>
              For repos where Noir is the primary language, all commits are
              counted. For monorepos (like aztec-packages), only commits
              touching Noir-specific paths are included. Bot accounts
              (dependabot, renovate, github-actions) are excluded.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">
              Active Developer (weekly)
            </h4>
            <p>
              A unique GitHub username that authored at least one commit in a
              given week to any tracked Noir repository.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Data Source</h4>
            <p>
              All data is sourced from the GitHub REST API. Repos are discovered
              weekly via{" "}
              <code className="text-accent-salmon bg-surface-elevated px-1 py-0.5 rounded text-xs">
                language:Noir
              </code>{" "}
              search. Data is updated weekly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
