const W = globalThis, ut = W.ShadowRoot && (W.ShadyCSS === void 0 || W.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, dt = /* @__PURE__ */ Symbol(), xt = /* @__PURE__ */ new WeakMap();
let zt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== dt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (ut && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = xt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && xt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ie = (i) => new zt(typeof i == "string" ? i : i + "", void 0, dt), Lt = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, n, o) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + i[o + 1], i[0]);
  return new zt(e, i, dt);
}, ne = (i, t) => {
  if (ut) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), n = W.litNonce;
    n !== void 0 && s.setAttribute("nonce", n), s.textContent = e.cssText, i.appendChild(s);
  }
}, bt = ut ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return ie(e);
})(i) : i;
const { is: oe, defineProperty: re, getOwnPropertyDescriptor: ae, getOwnPropertyNames: he, getOwnPropertySymbols: le, getPrototypeOf: ce } = Object, K = globalThis, At = K.trustedTypes, ue = At ? At.emptyScript : "", de = K.reactiveElementPolyfillSupport, O = (i, t) => i, rt = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? ue : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, Ft = (i, t) => !oe(i, t), Et = { attribute: !0, type: String, converter: rt, reflect: !1, useDefault: !1, hasChanged: Ft };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), K.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let P = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Et) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(t, s, e);
      n !== void 0 && re(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: n, set: o } = ae(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: n, set(a) {
      const r = n?.call(this);
      o?.call(this, a), this.requestUpdate(t, r, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Et;
  }
  static _$Ei() {
    if (this.hasOwnProperty(O("elementProperties"))) return;
    const t = ce(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(O("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(O("properties"))) {
      const e = this.properties, s = [...he(e), ...le(e)];
      for (const n of s) this.createProperty(n, e[n]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, n] of e) this.elementProperties.set(s, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const n = this._$Eu(e, s);
      n !== void 0 && this._$Eh.set(n, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const n of s) e.unshift(bt(n));
    } else t !== void 0 && e.push(bt(t));
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
    return ne(t, this.constructor.elementStyles), t;
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
    const s = this.constructor.elementProperties.get(t), n = this.constructor._$Eu(t, s);
    if (n !== void 0 && s.reflect === !0) {
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : rt).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, n = s._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const o = s.getPropertyOptions(n), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : rt;
      this._$Em = n;
      const r = a.fromAttribute(e, o.type);
      this[n] = r ?? this._$Ej?.get(n) ?? r, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, n = !1, o) {
    if (t !== void 0) {
      const a = this.constructor;
      if (n === !1 && (o = this[t]), s ??= a.getPropertyOptions(t), !((s.hasChanged ?? Ft)(o, e) || s.useDefault && s.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: n, wrapped: o }, a) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), o !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), n === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [n, o] of s) {
        const { wrapped: a } = o, r = this[n];
        a !== !0 || this._$AL.has(n) || r === void 0 || this.C(n, void 0, o, r);
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
P.elementStyles = [], P.shadowRootOptions = { mode: "open" }, P[O("elementProperties")] = /* @__PURE__ */ new Map(), P[O("finalized")] = /* @__PURE__ */ new Map(), de?.({ ReactiveElement: P }), (K.reactiveElementVersions ??= []).push("2.1.2");
const pt = globalThis, St = (i) => i, q = pt.trustedTypes, Ct = q ? q.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Bt = "$lit$", x = `lit$${Math.random().toFixed(9).slice(2)}$`, Wt = "?" + x, pe = `<${Wt}>`, E = document, I = () => E.createComment(""), j = (i) => i === null || typeof i != "object" && typeof i != "function", ft = Array.isArray, fe = (i) => ft(i) || typeof i?.[Symbol.iterator] == "function", Q = `[ 	
\f\r]`, D = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, kt = /-->/g, Mt = />/g, b = RegExp(`>|${Q}(?:([^\\s"'>=/]+)(${Q}*=${Q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Pt = /'/g, Tt = /"/g, qt = /^(?:script|style|textarea|title)$/i, Zt = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), $ = Zt(1), k = Zt(2), U = /* @__PURE__ */ Symbol.for("lit-noChange"), d = /* @__PURE__ */ Symbol.for("lit-nothing"), Nt = /* @__PURE__ */ new WeakMap(), A = E.createTreeWalker(E, 129);
function Vt(i, t) {
  if (!ft(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ct !== void 0 ? Ct.createHTML(t) : t;
}
const me = (i, t) => {
  const e = i.length - 1, s = [];
  let n, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = D;
  for (let r = 0; r < e; r++) {
    const h = i[r];
    let l, c, u = -1, _ = 0;
    for (; _ < h.length && (a.lastIndex = _, c = a.exec(h), c !== null); ) _ = a.lastIndex, a === D ? c[1] === "!--" ? a = kt : c[1] !== void 0 ? a = Mt : c[2] !== void 0 ? (qt.test(c[2]) && (n = RegExp("</" + c[2], "g")), a = b) : c[3] !== void 0 && (a = b) : a === b ? c[0] === ">" ? (a = n ?? D, u = -1) : c[1] === void 0 ? u = -2 : (u = a.lastIndex - c[2].length, l = c[1], a = c[3] === void 0 ? b : c[3] === '"' ? Tt : Pt) : a === Tt || a === Pt ? a = b : a === kt || a === Mt ? a = D : (a = b, n = void 0);
    const g = a === b && i[r + 1].startsWith("/>") ? " " : "";
    o += a === D ? h + pe : u >= 0 ? (s.push(l), h.slice(0, u) + Bt + h.slice(u) + x + g) : h + x + (u === -2 ? r : g);
  }
  return [Vt(i, o + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class z {
  constructor({ strings: t, _$litType$: e }, s) {
    let n;
    this.parts = [];
    let o = 0, a = 0;
    const r = t.length - 1, h = this.parts, [l, c] = me(t, e);
    if (this.el = z.createElement(l, s), A.currentNode = this.el.content, e === 2 || e === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (n = A.nextNode()) !== null && h.length < r; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const u of n.getAttributeNames()) if (u.endsWith(Bt)) {
          const _ = c[a++], g = n.getAttribute(u).split(x), y = /([.?@])?(.*)/.exec(_);
          h.push({ type: 1, index: o, name: y[2], strings: g, ctor: y[1] === "." ? $e : y[1] === "?" ? _e : y[1] === "@" ? ye : J }), n.removeAttribute(u);
        } else u.startsWith(x) && (h.push({ type: 6, index: o }), n.removeAttribute(u));
        if (qt.test(n.tagName)) {
          const u = n.textContent.split(x), _ = u.length - 1;
          if (_ > 0) {
            n.textContent = q ? q.emptyScript : "";
            for (let g = 0; g < _; g++) n.append(u[g], I()), A.nextNode(), h.push({ type: 2, index: ++o });
            n.append(u[_], I());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Wt) h.push({ type: 2, index: o });
      else {
        let u = -1;
        for (; (u = n.data.indexOf(x, u + 1)) !== -1; ) h.push({ type: 7, index: o }), u += x.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const s = E.createElement("template");
    return s.innerHTML = t, s;
  }
}
function H(i, t, e = i, s) {
  if (t === U) return t;
  let n = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const o = j(t) ? void 0 : t._$litDirective$;
  return n?.constructor !== o && (n?._$AO?.(!1), o === void 0 ? n = void 0 : (n = new o(i), n._$AT(i, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = n : e._$Cl = n), n !== void 0 && (t = H(i, n._$AS(i, t.values), n, s)), t;
}
class ge {
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
    const { el: { content: e }, parts: s } = this._$AD, n = (t?.creationScope ?? E).importNode(e, !0);
    A.currentNode = n;
    let o = A.nextNode(), a = 0, r = 0, h = s[0];
    for (; h !== void 0; ) {
      if (a === h.index) {
        let l;
        h.type === 2 ? l = new L(o, o.nextSibling, this, t) : h.type === 1 ? l = new h.ctor(o, h.name, h.strings, this, t) : h.type === 6 && (l = new ve(o, this, t)), this._$AV.push(l), h = s[++r];
      }
      a !== h?.index && (o = A.nextNode(), a++);
    }
    return A.currentNode = E, n;
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
  constructor(t, e, s, n) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = n, this._$Cv = n?.isConnected ?? !0;
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
    t = H(this, t, e), j(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== U && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : fe(t) ? this.k(t) : this._(t);
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
    const { values: e, _$litType$: s } = t, n = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = z.createElement(Vt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === n) this._$AH.p(e);
    else {
      const o = new ge(n, this), a = o.u(this.options);
      o.p(e), this.T(a), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = Nt.get(t.strings);
    return e === void 0 && Nt.set(t.strings, e = new z(t)), e;
  }
  k(t) {
    ft(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, n = 0;
    for (const o of t) n === e.length ? e.push(s = new L(this.O(I()), this.O(I()), this, this.options)) : s = e[n], s._$AI(o), n++;
    n < e.length && (this._$AR(s && s._$AB.nextSibling, n), e.length = n);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = St(t).nextSibling;
      St(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class J {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, n, o) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = e, this._$AM = n, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = d;
  }
  _$AI(t, e = this, s, n) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) t = H(this, t, e, 0), a = !j(t) || t !== this._$AH && t !== U, a && (this._$AH = t);
    else {
      const r = t;
      let h, l;
      for (t = o[0], h = 0; h < o.length - 1; h++) l = H(this, r[s + h], e, h), l === U && (l = this._$AH[h]), a ||= !j(l) || l !== this._$AH[h], l === d ? t = d : t !== d && (t += (l ?? "") + o[h + 1]), this._$AH[h] = l;
    }
    a && !n && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class $e extends J {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class _e extends J {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class ye extends J {
  constructor(t, e, s, n, o) {
    super(t, e, s, n, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = H(this, t, e, 0) ?? d) === U) return;
    const s = this._$AH, n = t === d && s !== d || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== d && (s === d || n);
    n && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class ve {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    H(this, t);
  }
}
const we = pt.litHtmlPolyfillSupport;
we?.(z, L), (pt.litHtmlVersions ??= []).push("3.3.3");
const xe = (i, t, e) => {
  const s = e?.renderBefore ?? t;
  let n = s._$litPart$;
  if (n === void 0) {
    const o = e?.renderBefore ?? null;
    s._$litPart$ = n = new L(t.insertBefore(I(), o), o, void 0, e ?? {});
  }
  return n._$AI(i), n;
};
const mt = globalThis;
class T extends P {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = xe(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return U;
  }
}
T._$litElement$ = !0, T.finalized = !0, mt.litElementHydrateSupport?.({ LitElement: T });
const be = mt.litElementPolyfillSupport;
be?.({ LitElement: T });
(mt.litElementVersions ??= []).push("4.2.2");
function gt(i, t) {
  let e = null, s = null;
  for (const n of i)
    if (n.time <= t) e = n;
    else {
      s = n;
      break;
    }
  return [e, s];
}
function Ae(i, t) {
  const [, e] = gt(i, t);
  return e ? e.type === "high" ? "rising" : "falling" : null;
}
function Ut(i, t) {
  return i.find((e) => e.time > t) ?? null;
}
function at(i, t, e) {
  const s = t.time - i.time;
  if (s <= 0) return i.height;
  const n = (e - i.time) / s, o = (i.height + t.height) / 2, a = (i.height - t.height) / 2;
  return o + a * Math.cos(Math.PI * n);
}
function Ee(i, t) {
  if (i.length < 2) return null;
  const e = i[0], s = i[i.length - 1];
  if (t < e.time || t > s.time) return null;
  let n = 0, o = i.length - 1;
  for (; n < o; ) {
    const l = n + o >> 1;
    i[l].time < t ? n = l + 1 : o = l;
  }
  const a = i[n];
  if (a.time === t || n === 0) return a.height;
  const r = i[n - 1], h = (t - r.time) / (a.time - r.time);
  return r.height + (a.height - r.height) * h;
}
function Se(i, t, e) {
  if (t) {
    const o = Ee(t, e);
    if (o !== null) return o;
  }
  const [s, n] = gt(i, e);
  return !s || !n ? null : at(s, n, e);
}
function Ce(i, t, e, s) {
  const n = [];
  if (i.length < 2 || s <= 0) return n;
  const o = Math.max(t, i[0].time), a = Math.min(e, i[i.length - 1].time);
  if (a < o) return n;
  let r = 0;
  for (let h = o; h <= a; h += s) {
    for (; r < i.length - 2 && i[r + 1].time < h; ) r++;
    const l = i[r], c = i[r + 1];
    n.push({ time: h, height: at(l, c, h) });
  }
  if (n.length && n[n.length - 1].time !== a) {
    const [h, l] = gt(i, a);
    h && l ? n.push({ time: a, height: at(h, l, a) }) : n.push({ time: a, height: i[i.length - 1].height });
  }
  return n;
}
const N = 36e5, ke = 10 * 6e4, Me = { top: 14, right: 10, bottom: 22, left: 36 };
function Ht(i, t, e, s) {
  const n = t - i || 1;
  return (o) => e + (o - i) / n * (s - e);
}
function Pe(i, t) {
  if (i <= 0 || t <= 0) return 1;
  const e = i / t, s = 10 ** Math.floor(Math.log10(e)), n = e / s;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * s;
}
function Te(i, t, e = 3) {
  const s = Pe(t - i, e), n = [];
  for (let o = Math.ceil(i / s) * s; o <= t + 1e-9; o += s)
    n.push(Number(o.toFixed(6)));
  return n;
}
const Ne = 44;
function Ue(i, t, e, s = 6) {
  const n = [], o = Math.ceil(i / N) * N;
  for (let a = o; a <= t; a += N)
    e(a) % s === 0 && n.push(a);
  return n;
}
function He(i, t, e) {
  const s = (t - i) / N;
  for (const n of [6, 12])
    if (s / n * Ne <= e) return n;
  return 24;
}
const f = (i) => Math.round(i * 10) / 10;
function De(i) {
  const t = i.length;
  if (t === 0) return "";
  if (t === 1) return `M${f(i[0].x)},${f(i[0].y)}`;
  const e = [], s = [], n = [];
  for (let r = 0; r < t - 1; r++)
    e.push(i[r + 1].x - i[r].x), s.push(i[r + 1].y - i[r].y), n.push(e[r] === 0 ? 0 : s[r] / e[r]);
  const o = [n[0]];
  for (let r = 1; r < t - 1; r++) {
    const h = n[r - 1], l = n[r];
    o.push(h * l <= 0 ? 0 : (h + l) / 2);
  }
  o.push(n[t - 2]);
  for (let r = 0; r < t - 1; r++) {
    if (n[r] === 0) {
      o[r] = 0, o[r + 1] = 0;
      continue;
    }
    const h = o[r] / n[r], l = o[r + 1] / n[r], c = h * h + l * l;
    if (c > 9) {
      const u = 3 / Math.sqrt(c);
      o[r] = u * h * n[r], o[r + 1] = u * l * n[r];
    }
  }
  let a = `M${f(i[0].x)},${f(i[0].y)}`;
  for (let r = 0; r < t - 1; r++) {
    const h = i[r], l = i[r + 1], c = e[r] / 3;
    a += `C${f(h.x + c)},${f(h.y + o[r] * c)} ${f(l.x - c)},${f(l.y - o[r + 1] * c)} ${f(l.x)},${f(l.y)}`;
  }
  return a;
}
function Oe(i, t, e, s) {
  if (t && t.length >= 2) {
    let o = t.findIndex((h) => h.time >= e);
    o === -1 && (o = t.length);
    let a = t.findIndex((h) => h.time > s);
    a === -1 && (a = t.length), o = Math.max(0, o - 1), a = Math.min(t.length, a + 1);
    const r = t.slice(o, a);
    if (r.length >= 2) return { points: r, approximate: !1 };
  }
  const n = Ce(i, e, s, ke);
  return n.length >= 2 ? { points: n, approximate: !0 } : null;
}
function Re(i, t = Me) {
  const e = i.toDisplay ?? ((p) => p), s = i.hourOf ?? ((p) => new Date(p).getUTCHours()), { events: n, curve: o, now: a, width: r, height: h } = i, l = {
    x0: t.left,
    y0: t.top,
    x1: Math.max(t.left + 1, r - t.right),
    y1: Math.max(t.top + 1, h - t.bottom)
  }, c = a - i.hoursBack * N, u = a + i.hoursAhead * N, _ = Math.min(
    n[0]?.time ?? 1 / 0,
    o?.[0]?.time ?? 1 / 0,
    a
  ), g = Math.max(c, _), y = Oe(n, o, g, u), $t = n.filter((p) => p.time >= g && p.time <= u), C = [];
  if (y) for (const p of y.points) C.push(p.height);
  for (const p of $t) C.push(p.height);
  let v = C.length ? Math.min(...C) : 0, w = C.length ? Math.max(...C) : 1;
  w - v < 0.1 && (v -= 0.5, w += 0.5);
  const _t = (w - v) * 0.22;
  v = e(v - _t), w = e(w + _t);
  const F = Ht(g, u, l.x0, l.x1), B = Ht(v, w, l.y1, l.y0);
  let Y = "", yt = "";
  if (y) {
    const p = y.points.map((wt) => ({ x: F(wt.time), y: B(e(wt.height)) }));
    Y = De(p);
    const ee = p[0], se = p[p.length - 1];
    yt = `${Y}L${f(se.x)},${f(l.y1)}L${f(ee.x)},${f(l.y1)}Z`;
  }
  const Qt = $t.map((p) => ({
    x: f(F(p.time)),
    y: f(B(e(p.height))),
    type: p.type,
    time: p.time,
    height: e(p.height),
    below: p.type === "low"
  })), vt = Se(n, o, a), te = {
    x: f(F(a)),
    y: vt === null ? null : f(B(e(vt)))
  };
  return {
    width: r,
    height: h,
    plot: l,
    domain: { t0: g, t1: u, h0: v, h1: w },
    linePath: Y,
    areaPath: yt,
    approximate: y?.approximate ?? !1,
    now: te,
    markers: Qt,
    xTicks: Ue(g, u, s, He(g, u, l.x1 - l.x0)).map((p) => ({
      x: f(F(p)),
      time: p,
      major: s(p) === 0
    })),
    yTicks: Te(v, w).map((p) => ({ y: f(B(p)), value: p })),
    empty: y === null
  };
}
function M(i) {
  return typeof i == "string" && i.length > 0 ? i : null;
}
function Gt(i) {
  if (typeof i != "string") return null;
  const t = Date.parse(i);
  return Number.isFinite(t) ? t : null;
}
function Kt(i) {
  const t = typeof i == "number" ? i : typeof i == "string" ? Number(i) : NaN;
  return Number.isFinite(t) ? t : null;
}
function Ie(i) {
  if (typeof i != "object" || i === null) return null;
  const t = i, e = Gt(t.time), s = Kt(t.height), n = t.type === "high" || t.type === "low" ? t.type : null;
  return e === null || s === null || n === null ? null : { time: e, height: s, type: n };
}
function je(i) {
  if (!Array.isArray(i) || i.length < 2) return null;
  const t = Gt(i[0]), e = Kt(i[1]);
  return t === null || e === null ? null : { time: t, height: e };
}
function ze(i) {
  return i === "rising" || i === "falling" ? i : null;
}
function Le(i) {
  const t = i.attributes ?? {}, e = [];
  let s = [];
  if (t.events !== void 0)
    if (Array.isArray(t.events)) {
      const o = t.events.map(Ie);
      s = o.filter((r) => r !== null);
      const a = o.length - s.length;
      a > 0 && e.push(`events: ${a} malformed row(s) ignored`), s.sort((r, h) => r.time - h.time);
    } else
      e.push("events: expected a list");
  let n = null;
  if (t.curve !== void 0)
    if (Array.isArray(t.curve)) {
      const o = t.curve.map(je);
      n = o.filter((r) => r !== null);
      const a = o.length - n.length;
      a > 0 && e.push(`curve: ${a} malformed point(s) ignored`), n.sort((r, h) => r.time - h.time), n.length < 2 && (n = null);
    } else
      e.push("curve: expected a list");
  return {
    state: ze(i.state),
    station: M(t.station),
    provider: M(t.provider),
    datum: M(t.datum),
    attribution: M(t.attribution),
    licence: M(t.licence),
    licenceUrl: M(t.licence_url),
    events: s,
    curve: n,
    warnings: e
  };
}
const Z = 48, tt = (i, t, e, s) => {
  const n = typeof i == "number" ? i : typeof i == "string" ? Number(i) : NaN;
  return Number.isFinite(n) ? Math.min(e, Math.max(t, Math.round(n))) : s;
};
function Fe(i) {
  return {
    entity: typeof i.entity == "string" ? i.entity : "",
    name: typeof i.name == "string" && i.name ? i.name : null,
    hours_ahead: tt(i.hours_ahead, 1, Z, 36),
    hours_back: tt(i.hours_back, 0, Z, 6),
    show_header: i.show_header ?? !0,
    show_curve: i.show_curve ?? !0,
    show_events: i.show_events ?? !0,
    events_count: tt(i.events_count, 1, 12, 4),
    height_unit: i.height_unit === "m" || i.height_unit === "ft" ? i.height_unit : "auto"
  };
}
const Be = { rising: "Rising", falling: "Falling", unknown: "Unknown" }, We = "High", qe = "Low", Ze = "Next high", Ve = "Next low", Ge = "{duration} ago", Ke = "at {time}", Je = "now", Xe = "Approximate: interpolated between high and low, not provider data", Ye = "No forecast available", Qe = "No upcoming tides in the forecast", ts = "Forecast last updated {ago}; the integration may not have refreshed", es = "Heights relative to {datum}", ss = { no_entity: "Set an entity", not_found: "Entity not found: {entity}", unavailable: "{entity} is unavailable" }, is = { entity: "Tide sensor", name: "Name", name_helper: "Overrides the station name in the header", hours_ahead: "Hours ahead", hours_back: "Hours back", hours_helper: "The sensor carries 48 h of forecast", show_header: "Show header", show_curve: "Show curve", show_events: "Show high/low list", events_count: "Events to list", height_unit: "Height unit", unit_auto: "Follow Home Assistant", unit_m: "Metres", unit_ft: "Feet" }, ht = {
  state: Be,
  high: We,
  low: qe,
  next_high: Ze,
  next_low: Ve,
  in: "in {duration}",
  ago: Ge,
  at: Ke,
  now: Je,
  approximate: Xe,
  no_forecast: Ye,
  no_upcoming: Qe,
  stale: ts,
  datum: es,
  errors: ss,
  editor: is
}, Dt = { en: ht };
function Ot(i, t) {
  let e = i;
  for (const s of t.split(".")) {
    if (typeof e != "object" || e === null) return;
    e = e[s];
  }
  return typeof e == "string" ? e : void 0;
}
function m(i, t, e = {}) {
  const s = (i?.locale?.language ?? i?.language ?? "en").toLowerCase(), n = Dt[s] ?? Dt[s.split("-")[0] ?? "en"] ?? ht;
  let o = Ot(n, t) ?? Ot(ht, t) ?? t;
  for (const [a, r] of Object.entries(e)) o = o.replaceAll(`{${a}}`, String(r));
  return o;
}
function ns(i) {
  const t = (e) => m(i, `editor.${e}`);
  return [
    {
      name: "entity",
      required: !0,
      selector: { entity: { domain: "sensor", integration: "open_tides" } }
    },
    { name: "name", selector: { text: {} } },
    {
      type: "grid",
      name: "",
      schema: [
        {
          name: "hours_ahead",
          selector: { number: { min: 1, max: Z, step: 1, mode: "box", unit_of_measurement: "h" } }
        },
        {
          name: "hours_back",
          selector: { number: { min: 0, max: Z, step: 1, mode: "box", unit_of_measurement: "h" } }
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
const et = {
  hours_ahead: 36,
  hours_back: 6,
  show_header: !0,
  show_curve: !0,
  show_events: !0,
  events_count: 4,
  height_unit: "auto"
}, V = class V extends T {
  constructor() {
    super(...arguments), this._label = (t) => t.name ? m(this.hass, `editor.${t.name}`) : "", this._helper = (t) => {
      if (t.name === "name") return m(this.hass, "editor.name_helper");
      if (t.name === "hours_ahead" || t.name === "hours_back")
        return m(this.hass, "editor.hours_helper");
    };
  }
  setConfig(t) {
    this._config = t;
  }
  render() {
    if (!this.hass || !this._config) return d;
    const t = { ...et, ...this._config };
    return $`
      <ha-form
        .hass=${this.hass}
        .data=${t}
        .schema=${ns(this.hass)}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }
  _changed(t) {
    t.stopPropagation();
    const e = t.detail.value, s = { type: this._config?.type ?? "custom:open-tides-card" };
    for (const [n, o] of Object.entries(e))
      n !== "type" && (o === "" || o === void 0 || o === null || n in et && et[n] === o || (s[n] = o));
    this._config = s, this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: s }, bubbles: !0, composed: !0 })
    );
  }
};
V.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
}, V.styles = Lt`
    :host {
      display: block;
    }
  `;
let lt = V;
const os = 3.280839895;
function st(i, t) {
  return i.height_unit !== "auto" ? i.height_unit : t?.config?.unit_system?.length === "mi" ? "ft" : "m";
}
function Jt(i, t) {
  return t === "ft" ? i * os : i;
}
function Rt(i, t, e, s = 1) {
  const n = Jt(i, t);
  return `${new Intl.NumberFormat(e, {
    minimumFractionDigits: s,
    maximumFractionDigits: s
  }).format(n)} ${t}`;
}
function It(i, t, e = 1) {
  return new Intl.NumberFormat(t, {
    minimumFractionDigits: e,
    maximumFractionDigits: e
  }).format(i);
}
function R(i) {
  const t = i?.locale?.language ?? i?.language;
  return t && t !== "system" ? t : navigator.language;
}
function X(i) {
  return i?.locale?.time_zone === "server" ? i?.config?.time_zone : void 0;
}
function rs(i) {
  const t = i?.locale?.time_format;
  if (t === "12") return !0;
  if (t === "24") return !1;
}
function Xt(i, t) {
  const e = {
    hour: "numeric",
    minute: "2-digit",
    timeZone: X(t)
  }, s = rs(t);
  return s !== void 0 && (e.hour12 = s), new Intl.DateTimeFormat(R(t), e).format(i);
}
function Yt(i, t) {
  return new Intl.DateTimeFormat(R(t), {
    weekday: "short",
    timeZone: X(t)
  }).format(i);
}
function it(i, t, e) {
  const s = Xt(i, e);
  return as(i, t, e) ? s : `${Yt(i, e)} ${s}`;
}
function as(i, t, e) {
  const s = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: X(e)
  });
  return s.format(i) === s.format(t);
}
function hs(i) {
  const t = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    hour12: !1,
    timeZone: X(i)
  });
  return (e) => {
    const s = parseInt(t.format(e), 10);
    return s === 24 ? 0 : s;
  };
}
function nt(i) {
  const t = Math.max(0, Math.round(Math.abs(i) / 6e4)), e = Math.floor(t / 1440), s = Math.floor(t % 1440 / 60), n = t % 60;
  return e > 0 ? `${e}d ${s}h` : s > 0 ? `${s}h ${n}m` : `${n}m`;
}
const S = "open-tides-card", jt = 150, ot = 6e4, G = class G extends T {
  constructor() {
    super(...arguments), this._now = Date.now(), this._width = 0;
  }
  // ---- Lovelace API -------------------------------------------------------
  static getConfigElement() {
    return document.createElement(`${S}-editor`);
  }
  static getStubConfig(t, e, s) {
    const n = (a) => a.startsWith("sensor.") && a.endsWith("_tide") && Array.isArray(t.states[a]?.attributes?.events), o = [...e, ...s].find(n) ?? "";
    return { type: `custom:${S}`, entity: o };
  }
  setConfig(t) {
    if (!t || typeof t != "object") throw new Error("Invalid configuration");
    this._config = Fe(t);
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
    return t.show_header && (e += 64), t.show_curve && (e += jt + 8), t.show_events && (e += 4 + t.events_count * 28), e += 22, Math.max(1, Math.ceil(e / 64));
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
    const t = ot - this._now % ot;
    this._timer = window.setTimeout(() => {
      this._now = Date.now(), this._timer = window.setInterval(() => this._now = Date.now(), ot);
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
      const e = t.get("hass"), s = this._config?.entity;
      return !e || !s ? !0 : e.states[s] !== this.hass?.states[s] || e.locale !== this.hass?.locale;
    }
    return !0;
  }
  // ---- render -------------------------------------------------------------
  render() {
    const t = this._config, e = this.hass;
    if (!t || !e) return d;
    if (!t.entity) return this._error(m(e, "errors.no_entity"));
    const s = e.states[t.entity];
    if (!s) return this._error(m(e, "errors.not_found", { entity: t.entity }));
    if (s.state === "unavailable")
      return this._error(m(e, "errors.unavailable", { entity: t.entity }), "warning");
    const n = Le(s), o = this._now, a = t.name ?? n.station ?? t.entity, r = Ut(n.events, o), h = s.last_updated ? Date.parse(s.last_updated) : NaN, l = [];
    for (const c of n.warnings) l.push(this._alert(c, "warning"));
    if (n.events.length === 0)
      l.push(this._alert(m(e, "no_forecast"), "info"));
    else if (!r) {
      const c = Number.isFinite(h) ? nt(o - h) : "?";
      l.push(this._alert(m(e, "stale", { ago: c }), "warning"));
    }
    return $`
      <ha-card>
        <div class="card">
          ${l}
          ${t.show_header ? this._header(a, n, o) : d}
          ${t.show_curve && n.events.length > 1 ? this._chart(n, o) : d}
          ${t.show_events && n.events.length > 0 ? this._events(n, o) : d}
          ${this._footer(n)}
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
    const n = this.hass, o = st(this._config, n), a = R(n), r = Ae(e.events, s), h = Ut(e.events, s), l = r === "rising" ? "mdi:wave-arrow-up" : r === "falling" ? "mdi:wave-arrow-down" : "mdi:wave", c = m(n, `state.${r ?? "unknown"}`);
    return $`
      <div class="header">
        <div class="title-row">
          <div class="title">${t}</div>
          <div class="state ${r ?? ""}">
            <ha-icon icon=${l}></ha-icon>
            <span>${c}</span>
          </div>
        </div>
        ${h ? $`<div class="next">
              <span class="kind ${h.type}">${m(n, h.type)}</span>
              <span class="height">${Rt(h.height, o, a)}</span>
              <span class="when">
                ${m(n, "in", { duration: nt(h.time - s) })}
                · ${it(h.time, s, n)}
              </span>
            </div>` : d}
      </div>
    `;
  }
  _chart(t, e) {
    const s = this.hass, n = this._config, o = st(n, s), a = R(s), r = this._width || 300, h = Re({
      events: t.events,
      curve: t.curve,
      now: e,
      hoursBack: n.hours_back,
      hoursAhead: n.hours_ahead,
      width: r,
      height: jt,
      toDisplay: (l) => Jt(l, o),
      hourOf: hs(s)
    });
    return $`<div class="chart">${h.empty ? d : this._svg(h, a)}</div>`;
  }
  _svg(t, e) {
    const s = this.hass, { plot: n } = t, o = `otc-clip-${Math.round(t.width)}`, a = t.approximate;
    return k`
      <svg
        class="curve ${a ? "approx" : ""}"
        viewBox="0 0 ${t.width} ${t.height}"
        width=${t.width}
        height=${t.height}
        role="img"
        aria-label=${a ? m(s, "approximate") : ""}
      >
        <defs>
          <clipPath id=${o}>
            <rect x=${n.x0} y=${n.y0} width=${n.x1 - n.x0} height=${n.y1 - n.y0}></rect>
          </clipPath>
        </defs>
        ${t.yTicks.map(
      (r) => k`
            <line class="grid" x1=${n.x0} x2=${n.x1} y1=${r.y} y2=${r.y}></line>
            <text class="ylabel" x=${n.x0 - 6} y=${r.y} dy="0.35em" text-anchor="end">
              ${It(r.value, e, 1)}
            </text>`
    )}
        ${t.xTicks.map(
      (r) => k`
            <line class="grid ${r.major ? "major" : ""}" x1=${r.x} x2=${r.x} y1=${n.y0} y2=${n.y1}></line>
            <text class="xlabel ${r.major ? "major" : ""}" x=${r.x} y=${n.y1 + 14} text-anchor="middle">
              ${r.major ? Yt(r.time, s) : Xt(r.time, s)}
            </text>`
    )}
        <g clip-path="url(#${o})">
          <path class="area" d=${t.areaPath}></path>
          <path class="line" d=${t.linePath}>
            ${a ? k`<title>${m(s, "approximate")}</title>` : d}
          </path>
        </g>
        <line class="now" x1=${t.now.x} x2=${t.now.x} y1=${n.y0} y2=${n.y1}></line>
        ${t.now.y !== null ? k`<circle class="now-dot" cx=${t.now.x} cy=${t.now.y} r="3.5"></circle>` : d}
        ${t.markers.map((r) => {
      const h = r.below ? r.y + 14 : r.y - 8, l = It(r.height, e, 1);
      return k`
            <circle class="marker ${r.type}" cx=${r.x} cy=${r.y} r="3.5">
              <title>${m(s, r.type)} ${l} ${it(r.time, t.domain.t0, s)}</title>
            </circle>
            <text class="mlabel ${r.type}" x=${r.x} y=${h} text-anchor="middle">${l}</text>`;
    })}
      </svg>
    `;
  }
  _events(t, e) {
    const s = this.hass, n = this._config, o = st(n, s), a = R(s), r = t.events.filter((h) => h.time > e).slice(0, n.events_count);
    return r.length === 0 ? $`<div class="events empty">${m(s, "no_upcoming")}</div>` : $`
      <div class="events">
        ${r.map((h) => {
      const l = h.time - e;
      return $`
            <div class="row">
              <ha-icon class="${h.type}" icon=${h.type === "high" ? "mdi:arrow-up-thin" : "mdi:arrow-down-thin"}></ha-icon>
              <span class="kind">${m(s, h.type)}</span>
              <span class="time">${it(h.time, e, s)}</span>
              <span class="rel">${m(s, "in", { duration: nt(l) })}</span>
              <span class="height">${Rt(h.height, o, a, 2)}</span>
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
        ${t.datum ? $`<span class="datum">${m(e, "datum", { datum: t.datum })}</span>` : d}
      </div>
    `;
  }
};
G.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _now: { state: !0 },
  _width: { state: !0 }
}, G.styles = Lt`
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
      grid-template-columns: 24px auto 1fr auto auto;
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
    }
    .row .rel {
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    .row .height {
      font-variant-numeric: tabular-nums;
      text-align: right;
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
let ct = G;
customElements.get(S) || customElements.define(S, ct);
customElements.get(`${S}-editor`) || customElements.define(`${S}-editor`, lt);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: S,
  name: "Open Tides Card",
  description: "Tide curve, state and next high/low from the open_tides integration.",
  preview: !0,
  documentationURL: "https://github.com/gerrowadat/open-tides-card"
});
export {
  ct as OpenTidesCard
};
