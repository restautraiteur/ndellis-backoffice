import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { Label } from "@ui/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/components/ui/dialog";
import { ConfirmDialog, EmptyState } from "@/features/admin/components/admin-ui";
import type { Product } from "@/features/admin/products/api";
import {
  HISTORY_SIZE,
  defaultFormat,
  formatAmount,
  logCost,
  type Ingredient,
  type ProductionLog,
} from "@/features/admin/simulation/api";
import type { MenuRow } from "@core/domain/menu/api";
import { db } from "@core/lib/db";
import { formatDay, formatPrice, todayISO } from "@core/lib/format";
import { cn } from "@core/lib/utils";

const SELECT = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

type Line = { ingredientId: string; formatId: string; count: string };
type Draft = {
  id?: string;
  productId: string;
  cookedOn: string;
  plates: string;
  notes: string;
  lines: Line[];
};

/** Journal de production : ce qui a été réellement utilisé à chaque cuisson, et les plats obtenus. */
export function ProductionPanel({
  logs,
  dishes,
  ingredients,
  menu,
}: {
  logs: ProductionLog[];
  dishes: Product[];
  ingredients: Ingredient[];
  menu: MenuRow[];
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<ProductionLog | null>(null);
  const ingredientById = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);
  const dishById = useMemo(() => new Map(dishes.map((d) => [d.id, d])), [dishes]);

  // Chaque ligne : quantité (unité de base) et coût, au prix actuel du format choisi.
  const computed = (draft?.lines ?? []).map((line) => {
    const ingredient = ingredientById.get(line.ingredientId);
    const format = ingredient?.formats.find((f) => f.id === line.formatId);
    const count = Number(line.count);
    const ok = !!ingredient && !!format && count > 0;
    return {
      line,
      ingredient,
      format,
      count,
      ok,
      quantity: ok ? count * format!.size : 0,
      cost: ok ? Math.round(count * format!.price) : 0,
    };
  });
  const plates = Number(draft?.plates);
  const valid =
    !!draft?.productId &&
    !!draft.cookedOn &&
    Number.isInteger(plates) &&
    plates > 0 &&
    computed.length > 0 &&
    computed.every((c) => c.ok);
  const total = computed.reduce((s, c) => s + c.cost, 0);

  const save = useMutation({
    mutationFn: async (value: Draft) => {
      const menuRow = menu.find(
        (m) => m.product_id === value.productId && m.day_date === value.cookedOn,
      );
      const payload = {
        product_id: value.productId,
        day_product_id: menuRow?.day_product_id ?? null,
        cooked_on: value.cookedOn,
        plates_obtained: Number(value.plates),
        notes: value.notes.trim() || null,
      };
      let id = value.id;
      if (id) {
        const { error } = await db.from("production_logs").update(payload).eq("id", id);
        if (error) throw new Error(error.message);
        const { error: delError } = await db.from("production_log_items").delete().eq("log_id", id);
        if (delError) throw new Error(delError.message);
      } else {
        const { data, error } = await db
          .from("production_logs")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        id = data.id as string;
      }
      const { error: itemsError } = await db.from("production_log_items").insert(
        computed.map((c) => ({
          log_id: id,
          ingredient_id: c.ingredient!.id,
          format_label: c.format!.label,
          format_count: c.count,
          quantity: c.quantity,
          cost: c.cost,
        })),
      );
      if (itemsError) throw new Error(itemsError.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production_logs"] });
      setDraft(null);
      toast.success("Fiche de production enregistrée");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleExcluded = useMutation({
    mutationFn: async (log: ProductionLog) => {
      const { error } = await db
        .from("production_logs")
        .update({ excluded: !log.excluded })
        .eq("id", log.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production_logs"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("production_logs").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production_logs"] });
      toast.success("Fiche supprimée");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function startNew() {
    // Par défaut : le premier plat du menu d'aujourd'hui, sinon le premier plat du catalogue.
    const todayDish = menu.find((m) => m.day_date === todayISO() && m.category === "plat");
    setDraft({
      productId: todayDish?.product_id ?? dishes[0]?.id ?? "",
      cookedOn: todayISO(),
      plates: "",
      notes: "",
      lines: [],
    });
  }

  function edit(log: ProductionLog) {
    setDraft({
      id: log.id,
      productId: log.product_id,
      cookedOn: log.cooked_on,
      plates: String(log.plates_obtained),
      notes: log.notes ?? "",
      lines: log.items.map((item) => {
        const ingredient = ingredientById.get(item.ingredient_id);
        const format =
          ingredient?.formats.find((f) => f.label === item.format_label) ??
          (ingredient ? defaultFormat(ingredient) : null);
        return {
          ingredientId: item.ingredient_id,
          formatId: format?.id ?? "",
          count: String(item.format_count),
        };
      }),
    });
  }

  function patchLine(index: number, patch: Partial<Line>) {
    if (!draft) return;
    setDraft({
      ...draft,
      lines: draft.lines.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    });
  }

  const usable = ingredients.filter((i) => i.formats.length > 0);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-semibold">Journal de production</h2>
          <p className="text-sm text-muted-foreground">
            Après chaque cuisson : ce que vous avez utilisé et le nombre de plats obtenus. Le
            simulateur se base sur les {HISTORY_SIZE} dernières cuissons de chaque plat.
          </p>
        </div>
        <Button onClick={startNew} disabled={dishes.length === 0 || usable.length === 0}>
          <Plus className="size-4" /> Nouvelle fiche
        </Button>
      </div>

      {usable.length === 0 ? (
        <EmptyState title="Ajoutez d'abord vos ingrédients">
          Créez vos ingrédients et leurs formats d'achat dans l'onglet « Ingrédients ».
        </EmptyState>
      ) : logs.length === 0 ? (
        <EmptyState title="Aucune cuisson enregistrée">
          Remplissez une fiche après votre prochaine cuisson : c'est elle qui rendra les simulations
          justes.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <th className="px-5 py-2.5">Date</th>
                <th className="px-3 py-2.5">Plat</th>
                <th className="px-3 py-2.5 text-right">Plats obtenus</th>
                <th className="px-3 py-2.5 text-right">Dépense</th>
                <th className="px-3 py-2.5 text-right">Coût par plat</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => {
                const cost = logCost(log);
                return (
                  <tr key={log.id} className={cn(log.excluded && "text-muted-foreground")}>
                    <td className="px-5 py-3 first-letter:uppercase">{formatDay(log.cooked_on)}</td>
                    <td className="px-3 py-3">
                      <span className="font-medium">
                        {dishById.get(log.product_id)?.name ?? "—"}
                      </span>
                      {log.excluded && (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                          écartée
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold">{log.plates_obtained}</td>
                    <td className="px-3 py-3 text-right">{formatPrice(cost)}</td>
                    <td className="px-3 py-3 text-right">
                      {formatPrice(Math.round(cost / log.plates_obtained))}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        title={
                          log.excluded ? "Réintégrer dans les calculs" : "Écarter (cuisson ratée)"
                        }
                        aria-label={log.excluded ? "Réintégrer la fiche" : "Écarter la fiche"}
                        onClick={() => toggleExcluded.mutate(log)}
                      >
                        {log.excluded ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Modifier la fiche"
                        onClick={() => edit(log)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Supprimer la fiche"
                        onClick={() => setToDelete(log)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Modifier la fiche" : "Fiche de production"}</DialogTitle>
            <DialogDescription>
              Indiquez ce que vous avez réellement utilisé, dans les formats achetés.
            </DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="pl-dish">Plat</Label>
                  <select
                    id="pl-dish"
                    className={SELECT}
                    value={draft.productId}
                    onChange={(e) => setDraft({ ...draft, productId: e.target.value })}
                  >
                    {dishes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pl-date">Date de cuisson</Label>
                  <Input
                    id="pl-date"
                    type="date"
                    max={todayISO()}
                    value={draft.cookedOn}
                    onChange={(e) => setDraft({ ...draft, cookedOn: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pl-plates">Plats obtenus</Label>
                  <Input
                    id="pl-plates"
                    type="number"
                    min={1}
                    placeholder="52"
                    value={draft.plates}
                    onChange={(e) => setDraft({ ...draft, plates: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Ingrédients utilisés</p>
                {computed.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                    Ajoutez chaque ingrédient utilisé. Si vous avez pris deux formats différents
                    (ex. 2 boîtes de 500 g et 1 de 300 g), ajoutez deux lignes.
                  </p>
                )}
                {computed.map((c, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_2rem] items-center gap-2 rounded-lg border border-border p-2 sm:grid-cols-[1fr_1fr_5rem_7rem_2rem] sm:border-0 sm:p-0"
                  >
                    <select
                      aria-label="Ingrédient"
                      className={SELECT}
                      value={c.line.ingredientId}
                      onChange={(e) => {
                        const ingredient = ingredientById.get(e.target.value);
                        patchLine(index, {
                          ingredientId: e.target.value,
                          formatId: ingredient ? (defaultFormat(ingredient)?.id ?? "") : "",
                        });
                      }}
                    >
                      <option value="">Ingrédient…</option>
                      {usable.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="sm:order-last"
                      aria-label="Retirer la ligne"
                      onClick={() =>
                        setDraft({ ...draft, lines: draft.lines.filter((_, i) => i !== index) })
                      }
                    >
                      <X className="size-4" />
                    </Button>
                    <select
                      aria-label="Format"
                      className={SELECT}
                      value={c.line.formatId}
                      disabled={!c.ingredient}
                      onChange={(e) => patchLine(index, { formatId: e.target.value })}
                    >
                      {(c.ingredient?.formats ?? []).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      aria-label="Nombre"
                      placeholder="2"
                      value={c.line.count}
                      onChange={(e) => patchLine(index, { count: e.target.value })}
                    />
                    <span className="text-right text-xs text-muted-foreground">
                      {c.ok ? (
                        <>
                          {formatAmount(c.quantity, c.ingredient!.unit)}
                          <span className="block font-semibold text-foreground">
                            {formatPrice(c.cost)}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      lines: [...draft.lines, { ingredientId: "", formatId: "", count: "" }],
                    })
                  }
                >
                  <Plus className="size-4" /> Ajouter un ingrédient
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pl-notes">Notes (facultatif)</Label>
                <Input
                  id="pl-notes"
                  value={draft.notes}
                  placeholder="Ex. riz un peu trop cuit, portions plus généreuses"
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </div>

              <div className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Dépense de la cuisson</p>
                  <p className="text-lg font-semibold">{formatPrice(total)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Coût par plat</p>
                  <p className="text-lg font-semibold">
                    {plates > 0 ? formatPrice(Math.round(total / plates)) : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Annuler
            </Button>
            <Button disabled={!valid || save.isPending} onClick={() => draft && save.mutate(draft)}>
              {save.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer cette fiche de production ?"
        description="Elle ne sera plus utilisée dans les simulations ni dans les dépenses réelles."
        confirmLabel="Supprimer"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </section>
  );
}
