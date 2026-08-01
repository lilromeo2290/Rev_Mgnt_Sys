import re
import os

CODEMAP_FILE = '/home/z/my-project/src/lib/business-class-code-map.ts'
CODES_FILE = '/home/z/my-project/src/lib/business-class-codes.ts'

def main():
    # Parse CLASS_TO_CODES_RAW from the code map file
    all_codes = []
    in_section = False
    with open(CODEMAP_FILE, 'r') as f:
        for line in f:
            line_s = line.strip()
            if 'export const CLASS_TO_CODES_RAW' in line_s:
                in_section = True
                continue
            if in_section:
                if line_s == '};':
                    break
                codes = re.findall(r'"(\d{8})"', line_s)
                all_codes.extend(codes)

    # Deduplicate preserving order
    seen = set()
    deduped = []
    for c in all_codes:
        if c not in seen:
            seen.add(c)
            deduped.append(c)

    print(f"Total codes: {len(all_codes)}, unique: {len(deduped)}")

    # Generate business-class-codes.ts
    lines = ['// Business Class Codes - exact order from user data.']
    lines.append('')
    lines.append('export const BUSINESS_CLASS_CODES: string[] = [')
    for c in deduped:
        lines.append(f"  '{c}',")
    lines.append('];')
    lines.append('')

    with open(CODES_FILE, 'w') as f:
        f.write('\n'.join(lines))
    print(f"Generated {CODES_FILE}")

if __name__ == '__main__':
    main()