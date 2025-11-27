// app/profile/page.tsx
"use client";

import SellerRatingSummary from "@/components/SellerRatingSummary";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ListingWithImages } from "@/lib/types";

type CurrentUser = {
  id: string;
  email?: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // profil formu
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [about, setAbout] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // kullanıcının ilanları
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  // ilan filtre tabı: active / sold / inactive / all
  const [statusFilter, setStatusFilter] = useState<
    "active" | "sold" | "inactive" | "all"
  >("active");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg("");

      // 1) Kullanıcıyı al
      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;

      if (!u) {
        setMsg("Profil sayfasını görmek için önce giriş yapmalısın.");
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      const current: CurrentUser = { id: u.id, email: u.email ?? null };
      setUser(current);

      // 2) Profil bilgilerini çek
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username, full_name, city, about, avatar_url")
        .eq("id", u.id)
        .maybeSingle();

      if (!profileError && profileData) {
        const p = profileData as any;
        setUsername(p.username ?? "");
        setFullName(p.full_name ?? "");
        setCity(p.city ?? "");
        setAbout(p.about ?? "");
        setAvatarUrl(p.avatar_url ?? null);
      }

      // 3) Kullanıcının ilanlarını çek (tüm durumlar)
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      if (!listingsError && listingsData) {
        const mapped = (listingsData as any[]).map((row) => ({
          ...row,
          images: row.listing_images as { image_url: string }[] | undefined,
        }));
        setListings(mapped);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMsg("");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: username || null,
      full_name: fullName || null,
      city: city || null,
      about: about || null,
      avatar_url: avatarUrl || null,
    });

    if (error) {
      setMsg("Profil kaydedilirken hata oluştu: " + error.message);
    } else {
      setMsg("Profil bilgilerin kaydedildi.");
    }

    setSaving(false);
  }

  async function handleAvatarChange(e: any) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSaving(true);
    setMsg("");

    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    // 1) Dosyayı Supabase Storage'a yükle
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError || !uploadData) {
      setMsg(
        "Profil fotoğrafı yüklenirken hata oluştu: " + uploadError?.message
      );
      setSaving(false);
      return;
    }

    // 2) Public URL'yi al
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(uploadData.path);

    const url = publicUrlData.publicUrl;
    setAvatarUrl(url);

    // 3) Profili avatar ile güncelle
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      username: username || null,
      full_name: fullName || null,
      city: city || null,
      about: about || null,
      avatar_url: url,
    });

    if (profileError) {
      setMsg("Profil güncellenirken hata oluştu: " + profileError.message);
    } else {
      setMsg("Profil fotoğrafın güncellendi.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Yükleniyor…
      </p>
    );
  }

  if (!user) {
    return (
      <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        {msg || "Giriş yapılmamış."}
      </div>
    );
  }

  const publicProfileUrl = `/u/${user.id}`;
  const displayInitial = (fullName || username || user.email || "SP")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // 🔍 İlan filtreleme
  const filteredListings = listings.filter((item: any) => {
    if (statusFilter === "all") return true;
    return (item.status || "active") === statusFilter;
  });

  const counts = {
    all: listings.length,
    active: listings.filter((x: any) => (x.status || "active") === "active")
      .length,
    sold: listings.filter((x: any) => x.status === "sold").length,
    inactive: listings.filter((x: any) => x.status === "inactive").length,
  };

  return (
    <div className="space-y-6 py-4">
      {/* Kendi satıcı puanın özeti */}
      <SellerRatingSummary sellerId={user.id} />

      {/* Profil bilgileri + avatar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-slate-100 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-slate-700 dark:text-slate-200">
                  {displayInitial}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hesabın
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user.email || "E-posta bilgisi yok"}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Profil bilgilerini ve fotoğrafını aşağıdan düzenleyebilirsin.
              </p>
              <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-1 text-[11px] text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                Profil fotoğrafı yükle
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="text-slate-500 dark:text-slate-400">Profil linkin</p>
            <Link
              href={publicProfileUrl}
              className="break-all text-cyan-600 hover:underline dark:text-cyan-400"
            >
              {publicProfileUrl}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">
                Kullanıcı adı
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder=""
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Diğer kullanıcılar seni bu adla görebilir. Boş bırakabilirsin.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">
                Görünen ad
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder=""
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              Şehir
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Burdur, İstanbul..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              Hakkında
            </label>
            <textarea
              className="min-h-[80px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Kendin hakkında birkaç cümle yazabilirsin (örneğin: genelde kitap ve elektronik ürünler satıyorum)."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          {msg && (
            <p className="text-xs text-slate-600 dark:text-slate-300">{msg}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60 dark:text-slate-950"
          >
            {saving ? "Kaydediliyor..." : "Profili Kaydet"}
          </button>
        </form>
      </section>

      {/* Kullanıcının ilanları + sekmeler */}
      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            İlanların
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 p-1 text-[11px] font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              {(
                [
                  { key: "active", label: "Aktif" },
                  { key: "sold", label: "Satıldı" },
                  { key: "inactive", label: "Pasif" },
                  { key: "all", label: "Tümü" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`rounded-full px-3 py-1 transition ${
                    statusFilter === tab.key
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {tab.label}{" "}
                  <span className="text-[10px] text-slate-400 dark:text-slate-300">
                    ({counts[tab.key as "active" | "sold" | "inactive" | "all"]}
                    )
                  </span>
                </button>
              ))}
            </div>

            <Link
              href="/listings/new"
              className="rounded-xl bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-950"
            >
              + Yeni İlan
            </Link>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bu sekmede gösterilecek ilan yok.{" "}
            {statusFilter === "active" &&
              "Henüz aktif ilanın yok; pasif / satıldı ilanların varsa diğer sekmelere bakabilirsin."}
            {statusFilter === "sold" &&
              "Satıldı olarak işaretlediğin ilanların burada görünecek."}
            {statusFilter === "inactive" &&
              "Pasife aldığın ilanların burada görünecek."}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredListings.map((item: any) => {
              const heroImg = item.images?.[0]?.image_url;
              const status = (item.status || "active") as
                | "active"
                | "sold"
                | "inactive";

              let badgeLabel = "Aktif";
              let badgeClass =
                "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-300";

              if (status === "sold") {
                badgeLabel = "Satıldı";
                badgeClass =
                  "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-300";
              } else if (status === "inactive") {
                badgeLabel = "Pasif";
                badgeClass =
                  "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";
              }

              return (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
                >
                  {heroImg ? (
                    <img
                      src={heroImg}
                      alt={item.title}
                      className="mb-2 h-28 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="mb-2 h-28 w-full rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30" />
                  )}

                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                      {item.title}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${badgeClass}`}
                    >
                      {badgeLabel}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {item.city} • {item.category} • {item.condition}
                  </p>
                  <p className="mt-1 text-sm font-bold text-cyan-700 dark:text-cyan-300">
                    {item.price.toLocaleString("tr-TR")} ₺
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
