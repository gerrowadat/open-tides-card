const V = globalThis, ft = V.ShadowRoot && (V.ShadyCSS === void 0 || V.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, mt = /* @__PURE__ */ Symbol(), Et = /* @__PURE__ */ new WeakMap();
let Bt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== mt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (ft && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Et.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Et.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const le = (n) => new Bt(typeof n == "string" ? n : n + "", void 0, mt), Wt = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((s, i, o) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + n[o + 1], n[0]);
  return new Bt(e, n, mt);
}, he = (n, t) => {
  if (ft) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = V.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, n.appendChild(s);
  }
}, St = ft ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return le(e);
})(n) : n;
const { is: ce, defineProperty: ue, getOwnPropertyDescriptor: de, getOwnPropertyNames: pe, getOwnPropertySymbols: fe, getPrototypeOf: me } = Object, et = globalThis, Ct = et.trustedTypes, ge = Ct ? Ct.emptyScript : "", _e = et.reactiveElementPolyfillSupport, O = (n, t) => n, ht = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? ge : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, t) {
  let e = n;
  switch (t) {
    case Boolean:
      e = n !== null;
      break;
    case Number:
      e = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(n);
      } catch {
        e = null;
      }
  }
  return e;
} }, qt = (n, t) => !ce(n, t), Mt = { attribute: !0, type: String, converter: ht, reflect: !1, useDefault: !1, hasChanged: qt };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), et.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let N = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Mt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && ue(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: o } = de(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: i, set(a) {
      const r = i?.call(this);
      o?.call(this, a), this.requestUpdate(t, r, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Mt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(O("elementProperties"))) return;
    const t = me(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(O("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(O("properties"))) {
      const e = this.properties, s = [...pe(e), ...fe(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, i] of e) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const i = this._$Eu(e, s);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) e.unshift(St(i));
    } else t !== void 0 && e.push(St(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return he(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : ht).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = s.getPropertyOptions(i), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : ht;
      this._$Em = i;
      const r = a.fromAttribute(e, o.type);
      this[i] = r ?? this._$Ej?.get(i) ?? r, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, o) {
    if (t !== void 0) {
      const a = this.constructor;
      if (i === !1 && (o = this[t]), s ??= a.getPropertyOptions(t), !((s.hasChanged ?? qt)(o, e) || s.useDefault && s.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: o }, a) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), o !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, o] of this._$Ep) this[i] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, o] of s) {
        const { wrapped: a } = o, r = this[i];
        a !== !0 || this._$AL.has(i) || r === void 0 || this.C(i, void 0, o, r);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
N.elementStyles = [], N.shadowRootOptions = { mode: "open" }, N[O("elementProperties")] = /* @__PURE__ */ new Map(), N[O("finalized")] = /* @__PURE__ */ new Map(), _e?.({ ReactiveElement: N }), (et.reactiveElementVersions ??= []).push("2.1.2");
const gt = globalThis, kt = (n) => n, K = gt.trustedTypes, Nt = K ? K.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, Zt = "$lit$", x = `lit$${Math.random().toFixed(9).slice(2)}$`, Vt = "?" + x, $e = `<${Vt}>`, E = document, z = () => E.createComment(""), j = (n) => n === null || typeof n != "object" && typeof n != "function", _t = Array.isArray, ye = (n) => _t(n) || typeof n?.[Symbol.iterator] == "function", ot = `[ 	
\f\r]`, R = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Pt = /-->/g, Tt = />/g, b = RegExp(`>|${ot}(?:([^\\s"'>=/]+)(${ot}*=${ot}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ut = /'/g, Ht = /"/g, Gt = /^(?:script|style|textarea|title)$/i, Kt = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), $ = Kt(1), M = Kt(2), H = /* @__PURE__ */ Symbol.for("lit-noChange"), d = /* @__PURE__ */ Symbol.for("lit-nothing"), Dt = /* @__PURE__ */ new WeakMap(), A = E.createTreeWalker(E, 129);
function Xt(n, t) {
  if (!_t(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Nt !== void 0 ? Nt.createHTML(t) : t;
}
const ve = (n, t) => {
  const e = n.length - 1, s = [];
  let i, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = R;
  for (let r = 0; r < e; r++) {
    const l = n[r];
    let h, c, u = -1, m = 0;
    for (; m < l.length && (a.lastIndex = m, c = a.exec(l), c !== null); ) m = a.lastIndex, a === R ? c[1] === "!--" ? a = Pt : c[1] !== void 0 ? a = Tt : c[2] !== void 0 ? (Gt.test(c[2]) && (i = RegExp("</" + c[2], "g")), a = b) : c[3] !== void 0 && (a = b) : a === b ? c[0] === ">" ? (a = i ?? R, u = -1) : c[1] === void 0 ? u = -2 : (u = a.lastIndex - c[2].length, h = c[1], a = c[3] === void 0 ? b : c[3] === '"' ? Ht : Ut) : a === Ht || a === Ut ? a = b : a === Pt || a === Tt ? a = R : (a = b, i = void 0);
    const g = a === b && n[r + 1].startsWith("/>") ? " " : "";
    o += a === R ? l + $e : u >= 0 ? (s.push(h), l.slice(0, u) + Zt + l.slice(u) + x + g) : l + x + (u === -2 ? r : g);
  }
  return [Xt(n, o + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class F {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let o = 0, a = 0;
    const r = t.length - 1, l = this.parts, [h, c] = ve(t, e);
    if (this.el = F.createElement(h, s), A.currentNode = this.el.content, e === 2 || e === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (i = A.nextNode()) !== null && l.length < r; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const u of i.getAttributeNames()) if (u.endsWith(Zt)) {
          const m = c[a++], g = i.getAttribute(u).split(x), y = /([.?@])?(.*)/.exec(m);
          l.push({ type: 1, index: o, name: y[2], strings: g, ctor: y[1] === "." ? xe : y[1] === "?" ? be : y[1] === "@" ? Ae : nt }), i.removeAttribute(u);
        } else u.startsWith(x) && (l.push({ type: 6, index: o }), i.removeAttribute(u));
        if (Gt.test(i.tagName)) {
          const u = i.textContent.split(x), m = u.length - 1;
          if (m > 0) {
            i.textContent = K ? K.emptyScript : "";
            for (let g = 0; g < m; g++) i.append(u[g], z()), A.nextNode(), l.push({ type: 2, index: ++o });
            i.append(u[m], z());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Vt) l.push({ type: 2, index: o });
      else {
        let u = -1;
        for (; (u = i.data.indexOf(x, u + 1)) !== -1; ) l.push({ type: 7, index: o }), u += x.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const s = E.createElement("template");
    return s.innerHTML = t, s;
  }
}
function D(n, t, e = n, s) {
  if (t === H) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const o = j(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(n), i._$AT(n, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = D(n, i._$AS(n, t.values), i, s)), t;
}
class we {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, i = (t?.creationScope ?? E).importNode(e, !0);
    A.currentNode = i;
    let o = A.nextNode(), a = 0, r = 0, l = s[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let h;
        l.type === 2 ? h = new L(o, o.nextSibling, this, t) : l.type === 1 ? h = new l.ctor(o, l.name, l.strings, this, t) : l.type === 6 && (h = new Ee(o, this, t)), this._$AV.push(h), l = s[++r];
      }
      a !== l?.index && (o = A.nextNode(), a++);
    }
    return A.currentNode = E, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class L {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = D(this, t, e), j(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== H && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ye(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== d && j(this._$AH) ? this._$AA.nextSibling.data = t : this.T(E.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = F.createElement(Xt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const o = new we(i, this), a = o.u(this.options);
      o.p(e), this.T(a), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = Dt.get(t.strings);
    return e === void 0 && Dt.set(t.strings, e = new F(t)), e;
  }
  k(t) {
    _t(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const o of t) i === e.length ? e.push(s = new L(this.O(z()), this.O(z()), this, this.options)) : s = e[i], s._$AI(o), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = kt(t).nextSibling;
      kt(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class nt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, o) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = d;
  }
  _$AI(t, e = this, s, i) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) t = D(this, t, e, 0), a = !j(t) || t !== this._$AH && t !== H, a && (this._$AH = t);
    else {
      const r = t;
      let l, h;
      for (t = o[0], l = 0; l < o.length - 1; l++) h = D(this, r[s + l], e, l), h === H && (h = this._$AH[l]), a ||= !j(h) || h !== this._$AH[l], h === d ? t = d : t !== d && (t += (h ?? "") + o[l + 1]), this._$AH[l] = h;
    }
    a && !i && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class xe extends nt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class be extends nt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class Ae extends nt {
  constructor(t, e, s, i, o) {
    super(t, e, s, i, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = D(this, t, e, 0) ?? d) === H) return;
    const s = this._$AH, i = t === d && s !== d || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== d && (s === d || i);
    i && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ee {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    D(this, t);
  }
}
const Se = gt.litHtmlPolyfillSupport;
Se?.(F, L), (gt.litHtmlVersions ??= []).push("3.3.3");
const Ce = (n, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const o = e?.renderBefore ?? null;
    s._$litPart$ = i = new L(t.insertBefore(z(), o), o, void 0, e ?? {});
  }
  return i._$AI(n), i;
};
const $t = globalThis;
class T extends N {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ce(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return H;
  }
}
T._$litElement$ = !0, T.finalized = !0, $t.litElementHydrateSupport?.({ LitElement: T });
const Me = $t.litElementPolyfillSupport;
Me?.({ LitElement: T });
($t.litElementVersions ??= []).push("4.2.2");
function yt(n, t) {
  let e = null, s = null;
  for (const i of n)
    if (i.time <= t) e = i;
    else {
      s = i;
      break;
    }
  return [e, s];
}
function ke(n, t) {
  const [, e] = yt(n, t);
  return e ? e.type === "high" ? "rising" : "falling" : null;
}
function Rt(n, t) {
  return n.find((e) => e.time > t) ?? null;
}
function ct(n, t, e) {
  const s = t.time - n.time;
  if (s <= 0) return n.height;
  const i = (e - n.time) / s, o = (n.height + t.height) / 2, a = (n.height - t.height) / 2;
  return o + a * Math.cos(Math.PI * i);
}
function Ne(n, t) {
  if (n.length < 2) return null;
  const e = n[0], s = n[n.length - 1];
  if (t < e.time || t > s.time) return null;
  let i = 0, o = n.length - 1;
  for (; i < o; ) {
    const h = i + o >> 1;
    n[h].time < t ? i = h + 1 : o = h;
  }
  const a = n[i];
  if (a.time === t || i === 0) return a.height;
  const r = n[i - 1], l = (t - r.time) / (a.time - r.time);
  return r.height + (a.height - r.height) * l;
}
function Pe(n, t, e) {
  if (t) {
    const o = Ne(t, e);
    if (o !== null) return o;
  }
  const [s, i] = yt(n, e);
  return !s || !i ? null : ct(s, i, e);
}
function Te(n, t, e, s) {
  const i = [];
  if (n.length < 2 || s <= 0) return i;
  const o = Math.max(t, n[0].time), a = Math.min(e, n[n.length - 1].time);
  if (a < o) return i;
  let r = 0;
  for (let l = o; l <= a; l += s) {
    for (; r < n.length - 2 && n[r + 1].time < l; ) r++;
    const h = n[r], c = n[r + 1];
    i.push({ time: l, height: ct(h, c, l) });
  }
  if (i.length && i[i.length - 1].time !== a) {
    const [l, h] = yt(n, a);
    l && h ? i.push({ time: a, height: ct(l, h, a) }) : i.push({ time: a, height: n[n.length - 1].height });
  }
  return i;
}
const U = 36e5, Ue = 10 * 6e4, He = { top: 14, right: 10, bottom: 22, left: 36 };
function Ot(n, t, e, s) {
  const i = t - n || 1;
  return (o) => e + (o - n) / i * (s - e);
}
function De(n, t) {
  if (n <= 0 || t <= 0) return 1;
  const e = n / t, s = 10 ** Math.floor(Math.log10(e)), i = e / s;
  return (i < 1.5 ? 1 : i < 3.5 ? 2 : i < 7.5 ? 5 : 10) * s;
}
function Re(n, t, e = 3) {
  const s = De(t - n, e), i = [];
  for (let o = Math.ceil(n / s) * s; o <= t + 1e-9; o += s)
    i.push(Number(o.toFixed(6)));
  return i;
}
const Oe = 44;
function Ie(n, t, e, s = 6) {
  const i = [], o = Math.ceil(n / U) * U;
  for (let a = o; a <= t; a += U)
    e(a) % s === 0 && i.push(a);
  return i;
}
function ze(n, t, e) {
  const s = (t - n) / U;
  for (const i of [6, 12])
    if (s / i * Oe <= e) return i;
  return 24;
}
const _ = (n) => Math.round(n * 10) / 10;
function je(n) {
  const t = n.length;
  if (t === 0) return "";
  if (t === 1) return `M${_(n[0].x)},${_(n[0].y)}`;
  const e = [], s = [], i = [];
  for (let r = 0; r < t - 1; r++)
    e.push(n[r + 1].x - n[r].x), s.push(n[r + 1].y - n[r].y), i.push(e[r] === 0 ? 0 : s[r] / e[r]);
  const o = [i[0]];
  for (let r = 1; r < t - 1; r++) {
    const l = i[r - 1], h = i[r];
    o.push(l * h <= 0 ? 0 : (l + h) / 2);
  }
  o.push(i[t - 2]);
  for (let r = 0; r < t - 1; r++) {
    if (i[r] === 0) {
      o[r] = 0, o[r + 1] = 0;
      continue;
    }
    const l = o[r] / i[r], h = o[r + 1] / i[r], c = l * l + h * h;
    if (c > 9) {
      const u = 3 / Math.sqrt(c);
      o[r] = u * l * i[r], o[r + 1] = u * h * i[r];
    }
  }
  let a = `M${_(n[0].x)},${_(n[0].y)}`;
  for (let r = 0; r < t - 1; r++) {
    const l = n[r], h = n[r + 1], c = e[r] / 3;
    a += `C${_(l.x + c)},${_(l.y + o[r] * c)} ${_(h.x - c)},${_(h.y - o[r + 1] * c)} ${_(h.x)},${_(h.y)}`;
  }
  return a;
}
function Fe(n, t, e, s) {
  if (t && t.length >= 2) {
    let o = t.findIndex((l) => l.time >= e);
    o === -1 && (o = t.length);
    let a = t.findIndex((l) => l.time > s);
    a === -1 && (a = t.length), o = Math.max(0, o - 1), a = Math.min(t.length, a + 1);
    const r = t.slice(o, a);
    if (r.length >= 2) return { points: r, approximate: !1 };
  }
  const i = Te(n, e, s, Ue);
  return i.length >= 2 ? { points: i, approximate: !0 } : null;
}
function Le(n, t = He) {
  const e = n.toDisplay ?? ((p) => p), s = n.hourOf ?? ((p) => new Date(p).getUTCHours()), { events: i, curve: o, now: a, width: r, height: l } = n, h = {
    x0: t.left,
    y0: t.top,
    x1: Math.max(t.left + 1, r - t.right),
    y1: Math.max(t.top + 1, l - t.bottom)
  }, c = a - n.hoursBack * U, u = a + n.hoursAhead * U, m = Math.min(
    i[0]?.time ?? 1 / 0,
    o?.[0]?.time ?? 1 / 0,
    a
  ), g = Math.max(c, m), y = Fe(i, o, g, u), vt = i.filter((p) => p.time >= g && p.time <= u), C = [];
  if (y) for (const p of y.points) C.push(p.height);
  for (const p of vt) C.push(p.height);
  let v = C.length ? Math.min(...C) : 0, w = C.length ? Math.max(...C) : 1;
  w - v < 0.1 && (v -= 0.5, w += 0.5);
  const wt = (w - v) * 0.22;
  v = e(v - wt), w = e(w + wt);
  const B = Ot(g, u, h.x0, h.x1), W = Ot(v, w, h.y1, h.y0);
  let it = "", xt = "";
  if (y) {
    const p = y.points.map((At) => ({ x: B(At.time), y: W(e(At.height)) }));
    it = je(p);
    const re = p[0], ae = p[p.length - 1];
    xt = `${it}L${_(ae.x)},${_(h.y1)}L${_(re.x)},${_(h.y1)}Z`;
  }
  const ie = vt.map((p) => ({
    x: _(B(p.time)),
    y: _(W(e(p.height))),
    type: p.type,
    time: p.time,
    height: e(p.height),
    below: p.type === "low"
  })), bt = Pe(i, o, a), oe = {
    x: _(B(a)),
    y: bt === null ? null : _(W(e(bt)))
  };
  return {
    width: r,
    height: l,
    plot: h,
    domain: { t0: g, t1: u, h0: v, h1: w },
    linePath: it,
    areaPath: xt,
    approximate: y?.approximate ?? !1,
    now: oe,
    markers: ie,
    xTicks: Ie(g, u, s, ze(g, u, h.x1 - h.x0)).map((p) => ({
      x: _(B(p)),
      time: p,
      major: s(p) === 0
    })),
    yTicks: Re(v, w).map((p) => ({ y: _(W(p)), value: p })),
    empty: y === null
  };
}
function k(n) {
  return typeof n == "string" && n.length > 0 ? n : null;
}
function Jt(n) {
  if (typeof n != "string") return null;
  const t = Date.parse(n);
  return Number.isFinite(t) ? t : null;
}
function Yt(n) {
  const t = typeof n == "number" ? n : typeof n == "string" ? Number(n) : NaN;
  return Number.isFinite(t) ? t : null;
}
function Be(n) {
  if (typeof n != "object" || n === null) return null;
  const t = n, e = Jt(t.time), s = Yt(t.height), i = t.type === "high" || t.type === "low" ? t.type : null;
  return e === null || s === null || i === null ? null : { time: e, height: s, type: i };
}
function We(n) {
  if (!Array.isArray(n) || n.length < 2) return null;
  const t = Jt(n[0]), e = Yt(n[1]);
  return t === null || e === null ? null : { time: t, height: e };
}
function qe(n) {
  return n === "rising" || n === "falling" ? n : null;
}
function Ze(n) {
  const t = n.attributes ?? {}, e = [];
  let s = [];
  if (t.events !== void 0)
    if (Array.isArray(t.events)) {
      const o = t.events.map(Be);
      s = o.filter((r) => r !== null);
      const a = o.length - s.length;
      a > 0 && e.push(`events: ${a} malformed row(s) ignored`), s.sort((r, l) => r.time - l.time);
    } else
      e.push("events: expected a list");
  let i = null;
  if (t.curve !== void 0)
    if (Array.isArray(t.curve)) {
      const o = t.curve.map(We);
      i = o.filter((r) => r !== null);
      const a = o.length - i.length;
      a > 0 && e.push(`curve: ${a} malformed point(s) ignored`), i.sort((r, l) => r.time - l.time), i.length < 2 && (i = null);
    } else
      e.push("curve: expected a list");
  return {
    state: qe(n.state),
    station: k(t.station),
    provider: k(t.provider),
    datum: k(t.datum),
    attribution: k(t.attribution),
    licence: k(t.licence),
    licenceUrl: k(t.licence_url),
    events: s,
    curve: i,
    warnings: e
  };
}
const Qt = ["range", "rate", "next_spring", "next_neap"], X = 48, rt = (n, t, e, s) => {
  const i = typeof n == "number" ? n : typeof n == "string" ? Number(n) : NaN;
  return Number.isFinite(i) ? Math.min(e, Math.max(t, Math.round(i))) : s;
};
function Ve(n) {
  const t = Array.isArray(n.extras) ? Qt.filter((e) => n.extras.includes(e)) : [];
  return {
    entity: typeof n.entity == "string" ? n.entity : "",
    extras: t,
    name: typeof n.name == "string" && n.name ? n.name : null,
    hours_ahead: rt(n.hours_ahead, 1, X, 36),
    hours_back: rt(n.hours_back, 0, X, 6),
    show_header: n.show_header ?? !0,
    show_curve: n.show_curve ?? !0,
    show_events: n.show_events ?? !0,
    events_count: rt(n.events_count, 1, 12, 4),
    height_unit: n.height_unit === "m" || n.height_unit === "ft" ? n.height_unit : "auto"
  };
}
const Ge = { rising: "Rising", falling: "Falling", unknown: "Unknown" }, Ke = "High", Xe = "Low", Je = "Next high", Ye = "Next low", Qe = "{duration} ago", tn = "at {time}", en = "now", nn = "Approximate: interpolated between high and low, not provider data", sn = "No forecast available", on = "No upcoming tides in the forecast", rn = "Forecast last updated {ago}; the integration may not have refreshed", an = "Heights relative to {datum}", ln = { no_entity: "Set an entity", not_found: "Entity not found: {entity}", unavailable: "{entity} is unavailable" }, hn = { entity: "Tide sensor", name: "Name", name_helper: "Overrides the station name in the header", hours_ahead: "Hours ahead", hours_back: "Hours back", hours_helper: "The sensor carries 48 h of forecast", show_header: "Show header", show_curve: "Show curve", show_events: "Show high/low list", events_count: "Events to list", height_unit: "Height unit", unit_auto: "Follow Home Assistant", unit_m: "Metres", unit_ft: "Feet", extras: "Extras", extras_helper: "From the range, rate and spring/neap sensors (open_tides 0.3+)", extra_range: "Range", extra_rate: "Rate of rise / fall", extra_next_spring: "Next spring tide", extra_next_neap: "Next neap tide" }, cn = { range: "Range", rate: "Rate", next_spring: "Next spring", next_neap: "Next neap", range_span: "{min} – {max} ahead", range_of: "range {range}", rate_up: "rising", rate_down: "falling", rate_flat: "at the turn" }, ut = {
  state: Ge,
  high: Ke,
  low: Xe,
  next_high: Je,
  next_low: Ye,
  in: "in {duration}",
  ago: Qe,
  at: tn,
  now: en,
  approximate: nn,
  no_forecast: sn,
  no_upcoming: on,
  stale: rn,
  datum: an,
  errors: ln,
  editor: hn,
  extras: cn
}, It = { en: ut };
function zt(n, t) {
  let e = n;
  for (const s of t.split(".")) {
    if (typeof e != "object" || e === null) return;
    e = e[s];
  }
  return typeof e == "string" ? e : void 0;
}
function f(n, t, e = {}) {
  const s = (n?.locale?.language ?? n?.language ?? "en").toLowerCase(), i = It[s] ?? It[s.split("-")[0] ?? "en"] ?? ut;
  let o = zt(i, t) ?? zt(ut, t) ?? t;
  for (const [a, r] of Object.entries(e)) o = o.replaceAll(`{${a}}`, String(r));
  return o;
}
function un(n) {
  const t = (e) => f(n, `editor.${e}`);
  return [
    {
      name: "entity",
      required: !0,
      selector: { entity: { domain: "sensor", integration: "open_tides" } }
    },
    { name: "name", selector: { text: {} } },
    {
      name: "extras",
      selector: {
        select: {
          multiple: !0,
          mode: "list",
          options: Qt.map((e) => ({ value: e, label: t(`extra_${e}`) }))
        }
      }
    },
    {
      type: "grid",
      name: "",
      schema: [
        {
          name: "hours_ahead",
          selector: { number: { min: 1, max: X, step: 1, mode: "box", unit_of_measurement: "h" } }
        },
        {
          name: "hours_back",
          selector: { number: { min: 0, max: X, step: 1, mode: "box", unit_of_measurement: "h" } }
        }
      ]
    },
    {
      type: "grid",
      name: "",
      schema: [
        { name: "show_header", selector: { boolean: {} } },
        { name: "show_curve", selector: { boolean: {} } },
        { name: "show_events", selector: { boolean: {} } },
        {
          name: "events_count",
          selector: { number: { min: 1, max: 12, step: 1, mode: "box" } }
        }
      ]
    },
    {
      name: "height_unit",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "auto", label: t("unit_auto") },
            { value: "m", label: t("unit_m") },
            { value: "ft", label: t("unit_ft") }
          ]
        }
      }
    }
  ];
}
const at = {
  extras: [],
  hours_ahead: 36,
  hours_back: 6,
  show_header: !0,
  show_curve: !0,
  show_events: !0,
  events_count: 4,
  height_unit: "auto"
}, Q = class Q extends T {
  constructor() {
    super(...arguments), this._label = (t) => t.name ? f(this.hass, `editor.${t.name}`) : "", this._helper = (t) => {
      if (t.name === "name") return f(this.hass, "editor.name_helper");
      if (t.name === "extras") return f(this.hass, "editor.extras_helper");
      if (t.name === "hours_ahead" || t.name === "hours_back")
        return f(this.hass, "editor.hours_helper");
    };
  }
  setConfig(t) {
    this._config = t;
  }
  render() {
    if (!this.hass || !this._config) return d;
    const t = { ...at, ...this._config };
    return $`
      <ha-form
        .hass=${this.hass}
        .data=${t}
        .schema=${un(this.hass)}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }
  _changed(t) {
    t.stopPropagation();
    const e = t.detail.value, s = { type: this._config?.type ?? "custom:open-tides-card" };
    for (const [i, o] of Object.entries(e))
      i !== "type" && (o === "" || o === void 0 || o === null || Array.isArray(o) && o.length === 0 || i in at && at[i] === o || (s[i] = o));
    this._config = s, this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: s }, bubbles: !0, composed: !0 })
    );
  }
};
Q.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
}, Q.styles = Wt`
    :host {
      display: block;
    }
  `;
let dt = Q;
const dn = 3.280839895;
function q(n, t) {
  return n.height_unit !== "auto" ? n.height_unit : t?.config?.unit_system?.length === "mi" ? "ft" : "m";
}
function J(n, t) {
  return t === "ft" ? n * dn : n;
}
function jt(n, t, e, s = 1) {
  const i = J(n, t);
  return `${new Intl.NumberFormat(e, {
    minimumFractionDigits: s,
    maximumFractionDigits: s
  }).format(i)} ${t}`;
}
function Y(n, t, e = 1) {
  return new Intl.NumberFormat(t, {
    minimumFractionDigits: e,
    maximumFractionDigits: e
  }).format(n);
}
function P(n) {
  const t = n?.locale?.language ?? n?.language;
  return t && t !== "system" ? t : navigator.language;
}
function st(n) {
  return n?.locale?.time_zone === "server" ? n?.config?.time_zone : void 0;
}
function pn(n) {
  const t = n?.locale?.time_format;
  if (t === "12") return !0;
  if (t === "24") return !1;
}
function te(n, t) {
  const e = {
    hour: "numeric",
    minute: "2-digit",
    timeZone: st(t)
  }, s = pn(t);
  return s !== void 0 && (e.hour12 = s), new Intl.DateTimeFormat(P(t), e).format(n);
}
function ee(n, t) {
  return new Intl.DateTimeFormat(P(t), {
    weekday: "short",
    timeZone: st(t)
  }).format(n);
}
function G(n, t, e) {
  const s = te(n, e);
  return fn(n, t, e) ? s : `${ee(n, e)} ${s}`;
}
function fn(n, t, e) {
  const s = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: st(e)
  });
  return s.format(n) === s.format(t);
}
function mn(n) {
  const t = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    hour12: !1,
    timeZone: st(n)
  });
  return (e) => {
    const s = parseInt(t.format(e), 10);
    return s === 24 ? 0 : s;
  };
}
function I(n) {
  const t = Math.max(0, Math.round(Math.abs(n) / 6e4)), e = Math.floor(t / 1440), s = Math.floor(t % 1440 / 60), i = t % 60;
  return e > 0 ? `${e}d ${s}h` : s > 0 ? `${s}h ${i}m` : `${i}m`;
}
const Ft = "_tide";
function ne(n, t) {
  return n.endsWith(Ft) ? n.slice(0, -Ft.length) + "_" + t : null;
}
function se(n) {
  const t = typeof n == "number" ? n : typeof n == "string" ? Number(n) : NaN;
  return Number.isFinite(t) ? t : null;
}
function Z(n, t) {
  const e = se(n);
  if (e === null) return null;
  switch (t) {
    case "ft":
      return e / 3.280839895;
    case "cm":
      return e / 100;
    case "mm":
      return e / 1e3;
    case "in":
      return e * 0.0254;
    default:
      return e;
  }
}
function gn(n, t, e, s, i, o) {
  const a = ne(t, e);
  if (!a) return null;
  const r = n.states[a];
  if (!r || r.state === "unavailable" || r.state === "unknown") return null;
  const l = f(n, `extras.${e}`), h = (c, u = 1) => `${Y(J(c, i), o, u)} ${i}`;
  switch (e) {
    case "range": {
      const c = Z(r.state, r.attributes.unit_of_measurement);
      if (c === null) return null;
      const u = Z(r.attributes.horizon_max, "m"), m = Z(r.attributes.horizon_min, "m"), g = u !== null && m !== null ? f(n, "extras.range_span", { min: h(m), max: h(u) }) : null;
      return { key: e, entityId: a, label: l, value: h(c), sub: g, trend: null };
    }
    case "rate": {
      const c = se(r.state);
      if (c === null) return null;
      const u = J(Math.abs(c), i), m = c > 5e-3 ? "up" : c < -5e-3 ? "down" : "flat";
      return {
        key: e,
        entityId: a,
        label: l,
        value: `${m === "up" ? "+" : m === "down" ? "−" : ""}${Y(u, o, 2)} ${i}/h`,
        sub: f(n, `extras.rate_${m}`),
        trend: m
      };
    }
    case "next_spring":
    case "next_neap": {
      const c = Date.parse(r.state);
      if (!Number.isFinite(c)) return null;
      const u = Z(r.attributes.range, "m"), m = G(c, s, n), g = c > s ? f(n, "in", { duration: I(c - s) }) : f(n, "ago", { duration: I(s - c) }), y = u !== null ? `${g} · ${f(n, "extras.range_of", { range: h(u) })}` : g;
      return { key: e, entityId: a, label: l, value: m, sub: y, trend: null };
    }
  }
}
const S = "open-tides-card", Lt = 150, lt = 6e4, tt = class tt extends T {
  constructor() {
    super(...arguments), this._now = Date.now(), this._width = 0;
  }
  // ---- Lovelace API -------------------------------------------------------
  static getConfigElement() {
    return document.createElement(`${S}-editor`);
  }
  static getStubConfig(t, e, s) {
    const i = (a) => a.startsWith("sensor.") && a.endsWith("_tide") && Array.isArray(t.states[a]?.attributes?.events), o = [...e, ...s].find(i) ?? "";
    return { type: `custom:${S}`, entity: o };
  }
  setConfig(t) {
    if (!t || typeof t != "object") throw new Error("Invalid configuration");
    this._config = Ve(t);
  }
  getCardSize() {
    return this._rows();
  }
  getGridOptions() {
    return { columns: 12, rows: this._rows(), min_columns: 6, min_rows: 2 };
  }
  _rows() {
    const t = this._config;
    if (!t) return 3;
    let e = 32;
    return t.show_header && (e += 64), t.extras.length && (e += 56), t.show_curve && (e += Lt + 8), t.show_events && (e += 4 + t.events_count * 28), e += 22, Math.max(1, Math.ceil(e / 64));
  }
  // ---- lifecycle ----------------------------------------------------------
  connectedCallback() {
    super.connectedCallback(), this._startClock();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._stopClock(), this._ro?.disconnect(), this._ro = void 0;
  }
  _startClock() {
    this._stopClock(), this._now = Date.now();
    const t = lt - this._now % lt;
    this._timer = window.setTimeout(() => {
      this._now = Date.now(), this._timer = window.setInterval(() => this._now = Date.now(), lt);
    }, t);
  }
  _stopClock() {
    this._timer !== void 0 && (window.clearTimeout(this._timer), window.clearInterval(this._timer), this._timer = void 0);
  }
  firstUpdated() {
    this._observeChart();
  }
  updated() {
    this._ro || this._observeChart();
  }
  _observeChart() {
    const t = this.renderRoot.querySelector(".chart");
    t && "ResizeObserver" in window && (this._ro = new ResizeObserver((e) => {
      const s = Math.floor(e[0]?.contentRect.width ?? 0);
      s !== this._width && (this._width = s);
    }), this._ro.observe(t));
  }
  /** Re-render on hass only when our entity's state object changed. */
  shouldUpdate(t) {
    if (t.size === 1 && t.has("hass")) {
      const e = t.get("hass"), s = this._config;
      return !e || !s?.entity || e.locale !== this.hass?.locale ? !0 : [s.entity, ...s.extras.map((o) => ne(s.entity, o) ?? "")].some((o) => e.states[o] !== this.hass?.states[o]);
    }
    return !0;
  }
  // ---- render -------------------------------------------------------------
  render() {
    const t = this._config, e = this.hass;
    if (!t || !e) return d;
    if (!t.entity) return this._error(f(e, "errors.no_entity"));
    const s = e.states[t.entity];
    if (!s) return this._error(f(e, "errors.not_found", { entity: t.entity }));
    if (s.state === "unavailable")
      return this._error(f(e, "errors.unavailable", { entity: t.entity }), "warning");
    const i = Ze(s), o = this._now, a = t.name ?? i.station ?? t.entity, r = Rt(i.events, o), l = s.last_updated ? Date.parse(s.last_updated) : NaN, h = [];
    for (const c of i.warnings) h.push(this._alert(c, "warning"));
    if (i.events.length === 0)
      h.push(this._alert(f(e, "no_forecast"), "info"));
    else if (!r) {
      const c = Number.isFinite(l) ? I(o - l) : "?";
      h.push(this._alert(f(e, "stale", { ago: c }), "warning"));
    }
    return $`
      <ha-card>
        <div class="card">
          ${h}
          ${t.show_header ? this._header(a, i, o) : d}
          ${t.extras.length ? this._extras(o) : d}
          ${t.show_curve && i.events.length > 1 ? this._chart(i, o) : d}
          ${t.show_events && i.events.length > 0 ? this._events(i, o) : d}
          ${this._footer(i)}
        </div>
      </ha-card>
    `;
  }
  _error(t, e = "error") {
    return $`<ha-card><div class="card">${this._alert(t, e)}</div></ha-card>`;
  }
  _alert(t, e) {
    return $`<ha-alert alert-type=${e}>${t}</ha-alert>`;
  }
  _header(t, e, s) {
    const i = this.hass, o = q(this._config, i), a = P(i), r = ke(e.events, s), l = Rt(e.events, s), h = r === "rising" ? "mdi:wave-arrow-up" : r === "falling" ? "mdi:wave-arrow-down" : "mdi:wave", c = f(i, `state.${r ?? "unknown"}`);
    return $`
      <div class="header">
        <div class="title-row">
          <div class="title">${t}</div>
          <div class="state ${r ?? ""}">
            <ha-icon icon=${h}></ha-icon>
            <span>${c}</span>
          </div>
        </div>
        ${l ? $`<div class="next">
              <span class="kind ${l.type}">${f(i, l.type)}</span>
              <span class="height">${jt(l.height, o, a)}</span>
              <span class="when">
                ${f(i, "in", { duration: I(l.time - s) })}
                · ${G(l.time, s, i)}
              </span>
            </div>` : d}
      </div>
    `;
  }
  _extras(t) {
    const e = this.hass, s = this._config, i = q(s, e), o = P(e), a = s.extras.map((r) => gn(e, s.entity, r, t, i, o)).filter((r) => r !== null);
    return a.length === 0 ? d : $`
      <div class="extras">
        ${a.map(
      (r) => $`
            <div class="stat" title=${r.entityId}>
              <div class="stat-label">${r.label}</div>
              <div class="stat-value ${r.trend ?? ""}">
                ${r.trend === "up" ? $`<ha-icon icon="mdi:arrow-up-thin"></ha-icon>` : r.trend === "down" ? $`<ha-icon icon="mdi:arrow-down-thin"></ha-icon>` : d}
                ${r.value}
              </div>
              ${r.sub ? $`<div class="stat-sub">${r.sub}</div>` : d}
            </div>`
    )}
      </div>
    `;
  }
  _chart(t, e) {
    const s = this.hass, i = this._config, o = q(i, s), a = P(s), r = this._width || 300, l = Le({
      events: t.events,
      curve: t.curve,
      now: e,
      hoursBack: i.hours_back,
      hoursAhead: i.hours_ahead,
      width: r,
      height: Lt,
      toDisplay: (h) => J(h, o),
      hourOf: mn(s)
    });
    return $`<div class="chart">${l.empty ? d : this._svg(l, a)}</div>`;
  }
  _svg(t, e) {
    const s = this.hass, { plot: i } = t, o = `otc-clip-${Math.round(t.width)}`, a = t.approximate;
    return M`
      <svg
        class="curve ${a ? "approx" : ""}"
        viewBox="0 0 ${t.width} ${t.height}"
        width=${t.width}
        height=${t.height}
        role="img"
        aria-label=${a ? f(s, "approximate") : ""}
      >
        <defs>
          <clipPath id=${o}>
            <rect x=${i.x0} y=${i.y0} width=${i.x1 - i.x0} height=${i.y1 - i.y0}></rect>
          </clipPath>
        </defs>
        ${t.yTicks.map(
      (r) => M`
            <line class="grid" x1=${i.x0} x2=${i.x1} y1=${r.y} y2=${r.y}></line>
            <text class="ylabel" x=${i.x0 - 6} y=${r.y} dy="0.35em" text-anchor="end">
              ${Y(r.value, e, 1)}
            </text>`
    )}
        ${t.xTicks.map(
      (r) => M`
            <line class="grid ${r.major ? "major" : ""}" x1=${r.x} x2=${r.x} y1=${i.y0} y2=${i.y1}></line>
            <text class="xlabel ${r.major ? "major" : ""}" x=${r.x} y=${i.y1 + 14} text-anchor="middle">
              ${r.major ? ee(r.time, s) : te(r.time, s)}
            </text>`
    )}
        <g clip-path="url(#${o})">
          <path class="area" d=${t.areaPath}></path>
          <path class="line" d=${t.linePath}>
            ${a ? M`<title>${f(s, "approximate")}</title>` : d}
          </path>
        </g>
        <line class="now" x1=${t.now.x} x2=${t.now.x} y1=${i.y0} y2=${i.y1}></line>
        ${t.now.y !== null ? M`<circle class="now-dot" cx=${t.now.x} cy=${t.now.y} r="3.5"></circle>` : d}
        ${t.markers.map((r) => {
      const l = r.below ? r.y + 14 : r.y - 8, h = Y(r.height, e, 1);
      return M`
            <circle class="marker ${r.type}" cx=${r.x} cy=${r.y} r="3.5">
              <title>${f(s, r.type)} ${h} ${G(r.time, t.domain.t0, s)}</title>
            </circle>
            <text class="mlabel ${r.type}" x=${r.x} y=${l} text-anchor="middle">${h}</text>`;
    })}
      </svg>
    `;
  }
  _events(t, e) {
    const s = this.hass, i = this._config, o = q(i, s), a = P(s), r = t.events.filter((l) => l.time > e).slice(0, i.events_count);
    return r.length === 0 ? $`<div class="events empty">${f(s, "no_upcoming")}</div>` : $`
      <div class="events">
        ${r.map((l) => {
      const h = l.time - e;
      return $`
            <div class="row">
              <ha-icon class="${l.type}" icon=${l.type === "high" ? "mdi:arrow-up-thin" : "mdi:arrow-down-thin"}></ha-icon>
              <span class="kind">${f(s, l.type)}</span>
              <span class="time">${G(l.time, e, s)}</span>
              <span class="rel">${f(s, "in", { duration: I(h) })}</span>
              <span class="height">${jt(l.height, o, a, 2)}</span>
            </div>`;
    })}
      </div>
    `;
  }
  _footer(t) {
    const e = this.hass;
    return !t.attribution && !t.datum ? d : $`
      <div class="footer">
        ${t.attribution ? t.licenceUrl ? $`<a href=${t.licenceUrl} target="_blank" rel="noopener">${t.attribution}</a>` : $`<span>${t.attribution}</span>` : d}
        ${t.datum ? $`<span class="datum">${f(e, "datum", { datum: t.datum })}</span>` : d}
      </div>
    `;
  }
};
tt.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _now: { state: !0 },
  _width: { state: !0 }
}, tt.styles = Wt`
    :host {
      --otc-curve: var(--open-tides-curve-color, var(--primary-color));
      --otc-high: var(--open-tides-high-color, var(--primary-color));
      --otc-low: var(--open-tides-low-color, var(--secondary-text-color));
      --otc-now: var(--open-tides-now-color, var(--primary-text-color));
      --otc-grid: var(--divider-color);
      --otc-label: var(--secondary-text-color);
    }
    ha-card {
      overflow: hidden;
    }
    .card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    ha-alert {
      display: block;
    }

    /* header */
    .title-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }
    .title {
      font-size: 1.2em;
      font-weight: 500;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .state {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .state ha-icon {
      --mdc-icon-size: 22px;
      color: var(--otc-curve);
    }
    .next {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 6px;
      color: var(--primary-text-color);
      margin-top: 2px;
    }
    .next .kind {
      font-weight: 500;
    }
    .next .kind.high {
      color: var(--otc-high);
    }
    .next .kind.low {
      color: var(--otc-low);
    }
    .next .height {
      font-size: 1.3em;
      font-weight: 500;
    }
    .next .when {
      color: var(--secondary-text-color);
    }

    /* extras */
    .extras {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
    }
    .stat {
      flex: 1 1 120px;
      min-width: 0;
    }
    .stat-label {
      font-size: 0.75em;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary-text-color);
    }
    .stat-value {
      font-size: 1.1em;
      font-weight: 500;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .stat-value ha-icon {
      --mdc-icon-size: 18px;
      margin-left: -4px;
    }
    .stat-value.up ha-icon {
      color: var(--otc-high);
    }
    .stat-value.down ha-icon {
      color: var(--otc-low);
    }
    .stat-sub {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }

    /* chart */
    .chart {
      width: 100%;
      line-height: 0;
    }
    svg.curve {
      display: block;
      max-width: 100%;
      overflow: visible;
      font-family: inherit;
    }
    .grid {
      stroke: var(--otc-grid);
      stroke-width: 1;
    }
    .grid.major {
      stroke-width: 1.5;
    }
    .xlabel,
    .ylabel {
      fill: var(--otc-label);
      font-size: 10px;
    }
    .xlabel.major {
      font-weight: 600;
    }
    .area {
      fill: var(--otc-curve);
      fill-opacity: 0.12;
      stroke: none;
    }
    .line {
      fill: none;
      stroke: var(--otc-curve);
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    svg.approx .line {
      stroke-dasharray: 5 4;
    }
    .now {
      stroke: var(--otc-now);
      stroke-width: 1;
      stroke-dasharray: 2 3;
      opacity: 0.8;
    }
    .now-dot {
      fill: var(--card-background-color);
      stroke: var(--otc-now);
      stroke-width: 2;
    }
    .marker {
      stroke: var(--card-background-color);
      stroke-width: 1.5;
    }
    .marker.high {
      fill: var(--otc-high);
    }
    .marker.low {
      fill: var(--otc-low);
    }
    .mlabel {
      font-size: 10.5px;
      font-weight: 600;
    }
    .mlabel.high {
      fill: var(--otc-high);
    }
    .mlabel.low {
      fill: var(--otc-low);
    }

    /* events list */
    .events {
      display: flex;
      flex-direction: column;
    }
    .events.empty {
      color: var(--secondary-text-color);
      font-style: italic;
    }
    .row {
      display: grid;
      grid-template-columns: 24px auto auto 1fr auto;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      border-top: 1px solid var(--otc-grid);
      color: var(--primary-text-color);
    }
    .row:first-child {
      border-top: none;
    }
    .row ha-icon {
      --mdc-icon-size: 20px;
    }
    .row ha-icon.high {
      color: var(--otc-high);
    }
    .row ha-icon.low {
      color: var(--otc-low);
    }
    .row .kind {
      font-weight: 500;
    }
    .row .time {
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .row .rel {
      color: var(--secondary-text-color);
      font-size: 0.9em;
      text-align: right;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .row .height {
      font-variant-numeric: tabular-nums;
      text-align: right;
      white-space: nowrap;
    }

    /* footer */
    .footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 4px 12px;
      font-size: 0.75em;
      color: var(--secondary-text-color);
    }
    .footer a {
      color: inherit;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  `;
let pt = tt;
customElements.get(S) || customElements.define(S, pt);
customElements.get(`${S}-editor`) || customElements.define(`${S}-editor`, dt);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: S,
  name: "Open Tides Card",
  description: "Tide curve, state and next high/low from the open_tides integration.",
  preview: !0,
  documentationURL: "https://github.com/gerrowadat/open-tides-card"
});
export {
  pt as OpenTidesCard
};
