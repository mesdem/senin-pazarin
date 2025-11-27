// app/yonetim/ayarlar/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SettingsState = {
  site_name: string;
  support_email: string;
  max_images_per_listing: number;
  auto_expire_days: number;
  auto_hide_reports_threshold: number;
  allow_guest_browsing: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  site_name: "Senin Pazarın",
  support_email: "destek@seninpazarin.com",
  max_images_per_listing: 8,
  auto_expire_days: 90,
  auto_hide_reports_threshold: 5,
  allow_guest_browsing: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);
      setErrorMsg(null);

      // platform_settings tablosunda tek satır olduğunu varsayıyoruz (id = 1)
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error(error);
        setErrorMsg(
          "Ayarlar yüklenirken hata oluştu. Muhtemelen 'platform_settings' tablosu henüz oluşturulmadı."
        );
        setLoading(false);
        return;
      }

      if (data) {
        setSettings({
          site_name: data.site_name ?? DEFAULT_SETTINGS.site_name,
          support_email: data.support_email ?? DEFAULT_SETTINGS.support_email,
          max_images_per_listing:
            data.max_images_per_listing ??
            DEFAULT_SETTINGS.max_images_per_listing,
          auto_expire_days:
            data.auto_expire_days ?? DEFAULT_SETTINGS.auto_expire_days,
          auto_hide_reports_threshold:
            data.auto_hide_reports_threshold ??
            DEFAULT_SETTINGS.auto_hide_reports_threshold,
          allow_guest_browsing:
            typeof data.allow_guest_browsing === "boolean"
              ? data.allow_guest_browsing
              : DEFAULT_SETTINGS.allow_guest_browsing,
        });
      }

      setLoading(false);
    };

    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErrorMsg(null);

    const { error } = await supabase.from("platform_settings").upsert(
      {
        id: 1,
        site_name: settings.site_name,
        support_email: settings.support_email,
        max_images_per_listing: settings.max_images_per_listing,
        auto_expire_days: settings.auto_expire_days,
        auto_hide_reports_threshold: settings.auto_hide_reports_threshold,
        allow_guest_browsing: settings.allow_guest_browsing,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error(error);
      setErrorMsg("Ayarlar kaydedilirken bir hata oluştu: " + error.message);
    } else {
      setMsg("Ayarlar başarıyla kaydedildi.");
    }

    setSaving(false);
  }

  function handleNumberChange<K extends keyof SettingsState>(
    key: K,
    value: string
  ) {
    const num = parseInt(value, 10);
    setSettings((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num,
    }));
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ayarlar yükleniyor…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* BAŞLIK */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Platform ayarları
        </h2>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Site adı, ilan limitleri ve moderasyon politikası gibi temel ayarları
          buradan yönetebilirsin. Yapılan değişiklikler tüm kullanıcıları
          etkiler.
        </p>

        {errorMsg && (
          <p className="mt-2 text-[11px] text-red-500 dark:text-red-400">
            {errorMsg}
          </p>
        )}
        {msg && (
          <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
            {msg}
          </p>
        )}
      </section>

      {/* FORM */}
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {/* GENEL AYARLAR */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Genel
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Site adı
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    site_name: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Örn: Senin Pazarın"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Üst menü, başlık ve bazı e-postalarda görünecek platform adı.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Destek e-posta adresi
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    support_email: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="destek@seninpazarin.com"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kullanıcılara gösterilecek resmi destek adresi.
              </p>
            </div>
          </div>
        </div>

        {/* İLAN AYARLARI */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            İlanlar
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Bir ilanda izin verilen maksimum görsel sayısı
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.max_images_per_listing}
                onChange={(e) =>
                  handleNumberChange("max_images_per_listing", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kullanıcılar ilan başına en fazla kaç görsel yükleyebilsin?
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                İlan otomatik pasifleşme süresi (gün)
              </label>
              <input
                type="number"
                min={0}
                max={365}
                value={settings.auto_expire_days}
                onChange={(e) =>
                  handleNumberChange("auto_expire_days", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                0 yaparsan otomatik pasifleşme olmaz. Örn: 90 gün sonra ilan
                otomatik <span className="font-semibold">pasif</span> olsun.
              </p>
            </div>
          </div>
        </div>

        {/* MODERASYON AYARLARI */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Moderasyon & güvenlik
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Otomatik gizleme için minimum şikayet sayısı
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={settings.auto_hide_reports_threshold}
                onChange={(e) =>
                  handleNumberChange(
                    "auto_hide_reports_threshold",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Örn: 5 şikayet alan ilan otomatik olarak geçici süreyle
                gizlensin. (Bunu daha sonra backend tarafında logic ile
                bağlayacağız.)
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Ziyaretçiler giriş yapmadan ilan görebilsin mi?
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    checked={settings.allow_guest_browsing === true}
                    onChange={() =>
                      setSettings((prev) => ({
                        ...prev,
                        allow_guest_browsing: true,
                      }))
                    }
                    className="h-3 w-3"
                  />
                  <span>Görebilsin (önerilen)</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    checked={settings.allow_guest_browsing === false}
                    onChange={() =>
                      setSettings((prev) => ({
                        ...prev,
                        allow_guest_browsing: false,
                      }))
                    }
                    className="h-3 w-3"
                  />
                  <span>Göremesin (zorunlu giriş)</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Bunu ileride middleware ile bağlayıp misafir kullanıcılara
                kısıtlama uygulayabilirsin.
              </p>
            </div>
          </div>
        </div>

        {/* KAYDET BUTONU */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-cyan-300 disabled:opacity-60 dark:text-slate-950"
          >
            {saving ? "Kaydediliyor..." : "Ayarları kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
