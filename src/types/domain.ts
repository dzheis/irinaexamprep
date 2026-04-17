export type AuthUser = {
  id: string;
  email?: string;
};

export type Purchase = {
  module_id: string;
};

export type PendingPaymentRow = {
  email: string;
  product_id: string;
  out_sum: number;
};

export type PaymentProduct = {
  id: string;
  title: string;
  price: number;
};

