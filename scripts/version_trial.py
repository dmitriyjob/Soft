"""Version the complete trial module graph, so cached releases cannot mix.
Run after changing trial sources and commit the updated URLs with the changes.
"""
from pathlib import Path
import hashlib
import re
root = Path(__file__).resolve().parents[1] / 'lessons/trial'
files = sorted((root / 'imported').glob('*.js')) + sorted((root / 'imported').glob('*.css')) + [root / 'index.html']
def clean(text):
    return re.sub(r'\?v=[a-f0-9]+', '', text)
contents = {path: clean(path.read_text()) for path in files}
hash_input = ''.join(path.name + contents[path] for path in files).encode()
version = hashlib.sha256(hash_input + (root / 'LIZ04641-retouched.jpg').read_bytes()).hexdigest()[:12]
for path, text in contents.items():
    if path.suffix == '.js':
        text = re.sub(r"(['\"])(\./[^'\"]+\.js)\1", lambda m: m[1] + m[2] + '?v=' + version + m[1], text)
        text = text.replace('LIZ04641-retouched.jpg"', 'LIZ04641-retouched.jpg?v=' + version + '"')
    elif path.name == 'index.html':
        text = re.sub(r'(imported/[^" ]+\.(?:js|css))"', lambda m: m[1] + '?v=' + version + '"', text)
    path.write_text(text)
print(version)
