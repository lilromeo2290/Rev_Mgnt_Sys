import re, json

with open('/home/z/my-project/upload/Pasted Content_1785373983818.txt', 'r') as f:
    lines = f.readlines()

UNIT_PATTERNS = [
    'per annum', 'per month', 'per day', 'per event', 'per quarter',
    '4x4 ft', 'per m2', 'per m', 'per sq', 'per week', 'per year',
    'per sq m', 'per sq.m', 'per sqm',
]

def extract_unit(text):
    text_stripped = text.rstrip()
    text_lower = text_stripped.lower()
    for u in sorted(UNIT_PATTERNS, key=len, reverse=True):
        if text_lower.endswith(u):
            return u.title(), text_stripped[:len(text_stripped)-len(u)].strip()
    return None, text

def parse_amount(s):
    s = s.replace(',', '').strip()
    try:
        return float(s)
    except:
        return None

CAT_PATTERN = re.compile(
    r"""\b(Cat(?:egory)?\s*['\u2019]?\s*[A-Z]\b.*)\s*$""",
    re.IGNORECASE
)

CAT_SUFFIX_PATTERN = re.compile(
    r"""\s+(Cat(?:egory)?\s*['\u2019]?\s*[A-Z])\s*$""",
    re.IGNORECASE
)

def split_class_category(text):
    m = CAT_PATTERN.search(text)
    if m:
        cat_text = m.group(1).strip()
        cls_text = text[:m.start()].strip()
        cls_text = re.sub(r' {2,}', ' ', cls_text).strip()
        if cls_text and len(cls_text) >= 2:
            return cls_text, cat_text
    return text, text

def try_extract_cat_from_class(cls):
    m = CAT_SUFFIX_PATTERN.search(cls)
    if m:
        true_cls = cls[:m.start()].strip()
        cat_suffix = m.group(1).strip()
        if true_cls and len(true_cls) >= 3:
            return true_cls, cat_suffix
    return cls, None

def normalize_class_name(cls):
    return re.sub(r' {2,}', ' ', cls).strip()

raw_rows = []
for line_raw in lines:
    line = line_raw.strip()
    if not line or line.startswith('Class'):
        continue
    line = re.sub(r'\t', '  ', line)
    remainder = line
    unit = 'Per Annum'
    found_unit, remainder = extract_unit(remainder)
    if found_unit:
        unit = found_unit
    numbers = []
    temp = remainder
    while True:
        m = re.search(r'(\d[\d,]*(?:\.\d+)?)\s*$', temp)
        if m and parse_amount(m.group(1)) is not None and parse_amount(m.group(1)) >= 0:
            val = parse_amount(m.group(1))
            numbers.insert(0, val)
            temp = temp[:m.start()].rstrip()
        else:
            break
    if not numbers:
        continue
    text_part = temp.strip()
    if not text_part:
        continue
    if numbers[0] == 0 and (len(numbers) < 2 or numbers[1] == 0):
        if numbers[0] == 0 and len(numbers) >= 2 and numbers[1] == 0:
            continue
    amount = numbers[0]
    ceiling = numbers[1] if len(numbers) > 1 else None
    text_part = re.sub(r' {2,}', ' ', text_part).strip()
    raw_rows.append({'text': text_part, 'amount': amount, 'ceiling': ceiling, 'unit': unit})

entries = []
for row in raw_rows:
    cls, cat = split_class_category(row['text'])
    entries.append({'class': cls, 'category': cat, 'amount': row['amount'], 'ceiling': row['ceiling'], 'unit': row['unit']})

fixed_entries = []
for e in entries:
    true_cls, extracted_cat = try_extract_cat_from_class(e['class'])
    if extracted_cat:
        if e['category'] == e['class'] or e['category'].lower() == e['class'].lower():
            fixed_entries.append({'class': true_cls, 'category': extracted_cat, 'amount': e['amount'], 'ceiling': e['ceiling'], 'unit': e['unit']})
        else:
            fixed_entries.append({'class': true_cls, 'category': e['category'], 'amount': e['amount'], 'ceiling': e['ceiling'], 'unit': e['unit']})
    else:
        fixed_entries.append(e)
entries = fixed_entries

classes = {}
for e in entries:
    c = normalize_class_name(e['class'])
    if c not in classes:
        classes[c] = []
    classes[c].append(e)

merge_rules = {
    'Aerial Adverts - Planes, Balloons etc (Per Day Fee in All Zones)': 'Aerial Adverts',
    'Central Bank': 'Banks',
    'Community centres': 'Community Centres',
    'Guest Houses (4-9 Rooms)': 'Guest Houses',
}

final_classes = {}
for cls_name, cats in sorted(classes.items()):
    canonical = merge_rules.get(cls_name, cls_name)
    if canonical not in final_classes:
        final_classes[canonical] = []
    final_classes[canonical].extend(cats)

for cls_name in final_classes:
    final_classes[cls_name].sort(key=lambda c: c['category'])

data_out = []
for cls_name in sorted(final_classes.keys()):
    cats = final_classes[cls_name]
    data_out.append({'class': cls_name, 'categories': [{'name': c['category'], 'amount': c['amount'], 'ceiling': c['ceiling'], 'unit': c['unit']} for c in cats]})

print(f'Entries: {len(entries)}, Classes: {len(data_out)}, Multi-cat: {sum(1 for d in data_out if len(d["categories"]) > 1)}, Single-cat: {sum(1 for d in data_out if len(d["categories"]) == 1)}')

with open('/home/z/my-project/src/lib/fee-schedule-data.json', 'w') as f:
    json.dump(data_out, f, indent=2)

with open('/home/z/my-project/src/lib/fee-schedule.ts', 'w') as f:
    f.write('// Auto-generated from fee schedule data. Do not edit manually.\n\n')
    f.write('export interface FeeCategory {\n  name: string;\n  amount: number;\n  ceiling: number | null;\n  unit: string;\n}\n\n')
    f.write('export interface FeeClass {\n  class: string;\n  categories: FeeCategory[];\n}\n\n')
    f.write('export const FEE_SCHEDULE: FeeClass[] = ')
    f.write(json.dumps(data_out, indent=2))
    f.write(' as const;\n\n')
    f.write('export const BUSINESS_CLASSES = FEE_SCHEDULE.map(f => f.class);\n\n')
    f.write('export const BUSINESS_CLASS_CATEGORIES: Record<string, FeeCategory[]> = {};\n')
    f.write('for (const fc of FEE_SCHEDULE) {\n  BUSINESS_CLASS_CATEGORIES[fc.class] = fc.categories;\n}\n\n')
    f.write('export interface FlatRateEntry {\n  class: string;\n  category: string;\n  amount: number;\n  ceiling: number | null;\n  unit: string;\n}\n\n')
    f.write('export const FLAT_RATES: FlatRateEntry[] = FEE_SCHEDULE.flatMap(fc =>\n  fc.categories.map(c => ({\n    class: fc.class,\n    category: c.name,\n    amount: c.amount,\n    ceiling: c.ceiling,\n    unit: c.unit,\n  }))\n);\n')

print('Done - saved fee-schedule.ts and fee-schedule-data.json')
