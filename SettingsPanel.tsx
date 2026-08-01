"use client";

import { CloudAccountPanel } from "@/components/CloudAccountPanel";
import { PushNotificationControl } from "@/components/PushNotificationControl";
import { ThemePicker } from "@/components/ThemePicker";
import { useUserSettings, type UserSettings } from "@/lib/useUserSettings";

export function SettingsPanel() {
  const { settings, updateSettings } = useUserSettings();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass-card p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mint">Tema</p>
        <h2 className="mt-2 text-2xl font-black text-white">Renk modu</h2>
        <p className="mt-2 text-sm text-slate-400">Panelin vurgu rengini seç.</p>
        <div className="mt-5">
          <ThemePicker expanded />
        </div>
      </div>

      <div className="glass-card p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mint">Tercihler</p>
        <h2 className="mt-2 text-2xl font-black text-white">Varsayılanlar</h2>
        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm text-slate-300">
            Varsayılan para birimi
            <select
              className="premium-input"
              value={settings.defaultCurrency}
              onChange={(event) => updateSettings({ defaultCurrency: event.target.value as UserSettings["defaultCurrency"] })}
            >
              <option>TRY</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Varsayılan şehir
            <input
              className="premium-input"
              value={settings.defaultCity}
              onChange={(event) => updateSettings({ defaultCity: event.target.value })}
            />
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-line bg-white/5 p-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={settings.denseDashboard}
              onChange={(event) => updateSettings({ denseDashboard: event.target.checked })}
            />
            Daha kompakt ana panel
          </label>
        </div>
      </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CloudAccountPanel />
        <PushNotificationControl />
      </div>
    </div>
  );
}
