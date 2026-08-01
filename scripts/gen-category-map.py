import json, re, sys
from collections import defaultdict, OrderedDict

def normalize(s):
    """Collapse multiple spaces to single, strip."""
    return re.sub(r'\s+', ' ', s.strip())

def strip_class_from_cat(class_name, cat_name):
    """Try to remove class name prefix from category name.
    Fee schedule has corrupted entries like:
      class: 'Blacksmith Blacksmith'
      category: 'Blacksmith Blacksmith'
    The uploaded file correctly has just 'Blacksmith'.
    """
    norm_cls = normalize(class_name)
    norm_cat = normalize(cat_name)
    # If the category IS the class name (duplicated), return empty
    if norm_cat == norm_cls:
        return ''
    # If category starts with class name, strip it
    if norm_cat.startswith(norm_cls):
        remainder = norm_cat[len(norm_cls):].strip()
        if remainder:
            return remainder
    # Try stripping first half if it's duplicated
    parts = norm_cls.split()
    half = len(parts) // 2
    if half > 0 and parts[:half] == parts[half:2*half]:
        single = ' '.join(parts[:half])
        if norm_cat == single:
            return single
        if norm_cat.startswith(single):
            remainder = norm_cat[len(single):].strip()
            if remainder:
                return remainder
    return norm_cat

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

arr_str = content[start_idx:end_idx]
fee_data = json.loads(arr_str)

# Read uploaded file
with open('/home/z/my-project/upload/Pasted Content_1785594353838.txt') as f:
    uploaded_lines = [line.rstrip('\n') for line in f if line.strip()]

# Build uploaded lookup structures
# Primary: normalized name -> list of (line_no, original_name)
uploaded_by_norm = defaultdict(list)
for i, u in enumerate(uploaded_lines):
    uploaded_by_norm[normalize(u)].append((i+1, u))

# Track used uploaded entries to handle duplicates
used_keys = set()  # (line_no,) tuples

def find_uploaded_match(target_norm, exclude_used=True):
    """Find best matching uploaded entry for a normalized target name."""
    candidates = uploaded_by_norm.get(target_norm, [])
    for line_no, name in candidates:
        if exclude_used and line_no in used_keys:
            continue
        return (line_no, name)
    return None

# Build the new mapping: class_name -> [{name, amount, ceiling, unit}]
result = OrderedDict()

for cls in fee_data:
    cls_name = cls['class']
    new_cats = []
    
    for cat in cls['categories']:
        fee_name = cat['name']
        fee_norm = normalize(fee_name)
        
        # Strategy 1: Direct normalized match
        match = find_uploaded_match(fee_norm)
        
        # Strategy 2: Try stripping duplicated class name from category
        if not match:
            stripped = strip_class_from_cat(cls_name, fee_name)
            if stripped and stripped != fee_norm:
                match = find_uploaded_match(stripped)
        
        # Strategy 3: For entries like 'CAT A - Grade', try 'CAT A - Grade 1'
        if not match and fee_norm in ('CAT A - Grade', 'CAT B - Grade'):
            alt = fee_norm.replace('Grade', 'Grade 1').rstrip()
            match = find_uploaded_match(alt)
            if not match:
                # Try Grade 2 for B
                alt = fee_norm.replace('Grade', 'Grade 2').rstrip()
                match = find_uploaded_match(alt)
        
        # Strategy 4: For 'CAT A - Class A' try other variations
        if not match and re.match(r'CAT [A-Z] - Class [A-Z]$', fee_norm):
            # These are Bus Stop Shelters, Flag Poles, Group Directional Signs
            # In uploaded: 'CAT A - Class A1', 'CAT B - Class A2', 'CAT C - Class A3'
            letter = fee_norm.split(' - ')[0].split()[1]  # A, B, or C
            mapping = {'A': 'CAT A - Class A1', 'B': 'CAT B - Class A2', 'C': 'CAT C - Class A3'}
            alt = mapping.get(letter, '')
            if alt:
                match = find_uploaded_match(normalize(alt))
        
        # Strategy 5: For 'CAT G - Others' in Exporters, the uploaded might not have it
        # Keep original if no match
        
        if match:
            used_keys.add(match[0])
            new_cats.append({
                'name': match[1],  # Use user's exact name
                'amount': cat['amount'],
                'ceiling': cat['ceiling'],
                'unit': cat['unit'],
            })
        else:
            # Fallback: use fee-schedule name (first 2 classes are missing from uploaded)
            new_cats.append({
                'name': fee_name,
                'amount': cat['amount'],
                'ceiling': cat['ceiling'],
                'unit': cat['unit'],
            })
    
    result[cls_name] = new_cats

# Stats are computed below
name_changed = 0
name_same = 0
for cls in fee_data:
    cls_name = cls['class']
    for i, cat in enumerate(cls['categories']):
        if result[cls_name][i]['name'] == cat['name']:
            name_same += 1
        else:
            name_changed += 1

total_cats = name_changed + name_same
total_uploaded = len(uploaded_lines)
unused_count = total_uploaded - len(used_keys)

print(f'Total categories: {total_cats}')
print(f'Names updated from uploaded: {name_changed}')
print(f'Names kept from fee-schedule: {name_same}')
print(f'Uploaded lines used: {len(used_keys)}/{total_uploaded}')
print(f'Uploaded lines unused: {unused_count}')

# Show some examples of changes
print('\nSample name changes:')
count = 0
for cls in fee_data:
    cls_name = cls['class']
    for i, cat in enumerate(cls['categories']):
        if result[cls_name][i]['name'] != cat['name'] and count < 15:
            print(f'  [{cls_name[:40]}]')
            print(f'    OLD: {cat["name"]}')
            print(f'    NEW: {result[cls_name][i]["name"]}')
            count += 1

# Generate TypeScript output
print('\n\nGenerating TypeScript file...')

lines = []
lines.append('// Auto-generated from user-provided category data matched to fee schedule amounts.')
lines.append('// Category names are from the user\'s original document; amounts from fee-schedule.')
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
    # Escape class name for TS string
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

print(f'Written to {output_path}')
print(f'File size: {len(chr(10).join(lines))} bytes')
