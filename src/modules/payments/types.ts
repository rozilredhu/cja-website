import type { PromotionTargetType } from "./packages";

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

export type PaymentProvider = "stripe_stub" | "stripe";

export type PromotionOrderRow = {
  id: number;
  user_id: number;
  target_type: PromotionTargetType;
  target_id: number;
  package_code: string;
  amount_cad_cents: number;
  status: OrderStatus;
  provider: string;
  provider_ref: string | null;
  paid_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type PromotionFormState = {
  error?: string;
  ok?: boolean;
  message?: string;
  orderId?: number;
};

export type ActivePromotion = {
  targetType: PromotionTargetType;
  targetId: number;
  endsAt: string;
  packageCode: string;
};
