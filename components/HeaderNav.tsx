// components/HeaderNav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

type CurrentUser = {
  id: string;
  email?: string | null;
};

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`text-sm ${
        active
          ? "text-cyan-600 dark:text-cyan-300"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export default function HeaderNav() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;

      if (u) {
        setUser({ id: u.id, email: u.email ?? null });

        // Sepet sayısı
        const { count } = await supabase
          .from("cart_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", u.id);

        setCartCount(count ?? 0);

        // Admin mi?
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", u.id)
          .maybeSingle();

        setIsAdmin(!!profileData?.is_admin);
      } else {
        setUser(null);
        setCartCount(0);
        setIsAdmin(false);
      }
    };

    loadUser();
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push("/");
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          {/* Sol logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="Senin Pazarın" className="h-8 w-auto" />
          </Link>

          {/* Orta menü */}
          <nav className="hidden items-center gap-4 md:flex">
            <NavLink href="/explore" label="Keşfet" />
            <NavLink href="/favorites" label="Favorilerim" />
            <NavLink href="/orders" label="Siparişlerim" />
            {isAdmin && <NavLink href="/admin/messages" label="Yönetim" />}
          </nav>

          {/* Sağ taraf */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
              title="Sepetim"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-[5px] text-[10px] font-semibold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/messages"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300 sm:inline-flex"
              title="Mesajlar"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </Link>

            <Link
              href="/favorites"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:inline-flex"
              title="Favorilerim"
            >
              <HeartIcon className="h-5 w-5" />
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="hidden text-xs text-slate-600 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white md:inline"
                >
                  Hesabım
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                >
                  Giriş yap
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-900 dark:text-slate-950"
                >
                  Kayıt ol
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobil alt nav */}
      <div className="flex justify-around border-t border-slate-200 bg-white py-2 text-[11px] text-slate-600 md:hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <Link href="/explore">Keşfet</Link>
        <Link href="/favorites">Favoriler</Link>
        <Link href="/cart">Sepet</Link>
        <Link href="/profile">Profil</Link>
        {isAdmin && <Link href="/admin/messages">Yönetim</Link>}
      </div>
    </>
  );
}
