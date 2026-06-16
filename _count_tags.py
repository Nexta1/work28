import re

with open('src/views/data-analysis/NetworkStatusAnalysis.vue', 'r') as f:
    lines = f.readlines()

# Find template boundaries
template_start = None
template_end = None
for i, line in enumerate(lines):
    if re.match(r'^\s*<template>', line):
        template_start = i
    if re.match(r'^\s*</template>', line):
        template_end = i

print(f"Template: lines {template_start+1} to {template_end+1}\n")

open_tags = {}
close_tags = {}
self_closing = {}

for i in range(template_start, template_end + 1):
    line = lines[i]
    line_num = i + 1
    clean = re.sub(r'<!--.*?-->', '', line)
    
    # Self-closing: <tag ... />
    for m in re.finditer(r'<([a-zA-Z][\w-]*)(\s[^>]*?)/\s*>', line):
        tag = m.group(1)
        self_closing.setdefault(tag, []).append(line_num)
    
    # Closing: </tag>
    for m in re.finditer(r'</([a-zA-Z][\w-]*)\s*>', line):
        tag = m.group(1)
        close_tags.setdefault(tag, []).append(line_num)
    
    # Opening: <tag ...> but NOT </tag> and NOT <tag .../>
    for m in re.finditer(r'<([a-zA-Z][\w-]*)((?:\s[^>]*?)?)>', clean):
        tag = m.group(1)
        full = m.group(0)
        if full.startswith('</'):
            continue
        if full.rstrip().endswith('/>'):
            continue
        open_tags.setdefault(tag, []).append(line_num)

print("=== ALL TAG COUNTS ===")
all_tags = set(list(open_tags.keys()) + list(close_tags.keys()) + list(self_closing.keys()))
for tag in sorted(all_tags):
    opens = len(open_tags.get(tag, []))
    closes = len(close_tags.get(tag, []))
    sc = len(self_closing.get(tag, []))
    net = opens - closes
    if net != 0:
        print(f"  <{tag}>: {opens} opens vs {closes} closes (self-closing: {sc}) -> MISMATCH ({net:+d})")
        if opens > closes:
            print(f"    Open lines: {open_tags[tag]}")
            print(f"    Close lines: {close_tags.get(tag, [])}")
        else:
            print(f"    Close lines: {close_tags[tag]}")
            print(f"    Open lines: {open_tags.get(tag, [])}")
    else:
        print(f"  <{tag}>: {opens} opens vs {closes} closes (self-closing: {sc}) -> OK")

print("\n=== DETAILED DIV ANALYSIS ===")
for i in range(template_start, template_end + 1):
    line = lines[i]
    line_num = i + 1
    clean = re.sub(r'<!--.*?-->', '', line)
    opens = list(re.finditer(r'<div(\s[^>]*?)?>', clean))
    closes = list(re.finditer(r'</div\s*>', clean))
    self_c = list(re.finditer(r'<div(\s[^>]*?)/\s*>', clean))
    if opens:
        for m in opens:
            print(f"  Line {line_num}: OPEN <div> {m.group(0)}")
    if self_c:
        for m in self_c:
            print(f"  Line {line_num}: SELF-CLOSE <div/> {m.group(0)}")
    if closes:
        for m in closes:
            print(f"  Line {line_num}: CLOSE </div> {m.group(0)}")
