var Ne=`bedrock-${Math.random().toString(36).slice(2)}`,Js=`<!--${Ne}-`,pe=`${Ne}-`,Pt=new WeakMap,Ce=class{constructor(t,s){this.strings=t,this.values=s,this._type="template-result"}getTemplate(){let t=Pt.get(this.strings);return t||(t=Xs(this.strings),Pt.set(this.strings,t)),t}};function d(e,...t){return new Ce(e,t)}function Zs(e){let t=!1;for(let s=e.length-1;s>=0;s--){if(e[s]===">")return!1;if(e[s]==="<")return!0}return!1}function Xs(e){let t=[],s="";for(let a=0;a<e.length;a++)s+=e[a],a<e.length-1&&(Zs(s)?(s+=`${pe}${a}`,t.push({type:"attr-pending",index:a})):(s+=`${Js}${a}-->`,t.push({type:"node",index:a})));let n=document.createElement("template");n.innerHTML=s;let r=new Array(e.length-1).fill(null);return Ot(n.content,r,[]),{element:n,parts:r}}function Ot(e,t,s){if(e.nodeType===Node.ELEMENT_NODE){let r=[];for(let a of e.attributes)if(a.value.includes(pe)||a.name.includes(pe)){let i=(a.value+a.name).match(new RegExp(`${pe}(\\d+)`));if(i){let o=parseInt(i[1],10),l=a.name.replace(new RegExp(`${pe}\\d+`),""),c=l.startsWith("on-"),f=l.startsWith(".");t[o]={type:c?"event":f?"property":"attribute",path:[...s],name:c?l.slice(3):f?l.slice(1):l},r.push(a.name)}}for(let a of r)e.removeAttribute(a)}if(e.nodeType===Node.COMMENT_NODE){let r=e.textContent;if(r.startsWith(Ne+"-")){let a=parseInt(r.slice(Ne.length+1),10);t[a]={type:"node",path:[...s]}}}let n=Array.from(e.childNodes);for(let r=0;r<n.length;r++)Ot(n[r],t,[...s,r])}function ge(e){return e&&e._type==="template-result"}var ze=new WeakMap,He=Symbol("bedrock-key");function We(e,t){let s=ze.get(t);s?s.strings===e.strings?Ke(s,e.values):(t.innerHTML="",s=Mt(e,t),ze.set(t,s)):(s=Mt(e,t),ze.set(t,s))}function Mt(e,t){let s=e.getTemplate(),n=s.element.content.cloneNode(!0),r=s.parts.map(a=>{if(!a)return null;let i=Qe(n,a.path);return{...a,node:i,value:void 0}});for(let a=0;a<e.values.length;a++)r[a]&&Te(r[a],e.values[a]);return t.appendChild(n),{strings:e.strings,parts:r,container:t}}function Ke(e,t){for(let s=0;s<t.length;s++){let n=e.parts[s];n&&n.value!==t[s]&&Te(n,t[s])}}function Te(e,t){let s=e.value;switch(e.value=t,e.type){case"attribute":en(e.node,e.name,t);break;case"property":e.node[e.name]=t;break;case"event":tn(e,t,s);break;case"node":sn(e,t,s);break}}function en(e,t,s){s==null||s===!1?e.removeAttribute(t):s===!0?e.setAttribute(t,""):e.setAttribute(t,String(s))}function tn(e,t,s){s&&e.node.removeEventListener(e.name,s),t&&e.node.addEventListener(e.name,t)}function sn(e,t,s){let n=e.node;if(t==null)Ve(e);else if(ge(t))nn(e,t);else if(Array.isArray(t))rn(e,t);else{Ve(e);let r=document.createTextNode(String(t));n.parentNode.insertBefore(r,n),e.nodes=[r]}}function Ve(e){e.nodes&&(e.nodes.forEach(t=>t.remove()),e.nodes=null),e.templateInstance&&(e.templateInstance=null),e.arrayItems&&(e.arrayItems.forEach(t=>t.nodes.forEach(s=>s.remove())),e.arrayItems=null)}function nn(e,t){let s=e.node;if(e.templateInstance&&e.templateInstance.strings===t.strings){Ke(e.templateInstance,t.values);return}Ve(e);let n=t.getTemplate(),r=n.element.content.cloneNode(!0),a=n.parts.map(o=>{if(!o)return null;let l=Qe(r,o.path);return{...o,node:l,value:void 0}});for(let o=0;o<t.values.length;o++)a[o]&&Te(a[o],t.values[o]);let i=Array.from(r.childNodes);s.parentNode.insertBefore(r,s),e.nodes=i,e.templateInstance={strings:t.strings,parts:a}}function rn(e,t){let s=e.node,n=s.parentNode,r=e.arrayItems||[],a=new Map;for(let o of r)o.key!==void 0&&a.set(o.key,o);let i=[];for(let o=0;o<t.length;o++){let l=t[o],c=l&&l[He]!==void 0?l[He]:o,f=a.get(c);f?(a.delete(c),ge(l)?f.instance&&f.instance.strings===l.strings?Ke(f.instance,l.values):(f.nodes.forEach(m=>m.remove()),f=Lt(l,c,s,n)):f.nodes[0]&&(f.nodes[0].textContent=String(l??""))):f=Lt(l,c,s,n),i.push(f)}for(let o of a.values())o.nodes.forEach(l=>l.remove());for(let o of i)for(let l of o.nodes)n.insertBefore(l,s);e.arrayItems=i}function Lt(e,t,s,n){if(ge(e)){let r=e.getTemplate(),a=r.element.content.cloneNode(!0),i=r.parts.map(l=>{if(!l)return null;let c=Qe(a,l.path);return{...l,node:c,value:void 0}});for(let l=0;l<e.values.length;l++)i[l]&&Te(i[l],e.values[l]);let o=Array.from(a.childNodes);return n.insertBefore(a,s),{key:t,nodes:o,instance:{strings:e.strings,parts:i}}}else{let r=document.createTextNode(String(e??""));return n.insertBefore(r,s),{key:t,nodes:[r],instance:null}}}function Qe(e,t){let s=e;for(let n of t)if(!s.childNodes||(s=s.childNodes[n],!s))return null;return s}function q(e,t){return t[He]=e,t}var se=null,Bt=new Set,an=new WeakMap;function ee(e){if(typeof e!="object"||e===null||e.__isReactive)return e;let t=new Map;return an.set(e,t),new Proxy(e,{get(n,r){if(r==="__isReactive")return!0;if(r==="__target")return n;se&&(t.has(r)||t.set(r,new Set),t.get(r).add(se),se.deps.add(t.get(r)));let a=n[r];return typeof a=="object"&&a!==null&&!a.__isReactive?(n[r]=ee(a),n[r]):a},set(n,r,a){let i=Array.isArray(n),o=i?n.length:0,l=n[r];if(typeof a=="object"&&a!==null&&(a=ee(a)),n[r]=a,l!==a&&t.has(r)){let c=t.get(r);for(let f of c)Ge(f)}if(i&&r!=="length"&&n.length!==o&&t.has("length")){let c=t.get("length");for(let f of c)Ge(f)}return!0},deleteProperty(n,r){if(r in n&&(delete n[r],t.has(r))){let a=t.get(r);for(let i of a)Ge(i)}return!0}})}function Ze(e,t={}){let s={fn:e,deps:new Set,active:!0,immediate:t.immediate!==!1};return Bt.add(s),s.immediate&&_t(s),()=>{s.active=!1,Bt.delete(s),Ut(s)}}function _t(e){if(!e.active)return;Ut(e);let t=se;se=e;try{e.fn()}finally{se=t}}function Ut(e){for(let t of e.deps)t.delete(e);e.deps.clear()}var Ye=new Set,Je=!1;function Ge(e){e.active&&(Ye.add(e),Je||(Je=!0,queueMicrotask(on)))}function on(){let e=[...Ye];Ye.clear(),Je=!1;for(let t of e)_t(t)}var ln=new Map,_=class extends HTMLElement{static tag=null;static shadow=!1;static properties={};static autoRegister=!0;#e={};#t=null;#i=null;#a=!1;#s=!1;#r=null;constructor(){super(),this.constructor.shadow?this.#i=this.attachShadow({mode:"open"}):this.#i=this,this.#n()}#n(){let t=this.constructor.properties;for(let[s,n]of Object.entries(t)){let r=typeof n=="function"?{type:n}:n;r.default!==void 0?this.#e[s]=typeof r.default=="function"?r.default():r.default:this.#e[s]=void 0,Object.defineProperty(this,s,{get:()=>this.#e[s],set:a=>{let i=this.#e[s],o=this.#l(a,r.type);i!==o&&(this.#e[s]=o,this.#u())},enumerable:!0,configurable:!0})}}#l(t,s){if(t==null||!s)return t;switch(s){case String:return String(t);case Number:return Number(t);case Boolean:return!!t;case Array:return Array.isArray(t)?t:[t];case Object:return typeof t=="object"?t:{value:t};default:return t}}get renderRoot(){return this.#i}get routeData(){return this.#r}set routeData(t){this.#r=t,this.#u()}connectedCallback(){this.#a=!0,this.#c(),this.#t=Ze(()=>{this.#d()})}disconnectedCallback(){this.#a=!1,this.#t&&(this.#t(),this.#t=null)}#c(){let t=this.constructor.properties;for(let[s,n]of Object.entries(t)){let r=typeof n=="function"?{type:n}:n,a=s.replace(/([A-Z])/g,"-$1").toLowerCase();if(this.hasAttribute(a)){let i=this.getAttribute(a);this[s]=this.#o(i,r.type)}}}#o(t,s){if(!s)return t;switch(s){case Boolean:return t!==null&&t!=="false";case Number:return Number(t);case Array:case Object:try{return JSON.parse(t)}catch{return t}default:return t}}static get observedAttributes(){let t=this.properties||{};return Object.keys(t).map(s=>s.replace(/([A-Z])/g,"-$1").toLowerCase())}attributeChangedCallback(t,s,n){if(s===n)return;let r=t.replace(/-([a-z])/g,(a,i)=>i.toUpperCase());if(r in this.constructor.properties){let a=this.constructor.properties[r],i=typeof a=="function"?{type:a}:a;this[r]=this.#o(n,i.type)}}#u(){!this.#a||this.#s||(this.#s=!0,queueMicrotask(()=>{this.#s=!1,this.#a&&this.#d()}))}#d(){let t=this.render();t&&We(t,this.#i),this.updated()}render(){return null}updated(){}requestUpdate(){this.#u()}static register(t){let s=t||this.tag;if(!s)throw new Error("Component must have a tag name");return customElements.get(s)||(customElements.define(s,this),ln.set(s,this)),this}};function Fe(e){return e.autoRegister&&e.tag&&e.register(),e}var V=class e{#e=[];#t=null;#i=null;#a=null;#s=!1;#r="";constructor(t={}){this.#e=t.routes||[],this.#s=t.hash||!1,this.#r=t.base||"",e.instance=this}start(){window.addEventListener("popstate",this.#n),this.#s&&window.addEventListener("hashchange",this.#n);let t=document.querySelector("router-outlet");return t&&this.setOutlet(t),this.#n(),this}stop(){window.removeEventListener("popstate",this.#n),this.#s&&window.removeEventListener("hashchange",this.#n)}setOutlet(t){this.#t=t,this.#n()}get currentPath(){if(this.#s)return window.location.hash.slice(1)||"/";let t=window.location.pathname;return this.#r&&t.startsWith(this.#r)&&(t=t.slice(this.#r.length)),t=t.replace(/\/index\.html$/,"/").replace(/\/$/,"")||"/",t}navigate(t,s={}){let n=this.#s?`#${t}`:`${this.#r}${t}`;s.replace?window.history.replaceState(null,"",n):window.history.pushState(null,"",n),this.#n()}#n=async()=>{let t=this.currentPath,s=this.#l(t);if(!s){console.warn(`No route matched for path: ${t}`);return}let{route:n,params:r}=s;this.#i={...n,params:r},await this.#o(n,r)};#l(t){for(let s of this.#e){let n=this.#c(s.path,t);if(n!==null)return{route:s,params:n}}return null}#c(t,s){let n=[],r=t.replace(/\//g,"\\/").replace(/:([^/]+)/g,(l,c)=>(n.push(c),"([^/]+)")).replace(/\*/g,".*"),a=new RegExp(`^${r}$`),i=s.match(a);if(!i)return null;let o={};return n.forEach((l,c)=>{o[l]=decodeURIComponent(i[c+1])}),o}async#o(t,s){if(!this.#t)return;let n={loading:!0,data:null,error:null,params:s},r=this.#a;if(!r||r.tagName.toLowerCase()!==t.component?(r=document.createElement(t.component),this.#a=r,r.routeData={...n},this.#t.innerHTML="",this.#t.appendChild(r)):r.routeData={...n},t.loader){try{let a=await t.loader(s);n.loading=!1,n.data=a}catch(a){n.loading=!1,n.error=a}r.routeData={...n}}else n.loading=!1,r.routeData={...n}}addRoute(t){this.#e.push(t)}removeRoute(t){this.#e=this.#e.filter(s=>s.path!==t)}get routes(){return[...this.#e]}get useHash(){return this.#s}};V.instance=null;var ne=class extends _{static tag="router-outlet";connectedCallback(){super.connectedCallback(),V.instance&&V.instance.setOutlet(this)}render(){return null}};Fe(ne);var re=class extends _{static tag="router-link";static shadow=!0;static properties={to:{type:String},replace:{type:Boolean,default:!1}};#e=t=>{t.preventDefault(),V.instance&&this.to&&V.instance.navigate(this.to,{replace:this.replace})};get href(){return this.to?V.instance&&V.instance.useHash?`#${this.to}`:this.to:"#"}render(){return d`
      <style>
        :host {
          display: block;
        }
        a {
          color: inherit;
          text-decoration: inherit;
          display: block;
          cursor: pointer;
        }
      </style>
      <a href="${this.href}" on-click=${this.#e}>
        <slot></slot>
      </a>
    `}};Fe(re);function Xe(e){return new V(e).start()}function et(e,t){V.instance?V.instance.navigate(e,t):console.warn("No router instance found")}var cn="stockroom-local-device";var De=["lots","sales","watchlist","quotes","histories","settings"],me;async function Ht(){let[e,t,s,n,r,a]=await Promise.all([ae("lots"),ae("sales"),ae("watchlist"),ae("quotes"),ae("histories"),ae("settings")]);return{lots:e.sort((i,o)=>String(o.purchasedAt??"").localeCompare(String(i.purchasedAt??""))),sales:t.sort((i,o)=>String(o.soldAt??"").localeCompare(String(i.soldAt??""))),watchlist:s.sort((i,o)=>String(i.symbol??"").localeCompare(String(o.symbol??""))),quotes:Object.fromEntries(n.map(i=>[i.symbol,i])),histories:Object.fromEntries(r.map(i=>[i.symbol,i])),settings:Object.fromEntries(a.map(i=>[i.key,i.value]))}}async function Vt(e){await ye("lots",e)}async function Wt(e){await nt("lots",e)}async function Kt(e){await ye("sales",e)}async function Qt(e){await nt("sales",e)}async function Gt(e){await ye("watchlist",e)}async function Yt(e){await nt("watchlist",e)}async function Jt(e){await ye("quotes",e)}async function st(e,t){await ye("settings",{key:e,value:t})}async function Zt(e){let t=await be();await new Promise((s,n)=>{let r=t.transaction(De,"readwrite");r.oncomplete=()=>s(),r.onerror=()=>n(r.error),r.onabort=()=>n(r.error);for(let a of De)r.objectStore(a).clear();for(let a of tt(e.lots))r.objectStore("lots").put(a);for(let a of tt(e.sales))r.objectStore("sales").put(a);for(let a of tt(e.watchlist))r.objectStore("watchlist").put(a);for(let a of zt(e.quotes))r.objectStore("quotes").put(a);for(let a of zt(e.histories))r.objectStore("histories").put(a);for(let[a,i]of Object.entries(e.settings??{}))r.objectStore("settings").put({key:a,value:i})})}async function Xt(){let e=await be();await new Promise((t,s)=>{let n=e.transaction(De,"readwrite");n.oncomplete=()=>t(),n.onerror=()=>s(n.error),n.onabort=()=>s(n.error);for(let r of De)n.objectStore(r).clear()})}async function ae(e){let t=await be();return await new Promise((s,n)=>{let a=t.transaction(e,"readonly").objectStore(e).getAll();a.onsuccess=()=>s(a.result??[]),a.onerror=()=>n(a.error)})}async function ye(e,t){let s=await be();await new Promise((n,r)=>{let a=s.transaction(e,"readwrite");a.oncomplete=()=>n(),a.onerror=()=>r(a.error),a.onabort=()=>r(a.error),a.objectStore(e).put(t)})}async function nt(e,t){let s=await be();await new Promise((n,r)=>{let a=s.transaction(e,"readwrite");a.oncomplete=()=>n(),a.onerror=()=>r(a.error),a.onabort=()=>r(a.error),a.objectStore(e).delete(t)})}function be(){return me||(me=new Promise((e,t)=>{let s=indexedDB.open(cn,2);s.onerror=()=>{me=void 0,t(s.error)},s.onblocked=()=>{console.warn("Stockroom: databasen uppgraderas men en annan flik h\xE5ller den \xF6ppen.")},s.onsuccess=()=>{let n=s.result;n.onversionchange=()=>{n.close(),me=void 0},e(n)},s.onupgradeneeded=()=>{let n=s.result;if(!n.objectStoreNames.contains("lots")){let r=n.createObjectStore("lots",{keyPath:"id"});r.createIndex("symbol","symbol",{unique:!1}),r.createIndex("purchasedAt","purchasedAt",{unique:!1})}if(!n.objectStoreNames.contains("sales")){let r=n.createObjectStore("sales",{keyPath:"id"});r.createIndex("symbol","symbol",{unique:!1}),r.createIndex("soldAt","soldAt",{unique:!1})}n.objectStoreNames.contains("watchlist")||n.createObjectStore("watchlist",{keyPath:"symbol"}),n.objectStoreNames.contains("quotes")||n.createObjectStore("quotes",{keyPath:"symbol"}),n.objectStoreNames.contains("histories")||n.createObjectStore("histories",{keyPath:"symbol"}),n.objectStoreNames.contains("settings")||n.createObjectStore("settings",{keyPath:"key"})}})),me}function tt(e){return Array.isArray(e)?e:[]}function zt(e){return Array.isArray(e)?e:Object.values(e??{})}function O(e){return String(e??"").trim().toUpperCase().replace(/\s+/g,"")}async function je(e){let t=[...new Set(e.map(O).filter(Boolean))];return t.length===0?{quotes:[],errors:[]}:await es(`/api/quotes?symbols=${encodeURIComponent(t.join(","))}`)}async function rt(e){let t=e.trim();return t?(await es(`/api/search?q=${encodeURIComponent(t)}`)).results??[]:[]}async function es(e){let t=new AbortController,s=setTimeout(()=>t.abort(),12e3);try{let n=await fetch(e,{headers:{Accept:"application/json"},signal:t.signal}),r=await n.text();if(!n.ok)throw new Error(r||`F\xF6rfr\xE5gan misslyckades med ${n.status}`);return JSON.parse(r)}catch(n){throw n.name==="AbortError"?new Error("F\xF6rfr\xE5gan om marknadsdata tog f\xF6r l\xE5ng tid"):n}finally{clearTimeout(s)}}var un="/sync";function at(e={}){let t=(e.baseUrl||un).replace(/\/$/,""),s=e.fetch||globalThis.fetch.bind(globalThis),n=e.EventSource||(typeof EventSource<"u"?EventSource:null),r=new Map,a=new Map,i=!1,o=!1,l=null,c=!1,f=500;function m(S,j){r.set(S,j),i&&x(S,0)}async function y(S){if(!n||!i||a.has(S))return;let j=r.get(S);if(!j)return;let p=await j.getCursor();if(!i||!r.has(S)||a.has(S))return;let h=`${t}/${encodeURIComponent(S)}/stream?since=${p}`,k=new n(h);a.set(S,k),k.addEventListener("change",async w=>{try{let C=JSON.parse(w.data);await j.onServerRow(C.row,C.cursor)}catch(C){console.warn("[bedrockjs/sync] bad SSE payload",C)}}),k.onerror=()=>{}}function x(S,j){setTimeout(()=>{y(S).catch(p=>{console.warn(`[bedrockjs/sync] stream setup failed for "${S}"`,p),i&&r.has(S)&&!a.has(S)&&x(S,f)})},j)}function b(){if(!i){i=!0;for(let S of r.keys())x(S,0);typeof globalThis.addEventListener=="function"&&globalThis.addEventListener("online",()=>F(0)),F(0)}}function g(){i=!1;for(let S of a.values())S.close();a.clear()}function F(S=f){o||(o=!0,setTimeout(()=>{o=!1,M().catch(()=>{f=Math.min(f*2,3e4),F()})},S))}async function M(){return l?(c=!0,l):(l=(async()=>{try{do c=!1,await P();while(c)}finally{l=null}})(),l)}async function P(){if(typeof navigator<"u"&&navigator.onLine===!1)return;let S=!1;for(let[j,p]of r.entries()){let h=await p.getOutbox();if(!h||h.length===0)continue;let k=h.map(H=>H.op),w=await s(`${t}/${encodeURIComponent(j)}/ops`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({protocol:1,ops:k})});if(!w.ok)throw new Error(`sync POST failed: ${w.status}`);let C=await w.json(),z=[];for(let H=0;H<h.length;H++){let v=C.results[H];v&&(v.status==="applied"||v.status==="duplicate"?(z.push(h[H].seq),v.row&&v.cursor!=null&&await p.onServerRow(v.row,v.cursor)):v.status==="rejected"&&(z.push(h[H].seq),p.onRejected?.(v.opId,v.error||"rejected")))}z.length&&await p.ackOutbox(z),S=!0}S&&(f=500)}return{registerModel:m,start:b,stop:g,drain:M,scheduleDrain:F,get baseUrl(){return t}}}var J="__outbox__",ie="__cursor__",ss=new Map;function it(e,t){let s=ss.get(e);if(!s)return s={models:new Set(t),db:null,promise:Promise.resolve(null)},s.promise=Ee(e,s,void 0),ss.set(e,s),s.promise;for(let n of t)s.models.add(n);return s.promise=s.promise.catch(()=>null).then(n=>as(n,e,s)),s.promise}function Ee(e,t,s){return dn(e,[...t.models],s).then(n=>(t.db=n,n.onversionchange=()=>{is(t,n)},n))}function dn(e,t,s){return new Promise((n,r)=>{let a=s===void 0?indexedDB.open(e):indexedDB.open(e,s);a.onupgradeneeded=()=>{let i=a.result;i.objectStoreNames.contains(J)||i.createObjectStore(J,{keyPath:"seq",autoIncrement:!0}),i.objectStoreNames.contains(ie)||i.createObjectStore(ie);for(let o of t)i.objectStoreNames.contains(o)||i.createObjectStore(o,{keyPath:"id"})},a.onsuccess=()=>n(a.result),a.onerror=()=>r(a.error),a.onblocked=()=>{console.warn(`[bedrockjs/sync] IndexedDB upgrade for "${e}" is blocked by another open tab or connection`)}})}async function as(e,t,s){if((!e||s.db!==e)&&(e=await Ee(t,s,void 0)),[...s.models].filter(i=>!e.objectStoreNames.contains(i)).length===0)return e;let a=e.version+1;is(s,e);try{return await Ee(t,s,a)}catch(i){if(i&&typeof i=="object"&&i.name==="VersionError"){let o=await Ee(t,s,void 0);return as(o,t,s)}throw i}}function is(e,t){e.db===t&&(e.db=null),t.onversionchange=null,t.close()}function Ie(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function os(e){return new Promise((t,s)=>{e.oncomplete=()=>t(void 0),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function qe(e,t,s,n,r){let a=e.transaction([t,J],"readwrite"),i=a.objectStore(t);s?i.put(s):n&&i.delete(n);let o=a.objectStore(J).add({op:r});return Promise.all([Ie(o),os(a)]).then(([l])=>l)}function ls(e,t,s,n){return new Promise((r,a)=>{let i=e.transaction([t,ie],"readwrite"),o=i.objectStore(t),l=i.objectStore(ie),c=o.get(s.id),f=l.get(t),m=null,y=0,x=!1,b=!1,g=s;function F(){!x||!b||(g=fn(m,s),o.put(g),l.put(Math.max(y,n),t))}c.onsuccess=()=>{m=c.result??null,x=!0,F()},f.onsuccess=()=>{let M=f.result;y=typeof M=="number"?M:0,b=!0,F()},i.oncomplete=()=>r(g),i.onerror=()=>a(i.error),i.onabort=()=>a(i.error||new Error("transaction aborted"))})}async function cs(e,t){let s=e.transaction(ie,"readonly"),n=await Ie(s.objectStore(ie).get(t));return typeof n=="number"?n:0}async function us(e,t){let s=e.transaction(t,"readonly");return await Ie(s.objectStore(t).getAll())}async function ds(e){let t=e.transaction(J,"readonly");return await Ie(t.objectStore(J).getAll())}async function fs(e,t){let s=e.transaction(J,"readwrite"),n=s.objectStore(J);for(let r of t)n.delete(r);await os(s)}function fn(e,t){if(!e)return t;let s=rs(t);if((e.deletedAt??0)>s)return hn(e,t);if(t.deletedAt){let r=rs(e);return!e.deletedAt&&r>t.deletedAt?ns(e,t):t}return ns(e,t)}function ns(e,t){let s={...t.data??{}},n={...t.fieldTs??{}};for(let[r,a]of Object.entries(e.data??{})){let i=e.fieldTs?.[r]??0,o=n[r]??0;i>o&&(s[r]=a,n[r]=i)}return{id:t.id,rev:Math.max(e.rev??0,t.rev??0),serverTs:Math.max(e.serverTs??0,t.serverTs??0),fieldTs:n,data:s}}function hn(e,t){return{...e,rev:Math.max(e.rev??0,t.rev??0),serverTs:Math.max(e.serverTs??0,t.serverTs??0)}}function rs(e){let t=e.deletedAt??0;for(let s of Object.values(e.fieldTs??{}))s>t&&(t=s);return t}function Pe(){let e=globalThis.crypto;return e&&typeof e.randomUUID=="function"?e.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}var ot=0;function Oe(){let e=Date.now();return ot=Math.max(e,ot+1),ot}function lt(e,t,s){let n=s.dbName||"bedrockjs-sync",r=ee([]),a=new Map,i=new Map;function o(p){return{id:p.id,rev:p.rev,...p.data}}function l(p){if(p.deletedAt){if(i.set(p.id,p),!a.get(p.id))return;a.delete(p.id);let C=r.findIndex(z=>z.id===p.id);C>=0&&r.splice(C,1);return}i.set(p.id,p);let h=o(p),k=a.get(p.id);if(k){for(let w of Object.keys(h))k[w]!==h[w]&&(k[w]=h[w]);for(let w of Object.keys(k))w in h||delete k[w]}else r.push(h),a.set(p.id,r[r.length-1])}async function c(p){try{return await p(await it(n,[e]))}catch(h){if(!pn(h))throw h;return await p(await it(n,[e]))}}let f=(async()=>{let p=await c(h=>us(h,e));for(let h of p)l(h)})();function m(p,h){let k=Oe(),w={};for(let C of Object.keys(h))w[C]=k;return{id:p,rev:0,serverTs:k,fieldTs:w,data:h}}async function y(p){if(!p||typeof p.id!="string")throw new Error(`${e}.create: 'id' (string) is required`);await f;let h=hs(t,p),k=m(p.id,h),w={opId:Pe(),type:"create",model:e,id:p.id,data:h,clientTs:k.serverTs};return l(k),await c(C=>qe(C,e,k,null,w)),s.client.scheduleDrain(0),o(k)}async function x(p,h){await f;let k=a.get(p);if(!k)throw new Error(`${e}.update: no record ${p}`);let w=i.get(p),C=hs(t,h),z=Oe(),H={...w?.data??ps(k),...C},v={...w?.fieldTs??{}};for(let he of Object.keys(C))v[he]=z;let L={id:p,rev:w?.rev??k.rev??0,serverTs:z,fieldTs:v,data:H};l(L);let fe={opId:Pe(),type:"update",model:e,id:p,patch:C,clientTs:z};return await c(he=>qe(he,e,L,null,fe)),s.client.scheduleDrain(0),o(L)}async function b(p){await f;let h=a.get(p);if(!h)return;let k=i.get(p),w=Oe(),C={id:p,rev:k?.rev??h.rev??0,serverTs:w,fieldTs:k?.fieldTs??{},deletedAt:w,data:k?.data??ps(h)};l(C);let z={opId:Pe(),type:"delete",model:e,id:p,clientTs:w};await c(H=>qe(H,e,C,null,z)),s.client.scheduleDrain(0)}function g(p){let h=a.get(p);if(h)return h;r.length}function F(){return r}function M(p){return r.filter(p)}let P=new Set;function S(p){return P.add(p),p(r),()=>P.delete(p)}function j(){for(let p of P)p(r)}return s.client.registerModel(e,{onServerRow:async(p,h)=>{let k=await c(w=>ls(w,e,p,h));l(k),j()},getCursor:async()=>await c(p=>cs(p,e)),getOutbox:async()=>(await c(h=>ds(h))).filter(h=>h.op.model===e),ackOutbox:async p=>{await c(h=>fs(h,p))}}),{name:e,schema:t,ready:f,create:y,update:x,delete:b,get:g,all:F,where:M,subscribe:S}}function hs(e,t){let s={};for(let[n,r]of Object.entries(e.fields))if(!(n==="id"||n==="rev")&&n in t){let a=t[n];r==="datetime"&&a instanceof Date&&(a=a.toISOString()),s[n]=a}return s}function ps(e){let{id:t,rev:s,...n}=e;return n}function pn(e){let t=e&&typeof e=="object"?e.name:"";return t==="InvalidStateError"||t==="NotFoundError"}var ys="history",gn="stockroom-sync",mn=5*6e4,ve=at({baseUrl:"/sync"}),bs=new Map,yn=ve.registerModel.bind(ve);ve.registerModel=(e,t)=>{bs.set(e,t),yn(e,t)};var ct=lt(ys,{fields:{id:"string",rev:"number",symbol:"string",name:"string",currency:"string",interval:"string",from:"string",to:"string",count:"number",points:"string",updatedAt:"datetime",source:"string"}},{client:ve,dbName:gn});typeof window<"u"&&ve.start();var Me=new Map;function vs(e,t={}){let s=O(e);if(!s)return Promise.reject(new Error("Symbol saknas"));let n=Me.get(s),r=t.maxAgeMs??mn;if(n&&!t.refresh&&Date.now()-n.at<r)return n.promise;let a=(async()=>{let i=new URLSearchParams({symbol:s});t.refresh&&i.set("refresh","1");let o=await fetch(`/api/history?${i}`,{headers:{Accept:"application/json"}}),l=await o.text();if(!o.ok)throw new Error(vn(l)??`Kurshistorik f\xF6r ${s} kunde inte h\xE4mtas (${o.status})`);let c=JSON.parse(l);return c.row&&await bs.get(ys)?.onServerRow(c.row,0),c})();return Me.set(s,{at:Date.now(),promise:a}),a.catch(()=>{Me.get(s)?.promise===a&&Me.delete(s)}),a}var gs=new Map;function ut(e){let t=O(e),s=ct.get(t);if(!s)return null;let n=s.points;if(typeof n!="string")return null;let r=gs.get(t);return(!r||r.source!==n)&&(r={source:n,points:bn(n)},gs.set(t,r)),{symbol:s.symbol??t,name:s.name??"",currency:s.currency??"",interval:s.interval??"1d",updatedAt:s.updatedAt??"",source:s.source??"",points:r.points}}var ms={"1mo":31,"3mo":92,"6mo":183,"1y":366,"2y":731,"5y":1/0};function $s(e,t){let s=ms[t]??ms["6mo"];if(!Number.isFinite(s))return e;let n=new Date(Date.now()-s*864e5).toISOString().slice(0,10);return e.filter(r=>r.date>=n)}function ws(e,t,s=1){let n=Number(t?.price);if(!Number.isFinite(n)||n<=0||e.length===0)return e;let r=t.marketTime?String(t.marketTime).slice(0,10):new Date().toISOString().slice(0,10),a=e.at(-1);if(!a||r<a.date)return e;let i={date:r,close:n*s};return r===a.date?[...e.slice(0,-1),i]:[...e,i]}function bn(e){try{let t=JSON.parse(e);return Array.isArray(t)?t.map(s=>Array.isArray(s)?{date:String(s[0]),close:Number(s[1])}:{date:String(s?.date??""),close:Number(s?.close)}).filter(s=>s.date&&Number.isFinite(s.close)&&s.close>0):[]}catch{return[]}}function vn(e){try{let t=JSON.parse(e);return typeof t?.error=="string"?t.error:null}catch{return e||null}}var $e="SEK",$=$e,G=1e-6,Be=["SEK","EUR","USD","NOK","DKK","GBP","CHF","CAD","JPY"],oe=["SEK","EUR","USD"];function le(e){let t=Number(e?.fxRate);return Number.isFinite(t)&&t>0?t:1}function we(e){return A(e?.currency)||$}function _e(e){return(Number(e?.price)||0)*le(e)}function xe(e,t){let s=Math.max(0,Number(e?.quantity)||0),n=Math.max(0,Number(e?.price)||0),r=Math.max(0,Number(e?.fees)||0),a=s*n;return(t==="buy"?a+r:a-r)*le(e)}function Q(e){let t=Number(e);return Number.isFinite(t)?Math.round(t*1e6)/1e6:0}function ke(e,t){let s=[...e.map(x=>({type:"buy",date:x.purchasedAt??"",order:0,createdAt:x.createdAt??"",record:x})),...t.map(x=>({type:"sell",date:x.soldAt??"",order:1,createdAt:x.createdAt??"",record:x}))].sort($n),n=0,r=0,a=0,i=0,o=0,l=0,c=0,f=new Map,m=[];for(let x of s){let b=x.record,g=Math.max(0,Number(b.quantity)||0),F=le(b),M=Math.max(0,Number(b.price)||0)*F,P=Math.max(0,Number(b.fees)||0)*F;if(x.type==="buy")n+=g,r+=g*M+P,c+=g*M+P;else{let S=n,j=n>G?r/n:0,p=Math.min(g,Math.max(0,n)),h=j*p,k=g*M-P,w=k-h;n-=g,r=Math.max(0,r-h),a+=w,i+=h,o+=g,l+=k,f.set(b.id,{sharesBefore:S,averageCost:j,costBasis:h,netProceeds:k,gain:w,gainPercent:h>0?w/h*100:0,sharesAfter:Math.max(0,n)})}Math.abs(n)<G?(n=0,r=0):n<0&&(r=0),m.push({event:x,shares:n})}let y=Math.max(0,n);return{shares:y,cost:r,averageCost:y>0?r/y:0,realized:a,realizedCost:i,realizedPercent:i>0?a/i*100:0,soldShares:o,proceeds:l,boughtCost:c,buyCount:e.length,sellCount:t.length,saleResults:f,timeline:m}}function xs(e,t,s){let n=Ss(s),r=ke(e,[...t,n]),a=!1,i=1/0;for(let o of r.timeline)o.event.record===n&&(a=!0),a&&(i=Math.min(i,o.shares));return i===1/0?0:Q(Math.max(0,i))}function ks(e,t,s){let n={...Ss(s.soldAt),...s,id:dt},r=ke(e,[...t,n]);return{...r.saleResults.get(dt),remainingShares:r.shares,remainingCost:r.cost}}var dt="__stockroom_probe__";function Ss(e){return{id:dt,quantity:0,price:0,fees:0,soldAt:e||"",createdAt:"~~~~"}}function $n(e,t){return e.date!==t.date?e.date<t.date?-1:1:e.order!==t.order?e.order-t.order:e.createdAt!==t.createdAt?e.createdAt<t.createdAt?-1:1:0}function Rs(e,t,s,n,r={},a=[]){let i=new Set(t.map(o=>o.symbol));for(let o of e)i.add(o.symbol);for(let o of a)i.add(o.symbol);return[...i].map(o=>{let l=e.filter(w=>w.symbol===o).sort((w,C)=>C.purchasedAt.localeCompare(w.purchasedAt)),c=a.filter(w=>w.symbol===o).sort((w,C)=>C.soldAt.localeCompare(w.soldAt)),f=ke(l,c),m=s[o],y=ht(m?.currency,r),x=wn(Number.isFinite(m?.price)?m.price:0,m?.currency,r),b=f.shares,g=f.cost,F=b*x,M=F-g,P=g>0?M/g*100:0,S=Number.isFinite(m?.previousClose)?m.previousClose*y:x,j=b*(x-S),p=S>0?(x-S)/S*100:0,h=b>G,k=l.length>0||c.length>0;return{symbol:o,name:m?.name??o,quote:m,lots:l,sales:c,ledger:f,history:xn(n[o],m?.currency,r),sourceCurrency:m?.currency??$e,conversionRate:y,shares:b,cost:g,averageCost:f.averageCost,price:x,marketValue:F,gain:M,gainPercent:P,dayChange:j,dayChangePercent:p,realized:f.realized,realizedCost:f.realizedCost,realizedPercent:f.realizedPercent,soldShares:f.soldShares,proceeds:f.proceeds,sellCount:f.sellCount,buyCount:f.buyCount,isHolding:h,hasTrades:k,isClosed:k&&!h}}).sort((o,l)=>l.marketValue!==o.marketValue?l.marketValue-o.marketValue:o.symbol.localeCompare(l.symbol))}function As(e){let t=e.filter(y=>y.isHolding),s=e.filter(y=>y.sellCount>0),n=te(t.map(y=>y.marketValue)),r=te(t.map(y=>y.cost)),a=n-r,i=te(t.map(y=>y.dayChange)),o=te(e.map(y=>y.realized)),l=te(e.map(y=>y.realizedCost)),c=te(e.map(y=>y.proceeds)),f=t.toSorted((y,x)=>x.gainPercent-y.gainPercent)[0],m=t.toSorted((y,x)=>y.gainPercent-x.gainPercent)[0];return{holdingsCount:t.length,trackedCount:e.length,closedCount:e.filter(y=>y.isClosed).length,totalValue:n,totalCost:r,totalGain:a,totalGainPercent:r>0?a/r*100:0,dayChange:i,dayChangePercent:n-i>0?i/(n-i)*100:0,cashBasis:r,realized:o,realizedCost:l,realizedPercent:l>0?o/l*100:0,proceeds:c,salesCount:te(e.map(y=>y.sellCount)),tradedCount:s.length,totalReturn:a+o,best:f,worst:m}}function E(e,t=$e){let s=Number.isFinite(e)?e:0;try{return new Intl.NumberFormat("sv-SE",{style:"currency",currency:t,maximumFractionDigits:Math.abs(s)>=1e3?0:2}).format(s)}catch{return`${s.toFixed(2)} ${t}`}}function ft(e,t=$e){let s=Number.isFinite(e)?e:0,n=E(Math.abs(s),t);return s>.004?`+${n}`:s<-.004?`\u2212${n}`:n}function wn(e,t,s={}){return(Number.isFinite(e)?e:0)*ht(t,s)}function ce(e,t,s={}){let n=Number.isFinite(e)?e:0,r=A(t);if(!r||r===$)return n;let a=s[r];return!Number.isFinite(a)||a<=0?null:n/a}function ht(e,t={}){let s=A(e);return!s||s===$e?1:Number.isFinite(t[s])?t[s]:1}function ue(e,t=2){let s=Number.isFinite(e)?e:0;return new Intl.NumberFormat("sv-SE",{minimumFractionDigits:t,maximumFractionDigits:t}).format(s)}function I(e){let t=Number.isFinite(e)?e:0;return new Intl.NumberFormat("sv-SE",{minimumFractionDigits:0,maximumFractionDigits:4}).format(t)}function D(e){let t=Number.isFinite(e)?e:0;return`${new Intl.NumberFormat("sv-SE",{signDisplay:"exceptZero",minimumFractionDigits:2,maximumFractionDigits:2}).format(t)}%`}function W(e){if(!e)return"\u2013";let t=new Date(`${e}T00:00:00`);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("sv-SE",{day:"numeric",month:"short",year:"numeric"}).format(t)}function R(e){return e>1e-4?"positive":e<-1e-4?"negative":"neutral"}function pt(e,t=180,s=56){let n=e.map(l=>l.close).filter(l=>Number.isFinite(l)&&l>0);if(n.length<2)return"";let r=Math.min(...n),i=Math.max(...n)-r||1,o=t/(n.length-1);return n.map((l,c)=>{let f=c*o,m=s-(l-r)/i*s;return`${c===0?"M":"L"} ${f.toFixed(2)} ${m.toFixed(2)}`}).join(" ")}function te(e){return e.reduce((t,s)=>t+(Number(s)||0),0)}function xn(e,t,s){if(!e?.points)return e;let n=ht(t,s);return n===1?e:{...e,points:e.points.map(r=>({...r,open:Le(r.open,n),high:Le(r.high,n),low:Le(r.low,n),close:Le(r.close,n)}))}}function Le(e,t){return Number.isFinite(e)?e*t:e}function A(e){return String(e??"").trim().toUpperCase()}function Se(e){let t=String(e??"").trim(),n={GBp:["GBP",100],GBX:["GBP",100],ZAc:["ZAR",100],ILA:["ILS",100]}[t];return n?{currency:n[0],divisor:n[1]}:{currency:A(t),divisor:1}}var u=ee({ready:!1,lots:[],sales:[],watchlist:[],quotes:{},fxRates:{},settings:{refreshMinutes:5,lastRefresh:"",displayCurrency:$},refreshing:!1,error:"",notice:"",searchResults:[],searchLoading:!1,sellRequest:null,historyStatus:{}});re.register();ne.register();var Ns=(navigator.languages?.[0]??navigator.language??"").toLowerCase().startsWith("sv")?{lead:"Vill du ha en b\xE4ttre budgetapp?",link:"Testa Sambokoll"}:{lead:"Want a better budgeting app?",link:"Try Sambokoll"},vt=class extends _{static tag="app-root";refresh=()=>{Us({forceHistory:!1})};render(){let t=Y();return d`
      <div class="app-shell">
        <aside class="promo-strip">
          <span>${Ns.lead}</span>
          <a
            href="https://sambokoll.se"
            target="_blank"
            rel="noopener"
          >${Ns.link} →</a>
        </aside>

        <header class="topbar">
          <router-link class="brand-link" to="/" title="Till översikten">
            <span class="brand-block">
              <img
                class="brand-logo"
                src="/logo-96.png"
                width="42"
                height="42"
                alt="Stockroom"
              />
              <span class="brand-text">
                <span class="brand-title">Stockroom</span>
                <span class="brand-subtitle">portfölj på enheten</span>
              </span>
            </span>
          </router-link>

          <nav class="nav-tabs">
            <router-link to="/">Översikt</router-link>
            <router-link to="/holdings">Innehav</router-link>
            <router-link to="/transactions">Transaktioner</router-link>
            <router-link to="/research">Sök</router-link>
            <router-link to="/settings">Inställningar</router-link>
          </nav>

          <div class="topbar-actions">
            <div class="segmented" role="group" aria-label="Visningsvaluta">
              ${oe.map(s=>q(s,d`
                    <button
                      type="button"
                      class="${`segment ${t===s?"active":""}`}"
                      aria-pressed="${t===s}"
                      title="${`Visa portf\xF6ljen i ${s}`}"
                      on-click="${()=>Ps(s)}"
                    >
                      ${s}
                    </button>
                  `))}
            </div>
            <button
              class="refresh-button"
              on-click="${this.refresh}"
              disabled="${u.refreshing}"
            >
              ${u.refreshing?"Uppdaterar":"Uppdatera"}
            </button>
          </div>
        </header>

        ${u.error?d`
            <div class="status-banner error">
              <span>${u.error}</span>
              <button on-click="${()=>u.error=""}">Stäng</button>
            </div>
          `:""} ${u.notice?d`
            <div class="status-banner notice">
              <span>${u.notice}</span>
              <button on-click="${()=>u.notice=""}">Stäng</button>
            </div>
          `:""}

        <main class="workspace">
          ${u.ready?d`
              <router-outlet></router-outlet>
            `:d`
              <section class="loading-panel">Laddar lokal portfölj...</section>
            `}
        </main>

        ${u.sellRequest?d`
            <sell-dialog></sell-dialog>
          `:""}
      </div>
    `}},$t=class extends _{static tag="dashboard-page";render(){let t=Z(),s=As(t),n=t.filter(a=>a.isHolding),r=t.filter(a=>a.sellCount>0).sort((a,i)=>i.realized-a.realized);return d`
      <section class="dashboard-grid">
        <div class="summary-band">
          <article class="metric primary-metric">
            <span class="metric-label">Portföljvärde</span>
            <strong>${N(s.totalValue)}</strong>
            <span class="${`metric-delta ${R(s.totalGain)}`}">
              ${B(s.totalGain)} · ${D(s.totalGainPercent)} orealiserat
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">Dagens rörelse</span>
            <strong class="${R(s.dayChange)}">
              ${B(s.dayChange)}
            </strong>
            <span class="${`metric-delta ${R(s.dayChange)}`}">
              ${D(s.dayChangePercent)}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">Realiserat</span>
            <strong class="${R(s.realized)}">
              ${B(s.realized)}
            </strong>
            <span class="${`metric-delta ${s.salesCount?R(s.realized):"neutral"}`}">
              ${s.salesCount?`${D(s.realizedPercent)} \xB7 ${X(s.salesCount,"f\xF6rs\xE4ljning","f\xF6rs\xE4ljningar")}`:"inga f\xF6rs\xE4ljningar \xE4nnu"}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">Anskaffningsvärde</span>
            <strong>${N(s.totalCost)}</strong>
            <span class="metric-delta neutral">${X(s.holdingsCount,"innehav","innehav")}</span>
          </article>
          <article class="metric">
            <span class="metric-label">Totalt resultat</span>
            <strong class="${R(s.totalReturn)}">
              ${B(s.totalReturn)}
            </strong>
            <span
              class="metric-delta neutral">realiserat + orealiserat · ${Kn()}</span>
          </article>
        </div>

        <section class="panel holdings-panel">
          <div class="panel-heading">
            <div>
              <h2>Innehav</h2>
              <p>${n.length?"\xD6ppna positioner sorterade efter marknadsv\xE4rde. S\xE4lj hela eller delar av ett innehav direkt fr\xE5n raden.":"Inga \xF6ppna innehav \xE4nnu."}</p>
            </div>
            ${n.length?d`
                <button
                  type="button"
                  class="sell-button"
                  on-click="${()=>Ae()}"
                >
                  Sälj innehav
                </button>
              `:""}
          </div>
          ${n.length?d`
              <position-table .positions="${n}"></position-table>
            `:K("L\xE4gg till ditt f\xF6rsta k\xF6p f\xF6r att b\xF6rja f\xF6lja resultatet.")}
        </section>

        <section class="panel add-panel">
          <div class="panel-heading">
            <div>
              <h1>Lägg till köp</h1>
              <p>
                Registrera symbol, antal och pris i affärens valuta. Växelkursen
                på köpdagen hämtas automatiskt.
              </p>
            </div>
          </div>
          <add-lot-form></add-lot-form>
        </section>

        <section class="panel allocation-panel">
          <div class="panel-heading">
            <div>
              <h2>Fördelning</h2>
              <p>Aktuell vikt baserad på marknadsvärde.</p>
            </div>
          </div>
          ${n.length?Jn(n,s.totalValue):K("F\xF6rdelningen visas efter minst ett sparat k\xF6p.")}
        </section>

        <section class="panel movers-panel">
          <div class="panel-heading">
            <div>
              <h2>Utveckling</h2>
              <p>Bästa och svagaste orealiserade avkastning.</p>
            </div>
          </div>
          ${s.best?d`
              <div class="mover-grid">
                ${Fs("B\xE4st",s.best)} ${Fs("Svagast",s.worst)}
              </div>
            `:K("Utveckling visas n\xE4r kurserna har laddats.")}
        </section>

        <section class="panel realized-panel">
          <div class="panel-heading">
            <div>
              <h2>Realiserat per innehav</h2>
              <p>Resultat från försäljningar enligt genomsnittsmetoden.</p>
            </div>
            ${r.length?d`
                <router-link class="panel-link"
                  to="/transactions">Alla transaktioner</router-link>
              `:""}
          </div>
          ${r.length?Zn(r):K("H\xE4r samlas resultatet n\xE4r du s\xE4ljer hela eller delar av ett innehav.")}
        </section>
      </section>
    `}},wt=class extends _{static tag="add-lot-form";static properties={symbol:{type:String,default:""},quantity:{type:String,default:""},price:{type:String,default:""},currency:{type:String,default:$},fxRate:{type:String,default:"1"},fxRateDirty:{type:Boolean,default:!1},purchasedAt:{type:String,default:U},fees:{type:String,default:"0"},note:{type:String,default:""},message:{type:String,default:""},suggestions:{type:Array,default:()=>[]},lookupLoading:{type:Boolean,default:!1},suggestionOpen:{type:Boolean,default:!1},busy:{type:Boolean,default:!1}};searchTimer=null;lookupToken=0;submit=async t=>{t.preventDefault();let s=O(this.symbol),n=Number(this.quantity),r=Number(this.price),a=Number(this.fees||0),i=A(this.currency)||$,o=i===$?1:Number(this.fxRate);if(!s||!Number.isFinite(n)||n<=0){this.message="Ange en aktiesymbol och ett positivt antal aktier.";return}if(!Number.isFinite(r)||r<=0){this.message=`Ange k\xF6ppriset per aktie i ${i}.`;return}if(!Number.isFinite(o)||o<=0){this.message=`Ange v\xE4xelkursen (SEK per ${i}).`;return}this.busy=!0;try{await On({symbol:s,quantity:n,price:r,currency:i,fxRate:o,purchasedAt:this.purchasedAt||U(),fees:Number.isFinite(a)&&a>0?a:0,note:this.note.trim()}),this.message=`Sparade ${I(n)} ${s} \xE0 ${E(r,i)}${i===$?"":` (${N(r*o)})`}.`,this.symbol="",this.quantity="",this.price="",this.currency=$,this.fxRate="1",this.fxRateDirty=!1,this.fees="0",this.note="",this.purchasedAt=U(),this.suggestions=[],this.suggestionOpen=!1}catch(l){this.message=l.message}finally{this.busy=!1}};handleSymbolInput=t=>{this.symbol=t.target.value.toUpperCase(),this.queueTickerSearch(this.symbol)};queueTickerSearch(t){clearTimeout(this.searchTimer);let s=O(t);if(!s){this.suggestions=[],this.suggestionOpen=!1,this.lookupLoading=!1;return}this.searchTimer=setTimeout(()=>{this.runTickerSearch(s)},180)}async runTickerSearch(t){if(!this.symbolInputFocused())return;let s=++this.lookupToken;this.lookupLoading=!0,this.suggestionOpen=!0;try{let n=await rt(t);if(s!==this.lookupToken)return;this.suggestions=n.filter(r=>r.symbol).slice(0,7)}catch(n){if(s!==this.lookupToken)return;this.suggestions=[],this.message=n.message}finally{s===this.lookupToken&&(this.lookupLoading=!1)}}chooseTicker=async t=>{let s=O(t.symbol);s&&(clearTimeout(this.searchTimer),this.lookupToken+=1,this.symbol=s,this.suggestions=[],this.suggestionOpen=!1,this.lookupLoading=!1,await this.fillPrice())};closeSuggestions=()=>{clearTimeout(this.searchTimer),this.lookupToken+=1,this.lookupLoading=!1,setTimeout(()=>{this.suggestionOpen=!1},120)};symbolInputFocused(){let t=this.querySelector("input[role='combobox']");return!!t&&document.activeElement===t}fillPrice=async()=>{let t=O(this.symbol);if(!t){this.message="Ange en aktiesymbol f\xF6rst.";return}this.busy=!0;try{let s=await Os(t,this.purchasedAt||U());this.currency=s.currency,this.price=Tt(s.price),this.fxRate=Re(s.fxRate),this.fxRateDirty=!1,this.message=Ls(t,s)}catch(s){this.message=s.message}finally{this.busy=!1}};changeCurrency=t=>{this.currency=A(t.target.value)||$,this.fxRateDirty=!1,this.refreshFxRate()};changeDate=t=>{this.purchasedAt=t.target.value,this.fxRateDirty||this.refreshFxRate()};async refreshFxRate(){if(this.currency===$){this.fxRate="1";return}try{let t=await Dt(this.currency,this.purchasedAt||U());if(this.fxRateDirty)return;this.fxRate=Re(t.rate)}catch(t){this.message=t.message}}render(){let t=A(this.currency)||$,s=t!==$,n=Number(this.price),r=Number(this.quantity),a=s?Number(this.fxRate):1,i=Number(this.fees||0),o=Number.isFinite(n)&&Number.isFinite(r)&&Number.isFinite(a)&&n>0&&r>0&&a>0?(n*r+(Number.isFinite(i)?i:0))*a:null;return d`
      <form class="lot-form" novalidate on-submit="${this.submit}">
        <label class="ticker-field">
          <span>Aktiesymbol</span>
          <input
            autocomplete="off"
            inputmode="latin"
            role="combobox"
            aria-expanded="${this.suggestionOpen}"
            placeholder="AAPL"
            .value="${this.symbol}"
            on-input="${this.handleSymbolInput}"
            on-focus="${()=>this.symbol&&this.queueTickerSearch(this.symbol)}"
            on-blur="${this.closeSuggestions}"
          />
          ${this.suggestionOpen&&(this.lookupLoading||this.suggestions.length)?d`
              <div class="ticker-menu">
                ${this.lookupLoading?d`
                    <div class="ticker-menu-status">Söker...</div>
                  `:d`
                    <div class="ticker-options">
                      ${this.suggestions.map(l=>q(l.symbol,d`
                            <button
                              type="button"
                              class="ticker-option"
                              on-mousedown="${c=>c.preventDefault()}"
                              on-click="${()=>this.chooseTicker(l)}"
                            >
                              <strong>${l.symbol}</strong>
                              <span>${l.name}</span>
                              <small>${[l.exchange,l.type].filter(Boolean).join(" / ")}</small>
                            </button>
                          `))}
                    </div>
                  `}
              </div>
            `:""}
        </label>

        <label>
          <span>Antal</span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="12"
            .value="${this.quantity}"
            on-input="${l=>this.quantity=l.target.value}"
          />
        </label>

        <label>
          <span>Pris per aktie</span>
          <div class="input-action">
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              .value="${this.price}"
              on-input="${l=>this.price=l.target.value}"
            />
            ${Ys(t,this.changeCurrency)}
            <button type="button" on-click="${this.fillPrice}" disabled="${this.busy}">
              Hämta
            </button>
          </div>
        </label>

        <label>
          <span>Datum</span>
          <input
            type="date"
            max="${U()}"
            .value="${this.purchasedAt}"
            on-change="${this.changeDate}"
          />
        </label>

        <label>
          <span>Avgifter (${t})</span>
          <input
            type="number"
            min="0"
            step="any"
            .value="${this.fees}"
            on-input="${l=>this.fees=l.target.value}"
          />
        </label>

        ${s?d`
            <label>
              <span>Växelkurs · SEK per ${t}</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="10.50"
                .value="${this.fxRate}"
                on-input="${l=>{this.fxRate=l.target.value,this.fxRateDirty=!0}}"
              />
            </label>
          `:""}

        <label class="${s?"":"wide-field"}">
          <span>Anteckning</span>
          <input
            placeholder="Mäklare, tes, konto"
            .value="${this.note}"
            on-input="${l=>this.note=l.target.value}"
          />
        </label>

        <div class="form-actions">
          <button class="primary-button" type="submit" disabled="${this.busy}">
            ${this.busy?"H\xE4mtar":"Spara k\xF6p"}
          </button>
          <p>
            ${this.message||(o!==null?`Totalt ${N(o)}${s?` \xB7 ${E(n*r+(Number.isFinite(i)?i:0),t)} \xD7 ${ue(a,4)}`:""}`:"")}
          </p>
        </div>
      </form>
    `}},xt=class extends _{static tag="sell-dialog";static properties={symbol:{type:String,default:""},quantity:{type:String,default:""},price:{type:String,default:""},currency:{type:String,default:$},fxRate:{type:String,default:"1"},fxRateDirty:{type:Boolean,default:!1},soldAt:{type:String,default:U},fees:{type:String,default:"0"},note:{type:String,default:""},message:{type:String,default:""},busy:{type:Boolean,default:!1}};#e=!1;#t=!1;connectedCallback(){let t=Z().filter(r=>r.isHolding),s=O(u.sellRequest?.symbol??""),n=t.some(r=>r.symbol===s)?s:t[0]?.symbol??"";n&&this.selectSymbol(n),super.connectedCallback()}selectSymbol(t){this.symbol=O(t),this.quantity="",this.message="",this.fxRateDirty=!1;let n=this.position()?.quote,r=A(n?.currency)||$;this.currency=r,this.price=n&&Number.isFinite(n.price)&&n.price>0?Tt(n.price):"",r===$?this.fxRate="1":Number.isFinite(u.fxRates[r])?this.fxRate=Re(u.fxRates[r]):this.fxRate="",(!this.price||!this.fxRate)&&this.fetchPrice()}position(){return this.symbol?Z().find(t=>t.symbol===this.symbol)??null:null}available(t=this.position()){return t?xs(t.lots,t.sales,this.soldAt||U()):0}fractionQuantity(t,s=this.available()){if(s<=0)return 0;if(t>=1)return s;let n=s*t;return Q(Number.isInteger(s)?Math.floor(n):n)}setFraction=t=>{let s=this.fractionQuantity(t);this.quantity=s>0?String(s):"",this.message=""};fetchPrice=async()=>{if(this.symbol){this.busy=!0;try{let t=await Os(this.symbol,this.soldAt||U());this.currency=t.currency,this.price=Tt(t.price),this.fxRate=Re(t.fxRate),this.fxRateDirty=!1,this.message=Ls(this.symbol,t)}catch(t){this.message=t.message}finally{this.busy=!1}}};changeCurrency=t=>{this.currency=A(t.target.value)||$,this.fxRateDirty=!1,this.refreshFxRate()};changeDate=t=>{this.soldAt=t.target.value,this.message="",this.fxRateDirty||this.refreshFxRate()};async refreshFxRate(){if(this.currency===$){this.fxRate="1";return}try{let t=await Dt(this.currency,this.soldAt||U());if(this.fxRateDirty)return;this.fxRate=Re(t.rate)}catch(t){this.message=t.message}}submit=async t=>{t.preventDefault();let s=this.position(),n=Q(Number(this.quantity)),r=Number(this.price),a=Number(this.fees||0),i=this.soldAt||U(),o=A(this.currency)||$,l=o===$?1:Number(this.fxRate);if(!s){this.message="V\xE4lj ett innehav att s\xE4lja.";return}if(!Number.isFinite(n)||n<=0){this.message="Ange hur m\xE5nga aktier du s\xE5lde.";return}if(!/^\d{4}-\d{2}-\d{2}$/.test(i)){this.message="Ange ett giltigt f\xF6rs\xE4ljningsdatum.";return}let c=this.available(s);if(n>c+G){this.message=c>0?`Du hade bara ${I(c)} aktier i ${s.symbol} tillg\xE4ngliga ${W(i)}.`:`Du hade inga aktier i ${s.symbol} att s\xE4lja ${W(i)}.`;return}if(!Number.isFinite(r)||r<=0){this.message=`Ange f\xF6rs\xE4ljningspriset per aktie i ${o}.`;return}if(!Number.isFinite(l)||l<=0){this.message=`Ange v\xE4xelkursen (SEK per ${o}).`;return}if(!Number.isFinite(a)||a<0){this.message="Avgifter kan inte vara negativa.";return}this.busy=!0;try{let{result:f}=await Ln({symbol:s.symbol,quantity:n,price:r,currency:o,fxRate:l,fees:a,soldAt:i,note:this.note.trim()});u.notice=`S\xE5lde ${I(n)} ${s.symbol} f\xF6r ${N(f.netProceeds)}. Realiserat resultat ${B(f.gain)} (${D(f.gainPercent)}).`,this.close()}catch(f){this.message=f.message,this.busy=!1}};close=()=>{this.#e=!0;let t=this.querySelector("dialog");t?.open&&t.close(),Ts()};handleClose=()=>{this.#e=!0,Ts()};handleBackdropClick=t=>{t.target===t.currentTarget&&this.close()};updated(){let t=this.querySelector("dialog");if(t&&!t.open&&!this.#e&&this.isConnected&&t.showModal(),Gs(this,"select.sell-symbol",this.symbol),!this.#t){let s=this.querySelector("input[name='quantity']");s&&(s.focus(),this.#t=!0)}}render(){let t=Z(),s=t.filter(r=>r.isHolding),n=t.find(r=>r.symbol===this.symbol)??null;return d`
      <dialog
        class="sell-dialog"
        aria-labelledby="sell-dialog-title"
        on-close="${this.handleClose}"
        on-click="${this.handleBackdropClick}"
      >
        ${n?this.renderForm(n,s):this.renderEmpty()}
      </dialog>
    `}renderEmpty(){return d`
      <div class="sell-form">
        <div class="sell-head">
          <div>
            <h2 id="sell-dialog-title">Sälj innehav</h2>
            <p>Du har inga öppna innehav att sälja ännu.</p>
          </div>
          <button
            type="button"
            class="icon-button"
            aria-label="Stäng"
            on-click="${this.close}"
          >
            ×
          </button>
        </div>
        ${K("Registrera ett k\xF6p f\xF6rst, sedan kan du s\xE4lja hela eller delar av innehavet h\xE4r.")}
      </div>
    `}renderForm(t,s){let n=this.soldAt||U(),r=this.available(t),a=Number(this.quantity),i=Number(this.price),o=Number(this.fees||0),l=A(this.currency)||$,c=l!==$,f=c?Number(this.fxRate):1,m=Number.isFinite(a)&&a>0&&a<=r+G,y=Number.isFinite(i)&&i>0,x=Number.isFinite(f)&&f>0,b=m&&y&&x?ks(t.lots,t.sales,{quantity:Q(a),price:i,currency:l,fxRate:f,fees:Number.isFinite(o)&&o>0?o:0,soldAt:n}):null,g=Number.isFinite(a)&&a>0&&a>r+G,F=Number.isInteger(r)?1:1e-4,M=n===U(),P=t.quote,S=R(P?.changePercent??0),j=A(P?.currency)||$,p=P&&j!==Y();return d`
      <form class="sell-form" novalidate on-submit="${this.submit}">
        <div class="sell-head">
          <div>
            <h2 id="sell-dialog-title">Sälj ${t.symbol}</h2>
            <p>
              ${t.name} · Registrera en hel eller delvis försäljning.
              Resultatet räknas i SEK med genomsnittsmetoden.
            </p>
          </div>
          <button
            type="button"
            class="icon-button"
            aria-label="Stäng"
            on-click="${this.close}"
          >
            ×
          </button>
        </div>

        ${s.length>1?d`
            <label class="sell-symbol-field">
              <span>Innehav</span>
              <select
                class="sell-symbol"
                on-change="${h=>this.selectSymbol(h.target.value)}"
              >
                ${s.map(h=>q(h.symbol,d`
                      <option value="${h.symbol}">${`${h.symbol} \xB7 ${I(h.shares)} st \xB7 ${N(h.marketValue)}`}</option>
                    `))}
              </select>
            </label>
          `:""}

        <div class="sell-facts">
          <div class="fact">
            <small>Innehav</small>
            <strong>${I(t.shares)} st</strong>
            <span>${N(t.marketValue)}</span>
          </div>
          <div class="fact">
            <small>Snittkurs</small>
            <strong>${N(t.averageCost)}</strong>
            <span>inkl. avgifter, i SEK</span>
          </div>
          <div class="fact">
            <small>Kurs nu</small>
            <strong>${N(t.price)}</strong>
            <span class="${S}">${p?`${E(P.price,j)} \xB7 ${D(P?.changePercent??0)}`:`${D(P?.changePercent??0)} idag`}</span>
          </div>
          <div class="fact">
            <small>Orealiserat</small>
            <strong class="${R(t.gain)}">${B(t.gain)}</strong>
            <span class="${R(t.gain)}">${D(t.gainPercent)}</span>
          </div>
        </div>

        <div class="sell-grid">
          <div class="quantity-field">
            <div class="field-heading">
              <span>Antal att sälja</span>
              <span class="${g?"negative":"muted"}">
                ${r>0?`Tillg\xE4ngligt ${I(r)} st${M?"":` den ${W(n)}`}`:M?"Inget tillg\xE4ngligt att s\xE4lja":`Inget tillg\xE4ngligt den ${W(n)}`}
              </span>
            </div>
            <div class="quantity-controls">
              <input
                name="quantity"
                type="number"
                inputmode="decimal"
                min="0"
                step="any"
                placeholder="0"
                .value="${this.quantity}"
                on-input="${h=>{this.quantity=h.target.value,this.message=""}}"
              />
              <div class="chip-row" role="group" aria-label="Snabbval">
                ${[.25,.5,.75,1].map(h=>{let k=this.fractionQuantity(h,r),w=k>0&&Math.abs(k-a)<G;return q(h,d`
                      <button
                        type="button"
                        class="${`chip ${w?"active":""}`}"
                        disabled="${r<=0}"
                        on-click="${()=>this.setFraction(h)}"
                      >
                        ${h>=1?"Allt":`${Math.round(h*100)} %`}
                      </button>
                    `)})}
              </div>
            </div>
            <input
              class="quantity-slider"
              type="range"
              aria-label="Antal att sälja"
              min="0"
              max="${r}"
              step="${F}"
              disabled="${r<=0}"
              .value="${Number.isFinite(a)&&a>0?String(Math.min(a,r)):"0"}"
              on-input="${h=>{this.quantity=h.target.value,this.message=""}}"
            />
          </div>

          <label>
            <span>Pris per aktie</span>
            <div class="input-action">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                .value="${this.price}"
                on-input="${h=>this.price=h.target.value}"
              />
              ${Ys(l,this.changeCurrency)}
              <button
                type="button"
                on-click="${this.fetchPrice}"
                disabled="${this.busy}"
              >
                Hämta
              </button>
            </div>
          </label>

          <label>
            <span>Datum</span>
            <input
              type="date"
              max="${U()}"
              .value="${this.soldAt}"
              on-change="${this.changeDate}"
            />
          </label>

          <label>
            <span>Avgifter (${l})</span>
            <input
              type="number"
              min="0"
              step="any"
              .value="${this.fees}"
              on-input="${h=>this.fees=h.target.value}"
            />
          </label>

          ${c?d`
              <label>
                <span>Växelkurs · SEK per ${l}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="10.50"
                  .value="${this.fxRate}"
                  on-input="${h=>{this.fxRate=h.target.value,this.fxRateDirty=!0}}"
                />
              </label>
            `:""}

          <label class="${c?"wide-field":""}">
            <span>Anteckning</span>
            <input
              placeholder="Mäklare, anledning, konto"
              .value="${this.note}"
              on-input="${h=>this.note=h.target.value}"
            />
          </label>
        </div>

        <div class="${`sell-preview ${b?R(b.gain):"idle"}`}">
          <div>
            <small>Erhållet netto</small>
            <strong>${b?N(b.netProceeds):"\u2013"}</strong>
            <span>${b?c?`${E(Q(a)*i-(Number.isFinite(o)?o:0),l)} \xD7 ${ue(f,4)}`:o>0?`efter ${N(o)} i avgifter`:"pris \xD7 antal \u2212 avgifter":"pris \xD7 antal \u2212 avgifter"}</span>
          </div>
          <div>
            <small>Anskaffning</small>
            <strong>${b?N(b.costBasis):"\u2013"}</strong>
            <span>${b?`${I(Q(a))} \xD7 ${N(b.averageCost)} snitt`:"genomsnittsmetoden"}</span>
          </div>
          <div>
            <small>Realiserat resultat</small>
            <strong class="${b?R(b.gain):""}">${b?B(b.gain):"\u2013"}</strong>
            <span class="${b?R(b.gain):""}">${b?D(b.gainPercent):"fyll i antal och pris"}</span>
          </div>
          <div>
            <small>Kvar efteråt</small>
            <strong>${b?`${I(b.remainingShares)} st`:`${I(t.shares)} st`}</strong>
            <span>${b?b.remainingShares>G?N(b.remainingShares*t.price):"positionen avslutas":"of\xF6r\xE4ndrat"}</span>
          </div>
        </div>

        <div class="sell-actions">
          <p class="${`inline-message ${g?"negative":""}`}">
            ${this.message||(g?`Du kan s\xE4lja h\xF6gst ${I(r)} st.`:"")}
          </p>
          <div class="button-row">
            <button type="button" on-click="${this.close}">Avbryt</button>
            <button
              type="submit"
              class="sell-button"
              disabled="${this.busy||!m||!y||!x}"
            >
              ${this.busy?"Sparar":m?`S\xE4lj ${I(Q(a))} aktier`:"S\xE4lj"}
            </button>
          </div>
        </div>
      </form>
    `}},kn=[{value:"1mo",label:"1M"},{value:"3mo",label:"3M"},{value:"6mo",label:"6M"},{value:"1y",label:"1\xC5"},{value:"2y",label:"2\xC5"},{value:"5y",label:"5\xC5"}],T={width:760,height:320,left:62,right:18,top:18,bottom:30},kt=class extends _{static tag="holdings-page";static properties={filter:{type:String,default:""},scope:{type:String,default:"holdings"},range:{type:String,default:"6mo"},hoverIndex:{type:Number,default:-1}};#e="";#t=null;select=t=>{this.hoverIndex=-1,et(`/holdings/${encodeURIComponent(t)}`)};setRange=t=>{this.range=t,this.hoverIndex=-1};handleChartMove=t=>{let s=this.#t;if(!s)return;let n=t.currentTarget.ownerSVGElement??t.currentTarget;if(!n)return;let r=n.getBoundingClientRect();if(!r.width)return;let a=(t.clientX-r.left)/r.width*T.width,i=T.width-T.left-T.right,o=Math.min(1,Math.max(0,(a-T.left)/i));this.hoverIndex=Math.round(o*(s.points.length-1))};handleChartLeave=()=>{this.hoverIndex=-1};updated(){this.#e&&An(this.#e,this.range)}selectedSymbol(t){let s=O(this.routeData?.params?.symbol??"");return s&&t.some(n=>n.symbol===s)?s:t.find(n=>n.isHolding)?.symbol??t.find(n=>n.hasTrades)?.symbol??t[0]?.symbol??""}render(){let t=Z(),s=t.filter(c=>c.isHolding),n=t.filter(c=>c.isClosed),r=this.scope==="holdings"?s:this.scope==="closed"?n:t,a=this.filter.trim().toUpperCase(),i=r.filter(c=>!a||c.symbol.includes(a)||String(c.name??"").toUpperCase().includes(a)),o=this.selectedSymbol(t);this.#e=o;let l=t.find(c=>c.symbol===o)??null;return d`
      <section class="holdings-grid">
        <aside class="panel holdings-list-panel">
          <div class="panel-heading">
            <div>
              <h1>Innehav</h1>
              <p>Välj ett innehav för att se kursen med dina köp och försäljningar.</p>
            </div>
          </div>
          <input
            class="filter-input"
            type="search"
            placeholder="Filtrera på symbol eller namn"
            .value="${this.filter}"
            on-input="${c=>this.filter=c.target.value}"
          />
          <div class="chip-row scope-chips" role="group" aria-label="Urval">
            ${gt(this,"holdings",`\xD6ppna \xB7 ${s.length}`)}
            ${gt(this,"closed",`Avslutade \xB7 ${n.length}`)}
            ${gt(this,"all",`Alla \xB7 ${t.length}`)}
          </div>
          ${i.length?d`
              <div class="holding-list">
                ${i.map(c=>q(c.symbol,Sn(c,o,this.select)))}
              </div>
            `:K(t.length?"Inget innehav matchar filtret.":"L\xE4gg till ett k\xF6p p\xE5 \xF6versikten f\xF6r att se det h\xE4r.")}
        </aside>

        <section class="panel holding-detail">
          ${l?this.renderDetail(l):K("V\xE4lj ett innehav i listan.")}
        </section>
      </section>
    `}renderDetail(t){let s=t.quote,n=A(s?.currency)||$,r=n!==Y(),a=Rn(t.symbol,this.range),i=Nn(t,a.history,this.range);this.#t=i;let o=i&&this.hoverIndex>=0&&this.hoverIndex<i.points.length?this.hoverIndex:-1,l=Es(t,n),c=i?.nativeAverage??Is(t,n);return d`
      <div class="detail-head">
        <div>
          <h2>${t.symbol}</h2>
          <p>
            ${[t.name,s?.exchange,`noterad i ${n}`].filter(Boolean).join(" \xB7 ")}
          </p>
        </div>
        ${t.isHolding?d`
            <button
              type="button"
              class="sell-button"
              on-click="${()=>Ae(t.symbol)}"
            >
              Sälj ${t.symbol}
            </button>
          `:t.isClosed?d`
            <span class="pill closed">Avslutad position</span>
          `:d`
            <span class="pill closed">Bevakad</span>
          `}
      </div>

      <div class="detail-stats">
        <div class="fact">
          <small>Kurs</small>
          <strong>${N(t.price)}</strong>
          <span class="${R(s?.changePercent??0)}">${r&&s?`${E(s.price,n)} \xB7 ${D(s?.changePercent??0)}`:`${D(s?.changePercent??0)} idag`}</span>
        </div>
        <div class="fact">
          <small>Innehav</small>
          <strong>${I(t.shares)} st</strong>
          <span>${N(t.marketValue)}</span>
        </div>
        <div class="fact">
          <small>Snittkurs</small>
          <strong>${t.isHolding?N(t.averageCost):"\u2013"}</strong>
          <span>${t.isHolding&&r&&c?`${E(c,n)} \xB7 inkl. avgifter`:"inkl. avgifter"}</span>
        </div>
        <div class="fact">
          <small>Orealiserat</small>
          <strong class="${R(t.gain)}">${B(t.gain)}</strong>
          <span class="${R(t.gain)}">${t.isHolding?D(t.gainPercent):"ingen \xF6ppen position"}</span>
        </div>
        <div class="fact">
          <small>Realiserat</small>
          <strong class="${R(t.realized)}">${B(t.realized)}</strong>
          <span class="${t.sellCount?R(t.realized):"muted"}">${t.sellCount?`${D(t.realizedPercent)} \xB7 ${X(t.sellCount,"f\xF6rs\xE4ljning","f\xF6rs\xE4ljningar")}`:"inga f\xF6rs\xE4ljningar"}</span>
        </div>
      </div>

      <div class="chart-toolbar">
        <div class="chip-row" role="group" aria-label="Tidsintervall">
          ${kn.map(f=>q(f.value,d`
                <button
                  type="button"
                  class="${`chip ${this.range===f.value?"active":""}`}"
                  on-click="${()=>this.setRange(f.value)}"
                >
                  ${f.label}
                </button>
              `))}
        </div>
        <div class="chart-legend">
          <span><i class="legend-buy"></i> Köp</span>
          <span><i class="legend-sell"></i> Sälj</span>
          ${t.isHolding?d`
              <span><i class="legend-avg"></i> Snittkurs</span>
            `:""}
          <span><i class="legend-line"></i> Stängningskurs (${n})</span>
        </div>
      </div>

      ${i?Cn(i,o,t,this.handleChartMove,this.handleChartLeave):a.status==="error"?K(`Kunde inte h\xE4mta kurshistorik: ${a.error}`):K(a.status==="loading"?"H\xE4mtar kurshistorik...":"Ingen kurshistorik tillg\xE4nglig f\xF6r intervallet.")}

      ${i?d`
          <p class="chart-caption">
            <span class="${i.tone}">${D(i.changePercent)}</span>
            under perioden · högst ${E(i.high,i.currency)} ·
            lägst ${E(i.low,i.currency)}${i.outside?` \xB7 ${X(i.outside,"aff\xE4r","aff\xE4rer")} ligger f\xF6re intervallet, v\xE4lj ett l\xE4ngre`:""}${a.status==="loading"?" \xB7 uppdaterar...":""}
          </p>
        `:""}

      <div class="detail-section-heading">
        <h3>Affärer i ${t.symbol}</h3>
        <p>Kursen sedan varje affär – stigande kurs efter köp och fallande efter sälj är bra tajming.</p>
      </div>
      ${l.length?d`
          <div class="timing-list">
            ${l.map(f=>q(f.id,Fn(f,i)))}
          </div>
        `:K("Inga aff\xE4rer registrerade f\xF6r det h\xE4r innehavet.")}
    `}};function gt(e,t,s){return d`
    <button
      type="button"
      class="${`chip ${e.scope===t?"active":""}`}"
      on-click="${()=>e.scope=t}"
    >
      ${s}
    </button>
  `}function Sn(e,t,s){let n=e.quote;return d`
    <button
      type="button"
      class="${`holding-item ${e.symbol===t?"active":""}`}"
      aria-pressed="${e.symbol===t}"
      on-click="${()=>s(e.symbol)}"
    >
      <strong>${e.symbol}</strong>
      <b>${e.isHolding?N(e.marketValue):N(e.price)}</b>
      <span>${e.name}</span>
      <small class="${e.isHolding?R(e.gain):R(n?.changePercent??0)}">${e.isHolding?`${I(e.shares)} st \xB7 ${D(e.gainPercent)}`:e.isClosed?`avslutad \xB7 ${B(e.realized)}`:`${D(n?.changePercent??0)} idag`}</small>
    </button>
  `}function Rn(e,t){let s=u.historyStatus[e],n=qs(e,t);return{status:s?.status??(n?"ready":"loading"),error:s?.error??"",history:n}}function An(e,t){return Ft(e)}function Es(e,t){let s=e.quote,n=s&&Number.isFinite(s.price)?s.price:null,r=i=>{if(we(i)===t)return{price:Number(i.price)||0,exact:!0};let l=ce(_e(i),t,u.fxRates);return{price:Number.isFinite(l)?l:null,exact:!1}};return[...e.lots.map(i=>({id:i.id,type:"buy",date:i.purchasedAt??"",createdAt:i.createdAt??"",record:i,result:null})),...e.sales.map(i=>({id:i.id,type:"sell",date:i.soldAt??"",createdAt:i.createdAt??"",record:i,result:e.ledger.saleResults.get(i.id)??null}))].map(i=>{let o=r(i.record),l=n&&o.price>0?(n-o.price)/o.price*100:null;return{...i,native:o,since:l,chartCurrency:t}}).sort((i,o)=>o.date.localeCompare(i.date)||o.createdAt.localeCompare(i.createdAt))}function Is(e,t){if(!e.isHolding)return null;let s=!1,n=o=>{if(we(o)===t)return{...o,price:Number(o.price)||0,fees:Number(o.fees)||0,currency:t,fxRate:1};s=!0;let c=le(o),f=ce((Number(o.price)||0)*c,t,u.fxRates),m=ce((Number(o.fees)||0)*c,t,u.fxRates);return f===null||m===null?null:{...o,price:f,fees:m,currency:t,fxRate:1}},r=e.lots.map(n),a=e.sales.map(n);if(r.includes(null)||a.includes(null))return null;let i=ke(r,a);return i.shares>0?i.averageCost:null}function Nn(e,t,s){let n=(t?.points??[]).filter(v=>Number.isFinite(v.close)&&v.close>0&&v.date);if(n.length<2)return null;let r=e.quote,a=A(r?.currency)||$,i=Se(r?.rawCurrency??r?.currency).divisor,o=n.map(v=>v.close/i),l=n[0].date,c=Es(e,a),f=[],m=0;for(let v of c){if(!v.date||v.date<l){m+=1;continue}let L=n.findIndex(he=>he.date>=v.date);L===-1&&(L=n.length-1);let fe=v.native.price>0?v.native.price:o[L];f.push({...v,index:L,value:fe,close:o[L]})}f.sort((v,L)=>v.index-L.index);let y=Is(e,a),x=[...o,...f.map(v=>v.value),...y?[y]:[]],b=Math.min(...x),g=Math.max(...x),F=(g-b||Math.abs(g)*.05||1)*.08;b-=F,g+=F;let M=T.width-T.left-T.right,P=T.height-T.top-T.bottom,S=v=>T.left+v/(n.length-1)*M,j=v=>T.top+(1-(v-b)/(g-b))*P,p=T.top+P,h=new Map;for(let v of f){let L=`${v.index}:${Math.round(j(v.value)/10)}`;h.has(L)||h.set(L,[]),h.get(L).push(v)}for(let v of h.values())v.length<2||v.forEach((L,fe)=>{L.dx=(fe-(v.length-1)/2)*11});let k=o.map((v,L)=>`${L?"L":"M"}${S(L).toFixed(1)} ${j(v).toFixed(1)}`).join(" "),w=`${k} L${S(o.length-1).toFixed(1)} ${p.toFixed(1)} L${S(0).toFixed(1)} ${p.toFixed(1)} Z`,C=o[0],z=o.at(-1),H=z-C;return{points:n,closes:o,currency:a,markers:f,outside:m,nativeAverage:y,min:b,max:g,x:S,y:j,baseline:p,plotWidth:M,plotHeight:P,linePath:k,areaPath:w,yTicks:Dn(b,g,6).map(v=>({value:v,y:j(v)})),xTicks:jn(n.length,6).map(v=>({index:v,x:S(v),label:En(n[v].date,s)})),first:C,last:z,change:H,changePercent:C?H/C*100:0,tone:R(H),high:Math.max(...o),low:Math.min(...o)}}function Cn(e,t,s,n,r){let a=t>=0?{index:t,x:e.x(t),y:e.y(e.closes[t]),date:e.points[t].date,close:e.closes[t],trades:e.markers.filter(m=>m.index===t)}:null,i=a&&a.x>T.width/2,o=176,l=44+(a?.trades.length??0)*16,c=a?i?a.x-o-12:a.x+12:0,f=a?Math.max(T.top,Math.min(a.y-20,e.baseline-l)):0;return d`
    <svg
      class="${`price-chart ${e.tone}`}"
      viewBox="${`0 0 ${T.width} ${T.height}`}"
      role="img"
      aria-label="${`${s.symbol} kursdiagram med k\xF6p och f\xF6rs\xE4ljningar`}"
      on-pointermove="${n}"
      on-pointerdown="${n}"
      on-pointerleave="${r}"
    >
      <defs>
        <linearGradient id="price-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.22"></stop>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0"></stop>
        </linearGradient>
      </defs>

      <g class="chart-grid">
        ${e.yTicks.map(m=>q(m.value,d`
              <svg overflow="visible">
                <line
                  x1="${T.left}"
                  x2="${T.width-T.right}"
                  y1="${m.y.toFixed(1)}"
                  y2="${m.y.toFixed(1)}"
                ></line>
                <text
                  x="${T.left-8}"
                  y="${(m.y+3.5).toFixed(1)}"
                  text-anchor="end"
                >
                  ${In(m.value)}
                </text>
              </svg>
            `))}
      </g>

      <g class="chart-axis">
        ${e.xTicks.map(m=>q(m.index,d`
              <svg overflow="visible">
                <text
                  x="${m.x.toFixed(1)}"
                  y="${T.height-9}"
                  text-anchor="middle"
                >
                  ${m.label}
                </text>
              </svg>
            `))}
      </g>

      <path
        class="chart-area"
        d="${e.areaPath}"
        fill="url(#price-chart-fill)"
      ></path>
      <path class="chart-line" d="${e.linePath}"></path>

      ${e.nativeAverage?d`
          <svg overflow="visible" class="chart-average">
            <line
              x1="${T.left}"
              x2="${T.width-T.right}"
              y1="${e.y(e.nativeAverage).toFixed(1)}"
              y2="${e.y(e.nativeAverage).toFixed(1)}"
            ></line>
            <text
              x="${T.width-T.right}"
              y="${(e.y(e.nativeAverage)-6).toFixed(1)}"
              text-anchor="end"
            >
              snitt ${E(e.nativeAverage,e.currency)}
            </text>
          </svg>
        `:""}

      <g class="chart-markers">
        ${e.markers.map(m=>q(m.id,Tn(m,e)))}
      </g>

      ${a?d`
          <svg overflow="visible" class="chart-hover">
            <line
              x1="${a.x.toFixed(1)}"
              x2="${a.x.toFixed(1)}"
              y1="${T.top}"
              y2="${e.baseline}"
            ></line>
            <circle
              cx="${a.x.toFixed(1)}"
              cy="${a.y.toFixed(1)}"
              r="4.5"
            ></circle>
            <g transform="${`translate(${c.toFixed(1)} ${f.toFixed(1)})`}">
              <rect width="${o}" height="${l}" rx="6"></rect>
              <text class="tooltip-date" x="10" y="17">${W(a.date)}</text>
              <text class="tooltip-price" x="10" y="35">
                ${E(a.close,e.currency)}
              </text>
              ${a.trades.map((m,y)=>q(m.id,d`
                    <svg overflow="visible">
                      <text
                        class="${`tooltip-trade ${m.type}`}"
                        x="10"
                        y="${51+y*16}"
                      >
                        ${m.type==="buy"?"K\xF6p":"S\xE4lj"} ${I(m.record.quantity)} st à ${E(m.native.price??m.close,e.currency)}
                      </text>
                    </svg>
                  `))}
            </g>
          </svg>
        `:""}
    </svg>
  `}function Tn(e,t){let s=t.x(e.index)+(e.dx??0),n=t.y(e.value),r=`${e.type==="buy"?"K\xF6p":"S\xE4lj"} ${I(e.record.quantity)} st \xE0 ${E(e.value,t.currency)}${e.native.exact?"":" (omr\xE4knat)"} \xB7 ${W(e.date)}`;return e.type==="buy"?d`
      <svg overflow="visible" class="marker buy">
        <title>${r}</title>
        <circle cx="${s.toFixed(1)}" cy="${n.toFixed(1)}" r="6"></circle>
      </svg>
    `:d`
      <svg overflow="visible" class="marker sell">
        <title>${r}</title>
        <path d="${`M${s.toFixed(1)} ${(n-7).toFixed(1)} L${(s+7).toFixed(1)} ${n.toFixed(1)} L${s.toFixed(1)} ${(n+7).toFixed(1)} L${(s-7).toFixed(1)} ${n.toFixed(1)} Z`}"></path>
      </svg>
    `}function Fn(e,t){let s=e.type==="buy",n=e.record,r=we(n),a=e.since,i=a!==null&&Math.abs(a)<.005,o=a===null||i?"neutral":R(s?a:-a),l=a===null?"v\xE4ntar p\xE5 kurs":i?"of\xF6r\xE4ndrad kurs sedan aff\xE4ren":s?a>=0?"kursen har stigit sedan k\xF6pet":"kursen har fallit sedan k\xF6pet":a<=0?"bra tajming \u2013 kursen har fallit sedan":"kursen har stigit sedan f\xF6rs\xE4ljningen",c=t?t.markers.some(f=>f.id===e.id):!1;return d`
    <article class="${`timing-row ${e.type}`}">
      <span class="${`badge ${e.type}`}">${s?"K\xF6p":"S\xE4lj"}</span>
      <div>
        <strong>${W(e.date)}</strong>
        <span>${I(n.quantity)} st à ${E(Number(n.price)||0,r)}${t&&!c?" \xB7 utanf\xF6r diagrammet":""}</span>
      </div>
      <div>
        <span class="cell-label">${s?"Kostnad":"Erh\xE5llet"}</span>
        <strong>${N(xe(n,e.type))}</strong>
      </div>
      <div>
        <span class="cell-label">Kurs sedan affären</span>
        <strong class="${o}">${a===null?"\u2013":D(a)}</strong>
        <small class="muted">${l}</small>
      </div>
      <div>
        <span class="cell-label">${s?"Anteckning":"Realiserat"}</span>
        ${s?d`
            <strong class="muted">${n.note||"\u2013"}</strong>
          `:d`
            <strong class="${R(e.result?.gain??0)}">${B(e.result?.gain??0)}</strong>
            <small class="${R(e.result?.gain??0)}">${D(e.result?.gainPercent??0)}</small>
          `}
      </div>
    </article>
  `}function Dn(e,t,s=6){let n=t-e||1,r=10**Math.floor(Math.log10(n/s)),a=[1,2,2.5,5,10,20,25,50].map(i=>i*r);for(let i of a){let o=Cs(e,t,i);if(o.length<=s)return o}return Cs(e,t,a.at(-1))}function Cs(e,t,s){let n=[];for(let r=Math.ceil(e/s)*s;r<=t+s*1e-6;r+=s)n.push(Number(r.toFixed(10)));return n}function jn(e,t){if(e<=t)return Array.from({length:e},(n,r)=>r);let s=new Set;for(let n=0;n<t;n+=1)s.add(Math.round(n*(e-1)/(t-1)));return[...s]}function En(e,t){let s=new Date(`${e}T00:00:00`);if(Number.isNaN(s.getTime()))return e;let n=t==="1mo"||t==="3mo"||t==="6mo";return new Intl.DateTimeFormat("sv-SE",n?{day:"numeric",month:"short"}:{month:"short",year:"2-digit"}).format(s)}function In(e){return new Intl.NumberFormat("sv-SE",{maximumFractionDigits:Math.abs(e)>=100?0:2}).format(e)}var St=class extends _{static tag="position-table";static properties={positions:{type:Array,default:()=>[]}};render(){return d`
      <div class="position-list">
        ${this.positions.map(t=>q(t.symbol,Qn(t)))}
      </div>
    `}},Rt=class extends _{static tag="transactions-page";static properties={typeFilter:{type:String,default:"all"},symbolFilter:{type:String,default:""}};updated(){Gs(this,"select.symbol-filter",this.effectiveSymbolFilter())}effectiveSymbolFilter(){return new Set(Qs()).has(this.symbolFilter)?this.symbolFilter:""}render(){let t=Z(),s=new Map(t.map(g=>[g.symbol,g])),n=Wn(s),r=[...new Set(n.map(g=>g.symbol))].sort(),a=r.includes(this.symbolFilter)?this.symbolFilter:"",i=n.filter(g=>!a||g.symbol===a),o=i.filter(g=>this.typeFilter==="all"||g.type===this.typeFilter),l=i.filter(g=>g.type==="buy"),c=i.filter(g=>g.type==="sell"),f=l.reduce((g,F)=>g+xe(F.record,"buy"),0),m=c.reduce((g,F)=>g+(F.result?.netProceeds??0),0),y=c.reduce((g,F)=>g+(F.result?.gain??0),0),x=c.reduce((g,F)=>g+(F.result?.costBasis??0),0),b=t.some(g=>g.isHolding);return d`
      <section class="page-stack">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h1>Transaktioner</h1>
              <p>
                Köp och försäljningar sparas lokalt i IndexedDB, i affärens
                valuta med växelkursen på affärsdagen. Resultatet räknas i SEK
                mot snittkursen vid tillfället (genomsnittsmetoden).
              </p>
            </div>
            ${b?d`
                <button
                  type="button"
                  class="sell-button"
                  on-click="${()=>Ae(a)}"
                >
                  Sälj innehav
                </button>
              `:""}
          </div>

          ${n.length?d`
              <div class="tx-summary">
                <div class="fact">
                  <small>Investerat</small>
                  <strong>${N(f)}</strong>
                  <span>${X(l.length,"k\xF6p","k\xF6p")}</span>
                </div>
                <div class="fact">
                  <small>Sålt för</small>
                  <strong>${N(m)}</strong>
                  <span>${X(c.length,"f\xF6rs\xE4ljning","f\xF6rs\xE4ljningar")}</span>
                </div>
                <div class="fact">
                  <small>Realiserat</small>
                  <strong class="${R(y)}">${B(y)}</strong>
                  <span class="${c.length?R(y):"muted"}">
                    ${c.length?D(x>0?y/x*100:0):"inga f\xF6rs\xE4ljningar"}
                  </span>
                </div>
              </div>

              <div class="filter-bar">
                <div class="chip-row" role="group" aria-label="Typ">
                  ${bt(this,"all",`Alla \xB7 ${i.length}`)}
                  ${bt(this,"buy",`K\xF6p \xB7 ${l.length}`)}
                  ${bt(this,"sell",`S\xE4lj \xB7 ${c.length}`)}
                </div>
                <select
                  class="symbol-filter"
                  aria-label="Filtrera på symbol"
                  on-change="${g=>this.symbolFilter=g.target.value}"
                >
                  <option value="">Alla symboler</option>
                  ${r.map(g=>q(g,d`
                        <option value="${g}">${g}</option>
                      `))}
                </select>
              </div>
            `:""}

          ${o.length?d`
              <div class="transaction-list">
                ${o.map(g=>q(g.id,Gn(g)))}
              </div>
            `:K(n.length?"Inga transaktioner matchar filtret.":"Inga transaktioner har sparats. L\xE4gg till ett k\xF6p p\xE5 \xF6versikten.")}
        </section>
      </section>
    `}},At=class extends _{static tag="research-page";static properties={query:{type:String,default:""},message:{type:String,default:""}};search=async t=>{t.preventDefault();let s=this.query.trim();if(s){u.searchLoading=!0,this.message="";try{u.searchResults=await rt(s),u.searchResults.length===0&&(this.message="Inga matchande tickers hittades.")}catch(n){this.message=n.message}finally{u.searchLoading=!1}}};track=async t=>{await Bs(t),this.message=`${t} bevakas nu lokalt.`};render(){let t=Z();return d`
      <section class="research-grid">
        <section class="panel search-panel">
          <div class="panel-heading">
            <div>
              <h1>Sök</h1>
              <p>
                Sök Yahoo Finance-symboler och lägg till dem i din lokala
                bevakningslista.
              </p>
            </div>
          </div>
          <form class="search-form" on-submit="${this.search}">
            <input
              autocomplete="off"
              placeholder="Sök bolag eller aktiesymbol"
              .value="${this.query}"
              on-input="${s=>this.query=s.target.value}"
            />
            <button class="primary-button" disabled="${u.searchLoading}">
              ${u.searchLoading?"S\xF6ker":"S\xF6k"}
            </button>
          </form>
          ${this.message?d`
              <p class="inline-message">${this.message}</p>
            `:""}
          <div class="search-results">
            ${u.searchResults.map(s=>q(s.symbol,d`
                  <article class="search-result">
                    <div>
                      <strong>${s.symbol}</strong>
                      <span>${s.name}</span>
                      <small>${[s.exchange,s.type,s.sector].filter(Boolean).join(" / ")}</small>
                    </div>
                    <button on-click="${()=>this.track(s.symbol)}">Bevaka</button>
                  </article>
                `))}
          </div>
        </section>

        <section class="panel watch-panel">
          <div class="panel-heading">
            <div>
              <h2>Bevakade symboler</h2>
              <p>Bevakningslista och innehav med lokalt cachade kursbilder.</p>
            </div>
          </div>
          ${t.length?d`
              <div class="watch-grid">
                ${t.map(s=>q(s.symbol,Yn(s)))}
              </div>
            `:K("S\xF6k och bevaka en symbol, eller spara ett k\xF6p.")}
        </section>
      </section>
    `}},Nt=class extends _{static tag="settings-page";static properties={message:{type:String,default:""},busy:{type:Boolean,default:!1}};exportData=()=>{let t={app:"Stockroom",version:2,exportedAt:new Date().toISOString(),lots:u.lots,sales:u.sales,watchlist:u.watchlist,quotes:u.quotes,settings:u.settings},s=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(s),n.download=`stockroom-${U()}.json`,n.click(),URL.revokeObjectURL(n.href)};importData=async t=>{let s=t.target.files?.[0];if(s){this.busy=!0;try{let n=JSON.parse(await s.text()),r=er(n);await Zt(r),await Ct(),this.message=`Importerade ${X(r.lots.length,"k\xF6p","k\xF6p")} och ${X(r.sales.length,"f\xF6rs\xE4ljning","f\xF6rs\xE4ljningar")}${r.skipped?` \xB7 ${r.skipped} ogiltiga poster hoppades \xF6ver`:""}.`}catch(n){this.message=n.message}finally{this.busy=!1,t.target.value=""}}};clearData=async()=>{confirm("Ta bort all lokal Stockroom-data fr\xE5n den h\xE4r webbl\xE4saren?")&&(await Xt(),await Ct(),this.message="Lokal data rensad.")};persistStorage=async()=>{if(!navigator.storage?.persist){this.message="Best\xE4ndig webbl\xE4sarlagring \xE4r inte tillg\xE4nglig h\xE4r.";return}let t=await navigator.storage.persist();this.message=t?"Webbl\xE4saren beviljade best\xE4ndig lagring.":"Webbl\xE4saren beviljade inte best\xE4ndig lagring."};render(){let t=Y(),s=Object.entries(u.fxRates).filter(([,n])=>Number.isFinite(n)).sort(([n],[r])=>n.localeCompare(r));return d`
      <section class="settings-grid">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h1>Lokal data</h1>
              <p>
                Köp, försäljningar och bevakningar stannar i den här
                webbläsarens IndexedDB.
              </p>
            </div>
          </div>
          <div class="settings-actions">
            <button class="primary-button" on-click="${this.exportData}">
              Exportera JSON
            </button>
            <label class="file-button">
              Importera JSON
              <input type="file" accept="application/json" on-change="${this.importData}" />
            </label>
            <button on-click="${this.persistStorage}">Beständig lagring</button>
            <button class="danger-button" on-click="${this.clearData}">
              Rensa lokal data
            </button>
          </div>
          ${this.message?d`
              <p class="inline-message">${this.message}</p>
            `:""}
        </section>

        <section class="panel">
          <div class="panel-heading">
            <div>
              <h2>Lagring</h2>
              <p>Antalen nedan är lokala poster, inte serverposter.</p>
            </div>
          </div>
          <div class="storage-stats">
            <span><strong>${u.lots.length}</strong> köp</span>
            <span><strong>${u.sales.length}</strong> försäljningar</span>
            <span><strong>${u.watchlist.length}</strong> bevakade symboler</span>
            <span><strong>${Object.keys(u.quotes).length}</strong> kursbilder</span>
            <span><strong>${ct.all().length}</strong> kurshistoriker synkade från servern</span>
          </div>
        </section>

        <section class="panel currency-panel">
          <div class="panel-heading">
            <div>
              <h2>Valuta</h2>
              <p>
                Affärer bokförs i SEK med växelkursen på affärsdagen.
                Visningsvalutan räknar om hela portföljen med aktuell kurs.
              </p>
            </div>
          </div>
          <div class="settings-actions">
            <span class="muted">Visningsvaluta</span>
            <div class="segmented" role="group" aria-label="Visningsvaluta">
              ${oe.map(n=>q(n,d`
                    <button
                      type="button"
                      class="${`segment ${t===n?"active":""}`}"
                      aria-pressed="${t===n}"
                      on-click="${()=>Ps(n)}"
                    >
                      ${n}
                    </button>
                  `))}
            </div>
          </div>
          ${s.length?d`
              <div class="storage-stats rates-list">
                ${s.map(([n,r])=>q(n,d`
                      <span>
                        <span>1 ${n}</span>
                        <strong>${E(r,$)}</strong>
                      </span>
                    `))}
              </div>
            `:d`
              <p class="inline-message">
                Växelkurser hämtas från Yahoo Finance när de behövs.
              </p>
            `}
        </section>
      </section>
    `}};vt.register();$t.register();wt.register();xt.register();St.register();kt.register();Rt.register();At.register();Nt.register();Xe({routes:[{path:"/",component:"dashboard-page"},{path:"/holdings",component:"holdings-page"},{path:"/holdings/:symbol",component:"holdings-page"},{path:"/transactions",component:"transactions-page"},{path:"/lots",component:"transactions-page"},{path:"/research",component:"research-page"},{path:"/settings",component:"settings-page"}]});qn();async function qn(){await Ct(),await Us({forceHistory:!1,quiet:!0}),await Ue(Vs(),{required:!1}).catch(()=>{})}async function Ct(){let e=await Ht();u.lots=e.lots,u.sales=e.sales??[],u.watchlist=e.watchlist,u.quotes=e.quotes,u.fxRates=Vn(e.quotes),u.settings={refreshMinutes:5,lastRefresh:"",displayCurrency:$,...e.settings},u.ready=!0}function Z(){return Rs(u.lots,u.watchlist,u.quotes,Pn(),u.fxRates,u.sales)}var mt=new Map;function Ft(e,t={}){let s=O(e);if(!s)return Promise.resolve();let n=mt.get(s);if(n)return n;let r=u.historyStatus[s],a=Date.now();if(!t.force&&r&&(r.status==="ready"&&a-r.at<5*6e4||r.status==="error"&&a-r.at<6e4))return Promise.resolve();yt(s,{status:"loading",error:"",at:a});let i=(async()=>{try{let o=await vs(s,{maxAgeMs:t.force?0:void 0});yt(s,{status:"ready",error:o?.stale?o.error??"":"",at:Date.now()})}catch(o){yt(s,{status:"error",error:o.message,at:Date.now()})}finally{mt.delete(s)}})();return mt.set(s,i),i}function yt(e,t){u.historyStatus={...u.historyStatus,[e]:t}}function qs(e,t){let s=ut(e);if(!s)return null;let n=u.quotes[e],r=Se(n?.rawCurrency??n?.currency).divisor;return{symbol:e,updatedAt:s.updatedAt,points:ws($s(s.points,t),n,r)}}function Pn(){let e={};for(let t of It()){let s=qs(t,"6mo");s&&(e[t]=s)}return e}function Y(){let e=A(u.settings.displayCurrency);return oe.includes(e)?e:$}function N(e){let t=Y(),s=ce(e,t,u.fxRates);return s===null?E(e,$):E(s,t)}function B(e){let t=Y(),s=ce(e,t,u.fxRates);return s===null?ft(e,$):ft(s,t)}async function Ps(e){let t=A(e);if(oe.includes(t)){u.settings={...u.settings,displayCurrency:t},await st("displayCurrency",t);try{await Ue([t],{required:!0})}catch(s){u.error=s.message}}}async function On(e){let t=O(e.symbol),s=A(e.currency)||$,n=new Date().toISOString(),r={id:crypto.randomUUID(),symbol:t,quantity:Q(e.quantity),price:Number(e.price),currency:s,fxRate:s===$?1:Number(e.fxRate),purchasedAt:e.purchasedAt,fees:Number(e.fees??0)||0,note:e.note??"",createdAt:n,updatedAt:n};await Vt(r),u.lots=[r,...u.lots].sort((a,i)=>i.purchasedAt.localeCompare(a.purchasedAt)),await Bs(t,{quiet:!0})}async function Mn(e){await Wt(e),u.lots=u.lots.filter(t=>t.id!==e)}async function Ln(e){let t=O(e.symbol);if(!t)throw new Error("Aktiesymbol saknas");let s=A(e.currency)||$,n=new Date().toISOString(),r={id:crypto.randomUUID(),symbol:t,quantity:Q(e.quantity),price:Number(e.price),currency:s,fxRate:s===$?1:Number(e.fxRate),soldAt:e.soldAt,fees:Number(e.fees??0)||0,note:e.note??"",createdAt:n,updatedAt:n};await Kt(r),u.sales=[r,...u.sales].sort((o,l)=>l.soldAt.localeCompare(o.soldAt));let i=Z().find(o=>o.symbol===t)?.ledger.saleResults.get(r.id)??{netProceeds:xe(r,"sell"),costBasis:0,gain:0,gainPercent:0};return{sale:r,result:i}}async function Bn(e){await Qt(e),u.sales=u.sales.filter(t=>t.id!==e)}async function _n(e){confirm(`Ta bort k\xF6pet av ${I(e.quantity)} ${e.symbol} (${W(e.purchasedAt)})?`)&&await Mn(e.id)}async function Un(e){confirm(`Ta bort f\xF6rs\xE4ljningen av ${I(e.quantity)} ${e.symbol} (${W(e.soldAt)})? Aktierna r\xE4knas d\xE5 som \xE4gda igen.`)&&await Bn(e.id)}function Ae(e=""){u.sellRequest={symbol:O(e),openedAt:Date.now()}}function Ts(){u.sellRequest&&(u.sellRequest=null)}async function Os(e,t){let s=await _s(e),n=A(s.currency)||$,r=Se(s.rawCurrency??s.currency).divisor,a=await Ms(s.symbol,t).catch(()=>null),i=await Dt(n,t);return{symbol:s.symbol,currency:n,price:a?a.close/r:s.price,priceDate:a?.date??null,fxRate:i.rate,fxDate:i.date}}async function Dt(e,t){let s=A(e);if(!s||s===$)return{rate:1,date:null};let n=await Ms(Et(s),t).catch(()=>null);return n?{rate:n.close,date:n.date}:(await Ue([s],{required:!0}),{rate:u.fxRates[s],date:null})}async function Ms(e,t){if(!/^\d{4}-\d{2}-\d{2}$/.test(t)||t>=U())return null;await Ft(e);let s=ut(e);if(!s)return null;let n=s.points.filter(r=>r.date<=t).at(-1);return n?{close:n.close,date:n.date}:null}function Ls(e,t){let s=t.priceDate?`St\xE4ngningskurs ${W(t.priceDate)}`:"Senaste kurs",n=t.currency===$?"":` \xB7 ${ue(t.fxRate,4)} SEK/${t.currency}${t.fxDate?"":" (aktuell kurs)"}`;return`${s} f\xF6r ${e}: ${E(t.price,t.currency)}${n}.`}function Tt(e){let t=Number(e);return Number.isFinite(t)?String(Number(t.toFixed(t<10?4:2))):""}function Re(e){let t=Number(e);return!Number.isFinite(t)||t<=0?"":String(Number(t.toFixed(4)))}async function Bs(e,t={}){let s=O(e);if(!s)throw new Error("Aktiesymbol saknas");if(!u.watchlist.some(n=>n.symbol===s)){let n={symbol:s,addedAt:new Date().toISOString()};await Gt(n),u.watchlist=[...u.watchlist,n].sort((r,a)=>r.symbol.localeCompare(a.symbol))}await _s(s),t.quiet||(u.notice=`${s} bevakas p\xE5 den h\xE4r enheten.`)}async function zn(e){let t=O(e);await Yt(t),u.watchlist=u.watchlist.filter(s=>s.symbol!==t)}async function _s(e){let t=await je([e]),s=t.quotes?.[0];if(!s)throw new Error(t.errors?.[0]?.message??`Ingen kurs hittades f\xF6r ${e}`);let n=await jt(s);return await Hs([n],{required:!0}),await Ks(n.symbol,!0),await zs(),n}async function Us(e={}){let t=It(),s=Vs().map(Et);if(!(t.length===0&&s.length===0)&&!u.refreshing){u.refreshing=!0,e.quiet||(u.error="");try{let n=await je([...t,...s]),r=[];for(let a of n.quotes??[])r.push(await jt(a));await Hs(r,{required:!1}),await zs();for(let a of t.slice(0,24))await Ks(a,e.forceHistory).catch(()=>{});n.errors?.length&&!e.quiet&&(u.error=n.errors.map(a=>`${a.symbol}: ${a.message}`).join(" / "))}catch(n){e.quiet||(u.error=n.message)}finally{u.refreshing=!1}}}async function zs(){let e=new Date().toISOString();u.settings={...u.settings,lastRefresh:e},await st("lastRefresh",e)}async function jt(e){let t=Se(e.rawCurrency??e.currency),s=r=>Number.isFinite(r)?r/t.divisor:r,n={...e,symbol:O(e.symbol),rawCurrency:e.rawCurrency??e.currency,currency:t.currency,price:s(e.price),previousClose:s(e.previousClose),change:s(e.change),dayHigh:s(e.dayHigh),dayLow:s(e.dayLow),fiftyTwoWeekHigh:s(e.fiftyTwoWeekHigh),fiftyTwoWeekLow:s(e.fiftyTwoWeekLow),updatedAt:new Date().toISOString()};return await Jt(n),u.quotes={...u.quotes,[n.symbol]:n},Hn(n),n}async function Hs(e,t={}){await Ue(e.map(s=>s.currency),t)}async function Ue(e,t={}){let n=[...new Set(e.map(A).filter(i=>i&&i!==$))].filter(i=>!Number.isFinite(u.fxRates[i]));if(n.length===0)return;let r=await je(n.map(Et));for(let i of r.quotes??[])await jt(i);let a=n.filter(i=>!Number.isFinite(u.fxRates[i]));if(t.required&&a.length)throw new Error(`Kunde inte h\xE4mta v\xE4xelkurs f\xF6r ${a.join(", ")} till ${$}.`)}function Vs(){let e=new Set,t=s=>{let n=A(s);n&&n!==$&&e.add(n)};t(Y());for(let s of u.lots)t(s.currency);for(let s of u.sales)t(s.currency);for(let s of It())t(u.quotes[s]?.currency);return[...e]}function Hn(e){let t=Ws(e.symbol);!t||!Number.isFinite(e.price)||(u.fxRates={...u.fxRates,[t]:e.price})}function Vn(e){let t={};for(let s of Object.values(e??{})){let n=Ws(s.symbol);n&&Number.isFinite(s.price)&&(t[n]=s.price)}return t}function Et(e){return`${A(e)}${$}=X`}function Ws(e){return O(e).match(/^([A-Z]{3})SEK=X$/)?.[1]??""}function Ks(e,t=!1){return Ft(e,{force:t})}function It(){return[...new Set([...u.watchlist.map(e=>e.symbol),...Qs()])].filter(Boolean)}function Qs(){return[...new Set([...u.lots.map(e=>e.symbol),...u.sales.map(e=>e.symbol)])].filter(Boolean)}function Wn(e){return[...u.lots.map(s=>({id:s.id,type:"buy",symbol:s.symbol,date:s.purchasedAt??"",createdAt:s.createdAt??"",record:s,position:e.get(s.symbol)??null,result:null})),...u.sales.map(s=>{let n=e.get(s.symbol)??null;return{id:s.id,type:"sell",symbol:s.symbol,date:s.soldAt??"",createdAt:s.createdAt??"",record:s,position:n,result:n?.ledger.saleResults.get(s.id)??null}})].sort((s,n)=>n.date.localeCompare(s.date)||n.createdAt.localeCompare(s.createdAt))}function Kn(){let e=u.settings.lastRefresh;return e?new Intl.DateTimeFormat("sv-SE",{hour:"2-digit",minute:"2-digit",month:"short",day:"numeric"}).format(new Date(e)):"ej uppdaterad"}function U(){return new Date().toISOString().slice(0,10)}function X(e,t,s){return`${e} ${e===1?t:s}`}function Gs(e,t,s){let n=e.querySelector(t);n&&n.value!==s&&(n.value=s)}function Ys(e,t){let s=Be.includes(e)?Be:[e,...Be];return d`
    <select
      class="currency-select"
      aria-label="Valuta"
      .value="${e}"
      on-change="${t}"
    >
      ${s.map(n=>q(n,d`
            <option value="${n}" selected="${n===e}">${n}</option>
          `))}
    </select>
  `}function Qn(e){let t=pt(e.history?.points??[],180,54),s=e.quote,n=A(s?.currency)||$,r=s&&n!==Y();return d`
    <article class="position-row">
      <router-link
        class="identity-cell row-link"
        to="${`/holdings/${encodeURIComponent(e.symbol)}`}"
      >
        <strong>${e.symbol}</strong>
        <span>${e.name}</span>
      </router-link>
      <svg
        class="sparkline"
        viewBox="0 0 180 54"
        role="img"
        aria-label="${e.symbol} pristrend"
      >
        <path class="sparkline-grid" d="M0 27 L180 27"></path>
        <path class="${`sparkline-path ${R(e.gain)}`}" d="${t}"></path>
      </svg>
      <div>
        <span class="cell-label">Antal</span>
        <strong>${I(e.shares)}</strong>
        <small class="muted">snitt ${N(e.averageCost)}</small>
      </div>
      <div>
        <span class="cell-label">Pris</span>
        <strong>${N(e.price)}</strong>
        <small class="${R(s?.changePercent??0)}">${r?`${E(s.price,n)} \xB7 `:""}${D(s?.changePercent??0)} idag</small>
      </div>
      <div>
        <span class="cell-label">Värde</span>
        <strong>${N(e.marketValue)}</strong>
        ${e.sellCount?d`
            <small class="${R(e.realized)}">${B(e.realized)} realiserat</small>
          `:""}
      </div>
      <div>
        <span class="cell-label">Resultat</span>
        <strong class="${R(e.gain)}">
          ${B(e.gain)}
        </strong>
        <small class="${R(e.gain)}">${D(e.gainPercent)}</small>
      </div>
      <button
        type="button"
        class="sell-button compact"
        on-click="${()=>Ae(e.symbol)}"
      >
        Sälj
      </button>
    </article>
  `}function Gn(e){let{record:t,position:s,result:n}=e,r=e.type==="buy",a=Number(t.quantity)||0,i=Number(t.price)||0,o=Number(t.fees)||0,l=we(t),c=le(t),f=l!==$,m=xe(t,e.type),y=s?.quote,x=A(y?.currency)||$,b=!r||i<=0?null:y&&x===l&&y.price>0?(y.price-i)/i*100:s&&s.price>0?(s.price-_e(t))/_e(t)*100:null,g=n?.gain??0;return d`
    <article class="${`transaction-row ${e.type}`}">
      <div class="tx-identity">
        <span class="${`badge ${e.type}`}">${r?"K\xF6p":"S\xE4lj"}</span>
        <div>
          <strong>${t.symbol}</strong>
          <span>${t.note||s?.name||t.symbol}</span>
        </div>
      </div>
      <div>
        <span class="cell-label">Datum</span>
        <strong>${W(e.date)}</strong>
      </div>
      <div>
        <span class="cell-label">Antal</span>
        <strong>${I(a)}</strong>
      </div>
      <div>
        <span class="cell-label">Kurs</span>
        <strong>${E(i,l)}</strong>
        <small class="muted">${[f?`\xD7 ${ue(c,4)} = ${N(i*c)}`:"",o>0?`avgift ${E(o,l)}`:""].filter(Boolean).join(" \xB7 ")}</small>
      </div>
      <div>
        <span class="cell-label">${r?"Kostnad":"Erh\xE5llet"}</span>
        <strong>${N(m)}</strong>
      </div>
      <div>
        <span class="cell-label">${r?"Kurs sedan k\xF6p":"Realiserat"}</span>
        ${r?d`
            <strong class="${R(b??0)}">${b===null?"\u2013":D(b)}</strong>
            <small class="muted">${b===null?"v\xE4ntar p\xE5 kurs":`nu ${y&&x===l?E(y.price,l):N(s?.price??0)}`}</small>
          `:d`
            <strong class="${R(g)}">${B(g)}</strong>
            <small class="${R(g)}">${D(n?.gainPercent??0)} · snitt ${N(n?.averageCost??0)}</small>
          `}
      </div>
      <button
        type="button"
        class="danger-button compact"
        on-click="${()=>r?_n(t):Un(t)}"
      >
        Ta bort
      </button>
    </article>
  `}function bt(e,t,s){return d`
    <button
      type="button"
      class="${`chip ${e.typeFilter===t?"active":""}`}"
      on-click="${()=>e.typeFilter=t}"
    >
      ${s}
    </button>
  `}function Yn(e){let t=e.quote,s=pt(e.history?.points??[],240,72),n=A(t?.currency)||$,r=t&&n!==Y();return d`
    <article class="watch-card">
      <div class="watch-card-head">
        <div>
          <strong>${e.symbol}</strong>
          <span>${e.name}</span>
        </div>
        ${e.isHolding?d`
            <div class="card-actions">
              <span class="pill">${I(e.shares)} st</span>
              <button
                type="button"
                class="sell-button compact"
                on-click="${()=>Ae(e.symbol)}"
              >
                Sälj
              </button>
            </div>
          `:e.isClosed?d`
            <span class="pill closed">Avslutad</span>
          `:d`
            <button on-click="${()=>zn(e.symbol)}">Sluta bevaka</button>
          `}
      </div>
      <svg
        class="watch-chart"
        viewBox="0 0 240 72"
        role="img"
        aria-label="${e.symbol} diagram"
      >
        <path class="sparkline-grid" d="M0 36 L240 36"></path>
        <path class="${`sparkline-path ${R(t?.change??0)}`}" d="${s}"></path>
      </svg>
      <div class="watch-stats">
        <span>
          <small>Senast</small>
          <strong>${N(e.price)}</strong>
          ${r?d`
              <em class="muted">${E(t.price,n)}</em>
            `:""}
        </span>
        <span>
          <small>Rörelse</small>
          <strong class="${R(t?.change??0)}">
            ${D(t?.changePercent??0)}
          </strong>
        </span>
        <span>
          <small>${e.sellCount?"Realiserat":"Uppdaterad"}</small>
          ${e.sellCount?d`
              <strong class="${R(e.realized)}">${B(e.realized)}</strong>
            `:d`
              <strong>${t?.marketTime?Xn(t.marketTime):"V\xE4ntar"}</strong>
            `}
        </span>
      </div>
    </article>
  `}function Jn(e,t){return d`
    <div class="allocation-list">
      ${e.map(s=>{let n=t>0?s.marketValue/t*100:0;return q(s.symbol,d`
            <div class="allocation-row">
              <div>
                <strong>${s.symbol}</strong>
                <span>${N(s.marketValue)}</span>
              </div>
              <div class="allocation-track">
                <span style="${`width: ${Math.max(2,n).toFixed(2)}%`}"></span>
              </div>
              <b>${ue(n,1)}%</b>
            </div>
          `)})}
    </div>
  `}function Zn(e){return d`
    <div class="realized-list">
      ${e.map(t=>q(t.symbol,d`
            <div class="realized-row">
              <div>
                <strong>${t.symbol}</strong>
                <span>${I(t.soldShares)} sålda · ${t.isClosed?"positionen avslutad":`${I(t.shares)} kvar`}</span>
              </div>
              <div class="realized-value">
                <strong class="${R(t.realized)}">${B(t.realized)}</strong>
                <small class="${R(t.realized)}">${D(t.realizedPercent)}</small>
              </div>
            </div>
          `))}
    </div>
  `}function Fs(e,t){return d`
    <article class="mover-card">
      <span>${e}</span>
      <strong>${t.symbol}</strong>
      <p class="${R(t.gain)}">
        ${B(t.gain)} ${D(t.gainPercent)}
      </p>
    </article>
  `}function K(e){return d`
    <div class="empty-state">${e}</div>
  `}function Xn(e){return new Intl.DateTimeFormat("sv-SE",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(e))}function er(e){if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Importfilen \xE4r inte giltig JSON.");if(!Array.isArray(e.lots))throw new Error("Importfilen saknar k\xF6p.");if(e.sales!==void 0&&!Array.isArray(e.sales))throw new Error("Importfilens f\xF6rs\xE4ljningar har fel format.");if(!Array.isArray(e.watchlist))throw new Error("Importfilen saknar bevakningslista.");let t=e.lots.map(c=>Ds(c,"purchasedAt")),s=(e.sales??[]).map(c=>Ds(c,"soldAt")),n=e.watchlist.map(sr),r=Object.values(e.quotes&&typeof e.quotes=="object"?e.quotes:{}).map(nr),a={},i=e.settings&&typeof e.settings=="object"?e.settings:{};oe.includes(A(i.displayCurrency))&&(a.displayCurrency=A(i.displayCurrency)),de(i.lastRefresh)&&(a.lastRefresh=i.lastRefresh);let o=c=>c.filter(Boolean),l=[t,s,n,r].reduce((c,f)=>c+f.filter(m=>!m).length,0);return{lots:js(o(t)),sales:js(o(s)),watchlist:o(n),quotes:o(r),settings:a,skipped:l}}var tr=/^\d{4}-\d{2}-\d{2}$/;function Ds(e,t){if(!e||typeof e!="object")return null;let s=qt(e.symbol),n=Q(Number(e.quantity)),r=Number(e.price),a=String(e[t]??"");if(!s||!(n>0)||!Number.isFinite(r)||r<0||!tr.test(a)||Number.isNaN(Date.parse(a)))return null;let i=A(e.currency)||$,o=Number(e.fxRate),l=Number(e.fees),c=new Date().toISOString();return{id:typeof e.id=="string"&&e.id.length>0&&e.id.length<=64?e.id:crypto.randomUUID(),symbol:s,quantity:n,price:r,currency:i.slice(0,8),fxRate:i===$?1:Number.isFinite(o)&&o>0?o:1,[t]:a,fees:Number.isFinite(l)&&l>0?l:0,note:typeof e.note=="string"?e.note.slice(0,500):"",createdAt:de(e.createdAt)?e.createdAt:c,updatedAt:de(e.updatedAt)?e.updatedAt:c}}function sr(e){let t=qt(e?.symbol);return t?{symbol:t,addedAt:de(e.addedAt)?e.addedAt:new Date().toISOString()}:null}function nr(e){if(!e||typeof e!="object")return null;let t=qt(e.symbol),s=Number(e.price);if(!t||!Number.isFinite(s)||s<=0)return null;let n=r=>Number.isFinite(r)?r:void 0;return{symbol:t,name:typeof e.name=="string"?e.name.slice(0,120):t,price:s,previousClose:n(e.previousClose),change:n(e.change),changePercent:n(e.changePercent),currency:A(e.currency).slice(0,8)||$,rawCurrency:typeof e.rawCurrency=="string"?e.rawCurrency.slice(0,8):void 0,exchange:typeof e.exchange=="string"?e.exchange.slice(0,80):"",marketTime:de(e.marketTime)?e.marketTime:"",updatedAt:de(e.updatedAt)?e.updatedAt:new Date().toISOString()}}function qt(e){let t=O(e);return/^[A-Z0-9.^=_-]{1,24}$/.test(t)?t:""}function de(e){return typeof e=="string"&&e.length<=40&&!Number.isNaN(Date.parse(e))}function js(e){let t=new Set;return e.filter(s=>t.has(s.id)?!1:(t.add(s.id),!0))}
//# sourceMappingURL=app.js.map
