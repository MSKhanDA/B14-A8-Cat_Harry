const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
export const API_URL = configuredApiUrl.replace(/\/+$/, "");

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "Something went wrong. Please try again.");
  }
  return data;
}

export type User = { id: string; email: string; name: string; photoUrl: string };
export type Studio = {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  imageUrl: string;
  galleryImages: string[];
  amenities: string[];
  overview: string;
  ownerEmail: string;
  ownerName: string;
  ownerPhoto?: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
};
export type Booking = {
  _id: string;
  studioId: string;
  studioTitle: string;
  studioImage: string;
  ownerEmail: string;
  guestEmail: string;
  guestName: string;
  startsAt: string;
  endsAt: string;
  hours: number;
  total: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
};
export type Review = {
  _id: string;
  studioId: string;
  bookingId: string;
  guestName: string;
  guestPhoto: string;
  rating: number;
  comment: string;
  createdAt: string;
};
