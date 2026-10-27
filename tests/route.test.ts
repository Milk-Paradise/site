import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';
import { mkdtemp, readFile, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/leads/route';
const originalEnv={...process.env};
const originalFetch=globalThis.fetch;
let tempDirectory = '';
beforeEach(async()=>{tempDirectory=await mkdtemp(join(tmpdir(),'milkshake-route-'));process.env.LEAD_LOG_PATH=join(tempDirectory,'leads.txt');});
afterEach(async()=>{process.env={...originalEnv};globalThis.fetch=originalFetch;await rm(join(tempDirectory,'leads.txt'),{force:true});await rmdir(tempDirectory);});
function configured(){
  for(const key of ['TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID'])process.env[key]='dummy';
  process.env.PRIVACY_READY='true';process.env.SITE_URL='https://milkshake.example';
}
test('unconfigured form never claims success',async()=>{
  delete process.env.TELEGRAM_BOT_TOKEN;
  const result=await POST(new NextRequest('https://milkshake.example/api/leads',{method:'POST'}));
  assert.equal(result.status,503);assert.equal((await result.json()).ok,undefined);
});
test('rejects foreign origin before processing any data',async()=>{
  configured();
  const result=await POST(new NextRequest('https://milkshake.example/api/leads',{method:'POST',headers:{origin:'https://attacker.example','content-type':'application/json'},body:'{}'}));
  assert.equal(result.status,403);
});
test('accepts the local browser origin when Next resolves the request to localhost',async()=>{
  configured();
  Object.assign(process.env,{NODE_ENV:'development'});
  const response=await POST(new NextRequest('http://localhost:3000/api/leads',{method:'POST',headers:{origin:'http://127.0.0.1:3000',host:'127.0.0.1:3000','content-type':'application/json'},body:'{}'}));
  assert.equal(response.status,400);
  assert.match((await response.json()).error,/обязательные поля/);
});
test('does not trust a mismatched localhost host or loopback origin in production',async()=>{
  configured();
  Object.assign(process.env,{NODE_ENV:'development'});
  const headers={origin:'http://127.0.0.1:3000',host:'attacker.example','content-type':'application/json'};
  assert.equal((await POST(new NextRequest('http://localhost:3000/api/leads',{method:'POST',headers,body:'{}'}))).status,403);
  Object.assign(process.env,{NODE_ENV:'production'});
  headers.host='127.0.0.1:3000';
  assert.equal((await POST(new NextRequest('http://localhost:3000/api/leads',{method:'POST',headers,body:'{}'}))).status,403);
});
test('rejects wrong type and oversized declared payload',async()=>{
  configured();
  const headers={origin:'https://milkshake.example','content-type':'text/plain'};
  assert.equal((await POST(new NextRequest('https://milkshake.example/api/leads',{method:'POST',headers,body:'{}'}))).status,415);
  assert.equal((await POST(new NextRequest('https://milkshake.example/api/leads',{method:'POST',headers:{...headers,'content-type':'application/json','content-length':'99999'},body:'{}'}))).status,413);
});
test('privacy readiness gate stays closed even with all API keys',async()=>{
  configured();process.env.PRIVACY_READY='false';
  assert.equal((await POST(new NextRequest('https://milkshake.example/api/leads',{method:'POST'}))).status,503);
});

test('delivers a valid lead with Telegram configured and without CAPTCHA or Redis',async()=>{
  process.env.TELEGRAM_BOT_TOKEN='dummy';process.env.TELEGRAM_CHAT_ID='-123';process.env.PRIVACY_READY='true';
  delete process.env.REDIS_URL;delete process.env.TURNSTILE_SECRET_KEY;delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;delete process.env.TURNSTILE_HOSTNAMES;
  let delivered=false;
  globalThis.fetch=async(_url,init)=>{delivered=JSON.parse(String(init?.body)).chat_id==='-123';return Response.json({ok:true,result:{message_id:1}});};
  const body={name:'Тест',method:'email',contact:'test@example.com',project:'landing',consent:true,requestId:'298d2742-3d83-4704-b51f-8aaab62f7db4'};
  const response=await POST(new NextRequest('https://milkshake.example/api/leads',{method:'POST',headers:{origin:'https://milkshake.example','content-type':'application/json'},body:JSON.stringify(body)}));
  assert.equal(response.status,200);assert.equal(delivered,true);
});

test('unconfirmed Telegram delivery is reported as a failure',async()=>{
  process.env.TELEGRAM_BOT_TOKEN='dummy';process.env.TELEGRAM_CHAT_ID='-123';process.env.PRIVACY_READY='true';
  delete process.env.REDIS_URL;delete process.env.TURNSTILE_SECRET_KEY;delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;delete process.env.TURNSTILE_HOSTNAMES;
  globalThis.fetch=async()=>{throw new Error('network');};
  const body={name:'Тест',method:'email',contact:'test@example.com',project:'landing',consent:true,requestId:'298d2742-3d83-4704-b51f-8aaab62f7db4'};
  const response=await POST(new NextRequest('https://milkshake.example/api/leads',{method:'POST',headers:{origin:'https://milkshake.example','content-type':'application/json'},body:JSON.stringify(body)}));
  assert.equal(response.status,502);
  assert.match(await readFile(join(tempDirectory,'leads.txt'),'utf8'), /test@example\.com/);
});
