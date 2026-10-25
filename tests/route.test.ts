import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/leads/route';
const originalEnv={...process.env};
afterEach(()=>{process.env={...originalEnv};});
function configured(){
  for(const key of ['TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID','TURNSTILE_SECRET_KEY','NEXT_PUBLIC_TURNSTILE_SITE_KEY','TURNSTILE_HOSTNAMES','REDIS_URL'])process.env[key]='dummy';
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
test('rejects wrong type and oversized declared payload before Redis',async()=>{
  configured();
  const headers={origin:'https://milkshake.example','content-type':'text/plain'};
  assert.equal((await POST(new NextRequest('https://milkshake.example/api/leads',{method:'POST',headers,body:'{}'}))).status,415);
  assert.equal((await POST(new NextRequest('https://milkshake.example/api/leads',{method:'POST',headers:{...headers,'content-type':'application/json','content-length':'99999'},body:'{}'}))).status,413);
});
test('privacy readiness gate stays closed even with all API keys',async()=>{
  configured();process.env.PRIVACY_READY='false';
  assert.equal((await POST(new NextRequest('https://milkshake.example/api/leads',{method:'POST'}))).status,503);
});
