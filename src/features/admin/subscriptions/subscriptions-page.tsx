import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Phone, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { Label } from "@ui/components/ui/label";
import { Switch } from "@ui/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/components/ui/dialog";
import { ConfirmDialog, EmptyState, PageHeader } from "@/features/admin/components/admin-ui";
import {
  SUBSCRIPTION_STATUS_LABELS,
  formatPhone,
  plansAdminQuery,
  remainingMeals,
  subscriptionsQuery,
  type Plan,
  type Subscription,
} from "@/features/admin/subscriptions/api";
import { db } from "@core/lib/db";
import { formatDay, formatPrice, todayISO } from "@core/lib/format";
import { cn } from "@core/lib/utils";

const TABS = [
  ["jour", "Repas du jour"],
  ["abonnes", "Abonnés"],
  ["formules", "Formules"],
] as const;
type Tab = (typeof TABS)[number][0];

/** Abonnements : repas à servir, abonnés à confirmer et encaisser, formules proposées sur le site. */
export function SubscriptionsPage() {
  const [tab, setTab] = useState<Tab>("jour");
  const { data: subs = [] } = useQuery(subscriptionsQuery());
  const { data: plans = [] } = useQuery(plansAdminQuery());
  const toConfirm = subs.filter((s) => s.status === "en_attente").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abonnements"
        description="Repas réservés d'avance par les abonnés."
      />
      <div role="tablist" className="flex w-fit flex-wrap rounded-lg bg-muted p-1">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              "h-9 rounded-md px-4 text-sm font-medium transition-colors",
              tab === value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {value === "abonnes" && toConfirm > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                {toConfirm}
              </span>
            )}
          </button>
        ))}
      </div>
      {tab === "jour" && <TodayMeals subs={subs} />}
      {tab === "abonnes" && <Subscribers subs={subs} />}
      {tab === "formules" && <Plans plans={plans} />}
    </div>
  );
}

function useMealStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: "prevu" | "pris" }) => {
      const { error } = await db
        .from("subscription_meals")
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
    onError: (error: Error) => toast.error(error.message),
  });
}

function TodayMeals({ subs }: { subs: Subscription[] }) {
  const [day, setDay] = useState(todayISO());
  const setStatus = useMealStatus();
  const rows = subs
    .filter((s) => s.status !== "annulee")
    .flatMap((s) =>
      s.meals.filter((m) => m.meal_date === day && m.status !== "annule").map((m) => ({ s, m })),
    );
  const taken = rows.filter((r) => r.m.status === "pris").length;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-semibold">Repas des abonnés · {formatDay(day)}</h2>
          <p className="text-sm text-muted-foreground">
            {rows.length} repas à servir · {taken} pris. À ajouter à la production du jour.
          </p>
        </div>
        <Input
          type="date"
          className="w-44"
          aria-label="Jour"
          value={day}
          onChange={(e) => setDay(e.target.value || todayISO())}
        />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Aucun repas d'abonné ce jour-là" />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map(({ s, m }) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{s.customer_name}</span>
                <span className="block text-xs text-muted-foreground">
                  {formatPhone(s.phone)}
                  {s.address ? ` · ${s.address}` : " · pas d'adresse (retrait ou à confirmer)"}
                </span>
              </span>
              {s.payment_status !== "paye" && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  non payé
                </span>
              )}
              <Button
                size="sm"
                variant={m.status === "pris" ? "default" : "outline"}
                onClick={() =>
                  setStatus.mutate({ id: m.id, status: m.status === "pris" ? "prevu" : "pris" })
                }
              >
                <Check className="size-4" /> {m.status === "pris" ? "Pris" : "Marquer pris"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Subscribers({ subs }: { subs: Subscription[] }) {
  const queryClient = useQueryClient();
  const [toCancel, setToCancel] = useState<Subscription | null>(null);
  const today = todayISO();

  const update = useMutation({
    mutationFn: async (input: { sub: Subscription; patch: Partial<Subscription> }) => {
      const { error } = await db.from("subscriptions").update(input.patch).eq("id", input.sub.id);
      if (error) throw new Error(error.message);
      if (input.patch.status === "annulee") {
        // Les repas à venir sont annulés ; ceux déjà pris restent dans l'historique.
        const { error: mealsError } = await db
          .from("subscription_meals")
          .update({ status: "annule" })
          .eq("subscription_id", input.sub.id)
          .eq("status", "prevu")
          .gte("meal_date", today);
        if (mealsError) throw new Error(mealsError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Abonnement mis à jour");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (subs.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <EmptyState title="Aucun abonné pour le moment">
          Les clients s'abonnent depuis la page « Abonnement » du site.
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
              <th className="px-5 py-2.5">Abonné</th>
              <th className="px-3 py-2.5">Formule</th>
              <th className="px-3 py-2.5">Période</th>
              <th className="px-3 py-2.5 text-right">Restants</th>
              <th className="px-3 py-2.5">Statut</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subs.map((s) => (
              <tr key={s.id} className={cn(s.status === "annulee" && "text-muted-foreground")}>
                <td className="px-5 py-3">
                  <span className="block font-medium">{s.customer_name}</span>
                  <a
                    href={`tel:+${s.phone.startsWith("221") ? s.phone : `221${s.phone}`}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Phone className="size-3" /> {formatPhone(s.phone)}
                  </a>
                </td>
                <td className="px-3 py-3">
                  {s.plan_name}
                  <span className="block text-xs text-muted-foreground">
                    {s.meals_count} repas · {formatPrice(s.price)}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs">
                  {formatDay(s.start_date)}
                  <span className="block text-muted-foreground">→ {formatDay(s.end_date)}</span>
                </td>
                <td className="px-3 py-3 text-right font-semibold">{remainingMeals(s, today)}</td>
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      "mr-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      s.status === "en_attente" && "bg-amber-100 text-amber-800",
                      s.status === "active" && "bg-emerald-100 text-emerald-800",
                      s.status === "annulee" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {SUBSCRIPTION_STATUS_LABELS[s.status]}
                  </span>
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      s.payment_status === "paye"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {s.payment_status === "paye" ? "Payé" : "Non payé"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right">
                  {s.status === "en_attente" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => update.mutate({ sub: s, patch: { status: "active" } })}
                    >
                      Confirmer
                    </Button>
                  )}
                  {s.status !== "annulee" && s.payment_status !== "paye" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-1"
                      onClick={() =>
                        update.mutate({
                          sub: s,
                          patch: { payment_status: "paye", status: "active" },
                        })
                      }
                    >
                      Marquer payé
                    </Button>
                  )}
                  {s.status !== "annulee" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Annuler l'abonnement de ${s.customer_name}`}
                      onClick={() => setToCancel(s)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={toCancel !== null}
        title={`Annuler l'abonnement de ${toCancel?.customer_name ?? ""} ?`}
        description="Les repas à venir seront annulés. Les repas déjà pris restent dans l'historique."
        confirmLabel="Annuler l'abonnement"
        onCancel={() => setToCancel(null)}
        onConfirm={() => {
          if (toCancel) update.mutate({ sub: toCancel, patch: { status: "annulee" } });
          setToCancel(null);
        }}
      />
    </section>
  );
}

type PlanDraft = {
  id?: string;
  name: string;
  meals: string;
  price: string;
  delivery: boolean;
  active: boolean;
};

function Plans({ plans }: { plans: Plan[] }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  const meals = Number(draft?.meals);
  const price = Number(draft?.price);
  const valid =
    !!draft?.name.trim() &&
    Number.isInteger(meals) &&
    meals >= 1 &&
    meals <= 60 &&
    Number.isInteger(price) &&
    price >= 0;

  const save = useMutation({
    mutationFn: async (value: PlanDraft) => {
      const payload = {
        name: value.name.trim(),
        meals_count: Number(value.meals),
        price: Number(value.price),
        delivery_included: value.delivery,
        active: value.active,
      };
      const { error } = value.id
        ? await db.from("subscription_plans").update(payload).eq("id", value.id)
        : await db.from("subscription_plans").insert(payload);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription_plans"] });
      setDraft(null);
      toast.success("Formule enregistrée");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-semibold">Formules</h2>
          <p className="text-sm text-muted-foreground">
            Proposées sur le site. Une formule inactive n'est plus visible mais les abonnements
            existants continuent.
          </p>
        </div>
        <Button
          onClick={() => setDraft({ name: "", meals: "", price: "", delivery: true, active: true })}
        >
          <Plus className="size-4" /> Nouvelle formule
        </Button>
      </div>
      {plans.length === 0 ? (
        <EmptyState title="Aucune formule">
          Créez vos formules (ex. « Hebdo 5 » : 5 repas, ou « Mensuelle » : 22 repas) pour que
          l'abonnement apparaisse sur le site.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border">
          {plans.map((p) => (
            <li
              key={p.id}
              className={cn("flex items-center gap-4 px-5 py-3", !p.active && "opacity-60")}
            >
              <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-muted">
                <span className="font-bold leading-none">{p.meals_count}</span>
                <span className="text-[10px] uppercase">repas</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{p.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {p.delivery_included ? "Livraison incluse" : "Sans livraison"}
                  {p.active ? "" : " · inactive"}
                </span>
              </span>
              <span className="font-semibold">{formatPrice(p.price)}</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Modifier ${p.name}`}
                onClick={() =>
                  setDraft({
                    id: p.id,
                    name: p.name,
                    meals: String(p.meals_count),
                    price: String(p.price),
                    delivery: p.delivery_included,
                    active: p.active,
                  })
                }
              >
                <Pencil className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Modifier la formule" : "Nouvelle formule"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pl-name">Nom</Label>
                <Input
                  id="pl-name"
                  placeholder="Formule Mensuelle"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pl-meals">Nombre de repas</Label>
                  <Input
                    id="pl-meals"
                    type="number"
                    min={1}
                    max={60}
                    value={draft.meals}
                    onChange={(e) => setDraft({ ...draft, meals: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pl-price">Prix (FCFA)</Label>
                  <Input
                    id="pl-price"
                    type="number"
                    min={0}
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={draft.delivery}
                  onCheckedChange={(checked) => setDraft({ ...draft, delivery: checked })}
                />
                Livraison incluse
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={draft.active}
                  onCheckedChange={(checked) => setDraft({ ...draft, active: checked })}
                />
                Visible sur le site
              </label>
              {!valid && (draft.name || draft.meals || draft.price) && (
                <p className="text-xs text-destructive">
                  Indiquez un nom, un nombre de repas entre 1 et 60 et un prix.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Annuler
            </Button>
            <Button disabled={!valid || save.isPending} onClick={() => draft && save.mutate(draft)}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
