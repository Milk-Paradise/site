'use client';

import { useEffect, useId, useRef, useState } from 'react';

type Choice = { value: string; label: string };

type Props = { name: string; label: string; value: string; choices: readonly Choice[]; onChange: (value: string) => void };

export function FormSelect({ name, label, value, choices, onChange }: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = Math.max(0, choices.findIndex(item => item.value === value));
  const [active, setActive] = useState(selected);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  function choose(index: number) {
    onChange(choices[index].value);
    setActive(index);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false); return; }
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive(open ? (active + step + choices.length) % choices.length : selected);
      setOpen(true);
      return;
    }
    if (open && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault(); setActive(event.key === 'Home' ? 0 : choices.length - 1); return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(active); else { setActive(selected); setOpen(true); }
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const character = event.key.toLocaleLowerCase('ru');
      const start = open ? active : selected;
      const match = choices.findIndex((_, index) => choices[(start + index + 1) % choices.length].label.toLocaleLowerCase('ru').startsWith(character));
      if (match >= 0) {
        event.preventDefault();
        const index = (start + match + 1) % choices.length;
        if (open) setActive(index); else choose(index);
      }
    }
  }

  return <div className="form-select" ref={root}>
    <span className="form-select-label" id={`${id}-label`}>{label}</span>
    <input type="hidden" name={name} value={value}/>
    <button type="button" role="combobox" aria-labelledby={`${id}-label`} aria-expanded={open} aria-controls={`${id}-list`} aria-haspopup="listbox" aria-activedescendant={open ? `${id}-option-${active}` : undefined} className="form-select-trigger" onClick={() => { setActive(selected); setOpen(!open); }} onKeyDown={onKeyDown}>
      <span>{choices[selected].label}</span><span className="form-select-chevron" aria-hidden="true"/>
    </button>
    {open && <div className="form-select-menu" id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`}>
      {choices.map((choice, index) => <div id={`${id}-option-${index}`} key={choice.value} role="option" aria-selected={index === selected} className={`form-select-option${index === active ? ' is-active' : ''}`} onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => choose(index)}>
        <span>{choice.label}</span>{index === selected && <span className="form-select-check" aria-hidden="true">✓</span>}
      </div>)}
    </div>}
  </div>;
}
