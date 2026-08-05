export interface Media {
  url: string;
  type: 'image' | 'video';
  name: string;
}

export interface Service {
  id: string;
  cardClass: string;
  label: string;
  emoji: string;
  number: string;
  numColor: string;
  topBarGradient: string;
  iconBg: string;
  title: string;
  sub: string;
  description?: string;
  tap: string;
  btnLabel: string;
  btnBg: string;
  btnColor: string;
  featColor: string;
  barColor: string;
  basePrice: string;
  deliveryFee: string;
  minOrder: string;
  features: string[];
  media: Media[];
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  cta: string;
  ctaClass: string;
  featured: boolean;
  badge?: string;
  features: string[];
}

export interface SubAdmin {
  id: string;
  email: string;
  name: string;
  role: 'order_manager' | 'service_manager' | 'full_subadmin';
  permissions: Array<'bookings' | 'services' | 'media' | 'plans' | 'settings'>;
  addedAt: string;
}

export interface Settings {
  phone: string;
  managerPhone?: string;
  email: string;
  whatsapp: string;
  address: string;
  monSat: string;
  monThu?: string;
  friSat?: string;
  sunday: string;
  holidays: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  banner: string;
  bannerLink: string;
  subAdmins?: SubAdmin[];
  adminPassword?: string;
  // Referral & Reward Perks Settings
  referralEnabled?: boolean;
  referralHeadline?: string;
  referralDescription?: string;
  referralDiscountAmount?: string;
  referralMinOrder?: string;
  referralCodePrefix?: string;
  // Express Emergency / Same-Day Service Settings
  expressEnabled?: boolean;
  expressBadgeTitle?: string;
  expressBadgeSub?: string;
  expressFee?: string;
  expressLaundryTime?: string;
  expressCleaningTime?: string;
  // Custom Laundry, Food & Bar Menu Price Lists Managed by Admin
  customLaundryItems?: LaundryItemSetting[];
  customFoodItems?: FoodItemSetting[];
  customBarItems?: BarItemSetting[];
  paystackPublicKey?: string;
}

export interface LaundryItemSetting {
  id: string;
  name: string;
  price: number;
  category: string;
  priceDisplay?: string;
}

export interface FoodItemSetting {
  id: string;
  name: string;
  price: number;
  category: string;
  priceDisplay?: string;
}

export interface BarItemSetting {
  id: string;
  name: string;
  price: number;
  category: string;
  priceDisplay?: string;
}

export interface Booking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  service: string;
  date: string;
  time: string;
  address: string;
  notes: string;
  status: 'new' | 'confirmed' | 'done' | 'cancelled';
  createdAt?: any; // Firestore Timestamp
  isExpress?: boolean;
  expressFeeAmount?: number;
  referralCodeApplied?: string;
  referralDiscountAmount?: number;
  totalEstimatedPrice?: number;
  laundryItemsBreakdown?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paystackReference?: string;
  paymentMethod?: 'paystack';
  paidAmount?: number;
  paidAt?: string;
}
