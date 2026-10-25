import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { themeBootScript, themeStorageKey } from '../src/config/theme';
import { setTheme } from '../src/lib/theme';

function boot(value: string | null, storageDenied = false) {
  const root = { dataset: {} as Record<string, string> };
  runInNewContext(themeBootScript, {
    document: { documentElement: root },
    localStorage: { getItem: (key: string) => {
      assert.equal(key, themeStorageKey);
      if (storageDenied) throw new Error('Storage is unavailable');
      return value;
    } },
  });
  return root.dataset.theme;
}

test('first visit selects Pop before React loads', () => {
  assert.equal(boot(null), 'pop');
});
test('saved After Dark is restored before first paint', () => {
  assert.equal(boot('dark'), 'dark');
  assert.equal(boot('pop'), 'pop');
});
test('unknown stored values cannot become theme attributes', () => {
  assert.equal(boot('<script>alert(1)</script>'), 'pop');
  assert.equal(boot('system'), 'pop');
});
test('blocked localStorage does not break page initialization', () => {
  assert.equal(boot(null, true), 'pop');
});

test('switching updates the shared root, persists the choice and notifies React', () => {
  const names = ['document', 'window', 'localStorage'] as const;
  const previous = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const);
  const root = { dataset: { theme: 'pop' } };
  const events = new EventTarget();
  const saved = new Map<string, string>();
  let notifications = 0;
  events.addEventListener('milkshake:theme', () => notifications++);
  try {
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { documentElement: root } });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: events });
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { setItem: (key: string, value: string) => saved.set(key, value) } });
    setTheme('dark');
    assert.equal(root.dataset.theme, 'dark');
    assert.equal(saved.get(themeStorageKey), 'dark');
    setTheme('pop');
    assert.equal(root.dataset.theme, 'pop');
    assert.equal(saved.get(themeStorageKey), 'pop');
    assert.equal(notifications, 2);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { setItem: () => { throw new Error('Storage denied'); } } });
    assert.doesNotThrow(() => setTheme('dark'));
    assert.equal(root.dataset.theme, 'dark');
    assert.equal(notifications, 3);
  } finally {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
});
