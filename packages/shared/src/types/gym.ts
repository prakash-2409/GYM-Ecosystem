export interface Gym {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstin: string | null;
  isActive: boolean;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface GymBranding {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
}
