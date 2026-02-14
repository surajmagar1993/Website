import json
import re

def extract_array(content, array_name):
    # Regex to find the array definition
    pattern = rf'export const {array_name}: .*? = \[(.*?)\];'
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return []
    
    array_content = match.group(1)
    # This is a very rough JS object to JSON conversion
    # In a real scenario, we might use a JS parser, but for this structure,
    # we can do some replacements.
    
    # 1. Replace multi-line strings
    array_content = re.sub(r'`(.*?)`', lambda m: json.dumps(m.group(1).strip()), array_content, flags=re.DOTALL)
    
    # 2. Fix trailing commas (optional for json.loads but good for hygiene)
    # array_content = re.sub(r',\s*\]', ']', array_content)
    # array_content = re.sub(r',\s*\}', '}', array_content)
    
    # Note: Hand-converting the specific structure of services-data.ts
    # Since it's valid JS/TS, but not strictly JSON (quotes on keys etc)
    # I'll manually parse the objects since they are predictably formatted.
    
    return array_content

# Read the file
with open('src/lib/services-data.ts', 'r') as f:
    content = f.read()

services_str = extract_array(content, 'services')
case_studies_str = extract_array(content, 'caseStudies')

# Helper to escape single quotes for SQL
def sql_val(val):
    if isinstance(val, (dict, list)):
        return f"'{json.dumps(val).replace(\"'\", \"''\")}'::jsonb"
    if val is None:
        return "NULL"
    return f"'{str(val).replace(\"'\", \"''\")}'"

# For this specific task, I'll just write the SQL manually or use a more robust regex
# because the TS objects are not valid JSON (no quotes on keys).

def parse_ts_to_sql_services(content):
    # Split into individual objects
    objs = re.split(r'\s*\{\s*slug:', content)[1:]
    inserts = []
    for i, obj in enumerate(objs):
        slug_match = re.search(r'^ "(.*?)"', obj) # matches: slug: "..."
        title_match = re.search(r'title: "(.*?)"', obj)
        subtitle_match = re.search(r'subtitle: "(.*?)"', obj)
        icon_match = re.search(r'icon: "(.*?)"', obj)
        desc_match = re.search(r'description:\s+"(.*?)"', obj, re.DOTALL)
        
        # Features
        features_match = re.search(r'features: \[(.*?)\]', obj, re.DOTALL)
        features = [f.strip().strip('"') for f in features_match.group(1).split(',')] if features_match else []
        
        # Tech
        tech_match = re.search(r'technologies: \[(.*?)\]', obj, re.DOTALL)
        tech = [t.strip().strip('"') for t in tech_match.group(1).split(',')] if tech_match else []
        
        # Since the structure is complex and multi-line, manual extraction is risky.
        # I'll go back to providing the SQL manually after carefully reading the file.
    return ""

print("Manual extraction preferred for accuracy due to non-JSON format.")
