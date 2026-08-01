#!/usr/bin/env python3
"""Update amounts in user-categories.ts from the parsed Code/Class/Category/Amount data."""
import re
import os

INPUT_FILE = '/home/z/my-project/upload/Pasted Content_1785609995784.txt'
CODEMAP_FILE = '/home/z/my-project/src/lib/business-class-code-map.ts'
USER_CATS_FILE = '/home/z/my-project/src/lib/user-categories.ts'

def parse_code_to_class(filepath):
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
    code_to_class = parse_code_to_class(CODEMAP_FILE)

    # Parse input file to get code -> (class, category, amount)
    with open(INPUT_FILE, 'r') as f:
        raw_lines = f.readlines()

    class_cat_amounts = {}  # class -> {category_name -> amount}

    for line in raw_lines:
        line = line.rstrip()
        if not line.strip():
            continue
        m = re.match(r'^(\d{8})\s+(.*)', line)
        if not m:
            continue
        code = m.group(1)
        rest = m.group(2).strip()

        amount = 0.0
        amt_match = re.search(r'([\d,]+\.\d{2})\s*$', rest)
        if amt_match:
            amount = float(amt_match.group(1).replace(',', ''))
            rest = rest[:amt_match.start()].strip()

        class_name = code_to_class.get(code, '')
        if not class_name:
            continue

        tab_parts = rest.split('\t')
        if len(tab_parts) >= 2:
            category = tab_parts[1].strip()
        else:
            rest_norm = re.sub(r'\s+', ' ', rest).strip()
            class_norm = re.sub(r'\s+', ' ', class_name).strip()
            if rest_norm.startswith(class_norm):
                category = rest_norm[len(class_norm):].strip()
            else:
                continue

        category = re.sub(r'\s+', ' ', category).strip()
        if class_name not in class_cat_amounts:
            class_cat_amounts[class_name] = {}
        class_cat_amounts[class_name][category] = amount

    print(f"Built amount map for {len(class_cat_amounts)} classes")

    # Now update user-categories.ts
    with open(USER_CATS_FILE, 'r') as f:
        content = f.read()

    # Parse and update amounts
    lines = content.split('\n')
    current_class = None
    updated_lines = []
    updates = 0

    for line in lines:
        line_s = line.strip()

        # Detect class key
        m = re.match(r"^'([^']+)':\s*\[", line_s)
        if m:
            current_class = m.group(1)
            updated_lines.append(line)
            continue

        # Detect end of class array
        if current_class and '],' in line_s:
            current_class = None
            updated_lines.append(line)
            continue

        # Update amount in category entries
        if current_class and "name: '" in line_s and 'amount:' in line_s:
            # Extract category name
            name_m = re.search(r"name:\s*'([^']*)'", line_s)
            if name_m:
                cat_name = name_m.group(1)
                cat_name_norm = re.sub(r'\s+', ' ', cat_name).strip()
                if current_class in class_cat_amounts and cat_name_norm in class_cat_amounts[current_class]:
                    new_amount = class_cat_amounts[current_class][cat_name_norm]
                    line = re.sub(r'amount:\s*[\d.]+', f'amount: {new_amount}', line)
                    updates += 1
            updated_lines.append(line)
            continue

        updated_lines.append(line)

    with open(USER_CATS_FILE, 'w') as f:
        f.write('\n'.join(updated_lines))

    print(f"Updated {updates} category amounts in {USER_CATS_FILE}")

    # Check for categories in user-categories.ts that don't have new amounts
    with open(USER_CATS_FILE, 'r') as f:
        content2 = f.read()
    current_class2 = None
    missing = 0
    for line in content2.split('\n'):
        line_s = line.strip()
        m = re.match(r"^'([^']+)':\s*\[", line_s)
        if m:
            current_class2 = m.group(1)
            continue
        if current_class2 and '],' in line_s:
            current_class2 = None
            continue
        if current_class2 and "name: '" in line_s:
            name_m = re.search(r"name:\s*'([^']*)'", line_s)
            if name_m:
                cat_name = name_m.group(1)
                cat_name_norm = re.sub(r'\s+', ' ', cat_name).strip()
                if current_class2 not in class_cat_amounts or cat_name_norm not in class_cat_amounts[current_class2]:
                    missing += 1
                    if missing <= 10:
                        print(f"  No new amount for: {current_class2} / {cat_name}")
    print(f"Total categories without new amounts: {missing}")

if __name__ == '__main__':
    main()