// lib/types.ts
export type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  condition: string;
  status: string;
  created_at: string;
};

export type ListingWithImages = Listing & {
  images?: { image_url: string }[];
};
