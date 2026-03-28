import subprocess
import json

output = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', 'origin/master'], text=True)
files = output.splitlines()

# Group by root folder
root_dirs = set(f.split('/')[0] for f in files if '/' in f)
root_files = set(f for f in files if '/' not in f)

data = {
    "root_dirs": list(root_dirs),
    "root_files": list(root_files),
    "sample_files": files[:20]
}

print(json.dumps(data, indent=2))
