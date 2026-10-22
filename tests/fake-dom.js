// DOM mínimo para ejercitar los manejadores REALES de la interfaz del laboratorio sin navegador ni dependencias (MOTOR-18C). Solo lo que usan `h()`, `table()` y las tarjetas: elementos, texto, atributos, `append`,
// escuchas de `click` y la propiedad `disabled` (un botón deshabilitado no recibe clics). No simula estilos, formularios ni layout: no sustituye al navegador.
class Text { constructor(d) { this.nodeType = 3; this.data = String(d); } get textContent() { return this.data; } }
class Element {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.nodeType = 1; this.childNodes = []; this.attrs = {}; this.listeners = {}; this.className = ''; this.disabled = false; }
  append(...kids) { this.childNodes.push(...kids); }
  appendChild(k) { this.childNodes.push(k); return k; }
  removeChild(k) { this.childNodes = this.childNodes.filter((x) => x !== k); return k; }
  get firstChild() { return this.childNodes[0] ?? null; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  get textContent() { return this.childNodes.map((c) => c.textContent).join(''); }
  click() { if (this.disabled) return false; for (const fn of this.listeners.click ?? []) fn({ target: this, type: 'click' }); return true; }
}
export function installFakeDom() {
  if (globalThis.document) return;
  globalThis.Element = Element; globalThis.document = { createElement: (t) => new Element(t), createTextNode: (d) => new Text(d) };
}
export const walk = (n, f) => { f(n); for (const c of n.childNodes ?? []) walk(c, f); };
export const byId = (root, id) => { let r = null; if (root) walk(root, (n) => { if (!r && n.attrs?.id === id) r = n; }); return r; };
