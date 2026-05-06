export interface SysadminCommand {
  command: string;
  category: string;
  description: string;
}

export interface BestPractice {
  tip: string;
  example?: string;
}

export const SYSADMIN_COMMANDS: SysadminCommand[] = [
  // Process Management
  { command: 'ps', category: 'Processes', description: 'Report process status' },
  { command: 'top', category: 'Processes', description: 'Display running processes interactively' },
  { command: 'htop', category: 'Processes', description: 'Interactive process viewer' },
  { command: 'kill', category: 'Processes', description: 'Terminate a process by PID' },
  { command: 'killall', category: 'Processes', description: 'Kill processes by name' },
  { command: 'nice', category: 'Processes', description: 'Run a command with modified scheduling priority' },
  // Disk & Storage
  { command: 'df', category: 'Disk', description: 'Report disk space usage' },
  { command: 'du', category: 'Disk', description: 'Estimate file space usage' },
  { command: 'lsblk', category: 'Disk', description: 'List block devices' },
  { command: 'fdisk', category: 'Disk', description: 'Manipulate disk partition table' },
  { command: 'mount', category: 'Disk', description: 'Mount a filesystem' },
  { command: 'umount', category: 'Disk', description: 'Unmount a filesystem' },
  // Networking
  { command: 'ip', category: 'Network', description: 'Show/manipulate routing, devices, policy routing' },
  { command: 'ss', category: 'Network', description: 'Investigate sockets' },
  { command: 'netstat', category: 'Network', description: 'Network statistics' },
  { command: 'ping', category: 'Network', description: 'Send ICMP echo requests' },
  { command: 'curl', category: 'Network', description: 'Transfer data from or to a server' },
  { command: 'wget', category: 'Network', description: 'Non-interactive network downloader' },
  { command: 'ssh', category: 'Network', description: 'Secure shell remote login' },
  { command: 'scp', category: 'Network', description: 'Secure copy over SSH' },
  { command: 'rsync', category: 'Network', description: 'Remote file sync and transfer' },
  // Users & Permissions
  { command: 'chmod', category: 'Permissions', description: 'Change file permissions' },
  { command: 'chown', category: 'Permissions', description: 'Change file owner and group' },
  { command: 'useradd', category: 'Users', description: 'Create a new user' },
  { command: 'usermod', category: 'Users', description: 'Modify a user account' },
  { command: 'passwd', category: 'Users', description: 'Change user password' },
  { command: 'sudo', category: 'Users', description: 'Execute a command as another user' },
  // Services & Systemd
  { command: 'systemctl', category: 'Services', description: 'Control systemd services' },
  { command: 'journalctl', category: 'Services', description: 'Query the systemd journal' },
  { command: 'cron', category: 'Services', description: 'Daemon to execute scheduled commands' },
  { command: 'crontab', category: 'Services', description: 'Schedule periodic tasks' },
  // Logs & Monitoring
  { command: 'tail', category: 'Logs', description: 'Output the last part of files' },
  { command: 'grep', category: 'Logs', description: 'Search text using patterns' },
  { command: 'awk', category: 'Logs', description: 'Pattern scanning and processing' },
  { command: 'sed', category: 'Logs', description: 'Stream editor for filtering and transforming text' },
  // Archives & Files
  { command: 'tar', category: 'Archives', description: 'Archive files' },
  { command: 'find', category: 'Files', description: 'Search for files in a directory hierarchy' },
  { command: 'ln', category: 'Files', description: 'Make links between files' },
  { command: 'rsync', category: 'Files', description: 'Sync files locally or remotely' },
];

export const BEST_PRACTICES: Record<string, BestPractice[]> = {
  ls: [
    { tip: 'Use `-la` to see all files including hidden ones with permissions and sizes', example: 'ls -la /etc' },
    { tip: 'Sort by modification time (newest first) with `-lt`', example: 'ls -lt /var/log' },
    { tip: 'Use `-lh` for human-readable file sizes (KB, MB, GB)', example: 'ls -lh /var/log' },
    { tip: 'Combine `-R` to list directories recursively — pipe to less for large trees', example: 'ls -lR /etc | less' },
    { tip: 'Use `ls -d */` to list only directories in the current path', example: 'ls -d */' },
  ],
  ps: [
    { tip: 'Use `ps aux` to see all running processes with full detail', example: 'ps aux | grep nginx' },
    { tip: 'Combine with grep to search for a specific process', example: 'ps aux | grep -v grep | grep python' },
    { tip: 'Use `ps -ef --forest` to show process tree hierarchy', example: 'ps -ef --forest' },
  ],
  top: [
    { tip: 'Press `M` to sort by memory usage, `P` for CPU usage' },
    { tip: 'Press `k` to kill a process by PID without leaving top' },
    { tip: 'Use `top -b -n 1` for a single snapshot output to a file', example: 'top -b -n 1 > snapshot.txt' },
  ],
  htop: [
    { tip: 'Use F5 to toggle tree view of processes' },
    { tip: 'Press F9 to send signals (kill, stop, etc.) to selected process' },
    { tip: 'Filter with F4 to search for a process by name' },
  ],
  kill: [
    { tip: 'Always try SIGTERM (15) before SIGKILL (9)', example: 'kill -15 <pid>  # graceful, then kill -9 <pid> if needed' },
    { tip: 'Use `kill -l` to list all available signal names' },
    { tip: 'Prefer `pkill` or `killall` when targeting by process name' },
  ],
  df: [
    { tip: 'Always use `-h` for human-readable sizes', example: 'df -h' },
    { tip: 'Check inode usage too (full inodes = no space for new files)', example: 'df -i' },
    { tip: 'Use `df -T` to include the filesystem type in the output', example: 'df -hT' },
  ],
  du: [
    { tip: 'Use `-sh` to get the total size of a directory', example: 'du -sh /var/log' },
    { tip: 'Find the top 10 largest directories', example: 'du -h --max-depth=1 / | sort -rh | head -10' },
    { tip: 'Exclude certain filesystems with `--exclude`', example: 'du -sh --exclude=proc /' },
  ],
  chmod: [
    { tip: 'Never use 777 on production files — it grants world-write access', example: 'chmod 644 file  # owner rw, others read-only' },
    { tip: 'Use octal notation for precision: 644=files, 755=directories' },
    { tip: 'Use `-R` carefully to recurse — prefer targeted changes', example: 'find /var/www -type f -exec chmod 644 {} \\;' },
  ],
  chown: [
    { tip: 'Use `chown user:group` to set both owner and group at once', example: 'chown www-data:www-data /var/www/html' },
    { tip: 'Use `-R` with care — always double-check the target path first' },
    { tip: 'Verify ownership after changes with `ls -la`', example: 'ls -la /var/www/html' },
  ],
  ssh: [
    { tip: 'Use SSH keys instead of passwords — disable password auth in sshd_config' },
    { tip: 'Use `-i` to specify a private key explicitly', example: 'ssh -i ~/.ssh/id_rsa user@host' },
    { tip: 'Use `~/.ssh/config` to set per-host aliases and options' },
    { tip: 'Always restrict SSH to non-root users and use `sudo` on the remote' },
  ],
  scp: [
    { tip: 'Use rsync instead of scp for large transfers — it supports resume', example: 'rsync -avz -e ssh file user@host:/path' },
    { tip: 'Use `-r` to copy directories recursively', example: 'scp -r ./dir user@host:/remote/path' },
  ],
  rsync: [
    { tip: 'Use `--dry-run` (`-n`) to preview changes before running', example: 'rsync -avzn source/ dest/' },
    { tip: 'Use `--delete` to mirror exactly (removes files not in source)', example: 'rsync -avz --delete source/ dest/' },
    { tip: 'Use `-e ssh` for remote transfers and `--progress` for large files', example: 'rsync -avz --progress -e ssh ./dir user@host:/path' },
  ],
  tar: [
    { tip: 'Use `-czf` to create a gzip archive, `-xzf` to extract', example: 'tar -czf backup.tar.gz /etc' },
    { tip: 'List archive contents without extracting with `-tzf`', example: 'tar -tzf backup.tar.gz' },
    { tip: 'Extract to a specific directory with `-C`', example: 'tar -xzf backup.tar.gz -C /tmp' },
    { tip: 'Exclude paths using `--exclude`', example: 'tar -czf site.tar.gz /var/www --exclude=*.log' },
  ],
  systemctl: [
    { tip: 'Use `systemctl status <service>` to check health before restarting' },
    { tip: 'Always enable a service if it should survive reboots', example: 'systemctl enable --now nginx' },
    { tip: 'Use `systemctl daemon-reload` after editing unit files' },
    { tip: 'Check for failed services system-wide', example: 'systemctl --failed' },
  ],
  journalctl: [
    { tip: 'Filter by service with `-u`', example: 'journalctl -u nginx --since "1 hour ago"' },
    { tip: 'Follow live logs with `-f` (like tail -f)', example: 'journalctl -f -u sshd' },
    { tip: 'Filter by priority: err, warning, info', example: 'journalctl -p err -b' },
  ],
  grep: [
    { tip: 'Use `-r` to search recursively through directories', example: 'grep -r "error" /var/log/' },
    { tip: 'Use `-i` for case-insensitive search', example: 'grep -i "failed" /var/log/auth.log' },
    { tip: 'Use `-v` to exclude lines matching a pattern', example: 'grep -v "^#" /etc/ssh/sshd_config' },
    { tip: 'Show line numbers with `-n` and context with `-A/-B/-C`', example: 'grep -n -A 2 "error" app.log' },
  ],
  find: [
    { tip: 'Always test with `-print` before using `-exec rm`', example: 'find /tmp -name "*.log" -mtime +7 -print' },
    { tip: 'Limit depth with `-maxdepth` to avoid traversing the whole tree', example: 'find /var -maxdepth 2 -name "*.conf"' },
    { tip: 'Find large files eating disk space', example: 'find / -type f -size +100M -exec ls -lh {} \\;' },
  ],
  sudo: [
    { tip: 'Use `sudo -l` to list your allowed sudo commands' },
    { tip: 'Avoid `sudo su` — use `sudo -i` or `sudo -s` for a root shell instead' },
    { tip: 'Edit sudoers only with `visudo` — never directly edit /etc/sudoers' },
    { tip: 'Log all sudo usage — check `/var/log/auth.log` or `journalctl`' },
  ],
  crontab: [
    { tip: 'Always redirect stdout and stderr in cron jobs', example: '0 2 * * * /script.sh >> /var/log/script.log 2>&1' },
    { tip: 'Use full paths in cron — PATH is minimal in cron environment' },
    { tip: 'Test the cron environment with `env > /tmp/cron-env` in a test job' },
    { tip: 'Use `crontab -l` to list and `crontab -e` to edit' },
  ],
  ip: [
    { tip: 'Use `ip a` (short for `ip addr`) to see all interface addresses' },
    { tip: 'Use `ip r` to view the routing table', example: 'ip r show' },
    { tip: 'Bring an interface up/down', example: 'ip link set eth0 up' },
  ],
  ss: [
    { tip: 'Use `ss -tulpn` to list all listening TCP/UDP ports with PIDs', example: 'ss -tulpn' },
    { tip: 'Filter by port or state', example: 'ss -tnp state established' },
    { tip: 'Replaces netstat — faster and more detailed on modern Linux' },
  ],
  tail: [
    { tip: 'Use `-f` to follow a log file in real time', example: 'tail -f /var/log/syslog' },
    { tip: 'Combine with grep to filter live output', example: 'tail -f /var/log/nginx/error.log | grep "500"' },
    { tip: 'Use `-n` to control how many lines to show', example: 'tail -n 100 /var/log/auth.log' },
  ],
  sed: [
    { tip: 'Use `-i` for in-place file editing (add `.bak` for backup)', example: 'sed -i.bak "s/old/new/g" file.conf' },
    { tip: 'Delete lines matching a pattern', example: 'sed -i "/^#/d" file.conf  # removes comment lines' },
    { tip: 'Always test without `-i` first to preview changes', example: 'sed "s/old/new/g" file.conf' },
  ],
  awk: [
    { tip: 'Print a specific column from output', example: 'df -h | awk \'{print $1, $5}\'' },
    { tip: 'Filter rows by a condition', example: 'awk \'$3 > 100\' access.log' },
    { tip: 'Sum a column of numbers', example: 'awk \'{sum += $1} END {print sum}\' file' },
  ],
  ping: [
    { tip: 'Use `-c` to limit the number of pings', example: 'ping -c 4 8.8.8.8' },
    { tip: 'Use `-i` to set interval between pings (default 1s)', example: 'ping -i 0.2 host' },
    { tip: 'Use `ping6` for IPv6 targets' },
  ],
  curl: [
    { tip: 'Use `-I` to fetch only response headers', example: 'curl -I https://example.com' },
    { tip: 'Use `-o` to save output to a file', example: 'curl -o file.zip https://example.com/file.zip' },
    { tip: 'Use `-L` to follow redirects', example: 'curl -L https://example.com' },
    { tip: 'Test an API endpoint with JSON', example: 'curl -X POST -H "Content-Type: application/json" -d \'{"key":"val"}\' https://api/endpoint' },
  ],
  useradd: [
    { tip: 'Use `-m` to create a home directory', example: 'useradd -m -s /bin/bash newuser' },
    { tip: 'Use `-G` to add user to supplementary groups', example: 'useradd -m -G sudo,docker newuser' },
    { tip: 'Set password immediately after creating the user', example: 'passwd newuser' },
  ],
  passwd: [
    { tip: 'Enforce password policies in `/etc/security/pwquality.conf`' },
    { tip: 'Lock an account with `-l`, unlock with `-u`', example: 'passwd -l username' },
    { tip: 'Check password expiry with `chage -l username`' },
  ],
  mount: [
    { tip: 'Check currently mounted filesystems with `mount` or `findmnt`' },
    { tip: 'Add to `/etc/fstab` for persistent mounts across reboots' },
    { tip: 'Use `mount -o remount,ro /mountpoint` to remount read-only without unmounting' },
  ],
  lsblk: [
    { tip: 'Use `lsblk -f` to show filesystem types and UUIDs', example: 'lsblk -f' },
    { tip: 'Use `lsblk -o NAME,SIZE,TYPE,MOUNTPOINT` for a clean view', example: 'lsblk -o NAME,SIZE,TYPE,MOUNTPOINT' },
  ],
};
