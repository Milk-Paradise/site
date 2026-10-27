import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { mkdtemp, readFile, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { leadSchema } from '../src/lib/lead-schema';
import { appendLead, readLeadLog } from '../src/lib/lead-log';
import { GET } from '../src/app/leads-log/route';

const beforeEnv = {...process.env};
let tempDirectory = '';
afterEach(async () => {
  process.env = {...beforeEnv};
  if (tempDirectory) { await rm(join(tempDirectory, 'leads.txt'), {force:true}); await rmdir(tempDirectory); tempDirectory = ''; }
});
const lead = leadSchema.parse({name:'Тест',method:'email',contact:'test@example.com',project:'landing',description:'<script>alert(1)</script>',consent:true,requestId:'298d2742-3d83-4704-b51f-8aaab62f7db4'});

test('stores each lead in the configured text file and can read it', async () => {
  tempDirectory = await mkdtemp(join(tmpdir(), 'milkshake-log-'));
  process.env.LEAD_LOG_PATH=join(tempDirectory,'leads.txt');
  await appendLead(lead);
  assert.match(await readFile(process.env.LEAD_LOG_PATH,'utf8'), /test@example\.com/);
  assert.match(await readLeadLog(), /test@example\.com/);
});

test('viewing the log requires a password and escapes user content', async () => {
  tempDirectory = await mkdtemp(join(tmpdir(), 'milkshake-log-'));
  process.env.LEAD_LOG_PATH=join(tempDirectory,'leads.txt');
  process.env.LEAD_LOG_PASSWORD='a-long-test-password';
  await appendLead(lead);
  assert.equal((await GET(new Request('http://localhost:3000/leads-log'))).status, 401);
  const wrong = 'Basic '+Buffer.from('admin:wrong').toString('base64');
  assert.equal((await GET(new Request('http://localhost:3000/leads-log',{headers:{authorization:wrong}}))).status, 401);
  const right = 'Basic '+Buffer.from('admin:a-long-test-password').toString('base64');
  const result=await GET(new Request('http://localhost:3000/leads-log',{headers:{authorization:right}}));
  assert.equal(result.status,200);
  const html=await result.text();
  assert.match(html,/test@example\.com/);
  assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
  assert.match(html,/&lt;script&gt;/);
});

test('short password cannot expose personal data in production', async () => {
  Object.assign(process.env, {NODE_ENV:'production',LEAD_LOG_PASSWORD:'2026'});
  const auth='Basic '+Buffer.from('admin:2026').toString('base64');
  assert.equal((await GET(new Request('https://milk.termitdigital.ru/leads-log',{headers:{authorization:auth}}))).status,503);
});
