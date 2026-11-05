// Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
// SPDX-License-Identifier: Apache-2.0
// Starts EffectHouse AI from its runtime, where all its other code lives. With no runtime on this machine yet, fetches the pinned one, checks its SHA-256 and has it fetch the engine: in the foreground as the `setup` task, which ends with READY or FAILED, else in the background while answering as a one-tool MCP server reporting how that goes.
import {spawn, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {createInterface} from 'node:readline';
import {fileURLToPath, pathToFileURL} from 'node:url';

const self = fileURLToPath(import.meta.url), root = join(self, '../..');
const task = process.argv[2] ?? process.env.EHAI_START_TASK;
if (!/^(?:setup|(?:scripts|hooks)\/[\w-]+\.mjs)$/.test(task)) throw new Error(`start.mjs: unknown task ${task}`);
const pinned = name => JSON.parse(readFileSync(join(root, `runtime/${name}.json`), 'utf8'))[`${name}s`]?.[`${process.platform}-${process.arch}`];
const pin = pinned('runtime'), engine = pinned('engine');
const home = process.env.EHAI_HOME ?? join(homedir(), '.ehai'), base = join(home, 'runtime'), failed = join(base, '.fetch-failed');
const shell = version => join(base, version, 'lib/node_modules/ehai/shell');
const code = [pin?.version, 'current'].filter(Boolean).map(version => shell(version)).find(dir => existsSync(join(dir, task)));   // only a runtime holding the task: a hook a newer plugin names and an older runtime lacks is skipped
const ready = () => Boolean(pin && engine && existsSync(join(base, pin.version)) && existsSync(join(home, 'engines', engine.sha256.slice(0, 12))));
// The system's own curl and tar, never what comes first on PATH: a Git Bash tar on Windows reads C: as a remote host
const tool = name => process.platform === 'win32' ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', `${name}.exe`) : `/usr/bin/${name}`;
const run = (name, args) => spawnSync(tool(name), args, {stdio: 'ignore', windowsHide: true}).status === 0;
const drop = dir => { try { rmSync(dir, {recursive: true, force: true, maxRetries: 3, retryDelay: 200}); } catch { /* an antivirus holds it */ } };

async function fetchRuntime() {
  let work;
  try {
    mkdirSync(base, {recursive: true});
    rmSync(failed, {force: true});
    if (!existsSync(join(base, pin.version))) {   // a run after the engine failed keeps the runtime it has
      work = mkdtempSync(join(base, '.fetch-'));
      const archive = join(work, 'runtime.tgz'), verified = file => import(pathToFileURL(join(work, 'package/shell/scripts', file)));
      if (!run('curl', ['-fsSL', '--proto-redir', '=https', '--retry', '3', '--connect-timeout', '30', '--speed-limit', '1024', '--speed-time', '120', '--max-filesize', String(pin.bytes), '-o', archive, pin.urls[0]])) throw new Error('no download');
      if (createHash('sha256').update(readFileSync(archive)).digest('hex') !== pin.sha256) throw new Error('wrong checksum');
      if (!run('tar', ['-xzf', archive, '-C', work, 'package/shell'])) throw new Error('cannot unpack');
      const {checkListing, listArchive} = await verified('archive-check.mjs');
      checkListing(await listArchive(archive, 'tgz'), {links: 'contained'});
      await (await verified('runtime-install.mjs')).installRuntime(base, pin.version, archive);
      drop(work);
    }
    // The engine too, so that the next conversation has its tools at once. A host may list a server's tools only once.
    const scripts = join(shell(pin.version), 'scripts');
    const {nodeCaArgs} = await import(pathToFileURL(join(scripts, 'node-ca.mjs')));
    process.env.EHAI_PUBLIC_PLUGIN_ROOT = root;
    const built = spawnSync(process.execPath, [...nodeCaArgs(), join(scripts, 'setup-engine.mjs')], {stdio: ['ignore', 'inherit', 'pipe'], windowsHide: true, encoding: 'utf8'});
    if (built.status !== 0) throw new Error(`engine: ${(process.stderr.write(built.stderr ?? ''), (built.stderr ?? '').trim().split('\n').pop() || 'it stopped')}`);
  } catch (error) { writeFileSync(failed, error.message.slice(0, 200)); } finally { if (work) drop(work); }
}
let ended = false;
const status = () => !pin || !engine ? 'EffectHouse AI does not support this computer (it needs Apple silicon or Windows x64).'
  : ready() ? 'EffectHouse AI is ready. Tell the user to start a new conversation.'
  : ended || existsSync(failed) ? `The download failed (${existsSync(failed) ? readFileSync(failed, 'utf8') : 'it stopped'}). Tell the user to check the network and free disk space, then start a new conversation to retry.`
  : 'EffectHouse AI is downloading about 600 MB, once. This can take a few minutes. Tell the user, and call this tool again in 30 seconds.';
const answers = {
  initialize: {protocolVersion: '2025-06-18', capabilities: {tools: {}}, serverInfo: {name: 'ehai', version: pin?.version ?? '0'}},
  'tools/list': {tools: [{name: 'ehai_installing', description: 'EffectHouse AI is setting up for the first time. Call this for how that is going and what to tell the user.', inputSchema: {type: 'object'}, annotations: {readOnlyHint: true}}]},
};
if (task === 'setup') {   // the install prompt's last step, and the background child's work
  if (pin && engine && !ready()) await fetchRuntime();
  process.exitCode = ready() ? 0 : 1;
  console.log(ready() ? 'READY: EffectHouse AI is set up. Its tools are there in a new conversation.' : `FAILED: ${status().replace('Tell the user to check', 'Check').replace('start a new conversation to retry', 'run setup again')}`);
} else if (code) {
  const entry = realpathSync(join(code, task));
  process.env.EHAI_PUBLIC_PLUGIN_ROOT = root;
  process.argv.splice(1, 2, entry);
  await import(pathToFileURL(entry));
} else if (!task.startsWith('hooks/')) {
  if (pin && engine && task === 'scripts/bootstrap.mjs') spawn(process.execPath, [self, 'setup'], {detached: true, stdio: 'ignore', windowsHide: true}).on('close', () => { ended = true; }).unref();
  createInterface({input: process.stdin}).on('line', line => {
    const {id, method} = JSON.parse(line);
    const result = answers[method] ?? (method === 'tools/call' ? {content: [{type: 'text', text: status()}]} : {});
    if (id !== undefined) console.log(JSON.stringify({jsonrpc: '2.0', id, result}));
  });
}
