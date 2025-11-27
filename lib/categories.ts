// lib/categories.ts

export type CategoryItem = {
  key: string;
  label: string;
};

export type CategoryGroup = {
  key: string;
  label: string; // Ana kategori adı
  items: CategoryItem[]; // Alt kategoriler
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    key: "elektronik",
    label: "Elektronik",
    items: [
      { key: "telefon-tablet", label: "Telefon & Tablet" },
      { key: "bilgisayar-laptop", label: "Bilgisayar & Laptop" },
      { key: "tv-ses-sistemleri", label: "TV & Ses Sistemleri" },
      { key: "kulaklik-aksesuar", label: "Kulaklık & Aksesuar" },
      { key: "foto-kamera", label: "Foto & Kamera" },
      { key: "giyilebilir-teknoloji", label: "Akıllı Saat & Bileklik" },
    ],
  },
  {
    key: "oyun-konsol",
    label: "Oyun & Konsol",
    items: [
      { key: "oyun-konsol", label: "Oyun Konsolu" },
      { key: "oyunlar", label: "Oyunlar (PC / Konsol)" },
      { key: "oyun-aksesuarlari", label: "Oyun Aksesuarları" },
    ],
  },
  {
    key: "ev-yasam",
    label: "Ev & Yaşam",
    items: [
      { key: "mobilya", label: "Mobilya" },
      { key: "dekorasyon", label: "Dekorasyon" },
      { key: "beyaz-esya", label: "Beyaz Eşya" },
      { key: "mutfak-esyalari", label: "Mutfak Eşyaları" },
      { key: "ev-tekstili", label: "Ev Tekstili" },
    ],
  },
  {
    key: "giyim",
    label: "Giyim & Aksesuar",
    items: [
      { key: "kadin-giyim", label: "Kadın Giyim" },
      { key: "erkek-giyim", label: "Erkek Giyim" },
      { key: "ayakkabi", label: "Ayakkabı" },
      { key: "canta-aksesuar", label: "Çanta & Aksesuar" },
      { key: "spor-giyim", label: "Spor & Outdoor Giyim" },
    ],
  },
  {
    key: "kitap-hobi",
    label: "Kitap & Hobi",
    items: [
      { key: "kitap", label: "Kitap" },
      { key: "dergi", label: "Dergi & Çizgi Roman" },
      { key: "enstruman", label: "Müzik Aletleri" },
      { key: "hobi-urunleri", label: "Hobi & El İşi" },
      { key: "koleksiyon", label: "Koleksiyon Ürünleri" },
    ],
  },
  {
    key: "spor-outdoor",
    label: "Spor & Outdoor",
    items: [
      { key: "fitness", label: "Fitness & Spor" },
      { key: "kamp", label: "Kamp & Outdoor" },
      { key: "bisiklet", label: "Bisiklet & Scooter" },
      { key: "diger-spor", label: "Diğer Spor Ürünleri" },
    ],
  },
  {
    key: "cocuk",
    label: "Bebek & Çocuk",
    items: [
      { key: "bebek-arabasi", label: "Bebek Arabası & Oto Koltuğu" },
      { key: "cocuk-giyim", label: "Çocuk Giyimi" },
      { key: "oyuncak", label: "Oyuncak" },
      { key: "bebek-bakim", label: "Bebek Bakım Ürünleri" },
    ],
  },
  {
    key: "diger",
    label: "Diğer",
    items: [{ key: "diger-urunler", label: "Diğer Ürünler" }],
  },
];

// Keşfet ve filtrelerde kullanmak için düz liste:
export const ALL_CATEGORY_LABELS: string[] = CATEGORY_GROUPS.flatMap((g) =>
  g.items.map((i) => i.label)
);
