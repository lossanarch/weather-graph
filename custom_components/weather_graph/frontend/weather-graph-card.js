/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const pt = globalThis, Wt = pt.ShadowRoot && (pt.ShadyCSS === void 0 || pt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, zt = Symbol(), qt = /* @__PURE__ */ new WeakMap();
let me = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== zt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Wt && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = qt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && qt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ie = (i) => new me(typeof i == "string" ? i : i + "", void 0, zt), Ft = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, r, n) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[n + 1], i[0]);
  return new me(e, i, zt);
}, Re = (i, t) => {
  if (Wt) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), r = pt.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = e.cssText, i.appendChild(s);
  }
}, Jt = Wt ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Ie(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: He, defineProperty: De, getOwnPropertyDescriptor: Oe, getOwnPropertyNames: Le, getOwnPropertySymbols: Ue, getPrototypeOf: We } = Object, O = globalThis, Qt = O.trustedTypes, ze = Qt ? Qt.emptyScript : "", vt = O.reactiveElementPolyfillSupport, ot = (i, t) => i, Pt = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? ze : null;
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
} }, we = (i, t) => !He(i, t), te = { attribute: !0, type: String, converter: Pt, reflect: !1, useDefault: !1, hasChanged: we };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), O.litPropertyMetadata ?? (O.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let K = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = te) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, e);
      r !== void 0 && De(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: r, set: n } = Oe(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const a = r == null ? void 0 : r.call(this);
      n == null || n.call(this, o), this.requestUpdate(t, a, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? te;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ot("elementProperties"))) return;
    const t = We(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ot("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ot("properties"))) {
      const e = this.properties, s = [...Le(e), ...Ue(e)];
      for (const r of s) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, r] of e) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const r = this._$Eu(e, s);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const r of s) e.unshift(Jt(r));
    } else t !== void 0 && e.push(Jt(t));
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
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Re(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostConnected) == null ? void 0 : s.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostDisconnected) == null ? void 0 : s.call(e);
    });
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    var n;
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const o = (((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0 ? s.converter : Pt).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var n, o;
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const a = s.getPropertyOptions(r), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : Pt;
      this._$Em = r;
      const l = c.fromAttribute(e, a.type);
      this[r] = l ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, r = !1, n) {
    var o;
    if (t !== void 0) {
      const a = this.constructor;
      if (r === !1 && (n = this[t]), s ?? (s = a.getPropertyOptions(t)), !((s.hasChanged ?? we)(n, e) || s.useDefault && s.reflect && n === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(a._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: r, wrapped: n }, o) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [n, o] of r) {
        const { wrapped: a } = o, c = this[n];
        a !== !0 || this._$AL.has(n) || c === void 0 || this.C(n, void 0, o, c);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (s = this._$EO) == null || s.forEach((r) => {
        var n;
        return (n = r.hostUpdate) == null ? void 0 : n.call(r);
      }), this.update(e)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((s) => {
      var r;
      return (r = s.hostUpdated) == null ? void 0 : r.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
K.elementStyles = [], K.shadowRootOptions = { mode: "open" }, K[ot("elementProperties")] = /* @__PURE__ */ new Map(), K[ot("finalized")] = /* @__PURE__ */ new Map(), vt == null || vt({ ReactiveElement: K }), (O.reactiveElementVersions ?? (O.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at = globalThis, ee = (i) => i, ft = at.trustedTypes, se = ft ? ft.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, _e = "$lit$", D = `lit$${Math.random().toFixed(9).slice(2)}$`, ye = "?" + D, Fe = `<${ye}>`, B = document, lt = () => B.createComment(""), ct = (i) => i === null || typeof i != "object" && typeof i != "function", Bt = Array.isArray, Be = (i) => Bt(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", kt = `[ 	
\f\r]`, et = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ie = /-->/g, re = />/g, U = RegExp(`>|${kt}(?:([^\\s"'>=/]+)(${kt}*=${kt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ne = /'/g, oe = /"/g, $e = /^(?:script|style|textarea|title)$/i, xe = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), y = xe(1), _ = xe(2), X = Symbol.for("lit-noChange"), b = Symbol.for("lit-nothing"), ae = /* @__PURE__ */ new WeakMap(), W = B.createTreeWalker(B, 129);
function be(i, t) {
  if (!Bt(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return se !== void 0 ? se.createHTML(t) : t;
}
const Xe = (i, t) => {
  const e = i.length - 1, s = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = et;
  for (let a = 0; a < e; a++) {
    const c = i[a];
    let l, d, h = -1, u = 0;
    for (; u < c.length && (o.lastIndex = u, d = o.exec(c), d !== null); ) u = o.lastIndex, o === et ? d[1] === "!--" ? o = ie : d[1] !== void 0 ? o = re : d[2] !== void 0 ? ($e.test(d[2]) && (r = RegExp("</" + d[2], "g")), o = U) : d[3] !== void 0 && (o = U) : o === U ? d[0] === ">" ? (o = r ?? et, h = -1) : d[1] === void 0 ? h = -2 : (h = o.lastIndex - d[2].length, l = d[1], o = d[3] === void 0 ? U : d[3] === '"' ? oe : ne) : o === oe || o === ne ? o = U : o === ie || o === re ? o = et : (o = U, r = void 0);
    const w = o === U && i[a + 1].startsWith("/>") ? " " : "";
    n += o === et ? c + Fe : h >= 0 ? (s.push(l), c.slice(0, h) + _e + c.slice(h) + D + w) : c + D + (h === -2 ? a : w);
  }
  return [be(i, n + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class dt {
  constructor({ strings: t, _$litType$: e }, s) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = t.length - 1, c = this.parts, [l, d] = Xe(t, e);
    if (this.el = dt.createElement(l, s), W.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (r = W.nextNode()) !== null && c.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const h of r.getAttributeNames()) if (h.endsWith(_e)) {
          const u = d[o++], w = r.getAttribute(h).split(D), p = /([.?@])?(.*)/.exec(u);
          c.push({ type: 1, index: n, name: p[2], strings: w, ctor: p[1] === "." ? Ve : p[1] === "?" ? Ge : p[1] === "@" ? Ze : xt }), r.removeAttribute(h);
        } else h.startsWith(D) && (c.push({ type: 6, index: n }), r.removeAttribute(h));
        if ($e.test(r.tagName)) {
          const h = r.textContent.split(D), u = h.length - 1;
          if (u > 0) {
            r.textContent = ft ? ft.emptyScript : "";
            for (let w = 0; w < u; w++) r.append(h[w], lt()), W.nextNode(), c.push({ type: 2, index: ++n });
            r.append(h[u], lt());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ye) c.push({ type: 2, index: n });
      else {
        let h = -1;
        for (; (h = r.data.indexOf(D, h + 1)) !== -1; ) c.push({ type: 7, index: n }), h += D.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const s = B.createElement("template");
    return s.innerHTML = t, s;
  }
}
function Y(i, t, e = i, s) {
  var o, a;
  if (t === X) return t;
  let r = s !== void 0 ? (o = e._$Co) == null ? void 0 : o[s] : e._$Cl;
  const n = ct(t) ? void 0 : t._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), n === void 0 ? r = void 0 : (r = new n(i), r._$AT(i, e, s)), s !== void 0 ? (e._$Co ?? (e._$Co = []))[s] = r : e._$Cl = r), r !== void 0 && (t = Y(i, r._$AS(i, t.values), r, s)), t;
}
class je {
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
    const { el: { content: e }, parts: s } = this._$AD, r = ((t == null ? void 0 : t.creationScope) ?? B).importNode(e, !0);
    W.currentNode = r;
    let n = W.nextNode(), o = 0, a = 0, c = s[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let l;
        c.type === 2 ? l = new ht(n, n.nextSibling, this, t) : c.type === 1 ? l = new c.ctor(n, c.name, c.strings, this, t) : c.type === 6 && (l = new Ke(n, this, t)), this._$AV.push(l), c = s[++a];
      }
      o !== (c == null ? void 0 : c.index) && (n = W.nextNode(), o++);
    }
    return W.currentNode = B, r;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class ht {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, s, r) {
    this.type = 2, this._$AH = b, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = Y(this, t, e), ct(t) ? t === b || t == null || t === "" ? (this._$AH !== b && this._$AR(), this._$AH = b) : t !== this._$AH && t !== X && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Be(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== b && ct(this._$AH) ? this._$AA.nextSibling.data = t : this.T(B.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: e, _$litType$: s } = t, r = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = dt.createElement(be(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(e);
    else {
      const o = new je(r, this), a = o.u(this.options);
      o.p(e), this.T(a), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = ae.get(t.strings);
    return e === void 0 && ae.set(t.strings, e = new dt(t)), e;
  }
  k(t) {
    Bt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, r = 0;
    for (const n of t) r === e.length ? e.push(s = new ht(this.O(lt()), this.O(lt()), this, this.options)) : s = e[r], s._$AI(n), r++;
    r < e.length && (this._$AR(s && s._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, e); t !== this._$AB; ) {
      const r = ee(t).nextSibling;
      ee(t).remove(), t = r;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class xt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, r, n) {
    this.type = 1, this._$AH = b, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = b;
  }
  _$AI(t, e = this, s, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = Y(this, t, e, 0), o = !ct(t) || t !== this._$AH && t !== X, o && (this._$AH = t);
    else {
      const a = t;
      let c, l;
      for (t = n[0], c = 0; c < n.length - 1; c++) l = Y(this, a[s + c], e, c), l === X && (l = this._$AH[c]), o || (o = !ct(l) || l !== this._$AH[c]), l === b ? t = b : t !== b && (t += (l ?? "") + n[c + 1]), this._$AH[c] = l;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === b ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ve extends xt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === b ? void 0 : t;
  }
}
class Ge extends xt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== b);
  }
}
class Ze extends xt {
  constructor(t, e, s, r, n) {
    super(t, e, s, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = Y(this, t, e, 0) ?? b) === X) return;
    const s = this._$AH, r = t === b && s !== b || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== b && (s === b || r);
    r && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ke {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Y(this, t);
  }
}
const St = at.litHtmlPolyfillSupport;
St == null || St(dt, ht), (at.litHtmlVersions ?? (at.litHtmlVersions = [])).push("3.3.3");
const Ye = (i, t, e) => {
  const s = (e == null ? void 0 : e.renderBefore) ?? t;
  let r = s._$litPart$;
  if (r === void 0) {
    const n = (e == null ? void 0 : e.renderBefore) ?? null;
    s._$litPart$ = r = new ht(t.insertBefore(lt(), n), n, void 0, e ?? {});
  }
  return r._$AI(i), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = globalThis;
let F = class extends K {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ye(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return X;
  }
};
var fe;
F._$litElement$ = !0, F.finalized = !0, (fe = z.litElementHydrateSupport) == null || fe.call(z, { LitElement: F });
const At = z.litElementPolyfillSupport;
At == null || At({ LitElement: F });
(z.litElementVersions ?? (z.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qe = { ATTRIBUTE: 1 }, Je = (i) => (...t) => ({ _$litDirective$: i, values: t });
let Qe = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, s) {
    this._$Ct = t, this._$AM = e, this._$Ci = s;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
};
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ve = "important", ts = " !" + ve, es = Je(class extends Qe {
  constructor(i) {
    var t;
    if (super(i), i.type !== qe.ATTRIBUTE || i.name !== "style" || ((t = i.strings) == null ? void 0 : t.length) > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(i) {
    return Object.keys(i).reduce((t, e) => {
      const s = i[e];
      return s == null ? t : t + `${e = e.includes("-") ? e : e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s};`;
    }, "");
  }
  update(i, [t]) {
    const { style: e } = i.element;
    if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
    for (const s of this.ft) t[s] == null && (this.ft.delete(s), s.includes("-") ? e.removeProperty(s) : e[s] = null);
    for (const s in t) {
      const r = t[s];
      if (r != null) {
        this.ft.add(s);
        const n = typeof r == "string" && r.endsWith(ts);
        s.includes("-") || n ? e.setProperty(s, n ? r.slice(0, -11) : r, n ? ve : "") : e[s] = r;
      }
    }
    return X;
  }
});
function ke(i, t, e) {
  switch ((i ?? "").trim().toLowerCase()) {
    case "sunny":
      return e ? "clear-night" : "sunny";
    case "clear":
      return e ? "clear-night" : "sunny";
    case "mostly_sunny":
      return e ? "partly-cloudy-night" : "mostly-sunny";
    case "partly_cloudy":
      return e ? "partly-cloudy-night" : "partly-cloudy-day";
    case "cloudy":
      return "cloudy";
    case "light_shower":
    case "light_showers":
    case "light_rain":
    case "shower":
    case "showers":
      return e ? "light-shower-night" : "light-shower-day";
    case "rain":
    case "heavy_shower":
    case "heavy_showers":
      return "heavy-rain";
    case "storm":
    case "storms":
      return e ? "storm-night" : "storm-day";
    case "fog":
    case "haze":
    case "hazy":
    case "dust":
    case "dusty":
      return "fog";
    case "wind":
    case "windy":
      return "wind";
    case "snow":
    case "frost":
      return "snow";
    case "cyclone":
    case "tropical_cyclone":
      return "cyclone";
  }
  switch ((t ?? "").trim().toLowerCase()) {
    case "sunny":
      return e ? "clear-night" : "sunny";
    case "clear-night":
      return "clear-night";
    case "partlycloudy":
      return e ? "partly-cloudy-night" : "partly-cloudy-day";
    case "cloudy":
      return "cloudy";
    case "rainy":
      return e ? "light-shower-night" : "light-shower-day";
    case "pouring":
      return "heavy-rain";
    case "lightning":
    case "lightning-rainy":
      return e ? "storm-night" : "storm-day";
    case "fog":
      return "fog";
    case "windy":
    case "windy-variant":
      return "wind";
    case "snowy":
    case "snowy-rainy":
    case "hail":
      return "snow";
    case "exceptional":
      return "cyclone";
    default:
      return e ? "partly-cloudy-night" : "partly-cloudy-day";
  }
}
const st = (i = 16, t = 15, e = 7.2) => _`
  <g>
    <g stroke="#f6bd2b" stroke-width="2.1" stroke-linecap="round">
      <line x1=${i} y1=${t - e - 4.2} x2=${i} y2=${t - e - 1.8} />
      <line x1=${i} y1=${t + e + 1.8} x2=${i} y2=${t + e + 4.2} />
      <line x1=${i - e - 4.2} y1=${t} x2=${i - e - 1.8} y2=${t} />
      <line x1=${i + e + 1.8} y1=${t} x2=${i + e + 4.2} y2=${t} />
      <line x1=${i - (e + 2.8) * 0.71} y1=${t - (e + 2.8) * 0.71} x2=${i - (e + 0.9) * 0.71} y2=${t - (e + 0.9) * 0.71} />
      <line x1=${i + (e + 0.9) * 0.71} y1=${t + (e + 0.9) * 0.71} x2=${i + (e + 2.8) * 0.71} y2=${t + (e + 2.8) * 0.71} />
      <line x1=${i + (e + 2.8) * 0.71} y1=${t - (e + 2.8) * 0.71} x2=${i + (e + 0.9) * 0.71} y2=${t - (e + 0.9) * 0.71} />
      <line x1=${i - (e + 0.9) * 0.71} y1=${t + (e + 0.9) * 0.71} x2=${i - (e + 2.8) * 0.71} y2=${t + (e + 2.8) * 0.71} />
    </g>
    <circle cx=${i} cy=${t} r=${e} fill="#f8c630" />
  </g>
`, Et = (i = 0, t = 0) => _`
  <path
    transform="translate(${i}, ${t})"
    d="M18.2 7.2A8.3 8.3 0 0 0 10.6 18.8 8.4 8.4 0 0 0 22.4 20.1 6.9 6.9 0 0 1 18.2 7.2Z"
    fill="#9eb1c4"
  />
`, C = (i = 0, t = 0) => _`
  <path
    transform="translate(${i}, ${t})"
    d="M13.2 26.8H29.4A5.4 5.4 0 0 0 30.1 16.1 7.6 7.6 0 0 0 15.6 14.3 6.2 6.2 0 0 0 13.2 26.8Z"
    fill="#f1f5f9"
  />
`, G = (i = 0, t = 0) => _`
  <path
    transform="translate(${i}, ${t})"
    d="M9.5 23.6H23.2A4.6 4.6 0 0 0 23.8 14.5 6.4 6.4 0 0 0 11.5 13 5.2 5.2 0 0 0 9.5 23.6Z"
    fill="#94a8be"
  />
`, Mt = (i = 3, t = 28.5) => i === 2 ? _`
      <g style="fill: var(--wg-rain, #4cc9f0)">
        <circle cx="18.5" cy=${t + 1.5} r="1.45" />
        <circle cx="24.5" cy=${t + 3.2} r="1.45" />
      </g>
    ` : i === 4 ? _`
      <g style="stroke: var(--wg-rain, #4cc9f0)" stroke-width="2.1" stroke-linecap="round">
        <line x1="14.5" y1=${t} x2="12.8" y2=${t + 5} />
        <line x1="19.5" y1=${t + 0.8} x2="17.8" y2=${t + 5.8} />
        <line x1="24.5" y1=${t} x2="22.8" y2=${t + 5} />
        <line x1="29.2" y1=${t + 0.8} x2="27.5" y2=${t + 5.8} />
      </g>
    ` : _`
    <g style="fill: var(--wg-rain, #4cc9f0)">
      <circle cx="16.5" cy=${t + 1.2} r="1.4" />
      <circle cx="21.5" cy=${t + 3.6} r="1.4" />
      <circle cx="26.2" cy=${t + 1.4} r="1.4" />
    </g>
  `, le = () => _`
  <polygon
    points="22.8,22.2 18.2,29.2 21.8,29.2 19.9,35.6 27.4,27.3 23.4,27.3"
    fill="#38bdf8"
    style="stroke: var(--wg-bg, #0d1e33)"
    stroke-width="0.6"
    stroke-linejoin="round"
  />
`;
function Se(i) {
  switch (i) {
    case "sunny":
      return st(20, 20, 8.2);
    case "clear-night":
      return _`
        <path
          d="M23.5 8.5A11.2 11.2 0 1 0 32.5 24.5 9.2 9.2 0 0 1 23.5 8.5Z"
          fill="#cbd5e1"
        />
      `;
    case "mostly-sunny":
      return _`
        <g>
          ${st(15.5, 15.5, 6.8)}
          ${C(2, 2)}
        </g>
      `;
    case "partly-cloudy-day":
      return _`
        <g>
          ${st(15, 15, 6.5)}
          ${G(5, 1)}
          ${C(1, 2.5)}
        </g>
      `;
    case "partly-cloudy-night":
      return _`
        <g>
          ${Et(-1, 0)}
          ${G(5, 2)}
          ${C(1, 3)}
        </g>
      `;
    case "cloudy":
      return _`
        <g>
          ${G(0, -1)}
          ${C(1, 3)}
        </g>
      `;
    case "light-shower-day":
      return _`
        <g>
          ${st(14.5, 13.5, 5.8)}
          ${C(0, 0)}
          ${Mt(3, 28)}
        </g>
      `;
    case "light-shower-night":
      return _`
        <g>
          ${Et(-2, -2)}
          ${G(4, -1)}
          ${C(0, 0.5)}
          ${Mt(3, 28.5)}
        </g>
      `;
    case "rain":
    case "heavy-rain":
      return _`
        <g>
          ${G(0, -2.5)}
          ${C(1, 0)}
          ${Mt(4, 28.2)}
        </g>
      `;
    case "storm-day":
      return _`
        <g>
          ${st(14.5, 13.8, 6.1)}
          ${C(0.5, 0.5)}
          ${le()}
        </g>
      `;
    case "storm-night":
      return _`
        <g>
          ${Et(-2, -2)}
          ${G(3, -1.5)}
          ${C(0.5, 0.5)}
          ${le()}
        </g>
      `;
    case "fog":
      return _`
        <g>
          ${C(-1, -2)}
          <g stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round">
            <line x1="10" y1="28.5" x2="30" y2="28.5" />
            <line x1="12.5" y1="33" x2="27.5" y2="33" />
          </g>
        </g>
      `;
    case "wind":
      return _`
        <g fill="none" stroke="#e2e8f0" stroke-width="2.3" stroke-linecap="round">
          <path d="M7 16.5H25.5A3.5 3.5 0 1 0 22 13" />
          <path d="M5 22H29.5A3.8 3.8 0 1 1 25.8 25.8" />
          <path d="M9 27.5H20.5" />
        </g>
      `;
    case "snow":
      return _`
        <g>
          ${C(0, -1)}
          <g fill="#bae6fd">
            <circle cx="16" cy="30.5" r="1.8" />
            <circle cx="22" cy="33" r="1.8" />
            <circle cx="27.5" cy="30.5" r="1.8" />
          </g>
        </g>
      `;
    case "cyclone":
      return _`
        <g fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round">
          <circle cx="20" cy="20" r="5" />
          <path d="M20 15C26 15 30 10 31 7" />
          <path d="M20 25C14 25 10 30 9 33" />
        </g>
      `;
  }
}
function ss(i, t = 36) {
  return y`
    <svg
      width=${t}
      height=${t}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      ${Se(i)}
    </svg>
  `;
}
function is(i, t, e, s = 32) {
  return _`
    <svg
      x=${t}
      y=${e}
      width=${s}
      height=${s}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      ${Se(i)}
    </svg>
  `;
}
function rs(i = 18) {
  return y`
    <svg
      width=${i}
      height=${i}
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 2.2C10 2.2 3.2 10.4 3.2 15.1A6.8 6.8 0 0 0 16.8 15.1C16.8 10.4 10 2.2 10 2.2Z"
        style="fill: var(--wg-rain, #4cc9f0)"
      />
    </svg>
  `;
}
function ns(i = 16) {
  return y`
    <svg
      width=${i}
      height=${i}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 2.2L16.4 17.4L10 13.9L3.6 17.4L10 2.2Z"
        fill="currentColor"
      />
    </svg>
  `;
}
const os = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW"
], ce = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5
};
function Ae(i, t) {
  if (i == null || t === null || t === void 0 || !Number.isFinite(i) || !Number.isFinite(t) || t <= 0)
    return null;
  const e = Math.max(1, Math.min(100, t)), s = 17.27, r = 237.7, n = s * i / (r + i) + Math.log(e / 100), o = s - n;
  return Math.abs(o) < 1e-9 ? null : Math.round(r * n / o * 10) / 10;
}
function Xt(i) {
  if (i == null)
    return { cardinal: null, degrees: null };
  if (typeof i == "number") {
    if (!Number.isFinite(i))
      return { cardinal: null, degrees: null };
    const t = (i % 360 + 360) % 360, e = Math.floor((t + 11.25) / 22.5) % 16;
    return {
      cardinal: os[e],
      degrees: Math.round(t * 10) / 10
    };
  }
  if (typeof i == "string") {
    const t = i.trim().toUpperCase();
    if (!t || t === "CALM" || t === "UNAVAILABLE" || t === "UNKNOWN")
      return { cardinal: null, degrees: null };
    if (t in ce)
      return { cardinal: t, degrees: ce[t] };
    const e = Number(t);
    if (Number.isFinite(e))
      return Xt(e);
  }
  return { cardinal: null, degrees: null };
}
function as(i) {
  return i == null || !Number.isFinite(i) ? 0 : ((i + 180) % 360 + 360) % 360;
}
function ls(i, t) {
  if (!i || typeof i != "string")
    return null;
  const e = i.trim();
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(e)) {
    const h = Date.parse(e);
    return Number.isFinite(h) ? h : null;
  }
  const r = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(e);
  if (!r) {
    const h = Date.parse(e);
    return Number.isFinite(h) ? h : null;
  }
  const n = Number(r[1]), o = Number(r[2]), a = Number(r[3]), c = Number(r[4]), l = Number(r[5]), d = Number(r[6] ?? "0");
  try {
    const h = Date.UTC(n, o - 1, a, c, l, d), w = new Intl.DateTimeFormat("en-US", {
      timeZone: t,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date(h)), p = {};
    for (const S of w)
      S.type !== "literal" && (p[S.type] = Number(S.value));
    const k = Date.UTC(
      p.year,
      (p.month ?? 1) - 1,
      p.day ?? 1,
      p.hour ?? 0,
      p.minute ?? 0,
      p.second ?? 0
    ) - h;
    return h - k;
  } catch {
    return new Date(n, o - 1, a, c, l, d).getTime();
  }
}
function mt(i, t) {
  try {
    const s = new Intl.DateTimeFormat("en-US", {
      timeZone: t || void 0,
      hour: "numeric",
      hourCycle: "h23"
    }).formatToParts(new Date(i)).find((r) => r.type === "hour");
    return s ? Number(s.value) % 24 : new Date(i).getHours();
  } catch {
    return new Date(i).getHours();
  }
}
function cs(i, t) {
  var e, s, r;
  try {
    const n = {
      weekday: "short",
      hour: "numeric",
      hour12: !0,
      ...t ? { timeZone: t } : {}
    }, o = new Intl.DateTimeFormat("en-US", n).formatToParts(
      new Date(i)
    ), a = (((e = o.find((d) => d.type === "weekday")) == null ? void 0 : e.value) ?? "").toUpperCase(), c = ((s = o.find((d) => d.type === "hour")) == null ? void 0 : s.value) ?? "", l = (((r = o.find((d) => d.type === "dayPeriod")) == null ? void 0 : r.value) ?? "").toUpperCase();
    return `${a} ${c}${l}`.trim();
  } catch {
    const n = new Date(i), o = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], a = n.getHours(), c = a >= 12 ? "PM" : "AM", l = a % 12 || 12;
    return `${o[n.getDay()]} ${l}${c}`;
  }
}
function ds(i, t) {
  const e = mt(i, t), s = e >= 12 ? "pm" : "am";
  return `${e % 12 || 12}${s}`;
}
function hs(i, t) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      ...t ? { timeZone: t } : {}
    }).format(new Date(i)).toUpperCase();
  } catch {
    return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(i).getDay()];
  }
}
function us(i) {
  const e = i.map((h) => h.temperature).filter((h) => h !== null && Number.isFinite(h));
  let s = 5, r = 10;
  if (e.length > 0) {
    const h = Math.min(...e), u = Math.max(...e);
    u - h > 18 ? s = 10 : s = 5;
    const p = s * 4, $ = (h + u) / 2;
    r = Math.round(($ - p / 2) / s) * s, h <= r + 0.5 && (r = Math.floor((h - 1) / s) * s), u >= r + p - 0.5 && (u - r > p ? (s = Math.ceil((u - h + 4) / 4 / 5) * 5, r = Math.floor((h - 1) / 5) * 5) : r = Math.ceil((u + 1 - p) / s) * s);
  }
  const n = Array.from(
    { length: 5 },
    (h, u) => r + u * s
  ), o = i.map((h) => h.wind_speed_kmh).filter((h) => Number.isFinite(h)), a = o.length > 0 ? Math.max(...o) : 25, c = [10, 15, 20, 25, 30];
  let l = 10;
  for (const h of c) {
    if (h * 4 >= Math.max(32, a * 1.12)) {
      l = h;
      break;
    }
    l = h;
  }
  const d = Array.from({ length: 5 }, (h, u) => u * l);
  return {
    temp: {
      min: n[0],
      max: n[4],
      step: s,
      ticks: n
    },
    wind: {
      min: 0,
      max: d[4],
      step: l,
      ticks: d
    },
    gridCount: 5
  };
}
function de(i, t) {
  var n;
  if (!(i != null && i.states))
    return t || null;
  if (t) {
    const o = i.states[t], a = Number(((n = o == null ? void 0 : o.attributes) == null ? void 0 : n.supported_features) ?? 0);
    if (o && (a & 2) !== 0)
      return t;
    const c = t.endsWith("_hourly") ? t : `${t}_hourly`;
    if (i.states[c])
      return c;
    if (o)
      return t;
  }
  const e = Object.keys(i.states).filter(
    (o) => o.startsWith("weather.")
  ), s = e.find((o) => o.endsWith("_hourly"));
  if (s)
    return s;
  const r = e.find((o) => {
    var c, l;
    return (Number(((l = (c = i.states[o]) == null ? void 0 : c.attributes) == null ? void 0 : l.supported_features) ?? 0) & 2) !== 0;
  });
  return r || (e[0] ?? null);
}
function I(i) {
  if (i == null || typeof i == "boolean")
    return null;
  const t = Number(i);
  return Number.isFinite(t) ? t : null;
}
function Ct(i, t) {
  return i === null ? null : t.toUpperCase().includes("F") ? Math.round((i - 32) * 5 / 9 * 10) / 10 : Math.round(i * 10) / 10;
}
function he(i, t) {
  if (i === null) return null;
  const e = (t ?? "km/h").trim().toLowerCase();
  return e === "mph" || e === "mi/h" ? Math.round(i * 1.60934 * 10) / 10 : e === "m/s" || e === "mps" ? Math.round(i * 3.6 * 10) / 10 : e === "kn" || e === "kt" || e === "knots" ? Math.round(i * 1.852 * 10) / 10 : Math.round(i * 10) / 10;
}
function ps(i, t, e, s = 48) {
  var w, p, $, k, S;
  const r = t.states[e], n = (r == null ? void 0 : r.attributes) ?? {}, o = ((w = t.config) == null ? void 0 : w.time_zone) || "UTC", a = n.temperature_unit || (($ = (p = t.config) == null ? void 0 : p.unit_system) == null ? void 0 : $.temperature) || "°C", c = n.wind_speed_unit || ((S = (k = t.config) == null ? void 0 : k.unit_system) == null ? void 0 : S.wind_speed) || "km/h", l = t.states["sun.sun"], d = [];
  if (l != null && l.attributes) {
    const m = l.attributes.next_rising, P = l.attributes.next_setting, M = m ? Date.parse(m) : NaN, N = P ? Date.parse(P) : NaN;
    (Number.isFinite(M) || Number.isFinite(N)) && d.push({
      sunrise: Number.isFinite(M) ? new Date(M).toISOString() : null,
      sunrise_ms: Number.isFinite(M) ? M : null,
      sunset: Number.isFinite(N) ? new Date(N).toISOString() : null,
      sunset_ms: Number.isFinite(N) ? N : null
    });
  }
  const h = Math.max(1, Math.min(72, s)), u = [];
  for (const m of i) {
    const P = String(m.datetime ?? ""), M = ls(P, o);
    if (M === null) continue;
    const N = Ct(
      I(m.temperature ?? m.native_temperature),
      a
    ), bt = Ct(
      I(m.apparent_temperature ?? m.native_apparent_temperature),
      a
    ), L = I(m.humidity), g = Ct(
      I(m.dew_point ?? m.native_dew_point),
      a
    ) ?? Ae(N, L), f = I(m.precipitation_probability) ?? 0, v = I(m.precipitation ?? m.native_precipitation), V = he(I(m.wind_speed ?? m.native_wind_speed), c) ?? 0, tt = he(
      I(m.wind_gust_speed ?? m.native_wind_gust_speed),
      c
    ), { cardinal: Zt, degrees: ut } = Xt(
      m.wind_bearing
    ), Kt = String(m.condition ?? "partlycloudy"), Yt = mt(M, o), Pe = !!m.is_night || Kt === "clear-night" || Yt < 6 || Yt >= 19;
    if (u.push({
      datetime: P,
      epoch_ms: M,
      temperature: N,
      feels_like: bt,
      humidity: L,
      dew_point: g,
      rain_chance: Math.max(0, Math.min(100, f)),
      rain_min_mm: null,
      rain_max_mm: v,
      wind_speed_kmh: Math.max(0, V),
      wind_gust_kmh: tt,
      wind_direction: Zt,
      wind_bearing_deg: ut,
      icon_descriptor: m.icon_descriptor ?? null,
      condition: Kt,
      is_night: Pe,
      uv_index: I(m.uv_index)
    }), u.length >= h) break;
  }
  return {
    source: "homeassistant_weather",
    entity_id: e,
    location: {
      name: String(n.friendly_name ?? e),
      state: null,
      timezone: o
    },
    units: {
      temperature: "°C",
      wind_speed: "km/h",
      precipitation: "mm"
    },
    current: null,
    sun_windows: d,
    hourly: u
  };
}
function gt(i) {
  if (i.length === 0) return "";
  if (i.length === 1)
    return `M ${x(i[0].x)} ${x(i[0].y)}`;
  if (i.length === 2)
    return `M ${x(i[0].x)} ${x(i[0].y)} L ${x(i[1].x)} ${x(i[1].y)}`;
  const t = i.length, e = new Array(t - 1), s = new Array(t - 1), r = new Array(t - 1);
  for (let a = 0; a < t - 1; a++)
    e[a] = i[a + 1].x - i[a].x, s[a] = i[a + 1].y - i[a].y, r[a] = e[a] !== 0 ? s[a] / e[a] : 0;
  const n = new Array(t);
  n[0] = r[0], n[t - 1] = r[t - 2];
  for (let a = 1; a < t - 1; a++)
    if (r[a - 1] * r[a] <= 0)
      n[a] = 0;
    else {
      const c = 2 * e[a] + e[a - 1], l = e[a] + 2 * e[a - 1];
      n[a] = (c + l) / (c / r[a - 1] + l / r[a]);
    }
  for (let a = 0; a < t - 1; a++)
    if (Math.abs(r[a]) < 1e-9)
      n[a] = 0, n[a + 1] = 0;
    else {
      const c = n[a] / r[a], l = n[a + 1] / r[a], d = Math.hypot(c, l);
      if (d > 3) {
        const h = 3 / d;
        n[a] = h * c * r[a], n[a + 1] = h * l * r[a];
      }
    }
  let o = `M ${x(i[0].x)} ${x(i[0].y)}`;
  for (let a = 0; a < t - 1; a++) {
    const c = i[a], l = i[a + 1], d = e[a], h = c.x + d / 3, u = c.y + n[a] * d / 3, w = l.x - d / 3, p = l.y - n[a + 1] * d / 3;
    o += ` C ${x(h)} ${x(u)}, ${x(w)} ${x(p)}, ${x(l.x)} ${x(l.y)}`;
  }
  return o;
}
function gs(i, t) {
  if (i.length === 0) return "";
  if (i.length === 1) {
    const n = i[0];
    return `M ${x(n.x)} ${x(t)} L ${x(n.x)} ${x(n.y)} L ${x(n.x)} ${x(t)} Z`;
  }
  const e = gt(i), s = i[0], r = i[i.length - 1];
  return `${e} L ${x(r.x)} ${x(t)} L ${x(s.x)} ${x(t)} Z`;
}
function fs(i, t, e, s) {
  if (i.length === 0 || s <= 0)
    return [];
  if (i.length === 1)
    return [{ startX: 0, endX: s, isNight: i[0].is_night }];
  const r = i[0].epoch_ms, n = i[i.length - 1].epoch_ms, o = e(0), a = e(i.length - 1), c = n - r, l = (p) => {
    if (c <= 0) return o;
    const $ = (p - r) / c;
    return Math.max(0, Math.min(s, o + $ * (a - o)));
  }, d = [];
  for (const p of t)
    p.sunrise_ms !== null && p.sunrise_ms > r && p.sunrise_ms < n && d.push({ x: l(p.sunrise_ms), toNight: !1 }), p.sunset_ms !== null && p.sunset_ms > r && p.sunset_ms < n && d.push({ x: l(p.sunset_ms), toNight: !0 });
  if (d.length > 0) {
    d.sort((S, m) => S.x - m.x);
    const p = [];
    let $ = 0, k = !d[0].toNight;
    for (const S of d) {
      const m = Math.max($, Math.min(s, S.x));
      m > $ && p.push({ startX: $, endX: m, isNight: k }), $ = m, k = S.toNight;
    }
    return $ < s && p.push({ startX: $, endX: s, isNight: k }), p;
  }
  const h = [];
  let u = 0, w = i[0].is_night;
  for (let p = 1; p < i.length; p++)
    if (i[p].is_night !== w) {
      const $ = (e(p - 1) + e(p)) / 2;
      h.push({ startX: u, endX: $, isNight: w }), u = $, w = i[p].is_night;
    }
  return h.push({ startX: u, endX: s, isNight: w }), h;
}
function x(i) {
  return (Math.round(i * 100) / 100).toString();
}
const T = 76, ms = 112, Z = 272, H = 288, it = 44, rt = 44, Tt = 14, _t = class _t extends F {
  constructor() {
    super(), this._isScrubbing = !1, this._activePointerId = null, this.hours = [], this.sunWindows = [], this.timeZone = "Australia/Sydney", this.selectedIndex = 0, this.visibleHours = 24, this.showTemperature = !0, this.showRain = !0, this.showWind = !0, this._viewportWidth = 460, this._canScrollLeft = !1, this._canScrollRight = !1;
  }
  get _scrollEl() {
    var t;
    return ((t = this.renderRoot) == null ? void 0 : t.querySelector(".wg-scroll-viewport")) ?? null;
  }
  connectedCallback() {
    super.connectedCallback(), this._resizeObserver = new ResizeObserver((t) => {
      for (const e of t) {
        const s = e.contentRect.width;
        s > 80 && Math.abs(s - this._viewportWidth) >= 1 && (this._viewportWidth = s, this._updateScrollIndicators());
      }
    }), this._resizeObserver.observe(this);
  }
  disconnectedCallback() {
    var t;
    (t = this._resizeObserver) == null || t.disconnect(), super.disconnectedCallback();
  }
  firstUpdated() {
    const t = this.getBoundingClientRect().width;
    t > 80 && (this._viewportWidth = t), this._updateScrollIndicators();
  }
  updated(t) {
    (t.has("hours") || t.has("visibleHours")) && requestAnimationFrame(() => this._updateScrollIndicators());
  }
  _getGeometry() {
    const t = Math.max(1, this.hours.length), e = Math.max(8, Math.min(t, this.visibleHours || 24)), r = Math.max(
      180,
      this._viewportWidth - it - rt - Tt * 2
    ) / Math.max(1, e - 1), n = it + Tt, o = Math.max(
      this._viewportWidth,
      Math.ceil(
        n + (t - 1) * r + rt + Tt
      )
    );
    return { count: t, hourSpacing: r, firstX: n, totalWidth: o, xForIndex: (c) => n + c * r };
  }
  _emitSelectedIndex(t) {
    if (this.hours.length === 0) return;
    const e = Math.max(0, Math.min(this.hours.length - 1, t));
    e !== this.selectedIndex && this.dispatchEvent(
      new CustomEvent("hour-select", {
        detail: { index: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _indexFromClientX(t) {
    const e = this._scrollEl;
    if (!e || this.hours.length === 0) return 0;
    const s = e.getBoundingClientRect(), { firstX: r, hourSpacing: n } = this._getGeometry(), o = t - s.left + e.scrollLeft, a = Math.round((o - r) / n);
    return Math.max(0, Math.min(this.hours.length - 1, a));
  }
  _onPointerDown(t) {
    if (this.hours.length === 0 || t.pointerType === "mouse" && t.button !== 0) return;
    const e = this._scrollEl;
    if (e) {
      if (t.pointerType === "touch") {
        const s = e.getBoundingClientRect(), { xForIndex: r } = this._getGeometry(), n = s.left + r(this.selectedIndex) - e.scrollLeft;
        Math.abs(t.clientX - n) <= 26 && (this._isScrubbing = !0, this._activePointerId = t.pointerId, e.setPointerCapture(t.pointerId), t.preventDefault());
        return;
      }
      this._isScrubbing = !0, this._activePointerId = t.pointerId, e.setPointerCapture(t.pointerId), this._emitSelectedIndex(this._indexFromClientX(t.clientX));
    }
  }
  _onPointerMove(t) {
    if (!this._isScrubbing || t.pointerId !== this._activePointerId) return;
    const e = this._indexFromClientX(t.clientX);
    this._emitSelectedIndex(e);
    const s = this._scrollEl;
    if (s) {
      const r = s.getBoundingClientRect(), n = 48;
      t.clientX > r.right - n ? s.scrollLeft += 14 : t.clientX < r.left + n && (s.scrollLeft -= 14);
    }
  }
  _onPointerUp(t) {
    t.pointerId === this._activePointerId && (this._isScrubbing = !1, this._activePointerId = null);
  }
  _onClick(t) {
    this.hours.length !== 0 && this._emitSelectedIndex(this._indexFromClientX(t.clientX));
  }
  _onKeyDown(t) {
    if (t.key === "ArrowRight") {
      t.preventDefault();
      const e = Math.min(this.hours.length - 1, this.selectedIndex + 1);
      this._emitSelectedIndex(e), this._scrollIndexIntoView(e);
    } else if (t.key === "ArrowLeft") {
      t.preventDefault();
      const e = Math.max(0, this.selectedIndex - 1);
      this._emitSelectedIndex(e), this._scrollIndexIntoView(e);
    }
  }
  _scrollIndexIntoView(t) {
    const e = this._scrollEl;
    if (!e) return;
    const { xForIndex: s } = this._getGeometry(), r = s(t), n = e.scrollLeft + it + 16, o = e.scrollLeft + e.clientWidth - rt - 16;
    r < n ? e.scrollTo({ left: Math.max(0, r - it - 24), behavior: "smooth" }) : r > o && e.scrollTo({
      left: r - e.clientWidth + rt + 24,
      behavior: "smooth"
    });
  }
  _panByHours(t) {
    const e = this._scrollEl;
    if (!e) return;
    const { hourSpacing: s } = this._getGeometry();
    e.scrollBy({
      left: t * s,
      behavior: "smooth"
    });
  }
  _updateScrollIndicators() {
    const t = this._scrollEl;
    t && (this._canScrollLeft = t.scrollLeft > 4, this._canScrollRight = t.scrollLeft + t.clientWidth < t.scrollWidth - 4);
  }
  render() {
    if (this.hours.length === 0)
      return b;
    const { totalWidth: t, xForIndex: e } = this._getGeometry(), s = us(this.hours), r = Z - ms, n = (g) => {
      const f = s.temp.max - s.temp.min || 1, v = (g - s.temp.min) / f;
      return Z - v * r;
    }, o = (g) => {
      const f = Math.max(0, Math.min(100, g));
      return Z - f / 100 * r;
    }, a = (g) => {
      const f = s.wind.max || 40, v = Math.max(0, g);
      return Z - Math.min(1.06, v / f) * r;
    }, c = fs(
      this.hours,
      this.sunWindows,
      e,
      t
    ), l = this.hours.map((g, f) => ({
      x: e(f),
      y: o(g.rain_chance)
    })), d = this.hours.map(
      (g, f) => g.temperature !== null ? { x: e(f), y: n(g.temperature) } : null
    ).filter((g) => g !== null), h = this.hours.map((g, f) => ({
      x: e(f),
      y: a(g.wind_speed_kmh)
    })), u = gs(l, Z), w = gt(l), p = gt(d), $ = gt(h), k = [];
    for (let g = 0; g < this.hours.length; g++)
      mt(this.hours[g].epoch_ms, this.timeZone) % 3 === 0 && k.push(g);
    if (k.length === 0)
      for (let g = 0; g < this.hours.length; g += 3)
        k.push(g);
    const S = Math.max(
      0,
      Math.min(this.hours.length - 1, this.selectedIndex)
    ), m = e(S), P = Array.from({ length: s.gridCount }, (g, f) => {
      const v = f / (s.gridCount - 1);
      return Z - v * r;
    }), M = {
      unit: "%",
      ticks: Array.from(
        { length: s.gridCount },
        (g, f) => Math.round(f * 100 / (s.gridCount - 1))
      ),
      tone: "rain",
      dim: !1
    }, N = this.showRain && !this.showTemperature, bt = this.showRain && this.showTemperature && !this.showWind, L = N ? M : { unit: "°C", ticks: s.temp.ticks, tone: "temp", dim: !this.showTemperature }, Q = bt ? M : { unit: "km/h", ticks: s.wind.ticks, tone: "wind", dim: !this.showWind };
    return y`
      <div
        class="wg-chart-shell"
        tabindex="0"
        role="slider"
        aria-label="48-hour forecast timeline scrubber"
        aria-valuemin="0"
        aria-valuemax=${this.hours.length - 1}
        aria-valuenow=${S}
        @keydown=${this._onKeyDown}
      >
        ${this._canScrollLeft ? y`
              <button
                class="wg-pan-btn wg-pan-left"
                type="button"
                aria-label="Scroll earlier hours"
                @click=${() => this._panByHours(-12)}
              >
                &#8249;
              </button>
            ` : b}
        ${this._canScrollRight ? y`
              <button
                class="wg-pan-btn wg-pan-right"
                type="button"
                aria-label="Scroll later hours"
                @click=${() => this._panByHours(12)}
              >
                &#8250;
              </button>
            ` : b}

        <div
          class="wg-axis-overlay wg-axis-left wg-axis-${L.tone} ${L.dim ? "wg-axis-dim" : ""}"
          aria-hidden="true"
        >
          <span class="wg-axis-unit">${L.unit}</span>
          ${L.ticks.map(
      (g, f) => y`
              <span
                class="wg-axis-tick"
                style="top: ${P[f] - T}px"
              >
                ${g}
              </span>
            `
    )}
        </div>

        <div
          class="wg-axis-overlay wg-axis-right wg-axis-${Q.tone} ${Q.dim ? "wg-axis-dim" : ""}"
          aria-hidden="true"
        >
          <span class="wg-axis-unit">${Q.unit}</span>
          ${Q.ticks.map(
      (g, f) => y`
              <span
                class="wg-axis-tick"
                style="top: ${P[f] - T}px"
              >
                ${g}
              </span>
            `
    )}
        </div>

        <div
          class="wg-scroll-viewport"
          @scroll=${this._updateScrollIndicators}
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerUp}
          @click=${this._onClick}
        >
          <svg
            class="wg-chart-svg"
            width=${t}
            height=${H}
            viewBox="0 0 ${t} ${H}"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g class="wg-daynight-bands">
              ${c.map((g) => {
      const f = Math.max(0, g.endX - g.startX), v = g.isNight ? "night" : "day";
      return _`
                  <g>
                    <rect
                      x=${g.startX}
                      y="0"
                      width=${f + 0.5}
                      height=${T}
                      class="wg-band-${v}-strip"
                    />
                    <rect
                      x=${g.startX}
                      y=${T}
                      width=${f + 0.5}
                      height=${H - T}
                      class="wg-band-${v}-plot"
                    />
                  </g>
                `;
    })}
            </g>

            <g class="wg-grid-vertical" stroke-width="1">
              ${k.map((g) => {
      const f = e(g);
      return _`
                  <line x1=${f} y1="0" x2=${f} y2=${H} />
                `;
    })}
            </g>

            <g class="wg-grid-horizontal" stroke-width="1">
              ${P.map(
      (g) => _`
                  <line x1="0" y1=${g} x2=${t} y2=${g} />
                `
    )}
            </g>

            <line
              x1="0"
              y1=${T}
              x2=${t}
              y2=${T}
              class="wg-strip-rule"
              stroke-width="1.2"
            />
            <g class="wg-strip-rule" stroke-width="1.2">
              ${this.hours.map((g, f) => {
      const v = e(f);
      return _`
                  <line
                    x1=${v}
                    y1=${T - 6}
                    x2=${v}
                    y2=${T}
                  />
                `;
    })}
            </g>

            <g class="wg-strip-markers">
              ${k.map((g) => {
      const f = this.hours[g], v = e(g), V = ke(
        f.icon_descriptor,
        f.condition,
        f.is_night
      ), tt = ds(f.epoch_ms, this.timeZone), ut = mt(f.epoch_ms, this.timeZone) === 0 ? hs(f.epoch_ms, this.timeZone) : null;
      return _`
                  <g>
                    <g class="wg-strip-icon">
                      ${is(V, v - 16, 6, 32)}
                    </g>
                    <text
                      x=${v}
                      y="57"
                      text-anchor="middle"
                      class="wg-hour-label"
                      font-size="13"
                      font-weight="500"
                      font-family="inherit"
                    >
                      ${tt}
                    </text>
                    ${ut ? _`
                          <text
                            x=${v}
                            y="69"
                            text-anchor="middle"
                            class="wg-day-pill"
                          >
                            ${ut}
                          </text>
                        ` : b}
                  </g>
                `;
    })}
            </g>

            <g
              class="wg-series-layer ${this.showRain ? "" : "wg-series-hidden"}"
            >
              <path d=${u} class="wg-rain-area" />
              <path
                d=${w}
                fill="none"
                class="wg-rain-stroke"
                stroke-width="1.4"
              />
            </g>

            <g
              class="wg-series-layer ${this.showTemperature ? "" : "wg-series-hidden"}"
            >
              <path
                d=${p}
                fill="none"
                class="wg-temp-line"
                stroke-width="3.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>

            <g
              class="wg-series-layer ${this.showWind ? "" : "wg-series-hidden"}"
            >
              <path
                d=${$}
                fill="none"
                class="wg-wind-line"
                stroke-width="2"
                stroke-linecap="round"
              />
              ${this.hours.map((g, f) => {
      const v = e(f), V = a(g.wind_speed_kmh);
      if (g.wind_bearing_deg === null || g.wind_speed_kmh < 0.4)
        return _`
                    <circle
                      cx=${v}
                      cy=${V}
                      r="3"
                      class="wg-wind-marker"
                      fill-opacity="0.7"
                    />
                  `;
      const tt = as(g.wind_bearing_deg);
      return _`
                  <path
                    d="M 0 -7.2 L 5.2 6.4 L 0 3.3 L -5.2 6.4 Z"
                    class="wg-wind-marker"
                    transform="translate(${v}, ${V}) rotate(${tt})"
                  />
                `;
    })}
            </g>

            <g class="wg-scrubber-cursor">
              <polygon
                points="${m - 6.5},0 ${m + 6.5},0 ${m},8.5"
                class="wg-scrubber-head"
              />
              <line
                x1=${m}
                y1="7"
                x2=${m}
                y2=${H}
                class="wg-scrubber-line"
                stroke-width="2.6"
                stroke-dasharray="9 6"
              />
            </g>
          </svg>
        </div>
      </div>
    `;
  }
};
_t.properties = {
  hours: { attribute: !1 },
  sunWindows: { attribute: !1 },
  timeZone: { type: String },
  selectedIndex: { type: Number },
  visibleHours: { type: Number },
  showTemperature: { type: Boolean },
  showRain: { type: Boolean },
  showWind: { type: Boolean },
  _viewportWidth: { state: !0 },
  _canScrollLeft: { state: !0 },
  _canScrollRight: { state: !0 }
}, _t.styles = Ft`
    :host {
      display: block;
      position: relative;
      user-select: none;
      -webkit-user-select: none;
    }

    .wg-chart-shell {
      position: relative;
      width: 100%;
      height: ${H}px;
      overflow: hidden;
      background: var(--wg-band-night-plot);
    }

    .wg-scroll-viewport {
      width: 100%;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
      scrollbar-color: var(--wg-control-border) transparent;
      -webkit-overflow-scrolling: touch;
      cursor: crosshair;
    }

    .wg-scroll-viewport::-webkit-scrollbar {
      height: 5px;
    }

    .wg-scroll-viewport::-webkit-scrollbar-track {
      background: transparent;
    }

    .wg-scroll-viewport::-webkit-scrollbar-thumb {
      background: var(--wg-control-border);
      border-radius: 999px;
    }

    svg.wg-chart-svg {
      display: block;
      height: ${H}px;
    }

    .wg-axis-overlay {
      position: absolute;
      top: ${T}px;
      height: ${H - T}px;
      pointer-events: none;
      z-index: 3;
      transition: opacity 0.2s ease;
    }

    .wg-axis-temp {
      color: var(--wg-temp);
    }

    .wg-axis-wind {
      color: var(--wg-wind);
    }

    .wg-axis-rain {
      color: var(--wg-rain);
    }

    .wg-axis-dim {
      opacity: 0.35;
    }

    .wg-axis-left {
      left: 0;
      width: ${it + 8}px;
      background: linear-gradient(
        90deg,
        var(--wg-axis-fade) 62%,
        var(--wg-axis-fade-clear) 100%
      );
    }

    .wg-axis-right {
      right: 0;
      width: ${rt + 8}px;
      background: linear-gradient(
        270deg,
        var(--wg-axis-fade) 62%,
        var(--wg-axis-fade-clear) 100%
      );
    }

    .wg-axis-unit {
      position: absolute;
      top: 8px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0.01em;
    }

    .wg-axis-left .wg-axis-unit {
      left: 10px;
    }

    .wg-axis-right .wg-axis-unit {
      right: 10px;
    }

    .wg-axis-tick {
      position: absolute;
      transform: translateY(-50%);
      font-size: 14px;
      font-weight: 700;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .wg-axis-left .wg-axis-tick {
      left: 10px;
    }

    .wg-axis-right .wg-axis-tick {
      right: 10px;
    }

    .wg-pan-btn {
      position: absolute;
      top: 22px;
      z-index: 4;
      width: 26px;
      height: 32px;
      border: 1px solid var(--wg-control-border);
      border-radius: 6px;
      background: var(--wg-control-bg);
      color: var(--wg-text);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.16s ease, background 0.16s ease;
      padding: 0;
    }

    .wg-chart-shell:hover .wg-pan-btn,
    .wg-pan-btn:focus-visible {
      opacity: 1;
    }

    .wg-pan-btn:hover {
      background: var(--wg-panel);
    }

    .wg-pan-left {
      left: 6px;
    }

    .wg-pan-right {
      right: 6px;
    }

    .wg-series-layer {
      transition: opacity 0.2s ease;
    }

    .wg-series-hidden {
      opacity: 0;
      pointer-events: none;
    }

    .wg-day-pill {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      fill: var(--wg-day-label);
    }

    .wg-band-day-strip {
      fill: var(--wg-band-day-strip);
    }

    .wg-band-night-strip {
      fill: var(--wg-band-night-strip);
    }

    .wg-band-day-plot {
      fill: var(--wg-band-day-plot);
    }

    .wg-band-night-plot {
      fill: var(--wg-band-night-plot);
    }

    .wg-grid-vertical {
      stroke: var(--wg-grid-vertical);
    }

    .wg-grid-horizontal {
      stroke: var(--wg-grid);
    }

    .wg-strip-rule {
      stroke: var(--wg-strip-rule);
    }

    .wg-strip-icon {
      filter: var(--wg-icon-filter, none);
    }

    .wg-hour-label {
      fill: var(--wg-text);
    }

    .wg-rain-area {
      fill: var(--wg-rain-fill);
    }

    .wg-rain-stroke {
      stroke: var(--wg-rain-stroke);
    }

    .wg-temp-line {
      stroke: var(--wg-temp);
    }

    .wg-wind-line {
      stroke: var(--wg-wind-line);
    }

    .wg-wind-marker {
      fill: var(--wg-wind);
    }

    .wg-scrubber-head {
      fill: var(--wg-text);
    }

    .wg-scrubber-line {
      stroke: var(--wg-text);
    }
  `;
let It = _t;
customElements.get("wg-forecast-chart") || customElements.define("wg-forecast-chart", It);
const Rt = 3, ws = ["wind", "humidity", "dew_point"], jt = [
  { id: "wind", label: "Wind" },
  { id: "wind_gust", label: "Wind gust" },
  { id: "humidity", label: "Humidity" },
  { id: "dew_point", label: "Dew point" },
  { id: "feels_like", label: "Feels like" },
  { id: "uv", label: "UV index" },
  { id: "rain_amount", label: "Rain amount" }
], _s = new Set(jt.map((i) => i.id));
function Ht(i) {
  if (!Array.isArray(i)) return [...ws];
  const t = [];
  for (const e of i)
    typeof e == "string" && _s.has(e) && !t.includes(e) && t.push(e);
  return t.slice(0, Rt);
}
function ys(i) {
  return i < 3 ? "Low" : i < 6 ? "Moderate" : i < 8 ? "High" : i < 11 ? "Very High" : "Extreme";
}
const R = (i) => i != null && Number.isFinite(i);
function $s(i, t, e, s) {
  var c;
  const r = (l) => e ? (s == null ? void 0 : s[l]) ?? null : null, n = ((c = jt.find((l) => l.id === i)) == null ? void 0 : c.label) ?? i, o = (l) => R(l) ? `${Math.round(l)}°C` : "--°C", a = (l) => R(l) ? `${Math.round(l)} km/h` : "-- km/h";
  switch (i) {
    case "wind": {
      const l = r("wind_speed_kmh") ?? t.wind_speed_kmh, d = r("wind_direction") ?? t.wind_direction ?? "", h = R(l) && l <= 0.4 && !d ? "Calm" : `${d ? `${d} ` : ""}${a(l)}`;
      return { id: i, label: n, value: h };
    }
    case "wind_gust":
      return {
        id: i,
        label: n,
        value: a(r("wind_gust_kmh") ?? t.wind_gust_kmh)
      };
    case "humidity": {
      const l = r("humidity") ?? t.humidity;
      return { id: i, label: n, value: R(l) ? `${Math.round(l)}%` : "--%" };
    }
    case "dew_point":
      return {
        id: i,
        label: n,
        value: o(r("dew_point") ?? t.dew_point)
      };
    case "feels_like":
      return {
        id: i,
        label: n,
        value: o(r("feels_like") ?? t.feels_like)
      };
    case "uv": {
      const l = t.uv_index;
      return {
        id: i,
        label: n,
        value: R(l) ? `${Math.round(l)} ${ys(l)}` : "--"
      };
    }
    case "rain_amount": {
      const l = t.rain_min_mm, d = t.rain_max_mm;
      let h = "-- mm";
      return R(l) && R(d) && d > l ? h = `${l}–${d} mm` : R(d) ? h = `${d} mm` : R(l) && (h = `${l} mm`), { id: i, label: n, value: h };
    }
  }
}
function xs({
  point: i,
  isFirstHour: t,
  currentObs: e,
  timeZone: s,
  metrics: r
}) {
  const n = t && (e == null ? void 0 : e.temperature) !== null && (e == null ? void 0 : e.temperature) !== void 0 ? e.temperature : i.temperature, o = ke(
    i.icon_descriptor,
    i.condition,
    i.is_night
  ), a = n != null ? `${Math.round(n)}°` : "--°", c = `${Math.round(i.rain_chance)}%`, l = cs(i.epoch_ms, s);
  return y`
    <div
      class="wg-summary-panel ${r.length === 0 ? "wg-no-metrics" : ""}"
      role="region"
      aria-label="Selected hour forecast details"
      style="--wg-metric-count: ${Math.max(1, r.length)}"
    >
      <div class="wg-summary-left">
        <div class="wg-summary-icon">
          ${ss(o, 42)}
        </div>
        <div class="wg-summary-temp">${a}</div>
      </div>

      <div class="wg-summary-center">
        <div class="wg-summary-time">${l}</div>
        <div class="wg-summary-rain" title="Chance of precipitation">
          <span class="wg-droplet">${rs(17)}</span>
          <span class="wg-summary-rain-val">${c}</span>
        </div>
      </div>

      ${r.length > 0 ? y`
            <div class="wg-summary-metrics">
              ${r.map((d) => {
    const { label: h, value: u } = $s(d, i, t, e);
    return y`
                  <div class="wg-metric-row">
                    <span class="wg-metric-label">${h}</span>
                    <span class="wg-metric-value">${u}</span>
                  </div>
                `;
  })}
            </div>
          ` : b}
    </div>
  `;
}
const j = [
  { slot: "background", label: "Background" },
  { slot: "daytime", label: "Daytime shading" },
  { slot: "temperature", label: "Temperature" },
  { slot: "rain", label: "Chance of rain" },
  { slot: "wind", label: "Wind" },
  { slot: "text", label: "Text" }
], Dt = [
  {
    id: "dusk",
    name: "Dusk",
    colors: {
      background: "#1b1a2e",
      daytime: "#3a3762",
      temperature: "#ff8f6b",
      rain: "#59c3c3",
      wind: "#d9d4ff",
      text: "#f3f1fa"
    }
  },
  {
    id: "midnight",
    name: "Midnight",
    colors: {
      background: "#0f2137",
      daytime: "#2b5272",
      temperature: "#f5be36",
      rain: "#4cc9f0",
      wind: "#ffffff",
      text: "#f8fafc"
    }
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      background: "#142019",
      daytime: "#2c4434",
      temperature: "#f4c95d",
      rain: "#7cb8e8",
      wind: "#e6efe2",
      text: "#eef4ec"
    }
  },
  {
    id: "ember",
    name: "Ember",
    colors: {
      background: "#211816",
      daytime: "#46322b",
      temperature: "#ffb15c",
      rain: "#74b9e6",
      wind: "#f6e9df",
      text: "#f8efe9"
    }
  },
  {
    id: "daylight",
    name: "Daylight",
    colors: {
      background: "#e4eaf2",
      daytime: "#ffffff",
      temperature: "#d9622b",
      rain: "#2b7fc4",
      wind: "#2f3b4a",
      text: "#1c2633"
    }
  }
], Ee = "dusk", bs = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
function Vt(i) {
  if (typeof i != "string") return null;
  const t = i.trim();
  if (!bs.test(t)) return null;
  if (t.length === 4) {
    const [, e, s, r] = t;
    return `#${e}${e}${s}${s}${r}${r}`.toLowerCase();
  }
  return t.toLowerCase();
}
function Gt(i) {
  return Dt.find((t) => t.id === i) ?? Dt.find((t) => t.id === Ee);
}
function nt(i, t) {
  const e = { ...Gt(i).colors };
  for (const { slot: s } of j) {
    const r = Vt(t == null ? void 0 : t[s]);
    r && (e[s] = r);
  }
  return e;
}
function Nt(i, t) {
  const e = Gt(i).colors, s = {};
  for (const { slot: r } of j) {
    const n = Vt(t == null ? void 0 : t[r]);
    n && n !== e[r] && (s[r] = n);
  }
  return s;
}
function q(i) {
  const t = parseInt(i.slice(1), 16);
  return [t >> 16 & 255, t >> 8 & 255, t & 255];
}
function vs([i, t, e]) {
  return `#${[i, t, e].map((s) => Math.round(Math.max(0, Math.min(255, s))).toString(16).padStart(2, "0")).join("")}`;
}
function A(i, t, e) {
  const s = q(i), r = q(t);
  return vs([0, 1, 2].map((n) => s[n] + (r[n] - s[n]) * e));
}
function E(i, t) {
  const [e, s, r] = q(i);
  return `rgba(${e}, ${s}, ${r}, ${t})`;
}
function J(i) {
  const [t, e, s] = q(i).map((r) => {
    const n = r / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * t + 0.7152 * e + 0.0722 * s;
}
function wt(i, t) {
  const e = J(i), s = J(t);
  return (Math.max(e, s) + 0.05) / (Math.min(e, s) + 0.05);
}
function ks(i) {
  const [t, e, s] = q(i).map((c) => c / 255), r = Math.max(t, e, s), n = Math.min(t, e, s), o = r - n;
  if (o === 0) return 0;
  let a;
  return r === t ? a = (e - s) / o % 6 : r === e ? a = (s - t) / o + 2 : a = (t - e) / o + 4, (a * 60 + 360) % 360;
}
function Ss(i) {
  const t = q(i);
  return (Math.max(...t) - Math.min(...t)) / 255;
}
function As(i) {
  const { background: t, daytime: e, temperature: s, rain: r, wind: n, text: o } = i, a = J(t) < 0.4, c = a ? A(t, "#000000", 0.38) : A(t, o, 0.05), l = a ? A(t, "#000000", 0.45) : A(t, o, 0.07), d = A(t, e, 0.12);
  return {
    "--wg-bg": t,
    "--wg-panel": c,
    "--wg-legend-bg": l,
    "--wg-text": o,
    "--wg-text-muted": A(o, t, 0.4),
    "--wg-border": E(o, 0.12),
    "--wg-shadow": a ? "rgba(0, 0, 0, 0.36)" : "rgba(0, 0, 0, 0.12)",
    "--wg-temp": s,
    "--wg-rain": r,
    "--wg-wind": n,
    "--wg-rain-fill": E(A(r, t, 0.2), 0.48),
    "--wg-rain-stroke": E(r, 0.55),
    "--wg-wind-line": E(n, 0.25),
    "--wg-band-day-strip": e,
    "--wg-band-night-strip": A(t, e, 0.3),
    "--wg-band-day-plot": A(t, e, 0.45),
    "--wg-band-night-plot": d,
    "--wg-axis-fade": E(d, 0.92),
    "--wg-axis-fade-clear": E(d, 0),
    "--wg-grid": E(o, 0.075),
    "--wg-grid-vertical": E(o, 0.06),
    "--wg-strip-rule": E(A(o, e, 0.3), 0.36),
    "--wg-day-label": A(r, o, 0.5),
    "--wg-control-bg": E(c, 0.82),
    "--wg-control-border": E(o, 0.18),
    "--wg-icon-filter": a ? "none" : "drop-shadow(0 0 0.6px rgba(0, 0, 0, 0.55)) drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.18))",
    "--wg-skeleton-a": E(A(t, e, 0.4), 0.55),
    "--wg-skeleton-b": E(A(t, e, 0.8), 0.75)
  };
}
const ue = 12, Es = new Set(j.map((i) => i.slot)), Ms = /#?\b[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi;
function Me(i) {
  if (typeof i != "string") return null;
  const t = i.trim();
  return Vt(t.startsWith("#") ? t : `#${t}`);
}
function Ce(i) {
  return typeof i == "string" ? `"${i}"` : JSON.stringify(i) ?? String(i);
}
function Ot(i) {
  const t = [];
  for (const e of i) {
    const s = Me(e);
    if (!s) return { ok: !1, error: `${Ce(e)} isn't a hex colour.` };
    t.push(s);
  }
  return Te({ kind: "list", colors: t });
}
function Te(i) {
  const t = i.kind === "list" ? i.colors.length : Object.keys(i.colors).length;
  return t === 0 ? { ok: !1, error: "No colours found." } : t > ue ? { ok: !1, error: `Too many colours (${t}); paste ${ue} or fewer.` } : { ok: !0, input: i };
}
function Cs(i) {
  if (Array.isArray(i)) return Ot(i);
  if (i === null || typeof i != "object") return null;
  const t = Object.entries(i);
  if (!(t.length > 0 && t.every(([r]) => Es.has(r.toLowerCase())))) return Ot(t.map(([, r]) => r));
  const s = {};
  for (const [r, n] of t) {
    const o = Me(n);
    if (!o) return { ok: !1, error: `${r}: ${Ce(n)} isn't a hex colour.` };
    s[r.toLowerCase()] = o;
  }
  return Te({ kind: "keyed", colors: s });
}
function Ts(i) {
  const t = i.trim();
  if (!t) return { ok: !1, error: "Paste some colours first." };
  if (t.startsWith("[") || t.startsWith("{"))
    try {
      const s = Cs(JSON.parse(t));
      if (s) return s;
    } catch {
    }
  const e = t.match(Ms) ?? [];
  return e.length === 0 ? { ok: !1, error: "No hex colours found. Try c7eae4,a7e8bd,fcbcb8,efa7a7,ffd972." } : Ot(e);
}
function Ne(i) {
  return J(i) < 0.4 ? A(i, "#ffffff", 0.92) : A(i, "#000000", 0.85);
}
function Ns(i) {
  return J(i) < 0.4 ? A(i, "#ffffff", 0.14) : A(i, "#ffffff", 0.7);
}
const Ps = (i, t) => {
  const e = Math.abs(i - t) % 360;
  return e > 180 ? 360 - e : e;
}, Is = {
  temperature: 30,
  rain: 205
}, pe = ["temperature", "rain", "wind"], Rs = 60, Hs = 180, Ds = 1e3, Os = 3, Ls = 30, Us = 2.2, Ws = 40, zs = 20;
function Fs(i, t, e) {
  const s = wt(t, e), r = Ls * Math.max(0, Os - s) - s;
  return i === "wind" ? Rs + r : Ss(t) < 0.12 ? Hs + r : Ps(ks(t), Is[i]) + r;
}
function ge(i, t) {
  const e = { cost: 1 / 0, map: {} }, s = (r, n, o, a) => {
    if (o >= e.cost) return;
    if (r === pe.length) {
      e.cost = o, e.map = { ...a };
      return;
    }
    const c = pe[r];
    for (const l of i)
      n.has(l) || (n.add(l), a[c] = l, s(r + 1, n, o + Fs(c, l, t), a), delete a[c], n.delete(l));
    s(r + 1, n, o + Ds, a);
  };
  return s(0, /* @__PURE__ */ new Set(), 0, {}), e;
}
function Bs(i, t) {
  const e = [...new Set(i)], s = (l) => {
    const d = e.filter((u) => u !== l).map((u) => wt(u, l)).sort((u, w) => w - u).slice(0, 3);
    return (d.length ? d.reduce((u, w) => u + w, 0) / d.length : 0) - J(l) * 0.01;
  }, r = e.reduce((l, d) => s(d) > s(l) ? d : l), n = e.filter((l) => l !== r);
  let o = Ns(r), a = ge(n, r), c = a.cost + zs;
  for (const l of n) {
    const d = wt(l, r);
    if (d > Us) continue;
    const h = ge(
      n.filter((w) => w !== l),
      r
    ), u = h.cost + Ws * (d - 1);
    u < c && (c = u, o = l, a = h);
  }
  return {
    ...t,
    ...a.map,
    background: r,
    daytime: o,
    text: Ne(r)
  };
}
function Xs(i, t) {
  if (i.kind === "keyed") {
    const e = { ...t, ...i.colors };
    return i.colors.background && !i.colors.text && (e.text = Ne(i.colors.background)), { colors: e, mode: "keyed", count: Object.keys(i.colors).length };
  }
  if (i.colors.length === j.length) {
    const e = { ...t };
    return j.forEach(({ slot: s }, r) => {
      e[s] = i.colors[r];
    }), { colors: e, mode: "ordered", count: i.colors.length };
  }
  return { colors: Bs(i.colors, t), mode: "auto", count: i.colors.length };
}
function js(i) {
  return j.map(({ slot: t }) => i[t]).join(", ");
}
const Vs = /* @__PURE__ */ new Set(["temperature", "rain", "wind"]), Gs = 1.5, Zs = 4, Ks = [
  "c7eae4,a7e8bd,fcbcb8,efa7a7,ffd972",
  "#c7eae4, #a7e8bd, #fcbcb8, #efa7a7, #ffd972",
  '["c7eae4","a7e8bd","fcbcb8","efa7a7","ffd972"]',
  '{"background":"c7eae4","rain":"efa7a7", ...}'
].join(`
`), yt = class yt extends F {
  constructor() {
    super(), this._config = {
      type: "custom:weather-graph-card"
    }, this._pasteText = "";
  }
  setConfig(t) {
    this._config = { ...t };
  }
  _update(t, e) {
    const s = { ...this._config };
    e === void 0 ? delete s[t] : s[t] = e, this._emit(s);
  }
  _emit(t) {
    this._config = t, this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _setMetric(t, e) {
    const s = Ht(this._config.metrics);
    for (; s.length < Rt; ) s.push("");
    s[t] = e;
    const r = s.filter(
      (n, o) => n !== "" && s.indexOf(n) === o
    );
    this._update("metrics", r);
  }
  _setPalette(t) {
    const e = { ...this._config, palette: t };
    delete e.colors, this._emit(e);
  }
  _setColor(t, e) {
    const s = Nt(this._config.palette, {
      ...this._config.colors,
      [t]: e
    });
    this._update("colors", Object.keys(s).length > 0 ? s : void 0);
  }
  _applyColors(t) {
    const e = Nt(this._config.palette, t);
    this._update("colors", Object.keys(e).length > 0 ? e : void 0);
  }
  _applyPaste() {
    const t = Ts(this._pasteText);
    if (!t.ok) {
      this._pasteNote = { kind: "error", text: t.error };
      return;
    }
    const e = nt(this._config.palette, this._config.colors), { colors: s, mode: r, count: n } = Xs(t.input, e);
    this._applyColors(s), this._pasteText = "";
    const o = n === 1 ? "colour" : "colours", a = r === "keyed" ? `Applied ${n} ${o} to the named slots.` : r === "ordered" ? "Applied 6 colours in slot order." : `${n} ${o} auto-assigned. Drag swatches to rearrange.`;
    this._pasteNote = { kind: "success", text: a };
  }
  async _copyCurrent() {
    var e, s;
    const t = js(nt(this._config.palette, this._config.colors));
    try {
      await navigator.clipboard.writeText(t), this._pasteNote = { kind: "success", text: "Current palette copied as CSV." };
    } catch {
      this._pasteText = t, this._pasteNote = { kind: "success", text: "Current palette placed in the box to copy." }, await this.updateComplete, (s = (e = this.shadowRoot) == null ? void 0 : e.querySelector("#wg-paste")) == null || s.select();
    }
  }
  _swapColors(t, e) {
    if (t === e) return;
    const s = nt(this._config.palette, this._config.colors);
    this._applyColors({ ...s, [t]: s[e], [e]: s[t] });
  }
  _slotAt(t, e) {
    var n;
    const s = (n = this.shadowRoot) == null ? void 0 : n.elementFromPoint(t, e), r = s == null ? void 0 : s.closest(".swatch[data-slot]");
    return r == null ? void 0 : r.dataset.slot;
  }
  _tapGrip(t) {
    this._tapSlot ? (this._tapSlot !== t && this._swapColors(this._tapSlot, t), this._tapSlot = void 0) : this._tapSlot = t;
  }
  _onGripDown(t, e) {
    if (t.button === 0) {
      t.preventDefault();
      try {
        t.currentTarget.setPointerCapture(t.pointerId);
      } catch {
      }
      this._drag = {
        slot: e,
        pointerId: t.pointerId,
        startX: t.clientX,
        startY: t.clientY,
        dx: 0,
        dy: 0,
        moved: !1
      };
    }
  }
  _onGripMove(t) {
    const e = this._drag;
    if (!e || e.pointerId !== t.pointerId) return;
    const s = t.clientX - e.startX, r = t.clientY - e.startY, n = e.moved || Math.hypot(s, r) > Zs;
    if (!n) return;
    const o = this._slotAt(t.clientX, t.clientY);
    this._drag = { ...e, dx: s, dy: r, moved: n, over: o !== e.slot ? o : void 0 }, this._tapSlot && (this._tapSlot = void 0);
  }
  _onGripUp(t) {
    const e = this._drag;
    !e || e.pointerId !== t.pointerId || (this._drag = void 0, e.moved ? e.over && this._swapColors(e.slot, e.over) : this._tapGrip(e.slot));
  }
  _renderSwatch(t, e, s, r) {
    const n = this._drag, o = (n == null ? void 0 : n.slot) === t && n.moved, a = Vs.has(t) && wt(s[t], s.background) < Gs, c = [
      "swatch",
      o ? "dragging" : "",
      (n == null ? void 0 : n.over) === t ? "drop-target" : "",
      this._tapSlot === t ? "selected" : ""
    ].filter(Boolean).join(" "), l = this._tapSlot && this._tapSlot !== t;
    return y`
      <div
        class=${c}
        data-slot=${t}
        style=${o ? `--drag-x: ${n.dx}px; --drag-y: ${n.dy}px` : ""}
      >
        <button
          type="button"
          class="grip"
          aria-label=${l ? `Swap with ${e}` : `Move ${e} colour`}
          aria-pressed=${this._tapSlot === t ? "true" : "false"}
          title="Drag onto another colour to swap, or tap two handles"
          @pointerdown=${(d) => this._onGripDown(d, t)}
          @pointermove=${(d) => this._onGripMove(d)}
          @pointerup=${(d) => this._onGripUp(d)}
          @pointercancel=${() => this._drag = void 0}
          @click=${(d) => {
      d.detail === 0 && this._tapGrip(t);
    }}
          @keydown=${(d) => {
      d.key === "Escape" && (this._tapSlot = void 0);
    }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
            <g fill="currentColor">
              <circle cx="2.5" cy="3" r="1.5" /><circle cx="7.5" cy="3" r="1.5" />
              <circle cx="2.5" cy="8" r="1.5" /><circle cx="7.5" cy="8" r="1.5" />
              <circle cx="2.5" cy="13" r="1.5" /><circle cx="7.5" cy="13" r="1.5" />
            </g>
          </svg>
        </button>
        <input
          id="wg-color-${t}"
          type="color"
          .value=${s[t]}
          @input=${(d) => this._setColor(t, d.target.value)}
        />
        <label class="swatch-text" for="wg-color-${t}">
          <span>${e}</span>
          <span class="swatch-hex ${r[t] ? "custom" : ""}">
            ${s[t]}${r[t] ? " (custom)" : ""}
          </span>
          ${a ? y`<span class="low-contrast" title="Hard to see against the background">
                low contrast
              </span>` : null}
        </label>
      </div>
    `;
  }
  _renderPasteBox() {
    var e, s, r;
    const t = ((e = this._pasteNote) == null ? void 0 : e.kind) === "error";
    return y`
      <div class="paste-box">
        <label for="wg-paste">Paste a Palette</label>
        <textarea
          id="wg-paste"
          spellcheck="false"
          aria-invalid=${t ? "true" : "false"}
          aria-describedby="wg-paste-note"
          placeholder=${Ks}
          .value=${this._pasteText}
          @input=${(n) => {
      this._pasteText = n.target.value, t && (this._pasteNote = void 0);
    }}
          @keydown=${(n) => {
      n.key === "Enter" && (n.ctrlKey || n.metaKey) && (n.preventDefault(), this._applyPaste());
    }}
        ></textarea>
        <div class="paste-actions">
          <button
            type="button"
            class="revert-btn apply-btn"
            ?disabled=${!this._pasteText.trim()}
            @click=${() => this._applyPaste()}
          >
            Apply
          </button>
          <button type="button" class="revert-btn" @click=${() => this._copyCurrent()}>
            Copy current
          </button>
          <span class="spacer"></span>
          <span id="wg-paste-note" class="paste-note ${((s = this._pasteNote) == null ? void 0 : s.kind) ?? ""}" role="status">
            ${((r = this._pasteNote) == null ? void 0 : r.text) ?? ""}
          </span>
        </div>
        <span class="hint">
          CSV, JSON, or any text with hex codes, such as a Coolors link. Five colours are
          auto-assigned; six fill the slots in order. Ctrl/⌘+Enter applies.
        </span>
      </div>
    `;
  }
  _renderMetricsSection() {
    const t = Ht(this._config.metrics);
    return y`
      <div class="field">
        <label>Summary Fields</label>
        <div class="row-3">
          ${Array.from({ length: Rt }, (e, s) => {
      const r = s < t.length ? t[s] : "";
      return y`
              <select
                aria-label="Summary field ${s + 1}"
                .value=${r}
                @change=${(n) => this._setMetric(s, n.target.value)}
              >
                <option value="" ?selected=${r === ""}>None</option>
                ${jt.map(
        (n) => y`
                    <option
                      value=${n.id}
                      ?selected=${r === n.id}
                      ?disabled=${r !== n.id && t.includes(n.id)}
                    >
                      ${n.label}
                    </option>
                  `
      )}
              </select>
            `;
    })}
        </div>
        <span class="hint">Shown beside the selected hour's time and chance of rain.</span>
      </div>
    `;
  }
  _renderColorsSection() {
    const t = Gt(this._config.palette), e = Nt(this._config.palette, this._config.colors), s = nt(this._config.palette, this._config.colors), r = Object.keys(e).length > 0;
    return y`
      <div class="field">
        <div class="section-head">
          <label for="wg-palette">Colour Palette</label>
          <button
            type="button"
            class="revert-btn"
            ?disabled=${!r}
            @click=${() => this._update("colors", void 0)}
          >
            Revert to ${t.name}
          </button>
        </div>
        <select
          id="wg-palette"
          .value=${t.id}
          @change=${(n) => this._setPalette(n.target.value)}
        >
          ${Dt.map(
      (n) => y`
              <option value=${n.id} ?selected=${n.id === t.id}>
                ${n.name}${n.id === Ee ? " (default)" : ""}
              </option>
            `
    )}
        </select>
        <div class="swatches">
          ${j.map(
      ({ slot: n, label: o }) => this._renderSwatch(n, o, s, e)
    )}
        </div>
        <span class="hint">
          Pick a built-in palette, then adjust any colour. Drag the handles (or tap two) to swap
          colours. Changing palette clears custom colours.
        </span>
        ${this._renderPasteBox()}
      </div>
    `;
  }
  render() {
    var e;
    const t = Object.keys(((e = this.hass) == null ? void 0 : e.states) ?? {}).filter((s) => s.startsWith("weather.")).sort((s, r) => {
      const n = s.endsWith("_hourly") ? -1 : 0, o = r.endsWith("_hourly") ? -1 : 0;
      return n !== o ? n - o : s.localeCompare(r);
    });
    return y`
      <div class="editor-grid">
        <div class="field">
          <label for="wg-entity">Weather Entity (BOM Hourly preferred)</label>
          <select
            id="wg-entity"
            .value=${this._config.entity ?? ""}
            @change=${(s) => this._update("entity", s.target.value || void 0)}
          >
            <option value="">Auto-detect BOM / Hourly Weather</option>
            ${t.map((s) => {
      var n, o, a;
      const r = ((a = (o = (n = this.hass) == null ? void 0 : n.states[s]) == null ? void 0 : o.attributes) == null ? void 0 : a.friendly_name) || s;
      return y`
                <option value=${s} ?selected=${this._config.entity === s}>
                  ${r} (${s})
                </option>
              `;
    })}
          </select>
          <span class="hint">
            Selecting a daily BOM entity (e.g. weather.sydney) automatically resolves to weather.sydney_hourly.
          </span>
        </div>

        <div class="field">
          <label for="wg-title">Card Title</label>
          <input
            id="wg-title"
            type="text"
            .value=${this._config.title ?? "Next 48 Hours"}
            @input=${(s) => this._update("title", s.target.value)}
          />
        </div>

        <div class="row-2">
          <div class="field">
            <label for="wg-hours">Forecast Horizon (hours)</label>
            <input
              id="wg-hours"
              type="number"
              min="12"
              max="72"
              step="6"
              .value=${String(this._config.hours_to_show ?? 48)}
              @change=${(s) => this._update(
      "hours_to_show",
      Math.max(12, Math.min(72, Number(s.target.value) || 48))
    )}
            />
          </div>

          <div class="field">
            <label for="wg-vis-hours">Viewport Width (hours)</label>
            <input
              id="wg-vis-hours"
              type="number"
              min="12"
              max="48"
              step="6"
              .value=${String(this._config.visible_hours ?? 24)}
              @change=${(s) => this._update(
      "visible_hours",
      Math.max(12, Math.min(48, Number(s.target.value) || 24))
    )}
            />
          </div>
        </div>

        <div class="field">
          <label>Default Enabled Layers</label>
          <div class="toggles">
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${this._config.show_temperature !== !1}
                @change=${(s) => this._update("show_temperature", s.target.checked)}
              />
              Temperature
            </label>
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${this._config.show_rain !== !1}
                @change=${(s) => this._update("show_rain", s.target.checked)}
              />
              Chance Rain
            </label>
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${this._config.show_wind !== !1}
                @change=${(s) => this._update("show_wind", s.target.checked)}
              />
              Wind
            </label>
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${!!this._config.show_location}
                @change=${(s) => this._update("show_location", s.target.checked)}
              />
              Location Subtitle
            </label>
          </div>
        </div>

        ${this._renderMetricsSection()} ${this._renderColorsSection()}
      </div>
    `;
  }
};
yt.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _pasteText: { state: !0 },
  _pasteNote: { state: !0 },
  _drag: { state: !0 },
  _tapSlot: { state: !0 }
}, yt.styles = Ft`
    :host {
      display: block;
      font-family: inherit;
    }

    .editor-grid {
      display: grid;
      gap: 14px;
      padding: 8px 0;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-text-color, #e2e8f0);
    }

    .hint {
      font-size: 11.5px;
      color: var(--secondary-text-color, #94a3b8);
    }

    input[type="text"],
    input[type="number"],
    select {
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
      background: var(--card-background-color, #0f172a);
      color: var(--primary-text-color, #f8fafc);
      font-size: 14px;
    }

    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .toggles {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 4px;
    }

    .toggle-item {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 13.5px;
      cursor: pointer;
    }

    .row-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .swatches {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 8px;
    }

    .swatch {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px 6px 4px;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
      border-radius: 10px;
      font-size: 13px;
      transition:
        border-color 120ms ease,
        background-color 120ms ease,
        box-shadow 120ms ease;
    }

    .swatch.selected,
    .swatch.dragging {
      border-color: var(--primary-color, #03a9f4);
    }

    .swatch.drop-target {
      border-color: var(--primary-color, #03a9f4);
      background: color-mix(in srgb, var(--primary-color, #03a9f4) 14%, transparent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #03a9f4) 35%, transparent);
    }

    .grip {
      appearance: none;
      display: grid;
      place-items: center;
      width: 22px;
      height: 32px;
      padding: 0;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--secondary-text-color, #94a3b8);
      cursor: grab;
      touch-action: none;
      flex: none;
    }

    .grip:hover,
    .grip:focus-visible,
    .swatch.selected .grip {
      color: var(--primary-text-color, #f8fafc);
      background: color-mix(in srgb, var(--primary-text-color, #f8fafc) 8%, transparent);
    }

    .swatch.dragging .grip {
      cursor: grabbing;
    }

    .swatch input[type="color"] {
      width: 34px;
      height: 28px;
      padding: 0;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
      border-radius: 6px;
      background: none;
      cursor: pointer;
      flex: none;
    }

    .swatch.dragging input[type="color"] {
      position: relative;
      z-index: 2;
      pointer-events: none;
      transform: translate(var(--drag-x, 0px), var(--drag-y, 0px)) scale(1.12);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
    }

    .swatch-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
      line-height: 1.25;
      font-weight: 400;
      cursor: pointer;
    }

    .swatch-hex {
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: var(--secondary-text-color, #94a3b8);
    }

    .swatch-hex.custom {
      color: var(--primary-color, #03a9f4);
    }

    .low-contrast {
      align-self: flex-start;
      margin-top: 2px;
      padding: 0 6px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 600;
      line-height: 16px;
      color: var(--warning-color, #f59e0b);
      background: color-mix(in srgb, var(--warning-color, #f59e0b) 16%, transparent);
    }

    .revert-btn {
      appearance: none;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
      background: transparent;
      color: var(--primary-text-color, #f8fafc);
      border-radius: 8px;
      padding: 6px 12px;
      font: inherit;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
    }

    .paste-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 6px;
    }

    .paste-box textarea {
      min-height: 84px;
      resize: vertical;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
      background: var(--card-background-color, #0f172a);
      color: var(--primary-text-color, #f8fafc);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12.5px;
      line-height: 1.45;
    }

    .paste-box textarea[aria-invalid="true"] {
      border-color: var(--error-color, #ef4444);
    }

    .paste-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .paste-actions .spacer {
      flex: 1;
    }

    .apply-btn {
      background: var(--primary-color, #03a9f4);
      border-color: transparent;
      color: var(--text-primary-color, #ffffff);
    }

    .paste-note {
      font-size: 12px;
    }

    .paste-note.error {
      color: var(--error-color, #ef4444);
    }

    .paste-note.success {
      color: var(--success-color, #22c55e);
    }

    .revert-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }

    @media (max-width: 420px) {
      .row-3 {
        grid-template-columns: 1fr;
      }
    }
  `;
let Lt = yt;
customElements.get("weather-graph-card-editor") || customElements.define(
  "weather-graph-card-editor",
  Lt
);
const Ys = "1.2.0", $t = class $t extends F {
  constructor() {
    super(), this._subscribedKey = "", this._subscribing = !1, this._config = {
      type: "custom:weather-graph-card",
      title: "Next 48 Hours",
      hours_to_show: 48,
      visible_hours: 24,
      show_temperature: !0,
      show_rain: !0,
      show_wind: !0
    }, this._payload = null, this._selectedIndex = 0, this._showTemperature = !0, this._showRain = !0, this._showWind = !0, this._loading = !0, this._error = null;
  }
  static getConfigElement() {
    return document.createElement("weather-graph-card-editor");
  }
  static getStubConfig(t) {
    return {
      type: "custom:weather-graph-card",
      entity: de(t) ?? void 0,
      title: "Next 48 Hours",
      hours_to_show: 48,
      visible_hours: 24,
      show_temperature: !0,
      show_rain: !0,
      show_wind: !0
    };
  }
  setConfig(t) {
    if (!t)
      throw new Error("Invalid Weather Graph Card configuration.");
    this._config = {
      title: "Next 48 Hours",
      hours_to_show: 48,
      visible_hours: 24,
      show_temperature: !0,
      show_rain: !0,
      show_wind: !0,
      ...t
    }, this._showTemperature = this._config.show_temperature !== !1, this._showRain = this._config.show_rain !== !1, this._showWind = this._config.show_wind !== !1, this.hass && this._ensureSubscription();
  }
  getCardSize() {
    return 7;
  }
  connectedCallback() {
    super.connectedCallback(), this.samplePayload ? (this._payload = this.samplePayload, this._loading = !1) : this.hass && this._ensureSubscription();
  }
  disconnectedCallback() {
    this._teardownSubscription(), super.disconnectedCallback();
  }
  updated(t) {
    if (t.has("samplePayload") && this.samplePayload) {
      this._teardownSubscription(), this._payload = this.samplePayload, this._selectedIndex = 0, this._loading = !1, this._error = null;
      return;
    }
    t.has("hass") && this.hass && !this.samplePayload && this._ensureSubscription();
  }
  _teardownSubscription() {
    if (this._unsubForecast) {
      try {
        this._unsubForecast();
      } catch {
      }
      this._unsubForecast = void 0;
    }
    this._subscribedKey = "";
  }
  async _ensureSubscription() {
    var r;
    if (!((r = this.hass) != null && r.connection) || this._subscribing) return;
    const t = de(
      this.hass,
      this._config.entity
    ), e = Math.max(12, Math.min(72, this._config.hours_to_show ?? 48)), s = `${t ?? ""}::${this._config.bom_entry_id ?? ""}::${e}`;
    if (!(s === this._subscribedKey && this._unsubForecast)) {
      this._teardownSubscription(), this._subscribedKey = s, this._subscribing = !0, this._loading = !this._payload, this._error = null;
      try {
        this._unsubForecast = await this.hass.connection.subscribeMessage(
          (n) => {
            this._payload = n, this._selectedIndex >= n.hourly.length && (this._selectedIndex = 0), this._loading = !1, this._error = null;
          },
          {
            type: "weather_graph/subscribe_forecast",
            ...t ? { entity_id: t } : {},
            ...this._config.bom_entry_id ? { entry_id: this._config.bom_entry_id } : {},
            hours: e
          }
        );
      } catch {
        if (!t) {
          this._loading = !1, this._error = "No hourly weather entity found. Install Bureau of Meteorology (HACS) or set `entity:` in card config.", this._subscribing = !1;
          return;
        }
        try {
          this._unsubForecast = await this.hass.connection.subscribeMessage(
            (n) => {
              if (!this.hass) return;
              const o = ps(
                n.forecast ?? [],
                this.hass,
                t,
                e
              );
              this._payload = o, this._selectedIndex >= o.hourly.length && (this._selectedIndex = 0), this._loading = !1, this._error = null;
            },
            {
              type: "weather/subscribe_forecast",
              entity_id: t,
              forecast_type: "hourly"
            }
          );
        } catch (n) {
          this._loading = !1, this._error = `Unable to subscribe to hourly forecast for ${t}: ${n instanceof Error ? n.message : String(n)}`;
        }
      } finally {
        this._subscribing = !1;
      }
    }
  }
  _resolveCurrentObservation(t) {
    var d;
    if (!this.hass) return t;
    const e = (h) => {
      var p, $;
      if (!h) return null;
      const u = ($ = (p = this.hass) == null ? void 0 : p.states[h]) == null ? void 0 : $.state;
      if (u === void 0) return null;
      const w = Number(u);
      return Number.isFinite(w) ? w : null;
    }, s = e(this._config.temperature_entity), r = e(this._config.humidity_entity), n = e(this._config.wind_speed_entity), o = this._config.wind_direction_entity ? (d = this.hass.states[this._config.wind_direction_entity]) == null ? void 0 : d.state : void 0, a = o ? Xt(o) : { cardinal: null, degrees: null };
    if (s === null && r === null && n === null && !a.cardinal)
      return t;
    const c = s ?? (t == null ? void 0 : t.temperature) ?? null, l = r ?? (t == null ? void 0 : t.humidity) ?? null;
    return {
      temperature: c,
      feels_like: (t == null ? void 0 : t.feels_like) ?? null,
      humidity: l,
      dew_point: Ae(c, l) ?? (t == null ? void 0 : t.dew_point) ?? null,
      wind_speed_kmh: n ?? (t == null ? void 0 : t.wind_speed_kmh) ?? null,
      wind_gust_kmh: (t == null ? void 0 : t.wind_gust_kmh) ?? null,
      wind_direction: a.cardinal ?? (t == null ? void 0 : t.wind_direction) ?? null,
      wind_bearing_deg: a.degrees ?? (t == null ? void 0 : t.wind_bearing_deg) ?? null,
      rain_since_9am_mm: (t == null ? void 0 : t.rain_since_9am_mm) ?? null
    };
  }
  _onHourSelect(t) {
    this._selectedIndex = t.detail.index;
  }
  render() {
    var o, a, c, l, d, h, u, w, p, $, k, S, m;
    const t = this._config.title || "Next 48 Hours", e = ((o = this._payload) == null ? void 0 : o.hourly) ?? [], s = e[Math.max(0, Math.min(e.length - 1, this._selectedIndex))] ?? null, r = this._config.show_location && ((c = (a = this._payload) == null ? void 0 : a.location) != null && c.name) ? `${this._payload.location.name}${this._payload.location.state ? `, ${this._payload.location.state}` : ""}` : "", n = As(
      nt(this._config.palette, this._config.colors)
    );
    return y`
      <div class="wg-card" style=${es(n)}>
        <div class="wg-card-header">
          <h2 class="wg-card-title">${t}</h2>
          ${r ? y`<span class="wg-card-subtitle">${r}</span>` : b}
        </div>

        ${this._loading ? y`<div class="wg-skeleton" aria-label="Loading forecast"></div>` : this._error ? y`<div class="wg-status-box">${this._error}</div>` : s ? y`
              <div class="wg-card-body">
                ${xs({
      point: s,
      isFirstHour: this._selectedIndex === 0,
      currentObs: this._resolveCurrentObservation(
        ((l = this._payload) == null ? void 0 : l.current) ?? null
      ),
      timeZone: ((h = (d = this._payload) == null ? void 0 : d.location) == null ? void 0 : h.timezone) ?? ((w = (u = this.hass) == null ? void 0 : u.config) == null ? void 0 : w.time_zone) ?? "Australia/Sydney",
      metrics: Ht(this._config.metrics)
    })}

                <wg-forecast-chart
                  .hours=${e}
                  .sunWindows=${((p = this._payload) == null ? void 0 : p.sun_windows) ?? []}
                  .timeZone=${((k = ($ = this._payload) == null ? void 0 : $.location) == null ? void 0 : k.timezone) ?? ((m = (S = this.hass) == null ? void 0 : S.config) == null ? void 0 : m.time_zone) ?? "Australia/Sydney"}
                  .selectedIndex=${this._selectedIndex}
                  .visibleHours=${this._config.visible_hours ?? 24}
                  .showTemperature=${this._showTemperature}
                  .showRain=${this._showRain}
                  .showWind=${this._showWind}
                  @hour-select=${this._onHourSelect}
                ></wg-forecast-chart>

                <div class="wg-legend-bar" role="group" aria-label="Toggle graph series">
                  <button
                    type="button"
                    class="wg-legend-btn wg-legend-temp ${this._showTemperature ? "" : "inactive"}"
                    aria-pressed=${String(this._showTemperature)}
                    @click=${() => {
      this._showTemperature = !this._showTemperature;
    }}
                  >
                    Temperature
                  </button>

                  <button
                    type="button"
                    class="wg-legend-btn wg-legend-rain ${this._showRain ? "" : "inactive"}"
                    aria-pressed=${String(this._showRain)}
                    @click=${() => {
      this._showRain = !this._showRain;
    }}
                  >
                    Chance Rain
                  </button>

                  <button
                    type="button"
                    class="wg-legend-btn wg-legend-wind ${this._showWind ? "" : "inactive"}"
                    aria-pressed=${String(this._showWind)}
                    @click=${() => {
      this._showWind = !this._showWind;
    }}
                  >
                    ${ns(15)}
                    <span>Wind</span>
                  </button>
                </div>
              </div>
            ` : y`
              <div class="wg-status-box">
                No hourly forecast points available for the selected weather entity.
              </div>
            `}
      </div>
    `;
  }
};
$t.properties = {
  hass: { attribute: !1 },
  samplePayload: { attribute: !1 },
  _config: { state: !0 },
  _payload: { state: !0 },
  _selectedIndex: { state: !0 },
  _showTemperature: { state: !0 },
  _showRain: { state: !0 },
  _showWind: { state: !0 },
  _loading: { state: !0 },
  _error: { state: !0 }
}, $t.styles = Ft`
    :host {
      display: block;
      font-family: "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont,
        "Segoe UI", Roboto, sans-serif;
    }

    .wg-card {
      container: wg-card / inline-size;
      background: var(--wg-bg);
      color: var(--wg-text);
      border-radius: var(--ha-card-border-radius, 14px);
      border: 1px solid var(--wg-border);
      box-shadow: var(--ha-card-box-shadow, 0 10px 28px var(--wg-shadow));
      overflow: hidden;
    }

    .wg-card-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding: 18px 18px 12px;
      gap: 12px;
    }

    .wg-card-title {
      margin: 0;
      font-size: 21px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--wg-text);
    }

    .wg-card-subtitle {
      font-size: 12px;
      font-weight: 500;
      color: var(--wg-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wg-summary-panel {
      margin: 0 14px 14px;
      padding: 14px 18px;
      background: var(--wg-panel);
      border-radius: 10px;
      display: grid;
      grid-template-columns: auto minmax(110px, 1fr) auto;
      align-items: center;
      gap: 18px;
    }

    .wg-summary-panel.wg-no-metrics {
      grid-template-columns: auto 1fr;
    }

    .wg-summary-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      min-width: 58px;
    }

    .wg-summary-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 42px;
      filter: var(--wg-icon-filter, none);
    }

    .wg-summary-temp {
      font-size: 31px;
      font-weight: 600;
      line-height: 1.05;
      color: var(--wg-temp);
      font-variant-numeric: tabular-nums;
    }

    .wg-summary-center {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6px;
    }

    .wg-summary-time {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--wg-text);
    }

    .wg-summary-rain {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .wg-droplet {
      display: inline-flex;
      align-items: center;
    }

    .wg-summary-rain-val {
      font-size: 30px;
      font-weight: 600;
      line-height: 1.05;
      color: var(--wg-rain);
      font-variant-numeric: tabular-nums;
    }

    .wg-summary-metrics {
      display: grid;
      gap: 5px;
    }

    .wg-metric-row {
      display: grid;
      grid-template-columns: 92px auto;
      align-items: baseline;
      gap: 10px;
    }

    .wg-metric-label {
      font-size: 12.5px;
      font-weight: 500;
      letter-spacing: 0.03em;
      color: var(--wg-text-muted);
      text-transform: uppercase;
    }

    .wg-metric-value {
      font-size: 15.5px;
      font-weight: 700;
      color: var(--wg-text);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .wg-legend-bar {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 12px 14px 14px;
      background: var(--wg-legend-bg);
      border-top: 1px solid var(--wg-border);
      gap: 8px;
    }

    .wg-legend-btn {
      appearance: none;
      background: transparent;
      border: none;
      padding: 4px 8px 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      position: relative;
      transition: opacity 0.18s ease, transform 0.12s ease;
    }

    .wg-legend-btn:hover {
      transform: translateY(-1px);
    }

    .wg-legend-btn::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 3px;
      border-radius: 2px;
      background: currentColor;
      transition: opacity 0.18s ease, transform 0.18s ease;
    }

    .wg-legend-btn.inactive {
      opacity: 0.38;
    }

    .wg-legend-btn.inactive::after {
      transform: scaleX(0.35);
      opacity: 0.4;
    }

    .wg-legend-temp {
      color: var(--wg-temp);
    }

    .wg-legend-rain {
      color: var(--wg-rain);
    }

    .wg-legend-wind {
      color: var(--wg-wind);
    }

    .wg-status-box {
      padding: 36px 22px;
      text-align: center;
      color: var(--wg-text-muted);
      font-size: 14px;
      line-height: 1.5;
    }

    .wg-skeleton {
      margin: 0 14px 16px;
      height: 280px;
      border-radius: 10px;
      background: linear-gradient(
        90deg,
        var(--wg-skeleton-a) 25%,
        var(--wg-skeleton-b) 50%,
        var(--wg-skeleton-a) 75%
      );
      background-size: 200% 100%;
      animation: wg-shimmer 1.5s infinite linear;
    }

    @keyframes wg-shimmer {
      from {
        background-position: 200% 0;
      }
      to {
        background-position: -200% 0;
      }
    }

    @container wg-card (max-width: 480px) {
      .wg-summary-panel,
      .wg-summary-panel.wg-no-metrics {
        grid-template-columns: auto 1fr;
        gap: 12px 16px;
        padding: 12px 14px;
      }

      .wg-summary-center {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-evenly;
        gap: 6px 16px;
      }

      .wg-summary-metrics {
        grid-column: 1 / -1;
        grid-template-columns: repeat(var(--wg-metric-count, 3), 1fr);
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--wg-border);
      }

      .wg-metric-row {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .wg-legend-btn {
        font-size: 13.5px;
      }
    }
  `;
let Ut = $t;
customElements.get("weather-graph-card") || customElements.define("weather-graph-card", Ut);
window.customCards = window.customCards || [];
window.customCards.some((i) => i.type === "weather-graph-card") || window.customCards.push({
  type: "weather-graph-card",
  name: "Weather Graph",
  description: "Interactive 48-hour temperature, rain probability, and directional wind graph powered by Bureau of Meteorology (BOM) or Home Assistant weather.",
  preview: !0
});
console.info(
  `%c WEATHER-GRAPH-CARD %c v${Ys} `,
  "background:#1b1a2e;color:#ff8f6b;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;",
  "background:#59c3c3;color:#1b1a2e;font-weight:700;padding:2px 6px;border-radius:0 4px 4px 0;"
);
export {
  Ut as WeatherGraphCard
};
