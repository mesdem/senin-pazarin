// lib/categories.ts

export type CategoryItem = {
  id: string;
  key: string; // React key için
  label: string;
};

export type CategoryGroup = {
  id: string;
  key: string; // React key için
  label: string;
  items: CategoryItem[];
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "electronics",
    key: "electronics",
    label: "Elektronik",
    items: [
      { id: "phone_tablet", key: "phone_tablet", label: "Telefon & Tablet" },
      { id: "computer", key: "computer", label: "Bilgisayar & Laptop" },
      { id: "console", key: "console", label: "Oyun Konsolu & Oyunlar" },
      { id: "tv_audio", key: "tv_audio", label: "TV & Ses Sistemleri" },
      { id: "accessories", key: "accessories", label: "Aksesuar & Diğer" },
    ],
  },
  {
    id: "home",
    key: "home",
    label: "Ev & Yaşam",
    items: [
      { id: "furniture", key: "furniture", label: "Mobilya" },
      { id: "kitchen", key: "kitchen", label: "Mutfak Eşyaları" },
      { id: "decor", key: "decor", label: "Dekorasyon" },
      { id: "lighting", key: "lighting", label: "Aydınlatma" },
      { id: "other_home", key: "other_home", label: "Diğer Ev Ürünleri" },
    ],
  },
  {
    id: "fashion",
    key: "fashion",
    label: "Giyim & Moda",
    items: [
      { id: "women_clothing", key: "women_clothing", label: "Kadın Giyim" },
      { id: "men_clothing", key: "men_clothing", label: "Erkek Giyim" },
      { id: "shoes", key: "shoes", label: "Ayakkabı" },
      { id: "bags", key: "bags", label: "Çanta & Cüzdan" },
      {
        id: "accessories_fashion",
        key: "accessories_fashion",
        label: "Aksesuar",
      },
    ],
  },
  {
    id: "hobby",
    key: "hobby",
    label: "Hobi & Eğlence",
    items: [
      { id: "books", key: "books", label: "Kitap" },
      { id: "board_games", key: "board_games", label: "Masa & Kutu Oyunları" },
      {
        id: "music_instruments",
        key: "music_instruments",
        label: "Müzik Aletleri",
      },
      {
        id: "collectibles",
        key: "collectibles",
        label: "Koleksiyon Ürünleri",
      },
      { id: "sports", key: "sports", label: "Spor & Outdoor" },
    ],
  },
  {
    id: "kids",
    key: "kids",
    label: "Bebek & Çocuk",
    items: [
      { id: "toys", key: "toys", label: "Oyuncaklar" },
      { id: "baby_clothing", key: "baby_clothing", label: "Bebek Giyim" },
      { id: "kids_clothing", key: "kids_clothing", label: "Çocuk Giyim" },
      { id: "stroller", key: "stroller", label: "Bebek Arabası & Eşyaları" },
      { id: "kids_other", key: "kids_other", label: "Diğer Ürünler" },
    ],
  },
  {
    id: "other",
    key: "other",
    label: "Diğer",
    items: [
      { id: "pet", key: "pet", label: "Evcil Hayvan Ürünleri" },
      { id: "auto", key: "auto", label: "Oto Aksesuar" },
      { id: "office", key: "office", label: "Ofis & Kırtasiye" },
      { id: "services", key: "services", label: "Hizmet İlanları" },
      { id: "misc", key: "misc", label: "Çeşitli Ürünler" },
    ],
  },
];

export const CATEGORY_OPTIONS: CategoryItem[] = CATEGORY_GROUPS.flatMap(
  (group) => group.items
);
