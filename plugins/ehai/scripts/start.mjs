// Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
// SPDX-License-Identifier: Apache-2.0
// Runs a task from the runtime, where the plugin's code lives. With no runtime yet, starts the setup in the background and answers as a one-tool MCP server saying how that goes.
import {spawn} from 'node:child_process';
import {existsSync, readFileSync, realpathSync, rmSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {createInterface} from 'node:readline';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = join(fileURLToPath(import.meta.url), '../..'), task = process.argv[2], win32 = process.platform === 'win32';
if (!/^(?:scripts|hooks)\/[\w-]+\.mjs$/.test(task)) throw new Error(`start.mjs: unknown task ${task}`);
const pinned = name => JSON.parse(readFileSync(join(root, `runtime/${name}.json`), 'utf8'))[`${name}s`]?.[`${process.platform}-${process.arch}`];
const pin = pinned('runtime'), engine = pinned('engine');
const home = process.env.EHAI_HOME ?? join(homedir(), '.ehai'), failed = join(home, 'runtime/.fetch-failed');
const runtime = version => join(home, 'runtime', version, 'lib/node_modules/ehai');
const code = [pin?.version, 'current'].filter(Boolean).map(version => join(runtime(version), 'shell')).find(dir => existsSync(join(dir, task)));   // only a runtime holding the task: a hook a newer plugin names and an older runtime lacks is skipped
if (code) {
  const entry = realpathSync(join(code, task));
  process.env.EHAI_PUBLIC_PLUGIN_ROOT = root;
  process.argv.splice(1, 2, entry);
  await import(pathToFileURL(entry));
} else if (!task.startsWith('hooks/')) {
  let ended = false;
  if (pin && engine && task === 'scripts/bootstrap.mjs') {
    rmSync(failed, {force: true});
    const relay = 'require("child_process").spawn(process.argv[1], process.argv.slice(2), {stdio: "ignore", windowsHide: true}).on("error", () => process.exit(1)).on("close", code => process.exit(code ?? 1))';   // Windows PowerShell exits at once without a console, which a detached child lacks: the detached process is this node relay, and PowerShell gets a hidden console of its own
    const setup = win32 ? [process.execPath, ['-e', relay, join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/WindowsPowerShell/v1.0/powershell.exe'), '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(root, 'scripts/setup.ps1')]] : ['/bin/sh', [join(root, 'scripts/setup.sh')]];
    spawn(...setup, {detached: true, stdio: 'ignore', windowsHide: true}).on('error', () => { ended = true; }).on('close', () => { ended = true; }).unref();
  }
  const status = () => !pin || !engine ? 'EffectHouse AI does not support this computer (it needs a Mac or Windows x64).'
    : existsSync(join(runtime(pin.version), 'bin', win32 ? 'node.exe' : 'node')) && existsSync(join(home, 'engines', engine.sha256.slice(0, 12))) ? 'EffectHouse AI is ready. Tell the user to start a new conversation.'
    : ended || existsSync(failed) ? `The download failed (${existsSync(failed) ? readFileSync(failed, 'utf8') : 'it stopped'}). Tell the user to check the network and free disk space, then start a new conversation to retry.`
    : 'EffectHouse AI is downloading about 600 MB, once. This can take a few minutes. Tell the user, and call this tool again in 30 seconds.';
  const answers = {
    initialize: {protocolVersion: '2025-06-18', capabilities: {tools: {}}, serverInfo: {name: 'ehai', version: pin?.version ?? '0'}},
    'tools/list': {tools: [{name: 'ehai_installing', description: 'EffectHouse AI is setting up for the first time. Call this for how that is going and what to tell the user.', inputSchema: {type: 'object'}, annotations: {readOnlyHint: true}}]},
  };
  createInterface({input: process.stdin}).on('line', line => {
    const {id, method} = JSON.parse(line);
    const result = answers[method] ?? (method === 'tools/call' ? {content: [{type: 'text', text: status()}]} : {});
    if (id !== undefined) console.log(JSON.stringify({jsonrpc: '2.0', id, result}));
  });
}
