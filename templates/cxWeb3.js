(function (t) {
  var e = {};
  function r(n) {
    if (e[n]) return e[n].exports;
    var i = (e[n] = { i: n, l: !1, exports: {} });
    return t[n].call(i.exports, i, i.exports, r), (i.l = !0), i.exports;
  }
  (r.m = t),
    (r.c = e),
    (r.d = function (t, e, n) {
      r.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: n });
    }),
    (r.r = function (t) {
      "undefined" !== typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(t, "__esModule", { value: !0 });
    }),
    (r.t = function (t, e) {
      if ((1 & e && (t = r(t)), 8 & e)) return t;
      if (4 & e && "object" === typeof t && t && t.__esModule) return t;
      var n = Object.create(null);
      if (
        (r.r(n),
        Object.defineProperty(n, "default", { enumerable: !0, value: t }),
        2 & e && "string" != typeof t)
      )
        for (var i in t)
          r.d(
            n,
            i,
            function (e) {
              return t[e];
            }.bind(null, i)
          );
      return n;
    }),
    (r.n = function (t) {
      var e =
        t && t.__esModule
          ? function () {
              return t["default"];
            }
          : function () {
              return t;
            };
      return r.d(e, "a", e), e;
    }),
    (r.o = function (t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    }),
    (r.p = ""),
    r((r.s = "dcd6"));
})({
  0: function (t, e) {},
  "0066": function (t, e, r) {
    "use strict";
    var n = r("ba10"),
      i = r("b800"),
      o = r("39d4").errors,
      s = r("5ee3").w3cwebsocket,
      u = function (t, e) {
        n.call(this),
          (e = e || {}),
          (this.url = t),
          (this._customTimeout = e.timeout || 15e3),
          (this.headers = e.headers || {}),
          (this.protocol = e.protocol || void 0),
          (this.reconnectOptions = Object.assign(
            { auto: !1, delay: 5e3, maxAttempts: !1, onTimeout: !1 },
            e.reconnect
          )),
          (this.clientConfig = e.clientConfig || void 0),
          (this.requestOptions = e.requestOptions || void 0),
          (this.DATA = "data"),
          (this.CLOSE = "close"),
          (this.ERROR = "error"),
          (this.CONNECT = "connect"),
          (this.RECONNECT = "reconnect"),
          (this.connection = null),
          (this.requestQueue = new Map()),
          (this.responseQueue = new Map()),
          (this.reconnectAttempts = 0),
          (this.reconnecting = !1);
        var r = i.parseURL(t);
        r.username &&
          r.password &&
          (this.headers.authorization =
            "Basic " + i.btoa(r.username + ":" + r.password)),
          r.auth && (this.headers.authorization = "Basic " + i.btoa(r.auth)),
          Object.defineProperty(this, "connected", {
            get: function () {
              return (
                this.connection &&
                this.connection.readyState === this.connection.OPEN
              );
            },
            enumerable: !0,
          }),
          this.connect();
      };
    (u.prototype = Object.create(n.prototype)),
      (u.prototype.constructor = u),
      (u.prototype.connect = function () {
        (this.connection = new s(
          this.url,
          this.protocol,
          void 0,
          this.headers,
          this.requestOptions,
          this.clientConfig
        )),
          this._addSocketListeners();
      }),
      (u.prototype._onMessage = function (t) {
        var e = this;
        this._parseResponse("string" === typeof t.data ? t.data : "").forEach(
          function (t) {
            if (t.method && -1 !== t.method.indexOf("_subscription"))
              e.emit(e.DATA, t);
            else {
              var r = t.id;
              Array.isArray(t) && (r = t[0].id),
                e.responseQueue.has(r) &&
                  (e.responseQueue.get(r).callback(!1, t),
                  e.responseQueue.delete(r));
            }
          }
        );
      }),
      (u.prototype._onConnect = function () {
        if (
          (this.emit(this.CONNECT),
          (this.reconnectAttempts = 0),
          (this.reconnecting = !1),
          this.requestQueue.size > 0)
        ) {
          var t = this;
          this.requestQueue.forEach(function (e, r) {
            t.send(e.payload, e.callback), t.requestQueue.delete(r);
          });
        }
      }),
      (u.prototype._onClose = function (t) {
        var e = this;
        !this.reconnectOptions.auto ||
        ([1e3, 1001].includes(t.code) && !1 !== t.wasClean)
          ? (this.emit(this.CLOSE, t),
            this.requestQueue.size > 0 &&
              this.requestQueue.forEach(function (r, n) {
                r.callback(o.ConnectionNotOpenError(t)),
                  e.requestQueue.delete(n);
              }),
            this.responseQueue.size > 0 &&
              this.responseQueue.forEach(function (r, n) {
                r.callback(o.InvalidConnection("on WS", t)),
                  e.responseQueue.delete(n);
              }),
            this._removeSocketListeners(),
            this.removeAllListeners())
          : this.reconnect();
      }),
      (u.prototype._addSocketListeners = function () {
        this.connection.addEventListener("message", this._onMessage.bind(this)),
          this.connection.addEventListener("open", this._onConnect.bind(this)),
          this.connection.addEventListener("close", this._onClose.bind(this));
      }),
      (u.prototype._removeSocketListeners = function () {
        this.connection.removeEventListener("message", this._onMessage),
          this.connection.removeEventListener("open", this._onConnect),
          this.connection.removeEventListener("close", this._onClose);
      }),
      (u.prototype._parseResponse = function (t) {
        var e = this,
          r = [],
          n = t
            .replace(/\}[\n\r]?\{/g, "}|--|{")
            .replace(/\}\][\n\r]?\[\{/g, "}]|--|[{")
            .replace(/\}[\n\r]?\[\{/g, "}|--|[{")
            .replace(/\}\][\n\r]?\{/g, "}]|--|{")
            .split("|--|");
        return (
          n.forEach(function (t) {
            e.lastChunk && (t = e.lastChunk + t);
            var n = null;
            try {
              n = JSON.parse(t);
            } catch (i) {
              return (
                (e.lastChunk = t),
                clearTimeout(e.lastChunkTimeout),
                void (e.lastChunkTimeout = setTimeout(function () {
                  e.reconnectOptions.auto && e.reconnectOptions.onTimeout
                    ? e.reconnect()
                    : (e.emit(e.ERROR, o.ConnectionTimeout(e._customTimeout)),
                      e.requestQueue.size > 0 &&
                        e.requestQueue.forEach(function (t, r) {
                          t.callback(o.ConnectionTimeout(e._customTimeout)),
                            e.requestQueue.delete(r);
                        }));
                }, e._customTimeout))
              );
            }
            clearTimeout(e.lastChunkTimeout),
              (e.lastChunk = null),
              n && r.push(n);
          }),
          r
        );
      }),
      (u.prototype.send = function (t, e) {
        var r = this,
          n = t.id,
          i = { payload: t, callback: e };
        if (
          (Array.isArray(t) && (n = t[0].id),
          this.connection.readyState === this.connection.CONNECTING ||
            this.reconnecting)
        )
          this.requestQueue.set(n, i);
        else {
          if (this.connection.readyState !== this.connection.OPEN)
            return (
              this.requestQueue.delete(n),
              this.emit(this.ERROR, o.ConnectionNotOpenError()),
              void i.callback(o.ConnectionNotOpenError())
            );
          this.responseQueue.set(n, i), this.requestQueue.delete(n);
          try {
            this.connection.send(JSON.stringify(i.payload));
          } catch (s) {
            i.callback(s), r.responseQueue.delete(n);
          }
        }
      }),
      (u.prototype.reset = function () {
        this.responseQueue.clear(),
          this.requestQueue.clear(),
          this.removeAllListeners(),
          this._removeSocketListeners(),
          this._addSocketListeners();
      }),
      (u.prototype.disconnect = function (t, e) {
        this._removeSocketListeners(), this.connection.close(t || 1e3, e);
      }),
      (u.prototype.supportsSubscriptions = function () {
        return !0;
      }),
      (u.prototype.reconnect = function () {
        var t = this;
        (this.reconnecting = !0),
          this.responseQueue.size > 0 &&
            this.responseQueue.forEach(function (e, r) {
              e.callback(o.PendingRequestsOnReconnectingError()),
                t.responseQueue.delete(r);
            }),
          !this.reconnectOptions.maxAttempts ||
          this.reconnectAttempts < this.reconnectOptions.maxAttempts
            ? setTimeout(function () {
                t.reconnectAttempts++,
                  t._removeSocketListeners(),
                  t.emit(t.RECONNECT, t.reconnectAttempts),
                  t.connect();
              }, this.reconnectOptions.delay)
            : (this.emit(this.ERROR, o.MaxAttemptsReachedOnReconnectingError()),
              this.requestQueue.size > 0 &&
                this.requestQueue.forEach(function (e, r) {
                  e.callback(o.MaxAttemptsReachedOnReconnectingError()),
                    t.requestQueue.delete(r);
                }));
      }),
      (t.exports = u);
  },
  "00ee": function (t, e, r) {
    var n = r("b622"),
      i = n("toStringTag"),
      o = {};
    (o[i] = "z"), (t.exports = "[object z]" === String(o));
  },
  "0366": function (t, e, r) {
    var n = r("1c0b");
    t.exports = function (t, e, r) {
      if ((n(t), void 0 === e)) return t;
      switch (r) {
        case 0:
          return function () {
            return t.call(e);
          };
        case 1:
          return function (r) {
            return t.call(e, r);
          };
        case 2:
          return function (r, n) {
            return t.call(e, r, n);
          };
        case 3:
          return function (r, n, i) {
            return t.call(e, r, n, i);
          };
      }
      return function () {
        return t.apply(e, arguments);
      };
    };
  },
  "0538": function (t, e, r) {
    "use strict";
    var n = r("1c0b"),
      i = r("861d"),
      o = [].slice,
      s = {},
      u = function (t, e, r) {
        if (!(e in s)) {
          for (var n = [], i = 0; i < e; i++) n[i] = "a[" + i + "]";
          s[e] = Function("C,a", "return new C(" + n.join(",") + ")");
        }
        return s[e](t, r);
      };
    t.exports =
      Function.bind ||
      function (t) {
        var e = n(this),
          r = o.call(arguments, 1),
          s = function () {
            var n = r.concat(o.call(arguments));
            return this instanceof s ? u(e, n.length, n) : e.apply(t, n);
          };
        return i(e.prototype) && (s.prototype = e.prototype), s;
      };
  },
  "057f": function (t, e, r) {
    var n = r("fc6a"),
      i = r("241c").f,
      o = {}.toString,
      s =
        "object" == typeof window && window && Object.getOwnPropertyNames
          ? Object.getOwnPropertyNames(window)
          : [],
      u = function (t) {
        try {
          return i(t);
        } catch (e) {
          return s.slice();
        }
      };
    t.exports.f = function (t) {
      return s && "[object Window]" == o.call(t) ? u(t) : i(n(t));
    };
  },
  "06cf": function (t, e, r) {
    var n = r("83ab"),
      i = r("d1e7"),
      o = r("5c6c"),
      s = r("fc6a"),
      u = r("c04e"),
      a = r("5135"),
      h = r("0cfb"),
      l = Object.getOwnPropertyDescriptor;
    e.f = n
      ? l
      : function (t, e) {
          if (((t = s(t)), (e = u(e, !0)), h))
            try {
              return l(t, e);
            } catch (r) {}
          if (a(t, e)) return o(!i.f.call(t, e), t[e]);
        };
  },
  "08c5": function (t, e, r) {
    var n = r("39d4").errors,
      i = r("8602").XMLHttpRequest,
      o = r("9490"),
      s = r("24f8"),
      u = function (t, e) {
        (e = e || {}),
          (this.withCredentials = e.withCredentials || !1),
          (this.timeout = e.timeout || 0),
          (this.headers = e.headers),
          (this.agent = e.agent),
          (this.connected = !1);
        var r = !0 === e.keepAlive || !1 !== e.keepAlive;
        (this.host = t || "http://localhost:8545"),
          this.agent ||
            ("https" === this.host.substring(0, 5)
              ? (this.httpsAgent = new s.Agent({ keepAlive: r }))
              : (this.httpAgent = new o.Agent({ keepAlive: r })));
      };
    (u.prototype._prepareRequest = function () {
      var t;
      if ("undefined" !== typeof XMLHttpRequest) t = new XMLHttpRequest();
      else {
        t = new i();
        var e = {
          httpsAgent: this.httpsAgent,
          httpAgent: this.httpAgent,
          baseUrl: this.baseUrl,
        };
        this.agent &&
          ((e.httpsAgent = this.agent.https),
          (e.httpAgent = this.agent.http),
          (e.baseUrl = this.agent.baseUrl)),
          t.nodejsSet(e);
      }
      return (
        t.open("POST", this.host, !0),
        t.setRequestHeader("Content-Type", "application/json"),
        (t.timeout = this.timeout),
        (t.withCredentials = this.withCredentials),
        this.headers &&
          this.headers.forEach(function (e) {
            t.setRequestHeader(e.name, e.value);
          }),
        t
      );
    }),
      (u.prototype.send = function (t, e) {
        var r = this,
          i = this._prepareRequest();
        (i.onreadystatechange = function () {
          if (4 === i.readyState && 1 !== i.timeout) {
            var t = i.responseText,
              o = null;
            try {
              t = JSON.parse(t);
            } catch (s) {
              o = n.InvalidResponse(i.responseText);
            }
            (r.connected = !0), e(o, t);
          }
        }),
          (i.ontimeout = function () {
            (r.connected = !1), e(n.ConnectionTimeout(this.timeout));
          });
        try {
          i.send(JSON.stringify(t));
        } catch (o) {
          (this.connected = !1), e(n.InvalidConnection(this.host));
        }
      }),
      (u.prototype.disconnect = function () {}),
      (u.prototype.supportsSubscriptions = function () {
        return !1;
      }),
      (t.exports = u);
  },
  "0b16": function (t, e, r) {
    "use strict";
    var n = r("1985"),
      i = r("35e8");
    function o() {
      (this.protocol = null),
        (this.slashes = null),
        (this.auth = null),
        (this.host = null),
        (this.port = null),
        (this.hostname = null),
        (this.hash = null),
        (this.search = null),
        (this.query = null),
        (this.pathname = null),
        (this.path = null),
        (this.href = null);
    }
    (e.parse = M),
      (e.resolve = x),
      (e.resolveObject = S),
      (e.format = _),
      (e.Url = o);
    var s = /^([a-z0-9.+-]+:)/i,
      u = /:[0-9]*$/,
      a = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
      h = ["<", ">", '"', "`", " ", "\r", "\n", "\t"],
      l = ["{", "}", "|", "\\", "^", "`"].concat(h),
      f = ["'"].concat(l),
      c = ["%", "/", "?", ";", "#"].concat(f),
      d = ["/", "?", "#"],
      p = 255,
      m = /^[+a-z0-9A-Z_-]{0,63}$/,
      v = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
      g = { javascript: !0, "javascript:": !0 },
      y = { javascript: !0, "javascript:": !0 },
      w = {
        http: !0,
        https: !0,
        ftp: !0,
        gopher: !0,
        file: !0,
        "http:": !0,
        "https:": !0,
        "ftp:": !0,
        "gopher:": !0,
        "file:": !0,
      },
      b = r("b383");
    function M(t, e, r) {
      if (t && i.isObject(t) && t instanceof o) return t;
      var n = new o();
      return n.parse(t, e, r), n;
    }
    function _(t) {
      return (
        i.isString(t) && (t = M(t)),
        t instanceof o ? t.format() : o.prototype.format.call(t)
      );
    }
    function x(t, e) {
      return M(t, !1, !0).resolve(e);
    }
    function S(t, e) {
      return t ? M(t, !1, !0).resolveObject(e) : e;
    }
    (o.prototype.parse = function (t, e, r) {
      if (!i.isString(t))
        throw new TypeError(
          "Parameter 'url' must be a string, not " + typeof t
        );
      var o = t.indexOf("?"),
        u = -1 !== o && o < t.indexOf("#") ? "?" : "#",
        h = t.split(u),
        l = /\\/g;
      (h[0] = h[0].replace(l, "/")), (t = h.join(u));
      var M = t;
      if (((M = M.trim()), !r && 1 === t.split("#").length)) {
        var _ = a.exec(M);
        if (_)
          return (
            (this.path = M),
            (this.href = M),
            (this.pathname = _[1]),
            _[2]
              ? ((this.search = _[2]),
                (this.query = e
                  ? b.parse(this.search.substr(1))
                  : this.search.substr(1)))
              : e && ((this.search = ""), (this.query = {})),
            this
          );
      }
      var x = s.exec(M);
      if (x) {
        x = x[0];
        var S = x.toLowerCase();
        (this.protocol = S), (M = M.substr(x.length));
      }
      if (r || x || M.match(/^\/\/[^@\/]+@[^@\/]+/)) {
        var E = "//" === M.substr(0, 2);
        !E || (x && y[x]) || ((M = M.substr(2)), (this.slashes = !0));
      }
      if (!y[x] && (E || (x && !w[x]))) {
        for (var A, k, O = -1, T = 0; T < d.length; T++) {
          var R = M.indexOf(d[T]);
          -1 !== R && (-1 === O || R < O) && (O = R);
        }
        (k = -1 === O ? M.lastIndexOf("@") : M.lastIndexOf("@", O)),
          -1 !== k &&
            ((A = M.slice(0, k)),
            (M = M.slice(k + 1)),
            (this.auth = decodeURIComponent(A))),
          (O = -1);
        for (T = 0; T < c.length; T++) {
          R = M.indexOf(c[T]);
          -1 !== R && (-1 === O || R < O) && (O = R);
        }
        -1 === O && (O = M.length),
          (this.host = M.slice(0, O)),
          (M = M.slice(O)),
          this.parseHost(),
          (this.hostname = this.hostname || "");
        var C =
          "[" === this.hostname[0] &&
          "]" === this.hostname[this.hostname.length - 1];
        if (!C)
          for (
            var j = this.hostname.split(/\./), N = ((T = 0), j.length);
            T < N;
            T++
          ) {
            var L = j[T];
            if (L && !L.match(m)) {
              for (var P = "", I = 0, B = L.length; I < B; I++)
                L.charCodeAt(I) > 127 ? (P += "x") : (P += L[I]);
              if (!P.match(m)) {
                var q = j.slice(0, T),
                  U = j.slice(T + 1),
                  H = L.match(v);
                H && (q.push(H[1]), U.unshift(H[2])),
                  U.length && (M = "/" + U.join(".") + M),
                  (this.hostname = q.join("."));
                break;
              }
            }
          }
        this.hostname.length > p
          ? (this.hostname = "")
          : (this.hostname = this.hostname.toLowerCase()),
          C || (this.hostname = n.toASCII(this.hostname));
        var D = this.port ? ":" + this.port : "",
          F = this.hostname || "";
        (this.host = F + D),
          (this.href += this.host),
          C &&
            ((this.hostname = this.hostname.substr(
              1,
              this.hostname.length - 2
            )),
            "/" !== M[0] && (M = "/" + M));
      }
      if (!g[S])
        for (T = 0, N = f.length; T < N; T++) {
          var z = f[T];
          if (-1 !== M.indexOf(z)) {
            var Z = encodeURIComponent(z);
            Z === z && (Z = escape(z)), (M = M.split(z).join(Z));
          }
        }
      var W = M.indexOf("#");
      -1 !== W && ((this.hash = M.substr(W)), (M = M.slice(0, W)));
      var G = M.indexOf("?");
      if (
        (-1 !== G
          ? ((this.search = M.substr(G)),
            (this.query = M.substr(G + 1)),
            e && (this.query = b.parse(this.query)),
            (M = M.slice(0, G)))
          : e && ((this.search = ""), (this.query = {})),
        M && (this.pathname = M),
        w[S] && this.hostname && !this.pathname && (this.pathname = "/"),
        this.pathname || this.search)
      ) {
        D = this.pathname || "";
        var Y = this.search || "";
        this.path = D + Y;
      }
      return (this.href = this.format()), this;
    }),
      (o.prototype.format = function () {
        var t = this.auth || "";
        t &&
          ((t = encodeURIComponent(t)),
          (t = t.replace(/%3A/i, ":")),
          (t += "@"));
        var e = this.protocol || "",
          r = this.pathname || "",
          n = this.hash || "",
          o = !1,
          s = "";
        this.host
          ? (o = t + this.host)
          : this.hostname &&
            ((o =
              t +
              (-1 === this.hostname.indexOf(":")
                ? this.hostname
                : "[" + this.hostname + "]")),
            this.port && (o += ":" + this.port)),
          this.query &&
            i.isObject(this.query) &&
            Object.keys(this.query).length &&
            (s = b.stringify(this.query));
        var u = this.search || (s && "?" + s) || "";
        return (
          e && ":" !== e.substr(-1) && (e += ":"),
          this.slashes || ((!e || w[e]) && !1 !== o)
            ? ((o = "//" + (o || "")),
              r && "/" !== r.charAt(0) && (r = "/" + r))
            : o || (o = ""),
          n && "#" !== n.charAt(0) && (n = "#" + n),
          u && "?" !== u.charAt(0) && (u = "?" + u),
          (r = r.replace(/[?#]/g, function (t) {
            return encodeURIComponent(t);
          })),
          (u = u.replace("#", "%23")),
          e + o + r + u + n
        );
      }),
      (o.prototype.resolve = function (t) {
        return this.resolveObject(M(t, !1, !0)).format();
      }),
      (o.prototype.resolveObject = function (t) {
        if (i.isString(t)) {
          var e = new o();
          e.parse(t, !1, !0), (t = e);
        }
        for (var r = new o(), n = Object.keys(this), s = 0; s < n.length; s++) {
          var u = n[s];
          r[u] = this[u];
        }
        if (((r.hash = t.hash), "" === t.href)) return (r.href = r.format()), r;
        if (t.slashes && !t.protocol) {
          for (var a = Object.keys(t), h = 0; h < a.length; h++) {
            var l = a[h];
            "protocol" !== l && (r[l] = t[l]);
          }
          return (
            w[r.protocol] &&
              r.hostname &&
              !r.pathname &&
              (r.path = r.pathname = "/"),
            (r.href = r.format()),
            r
          );
        }
        if (t.protocol && t.protocol !== r.protocol) {
          if (!w[t.protocol]) {
            for (var f = Object.keys(t), c = 0; c < f.length; c++) {
              var d = f[c];
              r[d] = t[d];
            }
            return (r.href = r.format()), r;
          }
          if (((r.protocol = t.protocol), t.host || y[t.protocol]))
            r.pathname = t.pathname;
          else {
            var p = (t.pathname || "").split("/");
            while (p.length && !(t.host = p.shift()));
            t.host || (t.host = ""),
              t.hostname || (t.hostname = ""),
              "" !== p[0] && p.unshift(""),
              p.length < 2 && p.unshift(""),
              (r.pathname = p.join("/"));
          }
          if (
            ((r.search = t.search),
            (r.query = t.query),
            (r.host = t.host || ""),
            (r.auth = t.auth),
            (r.hostname = t.hostname || t.host),
            (r.port = t.port),
            r.pathname || r.search)
          ) {
            var m = r.pathname || "",
              v = r.search || "";
            r.path = m + v;
          }
          return (r.slashes = r.slashes || t.slashes), (r.href = r.format()), r;
        }
        var g = r.pathname && "/" === r.pathname.charAt(0),
          b = t.host || (t.pathname && "/" === t.pathname.charAt(0)),
          M = b || g || (r.host && t.pathname),
          _ = M,
          x = (r.pathname && r.pathname.split("/")) || [],
          S =
            ((p = (t.pathname && t.pathname.split("/")) || []),
            r.protocol && !w[r.protocol]);
        if (
          (S &&
            ((r.hostname = ""),
            (r.port = null),
            r.host && ("" === x[0] ? (x[0] = r.host) : x.unshift(r.host)),
            (r.host = ""),
            t.protocol &&
              ((t.hostname = null),
              (t.port = null),
              t.host && ("" === p[0] ? (p[0] = t.host) : p.unshift(t.host)),
              (t.host = null)),
            (M = M && ("" === p[0] || "" === x[0]))),
          b)
        )
          (r.host = t.host || "" === t.host ? t.host : r.host),
            (r.hostname =
              t.hostname || "" === t.hostname ? t.hostname : r.hostname),
            (r.search = t.search),
            (r.query = t.query),
            (x = p);
        else if (p.length)
          x || (x = []),
            x.pop(),
            (x = x.concat(p)),
            (r.search = t.search),
            (r.query = t.query);
        else if (!i.isNullOrUndefined(t.search)) {
          if (S) {
            r.hostname = r.host = x.shift();
            var E = !!(r.host && r.host.indexOf("@") > 0) && r.host.split("@");
            E && ((r.auth = E.shift()), (r.host = r.hostname = E.shift()));
          }
          return (
            (r.search = t.search),
            (r.query = t.query),
            (i.isNull(r.pathname) && i.isNull(r.search)) ||
              (r.path =
                (r.pathname ? r.pathname : "") + (r.search ? r.search : "")),
            (r.href = r.format()),
            r
          );
        }
        if (!x.length)
          return (
            (r.pathname = null),
            r.search ? (r.path = "/" + r.search) : (r.path = null),
            (r.href = r.format()),
            r
          );
        for (
          var A = x.slice(-1)[0],
            k =
              ((r.host || t.host || x.length > 1) &&
                ("." === A || ".." === A)) ||
              "" === A,
            O = 0,
            T = x.length;
          T >= 0;
          T--
        )
          (A = x[T]),
            "." === A
              ? x.splice(T, 1)
              : ".." === A
              ? (x.splice(T, 1), O++)
              : O && (x.splice(T, 1), O--);
        if (!M && !_) for (; O--; O) x.unshift("..");
        !M || "" === x[0] || (x[0] && "/" === x[0].charAt(0)) || x.unshift(""),
          k && "/" !== x.join("/").substr(-1) && x.push("");
        var R = "" === x[0] || (x[0] && "/" === x[0].charAt(0));
        if (S) {
          r.hostname = r.host = R ? "" : x.length ? x.shift() : "";
          E = !!(r.host && r.host.indexOf("@") > 0) && r.host.split("@");
          E && ((r.auth = E.shift()), (r.host = r.hostname = E.shift()));
        }
        return (
          (M = M || (r.host && x.length)),
          M && !R && x.unshift(""),
          x.length
            ? (r.pathname = x.join("/"))
            : ((r.pathname = null), (r.path = null)),
          (i.isNull(r.pathname) && i.isNull(r.search)) ||
            (r.path =
              (r.pathname ? r.pathname : "") + (r.search ? r.search : "")),
          (r.auth = t.auth || r.auth),
          (r.slashes = r.slashes || t.slashes),
          (r.href = r.format()),
          r
        );
      }),
      (o.prototype.parseHost = function () {
        var t = this.host,
          e = u.exec(t);
        e &&
          ((e = e[0]),
          ":" !== e && (this.port = e.substr(1)),
          (t = t.substr(0, t.length - e.length))),
          t && (this.hostname = t);
      });
  },
  "0cfb": function (t, e, r) {
    var n = r("83ab"),
      i = r("d039"),
      o = r("cc12");
    t.exports =
      !n &&
      !i(function () {
        return (
          7 !=
          Object.defineProperty(o("div"), "a", {
            get: function () {
              return 7;
            },
          }).a
        );
      });
  },
  1: function (t, e) {},
  1131: function (t, e, r) {
    var n = r("17fb"),
      i = r("70c1"),
      o = r("e870"),
      s = r("2091"),
      u = r("11dc"),
      a = function (t, e, r, i, o) {
        return (
          !n.isObject(t) ||
            t instanceof Error ||
            !t.data ||
            ((n.isObject(t.data) || n.isArray(t.data)) &&
              (t.data = JSON.stringify(t.data, null, 2)),
            (t = t.message + "\n" + t.data)),
          n.isString(t) && (t = new Error(t)),
          n.isFunction(i) && i(t, o),
          n.isFunction(r) &&
            (((e && n.isFunction(e.listeners) && e.listeners("error").length) ||
              n.isFunction(i)) &&
              e.catch(function () {}),
            setTimeout(function () {
              r(t);
            }, 1)),
          e &&
            n.isFunction(e.emit) &&
            setTimeout(function () {
              e.emit("error", t, o), e.removeAllListeners();
            }, 1),
          e
        );
      },
      h = function (t) {
        return n.isObject(t) && t.name && -1 !== t.name.indexOf("(")
          ? t.name
          : t.name + "(" + l(!1, t.inputs).join(",") + ")";
      },
      l = function (t, e) {
        var r = [];
        return (
          e.forEach(function (e) {
            if ("object" === typeof e.components) {
              if ("tuple" !== e.type.substring(0, 5))
                throw new Error(
                  "components found but type is not tuple; report on GitHub"
                );
              var i = "",
                o = e.type.indexOf("[");
              o >= 0 && (i = e.type.substring(o));
              var s = l(t, e.components);
              n.isArray(s) && t
                ? r.push("tuple(" + s.join(",") + ")" + i)
                : t
                ? r.push("(" + s + ")")
                : r.push("(" + s.join(",") + ")" + i);
            } else r.push(e.type);
          }),
          r
        );
      },
      f = function (t) {
        return "0x" + u(t).toString("hex");
      },
      c = function (t) {
        if (!o.isHexStrict(t))
          throw new Error("The parameter must be a valid HEX string.");
        var e = "",
          r = 0,
          n = t.length;
        for ("0x" === t.substring(0, 2) && (r = 2); r < n; r += 2) {
          var i = parseInt(t.substr(r, 2), 16);
          e += String.fromCharCode(i);
        }
        return e;
      },
      d = function (t) {
        if (!t) return "0x00";
        for (var e = "", r = 0; r < t.length; r++) {
          var n = t.charCodeAt(r),
            i = n.toString(16);
          e += i.length < 2 ? "0" + i : i;
        }
        return "0x" + e;
      },
      p = function (t) {
        if (((t = t ? t.toLowerCase() : "ether"), !i.unitMap[t]))
          throw new Error(
            'This unit "' +
              t +
              "\" doesn't exist, please use the one of the following units" +
              JSON.stringify(i.unitMap, null, 2)
          );
        return t;
      },
      m = function (t, e) {
        if (((e = p(e)), !o.isBN(t) && !n.isString(t)))
          throw new Error(
            "Please pass numbers as strings or BN objects to avoid precision errors."
          );
        return o.isBN(t) ? i.fromWei(t, e) : i.fromWei(t, e).toString(10);
      },
      v = function (t, e) {
        if (((e = p(e)), !o.isBN(t) && !n.isString(t)))
          throw new Error(
            "Please pass numbers as strings or BN objects to avoid precision errors."
          );
        return o.isBN(t) ? i.toWei(t, e) : i.toWei(t, e).toString(10);
      },
      g = function (t) {
        if ("undefined" === typeof t) return "";
        if (!/^(0x)?[0-9a-f]{40}$/i.test(t))
          throw new Error(
            'Given address "' + t + '" is not a valid Ethereum address.'
          );
        t = t.toLowerCase().replace(/^0x/i, "");
        for (
          var e = o.sha3(t).replace(/^0x/i, ""), r = "0x", n = 0;
          n < t.length;
          n++
        )
          parseInt(e[n], 16) > 7 ? (r += t[n].toUpperCase()) : (r += t[n]);
        return r;
      };
    t.exports = {
      _fireError: a,
      _jsonInterfaceMethodToString: h,
      _flattenTypes: l,
      randomHex: f,
      _: n,
      BN: o.BN,
      isBN: o.isBN,
      isBigNumber: o.isBigNumber,
      isHex: o.isHex,
      isHexStrict: o.isHexStrict,
      sha3: o.sha3,
      sha3Raw: o.sha3Raw,
      keccak256: o.sha3,
      soliditySha3: s.soliditySha3,
      soliditySha3Raw: s.soliditySha3Raw,
      isAddress: o.isAddress,
      checkAddressChecksum: o.checkAddressChecksum,
      toChecksumAddress: g,
      toHex: o.toHex,
      toBN: o.toBN,
      bytesToHex: o.bytesToHex,
      hexToBytes: o.hexToBytes,
      hexToNumberString: o.hexToNumberString,
      hexToNumber: o.hexToNumber,
      toDecimal: o.hexToNumber,
      numberToHex: o.numberToHex,
      fromDecimal: o.numberToHex,
      hexToUtf8: o.hexToUtf8,
      hexToString: o.hexToUtf8,
      toUtf8: o.hexToUtf8,
      utf8ToHex: o.utf8ToHex,
      stringToHex: o.utf8ToHex,
      fromUtf8: o.utf8ToHex,
      hexToAscii: c,
      toAscii: c,
      asciiToHex: d,
      fromAscii: d,
      unitMap: i.unitMap,
      toWei: v,
      fromWei: m,
      padLeft: o.leftPad,
      leftPad: o.leftPad,
      padRight: o.rightPad,
      rightPad: o.rightPad,
      toTwosComplement: o.toTwosComplement,
      isBloom: o.isBloom,
      isUserEthereumAddressInBloom: o.isUserEthereumAddressInBloom,
      isContractAddressInBloom: o.isContractAddressInBloom,
      isTopic: o.isTopic,
      isTopicInBloom: o.isTopicInBloom,
      isInBloom: o.isInBloom,
    };
  },
  "11dc": function (t, e, r) {
    "use strict";
    (function (e, n) {
      var i = 65536,
        o = 4294967295;
      function s() {
        throw new Error(
          "Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11"
        );
      }
      var u = r("8707").Buffer,
        a = e.crypto || e.msCrypto;
      function h(t, e) {
        if (t > o) throw new RangeError("requested too many random bytes");
        var r = u.allocUnsafe(t);
        if (t > 0)
          if (t > i)
            for (var s = 0; s < t; s += i) a.getRandomValues(r.slice(s, s + i));
          else a.getRandomValues(r);
        return "function" === typeof e
          ? n.nextTick(function () {
              e(null, r);
            })
          : r;
      }
      a && a.getRandomValues ? (t.exports = h) : (t.exports = s);
    }.call(this, r("c8ba"), r("2820")));
  },
  "131a": function (t, e, r) {
    var n = r("23e7"),
      i = r("d2bb");
    n({ target: "Object", stat: !0 }, { setPrototypeOf: i });
  },
  1455: function (t, e, r) {
    "use strict";
    Object.defineProperty(e, "__esModule", { value: !0 });
    const n = r("509b");
    function i(t) {
      return (
        "string" === typeof t &&
        !!/^(0x)?[0-9a-f]{512}$/i.test(t) &&
        !(!/^(0x)?[0-9a-f]{512}$/.test(t) && !/^(0x)?[0-9A-F]{512}$/.test(t))
      );
    }
    function o(t, e) {
      "object" === typeof e &&
        e.constructor === Uint8Array &&
        (e = n.bytesToHex(e));
      const r = n.keccak256(e).replace("0x", "");
      for (let n = 0; n < 12; n += 4) {
        const e =
            ((parseInt(r.substr(n, 2), 16) << 8) +
              parseInt(r.substr(n + 2, 2), 16)) &
            2047,
          i = s(t.charCodeAt(t.length - 1 - Math.floor(e / 4))),
          o = 1 << e % 4;
        if ((i & o) !== o) return !1;
      }
      return !0;
    }
    function s(t) {
      if (t >= 48 && t <= 57) return t - 48;
      if (t >= 65 && t <= 70) return t - 55;
      if (t >= 97 && t <= 102) return t - 87;
      throw new Error("invalid bloom");
    }
    function u(t, e) {
      if (!i(t)) throw new Error("Invalid bloom given");
      if (!f(e)) throw new Error(`Invalid ethereum address given: "${e}"`);
      const r = n.padLeft(e, 64);
      return o(t, r);
    }
    function a(t, e) {
      if (!i(t)) throw new Error("Invalid bloom given");
      if (!f(e)) throw new Error(`Invalid contract address given: "${e}"`);
      return o(t, e);
    }
    function h(t, e) {
      if (!i(t)) throw new Error("Invalid bloom given");
      if (!l(e)) throw new Error("Invalid topic");
      return o(t, e);
    }
    function l(t) {
      return (
        "string" === typeof t &&
        !!/^(0x)?[0-9a-f]{64}$/i.test(t) &&
        !(!/^(0x)?[0-9a-f]{64}$/.test(t) && !/^(0x)?[0-9A-F]{64}$/.test(t))
      );
    }
    function f(t) {
      return (
        "string" === typeof t &&
        (!!t.match(/^(0x)?[0-9a-fA-F]{40}$/) ||
          !!t.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/))
      );
    }
    (e.isBloom = i),
      (e.isInBloom = o),
      (e.isUserEthereumAddressInBloom = u),
      (e.isContractAddressInBloom = a),
      (e.isTopicInBloom = h),
      (e.isTopic = l),
      (e.isAddress = f);
  },
  "14c3": function (t, e, r) {
    var n = r("c6b6"),
      i = r("92631");
    t.exports = function (t, e) {
      var r = t.exec;
      if ("function" === typeof r) {
        var o = r.call(t, e);
        if ("object" !== typeof o)
          throw TypeError(
            "RegExp exec method returned something other than an Object or null"
          );
        return o;
      }
      if ("RegExp" !== n(t))
        throw TypeError("RegExp#exec called on incompatible receiver");
      return i.call(t, e);
    };
  },
  1572: function (t, e, r) {
    "use strict";
    r("f4ddb"), r("d3b7");
    var n = r("d4ec"),
      i = r("bee2"),
      o = (function () {
        function t() {
          Object(n["a"])(this, t), (this.middlewares = []);
        }
        return (
          Object(i["a"])(t, [
            {
              key: "use",
              value: function (t) {
                this.middlewares.push(t);
              },
            },
            {
              key: "executeMiddleware",
              value: function (t, e, r) {
                this.middlewares.reduceRight(function (r, n) {
                  return function () {
                    return n(t, e, r);
                  };
                }, r)(t, e);
              },
            },
            {
              key: "run",
              value: function (t, e) {
                var r = this;
                return new Promise(function (n) {
                  r.executeMiddleware(t, e, n);
                });
              },
            },
          ]),
          t
        );
      })();
    e["a"] = o;
  },
  1715: function (t, e, r) {
    "use strict";
    var n = r("966d"),
      i =
        Object.keys ||
        function (t) {
          var e = [];
          for (var r in t) e.push(r);
          return e;
        };
    t.exports = f;
    var o = Object.create(r("3a7c"));
    o.inherits = r("3fb5");
    var s = r("8b77"),
      u = r("5bc2");
    o.inherits(f, s);
    for (var a = i(u.prototype), h = 0; h < a.length; h++) {
      var l = a[h];
      f.prototype[l] || (f.prototype[l] = u.prototype[l]);
    }
    function f(t) {
      if (!(this instanceof f)) return new f(t);
      s.call(this, t),
        u.call(this, t),
        t && !1 === t.readable && (this.readable = !1),
        t && !1 === t.writable && (this.writable = !1),
        (this.allowHalfOpen = !0),
        t && !1 === t.allowHalfOpen && (this.allowHalfOpen = !1),
        this.once("end", c);
    }
    function c() {
      this.allowHalfOpen || this._writableState.ended || n.nextTick(d, this);
    }
    function d(t) {
      t.end();
    }
    Object.defineProperty(f.prototype, "writableHighWaterMark", {
      enumerable: !1,
      get: function () {
        return this._writableState.highWaterMark;
      },
    }),
      Object.defineProperty(f.prototype, "destroyed", {
        get: function () {
          return (
            void 0 !== this._readableState &&
            void 0 !== this._writableState &&
            this._readableState.destroyed &&
            this._writableState.destroyed
          );
        },
        set: function (t) {
          void 0 !== this._readableState &&
            void 0 !== this._writableState &&
            ((this._readableState.destroyed = t),
            (this._writableState.destroyed = t));
        },
      }),
      (f.prototype._destroy = function (t, e) {
        this.push(null), this.end(), n.nextTick(e, t);
      });
  },
  "175f": function (t, e, r) {
    "use strict";
    var n = r("17fb"),
      i = r("1131"),
      o = r("1fc6"),
      s = function (t) {
        return t.map(i.numberToHex);
      },
      u = function (t) {
        return (
          (t.address = i.toChecksumAddress(t.address)),
          (t.nonce = i.hexToNumberString(t.nonce)),
          (t.balance = i.hexToNumberString(t.balance)),
          t
        );
      },
      a = function (t) {
        return i.toBN(t).toString(10);
      },
      h = function (t) {
        return "latest" === t || "pending" === t || "earliest" === t;
      },
      l = function (t) {
        return f(!this || (void 0 !== t && null !== t) ? t : this.defaultBlock);
      },
      f = function (t) {
        if (void 0 !== t)
          return h(t)
            ? t
            : "genesis" === t
            ? "0x0"
            : i.isHexStrict(t)
            ? n.isString(t)
              ? t.toLowerCase()
              : t
            : i.numberToHex(t);
      },
      c = function (t) {
        if ((t.to && (t.to = x(t.to)), t.data && t.input))
          throw new Error(
            'You can\'t have "data" and "input" as properties of transactions at the same time, please use either "data" or "input" instead.'
          );
        if (
          (!t.data && t.input && ((t.data = t.input), delete t.input),
          t.data && !i.isHex(t.data))
        )
          throw new Error("The data field must be HEX encoded data.");
        return (
          (t.gas || t.gasLimit) && (t.gas = t.gas || t.gasLimit),
          ["gasPrice", "gas", "value", "nonce"]
            .filter(function (e) {
              return void 0 !== t[e];
            })
            .forEach(function (e) {
              t[e] = i.numberToHex(t[e]);
            }),
          t
        );
      },
      d = function (t) {
        t = c(t);
        var e = t.from || (this ? this.defaultAccount : null);
        return e && (t.from = x(e)), t;
      },
      p = function (t) {
        if (((t = c(t)), !n.isNumber(t.from) && !n.isObject(t.from))) {
          if (
            ((t.from = t.from || (this ? this.defaultAccount : null)),
            !t.from && !n.isNumber(t.from))
          )
            throw new Error(
              'The send transactions "from" field must be defined!'
            );
          t.from = x(t.from);
        }
        return t;
      },
      m = function (t) {
        return i.isHexStrict(t) ? t : i.utf8ToHex(t);
      },
      v = function (t) {
        return (
          null !== t.blockNumber &&
            (t.blockNumber = i.hexToNumber(t.blockNumber)),
          null !== t.transactionIndex &&
            (t.transactionIndex = i.hexToNumber(t.transactionIndex)),
          (t.nonce = i.hexToNumber(t.nonce)),
          (t.gas = i.hexToNumber(t.gas)),
          (t.gasPrice = a(t.gasPrice)),
          (t.value = a(t.value)),
          t.to && i.isAddress(t.to)
            ? (t.to = i.toChecksumAddress(t.to))
            : (t.to = null),
          t.from && (t.from = i.toChecksumAddress(t.from)),
          t
        );
      },
      g = function (t) {
        if ("object" !== typeof t)
          throw new Error("Received receipt is invalid: " + t);
        return (
          null !== t.blockNumber &&
            (t.blockNumber = i.hexToNumber(t.blockNumber)),
          null !== t.transactionIndex &&
            (t.transactionIndex = i.hexToNumber(t.transactionIndex)),
          (t.cumulativeGasUsed = i.hexToNumber(t.cumulativeGasUsed)),
          (t.gasUsed = i.hexToNumber(t.gasUsed)),
          n.isArray(t.logs) && (t.logs = t.logs.map(b)),
          t.contractAddress &&
            (t.contractAddress = i.toChecksumAddress(t.contractAddress)),
          "undefined" !== typeof t.status &&
            null !== t.status &&
            (t.status = Boolean(parseInt(t.status))),
          t
        );
      },
      y = function (t) {
        return (
          (t.gasLimit = i.hexToNumber(t.gasLimit)),
          (t.gasUsed = i.hexToNumber(t.gasUsed)),
          (t.size = i.hexToNumber(t.size)),
          (t.timestamp = i.hexToNumber(t.timestamp)),
          null !== t.number && (t.number = i.hexToNumber(t.number)),
          t.difficulty && (t.difficulty = a(t.difficulty)),
          t.totalDifficulty && (t.totalDifficulty = a(t.totalDifficulty)),
          n.isArray(t.transactions) &&
            t.transactions.forEach(function (t) {
              if (!n.isString(t)) return v(t);
            }),
          t.miner && (t.miner = i.toChecksumAddress(t.miner)),
          t
        );
      },
      w = function (t) {
        var e = function (t) {
          return null === t || "undefined" === typeof t
            ? null
            : ((t = String(t)), 0 === t.indexOf("0x") ? t : i.fromUtf8(t));
        };
        return (
          (t.fromBlock || 0 === t.fromBlock) && (t.fromBlock = f(t.fromBlock)),
          (t.toBlock || 0 === t.toBlock) && (t.toBlock = f(t.toBlock)),
          (t.topics = t.topics || []),
          (t.topics = t.topics.map(function (t) {
            return n.isArray(t) ? t.map(e) : e(t);
          })),
          (e = null),
          t.address &&
            (t.address = n.isArray(t.address)
              ? t.address.map(function (t) {
                  return x(t);
                })
              : x(t.address)),
          t
        );
      },
      b = function (t) {
        if (
          "string" === typeof t.blockHash &&
          "string" === typeof t.transactionHash &&
          "string" === typeof t.logIndex
        ) {
          var e = i.sha3(
            t.blockHash.replace("0x", "") +
              t.transactionHash.replace("0x", "") +
              t.logIndex.replace("0x", "")
          );
          t.id = "log_" + e.replace("0x", "").substr(0, 8);
        } else t.id || (t.id = null);
        return (
          null !== t.blockNumber &&
            (t.blockNumber = i.hexToNumber(t.blockNumber)),
          null !== t.transactionIndex &&
            (t.transactionIndex = i.hexToNumber(t.transactionIndex)),
          null !== t.logIndex && (t.logIndex = i.hexToNumber(t.logIndex)),
          t.address && (t.address = i.toChecksumAddress(t.address)),
          t
        );
      },
      M = function (t) {
        return (
          t.ttl && (t.ttl = i.numberToHex(t.ttl)),
          t.workToProve && (t.workToProve = i.numberToHex(t.workToProve)),
          t.priority && (t.priority = i.numberToHex(t.priority)),
          n.isArray(t.topics) || (t.topics = t.topics ? [t.topics] : []),
          (t.topics = t.topics.map(function (t) {
            return 0 === t.indexOf("0x") ? t : i.fromUtf8(t);
          })),
          t
        );
      },
      _ = function (t) {
        return (
          (t.expiry = i.hexToNumber(t.expiry)),
          (t.sent = i.hexToNumber(t.sent)),
          (t.ttl = i.hexToNumber(t.ttl)),
          (t.workProved = i.hexToNumber(t.workProved)),
          t.topics || (t.topics = []),
          (t.topics = t.topics.map(function (t) {
            return i.toUtf8(t);
          })),
          t
        );
      },
      x = function (t) {
        var e = new o(t);
        if (e.isValid() && e.isDirect()) return e.toAddress().toLowerCase();
        if (i.isAddress(t)) return "0x" + t.toLowerCase().replace("0x", "");
        throw new Error(
          'Provided address "' +
            t +
            "\" is invalid, the capitalization checksum test failed, or its an indrect IBAN address which can't be converted."
        );
      },
      S = function (t) {
        return (
          (t.startingBlock = i.hexToNumber(t.startingBlock)),
          (t.currentBlock = i.hexToNumber(t.currentBlock)),
          (t.highestBlock = i.hexToNumber(t.highestBlock)),
          t.knownStates &&
            ((t.knownStates = i.hexToNumber(t.knownStates)),
            (t.pulledStates = i.hexToNumber(t.pulledStates))),
          t
        );
      };
    t.exports = {
      inputDefaultBlockNumberFormatter: l,
      inputBlockNumberFormatter: f,
      inputCallFormatter: d,
      inputTransactionFormatter: p,
      inputAddressFormatter: x,
      inputPostFormatter: M,
      inputLogFormatter: w,
      inputSignFormatter: m,
      inputStorageKeysFormatter: s,
      outputProofFormatter: u,
      outputBigNumberFormatter: a,
      outputTransactionFormatter: v,
      outputTransactionReceiptFormatter: g,
      outputBlockFormatter: y,
      outputLogFormatter: b,
      outputPostFormatter: _,
      outputSyncingFormatter: S,
    };
  },
  "176c": function (t, e, r) {
    "use strict";
    var n = r("17fb"),
      i = r("39d4").errors,
      o = r("636c"),
      s = r("58ab"),
      u = r("ef84"),
      a = function t(e, r) {
        (this.provider = null),
          (this.providers = t.providers),
          this.setProvider(e, r),
          (this.subscriptions = new Map());
      };
    (a.givenProvider = u),
      (a.providers = {
        WebsocketProvider: r("0066"),
        HttpProvider: r("08c5"),
        IpcProvider: r("39d3"),
      }),
      (a.prototype.setProvider = function (t, e) {
        var r = this;
        if (t && "string" === typeof t && this.providers)
          if (/^http(s)?:\/\//i.test(t)) t = new this.providers.HttpProvider(t);
          else if (/^ws(s)?:\/\//i.test(t))
            t = new this.providers.WebsocketProvider(t);
          else if (
            t &&
            "object" === typeof e &&
            "function" === typeof e.connect
          )
            t = new this.providers.IpcProvider(t, e);
          else if (t)
            throw new Error("Can't autodetect provider for \"" + t + '"');
        this.provider && this.provider.connected && this.clearSubscriptions(),
          (this.provider = t || null),
          this.provider &&
            this.provider.on &&
            (this.provider.on("data", function (t, e) {
              (t = t || e),
                t.method &&
                  r.subscriptions.has(t.params.subscription) &&
                  r.subscriptions
                    .get(t.params.subscription)
                    .callback(null, t.params.result);
            }),
            this.provider.on("connect", function () {
              r.subscriptions.forEach(function (t) {
                t.subscription.resubscribe();
              });
            }),
            this.provider.on("error", function (t) {
              r.subscriptions.forEach(function (e) {
                e.callback(t);
              });
            }),
            this.provider.on("close", function (t) {
              (r._isCleanCloseEvent(t) && !r._isIpcCloseError(t)) ||
                r.subscriptions.forEach(function (e) {
                  e.callback(i.ConnectionCloseError(t)),
                    r.subscriptions.delete(e.subscription.id);
                });
            }));
      }),
      (a.prototype.send = function (t, e) {
        if (((e = e || function () {}), !this.provider))
          return e(i.InvalidProvider());
        var r = o.toPayload(t.method, t.params);
        this.provider[this.provider.sendAsync ? "sendAsync" : "send"](
          r,
          function (t, n) {
            return n && n.id && r.id !== n.id
              ? e(
                  new Error(
                    'Wrong response id "' +
                      n.id +
                      '" (expected: "' +
                      r.id +
                      '") in ' +
                      JSON.stringify(r)
                  )
                )
              : t
              ? e(t)
              : n && n.error
              ? e(i.ErrorResponse(n))
              : o.isValidResponse(n)
              ? void e(null, n.result)
              : e(i.InvalidResponse(n));
          }
        );
      }),
      (a.prototype.sendBatch = function (t, e) {
        if (!this.provider) return e(i.InvalidProvider());
        var r = o.toBatchPayload(t);
        this.provider[this.provider.sendAsync ? "sendAsync" : "send"](
          r,
          function (t, r) {
            return t
              ? e(t)
              : n.isArray(r)
              ? void e(null, r)
              : e(i.InvalidResponse(r));
          }
        );
      }),
      (a.prototype.addSubscription = function (t, e) {
        if (!this.provider.on)
          throw new Error(
            "The provider doesn't support subscriptions: " +
              this.provider.constructor.name
          );
        this.subscriptions.set(t.id, { callback: e, subscription: t });
      }),
      (a.prototype.removeSubscription = function (t, e) {
        if (this.subscriptions.has(t)) {
          var r = this.subscriptions.get(t).subscription.options.type;
          return (
            this.subscriptions.delete(t),
            void this.send({ method: r + "_unsubscribe", params: [t] }, e)
          );
        }
        "function" === typeof e && e(null);
      }),
      (a.prototype.clearSubscriptions = function (t) {
        var e = this;
        this.subscriptions.size > 0 &&
          this.subscriptions.forEach(function (r, n) {
            (t && "syncing" === r.name) || e.removeSubscription(n);
          }),
          this.provider.reset && this.provider.reset();
      }),
      (a.prototype._isCleanCloseEvent = function (t) {
        return (
          "object" === typeof t && ([1e3].includes(t.code) || !0 === t.wasClean)
        );
      }),
      (a.prototype._isIpcCloseError = function (t) {
        return "boolean" === typeof t && t;
      }),
      (t.exports = { Manager: a, BatchManager: s });
  },
  "17fb": function (t, e, r) {
    (function (t, r) {
      var n, i;
      (function () {
        var o =
            ("object" == typeof self && self.self === self && self) ||
            ("object" == typeof t && t.global === t && t) ||
            this ||
            {},
          s = o._,
          u = Array.prototype,
          a = Object.prototype,
          h = "undefined" !== typeof Symbol ? Symbol.prototype : null,
          l = u.push,
          f = u.slice,
          c = a.toString,
          d = a.hasOwnProperty,
          p = Array.isArray,
          m = Object.keys,
          v = Object.create,
          g = function () {},
          y = function (t) {
            return t instanceof y
              ? t
              : this instanceof y
              ? void (this._wrapped = t)
              : new y(t);
          };
        e.nodeType
          ? (o._ = y)
          : (!r.nodeType && r.exports && (e = r.exports = y), (e._ = y)),
          (y.VERSION = "1.9.1");
        var w,
          b = function (t, e, r) {
            if (void 0 === e) return t;
            switch (null == r ? 3 : r) {
              case 1:
                return function (r) {
                  return t.call(e, r);
                };
              case 3:
                return function (r, n, i) {
                  return t.call(e, r, n, i);
                };
              case 4:
                return function (r, n, i, o) {
                  return t.call(e, r, n, i, o);
                };
            }
            return function () {
              return t.apply(e, arguments);
            };
          },
          M = function (t, e, r) {
            return y.iteratee !== w
              ? y.iteratee(t, e)
              : null == t
              ? y.identity
              : y.isFunction(t)
              ? b(t, e, r)
              : y.isObject(t) && !y.isArray(t)
              ? y.matcher(t)
              : y.property(t);
          };
        y.iteratee = w = function (t, e) {
          return M(t, e, 1 / 0);
        };
        var _ = function (t, e) {
            return (
              (e = null == e ? t.length - 1 : +e),
              function () {
                for (
                  var r = Math.max(arguments.length - e, 0),
                    n = Array(r),
                    i = 0;
                  i < r;
                  i++
                )
                  n[i] = arguments[i + e];
                switch (e) {
                  case 0:
                    return t.call(this, n);
                  case 1:
                    return t.call(this, arguments[0], n);
                  case 2:
                    return t.call(this, arguments[0], arguments[1], n);
                }
                var o = Array(e + 1);
                for (i = 0; i < e; i++) o[i] = arguments[i];
                return (o[e] = n), t.apply(this, o);
              }
            );
          },
          x = function (t) {
            if (!y.isObject(t)) return {};
            if (v) return v(t);
            g.prototype = t;
            var e = new g();
            return (g.prototype = null), e;
          },
          S = function (t) {
            return function (e) {
              return null == e ? void 0 : e[t];
            };
          },
          E = function (t, e) {
            return null != t && d.call(t, e);
          },
          A = function (t, e) {
            for (var r = e.length, n = 0; n < r; n++) {
              if (null == t) return;
              t = t[e[n]];
            }
            return r ? t : void 0;
          },
          k = Math.pow(2, 53) - 1,
          O = S("length"),
          T = function (t) {
            var e = O(t);
            return "number" == typeof e && e >= 0 && e <= k;
          };
        (y.each = y.forEach =
          function (t, e, r) {
            var n, i;
            if (((e = b(e, r)), T(t)))
              for (n = 0, i = t.length; n < i; n++) e(t[n], n, t);
            else {
              var o = y.keys(t);
              for (n = 0, i = o.length; n < i; n++) e(t[o[n]], o[n], t);
            }
            return t;
          }),
          (y.map = y.collect =
            function (t, e, r) {
              e = M(e, r);
              for (
                var n = !T(t) && y.keys(t),
                  i = (n || t).length,
                  o = Array(i),
                  s = 0;
                s < i;
                s++
              ) {
                var u = n ? n[s] : s;
                o[s] = e(t[u], u, t);
              }
              return o;
            });
        var R = function (t) {
          var e = function (e, r, n, i) {
            var o = !T(e) && y.keys(e),
              s = (o || e).length,
              u = t > 0 ? 0 : s - 1;
            for (
              i || ((n = e[o ? o[u] : u]), (u += t));
              u >= 0 && u < s;
              u += t
            ) {
              var a = o ? o[u] : u;
              n = r(n, e[a], a, e);
            }
            return n;
          };
          return function (t, r, n, i) {
            var o = arguments.length >= 3;
            return e(t, b(r, i, 4), n, o);
          };
        };
        (y.reduce = y.foldl = y.inject = R(1)),
          (y.reduceRight = y.foldr = R(-1)),
          (y.find = y.detect =
            function (t, e, r) {
              var n = T(t) ? y.findIndex : y.findKey,
                i = n(t, e, r);
              if (void 0 !== i && -1 !== i) return t[i];
            }),
          (y.filter = y.select =
            function (t, e, r) {
              var n = [];
              return (
                (e = M(e, r)),
                y.each(t, function (t, r, i) {
                  e(t, r, i) && n.push(t);
                }),
                n
              );
            }),
          (y.reject = function (t, e, r) {
            return y.filter(t, y.negate(M(e)), r);
          }),
          (y.every = y.all =
            function (t, e, r) {
              e = M(e, r);
              for (
                var n = !T(t) && y.keys(t), i = (n || t).length, o = 0;
                o < i;
                o++
              ) {
                var s = n ? n[o] : o;
                if (!e(t[s], s, t)) return !1;
              }
              return !0;
            }),
          (y.some = y.any =
            function (t, e, r) {
              e = M(e, r);
              for (
                var n = !T(t) && y.keys(t), i = (n || t).length, o = 0;
                o < i;
                o++
              ) {
                var s = n ? n[o] : o;
                if (e(t[s], s, t)) return !0;
              }
              return !1;
            }),
          (y.contains =
            y.includes =
            y.include =
              function (t, e, r, n) {
                return (
                  T(t) || (t = y.values(t)),
                  ("number" != typeof r || n) && (r = 0),
                  y.indexOf(t, e, r) >= 0
                );
              }),
          (y.invoke = _(function (t, e, r) {
            var n, i;
            return (
              y.isFunction(e)
                ? (i = e)
                : y.isArray(e) && ((n = e.slice(0, -1)), (e = e[e.length - 1])),
              y.map(t, function (t) {
                var o = i;
                if (!o) {
                  if ((n && n.length && (t = A(t, n)), null == t)) return;
                  o = t[e];
                }
                return null == o ? o : o.apply(t, r);
              })
            );
          })),
          (y.pluck = function (t, e) {
            return y.map(t, y.property(e));
          }),
          (y.where = function (t, e) {
            return y.filter(t, y.matcher(e));
          }),
          (y.findWhere = function (t, e) {
            return y.find(t, y.matcher(e));
          }),
          (y.max = function (t, e, r) {
            var n,
              i,
              o = -1 / 0,
              s = -1 / 0;
            if (
              null == e ||
              ("number" == typeof e && "object" != typeof t[0] && null != t)
            ) {
              t = T(t) ? t : y.values(t);
              for (var u = 0, a = t.length; u < a; u++)
                (n = t[u]), null != n && n > o && (o = n);
            } else
              (e = M(e, r)),
                y.each(t, function (t, r, n) {
                  (i = e(t, r, n)),
                    (i > s || (i === -1 / 0 && o === -1 / 0)) &&
                      ((o = t), (s = i));
                });
            return o;
          }),
          (y.min = function (t, e, r) {
            var n,
              i,
              o = 1 / 0,
              s = 1 / 0;
            if (
              null == e ||
              ("number" == typeof e && "object" != typeof t[0] && null != t)
            ) {
              t = T(t) ? t : y.values(t);
              for (var u = 0, a = t.length; u < a; u++)
                (n = t[u]), null != n && n < o && (o = n);
            } else
              (e = M(e, r)),
                y.each(t, function (t, r, n) {
                  (i = e(t, r, n)),
                    (i < s || (i === 1 / 0 && o === 1 / 0)) &&
                      ((o = t), (s = i));
                });
            return o;
          }),
          (y.shuffle = function (t) {
            return y.sample(t, 1 / 0);
          }),
          (y.sample = function (t, e, r) {
            if (null == e || r)
              return T(t) || (t = y.values(t)), t[y.random(t.length - 1)];
            var n = T(t) ? y.clone(t) : y.values(t),
              i = O(n);
            e = Math.max(Math.min(e, i), 0);
            for (var o = i - 1, s = 0; s < e; s++) {
              var u = y.random(s, o),
                a = n[s];
              (n[s] = n[u]), (n[u] = a);
            }
            return n.slice(0, e);
          }),
          (y.sortBy = function (t, e, r) {
            var n = 0;
            return (
              (e = M(e, r)),
              y.pluck(
                y
                  .map(t, function (t, r, i) {
                    return { value: t, index: n++, criteria: e(t, r, i) };
                  })
                  .sort(function (t, e) {
                    var r = t.criteria,
                      n = e.criteria;
                    if (r !== n) {
                      if (r > n || void 0 === r) return 1;
                      if (r < n || void 0 === n) return -1;
                    }
                    return t.index - e.index;
                  }),
                "value"
              )
            );
          });
        var C = function (t, e) {
          return function (r, n, i) {
            var o = e ? [[], []] : {};
            return (
              (n = M(n, i)),
              y.each(r, function (e, i) {
                var s = n(e, i, r);
                t(o, e, s);
              }),
              o
            );
          };
        };
        (y.groupBy = C(function (t, e, r) {
          E(t, r) ? t[r].push(e) : (t[r] = [e]);
        })),
          (y.indexBy = C(function (t, e, r) {
            t[r] = e;
          })),
          (y.countBy = C(function (t, e, r) {
            E(t, r) ? t[r]++ : (t[r] = 1);
          }));
        var j =
          /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
        (y.toArray = function (t) {
          return t
            ? y.isArray(t)
              ? f.call(t)
              : y.isString(t)
              ? t.match(j)
              : T(t)
              ? y.map(t, y.identity)
              : y.values(t)
            : [];
        }),
          (y.size = function (t) {
            return null == t ? 0 : T(t) ? t.length : y.keys(t).length;
          }),
          (y.partition = C(function (t, e, r) {
            t[r ? 0 : 1].push(e);
          }, !0)),
          (y.first =
            y.head =
            y.take =
              function (t, e, r) {
                return null == t || t.length < 1
                  ? null == e
                    ? void 0
                    : []
                  : null == e || r
                  ? t[0]
                  : y.initial(t, t.length - e);
              }),
          (y.initial = function (t, e, r) {
            return f.call(
              t,
              0,
              Math.max(0, t.length - (null == e || r ? 1 : e))
            );
          }),
          (y.last = function (t, e, r) {
            return null == t || t.length < 1
              ? null == e
                ? void 0
                : []
              : null == e || r
              ? t[t.length - 1]
              : y.rest(t, Math.max(0, t.length - e));
          }),
          (y.rest =
            y.tail =
            y.drop =
              function (t, e, r) {
                return f.call(t, null == e || r ? 1 : e);
              }),
          (y.compact = function (t) {
            return y.filter(t, Boolean);
          });
        var N = function (t, e, r, n) {
          n = n || [];
          for (var i = n.length, o = 0, s = O(t); o < s; o++) {
            var u = t[o];
            if (T(u) && (y.isArray(u) || y.isArguments(u)))
              if (e) {
                var a = 0,
                  h = u.length;
                while (a < h) n[i++] = u[a++];
              } else N(u, e, r, n), (i = n.length);
            else r || (n[i++] = u);
          }
          return n;
        };
        (y.flatten = function (t, e) {
          return N(t, e, !1);
        }),
          (y.without = _(function (t, e) {
            return y.difference(t, e);
          })),
          (y.uniq = y.unique =
            function (t, e, r, n) {
              y.isBoolean(e) || ((n = r), (r = e), (e = !1)),
                null != r && (r = M(r, n));
              for (var i = [], o = [], s = 0, u = O(t); s < u; s++) {
                var a = t[s],
                  h = r ? r(a, s, t) : a;
                e && !r
                  ? ((s && o === h) || i.push(a), (o = h))
                  : r
                  ? y.contains(o, h) || (o.push(h), i.push(a))
                  : y.contains(i, a) || i.push(a);
              }
              return i;
            }),
          (y.union = _(function (t) {
            return y.uniq(N(t, !0, !0));
          })),
          (y.intersection = function (t) {
            for (
              var e = [], r = arguments.length, n = 0, i = O(t);
              n < i;
              n++
            ) {
              var o = t[n];
              if (!y.contains(e, o)) {
                var s;
                for (s = 1; s < r; s++) if (!y.contains(arguments[s], o)) break;
                s === r && e.push(o);
              }
            }
            return e;
          }),
          (y.difference = _(function (t, e) {
            return (
              (e = N(e, !0, !0)),
              y.filter(t, function (t) {
                return !y.contains(e, t);
              })
            );
          })),
          (y.unzip = function (t) {
            for (
              var e = (t && y.max(t, O).length) || 0, r = Array(e), n = 0;
              n < e;
              n++
            )
              r[n] = y.pluck(t, n);
            return r;
          }),
          (y.zip = _(y.unzip)),
          (y.object = function (t, e) {
            for (var r = {}, n = 0, i = O(t); n < i; n++)
              e ? (r[t[n]] = e[n]) : (r[t[n][0]] = t[n][1]);
            return r;
          });
        var L = function (t) {
          return function (e, r, n) {
            r = M(r, n);
            for (var i = O(e), o = t > 0 ? 0 : i - 1; o >= 0 && o < i; o += t)
              if (r(e[o], o, e)) return o;
            return -1;
          };
        };
        (y.findIndex = L(1)),
          (y.findLastIndex = L(-1)),
          (y.sortedIndex = function (t, e, r, n) {
            r = M(r, n, 1);
            var i = r(e),
              o = 0,
              s = O(t);
            while (o < s) {
              var u = Math.floor((o + s) / 2);
              r(t[u]) < i ? (o = u + 1) : (s = u);
            }
            return o;
          });
        var P = function (t, e, r) {
          return function (n, i, o) {
            var s = 0,
              u = O(n);
            if ("number" == typeof o)
              t > 0
                ? (s = o >= 0 ? o : Math.max(o + u, s))
                : (u = o >= 0 ? Math.min(o + 1, u) : o + u + 1);
            else if (r && o && u) return (o = r(n, i)), n[o] === i ? o : -1;
            if (i !== i)
              return (o = e(f.call(n, s, u), y.isNaN)), o >= 0 ? o + s : -1;
            for (o = t > 0 ? s : u - 1; o >= 0 && o < u; o += t)
              if (n[o] === i) return o;
            return -1;
          };
        };
        (y.indexOf = P(1, y.findIndex, y.sortedIndex)),
          (y.lastIndexOf = P(-1, y.findLastIndex)),
          (y.range = function (t, e, r) {
            null == e && ((e = t || 0), (t = 0)), r || (r = e < t ? -1 : 1);
            for (
              var n = Math.max(Math.ceil((e - t) / r), 0), i = Array(n), o = 0;
              o < n;
              o++, t += r
            )
              i[o] = t;
            return i;
          }),
          (y.chunk = function (t, e) {
            if (null == e || e < 1) return [];
            var r = [],
              n = 0,
              i = t.length;
            while (n < i) r.push(f.call(t, n, (n += e)));
            return r;
          });
        var I = function (t, e, r, n, i) {
          if (!(n instanceof e)) return t.apply(r, i);
          var o = x(t.prototype),
            s = t.apply(o, i);
          return y.isObject(s) ? s : o;
        };
        (y.bind = _(function (t, e, r) {
          if (!y.isFunction(t))
            throw new TypeError("Bind must be called on a function");
          var n = _(function (i) {
            return I(t, n, e, this, r.concat(i));
          });
          return n;
        })),
          (y.partial = _(function (t, e) {
            var r = y.partial.placeholder,
              n = function () {
                for (var i = 0, o = e.length, s = Array(o), u = 0; u < o; u++)
                  s[u] = e[u] === r ? arguments[i++] : e[u];
                while (i < arguments.length) s.push(arguments[i++]);
                return I(t, n, this, this, s);
              };
            return n;
          })),
          (y.partial.placeholder = y),
          (y.bindAll = _(function (t, e) {
            e = N(e, !1, !1);
            var r = e.length;
            if (r < 1) throw new Error("bindAll must be passed function names");
            while (r--) {
              var n = e[r];
              t[n] = y.bind(t[n], t);
            }
          })),
          (y.memoize = function (t, e) {
            var r = function (n) {
              var i = r.cache,
                o = "" + (e ? e.apply(this, arguments) : n);
              return E(i, o) || (i[o] = t.apply(this, arguments)), i[o];
            };
            return (r.cache = {}), r;
          }),
          (y.delay = _(function (t, e, r) {
            return setTimeout(function () {
              return t.apply(null, r);
            }, e);
          })),
          (y.defer = y.partial(y.delay, y, 1)),
          (y.throttle = function (t, e, r) {
            var n,
              i,
              o,
              s,
              u = 0;
            r || (r = {});
            var a = function () {
                (u = !1 === r.leading ? 0 : y.now()),
                  (n = null),
                  (s = t.apply(i, o)),
                  n || (i = o = null);
              },
              h = function () {
                var h = y.now();
                u || !1 !== r.leading || (u = h);
                var l = e - (h - u);
                return (
                  (i = this),
                  (o = arguments),
                  l <= 0 || l > e
                    ? (n && (clearTimeout(n), (n = null)),
                      (u = h),
                      (s = t.apply(i, o)),
                      n || (i = o = null))
                    : n || !1 === r.trailing || (n = setTimeout(a, l)),
                  s
                );
              };
            return (
              (h.cancel = function () {
                clearTimeout(n), (u = 0), (n = i = o = null);
              }),
              h
            );
          }),
          (y.debounce = function (t, e, r) {
            var n,
              i,
              o = function (e, r) {
                (n = null), r && (i = t.apply(e, r));
              },
              s = _(function (s) {
                if ((n && clearTimeout(n), r)) {
                  var u = !n;
                  (n = setTimeout(o, e)), u && (i = t.apply(this, s));
                } else n = y.delay(o, e, this, s);
                return i;
              });
            return (
              (s.cancel = function () {
                clearTimeout(n), (n = null);
              }),
              s
            );
          }),
          (y.wrap = function (t, e) {
            return y.partial(e, t);
          }),
          (y.negate = function (t) {
            return function () {
              return !t.apply(this, arguments);
            };
          }),
          (y.compose = function () {
            var t = arguments,
              e = t.length - 1;
            return function () {
              var r = e,
                n = t[e].apply(this, arguments);
              while (r--) n = t[r].call(this, n);
              return n;
            };
          }),
          (y.after = function (t, e) {
            return function () {
              if (--t < 1) return e.apply(this, arguments);
            };
          }),
          (y.before = function (t, e) {
            var r;
            return function () {
              return (
                --t > 0 && (r = e.apply(this, arguments)),
                t <= 1 && (e = null),
                r
              );
            };
          }),
          (y.once = y.partial(y.before, 2)),
          (y.restArguments = _);
        var B = !{ toString: null }.propertyIsEnumerable("toString"),
          q = [
            "valueOf",
            "isPrototypeOf",
            "toString",
            "propertyIsEnumerable",
            "hasOwnProperty",
            "toLocaleString",
          ],
          U = function (t, e) {
            var r = q.length,
              n = t.constructor,
              i = (y.isFunction(n) && n.prototype) || a,
              o = "constructor";
            E(t, o) && !y.contains(e, o) && e.push(o);
            while (r--)
              (o = q[r]),
                o in t && t[o] !== i[o] && !y.contains(e, o) && e.push(o);
          };
        (y.keys = function (t) {
          if (!y.isObject(t)) return [];
          if (m) return m(t);
          var e = [];
          for (var r in t) E(t, r) && e.push(r);
          return B && U(t, e), e;
        }),
          (y.allKeys = function (t) {
            if (!y.isObject(t)) return [];
            var e = [];
            for (var r in t) e.push(r);
            return B && U(t, e), e;
          }),
          (y.values = function (t) {
            for (
              var e = y.keys(t), r = e.length, n = Array(r), i = 0;
              i < r;
              i++
            )
              n[i] = t[e[i]];
            return n;
          }),
          (y.mapObject = function (t, e, r) {
            e = M(e, r);
            for (var n = y.keys(t), i = n.length, o = {}, s = 0; s < i; s++) {
              var u = n[s];
              o[u] = e(t[u], u, t);
            }
            return o;
          }),
          (y.pairs = function (t) {
            for (
              var e = y.keys(t), r = e.length, n = Array(r), i = 0;
              i < r;
              i++
            )
              n[i] = [e[i], t[e[i]]];
            return n;
          }),
          (y.invert = function (t) {
            for (var e = {}, r = y.keys(t), n = 0, i = r.length; n < i; n++)
              e[t[r[n]]] = r[n];
            return e;
          }),
          (y.functions = y.methods =
            function (t) {
              var e = [];
              for (var r in t) y.isFunction(t[r]) && e.push(r);
              return e.sort();
            });
        var H = function (t, e) {
          return function (r) {
            var n = arguments.length;
            if ((e && (r = Object(r)), n < 2 || null == r)) return r;
            for (var i = 1; i < n; i++)
              for (
                var o = arguments[i], s = t(o), u = s.length, a = 0;
                a < u;
                a++
              ) {
                var h = s[a];
                (e && void 0 !== r[h]) || (r[h] = o[h]);
              }
            return r;
          };
        };
        (y.extend = H(y.allKeys)),
          (y.extendOwn = y.assign = H(y.keys)),
          (y.findKey = function (t, e, r) {
            e = M(e, r);
            for (var n, i = y.keys(t), o = 0, s = i.length; o < s; o++)
              if (((n = i[o]), e(t[n], n, t))) return n;
          });
        var D,
          F,
          z = function (t, e, r) {
            return e in r;
          };
        (y.pick = _(function (t, e) {
          var r = {},
            n = e[0];
          if (null == t) return r;
          y.isFunction(n)
            ? (e.length > 1 && (n = b(n, e[1])), (e = y.allKeys(t)))
            : ((n = z), (e = N(e, !1, !1)), (t = Object(t)));
          for (var i = 0, o = e.length; i < o; i++) {
            var s = e[i],
              u = t[s];
            n(u, s, t) && (r[s] = u);
          }
          return r;
        })),
          (y.omit = _(function (t, e) {
            var r,
              n = e[0];
            return (
              y.isFunction(n)
                ? ((n = y.negate(n)), e.length > 1 && (r = e[1]))
                : ((e = y.map(N(e, !1, !1), String)),
                  (n = function (t, r) {
                    return !y.contains(e, r);
                  })),
              y.pick(t, n, r)
            );
          })),
          (y.defaults = H(y.allKeys, !0)),
          (y.create = function (t, e) {
            var r = x(t);
            return e && y.extendOwn(r, e), r;
          }),
          (y.clone = function (t) {
            return y.isObject(t)
              ? y.isArray(t)
                ? t.slice()
                : y.extend({}, t)
              : t;
          }),
          (y.tap = function (t, e) {
            return e(t), t;
          }),
          (y.isMatch = function (t, e) {
            var r = y.keys(e),
              n = r.length;
            if (null == t) return !n;
            for (var i = Object(t), o = 0; o < n; o++) {
              var s = r[o];
              if (e[s] !== i[s] || !(s in i)) return !1;
            }
            return !0;
          }),
          (D = function (t, e, r, n) {
            if (t === e) return 0 !== t || 1 / t === 1 / e;
            if (null == t || null == e) return !1;
            if (t !== t) return e !== e;
            var i = typeof t;
            return (
              ("function" === i || "object" === i || "object" == typeof e) &&
              F(t, e, r, n)
            );
          }),
          (F = function (t, e, r, n) {
            t instanceof y && (t = t._wrapped),
              e instanceof y && (e = e._wrapped);
            var i = c.call(t);
            if (i !== c.call(e)) return !1;
            switch (i) {
              case "[object RegExp]":
              case "[object String]":
                return "" + t === "" + e;
              case "[object Number]":
                return +t !== +t
                  ? +e !== +e
                  : 0 === +t
                  ? 1 / +t === 1 / e
                  : +t === +e;
              case "[object Date]":
              case "[object Boolean]":
                return +t === +e;
              case "[object Symbol]":
                return h.valueOf.call(t) === h.valueOf.call(e);
            }
            var o = "[object Array]" === i;
            if (!o) {
              if ("object" != typeof t || "object" != typeof e) return !1;
              var s = t.constructor,
                u = e.constructor;
              if (
                s !== u &&
                !(
                  y.isFunction(s) &&
                  s instanceof s &&
                  y.isFunction(u) &&
                  u instanceof u
                ) &&
                "constructor" in t &&
                "constructor" in e
              )
                return !1;
            }
            (r = r || []), (n = n || []);
            var a = r.length;
            while (a--) if (r[a] === t) return n[a] === e;
            if ((r.push(t), n.push(e), o)) {
              if (((a = t.length), a !== e.length)) return !1;
              while (a--) if (!D(t[a], e[a], r, n)) return !1;
            } else {
              var l,
                f = y.keys(t);
              if (((a = f.length), y.keys(e).length !== a)) return !1;
              while (a--)
                if (((l = f[a]), !E(e, l) || !D(t[l], e[l], r, n))) return !1;
            }
            return r.pop(), n.pop(), !0;
          }),
          (y.isEqual = function (t, e) {
            return D(t, e);
          }),
          (y.isEmpty = function (t) {
            return (
              null == t ||
              (T(t) && (y.isArray(t) || y.isString(t) || y.isArguments(t))
                ? 0 === t.length
                : 0 === y.keys(t).length)
            );
          }),
          (y.isElement = function (t) {
            return !(!t || 1 !== t.nodeType);
          }),
          (y.isArray =
            p ||
            function (t) {
              return "[object Array]" === c.call(t);
            }),
          (y.isObject = function (t) {
            var e = typeof t;
            return "function" === e || ("object" === e && !!t);
          }),
          y.each(
            [
              "Arguments",
              "Function",
              "String",
              "Number",
              "Date",
              "RegExp",
              "Error",
              "Symbol",
              "Map",
              "WeakMap",
              "Set",
              "WeakSet",
            ],
            function (t) {
              y["is" + t] = function (e) {
                return c.call(e) === "[object " + t + "]";
              };
            }
          ),
          y.isArguments(arguments) ||
            (y.isArguments = function (t) {
              return E(t, "callee");
            });
        var Z = o.document && o.document.childNodes;
        "object" != typeof Int8Array &&
          "function" != typeof Z &&
          (y.isFunction = function (t) {
            return "function" == typeof t || !1;
          }),
          (y.isFinite = function (t) {
            return !y.isSymbol(t) && isFinite(t) && !isNaN(parseFloat(t));
          }),
          (y.isNaN = function (t) {
            return y.isNumber(t) && isNaN(t);
          }),
          (y.isBoolean = function (t) {
            return !0 === t || !1 === t || "[object Boolean]" === c.call(t);
          }),
          (y.isNull = function (t) {
            return null === t;
          }),
          (y.isUndefined = function (t) {
            return void 0 === t;
          }),
          (y.has = function (t, e) {
            if (!y.isArray(e)) return E(t, e);
            for (var r = e.length, n = 0; n < r; n++) {
              var i = e[n];
              if (null == t || !d.call(t, i)) return !1;
              t = t[i];
            }
            return !!r;
          }),
          (y.noConflict = function () {
            return (o._ = s), this;
          }),
          (y.identity = function (t) {
            return t;
          }),
          (y.constant = function (t) {
            return function () {
              return t;
            };
          }),
          (y.noop = function () {}),
          (y.property = function (t) {
            return y.isArray(t)
              ? function (e) {
                  return A(e, t);
                }
              : S(t);
          }),
          (y.propertyOf = function (t) {
            return null == t
              ? function () {}
              : function (e) {
                  return y.isArray(e) ? A(t, e) : t[e];
                };
          }),
          (y.matcher = y.matches =
            function (t) {
              return (
                (t = y.extendOwn({}, t)),
                function (e) {
                  return y.isMatch(e, t);
                }
              );
            }),
          (y.times = function (t, e, r) {
            var n = Array(Math.max(0, t));
            e = b(e, r, 1);
            for (var i = 0; i < t; i++) n[i] = e(i);
            return n;
          }),
          (y.random = function (t, e) {
            return (
              null == e && ((e = t), (t = 0)),
              t + Math.floor(Math.random() * (e - t + 1))
            );
          }),
          (y.now =
            Date.now ||
            function () {
              return new Date().getTime();
            });
        var W = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;",
          },
          G = y.invert(W),
          Y = function (t) {
            var e = function (e) {
                return t[e];
              },
              r = "(?:" + y.keys(t).join("|") + ")",
              n = RegExp(r),
              i = RegExp(r, "g");
            return function (t) {
              return (
                (t = null == t ? "" : "" + t), n.test(t) ? t.replace(i, e) : t
              );
            };
          };
        (y.escape = Y(W)),
          (y.unescape = Y(G)),
          (y.result = function (t, e, r) {
            y.isArray(e) || (e = [e]);
            var n = e.length;
            if (!n) return y.isFunction(r) ? r.call(t) : r;
            for (var i = 0; i < n; i++) {
              var o = null == t ? void 0 : t[e[i]];
              void 0 === o && ((o = r), (i = n)),
                (t = y.isFunction(o) ? o.call(t) : o);
            }
            return t;
          });
        var $ = 0;
        (y.uniqueId = function (t) {
          var e = ++$ + "";
          return t ? t + e : e;
        }),
          (y.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g,
          });
        var X = /(.)^/,
          V = {
            "'": "'",
            "\\": "\\",
            "\r": "r",
            "\n": "n",
            "\u2028": "u2028",
            "\u2029": "u2029",
          },
          J = /\\|'|\r|\n|\u2028|\u2029/g,
          K = function (t) {
            return "\\" + V[t];
          };
        (y.template = function (t, e, r) {
          !e && r && (e = r), (e = y.defaults({}, e, y.templateSettings));
          var n,
            i = RegExp(
              [
                (e.escape || X).source,
                (e.interpolate || X).source,
                (e.evaluate || X).source,
              ].join("|") + "|$",
              "g"
            ),
            o = 0,
            s = "__p+='";
          t.replace(i, function (e, r, n, i, u) {
            return (
              (s += t.slice(o, u).replace(J, K)),
              (o = u + e.length),
              r
                ? (s += "'+\n((__t=(" + r + "))==null?'':_.escape(__t))+\n'")
                : n
                ? (s += "'+\n((__t=(" + n + "))==null?'':__t)+\n'")
                : i && (s += "';\n" + i + "\n__p+='"),
              e
            );
          }),
            (s += "';\n"),
            e.variable || (s = "with(obj||{}){\n" + s + "}\n"),
            (s =
              "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" +
              s +
              "return __p;\n");
          try {
            n = new Function(e.variable || "obj", "_", s);
          } catch (h) {
            throw ((h.source = s), h);
          }
          var u = function (t) {
              return n.call(this, t, y);
            },
            a = e.variable || "obj";
          return (u.source = "function(" + a + "){\n" + s + "}"), u;
        }),
          (y.chain = function (t) {
            var e = y(t);
            return (e._chain = !0), e;
          });
        var Q = function (t, e) {
          return t._chain ? y(e).chain() : e;
        };
        (y.mixin = function (t) {
          return (
            y.each(y.functions(t), function (e) {
              var r = (y[e] = t[e]);
              y.prototype[e] = function () {
                var t = [this._wrapped];
                return l.apply(t, arguments), Q(this, r.apply(y, t));
              };
            }),
            y
          );
        }),
          y.mixin(y),
          y.each(
            ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"],
            function (t) {
              var e = u[t];
              y.prototype[t] = function () {
                var r = this._wrapped;
                return (
                  e.apply(r, arguments),
                  ("shift" !== t && "splice" !== t) ||
                    0 !== r.length ||
                    delete r[0],
                  Q(this, r)
                );
              };
            }
          ),
          y.each(["concat", "join", "slice"], function (t) {
            var e = u[t];
            y.prototype[t] = function () {
              return Q(this, e.apply(this._wrapped, arguments));
            };
          }),
          (y.prototype.value = function () {
            return this._wrapped;
          }),
          (y.prototype.valueOf = y.prototype.toJSON = y.prototype.value),
          (y.prototype.toString = function () {
            return String(this._wrapped);
          }),
          (n = []),
          (i = function () {
            return y;
          }.apply(e, n)),
          void 0 === i || (r.exports = i);
      })();
    }.call(this, r("c8ba"), r("62e4")(t)));
  },
  1985: function (t, e, r) {
    (function (t, n) {
      var i;
      /*! https://mths.be/punycode v1.4.1 by @mathias */ (function (o) {
        e && e.nodeType, t && t.nodeType;
        var s = "object" == typeof n && n;
        s.global !== s && s.window !== s && s.self;
        var u,
          a = 2147483647,
          h = 36,
          l = 1,
          f = 26,
          c = 38,
          d = 700,
          p = 72,
          m = 128,
          v = "-",
          g = /^xn--/,
          y = /[^\x20-\x7E]/,
          w = /[\x2E\u3002\uFF0E\uFF61]/g,
          b = {
            overflow: "Overflow: input needs wider integers to process",
            "not-basic": "Illegal input >= 0x80 (not a basic code point)",
            "invalid-input": "Invalid input",
          },
          M = h - l,
          _ = Math.floor,
          x = String.fromCharCode;
        function S(t) {
          throw new RangeError(b[t]);
        }
        function E(t, e) {
          var r = t.length,
            n = [];
          while (r--) n[r] = e(t[r]);
          return n;
        }
        function A(t, e) {
          var r = t.split("@"),
            n = "";
          r.length > 1 && ((n = r[0] + "@"), (t = r[1])),
            (t = t.replace(w, "."));
          var i = t.split("."),
            o = E(i, e).join(".");
          return n + o;
        }
        function k(t) {
          var e,
            r,
            n = [],
            i = 0,
            o = t.length;
          while (i < o)
            (e = t.charCodeAt(i++)),
              e >= 55296 && e <= 56319 && i < o
                ? ((r = t.charCodeAt(i++)),
                  56320 == (64512 & r)
                    ? n.push(((1023 & e) << 10) + (1023 & r) + 65536)
                    : (n.push(e), i--))
                : n.push(e);
          return n;
        }
        function O(t) {
          return E(t, function (t) {
            var e = "";
            return (
              t > 65535 &&
                ((t -= 65536),
                (e += x(((t >>> 10) & 1023) | 55296)),
                (t = 56320 | (1023 & t))),
              (e += x(t)),
              e
            );
          }).join("");
        }
        function T(t) {
          return t - 48 < 10
            ? t - 22
            : t - 65 < 26
            ? t - 65
            : t - 97 < 26
            ? t - 97
            : h;
        }
        function R(t, e) {
          return t + 22 + 75 * (t < 26) - ((0 != e) << 5);
        }
        function C(t, e, r) {
          var n = 0;
          for (
            t = r ? _(t / d) : t >> 1, t += _(t / e);
            t > (M * f) >> 1;
            n += h
          )
            t = _(t / M);
          return _(n + ((M + 1) * t) / (t + c));
        }
        function j(t) {
          var e,
            r,
            n,
            i,
            o,
            s,
            u,
            c,
            d,
            g,
            y = [],
            w = t.length,
            b = 0,
            M = m,
            x = p;
          for (r = t.lastIndexOf(v), r < 0 && (r = 0), n = 0; n < r; ++n)
            t.charCodeAt(n) >= 128 && S("not-basic"), y.push(t.charCodeAt(n));
          for (i = r > 0 ? r + 1 : 0; i < w; ) {
            for (o = b, s = 1, u = h; ; u += h) {
              if (
                (i >= w && S("invalid-input"),
                (c = T(t.charCodeAt(i++))),
                (c >= h || c > _((a - b) / s)) && S("overflow"),
                (b += c * s),
                (d = u <= x ? l : u >= x + f ? f : u - x),
                c < d)
              )
                break;
              (g = h - d), s > _(a / g) && S("overflow"), (s *= g);
            }
            (e = y.length + 1),
              (x = C(b - o, e, 0 == o)),
              _(b / e) > a - M && S("overflow"),
              (M += _(b / e)),
              (b %= e),
              y.splice(b++, 0, M);
          }
          return O(y);
        }
        function N(t) {
          var e,
            r,
            n,
            i,
            o,
            s,
            u,
            c,
            d,
            g,
            y,
            w,
            b,
            M,
            E,
            A = [];
          for (t = k(t), w = t.length, e = m, r = 0, o = p, s = 0; s < w; ++s)
            (y = t[s]), y < 128 && A.push(x(y));
          (n = i = A.length), i && A.push(v);
          while (n < w) {
            for (u = a, s = 0; s < w; ++s)
              (y = t[s]), y >= e && y < u && (u = y);
            for (
              b = n + 1,
                u - e > _((a - r) / b) && S("overflow"),
                r += (u - e) * b,
                e = u,
                s = 0;
              s < w;
              ++s
            )
              if (((y = t[s]), y < e && ++r > a && S("overflow"), y == e)) {
                for (c = r, d = h; ; d += h) {
                  if (((g = d <= o ? l : d >= o + f ? f : d - o), c < g)) break;
                  (E = c - g),
                    (M = h - g),
                    A.push(x(R(g + (E % M), 0))),
                    (c = _(E / M));
                }
                A.push(x(R(c, 0))), (o = C(r, b, n == i)), (r = 0), ++n;
              }
            ++r, ++e;
          }
          return A.join("");
        }
        function L(t) {
          return A(t, function (t) {
            return g.test(t) ? j(t.slice(4).toLowerCase()) : t;
          });
        }
        function P(t) {
          return A(t, function (t) {
            return y.test(t) ? "xn--" + N(t) : t;
          });
        }
        (u = {
          version: "1.4.1",
          ucs2: { decode: k, encode: O },
          decode: j,
          encode: N,
          toASCII: P,
          toUnicode: L,
        }),
          (i = function () {
            return u;
          }.call(e, r, e, t)),
          void 0 === i || (t.exports = i);
      })();
    }.call(this, r("62e4")(t), r("c8ba")));
  },
  "19aa": function (t, e) {
    t.exports = function (t, e, r) {
      if (!(t instanceof e))
        throw TypeError("Incorrect " + (r ? r + " " : "") + "invocation");
      return t;
    };
  },
  "1ad6": function (t, e, r) {
    t.exports = r("faa1").EventEmitter;
  },
  "1b54": function (t, e, r) {
    "use strict";
    r.d(e, "s", function () {
      return n;
    }),
      r.d(e, "q", function () {
        return i;
      }),
      r.d(e, "m", function () {
        return o;
      }),
      r.d(e, "l", function () {
        return s;
      }),
      r.d(e, "n", function () {
        return u;
      }),
      r.d(e, "p", function () {
        return a;
      }),
      r.d(e, "o", function () {
        return h;
      }),
      r.d(e, "t", function () {
        return l;
      }),
      r.d(e, "I", function () {
        return f;
      }),
      r.d(e, "H", function () {
        return c;
      }),
      r.d(e, "z", function () {
        return d;
      }),
      r.d(e, "E", function () {
        return p;
      }),
      r.d(e, "C", function () {
        return m;
      }),
      r.d(e, "F", function () {
        return v;
      }),
      r.d(e, "x", function () {
        return g;
      }),
      r.d(e, "r", function () {
        return y;
      }),
      r.d(e, "b", function () {
        return w;
      }),
      r.d(e, "k", function () {
        return b;
      }),
      r.d(e, "a", function () {
        return M;
      }),
      r.d(e, "h", function () {
        return _;
      }),
      r.d(e, "f", function () {
        return x;
      }),
      r.d(e, "g", function () {
        return S;
      }),
      r.d(e, "G", function () {
        return E;
      }),
      r.d(e, "w", function () {
        return A;
      }),
      r.d(e, "i", function () {
        return k;
      }),
      r.d(e, "M", function () {
        return O;
      }),
      r.d(e, "Q", function () {
        return T;
      }),
      r.d(e, "L", function () {
        return R;
      }),
      r.d(e, "N", function () {
        return C;
      }),
      r.d(e, "O", function () {
        return j;
      }),
      r.d(e, "P", function () {
        return N;
      }),
      r.d(e, "R", function () {
        return L;
      }),
      r.d(e, "j", function () {
        return P;
      }),
      r.d(e, "S", function () {
        return I;
      }),
      r.d(e, "y", function () {
        return B;
      }),
      r.d(e, "B", function () {
        return q;
      }),
      r.d(e, "d", function () {
        return U;
      }),
      r.d(e, "v", function () {
        return H;
      }),
      r.d(e, "e", function () {
        return D;
      }),
      r.d(e, "D", function () {
        return F;
      }),
      r.d(e, "u", function () {
        return z;
      }),
      r.d(e, "A", function () {
        return Z;
      }),
      r.d(e, "c", function () {
        return W;
      }),
      r.d(e, "K", function () {
        return G;
      }),
      r.d(e, "J", function () {
        return Y;
      });
    var n = "web3{{id}}web3Detected",
      i = "selectedMewCXAccount",
      o = "mewTxHash",
      s = "mewSignedMsg",
      u = "rejectMewCXAccount",
      a = "rejectMewTxSign",
      h = "rejectMewSignMsg",
      l = "web3{{id}}getAccount",
      f = "web3{{id}}sendTx",
      c = "web3{{id}}sendSignMsg",
      d = "web3{{id}}receiveAccount",
      p = "web3{{id}}recieveTxHash",
      m = "web3{{id}}recieveSignedMsg",
      v = "web3{{id}}reject",
      g = "web3{{id}}providerNetworkChange",
      y = "web3{{id}}providerChainChange",
      w = "mewCxFetchAccounts",
      b = "web3Detected",
      M = "confirmAndSendTx",
      _ = "signMsg",
      x = "injectWeb3",
      S = "sendSignedTx",
      E = "web3RPCRequest",
      A = "web3{{id}}ScriptInjectedSuccessfuly",
      k = "cxSubscription",
      O = "web3{{id}}SubscribeListener",
      T = "web3{{id}}SubscriptionListener",
      R = "web3{{id}}Subscribe",
      C = "web3SubscribeRes",
      j = "web3SubscribtionRes",
      N = "web3SubscriptionErr",
      L = "web3{{id}}Unsubscribe",
      P = "cxUnsubcribe",
      I = "web3{{id}}UnsubscribeRes",
      B = "web3{{id}}QueryGasPrice",
      q = "web3{{id}}ReceiveGasPrice",
      U = "cxGetGasPrice",
      H = "web3{{id}}GetTxCount",
      D = "cxGetTxCount",
      F = "web3{{id}}ReceiveTxCount",
      z = "web3{{id}}GetGas",
      Z = "web3{{id}}ReceiveGas",
      W = "cxGetGas",
      G = "web3CxSignTx",
      Y = "web3CxSignMsg";
  },
  "1be4": function (t, e, r) {
    var n = r("d066");
    t.exports = n("document", "documentElement");
  },
  "1c0b": function (t, e) {
    t.exports = function (t) {
      if ("function" != typeof t)
        throw TypeError(String(t) + " is not a function");
      return t;
    };
  },
  "1c35": function (t, e, r) {
    "use strict";
    (function (t) {
      /*!
       * The buffer module from node.js, for the browser.
       *
       * @author   Feross Aboukhadijeh <http://feross.org>
       * @license  MIT
       */
      var n = r("1fb5"),
        i = r("9152"),
        o = r("e3db");
      function s() {
        try {
          var t = new Uint8Array(1);
          return (
            (t.__proto__ = {
              __proto__: Uint8Array.prototype,
              foo: function () {
                return 42;
              },
            }),
            42 === t.foo() &&
              "function" === typeof t.subarray &&
              0 === t.subarray(1, 1).byteLength
          );
        } catch (e) {
          return !1;
        }
      }
      function u() {
        return h.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
      }
      function a(t, e) {
        if (u() < e) throw new RangeError("Invalid typed array length");
        return (
          h.TYPED_ARRAY_SUPPORT
            ? ((t = new Uint8Array(e)), (t.__proto__ = h.prototype))
            : (null === t && (t = new h(e)), (t.length = e)),
          t
        );
      }
      function h(t, e, r) {
        if (!h.TYPED_ARRAY_SUPPORT && !(this instanceof h))
          return new h(t, e, r);
        if ("number" === typeof t) {
          if ("string" === typeof e)
            throw new Error(
              "If encoding is specified then the first argument must be a string"
            );
          return d(this, t);
        }
        return l(this, t, e, r);
      }
      function l(t, e, r, n) {
        if ("number" === typeof e)
          throw new TypeError('"value" argument must not be a number');
        return "undefined" !== typeof ArrayBuffer && e instanceof ArrayBuffer
          ? v(t, e, r, n)
          : "string" === typeof e
          ? p(t, e, r)
          : g(t, e);
      }
      function f(t) {
        if ("number" !== typeof t)
          throw new TypeError('"size" argument must be a number');
        if (t < 0) throw new RangeError('"size" argument must not be negative');
      }
      function c(t, e, r, n) {
        return (
          f(e),
          e <= 0
            ? a(t, e)
            : void 0 !== r
            ? "string" === typeof n
              ? a(t, e).fill(r, n)
              : a(t, e).fill(r)
            : a(t, e)
        );
      }
      function d(t, e) {
        if ((f(e), (t = a(t, e < 0 ? 0 : 0 | y(e))), !h.TYPED_ARRAY_SUPPORT))
          for (var r = 0; r < e; ++r) t[r] = 0;
        return t;
      }
      function p(t, e, r) {
        if (
          (("string" === typeof r && "" !== r) || (r = "utf8"),
          !h.isEncoding(r))
        )
          throw new TypeError('"encoding" must be a valid string encoding');
        var n = 0 | b(e, r);
        t = a(t, n);
        var i = t.write(e, r);
        return i !== n && (t = t.slice(0, i)), t;
      }
      function m(t, e) {
        var r = e.length < 0 ? 0 : 0 | y(e.length);
        t = a(t, r);
        for (var n = 0; n < r; n += 1) t[n] = 255 & e[n];
        return t;
      }
      function v(t, e, r, n) {
        if ((e.byteLength, r < 0 || e.byteLength < r))
          throw new RangeError("'offset' is out of bounds");
        if (e.byteLength < r + (n || 0))
          throw new RangeError("'length' is out of bounds");
        return (
          (e =
            void 0 === r && void 0 === n
              ? new Uint8Array(e)
              : void 0 === n
              ? new Uint8Array(e, r)
              : new Uint8Array(e, r, n)),
          h.TYPED_ARRAY_SUPPORT
            ? ((t = e), (t.__proto__ = h.prototype))
            : (t = m(t, e)),
          t
        );
      }
      function g(t, e) {
        if (h.isBuffer(e)) {
          var r = 0 | y(e.length);
          return (t = a(t, r)), 0 === t.length ? t : (e.copy(t, 0, 0, r), t);
        }
        if (e) {
          if (
            ("undefined" !== typeof ArrayBuffer &&
              e.buffer instanceof ArrayBuffer) ||
            "length" in e
          )
            return "number" !== typeof e.length || et(e.length)
              ? a(t, 0)
              : m(t, e);
          if ("Buffer" === e.type && o(e.data)) return m(t, e.data);
        }
        throw new TypeError(
          "First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object."
        );
      }
      function y(t) {
        if (t >= u())
          throw new RangeError(
            "Attempt to allocate Buffer larger than maximum size: 0x" +
              u().toString(16) +
              " bytes"
          );
        return 0 | t;
      }
      function w(t) {
        return +t != t && (t = 0), h.alloc(+t);
      }
      function b(t, e) {
        if (h.isBuffer(t)) return t.length;
        if (
          "undefined" !== typeof ArrayBuffer &&
          "function" === typeof ArrayBuffer.isView &&
          (ArrayBuffer.isView(t) || t instanceof ArrayBuffer)
        )
          return t.byteLength;
        "string" !== typeof t && (t = "" + t);
        var r = t.length;
        if (0 === r) return 0;
        for (var n = !1; ; )
          switch (e) {
            case "ascii":
            case "latin1":
            case "binary":
              return r;
            case "utf8":
            case "utf-8":
            case void 0:
              return V(t).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return 2 * r;
            case "hex":
              return r >>> 1;
            case "base64":
              return Q(t).length;
            default:
              if (n) return V(t).length;
              (e = ("" + e).toLowerCase()), (n = !0);
          }
      }
      function M(t, e, r) {
        var n = !1;
        if (((void 0 === e || e < 0) && (e = 0), e > this.length)) return "";
        if (((void 0 === r || r > this.length) && (r = this.length), r <= 0))
          return "";
        if (((r >>>= 0), (e >>>= 0), r <= e)) return "";
        t || (t = "utf8");
        while (1)
          switch (t) {
            case "hex":
              return B(this, e, r);
            case "utf8":
            case "utf-8":
              return j(this, e, r);
            case "ascii":
              return P(this, e, r);
            case "latin1":
            case "binary":
              return I(this, e, r);
            case "base64":
              return C(this, e, r);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return q(this, e, r);
            default:
              if (n) throw new TypeError("Unknown encoding: " + t);
              (t = (t + "").toLowerCase()), (n = !0);
          }
      }
      function _(t, e, r) {
        var n = t[e];
        (t[e] = t[r]), (t[r] = n);
      }
      function x(t, e, r, n, i) {
        if (0 === t.length) return -1;
        if (
          ("string" === typeof r
            ? ((n = r), (r = 0))
            : r > 2147483647
            ? (r = 2147483647)
            : r < -2147483648 && (r = -2147483648),
          (r = +r),
          isNaN(r) && (r = i ? 0 : t.length - 1),
          r < 0 && (r = t.length + r),
          r >= t.length)
        ) {
          if (i) return -1;
          r = t.length - 1;
        } else if (r < 0) {
          if (!i) return -1;
          r = 0;
        }
        if (("string" === typeof e && (e = h.from(e, n)), h.isBuffer(e)))
          return 0 === e.length ? -1 : S(t, e, r, n, i);
        if ("number" === typeof e)
          return (
            (e &= 255),
            h.TYPED_ARRAY_SUPPORT &&
            "function" === typeof Uint8Array.prototype.indexOf
              ? i
                ? Uint8Array.prototype.indexOf.call(t, e, r)
                : Uint8Array.prototype.lastIndexOf.call(t, e, r)
              : S(t, [e], r, n, i)
          );
        throw new TypeError("val must be string, number or Buffer");
      }
      function S(t, e, r, n, i) {
        var o,
          s = 1,
          u = t.length,
          a = e.length;
        if (
          void 0 !== n &&
          ((n = String(n).toLowerCase()),
          "ucs2" === n || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)
        ) {
          if (t.length < 2 || e.length < 2) return -1;
          (s = 2), (u /= 2), (a /= 2), (r /= 2);
        }
        function h(t, e) {
          return 1 === s ? t[e] : t.readUInt16BE(e * s);
        }
        if (i) {
          var l = -1;
          for (o = r; o < u; o++)
            if (h(t, o) === h(e, -1 === l ? 0 : o - l)) {
              if ((-1 === l && (l = o), o - l + 1 === a)) return l * s;
            } else -1 !== l && (o -= o - l), (l = -1);
        } else
          for (r + a > u && (r = u - a), o = r; o >= 0; o--) {
            for (var f = !0, c = 0; c < a; c++)
              if (h(t, o + c) !== h(e, c)) {
                f = !1;
                break;
              }
            if (f) return o;
          }
        return -1;
      }
      function E(t, e, r, n) {
        r = Number(r) || 0;
        var i = t.length - r;
        n ? ((n = Number(n)), n > i && (n = i)) : (n = i);
        var o = e.length;
        if (o % 2 !== 0) throw new TypeError("Invalid hex string");
        n > o / 2 && (n = o / 2);
        for (var s = 0; s < n; ++s) {
          var u = parseInt(e.substr(2 * s, 2), 16);
          if (isNaN(u)) return s;
          t[r + s] = u;
        }
        return s;
      }
      function A(t, e, r, n) {
        return tt(V(e, t.length - r), t, r, n);
      }
      function k(t, e, r, n) {
        return tt(J(e), t, r, n);
      }
      function O(t, e, r, n) {
        return k(t, e, r, n);
      }
      function T(t, e, r, n) {
        return tt(Q(e), t, r, n);
      }
      function R(t, e, r, n) {
        return tt(K(e, t.length - r), t, r, n);
      }
      function C(t, e, r) {
        return 0 === e && r === t.length
          ? n.fromByteArray(t)
          : n.fromByteArray(t.slice(e, r));
      }
      function j(t, e, r) {
        r = Math.min(t.length, r);
        var n = [],
          i = e;
        while (i < r) {
          var o,
            s,
            u,
            a,
            h = t[i],
            l = null,
            f = h > 239 ? 4 : h > 223 ? 3 : h > 191 ? 2 : 1;
          if (i + f <= r)
            switch (f) {
              case 1:
                h < 128 && (l = h);
                break;
              case 2:
                (o = t[i + 1]),
                  128 === (192 & o) &&
                    ((a = ((31 & h) << 6) | (63 & o)), a > 127 && (l = a));
                break;
              case 3:
                (o = t[i + 1]),
                  (s = t[i + 2]),
                  128 === (192 & o) &&
                    128 === (192 & s) &&
                    ((a = ((15 & h) << 12) | ((63 & o) << 6) | (63 & s)),
                    a > 2047 && (a < 55296 || a > 57343) && (l = a));
                break;
              case 4:
                (o = t[i + 1]),
                  (s = t[i + 2]),
                  (u = t[i + 3]),
                  128 === (192 & o) &&
                    128 === (192 & s) &&
                    128 === (192 & u) &&
                    ((a =
                      ((15 & h) << 18) |
                      ((63 & o) << 12) |
                      ((63 & s) << 6) |
                      (63 & u)),
                    a > 65535 && a < 1114112 && (l = a));
            }
          null === l
            ? ((l = 65533), (f = 1))
            : l > 65535 &&
              ((l -= 65536),
              n.push(((l >>> 10) & 1023) | 55296),
              (l = 56320 | (1023 & l))),
            n.push(l),
            (i += f);
        }
        return L(n);
      }
      (e.Buffer = h),
        (e.SlowBuffer = w),
        (e.INSPECT_MAX_BYTES = 50),
        (h.TYPED_ARRAY_SUPPORT =
          void 0 !== t.TYPED_ARRAY_SUPPORT ? t.TYPED_ARRAY_SUPPORT : s()),
        (e.kMaxLength = u()),
        (h.poolSize = 8192),
        (h._augment = function (t) {
          return (t.__proto__ = h.prototype), t;
        }),
        (h.from = function (t, e, r) {
          return l(null, t, e, r);
        }),
        h.TYPED_ARRAY_SUPPORT &&
          ((h.prototype.__proto__ = Uint8Array.prototype),
          (h.__proto__ = Uint8Array),
          "undefined" !== typeof Symbol &&
            Symbol.species &&
            h[Symbol.species] === h &&
            Object.defineProperty(h, Symbol.species, {
              value: null,
              configurable: !0,
            })),
        (h.alloc = function (t, e, r) {
          return c(null, t, e, r);
        }),
        (h.allocUnsafe = function (t) {
          return d(null, t);
        }),
        (h.allocUnsafeSlow = function (t) {
          return d(null, t);
        }),
        (h.isBuffer = function (t) {
          return !(null == t || !t._isBuffer);
        }),
        (h.compare = function (t, e) {
          if (!h.isBuffer(t) || !h.isBuffer(e))
            throw new TypeError("Arguments must be Buffers");
          if (t === e) return 0;
          for (
            var r = t.length, n = e.length, i = 0, o = Math.min(r, n);
            i < o;
            ++i
          )
            if (t[i] !== e[i]) {
              (r = t[i]), (n = e[i]);
              break;
            }
          return r < n ? -1 : n < r ? 1 : 0;
        }),
        (h.isEncoding = function (t) {
          switch (String(t).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "latin1":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return !0;
            default:
              return !1;
          }
        }),
        (h.concat = function (t, e) {
          if (!o(t))
            throw new TypeError('"list" argument must be an Array of Buffers');
          if (0 === t.length) return h.alloc(0);
          var r;
          if (void 0 === e)
            for (e = 0, r = 0; r < t.length; ++r) e += t[r].length;
          var n = h.allocUnsafe(e),
            i = 0;
          for (r = 0; r < t.length; ++r) {
            var s = t[r];
            if (!h.isBuffer(s))
              throw new TypeError(
                '"list" argument must be an Array of Buffers'
              );
            s.copy(n, i), (i += s.length);
          }
          return n;
        }),
        (h.byteLength = b),
        (h.prototype._isBuffer = !0),
        (h.prototype.swap16 = function () {
          var t = this.length;
          if (t % 2 !== 0)
            throw new RangeError("Buffer size must be a multiple of 16-bits");
          for (var e = 0; e < t; e += 2) _(this, e, e + 1);
          return this;
        }),
        (h.prototype.swap32 = function () {
          var t = this.length;
          if (t % 4 !== 0)
            throw new RangeError("Buffer size must be a multiple of 32-bits");
          for (var e = 0; e < t; e += 4)
            _(this, e, e + 3), _(this, e + 1, e + 2);
          return this;
        }),
        (h.prototype.swap64 = function () {
          var t = this.length;
          if (t % 8 !== 0)
            throw new RangeError("Buffer size must be a multiple of 64-bits");
          for (var e = 0; e < t; e += 8)
            _(this, e, e + 7),
              _(this, e + 1, e + 6),
              _(this, e + 2, e + 5),
              _(this, e + 3, e + 4);
          return this;
        }),
        (h.prototype.toString = function () {
          var t = 0 | this.length;
          return 0 === t
            ? ""
            : 0 === arguments.length
            ? j(this, 0, t)
            : M.apply(this, arguments);
        }),
        (h.prototype.equals = function (t) {
          if (!h.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
          return this === t || 0 === h.compare(this, t);
        }),
        (h.prototype.inspect = function () {
          var t = "",
            r = e.INSPECT_MAX_BYTES;
          return (
            this.length > 0 &&
              ((t = this.toString("hex", 0, r).match(/.{2}/g).join(" ")),
              this.length > r && (t += " ... ")),
            "<Buffer " + t + ">"
          );
        }),
        (h.prototype.compare = function (t, e, r, n, i) {
          if (!h.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
          if (
            (void 0 === e && (e = 0),
            void 0 === r && (r = t ? t.length : 0),
            void 0 === n && (n = 0),
            void 0 === i && (i = this.length),
            e < 0 || r > t.length || n < 0 || i > this.length)
          )
            throw new RangeError("out of range index");
          if (n >= i && e >= r) return 0;
          if (n >= i) return -1;
          if (e >= r) return 1;
          if (((e >>>= 0), (r >>>= 0), (n >>>= 0), (i >>>= 0), this === t))
            return 0;
          for (
            var o = i - n,
              s = r - e,
              u = Math.min(o, s),
              a = this.slice(n, i),
              l = t.slice(e, r),
              f = 0;
            f < u;
            ++f
          )
            if (a[f] !== l[f]) {
              (o = a[f]), (s = l[f]);
              break;
            }
          return o < s ? -1 : s < o ? 1 : 0;
        }),
        (h.prototype.includes = function (t, e, r) {
          return -1 !== this.indexOf(t, e, r);
        }),
        (h.prototype.indexOf = function (t, e, r) {
          return x(this, t, e, r, !0);
        }),
        (h.prototype.lastIndexOf = function (t, e, r) {
          return x(this, t, e, r, !1);
        }),
        (h.prototype.write = function (t, e, r, n) {
          if (void 0 === e) (n = "utf8"), (r = this.length), (e = 0);
          else if (void 0 === r && "string" === typeof e)
            (n = e), (r = this.length), (e = 0);
          else {
            if (!isFinite(e))
              throw new Error(
                "Buffer.write(string, encoding, offset[, length]) is no longer supported"
              );
            (e |= 0),
              isFinite(r)
                ? ((r |= 0), void 0 === n && (n = "utf8"))
                : ((n = r), (r = void 0));
          }
          var i = this.length - e;
          if (
            ((void 0 === r || r > i) && (r = i),
            (t.length > 0 && (r < 0 || e < 0)) || e > this.length)
          )
            throw new RangeError("Attempt to write outside buffer bounds");
          n || (n = "utf8");
          for (var o = !1; ; )
            switch (n) {
              case "hex":
                return E(this, t, e, r);
              case "utf8":
              case "utf-8":
                return A(this, t, e, r);
              case "ascii":
                return k(this, t, e, r);
              case "latin1":
              case "binary":
                return O(this, t, e, r);
              case "base64":
                return T(this, t, e, r);
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return R(this, t, e, r);
              default:
                if (o) throw new TypeError("Unknown encoding: " + n);
                (n = ("" + n).toLowerCase()), (o = !0);
            }
        }),
        (h.prototype.toJSON = function () {
          return {
            type: "Buffer",
            data: Array.prototype.slice.call(this._arr || this, 0),
          };
        });
      var N = 4096;
      function L(t) {
        var e = t.length;
        if (e <= N) return String.fromCharCode.apply(String, t);
        var r = "",
          n = 0;
        while (n < e)
          r += String.fromCharCode.apply(String, t.slice(n, (n += N)));
        return r;
      }
      function P(t, e, r) {
        var n = "";
        r = Math.min(t.length, r);
        for (var i = e; i < r; ++i) n += String.fromCharCode(127 & t[i]);
        return n;
      }
      function I(t, e, r) {
        var n = "";
        r = Math.min(t.length, r);
        for (var i = e; i < r; ++i) n += String.fromCharCode(t[i]);
        return n;
      }
      function B(t, e, r) {
        var n = t.length;
        (!e || e < 0) && (e = 0), (!r || r < 0 || r > n) && (r = n);
        for (var i = "", o = e; o < r; ++o) i += X(t[o]);
        return i;
      }
      function q(t, e, r) {
        for (var n = t.slice(e, r), i = "", o = 0; o < n.length; o += 2)
          i += String.fromCharCode(n[o] + 256 * n[o + 1]);
        return i;
      }
      function U(t, e, r) {
        if (t % 1 !== 0 || t < 0) throw new RangeError("offset is not uint");
        if (t + e > r)
          throw new RangeError("Trying to access beyond buffer length");
      }
      function H(t, e, r, n, i, o) {
        if (!h.isBuffer(t))
          throw new TypeError('"buffer" argument must be a Buffer instance');
        if (e > i || e < o)
          throw new RangeError('"value" argument is out of bounds');
        if (r + n > t.length) throw new RangeError("Index out of range");
      }
      function D(t, e, r, n) {
        e < 0 && (e = 65535 + e + 1);
        for (var i = 0, o = Math.min(t.length - r, 2); i < o; ++i)
          t[r + i] =
            (e & (255 << (8 * (n ? i : 1 - i)))) >>> (8 * (n ? i : 1 - i));
      }
      function F(t, e, r, n) {
        e < 0 && (e = 4294967295 + e + 1);
        for (var i = 0, o = Math.min(t.length - r, 4); i < o; ++i)
          t[r + i] = (e >>> (8 * (n ? i : 3 - i))) & 255;
      }
      function z(t, e, r, n, i, o) {
        if (r + n > t.length) throw new RangeError("Index out of range");
        if (r < 0) throw new RangeError("Index out of range");
      }
      function Z(t, e, r, n, o) {
        return (
          o || z(t, e, r, 4, 34028234663852886e22, -34028234663852886e22),
          i.write(t, e, r, n, 23, 4),
          r + 4
        );
      }
      function W(t, e, r, n, o) {
        return (
          o || z(t, e, r, 8, 17976931348623157e292, -17976931348623157e292),
          i.write(t, e, r, n, 52, 8),
          r + 8
        );
      }
      (h.prototype.slice = function (t, e) {
        var r,
          n = this.length;
        if (
          ((t = ~~t),
          (e = void 0 === e ? n : ~~e),
          t < 0 ? ((t += n), t < 0 && (t = 0)) : t > n && (t = n),
          e < 0 ? ((e += n), e < 0 && (e = 0)) : e > n && (e = n),
          e < t && (e = t),
          h.TYPED_ARRAY_SUPPORT)
        )
          (r = this.subarray(t, e)), (r.__proto__ = h.prototype);
        else {
          var i = e - t;
          r = new h(i, void 0);
          for (var o = 0; o < i; ++o) r[o] = this[o + t];
        }
        return r;
      }),
        (h.prototype.readUIntLE = function (t, e, r) {
          (t |= 0), (e |= 0), r || U(t, e, this.length);
          var n = this[t],
            i = 1,
            o = 0;
          while (++o < e && (i *= 256)) n += this[t + o] * i;
          return n;
        }),
        (h.prototype.readUIntBE = function (t, e, r) {
          (t |= 0), (e |= 0), r || U(t, e, this.length);
          var n = this[t + --e],
            i = 1;
          while (e > 0 && (i *= 256)) n += this[t + --e] * i;
          return n;
        }),
        (h.prototype.readUInt8 = function (t, e) {
          return e || U(t, 1, this.length), this[t];
        }),
        (h.prototype.readUInt16LE = function (t, e) {
          return e || U(t, 2, this.length), this[t] | (this[t + 1] << 8);
        }),
        (h.prototype.readUInt16BE = function (t, e) {
          return e || U(t, 2, this.length), (this[t] << 8) | this[t + 1];
        }),
        (h.prototype.readUInt32LE = function (t, e) {
          return (
            e || U(t, 4, this.length),
            (this[t] | (this[t + 1] << 8) | (this[t + 2] << 16)) +
              16777216 * this[t + 3]
          );
        }),
        (h.prototype.readUInt32BE = function (t, e) {
          return (
            e || U(t, 4, this.length),
            16777216 * this[t] +
              ((this[t + 1] << 16) | (this[t + 2] << 8) | this[t + 3])
          );
        }),
        (h.prototype.readIntLE = function (t, e, r) {
          (t |= 0), (e |= 0), r || U(t, e, this.length);
          var n = this[t],
            i = 1,
            o = 0;
          while (++o < e && (i *= 256)) n += this[t + o] * i;
          return (i *= 128), n >= i && (n -= Math.pow(2, 8 * e)), n;
        }),
        (h.prototype.readIntBE = function (t, e, r) {
          (t |= 0), (e |= 0), r || U(t, e, this.length);
          var n = e,
            i = 1,
            o = this[t + --n];
          while (n > 0 && (i *= 256)) o += this[t + --n] * i;
          return (i *= 128), o >= i && (o -= Math.pow(2, 8 * e)), o;
        }),
        (h.prototype.readInt8 = function (t, e) {
          return (
            e || U(t, 1, this.length),
            128 & this[t] ? -1 * (255 - this[t] + 1) : this[t]
          );
        }),
        (h.prototype.readInt16LE = function (t, e) {
          e || U(t, 2, this.length);
          var r = this[t] | (this[t + 1] << 8);
          return 32768 & r ? 4294901760 | r : r;
        }),
        (h.prototype.readInt16BE = function (t, e) {
          e || U(t, 2, this.length);
          var r = this[t + 1] | (this[t] << 8);
          return 32768 & r ? 4294901760 | r : r;
        }),
        (h.prototype.readInt32LE = function (t, e) {
          return (
            e || U(t, 4, this.length),
            this[t] |
              (this[t + 1] << 8) |
              (this[t + 2] << 16) |
              (this[t + 3] << 24)
          );
        }),
        (h.prototype.readInt32BE = function (t, e) {
          return (
            e || U(t, 4, this.length),
            (this[t] << 24) |
              (this[t + 1] << 16) |
              (this[t + 2] << 8) |
              this[t + 3]
          );
        }),
        (h.prototype.readFloatLE = function (t, e) {
          return e || U(t, 4, this.length), i.read(this, t, !0, 23, 4);
        }),
        (h.prototype.readFloatBE = function (t, e) {
          return e || U(t, 4, this.length), i.read(this, t, !1, 23, 4);
        }),
        (h.prototype.readDoubleLE = function (t, e) {
          return e || U(t, 8, this.length), i.read(this, t, !0, 52, 8);
        }),
        (h.prototype.readDoubleBE = function (t, e) {
          return e || U(t, 8, this.length), i.read(this, t, !1, 52, 8);
        }),
        (h.prototype.writeUIntLE = function (t, e, r, n) {
          if (((t = +t), (e |= 0), (r |= 0), !n)) {
            var i = Math.pow(2, 8 * r) - 1;
            H(this, t, e, r, i, 0);
          }
          var o = 1,
            s = 0;
          this[e] = 255 & t;
          while (++s < r && (o *= 256)) this[e + s] = (t / o) & 255;
          return e + r;
        }),
        (h.prototype.writeUIntBE = function (t, e, r, n) {
          if (((t = +t), (e |= 0), (r |= 0), !n)) {
            var i = Math.pow(2, 8 * r) - 1;
            H(this, t, e, r, i, 0);
          }
          var o = r - 1,
            s = 1;
          this[e + o] = 255 & t;
          while (--o >= 0 && (s *= 256)) this[e + o] = (t / s) & 255;
          return e + r;
        }),
        (h.prototype.writeUInt8 = function (t, e, r) {
          return (
            (t = +t),
            (e |= 0),
            r || H(this, t, e, 1, 255, 0),
            h.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)),
            (this[e] = 255 & t),
            e + 1
          );
        }),
        (h.prototype.writeUInt16LE = function (t, e, r) {
          return (
            (t = +t),
            (e |= 0),
            r || H(this, t, e, 2, 65535, 0),
            h.TYPED_ARRAY_SUPPORT
              ? ((this[e] = 255 & t), (this[e + 1] = t >>> 8))
              : D(this, t, e, !0),
            e + 2
          );
        }),
        (h.prototype.writeUInt16BE = function (t, e, r) {
          return (
            (t = +t),
            (e |= 0),
            r || H(this, t, e, 2, 65535, 0),
            h.TYPED_ARRAY_SUPPORT
              ? ((this[e] = t >>> 8), (this[e + 1] = 255 & t))
              : D(this, t, e, !1),
            e + 2
          );
        }),
        (h.prototype.writeUInt32LE = function (t, e, r) {
          return (
            (t = +t),
            (e |= 0),
            r || H(this, t, e, 4, 4294967295, 0),
            h.TYPED_ARRAY_SUPPORT
              ? ((this[e + 3] = t >>> 24),
                (this[e + 2] = t >>> 16),
                (this[e + 1] = t >>> 8),
                (this[e] = 255 & t))
              : F(this, t, e, !0),
            e + 4
          );
        }),
        (h.prototype.writeUInt32BE = function (t, e, r) {
          return (
            (t = +t),
            (e |= 0),
            r || H(this, t, e, 4, 4294967295, 0),
            h.TYPED_ARRAY_SUPPORT
              ? ((this[e] = t >>> 24),
                (this[e + 1] = t >>> 16),
                (this[e + 2] = t >>> 8),
                (this[e + 3] = 255 & t))
              : F(this, t, e, !1),
            e + 4
          );
        }),
        (h.prototype.writeIntLE = function (t, e, r, n) {
          if (((t = +t), (e |= 0), !n)) {
            var i = Math.pow(2, 8 * r - 1);
            H(this, t, e, r, i - 1, -i);
          }
          var o = 0,
            s = 1,
            u = 0;
          this[e] = 255 & t;
          while (++o < r && (s *= 256))
            t < 0 && 0 === u && 0 !== this[e + o - 1] && (u = 1),
              (this[e + o] = (((t / s) >> 0) - u) & 255);
          return e + r;
        }),
        (h.prototype.writeIntBE = function (t, e, r, n) {
          if (((t = +t), (e |= 0), !n)) {
            var i = Math.pow(2, 8 * r - 1);
            H(this, t, e, r, i - 1, -i);
          }
          var o = r - 1,
            s = 1,
            u = 0;
          this[e + o] = 255 & t;
          while (--o >= 0 && (s *= 256))
            t < 0 && 0 === u && 0 !== this[e + o + 1] && (u = 1),
              (this[e + o] = (((t / s) >> 0) - u) & 255);
          return e + r;
        }),
        (h.prototype.writeInt8 = function (t, e, r) {
          return (
            (t = +t),
            (e |= 0),
            r || H(this, t, e, 1, 127, -128),
            h.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)),
            t < 0 && (t = 255 + t + 1),
            (this[e] = 255 & t),
            e + 1
          );
        }),
        (h.prototype.writeInt16LE = function (t, e, r) {
          return (
            (t = +t),
            (e |= 0),
            r || H(this, t, e, 2, 32767, -32768),
            h.TYPED_ARRAY_SUPPORT
              ? ((this[e] = 255 & t), (this[e + 1] = t >>> 8))
              : D(this, t, e, !0),
            e + 2
          );
        }),
        (h.prototype.writeInt16BE = function (t, e, r) {
          return (
            (t = +t),
            (e |= 0),
            r || H(this, t, e, 2, 32767, -32768),
            h.TYPED_ARRAY_SUPPORT
              ? ((this[e] = t >>> 8), (this[e + 1] = 255 & t))
              : D(this, t, e, !1),
            e + 2
          );
        }),
        (h.prototype.writeInt32LE = function (t, e, r) {
          return (
            (t = +t),
            (e |= 0),
            r || H(this, t, e, 4, 2147483647, -2147483648),
            h.TYPED_ARRAY_SUPPORT
              ? ((this[e] = 255 & t),
                (this[e + 1] = t >>> 8),
                (this[e + 2] = t >>> 16),
                (this[e + 3] = t >>> 24))
              : F(this, t, e, !0),
            e + 4
          );
        }),
        (h.prototype.writeInt32BE = function (t, e, r) {
          return (
            (t = +t),
            (e |= 0),
            r || H(this, t, e, 4, 2147483647, -2147483648),
            t < 0 && (t = 4294967295 + t + 1),
            h.TYPED_ARRAY_SUPPORT
              ? ((this[e] = t >>> 24),
                (this[e + 1] = t >>> 16),
                (this[e + 2] = t >>> 8),
                (this[e + 3] = 255 & t))
              : F(this, t, e, !1),
            e + 4
          );
        }),
        (h.prototype.writeFloatLE = function (t, e, r) {
          return Z(this, t, e, !0, r);
        }),
        (h.prototype.writeFloatBE = function (t, e, r) {
          return Z(this, t, e, !1, r);
        }),
        (h.prototype.writeDoubleLE = function (t, e, r) {
          return W(this, t, e, !0, r);
        }),
        (h.prototype.writeDoubleBE = function (t, e, r) {
          return W(this, t, e, !1, r);
        }),
        (h.prototype.copy = function (t, e, r, n) {
          if (
            (r || (r = 0),
            n || 0 === n || (n = this.length),
            e >= t.length && (e = t.length),
            e || (e = 0),
            n > 0 && n < r && (n = r),
            n === r)
          )
            return 0;
          if (0 === t.length || 0 === this.length) return 0;
          if (e < 0) throw new RangeError("targetStart out of bounds");
          if (r < 0 || r >= this.length)
            throw new RangeError("sourceStart out of bounds");
          if (n < 0) throw new RangeError("sourceEnd out of bounds");
          n > this.length && (n = this.length),
            t.length - e < n - r && (n = t.length - e + r);
          var i,
            o = n - r;
          if (this === t && r < e && e < n)
            for (i = o - 1; i >= 0; --i) t[i + e] = this[i + r];
          else if (o < 1e3 || !h.TYPED_ARRAY_SUPPORT)
            for (i = 0; i < o; ++i) t[i + e] = this[i + r];
          else Uint8Array.prototype.set.call(t, this.subarray(r, r + o), e);
          return o;
        }),
        (h.prototype.fill = function (t, e, r, n) {
          if ("string" === typeof t) {
            if (
              ("string" === typeof e
                ? ((n = e), (e = 0), (r = this.length))
                : "string" === typeof r && ((n = r), (r = this.length)),
              1 === t.length)
            ) {
              var i = t.charCodeAt(0);
              i < 256 && (t = i);
            }
            if (void 0 !== n && "string" !== typeof n)
              throw new TypeError("encoding must be a string");
            if ("string" === typeof n && !h.isEncoding(n))
              throw new TypeError("Unknown encoding: " + n);
          } else "number" === typeof t && (t &= 255);
          if (e < 0 || this.length < e || this.length < r)
            throw new RangeError("Out of range index");
          if (r <= e) return this;
          var o;
          if (
            ((e >>>= 0),
            (r = void 0 === r ? this.length : r >>> 0),
            t || (t = 0),
            "number" === typeof t)
          )
            for (o = e; o < r; ++o) this[o] = t;
          else {
            var s = h.isBuffer(t) ? t : V(new h(t, n).toString()),
              u = s.length;
            for (o = 0; o < r - e; ++o) this[o + e] = s[o % u];
          }
          return this;
        });
      var G = /[^+\/0-9A-Za-z-_]/g;
      function Y(t) {
        if (((t = $(t).replace(G, "")), t.length < 2)) return "";
        while (t.length % 4 !== 0) t += "=";
        return t;
      }
      function $(t) {
        return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "");
      }
      function X(t) {
        return t < 16 ? "0" + t.toString(16) : t.toString(16);
      }
      function V(t, e) {
        var r;
        e = e || 1 / 0;
        for (var n = t.length, i = null, o = [], s = 0; s < n; ++s) {
          if (((r = t.charCodeAt(s)), r > 55295 && r < 57344)) {
            if (!i) {
              if (r > 56319) {
                (e -= 3) > -1 && o.push(239, 191, 189);
                continue;
              }
              if (s + 1 === n) {
                (e -= 3) > -1 && o.push(239, 191, 189);
                continue;
              }
              i = r;
              continue;
            }
            if (r < 56320) {
              (e -= 3) > -1 && o.push(239, 191, 189), (i = r);
              continue;
            }
            r = 65536 + (((i - 55296) << 10) | (r - 56320));
          } else i && (e -= 3) > -1 && o.push(239, 191, 189);
          if (((i = null), r < 128)) {
            if ((e -= 1) < 0) break;
            o.push(r);
          } else if (r < 2048) {
            if ((e -= 2) < 0) break;
            o.push((r >> 6) | 192, (63 & r) | 128);
          } else if (r < 65536) {
            if ((e -= 3) < 0) break;
            o.push((r >> 12) | 224, ((r >> 6) & 63) | 128, (63 & r) | 128);
          } else {
            if (!(r < 1114112)) throw new Error("Invalid code point");
            if ((e -= 4) < 0) break;
            o.push(
              (r >> 18) | 240,
              ((r >> 12) & 63) | 128,
              ((r >> 6) & 63) | 128,
              (63 & r) | 128
            );
          }
        }
        return o;
      }
      function J(t) {
        for (var e = [], r = 0; r < t.length; ++r)
          e.push(255 & t.charCodeAt(r));
        return e;
      }
      function K(t, e) {
        for (var r, n, i, o = [], s = 0; s < t.length; ++s) {
          if ((e -= 2) < 0) break;
          (r = t.charCodeAt(s)),
            (n = r >> 8),
            (i = r % 256),
            o.push(i),
            o.push(n);
        }
        return o;
      }
      function Q(t) {
        return n.toByteArray(Y(t));
      }
      function tt(t, e, r, n) {
        for (var i = 0; i < n; ++i) {
          if (i + r >= e.length || i >= t.length) break;
          e[i + r] = t[i];
        }
        return i;
      }
      function et(t) {
        return t !== t;
      }
    }.call(this, r("c8ba")));
  },
  "1c55f": function (t, e, r) {
    (function (n, i) {
      var o;
      /**
       * [js-sha3]{@link https://github.com/emn178/js-sha3}
       *
       * @version 0.8.0
       * @author Chen, Yi-Cyuan [emn178@gmail.com]
       * @copyright Chen, Yi-Cyuan 2015-2018
       * @license MIT
       */ (function () {
        "use strict";
        var s = "input is invalid type",
          u = "finalize already called",
          a = "object" === typeof window,
          h = a ? window : {};
        h.JS_SHA3_NO_WINDOW && (a = !1);
        var l = !a && "object" === typeof self,
          f =
            !h.JS_SHA3_NO_NODE_JS &&
            "object" === typeof n &&
            n.versions &&
            n.versions.node;
        f ? (h = i) : l && (h = self);
        var c = !h.JS_SHA3_NO_COMMON_JS && "object" === typeof t && t.exports,
          d = r("3c35"),
          p = !h.JS_SHA3_NO_ARRAY_BUFFER && "undefined" !== typeof ArrayBuffer,
          m = "0123456789abcdef".split(""),
          v = [31, 7936, 2031616, 520093696],
          g = [4, 1024, 262144, 67108864],
          y = [1, 256, 65536, 16777216],
          w = [6, 1536, 393216, 100663296],
          b = [0, 8, 16, 24],
          M = [
            1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0,
            2147483649, 0, 2147516545, 2147483648, 32777, 2147483648, 138, 0,
            136, 0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139,
            2147483648, 32905, 2147483648, 32771, 2147483648, 32770, 2147483648,
            128, 2147483648, 32778, 0, 2147483658, 2147483648, 2147516545,
            2147483648, 32896, 2147483648, 2147483649, 0, 2147516424,
            2147483648,
          ],
          _ = [224, 256, 384, 512],
          x = [128, 256],
          S = ["hex", "buffer", "arrayBuffer", "array", "digest"],
          E = { 128: 168, 256: 136 };
        (!h.JS_SHA3_NO_NODE_JS && Array.isArray) ||
          (Array.isArray = function (t) {
            return "[object Array]" === Object.prototype.toString.call(t);
          }),
          !p ||
            (!h.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW && ArrayBuffer.isView) ||
            (ArrayBuffer.isView = function (t) {
              return (
                "object" === typeof t &&
                t.buffer &&
                t.buffer.constructor === ArrayBuffer
              );
            });
        for (
          var A = function (t, e, r) {
              return function (n) {
                return new Z(t, e, t).update(n)[r]();
              };
            },
            k = function (t, e, r) {
              return function (n, i) {
                return new Z(t, e, i).update(n)[r]();
              };
            },
            O = function (t, e, r) {
              return function (e, n, i, o) {
                return I["cshake" + t].update(e, n, i, o)[r]();
              };
            },
            T = function (t, e, r) {
              return function (e, n, i, o) {
                return I["kmac" + t].update(e, n, i, o)[r]();
              };
            },
            R = function (t, e, r, n) {
              for (var i = 0; i < S.length; ++i) {
                var o = S[i];
                t[o] = e(r, n, o);
              }
              return t;
            },
            C = function (t, e) {
              var r = A(t, e, "hex");
              return (
                (r.create = function () {
                  return new Z(t, e, t);
                }),
                (r.update = function (t) {
                  return r.create().update(t);
                }),
                R(r, A, t, e)
              );
            },
            j = function (t, e) {
              var r = k(t, e, "hex");
              return (
                (r.create = function (r) {
                  return new Z(t, e, r);
                }),
                (r.update = function (t, e) {
                  return r.create(e).update(t);
                }),
                R(r, k, t, e)
              );
            },
            N = function (t, e) {
              var r = E[t],
                n = O(t, e, "hex");
              return (
                (n.create = function (n, i, o) {
                  return i || o
                    ? new Z(t, e, n).bytepad([i, o], r)
                    : I["shake" + t].create(n);
                }),
                (n.update = function (t, e, r, i) {
                  return n.create(e, r, i).update(t);
                }),
                R(n, O, t, e)
              );
            },
            L = function (t, e) {
              var r = E[t],
                n = T(t, e, "hex");
              return (
                (n.create = function (n, i, o) {
                  return new W(t, e, i).bytepad(["KMAC", o], r).bytepad([n], r);
                }),
                (n.update = function (t, e, r, i) {
                  return n.create(t, r, i).update(e);
                }),
                R(n, T, t, e)
              );
            },
            P = [
              { name: "keccak", padding: y, bits: _, createMethod: C },
              { name: "sha3", padding: w, bits: _, createMethod: C },
              { name: "shake", padding: v, bits: x, createMethod: j },
              { name: "cshake", padding: g, bits: x, createMethod: N },
              { name: "kmac", padding: g, bits: x, createMethod: L },
            ],
            I = {},
            B = [],
            q = 0;
          q < P.length;
          ++q
        )
          for (var U = P[q], H = U.bits, D = 0; D < H.length; ++D) {
            var F = U.name + "_" + H[D];
            if (
              (B.push(F),
              (I[F] = U.createMethod(H[D], U.padding)),
              "sha3" !== U.name)
            ) {
              var z = U.name + H[D];
              B.push(z), (I[z] = I[F]);
            }
          }
        function Z(t, e, r) {
          (this.blocks = []),
            (this.s = []),
            (this.padding = e),
            (this.outputBits = r),
            (this.reset = !0),
            (this.finalized = !1),
            (this.block = 0),
            (this.start = 0),
            (this.blockCount = (1600 - (t << 1)) >> 5),
            (this.byteCount = this.blockCount << 2),
            (this.outputBlocks = r >> 5),
            (this.extraBytes = (31 & r) >> 3);
          for (var n = 0; n < 50; ++n) this.s[n] = 0;
        }
        function W(t, e, r) {
          Z.call(this, t, e, r);
        }
        (Z.prototype.update = function (t) {
          if (this.finalized) throw new Error(u);
          var e,
            r = typeof t;
          if ("string" !== r) {
            if ("object" !== r) throw new Error(s);
            if (null === t) throw new Error(s);
            if (p && t.constructor === ArrayBuffer) t = new Uint8Array(t);
            else if (!Array.isArray(t) && (!p || !ArrayBuffer.isView(t)))
              throw new Error(s);
            e = !0;
          }
          var n,
            i,
            o = this.blocks,
            a = this.byteCount,
            h = t.length,
            l = this.blockCount,
            f = 0,
            c = this.s;
          while (f < h) {
            if (this.reset)
              for (this.reset = !1, o[0] = this.block, n = 1; n < l + 1; ++n)
                o[n] = 0;
            if (e)
              for (n = this.start; f < h && n < a; ++f)
                o[n >> 2] |= t[f] << b[3 & n++];
            else
              for (n = this.start; f < h && n < a; ++f)
                (i = t.charCodeAt(f)),
                  i < 128
                    ? (o[n >> 2] |= i << b[3 & n++])
                    : i < 2048
                    ? ((o[n >> 2] |= (192 | (i >> 6)) << b[3 & n++]),
                      (o[n >> 2] |= (128 | (63 & i)) << b[3 & n++]))
                    : i < 55296 || i >= 57344
                    ? ((o[n >> 2] |= (224 | (i >> 12)) << b[3 & n++]),
                      (o[n >> 2] |= (128 | ((i >> 6) & 63)) << b[3 & n++]),
                      (o[n >> 2] |= (128 | (63 & i)) << b[3 & n++]))
                    : ((i =
                        65536 +
                        (((1023 & i) << 10) | (1023 & t.charCodeAt(++f)))),
                      (o[n >> 2] |= (240 | (i >> 18)) << b[3 & n++]),
                      (o[n >> 2] |= (128 | ((i >> 12) & 63)) << b[3 & n++]),
                      (o[n >> 2] |= (128 | ((i >> 6) & 63)) << b[3 & n++]),
                      (o[n >> 2] |= (128 | (63 & i)) << b[3 & n++]));
            if (((this.lastByteIndex = n), n >= a)) {
              for (this.start = n - a, this.block = o[l], n = 0; n < l; ++n)
                c[n] ^= o[n];
              G(c), (this.reset = !0);
            } else this.start = n;
          }
          return this;
        }),
          (Z.prototype.encode = function (t, e) {
            var r = 255 & t,
              n = 1,
              i = [r];
            (t >>= 8), (r = 255 & t);
            while (r > 0) i.unshift(r), (t >>= 8), (r = 255 & t), ++n;
            return e ? i.push(n) : i.unshift(n), this.update(i), i.length;
          }),
          (Z.prototype.encodeString = function (t) {
            var e,
              r = typeof t;
            if ("string" !== r) {
              if ("object" !== r) throw new Error(s);
              if (null === t) throw new Error(s);
              if (p && t.constructor === ArrayBuffer) t = new Uint8Array(t);
              else if (!Array.isArray(t) && (!p || !ArrayBuffer.isView(t)))
                throw new Error(s);
              e = !0;
            }
            var n = 0,
              i = t.length;
            if (e) n = i;
            else
              for (var o = 0; o < t.length; ++o) {
                var u = t.charCodeAt(o);
                u < 128
                  ? (n += 1)
                  : u < 2048
                  ? (n += 2)
                  : u < 55296 || u >= 57344
                  ? (n += 3)
                  : ((u =
                      65536 +
                      (((1023 & u) << 10) | (1023 & t.charCodeAt(++o)))),
                    (n += 4));
              }
            return (n += this.encode(8 * n)), this.update(t), n;
          }),
          (Z.prototype.bytepad = function (t, e) {
            for (var r = this.encode(e), n = 0; n < t.length; ++n)
              r += this.encodeString(t[n]);
            var i = e - (r % e),
              o = [];
            return (o.length = i), this.update(o), this;
          }),
          (Z.prototype.finalize = function () {
            if (!this.finalized) {
              this.finalized = !0;
              var t = this.blocks,
                e = this.lastByteIndex,
                r = this.blockCount,
                n = this.s;
              if (
                ((t[e >> 2] |= this.padding[3 & e]),
                this.lastByteIndex === this.byteCount)
              )
                for (t[0] = t[r], e = 1; e < r + 1; ++e) t[e] = 0;
              for (t[r - 1] |= 2147483648, e = 0; e < r; ++e) n[e] ^= t[e];
              G(n);
            }
          }),
          (Z.prototype.toString = Z.prototype.hex =
            function () {
              this.finalize();
              var t,
                e = this.blockCount,
                r = this.s,
                n = this.outputBlocks,
                i = this.extraBytes,
                o = 0,
                s = 0,
                u = "";
              while (s < n) {
                for (o = 0; o < e && s < n; ++o, ++s)
                  (t = r[o]),
                    (u +=
                      m[(t >> 4) & 15] +
                      m[15 & t] +
                      m[(t >> 12) & 15] +
                      m[(t >> 8) & 15] +
                      m[(t >> 20) & 15] +
                      m[(t >> 16) & 15] +
                      m[(t >> 28) & 15] +
                      m[(t >> 24) & 15]);
                s % e === 0 && (G(r), (o = 0));
              }
              return (
                i &&
                  ((t = r[o]),
                  (u += m[(t >> 4) & 15] + m[15 & t]),
                  i > 1 && (u += m[(t >> 12) & 15] + m[(t >> 8) & 15]),
                  i > 2 && (u += m[(t >> 20) & 15] + m[(t >> 16) & 15])),
                u
              );
            }),
          (Z.prototype.arrayBuffer = function () {
            this.finalize();
            var t,
              e = this.blockCount,
              r = this.s,
              n = this.outputBlocks,
              i = this.extraBytes,
              o = 0,
              s = 0,
              u = this.outputBits >> 3;
            t = i ? new ArrayBuffer((n + 1) << 2) : new ArrayBuffer(u);
            var a = new Uint32Array(t);
            while (s < n) {
              for (o = 0; o < e && s < n; ++o, ++s) a[s] = r[o];
              s % e === 0 && G(r);
            }
            return i && ((a[o] = r[o]), (t = t.slice(0, u))), t;
          }),
          (Z.prototype.buffer = Z.prototype.arrayBuffer),
          (Z.prototype.digest = Z.prototype.array =
            function () {
              this.finalize();
              var t,
                e,
                r = this.blockCount,
                n = this.s,
                i = this.outputBlocks,
                o = this.extraBytes,
                s = 0,
                u = 0,
                a = [];
              while (u < i) {
                for (s = 0; s < r && u < i; ++s, ++u)
                  (t = u << 2),
                    (e = n[s]),
                    (a[t] = 255 & e),
                    (a[t + 1] = (e >> 8) & 255),
                    (a[t + 2] = (e >> 16) & 255),
                    (a[t + 3] = (e >> 24) & 255);
                u % r === 0 && G(n);
              }
              return (
                o &&
                  ((t = u << 2),
                  (e = n[s]),
                  (a[t] = 255 & e),
                  o > 1 && (a[t + 1] = (e >> 8) & 255),
                  o > 2 && (a[t + 2] = (e >> 16) & 255)),
                a
              );
            }),
          (W.prototype = new Z()),
          (W.prototype.finalize = function () {
            return (
              this.encode(this.outputBits, !0), Z.prototype.finalize.call(this)
            );
          });
        var G = function (t) {
          var e,
            r,
            n,
            i,
            o,
            s,
            u,
            a,
            h,
            l,
            f,
            c,
            d,
            p,
            m,
            v,
            g,
            y,
            w,
            b,
            _,
            x,
            S,
            E,
            A,
            k,
            O,
            T,
            R,
            C,
            j,
            N,
            L,
            P,
            I,
            B,
            q,
            U,
            H,
            D,
            F,
            z,
            Z,
            W,
            G,
            Y,
            $,
            X,
            V,
            J,
            K,
            Q,
            tt,
            et,
            rt,
            nt,
            it,
            ot,
            st,
            ut,
            at,
            ht,
            lt;
          for (n = 0; n < 48; n += 2)
            (i = t[0] ^ t[10] ^ t[20] ^ t[30] ^ t[40]),
              (o = t[1] ^ t[11] ^ t[21] ^ t[31] ^ t[41]),
              (s = t[2] ^ t[12] ^ t[22] ^ t[32] ^ t[42]),
              (u = t[3] ^ t[13] ^ t[23] ^ t[33] ^ t[43]),
              (a = t[4] ^ t[14] ^ t[24] ^ t[34] ^ t[44]),
              (h = t[5] ^ t[15] ^ t[25] ^ t[35] ^ t[45]),
              (l = t[6] ^ t[16] ^ t[26] ^ t[36] ^ t[46]),
              (f = t[7] ^ t[17] ^ t[27] ^ t[37] ^ t[47]),
              (c = t[8] ^ t[18] ^ t[28] ^ t[38] ^ t[48]),
              (d = t[9] ^ t[19] ^ t[29] ^ t[39] ^ t[49]),
              (e = c ^ ((s << 1) | (u >>> 31))),
              (r = d ^ ((u << 1) | (s >>> 31))),
              (t[0] ^= e),
              (t[1] ^= r),
              (t[10] ^= e),
              (t[11] ^= r),
              (t[20] ^= e),
              (t[21] ^= r),
              (t[30] ^= e),
              (t[31] ^= r),
              (t[40] ^= e),
              (t[41] ^= r),
              (e = i ^ ((a << 1) | (h >>> 31))),
              (r = o ^ ((h << 1) | (a >>> 31))),
              (t[2] ^= e),
              (t[3] ^= r),
              (t[12] ^= e),
              (t[13] ^= r),
              (t[22] ^= e),
              (t[23] ^= r),
              (t[32] ^= e),
              (t[33] ^= r),
              (t[42] ^= e),
              (t[43] ^= r),
              (e = s ^ ((l << 1) | (f >>> 31))),
              (r = u ^ ((f << 1) | (l >>> 31))),
              (t[4] ^= e),
              (t[5] ^= r),
              (t[14] ^= e),
              (t[15] ^= r),
              (t[24] ^= e),
              (t[25] ^= r),
              (t[34] ^= e),
              (t[35] ^= r),
              (t[44] ^= e),
              (t[45] ^= r),
              (e = a ^ ((c << 1) | (d >>> 31))),
              (r = h ^ ((d << 1) | (c >>> 31))),
              (t[6] ^= e),
              (t[7] ^= r),
              (t[16] ^= e),
              (t[17] ^= r),
              (t[26] ^= e),
              (t[27] ^= r),
              (t[36] ^= e),
              (t[37] ^= r),
              (t[46] ^= e),
              (t[47] ^= r),
              (e = l ^ ((i << 1) | (o >>> 31))),
              (r = f ^ ((o << 1) | (i >>> 31))),
              (t[8] ^= e),
              (t[9] ^= r),
              (t[18] ^= e),
              (t[19] ^= r),
              (t[28] ^= e),
              (t[29] ^= r),
              (t[38] ^= e),
              (t[39] ^= r),
              (t[48] ^= e),
              (t[49] ^= r),
              (p = t[0]),
              (m = t[1]),
              (Y = (t[11] << 4) | (t[10] >>> 28)),
              ($ = (t[10] << 4) | (t[11] >>> 28)),
              (T = (t[20] << 3) | (t[21] >>> 29)),
              (R = (t[21] << 3) | (t[20] >>> 29)),
              (ut = (t[31] << 9) | (t[30] >>> 23)),
              (at = (t[30] << 9) | (t[31] >>> 23)),
              (z = (t[40] << 18) | (t[41] >>> 14)),
              (Z = (t[41] << 18) | (t[40] >>> 14)),
              (P = (t[2] << 1) | (t[3] >>> 31)),
              (I = (t[3] << 1) | (t[2] >>> 31)),
              (v = (t[13] << 12) | (t[12] >>> 20)),
              (g = (t[12] << 12) | (t[13] >>> 20)),
              (X = (t[22] << 10) | (t[23] >>> 22)),
              (V = (t[23] << 10) | (t[22] >>> 22)),
              (C = (t[33] << 13) | (t[32] >>> 19)),
              (j = (t[32] << 13) | (t[33] >>> 19)),
              (ht = (t[42] << 2) | (t[43] >>> 30)),
              (lt = (t[43] << 2) | (t[42] >>> 30)),
              (et = (t[5] << 30) | (t[4] >>> 2)),
              (rt = (t[4] << 30) | (t[5] >>> 2)),
              (B = (t[14] << 6) | (t[15] >>> 26)),
              (q = (t[15] << 6) | (t[14] >>> 26)),
              (y = (t[25] << 11) | (t[24] >>> 21)),
              (w = (t[24] << 11) | (t[25] >>> 21)),
              (J = (t[34] << 15) | (t[35] >>> 17)),
              (K = (t[35] << 15) | (t[34] >>> 17)),
              (N = (t[45] << 29) | (t[44] >>> 3)),
              (L = (t[44] << 29) | (t[45] >>> 3)),
              (E = (t[6] << 28) | (t[7] >>> 4)),
              (A = (t[7] << 28) | (t[6] >>> 4)),
              (nt = (t[17] << 23) | (t[16] >>> 9)),
              (it = (t[16] << 23) | (t[17] >>> 9)),
              (U = (t[26] << 25) | (t[27] >>> 7)),
              (H = (t[27] << 25) | (t[26] >>> 7)),
              (b = (t[36] << 21) | (t[37] >>> 11)),
              (_ = (t[37] << 21) | (t[36] >>> 11)),
              (Q = (t[47] << 24) | (t[46] >>> 8)),
              (tt = (t[46] << 24) | (t[47] >>> 8)),
              (W = (t[8] << 27) | (t[9] >>> 5)),
              (G = (t[9] << 27) | (t[8] >>> 5)),
              (k = (t[18] << 20) | (t[19] >>> 12)),
              (O = (t[19] << 20) | (t[18] >>> 12)),
              (ot = (t[29] << 7) | (t[28] >>> 25)),
              (st = (t[28] << 7) | (t[29] >>> 25)),
              (D = (t[38] << 8) | (t[39] >>> 24)),
              (F = (t[39] << 8) | (t[38] >>> 24)),
              (x = (t[48] << 14) | (t[49] >>> 18)),
              (S = (t[49] << 14) | (t[48] >>> 18)),
              (t[0] = p ^ (~v & y)),
              (t[1] = m ^ (~g & w)),
              (t[10] = E ^ (~k & T)),
              (t[11] = A ^ (~O & R)),
              (t[20] = P ^ (~B & U)),
              (t[21] = I ^ (~q & H)),
              (t[30] = W ^ (~Y & X)),
              (t[31] = G ^ (~$ & V)),
              (t[40] = et ^ (~nt & ot)),
              (t[41] = rt ^ (~it & st)),
              (t[2] = v ^ (~y & b)),
              (t[3] = g ^ (~w & _)),
              (t[12] = k ^ (~T & C)),
              (t[13] = O ^ (~R & j)),
              (t[22] = B ^ (~U & D)),
              (t[23] = q ^ (~H & F)),
              (t[32] = Y ^ (~X & J)),
              (t[33] = $ ^ (~V & K)),
              (t[42] = nt ^ (~ot & ut)),
              (t[43] = it ^ (~st & at)),
              (t[4] = y ^ (~b & x)),
              (t[5] = w ^ (~_ & S)),
              (t[14] = T ^ (~C & N)),
              (t[15] = R ^ (~j & L)),
              (t[24] = U ^ (~D & z)),
              (t[25] = H ^ (~F & Z)),
              (t[34] = X ^ (~J & Q)),
              (t[35] = V ^ (~K & tt)),
              (t[44] = ot ^ (~ut & ht)),
              (t[45] = st ^ (~at & lt)),
              (t[6] = b ^ (~x & p)),
              (t[7] = _ ^ (~S & m)),
              (t[16] = C ^ (~N & E)),
              (t[17] = j ^ (~L & A)),
              (t[26] = D ^ (~z & P)),
              (t[27] = F ^ (~Z & I)),
              (t[36] = J ^ (~Q & W)),
              (t[37] = K ^ (~tt & G)),
              (t[46] = ut ^ (~ht & et)),
              (t[47] = at ^ (~lt & rt)),
              (t[8] = x ^ (~p & v)),
              (t[9] = S ^ (~m & g)),
              (t[18] = N ^ (~E & k)),
              (t[19] = L ^ (~A & O)),
              (t[28] = z ^ (~P & B)),
              (t[29] = Z ^ (~I & q)),
              (t[38] = Q ^ (~W & Y)),
              (t[39] = tt ^ (~G & $)),
              (t[48] = ht ^ (~et & nt)),
              (t[49] = lt ^ (~rt & it)),
              (t[0] ^= M[n]),
              (t[1] ^= M[n + 1]);
        };
        if (c) t.exports = I;
        else {
          for (q = 0; q < B.length; ++q) h[B[q]] = I[B[q]];
          d &&
            ((o = function () {
              return I;
            }.call(e, r, e, t)),
            void 0 === o || (t.exports = o));
        }
      })();
    }.call(this, r("2820"), r("c8ba")));
  },
  "1c7e": function (t, e, r) {
    var n = r("b622"),
      i = n("iterator"),
      o = !1;
    try {
      var s = 0,
        u = {
          next: function () {
            return { done: !!s++ };
          },
          return: function () {
            o = !0;
          },
        };
      (u[i] = function () {
        return this;
      }),
        Array.from(u, function () {
          throw 2;
        });
    } catch (a) {}
    t.exports = function (t, e) {
      if (!e && !o) return !1;
      var r = !1;
      try {
        var n = {};
        (n[i] = function () {
          return {
            next: function () {
              return { done: (r = !0) };
            },
          };
        }),
          t(n);
      } catch (a) {}
      return r;
    };
  },
  "1cdc": function (t, e, r) {
    var n = r("342f");
    t.exports = /(iphone|ipod|ipad).*applewebkit/i.test(n);
  },
  "1d80": function (t, e) {
    t.exports = function (t) {
      if (void 0 == t) throw TypeError("Can't call method on " + t);
      return t;
    };
  },
  "1da1": function (t, e, r) {
    "use strict";
    r.d(e, "a", function () {
      return i;
    });
    r("d3b7");
    function n(t, e, r, n, i, o, s) {
      try {
        var u = t[o](s),
          a = u.value;
      } catch (h) {
        return void r(h);
      }
      u.done ? e(a) : Promise.resolve(a).then(n, i);
    }
    function i(t) {
      return function () {
        var e = this,
          r = arguments;
        return new Promise(function (i, o) {
          var s = t.apply(e, r);
          function u(t) {
            n(s, i, o, u, a, "next", t);
          }
          function a(t) {
            n(s, i, o, u, a, "throw", t);
          }
          u(void 0);
        });
      };
    }
  },
  "1dde": function (t, e, r) {
    var n = r("d039"),
      i = r("b622"),
      o = r("2d00"),
      s = i("species");
    t.exports = function (t) {
      return (
        o >= 51 ||
        !n(function () {
          var e = [],
            r = (e.constructor = {});
          return (
            (r[s] = function () {
              return { foo: 1 };
            }),
            1 !== e[t](Boolean).foo
          );
        })
      );
    };
  },
  "1fb5": function (t, e, r) {
    "use strict";
    (e.byteLength = l), (e.toByteArray = c), (e.fromByteArray = m);
    for (
      var n = [],
        i = [],
        o = "undefined" !== typeof Uint8Array ? Uint8Array : Array,
        s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        u = 0,
        a = s.length;
      u < a;
      ++u
    )
      (n[u] = s[u]), (i[s.charCodeAt(u)] = u);
    function h(t) {
      var e = t.length;
      if (e % 4 > 0)
        throw new Error("Invalid string. Length must be a multiple of 4");
      var r = t.indexOf("=");
      -1 === r && (r = e);
      var n = r === e ? 0 : 4 - (r % 4);
      return [r, n];
    }
    function l(t) {
      var e = h(t),
        r = e[0],
        n = e[1];
      return (3 * (r + n)) / 4 - n;
    }
    function f(t, e, r) {
      return (3 * (e + r)) / 4 - r;
    }
    function c(t) {
      var e,
        r,
        n = h(t),
        s = n[0],
        u = n[1],
        a = new o(f(t, s, u)),
        l = 0,
        c = u > 0 ? s - 4 : s;
      for (r = 0; r < c; r += 4)
        (e =
          (i[t.charCodeAt(r)] << 18) |
          (i[t.charCodeAt(r + 1)] << 12) |
          (i[t.charCodeAt(r + 2)] << 6) |
          i[t.charCodeAt(r + 3)]),
          (a[l++] = (e >> 16) & 255),
          (a[l++] = (e >> 8) & 255),
          (a[l++] = 255 & e);
      return (
        2 === u &&
          ((e = (i[t.charCodeAt(r)] << 2) | (i[t.charCodeAt(r + 1)] >> 4)),
          (a[l++] = 255 & e)),
        1 === u &&
          ((e =
            (i[t.charCodeAt(r)] << 10) |
            (i[t.charCodeAt(r + 1)] << 4) |
            (i[t.charCodeAt(r + 2)] >> 2)),
          (a[l++] = (e >> 8) & 255),
          (a[l++] = 255 & e)),
        a
      );
    }
    function d(t) {
      return (
        n[(t >> 18) & 63] + n[(t >> 12) & 63] + n[(t >> 6) & 63] + n[63 & t]
      );
    }
    function p(t, e, r) {
      for (var n, i = [], o = e; o < r; o += 3)
        (n =
          ((t[o] << 16) & 16711680) +
          ((t[o + 1] << 8) & 65280) +
          (255 & t[o + 2])),
          i.push(d(n));
      return i.join("");
    }
    function m(t) {
      for (
        var e, r = t.length, i = r % 3, o = [], s = 16383, u = 0, a = r - i;
        u < a;
        u += s
      )
        o.push(p(t, u, u + s > a ? a : u + s));
      return (
        1 === i
          ? ((e = t[r - 1]), o.push(n[e >> 2] + n[(e << 4) & 63] + "=="))
          : 2 === i &&
            ((e = (t[r - 2] << 8) + t[r - 1]),
            o.push(n[e >> 10] + n[(e >> 4) & 63] + n[(e << 2) & 63] + "=")),
        o.join("")
      );
    }
    (i["-".charCodeAt(0)] = 62), (i["_".charCodeAt(0)] = 63);
  },
  "1fc6": function (t, e, r) {
    "use strict";
    var n = r("1131"),
      i = r("6211"),
      o = function (t, e) {
        var r = t;
        while (r.length < 2 * e) r = "0" + r;
        return r;
      },
      s = function (t) {
        var e = "A".charCodeAt(0),
          r = "Z".charCodeAt(0);
        return (
          (t = t.toUpperCase()),
          (t = t.substr(4) + t.substr(0, 4)),
          t
            .split("")
            .map(function (t) {
              var n = t.charCodeAt(0);
              return n >= e && n <= r ? n - e + 10 : t;
            })
            .join("")
        );
      },
      u = function (t) {
        var e,
          r = t;
        while (r.length > 2)
          (e = r.slice(0, 9)), (r = (parseInt(e, 10) % 97) + r.slice(e.length));
        return parseInt(r, 10) % 97;
      },
      a = function (t) {
        this._iban = t;
      };
    (a.toAddress = function (t) {
      if (((t = new a(t)), !t.isDirect()))
        throw new Error("IBAN is indirect and can't be converted");
      return t.toAddress();
    }),
      (a.toIban = function (t) {
        return a.fromAddress(t).toString();
      }),
      (a.fromAddress = function (t) {
        if (!n.isAddress(t))
          throw new Error("Provided address is not a valid address: " + t);
        t = t.replace("0x", "").replace("0X", "");
        var e = new i(t, 16),
          r = e.toString(36),
          s = o(r, 15);
        return a.fromBban(s.toUpperCase());
      }),
      (a.fromBban = function (t) {
        var e = "XE",
          r = u(s(e + "00" + t)),
          n = ("0" + (98 - r)).slice(-2);
        return new a(e + n + t);
      }),
      (a.createIndirect = function (t) {
        return a.fromBban("ETH" + t.institution + t.identifier);
      }),
      (a.isValid = function (t) {
        var e = new a(t);
        return e.isValid();
      }),
      (a.prototype.isValid = function () {
        return (
          /^XE[0-9]{2}(ETH[0-9A-Z]{13}|[0-9A-Z]{30,31})$/.test(this._iban) &&
          1 === u(s(this._iban))
        );
      }),
      (a.prototype.isDirect = function () {
        return 34 === this._iban.length || 35 === this._iban.length;
      }),
      (a.prototype.isIndirect = function () {
        return 20 === this._iban.length;
      }),
      (a.prototype.checksum = function () {
        return this._iban.substr(2, 2);
      }),
      (a.prototype.institution = function () {
        return this.isIndirect() ? this._iban.substr(7, 4) : "";
      }),
      (a.prototype.client = function () {
        return this.isIndirect() ? this._iban.substr(11) : "";
      }),
      (a.prototype.toAddress = function () {
        if (this.isDirect()) {
          var t = this._iban.substr(4),
            e = new i(t, 36);
          return n.toChecksumAddress(e.toString(16, 20));
        }
        return "";
      }),
      (a.prototype.toString = function () {
        return this._iban;
      }),
      (t.exports = a);
  },
  2: function (t, e) {},
  2091: function (t, e, r) {
    var n = r("17fb"),
      i = r("f609"),
      o = r("e870"),
      s = function (t) {
        return t.startsWith("int[")
          ? "int256" + t.slice(3)
          : "int" === t
          ? "int256"
          : t.startsWith("uint[")
          ? "uint256" + t.slice(4)
          : "uint" === t
          ? "uint256"
          : t.startsWith("fixed[")
          ? "fixed128x128" + t.slice(5)
          : "fixed" === t
          ? "fixed128x128"
          : t.startsWith("ufixed[")
          ? "ufixed128x128" + t.slice(6)
          : "ufixed" === t
          ? "ufixed128x128"
          : t;
      },
      u = function (t) {
        var e = /^\D+(\d+).*$/.exec(t);
        return e ? parseInt(e[1], 10) : null;
      },
      a = function (t) {
        var e = /^\D+\d*\[(\d+)\]$/.exec(t);
        return e ? parseInt(e[1], 10) : null;
      },
      h = function (t) {
        var e = typeof t;
        if ("string" === e)
          return o.isHexStrict(t)
            ? new i(t.replace(/0x/i, ""), 16)
            : new i(t, 10);
        if ("number" === e) return new i(t);
        if (o.isBigNumber(t)) return new i(t.toString(10));
        if (o.isBN(t)) return t;
        throw new Error(t + " is not a number");
      },
      l = function (t, e, r) {
        var n, a;
        if (((t = s(t)), "bytes" === t)) {
          if (e.replace(/^0x/i, "").length % 2 !== 0)
            throw new Error("Invalid bytes characters " + e.length);
          return e;
        }
        if ("string" === t) return o.utf8ToHex(e);
        if ("bool" === t) return e ? "01" : "00";
        if (t.startsWith("address")) {
          if (((n = r ? 64 : 40), !o.isAddress(e)))
            throw new Error(
              e + " is not a valid address, or the checksum is invalid."
            );
          return o.leftPad(e.toLowerCase(), n);
        }
        if (((n = u(t)), t.startsWith("bytes"))) {
          if (!n) throw new Error("bytes[] not yet supported in solidity");
          if (
            (r && (n = 32),
            n < 1 || n > 32 || n < e.replace(/^0x/i, "").length / 2)
          )
            throw new Error("Invalid bytes" + n + " for " + e);
          return o.rightPad(e, 2 * n);
        }
        if (t.startsWith("uint")) {
          if (n % 8 || n < 8 || n > 256)
            throw new Error("Invalid uint" + n + " size");
          if (((a = h(e)), a.bitLength() > n))
            throw new Error(
              "Supplied uint exceeds width: " + n + " vs " + a.bitLength()
            );
          if (a.lt(new i(0)))
            throw new Error("Supplied uint " + a.toString() + " is negative");
          return n ? o.leftPad(a.toString("hex"), (n / 8) * 2) : a;
        }
        if (t.startsWith("int")) {
          if (n % 8 || n < 8 || n > 256)
            throw new Error("Invalid int" + n + " size");
          if (((a = h(e)), a.bitLength() > n))
            throw new Error(
              "Supplied int exceeds width: " + n + " vs " + a.bitLength()
            );
          return a.lt(new i(0))
            ? a.toTwos(n).toString("hex")
            : n
            ? o.leftPad(a.toString("hex"), (n / 8) * 2)
            : a;
        }
        throw new Error("Unsupported or invalid type: " + t);
      },
      f = function (t) {
        if (n.isArray(t))
          throw new Error("Autodetection of array types is not supported.");
        var e,
          r,
          s,
          u = "";
        if (
          (n.isObject(t) &&
          (t.hasOwnProperty("v") ||
            t.hasOwnProperty("t") ||
            t.hasOwnProperty("value") ||
            t.hasOwnProperty("type"))
            ? ((e = t.hasOwnProperty("t") ? t.t : t.type),
              (u = t.hasOwnProperty("v") ? t.v : t.value))
            : ((e = o.toHex(t, !0)),
              (u = o.toHex(t)),
              e.startsWith("int") || e.startsWith("uint") || (e = "bytes")),
          (!e.startsWith("int") && !e.startsWith("uint")) ||
            "string" !== typeof u ||
            /^(-)?0x/i.test(u) ||
            (u = new i(u)),
          n.isArray(u))
        ) {
          if (((s = a(e)), s && u.length !== s))
            throw new Error(
              e + " is not matching the given array " + JSON.stringify(u)
            );
          s = u.length;
        }
        return n.isArray(u)
          ? ((r = u.map(function (t) {
              return l(e, t, s).toString("hex").replace("0x", "");
            })),
            r.join(""))
          : ((r = l(e, u, s)), r.toString("hex").replace("0x", ""));
      },
      c = function () {
        var t = Array.prototype.slice.call(arguments),
          e = n.map(t, f);
        return o.sha3("0x" + e.join(""));
      },
      d = function () {
        return o.sha3Raw(
          "0x" + n.map(Array.prototype.slice.call(arguments), f).join("")
        );
      };
    t.exports = { soliditySha3: c, soliditySha3Raw: d };
  },
  2266: function (t, e, r) {
    var n = r("825a"),
      i = r("e95a"),
      o = r("50c4"),
      s = r("0366"),
      u = r("35a1"),
      a = r("2a62"),
      h = function (t, e) {
        (this.stopped = t), (this.result = e);
      };
    t.exports = function (t, e, r) {
      var l,
        f,
        c,
        d,
        p,
        m,
        v,
        g = r && r.that,
        y = !(!r || !r.AS_ENTRIES),
        w = !(!r || !r.IS_ITERATOR),
        b = !(!r || !r.INTERRUPTED),
        M = s(e, g, 1 + y + b),
        _ = function (t) {
          return l && a(l), new h(!0, t);
        },
        x = function (t) {
          return y
            ? (n(t), b ? M(t[0], t[1], _) : M(t[0], t[1]))
            : b
            ? M(t, _)
            : M(t);
        };
      if (w) l = t;
      else {
        if (((f = u(t)), "function" != typeof f))
          throw TypeError("Target is not iterable");
        if (i(f)) {
          for (c = 0, d = o(t.length); d > c; c++)
            if (((p = x(t[c])), p && p instanceof h)) return p;
          return new h(!1);
        }
        l = f.call(t);
      }
      m = l.next;
      while (!(v = m.call(l)).done) {
        try {
          p = x(v.value);
        } catch (S) {
          throw (a(l), S);
        }
        if ("object" == typeof p && p && p instanceof h) return p;
      }
      return new h(!1);
    };
  },
  "23cb": function (t, e, r) {
    var n = r("a691"),
      i = Math.max,
      o = Math.min;
    t.exports = function (t, e) {
      var r = n(t);
      return r < 0 ? i(r + e, 0) : o(r, e);
    };
  },
  "23e7": function (t, e, r) {
    var n = r("da84"),
      i = r("06cf").f,
      o = r("9112"),
      s = r("6eeb"),
      u = r("ce4e"),
      a = r("e893"),
      h = r("94ca");
    t.exports = function (t, e) {
      var r,
        l,
        f,
        c,
        d,
        p,
        m = t.target,
        v = t.global,
        g = t.stat;
      if (((l = v ? n : g ? n[m] || u(m, {}) : (n[m] || {}).prototype), l))
        for (f in e) {
          if (
            ((d = e[f]),
            t.noTargetGet ? ((p = i(l, f)), (c = p && p.value)) : (c = l[f]),
            (r = h(v ? f : m + (g ? "." : "#") + f, t.forced)),
            !r && void 0 !== c)
          ) {
            if (typeof d === typeof c) continue;
            a(d, c);
          }
          (t.sham || (c && c.sham)) && o(d, "sham", !0), s(l, f, d, t);
        }
    };
  },
  "241c": function (t, e, r) {
    var n = r("ca84"),
      i = r("7839"),
      o = i.concat("length", "prototype");
    e.f =
      Object.getOwnPropertyNames ||
      function (t) {
        return n(t, o);
      };
  },
  "24f8": function (t, e, r) {
    var n = r("9490"),
      i = r("0b16"),
      o = t.exports;
    for (var s in n) n.hasOwnProperty(s) && (o[s] = n[s]);
    function u(t) {
      if (
        ("string" === typeof t && (t = i.parse(t)),
        t.protocol || (t.protocol = "https:"),
        "https:" !== t.protocol)
      )
        throw new Error(
          'Protocol "' + t.protocol + '" not supported. Expected "https:"'
        );
      return t;
    }
    (o.request = function (t, e) {
      return (t = u(t)), n.request.call(this, t, e);
    }),
      (o.get = function (t, e) {
        return (t = u(t)), n.get.call(this, t, e);
      });
  },
  "25f0": function (t, e, r) {
    "use strict";
    var n = r("6eeb"),
      i = r("825a"),
      o = r("d039"),
      s = r("ad6d"),
      u = "toString",
      a = RegExp.prototype,
      h = a[u],
      l = o(function () {
        return "/a/b" != h.call({ source: "a", flags: "b" });
      }),
      f = h.name != u;
    (l || f) &&
      n(
        RegExp.prototype,
        u,
        function () {
          var t = i(this),
            e = String(t.source),
            r = t.flags,
            n = String(
              void 0 === r && t instanceof RegExp && !("flags" in a)
                ? s.call(t)
                : r
            );
          return "/" + e + "/" + n;
        },
        { unsafe: !0 }
      );
  },
  2626: function (t, e, r) {
    "use strict";
    var n = r("d066"),
      i = r("9bf2"),
      o = r("b622"),
      s = r("83ab"),
      u = o("species");
    t.exports = function (t) {
      var e = n(t),
        r = i.f;
      s &&
        e &&
        !e[u] &&
        r(e, u, {
          configurable: !0,
          get: function () {
            return this;
          },
        });
    };
  },
  "262e": function (t, e, r) {
    "use strict";
    r.d(e, "a", function () {
      return i;
    });
    var n = r("b380");
    function i(t, e) {
      if ("function" !== typeof e && null !== e)
        throw new TypeError(
          "Super expression must either be null or a function"
        );
      (t.prototype = Object.create(e && e.prototype, {
        constructor: { value: t, writable: !0, configurable: !0 },
      })),
        e && Object(n["a"])(t, e);
    }
  },
  2820: function (t, e) {
    var r,
      n,
      i = (t.exports = {});
    function o() {
      throw new Error("setTimeout has not been defined");
    }
    function s() {
      throw new Error("clearTimeout has not been defined");
    }
    function u(t) {
      if (r === setTimeout) return setTimeout(t, 0);
      if ((r === o || !r) && setTimeout)
        return (r = setTimeout), setTimeout(t, 0);
      try {
        return r(t, 0);
      } catch (e) {
        try {
          return r.call(null, t, 0);
        } catch (e) {
          return r.call(this, t, 0);
        }
      }
    }
    function a(t) {
      if (n === clearTimeout) return clearTimeout(t);
      if ((n === s || !n) && clearTimeout)
        return (n = clearTimeout), clearTimeout(t);
      try {
        return n(t);
      } catch (e) {
        try {
          return n.call(null, t);
        } catch (e) {
          return n.call(this, t);
        }
      }
    }
    (function () {
      try {
        r = "function" === typeof setTimeout ? setTimeout : o;
      } catch (t) {
        r = o;
      }
      try {
        n = "function" === typeof clearTimeout ? clearTimeout : s;
      } catch (t) {
        n = s;
      }
    })();
    var h,
      l = [],
      f = !1,
      c = -1;
    function d() {
      f &&
        h &&
        ((f = !1), h.length ? (l = h.concat(l)) : (c = -1), l.length && p());
    }
    function p() {
      if (!f) {
        var t = u(d);
        f = !0;
        var e = l.length;
        while (e) {
          (h = l), (l = []);
          while (++c < e) h && h[c].run();
          (c = -1), (e = l.length);
        }
        (h = null), (f = !1), a(t);
      }
    }
    function m(t, e) {
      (this.fun = t), (this.array = e);
    }
    function v() {}
    (i.nextTick = function (t) {
      var e = new Array(arguments.length - 1);
      if (arguments.length > 1)
        for (var r = 1; r < arguments.length; r++) e[r - 1] = arguments[r];
      l.push(new m(t, e)), 1 !== l.length || f || u(p);
    }),
      (m.prototype.run = function () {
        this.fun.apply(null, this.array);
      }),
      (i.title = "browser"),
      (i.browser = !0),
      (i.env = {}),
      (i.argv = []),
      (i.version = ""),
      (i.versions = {}),
      (i.on = v),
      (i.addListener = v),
      (i.once = v),
      (i.off = v),
      (i.removeListener = v),
      (i.removeAllListeners = v),
      (i.emit = v),
      (i.prependListener = v),
      (i.prependOnceListener = v),
      (i.listeners = function (t) {
        return [];
      }),
      (i.binding = function (t) {
        throw new Error("process.binding is not supported");
      }),
      (i.cwd = function () {
        return "/";
      }),
      (i.chdir = function (t) {
        throw new Error("process.chdir is not supported");
      }),
      (i.umask = function () {
        return 0;
      });
  },
  "2a62": function (t, e, r) {
    var n = r("825a");
    t.exports = function (t) {
      var e = t["return"];
      if (void 0 !== e) return n(e.call(t)).value;
    };
  },
  "2caf": function (t, e, r) {
    "use strict";
    r.d(e, "a", function () {
      return s;
    });
    r("4ae1");
    var n = r("7e84"),
      i = r("d967"),
      o = r("99de");
    function s(t) {
      var e = Object(i["a"])();
      return function () {
        var r,
          i = Object(n["a"])(t);
        if (e) {
          var s = Object(n["a"])(this).constructor;
          r = Reflect.construct(i, arguments, s);
        } else r = i.apply(this, arguments);
        return Object(o["a"])(this, r);
      };
    }
  },
  "2cf4": function (t, e, r) {
    var n,
      i,
      o,
      s = r("da84"),
      u = r("d039"),
      a = r("0366"),
      h = r("1be4"),
      l = r("cc12"),
      f = r("1cdc"),
      c = r("605d"),
      d = s.location,
      p = s.setImmediate,
      m = s.clearImmediate,
      v = s.process,
      g = s.MessageChannel,
      y = s.Dispatch,
      w = 0,
      b = {},
      M = "onreadystatechange",
      _ = function (t) {
        if (b.hasOwnProperty(t)) {
          var e = b[t];
          delete b[t], e();
        }
      },
      x = function (t) {
        return function () {
          _(t);
        };
      },
      S = function (t) {
        _(t.data);
      },
      E = function (t) {
        s.postMessage(t + "", d.protocol + "//" + d.host);
      };
    (p && m) ||
      ((p = function (t) {
        var e = [],
          r = 1;
        while (arguments.length > r) e.push(arguments[r++]);
        return (
          (b[++w] = function () {
            ("function" == typeof t ? t : Function(t)).apply(void 0, e);
          }),
          n(w),
          w
        );
      }),
      (m = function (t) {
        delete b[t];
      }),
      c
        ? (n = function (t) {
            v.nextTick(x(t));
          })
        : y && y.now
        ? (n = function (t) {
            y.now(x(t));
          })
        : g && !f
        ? ((i = new g()),
          (o = i.port2),
          (i.port1.onmessage = S),
          (n = a(o.postMessage, o, 1)))
        : s.addEventListener &&
          "function" == typeof postMessage &&
          !s.importScripts &&
          d &&
          "file:" !== d.protocol &&
          !u(E)
        ? ((n = E), s.addEventListener("message", S, !1))
        : (n =
            M in l("script")
              ? function (t) {
                  h.appendChild(l("script"))[M] = function () {
                    h.removeChild(this), _(t);
                  };
                }
              : function (t) {
                  setTimeout(x(t), 0);
                })),
      (t.exports = { set: p, clear: m });
  },
  "2d00": function (t, e, r) {
    var n,
      i,
      o = r("da84"),
      s = r("342f"),
      u = o.process,
      a = u && u.versions,
      h = a && a.v8;
    h
      ? ((n = h.split(".")), (i = n[0] + n[1]))
      : s &&
        ((n = s.match(/Edge\/(\d+)/)),
        (!n || n[1] >= 74) &&
          ((n = s.match(/Chrome\/(\d+)/)), n && (i = n[1]))),
      (t.exports = i && +i);
  },
  3: function (t, e) {},
  3410: function (t, e, r) {
    var n = r("23e7"),
      i = r("d039"),
      o = r("7b0b"),
      s = r("e163"),
      u = r("e177"),
      a = i(function () {
        s(1);
      });
    n(
      { target: "Object", stat: !0, forced: a, sham: !u },
      {
        getPrototypeOf: function (t) {
          return s(o(t));
        },
      }
    );
  },
  "342f": function (t, e, r) {
    var n = r("d066");
    t.exports = n("navigator", "userAgent") || "";
  },
  "35a1": function (t, e, r) {
    var n = r("f5df"),
      i = r("3f8c"),
      o = r("b622"),
      s = o("iterator");
    t.exports = function (t) {
      if (void 0 != t) return t[s] || t["@@iterator"] || i[n(t)];
    };
  },
  "35e8": function (t, e, r) {
    "use strict";
    t.exports = {
      isString: function (t) {
        return "string" === typeof t;
      },
      isObject: function (t) {
        return "object" === typeof t && null !== t;
      },
      isNull: function (t) {
        return null === t;
      },
      isNullOrUndefined: function (t) {
        return null == t;
      },
    };
  },
  "37da": function (t, e, r) {
    "use strict";
    (function (t, n) {
      var i =
          (this && this.__extends) ||
          (function () {
            var t =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (t, e) {
                  t.__proto__ = e;
                }) ||
              function (t, e) {
                for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
              };
            return function (e, r) {
              function n() {
                this.constructor = e;
              }
              t(e, r),
                (e.prototype =
                  null === r
                    ? Object.create(r)
                    : ((n.prototype = r.prototype), new n()));
            };
          })(),
        o =
          (this && this.__assign) ||
          Object.assign ||
          function (t) {
            for (var e, r = 1, n = arguments.length; r < n; r++)
              for (var i in ((e = arguments[r]), e))
                Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t;
          };
      Object.defineProperty(e, "__esModule", { value: !0 });
      var s = r("9490"),
        u = r("24f8"),
        a = r("3c43"),
        h = r("0b16"),
        l = r("a393"),
        f = r("f9e1"),
        c = r("65eb"),
        d = r("4633"),
        p = r("a6ca"),
        m = (function (e) {
          function r(n) {
            void 0 === n && (n = {});
            var i = e.call(this) || this;
            return (
              (i.UNSENT = r.UNSENT),
              (i.OPENED = r.OPENED),
              (i.HEADERS_RECEIVED = r.HEADERS_RECEIVED),
              (i.LOADING = r.LOADING),
              (i.DONE = r.DONE),
              (i.onreadystatechange = null),
              (i.readyState = r.UNSENT),
              (i.response = null),
              (i.responseText = ""),
              (i.responseType = ""),
              (i.status = 0),
              (i.statusText = ""),
              (i.timeout = 0),
              (i.upload = new d.XMLHttpRequestUpload()),
              (i.responseUrl = ""),
              (i.withCredentials = !1),
              (i._method = null),
              (i._url = null),
              (i._sync = !1),
              (i._headers = {}),
              (i._loweredHeaders = {}),
              (i._mimeOverride = null),
              (i._request = null),
              (i._response = null),
              (i._responseParts = null),
              (i._responseHeaders = null),
              (i._aborting = null),
              (i._error = null),
              (i._loadedBytes = 0),
              (i._totalBytes = 0),
              (i._lengthComputable = !1),
              (i._restrictedMethods = { CONNECT: !0, TRACE: !0, TRACK: !0 }),
              (i._restrictedHeaders = {
                "accept-charset": !0,
                "accept-encoding": !0,
                "access-control-request-headers": !0,
                "access-control-request-method": !0,
                connection: !0,
                "content-length": !0,
                cookie: !0,
                cookie2: !0,
                date: !0,
                dnt: !0,
                expect: !0,
                host: !0,
                "keep-alive": !0,
                origin: !0,
                referer: !0,
                te: !0,
                trailer: !0,
                "transfer-encoding": !0,
                upgrade: !0,
                "user-agent": !0,
                via: !0,
              }),
              (i._privateHeaders = { "set-cookie": !0, "set-cookie2": !0 }),
              (i._userAgent =
                "Mozilla/5.0 (" +
                a.type() +
                " " +
                a.arch() +
                ") node.js/" +
                t.versions.node +
                " v8/" +
                t.versions.v8),
              (i._anonymous = n.anon || !1),
              i
            );
          }
          return (
            i(r, e),
            (r.prototype.open = function (t, e, n, i, o) {
              if (
                (void 0 === n && (n = !0),
                (t = t.toUpperCase()),
                this._restrictedMethods[t])
              )
                throw new r.SecurityError(
                  "HTTP method " + t + " is not allowed in XHR"
                );
              var s = this._parseUrl(e, i, o);
              this.readyState === r.HEADERS_RECEIVED ||
                (this.readyState, r.LOADING),
                (this._method = t),
                (this._url = s),
                (this._sync = !n),
                (this._headers = {}),
                (this._loweredHeaders = {}),
                (this._mimeOverride = null),
                this._setReadyState(r.OPENED),
                (this._request = null),
                (this._response = null),
                (this.status = 0),
                (this.statusText = ""),
                (this._responseParts = []),
                (this._responseHeaders = null),
                (this._loadedBytes = 0),
                (this._totalBytes = 0),
                (this._lengthComputable = !1);
            }),
            (r.prototype.setRequestHeader = function (t, e) {
              if (this.readyState !== r.OPENED)
                throw new r.InvalidStateError("XHR readyState must be OPENED");
              var n = t.toLowerCase();
              this._restrictedHeaders[n] || /^sec-/.test(n) || /^proxy-/.test(n)
                ? console.warn('Refused to set unsafe header "' + t + '"')
                : ((e = e.toString()),
                  null != this._loweredHeaders[n]
                    ? ((t = this._loweredHeaders[n]),
                      (this._headers[t] = this._headers[t] + ", " + e))
                    : ((this._loweredHeaders[n] = t), (this._headers[t] = e)));
            }),
            (r.prototype.send = function (t) {
              if (this.readyState !== r.OPENED)
                throw new r.InvalidStateError("XHR readyState must be OPENED");
              if (this._request)
                throw new r.InvalidStateError("send() already called");
              switch (this._url.protocol) {
                case "file:":
                  return this._sendFile(t);
                case "http:":
                case "https:":
                  return this._sendHttp(t);
                default:
                  throw new r.NetworkError(
                    "Unsupported protocol " + this._url.protocol
                  );
              }
            }),
            (r.prototype.abort = function () {
              null != this._request &&
                (this._request.abort(),
                this._setError(),
                this._dispatchProgress("abort"),
                this._dispatchProgress("loadend"));
            }),
            (r.prototype.getResponseHeader = function (t) {
              if (null == this._responseHeaders || null == t) return null;
              var e = t.toLowerCase();
              return this._responseHeaders.hasOwnProperty(e)
                ? this._responseHeaders[t.toLowerCase()]
                : null;
            }),
            (r.prototype.getAllResponseHeaders = function () {
              var t = this;
              return null == this._responseHeaders
                ? ""
                : Object.keys(this._responseHeaders)
                    .map(function (e) {
                      return e + ": " + t._responseHeaders[e];
                    })
                    .join("\r\n");
            }),
            (r.prototype.overrideMimeType = function (t) {
              if (this.readyState === r.LOADING || this.readyState === r.DONE)
                throw new r.InvalidStateError(
                  "overrideMimeType() not allowed in LOADING or DONE"
                );
              this._mimeOverride = t.toLowerCase();
            }),
            (r.prototype.nodejsSet = function (t) {
              if (
                ((this.nodejsHttpAgent = t.httpAgent || this.nodejsHttpAgent),
                (this.nodejsHttpsAgent = t.httpsAgent || this.nodejsHttpsAgent),
                t.hasOwnProperty("baseUrl"))
              ) {
                if (null != t.baseUrl) {
                  var e = h.parse(t.baseUrl, !1, !0);
                  if (!e.protocol)
                    throw new r.SyntaxError("baseUrl must be an absolute URL");
                }
                this.nodejsBaseUrl = t.baseUrl;
              }
            }),
            (r.nodejsSet = function (t) {
              r.prototype.nodejsSet(t);
            }),
            (r.prototype._setReadyState = function (t) {
              (this.readyState = t),
                this.dispatchEvent(new l.ProgressEvent("readystatechange"));
            }),
            (r.prototype._sendFile = function (t) {
              throw new Error("Protocol file: not implemented");
            }),
            (r.prototype._sendHttp = function (t) {
              if (this._sync)
                throw new Error("Synchronous XHR processing not implemented");
              !t || ("GET" !== this._method && "HEAD" !== this._method)
                ? (t = t || "")
                : (console.warn(
                    "Discarding entity body for " + this._method + " requests"
                  ),
                  (t = null)),
                this.upload._setData(t),
                this._finalizeHeaders(),
                this._sendHxxpRequest();
            }),
            (r.prototype._sendHxxpRequest = function () {
              var t = this;
              if (this.withCredentials) {
                var e = r.cookieJar
                  .getCookies(
                    p.CookieAccessInfo(
                      this._url.hostname,
                      this._url.pathname,
                      "https:" === this._url.protocol
                    )
                  )
                  .toValueString();
                this._headers.cookie = this._headers.cookie2 = e;
              }
              var n =
                  "http:" === this._url.protocol
                    ? [s, this.nodejsHttpAgent]
                    : [u, this.nodejsHttpsAgent],
                i = n[0],
                o = n[1],
                a = i.request.bind(i),
                h = a({
                  hostname: this._url.hostname,
                  port: +this._url.port,
                  path: this._url.path,
                  auth: this._url.auth,
                  method: this._method,
                  headers: this._headers,
                  agent: o,
                });
              (this._request = h),
                this.timeout &&
                  h.setTimeout(this.timeout, function () {
                    return t._onHttpTimeout(h);
                  }),
                h.on("response", function (e) {
                  return t._onHttpResponse(h, e);
                }),
                h.on("error", function (e) {
                  return t._onHttpRequestError(h, e);
                }),
                this.upload._startUpload(h),
                this._request === h && this._dispatchProgress("loadstart");
            }),
            (r.prototype._finalizeHeaders = function () {
              (this._headers = o(
                {},
                this._headers,
                {
                  Connection: "keep-alive",
                  Host: this._url.host,
                  "User-Agent": this._userAgent,
                },
                this._anonymous ? { Referer: "about:blank" } : {}
              )),
                this.upload._finalizeHeaders(
                  this._headers,
                  this._loweredHeaders
                );
            }),
            (r.prototype._onHttpResponse = function (t, e) {
              var n = this;
              if (this._request === t) {
                if (
                  (this.withCredentials &&
                    (e.headers["set-cookie"] || e.headers["set-cookie2"]) &&
                    r.cookieJar.setCookies(
                      e.headers["set-cookie"] || e.headers["set-cookie2"]
                    ),
                  [301, 302, 303, 307, 308].indexOf(e.statusCode) >= 0)
                )
                  return (
                    (this._url = this._parseUrl(e.headers.location)),
                    (this._method = "GET"),
                    this._loweredHeaders["content-type"] &&
                      (delete this._headers[
                        this._loweredHeaders["content-type"]
                      ],
                      delete this._loweredHeaders["content-type"]),
                    null != this._headers["Content-Type"] &&
                      delete this._headers["Content-Type"],
                    delete this._headers["Content-Length"],
                    this.upload._reset(),
                    this._finalizeHeaders(),
                    void this._sendHxxpRequest()
                  );
                (this._response = e),
                  this._response.on("data", function (t) {
                    return n._onHttpResponseData(e, t);
                  }),
                  this._response.on("end", function () {
                    return n._onHttpResponseEnd(e);
                  }),
                  this._response.on("close", function () {
                    return n._onHttpResponseClose(e);
                  }),
                  (this.responseUrl = this._url.href.split("#")[0]),
                  (this.status = e.statusCode),
                  (this.statusText = s.STATUS_CODES[this.status]),
                  this._parseResponseHeaders(e);
                var i = this._responseHeaders["content-length"] || "";
                (this._totalBytes = +i),
                  (this._lengthComputable = !!i),
                  this._setReadyState(r.HEADERS_RECEIVED);
              }
            }),
            (r.prototype._onHttpResponseData = function (t, e) {
              this._response === t &&
                (this._responseParts.push(new n(e)),
                (this._loadedBytes += e.length),
                this.readyState !== r.LOADING && this._setReadyState(r.LOADING),
                this._dispatchProgress("progress"));
            }),
            (r.prototype._onHttpResponseEnd = function (t) {
              this._response === t &&
                (this._parseResponse(),
                (this._request = null),
                (this._response = null),
                this._setReadyState(r.DONE),
                this._dispatchProgress("load"),
                this._dispatchProgress("loadend"));
            }),
            (r.prototype._onHttpResponseClose = function (t) {
              if (this._response === t) {
                var e = this._request;
                this._setError(),
                  e.abort(),
                  this._setReadyState(r.DONE),
                  this._dispatchProgress("error"),
                  this._dispatchProgress("loadend");
              }
            }),
            (r.prototype._onHttpTimeout = function (t) {
              this._request === t &&
                (this._setError(),
                t.abort(),
                this._setReadyState(r.DONE),
                this._dispatchProgress("timeout"),
                this._dispatchProgress("loadend"));
            }),
            (r.prototype._onHttpRequestError = function (t, e) {
              this._request === t &&
                (this._setError(),
                t.abort(),
                this._setReadyState(r.DONE),
                this._dispatchProgress("error"),
                this._dispatchProgress("loadend"));
            }),
            (r.prototype._dispatchProgress = function (t) {
              var e = new r.ProgressEvent(t);
              (e.lengthComputable = this._lengthComputable),
                (e.loaded = this._loadedBytes),
                (e.total = this._totalBytes),
                this.dispatchEvent(e);
            }),
            (r.prototype._setError = function () {
              (this._request = null),
                (this._response = null),
                (this._responseHeaders = null),
                (this._responseParts = null);
            }),
            (r.prototype._parseUrl = function (t, e, r) {
              var n =
                  null == this.nodejsBaseUrl
                    ? t
                    : h.resolve(this.nodejsBaseUrl, t),
                i = h.parse(n, !1, !0);
              i.hash = null;
              var o = (i.auth || "").split(":"),
                s = o[0],
                u = o[1];
              return (
                (s || u || e || r) &&
                  (i.auth = (e || s || "") + ":" + (r || u || "")),
                i
              );
            }),
            (r.prototype._parseResponseHeaders = function (t) {
              for (var e in ((this._responseHeaders = {}), t.headers)) {
                var r = e.toLowerCase();
                this._privateHeaders[r] ||
                  (this._responseHeaders[r] = t.headers[e]);
              }
              null != this._mimeOverride &&
                (this._responseHeaders["content-type"] = this._mimeOverride);
            }),
            (r.prototype._parseResponse = function () {
              var t = n.concat(this._responseParts);
              switch (((this._responseParts = null), this.responseType)) {
                case "json":
                  this.responseText = null;
                  try {
                    this.response = JSON.parse(t.toString("utf-8"));
                  } catch (o) {
                    this.response = null;
                  }
                  return;
                case "buffer":
                  return (this.responseText = null), void (this.response = t);
                case "arraybuffer":
                  this.responseText = null;
                  for (
                    var e = new ArrayBuffer(t.length),
                      r = new Uint8Array(e),
                      i = 0;
                    i < t.length;
                    i++
                  )
                    r[i] = t[i];
                  return void (this.response = e);
                case "text":
                default:
                  try {
                    this.responseText = t.toString(
                      this._parseResponseEncoding()
                    );
                  } catch (s) {
                    this.responseText = t.toString("binary");
                  }
                  this.response = this.responseText;
              }
            }),
            (r.prototype._parseResponseEncoding = function () {
              return (
                /;\s*charset=(.*)$/.exec(
                  this._responseHeaders["content-type"] || ""
                )[1] || "utf-8"
              );
            }),
            (r.ProgressEvent = l.ProgressEvent),
            (r.InvalidStateError = f.InvalidStateError),
            (r.NetworkError = f.NetworkError),
            (r.SecurityError = f.SecurityError),
            (r.SyntaxError = f.SyntaxError),
            (r.XMLHttpRequestUpload = d.XMLHttpRequestUpload),
            (r.UNSENT = 0),
            (r.OPENED = 1),
            (r.HEADERS_RECEIVED = 2),
            (r.LOADING = 3),
            (r.DONE = 4),
            (r.cookieJar = p.CookieJar()),
            r
          );
        })(c.XMLHttpRequestEventTarget);
      (e.XMLHttpRequest = m),
        (m.prototype.nodejsHttpAgent = s.globalAgent),
        (m.prototype.nodejsHttpsAgent = u.globalAgent),
        (m.prototype.nodejsBaseUrl = null);
    }.call(this, r("2820"), r("1c35").Buffer));
  },
  "37e8": function (t, e, r) {
    var n = r("83ab"),
      i = r("9bf2"),
      o = r("825a"),
      s = r("df75");
    t.exports = n
      ? Object.defineProperties
      : function (t, e) {
          o(t);
          var r,
            n = s(e),
            u = n.length,
            a = 0;
          while (u > a) i.f(t, (r = n[a++]), e[r]);
          return t;
        };
  },
  "39d3": function (t, e, r) {
    "use strict";
    var n = r("17fb"),
      i = r("39d4").errors,
      o = r("e0bf"),
      s = function (t, e) {
        var r = this;
        (this.responseCallbacks = {}),
          (this.notificationCallbacks = []),
          (this.path = t),
          (this.connected = !1),
          (this.connection = e.connect({ path: this.path })),
          this.addDefaultEvents();
        var i = function (t) {
          var e = null;
          n.isArray(t)
            ? t.forEach(function (t) {
                r.responseCallbacks[t.id] && (e = t.id);
              })
            : (e = t.id),
            e || -1 === t.method.indexOf("_subscription")
              ? r.responseCallbacks[e] &&
                (r.responseCallbacks[e](null, t), delete r.responseCallbacks[e])
              : r.notificationCallbacks.forEach(function (e) {
                  n.isFunction(e) && e(t);
                });
        };
        "Socket" === e.constructor.name
          ? o(this.connection).done(i)
          : this.connection.on("data", function (t) {
              r._parseResponse(t.toString()).forEach(i);
            });
      };
    (s.prototype.addDefaultEvents = function () {
      var t = this;
      this.connection.on("connect", function () {
        t.connected = !0;
      }),
        this.connection.on("close", function () {
          t.connected = !1;
        }),
        this.connection.on("error", function () {
          t._timeout();
        }),
        this.connection.on("end", function () {
          t._timeout();
        }),
        this.connection.on("timeout", function () {
          t._timeout();
        });
    }),
      (s.prototype._parseResponse = function (t) {
        var e = this,
          r = [],
          n = t
            .replace(/\}[\n\r]?\{/g, "}|--|{")
            .replace(/\}\][\n\r]?\[\{/g, "}]|--|[{")
            .replace(/\}[\n\r]?\[\{/g, "}|--|[{")
            .replace(/\}\][\n\r]?\{/g, "}]|--|{")
            .split("|--|");
        return (
          n.forEach(function (t) {
            e.lastChunk && (t = e.lastChunk + t);
            var n = null;
            try {
              n = JSON.parse(t);
            } catch (o) {
              return (
                (e.lastChunk = t),
                clearTimeout(e.lastChunkTimeout),
                void (e.lastChunkTimeout = setTimeout(function () {
                  throw (e._timeout(), i.InvalidResponse(t));
                }, 15e3))
              );
            }
            clearTimeout(e.lastChunkTimeout),
              (e.lastChunk = null),
              n && r.push(n);
          }),
          r
        );
      }),
      (s.prototype._addResponseCallback = function (t, e) {
        var r = t.id || t[0].id,
          n = t.method || t[0].method;
        (this.responseCallbacks[r] = e), (this.responseCallbacks[r].method = n);
      }),
      (s.prototype._timeout = function () {
        for (var t in this.responseCallbacks)
          this.responseCallbacks.hasOwnProperty(t) &&
            (this.responseCallbacks[t](i.InvalidConnection("on IPC")),
            delete this.responseCallbacks[t]);
      }),
      (s.prototype.reconnect = function () {
        this.connection.connect({ path: this.path });
      }),
      (s.prototype.send = function (t, e) {
        this.connection.writable ||
          this.connection.connect({ path: this.path }),
          this.connection.write(JSON.stringify(t)),
          this._addResponseCallback(t, e);
      }),
      (s.prototype.on = function (t, e) {
        if ("function" !== typeof e)
          throw new Error("The second parameter callback must be a function.");
        switch (t) {
          case "data":
            this.notificationCallbacks.push(e);
            break;
          default:
            this.connection.on(t, e);
            break;
        }
      }),
      (s.prototype.once = function (t, e) {
        if ("function" !== typeof e)
          throw new Error("The second parameter callback must be a function.");
        this.connection.once(t, e);
      }),
      (s.prototype.removeListener = function (t, e) {
        var r = this;
        switch (t) {
          case "data":
            this.notificationCallbacks.forEach(function (t, n) {
              t === e && r.notificationCallbacks.splice(n, 1);
            });
            break;
          default:
            this.connection.removeListener(t, e);
            break;
        }
      }),
      (s.prototype.removeAllListeners = function (t) {
        switch (t) {
          case "data":
            this.notificationCallbacks = [];
            break;
          default:
            this.connection.removeAllListeners(t);
            break;
        }
      }),
      (s.prototype.reset = function () {
        this._timeout(),
          (this.notificationCallbacks = []),
          this.connection.removeAllListeners("error"),
          this.connection.removeAllListeners("end"),
          this.connection.removeAllListeners("timeout"),
          this.addDefaultEvents();
      }),
      (s.prototype.supportsSubscriptions = function () {
        return !0;
      }),
      (t.exports = s);
  },
  "39d4": function (t, e, r) {
    "use strict";
    var n = r("5f2e"),
      i = r("175f");
    t.exports = { errors: n, formatters: i };
  },
  "3a7c": function (t, e, r) {
    (function (t) {
      function r(t) {
        return Array.isArray ? Array.isArray(t) : "[object Array]" === v(t);
      }
      function n(t) {
        return "boolean" === typeof t;
      }
      function i(t) {
        return null === t;
      }
      function o(t) {
        return null == t;
      }
      function s(t) {
        return "number" === typeof t;
      }
      function u(t) {
        return "string" === typeof t;
      }
      function a(t) {
        return "symbol" === typeof t;
      }
      function h(t) {
        return void 0 === t;
      }
      function l(t) {
        return "[object RegExp]" === v(t);
      }
      function f(t) {
        return "object" === typeof t && null !== t;
      }
      function c(t) {
        return "[object Date]" === v(t);
      }
      function d(t) {
        return "[object Error]" === v(t) || t instanceof Error;
      }
      function p(t) {
        return "function" === typeof t;
      }
      function m(t) {
        return (
          null === t ||
          "boolean" === typeof t ||
          "number" === typeof t ||
          "string" === typeof t ||
          "symbol" === typeof t ||
          "undefined" === typeof t
        );
      }
      function v(t) {
        return Object.prototype.toString.call(t);
      }
      (e.isArray = r),
        (e.isBoolean = n),
        (e.isNull = i),
        (e.isNullOrUndefined = o),
        (e.isNumber = s),
        (e.isString = u),
        (e.isSymbol = a),
        (e.isUndefined = h),
        (e.isRegExp = l),
        (e.isObject = f),
        (e.isDate = c),
        (e.isError = d),
        (e.isFunction = p),
        (e.isPrimitive = m),
        (e.isBuffer = t.isBuffer);
    }.call(this, r("1c35").Buffer));
  },
  "3bbe": function (t, e, r) {
    var n = r("861d");
    t.exports = function (t) {
      if (!n(t) && null !== t)
        throw TypeError("Can't set " + String(t) + " as a prototype");
      return t;
    };
  },
  "3c35": function (t, e) {
    (function (e) {
      t.exports = e;
    }.call(this, {}));
  },
  "3c43": function (t, e) {
    (e.endianness = function () {
      return "LE";
    }),
      (e.hostname = function () {
        return "undefined" !== typeof location ? location.hostname : "";
      }),
      (e.loadavg = function () {
        return [];
      }),
      (e.uptime = function () {
        return 0;
      }),
      (e.freemem = function () {
        return Number.MAX_VALUE;
      }),
      (e.totalmem = function () {
        return Number.MAX_VALUE;
      }),
      (e.cpus = function () {
        return [];
      }),
      (e.type = function () {
        return "Browser";
      }),
      (e.release = function () {
        return "undefined" !== typeof navigator ? navigator.appVersion : "";
      }),
      (e.networkInterfaces = e.getNetworkInterfaces =
        function () {
          return {};
        }),
      (e.arch = function () {
        return "javascript";
      }),
      (e.platform = function () {
        return "browser";
      }),
      (e.tmpdir = e.tmpDir =
        function () {
          return "/tmp";
        }),
      (e.EOL = "\n"),
      (e.homedir = function () {
        return "/";
      });
  },
  "3ca3": function (t, e, r) {
    "use strict";
    var n = r("6547").charAt,
      i = r("69f3"),
      o = r("7dd0"),
      s = "String Iterator",
      u = i.set,
      a = i.getterFor(s);
    o(
      String,
      "String",
      function (t) {
        u(this, { type: s, string: String(t), index: 0 });
      },
      function () {
        var t,
          e = a(this),
          r = e.string,
          i = e.index;
        return i >= r.length
          ? { value: void 0, done: !0 }
          : ((t = n(r, i)), (e.index += t.length), { value: t, done: !1 });
      }
    );
  },
  "3d1b": function (t, e, r) {
    (e = t.exports = r("8b77")),
      (e.Stream = e),
      (e.Readable = e),
      (e.Writable = r("5bc2")),
      (e.Duplex = r("1715")),
      (e.Transform = r("4e92")),
      (e.PassThrough = r("461a"));
  },
  "3f8c": function (t, e) {
    t.exports = {};
  },
  "3fb5": function (t, e) {
    "function" === typeof Object.create
      ? (t.exports = function (t, e) {
          e &&
            ((t.super_ = e),
            (t.prototype = Object.create(e.prototype, {
              constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0,
              },
            })));
        })
      : (t.exports = function (t, e) {
          if (e) {
            t.super_ = e;
            var r = function () {};
            (r.prototype = e.prototype),
              (t.prototype = new r()),
              (t.prototype.constructor = t);
          }
        });
  },
  "428f": function (t, e, r) {
    var n = r("da84");
    t.exports = n;
  },
  4365: function (t, e, r) {
    "use strict";
    function n(t, e) {
      if (!(t instanceof e))
        throw new TypeError("Cannot call a class as a function");
    }
    var i = r("9905").Buffer,
      o = r(1);
    function s(t, e, r) {
      t.copy(e, r);
    }
    (t.exports = (function () {
      function t() {
        n(this, t), (this.head = null), (this.tail = null), (this.length = 0);
      }
      return (
        (t.prototype.push = function (t) {
          var e = { data: t, next: null };
          this.length > 0 ? (this.tail.next = e) : (this.head = e),
            (this.tail = e),
            ++this.length;
        }),
        (t.prototype.unshift = function (t) {
          var e = { data: t, next: this.head };
          0 === this.length && (this.tail = e), (this.head = e), ++this.length;
        }),
        (t.prototype.shift = function () {
          if (0 !== this.length) {
            var t = this.head.data;
            return (
              1 === this.length
                ? (this.head = this.tail = null)
                : (this.head = this.head.next),
              --this.length,
              t
            );
          }
        }),
        (t.prototype.clear = function () {
          (this.head = this.tail = null), (this.length = 0);
        }),
        (t.prototype.join = function (t) {
          if (0 === this.length) return "";
          var e = this.head,
            r = "" + e.data;
          while ((e = e.next)) r += t + e.data;
          return r;
        }),
        (t.prototype.concat = function (t) {
          if (0 === this.length) return i.alloc(0);
          if (1 === this.length) return this.head.data;
          var e = i.allocUnsafe(t >>> 0),
            r = this.head,
            n = 0;
          while (r) s(r.data, e, n), (n += r.data.length), (r = r.next);
          return e;
        }),
        t
      );
    })()),
      o &&
        o.inspect &&
        o.inspect.custom &&
        (t.exports.prototype[o.inspect.custom] = function () {
          var t = o.inspect({ length: this.length });
          return this.constructor.name + " " + t;
        });
  },
  "44ad": function (t, e, r) {
    var n = r("d039"),
      i = r("c6b6"),
      o = "".split;
    t.exports = n(function () {
      return !Object("z").propertyIsEnumerable(0);
    })
      ? function (t) {
          return "String" == i(t) ? o.call(t, "") : Object(t);
        }
      : Object;
  },
  "44d2": function (t, e, r) {
    var n = r("b622"),
      i = r("7c73"),
      o = r("9bf2"),
      s = n("unscopables"),
      u = Array.prototype;
    void 0 == u[s] && o.f(u, s, { configurable: !0, value: i(null) }),
      (t.exports = function (t) {
        u[s][t] = !0;
      });
  },
  "44de": function (t, e, r) {
    var n = r("da84");
    t.exports = function (t, e) {
      var r = n.console;
      r && r.error && (1 === arguments.length ? r.error(t) : r.error(t, e));
    };
  },
  "461a": function (t, e, r) {
    "use strict";
    t.exports = o;
    var n = r("4e92"),
      i = Object.create(r("3a7c"));
    function o(t) {
      if (!(this instanceof o)) return new o(t);
      n.call(this, t);
    }
    (i.inherits = r("3fb5")),
      i.inherits(o, n),
      (o.prototype._transform = function (t, e, r) {
        r(null, t);
      });
  },
  4633: function (t, e, r) {
    "use strict";
    (function (t) {
      var n =
        (this && this.__extends) ||
        (function () {
          var t =
            Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array &&
              function (t, e) {
                t.__proto__ = e;
              }) ||
            function (t, e) {
              for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
            };
          return function (e, r) {
            function n() {
              this.constructor = e;
            }
            t(e, r),
              (e.prototype =
                null === r
                  ? Object.create(r)
                  : ((n.prototype = r.prototype), new n()));
          };
        })();
      Object.defineProperty(e, "__esModule", { value: !0 });
      var i = r("65eb"),
        o = (function (e) {
          function r() {
            var t = e.call(this) || this;
            return (t._contentType = null), (t._body = null), t._reset(), t;
          }
          return (
            n(r, e),
            (r.prototype._reset = function () {
              (this._contentType = null), (this._body = null);
            }),
            (r.prototype._setData = function (e) {
              if (null != e)
                if ("string" === typeof e)
                  0 !== e.length &&
                    (this._contentType = "text/plain;charset=UTF-8"),
                    (this._body = new t(e, "utf-8"));
                else if (t.isBuffer(e)) this._body = e;
                else if (e instanceof ArrayBuffer) {
                  for (
                    var r = new t(e.byteLength), n = new Uint8Array(e), i = 0;
                    i < e.byteLength;
                    i++
                  )
                    r[i] = n[i];
                  this._body = r;
                } else {
                  if (!(e.buffer && e.buffer instanceof ArrayBuffer))
                    throw new Error("Unsupported send() data " + e);
                  r = new t(e.byteLength);
                  var o = e.byteOffset;
                  for (
                    n = new Uint8Array(e.buffer), i = 0;
                    i < e.byteLength;
                    i++
                  )
                    r[i] = n[i + o];
                  this._body = r;
                }
            }),
            (r.prototype._finalizeHeaders = function (t, e) {
              this._contentType &&
                !e["content-type"] &&
                (t["Content-Type"] = this._contentType),
                this._body &&
                  (t["Content-Length"] = this._body.length.toString());
            }),
            (r.prototype._startUpload = function (t) {
              this._body && t.write(this._body), t.end();
            }),
            r
          );
        })(i.XMLHttpRequestEventTarget);
      e.XMLHttpRequestUpload = o;
    }.call(this, r("1c35").Buffer));
  },
  4840: function (t, e, r) {
    var n = r("825a"),
      i = r("1c0b"),
      o = r("b622"),
      s = o("species");
    t.exports = function (t, e) {
      var r,
        o = n(t).constructor;
      return void 0 === o || void 0 == (r = n(o)[s]) ? e : i(r);
    };
  },
  4930: function (t, e, r) {
    var n = r("d039");
    t.exports =
      !!Object.getOwnPropertySymbols &&
      !n(function () {
        return !String(Symbol());
      });
  },
  "4a87": function (t, e, r) {
    (function (t) {
      (function (t, e) {
        "use strict";
        function n(t, e) {
          if (!t) throw new Error(e || "Assertion failed");
        }
        function i(t, e) {
          t.super_ = e;
          var r = function () {};
          (r.prototype = e.prototype),
            (t.prototype = new r()),
            (t.prototype.constructor = t);
        }
        function o(t, e, r) {
          if (o.isBN(t)) return t;
          (this.negative = 0),
            (this.words = null),
            (this.length = 0),
            (this.red = null),
            null !== t &&
              (("le" !== e && "be" !== e) || ((r = e), (e = 10)),
              this._init(t || 0, e || 10, r || "be"));
        }
        var s;
        "object" === typeof t ? (t.exports = o) : (e.BN = o),
          (o.BN = o),
          (o.wordSize = 26);
        try {
          s = r("1c35").Buffer;
        } catch (A) {}
        function u(t, e, r) {
          for (var n = 0, i = Math.min(t.length, r), o = e; o < i; o++) {
            var s = t.charCodeAt(o) - 48;
            (n <<= 4),
              (n |=
                s >= 49 && s <= 54
                  ? s - 49 + 10
                  : s >= 17 && s <= 22
                  ? s - 17 + 10
                  : 15 & s);
          }
          return n;
        }
        function a(t, e, r, n) {
          for (var i = 0, o = Math.min(t.length, r), s = e; s < o; s++) {
            var u = t.charCodeAt(s) - 48;
            (i *= n), (i += u >= 49 ? u - 49 + 10 : u >= 17 ? u - 17 + 10 : u);
          }
          return i;
        }
        (o.isBN = function (t) {
          return (
            t instanceof o ||
            (null !== t &&
              "object" === typeof t &&
              t.constructor.wordSize === o.wordSize &&
              Array.isArray(t.words))
          );
        }),
          (o.max = function (t, e) {
            return t.cmp(e) > 0 ? t : e;
          }),
          (o.min = function (t, e) {
            return t.cmp(e) < 0 ? t : e;
          }),
          (o.prototype._init = function (t, e, r) {
            if ("number" === typeof t) return this._initNumber(t, e, r);
            if ("object" === typeof t) return this._initArray(t, e, r);
            "hex" === e && (e = 16),
              n(e === (0 | e) && e >= 2 && e <= 36),
              (t = t.toString().replace(/\s+/g, ""));
            var i = 0;
            "-" === t[0] && i++,
              16 === e ? this._parseHex(t, i) : this._parseBase(t, e, i),
              "-" === t[0] && (this.negative = 1),
              this.strip(),
              "le" === r && this._initArray(this.toArray(), e, r);
          }),
          (o.prototype._initNumber = function (t, e, r) {
            t < 0 && ((this.negative = 1), (t = -t)),
              t < 67108864
                ? ((this.words = [67108863 & t]), (this.length = 1))
                : t < 4503599627370496
                ? ((this.words = [67108863 & t, (t / 67108864) & 67108863]),
                  (this.length = 2))
                : (n(t < 9007199254740992),
                  (this.words = [67108863 & t, (t / 67108864) & 67108863, 1]),
                  (this.length = 3)),
              "le" === r && this._initArray(this.toArray(), e, r);
          }),
          (o.prototype._initArray = function (t, e, r) {
            if ((n("number" === typeof t.length), t.length <= 0))
              return (this.words = [0]), (this.length = 1), this;
            (this.length = Math.ceil(t.length / 3)),
              (this.words = new Array(this.length));
            for (var i = 0; i < this.length; i++) this.words[i] = 0;
            var o,
              s,
              u = 0;
            if ("be" === r)
              for (i = t.length - 1, o = 0; i >= 0; i -= 3)
                (s = t[i] | (t[i - 1] << 8) | (t[i - 2] << 16)),
                  (this.words[o] |= (s << u) & 67108863),
                  (this.words[o + 1] = (s >>> (26 - u)) & 67108863),
                  (u += 24),
                  u >= 26 && ((u -= 26), o++);
            else if ("le" === r)
              for (i = 0, o = 0; i < t.length; i += 3)
                (s = t[i] | (t[i + 1] << 8) | (t[i + 2] << 16)),
                  (this.words[o] |= (s << u) & 67108863),
                  (this.words[o + 1] = (s >>> (26 - u)) & 67108863),
                  (u += 24),
                  u >= 26 && ((u -= 26), o++);
            return this.strip();
          }),
          (o.prototype._parseHex = function (t, e) {
            (this.length = Math.ceil((t.length - e) / 6)),
              (this.words = new Array(this.length));
            for (var r = 0; r < this.length; r++) this.words[r] = 0;
            var n,
              i,
              o = 0;
            for (r = t.length - 6, n = 0; r >= e; r -= 6)
              (i = u(t, r, r + 6)),
                (this.words[n] |= (i << o) & 67108863),
                (this.words[n + 1] |= (i >>> (26 - o)) & 4194303),
                (o += 24),
                o >= 26 && ((o -= 26), n++);
            r + 6 !== e &&
              ((i = u(t, e, r + 6)),
              (this.words[n] |= (i << o) & 67108863),
              (this.words[n + 1] |= (i >>> (26 - o)) & 4194303)),
              this.strip();
          }),
          (o.prototype._parseBase = function (t, e, r) {
            (this.words = [0]), (this.length = 1);
            for (var n = 0, i = 1; i <= 67108863; i *= e) n++;
            n--, (i = (i / e) | 0);
            for (
              var o = t.length - r,
                s = o % n,
                u = Math.min(o, o - s) + r,
                h = 0,
                l = r;
              l < u;
              l += n
            )
              (h = a(t, l, l + n, e)),
                this.imuln(i),
                this.words[0] + h < 67108864
                  ? (this.words[0] += h)
                  : this._iaddn(h);
            if (0 !== s) {
              var f = 1;
              for (h = a(t, l, t.length, e), l = 0; l < s; l++) f *= e;
              this.imuln(f),
                this.words[0] + h < 67108864
                  ? (this.words[0] += h)
                  : this._iaddn(h);
            }
          }),
          (o.prototype.copy = function (t) {
            t.words = new Array(this.length);
            for (var e = 0; e < this.length; e++) t.words[e] = this.words[e];
            (t.length = this.length),
              (t.negative = this.negative),
              (t.red = this.red);
          }),
          (o.prototype.clone = function () {
            var t = new o(null);
            return this.copy(t), t;
          }),
          (o.prototype._expand = function (t) {
            while (this.length < t) this.words[this.length++] = 0;
            return this;
          }),
          (o.prototype.strip = function () {
            while (this.length > 1 && 0 === this.words[this.length - 1])
              this.length--;
            return this._normSign();
          }),
          (o.prototype._normSign = function () {
            return (
              1 === this.length && 0 === this.words[0] && (this.negative = 0),
              this
            );
          }),
          (o.prototype.inspect = function () {
            return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
          });
        var h = [
            "",
            "0",
            "00",
            "000",
            "0000",
            "00000",
            "000000",
            "0000000",
            "00000000",
            "000000000",
            "0000000000",
            "00000000000",
            "000000000000",
            "0000000000000",
            "00000000000000",
            "000000000000000",
            "0000000000000000",
            "00000000000000000",
            "000000000000000000",
            "0000000000000000000",
            "00000000000000000000",
            "000000000000000000000",
            "0000000000000000000000",
            "00000000000000000000000",
            "000000000000000000000000",
            "0000000000000000000000000",
          ],
          l = [
            0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          ],
          f = [
            0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607,
            16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536,
            11390625, 16777216, 24137569, 34012224, 47045881, 64e6, 4084101,
            5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368,
            20511149, 243e5, 28629151, 33554432, 39135393, 45435424, 52521875,
            60466176,
          ];
        function c(t) {
          for (var e = new Array(t.bitLength()), r = 0; r < e.length; r++) {
            var n = (r / 26) | 0,
              i = r % 26;
            e[r] = (t.words[n] & (1 << i)) >>> i;
          }
          return e;
        }
        function d(t, e, r) {
          r.negative = e.negative ^ t.negative;
          var n = (t.length + e.length) | 0;
          (r.length = n), (n = (n - 1) | 0);
          var i = 0 | t.words[0],
            o = 0 | e.words[0],
            s = i * o,
            u = 67108863 & s,
            a = (s / 67108864) | 0;
          r.words[0] = u;
          for (var h = 1; h < n; h++) {
            for (
              var l = a >>> 26,
                f = 67108863 & a,
                c = Math.min(h, e.length - 1),
                d = Math.max(0, h - t.length + 1);
              d <= c;
              d++
            ) {
              var p = (h - d) | 0;
              (i = 0 | t.words[p]),
                (o = 0 | e.words[d]),
                (s = i * o + f),
                (l += (s / 67108864) | 0),
                (f = 67108863 & s);
            }
            (r.words[h] = 0 | f), (a = 0 | l);
          }
          return 0 !== a ? (r.words[h] = 0 | a) : r.length--, r.strip();
        }
        (o.prototype.toString = function (t, e) {
          var r;
          if (((t = t || 10), (e = 0 | e || 1), 16 === t || "hex" === t)) {
            r = "";
            for (var i = 0, o = 0, s = 0; s < this.length; s++) {
              var u = this.words[s],
                a = (16777215 & ((u << i) | o)).toString(16);
              (o = (u >>> (24 - i)) & 16777215),
                (r =
                  0 !== o || s !== this.length - 1
                    ? h[6 - a.length] + a + r
                    : a + r),
                (i += 2),
                i >= 26 && ((i -= 26), s--);
            }
            0 !== o && (r = o.toString(16) + r);
            while (r.length % e !== 0) r = "0" + r;
            return 0 !== this.negative && (r = "-" + r), r;
          }
          if (t === (0 | t) && t >= 2 && t <= 36) {
            var c = l[t],
              d = f[t];
            r = "";
            var p = this.clone();
            p.negative = 0;
            while (!p.isZero()) {
              var m = p.modn(d).toString(t);
              (p = p.idivn(d)),
                (r = p.isZero() ? m + r : h[c - m.length] + m + r);
            }
            this.isZero() && (r = "0" + r);
            while (r.length % e !== 0) r = "0" + r;
            return 0 !== this.negative && (r = "-" + r), r;
          }
          n(!1, "Base should be between 2 and 36");
        }),
          (o.prototype.toNumber = function () {
            var t = this.words[0];
            return (
              2 === this.length
                ? (t += 67108864 * this.words[1])
                : 3 === this.length && 1 === this.words[2]
                ? (t += 4503599627370496 + 67108864 * this.words[1])
                : this.length > 2 &&
                  n(!1, "Number can only safely store up to 53 bits"),
              0 !== this.negative ? -t : t
            );
          }),
          (o.prototype.toJSON = function () {
            return this.toString(16);
          }),
          (o.prototype.toBuffer = function (t, e) {
            return n("undefined" !== typeof s), this.toArrayLike(s, t, e);
          }),
          (o.prototype.toArray = function (t, e) {
            return this.toArrayLike(Array, t, e);
          }),
          (o.prototype.toArrayLike = function (t, e, r) {
            var i = this.byteLength(),
              o = r || Math.max(1, i);
            n(i <= o, "byte array longer than desired length"),
              n(o > 0, "Requested array length <= 0"),
              this.strip();
            var s,
              u,
              a = "le" === e,
              h = new t(o),
              l = this.clone();
            if (a) {
              for (u = 0; !l.isZero(); u++)
                (s = l.andln(255)), l.iushrn(8), (h[u] = s);
              for (; u < o; u++) h[u] = 0;
            } else {
              for (u = 0; u < o - i; u++) h[u] = 0;
              for (u = 0; !l.isZero(); u++)
                (s = l.andln(255)), l.iushrn(8), (h[o - u - 1] = s);
            }
            return h;
          }),
          Math.clz32
            ? (o.prototype._countBits = function (t) {
                return 32 - Math.clz32(t);
              })
            : (o.prototype._countBits = function (t) {
                var e = t,
                  r = 0;
                return (
                  e >= 4096 && ((r += 13), (e >>>= 13)),
                  e >= 64 && ((r += 7), (e >>>= 7)),
                  e >= 8 && ((r += 4), (e >>>= 4)),
                  e >= 2 && ((r += 2), (e >>>= 2)),
                  r + e
                );
              }),
          (o.prototype._zeroBits = function (t) {
            if (0 === t) return 26;
            var e = t,
              r = 0;
            return (
              0 === (8191 & e) && ((r += 13), (e >>>= 13)),
              0 === (127 & e) && ((r += 7), (e >>>= 7)),
              0 === (15 & e) && ((r += 4), (e >>>= 4)),
              0 === (3 & e) && ((r += 2), (e >>>= 2)),
              0 === (1 & e) && r++,
              r
            );
          }),
          (o.prototype.bitLength = function () {
            var t = this.words[this.length - 1],
              e = this._countBits(t);
            return 26 * (this.length - 1) + e;
          }),
          (o.prototype.zeroBits = function () {
            if (this.isZero()) return 0;
            for (var t = 0, e = 0; e < this.length; e++) {
              var r = this._zeroBits(this.words[e]);
              if (((t += r), 26 !== r)) break;
            }
            return t;
          }),
          (o.prototype.byteLength = function () {
            return Math.ceil(this.bitLength() / 8);
          }),
          (o.prototype.toTwos = function (t) {
            return 0 !== this.negative
              ? this.abs().inotn(t).iaddn(1)
              : this.clone();
          }),
          (o.prototype.fromTwos = function (t) {
            return this.testn(t - 1)
              ? this.notn(t).iaddn(1).ineg()
              : this.clone();
          }),
          (o.prototype.isNeg = function () {
            return 0 !== this.negative;
          }),
          (o.prototype.neg = function () {
            return this.clone().ineg();
          }),
          (o.prototype.ineg = function () {
            return this.isZero() || (this.negative ^= 1), this;
          }),
          (o.prototype.iuor = function (t) {
            while (this.length < t.length) this.words[this.length++] = 0;
            for (var e = 0; e < t.length; e++)
              this.words[e] = this.words[e] | t.words[e];
            return this.strip();
          }),
          (o.prototype.ior = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuor(t);
          }),
          (o.prototype.or = function (t) {
            return this.length > t.length
              ? this.clone().ior(t)
              : t.clone().ior(this);
          }),
          (o.prototype.uor = function (t) {
            return this.length > t.length
              ? this.clone().iuor(t)
              : t.clone().iuor(this);
          }),
          (o.prototype.iuand = function (t) {
            var e;
            e = this.length > t.length ? t : this;
            for (var r = 0; r < e.length; r++)
              this.words[r] = this.words[r] & t.words[r];
            return (this.length = e.length), this.strip();
          }),
          (o.prototype.iand = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuand(t);
          }),
          (o.prototype.and = function (t) {
            return this.length > t.length
              ? this.clone().iand(t)
              : t.clone().iand(this);
          }),
          (o.prototype.uand = function (t) {
            return this.length > t.length
              ? this.clone().iuand(t)
              : t.clone().iuand(this);
          }),
          (o.prototype.iuxor = function (t) {
            var e, r;
            this.length > t.length
              ? ((e = this), (r = t))
              : ((e = t), (r = this));
            for (var n = 0; n < r.length; n++)
              this.words[n] = e.words[n] ^ r.words[n];
            if (this !== e)
              for (; n < e.length; n++) this.words[n] = e.words[n];
            return (this.length = e.length), this.strip();
          }),
          (o.prototype.ixor = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuxor(t);
          }),
          (o.prototype.xor = function (t) {
            return this.length > t.length
              ? this.clone().ixor(t)
              : t.clone().ixor(this);
          }),
          (o.prototype.uxor = function (t) {
            return this.length > t.length
              ? this.clone().iuxor(t)
              : t.clone().iuxor(this);
          }),
          (o.prototype.inotn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = 0 | Math.ceil(t / 26),
              r = t % 26;
            this._expand(e), r > 0 && e--;
            for (var i = 0; i < e; i++)
              this.words[i] = 67108863 & ~this.words[i];
            return (
              r > 0 &&
                (this.words[i] = ~this.words[i] & (67108863 >> (26 - r))),
              this.strip()
            );
          }),
          (o.prototype.notn = function (t) {
            return this.clone().inotn(t);
          }),
          (o.prototype.setn = function (t, e) {
            n("number" === typeof t && t >= 0);
            var r = (t / 26) | 0,
              i = t % 26;
            return (
              this._expand(r + 1),
              (this.words[r] = e
                ? this.words[r] | (1 << i)
                : this.words[r] & ~(1 << i)),
              this.strip()
            );
          }),
          (o.prototype.iadd = function (t) {
            var e, r, n;
            if (0 !== this.negative && 0 === t.negative)
              return (
                (this.negative = 0),
                (e = this.isub(t)),
                (this.negative ^= 1),
                this._normSign()
              );
            if (0 === this.negative && 0 !== t.negative)
              return (
                (t.negative = 0),
                (e = this.isub(t)),
                (t.negative = 1),
                e._normSign()
              );
            this.length > t.length
              ? ((r = this), (n = t))
              : ((r = t), (n = this));
            for (var i = 0, o = 0; o < n.length; o++)
              (e = (0 | r.words[o]) + (0 | n.words[o]) + i),
                (this.words[o] = 67108863 & e),
                (i = e >>> 26);
            for (; 0 !== i && o < r.length; o++)
              (e = (0 | r.words[o]) + i),
                (this.words[o] = 67108863 & e),
                (i = e >>> 26);
            if (((this.length = r.length), 0 !== i))
              (this.words[this.length] = i), this.length++;
            else if (r !== this)
              for (; o < r.length; o++) this.words[o] = r.words[o];
            return this;
          }),
          (o.prototype.add = function (t) {
            var e;
            return 0 !== t.negative && 0 === this.negative
              ? ((t.negative = 0), (e = this.sub(t)), (t.negative ^= 1), e)
              : 0 === t.negative && 0 !== this.negative
              ? ((this.negative = 0), (e = t.sub(this)), (this.negative = 1), e)
              : this.length > t.length
              ? this.clone().iadd(t)
              : t.clone().iadd(this);
          }),
          (o.prototype.isub = function (t) {
            if (0 !== t.negative) {
              t.negative = 0;
              var e = this.iadd(t);
              return (t.negative = 1), e._normSign();
            }
            if (0 !== this.negative)
              return (
                (this.negative = 0),
                this.iadd(t),
                (this.negative = 1),
                this._normSign()
              );
            var r,
              n,
              i = this.cmp(t);
            if (0 === i)
              return (
                (this.negative = 0),
                (this.length = 1),
                (this.words[0] = 0),
                this
              );
            i > 0 ? ((r = this), (n = t)) : ((r = t), (n = this));
            for (var o = 0, s = 0; s < n.length; s++)
              (e = (0 | r.words[s]) - (0 | n.words[s]) + o),
                (o = e >> 26),
                (this.words[s] = 67108863 & e);
            for (; 0 !== o && s < r.length; s++)
              (e = (0 | r.words[s]) + o),
                (o = e >> 26),
                (this.words[s] = 67108863 & e);
            if (0 === o && s < r.length && r !== this)
              for (; s < r.length; s++) this.words[s] = r.words[s];
            return (
              (this.length = Math.max(this.length, s)),
              r !== this && (this.negative = 1),
              this.strip()
            );
          }),
          (o.prototype.sub = function (t) {
            return this.clone().isub(t);
          });
        var p = function (t, e, r) {
          var n,
            i,
            o,
            s = t.words,
            u = e.words,
            a = r.words,
            h = 0,
            l = 0 | s[0],
            f = 8191 & l,
            c = l >>> 13,
            d = 0 | s[1],
            p = 8191 & d,
            m = d >>> 13,
            v = 0 | s[2],
            g = 8191 & v,
            y = v >>> 13,
            w = 0 | s[3],
            b = 8191 & w,
            M = w >>> 13,
            _ = 0 | s[4],
            x = 8191 & _,
            S = _ >>> 13,
            E = 0 | s[5],
            A = 8191 & E,
            k = E >>> 13,
            O = 0 | s[6],
            T = 8191 & O,
            R = O >>> 13,
            C = 0 | s[7],
            j = 8191 & C,
            N = C >>> 13,
            L = 0 | s[8],
            P = 8191 & L,
            I = L >>> 13,
            B = 0 | s[9],
            q = 8191 & B,
            U = B >>> 13,
            H = 0 | u[0],
            D = 8191 & H,
            F = H >>> 13,
            z = 0 | u[1],
            Z = 8191 & z,
            W = z >>> 13,
            G = 0 | u[2],
            Y = 8191 & G,
            $ = G >>> 13,
            X = 0 | u[3],
            V = 8191 & X,
            J = X >>> 13,
            K = 0 | u[4],
            Q = 8191 & K,
            tt = K >>> 13,
            et = 0 | u[5],
            rt = 8191 & et,
            nt = et >>> 13,
            it = 0 | u[6],
            ot = 8191 & it,
            st = it >>> 13,
            ut = 0 | u[7],
            at = 8191 & ut,
            ht = ut >>> 13,
            lt = 0 | u[8],
            ft = 8191 & lt,
            ct = lt >>> 13,
            dt = 0 | u[9],
            pt = 8191 & dt,
            mt = dt >>> 13;
          (r.negative = t.negative ^ e.negative),
            (r.length = 19),
            (n = Math.imul(f, D)),
            (i = Math.imul(f, F)),
            (i = (i + Math.imul(c, D)) | 0),
            (o = Math.imul(c, F));
          var vt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (vt >>> 26)) | 0),
            (vt &= 67108863),
            (n = Math.imul(p, D)),
            (i = Math.imul(p, F)),
            (i = (i + Math.imul(m, D)) | 0),
            (o = Math.imul(m, F)),
            (n = (n + Math.imul(f, Z)) | 0),
            (i = (i + Math.imul(f, W)) | 0),
            (i = (i + Math.imul(c, Z)) | 0),
            (o = (o + Math.imul(c, W)) | 0);
          var gt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (gt >>> 26)) | 0),
            (gt &= 67108863),
            (n = Math.imul(g, D)),
            (i = Math.imul(g, F)),
            (i = (i + Math.imul(y, D)) | 0),
            (o = Math.imul(y, F)),
            (n = (n + Math.imul(p, Z)) | 0),
            (i = (i + Math.imul(p, W)) | 0),
            (i = (i + Math.imul(m, Z)) | 0),
            (o = (o + Math.imul(m, W)) | 0),
            (n = (n + Math.imul(f, Y)) | 0),
            (i = (i + Math.imul(f, $)) | 0),
            (i = (i + Math.imul(c, Y)) | 0),
            (o = (o + Math.imul(c, $)) | 0);
          var yt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (yt >>> 26)) | 0),
            (yt &= 67108863),
            (n = Math.imul(b, D)),
            (i = Math.imul(b, F)),
            (i = (i + Math.imul(M, D)) | 0),
            (o = Math.imul(M, F)),
            (n = (n + Math.imul(g, Z)) | 0),
            (i = (i + Math.imul(g, W)) | 0),
            (i = (i + Math.imul(y, Z)) | 0),
            (o = (o + Math.imul(y, W)) | 0),
            (n = (n + Math.imul(p, Y)) | 0),
            (i = (i + Math.imul(p, $)) | 0),
            (i = (i + Math.imul(m, Y)) | 0),
            (o = (o + Math.imul(m, $)) | 0),
            (n = (n + Math.imul(f, V)) | 0),
            (i = (i + Math.imul(f, J)) | 0),
            (i = (i + Math.imul(c, V)) | 0),
            (o = (o + Math.imul(c, J)) | 0);
          var wt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (wt >>> 26)) | 0),
            (wt &= 67108863),
            (n = Math.imul(x, D)),
            (i = Math.imul(x, F)),
            (i = (i + Math.imul(S, D)) | 0),
            (o = Math.imul(S, F)),
            (n = (n + Math.imul(b, Z)) | 0),
            (i = (i + Math.imul(b, W)) | 0),
            (i = (i + Math.imul(M, Z)) | 0),
            (o = (o + Math.imul(M, W)) | 0),
            (n = (n + Math.imul(g, Y)) | 0),
            (i = (i + Math.imul(g, $)) | 0),
            (i = (i + Math.imul(y, Y)) | 0),
            (o = (o + Math.imul(y, $)) | 0),
            (n = (n + Math.imul(p, V)) | 0),
            (i = (i + Math.imul(p, J)) | 0),
            (i = (i + Math.imul(m, V)) | 0),
            (o = (o + Math.imul(m, J)) | 0),
            (n = (n + Math.imul(f, Q)) | 0),
            (i = (i + Math.imul(f, tt)) | 0),
            (i = (i + Math.imul(c, Q)) | 0),
            (o = (o + Math.imul(c, tt)) | 0);
          var bt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (bt >>> 26)) | 0),
            (bt &= 67108863),
            (n = Math.imul(A, D)),
            (i = Math.imul(A, F)),
            (i = (i + Math.imul(k, D)) | 0),
            (o = Math.imul(k, F)),
            (n = (n + Math.imul(x, Z)) | 0),
            (i = (i + Math.imul(x, W)) | 0),
            (i = (i + Math.imul(S, Z)) | 0),
            (o = (o + Math.imul(S, W)) | 0),
            (n = (n + Math.imul(b, Y)) | 0),
            (i = (i + Math.imul(b, $)) | 0),
            (i = (i + Math.imul(M, Y)) | 0),
            (o = (o + Math.imul(M, $)) | 0),
            (n = (n + Math.imul(g, V)) | 0),
            (i = (i + Math.imul(g, J)) | 0),
            (i = (i + Math.imul(y, V)) | 0),
            (o = (o + Math.imul(y, J)) | 0),
            (n = (n + Math.imul(p, Q)) | 0),
            (i = (i + Math.imul(p, tt)) | 0),
            (i = (i + Math.imul(m, Q)) | 0),
            (o = (o + Math.imul(m, tt)) | 0),
            (n = (n + Math.imul(f, rt)) | 0),
            (i = (i + Math.imul(f, nt)) | 0),
            (i = (i + Math.imul(c, rt)) | 0),
            (o = (o + Math.imul(c, nt)) | 0);
          var Mt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Mt >>> 26)) | 0),
            (Mt &= 67108863),
            (n = Math.imul(T, D)),
            (i = Math.imul(T, F)),
            (i = (i + Math.imul(R, D)) | 0),
            (o = Math.imul(R, F)),
            (n = (n + Math.imul(A, Z)) | 0),
            (i = (i + Math.imul(A, W)) | 0),
            (i = (i + Math.imul(k, Z)) | 0),
            (o = (o + Math.imul(k, W)) | 0),
            (n = (n + Math.imul(x, Y)) | 0),
            (i = (i + Math.imul(x, $)) | 0),
            (i = (i + Math.imul(S, Y)) | 0),
            (o = (o + Math.imul(S, $)) | 0),
            (n = (n + Math.imul(b, V)) | 0),
            (i = (i + Math.imul(b, J)) | 0),
            (i = (i + Math.imul(M, V)) | 0),
            (o = (o + Math.imul(M, J)) | 0),
            (n = (n + Math.imul(g, Q)) | 0),
            (i = (i + Math.imul(g, tt)) | 0),
            (i = (i + Math.imul(y, Q)) | 0),
            (o = (o + Math.imul(y, tt)) | 0),
            (n = (n + Math.imul(p, rt)) | 0),
            (i = (i + Math.imul(p, nt)) | 0),
            (i = (i + Math.imul(m, rt)) | 0),
            (o = (o + Math.imul(m, nt)) | 0),
            (n = (n + Math.imul(f, ot)) | 0),
            (i = (i + Math.imul(f, st)) | 0),
            (i = (i + Math.imul(c, ot)) | 0),
            (o = (o + Math.imul(c, st)) | 0);
          var _t = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (_t >>> 26)) | 0),
            (_t &= 67108863),
            (n = Math.imul(j, D)),
            (i = Math.imul(j, F)),
            (i = (i + Math.imul(N, D)) | 0),
            (o = Math.imul(N, F)),
            (n = (n + Math.imul(T, Z)) | 0),
            (i = (i + Math.imul(T, W)) | 0),
            (i = (i + Math.imul(R, Z)) | 0),
            (o = (o + Math.imul(R, W)) | 0),
            (n = (n + Math.imul(A, Y)) | 0),
            (i = (i + Math.imul(A, $)) | 0),
            (i = (i + Math.imul(k, Y)) | 0),
            (o = (o + Math.imul(k, $)) | 0),
            (n = (n + Math.imul(x, V)) | 0),
            (i = (i + Math.imul(x, J)) | 0),
            (i = (i + Math.imul(S, V)) | 0),
            (o = (o + Math.imul(S, J)) | 0),
            (n = (n + Math.imul(b, Q)) | 0),
            (i = (i + Math.imul(b, tt)) | 0),
            (i = (i + Math.imul(M, Q)) | 0),
            (o = (o + Math.imul(M, tt)) | 0),
            (n = (n + Math.imul(g, rt)) | 0),
            (i = (i + Math.imul(g, nt)) | 0),
            (i = (i + Math.imul(y, rt)) | 0),
            (o = (o + Math.imul(y, nt)) | 0),
            (n = (n + Math.imul(p, ot)) | 0),
            (i = (i + Math.imul(p, st)) | 0),
            (i = (i + Math.imul(m, ot)) | 0),
            (o = (o + Math.imul(m, st)) | 0),
            (n = (n + Math.imul(f, at)) | 0),
            (i = (i + Math.imul(f, ht)) | 0),
            (i = (i + Math.imul(c, at)) | 0),
            (o = (o + Math.imul(c, ht)) | 0);
          var xt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (xt >>> 26)) | 0),
            (xt &= 67108863),
            (n = Math.imul(P, D)),
            (i = Math.imul(P, F)),
            (i = (i + Math.imul(I, D)) | 0),
            (o = Math.imul(I, F)),
            (n = (n + Math.imul(j, Z)) | 0),
            (i = (i + Math.imul(j, W)) | 0),
            (i = (i + Math.imul(N, Z)) | 0),
            (o = (o + Math.imul(N, W)) | 0),
            (n = (n + Math.imul(T, Y)) | 0),
            (i = (i + Math.imul(T, $)) | 0),
            (i = (i + Math.imul(R, Y)) | 0),
            (o = (o + Math.imul(R, $)) | 0),
            (n = (n + Math.imul(A, V)) | 0),
            (i = (i + Math.imul(A, J)) | 0),
            (i = (i + Math.imul(k, V)) | 0),
            (o = (o + Math.imul(k, J)) | 0),
            (n = (n + Math.imul(x, Q)) | 0),
            (i = (i + Math.imul(x, tt)) | 0),
            (i = (i + Math.imul(S, Q)) | 0),
            (o = (o + Math.imul(S, tt)) | 0),
            (n = (n + Math.imul(b, rt)) | 0),
            (i = (i + Math.imul(b, nt)) | 0),
            (i = (i + Math.imul(M, rt)) | 0),
            (o = (o + Math.imul(M, nt)) | 0),
            (n = (n + Math.imul(g, ot)) | 0),
            (i = (i + Math.imul(g, st)) | 0),
            (i = (i + Math.imul(y, ot)) | 0),
            (o = (o + Math.imul(y, st)) | 0),
            (n = (n + Math.imul(p, at)) | 0),
            (i = (i + Math.imul(p, ht)) | 0),
            (i = (i + Math.imul(m, at)) | 0),
            (o = (o + Math.imul(m, ht)) | 0),
            (n = (n + Math.imul(f, ft)) | 0),
            (i = (i + Math.imul(f, ct)) | 0),
            (i = (i + Math.imul(c, ft)) | 0),
            (o = (o + Math.imul(c, ct)) | 0);
          var St = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (St >>> 26)) | 0),
            (St &= 67108863),
            (n = Math.imul(q, D)),
            (i = Math.imul(q, F)),
            (i = (i + Math.imul(U, D)) | 0),
            (o = Math.imul(U, F)),
            (n = (n + Math.imul(P, Z)) | 0),
            (i = (i + Math.imul(P, W)) | 0),
            (i = (i + Math.imul(I, Z)) | 0),
            (o = (o + Math.imul(I, W)) | 0),
            (n = (n + Math.imul(j, Y)) | 0),
            (i = (i + Math.imul(j, $)) | 0),
            (i = (i + Math.imul(N, Y)) | 0),
            (o = (o + Math.imul(N, $)) | 0),
            (n = (n + Math.imul(T, V)) | 0),
            (i = (i + Math.imul(T, J)) | 0),
            (i = (i + Math.imul(R, V)) | 0),
            (o = (o + Math.imul(R, J)) | 0),
            (n = (n + Math.imul(A, Q)) | 0),
            (i = (i + Math.imul(A, tt)) | 0),
            (i = (i + Math.imul(k, Q)) | 0),
            (o = (o + Math.imul(k, tt)) | 0),
            (n = (n + Math.imul(x, rt)) | 0),
            (i = (i + Math.imul(x, nt)) | 0),
            (i = (i + Math.imul(S, rt)) | 0),
            (o = (o + Math.imul(S, nt)) | 0),
            (n = (n + Math.imul(b, ot)) | 0),
            (i = (i + Math.imul(b, st)) | 0),
            (i = (i + Math.imul(M, ot)) | 0),
            (o = (o + Math.imul(M, st)) | 0),
            (n = (n + Math.imul(g, at)) | 0),
            (i = (i + Math.imul(g, ht)) | 0),
            (i = (i + Math.imul(y, at)) | 0),
            (o = (o + Math.imul(y, ht)) | 0),
            (n = (n + Math.imul(p, ft)) | 0),
            (i = (i + Math.imul(p, ct)) | 0),
            (i = (i + Math.imul(m, ft)) | 0),
            (o = (o + Math.imul(m, ct)) | 0),
            (n = (n + Math.imul(f, pt)) | 0),
            (i = (i + Math.imul(f, mt)) | 0),
            (i = (i + Math.imul(c, pt)) | 0),
            (o = (o + Math.imul(c, mt)) | 0);
          var Et = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Et >>> 26)) | 0),
            (Et &= 67108863),
            (n = Math.imul(q, Z)),
            (i = Math.imul(q, W)),
            (i = (i + Math.imul(U, Z)) | 0),
            (o = Math.imul(U, W)),
            (n = (n + Math.imul(P, Y)) | 0),
            (i = (i + Math.imul(P, $)) | 0),
            (i = (i + Math.imul(I, Y)) | 0),
            (o = (o + Math.imul(I, $)) | 0),
            (n = (n + Math.imul(j, V)) | 0),
            (i = (i + Math.imul(j, J)) | 0),
            (i = (i + Math.imul(N, V)) | 0),
            (o = (o + Math.imul(N, J)) | 0),
            (n = (n + Math.imul(T, Q)) | 0),
            (i = (i + Math.imul(T, tt)) | 0),
            (i = (i + Math.imul(R, Q)) | 0),
            (o = (o + Math.imul(R, tt)) | 0),
            (n = (n + Math.imul(A, rt)) | 0),
            (i = (i + Math.imul(A, nt)) | 0),
            (i = (i + Math.imul(k, rt)) | 0),
            (o = (o + Math.imul(k, nt)) | 0),
            (n = (n + Math.imul(x, ot)) | 0),
            (i = (i + Math.imul(x, st)) | 0),
            (i = (i + Math.imul(S, ot)) | 0),
            (o = (o + Math.imul(S, st)) | 0),
            (n = (n + Math.imul(b, at)) | 0),
            (i = (i + Math.imul(b, ht)) | 0),
            (i = (i + Math.imul(M, at)) | 0),
            (o = (o + Math.imul(M, ht)) | 0),
            (n = (n + Math.imul(g, ft)) | 0),
            (i = (i + Math.imul(g, ct)) | 0),
            (i = (i + Math.imul(y, ft)) | 0),
            (o = (o + Math.imul(y, ct)) | 0),
            (n = (n + Math.imul(p, pt)) | 0),
            (i = (i + Math.imul(p, mt)) | 0),
            (i = (i + Math.imul(m, pt)) | 0),
            (o = (o + Math.imul(m, mt)) | 0);
          var At = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (At >>> 26)) | 0),
            (At &= 67108863),
            (n = Math.imul(q, Y)),
            (i = Math.imul(q, $)),
            (i = (i + Math.imul(U, Y)) | 0),
            (o = Math.imul(U, $)),
            (n = (n + Math.imul(P, V)) | 0),
            (i = (i + Math.imul(P, J)) | 0),
            (i = (i + Math.imul(I, V)) | 0),
            (o = (o + Math.imul(I, J)) | 0),
            (n = (n + Math.imul(j, Q)) | 0),
            (i = (i + Math.imul(j, tt)) | 0),
            (i = (i + Math.imul(N, Q)) | 0),
            (o = (o + Math.imul(N, tt)) | 0),
            (n = (n + Math.imul(T, rt)) | 0),
            (i = (i + Math.imul(T, nt)) | 0),
            (i = (i + Math.imul(R, rt)) | 0),
            (o = (o + Math.imul(R, nt)) | 0),
            (n = (n + Math.imul(A, ot)) | 0),
            (i = (i + Math.imul(A, st)) | 0),
            (i = (i + Math.imul(k, ot)) | 0),
            (o = (o + Math.imul(k, st)) | 0),
            (n = (n + Math.imul(x, at)) | 0),
            (i = (i + Math.imul(x, ht)) | 0),
            (i = (i + Math.imul(S, at)) | 0),
            (o = (o + Math.imul(S, ht)) | 0),
            (n = (n + Math.imul(b, ft)) | 0),
            (i = (i + Math.imul(b, ct)) | 0),
            (i = (i + Math.imul(M, ft)) | 0),
            (o = (o + Math.imul(M, ct)) | 0),
            (n = (n + Math.imul(g, pt)) | 0),
            (i = (i + Math.imul(g, mt)) | 0),
            (i = (i + Math.imul(y, pt)) | 0),
            (o = (o + Math.imul(y, mt)) | 0);
          var kt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (kt >>> 26)) | 0),
            (kt &= 67108863),
            (n = Math.imul(q, V)),
            (i = Math.imul(q, J)),
            (i = (i + Math.imul(U, V)) | 0),
            (o = Math.imul(U, J)),
            (n = (n + Math.imul(P, Q)) | 0),
            (i = (i + Math.imul(P, tt)) | 0),
            (i = (i + Math.imul(I, Q)) | 0),
            (o = (o + Math.imul(I, tt)) | 0),
            (n = (n + Math.imul(j, rt)) | 0),
            (i = (i + Math.imul(j, nt)) | 0),
            (i = (i + Math.imul(N, rt)) | 0),
            (o = (o + Math.imul(N, nt)) | 0),
            (n = (n + Math.imul(T, ot)) | 0),
            (i = (i + Math.imul(T, st)) | 0),
            (i = (i + Math.imul(R, ot)) | 0),
            (o = (o + Math.imul(R, st)) | 0),
            (n = (n + Math.imul(A, at)) | 0),
            (i = (i + Math.imul(A, ht)) | 0),
            (i = (i + Math.imul(k, at)) | 0),
            (o = (o + Math.imul(k, ht)) | 0),
            (n = (n + Math.imul(x, ft)) | 0),
            (i = (i + Math.imul(x, ct)) | 0),
            (i = (i + Math.imul(S, ft)) | 0),
            (o = (o + Math.imul(S, ct)) | 0),
            (n = (n + Math.imul(b, pt)) | 0),
            (i = (i + Math.imul(b, mt)) | 0),
            (i = (i + Math.imul(M, pt)) | 0),
            (o = (o + Math.imul(M, mt)) | 0);
          var Ot = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Ot >>> 26)) | 0),
            (Ot &= 67108863),
            (n = Math.imul(q, Q)),
            (i = Math.imul(q, tt)),
            (i = (i + Math.imul(U, Q)) | 0),
            (o = Math.imul(U, tt)),
            (n = (n + Math.imul(P, rt)) | 0),
            (i = (i + Math.imul(P, nt)) | 0),
            (i = (i + Math.imul(I, rt)) | 0),
            (o = (o + Math.imul(I, nt)) | 0),
            (n = (n + Math.imul(j, ot)) | 0),
            (i = (i + Math.imul(j, st)) | 0),
            (i = (i + Math.imul(N, ot)) | 0),
            (o = (o + Math.imul(N, st)) | 0),
            (n = (n + Math.imul(T, at)) | 0),
            (i = (i + Math.imul(T, ht)) | 0),
            (i = (i + Math.imul(R, at)) | 0),
            (o = (o + Math.imul(R, ht)) | 0),
            (n = (n + Math.imul(A, ft)) | 0),
            (i = (i + Math.imul(A, ct)) | 0),
            (i = (i + Math.imul(k, ft)) | 0),
            (o = (o + Math.imul(k, ct)) | 0),
            (n = (n + Math.imul(x, pt)) | 0),
            (i = (i + Math.imul(x, mt)) | 0),
            (i = (i + Math.imul(S, pt)) | 0),
            (o = (o + Math.imul(S, mt)) | 0);
          var Tt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Tt >>> 26)) | 0),
            (Tt &= 67108863),
            (n = Math.imul(q, rt)),
            (i = Math.imul(q, nt)),
            (i = (i + Math.imul(U, rt)) | 0),
            (o = Math.imul(U, nt)),
            (n = (n + Math.imul(P, ot)) | 0),
            (i = (i + Math.imul(P, st)) | 0),
            (i = (i + Math.imul(I, ot)) | 0),
            (o = (o + Math.imul(I, st)) | 0),
            (n = (n + Math.imul(j, at)) | 0),
            (i = (i + Math.imul(j, ht)) | 0),
            (i = (i + Math.imul(N, at)) | 0),
            (o = (o + Math.imul(N, ht)) | 0),
            (n = (n + Math.imul(T, ft)) | 0),
            (i = (i + Math.imul(T, ct)) | 0),
            (i = (i + Math.imul(R, ft)) | 0),
            (o = (o + Math.imul(R, ct)) | 0),
            (n = (n + Math.imul(A, pt)) | 0),
            (i = (i + Math.imul(A, mt)) | 0),
            (i = (i + Math.imul(k, pt)) | 0),
            (o = (o + Math.imul(k, mt)) | 0);
          var Rt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Rt >>> 26)) | 0),
            (Rt &= 67108863),
            (n = Math.imul(q, ot)),
            (i = Math.imul(q, st)),
            (i = (i + Math.imul(U, ot)) | 0),
            (o = Math.imul(U, st)),
            (n = (n + Math.imul(P, at)) | 0),
            (i = (i + Math.imul(P, ht)) | 0),
            (i = (i + Math.imul(I, at)) | 0),
            (o = (o + Math.imul(I, ht)) | 0),
            (n = (n + Math.imul(j, ft)) | 0),
            (i = (i + Math.imul(j, ct)) | 0),
            (i = (i + Math.imul(N, ft)) | 0),
            (o = (o + Math.imul(N, ct)) | 0),
            (n = (n + Math.imul(T, pt)) | 0),
            (i = (i + Math.imul(T, mt)) | 0),
            (i = (i + Math.imul(R, pt)) | 0),
            (o = (o + Math.imul(R, mt)) | 0);
          var Ct = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Ct >>> 26)) | 0),
            (Ct &= 67108863),
            (n = Math.imul(q, at)),
            (i = Math.imul(q, ht)),
            (i = (i + Math.imul(U, at)) | 0),
            (o = Math.imul(U, ht)),
            (n = (n + Math.imul(P, ft)) | 0),
            (i = (i + Math.imul(P, ct)) | 0),
            (i = (i + Math.imul(I, ft)) | 0),
            (o = (o + Math.imul(I, ct)) | 0),
            (n = (n + Math.imul(j, pt)) | 0),
            (i = (i + Math.imul(j, mt)) | 0),
            (i = (i + Math.imul(N, pt)) | 0),
            (o = (o + Math.imul(N, mt)) | 0);
          var jt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (jt >>> 26)) | 0),
            (jt &= 67108863),
            (n = Math.imul(q, ft)),
            (i = Math.imul(q, ct)),
            (i = (i + Math.imul(U, ft)) | 0),
            (o = Math.imul(U, ct)),
            (n = (n + Math.imul(P, pt)) | 0),
            (i = (i + Math.imul(P, mt)) | 0),
            (i = (i + Math.imul(I, pt)) | 0),
            (o = (o + Math.imul(I, mt)) | 0);
          var Nt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Nt >>> 26)) | 0),
            (Nt &= 67108863),
            (n = Math.imul(q, pt)),
            (i = Math.imul(q, mt)),
            (i = (i + Math.imul(U, pt)) | 0),
            (o = Math.imul(U, mt));
          var Lt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          return (
            (h = (((o + (i >>> 13)) | 0) + (Lt >>> 26)) | 0),
            (Lt &= 67108863),
            (a[0] = vt),
            (a[1] = gt),
            (a[2] = yt),
            (a[3] = wt),
            (a[4] = bt),
            (a[5] = Mt),
            (a[6] = _t),
            (a[7] = xt),
            (a[8] = St),
            (a[9] = Et),
            (a[10] = At),
            (a[11] = kt),
            (a[12] = Ot),
            (a[13] = Tt),
            (a[14] = Rt),
            (a[15] = Ct),
            (a[16] = jt),
            (a[17] = Nt),
            (a[18] = Lt),
            0 !== h && ((a[19] = h), r.length++),
            r
          );
        };
        function m(t, e, r) {
          (r.negative = e.negative ^ t.negative),
            (r.length = t.length + e.length);
          for (var n = 0, i = 0, o = 0; o < r.length - 1; o++) {
            var s = i;
            i = 0;
            for (
              var u = 67108863 & n,
                a = Math.min(o, e.length - 1),
                h = Math.max(0, o - t.length + 1);
              h <= a;
              h++
            ) {
              var l = o - h,
                f = 0 | t.words[l],
                c = 0 | e.words[h],
                d = f * c,
                p = 67108863 & d;
              (s = (s + ((d / 67108864) | 0)) | 0),
                (p = (p + u) | 0),
                (u = 67108863 & p),
                (s = (s + (p >>> 26)) | 0),
                (i += s >>> 26),
                (s &= 67108863);
            }
            (r.words[o] = u), (n = s), (s = i);
          }
          return 0 !== n ? (r.words[o] = n) : r.length--, r.strip();
        }
        function v(t, e, r) {
          var n = new g();
          return n.mulp(t, e, r);
        }
        function g(t, e) {
          (this.x = t), (this.y = e);
        }
        Math.imul || (p = d),
          (o.prototype.mulTo = function (t, e) {
            var r,
              n = this.length + t.length;
            return (
              (r =
                10 === this.length && 10 === t.length
                  ? p(this, t, e)
                  : n < 63
                  ? d(this, t, e)
                  : n < 1024
                  ? m(this, t, e)
                  : v(this, t, e)),
              r
            );
          }),
          (g.prototype.makeRBT = function (t) {
            for (
              var e = new Array(t), r = o.prototype._countBits(t) - 1, n = 0;
              n < t;
              n++
            )
              e[n] = this.revBin(n, r, t);
            return e;
          }),
          (g.prototype.revBin = function (t, e, r) {
            if (0 === t || t === r - 1) return t;
            for (var n = 0, i = 0; i < e; i++)
              (n |= (1 & t) << (e - i - 1)), (t >>= 1);
            return n;
          }),
          (g.prototype.permute = function (t, e, r, n, i, o) {
            for (var s = 0; s < o; s++) (n[s] = e[t[s]]), (i[s] = r[t[s]]);
          }),
          (g.prototype.transform = function (t, e, r, n, i, o) {
            this.permute(o, t, e, r, n, i);
            for (var s = 1; s < i; s <<= 1)
              for (
                var u = s << 1,
                  a = Math.cos((2 * Math.PI) / u),
                  h = Math.sin((2 * Math.PI) / u),
                  l = 0;
                l < i;
                l += u
              )
                for (var f = a, c = h, d = 0; d < s; d++) {
                  var p = r[l + d],
                    m = n[l + d],
                    v = r[l + d + s],
                    g = n[l + d + s],
                    y = f * v - c * g;
                  (g = f * g + c * v),
                    (v = y),
                    (r[l + d] = p + v),
                    (n[l + d] = m + g),
                    (r[l + d + s] = p - v),
                    (n[l + d + s] = m - g),
                    d !== u &&
                      ((y = a * f - h * c), (c = a * c + h * f), (f = y));
                }
          }),
          (g.prototype.guessLen13b = function (t, e) {
            var r = 1 | Math.max(e, t),
              n = 1 & r,
              i = 0;
            for (r = (r / 2) | 0; r; r >>>= 1) i++;
            return 1 << (i + 1 + n);
          }),
          (g.prototype.conjugate = function (t, e, r) {
            if (!(r <= 1))
              for (var n = 0; n < r / 2; n++) {
                var i = t[n];
                (t[n] = t[r - n - 1]),
                  (t[r - n - 1] = i),
                  (i = e[n]),
                  (e[n] = -e[r - n - 1]),
                  (e[r - n - 1] = -i);
              }
          }),
          (g.prototype.normalize13b = function (t, e) {
            for (var r = 0, n = 0; n < e / 2; n++) {
              var i =
                8192 * Math.round(t[2 * n + 1] / e) +
                Math.round(t[2 * n] / e) +
                r;
              (t[n] = 67108863 & i),
                (r = i < 67108864 ? 0 : (i / 67108864) | 0);
            }
            return t;
          }),
          (g.prototype.convert13b = function (t, e, r, i) {
            for (var o = 0, s = 0; s < e; s++)
              (o += 0 | t[s]),
                (r[2 * s] = 8191 & o),
                (o >>>= 13),
                (r[2 * s + 1] = 8191 & o),
                (o >>>= 13);
            for (s = 2 * e; s < i; ++s) r[s] = 0;
            n(0 === o), n(0 === (-8192 & o));
          }),
          (g.prototype.stub = function (t) {
            for (var e = new Array(t), r = 0; r < t; r++) e[r] = 0;
            return e;
          }),
          (g.prototype.mulp = function (t, e, r) {
            var n = 2 * this.guessLen13b(t.length, e.length),
              i = this.makeRBT(n),
              o = this.stub(n),
              s = new Array(n),
              u = new Array(n),
              a = new Array(n),
              h = new Array(n),
              l = new Array(n),
              f = new Array(n),
              c = r.words;
            (c.length = n),
              this.convert13b(t.words, t.length, s, n),
              this.convert13b(e.words, e.length, h, n),
              this.transform(s, o, u, a, n, i),
              this.transform(h, o, l, f, n, i);
            for (var d = 0; d < n; d++) {
              var p = u[d] * l[d] - a[d] * f[d];
              (a[d] = u[d] * f[d] + a[d] * l[d]), (u[d] = p);
            }
            return (
              this.conjugate(u, a, n),
              this.transform(u, a, c, o, n, i),
              this.conjugate(c, o, n),
              this.normalize13b(c, n),
              (r.negative = t.negative ^ e.negative),
              (r.length = t.length + e.length),
              r.strip()
            );
          }),
          (o.prototype.mul = function (t) {
            var e = new o(null);
            return (
              (e.words = new Array(this.length + t.length)), this.mulTo(t, e)
            );
          }),
          (o.prototype.mulf = function (t) {
            var e = new o(null);
            return (e.words = new Array(this.length + t.length)), v(this, t, e);
          }),
          (o.prototype.imul = function (t) {
            return this.clone().mulTo(t, this);
          }),
          (o.prototype.imuln = function (t) {
            n("number" === typeof t), n(t < 67108864);
            for (var e = 0, r = 0; r < this.length; r++) {
              var i = (0 | this.words[r]) * t,
                o = (67108863 & i) + (67108863 & e);
              (e >>= 26),
                (e += (i / 67108864) | 0),
                (e += o >>> 26),
                (this.words[r] = 67108863 & o);
            }
            return 0 !== e && ((this.words[r] = e), this.length++), this;
          }),
          (o.prototype.muln = function (t) {
            return this.clone().imuln(t);
          }),
          (o.prototype.sqr = function () {
            return this.mul(this);
          }),
          (o.prototype.isqr = function () {
            return this.imul(this.clone());
          }),
          (o.prototype.pow = function (t) {
            var e = c(t);
            if (0 === e.length) return new o(1);
            for (var r = this, n = 0; n < e.length; n++, r = r.sqr())
              if (0 !== e[n]) break;
            if (++n < e.length)
              for (var i = r.sqr(); n < e.length; n++, i = i.sqr())
                0 !== e[n] && (r = r.mul(i));
            return r;
          }),
          (o.prototype.iushln = function (t) {
            n("number" === typeof t && t >= 0);
            var e,
              r = t % 26,
              i = (t - r) / 26,
              o = (67108863 >>> (26 - r)) << (26 - r);
            if (0 !== r) {
              var s = 0;
              for (e = 0; e < this.length; e++) {
                var u = this.words[e] & o,
                  a = ((0 | this.words[e]) - u) << r;
                (this.words[e] = a | s), (s = u >>> (26 - r));
              }
              s && ((this.words[e] = s), this.length++);
            }
            if (0 !== i) {
              for (e = this.length - 1; e >= 0; e--)
                this.words[e + i] = this.words[e];
              for (e = 0; e < i; e++) this.words[e] = 0;
              this.length += i;
            }
            return this.strip();
          }),
          (o.prototype.ishln = function (t) {
            return n(0 === this.negative), this.iushln(t);
          }),
          (o.prototype.iushrn = function (t, e, r) {
            var i;
            n("number" === typeof t && t >= 0),
              (i = e ? (e - (e % 26)) / 26 : 0);
            var o = t % 26,
              s = Math.min((t - o) / 26, this.length),
              u = 67108863 ^ ((67108863 >>> o) << o),
              a = r;
            if (((i -= s), (i = Math.max(0, i)), a)) {
              for (var h = 0; h < s; h++) a.words[h] = this.words[h];
              a.length = s;
            }
            if (0 === s);
            else if (this.length > s)
              for (this.length -= s, h = 0; h < this.length; h++)
                this.words[h] = this.words[h + s];
            else (this.words[0] = 0), (this.length = 1);
            var l = 0;
            for (h = this.length - 1; h >= 0 && (0 !== l || h >= i); h--) {
              var f = 0 | this.words[h];
              (this.words[h] = (l << (26 - o)) | (f >>> o)), (l = f & u);
            }
            return (
              a && 0 !== l && (a.words[a.length++] = l),
              0 === this.length && ((this.words[0] = 0), (this.length = 1)),
              this.strip()
            );
          }),
          (o.prototype.ishrn = function (t, e, r) {
            return n(0 === this.negative), this.iushrn(t, e, r);
          }),
          (o.prototype.shln = function (t) {
            return this.clone().ishln(t);
          }),
          (o.prototype.ushln = function (t) {
            return this.clone().iushln(t);
          }),
          (o.prototype.shrn = function (t) {
            return this.clone().ishrn(t);
          }),
          (o.prototype.ushrn = function (t) {
            return this.clone().iushrn(t);
          }),
          (o.prototype.testn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = t % 26,
              r = (t - e) / 26,
              i = 1 << e;
            if (this.length <= r) return !1;
            var o = this.words[r];
            return !!(o & i);
          }),
          (o.prototype.imaskn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = t % 26,
              r = (t - e) / 26;
            if (
              (n(
                0 === this.negative,
                "imaskn works only with positive numbers"
              ),
              this.length <= r)
            )
              return this;
            if (
              (0 !== e && r++,
              (this.length = Math.min(r, this.length)),
              0 !== e)
            ) {
              var i = 67108863 ^ ((67108863 >>> e) << e);
              this.words[this.length - 1] &= i;
            }
            return this.strip();
          }),
          (o.prototype.maskn = function (t) {
            return this.clone().imaskn(t);
          }),
          (o.prototype.iaddn = function (t) {
            return (
              n("number" === typeof t),
              n(t < 67108864),
              t < 0
                ? this.isubn(-t)
                : 0 !== this.negative
                ? 1 === this.length && (0 | this.words[0]) < t
                  ? ((this.words[0] = t - (0 | this.words[0])),
                    (this.negative = 0),
                    this)
                  : ((this.negative = 0),
                    this.isubn(t),
                    (this.negative = 1),
                    this)
                : this._iaddn(t)
            );
          }),
          (o.prototype._iaddn = function (t) {
            this.words[0] += t;
            for (var e = 0; e < this.length && this.words[e] >= 67108864; e++)
              (this.words[e] -= 67108864),
                e === this.length - 1
                  ? (this.words[e + 1] = 1)
                  : this.words[e + 1]++;
            return (this.length = Math.max(this.length, e + 1)), this;
          }),
          (o.prototype.isubn = function (t) {
            if ((n("number" === typeof t), n(t < 67108864), t < 0))
              return this.iaddn(-t);
            if (0 !== this.negative)
              return (
                (this.negative = 0), this.iaddn(t), (this.negative = 1), this
              );
            if (((this.words[0] -= t), 1 === this.length && this.words[0] < 0))
              (this.words[0] = -this.words[0]), (this.negative = 1);
            else
              for (var e = 0; e < this.length && this.words[e] < 0; e++)
                (this.words[e] += 67108864), (this.words[e + 1] -= 1);
            return this.strip();
          }),
          (o.prototype.addn = function (t) {
            return this.clone().iaddn(t);
          }),
          (o.prototype.subn = function (t) {
            return this.clone().isubn(t);
          }),
          (o.prototype.iabs = function () {
            return (this.negative = 0), this;
          }),
          (o.prototype.abs = function () {
            return this.clone().iabs();
          }),
          (o.prototype._ishlnsubmul = function (t, e, r) {
            var i,
              o,
              s = t.length + r;
            this._expand(s);
            var u = 0;
            for (i = 0; i < t.length; i++) {
              o = (0 | this.words[i + r]) + u;
              var a = (0 | t.words[i]) * e;
              (o -= 67108863 & a),
                (u = (o >> 26) - ((a / 67108864) | 0)),
                (this.words[i + r] = 67108863 & o);
            }
            for (; i < this.length - r; i++)
              (o = (0 | this.words[i + r]) + u),
                (u = o >> 26),
                (this.words[i + r] = 67108863 & o);
            if (0 === u) return this.strip();
            for (n(-1 === u), u = 0, i = 0; i < this.length; i++)
              (o = -(0 | this.words[i]) + u),
                (u = o >> 26),
                (this.words[i] = 67108863 & o);
            return (this.negative = 1), this.strip();
          }),
          (o.prototype._wordDiv = function (t, e) {
            var r = this.length - t.length,
              n = this.clone(),
              i = t,
              s = 0 | i.words[i.length - 1],
              u = this._countBits(s);
            (r = 26 - u),
              0 !== r &&
                ((i = i.ushln(r)),
                n.iushln(r),
                (s = 0 | i.words[i.length - 1]));
            var a,
              h = n.length - i.length;
            if ("mod" !== e) {
              (a = new o(null)),
                (a.length = h + 1),
                (a.words = new Array(a.length));
              for (var l = 0; l < a.length; l++) a.words[l] = 0;
            }
            var f = n.clone()._ishlnsubmul(i, 1, h);
            0 === f.negative && ((n = f), a && (a.words[h] = 1));
            for (var c = h - 1; c >= 0; c--) {
              var d =
                67108864 * (0 | n.words[i.length + c]) +
                (0 | n.words[i.length + c - 1]);
              (d = Math.min((d / s) | 0, 67108863)), n._ishlnsubmul(i, d, c);
              while (0 !== n.negative)
                d--,
                  (n.negative = 0),
                  n._ishlnsubmul(i, 1, c),
                  n.isZero() || (n.negative ^= 1);
              a && (a.words[c] = d);
            }
            return (
              a && a.strip(),
              n.strip(),
              "div" !== e && 0 !== r && n.iushrn(r),
              { div: a || null, mod: n }
            );
          }),
          (o.prototype.divmod = function (t, e, r) {
            return (
              n(!t.isZero()),
              this.isZero()
                ? { div: new o(0), mod: new o(0) }
                : 0 !== this.negative && 0 === t.negative
                ? ((u = this.neg().divmod(t, e)),
                  "mod" !== e && (i = u.div.neg()),
                  "div" !== e &&
                    ((s = u.mod.neg()), r && 0 !== s.negative && s.iadd(t)),
                  { div: i, mod: s })
                : 0 === this.negative && 0 !== t.negative
                ? ((u = this.divmod(t.neg(), e)),
                  "mod" !== e && (i = u.div.neg()),
                  { div: i, mod: u.mod })
                : 0 !== (this.negative & t.negative)
                ? ((u = this.neg().divmod(t.neg(), e)),
                  "div" !== e &&
                    ((s = u.mod.neg()), r && 0 !== s.negative && s.isub(t)),
                  { div: u.div, mod: s })
                : t.length > this.length || this.cmp(t) < 0
                ? { div: new o(0), mod: this }
                : 1 === t.length
                ? "div" === e
                  ? { div: this.divn(t.words[0]), mod: null }
                  : "mod" === e
                  ? { div: null, mod: new o(this.modn(t.words[0])) }
                  : {
                      div: this.divn(t.words[0]),
                      mod: new o(this.modn(t.words[0])),
                    }
                : this._wordDiv(t, e)
            );
            var i, s, u;
          }),
          (o.prototype.div = function (t) {
            return this.divmod(t, "div", !1).div;
          }),
          (o.prototype.mod = function (t) {
            return this.divmod(t, "mod", !1).mod;
          }),
          (o.prototype.umod = function (t) {
            return this.divmod(t, "mod", !0).mod;
          }),
          (o.prototype.divRound = function (t) {
            var e = this.divmod(t);
            if (e.mod.isZero()) return e.div;
            var r = 0 !== e.div.negative ? e.mod.isub(t) : e.mod,
              n = t.ushrn(1),
              i = t.andln(1),
              o = r.cmp(n);
            return o < 0 || (1 === i && 0 === o)
              ? e.div
              : 0 !== e.div.negative
              ? e.div.isubn(1)
              : e.div.iaddn(1);
          }),
          (o.prototype.modn = function (t) {
            n(t <= 67108863);
            for (var e = (1 << 26) % t, r = 0, i = this.length - 1; i >= 0; i--)
              r = (e * r + (0 | this.words[i])) % t;
            return r;
          }),
          (o.prototype.idivn = function (t) {
            n(t <= 67108863);
            for (var e = 0, r = this.length - 1; r >= 0; r--) {
              var i = (0 | this.words[r]) + 67108864 * e;
              (this.words[r] = (i / t) | 0), (e = i % t);
            }
            return this.strip();
          }),
          (o.prototype.divn = function (t) {
            return this.clone().idivn(t);
          }),
          (o.prototype.egcd = function (t) {
            n(0 === t.negative), n(!t.isZero());
            var e = this,
              r = t.clone();
            e = 0 !== e.negative ? e.umod(t) : e.clone();
            var i = new o(1),
              s = new o(0),
              u = new o(0),
              a = new o(1),
              h = 0;
            while (e.isEven() && r.isEven()) e.iushrn(1), r.iushrn(1), ++h;
            var l = r.clone(),
              f = e.clone();
            while (!e.isZero()) {
              for (
                var c = 0, d = 1;
                0 === (e.words[0] & d) && c < 26;
                ++c, d <<= 1
              );
              if (c > 0) {
                e.iushrn(c);
                while (c-- > 0)
                  (i.isOdd() || s.isOdd()) && (i.iadd(l), s.isub(f)),
                    i.iushrn(1),
                    s.iushrn(1);
              }
              for (
                var p = 0, m = 1;
                0 === (r.words[0] & m) && p < 26;
                ++p, m <<= 1
              );
              if (p > 0) {
                r.iushrn(p);
                while (p-- > 0)
                  (u.isOdd() || a.isOdd()) && (u.iadd(l), a.isub(f)),
                    u.iushrn(1),
                    a.iushrn(1);
              }
              e.cmp(r) >= 0
                ? (e.isub(r), i.isub(u), s.isub(a))
                : (r.isub(e), u.isub(i), a.isub(s));
            }
            return { a: u, b: a, gcd: r.iushln(h) };
          }),
          (o.prototype._invmp = function (t) {
            n(0 === t.negative), n(!t.isZero());
            var e = this,
              r = t.clone();
            e = 0 !== e.negative ? e.umod(t) : e.clone();
            var i,
              s = new o(1),
              u = new o(0),
              a = r.clone();
            while (e.cmpn(1) > 0 && r.cmpn(1) > 0) {
              for (
                var h = 0, l = 1;
                0 === (e.words[0] & l) && h < 26;
                ++h, l <<= 1
              );
              if (h > 0) {
                e.iushrn(h);
                while (h-- > 0) s.isOdd() && s.iadd(a), s.iushrn(1);
              }
              for (
                var f = 0, c = 1;
                0 === (r.words[0] & c) && f < 26;
                ++f, c <<= 1
              );
              if (f > 0) {
                r.iushrn(f);
                while (f-- > 0) u.isOdd() && u.iadd(a), u.iushrn(1);
              }
              e.cmp(r) >= 0 ? (e.isub(r), s.isub(u)) : (r.isub(e), u.isub(s));
            }
            return (i = 0 === e.cmpn(1) ? s : u), i.cmpn(0) < 0 && i.iadd(t), i;
          }),
          (o.prototype.gcd = function (t) {
            if (this.isZero()) return t.abs();
            if (t.isZero()) return this.abs();
            var e = this.clone(),
              r = t.clone();
            (e.negative = 0), (r.negative = 0);
            for (var n = 0; e.isEven() && r.isEven(); n++)
              e.iushrn(1), r.iushrn(1);
            do {
              while (e.isEven()) e.iushrn(1);
              while (r.isEven()) r.iushrn(1);
              var i = e.cmp(r);
              if (i < 0) {
                var o = e;
                (e = r), (r = o);
              } else if (0 === i || 0 === r.cmpn(1)) break;
              e.isub(r);
            } while (1);
            return r.iushln(n);
          }),
          (o.prototype.invm = function (t) {
            return this.egcd(t).a.umod(t);
          }),
          (o.prototype.isEven = function () {
            return 0 === (1 & this.words[0]);
          }),
          (o.prototype.isOdd = function () {
            return 1 === (1 & this.words[0]);
          }),
          (o.prototype.andln = function (t) {
            return this.words[0] & t;
          }),
          (o.prototype.bincn = function (t) {
            n("number" === typeof t);
            var e = t % 26,
              r = (t - e) / 26,
              i = 1 << e;
            if (this.length <= r)
              return this._expand(r + 1), (this.words[r] |= i), this;
            for (var o = i, s = r; 0 !== o && s < this.length; s++) {
              var u = 0 | this.words[s];
              (u += o), (o = u >>> 26), (u &= 67108863), (this.words[s] = u);
            }
            return 0 !== o && ((this.words[s] = o), this.length++), this;
          }),
          (o.prototype.isZero = function () {
            return 1 === this.length && 0 === this.words[0];
          }),
          (o.prototype.cmpn = function (t) {
            var e,
              r = t < 0;
            if (0 !== this.negative && !r) return -1;
            if (0 === this.negative && r) return 1;
            if ((this.strip(), this.length > 1)) e = 1;
            else {
              r && (t = -t), n(t <= 67108863, "Number is too big");
              var i = 0 | this.words[0];
              e = i === t ? 0 : i < t ? -1 : 1;
            }
            return 0 !== this.negative ? 0 | -e : e;
          }),
          (o.prototype.cmp = function (t) {
            if (0 !== this.negative && 0 === t.negative) return -1;
            if (0 === this.negative && 0 !== t.negative) return 1;
            var e = this.ucmp(t);
            return 0 !== this.negative ? 0 | -e : e;
          }),
          (o.prototype.ucmp = function (t) {
            if (this.length > t.length) return 1;
            if (this.length < t.length) return -1;
            for (var e = 0, r = this.length - 1; r >= 0; r--) {
              var n = 0 | this.words[r],
                i = 0 | t.words[r];
              if (n !== i) {
                n < i ? (e = -1) : n > i && (e = 1);
                break;
              }
            }
            return e;
          }),
          (o.prototype.gtn = function (t) {
            return 1 === this.cmpn(t);
          }),
          (o.prototype.gt = function (t) {
            return 1 === this.cmp(t);
          }),
          (o.prototype.gten = function (t) {
            return this.cmpn(t) >= 0;
          }),
          (o.prototype.gte = function (t) {
            return this.cmp(t) >= 0;
          }),
          (o.prototype.ltn = function (t) {
            return -1 === this.cmpn(t);
          }),
          (o.prototype.lt = function (t) {
            return -1 === this.cmp(t);
          }),
          (o.prototype.lten = function (t) {
            return this.cmpn(t) <= 0;
          }),
          (o.prototype.lte = function (t) {
            return this.cmp(t) <= 0;
          }),
          (o.prototype.eqn = function (t) {
            return 0 === this.cmpn(t);
          }),
          (o.prototype.eq = function (t) {
            return 0 === this.cmp(t);
          }),
          (o.red = function (t) {
            return new S(t);
          }),
          (o.prototype.toRed = function (t) {
            return (
              n(!this.red, "Already a number in reduction context"),
              n(0 === this.negative, "red works only with positives"),
              t.convertTo(this)._forceRed(t)
            );
          }),
          (o.prototype.fromRed = function () {
            return (
              n(
                this.red,
                "fromRed works only with numbers in reduction context"
              ),
              this.red.convertFrom(this)
            );
          }),
          (o.prototype._forceRed = function (t) {
            return (this.red = t), this;
          }),
          (o.prototype.forceRed = function (t) {
            return (
              n(!this.red, "Already a number in reduction context"),
              this._forceRed(t)
            );
          }),
          (o.prototype.redAdd = function (t) {
            return (
              n(this.red, "redAdd works only with red numbers"),
              this.red.add(this, t)
            );
          }),
          (o.prototype.redIAdd = function (t) {
            return (
              n(this.red, "redIAdd works only with red numbers"),
              this.red.iadd(this, t)
            );
          }),
          (o.prototype.redSub = function (t) {
            return (
              n(this.red, "redSub works only with red numbers"),
              this.red.sub(this, t)
            );
          }),
          (o.prototype.redISub = function (t) {
            return (
              n(this.red, "redISub works only with red numbers"),
              this.red.isub(this, t)
            );
          }),
          (o.prototype.redShl = function (t) {
            return (
              n(this.red, "redShl works only with red numbers"),
              this.red.shl(this, t)
            );
          }),
          (o.prototype.redMul = function (t) {
            return (
              n(this.red, "redMul works only with red numbers"),
              this.red._verify2(this, t),
              this.red.mul(this, t)
            );
          }),
          (o.prototype.redIMul = function (t) {
            return (
              n(this.red, "redMul works only with red numbers"),
              this.red._verify2(this, t),
              this.red.imul(this, t)
            );
          }),
          (o.prototype.redSqr = function () {
            return (
              n(this.red, "redSqr works only with red numbers"),
              this.red._verify1(this),
              this.red.sqr(this)
            );
          }),
          (o.prototype.redISqr = function () {
            return (
              n(this.red, "redISqr works only with red numbers"),
              this.red._verify1(this),
              this.red.isqr(this)
            );
          }),
          (o.prototype.redSqrt = function () {
            return (
              n(this.red, "redSqrt works only with red numbers"),
              this.red._verify1(this),
              this.red.sqrt(this)
            );
          }),
          (o.prototype.redInvm = function () {
            return (
              n(this.red, "redInvm works only with red numbers"),
              this.red._verify1(this),
              this.red.invm(this)
            );
          }),
          (o.prototype.redNeg = function () {
            return (
              n(this.red, "redNeg works only with red numbers"),
              this.red._verify1(this),
              this.red.neg(this)
            );
          }),
          (o.prototype.redPow = function (t) {
            return (
              n(this.red && !t.red, "redPow(normalNum)"),
              this.red._verify1(this),
              this.red.pow(this, t)
            );
          });
        var y = { k256: null, p224: null, p192: null, p25519: null };
        function w(t, e) {
          (this.name = t),
            (this.p = new o(e, 16)),
            (this.n = this.p.bitLength()),
            (this.k = new o(1).iushln(this.n).isub(this.p)),
            (this.tmp = this._tmp());
        }
        function b() {
          w.call(
            this,
            "k256",
            "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
          );
        }
        function M() {
          w.call(
            this,
            "p224",
            "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
          );
        }
        function _() {
          w.call(
            this,
            "p192",
            "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
          );
        }
        function x() {
          w.call(
            this,
            "25519",
            "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
          );
        }
        function S(t) {
          if ("string" === typeof t) {
            var e = o._prime(t);
            (this.m = e.p), (this.prime = e);
          } else
            n(t.gtn(1), "modulus must be greater than 1"),
              (this.m = t),
              (this.prime = null);
        }
        function E(t) {
          S.call(this, t),
            (this.shift = this.m.bitLength()),
            this.shift % 26 !== 0 && (this.shift += 26 - (this.shift % 26)),
            (this.r = new o(1).iushln(this.shift)),
            (this.r2 = this.imod(this.r.sqr())),
            (this.rinv = this.r._invmp(this.m)),
            (this.minv = this.rinv.mul(this.r).isubn(1).div(this.m)),
            (this.minv = this.minv.umod(this.r)),
            (this.minv = this.r.sub(this.minv));
        }
        (w.prototype._tmp = function () {
          var t = new o(null);
          return (t.words = new Array(Math.ceil(this.n / 13))), t;
        }),
          (w.prototype.ireduce = function (t) {
            var e,
              r = t;
            do {
              this.split(r, this.tmp),
                (r = this.imulK(r)),
                (r = r.iadd(this.tmp)),
                (e = r.bitLength());
            } while (e > this.n);
            var n = e < this.n ? -1 : r.ucmp(this.p);
            return (
              0 === n
                ? ((r.words[0] = 0), (r.length = 1))
                : n > 0
                ? r.isub(this.p)
                : r.strip(),
              r
            );
          }),
          (w.prototype.split = function (t, e) {
            t.iushrn(this.n, 0, e);
          }),
          (w.prototype.imulK = function (t) {
            return t.imul(this.k);
          }),
          i(b, w),
          (b.prototype.split = function (t, e) {
            for (var r = 4194303, n = Math.min(t.length, 9), i = 0; i < n; i++)
              e.words[i] = t.words[i];
            if (((e.length = n), t.length <= 9))
              return (t.words[0] = 0), void (t.length = 1);
            var o = t.words[9];
            for (e.words[e.length++] = o & r, i = 10; i < t.length; i++) {
              var s = 0 | t.words[i];
              (t.words[i - 10] = ((s & r) << 4) | (o >>> 22)), (o = s);
            }
            (o >>>= 22),
              (t.words[i - 10] = o),
              0 === o && t.length > 10 ? (t.length -= 10) : (t.length -= 9);
          }),
          (b.prototype.imulK = function (t) {
            (t.words[t.length] = 0),
              (t.words[t.length + 1] = 0),
              (t.length += 2);
            for (var e = 0, r = 0; r < t.length; r++) {
              var n = 0 | t.words[r];
              (e += 977 * n),
                (t.words[r] = 67108863 & e),
                (e = 64 * n + ((e / 67108864) | 0));
            }
            return (
              0 === t.words[t.length - 1] &&
                (t.length--, 0 === t.words[t.length - 1] && t.length--),
              t
            );
          }),
          i(M, w),
          i(_, w),
          i(x, w),
          (x.prototype.imulK = function (t) {
            for (var e = 0, r = 0; r < t.length; r++) {
              var n = 19 * (0 | t.words[r]) + e,
                i = 67108863 & n;
              (n >>>= 26), (t.words[r] = i), (e = n);
            }
            return 0 !== e && (t.words[t.length++] = e), t;
          }),
          (o._prime = function (t) {
            if (y[t]) return y[t];
            var e;
            if ("k256" === t) e = new b();
            else if ("p224" === t) e = new M();
            else if ("p192" === t) e = new _();
            else {
              if ("p25519" !== t) throw new Error("Unknown prime " + t);
              e = new x();
            }
            return (y[t] = e), e;
          }),
          (S.prototype._verify1 = function (t) {
            n(0 === t.negative, "red works only with positives"),
              n(t.red, "red works only with red numbers");
          }),
          (S.prototype._verify2 = function (t, e) {
            n(0 === (t.negative | e.negative), "red works only with positives"),
              n(t.red && t.red === e.red, "red works only with red numbers");
          }),
          (S.prototype.imod = function (t) {
            return this.prime
              ? this.prime.ireduce(t)._forceRed(this)
              : t.umod(this.m)._forceRed(this);
          }),
          (S.prototype.neg = function (t) {
            return t.isZero() ? t.clone() : this.m.sub(t)._forceRed(this);
          }),
          (S.prototype.add = function (t, e) {
            this._verify2(t, e);
            var r = t.add(e);
            return r.cmp(this.m) >= 0 && r.isub(this.m), r._forceRed(this);
          }),
          (S.prototype.iadd = function (t, e) {
            this._verify2(t, e);
            var r = t.iadd(e);
            return r.cmp(this.m) >= 0 && r.isub(this.m), r;
          }),
          (S.prototype.sub = function (t, e) {
            this._verify2(t, e);
            var r = t.sub(e);
            return r.cmpn(0) < 0 && r.iadd(this.m), r._forceRed(this);
          }),
          (S.prototype.isub = function (t, e) {
            this._verify2(t, e);
            var r = t.isub(e);
            return r.cmpn(0) < 0 && r.iadd(this.m), r;
          }),
          (S.prototype.shl = function (t, e) {
            return this._verify1(t), this.imod(t.ushln(e));
          }),
          (S.prototype.imul = function (t, e) {
            return this._verify2(t, e), this.imod(t.imul(e));
          }),
          (S.prototype.mul = function (t, e) {
            return this._verify2(t, e), this.imod(t.mul(e));
          }),
          (S.prototype.isqr = function (t) {
            return this.imul(t, t.clone());
          }),
          (S.prototype.sqr = function (t) {
            return this.mul(t, t);
          }),
          (S.prototype.sqrt = function (t) {
            if (t.isZero()) return t.clone();
            var e = this.m.andln(3);
            if ((n(e % 2 === 1), 3 === e)) {
              var r = this.m.add(new o(1)).iushrn(2);
              return this.pow(t, r);
            }
            var i = this.m.subn(1),
              s = 0;
            while (!i.isZero() && 0 === i.andln(1)) s++, i.iushrn(1);
            n(!i.isZero());
            var u = new o(1).toRed(this),
              a = u.redNeg(),
              h = this.m.subn(1).iushrn(1),
              l = this.m.bitLength();
            l = new o(2 * l * l).toRed(this);
            while (0 !== this.pow(l, h).cmp(a)) l.redIAdd(a);
            var f = this.pow(l, i),
              c = this.pow(t, i.addn(1).iushrn(1)),
              d = this.pow(t, i),
              p = s;
            while (0 !== d.cmp(u)) {
              for (var m = d, v = 0; 0 !== m.cmp(u); v++) m = m.redSqr();
              n(v < p);
              var g = this.pow(f, new o(1).iushln(p - v - 1));
              (c = c.redMul(g)), (f = g.redSqr()), (d = d.redMul(f)), (p = v);
            }
            return c;
          }),
          (S.prototype.invm = function (t) {
            var e = t._invmp(this.m);
            return 0 !== e.negative
              ? ((e.negative = 0), this.imod(e).redNeg())
              : this.imod(e);
          }),
          (S.prototype.pow = function (t, e) {
            if (e.isZero()) return new o(1);
            if (0 === e.cmpn(1)) return t.clone();
            var r = 4,
              n = new Array(1 << r);
            (n[0] = new o(1).toRed(this)), (n[1] = t);
            for (var i = 2; i < n.length; i++) n[i] = this.mul(n[i - 1], t);
            var s = n[0],
              u = 0,
              a = 0,
              h = e.bitLength() % 26;
            for (0 === h && (h = 26), i = e.length - 1; i >= 0; i--) {
              for (var l = e.words[i], f = h - 1; f >= 0; f--) {
                var c = (l >> f) & 1;
                s !== n[0] && (s = this.sqr(s)),
                  0 !== c || 0 !== u
                    ? ((u <<= 1),
                      (u |= c),
                      a++,
                      (a === r || (0 === i && 0 === f)) &&
                        ((s = this.mul(s, n[u])), (a = 0), (u = 0)))
                    : (a = 0);
              }
              h = 26;
            }
            return s;
          }),
          (S.prototype.convertTo = function (t) {
            var e = t.umod(this.m);
            return e === t ? e.clone() : e;
          }),
          (S.prototype.convertFrom = function (t) {
            var e = t.clone();
            return (e.red = null), e;
          }),
          (o.mont = function (t) {
            return new E(t);
          }),
          i(E, S),
          (E.prototype.convertTo = function (t) {
            return this.imod(t.ushln(this.shift));
          }),
          (E.prototype.convertFrom = function (t) {
            var e = this.imod(t.mul(this.rinv));
            return (e.red = null), e;
          }),
          (E.prototype.imul = function (t, e) {
            if (t.isZero() || e.isZero())
              return (t.words[0] = 0), (t.length = 1), t;
            var r = t.imul(e),
              n = r
                .maskn(this.shift)
                .mul(this.minv)
                .imaskn(this.shift)
                .mul(this.m),
              i = r.isub(n).iushrn(this.shift),
              o = i;
            return (
              i.cmp(this.m) >= 0
                ? (o = i.isub(this.m))
                : i.cmpn(0) < 0 && (o = i.iadd(this.m)),
              o._forceRed(this)
            );
          }),
          (E.prototype.mul = function (t, e) {
            if (t.isZero() || e.isZero()) return new o(0)._forceRed(this);
            var r = t.mul(e),
              n = r
                .maskn(this.shift)
                .mul(this.minv)
                .imaskn(this.shift)
                .mul(this.m),
              i = r.isub(n).iushrn(this.shift),
              s = i;
            return (
              i.cmp(this.m) >= 0
                ? (s = i.isub(this.m))
                : i.cmpn(0) < 0 && (s = i.iadd(this.m)),
              s._forceRed(this)
            );
          }),
          (E.prototype.invm = function (t) {
            var e = this.imod(t._invmp(this.m).mul(this.r2));
            return e._forceRed(this);
          });
      })(t, this);
    }.call(this, r("62e4")(t)));
  },
  "4ae1": function (t, e, r) {
    var n = r("23e7"),
      i = r("d066"),
      o = r("1c0b"),
      s = r("825a"),
      u = r("861d"),
      a = r("7c73"),
      h = r("0538"),
      l = r("d039"),
      f = i("Reflect", "construct"),
      c = l(function () {
        function t() {}
        return !(f(function () {}, [], t) instanceof t);
      }),
      d = !l(function () {
        f(function () {});
      }),
      p = c || d;
    n(
      { target: "Reflect", stat: !0, forced: p, sham: p },
      {
        construct: function (t, e) {
          o(t), s(e);
          var r = arguments.length < 3 ? t : o(arguments[2]);
          if (d && !c) return f(t, e, r);
          if (t == r) {
            switch (e.length) {
              case 0:
                return new t();
              case 1:
                return new t(e[0]);
              case 2:
                return new t(e[0], e[1]);
              case 3:
                return new t(e[0], e[1], e[2]);
              case 4:
                return new t(e[0], e[1], e[2], e[3]);
            }
            var n = [null];
            return n.push.apply(n, e), new (h.apply(t, n))();
          }
          var i = r.prototype,
            l = a(u(i) ? i : Object.prototype),
            p = Function.apply.call(t, l, e);
          return u(p) ? p : l;
        },
      }
    );
  },
  "4d64": function (t, e, r) {
    var n = r("fc6a"),
      i = r("50c4"),
      o = r("23cb"),
      s = function (t) {
        return function (e, r, s) {
          var u,
            a = n(e),
            h = i(a.length),
            l = o(s, h);
          if (t && r != r) {
            while (h > l) if (((u = a[l++]), u != u)) return !0;
          } else
            for (; h > l; l++)
              if ((t || l in a) && a[l] === r) return t || l || 0;
          return !t && -1;
        };
      };
    t.exports = { includes: s(!0), indexOf: s(!1) };
  },
  "4e92": function (t, e, r) {
    "use strict";
    t.exports = s;
    var n = r("1715"),
      i = Object.create(r("3a7c"));
    function o(t, e) {
      var r = this._transformState;
      r.transforming = !1;
      var n = r.writecb;
      if (!n)
        return this.emit(
          "error",
          new Error("write callback called multiple times")
        );
      (r.writechunk = null),
        (r.writecb = null),
        null != e && this.push(e),
        n(t);
      var i = this._readableState;
      (i.reading = !1),
        (i.needReadable || i.length < i.highWaterMark) &&
          this._read(i.highWaterMark);
    }
    function s(t) {
      if (!(this instanceof s)) return new s(t);
      n.call(this, t),
        (this._transformState = {
          afterTransform: o.bind(this),
          needTransform: !1,
          transforming: !1,
          writecb: null,
          writechunk: null,
          writeencoding: null,
        }),
        (this._readableState.needReadable = !0),
        (this._readableState.sync = !1),
        t &&
          ("function" === typeof t.transform && (this._transform = t.transform),
          "function" === typeof t.flush && (this._flush = t.flush)),
        this.on("prefinish", u);
    }
    function u() {
      var t = this;
      "function" === typeof this._flush
        ? this._flush(function (e, r) {
            a(t, e, r);
          })
        : a(this, null, null);
    }
    function a(t, e, r) {
      if (e) return t.emit("error", e);
      if ((null != r && t.push(r), t._writableState.length))
        throw new Error("Calling transform done when ws.length != 0");
      if (t._transformState.transforming)
        throw new Error("Calling transform done when still transforming");
      return t.push(null);
    }
    (i.inherits = r("3fb5")),
      i.inherits(s, n),
      (s.prototype.push = function (t, e) {
        return (
          (this._transformState.needTransform = !1),
          n.prototype.push.call(this, t, e)
        );
      }),
      (s.prototype._transform = function (t, e, r) {
        throw new Error("_transform() is not implemented");
      }),
      (s.prototype._write = function (t, e, r) {
        var n = this._transformState;
        if (
          ((n.writecb = r),
          (n.writechunk = t),
          (n.writeencoding = e),
          !n.transforming)
        ) {
          var i = this._readableState;
          (n.needTransform || i.needReadable || i.length < i.highWaterMark) &&
            this._read(i.highWaterMark);
        }
      }),
      (s.prototype._read = function (t) {
        var e = this._transformState;
        null !== e.writechunk && e.writecb && !e.transforming
          ? ((e.transforming = !0),
            this._transform(e.writechunk, e.writeencoding, e.afterTransform))
          : (e.needTransform = !0);
      }),
      (s.prototype._destroy = function (t, e) {
        var r = this;
        n.prototype._destroy.call(this, t, function (t) {
          e(t), r.emit("close");
        });
      });
  },
  "509b": function (t, e, r) {
    "use strict";
    Object.defineProperty(e, "__esModule", { value: !0 });
    const n = r("1c55f");
    function i(t) {
      return "0x" + n.keccak_256(s(t));
    }
    function o(t) {
      const e = [];
      for (let r = 0; r < t.length; r++)
        e.push((t[r] >>> 4).toString(16)), e.push((15 & t[r]).toString(16));
      return "0x" + e.join("").replace(/^0+/, "");
    }
    function s(t) {
      if (null == t) throw new Error("cannot convert null value to array");
      if ("string" === typeof t) {
        const e = t.match(/^(0x)?[0-9a-fA-F]*$/);
        if (!e) throw new Error("invalid hexidecimal string");
        if ("0x" !== e[1]) throw new Error("hex string must have 0x prefix");
        (t = t.substring(2)), t.length % 2 && (t = "0" + t);
        const r = [];
        for (let n = 0; n < t.length; n += 2)
          r.push(parseInt(t.substr(n, 2), 16));
        return a(new Uint8Array(r));
      }
      if (u(t)) return a(new Uint8Array(t));
      throw new Error("invalid arrayify value");
    }
    function u(t) {
      if (!t || parseInt(String(t.length)) != t.length || "string" === typeof t)
        return !1;
      for (let e = 0; e < t.length; e++) {
        const r = t[e];
        if (r < 0 || r >= 256 || parseInt(String(r)) != r) return !1;
      }
      return !0;
    }
    function a(t) {
      return (
        void 0 !== t.slice ||
          (t.slice = () => {
            const e = Array.prototype.slice.call(arguments);
            return a(new Uint8Array(Array.prototype.slice.apply(t, e)));
          }),
        t
      );
    }
    (e.keccak256 = i),
      (e.padLeft = (t, e) => {
        const r = /^0x/i.test(t) || "number" === typeof t;
        t = t.toString().replace(/^0x/i, "");
        const n = e - t.length + 1 >= 0 ? e - t.length + 1 : 0;
        return (r ? "0x" : "") + new Array(n).join("0") + t;
      }),
      (e.bytesToHex = o),
      (e.toByteArray = s);
  },
  "50c4": function (t, e, r) {
    var n = r("a691"),
      i = Math.min;
    t.exports = function (t) {
      return t > 0 ? i(n(t), 9007199254740991) : 0;
    };
  },
  5135: function (t, e) {
    var r = {}.hasOwnProperty;
    t.exports = function (t, e) {
      return r.call(t, e);
    };
  },
  5162: function (t, e) {
    t.exports = function (t) {
      if ("string" !== typeof t)
        throw new Error(
          "[is-hex-prefixed] value must be type 'string', is currently type " +
            typeof t +
            ", while checking isHexPrefixed."
        );
      return "0x" === t.slice(0, 2);
    };
  },
  5319: function (t, e, r) {
    "use strict";
    var n = r("d784"),
      i = r("825a"),
      o = r("7b0b"),
      s = r("50c4"),
      u = r("a691"),
      a = r("1d80"),
      h = r("8aa5"),
      l = r("14c3"),
      f = Math.max,
      c = Math.min,
      d = Math.floor,
      p = /\$([$&'`]|\d\d?|<[^>]*>)/g,
      m = /\$([$&'`]|\d\d?)/g,
      v = function (t) {
        return void 0 === t ? t : String(t);
      };
    n("replace", 2, function (t, e, r, n) {
      var g = n.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE,
        y = n.REPLACE_KEEPS_$0,
        w = g ? "$" : "$0";
      return [
        function (r, n) {
          var i = a(this),
            o = void 0 == r ? void 0 : r[t];
          return void 0 !== o ? o.call(r, i, n) : e.call(String(i), r, n);
        },
        function (t, n) {
          if ((!g && y) || ("string" === typeof n && -1 === n.indexOf(w))) {
            var o = r(e, t, this, n);
            if (o.done) return o.value;
          }
          var a = i(t),
            d = String(this),
            p = "function" === typeof n;
          p || (n = String(n));
          var m = a.global;
          if (m) {
            var M = a.unicode;
            a.lastIndex = 0;
          }
          var _ = [];
          while (1) {
            var x = l(a, d);
            if (null === x) break;
            if ((_.push(x), !m)) break;
            var S = String(x[0]);
            "" === S && (a.lastIndex = h(d, s(a.lastIndex), M));
          }
          for (var E = "", A = 0, k = 0; k < _.length; k++) {
            x = _[k];
            for (
              var O = String(x[0]),
                T = f(c(u(x.index), d.length), 0),
                R = [],
                C = 1;
              C < x.length;
              C++
            )
              R.push(v(x[C]));
            var j = x.groups;
            if (p) {
              var N = [O].concat(R, T, d);
              void 0 !== j && N.push(j);
              var L = String(n.apply(void 0, N));
            } else L = b(O, d, T, R, j, n);
            T >= A && ((E += d.slice(A, T) + L), (A = T + O.length));
          }
          return E + d.slice(A);
        },
      ];
      function b(t, r, n, i, s, u) {
        var a = n + t.length,
          h = i.length,
          l = m;
        return (
          void 0 !== s && ((s = o(s)), (l = p)),
          e.call(u, l, function (e, o) {
            var u;
            switch (o.charAt(0)) {
              case "$":
                return "$";
              case "&":
                return t;
              case "`":
                return r.slice(0, n);
              case "'":
                return r.slice(a);
              case "<":
                u = s[o.slice(1, -1)];
                break;
              default:
                var l = +o;
                if (0 === l) return e;
                if (l > h) {
                  var f = d(l / 10);
                  return 0 === f
                    ? e
                    : f <= h
                    ? void 0 === i[f - 1]
                      ? o.charAt(1)
                      : i[f - 1] + o.charAt(1)
                    : e;
                }
                u = i[l - 1];
            }
            return void 0 === u ? "" : u;
          })
        );
      }
    });
  },
  "53a8": function (t, e) {
    t.exports = n;
    var r = Object.prototype.hasOwnProperty;
    function n() {
      for (var t = {}, e = 0; e < arguments.length; e++) {
        var n = arguments[e];
        for (var i in n) r.call(n, i) && (t[i] = n[i]);
      }
      return t;
    }
  },
  "53ca": function (t, e, r) {
    "use strict";
    r.d(e, "a", function () {
      return n;
    });
    r("a4d3"), r("e01a"), r("d28b"), r("d3b7"), r("3ca3"), r("ddb0");
    function n(t) {
      return (
        (n =
          "function" === typeof Symbol && "symbol" === typeof Symbol.iterator
            ? function (t) {
                return typeof t;
              }
            : function (t) {
                return t &&
                  "function" === typeof Symbol &&
                  t.constructor === Symbol &&
                  t !== Symbol.prototype
                  ? "symbol"
                  : typeof t;
              }),
        n(t)
      );
    }
  },
  5692: function (t, e, r) {
    var n = r("c430"),
      i = r("c6cd");
    (t.exports = function (t, e) {
      return i[t] || (i[t] = void 0 !== e ? e : {});
    })("versions", []).push({
      version: "3.8.1",
      mode: n ? "pure" : "global",
      copyright: "© 2020 Denis Pushkarev (zloirock.ru)",
    });
  },
  "56ef": function (t, e, r) {
    var n = r("d066"),
      i = r("241c"),
      o = r("7418"),
      s = r("825a");
    t.exports =
      n("Reflect", "ownKeys") ||
      function (t) {
        var e = i.f(s(t)),
          r = o.f;
        return r ? e.concat(r(t)) : e;
      };
  },
  "58ab": function (t, e, r) {
    "use strict";
    var n = r("636c"),
      i = r("39d4").errors,
      o = function (t) {
        (this.requestManager = t), (this.requests = []);
      };
    (o.prototype.add = function (t) {
      this.requests.push(t);
    }),
      (o.prototype.execute = function () {
        var t = this.requests;
        this.requestManager.sendBatch(t, function (e, r) {
          (r = r || []),
            t
              .map(function (t, e) {
                return r[e] || {};
              })
              .forEach(function (r, o) {
                if (t[o].callback) {
                  if (r && r.error) return t[o].callback(i.ErrorResponse(r));
                  if (!n.isValidResponse(r))
                    return t[o].callback(i.InvalidResponse(r));
                  try {
                    t[o].callback(
                      null,
                      t[o].format ? t[o].format(r.result) : r.result
                    );
                  } catch (e) {
                    t[o].callback(e);
                  }
                }
              });
        });
      }),
      (t.exports = o);
  },
  "5bc2": function (t, e, r) {
    "use strict";
    (function (e, n) {
      var i = r("966d");
      function o(t) {
        var e = this;
        (this.next = null),
          (this.entry = null),
          (this.finish = function () {
            I(e, t);
          });
      }
      t.exports = w;
      var s,
        u =
          !e.browser && ["v0.10", "v0.9."].indexOf(e.version.slice(0, 5)) > -1
            ? setImmediate
            : i.nextTick;
      w.WritableState = y;
      var a = Object.create(r("3a7c"));
      a.inherits = r("3fb5");
      var h = { deprecate: r("b7d1") },
        l = r("1ad6"),
        f = r("9905").Buffer,
        c = n.Uint8Array || function () {};
      function d(t) {
        return f.from(t);
      }
      function p(t) {
        return f.isBuffer(t) || t instanceof c;
      }
      var m,
        v = r("c69f");
      function g() {}
      function y(t, e) {
        (s = s || r("1715")), (t = t || {});
        var n = e instanceof s;
        (this.objectMode = !!t.objectMode),
          n && (this.objectMode = this.objectMode || !!t.writableObjectMode);
        var i = t.highWaterMark,
          u = t.writableHighWaterMark,
          a = this.objectMode ? 16 : 16384;
        (this.highWaterMark = i || 0 === i ? i : n && (u || 0 === u) ? u : a),
          (this.highWaterMark = Math.floor(this.highWaterMark)),
          (this.finalCalled = !1),
          (this.needDrain = !1),
          (this.ending = !1),
          (this.ended = !1),
          (this.finished = !1),
          (this.destroyed = !1);
        var h = !1 === t.decodeStrings;
        (this.decodeStrings = !h),
          (this.defaultEncoding = t.defaultEncoding || "utf8"),
          (this.length = 0),
          (this.writing = !1),
          (this.corked = 0),
          (this.sync = !0),
          (this.bufferProcessing = !1),
          (this.onwrite = function (t) {
            k(e, t);
          }),
          (this.writecb = null),
          (this.writelen = 0),
          (this.bufferedRequest = null),
          (this.lastBufferedRequest = null),
          (this.pendingcb = 0),
          (this.prefinished = !1),
          (this.errorEmitted = !1),
          (this.bufferedRequestCount = 0),
          (this.corkedRequestsFree = new o(this));
      }
      function w(t) {
        if (((s = s || r("1715")), !m.call(w, this) && !(this instanceof s)))
          return new w(t);
        (this._writableState = new y(t, this)),
          (this.writable = !0),
          t &&
            ("function" === typeof t.write && (this._write = t.write),
            "function" === typeof t.writev && (this._writev = t.writev),
            "function" === typeof t.destroy && (this._destroy = t.destroy),
            "function" === typeof t.final && (this._final = t.final)),
          l.call(this);
      }
      function b(t, e) {
        var r = new Error("write after end");
        t.emit("error", r), i.nextTick(e, r);
      }
      function M(t, e, r, n) {
        var o = !0,
          s = !1;
        return (
          null === r
            ? (s = new TypeError("May not write null values to stream"))
            : "string" === typeof r ||
              void 0 === r ||
              e.objectMode ||
              (s = new TypeError("Invalid non-string/buffer chunk")),
          s && (t.emit("error", s), i.nextTick(n, s), (o = !1)),
          o
        );
      }
      function _(t, e, r) {
        return (
          t.objectMode ||
            !1 === t.decodeStrings ||
            "string" !== typeof e ||
            (e = f.from(e, r)),
          e
        );
      }
      function x(t, e, r, n, i, o) {
        if (!r) {
          var s = _(e, n, i);
          n !== s && ((r = !0), (i = "buffer"), (n = s));
        }
        var u = e.objectMode ? 1 : n.length;
        e.length += u;
        var a = e.length < e.highWaterMark;
        if ((a || (e.needDrain = !0), e.writing || e.corked)) {
          var h = e.lastBufferedRequest;
          (e.lastBufferedRequest = {
            chunk: n,
            encoding: i,
            isBuf: r,
            callback: o,
            next: null,
          }),
            h
              ? (h.next = e.lastBufferedRequest)
              : (e.bufferedRequest = e.lastBufferedRequest),
            (e.bufferedRequestCount += 1);
        } else S(t, e, !1, u, n, i, o);
        return a;
      }
      function S(t, e, r, n, i, o, s) {
        (e.writelen = n),
          (e.writecb = s),
          (e.writing = !0),
          (e.sync = !0),
          r ? t._writev(i, e.onwrite) : t._write(i, o, e.onwrite),
          (e.sync = !1);
      }
      function E(t, e, r, n, o) {
        --e.pendingcb,
          r
            ? (i.nextTick(o, n),
              i.nextTick(L, t, e),
              (t._writableState.errorEmitted = !0),
              t.emit("error", n))
            : (o(n),
              (t._writableState.errorEmitted = !0),
              t.emit("error", n),
              L(t, e));
      }
      function A(t) {
        (t.writing = !1),
          (t.writecb = null),
          (t.length -= t.writelen),
          (t.writelen = 0);
      }
      function k(t, e) {
        var r = t._writableState,
          n = r.sync,
          i = r.writecb;
        if ((A(r), e)) E(t, r, n, e, i);
        else {
          var o = C(r);
          o || r.corked || r.bufferProcessing || !r.bufferedRequest || R(t, r),
            n ? u(O, t, r, o, i) : O(t, r, o, i);
        }
      }
      function O(t, e, r, n) {
        r || T(t, e), e.pendingcb--, n(), L(t, e);
      }
      function T(t, e) {
        0 === e.length && e.needDrain && ((e.needDrain = !1), t.emit("drain"));
      }
      function R(t, e) {
        e.bufferProcessing = !0;
        var r = e.bufferedRequest;
        if (t._writev && r && r.next) {
          var n = e.bufferedRequestCount,
            i = new Array(n),
            s = e.corkedRequestsFree;
          s.entry = r;
          var u = 0,
            a = !0;
          while (r) (i[u] = r), r.isBuf || (a = !1), (r = r.next), (u += 1);
          (i.allBuffers = a),
            S(t, e, !0, e.length, i, "", s.finish),
            e.pendingcb++,
            (e.lastBufferedRequest = null),
            s.next
              ? ((e.corkedRequestsFree = s.next), (s.next = null))
              : (e.corkedRequestsFree = new o(e)),
            (e.bufferedRequestCount = 0);
        } else {
          while (r) {
            var h = r.chunk,
              l = r.encoding,
              f = r.callback,
              c = e.objectMode ? 1 : h.length;
            if (
              (S(t, e, !1, c, h, l, f),
              (r = r.next),
              e.bufferedRequestCount--,
              e.writing)
            )
              break;
          }
          null === r && (e.lastBufferedRequest = null);
        }
        (e.bufferedRequest = r), (e.bufferProcessing = !1);
      }
      function C(t) {
        return (
          t.ending &&
          0 === t.length &&
          null === t.bufferedRequest &&
          !t.finished &&
          !t.writing
        );
      }
      function j(t, e) {
        t._final(function (r) {
          e.pendingcb--,
            r && t.emit("error", r),
            (e.prefinished = !0),
            t.emit("prefinish"),
            L(t, e);
        });
      }
      function N(t, e) {
        e.prefinished ||
          e.finalCalled ||
          ("function" === typeof t._final
            ? (e.pendingcb++, (e.finalCalled = !0), i.nextTick(j, t, e))
            : ((e.prefinished = !0), t.emit("prefinish")));
      }
      function L(t, e) {
        var r = C(e);
        return (
          r &&
            (N(t, e),
            0 === e.pendingcb && ((e.finished = !0), t.emit("finish"))),
          r
        );
      }
      function P(t, e, r) {
        (e.ending = !0),
          L(t, e),
          r && (e.finished ? i.nextTick(r) : t.once("finish", r)),
          (e.ended = !0),
          (t.writable = !1);
      }
      function I(t, e, r) {
        var n = t.entry;
        t.entry = null;
        while (n) {
          var i = n.callback;
          e.pendingcb--, i(r), (n = n.next);
        }
        e.corkedRequestsFree
          ? (e.corkedRequestsFree.next = t)
          : (e.corkedRequestsFree = t);
      }
      a.inherits(w, l),
        (y.prototype.getBuffer = function () {
          var t = this.bufferedRequest,
            e = [];
          while (t) e.push(t), (t = t.next);
          return e;
        }),
        (function () {
          try {
            Object.defineProperty(y.prototype, "buffer", {
              get: h.deprecate(
                function () {
                  return this.getBuffer();
                },
                "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.",
                "DEP0003"
              ),
            });
          } catch (t) {}
        })(),
        "function" === typeof Symbol &&
        Symbol.hasInstance &&
        "function" === typeof Function.prototype[Symbol.hasInstance]
          ? ((m = Function.prototype[Symbol.hasInstance]),
            Object.defineProperty(w, Symbol.hasInstance, {
              value: function (t) {
                return (
                  !!m.call(this, t) ||
                  (this === w && t && t._writableState instanceof y)
                );
              },
            }))
          : (m = function (t) {
              return t instanceof this;
            }),
        (w.prototype.pipe = function () {
          this.emit("error", new Error("Cannot pipe, not readable"));
        }),
        (w.prototype.write = function (t, e, r) {
          var n = this._writableState,
            i = !1,
            o = !n.objectMode && p(t);
          return (
            o && !f.isBuffer(t) && (t = d(t)),
            "function" === typeof e && ((r = e), (e = null)),
            o ? (e = "buffer") : e || (e = n.defaultEncoding),
            "function" !== typeof r && (r = g),
            n.ended
              ? b(this, r)
              : (o || M(this, n, t, r)) &&
                (n.pendingcb++, (i = x(this, n, o, t, e, r))),
            i
          );
        }),
        (w.prototype.cork = function () {
          var t = this._writableState;
          t.corked++;
        }),
        (w.prototype.uncork = function () {
          var t = this._writableState;
          t.corked &&
            (t.corked--,
            t.writing ||
              t.corked ||
              t.finished ||
              t.bufferProcessing ||
              !t.bufferedRequest ||
              R(this, t));
        }),
        (w.prototype.setDefaultEncoding = function (t) {
          if (
            ("string" === typeof t && (t = t.toLowerCase()),
            !(
              [
                "hex",
                "utf8",
                "utf-8",
                "ascii",
                "binary",
                "base64",
                "ucs2",
                "ucs-2",
                "utf16le",
                "utf-16le",
                "raw",
              ].indexOf((t + "").toLowerCase()) > -1
            ))
          )
            throw new TypeError("Unknown encoding: " + t);
          return (this._writableState.defaultEncoding = t), this;
        }),
        Object.defineProperty(w.prototype, "writableHighWaterMark", {
          enumerable: !1,
          get: function () {
            return this._writableState.highWaterMark;
          },
        }),
        (w.prototype._write = function (t, e, r) {
          r(new Error("_write() is not implemented"));
        }),
        (w.prototype._writev = null),
        (w.prototype.end = function (t, e, r) {
          var n = this._writableState;
          "function" === typeof t
            ? ((r = t), (t = null), (e = null))
            : "function" === typeof e && ((r = e), (e = null)),
            null !== t && void 0 !== t && this.write(t, e),
            n.corked && ((n.corked = 1), this.uncork()),
            n.ending || n.finished || P(this, n, r);
        }),
        Object.defineProperty(w.prototype, "destroyed", {
          get: function () {
            return (
              void 0 !== this._writableState && this._writableState.destroyed
            );
          },
          set: function (t) {
            this._writableState && (this._writableState.destroyed = t);
          },
        }),
        (w.prototype.destroy = v.destroy),
        (w.prototype._undestroy = v.undestroy),
        (w.prototype._destroy = function (t, e) {
          this.end(), e(t);
        });
    }.call(this, r("2820"), r("c8ba")));
  },
  "5c6c": function (t, e) {
    t.exports = function (t, e) {
      return {
        enumerable: !(1 & t),
        configurable: !(2 & t),
        writable: !(4 & t),
        value: e,
      };
    };
  },
  "5ee3": function (t, e, r) {
    var n;
    try {
      n = r("6787");
    } catch (u) {
    } finally {
      if ((n || "undefined" === typeof window || (n = window), !n))
        throw new Error("Could not determine global this");
    }
    var i = n.WebSocket || n.MozWebSocket,
      o = r("7b6b");
    function s(t, e) {
      var r;
      return (r = e ? new i(t, e) : new i(t)), r;
    }
    i &&
      ["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function (t) {
        Object.defineProperty(s, t, {
          get: function () {
            return i[t];
          },
        });
      }),
      (t.exports = { w3cwebsocket: i ? s : null, version: o });
  },
  "5f2e": function (t, e, r) {
    "use strict";
    t.exports = {
      ErrorResponse: function (t) {
        var e =
          t && t.error && t.error.message ? t.error.message : JSON.stringify(t);
        return new Error("Returned error: " + e);
      },
      InvalidNumberOfParams: function (t, e, r) {
        return new Error(
          'Invalid number of parameters for "' +
            r +
            '". Got ' +
            t +
            " expected " +
            e +
            "!"
        );
      },
      InvalidConnection: function (t, e) {
        return this.ConnectionError(
          "CONNECTION ERROR: Couldn't connect to node " + t + ".",
          e
        );
      },
      InvalidProvider: function () {
        return new Error("Provider not set or invalid");
      },
      InvalidResponse: function (t) {
        var e =
          t && t.error && t.error.message
            ? t.error.message
            : "Invalid JSON RPC response: " + JSON.stringify(t);
        return new Error(e);
      },
      ConnectionTimeout: function (t) {
        return new Error("CONNECTION TIMEOUT: timeout of " + t + " ms achived");
      },
      ConnectionNotOpenError: function (t) {
        return this.ConnectionError("connection not open on send()", t);
      },
      ConnectionCloseError: function (t) {
        return "object" === typeof t && t.code && t.reason
          ? this.ConnectionError(
              "CONNECTION ERROR: The connection got closed with the close code `" +
                t.code +
                "` and the following reason string `" +
                t.reason +
                "`",
              t
            )
          : new Error("CONNECTION ERROR: The connection closed unexpectedly");
      },
      MaxAttemptsReachedOnReconnectingError: function () {
        return new Error("Maximum number of reconnect attempts reached!");
      },
      PendingRequestsOnReconnectingError: function () {
        return new Error(
          "CONNECTION ERROR: Provider started to reconnect before the response got received!"
        );
      },
      ConnectionError: function (t, e) {
        const r = new Error(t);
        return e && ((r.code = e.code), (r.reason = e.reason)), r;
      },
      RevertInstructionError: function (t, e) {
        var r = new Error(
          "Your request got reverted with the following reason string: " + t
        );
        return (r.reason = t), (r.signature = e), r;
      },
      TransactionRevertInstructionError: function (t, e, r) {
        var n = new Error(
          "Transaction has been reverted by the EVM:\n" +
            JSON.stringify(r, null, 2)
        );
        return (n.reason = t), (n.signature = e), (n.receipt = r), n;
      },
      TransactionError: function (t, e) {
        var r = new Error(t);
        return (r.receipt = e), r;
      },
      NoContractAddressFoundError: function (t) {
        return this.TransactionError(
          "The transaction receipt didn't contain a contract address.",
          t
        );
      },
      ContractCodeNotStoredError: function (t) {
        return this.TransactionError(
          "The contract code couldn't be stored, please check your gas limit.",
          t
        );
      },
      TransactionRevertedWithoutReasonError: function (t) {
        return this.TransactionError(
          "Transaction has been reverted by the EVM:\n" +
            JSON.stringify(t, null, 2),
          t
        );
      },
      TransactionOutOfGasError: function (t) {
        return this.TransactionError(
          "Transaction ran out of gas. Please provide more gas:\n" +
            JSON.stringify(t, null, 2),
          t
        );
      },
    };
  },
  "605d": function (t, e, r) {
    var n = r("c6b6"),
      i = r("da84");
    t.exports = "process" == n(i.process);
  },
  "60da": function (t, e, r) {
    "use strict";
    var n = r("83ab"),
      i = r("d039"),
      o = r("df75"),
      s = r("7418"),
      u = r("d1e7"),
      a = r("7b0b"),
      h = r("44ad"),
      l = Object.assign,
      f = Object.defineProperty;
    t.exports =
      !l ||
      i(function () {
        if (
          n &&
          1 !==
            l(
              { b: 1 },
              l(
                f({}, "a", {
                  enumerable: !0,
                  get: function () {
                    f(this, "b", { value: 3, enumerable: !1 });
                  },
                }),
                { b: 2 }
              )
            ).b
        )
          return !0;
        var t = {},
          e = {},
          r = Symbol(),
          i = "abcdefghijklmnopqrst";
        return (
          (t[r] = 7),
          i.split("").forEach(function (t) {
            e[t] = t;
          }),
          7 != l({}, t)[r] || o(l({}, e)).join("") != i
        );
      })
        ? function (t, e) {
            var r = a(t),
              i = arguments.length,
              l = 1,
              f = s.f,
              c = u.f;
            while (i > l) {
              var d,
                p = h(arguments[l++]),
                m = f ? o(p).concat(f(p)) : o(p),
                v = m.length,
                g = 0;
              while (v > g) (d = m[g++]), (n && !c.call(p, d)) || (r[d] = p[d]);
            }
            return r;
          }
        : l;
  },
  6211: function (t, e, r) {
    (function (t) {
      (function (t, e) {
        "use strict";
        function n(t, e) {
          if (!t) throw new Error(e || "Assertion failed");
        }
        function i(t, e) {
          t.super_ = e;
          var r = function () {};
          (r.prototype = e.prototype),
            (t.prototype = new r()),
            (t.prototype.constructor = t);
        }
        function o(t, e, r) {
          if (o.isBN(t)) return t;
          (this.negative = 0),
            (this.words = null),
            (this.length = 0),
            (this.red = null),
            null !== t &&
              (("le" !== e && "be" !== e) || ((r = e), (e = 10)),
              this._init(t || 0, e || 10, r || "be"));
        }
        var s;
        "object" === typeof t ? (t.exports = o) : (e.BN = o),
          (o.BN = o),
          (o.wordSize = 26);
        try {
          s = r(3).Buffer;
        } catch (A) {}
        function u(t, e, r) {
          for (var n = 0, i = Math.min(t.length, r), o = e; o < i; o++) {
            var s = t.charCodeAt(o) - 48;
            (n <<= 4),
              (n |=
                s >= 49 && s <= 54
                  ? s - 49 + 10
                  : s >= 17 && s <= 22
                  ? s - 17 + 10
                  : 15 & s);
          }
          return n;
        }
        function a(t, e, r, n) {
          for (var i = 0, o = Math.min(t.length, r), s = e; s < o; s++) {
            var u = t.charCodeAt(s) - 48;
            (i *= n), (i += u >= 49 ? u - 49 + 10 : u >= 17 ? u - 17 + 10 : u);
          }
          return i;
        }
        (o.isBN = function (t) {
          return (
            t instanceof o ||
            (null !== t &&
              "object" === typeof t &&
              t.constructor.wordSize === o.wordSize &&
              Array.isArray(t.words))
          );
        }),
          (o.max = function (t, e) {
            return t.cmp(e) > 0 ? t : e;
          }),
          (o.min = function (t, e) {
            return t.cmp(e) < 0 ? t : e;
          }),
          (o.prototype._init = function (t, e, r) {
            if ("number" === typeof t) return this._initNumber(t, e, r);
            if ("object" === typeof t) return this._initArray(t, e, r);
            "hex" === e && (e = 16),
              n(e === (0 | e) && e >= 2 && e <= 36),
              (t = t.toString().replace(/\s+/g, ""));
            var i = 0;
            "-" === t[0] && i++,
              16 === e ? this._parseHex(t, i) : this._parseBase(t, e, i),
              "-" === t[0] && (this.negative = 1),
              this.strip(),
              "le" === r && this._initArray(this.toArray(), e, r);
          }),
          (o.prototype._initNumber = function (t, e, r) {
            t < 0 && ((this.negative = 1), (t = -t)),
              t < 67108864
                ? ((this.words = [67108863 & t]), (this.length = 1))
                : t < 4503599627370496
                ? ((this.words = [67108863 & t, (t / 67108864) & 67108863]),
                  (this.length = 2))
                : (n(t < 9007199254740992),
                  (this.words = [67108863 & t, (t / 67108864) & 67108863, 1]),
                  (this.length = 3)),
              "le" === r && this._initArray(this.toArray(), e, r);
          }),
          (o.prototype._initArray = function (t, e, r) {
            if ((n("number" === typeof t.length), t.length <= 0))
              return (this.words = [0]), (this.length = 1), this;
            (this.length = Math.ceil(t.length / 3)),
              (this.words = new Array(this.length));
            for (var i = 0; i < this.length; i++) this.words[i] = 0;
            var o,
              s,
              u = 0;
            if ("be" === r)
              for (i = t.length - 1, o = 0; i >= 0; i -= 3)
                (s = t[i] | (t[i - 1] << 8) | (t[i - 2] << 16)),
                  (this.words[o] |= (s << u) & 67108863),
                  (this.words[o + 1] = (s >>> (26 - u)) & 67108863),
                  (u += 24),
                  u >= 26 && ((u -= 26), o++);
            else if ("le" === r)
              for (i = 0, o = 0; i < t.length; i += 3)
                (s = t[i] | (t[i + 1] << 8) | (t[i + 2] << 16)),
                  (this.words[o] |= (s << u) & 67108863),
                  (this.words[o + 1] = (s >>> (26 - u)) & 67108863),
                  (u += 24),
                  u >= 26 && ((u -= 26), o++);
            return this.strip();
          }),
          (o.prototype._parseHex = function (t, e) {
            (this.length = Math.ceil((t.length - e) / 6)),
              (this.words = new Array(this.length));
            for (var r = 0; r < this.length; r++) this.words[r] = 0;
            var n,
              i,
              o = 0;
            for (r = t.length - 6, n = 0; r >= e; r -= 6)
              (i = u(t, r, r + 6)),
                (this.words[n] |= (i << o) & 67108863),
                (this.words[n + 1] |= (i >>> (26 - o)) & 4194303),
                (o += 24),
                o >= 26 && ((o -= 26), n++);
            r + 6 !== e &&
              ((i = u(t, e, r + 6)),
              (this.words[n] |= (i << o) & 67108863),
              (this.words[n + 1] |= (i >>> (26 - o)) & 4194303)),
              this.strip();
          }),
          (o.prototype._parseBase = function (t, e, r) {
            (this.words = [0]), (this.length = 1);
            for (var n = 0, i = 1; i <= 67108863; i *= e) n++;
            n--, (i = (i / e) | 0);
            for (
              var o = t.length - r,
                s = o % n,
                u = Math.min(o, o - s) + r,
                h = 0,
                l = r;
              l < u;
              l += n
            )
              (h = a(t, l, l + n, e)),
                this.imuln(i),
                this.words[0] + h < 67108864
                  ? (this.words[0] += h)
                  : this._iaddn(h);
            if (0 !== s) {
              var f = 1;
              for (h = a(t, l, t.length, e), l = 0; l < s; l++) f *= e;
              this.imuln(f),
                this.words[0] + h < 67108864
                  ? (this.words[0] += h)
                  : this._iaddn(h);
            }
          }),
          (o.prototype.copy = function (t) {
            t.words = new Array(this.length);
            for (var e = 0; e < this.length; e++) t.words[e] = this.words[e];
            (t.length = this.length),
              (t.negative = this.negative),
              (t.red = this.red);
          }),
          (o.prototype.clone = function () {
            var t = new o(null);
            return this.copy(t), t;
          }),
          (o.prototype._expand = function (t) {
            while (this.length < t) this.words[this.length++] = 0;
            return this;
          }),
          (o.prototype.strip = function () {
            while (this.length > 1 && 0 === this.words[this.length - 1])
              this.length--;
            return this._normSign();
          }),
          (o.prototype._normSign = function () {
            return (
              1 === this.length && 0 === this.words[0] && (this.negative = 0),
              this
            );
          }),
          (o.prototype.inspect = function () {
            return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
          });
        var h = [
            "",
            "0",
            "00",
            "000",
            "0000",
            "00000",
            "000000",
            "0000000",
            "00000000",
            "000000000",
            "0000000000",
            "00000000000",
            "000000000000",
            "0000000000000",
            "00000000000000",
            "000000000000000",
            "0000000000000000",
            "00000000000000000",
            "000000000000000000",
            "0000000000000000000",
            "00000000000000000000",
            "000000000000000000000",
            "0000000000000000000000",
            "00000000000000000000000",
            "000000000000000000000000",
            "0000000000000000000000000",
          ],
          l = [
            0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          ],
          f = [
            0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607,
            16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536,
            11390625, 16777216, 24137569, 34012224, 47045881, 64e6, 4084101,
            5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368,
            20511149, 243e5, 28629151, 33554432, 39135393, 45435424, 52521875,
            60466176,
          ];
        function c(t) {
          for (var e = new Array(t.bitLength()), r = 0; r < e.length; r++) {
            var n = (r / 26) | 0,
              i = r % 26;
            e[r] = (t.words[n] & (1 << i)) >>> i;
          }
          return e;
        }
        function d(t, e, r) {
          r.negative = e.negative ^ t.negative;
          var n = (t.length + e.length) | 0;
          (r.length = n), (n = (n - 1) | 0);
          var i = 0 | t.words[0],
            o = 0 | e.words[0],
            s = i * o,
            u = 67108863 & s,
            a = (s / 67108864) | 0;
          r.words[0] = u;
          for (var h = 1; h < n; h++) {
            for (
              var l = a >>> 26,
                f = 67108863 & a,
                c = Math.min(h, e.length - 1),
                d = Math.max(0, h - t.length + 1);
              d <= c;
              d++
            ) {
              var p = (h - d) | 0;
              (i = 0 | t.words[p]),
                (o = 0 | e.words[d]),
                (s = i * o + f),
                (l += (s / 67108864) | 0),
                (f = 67108863 & s);
            }
            (r.words[h] = 0 | f), (a = 0 | l);
          }
          return 0 !== a ? (r.words[h] = 0 | a) : r.length--, r.strip();
        }
        (o.prototype.toString = function (t, e) {
          var r;
          if (((t = t || 10), (e = 0 | e || 1), 16 === t || "hex" === t)) {
            r = "";
            for (var i = 0, o = 0, s = 0; s < this.length; s++) {
              var u = this.words[s],
                a = (16777215 & ((u << i) | o)).toString(16);
              (o = (u >>> (24 - i)) & 16777215),
                (r =
                  0 !== o || s !== this.length - 1
                    ? h[6 - a.length] + a + r
                    : a + r),
                (i += 2),
                i >= 26 && ((i -= 26), s--);
            }
            0 !== o && (r = o.toString(16) + r);
            while (r.length % e !== 0) r = "0" + r;
            return 0 !== this.negative && (r = "-" + r), r;
          }
          if (t === (0 | t) && t >= 2 && t <= 36) {
            var c = l[t],
              d = f[t];
            r = "";
            var p = this.clone();
            p.negative = 0;
            while (!p.isZero()) {
              var m = p.modn(d).toString(t);
              (p = p.idivn(d)),
                (r = p.isZero() ? m + r : h[c - m.length] + m + r);
            }
            this.isZero() && (r = "0" + r);
            while (r.length % e !== 0) r = "0" + r;
            return 0 !== this.negative && (r = "-" + r), r;
          }
          n(!1, "Base should be between 2 and 36");
        }),
          (o.prototype.toNumber = function () {
            var t = this.words[0];
            return (
              2 === this.length
                ? (t += 67108864 * this.words[1])
                : 3 === this.length && 1 === this.words[2]
                ? (t += 4503599627370496 + 67108864 * this.words[1])
                : this.length > 2 &&
                  n(!1, "Number can only safely store up to 53 bits"),
              0 !== this.negative ? -t : t
            );
          }),
          (o.prototype.toJSON = function () {
            return this.toString(16);
          }),
          (o.prototype.toBuffer = function (t, e) {
            return n("undefined" !== typeof s), this.toArrayLike(s, t, e);
          }),
          (o.prototype.toArray = function (t, e) {
            return this.toArrayLike(Array, t, e);
          }),
          (o.prototype.toArrayLike = function (t, e, r) {
            var i = this.byteLength(),
              o = r || Math.max(1, i);
            n(i <= o, "byte array longer than desired length"),
              n(o > 0, "Requested array length <= 0"),
              this.strip();
            var s,
              u,
              a = "le" === e,
              h = new t(o),
              l = this.clone();
            if (a) {
              for (u = 0; !l.isZero(); u++)
                (s = l.andln(255)), l.iushrn(8), (h[u] = s);
              for (; u < o; u++) h[u] = 0;
            } else {
              for (u = 0; u < o - i; u++) h[u] = 0;
              for (u = 0; !l.isZero(); u++)
                (s = l.andln(255)), l.iushrn(8), (h[o - u - 1] = s);
            }
            return h;
          }),
          Math.clz32
            ? (o.prototype._countBits = function (t) {
                return 32 - Math.clz32(t);
              })
            : (o.prototype._countBits = function (t) {
                var e = t,
                  r = 0;
                return (
                  e >= 4096 && ((r += 13), (e >>>= 13)),
                  e >= 64 && ((r += 7), (e >>>= 7)),
                  e >= 8 && ((r += 4), (e >>>= 4)),
                  e >= 2 && ((r += 2), (e >>>= 2)),
                  r + e
                );
              }),
          (o.prototype._zeroBits = function (t) {
            if (0 === t) return 26;
            var e = t,
              r = 0;
            return (
              0 === (8191 & e) && ((r += 13), (e >>>= 13)),
              0 === (127 & e) && ((r += 7), (e >>>= 7)),
              0 === (15 & e) && ((r += 4), (e >>>= 4)),
              0 === (3 & e) && ((r += 2), (e >>>= 2)),
              0 === (1 & e) && r++,
              r
            );
          }),
          (o.prototype.bitLength = function () {
            var t = this.words[this.length - 1],
              e = this._countBits(t);
            return 26 * (this.length - 1) + e;
          }),
          (o.prototype.zeroBits = function () {
            if (this.isZero()) return 0;
            for (var t = 0, e = 0; e < this.length; e++) {
              var r = this._zeroBits(this.words[e]);
              if (((t += r), 26 !== r)) break;
            }
            return t;
          }),
          (o.prototype.byteLength = function () {
            return Math.ceil(this.bitLength() / 8);
          }),
          (o.prototype.toTwos = function (t) {
            return 0 !== this.negative
              ? this.abs().inotn(t).iaddn(1)
              : this.clone();
          }),
          (o.prototype.fromTwos = function (t) {
            return this.testn(t - 1)
              ? this.notn(t).iaddn(1).ineg()
              : this.clone();
          }),
          (o.prototype.isNeg = function () {
            return 0 !== this.negative;
          }),
          (o.prototype.neg = function () {
            return this.clone().ineg();
          }),
          (o.prototype.ineg = function () {
            return this.isZero() || (this.negative ^= 1), this;
          }),
          (o.prototype.iuor = function (t) {
            while (this.length < t.length) this.words[this.length++] = 0;
            for (var e = 0; e < t.length; e++)
              this.words[e] = this.words[e] | t.words[e];
            return this.strip();
          }),
          (o.prototype.ior = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuor(t);
          }),
          (o.prototype.or = function (t) {
            return this.length > t.length
              ? this.clone().ior(t)
              : t.clone().ior(this);
          }),
          (o.prototype.uor = function (t) {
            return this.length > t.length
              ? this.clone().iuor(t)
              : t.clone().iuor(this);
          }),
          (o.prototype.iuand = function (t) {
            var e;
            e = this.length > t.length ? t : this;
            for (var r = 0; r < e.length; r++)
              this.words[r] = this.words[r] & t.words[r];
            return (this.length = e.length), this.strip();
          }),
          (o.prototype.iand = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuand(t);
          }),
          (o.prototype.and = function (t) {
            return this.length > t.length
              ? this.clone().iand(t)
              : t.clone().iand(this);
          }),
          (o.prototype.uand = function (t) {
            return this.length > t.length
              ? this.clone().iuand(t)
              : t.clone().iuand(this);
          }),
          (o.prototype.iuxor = function (t) {
            var e, r;
            this.length > t.length
              ? ((e = this), (r = t))
              : ((e = t), (r = this));
            for (var n = 0; n < r.length; n++)
              this.words[n] = e.words[n] ^ r.words[n];
            if (this !== e)
              for (; n < e.length; n++) this.words[n] = e.words[n];
            return (this.length = e.length), this.strip();
          }),
          (o.prototype.ixor = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuxor(t);
          }),
          (o.prototype.xor = function (t) {
            return this.length > t.length
              ? this.clone().ixor(t)
              : t.clone().ixor(this);
          }),
          (o.prototype.uxor = function (t) {
            return this.length > t.length
              ? this.clone().iuxor(t)
              : t.clone().iuxor(this);
          }),
          (o.prototype.inotn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = 0 | Math.ceil(t / 26),
              r = t % 26;
            this._expand(e), r > 0 && e--;
            for (var i = 0; i < e; i++)
              this.words[i] = 67108863 & ~this.words[i];
            return (
              r > 0 &&
                (this.words[i] = ~this.words[i] & (67108863 >> (26 - r))),
              this.strip()
            );
          }),
          (o.prototype.notn = function (t) {
            return this.clone().inotn(t);
          }),
          (o.prototype.setn = function (t, e) {
            n("number" === typeof t && t >= 0);
            var r = (t / 26) | 0,
              i = t % 26;
            return (
              this._expand(r + 1),
              (this.words[r] = e
                ? this.words[r] | (1 << i)
                : this.words[r] & ~(1 << i)),
              this.strip()
            );
          }),
          (o.prototype.iadd = function (t) {
            var e, r, n;
            if (0 !== this.negative && 0 === t.negative)
              return (
                (this.negative = 0),
                (e = this.isub(t)),
                (this.negative ^= 1),
                this._normSign()
              );
            if (0 === this.negative && 0 !== t.negative)
              return (
                (t.negative = 0),
                (e = this.isub(t)),
                (t.negative = 1),
                e._normSign()
              );
            this.length > t.length
              ? ((r = this), (n = t))
              : ((r = t), (n = this));
            for (var i = 0, o = 0; o < n.length; o++)
              (e = (0 | r.words[o]) + (0 | n.words[o]) + i),
                (this.words[o] = 67108863 & e),
                (i = e >>> 26);
            for (; 0 !== i && o < r.length; o++)
              (e = (0 | r.words[o]) + i),
                (this.words[o] = 67108863 & e),
                (i = e >>> 26);
            if (((this.length = r.length), 0 !== i))
              (this.words[this.length] = i), this.length++;
            else if (r !== this)
              for (; o < r.length; o++) this.words[o] = r.words[o];
            return this;
          }),
          (o.prototype.add = function (t) {
            var e;
            return 0 !== t.negative && 0 === this.negative
              ? ((t.negative = 0), (e = this.sub(t)), (t.negative ^= 1), e)
              : 0 === t.negative && 0 !== this.negative
              ? ((this.negative = 0), (e = t.sub(this)), (this.negative = 1), e)
              : this.length > t.length
              ? this.clone().iadd(t)
              : t.clone().iadd(this);
          }),
          (o.prototype.isub = function (t) {
            if (0 !== t.negative) {
              t.negative = 0;
              var e = this.iadd(t);
              return (t.negative = 1), e._normSign();
            }
            if (0 !== this.negative)
              return (
                (this.negative = 0),
                this.iadd(t),
                (this.negative = 1),
                this._normSign()
              );
            var r,
              n,
              i = this.cmp(t);
            if (0 === i)
              return (
                (this.negative = 0),
                (this.length = 1),
                (this.words[0] = 0),
                this
              );
            i > 0 ? ((r = this), (n = t)) : ((r = t), (n = this));
            for (var o = 0, s = 0; s < n.length; s++)
              (e = (0 | r.words[s]) - (0 | n.words[s]) + o),
                (o = e >> 26),
                (this.words[s] = 67108863 & e);
            for (; 0 !== o && s < r.length; s++)
              (e = (0 | r.words[s]) + o),
                (o = e >> 26),
                (this.words[s] = 67108863 & e);
            if (0 === o && s < r.length && r !== this)
              for (; s < r.length; s++) this.words[s] = r.words[s];
            return (
              (this.length = Math.max(this.length, s)),
              r !== this && (this.negative = 1),
              this.strip()
            );
          }),
          (o.prototype.sub = function (t) {
            return this.clone().isub(t);
          });
        var p = function (t, e, r) {
          var n,
            i,
            o,
            s = t.words,
            u = e.words,
            a = r.words,
            h = 0,
            l = 0 | s[0],
            f = 8191 & l,
            c = l >>> 13,
            d = 0 | s[1],
            p = 8191 & d,
            m = d >>> 13,
            v = 0 | s[2],
            g = 8191 & v,
            y = v >>> 13,
            w = 0 | s[3],
            b = 8191 & w,
            M = w >>> 13,
            _ = 0 | s[4],
            x = 8191 & _,
            S = _ >>> 13,
            E = 0 | s[5],
            A = 8191 & E,
            k = E >>> 13,
            O = 0 | s[6],
            T = 8191 & O,
            R = O >>> 13,
            C = 0 | s[7],
            j = 8191 & C,
            N = C >>> 13,
            L = 0 | s[8],
            P = 8191 & L,
            I = L >>> 13,
            B = 0 | s[9],
            q = 8191 & B,
            U = B >>> 13,
            H = 0 | u[0],
            D = 8191 & H,
            F = H >>> 13,
            z = 0 | u[1],
            Z = 8191 & z,
            W = z >>> 13,
            G = 0 | u[2],
            Y = 8191 & G,
            $ = G >>> 13,
            X = 0 | u[3],
            V = 8191 & X,
            J = X >>> 13,
            K = 0 | u[4],
            Q = 8191 & K,
            tt = K >>> 13,
            et = 0 | u[5],
            rt = 8191 & et,
            nt = et >>> 13,
            it = 0 | u[6],
            ot = 8191 & it,
            st = it >>> 13,
            ut = 0 | u[7],
            at = 8191 & ut,
            ht = ut >>> 13,
            lt = 0 | u[8],
            ft = 8191 & lt,
            ct = lt >>> 13,
            dt = 0 | u[9],
            pt = 8191 & dt,
            mt = dt >>> 13;
          (r.negative = t.negative ^ e.negative),
            (r.length = 19),
            (n = Math.imul(f, D)),
            (i = Math.imul(f, F)),
            (i = (i + Math.imul(c, D)) | 0),
            (o = Math.imul(c, F));
          var vt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (vt >>> 26)) | 0),
            (vt &= 67108863),
            (n = Math.imul(p, D)),
            (i = Math.imul(p, F)),
            (i = (i + Math.imul(m, D)) | 0),
            (o = Math.imul(m, F)),
            (n = (n + Math.imul(f, Z)) | 0),
            (i = (i + Math.imul(f, W)) | 0),
            (i = (i + Math.imul(c, Z)) | 0),
            (o = (o + Math.imul(c, W)) | 0);
          var gt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (gt >>> 26)) | 0),
            (gt &= 67108863),
            (n = Math.imul(g, D)),
            (i = Math.imul(g, F)),
            (i = (i + Math.imul(y, D)) | 0),
            (o = Math.imul(y, F)),
            (n = (n + Math.imul(p, Z)) | 0),
            (i = (i + Math.imul(p, W)) | 0),
            (i = (i + Math.imul(m, Z)) | 0),
            (o = (o + Math.imul(m, W)) | 0),
            (n = (n + Math.imul(f, Y)) | 0),
            (i = (i + Math.imul(f, $)) | 0),
            (i = (i + Math.imul(c, Y)) | 0),
            (o = (o + Math.imul(c, $)) | 0);
          var yt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (yt >>> 26)) | 0),
            (yt &= 67108863),
            (n = Math.imul(b, D)),
            (i = Math.imul(b, F)),
            (i = (i + Math.imul(M, D)) | 0),
            (o = Math.imul(M, F)),
            (n = (n + Math.imul(g, Z)) | 0),
            (i = (i + Math.imul(g, W)) | 0),
            (i = (i + Math.imul(y, Z)) | 0),
            (o = (o + Math.imul(y, W)) | 0),
            (n = (n + Math.imul(p, Y)) | 0),
            (i = (i + Math.imul(p, $)) | 0),
            (i = (i + Math.imul(m, Y)) | 0),
            (o = (o + Math.imul(m, $)) | 0),
            (n = (n + Math.imul(f, V)) | 0),
            (i = (i + Math.imul(f, J)) | 0),
            (i = (i + Math.imul(c, V)) | 0),
            (o = (o + Math.imul(c, J)) | 0);
          var wt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (wt >>> 26)) | 0),
            (wt &= 67108863),
            (n = Math.imul(x, D)),
            (i = Math.imul(x, F)),
            (i = (i + Math.imul(S, D)) | 0),
            (o = Math.imul(S, F)),
            (n = (n + Math.imul(b, Z)) | 0),
            (i = (i + Math.imul(b, W)) | 0),
            (i = (i + Math.imul(M, Z)) | 0),
            (o = (o + Math.imul(M, W)) | 0),
            (n = (n + Math.imul(g, Y)) | 0),
            (i = (i + Math.imul(g, $)) | 0),
            (i = (i + Math.imul(y, Y)) | 0),
            (o = (o + Math.imul(y, $)) | 0),
            (n = (n + Math.imul(p, V)) | 0),
            (i = (i + Math.imul(p, J)) | 0),
            (i = (i + Math.imul(m, V)) | 0),
            (o = (o + Math.imul(m, J)) | 0),
            (n = (n + Math.imul(f, Q)) | 0),
            (i = (i + Math.imul(f, tt)) | 0),
            (i = (i + Math.imul(c, Q)) | 0),
            (o = (o + Math.imul(c, tt)) | 0);
          var bt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (bt >>> 26)) | 0),
            (bt &= 67108863),
            (n = Math.imul(A, D)),
            (i = Math.imul(A, F)),
            (i = (i + Math.imul(k, D)) | 0),
            (o = Math.imul(k, F)),
            (n = (n + Math.imul(x, Z)) | 0),
            (i = (i + Math.imul(x, W)) | 0),
            (i = (i + Math.imul(S, Z)) | 0),
            (o = (o + Math.imul(S, W)) | 0),
            (n = (n + Math.imul(b, Y)) | 0),
            (i = (i + Math.imul(b, $)) | 0),
            (i = (i + Math.imul(M, Y)) | 0),
            (o = (o + Math.imul(M, $)) | 0),
            (n = (n + Math.imul(g, V)) | 0),
            (i = (i + Math.imul(g, J)) | 0),
            (i = (i + Math.imul(y, V)) | 0),
            (o = (o + Math.imul(y, J)) | 0),
            (n = (n + Math.imul(p, Q)) | 0),
            (i = (i + Math.imul(p, tt)) | 0),
            (i = (i + Math.imul(m, Q)) | 0),
            (o = (o + Math.imul(m, tt)) | 0),
            (n = (n + Math.imul(f, rt)) | 0),
            (i = (i + Math.imul(f, nt)) | 0),
            (i = (i + Math.imul(c, rt)) | 0),
            (o = (o + Math.imul(c, nt)) | 0);
          var Mt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Mt >>> 26)) | 0),
            (Mt &= 67108863),
            (n = Math.imul(T, D)),
            (i = Math.imul(T, F)),
            (i = (i + Math.imul(R, D)) | 0),
            (o = Math.imul(R, F)),
            (n = (n + Math.imul(A, Z)) | 0),
            (i = (i + Math.imul(A, W)) | 0),
            (i = (i + Math.imul(k, Z)) | 0),
            (o = (o + Math.imul(k, W)) | 0),
            (n = (n + Math.imul(x, Y)) | 0),
            (i = (i + Math.imul(x, $)) | 0),
            (i = (i + Math.imul(S, Y)) | 0),
            (o = (o + Math.imul(S, $)) | 0),
            (n = (n + Math.imul(b, V)) | 0),
            (i = (i + Math.imul(b, J)) | 0),
            (i = (i + Math.imul(M, V)) | 0),
            (o = (o + Math.imul(M, J)) | 0),
            (n = (n + Math.imul(g, Q)) | 0),
            (i = (i + Math.imul(g, tt)) | 0),
            (i = (i + Math.imul(y, Q)) | 0),
            (o = (o + Math.imul(y, tt)) | 0),
            (n = (n + Math.imul(p, rt)) | 0),
            (i = (i + Math.imul(p, nt)) | 0),
            (i = (i + Math.imul(m, rt)) | 0),
            (o = (o + Math.imul(m, nt)) | 0),
            (n = (n + Math.imul(f, ot)) | 0),
            (i = (i + Math.imul(f, st)) | 0),
            (i = (i + Math.imul(c, ot)) | 0),
            (o = (o + Math.imul(c, st)) | 0);
          var _t = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (_t >>> 26)) | 0),
            (_t &= 67108863),
            (n = Math.imul(j, D)),
            (i = Math.imul(j, F)),
            (i = (i + Math.imul(N, D)) | 0),
            (o = Math.imul(N, F)),
            (n = (n + Math.imul(T, Z)) | 0),
            (i = (i + Math.imul(T, W)) | 0),
            (i = (i + Math.imul(R, Z)) | 0),
            (o = (o + Math.imul(R, W)) | 0),
            (n = (n + Math.imul(A, Y)) | 0),
            (i = (i + Math.imul(A, $)) | 0),
            (i = (i + Math.imul(k, Y)) | 0),
            (o = (o + Math.imul(k, $)) | 0),
            (n = (n + Math.imul(x, V)) | 0),
            (i = (i + Math.imul(x, J)) | 0),
            (i = (i + Math.imul(S, V)) | 0),
            (o = (o + Math.imul(S, J)) | 0),
            (n = (n + Math.imul(b, Q)) | 0),
            (i = (i + Math.imul(b, tt)) | 0),
            (i = (i + Math.imul(M, Q)) | 0),
            (o = (o + Math.imul(M, tt)) | 0),
            (n = (n + Math.imul(g, rt)) | 0),
            (i = (i + Math.imul(g, nt)) | 0),
            (i = (i + Math.imul(y, rt)) | 0),
            (o = (o + Math.imul(y, nt)) | 0),
            (n = (n + Math.imul(p, ot)) | 0),
            (i = (i + Math.imul(p, st)) | 0),
            (i = (i + Math.imul(m, ot)) | 0),
            (o = (o + Math.imul(m, st)) | 0),
            (n = (n + Math.imul(f, at)) | 0),
            (i = (i + Math.imul(f, ht)) | 0),
            (i = (i + Math.imul(c, at)) | 0),
            (o = (o + Math.imul(c, ht)) | 0);
          var xt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (xt >>> 26)) | 0),
            (xt &= 67108863),
            (n = Math.imul(P, D)),
            (i = Math.imul(P, F)),
            (i = (i + Math.imul(I, D)) | 0),
            (o = Math.imul(I, F)),
            (n = (n + Math.imul(j, Z)) | 0),
            (i = (i + Math.imul(j, W)) | 0),
            (i = (i + Math.imul(N, Z)) | 0),
            (o = (o + Math.imul(N, W)) | 0),
            (n = (n + Math.imul(T, Y)) | 0),
            (i = (i + Math.imul(T, $)) | 0),
            (i = (i + Math.imul(R, Y)) | 0),
            (o = (o + Math.imul(R, $)) | 0),
            (n = (n + Math.imul(A, V)) | 0),
            (i = (i + Math.imul(A, J)) | 0),
            (i = (i + Math.imul(k, V)) | 0),
            (o = (o + Math.imul(k, J)) | 0),
            (n = (n + Math.imul(x, Q)) | 0),
            (i = (i + Math.imul(x, tt)) | 0),
            (i = (i + Math.imul(S, Q)) | 0),
            (o = (o + Math.imul(S, tt)) | 0),
            (n = (n + Math.imul(b, rt)) | 0),
            (i = (i + Math.imul(b, nt)) | 0),
            (i = (i + Math.imul(M, rt)) | 0),
            (o = (o + Math.imul(M, nt)) | 0),
            (n = (n + Math.imul(g, ot)) | 0),
            (i = (i + Math.imul(g, st)) | 0),
            (i = (i + Math.imul(y, ot)) | 0),
            (o = (o + Math.imul(y, st)) | 0),
            (n = (n + Math.imul(p, at)) | 0),
            (i = (i + Math.imul(p, ht)) | 0),
            (i = (i + Math.imul(m, at)) | 0),
            (o = (o + Math.imul(m, ht)) | 0),
            (n = (n + Math.imul(f, ft)) | 0),
            (i = (i + Math.imul(f, ct)) | 0),
            (i = (i + Math.imul(c, ft)) | 0),
            (o = (o + Math.imul(c, ct)) | 0);
          var St = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (St >>> 26)) | 0),
            (St &= 67108863),
            (n = Math.imul(q, D)),
            (i = Math.imul(q, F)),
            (i = (i + Math.imul(U, D)) | 0),
            (o = Math.imul(U, F)),
            (n = (n + Math.imul(P, Z)) | 0),
            (i = (i + Math.imul(P, W)) | 0),
            (i = (i + Math.imul(I, Z)) | 0),
            (o = (o + Math.imul(I, W)) | 0),
            (n = (n + Math.imul(j, Y)) | 0),
            (i = (i + Math.imul(j, $)) | 0),
            (i = (i + Math.imul(N, Y)) | 0),
            (o = (o + Math.imul(N, $)) | 0),
            (n = (n + Math.imul(T, V)) | 0),
            (i = (i + Math.imul(T, J)) | 0),
            (i = (i + Math.imul(R, V)) | 0),
            (o = (o + Math.imul(R, J)) | 0),
            (n = (n + Math.imul(A, Q)) | 0),
            (i = (i + Math.imul(A, tt)) | 0),
            (i = (i + Math.imul(k, Q)) | 0),
            (o = (o + Math.imul(k, tt)) | 0),
            (n = (n + Math.imul(x, rt)) | 0),
            (i = (i + Math.imul(x, nt)) | 0),
            (i = (i + Math.imul(S, rt)) | 0),
            (o = (o + Math.imul(S, nt)) | 0),
            (n = (n + Math.imul(b, ot)) | 0),
            (i = (i + Math.imul(b, st)) | 0),
            (i = (i + Math.imul(M, ot)) | 0),
            (o = (o + Math.imul(M, st)) | 0),
            (n = (n + Math.imul(g, at)) | 0),
            (i = (i + Math.imul(g, ht)) | 0),
            (i = (i + Math.imul(y, at)) | 0),
            (o = (o + Math.imul(y, ht)) | 0),
            (n = (n + Math.imul(p, ft)) | 0),
            (i = (i + Math.imul(p, ct)) | 0),
            (i = (i + Math.imul(m, ft)) | 0),
            (o = (o + Math.imul(m, ct)) | 0),
            (n = (n + Math.imul(f, pt)) | 0),
            (i = (i + Math.imul(f, mt)) | 0),
            (i = (i + Math.imul(c, pt)) | 0),
            (o = (o + Math.imul(c, mt)) | 0);
          var Et = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Et >>> 26)) | 0),
            (Et &= 67108863),
            (n = Math.imul(q, Z)),
            (i = Math.imul(q, W)),
            (i = (i + Math.imul(U, Z)) | 0),
            (o = Math.imul(U, W)),
            (n = (n + Math.imul(P, Y)) | 0),
            (i = (i + Math.imul(P, $)) | 0),
            (i = (i + Math.imul(I, Y)) | 0),
            (o = (o + Math.imul(I, $)) | 0),
            (n = (n + Math.imul(j, V)) | 0),
            (i = (i + Math.imul(j, J)) | 0),
            (i = (i + Math.imul(N, V)) | 0),
            (o = (o + Math.imul(N, J)) | 0),
            (n = (n + Math.imul(T, Q)) | 0),
            (i = (i + Math.imul(T, tt)) | 0),
            (i = (i + Math.imul(R, Q)) | 0),
            (o = (o + Math.imul(R, tt)) | 0),
            (n = (n + Math.imul(A, rt)) | 0),
            (i = (i + Math.imul(A, nt)) | 0),
            (i = (i + Math.imul(k, rt)) | 0),
            (o = (o + Math.imul(k, nt)) | 0),
            (n = (n + Math.imul(x, ot)) | 0),
            (i = (i + Math.imul(x, st)) | 0),
            (i = (i + Math.imul(S, ot)) | 0),
            (o = (o + Math.imul(S, st)) | 0),
            (n = (n + Math.imul(b, at)) | 0),
            (i = (i + Math.imul(b, ht)) | 0),
            (i = (i + Math.imul(M, at)) | 0),
            (o = (o + Math.imul(M, ht)) | 0),
            (n = (n + Math.imul(g, ft)) | 0),
            (i = (i + Math.imul(g, ct)) | 0),
            (i = (i + Math.imul(y, ft)) | 0),
            (o = (o + Math.imul(y, ct)) | 0),
            (n = (n + Math.imul(p, pt)) | 0),
            (i = (i + Math.imul(p, mt)) | 0),
            (i = (i + Math.imul(m, pt)) | 0),
            (o = (o + Math.imul(m, mt)) | 0);
          var At = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (At >>> 26)) | 0),
            (At &= 67108863),
            (n = Math.imul(q, Y)),
            (i = Math.imul(q, $)),
            (i = (i + Math.imul(U, Y)) | 0),
            (o = Math.imul(U, $)),
            (n = (n + Math.imul(P, V)) | 0),
            (i = (i + Math.imul(P, J)) | 0),
            (i = (i + Math.imul(I, V)) | 0),
            (o = (o + Math.imul(I, J)) | 0),
            (n = (n + Math.imul(j, Q)) | 0),
            (i = (i + Math.imul(j, tt)) | 0),
            (i = (i + Math.imul(N, Q)) | 0),
            (o = (o + Math.imul(N, tt)) | 0),
            (n = (n + Math.imul(T, rt)) | 0),
            (i = (i + Math.imul(T, nt)) | 0),
            (i = (i + Math.imul(R, rt)) | 0),
            (o = (o + Math.imul(R, nt)) | 0),
            (n = (n + Math.imul(A, ot)) | 0),
            (i = (i + Math.imul(A, st)) | 0),
            (i = (i + Math.imul(k, ot)) | 0),
            (o = (o + Math.imul(k, st)) | 0),
            (n = (n + Math.imul(x, at)) | 0),
            (i = (i + Math.imul(x, ht)) | 0),
            (i = (i + Math.imul(S, at)) | 0),
            (o = (o + Math.imul(S, ht)) | 0),
            (n = (n + Math.imul(b, ft)) | 0),
            (i = (i + Math.imul(b, ct)) | 0),
            (i = (i + Math.imul(M, ft)) | 0),
            (o = (o + Math.imul(M, ct)) | 0),
            (n = (n + Math.imul(g, pt)) | 0),
            (i = (i + Math.imul(g, mt)) | 0),
            (i = (i + Math.imul(y, pt)) | 0),
            (o = (o + Math.imul(y, mt)) | 0);
          var kt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (kt >>> 26)) | 0),
            (kt &= 67108863),
            (n = Math.imul(q, V)),
            (i = Math.imul(q, J)),
            (i = (i + Math.imul(U, V)) | 0),
            (o = Math.imul(U, J)),
            (n = (n + Math.imul(P, Q)) | 0),
            (i = (i + Math.imul(P, tt)) | 0),
            (i = (i + Math.imul(I, Q)) | 0),
            (o = (o + Math.imul(I, tt)) | 0),
            (n = (n + Math.imul(j, rt)) | 0),
            (i = (i + Math.imul(j, nt)) | 0),
            (i = (i + Math.imul(N, rt)) | 0),
            (o = (o + Math.imul(N, nt)) | 0),
            (n = (n + Math.imul(T, ot)) | 0),
            (i = (i + Math.imul(T, st)) | 0),
            (i = (i + Math.imul(R, ot)) | 0),
            (o = (o + Math.imul(R, st)) | 0),
            (n = (n + Math.imul(A, at)) | 0),
            (i = (i + Math.imul(A, ht)) | 0),
            (i = (i + Math.imul(k, at)) | 0),
            (o = (o + Math.imul(k, ht)) | 0),
            (n = (n + Math.imul(x, ft)) | 0),
            (i = (i + Math.imul(x, ct)) | 0),
            (i = (i + Math.imul(S, ft)) | 0),
            (o = (o + Math.imul(S, ct)) | 0),
            (n = (n + Math.imul(b, pt)) | 0),
            (i = (i + Math.imul(b, mt)) | 0),
            (i = (i + Math.imul(M, pt)) | 0),
            (o = (o + Math.imul(M, mt)) | 0);
          var Ot = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Ot >>> 26)) | 0),
            (Ot &= 67108863),
            (n = Math.imul(q, Q)),
            (i = Math.imul(q, tt)),
            (i = (i + Math.imul(U, Q)) | 0),
            (o = Math.imul(U, tt)),
            (n = (n + Math.imul(P, rt)) | 0),
            (i = (i + Math.imul(P, nt)) | 0),
            (i = (i + Math.imul(I, rt)) | 0),
            (o = (o + Math.imul(I, nt)) | 0),
            (n = (n + Math.imul(j, ot)) | 0),
            (i = (i + Math.imul(j, st)) | 0),
            (i = (i + Math.imul(N, ot)) | 0),
            (o = (o + Math.imul(N, st)) | 0),
            (n = (n + Math.imul(T, at)) | 0),
            (i = (i + Math.imul(T, ht)) | 0),
            (i = (i + Math.imul(R, at)) | 0),
            (o = (o + Math.imul(R, ht)) | 0),
            (n = (n + Math.imul(A, ft)) | 0),
            (i = (i + Math.imul(A, ct)) | 0),
            (i = (i + Math.imul(k, ft)) | 0),
            (o = (o + Math.imul(k, ct)) | 0),
            (n = (n + Math.imul(x, pt)) | 0),
            (i = (i + Math.imul(x, mt)) | 0),
            (i = (i + Math.imul(S, pt)) | 0),
            (o = (o + Math.imul(S, mt)) | 0);
          var Tt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Tt >>> 26)) | 0),
            (Tt &= 67108863),
            (n = Math.imul(q, rt)),
            (i = Math.imul(q, nt)),
            (i = (i + Math.imul(U, rt)) | 0),
            (o = Math.imul(U, nt)),
            (n = (n + Math.imul(P, ot)) | 0),
            (i = (i + Math.imul(P, st)) | 0),
            (i = (i + Math.imul(I, ot)) | 0),
            (o = (o + Math.imul(I, st)) | 0),
            (n = (n + Math.imul(j, at)) | 0),
            (i = (i + Math.imul(j, ht)) | 0),
            (i = (i + Math.imul(N, at)) | 0),
            (o = (o + Math.imul(N, ht)) | 0),
            (n = (n + Math.imul(T, ft)) | 0),
            (i = (i + Math.imul(T, ct)) | 0),
            (i = (i + Math.imul(R, ft)) | 0),
            (o = (o + Math.imul(R, ct)) | 0),
            (n = (n + Math.imul(A, pt)) | 0),
            (i = (i + Math.imul(A, mt)) | 0),
            (i = (i + Math.imul(k, pt)) | 0),
            (o = (o + Math.imul(k, mt)) | 0);
          var Rt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Rt >>> 26)) | 0),
            (Rt &= 67108863),
            (n = Math.imul(q, ot)),
            (i = Math.imul(q, st)),
            (i = (i + Math.imul(U, ot)) | 0),
            (o = Math.imul(U, st)),
            (n = (n + Math.imul(P, at)) | 0),
            (i = (i + Math.imul(P, ht)) | 0),
            (i = (i + Math.imul(I, at)) | 0),
            (o = (o + Math.imul(I, ht)) | 0),
            (n = (n + Math.imul(j, ft)) | 0),
            (i = (i + Math.imul(j, ct)) | 0),
            (i = (i + Math.imul(N, ft)) | 0),
            (o = (o + Math.imul(N, ct)) | 0),
            (n = (n + Math.imul(T, pt)) | 0),
            (i = (i + Math.imul(T, mt)) | 0),
            (i = (i + Math.imul(R, pt)) | 0),
            (o = (o + Math.imul(R, mt)) | 0);
          var Ct = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Ct >>> 26)) | 0),
            (Ct &= 67108863),
            (n = Math.imul(q, at)),
            (i = Math.imul(q, ht)),
            (i = (i + Math.imul(U, at)) | 0),
            (o = Math.imul(U, ht)),
            (n = (n + Math.imul(P, ft)) | 0),
            (i = (i + Math.imul(P, ct)) | 0),
            (i = (i + Math.imul(I, ft)) | 0),
            (o = (o + Math.imul(I, ct)) | 0),
            (n = (n + Math.imul(j, pt)) | 0),
            (i = (i + Math.imul(j, mt)) | 0),
            (i = (i + Math.imul(N, pt)) | 0),
            (o = (o + Math.imul(N, mt)) | 0);
          var jt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (jt >>> 26)) | 0),
            (jt &= 67108863),
            (n = Math.imul(q, ft)),
            (i = Math.imul(q, ct)),
            (i = (i + Math.imul(U, ft)) | 0),
            (o = Math.imul(U, ct)),
            (n = (n + Math.imul(P, pt)) | 0),
            (i = (i + Math.imul(P, mt)) | 0),
            (i = (i + Math.imul(I, pt)) | 0),
            (o = (o + Math.imul(I, mt)) | 0);
          var Nt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Nt >>> 26)) | 0),
            (Nt &= 67108863),
            (n = Math.imul(q, pt)),
            (i = Math.imul(q, mt)),
            (i = (i + Math.imul(U, pt)) | 0),
            (o = Math.imul(U, mt));
          var Lt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          return (
            (h = (((o + (i >>> 13)) | 0) + (Lt >>> 26)) | 0),
            (Lt &= 67108863),
            (a[0] = vt),
            (a[1] = gt),
            (a[2] = yt),
            (a[3] = wt),
            (a[4] = bt),
            (a[5] = Mt),
            (a[6] = _t),
            (a[7] = xt),
            (a[8] = St),
            (a[9] = Et),
            (a[10] = At),
            (a[11] = kt),
            (a[12] = Ot),
            (a[13] = Tt),
            (a[14] = Rt),
            (a[15] = Ct),
            (a[16] = jt),
            (a[17] = Nt),
            (a[18] = Lt),
            0 !== h && ((a[19] = h), r.length++),
            r
          );
        };
        function m(t, e, r) {
          (r.negative = e.negative ^ t.negative),
            (r.length = t.length + e.length);
          for (var n = 0, i = 0, o = 0; o < r.length - 1; o++) {
            var s = i;
            i = 0;
            for (
              var u = 67108863 & n,
                a = Math.min(o, e.length - 1),
                h = Math.max(0, o - t.length + 1);
              h <= a;
              h++
            ) {
              var l = o - h,
                f = 0 | t.words[l],
                c = 0 | e.words[h],
                d = f * c,
                p = 67108863 & d;
              (s = (s + ((d / 67108864) | 0)) | 0),
                (p = (p + u) | 0),
                (u = 67108863 & p),
                (s = (s + (p >>> 26)) | 0),
                (i += s >>> 26),
                (s &= 67108863);
            }
            (r.words[o] = u), (n = s), (s = i);
          }
          return 0 !== n ? (r.words[o] = n) : r.length--, r.strip();
        }
        function v(t, e, r) {
          var n = new g();
          return n.mulp(t, e, r);
        }
        function g(t, e) {
          (this.x = t), (this.y = e);
        }
        Math.imul || (p = d),
          (o.prototype.mulTo = function (t, e) {
            var r,
              n = this.length + t.length;
            return (
              (r =
                10 === this.length && 10 === t.length
                  ? p(this, t, e)
                  : n < 63
                  ? d(this, t, e)
                  : n < 1024
                  ? m(this, t, e)
                  : v(this, t, e)),
              r
            );
          }),
          (g.prototype.makeRBT = function (t) {
            for (
              var e = new Array(t), r = o.prototype._countBits(t) - 1, n = 0;
              n < t;
              n++
            )
              e[n] = this.revBin(n, r, t);
            return e;
          }),
          (g.prototype.revBin = function (t, e, r) {
            if (0 === t || t === r - 1) return t;
            for (var n = 0, i = 0; i < e; i++)
              (n |= (1 & t) << (e - i - 1)), (t >>= 1);
            return n;
          }),
          (g.prototype.permute = function (t, e, r, n, i, o) {
            for (var s = 0; s < o; s++) (n[s] = e[t[s]]), (i[s] = r[t[s]]);
          }),
          (g.prototype.transform = function (t, e, r, n, i, o) {
            this.permute(o, t, e, r, n, i);
            for (var s = 1; s < i; s <<= 1)
              for (
                var u = s << 1,
                  a = Math.cos((2 * Math.PI) / u),
                  h = Math.sin((2 * Math.PI) / u),
                  l = 0;
                l < i;
                l += u
              )
                for (var f = a, c = h, d = 0; d < s; d++) {
                  var p = r[l + d],
                    m = n[l + d],
                    v = r[l + d + s],
                    g = n[l + d + s],
                    y = f * v - c * g;
                  (g = f * g + c * v),
                    (v = y),
                    (r[l + d] = p + v),
                    (n[l + d] = m + g),
                    (r[l + d + s] = p - v),
                    (n[l + d + s] = m - g),
                    d !== u &&
                      ((y = a * f - h * c), (c = a * c + h * f), (f = y));
                }
          }),
          (g.prototype.guessLen13b = function (t, e) {
            var r = 1 | Math.max(e, t),
              n = 1 & r,
              i = 0;
            for (r = (r / 2) | 0; r; r >>>= 1) i++;
            return 1 << (i + 1 + n);
          }),
          (g.prototype.conjugate = function (t, e, r) {
            if (!(r <= 1))
              for (var n = 0; n < r / 2; n++) {
                var i = t[n];
                (t[n] = t[r - n - 1]),
                  (t[r - n - 1] = i),
                  (i = e[n]),
                  (e[n] = -e[r - n - 1]),
                  (e[r - n - 1] = -i);
              }
          }),
          (g.prototype.normalize13b = function (t, e) {
            for (var r = 0, n = 0; n < e / 2; n++) {
              var i =
                8192 * Math.round(t[2 * n + 1] / e) +
                Math.round(t[2 * n] / e) +
                r;
              (t[n] = 67108863 & i),
                (r = i < 67108864 ? 0 : (i / 67108864) | 0);
            }
            return t;
          }),
          (g.prototype.convert13b = function (t, e, r, i) {
            for (var o = 0, s = 0; s < e; s++)
              (o += 0 | t[s]),
                (r[2 * s] = 8191 & o),
                (o >>>= 13),
                (r[2 * s + 1] = 8191 & o),
                (o >>>= 13);
            for (s = 2 * e; s < i; ++s) r[s] = 0;
            n(0 === o), n(0 === (-8192 & o));
          }),
          (g.prototype.stub = function (t) {
            for (var e = new Array(t), r = 0; r < t; r++) e[r] = 0;
            return e;
          }),
          (g.prototype.mulp = function (t, e, r) {
            var n = 2 * this.guessLen13b(t.length, e.length),
              i = this.makeRBT(n),
              o = this.stub(n),
              s = new Array(n),
              u = new Array(n),
              a = new Array(n),
              h = new Array(n),
              l = new Array(n),
              f = new Array(n),
              c = r.words;
            (c.length = n),
              this.convert13b(t.words, t.length, s, n),
              this.convert13b(e.words, e.length, h, n),
              this.transform(s, o, u, a, n, i),
              this.transform(h, o, l, f, n, i);
            for (var d = 0; d < n; d++) {
              var p = u[d] * l[d] - a[d] * f[d];
              (a[d] = u[d] * f[d] + a[d] * l[d]), (u[d] = p);
            }
            return (
              this.conjugate(u, a, n),
              this.transform(u, a, c, o, n, i),
              this.conjugate(c, o, n),
              this.normalize13b(c, n),
              (r.negative = t.negative ^ e.negative),
              (r.length = t.length + e.length),
              r.strip()
            );
          }),
          (o.prototype.mul = function (t) {
            var e = new o(null);
            return (
              (e.words = new Array(this.length + t.length)), this.mulTo(t, e)
            );
          }),
          (o.prototype.mulf = function (t) {
            var e = new o(null);
            return (e.words = new Array(this.length + t.length)), v(this, t, e);
          }),
          (o.prototype.imul = function (t) {
            return this.clone().mulTo(t, this);
          }),
          (o.prototype.imuln = function (t) {
            n("number" === typeof t), n(t < 67108864);
            for (var e = 0, r = 0; r < this.length; r++) {
              var i = (0 | this.words[r]) * t,
                o = (67108863 & i) + (67108863 & e);
              (e >>= 26),
                (e += (i / 67108864) | 0),
                (e += o >>> 26),
                (this.words[r] = 67108863 & o);
            }
            return 0 !== e && ((this.words[r] = e), this.length++), this;
          }),
          (o.prototype.muln = function (t) {
            return this.clone().imuln(t);
          }),
          (o.prototype.sqr = function () {
            return this.mul(this);
          }),
          (o.prototype.isqr = function () {
            return this.imul(this.clone());
          }),
          (o.prototype.pow = function (t) {
            var e = c(t);
            if (0 === e.length) return new o(1);
            for (var r = this, n = 0; n < e.length; n++, r = r.sqr())
              if (0 !== e[n]) break;
            if (++n < e.length)
              for (var i = r.sqr(); n < e.length; n++, i = i.sqr())
                0 !== e[n] && (r = r.mul(i));
            return r;
          }),
          (o.prototype.iushln = function (t) {
            n("number" === typeof t && t >= 0);
            var e,
              r = t % 26,
              i = (t - r) / 26,
              o = (67108863 >>> (26 - r)) << (26 - r);
            if (0 !== r) {
              var s = 0;
              for (e = 0; e < this.length; e++) {
                var u = this.words[e] & o,
                  a = ((0 | this.words[e]) - u) << r;
                (this.words[e] = a | s), (s = u >>> (26 - r));
              }
              s && ((this.words[e] = s), this.length++);
            }
            if (0 !== i) {
              for (e = this.length - 1; e >= 0; e--)
                this.words[e + i] = this.words[e];
              for (e = 0; e < i; e++) this.words[e] = 0;
              this.length += i;
            }
            return this.strip();
          }),
          (o.prototype.ishln = function (t) {
            return n(0 === this.negative), this.iushln(t);
          }),
          (o.prototype.iushrn = function (t, e, r) {
            var i;
            n("number" === typeof t && t >= 0),
              (i = e ? (e - (e % 26)) / 26 : 0);
            var o = t % 26,
              s = Math.min((t - o) / 26, this.length),
              u = 67108863 ^ ((67108863 >>> o) << o),
              a = r;
            if (((i -= s), (i = Math.max(0, i)), a)) {
              for (var h = 0; h < s; h++) a.words[h] = this.words[h];
              a.length = s;
            }
            if (0 === s);
            else if (this.length > s)
              for (this.length -= s, h = 0; h < this.length; h++)
                this.words[h] = this.words[h + s];
            else (this.words[0] = 0), (this.length = 1);
            var l = 0;
            for (h = this.length - 1; h >= 0 && (0 !== l || h >= i); h--) {
              var f = 0 | this.words[h];
              (this.words[h] = (l << (26 - o)) | (f >>> o)), (l = f & u);
            }
            return (
              a && 0 !== l && (a.words[a.length++] = l),
              0 === this.length && ((this.words[0] = 0), (this.length = 1)),
              this.strip()
            );
          }),
          (o.prototype.ishrn = function (t, e, r) {
            return n(0 === this.negative), this.iushrn(t, e, r);
          }),
          (o.prototype.shln = function (t) {
            return this.clone().ishln(t);
          }),
          (o.prototype.ushln = function (t) {
            return this.clone().iushln(t);
          }),
          (o.prototype.shrn = function (t) {
            return this.clone().ishrn(t);
          }),
          (o.prototype.ushrn = function (t) {
            return this.clone().iushrn(t);
          }),
          (o.prototype.testn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = t % 26,
              r = (t - e) / 26,
              i = 1 << e;
            if (this.length <= r) return !1;
            var o = this.words[r];
            return !!(o & i);
          }),
          (o.prototype.imaskn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = t % 26,
              r = (t - e) / 26;
            if (
              (n(
                0 === this.negative,
                "imaskn works only with positive numbers"
              ),
              this.length <= r)
            )
              return this;
            if (
              (0 !== e && r++,
              (this.length = Math.min(r, this.length)),
              0 !== e)
            ) {
              var i = 67108863 ^ ((67108863 >>> e) << e);
              this.words[this.length - 1] &= i;
            }
            return this.strip();
          }),
          (o.prototype.maskn = function (t) {
            return this.clone().imaskn(t);
          }),
          (o.prototype.iaddn = function (t) {
            return (
              n("number" === typeof t),
              n(t < 67108864),
              t < 0
                ? this.isubn(-t)
                : 0 !== this.negative
                ? 1 === this.length && (0 | this.words[0]) < t
                  ? ((this.words[0] = t - (0 | this.words[0])),
                    (this.negative = 0),
                    this)
                  : ((this.negative = 0),
                    this.isubn(t),
                    (this.negative = 1),
                    this)
                : this._iaddn(t)
            );
          }),
          (o.prototype._iaddn = function (t) {
            this.words[0] += t;
            for (var e = 0; e < this.length && this.words[e] >= 67108864; e++)
              (this.words[e] -= 67108864),
                e === this.length - 1
                  ? (this.words[e + 1] = 1)
                  : this.words[e + 1]++;
            return (this.length = Math.max(this.length, e + 1)), this;
          }),
          (o.prototype.isubn = function (t) {
            if ((n("number" === typeof t), n(t < 67108864), t < 0))
              return this.iaddn(-t);
            if (0 !== this.negative)
              return (
                (this.negative = 0), this.iaddn(t), (this.negative = 1), this
              );
            if (((this.words[0] -= t), 1 === this.length && this.words[0] < 0))
              (this.words[0] = -this.words[0]), (this.negative = 1);
            else
              for (var e = 0; e < this.length && this.words[e] < 0; e++)
                (this.words[e] += 67108864), (this.words[e + 1] -= 1);
            return this.strip();
          }),
          (o.prototype.addn = function (t) {
            return this.clone().iaddn(t);
          }),
          (o.prototype.subn = function (t) {
            return this.clone().isubn(t);
          }),
          (o.prototype.iabs = function () {
            return (this.negative = 0), this;
          }),
          (o.prototype.abs = function () {
            return this.clone().iabs();
          }),
          (o.prototype._ishlnsubmul = function (t, e, r) {
            var i,
              o,
              s = t.length + r;
            this._expand(s);
            var u = 0;
            for (i = 0; i < t.length; i++) {
              o = (0 | this.words[i + r]) + u;
              var a = (0 | t.words[i]) * e;
              (o -= 67108863 & a),
                (u = (o >> 26) - ((a / 67108864) | 0)),
                (this.words[i + r] = 67108863 & o);
            }
            for (; i < this.length - r; i++)
              (o = (0 | this.words[i + r]) + u),
                (u = o >> 26),
                (this.words[i + r] = 67108863 & o);
            if (0 === u) return this.strip();
            for (n(-1 === u), u = 0, i = 0; i < this.length; i++)
              (o = -(0 | this.words[i]) + u),
                (u = o >> 26),
                (this.words[i] = 67108863 & o);
            return (this.negative = 1), this.strip();
          }),
          (o.prototype._wordDiv = function (t, e) {
            var r = this.length - t.length,
              n = this.clone(),
              i = t,
              s = 0 | i.words[i.length - 1],
              u = this._countBits(s);
            (r = 26 - u),
              0 !== r &&
                ((i = i.ushln(r)),
                n.iushln(r),
                (s = 0 | i.words[i.length - 1]));
            var a,
              h = n.length - i.length;
            if ("mod" !== e) {
              (a = new o(null)),
                (a.length = h + 1),
                (a.words = new Array(a.length));
              for (var l = 0; l < a.length; l++) a.words[l] = 0;
            }
            var f = n.clone()._ishlnsubmul(i, 1, h);
            0 === f.negative && ((n = f), a && (a.words[h] = 1));
            for (var c = h - 1; c >= 0; c--) {
              var d =
                67108864 * (0 | n.words[i.length + c]) +
                (0 | n.words[i.length + c - 1]);
              (d = Math.min((d / s) | 0, 67108863)), n._ishlnsubmul(i, d, c);
              while (0 !== n.negative)
                d--,
                  (n.negative = 0),
                  n._ishlnsubmul(i, 1, c),
                  n.isZero() || (n.negative ^= 1);
              a && (a.words[c] = d);
            }
            return (
              a && a.strip(),
              n.strip(),
              "div" !== e && 0 !== r && n.iushrn(r),
              { div: a || null, mod: n }
            );
          }),
          (o.prototype.divmod = function (t, e, r) {
            return (
              n(!t.isZero()),
              this.isZero()
                ? { div: new o(0), mod: new o(0) }
                : 0 !== this.negative && 0 === t.negative
                ? ((u = this.neg().divmod(t, e)),
                  "mod" !== e && (i = u.div.neg()),
                  "div" !== e &&
                    ((s = u.mod.neg()), r && 0 !== s.negative && s.iadd(t)),
                  { div: i, mod: s })
                : 0 === this.negative && 0 !== t.negative
                ? ((u = this.divmod(t.neg(), e)),
                  "mod" !== e && (i = u.div.neg()),
                  { div: i, mod: u.mod })
                : 0 !== (this.negative & t.negative)
                ? ((u = this.neg().divmod(t.neg(), e)),
                  "div" !== e &&
                    ((s = u.mod.neg()), r && 0 !== s.negative && s.isub(t)),
                  { div: u.div, mod: s })
                : t.length > this.length || this.cmp(t) < 0
                ? { div: new o(0), mod: this }
                : 1 === t.length
                ? "div" === e
                  ? { div: this.divn(t.words[0]), mod: null }
                  : "mod" === e
                  ? { div: null, mod: new o(this.modn(t.words[0])) }
                  : {
                      div: this.divn(t.words[0]),
                      mod: new o(this.modn(t.words[0])),
                    }
                : this._wordDiv(t, e)
            );
            var i, s, u;
          }),
          (o.prototype.div = function (t) {
            return this.divmod(t, "div", !1).div;
          }),
          (o.prototype.mod = function (t) {
            return this.divmod(t, "mod", !1).mod;
          }),
          (o.prototype.umod = function (t) {
            return this.divmod(t, "mod", !0).mod;
          }),
          (o.prototype.divRound = function (t) {
            var e = this.divmod(t);
            if (e.mod.isZero()) return e.div;
            var r = 0 !== e.div.negative ? e.mod.isub(t) : e.mod,
              n = t.ushrn(1),
              i = t.andln(1),
              o = r.cmp(n);
            return o < 0 || (1 === i && 0 === o)
              ? e.div
              : 0 !== e.div.negative
              ? e.div.isubn(1)
              : e.div.iaddn(1);
          }),
          (o.prototype.modn = function (t) {
            n(t <= 67108863);
            for (var e = (1 << 26) % t, r = 0, i = this.length - 1; i >= 0; i--)
              r = (e * r + (0 | this.words[i])) % t;
            return r;
          }),
          (o.prototype.idivn = function (t) {
            n(t <= 67108863);
            for (var e = 0, r = this.length - 1; r >= 0; r--) {
              var i = (0 | this.words[r]) + 67108864 * e;
              (this.words[r] = (i / t) | 0), (e = i % t);
            }
            return this.strip();
          }),
          (o.prototype.divn = function (t) {
            return this.clone().idivn(t);
          }),
          (o.prototype.egcd = function (t) {
            n(0 === t.negative), n(!t.isZero());
            var e = this,
              r = t.clone();
            e = 0 !== e.negative ? e.umod(t) : e.clone();
            var i = new o(1),
              s = new o(0),
              u = new o(0),
              a = new o(1),
              h = 0;
            while (e.isEven() && r.isEven()) e.iushrn(1), r.iushrn(1), ++h;
            var l = r.clone(),
              f = e.clone();
            while (!e.isZero()) {
              for (
                var c = 0, d = 1;
                0 === (e.words[0] & d) && c < 26;
                ++c, d <<= 1
              );
              if (c > 0) {
                e.iushrn(c);
                while (c-- > 0)
                  (i.isOdd() || s.isOdd()) && (i.iadd(l), s.isub(f)),
                    i.iushrn(1),
                    s.iushrn(1);
              }
              for (
                var p = 0, m = 1;
                0 === (r.words[0] & m) && p < 26;
                ++p, m <<= 1
              );
              if (p > 0) {
                r.iushrn(p);
                while (p-- > 0)
                  (u.isOdd() || a.isOdd()) && (u.iadd(l), a.isub(f)),
                    u.iushrn(1),
                    a.iushrn(1);
              }
              e.cmp(r) >= 0
                ? (e.isub(r), i.isub(u), s.isub(a))
                : (r.isub(e), u.isub(i), a.isub(s));
            }
            return { a: u, b: a, gcd: r.iushln(h) };
          }),
          (o.prototype._invmp = function (t) {
            n(0 === t.negative), n(!t.isZero());
            var e = this,
              r = t.clone();
            e = 0 !== e.negative ? e.umod(t) : e.clone();
            var i,
              s = new o(1),
              u = new o(0),
              a = r.clone();
            while (e.cmpn(1) > 0 && r.cmpn(1) > 0) {
              for (
                var h = 0, l = 1;
                0 === (e.words[0] & l) && h < 26;
                ++h, l <<= 1
              );
              if (h > 0) {
                e.iushrn(h);
                while (h-- > 0) s.isOdd() && s.iadd(a), s.iushrn(1);
              }
              for (
                var f = 0, c = 1;
                0 === (r.words[0] & c) && f < 26;
                ++f, c <<= 1
              );
              if (f > 0) {
                r.iushrn(f);
                while (f-- > 0) u.isOdd() && u.iadd(a), u.iushrn(1);
              }
              e.cmp(r) >= 0 ? (e.isub(r), s.isub(u)) : (r.isub(e), u.isub(s));
            }
            return (i = 0 === e.cmpn(1) ? s : u), i.cmpn(0) < 0 && i.iadd(t), i;
          }),
          (o.prototype.gcd = function (t) {
            if (this.isZero()) return t.abs();
            if (t.isZero()) return this.abs();
            var e = this.clone(),
              r = t.clone();
            (e.negative = 0), (r.negative = 0);
            for (var n = 0; e.isEven() && r.isEven(); n++)
              e.iushrn(1), r.iushrn(1);
            do {
              while (e.isEven()) e.iushrn(1);
              while (r.isEven()) r.iushrn(1);
              var i = e.cmp(r);
              if (i < 0) {
                var o = e;
                (e = r), (r = o);
              } else if (0 === i || 0 === r.cmpn(1)) break;
              e.isub(r);
            } while (1);
            return r.iushln(n);
          }),
          (o.prototype.invm = function (t) {
            return this.egcd(t).a.umod(t);
          }),
          (o.prototype.isEven = function () {
            return 0 === (1 & this.words[0]);
          }),
          (o.prototype.isOdd = function () {
            return 1 === (1 & this.words[0]);
          }),
          (o.prototype.andln = function (t) {
            return this.words[0] & t;
          }),
          (o.prototype.bincn = function (t) {
            n("number" === typeof t);
            var e = t % 26,
              r = (t - e) / 26,
              i = 1 << e;
            if (this.length <= r)
              return this._expand(r + 1), (this.words[r] |= i), this;
            for (var o = i, s = r; 0 !== o && s < this.length; s++) {
              var u = 0 | this.words[s];
              (u += o), (o = u >>> 26), (u &= 67108863), (this.words[s] = u);
            }
            return 0 !== o && ((this.words[s] = o), this.length++), this;
          }),
          (o.prototype.isZero = function () {
            return 1 === this.length && 0 === this.words[0];
          }),
          (o.prototype.cmpn = function (t) {
            var e,
              r = t < 0;
            if (0 !== this.negative && !r) return -1;
            if (0 === this.negative && r) return 1;
            if ((this.strip(), this.length > 1)) e = 1;
            else {
              r && (t = -t), n(t <= 67108863, "Number is too big");
              var i = 0 | this.words[0];
              e = i === t ? 0 : i < t ? -1 : 1;
            }
            return 0 !== this.negative ? 0 | -e : e;
          }),
          (o.prototype.cmp = function (t) {
            if (0 !== this.negative && 0 === t.negative) return -1;
            if (0 === this.negative && 0 !== t.negative) return 1;
            var e = this.ucmp(t);
            return 0 !== this.negative ? 0 | -e : e;
          }),
          (o.prototype.ucmp = function (t) {
            if (this.length > t.length) return 1;
            if (this.length < t.length) return -1;
            for (var e = 0, r = this.length - 1; r >= 0; r--) {
              var n = 0 | this.words[r],
                i = 0 | t.words[r];
              if (n !== i) {
                n < i ? (e = -1) : n > i && (e = 1);
                break;
              }
            }
            return e;
          }),
          (o.prototype.gtn = function (t) {
            return 1 === this.cmpn(t);
          }),
          (o.prototype.gt = function (t) {
            return 1 === this.cmp(t);
          }),
          (o.prototype.gten = function (t) {
            return this.cmpn(t) >= 0;
          }),
          (o.prototype.gte = function (t) {
            return this.cmp(t) >= 0;
          }),
          (o.prototype.ltn = function (t) {
            return -1 === this.cmpn(t);
          }),
          (o.prototype.lt = function (t) {
            return -1 === this.cmp(t);
          }),
          (o.prototype.lten = function (t) {
            return this.cmpn(t) <= 0;
          }),
          (o.prototype.lte = function (t) {
            return this.cmp(t) <= 0;
          }),
          (o.prototype.eqn = function (t) {
            return 0 === this.cmpn(t);
          }),
          (o.prototype.eq = function (t) {
            return 0 === this.cmp(t);
          }),
          (o.red = function (t) {
            return new S(t);
          }),
          (o.prototype.toRed = function (t) {
            return (
              n(!this.red, "Already a number in reduction context"),
              n(0 === this.negative, "red works only with positives"),
              t.convertTo(this)._forceRed(t)
            );
          }),
          (o.prototype.fromRed = function () {
            return (
              n(
                this.red,
                "fromRed works only with numbers in reduction context"
              ),
              this.red.convertFrom(this)
            );
          }),
          (o.prototype._forceRed = function (t) {
            return (this.red = t), this;
          }),
          (o.prototype.forceRed = function (t) {
            return (
              n(!this.red, "Already a number in reduction context"),
              this._forceRed(t)
            );
          }),
          (o.prototype.redAdd = function (t) {
            return (
              n(this.red, "redAdd works only with red numbers"),
              this.red.add(this, t)
            );
          }),
          (o.prototype.redIAdd = function (t) {
            return (
              n(this.red, "redIAdd works only with red numbers"),
              this.red.iadd(this, t)
            );
          }),
          (o.prototype.redSub = function (t) {
            return (
              n(this.red, "redSub works only with red numbers"),
              this.red.sub(this, t)
            );
          }),
          (o.prototype.redISub = function (t) {
            return (
              n(this.red, "redISub works only with red numbers"),
              this.red.isub(this, t)
            );
          }),
          (o.prototype.redShl = function (t) {
            return (
              n(this.red, "redShl works only with red numbers"),
              this.red.shl(this, t)
            );
          }),
          (o.prototype.redMul = function (t) {
            return (
              n(this.red, "redMul works only with red numbers"),
              this.red._verify2(this, t),
              this.red.mul(this, t)
            );
          }),
          (o.prototype.redIMul = function (t) {
            return (
              n(this.red, "redMul works only with red numbers"),
              this.red._verify2(this, t),
              this.red.imul(this, t)
            );
          }),
          (o.prototype.redSqr = function () {
            return (
              n(this.red, "redSqr works only with red numbers"),
              this.red._verify1(this),
              this.red.sqr(this)
            );
          }),
          (o.prototype.redISqr = function () {
            return (
              n(this.red, "redISqr works only with red numbers"),
              this.red._verify1(this),
              this.red.isqr(this)
            );
          }),
          (o.prototype.redSqrt = function () {
            return (
              n(this.red, "redSqrt works only with red numbers"),
              this.red._verify1(this),
              this.red.sqrt(this)
            );
          }),
          (o.prototype.redInvm = function () {
            return (
              n(this.red, "redInvm works only with red numbers"),
              this.red._verify1(this),
              this.red.invm(this)
            );
          }),
          (o.prototype.redNeg = function () {
            return (
              n(this.red, "redNeg works only with red numbers"),
              this.red._verify1(this),
              this.red.neg(this)
            );
          }),
          (o.prototype.redPow = function (t) {
            return (
              n(this.red && !t.red, "redPow(normalNum)"),
              this.red._verify1(this),
              this.red.pow(this, t)
            );
          });
        var y = { k256: null, p224: null, p192: null, p25519: null };
        function w(t, e) {
          (this.name = t),
            (this.p = new o(e, 16)),
            (this.n = this.p.bitLength()),
            (this.k = new o(1).iushln(this.n).isub(this.p)),
            (this.tmp = this._tmp());
        }
        function b() {
          w.call(
            this,
            "k256",
            "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
          );
        }
        function M() {
          w.call(
            this,
            "p224",
            "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
          );
        }
        function _() {
          w.call(
            this,
            "p192",
            "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
          );
        }
        function x() {
          w.call(
            this,
            "25519",
            "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
          );
        }
        function S(t) {
          if ("string" === typeof t) {
            var e = o._prime(t);
            (this.m = e.p), (this.prime = e);
          } else
            n(t.gtn(1), "modulus must be greater than 1"),
              (this.m = t),
              (this.prime = null);
        }
        function E(t) {
          S.call(this, t),
            (this.shift = this.m.bitLength()),
            this.shift % 26 !== 0 && (this.shift += 26 - (this.shift % 26)),
            (this.r = new o(1).iushln(this.shift)),
            (this.r2 = this.imod(this.r.sqr())),
            (this.rinv = this.r._invmp(this.m)),
            (this.minv = this.rinv.mul(this.r).isubn(1).div(this.m)),
            (this.minv = this.minv.umod(this.r)),
            (this.minv = this.r.sub(this.minv));
        }
        (w.prototype._tmp = function () {
          var t = new o(null);
          return (t.words = new Array(Math.ceil(this.n / 13))), t;
        }),
          (w.prototype.ireduce = function (t) {
            var e,
              r = t;
            do {
              this.split(r, this.tmp),
                (r = this.imulK(r)),
                (r = r.iadd(this.tmp)),
                (e = r.bitLength());
            } while (e > this.n);
            var n = e < this.n ? -1 : r.ucmp(this.p);
            return (
              0 === n
                ? ((r.words[0] = 0), (r.length = 1))
                : n > 0
                ? r.isub(this.p)
                : r.strip(),
              r
            );
          }),
          (w.prototype.split = function (t, e) {
            t.iushrn(this.n, 0, e);
          }),
          (w.prototype.imulK = function (t) {
            return t.imul(this.k);
          }),
          i(b, w),
          (b.prototype.split = function (t, e) {
            for (var r = 4194303, n = Math.min(t.length, 9), i = 0; i < n; i++)
              e.words[i] = t.words[i];
            if (((e.length = n), t.length <= 9))
              return (t.words[0] = 0), void (t.length = 1);
            var o = t.words[9];
            for (e.words[e.length++] = o & r, i = 10; i < t.length; i++) {
              var s = 0 | t.words[i];
              (t.words[i - 10] = ((s & r) << 4) | (o >>> 22)), (o = s);
            }
            (o >>>= 22),
              (t.words[i - 10] = o),
              0 === o && t.length > 10 ? (t.length -= 10) : (t.length -= 9);
          }),
          (b.prototype.imulK = function (t) {
            (t.words[t.length] = 0),
              (t.words[t.length + 1] = 0),
              (t.length += 2);
            for (var e = 0, r = 0; r < t.length; r++) {
              var n = 0 | t.words[r];
              (e += 977 * n),
                (t.words[r] = 67108863 & e),
                (e = 64 * n + ((e / 67108864) | 0));
            }
            return (
              0 === t.words[t.length - 1] &&
                (t.length--, 0 === t.words[t.length - 1] && t.length--),
              t
            );
          }),
          i(M, w),
          i(_, w),
          i(x, w),
          (x.prototype.imulK = function (t) {
            for (var e = 0, r = 0; r < t.length; r++) {
              var n = 19 * (0 | t.words[r]) + e,
                i = 67108863 & n;
              (n >>>= 26), (t.words[r] = i), (e = n);
            }
            return 0 !== e && (t.words[t.length++] = e), t;
          }),
          (o._prime = function (t) {
            if (y[t]) return y[t];
            var e;
            if ("k256" === t) e = new b();
            else if ("p224" === t) e = new M();
            else if ("p192" === t) e = new _();
            else {
              if ("p25519" !== t) throw new Error("Unknown prime " + t);
              e = new x();
            }
            return (y[t] = e), e;
          }),
          (S.prototype._verify1 = function (t) {
            n(0 === t.negative, "red works only with positives"),
              n(t.red, "red works only with red numbers");
          }),
          (S.prototype._verify2 = function (t, e) {
            n(0 === (t.negative | e.negative), "red works only with positives"),
              n(t.red && t.red === e.red, "red works only with red numbers");
          }),
          (S.prototype.imod = function (t) {
            return this.prime
              ? this.prime.ireduce(t)._forceRed(this)
              : t.umod(this.m)._forceRed(this);
          }),
          (S.prototype.neg = function (t) {
            return t.isZero() ? t.clone() : this.m.sub(t)._forceRed(this);
          }),
          (S.prototype.add = function (t, e) {
            this._verify2(t, e);
            var r = t.add(e);
            return r.cmp(this.m) >= 0 && r.isub(this.m), r._forceRed(this);
          }),
          (S.prototype.iadd = function (t, e) {
            this._verify2(t, e);
            var r = t.iadd(e);
            return r.cmp(this.m) >= 0 && r.isub(this.m), r;
          }),
          (S.prototype.sub = function (t, e) {
            this._verify2(t, e);
            var r = t.sub(e);
            return r.cmpn(0) < 0 && r.iadd(this.m), r._forceRed(this);
          }),
          (S.prototype.isub = function (t, e) {
            this._verify2(t, e);
            var r = t.isub(e);
            return r.cmpn(0) < 0 && r.iadd(this.m), r;
          }),
          (S.prototype.shl = function (t, e) {
            return this._verify1(t), this.imod(t.ushln(e));
          }),
          (S.prototype.imul = function (t, e) {
            return this._verify2(t, e), this.imod(t.imul(e));
          }),
          (S.prototype.mul = function (t, e) {
            return this._verify2(t, e), this.imod(t.mul(e));
          }),
          (S.prototype.isqr = function (t) {
            return this.imul(t, t.clone());
          }),
          (S.prototype.sqr = function (t) {
            return this.mul(t, t);
          }),
          (S.prototype.sqrt = function (t) {
            if (t.isZero()) return t.clone();
            var e = this.m.andln(3);
            if ((n(e % 2 === 1), 3 === e)) {
              var r = this.m.add(new o(1)).iushrn(2);
              return this.pow(t, r);
            }
            var i = this.m.subn(1),
              s = 0;
            while (!i.isZero() && 0 === i.andln(1)) s++, i.iushrn(1);
            n(!i.isZero());
            var u = new o(1).toRed(this),
              a = u.redNeg(),
              h = this.m.subn(1).iushrn(1),
              l = this.m.bitLength();
            l = new o(2 * l * l).toRed(this);
            while (0 !== this.pow(l, h).cmp(a)) l.redIAdd(a);
            var f = this.pow(l, i),
              c = this.pow(t, i.addn(1).iushrn(1)),
              d = this.pow(t, i),
              p = s;
            while (0 !== d.cmp(u)) {
              for (var m = d, v = 0; 0 !== m.cmp(u); v++) m = m.redSqr();
              n(v < p);
              var g = this.pow(f, new o(1).iushln(p - v - 1));
              (c = c.redMul(g)), (f = g.redSqr()), (d = d.redMul(f)), (p = v);
            }
            return c;
          }),
          (S.prototype.invm = function (t) {
            var e = t._invmp(this.m);
            return 0 !== e.negative
              ? ((e.negative = 0), this.imod(e).redNeg())
              : this.imod(e);
          }),
          (S.prototype.pow = function (t, e) {
            if (e.isZero()) return new o(1).toRed(this);
            if (0 === e.cmpn(1)) return t.clone();
            var r = 4,
              n = new Array(1 << r);
            (n[0] = new o(1).toRed(this)), (n[1] = t);
            for (var i = 2; i < n.length; i++) n[i] = this.mul(n[i - 1], t);
            var s = n[0],
              u = 0,
              a = 0,
              h = e.bitLength() % 26;
            for (0 === h && (h = 26), i = e.length - 1; i >= 0; i--) {
              for (var l = e.words[i], f = h - 1; f >= 0; f--) {
                var c = (l >> f) & 1;
                s !== n[0] && (s = this.sqr(s)),
                  0 !== c || 0 !== u
                    ? ((u <<= 1),
                      (u |= c),
                      a++,
                      (a === r || (0 === i && 0 === f)) &&
                        ((s = this.mul(s, n[u])), (a = 0), (u = 0)))
                    : (a = 0);
              }
              h = 26;
            }
            return s;
          }),
          (S.prototype.convertTo = function (t) {
            var e = t.umod(this.m);
            return e === t ? e.clone() : e;
          }),
          (S.prototype.convertFrom = function (t) {
            var e = t.clone();
            return (e.red = null), e;
          }),
          (o.mont = function (t) {
            return new E(t);
          }),
          i(E, S),
          (E.prototype.convertTo = function (t) {
            return this.imod(t.ushln(this.shift));
          }),
          (E.prototype.convertFrom = function (t) {
            var e = this.imod(t.mul(this.rinv));
            return (e.red = null), e;
          }),
          (E.prototype.imul = function (t, e) {
            if (t.isZero() || e.isZero())
              return (t.words[0] = 0), (t.length = 1), t;
            var r = t.imul(e),
              n = r
                .maskn(this.shift)
                .mul(this.minv)
                .imaskn(this.shift)
                .mul(this.m),
              i = r.isub(n).iushrn(this.shift),
              o = i;
            return (
              i.cmp(this.m) >= 0
                ? (o = i.isub(this.m))
                : i.cmpn(0) < 0 && (o = i.iadd(this.m)),
              o._forceRed(this)
            );
          }),
          (E.prototype.mul = function (t, e) {
            if (t.isZero() || e.isZero()) return new o(0)._forceRed(this);
            var r = t.mul(e),
              n = r
                .maskn(this.shift)
                .mul(this.minv)
                .imaskn(this.shift)
                .mul(this.m),
              i = r.isub(n).iushrn(this.shift),
              s = i;
            return (
              i.cmp(this.m) >= 0
                ? (s = i.isub(this.m))
                : i.cmpn(0) < 0 && (s = i.iadd(this.m)),
              s._forceRed(this)
            );
          }),
          (E.prototype.invm = function (t) {
            var e = this.imod(t._invmp(this.m).mul(this.r2));
            return e._forceRed(this);
          });
      })(t, this);
    }.call(this, r("62e4")(t)));
  },
  "62e4": function (t, e) {
    t.exports = function (t) {
      return (
        t.webpackPolyfill ||
          ((t.deprecate = function () {}),
          (t.paths = []),
          t.children || (t.children = []),
          Object.defineProperty(t, "loaded", {
            enumerable: !0,
            get: function () {
              return t.l;
            },
          }),
          Object.defineProperty(t, "id", {
            enumerable: !0,
            get: function () {
              return t.i;
            },
          }),
          (t.webpackPolyfill = 1)),
        t
      );
    };
  },
  "636c": function (t, e, r) {
    "use strict";
    var n = {
      messageId: 0,
      toPayload: function (t, e) {
        if (!t)
          throw new Error(
            'JSONRPC method should be specified for params: "' +
              JSON.stringify(e) +
              '"!'
          );
        return (
          n.messageId++,
          { jsonrpc: "2.0", id: n.messageId, method: t, params: e || [] }
        );
      },
      isValidResponse: function (t) {
        return Array.isArray(t) ? t.every(e) : e(t);
        function e(t) {
          return (
            !!t &&
            !t.error &&
            "2.0" === t.jsonrpc &&
            ("number" === typeof t.id || "string" === typeof t.id) &&
            void 0 !== t.result
          );
        }
      },
      toBatchPayload: function (t) {
        return t.map(function (t) {
          return n.toPayload(t.method, t.params);
        });
      },
    };
    t.exports = n;
  },
  6547: function (t, e, r) {
    var n = r("a691"),
      i = r("1d80"),
      o = function (t) {
        return function (e, r) {
          var o,
            s,
            u = String(i(e)),
            a = n(r),
            h = u.length;
          return a < 0 || a >= h
            ? t
              ? ""
              : void 0
            : ((o = u.charCodeAt(a)),
              o < 55296 ||
              o > 56319 ||
              a + 1 === h ||
              (s = u.charCodeAt(a + 1)) < 56320 ||
              s > 57343
                ? t
                  ? u.charAt(a)
                  : o
                : t
                ? u.slice(a, a + 2)
                : s - 56320 + ((o - 55296) << 10) + 65536);
        };
      };
    t.exports = { codeAt: o(!1), charAt: o(!0) };
  },
  "65eb": function (t, e, r) {
    "use strict";
    Object.defineProperty(e, "__esModule", { value: !0 });
    var n = (function () {
      function t() {
        this.listeners = {};
      }
      return (
        (t.prototype.addEventListener = function (t, e) {
          (t = t.toLowerCase()),
            (this.listeners[t] = this.listeners[t] || []),
            this.listeners[t].push(e.handleEvent || e);
        }),
        (t.prototype.removeEventListener = function (t, e) {
          if (((t = t.toLowerCase()), this.listeners[t])) {
            var r = this.listeners[t].indexOf(e.handleEvent || e);
            r < 0 || this.listeners[t].splice(r, 1);
          }
        }),
        (t.prototype.dispatchEvent = function (t) {
          var e = t.type.toLowerCase();
          if (((t.target = this), this.listeners[e]))
            for (var r = 0, n = this.listeners[e]; r < n.length; r++) {
              var i = n[r];
              i.call(this, t);
            }
          var o = this["on" + e];
          return o && o.call(this, t), !0;
        }),
        t
      );
    })();
    e.XMLHttpRequestEventTarget = n;
  },
  "65f0": function (t, e, r) {
    var n = r("861d"),
      i = r("e8b5"),
      o = r("b622"),
      s = o("species");
    t.exports = function (t, e) {
      var r;
      return (
        i(t) &&
          ((r = t.constructor),
          "function" != typeof r || (r !== Array && !i(r.prototype))
            ? n(r) && ((r = r[s]), null === r && (r = void 0))
            : (r = void 0)),
        new (void 0 === r ? Array : r)(0 === e ? 0 : e)
      );
    };
  },
  6787: function (t, e) {
    var r = function () {
      if ("object" === typeof self && self) return self;
      if ("object" === typeof window && window) return window;
      throw new Error("Unable to resolve global `this`");
    };
    t.exports = (function () {
      if (this) return this;
      if ("object" === typeof globalThis && globalThis) return globalThis;
      try {
        Object.defineProperty(Object.prototype, "__global__", {
          get: function () {
            return this;
          },
          configurable: !0,
        });
      } catch (t) {
        return r();
      }
      try {
        return __global__ || r();
      } finally {
        delete Object.prototype.__global__;
      }
    })();
  },
  "67a3": function (t, e, r) {
    "use strict";
    r.d(e, "a", function () {
      return n;
    });
    var n = function (t, e) {
      return { jsonrpc: "2.0", id: t, result: e };
    };
  },
  "69f3": function (t, e, r) {
    var n,
      i,
      o,
      s = r("7f9a"),
      u = r("da84"),
      a = r("861d"),
      h = r("9112"),
      l = r("5135"),
      f = r("c6cd"),
      c = r("f772"),
      d = r("d012"),
      p = u.WeakMap,
      m = function (t) {
        return o(t) ? i(t) : n(t, {});
      },
      v = function (t) {
        return function (e) {
          var r;
          if (!a(e) || (r = i(e)).type !== t)
            throw TypeError("Incompatible receiver, " + t + " required");
          return r;
        };
      };
    if (s) {
      var g = f.state || (f.state = new p()),
        y = g.get,
        w = g.has,
        b = g.set;
      (n = function (t, e) {
        return (e.facade = t), b.call(g, t, e), e;
      }),
        (i = function (t) {
          return y.call(g, t) || {};
        }),
        (o = function (t) {
          return w.call(g, t);
        });
    } else {
      var M = c("state");
      (d[M] = !0),
        (n = function (t, e) {
          return (e.facade = t), h(t, M, e), e;
        }),
        (i = function (t) {
          return l(t, M) ? t[M] : {};
        }),
        (o = function (t) {
          return l(t, M);
        });
    }
    t.exports = { set: n, get: i, has: o, enforce: m, getterFor: v };
  },
  "6eeb": function (t, e, r) {
    var n = r("da84"),
      i = r("9112"),
      o = r("5135"),
      s = r("ce4e"),
      u = r("8925"),
      a = r("69f3"),
      h = a.get,
      l = a.enforce,
      f = String(String).split("String");
    (t.exports = function (t, e, r, u) {
      var a,
        h = !!u && !!u.unsafe,
        c = !!u && !!u.enumerable,
        d = !!u && !!u.noTargetGet;
      "function" == typeof r &&
        ("string" != typeof e || o(r, "name") || i(r, "name", e),
        (a = l(r)),
        a.source || (a.source = f.join("string" == typeof e ? e : ""))),
        t !== n
          ? (h ? !d && t[e] && (c = !0) : delete t[e],
            c ? (t[e] = r) : i(t, e, r))
          : c
          ? (t[e] = r)
          : s(e, r);
    })(Function.prototype, "toString", function () {
      return ("function" == typeof this && h(this).source) || u(this);
    });
  },
  "70c1": function (t, e, r) {
    "use strict";
    var n = r("4a87"),
      i = r("a6b6"),
      o = new n(0),
      s = new n(-1),
      u = {
        noether: "0",
        wei: "1",
        kwei: "1000",
        Kwei: "1000",
        babbage: "1000",
        femtoether: "1000",
        mwei: "1000000",
        Mwei: "1000000",
        lovelace: "1000000",
        picoether: "1000000",
        gwei: "1000000000",
        Gwei: "1000000000",
        shannon: "1000000000",
        nanoether: "1000000000",
        nano: "1000000000",
        szabo: "1000000000000",
        microether: "1000000000000",
        micro: "1000000000000",
        finney: "1000000000000000",
        milliether: "1000000000000000",
        milli: "1000000000000000",
        ether: "1000000000000000000",
        kether: "1000000000000000000000",
        grand: "1000000000000000000000",
        mether: "1000000000000000000000000",
        gether: "1000000000000000000000000000",
        tether: "1000000000000000000000000000000",
      };
    function a(t) {
      var e = t ? t.toLowerCase() : "ether",
        r = u[e];
      if ("string" !== typeof r)
        throw new Error(
          "[ethjs-unit] the unit provided " +
            t +
            " doesn't exists, please use the one of the following units " +
            JSON.stringify(u, null, 2)
        );
      return new n(r, 10);
    }
    function h(t) {
      if ("string" === typeof t) {
        if (!t.match(/^-?[0-9.]+$/))
          throw new Error(
            "while converting number to string, invalid number value '" +
              t +
              "', should be a number matching (^-?[0-9.]+)."
          );
        return t;
      }
      if ("number" === typeof t) return String(t);
      if (
        "object" === typeof t &&
        t.toString &&
        (t.toTwos || t.dividedToIntegerBy)
      )
        return t.toPrecision ? String(t.toPrecision()) : t.toString(10);
      throw new Error(
        "while converting number to string, invalid number value '" +
          t +
          "' type " +
          typeof t +
          "."
      );
    }
    function l(t, e, r) {
      var n = i(t),
        h = n.lt(o),
        l = a(e),
        f = u[e].length - 1 || 1,
        c = r || {};
      h && (n = n.mul(s));
      var d = n.mod(l).toString(10);
      while (d.length < f) d = "0" + d;
      c.pad || (d = d.match(/^([0-9]*[1-9]|0)(0*)/)[1]);
      var p = n.div(l).toString(10);
      c.commify && (p = p.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      var m = p + ("0" == d ? "" : "." + d);
      return h && (m = "-" + m), m;
    }
    function f(t, e) {
      var r = h(t),
        i = a(e),
        o = u[e].length - 1 || 1,
        l = "-" === r.substring(0, 1);
      if ((l && (r = r.substring(1)), "." === r))
        throw new Error(
          "[ethjs-unit] while converting number " + t + " to wei, invalid value"
        );
      var f = r.split(".");
      if (f.length > 2)
        throw new Error(
          "[ethjs-unit] while converting number " +
            t +
            " to wei,  too many decimal points"
        );
      var c = f[0],
        d = f[1];
      if ((c || (c = "0"), d || (d = "0"), d.length > o))
        throw new Error(
          "[ethjs-unit] while converting number " +
            t +
            " to wei, too many decimal places"
        );
      while (d.length < o) d += "0";
      (c = new n(c)), (d = new n(d));
      var p = c.mul(i).add(d);
      return l && (p = p.mul(s)), new n(p.toString(10), 10);
    }
    t.exports = {
      unitMap: u,
      numberToString: h,
      getValueOfUnit: a,
      fromWei: l,
      toWei: f,
    };
  },
  7418: function (t, e) {
    e.f = Object.getOwnPropertySymbols;
  },
  "746f": function (t, e, r) {
    var n = r("428f"),
      i = r("5135"),
      o = r("e538"),
      s = r("9bf2").f;
    t.exports = function (t) {
      var e = n.Symbol || (n.Symbol = {});
      i(e, t) || s(e, t, { value: o.f(t) });
    };
  },
  7839: function (t, e) {
    t.exports = [
      "constructor",
      "hasOwnProperty",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "toLocaleString",
      "toString",
      "valueOf",
    ];
  },
  "7b0b": function (t, e, r) {
    var n = r("1d80");
    t.exports = function (t) {
      return Object(n(t));
    };
  },
  "7b6b": function (t, e, r) {
    t.exports = r("9d46").version;
  },
  "7c73": function (t, e, r) {
    var n,
      i = r("825a"),
      o = r("37e8"),
      s = r("7839"),
      u = r("d012"),
      a = r("1be4"),
      h = r("cc12"),
      l = r("f772"),
      f = ">",
      c = "<",
      d = "prototype",
      p = "script",
      m = l("IE_PROTO"),
      v = function () {},
      g = function (t) {
        return c + p + f + t + c + "/" + p + f;
      },
      y = function (t) {
        t.write(g("")), t.close();
        var e = t.parentWindow.Object;
        return (t = null), e;
      },
      w = function () {
        var t,
          e = h("iframe"),
          r = "java" + p + ":";
        return (
          (e.style.display = "none"),
          a.appendChild(e),
          (e.src = String(r)),
          (t = e.contentWindow.document),
          t.open(),
          t.write(g("document.F=Object")),
          t.close(),
          t.F
        );
      },
      b = function () {
        try {
          n = document.domain && new ActiveXObject("htmlfile");
        } catch (e) {}
        b = n ? y(n) : w();
        var t = s.length;
        while (t--) delete b[d][s[t]];
        return b();
      };
    (u[m] = !0),
      (t.exports =
        Object.create ||
        function (t, e) {
          var r;
          return (
            null !== t
              ? ((v[d] = i(t)), (r = new v()), (v[d] = null), (r[m] = t))
              : (r = b()),
            void 0 === e ? r : o(r, e)
          );
        });
  },
  "7d72": function (t, e, r) {
    "use strict";
    var n = r("8707").Buffer,
      i =
        n.isEncoding ||
        function (t) {
          switch (((t = "" + t), t && t.toLowerCase())) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
            case "raw":
              return !0;
            default:
              return !1;
          }
        };
    function o(t) {
      if (!t) return "utf8";
      var e;
      while (1)
        switch (t) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return t;
          default:
            if (e) return;
            (t = ("" + t).toLowerCase()), (e = !0);
        }
    }
    function s(t) {
      var e = o(t);
      if ("string" !== typeof e && (n.isEncoding === i || !i(t)))
        throw new Error("Unknown encoding: " + t);
      return e || t;
    }
    function u(t) {
      var e;
      switch (((this.encoding = s(t)), this.encoding)) {
        case "utf16le":
          (this.text = p), (this.end = m), (e = 4);
          break;
        case "utf8":
          (this.fillLast = f), (e = 4);
          break;
        case "base64":
          (this.text = v), (this.end = g), (e = 3);
          break;
        default:
          return (this.write = y), void (this.end = w);
      }
      (this.lastNeed = 0),
        (this.lastTotal = 0),
        (this.lastChar = n.allocUnsafe(e));
    }
    function a(t) {
      return t <= 127
        ? 0
        : t >> 5 === 6
        ? 2
        : t >> 4 === 14
        ? 3
        : t >> 3 === 30
        ? 4
        : t >> 6 === 2
        ? -1
        : -2;
    }
    function h(t, e, r) {
      var n = e.length - 1;
      if (n < r) return 0;
      var i = a(e[n]);
      return i >= 0
        ? (i > 0 && (t.lastNeed = i - 1), i)
        : --n < r || -2 === i
        ? 0
        : ((i = a(e[n])),
          i >= 0
            ? (i > 0 && (t.lastNeed = i - 2), i)
            : --n < r || -2 === i
            ? 0
            : ((i = a(e[n])),
              i >= 0
                ? (i > 0 && (2 === i ? (i = 0) : (t.lastNeed = i - 3)), i)
                : 0));
    }
    function l(t, e, r) {
      if (128 !== (192 & e[0])) return (t.lastNeed = 0), "�";
      if (t.lastNeed > 1 && e.length > 1) {
        if (128 !== (192 & e[1])) return (t.lastNeed = 1), "�";
        if (t.lastNeed > 2 && e.length > 2 && 128 !== (192 & e[2]))
          return (t.lastNeed = 2), "�";
      }
    }
    function f(t) {
      var e = this.lastTotal - this.lastNeed,
        r = l(this, t, e);
      return void 0 !== r
        ? r
        : this.lastNeed <= t.length
        ? (t.copy(this.lastChar, e, 0, this.lastNeed),
          this.lastChar.toString(this.encoding, 0, this.lastTotal))
        : (t.copy(this.lastChar, e, 0, t.length),
          void (this.lastNeed -= t.length));
    }
    function c(t, e) {
      var r = h(this, t, e);
      if (!this.lastNeed) return t.toString("utf8", e);
      this.lastTotal = r;
      var n = t.length - (r - this.lastNeed);
      return t.copy(this.lastChar, 0, n), t.toString("utf8", e, n);
    }
    function d(t) {
      var e = t && t.length ? this.write(t) : "";
      return this.lastNeed ? e + "�" : e;
    }
    function p(t, e) {
      if ((t.length - e) % 2 === 0) {
        var r = t.toString("utf16le", e);
        if (r) {
          var n = r.charCodeAt(r.length - 1);
          if (n >= 55296 && n <= 56319)
            return (
              (this.lastNeed = 2),
              (this.lastTotal = 4),
              (this.lastChar[0] = t[t.length - 2]),
              (this.lastChar[1] = t[t.length - 1]),
              r.slice(0, -1)
            );
        }
        return r;
      }
      return (
        (this.lastNeed = 1),
        (this.lastTotal = 2),
        (this.lastChar[0] = t[t.length - 1]),
        t.toString("utf16le", e, t.length - 1)
      );
    }
    function m(t) {
      var e = t && t.length ? this.write(t) : "";
      if (this.lastNeed) {
        var r = this.lastTotal - this.lastNeed;
        return e + this.lastChar.toString("utf16le", 0, r);
      }
      return e;
    }
    function v(t, e) {
      var r = (t.length - e) % 3;
      return 0 === r
        ? t.toString("base64", e)
        : ((this.lastNeed = 3 - r),
          (this.lastTotal = 3),
          1 === r
            ? (this.lastChar[0] = t[t.length - 1])
            : ((this.lastChar[0] = t[t.length - 2]),
              (this.lastChar[1] = t[t.length - 1])),
          t.toString("base64", e, t.length - r));
    }
    function g(t) {
      var e = t && t.length ? this.write(t) : "";
      return this.lastNeed
        ? e + this.lastChar.toString("base64", 0, 3 - this.lastNeed)
        : e;
    }
    function y(t) {
      return t.toString(this.encoding);
    }
    function w(t) {
      return t && t.length ? this.write(t) : "";
    }
    (e.StringDecoder = u),
      (u.prototype.write = function (t) {
        if (0 === t.length) return "";
        var e, r;
        if (this.lastNeed) {
          if (((e = this.fillLast(t)), void 0 === e)) return "";
          (r = this.lastNeed), (this.lastNeed = 0);
        } else r = 0;
        return r < t.length
          ? e
            ? e + this.text(t, r)
            : this.text(t, r)
          : e || "";
      }),
      (u.prototype.end = d),
      (u.prototype.text = c),
      (u.prototype.fillLast = function (t) {
        if (this.lastNeed <= t.length)
          return (
            t.copy(
              this.lastChar,
              this.lastTotal - this.lastNeed,
              0,
              this.lastNeed
            ),
            this.lastChar.toString(this.encoding, 0, this.lastTotal)
          );
        t.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, t.length),
          (this.lastNeed -= t.length);
      });
  },
  "7d96": function (t, e) {
    var r = "0123456789abcdef".split(""),
      n = [1, 256, 65536, 16777216],
      i = [0, 8, 16, 24],
      o = [
        1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0,
        2147483649, 0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136,
        0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139, 2147483648, 32905,
        2147483648, 32771, 2147483648, 32770, 2147483648, 128, 2147483648,
        32778, 0, 2147483658, 2147483648, 2147516545, 2147483648, 32896,
        2147483648, 2147483649, 0, 2147516424, 2147483648,
      ],
      s = function (t) {
        return {
          blocks: [],
          reset: !0,
          block: 0,
          start: 0,
          blockCount: (1600 - (t << 1)) >> 5,
          outputBlocks: t >> 5,
          s: (function (t) {
            return [].concat(t, t, t, t, t);
          })([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        };
      },
      u = function (t, e) {
        var o,
          s = e.length,
          u = t.blocks,
          h = t.blockCount << 2,
          l = t.blockCount,
          f = t.outputBlocks,
          c = t.s,
          d = 0;
        while (d < s) {
          if (t.reset)
            for (t.reset = !1, u[0] = t.block, v = 1; v < l + 1; ++v) u[v] = 0;
          if ("string" !== typeof e)
            for (v = t.start; d < s && v < h; ++d)
              u[v >> 2] |= e[d] << i[3 & v++];
          else
            for (v = t.start; d < s && v < h; ++d)
              (o = e.charCodeAt(d)),
                o < 128
                  ? (u[v >> 2] |= o << i[3 & v++])
                  : o < 2048
                  ? ((u[v >> 2] |= (192 | (o >> 6)) << i[3 & v++]),
                    (u[v >> 2] |= (128 | (63 & o)) << i[3 & v++]))
                  : o < 55296 || o >= 57344
                  ? ((u[v >> 2] |= (224 | (o >> 12)) << i[3 & v++]),
                    (u[v >> 2] |= (128 | ((o >> 6) & 63)) << i[3 & v++]),
                    (u[v >> 2] |= (128 | (63 & o)) << i[3 & v++]))
                  : ((o =
                      65536 +
                      (((1023 & o) << 10) | (1023 & e.charCodeAt(++d)))),
                    (u[v >> 2] |= (240 | (o >> 18)) << i[3 & v++]),
                    (u[v >> 2] |= (128 | ((o >> 12) & 63)) << i[3 & v++]),
                    (u[v >> 2] |= (128 | ((o >> 6) & 63)) << i[3 & v++]),
                    (u[v >> 2] |= (128 | (63 & o)) << i[3 & v++]));
          if (((t.lastByteIndex = v), v >= h)) {
            for (t.start = v - h, t.block = u[l], v = 0; v < l; ++v)
              c[v] ^= u[v];
            a(c), (t.reset = !0);
          } else t.start = v;
        }
        if (
          ((v = t.lastByteIndex),
          (u[v >> 2] |= n[3 & v]),
          t.lastByteIndex === h)
        )
          for (u[0] = u[l], v = 1; v < l + 1; ++v) u[v] = 0;
        for (u[l - 1] |= 2147483648, v = 0; v < l; ++v) c[v] ^= u[v];
        a(c);
        var p,
          m = "",
          v = 0,
          g = 0;
        while (g < f) {
          for (v = 0; v < l && g < f; ++v, ++g)
            (p = c[v]),
              (m +=
                r[(p >> 4) & 15] +
                r[15 & p] +
                r[(p >> 12) & 15] +
                r[(p >> 8) & 15] +
                r[(p >> 20) & 15] +
                r[(p >> 16) & 15] +
                r[(p >> 28) & 15] +
                r[(p >> 24) & 15]);
          g % l === 0 && (a(c), (v = 0));
        }
        return "0x" + m;
      },
      a = function (t) {
        var e,
          r,
          n,
          i,
          s,
          u,
          a,
          h,
          l,
          f,
          c,
          d,
          p,
          m,
          v,
          g,
          y,
          w,
          b,
          M,
          _,
          x,
          S,
          E,
          A,
          k,
          O,
          T,
          R,
          C,
          j,
          N,
          L,
          P,
          I,
          B,
          q,
          U,
          H,
          D,
          F,
          z,
          Z,
          W,
          G,
          Y,
          $,
          X,
          V,
          J,
          K,
          Q,
          tt,
          et,
          rt,
          nt,
          it,
          ot,
          st,
          ut,
          at,
          ht,
          lt;
        for (n = 0; n < 48; n += 2)
          (i = t[0] ^ t[10] ^ t[20] ^ t[30] ^ t[40]),
            (s = t[1] ^ t[11] ^ t[21] ^ t[31] ^ t[41]),
            (u = t[2] ^ t[12] ^ t[22] ^ t[32] ^ t[42]),
            (a = t[3] ^ t[13] ^ t[23] ^ t[33] ^ t[43]),
            (h = t[4] ^ t[14] ^ t[24] ^ t[34] ^ t[44]),
            (l = t[5] ^ t[15] ^ t[25] ^ t[35] ^ t[45]),
            (f = t[6] ^ t[16] ^ t[26] ^ t[36] ^ t[46]),
            (c = t[7] ^ t[17] ^ t[27] ^ t[37] ^ t[47]),
            (d = t[8] ^ t[18] ^ t[28] ^ t[38] ^ t[48]),
            (p = t[9] ^ t[19] ^ t[29] ^ t[39] ^ t[49]),
            (e = d ^ ((u << 1) | (a >>> 31))),
            (r = p ^ ((a << 1) | (u >>> 31))),
            (t[0] ^= e),
            (t[1] ^= r),
            (t[10] ^= e),
            (t[11] ^= r),
            (t[20] ^= e),
            (t[21] ^= r),
            (t[30] ^= e),
            (t[31] ^= r),
            (t[40] ^= e),
            (t[41] ^= r),
            (e = i ^ ((h << 1) | (l >>> 31))),
            (r = s ^ ((l << 1) | (h >>> 31))),
            (t[2] ^= e),
            (t[3] ^= r),
            (t[12] ^= e),
            (t[13] ^= r),
            (t[22] ^= e),
            (t[23] ^= r),
            (t[32] ^= e),
            (t[33] ^= r),
            (t[42] ^= e),
            (t[43] ^= r),
            (e = u ^ ((f << 1) | (c >>> 31))),
            (r = a ^ ((c << 1) | (f >>> 31))),
            (t[4] ^= e),
            (t[5] ^= r),
            (t[14] ^= e),
            (t[15] ^= r),
            (t[24] ^= e),
            (t[25] ^= r),
            (t[34] ^= e),
            (t[35] ^= r),
            (t[44] ^= e),
            (t[45] ^= r),
            (e = h ^ ((d << 1) | (p >>> 31))),
            (r = l ^ ((p << 1) | (d >>> 31))),
            (t[6] ^= e),
            (t[7] ^= r),
            (t[16] ^= e),
            (t[17] ^= r),
            (t[26] ^= e),
            (t[27] ^= r),
            (t[36] ^= e),
            (t[37] ^= r),
            (t[46] ^= e),
            (t[47] ^= r),
            (e = f ^ ((i << 1) | (s >>> 31))),
            (r = c ^ ((s << 1) | (i >>> 31))),
            (t[8] ^= e),
            (t[9] ^= r),
            (t[18] ^= e),
            (t[19] ^= r),
            (t[28] ^= e),
            (t[29] ^= r),
            (t[38] ^= e),
            (t[39] ^= r),
            (t[48] ^= e),
            (t[49] ^= r),
            (m = t[0]),
            (v = t[1]),
            (Y = (t[11] << 4) | (t[10] >>> 28)),
            ($ = (t[10] << 4) | (t[11] >>> 28)),
            (T = (t[20] << 3) | (t[21] >>> 29)),
            (R = (t[21] << 3) | (t[20] >>> 29)),
            (ut = (t[31] << 9) | (t[30] >>> 23)),
            (at = (t[30] << 9) | (t[31] >>> 23)),
            (z = (t[40] << 18) | (t[41] >>> 14)),
            (Z = (t[41] << 18) | (t[40] >>> 14)),
            (P = (t[2] << 1) | (t[3] >>> 31)),
            (I = (t[3] << 1) | (t[2] >>> 31)),
            (g = (t[13] << 12) | (t[12] >>> 20)),
            (y = (t[12] << 12) | (t[13] >>> 20)),
            (X = (t[22] << 10) | (t[23] >>> 22)),
            (V = (t[23] << 10) | (t[22] >>> 22)),
            (C = (t[33] << 13) | (t[32] >>> 19)),
            (j = (t[32] << 13) | (t[33] >>> 19)),
            (ht = (t[42] << 2) | (t[43] >>> 30)),
            (lt = (t[43] << 2) | (t[42] >>> 30)),
            (et = (t[5] << 30) | (t[4] >>> 2)),
            (rt = (t[4] << 30) | (t[5] >>> 2)),
            (B = (t[14] << 6) | (t[15] >>> 26)),
            (q = (t[15] << 6) | (t[14] >>> 26)),
            (w = (t[25] << 11) | (t[24] >>> 21)),
            (b = (t[24] << 11) | (t[25] >>> 21)),
            (J = (t[34] << 15) | (t[35] >>> 17)),
            (K = (t[35] << 15) | (t[34] >>> 17)),
            (N = (t[45] << 29) | (t[44] >>> 3)),
            (L = (t[44] << 29) | (t[45] >>> 3)),
            (E = (t[6] << 28) | (t[7] >>> 4)),
            (A = (t[7] << 28) | (t[6] >>> 4)),
            (nt = (t[17] << 23) | (t[16] >>> 9)),
            (it = (t[16] << 23) | (t[17] >>> 9)),
            (U = (t[26] << 25) | (t[27] >>> 7)),
            (H = (t[27] << 25) | (t[26] >>> 7)),
            (M = (t[36] << 21) | (t[37] >>> 11)),
            (_ = (t[37] << 21) | (t[36] >>> 11)),
            (Q = (t[47] << 24) | (t[46] >>> 8)),
            (tt = (t[46] << 24) | (t[47] >>> 8)),
            (W = (t[8] << 27) | (t[9] >>> 5)),
            (G = (t[9] << 27) | (t[8] >>> 5)),
            (k = (t[18] << 20) | (t[19] >>> 12)),
            (O = (t[19] << 20) | (t[18] >>> 12)),
            (ot = (t[29] << 7) | (t[28] >>> 25)),
            (st = (t[28] << 7) | (t[29] >>> 25)),
            (D = (t[38] << 8) | (t[39] >>> 24)),
            (F = (t[39] << 8) | (t[38] >>> 24)),
            (x = (t[48] << 14) | (t[49] >>> 18)),
            (S = (t[49] << 14) | (t[48] >>> 18)),
            (t[0] = m ^ (~g & w)),
            (t[1] = v ^ (~y & b)),
            (t[10] = E ^ (~k & T)),
            (t[11] = A ^ (~O & R)),
            (t[20] = P ^ (~B & U)),
            (t[21] = I ^ (~q & H)),
            (t[30] = W ^ (~Y & X)),
            (t[31] = G ^ (~$ & V)),
            (t[40] = et ^ (~nt & ot)),
            (t[41] = rt ^ (~it & st)),
            (t[2] = g ^ (~w & M)),
            (t[3] = y ^ (~b & _)),
            (t[12] = k ^ (~T & C)),
            (t[13] = O ^ (~R & j)),
            (t[22] = B ^ (~U & D)),
            (t[23] = q ^ (~H & F)),
            (t[32] = Y ^ (~X & J)),
            (t[33] = $ ^ (~V & K)),
            (t[42] = nt ^ (~ot & ut)),
            (t[43] = it ^ (~st & at)),
            (t[4] = w ^ (~M & x)),
            (t[5] = b ^ (~_ & S)),
            (t[14] = T ^ (~C & N)),
            (t[15] = R ^ (~j & L)),
            (t[24] = U ^ (~D & z)),
            (t[25] = H ^ (~F & Z)),
            (t[34] = X ^ (~J & Q)),
            (t[35] = V ^ (~K & tt)),
            (t[44] = ot ^ (~ut & ht)),
            (t[45] = st ^ (~at & lt)),
            (t[6] = M ^ (~x & m)),
            (t[7] = _ ^ (~S & v)),
            (t[16] = C ^ (~N & E)),
            (t[17] = j ^ (~L & A)),
            (t[26] = D ^ (~z & P)),
            (t[27] = F ^ (~Z & I)),
            (t[36] = J ^ (~Q & W)),
            (t[37] = K ^ (~tt & G)),
            (t[46] = ut ^ (~ht & et)),
            (t[47] = at ^ (~lt & rt)),
            (t[8] = x ^ (~m & g)),
            (t[9] = S ^ (~v & y)),
            (t[18] = N ^ (~E & k)),
            (t[19] = L ^ (~A & O)),
            (t[28] = z ^ (~P & B)),
            (t[29] = Z ^ (~I & q)),
            (t[38] = Q ^ (~W & Y)),
            (t[39] = tt ^ (~G & $)),
            (t[48] = ht ^ (~et & nt)),
            (t[49] = lt ^ (~rt & it)),
            (t[0] ^= o[n]),
            (t[1] ^= o[n + 1]);
      },
      h = function (t) {
        return function (e) {
          var r;
          if ("0x" === e.slice(0, 2)) {
            r = [];
            for (var n = 2, i = e.length; n < i; n += 2)
              r.push(parseInt(e.slice(n, n + 2), 16));
          } else r = e;
          return u(s(t, t), r);
        };
      };
    t.exports = {
      keccak256: h(256),
      keccak512: h(512),
      keccak256s: h(256),
      keccak512s: h(512),
    };
  },
  "7dd0": function (t, e, r) {
    "use strict";
    var n = r("23e7"),
      i = r("9ed3"),
      o = r("e163"),
      s = r("d2bb"),
      u = r("d44e"),
      a = r("9112"),
      h = r("6eeb"),
      l = r("b622"),
      f = r("c430"),
      c = r("3f8c"),
      d = r("ae93"),
      p = d.IteratorPrototype,
      m = d.BUGGY_SAFARI_ITERATORS,
      v = l("iterator"),
      g = "keys",
      y = "values",
      w = "entries",
      b = function () {
        return this;
      };
    t.exports = function (t, e, r, l, d, M, _) {
      i(r, e, l);
      var x,
        S,
        E,
        A = function (t) {
          if (t === d && C) return C;
          if (!m && t in T) return T[t];
          switch (t) {
            case g:
              return function () {
                return new r(this, t);
              };
            case y:
              return function () {
                return new r(this, t);
              };
            case w:
              return function () {
                return new r(this, t);
              };
          }
          return function () {
            return new r(this);
          };
        },
        k = e + " Iterator",
        O = !1,
        T = t.prototype,
        R = T[v] || T["@@iterator"] || (d && T[d]),
        C = (!m && R) || A(d),
        j = ("Array" == e && T.entries) || R;
      if (
        (j &&
          ((x = o(j.call(new t()))),
          p !== Object.prototype &&
            x.next &&
            (f ||
              o(x) === p ||
              (s ? s(x, p) : "function" != typeof x[v] && a(x, v, b)),
            u(x, k, !0, !0),
            f && (c[k] = b))),
        d == y &&
          R &&
          R.name !== y &&
          ((O = !0),
          (C = function () {
            return R.call(this);
          })),
        (f && !_) || T[v] === C || a(T, v, C),
        (c[e] = C),
        d)
      )
        if (((S = { values: A(y), keys: M ? C : A(g), entries: A(w) }), _))
          for (E in S) (m || O || !(E in T)) && h(T, E, S[E]);
        else n({ target: e, proto: !0, forced: m || O }, S);
      return S;
    };
  },
  "7e84": function (t, e, r) {
    "use strict";
    r.d(e, "a", function () {
      return n;
    });
    r("3410"), r("131a");
    function n(t) {
      return (
        (n = Object.setPrototypeOf
          ? Object.getPrototypeOf
          : function (t) {
              return t.__proto__ || Object.getPrototypeOf(t);
            }),
        n(t)
      );
    }
  },
  "7f9a": function (t, e, r) {
    var n = r("da84"),
      i = r("8925"),
      o = n.WeakMap;
    t.exports = "function" === typeof o && /native code/.test(i(o));
  },
  "825a": function (t, e, r) {
    var n = r("861d");
    t.exports = function (t) {
      if (!n(t)) throw TypeError(String(t) + " is not an object");
      return t;
    };
  },
  "83ab": function (t, e, r) {
    var n = r("d039");
    t.exports = !n(function () {
      return (
        7 !=
        Object.defineProperty({}, 1, {
          get: function () {
            return 7;
          },
        })[1]
      );
    });
  },
  8418: function (t, e, r) {
    "use strict";
    var n = r("c04e"),
      i = r("9bf2"),
      o = r("5c6c");
    t.exports = function (t, e, r) {
      var s = n(e);
      s in t ? i.f(t, s, o(0, r)) : (t[s] = r);
    };
  },
  "85b1": function (t, e, r) {
    var n = r("5162");
    t.exports = function (t) {
      return "string" !== typeof t ? t : n(t) ? t.slice(2) : t;
    };
  },
  8602: function (t, e, r) {
    "use strict";
    function n(t) {
      for (var r in t) e.hasOwnProperty(r) || (e[r] = t[r]);
    }
    Object.defineProperty(e, "__esModule", { value: !0 }), n(r("37da"));
    var i = r("65eb");
    e.XMLHttpRequestEventTarget = i.XMLHttpRequestEventTarget;
  },
  "861d": function (t, e) {
    t.exports = function (t) {
      return "object" === typeof t ? null !== t : "function" === typeof t;
    };
  },
  8707: function (t, e, r) {
    /*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
    var n = r("1c35"),
      i = n.Buffer;
    function o(t, e) {
      for (var r in t) e[r] = t[r];
    }
    function s(t, e, r) {
      return i(t, e, r);
    }
    i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow
      ? (t.exports = n)
      : (o(n, e), (e.Buffer = s)),
      (s.prototype = Object.create(i.prototype)),
      o(i, s),
      (s.from = function (t, e, r) {
        if ("number" === typeof t)
          throw new TypeError("Argument must not be a number");
        return i(t, e, r);
      }),
      (s.alloc = function (t, e, r) {
        if ("number" !== typeof t)
          throw new TypeError("Argument must be a number");
        var n = i(t);
        return (
          void 0 !== e
            ? "string" === typeof r
              ? n.fill(e, r)
              : n.fill(e)
            : n.fill(0),
          n
        );
      }),
      (s.allocUnsafe = function (t) {
        if ("number" !== typeof t)
          throw new TypeError("Argument must be a number");
        return i(t);
      }),
      (s.allocUnsafeSlow = function (t) {
        if ("number" !== typeof t)
          throw new TypeError("Argument must be a number");
        return n.SlowBuffer(t);
      });
  },
  8925: function (t, e, r) {
    var n = r("c6cd"),
      i = Function.toString;
    "function" != typeof n.inspectSource &&
      (n.inspectSource = function (t) {
        return i.call(t);
      }),
      (t.exports = n.inspectSource);
  },
  "8aa5": function (t, e, r) {
    "use strict";
    var n = r("6547").charAt;
    t.exports = function (t, e, r) {
      return e + (r ? n(t, e).length : 1);
    };
  },
  "8b77": function (t, e, r) {
    "use strict";
    (function (e, n) {
      var i = r("966d");
      t.exports = _;
      var o,
        s = r("e3db");
      _.ReadableState = M;
      r("faa1").EventEmitter;
      var u = function (t, e) {
          return t.listeners(e).length;
        },
        a = r("1ad6"),
        h = r("9905").Buffer,
        l = e.Uint8Array || function () {};
      function f(t) {
        return h.from(t);
      }
      function c(t) {
        return h.isBuffer(t) || t instanceof l;
      }
      var d = Object.create(r("3a7c"));
      d.inherits = r("3fb5");
      var p = r(0),
        m = void 0;
      m = p && p.debuglog ? p.debuglog("stream") : function () {};
      var v,
        g = r("4365"),
        y = r("c69f");
      d.inherits(_, a);
      var w = ["error", "close", "destroy", "pause", "resume"];
      function b(t, e, r) {
        if ("function" === typeof t.prependListener)
          return t.prependListener(e, r);
        t._events && t._events[e]
          ? s(t._events[e])
            ? t._events[e].unshift(r)
            : (t._events[e] = [r, t._events[e]])
          : t.on(e, r);
      }
      function M(t, e) {
        (o = o || r("1715")), (t = t || {});
        var n = e instanceof o;
        (this.objectMode = !!t.objectMode),
          n && (this.objectMode = this.objectMode || !!t.readableObjectMode);
        var i = t.highWaterMark,
          s = t.readableHighWaterMark,
          u = this.objectMode ? 16 : 16384;
        (this.highWaterMark = i || 0 === i ? i : n && (s || 0 === s) ? s : u),
          (this.highWaterMark = Math.floor(this.highWaterMark)),
          (this.buffer = new g()),
          (this.length = 0),
          (this.pipes = null),
          (this.pipesCount = 0),
          (this.flowing = null),
          (this.ended = !1),
          (this.endEmitted = !1),
          (this.reading = !1),
          (this.sync = !0),
          (this.needReadable = !1),
          (this.emittedReadable = !1),
          (this.readableListening = !1),
          (this.resumeScheduled = !1),
          (this.destroyed = !1),
          (this.defaultEncoding = t.defaultEncoding || "utf8"),
          (this.awaitDrain = 0),
          (this.readingMore = !1),
          (this.decoder = null),
          (this.encoding = null),
          t.encoding &&
            (v || (v = r("7d72").StringDecoder),
            (this.decoder = new v(t.encoding)),
            (this.encoding = t.encoding));
      }
      function _(t) {
        if (((o = o || r("1715")), !(this instanceof _))) return new _(t);
        (this._readableState = new M(t, this)),
          (this.readable = !0),
          t &&
            ("function" === typeof t.read && (this._read = t.read),
            "function" === typeof t.destroy && (this._destroy = t.destroy)),
          a.call(this);
      }
      function x(t, e, r, n, i) {
        var o,
          s = t._readableState;
        null === e
          ? ((s.reading = !1), R(t, s))
          : (i || (o = E(s, e)),
            o
              ? t.emit("error", o)
              : s.objectMode || (e && e.length > 0)
              ? ("string" === typeof e ||
                  s.objectMode ||
                  Object.getPrototypeOf(e) === h.prototype ||
                  (e = f(e)),
                n
                  ? s.endEmitted
                    ? t.emit(
                        "error",
                        new Error("stream.unshift() after end event")
                      )
                    : S(t, s, e, !0)
                  : s.ended
                  ? t.emit("error", new Error("stream.push() after EOF"))
                  : ((s.reading = !1),
                    s.decoder && !r
                      ? ((e = s.decoder.write(e)),
                        s.objectMode || 0 !== e.length
                          ? S(t, s, e, !1)
                          : N(t, s))
                      : S(t, s, e, !1)))
              : n || (s.reading = !1));
        return A(s);
      }
      function S(t, e, r, n) {
        e.flowing && 0 === e.length && !e.sync
          ? (t.emit("data", r), t.read(0))
          : ((e.length += e.objectMode ? 1 : r.length),
            n ? e.buffer.unshift(r) : e.buffer.push(r),
            e.needReadable && C(t)),
          N(t, e);
      }
      function E(t, e) {
        var r;
        return (
          c(e) ||
            "string" === typeof e ||
            void 0 === e ||
            t.objectMode ||
            (r = new TypeError("Invalid non-string/buffer chunk")),
          r
        );
      }
      function A(t) {
        return (
          !t.ended &&
          (t.needReadable || t.length < t.highWaterMark || 0 === t.length)
        );
      }
      Object.defineProperty(_.prototype, "destroyed", {
        get: function () {
          return (
            void 0 !== this._readableState && this._readableState.destroyed
          );
        },
        set: function (t) {
          this._readableState && (this._readableState.destroyed = t);
        },
      }),
        (_.prototype.destroy = y.destroy),
        (_.prototype._undestroy = y.undestroy),
        (_.prototype._destroy = function (t, e) {
          this.push(null), e(t);
        }),
        (_.prototype.push = function (t, e) {
          var r,
            n = this._readableState;
          return (
            n.objectMode
              ? (r = !0)
              : "string" === typeof t &&
                ((e = e || n.defaultEncoding),
                e !== n.encoding && ((t = h.from(t, e)), (e = "")),
                (r = !0)),
            x(this, t, e, !1, r)
          );
        }),
        (_.prototype.unshift = function (t) {
          return x(this, t, null, !0, !1);
        }),
        (_.prototype.isPaused = function () {
          return !1 === this._readableState.flowing;
        }),
        (_.prototype.setEncoding = function (t) {
          return (
            v || (v = r("7d72").StringDecoder),
            (this._readableState.decoder = new v(t)),
            (this._readableState.encoding = t),
            this
          );
        });
      var k = 8388608;
      function O(t) {
        return (
          t >= k
            ? (t = k)
            : (t--,
              (t |= t >>> 1),
              (t |= t >>> 2),
              (t |= t >>> 4),
              (t |= t >>> 8),
              (t |= t >>> 16),
              t++),
          t
        );
      }
      function T(t, e) {
        return t <= 0 || (0 === e.length && e.ended)
          ? 0
          : e.objectMode
          ? 1
          : t !== t
          ? e.flowing && e.length
            ? e.buffer.head.data.length
            : e.length
          : (t > e.highWaterMark && (e.highWaterMark = O(t)),
            t <= e.length
              ? t
              : e.ended
              ? e.length
              : ((e.needReadable = !0), 0));
      }
      function R(t, e) {
        if (!e.ended) {
          if (e.decoder) {
            var r = e.decoder.end();
            r &&
              r.length &&
              (e.buffer.push(r), (e.length += e.objectMode ? 1 : r.length));
          }
          (e.ended = !0), C(t);
        }
      }
      function C(t) {
        var e = t._readableState;
        (e.needReadable = !1),
          e.emittedReadable ||
            (m("emitReadable", e.flowing),
            (e.emittedReadable = !0),
            e.sync ? i.nextTick(j, t) : j(t));
      }
      function j(t) {
        m("emit readable"), t.emit("readable"), U(t);
      }
      function N(t, e) {
        e.readingMore || ((e.readingMore = !0), i.nextTick(L, t, e));
      }
      function L(t, e) {
        var r = e.length;
        while (
          !e.reading &&
          !e.flowing &&
          !e.ended &&
          e.length < e.highWaterMark
        ) {
          if ((m("maybeReadMore read 0"), t.read(0), r === e.length)) break;
          r = e.length;
        }
        e.readingMore = !1;
      }
      function P(t) {
        return function () {
          var e = t._readableState;
          m("pipeOnDrain", e.awaitDrain),
            e.awaitDrain && e.awaitDrain--,
            0 === e.awaitDrain && u(t, "data") && ((e.flowing = !0), U(t));
        };
      }
      function I(t) {
        m("readable nexttick read 0"), t.read(0);
      }
      function B(t, e) {
        e.resumeScheduled || ((e.resumeScheduled = !0), i.nextTick(q, t, e));
      }
      function q(t, e) {
        e.reading || (m("resume read 0"), t.read(0)),
          (e.resumeScheduled = !1),
          (e.awaitDrain = 0),
          t.emit("resume"),
          U(t),
          e.flowing && !e.reading && t.read(0);
      }
      function U(t) {
        var e = t._readableState;
        m("flow", e.flowing);
        while (e.flowing && null !== t.read());
      }
      function H(t, e) {
        return 0 === e.length
          ? null
          : (e.objectMode
              ? (r = e.buffer.shift())
              : !t || t >= e.length
              ? ((r = e.decoder
                  ? e.buffer.join("")
                  : 1 === e.buffer.length
                  ? e.buffer.head.data
                  : e.buffer.concat(e.length)),
                e.buffer.clear())
              : (r = D(t, e.buffer, e.decoder)),
            r);
        var r;
      }
      function D(t, e, r) {
        var n;
        return (
          t < e.head.data.length
            ? ((n = e.head.data.slice(0, t)),
              (e.head.data = e.head.data.slice(t)))
            : (n =
                t === e.head.data.length ? e.shift() : r ? F(t, e) : z(t, e)),
          n
        );
      }
      function F(t, e) {
        var r = e.head,
          n = 1,
          i = r.data;
        t -= i.length;
        while ((r = r.next)) {
          var o = r.data,
            s = t > o.length ? o.length : t;
          if (
            (s === o.length ? (i += o) : (i += o.slice(0, t)),
            (t -= s),
            0 === t)
          ) {
            s === o.length
              ? (++n, r.next ? (e.head = r.next) : (e.head = e.tail = null))
              : ((e.head = r), (r.data = o.slice(s)));
            break;
          }
          ++n;
        }
        return (e.length -= n), i;
      }
      function z(t, e) {
        var r = h.allocUnsafe(t),
          n = e.head,
          i = 1;
        n.data.copy(r), (t -= n.data.length);
        while ((n = n.next)) {
          var o = n.data,
            s = t > o.length ? o.length : t;
          if ((o.copy(r, r.length - t, 0, s), (t -= s), 0 === t)) {
            s === o.length
              ? (++i, n.next ? (e.head = n.next) : (e.head = e.tail = null))
              : ((e.head = n), (n.data = o.slice(s)));
            break;
          }
          ++i;
        }
        return (e.length -= i), r;
      }
      function Z(t) {
        var e = t._readableState;
        if (e.length > 0)
          throw new Error('"endReadable()" called on non-empty stream');
        e.endEmitted || ((e.ended = !0), i.nextTick(W, e, t));
      }
      function W(t, e) {
        t.endEmitted ||
          0 !== t.length ||
          ((t.endEmitted = !0), (e.readable = !1), e.emit("end"));
      }
      function G(t, e) {
        for (var r = 0, n = t.length; r < n; r++) if (t[r] === e) return r;
        return -1;
      }
      (_.prototype.read = function (t) {
        m("read", t), (t = parseInt(t, 10));
        var e = this._readableState,
          r = t;
        if (
          (0 !== t && (e.emittedReadable = !1),
          0 === t && e.needReadable && (e.length >= e.highWaterMark || e.ended))
        )
          return (
            m("read: emitReadable", e.length, e.ended),
            0 === e.length && e.ended ? Z(this) : C(this),
            null
          );
        if (((t = T(t, e)), 0 === t && e.ended))
          return 0 === e.length && Z(this), null;
        var n,
          i = e.needReadable;
        return (
          m("need readable", i),
          (0 === e.length || e.length - t < e.highWaterMark) &&
            ((i = !0), m("length less than watermark", i)),
          e.ended || e.reading
            ? ((i = !1), m("reading or ended", i))
            : i &&
              (m("do read"),
              (e.reading = !0),
              (e.sync = !0),
              0 === e.length && (e.needReadable = !0),
              this._read(e.highWaterMark),
              (e.sync = !1),
              e.reading || (t = T(r, e))),
          (n = t > 0 ? H(t, e) : null),
          null === n ? ((e.needReadable = !0), (t = 0)) : (e.length -= t),
          0 === e.length &&
            (e.ended || (e.needReadable = !0), r !== t && e.ended && Z(this)),
          null !== n && this.emit("data", n),
          n
        );
      }),
        (_.prototype._read = function (t) {
          this.emit("error", new Error("_read() is not implemented"));
        }),
        (_.prototype.pipe = function (t, e) {
          var r = this,
            o = this._readableState;
          switch (o.pipesCount) {
            case 0:
              o.pipes = t;
              break;
            case 1:
              o.pipes = [o.pipes, t];
              break;
            default:
              o.pipes.push(t);
              break;
          }
          (o.pipesCount += 1), m("pipe count=%d opts=%j", o.pipesCount, e);
          var s = (!e || !1 !== e.end) && t !== n.stdout && t !== n.stderr,
            a = s ? l : M;
          function h(t, e) {
            m("onunpipe"),
              t === r && e && !1 === e.hasUnpiped && ((e.hasUnpiped = !0), d());
          }
          function l() {
            m("onend"), t.end();
          }
          o.endEmitted ? i.nextTick(a) : r.once("end", a), t.on("unpipe", h);
          var f = P(r);
          t.on("drain", f);
          var c = !1;
          function d() {
            m("cleanup"),
              t.removeListener("close", y),
              t.removeListener("finish", w),
              t.removeListener("drain", f),
              t.removeListener("error", g),
              t.removeListener("unpipe", h),
              r.removeListener("end", l),
              r.removeListener("end", M),
              r.removeListener("data", v),
              (c = !0),
              !o.awaitDrain ||
                (t._writableState && !t._writableState.needDrain) ||
                f();
          }
          var p = !1;
          function v(e) {
            m("ondata"), (p = !1);
            var n = t.write(e);
            !1 !== n ||
              p ||
              (((1 === o.pipesCount && o.pipes === t) ||
                (o.pipesCount > 1 && -1 !== G(o.pipes, t))) &&
                !c &&
                (m("false write response, pause", r._readableState.awaitDrain),
                r._readableState.awaitDrain++,
                (p = !0)),
              r.pause());
          }
          function g(e) {
            m("onerror", e),
              M(),
              t.removeListener("error", g),
              0 === u(t, "error") && t.emit("error", e);
          }
          function y() {
            t.removeListener("finish", w), M();
          }
          function w() {
            m("onfinish"), t.removeListener("close", y), M();
          }
          function M() {
            m("unpipe"), r.unpipe(t);
          }
          return (
            r.on("data", v),
            b(t, "error", g),
            t.once("close", y),
            t.once("finish", w),
            t.emit("pipe", r),
            o.flowing || (m("pipe resume"), r.resume()),
            t
          );
        }),
        (_.prototype.unpipe = function (t) {
          var e = this._readableState,
            r = { hasUnpiped: !1 };
          if (0 === e.pipesCount) return this;
          if (1 === e.pipesCount)
            return (
              (t && t !== e.pipes) ||
                (t || (t = e.pipes),
                (e.pipes = null),
                (e.pipesCount = 0),
                (e.flowing = !1),
                t && t.emit("unpipe", this, r)),
              this
            );
          if (!t) {
            var n = e.pipes,
              i = e.pipesCount;
            (e.pipes = null), (e.pipesCount = 0), (e.flowing = !1);
            for (var o = 0; o < i; o++) n[o].emit("unpipe", this, r);
            return this;
          }
          var s = G(e.pipes, t);
          return (
            -1 === s ||
              (e.pipes.splice(s, 1),
              (e.pipesCount -= 1),
              1 === e.pipesCount && (e.pipes = e.pipes[0]),
              t.emit("unpipe", this, r)),
            this
          );
        }),
        (_.prototype.on = function (t, e) {
          var r = a.prototype.on.call(this, t, e);
          if ("data" === t) !1 !== this._readableState.flowing && this.resume();
          else if ("readable" === t) {
            var n = this._readableState;
            n.endEmitted ||
              n.readableListening ||
              ((n.readableListening = n.needReadable = !0),
              (n.emittedReadable = !1),
              n.reading ? n.length && C(this) : i.nextTick(I, this));
          }
          return r;
        }),
        (_.prototype.addListener = _.prototype.on),
        (_.prototype.resume = function () {
          var t = this._readableState;
          return t.flowing || (m("resume"), (t.flowing = !0), B(this, t)), this;
        }),
        (_.prototype.pause = function () {
          return (
            m("call pause flowing=%j", this._readableState.flowing),
            !1 !== this._readableState.flowing &&
              (m("pause"),
              (this._readableState.flowing = !1),
              this.emit("pause")),
            this
          );
        }),
        (_.prototype.wrap = function (t) {
          var e = this,
            r = this._readableState,
            n = !1;
          for (var i in (t.on("end", function () {
            if ((m("wrapped end"), r.decoder && !r.ended)) {
              var t = r.decoder.end();
              t && t.length && e.push(t);
            }
            e.push(null);
          }),
          t.on("data", function (i) {
            if (
              (m("wrapped data"),
              r.decoder && (i = r.decoder.write(i)),
              (!r.objectMode || (null !== i && void 0 !== i)) &&
                (r.objectMode || (i && i.length)))
            ) {
              var o = e.push(i);
              o || ((n = !0), t.pause());
            }
          }),
          t))
            void 0 === this[i] &&
              "function" === typeof t[i] &&
              (this[i] = (function (e) {
                return function () {
                  return t[e].apply(t, arguments);
                };
              })(i));
          for (var o = 0; o < w.length; o++)
            t.on(w[o], this.emit.bind(this, w[o]));
          return (
            (this._read = function (e) {
              m("wrapped _read", e), n && ((n = !1), t.resume());
            }),
            this
          );
        }),
        Object.defineProperty(_.prototype, "readableHighWaterMark", {
          enumerable: !1,
          get: function () {
            return this._readableState.highWaterMark;
          },
        }),
        (_._fromList = H);
    }.call(this, r("c8ba"), r("2820")));
  },
  "8c05": function (t, e) {
    t.exports = {
      100: "Continue",
      101: "Switching Protocols",
      102: "Processing",
      200: "OK",
      201: "Created",
      202: "Accepted",
      203: "Non-Authoritative Information",
      204: "No Content",
      205: "Reset Content",
      206: "Partial Content",
      207: "Multi-Status",
      208: "Already Reported",
      226: "IM Used",
      300: "Multiple Choices",
      301: "Moved Permanently",
      302: "Found",
      303: "See Other",
      304: "Not Modified",
      305: "Use Proxy",
      307: "Temporary Redirect",
      308: "Permanent Redirect",
      400: "Bad Request",
      401: "Unauthorized",
      402: "Payment Required",
      403: "Forbidden",
      404: "Not Found",
      405: "Method Not Allowed",
      406: "Not Acceptable",
      407: "Proxy Authentication Required",
      408: "Request Timeout",
      409: "Conflict",
      410: "Gone",
      411: "Length Required",
      412: "Precondition Failed",
      413: "Payload Too Large",
      414: "URI Too Long",
      415: "Unsupported Media Type",
      416: "Range Not Satisfiable",
      417: "Expectation Failed",
      418: "I'm a teapot",
      421: "Misdirected Request",
      422: "Unprocessable Entity",
      423: "Locked",
      424: "Failed Dependency",
      425: "Unordered Collection",
      426: "Upgrade Required",
      428: "Precondition Required",
      429: "Too Many Requests",
      431: "Request Header Fields Too Large",
      451: "Unavailable For Legal Reasons",
      500: "Internal Server Error",
      501: "Not Implemented",
      502: "Bad Gateway",
      503: "Service Unavailable",
      504: "Gateway Timeout",
      505: "HTTP Version Not Supported",
      506: "Variant Also Negotiates",
      507: "Insufficient Storage",
      508: "Loop Detected",
      509: "Bandwidth Limit Exceeded",
      510: "Not Extended",
      511: "Network Authentication Required",
    };
  },
  "90e3": function (t, e) {
    var r = 0,
      n = Math.random();
    t.exports = function (t) {
      return (
        "Symbol(" +
        String(void 0 === t ? "" : t) +
        ")_" +
        (++r + n).toString(36)
      );
    };
  },
  9112: function (t, e, r) {
    var n = r("83ab"),
      i = r("9bf2"),
      o = r("5c6c");
    t.exports = n
      ? function (t, e, r) {
          return i.f(t, e, o(1, r));
        }
      : function (t, e, r) {
          return (t[e] = r), t;
        };
  },
  9152: function (t, e) {
    (e.read = function (t, e, r, n, i) {
      var o,
        s,
        u = 8 * i - n - 1,
        a = (1 << u) - 1,
        h = a >> 1,
        l = -7,
        f = r ? i - 1 : 0,
        c = r ? -1 : 1,
        d = t[e + f];
      for (
        f += c, o = d & ((1 << -l) - 1), d >>= -l, l += u;
        l > 0;
        o = 256 * o + t[e + f], f += c, l -= 8
      );
      for (
        s = o & ((1 << -l) - 1), o >>= -l, l += n;
        l > 0;
        s = 256 * s + t[e + f], f += c, l -= 8
      );
      if (0 === o) o = 1 - h;
      else {
        if (o === a) return s ? NaN : (1 / 0) * (d ? -1 : 1);
        (s += Math.pow(2, n)), (o -= h);
      }
      return (d ? -1 : 1) * s * Math.pow(2, o - n);
    }),
      (e.write = function (t, e, r, n, i, o) {
        var s,
          u,
          a,
          h = 8 * o - i - 1,
          l = (1 << h) - 1,
          f = l >> 1,
          c = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
          d = n ? 0 : o - 1,
          p = n ? 1 : -1,
          m = e < 0 || (0 === e && 1 / e < 0) ? 1 : 0;
        for (
          e = Math.abs(e),
            isNaN(e) || e === 1 / 0
              ? ((u = isNaN(e) ? 1 : 0), (s = l))
              : ((s = Math.floor(Math.log(e) / Math.LN2)),
                e * (a = Math.pow(2, -s)) < 1 && (s--, (a *= 2)),
                (e += s + f >= 1 ? c / a : c * Math.pow(2, 1 - f)),
                e * a >= 2 && (s++, (a /= 2)),
                s + f >= l
                  ? ((u = 0), (s = l))
                  : s + f >= 1
                  ? ((u = (e * a - 1) * Math.pow(2, i)), (s += f))
                  : ((u = e * Math.pow(2, f - 1) * Math.pow(2, i)), (s = 0)));
          i >= 8;
          t[r + d] = 255 & u, d += p, u /= 256, i -= 8
        );
        for (
          s = (s << i) | u, h += i;
          h > 0;
          t[r + d] = 255 & s, d += p, s /= 256, h -= 8
        );
        t[r + d - p] |= 128 * m;
      });
  },
  "91dd": function (t, e, r) {
    "use strict";
    function n(t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    }
    t.exports = function (t, e, r, o) {
      (e = e || "&"), (r = r || "=");
      var s = {};
      if ("string" !== typeof t || 0 === t.length) return s;
      var u = /\+/g;
      t = t.split(e);
      var a = 1e3;
      o && "number" === typeof o.maxKeys && (a = o.maxKeys);
      var h = t.length;
      a > 0 && h > a && (h = a);
      for (var l = 0; l < h; ++l) {
        var f,
          c,
          d,
          p,
          m = t[l].replace(u, "%20"),
          v = m.indexOf(r);
        v >= 0
          ? ((f = m.substr(0, v)), (c = m.substr(v + 1)))
          : ((f = m), (c = "")),
          (d = decodeURIComponent(f)),
          (p = decodeURIComponent(c)),
          n(s, d) ? (i(s[d]) ? s[d].push(p) : (s[d] = [s[d], p])) : (s[d] = p);
      }
      return s;
    };
    var i =
      Array.isArray ||
      function (t) {
        return "[object Array]" === Object.prototype.toString.call(t);
      };
  },
  "925e": function (t, e, r) {
    (function (e, n, i) {
      var o = r("a9f1"),
        s = r("3fb5"),
        u = r("c90b"),
        a = r("3d1b"),
        h = r("d938"),
        l = u.IncomingMessage,
        f = u.readyStates;
      function c(t, e) {
        return o.fetch && e
          ? "fetch"
          : o.mozchunkedarraybuffer
          ? "moz-chunked-arraybuffer"
          : o.msstream
          ? "ms-stream"
          : o.arraybuffer && t
          ? "arraybuffer"
          : o.vbArray && t
          ? "text:vbarray"
          : "text";
      }
      var d = (t.exports = function (t) {
        var r,
          n = this;
        a.Writable.call(n),
          (n._opts = t),
          (n._body = []),
          (n._headers = {}),
          t.auth &&
            n.setHeader(
              "Authorization",
              "Basic " + new e(t.auth).toString("base64")
            ),
          Object.keys(t.headers).forEach(function (e) {
            n.setHeader(e, t.headers[e]);
          });
        var i = !0;
        if (
          "disable-fetch" === t.mode ||
          ("requestTimeout" in t && !o.abortController)
        )
          (i = !1), (r = !0);
        else if ("prefer-streaming" === t.mode) r = !1;
        else if ("allow-wrong-content-type" === t.mode) r = !o.overrideMimeType;
        else {
          if (t.mode && "default" !== t.mode && "prefer-fast" !== t.mode)
            throw new Error("Invalid value for opts.mode");
          r = !0;
        }
        (n._mode = c(r, i)),
          (n._fetchTimer = null),
          n.on("finish", function () {
            n._onFinish();
          });
      });
      function p(t) {
        try {
          var e = t.status;
          return null !== e && 0 !== e;
        } catch (r) {
          return !1;
        }
      }
      s(d, a.Writable),
        (d.prototype.setHeader = function (t, e) {
          var r = this,
            n = t.toLowerCase();
          -1 === m.indexOf(n) && (r._headers[n] = { name: t, value: e });
        }),
        (d.prototype.getHeader = function (t) {
          var e = this._headers[t.toLowerCase()];
          return e ? e.value : null;
        }),
        (d.prototype.removeHeader = function (t) {
          var e = this;
          delete e._headers[t.toLowerCase()];
        }),
        (d.prototype._onFinish = function () {
          var t = this;
          if (!t._destroyed) {
            var r = t._opts,
              s = t._headers,
              u = null;
            "GET" !== r.method &&
              "HEAD" !== r.method &&
              (u = o.arraybuffer
                ? h(e.concat(t._body))
                : o.blobConstructor
                ? new n.Blob(
                    t._body.map(function (t) {
                      return h(t);
                    }),
                    { type: (s["content-type"] || {}).value || "" }
                  )
                : e.concat(t._body).toString());
            var a = [];
            if (
              (Object.keys(s).forEach(function (t) {
                var e = s[t].name,
                  r = s[t].value;
                Array.isArray(r)
                  ? r.forEach(function (t) {
                      a.push([e, t]);
                    })
                  : a.push([e, r]);
              }),
              "fetch" === t._mode)
            ) {
              var l = null;
              if (o.abortController) {
                var c = new AbortController();
                (l = c.signal),
                  (t._fetchAbortController = c),
                  "requestTimeout" in r &&
                    0 !== r.requestTimeout &&
                    (t._fetchTimer = n.setTimeout(function () {
                      t.emit("requestTimeout"),
                        t._fetchAbortController &&
                          t._fetchAbortController.abort();
                    }, r.requestTimeout));
              }
              n.fetch(t._opts.url, {
                method: t._opts.method,
                headers: a,
                body: u || void 0,
                mode: "cors",
                credentials: r.withCredentials ? "include" : "same-origin",
                signal: l,
              }).then(
                function (e) {
                  (t._fetchResponse = e), t._connect();
                },
                function (e) {
                  n.clearTimeout(t._fetchTimer),
                    t._destroyed || t.emit("error", e);
                }
              );
            } else {
              var d = (t._xhr = new n.XMLHttpRequest());
              try {
                d.open(t._opts.method, t._opts.url, !0);
              } catch (p) {
                return void i.nextTick(function () {
                  t.emit("error", p);
                });
              }
              "responseType" in d && (d.responseType = t._mode.split(":")[0]),
                "withCredentials" in d &&
                  (d.withCredentials = !!r.withCredentials),
                "text" === t._mode &&
                  "overrideMimeType" in d &&
                  d.overrideMimeType("text/plain; charset=x-user-defined"),
                "requestTimeout" in r &&
                  ((d.timeout = r.requestTimeout),
                  (d.ontimeout = function () {
                    t.emit("requestTimeout");
                  })),
                a.forEach(function (t) {
                  d.setRequestHeader(t[0], t[1]);
                }),
                (t._response = null),
                (d.onreadystatechange = function () {
                  switch (d.readyState) {
                    case f.LOADING:
                    case f.DONE:
                      t._onXHRProgress();
                      break;
                  }
                }),
                "moz-chunked-arraybuffer" === t._mode &&
                  (d.onprogress = function () {
                    t._onXHRProgress();
                  }),
                (d.onerror = function () {
                  t._destroyed || t.emit("error", new Error("XHR error"));
                });
              try {
                d.send(u);
              } catch (p) {
                return void i.nextTick(function () {
                  t.emit("error", p);
                });
              }
            }
          }
        }),
        (d.prototype._onXHRProgress = function () {
          var t = this;
          p(t._xhr) &&
            !t._destroyed &&
            (t._response || t._connect(), t._response._onXHRProgress());
        }),
        (d.prototype._connect = function () {
          var t = this;
          t._destroyed ||
            ((t._response = new l(
              t._xhr,
              t._fetchResponse,
              t._mode,
              t._fetchTimer
            )),
            t._response.on("error", function (e) {
              t.emit("error", e);
            }),
            t.emit("response", t._response));
        }),
        (d.prototype._write = function (t, e, r) {
          var n = this;
          n._body.push(t), r();
        }),
        (d.prototype.abort = d.prototype.destroy =
          function () {
            var t = this;
            (t._destroyed = !0),
              n.clearTimeout(t._fetchTimer),
              t._response && (t._response._destroyed = !0),
              t._xhr
                ? t._xhr.abort()
                : t._fetchAbortController && t._fetchAbortController.abort();
          }),
        (d.prototype.end = function (t, e, r) {
          var n = this;
          "function" === typeof t && ((r = t), (t = void 0)),
            a.Writable.prototype.end.call(n, t, e, r);
        }),
        (d.prototype.flushHeaders = function () {}),
        (d.prototype.setTimeout = function () {}),
        (d.prototype.setNoDelay = function () {}),
        (d.prototype.setSocketKeepAlive = function () {});
      var m = [
        "accept-charset",
        "accept-encoding",
        "access-control-request-headers",
        "access-control-request-method",
        "connection",
        "content-length",
        "cookie",
        "cookie2",
        "date",
        "dnt",
        "expect",
        "host",
        "keep-alive",
        "origin",
        "referer",
        "te",
        "trailer",
        "transfer-encoding",
        "upgrade",
        "via",
      ];
    }.call(this, r("1c35").Buffer, r("c8ba"), r("2820")));
  },
  92631: function (t, e, r) {
    "use strict";
    var n = r("ad6d"),
      i = r("9f7f"),
      o = RegExp.prototype.exec,
      s = String.prototype.replace,
      u = o,
      a = (function () {
        var t = /a/,
          e = /b*/g;
        return (
          o.call(t, "a"), o.call(e, "a"), 0 !== t.lastIndex || 0 !== e.lastIndex
        );
      })(),
      h = i.UNSUPPORTED_Y || i.BROKEN_CARET,
      l = void 0 !== /()??/.exec("")[1],
      f = a || l || h;
    f &&
      (u = function (t) {
        var e,
          r,
          i,
          u,
          f = this,
          c = h && f.sticky,
          d = n.call(f),
          p = f.source,
          m = 0,
          v = t;
        return (
          c &&
            ((d = d.replace("y", "")),
            -1 === d.indexOf("g") && (d += "g"),
            (v = String(t).slice(f.lastIndex)),
            f.lastIndex > 0 &&
              (!f.multiline || (f.multiline && "\n" !== t[f.lastIndex - 1])) &&
              ((p = "(?: " + p + ")"), (v = " " + v), m++),
            (r = new RegExp("^(?:" + p + ")", d))),
          l && (r = new RegExp("^" + p + "$(?!\\s)", d)),
          a && (e = f.lastIndex),
          (i = o.call(c ? r : f, v)),
          c
            ? i
              ? ((i.input = i.input.slice(m)),
                (i[0] = i[0].slice(m)),
                (i.index = f.lastIndex),
                (f.lastIndex += i[0].length))
              : (f.lastIndex = 0)
            : a && i && (f.lastIndex = f.global ? i.index + i[0].length : e),
          l &&
            i &&
            i.length > 1 &&
            s.call(i[0], r, function () {
              for (u = 1; u < arguments.length - 2; u++)
                void 0 === arguments[u] && (i[u] = void 0);
            }),
          i
        );
      }),
      (t.exports = u);
  },
  9490: function (t, e, r) {
    (function (t) {
      var n = r("925e"),
        i = r("c90b"),
        o = r("53a8"),
        s = r("8c05"),
        u = r("0b16"),
        a = e;
      (a.request = function (e, r) {
        e = "string" === typeof e ? u.parse(e) : o(e);
        var i = -1 === t.location.protocol.search(/^https?:$/) ? "http:" : "",
          s = e.protocol || i,
          a = e.hostname || e.host,
          h = e.port,
          l = e.path || "/";
        a && -1 !== a.indexOf(":") && (a = "[" + a + "]"),
          (e.url = (a ? s + "//" + a : "") + (h ? ":" + h : "") + l),
          (e.method = (e.method || "GET").toUpperCase()),
          (e.headers = e.headers || {});
        var f = new n(e);
        return r && f.on("response", r), f;
      }),
        (a.get = function (t, e) {
          var r = a.request(t, e);
          return r.end(), r;
        }),
        (a.ClientRequest = n),
        (a.IncomingMessage = i.IncomingMessage),
        (a.Agent = function () {}),
        (a.Agent.defaultMaxSockets = 4),
        (a.globalAgent = new a.Agent()),
        (a.STATUS_CODES = s),
        (a.METHODS = [
          "CHECKOUT",
          "CONNECT",
          "COPY",
          "DELETE",
          "GET",
          "HEAD",
          "LOCK",
          "M-SEARCH",
          "MERGE",
          "MKACTIVITY",
          "MKCOL",
          "MOVE",
          "NOTIFY",
          "OPTIONS",
          "PATCH",
          "POST",
          "PROPFIND",
          "PROPPATCH",
          "PURGE",
          "PUT",
          "REPORT",
          "SEARCH",
          "SUBSCRIBE",
          "TRACE",
          "UNLOCK",
          "UNSUBSCRIBE",
        ]);
    }.call(this, r("c8ba")));
  },
  "94ca": function (t, e, r) {
    var n = r("d039"),
      i = /#|\.prototype\./,
      o = function (t, e) {
        var r = u[s(t)];
        return r == h || (r != a && ("function" == typeof e ? n(e) : !!e));
      },
      s = (o.normalize = function (t) {
        return String(t).replace(i, ".").toLowerCase();
      }),
      u = (o.data = {}),
      a = (o.NATIVE = "N"),
      h = (o.POLYFILL = "P");
    t.exports = o;
  },
  "966d": function (t, e, r) {
    "use strict";
    (function (e) {
      function r(t, r, n, i) {
        if ("function" !== typeof t)
          throw new TypeError('"callback" argument must be a function');
        var o,
          s,
          u = arguments.length;
        switch (u) {
          case 0:
          case 1:
            return e.nextTick(t);
          case 2:
            return e.nextTick(function () {
              t.call(null, r);
            });
          case 3:
            return e.nextTick(function () {
              t.call(null, r, n);
            });
          case 4:
            return e.nextTick(function () {
              t.call(null, r, n, i);
            });
          default:
            (o = new Array(u - 1)), (s = 0);
            while (s < o.length) o[s++] = arguments[s];
            return e.nextTick(function () {
              t.apply(null, o);
            });
        }
      }
      "undefined" === typeof e ||
      !e.version ||
      0 === e.version.indexOf("v0.") ||
      (0 === e.version.indexOf("v1.") && 0 !== e.version.indexOf("v1.8."))
        ? (t.exports = { nextTick: r })
        : (t.exports = e);
    }.call(this, r("2820")));
  },
  "96cf": function (t, e, r) {
    var n = (function (t) {
      "use strict";
      var e,
        r = Object.prototype,
        n = r.hasOwnProperty,
        i = "function" === typeof Symbol ? Symbol : {},
        o = i.iterator || "@@iterator",
        s = i.asyncIterator || "@@asyncIterator",
        u = i.toStringTag || "@@toStringTag";
      function a(t, e, r) {
        return (
          Object.defineProperty(t, e, {
            value: r,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          }),
          t[e]
        );
      }
      try {
        a({}, "");
      } catch (j) {
        a = function (t, e, r) {
          return (t[e] = r);
        };
      }
      function h(t, e, r, n) {
        var i = e && e.prototype instanceof v ? e : v,
          o = Object.create(i.prototype),
          s = new T(n || []);
        return (o._invoke = E(t, r, s)), o;
      }
      function l(t, e, r) {
        try {
          return { type: "normal", arg: t.call(e, r) };
        } catch (j) {
          return { type: "throw", arg: j };
        }
      }
      t.wrap = h;
      var f = "suspendedStart",
        c = "suspendedYield",
        d = "executing",
        p = "completed",
        m = {};
      function v() {}
      function g() {}
      function y() {}
      var w = {};
      w[o] = function () {
        return this;
      };
      var b = Object.getPrototypeOf,
        M = b && b(b(R([])));
      M && M !== r && n.call(M, o) && (w = M);
      var _ = (y.prototype = v.prototype = Object.create(w));
      function x(t) {
        ["next", "throw", "return"].forEach(function (e) {
          a(t, e, function (t) {
            return this._invoke(e, t);
          });
        });
      }
      function S(t, e) {
        function r(i, o, s, u) {
          var a = l(t[i], t, o);
          if ("throw" !== a.type) {
            var h = a.arg,
              f = h.value;
            return f && "object" === typeof f && n.call(f, "__await")
              ? e.resolve(f.__await).then(
                  function (t) {
                    r("next", t, s, u);
                  },
                  function (t) {
                    r("throw", t, s, u);
                  }
                )
              : e.resolve(f).then(
                  function (t) {
                    (h.value = t), s(h);
                  },
                  function (t) {
                    return r("throw", t, s, u);
                  }
                );
          }
          u(a.arg);
        }
        var i;
        function o(t, n) {
          function o() {
            return new e(function (e, i) {
              r(t, n, e, i);
            });
          }
          return (i = i ? i.then(o, o) : o());
        }
        this._invoke = o;
      }
      function E(t, e, r) {
        var n = f;
        return function (i, o) {
          if (n === d) throw new Error("Generator is already running");
          if (n === p) {
            if ("throw" === i) throw o;
            return C();
          }
          (r.method = i), (r.arg = o);
          while (1) {
            var s = r.delegate;
            if (s) {
              var u = A(s, r);
              if (u) {
                if (u === m) continue;
                return u;
              }
            }
            if ("next" === r.method) r.sent = r._sent = r.arg;
            else if ("throw" === r.method) {
              if (n === f) throw ((n = p), r.arg);
              r.dispatchException(r.arg);
            } else "return" === r.method && r.abrupt("return", r.arg);
            n = d;
            var a = l(t, e, r);
            if ("normal" === a.type) {
              if (((n = r.done ? p : c), a.arg === m)) continue;
              return { value: a.arg, done: r.done };
            }
            "throw" === a.type &&
              ((n = p), (r.method = "throw"), (r.arg = a.arg));
          }
        };
      }
      function A(t, r) {
        var n = t.iterator[r.method];
        if (n === e) {
          if (((r.delegate = null), "throw" === r.method)) {
            if (
              t.iterator["return"] &&
              ((r.method = "return"),
              (r.arg = e),
              A(t, r),
              "throw" === r.method)
            )
              return m;
            (r.method = "throw"),
              (r.arg = new TypeError(
                "The iterator does not provide a 'throw' method"
              ));
          }
          return m;
        }
        var i = l(n, t.iterator, r.arg);
        if ("throw" === i.type)
          return (r.method = "throw"), (r.arg = i.arg), (r.delegate = null), m;
        var o = i.arg;
        return o
          ? o.done
            ? ((r[t.resultName] = o.value),
              (r.next = t.nextLoc),
              "return" !== r.method && ((r.method = "next"), (r.arg = e)),
              (r.delegate = null),
              m)
            : o
          : ((r.method = "throw"),
            (r.arg = new TypeError("iterator result is not an object")),
            (r.delegate = null),
            m);
      }
      function k(t) {
        var e = { tryLoc: t[0] };
        1 in t && (e.catchLoc = t[1]),
          2 in t && ((e.finallyLoc = t[2]), (e.afterLoc = t[3])),
          this.tryEntries.push(e);
      }
      function O(t) {
        var e = t.completion || {};
        (e.type = "normal"), delete e.arg, (t.completion = e);
      }
      function T(t) {
        (this.tryEntries = [{ tryLoc: "root" }]),
          t.forEach(k, this),
          this.reset(!0);
      }
      function R(t) {
        if (t) {
          var r = t[o];
          if (r) return r.call(t);
          if ("function" === typeof t.next) return t;
          if (!isNaN(t.length)) {
            var i = -1,
              s = function r() {
                while (++i < t.length)
                  if (n.call(t, i)) return (r.value = t[i]), (r.done = !1), r;
                return (r.value = e), (r.done = !0), r;
              };
            return (s.next = s);
          }
        }
        return { next: C };
      }
      function C() {
        return { value: e, done: !0 };
      }
      return (
        (g.prototype = _.constructor = y),
        (y.constructor = g),
        (g.displayName = a(y, u, "GeneratorFunction")),
        (t.isGeneratorFunction = function (t) {
          var e = "function" === typeof t && t.constructor;
          return (
            !!e &&
            (e === g || "GeneratorFunction" === (e.displayName || e.name))
          );
        }),
        (t.mark = function (t) {
          return (
            Object.setPrototypeOf
              ? Object.setPrototypeOf(t, y)
              : ((t.__proto__ = y), a(t, u, "GeneratorFunction")),
            (t.prototype = Object.create(_)),
            t
          );
        }),
        (t.awrap = function (t) {
          return { __await: t };
        }),
        x(S.prototype),
        (S.prototype[s] = function () {
          return this;
        }),
        (t.AsyncIterator = S),
        (t.async = function (e, r, n, i, o) {
          void 0 === o && (o = Promise);
          var s = new S(h(e, r, n, i), o);
          return t.isGeneratorFunction(r)
            ? s
            : s.next().then(function (t) {
                return t.done ? t.value : s.next();
              });
        }),
        x(_),
        a(_, u, "Generator"),
        (_[o] = function () {
          return this;
        }),
        (_.toString = function () {
          return "[object Generator]";
        }),
        (t.keys = function (t) {
          var e = [];
          for (var r in t) e.push(r);
          return (
            e.reverse(),
            function r() {
              while (e.length) {
                var n = e.pop();
                if (n in t) return (r.value = n), (r.done = !1), r;
              }
              return (r.done = !0), r;
            }
          );
        }),
        (t.values = R),
        (T.prototype = {
          constructor: T,
          reset: function (t) {
            if (
              ((this.prev = 0),
              (this.next = 0),
              (this.sent = this._sent = e),
              (this.done = !1),
              (this.delegate = null),
              (this.method = "next"),
              (this.arg = e),
              this.tryEntries.forEach(O),
              !t)
            )
              for (var r in this)
                "t" === r.charAt(0) &&
                  n.call(this, r) &&
                  !isNaN(+r.slice(1)) &&
                  (this[r] = e);
          },
          stop: function () {
            this.done = !0;
            var t = this.tryEntries[0],
              e = t.completion;
            if ("throw" === e.type) throw e.arg;
            return this.rval;
          },
          dispatchException: function (t) {
            if (this.done) throw t;
            var r = this;
            function i(n, i) {
              return (
                (u.type = "throw"),
                (u.arg = t),
                (r.next = n),
                i && ((r.method = "next"), (r.arg = e)),
                !!i
              );
            }
            for (var o = this.tryEntries.length - 1; o >= 0; --o) {
              var s = this.tryEntries[o],
                u = s.completion;
              if ("root" === s.tryLoc) return i("end");
              if (s.tryLoc <= this.prev) {
                var a = n.call(s, "catchLoc"),
                  h = n.call(s, "finallyLoc");
                if (a && h) {
                  if (this.prev < s.catchLoc) return i(s.catchLoc, !0);
                  if (this.prev < s.finallyLoc) return i(s.finallyLoc);
                } else if (a) {
                  if (this.prev < s.catchLoc) return i(s.catchLoc, !0);
                } else {
                  if (!h)
                    throw new Error("try statement without catch or finally");
                  if (this.prev < s.finallyLoc) return i(s.finallyLoc);
                }
              }
            }
          },
          abrupt: function (t, e) {
            for (var r = this.tryEntries.length - 1; r >= 0; --r) {
              var i = this.tryEntries[r];
              if (
                i.tryLoc <= this.prev &&
                n.call(i, "finallyLoc") &&
                this.prev < i.finallyLoc
              ) {
                var o = i;
                break;
              }
            }
            o &&
              ("break" === t || "continue" === t) &&
              o.tryLoc <= e &&
              e <= o.finallyLoc &&
              (o = null);
            var s = o ? o.completion : {};
            return (
              (s.type = t),
              (s.arg = e),
              o
                ? ((this.method = "next"), (this.next = o.finallyLoc), m)
                : this.complete(s)
            );
          },
          complete: function (t, e) {
            if ("throw" === t.type) throw t.arg;
            return (
              "break" === t.type || "continue" === t.type
                ? (this.next = t.arg)
                : "return" === t.type
                ? ((this.rval = this.arg = t.arg),
                  (this.method = "return"),
                  (this.next = "end"))
                : "normal" === t.type && e && (this.next = e),
              m
            );
          },
          finish: function (t) {
            for (var e = this.tryEntries.length - 1; e >= 0; --e) {
              var r = this.tryEntries[e];
              if (r.finallyLoc === t)
                return this.complete(r.completion, r.afterLoc), O(r), m;
            }
          },
          catch: function (t) {
            for (var e = this.tryEntries.length - 1; e >= 0; --e) {
              var r = this.tryEntries[e];
              if (r.tryLoc === t) {
                var n = r.completion;
                if ("throw" === n.type) {
                  var i = n.arg;
                  O(r);
                }
                return i;
              }
            }
            throw new Error("illegal catch attempt");
          },
          delegateYield: function (t, r, n) {
            return (
              (this.delegate = { iterator: R(t), resultName: r, nextLoc: n }),
              "next" === this.method && (this.arg = e),
              m
            );
          },
        }),
        t
      );
    })(t.exports);
    try {
      regeneratorRuntime = n;
    } catch (i) {
      Function("r", "regeneratorRuntime = r")(n);
    }
  },
  9905: function (t, e, r) {
    var n = r("1c35"),
      i = n.Buffer;
    function o(t, e) {
      for (var r in t) e[r] = t[r];
    }
    function s(t, e, r) {
      return i(t, e, r);
    }
    i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow
      ? (t.exports = n)
      : (o(n, e), (e.Buffer = s)),
      o(i, s),
      (s.from = function (t, e, r) {
        if ("number" === typeof t)
          throw new TypeError("Argument must not be a number");
        return i(t, e, r);
      }),
      (s.alloc = function (t, e, r) {
        if ("number" !== typeof t)
          throw new TypeError("Argument must be a number");
        var n = i(t);
        return (
          void 0 !== e
            ? "string" === typeof r
              ? n.fill(e, r)
              : n.fill(e)
            : n.fill(0),
          n
        );
      }),
      (s.allocUnsafe = function (t) {
        if ("number" !== typeof t)
          throw new TypeError("Argument must be a number");
        return i(t);
      }),
      (s.allocUnsafeSlow = function (t) {
        if ("number" !== typeof t)
          throw new TypeError("Argument must be a number");
        return n.SlowBuffer(t);
      });
  },
  "99af": function (t, e, r) {
    "use strict";
    var n = r("23e7"),
      i = r("d039"),
      o = r("e8b5"),
      s = r("861d"),
      u = r("7b0b"),
      a = r("50c4"),
      h = r("8418"),
      l = r("65f0"),
      f = r("1dde"),
      c = r("b622"),
      d = r("2d00"),
      p = c("isConcatSpreadable"),
      m = 9007199254740991,
      v = "Maximum allowed index exceeded",
      g =
        d >= 51 ||
        !i(function () {
          var t = [];
          return (t[p] = !1), t.concat()[0] !== t;
        }),
      y = f("concat"),
      w = function (t) {
        if (!s(t)) return !1;
        var e = t[p];
        return void 0 !== e ? !!e : o(t);
      },
      b = !g || !y;
    n(
      { target: "Array", proto: !0, forced: b },
      {
        concat: function (t) {
          var e,
            r,
            n,
            i,
            o,
            s = u(this),
            f = l(s, 0),
            c = 0;
          for (e = -1, n = arguments.length; e < n; e++)
            if (((o = -1 === e ? s : arguments[e]), w(o))) {
              if (((i = a(o.length)), c + i > m)) throw TypeError(v);
              for (r = 0; r < i; r++, c++) r in o && h(f, c, o[r]);
            } else {
              if (c >= m) throw TypeError(v);
              h(f, c++, o);
            }
          return (f.length = c), f;
        },
      }
    );
  },
  "99de": function (t, e, r) {
    "use strict";
    r.d(e, "a", function () {
      return o;
    });
    var n = r("53ca");
    function i(t) {
      if (void 0 === t)
        throw new ReferenceError(
          "this hasn't been initialised - super() hasn't been called"
        );
      return t;
    }
    function o(t, e) {
      return !e || ("object" !== Object(n["a"])(e) && "function" !== typeof e)
        ? i(t)
        : e;
    }
  },
  "9bf2": function (t, e, r) {
    var n = r("83ab"),
      i = r("0cfb"),
      o = r("825a"),
      s = r("c04e"),
      u = Object.defineProperty;
    e.f = n
      ? u
      : function (t, e, r) {
          if ((o(t), (e = s(e, !0)), o(r), i))
            try {
              return u(t, e, r);
            } catch (n) {}
          if ("get" in r || "set" in r)
            throw TypeError("Accessors not supported");
          return "value" in r && (t[e] = r.value), t;
        };
  },
  "9d46": function (t) {
    t.exports = JSON.parse(
      '{"_args":[["@web3-js/websocket@1.0.30","/home"]],"_development":true,"_from":"@web3-js/websocket@1.0.30","_id":"@web3-js/websocket@1.0.30","_inBundle":false,"_integrity":"sha512-fDwrD47MiDrzcJdSeTLF75aCcxVVt8B1N74rA+vh2XCAvFy4tEWJjtnUtj2QG7/zlQ6g9cQ88bZFBxwd9/FmtA==","_location":"/@web3-js/websocket","_phantomChildren":{},"_requested":{"type":"version","registry":true,"raw":"@web3-js/websocket@1.0.30","name":"@web3-js/websocket","escapedName":"@web3-js%2fwebsocket","scope":"@web3-js","rawSpec":"1.0.30","saveSpec":null,"fetchSpec":"1.0.30"},"_requiredBy":["/@makerdao/dai/web3-providers-ws","/@myetherwallet/mewconnect-web-client/web3-providers-ws","/web3-core-requestmanager/web3-providers-ws"],"_resolved":"https://registry.npmjs.org/@web3-js/websocket/-/websocket-1.0.30.tgz","_spec":"1.0.30","_where":"/home","author":{"name":"Brian McKelvey","email":"theturtle32@gmail.com","url":"https://github.com/theturtle32"},"browser":"lib/browser.js","bugs":{"url":"https://github.com/web3-js/WebSocket-Node/issues"},"config":{"verbose":false},"contributors":[{"name":"Iñaki Baz Castillo","email":"ibc@aliax.net","url":"http://dev.sipdoc.net"}],"dependencies":{"debug":"^2.2.0","es5-ext":"^0.10.50","nan":"^2.14.0","typedarray-to-buffer":"^3.1.5","yaeti":"^0.0.6"},"description":"Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.","devDependencies":{"buffer-equal":"^1.0.0","faucet":"^0.0.1","gulp":"^4.0.2","gulp-jshint":"^2.0.4","jshint":"^2.0.0","jshint-stylish":"^2.2.1","tape":"^4.9.1"},"directories":{"lib":"./lib"},"engines":{"node":">=0.10.0"},"homepage":"https://github.com/web3-js/WebSocket-Node","keywords":["websocket","websockets","socket","networking","comet","push","RFC-6455","realtime","server","client"],"license":"Apache-2.0","main":"index","name":"@web3-js/websocket","repository":{"type":"git","url":"git+https://github.com/web3-js/WebSocket-Node.git"},"scripts":{"gulp":"gulp","install":"(node-gyp rebuild 2> builderror.log) || (exit 0)","test":"faucet test/unit"},"version":"1.0.30"}'
    );
  },
  "9ed3": function (t, e, r) {
    "use strict";
    var n = r("ae93").IteratorPrototype,
      i = r("7c73"),
      o = r("5c6c"),
      s = r("d44e"),
      u = r("3f8c"),
      a = function () {
        return this;
      };
    t.exports = function (t, e, r) {
      var h = e + " Iterator";
      return (
        (t.prototype = i(n, { next: o(1, r) })), s(t, h, !1, !0), (u[h] = a), t
      );
    };
  },
  "9f7f": function (t, e, r) {
    "use strict";
    var n = r("d039");
    function i(t, e) {
      return RegExp(t, e);
    }
    (e.UNSUPPORTED_Y = n(function () {
      var t = i("a", "y");
      return (t.lastIndex = 2), null != t.exec("abcd");
    })),
      (e.BROKEN_CARET = n(function () {
        var t = i("^r", "gy");
        return (t.lastIndex = 2), null != t.exec("str");
      }));
  },
  a393: function (t, e, r) {
    "use strict";
    Object.defineProperty(e, "__esModule", { value: !0 });
    var n = (function () {
      function t(t) {
        (this.type = t),
          (this.bubbles = !1),
          (this.cancelable = !1),
          (this.loaded = 0),
          (this.lengthComputable = !1),
          (this.total = 0);
      }
      return t;
    })();
    e.ProgressEvent = n;
  },
  a4d3: function (t, e, r) {
    "use strict";
    var n = r("23e7"),
      i = r("da84"),
      o = r("d066"),
      s = r("c430"),
      u = r("83ab"),
      a = r("4930"),
      h = r("fdbf"),
      l = r("d039"),
      f = r("5135"),
      c = r("e8b5"),
      d = r("861d"),
      p = r("825a"),
      m = r("7b0b"),
      v = r("fc6a"),
      g = r("c04e"),
      y = r("5c6c"),
      w = r("7c73"),
      b = r("df75"),
      M = r("241c"),
      _ = r("057f"),
      x = r("7418"),
      S = r("06cf"),
      E = r("9bf2"),
      A = r("d1e7"),
      k = r("9112"),
      O = r("6eeb"),
      T = r("5692"),
      R = r("f772"),
      C = r("d012"),
      j = r("90e3"),
      N = r("b622"),
      L = r("e538"),
      P = r("746f"),
      I = r("d44e"),
      B = r("69f3"),
      q = r("b727").forEach,
      U = R("hidden"),
      H = "Symbol",
      D = "prototype",
      F = N("toPrimitive"),
      z = B.set,
      Z = B.getterFor(H),
      W = Object[D],
      G = i.Symbol,
      Y = o("JSON", "stringify"),
      $ = S.f,
      X = E.f,
      V = _.f,
      J = A.f,
      K = T("symbols"),
      Q = T("op-symbols"),
      tt = T("string-to-symbol-registry"),
      et = T("symbol-to-string-registry"),
      rt = T("wks"),
      nt = i.QObject,
      it = !nt || !nt[D] || !nt[D].findChild,
      ot =
        u &&
        l(function () {
          return (
            7 !=
            w(
              X({}, "a", {
                get: function () {
                  return X(this, "a", { value: 7 }).a;
                },
              })
            ).a
          );
        })
          ? function (t, e, r) {
              var n = $(W, e);
              n && delete W[e], X(t, e, r), n && t !== W && X(W, e, n);
            }
          : X,
      st = function (t, e) {
        var r = (K[t] = w(G[D]));
        return (
          z(r, { type: H, tag: t, description: e }), u || (r.description = e), r
        );
      },
      ut = h
        ? function (t) {
            return "symbol" == typeof t;
          }
        : function (t) {
            return Object(t) instanceof G;
          },
      at = function (t, e, r) {
        t === W && at(Q, e, r), p(t);
        var n = g(e, !0);
        return (
          p(r),
          f(K, n)
            ? (r.enumerable
                ? (f(t, U) && t[U][n] && (t[U][n] = !1),
                  (r = w(r, { enumerable: y(0, !1) })))
                : (f(t, U) || X(t, U, y(1, {})), (t[U][n] = !0)),
              ot(t, n, r))
            : X(t, n, r)
        );
      },
      ht = function (t, e) {
        p(t);
        var r = v(e),
          n = b(r).concat(pt(r));
        return (
          q(n, function (e) {
            (u && !ft.call(r, e)) || at(t, e, r[e]);
          }),
          t
        );
      },
      lt = function (t, e) {
        return void 0 === e ? w(t) : ht(w(t), e);
      },
      ft = function (t) {
        var e = g(t, !0),
          r = J.call(this, e);
        return (
          !(this === W && f(K, e) && !f(Q, e)) &&
          (!(r || !f(this, e) || !f(K, e) || (f(this, U) && this[U][e])) || r)
        );
      },
      ct = function (t, e) {
        var r = v(t),
          n = g(e, !0);
        if (r !== W || !f(K, n) || f(Q, n)) {
          var i = $(r, n);
          return (
            !i || !f(K, n) || (f(r, U) && r[U][n]) || (i.enumerable = !0), i
          );
        }
      },
      dt = function (t) {
        var e = V(v(t)),
          r = [];
        return (
          q(e, function (t) {
            f(K, t) || f(C, t) || r.push(t);
          }),
          r
        );
      },
      pt = function (t) {
        var e = t === W,
          r = V(e ? Q : v(t)),
          n = [];
        return (
          q(r, function (t) {
            !f(K, t) || (e && !f(W, t)) || n.push(K[t]);
          }),
          n
        );
      };
    if (
      (a ||
        ((G = function () {
          if (this instanceof G) throw TypeError("Symbol is not a constructor");
          var t =
              arguments.length && void 0 !== arguments[0]
                ? String(arguments[0])
                : void 0,
            e = j(t),
            r = function (t) {
              this === W && r.call(Q, t),
                f(this, U) && f(this[U], e) && (this[U][e] = !1),
                ot(this, e, y(1, t));
            };
          return u && it && ot(W, e, { configurable: !0, set: r }), st(e, t);
        }),
        O(G[D], "toString", function () {
          return Z(this).tag;
        }),
        O(G, "withoutSetter", function (t) {
          return st(j(t), t);
        }),
        (A.f = ft),
        (E.f = at),
        (S.f = ct),
        (M.f = _.f = dt),
        (x.f = pt),
        (L.f = function (t) {
          return st(N(t), t);
        }),
        u &&
          (X(G[D], "description", {
            configurable: !0,
            get: function () {
              return Z(this).description;
            },
          }),
          s || O(W, "propertyIsEnumerable", ft, { unsafe: !0 }))),
      n({ global: !0, wrap: !0, forced: !a, sham: !a }, { Symbol: G }),
      q(b(rt), function (t) {
        P(t);
      }),
      n(
        { target: H, stat: !0, forced: !a },
        {
          for: function (t) {
            var e = String(t);
            if (f(tt, e)) return tt[e];
            var r = G(e);
            return (tt[e] = r), (et[r] = e), r;
          },
          keyFor: function (t) {
            if (!ut(t)) throw TypeError(t + " is not a symbol");
            if (f(et, t)) return et[t];
          },
          useSetter: function () {
            it = !0;
          },
          useSimple: function () {
            it = !1;
          },
        }
      ),
      n(
        { target: "Object", stat: !0, forced: !a, sham: !u },
        {
          create: lt,
          defineProperty: at,
          defineProperties: ht,
          getOwnPropertyDescriptor: ct,
        }
      ),
      n(
        { target: "Object", stat: !0, forced: !a },
        { getOwnPropertyNames: dt, getOwnPropertySymbols: pt }
      ),
      n(
        {
          target: "Object",
          stat: !0,
          forced: l(function () {
            x.f(1);
          }),
        },
        {
          getOwnPropertySymbols: function (t) {
            return x.f(m(t));
          },
        }
      ),
      Y)
    ) {
      var mt =
        !a ||
        l(function () {
          var t = G();
          return (
            "[null]" != Y([t]) || "{}" != Y({ a: t }) || "{}" != Y(Object(t))
          );
        });
      n(
        { target: "JSON", stat: !0, forced: mt },
        {
          stringify: function (t, e, r) {
            var n,
              i = [t],
              o = 1;
            while (arguments.length > o) i.push(arguments[o++]);
            if (((n = e), (d(e) || void 0 !== t) && !ut(t)))
              return (
                c(e) ||
                  (e = function (t, e) {
                    if (
                      ("function" == typeof n && (e = n.call(this, t, e)),
                      !ut(e))
                    )
                      return e;
                  }),
                (i[1] = e),
                Y.apply(null, i)
              );
          },
        }
      );
    }
    G[D][F] || k(G[D], F, G[D].valueOf), I(G, H), (C[U] = !0);
  },
  a640: function (t, e, r) {
    "use strict";
    var n = r("d039");
    t.exports = function (t, e) {
      var r = [][t];
      return (
        !!r &&
        n(function () {
          r.call(
            null,
            e ||
              function () {
                throw 1;
              },
            1
          );
        })
      );
    };
  },
  a691: function (t, e) {
    var r = Math.ceil,
      n = Math.floor;
    t.exports = function (t) {
      return isNaN((t = +t)) ? 0 : (t > 0 ? n : r)(t);
    };
  },
  a6b6: function (t, e, r) {
    var n = r("e943"),
      i = r("85b1");
    t.exports = function (t) {
      if ("string" === typeof t || "number" === typeof t) {
        var e = new n(1),
          r = String(t).toLowerCase().trim(),
          o = "0x" === r.substr(0, 2) || "-0x" === r.substr(0, 3),
          s = i(r);
        if (
          ("-" === s.substr(0, 1) && ((s = i(s.slice(1))), (e = new n(-1, 10))),
          (s = "" === s ? "0" : s),
          (!s.match(/^-?[0-9]+$/) && s.match(/^[0-9A-Fa-f]+$/)) ||
            s.match(/^[a-fA-F]+$/) ||
            (!0 === o && s.match(/^[0-9A-Fa-f]+$/)))
        )
          return new n(s, 16).mul(e);
        if ((s.match(/^-?[0-9]+$/) || "" === s) && !1 === o)
          return new n(s, 10).mul(e);
      } else if (
        "object" === typeof t &&
        t.toString &&
        !t.pop &&
        !t.push &&
        t.toString(10).match(/^-?[0-9]+$/) &&
        (t.mul || t.dividedToIntegerBy)
      )
        return new n(t.toString(10), 10);
      throw new Error(
        "[number-to-bn] while converting number " +
          JSON.stringify(t) +
          " to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported."
      );
    };
  },
  a6ca: function (t, e) {
    (function () {
      "use strict";
      function t(e, r, n, i) {
        return this instanceof t
          ? ((this.domain = e || void 0),
            (this.path = r || "/"),
            (this.secure = !!n),
            (this.script = !!i),
            this)
          : new t(e, r, n, i);
      }
      function r(t, e, n) {
        return t instanceof r
          ? t
          : this instanceof r
          ? ((this.name = null),
            (this.value = null),
            (this.expiration_date = 1 / 0),
            (this.path = String(n || "/")),
            (this.explicit_path = !1),
            (this.domain = e || null),
            (this.explicit_domain = !1),
            (this.secure = !1),
            (this.noscript = !1),
            t && this.parse(t, e, n),
            this)
          : new r(t, e, n);
      }
      (t.All = Object.freeze(Object.create(null))),
        (e.CookieAccessInfo = t),
        (e.Cookie = r),
        (r.prototype.toString = function () {
          var t = [this.name + "=" + this.value];
          return (
            this.expiration_date !== 1 / 0 &&
              t.push("expires=" + new Date(this.expiration_date).toGMTString()),
            this.domain && t.push("domain=" + this.domain),
            this.path && t.push("path=" + this.path),
            this.secure && t.push("secure"),
            this.noscript && t.push("httponly"),
            t.join("; ")
          );
        }),
        (r.prototype.toValueString = function () {
          return this.name + "=" + this.value;
        });
      var n = /[:](?=\s*[a-zA-Z0-9_\-]+\s*[=])/g;
      function i() {
        var t, e, n;
        return this instanceof i
          ? ((t = Object.create(null)),
            (this.setCookie = function (i, o, s) {
              var u, a;
              if (
                ((i = new r(i, o, s)),
                (u = i.expiration_date <= Date.now()),
                void 0 !== t[i.name])
              ) {
                for (e = t[i.name], a = 0; a < e.length; a += 1)
                  if (((n = e[a]), n.collidesWith(i)))
                    return u
                      ? (e.splice(a, 1), 0 === e.length && delete t[i.name], !1)
                      : ((e[a] = i), i);
                return !u && (e.push(i), i);
              }
              return !u && ((t[i.name] = [i]), t[i.name]);
            }),
            (this.getCookie = function (r, n) {
              var i, o;
              if (((e = t[r]), e))
                for (o = 0; o < e.length; o += 1)
                  if (((i = e[o]), i.expiration_date <= Date.now()))
                    0 === e.length && delete t[i.name];
                  else if (i.matches(n)) return i;
            }),
            (this.getCookies = function (e) {
              var r,
                n,
                i = [];
              for (r in t) (n = this.getCookie(r, e)), n && i.push(n);
              return (
                (i.toString = function () {
                  return i.join(":");
                }),
                (i.toValueString = function () {
                  return i
                    .map(function (t) {
                      return t.toValueString();
                    })
                    .join(";");
                }),
                i
              );
            }),
            this)
          : new i();
      }
      (r.prototype.parse = function (t, e, n) {
        if (this instanceof r) {
          var i,
            o = t.split(";").filter(function (t) {
              return !!t;
            }),
            s = o[0].match(/([^=]+)=([\s\S]*)/);
          if (!s)
            return void console.warn(
              "Invalid cookie header encountered. Header: '" + t + "'"
            );
          var u = s[1],
            a = s[2];
          if ("string" !== typeof u || 0 === u.length || "string" !== typeof a)
            return void console.warn(
              "Unable to extract values from cookie header. Cookie: '" + t + "'"
            );
          for (this.name = u, this.value = a, i = 1; i < o.length; i += 1)
            switch (
              ((s = o[i].match(/([^=]+)(?:=([\s\S]*))?/)),
              (u = s[1].trim().toLowerCase()),
              (a = s[2]),
              u)
            ) {
              case "httponly":
                this.noscript = !0;
                break;
              case "expires":
                this.expiration_date = a ? Number(Date.parse(a)) : 1 / 0;
                break;
              case "path":
                (this.path = a ? a.trim() : ""), (this.explicit_path = !0);
                break;
              case "domain":
                (this.domain = a ? a.trim() : ""),
                  (this.explicit_domain = !!this.domain);
                break;
              case "secure":
                this.secure = !0;
                break;
            }
          return (
            this.explicit_path || (this.path = n || "/"),
            this.explicit_domain || (this.domain = e),
            this
          );
        }
        return new r().parse(t, e, n);
      }),
        (r.prototype.matches = function (e) {
          return (
            e === t.All ||
            !(
              (this.noscript && e.script) ||
              (this.secure && !e.secure) ||
              !this.collidesWith(e)
            )
          );
        }),
        (r.prototype.collidesWith = function (t) {
          if ((this.path && !t.path) || (this.domain && !t.domain)) return !1;
          if (this.path && 0 !== t.path.indexOf(this.path)) return !1;
          if (this.explicit_path && 0 !== t.path.indexOf(this.path)) return !1;
          var e = t.domain && t.domain.replace(/^[\.]/, ""),
            r = this.domain && this.domain.replace(/^[\.]/, "");
          if (r === e) return !0;
          if (r) {
            if (!this.explicit_domain) return !1;
            var n = e.indexOf(r);
            return -1 !== n && n === e.length - r.length;
          }
          return !0;
        }),
        (e.CookieJar = i),
        (i.prototype.setCookies = function (t, e, i) {
          t = Array.isArray(t) ? t : t.split(n);
          var o,
            s,
            u = [];
          for (
            t = t.map(function (t) {
              return new r(t, e, i);
            }),
              o = 0;
            o < t.length;
            o += 1
          )
            (s = t[o]), this.setCookie(s, e, i) && u.push(s);
          return u;
        });
    })();
  },
  a79d: function (t, e, r) {
    "use strict";
    var n = r("23e7"),
      i = r("c430"),
      o = r("fea9"),
      s = r("d039"),
      u = r("d066"),
      a = r("4840"),
      h = r("cdf9"),
      l = r("6eeb"),
      f =
        !!o &&
        s(function () {
          o.prototype["finally"].call({ then: function () {} }, function () {});
        });
    n(
      { target: "Promise", proto: !0, real: !0, forced: f },
      {
        finally: function (t) {
          var e = a(this, u("Promise")),
            r = "function" == typeof t;
          return this.then(
            r
              ? function (r) {
                  return h(e, t()).then(function () {
                    return r;
                  });
                }
              : t,
            r
              ? function (r) {
                  return h(e, t()).then(function () {
                    throw r;
                  });
                }
              : t
          );
        },
      }
    ),
      i ||
        "function" != typeof o ||
        o.prototype["finally"] ||
        l(o.prototype, "finally", u("Promise").prototype["finally"]);
  },
  a9f1: function (t, e, r) {
    (function (t) {
      (e.fetch = u(t.fetch) && u(t.ReadableStream)),
        (e.writableStream = u(t.WritableStream)),
        (e.abortController = u(t.AbortController)),
        (e.blobConstructor = !1);
      try {
        new Blob([new ArrayBuffer(1)]), (e.blobConstructor = !0);
      } catch (a) {}
      var r;
      function n() {
        if (void 0 !== r) return r;
        if (t.XMLHttpRequest) {
          r = new t.XMLHttpRequest();
          try {
            r.open("GET", t.XDomainRequest ? "/" : "https://example.com");
          } catch (a) {
            r = null;
          }
        } else r = null;
        return r;
      }
      function i(t) {
        var e = n();
        if (!e) return !1;
        try {
          return (e.responseType = t), e.responseType === t;
        } catch (a) {}
        return !1;
      }
      var o = "undefined" !== typeof t.ArrayBuffer,
        s = o && u(t.ArrayBuffer.prototype.slice);
      function u(t) {
        return "function" === typeof t;
      }
      (e.arraybuffer = e.fetch || (o && i("arraybuffer"))),
        (e.msstream = !e.fetch && s && i("ms-stream")),
        (e.mozchunkedarraybuffer =
          !e.fetch && o && i("moz-chunked-arraybuffer")),
        (e.overrideMimeType = e.fetch || (!!n() && u(n().overrideMimeType))),
        (e.vbArray = u(t.VBArray)),
        (r = null);
    }.call(this, r("c8ba")));
  },
  ac1f: function (t, e, r) {
    "use strict";
    var n = r("23e7"),
      i = r("92631");
    n({ target: "RegExp", proto: !0, forced: /./.exec !== i }, { exec: i });
  },
  ad6d: function (t, e, r) {
    "use strict";
    var n = r("825a");
    t.exports = function () {
      var t = n(this),
        e = "";
      return (
        t.global && (e += "g"),
        t.ignoreCase && (e += "i"),
        t.multiline && (e += "m"),
        t.dotAll && (e += "s"),
        t.unicode && (e += "u"),
        t.sticky && (e += "y"),
        e
      );
    };
  },
  ae40: function (t, e, r) {
    var n = r("83ab"),
      i = r("d039"),
      o = r("5135"),
      s = Object.defineProperty,
      u = {},
      a = function (t) {
        throw t;
      };
    t.exports = function (t, e) {
      if (o(u, t)) return u[t];
      e || (e = {});
      var r = [][t],
        h = !!o(e, "ACCESSORS") && e.ACCESSORS,
        l = o(e, 0) ? e[0] : a,
        f = o(e, 1) ? e[1] : void 0;
      return (u[t] =
        !!r &&
        !i(function () {
          if (h && !n) return !0;
          var t = { length: -1 };
          h ? s(t, 1, { enumerable: !0, get: a }) : (t[1] = 1), r.call(t, l, f);
        }));
    };
  },
  ae93: function (t, e, r) {
    "use strict";
    var n,
      i,
      o,
      s = r("e163"),
      u = r("9112"),
      a = r("5135"),
      h = r("b622"),
      l = r("c430"),
      f = h("iterator"),
      c = !1,
      d = function () {
        return this;
      };
    [].keys &&
      ((o = [].keys()),
      "next" in o
        ? ((i = s(s(o))), i !== Object.prototype && (n = i))
        : (c = !0)),
      void 0 == n && (n = {}),
      l || a(n, f) || u(n, f, d),
      (t.exports = { IteratorPrototype: n, BUGGY_SAFARI_ITERATORS: c });
  },
  b041: function (t, e, r) {
    "use strict";
    var n = r("00ee"),
      i = r("f5df");
    t.exports = n
      ? {}.toString
      : function () {
          return "[object " + i(this) + "]";
        };
  },
  b082: function (t, e, r) {
    "use strict";
    r.d(e, "a", function () {
      return i;
    });
    r("d3b7");
    var n = r("39d4"),
      i = function (t) {
        return new Promise(function (e, r) {
          if (!t.gas && !t.gasLimit && !t.chainId)
            return r(new Error('"gas" or "chainId" is missing'));
          if (t.nonce < 0 || t.gas < 0 || t.gasPrice < 0 || t.chainId < 0)
            return r(
              new Error("Gas, gasPrice, nonce or chainId is lower than 0")
            );
          try {
            t = n["formatters"].inputCallFormatter(t);
            var i = t;
            t.to && (i.to = t.to),
              (i.data = t.data || "0x"),
              (i.value = t.value || "0x"),
              (i.chainId = t.chainId),
              e(i);
          } catch (o) {
            r(o);
          }
        });
      };
  },
  b380: function (t, e, r) {
    "use strict";
    r.d(e, "a", function () {
      return n;
    });
    r("131a");
    function n(t, e) {
      return (
        (n =
          Object.setPrototypeOf ||
          function (t, e) {
            return (t.__proto__ = e), t;
          }),
        n(t, e)
      );
    }
  },
  b383: function (t, e, r) {
    "use strict";
    (e.decode = e.parse = r("91dd")), (e.encode = e.stringify = r("e099"));
  },
  b575: function (t, e, r) {
    var n,
      i,
      o,
      s,
      u,
      a,
      h,
      l,
      f = r("da84"),
      c = r("06cf").f,
      d = r("2cf4").set,
      p = r("1cdc"),
      m = r("605d"),
      v = f.MutationObserver || f.WebKitMutationObserver,
      g = f.document,
      y = f.process,
      w = f.Promise,
      b = c(f, "queueMicrotask"),
      M = b && b.value;
    M ||
      ((n = function () {
        var t, e;
        m && (t = y.domain) && t.exit();
        while (i) {
          (e = i.fn), (i = i.next);
          try {
            e();
          } catch (r) {
            throw (i ? s() : (o = void 0), r);
          }
        }
        (o = void 0), t && t.enter();
      }),
      !p && !m && v && g
        ? ((u = !0),
          (a = g.createTextNode("")),
          new v(n).observe(a, { characterData: !0 }),
          (s = function () {
            a.data = u = !u;
          }))
        : w && w.resolve
        ? ((h = w.resolve(void 0)),
          (l = h.then),
          (s = function () {
            l.call(h, n);
          }))
        : (s = m
            ? function () {
                y.nextTick(n);
              }
            : function () {
                d.call(f, n);
              })),
      (t.exports =
        M ||
        function (t) {
          var e = { fn: t, next: void 0 };
          o && (o.next = e), i || ((i = e), s()), (o = e);
        });
  },
  b622: function (t, e, r) {
    var n = r("da84"),
      i = r("5692"),
      o = r("5135"),
      s = r("90e3"),
      u = r("4930"),
      a = r("fdbf"),
      h = i("wks"),
      l = n.Symbol,
      f = a ? l : (l && l.withoutSetter) || s;
    t.exports = function (t) {
      return (
        o(h, t) || (u && o(l, t) ? (h[t] = l[t]) : (h[t] = f("Symbol." + t))),
        h[t]
      );
    };
  },
  b727: function (t, e, r) {
    var n = r("0366"),
      i = r("44ad"),
      o = r("7b0b"),
      s = r("50c4"),
      u = r("65f0"),
      a = [].push,
      h = function (t) {
        var e = 1 == t,
          r = 2 == t,
          h = 3 == t,
          l = 4 == t,
          f = 6 == t,
          c = 7 == t,
          d = 5 == t || f;
        return function (p, m, v, g) {
          for (
            var y,
              w,
              b = o(p),
              M = i(b),
              _ = n(m, v, 3),
              x = s(M.length),
              S = 0,
              E = g || u,
              A = e ? E(p, x) : r || c ? E(p, 0) : void 0;
            x > S;
            S++
          )
            if ((d || S in M) && ((y = M[S]), (w = _(y, S, b)), t))
              if (e) A[S] = w;
              else if (w)
                switch (t) {
                  case 3:
                    return !0;
                  case 5:
                    return y;
                  case 6:
                    return S;
                  case 2:
                    a.call(A, y);
                }
              else
                switch (t) {
                  case 4:
                    return !1;
                  case 7:
                    a.call(A, y);
                }
          return f ? -1 : h || l ? l : A;
        };
      };
    t.exports = {
      forEach: h(0),
      map: h(1),
      filter: h(2),
      some: h(3),
      every: h(4),
      find: h(5),
      findIndex: h(6),
      filterOut: h(7),
    };
  },
  b7d1: function (t, e, r) {
    (function (e) {
      function r(t, e) {
        if (n("noDeprecation")) return t;
        var r = !1;
        function i() {
          if (!r) {
            if (n("throwDeprecation")) throw new Error(e);
            n("traceDeprecation") ? console.trace(e) : console.warn(e),
              (r = !0);
          }
          return t.apply(this, arguments);
        }
        return i;
      }
      function n(t) {
        try {
          if (!e.localStorage) return !1;
        } catch (n) {
          return !1;
        }
        var r = e.localStorage[t];
        return null != r && "true" === String(r).toLowerCase();
      }
      t.exports = r;
    }.call(this, r("c8ba")));
  },
  b800: function (t, e, r) {
    (function (e, n) {
      var i =
          "[object process]" ===
          Object.prototype.toString.call("undefined" !== typeof e ? e : 0),
        o = null,
        s = null;
      if (i) {
        o = function (t) {
          return n.from(t).toString("base64");
        };
        var u = r("0b16");
        if (u.URL) {
          var a = u.URL;
          s = function (t) {
            return new a(t);
          };
        } else s = r("0b16").parse;
      } else
        (o = btoa),
          (s = function (t) {
            return new URL(t);
          });
      t.exports = { parseURL: s, btoa: o };
    }.call(this, r("2820"), r("1c35").Buffer));
  },
  ba10: function (t, e, r) {
    "use strict";
    var n = Object.prototype.hasOwnProperty,
      i = "~";
    function o() {}
    function s(t, e, r) {
      (this.fn = t), (this.context = e), (this.once = r || !1);
    }
    function u(t, e, r, n, o) {
      if ("function" !== typeof r)
        throw new TypeError("The listener must be a function");
      var u = new s(r, n || t, o),
        a = i ? i + e : e;
      return (
        t._events[a]
          ? t._events[a].fn
            ? (t._events[a] = [t._events[a], u])
            : t._events[a].push(u)
          : ((t._events[a] = u), t._eventsCount++),
        t
      );
    }
    function a(t, e) {
      0 === --t._eventsCount ? (t._events = new o()) : delete t._events[e];
    }
    function h() {
      (this._events = new o()), (this._eventsCount = 0);
    }
    Object.create &&
      ((o.prototype = Object.create(null)), new o().__proto__ || (i = !1)),
      (h.prototype.eventNames = function () {
        var t,
          e,
          r = [];
        if (0 === this._eventsCount) return r;
        for (e in (t = this._events))
          n.call(t, e) && r.push(i ? e.slice(1) : e);
        return Object.getOwnPropertySymbols
          ? r.concat(Object.getOwnPropertySymbols(t))
          : r;
      }),
      (h.prototype.listeners = function (t) {
        var e = i ? i + t : t,
          r = this._events[e];
        if (!r) return [];
        if (r.fn) return [r.fn];
        for (var n = 0, o = r.length, s = new Array(o); n < o; n++)
          s[n] = r[n].fn;
        return s;
      }),
      (h.prototype.listenerCount = function (t) {
        var e = i ? i + t : t,
          r = this._events[e];
        return r ? (r.fn ? 1 : r.length) : 0;
      }),
      (h.prototype.emit = function (t, e, r, n, o, s) {
        var u = i ? i + t : t;
        if (!this._events[u]) return !1;
        var a,
          h,
          l = this._events[u],
          f = arguments.length;
        if (l.fn) {
          switch ((l.once && this.removeListener(t, l.fn, void 0, !0), f)) {
            case 1:
              return l.fn.call(l.context), !0;
            case 2:
              return l.fn.call(l.context, e), !0;
            case 3:
              return l.fn.call(l.context, e, r), !0;
            case 4:
              return l.fn.call(l.context, e, r, n), !0;
            case 5:
              return l.fn.call(l.context, e, r, n, o), !0;
            case 6:
              return l.fn.call(l.context, e, r, n, o, s), !0;
          }
          for (h = 1, a = new Array(f - 1); h < f; h++) a[h - 1] = arguments[h];
          l.fn.apply(l.context, a);
        } else {
          var c,
            d = l.length;
          for (h = 0; h < d; h++)
            switch (
              (l[h].once && this.removeListener(t, l[h].fn, void 0, !0), f)
            ) {
              case 1:
                l[h].fn.call(l[h].context);
                break;
              case 2:
                l[h].fn.call(l[h].context, e);
                break;
              case 3:
                l[h].fn.call(l[h].context, e, r);
                break;
              case 4:
                l[h].fn.call(l[h].context, e, r, n);
                break;
              default:
                if (!a)
                  for (c = 1, a = new Array(f - 1); c < f; c++)
                    a[c - 1] = arguments[c];
                l[h].fn.apply(l[h].context, a);
            }
        }
        return !0;
      }),
      (h.prototype.on = function (t, e, r) {
        return u(this, t, e, r, !1);
      }),
      (h.prototype.once = function (t, e, r) {
        return u(this, t, e, r, !0);
      }),
      (h.prototype.removeListener = function (t, e, r, n) {
        var o = i ? i + t : t;
        if (!this._events[o]) return this;
        if (!e) return a(this, o), this;
        var s = this._events[o];
        if (s.fn)
          s.fn !== e || (n && !s.once) || (r && s.context !== r) || a(this, o);
        else {
          for (var u = 0, h = [], l = s.length; u < l; u++)
            (s[u].fn !== e || (n && !s[u].once) || (r && s[u].context !== r)) &&
              h.push(s[u]);
          h.length ? (this._events[o] = 1 === h.length ? h[0] : h) : a(this, o);
        }
        return this;
      }),
      (h.prototype.removeAllListeners = function (t) {
        var e;
        return (
          t
            ? ((e = i ? i + t : t), this._events[e] && a(this, e))
            : ((this._events = new o()), (this._eventsCount = 0)),
          this
        );
      }),
      (h.prototype.off = h.prototype.removeListener),
      (h.prototype.addListener = h.prototype.on),
      (h.prefixed = i),
      (h.EventEmitter = h),
      (t.exports = h);
  },
  bee2: function (t, e, r) {
    "use strict";
    function n(t, e) {
      for (var r = 0; r < e.length; r++) {
        var n = e[r];
        (n.enumerable = n.enumerable || !1),
          (n.configurable = !0),
          "value" in n && (n.writable = !0),
          Object.defineProperty(t, n.key, n);
      }
    }
    function i(t, e, r) {
      return e && n(t.prototype, e), r && n(t, r), t;
    }
    r.d(e, "a", function () {
      return i;
    });
  },
  c04e: function (t, e, r) {
    var n = r("861d");
    t.exports = function (t, e) {
      if (!n(t)) return t;
      var r, i;
      if (e && "function" == typeof (r = t.toString) && !n((i = r.call(t))))
        return i;
      if ("function" == typeof (r = t.valueOf) && !n((i = r.call(t)))) return i;
      if (!e && "function" == typeof (r = t.toString) && !n((i = r.call(t))))
        return i;
      throw TypeError("Can't convert object to primitive value");
    };
  },
  c430: function (t, e) {
    t.exports = !1;
  },
  c69f: function (t, e, r) {
    "use strict";
    var n = r("966d");
    function i(t, e) {
      var r = this,
        i = this._readableState && this._readableState.destroyed,
        o = this._writableState && this._writableState.destroyed;
      return i || o
        ? (e
            ? e(t)
            : !t ||
              (this._writableState && this._writableState.errorEmitted) ||
              n.nextTick(s, this, t),
          this)
        : (this._readableState && (this._readableState.destroyed = !0),
          this._writableState && (this._writableState.destroyed = !0),
          this._destroy(t || null, function (t) {
            !e && t
              ? (n.nextTick(s, r, t),
                r._writableState && (r._writableState.errorEmitted = !0))
              : e && e(t);
          }),
          this);
    }
    function o() {
      this._readableState &&
        ((this._readableState.destroyed = !1),
        (this._readableState.reading = !1),
        (this._readableState.ended = !1),
        (this._readableState.endEmitted = !1)),
        this._writableState &&
          ((this._writableState.destroyed = !1),
          (this._writableState.ended = !1),
          (this._writableState.ending = !1),
          (this._writableState.finished = !1),
          (this._writableState.errorEmitted = !1));
    }
    function s(t, e) {
      t.emit("error", e);
    }
    t.exports = { destroy: i, undestroy: o };
  },
  c6b6: function (t, e) {
    var r = {}.toString;
    t.exports = function (t) {
      return r.call(t).slice(8, -1);
    };
  },
  c6cd: function (t, e, r) {
    var n = r("da84"),
      i = r("ce4e"),
      o = "__core-js_shared__",
      s = n[o] || i(o, {});
    t.exports = s;
  },
  c8ba: function (t, e) {
    var r;
    r = (function () {
      return this;
    })();
    try {
      r = r || new Function("return this")();
    } catch (n) {
      "object" === typeof window && (r = window);
    }
    t.exports = r;
  },
  c90b: function (t, e, r) {
    (function (t, n, i) {
      var o = r("a9f1"),
        s = r("3fb5"),
        u = r("3d1b"),
        a = (e.readyStates = {
          UNSENT: 0,
          OPENED: 1,
          HEADERS_RECEIVED: 2,
          LOADING: 3,
          DONE: 4,
        }),
        h = (e.IncomingMessage = function (e, r, s, a) {
          var h = this;
          if (
            (u.Readable.call(h),
            (h._mode = s),
            (h.headers = {}),
            (h.rawHeaders = []),
            (h.trailers = {}),
            (h.rawTrailers = []),
            h.on("end", function () {
              t.nextTick(function () {
                h.emit("close");
              });
            }),
            "fetch" === s)
          ) {
            if (
              ((h._fetchResponse = r),
              (h.url = r.url),
              (h.statusCode = r.status),
              (h.statusMessage = r.statusText),
              r.headers.forEach(function (t, e) {
                (h.headers[e.toLowerCase()] = t), h.rawHeaders.push(e, t);
              }),
              o.writableStream)
            ) {
              var l = new WritableStream({
                write: function (t) {
                  return new Promise(function (e, r) {
                    h._destroyed
                      ? r()
                      : h.push(new n(t))
                      ? e()
                      : (h._resumeFetch = e);
                  });
                },
                close: function () {
                  i.clearTimeout(a), h._destroyed || h.push(null);
                },
                abort: function (t) {
                  h._destroyed || h.emit("error", t);
                },
              });
              try {
                return void r.body.pipeTo(l).catch(function (t) {
                  i.clearTimeout(a), h._destroyed || h.emit("error", t);
                });
              } catch (v) {}
            }
            var f = r.body.getReader();
            function c() {
              f.read()
                .then(function (t) {
                  if (!h._destroyed) {
                    if (t.done) return i.clearTimeout(a), void h.push(null);
                    h.push(new n(t.value)), c();
                  }
                })
                .catch(function (t) {
                  i.clearTimeout(a), h._destroyed || h.emit("error", t);
                });
            }
            c();
          } else {
            (h._xhr = e),
              (h._pos = 0),
              (h.url = e.responseURL),
              (h.statusCode = e.status),
              (h.statusMessage = e.statusText);
            var d = e.getAllResponseHeaders().split(/\r?\n/);
            if (
              (d.forEach(function (t) {
                var e = t.match(/^([^:]+):\s*(.*)/);
                if (e) {
                  var r = e[1].toLowerCase();
                  "set-cookie" === r
                    ? (void 0 === h.headers[r] && (h.headers[r] = []),
                      h.headers[r].push(e[2]))
                    : void 0 !== h.headers[r]
                    ? (h.headers[r] += ", " + e[2])
                    : (h.headers[r] = e[2]),
                    h.rawHeaders.push(e[1], e[2]);
                }
              }),
              (h._charset = "x-user-defined"),
              !o.overrideMimeType)
            ) {
              var p = h.rawHeaders["mime-type"];
              if (p) {
                var m = p.match(/;\s*charset=([^;])(;|$)/);
                m && (h._charset = m[1].toLowerCase());
              }
              h._charset || (h._charset = "utf-8");
            }
          }
        });
      s(h, u.Readable),
        (h.prototype._read = function () {
          var t = this,
            e = t._resumeFetch;
          e && ((t._resumeFetch = null), e());
        }),
        (h.prototype._onXHRProgress = function () {
          var t = this,
            e = t._xhr,
            r = null;
          switch (t._mode) {
            case "text:vbarray":
              if (e.readyState !== a.DONE) break;
              try {
                r = new i.VBArray(e.responseBody).toArray();
              } catch (l) {}
              if (null !== r) {
                t.push(new n(r));
                break;
              }
            case "text":
              try {
                r = e.responseText;
              } catch (l) {
                t._mode = "text:vbarray";
                break;
              }
              if (r.length > t._pos) {
                var o = r.substr(t._pos);
                if ("x-user-defined" === t._charset) {
                  for (var s = new n(o.length), u = 0; u < o.length; u++)
                    s[u] = 255 & o.charCodeAt(u);
                  t.push(s);
                } else t.push(o, t._charset);
                t._pos = r.length;
              }
              break;
            case "arraybuffer":
              if (e.readyState !== a.DONE || !e.response) break;
              (r = e.response), t.push(new n(new Uint8Array(r)));
              break;
            case "moz-chunked-arraybuffer":
              if (((r = e.response), e.readyState !== a.LOADING || !r)) break;
              t.push(new n(new Uint8Array(r)));
              break;
            case "ms-stream":
              if (((r = e.response), e.readyState !== a.LOADING)) break;
              var h = new i.MSStreamReader();
              (h.onprogress = function () {
                h.result.byteLength > t._pos &&
                  (t.push(new n(new Uint8Array(h.result.slice(t._pos)))),
                  (t._pos = h.result.byteLength));
              }),
                (h.onload = function () {
                  t.push(null);
                }),
                h.readAsArrayBuffer(r);
              break;
          }
          t._xhr.readyState === a.DONE &&
            "ms-stream" !== t._mode &&
            t.push(null);
        });
    }.call(this, r("2820"), r("1c35").Buffer, r("c8ba")));
  },
  ca84: function (t, e, r) {
    var n = r("5135"),
      i = r("fc6a"),
      o = r("4d64").indexOf,
      s = r("d012");
    t.exports = function (t, e) {
      var r,
        u = i(t),
        a = 0,
        h = [];
      for (r in u) !n(s, r) && n(u, r) && h.push(r);
      while (e.length > a) n(u, (r = e[a++])) && (~o(h, r) || h.push(r));
      return h;
    };
  },
  cc12: function (t, e, r) {
    var n = r("da84"),
      i = r("861d"),
      o = n.document,
      s = i(o) && i(o.createElement);
    t.exports = function (t) {
      return s ? o.createElement(t) : {};
    };
  },
  cca6: function (t, e, r) {
    var n = r("23e7"),
      i = r("60da");
    n(
      { target: "Object", stat: !0, forced: Object.assign !== i },
      { assign: i }
    );
  },
  cdf9: function (t, e, r) {
    var n = r("825a"),
      i = r("861d"),
      o = r("f069");
    t.exports = function (t, e) {
      if ((n(t), i(e) && e.constructor === t)) return e;
      var r = o.f(t),
        s = r.resolve;
      return s(e), r.promise;
    };
  },
  ce4e: function (t, e, r) {
    var n = r("da84"),
      i = r("9112");
    t.exports = function (t, e) {
      try {
        i(n, t, e);
      } catch (r) {
        n[t] = e;
      }
      return e;
    };
  },
  d012: function (t, e) {
    t.exports = {};
  },
  d039: function (t, e) {
    t.exports = function (t) {
      try {
        return !!t();
      } catch (e) {
        return !0;
      }
    };
  },
  d066: function (t, e, r) {
    var n = r("428f"),
      i = r("da84"),
      o = function (t) {
        return "function" == typeof t ? t : void 0;
      };
    t.exports = function (t, e) {
      return arguments.length < 2
        ? o(n[t]) || o(i[t])
        : (n[t] && n[t][e]) || (i[t] && i[t][e]);
    };
  },
  d1e7: function (t, e, r) {
    "use strict";
    var n = {}.propertyIsEnumerable,
      i = Object.getOwnPropertyDescriptor,
      o = i && !n.call({ 1: 2 }, 1);
    e.f = o
      ? function (t) {
          var e = i(this, t);
          return !!e && e.enumerable;
        }
      : n;
  },
  d28b: function (t, e, r) {
    var n = r("746f");
    n("iterator");
  },
  d2bb: function (t, e, r) {
    var n = r("825a"),
      i = r("3bbe");
    t.exports =
      Object.setPrototypeOf ||
      ("__proto__" in {}
        ? (function () {
            var t,
              e = !1,
              r = {};
            try {
              (t = Object.getOwnPropertyDescriptor(
                Object.prototype,
                "__proto__"
              ).set),
                t.call(r, []),
                (e = r instanceof Array);
            } catch (o) {}
            return function (r, o) {
              return n(r), i(o), e ? t.call(r, o) : (r.__proto__ = o), r;
            };
          })()
        : void 0);
  },
  d3b7: function (t, e, r) {
    var n = r("00ee"),
      i = r("6eeb"),
      o = r("b041");
    n || i(Object.prototype, "toString", o, { unsafe: !0 });
  },
  d44e: function (t, e, r) {
    var n = r("9bf2").f,
      i = r("5135"),
      o = r("b622"),
      s = o("toStringTag");
    t.exports = function (t, e, r) {
      t &&
        !i((t = r ? t : t.prototype), s) &&
        n(t, s, { configurable: !0, value: e });
    };
  },
  d4ec: function (t, e, r) {
    "use strict";
    function n(t, e) {
      if (!(t instanceof e))
        throw new TypeError("Cannot call a class as a function");
    }
    r.d(e, "a", function () {
      return n;
    });
  },
  d58f: function (t, e, r) {
    var n = r("1c0b"),
      i = r("7b0b"),
      o = r("44ad"),
      s = r("50c4"),
      u = function (t) {
        return function (e, r, u, a) {
          n(r);
          var h = i(e),
            l = o(h),
            f = s(h.length),
            c = t ? f - 1 : 0,
            d = t ? -1 : 1;
          if (u < 2)
            while (1) {
              if (c in l) {
                (a = l[c]), (c += d);
                break;
              }
              if (((c += d), t ? c < 0 : f <= c))
                throw TypeError("Reduce of empty array with no initial value");
            }
          for (; t ? c >= 0 : f > c; c += d) c in l && (a = r(a, l[c], c, h));
          return a;
        };
      };
    t.exports = { left: u(!1), right: u(!0) };
  },
  d784: function (t, e, r) {
    "use strict";
    r("ac1f");
    var n = r("6eeb"),
      i = r("d039"),
      o = r("b622"),
      s = r("92631"),
      u = r("9112"),
      a = o("species"),
      h = !i(function () {
        var t = /./;
        return (
          (t.exec = function () {
            var t = [];
            return (t.groups = { a: "7" }), t;
          }),
          "7" !== "".replace(t, "$<a>")
        );
      }),
      l = (function () {
        return "$0" === "a".replace(/./, "$0");
      })(),
      f = o("replace"),
      c = (function () {
        return !!/./[f] && "" === /./[f]("a", "$0");
      })(),
      d = !i(function () {
        var t = /(?:)/,
          e = t.exec;
        t.exec = function () {
          return e.apply(this, arguments);
        };
        var r = "ab".split(t);
        return 2 !== r.length || "a" !== r[0] || "b" !== r[1];
      });
    t.exports = function (t, e, r, f) {
      var p = o(t),
        m = !i(function () {
          var e = {};
          return (
            (e[p] = function () {
              return 7;
            }),
            7 != ""[t](e)
          );
        }),
        v =
          m &&
          !i(function () {
            var e = !1,
              r = /a/;
            return (
              "split" === t &&
                ((r = {}),
                (r.constructor = {}),
                (r.constructor[a] = function () {
                  return r;
                }),
                (r.flags = ""),
                (r[p] = /./[p])),
              (r.exec = function () {
                return (e = !0), null;
              }),
              r[p](""),
              !e
            );
          });
      if (
        !m ||
        !v ||
        ("replace" === t && (!h || !l || c)) ||
        ("split" === t && !d)
      ) {
        var g = /./[p],
          y = r(
            p,
            ""[t],
            function (t, e, r, n, i) {
              return e.exec === s
                ? m && !i
                  ? { done: !0, value: g.call(e, r, n) }
                  : { done: !0, value: t.call(r, e, n) }
                : { done: !1 };
            },
            {
              REPLACE_KEEPS_$0: l,
              REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: c,
            }
          ),
          w = y[0],
          b = y[1];
        n(String.prototype, t, w),
          n(
            RegExp.prototype,
            p,
            2 == e
              ? function (t, e) {
                  return b.call(t, this, e);
                }
              : function (t) {
                  return b.call(t, this);
                }
          );
      }
      f && u(RegExp.prototype[p], "sham", !0);
    };
  },
  d938: function (t, e, r) {
    var n = r("1c35").Buffer;
    t.exports = function (t) {
      if (t instanceof Uint8Array) {
        if (0 === t.byteOffset && t.byteLength === t.buffer.byteLength)
          return t.buffer;
        if ("function" === typeof t.buffer.slice)
          return t.buffer.slice(t.byteOffset, t.byteOffset + t.byteLength);
      }
      if (n.isBuffer(t)) {
        for (var e = new Uint8Array(t.length), r = t.length, i = 0; i < r; i++)
          e[i] = t[i];
        return e.buffer;
      }
      throw new Error("Argument must be a Buffer");
    };
  },
  d967: function (t, e, r) {
    "use strict";
    r.d(e, "a", function () {
      return n;
    });
    r("d3b7"), r("4ae1"), r("25f0");
    function n() {
      if ("undefined" === typeof Reflect || !Reflect.construct) return !1;
      if (Reflect.construct.sham) return !1;
      if ("function" === typeof Proxy) return !0;
      try {
        return (
          Date.prototype.toString.call(
            Reflect.construct(Date, [], function () {})
          ),
          !0
        );
      } catch (t) {
        return !1;
      }
    }
  },
  da84: function (t, e, r) {
    (function (e) {
      var r = function (t) {
        return t && t.Math == Math && t;
      };
      t.exports =
        r("object" == typeof globalThis && globalThis) ||
        r("object" == typeof window && window) ||
        r("object" == typeof self && self) ||
        r("object" == typeof e && e) ||
        (function () {
          return this;
        })() ||
        Function("return this")();
    }.call(this, r("c8ba")));
  },
  dcd6: function (t, e, r) {
    "use strict";
    r.r(e);
    r("e260"), r("e6cf"), r("cca6"), r("a79d"), r("d3b7"), r("ac1f"), r("5319");
    var n = r("d4ec"),
      i = r("bee2"),
      o = r("99de"),
      s = r("262e"),
      u = r("2caf"),
      a = (r("99af"), r("176c")),
      h = r("1b54"),
      l = function (t, e) {
        window.removeEventListener(t, function () {}),
          window.removeEventListener(e, function () {});
      },
      f = function (t, e, r, n) {
        return new Promise(function (i, o) {
          var s = new CustomEvent(t, e);
          window.addEventListener(r, function (t) {
            l(r, n), i(t.detail);
          }),
            window.addEventListener(n, function (t) {
              l(r, n),
                t.detail
                  ? o(new Error(t.detail))
                  : o(new Error("User cancelled request!"));
            }),
            window.dispatchEvent(s);
        });
      },
      c = f,
      d = (function () {
        function t() {
          return Object(n["a"])(this, t), new a["Manager"](this);
        }
        return (
          Object(i["a"])(t, [
            {
              key: "send",
              value: function (t, e) {
                var r = { detail: t },
                  n = "".concat(h["G"], "-").concat(t.id, "-res"),
                  i = "".concat(h["G"], "-").concat(t.id, "-err");
                c(h["G"], r, n, i)
                  .then(function (t) {
                    e(null, t);
                  })
                  .catch(function (t) {
                    e(t);
                  });
              },
            },
            { key: "disconnect", value: function () {} },
          ]),
          t
        );
      })(),
      p = d,
      m = r("1572"),
      v = (r("96cf"), r("1da1")),
      g = r("67a3"),
      y = r("b082"),
      w = (function () {
        var t = Object(v["a"])(
          regeneratorRuntime.mark(function t(e, r, n) {
            var i, o, s, u, a, l, f, d, p, m, v, w, b, M, _;
            return regeneratorRuntime.wrap(
              function (t) {
                while (1)
                  switch ((t.prev = t.next)) {
                    case 0:
                      if (
                        ((i = e.payload), "eth_sendTransaction" === i.method)
                      ) {
                        t.next = 3;
                        break;
                      }
                      return t.abrupt("return", n());
                    case 3:
                      return (
                        (o = window.extensionID),
                        (s = Object.assign({}, i.params[0])),
                        (u = h["I"].replace("{{id}}", o)),
                        (a = h["E"].replace("{{id}}", o)),
                        (l = h["F"].replace("{{id}}", o)),
                        (f = h["y"].replace("{{id}}", o)),
                        (d = h["B"].replace("{{id}}", o)),
                        (p = h["v"].replace("{{id}}", o)),
                        (m = h["D"].replace("{{id}}", o)),
                        (v = h["u"].replace("{{id}}", o)),
                        (w = h["A"].replace("{{id}}", o)),
                        (t.next = 16),
                        c(f, {}, d, l)
                      );
                    case 16:
                      return (
                        (b = t.sent),
                        (t.next = 19),
                        c(p, { detail: { from: s.from } }, m, l)
                      );
                    case 19:
                      return (
                        (M = t.sent),
                        (t.next = 22),
                        c(v, { detail: { tx: s } }, w, l)
                      );
                    case 22:
                      if (
                        ((_ = t.sent),
                        (s.gasPrice = s.gasPrice ? s.gasPrice : b),
                        (t.prev = 24),
                        s.nonce)
                      ) {
                        t.next = 31;
                        break;
                      }
                      return (t.next = 28), M;
                    case 28:
                      (t.t0 = t.sent), (t.next = 32);
                      break;
                    case 31:
                      t.t0 = s.nonce;
                    case 32:
                      (s.nonce = t.t0),
                        (s.gas = s.gas ? s.gas : _),
                        (t.next = 40);
                      break;
                    case 36:
                      return (
                        (t.prev = 36),
                        (t.t1 = t["catch"](24)),
                        r(t.t1),
                        t.abrupt("return")
                      );
                    case 40:
                      Object(y["a"])(s)
                        .then(function (t) {
                          var e = { detail: { tx: t } };
                          c(u, e, a, l)
                            .then(function (t) {
                              r(null, Object(g["a"])(i.id, t.payload));
                            })
                            .catch(function (t) {
                              r(t);
                            });
                        })
                        .catch(function (t) {
                          r(t);
                        });
                    case 41:
                    case "end":
                      return t.stop();
                  }
              },
              t,
              null,
              [[24, 36]]
            );
          })
        );
        return function (e, r, n) {
          return t.apply(this, arguments);
        };
      })(),
      b = (function () {
        var t = Object(v["a"])(
          regeneratorRuntime.mark(function t(e, r, n) {
            var i, o, s, u, a, l, f;
            return regeneratorRuntime.wrap(function (t) {
              while (1)
                switch ((t.prev = t.next)) {
                  case 0:
                    if (((i = e.payload), "eth_requestAccounts" === i.method)) {
                      t.next = 3;
                      break;
                    }
                    return t.abrupt("return", n());
                  case 3:
                    (o = window.extensionID),
                      (s = window.location.origin),
                      (u = { detail: { from: s } }),
                      (a = h["t"].replace("{{id}}", o)),
                      (l = h["z"].replace("{{id}}", o)),
                      (f = h["F"].replace("{{id}}", o)),
                      c(a, u, l, f)
                        .then(function (t) {
                          r(null, Object(g["a"])(i.id, t.payload));
                        })
                        .catch(function (t) {
                          r(t);
                        });
                  case 10:
                  case "end":
                    return t.stop();
                }
            }, t);
          })
        );
        return function (e, r, n) {
          return t.apply(this, arguments);
        };
      })(),
      M = (function () {
        var t = Object(v["a"])(
          regeneratorRuntime.mark(function t(e, r, n) {
            var i, o, s, u, a, l, f, d;
            return regeneratorRuntime.wrap(function (t) {
              while (1)
                switch ((t.prev = t.next)) {
                  case 0:
                    if (
                      ((i = e.payload),
                      "personal_sign" === i.method || "eth_sign" === i.method)
                    ) {
                      t.next = 3;
                      break;
                    }
                    return t.abrupt("return", n());
                  case 3:
                    (o = window.extensionID),
                      (s =
                        "personal_sign" === i.method
                          ? i.params[1]
                          : i.params[0]),
                      (u =
                        "personal_sign" === i.method
                          ? i.params[0]
                          : i.params[1]),
                      (a = { detail: { msgToSign: u, address: s } }),
                      (l = h["H"].replace("{{id}}", o)),
                      (f = h["C"].replace("{{id}}", o)),
                      (d = h["F"].replace("{{id}}", o)),
                      c(l, a, f, d)
                        .then(function (t) {
                          r(null, Object(g["a"])(i.id, t.payload));
                        })
                        .catch(function (t) {
                          r(t);
                        });
                  case 11:
                  case "end":
                    return t.stop();
                }
            }, t);
          })
        );
        return function (e, r, n) {
          return t.apply(this, arguments);
        };
      })(),
      _ = (function () {
        var t = Object(v["a"])(
          regeneratorRuntime.mark(function t(e, r, n) {
            var i, o, s, u, a, l, f;
            return regeneratorRuntime.wrap(function (t) {
              while (1)
                switch ((t.prev = t.next)) {
                  case 0:
                    if (((i = e.payload), "eth_accounts" === i.method)) {
                      t.next = 3;
                      break;
                    }
                    return t.abrupt("return", n());
                  case 3:
                    (o = window.extensionID),
                      (s = window.location.origin),
                      (u = { detail: { from: s } }),
                      (a = h["t"].replace("{{id}}", o)),
                      (l = h["z"].replace("{{id}}", o)),
                      (f = h["F"].replace("{{id}}", o)),
                      c(a, u, l, f)
                        .then(function (t) {
                          r(null, Object(g["a"])(i.id, t.payload));
                        })
                        .catch(function (t) {
                          r(t);
                        });
                  case 10:
                  case "end":
                    return t.stop();
                }
            }, t);
          })
        );
        return function (e, r, n) {
          return t.apply(this, arguments);
        };
      })(),
      x = (function () {
        var t = Object(v["a"])(
          regeneratorRuntime.mark(function t(e, r, n) {
            var i, o, s, u, a, l, f;
            return regeneratorRuntime.wrap(function (t) {
              while (1)
                switch ((t.prev = t.next)) {
                  case 0:
                    if (((i = e.payload), "eth_coinbase" === i.method)) {
                      t.next = 3;
                      break;
                    }
                    return t.abrupt("return", n());
                  case 3:
                    (o = window.extensionID),
                      (s = window.location.hostname),
                      (u = { detail: { from: s } }),
                      (a = h["t"].replace("{{id}}", o)),
                      (l = h["z"].replace("{{id}}", o)),
                      (f = h["F"].replace("{{id}}", o)),
                      c(a, u, l, f)
                        .then(function (t) {
                          r(null, Object(g["a"])(i.id, t.payload[0]));
                        })
                        .catch(function (t) {
                          r(t);
                        });
                  case 10:
                  case "end":
                    return t.stop();
                }
            }, t);
          })
        );
        return function (e, r, n) {
          return t.apply(this, arguments);
        };
      })(),
      S = (function () {
        var t = Object(v["a"])(
          regeneratorRuntime.mark(function t(e, r, n) {
            var i, o, s;
            return regeneratorRuntime.wrap(function (t) {
              while (1)
                switch ((t.prev = t.next)) {
                  case 0:
                    if (((i = e.payload), "eth_subscribe" === i.method)) {
                      t.next = 3;
                      break;
                    }
                    return t.abrupt("return", n());
                  case 3:
                    (o = window.extensionID),
                      (s = new CustomEvent(h["L"].replace("{{id}}", o), {
                        detail: i,
                      })),
                      window.addEventListener(
                        h["M"].replace("{{id}}", o),
                        function (t) {
                          r(null, Object(g["a"])(i, t.detail));
                        }
                      ),
                      window.addEventListener(
                        h["Q"].replace("{{id}}", o),
                        function (t) {
                          window.ethereum.emit("data", t.detail);
                        }
                      ),
                      window.addEventListener(h["F"], function (t) {
                        t.detail
                          ? r(new Error(t.detail))
                          : r(new Error("User cancelled request!"));
                      }),
                      window.dispatchEvent(s);
                  case 9:
                  case "end":
                    return t.stop();
                }
            }, t);
          })
        );
        return function (e, r, n) {
          return t.apply(this, arguments);
        };
      })(),
      E = (function () {
        var t = Object(v["a"])(
          regeneratorRuntime.mark(function t(e, r, n) {
            var i, o, s, u, a, l;
            return regeneratorRuntime.wrap(function (t) {
              while (1)
                switch ((t.prev = t.next)) {
                  case 0:
                    if (((i = e.payload), "eth_unsubscribe" === i.method)) {
                      t.next = 3;
                      break;
                    }
                    return t.abrupt("return", n());
                  case 3:
                    (o = window.extensionID),
                      (s = { detail: i }),
                      (u = h["R"].replace("{{id}}", o)),
                      (a = h["S"].replace("{{id}}", o)),
                      (l = h["F"].replace("{{id}}", o)),
                      c(u, s, a, l)
                        .then(function (t) {
                          r(null, t);
                        })
                        .catch(function (t) {
                          r(t);
                        });
                  case 9:
                  case "end":
                    return t.stop();
                }
            }, t);
          })
        );
        return function (e, r, n) {
          return t.apply(this, arguments);
        };
      })(),
      A = r("faa1").EventEmitter,
      k = (function (t) {
        Object(s["a"])(r, t);
        var e = Object(u["a"])(r);
        function r(t) {
          var i;
          return (
            Object(n["a"])(this, r),
            (i = e.call(this)),
            (i.host = t),
            (i.middleware = new m["a"]()),
            i.middleware.use(b),
            i.middleware.use(w),
            i.middleware.use(M),
            i.middleware.use(_),
            i.middleware.use(x),
            i.middleware.use(S),
            i.middleware.use(E),
            (i.requestManager = new p()),
            (i._id = 0),
            i.setListeners(),
            (i.httpProvider = {
              sendPromise: function (t) {
                var e =
                  arguments.length > 1 && void 0 !== arguments[1]
                    ? arguments[1]
                    : [];
                return new Promise(function (r, n) {
                  if (!t || "string" !== typeof t)
                    return n(new Error("Method is not a valid string."));
                  if (!(e instanceof Array))
                    return n(new Error("Params is not a valid array."));
                  var o = i._id++,
                    s = "2.0",
                    u =
                      t && "string" === typeof t
                        ? { jsonrpc: s, id: o, method: t, params: e }
                        : t,
                    a = i.requestManager,
                    h = { payload: u, requestManager: a },
                    l = function (t, e) {
                      t && n(t), r(e);
                    };
                  i.middleware.run(h, l).then(function () {
                    i.requestManager.provider.send(h.payload, l);
                  });
                });
              },
              send: function (t, e) {
                var r = this;
                return new Promise(function (n, i) {
                  r.sendPromise(t, e)
                    .then(function (t) {
                      n(t.result);
                    })
                    .catch(i);
                });
              },
              sendAsync: function (t, e) {
                this.sendPromise(t.method, t.params)
                  .then(function (r) {
                    (r.id = t.id ? t.id : r.id), e(null, r);
                  })
                  .catch(function (t) {
                    e(t);
                  });
              },
              setMaxListeners: i.setMaxListeners,
              isMew: !0,
              on: i.on,
              emit: i.emit,
              requestManager: i.requestManager,
              removeListener: function () {
                i.removeListener(), i.clearListeners();
              },
              enable: function () {
                return this.sendPromise("eth_requestAccounts").then(function (
                  t
                ) {
                  return t.result;
                });
              },
            }),
            Object(o["a"])(i, i.httpProvider)
          );
        }
        return (
          Object(i["a"])(r, [
            {
              key: "setListeners",
              value: function () {
                var t = window.extensionID,
                  e = this;
                window.addEventListener(
                  h["x"].replace("{{id}}", t),
                  function (t) {
                    e.httpProvider.emit("networkChanged", t.detail.payload);
                  }
                ),
                  window.addEventListener(
                    h["r"].replace("{{id}}", t),
                    function (t) {
                      e.httpProvider.emit("chainChanged", t.detail.payload);
                    }
                  ),
                  window.addEventListener(
                    h["w"].replace("{{id}}", t),
                    function () {
                      e.httpProvider.emit("connect");
                    }
                  );
              },
            },
            {
              key: "clearListeners",
              value: function () {
                var t = window.extensionID;
                window.removeEventListener(
                  h["x"].replace("{{id}}", t),
                  function () {}
                ),
                  window.removeEventListener(
                    h["r"].replace("{{id}}", t),
                    function () {}
                  );
              },
            },
            {
              key: "_emitClose",
              value: function (t, e) {
                this.emit("close", t, e),
                  this.httpProvider.removeAllListeners();
              },
            },
          ]),
          r
        );
      })(A),
      O = k,
      T = new O().setMaxListeners(0);
    (window.hasOwnProperty("web3") && window.web3) ||
    (window.hasOwnProperty("ethereum") && window.ethereum)
      ? ((window.web3 &&
          window.web3.currentProvider &&
          window.web3.currentProvider.isMew) ||
          (window.ethereum && window.ethereum.isMew)) &&
        window.dispatchEvent(event)
      : (console.info("MEWCX Web3 provider injected"), (window.ethereum = T));
  },
  ddb0: function (t, e, r) {
    var n = r("da84"),
      i = r("fdbc"),
      o = r("e260"),
      s = r("9112"),
      u = r("b622"),
      a = u("iterator"),
      h = u("toStringTag"),
      l = o.values;
    for (var f in i) {
      var c = n[f],
        d = c && c.prototype;
      if (d) {
        if (d[a] !== l)
          try {
            s(d, a, l);
          } catch (m) {
            d[a] = l;
          }
        if ((d[h] || s(d, h, f), i[f]))
          for (var p in o)
            if (d[p] !== o[p])
              try {
                s(d, p, o[p]);
              } catch (m) {
                d[p] = o[p];
              }
      }
    }
  },
  df75: function (t, e, r) {
    var n = r("ca84"),
      i = r("7839");
    t.exports =
      Object.keys ||
      function (t) {
        return n(t, i);
      };
  },
  e01a: function (t, e, r) {
    "use strict";
    var n = r("23e7"),
      i = r("83ab"),
      o = r("da84"),
      s = r("5135"),
      u = r("861d"),
      a = r("9bf2").f,
      h = r("e893"),
      l = o.Symbol;
    if (
      i &&
      "function" == typeof l &&
      (!("description" in l.prototype) || void 0 !== l().description)
    ) {
      var f = {},
        c = function () {
          var t =
              arguments.length < 1 || void 0 === arguments[0]
                ? void 0
                : String(arguments[0]),
            e = this instanceof c ? new l(t) : void 0 === t ? l() : l(t);
          return "" === t && (f[e] = !0), e;
        };
      h(c, l);
      var d = (c.prototype = l.prototype);
      d.constructor = c;
      var p = d.toString,
        m = "Symbol(test)" == String(l("test")),
        v = /^Symbol\((.*)\)[^)]+$/;
      a(d, "description", {
        configurable: !0,
        get: function () {
          var t = u(this) ? this.valueOf() : this,
            e = p.call(t);
          if (s(f, t)) return "";
          var r = m ? e.slice(7, -1) : e.replace(v, "$1");
          return "" === r ? void 0 : r;
        },
      }),
        n({ global: !0, forced: !0 }, { Symbol: c });
    }
  },
  e099: function (t, e, r) {
    "use strict";
    var n = function (t) {
      switch (typeof t) {
        case "string":
          return t;
        case "boolean":
          return t ? "true" : "false";
        case "number":
          return isFinite(t) ? t : "";
        default:
          return "";
      }
    };
    t.exports = function (t, e, r, u) {
      return (
        (e = e || "&"),
        (r = r || "="),
        null === t && (t = void 0),
        "object" === typeof t
          ? o(s(t), function (s) {
              var u = encodeURIComponent(n(s)) + r;
              return i(t[s])
                ? o(t[s], function (t) {
                    return u + encodeURIComponent(n(t));
                  }).join(e)
                : u + encodeURIComponent(n(t[s]));
            }).join(e)
          : u
          ? encodeURIComponent(n(u)) + r + encodeURIComponent(n(t))
          : ""
      );
    };
    var i =
      Array.isArray ||
      function (t) {
        return "[object Array]" === Object.prototype.toString.call(t);
      };
    function o(t, e) {
      if (t.map) return t.map(e);
      for (var r = [], n = 0; n < t.length; n++) r.push(e(t[n], n));
      return r;
    }
    var s =
      Object.keys ||
      function (t) {
        var e = [];
        for (var r in t)
          Object.prototype.hasOwnProperty.call(t, r) && e.push(r);
        return e;
      };
  },
  e0bf: function (t, e, r) {
    var n, i;
    (function (r, o, s, u, a, h) {
      var l = m(function (t, e) {
        var r = e.length;
        return m(function (n) {
          for (var i = 0; i < n.length; i++) e[r + i] = n[i];
          return (e.length = r + n.length), t.apply(this, e);
        });
      });
      m(function (t) {
        var e = R(t);
        function r(t, e) {
          return [p(t, e)];
        }
        return m(function (t) {
          return L(r, t, e)[0];
        });
      });
      function f(t, e) {
        return function () {
          return t.call(this, e.apply(this, arguments));
        };
      }
      function c(t) {
        return function (e) {
          return e[t];
        };
      }
      var d = m(function (t) {
        return m(function (e) {
          for (var r, n = 0; n < _(t); n++) if (((r = p(e, t[n])), r)) return r;
        });
      });
      function p(t, e) {
        return e.apply(h, t);
      }
      function m(t) {
        var e = t.length - 1,
          r = s.prototype.slice;
        if (0 == e)
          return function () {
            return t.call(this, r.call(arguments));
          };
        if (1 == e)
          return function () {
            return t.call(this, arguments[0], r.call(arguments, 1));
          };
        var n = s(t.length);
        return function () {
          for (var i = 0; i < e; i++) n[i] = arguments[i];
          return (n[e] = r.call(arguments, e)), t.apply(this, n);
        };
      }
      function v(t) {
        return function (e, r) {
          return t(r, e);
        };
      }
      function g(t, e) {
        return function (r) {
          return t(r) && e(r);
        };
      }
      function y() {}
      function w() {
        return !0;
      }
      function b(t) {
        return function () {
          return t;
        };
      }
      function M(t, e) {
        return e && e.constructor === t;
      }
      var _ = c("length"),
        x = l(M, String);
      function S(t) {
        return t !== h;
      }
      function E(t, e) {
        return (
          e instanceof o &&
          I(function (t) {
            return t in e;
          }, t)
        );
      }
      function A(t, e) {
        return [t, e];
      }
      var k = null,
        O = c(0),
        T = c(1);
      function R(t) {
        return q(t.reduce(v(A), k));
      }
      var C = m(R);
      function j(t) {
        return L(
          function (t, e) {
            return t.unshift(e), t;
          },
          [],
          t
        );
      }
      function N(t, e) {
        return e ? A(t(O(e)), N(t, T(e))) : k;
      }
      function L(t, e, r) {
        return r ? t(L(t, e, T(r)), O(r)) : e;
      }
      function P(t, e, r) {
        return n(t, r || y);
        function n(t, r) {
          return t ? (e(O(t)) ? (r(O(t)), T(t)) : A(O(t), n(T(t), r))) : k;
        }
      }
      function I(t, e) {
        return !e || (t(O(e)) && I(t, T(e)));
      }
      function B(t, e) {
        t && (O(t).apply(null, e), B(T(t), e));
      }
      function q(t) {
        function e(t, r) {
          return t ? e(T(t), A(O(t), r)) : r;
        }
        return e(t, k);
      }
      function U(t, e) {
        return e && (t(O(e)) ? O(e) : U(t, T(e)));
      }
      function H(t) {
        "use strict";
        var e,
          r,
          n,
          i = t(pt).emit,
          o = t(mt).emit,
          s = t(vt).emit,
          a = t(ut).emit,
          l = 65536,
          f = /[\\"\n]/g,
          c = 0,
          d = c++,
          p = c++,
          m = c++,
          v = c++,
          g = c++,
          y = c++,
          w = c++,
          b = c++,
          M = c++,
          _ = c++,
          x = c++,
          S = c++,
          E = c++,
          A = c++,
          k = c++,
          O = c++,
          T = c++,
          R = c++,
          C = c++,
          j = c++,
          N = c,
          L = l,
          P = h,
          I = "",
          B = !1,
          q = !1,
          U = d,
          H = [],
          D = null,
          F = 0,
          z = 0,
          Z = 0,
          W = 0,
          G = 1;
        function Y() {
          var t = 0;
          P !== h &&
            P.length > l &&
            ($("Max buffer length exceeded: textNode"),
            (t = Math.max(t, P.length))),
            I.length > l &&
              ($("Max buffer length exceeded: numberNode"),
              (t = Math.max(t, I.length))),
            (L = l - t + Z);
        }
        function $(t) {
          P !== h && (o(P), s(), (P = h)),
            (e = u(t + "\nLn: " + G + "\nCol: " + W + "\nChr: " + r)),
            a(gt(h, h, e));
        }
        function X() {
          if (U == d) return o({}), s(), void (q = !0);
          (U === p && 0 === z) || $("Unexpected end"),
            P !== h && (o(P), s(), (P = h)),
            (q = !0);
        }
        function V(t) {
          return "\r" == t || "\n" == t || " " == t || "\t" == t;
        }
        function J(t) {
          if (!e) {
            if (q) return $("Cannot write after close");
            var u = 0;
            r = t[0];
            while (r) {
              if ((u > 0 && (n = r), (r = t[u++]), !r)) break;
              switch ((Z++, "\n" == r ? (G++, (W = 0)) : W++, U)) {
                case d:
                  if ("{" === r) U = m;
                  else if ("[" === r) U = g;
                  else if (!V(r)) return $("Non-whitespace before {[.");
                  continue;
                case b:
                case m:
                  if (V(r)) continue;
                  if (U === b) H.push(M);
                  else {
                    if ("}" === r) {
                      o({}), s(), (U = H.pop() || p);
                      continue;
                    }
                    H.push(v);
                  }
                  if ('"' !== r)
                    return $('Malformed object key should start with " ');
                  U = w;
                  continue;
                case M:
                case v:
                  if (V(r)) continue;
                  if (":" === r)
                    U === v
                      ? (H.push(v), P !== h && (o({}), i(P), (P = h)), z++)
                      : P !== h && (i(P), (P = h)),
                      (U = p);
                  else if ("}" === r)
                    P !== h && (o(P), s(), (P = h)),
                      s(),
                      z--,
                      (U = H.pop() || p);
                  else {
                    if ("," !== r) return $("Bad object");
                    U === v && H.push(v),
                      P !== h && (o(P), s(), (P = h)),
                      (U = b);
                  }
                  continue;
                case g:
                case p:
                  if (V(r)) continue;
                  if (U === g) {
                    if ((o([]), z++, (U = p), "]" === r)) {
                      s(), z--, (U = H.pop() || p);
                      continue;
                    }
                    H.push(y);
                  }
                  if ('"' === r) U = w;
                  else if ("{" === r) U = m;
                  else if ("[" === r) U = g;
                  else if ("t" === r) U = _;
                  else if ("f" === r) U = E;
                  else if ("n" === r) U = T;
                  else if ("-" === r) I += r;
                  else if ("0" === r) (I += r), (U = N);
                  else {
                    if (-1 === "123456789".indexOf(r)) return $("Bad value");
                    (I += r), (U = N);
                  }
                  continue;
                case y:
                  if ("," === r)
                    H.push(y), P !== h && (o(P), s(), (P = h)), (U = p);
                  else {
                    if ("]" !== r) {
                      if (V(r)) continue;
                      return $("Bad array");
                    }
                    P !== h && (o(P), s(), (P = h)),
                      s(),
                      z--,
                      (U = H.pop() || p);
                  }
                  continue;
                case w:
                  P === h && (P = "");
                  var a = u - 1;
                  t: while (1) {
                    while (F > 0)
                      if (
                        ((D += r),
                        (r = t.charAt(u++)),
                        4 === F
                          ? ((P += String.fromCharCode(parseInt(D, 16))),
                            (F = 0),
                            (a = u - 1))
                          : F++,
                        !r)
                      )
                        break t;
                    if ('"' === r && !B) {
                      (U = H.pop() || p), (P += t.substring(a, u - 1));
                      break;
                    }
                    if (
                      "\\" === r &&
                      !B &&
                      ((B = !0),
                      (P += t.substring(a, u - 1)),
                      (r = t.charAt(u++)),
                      !r)
                    )
                      break;
                    if (B) {
                      if (
                        ((B = !1),
                        "n" === r
                          ? (P += "\n")
                          : "r" === r
                          ? (P += "\r")
                          : "t" === r
                          ? (P += "\t")
                          : "f" === r
                          ? (P += "\f")
                          : "b" === r
                          ? (P += "\b")
                          : "u" === r
                          ? ((F = 1), (D = ""))
                          : (P += r),
                        (r = t.charAt(u++)),
                        (a = u - 1),
                        r)
                      )
                        continue;
                      break;
                    }
                    f.lastIndex = u;
                    var l = f.exec(t);
                    if (!l) {
                      (u = t.length + 1), (P += t.substring(a, u - 1));
                      break;
                    }
                    if (((u = l.index + 1), (r = t.charAt(l.index)), !r)) {
                      P += t.substring(a, u - 1);
                      break;
                    }
                  }
                  continue;
                case _:
                  if (!r) continue;
                  if ("r" !== r) return $("Invalid true started with t" + r);
                  U = x;
                  continue;
                case x:
                  if (!r) continue;
                  if ("u" !== r) return $("Invalid true started with tr" + r);
                  U = S;
                  continue;
                case S:
                  if (!r) continue;
                  if ("e" !== r) return $("Invalid true started with tru" + r);
                  o(!0), s(), (U = H.pop() || p);
                  continue;
                case E:
                  if (!r) continue;
                  if ("a" !== r) return $("Invalid false started with f" + r);
                  U = A;
                  continue;
                case A:
                  if (!r) continue;
                  if ("l" !== r) return $("Invalid false started with fa" + r);
                  U = k;
                  continue;
                case k:
                  if (!r) continue;
                  if ("s" !== r) return $("Invalid false started with fal" + r);
                  U = O;
                  continue;
                case O:
                  if (!r) continue;
                  if ("e" !== r)
                    return $("Invalid false started with fals" + r);
                  o(!1), s(), (U = H.pop() || p);
                  continue;
                case T:
                  if (!r) continue;
                  if ("u" !== r) return $("Invalid null started with n" + r);
                  U = R;
                  continue;
                case R:
                  if (!r) continue;
                  if ("l" !== r) return $("Invalid null started with nu" + r);
                  U = C;
                  continue;
                case C:
                  if (!r) continue;
                  if ("l" !== r) return $("Invalid null started with nul" + r);
                  o(null), s(), (U = H.pop() || p);
                  continue;
                case j:
                  if ("." !== r) return $("Leading zero not followed by .");
                  (I += r), (U = N);
                  continue;
                case N:
                  if (-1 !== "0123456789".indexOf(r)) I += r;
                  else if ("." === r) {
                    if (-1 !== I.indexOf("."))
                      return $("Invalid number has two dots");
                    I += r;
                  } else if ("e" === r || "E" === r) {
                    if (-1 !== I.indexOf("e") || -1 !== I.indexOf("E"))
                      return $("Invalid number has two exponential");
                    I += r;
                  } else if ("+" === r || "-" === r) {
                    if ("e" !== n && "E" !== n)
                      return $("Invalid symbol in number");
                    I += r;
                  } else
                    I && (o(parseFloat(I)), s(), (I = "")),
                      u--,
                      (U = H.pop() || p);
                  continue;
                default:
                  return $("Unknown state: " + U);
              }
            }
            Z >= L && Y();
          }
        }
        t(ft).on(J), t(ct).on(X);
      }
      function D(t, e) {
        "use strict";
        var r,
          n = {};
        function i(t) {
          return function (e) {
            r = t(r, e);
          };
        }
        for (var o in e) t(o).on(i(e[o]), n);
        t(ot).on(function (t) {
          var e,
            n = O(r),
            i = X(n),
            o = T(r);
          o && ((e = V(O(o))), (e[i] = t));
        }),
          t(st).on(function () {
            var t,
              e = O(r),
              n = X(e),
              i = T(r);
            i && ((t = V(O(i))), delete t[n]);
          }),
          t(dt).on(function () {
            for (var r in e) t(r).un(n);
          });
      }
      function F(t) {
        var e = {};
        return (
          t &&
            t.split("\r\n").forEach(function (t) {
              var r = t.indexOf(": ");
              e[t.substring(0, r)] = t.substring(r + 2);
            }),
          e
        );
      }
      function z(t, e) {
        function r(t) {
          return { "http:": 80, "https:": 443 }[t];
        }
        function n(e) {
          return e.port || r(e.protocol || t.protocol);
        }
        return !!(
          (e.protocol && e.protocol != t.protocol) ||
          (e.host && e.host != t.host) ||
          (e.host && n(e) != n(t))
        );
      }
      function Z(t) {
        var e = /(\w+:)?(?:\/\/)([\w.-]+)?(?::(\d+))?\/?/,
          r = e.exec(t) || [];
        return { protocol: r[1] || "", host: r[2] || "", port: r[3] || "" };
      }
      function W() {
        return new XMLHttpRequest();
      }
      function G(t, e, n, i, o, s, u) {
        "use strict";
        var a = t(ft).emit,
          f = t(ut).emit,
          c = 0,
          d = !0;
        function p() {
          var t = e.responseText,
            r = t.substr(c);
          r && a(r), (c = _(t));
        }
        t(dt).on(function () {
          (e.onreadystatechange = null), e.abort();
        }),
          "onprogress" in e && (e.onprogress = p),
          (e.onreadystatechange = function () {
            function r() {
              try {
                d && t(lt).emit(e.status, F(e.getAllResponseHeaders())),
                  (d = !1);
              } catch (r) {}
            }
            switch (e.readyState) {
              case 2:
              case 3:
                return r();
              case 4:
                r();
                var n = 2 == String(e.status)[0];
                n ? (p(), t(ct).emit()) : f(gt(e.status, e.responseText));
            }
          });
        try {
          for (var m in (e.open(n, i, !0), s)) e.setRequestHeader(m, s[m]);
          z(r.location, Z(i)) ||
            e.setRequestHeader("X-Requested-With", "XMLHttpRequest"),
            (e.withCredentials = u),
            e.send(o);
        } catch (v) {
          r.setTimeout(l(f, gt(h, h, v)), 0);
        }
      }
      var Y = (function () {
        var t = function (t) {
            return t.exec.bind(t);
          },
          e = m(function (e) {
            return e.unshift(/^/), t(RegExp(e.map(c("source")).join("")));
          }),
          r = /(\$?)/,
          n = /([\w-_]+|\*)/,
          i = /()/,
          o = /\["([^"]+)"\]/,
          s = /\[(\d+|\*)\]/,
          u = /{([\w ]*?)}/,
          a = /(?:{([\w ]*?)})?/,
          h = e(r, n, a),
          l = e(r, o, a),
          f = e(r, s, a),
          p = e(r, i, u),
          v = e(/\.\./),
          g = e(/\./),
          y = e(r, /!/),
          w = e(/$/);
        return function (t) {
          return t(d(h, l, f, p), v, g, y, w);
        };
      })();
      function $(t, e) {
        return { key: t, node: e };
      }
      var X = c("key"),
        V = c("node"),
        J = {};
      function K(t) {
        var e = t(nt).emit,
          r = t(it).emit,
          n = t(ht).emit,
          i = t(at).emit;
        function o(t, e) {
          var r = V(O(t));
          return M(s, r) ? h(t, _(r), e) : t;
        }
        function u(t, e) {
          if (!t) return n(e), h(t, J, e);
          var r = o(t, e),
            i = T(r),
            s = X(O(r));
          return a(i, s, e), A($(s, e), i);
        }
        function a(t, e, r) {
          V(O(t))[e] = r;
        }
        function h(t, r, n) {
          t && a(t, r, n);
          var i = A($(r, n), t);
          return e(i), i;
        }
        function l(t) {
          return r(t), T(t) || i(V(O(t)));
        }
        var f = {};
        return (f[mt] = u), (f[vt] = l), (f[pt] = h), f;
      }
      var Q = Y(function (t, e, r, n, i) {
        var o = 1,
          s = 2,
          a = 3,
          h = f(X, O),
          c = f(V, O);
        function p(t, e) {
          var r = e[s],
            n =
              r && "*" != r
                ? function (t) {
                    return h(t) == r;
                  }
                : w;
          return g(n, t);
        }
        function m(t, e) {
          var r = e[a];
          if (!r) return t;
          var n = l(E, R(r.split(/\W+/))),
            i = f(n, c);
          return g(i, t);
        }
        function v(t, e) {
          var r = !!e[o];
          return r ? g(t, O) : t;
        }
        function y(t) {
          if (t == w) return w;
          function e(t) {
            return h(t) != J;
          }
          return g(e, f(t, T));
        }
        function b(t) {
          if (t == w) return w;
          var e = M(),
            r = t,
            n = y(function (t) {
              return i(t);
            }),
            i = d(e, r, n);
          return i;
        }
        function M() {
          return function (t) {
            return h(t) == J;
          };
        }
        function x(t) {
          return function (e) {
            var r = t(e);
            return !0 === r ? O(e) : r;
          };
        }
        function S(t, e, r) {
          return L(
            function (t, e) {
              return e(t, r);
            },
            e,
            t
          );
        }
        function A(t, e, r, n, i) {
          var o = t(r);
          if (o) {
            var s = S(e, n, o),
              u = r.substr(_(o[0]));
            return i(u, s);
          }
        }
        function k(t, e) {
          return l(A, t, e);
        }
        var j = d(
          k(t, C(v, m, p, y)),
          k(e, C(b)),
          k(r, C()),
          k(n, C(v, M)),
          k(i, C(x)),
          function (t) {
            throw u('"' + t + '" could not be tokenised');
          }
        );
        function N(t, e) {
          return e;
        }
        function P(t, e) {
          var r = t ? P : N;
          return j(t, e, r);
        }
        return function (t) {
          try {
            return P(t, w);
          } catch (e) {
            throw u('Could not compile "' + t + '" because ' + e.message);
          }
        };
      });
      function tt(t, e, r) {
        var n, i;
        function o(t) {
          return function (e) {
            return e.id == t;
          };
        }
        return {
          on: function (r, o) {
            var s = { listener: r, id: o || r };
            return e && e.emit(t, r, s.id), (n = A(s, n)), (i = A(r, i)), this;
          },
          emit: function () {
            B(i, arguments);
          },
          un: function (e) {
            var s;
            (n = P(n, o(e), function (t) {
              s = t;
            })),
              s &&
                ((i = P(i, function (t) {
                  return t == s.listener;
                })),
                r && r.emit(t, s.listener, s.id));
          },
          listeners: function () {
            return i;
          },
          hasListener: function (t) {
            var e = t ? o(t) : w;
            return S(U(e, n));
          },
        };
      }
      function et() {
        var t = {},
          e = n("newListener"),
          r = n("removeListener");
        function n(n) {
          return (t[n] = tt(n, e, r));
        }
        function i(e) {
          return t[e] || n(e);
        }
        return (
          ["emit", "on", "un"].forEach(function (t) {
            i[t] = m(function (e, r) {
              p(r, i(e)[t]);
            });
          }),
          i
        );
      }
      var rt = 1,
        nt = rt++,
        it = rt++,
        ot = rt++,
        st = rt++,
        ut = "fail",
        at = rt++,
        ht = rt++,
        lt = "start",
        ft = "data",
        ct = "end",
        dt = rt++,
        pt = rt++,
        mt = rt++,
        vt = rt++;
      function gt(t, e, r) {
        try {
          var n = a.parse(e);
        } catch (i) {}
        return { statusCode: t, body: e, jsonBody: n, thrown: r };
      }
      function yt(t, e) {
        var r = { node: t(it), path: t(nt) };
        function n(t, e, r) {
          var n = q(r);
          t(e, j(T(N(X, n))), j(N(V, n)));
        }
        function i(e, r, i) {
          var o = t(e).emit;
          r.on(function (t) {
            var e = i(t);
            !1 !== e && n(o, V(e), t);
          }, e),
            t("removeListener").on(function (n) {
              n == e && (t(n).listeners() || r.un(e));
            });
        }
        t("newListener").on(function (t) {
          var n = /(node|path):(.*)/.exec(t);
          if (n) {
            var o = r[n[1]];
            o.hasListener(t) || i(t, o, e(n[2]));
          }
        });
      }
      function wt(t, e) {
        var r,
          n = /^(node|path):./,
          i = t(at),
          o = t(st).emit,
          s = t(ot).emit,
          a = m(function (e, i) {
            if (r[e]) p(i, r[e]);
            else {
              var o = t(e),
                s = i[0];
              n.test(e) ? c(o, s) : o.on(s);
            }
            return r;
          }),
          h = function (e, n, o) {
            if ("done" == e) i.un(n);
            else if ("node" == e || "path" == e) t.un(e + ":" + n, o);
            else {
              var s = n;
              t(e).un(s);
            }
            return r;
          };
        function f(e, n) {
          return t(e).on(d(n), n), r;
        }
        function c(t, e, n) {
          n = n || e;
          var i = d(e);
          return (
            t.on(function () {
              var e = !1;
              (r.forget = function () {
                e = !0;
              }),
                p(arguments, i),
                delete r.forget,
                e && t.un(n);
            }, n),
            r
          );
        }
        function d(t) {
          return function () {
            try {
              return t.apply(r, arguments);
            } catch (e) {
              setTimeout(function () {
                throw new u(e.message);
              });
            }
          };
        }
        function v(e, r) {
          return t(e + ":" + r);
        }
        function g(t) {
          return function () {
            var e = t.apply(this, arguments);
            S(e) && (e == _t.drop ? o() : s(e));
          };
        }
        function w(t, e, r) {
          var n;
          (n = "node" == t ? g(r) : r), c(v(t, e), n, r);
        }
        function M(t, e) {
          for (var r in e) w(t, r, e[r]);
        }
        function _(t, e, n) {
          return x(e) ? w(t, e, n) : M(t, e), r;
        }
        return (
          t(ht).on(function (t) {
            r.root = b(t);
          }),
          t(lt).on(function (t, e) {
            r.header = function (t) {
              return t ? e[t] : e;
            };
          }),
          (r = {
            on: a,
            addListener: a,
            removeListener: h,
            emit: t.emit,
            node: l(_, "node"),
            path: l(_, "path"),
            done: l(c, i),
            start: l(f, lt),
            fail: t(ut).on,
            abort: t(dt).emit,
            header: y,
            root: y,
            source: e,
          })
        );
      }
      function bt(t, e, r, n, i) {
        var o = et();
        return (
          e && G(o, W(), t, e, r, n, i), H(o), D(o, K(o)), yt(o, Q), wt(o, e)
        );
      }
      function Mt(t, e, r, n, i, o, s) {
        function u(t, e) {
          return (
            !1 === e &&
              (-1 == t.indexOf("?") ? (t += "?") : (t += "&"),
              (t += "_=" + new Date().getTime())),
            t
          );
        }
        return (
          (i = i ? a.parse(a.stringify(i)) : {}),
          n
            ? (x(n) ||
                ((n = a.stringify(n)),
                (i["Content-Type"] = i["Content-Type"] || "application/json")),
              (i["Content-Length"] = i["Content-Length"] || n.length))
            : (n = null),
          t(r || "GET", u(e, s), n, i, o || !1)
        );
      }
      function _t(t) {
        var e = C("resume", "pause", "pipe"),
          r = l(E, e);
        return t
          ? r(t) || x(t)
            ? Mt(bt, t)
            : Mt(
                bt,
                t.url,
                t.method,
                t.body,
                t.headers,
                t.withCredentials,
                t.cached
              )
          : bt();
      }
      (_t.drop = function () {
        return _t.drop;
      }),
        (n = []),
        (i = function () {
          return _t;
        }.apply(e, n)),
        i === h || (t.exports = i);
    })(
      (function () {
        try {
          return window;
        } catch (t) {
          return self;
        }
      })(),
      Object,
      Array,
      Error,
      JSON
    );
  },
  e163: function (t, e, r) {
    var n = r("5135"),
      i = r("7b0b"),
      o = r("f772"),
      s = r("e177"),
      u = o("IE_PROTO"),
      a = Object.prototype;
    t.exports = s
      ? Object.getPrototypeOf
      : function (t) {
          return (
            (t = i(t)),
            n(t, u)
              ? t[u]
              : "function" == typeof t.constructor && t instanceof t.constructor
              ? t.constructor.prototype
              : t instanceof Object
              ? a
              : null
          );
        };
  },
  e177: function (t, e, r) {
    var n = r("d039");
    t.exports = !n(function () {
      function t() {}
      return (
        (t.prototype.constructor = null),
        Object.getPrototypeOf(new t()) !== t.prototype
      );
    });
  },
  e260: function (t, e, r) {
    "use strict";
    var n = r("fc6a"),
      i = r("44d2"),
      o = r("3f8c"),
      s = r("69f3"),
      u = r("7dd0"),
      a = "Array Iterator",
      h = s.set,
      l = s.getterFor(a);
    (t.exports = u(
      Array,
      "Array",
      function (t, e) {
        h(this, { type: a, target: n(t), index: 0, kind: e });
      },
      function () {
        var t = l(this),
          e = t.target,
          r = t.kind,
          n = t.index++;
        return !e || n >= e.length
          ? ((t.target = void 0), { value: void 0, done: !0 })
          : "keys" == r
          ? { value: n, done: !1 }
          : "values" == r
          ? { value: e[n], done: !1 }
          : { value: [n, e[n]], done: !1 };
      },
      "values"
    )),
      (o.Arguments = o.Array),
      i("keys"),
      i("values"),
      i("entries");
  },
  e2cc: function (t, e, r) {
    var n = r("6eeb");
    t.exports = function (t, e, r) {
      for (var i in e) n(t, i, e[i], r);
      return t;
    };
  },
  e3db: function (t, e) {
    var r = {}.toString;
    t.exports =
      Array.isArray ||
      function (t) {
        return "[object Array]" == r.call(t);
      };
  },
  e538: function (t, e, r) {
    var n = r("b622");
    e.f = n;
  },
  e667: function (t, e) {
    t.exports = function (t) {
      try {
        return { error: !1, value: t() };
      } catch (e) {
        return { error: !0, value: e };
      }
    };
  },
  e6cf: function (t, e, r) {
    "use strict";
    var n,
      i,
      o,
      s,
      u = r("23e7"),
      a = r("c430"),
      h = r("da84"),
      l = r("d066"),
      f = r("fea9"),
      c = r("6eeb"),
      d = r("e2cc"),
      p = r("d44e"),
      m = r("2626"),
      v = r("861d"),
      g = r("1c0b"),
      y = r("19aa"),
      w = r("8925"),
      b = r("2266"),
      M = r("1c7e"),
      _ = r("4840"),
      x = r("2cf4").set,
      S = r("b575"),
      E = r("cdf9"),
      A = r("44de"),
      k = r("f069"),
      O = r("e667"),
      T = r("69f3"),
      R = r("94ca"),
      C = r("b622"),
      j = r("605d"),
      N = r("2d00"),
      L = C("species"),
      P = "Promise",
      I = T.get,
      B = T.set,
      q = T.getterFor(P),
      U = f,
      H = h.TypeError,
      D = h.document,
      F = h.process,
      z = l("fetch"),
      Z = k.f,
      W = Z,
      G = !!(D && D.createEvent && h.dispatchEvent),
      Y = "function" == typeof PromiseRejectionEvent,
      $ = "unhandledrejection",
      X = "rejectionhandled",
      V = 0,
      J = 1,
      K = 2,
      Q = 1,
      tt = 2,
      et = R(P, function () {
        var t = w(U) !== String(U);
        if (!t) {
          if (66 === N) return !0;
          if (!j && !Y) return !0;
        }
        if (a && !U.prototype["finally"]) return !0;
        if (N >= 51 && /native code/.test(U)) return !1;
        var e = U.resolve(1),
          r = function (t) {
            t(
              function () {},
              function () {}
            );
          },
          n = (e.constructor = {});
        return (n[L] = r), !(e.then(function () {}) instanceof r);
      }),
      rt =
        et ||
        !M(function (t) {
          U.all(t)["catch"](function () {});
        }),
      nt = function (t) {
        var e;
        return !(!v(t) || "function" != typeof (e = t.then)) && e;
      },
      it = function (t, e) {
        if (!t.notified) {
          t.notified = !0;
          var r = t.reactions;
          S(function () {
            var n = t.value,
              i = t.state == J,
              o = 0;
            while (r.length > o) {
              var s,
                u,
                a,
                h = r[o++],
                l = i ? h.ok : h.fail,
                f = h.resolve,
                c = h.reject,
                d = h.domain;
              try {
                l
                  ? (i || (t.rejection === tt && at(t), (t.rejection = Q)),
                    !0 === l
                      ? (s = n)
                      : (d && d.enter(), (s = l(n)), d && (d.exit(), (a = !0))),
                    s === h.promise
                      ? c(H("Promise-chain cycle"))
                      : (u = nt(s))
                      ? u.call(s, f, c)
                      : f(s))
                  : c(n);
              } catch (p) {
                d && !a && d.exit(), c(p);
              }
            }
            (t.reactions = []), (t.notified = !1), e && !t.rejection && st(t);
          });
        }
      },
      ot = function (t, e, r) {
        var n, i;
        G
          ? ((n = D.createEvent("Event")),
            (n.promise = e),
            (n.reason = r),
            n.initEvent(t, !1, !0),
            h.dispatchEvent(n))
          : (n = { promise: e, reason: r }),
          !Y && (i = h["on" + t])
            ? i(n)
            : t === $ && A("Unhandled promise rejection", r);
      },
      st = function (t) {
        x.call(h, function () {
          var e,
            r = t.facade,
            n = t.value,
            i = ut(t);
          if (
            i &&
            ((e = O(function () {
              j ? F.emit("unhandledRejection", n, r) : ot($, r, n);
            })),
            (t.rejection = j || ut(t) ? tt : Q),
            e.error)
          )
            throw e.value;
        });
      },
      ut = function (t) {
        return t.rejection !== Q && !t.parent;
      },
      at = function (t) {
        x.call(h, function () {
          var e = t.facade;
          j ? F.emit("rejectionHandled", e) : ot(X, e, t.value);
        });
      },
      ht = function (t, e, r) {
        return function (n) {
          t(e, n, r);
        };
      },
      lt = function (t, e, r) {
        t.done ||
          ((t.done = !0),
          r && (t = r),
          (t.value = e),
          (t.state = K),
          it(t, !0));
      },
      ft = function (t, e, r) {
        if (!t.done) {
          (t.done = !0), r && (t = r);
          try {
            if (t.facade === e) throw H("Promise can't be resolved itself");
            var n = nt(e);
            n
              ? S(function () {
                  var r = { done: !1 };
                  try {
                    n.call(e, ht(ft, r, t), ht(lt, r, t));
                  } catch (i) {
                    lt(r, i, t);
                  }
                })
              : ((t.value = e), (t.state = J), it(t, !1));
          } catch (i) {
            lt({ done: !1 }, i, t);
          }
        }
      };
    et &&
      ((U = function (t) {
        y(this, U, P), g(t), n.call(this);
        var e = I(this);
        try {
          t(ht(ft, e), ht(lt, e));
        } catch (r) {
          lt(e, r);
        }
      }),
      (n = function (t) {
        B(this, {
          type: P,
          done: !1,
          notified: !1,
          parent: !1,
          reactions: [],
          rejection: !1,
          state: V,
          value: void 0,
        });
      }),
      (n.prototype = d(U.prototype, {
        then: function (t, e) {
          var r = q(this),
            n = Z(_(this, U));
          return (
            (n.ok = "function" != typeof t || t),
            (n.fail = "function" == typeof e && e),
            (n.domain = j ? F.domain : void 0),
            (r.parent = !0),
            r.reactions.push(n),
            r.state != V && it(r, !1),
            n.promise
          );
        },
        catch: function (t) {
          return this.then(void 0, t);
        },
      })),
      (i = function () {
        var t = new n(),
          e = I(t);
        (this.promise = t),
          (this.resolve = ht(ft, e)),
          (this.reject = ht(lt, e));
      }),
      (k.f = Z =
        function (t) {
          return t === U || t === o ? new i(t) : W(t);
        }),
      a ||
        "function" != typeof f ||
        ((s = f.prototype.then),
        c(
          f.prototype,
          "then",
          function (t, e) {
            var r = this;
            return new U(function (t, e) {
              s.call(r, t, e);
            }).then(t, e);
          },
          { unsafe: !0 }
        ),
        "function" == typeof z &&
          u(
            { global: !0, enumerable: !0, forced: !0 },
            {
              fetch: function (t) {
                return E(U, z.apply(h, arguments));
              },
            }
          ))),
      u({ global: !0, wrap: !0, forced: et }, { Promise: U }),
      p(U, P, !1, !0),
      m(P),
      (o = l(P)),
      u(
        { target: P, stat: !0, forced: et },
        {
          reject: function (t) {
            var e = Z(this);
            return e.reject.call(void 0, t), e.promise;
          },
        }
      ),
      u(
        { target: P, stat: !0, forced: a || et },
        {
          resolve: function (t) {
            return E(a && this === o ? U : this, t);
          },
        }
      ),
      u(
        { target: P, stat: !0, forced: rt },
        {
          all: function (t) {
            var e = this,
              r = Z(e),
              n = r.resolve,
              i = r.reject,
              o = O(function () {
                var r = g(e.resolve),
                  o = [],
                  s = 0,
                  u = 1;
                b(t, function (t) {
                  var a = s++,
                    h = !1;
                  o.push(void 0),
                    u++,
                    r.call(e, t).then(function (t) {
                      h || ((h = !0), (o[a] = t), --u || n(o));
                    }, i);
                }),
                  --u || n(o);
              });
            return o.error && i(o.value), r.promise;
          },
          race: function (t) {
            var e = this,
              r = Z(e),
              n = r.reject,
              i = O(function () {
                var i = g(e.resolve);
                b(t, function (t) {
                  i.call(e, t).then(r.resolve, n);
                });
              });
            return i.error && n(i.value), r.promise;
          },
        }
      );
  },
  e870: function (t, e, r) {
    (function (e) {
      var n = r("17fb"),
        i = r("f609"),
        o = r("a6b6"),
        s = r("f1dd"),
        u = r("7d96"),
        a = r("1455"),
        h = function (t) {
          return i.isBN(t);
        },
        l = function (t) {
          return t && t.constructor && "BigNumber" === t.constructor.name;
        },
        f = function (t) {
          try {
            return o.apply(null, arguments);
          } catch (e) {
            throw new Error(e + ' Given value: "' + t + '"');
          }
        },
        c = function (t) {
          return "0x" + f(t).toTwos(256).toString(16, 64);
        },
        d = function (t) {
          return (
            !!/^(0x)?[0-9a-f]{40}$/i.test(t) &&
            (!(
              !/^(0x|0X)?[0-9a-f]{40}$/.test(t) &&
              !/^(0x|0X)?[0-9A-F]{40}$/.test(t)
            ) ||
              p(t))
          );
        },
        p = function (t) {
          t = t.replace(/^0x/i, "");
          for (
            var e = L(t.toLowerCase()).replace(/^0x/i, ""), r = 0;
            r < 40;
            r++
          )
            if (
              (parseInt(e[r], 16) > 7 && t[r].toUpperCase() !== t[r]) ||
              (parseInt(e[r], 16) <= 7 && t[r].toLowerCase() !== t[r])
            )
              return !1;
          return !0;
        },
        m = function (t, e, r) {
          var n = /^0x/i.test(t) || "number" === typeof t;
          t = t.toString(16).replace(/^0x/i, "");
          var i = e - t.length + 1 >= 0 ? e - t.length + 1 : 0;
          return (n ? "0x" : "") + new Array(i).join(r || "0") + t;
        },
        v = function (t, e, r) {
          var n = /^0x/i.test(t) || "number" === typeof t;
          t = t.toString(16).replace(/^0x/i, "");
          var i = e - t.length + 1 >= 0 ? e - t.length + 1 : 0;
          return (n ? "0x" : "") + t + new Array(i).join(r || "0");
        },
        g = function (t) {
          t = s.encode(t);
          var e = "";
          (t = t.replace(/^(?:\u0000)*/, "")),
            (t = t.split("").reverse().join("")),
            (t = t.replace(/^(?:\u0000)*/, "")),
            (t = t.split("").reverse().join(""));
          for (var r = 0; r < t.length; r++) {
            var n = t.charCodeAt(r),
              i = n.toString(16);
            e += i.length < 2 ? "0" + i : i;
          }
          return "0x" + e;
        },
        y = function (t) {
          if (!E(t))
            throw new Error(
              'The parameter "' + t + '" must be a valid HEX string.'
            );
          var e = "",
            r = 0;
          (t = t.replace(/^0x/i, "")),
            (t = t.replace(/^(?:00)*/, "")),
            (t = t.split("").reverse().join("")),
            (t = t.replace(/^(?:00)*/, "")),
            (t = t.split("").reverse().join(""));
          for (var n = t.length, i = 0; i < n; i += 2)
            (r = parseInt(t.substr(i, 2), 16)), (e += String.fromCharCode(r));
          return s.decode(e);
        },
        w = function (t) {
          if (!t) return t;
          if (n.isString(t) && !E(t))
            throw new Error(
              'Given value "' + t + '" is not a valid hex string.'
            );
          return f(t).toNumber();
        },
        b = function (t) {
          if (!t) return t;
          if (n.isString(t) && !E(t))
            throw new Error(
              'Given value "' + t + '" is not a valid hex string.'
            );
          return f(t).toString(10);
        },
        M = function (t) {
          if (n.isNull(t) || n.isUndefined(t)) return t;
          if (!isFinite(t) && !E(t))
            throw new Error('Given input "' + t + '" is not a number.');
          var e = f(t),
            r = e.toString(16);
          return e.lt(new i(0)) ? "-0x" + r.substr(1) : "0x" + r;
        },
        _ = function (t) {
          for (var e = [], r = 0; r < t.length; r++)
            e.push((t[r] >>> 4).toString(16)), e.push((15 & t[r]).toString(16));
          return "0x" + e.join("");
        },
        x = function (t) {
          if (((t = t.toString(16)), !E(t)))
            throw new Error(
              'Given value "' + t + '" is not a valid hex string.'
            );
          t = t.replace(/^0x/i, "");
          for (var e = [], r = 0; r < t.length; r += 2)
            e.push(parseInt(t.substr(r, 2), 16));
          return e;
        },
        S = function (t, r) {
          if (d(t))
            return r ? "address" : "0x" + t.toLowerCase().replace(/^0x/i, "");
          if (n.isBoolean(t)) return r ? "bool" : t ? "0x01" : "0x00";
          if (e.isBuffer(t)) return "0x" + t.toString("hex");
          if (n.isObject(t) && !l(t) && !h(t))
            return r ? "string" : g(JSON.stringify(t));
          if (n.isString(t)) {
            if (0 === t.indexOf("-0x") || 0 === t.indexOf("-0X"))
              return r ? "int256" : M(t);
            if (0 === t.indexOf("0x") || 0 === t.indexOf("0X"))
              return r ? "bytes" : t;
            if (!isFinite(t)) return r ? "string" : g(t);
          }
          return r ? (t < 0 ? "int256" : "uint256") : M(t);
        },
        E = function (t) {
          return (
            (n.isString(t) || n.isNumber(t)) && /^(-)?0x[0-9a-f]*$/i.test(t)
          );
        },
        A = function (t) {
          return (
            (n.isString(t) || n.isNumber(t)) && /^(-0x|0x)?[0-9a-f]*$/i.test(t)
          );
        },
        k = function (t) {
          return a.isBloom(t);
        },
        O = function (t, e) {
          return a.isUserEthereumAddressInBloom(t, e);
        },
        T = function (t, e) {
          return a.isContractAddressInBloom(t, e);
        },
        R = function (t) {
          return a.isTopic(t);
        },
        C = function (t, e) {
          return a.isTopicInBloom(t, e);
        },
        j = function (t, e) {
          return a.isInBloom(t, e);
        },
        N =
          "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        L = function (t) {
          h(t) && (t = t.toString()),
            E(t) && /^0x/i.test(t.toString()) && (t = x(t));
          var e = u.keccak256(t);
          return e === N ? null : e;
        };
      L._Hash = u;
      var P = function (t) {
        return (t = L(t)), null === t ? N : t;
      };
      t.exports = {
        BN: i,
        isBN: h,
        isBigNumber: l,
        toBN: f,
        isAddress: d,
        isBloom: k,
        isUserEthereumAddressInBloom: O,
        isContractAddressInBloom: T,
        isTopic: R,
        isTopicInBloom: C,
        isInBloom: j,
        checkAddressChecksum: p,
        utf8ToHex: g,
        hexToUtf8: y,
        hexToNumber: w,
        hexToNumberString: b,
        numberToHex: M,
        toHex: S,
        hexToBytes: x,
        bytesToHex: _,
        isHex: A,
        isHexStrict: E,
        leftPad: m,
        rightPad: v,
        toTwosComplement: c,
        sha3: L,
        sha3Raw: P,
      };
    }.call(this, r("1c35").Buffer));
  },
  e893: function (t, e, r) {
    var n = r("5135"),
      i = r("56ef"),
      o = r("06cf"),
      s = r("9bf2");
    t.exports = function (t, e) {
      for (var r = i(e), u = s.f, a = o.f, h = 0; h < r.length; h++) {
        var l = r[h];
        n(t, l) || u(t, l, a(e, l));
      }
    };
  },
  e8b5: function (t, e, r) {
    var n = r("c6b6");
    t.exports =
      Array.isArray ||
      function (t) {
        return "Array" == n(t);
      };
  },
  e943: function (t, e, r) {
    (function (t) {
      (function (t, e) {
        "use strict";
        function n(t, e) {
          if (!t) throw new Error(e || "Assertion failed");
        }
        function i(t, e) {
          t.super_ = e;
          var r = function () {};
          (r.prototype = e.prototype),
            (t.prototype = new r()),
            (t.prototype.constructor = t);
        }
        function o(t, e, r) {
          if (o.isBN(t)) return t;
          (this.negative = 0),
            (this.words = null),
            (this.length = 0),
            (this.red = null),
            null !== t &&
              (("le" !== e && "be" !== e) || ((r = e), (e = 10)),
              this._init(t || 0, e || 10, r || "be"));
        }
        var s;
        "object" === typeof t ? (t.exports = o) : (e.BN = o),
          (o.BN = o),
          (o.wordSize = 26);
        try {
          s = r("1c35").Buffer;
        } catch (A) {}
        function u(t, e, r) {
          for (var n = 0, i = Math.min(t.length, r), o = e; o < i; o++) {
            var s = t.charCodeAt(o) - 48;
            (n <<= 4),
              (n |=
                s >= 49 && s <= 54
                  ? s - 49 + 10
                  : s >= 17 && s <= 22
                  ? s - 17 + 10
                  : 15 & s);
          }
          return n;
        }
        function a(t, e, r, n) {
          for (var i = 0, o = Math.min(t.length, r), s = e; s < o; s++) {
            var u = t.charCodeAt(s) - 48;
            (i *= n), (i += u >= 49 ? u - 49 + 10 : u >= 17 ? u - 17 + 10 : u);
          }
          return i;
        }
        (o.isBN = function (t) {
          return (
            t instanceof o ||
            (null !== t &&
              "object" === typeof t &&
              t.constructor.wordSize === o.wordSize &&
              Array.isArray(t.words))
          );
        }),
          (o.max = function (t, e) {
            return t.cmp(e) > 0 ? t : e;
          }),
          (o.min = function (t, e) {
            return t.cmp(e) < 0 ? t : e;
          }),
          (o.prototype._init = function (t, e, r) {
            if ("number" === typeof t) return this._initNumber(t, e, r);
            if ("object" === typeof t) return this._initArray(t, e, r);
            "hex" === e && (e = 16),
              n(e === (0 | e) && e >= 2 && e <= 36),
              (t = t.toString().replace(/\s+/g, ""));
            var i = 0;
            "-" === t[0] && i++,
              16 === e ? this._parseHex(t, i) : this._parseBase(t, e, i),
              "-" === t[0] && (this.negative = 1),
              this.strip(),
              "le" === r && this._initArray(this.toArray(), e, r);
          }),
          (o.prototype._initNumber = function (t, e, r) {
            t < 0 && ((this.negative = 1), (t = -t)),
              t < 67108864
                ? ((this.words = [67108863 & t]), (this.length = 1))
                : t < 4503599627370496
                ? ((this.words = [67108863 & t, (t / 67108864) & 67108863]),
                  (this.length = 2))
                : (n(t < 9007199254740992),
                  (this.words = [67108863 & t, (t / 67108864) & 67108863, 1]),
                  (this.length = 3)),
              "le" === r && this._initArray(this.toArray(), e, r);
          }),
          (o.prototype._initArray = function (t, e, r) {
            if ((n("number" === typeof t.length), t.length <= 0))
              return (this.words = [0]), (this.length = 1), this;
            (this.length = Math.ceil(t.length / 3)),
              (this.words = new Array(this.length));
            for (var i = 0; i < this.length; i++) this.words[i] = 0;
            var o,
              s,
              u = 0;
            if ("be" === r)
              for (i = t.length - 1, o = 0; i >= 0; i -= 3)
                (s = t[i] | (t[i - 1] << 8) | (t[i - 2] << 16)),
                  (this.words[o] |= (s << u) & 67108863),
                  (this.words[o + 1] = (s >>> (26 - u)) & 67108863),
                  (u += 24),
                  u >= 26 && ((u -= 26), o++);
            else if ("le" === r)
              for (i = 0, o = 0; i < t.length; i += 3)
                (s = t[i] | (t[i + 1] << 8) | (t[i + 2] << 16)),
                  (this.words[o] |= (s << u) & 67108863),
                  (this.words[o + 1] = (s >>> (26 - u)) & 67108863),
                  (u += 24),
                  u >= 26 && ((u -= 26), o++);
            return this.strip();
          }),
          (o.prototype._parseHex = function (t, e) {
            (this.length = Math.ceil((t.length - e) / 6)),
              (this.words = new Array(this.length));
            for (var r = 0; r < this.length; r++) this.words[r] = 0;
            var n,
              i,
              o = 0;
            for (r = t.length - 6, n = 0; r >= e; r -= 6)
              (i = u(t, r, r + 6)),
                (this.words[n] |= (i << o) & 67108863),
                (this.words[n + 1] |= (i >>> (26 - o)) & 4194303),
                (o += 24),
                o >= 26 && ((o -= 26), n++);
            r + 6 !== e &&
              ((i = u(t, e, r + 6)),
              (this.words[n] |= (i << o) & 67108863),
              (this.words[n + 1] |= (i >>> (26 - o)) & 4194303)),
              this.strip();
          }),
          (o.prototype._parseBase = function (t, e, r) {
            (this.words = [0]), (this.length = 1);
            for (var n = 0, i = 1; i <= 67108863; i *= e) n++;
            n--, (i = (i / e) | 0);
            for (
              var o = t.length - r,
                s = o % n,
                u = Math.min(o, o - s) + r,
                h = 0,
                l = r;
              l < u;
              l += n
            )
              (h = a(t, l, l + n, e)),
                this.imuln(i),
                this.words[0] + h < 67108864
                  ? (this.words[0] += h)
                  : this._iaddn(h);
            if (0 !== s) {
              var f = 1;
              for (h = a(t, l, t.length, e), l = 0; l < s; l++) f *= e;
              this.imuln(f),
                this.words[0] + h < 67108864
                  ? (this.words[0] += h)
                  : this._iaddn(h);
            }
          }),
          (o.prototype.copy = function (t) {
            t.words = new Array(this.length);
            for (var e = 0; e < this.length; e++) t.words[e] = this.words[e];
            (t.length = this.length),
              (t.negative = this.negative),
              (t.red = this.red);
          }),
          (o.prototype.clone = function () {
            var t = new o(null);
            return this.copy(t), t;
          }),
          (o.prototype._expand = function (t) {
            while (this.length < t) this.words[this.length++] = 0;
            return this;
          }),
          (o.prototype.strip = function () {
            while (this.length > 1 && 0 === this.words[this.length - 1])
              this.length--;
            return this._normSign();
          }),
          (o.prototype._normSign = function () {
            return (
              1 === this.length && 0 === this.words[0] && (this.negative = 0),
              this
            );
          }),
          (o.prototype.inspect = function () {
            return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
          });
        var h = [
            "",
            "0",
            "00",
            "000",
            "0000",
            "00000",
            "000000",
            "0000000",
            "00000000",
            "000000000",
            "0000000000",
            "00000000000",
            "000000000000",
            "0000000000000",
            "00000000000000",
            "000000000000000",
            "0000000000000000",
            "00000000000000000",
            "000000000000000000",
            "0000000000000000000",
            "00000000000000000000",
            "000000000000000000000",
            "0000000000000000000000",
            "00000000000000000000000",
            "000000000000000000000000",
            "0000000000000000000000000",
          ],
          l = [
            0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          ],
          f = [
            0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607,
            16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536,
            11390625, 16777216, 24137569, 34012224, 47045881, 64e6, 4084101,
            5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368,
            20511149, 243e5, 28629151, 33554432, 39135393, 45435424, 52521875,
            60466176,
          ];
        function c(t) {
          for (var e = new Array(t.bitLength()), r = 0; r < e.length; r++) {
            var n = (r / 26) | 0,
              i = r % 26;
            e[r] = (t.words[n] & (1 << i)) >>> i;
          }
          return e;
        }
        function d(t, e, r) {
          r.negative = e.negative ^ t.negative;
          var n = (t.length + e.length) | 0;
          (r.length = n), (n = (n - 1) | 0);
          var i = 0 | t.words[0],
            o = 0 | e.words[0],
            s = i * o,
            u = 67108863 & s,
            a = (s / 67108864) | 0;
          r.words[0] = u;
          for (var h = 1; h < n; h++) {
            for (
              var l = a >>> 26,
                f = 67108863 & a,
                c = Math.min(h, e.length - 1),
                d = Math.max(0, h - t.length + 1);
              d <= c;
              d++
            ) {
              var p = (h - d) | 0;
              (i = 0 | t.words[p]),
                (o = 0 | e.words[d]),
                (s = i * o + f),
                (l += (s / 67108864) | 0),
                (f = 67108863 & s);
            }
            (r.words[h] = 0 | f), (a = 0 | l);
          }
          return 0 !== a ? (r.words[h] = 0 | a) : r.length--, r.strip();
        }
        (o.prototype.toString = function (t, e) {
          var r;
          if (((t = t || 10), (e = 0 | e || 1), 16 === t || "hex" === t)) {
            r = "";
            for (var i = 0, o = 0, s = 0; s < this.length; s++) {
              var u = this.words[s],
                a = (16777215 & ((u << i) | o)).toString(16);
              (o = (u >>> (24 - i)) & 16777215),
                (r =
                  0 !== o || s !== this.length - 1
                    ? h[6 - a.length] + a + r
                    : a + r),
                (i += 2),
                i >= 26 && ((i -= 26), s--);
            }
            0 !== o && (r = o.toString(16) + r);
            while (r.length % e !== 0) r = "0" + r;
            return 0 !== this.negative && (r = "-" + r), r;
          }
          if (t === (0 | t) && t >= 2 && t <= 36) {
            var c = l[t],
              d = f[t];
            r = "";
            var p = this.clone();
            p.negative = 0;
            while (!p.isZero()) {
              var m = p.modn(d).toString(t);
              (p = p.idivn(d)),
                (r = p.isZero() ? m + r : h[c - m.length] + m + r);
            }
            this.isZero() && (r = "0" + r);
            while (r.length % e !== 0) r = "0" + r;
            return 0 !== this.negative && (r = "-" + r), r;
          }
          n(!1, "Base should be between 2 and 36");
        }),
          (o.prototype.toNumber = function () {
            var t = this.words[0];
            return (
              2 === this.length
                ? (t += 67108864 * this.words[1])
                : 3 === this.length && 1 === this.words[2]
                ? (t += 4503599627370496 + 67108864 * this.words[1])
                : this.length > 2 &&
                  n(!1, "Number can only safely store up to 53 bits"),
              0 !== this.negative ? -t : t
            );
          }),
          (o.prototype.toJSON = function () {
            return this.toString(16);
          }),
          (o.prototype.toBuffer = function (t, e) {
            return n("undefined" !== typeof s), this.toArrayLike(s, t, e);
          }),
          (o.prototype.toArray = function (t, e) {
            return this.toArrayLike(Array, t, e);
          }),
          (o.prototype.toArrayLike = function (t, e, r) {
            var i = this.byteLength(),
              o = r || Math.max(1, i);
            n(i <= o, "byte array longer than desired length"),
              n(o > 0, "Requested array length <= 0"),
              this.strip();
            var s,
              u,
              a = "le" === e,
              h = new t(o),
              l = this.clone();
            if (a) {
              for (u = 0; !l.isZero(); u++)
                (s = l.andln(255)), l.iushrn(8), (h[u] = s);
              for (; u < o; u++) h[u] = 0;
            } else {
              for (u = 0; u < o - i; u++) h[u] = 0;
              for (u = 0; !l.isZero(); u++)
                (s = l.andln(255)), l.iushrn(8), (h[o - u - 1] = s);
            }
            return h;
          }),
          Math.clz32
            ? (o.prototype._countBits = function (t) {
                return 32 - Math.clz32(t);
              })
            : (o.prototype._countBits = function (t) {
                var e = t,
                  r = 0;
                return (
                  e >= 4096 && ((r += 13), (e >>>= 13)),
                  e >= 64 && ((r += 7), (e >>>= 7)),
                  e >= 8 && ((r += 4), (e >>>= 4)),
                  e >= 2 && ((r += 2), (e >>>= 2)),
                  r + e
                );
              }),
          (o.prototype._zeroBits = function (t) {
            if (0 === t) return 26;
            var e = t,
              r = 0;
            return (
              0 === (8191 & e) && ((r += 13), (e >>>= 13)),
              0 === (127 & e) && ((r += 7), (e >>>= 7)),
              0 === (15 & e) && ((r += 4), (e >>>= 4)),
              0 === (3 & e) && ((r += 2), (e >>>= 2)),
              0 === (1 & e) && r++,
              r
            );
          }),
          (o.prototype.bitLength = function () {
            var t = this.words[this.length - 1],
              e = this._countBits(t);
            return 26 * (this.length - 1) + e;
          }),
          (o.prototype.zeroBits = function () {
            if (this.isZero()) return 0;
            for (var t = 0, e = 0; e < this.length; e++) {
              var r = this._zeroBits(this.words[e]);
              if (((t += r), 26 !== r)) break;
            }
            return t;
          }),
          (o.prototype.byteLength = function () {
            return Math.ceil(this.bitLength() / 8);
          }),
          (o.prototype.toTwos = function (t) {
            return 0 !== this.negative
              ? this.abs().inotn(t).iaddn(1)
              : this.clone();
          }),
          (o.prototype.fromTwos = function (t) {
            return this.testn(t - 1)
              ? this.notn(t).iaddn(1).ineg()
              : this.clone();
          }),
          (o.prototype.isNeg = function () {
            return 0 !== this.negative;
          }),
          (o.prototype.neg = function () {
            return this.clone().ineg();
          }),
          (o.prototype.ineg = function () {
            return this.isZero() || (this.negative ^= 1), this;
          }),
          (o.prototype.iuor = function (t) {
            while (this.length < t.length) this.words[this.length++] = 0;
            for (var e = 0; e < t.length; e++)
              this.words[e] = this.words[e] | t.words[e];
            return this.strip();
          }),
          (o.prototype.ior = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuor(t);
          }),
          (o.prototype.or = function (t) {
            return this.length > t.length
              ? this.clone().ior(t)
              : t.clone().ior(this);
          }),
          (o.prototype.uor = function (t) {
            return this.length > t.length
              ? this.clone().iuor(t)
              : t.clone().iuor(this);
          }),
          (o.prototype.iuand = function (t) {
            var e;
            e = this.length > t.length ? t : this;
            for (var r = 0; r < e.length; r++)
              this.words[r] = this.words[r] & t.words[r];
            return (this.length = e.length), this.strip();
          }),
          (o.prototype.iand = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuand(t);
          }),
          (o.prototype.and = function (t) {
            return this.length > t.length
              ? this.clone().iand(t)
              : t.clone().iand(this);
          }),
          (o.prototype.uand = function (t) {
            return this.length > t.length
              ? this.clone().iuand(t)
              : t.clone().iuand(this);
          }),
          (o.prototype.iuxor = function (t) {
            var e, r;
            this.length > t.length
              ? ((e = this), (r = t))
              : ((e = t), (r = this));
            for (var n = 0; n < r.length; n++)
              this.words[n] = e.words[n] ^ r.words[n];
            if (this !== e)
              for (; n < e.length; n++) this.words[n] = e.words[n];
            return (this.length = e.length), this.strip();
          }),
          (o.prototype.ixor = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuxor(t);
          }),
          (o.prototype.xor = function (t) {
            return this.length > t.length
              ? this.clone().ixor(t)
              : t.clone().ixor(this);
          }),
          (o.prototype.uxor = function (t) {
            return this.length > t.length
              ? this.clone().iuxor(t)
              : t.clone().iuxor(this);
          }),
          (o.prototype.inotn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = 0 | Math.ceil(t / 26),
              r = t % 26;
            this._expand(e), r > 0 && e--;
            for (var i = 0; i < e; i++)
              this.words[i] = 67108863 & ~this.words[i];
            return (
              r > 0 &&
                (this.words[i] = ~this.words[i] & (67108863 >> (26 - r))),
              this.strip()
            );
          }),
          (o.prototype.notn = function (t) {
            return this.clone().inotn(t);
          }),
          (o.prototype.setn = function (t, e) {
            n("number" === typeof t && t >= 0);
            var r = (t / 26) | 0,
              i = t % 26;
            return (
              this._expand(r + 1),
              (this.words[r] = e
                ? this.words[r] | (1 << i)
                : this.words[r] & ~(1 << i)),
              this.strip()
            );
          }),
          (o.prototype.iadd = function (t) {
            var e, r, n;
            if (0 !== this.negative && 0 === t.negative)
              return (
                (this.negative = 0),
                (e = this.isub(t)),
                (this.negative ^= 1),
                this._normSign()
              );
            if (0 === this.negative && 0 !== t.negative)
              return (
                (t.negative = 0),
                (e = this.isub(t)),
                (t.negative = 1),
                e._normSign()
              );
            this.length > t.length
              ? ((r = this), (n = t))
              : ((r = t), (n = this));
            for (var i = 0, o = 0; o < n.length; o++)
              (e = (0 | r.words[o]) + (0 | n.words[o]) + i),
                (this.words[o] = 67108863 & e),
                (i = e >>> 26);
            for (; 0 !== i && o < r.length; o++)
              (e = (0 | r.words[o]) + i),
                (this.words[o] = 67108863 & e),
                (i = e >>> 26);
            if (((this.length = r.length), 0 !== i))
              (this.words[this.length] = i), this.length++;
            else if (r !== this)
              for (; o < r.length; o++) this.words[o] = r.words[o];
            return this;
          }),
          (o.prototype.add = function (t) {
            var e;
            return 0 !== t.negative && 0 === this.negative
              ? ((t.negative = 0), (e = this.sub(t)), (t.negative ^= 1), e)
              : 0 === t.negative && 0 !== this.negative
              ? ((this.negative = 0), (e = t.sub(this)), (this.negative = 1), e)
              : this.length > t.length
              ? this.clone().iadd(t)
              : t.clone().iadd(this);
          }),
          (o.prototype.isub = function (t) {
            if (0 !== t.negative) {
              t.negative = 0;
              var e = this.iadd(t);
              return (t.negative = 1), e._normSign();
            }
            if (0 !== this.negative)
              return (
                (this.negative = 0),
                this.iadd(t),
                (this.negative = 1),
                this._normSign()
              );
            var r,
              n,
              i = this.cmp(t);
            if (0 === i)
              return (
                (this.negative = 0),
                (this.length = 1),
                (this.words[0] = 0),
                this
              );
            i > 0 ? ((r = this), (n = t)) : ((r = t), (n = this));
            for (var o = 0, s = 0; s < n.length; s++)
              (e = (0 | r.words[s]) - (0 | n.words[s]) + o),
                (o = e >> 26),
                (this.words[s] = 67108863 & e);
            for (; 0 !== o && s < r.length; s++)
              (e = (0 | r.words[s]) + o),
                (o = e >> 26),
                (this.words[s] = 67108863 & e);
            if (0 === o && s < r.length && r !== this)
              for (; s < r.length; s++) this.words[s] = r.words[s];
            return (
              (this.length = Math.max(this.length, s)),
              r !== this && (this.negative = 1),
              this.strip()
            );
          }),
          (o.prototype.sub = function (t) {
            return this.clone().isub(t);
          });
        var p = function (t, e, r) {
          var n,
            i,
            o,
            s = t.words,
            u = e.words,
            a = r.words,
            h = 0,
            l = 0 | s[0],
            f = 8191 & l,
            c = l >>> 13,
            d = 0 | s[1],
            p = 8191 & d,
            m = d >>> 13,
            v = 0 | s[2],
            g = 8191 & v,
            y = v >>> 13,
            w = 0 | s[3],
            b = 8191 & w,
            M = w >>> 13,
            _ = 0 | s[4],
            x = 8191 & _,
            S = _ >>> 13,
            E = 0 | s[5],
            A = 8191 & E,
            k = E >>> 13,
            O = 0 | s[6],
            T = 8191 & O,
            R = O >>> 13,
            C = 0 | s[7],
            j = 8191 & C,
            N = C >>> 13,
            L = 0 | s[8],
            P = 8191 & L,
            I = L >>> 13,
            B = 0 | s[9],
            q = 8191 & B,
            U = B >>> 13,
            H = 0 | u[0],
            D = 8191 & H,
            F = H >>> 13,
            z = 0 | u[1],
            Z = 8191 & z,
            W = z >>> 13,
            G = 0 | u[2],
            Y = 8191 & G,
            $ = G >>> 13,
            X = 0 | u[3],
            V = 8191 & X,
            J = X >>> 13,
            K = 0 | u[4],
            Q = 8191 & K,
            tt = K >>> 13,
            et = 0 | u[5],
            rt = 8191 & et,
            nt = et >>> 13,
            it = 0 | u[6],
            ot = 8191 & it,
            st = it >>> 13,
            ut = 0 | u[7],
            at = 8191 & ut,
            ht = ut >>> 13,
            lt = 0 | u[8],
            ft = 8191 & lt,
            ct = lt >>> 13,
            dt = 0 | u[9],
            pt = 8191 & dt,
            mt = dt >>> 13;
          (r.negative = t.negative ^ e.negative),
            (r.length = 19),
            (n = Math.imul(f, D)),
            (i = Math.imul(f, F)),
            (i = (i + Math.imul(c, D)) | 0),
            (o = Math.imul(c, F));
          var vt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (vt >>> 26)) | 0),
            (vt &= 67108863),
            (n = Math.imul(p, D)),
            (i = Math.imul(p, F)),
            (i = (i + Math.imul(m, D)) | 0),
            (o = Math.imul(m, F)),
            (n = (n + Math.imul(f, Z)) | 0),
            (i = (i + Math.imul(f, W)) | 0),
            (i = (i + Math.imul(c, Z)) | 0),
            (o = (o + Math.imul(c, W)) | 0);
          var gt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (gt >>> 26)) | 0),
            (gt &= 67108863),
            (n = Math.imul(g, D)),
            (i = Math.imul(g, F)),
            (i = (i + Math.imul(y, D)) | 0),
            (o = Math.imul(y, F)),
            (n = (n + Math.imul(p, Z)) | 0),
            (i = (i + Math.imul(p, W)) | 0),
            (i = (i + Math.imul(m, Z)) | 0),
            (o = (o + Math.imul(m, W)) | 0),
            (n = (n + Math.imul(f, Y)) | 0),
            (i = (i + Math.imul(f, $)) | 0),
            (i = (i + Math.imul(c, Y)) | 0),
            (o = (o + Math.imul(c, $)) | 0);
          var yt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (yt >>> 26)) | 0),
            (yt &= 67108863),
            (n = Math.imul(b, D)),
            (i = Math.imul(b, F)),
            (i = (i + Math.imul(M, D)) | 0),
            (o = Math.imul(M, F)),
            (n = (n + Math.imul(g, Z)) | 0),
            (i = (i + Math.imul(g, W)) | 0),
            (i = (i + Math.imul(y, Z)) | 0),
            (o = (o + Math.imul(y, W)) | 0),
            (n = (n + Math.imul(p, Y)) | 0),
            (i = (i + Math.imul(p, $)) | 0),
            (i = (i + Math.imul(m, Y)) | 0),
            (o = (o + Math.imul(m, $)) | 0),
            (n = (n + Math.imul(f, V)) | 0),
            (i = (i + Math.imul(f, J)) | 0),
            (i = (i + Math.imul(c, V)) | 0),
            (o = (o + Math.imul(c, J)) | 0);
          var wt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (wt >>> 26)) | 0),
            (wt &= 67108863),
            (n = Math.imul(x, D)),
            (i = Math.imul(x, F)),
            (i = (i + Math.imul(S, D)) | 0),
            (o = Math.imul(S, F)),
            (n = (n + Math.imul(b, Z)) | 0),
            (i = (i + Math.imul(b, W)) | 0),
            (i = (i + Math.imul(M, Z)) | 0),
            (o = (o + Math.imul(M, W)) | 0),
            (n = (n + Math.imul(g, Y)) | 0),
            (i = (i + Math.imul(g, $)) | 0),
            (i = (i + Math.imul(y, Y)) | 0),
            (o = (o + Math.imul(y, $)) | 0),
            (n = (n + Math.imul(p, V)) | 0),
            (i = (i + Math.imul(p, J)) | 0),
            (i = (i + Math.imul(m, V)) | 0),
            (o = (o + Math.imul(m, J)) | 0),
            (n = (n + Math.imul(f, Q)) | 0),
            (i = (i + Math.imul(f, tt)) | 0),
            (i = (i + Math.imul(c, Q)) | 0),
            (o = (o + Math.imul(c, tt)) | 0);
          var bt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (bt >>> 26)) | 0),
            (bt &= 67108863),
            (n = Math.imul(A, D)),
            (i = Math.imul(A, F)),
            (i = (i + Math.imul(k, D)) | 0),
            (o = Math.imul(k, F)),
            (n = (n + Math.imul(x, Z)) | 0),
            (i = (i + Math.imul(x, W)) | 0),
            (i = (i + Math.imul(S, Z)) | 0),
            (o = (o + Math.imul(S, W)) | 0),
            (n = (n + Math.imul(b, Y)) | 0),
            (i = (i + Math.imul(b, $)) | 0),
            (i = (i + Math.imul(M, Y)) | 0),
            (o = (o + Math.imul(M, $)) | 0),
            (n = (n + Math.imul(g, V)) | 0),
            (i = (i + Math.imul(g, J)) | 0),
            (i = (i + Math.imul(y, V)) | 0),
            (o = (o + Math.imul(y, J)) | 0),
            (n = (n + Math.imul(p, Q)) | 0),
            (i = (i + Math.imul(p, tt)) | 0),
            (i = (i + Math.imul(m, Q)) | 0),
            (o = (o + Math.imul(m, tt)) | 0),
            (n = (n + Math.imul(f, rt)) | 0),
            (i = (i + Math.imul(f, nt)) | 0),
            (i = (i + Math.imul(c, rt)) | 0),
            (o = (o + Math.imul(c, nt)) | 0);
          var Mt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Mt >>> 26)) | 0),
            (Mt &= 67108863),
            (n = Math.imul(T, D)),
            (i = Math.imul(T, F)),
            (i = (i + Math.imul(R, D)) | 0),
            (o = Math.imul(R, F)),
            (n = (n + Math.imul(A, Z)) | 0),
            (i = (i + Math.imul(A, W)) | 0),
            (i = (i + Math.imul(k, Z)) | 0),
            (o = (o + Math.imul(k, W)) | 0),
            (n = (n + Math.imul(x, Y)) | 0),
            (i = (i + Math.imul(x, $)) | 0),
            (i = (i + Math.imul(S, Y)) | 0),
            (o = (o + Math.imul(S, $)) | 0),
            (n = (n + Math.imul(b, V)) | 0),
            (i = (i + Math.imul(b, J)) | 0),
            (i = (i + Math.imul(M, V)) | 0),
            (o = (o + Math.imul(M, J)) | 0),
            (n = (n + Math.imul(g, Q)) | 0),
            (i = (i + Math.imul(g, tt)) | 0),
            (i = (i + Math.imul(y, Q)) | 0),
            (o = (o + Math.imul(y, tt)) | 0),
            (n = (n + Math.imul(p, rt)) | 0),
            (i = (i + Math.imul(p, nt)) | 0),
            (i = (i + Math.imul(m, rt)) | 0),
            (o = (o + Math.imul(m, nt)) | 0),
            (n = (n + Math.imul(f, ot)) | 0),
            (i = (i + Math.imul(f, st)) | 0),
            (i = (i + Math.imul(c, ot)) | 0),
            (o = (o + Math.imul(c, st)) | 0);
          var _t = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (_t >>> 26)) | 0),
            (_t &= 67108863),
            (n = Math.imul(j, D)),
            (i = Math.imul(j, F)),
            (i = (i + Math.imul(N, D)) | 0),
            (o = Math.imul(N, F)),
            (n = (n + Math.imul(T, Z)) | 0),
            (i = (i + Math.imul(T, W)) | 0),
            (i = (i + Math.imul(R, Z)) | 0),
            (o = (o + Math.imul(R, W)) | 0),
            (n = (n + Math.imul(A, Y)) | 0),
            (i = (i + Math.imul(A, $)) | 0),
            (i = (i + Math.imul(k, Y)) | 0),
            (o = (o + Math.imul(k, $)) | 0),
            (n = (n + Math.imul(x, V)) | 0),
            (i = (i + Math.imul(x, J)) | 0),
            (i = (i + Math.imul(S, V)) | 0),
            (o = (o + Math.imul(S, J)) | 0),
            (n = (n + Math.imul(b, Q)) | 0),
            (i = (i + Math.imul(b, tt)) | 0),
            (i = (i + Math.imul(M, Q)) | 0),
            (o = (o + Math.imul(M, tt)) | 0),
            (n = (n + Math.imul(g, rt)) | 0),
            (i = (i + Math.imul(g, nt)) | 0),
            (i = (i + Math.imul(y, rt)) | 0),
            (o = (o + Math.imul(y, nt)) | 0),
            (n = (n + Math.imul(p, ot)) | 0),
            (i = (i + Math.imul(p, st)) | 0),
            (i = (i + Math.imul(m, ot)) | 0),
            (o = (o + Math.imul(m, st)) | 0),
            (n = (n + Math.imul(f, at)) | 0),
            (i = (i + Math.imul(f, ht)) | 0),
            (i = (i + Math.imul(c, at)) | 0),
            (o = (o + Math.imul(c, ht)) | 0);
          var xt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (xt >>> 26)) | 0),
            (xt &= 67108863),
            (n = Math.imul(P, D)),
            (i = Math.imul(P, F)),
            (i = (i + Math.imul(I, D)) | 0),
            (o = Math.imul(I, F)),
            (n = (n + Math.imul(j, Z)) | 0),
            (i = (i + Math.imul(j, W)) | 0),
            (i = (i + Math.imul(N, Z)) | 0),
            (o = (o + Math.imul(N, W)) | 0),
            (n = (n + Math.imul(T, Y)) | 0),
            (i = (i + Math.imul(T, $)) | 0),
            (i = (i + Math.imul(R, Y)) | 0),
            (o = (o + Math.imul(R, $)) | 0),
            (n = (n + Math.imul(A, V)) | 0),
            (i = (i + Math.imul(A, J)) | 0),
            (i = (i + Math.imul(k, V)) | 0),
            (o = (o + Math.imul(k, J)) | 0),
            (n = (n + Math.imul(x, Q)) | 0),
            (i = (i + Math.imul(x, tt)) | 0),
            (i = (i + Math.imul(S, Q)) | 0),
            (o = (o + Math.imul(S, tt)) | 0),
            (n = (n + Math.imul(b, rt)) | 0),
            (i = (i + Math.imul(b, nt)) | 0),
            (i = (i + Math.imul(M, rt)) | 0),
            (o = (o + Math.imul(M, nt)) | 0),
            (n = (n + Math.imul(g, ot)) | 0),
            (i = (i + Math.imul(g, st)) | 0),
            (i = (i + Math.imul(y, ot)) | 0),
            (o = (o + Math.imul(y, st)) | 0),
            (n = (n + Math.imul(p, at)) | 0),
            (i = (i + Math.imul(p, ht)) | 0),
            (i = (i + Math.imul(m, at)) | 0),
            (o = (o + Math.imul(m, ht)) | 0),
            (n = (n + Math.imul(f, ft)) | 0),
            (i = (i + Math.imul(f, ct)) | 0),
            (i = (i + Math.imul(c, ft)) | 0),
            (o = (o + Math.imul(c, ct)) | 0);
          var St = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (St >>> 26)) | 0),
            (St &= 67108863),
            (n = Math.imul(q, D)),
            (i = Math.imul(q, F)),
            (i = (i + Math.imul(U, D)) | 0),
            (o = Math.imul(U, F)),
            (n = (n + Math.imul(P, Z)) | 0),
            (i = (i + Math.imul(P, W)) | 0),
            (i = (i + Math.imul(I, Z)) | 0),
            (o = (o + Math.imul(I, W)) | 0),
            (n = (n + Math.imul(j, Y)) | 0),
            (i = (i + Math.imul(j, $)) | 0),
            (i = (i + Math.imul(N, Y)) | 0),
            (o = (o + Math.imul(N, $)) | 0),
            (n = (n + Math.imul(T, V)) | 0),
            (i = (i + Math.imul(T, J)) | 0),
            (i = (i + Math.imul(R, V)) | 0),
            (o = (o + Math.imul(R, J)) | 0),
            (n = (n + Math.imul(A, Q)) | 0),
            (i = (i + Math.imul(A, tt)) | 0),
            (i = (i + Math.imul(k, Q)) | 0),
            (o = (o + Math.imul(k, tt)) | 0),
            (n = (n + Math.imul(x, rt)) | 0),
            (i = (i + Math.imul(x, nt)) | 0),
            (i = (i + Math.imul(S, rt)) | 0),
            (o = (o + Math.imul(S, nt)) | 0),
            (n = (n + Math.imul(b, ot)) | 0),
            (i = (i + Math.imul(b, st)) | 0),
            (i = (i + Math.imul(M, ot)) | 0),
            (o = (o + Math.imul(M, st)) | 0),
            (n = (n + Math.imul(g, at)) | 0),
            (i = (i + Math.imul(g, ht)) | 0),
            (i = (i + Math.imul(y, at)) | 0),
            (o = (o + Math.imul(y, ht)) | 0),
            (n = (n + Math.imul(p, ft)) | 0),
            (i = (i + Math.imul(p, ct)) | 0),
            (i = (i + Math.imul(m, ft)) | 0),
            (o = (o + Math.imul(m, ct)) | 0),
            (n = (n + Math.imul(f, pt)) | 0),
            (i = (i + Math.imul(f, mt)) | 0),
            (i = (i + Math.imul(c, pt)) | 0),
            (o = (o + Math.imul(c, mt)) | 0);
          var Et = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Et >>> 26)) | 0),
            (Et &= 67108863),
            (n = Math.imul(q, Z)),
            (i = Math.imul(q, W)),
            (i = (i + Math.imul(U, Z)) | 0),
            (o = Math.imul(U, W)),
            (n = (n + Math.imul(P, Y)) | 0),
            (i = (i + Math.imul(P, $)) | 0),
            (i = (i + Math.imul(I, Y)) | 0),
            (o = (o + Math.imul(I, $)) | 0),
            (n = (n + Math.imul(j, V)) | 0),
            (i = (i + Math.imul(j, J)) | 0),
            (i = (i + Math.imul(N, V)) | 0),
            (o = (o + Math.imul(N, J)) | 0),
            (n = (n + Math.imul(T, Q)) | 0),
            (i = (i + Math.imul(T, tt)) | 0),
            (i = (i + Math.imul(R, Q)) | 0),
            (o = (o + Math.imul(R, tt)) | 0),
            (n = (n + Math.imul(A, rt)) | 0),
            (i = (i + Math.imul(A, nt)) | 0),
            (i = (i + Math.imul(k, rt)) | 0),
            (o = (o + Math.imul(k, nt)) | 0),
            (n = (n + Math.imul(x, ot)) | 0),
            (i = (i + Math.imul(x, st)) | 0),
            (i = (i + Math.imul(S, ot)) | 0),
            (o = (o + Math.imul(S, st)) | 0),
            (n = (n + Math.imul(b, at)) | 0),
            (i = (i + Math.imul(b, ht)) | 0),
            (i = (i + Math.imul(M, at)) | 0),
            (o = (o + Math.imul(M, ht)) | 0),
            (n = (n + Math.imul(g, ft)) | 0),
            (i = (i + Math.imul(g, ct)) | 0),
            (i = (i + Math.imul(y, ft)) | 0),
            (o = (o + Math.imul(y, ct)) | 0),
            (n = (n + Math.imul(p, pt)) | 0),
            (i = (i + Math.imul(p, mt)) | 0),
            (i = (i + Math.imul(m, pt)) | 0),
            (o = (o + Math.imul(m, mt)) | 0);
          var At = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (At >>> 26)) | 0),
            (At &= 67108863),
            (n = Math.imul(q, Y)),
            (i = Math.imul(q, $)),
            (i = (i + Math.imul(U, Y)) | 0),
            (o = Math.imul(U, $)),
            (n = (n + Math.imul(P, V)) | 0),
            (i = (i + Math.imul(P, J)) | 0),
            (i = (i + Math.imul(I, V)) | 0),
            (o = (o + Math.imul(I, J)) | 0),
            (n = (n + Math.imul(j, Q)) | 0),
            (i = (i + Math.imul(j, tt)) | 0),
            (i = (i + Math.imul(N, Q)) | 0),
            (o = (o + Math.imul(N, tt)) | 0),
            (n = (n + Math.imul(T, rt)) | 0),
            (i = (i + Math.imul(T, nt)) | 0),
            (i = (i + Math.imul(R, rt)) | 0),
            (o = (o + Math.imul(R, nt)) | 0),
            (n = (n + Math.imul(A, ot)) | 0),
            (i = (i + Math.imul(A, st)) | 0),
            (i = (i + Math.imul(k, ot)) | 0),
            (o = (o + Math.imul(k, st)) | 0),
            (n = (n + Math.imul(x, at)) | 0),
            (i = (i + Math.imul(x, ht)) | 0),
            (i = (i + Math.imul(S, at)) | 0),
            (o = (o + Math.imul(S, ht)) | 0),
            (n = (n + Math.imul(b, ft)) | 0),
            (i = (i + Math.imul(b, ct)) | 0),
            (i = (i + Math.imul(M, ft)) | 0),
            (o = (o + Math.imul(M, ct)) | 0),
            (n = (n + Math.imul(g, pt)) | 0),
            (i = (i + Math.imul(g, mt)) | 0),
            (i = (i + Math.imul(y, pt)) | 0),
            (o = (o + Math.imul(y, mt)) | 0);
          var kt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (kt >>> 26)) | 0),
            (kt &= 67108863),
            (n = Math.imul(q, V)),
            (i = Math.imul(q, J)),
            (i = (i + Math.imul(U, V)) | 0),
            (o = Math.imul(U, J)),
            (n = (n + Math.imul(P, Q)) | 0),
            (i = (i + Math.imul(P, tt)) | 0),
            (i = (i + Math.imul(I, Q)) | 0),
            (o = (o + Math.imul(I, tt)) | 0),
            (n = (n + Math.imul(j, rt)) | 0),
            (i = (i + Math.imul(j, nt)) | 0),
            (i = (i + Math.imul(N, rt)) | 0),
            (o = (o + Math.imul(N, nt)) | 0),
            (n = (n + Math.imul(T, ot)) | 0),
            (i = (i + Math.imul(T, st)) | 0),
            (i = (i + Math.imul(R, ot)) | 0),
            (o = (o + Math.imul(R, st)) | 0),
            (n = (n + Math.imul(A, at)) | 0),
            (i = (i + Math.imul(A, ht)) | 0),
            (i = (i + Math.imul(k, at)) | 0),
            (o = (o + Math.imul(k, ht)) | 0),
            (n = (n + Math.imul(x, ft)) | 0),
            (i = (i + Math.imul(x, ct)) | 0),
            (i = (i + Math.imul(S, ft)) | 0),
            (o = (o + Math.imul(S, ct)) | 0),
            (n = (n + Math.imul(b, pt)) | 0),
            (i = (i + Math.imul(b, mt)) | 0),
            (i = (i + Math.imul(M, pt)) | 0),
            (o = (o + Math.imul(M, mt)) | 0);
          var Ot = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Ot >>> 26)) | 0),
            (Ot &= 67108863),
            (n = Math.imul(q, Q)),
            (i = Math.imul(q, tt)),
            (i = (i + Math.imul(U, Q)) | 0),
            (o = Math.imul(U, tt)),
            (n = (n + Math.imul(P, rt)) | 0),
            (i = (i + Math.imul(P, nt)) | 0),
            (i = (i + Math.imul(I, rt)) | 0),
            (o = (o + Math.imul(I, nt)) | 0),
            (n = (n + Math.imul(j, ot)) | 0),
            (i = (i + Math.imul(j, st)) | 0),
            (i = (i + Math.imul(N, ot)) | 0),
            (o = (o + Math.imul(N, st)) | 0),
            (n = (n + Math.imul(T, at)) | 0),
            (i = (i + Math.imul(T, ht)) | 0),
            (i = (i + Math.imul(R, at)) | 0),
            (o = (o + Math.imul(R, ht)) | 0),
            (n = (n + Math.imul(A, ft)) | 0),
            (i = (i + Math.imul(A, ct)) | 0),
            (i = (i + Math.imul(k, ft)) | 0),
            (o = (o + Math.imul(k, ct)) | 0),
            (n = (n + Math.imul(x, pt)) | 0),
            (i = (i + Math.imul(x, mt)) | 0),
            (i = (i + Math.imul(S, pt)) | 0),
            (o = (o + Math.imul(S, mt)) | 0);
          var Tt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Tt >>> 26)) | 0),
            (Tt &= 67108863),
            (n = Math.imul(q, rt)),
            (i = Math.imul(q, nt)),
            (i = (i + Math.imul(U, rt)) | 0),
            (o = Math.imul(U, nt)),
            (n = (n + Math.imul(P, ot)) | 0),
            (i = (i + Math.imul(P, st)) | 0),
            (i = (i + Math.imul(I, ot)) | 0),
            (o = (o + Math.imul(I, st)) | 0),
            (n = (n + Math.imul(j, at)) | 0),
            (i = (i + Math.imul(j, ht)) | 0),
            (i = (i + Math.imul(N, at)) | 0),
            (o = (o + Math.imul(N, ht)) | 0),
            (n = (n + Math.imul(T, ft)) | 0),
            (i = (i + Math.imul(T, ct)) | 0),
            (i = (i + Math.imul(R, ft)) | 0),
            (o = (o + Math.imul(R, ct)) | 0),
            (n = (n + Math.imul(A, pt)) | 0),
            (i = (i + Math.imul(A, mt)) | 0),
            (i = (i + Math.imul(k, pt)) | 0),
            (o = (o + Math.imul(k, mt)) | 0);
          var Rt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Rt >>> 26)) | 0),
            (Rt &= 67108863),
            (n = Math.imul(q, ot)),
            (i = Math.imul(q, st)),
            (i = (i + Math.imul(U, ot)) | 0),
            (o = Math.imul(U, st)),
            (n = (n + Math.imul(P, at)) | 0),
            (i = (i + Math.imul(P, ht)) | 0),
            (i = (i + Math.imul(I, at)) | 0),
            (o = (o + Math.imul(I, ht)) | 0),
            (n = (n + Math.imul(j, ft)) | 0),
            (i = (i + Math.imul(j, ct)) | 0),
            (i = (i + Math.imul(N, ft)) | 0),
            (o = (o + Math.imul(N, ct)) | 0),
            (n = (n + Math.imul(T, pt)) | 0),
            (i = (i + Math.imul(T, mt)) | 0),
            (i = (i + Math.imul(R, pt)) | 0),
            (o = (o + Math.imul(R, mt)) | 0);
          var Ct = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Ct >>> 26)) | 0),
            (Ct &= 67108863),
            (n = Math.imul(q, at)),
            (i = Math.imul(q, ht)),
            (i = (i + Math.imul(U, at)) | 0),
            (o = Math.imul(U, ht)),
            (n = (n + Math.imul(P, ft)) | 0),
            (i = (i + Math.imul(P, ct)) | 0),
            (i = (i + Math.imul(I, ft)) | 0),
            (o = (o + Math.imul(I, ct)) | 0),
            (n = (n + Math.imul(j, pt)) | 0),
            (i = (i + Math.imul(j, mt)) | 0),
            (i = (i + Math.imul(N, pt)) | 0),
            (o = (o + Math.imul(N, mt)) | 0);
          var jt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (jt >>> 26)) | 0),
            (jt &= 67108863),
            (n = Math.imul(q, ft)),
            (i = Math.imul(q, ct)),
            (i = (i + Math.imul(U, ft)) | 0),
            (o = Math.imul(U, ct)),
            (n = (n + Math.imul(P, pt)) | 0),
            (i = (i + Math.imul(P, mt)) | 0),
            (i = (i + Math.imul(I, pt)) | 0),
            (o = (o + Math.imul(I, mt)) | 0);
          var Nt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Nt >>> 26)) | 0),
            (Nt &= 67108863),
            (n = Math.imul(q, pt)),
            (i = Math.imul(q, mt)),
            (i = (i + Math.imul(U, pt)) | 0),
            (o = Math.imul(U, mt));
          var Lt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          return (
            (h = (((o + (i >>> 13)) | 0) + (Lt >>> 26)) | 0),
            (Lt &= 67108863),
            (a[0] = vt),
            (a[1] = gt),
            (a[2] = yt),
            (a[3] = wt),
            (a[4] = bt),
            (a[5] = Mt),
            (a[6] = _t),
            (a[7] = xt),
            (a[8] = St),
            (a[9] = Et),
            (a[10] = At),
            (a[11] = kt),
            (a[12] = Ot),
            (a[13] = Tt),
            (a[14] = Rt),
            (a[15] = Ct),
            (a[16] = jt),
            (a[17] = Nt),
            (a[18] = Lt),
            0 !== h && ((a[19] = h), r.length++),
            r
          );
        };
        function m(t, e, r) {
          (r.negative = e.negative ^ t.negative),
            (r.length = t.length + e.length);
          for (var n = 0, i = 0, o = 0; o < r.length - 1; o++) {
            var s = i;
            i = 0;
            for (
              var u = 67108863 & n,
                a = Math.min(o, e.length - 1),
                h = Math.max(0, o - t.length + 1);
              h <= a;
              h++
            ) {
              var l = o - h,
                f = 0 | t.words[l],
                c = 0 | e.words[h],
                d = f * c,
                p = 67108863 & d;
              (s = (s + ((d / 67108864) | 0)) | 0),
                (p = (p + u) | 0),
                (u = 67108863 & p),
                (s = (s + (p >>> 26)) | 0),
                (i += s >>> 26),
                (s &= 67108863);
            }
            (r.words[o] = u), (n = s), (s = i);
          }
          return 0 !== n ? (r.words[o] = n) : r.length--, r.strip();
        }
        function v(t, e, r) {
          var n = new g();
          return n.mulp(t, e, r);
        }
        function g(t, e) {
          (this.x = t), (this.y = e);
        }
        Math.imul || (p = d),
          (o.prototype.mulTo = function (t, e) {
            var r,
              n = this.length + t.length;
            return (
              (r =
                10 === this.length && 10 === t.length
                  ? p(this, t, e)
                  : n < 63
                  ? d(this, t, e)
                  : n < 1024
                  ? m(this, t, e)
                  : v(this, t, e)),
              r
            );
          }),
          (g.prototype.makeRBT = function (t) {
            for (
              var e = new Array(t), r = o.prototype._countBits(t) - 1, n = 0;
              n < t;
              n++
            )
              e[n] = this.revBin(n, r, t);
            return e;
          }),
          (g.prototype.revBin = function (t, e, r) {
            if (0 === t || t === r - 1) return t;
            for (var n = 0, i = 0; i < e; i++)
              (n |= (1 & t) << (e - i - 1)), (t >>= 1);
            return n;
          }),
          (g.prototype.permute = function (t, e, r, n, i, o) {
            for (var s = 0; s < o; s++) (n[s] = e[t[s]]), (i[s] = r[t[s]]);
          }),
          (g.prototype.transform = function (t, e, r, n, i, o) {
            this.permute(o, t, e, r, n, i);
            for (var s = 1; s < i; s <<= 1)
              for (
                var u = s << 1,
                  a = Math.cos((2 * Math.PI) / u),
                  h = Math.sin((2 * Math.PI) / u),
                  l = 0;
                l < i;
                l += u
              )
                for (var f = a, c = h, d = 0; d < s; d++) {
                  var p = r[l + d],
                    m = n[l + d],
                    v = r[l + d + s],
                    g = n[l + d + s],
                    y = f * v - c * g;
                  (g = f * g + c * v),
                    (v = y),
                    (r[l + d] = p + v),
                    (n[l + d] = m + g),
                    (r[l + d + s] = p - v),
                    (n[l + d + s] = m - g),
                    d !== u &&
                      ((y = a * f - h * c), (c = a * c + h * f), (f = y));
                }
          }),
          (g.prototype.guessLen13b = function (t, e) {
            var r = 1 | Math.max(e, t),
              n = 1 & r,
              i = 0;
            for (r = (r / 2) | 0; r; r >>>= 1) i++;
            return 1 << (i + 1 + n);
          }),
          (g.prototype.conjugate = function (t, e, r) {
            if (!(r <= 1))
              for (var n = 0; n < r / 2; n++) {
                var i = t[n];
                (t[n] = t[r - n - 1]),
                  (t[r - n - 1] = i),
                  (i = e[n]),
                  (e[n] = -e[r - n - 1]),
                  (e[r - n - 1] = -i);
              }
          }),
          (g.prototype.normalize13b = function (t, e) {
            for (var r = 0, n = 0; n < e / 2; n++) {
              var i =
                8192 * Math.round(t[2 * n + 1] / e) +
                Math.round(t[2 * n] / e) +
                r;
              (t[n] = 67108863 & i),
                (r = i < 67108864 ? 0 : (i / 67108864) | 0);
            }
            return t;
          }),
          (g.prototype.convert13b = function (t, e, r, i) {
            for (var o = 0, s = 0; s < e; s++)
              (o += 0 | t[s]),
                (r[2 * s] = 8191 & o),
                (o >>>= 13),
                (r[2 * s + 1] = 8191 & o),
                (o >>>= 13);
            for (s = 2 * e; s < i; ++s) r[s] = 0;
            n(0 === o), n(0 === (-8192 & o));
          }),
          (g.prototype.stub = function (t) {
            for (var e = new Array(t), r = 0; r < t; r++) e[r] = 0;
            return e;
          }),
          (g.prototype.mulp = function (t, e, r) {
            var n = 2 * this.guessLen13b(t.length, e.length),
              i = this.makeRBT(n),
              o = this.stub(n),
              s = new Array(n),
              u = new Array(n),
              a = new Array(n),
              h = new Array(n),
              l = new Array(n),
              f = new Array(n),
              c = r.words;
            (c.length = n),
              this.convert13b(t.words, t.length, s, n),
              this.convert13b(e.words, e.length, h, n),
              this.transform(s, o, u, a, n, i),
              this.transform(h, o, l, f, n, i);
            for (var d = 0; d < n; d++) {
              var p = u[d] * l[d] - a[d] * f[d];
              (a[d] = u[d] * f[d] + a[d] * l[d]), (u[d] = p);
            }
            return (
              this.conjugate(u, a, n),
              this.transform(u, a, c, o, n, i),
              this.conjugate(c, o, n),
              this.normalize13b(c, n),
              (r.negative = t.negative ^ e.negative),
              (r.length = t.length + e.length),
              r.strip()
            );
          }),
          (o.prototype.mul = function (t) {
            var e = new o(null);
            return (
              (e.words = new Array(this.length + t.length)), this.mulTo(t, e)
            );
          }),
          (o.prototype.mulf = function (t) {
            var e = new o(null);
            return (e.words = new Array(this.length + t.length)), v(this, t, e);
          }),
          (o.prototype.imul = function (t) {
            return this.clone().mulTo(t, this);
          }),
          (o.prototype.imuln = function (t) {
            n("number" === typeof t), n(t < 67108864);
            for (var e = 0, r = 0; r < this.length; r++) {
              var i = (0 | this.words[r]) * t,
                o = (67108863 & i) + (67108863 & e);
              (e >>= 26),
                (e += (i / 67108864) | 0),
                (e += o >>> 26),
                (this.words[r] = 67108863 & o);
            }
            return 0 !== e && ((this.words[r] = e), this.length++), this;
          }),
          (o.prototype.muln = function (t) {
            return this.clone().imuln(t);
          }),
          (o.prototype.sqr = function () {
            return this.mul(this);
          }),
          (o.prototype.isqr = function () {
            return this.imul(this.clone());
          }),
          (o.prototype.pow = function (t) {
            var e = c(t);
            if (0 === e.length) return new o(1);
            for (var r = this, n = 0; n < e.length; n++, r = r.sqr())
              if (0 !== e[n]) break;
            if (++n < e.length)
              for (var i = r.sqr(); n < e.length; n++, i = i.sqr())
                0 !== e[n] && (r = r.mul(i));
            return r;
          }),
          (o.prototype.iushln = function (t) {
            n("number" === typeof t && t >= 0);
            var e,
              r = t % 26,
              i = (t - r) / 26,
              o = (67108863 >>> (26 - r)) << (26 - r);
            if (0 !== r) {
              var s = 0;
              for (e = 0; e < this.length; e++) {
                var u = this.words[e] & o,
                  a = ((0 | this.words[e]) - u) << r;
                (this.words[e] = a | s), (s = u >>> (26 - r));
              }
              s && ((this.words[e] = s), this.length++);
            }
            if (0 !== i) {
              for (e = this.length - 1; e >= 0; e--)
                this.words[e + i] = this.words[e];
              for (e = 0; e < i; e++) this.words[e] = 0;
              this.length += i;
            }
            return this.strip();
          }),
          (o.prototype.ishln = function (t) {
            return n(0 === this.negative), this.iushln(t);
          }),
          (o.prototype.iushrn = function (t, e, r) {
            var i;
            n("number" === typeof t && t >= 0),
              (i = e ? (e - (e % 26)) / 26 : 0);
            var o = t % 26,
              s = Math.min((t - o) / 26, this.length),
              u = 67108863 ^ ((67108863 >>> o) << o),
              a = r;
            if (((i -= s), (i = Math.max(0, i)), a)) {
              for (var h = 0; h < s; h++) a.words[h] = this.words[h];
              a.length = s;
            }
            if (0 === s);
            else if (this.length > s)
              for (this.length -= s, h = 0; h < this.length; h++)
                this.words[h] = this.words[h + s];
            else (this.words[0] = 0), (this.length = 1);
            var l = 0;
            for (h = this.length - 1; h >= 0 && (0 !== l || h >= i); h--) {
              var f = 0 | this.words[h];
              (this.words[h] = (l << (26 - o)) | (f >>> o)), (l = f & u);
            }
            return (
              a && 0 !== l && (a.words[a.length++] = l),
              0 === this.length && ((this.words[0] = 0), (this.length = 1)),
              this.strip()
            );
          }),
          (o.prototype.ishrn = function (t, e, r) {
            return n(0 === this.negative), this.iushrn(t, e, r);
          }),
          (o.prototype.shln = function (t) {
            return this.clone().ishln(t);
          }),
          (o.prototype.ushln = function (t) {
            return this.clone().iushln(t);
          }),
          (o.prototype.shrn = function (t) {
            return this.clone().ishrn(t);
          }),
          (o.prototype.ushrn = function (t) {
            return this.clone().iushrn(t);
          }),
          (o.prototype.testn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = t % 26,
              r = (t - e) / 26,
              i = 1 << e;
            if (this.length <= r) return !1;
            var o = this.words[r];
            return !!(o & i);
          }),
          (o.prototype.imaskn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = t % 26,
              r = (t - e) / 26;
            if (
              (n(
                0 === this.negative,
                "imaskn works only with positive numbers"
              ),
              this.length <= r)
            )
              return this;
            if (
              (0 !== e && r++,
              (this.length = Math.min(r, this.length)),
              0 !== e)
            ) {
              var i = 67108863 ^ ((67108863 >>> e) << e);
              this.words[this.length - 1] &= i;
            }
            return this.strip();
          }),
          (o.prototype.maskn = function (t) {
            return this.clone().imaskn(t);
          }),
          (o.prototype.iaddn = function (t) {
            return (
              n("number" === typeof t),
              n(t < 67108864),
              t < 0
                ? this.isubn(-t)
                : 0 !== this.negative
                ? 1 === this.length && (0 | this.words[0]) < t
                  ? ((this.words[0] = t - (0 | this.words[0])),
                    (this.negative = 0),
                    this)
                  : ((this.negative = 0),
                    this.isubn(t),
                    (this.negative = 1),
                    this)
                : this._iaddn(t)
            );
          }),
          (o.prototype._iaddn = function (t) {
            this.words[0] += t;
            for (var e = 0; e < this.length && this.words[e] >= 67108864; e++)
              (this.words[e] -= 67108864),
                e === this.length - 1
                  ? (this.words[e + 1] = 1)
                  : this.words[e + 1]++;
            return (this.length = Math.max(this.length, e + 1)), this;
          }),
          (o.prototype.isubn = function (t) {
            if ((n("number" === typeof t), n(t < 67108864), t < 0))
              return this.iaddn(-t);
            if (0 !== this.negative)
              return (
                (this.negative = 0), this.iaddn(t), (this.negative = 1), this
              );
            if (((this.words[0] -= t), 1 === this.length && this.words[0] < 0))
              (this.words[0] = -this.words[0]), (this.negative = 1);
            else
              for (var e = 0; e < this.length && this.words[e] < 0; e++)
                (this.words[e] += 67108864), (this.words[e + 1] -= 1);
            return this.strip();
          }),
          (o.prototype.addn = function (t) {
            return this.clone().iaddn(t);
          }),
          (o.prototype.subn = function (t) {
            return this.clone().isubn(t);
          }),
          (o.prototype.iabs = function () {
            return (this.negative = 0), this;
          }),
          (o.prototype.abs = function () {
            return this.clone().iabs();
          }),
          (o.prototype._ishlnsubmul = function (t, e, r) {
            var i,
              o,
              s = t.length + r;
            this._expand(s);
            var u = 0;
            for (i = 0; i < t.length; i++) {
              o = (0 | this.words[i + r]) + u;
              var a = (0 | t.words[i]) * e;
              (o -= 67108863 & a),
                (u = (o >> 26) - ((a / 67108864) | 0)),
                (this.words[i + r] = 67108863 & o);
            }
            for (; i < this.length - r; i++)
              (o = (0 | this.words[i + r]) + u),
                (u = o >> 26),
                (this.words[i + r] = 67108863 & o);
            if (0 === u) return this.strip();
            for (n(-1 === u), u = 0, i = 0; i < this.length; i++)
              (o = -(0 | this.words[i]) + u),
                (u = o >> 26),
                (this.words[i] = 67108863 & o);
            return (this.negative = 1), this.strip();
          }),
          (o.prototype._wordDiv = function (t, e) {
            var r = this.length - t.length,
              n = this.clone(),
              i = t,
              s = 0 | i.words[i.length - 1],
              u = this._countBits(s);
            (r = 26 - u),
              0 !== r &&
                ((i = i.ushln(r)),
                n.iushln(r),
                (s = 0 | i.words[i.length - 1]));
            var a,
              h = n.length - i.length;
            if ("mod" !== e) {
              (a = new o(null)),
                (a.length = h + 1),
                (a.words = new Array(a.length));
              for (var l = 0; l < a.length; l++) a.words[l] = 0;
            }
            var f = n.clone()._ishlnsubmul(i, 1, h);
            0 === f.negative && ((n = f), a && (a.words[h] = 1));
            for (var c = h - 1; c >= 0; c--) {
              var d =
                67108864 * (0 | n.words[i.length + c]) +
                (0 | n.words[i.length + c - 1]);
              (d = Math.min((d / s) | 0, 67108863)), n._ishlnsubmul(i, d, c);
              while (0 !== n.negative)
                d--,
                  (n.negative = 0),
                  n._ishlnsubmul(i, 1, c),
                  n.isZero() || (n.negative ^= 1);
              a && (a.words[c] = d);
            }
            return (
              a && a.strip(),
              n.strip(),
              "div" !== e && 0 !== r && n.iushrn(r),
              { div: a || null, mod: n }
            );
          }),
          (o.prototype.divmod = function (t, e, r) {
            return (
              n(!t.isZero()),
              this.isZero()
                ? { div: new o(0), mod: new o(0) }
                : 0 !== this.negative && 0 === t.negative
                ? ((u = this.neg().divmod(t, e)),
                  "mod" !== e && (i = u.div.neg()),
                  "div" !== e &&
                    ((s = u.mod.neg()), r && 0 !== s.negative && s.iadd(t)),
                  { div: i, mod: s })
                : 0 === this.negative && 0 !== t.negative
                ? ((u = this.divmod(t.neg(), e)),
                  "mod" !== e && (i = u.div.neg()),
                  { div: i, mod: u.mod })
                : 0 !== (this.negative & t.negative)
                ? ((u = this.neg().divmod(t.neg(), e)),
                  "div" !== e &&
                    ((s = u.mod.neg()), r && 0 !== s.negative && s.isub(t)),
                  { div: u.div, mod: s })
                : t.length > this.length || this.cmp(t) < 0
                ? { div: new o(0), mod: this }
                : 1 === t.length
                ? "div" === e
                  ? { div: this.divn(t.words[0]), mod: null }
                  : "mod" === e
                  ? { div: null, mod: new o(this.modn(t.words[0])) }
                  : {
                      div: this.divn(t.words[0]),
                      mod: new o(this.modn(t.words[0])),
                    }
                : this._wordDiv(t, e)
            );
            var i, s, u;
          }),
          (o.prototype.div = function (t) {
            return this.divmod(t, "div", !1).div;
          }),
          (o.prototype.mod = function (t) {
            return this.divmod(t, "mod", !1).mod;
          }),
          (o.prototype.umod = function (t) {
            return this.divmod(t, "mod", !0).mod;
          }),
          (o.prototype.divRound = function (t) {
            var e = this.divmod(t);
            if (e.mod.isZero()) return e.div;
            var r = 0 !== e.div.negative ? e.mod.isub(t) : e.mod,
              n = t.ushrn(1),
              i = t.andln(1),
              o = r.cmp(n);
            return o < 0 || (1 === i && 0 === o)
              ? e.div
              : 0 !== e.div.negative
              ? e.div.isubn(1)
              : e.div.iaddn(1);
          }),
          (o.prototype.modn = function (t) {
            n(t <= 67108863);
            for (var e = (1 << 26) % t, r = 0, i = this.length - 1; i >= 0; i--)
              r = (e * r + (0 | this.words[i])) % t;
            return r;
          }),
          (o.prototype.idivn = function (t) {
            n(t <= 67108863);
            for (var e = 0, r = this.length - 1; r >= 0; r--) {
              var i = (0 | this.words[r]) + 67108864 * e;
              (this.words[r] = (i / t) | 0), (e = i % t);
            }
            return this.strip();
          }),
          (o.prototype.divn = function (t) {
            return this.clone().idivn(t);
          }),
          (o.prototype.egcd = function (t) {
            n(0 === t.negative), n(!t.isZero());
            var e = this,
              r = t.clone();
            e = 0 !== e.negative ? e.umod(t) : e.clone();
            var i = new o(1),
              s = new o(0),
              u = new o(0),
              a = new o(1),
              h = 0;
            while (e.isEven() && r.isEven()) e.iushrn(1), r.iushrn(1), ++h;
            var l = r.clone(),
              f = e.clone();
            while (!e.isZero()) {
              for (
                var c = 0, d = 1;
                0 === (e.words[0] & d) && c < 26;
                ++c, d <<= 1
              );
              if (c > 0) {
                e.iushrn(c);
                while (c-- > 0)
                  (i.isOdd() || s.isOdd()) && (i.iadd(l), s.isub(f)),
                    i.iushrn(1),
                    s.iushrn(1);
              }
              for (
                var p = 0, m = 1;
                0 === (r.words[0] & m) && p < 26;
                ++p, m <<= 1
              );
              if (p > 0) {
                r.iushrn(p);
                while (p-- > 0)
                  (u.isOdd() || a.isOdd()) && (u.iadd(l), a.isub(f)),
                    u.iushrn(1),
                    a.iushrn(1);
              }
              e.cmp(r) >= 0
                ? (e.isub(r), i.isub(u), s.isub(a))
                : (r.isub(e), u.isub(i), a.isub(s));
            }
            return { a: u, b: a, gcd: r.iushln(h) };
          }),
          (o.prototype._invmp = function (t) {
            n(0 === t.negative), n(!t.isZero());
            var e = this,
              r = t.clone();
            e = 0 !== e.negative ? e.umod(t) : e.clone();
            var i,
              s = new o(1),
              u = new o(0),
              a = r.clone();
            while (e.cmpn(1) > 0 && r.cmpn(1) > 0) {
              for (
                var h = 0, l = 1;
                0 === (e.words[0] & l) && h < 26;
                ++h, l <<= 1
              );
              if (h > 0) {
                e.iushrn(h);
                while (h-- > 0) s.isOdd() && s.iadd(a), s.iushrn(1);
              }
              for (
                var f = 0, c = 1;
                0 === (r.words[0] & c) && f < 26;
                ++f, c <<= 1
              );
              if (f > 0) {
                r.iushrn(f);
                while (f-- > 0) u.isOdd() && u.iadd(a), u.iushrn(1);
              }
              e.cmp(r) >= 0 ? (e.isub(r), s.isub(u)) : (r.isub(e), u.isub(s));
            }
            return (i = 0 === e.cmpn(1) ? s : u), i.cmpn(0) < 0 && i.iadd(t), i;
          }),
          (o.prototype.gcd = function (t) {
            if (this.isZero()) return t.abs();
            if (t.isZero()) return this.abs();
            var e = this.clone(),
              r = t.clone();
            (e.negative = 0), (r.negative = 0);
            for (var n = 0; e.isEven() && r.isEven(); n++)
              e.iushrn(1), r.iushrn(1);
            do {
              while (e.isEven()) e.iushrn(1);
              while (r.isEven()) r.iushrn(1);
              var i = e.cmp(r);
              if (i < 0) {
                var o = e;
                (e = r), (r = o);
              } else if (0 === i || 0 === r.cmpn(1)) break;
              e.isub(r);
            } while (1);
            return r.iushln(n);
          }),
          (o.prototype.invm = function (t) {
            return this.egcd(t).a.umod(t);
          }),
          (o.prototype.isEven = function () {
            return 0 === (1 & this.words[0]);
          }),
          (o.prototype.isOdd = function () {
            return 1 === (1 & this.words[0]);
          }),
          (o.prototype.andln = function (t) {
            return this.words[0] & t;
          }),
          (o.prototype.bincn = function (t) {
            n("number" === typeof t);
            var e = t % 26,
              r = (t - e) / 26,
              i = 1 << e;
            if (this.length <= r)
              return this._expand(r + 1), (this.words[r] |= i), this;
            for (var o = i, s = r; 0 !== o && s < this.length; s++) {
              var u = 0 | this.words[s];
              (u += o), (o = u >>> 26), (u &= 67108863), (this.words[s] = u);
            }
            return 0 !== o && ((this.words[s] = o), this.length++), this;
          }),
          (o.prototype.isZero = function () {
            return 1 === this.length && 0 === this.words[0];
          }),
          (o.prototype.cmpn = function (t) {
            var e,
              r = t < 0;
            if (0 !== this.negative && !r) return -1;
            if (0 === this.negative && r) return 1;
            if ((this.strip(), this.length > 1)) e = 1;
            else {
              r && (t = -t), n(t <= 67108863, "Number is too big");
              var i = 0 | this.words[0];
              e = i === t ? 0 : i < t ? -1 : 1;
            }
            return 0 !== this.negative ? 0 | -e : e;
          }),
          (o.prototype.cmp = function (t) {
            if (0 !== this.negative && 0 === t.negative) return -1;
            if (0 === this.negative && 0 !== t.negative) return 1;
            var e = this.ucmp(t);
            return 0 !== this.negative ? 0 | -e : e;
          }),
          (o.prototype.ucmp = function (t) {
            if (this.length > t.length) return 1;
            if (this.length < t.length) return -1;
            for (var e = 0, r = this.length - 1; r >= 0; r--) {
              var n = 0 | this.words[r],
                i = 0 | t.words[r];
              if (n !== i) {
                n < i ? (e = -1) : n > i && (e = 1);
                break;
              }
            }
            return e;
          }),
          (o.prototype.gtn = function (t) {
            return 1 === this.cmpn(t);
          }),
          (o.prototype.gt = function (t) {
            return 1 === this.cmp(t);
          }),
          (o.prototype.gten = function (t) {
            return this.cmpn(t) >= 0;
          }),
          (o.prototype.gte = function (t) {
            return this.cmp(t) >= 0;
          }),
          (o.prototype.ltn = function (t) {
            return -1 === this.cmpn(t);
          }),
          (o.prototype.lt = function (t) {
            return -1 === this.cmp(t);
          }),
          (o.prototype.lten = function (t) {
            return this.cmpn(t) <= 0;
          }),
          (o.prototype.lte = function (t) {
            return this.cmp(t) <= 0;
          }),
          (o.prototype.eqn = function (t) {
            return 0 === this.cmpn(t);
          }),
          (o.prototype.eq = function (t) {
            return 0 === this.cmp(t);
          }),
          (o.red = function (t) {
            return new S(t);
          }),
          (o.prototype.toRed = function (t) {
            return (
              n(!this.red, "Already a number in reduction context"),
              n(0 === this.negative, "red works only with positives"),
              t.convertTo(this)._forceRed(t)
            );
          }),
          (o.prototype.fromRed = function () {
            return (
              n(
                this.red,
                "fromRed works only with numbers in reduction context"
              ),
              this.red.convertFrom(this)
            );
          }),
          (o.prototype._forceRed = function (t) {
            return (this.red = t), this;
          }),
          (o.prototype.forceRed = function (t) {
            return (
              n(!this.red, "Already a number in reduction context"),
              this._forceRed(t)
            );
          }),
          (o.prototype.redAdd = function (t) {
            return (
              n(this.red, "redAdd works only with red numbers"),
              this.red.add(this, t)
            );
          }),
          (o.prototype.redIAdd = function (t) {
            return (
              n(this.red, "redIAdd works only with red numbers"),
              this.red.iadd(this, t)
            );
          }),
          (o.prototype.redSub = function (t) {
            return (
              n(this.red, "redSub works only with red numbers"),
              this.red.sub(this, t)
            );
          }),
          (o.prototype.redISub = function (t) {
            return (
              n(this.red, "redISub works only with red numbers"),
              this.red.isub(this, t)
            );
          }),
          (o.prototype.redShl = function (t) {
            return (
              n(this.red, "redShl works only with red numbers"),
              this.red.shl(this, t)
            );
          }),
          (o.prototype.redMul = function (t) {
            return (
              n(this.red, "redMul works only with red numbers"),
              this.red._verify2(this, t),
              this.red.mul(this, t)
            );
          }),
          (o.prototype.redIMul = function (t) {
            return (
              n(this.red, "redMul works only with red numbers"),
              this.red._verify2(this, t),
              this.red.imul(this, t)
            );
          }),
          (o.prototype.redSqr = function () {
            return (
              n(this.red, "redSqr works only with red numbers"),
              this.red._verify1(this),
              this.red.sqr(this)
            );
          }),
          (o.prototype.redISqr = function () {
            return (
              n(this.red, "redISqr works only with red numbers"),
              this.red._verify1(this),
              this.red.isqr(this)
            );
          }),
          (o.prototype.redSqrt = function () {
            return (
              n(this.red, "redSqrt works only with red numbers"),
              this.red._verify1(this),
              this.red.sqrt(this)
            );
          }),
          (o.prototype.redInvm = function () {
            return (
              n(this.red, "redInvm works only with red numbers"),
              this.red._verify1(this),
              this.red.invm(this)
            );
          }),
          (o.prototype.redNeg = function () {
            return (
              n(this.red, "redNeg works only with red numbers"),
              this.red._verify1(this),
              this.red.neg(this)
            );
          }),
          (o.prototype.redPow = function (t) {
            return (
              n(this.red && !t.red, "redPow(normalNum)"),
              this.red._verify1(this),
              this.red.pow(this, t)
            );
          });
        var y = { k256: null, p224: null, p192: null, p25519: null };
        function w(t, e) {
          (this.name = t),
            (this.p = new o(e, 16)),
            (this.n = this.p.bitLength()),
            (this.k = new o(1).iushln(this.n).isub(this.p)),
            (this.tmp = this._tmp());
        }
        function b() {
          w.call(
            this,
            "k256",
            "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
          );
        }
        function M() {
          w.call(
            this,
            "p224",
            "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
          );
        }
        function _() {
          w.call(
            this,
            "p192",
            "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
          );
        }
        function x() {
          w.call(
            this,
            "25519",
            "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
          );
        }
        function S(t) {
          if ("string" === typeof t) {
            var e = o._prime(t);
            (this.m = e.p), (this.prime = e);
          } else
            n(t.gtn(1), "modulus must be greater than 1"),
              (this.m = t),
              (this.prime = null);
        }
        function E(t) {
          S.call(this, t),
            (this.shift = this.m.bitLength()),
            this.shift % 26 !== 0 && (this.shift += 26 - (this.shift % 26)),
            (this.r = new o(1).iushln(this.shift)),
            (this.r2 = this.imod(this.r.sqr())),
            (this.rinv = this.r._invmp(this.m)),
            (this.minv = this.rinv.mul(this.r).isubn(1).div(this.m)),
            (this.minv = this.minv.umod(this.r)),
            (this.minv = this.r.sub(this.minv));
        }
        (w.prototype._tmp = function () {
          var t = new o(null);
          return (t.words = new Array(Math.ceil(this.n / 13))), t;
        }),
          (w.prototype.ireduce = function (t) {
            var e,
              r = t;
            do {
              this.split(r, this.tmp),
                (r = this.imulK(r)),
                (r = r.iadd(this.tmp)),
                (e = r.bitLength());
            } while (e > this.n);
            var n = e < this.n ? -1 : r.ucmp(this.p);
            return (
              0 === n
                ? ((r.words[0] = 0), (r.length = 1))
                : n > 0
                ? r.isub(this.p)
                : r.strip(),
              r
            );
          }),
          (w.prototype.split = function (t, e) {
            t.iushrn(this.n, 0, e);
          }),
          (w.prototype.imulK = function (t) {
            return t.imul(this.k);
          }),
          i(b, w),
          (b.prototype.split = function (t, e) {
            for (var r = 4194303, n = Math.min(t.length, 9), i = 0; i < n; i++)
              e.words[i] = t.words[i];
            if (((e.length = n), t.length <= 9))
              return (t.words[0] = 0), void (t.length = 1);
            var o = t.words[9];
            for (e.words[e.length++] = o & r, i = 10; i < t.length; i++) {
              var s = 0 | t.words[i];
              (t.words[i - 10] = ((s & r) << 4) | (o >>> 22)), (o = s);
            }
            (o >>>= 22),
              (t.words[i - 10] = o),
              0 === o && t.length > 10 ? (t.length -= 10) : (t.length -= 9);
          }),
          (b.prototype.imulK = function (t) {
            (t.words[t.length] = 0),
              (t.words[t.length + 1] = 0),
              (t.length += 2);
            for (var e = 0, r = 0; r < t.length; r++) {
              var n = 0 | t.words[r];
              (e += 977 * n),
                (t.words[r] = 67108863 & e),
                (e = 64 * n + ((e / 67108864) | 0));
            }
            return (
              0 === t.words[t.length - 1] &&
                (t.length--, 0 === t.words[t.length - 1] && t.length--),
              t
            );
          }),
          i(M, w),
          i(_, w),
          i(x, w),
          (x.prototype.imulK = function (t) {
            for (var e = 0, r = 0; r < t.length; r++) {
              var n = 19 * (0 | t.words[r]) + e,
                i = 67108863 & n;
              (n >>>= 26), (t.words[r] = i), (e = n);
            }
            return 0 !== e && (t.words[t.length++] = e), t;
          }),
          (o._prime = function (t) {
            if (y[t]) return y[t];
            var e;
            if ("k256" === t) e = new b();
            else if ("p224" === t) e = new M();
            else if ("p192" === t) e = new _();
            else {
              if ("p25519" !== t) throw new Error("Unknown prime " + t);
              e = new x();
            }
            return (y[t] = e), e;
          }),
          (S.prototype._verify1 = function (t) {
            n(0 === t.negative, "red works only with positives"),
              n(t.red, "red works only with red numbers");
          }),
          (S.prototype._verify2 = function (t, e) {
            n(0 === (t.negative | e.negative), "red works only with positives"),
              n(t.red && t.red === e.red, "red works only with red numbers");
          }),
          (S.prototype.imod = function (t) {
            return this.prime
              ? this.prime.ireduce(t)._forceRed(this)
              : t.umod(this.m)._forceRed(this);
          }),
          (S.prototype.neg = function (t) {
            return t.isZero() ? t.clone() : this.m.sub(t)._forceRed(this);
          }),
          (S.prototype.add = function (t, e) {
            this._verify2(t, e);
            var r = t.add(e);
            return r.cmp(this.m) >= 0 && r.isub(this.m), r._forceRed(this);
          }),
          (S.prototype.iadd = function (t, e) {
            this._verify2(t, e);
            var r = t.iadd(e);
            return r.cmp(this.m) >= 0 && r.isub(this.m), r;
          }),
          (S.prototype.sub = function (t, e) {
            this._verify2(t, e);
            var r = t.sub(e);
            return r.cmpn(0) < 0 && r.iadd(this.m), r._forceRed(this);
          }),
          (S.prototype.isub = function (t, e) {
            this._verify2(t, e);
            var r = t.isub(e);
            return r.cmpn(0) < 0 && r.iadd(this.m), r;
          }),
          (S.prototype.shl = function (t, e) {
            return this._verify1(t), this.imod(t.ushln(e));
          }),
          (S.prototype.imul = function (t, e) {
            return this._verify2(t, e), this.imod(t.imul(e));
          }),
          (S.prototype.mul = function (t, e) {
            return this._verify2(t, e), this.imod(t.mul(e));
          }),
          (S.prototype.isqr = function (t) {
            return this.imul(t, t.clone());
          }),
          (S.prototype.sqr = function (t) {
            return this.mul(t, t);
          }),
          (S.prototype.sqrt = function (t) {
            if (t.isZero()) return t.clone();
            var e = this.m.andln(3);
            if ((n(e % 2 === 1), 3 === e)) {
              var r = this.m.add(new o(1)).iushrn(2);
              return this.pow(t, r);
            }
            var i = this.m.subn(1),
              s = 0;
            while (!i.isZero() && 0 === i.andln(1)) s++, i.iushrn(1);
            n(!i.isZero());
            var u = new o(1).toRed(this),
              a = u.redNeg(),
              h = this.m.subn(1).iushrn(1),
              l = this.m.bitLength();
            l = new o(2 * l * l).toRed(this);
            while (0 !== this.pow(l, h).cmp(a)) l.redIAdd(a);
            var f = this.pow(l, i),
              c = this.pow(t, i.addn(1).iushrn(1)),
              d = this.pow(t, i),
              p = s;
            while (0 !== d.cmp(u)) {
              for (var m = d, v = 0; 0 !== m.cmp(u); v++) m = m.redSqr();
              n(v < p);
              var g = this.pow(f, new o(1).iushln(p - v - 1));
              (c = c.redMul(g)), (f = g.redSqr()), (d = d.redMul(f)), (p = v);
            }
            return c;
          }),
          (S.prototype.invm = function (t) {
            var e = t._invmp(this.m);
            return 0 !== e.negative
              ? ((e.negative = 0), this.imod(e).redNeg())
              : this.imod(e);
          }),
          (S.prototype.pow = function (t, e) {
            if (e.isZero()) return new o(1);
            if (0 === e.cmpn(1)) return t.clone();
            var r = 4,
              n = new Array(1 << r);
            (n[0] = new o(1).toRed(this)), (n[1] = t);
            for (var i = 2; i < n.length; i++) n[i] = this.mul(n[i - 1], t);
            var s = n[0],
              u = 0,
              a = 0,
              h = e.bitLength() % 26;
            for (0 === h && (h = 26), i = e.length - 1; i >= 0; i--) {
              for (var l = e.words[i], f = h - 1; f >= 0; f--) {
                var c = (l >> f) & 1;
                s !== n[0] && (s = this.sqr(s)),
                  0 !== c || 0 !== u
                    ? ((u <<= 1),
                      (u |= c),
                      a++,
                      (a === r || (0 === i && 0 === f)) &&
                        ((s = this.mul(s, n[u])), (a = 0), (u = 0)))
                    : (a = 0);
              }
              h = 26;
            }
            return s;
          }),
          (S.prototype.convertTo = function (t) {
            var e = t.umod(this.m);
            return e === t ? e.clone() : e;
          }),
          (S.prototype.convertFrom = function (t) {
            var e = t.clone();
            return (e.red = null), e;
          }),
          (o.mont = function (t) {
            return new E(t);
          }),
          i(E, S),
          (E.prototype.convertTo = function (t) {
            return this.imod(t.ushln(this.shift));
          }),
          (E.prototype.convertFrom = function (t) {
            var e = this.imod(t.mul(this.rinv));
            return (e.red = null), e;
          }),
          (E.prototype.imul = function (t, e) {
            if (t.isZero() || e.isZero())
              return (t.words[0] = 0), (t.length = 1), t;
            var r = t.imul(e),
              n = r
                .maskn(this.shift)
                .mul(this.minv)
                .imaskn(this.shift)
                .mul(this.m),
              i = r.isub(n).iushrn(this.shift),
              o = i;
            return (
              i.cmp(this.m) >= 0
                ? (o = i.isub(this.m))
                : i.cmpn(0) < 0 && (o = i.iadd(this.m)),
              o._forceRed(this)
            );
          }),
          (E.prototype.mul = function (t, e) {
            if (t.isZero() || e.isZero()) return new o(0)._forceRed(this);
            var r = t.mul(e),
              n = r
                .maskn(this.shift)
                .mul(this.minv)
                .imaskn(this.shift)
                .mul(this.m),
              i = r.isub(n).iushrn(this.shift),
              s = i;
            return (
              i.cmp(this.m) >= 0
                ? (s = i.isub(this.m))
                : i.cmpn(0) < 0 && (s = i.iadd(this.m)),
              s._forceRed(this)
            );
          }),
          (E.prototype.invm = function (t) {
            var e = this.imod(t._invmp(this.m).mul(this.r2));
            return e._forceRed(this);
          });
      })(t, this);
    }.call(this, r("62e4")(t)));
  },
  e95a: function (t, e, r) {
    var n = r("b622"),
      i = r("3f8c"),
      o = n("iterator"),
      s = Array.prototype;
    t.exports = function (t) {
      return void 0 !== t && (i.Array === t || s[o] === t);
    };
  },
  ef84: function (t, e, r) {
    "use strict";
    var n,
      i = null;
    try {
      n = Function("return this")();
    } catch (o) {
      n = window;
    }
    "undefined" !== typeof n.ethereumProvider
      ? (i = n.ethereumProvider)
      : "undefined" !== typeof n.web3 &&
        n.web3.currentProvider &&
        (n.web3.currentProvider.sendAsync &&
          ((n.web3.currentProvider.send = n.web3.currentProvider.sendAsync),
          delete n.web3.currentProvider.sendAsync),
        !n.web3.currentProvider.on &&
          n.web3.currentProvider.connection &&
          "ipcProviderWrapper" ===
            n.web3.currentProvider.connection.constructor.name &&
          (n.web3.currentProvider.on = function (t, e) {
            if ("function" !== typeof e)
              throw new Error(
                "The second parameter callback must be a function."
              );
            switch (t) {
              case "data":
                this.connection.on("data", function (t) {
                  var r = "";
                  t = t.toString();
                  try {
                    r = JSON.parse(t);
                  } catch (o) {
                    return e(new Error("Couldn't parse response data" + t));
                  }
                  r.id ||
                    -1 === r.method.indexOf("_subscription") ||
                    e(null, r);
                });
                break;
              default:
                this.connection.on(t, e);
                break;
            }
          }),
        (i = n.web3.currentProvider)),
      (t.exports = i);
  },
  f069: function (t, e, r) {
    "use strict";
    var n = r("1c0b"),
      i = function (t) {
        var e, r;
        (this.promise = new t(function (t, n) {
          if (void 0 !== e || void 0 !== r)
            throw TypeError("Bad Promise constructor");
          (e = t), (r = n);
        })),
          (this.resolve = n(e)),
          (this.reject = n(r));
      };
    t.exports.f = function (t) {
      return new i(t);
    };
  },
  f1dd: function (t, e, r) {
    (function (t) {
      var e,
        r,
        n,
        i = String.fromCharCode;
      function o(t) {
        var e,
          r,
          n = [],
          i = 0,
          o = t.length;
        while (i < o)
          (e = t.charCodeAt(i++)),
            e >= 55296 && e <= 56319 && i < o
              ? ((r = t.charCodeAt(i++)),
                56320 == (64512 & r)
                  ? n.push(((1023 & e) << 10) + (1023 & r) + 65536)
                  : (n.push(e), i--))
              : n.push(e);
        return n;
      }
      function s(t) {
        var e,
          r = t.length,
          n = -1,
          o = "";
        while (++n < r)
          (e = t[n]),
            e > 65535 &&
              ((e -= 65536),
              (o += i(((e >>> 10) & 1023) | 55296)),
              (e = 56320 | (1023 & e))),
            (o += i(e));
        return o;
      }
      function u(t) {
        if (t >= 55296 && t <= 57343)
          throw Error(
            "Lone surrogate U+" +
              t.toString(16).toUpperCase() +
              " is not a scalar value"
          );
      }
      function a(t, e) {
        return i(((t >> e) & 63) | 128);
      }
      function h(t) {
        if (0 == (4294967168 & t)) return i(t);
        var e = "";
        return (
          0 == (4294965248 & t)
            ? (e = i(((t >> 6) & 31) | 192))
            : 0 == (4294901760 & t)
            ? (u(t), (e = i(((t >> 12) & 15) | 224)), (e += a(t, 6)))
            : 0 == (4292870144 & t) &&
              ((e = i(((t >> 18) & 7) | 240)), (e += a(t, 12)), (e += a(t, 6))),
          (e += i((63 & t) | 128)),
          e
        );
      }
      function l(t) {
        var e,
          r = o(t),
          n = r.length,
          i = -1,
          s = "";
        while (++i < n) (e = r[i]), (s += h(e));
        return s;
      }
      function f() {
        if (n >= r) throw Error("Invalid byte index");
        var t = 255 & e[n];
        if ((n++, 128 == (192 & t))) return 63 & t;
        throw Error("Invalid continuation byte");
      }
      function c() {
        var t, i, o, s, a;
        if (n > r) throw Error("Invalid byte index");
        if (n == r) return !1;
        if (((t = 255 & e[n]), n++, 0 == (128 & t))) return t;
        if (192 == (224 & t)) {
          if (((i = f()), (a = ((31 & t) << 6) | i), a >= 128)) return a;
          throw Error("Invalid continuation byte");
        }
        if (224 == (240 & t)) {
          if (
            ((i = f()),
            (o = f()),
            (a = ((15 & t) << 12) | (i << 6) | o),
            a >= 2048)
          )
            return u(a), a;
          throw Error("Invalid continuation byte");
        }
        if (
          240 == (248 & t) &&
          ((i = f()),
          (o = f()),
          (s = f()),
          (a = ((7 & t) << 18) | (i << 12) | (o << 6) | s),
          a >= 65536 && a <= 1114111)
        )
          return a;
        throw Error("Invalid UTF-8 detected");
      }
      function d(t) {
        (e = o(t)), (r = e.length), (n = 0);
        var i,
          u = [];
        while (!1 !== (i = c())) u.push(i);
        return s(u);
      }
      (t.version = "3.0.0"), (t.encode = l), (t.decode = d);
    })(e);
  },
  f4ddb: function (t, e, r) {
    "use strict";
    var n = r("23e7"),
      i = r("d58f").right,
      o = r("a640"),
      s = r("ae40"),
      u = r("2d00"),
      a = r("605d"),
      h = o("reduceRight"),
      l = s("reduce", { 1: 0 }),
      f = !a && u > 79 && u < 83;
    n(
      { target: "Array", proto: !0, forced: !h || !l || f },
      {
        reduceRight: function (t) {
          return i(
            this,
            t,
            arguments.length,
            arguments.length > 1 ? arguments[1] : void 0
          );
        },
      }
    );
  },
  f5df: function (t, e, r) {
    var n = r("00ee"),
      i = r("c6b6"),
      o = r("b622"),
      s = o("toStringTag"),
      u =
        "Arguments" ==
        i(
          (function () {
            return arguments;
          })()
        ),
      a = function (t, e) {
        try {
          return t[e];
        } catch (r) {}
      };
    t.exports = n
      ? i
      : function (t) {
          var e, r, n;
          return void 0 === t
            ? "Undefined"
            : null === t
            ? "Null"
            : "string" == typeof (r = a((e = Object(t)), s))
            ? r
            : u
            ? i(e)
            : "Object" == (n = i(e)) && "function" == typeof e.callee
            ? "Arguments"
            : n;
        };
  },
  f609: function (t, e, r) {
    (function (t) {
      (function (t, e) {
        "use strict";
        function n(t, e) {
          if (!t) throw new Error(e || "Assertion failed");
        }
        function i(t, e) {
          t.super_ = e;
          var r = function () {};
          (r.prototype = e.prototype),
            (t.prototype = new r()),
            (t.prototype.constructor = t);
        }
        function o(t, e, r) {
          if (o.isBN(t)) return t;
          (this.negative = 0),
            (this.words = null),
            (this.length = 0),
            (this.red = null),
            null !== t &&
              (("le" !== e && "be" !== e) || ((r = e), (e = 10)),
              this._init(t || 0, e || 10, r || "be"));
        }
        var s;
        "object" === typeof t ? (t.exports = o) : (e.BN = o),
          (o.BN = o),
          (o.wordSize = 26);
        try {
          s = r(2).Buffer;
        } catch (A) {}
        function u(t, e, r) {
          for (var n = 0, i = Math.min(t.length, r), o = e; o < i; o++) {
            var s = t.charCodeAt(o) - 48;
            (n <<= 4),
              (n |=
                s >= 49 && s <= 54
                  ? s - 49 + 10
                  : s >= 17 && s <= 22
                  ? s - 17 + 10
                  : 15 & s);
          }
          return n;
        }
        function a(t, e, r, n) {
          for (var i = 0, o = Math.min(t.length, r), s = e; s < o; s++) {
            var u = t.charCodeAt(s) - 48;
            (i *= n), (i += u >= 49 ? u - 49 + 10 : u >= 17 ? u - 17 + 10 : u);
          }
          return i;
        }
        (o.isBN = function (t) {
          return (
            t instanceof o ||
            (null !== t &&
              "object" === typeof t &&
              t.constructor.wordSize === o.wordSize &&
              Array.isArray(t.words))
          );
        }),
          (o.max = function (t, e) {
            return t.cmp(e) > 0 ? t : e;
          }),
          (o.min = function (t, e) {
            return t.cmp(e) < 0 ? t : e;
          }),
          (o.prototype._init = function (t, e, r) {
            if ("number" === typeof t) return this._initNumber(t, e, r);
            if ("object" === typeof t) return this._initArray(t, e, r);
            "hex" === e && (e = 16),
              n(e === (0 | e) && e >= 2 && e <= 36),
              (t = t.toString().replace(/\s+/g, ""));
            var i = 0;
            "-" === t[0] && i++,
              16 === e ? this._parseHex(t, i) : this._parseBase(t, e, i),
              "-" === t[0] && (this.negative = 1),
              this.strip(),
              "le" === r && this._initArray(this.toArray(), e, r);
          }),
          (o.prototype._initNumber = function (t, e, r) {
            t < 0 && ((this.negative = 1), (t = -t)),
              t < 67108864
                ? ((this.words = [67108863 & t]), (this.length = 1))
                : t < 4503599627370496
                ? ((this.words = [67108863 & t, (t / 67108864) & 67108863]),
                  (this.length = 2))
                : (n(t < 9007199254740992),
                  (this.words = [67108863 & t, (t / 67108864) & 67108863, 1]),
                  (this.length = 3)),
              "le" === r && this._initArray(this.toArray(), e, r);
          }),
          (o.prototype._initArray = function (t, e, r) {
            if ((n("number" === typeof t.length), t.length <= 0))
              return (this.words = [0]), (this.length = 1), this;
            (this.length = Math.ceil(t.length / 3)),
              (this.words = new Array(this.length));
            for (var i = 0; i < this.length; i++) this.words[i] = 0;
            var o,
              s,
              u = 0;
            if ("be" === r)
              for (i = t.length - 1, o = 0; i >= 0; i -= 3)
                (s = t[i] | (t[i - 1] << 8) | (t[i - 2] << 16)),
                  (this.words[o] |= (s << u) & 67108863),
                  (this.words[o + 1] = (s >>> (26 - u)) & 67108863),
                  (u += 24),
                  u >= 26 && ((u -= 26), o++);
            else if ("le" === r)
              for (i = 0, o = 0; i < t.length; i += 3)
                (s = t[i] | (t[i + 1] << 8) | (t[i + 2] << 16)),
                  (this.words[o] |= (s << u) & 67108863),
                  (this.words[o + 1] = (s >>> (26 - u)) & 67108863),
                  (u += 24),
                  u >= 26 && ((u -= 26), o++);
            return this.strip();
          }),
          (o.prototype._parseHex = function (t, e) {
            (this.length = Math.ceil((t.length - e) / 6)),
              (this.words = new Array(this.length));
            for (var r = 0; r < this.length; r++) this.words[r] = 0;
            var n,
              i,
              o = 0;
            for (r = t.length - 6, n = 0; r >= e; r -= 6)
              (i = u(t, r, r + 6)),
                (this.words[n] |= (i << o) & 67108863),
                (this.words[n + 1] |= (i >>> (26 - o)) & 4194303),
                (o += 24),
                o >= 26 && ((o -= 26), n++);
            r + 6 !== e &&
              ((i = u(t, e, r + 6)),
              (this.words[n] |= (i << o) & 67108863),
              (this.words[n + 1] |= (i >>> (26 - o)) & 4194303)),
              this.strip();
          }),
          (o.prototype._parseBase = function (t, e, r) {
            (this.words = [0]), (this.length = 1);
            for (var n = 0, i = 1; i <= 67108863; i *= e) n++;
            n--, (i = (i / e) | 0);
            for (
              var o = t.length - r,
                s = o % n,
                u = Math.min(o, o - s) + r,
                h = 0,
                l = r;
              l < u;
              l += n
            )
              (h = a(t, l, l + n, e)),
                this.imuln(i),
                this.words[0] + h < 67108864
                  ? (this.words[0] += h)
                  : this._iaddn(h);
            if (0 !== s) {
              var f = 1;
              for (h = a(t, l, t.length, e), l = 0; l < s; l++) f *= e;
              this.imuln(f),
                this.words[0] + h < 67108864
                  ? (this.words[0] += h)
                  : this._iaddn(h);
            }
          }),
          (o.prototype.copy = function (t) {
            t.words = new Array(this.length);
            for (var e = 0; e < this.length; e++) t.words[e] = this.words[e];
            (t.length = this.length),
              (t.negative = this.negative),
              (t.red = this.red);
          }),
          (o.prototype.clone = function () {
            var t = new o(null);
            return this.copy(t), t;
          }),
          (o.prototype._expand = function (t) {
            while (this.length < t) this.words[this.length++] = 0;
            return this;
          }),
          (o.prototype.strip = function () {
            while (this.length > 1 && 0 === this.words[this.length - 1])
              this.length--;
            return this._normSign();
          }),
          (o.prototype._normSign = function () {
            return (
              1 === this.length && 0 === this.words[0] && (this.negative = 0),
              this
            );
          }),
          (o.prototype.inspect = function () {
            return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
          });
        var h = [
            "",
            "0",
            "00",
            "000",
            "0000",
            "00000",
            "000000",
            "0000000",
            "00000000",
            "000000000",
            "0000000000",
            "00000000000",
            "000000000000",
            "0000000000000",
            "00000000000000",
            "000000000000000",
            "0000000000000000",
            "00000000000000000",
            "000000000000000000",
            "0000000000000000000",
            "00000000000000000000",
            "000000000000000000000",
            "0000000000000000000000",
            "00000000000000000000000",
            "000000000000000000000000",
            "0000000000000000000000000",
          ],
          l = [
            0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          ],
          f = [
            0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607,
            16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536,
            11390625, 16777216, 24137569, 34012224, 47045881, 64e6, 4084101,
            5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368,
            20511149, 243e5, 28629151, 33554432, 39135393, 45435424, 52521875,
            60466176,
          ];
        function c(t) {
          for (var e = new Array(t.bitLength()), r = 0; r < e.length; r++) {
            var n = (r / 26) | 0,
              i = r % 26;
            e[r] = (t.words[n] & (1 << i)) >>> i;
          }
          return e;
        }
        function d(t, e, r) {
          r.negative = e.negative ^ t.negative;
          var n = (t.length + e.length) | 0;
          (r.length = n), (n = (n - 1) | 0);
          var i = 0 | t.words[0],
            o = 0 | e.words[0],
            s = i * o,
            u = 67108863 & s,
            a = (s / 67108864) | 0;
          r.words[0] = u;
          for (var h = 1; h < n; h++) {
            for (
              var l = a >>> 26,
                f = 67108863 & a,
                c = Math.min(h, e.length - 1),
                d = Math.max(0, h - t.length + 1);
              d <= c;
              d++
            ) {
              var p = (h - d) | 0;
              (i = 0 | t.words[p]),
                (o = 0 | e.words[d]),
                (s = i * o + f),
                (l += (s / 67108864) | 0),
                (f = 67108863 & s);
            }
            (r.words[h] = 0 | f), (a = 0 | l);
          }
          return 0 !== a ? (r.words[h] = 0 | a) : r.length--, r.strip();
        }
        (o.prototype.toString = function (t, e) {
          var r;
          if (((t = t || 10), (e = 0 | e || 1), 16 === t || "hex" === t)) {
            r = "";
            for (var i = 0, o = 0, s = 0; s < this.length; s++) {
              var u = this.words[s],
                a = (16777215 & ((u << i) | o)).toString(16);
              (o = (u >>> (24 - i)) & 16777215),
                (r =
                  0 !== o || s !== this.length - 1
                    ? h[6 - a.length] + a + r
                    : a + r),
                (i += 2),
                i >= 26 && ((i -= 26), s--);
            }
            0 !== o && (r = o.toString(16) + r);
            while (r.length % e !== 0) r = "0" + r;
            return 0 !== this.negative && (r = "-" + r), r;
          }
          if (t === (0 | t) && t >= 2 && t <= 36) {
            var c = l[t],
              d = f[t];
            r = "";
            var p = this.clone();
            p.negative = 0;
            while (!p.isZero()) {
              var m = p.modn(d).toString(t);
              (p = p.idivn(d)),
                (r = p.isZero() ? m + r : h[c - m.length] + m + r);
            }
            this.isZero() && (r = "0" + r);
            while (r.length % e !== 0) r = "0" + r;
            return 0 !== this.negative && (r = "-" + r), r;
          }
          n(!1, "Base should be between 2 and 36");
        }),
          (o.prototype.toNumber = function () {
            var t = this.words[0];
            return (
              2 === this.length
                ? (t += 67108864 * this.words[1])
                : 3 === this.length && 1 === this.words[2]
                ? (t += 4503599627370496 + 67108864 * this.words[1])
                : this.length > 2 &&
                  n(!1, "Number can only safely store up to 53 bits"),
              0 !== this.negative ? -t : t
            );
          }),
          (o.prototype.toJSON = function () {
            return this.toString(16);
          }),
          (o.prototype.toBuffer = function (t, e) {
            return n("undefined" !== typeof s), this.toArrayLike(s, t, e);
          }),
          (o.prototype.toArray = function (t, e) {
            return this.toArrayLike(Array, t, e);
          }),
          (o.prototype.toArrayLike = function (t, e, r) {
            var i = this.byteLength(),
              o = r || Math.max(1, i);
            n(i <= o, "byte array longer than desired length"),
              n(o > 0, "Requested array length <= 0"),
              this.strip();
            var s,
              u,
              a = "le" === e,
              h = new t(o),
              l = this.clone();
            if (a) {
              for (u = 0; !l.isZero(); u++)
                (s = l.andln(255)), l.iushrn(8), (h[u] = s);
              for (; u < o; u++) h[u] = 0;
            } else {
              for (u = 0; u < o - i; u++) h[u] = 0;
              for (u = 0; !l.isZero(); u++)
                (s = l.andln(255)), l.iushrn(8), (h[o - u - 1] = s);
            }
            return h;
          }),
          Math.clz32
            ? (o.prototype._countBits = function (t) {
                return 32 - Math.clz32(t);
              })
            : (o.prototype._countBits = function (t) {
                var e = t,
                  r = 0;
                return (
                  e >= 4096 && ((r += 13), (e >>>= 13)),
                  e >= 64 && ((r += 7), (e >>>= 7)),
                  e >= 8 && ((r += 4), (e >>>= 4)),
                  e >= 2 && ((r += 2), (e >>>= 2)),
                  r + e
                );
              }),
          (o.prototype._zeroBits = function (t) {
            if (0 === t) return 26;
            var e = t,
              r = 0;
            return (
              0 === (8191 & e) && ((r += 13), (e >>>= 13)),
              0 === (127 & e) && ((r += 7), (e >>>= 7)),
              0 === (15 & e) && ((r += 4), (e >>>= 4)),
              0 === (3 & e) && ((r += 2), (e >>>= 2)),
              0 === (1 & e) && r++,
              r
            );
          }),
          (o.prototype.bitLength = function () {
            var t = this.words[this.length - 1],
              e = this._countBits(t);
            return 26 * (this.length - 1) + e;
          }),
          (o.prototype.zeroBits = function () {
            if (this.isZero()) return 0;
            for (var t = 0, e = 0; e < this.length; e++) {
              var r = this._zeroBits(this.words[e]);
              if (((t += r), 26 !== r)) break;
            }
            return t;
          }),
          (o.prototype.byteLength = function () {
            return Math.ceil(this.bitLength() / 8);
          }),
          (o.prototype.toTwos = function (t) {
            return 0 !== this.negative
              ? this.abs().inotn(t).iaddn(1)
              : this.clone();
          }),
          (o.prototype.fromTwos = function (t) {
            return this.testn(t - 1)
              ? this.notn(t).iaddn(1).ineg()
              : this.clone();
          }),
          (o.prototype.isNeg = function () {
            return 0 !== this.negative;
          }),
          (o.prototype.neg = function () {
            return this.clone().ineg();
          }),
          (o.prototype.ineg = function () {
            return this.isZero() || (this.negative ^= 1), this;
          }),
          (o.prototype.iuor = function (t) {
            while (this.length < t.length) this.words[this.length++] = 0;
            for (var e = 0; e < t.length; e++)
              this.words[e] = this.words[e] | t.words[e];
            return this.strip();
          }),
          (o.prototype.ior = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuor(t);
          }),
          (o.prototype.or = function (t) {
            return this.length > t.length
              ? this.clone().ior(t)
              : t.clone().ior(this);
          }),
          (o.prototype.uor = function (t) {
            return this.length > t.length
              ? this.clone().iuor(t)
              : t.clone().iuor(this);
          }),
          (o.prototype.iuand = function (t) {
            var e;
            e = this.length > t.length ? t : this;
            for (var r = 0; r < e.length; r++)
              this.words[r] = this.words[r] & t.words[r];
            return (this.length = e.length), this.strip();
          }),
          (o.prototype.iand = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuand(t);
          }),
          (o.prototype.and = function (t) {
            return this.length > t.length
              ? this.clone().iand(t)
              : t.clone().iand(this);
          }),
          (o.prototype.uand = function (t) {
            return this.length > t.length
              ? this.clone().iuand(t)
              : t.clone().iuand(this);
          }),
          (o.prototype.iuxor = function (t) {
            var e, r;
            this.length > t.length
              ? ((e = this), (r = t))
              : ((e = t), (r = this));
            for (var n = 0; n < r.length; n++)
              this.words[n] = e.words[n] ^ r.words[n];
            if (this !== e)
              for (; n < e.length; n++) this.words[n] = e.words[n];
            return (this.length = e.length), this.strip();
          }),
          (o.prototype.ixor = function (t) {
            return n(0 === (this.negative | t.negative)), this.iuxor(t);
          }),
          (o.prototype.xor = function (t) {
            return this.length > t.length
              ? this.clone().ixor(t)
              : t.clone().ixor(this);
          }),
          (o.prototype.uxor = function (t) {
            return this.length > t.length
              ? this.clone().iuxor(t)
              : t.clone().iuxor(this);
          }),
          (o.prototype.inotn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = 0 | Math.ceil(t / 26),
              r = t % 26;
            this._expand(e), r > 0 && e--;
            for (var i = 0; i < e; i++)
              this.words[i] = 67108863 & ~this.words[i];
            return (
              r > 0 &&
                (this.words[i] = ~this.words[i] & (67108863 >> (26 - r))),
              this.strip()
            );
          }),
          (o.prototype.notn = function (t) {
            return this.clone().inotn(t);
          }),
          (o.prototype.setn = function (t, e) {
            n("number" === typeof t && t >= 0);
            var r = (t / 26) | 0,
              i = t % 26;
            return (
              this._expand(r + 1),
              (this.words[r] = e
                ? this.words[r] | (1 << i)
                : this.words[r] & ~(1 << i)),
              this.strip()
            );
          }),
          (o.prototype.iadd = function (t) {
            var e, r, n;
            if (0 !== this.negative && 0 === t.negative)
              return (
                (this.negative = 0),
                (e = this.isub(t)),
                (this.negative ^= 1),
                this._normSign()
              );
            if (0 === this.negative && 0 !== t.negative)
              return (
                (t.negative = 0),
                (e = this.isub(t)),
                (t.negative = 1),
                e._normSign()
              );
            this.length > t.length
              ? ((r = this), (n = t))
              : ((r = t), (n = this));
            for (var i = 0, o = 0; o < n.length; o++)
              (e = (0 | r.words[o]) + (0 | n.words[o]) + i),
                (this.words[o] = 67108863 & e),
                (i = e >>> 26);
            for (; 0 !== i && o < r.length; o++)
              (e = (0 | r.words[o]) + i),
                (this.words[o] = 67108863 & e),
                (i = e >>> 26);
            if (((this.length = r.length), 0 !== i))
              (this.words[this.length] = i), this.length++;
            else if (r !== this)
              for (; o < r.length; o++) this.words[o] = r.words[o];
            return this;
          }),
          (o.prototype.add = function (t) {
            var e;
            return 0 !== t.negative && 0 === this.negative
              ? ((t.negative = 0), (e = this.sub(t)), (t.negative ^= 1), e)
              : 0 === t.negative && 0 !== this.negative
              ? ((this.negative = 0), (e = t.sub(this)), (this.negative = 1), e)
              : this.length > t.length
              ? this.clone().iadd(t)
              : t.clone().iadd(this);
          }),
          (o.prototype.isub = function (t) {
            if (0 !== t.negative) {
              t.negative = 0;
              var e = this.iadd(t);
              return (t.negative = 1), e._normSign();
            }
            if (0 !== this.negative)
              return (
                (this.negative = 0),
                this.iadd(t),
                (this.negative = 1),
                this._normSign()
              );
            var r,
              n,
              i = this.cmp(t);
            if (0 === i)
              return (
                (this.negative = 0),
                (this.length = 1),
                (this.words[0] = 0),
                this
              );
            i > 0 ? ((r = this), (n = t)) : ((r = t), (n = this));
            for (var o = 0, s = 0; s < n.length; s++)
              (e = (0 | r.words[s]) - (0 | n.words[s]) + o),
                (o = e >> 26),
                (this.words[s] = 67108863 & e);
            for (; 0 !== o && s < r.length; s++)
              (e = (0 | r.words[s]) + o),
                (o = e >> 26),
                (this.words[s] = 67108863 & e);
            if (0 === o && s < r.length && r !== this)
              for (; s < r.length; s++) this.words[s] = r.words[s];
            return (
              (this.length = Math.max(this.length, s)),
              r !== this && (this.negative = 1),
              this.strip()
            );
          }),
          (o.prototype.sub = function (t) {
            return this.clone().isub(t);
          });
        var p = function (t, e, r) {
          var n,
            i,
            o,
            s = t.words,
            u = e.words,
            a = r.words,
            h = 0,
            l = 0 | s[0],
            f = 8191 & l,
            c = l >>> 13,
            d = 0 | s[1],
            p = 8191 & d,
            m = d >>> 13,
            v = 0 | s[2],
            g = 8191 & v,
            y = v >>> 13,
            w = 0 | s[3],
            b = 8191 & w,
            M = w >>> 13,
            _ = 0 | s[4],
            x = 8191 & _,
            S = _ >>> 13,
            E = 0 | s[5],
            A = 8191 & E,
            k = E >>> 13,
            O = 0 | s[6],
            T = 8191 & O,
            R = O >>> 13,
            C = 0 | s[7],
            j = 8191 & C,
            N = C >>> 13,
            L = 0 | s[8],
            P = 8191 & L,
            I = L >>> 13,
            B = 0 | s[9],
            q = 8191 & B,
            U = B >>> 13,
            H = 0 | u[0],
            D = 8191 & H,
            F = H >>> 13,
            z = 0 | u[1],
            Z = 8191 & z,
            W = z >>> 13,
            G = 0 | u[2],
            Y = 8191 & G,
            $ = G >>> 13,
            X = 0 | u[3],
            V = 8191 & X,
            J = X >>> 13,
            K = 0 | u[4],
            Q = 8191 & K,
            tt = K >>> 13,
            et = 0 | u[5],
            rt = 8191 & et,
            nt = et >>> 13,
            it = 0 | u[6],
            ot = 8191 & it,
            st = it >>> 13,
            ut = 0 | u[7],
            at = 8191 & ut,
            ht = ut >>> 13,
            lt = 0 | u[8],
            ft = 8191 & lt,
            ct = lt >>> 13,
            dt = 0 | u[9],
            pt = 8191 & dt,
            mt = dt >>> 13;
          (r.negative = t.negative ^ e.negative),
            (r.length = 19),
            (n = Math.imul(f, D)),
            (i = Math.imul(f, F)),
            (i = (i + Math.imul(c, D)) | 0),
            (o = Math.imul(c, F));
          var vt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (vt >>> 26)) | 0),
            (vt &= 67108863),
            (n = Math.imul(p, D)),
            (i = Math.imul(p, F)),
            (i = (i + Math.imul(m, D)) | 0),
            (o = Math.imul(m, F)),
            (n = (n + Math.imul(f, Z)) | 0),
            (i = (i + Math.imul(f, W)) | 0),
            (i = (i + Math.imul(c, Z)) | 0),
            (o = (o + Math.imul(c, W)) | 0);
          var gt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (gt >>> 26)) | 0),
            (gt &= 67108863),
            (n = Math.imul(g, D)),
            (i = Math.imul(g, F)),
            (i = (i + Math.imul(y, D)) | 0),
            (o = Math.imul(y, F)),
            (n = (n + Math.imul(p, Z)) | 0),
            (i = (i + Math.imul(p, W)) | 0),
            (i = (i + Math.imul(m, Z)) | 0),
            (o = (o + Math.imul(m, W)) | 0),
            (n = (n + Math.imul(f, Y)) | 0),
            (i = (i + Math.imul(f, $)) | 0),
            (i = (i + Math.imul(c, Y)) | 0),
            (o = (o + Math.imul(c, $)) | 0);
          var yt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (yt >>> 26)) | 0),
            (yt &= 67108863),
            (n = Math.imul(b, D)),
            (i = Math.imul(b, F)),
            (i = (i + Math.imul(M, D)) | 0),
            (o = Math.imul(M, F)),
            (n = (n + Math.imul(g, Z)) | 0),
            (i = (i + Math.imul(g, W)) | 0),
            (i = (i + Math.imul(y, Z)) | 0),
            (o = (o + Math.imul(y, W)) | 0),
            (n = (n + Math.imul(p, Y)) | 0),
            (i = (i + Math.imul(p, $)) | 0),
            (i = (i + Math.imul(m, Y)) | 0),
            (o = (o + Math.imul(m, $)) | 0),
            (n = (n + Math.imul(f, V)) | 0),
            (i = (i + Math.imul(f, J)) | 0),
            (i = (i + Math.imul(c, V)) | 0),
            (o = (o + Math.imul(c, J)) | 0);
          var wt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (wt >>> 26)) | 0),
            (wt &= 67108863),
            (n = Math.imul(x, D)),
            (i = Math.imul(x, F)),
            (i = (i + Math.imul(S, D)) | 0),
            (o = Math.imul(S, F)),
            (n = (n + Math.imul(b, Z)) | 0),
            (i = (i + Math.imul(b, W)) | 0),
            (i = (i + Math.imul(M, Z)) | 0),
            (o = (o + Math.imul(M, W)) | 0),
            (n = (n + Math.imul(g, Y)) | 0),
            (i = (i + Math.imul(g, $)) | 0),
            (i = (i + Math.imul(y, Y)) | 0),
            (o = (o + Math.imul(y, $)) | 0),
            (n = (n + Math.imul(p, V)) | 0),
            (i = (i + Math.imul(p, J)) | 0),
            (i = (i + Math.imul(m, V)) | 0),
            (o = (o + Math.imul(m, J)) | 0),
            (n = (n + Math.imul(f, Q)) | 0),
            (i = (i + Math.imul(f, tt)) | 0),
            (i = (i + Math.imul(c, Q)) | 0),
            (o = (o + Math.imul(c, tt)) | 0);
          var bt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (bt >>> 26)) | 0),
            (bt &= 67108863),
            (n = Math.imul(A, D)),
            (i = Math.imul(A, F)),
            (i = (i + Math.imul(k, D)) | 0),
            (o = Math.imul(k, F)),
            (n = (n + Math.imul(x, Z)) | 0),
            (i = (i + Math.imul(x, W)) | 0),
            (i = (i + Math.imul(S, Z)) | 0),
            (o = (o + Math.imul(S, W)) | 0),
            (n = (n + Math.imul(b, Y)) | 0),
            (i = (i + Math.imul(b, $)) | 0),
            (i = (i + Math.imul(M, Y)) | 0),
            (o = (o + Math.imul(M, $)) | 0),
            (n = (n + Math.imul(g, V)) | 0),
            (i = (i + Math.imul(g, J)) | 0),
            (i = (i + Math.imul(y, V)) | 0),
            (o = (o + Math.imul(y, J)) | 0),
            (n = (n + Math.imul(p, Q)) | 0),
            (i = (i + Math.imul(p, tt)) | 0),
            (i = (i + Math.imul(m, Q)) | 0),
            (o = (o + Math.imul(m, tt)) | 0),
            (n = (n + Math.imul(f, rt)) | 0),
            (i = (i + Math.imul(f, nt)) | 0),
            (i = (i + Math.imul(c, rt)) | 0),
            (o = (o + Math.imul(c, nt)) | 0);
          var Mt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Mt >>> 26)) | 0),
            (Mt &= 67108863),
            (n = Math.imul(T, D)),
            (i = Math.imul(T, F)),
            (i = (i + Math.imul(R, D)) | 0),
            (o = Math.imul(R, F)),
            (n = (n + Math.imul(A, Z)) | 0),
            (i = (i + Math.imul(A, W)) | 0),
            (i = (i + Math.imul(k, Z)) | 0),
            (o = (o + Math.imul(k, W)) | 0),
            (n = (n + Math.imul(x, Y)) | 0),
            (i = (i + Math.imul(x, $)) | 0),
            (i = (i + Math.imul(S, Y)) | 0),
            (o = (o + Math.imul(S, $)) | 0),
            (n = (n + Math.imul(b, V)) | 0),
            (i = (i + Math.imul(b, J)) | 0),
            (i = (i + Math.imul(M, V)) | 0),
            (o = (o + Math.imul(M, J)) | 0),
            (n = (n + Math.imul(g, Q)) | 0),
            (i = (i + Math.imul(g, tt)) | 0),
            (i = (i + Math.imul(y, Q)) | 0),
            (o = (o + Math.imul(y, tt)) | 0),
            (n = (n + Math.imul(p, rt)) | 0),
            (i = (i + Math.imul(p, nt)) | 0),
            (i = (i + Math.imul(m, rt)) | 0),
            (o = (o + Math.imul(m, nt)) | 0),
            (n = (n + Math.imul(f, ot)) | 0),
            (i = (i + Math.imul(f, st)) | 0),
            (i = (i + Math.imul(c, ot)) | 0),
            (o = (o + Math.imul(c, st)) | 0);
          var _t = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (_t >>> 26)) | 0),
            (_t &= 67108863),
            (n = Math.imul(j, D)),
            (i = Math.imul(j, F)),
            (i = (i + Math.imul(N, D)) | 0),
            (o = Math.imul(N, F)),
            (n = (n + Math.imul(T, Z)) | 0),
            (i = (i + Math.imul(T, W)) | 0),
            (i = (i + Math.imul(R, Z)) | 0),
            (o = (o + Math.imul(R, W)) | 0),
            (n = (n + Math.imul(A, Y)) | 0),
            (i = (i + Math.imul(A, $)) | 0),
            (i = (i + Math.imul(k, Y)) | 0),
            (o = (o + Math.imul(k, $)) | 0),
            (n = (n + Math.imul(x, V)) | 0),
            (i = (i + Math.imul(x, J)) | 0),
            (i = (i + Math.imul(S, V)) | 0),
            (o = (o + Math.imul(S, J)) | 0),
            (n = (n + Math.imul(b, Q)) | 0),
            (i = (i + Math.imul(b, tt)) | 0),
            (i = (i + Math.imul(M, Q)) | 0),
            (o = (o + Math.imul(M, tt)) | 0),
            (n = (n + Math.imul(g, rt)) | 0),
            (i = (i + Math.imul(g, nt)) | 0),
            (i = (i + Math.imul(y, rt)) | 0),
            (o = (o + Math.imul(y, nt)) | 0),
            (n = (n + Math.imul(p, ot)) | 0),
            (i = (i + Math.imul(p, st)) | 0),
            (i = (i + Math.imul(m, ot)) | 0),
            (o = (o + Math.imul(m, st)) | 0),
            (n = (n + Math.imul(f, at)) | 0),
            (i = (i + Math.imul(f, ht)) | 0),
            (i = (i + Math.imul(c, at)) | 0),
            (o = (o + Math.imul(c, ht)) | 0);
          var xt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (xt >>> 26)) | 0),
            (xt &= 67108863),
            (n = Math.imul(P, D)),
            (i = Math.imul(P, F)),
            (i = (i + Math.imul(I, D)) | 0),
            (o = Math.imul(I, F)),
            (n = (n + Math.imul(j, Z)) | 0),
            (i = (i + Math.imul(j, W)) | 0),
            (i = (i + Math.imul(N, Z)) | 0),
            (o = (o + Math.imul(N, W)) | 0),
            (n = (n + Math.imul(T, Y)) | 0),
            (i = (i + Math.imul(T, $)) | 0),
            (i = (i + Math.imul(R, Y)) | 0),
            (o = (o + Math.imul(R, $)) | 0),
            (n = (n + Math.imul(A, V)) | 0),
            (i = (i + Math.imul(A, J)) | 0),
            (i = (i + Math.imul(k, V)) | 0),
            (o = (o + Math.imul(k, J)) | 0),
            (n = (n + Math.imul(x, Q)) | 0),
            (i = (i + Math.imul(x, tt)) | 0),
            (i = (i + Math.imul(S, Q)) | 0),
            (o = (o + Math.imul(S, tt)) | 0),
            (n = (n + Math.imul(b, rt)) | 0),
            (i = (i + Math.imul(b, nt)) | 0),
            (i = (i + Math.imul(M, rt)) | 0),
            (o = (o + Math.imul(M, nt)) | 0),
            (n = (n + Math.imul(g, ot)) | 0),
            (i = (i + Math.imul(g, st)) | 0),
            (i = (i + Math.imul(y, ot)) | 0),
            (o = (o + Math.imul(y, st)) | 0),
            (n = (n + Math.imul(p, at)) | 0),
            (i = (i + Math.imul(p, ht)) | 0),
            (i = (i + Math.imul(m, at)) | 0),
            (o = (o + Math.imul(m, ht)) | 0),
            (n = (n + Math.imul(f, ft)) | 0),
            (i = (i + Math.imul(f, ct)) | 0),
            (i = (i + Math.imul(c, ft)) | 0),
            (o = (o + Math.imul(c, ct)) | 0);
          var St = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (St >>> 26)) | 0),
            (St &= 67108863),
            (n = Math.imul(q, D)),
            (i = Math.imul(q, F)),
            (i = (i + Math.imul(U, D)) | 0),
            (o = Math.imul(U, F)),
            (n = (n + Math.imul(P, Z)) | 0),
            (i = (i + Math.imul(P, W)) | 0),
            (i = (i + Math.imul(I, Z)) | 0),
            (o = (o + Math.imul(I, W)) | 0),
            (n = (n + Math.imul(j, Y)) | 0),
            (i = (i + Math.imul(j, $)) | 0),
            (i = (i + Math.imul(N, Y)) | 0),
            (o = (o + Math.imul(N, $)) | 0),
            (n = (n + Math.imul(T, V)) | 0),
            (i = (i + Math.imul(T, J)) | 0),
            (i = (i + Math.imul(R, V)) | 0),
            (o = (o + Math.imul(R, J)) | 0),
            (n = (n + Math.imul(A, Q)) | 0),
            (i = (i + Math.imul(A, tt)) | 0),
            (i = (i + Math.imul(k, Q)) | 0),
            (o = (o + Math.imul(k, tt)) | 0),
            (n = (n + Math.imul(x, rt)) | 0),
            (i = (i + Math.imul(x, nt)) | 0),
            (i = (i + Math.imul(S, rt)) | 0),
            (o = (o + Math.imul(S, nt)) | 0),
            (n = (n + Math.imul(b, ot)) | 0),
            (i = (i + Math.imul(b, st)) | 0),
            (i = (i + Math.imul(M, ot)) | 0),
            (o = (o + Math.imul(M, st)) | 0),
            (n = (n + Math.imul(g, at)) | 0),
            (i = (i + Math.imul(g, ht)) | 0),
            (i = (i + Math.imul(y, at)) | 0),
            (o = (o + Math.imul(y, ht)) | 0),
            (n = (n + Math.imul(p, ft)) | 0),
            (i = (i + Math.imul(p, ct)) | 0),
            (i = (i + Math.imul(m, ft)) | 0),
            (o = (o + Math.imul(m, ct)) | 0),
            (n = (n + Math.imul(f, pt)) | 0),
            (i = (i + Math.imul(f, mt)) | 0),
            (i = (i + Math.imul(c, pt)) | 0),
            (o = (o + Math.imul(c, mt)) | 0);
          var Et = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Et >>> 26)) | 0),
            (Et &= 67108863),
            (n = Math.imul(q, Z)),
            (i = Math.imul(q, W)),
            (i = (i + Math.imul(U, Z)) | 0),
            (o = Math.imul(U, W)),
            (n = (n + Math.imul(P, Y)) | 0),
            (i = (i + Math.imul(P, $)) | 0),
            (i = (i + Math.imul(I, Y)) | 0),
            (o = (o + Math.imul(I, $)) | 0),
            (n = (n + Math.imul(j, V)) | 0),
            (i = (i + Math.imul(j, J)) | 0),
            (i = (i + Math.imul(N, V)) | 0),
            (o = (o + Math.imul(N, J)) | 0),
            (n = (n + Math.imul(T, Q)) | 0),
            (i = (i + Math.imul(T, tt)) | 0),
            (i = (i + Math.imul(R, Q)) | 0),
            (o = (o + Math.imul(R, tt)) | 0),
            (n = (n + Math.imul(A, rt)) | 0),
            (i = (i + Math.imul(A, nt)) | 0),
            (i = (i + Math.imul(k, rt)) | 0),
            (o = (o + Math.imul(k, nt)) | 0),
            (n = (n + Math.imul(x, ot)) | 0),
            (i = (i + Math.imul(x, st)) | 0),
            (i = (i + Math.imul(S, ot)) | 0),
            (o = (o + Math.imul(S, st)) | 0),
            (n = (n + Math.imul(b, at)) | 0),
            (i = (i + Math.imul(b, ht)) | 0),
            (i = (i + Math.imul(M, at)) | 0),
            (o = (o + Math.imul(M, ht)) | 0),
            (n = (n + Math.imul(g, ft)) | 0),
            (i = (i + Math.imul(g, ct)) | 0),
            (i = (i + Math.imul(y, ft)) | 0),
            (o = (o + Math.imul(y, ct)) | 0),
            (n = (n + Math.imul(p, pt)) | 0),
            (i = (i + Math.imul(p, mt)) | 0),
            (i = (i + Math.imul(m, pt)) | 0),
            (o = (o + Math.imul(m, mt)) | 0);
          var At = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (At >>> 26)) | 0),
            (At &= 67108863),
            (n = Math.imul(q, Y)),
            (i = Math.imul(q, $)),
            (i = (i + Math.imul(U, Y)) | 0),
            (o = Math.imul(U, $)),
            (n = (n + Math.imul(P, V)) | 0),
            (i = (i + Math.imul(P, J)) | 0),
            (i = (i + Math.imul(I, V)) | 0),
            (o = (o + Math.imul(I, J)) | 0),
            (n = (n + Math.imul(j, Q)) | 0),
            (i = (i + Math.imul(j, tt)) | 0),
            (i = (i + Math.imul(N, Q)) | 0),
            (o = (o + Math.imul(N, tt)) | 0),
            (n = (n + Math.imul(T, rt)) | 0),
            (i = (i + Math.imul(T, nt)) | 0),
            (i = (i + Math.imul(R, rt)) | 0),
            (o = (o + Math.imul(R, nt)) | 0),
            (n = (n + Math.imul(A, ot)) | 0),
            (i = (i + Math.imul(A, st)) | 0),
            (i = (i + Math.imul(k, ot)) | 0),
            (o = (o + Math.imul(k, st)) | 0),
            (n = (n + Math.imul(x, at)) | 0),
            (i = (i + Math.imul(x, ht)) | 0),
            (i = (i + Math.imul(S, at)) | 0),
            (o = (o + Math.imul(S, ht)) | 0),
            (n = (n + Math.imul(b, ft)) | 0),
            (i = (i + Math.imul(b, ct)) | 0),
            (i = (i + Math.imul(M, ft)) | 0),
            (o = (o + Math.imul(M, ct)) | 0),
            (n = (n + Math.imul(g, pt)) | 0),
            (i = (i + Math.imul(g, mt)) | 0),
            (i = (i + Math.imul(y, pt)) | 0),
            (o = (o + Math.imul(y, mt)) | 0);
          var kt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (kt >>> 26)) | 0),
            (kt &= 67108863),
            (n = Math.imul(q, V)),
            (i = Math.imul(q, J)),
            (i = (i + Math.imul(U, V)) | 0),
            (o = Math.imul(U, J)),
            (n = (n + Math.imul(P, Q)) | 0),
            (i = (i + Math.imul(P, tt)) | 0),
            (i = (i + Math.imul(I, Q)) | 0),
            (o = (o + Math.imul(I, tt)) | 0),
            (n = (n + Math.imul(j, rt)) | 0),
            (i = (i + Math.imul(j, nt)) | 0),
            (i = (i + Math.imul(N, rt)) | 0),
            (o = (o + Math.imul(N, nt)) | 0),
            (n = (n + Math.imul(T, ot)) | 0),
            (i = (i + Math.imul(T, st)) | 0),
            (i = (i + Math.imul(R, ot)) | 0),
            (o = (o + Math.imul(R, st)) | 0),
            (n = (n + Math.imul(A, at)) | 0),
            (i = (i + Math.imul(A, ht)) | 0),
            (i = (i + Math.imul(k, at)) | 0),
            (o = (o + Math.imul(k, ht)) | 0),
            (n = (n + Math.imul(x, ft)) | 0),
            (i = (i + Math.imul(x, ct)) | 0),
            (i = (i + Math.imul(S, ft)) | 0),
            (o = (o + Math.imul(S, ct)) | 0),
            (n = (n + Math.imul(b, pt)) | 0),
            (i = (i + Math.imul(b, mt)) | 0),
            (i = (i + Math.imul(M, pt)) | 0),
            (o = (o + Math.imul(M, mt)) | 0);
          var Ot = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Ot >>> 26)) | 0),
            (Ot &= 67108863),
            (n = Math.imul(q, Q)),
            (i = Math.imul(q, tt)),
            (i = (i + Math.imul(U, Q)) | 0),
            (o = Math.imul(U, tt)),
            (n = (n + Math.imul(P, rt)) | 0),
            (i = (i + Math.imul(P, nt)) | 0),
            (i = (i + Math.imul(I, rt)) | 0),
            (o = (o + Math.imul(I, nt)) | 0),
            (n = (n + Math.imul(j, ot)) | 0),
            (i = (i + Math.imul(j, st)) | 0),
            (i = (i + Math.imul(N, ot)) | 0),
            (o = (o + Math.imul(N, st)) | 0),
            (n = (n + Math.imul(T, at)) | 0),
            (i = (i + Math.imul(T, ht)) | 0),
            (i = (i + Math.imul(R, at)) | 0),
            (o = (o + Math.imul(R, ht)) | 0),
            (n = (n + Math.imul(A, ft)) | 0),
            (i = (i + Math.imul(A, ct)) | 0),
            (i = (i + Math.imul(k, ft)) | 0),
            (o = (o + Math.imul(k, ct)) | 0),
            (n = (n + Math.imul(x, pt)) | 0),
            (i = (i + Math.imul(x, mt)) | 0),
            (i = (i + Math.imul(S, pt)) | 0),
            (o = (o + Math.imul(S, mt)) | 0);
          var Tt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Tt >>> 26)) | 0),
            (Tt &= 67108863),
            (n = Math.imul(q, rt)),
            (i = Math.imul(q, nt)),
            (i = (i + Math.imul(U, rt)) | 0),
            (o = Math.imul(U, nt)),
            (n = (n + Math.imul(P, ot)) | 0),
            (i = (i + Math.imul(P, st)) | 0),
            (i = (i + Math.imul(I, ot)) | 0),
            (o = (o + Math.imul(I, st)) | 0),
            (n = (n + Math.imul(j, at)) | 0),
            (i = (i + Math.imul(j, ht)) | 0),
            (i = (i + Math.imul(N, at)) | 0),
            (o = (o + Math.imul(N, ht)) | 0),
            (n = (n + Math.imul(T, ft)) | 0),
            (i = (i + Math.imul(T, ct)) | 0),
            (i = (i + Math.imul(R, ft)) | 0),
            (o = (o + Math.imul(R, ct)) | 0),
            (n = (n + Math.imul(A, pt)) | 0),
            (i = (i + Math.imul(A, mt)) | 0),
            (i = (i + Math.imul(k, pt)) | 0),
            (o = (o + Math.imul(k, mt)) | 0);
          var Rt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Rt >>> 26)) | 0),
            (Rt &= 67108863),
            (n = Math.imul(q, ot)),
            (i = Math.imul(q, st)),
            (i = (i + Math.imul(U, ot)) | 0),
            (o = Math.imul(U, st)),
            (n = (n + Math.imul(P, at)) | 0),
            (i = (i + Math.imul(P, ht)) | 0),
            (i = (i + Math.imul(I, at)) | 0),
            (o = (o + Math.imul(I, ht)) | 0),
            (n = (n + Math.imul(j, ft)) | 0),
            (i = (i + Math.imul(j, ct)) | 0),
            (i = (i + Math.imul(N, ft)) | 0),
            (o = (o + Math.imul(N, ct)) | 0),
            (n = (n + Math.imul(T, pt)) | 0),
            (i = (i + Math.imul(T, mt)) | 0),
            (i = (i + Math.imul(R, pt)) | 0),
            (o = (o + Math.imul(R, mt)) | 0);
          var Ct = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Ct >>> 26)) | 0),
            (Ct &= 67108863),
            (n = Math.imul(q, at)),
            (i = Math.imul(q, ht)),
            (i = (i + Math.imul(U, at)) | 0),
            (o = Math.imul(U, ht)),
            (n = (n + Math.imul(P, ft)) | 0),
            (i = (i + Math.imul(P, ct)) | 0),
            (i = (i + Math.imul(I, ft)) | 0),
            (o = (o + Math.imul(I, ct)) | 0),
            (n = (n + Math.imul(j, pt)) | 0),
            (i = (i + Math.imul(j, mt)) | 0),
            (i = (i + Math.imul(N, pt)) | 0),
            (o = (o + Math.imul(N, mt)) | 0);
          var jt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (jt >>> 26)) | 0),
            (jt &= 67108863),
            (n = Math.imul(q, ft)),
            (i = Math.imul(q, ct)),
            (i = (i + Math.imul(U, ft)) | 0),
            (o = Math.imul(U, ct)),
            (n = (n + Math.imul(P, pt)) | 0),
            (i = (i + Math.imul(P, mt)) | 0),
            (i = (i + Math.imul(I, pt)) | 0),
            (o = (o + Math.imul(I, mt)) | 0);
          var Nt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          (h = (((o + (i >>> 13)) | 0) + (Nt >>> 26)) | 0),
            (Nt &= 67108863),
            (n = Math.imul(q, pt)),
            (i = Math.imul(q, mt)),
            (i = (i + Math.imul(U, pt)) | 0),
            (o = Math.imul(U, mt));
          var Lt = (((h + n) | 0) + ((8191 & i) << 13)) | 0;
          return (
            (h = (((o + (i >>> 13)) | 0) + (Lt >>> 26)) | 0),
            (Lt &= 67108863),
            (a[0] = vt),
            (a[1] = gt),
            (a[2] = yt),
            (a[3] = wt),
            (a[4] = bt),
            (a[5] = Mt),
            (a[6] = _t),
            (a[7] = xt),
            (a[8] = St),
            (a[9] = Et),
            (a[10] = At),
            (a[11] = kt),
            (a[12] = Ot),
            (a[13] = Tt),
            (a[14] = Rt),
            (a[15] = Ct),
            (a[16] = jt),
            (a[17] = Nt),
            (a[18] = Lt),
            0 !== h && ((a[19] = h), r.length++),
            r
          );
        };
        function m(t, e, r) {
          (r.negative = e.negative ^ t.negative),
            (r.length = t.length + e.length);
          for (var n = 0, i = 0, o = 0; o < r.length - 1; o++) {
            var s = i;
            i = 0;
            for (
              var u = 67108863 & n,
                a = Math.min(o, e.length - 1),
                h = Math.max(0, o - t.length + 1);
              h <= a;
              h++
            ) {
              var l = o - h,
                f = 0 | t.words[l],
                c = 0 | e.words[h],
                d = f * c,
                p = 67108863 & d;
              (s = (s + ((d / 67108864) | 0)) | 0),
                (p = (p + u) | 0),
                (u = 67108863 & p),
                (s = (s + (p >>> 26)) | 0),
                (i += s >>> 26),
                (s &= 67108863);
            }
            (r.words[o] = u), (n = s), (s = i);
          }
          return 0 !== n ? (r.words[o] = n) : r.length--, r.strip();
        }
        function v(t, e, r) {
          var n = new g();
          return n.mulp(t, e, r);
        }
        function g(t, e) {
          (this.x = t), (this.y = e);
        }
        Math.imul || (p = d),
          (o.prototype.mulTo = function (t, e) {
            var r,
              n = this.length + t.length;
            return (
              (r =
                10 === this.length && 10 === t.length
                  ? p(this, t, e)
                  : n < 63
                  ? d(this, t, e)
                  : n < 1024
                  ? m(this, t, e)
                  : v(this, t, e)),
              r
            );
          }),
          (g.prototype.makeRBT = function (t) {
            for (
              var e = new Array(t), r = o.prototype._countBits(t) - 1, n = 0;
              n < t;
              n++
            )
              e[n] = this.revBin(n, r, t);
            return e;
          }),
          (g.prototype.revBin = function (t, e, r) {
            if (0 === t || t === r - 1) return t;
            for (var n = 0, i = 0; i < e; i++)
              (n |= (1 & t) << (e - i - 1)), (t >>= 1);
            return n;
          }),
          (g.prototype.permute = function (t, e, r, n, i, o) {
            for (var s = 0; s < o; s++) (n[s] = e[t[s]]), (i[s] = r[t[s]]);
          }),
          (g.prototype.transform = function (t, e, r, n, i, o) {
            this.permute(o, t, e, r, n, i);
            for (var s = 1; s < i; s <<= 1)
              for (
                var u = s << 1,
                  a = Math.cos((2 * Math.PI) / u),
                  h = Math.sin((2 * Math.PI) / u),
                  l = 0;
                l < i;
                l += u
              )
                for (var f = a, c = h, d = 0; d < s; d++) {
                  var p = r[l + d],
                    m = n[l + d],
                    v = r[l + d + s],
                    g = n[l + d + s],
                    y = f * v - c * g;
                  (g = f * g + c * v),
                    (v = y),
                    (r[l + d] = p + v),
                    (n[l + d] = m + g),
                    (r[l + d + s] = p - v),
                    (n[l + d + s] = m - g),
                    d !== u &&
                      ((y = a * f - h * c), (c = a * c + h * f), (f = y));
                }
          }),
          (g.prototype.guessLen13b = function (t, e) {
            var r = 1 | Math.max(e, t),
              n = 1 & r,
              i = 0;
            for (r = (r / 2) | 0; r; r >>>= 1) i++;
            return 1 << (i + 1 + n);
          }),
          (g.prototype.conjugate = function (t, e, r) {
            if (!(r <= 1))
              for (var n = 0; n < r / 2; n++) {
                var i = t[n];
                (t[n] = t[r - n - 1]),
                  (t[r - n - 1] = i),
                  (i = e[n]),
                  (e[n] = -e[r - n - 1]),
                  (e[r - n - 1] = -i);
              }
          }),
          (g.prototype.normalize13b = function (t, e) {
            for (var r = 0, n = 0; n < e / 2; n++) {
              var i =
                8192 * Math.round(t[2 * n + 1] / e) +
                Math.round(t[2 * n] / e) +
                r;
              (t[n] = 67108863 & i),
                (r = i < 67108864 ? 0 : (i / 67108864) | 0);
            }
            return t;
          }),
          (g.prototype.convert13b = function (t, e, r, i) {
            for (var o = 0, s = 0; s < e; s++)
              (o += 0 | t[s]),
                (r[2 * s] = 8191 & o),
                (o >>>= 13),
                (r[2 * s + 1] = 8191 & o),
                (o >>>= 13);
            for (s = 2 * e; s < i; ++s) r[s] = 0;
            n(0 === o), n(0 === (-8192 & o));
          }),
          (g.prototype.stub = function (t) {
            for (var e = new Array(t), r = 0; r < t; r++) e[r] = 0;
            return e;
          }),
          (g.prototype.mulp = function (t, e, r) {
            var n = 2 * this.guessLen13b(t.length, e.length),
              i = this.makeRBT(n),
              o = this.stub(n),
              s = new Array(n),
              u = new Array(n),
              a = new Array(n),
              h = new Array(n),
              l = new Array(n),
              f = new Array(n),
              c = r.words;
            (c.length = n),
              this.convert13b(t.words, t.length, s, n),
              this.convert13b(e.words, e.length, h, n),
              this.transform(s, o, u, a, n, i),
              this.transform(h, o, l, f, n, i);
            for (var d = 0; d < n; d++) {
              var p = u[d] * l[d] - a[d] * f[d];
              (a[d] = u[d] * f[d] + a[d] * l[d]), (u[d] = p);
            }
            return (
              this.conjugate(u, a, n),
              this.transform(u, a, c, o, n, i),
              this.conjugate(c, o, n),
              this.normalize13b(c, n),
              (r.negative = t.negative ^ e.negative),
              (r.length = t.length + e.length),
              r.strip()
            );
          }),
          (o.prototype.mul = function (t) {
            var e = new o(null);
            return (
              (e.words = new Array(this.length + t.length)), this.mulTo(t, e)
            );
          }),
          (o.prototype.mulf = function (t) {
            var e = new o(null);
            return (e.words = new Array(this.length + t.length)), v(this, t, e);
          }),
          (o.prototype.imul = function (t) {
            return this.clone().mulTo(t, this);
          }),
          (o.prototype.imuln = function (t) {
            n("number" === typeof t), n(t < 67108864);
            for (var e = 0, r = 0; r < this.length; r++) {
              var i = (0 | this.words[r]) * t,
                o = (67108863 & i) + (67108863 & e);
              (e >>= 26),
                (e += (i / 67108864) | 0),
                (e += o >>> 26),
                (this.words[r] = 67108863 & o);
            }
            return 0 !== e && ((this.words[r] = e), this.length++), this;
          }),
          (o.prototype.muln = function (t) {
            return this.clone().imuln(t);
          }),
          (o.prototype.sqr = function () {
            return this.mul(this);
          }),
          (o.prototype.isqr = function () {
            return this.imul(this.clone());
          }),
          (o.prototype.pow = function (t) {
            var e = c(t);
            if (0 === e.length) return new o(1);
            for (var r = this, n = 0; n < e.length; n++, r = r.sqr())
              if (0 !== e[n]) break;
            if (++n < e.length)
              for (var i = r.sqr(); n < e.length; n++, i = i.sqr())
                0 !== e[n] && (r = r.mul(i));
            return r;
          }),
          (o.prototype.iushln = function (t) {
            n("number" === typeof t && t >= 0);
            var e,
              r = t % 26,
              i = (t - r) / 26,
              o = (67108863 >>> (26 - r)) << (26 - r);
            if (0 !== r) {
              var s = 0;
              for (e = 0; e < this.length; e++) {
                var u = this.words[e] & o,
                  a = ((0 | this.words[e]) - u) << r;
                (this.words[e] = a | s), (s = u >>> (26 - r));
              }
              s && ((this.words[e] = s), this.length++);
            }
            if (0 !== i) {
              for (e = this.length - 1; e >= 0; e--)
                this.words[e + i] = this.words[e];
              for (e = 0; e < i; e++) this.words[e] = 0;
              this.length += i;
            }
            return this.strip();
          }),
          (o.prototype.ishln = function (t) {
            return n(0 === this.negative), this.iushln(t);
          }),
          (o.prototype.iushrn = function (t, e, r) {
            var i;
            n("number" === typeof t && t >= 0),
              (i = e ? (e - (e % 26)) / 26 : 0);
            var o = t % 26,
              s = Math.min((t - o) / 26, this.length),
              u = 67108863 ^ ((67108863 >>> o) << o),
              a = r;
            if (((i -= s), (i = Math.max(0, i)), a)) {
              for (var h = 0; h < s; h++) a.words[h] = this.words[h];
              a.length = s;
            }
            if (0 === s);
            else if (this.length > s)
              for (this.length -= s, h = 0; h < this.length; h++)
                this.words[h] = this.words[h + s];
            else (this.words[0] = 0), (this.length = 1);
            var l = 0;
            for (h = this.length - 1; h >= 0 && (0 !== l || h >= i); h--) {
              var f = 0 | this.words[h];
              (this.words[h] = (l << (26 - o)) | (f >>> o)), (l = f & u);
            }
            return (
              a && 0 !== l && (a.words[a.length++] = l),
              0 === this.length && ((this.words[0] = 0), (this.length = 1)),
              this.strip()
            );
          }),
          (o.prototype.ishrn = function (t, e, r) {
            return n(0 === this.negative), this.iushrn(t, e, r);
          }),
          (o.prototype.shln = function (t) {
            return this.clone().ishln(t);
          }),
          (o.prototype.ushln = function (t) {
            return this.clone().iushln(t);
          }),
          (o.prototype.shrn = function (t) {
            return this.clone().ishrn(t);
          }),
          (o.prototype.ushrn = function (t) {
            return this.clone().iushrn(t);
          }),
          (o.prototype.testn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = t % 26,
              r = (t - e) / 26,
              i = 1 << e;
            if (this.length <= r) return !1;
            var o = this.words[r];
            return !!(o & i);
          }),
          (o.prototype.imaskn = function (t) {
            n("number" === typeof t && t >= 0);
            var e = t % 26,
              r = (t - e) / 26;
            if (
              (n(
                0 === this.negative,
                "imaskn works only with positive numbers"
              ),
              this.length <= r)
            )
              return this;
            if (
              (0 !== e && r++,
              (this.length = Math.min(r, this.length)),
              0 !== e)
            ) {
              var i = 67108863 ^ ((67108863 >>> e) << e);
              this.words[this.length - 1] &= i;
            }
            return this.strip();
          }),
          (o.prototype.maskn = function (t) {
            return this.clone().imaskn(t);
          }),
          (o.prototype.iaddn = function (t) {
            return (
              n("number" === typeof t),
              n(t < 67108864),
              t < 0
                ? this.isubn(-t)
                : 0 !== this.negative
                ? 1 === this.length && (0 | this.words[0]) < t
                  ? ((this.words[0] = t - (0 | this.words[0])),
                    (this.negative = 0),
                    this)
                  : ((this.negative = 0),
                    this.isubn(t),
                    (this.negative = 1),
                    this)
                : this._iaddn(t)
            );
          }),
          (o.prototype._iaddn = function (t) {
            this.words[0] += t;
            for (var e = 0; e < this.length && this.words[e] >= 67108864; e++)
              (this.words[e] -= 67108864),
                e === this.length - 1
                  ? (this.words[e + 1] = 1)
                  : this.words[e + 1]++;
            return (this.length = Math.max(this.length, e + 1)), this;
          }),
          (o.prototype.isubn = function (t) {
            if ((n("number" === typeof t), n(t < 67108864), t < 0))
              return this.iaddn(-t);
            if (0 !== this.negative)
              return (
                (this.negative = 0), this.iaddn(t), (this.negative = 1), this
              );
            if (((this.words[0] -= t), 1 === this.length && this.words[0] < 0))
              (this.words[0] = -this.words[0]), (this.negative = 1);
            else
              for (var e = 0; e < this.length && this.words[e] < 0; e++)
                (this.words[e] += 67108864), (this.words[e + 1] -= 1);
            return this.strip();
          }),
          (o.prototype.addn = function (t) {
            return this.clone().iaddn(t);
          }),
          (o.prototype.subn = function (t) {
            return this.clone().isubn(t);
          }),
          (o.prototype.iabs = function () {
            return (this.negative = 0), this;
          }),
          (o.prototype.abs = function () {
            return this.clone().iabs();
          }),
          (o.prototype._ishlnsubmul = function (t, e, r) {
            var i,
              o,
              s = t.length + r;
            this._expand(s);
            var u = 0;
            for (i = 0; i < t.length; i++) {
              o = (0 | this.words[i + r]) + u;
              var a = (0 | t.words[i]) * e;
              (o -= 67108863 & a),
                (u = (o >> 26) - ((a / 67108864) | 0)),
                (this.words[i + r] = 67108863 & o);
            }
            for (; i < this.length - r; i++)
              (o = (0 | this.words[i + r]) + u),
                (u = o >> 26),
                (this.words[i + r] = 67108863 & o);
            if (0 === u) return this.strip();
            for (n(-1 === u), u = 0, i = 0; i < this.length; i++)
              (o = -(0 | this.words[i]) + u),
                (u = o >> 26),
                (this.words[i] = 67108863 & o);
            return (this.negative = 1), this.strip();
          }),
          (o.prototype._wordDiv = function (t, e) {
            var r = this.length - t.length,
              n = this.clone(),
              i = t,
              s = 0 | i.words[i.length - 1],
              u = this._countBits(s);
            (r = 26 - u),
              0 !== r &&
                ((i = i.ushln(r)),
                n.iushln(r),
                (s = 0 | i.words[i.length - 1]));
            var a,
              h = n.length - i.length;
            if ("mod" !== e) {
              (a = new o(null)),
                (a.length = h + 1),
                (a.words = new Array(a.length));
              for (var l = 0; l < a.length; l++) a.words[l] = 0;
            }
            var f = n.clone()._ishlnsubmul(i, 1, h);
            0 === f.negative && ((n = f), a && (a.words[h] = 1));
            for (var c = h - 1; c >= 0; c--) {
              var d =
                67108864 * (0 | n.words[i.length + c]) +
                (0 | n.words[i.length + c - 1]);
              (d = Math.min((d / s) | 0, 67108863)), n._ishlnsubmul(i, d, c);
              while (0 !== n.negative)
                d--,
                  (n.negative = 0),
                  n._ishlnsubmul(i, 1, c),
                  n.isZero() || (n.negative ^= 1);
              a && (a.words[c] = d);
            }
            return (
              a && a.strip(),
              n.strip(),
              "div" !== e && 0 !== r && n.iushrn(r),
              { div: a || null, mod: n }
            );
          }),
          (o.prototype.divmod = function (t, e, r) {
            return (
              n(!t.isZero()),
              this.isZero()
                ? { div: new o(0), mod: new o(0) }
                : 0 !== this.negative && 0 === t.negative
                ? ((u = this.neg().divmod(t, e)),
                  "mod" !== e && (i = u.div.neg()),
                  "div" !== e &&
                    ((s = u.mod.neg()), r && 0 !== s.negative && s.iadd(t)),
                  { div: i, mod: s })
                : 0 === this.negative && 0 !== t.negative
                ? ((u = this.divmod(t.neg(), e)),
                  "mod" !== e && (i = u.div.neg()),
                  { div: i, mod: u.mod })
                : 0 !== (this.negative & t.negative)
                ? ((u = this.neg().divmod(t.neg(), e)),
                  "div" !== e &&
                    ((s = u.mod.neg()), r && 0 !== s.negative && s.isub(t)),
                  { div: u.div, mod: s })
                : t.length > this.length || this.cmp(t) < 0
                ? { div: new o(0), mod: this }
                : 1 === t.length
                ? "div" === e
                  ? { div: this.divn(t.words[0]), mod: null }
                  : "mod" === e
                  ? { div: null, mod: new o(this.modn(t.words[0])) }
                  : {
                      div: this.divn(t.words[0]),
                      mod: new o(this.modn(t.words[0])),
                    }
                : this._wordDiv(t, e)
            );
            var i, s, u;
          }),
          (o.prototype.div = function (t) {
            return this.divmod(t, "div", !1).div;
          }),
          (o.prototype.mod = function (t) {
            return this.divmod(t, "mod", !1).mod;
          }),
          (o.prototype.umod = function (t) {
            return this.divmod(t, "mod", !0).mod;
          }),
          (o.prototype.divRound = function (t) {
            var e = this.divmod(t);
            if (e.mod.isZero()) return e.div;
            var r = 0 !== e.div.negative ? e.mod.isub(t) : e.mod,
              n = t.ushrn(1),
              i = t.andln(1),
              o = r.cmp(n);
            return o < 0 || (1 === i && 0 === o)
              ? e.div
              : 0 !== e.div.negative
              ? e.div.isubn(1)
              : e.div.iaddn(1);
          }),
          (o.prototype.modn = function (t) {
            n(t <= 67108863);
            for (var e = (1 << 26) % t, r = 0, i = this.length - 1; i >= 0; i--)
              r = (e * r + (0 | this.words[i])) % t;
            return r;
          }),
          (o.prototype.idivn = function (t) {
            n(t <= 67108863);
            for (var e = 0, r = this.length - 1; r >= 0; r--) {
              var i = (0 | this.words[r]) + 67108864 * e;
              (this.words[r] = (i / t) | 0), (e = i % t);
            }
            return this.strip();
          }),
          (o.prototype.divn = function (t) {
            return this.clone().idivn(t);
          }),
          (o.prototype.egcd = function (t) {
            n(0 === t.negative), n(!t.isZero());
            var e = this,
              r = t.clone();
            e = 0 !== e.negative ? e.umod(t) : e.clone();
            var i = new o(1),
              s = new o(0),
              u = new o(0),
              a = new o(1),
              h = 0;
            while (e.isEven() && r.isEven()) e.iushrn(1), r.iushrn(1), ++h;
            var l = r.clone(),
              f = e.clone();
            while (!e.isZero()) {
              for (
                var c = 0, d = 1;
                0 === (e.words[0] & d) && c < 26;
                ++c, d <<= 1
              );
              if (c > 0) {
                e.iushrn(c);
                while (c-- > 0)
                  (i.isOdd() || s.isOdd()) && (i.iadd(l), s.isub(f)),
                    i.iushrn(1),
                    s.iushrn(1);
              }
              for (
                var p = 0, m = 1;
                0 === (r.words[0] & m) && p < 26;
                ++p, m <<= 1
              );
              if (p > 0) {
                r.iushrn(p);
                while (p-- > 0)
                  (u.isOdd() || a.isOdd()) && (u.iadd(l), a.isub(f)),
                    u.iushrn(1),
                    a.iushrn(1);
              }
              e.cmp(r) >= 0
                ? (e.isub(r), i.isub(u), s.isub(a))
                : (r.isub(e), u.isub(i), a.isub(s));
            }
            return { a: u, b: a, gcd: r.iushln(h) };
          }),
          (o.prototype._invmp = function (t) {
            n(0 === t.negative), n(!t.isZero());
            var e = this,
              r = t.clone();
            e = 0 !== e.negative ? e.umod(t) : e.clone();
            var i,
              s = new o(1),
              u = new o(0),
              a = r.clone();
            while (e.cmpn(1) > 0 && r.cmpn(1) > 0) {
              for (
                var h = 0, l = 1;
                0 === (e.words[0] & l) && h < 26;
                ++h, l <<= 1
              );
              if (h > 0) {
                e.iushrn(h);
                while (h-- > 0) s.isOdd() && s.iadd(a), s.iushrn(1);
              }
              for (
                var f = 0, c = 1;
                0 === (r.words[0] & c) && f < 26;
                ++f, c <<= 1
              );
              if (f > 0) {
                r.iushrn(f);
                while (f-- > 0) u.isOdd() && u.iadd(a), u.iushrn(1);
              }
              e.cmp(r) >= 0 ? (e.isub(r), s.isub(u)) : (r.isub(e), u.isub(s));
            }
            return (i = 0 === e.cmpn(1) ? s : u), i.cmpn(0) < 0 && i.iadd(t), i;
          }),
          (o.prototype.gcd = function (t) {
            if (this.isZero()) return t.abs();
            if (t.isZero()) return this.abs();
            var e = this.clone(),
              r = t.clone();
            (e.negative = 0), (r.negative = 0);
            for (var n = 0; e.isEven() && r.isEven(); n++)
              e.iushrn(1), r.iushrn(1);
            do {
              while (e.isEven()) e.iushrn(1);
              while (r.isEven()) r.iushrn(1);
              var i = e.cmp(r);
              if (i < 0) {
                var o = e;
                (e = r), (r = o);
              } else if (0 === i || 0 === r.cmpn(1)) break;
              e.isub(r);
            } while (1);
            return r.iushln(n);
          }),
          (o.prototype.invm = function (t) {
            return this.egcd(t).a.umod(t);
          }),
          (o.prototype.isEven = function () {
            return 0 === (1 & this.words[0]);
          }),
          (o.prototype.isOdd = function () {
            return 1 === (1 & this.words[0]);
          }),
          (o.prototype.andln = function (t) {
            return this.words[0] & t;
          }),
          (o.prototype.bincn = function (t) {
            n("number" === typeof t);
            var e = t % 26,
              r = (t - e) / 26,
              i = 1 << e;
            if (this.length <= r)
              return this._expand(r + 1), (this.words[r] |= i), this;
            for (var o = i, s = r; 0 !== o && s < this.length; s++) {
              var u = 0 | this.words[s];
              (u += o), (o = u >>> 26), (u &= 67108863), (this.words[s] = u);
            }
            return 0 !== o && ((this.words[s] = o), this.length++), this;
          }),
          (o.prototype.isZero = function () {
            return 1 === this.length && 0 === this.words[0];
          }),
          (o.prototype.cmpn = function (t) {
            var e,
              r = t < 0;
            if (0 !== this.negative && !r) return -1;
            if (0 === this.negative && r) return 1;
            if ((this.strip(), this.length > 1)) e = 1;
            else {
              r && (t = -t), n(t <= 67108863, "Number is too big");
              var i = 0 | this.words[0];
              e = i === t ? 0 : i < t ? -1 : 1;
            }
            return 0 !== this.negative ? 0 | -e : e;
          }),
          (o.prototype.cmp = function (t) {
            if (0 !== this.negative && 0 === t.negative) return -1;
            if (0 === this.negative && 0 !== t.negative) return 1;
            var e = this.ucmp(t);
            return 0 !== this.negative ? 0 | -e : e;
          }),
          (o.prototype.ucmp = function (t) {
            if (this.length > t.length) return 1;
            if (this.length < t.length) return -1;
            for (var e = 0, r = this.length - 1; r >= 0; r--) {
              var n = 0 | this.words[r],
                i = 0 | t.words[r];
              if (n !== i) {
                n < i ? (e = -1) : n > i && (e = 1);
                break;
              }
            }
            return e;
          }),
          (o.prototype.gtn = function (t) {
            return 1 === this.cmpn(t);
          }),
          (o.prototype.gt = function (t) {
            return 1 === this.cmp(t);
          }),
          (o.prototype.gten = function (t) {
            return this.cmpn(t) >= 0;
          }),
          (o.prototype.gte = function (t) {
            return this.cmp(t) >= 0;
          }),
          (o.prototype.ltn = function (t) {
            return -1 === this.cmpn(t);
          }),
          (o.prototype.lt = function (t) {
            return -1 === this.cmp(t);
          }),
          (o.prototype.lten = function (t) {
            return this.cmpn(t) <= 0;
          }),
          (o.prototype.lte = function (t) {
            return this.cmp(t) <= 0;
          }),
          (o.prototype.eqn = function (t) {
            return 0 === this.cmpn(t);
          }),
          (o.prototype.eq = function (t) {
            return 0 === this.cmp(t);
          }),
          (o.red = function (t) {
            return new S(t);
          }),
          (o.prototype.toRed = function (t) {
            return (
              n(!this.red, "Already a number in reduction context"),
              n(0 === this.negative, "red works only with positives"),
              t.convertTo(this)._forceRed(t)
            );
          }),
          (o.prototype.fromRed = function () {
            return (
              n(
                this.red,
                "fromRed works only with numbers in reduction context"
              ),
              this.red.convertFrom(this)
            );
          }),
          (o.prototype._forceRed = function (t) {
            return (this.red = t), this;
          }),
          (o.prototype.forceRed = function (t) {
            return (
              n(!this.red, "Already a number in reduction context"),
              this._forceRed(t)
            );
          }),
          (o.prototype.redAdd = function (t) {
            return (
              n(this.red, "redAdd works only with red numbers"),
              this.red.add(this, t)
            );
          }),
          (o.prototype.redIAdd = function (t) {
            return (
              n(this.red, "redIAdd works only with red numbers"),
              this.red.iadd(this, t)
            );
          }),
          (o.prototype.redSub = function (t) {
            return (
              n(this.red, "redSub works only with red numbers"),
              this.red.sub(this, t)
            );
          }),
          (o.prototype.redISub = function (t) {
            return (
              n(this.red, "redISub works only with red numbers"),
              this.red.isub(this, t)
            );
          }),
          (o.prototype.redShl = function (t) {
            return (
              n(this.red, "redShl works only with red numbers"),
              this.red.shl(this, t)
            );
          }),
          (o.prototype.redMul = function (t) {
            return (
              n(this.red, "redMul works only with red numbers"),
              this.red._verify2(this, t),
              this.red.mul(this, t)
            );
          }),
          (o.prototype.redIMul = function (t) {
            return (
              n(this.red, "redMul works only with red numbers"),
              this.red._verify2(this, t),
              this.red.imul(this, t)
            );
          }),
          (o.prototype.redSqr = function () {
            return (
              n(this.red, "redSqr works only with red numbers"),
              this.red._verify1(this),
              this.red.sqr(this)
            );
          }),
          (o.prototype.redISqr = function () {
            return (
              n(this.red, "redISqr works only with red numbers"),
              this.red._verify1(this),
              this.red.isqr(this)
            );
          }),
          (o.prototype.redSqrt = function () {
            return (
              n(this.red, "redSqrt works only with red numbers"),
              this.red._verify1(this),
              this.red.sqrt(this)
            );
          }),
          (o.prototype.redInvm = function () {
            return (
              n(this.red, "redInvm works only with red numbers"),
              this.red._verify1(this),
              this.red.invm(this)
            );
          }),
          (o.prototype.redNeg = function () {
            return (
              n(this.red, "redNeg works only with red numbers"),
              this.red._verify1(this),
              this.red.neg(this)
            );
          }),
          (o.prototype.redPow = function (t) {
            return (
              n(this.red && !t.red, "redPow(normalNum)"),
              this.red._verify1(this),
              this.red.pow(this, t)
            );
          });
        var y = { k256: null, p224: null, p192: null, p25519: null };
        function w(t, e) {
          (this.name = t),
            (this.p = new o(e, 16)),
            (this.n = this.p.bitLength()),
            (this.k = new o(1).iushln(this.n).isub(this.p)),
            (this.tmp = this._tmp());
        }
        function b() {
          w.call(
            this,
            "k256",
            "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
          );
        }
        function M() {
          w.call(
            this,
            "p224",
            "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
          );
        }
        function _() {
          w.call(
            this,
            "p192",
            "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
          );
        }
        function x() {
          w.call(
            this,
            "25519",
            "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
          );
        }
        function S(t) {
          if ("string" === typeof t) {
            var e = o._prime(t);
            (this.m = e.p), (this.prime = e);
          } else
            n(t.gtn(1), "modulus must be greater than 1"),
              (this.m = t),
              (this.prime = null);
        }
        function E(t) {
          S.call(this, t),
            (this.shift = this.m.bitLength()),
            this.shift % 26 !== 0 && (this.shift += 26 - (this.shift % 26)),
            (this.r = new o(1).iushln(this.shift)),
            (this.r2 = this.imod(this.r.sqr())),
            (this.rinv = this.r._invmp(this.m)),
            (this.minv = this.rinv.mul(this.r).isubn(1).div(this.m)),
            (this.minv = this.minv.umod(this.r)),
            (this.minv = this.r.sub(this.minv));
        }
        (w.prototype._tmp = function () {
          var t = new o(null);
          return (t.words = new Array(Math.ceil(this.n / 13))), t;
        }),
          (w.prototype.ireduce = function (t) {
            var e,
              r = t;
            do {
              this.split(r, this.tmp),
                (r = this.imulK(r)),
                (r = r.iadd(this.tmp)),
                (e = r.bitLength());
            } while (e > this.n);
            var n = e < this.n ? -1 : r.ucmp(this.p);
            return (
              0 === n
                ? ((r.words[0] = 0), (r.length = 1))
                : n > 0
                ? r.isub(this.p)
                : r.strip(),
              r
            );
          }),
          (w.prototype.split = function (t, e) {
            t.iushrn(this.n, 0, e);
          }),
          (w.prototype.imulK = function (t) {
            return t.imul(this.k);
          }),
          i(b, w),
          (b.prototype.split = function (t, e) {
            for (var r = 4194303, n = Math.min(t.length, 9), i = 0; i < n; i++)
              e.words[i] = t.words[i];
            if (((e.length = n), t.length <= 9))
              return (t.words[0] = 0), void (t.length = 1);
            var o = t.words[9];
            for (e.words[e.length++] = o & r, i = 10; i < t.length; i++) {
              var s = 0 | t.words[i];
              (t.words[i - 10] = ((s & r) << 4) | (o >>> 22)), (o = s);
            }
            (o >>>= 22),
              (t.words[i - 10] = o),
              0 === o && t.length > 10 ? (t.length -= 10) : (t.length -= 9);
          }),
          (b.prototype.imulK = function (t) {
            (t.words[t.length] = 0),
              (t.words[t.length + 1] = 0),
              (t.length += 2);
            for (var e = 0, r = 0; r < t.length; r++) {
              var n = 0 | t.words[r];
              (e += 977 * n),
                (t.words[r] = 67108863 & e),
                (e = 64 * n + ((e / 67108864) | 0));
            }
            return (
              0 === t.words[t.length - 1] &&
                (t.length--, 0 === t.words[t.length - 1] && t.length--),
              t
            );
          }),
          i(M, w),
          i(_, w),
          i(x, w),
          (x.prototype.imulK = function (t) {
            for (var e = 0, r = 0; r < t.length; r++) {
              var n = 19 * (0 | t.words[r]) + e,
                i = 67108863 & n;
              (n >>>= 26), (t.words[r] = i), (e = n);
            }
            return 0 !== e && (t.words[t.length++] = e), t;
          }),
          (o._prime = function (t) {
            if (y[t]) return y[t];
            var e;
            if ("k256" === t) e = new b();
            else if ("p224" === t) e = new M();
            else if ("p192" === t) e = new _();
            else {
              if ("p25519" !== t) throw new Error("Unknown prime " + t);
              e = new x();
            }
            return (y[t] = e), e;
          }),
          (S.prototype._verify1 = function (t) {
            n(0 === t.negative, "red works only with positives"),
              n(t.red, "red works only with red numbers");
          }),
          (S.prototype._verify2 = function (t, e) {
            n(0 === (t.negative | e.negative), "red works only with positives"),
              n(t.red && t.red === e.red, "red works only with red numbers");
          }),
          (S.prototype.imod = function (t) {
            return this.prime
              ? this.prime.ireduce(t)._forceRed(this)
              : t.umod(this.m)._forceRed(this);
          }),
          (S.prototype.neg = function (t) {
            return t.isZero() ? t.clone() : this.m.sub(t)._forceRed(this);
          }),
          (S.prototype.add = function (t, e) {
            this._verify2(t, e);
            var r = t.add(e);
            return r.cmp(this.m) >= 0 && r.isub(this.m), r._forceRed(this);
          }),
          (S.prototype.iadd = function (t, e) {
            this._verify2(t, e);
            var r = t.iadd(e);
            return r.cmp(this.m) >= 0 && r.isub(this.m), r;
          }),
          (S.prototype.sub = function (t, e) {
            this._verify2(t, e);
            var r = t.sub(e);
            return r.cmpn(0) < 0 && r.iadd(this.m), r._forceRed(this);
          }),
          (S.prototype.isub = function (t, e) {
            this._verify2(t, e);
            var r = t.isub(e);
            return r.cmpn(0) < 0 && r.iadd(this.m), r;
          }),
          (S.prototype.shl = function (t, e) {
            return this._verify1(t), this.imod(t.ushln(e));
          }),
          (S.prototype.imul = function (t, e) {
            return this._verify2(t, e), this.imod(t.imul(e));
          }),
          (S.prototype.mul = function (t, e) {
            return this._verify2(t, e), this.imod(t.mul(e));
          }),
          (S.prototype.isqr = function (t) {
            return this.imul(t, t.clone());
          }),
          (S.prototype.sqr = function (t) {
            return this.mul(t, t);
          }),
          (S.prototype.sqrt = function (t) {
            if (t.isZero()) return t.clone();
            var e = this.m.andln(3);
            if ((n(e % 2 === 1), 3 === e)) {
              var r = this.m.add(new o(1)).iushrn(2);
              return this.pow(t, r);
            }
            var i = this.m.subn(1),
              s = 0;
            while (!i.isZero() && 0 === i.andln(1)) s++, i.iushrn(1);
            n(!i.isZero());
            var u = new o(1).toRed(this),
              a = u.redNeg(),
              h = this.m.subn(1).iushrn(1),
              l = this.m.bitLength();
            l = new o(2 * l * l).toRed(this);
            while (0 !== this.pow(l, h).cmp(a)) l.redIAdd(a);
            var f = this.pow(l, i),
              c = this.pow(t, i.addn(1).iushrn(1)),
              d = this.pow(t, i),
              p = s;
            while (0 !== d.cmp(u)) {
              for (var m = d, v = 0; 0 !== m.cmp(u); v++) m = m.redSqr();
              n(v < p);
              var g = this.pow(f, new o(1).iushln(p - v - 1));
              (c = c.redMul(g)), (f = g.redSqr()), (d = d.redMul(f)), (p = v);
            }
            return c;
          }),
          (S.prototype.invm = function (t) {
            var e = t._invmp(this.m);
            return 0 !== e.negative
              ? ((e.negative = 0), this.imod(e).redNeg())
              : this.imod(e);
          }),
          (S.prototype.pow = function (t, e) {
            if (e.isZero()) return new o(1).toRed(this);
            if (0 === e.cmpn(1)) return t.clone();
            var r = 4,
              n = new Array(1 << r);
            (n[0] = new o(1).toRed(this)), (n[1] = t);
            for (var i = 2; i < n.length; i++) n[i] = this.mul(n[i - 1], t);
            var s = n[0],
              u = 0,
              a = 0,
              h = e.bitLength() % 26;
            for (0 === h && (h = 26), i = e.length - 1; i >= 0; i--) {
              for (var l = e.words[i], f = h - 1; f >= 0; f--) {
                var c = (l >> f) & 1;
                s !== n[0] && (s = this.sqr(s)),
                  0 !== c || 0 !== u
                    ? ((u <<= 1),
                      (u |= c),
                      a++,
                      (a === r || (0 === i && 0 === f)) &&
                        ((s = this.mul(s, n[u])), (a = 0), (u = 0)))
                    : (a = 0);
              }
              h = 26;
            }
            return s;
          }),
          (S.prototype.convertTo = function (t) {
            var e = t.umod(this.m);
            return e === t ? e.clone() : e;
          }),
          (S.prototype.convertFrom = function (t) {
            var e = t.clone();
            return (e.red = null), e;
          }),
          (o.mont = function (t) {
            return new E(t);
          }),
          i(E, S),
          (E.prototype.convertTo = function (t) {
            return this.imod(t.ushln(this.shift));
          }),
          (E.prototype.convertFrom = function (t) {
            var e = this.imod(t.mul(this.rinv));
            return (e.red = null), e;
          }),
          (E.prototype.imul = function (t, e) {
            if (t.isZero() || e.isZero())
              return (t.words[0] = 0), (t.length = 1), t;
            var r = t.imul(e),
              n = r
                .maskn(this.shift)
                .mul(this.minv)
                .imaskn(this.shift)
                .mul(this.m),
              i = r.isub(n).iushrn(this.shift),
              o = i;
            return (
              i.cmp(this.m) >= 0
                ? (o = i.isub(this.m))
                : i.cmpn(0) < 0 && (o = i.iadd(this.m)),
              o._forceRed(this)
            );
          }),
          (E.prototype.mul = function (t, e) {
            if (t.isZero() || e.isZero()) return new o(0)._forceRed(this);
            var r = t.mul(e),
              n = r
                .maskn(this.shift)
                .mul(this.minv)
                .imaskn(this.shift)
                .mul(this.m),
              i = r.isub(n).iushrn(this.shift),
              s = i;
            return (
              i.cmp(this.m) >= 0
                ? (s = i.isub(this.m))
                : i.cmpn(0) < 0 && (s = i.iadd(this.m)),
              s._forceRed(this)
            );
          }),
          (E.prototype.invm = function (t) {
            var e = this.imod(t._invmp(this.m).mul(this.r2));
            return e._forceRed(this);
          });
      })(t, this);
    }.call(this, r("62e4")(t)));
  },
  f772: function (t, e, r) {
    var n = r("5692"),
      i = r("90e3"),
      o = n("keys");
    t.exports = function (t) {
      return o[t] || (o[t] = i(t));
    };
  },
  f9e1: function (t, e, r) {
    "use strict";
    var n =
      (this && this.__extends) ||
      (function () {
        var t =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (t, e) {
              t.__proto__ = e;
            }) ||
          function (t, e) {
            for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
          };
        return function (e, r) {
          function n() {
            this.constructor = e;
          }
          t(e, r),
            (e.prototype =
              null === r
                ? Object.create(r)
                : ((n.prototype = r.prototype), new n()));
        };
      })();
    Object.defineProperty(e, "__esModule", { value: !0 });
    var i = (function (t) {
      function e() {
        return (null !== t && t.apply(this, arguments)) || this;
      }
      return n(e, t), e;
    })(Error);
    e.SecurityError = i;
    var o = (function (t) {
      function e() {
        return (null !== t && t.apply(this, arguments)) || this;
      }
      return n(e, t), e;
    })(Error);
    e.InvalidStateError = o;
    var s = (function (t) {
      function e() {
        return (null !== t && t.apply(this, arguments)) || this;
      }
      return n(e, t), e;
    })(Error);
    e.NetworkError = s;
    var u = (function (t) {
      function e() {
        return (null !== t && t.apply(this, arguments)) || this;
      }
      return n(e, t), e;
    })(Error);
    e.SyntaxError = u;
  },
  faa1: function (t, e, r) {
    "use strict";
    var n,
      i = "object" === typeof Reflect ? Reflect : null,
      o =
        i && "function" === typeof i.apply
          ? i.apply
          : function (t, e, r) {
              return Function.prototype.apply.call(t, e, r);
            };
    function s(t) {
      console && console.warn && console.warn(t);
    }
    n =
      i && "function" === typeof i.ownKeys
        ? i.ownKeys
        : Object.getOwnPropertySymbols
        ? function (t) {
            return Object.getOwnPropertyNames(t).concat(
              Object.getOwnPropertySymbols(t)
            );
          }
        : function (t) {
            return Object.getOwnPropertyNames(t);
          };
    var u =
      Number.isNaN ||
      function (t) {
        return t !== t;
      };
    function a() {
      a.init.call(this);
    }
    (t.exports = a),
      (t.exports.once = b),
      (a.EventEmitter = a),
      (a.prototype._events = void 0),
      (a.prototype._eventsCount = 0),
      (a.prototype._maxListeners = void 0);
    var h = 10;
    function l(t) {
      if ("function" !== typeof t)
        throw new TypeError(
          'The "listener" argument must be of type Function. Received type ' +
            typeof t
        );
    }
    function f(t) {
      return void 0 === t._maxListeners
        ? a.defaultMaxListeners
        : t._maxListeners;
    }
    function c(t, e, r, n) {
      var i, o, u;
      if (
        (l(r),
        (o = t._events),
        void 0 === o
          ? ((o = t._events = Object.create(null)), (t._eventsCount = 0))
          : (void 0 !== o.newListener &&
              (t.emit("newListener", e, r.listener ? r.listener : r),
              (o = t._events)),
            (u = o[e])),
        void 0 === u)
      )
        (u = o[e] = r), ++t._eventsCount;
      else if (
        ("function" === typeof u
          ? (u = o[e] = n ? [r, u] : [u, r])
          : n
          ? u.unshift(r)
          : u.push(r),
        (i = f(t)),
        i > 0 && u.length > i && !u.warned)
      ) {
        u.warned = !0;
        var a = new Error(
          "Possible EventEmitter memory leak detected. " +
            u.length +
            " " +
            String(e) +
            " listeners added. Use emitter.setMaxListeners() to increase limit"
        );
        (a.name = "MaxListenersExceededWarning"),
          (a.emitter = t),
          (a.type = e),
          (a.count = u.length),
          s(a);
      }
      return t;
    }
    function d() {
      if (!this.fired)
        return (
          this.target.removeListener(this.type, this.wrapFn),
          (this.fired = !0),
          0 === arguments.length
            ? this.listener.call(this.target)
            : this.listener.apply(this.target, arguments)
        );
    }
    function p(t, e, r) {
      var n = { fired: !1, wrapFn: void 0, target: t, type: e, listener: r },
        i = d.bind(n);
      return (i.listener = r), (n.wrapFn = i), i;
    }
    function m(t, e, r) {
      var n = t._events;
      if (void 0 === n) return [];
      var i = n[e];
      return void 0 === i
        ? []
        : "function" === typeof i
        ? r
          ? [i.listener || i]
          : [i]
        : r
        ? w(i)
        : g(i, i.length);
    }
    function v(t) {
      var e = this._events;
      if (void 0 !== e) {
        var r = e[t];
        if ("function" === typeof r) return 1;
        if (void 0 !== r) return r.length;
      }
      return 0;
    }
    function g(t, e) {
      for (var r = new Array(e), n = 0; n < e; ++n) r[n] = t[n];
      return r;
    }
    function y(t, e) {
      for (; e + 1 < t.length; e++) t[e] = t[e + 1];
      t.pop();
    }
    function w(t) {
      for (var e = new Array(t.length), r = 0; r < e.length; ++r)
        e[r] = t[r].listener || t[r];
      return e;
    }
    function b(t, e) {
      return new Promise(function (r, n) {
        function i() {
          void 0 !== o && t.removeListener("error", o),
            r([].slice.call(arguments));
        }
        var o;
        "error" !== e &&
          ((o = function (r) {
            t.removeListener(e, i), n(r);
          }),
          t.once("error", o)),
          t.once(e, i);
      });
    }
    Object.defineProperty(a, "defaultMaxListeners", {
      enumerable: !0,
      get: function () {
        return h;
      },
      set: function (t) {
        if ("number" !== typeof t || t < 0 || u(t))
          throw new RangeError(
            'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
              t +
              "."
          );
        h = t;
      },
    }),
      (a.init = function () {
        (void 0 !== this._events &&
          this._events !== Object.getPrototypeOf(this)._events) ||
          ((this._events = Object.create(null)), (this._eventsCount = 0)),
          (this._maxListeners = this._maxListeners || void 0);
      }),
      (a.prototype.setMaxListeners = function (t) {
        if ("number" !== typeof t || t < 0 || u(t))
          throw new RangeError(
            'The value of "n" is out of range. It must be a non-negative number. Received ' +
              t +
              "."
          );
        return (this._maxListeners = t), this;
      }),
      (a.prototype.getMaxListeners = function () {
        return f(this);
      }),
      (a.prototype.emit = function (t) {
        for (var e = [], r = 1; r < arguments.length; r++) e.push(arguments[r]);
        var n = "error" === t,
          i = this._events;
        if (void 0 !== i) n = n && void 0 === i.error;
        else if (!n) return !1;
        if (n) {
          var s;
          if ((e.length > 0 && (s = e[0]), s instanceof Error)) throw s;
          var u = new Error(
            "Unhandled error." + (s ? " (" + s.message + ")" : "")
          );
          throw ((u.context = s), u);
        }
        var a = i[t];
        if (void 0 === a) return !1;
        if ("function" === typeof a) o(a, this, e);
        else {
          var h = a.length,
            l = g(a, h);
          for (r = 0; r < h; ++r) o(l[r], this, e);
        }
        return !0;
      }),
      (a.prototype.addListener = function (t, e) {
        return c(this, t, e, !1);
      }),
      (a.prototype.on = a.prototype.addListener),
      (a.prototype.prependListener = function (t, e) {
        return c(this, t, e, !0);
      }),
      (a.prototype.once = function (t, e) {
        return l(e), this.on(t, p(this, t, e)), this;
      }),
      (a.prototype.prependOnceListener = function (t, e) {
        return l(e), this.prependListener(t, p(this, t, e)), this;
      }),
      (a.prototype.removeListener = function (t, e) {
        var r, n, i, o, s;
        if ((l(e), (n = this._events), void 0 === n)) return this;
        if (((r = n[t]), void 0 === r)) return this;
        if (r === e || r.listener === e)
          0 === --this._eventsCount
            ? (this._events = Object.create(null))
            : (delete n[t],
              n.removeListener &&
                this.emit("removeListener", t, r.listener || e));
        else if ("function" !== typeof r) {
          for (i = -1, o = r.length - 1; o >= 0; o--)
            if (r[o] === e || r[o].listener === e) {
              (s = r[o].listener), (i = o);
              break;
            }
          if (i < 0) return this;
          0 === i ? r.shift() : y(r, i),
            1 === r.length && (n[t] = r[0]),
            void 0 !== n.removeListener &&
              this.emit("removeListener", t, s || e);
        }
        return this;
      }),
      (a.prototype.off = a.prototype.removeListener),
      (a.prototype.removeAllListeners = function (t) {
        var e, r, n;
        if (((r = this._events), void 0 === r)) return this;
        if (void 0 === r.removeListener)
          return (
            0 === arguments.length
              ? ((this._events = Object.create(null)), (this._eventsCount = 0))
              : void 0 !== r[t] &&
                (0 === --this._eventsCount
                  ? (this._events = Object.create(null))
                  : delete r[t]),
            this
          );
        if (0 === arguments.length) {
          var i,
            o = Object.keys(r);
          for (n = 0; n < o.length; ++n)
            (i = o[n]), "removeListener" !== i && this.removeAllListeners(i);
          return (
            this.removeAllListeners("removeListener"),
            (this._events = Object.create(null)),
            (this._eventsCount = 0),
            this
          );
        }
        if (((e = r[t]), "function" === typeof e)) this.removeListener(t, e);
        else if (void 0 !== e)
          for (n = e.length - 1; n >= 0; n--) this.removeListener(t, e[n]);
        return this;
      }),
      (a.prototype.listeners = function (t) {
        return m(this, t, !0);
      }),
      (a.prototype.rawListeners = function (t) {
        return m(this, t, !1);
      }),
      (a.listenerCount = function (t, e) {
        return "function" === typeof t.listenerCount
          ? t.listenerCount(e)
          : v.call(t, e);
      }),
      (a.prototype.listenerCount = v),
      (a.prototype.eventNames = function () {
        return this._eventsCount > 0 ? n(this._events) : [];
      });
  },
  fc6a: function (t, e, r) {
    var n = r("44ad"),
      i = r("1d80");
    t.exports = function (t) {
      return n(i(t));
    };
  },
  fdbc: function (t, e) {
    t.exports = {
      CSSRuleList: 0,
      CSSStyleDeclaration: 0,
      CSSValueList: 0,
      ClientRectList: 0,
      DOMRectList: 0,
      DOMStringList: 0,
      DOMTokenList: 1,
      DataTransferItemList: 0,
      FileList: 0,
      HTMLAllCollection: 0,
      HTMLCollection: 0,
      HTMLFormElement: 0,
      HTMLSelectElement: 0,
      MediaList: 0,
      MimeTypeArray: 0,
      NamedNodeMap: 0,
      NodeList: 1,
      PaintRequestList: 0,
      Plugin: 0,
      PluginArray: 0,
      SVGLengthList: 0,
      SVGNumberList: 0,
      SVGPathSegList: 0,
      SVGPointList: 0,
      SVGStringList: 0,
      SVGTransformList: 0,
      SourceBufferList: 0,
      StyleSheetList: 0,
      TextTrackCueList: 0,
      TextTrackList: 0,
      TouchList: 0,
    };
  },
  fdbf: function (t, e, r) {
    var n = r("4930");
    t.exports = n && !Symbol.sham && "symbol" == typeof Symbol.iterator;
  },
  fea9: function (t, e, r) {
    var n = r("da84");
    t.exports = n.Promise;
  },
});
