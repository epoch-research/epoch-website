#!/usr/bin/env python

databaseUrl = 'https://docs.google.com/spreadsheets/d/1AAIebjNsnJj_uKALHbXNfn3_YsT6sHXtCU0q7OIPuc4/export?format=csv&gid=0'

import csv
import urllib.request
import os.path

self_path = os.path.dirname(os.path.realpath(__file__))
output_path_csv = os.path.join(self_path, '..', 'assets/bundles/trends/database.csv')
output_path_js = os.path.join(self_path, '..', 'assets/bundles/trends/database.js')

response = urllib.request.urlopen(databaseUrl)
dataset = response.read().decode('utf-8')

lines = []

reader = csv.reader(dataset.splitlines(), delimiter=',', quotechar='"')
rows = list(reader)

lines.append("var database = {")

header = rows[0]
lines.append(f"""  header: [{",".join("'" + col + "'" for col in header)}],""")

lines.append("  rows: [")
for row in rows[1:]:
    lines.append("    {")
    for colIndex in range(len(header)):
        sanitizedColumn = row[colIndex].replace("'", "\\'")
        sanitizedColumn = sanitizedColumn.replace("\n", "\\n")
        lines.append(f"""      '{header[colIndex]}': '{sanitizedColumn}',""")
    lines.append("    },")

lines.append("  ],")
lines.append("};")

with open(output_path_csv, 'w') as f:
  f.write('\n'.join(dataset))

with open(output_path_js, 'w') as f:
  f.write('\n'.join(lines))

print('Done')
