import os
import shutil
import subprocess

os.chdir('e:/devshouse')

# Ensure we are on main
subprocess.run(['git', 'checkout', 'main'], check=True)

# Remove old frontend
frontend_dir = 'e:/devshouse/frontend'
if os.path.exists(frontend_dir):
    # Ensure no process is holding it
    shutil.rmtree(frontend_dir, ignore_errors=True)

os.makedirs(frontend_dir, exist_ok=True)

# Clone master branch temporarily
temp_dir = 'e:/devshouse_temp_master'
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir, ignore_errors=True)
subprocess.run(['git', 'clone', 'https://github.com/shreyashree0207/devshouse.git', '-b', 'master', temp_dir], check=True)

# Move contents to frontend folder
for item in os.listdir(temp_dir):
    if item == '.git':
        continue
    s = os.path.join(temp_dir, item)
    d = os.path.join(frontend_dir, item)
    if os.path.isdir(s):
        shutil.copytree(s, d, dirs_exist_ok=True)
    else:
        shutil.copy2(s, d)

# Cleanup
shutil.rmtree(temp_dir, ignore_errors=True)

# Install npm dependencies
subprocess.run(['npm', 'install'], cwd=frontend_dir, shell=True)

# Git commit the changes
subprocess.run(['git', 'add', 'frontend'])
subprocess.run(['git', 'commit', '-m', "Pulled friend's new frontend from master into frontend directory"])

print("Frontend sync successful!")
