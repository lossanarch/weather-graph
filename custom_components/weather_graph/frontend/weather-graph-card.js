/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = globalThis, Rt = ct.ShadowRoot && (ct.ShadyCSS === void 0 || ct.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ht = Symbol(), jt = /* @__PURE__ */ new WeakMap();
let le = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== Ht) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Rt && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = jt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && jt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ve = (s) => new le(typeof s == "string" ? s : s + "", void 0, Ht), Ut = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, n, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + s[r + 1], s[0]);
  return new le(e, s, Ht);
}, ke = (s, t) => {
  if (Rt) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), n = ct.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = e.cssText, s.appendChild(i);
  }
}, Vt = Rt ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return ve(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Se, defineProperty: Ae, getOwnPropertyDescriptor: Me, getOwnPropertyNames: Ee, getOwnPropertySymbols: Ce, getPrototypeOf: Te } = Object, D = globalThis, Zt = D.trustedTypes, Ne = Zt ? Zt.emptyScript : "", yt = D.reactiveElementPolyfillSupport, it = (s, t) => s, Mt = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Ne : null;
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
} }, ce = (s, t) => !Se(s, t), Gt = { attribute: !0, type: String, converter: Mt, reflect: !1, useDefault: !1, hasChanged: ce };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), D.litPropertyMetadata ?? (D.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let G = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Gt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), n = this.getPropertyDescriptor(t, i, e);
      n !== void 0 && Ae(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: n, set: r } = Me(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? Gt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(it("elementProperties"))) return;
    const t = Te(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(it("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(it("properties"))) {
      const e = this.properties, i = [...Ee(e), ...Ce(e)];
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
      for (const n of i) e.unshift(Vt(n));
    } else t !== void 0 && e.push(Vt(t));
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
    return ke(t, this.constructor.elementStyles), t;
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
      const o = (((r = i.converter) == null ? void 0 : r.toAttribute) !== void 0 ? i.converter : Mt).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var r, o;
    const i = this.constructor, n = i._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const a = i.getPropertyOptions(n), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((r = a.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? a.converter : Mt;
      this._$Em = n;
      const l = c.fromAttribute(e, a.type);
      this[n] = l ?? ((o = this._$Ej) == null ? void 0 : o.get(n)) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, n = !1, r) {
    var o;
    if (t !== void 0) {
      const a = this.constructor;
      if (n === !1 && (r = this[t]), i ?? (i = a.getPropertyOptions(t)), !((i.hasChanged ?? ce)(r, e) || i.useDefault && i.reflect && r === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(a._$Eu(t, i)))) return;
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
        const { wrapped: a } = o, c = this[r];
        a !== !0 || this._$AL.has(r) || c === void 0 || this.C(r, void 0, o, c);
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
G.elementStyles = [], G.shadowRootOptions = { mode: "open" }, G[it("elementProperties")] = /* @__PURE__ */ new Map(), G[it("finalized")] = /* @__PURE__ */ new Map(), yt == null || yt({ ReactiveElement: G }), (D.reactiveElementVersions ?? (D.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const st = globalThis, Kt = (s) => s, dt = st.trustedTypes, qt = dt ? dt.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, he = "$lit$", U = `lit$${Math.random().toFixed(9).slice(2)}$`, de = "?" + U, Pe = `<${de}>`, B = document, nt = () => B.createComment(""), rt = (s) => s === null || typeof s != "object" && typeof s != "function", Dt = Array.isArray, Ie = (s) => Dt(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", $t = `[ 	
\f\r]`, J = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Yt = /-->/g, Jt = />/g, L = RegExp(`>|${$t}(?:([^\\s"'>=/]+)(${$t}*=${$t}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Qt = /'/g, te = /"/g, ue = /^(?:script|style|textarea|title)$/i, pe = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), $ = pe(1), w = pe(2), X = Symbol.for("lit-noChange"), b = Symbol.for("lit-nothing"), ee = /* @__PURE__ */ new WeakMap(), O = B.createTreeWalker(B, 129);
function ge(s, t) {
  if (!Dt(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return qt !== void 0 ? qt.createHTML(t) : t;
}
const Re = (s, t) => {
  const e = s.length - 1, i = [];
  let n, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = J;
  for (let a = 0; a < e; a++) {
    const c = s[a];
    let l, d, h = -1, g = 0;
    for (; g < c.length && (o.lastIndex = g, d = o.exec(c), d !== null); ) g = o.lastIndex, o === J ? d[1] === "!--" ? o = Yt : d[1] !== void 0 ? o = Jt : d[2] !== void 0 ? (ue.test(d[2]) && (n = RegExp("</" + d[2], "g")), o = L) : d[3] !== void 0 && (o = L) : o === L ? d[0] === ">" ? (o = n ?? J, h = -1) : d[1] === void 0 ? h = -2 : (h = o.lastIndex - d[2].length, l = d[1], o = d[3] === void 0 ? L : d[3] === '"' ? te : Qt) : o === te || o === Qt ? o = L : o === Yt || o === Jt ? o = J : (o = L, n = void 0);
    const _ = o === L && s[a + 1].startsWith("/>") ? " " : "";
    r += o === J ? c + Pe : h >= 0 ? (i.push(l), c.slice(0, h) + he + c.slice(h) + U + _) : c + U + (h === -2 ? a : _);
  }
  return [ge(s, r + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class ot {
  constructor({ strings: t, _$litType$: e }, i) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, c = this.parts, [l, d] = Re(t, e);
    if (this.el = ot.createElement(l, i), O.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (n = O.nextNode()) !== null && c.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const h of n.getAttributeNames()) if (h.endsWith(he)) {
          const g = d[o++], _ = n.getAttribute(h).split(U), u = /([.?@])?(.*)/.exec(g);
          c.push({ type: 1, index: r, name: u[2], strings: _, ctor: u[1] === "." ? Ue : u[1] === "?" ? De : u[1] === "@" ? We : wt }), n.removeAttribute(h);
        } else h.startsWith(U) && (c.push({ type: 6, index: r }), n.removeAttribute(h));
        if (ue.test(n.tagName)) {
          const h = n.textContent.split(U), g = h.length - 1;
          if (g > 0) {
            n.textContent = dt ? dt.emptyScript : "";
            for (let _ = 0; _ < g; _++) n.append(h[_], nt()), O.nextNode(), c.push({ type: 2, index: ++r });
            n.append(h[g], nt());
          }
        }
      } else if (n.nodeType === 8) if (n.data === de) c.push({ type: 2, index: r });
      else {
        let h = -1;
        for (; (h = n.data.indexOf(U, h + 1)) !== -1; ) c.push({ type: 7, index: r }), h += U.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const i = B.createElement("template");
    return i.innerHTML = t, i;
  }
}
function K(s, t, e = s, i) {
  var o, a;
  if (t === X) return t;
  let n = i !== void 0 ? (o = e._$Co) == null ? void 0 : o[i] : e._$Cl;
  const r = rt(t) ? void 0 : t._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== r && ((a = n == null ? void 0 : n._$AO) == null || a.call(n, !1), r === void 0 ? n = void 0 : (n = new r(s), n._$AT(s, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = n : e._$Cl = n), n !== void 0 && (t = K(s, n._$AS(s, t.values), n, i)), t;
}
class He {
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
    const { el: { content: e }, parts: i } = this._$AD, n = ((t == null ? void 0 : t.creationScope) ?? B).importNode(e, !0);
    O.currentNode = n;
    let r = O.nextNode(), o = 0, a = 0, c = i[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let l;
        c.type === 2 ? l = new at(r, r.nextSibling, this, t) : c.type === 1 ? l = new c.ctor(r, c.name, c.strings, this, t) : c.type === 6 && (l = new Le(r, this, t)), this._$AV.push(l), c = i[++a];
      }
      o !== (c == null ? void 0 : c.index) && (r = O.nextNode(), o++);
    }
    return O.currentNode = B, n;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class at {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, i, n) {
    this.type = 2, this._$AH = b, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = n, this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0;
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
    t = K(this, t, e), rt(t) ? t === b || t == null || t === "" ? (this._$AH !== b && this._$AR(), this._$AH = b) : t !== this._$AH && t !== X && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ie(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== b && rt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(B.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var r;
    const { values: e, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = ot.createElement(ge(i.h, i.h[0]), this.options)), i);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === n) this._$AH.p(e);
    else {
      const o = new He(n, this), a = o.u(this.options);
      o.p(e), this.T(a), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = ee.get(t.strings);
    return e === void 0 && ee.set(t.strings, e = new ot(t)), e;
  }
  k(t) {
    Dt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, n = 0;
    for (const r of t) n === e.length ? e.push(i = new at(this.O(nt()), this.O(nt()), this, this.options)) : i = e[n], i._$AI(r), n++;
    n < e.length && (this._$AR(i && i._$AB.nextSibling, n), e.length = n);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, e); t !== this._$AB; ) {
      const n = Kt(t).nextSibling;
      Kt(t).remove(), t = n;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class wt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, n, r) {
    this.type = 1, this._$AH = b, this._$AN = void 0, this.element = t, this.name = e, this._$AM = n, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = b;
  }
  _$AI(t, e = this, i, n) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = K(this, t, e, 0), o = !rt(t) || t !== this._$AH && t !== X, o && (this._$AH = t);
    else {
      const a = t;
      let c, l;
      for (t = r[0], c = 0; c < r.length - 1; c++) l = K(this, a[i + c], e, c), l === X && (l = this._$AH[c]), o || (o = !rt(l) || l !== this._$AH[c]), l === b ? t = b : t !== b && (t += (l ?? "") + r[c + 1]), this._$AH[c] = l;
    }
    o && !n && this.j(t);
  }
  j(t) {
    t === b ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ue extends wt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === b ? void 0 : t;
  }
}
class De extends wt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== b);
  }
}
class We extends wt {
  constructor(t, e, i, n, r) {
    super(t, e, i, n, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = K(this, t, e, 0) ?? b) === X) return;
    const i = this._$AH, n = t === b && i !== b || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== b && (i === b || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Le {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    K(this, t);
  }
}
const xt = st.litHtmlPolyfillSupport;
xt == null || xt(ot, at), (st.litHtmlVersions ?? (st.litHtmlVersions = [])).push("3.3.3");
const Oe = (s, t, e) => {
  const i = (e == null ? void 0 : e.renderBefore) ?? t;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = (e == null ? void 0 : e.renderBefore) ?? null;
    i._$litPart$ = n = new at(t.insertBefore(nt(), r), r, void 0, e ?? {});
  }
  return n._$AI(s), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = globalThis;
let F = class extends G {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Oe(e, this.renderRoot, this.renderOptions);
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
var ae;
F._$litElement$ = !0, F.finalized = !0, (ae = z.litElementHydrateSupport) == null || ae.call(z, { LitElement: F });
const bt = z.litElementPolyfillSupport;
bt == null || bt({ LitElement: F });
(z.litElementVersions ?? (z.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ze = { ATTRIBUTE: 1 }, Fe = (s) => (...t) => ({ _$litDirective$: s, values: t });
let Be = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, i) {
    this._$Ct = t, this._$AM = e, this._$Ci = i;
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
const fe = "important", Xe = " !" + fe, je = Fe(class extends Be {
  constructor(s) {
    var t;
    if (super(s), s.type !== ze.ATTRIBUTE || s.name !== "style" || ((t = s.strings) == null ? void 0 : t.length) > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(s) {
    return Object.keys(s).reduce((t, e) => {
      const i = s[e];
      return i == null ? t : t + `${e = e.includes("-") ? e : e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${i};`;
    }, "");
  }
  update(s, [t]) {
    const { style: e } = s.element;
    if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
    for (const i of this.ft) t[i] == null && (this.ft.delete(i), i.includes("-") ? e.removeProperty(i) : e[i] = null);
    for (const i in t) {
      const n = t[i];
      if (n != null) {
        this.ft.add(i);
        const r = typeof n == "string" && n.endsWith(Xe);
        i.includes("-") || r ? e.setProperty(i, r ? n.slice(0, -11) : n, r ? fe : "") : e[i] = n;
      }
    }
    return X;
  }
});
function me(s, t, e) {
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
const Q = (s = 16, t = 15, e = 7.2) => w`
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
`, vt = (s = 0, t = 0) => w`
  <path
    transform="translate(${s}, ${t})"
    d="M18.2 7.2A8.3 8.3 0 0 0 10.6 18.8 8.4 8.4 0 0 0 22.4 20.1 6.9 6.9 0 0 1 18.2 7.2Z"
    fill="#9eb1c4"
  />
`, C = (s = 0, t = 0) => w`
  <path
    transform="translate(${s}, ${t})"
    d="M13.2 26.8H29.4A5.4 5.4 0 0 0 30.1 16.1 7.6 7.6 0 0 0 15.6 14.3 6.2 6.2 0 0 0 13.2 26.8Z"
    fill="#f1f5f9"
  />
`, V = (s = 0, t = 0) => w`
  <path
    transform="translate(${s}, ${t})"
    d="M9.5 23.6H23.2A4.6 4.6 0 0 0 23.8 14.5 6.4 6.4 0 0 0 11.5 13 5.2 5.2 0 0 0 9.5 23.6Z"
    fill="#94a8be"
  />
`, kt = (s = 3, t = 28.5) => s === 2 ? w`
      <g style="fill: var(--wg-rain, #4cc9f0)">
        <circle cx="18.5" cy=${t + 1.5} r="1.45" />
        <circle cx="24.5" cy=${t + 3.2} r="1.45" />
      </g>
    ` : s === 4 ? w`
      <g style="stroke: var(--wg-rain, #4cc9f0)" stroke-width="2.1" stroke-linecap="round">
        <line x1="14.5" y1=${t} x2="12.8" y2=${t + 5} />
        <line x1="19.5" y1=${t + 0.8} x2="17.8" y2=${t + 5.8} />
        <line x1="24.5" y1=${t} x2="22.8" y2=${t + 5} />
        <line x1="29.2" y1=${t + 0.8} x2="27.5" y2=${t + 5.8} />
      </g>
    ` : w`
    <g style="fill: var(--wg-rain, #4cc9f0)">
      <circle cx="16.5" cy=${t + 1.2} r="1.4" />
      <circle cx="21.5" cy=${t + 3.6} r="1.4" />
      <circle cx="26.2" cy=${t + 1.4} r="1.4" />
    </g>
  `, ie = () => w`
  <polygon
    points="22.8,22.2 18.2,29.2 21.8,29.2 19.9,35.6 27.4,27.3 23.4,27.3"
    fill="#38bdf8"
    style="stroke: var(--wg-bg, #0d1e33)"
    stroke-width="0.6"
    stroke-linejoin="round"
  />
`;
function we(s) {
  switch (s) {
    case "sunny":
      return Q(20, 20, 8.2);
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
          ${Q(15.5, 15.5, 6.8)}
          ${C(2, 2)}
        </g>
      `;
    case "partly-cloudy-day":
      return w`
        <g>
          ${Q(15, 15, 6.5)}
          ${V(5, 1)}
          ${C(1, 2.5)}
        </g>
      `;
    case "partly-cloudy-night":
      return w`
        <g>
          ${vt(-1, 0)}
          ${V(5, 2)}
          ${C(1, 3)}
        </g>
      `;
    case "cloudy":
      return w`
        <g>
          ${V(0, -1)}
          ${C(1, 3)}
        </g>
      `;
    case "light-shower-day":
      return w`
        <g>
          ${Q(14.5, 13.5, 5.8)}
          ${C(0, 0)}
          ${kt(3, 28)}
        </g>
      `;
    case "light-shower-night":
      return w`
        <g>
          ${vt(-2, -2)}
          ${V(4, -1)}
          ${C(0, 0.5)}
          ${kt(3, 28.5)}
        </g>
      `;
    case "rain":
    case "heavy-rain":
      return w`
        <g>
          ${V(0, -2.5)}
          ${C(1, 0)}
          ${kt(4, 28.2)}
        </g>
      `;
    case "storm-day":
      return w`
        <g>
          ${Q(14.5, 13.8, 6.1)}
          ${C(0.5, 0.5)}
          ${ie()}
        </g>
      `;
    case "storm-night":
      return w`
        <g>
          ${vt(-2, -2)}
          ${V(3, -1.5)}
          ${C(0.5, 0.5)}
          ${ie()}
        </g>
      `;
    case "fog":
      return w`
        <g>
          ${C(-1, -2)}
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
          ${C(0, -1)}
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
function Ve(s, t = 36) {
  return $`
    <svg
      width=${t}
      height=${t}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      ${we(s)}
    </svg>
  `;
}
function Ze(s, t, e, i = 32) {
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
      ${we(s)}
    </svg>
  `;
}
function Ge(s = 18) {
  return $`
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
function Ke(s = 16) {
  return $`
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
const qe = [
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
], se = {
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
function _e(s, t) {
  if (s == null || t === null || t === void 0 || !Number.isFinite(s) || !Number.isFinite(t) || t <= 0)
    return null;
  const e = Math.max(1, Math.min(100, t)), i = 17.27, n = 237.7, r = i * s / (n + s) + Math.log(e / 100), o = i - r;
  return Math.abs(o) < 1e-9 ? null : Math.round(n * r / o * 10) / 10;
}
function Wt(s) {
  if (s == null)
    return { cardinal: null, degrees: null };
  if (typeof s == "number") {
    if (!Number.isFinite(s))
      return { cardinal: null, degrees: null };
    const t = (s % 360 + 360) % 360, e = Math.floor((t + 11.25) / 22.5) % 16;
    return {
      cardinal: qe[e],
      degrees: Math.round(t * 10) / 10
    };
  }
  if (typeof s == "string") {
    const t = s.trim().toUpperCase();
    if (!t || t === "CALM" || t === "UNAVAILABLE" || t === "UNKNOWN")
      return { cardinal: null, degrees: null };
    if (t in se)
      return { cardinal: t, degrees: se[t] };
    const e = Number(t);
    if (Number.isFinite(e))
      return Wt(e);
  }
  return { cardinal: null, degrees: null };
}
function Ye(s) {
  return s == null || !Number.isFinite(s) ? 0 : ((s + 180) % 360 + 360) % 360;
}
function Je(s, t) {
  if (!s || typeof s != "string")
    return null;
  const e = s.trim();
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(e)) {
    const h = Date.parse(e);
    return Number.isFinite(h) ? h : null;
  }
  const n = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(e);
  if (!n) {
    const h = Date.parse(e);
    return Number.isFinite(h) ? h : null;
  }
  const r = Number(n[1]), o = Number(n[2]), a = Number(n[3]), c = Number(n[4]), l = Number(n[5]), d = Number(n[6] ?? "0");
  try {
    const h = Date.UTC(r, o - 1, a, c, l, d), _ = new Intl.DateTimeFormat("en-US", {
      timeZone: t,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date(h)), u = {};
    for (const S of _)
      S.type !== "literal" && (u[S.type] = Number(S.value));
    const k = Date.UTC(
      u.year,
      (u.month ?? 1) - 1,
      u.day ?? 1,
      u.hour ?? 0,
      u.minute ?? 0,
      u.second ?? 0
    ) - h;
    return h - k;
  } catch {
    return new Date(r, o - 1, a, c, l, d).getTime();
  }
}
function ut(s, t) {
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
function Qe(s, t) {
  var e, i, n;
  try {
    const r = {
      weekday: "short",
      hour: "numeric",
      hour12: !0,
      ...t ? { timeZone: t } : {}
    }, o = new Intl.DateTimeFormat("en-US", r).formatToParts(
      new Date(s)
    ), a = (((e = o.find((d) => d.type === "weekday")) == null ? void 0 : e.value) ?? "").toUpperCase(), c = ((i = o.find((d) => d.type === "hour")) == null ? void 0 : i.value) ?? "", l = (((n = o.find((d) => d.type === "dayPeriod")) == null ? void 0 : n.value) ?? "").toUpperCase();
    return `${a} ${c}${l}`.trim();
  } catch {
    const r = new Date(s), o = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], a = r.getHours(), c = a >= 12 ? "PM" : "AM", l = a % 12 || 12;
    return `${o[r.getDay()]} ${l}${c}`;
  }
}
function ti(s, t) {
  const e = ut(s, t), i = e >= 12 ? "pm" : "am";
  return `${e % 12 || 12}${i}`;
}
function ei(s, t) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      ...t ? { timeZone: t } : {}
    }).format(new Date(s)).toUpperCase();
  } catch {
    return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(s).getDay()];
  }
}
function ii(s) {
  const e = s.map((h) => h.temperature).filter((h) => h !== null && Number.isFinite(h));
  let i = 5, n = 10;
  if (e.length > 0) {
    const h = Math.min(...e), g = Math.max(...e);
    g - h > 18 ? i = 10 : i = 5;
    const u = i * 4, y = (h + g) / 2;
    n = Math.round((y - u / 2) / i) * i, h <= n + 0.5 && (n = Math.floor((h - 1) / i) * i), g >= n + u - 0.5 && (g - n > u ? (i = Math.ceil((g - h + 4) / 4 / 5) * 5, n = Math.floor((h - 1) / 5) * 5) : n = Math.ceil((g + 1 - u) / i) * i);
  }
  const r = Array.from(
    { length: 5 },
    (h, g) => n + g * i
  ), o = s.map((h) => h.wind_speed_kmh).filter((h) => Number.isFinite(h)), a = o.length > 0 ? Math.max(...o) : 25, c = [10, 15, 20, 25, 30];
  let l = 10;
  for (const h of c) {
    if (h * 4 >= Math.max(32, a * 1.12)) {
      l = h;
      break;
    }
    l = h;
  }
  const d = Array.from({ length: 5 }, (h, g) => g * l);
  return {
    temp: {
      min: r[0],
      max: r[4],
      step: i,
      ticks: r
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
function ne(s, t) {
  var r;
  if (!(s != null && s.states))
    return t || null;
  if (t) {
    const o = s.states[t], a = Number(((r = o == null ? void 0 : o.attributes) == null ? void 0 : r.supported_features) ?? 0);
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
  ), i = e.find((o) => o.endsWith("_hourly"));
  if (i)
    return i;
  const n = e.find((o) => {
    var c, l;
    return (Number(((l = (c = s.states[o]) == null ? void 0 : c.attributes) == null ? void 0 : l.supported_features) ?? 0) & 2) !== 0;
  });
  return n || (e[0] ?? null);
}
function I(s) {
  if (s == null || typeof s == "boolean")
    return null;
  const t = Number(s);
  return Number.isFinite(t) ? t : null;
}
function St(s, t) {
  return s === null ? null : t.toUpperCase().includes("F") ? Math.round((s - 32) * 5 / 9 * 10) / 10 : Math.round(s * 10) / 10;
}
function re(s, t) {
  if (s === null) return null;
  const e = (t ?? "km/h").trim().toLowerCase();
  return e === "mph" || e === "mi/h" ? Math.round(s * 1.60934 * 10) / 10 : e === "m/s" || e === "mps" ? Math.round(s * 3.6 * 10) / 10 : e === "kn" || e === "kt" || e === "knots" ? Math.round(s * 1.852 * 10) / 10 : Math.round(s * 10) / 10;
}
function si(s, t, e, i = 48) {
  var _, u, y, k, S;
  const n = t.states[e], r = (n == null ? void 0 : n.attributes) ?? {}, o = ((_ = t.config) == null ? void 0 : _.time_zone) || "UTC", a = r.temperature_unit || ((y = (u = t.config) == null ? void 0 : u.unit_system) == null ? void 0 : y.temperature) || "°C", c = r.wind_speed_unit || ((S = (k = t.config) == null ? void 0 : k.unit_system) == null ? void 0 : S.wind_speed) || "km/h", l = t.states["sun.sun"], d = [];
  if (l != null && l.attributes) {
    const m = l.attributes.next_rising, P = l.attributes.next_setting, E = m ? Date.parse(m) : NaN, N = P ? Date.parse(P) : NaN;
    (Number.isFinite(E) || Number.isFinite(N)) && d.push({
      sunrise: Number.isFinite(E) ? new Date(E).toISOString() : null,
      sunrise_ms: Number.isFinite(E) ? E : null,
      sunset: Number.isFinite(N) ? new Date(N).toISOString() : null,
      sunset_ms: Number.isFinite(N) ? N : null
    });
  }
  const h = Math.max(1, Math.min(72, i)), g = [];
  for (const m of s) {
    const P = String(m.datetime ?? ""), E = Je(P, o);
    if (E === null) continue;
    const N = St(
      I(m.temperature ?? m.native_temperature),
      a
    ), _t = St(
      I(m.apparent_temperature ?? m.native_apparent_temperature),
      a
    ), W = I(m.humidity), p = St(
      I(m.dew_point ?? m.native_dew_point),
      a
    ) ?? _e(N, W), f = I(m.precipitation_probability) ?? 0, v = I(m.precipitation ?? m.native_precipitation), j = re(I(m.wind_speed ?? m.native_wind_speed), c) ?? 0, Y = re(
      I(m.wind_gust_speed ?? m.native_wind_gust_speed),
      c
    ), { cardinal: Ft, degrees: lt } = Wt(
      m.wind_bearing
    ), Bt = String(m.condition ?? "partlycloudy"), Xt = ut(E, o), be = !!m.is_night || Bt === "clear-night" || Xt < 6 || Xt >= 19;
    if (g.push({
      datetime: P,
      epoch_ms: E,
      temperature: N,
      feels_like: _t,
      humidity: W,
      dew_point: p,
      rain_chance: Math.max(0, Math.min(100, f)),
      rain_min_mm: null,
      rain_max_mm: v,
      wind_speed_kmh: Math.max(0, j),
      wind_gust_kmh: Y,
      wind_direction: Ft,
      wind_bearing_deg: lt,
      icon_descriptor: m.icon_descriptor ?? null,
      condition: Bt,
      is_night: be,
      uv_index: I(m.uv_index)
    }), g.length >= h) break;
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
    sun_windows: d,
    hourly: g
  };
}
function ht(s) {
  if (s.length === 0) return "";
  if (s.length === 1)
    return `M ${x(s[0].x)} ${x(s[0].y)}`;
  if (s.length === 2)
    return `M ${x(s[0].x)} ${x(s[0].y)} L ${x(s[1].x)} ${x(s[1].y)}`;
  const t = s.length, e = new Array(t - 1), i = new Array(t - 1), n = new Array(t - 1);
  for (let a = 0; a < t - 1; a++)
    e[a] = s[a + 1].x - s[a].x, i[a] = s[a + 1].y - s[a].y, n[a] = e[a] !== 0 ? i[a] / e[a] : 0;
  const r = new Array(t);
  r[0] = n[0], r[t - 1] = n[t - 2];
  for (let a = 1; a < t - 1; a++)
    if (n[a - 1] * n[a] <= 0)
      r[a] = 0;
    else {
      const c = 2 * e[a] + e[a - 1], l = e[a] + 2 * e[a - 1];
      r[a] = (c + l) / (c / n[a - 1] + l / n[a]);
    }
  for (let a = 0; a < t - 1; a++)
    if (Math.abs(n[a]) < 1e-9)
      r[a] = 0, r[a + 1] = 0;
    else {
      const c = r[a] / n[a], l = r[a + 1] / n[a], d = Math.hypot(c, l);
      if (d > 3) {
        const h = 3 / d;
        r[a] = h * c * n[a], r[a + 1] = h * l * n[a];
      }
    }
  let o = `M ${x(s[0].x)} ${x(s[0].y)}`;
  for (let a = 0; a < t - 1; a++) {
    const c = s[a], l = s[a + 1], d = e[a], h = c.x + d / 3, g = c.y + r[a] * d / 3, _ = l.x - d / 3, u = l.y - r[a + 1] * d / 3;
    o += ` C ${x(h)} ${x(g)}, ${x(_)} ${x(u)}, ${x(l.x)} ${x(l.y)}`;
  }
  return o;
}
function ni(s, t) {
  if (s.length === 0) return "";
  if (s.length === 1) {
    const r = s[0];
    return `M ${x(r.x)} ${x(t)} L ${x(r.x)} ${x(r.y)} L ${x(r.x)} ${x(t)} Z`;
  }
  const e = ht(s), i = s[0], n = s[s.length - 1];
  return `${e} L ${x(n.x)} ${x(t)} L ${x(i.x)} ${x(t)} Z`;
}
function ri(s, t, e, i) {
  if (s.length === 0 || i <= 0)
    return [];
  if (s.length === 1)
    return [{ startX: 0, endX: i, isNight: s[0].is_night }];
  const n = s[0].epoch_ms, r = s[s.length - 1].epoch_ms, o = e(0), a = e(s.length - 1), c = r - n, l = (u) => {
    if (c <= 0) return o;
    const y = (u - n) / c;
    return Math.max(0, Math.min(i, o + y * (a - o)));
  }, d = [];
  for (const u of t)
    u.sunrise_ms !== null && u.sunrise_ms > n && u.sunrise_ms < r && d.push({ x: l(u.sunrise_ms), toNight: !1 }), u.sunset_ms !== null && u.sunset_ms > n && u.sunset_ms < r && d.push({ x: l(u.sunset_ms), toNight: !0 });
  if (d.length > 0) {
    d.sort((S, m) => S.x - m.x);
    const u = [];
    let y = 0, k = !d[0].toNight;
    for (const S of d) {
      const m = Math.max(y, Math.min(i, S.x));
      m > y && u.push({ startX: y, endX: m, isNight: k }), y = m, k = S.toNight;
    }
    return y < i && u.push({ startX: y, endX: i, isNight: k }), u;
  }
  const h = [];
  let g = 0, _ = s[0].is_night;
  for (let u = 1; u < s.length; u++)
    if (s[u].is_night !== _) {
      const y = (e(u - 1) + e(u)) / 2;
      h.push({ startX: g, endX: y, isNight: _ }), g = y, _ = s[u].is_night;
    }
  return h.push({ startX: g, endX: i, isNight: _ }), h;
}
function x(s) {
  return (Math.round(s * 100) / 100).toString();
}
const T = 76, oi = 112, Z = 272, H = 288, tt = 44, et = 44, At = 14, gt = class gt extends F {
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
      this._viewportWidth - tt - et - At * 2
    ) / Math.max(1, e - 1), r = tt + At, o = Math.max(
      this._viewportWidth,
      Math.ceil(
        r + (t - 1) * n + et + At
      )
    );
    return { count: t, hourSpacing: n, firstX: r, totalWidth: o, xForIndex: (c) => r + c * n };
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
    const { xForIndex: i } = this._getGeometry(), n = i(t), r = e.scrollLeft + tt + 16, o = e.scrollLeft + e.clientWidth - et - 16;
    n < r ? e.scrollTo({ left: Math.max(0, n - tt - 24), behavior: "smooth" }) : n > o && e.scrollTo({
      left: n - e.clientWidth + et + 24,
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
      return b;
    const { totalWidth: t, xForIndex: e } = this._getGeometry(), i = ii(this.hours), n = Z - oi, r = (p) => {
      const f = i.temp.max - i.temp.min || 1, v = (p - i.temp.min) / f;
      return Z - v * n;
    }, o = (p) => {
      const f = Math.max(0, Math.min(100, p));
      return Z - f / 100 * n;
    }, a = (p) => {
      const f = i.wind.max || 40, v = Math.max(0, p);
      return Z - Math.min(1.06, v / f) * n;
    }, c = ri(
      this.hours,
      this.sunWindows,
      e,
      t
    ), l = this.hours.map((p, f) => ({
      x: e(f),
      y: o(p.rain_chance)
    })), d = this.hours.map(
      (p, f) => p.temperature !== null ? { x: e(f), y: r(p.temperature) } : null
    ).filter((p) => p !== null), h = this.hours.map((p, f) => ({
      x: e(f),
      y: a(p.wind_speed_kmh)
    })), g = ni(l, Z), _ = ht(l), u = ht(d), y = ht(h), k = [];
    for (let p = 0; p < this.hours.length; p++)
      ut(this.hours[p].epoch_ms, this.timeZone) % 3 === 0 && k.push(p);
    if (k.length === 0)
      for (let p = 0; p < this.hours.length; p += 3)
        k.push(p);
    const S = Math.max(
      0,
      Math.min(this.hours.length - 1, this.selectedIndex)
    ), m = e(S), P = Array.from({ length: i.gridCount }, (p, f) => {
      const v = f / (i.gridCount - 1);
      return Z - v * n;
    }), E = {
      unit: "%",
      ticks: Array.from(
        { length: i.gridCount },
        (p, f) => Math.round(f * 100 / (i.gridCount - 1))
      ),
      tone: "rain",
      dim: !1
    }, N = this.showRain && !this.showTemperature, _t = this.showRain && this.showTemperature && !this.showWind, W = N ? E : { unit: "°C", ticks: i.temp.ticks, tone: "temp", dim: !this.showTemperature }, q = _t ? E : { unit: "km/h", ticks: i.wind.ticks, tone: "wind", dim: !this.showWind };
    return $`
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
        ${this._canScrollLeft ? $`
              <button
                class="wg-pan-btn wg-pan-left"
                type="button"
                aria-label="Scroll earlier hours"
                @click=${() => this._panByHours(-12)}
              >
                &#8249;
              </button>
            ` : b}
        ${this._canScrollRight ? $`
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
          class="wg-axis-overlay wg-axis-left wg-axis-${W.tone} ${W.dim ? "wg-axis-dim" : ""}"
          aria-hidden="true"
        >
          <span class="wg-axis-unit">${W.unit}</span>
          ${W.ticks.map(
      (p, f) => $`
              <span
                class="wg-axis-tick"
                style="top: ${P[f] - T}px"
              >
                ${p}
              </span>
            `
    )}
        </div>

        <div
          class="wg-axis-overlay wg-axis-right wg-axis-${q.tone} ${q.dim ? "wg-axis-dim" : ""}"
          aria-hidden="true"
        >
          <span class="wg-axis-unit">${q.unit}</span>
          ${q.ticks.map(
      (p, f) => $`
              <span
                class="wg-axis-tick"
                style="top: ${P[f] - T}px"
              >
                ${p}
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
              ${c.map((p) => {
      const f = Math.max(0, p.endX - p.startX), v = p.isNight ? "night" : "day";
      return w`
                  <g>
                    <rect
                      x=${p.startX}
                      y="0"
                      width=${f + 0.5}
                      height=${T}
                      class="wg-band-${v}-strip"
                    />
                    <rect
                      x=${p.startX}
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
              ${k.map((p) => {
      const f = e(p);
      return w`
                  <line x1=${f} y1="0" x2=${f} y2=${H} />
                `;
    })}
            </g>

            <g class="wg-grid-horizontal" stroke-width="1">
              ${P.map(
      (p) => w`
                  <line x1="0" y1=${p} x2=${t} y2=${p} />
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
              ${this.hours.map((p, f) => {
      const v = e(f);
      return w`
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
              ${k.map((p) => {
      const f = this.hours[p], v = e(p), j = me(
        f.icon_descriptor,
        f.condition,
        f.is_night
      ), Y = ti(f.epoch_ms, this.timeZone), lt = ut(f.epoch_ms, this.timeZone) === 0 ? ei(f.epoch_ms, this.timeZone) : null;
      return w`
                  <g>
                    <g class="wg-strip-icon">
                      ${Ze(j, v - 16, 6, 32)}
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
                      ${Y}
                    </text>
                    ${lt ? w`
                          <text
                            x=${v}
                            y="69"
                            text-anchor="middle"
                            class="wg-day-pill"
                          >
                            ${lt}
                          </text>
                        ` : b}
                  </g>
                `;
    })}
            </g>

            <g
              class="wg-series-layer ${this.showRain ? "" : "wg-series-hidden"}"
            >
              <path d=${g} class="wg-rain-area" />
              <path
                d=${_}
                fill="none"
                class="wg-rain-stroke"
                stroke-width="1.4"
              />
            </g>

            <g
              class="wg-series-layer ${this.showTemperature ? "" : "wg-series-hidden"}"
            >
              <path
                d=${u}
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
                d=${y}
                fill="none"
                class="wg-wind-line"
                stroke-width="2"
                stroke-linecap="round"
              />
              ${this.hours.map((p, f) => {
      const v = e(f), j = a(p.wind_speed_kmh);
      if (p.wind_bearing_deg === null || p.wind_speed_kmh < 0.4)
        return w`
                    <circle
                      cx=${v}
                      cy=${j}
                      r="3"
                      class="wg-wind-marker"
                      fill-opacity="0.7"
                    />
                  `;
      const Y = Ye(p.wind_bearing_deg);
      return w`
                  <path
                    d="M 0 -7.2 L 5.2 6.4 L 0 3.3 L -5.2 6.4 Z"
                    class="wg-wind-marker"
                    transform="translate(${v}, ${j}) rotate(${Y})"
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
gt.properties = {
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
}, gt.styles = Ut`
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
      width: ${tt + 8}px;
      background: linear-gradient(
        90deg,
        var(--wg-axis-fade) 62%,
        var(--wg-axis-fade-clear) 100%
      );
    }

    .wg-axis-right {
      right: 0;
      width: ${et + 8}px;
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
let Et = gt;
customElements.get("wg-forecast-chart") || customElements.define("wg-forecast-chart", Et);
const Ct = 3, ai = ["wind", "humidity", "dew_point"], Lt = [
  { id: "wind", label: "Wind" },
  { id: "wind_gust", label: "Wind gust" },
  { id: "humidity", label: "Humidity" },
  { id: "dew_point", label: "Dew point" },
  { id: "feels_like", label: "Feels like" },
  { id: "uv", label: "UV index" },
  { id: "rain_amount", label: "Rain amount" }
], li = new Set(Lt.map((s) => s.id));
function Tt(s) {
  if (!Array.isArray(s)) return [...ai];
  const t = [];
  for (const e of s)
    typeof e == "string" && li.has(e) && !t.includes(e) && t.push(e);
  return t.slice(0, Ct);
}
function ci(s) {
  return s < 3 ? "Low" : s < 6 ? "Moderate" : s < 8 ? "High" : s < 11 ? "Very High" : "Extreme";
}
const R = (s) => s != null && Number.isFinite(s);
function hi(s, t, e, i) {
  var c;
  const n = (l) => e ? (i == null ? void 0 : i[l]) ?? null : null, r = ((c = Lt.find((l) => l.id === s)) == null ? void 0 : c.label) ?? s, o = (l) => R(l) ? `${Math.round(l)}°C` : "--°C", a = (l) => R(l) ? `${Math.round(l)} km/h` : "-- km/h";
  switch (s) {
    case "wind": {
      const l = n("wind_speed_kmh") ?? t.wind_speed_kmh, d = n("wind_direction") ?? t.wind_direction ?? "", h = R(l) && l <= 0.4 && !d ? "Calm" : `${d ? `${d} ` : ""}${a(l)}`;
      return { id: s, label: r, value: h };
    }
    case "wind_gust":
      return {
        id: s,
        label: r,
        value: a(n("wind_gust_kmh") ?? t.wind_gust_kmh)
      };
    case "humidity": {
      const l = n("humidity") ?? t.humidity;
      return { id: s, label: r, value: R(l) ? `${Math.round(l)}%` : "--%" };
    }
    case "dew_point":
      return {
        id: s,
        label: r,
        value: o(n("dew_point") ?? t.dew_point)
      };
    case "feels_like":
      return {
        id: s,
        label: r,
        value: o(n("feels_like") ?? t.feels_like)
      };
    case "uv": {
      const l = t.uv_index;
      return {
        id: s,
        label: r,
        value: R(l) ? `${Math.round(l)} ${ci(l)}` : "--"
      };
    }
    case "rain_amount": {
      const l = t.rain_min_mm, d = t.rain_max_mm;
      let h = "-- mm";
      return R(l) && R(d) && d > l ? h = `${l}–${d} mm` : R(d) ? h = `${d} mm` : R(l) && (h = `${l} mm`), { id: s, label: r, value: h };
    }
  }
}
function di({
  point: s,
  isFirstHour: t,
  currentObs: e,
  timeZone: i,
  metrics: n
}) {
  const r = t && (e == null ? void 0 : e.temperature) !== null && (e == null ? void 0 : e.temperature) !== void 0 ? e.temperature : s.temperature, o = me(
    s.icon_descriptor,
    s.condition,
    s.is_night
  ), a = r != null ? `${Math.round(r)}°` : "--°", c = `${Math.round(s.rain_chance)}%`, l = Qe(s.epoch_ms, i);
  return $`
    <div
      class="wg-summary-panel ${n.length === 0 ? "wg-no-metrics" : ""}"
      role="region"
      aria-label="Selected hour forecast details"
      style="--wg-metric-count: ${Math.max(1, n.length)}"
    >
      <div class="wg-summary-left">
        <div class="wg-summary-icon">
          ${Ve(o, 42)}
        </div>
        <div class="wg-summary-temp">${a}</div>
      </div>

      <div class="wg-summary-center">
        <div class="wg-summary-time">${l}</div>
        <div class="wg-summary-rain" title="Chance of precipitation">
          <span class="wg-droplet">${Ge(17)}</span>
          <span class="wg-summary-rain-val">${c}</span>
        </div>
      </div>

      ${n.length > 0 ? $`
            <div class="wg-summary-metrics">
              ${n.map((d) => {
    const { label: h, value: g } = hi(d, s, t, e);
    return $`
                  <div class="wg-metric-row">
                    <span class="wg-metric-label">${h}</span>
                    <span class="wg-metric-value">${g}</span>
                  </div>
                `;
  })}
            </div>
          ` : b}
    </div>
  `;
}
const Ot = [
  { slot: "background", label: "Background" },
  { slot: "daytime", label: "Daytime shading" },
  { slot: "temperature", label: "Temperature" },
  { slot: "rain", label: "Chance of rain" },
  { slot: "wind", label: "Wind" },
  { slot: "text", label: "Text" }
], Nt = [
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
], ye = "dusk", ui = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
function $e(s) {
  if (typeof s != "string") return null;
  const t = s.trim();
  if (!ui.test(t)) return null;
  if (t.length === 4) {
    const [, e, i, n] = t;
    return `#${e}${e}${i}${i}${n}${n}`.toLowerCase();
  }
  return t.toLowerCase();
}
function zt(s) {
  return Nt.find((t) => t.id === s) ?? Nt.find((t) => t.id === ye);
}
function xe(s, t) {
  const e = { ...zt(s).colors };
  for (const { slot: i } of Ot) {
    const n = $e(t == null ? void 0 : t[i]);
    n && (e[i] = n);
  }
  return e;
}
function oe(s, t) {
  const e = zt(s).colors, i = {};
  for (const { slot: n } of Ot) {
    const r = $e(t == null ? void 0 : t[n]);
    r && r !== e[n] && (i[n] = r);
  }
  return i;
}
function pt(s) {
  const t = parseInt(s.slice(1), 16);
  return [t >> 16 & 255, t >> 8 & 255, t & 255];
}
function pi([s, t, e]) {
  return `#${[s, t, e].map((i) => Math.round(Math.max(0, Math.min(255, i))).toString(16).padStart(2, "0")).join("")}`;
}
function A(s, t, e) {
  const i = pt(s), n = pt(t);
  return pi([0, 1, 2].map((r) => i[r] + (n[r] - i[r]) * e));
}
function M(s, t) {
  const [e, i, n] = pt(s);
  return `rgba(${e}, ${i}, ${n}, ${t})`;
}
function gi(s) {
  const [t, e, i] = pt(s).map((n) => {
    const r = n / 255;
    return r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * t + 0.7152 * e + 0.0722 * i;
}
function fi(s) {
  const { background: t, daytime: e, temperature: i, rain: n, wind: r, text: o } = s, a = gi(t) < 0.4, c = a ? A(t, "#000000", 0.38) : A(t, o, 0.05), l = a ? A(t, "#000000", 0.45) : A(t, o, 0.07), d = A(t, e, 0.12);
  return {
    "--wg-bg": t,
    "--wg-panel": c,
    "--wg-legend-bg": l,
    "--wg-text": o,
    "--wg-text-muted": A(o, t, 0.4),
    "--wg-border": M(o, 0.12),
    "--wg-shadow": a ? "rgba(0, 0, 0, 0.36)" : "rgba(0, 0, 0, 0.12)",
    "--wg-temp": i,
    "--wg-rain": n,
    "--wg-wind": r,
    "--wg-rain-fill": M(A(n, t, 0.2), 0.48),
    "--wg-rain-stroke": M(n, 0.55),
    "--wg-wind-line": M(r, 0.25),
    "--wg-band-day-strip": e,
    "--wg-band-night-strip": A(t, e, 0.3),
    "--wg-band-day-plot": A(t, e, 0.45),
    "--wg-band-night-plot": d,
    "--wg-axis-fade": M(d, 0.92),
    "--wg-axis-fade-clear": M(d, 0),
    "--wg-grid": M(o, 0.075),
    "--wg-grid-vertical": M(o, 0.06),
    "--wg-strip-rule": M(A(o, e, 0.3), 0.36),
    "--wg-day-label": A(n, o, 0.5),
    "--wg-control-bg": M(c, 0.82),
    "--wg-control-border": M(o, 0.18),
    "--wg-icon-filter": a ? "none" : "drop-shadow(0 0 0.6px rgba(0, 0, 0, 0.55)) drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.18))",
    "--wg-skeleton-a": M(A(t, e, 0.4), 0.55),
    "--wg-skeleton-b": M(A(t, e, 0.8), 0.75)
  };
}
const ft = class ft extends F {
  constructor() {
    super(), this._config = {
      type: "custom:weather-graph-card"
    };
  }
  setConfig(t) {
    this._config = { ...t };
  }
  _update(t, e) {
    const i = { ...this._config };
    e === void 0 ? delete i[t] : i[t] = e, this._emit(i);
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
    const i = Tt(this._config.metrics);
    for (; i.length < Ct; ) i.push("");
    i[t] = e;
    const n = i.filter(
      (r, o) => r !== "" && i.indexOf(r) === o
    );
    this._update("metrics", n);
  }
  _setPalette(t) {
    const e = { ...this._config, palette: t };
    delete e.colors, this._emit(e);
  }
  _setColor(t, e) {
    const i = oe(this._config.palette, {
      ...this._config.colors,
      [t]: e
    });
    this._update("colors", Object.keys(i).length > 0 ? i : void 0);
  }
  _renderMetricsSection() {
    const t = Tt(this._config.metrics);
    return $`
      <div class="field">
        <label>Summary Fields</label>
        <div class="row-3">
          ${Array.from({ length: Ct }, (e, i) => {
      const n = i < t.length ? t[i] : "";
      return $`
              <select
                aria-label="Summary field ${i + 1}"
                .value=${n}
                @change=${(r) => this._setMetric(i, r.target.value)}
              >
                <option value="" ?selected=${n === ""}>None</option>
                ${Lt.map(
        (r) => $`
                    <option
                      value=${r.id}
                      ?selected=${n === r.id}
                      ?disabled=${n !== r.id && t.includes(r.id)}
                    >
                      ${r.label}
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
    const t = zt(this._config.palette), e = oe(this._config.palette, this._config.colors), i = xe(this._config.palette, this._config.colors), n = Object.keys(e).length > 0;
    return $`
      <div class="field">
        <div class="section-head">
          <label for="wg-palette">Colour Palette</label>
          <button
            type="button"
            class="revert-btn"
            ?disabled=${!n}
            @click=${() => this._update("colors", void 0)}
          >
            Revert to ${t.name}
          </button>
        </div>
        <select
          id="wg-palette"
          .value=${t.id}
          @change=${(r) => this._setPalette(r.target.value)}
        >
          ${Nt.map(
      (r) => $`
              <option value=${r.id} ?selected=${r.id === t.id}>
                ${r.name}${r.id === ye ? " (default)" : ""}
              </option>
            `
    )}
        </select>
        <div class="swatches">
          ${Ot.map(
      ({ slot: r, label: o }) => $`
              <label class="swatch">
                <input
                  type="color"
                  .value=${i[r]}
                  @input=${(a) => this._setColor(r, a.target.value)}
                />
                <span class="swatch-text">
                  <span>${o}</span>
                  <span class="swatch-hex ${e[r] ? "custom" : ""}">
                    ${i[r]}${e[r] ? " (custom)" : ""}
                  </span>
                </span>
              </label>
            `
    )}
        </div>
        <span class="hint">
          Pick a built-in palette, then adjust any colour. Changing palette clears custom colours.
        </span>
      </div>
    `;
  }
  render() {
    var e;
    const t = Object.keys(((e = this.hass) == null ? void 0 : e.states) ?? {}).filter((i) => i.startsWith("weather.")).sort((i, n) => {
      const r = i.endsWith("_hourly") ? -1 : 0, o = n.endsWith("_hourly") ? -1 : 0;
      return r !== o ? r - o : i.localeCompare(n);
    });
    return $`
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
      return $`
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

        ${this._renderMetricsSection()} ${this._renderColorsSection()}
      </div>
    `;
  }
};
ft.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
}, ft.styles = Ut`
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
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px 12px;
    }

    .swatch {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 13px;
      cursor: pointer;
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

    .swatch-text {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }

    .swatch-hex {
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: var(--secondary-text-color, #94a3b8);
    }

    .swatch-hex.custom {
      color: var(--primary-color, #03a9f4);
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
let Pt = ft;
customElements.get("weather-graph-card-editor") || customElements.define(
  "weather-graph-card-editor",
  Pt
);
const mi = "1.1.0", mt = class mt extends F {
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
      entity: ne(t) ?? void 0,
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
    const t = ne(
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
              const o = si(
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
    var d;
    if (!this.hass) return t;
    const e = (h) => {
      var u, y;
      if (!h) return null;
      const g = (y = (u = this.hass) == null ? void 0 : u.states[h]) == null ? void 0 : y.state;
      if (g === void 0) return null;
      const _ = Number(g);
      return Number.isFinite(_) ? _ : null;
    }, i = e(this._config.temperature_entity), n = e(this._config.humidity_entity), r = e(this._config.wind_speed_entity), o = this._config.wind_direction_entity ? (d = this.hass.states[this._config.wind_direction_entity]) == null ? void 0 : d.state : void 0, a = o ? Wt(o) : { cardinal: null, degrees: null };
    if (i === null && n === null && r === null && !a.cardinal)
      return t;
    const c = i ?? (t == null ? void 0 : t.temperature) ?? null, l = n ?? (t == null ? void 0 : t.humidity) ?? null;
    return {
      temperature: c,
      feels_like: (t == null ? void 0 : t.feels_like) ?? null,
      humidity: l,
      dew_point: _e(c, l) ?? (t == null ? void 0 : t.dew_point) ?? null,
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
    var o, a, c, l, d, h, g, _, u, y, k, S, m;
    const t = this._config.title || "Next 48 Hours", e = ((o = this._payload) == null ? void 0 : o.hourly) ?? [], i = e[Math.max(0, Math.min(e.length - 1, this._selectedIndex))] ?? null, n = this._config.show_location && ((c = (a = this._payload) == null ? void 0 : a.location) != null && c.name) ? `${this._payload.location.name}${this._payload.location.state ? `, ${this._payload.location.state}` : ""}` : "", r = fi(
      xe(this._config.palette, this._config.colors)
    );
    return $`
      <div class="wg-card" style=${je(r)}>
        <div class="wg-card-header">
          <h2 class="wg-card-title">${t}</h2>
          ${n ? $`<span class="wg-card-subtitle">${n}</span>` : b}
        </div>

        ${this._loading ? $`<div class="wg-skeleton" aria-label="Loading forecast"></div>` : this._error ? $`<div class="wg-status-box">${this._error}</div>` : i ? $`
              <div class="wg-card-body">
                ${di({
      point: i,
      isFirstHour: this._selectedIndex === 0,
      currentObs: this._resolveCurrentObservation(
        ((l = this._payload) == null ? void 0 : l.current) ?? null
      ),
      timeZone: ((h = (d = this._payload) == null ? void 0 : d.location) == null ? void 0 : h.timezone) ?? ((_ = (g = this.hass) == null ? void 0 : g.config) == null ? void 0 : _.time_zone) ?? "Australia/Sydney",
      metrics: Tt(this._config.metrics)
    })}

                <wg-forecast-chart
                  .hours=${e}
                  .sunWindows=${((u = this._payload) == null ? void 0 : u.sun_windows) ?? []}
                  .timeZone=${((k = (y = this._payload) == null ? void 0 : y.location) == null ? void 0 : k.timezone) ?? ((m = (S = this.hass) == null ? void 0 : S.config) == null ? void 0 : m.time_zone) ?? "Australia/Sydney"}
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
                    ${Ke(15)}
                    <span>Wind</span>
                  </button>
                </div>
              </div>
            ` : $`
              <div class="wg-status-box">
                No hourly forecast points available for the selected weather entity.
              </div>
            `}
      </div>
    `;
  }
};
mt.properties = {
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
}, mt.styles = Ut`
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
let It = mt;
customElements.get("weather-graph-card") || customElements.define("weather-graph-card", It);
window.customCards = window.customCards || [];
window.customCards.some((s) => s.type === "weather-graph-card") || window.customCards.push({
  type: "weather-graph-card",
  name: "Weather Graph",
  description: "Interactive 48-hour temperature, rain probability, and directional wind graph powered by Bureau of Meteorology (BOM) or Home Assistant weather.",
  preview: !0
});
console.info(
  `%c WEATHER-GRAPH-CARD %c v${mi} `,
  "background:#1b1a2e;color:#ff8f6b;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;",
  "background:#59c3c3;color:#1b1a2e;font-weight:700;padding:2px 6px;border-radius:0 4px 4px 0;"
);
export {
  It as WeatherGraphCard
};
