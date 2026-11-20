/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const it = globalThis, bt = it.ShadowRoot && (it.ShadyCSS === void 0 || it.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, vt = Symbol(), Nt = /* @__PURE__ */ new WeakMap();
let Vt = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== vt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (bt && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Nt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Nt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const le = (s) => new Vt(typeof s == "string" ? s : s + "", void 0, vt), St = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, n, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + s[r + 1], s[0]);
  return new Vt(e, s, vt);
}, ce = (s, t) => {
  if (bt) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), n = it.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = e.cssText, s.appendChild(i);
  }
}, Pt = bt ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return le(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: he, defineProperty: de, getOwnPropertyDescriptor: ue, getOwnPropertyNames: pe, getOwnPropertySymbols: ge, getPrototypeOf: fe } = Object, T = globalThis, It = T.trustedTypes, me = It ? It.emptyScript : "", ht = T.reactiveElementPolyfillSupport, G = (s, t) => s, wt = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? me : null;
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
} }, Ot = (s, t) => !he(s, t), Tt = { attribute: !0, type: String, converter: wt, reflect: !1, useDefault: !1, hasChanged: Ot };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), T.litPropertyMetadata ?? (T.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let B = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Tt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), n = this.getPropertyDescriptor(t, i, e);
      n !== void 0 && de(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: n, set: r } = ue(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: n, set(o) {
      const a = n == null ? void 0 : n.call(this);
      r == null || r.call(this, o), this.requestUpdate(t, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Tt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(G("elementProperties"))) return;
    const t = fe(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(G("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(G("properties"))) {
      const e = this.properties, i = [...pe(e), ...ge(e)];
      for (const n of i) this.createProperty(n, e[n]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, n] of e) this.elementProperties.set(i, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const n = this._$Eu(e, i);
      n !== void 0 && this._$Eh.set(n, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const n of i) e.unshift(Pt(n));
    } else t !== void 0 && e.push(Pt(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ce(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) == null ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) == null ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    var r;
    const i = this.constructor.elementProperties.get(t), n = this.constructor._$Eu(t, i);
    if (n !== void 0 && i.reflect === !0) {
      const o = (((r = i.converter) == null ? void 0 : r.toAttribute) !== void 0 ? i.converter : wt).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var r, o;
    const i = this.constructor, n = i._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const a = i.getPropertyOptions(n), l = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((r = a.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? a.converter : wt;
      this._$Em = n;
      const h = l.fromAttribute(e, a.type);
      this[n] = h ?? ((o = this._$Ej) == null ? void 0 : o.get(n)) ?? h, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, n = !1, r) {
    var o;
    if (t !== void 0) {
      const a = this.constructor;
      if (n === !1 && (r = this[t]), i ?? (i = a.getPropertyOptions(t)), !((i.hasChanged ?? Ot)(r, e) || i.useDefault && i.reflect && r === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(a._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: n, wrapped: r }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), n === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [r, o] of n) {
        const { wrapped: a } = o, l = this[r];
        a !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, o, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (i = this._$EO) == null || i.forEach((n) => {
        var r;
        return (r = n.hostUpdate) == null ? void 0 : r.call(n);
      }), this.update(e)) : this._$EM();
    } catch (n) {
      throw t = !1, this._$EM(), n;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((i) => {
      var n;
      return (n = i.hostUpdated) == null ? void 0 : n.call(i);
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
B.elementStyles = [], B.shadowRootOptions = { mode: "open" }, B[G("elementProperties")] = /* @__PURE__ */ new Map(), B[G("finalized")] = /* @__PURE__ */ new Map(), ht == null || ht({ ReactiveElement: B }), (T.reactiveElementVersions ?? (T.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis, Ht = (s) => s, nt = K.trustedTypes, Rt = nt ? nt.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Gt = "$lit$", I = `lit$${Math.random().toFixed(9).slice(2)}$`, Kt = "?" + I, _e = `<${Kt}>`, W = document, q = () => W.createComment(""), J = (s) => s === null || typeof s != "object" && typeof s != "function", At = Array.isArray, we = (s) => At(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", dt = `[ 	
\f\r]`, j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Dt = /-->/g, Ut = />/g, H = RegExp(`>|${dt}(?:([^\\s"'>=/]+)(${dt}*=${dt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Wt = /'/g, Lt = /"/g, qt = /^(?:script|style|textarea|title)$/i, Jt = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), A = Jt(1), w = Jt(2), F = Symbol.for("lit-noChange"), x = Symbol.for("lit-nothing"), zt = /* @__PURE__ */ new WeakMap(), R = W.createTreeWalker(W, 129);
function Yt(s, t) {
  if (!At(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Rt !== void 0 ? Rt.createHTML(t) : t;
}
const ye = (s, t) => {
  const e = s.length - 1, i = [];
  let n, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = j;
  for (let a = 0; a < e; a++) {
    const l = s[a];
    let h, u, c = -1, f = 0;
    for (; f < l.length && (o.lastIndex = f, u = o.exec(l), u !== null); ) f = o.lastIndex, o === j ? u[1] === "!--" ? o = Dt : u[1] !== void 0 ? o = Ut : u[2] !== void 0 ? (qt.test(u[2]) && (n = RegExp("</" + u[2], "g")), o = H) : u[3] !== void 0 && (o = H) : o === H ? u[0] === ">" ? (o = n ?? j, c = -1) : u[1] === void 0 ? c = -2 : (c = o.lastIndex - u[2].length, h = u[1], o = u[3] === void 0 ? H : u[3] === '"' ? Lt : Wt) : o === Lt || o === Wt ? o = H : o === Dt || o === Ut ? o = j : (o = H, n = void 0);
    const _ = o === H && s[a + 1].startsWith("/>") ? " " : "";
    r += o === j ? l + _e : c >= 0 ? (i.push(h), l.slice(0, c) + Gt + l.slice(c) + I + _) : l + I + (c === -2 ? a : _);
  }
  return [Yt(s, r + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Y {
  constructor({ strings: t, _$litType$: e }, i) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, l = this.parts, [h, u] = ye(t, e);
    if (this.el = Y.createElement(h, i), R.currentNode = this.el.content, e === 2 || e === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (n = R.nextNode()) !== null && l.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const c of n.getAttributeNames()) if (c.endsWith(Gt)) {
          const f = u[o++], _ = n.getAttribute(c).split(I), p = /([.?@])?(.*)/.exec(f);
          l.push({ type: 1, index: r, name: p[2], strings: _, ctor: p[1] === "." ? xe : p[1] === "?" ? be : p[1] === "@" ? ve : ct }), n.removeAttribute(c);
        } else c.startsWith(I) && (l.push({ type: 6, index: r }), n.removeAttribute(c));
        if (qt.test(n.tagName)) {
          const c = n.textContent.split(I), f = c.length - 1;
          if (f > 0) {
            n.textContent = nt ? nt.emptyScript : "";
            for (let _ = 0; _ < f; _++) n.append(c[_], q()), R.nextNode(), l.push({ type: 2, index: ++r });
            n.append(c[f], q());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Kt) l.push({ type: 2, index: r });
      else {
        let c = -1;
        for (; (c = n.data.indexOf(I, c + 1)) !== -1; ) l.push({ type: 7, index: r }), c += I.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const i = W.createElement("template");
    return i.innerHTML = t, i;
  }
}
function X(s, t, e = s, i) {
  var o, a;
  if (t === F) return t;
  let n = i !== void 0 ? (o = e._$Co) == null ? void 0 : o[i] : e._$Cl;
  const r = J(t) ? void 0 : t._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== r && ((a = n == null ? void 0 : n._$AO) == null || a.call(n, !1), r === void 0 ? n = void 0 : (n = new r(s), n._$AT(s, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = n : e._$Cl = n), n !== void 0 && (t = X(s, n._$AS(s, t.values), n, i)), t;
}
class $e {
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
    const { el: { content: e }, parts: i } = this._$AD, n = ((t == null ? void 0 : t.creationScope) ?? W).importNode(e, !0);
    R.currentNode = n;
    let r = R.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let h;
        l.type === 2 ? h = new Q(r, r.nextSibling, this, t) : l.type === 1 ? h = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (h = new Se(r, this, t)), this._$AV.push(h), l = i[++a];
      }
      o !== (l == null ? void 0 : l.index) && (r = R.nextNode(), o++);
    }
    return R.currentNode = W, n;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class Q {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, i, n) {
    this.type = 2, this._$AH = x, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = n, this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0;
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
    t = X(this, t, e), J(t) ? t === x || t == null || t === "" ? (this._$AH !== x && this._$AR(), this._$AH = x) : t !== this._$AH && t !== F && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : we(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== x && J(this._$AH) ? this._$AA.nextSibling.data = t : this.T(W.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var r;
    const { values: e, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Y.createElement(Yt(i.h, i.h[0]), this.options)), i);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === n) this._$AH.p(e);
    else {
      const o = new $e(n, this), a = o.u(this.options);
      o.p(e), this.T(a), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = zt.get(t.strings);
    return e === void 0 && zt.set(t.strings, e = new Y(t)), e;
  }
  k(t) {
    At(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, n = 0;
    for (const r of t) n === e.length ? e.push(i = new Q(this.O(q()), this.O(q()), this, this.options)) : i = e[n], i._$AI(r), n++;
    n < e.length && (this._$AR(i && i._$AB.nextSibling, n), e.length = n);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, e); t !== this._$AB; ) {
      const n = Ht(t).nextSibling;
      Ht(t).remove(), t = n;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class ct {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, n, r) {
    this.type = 1, this._$AH = x, this._$AN = void 0, this.element = t, this.name = e, this._$AM = n, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = x;
  }
  _$AI(t, e = this, i, n) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = X(this, t, e, 0), o = !J(t) || t !== this._$AH && t !== F, o && (this._$AH = t);
    else {
      const a = t;
      let l, h;
      for (t = r[0], l = 0; l < r.length - 1; l++) h = X(this, a[i + l], e, l), h === F && (h = this._$AH[l]), o || (o = !J(h) || h !== this._$AH[l]), h === x ? t = x : t !== x && (t += (h ?? "") + r[l + 1]), this._$AH[l] = h;
    }
    o && !n && this.j(t);
  }
  j(t) {
    t === x ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class xe extends ct {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === x ? void 0 : t;
  }
}
class be extends ct {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== x);
  }
}
class ve extends ct {
  constructor(t, e, i, n, r) {
    super(t, e, i, n, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = X(this, t, e, 0) ?? x) === F) return;
    const i = this._$AH, n = t === x && i !== x || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== x && (i === x || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Se {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    X(this, t);
  }
}
const ut = K.litHtmlPolyfillSupport;
ut == null || ut(Y, Q), (K.litHtmlVersions ?? (K.litHtmlVersions = [])).push("3.3.3");
const Ae = (s, t, e) => {
  const i = (e == null ? void 0 : e.renderBefore) ?? t;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = (e == null ? void 0 : e.renderBefore) ?? null;
    i._$litPart$ = n = new Q(t.insertBefore(q(), r), r, void 0, e ?? {});
  }
  return n._$AI(s), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const D = globalThis;
class U extends B {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ae(e, this.renderRoot, this.renderOptions);
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
    return F;
  }
}
var Zt;
U._$litElement$ = !0, U.finalized = !0, (Zt = D.litElementHydrateSupport) == null || Zt.call(D, { LitElement: U });
const pt = D.litElementPolyfillSupport;
pt == null || pt({ LitElement: U });
(D.litElementVersions ?? (D.litElementVersions = [])).push("4.2.2");
function Qt(s, t, e) {
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
const Z = (s = 16, t = 15, e = 7.2) => w`
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
`, gt = (s = 0, t = 0) => w`
  <path
    transform="translate(${s}, ${t})"
    d="M18.2 7.2A8.3 8.3 0 0 0 10.6 18.8 8.4 8.4 0 0 0 22.4 20.1 6.9 6.9 0 0 1 18.2 7.2Z"
    fill="#9eb1c4"
  />
`, k = (s = 0, t = 0) => w`
  <path
    transform="translate(${s}, ${t})"
    d="M13.2 26.8H29.4A5.4 5.4 0 0 0 30.1 16.1 7.6 7.6 0 0 0 15.6 14.3 6.2 6.2 0 0 0 13.2 26.8Z"
    fill="#f1f5f9"
  />
`, L = (s = 0, t = 0) => w`
  <path
    transform="translate(${s}, ${t})"
    d="M9.5 23.6H23.2A4.6 4.6 0 0 0 23.8 14.5 6.4 6.4 0 0 0 11.5 13 5.2 5.2 0 0 0 9.5 23.6Z"
    fill="#94a8be"
  />
`, ft = (s = 3, t = 28.5) => s === 2 ? w`
      <g fill="#4cc9f0">
        <circle cx="18.5" cy=${t + 1.5} r="1.45" />
        <circle cx="24.5" cy=${t + 3.2} r="1.45" />
      </g>
    ` : s === 4 ? w`
      <g stroke="#4cc9f0" stroke-width="2.1" stroke-linecap="round">
        <line x1="14.5" y1=${t} x2="12.8" y2=${t + 5} />
        <line x1="19.5" y1=${t + 0.8} x2="17.8" y2=${t + 5.8} />
        <line x1="24.5" y1=${t} x2="22.8" y2=${t + 5} />
        <line x1="29.2" y1=${t + 0.8} x2="27.5" y2=${t + 5.8} />
      </g>
    ` : w`
    <g fill="#4cc9f0">
      <circle cx="16.5" cy=${t + 1.2} r="1.4" />
      <circle cx="21.5" cy=${t + 3.6} r="1.4" />
      <circle cx="26.2" cy=${t + 1.4} r="1.4" />
    </g>
  `, Bt = () => w`
  <polygon
    points="22.8,22.2 18.2,29.2 21.8,29.2 19.9,35.6 27.4,27.3 23.4,27.3"
    fill="#38bdf8"
    stroke="#0d1e33"
    stroke-width="0.6"
    stroke-linejoin="round"
  />
`;
function te(s) {
  switch (s) {
    case "sunny":
      return Z(20, 20, 8.2);
    case "clear-night":
      return w`
        <path
          d="M23.5 8.5A11.2 11.2 0 1 0 32.5 24.5 9.2 9.2 0 0 1 23.5 8.5Z"
          fill="#cbd5e1"
        />
      `;
    case "mostly-sunny":
      return w`
        <g>
          ${Z(15.5, 15.5, 6.8)}
          ${k(2, 2)}
        </g>
      `;
    case "partly-cloudy-day":
      return w`
        <g>
          ${Z(15, 15, 6.5)}
          ${L(5, 1)}
          ${k(1, 2.5)}
        </g>
      `;
    case "partly-cloudy-night":
      return w`
        <g>
          ${gt(-1, 0)}
          ${L(5, 2)}
          ${k(1, 3)}
        </g>
      `;
    case "cloudy":
      return w`
        <g>
          ${L(0, -1)}
          ${k(1, 3)}
        </g>
      `;
    case "light-shower-day":
      return w`
        <g>
          ${Z(14.5, 13.5, 5.8)}
          ${k(0, 0)}
          ${ft(3, 28)}
        </g>
      `;
    case "light-shower-night":
      return w`
        <g>
          ${gt(-2, -2)}
          ${L(4, -1)}
          ${k(0, 0.5)}
          ${ft(3, 28.5)}
        </g>
      `;
    case "rain":
    case "heavy-rain":
      return w`
        <g>
          ${L(0, -2.5)}
          ${k(1, 0)}
          ${ft(4, 28.2)}
        </g>
      `;
    case "storm-day":
      return w`
        <g>
          ${Z(14.5, 13.8, 6.1)}
          ${k(0.5, 0.5)}
          ${Bt()}
        </g>
      `;
    case "storm-night":
      return w`
        <g>
          ${gt(-2, -2)}
          ${L(3, -1.5)}
          ${k(0.5, 0.5)}
          ${Bt()}
        </g>
      `;
    case "fog":
      return w`
        <g>
          ${k(-1, -2)}
          <g stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round">
            <line x1="10" y1="28.5" x2="30" y2="28.5" />
            <line x1="12.5" y1="33" x2="27.5" y2="33" />
          </g>
        </g>
      `;
    case "wind":
      return w`
        <g fill="none" stroke="#e2e8f0" stroke-width="2.3" stroke-linecap="round">
          <path d="M7 16.5H25.5A3.5 3.5 0 1 0 22 13" />
          <path d="M5 22H29.5A3.8 3.8 0 1 1 25.8 25.8" />
          <path d="M9 27.5H20.5" />
        </g>
      `;
    case "snow":
      return w`
        <g>
          ${k(0, -1)}
          <g fill="#bae6fd">
            <circle cx="16" cy="30.5" r="1.8" />
            <circle cx="22" cy="33" r="1.8" />
            <circle cx="27.5" cy="30.5" r="1.8" />
          </g>
        </g>
      `;
    case "cyclone":
      return w`
        <g fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round">
          <circle cx="20" cy="20" r="5" />
          <path d="M20 15C26 15 30 10 31 7" />
          <path d="M20 25C14 25 10 30 9 33" />
        </g>
      `;
  }
}
function ke(s, t = 36) {
  return A`
    <svg
      width=${t}
      height=${t}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      ${te(s)}
    </svg>
  `;
}
function Ee(s, t, e, i = 32) {
  return w`
    <svg
      x=${t}
      y=${e}
      width=${i}
      height=${i}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      ${te(s)}
    </svg>
  `;
}
function Me(s = 18) {
  return A`
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
        fill="#4cc9f0"
      />
    </svg>
  `;
}
function Ce(s = 16) {
  return A`
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
const Ne = [
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
], Ft = {
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
function ee(s, t) {
  if (s == null || t === null || t === void 0 || !Number.isFinite(s) || !Number.isFinite(t) || t <= 0)
    return null;
  const e = Math.max(1, Math.min(100, t)), i = 17.27, n = 237.7, r = i * s / (n + s) + Math.log(e / 100), o = i - r;
  return Math.abs(o) < 1e-9 ? null : Math.round(n * r / o * 10) / 10;
}
function kt(s) {
  if (s == null)
    return { cardinal: null, degrees: null };
  if (typeof s == "number") {
    if (!Number.isFinite(s))
      return { cardinal: null, degrees: null };
    const t = (s % 360 + 360) % 360, e = Math.floor((t + 11.25) / 22.5) % 16;
    return {
      cardinal: Ne[e],
      degrees: Math.round(t * 10) / 10
    };
  }
  if (typeof s == "string") {
    const t = s.trim().toUpperCase();
    if (!t || t === "CALM" || t === "UNAVAILABLE" || t === "UNKNOWN")
      return { cardinal: null, degrees: null };
    if (t in Ft)
      return { cardinal: t, degrees: Ft[t] };
    const e = Number(t);
    if (Number.isFinite(e))
      return kt(e);
  }
  return { cardinal: null, degrees: null };
}
function Pe(s) {
  return s == null || !Number.isFinite(s) ? 0 : ((s + 180) % 360 + 360) % 360;
}
function Ie(s, t) {
  if (!s || typeof s != "string")
    return null;
  const e = s.trim();
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(e)) {
    const c = Date.parse(e);
    return Number.isFinite(c) ? c : null;
  }
  const n = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(e);
  if (!n) {
    const c = Date.parse(e);
    return Number.isFinite(c) ? c : null;
  }
  const r = Number(n[1]), o = Number(n[2]), a = Number(n[3]), l = Number(n[4]), h = Number(n[5]), u = Number(n[6] ?? "0");
  try {
    const c = Date.UTC(r, o - 1, a, l, h, u), _ = new Intl.DateTimeFormat("en-US", {
      timeZone: t,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date(c)), p = {};
    for (const S of _)
      S.type !== "literal" && (p[S.type] = Number(S.value));
    const v = Date.UTC(
      p.year,
      (p.month ?? 1) - 1,
      p.day ?? 1,
      p.hour ?? 0,
      p.minute ?? 0,
      p.second ?? 0
    ) - c;
    return c - v;
  } catch {
    return new Date(r, o - 1, a, l, h, u).getTime();
  }
}
function rt(s, t) {
  try {
    const i = new Intl.DateTimeFormat("en-US", {
      timeZone: t || void 0,
      hour: "numeric",
      hourCycle: "h23"
    }).formatToParts(new Date(s)).find((n) => n.type === "hour");
    return i ? Number(i.value) % 24 : new Date(s).getHours();
  } catch {
    return new Date(s).getHours();
  }
}
function Te(s, t) {
  var e, i, n;
  try {
    const r = {
      weekday: "short",
      hour: "numeric",
      hour12: !0,
      ...t ? { timeZone: t } : {}
    }, o = new Intl.DateTimeFormat("en-US", r).formatToParts(
      new Date(s)
    ), a = (((e = o.find((u) => u.type === "weekday")) == null ? void 0 : e.value) ?? "").toUpperCase(), l = ((i = o.find((u) => u.type === "hour")) == null ? void 0 : i.value) ?? "", h = (((n = o.find((u) => u.type === "dayPeriod")) == null ? void 0 : n.value) ?? "").toUpperCase();
    return `${a} ${l}${h}`.trim();
  } catch {
    const r = new Date(s), o = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], a = r.getHours(), l = a >= 12 ? "PM" : "AM", h = a % 12 || 12;
    return `${o[r.getDay()]} ${h}${l}`;
  }
}
function He(s, t) {
  const e = rt(s, t), i = e >= 12 ? "pm" : "am";
  return `${e % 12 || 12}${i}`;
}
function Re(s, t) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      ...t ? { timeZone: t } : {}
    }).format(new Date(s)).toUpperCase();
  } catch {
    return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(s).getDay()];
  }
}
function De(s) {
  const e = s.map((c) => c.temperature).filter((c) => c !== null && Number.isFinite(c));
  let i = 5, n = 10;
  if (e.length > 0) {
    const c = Math.min(...e), f = Math.max(...e);
    f - c > 18 ? i = 10 : i = 5;
    const p = i * 4, y = (c + f) / 2;
    n = Math.round((y - p / 2) / i) * i, c <= n + 0.5 && (n = Math.floor((c - 1) / i) * i), f >= n + p - 0.5 && (f - n > p ? (i = Math.ceil((f - c + 4) / 4 / 5) * 5, n = Math.floor((c - 1) / 5) * 5) : n = Math.ceil((f + 1 - p) / i) * i);
  }
  const r = Array.from(
    { length: 5 },
    (c, f) => n + f * i
  ), o = s.map((c) => c.wind_speed_kmh).filter((c) => Number.isFinite(c)), a = o.length > 0 ? Math.max(...o) : 25, l = [10, 15, 20, 25, 30];
  let h = 10;
  for (const c of l) {
    if (c * 4 >= Math.max(32, a * 1.12)) {
      h = c;
      break;
    }
    h = c;
  }
  const u = Array.from({ length: 5 }, (c, f) => f * h);
  return {
    temp: {
      min: r[0],
      max: r[4],
      step: i,
      ticks: r
    },
    wind: {
      min: 0,
      max: u[4],
      step: h,
      ticks: u
    },
    gridCount: 5
  };
}
function Xt(s, t) {
  var r;
  if (!(s != null && s.states))
    return t || null;
  if (t) {
    const o = s.states[t], a = Number(((r = o == null ? void 0 : o.attributes) == null ? void 0 : r.supported_features) ?? 0);
    if (o && (a & 2) !== 0)
      return t;
    const l = t.endsWith("_hourly") ? t : `${t}_hourly`;
    if (s.states[l])
      return l;
    if (o)
      return t;
  }
  const e = Object.keys(s.states).filter(
    (o) => o.startsWith("weather.")
  ), i = e.find((o) => o.endsWith("_hourly"));
  if (i)
    return i;
  const n = e.find((o) => {
    var l, h;
    return (Number(((h = (l = s.states[o]) == null ? void 0 : l.attributes) == null ? void 0 : h.supported_features) ?? 0) & 2) !== 0;
  });
  return n || (e[0] ?? null);
}
function N(s) {
  if (s == null || typeof s == "boolean")
    return null;
  const t = Number(s);
  return Number.isFinite(t) ? t : null;
}
function mt(s, t) {
  return s === null ? null : t.toUpperCase().includes("F") ? Math.round((s - 32) * 5 / 9 * 10) / 10 : Math.round(s * 10) / 10;
}
function jt(s, t) {
  if (s === null) return null;
  const e = (t ?? "km/h").trim().toLowerCase();
  return e === "mph" || e === "mi/h" ? Math.round(s * 1.60934 * 10) / 10 : e === "m/s" || e === "mps" ? Math.round(s * 3.6 * 10) / 10 : e === "kn" || e === "kt" || e === "knots" ? Math.round(s * 1.852 * 10) / 10 : Math.round(s * 10) / 10;
}
function Ue(s, t, e, i = 48) {
  var _, p, y, v, S;
  const n = t.states[e], r = (n == null ? void 0 : n.attributes) ?? {}, o = ((_ = t.config) == null ? void 0 : _.time_zone) || "UTC", a = r.temperature_unit || ((y = (p = t.config) == null ? void 0 : p.unit_system) == null ? void 0 : y.temperature) || "°C", l = r.wind_speed_unit || ((S = (v = t.config) == null ? void 0 : v.unit_system) == null ? void 0 : S.wind_speed) || "km/h", h = t.states["sun.sun"], u = [];
  if (h != null && h.attributes) {
    const m = h.attributes.next_rising, M = h.attributes.next_setting, d = m ? Date.parse(m) : NaN, g = M ? Date.parse(M) : NaN;
    (Number.isFinite(d) || Number.isFinite(g)) && u.push({
      sunrise: Number.isFinite(d) ? new Date(d).toISOString() : null,
      sunrise_ms: Number.isFinite(d) ? d : null,
      sunset: Number.isFinite(g) ? new Date(g).toISOString() : null,
      sunset_ms: Number.isFinite(g) ? g : null
    });
  }
  const c = Math.max(1, Math.min(72, i)), f = [];
  for (const m of s) {
    const M = String(m.datetime ?? ""), d = Ie(M, o);
    if (d === null) continue;
    const g = mt(
      N(m.temperature ?? m.native_temperature),
      a
    ), b = mt(
      N(m.apparent_temperature ?? m.native_apparent_temperature),
      a
    ), C = N(m.humidity), Et = mt(
      N(m.dew_point ?? m.native_dew_point),
      a
    ) ?? ee(g, C), et = N(m.precipitation_probability) ?? 0, ie = N(m.precipitation ?? m.native_precipitation), se = jt(N(m.wind_speed ?? m.native_wind_speed), l) ?? 0, ne = jt(
      N(m.wind_gust_speed ?? m.native_wind_gust_speed),
      l
    ), { cardinal: re, degrees: oe } = kt(
      m.wind_bearing
    ), Mt = String(m.condition ?? "partlycloudy"), Ct = rt(d, o), ae = !!m.is_night || Mt === "clear-night" || Ct < 6 || Ct >= 19;
    if (f.push({
      datetime: M,
      epoch_ms: d,
      temperature: g,
      feels_like: b,
      humidity: C,
      dew_point: Et,
      rain_chance: Math.max(0, Math.min(100, et)),
      rain_min_mm: null,
      rain_max_mm: ie,
      wind_speed_kmh: Math.max(0, se),
      wind_gust_kmh: ne,
      wind_direction: re,
      wind_bearing_deg: oe,
      icon_descriptor: m.icon_descriptor ?? null,
      condition: Mt,
      is_night: ae,
      uv_index: N(m.uv_index)
    }), f.length >= c) break;
  }
  return {
    source: "homeassistant_weather",
    entity_id: e,
    location: {
      name: String(r.friendly_name ?? e),
      state: null,
      timezone: o
    },
    units: {
      temperature: "°C",
      wind_speed: "km/h",
      precipitation: "mm"
    },
    current: null,
    sun_windows: u,
    hourly: f
  };
}
function st(s) {
  if (s.length === 0) return "";
  if (s.length === 1)
    return `M ${$(s[0].x)} ${$(s[0].y)}`;
  if (s.length === 2)
    return `M ${$(s[0].x)} ${$(s[0].y)} L ${$(s[1].x)} ${$(s[1].y)}`;
  const t = s.length, e = new Array(t - 1), i = new Array(t - 1), n = new Array(t - 1);
  for (let a = 0; a < t - 1; a++)
    e[a] = s[a + 1].x - s[a].x, i[a] = s[a + 1].y - s[a].y, n[a] = e[a] !== 0 ? i[a] / e[a] : 0;
  const r = new Array(t);
  r[0] = n[0], r[t - 1] = n[t - 2];
  for (let a = 1; a < t - 1; a++)
    if (n[a - 1] * n[a] <= 0)
      r[a] = 0;
    else {
      const l = 2 * e[a] + e[a - 1], h = e[a] + 2 * e[a - 1];
      r[a] = (l + h) / (l / n[a - 1] + h / n[a]);
    }
  for (let a = 0; a < t - 1; a++)
    if (Math.abs(n[a]) < 1e-9)
      r[a] = 0, r[a + 1] = 0;
    else {
      const l = r[a] / n[a], h = r[a + 1] / n[a], u = Math.hypot(l, h);
      if (u > 3) {
        const c = 3 / u;
        r[a] = c * l * n[a], r[a + 1] = c * h * n[a];
      }
    }
  let o = `M ${$(s[0].x)} ${$(s[0].y)}`;
  for (let a = 0; a < t - 1; a++) {
    const l = s[a], h = s[a + 1], u = e[a], c = l.x + u / 3, f = l.y + r[a] * u / 3, _ = h.x - u / 3, p = h.y - r[a + 1] * u / 3;
    o += ` C ${$(c)} ${$(f)}, ${$(_)} ${$(p)}, ${$(h.x)} ${$(h.y)}`;
  }
  return o;
}
function We(s, t) {
  if (s.length === 0) return "";
  if (s.length === 1) {
    const r = s[0];
    return `M ${$(r.x)} ${$(t)} L ${$(r.x)} ${$(r.y)} L ${$(r.x)} ${$(t)} Z`;
  }
  const e = st(s), i = s[0], n = s[s.length - 1];
  return `${e} L ${$(n.x)} ${$(t)} L ${$(i.x)} ${$(t)} Z`;
}
function Le(s, t, e, i) {
  if (s.length === 0 || i <= 0)
    return [];
  if (s.length === 1)
    return [{ startX: 0, endX: i, isNight: s[0].is_night }];
  const n = s[0].epoch_ms, r = s[s.length - 1].epoch_ms, o = e(0), a = e(s.length - 1), l = r - n, h = (p) => {
    if (l <= 0) return o;
    const y = (p - n) / l;
    return Math.max(0, Math.min(i, o + y * (a - o)));
  }, u = [];
  for (const p of t)
    p.sunrise_ms !== null && p.sunrise_ms > n && p.sunrise_ms < r && u.push({ x: h(p.sunrise_ms), toNight: !1 }), p.sunset_ms !== null && p.sunset_ms > n && p.sunset_ms < r && u.push({ x: h(p.sunset_ms), toNight: !0 });
  if (u.length > 0) {
    u.sort((S, m) => S.x - m.x);
    const p = [];
    let y = 0, v = !u[0].toNight;
    for (const S of u) {
      const m = Math.max(y, Math.min(i, S.x));
      m > y && p.push({ startX: y, endX: m, isNight: v }), y = m, v = S.toNight;
    }
    return y < i && p.push({ startX: y, endX: i, isNight: v }), p;
  }
  const c = [];
  let f = 0, _ = s[0].is_night;
  for (let p = 1; p < s.length; p++)
    if (s[p].is_night !== _) {
      const y = (e(p - 1) + e(p)) / 2;
      c.push({ startX: f, endX: y, isNight: _ }), f = y, _ = s[p].is_night;
    }
  return c.push({ startX: f, endX: i, isNight: _ }), c;
}
function $(s) {
  return (Math.round(s * 100) / 100).toString();
}
const E = 76, ze = 112, z = 272, P = 288, V = 44, O = 44, _t = 14, ot = class ot extends U {
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
        const i = e.contentRect.width;
        i > 80 && Math.abs(i - this._viewportWidth) >= 1 && (this._viewportWidth = i, this._updateScrollIndicators());
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
    const t = Math.max(1, this.hours.length), e = Math.max(8, Math.min(t, this.visibleHours || 24)), n = Math.max(
      180,
      this._viewportWidth - V - O - _t * 2
    ) / Math.max(1, e - 1), r = V + _t, o = Math.max(
      this._viewportWidth,
      Math.ceil(
        r + (t - 1) * n + O + _t
      )
    );
    return { count: t, hourSpacing: n, firstX: r, totalWidth: o, xForIndex: (l) => r + l * n };
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
    const i = e.getBoundingClientRect(), { firstX: n, hourSpacing: r } = this._getGeometry(), o = t - i.left + e.scrollLeft, a = Math.round((o - n) / r);
    return Math.max(0, Math.min(this.hours.length - 1, a));
  }
  _onPointerDown(t) {
    if (this.hours.length === 0 || t.pointerType === "mouse" && t.button !== 0) return;
    const e = this._scrollEl;
    if (e) {
      if (t.pointerType === "touch") {
        const i = e.getBoundingClientRect(), { xForIndex: n } = this._getGeometry(), r = i.left + n(this.selectedIndex) - e.scrollLeft;
        Math.abs(t.clientX - r) <= 26 && (this._isScrubbing = !0, this._activePointerId = t.pointerId, e.setPointerCapture(t.pointerId), t.preventDefault());
        return;
      }
      this._isScrubbing = !0, this._activePointerId = t.pointerId, e.setPointerCapture(t.pointerId), this._emitSelectedIndex(this._indexFromClientX(t.clientX));
    }
  }
  _onPointerMove(t) {
    if (!this._isScrubbing || t.pointerId !== this._activePointerId) return;
    const e = this._indexFromClientX(t.clientX);
    this._emitSelectedIndex(e);
    const i = this._scrollEl;
    if (i) {
      const n = i.getBoundingClientRect(), r = 48;
      t.clientX > n.right - r ? i.scrollLeft += 14 : t.clientX < n.left + r && (i.scrollLeft -= 14);
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
    const { xForIndex: i } = this._getGeometry(), n = i(t), r = e.scrollLeft + V + 16, o = e.scrollLeft + e.clientWidth - O - 16;
    n < r ? e.scrollTo({ left: Math.max(0, n - V - 24), behavior: "smooth" }) : n > o && e.scrollTo({
      left: n - e.clientWidth + O + 24,
      behavior: "smooth"
    });
  }
  _panByHours(t) {
    const e = this._scrollEl;
    if (!e) return;
    const { hourSpacing: i } = this._getGeometry();
    e.scrollBy({
      left: t * i,
      behavior: "smooth"
    });
  }
  _updateScrollIndicators() {
    const t = this._scrollEl;
    t && (this._canScrollLeft = t.scrollLeft > 4, this._canScrollRight = t.scrollLeft + t.clientWidth < t.scrollWidth - 4);
  }
  render() {
    if (this.hours.length === 0)
      return x;
    const { totalWidth: t, xForIndex: e } = this._getGeometry(), i = De(this.hours), n = z - ze, r = (d) => {
      const g = i.temp.max - i.temp.min || 1, b = (d - i.temp.min) / g;
      return z - b * n;
    }, o = (d) => {
      const g = Math.max(0, Math.min(100, d));
      return z - g / 100 * n;
    }, a = (d) => {
      const g = i.wind.max || 40, b = Math.max(0, d);
      return z - Math.min(1.06, b / g) * n;
    }, l = Le(
      this.hours,
      this.sunWindows,
      e,
      t
    ), h = this.hours.map((d, g) => ({
      x: e(g),
      y: o(d.rain_chance)
    })), u = this.hours.map(
      (d, g) => d.temperature !== null ? { x: e(g), y: r(d.temperature) } : null
    ).filter((d) => d !== null), c = this.hours.map((d, g) => ({
      x: e(g),
      y: a(d.wind_speed_kmh)
    })), f = We(h, z), _ = st(h), p = st(u), y = st(c), v = [];
    for (let d = 0; d < this.hours.length; d++)
      rt(this.hours[d].epoch_ms, this.timeZone) % 3 === 0 && v.push(d);
    if (v.length === 0)
      for (let d = 0; d < this.hours.length; d += 3)
        v.push(d);
    const S = Math.max(
      0,
      Math.min(this.hours.length - 1, this.selectedIndex)
    ), m = e(S), M = Array.from({ length: i.gridCount }, (d, g) => {
      const b = g / (i.gridCount - 1);
      return z - b * n;
    });
    return A`
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
        ${this._canScrollLeft ? A`
              <button
                class="wg-pan-btn wg-pan-left"
                type="button"
                aria-label="Scroll earlier hours"
                @click=${() => this._panByHours(-12)}
              >
                &#8249;
              </button>
            ` : x}
        ${this._canScrollRight ? A`
              <button
                class="wg-pan-btn wg-pan-right"
                type="button"
                aria-label="Scroll later hours"
                @click=${() => this._panByHours(12)}
              >
                &#8250;
              </button>
            ` : x}

        <div class="wg-axis-overlay wg-axis-left" aria-hidden="true">
          <span class="wg-axis-unit">°C</span>
          ${i.temp.ticks.map(
      (d, g) => A`
              <span
                class="wg-axis-tick"
                style="top: ${M[g] - E}px"
              >
                ${d}
              </span>
            `
    )}
        </div>

        <div class="wg-axis-overlay wg-axis-right" aria-hidden="true">
          <span class="wg-axis-unit">km/h</span>
          ${i.wind.ticks.map(
      (d, g) => A`
              <span
                class="wg-axis-tick"
                style="top: ${M[g] - E}px"
              >
                ${d}
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
            height=${P}
            viewBox="0 0 ${t} ${P}"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g class="wg-daynight-bands">
              ${l.map((d) => {
      const g = Math.max(0, d.endX - d.startX), b = d.isNight ? "#1b2e42" : "#2b5272", C = d.isNight ? "#132334" : "#1c364c";
      return w`
                  <g>
                    <rect
                      x=${d.startX}
                      y="0"
                      width=${g + 0.5}
                      height=${E}
                      fill=${b}
                    />
                    <rect
                      x=${d.startX}
                      y=${E}
                      width=${g + 0.5}
                      height=${P - E}
                      fill=${C}
                    />
                  </g>
                `;
    })}
            </g>

            <g stroke="rgba(255, 255, 255, 0.06)" stroke-width="1">
              ${v.map((d) => {
      const g = e(d);
      return w`
                  <line x1=${g} y1="0" x2=${g} y2=${P} />
                `;
    })}
            </g>

            <g stroke="rgba(255, 255, 255, 0.075)" stroke-width="1">
              ${M.map(
      (d) => w`
                  <line x1="0" y1=${d} x2=${t} y2=${d} />
                `
    )}
            </g>

            <line
              x1="0"
              y1=${E}
              x2=${t}
              y2=${E}
              stroke="rgba(164, 194, 222, 0.34)"
              stroke-width="1.2"
            />
            <g stroke="rgba(164, 194, 222, 0.36)" stroke-width="1.2">
              ${this.hours.map((d, g) => {
      const b = e(g);
      return w`
                  <line
                    x1=${b}
                    y1=${E - 6}
                    x2=${b}
                    y2=${E}
                  />
                `;
    })}
            </g>

            <g class="wg-strip-markers">
              ${v.map((d) => {
      const g = this.hours[d], b = e(d), C = Qt(
        g.icon_descriptor,
        g.condition,
        g.is_night
      ), tt = He(g.epoch_ms, this.timeZone), et = rt(g.epoch_ms, this.timeZone) === 0 ? Re(g.epoch_ms, this.timeZone) : null;
      return w`
                  <g>
                    ${Ee(C, b - 16, 6, 32)}
                    <text
                      x=${b}
                      y="57"
                      text-anchor="middle"
                      fill="#e2ecf7"
                      font-size="13"
                      font-weight="500"
                      font-family="inherit"
                    >
                      ${tt}
                    </text>
                    ${et ? w`
                          <text
                            x=${b}
                            y="69"
                            text-anchor="middle"
                            class="wg-day-pill"
                          >
                            ${et}
                          </text>
                        ` : x}
                  </g>
                `;
    })}
            </g>

            <g
              class="wg-series-layer ${this.showRain ? "" : "wg-series-hidden"}"
            >
              <path d=${f} fill="rgba(66, 158, 196, 0.48)" />
              <path
                d=${_}
                fill="none"
                stroke="rgba(96, 192, 232, 0.55)"
                stroke-width="1.4"
              />
            </g>

            <g
              class="wg-series-layer ${this.showTemperature ? "" : "wg-series-hidden"}"
            >
              <path
                d=${p}
                fill="none"
                stroke="#f5be36"
                stroke-width="3.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>

            <g
              class="wg-series-layer ${this.showWind ? "" : "wg-series-hidden"}"
            >
              <path
                d=${y}
                fill="none"
                stroke="rgba(226, 236, 248, 0.25)"
                stroke-width="2"
                stroke-linecap="round"
              />
              ${this.hours.map((d, g) => {
      const b = e(g), C = a(d.wind_speed_kmh);
      if (d.wind_bearing_deg === null || d.wind_speed_kmh < 0.4)
        return w`
                    <circle
                      cx=${b}
                      cy=${C}
                      r="3"
                      fill="rgba(255, 255, 255, 0.7)"
                    />
                  `;
      const tt = Pe(d.wind_bearing_deg);
      return w`
                  <path
                    d="M 0 -7.2 L 5.2 6.4 L 0 3.3 L -5.2 6.4 Z"
                    fill="#ffffff"
                    transform="translate(${b}, ${C}) rotate(${tt})"
                  />
                `;
    })}
            </g>

            <g class="wg-scrubber-cursor">
              <polygon
                points="${m - 6.5},0 ${m + 6.5},0 ${m},8.5"
                fill="#ffffff"
              />
              <line
                x1=${m}
                y1="7"
                x2=${m}
                y2=${P}
                stroke="#ffffff"
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
ot.properties = {
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
}, ot.styles = St`
    :host {
      display: block;
      position: relative;
      user-select: none;
      -webkit-user-select: none;
    }

    .wg-chart-shell {
      position: relative;
      width: 100%;
      height: ${P}px;
      overflow: hidden;
      background: #132334;
    }

    .wg-scroll-viewport {
      width: 100%;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 179, 209, 0.3) transparent;
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
      background: rgba(148, 179, 209, 0.28);
      border-radius: 999px;
    }

    svg.wg-chart-svg {
      display: block;
      height: ${P}px;
    }

    .wg-axis-overlay {
      position: absolute;
      top: ${E}px;
      height: ${P - E}px;
      pointer-events: none;
      z-index: 3;
    }

    .wg-axis-left {
      left: 0;
      width: ${V + 8}px;
      background: linear-gradient(
        90deg,
        rgba(16, 31, 48, 0.92) 62%,
        rgba(16, 31, 48, 0) 100%
      );
    }

    .wg-axis-right {
      right: 0;
      width: ${O + 8}px;
      background: linear-gradient(
        270deg,
        rgba(16, 31, 48, 0.92) 62%,
        rgba(16, 31, 48, 0) 100%
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
      color: #e8b93a;
    }

    .wg-axis-right .wg-axis-unit {
      right: 10px;
      color: #dbe7f3;
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
      color: #e8b93a;
    }

    .wg-axis-right .wg-axis-tick {
      right: 10px;
      color: #f1f5f9;
    }

    .wg-pan-btn {
      position: absolute;
      top: 22px;
      z-index: 4;
      width: 26px;
      height: 32px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 6px;
      background: rgba(9, 21, 37, 0.78);
      color: #e2e8f0;
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
      background: rgba(18, 40, 66, 0.95);
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
      fill: #93c5fd;
    }
  `;
let yt = ot;
customElements.get("wg-forecast-chart") || customElements.define("wg-forecast-chart", yt);
function Be({
  point: s,
  isFirstHour: t,
  currentObs: e,
  timeZone: i
}) {
  const n = t && (e == null ? void 0 : e.temperature) !== null && (e == null ? void 0 : e.temperature) !== void 0 ? e.temperature : s.temperature, r = t && (e == null ? void 0 : e.humidity) !== null && (e == null ? void 0 : e.humidity) !== void 0 ? e.humidity : s.humidity, o = t && (e == null ? void 0 : e.dew_point) !== null && (e == null ? void 0 : e.dew_point) !== void 0 ? e.dew_point : s.dew_point, a = t && (e == null ? void 0 : e.wind_speed_kmh) !== null && (e == null ? void 0 : e.wind_speed_kmh) !== void 0 ? e.wind_speed_kmh : s.wind_speed_kmh, l = (t && (e != null && e.wind_direction) ? e.wind_direction : null) ?? s.wind_direction ?? "", h = Qt(
    s.icon_descriptor,
    s.condition,
    s.is_night
  ), u = n != null ? `${Math.round(n)}°` : "--°", c = `${Math.round(s.rain_chance)}%`, f = Te(s.epoch_ms, i), _ = a <= 0.4 && !l ? "Calm" : `${l ? `${l} ` : ""}${Math.round(a)} km/h`, p = r != null ? `${Math.round(r)}%` : "--%", y = o != null ? `${Math.round(o)}°C` : "--°C";
  return A`
    <div class="wg-summary-panel" role="region" aria-label="Selected hour forecast details">
      <div class="wg-summary-left">
        <div class="wg-summary-icon">
          ${ke(h, 42)}
        </div>
        <div class="wg-summary-temp">${u}</div>
      </div>

      <div class="wg-summary-center">
        <div class="wg-summary-time">${f}</div>
        <div class="wg-summary-rain" title="Chance of precipitation">
          <span class="wg-droplet">${Me(17)}</span>
          <span class="wg-summary-rain-val">${c}</span>
        </div>
      </div>

      <div class="wg-summary-metrics">
        <div class="wg-metric-row">
          <span class="wg-metric-label">WIND</span>
          <span class="wg-metric-value">${_}</span>
        </div>
        <div class="wg-metric-row">
          <span class="wg-metric-label">HUMIDITY</span>
          <span class="wg-metric-value">${p}</span>
        </div>
        <div class="wg-metric-row">
          <span class="wg-metric-label">DEW POINT</span>
          <span class="wg-metric-value">${y}</span>
        </div>
      </div>
    </div>
  `;
}
const at = class at extends U {
  constructor() {
    super(), this._config = {
      type: "custom:weather-graph-card"
    };
  }
  setConfig(t) {
    this._config = { ...t };
  }
  _update(t, e) {
    const i = {
      ...this._config,
      [t]: e
    };
    this._config = i, this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: i },
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    var e;
    const t = Object.keys(((e = this.hass) == null ? void 0 : e.states) ?? {}).filter((i) => i.startsWith("weather.")).sort((i, n) => {
      const r = i.endsWith("_hourly") ? -1 : 0, o = n.endsWith("_hourly") ? -1 : 0;
      return r !== o ? r - o : i.localeCompare(n);
    });
    return A`
      <div class="editor-grid">
        <div class="field">
          <label for="wg-entity">Weather Entity (BOM Hourly preferred)</label>
          <select
            id="wg-entity"
            .value=${this._config.entity ?? ""}
            @change=${(i) => this._update("entity", i.target.value || void 0)}
          >
            <option value="">Auto-detect BOM / Hourly Weather</option>
            ${t.map((i) => {
      var r, o, a;
      const n = ((a = (o = (r = this.hass) == null ? void 0 : r.states[i]) == null ? void 0 : o.attributes) == null ? void 0 : a.friendly_name) || i;
      return A`
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
          <label for="wg-title">Card Title</label>
          <input
            id="wg-title"
            type="text"
            .value=${this._config.title ?? "Next 48 Hours"}
            @input=${(i) => this._update("title", i.target.value)}
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
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${!!this._config.show_location}
                @change=${(i) => this._update("show_location", i.target.checked)}
              />
              Location Subtitle
            </label>
          </div>
        </div>
      </div>
    `;
  }
};
at.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
}, at.styles = St`
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
  `;
let $t = at;
customElements.get("weather-graph-card-editor") || customElements.define(
  "weather-graph-card-editor",
  $t
);
const Fe = "1.0.0", lt = class lt extends U {
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
      entity: Xt(t) ?? void 0,
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
    var n;
    if (!((n = this.hass) != null && n.connection) || this._subscribing) return;
    const t = Xt(
      this.hass,
      this._config.entity
    ), e = Math.max(12, Math.min(72, this._config.hours_to_show ?? 48)), i = `${t ?? ""}::${this._config.bom_entry_id ?? ""}::${e}`;
    if (!(i === this._subscribedKey && this._unsubForecast)) {
      this._teardownSubscription(), this._subscribedKey = i, this._subscribing = !0, this._loading = !this._payload, this._error = null;
      try {
        this._unsubForecast = await this.hass.connection.subscribeMessage(
          (r) => {
            this._payload = r, this._selectedIndex >= r.hourly.length && (this._selectedIndex = 0), this._loading = !1, this._error = null;
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
            (r) => {
              if (!this.hass) return;
              const o = Ue(
                r.forecast ?? [],
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
        } catch (r) {
          this._loading = !1, this._error = `Unable to subscribe to hourly forecast for ${t}: ${r instanceof Error ? r.message : String(r)}`;
        }
      } finally {
        this._subscribing = !1;
      }
    }
  }
  _resolveCurrentObservation(t) {
    var u;
    if (!this.hass) return t;
    const e = (c) => {
      var p, y;
      if (!c) return null;
      const f = (y = (p = this.hass) == null ? void 0 : p.states[c]) == null ? void 0 : y.state;
      if (f === void 0) return null;
      const _ = Number(f);
      return Number.isFinite(_) ? _ : null;
    }, i = e(this._config.temperature_entity), n = e(this._config.humidity_entity), r = e(this._config.wind_speed_entity), o = this._config.wind_direction_entity ? (u = this.hass.states[this._config.wind_direction_entity]) == null ? void 0 : u.state : void 0, a = o ? kt(o) : { cardinal: null, degrees: null };
    if (i === null && n === null && r === null && !a.cardinal)
      return t;
    const l = i ?? (t == null ? void 0 : t.temperature) ?? null, h = n ?? (t == null ? void 0 : t.humidity) ?? null;
    return {
      temperature: l,
      feels_like: (t == null ? void 0 : t.feels_like) ?? null,
      humidity: h,
      dew_point: ee(l, h) ?? (t == null ? void 0 : t.dew_point) ?? null,
      wind_speed_kmh: r ?? (t == null ? void 0 : t.wind_speed_kmh) ?? null,
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
    var r, o, a, l, h, u, c, f, _, p, y, v, S;
    const t = this._config.title || "Next 48 Hours", e = ((r = this._payload) == null ? void 0 : r.hourly) ?? [], i = e[Math.max(0, Math.min(e.length - 1, this._selectedIndex))] ?? null, n = this._config.show_location && ((a = (o = this._payload) == null ? void 0 : o.location) != null && a.name) ? `${this._payload.location.name}${this._payload.location.state ? `, ${this._payload.location.state}` : ""}` : "";
    return A`
      <div class="wg-card">
        <div class="wg-card-header">
          <h2 class="wg-card-title">${t}</h2>
          ${n ? A`<span class="wg-card-subtitle">${n}</span>` : x}
        </div>

        ${this._loading ? A`<div class="wg-skeleton" aria-label="Loading forecast"></div>` : this._error ? A`<div class="wg-status-box">${this._error}</div>` : i ? A`
              <div class="wg-card-body">
                ${Be({
      point: i,
      isFirstHour: this._selectedIndex === 0,
      currentObs: this._resolveCurrentObservation(
        ((l = this._payload) == null ? void 0 : l.current) ?? null
      ),
      timeZone: ((u = (h = this._payload) == null ? void 0 : h.location) == null ? void 0 : u.timezone) ?? ((f = (c = this.hass) == null ? void 0 : c.config) == null ? void 0 : f.time_zone) ?? "Australia/Sydney"
    })}

                <wg-forecast-chart
                  .hours=${e}
                  .sunWindows=${((_ = this._payload) == null ? void 0 : _.sun_windows) ?? []}
                  .timeZone=${((y = (p = this._payload) == null ? void 0 : p.location) == null ? void 0 : y.timezone) ?? ((S = (v = this.hass) == null ? void 0 : v.config) == null ? void 0 : S.time_zone) ?? "Australia/Sydney"}
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
                    ${Ce(15)}
                    <span>Wind</span>
                  </button>
                </div>
              </div>
            ` : A`
              <div class="wg-status-box">
                No hourly forecast points available for the selected weather entity.
              </div>
            `}
      </div>
    `;
  }
};
lt.properties = {
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
}, lt.styles = St`
    :host {
      display: block;
      font-family: "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont,
        "Segoe UI", Roboto, sans-serif;
    }

    .wg-card {
      background: #0f2137;
      color: #f8fafc;
      border-radius: var(--ha-card-border-radius, 14px);
      border: 1px solid rgba(125, 169, 212, 0.14);
      box-shadow: var(
        --ha-card-box-shadow,
        0 10px 28px rgba(3, 10, 20, 0.36)
      );
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
      color: #ffffff;
    }

    .wg-card-subtitle {
      font-size: 12px;
      font-weight: 500;
      color: #8ea6c2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wg-summary-panel {
      margin: 0 14px 14px;
      padding: 14px 18px;
      background: #091525;
      border-radius: 10px;
      display: grid;
      grid-template-columns: auto minmax(110px, 1fr) auto;
      align-items: center;
      gap: 18px;
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
    }

    .wg-summary-temp {
      font-size: 31px;
      font-weight: 600;
      line-height: 1.05;
      color: #f5be36;
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
      color: #ffffff;
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
      color: #4cc9f0;
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
      color: #8da4be;
      text-transform: uppercase;
    }

    .wg-metric-value {
      font-size: 15.5px;
      font-weight: 700;
      color: #ffffff;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .wg-legend-bar {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 12px 14px 14px;
      background: #081525;
      border-top: 1px solid rgba(125, 169, 212, 0.14);
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
      color: #f5be36;
    }

    .wg-legend-temp::after {
      background: #f5be36;
    }

    .wg-legend-rain {
      color: #4cc9f0;
    }

    .wg-legend-rain::after {
      background: #4cc9f0;
    }

    .wg-legend-wind {
      color: #ffffff;
    }

    .wg-legend-wind::after {
      background: #ffffff;
    }

    .wg-status-box {
      padding: 36px 22px;
      text-align: center;
      color: #9fb5cc;
      font-size: 14px;
      line-height: 1.5;
    }

    .wg-skeleton {
      margin: 0 14px 16px;
      height: 280px;
      border-radius: 10px;
      background: linear-gradient(
        90deg,
        rgba(24, 46, 71, 0.55) 25%,
        rgba(38, 70, 104, 0.75) 50%,
        rgba(24, 46, 71, 0.55) 75%
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

    @media (max-width: 440px) {
      .wg-summary-panel {
        grid-template-columns: auto 1fr;
        gap: 12px 16px;
        padding: 12px 14px;
      }

      .wg-summary-metrics {
        grid-column: 1 / -1;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(148, 179, 209, 0.14);
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
let xt = lt;
customElements.get("weather-graph-card") || customElements.define("weather-graph-card", xt);
window.customCards = window.customCards || [];
window.customCards.some((s) => s.type === "weather-graph-card") || window.customCards.push({
  type: "weather-graph-card",
  name: "Weather Graph",
  description: "Interactive 48-hour temperature, rain probability, and directional wind graph powered by Bureau of Meteorology (BOM) or Home Assistant weather.",
  preview: !0
});
console.info(
  `%c WEATHER-GRAPH-CARD %c v${Fe} `,
  "background:#0f2137;color:#f5be36;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;",
  "background:#4cc9f0;color:#091525;font-weight:700;padding:2px 6px;border-radius:0 4px 4px 0;"
);
export {
  xt as WeatherGraphCard
};
