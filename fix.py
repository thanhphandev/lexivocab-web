import sys

filepath = r'e:\lexivocab-ex\lexivocab-webapp\app\[locale]\(admin)\admin\audit-logs\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
imports = """import { AUDIT_ACTIONS, ACTION_CONFIG, PAGE_SIZE_OPTIONS } from "./_components/constants";
import { formatDuration, getDurationColor } from "./_components/helpers";
import { ActionBadge, StatusIndicator, SkeletonRow, DetailDialog } from "./_components/audit-log-components";

"""

in_removal = False
for i, line in enumerate(lines):
    if line.startswith('// ─── Constants'):
        in_removal = True
        new_lines.append(imports)
    
    if line.startswith('// ─── Main Page'):
        in_removal = False
        
    if not in_removal:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("done")
