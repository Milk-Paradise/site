import { appendFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Lead } from './lead-schema';

export function leadLogPath() {
  return process.env.LEAD_LOG_PATH || join(process.cwd(), 'leads.txt');
}

export async function appendLead(lead: Lead) {
  const { website: _website, consent: _consent, ...details } = lead;
  void _website; void _consent;
  const entry = JSON.stringify({ receivedAt: new Date().toISOString(), ...details });
  await appendFile(leadLogPath(), `${entry}\n`, { encoding: 'utf8', mode: 0o600 });
}

export async function readLeadLog() {
  try { return await readFile(leadLogPath(), 'utf8'); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return '';
    throw error;
  }
}
