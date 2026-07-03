"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <p className="text-muted text-sm mb-8">System settings and configuration</p>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-hairline p-6 space-y-6">
        <div>
          <h2 className="text-sm font-display font-light text-ink mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-body-strong mb-1">Platform Name</label>
              <input
                type="text"
                defaultValue="Northbridge BPO"
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="block text-sm text-body-strong mb-1">Support Email</label>
              <input
                type="email"
                defaultValue="support@northbridge.com"
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-hairline">
          <h2 className="text-sm font-display font-light text-ink mb-4">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-body">
              <input type="checkbox" defaultChecked className="accent-ink" />
              Email notifications for new requirements
            </label>
            <label className="flex items-center gap-3 text-sm text-body">
              <input type="checkbox" defaultChecked className="accent-ink" />
              Email notifications for new meetings
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-hairline">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
          >
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
