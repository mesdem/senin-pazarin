// lib/categories.ts

export type CategoryItem = {
  id: string;
  label: string;
};

export type CategoryGroup = {
  id: string;
  label: string;
  items: CategoryItem[];
};

/**
 * Kategori grupları:
 * - id: grup kimliği
 * - label: ekranda gözükecek başlık
 * - items: alt kategoriler
 *
 * app/listings/new/page.tsx içinde genelde
 * CATEGORY_GROUPS.map(...) ve group.items.map(...)
 * şeklinde kullanıyoruz.
 */
export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "electronics",
    label: "Elektronik",
    items: [
      { id: "phone_tablet", label: "Telefon & Tablet" },
      { id: "computer", label: "Bilgisayar & Laptop" },
      { id: "console", label: "Oyun Konsolu & Oyunlar" },
      { id: "tv_audio", label: "TV & Ses Sistemleri" },
      { id: "accessories", label: "Aksesuar & Diğer" },
    ],
  },
  {
    id: "home",
    label: "Ev & Yaşam",
    items: [
      { id: "furniture", label: "Mobilya" },
      { id: "kitchen", label: "Mutfak Eşyaları" },
      { id: "decor", label: "Dekorasyon" },
      { id: "lighting", label: "Aydınlatma" },
      { id: "other_home", label: "Diğer Ev Ürünleri" },
    ],
  },
  {
    id: "fashion",
    label: "Giyim & Moda",
    items: [
      { id: "women_clothing", label: "Kadın Giyim" },
      { id: "men_clothing", label: "Erkek Giyim" },
      { id: "shoes", label: "Ayakkabı" },
      { id: "bags", label: "Çanta & Cüzdan" },
      { id: "accessories_fashion", label: "Aksesuar" },
    ],
  },
  {
    id: "hobby",
    label: "Hobi & Eğlence",
    items: [
      { id: "books", label: "Kitap" },
      { id: "board_games", label: "Masa & Kutu Oyunları" },
      { id: "music_instruments", label: "Müzik Aletleri" },
      { id: "collectibles", label: "Koleksiyon Ürünleri" },
      { id: "sports", label: "Spor & Outdoor" },
    ],
  },
  {
    id: "kids",
    label: "Bebek & Çocuk",
    items: [
      { id: "toys", label: "Oyuncaklar" },
      { id: "baby_clothing", label: "Bebek Giyim" },
      { id: "kids_clothing", label: "Çocuk Giyim" },
      { id: "stroller", label: "Bebek Arabası & Eşyaları" },
      { id: "kids_other", label: "Diğer Ürünler" },
    ],
  },
  {
    id: "other",
    label: "Diğer",
    items: [
      { id: "pet", label: "Evcil Hayvan Ürünleri" },
      { id: "auto", label: "Oto Aksesuar" },
      { id: "office", label: "Ofis & Kırtasiye" },
      { id: "services", label: "Hizmet İlanları" },
      { id: "misc", label: "Çeşitli Ürünler" },
    ],
  },
];

/**
 * Düz liste olarak tüm alt kategoriler:
 * Eğer başka yerlerde sadece select için
 * "id / label" lazım olursa buradan kullanabilirsin.
 */
export const CATEGORY_OPTIONS: CategoryItem[] = CATEGORY_GROUPS.flatMap(
  (group) => group.items
);
