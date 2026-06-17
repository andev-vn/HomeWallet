// Client MCP tối giản giao tiếp với Stitch qua streamable HTTP.
// Dùng: node scripts/stitch-mcp.mjs <method> '<json-params>'
const URL = 'https://stitch.googleapis.com/mcp';
const API_KEY = 'AQ.Ab8RN6LhfOHQQnaCiyv1PY8NrmiavjhwOeSTDLLEFxdU5_5O1w';

let sessionId = null;
let idCounter = 1;

function parseBody(text, contentType) {
  if (contentType && contentType.includes('text/event-stream')) {
    // gom các dòng data: của SSE
    const datas = text
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim())
      .filter(Boolean);
    return datas.map((d) => JSON.parse(d));
  }
  if (!text.trim()) return [];
  return [JSON.parse(text)];
}

async function rpc(method, params, isNotification = false) {
  const body = { jsonrpc: '2.0', method };
  if (params !== undefined) body.params = params;
  if (!isNotification) body.id = idCounter++;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
    'X-Goog-Api-Key': API_KEY,
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;

  const res = await fetch(URL, { method: 'POST', headers, body: JSON.stringify(body) });
  const sid = res.headers.get('mcp-session-id');
  if (sid) sessionId = sid;

  const text = await res.text();
  if (isNotification) return null;
  const msgs = parseBody(text, res.headers.get('content-type'));
  const resp = msgs.find((m) => m.id === body.id) ?? msgs[0];
  if (resp?.error) throw new Error(`RPC ${method} error: ${JSON.stringify(resp.error)}`);
  return resp?.result;
}

async function main() {
  const method = process.argv[2] ?? 'tools/list';
  const params = process.argv[3] ? JSON.parse(process.argv[3]) : undefined;

  await rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'homewallet-cli', version: '1.0' },
  });
  await rpc('notifications/initialized', undefined, true);

  const result = await rpc(method, params);
  const out = JSON.stringify(result, null, 2);
  const { writeFileSync } = await import('node:fs');
  writeFileSync('scripts/_last.json', out);
  console.log(out.length > 4000 ? out.slice(0, 4000) + '\n...[saved to scripts/_last.json]' : out);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
