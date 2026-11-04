export type User = {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  createdAt?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  active?: boolean;
  _count?: {
    products: number;
  };
};

export type Product = {
  id: string;
  categoryId?: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  stock: number;
  imageUrl: string;
  weightG?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
};

export type Address = {
  id?: string;
  recipientName: string;
  zipcode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  isDefault?: boolean;
};

export type ShippingOption = {
  code: string;
  name: string;
  price: number;
  deliveryDays: number;
  description?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
};

export type PaymentInfo = {
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  qrCodePix?: string;
  qrCodePixUrl?: string;
  paidAt?: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  subtotal: number | string;
  shippingCost: number | string;
  total: number | string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  payment?: PaymentInfo;
  address?: Address;
  trackingCode?: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminStats = {
  totalOrders: number;
  statusCounts: Record<Order['status'], number>;
  revenue: number;
  pendingRevenue: number;
  averageTicket: number;
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalClients: number;
  totalCategories: number;
};

export type AdminStatsResponse = {
  stats: AdminStats;
  recentOrders: Order[];
  lowStockProducts: Product[];
  salesLast7Days: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
};

