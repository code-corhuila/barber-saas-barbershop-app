/** The look of the prototype: dark background, cards a shade lighter, gold accent. Scoped to .bs-root. */
export const STYLES = `
.bs-root { min-height: 100%; background: #121212; color: #fff; padding-bottom: 5rem; }
.bs-page { max-width: 40rem; margin: 0 auto; padding: 1rem; }
.bs-header { font-size: 1.375rem; font-weight: 700; margin: .5rem 0 .75rem; }
.bs-center { display: grid; place-items: center; gap: .75rem; padding: 3rem 1rem; text-align: center; }
.bs-error { color: #ff6b6b; margin: 0; }
.bs-empty { color: #888; text-align: center; margin-top: 2.5rem; }
.bs-hint { color: #888; font-size: .8rem; margin: -.25rem 0 .75rem; }
.bs-primary { --background: #d4af37; --color: #121212; --border-radius: 10px; font-weight: 700; }
.bs-secondary { --color: #d4af37; --border-color: #d4af37; --border-radius: 10px; }
.bs-search { --background: #1e1e1e; --color: #fff; --placeholder-color: #888; --icon-color: #d4af37; padding: 0 0 .5rem; }
.bs-card { display: flex; gap: .75rem; align-items: center; width: 100%; background: #1e1e1e; border: 1px solid transparent;
  border-radius: 12px; padding: .75rem; margin-bottom: .75rem; color: #fff; text-align: left; cursor: pointer; font: inherit; }
.bs-card.selected { border-color: #d4af37; }
.bs-card.inactive { opacity: .5; }
.bs-logo { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; flex: none; background: #2a2a2a;
  display: grid; place-items: center; color: #d4af37; font-size: 1.5rem; font-weight: 700; }
.bs-grow { flex: 1; min-width: 0; }
.bs-title { font-size: 1rem; font-weight: 600; margin: 0; }
.bs-gold { color: #d4af37; font-size: .8rem; margin: .15rem 0 0; }
.bs-muted { color: #aaa; font-size: .8rem; margin: .15rem 0 0; }
.bs-price { color: #d4af37; font-weight: 700; white-space: nowrap; }
.bs-section { font-size: 1.05rem; font-weight: 700; margin: 1.5rem 0 .75rem; }
.bs-banner { width: 100%; height: 160px; object-fit: cover; border-radius: 12px; }
.bs-chips { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .4rem; }
.bs-chip { background: #2a2a2a; color: #d4af37; border-radius: 999px; padding: .1rem .6rem; font-size: .75rem; }
.bs-footer { position: fixed; left: 0; right: 0; bottom: 0; padding: .75rem 1rem; background: #121212;
  border-top: 1px solid #2a2a2a; }
.bs-tabs { --background: #1e1e1e; margin-bottom: .75rem; }
.bs-tabs ion-segment-button { --color: #888; --color-checked: #d4af37; --indicator-color: #d4af37; }
.bs-field { margin-bottom: .75rem; }
.bs-field ion-input, .bs-field ion-textarea { --background: #1e1e1e; --color: #fff; --placeholder-color: #666;
  --border-radius: 10px; --padding-start: 12px; --highlight-color-focused: #d4af37; }
.bs-card .bs-field ion-input { --background: #2a2a2a; }
.bs-field-error { color: #ff6b6b; font-size: .8rem; margin-top: .3rem; }
.bs-alert { background: #2a1414; border: 1px solid #ff6b6b; color: #ffb3b3; border-radius: 10px; padding: .75rem;
  margin: .5rem 0; font-size: .875rem; }
.bs-modal { --background: #121212; }
`;
