"use strict";
const filter = require("../filter"),
	EXPLAIN_ROUTE_PARAMETER_MATCHER = "ＥＸＰＬＡＩＮ－ＲＯＵＴＥ－ＰＡＲＡＭＥＴＥＲ－ＭＡＴＣＨＥＲ";
exports.startup = (async (e, t, r) => {
	let o = {
			config: {},
			mode: "route",
			routes: [],
			filters: [],
			useService: r => new r(e, t, o)
		},
		i = o.config = {
			baseDir: "",
			serviceDir: "",
			serviceKey: "",
			actionKey: "",
			routeKey: "",
			paramsKey: "",
			enableMatchMode: !0,
			matchIgnore: [],
			init: ({
				baseDir: e,
				serviceDir: t = "/services/",
				serviceKey: r = "service",
				actionKey: o = "action",
				routeKey: a = "route",
				methodKey: s = "method",
				paramsKey: n = "params",
				enableMatchMode: c = !0,
				matchIgnore: p = []
			}) => {
				i.baseDir = e, i.serviceDir = t, i.serviceKey = r, i.actionKey = o, i.routeKey = a, i.methodKey = s, i.paramsKey =
					n, i.enableMatchMode = c, i.matchIgnore = p
			},
			route: {
				add: e => {
					o.routes = o.routes.concat(e)
				},
				root: {},
				setRoot: e => {
					i.route.root = e
				}
			},
			filter: {
				add: e => {
					o.filters = o.filters.concat(e)
				}
			}
		};
	if (r && r(i), !i.baseDir) throw new Error('"baseDir"必须配置。');
	let a, s, n, c = "",
		p = {},
		E = !!e.httpMethod;
	if (E) {
		var l = e.queryStringParameters;
		if (a = l[i.serviceKey], s = l[i.actionKey], n = l[i.routeKey], c = l[i.methodKey], delete l[i.serviceKey], delete l[
				i.actionKey], delete l[i.routeKey], delete l[i.methodKey], p = l, "GET" === e.httpMethod);
		else {
			var h = {},
				f = e.body;
			e.isBase64Encoded && e.body && (f = new Buffer(e.body, "base64").toString()), e.headers["content-type"] && (e.headers[
					"content-type"].includes("application/json") ? f && (h = JSON.parse(f)) : e.headers["content-type"].includes(
					"application/x-www-form-urlencoded") && f && f.split("&").forEach(e => {
					var t = e.split("="),
						r = t[0],
						o = decodeURIComponent(t[1]);
					h[r] = o
				})), "string" == typeof h.params && (h.params = JSON.parse(h.params)), a = h[i.serviceKey] || a, s = h[i.actionKey] ||
				s, n = h[i.routeKey] || n, c = h[i.methodKey] || c, "object" == typeof h[i.paramsKey] && (p = Object.assign(p, h[
					i.paramsKey]))
		}
		c = c || e.httpMethod, "object" == typeof e[i.paramsKey] && (p = Object.assign(p, e[i.paramsKey]))
	} else a = e[i.serviceKey], s = e[i.actionKey], n = e[i.routeKey], c = e[i.methodKey], p = e[i.paramsKey] || {};
	console.log(a, s, n, c, p);
	let g = () => {
			o.mode = "match";
			for (var e = i.matchIgnore.filter(e => e.service === a), t = 0; t < e.length; t++) {
				var r = e[t],
					n = (r.service, r.actions);
				if (void 0 === n || !0 === n) throw new Error(`service: "${a}"，action: "${s}" 拒绝访问。`);
				if (n.filter(e => e === s).length > 0) throw new Error(`service: "${a}"，action: "${s}" 拒绝访问。`)
			}
		},
		u = () => {
			o.mode = "route";
			var e = [];
			if (o.routes.forEach(t => {
					var r = t.service,
						o = t.route || "";
					if (o) {
						if (o.startsWith("/") || o.endsWith("/")) throw new Error(
							`路由格式错误，不能以'/'开头或结束。${JSON.stringify({service:r,route:o})}`);
						if (o.includes("}{")) throw new Error(`路由格式错误，每个参数匹配符之间需要有其它字符。${JSON.stringify({service:r,route:o})}`)
					}
					t.routes && t.routes.forEach(t => {
						var i = t.action,
							a = t.route || "",
							s = "",
							n = "";
						if (a) {
							if (a.startsWith("/") || a.endsWith("/")) throw new Error(
								`路由格式错误，不能以'/'开头或结束。${JSON.stringify({service:r,action:i,route:a})}`);
							if (a.includes("}{")) throw new Error(
								`路由格式错误，每个参数匹配符之间需要有其它字符。${JSON.stringify({service:r,action:i,route:a})}`)
						}
						s = o && a ? `${o}/${a}` : !o && a ? a : o && !a ? o : r, t.httpMethod ? ("string" == typeof t.httpMethod &&
								(t.httpMethod = [t.httpMethod]), n = t.httpMethod) : i.toUpperCase().startsWith("GET") ? n = ["GET"] : i.toUpperCase()
							.startsWith("POST") || i.toUpperCase().startsWith("CREATE") || i.toUpperCase().startsWith("ADD") || i.toUpperCase()
							.startsWith("INSERT") ? n = ["POST"] : i.toUpperCase().startsWith("PUT") || i.toUpperCase().startsWith(
								"UPDATE") ? n = ["PUT"] : i.toUpperCase().startsWith("DELETE") || i.toUpperCase().startsWith("REMOVE") ?
							n = ["DELETE"] : i.toUpperCase().startsWith("PATCH") && (n = ["PATCH"]), e.push({
								routeTemplate: s,
								httpMethod: n,
								service: r,
								action: i
							})
					})
				}), console.log(e), e = e.filter(e => {
					if (e.httpMethod.includes(c)) {
						var t = `^${e.routeTemplate.replace(new RegExp("\\{[^\\}]+\\}","g"),"[^/]+")}$`;
						if (new RegExp(t, "gi").test(n)) return e
					}
				}), 0 === e.length) throw new Error("找不到与该请求匹配的操作。");
			console.log(e), e = e.sort((e, t) => {
				var r = e.routeTemplate.replace(new RegExp("\\{[^\\}]+\\}", "g"), ""),
					o = t.routeTemplate.replace(new RegExp("\\{[^\\}]+\\}", "g"), "");
				if (r.length < o.length) return !0;
				if (r.length === o.length) {
					var i = e.routeTemplate.replace(new RegExp("\\{[^\\}]+\\}", "g"), EXPLAIN_ROUTE_PARAMETER_MATCHER).split(
							EXPLAIN_ROUTE_PARAMETER_MATCHER).length - 1,
						a = t.routeTemplate.replace(new RegExp("\\{[^\\}]+\\}", "g"), EXPLAIN_ROUTE_PARAMETER_MATCHER).split(
							EXPLAIN_ROUTE_PARAMETER_MATCHER).length - 1;
					if (i > a) return !0
				}
			}), console.log(e);
			var r = e[0],
				i = e.filter(e => {
					if (r.routeTemplate.replace(new RegExp("\\{[^\\}]+\\}", "g"), EXPLAIN_ROUTE_PARAMETER_MATCHER) === e.routeTemplate
						.replace(new RegExp("\\{[^\\}]+\\}", "g"), EXPLAIN_ROUTE_PARAMETER_MATCHER)) return e
				});
			if (i.length > 1) throw new Error(`找到了与该请求匹配的多个操作，请对冲突的路由模板进行修改: ${JSON.stringify(i)}`);
			console.log(r);
			var E = {},
				l = r.routeTemplate,
				h = l.split("/"),
				f = l.replace(new RegExp("\\{[^\\}]+\\}", "g"), EXPLAIN_ROUTE_PARAMETER_MATCHER).split("/"),
				g = n.split("/");
			f.forEach((e, t) => {
				var r = g[t],
					o = h[t];
				if (e.includes(EXPLAIN_ROUTE_PARAMETER_MATCHER))
					if (e === EXPLAIN_ROUTE_PARAMETER_MATCHER) E[o.replace(new RegExp("\\{|\\}", "g"), "")] = r;
					else
						for (var i = e.split(EXPLAIN_ROUTE_PARAMETER_MATCHER), a = r, s = o, n = 0; n < i.length - 1; n++) {
							var c = i[n],
								p = i[n + 1],
								l = "",
								f = "";
							c && (l += `^${c}`, f += `^${c}`), l += "{.+?}", f += ".+", p && (l += `${p}`, f += `?${p}`, n === i.length -
								2 && (l += "$", f += "$"));
							var u = new RegExp(l, "i").exec(s)[0].replace(new RegExp(`(^${c})\\{|\\}(${p}$)`, "gi"), ""),
								R = new RegExp(f, "i").exec(a)[0].replace(new RegExp(`(^${c})|(${p}$)`, "gi"), "");
							s = s.substring(s.indexOf(`${c}{${u}}`) + `${c}{${u}}`.length, s.length), a = a.substring(a.toLowerCase().indexOf(
								`${c}${R}`.toLowerCase()) + `${c}${R}`.length, a.length), E[u] = R
						}
			}), a = r.service, s = r.action, p = Object.assign({}, E, p), t.routeTemplate = r.routeTemplate
		};
	if (n && "/" != n) u();
	else if (a) {
		if (!i.enableMatchMode) throw new Error(`service: "${a}"，action: "${s}" 拒绝访问。`);
		g()
	} else if (o.mode = "route", i.route.root) {
		if (n = "/", c) {
			var R = i.route.root[c.toLowerCase()];
			if (!R) throw new Error("找不到与该请求匹配的操作。");
			a = R.service, s = R.action
		}
		if (!a || !s) throw new Error("找不到与该请求匹配的操作。")
	}
	if (!a) throw "match" === o.mode ? new Error("service不能为空。") : new Error("找不到与该请求匹配的操作。");
	if (!s) throw "match" === o.mode ? new Error("action不能为空。") : new Error("找不到与该请求匹配的操作。");
	t.service = require(`${i.baseDir}${i.serviceDir}${a}`), t.isHttp = E, t.httpMethod = c, e[i.paramsKey] = p, e[i.serviceKey] =
		a, e[i.actionKey] = s, e[i.routeKey] = n, e[i.methodKey] = c;
	let d = new t.service(e, t, o);
	if (!d[s]) throw new Error(`找不到action: "${s}"。`);
	let w = await filter.onActionExecuting(e, t, o, o.filters);
	if (w) return w;
	try {
		var y = await d[s](p);
		y && (t.response = y)
	} catch (r) {
		var T = await filter.onException(e, t, o, o.filters, r);
		if (T) return T;
		throw r
	}
	await filter.onActionExecuted(e, t, o, o.filters);
	return t.response
});
