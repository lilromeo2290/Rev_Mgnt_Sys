import re, json

# Read descriptions from the TS file
with open('/home/z/my-project/src/lib/revenue-descriptions.ts', 'r') as f:
    content = f.read()

match = re.search(r'REVENUE_DESCRIPTIONS\s*=\s*\[(.*?)\]\s*as const', content, re.DOTALL)
descs = re.findall(r"'([^']*)'", match.group(1))
print(f'Descriptions: {len(descs)}')

# Read codes from user input
with open('/home/z/my-project/upload/codes.txt', 'r') as f:
    codes = [c.strip() for c in f.readlines() if c.strip()]
print(f'Codes: {len(codes)}')

# Prepend 1000000 for 'Revenue'
all_codes = ['1000000'] + codes
print(f'Total codes (with 1000000): {len(all_codes)}')

# Build mapping
mapping = []
for i, desc in enumerate(descs):
    code = all_codes[i] if i < len(all_codes) else ''
    mapping.append({ code: code, description: desc })

print(f'Mapping entries: {len(mapping)}')
print(f'First 3: {mapping[:3]}')
print(f'Last 3: {mapping[-3:]}')

# Generate TypeScript file
ts_lines = []
ts_lines.append('export const REVENUE_CODE_MAP: { code: string; description: string }[] = [')
for m in mapping:
    desc_escaped = m['description'].replace("'", "''")
    ts_lines.append(f"  {{ code: '{m['code']}', description: '{desc_escaped}' }},")
ts_lines.append('] as const;')

ts_lines.append('')
ts_lines.append('// Lookup maps for fast access')
ts_lines.append('export const CODE_TO_DESC: Record<string, string> = Object.fromEntries(')
ts_lines.append('  REVENUE_CODE_MAP.filter(m => m.code).map(m => [m.code, m.description])')
ts_lines.append(');')
ts_lines.append('')
ts_lines.append('export const DESC_TO_CODE: Record<string, string> = Object.fromEntries(')
ts_lines.append('  REVENUE_CODE_MAP.filter(m => m.code).map(m => [m.description, m.code])')
ts_lines.append(');')

output = '\n'.join(ts_lines)
with open('/home/z/my-project/src/lib/revenue-code-mapping.ts', 'w') as f:
    f.write(output)

print('Generated revenue-code-mapping.ts successfully!')
