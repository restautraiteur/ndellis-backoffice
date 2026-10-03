-- Formules d'abonnement de départ (reprises de Sayn Food), toutes avec livraison incluse.
-- Rejouable : une formule déjà présente (même nom et même nombre de repas) n'est pas recréée.
-- Prix et noms modifiables ensuite dans Back-office › Abonnements › Formules.
insert into public.subscription_plans (name, meals_count, price, delivery_included, active, sort_order)
select v.name, v.meals_count, v.price, true, true, v.sort_order
from (values
  ('Formule Mensuelle', 22, 78000, 1),
  ('Formule Mensuelle', 12, 48000, 2),
  ('Formule Hebdo 5',    5, 20000, 3),
  ('Formule Hebdo 4',    4, 16000, 4),
  ('Formule Hebdo 3',    3, 12000, 5)
) as v(name, meals_count, price, sort_order)
where not exists (
  select 1 from public.subscription_plans p
  where p.name = v.name and p.meals_count = v.meals_count
);
