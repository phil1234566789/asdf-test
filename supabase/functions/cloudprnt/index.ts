import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const SUPPORTED_MEDIA_TYPES = ['text/plain'];

const LEFT_PAD = 12; // printable area starts 12 chars in - left of that is off the paper
const W = 36;
const SEP = '='.repeat(W);
const DASH = '-'.repeat(W);

function emit(line: string): string {
  return ' '.repeat(LEFT_PAD) + line;
}

const UMLAUT_MAP: Record<string, string> = {
  ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'Ae', Ö: 'Oe', Ü: 'Ue', ß: 'ss',
};

function transliterate(text: string): string {
  return text.replace(/[äöüÄÖÜß]/g, (c) => UMLAUT_MAP[c] ?? c);
}

function center(text: string): string {
  const pad = Math.max(0, Math.floor((W - text.length) / 2));
  return ' '.repeat(pad) + text;
}

function buildBon(job: { target: string; payload: { tableLabel: string; orders: { code: string; name: string; count: number }[]; timestamp: string } }): Uint8Array {
  const { target, payload } = job;
  const { tableLabel, orders, timestamp } = payload;
  const title = target === 'kitchen' ? 'KUECHE' : 'THEKE';
  const time = new Date(timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });

  const lines: string[] = [];
  lines.push(emit(SEP));
  lines.push(emit(center(title)));
  lines.push(emit(SEP));
  const headerRight = time;
  const headerLeft = transliterate(tableLabel).substring(0, W - headerRight.length - 2);
  lines.push(emit(' ' + headerLeft.padEnd(W - headerRight.length - 1) + headerRight));
  lines.push(emit(DASH));

  for (const order of orders) {
    const prefix = `${String(order.count).padStart(2)}x  ${order.code.padEnd(4)}  `;
    const maxName = W - prefix.length;
    lines.push(emit(prefix + transliterate(order.name).substring(0, maxName)));
  }

  lines.push(emit(SEP));
  lines.push('');
  lines.push('');
  lines.push('');

  // ESC/POS partial cut: GS V B 0
  const ESC_CUT = new Uint8Array([0x1d, 0x56, 0x42, 0x00]);

  const text = lines.join('\n');
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);

  const result = new Uint8Array(textBytes.length + ESC_CUT.length);
  result.set(textBytes);
  result.set(ESC_CUT, textBytes.length);
  return result;
}

function pollBody(jobReady: boolean): string {
  const body: Record<string, unknown> = { jobReady };
  if (jobReady) body['mediaTypes'] = SUPPORTED_MEDIA_TYPES;
  return JSON.stringify(body);
}

async function oldestPendingJob(supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase
    .from('print_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

Deno.serve(async (req: Request) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const type = url.searchParams.get('type');

    if (!type) {
      // Plain poll - no fetch intent
      const job = await oldestPendingJob(supabase);
      return new Response(pollBody(!!job), { headers: { 'Content-Type': 'application/json' } });
    }

    // Printer is requesting the actual job content in the given media type
    const job = await oldestPendingJob(supabase);
    if (!job) {
      return new Response(pollBody(false), { headers: { 'Content-Type': 'application/json' } });
    }

    await supabase.from('print_jobs').update({ status: 'delivered' }).eq('id', job.id);
    const content = buildBon(job);

    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (req.method === 'POST') {
    const contentType = req.headers.get('content-type') ?? '';
    const rawBody = await req.text();

    let clientAction: string | null = null;
    if (contentType.includes('application/json')) {
      const json = JSON.parse(rawBody || '{}');
      clientAction = json.clientAction ?? null;
    } else {
      clientAction = new URLSearchParams(rawBody).get('clientAction');
    }

    if (!clientAction || clientAction === 'null') {
      // Status poll/report (some firmware versions report status via POST instead of GET)
      const job = await oldestPendingJob(supabase);
      return new Response(pollBody(!!job), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Unknown action', { status: 400 });
  }

  if (req.method === 'DELETE') {
    // Printer reports job result: ?mac=...&code=200 OK (or an error code)
    const code = url.searchParams.get('code') ?? '';
    const ok = code.trim().startsWith('200');
    await supabase
      .from('print_jobs')
      .update({ status: ok ? 'done' : 'pending' })
      .eq('status', 'delivered');

    return new Response(JSON.stringify({}), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('Method not allowed', { status: 405 });
});
