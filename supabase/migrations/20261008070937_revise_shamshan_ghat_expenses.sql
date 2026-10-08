-- Revise only the previously published Shamshan Ghat breakdown when it still
-- matches the exact values from the first statement. Other live records are
-- left untouched.
with candidate as materialized (
  select id, breakdown
  from public.expenses
  where id = 'exp_1789453393710_7qhyu'
    and lower(trim(title)) = 'shamshan ghat'
    and amount = 84310
    and breakdown->>'total' = '84310'
    and jsonb_array_length(breakdown->'phases') = 8
    and breakdown #>> '{phases,6,items,5,description}' = '1-inch ball and socket for water tank'
    and breakdown #>> '{phases,6,items,5,amount}' = '515'
    and breakdown #>> '{phases,7,items,0,description}' = 'Tiles - 13 bundles'
    and breakdown #>> '{phases,7,items,0,amount}' = '1300'
    and breakdown #>> '{phases,7,items,8,description}' = 'Documents'
    and breakdown #>> '{phases,7,items,8,amount}' = '350'
),
removed_items as (
  select
    id,
    jsonb_set(
      jsonb_set(
        breakdown,
        '{phases,6,items}',
        (breakdown #> '{phases,6,items}') - 5
      ),
      '{phases,7,items}',
      (breakdown #> '{phases,7,items}') - 0
    ) as breakdown
  from candidate
),
revised as (
  select
    id,
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    (breakdown - 'reconciliationNote' - 'reconciliationNoteHi'),
                    '{total}',
                    '82845'::jsonb
                  ),
                  '{calculatedItemsTotal}',
                  '82845'::jsonb
                ),
                '{unreconciledAmount}',
                '0'::jsonb
              ),
              '{phases,1,title}',
              '"Concrete work completed on all four sides"'::jsonb
            ),
            '{phases,1,titleHi}',
            '"चारों तरफ पक्का कार्य कराया गया"'::jsonb
          ),
          '{phases,6,subtotal}',
          '3490'::jsonb
        ),
        '{phases,7,subtotal}',
        '11180'::jsonb
      ),
      '{phases,7,items,7,includedInTotal}',
      'true'::jsonb
    ) as breakdown
  from removed_items
)
update public.expenses as expense
set
  amount = 82845,
  breakdown = revised.breakdown
from revised
where expense.id = revised.id;
