// Read before first paint; accept only known theme values.
export const themeStorageKey = 'milkshake-theme';
export const themeBootScript = `try{document.documentElement.dataset.theme=localStorage.getItem('${themeStorageKey}')==='dark'?'dark':'pop'}catch{document.documentElement.dataset.theme='pop'}`;
