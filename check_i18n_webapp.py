import json
import os

MESSAGES_PATH = 'messages'
BASELINE = 'en'
LOCALES = ['vi', 'ja', 'zh']


def load_keys(locale: str) -> set[str]:
    path = os.path.join(MESSAGES_PATH, f'{locale}.json')
    if not os.path.exists(path):
        print(f"[WARN] File not found: {path}")
        return set()
    with open(path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"[ERROR] Failed to parse {path}: {e}")
            return set()

    def extract_keys(obj, prefix=''):
        keys = set()
        if isinstance(obj, dict):
            for k, v in obj.items():
                full_key = f"{prefix}.{k}" if prefix else k
                keys.add(full_key)
                keys.update(extract_keys(v, full_key))
        return keys

    return extract_keys(data)


baseline_keys = load_keys(BASELINE)
print(f"Baseline [{BASELINE}]: {len(baseline_keys)} keys\n")

for locale in LOCALES:
    locale_keys = load_keys(locale)
    missing = sorted(baseline_keys - locale_keys)
    extra = sorted(locale_keys - baseline_keys)

    print(f"[{locale.upper()}] {len(locale_keys)} keys | missing: {len(missing)} | extra: {len(extra)}")

    if missing:
        print(f"  Missing in {locale} (vs en):")
        for k in missing:
            print(f"    - {k}")

    if extra:
        print(f"  Extra in {locale} (not in en):")
        for k in extra:
            print(f"    + {k}")

    print()
