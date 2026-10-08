#!/usr/bin/env node
/**
 * Frees the app's ports before a restart.
 *
 * `nest start --watch` spawns `node dist/main` as a CHILD process. Killing the
 * watcher (Ctrl-C in a detached shell, or `pkill -f "nest.js start"`) can leave
 * that child alive and still holding port 3000. The next start then fails to
 * bind — and because the extra admin/superuser listeners swallow their bind
 * errors, the symptom is silent: requests keep being served by the OLD build.
 * That looks exactly like "my code change isn't working".
 *
 * Run this before starting, or use `npm run restart`.
 */
const { execSync } = require('child_process');

const ports = [
  Number(process.env.PORT ?? 3000),
  Number(process.env.ADMIN_PORT ?? 3001),
  Number(process.env.SUPERUSER_PORT ?? 3002),
];

let killed = 0;
for (const port of ports) {
  let pids = [];
  try {
    pids = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .split('\n')
      .map((pid) => pid.trim())
      .filter(Boolean);
  } catch {
    // lsof exits non-zero when nothing is listening — that's the happy path.
  }

  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGKILL');
      console.log(`  ✖ killed pid ${pid} holding port ${port}`);
      killed++;
    } catch (err) {
      console.warn(`  ! could not kill pid ${pid} on port ${port}: ${err.message}`);
    }
  }
}

console.log(killed === 0 ? '✓ ports already free' : `✓ freed ${killed} stale process(es)`);
