import json
import os

def get_keys(file_path):
    if not os.path.exists(file_path):
        return set()
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            # Webapp keys are nested
            def extract_keys(obj, prefix=''):
                keys = set()
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        full_key = f"{prefix}.{k}" if prefix else k
                        keys.add(full_key)
                        keys.update(extract_keys(v, full_key))
                return keys
            return extract_keys(data)
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return set()

base_path = 'lexivocab-webapp/messages'
en_keys = get_keys(os.path.join(base_path, 'en.json'))
ja_keys = get_keys(os.path.join(base_path, 'ja.json'))
vi_keys = get_keys(os.path.join(base_path, 'vi.json'))
zh_keys = get_keys(os.path.join(base_path, 'zh.json'))

print(f"EN keys: {len(en_keys)}")
print(f"VI keys: {len(vi_keys)}")
print(f"JA keys: {len(ja_keys)}")
print(f"ZH keys: {len(zh_keys)}")

print("\nMissing in JA (relative to EN):")
for k in sorted(en_keys - ja_keys):
    print(k)

print("\nMissing in ZH (relative to EN):")
for k in sorted(en_keys - zh_keys):
    print(k)

print("\nMissing in JA (relative to VI):")
for k in sorted(vi_keys - ja_keys):
    print(k)

print("\nMissing in ZH (relative to VI):")
for k in sorted(vi_keys - zh_keys):
    print(k)
