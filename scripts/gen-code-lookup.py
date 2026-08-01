#!/usr/bin/env python3
"""Parse Code/Class/Category/Amount file and generate:
1. fee-code-lookup.ts  - code -> {class, category, amount}
2. business-class-code-map.ts - rebuilt from user data (CODE_TO_CLASS, CLASS_TO_CODES, CLASS_TO_FIRST_CODE)
"""
import re
import os

INPUT_FILE = '/home/z/my-project/upload/Pasted Content_1785609995784.txt'
OUT_DIR = '/home/z/my-project/src/lib'
LOOKUP_FILE = os.path.join(OUT_DIR, 'fee-code-lookup.ts')
CODEMAP_FILE = os.path.join(OUT_DIR, 'business-class-code-map.ts')

def parse_code_to_class(filepath):
    """Parse CODE_TO_CLASS from business-class-code-map.ts (fallback)"""
    code_to_class = {}
    in_section = False
    with open(filepath, 'r') as f:
        for line in f:
            line_s = line.strip()
            if 'export const CODE_TO_CLASS' in line_s:
                in_section = True
                continue
            if in_section:
                if line_s == '};':
                    break
                m = re.match(r"'(\d{8})':\s*'([^']*)'", line_s)
                if m:
                    code_to_class[m.group(1)] = m.group(2)
    return code_to_class

def main():
    # Load existing code->class as fallback
    existing_ctc = parse_code_to_class(CODEMAP_FILE)
    print(f"Loaded {len(existing_ctc)} existing code-to-class mappings")

    # Parse input file
    with open(INPUT_FILE, 'r') as f:
        raw_lines = f.readlines()

    entries = []
    for line in raw_lines:
        line = line.rstrip()
        if not line.strip():
            continue
        m = re.match(r'^(\d{8})\s+(.*)', line)
        if not m:
            continue
        code = m.group(1)
        rest = m.group(2).strip()

        # Parse amount from end
        amount = 0.0
        amt_match = re.search(r'([\d,]+\.\d{2})\s*$', rest)
        if amt_match:
            amount = float(amt_match.group(1).replace(',', ''))
            rest = rest[:amt_match.start()].strip()

        entries.append({'code': code, 'rest': rest, 'amount': amount})

    print(f"Parsed {len(entries)} entries from input")

    # Separate class from category using tab split
    # Input format: CODE<TAB>CLASS<TAB>CATEGORY<optional whitespace>AMOUNT
    code_lookup = {}
    code_to_class_new = {}
    class_to_codes_new = {}
    class_order = []

    for entry in entries:
        code = entry['code']
        rest = entry['rest']
        amount = entry['amount']

        # Split by tabs - class is first part, category is second
        tab_parts = rest.split('\t')
        if len(tab_parts) >= 2:
            class_name = tab_parts[0].strip()
            category = tab_parts[1].strip()
        else:
            # No tab - try to find class name from existing mapping
            class_name = existing_ctc.get(code, '')
            if class_name:
                rest_norm = re.sub(r'\s+', ' ', rest).strip()
                class_norm = re.sub(r'\s+', ' ', class_name).strip()
                if rest_norm.startswith(class_norm):
                    category = rest_norm[len(class_norm):].strip()
                else:
                    category = rest_norm
            else:
                # Single entry - class and category are the same
                class_name = rest
                category = rest

        # Clean up category - remove extra spaces
        category = re.sub(r'\s+', ' ', category).strip()
        class_name = re.sub(r'\s+', ' ', class_name).strip()

        code_lookup[code] = {'class': class_name, 'category': category, 'amount': amount}
        code_to_class_new[code] = class_name

        if class_name not in class_to_codes_new:
            class_to_codes_new[class_name] = []
            class_order.append(class_name)
        class_to_codes_new[class_name].append(code)

    # Deduplicate codes in class_to_codes_new (keep order)
    for cls in class_to_codes_new:
        seen = set()
        deduped = []
        for c in class_to_codes_new[cls]:
            if c not in seen:
                seen.add(c)
                deduped.append(c)
        class_to_codes_new[cls] = deduped

    print(f"Built lookup: {len(code_lookup)} codes, {len(class_order)} classes")

    # Show samples
    for code in ['10010001', '10010006', '10010007', '10020001', '50010001', '50070001']:
        if code in code_lookup:
            info = code_lookup[code]
            print(f"  {code}: class='{info['class']}', cat='{info['category']}', amt={info['amount']}")

    # Generate fee-code-lookup.ts
    lookup_lines = []
    lookup_lines.append('// Auto-generated from Code/Class/Category/Amount data. Do not edit manually.')
    lookup_lines.append('// When a Business Class Code is selected, this provides the corresponding Class, Category, and Amount.')
    lookup_lines.append('')
    lookup_lines.append('export interface FeeCodeEntry {')
    lookup_lines.append('  businessClass: string;')
    lookup_lines.append('  category: string;')
    lookup_lines.append('  amount: number;')
    lookup_lines.append('}')
    lookup_lines.append('')
    lookup_lines.append('// Code -> { businessClass, category, amount }')
    lookup_lines.append('export const FEE_CODE_LOOKUP: Record<string, FeeCodeEntry> = {')

    for code in sorted(code_lookup.keys()):
        info = code_lookup[code]
        cls_esc = info['class'].replace('\\', '\\\\').replace("'", "\\'")
        cat_esc = info['category'].replace('\\', '\\\\').replace("'", "\\'")
        amt = info['amount']
        lookup_lines.append(f"  '{code}': {{ businessClass: '{cls_esc}', category: '{cat_esc}', amount: {amt} }},")

    lookup_lines.append('};')
    lookup_lines.append('')

    with open(LOOKUP_FILE, 'w') as f:
        f.write('\n'.join(lookup_lines))
    print(f"Generated {LOOKUP_FILE}")

    # Generate business-class-code-map.ts
    map_lines = []
    map_lines.append('// Auto-generated from Code/Class/Category/Amount data. Do not edit manually.')
    map_lines.append('')

    # CLASS_TO_CODES_RAW
    map_lines.append('// Business Class name -> all codes (original order, duplicates removed)')
    map_lines.append('export const CLASS_TO_CODES_RAW: Record<string, string[]> = {')
    for cls in class_order:
        codes = class_to_codes_new[cls]
        cls_esc = cls.replace('\\', '\\\\').replace("'", "\\'")
        codes_str = ', '.join(f'"{c}"' for c in codes)
        map_lines.append(f"  '{cls_esc}': [{codes_str}],")
    map_lines.append('};')
    map_lines.append('')

    # CLASS_TO_CODES (deduplicated, sorted)
    map_lines.append('// Business Class name -> unique codes (sorted)')
    map_lines.append('export const CLASS_TO_CODES: Record<string, string[]> = {')
    for cls in class_order:
        codes = sorted(set(class_to_codes_new[cls]))
        cls_esc = cls.replace('\\', '\\\\').replace("'", "\\'")
        codes_str = ', '.join(f'"{c}"' for c in codes)
        map_lines.append(f"  '{cls_esc}': [{codes_str}],")
    map_lines.append('};')
    map_lines.append('')

    # CLASS_TO_FIRST_CODE
    map_lines.append('// Business Class name -> first code')
    map_lines.append('export const CLASS_TO_FIRST_CODE: Record<string, string> = {')
    for cls in class_order:
        codes = class_to_codes_new[cls]
        cls_esc = cls.replace('\\', '\\\\').replace("'", "\\'")
        if codes:
            map_lines.append(f"  '{cls_esc}': '{codes[0]}',")
    map_lines.append('};')
    map_lines.append('')

    # CODE_TO_CLASS
    map_lines.append('// Business Class Code -> Class name')
    map_lines.append('export const CODE_TO_CLASS: Record<string, string> = {')
    for code in sorted(code_to_class_new.keys()):
        cls = code_to_class_new[code]
        cls_esc = cls.replace('\\', '\\\\').replace("'", "\\'")
        map_lines.append(f"  '{code}': '{cls_esc}',")
    map_lines.append('};')
    map_lines.append('')

    with open(CODEMAP_FILE, 'w') as f:
        f.write('\n'.join(map_lines))
    print(f"Generated {CODEMAP_FILE}")

if __name__ == '__main__':
    main()