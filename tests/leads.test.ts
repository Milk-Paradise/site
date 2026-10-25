import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { leadSchema } from '../src/lib/lead-schema';
import { checkCaptcha, deliverLead } from '../src/lib/delivery';

const originalFetch=globalThis.fetch;
const originalEnv={...process.env};
afterEach(()=>{globalThis.fetch=originalFetch;process.env={...originalEnv};});
const lead = {name:'Тест',method:'telegram',contact:'@test_user',project:'landing',description:'Задача',consent:true,token:'test-token',requestId:'298d2742-3d83-4704-b51f-8aaab62f7db4'};

test('validates contact according to selected method',()=>{
  assert.equal(leadSchema.safeParse(lead).success,true);
  assert.equal(leadSchema.safeParse({...lead,method:'email'}).success,false);
  assert.equal(leadSchema.safeParse({...lead,method:'email',contact:'test@example.com'}).success,true);
  assert.equal(leadSchema.safeParse({...lead,method:'phone',contact:'+7 (999) 123-45-67'}).success,true);
  assert.equal(leadSchema.safeParse({...lead,method:'phone',contact:'12345'}).success,false);
});
test('requires consent and rejects excessive and control character input',()=>{
  for (const invalid of [{consent:false},{description:'x'.repeat(2001)},{name:'a\u0000b'},{token:''},{requestId:'not-uuid'}]) assert.equal(leadSchema.safeParse({...lead,...invalid}).success,false);
});
test('CAPTCHA fails closed for failed, wrong hostname or wrong action results',async()=>{
  process.env.TURNSTILE_HOSTNAMES='milkshake.example';process.env.TURNSTILE_SECRET_KEY='test';
  for(const result of [{success:false},{success:true,action:'login',hostname:'milkshake.example'},{success:true,action:'lead',hostname:'attacker.example'}]){
    globalThis.fetch=async()=>Response.json(result);
    assert.equal(await checkCaptcha('token'),false);
  }
  globalThis.fetch=async()=>Response.json({success:true,action:'lead',hostname:'milkshake.example'});
  assert.equal(await checkCaptcha('token'),true);
});
test('Telegram success requires explicit API confirmation',async()=>{
  process.env.TELEGRAM_BOT_TOKEN='dummy';process.env.TELEGRAM_CHAT_ID='-123';
  const parsed=leadSchema.parse(lead);
  globalThis.fetch=async()=>Response.json({ok:false});
  await assert.rejects(deliverLead(parsed));
  globalThis.fetch=async()=>Response.json({ok:true,result:{}});
  await assert.rejects(deliverLead(parsed));
  globalThis.fetch=async()=>{throw new Error('network unavailable');};
  await assert.rejects(deliverLead(parsed));
});
test('Telegram sends user content as plain text without markup parsing',async()=>{
  process.env.TELEGRAM_BOT_TOKEN='dummy';process.env.TELEGRAM_CHAT_ID='-123';
  let payload:Record<string,unknown>={};
  globalThis.fetch=async(_input,init)=>{payload=JSON.parse(String(init?.body));return Response.json({ok:true,result:{message_id:1}});};
  await deliverLead(leadSchema.parse({...lead,description:'<b>Input</b> & _text_'}));
  assert.equal(payload.parse_mode,undefined);
  assert.equal(String(payload.text).includes('<b>Input</b> & _text_'),true);
  assert.equal(payload.chat_id,'-123');
});
