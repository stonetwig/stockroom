var j=`bedrock-${Math.random().toString(36).slice(2)}`,se=`<!--${j}-`,N=`${j}-`,kt=new WeakMap,F=class{constructor(t,s){this.strings=t,this.values=s,this._type="template-result"}getTemplate(){let t=kt.get(this.strings);return t||(t=re(this.strings),kt.set(this.strings,t)),t}};function u(e,...t){return new F(e,t)}function ne(e){let t=!1;for(let s=e.length-1;s>=0;s--){if(e[s]===">")return!1;if(e[s]==="<")return!0}return!1}function re(e){let t=[],s="";for(let a=0;a<e.length;a++)s+=e[a],a<e.length-1&&(ne(s)?(s+=`${N}${a}`,t.push({type:"attr-pending",index:a})):(s+=`${se}${a}-->`,t.push({type:"node",index:a})));let n=document.createElement("template");n.innerHTML=s;let r=new Array(e.length-1).fill(null);return $t(n.content,r,[]),{element:n,parts:r}}function $t(e,t,s){if(e.nodeType===Node.ELEMENT_NODE){let r=[];for(let a of e.attributes)if(a.value.includes(N)||a.name.includes(N)){let c=(a.value+a.name).match(new RegExp(`${N}(\\d+)`));if(c){let l=parseInt(c[1],10),i=a.name.replace(new RegExp(`${N}\\d+`),""),d=i.startsWith("on-"),h=i.startsWith(".");t[l]={type:d?"event":h?"property":"attribute",path:[...s],name:d?i.slice(3):h?i.slice(1):i},r.push(a.name)}}for(let a of r)e.removeAttribute(a)}if(e.nodeType===Node.COMMENT_NODE){let r=e.textContent;if(r.startsWith(j+"-")){let a=parseInt(r.slice(j.length+1),10);t[a]={type:"node",path:[...s]}}}let n=Array.from(e.childNodes);for(let r=0;r<n.length;r++)$t(n[r],t,[...s,r])}function q(e){return e&&e._type==="template-result"}var z=new WeakMap,K=Symbol("bedrock-key");function J(e,t){let s=z.get(t);s?s.strings===e.strings?Y(s,e.values):(t.innerHTML="",s=St(e,t),z.set(t,s)):(s=St(e,t),z.set(t,s))}function St(e,t){let s=e.getTemplate(),n=s.element.content.cloneNode(!0),r=s.parts.map(a=>{if(!a)return null;let c=G(n,a.path);return{...a,node:c,value:void 0}});for(let a=0;a<e.values.length;a++)r[a]&&M(r[a],e.values[a]);return t.appendChild(n),{strings:e.strings,parts:r,container:t}}function Y(e,t){for(let s=0;s<t.length;s++){let n=e.parts[s];n&&n.value!==t[s]&&M(n,t[s])}}function M(e,t){let s=e.value;switch(e.value=t,e.type){case"attribute":ae(e.node,e.name,t);break;case"property":e.node[e.name]=t;break;case"event":oe(e,t,s);break;case"node":ie(e,t,s);break}}function ae(e,t,s){s==null||s===!1?e.removeAttribute(t):s===!0?e.setAttribute(t,""):e.setAttribute(t,String(s))}function oe(e,t,s){s&&e.node.removeEventListener(e.name,s),t&&e.node.addEventListener(e.name,t)}function ie(e,t,s){let n=e.node;if(t==null)Q(e);else if(q(t))ce(e,t);else if(Array.isArray(t))le(e,t);else{Q(e);let r=document.createTextNode(String(t));n.parentNode.insertBefore(r,n),e.nodes=[r]}}function Q(e){e.nodes&&(e.nodes.forEach(t=>t.remove()),e.nodes=null),e.templateInstance&&(e.templateInstance=null),e.arrayItems&&(e.arrayItems.forEach(t=>t.nodes.forEach(s=>s.remove())),e.arrayItems=null)}function ce(e,t){let s=e.node;if(e.templateInstance&&e.templateInstance.strings===t.strings){Y(e.templateInstance,t.values);return}Q(e);let n=t.getTemplate(),r=n.element.content.cloneNode(!0),a=n.parts.map(l=>{if(!l)return null;let i=G(r,l.path);return{...l,node:i,value:void 0}});for(let l=0;l<t.values.length;l++)a[l]&&M(a[l],t.values[l]);let c=Array.from(r.childNodes);s.parentNode.insertBefore(r,s),e.nodes=c,e.templateInstance={strings:t.strings,parts:a}}function le(e,t){let s=e.node,n=s.parentNode,r=e.arrayItems||[],a=new Map;for(let l of r)l.key!==void 0&&a.set(l.key,l);let c=[];for(let l=0;l<t.length;l++){let i=t[l],d=i&&i[K]!==void 0?i[K]:l,h=a.get(d);h?(a.delete(d),q(i)?h.instance&&h.instance.strings===i.strings?Y(h.instance,i.values):(h.nodes.forEach(b=>b.remove()),h=xt(i,d,s,n)):h.nodes[0]&&(h.nodes[0].textContent=String(i??""))):h=xt(i,d,s,n),c.push(h)}for(let l of a.values())l.nodes.forEach(i=>i.remove());for(let l of c)for(let i of l.nodes)n.insertBefore(i,s);e.arrayItems=c}function xt(e,t,s,n){if(q(e)){let r=e.getTemplate(),a=r.element.content.cloneNode(!0),c=r.parts.map(i=>{if(!i)return null;let d=G(a,i.path);return{...i,node:d,value:void 0}});for(let i=0;i<e.values.length;i++)c[i]&&M(c[i],e.values[i]);let l=Array.from(a.childNodes);return n.insertBefore(a,s),{key:t,nodes:l,instance:{strings:e.strings,parts:c}}}else{let r=document.createTextNode(String(e??""));return n.insertBefore(r,s),{key:t,nodes:[r],instance:null}}}function G(e,t){let s=e;for(let n of t)if(!s.childNodes||(s=s.childNodes[n],!s))return null;return s}function w(e,t){return t[K]=e,t}var $=null,At=new Set,ue=new WeakMap;function E(e){if(typeof e!="object"||e===null||e.__isReactive)return e;let t=new Map;return ue.set(e,t),new Proxy(e,{get(n,r){if(r==="__isReactive")return!0;if(r==="__target")return n;$&&(t.has(r)||t.set(r,new Set),t.get(r).add($),$.deps.add(t.get(r)));let a=n[r];return typeof a=="object"&&a!==null&&!a.__isReactive?(n[r]=E(a),n[r]):a},set(n,r,a){let c=Array.isArray(n),l=c?n.length:0,i=n[r];if(typeof a=="object"&&a!==null&&(a=E(a)),n[r]=a,i!==a&&t.has(r)){let d=t.get(r);for(let h of d)Z(h)}if(c&&r!=="length"&&n.length!==l&&t.has("length")){let d=t.get("length");for(let h of d)Z(h)}return!0},deleteProperty(n,r){if(r in n&&(delete n[r],t.has(r))){let a=t.get(r);for(let c of a)Z(c)}return!0}})}function et(e,t={}){let s={fn:e,deps:new Set,active:!0,immediate:t.immediate!==!1};return At.add(s),s.immediate&&Rt(s),()=>{s.active=!1,At.delete(s),Nt(s)}}function Rt(e){if(!e.active)return;Nt(e);let t=$;$=e;try{e.fn()}finally{$=t}}function Nt(e){for(let t of e.deps)t.delete(e);e.deps.clear()}var X=new Set,tt=!1;function Z(e){e.active&&(X.add(e),tt||(tt=!0,queueMicrotask(de)))}function de(){let e=[...X];X.clear(),tt=!1;for(let t of e)Rt(t)}var he=new Map,f=class extends HTMLElement{static tag=null;static shadow=!1;static properties={};static autoRegister=!0;#t={};#s=null;#o=null;#a=!1;#e=!1;#r=null;constructor(){super(),this.constructor.shadow?this.#o=this.attachShadow({mode:"open"}):this.#o=this,this.#n()}#n(){let t=this.constructor.properties;for(let[s,n]of Object.entries(t)){let r=typeof n=="function"?{type:n}:n;r.default!==void 0?this.#t[s]=typeof r.default=="function"?r.default():r.default:this.#t[s]=void 0,Object.defineProperty(this,s,{get:()=>this.#t[s],set:a=>{let c=this.#t[s],l=this.#c(a,r.type);c!==l&&(this.#t[s]=l,this.#u())},enumerable:!0,configurable:!0})}}#c(t,s){if(t==null||!s)return t;switch(s){case String:return String(t);case Number:return Number(t);case Boolean:return!!t;case Array:return Array.isArray(t)?t:[t];case Object:return typeof t=="object"?t:{value:t};default:return t}}get renderRoot(){return this.#o}get routeData(){return this.#r}set routeData(t){this.#r=t,this.#u()}connectedCallback(){this.#a=!0,this.#l(),this.#s=et(()=>{this.#d()})}disconnectedCallback(){this.#a=!1,this.#s&&(this.#s(),this.#s=null)}#l(){let t=this.constructor.properties;for(let[s,n]of Object.entries(t)){let r=typeof n=="function"?{type:n}:n,a=s.replace(/([A-Z])/g,"-$1").toLowerCase();if(this.hasAttribute(a)){let c=this.getAttribute(a);this[s]=this.#i(c,r.type)}}}#i(t,s){if(!s)return t;switch(s){case Boolean:return t!==null&&t!=="false";case Number:return Number(t);case Array:case Object:try{return JSON.parse(t)}catch{return t}default:return t}}static get observedAttributes(){let t=this.properties||{};return Object.keys(t).map(s=>s.replace(/([A-Z])/g,"-$1").toLowerCase())}attributeChangedCallback(t,s,n){if(s===n)return;let r=t.replace(/-([a-z])/g,(a,c)=>c.toUpperCase());if(r in this.constructor.properties){let a=this.constructor.properties[r],c=typeof a=="function"?{type:a}:a;this[r]=this.#i(n,c.type)}}#u(){!this.#a||this.#e||(this.#e=!0,queueMicrotask(()=>{this.#e=!1,this.#a&&this.#d()}))}#d(){let t=this.render();t&&J(t,this.#o),this.updated()}render(){return null}updated(){}requestUpdate(){this.#u()}static register(t){let s=t||this.tag;if(!s)throw new Error("Component must have a tag name");return customElements.get(s)||(customElements.define(s,this),he.set(s,this)),this}};function B(e){return e.autoRegister&&e.tag&&e.register(),e}var g=class e{#t=[];#s=null;#o=null;#a=null;#e=!1;#r="";constructor(t={}){this.#t=t.routes||[],this.#e=t.hash||!1,this.#r=t.base||"",e.instance=this}start(){window.addEventListener("popstate",this.#n),this.#e&&window.addEventListener("hashchange",this.#n);let t=document.querySelector("router-outlet");return t&&this.setOutlet(t),this.#n(),this}stop(){window.removeEventListener("popstate",this.#n),this.#e&&window.removeEventListener("hashchange",this.#n)}setOutlet(t){this.#s=t,this.#n()}get currentPath(){if(this.#e)return window.location.hash.slice(1)||"/";let t=window.location.pathname;return this.#r&&t.startsWith(this.#r)&&(t=t.slice(this.#r.length)),t=t.replace(/\/index\.html$/,"/").replace(/\/$/,"")||"/",t}navigate(t,s={}){let n=this.#e?`#${t}`:`${this.#r}${t}`;s.replace?window.history.replaceState(null,"",n):window.history.pushState(null,"",n),this.#n()}#n=async()=>{let t=this.currentPath,s=this.#c(t);if(!s){console.warn(`No route matched for path: ${t}`);return}let{route:n,params:r}=s;this.#o={...n,params:r},await this.#i(n,r)};#c(t){for(let s of this.#t){let n=this.#l(s.path,t);if(n!==null)return{route:s,params:n}}return null}#l(t,s){let n=[],r=t.replace(/\//g,"\\/").replace(/:([^/]+)/g,(i,d)=>(n.push(d),"([^/]+)")).replace(/\*/g,".*"),a=new RegExp(`^${r}$`),c=s.match(a);if(!c)return null;let l={};return n.forEach((i,d)=>{l[i]=decodeURIComponent(c[d+1])}),l}async#i(t,s){if(!this.#s)return;let n={loading:!0,data:null,error:null,params:s},r=this.#a;if(!r||r.tagName.toLowerCase()!==t.component?(r=document.createElement(t.component),this.#a=r,r.routeData={...n},this.#s.innerHTML="",this.#s.appendChild(r)):r.routeData={...n},t.loader){try{let a=await t.loader(s);n.loading=!1,n.data=a}catch(a){n.loading=!1,n.error=a}r.routeData={...n}}else n.loading=!1,r.routeData={...n}}addRoute(t){this.#t.push(t)}removeRoute(t){this.#t=this.#t.filter(s=>s.path!==t)}get routes(){return[...this.#t]}get useHash(){return this.#e}};g.instance=null;var S=class extends f{static tag="router-outlet";connectedCallback(){super.connectedCallback(),g.instance&&g.instance.setOutlet(this)}render(){return null}};B(S);var x=class extends f{static tag="router-link";static shadow=!0;static properties={to:{type:String},replace:{type:Boolean,default:!1}};#t=t=>{t.preventDefault(),g.instance&&this.to&&g.instance.navigate(this.to,{replace:this.replace})};get href(){return this.to?g.instance&&g.instance.useHash?`#${this.to}`:this.to:"#"}render(){return u`
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
      <a href="${this.href}" on-click=${this.#t}>
        <slot></slot>
      </a>
    `}};B(x);function st(e){return new g(e).start()}var pe="stockroom-local-device";var U=["lots","watchlist","quotes","histories","settings"],nt;async function Tt(){let[e,t,s,n,r]=await Promise.all([T("lots"),T("watchlist"),T("quotes"),T("histories"),T("settings")]);return{lots:e.sort((a,c)=>c.purchasedAt.localeCompare(a.purchasedAt)),watchlist:t.sort((a,c)=>a.symbol.localeCompare(c.symbol)),quotes:Object.fromEntries(s.map(a=>[a.symbol,a])),histories:Object.fromEntries(n.map(a=>[a.symbol,a])),settings:Object.fromEntries(r.map(a=>[a.key,a.value]))}}async function It(e){await I("lots",e)}async function Ct(e){await Bt("lots",e)}async function Dt(e){await I("watchlist",e)}async function Ot(e){await Bt("watchlist",e)}async function Pt(e){await I("quotes",e)}async function Lt(e){await I("histories",e)}async function jt(e,t){await I("settings",{key:e,value:t})}async function Ft(e){let t=await C();await new Promise((s,n)=>{let r=t.transaction(U,"readwrite");r.oncomplete=()=>s(),r.onerror=()=>n(r.error),r.onabort=()=>n(r.error);for(let a of U)r.objectStore(a).clear();for(let a of qt(e.lots))r.objectStore("lots").put(a);for(let a of qt(e.watchlist))r.objectStore("watchlist").put(a);for(let a of Et(e.quotes))r.objectStore("quotes").put(a);for(let a of Et(e.histories))r.objectStore("histories").put(a);for(let[a,c]of Object.entries(e.settings??{}))r.objectStore("settings").put({key:a,value:c})})}async function Mt(){let e=await C();await new Promise((t,s)=>{let n=e.transaction(U,"readwrite");n.oncomplete=()=>t(),n.onerror=()=>s(n.error),n.onabort=()=>s(n.error);for(let r of U)n.objectStore(r).clear()})}async function T(e){let t=await C();return await new Promise((s,n)=>{let a=t.transaction(e,"readonly").objectStore(e).getAll();a.onsuccess=()=>s(a.result??[]),a.onerror=()=>n(a.error)})}async function I(e,t){let s=await C();await new Promise((n,r)=>{let a=s.transaction(e,"readwrite");a.oncomplete=()=>n(),a.onerror=()=>r(a.error),a.onabort=()=>r(a.error),a.objectStore(e).put(t)})}async function Bt(e,t){let s=await C();await new Promise((n,r)=>{let a=s.transaction(e,"readwrite");a.oncomplete=()=>n(),a.onerror=()=>r(a.error),a.onabort=()=>r(a.error),a.objectStore(e).delete(t)})}function C(){return nt||(nt=new Promise((e,t)=>{let s=indexedDB.open(pe,1);s.onerror=()=>t(s.error),s.onsuccess=()=>e(s.result),s.onupgradeneeded=()=>{let n=s.result;if(!n.objectStoreNames.contains("lots")){let r=n.createObjectStore("lots",{keyPath:"id"});r.createIndex("symbol","symbol",{unique:!1}),r.createIndex("purchasedAt","purchasedAt",{unique:!1})}n.objectStoreNames.contains("watchlist")||n.createObjectStore("watchlist",{keyPath:"symbol"}),n.objectStoreNames.contains("quotes")||n.createObjectStore("quotes",{keyPath:"symbol"}),n.objectStoreNames.contains("histories")||n.createObjectStore("histories",{keyPath:"symbol"}),n.objectStoreNames.contains("settings")||n.createObjectStore("settings",{keyPath:"key"})}})),nt}function qt(e){return Array.isArray(e)?e:[]}function Et(e){return Array.isArray(e)?e:Object.values(e??{})}function m(e){return String(e??"").trim().toUpperCase().replace(/\s+/g,"")}async function _(e){let t=[...new Set(e.map(m).filter(Boolean))];return t.length===0?{quotes:[],errors:[]}:await at(`/api/quotes?symbols=${encodeURIComponent(t.join(","))}`)}async function Ut(e,t="6mo"){let s=m(e);if(!s)throw new Error("Symbol saknas");return await at(`/api/history?symbol=${encodeURIComponent(s)}&range=${t}&interval=1d`)}async function rt(e){let t=e.trim();return t?(await at(`/api/search?q=${encodeURIComponent(t)}`)).results??[]:[]}async function at(e){let t=new AbortController,s=setTimeout(()=>t.abort(),12e3);try{let n=await fetch(e,{headers:{Accept:"application/json"},signal:t.signal}),r=await n.text();if(!n.ok)throw new Error(r||`F\xF6rfr\xE5gan misslyckades med ${n.status}`);return JSON.parse(r)}catch(n){throw n.name==="AbortError"?new Error("F\xF6rfr\xE5gan om marknadsdata tog f\xF6r l\xE5ng tid"):n}finally{clearTimeout(s)}}var k="SEK";function _t(e,t,s,n,r={}){let a=new Set(t.map(c=>c.symbol));for(let c of e)a.add(c.symbol);return[...a].map(c=>{let l=e.filter(v=>v.symbol===c).sort((v,ee)=>ee.purchasedAt.localeCompare(v.purchasedAt)),i=s[c],d=ot(i?.currency,r),h=W(Number.isFinite(i?.price)?i.price:0,i?.currency,r),b=D(l.map(v=>v.quantity)),R=D(l.map(v=>v.quantity*v.price+(v.fees??0))),vt=b*h,wt=vt-R,Zt=R>0?wt/R*100:0,L=Number.isFinite(i?.previousClose)?i.previousClose*d:h,Xt=b*(h-L),te=L>0?(h-L)/L*100:0;return{symbol:c,name:i?.name??c,quote:i,lots:l,history:fe(n[c],i?.currency,r),sourceCurrency:i?.currency??k,conversionRate:d,shares:b,cost:R,averageCost:b>0?R/b:0,price:h,marketValue:vt,gain:wt,gainPercent:Zt,dayChange:Xt,dayChangePercent:te,isHolding:b>0}}).sort((c,l)=>l.marketValue!==c.marketValue?l.marketValue-c.marketValue:c.symbol.localeCompare(l.symbol))}function Vt(e){let t=e.filter(i=>i.isHolding),s=D(t.map(i=>i.marketValue)),n=D(t.map(i=>i.cost)),r=s-n,a=D(t.map(i=>i.dayChange)),c=t.toSorted((i,d)=>d.gainPercent-i.gainPercent)[0],l=t.toSorted((i,d)=>i.gainPercent-d.gainPercent)[0];return{holdingsCount:t.length,trackedCount:e.length,totalValue:s,totalCost:n,totalGain:r,totalGainPercent:n>0?r/n*100:0,dayChange:a,dayChangePercent:s-a>0?a/(s-a)*100:0,cashBasis:n,best:c,worst:l}}function p(e,t=k){let s=Number.isFinite(e)?e:0;try{return new Intl.NumberFormat("sv-SE",{style:"currency",currency:t,maximumFractionDigits:Math.abs(s)>=1e3?0:2}).format(s)}catch{return`${s.toFixed(2)} ${t}`}}function W(e,t,s={}){return(Number.isFinite(e)?e:0)*ot(t,s)}function ot(e,t={}){let s=me(e);return!s||s===k?1:Number.isFinite(t[s])?t[s]:1}function O(e,t=2){let s=Number.isFinite(e)?e:0;return new Intl.NumberFormat("sv-SE",{minimumFractionDigits:t,maximumFractionDigits:t}).format(s)}function A(e){let t=Number.isFinite(e)?e:0;return`${new Intl.NumberFormat("sv-SE",{signDisplay:"always",minimumFractionDigits:2,maximumFractionDigits:2}).format(t)}%`}function y(e){return e>1e-4?"positive":e<-1e-4?"negative":"neutral"}function it(e,t=180,s=56){let n=e.map(i=>i.close).filter(i=>Number.isFinite(i));if(n.length<2)return"";let r=Math.min(...n),c=Math.max(...n)-r||1,l=t/(n.length-1);return n.map((i,d)=>{let h=d*l,b=s-(i-r)/c*s;return`${d===0?"M":"L"} ${h.toFixed(2)} ${b.toFixed(2)}`}).join(" ")}function D(e){return e.reduce((t,s)=>t+(Number(s)||0),0)}function fe(e,t,s){if(!e?.points)return e;let n=ot(t,s);return n===1?e:{...e,points:e.points.map(r=>({...r,open:V(r.open,n),high:V(r.high,n),low:V(r.low,n),close:V(r.close,n)}))}}function V(e,t){return Number.isFinite(e)?e*t:e}function me(e){return String(e??"").trim().toUpperCase()}var o=E({ready:!1,lots:[],watchlist:[],quotes:{},fxRates:{},histories:{},settings:{refreshMinutes:5,lastRefresh:""},refreshing:!1,error:"",notice:"",searchResults:[],searchLoading:!1});x.register();S.register();var ct=class extends f{static tag="app-root";refresh=()=>{Qt({forceHistory:!1})};render(){return u`
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
            <router-link to="/lots">Köp</router-link>
            <router-link to="/research">Sök</router-link>
            <router-link to="/settings">Inställningar</router-link>
          </nav>

          <button
            class="refresh-button"
            on-click="${this.refresh}"
            disabled="${o.refreshing}"
          >
            ${o.refreshing?"Uppdaterar":"Uppdatera"}
          </button>
        </header>

        ${o.error?u`
            <div class="status-banner error">
              <span>${o.error}</span>
              <button on-click="${()=>o.error=""}">Stäng</button>
            </div>
          `:""} ${o.notice?u`
            <div class="status-banner notice">
              <span>${o.notice}</span>
              <button on-click="${()=>o.notice=""}">Stäng</button>
            </div>
          `:""}

        <main class="workspace">
          ${o.ready?u`
              <router-outlet></router-outlet>
            `:u`
              <section class="loading-panel">Laddar lokal portfölj...</section>
            `}
        </main>
      </div>
    `}},lt=class extends f{static tag="dashboard-page";render(){let t=zt(),s=Vt(t),n=t.filter(r=>r.isHolding);return u`
      <section class="dashboard-grid">
        <div class="summary-band">
          <article class="metric primary-metric">
            <span class="metric-label">Portföljvärde</span>
            <strong>${p(s.totalValue)}</strong>
            <span class="${`metric-delta ${y(s.totalGain)}`}">
              ${p(s.totalGain)} ${A(s.totalGainPercent)}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">Dagens rörelse</span>
            <strong class="${y(s.dayChange)}">
              ${p(s.dayChange)}
            </strong>
            <span class="${`metric-delta ${y(s.dayChange)}`}">
              ${A(s.dayChangePercent)}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">Anskaffningsvärde</span>
            <strong>${p(s.totalCost)}</strong>
            <span class="metric-delta neutral">${s.holdingsCount} innehav</span>
          </article>
          <article class="metric">
            <span class="metric-label">Bevakade</span>
            <strong>${s.trackedCount}</strong>
            <span class="metric-delta neutral">${xe()}</span>
          </article>
        </div>

        <section class="panel holdings-panel">
          <div class="panel-heading">
            <div>
              <h2>Innehav</h2>
              <p>${n.length?"\xD6ppna positioner sorterade efter marknadsv\xE4rde.":"Inga \xF6ppna k\xF6p \xE4nnu."}</p>
            </div>
          </div>
          ${n.length?u`
              <position-table .positions="${n}"></position-table>
            `:P("L\xE4gg till ditt f\xF6rsta k\xF6p f\xF6r att b\xF6rja f\xF6lja resultatet.")}
        </section>

        <section class="panel add-panel">
          <div class="panel-heading">
            <div>
              <h1>Lägg till köp</h1>
              <p>
                Registrera aktiesymbol, datum, antal och anskaffningspris i SEK.
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
          ${n.length?qe(n,s.totalValue):P("F\xF6rdelningen visas efter minst ett sparat k\xF6p.")}
        </section>

        <section class="panel movers-panel">
          <div class="panel-heading">
            <div>
              <h2>Utveckling</h2>
              <p>Bästa och svagaste orealiserade avkastning.</p>
            </div>
          </div>
          ${s.best?u`
              <div class="mover-grid">
                ${Ht("B\xE4st",s.best)} ${Ht("Svagast",s.worst)}
              </div>
            `:P("Utveckling visas n\xE4r kurserna har laddats.")}
        </section>
      </section>
    `}},ut=class extends f{static tag="add-lot-form";static properties={symbol:{type:String,default:""},quantity:{type:String,default:""},price:{type:String,default:""},purchasedAt:{type:String,default:H},fees:{type:String,default:"0"},note:{type:String,default:""},message:{type:String,default:""},suggestions:{type:Array,default:()=>[]},lookupLoading:{type:Boolean,default:!1},suggestionOpen:{type:Boolean,default:!1},busy:{type:Boolean,default:!1}};searchTimer=null;lookupToken=0;submit=async t=>{t.preventDefault();let s=m(this.symbol),n=Number(this.quantity),r=Number(this.price),a=Number(this.fees||0);if(!s||!Number.isFinite(n)||n<=0){this.message="Ange en aktiesymbol och ett positivt antal aktier.";return}if(!Number.isFinite(r)||r<=0){this.message="Ange k\xF6ppriset per aktie.";return}this.busy=!0;try{await ye({symbol:s,quantity:n,price:r,purchasedAt:this.purchasedAt||H(),fees:Number.isFinite(a)?a:0,note:this.note.trim()}),this.message=`Sparade ${O(n,4)} aktier i ${s}.`,this.symbol="",this.quantity="",this.price="",this.fees="0",this.note="",this.purchasedAt=H(),this.suggestions=[],this.suggestionOpen=!1}catch(c){this.message=c.message}finally{this.busy=!1}};handleSymbolInput=t=>{this.symbol=t.target.value.toUpperCase(),this.queueTickerSearch(this.symbol)};queueTickerSearch(t){clearTimeout(this.searchTimer);let s=m(t);if(!s){this.suggestions=[],this.suggestionOpen=!1,this.lookupLoading=!1;return}this.searchTimer=setTimeout(()=>{this.runTickerSearch(s)},180)}async runTickerSearch(t){let s=++this.lookupToken;this.lookupLoading=!0,this.suggestionOpen=!0;try{let n=await rt(t);if(s!==this.lookupToken)return;this.suggestions=n.filter(r=>r.symbol).slice(0,7)}catch(n){if(s!==this.lookupToken)return;this.suggestions=[],this.message=n.message}finally{s===this.lookupToken&&(this.lookupLoading=!1)}}chooseTicker=async t=>{let s=m(t.symbol);if(s){clearTimeout(this.searchTimer),this.lookupToken+=1,this.symbol=s,this.suggestions=[],this.suggestionOpen=!1,this.lookupLoading=!1,this.busy=!0;try{let n=await gt(s),r=await Wt(n);this.price=r.toFixed(2),this.message=`Valde ${s} till ${p(r)}.`}catch(n){this.message=n.message}finally{this.busy=!1}}};closeSuggestions=()=>{setTimeout(()=>{this.suggestionOpen=!1},120)};fillPrice=async()=>{let t=m(this.symbol);if(!t){this.message="Ange en aktiesymbol f\xF6rst.";return}this.busy=!0;try{let s=await gt(t),n=await Wt(s);this.price=n.toFixed(2),this.message=`Anv\xE4nder senaste kursen f\xF6r ${t}: ${p(n)}.`}catch(s){this.message=s.message}finally{this.busy=!1}};render(){return u`
      <form class="lot-form" on-submit="${this.submit}">
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
          ${this.suggestionOpen&&(this.lookupLoading||this.suggestions.length)?u`
              <div class="ticker-menu">
                ${this.lookupLoading?u`
                    <div class="ticker-menu-status">Söker...</div>
                  `:this.suggestions.map(t=>w(t.symbol,u`
                        <button
                          type="button"
                          class="ticker-option"
                          on-mousedown="${s=>s.preventDefault()}"
                          on-click="${()=>this.chooseTicker(t)}"
                        >
                          <strong>${t.symbol}</strong>
                          <span>${t.name}</span>
                          <small>${[t.exchange,t.type].filter(Boolean).join(" / ")}</small>
                        </button>
                      `))}
              </div>
            `:""}
        </label>

        <label>
          <span>Antal</span>
          <input
            type="number"
            min="0"
            step="0.000001"
            placeholder="12"
            .value="${this.quantity}"
            on-input="${t=>this.quantity=t.target.value}"
          />
        </label>

        <label>
          <span>Pris (SEK)</span>
          <div class="input-action">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="1 850.25"
              .value="${this.price}"
              on-input="${t=>this.price=t.target.value}"
            />
            <button type="button" on-click="${this.fillPrice}" disabled="${this.busy}">
              Hämta
            </button>
          </div>
        </label>

        <label>
          <span>Datum</span>
          <input
            type="date"
            .value="${this.purchasedAt}"
            on-input="${t=>this.purchasedAt=t.target.value}"
          />
        </label>

        <label>
          <span>Avgifter (SEK)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            .value="${this.fees}"
            on-input="${t=>this.fees=t.target.value}"
          />
        </label>

        <label class="wide-field">
          <span>Anteckning</span>
          <input
            placeholder="Mäklare, tes, konto"
            .value="${this.note}"
            on-input="${t=>this.note=t.target.value}"
          />
        </label>

        <div class="form-actions">
          <button class="primary-button" type="submit" disabled="${this.busy}">
            ${this.busy?"Sparar":"Spara k\xF6p"}
          </button>
          ${this.message?u`
              <p>${this.message}</p>
            `:""}
        </div>
      </form>
    `}},dt=class extends f{static tag="position-table";static properties={positions:{type:Array,default:()=>[]}};render(){return u`
      <div class="position-list">
        ${this.positions.map(t=>w(t.symbol,Ae(t)))}
      </div>
    `}},ht=class extends f{static tag="lots-page";render(){let t=[...o.lots].sort((n,r)=>r.purchasedAt.localeCompare(n.purchasedAt)),s=o.quotes;return u`
      <section class="page-stack">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h1>Köp</h1>
              <p>
                Priser och avgifter sparas som SEK i IndexedDB. Redigera genom att ta
                bort och lägga till igen.
              </p>
            </div>
          </div>
          ${t.length?u`
              <div class="lot-list">
                ${t.map(n=>w(n.id,Re(n,s[n.symbol])))}
              </div>
            `:P("Inga k\xF6p har sparats.")}
        </section>
      </section>
    `}},pt=class extends f{static tag="research-page";static properties={query:{type:String,default:""},message:{type:String,default:""}};search=async t=>{t.preventDefault();let s=this.query.trim();if(s){o.searchLoading=!0,this.message="";try{o.searchResults=await rt(s),o.searchResults.length===0&&(this.message="Inga matchande tickers hittades.")}catch(n){this.message=n.message}finally{o.searchLoading=!1}}};track=async t=>{await Kt(t),this.message=`${t} bevakas nu lokalt.`};render(){let t=zt();return u`
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
            <button class="primary-button" disabled="${o.searchLoading}">
              ${o.searchLoading?"S\xF6ker":"S\xF6k"}
            </button>
          </form>
          ${this.message?u`
              <p class="inline-message">${this.message}</p>
            `:""}
          <div class="search-results">
            ${o.searchResults.map(s=>w(s.symbol,u`
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
          ${t.length?u`
              <div class="watch-grid">
                ${t.map(s=>w(s.symbol,Ne(s)))}
              </div>
            `:P("S\xF6k och bevaka en symbol, eller spara ett k\xF6p.")}
        </section>
      </section>
    `}},ft=class extends f{static tag="settings-page";static properties={message:{type:String,default:""},busy:{type:Boolean,default:!1}};exportData=()=>{let t={app:"Stockroom",version:1,exportedAt:new Date().toISOString(),lots:o.lots,watchlist:o.watchlist,quotes:o.quotes,histories:o.histories,settings:o.settings},s=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(s),n.download=`stockroom-${H()}.json`,n.click(),URL.revokeObjectURL(n.href)};importData=async t=>{let s=t.target.files?.[0];if(s){this.busy=!0;try{let n=JSON.parse(await s.text());Te(n),await Ft(n),await mt(),this.message="Importerade lokal portf\xF6ljdata."}catch(n){this.message=n.message}finally{this.busy=!1,t.target.value=""}}};clearData=async()=>{confirm("Ta bort all lokal Stockroom-data fr\xE5n den h\xE4r webbl\xE4saren?")&&(await Mt(),await mt(),this.message="Lokal data rensad.")};persistStorage=async()=>{if(!navigator.storage?.persist){this.message="Best\xE4ndig webbl\xE4sarlagring \xE4r inte tillg\xE4nglig h\xE4r.";return}let t=await navigator.storage.persist();this.message=t?"Webbl\xE4saren beviljade best\xE4ndig lagring.":"Webbl\xE4saren beviljade inte best\xE4ndig lagring."};render(){return u`
      <section class="settings-grid">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h1>Lokal data</h1>
              <p>Portföljposter stannar i den här webbläsarens IndexedDB.</p>
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
          ${this.message?u`
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
            <span><strong>${o.lots.length}</strong> köp</span>
            <span><strong>${o.watchlist.length}</strong> bevakade symboler</span>
            <span><strong>${Object.keys(o.quotes).length}</strong> kursbilder</span>
            <span><strong>${Object.keys(o.histories).length}</strong> historikposter</span>
          </div>
        </section>
      </section>
    `}};ct.register();lt.register();ut.register();dt.register();ht.register();pt.register();ft.register();st({routes:[{path:"/",component:"dashboard-page"},{path:"/lots",component:"lots-page"},{path:"/research",component:"research-page"},{path:"/settings",component:"settings-page"}]});ge();async function ge(){await mt(),await Qt({forceHistory:!1,quiet:!0})}async function mt(){let e=await Tt();o.lots=e.lots,o.watchlist=e.watchlist,o.quotes=e.quotes,o.fxRates=ke(e.quotes),o.histories=e.histories,o.settings={refreshMinutes:5,lastRefresh:"",...e.settings},o.ready=!0}function zt(){return _t(o.lots,o.watchlist,o.quotes,o.histories,o.fxRates)}async function ye(e){let t=m(e.symbol),s={id:crypto.randomUUID(),symbol:t,quantity:Number(e.quantity),price:Number(e.price),purchasedAt:e.purchasedAt,fees:Number(e.fees??0),note:e.note??"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await It(s),o.lots=[s,...o.lots].sort((n,r)=>r.purchasedAt.localeCompare(n.purchasedAt)),await Kt(t,{quiet:!0})}async function be(e){await Ct(e),o.lots=o.lots.filter(t=>t.id!==e)}async function Kt(e,t={}){let s=m(e);if(!s)throw new Error("Aktiesymbol saknas");if(!o.watchlist.some(n=>n.symbol===s)){let n={symbol:s,addedAt:new Date().toISOString()};await Dt(n),o.watchlist=[...o.watchlist,n].sort((r,a)=>r.symbol.localeCompare(a.symbol))}await gt(s),t.quiet||(o.notice=`${s} bevakas p\xE5 den h\xE4r enheten.`)}async function ve(e){let t=m(e);await Ot(t),o.watchlist=o.watchlist.filter(s=>s.symbol!==t)}async function gt(e){let t=await _([e]),s=t.quotes?.[0];if(!s)throw new Error(t.errors?.[0]?.message??`Ingen kurs hittades f\xF6r ${e}`);return await yt(s),await bt([s],{required:!0}),await Gt(s.symbol,!0),s}async function Qt(e={}){let t=Se();if(t.length!==0&&!o.refreshing){o.refreshing=!0,e.quiet||(o.error="");try{let s=await _(t),n=s.quotes??[];for(let a of n)await yt(a);await bt(n,{required:!1});let r=new Date().toISOString();o.settings={...o.settings,lastRefresh:r},await jt("lastRefresh",r);for(let a of t.slice(0,24))await Gt(a,e.forceHistory).catch(()=>{});s.errors?.length&&!e.quiet&&(o.error=s.errors.map(a=>`${a.symbol}: ${a.message}`).join(" / "))}catch(s){e.quiet||(o.error=s.message)}finally{o.refreshing=!1}}}async function yt(e){let t={...e,symbol:m(e.symbol),updatedAt:new Date().toISOString()};await Pt(t),o.quotes={...o.quotes,[t.symbol]:t},we(t)}async function Wt(e){return await bt([e],{required:!0}),W(e.price,e.currency,o.fxRates)}async function bt(e,t={}){let n=[...new Set(e.map(l=>Yt(l.currency)).filter(l=>l&&l!==k))].filter(l=>!Number.isFinite(o.fxRates[l]));if(n.length===0)return;let r=n.map($e),a=await _(r);for(let l of a.quotes??[])await yt(l);let c=n.filter(l=>!Number.isFinite(o.fxRates[l]));if(t.required&&c.length)throw new Error(`Kunde inte konvertera ${c.join(", ")} till ${k}.`)}function we(e){let t=Jt(e.symbol);!t||!Number.isFinite(e.price)||(o.fxRates={...o.fxRates,[t]:e.price})}function ke(e){let t={};for(let s of Object.values(e??{})){let n=Jt(s.symbol);n&&Number.isFinite(s.price)&&(t[n]=s.price)}return t}function $e(e){return`${Yt(e)}${k}=X`}function Jt(e){return m(e).match(/^([A-Z]{3})SEK=X$/)?.[1]??""}function Yt(e){return String(e??"").trim().toUpperCase()}async function Gt(e,t=!1){let s=o.histories[e],n=s?.updatedAt?Date.now()-new Date(s.updatedAt).getTime():1/0;if(!t&&n<6*60*60*1e3)return;let r=await Ut(e,"6mo");await Lt(r),o.histories={...o.histories,[r.symbol]:r}}function Se(){return[...new Set([...o.watchlist.map(e=>e.symbol),...o.lots.map(e=>e.symbol)])].filter(Boolean)}function xe(){let e=o.settings.lastRefresh;return e?new Intl.DateTimeFormat("sv-SE",{hour:"2-digit",minute:"2-digit",month:"short",day:"numeric"}).format(new Date(e)):"ej uppdaterad"}function H(){return new Date().toISOString().slice(0,10)}function Ae(e){let t=it(e.history?.points??[],180,54);return u`
    <article class="position-row">
      <div class="identity-cell">
        <strong>${e.symbol}</strong>
        <span>${e.name}</span>
      </div>
      <svg
        class="sparkline"
        viewBox="0 0 180 54"
        role="img"
        aria-label="${e.symbol} pristrend"
      >
        <path class="sparkline-grid" d="M0 27 L180 27"></path>
        <path class="${`sparkline-path ${y(e.gain)}`}" d="${t}"></path>
      </svg>
      <div>
        <span class="cell-label">Antal</span>
        <strong>${O(e.shares,4)}</strong>
      </div>
      <div>
        <span class="cell-label">Pris</span>
        <strong>${p(e.price)}</strong>
      </div>
      <div>
        <span class="cell-label">Värde</span>
        <strong>${p(e.marketValue)}</strong>
      </div>
      <div>
        <span class="cell-label">Resultat</span>
        <strong class="${y(e.gain)}">
          ${p(e.gain)}
        </strong>
        <small class="${y(e.gain)}">${A(e.gainPercent)}</small>
      </div>
    </article>
  `}function Re(e,t){let s=t?W(t.price,t.currency,o.fxRates):e.price,n=e.quantity*s,r=e.quantity*e.price+(e.fees??0),a=n-r;return u`
    <article class="lot-row">
      <div>
        <strong>${e.symbol}</strong>
        <span>${e.note||"Ingen anteckning"}</span>
      </div>
      <div>
        <span class="cell-label">Datum</span>
        <strong>${e.purchasedAt}</strong>
      </div>
      <div>
        <span class="cell-label">Antal</span>
        <strong>${O(e.quantity,4)}</strong>
      </div>
      <div>
        <span class="cell-label">Anskaffning</span>
        <strong>${p(r)}</strong>
      </div>
      <div>
        <span class="cell-label">Resultat</span>
        <strong class="${y(a)}">${p(a)}</strong>
      </div>
      <button class="danger-button compact" on-click="${()=>be(e.id)}">Ta bort</button>
    </article>
  `}function Ne(e){let t=e.quote,s=it(e.history?.points??[],240,72);return u`
    <article class="watch-card">
      <div class="watch-card-head">
        <div>
          <strong>${e.symbol}</strong>
          <span>${e.name}</span>
        </div>
        ${e.isHolding?u`
            <span class="pill">Innehav</span>
          `:u`
            <button on-click="${()=>ve(e.symbol)}">Sluta bevaka</button>
          `}
      </div>
      <svg
        class="watch-chart"
        viewBox="0 0 240 72"
        role="img"
        aria-label="${e.symbol} diagram"
      >
        <path class="sparkline-grid" d="M0 36 L240 36"></path>
        <path class="${`sparkline-path ${y(t?.change??0)}`}" d="${s}"></path>
      </svg>
      <div class="watch-stats">
        <span>
          <small>Senast</small>
          <strong>${p(e.price)}</strong>
        </span>
        <span>
          <small>Rörelse</small>
          <strong class="${y(t?.change??0)}">
            ${A(t?.changePercent??0)}
          </strong>
        </span>
        <span>
          <small>Uppdaterad</small>
          <strong>${t?.marketTime?Ee(t.marketTime):"V\xE4ntar"}</strong>
        </span>
      </div>
    </article>
  `}function qe(e,t){return u`
    <div class="allocation-list">
      ${e.map(s=>{let n=t>0?s.marketValue/t*100:0;return w(s.symbol,u`
            <div class="allocation-row">
              <div>
                <strong>${s.symbol}</strong>
                <span>${p(s.marketValue)}</span>
              </div>
              <div class="allocation-track">
                <span style="${`width: ${Math.max(2,n).toFixed(2)}%`}"></span>
              </div>
              <b>${O(n,1)}%</b>
            </div>
          `)})}
    </div>
  `}function Ht(e,t){return u`
    <article class="mover-card">
      <span>${e}</span>
      <strong>${t.symbol}</strong>
      <p class="${y(t.gain)}">
        ${p(t.gain)} ${A(t.gainPercent)}
      </p>
    </article>
  `}function P(e){return u`
    <div class="empty-state">${e}</div>
  `}function Ee(e){return new Intl.DateTimeFormat("sv-SE",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(e))}function Te(e){if(!e||typeof e!="object")throw new Error("Importfilen \xE4r inte giltig JSON.");if(!Array.isArray(e.lots))throw new Error("Importfilen saknar k\xF6p.");if(!Array.isArray(e.watchlist))throw new Error("Importfilen saknar bevakningslista.")}
//# sourceMappingURL=app.js.map
