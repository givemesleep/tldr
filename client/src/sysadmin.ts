export interface SysadminCommand {
  command: string;
  category: string;
  description: string;
}

export const SYSADMIN_COMMANDS: SysadminCommand[] = [
  // Process Management
  { command: 'ps',         category: 'Processes',   description: 'Report process status' },
  { command: 'top',        category: 'Processes',   description: 'Display running processes interactively' },
  { command: 'htop',       category: 'Processes',   description: 'Interactive process viewer' },
  { command: 'kill',       category: 'Processes',   description: 'Terminate a process by PID' },
  { command: 'killall',    category: 'Processes',   description: 'Kill processes by name' },
  { command: 'nice',       category: 'Processes',   description: 'Run a command with modified scheduling priority' },
  // Disk & Storage
  { command: 'df',         category: 'Disk',        description: 'Report disk space usage' },
  { command: 'du',         category: 'Disk',        description: 'Estimate file space usage' },
  { command: 'lsblk',      category: 'Disk',        description: 'List block devices' },
  { command: 'fdisk',      category: 'Disk',        description: 'Manipulate disk partition table' },
  { command: 'mount',      category: 'Disk',        description: 'Mount a filesystem' },
  { command: 'umount',     category: 'Disk',        description: 'Unmount a filesystem' },
  // Networking
  { command: 'ip',         category: 'Network',     description: 'Show/manipulate routing, devices, policy routing' },
  { command: 'ss',         category: 'Network',     description: 'Investigate sockets' },
  { command: 'netstat',    category: 'Network',     description: 'Network statistics' },
  { command: 'ping',       category: 'Network',     description: 'Send ICMP echo requests' },
  { command: 'curl',       category: 'Network',     description: 'Transfer data from or to a server' },
  { command: 'wget',       category: 'Network',     description: 'Non-interactive network downloader' },
  { command: 'ssh',        category: 'Network',     description: 'Secure shell remote login' },
  { command: 'scp',        category: 'Network',     description: 'Secure copy over SSH' },
  { command: 'rsync',      category: 'Network',     description: 'Remote file sync and transfer' },
  // Users & Permissions
  { command: 'chmod',      category: 'Permissions', description: 'Change file permissions' },
  { command: 'chown',      category: 'Permissions', description: 'Change file owner and group' },
  { command: 'useradd',    category: 'Users',       description: 'Create a new user' },
  { command: 'usermod',    category: 'Users',       description: 'Modify a user account' },
  { command: 'passwd',     category: 'Users',       description: 'Change user password' },
  { command: 'sudo',       category: 'Users',       description: 'Execute a command as another user' },
  // Services & Systemd
  { command: 'systemctl',  category: 'Services',    description: 'Control systemd services' },
  { command: 'journalctl', category: 'Services',    description: 'Query the systemd journal' },
  { command: 'crontab',    category: 'Services',    description: 'Schedule periodic tasks' },
  // Files
  { command: 'ls',         category: 'Files',       description: 'List directory contents' },
  { command: 'find',       category: 'Files',       description: 'Search for files in a directory hierarchy' },
  { command: 'ln',         category: 'Files',       description: 'Make links between files' },
  // Archives
  { command: 'tar',        category: 'Archives',    description: 'Archive files' },
  // Logs & Monitoring
  { command: 'tail',       category: 'Logs',        description: 'Output the last part of files' },
  { command: 'grep',       category: 'Logs',        description: 'Search text using patterns' },
  { command: 'awk',        category: 'Logs',        description: 'Pattern scanning and processing' },
  { command: 'sed',        category: 'Logs',        description: 'Stream editor for filtering and transforming text' },
];

export const GROUPED: Record<string, SysadminCommand[]> = {};
for (const c of SYSADMIN_COMMANDS) {
  if (!GROUPED[c.category]) GROUPED[c.category] = [];
  GROUPED[c.category].push(c);
}
