import json, re
from collections import OrderedDict, defaultdict

def normalize(s):
    return re.sub(r'\s+', ' ', s.strip())

def dedupe_name(name):
    words = name.split()
    n = len(words)
    if n < 2:
        return name
    if n % 2 == 0:
        half = n // 2
        if words[:half] == words[half:]:
            return ' '.join(words[:half])
    return name

# Parse fee-schedule.ts
with open('/home/z/my-project/src/lib/fee-schedule.ts') as f:
    content = f.read()

start_marker = 'FEE_SCHEDULE: FeeClass[] = '
start_idx = content.index(start_marker) + len(start_marker)
bracket_count = 0
end_idx = start_idx
for i in range(start_idx, len(content)):
    if content[i] == '[':
        bracket_count += 1
    elif content[i] == ']':
        bracket_count -= 1
        if bracket_count == 0:
            end_idx = i + 1
            break

fee_data = json.loads(content[start_idx:end_idx])

# Read category names (original document order)
with open('/home/z/my-project/upload/Pasted Content_1785594353838.txt') as f:
    cat_lines = [l.rstrip('\n') for l in f if l.strip()]

# Read amounts (flat list, maintaining order)
with open('/home/z/my-project/upload/amounts_raw.txt') as f:
    raw = f.read()

user_amounts = []
for line in raw.split('\n'):
    stripped = line.strip()
    if not stripped:
        continue
    cleaned = stripped.replace(',', '')
    try:
        user_amounts.append(float(cleaned))
    except:
        pass

print(f'Categories: {len(cat_lines)}')
print(f'User amounts: {len(user_amounts)}')

# Build category_name -> user_amount mapping (sequential, maintaining order)
cat_to_user_amount = {}
for i, cat_name in enumerate(cat_lines):
    if i < len(user_amounts):
        cat_to_user_amount[cat_name] = user_amounts[i]

print(f'Categories with user amounts: {len(cat_to_user_amount)}')

# Build uploaded lookup for name matching
uploaded_by_norm = defaultdict(list)
for i, u in enumerate(cat_lines):
    uploaded_by_norm[normalize(u)].append((i+1, u))

used_keys = set()

def find_match(target_norm):
    candidates = uploaded_by_norm.get(target_norm, [])
    for line_no, name in candidates:
        if line_no not in used_keys:
            return (line_no, name)
    return None

# Build the new mapping: class -> [{name, amount, ceiling, unit}]
result = OrderedDict()
name_changed = 0
name_same = 0
amount_updated = 0
amount_kept = 0

for cls in fee_data:
    cls_name = cls['class']
    new_cats = []

    for cat in cls['categories']:
        fee_name = cat['name']
        fee_norm = normalize(fee_name)
        fee_amount = cat['amount']
        match = None

        # Strategy 1: Direct normalized match
        match = find_match(fee_norm)

        # Strategy 2: Dedupe class name and try
        if not match:
            deduped_cls = dedupe_name(cls_name)
            deduped_cat = dedupe_name(fee_name)
            if deduped_cls != cls_name or deduped_cat != fee_name:
                match = find_match(normalize(deduped_cat))
                if not match:
                    match = find_match(normalize(deduped_cls))

        # Strategy 3: Strip class name from category
        if not match:
            deduped_cls = dedupe_name(cls_name)
            norm_cls = normalize(deduped_cls)
            norm_cat = normalize(fee_name)
            if norm_cat.startswith(norm_cls):
                remainder = norm_cat[len(norm_cls):].strip(' -')
                if remainder:
                    match = find_match(remainder)

        # Strategy 4: Grade mappings
        if not match:
            if fee_norm == 'CAT A - Grade':
                match = find_match('CAT A - Grade 1')
            elif fee_norm == 'CAT B - Grade':
                match = find_match('CAT B - Grade 2')

        # Strategy 5: Class A mappings
        if not match and re.match(r'CAT ([A-Z]) - Class A$', fee_norm):
            letter = fee_norm.split()[1]
            mapping = {'A': 'CAT A - Class A1', 'B': 'CAT B - Class A2', 'C': 'CAT C - Class A3'}
            alt = mapping.get(letter, '')
            if alt:
                match = find_match(alt)

        # Strategy 6: Jewellery Shops
        if not match:
            if norm_cls.startswith('Jewellery Shops') and 'CAT.A' in fee_norm:
                match = find_match('CAT.A - Retail (Large)')

        if match:
            used_keys.add(match[0])
            user_cat_name = match[1]
            # Look up user amount for this category name
            user_amt = cat_to_user_amount.get(user_cat_name)

            new_cats.append({
                'name': user_cat_name,
                'amount': user_amt if user_amt is not None else fee_amount,
                'ceiling': cat['ceiling'],
                'unit': cat['unit'],
            })
            if user_cat_name != fee_name:
                name_changed += 1
            else:
                name_same += 1
            if user_amt is not None:
                amount_updated += 1
            else:
                amount_kept += 1
        else:
            new_cats.append({
                'name': fee_name,
                'amount': fee_amount,
                'ceiling': cat['ceiling'],
                'unit': cat['unit'],
            })
            name_same += 1
            amount_kept += 1

    result[cls_name] = new_cats

print(f'\nNames from uploaded: {name_changed}')
print(f'Names from fee-schedule: {name_same}')
print(f'Amounts from user: {amount_updated}')
print(f'Amounts from fee-schedule: {amount_kept}')

# Generate TypeScript
lines = []
lines.append('// Auto-generated: category names from user data, amounts from user-provided data.')
lines.append('// Do not edit manually.')
lines.append('')
lines.append('export interface UserCategory {')
lines.append('  name: string;')
lines.append('  amount: number;')
lines.append('  ceiling: number | null;')
lines.append('  unit: string;')
lines.append('}')
lines.append('')
lines.append('export const USER_CATEGORIES: Record<string, UserCategory[]> = {')

for cls_name, cats in result.items():
    escaped_cls = cls_name.replace('\\', '\\\\').replace("'", "\\'")
    lines.append(f"  '{escaped_cls}': [")
    for cat in cats:
        escaped_name = cat['name'].replace('\\', '\\\\').replace("'", "\\'")
        ceiling = 'null' if cat['ceiling'] is None else str(cat['ceiling'])
        lines.append(f"    {{ name: '{escaped_name}', amount: {cat['amount']}, ceiling: {ceiling}, unit: '{cat['unit']}' }},")
    lines.append('  ],')

lines.append('};')

output_path = '/home/z/my-project/src/lib/user-categories.ts'
with open(output_path, 'w') as f:
    f.write('\n'.join(lines) + '\n')

print(f'\nWritten to {output_path}')
