var Ae=`bedrock-${Math.random().toString(36).slice(2)}`,Ks=`<!--${Ae}-`,fe=`${Ae}-`,It=new WeakMap,Ne=class{constructor(e,s){this.strings=e,this.values=s,this._type="template-result"}getTemplate(){let e=It.get(this.strings);return e||(e=Qs(this.strings),It.set(this.strings,e)),e}};function d(t,...e){return new Ne(t,e)}function Ws(t){let e=!1;for(let s=t.length-1;s>=0;s--){if(t[s]===">")return!1;if(t[s]==="<")return!0}return!1}function Qs(t){let e=[],s="";for(let a=0;a<t.length;a++)s+=t[a],a<t.length-1&&(Ws(s)?(s+=`${fe}${a}`,e.push({type:"attr-pending",index:a})):(s+=`${Ks}${a}-->`,e.push({type:"node",index:a})));let n=document.createElement("template");n.innerHTML=s;let r=new Array(t.length-1).fill(null);return qt(n.content,r,[]),{element:n,parts:r}}function qt(t,e,s){if(t.nodeType===Node.ELEMENT_NODE){let r=[];for(let a of t.attributes)if(a.value.includes(fe)||a.name.includes(fe)){let i=(a.value+a.name).match(new RegExp(`${fe}(\\d+)`));if(i){let o=parseInt(i[1],10),l=a.name.replace(new RegExp(`${fe}\\d+`),""),u=l.startsWith("on-"),f=l.startsWith(".");e[o]={type:u?"event":f?"property":"attribute",path:[...s],name:u?l.slice(3):f?l.slice(1):l},r.push(a.name)}}for(let a of r)t.removeAttribute(a)}if(t.nodeType===Node.COMMENT_NODE){let r=t.textContent;if(r.startsWith(Ae+"-")){let a=parseInt(r.slice(Ae.length+1),10);e[a]={type:"node",path:[...s]}}}let n=Array.from(t.childNodes);for(let r=0;r<n.length;r++)qt(n[r],e,[...s,r])}function he(t){return t&&t._type==="template-result"}var Ue=new WeakMap,ze=Symbol("bedrock-key");function Ve(t,e){let s=Ue.get(e);s?s.strings===t.strings?Ke(s,t.values):(e.innerHTML="",s=Pt(t,e),Ue.set(e,s)):(s=Pt(t,e),Ue.set(e,s))}function Pt(t,e){let s=t.getTemplate(),n=s.element.content.cloneNode(!0),r=s.parts.map(a=>{if(!a)return null;let i=We(n,a.path);return{...a,node:i,value:void 0}});for(let a=0;a<t.values.length;a++)r[a]&&Ce(r[a],t.values[a]);return e.appendChild(n),{strings:t.strings,parts:r,container:e}}function Ke(t,e){for(let s=0;s<e.length;s++){let n=t.parts[s];n&&n.value!==e[s]&&Ce(n,e[s])}}function Ce(t,e){let s=t.value;switch(t.value=e,t.type){case"attribute":Gs(t.node,t.name,e);break;case"property":t.node[t.name]=e;break;case"event":Ys(t,e,s);break;case"node":Js(t,e,s);break}}function Gs(t,e,s){s==null||s===!1?t.removeAttribute(e):s===!0?t.setAttribute(e,""):t.setAttribute(e,String(s))}function Ys(t,e,s){s&&t.node.removeEventListener(t.name,s),e&&t.node.addEventListener(t.name,e)}function Js(t,e,s){let n=t.node;if(e==null)He(t);else if(he(e))Zs(t,e);else if(Array.isArray(e))Xs(t,e);else{He(t);let r=document.createTextNode(String(e));n.parentNode.insertBefore(r,n),t.nodes=[r]}}function He(t){t.nodes&&(t.nodes.forEach(e=>e.remove()),t.nodes=null),t.templateInstance&&(t.templateInstance=null),t.arrayItems&&(t.arrayItems.forEach(e=>e.nodes.forEach(s=>s.remove())),t.arrayItems=null)}function Zs(t,e){let s=t.node;if(t.templateInstance&&t.templateInstance.strings===e.strings){Ke(t.templateInstance,e.values);return}He(t);let n=e.getTemplate(),r=n.element.content.cloneNode(!0),a=n.parts.map(o=>{if(!o)return null;let l=We(r,o.path);return{...o,node:l,value:void 0}});for(let o=0;o<e.values.length;o++)a[o]&&Ce(a[o],e.values[o]);let i=Array.from(r.childNodes);s.parentNode.insertBefore(r,s),t.nodes=i,t.templateInstance={strings:e.strings,parts:a}}function Xs(t,e){let s=t.node,n=s.parentNode,r=t.arrayItems||[],a=new Map;for(let o of r)o.key!==void 0&&a.set(o.key,o);let i=[];for(let o=0;o<e.length;o++){let l=e[o],u=l&&l[ze]!==void 0?l[ze]:o,f=a.get(u);f?(a.delete(u),he(l)?f.instance&&f.instance.strings===l.strings?Ke(f.instance,l.values):(f.nodes.forEach(g=>g.remove()),f=Mt(l,u,s,n)):f.nodes[0]&&(f.nodes[0].textContent=String(l??""))):f=Mt(l,u,s,n),i.push(f)}for(let o of a.values())o.nodes.forEach(l=>l.remove());for(let o of i)for(let l of o.nodes)n.insertBefore(l,s);t.arrayItems=i}function Mt(t,e,s,n){if(he(t)){let r=t.getTemplate(),a=r.element.content.cloneNode(!0),i=r.parts.map(l=>{if(!l)return null;let u=We(a,l.path);return{...l,node:u,value:void 0}});for(let l=0;l<t.values.length;l++)i[l]&&Ce(i[l],t.values[l]);let o=Array.from(a.childNodes);return n.insertBefore(a,s),{key:e,nodes:o,instance:{strings:t.strings,parts:i}}}else{let r=document.createTextNode(String(t??""));return n.insertBefore(r,s),{key:e,nodes:[r],instance:null}}}function We(t,e){let s=t;for(let n of e)if(!s.childNodes||(s=s.childNodes[n],!s))return null;return s}function q(t,e){return e[ze]=t,e}var te=null,Ot=new Set,en=new WeakMap;function X(t){if(typeof t!="object"||t===null||t.__isReactive)return t;let e=new Map;return en.set(t,e),new Proxy(t,{get(n,r){if(r==="__isReactive")return!0;if(r==="__target")return n;te&&(e.has(r)||e.set(r,new Set),e.get(r).add(te),te.deps.add(e.get(r)));let a=n[r];return typeof a=="object"&&a!==null&&!a.__isReactive?(n[r]=X(a),n[r]):a},set(n,r,a){let i=Array.isArray(n),o=i?n.length:0,l=n[r];if(typeof a=="object"&&a!==null&&(a=X(a)),n[r]=a,l!==a&&e.has(r)){let u=e.get(r);for(let f of u)Qe(f)}if(i&&r!=="length"&&n.length!==o&&e.has("length")){let u=e.get("length");for(let f of u)Qe(f)}return!0},deleteProperty(n,r){if(r in n&&(delete n[r],e.has(r))){let a=e.get(r);for(let i of a)Qe(i)}return!0}})}function Je(t,e={}){let s={fn:t,deps:new Set,active:!0,immediate:e.immediate!==!1};return Ot.add(s),s.immediate&&Lt(s),()=>{s.active=!1,Ot.delete(s),Bt(s)}}function Lt(t){if(!t.active)return;Bt(t);let e=te;te=t;try{t.fn()}finally{te=e}}function Bt(t){for(let e of t.deps)e.delete(t);t.deps.clear()}var Ge=new Set,Ye=!1;function Qe(t){t.active&&(Ge.add(t),Ye||(Ye=!0,queueMicrotask(tn)))}function tn(){let t=[...Ge];Ge.clear(),Ye=!1;for(let e of t)Lt(e)}var sn=new Map,_=class extends HTMLElement{static tag=null;static shadow=!1;static properties={};static autoRegister=!0;#e={};#t=null;#i=null;#a=!1;#s=!1;#r=null;constructor(){super(),this.constructor.shadow?this.#i=this.attachShadow({mode:"open"}):this.#i=this,this.#n()}#n(){let e=this.constructor.properties;for(let[s,n]of Object.entries(e)){let r=typeof n=="function"?{type:n}:n;r.default!==void 0?this.#e[s]=typeof r.default=="function"?r.default():r.default:this.#e[s]=void 0,Object.defineProperty(this,s,{get:()=>this.#e[s],set:a=>{let i=this.#e[s],o=this.#l(a,r.type);i!==o&&(this.#e[s]=o,this.#u())},enumerable:!0,configurable:!0})}}#l(e,s){if(e==null||!s)return e;switch(s){case String:return String(e);case Number:return Number(e);case Boolean:return!!e;case Array:return Array.isArray(e)?e:[e];case Object:return typeof e=="object"?e:{value:e};default:return e}}get renderRoot(){return this.#i}get routeData(){return this.#r}set routeData(e){this.#r=e,this.#u()}connectedCallback(){this.#a=!0,this.#c(),this.#t=Je(()=>{this.#d()})}disconnectedCallback(){this.#a=!1,this.#t&&(this.#t(),this.#t=null)}#c(){let e=this.constructor.properties;for(let[s,n]of Object.entries(e)){let r=typeof n=="function"?{type:n}:n,a=s.replace(/([A-Z])/g,"-$1").toLowerCase();if(this.hasAttribute(a)){let i=this.getAttribute(a);this[s]=this.#o(i,r.type)}}}#o(e,s){if(!s)return e;switch(s){case Boolean:return e!==null&&e!=="false";case Number:return Number(e);case Array:case Object:try{return JSON.parse(e)}catch{return e}default:return e}}static get observedAttributes(){let e=this.properties||{};return Object.keys(e).map(s=>s.replace(/([A-Z])/g,"-$1").toLowerCase())}attributeChangedCallback(e,s,n){if(s===n)return;let r=e.replace(/-([a-z])/g,(a,i)=>i.toUpperCase());if(r in this.constructor.properties){let a=this.constructor.properties[r],i=typeof a=="function"?{type:a}:a;this[r]=this.#o(n,i.type)}}#u(){!this.#a||this.#s||(this.#s=!0,queueMicrotask(()=>{this.#s=!1,this.#a&&this.#d()}))}#d(){let e=this.render();e&&Ve(e,this.#i),this.updated()}render(){return null}updated(){}requestUpdate(){this.#u()}static register(e){let s=e||this.tag;if(!s)throw new Error("Component must have a tag name");return customElements.get(s)||(customElements.define(s,this),sn.set(s,this)),this}};function Te(t){return t.autoRegister&&t.tag&&t.register(),t}var V=class t{#e=[];#t=null;#i=null;#a=null;#s=!1;#r="";constructor(e={}){this.#e=e.routes||[],this.#s=e.hash||!1,this.#r=e.base||"",t.instance=this}start(){window.addEventListener("popstate",this.#n),this.#s&&window.addEventListener("hashchange",this.#n);let e=document.querySelector("router-outlet");return e&&this.setOutlet(e),this.#n(),this}stop(){window.removeEventListener("popstate",this.#n),this.#s&&window.removeEventListener("hashchange",this.#n)}setOutlet(e){this.#t=e,this.#n()}get currentPath(){if(this.#s)return window.location.hash.slice(1)||"/";let e=window.location.pathname;return this.#r&&e.startsWith(this.#r)&&(e=e.slice(this.#r.length)),e=e.replace(/\/index\.html$/,"/").replace(/\/$/,"")||"/",e}navigate(e,s={}){let n=this.#s?`#${e}`:`${this.#r}${e}`;s.replace?window.history.replaceState(null,"",n):window.history.pushState(null,"",n),this.#n()}#n=async()=>{let e=this.currentPath,s=this.#l(e);if(!s){console.warn(`No route matched for path: ${e}`);return}let{route:n,params:r}=s;this.#i={...n,params:r},await this.#o(n,r)};#l(e){for(let s of this.#e){let n=this.#c(s.path,e);if(n!==null)return{route:s,params:n}}return null}#c(e,s){let n=[],r=e.replace(/\//g,"\\/").replace(/:([^/]+)/g,(l,u)=>(n.push(u),"([^/]+)")).replace(/\*/g,".*"),a=new RegExp(`^${r}$`),i=s.match(a);if(!i)return null;let o={};return n.forEach((l,u)=>{o[l]=decodeURIComponent(i[u+1])}),o}async#o(e,s){if(!this.#t)return;let n={loading:!0,data:null,error:null,params:s},r=this.#a;if(!r||r.tagName.toLowerCase()!==e.component?(r=document.createElement(e.component),this.#a=r,r.routeData={...n},this.#t.innerHTML="",this.#t.appendChild(r)):r.routeData={...n},e.loader){try{let a=await e.loader(s);n.loading=!1,n.data=a}catch(a){n.loading=!1,n.error=a}r.routeData={...n}}else n.loading=!1,r.routeData={...n}}addRoute(e){this.#e.push(e)}removeRoute(e){this.#e=this.#e.filter(s=>s.path!==e)}get routes(){return[...this.#e]}get useHash(){return this.#s}};V.instance=null;var se=class extends _{static tag="router-outlet";connectedCallback(){super.connectedCallback(),V.instance&&V.instance.setOutlet(this)}render(){return null}};Te(se);var ne=class extends _{static tag="router-link";static shadow=!0;static properties={to:{type:String},replace:{type:Boolean,default:!1}};#e=e=>{e.preventDefault(),V.instance&&this.to&&V.instance.navigate(this.to,{replace:this.replace})};get href(){return this.to?V.instance&&V.instance.useHash?`#${this.to}`:this.to:"#"}render(){return d`
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
    `}};Te(ne);function Ze(t){return new V(t).start()}function Xe(t,e){V.instance?V.instance.navigate(t,e):console.warn("No router instance found")}var nn="stockroom-local-device";var Fe=["lots","sales","watchlist","quotes","histories","settings"],pe;async function Ut(){let[t,e,s,n,r,a]=await Promise.all([re("lots"),re("sales"),re("watchlist"),re("quotes"),re("histories"),re("settings")]);return{lots:t.sort((i,o)=>o.purchasedAt.localeCompare(i.purchasedAt)),sales:e.sort((i,o)=>o.soldAt.localeCompare(i.soldAt)),watchlist:s.sort((i,o)=>i.symbol.localeCompare(o.symbol)),quotes:Object.fromEntries(n.map(i=>[i.symbol,i])),histories:Object.fromEntries(r.map(i=>[i.symbol,i])),settings:Object.fromEntries(a.map(i=>[i.key,i.value]))}}async function zt(t){await me("lots",t)}async function Ht(t){await st("lots",t)}async function Vt(t){await me("sales",t)}async function Kt(t){await st("sales",t)}async function Wt(t){await me("watchlist",t)}async function Qt(t){await st("watchlist",t)}async function Gt(t){await me("quotes",t)}async function tt(t,e){await me("settings",{key:t,value:e})}async function Yt(t){let e=await ge();await new Promise((s,n)=>{let r=e.transaction(Fe,"readwrite");r.oncomplete=()=>s(),r.onerror=()=>n(r.error),r.onabort=()=>n(r.error);for(let a of Fe)r.objectStore(a).clear();for(let a of et(t.lots))r.objectStore("lots").put(a);for(let a of et(t.sales))r.objectStore("sales").put(a);for(let a of et(t.watchlist))r.objectStore("watchlist").put(a);for(let a of _t(t.quotes))r.objectStore("quotes").put(a);for(let a of _t(t.histories))r.objectStore("histories").put(a);for(let[a,i]of Object.entries(t.settings??{}))r.objectStore("settings").put({key:a,value:i})})}async function Jt(){let t=await ge();await new Promise((e,s)=>{let n=t.transaction(Fe,"readwrite");n.oncomplete=()=>e(),n.onerror=()=>s(n.error),n.onabort=()=>s(n.error);for(let r of Fe)n.objectStore(r).clear()})}async function re(t){let e=await ge();return await new Promise((s,n)=>{let a=e.transaction(t,"readonly").objectStore(t).getAll();a.onsuccess=()=>s(a.result??[]),a.onerror=()=>n(a.error)})}async function me(t,e){let s=await ge();await new Promise((n,r)=>{let a=s.transaction(t,"readwrite");a.oncomplete=()=>n(),a.onerror=()=>r(a.error),a.onabort=()=>r(a.error),a.objectStore(t).put(e)})}async function st(t,e){let s=await ge();await new Promise((n,r)=>{let a=s.transaction(t,"readwrite");a.oncomplete=()=>n(),a.onerror=()=>r(a.error),a.onabort=()=>r(a.error),a.objectStore(t).delete(e)})}function ge(){return pe||(pe=new Promise((t,e)=>{let s=indexedDB.open(nn,2);s.onerror=()=>{pe=void 0,e(s.error)},s.onblocked=()=>{console.warn("Stockroom: databasen uppgraderas men en annan flik h\xE5ller den \xF6ppen.")},s.onsuccess=()=>{let n=s.result;n.onversionchange=()=>{n.close(),pe=void 0},t(n)},s.onupgradeneeded=()=>{let n=s.result;if(!n.objectStoreNames.contains("lots")){let r=n.createObjectStore("lots",{keyPath:"id"});r.createIndex("symbol","symbol",{unique:!1}),r.createIndex("purchasedAt","purchasedAt",{unique:!1})}if(!n.objectStoreNames.contains("sales")){let r=n.createObjectStore("sales",{keyPath:"id"});r.createIndex("symbol","symbol",{unique:!1}),r.createIndex("soldAt","soldAt",{unique:!1})}n.objectStoreNames.contains("watchlist")||n.createObjectStore("watchlist",{keyPath:"symbol"}),n.objectStoreNames.contains("quotes")||n.createObjectStore("quotes",{keyPath:"symbol"}),n.objectStoreNames.contains("histories")||n.createObjectStore("histories",{keyPath:"symbol"}),n.objectStoreNames.contains("settings")||n.createObjectStore("settings",{keyPath:"key"})}})),pe}function et(t){return Array.isArray(t)?t:[]}function _t(t){return Array.isArray(t)?t:Object.values(t??{})}function L(t){return String(t??"").trim().toUpperCase().replace(/\s+/g,"")}async function Ee(t){let e=[...new Set(t.map(L).filter(Boolean))];return e.length===0?{quotes:[],errors:[]}:await Zt(`/api/quotes?symbols=${encodeURIComponent(e.join(","))}`)}async function nt(t){let e=t.trim();return e?(await Zt(`/api/search?q=${encodeURIComponent(e)}`)).results??[]:[]}async function Zt(t){let e=new AbortController,s=setTimeout(()=>e.abort(),12e3);try{let n=await fetch(t,{headers:{Accept:"application/json"},signal:e.signal}),r=await n.text();if(!n.ok)throw new Error(r||`F\xF6rfr\xE5gan misslyckades med ${n.status}`);return JSON.parse(r)}catch(n){throw n.name==="AbortError"?new Error("F\xF6rfr\xE5gan om marknadsdata tog f\xF6r l\xE5ng tid"):n}finally{clearTimeout(s)}}var rn="/sync";function rt(t={}){let e=(t.baseUrl||rn).replace(/\/$/,""),s=t.fetch||globalThis.fetch.bind(globalThis),n=t.EventSource||(typeof EventSource<"u"?EventSource:null),r=new Map,a=new Map,i=!1,o=!1,l=null,u=!1,f=500;function g(S,j){r.set(S,j),i&&x(S,0)}async function y(S){if(!n||!i||a.has(S))return;let j=r.get(S);if(!j)return;let p=await j.getCursor();if(!i||!r.has(S)||a.has(S))return;let h=`${e}/${encodeURIComponent(S)}/stream?since=${p}`,k=new n(h);a.set(S,k),k.addEventListener("change",async $=>{try{let N=JSON.parse($.data);await j.onServerRow(N.row,N.cursor)}catch(N){console.warn("[bedrockjs/sync] bad SSE payload",N)}}),k.onerror=()=>{}}function x(S,j){setTimeout(()=>{y(S).catch(p=>{console.warn(`[bedrockjs/sync] stream setup failed for "${S}"`,p),i&&r.has(S)&&!a.has(S)&&x(S,f)})},j)}function b(){if(!i){i=!0;for(let S of r.keys())x(S,0);typeof globalThis.addEventListener=="function"&&globalThis.addEventListener("online",()=>T(0)),T(0)}}function m(){i=!1;for(let S of a.values())S.close();a.clear()}function T(S=f){o||(o=!0,setTimeout(()=>{o=!1,M().catch(()=>{f=Math.min(f*2,3e4),T()})},S))}async function M(){return l?(u=!0,l):(l=(async()=>{try{do u=!1,await P();while(u)}finally{l=null}})(),l)}async function P(){if(typeof navigator<"u"&&navigator.onLine===!1)return;let S=!1;for(let[j,p]of r.entries()){let h=await p.getOutbox();if(!h||h.length===0)continue;let k=h.map(H=>H.op),$=await s(`${e}/${encodeURIComponent(j)}/ops`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({protocol:1,ops:k})});if(!$.ok)throw new Error(`sync POST failed: ${$.status}`);let N=await $.json(),z=[];for(let H=0;H<h.length;H++){let v=N.results[H];v&&(v.status==="applied"||v.status==="duplicate"?(z.push(h[H].seq),v.row&&v.cursor!=null&&await p.onServerRow(v.row,v.cursor)):v.status==="rejected"&&(z.push(h[H].seq),p.onRejected?.(v.opId,v.error||"rejected")))}z.length&&await p.ackOutbox(z),S=!0}S&&(f=500)}return{registerModel:g,start:b,stop:m,drain:M,scheduleDrain:T,get baseUrl(){return e}}}var J="__outbox__",ae="__cursor__",es=new Map;function at(t,e){let s=es.get(t);if(!s)return s={models:new Set(e),db:null,promise:Promise.resolve(null)},s.promise=je(t,s,void 0),es.set(t,s),s.promise;for(let n of e)s.models.add(n);return s.promise=s.promise.catch(()=>null).then(n=>ns(n,t,s)),s.promise}function je(t,e,s){return an(t,[...e.models],s).then(n=>(e.db=n,n.onversionchange=()=>{rs(e,n)},n))}function an(t,e,s){return new Promise((n,r)=>{let a=s===void 0?indexedDB.open(t):indexedDB.open(t,s);a.onupgradeneeded=()=>{let i=a.result;i.objectStoreNames.contains(J)||i.createObjectStore(J,{keyPath:"seq",autoIncrement:!0}),i.objectStoreNames.contains(ae)||i.createObjectStore(ae);for(let o of e)i.objectStoreNames.contains(o)||i.createObjectStore(o,{keyPath:"id"})},a.onsuccess=()=>n(a.result),a.onerror=()=>r(a.error),a.onblocked=()=>{console.warn(`[bedrockjs/sync] IndexedDB upgrade for "${t}" is blocked by another open tab or connection`)}})}async function ns(t,e,s){if((!t||s.db!==t)&&(t=await je(e,s,void 0)),[...s.models].filter(i=>!t.objectStoreNames.contains(i)).length===0)return t;let a=t.version+1;rs(s,t);try{return await je(e,s,a)}catch(i){if(i&&typeof i=="object"&&i.name==="VersionError"){let o=await je(e,s,void 0);return ns(o,e,s)}throw i}}function rs(t,e){t.db===e&&(t.db=null),e.onversionchange=null,e.close()}function De(t){return new Promise((e,s)=>{t.onsuccess=()=>e(t.result),t.onerror=()=>s(t.error)})}function as(t){return new Promise((e,s)=>{t.oncomplete=()=>e(void 0),t.onerror=()=>s(t.error),t.onabort=()=>s(t.error||new Error("transaction aborted"))})}function Ie(t,e,s,n,r){let a=t.transaction([e,J],"readwrite"),i=a.objectStore(e);s?i.put(s):n&&i.delete(n);let o=a.objectStore(J).add({op:r});return Promise.all([De(o),as(a)]).then(([l])=>l)}function is(t,e,s,n){return new Promise((r,a)=>{let i=t.transaction([e,ae],"readwrite"),o=i.objectStore(e),l=i.objectStore(ae),u=o.get(s.id),f=l.get(e),g=null,y=0,x=!1,b=!1,m=s;function T(){!x||!b||(m=on(g,s),o.put(m),l.put(Math.max(y,n),e))}u.onsuccess=()=>{g=u.result??null,x=!0,T()},f.onsuccess=()=>{let M=f.result;y=typeof M=="number"?M:0,b=!0,T()},i.oncomplete=()=>r(m),i.onerror=()=>a(i.error),i.onabort=()=>a(i.error||new Error("transaction aborted"))})}async function os(t,e){let s=t.transaction(ae,"readonly"),n=await De(s.objectStore(ae).get(e));return typeof n=="number"?n:0}async function ls(t,e){let s=t.transaction(e,"readonly");return await De(s.objectStore(e).getAll())}async function cs(t){let e=t.transaction(J,"readonly");return await De(e.objectStore(J).getAll())}async function us(t,e){let s=t.transaction(J,"readwrite"),n=s.objectStore(J);for(let r of e)n.delete(r);await as(s)}function on(t,e){if(!t)return e;let s=ss(e);if((t.deletedAt??0)>s)return ln(t,e);if(e.deletedAt){let r=ss(t);return!t.deletedAt&&r>e.deletedAt?ts(t,e):e}return ts(t,e)}function ts(t,e){let s={...e.data??{}},n={...e.fieldTs??{}};for(let[r,a]of Object.entries(t.data??{})){let i=t.fieldTs?.[r]??0,o=n[r]??0;i>o&&(s[r]=a,n[r]=i)}return{id:e.id,rev:Math.max(t.rev??0,e.rev??0),serverTs:Math.max(t.serverTs??0,e.serverTs??0),fieldTs:n,data:s}}function ln(t,e){return{...t,rev:Math.max(t.rev??0,e.rev??0),serverTs:Math.max(t.serverTs??0,e.serverTs??0)}}function ss(t){let e=t.deletedAt??0;for(let s of Object.values(t.fieldTs??{}))s>e&&(e=s);return e}function qe(){let t=globalThis.crypto;return t&&typeof t.randomUUID=="function"?t.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}var it=0;function Pe(){let t=Date.now();return it=Math.max(t,it+1),it}function ot(t,e,s){let n=s.dbName||"bedrockjs-sync",r=X([]),a=new Map,i=new Map;function o(p){return{id:p.id,rev:p.rev,...p.data}}function l(p){if(p.deletedAt){if(i.set(p.id,p),!a.get(p.id))return;a.delete(p.id);let N=r.findIndex(z=>z.id===p.id);N>=0&&r.splice(N,1);return}i.set(p.id,p);let h=o(p),k=a.get(p.id);if(k){for(let $ of Object.keys(h))k[$]!==h[$]&&(k[$]=h[$]);for(let $ of Object.keys(k))$ in h||delete k[$]}else r.push(h),a.set(p.id,r[r.length-1])}async function u(p){try{return await p(await at(n,[t]))}catch(h){if(!cn(h))throw h;return await p(await at(n,[t]))}}let f=(async()=>{let p=await u(h=>ls(h,t));for(let h of p)l(h)})();function g(p,h){let k=Pe(),$={};for(let N of Object.keys(h))$[N]=k;return{id:p,rev:0,serverTs:k,fieldTs:$,data:h}}async function y(p){if(!p||typeof p.id!="string")throw new Error(`${t}.create: 'id' (string) is required`);await f;let h=ds(e,p),k=g(p.id,h),$={opId:qe(),type:"create",model:t,id:p.id,data:h,clientTs:k.serverTs};return l(k),await u(N=>Ie(N,t,k,null,$)),s.client.scheduleDrain(0),o(k)}async function x(p,h){await f;let k=a.get(p);if(!k)throw new Error(`${t}.update: no record ${p}`);let $=i.get(p),N=ds(e,h),z=Pe(),H={...$?.data??fs(k),...N},v={...$?.fieldTs??{}};for(let de of Object.keys(N))v[de]=z;let O={id:p,rev:$?.rev??k.rev??0,serverTs:z,fieldTs:v,data:H};l(O);let ue={opId:qe(),type:"update",model:t,id:p,patch:N,clientTs:z};return await u(de=>Ie(de,t,O,null,ue)),s.client.scheduleDrain(0),o(O)}async function b(p){await f;let h=a.get(p);if(!h)return;let k=i.get(p),$=Pe(),N={id:p,rev:k?.rev??h.rev??0,serverTs:$,fieldTs:k?.fieldTs??{},deletedAt:$,data:k?.data??fs(h)};l(N);let z={opId:qe(),type:"delete",model:t,id:p,clientTs:$};await u(H=>Ie(H,t,N,null,z)),s.client.scheduleDrain(0)}function m(p){let h=a.get(p);if(h)return h;r.length}function T(){return r}function M(p){return r.filter(p)}let P=new Set;function S(p){return P.add(p),p(r),()=>P.delete(p)}function j(){for(let p of P)p(r)}return s.client.registerModel(t,{onServerRow:async(p,h)=>{let k=await u($=>is($,t,p,h));l(k),j()},getCursor:async()=>await u(p=>os(p,t)),getOutbox:async()=>(await u(h=>cs(h))).filter(h=>h.op.model===t),ackOutbox:async p=>{await u(h=>us(h,p))}}),{name:t,schema:e,ready:f,create:y,update:x,delete:b,get:m,all:T,where:M,subscribe:S}}function ds(t,e){let s={};for(let[n,r]of Object.entries(t.fields))if(!(n==="id"||n==="rev")&&n in e){let a=e[n];r==="datetime"&&a instanceof Date&&(a=a.toISOString()),s[n]=a}return s}function fs(t){let{id:e,rev:s,...n}=t;return n}function cn(t){let e=t&&typeof t=="object"?t.name:"";return e==="InvalidStateError"||e==="NotFoundError"}var ms="history",un="stockroom-sync",dn=5*6e4,ye=rt({baseUrl:"/sync"}),gs=new Map,fn=ye.registerModel.bind(ye);ye.registerModel=(t,e)=>{gs.set(t,e),fn(t,e)};var lt=ot(ms,{fields:{id:"string",rev:"number",symbol:"string",name:"string",currency:"string",interval:"string",from:"string",to:"string",count:"number",points:"string",updatedAt:"datetime",source:"string"}},{client:ye,dbName:un});typeof window<"u"&&ye.start();var Me=new Map;function ys(t,e={}){let s=L(t);if(!s)return Promise.reject(new Error("Symbol saknas"));let n=Me.get(s),r=e.maxAgeMs??dn;if(n&&!e.refresh&&Date.now()-n.at<r)return n.promise;let a=(async()=>{let i=new URLSearchParams({symbol:s});e.refresh&&i.set("refresh","1");let o=await fetch(`/api/history?${i}`,{headers:{Accept:"application/json"}}),l=await o.text();if(!o.ok)throw new Error(pn(l)??`Kurshistorik f\xF6r ${s} kunde inte h\xE4mtas (${o.status})`);let u=JSON.parse(l);return u.row&&await gs.get(ms)?.onServerRow(u.row,0),u})();return Me.set(s,{at:Date.now(),promise:a}),a.catch(()=>{Me.get(s)?.promise===a&&Me.delete(s)}),a}var hs=new Map;function ct(t){let e=L(t),s=lt.get(e);if(!s)return null;let n=s.points;if(typeof n!="string")return null;let r=hs.get(e);return(!r||r.source!==n)&&(r={source:n,points:hn(n)},hs.set(e,r)),{symbol:s.symbol??e,name:s.name??"",currency:s.currency??"",interval:s.interval??"1d",updatedAt:s.updatedAt??"",source:s.source??"",points:r.points}}var ps={"1mo":31,"3mo":92,"6mo":183,"1y":366,"2y":731,"5y":1/0};function bs(t,e){let s=ps[e]??ps["6mo"];if(!Number.isFinite(s))return t;let n=new Date(Date.now()-s*864e5).toISOString().slice(0,10);return t.filter(r=>r.date>=n)}function vs(t,e,s=1){let n=Number(e?.price);if(!Number.isFinite(n)||n<=0||t.length===0)return t;let r=e.marketTime?String(e.marketTime).slice(0,10):new Date().toISOString().slice(0,10),a=t.at(-1);if(!a||r<a.date)return t;let i={date:r,close:n*s};return r===a.date?[...t.slice(0,-1),i]:[...t,i]}function hn(t){try{let e=JSON.parse(t);return Array.isArray(e)?e.map(s=>Array.isArray(s)?{date:String(s[0]),close:Number(s[1])}:{date:String(s?.date??""),close:Number(s?.close)}).filter(s=>s.date&&Number.isFinite(s.close)&&s.close>0):[]}catch{return[]}}function pn(t){try{let e=JSON.parse(t);return typeof e?.error=="string"?e.error:null}catch{return t||null}}var be="SEK",w=be,G=1e-6,Le=["SEK","EUR","USD","NOK","DKK","GBP","CHF","CAD","JPY"],ve=["SEK","EUR","USD"];function ie(t){let e=Number(t?.fxRate);return Number.isFinite(e)&&e>0?e:1}function $e(t){return F(t?.currency)||w}function Be(t){return(Number(t?.price)||0)*ie(t)}function we(t,e){let s=Math.max(0,Number(t?.quantity)||0),n=Math.max(0,Number(t?.price)||0),r=Math.max(0,Number(t?.fees)||0),a=s*n;return(e==="buy"?a+r:a-r)*ie(t)}function Q(t){let e=Number(t);return Number.isFinite(e)?Math.round(e*1e6)/1e6:0}function xe(t,e){let s=[...t.map(x=>({type:"buy",date:x.purchasedAt??"",order:0,createdAt:x.createdAt??"",record:x})),...e.map(x=>({type:"sell",date:x.soldAt??"",order:1,createdAt:x.createdAt??"",record:x}))].sort(mn),n=0,r=0,a=0,i=0,o=0,l=0,u=0,f=new Map,g=[];for(let x of s){let b=x.record,m=Math.max(0,Number(b.quantity)||0),T=ie(b),M=Math.max(0,Number(b.price)||0)*T,P=Math.max(0,Number(b.fees)||0)*T;if(x.type==="buy")n+=m,r+=m*M+P,u+=m*M+P;else{let S=n,j=n>G?r/n:0,p=Math.min(m,Math.max(0,n)),h=j*p,k=m*M-P,$=k-h;n-=m,r=Math.max(0,r-h),a+=$,i+=h,o+=m,l+=k,f.set(b.id,{sharesBefore:S,averageCost:j,costBasis:h,netProceeds:k,gain:$,gainPercent:h>0?$/h*100:0,sharesAfter:Math.max(0,n)})}Math.abs(n)<G?(n=0,r=0):n<0&&(r=0),g.push({event:x,shares:n})}let y=Math.max(0,n);return{shares:y,cost:r,averageCost:y>0?r/y:0,realized:a,realizedCost:i,realizedPercent:i>0?a/i*100:0,soldShares:o,proceeds:l,boughtCost:u,buyCount:t.length,sellCount:e.length,saleResults:f,timeline:g}}function $s(t,e,s){let n=xs(s),r=xe(t,[...e,n]),a=!1,i=1/0;for(let o of r.timeline)o.event.record===n&&(a=!0),a&&(i=Math.min(i,o.shares));return i===1/0?0:Q(Math.max(0,i))}function ws(t,e,s){let n={...xs(s.soldAt),...s,id:ut},r=xe(t,[...e,n]);return{...r.saleResults.get(ut),remainingShares:r.shares,remainingCost:r.cost}}var ut="__stockroom_probe__";function xs(t){return{id:ut,quantity:0,price:0,fees:0,soldAt:t||"",createdAt:"~~~~"}}function mn(t,e){return t.date!==e.date?t.date<e.date?-1:1:t.order!==e.order?t.order-e.order:t.createdAt!==e.createdAt?t.createdAt<e.createdAt?-1:1:0}function ks(t,e,s,n,r={},a=[]){let i=new Set(e.map(o=>o.symbol));for(let o of t)i.add(o.symbol);for(let o of a)i.add(o.symbol);return[...i].map(o=>{let l=t.filter($=>$.symbol===o).sort(($,N)=>N.purchasedAt.localeCompare($.purchasedAt)),u=a.filter($=>$.symbol===o).sort(($,N)=>N.soldAt.localeCompare($.soldAt)),f=xe(l,u),g=s[o],y=ft(g?.currency,r),x=gn(Number.isFinite(g?.price)?g.price:0,g?.currency,r),b=f.shares,m=f.cost,T=b*x,M=T-m,P=m>0?M/m*100:0,S=Number.isFinite(g?.previousClose)?g.previousClose*y:x,j=b*(x-S),p=S>0?(x-S)/S*100:0,h=b>G,k=l.length>0||u.length>0;return{symbol:o,name:g?.name??o,quote:g,lots:l,sales:u,ledger:f,history:yn(n[o],g?.currency,r),sourceCurrency:g?.currency??be,conversionRate:y,shares:b,cost:m,averageCost:f.averageCost,price:x,marketValue:T,gain:M,gainPercent:P,dayChange:j,dayChangePercent:p,realized:f.realized,realizedCost:f.realizedCost,realizedPercent:f.realizedPercent,soldShares:f.soldShares,proceeds:f.proceeds,sellCount:f.sellCount,buyCount:f.buyCount,isHolding:h,hasTrades:k,isClosed:k&&!h}}).sort((o,l)=>l.marketValue!==o.marketValue?l.marketValue-o.marketValue:o.symbol.localeCompare(l.symbol))}function Ss(t){let e=t.filter(y=>y.isHolding),s=t.filter(y=>y.sellCount>0),n=ee(e.map(y=>y.marketValue)),r=ee(e.map(y=>y.cost)),a=n-r,i=ee(e.map(y=>y.dayChange)),o=ee(t.map(y=>y.realized)),l=ee(t.map(y=>y.realizedCost)),u=ee(t.map(y=>y.proceeds)),f=e.toSorted((y,x)=>x.gainPercent-y.gainPercent)[0],g=e.toSorted((y,x)=>y.gainPercent-x.gainPercent)[0];return{holdingsCount:e.length,trackedCount:t.length,closedCount:t.filter(y=>y.isClosed).length,totalValue:n,totalCost:r,totalGain:a,totalGainPercent:r>0?a/r*100:0,dayChange:i,dayChangePercent:n-i>0?i/(n-i)*100:0,cashBasis:r,realized:o,realizedCost:l,realizedPercent:l>0?o/l*100:0,proceeds:u,salesCount:ee(t.map(y=>y.sellCount)),tradedCount:s.length,totalReturn:a+o,best:f,worst:g}}function D(t,e=be){let s=Number.isFinite(t)?t:0;try{return new Intl.NumberFormat("sv-SE",{style:"currency",currency:e,maximumFractionDigits:Math.abs(s)>=1e3?0:2}).format(s)}catch{return`${s.toFixed(2)} ${e}`}}function dt(t,e=be){let s=Number.isFinite(t)?t:0,n=D(Math.abs(s),e);return s>.004?`+${n}`:s<-.004?`\u2212${n}`:n}function gn(t,e,s={}){return(Number.isFinite(t)?t:0)*ft(e,s)}function oe(t,e,s={}){let n=Number.isFinite(t)?t:0,r=F(e);if(!r||r===w)return n;let a=s[r];return!Number.isFinite(a)||a<=0?null:n/a}function ft(t,e={}){let s=F(t);return!s||s===be?1:Number.isFinite(e[s])?e[s]:1}function le(t,e=2){let s=Number.isFinite(t)?t:0;return new Intl.NumberFormat("sv-SE",{minimumFractionDigits:e,maximumFractionDigits:e}).format(s)}function I(t){let e=Number.isFinite(t)?t:0;return new Intl.NumberFormat("sv-SE",{minimumFractionDigits:0,maximumFractionDigits:4}).format(e)}function E(t){let e=Number.isFinite(t)?t:0;return`${new Intl.NumberFormat("sv-SE",{signDisplay:"exceptZero",minimumFractionDigits:2,maximumFractionDigits:2}).format(e)}%`}function K(t){if(!t)return"\u2013";let e=new Date(`${t}T00:00:00`);return Number.isNaN(e.getTime())?String(t):new Intl.DateTimeFormat("sv-SE",{day:"numeric",month:"short",year:"numeric"}).format(e)}function R(t){return t>1e-4?"positive":t<-1e-4?"negative":"neutral"}function ht(t,e=180,s=56){let n=t.map(l=>l.close).filter(l=>Number.isFinite(l)&&l>0);if(n.length<2)return"";let r=Math.min(...n),i=Math.max(...n)-r||1,o=e/(n.length-1);return n.map((l,u)=>{let f=u*o,g=s-(l-r)/i*s;return`${u===0?"M":"L"} ${f.toFixed(2)} ${g.toFixed(2)}`}).join(" ")}function ee(t){return t.reduce((e,s)=>e+(Number(s)||0),0)}function yn(t,e,s){if(!t?.points)return t;let n=ft(e,s);return n===1?t:{...t,points:t.points.map(r=>({...r,open:Oe(r.open,n),high:Oe(r.high,n),low:Oe(r.low,n),close:Oe(r.close,n)}))}}function Oe(t,e){return Number.isFinite(t)?t*e:t}function F(t){return String(t??"").trim().toUpperCase()}function ke(t){let e=String(t??"").trim(),n={GBp:["GBP",100],GBX:["GBP",100],ZAc:["ZAR",100],ILA:["ILS",100]}[e];return n?{currency:n[0],divisor:n[1]}:{currency:F(e),divisor:1}}var c=X({ready:!1,lots:[],sales:[],watchlist:[],quotes:{},fxRates:{},settings:{refreshMinutes:5,lastRefresh:"",displayCurrency:w},refreshing:!1,error:"",notice:"",searchResults:[],searchLoading:!1,sellRequest:null,historyStatus:{}});ne.register();se.register();var bt=class extends _{static tag="app-root";refresh=()=>{Ms({forceHistory:!1})};render(){let e=Y();return d`
      <div class="app-shell">
        <header class="topbar">
          <div class="brand-block">
            <div class="brand-mark">SR</div>
            <div>
              <p class="brand-title">Stockroom</p>
              <p class="brand-subtitle">portfölj på enheten</p>
            </div>
          </div>

          <nav class="nav-tabs">
            <router-link to="/">Översikt</router-link>
            <router-link to="/holdings">Innehav</router-link>
            <router-link to="/transactions">Transaktioner</router-link>
            <router-link to="/research">Sök</router-link>
            <router-link to="/settings">Inställningar</router-link>
          </nav>

          <div class="topbar-actions">
            <div class="segmented" role="group" aria-label="Visningsvaluta">
              ${ve.map(s=>q(s,d`
                    <button
                      type="button"
                      class="${`segment ${e===s?"active":""}`}"
                      aria-pressed="${e===s}"
                      title="${`Visa portf\xF6ljen i ${s}`}"
                      on-click="${()=>Es(s)}"
                    >
                      ${s}
                    </button>
                  `))}
            </div>
            <button
              class="refresh-button"
              on-click="${this.refresh}"
              disabled="${c.refreshing}"
            >
              ${c.refreshing?"Uppdaterar":"Uppdatera"}
            </button>
          </div>
        </header>

        ${c.error?d`
            <div class="status-banner error">
              <span>${c.error}</span>
              <button on-click="${()=>c.error=""}">Stäng</button>
            </div>
          `:""} ${c.notice?d`
            <div class="status-banner notice">
              <span>${c.notice}</span>
              <button on-click="${()=>c.notice=""}">Stäng</button>
            </div>
          `:""}

        <main class="workspace">
          ${c.ready?d`
              <router-outlet></router-outlet>
            `:d`
              <section class="loading-panel">Laddar lokal portfölj...</section>
            `}
        </main>

        ${c.sellRequest?d`
            <sell-dialog></sell-dialog>
          `:""}
      </div>
    `}},vt=class extends _{static tag="dashboard-page";render(){let e=Z(),s=Ss(e),n=e.filter(a=>a.isHolding),r=e.filter(a=>a.sellCount>0).sort((a,i)=>i.realized-a.realized);return d`
      <section class="dashboard-grid">
        <div class="summary-band">
          <article class="metric primary-metric">
            <span class="metric-label">Portföljvärde</span>
            <strong>${A(s.totalValue)}</strong>
            <span class="${`metric-delta ${R(s.totalGain)}`}">
              ${B(s.totalGain)} · ${E(s.totalGainPercent)} orealiserat
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">Dagens rörelse</span>
            <strong class="${R(s.dayChange)}">
              ${B(s.dayChange)}
            </strong>
            <span class="${`metric-delta ${R(s.dayChange)}`}">
              ${E(s.dayChangePercent)}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">Realiserat</span>
            <strong class="${R(s.realized)}">
              ${B(s.realized)}
            </strong>
            <span class="${`metric-delta ${s.salesCount?R(s.realized):"neutral"}`}">
              ${s.salesCount?`${E(s.realizedPercent)} \xB7 ${ce(s.salesCount,"f\xF6rs\xE4ljning","f\xF6rs\xE4ljningar")}`:"inga f\xF6rs\xE4ljningar \xE4nnu"}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">Anskaffningsvärde</span>
            <strong>${A(s.totalCost)}</strong>
            <span class="metric-delta neutral">${ce(s.holdingsCount,"innehav","innehav")}</span>
          </article>
          <article class="metric">
            <span class="metric-label">Totalt resultat</span>
            <strong class="${R(s.totalReturn)}">
              ${B(s.totalReturn)}
            </strong>
            <span
              class="metric-delta neutral">realiserat + orealiserat · ${Un()}</span>
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
                  on-click="${()=>Re()}"
                >
                  Sälj innehav
                </button>
              `:""}
          </div>
          ${n.length?d`
              <position-table .positions="${n}"></position-table>
            `:W("L\xE4gg till ditt f\xF6rsta k\xF6p f\xF6r att b\xF6rja f\xF6lja resultatet.")}
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
          ${n.length?Kn(n,s.totalValue):W("F\xF6rdelningen visas efter minst ett sparat k\xF6p.")}
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
                ${Ns("B\xE4st",s.best)} ${Ns("Svagast",s.worst)}
              </div>
            `:W("Utveckling visas n\xE4r kurserna har laddats.")}
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
          ${r.length?Wn(r):W("H\xE4r samlas resultatet n\xE4r du s\xE4ljer hela eller delar av ett innehav.")}
        </section>
      </section>
    `}},$t=class extends _{static tag="add-lot-form";static properties={symbol:{type:String,default:""},quantity:{type:String,default:""},price:{type:String,default:""},currency:{type:String,default:w},fxRate:{type:String,default:"1"},fxRateDirty:{type:Boolean,default:!1},purchasedAt:{type:String,default:U},fees:{type:String,default:"0"},note:{type:String,default:""},message:{type:String,default:""},suggestions:{type:Array,default:()=>[]},lookupLoading:{type:Boolean,default:!1},suggestionOpen:{type:Boolean,default:!1},busy:{type:Boolean,default:!1}};searchTimer=null;lookupToken=0;submit=async e=>{e.preventDefault();let s=L(this.symbol),n=Number(this.quantity),r=Number(this.price),a=Number(this.fees||0),i=F(this.currency)||w,o=i===w?1:Number(this.fxRate);if(!s||!Number.isFinite(n)||n<=0){this.message="Ange en aktiesymbol och ett positivt antal aktier.";return}if(!Number.isFinite(r)||r<=0){this.message=`Ange k\xF6ppriset per aktie i ${i}.`;return}if(!Number.isFinite(o)||o<=0){this.message=`Ange v\xE4xelkursen (SEK per ${i}).`;return}this.busy=!0;try{await jn({symbol:s,quantity:n,price:r,currency:i,fxRate:o,purchasedAt:this.purchasedAt||U(),fees:Number.isFinite(a)&&a>0?a:0,note:this.note.trim()}),this.message=`Sparade ${I(n)} ${s} \xE0 ${D(r,i)}${i===w?"":` (${A(r*o)})`}.`,this.symbol="",this.quantity="",this.price="",this.currency=w,this.fxRate="1",this.fxRateDirty=!1,this.fees="0",this.note="",this.purchasedAt=U(),this.suggestions=[],this.suggestionOpen=!1}catch(l){this.message=l.message}finally{this.busy=!1}};handleSymbolInput=e=>{this.symbol=e.target.value.toUpperCase(),this.queueTickerSearch(this.symbol)};queueTickerSearch(e){clearTimeout(this.searchTimer);let s=L(e);if(!s){this.suggestions=[],this.suggestionOpen=!1,this.lookupLoading=!1;return}this.searchTimer=setTimeout(()=>{this.runTickerSearch(s)},180)}async runTickerSearch(e){if(!this.symbolInputFocused())return;let s=++this.lookupToken;this.lookupLoading=!0,this.suggestionOpen=!0;try{let n=await nt(e);if(s!==this.lookupToken)return;this.suggestions=n.filter(r=>r.symbol).slice(0,7)}catch(n){if(s!==this.lookupToken)return;this.suggestions=[],this.message=n.message}finally{s===this.lookupToken&&(this.lookupLoading=!1)}}chooseTicker=async e=>{let s=L(e.symbol);s&&(clearTimeout(this.searchTimer),this.lookupToken+=1,this.symbol=s,this.suggestions=[],this.suggestionOpen=!1,this.lookupLoading=!1,await this.fillPrice())};closeSuggestions=()=>{clearTimeout(this.searchTimer),this.lookupToken+=1,this.lookupLoading=!1,setTimeout(()=>{this.suggestionOpen=!1},120)};symbolInputFocused(){let e=this.querySelector("input[role='combobox']");return!!e&&document.activeElement===e}fillPrice=async()=>{let e=L(this.symbol);if(!e){this.message="Ange en aktiesymbol f\xF6rst.";return}this.busy=!0;try{let s=await js(e,this.purchasedAt||U());this.currency=s.currency,this.price=Ct(s.price),this.fxRate=Se(s.fxRate),this.fxRateDirty=!1,this.message=Is(e,s)}catch(s){this.message=s.message}finally{this.busy=!1}};changeCurrency=e=>{this.currency=F(e.target.value)||w,this.fxRateDirty=!1,this.refreshFxRate()};changeDate=e=>{this.purchasedAt=e.target.value,this.fxRateDirty||this.refreshFxRate()};async refreshFxRate(){if(this.currency===w){this.fxRate="1";return}try{let e=await Ft(this.currency,this.purchasedAt||U());if(this.fxRateDirty)return;this.fxRate=Se(e.rate)}catch(e){this.message=e.message}}render(){let e=F(this.currency)||w,s=e!==w,n=Number(this.price),r=Number(this.quantity),a=s?Number(this.fxRate):1,i=Number(this.fees||0),o=Number.isFinite(n)&&Number.isFinite(r)&&Number.isFinite(a)&&n>0&&r>0&&a>0?(n*r+(Number.isFinite(i)?i:0))*a:null;return d`
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
                              on-mousedown="${u=>u.preventDefault()}"
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
            ${Vs(e,this.changeCurrency)}
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
          <span>Avgifter (${e})</span>
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
              <span>Växelkurs · SEK per ${e}</span>
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
            ${this.message||(o!==null?`Totalt ${A(o)}${s?` \xB7 ${D(n*r+(Number.isFinite(i)?i:0),e)} \xD7 ${le(a,4)}`:""}`:"")}
          </p>
        </div>
      </form>
    `}},wt=class extends _{static tag="sell-dialog";static properties={symbol:{type:String,default:""},quantity:{type:String,default:""},price:{type:String,default:""},currency:{type:String,default:w},fxRate:{type:String,default:"1"},fxRateDirty:{type:Boolean,default:!1},soldAt:{type:String,default:U},fees:{type:String,default:"0"},note:{type:String,default:""},message:{type:String,default:""},busy:{type:Boolean,default:!1}};#e=!1;#t=!1;connectedCallback(){let e=Z().filter(r=>r.isHolding),s=L(c.sellRequest?.symbol??""),n=e.some(r=>r.symbol===s)?s:e[0]?.symbol??"";n&&this.selectSymbol(n),super.connectedCallback()}selectSymbol(e){this.symbol=L(e),this.quantity="",this.message="",this.fxRateDirty=!1;let n=this.position()?.quote,r=F(n?.currency)||w;this.currency=r,this.price=n&&Number.isFinite(n.price)&&n.price>0?Ct(n.price):"",r===w?this.fxRate="1":Number.isFinite(c.fxRates[r])?this.fxRate=Se(c.fxRates[r]):this.fxRate="",(!this.price||!this.fxRate)&&this.fetchPrice()}position(){return this.symbol?Z().find(e=>e.symbol===this.symbol)??null:null}available(e=this.position()){return e?$s(e.lots,e.sales,this.soldAt||U()):0}fractionQuantity(e,s=this.available()){if(s<=0)return 0;if(e>=1)return s;let n=s*e;return Q(Number.isInteger(s)?Math.floor(n):n)}setFraction=e=>{let s=this.fractionQuantity(e);this.quantity=s>0?String(s):"",this.message=""};fetchPrice=async()=>{if(this.symbol){this.busy=!0;try{let e=await js(this.symbol,this.soldAt||U());this.currency=e.currency,this.price=Ct(e.price),this.fxRate=Se(e.fxRate),this.fxRateDirty=!1,this.message=Is(this.symbol,e)}catch(e){this.message=e.message}finally{this.busy=!1}}};changeCurrency=e=>{this.currency=F(e.target.value)||w,this.fxRateDirty=!1,this.refreshFxRate()};changeDate=e=>{this.soldAt=e.target.value,this.message="",this.fxRateDirty||this.refreshFxRate()};async refreshFxRate(){if(this.currency===w){this.fxRate="1";return}try{let e=await Ft(this.currency,this.soldAt||U());if(this.fxRateDirty)return;this.fxRate=Se(e.rate)}catch(e){this.message=e.message}}submit=async e=>{e.preventDefault();let s=this.position(),n=Q(Number(this.quantity)),r=Number(this.price),a=Number(this.fees||0),i=this.soldAt||U(),o=F(this.currency)||w,l=o===w?1:Number(this.fxRate);if(!s){this.message="V\xE4lj ett innehav att s\xE4lja.";return}if(!Number.isFinite(n)||n<=0){this.message="Ange hur m\xE5nga aktier du s\xE5lde.";return}if(!/^\d{4}-\d{2}-\d{2}$/.test(i)){this.message="Ange ett giltigt f\xF6rs\xE4ljningsdatum.";return}let u=this.available(s);if(n>u+G){this.message=u>0?`Du hade bara ${I(u)} aktier i ${s.symbol} tillg\xE4ngliga ${K(i)}.`:`Du hade inga aktier i ${s.symbol} att s\xE4lja ${K(i)}.`;return}if(!Number.isFinite(r)||r<=0){this.message=`Ange f\xF6rs\xE4ljningspriset per aktie i ${o}.`;return}if(!Number.isFinite(l)||l<=0){this.message=`Ange v\xE4xelkursen (SEK per ${o}).`;return}if(!Number.isFinite(a)||a<0){this.message="Avgifter kan inte vara negativa.";return}this.busy=!0;try{let{result:f}=await In({symbol:s.symbol,quantity:n,price:r,currency:o,fxRate:l,fees:a,soldAt:i,note:this.note.trim()});c.notice=`S\xE5lde ${I(n)} ${s.symbol} f\xF6r ${A(f.netProceeds)}. Realiserat resultat ${B(f.gain)} (${E(f.gainPercent)}).`,this.close()}catch(f){this.message=f.message,this.busy=!1}};close=()=>{this.#e=!0;let e=this.querySelector("dialog");e?.open&&e.close(),As()};handleClose=()=>{this.#e=!0,As()};handleBackdropClick=e=>{e.target===e.currentTarget&&this.close()};updated(){let e=this.querySelector("dialog");if(e&&!e.open&&!this.#e&&this.isConnected&&e.showModal(),Hs(this,"select.sell-symbol",this.symbol),!this.#t){let s=this.querySelector("input[name='quantity']");s&&(s.focus(),this.#t=!0)}}render(){let e=Z(),s=e.filter(r=>r.isHolding),n=e.find(r=>r.symbol===this.symbol)??null;return d`
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
        ${W("Registrera ett k\xF6p f\xF6rst, sedan kan du s\xE4lja hela eller delar av innehavet h\xE4r.")}
      </div>
    `}renderForm(e,s){let n=this.soldAt||U(),r=this.available(e),a=Number(this.quantity),i=Number(this.price),o=Number(this.fees||0),l=F(this.currency)||w,u=l!==w,f=u?Number(this.fxRate):1,g=Number.isFinite(a)&&a>0&&a<=r+G,y=Number.isFinite(i)&&i>0,x=Number.isFinite(f)&&f>0,b=g&&y&&x?ws(e.lots,e.sales,{quantity:Q(a),price:i,currency:l,fxRate:f,fees:Number.isFinite(o)&&o>0?o:0,soldAt:n}):null,m=Number.isFinite(a)&&a>0&&a>r+G,T=Number.isInteger(r)?1:1e-4,M=n===U(),P=e.quote,S=R(P?.changePercent??0),j=F(P?.currency)||w,p=P&&j!==Y();return d`
      <form class="sell-form" novalidate on-submit="${this.submit}">
        <div class="sell-head">
          <div>
            <h2 id="sell-dialog-title">Sälj ${e.symbol}</h2>
            <p>
              ${e.name} · Registrera en hel eller delvis försäljning.
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
                      <option value="${h.symbol}">${`${h.symbol} \xB7 ${I(h.shares)} st \xB7 ${A(h.marketValue)}`}</option>
                    `))}
              </select>
            </label>
          `:""}

        <div class="sell-facts">
          <div class="fact">
            <small>Innehav</small>
            <strong>${I(e.shares)} st</strong>
            <span>${A(e.marketValue)}</span>
          </div>
          <div class="fact">
            <small>Snittkurs</small>
            <strong>${A(e.averageCost)}</strong>
            <span>inkl. avgifter, i SEK</span>
          </div>
          <div class="fact">
            <small>Kurs nu</small>
            <strong>${A(e.price)}</strong>
            <span class="${S}">${p?`${D(P.price,j)} \xB7 ${E(P?.changePercent??0)}`:`${E(P?.changePercent??0)} idag`}</span>
          </div>
          <div class="fact">
            <small>Orealiserat</small>
            <strong class="${R(e.gain)}">${B(e.gain)}</strong>
            <span class="${R(e.gain)}">${E(e.gainPercent)}</span>
          </div>
        </div>

        <div class="sell-grid">
          <div class="quantity-field">
            <div class="field-heading">
              <span>Antal att sälja</span>
              <span class="${m?"negative":"muted"}">
                ${r>0?`Tillg\xE4ngligt ${I(r)} st${M?"":` den ${K(n)}`}`:M?"Inget tillg\xE4ngligt att s\xE4lja":`Inget tillg\xE4ngligt den ${K(n)}`}
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
                ${[.25,.5,.75,1].map(h=>{let k=this.fractionQuantity(h,r),$=k>0&&Math.abs(k-a)<G;return q(h,d`
                      <button
                        type="button"
                        class="${`chip ${$?"active":""}`}"
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
              step="${T}"
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
              ${Vs(l,this.changeCurrency)}
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

          ${u?d`
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

          <label class="${u?"wide-field":""}">
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
            <strong>${b?A(b.netProceeds):"\u2013"}</strong>
            <span>${b?u?`${D(Q(a)*i-(Number.isFinite(o)?o:0),l)} \xD7 ${le(f,4)}`:o>0?`efter ${A(o)} i avgifter`:"pris \xD7 antal \u2212 avgifter":"pris \xD7 antal \u2212 avgifter"}</span>
          </div>
          <div>
            <small>Anskaffning</small>
            <strong>${b?A(b.costBasis):"\u2013"}</strong>
            <span>${b?`${I(Q(a))} \xD7 ${A(b.averageCost)} snitt`:"genomsnittsmetoden"}</span>
          </div>
          <div>
            <small>Realiserat resultat</small>
            <strong class="${b?R(b.gain):""}">${b?B(b.gain):"\u2013"}</strong>
            <span class="${b?R(b.gain):""}">${b?E(b.gainPercent):"fyll i antal och pris"}</span>
          </div>
          <div>
            <small>Kvar efteråt</small>
            <strong>${b?`${I(b.remainingShares)} st`:`${I(e.shares)} st`}</strong>
            <span>${b?b.remainingShares>G?A(b.remainingShares*e.price):"positionen avslutas":"of\xF6r\xE4ndrat"}</span>
          </div>
        </div>

        <div class="sell-actions">
          <p class="${`inline-message ${m?"negative":""}`}">
            ${this.message||(m?`Du kan s\xE4lja h\xF6gst ${I(r)} st.`:"")}
          </p>
          <div class="button-row">
            <button type="button" on-click="${this.close}">Avbryt</button>
            <button
              type="submit"
              class="sell-button"
              disabled="${this.busy||!g||!y||!x}"
            >
              ${this.busy?"Sparar":g?`S\xE4lj ${I(Q(a))} aktier`:"S\xE4lj"}
            </button>
          </div>
        </div>
      </form>
    `}},bn=[{value:"1mo",label:"1M"},{value:"3mo",label:"3M"},{value:"6mo",label:"6M"},{value:"1y",label:"1\xC5"},{value:"2y",label:"2\xC5"},{value:"5y",label:"5\xC5"}],C={width:760,height:320,left:62,right:18,top:18,bottom:30},xt=class extends _{static tag="holdings-page";static properties={filter:{type:String,default:""},scope:{type:String,default:"holdings"},range:{type:String,default:"6mo"},hoverIndex:{type:Number,default:-1}};#e="";#t=null;select=e=>{this.hoverIndex=-1,Xe(`/holdings/${encodeURIComponent(e)}`)};setRange=e=>{this.range=e,this.hoverIndex=-1};handleChartMove=e=>{let s=this.#t;if(!s)return;let n=e.currentTarget.ownerSVGElement??e.currentTarget;if(!n)return;let r=n.getBoundingClientRect();if(!r.width)return;let a=(e.clientX-r.left)/r.width*C.width,i=C.width-C.left-C.right,o=Math.min(1,Math.max(0,(a-C.left)/i));this.hoverIndex=Math.round(o*(s.points.length-1))};handleChartLeave=()=>{this.hoverIndex=-1};updated(){this.#e&&wn(this.#e,this.range)}selectedSymbol(e){let s=L(this.routeData?.params?.symbol??"");return s&&e.some(n=>n.symbol===s)?s:e.find(n=>n.isHolding)?.symbol??e.find(n=>n.hasTrades)?.symbol??e[0]?.symbol??""}render(){let e=Z(),s=e.filter(u=>u.isHolding),n=e.filter(u=>u.isClosed),r=this.scope==="holdings"?s:this.scope==="closed"?n:e,a=this.filter.trim().toUpperCase(),i=r.filter(u=>!a||u.symbol.includes(a)||String(u.name??"").toUpperCase().includes(a)),o=this.selectedSymbol(e);this.#e=o;let l=e.find(u=>u.symbol===o)??null;return d`
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
            on-input="${u=>this.filter=u.target.value}"
          />
          <div class="chip-row scope-chips" role="group" aria-label="Urval">
            ${pt(this,"holdings",`\xD6ppna \xB7 ${s.length}`)}
            ${pt(this,"closed",`Avslutade \xB7 ${n.length}`)}
            ${pt(this,"all",`Alla \xB7 ${e.length}`)}
          </div>
          ${i.length?d`
              <div class="holding-list">
                ${i.map(u=>q(u.symbol,vn(u,o,this.select)))}
              </div>
            `:W(e.length?"Inget innehav matchar filtret.":"L\xE4gg till ett k\xF6p p\xE5 \xF6versikten f\xF6r att se det h\xE4r.")}
        </aside>

        <section class="panel holding-detail">
          ${l?this.renderDetail(l):W("V\xE4lj ett innehav i listan.")}
        </section>
      </section>
    `}renderDetail(e){let s=e.quote,n=F(s?.currency)||w,r=n!==Y(),a=$n(e.symbol,this.range),i=xn(e,a.history,this.range);this.#t=i;let o=i&&this.hoverIndex>=0&&this.hoverIndex<i.points.length?this.hoverIndex:-1,l=Cs(e,n),u=i?.nativeAverage??Ts(e,n);return d`
      <div class="detail-head">
        <div>
          <h2>${e.symbol}</h2>
          <p>
            ${[e.name,s?.exchange,`noterad i ${n}`].filter(Boolean).join(" \xB7 ")}
          </p>
        </div>
        ${e.isHolding?d`
            <button
              type="button"
              class="sell-button"
              on-click="${()=>Re(e.symbol)}"
            >
              Sälj ${e.symbol}
            </button>
          `:e.isClosed?d`
            <span class="pill closed">Avslutad position</span>
          `:d`
            <span class="pill closed">Bevakad</span>
          `}
      </div>

      <div class="detail-stats">
        <div class="fact">
          <small>Kurs</small>
          <strong>${A(e.price)}</strong>
          <span class="${R(s?.changePercent??0)}">${r&&s?`${D(s.price,n)} \xB7 ${E(s?.changePercent??0)}`:`${E(s?.changePercent??0)} idag`}</span>
        </div>
        <div class="fact">
          <small>Innehav</small>
          <strong>${I(e.shares)} st</strong>
          <span>${A(e.marketValue)}</span>
        </div>
        <div class="fact">
          <small>Snittkurs</small>
          <strong>${e.isHolding?A(e.averageCost):"\u2013"}</strong>
          <span>${e.isHolding&&r&&u?`${D(u,n)} \xB7 inkl. avgifter`:"inkl. avgifter"}</span>
        </div>
        <div class="fact">
          <small>Orealiserat</small>
          <strong class="${R(e.gain)}">${B(e.gain)}</strong>
          <span class="${R(e.gain)}">${e.isHolding?E(e.gainPercent):"ingen \xF6ppen position"}</span>
        </div>
        <div class="fact">
          <small>Realiserat</small>
          <strong class="${R(e.realized)}">${B(e.realized)}</strong>
          <span class="${e.sellCount?R(e.realized):"muted"}">${e.sellCount?`${E(e.realizedPercent)} \xB7 ${ce(e.sellCount,"f\xF6rs\xE4ljning","f\xF6rs\xE4ljningar")}`:"inga f\xF6rs\xE4ljningar"}</span>
        </div>
      </div>

      <div class="chart-toolbar">
        <div class="chip-row" role="group" aria-label="Tidsintervall">
          ${bn.map(f=>q(f.value,d`
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
          ${e.isHolding?d`
              <span><i class="legend-avg"></i> Snittkurs</span>
            `:""}
          <span><i class="legend-line"></i> Stängningskurs (${n})</span>
        </div>
      </div>

      ${i?kn(i,o,e,this.handleChartMove,this.handleChartLeave):a.status==="error"?W(`Kunde inte h\xE4mta kurshistorik: ${a.error}`):W(a.status==="loading"?"H\xE4mtar kurshistorik...":"Ingen kurshistorik tillg\xE4nglig f\xF6r intervallet.")}

      ${i?d`
          <p class="chart-caption">
            <span class="${i.tone}">${E(i.changePercent)}</span>
            under perioden · högst ${D(i.high,i.currency)} ·
            lägst ${D(i.low,i.currency)}${i.outside?` \xB7 ${ce(i.outside,"aff\xE4r","aff\xE4rer")} ligger f\xF6re intervallet, v\xE4lj ett l\xE4ngre`:""}${a.status==="loading"?" \xB7 uppdaterar...":""}
          </p>
        `:""}

      <div class="detail-section-heading">
        <h3>Affärer i ${e.symbol}</h3>
        <p>Kursen sedan varje affär – stigande kurs efter köp och fallande efter sälj är bra tajming.</p>
      </div>
      ${l.length?d`
          <div class="timing-list">
            ${l.map(f=>q(f.id,Rn(f,i)))}
          </div>
        `:W("Inga aff\xE4rer registrerade f\xF6r det h\xE4r innehavet.")}
    `}};function pt(t,e,s){return d`
    <button
      type="button"
      class="${`chip ${t.scope===e?"active":""}`}"
      on-click="${()=>t.scope=e}"
    >
      ${s}
    </button>
  `}function vn(t,e,s){let n=t.quote;return d`
    <button
      type="button"
      class="${`holding-item ${t.symbol===e?"active":""}`}"
      aria-pressed="${t.symbol===e}"
      on-click="${()=>s(t.symbol)}"
    >
      <strong>${t.symbol}</strong>
      <b>${t.isHolding?A(t.marketValue):A(t.price)}</b>
      <span>${t.name}</span>
      <small class="${t.isHolding?R(t.gain):R(n?.changePercent??0)}">${t.isHolding?`${I(t.shares)} st \xB7 ${E(t.gainPercent)}`:t.isClosed?`avslutad \xB7 ${B(t.realized)}`:`${E(n?.changePercent??0)} idag`}</small>
    </button>
  `}function $n(t,e){let s=c.historyStatus[t],n=Fs(t,e);return{status:s?.status??(n?"ready":"loading"),error:s?.error??"",history:n}}function wn(t,e){return Tt(t)}function Cs(t,e){let s=t.quote,n=s&&Number.isFinite(s.price)?s.price:null,r=i=>{if($e(i)===e)return{price:Number(i.price)||0,exact:!0};let l=oe(Be(i),e,c.fxRates);return{price:Number.isFinite(l)?l:null,exact:!1}};return[...t.lots.map(i=>({id:i.id,type:"buy",date:i.purchasedAt??"",createdAt:i.createdAt??"",record:i,result:null})),...t.sales.map(i=>({id:i.id,type:"sell",date:i.soldAt??"",createdAt:i.createdAt??"",record:i,result:t.ledger.saleResults.get(i.id)??null}))].map(i=>{let o=r(i.record),l=n&&o.price>0?(n-o.price)/o.price*100:null;return{...i,native:o,since:l,chartCurrency:e}}).sort((i,o)=>o.date.localeCompare(i.date)||o.createdAt.localeCompare(i.createdAt))}function Ts(t,e){if(!t.isHolding)return null;let s=!1,n=o=>{if($e(o)===e)return{...o,price:Number(o.price)||0,fees:Number(o.fees)||0,currency:e,fxRate:1};s=!0;let u=ie(o),f=oe((Number(o.price)||0)*u,e,c.fxRates),g=oe((Number(o.fees)||0)*u,e,c.fxRates);return f===null||g===null?null:{...o,price:f,fees:g,currency:e,fxRate:1}},r=t.lots.map(n),a=t.sales.map(n);if(r.includes(null)||a.includes(null))return null;let i=xe(r,a);return i.shares>0?i.averageCost:null}function xn(t,e,s){let n=(e?.points??[]).filter(v=>Number.isFinite(v.close)&&v.close>0&&v.date);if(n.length<2)return null;let r=t.quote,a=F(r?.currency)||w,i=ke(r?.rawCurrency??r?.currency).divisor,o=n.map(v=>v.close/i),l=n[0].date,u=Cs(t,a),f=[],g=0;for(let v of u){if(!v.date||v.date<l){g+=1;continue}let O=n.findIndex(de=>de.date>=v.date);O===-1&&(O=n.length-1);let ue=v.native.price>0?v.native.price:o[O];f.push({...v,index:O,value:ue,close:o[O]})}f.sort((v,O)=>v.index-O.index);let y=Ts(t,a),x=[...o,...f.map(v=>v.value),...y?[y]:[]],b=Math.min(...x),m=Math.max(...x),T=(m-b||Math.abs(m)*.05||1)*.08;b-=T,m+=T;let M=C.width-C.left-C.right,P=C.height-C.top-C.bottom,S=v=>C.left+v/(n.length-1)*M,j=v=>C.top+(1-(v-b)/(m-b))*P,p=C.top+P,h=new Map;for(let v of f){let O=`${v.index}:${Math.round(j(v.value)/10)}`;h.has(O)||h.set(O,[]),h.get(O).push(v)}for(let v of h.values())v.length<2||v.forEach((O,ue)=>{O.dx=(ue-(v.length-1)/2)*11});let k=o.map((v,O)=>`${O?"L":"M"}${S(O).toFixed(1)} ${j(v).toFixed(1)}`).join(" "),$=`${k} L${S(o.length-1).toFixed(1)} ${p.toFixed(1)} L${S(0).toFixed(1)} ${p.toFixed(1)} Z`,N=o[0],z=o.at(-1),H=z-N;return{points:n,closes:o,currency:a,markers:f,outside:g,nativeAverage:y,min:b,max:m,x:S,y:j,baseline:p,plotWidth:M,plotHeight:P,linePath:k,areaPath:$,yTicks:An(b,m,6).map(v=>({value:v,y:j(v)})),xTicks:Nn(n.length,6).map(v=>({index:v,x:S(v),label:Cn(n[v].date,s)})),first:N,last:z,change:H,changePercent:N?H/N*100:0,tone:R(H),high:Math.max(...o),low:Math.min(...o)}}function kn(t,e,s,n,r){let a=e>=0?{index:e,x:t.x(e),y:t.y(t.closes[e]),date:t.points[e].date,close:t.closes[e],trades:t.markers.filter(g=>g.index===e)}:null,i=a&&a.x>C.width/2,o=176,l=44+(a?.trades.length??0)*16,u=a?i?a.x-o-12:a.x+12:0,f=a?Math.max(C.top,Math.min(a.y-20,t.baseline-l)):0;return d`
    <svg
      class="${`price-chart ${t.tone}`}"
      viewBox="${`0 0 ${C.width} ${C.height}`}"
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
        ${t.yTicks.map(g=>q(g.value,d`
              <svg overflow="visible">
                <line
                  x1="${C.left}"
                  x2="${C.width-C.right}"
                  y1="${g.y.toFixed(1)}"
                  y2="${g.y.toFixed(1)}"
                ></line>
                <text
                  x="${C.left-8}"
                  y="${(g.y+3.5).toFixed(1)}"
                  text-anchor="end"
                >
                  ${Tn(g.value)}
                </text>
              </svg>
            `))}
      </g>

      <g class="chart-axis">
        ${t.xTicks.map(g=>q(g.index,d`
              <svg overflow="visible">
                <text
                  x="${g.x.toFixed(1)}"
                  y="${C.height-9}"
                  text-anchor="middle"
                >
                  ${g.label}
                </text>
              </svg>
            `))}
      </g>

      <path
        class="chart-area"
        d="${t.areaPath}"
        fill="url(#price-chart-fill)"
      ></path>
      <path class="chart-line" d="${t.linePath}"></path>

      ${t.nativeAverage?d`
          <svg overflow="visible" class="chart-average">
            <line
              x1="${C.left}"
              x2="${C.width-C.right}"
              y1="${t.y(t.nativeAverage).toFixed(1)}"
              y2="${t.y(t.nativeAverage).toFixed(1)}"
            ></line>
            <text
              x="${C.width-C.right}"
              y="${(t.y(t.nativeAverage)-6).toFixed(1)}"
              text-anchor="end"
            >
              snitt ${D(t.nativeAverage,t.currency)}
            </text>
          </svg>
        `:""}

      <g class="chart-markers">
        ${t.markers.map(g=>q(g.id,Sn(g,t)))}
      </g>

      ${a?d`
          <svg overflow="visible" class="chart-hover">
            <line
              x1="${a.x.toFixed(1)}"
              x2="${a.x.toFixed(1)}"
              y1="${C.top}"
              y2="${t.baseline}"
            ></line>
            <circle
              cx="${a.x.toFixed(1)}"
              cy="${a.y.toFixed(1)}"
              r="4.5"
            ></circle>
            <g transform="${`translate(${u.toFixed(1)} ${f.toFixed(1)})`}">
              <rect width="${o}" height="${l}" rx="6"></rect>
              <text class="tooltip-date" x="10" y="17">${K(a.date)}</text>
              <text class="tooltip-price" x="10" y="35">
                ${D(a.close,t.currency)}
              </text>
              ${a.trades.map((g,y)=>q(g.id,d`
                    <svg overflow="visible">
                      <text
                        class="${`tooltip-trade ${g.type}`}"
                        x="10"
                        y="${51+y*16}"
                      >
                        ${g.type==="buy"?"K\xF6p":"S\xE4lj"} ${I(g.record.quantity)} st à ${D(g.native.price??g.close,t.currency)}
                      </text>
                    </svg>
                  `))}
            </g>
          </svg>
        `:""}
    </svg>
  `}function Sn(t,e){let s=e.x(t.index)+(t.dx??0),n=e.y(t.value),r=`${t.type==="buy"?"K\xF6p":"S\xE4lj"} ${I(t.record.quantity)} st \xE0 ${D(t.value,e.currency)}${t.native.exact?"":" (omr\xE4knat)"} \xB7 ${K(t.date)}`;return t.type==="buy"?d`
      <svg overflow="visible" class="marker buy">
        <title>${r}</title>
        <circle cx="${s.toFixed(1)}" cy="${n.toFixed(1)}" r="6"></circle>
      </svg>
    `:d`
      <svg overflow="visible" class="marker sell">
        <title>${r}</title>
        <path d="${`M${s.toFixed(1)} ${(n-7).toFixed(1)} L${(s+7).toFixed(1)} ${n.toFixed(1)} L${s.toFixed(1)} ${(n+7).toFixed(1)} L${(s-7).toFixed(1)} ${n.toFixed(1)} Z`}"></path>
      </svg>
    `}function Rn(t,e){let s=t.type==="buy",n=t.record,r=$e(n),a=t.since,i=a!==null&&Math.abs(a)<.005,o=a===null||i?"neutral":R(s?a:-a),l=a===null?"v\xE4ntar p\xE5 kurs":i?"of\xF6r\xE4ndrad kurs sedan aff\xE4ren":s?a>=0?"kursen har stigit sedan k\xF6pet":"kursen har fallit sedan k\xF6pet":a<=0?"bra tajming \u2013 kursen har fallit sedan":"kursen har stigit sedan f\xF6rs\xE4ljningen",u=e?e.markers.some(f=>f.id===t.id):!1;return d`
    <article class="${`timing-row ${t.type}`}">
      <span class="${`badge ${t.type}`}">${s?"K\xF6p":"S\xE4lj"}</span>
      <div>
        <strong>${K(t.date)}</strong>
        <span>${I(n.quantity)} st à ${D(Number(n.price)||0,r)}${e&&!u?" \xB7 utanf\xF6r diagrammet":""}</span>
      </div>
      <div>
        <span class="cell-label">${s?"Kostnad":"Erh\xE5llet"}</span>
        <strong>${A(we(n,t.type))}</strong>
      </div>
      <div>
        <span class="cell-label">Kurs sedan affären</span>
        <strong class="${o}">${a===null?"\u2013":E(a)}</strong>
        <small class="muted">${l}</small>
      </div>
      <div>
        <span class="cell-label">${s?"Anteckning":"Realiserat"}</span>
        ${s?d`
            <strong class="muted">${n.note||"\u2013"}</strong>
          `:d`
            <strong class="${R(t.result?.gain??0)}">${B(t.result?.gain??0)}</strong>
            <small class="${R(t.result?.gain??0)}">${E(t.result?.gainPercent??0)}</small>
          `}
      </div>
    </article>
  `}function An(t,e,s=6){let n=e-t||1,r=10**Math.floor(Math.log10(n/s)),a=[1,2,2.5,5,10,20,25,50].map(i=>i*r);for(let i of a){let o=Rs(t,e,i);if(o.length<=s)return o}return Rs(t,e,a.at(-1))}function Rs(t,e,s){let n=[];for(let r=Math.ceil(t/s)*s;r<=e+s*1e-6;r+=s)n.push(Number(r.toFixed(10)));return n}function Nn(t,e){if(t<=e)return Array.from({length:t},(n,r)=>r);let s=new Set;for(let n=0;n<e;n+=1)s.add(Math.round(n*(t-1)/(e-1)));return[...s]}function Cn(t,e){let s=new Date(`${t}T00:00:00`);if(Number.isNaN(s.getTime()))return t;let n=e==="1mo"||e==="3mo"||e==="6mo";return new Intl.DateTimeFormat("sv-SE",n?{day:"numeric",month:"short"}:{month:"short",year:"2-digit"}).format(s)}function Tn(t){return new Intl.NumberFormat("sv-SE",{maximumFractionDigits:Math.abs(t)>=100?0:2}).format(t)}var kt=class extends _{static tag="position-table";static properties={positions:{type:Array,default:()=>[]}};render(){return d`
      <div class="position-list">
        ${this.positions.map(e=>q(e.symbol,zn(e)))}
      </div>
    `}},St=class extends _{static tag="transactions-page";static properties={typeFilter:{type:String,default:"all"},symbolFilter:{type:String,default:""}};updated(){Hs(this,"select.symbol-filter",this.effectiveSymbolFilter())}effectiveSymbolFilter(){return new Set(zs()).has(this.symbolFilter)?this.symbolFilter:""}render(){let e=Z(),s=new Map(e.map(m=>[m.symbol,m])),n=_n(s),r=[...new Set(n.map(m=>m.symbol))].sort(),a=r.includes(this.symbolFilter)?this.symbolFilter:"",i=n.filter(m=>!a||m.symbol===a),o=i.filter(m=>this.typeFilter==="all"||m.type===this.typeFilter),l=i.filter(m=>m.type==="buy"),u=i.filter(m=>m.type==="sell"),f=l.reduce((m,T)=>m+we(T.record,"buy"),0),g=u.reduce((m,T)=>m+(T.result?.netProceeds??0),0),y=u.reduce((m,T)=>m+(T.result?.gain??0),0),x=u.reduce((m,T)=>m+(T.result?.costBasis??0),0),b=e.some(m=>m.isHolding);return d`
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
                  on-click="${()=>Re(a)}"
                >
                  Sälj innehav
                </button>
              `:""}
          </div>

          ${n.length?d`
              <div class="tx-summary">
                <div class="fact">
                  <small>Investerat</small>
                  <strong>${A(f)}</strong>
                  <span>${ce(l.length,"k\xF6p","k\xF6p")}</span>
                </div>
                <div class="fact">
                  <small>Sålt för</small>
                  <strong>${A(g)}</strong>
                  <span>${ce(u.length,"f\xF6rs\xE4ljning","f\xF6rs\xE4ljningar")}</span>
                </div>
                <div class="fact">
                  <small>Realiserat</small>
                  <strong class="${R(y)}">${B(y)}</strong>
                  <span class="${u.length?R(y):"muted"}">
                    ${u.length?E(x>0?y/x*100:0):"inga f\xF6rs\xE4ljningar"}
                  </span>
                </div>
              </div>

              <div class="filter-bar">
                <div class="chip-row" role="group" aria-label="Typ">
                  ${yt(this,"all",`Alla \xB7 ${i.length}`)}
                  ${yt(this,"buy",`K\xF6p \xB7 ${l.length}`)}
                  ${yt(this,"sell",`S\xE4lj \xB7 ${u.length}`)}
                </div>
                <select
                  class="symbol-filter"
                  aria-label="Filtrera på symbol"
                  on-change="${m=>this.symbolFilter=m.target.value}"
                >
                  <option value="">Alla symboler</option>
                  ${r.map(m=>q(m,d`
                        <option value="${m}">${m}</option>
                      `))}
                </select>
              </div>
            `:""}

          ${o.length?d`
              <div class="transaction-list">
                ${o.map(m=>q(m.id,Hn(m)))}
              </div>
            `:W(n.length?"Inga transaktioner matchar filtret.":"Inga transaktioner har sparats. L\xE4gg till ett k\xF6p p\xE5 \xF6versikten.")}
        </section>
      </section>
    `}},Rt=class extends _{static tag="research-page";static properties={query:{type:String,default:""},message:{type:String,default:""}};search=async e=>{e.preventDefault();let s=this.query.trim();if(s){c.searchLoading=!0,this.message="";try{c.searchResults=await nt(s),c.searchResults.length===0&&(this.message="Inga matchande tickers hittades.")}catch(n){this.message=n.message}finally{c.searchLoading=!1}}};track=async e=>{await qs(e),this.message=`${e} bevakas nu lokalt.`};render(){let e=Z();return d`
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
            <button class="primary-button" disabled="${c.searchLoading}">
              ${c.searchLoading?"S\xF6ker":"S\xF6k"}
            </button>
          </form>
          ${this.message?d`
              <p class="inline-message">${this.message}</p>
            `:""}
          <div class="search-results">
            ${c.searchResults.map(s=>q(s.symbol,d`
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
          ${e.length?d`
              <div class="watch-grid">
                ${e.map(s=>q(s.symbol,Vn(s)))}
              </div>
            `:W("S\xF6k och bevaka en symbol, eller spara ett k\xF6p.")}
        </section>
      </section>
    `}},At=class extends _{static tag="settings-page";static properties={message:{type:String,default:""},busy:{type:Boolean,default:!1}};exportData=()=>{let e={app:"Stockroom",version:2,exportedAt:new Date().toISOString(),lots:c.lots,sales:c.sales,watchlist:c.watchlist,quotes:c.quotes,settings:c.settings},s=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(s),n.download=`stockroom-${U()}.json`,n.click(),URL.revokeObjectURL(n.href)};importData=async e=>{let s=e.target.files?.[0];if(s){this.busy=!0;try{let n=JSON.parse(await s.text());Gn(n),await Yt(n),await Nt(),this.message="Importerade lokal portf\xF6ljdata."}catch(n){this.message=n.message}finally{this.busy=!1,e.target.value=""}}};clearData=async()=>{confirm("Ta bort all lokal Stockroom-data fr\xE5n den h\xE4r webbl\xE4saren?")&&(await Jt(),await Nt(),this.message="Lokal data rensad.")};persistStorage=async()=>{if(!navigator.storage?.persist){this.message="Best\xE4ndig webbl\xE4sarlagring \xE4r inte tillg\xE4nglig h\xE4r.";return}let e=await navigator.storage.persist();this.message=e?"Webbl\xE4saren beviljade best\xE4ndig lagring.":"Webbl\xE4saren beviljade inte best\xE4ndig lagring."};render(){let e=Y(),s=Object.entries(c.fxRates).filter(([,n])=>Number.isFinite(n)).sort(([n],[r])=>n.localeCompare(r));return d`
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
            <span><strong>${c.lots.length}</strong> köp</span>
            <span><strong>${c.sales.length}</strong> försäljningar</span>
            <span><strong>${c.watchlist.length}</strong> bevakade symboler</span>
            <span><strong>${Object.keys(c.quotes).length}</strong> kursbilder</span>
            <span><strong>${lt.all().length}</strong> kurshistoriker synkade från servern</span>
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
              ${ve.map(n=>q(n,d`
                    <button
                      type="button"
                      class="${`segment ${e===n?"active":""}`}"
                      aria-pressed="${e===n}"
                      on-click="${()=>Es(n)}"
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
                        <strong>${D(r,w)}</strong>
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
    `}};bt.register();vt.register();$t.register();wt.register();kt.register();xt.register();St.register();Rt.register();At.register();Ze({routes:[{path:"/",component:"dashboard-page"},{path:"/holdings",component:"holdings-page"},{path:"/holdings/:symbol",component:"holdings-page"},{path:"/transactions",component:"transactions-page"},{path:"/lots",component:"transactions-page"},{path:"/research",component:"research-page"},{path:"/settings",component:"settings-page"}]});Fn();async function Fn(){await Nt(),await Ms({forceHistory:!1,quiet:!0}),await _e(Bs(),{required:!1}).catch(()=>{})}async function Nt(){let t=await Ut();c.lots=t.lots,c.sales=t.sales??[],c.watchlist=t.watchlist,c.quotes=t.quotes,c.fxRates=Bn(t.quotes),c.settings={refreshMinutes:5,lastRefresh:"",displayCurrency:w,...t.settings},c.ready=!0}function Z(){return ks(c.lots,c.watchlist,c.quotes,En(),c.fxRates,c.sales)}var mt=new Map;function Tt(t,e={}){let s=L(t);if(!s)return Promise.resolve();let n=mt.get(s);if(n)return n;let r=c.historyStatus[s],a=Date.now();if(!e.force&&r&&(r.status==="ready"&&a-r.at<5*6e4||r.status==="error"&&a-r.at<6e4))return Promise.resolve();gt(s,{status:"loading",error:"",at:a});let i=(async()=>{try{let o=await ys(s,{maxAgeMs:e.force?0:void 0});gt(s,{status:"ready",error:o?.stale?o.error??"":"",at:Date.now()})}catch(o){gt(s,{status:"error",error:o.message,at:Date.now()})}finally{mt.delete(s)}})();return mt.set(s,i),i}function gt(t,e){c.historyStatus={...c.historyStatus,[t]:e}}function Fs(t,e){let s=ct(t);if(!s)return null;let n=c.quotes[t],r=ke(n?.rawCurrency??n?.currency).divisor;return{symbol:t,updatedAt:s.updatedAt,points:vs(bs(s.points,e),n,r)}}function En(){let t={};for(let e of Dt()){let s=Fs(e,"6mo");s&&(t[e]=s)}return t}function Y(){let t=F(c.settings.displayCurrency);return ve.includes(t)?t:w}function A(t){let e=Y(),s=oe(t,e,c.fxRates);return s===null?D(t,w):D(s,e)}function B(t){let e=Y(),s=oe(t,e,c.fxRates);return s===null?dt(t,w):dt(s,e)}async function Es(t){let e=F(t);if(ve.includes(e)){c.settings={...c.settings,displayCurrency:e},await tt("displayCurrency",e);try{await _e([e],{required:!0})}catch(s){c.error=s.message}}}async function jn(t){let e=L(t.symbol),s=F(t.currency)||w,n=new Date().toISOString(),r={id:crypto.randomUUID(),symbol:e,quantity:Q(t.quantity),price:Number(t.price),currency:s,fxRate:s===w?1:Number(t.fxRate),purchasedAt:t.purchasedAt,fees:Number(t.fees??0)||0,note:t.note??"",createdAt:n,updatedAt:n};await zt(r),c.lots=[r,...c.lots].sort((a,i)=>i.purchasedAt.localeCompare(a.purchasedAt)),await qs(e,{quiet:!0})}async function Dn(t){await Ht(t),c.lots=c.lots.filter(e=>e.id!==t)}async function In(t){let e=L(t.symbol);if(!e)throw new Error("Aktiesymbol saknas");let s=F(t.currency)||w,n=new Date().toISOString(),r={id:crypto.randomUUID(),symbol:e,quantity:Q(t.quantity),price:Number(t.price),currency:s,fxRate:s===w?1:Number(t.fxRate),soldAt:t.soldAt,fees:Number(t.fees??0)||0,note:t.note??"",createdAt:n,updatedAt:n};await Vt(r),c.sales=[r,...c.sales].sort((o,l)=>l.soldAt.localeCompare(o.soldAt));let i=Z().find(o=>o.symbol===e)?.ledger.saleResults.get(r.id)??{netProceeds:we(r,"sell"),costBasis:0,gain:0,gainPercent:0};return{sale:r,result:i}}async function qn(t){await Kt(t),c.sales=c.sales.filter(e=>e.id!==t)}async function Pn(t){confirm(`Ta bort k\xF6pet av ${I(t.quantity)} ${t.symbol} (${K(t.purchasedAt)})?`)&&await Dn(t.id)}async function Mn(t){confirm(`Ta bort f\xF6rs\xE4ljningen av ${I(t.quantity)} ${t.symbol} (${K(t.soldAt)})? Aktierna r\xE4knas d\xE5 som \xE4gda igen.`)&&await qn(t.id)}function Re(t=""){c.sellRequest={symbol:L(t),openedAt:Date.now()}}function As(){c.sellRequest&&(c.sellRequest=null)}async function js(t,e){let s=await Ps(t),n=F(s.currency)||w,r=ke(s.rawCurrency??s.currency).divisor,a=await Ds(s.symbol,e).catch(()=>null),i=await Ft(n,e);return{symbol:s.symbol,currency:n,price:a?a.close/r:s.price,priceDate:a?.date??null,fxRate:i.rate,fxDate:i.date}}async function Ft(t,e){let s=F(t);if(!s||s===w)return{rate:1,date:null};let n=await Ds(jt(s),e).catch(()=>null);return n?{rate:n.close,date:n.date}:(await _e([s],{required:!0}),{rate:c.fxRates[s],date:null})}async function Ds(t,e){if(!/^\d{4}-\d{2}-\d{2}$/.test(e)||e>=U())return null;await Tt(t);let s=ct(t);if(!s)return null;let n=s.points.filter(r=>r.date<=e).at(-1);return n?{close:n.close,date:n.date}:null}function Is(t,e){let s=e.priceDate?`St\xE4ngningskurs ${K(e.priceDate)}`:"Senaste kurs",n=e.currency===w?"":` \xB7 ${le(e.fxRate,4)} SEK/${e.currency}${e.fxDate?"":" (aktuell kurs)"}`;return`${s} f\xF6r ${t}: ${D(e.price,e.currency)}${n}.`}function Ct(t){let e=Number(t);return Number.isFinite(e)?String(Number(e.toFixed(e<10?4:2))):""}function Se(t){let e=Number(t);return!Number.isFinite(e)||e<=0?"":String(Number(e.toFixed(4)))}async function qs(t,e={}){let s=L(t);if(!s)throw new Error("Aktiesymbol saknas");if(!c.watchlist.some(n=>n.symbol===s)){let n={symbol:s,addedAt:new Date().toISOString()};await Wt(n),c.watchlist=[...c.watchlist,n].sort((r,a)=>r.symbol.localeCompare(a.symbol))}await Ps(s),e.quiet||(c.notice=`${s} bevakas p\xE5 den h\xE4r enheten.`)}async function On(t){let e=L(t);await Qt(e),c.watchlist=c.watchlist.filter(s=>s.symbol!==e)}async function Ps(t){let e=await Ee([t]),s=e.quotes?.[0];if(!s)throw new Error(e.errors?.[0]?.message??`Ingen kurs hittades f\xF6r ${t}`);let n=await Et(s);return await Ls([n],{required:!0}),await Us(n.symbol,!0),await Os(),n}async function Ms(t={}){let e=Dt(),s=Bs().map(jt);if(!(e.length===0&&s.length===0)&&!c.refreshing){c.refreshing=!0,t.quiet||(c.error="");try{let n=await Ee([...e,...s]),r=[];for(let a of n.quotes??[])r.push(await Et(a));await Ls(r,{required:!1}),await Os();for(let a of e.slice(0,24))await Us(a,t.forceHistory).catch(()=>{});n.errors?.length&&!t.quiet&&(c.error=n.errors.map(a=>`${a.symbol}: ${a.message}`).join(" / "))}catch(n){t.quiet||(c.error=n.message)}finally{c.refreshing=!1}}}async function Os(){let t=new Date().toISOString();c.settings={...c.settings,lastRefresh:t},await tt("lastRefresh",t)}async function Et(t){let e=ke(t.rawCurrency??t.currency),s=r=>Number.isFinite(r)?r/e.divisor:r,n={...t,symbol:L(t.symbol),rawCurrency:t.rawCurrency??t.currency,currency:e.currency,price:s(t.price),previousClose:s(t.previousClose),change:s(t.change),dayHigh:s(t.dayHigh),dayLow:s(t.dayLow),fiftyTwoWeekHigh:s(t.fiftyTwoWeekHigh),fiftyTwoWeekLow:s(t.fiftyTwoWeekLow),updatedAt:new Date().toISOString()};return await Gt(n),c.quotes={...c.quotes,[n.symbol]:n},Ln(n),n}async function Ls(t,e={}){await _e(t.map(s=>s.currency),e)}async function _e(t,e={}){let n=[...new Set(t.map(F).filter(i=>i&&i!==w))].filter(i=>!Number.isFinite(c.fxRates[i]));if(n.length===0)return;let r=await Ee(n.map(jt));for(let i of r.quotes??[])await Et(i);let a=n.filter(i=>!Number.isFinite(c.fxRates[i]));if(e.required&&a.length)throw new Error(`Kunde inte h\xE4mta v\xE4xelkurs f\xF6r ${a.join(", ")} till ${w}.`)}function Bs(){let t=new Set,e=s=>{let n=F(s);n&&n!==w&&t.add(n)};e(Y());for(let s of c.lots)e(s.currency);for(let s of c.sales)e(s.currency);for(let s of Dt())e(c.quotes[s]?.currency);return[...t]}function Ln(t){let e=_s(t.symbol);!e||!Number.isFinite(t.price)||(c.fxRates={...c.fxRates,[e]:t.price})}function Bn(t){let e={};for(let s of Object.values(t??{})){let n=_s(s.symbol);n&&Number.isFinite(s.price)&&(e[n]=s.price)}return e}function jt(t){return`${F(t)}${w}=X`}function _s(t){return L(t).match(/^([A-Z]{3})SEK=X$/)?.[1]??""}function Us(t,e=!1){return Tt(t,{force:e})}function Dt(){return[...new Set([...c.watchlist.map(t=>t.symbol),...zs()])].filter(Boolean)}function zs(){return[...new Set([...c.lots.map(t=>t.symbol),...c.sales.map(t=>t.symbol)])].filter(Boolean)}function _n(t){return[...c.lots.map(s=>({id:s.id,type:"buy",symbol:s.symbol,date:s.purchasedAt??"",createdAt:s.createdAt??"",record:s,position:t.get(s.symbol)??null,result:null})),...c.sales.map(s=>{let n=t.get(s.symbol)??null;return{id:s.id,type:"sell",symbol:s.symbol,date:s.soldAt??"",createdAt:s.createdAt??"",record:s,position:n,result:n?.ledger.saleResults.get(s.id)??null}})].sort((s,n)=>n.date.localeCompare(s.date)||n.createdAt.localeCompare(s.createdAt))}function Un(){let t=c.settings.lastRefresh;return t?new Intl.DateTimeFormat("sv-SE",{hour:"2-digit",minute:"2-digit",month:"short",day:"numeric"}).format(new Date(t)):"ej uppdaterad"}function U(){return new Date().toISOString().slice(0,10)}function ce(t,e,s){return`${t} ${t===1?e:s}`}function Hs(t,e,s){let n=t.querySelector(e);n&&n.value!==s&&(n.value=s)}function Vs(t,e){let s=Le.includes(t)?Le:[t,...Le];return d`
    <select
      class="currency-select"
      aria-label="Valuta"
      .value="${t}"
      on-change="${e}"
    >
      ${s.map(n=>q(n,d`
            <option value="${n}" selected="${n===t}">${n}</option>
          `))}
    </select>
  `}function zn(t){let e=ht(t.history?.points??[],180,54),s=t.quote,n=F(s?.currency)||w,r=s&&n!==Y();return d`
    <article class="position-row">
      <router-link
        class="identity-cell row-link"
        to="${`/holdings/${encodeURIComponent(t.symbol)}`}"
      >
        <strong>${t.symbol}</strong>
        <span>${t.name}</span>
      </router-link>
      <svg
        class="sparkline"
        viewBox="0 0 180 54"
        role="img"
        aria-label="${t.symbol} pristrend"
      >
        <path class="sparkline-grid" d="M0 27 L180 27"></path>
        <path class="${`sparkline-path ${R(t.gain)}`}" d="${e}"></path>
      </svg>
      <div>
        <span class="cell-label">Antal</span>
        <strong>${I(t.shares)}</strong>
        <small class="muted">snitt ${A(t.averageCost)}</small>
      </div>
      <div>
        <span class="cell-label">Pris</span>
        <strong>${A(t.price)}</strong>
        <small class="${R(s?.changePercent??0)}">${r?`${D(s.price,n)} \xB7 `:""}${E(s?.changePercent??0)} idag</small>
      </div>
      <div>
        <span class="cell-label">Värde</span>
        <strong>${A(t.marketValue)}</strong>
        ${t.sellCount?d`
            <small class="${R(t.realized)}">${B(t.realized)} realiserat</small>
          `:""}
      </div>
      <div>
        <span class="cell-label">Resultat</span>
        <strong class="${R(t.gain)}">
          ${B(t.gain)}
        </strong>
        <small class="${R(t.gain)}">${E(t.gainPercent)}</small>
      </div>
      <button
        type="button"
        class="sell-button compact"
        on-click="${()=>Re(t.symbol)}"
      >
        Sälj
      </button>
    </article>
  `}function Hn(t){let{record:e,position:s,result:n}=t,r=t.type==="buy",a=Number(e.quantity)||0,i=Number(e.price)||0,o=Number(e.fees)||0,l=$e(e),u=ie(e),f=l!==w,g=we(e,t.type),y=s?.quote,x=F(y?.currency)||w,b=!r||i<=0?null:y&&x===l&&y.price>0?(y.price-i)/i*100:s&&s.price>0?(s.price-Be(e))/Be(e)*100:null,m=n?.gain??0;return d`
    <article class="${`transaction-row ${t.type}`}">
      <div class="tx-identity">
        <span class="${`badge ${t.type}`}">${r?"K\xF6p":"S\xE4lj"}</span>
        <div>
          <strong>${e.symbol}</strong>
          <span>${e.note||s?.name||e.symbol}</span>
        </div>
      </div>
      <div>
        <span class="cell-label">Datum</span>
        <strong>${K(t.date)}</strong>
      </div>
      <div>
        <span class="cell-label">Antal</span>
        <strong>${I(a)}</strong>
      </div>
      <div>
        <span class="cell-label">Kurs</span>
        <strong>${D(i,l)}</strong>
        <small class="muted">${[f?`\xD7 ${le(u,4)} = ${A(i*u)}`:"",o>0?`avgift ${D(o,l)}`:""].filter(Boolean).join(" \xB7 ")}</small>
      </div>
      <div>
        <span class="cell-label">${r?"Kostnad":"Erh\xE5llet"}</span>
        <strong>${A(g)}</strong>
      </div>
      <div>
        <span class="cell-label">${r?"Kurs sedan k\xF6p":"Realiserat"}</span>
        ${r?d`
            <strong class="${R(b??0)}">${b===null?"\u2013":E(b)}</strong>
            <small class="muted">${b===null?"v\xE4ntar p\xE5 kurs":`nu ${y&&x===l?D(y.price,l):A(s?.price??0)}`}</small>
          `:d`
            <strong class="${R(m)}">${B(m)}</strong>
            <small class="${R(m)}">${E(n?.gainPercent??0)} · snitt ${A(n?.averageCost??0)}</small>
          `}
      </div>
      <button
        type="button"
        class="danger-button compact"
        on-click="${()=>r?Pn(e):Mn(e)}"
      >
        Ta bort
      </button>
    </article>
  `}function yt(t,e,s){return d`
    <button
      type="button"
      class="${`chip ${t.typeFilter===e?"active":""}`}"
      on-click="${()=>t.typeFilter=e}"
    >
      ${s}
    </button>
  `}function Vn(t){let e=t.quote,s=ht(t.history?.points??[],240,72),n=F(e?.currency)||w,r=e&&n!==Y();return d`
    <article class="watch-card">
      <div class="watch-card-head">
        <div>
          <strong>${t.symbol}</strong>
          <span>${t.name}</span>
        </div>
        ${t.isHolding?d`
            <div class="card-actions">
              <span class="pill">${I(t.shares)} st</span>
              <button
                type="button"
                class="sell-button compact"
                on-click="${()=>Re(t.symbol)}"
              >
                Sälj
              </button>
            </div>
          `:t.isClosed?d`
            <span class="pill closed">Avslutad</span>
          `:d`
            <button on-click="${()=>On(t.symbol)}">Sluta bevaka</button>
          `}
      </div>
      <svg
        class="watch-chart"
        viewBox="0 0 240 72"
        role="img"
        aria-label="${t.symbol} diagram"
      >
        <path class="sparkline-grid" d="M0 36 L240 36"></path>
        <path class="${`sparkline-path ${R(e?.change??0)}`}" d="${s}"></path>
      </svg>
      <div class="watch-stats">
        <span>
          <small>Senast</small>
          <strong>${A(t.price)}</strong>
          ${r?d`
              <em class="muted">${D(e.price,n)}</em>
            `:""}
        </span>
        <span>
          <small>Rörelse</small>
          <strong class="${R(e?.change??0)}">
            ${E(e?.changePercent??0)}
          </strong>
        </span>
        <span>
          <small>${t.sellCount?"Realiserat":"Uppdaterad"}</small>
          ${t.sellCount?d`
              <strong class="${R(t.realized)}">${B(t.realized)}</strong>
            `:d`
              <strong>${e?.marketTime?Qn(e.marketTime):"V\xE4ntar"}</strong>
            `}
        </span>
      </div>
    </article>
  `}function Kn(t,e){return d`
    <div class="allocation-list">
      ${t.map(s=>{let n=e>0?s.marketValue/e*100:0;return q(s.symbol,d`
            <div class="allocation-row">
              <div>
                <strong>${s.symbol}</strong>
                <span>${A(s.marketValue)}</span>
              </div>
              <div class="allocation-track">
                <span style="${`width: ${Math.max(2,n).toFixed(2)}%`}"></span>
              </div>
              <b>${le(n,1)}%</b>
            </div>
          `)})}
    </div>
  `}function Wn(t){return d`
    <div class="realized-list">
      ${t.map(e=>q(e.symbol,d`
            <div class="realized-row">
              <div>
                <strong>${e.symbol}</strong>
                <span>${I(e.soldShares)} sålda · ${e.isClosed?"positionen avslutad":`${I(e.shares)} kvar`}</span>
              </div>
              <div class="realized-value">
                <strong class="${R(e.realized)}">${B(e.realized)}</strong>
                <small class="${R(e.realized)}">${E(e.realizedPercent)}</small>
              </div>
            </div>
          `))}
    </div>
  `}function Ns(t,e){return d`
    <article class="mover-card">
      <span>${t}</span>
      <strong>${e.symbol}</strong>
      <p class="${R(e.gain)}">
        ${B(e.gain)} ${E(e.gainPercent)}
      </p>
    </article>
  `}function W(t){return d`
    <div class="empty-state">${t}</div>
  `}function Qn(t){return new Intl.DateTimeFormat("sv-SE",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(t))}function Gn(t){if(!t||typeof t!="object")throw new Error("Importfilen \xE4r inte giltig JSON.");if(!Array.isArray(t.lots))throw new Error("Importfilen saknar k\xF6p.");if(t.sales!==void 0&&!Array.isArray(t.sales))throw new Error("Importfilens f\xF6rs\xE4ljningar har fel format.");if(!Array.isArray(t.watchlist))throw new Error("Importfilen saknar bevakningslista.")}
//# sourceMappingURL=app.js.map
