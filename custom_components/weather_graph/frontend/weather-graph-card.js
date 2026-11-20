/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ft = globalThis, Xt = ft.ShadowRoot && (ft.ShadyCSS === void 0 || ft.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, jt = Symbol(), te = /* @__PURE__ */ new WeakMap();
let xe = class {
  constructor(t, e, r) {
    if (this._$cssResult$ = !0, r !== jt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Xt && t === void 0) {
      const r = e !== void 0 && e.length === 1;
      r && (t = te.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && te.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ze = (s) => new xe(typeof s == "string" ? s : s + "", void 0, jt), Vt = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((r, i, n) => r + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + s[n + 1], s[0]);
  return new xe(e, s, jt);
}, Fe = (s, t) => {
  if (Xt) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const r = document.createElement("style"), i = ft.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = e.cssText, s.appendChild(r);
  }
}, ee = Xt ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const r of t.cssRules) e += r.cssText;
  return ze(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Be, defineProperty: Xe, getOwnPropertyDescriptor: je, getOwnPropertyNames: Ve, getOwnPropertySymbols: Ge, getPrototypeOf: Ke } = Object, U = globalThis, se = U.trustedTypes, Ye = se ? se.emptyScript : "", St = U.reactiveElementPolyfillSupport, at = (s, t) => s, Rt = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Ye : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, be = (s, t) => !Be(s, t), re = { attribute: !0, type: String, converter: Rt, reflect: !1, useDefault: !1, hasChanged: be };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), U.litPropertyMetadata ?? (U.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Z = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = re) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(t, r, e);
      i !== void 0 && Xe(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, r) {
    const { get: i, set: n } = je(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: i, set(o) {
      const a = i == null ? void 0 : i.call(this);
      n == null || n.call(this, o), this.requestUpdate(t, a, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? re;
  }
  static _$Ei() {
    if (this.hasOwnProperty(at("elementProperties"))) return;
    const t = Ke(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(at("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(at("properties"))) {
      const e = this.properties, r = [...Ve(e), ...Ge(e)];
      for (const i of r) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [r, i] of e) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, r] of this.elementProperties) {
      const i = this._$Eu(e, r);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const i of r) e.unshift(ee(i));
    } else t !== void 0 && e.push(ee(t));
    return e;
  }
  static _$Eu(t, e) {
    const r = e.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const r of e.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Fe(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var r;
      return (r = e.hostConnected) == null ? void 0 : r.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var r;
      return (r = e.hostDisconnected) == null ? void 0 : r.call(e);
    });
  }
  attributeChangedCallback(t, e, r) {
    this._$AK(t, r);
  }
  _$ET(t, e) {
    var n;
    const r = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, r);
    if (i !== void 0 && r.reflect === !0) {
      const o = (((n = r.converter) == null ? void 0 : n.toAttribute) !== void 0 ? r.converter : Rt).toAttribute(e, r.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var n, o;
    const r = this.constructor, i = r._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const a = r.getPropertyOptions(i), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : Rt;
      this._$Em = i;
      const d = c.fromAttribute(e, a.type);
      this[i] = d ?? ((o = this._$Ej) == null ? void 0 : o.get(i)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, e, r, i = !1, n) {
    var o;
    if (t !== void 0) {
      const a = this.constructor;
      if (i === !1 && (n = this[t]), r ?? (r = a.getPropertyOptions(t)), !((r.hasChanged ?? be)(n, e) || r.useDefault && r.reflect && n === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(a._$Eu(t, r)))) return;
      this.C(t, e, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: r, reflect: i, wrapped: n }, o) {
    r && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
    var r;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [n, o] of i) {
        const { wrapped: a } = o, c = this[n];
        a !== !0 || this._$AL.has(n) || c === void 0 || this.C(n, void 0, o, c);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (r = this._$EO) == null || r.forEach((i) => {
        var n;
        return (n = i.hostUpdate) == null ? void 0 : n.call(i);
      }), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((r) => {
      var i;
      return (i = r.hostUpdated) == null ? void 0 : i.call(r);
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
Z.elementStyles = [], Z.shadowRootOptions = { mode: "open" }, Z[at("elementProperties")] = /* @__PURE__ */ new Map(), Z[at("finalized")] = /* @__PURE__ */ new Map(), St == null || St({ ReactiveElement: Z }), (U.reactiveElementVersions ?? (U.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt = globalThis, ie = (s) => s, _t = lt.trustedTypes, ne = _t ? _t.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, ve = "$lit$", L = `lit$${Math.random().toFixed(9).slice(2)}$`, ke = "?" + L, Ze = `<${ke}>`, B = document, ct = () => B.createComment(""), dt = (s) => s === null || typeof s != "object" && typeof s != "function", Gt = Array.isArray, qe = (s) => Gt(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", At = `[ 	
\f\r]`, rt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, oe = /-->/g, ae = />/g, O = RegExp(`>|${At}(?:([^\\s"'>=/]+)(${At}*=${At}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), le = /'/g, ce = /"/g, Se = /^(?:script|style|textarea|title)$/i, Ae = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), y = Ae(1), _ = Ae(2), X = Symbol.for("lit-noChange"), $ = Symbol.for("lit-nothing"), de = /* @__PURE__ */ new WeakMap(), W = B.createTreeWalker(B, 129);
function Me(s, t) {
  if (!Gt(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ne !== void 0 ? ne.createHTML(t) : t;
}
const Je = (s, t) => {
  const e = s.length - 1, r = [];
  let i, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = rt;
  for (let a = 0; a < e; a++) {
    const c = s[a];
    let d, l, h = -1, u = 0;
    for (; u < c.length && (o.lastIndex = u, l = o.exec(c), l !== null); ) u = o.lastIndex, o === rt ? l[1] === "!--" ? o = oe : l[1] !== void 0 ? o = ae : l[2] !== void 0 ? (Se.test(l[2]) && (i = RegExp("</" + l[2], "g")), o = O) : l[3] !== void 0 && (o = O) : o === O ? l[0] === ">" ? (o = i ?? rt, h = -1) : l[1] === void 0 ? h = -2 : (h = o.lastIndex - l[2].length, d = l[1], o = l[3] === void 0 ? O : l[3] === '"' ? ce : le) : o === ce || o === le ? o = O : o === oe || o === ae ? o = rt : (o = O, i = void 0);
    const w = o === O && s[a + 1].startsWith("/>") ? " " : "";
    n += o === rt ? c + Ze : h >= 0 ? (r.push(d), c.slice(0, h) + ve + c.slice(h) + L + w) : c + L + (h === -2 ? a : w);
  }
  return [Me(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class ht {
  constructor({ strings: t, _$litType$: e }, r) {
    let i;
    this.parts = [];
    let n = 0, o = 0;
    const a = t.length - 1, c = this.parts, [d, l] = Je(t, e);
    if (this.el = ht.createElement(d, r), W.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = W.nextNode()) !== null && c.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(ve)) {
          const u = l[o++], w = i.getAttribute(h).split(L), p = /([.?@])?(.*)/.exec(u);
          c.push({ type: 1, index: n, name: p[2], strings: w, ctor: p[1] === "." ? ts : p[1] === "?" ? es : p[1] === "@" ? ss : vt }), i.removeAttribute(h);
        } else h.startsWith(L) && (c.push({ type: 6, index: n }), i.removeAttribute(h));
        if (Se.test(i.tagName)) {
          const h = i.textContent.split(L), u = h.length - 1;
          if (u > 0) {
            i.textContent = _t ? _t.emptyScript : "";
            for (let w = 0; w < u; w++) i.append(h[w], ct()), W.nextNode(), c.push({ type: 2, index: ++n });
            i.append(h[u], ct());
          }
        }
      } else if (i.nodeType === 8) if (i.data === ke) c.push({ type: 2, index: n });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(L, h + 1)) !== -1; ) c.push({ type: 7, index: n }), h += L.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const r = B.createElement("template");
    return r.innerHTML = t, r;
  }
}
function q(s, t, e = s, r) {
  var o, a;
  if (t === X) return t;
  let i = r !== void 0 ? (o = e._$Co) == null ? void 0 : o[r] : e._$Cl;
  const n = dt(t) ? void 0 : t._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== n && ((a = i == null ? void 0 : i._$AO) == null || a.call(i, !1), n === void 0 ? i = void 0 : (i = new n(s), i._$AT(s, e, r)), r !== void 0 ? (e._$Co ?? (e._$Co = []))[r] = i : e._$Cl = i), i !== void 0 && (t = q(s, i._$AS(s, t.values), i, r)), t;
}
class Qe {
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
    const { el: { content: e }, parts: r } = this._$AD, i = ((t == null ? void 0 : t.creationScope) ?? B).importNode(e, !0);
    W.currentNode = i;
    let n = W.nextNode(), o = 0, a = 0, c = r[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let d;
        c.type === 2 ? d = new ut(n, n.nextSibling, this, t) : c.type === 1 ? d = new c.ctor(n, c.name, c.strings, this, t) : c.type === 6 && (d = new rs(n, this, t)), this._$AV.push(d), c = r[++a];
      }
      o !== (c == null ? void 0 : c.index) && (n = W.nextNode(), o++);
    }
    return W.currentNode = B, i;
  }
  p(t) {
    let e = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, e), e += r.strings.length - 2) : r._$AI(t[e])), e++;
  }
}
class ut {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, r, i) {
    this.type = 2, this._$AH = $, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = r, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
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
    t = q(this, t, e), dt(t) ? t === $ || t == null || t === "" ? (this._$AH !== $ && this._$AR(), this._$AH = $) : t !== this._$AH && t !== X && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : qe(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== $ && dt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(B.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: e, _$litType$: r } = t, i = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = ht.createElement(Me(r.h, r.h[0]), this.options)), r);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === i) this._$AH.p(e);
    else {
      const o = new Qe(i, this), a = o.u(this.options);
      o.p(e), this.T(a), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = de.get(t.strings);
    return e === void 0 && de.set(t.strings, e = new ht(t)), e;
  }
  k(t) {
    Gt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let r, i = 0;
    for (const n of t) i === e.length ? e.push(r = new ut(this.O(ct()), this.O(ct()), this, this.options)) : r = e[i], r._$AI(n), i++;
    i < e.length && (this._$AR(r && r._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, e); t !== this._$AB; ) {
      const i = ie(t).nextSibling;
      ie(t).remove(), t = i;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class vt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, r, i, n) {
    this.type = 1, this._$AH = $, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = n, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = $;
  }
  _$AI(t, e = this, r, i) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = q(this, t, e, 0), o = !dt(t) || t !== this._$AH && t !== X, o && (this._$AH = t);
    else {
      const a = t;
      let c, d;
      for (t = n[0], c = 0; c < n.length - 1; c++) d = q(this, a[r + c], e, c), d === X && (d = this._$AH[c]), o || (o = !dt(d) || d !== this._$AH[c]), d === $ ? t = $ : t !== $ && (t += (d ?? "") + n[c + 1]), this._$AH[c] = d;
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === $ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ts extends vt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === $ ? void 0 : t;
  }
}
class es extends vt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== $);
  }
}
class ss extends vt {
  constructor(t, e, r, i, n) {
    super(t, e, r, i, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = q(this, t, e, 0) ?? $) === X) return;
    const r = this._$AH, i = t === $ && r !== $ || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, n = t !== $ && (r === $ || i);
    i && this.element.removeEventListener(this.name, this, r), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class rs {
  constructor(t, e, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    q(this, t);
  }
}
const Mt = lt.litHtmlPolyfillSupport;
Mt == null || Mt(ht, ut), (lt.litHtmlVersions ?? (lt.litHtmlVersions = [])).push("3.3.3");
const is = (s, t, e) => {
  const r = (e == null ? void 0 : e.renderBefore) ?? t;
  let i = r._$litPart$;
  if (i === void 0) {
    const n = (e == null ? void 0 : e.renderBefore) ?? null;
    r._$litPart$ = i = new ut(t.insertBefore(ct(), n), n, void 0, e ?? {});
  }
  return i._$AI(s), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = globalThis;
let F = class extends Z {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = is(e, this.renderRoot, this.renderOptions);
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
var $e;
F._$litElement$ = !0, F.finalized = !0, ($e = z.litElementHydrateSupport) == null || $e.call(z, { LitElement: F });
const Ct = z.litElementPolyfillSupport;
Ct == null || Ct({ LitElement: F });
(z.litElementVersions ?? (z.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ns = { ATTRIBUTE: 1 }, os = (s) => (...t) => ({ _$litDirective$: s, values: t });
let as = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, r) {
    this._$Ct = t, this._$AM = e, this._$Ci = r;
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
const Ce = "important", ls = " !" + Ce, cs = os(class extends as {
  constructor(s) {
    var t;
    if (super(s), s.type !== ns.ATTRIBUTE || s.name !== "style" || ((t = s.strings) == null ? void 0 : t.length) > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(s) {
    return Object.keys(s).reduce((t, e) => {
      const r = s[e];
      return r == null ? t : t + `${e = e.includes("-") ? e : e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${r};`;
    }, "");
  }
  update(s, [t]) {
    const { style: e } = s.element;
    if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
    for (const r of this.ft) t[r] == null && (this.ft.delete(r), r.includes("-") ? e.removeProperty(r) : e[r] = null);
    for (const r in t) {
      const i = t[r];
      if (i != null) {
        this.ft.add(r);
        const n = typeof i == "string" && i.endsWith(ls);
        r.includes("-") || n ? e.setProperty(r, n ? i.slice(0, -11) : i, n ? Ce : "") : e[r] = i;
      }
    }
    return X;
  }
});
function Ee(s, t, e) {
  switch ((s ?? "").trim().toLowerCase()) {
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
const it = (s = 16, t = 15, e = 7.2) => _`
  <g>
    <g stroke="#f6bd2b" stroke-width="2.1" stroke-linecap="round">
      <line x1=${s} y1=${t - e - 4.2} x2=${s} y2=${t - e - 1.8} />
      <line x1=${s} y1=${t + e + 1.8} x2=${s} y2=${t + e + 4.2} />
      <line x1=${s - e - 4.2} y1=${t} x2=${s - e - 1.8} y2=${t} />
      <line x1=${s + e + 1.8} y1=${t} x2=${s + e + 4.2} y2=${t} />
      <line x1=${s - (e + 2.8) * 0.71} y1=${t - (e + 2.8) * 0.71} x2=${s - (e + 0.9) * 0.71} y2=${t - (e + 0.9) * 0.71} />
      <line x1=${s + (e + 0.9) * 0.71} y1=${t + (e + 0.9) * 0.71} x2=${s + (e + 2.8) * 0.71} y2=${t + (e + 2.8) * 0.71} />
      <line x1=${s + (e + 2.8) * 0.71} y1=${t - (e + 2.8) * 0.71} x2=${s + (e + 0.9) * 0.71} y2=${t - (e + 0.9) * 0.71} />
      <line x1=${s - (e + 0.9) * 0.71} y1=${t + (e + 0.9) * 0.71} x2=${s - (e + 2.8) * 0.71} y2=${t + (e + 2.8) * 0.71} />
    </g>
    <circle cx=${s} cy=${t} r=${e} fill="#f8c630" />
  </g>
`, Et = (s = 0, t = 0) => _`
  <path
    transform="translate(${s}, ${t})"
    d="M18.2 7.2A8.3 8.3 0 0 0 10.6 18.8 8.4 8.4 0 0 0 22.4 20.1 6.9 6.9 0 0 1 18.2 7.2Z"
    fill="#9eb1c4"
  />
`, P = (s = 0, t = 0) => _`
  <path
    transform="translate(${s}, ${t})"
    d="M13.2 26.8H29.4A5.4 5.4 0 0 0 30.1 16.1 7.6 7.6 0 0 0 15.6 14.3 6.2 6.2 0 0 0 13.2 26.8Z"
    fill="#f1f5f9"
  />
`, K = (s = 0, t = 0) => _`
  <path
    transform="translate(${s}, ${t})"
    d="M9.5 23.6H23.2A4.6 4.6 0 0 0 23.8 14.5 6.4 6.4 0 0 0 11.5 13 5.2 5.2 0 0 0 9.5 23.6Z"
    fill="#94a8be"
  />
`, Tt = (s = 3, t = 28.5) => s === 2 ? _`
      <g style="fill: var(--wg-rain, #4cc9f0)">
        <circle cx="18.5" cy=${t + 1.5} r="1.45" />
        <circle cx="24.5" cy=${t + 3.2} r="1.45" />
      </g>
    ` : s === 4 ? _`
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
  `, he = () => _`
  <polygon
    points="22.8,22.2 18.2,29.2 21.8,29.2 19.9,35.6 27.4,27.3 23.4,27.3"
    fill="#38bdf8"
    style="stroke: var(--wg-bg, #0d1e33)"
    stroke-width="0.6"
    stroke-linejoin="round"
  />
`;
function Te(s) {
  switch (s) {
    case "sunny":
      return it(20, 20, 8.2);
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
          ${it(15.5, 15.5, 6.8)}
          ${P(2, 2)}
        </g>
      `;
    case "partly-cloudy-day":
      return _`
        <g>
          ${it(15, 15, 6.5)}
          ${K(5, 1)}
          ${P(1, 2.5)}
        </g>
      `;
    case "partly-cloudy-night":
      return _`
        <g>
          ${Et(-1, 0)}
          ${K(5, 2)}
          ${P(1, 3)}
        </g>
      `;
    case "cloudy":
      return _`
        <g>
          ${K(0, -1)}
          ${P(1, 3)}
        </g>
      `;
    case "light-shower-day":
      return _`
        <g>
          ${it(14.5, 13.5, 5.8)}
          ${P(0, 0)}
          ${Tt(3, 28)}
        </g>
      `;
    case "light-shower-night":
      return _`
        <g>
          ${Et(-2, -2)}
          ${K(4, -1)}
          ${P(0, 0.5)}
          ${Tt(3, 28.5)}
        </g>
      `;
    case "rain":
    case "heavy-rain":
      return _`
        <g>
          ${K(0, -2.5)}
          ${P(1, 0)}
          ${Tt(4, 28.2)}
        </g>
      `;
    case "storm-day":
      return _`
        <g>
          ${it(14.5, 13.8, 6.1)}
          ${P(0.5, 0.5)}
          ${he()}
        </g>
      `;
    case "storm-night":
      return _`
        <g>
          ${Et(-2, -2)}
          ${K(3, -1.5)}
          ${P(0.5, 0.5)}
          ${he()}
        </g>
      `;
    case "fog":
      return _`
        <g>
          ${P(-1, -2)}
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
          ${P(0, -1)}
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
function ds(s, t = 36) {
  return y`
    <svg
      width=${t}
      height=${t}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      ${Te(s)}
    </svg>
  `;
}
function hs(s, t, e, r = 32) {
  return _`
    <svg
      x=${t}
      y=${e}
      width=${r}
      height=${r}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      ${Te(s)}
    </svg>
  `;
}
function us(s = 18) {
  return y`
    <svg
      width=${s}
      height=${s}
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
function ps(s = 16) {
  return y`
    <svg
      width=${s}
      height=${s}
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
const gs = [
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
], ue = {
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
function Pe(s, t) {
  if (s == null || t === null || t === void 0 || !Number.isFinite(s) || !Number.isFinite(t) || t <= 0)
    return null;
  const e = Math.max(1, Math.min(100, t)), r = 17.27, i = 237.7, n = r * s / (i + s) + Math.log(e / 100), o = r - n;
  return Math.abs(o) < 1e-9 ? null : Math.round(i * n / o * 10) / 10;
}
function Kt(s) {
  if (s == null)
    return { cardinal: null, degrees: null };
  if (typeof s == "number") {
    if (!Number.isFinite(s))
      return { cardinal: null, degrees: null };
    const t = (s % 360 + 360) % 360, e = Math.floor((t + 11.25) / 22.5) % 16;
    return {
      cardinal: gs[e],
      degrees: Math.round(t * 10) / 10
    };
  }
  if (typeof s == "string") {
    const t = s.trim().toUpperCase();
    if (!t || t === "CALM" || t === "UNAVAILABLE" || t === "UNKNOWN")
      return { cardinal: null, degrees: null };
    if (t in ue)
      return { cardinal: t, degrees: ue[t] };
    const e = Number(t);
    if (Number.isFinite(e))
      return Kt(e);
  }
  return { cardinal: null, degrees: null };
}
function fs(s) {
  return s == null || !Number.isFinite(s) ? 0 : ((s + 180) % 360 + 360) % 360;
}
function ms(s, t) {
  if (!s || typeof s != "string")
    return null;
  const e = s.trim();
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(e)) {
    const h = Date.parse(e);
    return Number.isFinite(h) ? h : null;
  }
  const i = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(e);
  if (!i) {
    const h = Date.parse(e);
    return Number.isFinite(h) ? h : null;
  }
  const n = Number(i[1]), o = Number(i[2]), a = Number(i[3]), c = Number(i[4]), d = Number(i[5]), l = Number(i[6] ?? "0");
  try {
    const h = Date.UTC(n, o - 1, a, c, d, l), w = new Intl.DateTimeFormat("en-US", {
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
    return new Date(n, o - 1, a, c, d, l).getTime();
  }
}
function J(s, t) {
  try {
    const r = new Intl.DateTimeFormat("en-US", {
      timeZone: t || void 0,
      hour: "numeric",
      hourCycle: "h23"
    }).formatToParts(new Date(s)).find((i) => i.type === "hour");
    return r ? Number(r.value) % 24 : new Date(s).getHours();
  } catch {
    return new Date(s).getHours();
  }
}
function ws(s, t) {
  var e, r, i;
  try {
    const n = {
      weekday: "short",
      hour: "numeric",
      hour12: !0,
      ...t ? { timeZone: t } : {}
    }, o = new Intl.DateTimeFormat("en-US", n).formatToParts(
      new Date(s)
    ), a = (((e = o.find((l) => l.type === "weekday")) == null ? void 0 : e.value) ?? "").toUpperCase(), c = ((r = o.find((l) => l.type === "hour")) == null ? void 0 : r.value) ?? "", d = (((i = o.find((l) => l.type === "dayPeriod")) == null ? void 0 : i.value) ?? "").toUpperCase();
    return `${a} ${c}${d}`.trim();
  } catch {
    const n = new Date(s), o = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], a = n.getHours(), c = a >= 12 ? "PM" : "AM", d = a % 12 || 12;
    return `${o[n.getDay()]} ${d}${c}`;
  }
}
function pe(s, t) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...t ? { timeZone: t } : {}
    }).format(new Date(s));
  } catch {
    const e = new Date(s), r = (i) => String(i).padStart(2, "0");
    return `${e.getFullYear()}-${r(e.getMonth() + 1)}-${r(e.getDate())}`;
  }
}
function gt(s, t) {
  try {
    const e = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0,
      ...t ? { timeZone: t } : {}
    }).formatToParts(new Date(s)), r = (n) => {
      var o;
      return ((o = e.find((a) => a.type === n)) == null ? void 0 : o.value) ?? "";
    }, i = r("minute");
    return `${r("hour")}${i && i !== "00" ? `:${i}` : ""}${r("dayPeriod").toLowerCase()}`;
  } catch {
    return Ne(s, t);
  }
}
function Ne(s, t) {
  const e = J(s, t), r = e >= 12 ? "pm" : "am";
  return `${e % 12 || 12}${r}`;
}
function _s(s, t) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      ...t ? { timeZone: t } : {}
    }).format(new Date(s)).toUpperCase();
  } catch {
    return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(s).getDay()];
  }
}
function ys(s) {
  const e = s.map((h) => h.temperature).filter((h) => h !== null && Number.isFinite(h));
  let r = 5, i = 10;
  if (e.length > 0) {
    const h = Math.min(...e), u = Math.max(...e);
    u - h > 18 ? r = 10 : r = 5;
    const p = r * 4, x = (h + u) / 2;
    i = Math.round((x - p / 2) / r) * r, h <= i + 0.5 && (i = Math.floor((h - 1) / r) * r), u >= i + p - 0.5 && (u - i > p ? (r = Math.ceil((u - h + 4) / 4 / 5) * 5, i = Math.floor((h - 1) / 5) * 5) : i = Math.ceil((u + 1 - p) / r) * r);
  }
  const n = Array.from(
    { length: 5 },
    (h, u) => i + u * r
  ), o = s.map((h) => h.wind_speed_kmh).filter((h) => Number.isFinite(h)), a = o.length > 0 ? Math.max(...o) : 25, c = [10, 15, 20, 25, 30];
  let d = 10;
  for (const h of c) {
    if (h * 4 >= Math.max(32, a * 1.12)) {
      d = h;
      break;
    }
    d = h;
  }
  const l = Array.from({ length: 5 }, (h, u) => u * d);
  return {
    temp: {
      min: n[0],
      max: n[4],
      step: r,
      ticks: n
    },
    wind: {
      min: 0,
      max: l[4],
      step: d,
      ticks: l
    },
    gridCount: 5
  };
}
function ge(s, t) {
  var n;
  if (!(s != null && s.states))
    return t || null;
  if (t) {
    const o = s.states[t], a = Number(((n = o == null ? void 0 : o.attributes) == null ? void 0 : n.supported_features) ?? 0);
    if (o && (a & 2) !== 0)
      return t;
    const c = t.endsWith("_hourly") ? t : `${t}_hourly`;
    if (s.states[c])
      return c;
    if (o)
      return t;
  }
  const e = Object.keys(s.states).filter(
    (o) => o.startsWith("weather.")
  ), r = e.find((o) => o.endsWith("_hourly"));
  if (r)
    return r;
  const i = e.find((o) => {
    var c, d;
    return (Number(((d = (c = s.states[o]) == null ? void 0 : c.attributes) == null ? void 0 : d.supported_features) ?? 0) & 2) !== 0;
  });
  return i || (e[0] ?? null);
}
function D(s) {
  if (s == null || typeof s == "boolean")
    return null;
  const t = Number(s);
  return Number.isFinite(t) ? t : null;
}
function Pt(s, t) {
  return s === null ? null : t.toUpperCase().includes("F") ? Math.round((s - 32) * 5 / 9 * 10) / 10 : Math.round(s * 10) / 10;
}
function fe(s, t) {
  if (s === null) return null;
  const e = (t ?? "km/h").trim().toLowerCase();
  return e === "mph" || e === "mi/h" ? Math.round(s * 1.60934 * 10) / 10 : e === "m/s" || e === "mps" ? Math.round(s * 3.6 * 10) / 10 : e === "kn" || e === "kt" || e === "knots" ? Math.round(s * 1.852 * 10) / 10 : Math.round(s * 10) / 10;
}
function $s(s, t, e, r = 48) {
  var w, p, x, k, S;
  const i = t.states[e], n = (i == null ? void 0 : i.attributes) ?? {}, o = ((w = t.config) == null ? void 0 : w.time_zone) || "UTC", a = n.temperature_unit || ((x = (p = t.config) == null ? void 0 : p.unit_system) == null ? void 0 : x.temperature) || "°C", c = n.wind_speed_unit || ((S = (k = t.config) == null ? void 0 : k.unit_system) == null ? void 0 : S.wind_speed) || "km/h", d = t.states["sun.sun"], l = [];
  if (d != null && d.attributes) {
    const m = d.attributes.next_rising, T = d.attributes.next_setting, M = m ? Date.parse(m) : NaN, C = T ? Date.parse(T) : NaN;
    (Number.isFinite(M) || Number.isFinite(C)) && l.push({
      sunrise: Number.isFinite(M) ? new Date(M).toISOString() : null,
      sunrise_ms: Number.isFinite(M) ? M : null,
      sunset: Number.isFinite(C) ? new Date(C).toISOString() : null,
      sunset_ms: Number.isFinite(C) ? C : null
    });
  }
  const h = Math.max(1, Math.min(72, r)), u = [];
  for (const m of s) {
    const T = String(m.datetime ?? ""), M = ms(T, o);
    if (M === null) continue;
    const C = Pt(
      D(m.temperature ?? m.native_temperature),
      a
    ), V = Pt(
      D(m.apparent_temperature ?? m.native_apparent_temperature),
      a
    ), I = D(m.humidity), g = Pt(
      D(m.dew_point ?? m.native_dew_point),
      a
    ) ?? Pe(C, I), f = D(m.precipitation_probability) ?? 0, v = D(m.precipitation ?? m.native_precipitation), G = fe(D(m.wind_speed ?? m.native_wind_speed), c) ?? 0, st = fe(
      D(m.wind_gust_speed ?? m.native_wind_gust_speed),
      c
    ), { cardinal: qt, degrees: pt } = Kt(
      m.wind_bearing
    ), Jt = String(m.condition ?? "partlycloudy"), Qt = J(M, o), We = !!m.is_night || Jt === "clear-night" || Qt < 6 || Qt >= 19;
    if (u.push({
      datetime: T,
      epoch_ms: M,
      temperature: C,
      feels_like: V,
      humidity: I,
      dew_point: g,
      rain_chance: Math.max(0, Math.min(100, f)),
      rain_min_mm: null,
      rain_max_mm: v,
      wind_speed_kmh: Math.max(0, G),
      wind_gust_kmh: st,
      wind_direction: qt,
      wind_bearing_deg: pt,
      icon_descriptor: m.icon_descriptor ?? null,
      condition: Jt,
      is_night: We,
      uv_index: D(m.uv_index)
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
    sun_windows: l,
    hourly: u
  };
}
function mt(s) {
  if (s.length === 0) return "";
  if (s.length === 1)
    return `M ${b(s[0].x)} ${b(s[0].y)}`;
  if (s.length === 2)
    return `M ${b(s[0].x)} ${b(s[0].y)} L ${b(s[1].x)} ${b(s[1].y)}`;
  const t = s.length, e = new Array(t - 1), r = new Array(t - 1), i = new Array(t - 1);
  for (let a = 0; a < t - 1; a++)
    e[a] = s[a + 1].x - s[a].x, r[a] = s[a + 1].y - s[a].y, i[a] = e[a] !== 0 ? r[a] / e[a] : 0;
  const n = new Array(t);
  n[0] = i[0], n[t - 1] = i[t - 2];
  for (let a = 1; a < t - 1; a++)
    if (i[a - 1] * i[a] <= 0)
      n[a] = 0;
    else {
      const c = 2 * e[a] + e[a - 1], d = e[a] + 2 * e[a - 1];
      n[a] = (c + d) / (c / i[a - 1] + d / i[a]);
    }
  for (let a = 0; a < t - 1; a++)
    if (Math.abs(i[a]) < 1e-9)
      n[a] = 0, n[a + 1] = 0;
    else {
      const c = n[a] / i[a], d = n[a + 1] / i[a], l = Math.hypot(c, d);
      if (l > 3) {
        const h = 3 / l;
        n[a] = h * c * i[a], n[a + 1] = h * d * i[a];
      }
    }
  let o = `M ${b(s[0].x)} ${b(s[0].y)}`;
  for (let a = 0; a < t - 1; a++) {
    const c = s[a], d = s[a + 1], l = e[a], h = c.x + l / 3, u = c.y + n[a] * l / 3, w = d.x - l / 3, p = d.y - n[a + 1] * l / 3;
    o += ` C ${b(h)} ${b(u)}, ${b(w)} ${b(p)}, ${b(d.x)} ${b(d.y)}`;
  }
  return o;
}
function xs(s, t) {
  if (s.length === 0) return "";
  if (s.length === 1) {
    const n = s[0];
    return `M ${b(n.x)} ${b(t)} L ${b(n.x)} ${b(n.y)} L ${b(n.x)} ${b(t)} Z`;
  }
  const e = mt(s), r = s[0], i = s[s.length - 1];
  return `${e} L ${b(i.x)} ${b(t)} L ${b(r.x)} ${b(t)} Z`;
}
function bs(s, t, e, r) {
  if (s.length === 0 || r <= 0)
    return [];
  if (s.length === 1)
    return [{ startX: 0, endX: r, isNight: s[0].is_night }];
  const i = s[0].epoch_ms, n = s[s.length - 1].epoch_ms, o = e(0), a = e(s.length - 1), c = n - i, d = (p) => {
    if (c <= 0) return o;
    const x = (p - i) / c;
    return Math.max(0, Math.min(r, o + x * (a - o)));
  }, l = [];
  for (const p of t)
    p.sunrise_ms !== null && p.sunrise_ms > i && p.sunrise_ms < n && l.push({ x: d(p.sunrise_ms), toNight: !1 }), p.sunset_ms !== null && p.sunset_ms > i && p.sunset_ms < n && l.push({ x: d(p.sunset_ms), toNight: !0 });
  if (l.length > 0) {
    l.sort((S, m) => S.x - m.x);
    const p = [];
    let x = 0, k = !l[0].toNight;
    for (const S of l) {
      const m = Math.max(x, Math.min(r, S.x));
      m > x && p.push({ startX: x, endX: m, isNight: k }), x = m, k = S.toNight;
    }
    return x < r && p.push({ startX: x, endX: r, isNight: k }), p;
  }
  const h = [];
  let u = 0, w = s[0].is_night;
  for (let p = 1; p < s.length; p++)
    if (s[p].is_night !== w) {
      const x = (e(p - 1) + e(p)) / 2;
      h.push({ startX: u, endX: x, isNight: w }), u = x, w = s[p].is_night;
    }
  return h.push({ startX: u, endX: r, isNight: w }), h;
}
function b(s) {
  return (Math.round(s * 100) / 100).toString();
}
const N = 76, vs = 112, Y = 272, H = 288, nt = 44, ot = 44, Nt = 14, $t = class $t extends F {
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
        const r = e.contentRect.width;
        r > 80 && Math.abs(r - this._viewportWidth) >= 1 && (this._viewportWidth = r, this._updateScrollIndicators());
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
    const t = Math.max(1, this.hours.length), e = Math.max(8, Math.min(t, this.visibleHours || 24)), i = Math.max(
      180,
      this._viewportWidth - nt - ot - Nt * 2
    ) / Math.max(1, e - 1), n = nt + Nt, o = Math.max(
      this._viewportWidth,
      Math.ceil(
        n + (t - 1) * i + ot + Nt
      )
    );
    return { count: t, hourSpacing: i, firstX: n, totalWidth: o, xForIndex: (c) => n + c * i };
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
    const r = e.getBoundingClientRect(), { firstX: i, hourSpacing: n } = this._getGeometry(), o = t - r.left + e.scrollLeft, a = Math.round((o - i) / n);
    return Math.max(0, Math.min(this.hours.length - 1, a));
  }
  _onPointerDown(t) {
    if (this.hours.length === 0 || t.pointerType === "mouse" && t.button !== 0) return;
    const e = this._scrollEl;
    if (e) {
      if (t.pointerType === "touch") {
        const r = e.getBoundingClientRect(), { xForIndex: i } = this._getGeometry(), n = r.left + i(this.selectedIndex) - e.scrollLeft;
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
    const r = this._scrollEl;
    if (r) {
      const i = r.getBoundingClientRect(), n = 48;
      t.clientX > i.right - n ? r.scrollLeft += 14 : t.clientX < i.left + n && (r.scrollLeft -= 14);
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
    const { xForIndex: r } = this._getGeometry(), i = r(t), n = e.scrollLeft + nt + 16, o = e.scrollLeft + e.clientWidth - ot - 16;
    i < n ? e.scrollTo({ left: Math.max(0, i - nt - 24), behavior: "smooth" }) : i > o && e.scrollTo({
      left: i - e.clientWidth + ot + 24,
      behavior: "smooth"
    });
  }
  _panByHours(t) {
    const e = this._scrollEl;
    if (!e) return;
    const { hourSpacing: r } = this._getGeometry();
    e.scrollBy({
      left: t * r,
      behavior: "smooth"
    });
  }
  _updateScrollIndicators() {
    const t = this._scrollEl;
    t && (this._canScrollLeft = t.scrollLeft > 4, this._canScrollRight = t.scrollLeft + t.clientWidth < t.scrollWidth - 4);
  }
  render() {
    if (this.hours.length === 0)
      return $;
    const { totalWidth: t, xForIndex: e } = this._getGeometry(), r = ys(this.hours), i = Y - vs, n = (g) => {
      const f = r.temp.max - r.temp.min || 1, v = (g - r.temp.min) / f;
      return Y - v * i;
    }, o = (g) => {
      const f = Math.max(0, Math.min(100, g));
      return Y - f / 100 * i;
    }, a = (g) => {
      const f = r.wind.max || 40, v = Math.max(0, g);
      return Y - Math.min(1.06, v / f) * i;
    }, c = bs(
      this.hours,
      this.sunWindows,
      e,
      t
    ), d = this.hours.map((g, f) => ({
      x: e(f),
      y: o(g.rain_chance)
    })), l = this.hours.map(
      (g, f) => g.temperature !== null ? { x: e(f), y: n(g.temperature) } : null
    ).filter((g) => g !== null), h = this.hours.map((g, f) => ({
      x: e(f),
      y: a(g.wind_speed_kmh)
    })), u = xs(d, Y), w = mt(d), p = mt(l), x = mt(h), k = [];
    for (let g = 0; g < this.hours.length; g++)
      J(this.hours[g].epoch_ms, this.timeZone) % 3 === 0 && k.push(g);
    if (k.length === 0)
      for (let g = 0; g < this.hours.length; g += 3)
        k.push(g);
    const S = Math.max(
      0,
      Math.min(this.hours.length - 1, this.selectedIndex)
    ), m = e(S), T = Array.from({ length: r.gridCount }, (g, f) => {
      const v = f / (r.gridCount - 1);
      return Y - v * i;
    }), M = {
      unit: "%",
      ticks: Array.from(
        { length: r.gridCount },
        (g, f) => Math.round(f * 100 / (r.gridCount - 1))
      ),
      tone: "rain",
      dim: !1
    }, C = this.showRain && !this.showTemperature, V = this.showRain && this.showTemperature && !this.showWind, I = C ? M : { unit: "°C", ticks: r.temp.ticks, tone: "temp", dim: !this.showTemperature }, et = V ? M : { unit: "km/h", ticks: r.wind.ticks, tone: "wind", dim: !this.showWind };
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
            ` : $}
        ${this._canScrollRight ? y`
              <button
                class="wg-pan-btn wg-pan-right"
                type="button"
                aria-label="Scroll later hours"
                @click=${() => this._panByHours(12)}
              >
                &#8250;
              </button>
            ` : $}

        <div
          class="wg-axis-overlay wg-axis-left wg-axis-${I.tone} ${I.dim ? "wg-axis-dim" : ""}"
          aria-hidden="true"
        >
          <span class="wg-axis-unit">${I.unit}</span>
          ${I.ticks.map(
      (g, f) => y`
              <span
                class="wg-axis-tick"
                style="top: ${T[f] - N}px"
              >
                ${g}
              </span>
            `
    )}
        </div>

        <div
          class="wg-axis-overlay wg-axis-right wg-axis-${et.tone} ${et.dim ? "wg-axis-dim" : ""}"
          aria-hidden="true"
        >
          <span class="wg-axis-unit">${et.unit}</span>
          ${et.ticks.map(
      (g, f) => y`
              <span
                class="wg-axis-tick"
                style="top: ${T[f] - N}px"
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
                      height=${N}
                      class="wg-band-${v}-strip"
                    />
                    <rect
                      x=${g.startX}
                      y=${N}
                      width=${f + 0.5}
                      height=${H - N}
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
              ${T.map(
      (g) => _`
                  <line x1="0" y1=${g} x2=${t} y2=${g} />
                `
    )}
            </g>

            <line
              x1="0"
              y1=${N}
              x2=${t}
              y2=${N}
              class="wg-strip-rule"
              stroke-width="1.2"
            />
            <g class="wg-strip-rule" stroke-width="1.2">
              ${this.hours.map((g, f) => {
      const v = e(f);
      return _`
                  <line
                    x1=${v}
                    y1=${N - 6}
                    x2=${v}
                    y2=${N}
                  />
                `;
    })}
            </g>

            <g class="wg-strip-markers">
              ${k.map((g) => {
      const f = this.hours[g], v = e(g), G = Ee(
        f.icon_descriptor,
        f.condition,
        f.is_night
      ), st = Ne(f.epoch_ms, this.timeZone), pt = J(f.epoch_ms, this.timeZone) === 0 ? _s(f.epoch_ms, this.timeZone) : null;
      return _`
                  <g>
                    <g class="wg-strip-icon">
                      ${hs(G, v - 16, 6, 32)}
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
                      ${st}
                    </text>
                    ${pt ? _`
                          <text
                            x=${v}
                            y="69"
                            text-anchor="middle"
                            class="wg-day-pill"
                          >
                            ${pt}
                          </text>
                        ` : $}
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
                d=${x}
                fill="none"
                class="wg-wind-line"
                stroke-width="2"
                stroke-linecap="round"
              />
              ${this.hours.map((g, f) => {
      const v = e(f), G = a(g.wind_speed_kmh);
      if (g.wind_bearing_deg === null || g.wind_speed_kmh < 0.4)
        return _`
                    <circle
                      cx=${v}
                      cy=${G}
                      r="3"
                      class="wg-wind-marker"
                      fill-opacity="0.7"
                    />
                  `;
      const st = fs(g.wind_bearing_deg);
      return _`
                  <path
                    d="M 0 -7.2 L 5.2 6.4 L 0 3.3 L -5.2 6.4 Z"
                    class="wg-wind-marker"
                    transform="translate(${v}, ${G}) rotate(${st})"
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
$t.properties = {
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
}, $t.styles = Vt`
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
      top: ${N}px;
      height: ${H - N}px;
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
      width: ${nt + 8}px;
      background: linear-gradient(
        90deg,
        var(--wg-axis-fade) 62%,
        var(--wg-axis-fade-clear) 100%
      );
    }

    .wg-axis-right {
      right: 0;
      width: ${ot + 8}px;
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
let Dt = $t;
customElements.get("wg-forecast-chart") || customElements.define("wg-forecast-chart", Dt);
const Ht = 3, ks = ["wind", "humidity", "dew_point"], Yt = [
  { id: "wind", label: "Wind" },
  { id: "wind_gust", label: "Wind gust" },
  { id: "humidity", label: "Humidity" },
  { id: "dew_point", label: "Dew point" },
  { id: "feels_like", label: "Feels like" },
  { id: "uv", label: "UV index" },
  { id: "uv_time", label: "UV time" },
  { id: "rain_amount", label: "Rain amount" }
], Ss = new Set(Yt.map((s) => s.id));
function Lt(s) {
  if (!Array.isArray(s)) return [...ks];
  const t = [];
  for (const e of s)
    typeof e == "string" && Ss.has(e) && !t.includes(e) && t.push(e);
  return t.slice(0, Ht);
}
function As(s) {
  return s < 3 ? "Low" : s < 6 ? "Moderate" : s < 8 ? "High" : s < 11 ? "Very High" : "Extreme";
}
const R = (s) => s != null && Number.isFinite(s), Ms = 3, Cs = 36e5;
function Es(s, t, e) {
  var c;
  if (!s) return null;
  const r = pe(t, e), i = (c = s.uv_windows) == null ? void 0 : c.find((d) => d.date === r);
  if (i) return { start_ms: i.start_ms, end_ms: i.end_ms };
  const n = s.hourly.filter(
    (d) => R(d.uv_index) && pe(d.epoch_ms, e) === r
  );
  if (n.length === 0 || !(J(n[0].epoch_ms, e) <= 7 && J(n[n.length - 1].epoch_ms, e) >= 18)) return null;
  const a = n.filter((d) => d.uv_index >= Ms);
  return a.length === 0 ? { start_ms: null, end_ms: null } : { start_ms: a[0].epoch_ms, end_ms: a[a.length - 1].epoch_ms + Cs };
}
function Ts(s, t) {
  if (!s) return "--";
  const { start_ms: e, end_ms: r } = s;
  return e === null && r === null ? "Not needed" : e !== null && r !== null ? `${gt(e, t)}–${gt(r, t)}` : e !== null ? `From ${gt(e, t)}` : `Until ${gt(r, t)}`;
}
function Ps(s, t, e, r, i = {}) {
  var d;
  const n = (l) => e ? (r == null ? void 0 : r[l]) ?? null : null, o = ((d = Yt.find((l) => l.id === s)) == null ? void 0 : d.label) ?? s, a = (l) => R(l) ? `${Math.round(l)}°C` : "--°C", c = (l) => R(l) ? `${Math.round(l)} km/h` : "-- km/h";
  switch (s) {
    case "wind": {
      const l = n("wind_speed_kmh") ?? t.wind_speed_kmh, h = n("wind_direction") ?? t.wind_direction ?? "", u = R(l) && l <= 0.4 && !h ? "Calm" : `${h ? `${h} ` : ""}${c(l)}`;
      return { id: s, label: o, value: u };
    }
    case "wind_gust":
      return {
        id: s,
        label: o,
        value: c(n("wind_gust_kmh") ?? t.wind_gust_kmh)
      };
    case "humidity": {
      const l = n("humidity") ?? t.humidity;
      return { id: s, label: o, value: R(l) ? `${Math.round(l)}%` : "--%" };
    }
    case "dew_point":
      return {
        id: s,
        label: o,
        value: a(n("dew_point") ?? t.dew_point)
      };
    case "feels_like":
      return {
        id: s,
        label: o,
        value: a(n("feels_like") ?? t.feels_like)
      };
    case "uv": {
      const l = t.uv_index;
      return {
        id: s,
        label: o,
        value: R(l) ? `${Math.round(l)} ${As(l)}` : "--"
      };
    }
    case "uv_time":
      return { id: s, label: o, value: Ts(i.uvTimes, i.timeZone) };
    case "rain_amount": {
      const l = t.rain_min_mm, h = t.rain_max_mm;
      let u = "-- mm";
      return R(l) && R(h) && h > l ? u = `${l}–${h} mm` : R(h) ? u = `${h} mm` : R(l) && (u = `${l} mm`), { id: s, label: o, value: u };
    }
  }
}
function Ns({
  point: s,
  isFirstHour: t,
  currentObs: e,
  timeZone: r,
  metrics: i,
  uvTimes: n
}) {
  const o = t && (e == null ? void 0 : e.temperature) !== null && (e == null ? void 0 : e.temperature) !== void 0 ? e.temperature : s.temperature, a = Ee(
    s.icon_descriptor,
    s.condition,
    s.is_night
  ), c = o != null ? `${Math.round(o)}°` : "--°", d = `${Math.round(s.rain_chance)}%`, l = ws(s.epoch_ms, r);
  return y`
    <div
      class="wg-summary-panel ${i.length === 0 ? "wg-no-metrics" : ""}"
      role="region"
      aria-label="Selected hour forecast details"
      style="--wg-metric-count: ${Math.max(1, i.length)}"
    >
      <div class="wg-summary-left">
        <div class="wg-summary-icon">
          ${ds(a, 42)}
        </div>
        <div class="wg-summary-temp">${c}</div>
      </div>

      <div class="wg-summary-center">
        <div class="wg-summary-time">${l}</div>
        <div class="wg-summary-rain" title="Chance of precipitation">
          <span class="wg-droplet">${us(17)}</span>
          <span class="wg-summary-rain-val">${d}</span>
        </div>
      </div>

      ${i.length > 0 ? y`
            <div class="wg-summary-metrics">
              ${i.map((h) => {
    const { label: u, value: w } = Ps(h, s, t, e, {
      uvTimes: n,
      timeZone: r
    });
    return y`
                  <div class="wg-metric-row">
                    <span class="wg-metric-label">${u}</span>
                    <span class="wg-metric-value">${w}</span>
                  </div>
                `;
  })}
            </div>
          ` : $}
    </div>
  `;
}
const Ie = "Weather", j = [
  { slot: "background", label: "Background" },
  { slot: "daytime", label: "Daytime shading" },
  { slot: "temperature", label: "Temperature" },
  { slot: "rain", label: "Chance of rain" },
  { slot: "wind", label: "Wind" },
  { slot: "text", label: "Text" }
], wt = [
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
], Ut = "dusk", Is = "daylight";
function Re(s, t) {
  const e = t === "light", r = e ? Is : Ut;
  return {
    paletteKey: e ? "light_palette" : "palette",
    colorsKey: e ? "light_colors" : "colors",
    paletteId: kt(e ? s.light_palette : s.palette, r).id,
    defaultId: r,
    overrides: e ? s.light_colors : s.colors
  };
}
function Rs(s, t) {
  const { paletteId: e, overrides: r } = Re(s, t);
  return De(e, r);
}
const Ds = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
function Zt(s) {
  if (typeof s != "string") return null;
  const t = s.trim();
  if (!Ds.test(t)) return null;
  if (t.length === 4) {
    const [, e, r, i] = t;
    return `#${e}${e}${r}${r}${i}${i}`.toLowerCase();
  }
  return t.toLowerCase();
}
function kt(s, t = Ut) {
  return wt.find((e) => e.id === s) ?? wt.find((e) => e.id === t) ?? wt.find((e) => e.id === Ut);
}
function De(s, t) {
  const e = { ...kt(s).colors };
  for (const { slot: r } of j) {
    const i = Zt(t == null ? void 0 : t[r]);
    i && (e[r] = i);
  }
  return e;
}
function me(s, t) {
  const e = kt(s).colors, r = {};
  for (const { slot: i } of j) {
    const n = Zt(t == null ? void 0 : t[i]);
    n && n !== e[i] && (r[i] = n);
  }
  return r;
}
function Q(s) {
  const t = parseInt(s.slice(1), 16);
  return [t >> 16 & 255, t >> 8 & 255, t & 255];
}
function Hs([s, t, e]) {
  return `#${[s, t, e].map((r) => Math.round(Math.max(0, Math.min(255, r))).toString(16).padStart(2, "0")).join("")}`;
}
function A(s, t, e) {
  const r = Q(s), i = Q(t);
  return Hs([0, 1, 2].map((n) => r[n] + (i[n] - r[n]) * e));
}
function E(s, t) {
  const [e, r, i] = Q(s);
  return `rgba(${e}, ${r}, ${i}, ${t})`;
}
function tt(s) {
  const [t, e, r] = Q(s).map((i) => {
    const n = i / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * t + 0.7152 * e + 0.0722 * r;
}
function yt(s, t) {
  const e = tt(s), r = tt(t);
  return (Math.max(e, r) + 0.05) / (Math.min(e, r) + 0.05);
}
function Ls(s) {
  const [t, e, r] = Q(s).map((c) => c / 255), i = Math.max(t, e, r), n = Math.min(t, e, r), o = i - n;
  if (o === 0) return 0;
  let a;
  return i === t ? a = (e - r) / o % 6 : i === e ? a = (r - t) / o + 2 : a = (t - e) / o + 4, (a * 60 + 360) % 360;
}
function Us(s) {
  const t = Q(s);
  return (Math.max(...t) - Math.min(...t)) / 255;
}
function Os(s) {
  const { background: t, daytime: e, temperature: r, rain: i, wind: n, text: o } = s, a = tt(t) < 0.4, c = a ? A(t, "#000000", 0.38) : A(t, o, 0.05), d = a ? A(t, "#000000", 0.45) : A(t, o, 0.07), l = A(t, e, 0.12);
  return {
    "--wg-bg": t,
    "--wg-panel": c,
    "--wg-legend-bg": d,
    "--wg-text": o,
    "--wg-text-muted": A(o, t, 0.4),
    "--wg-border": E(o, 0.12),
    "--wg-shadow": a ? "rgba(0, 0, 0, 0.36)" : "rgba(0, 0, 0, 0.12)",
    "--wg-temp": r,
    "--wg-rain": i,
    "--wg-wind": n,
    "--wg-rain-fill": E(A(i, t, 0.2), 0.48),
    "--wg-rain-stroke": E(i, 0.55),
    "--wg-wind-line": E(n, 0.25),
    "--wg-band-day-strip": e,
    "--wg-band-night-strip": A(t, e, 0.3),
    "--wg-band-day-plot": A(t, e, 0.45),
    "--wg-band-night-plot": l,
    "--wg-axis-fade": E(l, 0.92),
    "--wg-axis-fade-clear": E(l, 0),
    "--wg-grid": E(o, 0.075),
    "--wg-grid-vertical": E(o, 0.06),
    "--wg-strip-rule": E(A(o, e, 0.3), 0.36),
    "--wg-day-label": A(i, o, 0.5),
    "--wg-control-bg": E(c, 0.82),
    "--wg-control-border": E(o, 0.18),
    "--wg-icon-filter": a ? "none" : "drop-shadow(0 0 0.6px rgba(0, 0, 0, 0.55)) drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.18))",
    "--wg-skeleton-a": E(A(t, e, 0.4), 0.55),
    "--wg-skeleton-b": E(A(t, e, 0.8), 0.75)
  };
}
const we = 12, Ws = new Set(j.map((s) => s.slot)), zs = /#?\b[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi;
function He(s) {
  if (typeof s != "string") return null;
  const t = s.trim();
  return Zt(t.startsWith("#") ? t : `#${t}`);
}
function Le(s) {
  return typeof s == "string" ? `"${s}"` : JSON.stringify(s) ?? String(s);
}
function Ot(s) {
  const t = [];
  for (const e of s) {
    const r = He(e);
    if (!r) return { ok: !1, error: `${Le(e)} isn't a hex colour.` };
    t.push(r);
  }
  return Ue({ kind: "list", colors: t });
}
function Ue(s) {
  const t = s.kind === "list" ? s.colors.length : Object.keys(s.colors).length;
  return t === 0 ? { ok: !1, error: "No colours found." } : t > we ? { ok: !1, error: `Too many colours (${t}); paste ${we} or fewer.` } : { ok: !0, input: s };
}
function Fs(s) {
  if (Array.isArray(s)) return Ot(s);
  if (s === null || typeof s != "object") return null;
  const t = Object.entries(s);
  if (!(t.length > 0 && t.every(([i]) => Ws.has(i.toLowerCase())))) return Ot(t.map(([, i]) => i));
  const r = {};
  for (const [i, n] of t) {
    const o = He(n);
    if (!o) return { ok: !1, error: `${i}: ${Le(n)} isn't a hex colour.` };
    r[i.toLowerCase()] = o;
  }
  return Ue({ kind: "keyed", colors: r });
}
function Bs(s) {
  const t = s.trim();
  if (!t) return { ok: !1, error: "Paste some colours first." };
  if (t.startsWith("[") || t.startsWith("{"))
    try {
      const r = Fs(JSON.parse(t));
      if (r) return r;
    } catch {
    }
  const e = t.match(zs) ?? [];
  return e.length === 0 ? { ok: !1, error: "No hex colours found. Try c7eae4,a7e8bd,fcbcb8,efa7a7,ffd972." } : Ot(e);
}
function Oe(s) {
  return tt(s) < 0.4 ? A(s, "#ffffff", 0.92) : A(s, "#000000", 0.85);
}
function Xs(s) {
  return tt(s) < 0.4 ? A(s, "#ffffff", 0.14) : A(s, "#ffffff", 0.7);
}
const js = (s, t) => {
  const e = Math.abs(s - t) % 360;
  return e > 180 ? 360 - e : e;
}, Vs = {
  temperature: 30,
  rain: 205
}, _e = ["temperature", "rain", "wind"], Gs = 60, Ks = 180, Ys = 1e3, Zs = 3, qs = 30, Js = 2.2, Qs = 40, tr = 20;
function er(s, t, e) {
  const r = yt(t, e), i = qs * Math.max(0, Zs - r) - r;
  return s === "wind" ? Gs + i : Us(t) < 0.12 ? Ks + i : js(Ls(t), Vs[s]) + i;
}
function ye(s, t) {
  const e = { cost: 1 / 0, map: {} }, r = (i, n, o, a) => {
    if (o >= e.cost) return;
    if (i === _e.length) {
      e.cost = o, e.map = { ...a };
      return;
    }
    const c = _e[i];
    for (const d of s)
      n.has(d) || (n.add(d), a[c] = d, r(i + 1, n, o + er(c, d, t), a), delete a[c], n.delete(d));
    r(i + 1, n, o + Ys, a);
  };
  return r(0, /* @__PURE__ */ new Set(), 0, {}), e;
}
function sr(s, t) {
  const e = [...new Set(s)], r = (d) => {
    const l = e.filter((u) => u !== d).map((u) => yt(u, d)).sort((u, w) => w - u).slice(0, 3);
    return (l.length ? l.reduce((u, w) => u + w, 0) / l.length : 0) - tt(d) * 0.01;
  }, i = e.reduce((d, l) => r(l) > r(d) ? l : d), n = e.filter((d) => d !== i);
  let o = Xs(i), a = ye(n, i), c = a.cost + tr;
  for (const d of n) {
    const l = yt(d, i);
    if (l > Js) continue;
    const h = ye(
      n.filter((w) => w !== d),
      i
    ), u = h.cost + Qs * (l - 1);
    u < c && (c = u, o = d, a = h);
  }
  return {
    ...t,
    ...a.map,
    background: i,
    daytime: o,
    text: Oe(i)
  };
}
function rr(s, t) {
  if (s.kind === "keyed") {
    const e = { ...t, ...s.colors };
    return s.colors.background && !s.colors.text && (e.text = Oe(s.colors.background)), { colors: e, mode: "keyed", count: Object.keys(s.colors).length };
  }
  if (s.colors.length === j.length) {
    const e = { ...t };
    return j.forEach(({ slot: r }, i) => {
      e[r] = s.colors[i];
    }), { colors: e, mode: "ordered", count: s.colors.length };
  }
  return { colors: sr(s.colors, t), mode: "auto", count: s.colors.length };
}
function ir(s) {
  return j.map(({ slot: t }) => s[t]).join(", ");
}
let Wt;
const zt = /* @__PURE__ */ new Set();
function nr() {
  return Wt;
}
function It(s) {
  Wt !== s && (Wt = s, zt.forEach((t) => t()));
}
function or(s) {
  return zt.add(s), () => zt.delete(s);
}
const ar = /* @__PURE__ */ new Set(["temperature", "rain", "wind"]), lr = 1.5, cr = 4, dr = [
  "c7eae4,a7e8bd,fcbcb8,efa7a7,ffd972",
  "#c7eae4, #a7e8bd, #fcbcb8, #efa7a7, #ffd972",
  '["c7eae4","a7e8bd","fcbcb8","efa7a7","ffd972"]',
  '{"background":"c7eae4","rain":"efa7a7", ...}'
].join(`
`), xt = class xt extends F {
  constructor() {
    super(), this._config = {
      type: "custom:weather-graph-card"
    }, this._pasteText = "";
  }
  setConfig(t) {
    this._config = { ...t };
  }
  _update(t, e) {
    const r = { ...this._config };
    e === void 0 ? delete r[t] : r[t] = e, this._emit(r);
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
    const r = Lt(this._config.metrics);
    for (; r.length < Ht; ) r.push("");
    r[t] = e;
    const i = r.filter(
      (n, o) => n !== "" && r.indexOf(n) === o
    );
    this._update("metrics", i);
  }
  /** The mode being edited; starts on whichever mode Home Assistant is showing. */
  get _mode() {
    var e, r, i;
    return this._paletteMode ? this._paletteMode : ((r = (e = this.hass) == null ? void 0 : e.themes) == null ? void 0 : r.darkMode) ?? ((i = window.matchMedia) == null ? void 0 : i.call(window, "(prefers-color-scheme: dark)").matches) ?? !0 ? "dark" : "light";
  }
  get _selection() {
    return Re(this._config, this._mode);
  }
  _resolvedColors() {
    const { paletteId: t, overrides: e } = this._selection;
    return De(t, e);
  }
  connectedCallback() {
    super.connectedCallback(), this._paletteMode && It(this._paletteMode);
  }
  disconnectedCallback() {
    It(void 0), super.disconnectedCallback();
  }
  _setMode(t) {
    this._paletteMode = t, It(t), this._tapSlot = void 0, this._pasteNote = void 0;
  }
  _setPalette(t) {
    const { paletteKey: e, colorsKey: r } = this._selection, i = { ...this._config, [e]: t };
    delete i[r], this._emit(i);
  }
  _setColor(t, e) {
    this._applyColors({ ...this._resolvedColors(), [t]: e });
  }
  _applyColors(t) {
    const { paletteId: e, colorsKey: r } = this._selection, i = me(e, t);
    this._update(r, Object.keys(i).length > 0 ? i : void 0);
  }
  _applyPaste() {
    const t = Bs(this._pasteText);
    if (!t.ok) {
      this._pasteNote = { kind: "error", text: t.error };
      return;
    }
    const e = this._resolvedColors(), { colors: r, mode: i, count: n } = rr(t.input, e);
    this._applyColors(r), this._pasteText = "";
    const o = n === 1 ? "colour" : "colours", a = i === "keyed" ? `Applied ${n} ${o} to the named slots.` : i === "ordered" ? "Applied 6 colours in slot order." : `${n} ${o} auto-assigned. Drag swatches to rearrange.`;
    this._pasteNote = { kind: "success", text: a };
  }
  async _copyCurrent() {
    var e, r;
    const t = ir(this._resolvedColors());
    try {
      await navigator.clipboard.writeText(t), this._pasteNote = { kind: "success", text: "Current palette copied as CSV." };
    } catch {
      this._pasteText = t, this._pasteNote = { kind: "success", text: "Current palette placed in the box to copy." }, await this.updateComplete, (r = (e = this.shadowRoot) == null ? void 0 : e.querySelector("#wg-paste")) == null || r.select();
    }
  }
  _swapColors(t, e) {
    if (t === e) return;
    const r = this._resolvedColors();
    this._applyColors({ ...r, [t]: r[e], [e]: r[t] });
  }
  _slotAt(t, e) {
    var n;
    const r = (n = this.shadowRoot) == null ? void 0 : n.elementFromPoint(t, e), i = r == null ? void 0 : r.closest(".swatch[data-slot]");
    return i == null ? void 0 : i.dataset.slot;
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
    const r = t.clientX - e.startX, i = t.clientY - e.startY, n = e.moved || Math.hypot(r, i) > cr;
    if (!n) return;
    const o = this._slotAt(t.clientX, t.clientY);
    this._drag = { ...e, dx: r, dy: i, moved: n, over: o !== e.slot ? o : void 0 }, this._tapSlot && (this._tapSlot = void 0);
  }
  _onGripUp(t) {
    const e = this._drag;
    !e || e.pointerId !== t.pointerId || (this._drag = void 0, e.moved ? e.over && this._swapColors(e.slot, e.over) : this._tapGrip(e.slot));
  }
  _renderSwatch(t, e, r, i) {
    const n = this._drag, o = (n == null ? void 0 : n.slot) === t && n.moved, a = ar.has(t) && yt(r[t], r.background) < lr, c = [
      "swatch",
      o ? "dragging" : "",
      (n == null ? void 0 : n.over) === t ? "drop-target" : "",
      this._tapSlot === t ? "selected" : ""
    ].filter(Boolean).join(" "), d = this._tapSlot && this._tapSlot !== t;
    return y`
      <div
        class=${c}
        data-slot=${t}
        style=${o ? `--drag-x: ${n.dx}px; --drag-y: ${n.dy}px` : ""}
      >
        <button
          type="button"
          class="grip"
          aria-label=${d ? `Swap with ${e}` : `Move ${e} colour`}
          aria-pressed=${this._tapSlot === t ? "true" : "false"}
          title="Drag onto another colour to swap, or tap two handles"
          @pointerdown=${(l) => this._onGripDown(l, t)}
          @pointermove=${(l) => this._onGripMove(l)}
          @pointerup=${(l) => this._onGripUp(l)}
          @pointercancel=${() => this._drag = void 0}
          @click=${(l) => {
      l.detail === 0 && this._tapGrip(t);
    }}
          @keydown=${(l) => {
      l.key === "Escape" && (this._tapSlot = void 0);
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
          .value=${r[t]}
          @input=${(l) => this._setColor(t, l.target.value)}
        />
        <label class="swatch-text" for="wg-color-${t}">
          <span>${e}</span>
          <span class="swatch-hex ${i[t] ? "custom" : ""}">
            ${r[t]}${i[t] ? " (custom)" : ""}
          </span>
          ${a ? y`<span class="low-contrast" title="Hard to see against the background">
                low contrast
              </span>` : null}
        </label>
      </div>
    `;
  }
  _renderPasteBox() {
    var e, r, i;
    const t = ((e = this._pasteNote) == null ? void 0 : e.kind) === "error";
    return y`
      <div class="paste-box">
        <label for="wg-paste">Paste a Palette</label>
        <textarea
          id="wg-paste"
          spellcheck="false"
          aria-invalid=${t ? "true" : "false"}
          aria-describedby="wg-paste-note"
          placeholder=${dr}
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
          <span id="wg-paste-note" class="paste-note ${((r = this._pasteNote) == null ? void 0 : r.kind) ?? ""}" role="status">
            ${((i = this._pasteNote) == null ? void 0 : i.text) ?? ""}
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
    const t = Lt(this._config.metrics);
    return y`
      <div class="field">
        <label>Summary Fields</label>
        <div class="row-3">
          ${Array.from({ length: Ht }, (e, r) => {
      const i = r < t.length ? t[r] : "";
      return y`
              <select
                aria-label="Summary field ${r + 1}"
                .value=${i}
                @change=${(n) => this._setMetric(r, n.target.value)}
              >
                <option value="" ?selected=${i === ""}>None</option>
                ${Yt.map(
        (n) => y`
                    <option
                      value=${n.id}
                      ?selected=${i === n.id}
                      ?disabled=${i !== n.id && t.includes(n.id)}
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
    const { paletteId: t, defaultId: e, overrides: r, colorsKey: i } = this._selection, n = kt(t), o = me(t, r), a = this._resolvedColors(), c = Object.keys(o).length > 0, d = this._mode;
    return y`
      <div class="field">
        <div class="section-head">
          <label for="wg-palette">Colour Palette</label>
          <button
            type="button"
            class="revert-btn"
            ?disabled=${!c}
            @click=${() => this._update(i, void 0)}
          >
            Revert to ${n.name}
          </button>
        </div>
        <div class="mode-switch" role="group" aria-label="Palette to edit">
          ${["dark", "light"].map(
      (l) => y`
              <button
                type="button"
                class="mode-btn"
                data-mode=${l}
                aria-pressed=${l === d ? "true" : "false"}
                @click=${() => this._setMode(l)}
              >
                ${l === "dark" ? "Dark mode" : "Light mode"}
              </button>
            `
    )}
        </div>
        <select
          id="wg-palette"
          .value=${n.id}
          @change=${(l) => this._setPalette(l.target.value)}
        >
          ${wt.map(
      (l) => y`
              <option value=${l.id} ?selected=${l.id === n.id}>
                ${l.name}${l.id === e ? " (default)" : ""}
              </option>
            `
    )}
        </select>
        <div class="swatches">
          ${j.map(
      ({ slot: l, label: h }) => this._renderSwatch(l, h, a, o)
    )}
        </div>
        <span class="hint">
          The card uses the dark palette when Home Assistant is in dark mode (by default it follows
          your system) and the light palette otherwise. While editing, the preview shows the
          palette selected here. Pick a built-in palette, then adjust any
          colour. Drag the handles (or tap two) to swap colours. Changing palette clears custom
          colours.
        </span>
        ${this._renderPasteBox()}
      </div>
    `;
  }
  render() {
    var r;
    const t = this._config.show_title !== !1, e = Object.keys(((r = this.hass) == null ? void 0 : r.states) ?? {}).filter((i) => i.startsWith("weather.")).sort((i, n) => {
      const o = i.endsWith("_hourly") ? -1 : 0, a = n.endsWith("_hourly") ? -1 : 0;
      return o !== a ? o - a : i.localeCompare(n);
    });
    return y`
      <div class="editor-grid">
        <div class="field">
          <label for="wg-entity">Weather Entity (BOM Hourly preferred)</label>
          <select
            id="wg-entity"
            .value=${this._config.entity ?? ""}
            @change=${(i) => this._update("entity", i.target.value || void 0)}
          >
            <option value="">Auto-detect BOM / Hourly Weather</option>
            ${e.map((i) => {
      var o, a, c;
      const n = ((c = (a = (o = this.hass) == null ? void 0 : o.states[i]) == null ? void 0 : a.attributes) == null ? void 0 : c.friendly_name) || i;
      return y`
                <option value=${i} ?selected=${this._config.entity === i}>
                  ${n} (${i})
                </option>
              `;
    })}
          </select>
          <span class="hint">
            Selecting a daily BOM entity (e.g. weather.sydney) automatically resolves to weather.sydney_hourly.
          </span>
        </div>

        <div class="field">
          <label for="wg-title">Header</label>
          <div class="title-row">
            <label class="toggle-item">
              <input
                type="checkbox"
                id="wg-show-title"
                .checked=${t}
                @change=${(i) => this._update(
      "show_title",
      i.target.checked ? void 0 : !1
    )}
              />
              Title
            </label>
            <input
              id="wg-title"
              type="text"
              aria-label="Title text"
              placeholder=${Ie}
              ?disabled=${!t}
              .value=${this._config.title ?? ""}
              @input=${(i) => this._update("title", i.target.value || void 0)}
            />
          </div>
          <label class="toggle-item">
            <input
              type="checkbox"
              id="wg-show-location"
              .checked=${!!this._config.show_location}
              @change=${(i) => this._update("show_location", i.target.checked)}
            />
            Location subtitle
          </label>
          <span class="hint">Turn both off to drop the header row and make the card shorter.</span>
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
              @change=${(i) => this._update(
      "hours_to_show",
      Math.max(12, Math.min(72, Number(i.target.value) || 48))
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
              @change=${(i) => this._update(
      "visible_hours",
      Math.max(12, Math.min(48, Number(i.target.value) || 24))
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
                @change=${(i) => this._update("show_temperature", i.target.checked)}
              />
              Temperature
            </label>
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${this._config.show_rain !== !1}
                @change=${(i) => this._update("show_rain", i.target.checked)}
              />
              Chance Rain
            </label>
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${this._config.show_wind !== !1}
                @change=${(i) => this._update("show_wind", i.target.checked)}
              />
              Wind
            </label>
          </div>
        </div>

        ${this._renderMetricsSection()} ${this._renderColorsSection()}
      </div>
    `;
  }
};
xt.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _pasteText: { state: !0 },
  _pasteNote: { state: !0 },
  _drag: { state: !0 },
  _tapSlot: { state: !0 },
  _paletteMode: { state: !0 }
}, xt.styles = Vt`
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

    .title-row {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 12px;
    }

    .title-row input[type="text"]:disabled {
      opacity: 0.5;
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

    .mode-switch {
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 3px;
      gap: 3px;
      border-radius: 10px;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
    }

    .mode-btn {
      appearance: none;
      border: 0;
      border-radius: 7px;
      padding: 6px 10px;
      background: transparent;
      color: var(--secondary-text-color, #94a3b8);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .mode-btn[aria-pressed="true"] {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #ffffff);
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
let Ft = xt;
customElements.get("weather-graph-card-editor") || customElements.define(
  "weather-graph-card-editor",
  Ft
);
const hr = "1.4.0", bt = class bt extends F {
  constructor() {
    super(), this._onSchemeChange = (t) => {
      this._prefersDark = t.matches;
    }, this._subscribedKey = "", this._subscribing = !1, this._config = {
      type: "custom:weather-graph-card",
      hours_to_show: 48,
      visible_hours: 24,
      show_temperature: !0,
      show_rain: !0,
      show_wind: !0
    }, this._payload = null, this._selectedIndex = 0, this._showTemperature = !0, this._showRain = !0, this._showWind = !0, this._loading = !0, this._error = null, this._prefersDark = !0;
  }
  static getConfigElement() {
    return document.createElement("weather-graph-card-editor");
  }
  static getStubConfig(t) {
    return {
      type: "custom:weather-graph-card",
      entity: ge(t) ?? void 0,
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
      hours_to_show: 48,
      visible_hours: 24,
      show_temperature: !0,
      show_rain: !0,
      show_wind: !0,
      ...t
    }, this._showTemperature = this._config.show_temperature !== !1, this._showRain = this._config.show_rain !== !1, this._showWind = this._config.show_wind !== !1, this.hass && this._ensureSubscription();
  }
  getCardSize() {
    return this._config.show_title !== !1 || !!this._config.show_location ? 7 : 6;
  }
  connectedCallback() {
    var t, e, r;
    super.connectedCallback(), this._darkQuery = (t = window.matchMedia) == null ? void 0 : t.call(window, "(prefers-color-scheme: dark)"), this._darkQuery && (this._prefersDark = this._darkQuery.matches, (r = (e = this._darkQuery).addEventListener) == null || r.call(e, "change", this._onSchemeChange)), this._unsubPreviewMode = or(() => this.requestUpdate()), this.samplePayload ? (this._payload = this.samplePayload, this._loading = !1) : this.hass && this._ensureSubscription();
  }
  disconnectedCallback() {
    var t, e, r;
    (e = (t = this._darkQuery) == null ? void 0 : t.removeEventListener) == null || e.call(t, "change", this._onSchemeChange), this._darkQuery = void 0, (r = this._unsubPreviewMode) == null || r.call(this), this._unsubPreviewMode = void 0, this._teardownSubscription(), super.disconnectedCallback();
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
    var i;
    if (!((i = this.hass) != null && i.connection) || this._subscribing) return;
    const t = ge(
      this.hass,
      this._config.entity
    ), e = Math.max(12, Math.min(72, this._config.hours_to_show ?? 48)), r = `${t ?? ""}::${this._config.bom_entry_id ?? ""}::${e}`;
    if (!(r === this._subscribedKey && this._unsubForecast)) {
      this._teardownSubscription(), this._subscribedKey = r, this._subscribing = !0, this._loading = !this._payload, this._error = null;
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
              const o = $s(
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
    var l;
    if (!this.hass) return t;
    const e = (h) => {
      var p, x;
      if (!h) return null;
      const u = (x = (p = this.hass) == null ? void 0 : p.states[h]) == null ? void 0 : x.state;
      if (u === void 0) return null;
      const w = Number(u);
      return Number.isFinite(w) ? w : null;
    }, r = e(this._config.temperature_entity), i = e(this._config.humidity_entity), n = e(this._config.wind_speed_entity), o = this._config.wind_direction_entity ? (l = this.hass.states[this._config.wind_direction_entity]) == null ? void 0 : l.state : void 0, a = o ? Kt(o) : { cardinal: null, degrees: null };
    if (r === null && i === null && n === null && !a.cardinal)
      return t;
    const c = r ?? (t == null ? void 0 : t.temperature) ?? null, d = i ?? (t == null ? void 0 : t.humidity) ?? null;
    return {
      temperature: c,
      feels_like: (t == null ? void 0 : t.feels_like) ?? null,
      humidity: d,
      dew_point: Pe(c, d) ?? (t == null ? void 0 : t.dew_point) ?? null,
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
    var u, w, p, x, k, S, m, T, M, C, V, I;
    const t = this._config.show_title !== !1, e = ((u = this._config.title) == null ? void 0 : u.trim()) || Ie, r = ((w = this._payload) == null ? void 0 : w.hourly) ?? [], i = r[Math.max(0, Math.min(r.length - 1, this._selectedIndex))] ?? null, n = this._config.show_location && ((x = (p = this._payload) == null ? void 0 : p.location) != null && x.name) ? `${this._payload.location.name}${this._payload.location.state ? `, ${this._payload.location.state}` : ""}` : "", o = t || !!n, a = nr(), c = a ? a === "dark" : ((S = (k = this.hass) == null ? void 0 : k.themes) == null ? void 0 : S.darkMode) ?? this._prefersDark, d = Os(Rs(this._config, c ? "dark" : "light")), l = ((T = (m = this._payload) == null ? void 0 : m.location) == null ? void 0 : T.timezone) ?? ((C = (M = this.hass) == null ? void 0 : M.config) == null ? void 0 : C.time_zone) ?? "Australia/Sydney", h = Lt(this._config.metrics);
    return y`
      <div class="wg-card ${o ? "" : "wg-no-header"}" style=${cs(d)}>
        ${o ? y`
              <div class="wg-card-header">
                ${t ? y`<h2 class="wg-card-title">${e}</h2>` : $}
                ${n ? y`<span class="wg-card-subtitle">${n}</span>` : $}
              </div>
            ` : $}

        ${this._loading ? y`<div class="wg-skeleton" aria-label="Loading forecast"></div>` : this._error ? y`<div class="wg-status-box">${this._error}</div>` : i ? y`
              <div class="wg-card-body">
                ${Ns({
      point: i,
      isFirstHour: this._selectedIndex === 0,
      currentObs: this._resolveCurrentObservation(
        ((V = this._payload) == null ? void 0 : V.current) ?? null
      ),
      timeZone: l,
      metrics: h,
      uvTimes: h.includes("uv_time") ? Es(this._payload, i.epoch_ms, l) : null
    })}

                <wg-forecast-chart
                  .hours=${r}
                  .sunWindows=${((I = this._payload) == null ? void 0 : I.sun_windows) ?? []}
                  .timeZone=${l}
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
                    ${ps(15)}
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
bt.properties = {
  hass: { attribute: !1 },
  samplePayload: { attribute: !1 },
  _config: { state: !0 },
  _payload: { state: !0 },
  _selectedIndex: { state: !0 },
  _showTemperature: { state: !0 },
  _showRain: { state: !0 },
  _showWind: { state: !0 },
  _loading: { state: !0 },
  _error: { state: !0 },
  _prefersDark: { state: !0 }
}, bt.styles = Vt`
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

    .wg-no-header .wg-summary-panel,
    .wg-no-header .wg-skeleton {
      margin-top: 14px;
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
let Bt = bt;
customElements.get("weather-graph-card") || customElements.define("weather-graph-card", Bt);
window.customCards = window.customCards || [];
window.customCards.some((s) => s.type === "weather-graph-card") || window.customCards.push({
  type: "weather-graph-card",
  name: "Weather Graph",
  description: "Interactive 48-hour temperature, rain probability, and directional wind graph powered by Bureau of Meteorology (BOM) or Home Assistant weather.",
  preview: !0
});
console.info(
  `%c WEATHER-GRAPH-CARD %c v${hr} `,
  "background:#1b1a2e;color:#ff8f6b;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;",
  "background:#59c3c3;color:#1b1a2e;font-weight:700;padding:2px 6px;border-radius:0 4px 4px 0;"
);
export {
  Bt as WeatherGraphCard
};
