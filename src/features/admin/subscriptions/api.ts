import { queryOptions } from "@tanstack/react-query";
import { db, run } from "@core/lib/db";

export type Plan = {
  id: string;
  name: string;
  meals_count: number;
  price: number;
  delivery_included: boolean;
  active: boolean;
  sort_order: number;
};

export type Meal = {
  id: string;
  subscription_id: string;
  meal_date: string;
  status: "prevu" | "pris" | "annule";
};

export type Subscription = {
  id: string;
  plan_name: string;
  meals_count: number;
  price: number;
  customer_name: string;
  phone: string;
  address: string | null;
  start_date: string;
  end_date: string;
  status: "en_attente" | "active" | "annulee";
  payment_status: "non_paye" | "paye";
  notes: string | null;
  created_at: string;
  meals: Meal[];
};

export const SUBSCRIPTION_STATUS_LABELS: Record<Subscription["status"], string> = {
  en_attente: "À confirmer",
  active: "Confirmé",
  annulee: "Annulé",
};

export const plansAdminQuery = () =>
  queryOptions({
    queryKey: ["subscription_plans", "admin"],
    queryFn: () =>
      run<Plan[]>(
        db.from("subscription_plans").select("*").order("sort_order").order("meals_count", {
          ascending: false,
        }),
      ),
  });

export const subscriptionsQuery = () =>
  queryOptions({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const [subs, meals] = await Promise.all([
        run<Omit<Subscription, "meals">[]>(
          db.from("subscriptions").select("*").order("created_at", { ascending: false }),
        ),
        run<Meal[]>(db.from("subscription_meals").select("*").order("meal_date")),
      ]);
      return subs.map((s) => ({ ...s, meals: meals.filter((m) => m.subscription_id === s.id) }));
    },
  });

/** Repas restants (à venir, non pris, non annulés) d'un abonnement. */
export function remainingMeals(sub: Subscription, today: string) {
  return sub.meals.filter((m) => m.status === "prevu" && m.meal_date >= today).length;
}

/** Numéro lisible : 221781867272 → +221 78 186 72 72 (format sénégalais quand c'est possible). */
export function formatPhone(digits: string) {
  const m = digits.match(/^(221)?(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (!m) return digits;
  return `${m[1] ? "+221 " : ""}${m[2]} ${m[3]} ${m[4]} ${m[5]}`;
}
