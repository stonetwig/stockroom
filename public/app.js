var qe=`bedrock-${Math.random().toString(36).slice(2)}`,Nn=`<!--${qe}-`,we=`${qe}-`,Jt=new WeakMap,Me=class{constructor(t,s){this.strings=t,this.values=s,this._type="template-result"}getTemplate(){let t=Jt.get(this.strings);return t||(t=Fn(this.strings),Jt.set(this.strings,t)),t}};function h(e,...t){return new Me(e,t)}function Cn(e){let t=!1;for(let s=e.length-1;s>=0;s--){if(e[s]===">")return!1;if(e[s]==="<")return!0}return!1}function Fn(e){let t=[],s="";for(let a=0;a<e.length;a++)s+=e[a],a<e.length-1&&(Cn(s)?(s+=`${we}${a}`,t.push({type:"attr-pending",index:a})):(s+=`${Nn}${a}-->`,t.push({type:"node",index:a})));let n=document.createElement("template");n.innerHTML=s;let r=new Array(e.length-1).fill(null);return Zt(n.content,r,[]),{element:n,parts:r}}function Zt(e,t,s){if(e.nodeType===Node.ELEMENT_NODE){let r=[];for(let a of e.attributes)if(a.value.includes(we)||a.name.includes(we)){let i=(a.value+a.name).match(new RegExp(`${we}(\\d+)`));if(i){let l=parseInt(i[1],10),c=a.name.replace(new RegExp(`${we}\\d+`),""),u=c.startsWith("on-"),p=c.startsWith(".");t[l]={type:u?"event":p?"property":"attribute",path:[...s],name:u?c.slice(3):p?c.slice(1):c},r.push(a.name)}}for(let a of r)e.removeAttribute(a)}if(e.nodeType===Node.COMMENT_NODE){let r=e.textContent;if(r.startsWith(qe+"-")){let a=parseInt(r.slice(qe.length+1),10);t[a]={type:"node",path:[...s]}}}let n=Array.from(e.childNodes);for(let r=0;r<n.length;r++)Zt(n[r],t,[...s,r])}function xe(e){return e&&e._type==="template-result"}var Xe=new WeakMap,et=Symbol("bedrock-key");function st(e,t){let s=Xe.get(t);s?s.strings===e.strings?nt(s,e.values):(t.innerHTML="",s=Xt(e,t),Xe.set(t,s)):(s=Xt(e,t),Xe.set(t,s))}function Xt(e,t){let s=e.getTemplate(),n=s.element.content.cloneNode(!0),r=s.parts.map(a=>{if(!a)return null;let i=rt(n,a.path);return{...a,node:i,value:void 0}});for(let a=0;a<e.values.length;a++)r[a]&&je(r[a],e.values[a]);return t.appendChild(n),{strings:e.strings,parts:r,container:t}}function nt(e,t){for(let s=0;s<t.length;s++){let n=e.parts[s];n&&n.value!==t[s]&&je(n,t[s])}}function je(e,t){let s=e.value;switch(e.value=t,e.type){case"attribute":Tn(e.node,e.name,t);break;case"property":e.node[e.name]=t;break;case"event":In(e,t,s);break;case"node":Dn(e,t,s);break}}function Tn(e,t,s){s==null||s===!1?e.removeAttribute(t):s===!0?e.setAttribute(t,""):e.setAttribute(t,String(s))}function In(e,t,s){s&&e.node.removeEventListener(e.name,s),t&&e.node.addEventListener(e.name,t)}function Dn(e,t,s){let n=e.node;if(t==null)tt(e);else if(xe(t))En(e,t);else if(Array.isArray(t))Pn(e,t);else{tt(e);let r=document.createTextNode(String(t));n.parentNode.insertBefore(r,n),e.nodes=[r]}}function tt(e){e.nodes&&(e.nodes.forEach(t=>t.remove()),e.nodes=null),e.templateInstance&&(e.templateInstance=null),e.arrayItems&&(e.arrayItems.forEach(t=>t.nodes.forEach(s=>s.remove())),e.arrayItems=null)}function En(e,t){let s=e.node;if(e.templateInstance&&e.templateInstance.strings===t.strings){nt(e.templateInstance,t.values);return}tt(e);let n=t.getTemplate(),r=n.element.content.cloneNode(!0),a=n.parts.map(l=>{if(!l)return null;let c=rt(r,l.path);return{...l,node:c,value:void 0}});for(let l=0;l<t.values.length;l++)a[l]&&je(a[l],t.values[l]);let i=Array.from(r.childNodes);s.parentNode.insertBefore(r,s),e.nodes=i,e.templateInstance={strings:t.strings,parts:a}}function Pn(e,t){let s=e.node,n=s.parentNode,r=e.arrayItems||[],a=new Map;for(let l of r)l.key!==void 0&&a.set(l.key,l);let i=[];for(let l=0;l<t.length;l++){let c=t[l],u=c&&c[et]!==void 0?c[et]:l,p=a.get(u);p?(a.delete(u),xe(c)?p.instance&&p.instance.strings===c.strings?nt(p.instance,c.values):(p.nodes.forEach(x=>x.remove()),p=es(c,u,s,n)):p.nodes[0]&&(p.nodes[0].textContent=String(c??""))):p=es(c,u,s,n),i.push(p)}for(let l of a.values())l.nodes.forEach(c=>c.remove());for(let l of i)for(let c of l.nodes)n.insertBefore(c,s);e.arrayItems=i}function es(e,t,s,n){if(xe(e)){let r=e.getTemplate(),a=r.element.content.cloneNode(!0),i=r.parts.map(c=>{if(!c)return null;let u=rt(a,c.path);return{...c,node:u,value:void 0}});for(let c=0;c<e.values.length;c++)i[c]&&je(i[c],e.values[c]);let l=Array.from(a.childNodes);return n.insertBefore(a,s),{key:t,nodes:l,instance:{strings:e.strings,parts:i}}}else{let r=document.createTextNode(String(e??""));return n.insertBefore(r,s),{key:t,nodes:[r],instance:null}}}function rt(e,t){let s=e;for(let n of t)if(!s.childNodes||(s=s.childNodes[n],!s))return null;return s}function D(e,t){return t[et]=e,t}var le=null,ts=new Set,qn=new WeakMap;function Y(e){if(typeof e!="object"||e===null||e.__isReactive)return e;let t=new Map;return qn.set(e,t),new Proxy(e,{get(n,r){if(r==="__isReactive")return!0;if(r==="__target")return n;le&&(t.has(r)||t.set(r,new Set),t.get(r).add(le),le.deps.add(t.get(r)));let a=n[r];return typeof a=="object"&&a!==null&&!a.__isReactive?(n[r]=Y(a),n[r]):a},set(n,r,a){let i=Array.isArray(n),l=i?n.length:0,c=n[r];if(typeof a=="object"&&a!==null&&(a=Y(a)),n[r]=a,c!==a&&t.has(r)){let u=t.get(r);for(let p of u)at(p)}if(i&&r!=="length"&&n.length!==l&&t.has("length")){let u=t.get("length");for(let p of u)at(p)}return!0},deleteProperty(n,r){if(r in n&&(delete n[r],t.has(r))){let a=t.get(r);for(let i of a)at(i)}return!0}})}function lt(e,t={}){let s={fn:e,deps:new Set,active:!0,immediate:t.immediate!==!1};return ts.add(s),s.immediate&&ss(s),()=>{s.active=!1,ts.delete(s),ns(s)}}function ss(e){if(!e.active)return;ns(e);let t=le;le=e;try{e.fn()}finally{le=t}}function ns(e){for(let t of e.deps)t.delete(e);e.deps.clear()}var ot=new Set,it=!1;function at(e){e.active&&(ot.add(e),it||(it=!0,queueMicrotask(Mn)))}function Mn(){let e=[...ot];ot.clear(),it=!1;for(let t of e)ss(t)}var jn=new Map,z=class extends HTMLElement{static tag=null;static shadow=!1;static properties={};static autoRegister=!0;#e={};#t=null;#o=null;#a=!1;#s=!1;#r=null;constructor(){super(),this.constructor.shadow?this.#o=this.attachShadow({mode:"open"}):this.#o=this,this.#n()}#n(){let t=this.constructor.properties;for(let[s,n]of Object.entries(t)){let r=typeof n=="function"?{type:n}:n;r.default!==void 0?this.#e[s]=typeof r.default=="function"?r.default():r.default:this.#e[s]=void 0,Object.defineProperty(this,s,{get:()=>this.#e[s],set:a=>{let i=this.#e[s],l=this.#l(a,r.type);i!==l&&(this.#e[s]=l,this.#u())},enumerable:!0,configurable:!0})}}#l(t,s){if(t==null||!s)return t;switch(s){case String:return String(t);case Number:return Number(t);case Boolean:return!!t;case Array:return Array.isArray(t)?t:[t];case Object:return typeof t=="object"?t:{value:t};default:return t}}get renderRoot(){return this.#o}get routeData(){return this.#r}set routeData(t){this.#r=t,this.#u()}connectedCallback(){this.#a=!0,this.#c(),this.#t=lt(()=>{this.#d()})}disconnectedCallback(){this.#a=!1,this.#t&&(this.#t(),this.#t=null)}#c(){let t=this.constructor.properties;for(let[s,n]of Object.entries(t)){let r=typeof n=="function"?{type:n}:n,a=s.replace(/([A-Z])/g,"-$1").toLowerCase();if(this.hasAttribute(a)){let i=this.getAttribute(a);this[s]=this.#i(i,r.type)}}}#i(t,s){if(!s)return t;switch(s){case Boolean:return t!==null&&t!=="false";case Number:return Number(t);case Array:case Object:try{return JSON.parse(t)}catch{return t}default:return t}}static get observedAttributes(){let t=this.properties||{};return Object.keys(t).map(s=>s.replace(/([A-Z])/g,"-$1").toLowerCase())}attributeChangedCallback(t,s,n){if(s===n)return;let r=t.replace(/-([a-z])/g,(a,i)=>i.toUpperCase());if(r in this.constructor.properties){let a=this.constructor.properties[r],i=typeof a=="function"?{type:a}:a;this[r]=this.#i(n,i.type)}}#u(){!this.#a||this.#s||(this.#s=!0,queueMicrotask(()=>{this.#s=!1,this.#a&&this.#d()}))}#d(){let t=this.render();t&&st(t,this.#o),this.updated()}render(){return null}updated(){}requestUpdate(){this.#u()}static register(t){let s=t||this.tag;if(!s)throw new Error("Component must have a tag name");return customElements.get(s)||(customElements.define(s,this),jn.set(s,this)),this}};function Oe(e){return e.autoRegister&&e.tag&&e.register(),e}var V=class e{#e=[];#t=null;#o=null;#a=null;#s=!1;#r="";constructor(t={}){this.#e=t.routes||[],this.#s=t.hash||!1,this.#r=t.base||"",e.instance=this}start(){window.addEventListener("popstate",this.#n),this.#s&&window.addEventListener("hashchange",this.#n);let t=document.querySelector("router-outlet");return t&&this.setOutlet(t),this.#n(),this}stop(){window.removeEventListener("popstate",this.#n),this.#s&&window.removeEventListener("hashchange",this.#n)}setOutlet(t){this.#t=t,this.#n()}get currentPath(){if(this.#s)return window.location.hash.slice(1)||"/";let t=window.location.pathname;return this.#r&&t.startsWith(this.#r)&&(t=t.slice(this.#r.length)),t=t.replace(/\/index\.html$/,"/").replace(/\/$/,"")||"/",t}navigate(t,s={}){let n=this.#s?`#${t}`:`${this.#r}${t}`;s.replace?window.history.replaceState(null,"",n):window.history.pushState(null,"",n),this.#n()}#n=async()=>{let t=this.currentPath,s=this.#l(t);if(!s){console.warn(`No route matched for path: ${t}`);return}let{route:n,params:r}=s;this.#o={...n,params:r},await this.#i(n,r)};#l(t){for(let s of this.#e){let n=this.#c(s.path,t);if(n!==null)return{route:s,params:n}}return null}#c(t,s){let n=[],r=t.replace(/\//g,"\\/").replace(/:([^/]+)/g,(c,u)=>(n.push(u),"([^/]+)")).replace(/\*/g,".*"),a=new RegExp(`^${r}$`),i=s.match(a);if(!i)return null;let l={};return n.forEach((c,u)=>{l[c]=decodeURIComponent(i[u+1])}),l}async#i(t,s){if(!this.#t)return;let n={loading:!0,data:null,error:null,params:s},r=this.#a;if(!r||r.tagName.toLowerCase()!==t.component?(r=document.createElement(t.component),this.#a=r,r.routeData={...n},this.#t.innerHTML="",this.#t.appendChild(r)):r.routeData={...n},t.loader){try{let a=await t.loader(s);n.loading=!1,n.data=a}catch(a){n.loading=!1,n.error=a}r.routeData={...n}}else n.loading=!1,r.routeData={...n}}addRoute(t){this.#e.push(t)}removeRoute(t){this.#e=this.#e.filter(s=>s.path!==t)}get routes(){return[...this.#e]}get useHash(){return this.#s}};V.instance=null;var ce=class extends z{static tag="router-outlet";connectedCallback(){super.connectedCallback(),V.instance&&V.instance.setOutlet(this)}render(){return null}};Oe(ce);var ue=class extends z{static tag="router-link";static shadow=!0;static properties={to:{type:String},replace:{type:Boolean,default:!1}};#e=t=>{t.preventDefault(),V.instance&&this.to&&V.instance.navigate(this.to,{replace:this.replace})};get href(){return this.to?V.instance&&V.instance.useHash?`#${this.to}`:this.to:"#"}render(){return h`
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
    `}};Oe(ue);function ct(e){return new V(e).start()}function ut(e,t){V.instance?V.instance.navigate(e,t):console.warn("No router instance found")}var On="stockroom-local-device";var Le=["lots","sales","watchlist","quotes","histories","settings"],ke;async function as(){let[e,t,s,n,r,a]=await Promise.all([de("lots"),de("sales"),de("watchlist"),de("quotes"),de("histories"),de("settings")]);return{lots:e.sort((i,l)=>String(l.purchasedAt??"").localeCompare(String(i.purchasedAt??""))),sales:t.sort((i,l)=>String(l.soldAt??"").localeCompare(String(i.soldAt??""))),watchlist:s.sort((i,l)=>String(i.symbol??"").localeCompare(String(l.symbol??""))),quotes:Object.fromEntries(n.map(i=>[i.symbol,i])),histories:Object.fromEntries(r.map(i=>[i.symbol,i])),settings:Object.fromEntries(a.map(i=>[i.key,i.value]))}}async function os(e){await Se("lots",e)}async function is(e){await pt("lots",e)}async function ls(e){await Se("sales",e)}async function cs(e){await pt("sales",e)}async function us(e){await Se("watchlist",e)}async function ds(e){await pt("watchlist",e)}async function hs(e){await Se("quotes",e)}async function ht(e,t){await Se("settings",{key:e,value:t})}async function ps(e){let t=await Ae();await new Promise((s,n)=>{let r=t.transaction(Le,"readwrite");r.oncomplete=()=>s(),r.onerror=()=>n(r.error),r.onabort=()=>n(r.error);for(let a of Le)r.objectStore(a).clear();for(let a of dt(e.lots))r.objectStore("lots").put(a);for(let a of dt(e.sales))r.objectStore("sales").put(a);for(let a of dt(e.watchlist))r.objectStore("watchlist").put(a);for(let a of rs(e.quotes))r.objectStore("quotes").put(a);for(let a of rs(e.histories))r.objectStore("histories").put(a);for(let[a,i]of Object.entries(e.settings??{}))r.objectStore("settings").put({key:a,value:i})})}async function fs(){let e=await Ae();await new Promise((t,s)=>{let n=e.transaction(Le,"readwrite");n.oncomplete=()=>t(),n.onerror=()=>s(n.error),n.onabort=()=>s(n.error);for(let r of Le)n.objectStore(r).clear()})}async function de(e){let t=await Ae();return await new Promise((s,n)=>{let a=t.transaction(e,"readonly").objectStore(e).getAll();a.onsuccess=()=>s(a.result??[]),a.onerror=()=>n(a.error)})}async function Se(e,t){let s=await Ae();await new Promise((n,r)=>{let a=s.transaction(e,"readwrite");a.oncomplete=()=>n(),a.onerror=()=>r(a.error),a.onabort=()=>r(a.error),a.objectStore(e).put(t)})}async function pt(e,t){let s=await Ae();await new Promise((n,r)=>{let a=s.transaction(e,"readwrite");a.oncomplete=()=>n(),a.onerror=()=>r(a.error),a.onabort=()=>r(a.error),a.objectStore(e).delete(t)})}function Ae(){return ke||(ke=new Promise((e,t)=>{let s=indexedDB.open(On,2);s.onerror=()=>{ke=void 0,t(s.error)},s.onblocked=()=>{console.warn("Stockroom: databasen uppgraderas men en annan flik h\xE5ller den \xF6ppen.")},s.onsuccess=()=>{let n=s.result;n.onversionchange=()=>{n.close(),ke=void 0},e(n)},s.onupgradeneeded=()=>{let n=s.result;if(!n.objectStoreNames.contains("lots")){let r=n.createObjectStore("lots",{keyPath:"id"});r.createIndex("symbol","symbol",{unique:!1}),r.createIndex("purchasedAt","purchasedAt",{unique:!1})}if(!n.objectStoreNames.contains("sales")){let r=n.createObjectStore("sales",{keyPath:"id"});r.createIndex("symbol","symbol",{unique:!1}),r.createIndex("soldAt","soldAt",{unique:!1})}n.objectStoreNames.contains("watchlist")||n.createObjectStore("watchlist",{keyPath:"symbol"}),n.objectStoreNames.contains("quotes")||n.createObjectStore("quotes",{keyPath:"symbol"}),n.objectStoreNames.contains("histories")||n.createObjectStore("histories",{keyPath:"symbol"}),n.objectStoreNames.contains("settings")||n.createObjectStore("settings",{keyPath:"key"})}})),ke}function dt(e){return Array.isArray(e)?e:[]}function rs(e){return Array.isArray(e)?e:Object.values(e??{})}var Re={"app.metaDescription":"En lokal aktieportf\xF6lj byggd med Deno och BedrockJS.","app.promoLead":"Vill du ha en b\xE4ttre budgetapp?","app.promoLink":"Testa Sambokoll","app.home":"Till \xF6versikten","app.subtitle":"portf\xF6lj p\xE5 enheten","app.loading":"Laddar lokal portf\xF6lj...","nav.overview":"\xD6versikt","nav.holdings":"Innehav","nav.transactions":"Transaktioner","nav.search":"S\xF6k","nav.settings":"Inst\xE4llningar","language.label":"Spr\xE5k","language.menu":"V\xE4lj spr\xE5k","language.loadFailed":"Kunde inte ladda {language}. F\xF6rs\xF6k igen.","currency.label":"Valuta","currency.display":"Visningsvaluta","currency.showIn":"Visa portf\xF6ljen i {currency}","refresh.idle":"Uppdatera","refresh.busy":"Uppdaterar","refresh.never":"ej uppdaterad","common.close":"St\xE4ng","common.cancel":"Avbryt","common.delete":"Ta bort","common.today":"{percent} idag","common.avg":"snitt {price}","common.inclFees":"inkl. avgifter","common.noSales":"inga f\xF6rs\xE4ljningar","common.waitingForPrice":"v\xE4ntar p\xE5 kurs","action.sell":"S\xE4lj","action.sellHolding":"S\xE4lj innehav","trade.buy":"K\xF6p","trade.sell":"S\xE4lj","trade.sharesAt":"{shares} \xE0 {price}","units.shares":{one:"{count} st",other:"{count} st"},"count.buys":{one:"{count} k\xF6p",other:"{count} k\xF6p"},"count.sales":{one:"{count} f\xF6rs\xE4ljning",other:"{count} f\xF6rs\xE4ljningar"},"count.holdings":{one:"{count} innehav",other:"{count} innehav"},"count.skipped":{one:"{count} ogiltig post hoppades \xF6ver",other:"{count} ogiltiga poster hoppades \xF6ver"},"label.quantity":"Antal","label.date":"Datum","label.note":"Anteckning","label.price":"Kurs","label.priceNow":"Kurs nu","label.holding":"Innehav","label.averageCost":"Snittkurs","label.inclFeesIn":"inkl. avgifter, i {base}","label.realized":"Realiserat","label.unrealized":"Orealiserat","label.cost":"Kostnad","label.proceeds":"Erh\xE5llet","form.symbol":"Aktiesymbol","form.searching":"S\xF6ker...","form.pricePerShare":"Pris per aktie","form.fetch":"H\xE4mta","form.fees":"Avgifter ({currency})","form.fxRate":"V\xE4xelkurs \xB7 {base} per {currency}","form.symbolFirst":"Ange en aktiesymbol f\xF6rst.","form.invalidFxRate":"Ange v\xE4xelkursen ({base} per {currency}).","dashboard.portfolioValue":"Portf\xF6ljv\xE4rde","dashboard.unrealizedDelta":"{amount} \xB7 {percent} orealiserat","dashboard.dayChange":"Dagens r\xF6relse","dashboard.noSalesYet":"inga f\xF6rs\xE4ljningar \xE4nnu","dashboard.costBasis":"Anskaffningsv\xE4rde","dashboard.totalReturn":"Totalt resultat","dashboard.totalReturnNote":"realiserat + orealiserat \xB7 {updated}","dashboard.holdingsTitle":"Innehav","dashboard.holdingsIntro":"\xD6ppna positioner sorterade efter marknadsv\xE4rde. S\xE4lj hela eller delar av ett innehav direkt fr\xE5n raden.","dashboard.noHoldings":"Inga \xF6ppna innehav \xE4nnu.","dashboard.holdingsEmpty":"L\xE4gg till ditt f\xF6rsta k\xF6p f\xF6r att b\xF6rja f\xF6lja resultatet.","dashboard.addTitle":"L\xE4gg till k\xF6p","dashboard.addIntro":"Registrera symbol, antal och pris i aff\xE4rens valuta. V\xE4xelkursen p\xE5 k\xF6pdagen h\xE4mtas automatiskt.","dashboard.allocationTitle":"F\xF6rdelning","dashboard.allocationIntro":"Aktuell vikt baserad p\xE5 marknadsv\xE4rde.","dashboard.allocationEmpty":"F\xF6rdelningen visas efter minst ett sparat k\xF6p.","dashboard.moversTitle":"Utveckling","dashboard.moversIntro":"B\xE4sta och svagaste orealiserade avkastning.","dashboard.best":"B\xE4st","dashboard.worst":"Svagast","dashboard.moversEmpty":"Utveckling visas n\xE4r kurserna har laddats.","dashboard.realizedTitle":"Realiserat per innehav","dashboard.realizedIntro":"Resultat fr\xE5n f\xF6rs\xE4ljningar enligt genomsnittsmetoden.","dashboard.allTransactions":"Alla transaktioner","dashboard.realizedEmpty":"H\xE4r samlas resultatet n\xE4r du s\xE4ljer hela eller delar av ett innehav.","lot.invalidInput":"Ange en aktiesymbol och ett positivt antal aktier.","lot.invalidPrice":"Ange k\xF6ppriset per aktie i {currency}.","lot.saved":"Sparade {shares} {symbol} \xE0 {price}.","lot.savedConverted":"Sparade {shares} {symbol} \xE0 {price} ({converted}).","lot.notePlaceholder":"M\xE4klare, tes, konto","lot.busy":"H\xE4mtar","lot.submit":"Spara k\xF6p","lot.total":"Totalt {amount}","sell.title":"S\xE4lj {symbol}","sell.intro":"Registrera en hel eller delvis f\xF6rs\xE4ljning. Resultatet r\xE4knas i {base} med genomsnittsmetoden.","sell.noHoldings":"Du har inga \xF6ppna innehav att s\xE4lja \xE4nnu.","sell.emptyHint":"Registrera ett k\xF6p f\xF6rst, sedan kan du s\xE4lja hela eller delar av innehavet h\xE4r.","sell.chooseHolding":"V\xE4lj ett innehav att s\xE4lja.","sell.invalidQuantity":"Ange hur m\xE5nga aktier du s\xE5lde.","sell.invalidDate":"Ange ett giltigt f\xF6rs\xE4ljningsdatum.","sell.onlyAvailable":{one:"Du hade bara {count} aktie i {symbol} tillg\xE4nglig {date}.",other:"Du hade bara {count} aktier i {symbol} tillg\xE4ngliga {date}."},"sell.noneAvailable":"Du hade inga aktier i {symbol} att s\xE4lja {date}.","sell.invalidPrice":"Ange f\xF6rs\xE4ljningspriset per aktie i {currency}.","sell.negativeFees":"Avgifter kan inte vara negativa.","sell.notice":"S\xE5lde {shares} {symbol} f\xF6r {amount}. Realiserat resultat {gain} ({percent}).","sell.quantity":"Antal att s\xE4lja","sell.available":"Tillg\xE4ngligt {shares}","sell.availableOn":"Tillg\xE4ngligt {shares} den {date}","sell.nothingAvailable":"Inget tillg\xE4ngligt att s\xE4lja","sell.nothingAvailableOn":"Inget tillg\xE4ngligt den {date}","sell.quickPicks":"Snabbval","sell.all":"Allt","sell.notePlaceholder":"M\xE4klare, anledning, konto","sell.netProceeds":"Erh\xE5llet netto","sell.afterFees":"efter {amount} i avgifter","sell.proceedsFormula":"pris \xD7 antal \u2212 avgifter","sell.costBasis":"Anskaffning","sell.costFormula":"{shares} \xD7 {price} snitt","sell.averageMethod":"genomsnittsmetoden","sell.realizedResult":"Realiserat resultat","sell.enterQuantityPrice":"fyll i antal och pris","sell.remaining":"Kvar efter\xE5t","sell.positionCloses":"positionen avslutas","sell.unchanged":"of\xF6r\xE4ndrat","sell.maxQuantity":"Du kan s\xE4lja h\xF6gst {shares}.","sell.saving":"Sparar","sell.submitCount":{one:"S\xE4lj {count} aktie",other:"S\xE4lj {count} aktier"},"range.1mo":"1M","range.3mo":"3M","range.6mo":"6M","range.1y":"1\xC5","range.2y":"2\xC5","range.5y":"5\xC5","holdings.title":"Innehav","holdings.intro":"V\xE4lj ett innehav f\xF6r att se kursen med dina k\xF6p och f\xF6rs\xE4ljningar.","holdings.filter":"Filtrera p\xE5 symbol eller namn","holdings.scope":"Urval","holdings.scopeOpen":"\xD6ppna","holdings.scopeClosed":"Avslutade","holdings.noMatch":"Inget innehav matchar filtret.","holdings.empty":"L\xE4gg till ett k\xF6p p\xE5 \xF6versikten f\xF6r att se det h\xE4r.","holdings.choose":"V\xE4lj ett innehav i listan.","holdings.listedIn":"noterad i {currency}","holdings.closedPosition":"Avslutad position","holdings.watched":"Bevakad","holdings.noOpenPosition":"ingen \xF6ppen position","holdings.closedResult":"avslutad \xB7 {amount}","holdings.range":"Tidsintervall","holdings.tradesTitle":"Aff\xE4rer i {symbol}","holdings.tradesIntro":"Kursen sedan varje aff\xE4r \u2013 stigande kurs efter k\xF6p och fallande efter s\xE4lj \xE4r bra tajming.","holdings.noTrades":"Inga aff\xE4rer registrerade f\xF6r det h\xE4r innehavet.","filter.all":"Alla","chart.label":"{symbol} kursdiagram med k\xF6p och f\xF6rs\xE4ljningar","chart.legendClose":"St\xE4ngningskurs ({currency})","chart.loadFailed":"Kunde inte h\xE4mta kurshistorik: {error}","chart.loading":"H\xE4mtar kurshistorik...","chart.noData":"Ingen kurshistorik tillg\xE4nglig f\xF6r intervallet.","chart.duringPeriod":"under perioden","chart.high":"h\xF6gst {price}","chart.low":"l\xE4gst {price}","chart.outside":{one:"{count} aff\xE4r ligger f\xF6re intervallet, v\xE4lj ett l\xE4ngre",other:"{count} aff\xE4rer ligger f\xF6re intervallet, v\xE4lj ett l\xE4ngre"},"chart.updating":"uppdaterar...","chart.buyAt":"K\xF6p {shares} \xE0 {price}","chart.sellAt":"S\xE4lj {shares} \xE0 {price}","chart.converted":"(omr\xE4knat)","timing.unchanged":"of\xF6r\xE4ndrad kurs sedan aff\xE4ren","timing.risenSinceBuy":"kursen har stigit sedan k\xF6pet","timing.fallenSinceBuy":"kursen har fallit sedan k\xF6pet","timing.goodSell":"bra tajming \u2013 kursen har fallit sedan","timing.risenSinceSell":"kursen har stigit sedan f\xF6rs\xE4ljningen","timing.outsideChart":"utanf\xF6r diagrammet","timing.priceSince":"Kurs sedan aff\xE4ren","position.trend":"{symbol} pristrend","position.price":"Pris","position.value":"V\xE4rde","position.realizedAmount":"{amount} realiserat","position.result":"Resultat","transactions.title":"Transaktioner","transactions.intro":"K\xF6p och f\xF6rs\xE4ljningar sparas lokalt i IndexedDB, i aff\xE4rens valuta med v\xE4xelkursen p\xE5 aff\xE4rsdagen. Resultatet r\xE4knas i {base} mot snittkursen vid tillf\xE4llet (genomsnittsmetoden).","transactions.invested":"Investerat","transactions.soldFor":"S\xE5lt f\xF6r","transactions.type":"Typ","transactions.symbolFilter":"Filtrera p\xE5 symbol","transactions.allSymbols":"Alla symboler","transactions.noMatch":"Inga transaktioner matchar filtret.","transactions.empty":"Inga transaktioner har sparats. L\xE4gg till ett k\xF6p p\xE5 \xF6versikten.","transactions.fee":"avgift {amount}","transactions.priceSinceBuy":"Kurs sedan k\xF6p","transactions.now":"nu {price}","research.title":"S\xF6k","research.intro":"S\xF6k Yahoo Finance-symboler och l\xE4gg till dem i din lokala bevakningslista.","research.placeholder":"S\xF6k bolag eller aktiesymbol","research.search":"S\xF6k","research.searching":"S\xF6ker","research.noResults":"Inga matchande tickers hittades.","research.watch":"Bevaka","research.watching":"{symbol} bevakas nu lokalt.","research.watchedTitle":"Bevakade symboler","research.watchedIntro":"Bevakningslista och innehav med lokalt cachade kursbilder.","research.watchedEmpty":"S\xF6k och bevaka en symbol, eller spara ett k\xF6p.","watch.added":"{symbol} bevakas p\xE5 den h\xE4r enheten.","watch.closed":"Avslutad","watch.stop":"Sluta bevaka","watch.chart":"{symbol} diagram","watch.last":"Senast","watch.change":"R\xF6relse","watch.updated":"Uppdaterad","watch.waiting":"V\xE4ntar","realized.sold":{one:"{count} s\xE5ld",other:"{count} s\xE5lda"},"realized.remaining":{one:"{count} kvar",other:"{count} kvar"},"realized.closed":"positionen avslutad","settings.localTitle":"Lokal data","settings.localIntro":"K\xF6p, f\xF6rs\xE4ljningar och bevakningar stannar i den h\xE4r webbl\xE4sarens IndexedDB.","settings.export":"Exportera JSON","settings.import":"Importera JSON","settings.persist":"Best\xE4ndig lagring","settings.clear":"Rensa lokal data","settings.imported":"Importerade {buys} och {sales}.","settings.importedSkipped":"Importerade {buys} och {sales} \xB7 {skipped}.","settings.confirmClear":"Ta bort all lokal Stockroom-data fr\xE5n den h\xE4r webbl\xE4saren?","settings.cleared":"Lokal data rensad.","settings.persistUnavailable":"Best\xE4ndig webbl\xE4sarlagring \xE4r inte tillg\xE4nglig h\xE4r.","settings.persistGranted":"Webbl\xE4saren beviljade best\xE4ndig lagring.","settings.persistDenied":"Webbl\xE4saren beviljade inte best\xE4ndig lagring.","settings.storageTitle":"Lagring","settings.storageIntro":"Antalen nedan \xE4r lokala poster, inte serverposter.","settings.currencyTitle":"Valuta","settings.currencyIntro":"Aff\xE4rer bokf\xF6rs i {base} med v\xE4xelkursen p\xE5 aff\xE4rsdagen. Visningsvalutan r\xE4knar om hela portf\xF6ljen med aktuell kurs.","settings.ratesHint":"V\xE4xelkurser h\xE4mtas fr\xE5n Yahoo Finance n\xE4r de beh\xF6vs.","stats.buys":{one:"k\xF6p",other:"k\xF6p"},"stats.sales":{one:"f\xF6rs\xE4ljning",other:"f\xF6rs\xE4ljningar"},"stats.watched":{one:"bevakad symbol",other:"bevakade symboler"},"stats.quotes":{one:"kursbild",other:"kursbilder"},"stats.histories":{one:"kurshistorik synkad fr\xE5n servern",other:"kurshistoriker synkade fr\xE5n servern"},"lookup.close":"St\xE4ngningskurs {date} f\xF6r {symbol}: {price}","lookup.latest":"Senaste kurs f\xF6r {symbol}: {price}","lookup.currentRate":"(aktuell kurs)","confirm.deleteBuy":"Ta bort k\xF6pet av {shares} {symbol} ({date})?","confirm.deleteSale":"Ta bort f\xF6rs\xE4ljningen av {shares} {symbol} ({date})? Aktierna r\xE4knas d\xE5 som \xE4gda igen.","import.invalid":"Importfilen \xE4r inte giltig JSON.","import.noBuys":"Importfilen saknar k\xF6p.","import.badSales":"Importfilens f\xF6rs\xE4ljningar har fel format.","import.noWatchlist":"Importfilen saknar bevakningslista.","errors.symbolMissing":"Aktiesymbol saknas","errors.noQuote":"Ingen kurs hittades f\xF6r {symbol}","errors.fxRate":"Kunde inte h\xE4mta v\xE4xelkurs f\xF6r {currencies} till {base}.","errors.requestFailed":"F\xF6rfr\xE5gan misslyckades med {status}","errors.timeout":"F\xF6rfr\xE5gan om marknadsdata tog f\xF6r l\xE5ng tid","errors.historyFailed":"Kurshistorik f\xF6r {symbol} kunde inte h\xE4mtas ({status})","server.serverError":"Ov\xE4ntat serverfel","server.methodNotAllowed":"Metoden st\xF6ds inte","server.notFound":"Hittades inte","server.readOnly":"Kurshistoriken kan bara l\xE4sas","server.symbolMissing":"Symbol saknas","server.rateLimited":"F\xF6r m\xE5nga f\xF6rfr\xE5gningar, f\xF6rs\xF6k igen om en stund.","server.noMarketData":"Hittade ingen marknadsdata f\xF6r {symbol}","server.upstreamTimeout":"Marknadsdata svarade inte i tid","server.upstreamUnreachable":"Marknadsdata kunde inte n\xE5s","server.upstreamUnavailable":"Marknadsdata \xE4r inte tillg\xE4nglig just nu"};var Be=[{code:"bg",name:"\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438",locale:"bg-BG"},{code:"es",name:"Espa\xF1ol",locale:"es-ES"},{code:"cs",name:"\u010Ce\u0161tina",locale:"cs-CZ"},{code:"da",name:"Dansk",locale:"da-DK"},{code:"de",name:"Deutsch",locale:"de-DE"},{code:"et",name:"Eesti",locale:"et-EE"},{code:"el",name:"\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC",locale:"el-GR"},{code:"en",name:"English",locale:"en-IE"},{code:"fr",name:"Fran\xE7ais",locale:"fr-FR"},{code:"ga",name:"Gaeilge",locale:"ga-IE",fallbackLocale:"en-IE"},{code:"hr",name:"Hrvatski",locale:"hr-HR"},{code:"it",name:"Italiano",locale:"it-IT"},{code:"lv",name:"Latvie\u0161u",locale:"lv-LV"},{code:"lt",name:"Lietuvi\u0173",locale:"lt-LT"},{code:"hu",name:"Magyar",locale:"hu-HU"},{code:"mt",name:"Malti",locale:"mt-MT",fallbackLocale:"en-MT"},{code:"nl",name:"Nederlands",locale:"nl-NL"},{code:"pl",name:"Polski",locale:"pl-PL"},{code:"pt",name:"Portugu\xEAs",locale:"pt-PT"},{code:"ro",name:"Rom\xE2n\u0103",locale:"ro-RO"},{code:"sk",name:"Sloven\u010Dina",locale:"sk-SK"},{code:"sl",name:"Sloven\u0161\u010Dina",locale:"sl-SI"},{code:"fi",name:"Suomi",locale:"fi-FI"},{code:"sv",name:"Svenska",locale:"sv-SE"}],J="sv";var Ne="SEK",b=Ne,Z=1e-6,Ue=["SEK","EUR","USD","NOK","DKK","GBP","CHF","CAD","JPY"],he=["SEK","EUR","USD"],re="sv-SE";function ms(e){re=e}function pe(){return re}function fe(e){let t=Number(e?.fxRate);return Number.isFinite(t)&&t>0?t:1}function Ce(e){return N(e?.currency)||b}function _e(e){return(Number(e?.price)||0)*fe(e)}function Fe(e,t){let s=Math.max(0,Number(e?.quantity)||0),n=Math.max(0,Number(e?.price)||0),r=Math.max(0,Number(e?.fees)||0),a=s*n;return(t==="buy"?a+r:a-r)*fe(e)}function G(e){let t=Number(e);return Number.isFinite(t)?Math.round(t*1e6)/1e6:0}function Te(e,t){let s=[...e.map(k=>({type:"buy",date:k.purchasedAt??"",order:0,createdAt:k.createdAt??"",record:k})),...t.map(k=>({type:"sell",date:k.soldAt??"",order:1,createdAt:k.createdAt??"",record:k}))].sort(Bn),n=0,r=0,a=0,i=0,l=0,c=0,u=0,p=new Map,x=[];for(let k of s){let v=k.record,y=Math.max(0,Number(v.quantity)||0),I=fe(v),O=Math.max(0,Number(v.price)||0)*I,M=Math.max(0,Number(v.fees)||0)*I;if(k.type==="buy")n+=y,r+=y*O+M,u+=y*O+M;else{let A=n,E=n>Z?r/n:0,g=Math.min(y,Math.max(0,n)),f=E*g,S=y*O-M,w=S-f;n-=y,r=Math.max(0,r-f),a+=w,i+=f,l+=y,c+=S,p.set(v.id,{sharesBefore:A,averageCost:E,costBasis:f,netProceeds:S,gain:w,gainPercent:f>0?w/f*100:0,sharesAfter:Math.max(0,n)})}Math.abs(n)<Z?(n=0,r=0):n<0&&(r=0),x.push({event:k,shares:n})}let m=Math.max(0,n);return{shares:m,cost:r,averageCost:m>0?r/m:0,realized:a,realizedCost:i,realizedPercent:i>0?a/i*100:0,soldShares:l,proceeds:c,boughtCost:u,buyCount:e.length,sellCount:t.length,saleResults:p,timeline:x}}function gs(e,t,s){let n=bs(s),r=Te(e,[...t,n]),a=!1,i=1/0;for(let l of r.timeline)l.event.record===n&&(a=!0),a&&(i=Math.min(i,l.shares));return i===1/0?0:G(Math.max(0,i))}function ys(e,t,s){let n={...bs(s.soldAt),...s,id:ft},r=Te(e,[...t,n]);return{...r.saleResults.get(ft),remainingShares:r.shares,remainingCost:r.cost}}var ft="__stockroom_probe__";function bs(e){return{id:ft,quantity:0,price:0,fees:0,soldAt:e||"",createdAt:"~~~~"}}function Bn(e,t){return e.date!==t.date?e.date<t.date?-1:1:e.order!==t.order?e.order-t.order:e.createdAt!==t.createdAt?e.createdAt<t.createdAt?-1:1:0}function vs(e,t,s,n,r={},a=[]){let i=new Set(t.map(l=>l.symbol));for(let l of e)i.add(l.symbol);for(let l of a)i.add(l.symbol);return[...i].map(l=>{let c=e.filter(w=>w.symbol===l).sort((w,F)=>F.purchasedAt.localeCompare(w.purchasedAt)),u=a.filter(w=>w.symbol===l).sort((w,F)=>F.soldAt.localeCompare(w.soldAt)),p=Te(c,u),x=s[l],m=gt(x?.currency,r),k=zn(Number.isFinite(x?.price)?x.price:0,x?.currency,r),v=p.shares,y=p.cost,I=v*k,O=I-y,M=y>0?O/y*100:0,A=Number.isFinite(x?.previousClose)?x.previousClose*m:k,E=v*(k-A),g=A>0?(k-A)/A*100:0,f=v>Z,S=c.length>0||u.length>0;return{symbol:l,name:x?.name??l,quote:x,lots:c,sales:u,ledger:p,history:Un(n[l],x?.currency,r),sourceCurrency:x?.currency??Ne,conversionRate:m,shares:v,cost:y,averageCost:p.averageCost,price:k,marketValue:I,gain:O,gainPercent:M,dayChange:E,dayChangePercent:g,realized:p.realized,realizedCost:p.realizedCost,realizedPercent:p.realizedPercent,soldShares:p.soldShares,proceeds:p.proceeds,sellCount:p.sellCount,buyCount:p.buyCount,isHolding:f,hasTrades:S,isClosed:S&&!f}}).sort((l,c)=>c.marketValue!==l.marketValue?c.marketValue-l.marketValue:l.symbol.localeCompare(c.symbol))}function $s(e){let t=e.filter(m=>m.isHolding),s=e.filter(m=>m.sellCount>0),n=ne(t.map(m=>m.marketValue)),r=ne(t.map(m=>m.cost)),a=n-r,i=ne(t.map(m=>m.dayChange)),l=ne(e.map(m=>m.realized)),c=ne(e.map(m=>m.realizedCost)),u=ne(e.map(m=>m.proceeds)),p=t.toSorted((m,k)=>k.gainPercent-m.gainPercent)[0],x=t.toSorted((m,k)=>m.gainPercent-k.gainPercent)[0];return{holdingsCount:t.length,trackedCount:e.length,closedCount:e.filter(m=>m.isClosed).length,totalValue:n,totalCost:r,totalGain:a,totalGainPercent:r>0?a/r*100:0,dayChange:i,dayChangePercent:n-i>0?i/(n-i)*100:0,cashBasis:r,realized:l,realizedCost:c,realizedPercent:c>0?l/c*100:0,proceeds:u,salesCount:ne(e.map(m=>m.sellCount)),tradedCount:s.length,totalReturn:a+l,best:p,worst:x}}function P(e,t=Ne){let s=Number.isFinite(e)?e:0;try{return new Intl.NumberFormat(re,{style:"currency",currency:t,maximumFractionDigits:Math.abs(s)>=1e3?0:2}).format(s)}catch{return`${s.toFixed(2)} ${t}`}}function mt(e,t=Ne){let s=Number.isFinite(e)?e:0,n=P(Math.abs(s),t);return s>.004?`+${n}`:s<-.004?`\u2212${n}`:n}function zn(e,t,s={}){return(Number.isFinite(e)?e:0)*gt(t,s)}function me(e,t,s={}){let n=Number.isFinite(e)?e:0,r=N(t);if(!r||r===b)return n;let a=s[r];return!Number.isFinite(a)||a<=0?null:n/a}function gt(e,t={}){let s=N(e);return!s||s===Ne?1:Number.isFinite(t[s])?t[s]:1}function ge(e,t=2){let s=Number.isFinite(e)?e:0;return new Intl.NumberFormat(re,{minimumFractionDigits:t,maximumFractionDigits:t}).format(s)}function ee(e){let t=Number.isFinite(e)?e:0;return new Intl.NumberFormat(re,{minimumFractionDigits:0,maximumFractionDigits:4}).format(t)}function q(e){let t=Number.isFinite(e)?e:0;return`${new Intl.NumberFormat(re,{signDisplay:"exceptZero",minimumFractionDigits:2,maximumFractionDigits:2}).format(t)}%`}function W(e){if(!e)return"\u2013";let t=new Date(`${e}T00:00:00`);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat(re,{day:"numeric",month:"short",year:"numeric"}).format(t)}function R(e){return e>1e-4?"positive":e<-1e-4?"negative":"neutral"}function yt(e,t=180,s=56){let n=e.map(c=>c.close).filter(c=>Number.isFinite(c)&&c>0);if(n.length<2)return"";let r=Math.min(...n),i=Math.max(...n)-r||1,l=t/(n.length-1);return n.map((c,u)=>{let p=u*l,x=s-(c-r)/i*s;return`${u===0?"M":"L"} ${p.toFixed(2)} ${x.toFixed(2)}`}).join(" ")}function ne(e){return e.reduce((t,s)=>t+(Number(s)||0),0)}function Un(e,t,s){if(!e?.points)return e;let n=gt(t,s);return n===1?e:{...e,points:e.points.map(r=>({...r,open:ze(r.open,n),high:ze(r.high,n),low:ze(r.low,n),close:ze(r.close,n)}))}}function ze(e,t){return Number.isFinite(e)?e*t:e}function N(e){return String(e??"").trim().toUpperCase()}function Ie(e){let t=String(e??"").trim(),n={GBp:["GBP",100],GBX:["GBP",100],ZAc:["ZAR",100],ILA:["ILS",100]}[t];return n?{currency:n[0],divisor:n[1]}:{currency:N(t),divisor:1}}var xs="stockroom.language",_n=2500,Hn=1e4,Vn=/\{(\w+)\}/g,oe=new Map(Be.map(e=>[e.code,e])),vt=new Map([[J,Re]]),bt=new Map,ae=Y({language:J,ready:!1}),ws=J,ks=new Intl.PluralRules(oe.get(J).locale),Ss=new Intl.NumberFormat(oe.get(J).locale);function As(){let e=Jn()??Yn()??J;if(Ts(J),e===J)return ae.ready=!0,Promise.resolve();let t=setTimeout(()=>ae.ready=!0,_n);return Fs(e).catch(s=>{console.warn(`Stockroom: kunde inte ladda spr\xE5ket ${e}.`,s)}).finally(()=>{clearTimeout(t),ae.ready=!0})}function Rs(e){return oe.has(e)?Fs(e,{remember:!0}):Promise.reject(new Error(`Unknown language: ${e}`))}function Ns(){return ae.language}function Cs(){return ae.ready}function $t(e){return oe.get(e)?.name??e}function o(e,t){let s=vt.get(ae.language)??Re,n=Object.hasOwn(s,e)?s[e]:Re[e];if(n===void 0)return e;if(typeof n=="object"&&n!==null){let r=Number(t?.count);n=n[ks.select(Number.isFinite(r)?r:0)]??n.other??""}return t?Wn(n,t):n}function ie(e,t=""){let s=`server.${e?.code}`;if(typeof e?.code=="string"&&Object.hasOwn(Re,s))return o(s,{symbol:String(e.symbol??"")});let n=e?.error??e?.message;return typeof n=="string"&&n?n:t}async function Fs(e,{remember:t=!1}={}){ws=e,await Kn(e),ws===e&&(t&&Zn(e),Ts(e))}function Ts(e){let t=oe.get(e),s=Qn(t);ms(s),Ss=new Intl.NumberFormat(s,{maximumFractionDigits:4}),ks=new Intl.PluralRules(t.locale,{maximumFractionDigits:4}),ae.language=e,document.documentElement.lang=e,document.querySelector('meta[name="description"]')?.setAttribute("content",o("app.metaDescription"))}function Wn(e,t){return e.replace(Vn,(s,n)=>{if(!Object.hasOwn(t,n))return s;let r=t[n];return typeof r=="number"?Ss.format(r):String(r??"")})}function Kn(e){if(vt.has(e))return Promise.resolve();let t=bt.get(e);return t||(t=Gn(e).then(s=>{vt.set(e,s)}).finally(()=>bt.delete(e)),bt.set(e,t)),t}async function Gn(e){let t=await fetch(`/locales/${e}.json`,{headers:{Accept:"application/json"},signal:AbortSignal.timeout?.(Hn)});if(!t.ok)throw new Error(`Catalog ${e} answered ${t.status}`);let s=await t.json();if(!s||typeof s!="object"||Array.isArray(s))throw new Error(`Catalog ${e} is not an object`);return s}function Qn(e){let s=[Is().find(n=>n.includes("-")&&Ds(n)===e.code),e.locale,e.fallbackLocale];for(let n of s)if(n)try{if(Intl.DateTimeFormat.supportedLocalesOf([n]).length)return n}catch{}return e.locale}function Yn(){for(let e of Is()){let t=Ds(e);if(oe.has(t))return t}return null}function Is(){return(navigator.languages?.length?navigator.languages:[navigator.language]).filter(t=>typeof t=="string"&&t.length>0)}function Ds(e){return e.trim().toLowerCase().split(/[-_]/)[0]}function Jn(){try{let e=localStorage.getItem(xs);return oe.has(e)?e:null}catch{return null}}function Zn(e){try{localStorage.setItem(xs,e)}catch{}}var Xn=12e3;function j(e){return String(e??"").trim().toUpperCase().replace(/\s+/g,"")}async function He(e){let t=[...new Set(e.map(j).filter(Boolean))];return t.length===0?{quotes:[],errors:[]}:await Es(`/api/quotes?symbols=${encodeURIComponent(t.join(","))}`)}async function wt(e){let t=e.trim();return t?(await Es(`/api/search?q=${encodeURIComponent(t)}`)).results??[]:[]}async function Es(e){let t=new AbortController,s=setTimeout(()=>t.abort(),Xn);try{let n=await fetch(e,{headers:{Accept:"application/json"},signal:t.signal}),r=await n.text();if(!n.ok)throw new Error(ie(xt(r),o("errors.requestFailed",{status:String(n.status)})));return JSON.parse(r)}catch(n){throw n.name==="AbortError"?new Error(o("errors.timeout")):n}finally{clearTimeout(s)}}function xt(e){try{return JSON.parse(e)}catch{return null}}var er="/sync";function kt(e={}){let t=(e.baseUrl||er).replace(/\/$/,""),s=e.fetch||globalThis.fetch.bind(globalThis),n=e.EventSource||(typeof EventSource<"u"?EventSource:null),r=new Map,a=new Map,i=!1,l=!1,c=null,u=!1,p=500;function x(A,E){r.set(A,E),i&&k(A,0)}async function m(A){if(!n||!i||a.has(A))return;let E=r.get(A);if(!E)return;let g=await E.getCursor();if(!i||!r.has(A)||a.has(A))return;let f=`${t}/${encodeURIComponent(A)}/stream?since=${g}`,S=new n(f);a.set(A,S),S.addEventListener("change",async w=>{try{let F=JSON.parse(w.data);await E.onServerRow(F.row,F.cursor)}catch(F){console.warn("[bedrockjs/sync] bad SSE payload",F)}}),S.onerror=()=>{}}function k(A,E){setTimeout(()=>{m(A).catch(g=>{console.warn(`[bedrockjs/sync] stream setup failed for "${A}"`,g),i&&r.has(A)&&!a.has(A)&&k(A,p)})},E)}function v(){if(!i){i=!0;for(let A of r.keys())k(A,0);typeof globalThis.addEventListener=="function"&&globalThis.addEventListener("online",()=>I(0)),I(0)}}function y(){i=!1;for(let A of a.values())A.close();a.clear()}function I(A=p){l||(l=!0,setTimeout(()=>{l=!1,O().catch(()=>{p=Math.min(p*2,3e4),I()})},A))}async function O(){return c?(u=!0,c):(c=(async()=>{try{do u=!1,await M();while(u)}finally{c=null}})(),c)}async function M(){if(typeof navigator<"u"&&navigator.onLine===!1)return;let A=!1;for(let[E,g]of r.entries()){let f=await g.getOutbox();if(!f||f.length===0)continue;let S=f.map(H=>H.op),w=await s(`${t}/${encodeURIComponent(E)}/ops`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({protocol:1,ops:S})});if(!w.ok)throw new Error(`sync POST failed: ${w.status}`);let F=await w.json(),_=[];for(let H=0;H<f.length;H++){let $=F.results[H];$&&($.status==="applied"||$.status==="duplicate"?(_.push(f[H].seq),$.row&&$.cursor!=null&&await g.onServerRow($.row,$.cursor)):$.status==="rejected"&&(_.push(f[H].seq),g.onRejected?.($.opId,$.error||"rejected")))}_.length&&await g.ackOutbox(_),A=!0}A&&(p=500)}return{registerModel:x,start:v,stop:y,drain:O,scheduleDrain:I,get baseUrl(){return t}}}var te="__outbox__",ye="__cursor__",qs=new Map;function St(e,t){let s=qs.get(e);if(!s)return s={models:new Set(t),db:null,promise:Promise.resolve(null)},s.promise=Ve(e,s,void 0),qs.set(e,s),s.promise;for(let n of t)s.models.add(n);return s.promise=s.promise.catch(()=>null).then(n=>Os(n,e,s)),s.promise}function Ve(e,t,s){return tr(e,[...t.models],s).then(n=>(t.db=n,n.onversionchange=()=>{Ls(t,n)},n))}function tr(e,t,s){return new Promise((n,r)=>{let a=s===void 0?indexedDB.open(e):indexedDB.open(e,s);a.onupgradeneeded=()=>{let i=a.result;i.objectStoreNames.contains(te)||i.createObjectStore(te,{keyPath:"seq",autoIncrement:!0}),i.objectStoreNames.contains(ye)||i.createObjectStore(ye);for(let l of t)i.objectStoreNames.contains(l)||i.createObjectStore(l,{keyPath:"id"})},a.onsuccess=()=>n(a.result),a.onerror=()=>r(a.error),a.onblocked=()=>{console.warn(`[bedrockjs/sync] IndexedDB upgrade for "${e}" is blocked by another open tab or connection`)}})}async function Os(e,t,s){if((!e||s.db!==e)&&(e=await Ve(t,s,void 0)),[...s.models].filter(i=>!e.objectStoreNames.contains(i)).length===0)return e;let a=e.version+1;Ls(s,e);try{return await Ve(t,s,a)}catch(i){if(i&&typeof i=="object"&&i.name==="VersionError"){let l=await Ve(t,s,void 0);return Os(l,t,s)}throw i}}function Ls(e,t){e.db===t&&(e.db=null),t.onversionchange=null,t.close()}function We(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Bs(e){return new Promise((t,s)=>{e.oncomplete=()=>t(void 0),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Ke(e,t,s,n,r){let a=e.transaction([t,te],"readwrite"),i=a.objectStore(t);s?i.put(s):n&&i.delete(n);let l=a.objectStore(te).add({op:r});return Promise.all([We(l),Bs(a)]).then(([c])=>c)}function zs(e,t,s,n){return new Promise((r,a)=>{let i=e.transaction([t,ye],"readwrite"),l=i.objectStore(t),c=i.objectStore(ye),u=l.get(s.id),p=c.get(t),x=null,m=0,k=!1,v=!1,y=s;function I(){!k||!v||(y=sr(x,s),l.put(y),c.put(Math.max(m,n),t))}u.onsuccess=()=>{x=u.result??null,k=!0,I()},p.onsuccess=()=>{let O=p.result;m=typeof O=="number"?O:0,v=!0,I()},i.oncomplete=()=>r(y),i.onerror=()=>a(i.error),i.onabort=()=>a(i.error||new Error("transaction aborted"))})}async function Us(e,t){let s=e.transaction(ye,"readonly"),n=await We(s.objectStore(ye).get(t));return typeof n=="number"?n:0}async function _s(e,t){let s=e.transaction(t,"readonly");return await We(s.objectStore(t).getAll())}async function Hs(e){let t=e.transaction(te,"readonly");return await We(t.objectStore(te).getAll())}async function Vs(e,t){let s=e.transaction(te,"readwrite"),n=s.objectStore(te);for(let r of t)n.delete(r);await Bs(s)}function sr(e,t){if(!e)return t;let s=js(t);if((e.deletedAt??0)>s)return nr(e,t);if(t.deletedAt){let r=js(e);return!e.deletedAt&&r>t.deletedAt?Ms(e,t):t}return Ms(e,t)}function Ms(e,t){let s={...t.data??{}},n={...t.fieldTs??{}};for(let[r,a]of Object.entries(e.data??{})){let i=e.fieldTs?.[r]??0,l=n[r]??0;i>l&&(s[r]=a,n[r]=i)}return{id:t.id,rev:Math.max(e.rev??0,t.rev??0),serverTs:Math.max(e.serverTs??0,t.serverTs??0),fieldTs:n,data:s}}function nr(e,t){return{...e,rev:Math.max(e.rev??0,t.rev??0),serverTs:Math.max(e.serverTs??0,t.serverTs??0)}}function js(e){let t=e.deletedAt??0;for(let s of Object.values(e.fieldTs??{}))s>t&&(t=s);return t}function Ge(){let e=globalThis.crypto;return e&&typeof e.randomUUID=="function"?e.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}var At=0;function Qe(){let e=Date.now();return At=Math.max(e,At+1),At}function Rt(e,t,s){let n=s.dbName||"bedrockjs-sync",r=Y([]),a=new Map,i=new Map;function l(g){return{id:g.id,rev:g.rev,...g.data}}function c(g){if(g.deletedAt){if(i.set(g.id,g),!a.get(g.id))return;a.delete(g.id);let F=r.findIndex(_=>_.id===g.id);F>=0&&r.splice(F,1);return}i.set(g.id,g);let f=l(g),S=a.get(g.id);if(S){for(let w of Object.keys(f))S[w]!==f[w]&&(S[w]=f[w]);for(let w of Object.keys(S))w in f||delete S[w]}else r.push(f),a.set(g.id,r[r.length-1])}async function u(g){try{return await g(await St(n,[e]))}catch(f){if(!rr(f))throw f;return await g(await St(n,[e]))}}let p=(async()=>{let g=await u(f=>_s(f,e));for(let f of g)c(f)})();function x(g,f){let S=Qe(),w={};for(let F of Object.keys(f))w[F]=S;return{id:g,rev:0,serverTs:S,fieldTs:w,data:f}}async function m(g){if(!g||typeof g.id!="string")throw new Error(`${e}.create: 'id' (string) is required`);await p;let f=Ws(t,g),S=x(g.id,f),w={opId:Ge(),type:"create",model:e,id:g.id,data:f,clientTs:S.serverTs};return c(S),await u(F=>Ke(F,e,S,null,w)),s.client.scheduleDrain(0),l(S)}async function k(g,f){await p;let S=a.get(g);if(!S)throw new Error(`${e}.update: no record ${g}`);let w=i.get(g),F=Ws(t,f),_=Qe(),H={...w?.data??Ks(S),...F},$={...w?.fieldTs??{}};for(let $e of Object.keys(F))$[$e]=_;let L={id:g,rev:w?.rev??S.rev??0,serverTs:_,fieldTs:$,data:H};c(L);let ve={opId:Ge(),type:"update",model:e,id:g,patch:F,clientTs:_};return await u($e=>Ke($e,e,L,null,ve)),s.client.scheduleDrain(0),l(L)}async function v(g){await p;let f=a.get(g);if(!f)return;let S=i.get(g),w=Qe(),F={id:g,rev:S?.rev??f.rev??0,serverTs:w,fieldTs:S?.fieldTs??{},deletedAt:w,data:S?.data??Ks(f)};c(F);let _={opId:Ge(),type:"delete",model:e,id:g,clientTs:w};await u(H=>Ke(H,e,F,null,_)),s.client.scheduleDrain(0)}function y(g){let f=a.get(g);if(f)return f;r.length}function I(){return r}function O(g){return r.filter(g)}let M=new Set;function A(g){return M.add(g),g(r),()=>M.delete(g)}function E(){for(let g of M)g(r)}return s.client.registerModel(e,{onServerRow:async(g,f)=>{let S=await u(w=>zs(w,e,g,f));c(S),E()},getCursor:async()=>await u(g=>Us(g,e)),getOutbox:async()=>(await u(f=>Hs(f))).filter(f=>f.op.model===e),ackOutbox:async g=>{await u(f=>Vs(f,g))}}),{name:e,schema:t,ready:p,create:m,update:k,delete:v,get:y,all:I,where:O,subscribe:A}}function Ws(e,t){let s={};for(let[n,r]of Object.entries(e.fields))if(!(n==="id"||n==="rev")&&n in t){let a=t[n];r==="datetime"&&a instanceof Date&&(a=a.toISOString()),s[n]=a}return s}function Ks(e){let{id:t,rev:s,...n}=e;return n}function rr(e){let t=e&&typeof e=="object"?e.name:"";return t==="InvalidStateError"||t==="NotFoundError"}var Ys="history",ar="stockroom-sync",or=5*6e4,De=kt({baseUrl:"/sync"}),Js=new Map,ir=De.registerModel.bind(De);De.registerModel=(e,t)=>{Js.set(e,t),ir(e,t)};var Nt=Rt(Ys,{fields:{id:"string",rev:"number",symbol:"string",name:"string",currency:"string",interval:"string",from:"string",to:"string",count:"number",points:"string",updatedAt:"datetime",source:"string"}},{client:De,dbName:ar});typeof window<"u"&&De.start();var Ye=new Map;function Zs(e,t={}){let s=j(e);if(!s)return Promise.reject(new Error(o("server.symbolMissing")));let n=Ye.get(s),r=t.maxAgeMs??or;if(n&&!t.refresh&&Date.now()-n.at<r)return n.promise;let a=(async()=>{let i=new URLSearchParams({symbol:s});t.refresh&&i.set("refresh","1");let l=await fetch(`/api/history?${i}`,{headers:{Accept:"application/json"}}),c=await l.text();if(!l.ok)throw new Error(ie(xt(c),o("errors.historyFailed",{symbol:s,status:String(l.status)})));let u=JSON.parse(c);return u.row&&await Js.get(Ys)?.onServerRow(u.row,0),u})();return Ye.set(s,{at:Date.now(),promise:a}),a.catch(()=>{Ye.get(s)?.promise===a&&Ye.delete(s)}),a}var Gs=new Map;function Ct(e){let t=j(e),s=Nt.get(t);if(!s)return null;let n=s.points;if(typeof n!="string")return null;let r=Gs.get(t);return(!r||r.source!==n)&&(r={source:n,points:lr(n)},Gs.set(t,r)),{symbol:s.symbol??t,name:s.name??"",currency:s.currency??"",interval:s.interval??"1d",updatedAt:s.updatedAt??"",source:s.source??"",points:r.points}}var Qs={"1mo":31,"3mo":92,"6mo":183,"1y":366,"2y":731,"5y":1/0};function Xs(e,t){let s=Qs[t]??Qs["6mo"];if(!Number.isFinite(s))return e;let n=new Date(Date.now()-s*864e5).toISOString().slice(0,10);return e.filter(r=>r.date>=n)}function en(e,t,s=1){let n=Number(t?.price);if(!Number.isFinite(n)||n<=0||e.length===0)return e;let r=t.marketTime?String(t.marketTime).slice(0,10):new Date().toISOString().slice(0,10),a=e.at(-1);if(!a||r<a.date)return e;let i={date:r,close:n*s};return r===a.date?[...e.slice(0,-1),i]:[...e,i]}function lr(e){try{let t=JSON.parse(e);return Array.isArray(t)?t.map(s=>Array.isArray(s)?{date:String(s[0]),close:Number(s[1])}:{date:String(s?.date??""),close:Number(s?.close)}).filter(s=>s.date&&Number.isFinite(s.close)&&s.close>0):[]}catch{return[]}}var d=Y({ready:!1,lots:[],sales:[],watchlist:[],quotes:{},fxRates:{},settings:{refreshMinutes:5,lastRefresh:"",displayCurrency:b},refreshing:!1,error:"",notice:"",searchResults:[],searchLoading:!1,sellRequest:null,historyStatus:{}});As();ue.register();ce.register();var Et=class extends z{static tag="app-root";refresh=()=>{gn({forceHistory:!1})};render(){if(!Cs())return h`
        <div class="app-shell"></div>
      `;let t=X();return h`
      <div class="app-shell">
        <aside class="promo-strip">
          <span>${o("app.promoLead")}</span>
          <a
            href="https://sambokoll.se"
            target="_blank"
            rel="noopener"
          >${o("app.promoLink")} →</a>
        </aside>

        <header class="topbar">
          <router-link class="brand-link" to="/" title="${o("app.home")}">
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
                <span class="brand-subtitle">${o("app.subtitle")}</span>
              </span>
            </span>
          </router-link>

          <nav class="nav-tabs">
            <router-link to="/">${o("nav.overview")}</router-link>
            <router-link to="/holdings">${o("nav.holdings")}</router-link>
            <router-link to="/transactions">${o("nav.transactions")}</router-link>
            <router-link to="/research">${o("nav.search")}</router-link>
            <router-link to="/settings">${o("nav.settings")}</router-link>
          </nav>

          <div class="topbar-actions">
            <div
              class="segmented"
              role="group"
              aria-label="${o("currency.display")}"
            >
              ${he.map(s=>D(s,h`
                    <button
                      type="button"
                      class="${`segment ${t===s?"active":""}`}"
                      aria-pressed="${t===s}"
                      title="${o("currency.showIn",{currency:s})}"
                      on-click="${()=>un(s)}"
                    >
                      ${s}
                    </button>
                  `))}
            </div>
            <button
              class="refresh-button"
              on-click="${this.refresh}"
              disabled="${d.refreshing}"
            >
              ${d.refreshing?o("refresh.busy"):o("refresh.idle")}
            </button>
            <language-picker></language-picker>
          </div>
        </header>

        ${d.error?h`
            <div class="status-banner error">
              <span>${d.error}</span>
              <button on-click="${()=>d.error=""}">${o("common.close")}</button>
            </div>
          `:""} ${d.notice?h`
            <div class="status-banner notice">
              <span>${d.notice}</span>
              <button on-click="${()=>d.notice=""}">${o("common.close")}</button>
            </div>
          `:""}

        <main class="workspace">
          ${d.ready?h`
              <router-outlet></router-outlet>
            `:h`
              <section class="loading-panel">${o("app.loading")}</section>
            `}
        </main>

        ${d.sellRequest?h`
            <sell-dialog></sell-dialog>
          `:""}
      </div>
    `}},Pt=class extends z{static tag="language-picker";static properties={open:{type:Boolean,default:!1}};#e=!1;disconnectedCallback(){this.stopListening(),super.disconnectedCallback()}toggle=()=>{this.open?this.close():this.show()};show(){this.open=!0,this.#e=!0,document.addEventListener("pointerdown",this.handleOutside,!0)}close(t=!1){this.open=!1,this.stopListening(),t&&this.querySelector(".language-button")?.focus()}stopListening(){document.removeEventListener("pointerdown",this.handleOutside,!0)}handleOutside=t=>{this.contains(t.target)||this.close()};handleButtonKeydown=t=>{(t.key==="ArrowDown"||t.key==="ArrowUp")&&(t.preventDefault(),this.open||this.show())};handleMenuKeydown=t=>{let s=[...this.querySelectorAll(".language-option")],n=s.indexOf(document.activeElement),r=s.length-1,a={ArrowDown:n>=r?0:n+1,ArrowUp:n<=0?r:n-1,Home:0,End:r}[t.key];a!==void 0?(t.preventDefault(),s[a].focus()):(t.key==="Escape"||t.key==="Tab")&&(t.preventDefault(),this.close(!0))};choose=async t=>{this.close(!0);try{await Rs(t)}catch{d.error=o("language.loadFailed",{language:$t(t)})}};updated(){if(!this.open||!this.#e)return;this.#e=!1,(this.querySelector(".language-option.active")??this.querySelector(".language-option"))?.focus()}render(){let t=Ns(),s=`${o("language.label")}: ${$t(t)}`;return h`
      <button
        type="button"
        class="language-button"
        aria-haspopup="menu"
        aria-expanded="${String(this.open)}"
        aria-label="${s}"
        title="${s}"
        on-click="${this.toggle}"
        on-keydown="${this.handleButtonKeydown}"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path
            d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z"
          ></path>
        </svg>
        <span>${t.toUpperCase()}</span>
      </button>
      ${this.open?h`
          <div
            class="language-menu"
            role="menu"
            aria-label="${o("language.menu")}"
            on-keydown="${this.handleMenuKeydown}"
          >
            ${Be.map(n=>D(n.code,h`
                  <button
                    type="button"
                    role="menuitemradio"
                    class="${`language-option ${n.code===t?"active":""}`}"
                    aria-checked="${String(n.code===t)}"
                    lang="${n.code}"
                    on-click="${()=>this.choose(n.code)}"
                  >
                    <span>${n.name}</span>
                    <small>${n.code.toUpperCase()}</small>
                  </button>
                `))}
          </div>
        `:""}
    `}},qt=class extends z{static tag="dashboard-page";render(){let t=se(),s=$s(t),n=t.filter(a=>a.isHolding),r=t.filter(a=>a.sellCount>0).sort((a,i)=>i.realized-a.realized);return h`
      <section class="dashboard-grid">
        <div class="summary-band">
          <article class="metric primary-metric">
            <span class="metric-label">${o("dashboard.portfolioValue")}</span>
            <strong>${C(s.totalValue)}</strong>
            <span class="${`metric-delta ${R(s.totalGain)}`}">
              ${o("dashboard.unrealizedDelta",{amount:B(s.totalGain),percent:q(s.totalGainPercent)})}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">${o("dashboard.dayChange")}</span>
            <strong class="${R(s.dayChange)}">
              ${B(s.dayChange)}
            </strong>
            <span class="${`metric-delta ${R(s.dayChange)}`}">
              ${q(s.dayChangePercent)}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">${o("label.realized")}</span>
            <strong class="${R(s.realized)}">
              ${B(s.realized)}
            </strong>
            <span class="${`metric-delta ${s.salesCount?R(s.realized):"neutral"}`}">
              ${s.salesCount?`${q(s.realizedPercent)} \xB7 ${o("count.sales",{count:s.salesCount})}`:o("dashboard.noSalesYet")}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">${o("dashboard.costBasis")}</span>
            <strong>${C(s.totalCost)}</strong>
            <span class="metric-delta neutral">${o("count.holdings",{count:s.holdingsCount})}</span>
          </article>
          <article class="metric">
            <span class="metric-label">${o("dashboard.totalReturn")}</span>
            <strong class="${R(s.totalReturn)}">
              ${B(s.totalReturn)}
            </strong>
            <span class="metric-delta neutral">${o("dashboard.totalReturnNote",{updated:Er()})}</span>
          </article>
        </div>

        <section class="panel holdings-panel">
          <div class="panel-heading">
            <div>
              <h2>${o("dashboard.holdingsTitle")}</h2>
              <p>${n.length?o("dashboard.holdingsIntro"):o("dashboard.noHoldings")}</p>
            </div>
            ${n.length?h`
                <button
                  type="button"
                  class="sell-button"
                  on-click="${()=>Pe()}"
                >
                  ${o("action.sellHolding")}
                </button>
              `:""}
          </div>
          ${n.length?h`
              <position-table .positions="${n}"></position-table>
            `:K(o("dashboard.holdingsEmpty"))}
        </section>

        <section class="panel add-panel">
          <div class="panel-heading">
            <div>
              <h1>${o("dashboard.addTitle")}</h1>
              <p>${o("dashboard.addIntro")}</p>
            </div>
          </div>
          <add-lot-form></add-lot-form>
        </section>

        <section class="panel allocation-panel">
          <div class="panel-heading">
            <div>
              <h2>${o("dashboard.allocationTitle")}</h2>
              <p>${o("dashboard.allocationIntro")}</p>
            </div>
          </div>
          ${n.length?Or(n,s.totalValue):K(o("dashboard.allocationEmpty"))}
        </section>

        <section class="panel movers-panel">
          <div class="panel-heading">
            <div>
              <h2>${o("dashboard.moversTitle")}</h2>
              <p>${o("dashboard.moversIntro")}</p>
            </div>
          </div>
          ${s.best?h`
              <div class="mover-grid">
                ${nn(o("dashboard.best"),s.best)} ${nn(o("dashboard.worst"),s.worst)}
              </div>
            `:K(o("dashboard.moversEmpty"))}
        </section>

        <section class="panel realized-panel">
          <div class="panel-heading">
            <div>
              <h2>${o("dashboard.realizedTitle")}</h2>
              <p>${o("dashboard.realizedIntro")}</p>
            </div>
            ${r.length?h`
                <router-link class="panel-link" to="/transactions">${o("dashboard.allTransactions")}</router-link>
              `:""}
          </div>
          ${r.length?Lr(r):K(o("dashboard.realizedEmpty"))}
        </section>
      </section>
    `}},Mt=class extends z{static tag="add-lot-form";static properties={symbol:{type:String,default:""},quantity:{type:String,default:""},price:{type:String,default:""},currency:{type:String,default:b},fxRate:{type:String,default:"1"},fxRateDirty:{type:Boolean,default:!1},purchasedAt:{type:String,default:U},fees:{type:String,default:"0"},note:{type:String,default:""},message:{type:String,default:""},suggestions:{type:Array,default:()=>[]},lookupLoading:{type:Boolean,default:!1},suggestionOpen:{type:Boolean,default:!1},busy:{type:Boolean,default:!1}};searchTimer=null;lookupToken=0;submit=async t=>{t.preventDefault();let s=j(this.symbol),n=Number(this.quantity),r=Number(this.price),a=Number(this.fees||0),i=N(this.currency)||b,l=i===b?1:Number(this.fxRate);if(!s||!Number.isFinite(n)||n<=0){this.message=o("lot.invalidInput");return}if(!Number.isFinite(r)||r<=0){this.message=o("lot.invalidPrice",{currency:i});return}if(!Number.isFinite(l)||l<=0){this.message=o("form.invalidFxRate",{base:b,currency:i});return}this.busy=!0;try{await kr({symbol:s,quantity:n,price:r,currency:i,fxRate:l,purchasedAt:this.purchasedAt||U(),fees:Number.isFinite(a)&&a>0?a:0,note:this.note.trim()});let c={shares:ee(n),symbol:s,price:P(r,i)};this.message=i===b?o("lot.saved",c):o("lot.savedConverted",{...c,converted:C(r*l)}),this.symbol="",this.quantity="",this.price="",this.currency=b,this.fxRate="1",this.fxRateDirty=!1,this.fees="0",this.note="",this.purchasedAt=U(),this.suggestions=[],this.suggestionOpen=!1}catch(c){this.message=c.message}finally{this.busy=!1}};handleSymbolInput=t=>{this.symbol=t.target.value.toUpperCase(),this.queueTickerSearch(this.symbol)};queueTickerSearch(t){clearTimeout(this.searchTimer);let s=j(t);if(!s){this.suggestions=[],this.suggestionOpen=!1,this.lookupLoading=!1;return}this.searchTimer=setTimeout(()=>{this.runTickerSearch(s)},180)}async runTickerSearch(t){if(!this.symbolInputFocused())return;let s=++this.lookupToken;this.lookupLoading=!0,this.suggestionOpen=!0;try{let n=await wt(t);if(s!==this.lookupToken)return;this.suggestions=n.filter(r=>r.symbol).slice(0,7)}catch(n){if(s!==this.lookupToken)return;this.suggestions=[],this.message=n.message}finally{s===this.lookupToken&&(this.lookupLoading=!1)}}chooseTicker=async t=>{let s=j(t.symbol);s&&(clearTimeout(this.searchTimer),this.lookupToken+=1,this.symbol=s,this.suggestions=[],this.suggestionOpen=!1,this.lookupLoading=!1,await this.fillPrice())};closeSuggestions=()=>{clearTimeout(this.searchTimer),this.lookupToken+=1,this.lookupLoading=!1,setTimeout(()=>{this.suggestionOpen=!1},120)};symbolInputFocused(){let t=this.querySelector("input[role='combobox']");return!!t&&document.activeElement===t}fillPrice=async()=>{let t=j(this.symbol);if(!t){this.message=o("form.symbolFirst");return}this.busy=!0;try{let s=await dn(t,this.purchasedAt||U());this.currency=s.currency,this.price=Ht(s.price),this.fxRate=Ee(s.fxRate),this.fxRateDirty=!1,this.message=pn(t,s)}catch(s){this.message=s.message}finally{this.busy=!1}};changeCurrency=t=>{this.currency=N(t.target.value)||b,this.fxRateDirty=!1,this.refreshFxRate()};changeDate=t=>{this.purchasedAt=t.target.value,this.fxRateDirty||this.refreshFxRate()};async refreshFxRate(){if(this.currency===b){this.fxRate="1";return}try{let t=await Wt(this.currency,this.purchasedAt||U());if(this.fxRateDirty)return;this.fxRate=Ee(t.rate)}catch(t){this.message=t.message}}render(){let t=N(this.currency)||b,s=t!==b,n=Number(this.price),r=Number(this.quantity),a=s?Number(this.fxRate):1,i=Number(this.fees||0),l=Number.isFinite(n)&&Number.isFinite(r)&&Number.isFinite(a)&&n>0&&r>0&&a>0?(n*r+(Number.isFinite(i)?i:0))*a:null;return h`
      <form class="lot-form" novalidate on-submit="${this.submit}">
        <label class="ticker-field">
          <span>${o("form.symbol")}</span>
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
          ${this.suggestionOpen&&(this.lookupLoading||this.suggestions.length)?h`
              <div class="ticker-menu">
                ${this.lookupLoading?h`
                    <div class="ticker-menu-status">${o("form.searching")}</div>
                  `:h`
                    <div class="ticker-options">
                      ${this.suggestions.map(c=>D(c.symbol,h`
                            <button
                              type="button"
                              class="ticker-option"
                              on-mousedown="${u=>u.preventDefault()}"
                              on-click="${()=>this.chooseTicker(c)}"
                            >
                              <strong>${c.symbol}</strong>
                              <span>${c.name}</span>
                              <small>${[c.exchange,c.type].filter(Boolean).join(" / ")}</small>
                            </button>
                          `))}
                    </div>
                  `}
              </div>
            `:""}
        </label>

        <label>
          <span>${o("label.quantity")}</span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="12"
            .value="${this.quantity}"
            on-input="${c=>this.quantity=c.target.value}"
          />
        </label>

        <label>
          <span>${o("form.pricePerShare")}</span>
          <div class="input-action">
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              .value="${this.price}"
              on-input="${c=>this.price=c.target.value}"
            />
            ${Rn(t,this.changeCurrency)}
            <button type="button" on-click="${this.fillPrice}" disabled="${this.busy}">
              ${o("form.fetch")}
            </button>
          </div>
        </label>

        <label>
          <span>${o("label.date")}</span>
          <input
            type="date"
            max="${U()}"
            .value="${this.purchasedAt}"
            on-change="${this.changeDate}"
          />
        </label>

        <label>
          <span>${o("form.fees",{currency:t})}</span>
          <input
            type="number"
            min="0"
            step="any"
            .value="${this.fees}"
            on-input="${c=>this.fees=c.target.value}"
          />
        </label>

        ${s?h`
            <label>
              <span>${o("form.fxRate",{base:b,currency:t})}</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="10.50"
                .value="${this.fxRate}"
                on-input="${c=>{this.fxRate=c.target.value,this.fxRateDirty=!0}}"
              />
            </label>
          `:""}

        <label class="${s?"":"wide-field"}">
          <span>${o("label.note")}</span>
          <input
            placeholder="${o("lot.notePlaceholder")}"
            .value="${this.note}"
            on-input="${c=>this.note=c.target.value}"
          />
        </label>

        <div class="form-actions">
          <button class="primary-button" type="submit" disabled="${this.busy}">
            ${this.busy?o("lot.busy"):o("lot.submit")}
          </button>
          <p>
            ${this.message||(l!==null?`${o("lot.total",{amount:C(l)})}${s?` \xB7 ${P(n*r+(Number.isFinite(i)?i:0),t)} \xD7 ${ge(a,4)}`:""}`:"")}
          </p>
        </div>
      </form>
    `}},jt=class extends z{static tag="sell-dialog";static properties={symbol:{type:String,default:""},quantity:{type:String,default:""},price:{type:String,default:""},currency:{type:String,default:b},fxRate:{type:String,default:"1"},fxRateDirty:{type:Boolean,default:!1},soldAt:{type:String,default:U},fees:{type:String,default:"0"},note:{type:String,default:""},message:{type:String,default:""},busy:{type:Boolean,default:!1}};#e=!1;#t=!1;connectedCallback(){let t=se().filter(r=>r.isHolding),s=j(d.sellRequest?.symbol??""),n=t.some(r=>r.symbol===s)?s:t[0]?.symbol??"";n&&this.selectSymbol(n),super.connectedCallback()}selectSymbol(t){this.symbol=j(t),this.quantity="",this.message="",this.fxRateDirty=!1;let n=this.position()?.quote,r=N(n?.currency)||b;this.currency=r,this.price=n&&Number.isFinite(n.price)&&n.price>0?Ht(n.price):"",r===b?this.fxRate="1":Number.isFinite(d.fxRates[r])?this.fxRate=Ee(d.fxRates[r]):this.fxRate="",(!this.price||!this.fxRate)&&this.fetchPrice()}position(){return this.symbol?se().find(t=>t.symbol===this.symbol)??null:null}available(t=this.position()){return t?gs(t.lots,t.sales,this.soldAt||U()):0}fractionQuantity(t,s=this.available()){if(s<=0)return 0;if(t>=1)return s;let n=s*t;return G(Number.isInteger(s)?Math.floor(n):n)}setFraction=t=>{let s=this.fractionQuantity(t);this.quantity=s>0?String(s):"",this.message=""};fetchPrice=async()=>{if(this.symbol){this.busy=!0;try{let t=await dn(this.symbol,this.soldAt||U());this.currency=t.currency,this.price=Ht(t.price),this.fxRate=Ee(t.fxRate),this.fxRateDirty=!1,this.message=pn(this.symbol,t)}catch(t){this.message=t.message}finally{this.busy=!1}}};changeCurrency=t=>{this.currency=N(t.target.value)||b,this.fxRateDirty=!1,this.refreshFxRate()};changeDate=t=>{this.soldAt=t.target.value,this.message="",this.fxRateDirty||this.refreshFxRate()};async refreshFxRate(){if(this.currency===b){this.fxRate="1";return}try{let t=await Wt(this.currency,this.soldAt||U());if(this.fxRateDirty)return;this.fxRate=Ee(t.rate)}catch(t){this.message=t.message}}submit=async t=>{t.preventDefault();let s=this.position(),n=G(Number(this.quantity)),r=Number(this.price),a=Number(this.fees||0),i=this.soldAt||U(),l=N(this.currency)||b,c=l===b?1:Number(this.fxRate);if(!s){this.message=o("sell.chooseHolding");return}if(!Number.isFinite(n)||n<=0){this.message=o("sell.invalidQuantity");return}if(!/^\d{4}-\d{2}-\d{2}$/.test(i)){this.message=o("sell.invalidDate");return}let u=this.available(s);if(n>u+Z){this.message=u>0?o("sell.onlyAvailable",{count:u,symbol:s.symbol,date:W(i)}):o("sell.noneAvailable",{symbol:s.symbol,date:W(i)});return}if(!Number.isFinite(r)||r<=0){this.message=o("sell.invalidPrice",{currency:l});return}if(!Number.isFinite(c)||c<=0){this.message=o("form.invalidFxRate",{base:b,currency:l});return}if(!Number.isFinite(a)||a<0){this.message=o("sell.negativeFees");return}this.busy=!0;try{let{result:p}=await Ar({symbol:s.symbol,quantity:n,price:r,currency:l,fxRate:c,fees:a,soldAt:i,note:this.note.trim()});d.notice=o("sell.notice",{shares:ee(n),symbol:s.symbol,amount:C(p.netProceeds),gain:B(p.gain),percent:q(p.gainPercent)}),this.close()}catch(p){this.message=p.message,this.busy=!1}};close=()=>{this.#e=!0;let t=this.querySelector("dialog");t?.open&&t.close(),sn()};handleClose=()=>{this.#e=!0,sn()};handleBackdropClick=t=>{t.target===t.currentTarget&&this.close()};updated(){let t=this.querySelector("dialog");if(t&&!t.open&&!this.#e&&this.isConnected&&t.showModal(),An(this,"select.sell-symbol",this.symbol),!this.#t){let s=this.querySelector("input[name='quantity']");s&&(s.focus(),this.#t=!0)}}render(){let t=se(),s=t.filter(r=>r.isHolding),n=t.find(r=>r.symbol===this.symbol)??null;return h`
      <dialog
        class="sell-dialog"
        aria-labelledby="sell-dialog-title"
        on-close="${this.handleClose}"
        on-click="${this.handleBackdropClick}"
      >
        ${n?this.renderForm(n,s):this.renderEmpty()}
      </dialog>
    `}renderEmpty(){return h`
      <div class="sell-form">
        <div class="sell-head">
          <div>
            <h2 id="sell-dialog-title">${o("action.sellHolding")}</h2>
            <p>${o("sell.noHoldings")}</p>
          </div>
          <button
            type="button"
            class="icon-button"
            aria-label="${o("common.close")}"
            on-click="${this.close}"
          >
            ×
          </button>
        </div>
        ${K(o("sell.emptyHint"))}
      </div>
    `}renderForm(t,s){let n=this.soldAt||U(),r=this.available(t),a=Number(this.quantity),i=Number(this.price),l=Number(this.fees||0),c=N(this.currency)||b,u=c!==b,p=u?Number(this.fxRate):1,x=Number.isFinite(a)&&a>0&&a<=r+Z,m=Number.isFinite(i)&&i>0,k=Number.isFinite(p)&&p>0,v=x&&m&&k?ys(t.lots,t.sales,{quantity:G(a),price:i,currency:c,fxRate:p,fees:Number.isFinite(l)&&l>0?l:0,soldAt:n}):null,y=Number.isFinite(a)&&a>0&&a>r+Z,I=Number.isInteger(r)?1:1e-4,O=n===U(),M=t.quote,A=R(M?.changePercent??0),E=N(M?.currency)||b,g=M&&E!==X();return h`
      <form class="sell-form" novalidate on-submit="${this.submit}">
        <div class="sell-head">
          <div>
            <h2 id="sell-dialog-title">${o("sell.title",{symbol:t.symbol})}</h2>
            <p>
              ${t.name} · ${o("sell.intro",{base:b})}
            </p>
          </div>
          <button
            type="button"
            class="icon-button"
            aria-label="${o("common.close")}"
            on-click="${this.close}"
          >
            ×
          </button>
        </div>

        ${s.length>1?h`
            <label class="sell-symbol-field">
              <span>${o("label.holding")}</span>
              <select
                class="sell-symbol"
                on-change="${f=>this.selectSymbol(f.target.value)}"
              >
                ${s.map(f=>D(f.symbol,h`
                      <option value="${f.symbol}">${`${f.symbol} \xB7 ${Q(f.shares)} \xB7 ${C(f.marketValue)}`}</option>
                    `))}
              </select>
            </label>
          `:""}

        <div class="sell-facts">
          <div class="fact">
            <small>${o("label.holding")}</small>
            <strong>${Q(t.shares)}</strong>
            <span>${C(t.marketValue)}</span>
          </div>
          <div class="fact">
            <small>${o("label.averageCost")}</small>
            <strong>${C(t.averageCost)}</strong>
            <span>${o("label.inclFeesIn",{base:b})}</span>
          </div>
          <div class="fact">
            <small>${o("label.priceNow")}</small>
            <strong>${C(t.price)}</strong>
            <span class="${A}">${g?`${P(M.price,E)} \xB7 ${q(M?.changePercent??0)}`:Ze(M?.changePercent??0)}</span>
          </div>
          <div class="fact">
            <small>${o("label.unrealized")}</small>
            <strong class="${R(t.gain)}">${B(t.gain)}</strong>
            <span class="${R(t.gain)}">${q(t.gainPercent)}</span>
          </div>
        </div>

        <div class="sell-grid">
          <div class="quantity-field">
            <div class="field-heading">
              <span>${o("sell.quantity")}</span>
              <span class="${y?"negative":"muted"}">
                ${r>0?O?o("sell.available",{shares:Q(r)}):o("sell.availableOn",{shares:Q(r),date:W(n)}):O?o("sell.nothingAvailable"):o("sell.nothingAvailableOn",{date:W(n)})}
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
                on-input="${f=>{this.quantity=f.target.value,this.message=""}}"
              />
              <div
                class="chip-row"
                role="group"
                aria-label="${o("sell.quickPicks")}"
              >
                ${[.25,.5,.75,1].map(f=>{let S=this.fractionQuantity(f,r),w=S>0&&Math.abs(S-a)<Z;return D(f,h`
                      <button
                        type="button"
                        class="${`chip ${w?"active":""}`}"
                        disabled="${r<=0}"
                        on-click="${()=>this.setFraction(f)}"
                      >
                        ${f>=1?o("sell.all"):Pr(f)}
                      </button>
                    `)})}
              </div>
            </div>
            <input
              class="quantity-slider"
              type="range"
              aria-label="${o("sell.quantity")}"
              min="0"
              max="${r}"
              step="${I}"
              disabled="${r<=0}"
              .value="${Number.isFinite(a)&&a>0?String(Math.min(a,r)):"0"}"
              on-input="${f=>{this.quantity=f.target.value,this.message=""}}"
            />
          </div>

          <label>
            <span>${o("form.pricePerShare")}</span>
            <div class="input-action">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                .value="${this.price}"
                on-input="${f=>this.price=f.target.value}"
              />
              ${Rn(c,this.changeCurrency)}
              <button
                type="button"
                on-click="${this.fetchPrice}"
                disabled="${this.busy}"
              >
                ${o("form.fetch")}
              </button>
            </div>
          </label>

          <label>
            <span>${o("label.date")}</span>
            <input
              type="date"
              max="${U()}"
              .value="${this.soldAt}"
              on-change="${this.changeDate}"
            />
          </label>

          <label>
            <span>${o("form.fees",{currency:c})}</span>
            <input
              type="number"
              min="0"
              step="any"
              .value="${this.fees}"
              on-input="${f=>this.fees=f.target.value}"
            />
          </label>

          ${u?h`
              <label>
                <span>${o("form.fxRate",{base:b,currency:c})}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="10.50"
                  .value="${this.fxRate}"
                  on-input="${f=>{this.fxRate=f.target.value,this.fxRateDirty=!0}}"
                />
              </label>
            `:""}

          <label class="${u?"wide-field":""}">
            <span>${o("label.note")}</span>
            <input
              placeholder="${o("sell.notePlaceholder")}"
              .value="${this.note}"
              on-input="${f=>this.note=f.target.value}"
            />
          </label>
        </div>

        <div class="${`sell-preview ${v?R(v.gain):"idle"}`}">
          <div>
            <small>${o("sell.netProceeds")}</small>
            <strong>${v?C(v.netProceeds):"\u2013"}</strong>
            <span>${v?u?`${P(G(a)*i-(Number.isFinite(l)?l:0),c)} \xD7 ${ge(p,4)}`:l>0?o("sell.afterFees",{amount:C(l)}):o("sell.proceedsFormula"):o("sell.proceedsFormula")}</span>
          </div>
          <div>
            <small>${o("sell.costBasis")}</small>
            <strong>${v?C(v.costBasis):"\u2013"}</strong>
            <span>${v?o("sell.costFormula",{shares:ee(G(a)),price:C(v.averageCost)}):o("sell.averageMethod")}</span>
          </div>
          <div>
            <small>${o("sell.realizedResult")}</small>
            <strong class="${v?R(v.gain):""}">${v?B(v.gain):"\u2013"}</strong>
            <span class="${v?R(v.gain):""}">${v?q(v.gainPercent):o("sell.enterQuantityPrice")}</span>
          </div>
          <div>
            <small>${o("sell.remaining")}</small>
            <strong>${Q(v?v.remainingShares:t.shares)}</strong>
            <span>${v?v.remainingShares>Z?C(v.remainingShares*t.price):o("sell.positionCloses"):o("sell.unchanged")}</span>
          </div>
        </div>

        <div class="sell-actions">
          <p class="${`inline-message ${y?"negative":""}`}">
            ${this.message||(y?o("sell.maxQuantity",{shares:Q(r)}):"")}
          </p>
          <div class="button-row">
            <button type="button" on-click="${this.close}">${o("common.cancel")}</button>
            <button
              type="submit"
              class="sell-button"
              disabled="${this.busy||!x||!m||!k}"
            >
              ${this.busy?o("sell.saving"):x?o("sell.submitCount",{count:G(a)}):o("action.sell")}
            </button>
          </div>
        </div>
      </form>
    `}},cr=["1mo","3mo","6mo","1y","2y","5y"],T={width:760,height:320,left:62,right:18,top:18,bottom:30},Ot=class extends z{static tag="holdings-page";static properties={filter:{type:String,default:""},scope:{type:String,default:"holdings"},range:{type:String,default:"6mo"},hoverIndex:{type:Number,default:-1}};#e="";#t=null;select=t=>{this.hoverIndex=-1,ut(`/holdings/${encodeURIComponent(t)}`)};setRange=t=>{this.range=t,this.hoverIndex=-1};handleChartMove=t=>{let s=this.#t;if(!s)return;let n=t.currentTarget.ownerSVGElement??t.currentTarget;if(!n)return;let r=n.getBoundingClientRect();if(!r.width)return;let a=(t.clientX-r.left)/r.width*T.width,i=T.width-T.left-T.right,l=Math.min(1,Math.max(0,(a-T.left)/i));this.hoverIndex=Math.round(l*(s.points.length-1))};handleChartLeave=()=>{this.hoverIndex=-1};updated(){this.#e&&hr(this.#e,this.range)}selectedSymbol(t){let s=j(this.routeData?.params?.symbol??"");return s&&t.some(n=>n.symbol===s)?s:t.find(n=>n.isHolding)?.symbol??t.find(n=>n.hasTrades)?.symbol??t[0]?.symbol??""}render(){let t=se(),s=t.filter(u=>u.isHolding),n=t.filter(u=>u.isClosed),r=this.scope==="holdings"?s:this.scope==="closed"?n:t,a=this.filter.trim().toUpperCase(),i=r.filter(u=>!a||u.symbol.includes(a)||String(u.name??"").toUpperCase().includes(a)),l=this.selectedSymbol(t);this.#e=l;let c=t.find(u=>u.symbol===l)??null;return h`
      <section class="holdings-grid">
        <aside class="panel holdings-list-panel">
          <div class="panel-heading">
            <div>
              <h1>${o("holdings.title")}</h1>
              <p>${o("holdings.intro")}</p>
            </div>
          </div>
          <input
            class="filter-input"
            type="search"
            placeholder="${o("holdings.filter")}"
            .value="${this.filter}"
            on-input="${u=>this.filter=u.target.value}"
          />
          <div
            class="chip-row scope-chips"
            role="group"
            aria-label="${o("holdings.scope")}"
          >
            ${Ft(this,"holdings",`${o("holdings.scopeOpen")} \xB7 ${s.length}`)}
            ${Ft(this,"closed",`${o("holdings.scopeClosed")} \xB7 ${n.length}`)}
            ${Ft(this,"all",`${o("filter.all")} \xB7 ${t.length}`)}
          </div>
          ${i.length?h`
              <div class="holding-list">
                ${i.map(u=>D(u.symbol,ur(u,l,this.select)))}
              </div>
            `:K(t.length?o("holdings.noMatch"):o("holdings.empty"))}
        </aside>

        <section class="panel holding-detail">
          ${c?this.renderDetail(c):K(o("holdings.choose"))}
        </section>
      </section>
    `}renderDetail(t){let s=t.quote,n=N(s?.currency)||b,r=n!==X(),a=dr(t.symbol,this.range),i=pr(t,a.history,this.range);this.#t=i;let l=i&&this.hoverIndex>=0&&this.hoverIndex<i.points.length?this.hoverIndex:-1,c=on(t,n),u=i?.nativeAverage??ln(t,n);return h`
      <div class="detail-head">
        <div>
          <h2>${t.symbol}</h2>
          <p>
            ${[t.name,s?.exchange,o("holdings.listedIn",{currency:n})].filter(Boolean).join(" \xB7 ")}
          </p>
        </div>
        ${t.isHolding?h`
            <button
              type="button"
              class="sell-button"
              on-click="${()=>Pe(t.symbol)}"
            >
              ${o("sell.title",{symbol:t.symbol})}
            </button>
          `:t.isClosed?h`
            <span class="pill closed">${o("holdings.closedPosition")}</span>
          `:h`
            <span class="pill closed">${o("holdings.watched")}</span>
          `}
      </div>

      <div class="detail-stats">
        <div class="fact">
          <small>${o("label.price")}</small>
          <strong>${C(t.price)}</strong>
          <span class="${R(s?.changePercent??0)}">${r&&s?`${P(s.price,n)} \xB7 ${q(s?.changePercent??0)}`:Ze(s?.changePercent??0)}</span>
        </div>
        <div class="fact">
          <small>${o("label.holding")}</small>
          <strong>${Q(t.shares)}</strong>
          <span>${C(t.marketValue)}</span>
        </div>
        <div class="fact">
          <small>${o("label.averageCost")}</small>
          <strong>${t.isHolding?C(t.averageCost):"\u2013"}</strong>
          <span>${t.isHolding&&r&&u?`${P(u,n)} \xB7 ${o("common.inclFees")}`:o("common.inclFees")}</span>
        </div>
        <div class="fact">
          <small>${o("label.unrealized")}</small>
          <strong class="${R(t.gain)}">${B(t.gain)}</strong>
          <span class="${R(t.gain)}">${t.isHolding?q(t.gainPercent):o("holdings.noOpenPosition")}</span>
        </div>
        <div class="fact">
          <small>${o("label.realized")}</small>
          <strong class="${R(t.realized)}">${B(t.realized)}</strong>
          <span class="${t.sellCount?R(t.realized):"muted"}">${t.sellCount?`${q(t.realizedPercent)} \xB7 ${o("count.sales",{count:t.sellCount})}`:o("common.noSales")}</span>
        </div>
      </div>

      <div class="chart-toolbar">
        <div class="chip-row" role="group" aria-label="${o("holdings.range")}">
          ${cr.map(p=>D(p,h`
                <button
                  type="button"
                  class="${`chip ${this.range===p?"active":""}`}"
                  on-click="${()=>this.setRange(p)}"
                >
                  ${o(`range.${p}`)}
                </button>
              `))}
        </div>
        <div class="chart-legend">
          <span><i class="legend-buy"></i> ${o("trade.buy")}</span>
          <span><i class="legend-sell"></i> ${o("trade.sell")}</span>
          ${t.isHolding?h`
              <span><i class="legend-avg"></i> ${o("label.averageCost")}</span>
            `:""}
          <span><i class="legend-line"></i> ${o("chart.legendClose",{currency:n})}</span>
        </div>
      </div>

      ${i?fr(i,l,t,this.handleChartMove,this.handleChartLeave):a.status==="error"?K(o("chart.loadFailed",{error:a.error})):K(a.status==="loading"?o("chart.loading"):o("chart.noData"))}

      ${i?h`
          <p class="chart-caption">
            <span class="${i.tone}">${q(i.changePercent)}</span>
            ${[o("chart.duringPeriod"),o("chart.high",{price:P(i.high,i.currency)}),o("chart.low",{price:P(i.low,i.currency)}),i.outside?o("chart.outside",{count:i.outside}):"",a.status==="loading"?o("chart.updating"):""].filter(Boolean).join(" \xB7 ")}
          </p>
        `:""}

      <div class="detail-section-heading">
        <h3>${o("holdings.tradesTitle",{symbol:t.symbol})}</h3>
        <p>${o("holdings.tradesIntro")}</p>
      </div>
      ${c.length?h`
          <div class="timing-list">
            ${c.map(p=>D(p.id,gr(p,i)))}
          </div>
        `:K(o("holdings.noTrades"))}
    `}};function Ft(e,t,s){return h`
    <button
      type="button"
      class="${`chip ${e.scope===t?"active":""}`}"
      on-click="${()=>e.scope=t}"
    >
      ${s}
    </button>
  `}function ur(e,t,s){let n=e.quote;return h`
    <button
      type="button"
      class="${`holding-item ${e.symbol===t?"active":""}`}"
      aria-pressed="${e.symbol===t}"
      on-click="${()=>s(e.symbol)}"
    >
      <strong>${e.symbol}</strong>
      <b>${e.isHolding?C(e.marketValue):C(e.price)}</b>
      <span>${e.name}</span>
      <small class="${e.isHolding?R(e.gain):R(n?.changePercent??0)}">${e.isHolding?`${Q(e.shares)} \xB7 ${q(e.gainPercent)}`:e.isClosed?o("holdings.closedResult",{amount:B(e.realized)}):Ze(n?.changePercent??0)}</small>
    </button>
  `}function dr(e,t){let s=d.historyStatus[e],n=cn(e,t);return{status:s?.status??(n?"ready":"loading"),error:s?.error??"",history:n}}function hr(e,t){return Vt(e)}function on(e,t){let s=e.quote,n=s&&Number.isFinite(s.price)?s.price:null,r=i=>{if(Ce(i)===t)return{price:Number(i.price)||0,exact:!0};let c=me(_e(i),t,d.fxRates);return{price:Number.isFinite(c)?c:null,exact:!1}};return[...e.lots.map(i=>({id:i.id,type:"buy",date:i.purchasedAt??"",createdAt:i.createdAt??"",record:i,result:null})),...e.sales.map(i=>({id:i.id,type:"sell",date:i.soldAt??"",createdAt:i.createdAt??"",record:i,result:e.ledger.saleResults.get(i.id)??null}))].map(i=>{let l=r(i.record),c=n&&l.price>0?(n-l.price)/l.price*100:null;return{...i,native:l,since:c,chartCurrency:t}}).sort((i,l)=>l.date.localeCompare(i.date)||l.createdAt.localeCompare(i.createdAt))}function ln(e,t){if(!e.isHolding)return null;let s=!1,n=l=>{if(Ce(l)===t)return{...l,price:Number(l.price)||0,fees:Number(l.fees)||0,currency:t,fxRate:1};s=!0;let u=fe(l),p=me((Number(l.price)||0)*u,t,d.fxRates),x=me((Number(l.fees)||0)*u,t,d.fxRates);return p===null||x===null?null:{...l,price:p,fees:x,currency:t,fxRate:1}},r=e.lots.map(n),a=e.sales.map(n);if(r.includes(null)||a.includes(null))return null;let i=Te(r,a);return i.shares>0?i.averageCost:null}function pr(e,t,s){let n=(t?.points??[]).filter($=>Number.isFinite($.close)&&$.close>0&&$.date);if(n.length<2)return null;let r=e.quote,a=N(r?.currency)||b,i=Ie(r?.rawCurrency??r?.currency).divisor,l=n.map($=>$.close/i),c=n[0].date,u=on(e,a),p=[],x=0;for(let $ of u){if(!$.date||$.date<c){x+=1;continue}let L=n.findIndex($e=>$e.date>=$.date);L===-1&&(L=n.length-1);let ve=$.native.price>0?$.native.price:l[L];p.push({...$,index:L,value:ve,close:l[L]})}p.sort(($,L)=>$.index-L.index);let m=ln(e,a),k=[...l,...p.map($=>$.value),...m?[m]:[]],v=Math.min(...k),y=Math.max(...k),I=(y-v||Math.abs(y)*.05||1)*.08;v-=I,y+=I;let O=T.width-T.left-T.right,M=T.height-T.top-T.bottom,A=$=>T.left+$/(n.length-1)*O,E=$=>T.top+(1-($-v)/(y-v))*M,g=T.top+M,f=new Map;for(let $ of p){let L=`${$.index}:${Math.round(E($.value)/10)}`;f.has(L)||f.set(L,[]),f.get(L).push($)}for(let $ of f.values())$.length<2||$.forEach((L,ve)=>{L.dx=(ve-($.length-1)/2)*11});let S=l.map(($,L)=>`${L?"L":"M"}${A(L).toFixed(1)} ${E($).toFixed(1)}`).join(" "),w=`${S} L${A(l.length-1).toFixed(1)} ${g.toFixed(1)} L${A(0).toFixed(1)} ${g.toFixed(1)} Z`,F=l[0],_=l.at(-1),H=_-F;return{points:n,closes:l,currency:a,markers:p,outside:x,nativeAverage:m,min:v,max:y,x:A,y:E,baseline:g,plotWidth:O,plotHeight:M,linePath:S,areaPath:w,yTicks:yr(v,y,6).map($=>({value:$,y:E($)})),xTicks:br(n.length,6).map($=>({index:$,x:A($),label:vr(n[$].date,s)})),first:F,last:_,change:H,changePercent:F?H/F*100:0,tone:R(H),high:Math.max(...l),low:Math.min(...l)}}function fr(e,t,s,n,r){let a=t>=0?{index:t,x:e.x(t),y:e.y(e.closes[t]),date:e.points[t].date,close:e.closes[t],trades:e.markers.filter(m=>m.index===t).map(m=>({...m,text:Sn(m.type,m.record.quantity,P(m.native.price??m.close,e.currency))}))}:null,i=a&&a.x>T.width/2,l=matchMedia("(max-width: 640px)").matches?15:11,c=Math.max(176,...(a?.trades??[]).map(m=>Math.ceil(m.text.length*l*.6)+20)),u=44+(a?.trades.length??0)*16,p=a?i?a.x-c-12:a.x+12:0,x=a?Math.max(T.top,Math.min(a.y-20,e.baseline-u)):0;return h`
    <svg
      class="${`price-chart ${e.tone}`}"
      viewBox="${`0 0 ${T.width} ${T.height}`}"
      role="img"
      aria-label="${o("chart.label",{symbol:s.symbol})}"
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
        ${e.yTicks.map(m=>D(m.value,h`
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
                  ${$r(m.value)}
                </text>
              </svg>
            `))}
      </g>

      <g class="chart-axis">
        ${e.xTicks.map(m=>D(m.index,h`
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

      ${e.nativeAverage?h`
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
              ${o("common.avg",{price:P(e.nativeAverage,e.currency)})}
            </text>
          </svg>
        `:""}

      <g class="chart-markers">
        ${e.markers.map(m=>D(m.id,mr(m,e)))}
      </g>

      ${a?h`
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
            <g transform="${`translate(${p.toFixed(1)} ${x.toFixed(1)})`}">
              <rect width="${c}" height="${u}" rx="6"></rect>
              <text class="tooltip-date" x="10" y="17">${W(a.date)}</text>
              <text class="tooltip-price" x="10" y="35">
                ${P(a.close,e.currency)}
              </text>
              ${a.trades.map((m,k)=>D(m.id,h`
                    <svg overflow="visible">
                      <text
                        class="${`tooltip-trade ${m.type}`}"
                        x="10"
                        y="${51+k*16}"
                      >
                        ${m.text}
                      </text>
                    </svg>
                  `))}
            </g>
          </svg>
        `:""}
    </svg>
  `}function mr(e,t){let s=t.x(e.index)+(e.dx??0),n=t.y(e.value),r=`${Sn(e.type,e.record.quantity,P(e.value,t.currency))}${e.native.exact?"":` ${o("chart.converted")}`} \xB7 ${W(e.date)}`;return e.type==="buy"?h`
      <svg overflow="visible" class="marker buy">
        <title>${r}</title>
        <circle cx="${s.toFixed(1)}" cy="${n.toFixed(1)}" r="6"></circle>
      </svg>
    `:h`
      <svg overflow="visible" class="marker sell">
        <title>${r}</title>
        <path d="${`M${s.toFixed(1)} ${(n-7).toFixed(1)} L${(s+7).toFixed(1)} ${n.toFixed(1)} L${s.toFixed(1)} ${(n+7).toFixed(1)} L${(s-7).toFixed(1)} ${n.toFixed(1)} Z`}"></path>
      </svg>
    `}function gr(e,t){let s=e.type==="buy",n=e.record,r=Ce(n),a=e.since,i=a!==null&&Math.abs(a)<.005,l=a===null||i?"neutral":R(s?a:-a),c=a===null?o("common.waitingForPrice"):i?o("timing.unchanged"):s?a>=0?o("timing.risenSinceBuy"):o("timing.fallenSinceBuy"):a<=0?o("timing.goodSell"):o("timing.risenSinceSell"),u=t?t.markers.some(p=>p.id===e.id):!1;return h`
    <article class="${`timing-row ${e.type}`}">
      <span class="${`badge ${e.type}`}">${kn(e.type)}</span>
      <div>
        <strong>${W(e.date)}</strong>
        <span>${o("trade.sharesAt",{shares:Q(n.quantity),price:P(Number(n.price)||0,r)})}${t&&!u?` \xB7 ${o("timing.outsideChart")}`:""}</span>
      </div>
      <div>
        <span class="cell-label">${s?o("label.cost"):o("label.proceeds")}</span>
        <strong>${C(Fe(n,e.type))}</strong>
      </div>
      <div>
        <span class="cell-label">${o("timing.priceSince")}</span>
        <strong class="${l}">${a===null?"\u2013":q(a)}</strong>
        <small class="muted">${c}</small>
      </div>
      <div>
        <span class="cell-label">${s?o("label.note"):o("label.realized")}</span>
        ${s?h`
            <strong class="muted">${n.note||"\u2013"}</strong>
          `:h`
            <strong class="${R(e.result?.gain??0)}">${B(e.result?.gain??0)}</strong>
            <small class="${R(e.result?.gain??0)}">${q(e.result?.gainPercent??0)}</small>
          `}
      </div>
    </article>
  `}function yr(e,t,s=6){let n=t-e||1,r=10**Math.floor(Math.log10(n/s)),a=[1,2,2.5,5,10,20,25,50].map(i=>i*r);for(let i of a){let l=tn(e,t,i);if(l.length<=s)return l}return tn(e,t,a.at(-1))}function tn(e,t,s){let n=[];for(let r=Math.ceil(e/s)*s;r<=t+s*1e-6;r+=s)n.push(Number(r.toFixed(10)));return n}function br(e,t){if(e<=t)return Array.from({length:e},(n,r)=>r);let s=new Set;for(let n=0;n<t;n+=1)s.add(Math.round(n*(e-1)/(t-1)));return[...s]}function vr(e,t){let s=new Date(`${e}T00:00:00`);if(Number.isNaN(s.getTime()))return e;let n=t==="1mo"||t==="3mo"||t==="6mo";return new Intl.DateTimeFormat(pe(),n?{day:"numeric",month:"short"}:{month:"short",year:"2-digit"}).format(s)}function $r(e){return new Intl.NumberFormat(pe(),{maximumFractionDigits:Math.abs(e)>=100?0:2}).format(e)}var Lt=class extends z{static tag="position-table";static properties={positions:{type:Array,default:()=>[]}};render(){return h`
      <div class="position-list">
        ${this.positions.map(t=>D(t.symbol,qr(t)))}
      </div>
    `}},Bt=class extends z{static tag="transactions-page";static properties={typeFilter:{type:String,default:"all"},symbolFilter:{type:String,default:""}};updated(){An(this,"select.symbol-filter",this.effectiveSymbolFilter())}effectiveSymbolFilter(){return new Set(xn()).has(this.symbolFilter)?this.symbolFilter:""}render(){let t=se(),s=new Map(t.map(y=>[y.symbol,y])),n=Dr(s),r=[...new Set(n.map(y=>y.symbol))].sort(),a=r.includes(this.symbolFilter)?this.symbolFilter:"",i=n.filter(y=>!a||y.symbol===a),l=i.filter(y=>this.typeFilter==="all"||y.type===this.typeFilter),c=i.filter(y=>y.type==="buy"),u=i.filter(y=>y.type==="sell"),p=c.reduce((y,I)=>y+Fe(I.record,"buy"),0),x=u.reduce((y,I)=>y+(I.result?.netProceeds??0),0),m=u.reduce((y,I)=>y+(I.result?.gain??0),0),k=u.reduce((y,I)=>y+(I.result?.costBasis??0),0),v=t.some(y=>y.isHolding);return h`
      <section class="page-stack">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h1>${o("transactions.title")}</h1>
              <p>${o("transactions.intro",{base:b})}</p>
            </div>
            ${v?h`
                <button
                  type="button"
                  class="sell-button"
                  on-click="${()=>Pe(a)}"
                >
                  ${o("action.sellHolding")}
                </button>
              `:""}
          </div>

          ${n.length?h`
              <div class="tx-summary">
                <div class="fact">
                  <small>${o("transactions.invested")}</small>
                  <strong>${C(p)}</strong>
                  <span>${o("count.buys",{count:c.length})}</span>
                </div>
                <div class="fact">
                  <small>${o("transactions.soldFor")}</small>
                  <strong>${C(x)}</strong>
                  <span>${o("count.sales",{count:u.length})}</span>
                </div>
                <div class="fact">
                  <small>${o("label.realized")}</small>
                  <strong class="${R(m)}">${B(m)}</strong>
                  <span class="${u.length?R(m):"muted"}">
                    ${u.length?q(k>0?m/k*100:0):o("common.noSales")}
                  </span>
                </div>
              </div>

              <div class="filter-bar">
                <div
                  class="chip-row"
                  role="group"
                  aria-label="${o("transactions.type")}"
                >
                  ${Dt(this,"all",`${o("filter.all")} \xB7 ${i.length}`)}
                  ${Dt(this,"buy",`${o("trade.buy")} \xB7 ${c.length}`)}
                  ${Dt(this,"sell",`${o("trade.sell")} \xB7 ${u.length}`)}
                </div>
                <select
                  class="symbol-filter"
                  aria-label="${o("transactions.symbolFilter")}"
                  on-change="${y=>this.symbolFilter=y.target.value}"
                >
                  <option value="">${o("transactions.allSymbols")}</option>
                  ${r.map(y=>D(y,h`
                        <option value="${y}">${y}</option>
                      `))}
                </select>
              </div>
            `:""}

          ${l.length?h`
              <div class="transaction-list">
                ${l.map(y=>D(y.id,Mr(y)))}
              </div>
            `:K(n.length?o("transactions.noMatch"):o("transactions.empty"))}
        </section>
      </section>
    `}},zt=class extends z{static tag="research-page";static properties={query:{type:String,default:""},message:{type:String,default:""}};search=async t=>{t.preventDefault();let s=this.query.trim();if(s){d.searchLoading=!0,this.message="";try{d.searchResults=await wt(s),d.searchResults.length===0&&(this.message=o("research.noResults"))}catch(n){this.message=n.message}finally{d.searchLoading=!1}}};track=async t=>{await fn(t),this.message=o("research.watching",{symbol:t})};render(){let t=se();return h`
      <section class="research-grid">
        <section class="panel search-panel">
          <div class="panel-heading">
            <div>
              <h1>${o("research.title")}</h1>
              <p>${o("research.intro")}</p>
            </div>
          </div>
          <form class="search-form" on-submit="${this.search}">
            <input
              autocomplete="off"
              placeholder="${o("research.placeholder")}"
              .value="${this.query}"
              on-input="${s=>this.query=s.target.value}"
            />
            <button class="primary-button" disabled="${d.searchLoading}">
              ${d.searchLoading?o("research.searching"):o("research.search")}
            </button>
          </form>
          ${this.message?h`
              <p class="inline-message">${this.message}</p>
            `:""}
          <div class="search-results">
            ${d.searchResults.map(s=>D(s.symbol,h`
                  <article class="search-result">
                    <div>
                      <strong>${s.symbol}</strong>
                      <span>${s.name}</span>
                      <small>${[s.exchange,s.type,s.sector].filter(Boolean).join(" / ")}</small>
                    </div>
                    <button on-click="${()=>this.track(s.symbol)}">${o("research.watch")}</button>
                  </article>
                `))}
          </div>
        </section>

        <section class="panel watch-panel">
          <div class="panel-heading">
            <div>
              <h2>${o("research.watchedTitle")}</h2>
              <p>${o("research.watchedIntro")}</p>
            </div>
          </div>
          ${t.length?h`
              <div class="watch-grid">
                ${t.map(s=>D(s.symbol,jr(s)))}
              </div>
            `:K(o("research.watchedEmpty"))}
        </section>
      </section>
    `}},Ut=class extends z{static tag="settings-page";static properties={message:{type:String,default:""},busy:{type:Boolean,default:!1}};exportData=()=>{let t={app:"Stockroom",version:2,exportedAt:new Date().toISOString(),lots:d.lots,sales:d.sales,watchlist:d.watchlist,quotes:d.quotes,settings:d.settings},s=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(s),n.download=`stockroom-${U()}.json`,n.click(),URL.revokeObjectURL(n.href)};importData=async t=>{let s=t.target.files?.[0];if(s){this.busy=!0;try{let n;try{n=JSON.parse(await s.text())}catch{throw new Error(o("import.invalid"))}let r=zr(n);await ps(r),await _t();let a={buys:o("count.buys",{count:r.lots.length}),sales:o("count.sales",{count:r.sales.length})};this.message=r.skipped?o("settings.importedSkipped",{...a,skipped:o("count.skipped",{count:r.skipped})}):o("settings.imported",a)}catch(n){this.message=n.message}finally{this.busy=!1,t.target.value=""}}};clearData=async()=>{confirm(o("settings.confirmClear"))&&(await fs(),await _t(),this.message=o("settings.cleared"))};persistStorage=async()=>{if(!navigator.storage?.persist){this.message=o("settings.persistUnavailable");return}let t=await navigator.storage.persist();this.message=t?o("settings.persistGranted"):o("settings.persistDenied")};render(){let t=X(),s=Object.entries(d.fxRates).filter(([,n])=>Number.isFinite(n)).sort(([n],[r])=>n.localeCompare(r));return h`
      <section class="settings-grid">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h1>${o("settings.localTitle")}</h1>
              <p>${o("settings.localIntro")}</p>
            </div>
          </div>
          <div class="settings-actions">
            <button class="primary-button" on-click="${this.exportData}">
              ${o("settings.export")}
            </button>
            <label class="file-button">
              ${o("settings.import")}
              <input type="file" accept="application/json" on-change="${this.importData}" />
            </label>
            <button on-click="${this.persistStorage}">${o("settings.persist")}</button>
            <button class="danger-button" on-click="${this.clearData}">
              ${o("settings.clear")}
            </button>
          </div>
          ${this.message?h`
              <p class="inline-message">${this.message}</p>
            `:""}
        </section>

        <section class="panel">
          <div class="panel-heading">
            <div>
              <h2>${o("settings.storageTitle")}</h2>
              <p>${o("settings.storageIntro")}</p>
            </div>
          </div>
          <div class="storage-stats">
            ${[["stats.buys",d.lots.length],["stats.sales",d.sales.length],["stats.watched",d.watchlist.length],["stats.quotes",Object.keys(d.quotes).length],["stats.histories",Nt.all().length]].map(([n,r])=>D(n,h`
                  <span><strong>${r}</strong> ${o(n,{count:r})}</span>
                `))}
          </div>
        </section>

        <section class="panel currency-panel">
          <div class="panel-heading">
            <div>
              <h2>${o("settings.currencyTitle")}</h2>
              <p>${o("settings.currencyIntro",{base:b})}</p>
            </div>
          </div>
          <div class="settings-actions">
            <span class="muted">${o("currency.display")}</span>
            <div
              class="segmented"
              role="group"
              aria-label="${o("currency.display")}"
            >
              ${he.map(n=>D(n,h`
                    <button
                      type="button"
                      class="${`segment ${t===n?"active":""}`}"
                      aria-pressed="${t===n}"
                      on-click="${()=>un(n)}"
                    >
                      ${n}
                    </button>
                  `))}
            </div>
          </div>
          ${s.length?h`
              <div class="storage-stats rates-list">
                ${s.map(([n,r])=>D(n,h`
                      <span>
                        <span>1 ${n}</span>
                        <strong>${P(r,b)}</strong>
                      </span>
                    `))}
              </div>
            `:h`
              <p class="inline-message">${o("settings.ratesHint")}</p>
            `}
        </section>
      </section>
    `}};Et.register();Pt.register();qt.register();Mt.register();jt.register();Lt.register();Ot.register();Bt.register();zt.register();Ut.register();ct({routes:[{path:"/",component:"dashboard-page"},{path:"/holdings",component:"holdings-page"},{path:"/holdings/:symbol",component:"holdings-page"},{path:"/transactions",component:"transactions-page"},{path:"/lots",component:"transactions-page"},{path:"/research",component:"research-page"},{path:"/settings",component:"settings-page"}]});wr();async function wr(){await _t(),await gn({forceHistory:!1,quiet:!0}),await Je(vn(),{required:!1}).catch(()=>{})}async function _t(){let e=await as();d.lots=e.lots,d.sales=e.sales??[],d.watchlist=e.watchlist,d.quotes=e.quotes,d.fxRates=Ir(e.quotes),d.settings={refreshMinutes:5,lastRefresh:"",displayCurrency:b,...e.settings},d.ready=!0}function se(){return vs(d.lots,d.watchlist,d.quotes,xr(),d.fxRates,d.sales)}var Tt=new Map;function Vt(e,t={}){let s=j(e);if(!s)return Promise.resolve();let n=Tt.get(s);if(n)return n;let r=d.historyStatus[s],a=Date.now();if(!t.force&&r&&(r.status==="ready"&&a-r.at<5*6e4||r.status==="error"&&a-r.at<6e4))return Promise.resolve();It(s,{status:"loading",error:"",at:a});let i=(async()=>{try{let l=await Zs(s,{maxAgeMs:t.force?0:void 0});It(s,{status:"ready",error:l?.stale?l.error??"":"",at:Date.now()})}catch(l){It(s,{status:"error",error:l.message,at:Date.now()})}finally{Tt.delete(s)}})();return Tt.set(s,i),i}function It(e,t){d.historyStatus={...d.historyStatus,[e]:t}}function cn(e,t){let s=Ct(e);if(!s)return null;let n=d.quotes[e],r=Ie(n?.rawCurrency??n?.currency).divisor;return{symbol:e,updatedAt:s.updatedAt,points:en(Xs(s.points,t),n,r)}}function xr(){let e={};for(let t of Qt()){let s=cn(t,"6mo");s&&(e[t]=s)}return e}function X(){let e=N(d.settings.displayCurrency);return he.includes(e)?e:b}function C(e){let t=X(),s=me(e,t,d.fxRates);return s===null?P(e,b):P(s,t)}function B(e){let t=X(),s=me(e,t,d.fxRates);return s===null?mt(e,b):mt(s,t)}async function un(e){let t=N(e);if(he.includes(t)){d.settings={...d.settings,displayCurrency:t},await ht("displayCurrency",t);try{await Je([t],{required:!0})}catch(s){d.error=s.message}}}async function kr(e){let t=j(e.symbol),s=N(e.currency)||b,n=new Date().toISOString(),r={id:crypto.randomUUID(),symbol:t,quantity:G(e.quantity),price:Number(e.price),currency:s,fxRate:s===b?1:Number(e.fxRate),purchasedAt:e.purchasedAt,fees:Number(e.fees??0)||0,note:e.note??"",createdAt:n,updatedAt:n};await os(r),d.lots=[r,...d.lots].sort((a,i)=>i.purchasedAt.localeCompare(a.purchasedAt)),await fn(t,{quiet:!0})}async function Sr(e){await is(e),d.lots=d.lots.filter(t=>t.id!==e)}async function Ar(e){let t=j(e.symbol);if(!t)throw new Error(o("errors.symbolMissing"));let s=N(e.currency)||b,n=new Date().toISOString(),r={id:crypto.randomUUID(),symbol:t,quantity:G(e.quantity),price:Number(e.price),currency:s,fxRate:s===b?1:Number(e.fxRate),soldAt:e.soldAt,fees:Number(e.fees??0)||0,note:e.note??"",createdAt:n,updatedAt:n};await ls(r),d.sales=[r,...d.sales].sort((l,c)=>c.soldAt.localeCompare(l.soldAt));let i=se().find(l=>l.symbol===t)?.ledger.saleResults.get(r.id)??{netProceeds:Fe(r,"sell"),costBasis:0,gain:0,gainPercent:0};return{sale:r,result:i}}async function Rr(e){await cs(e),d.sales=d.sales.filter(t=>t.id!==e)}async function Nr(e){confirm(o("confirm.deleteBuy",{shares:ee(e.quantity),symbol:e.symbol,date:W(e.purchasedAt)}))&&await Sr(e.id)}async function Cr(e){confirm(o("confirm.deleteSale",{shares:ee(e.quantity),symbol:e.symbol,date:W(e.soldAt)}))&&await Rr(e.id)}function Pe(e=""){d.sellRequest={symbol:j(e),openedAt:Date.now()}}function sn(){d.sellRequest&&(d.sellRequest=null)}async function dn(e,t){let s=await mn(e),n=N(s.currency)||b,r=Ie(s.rawCurrency??s.currency).divisor,a=await hn(s.symbol,t).catch(()=>null),i=await Wt(n,t);return{symbol:s.symbol,currency:n,price:a?a.close/r:s.price,priceDate:a?.date??null,fxRate:i.rate,fxDate:i.date}}async function Wt(e,t){let s=N(e);if(!s||s===b)return{rate:1,date:null};let n=await hn(Gt(s),t).catch(()=>null);return n?{rate:n.close,date:n.date}:(await Je([s],{required:!0}),{rate:d.fxRates[s],date:null})}async function hn(e,t){if(!/^\d{4}-\d{2}-\d{2}$/.test(t)||t>=U())return null;await Vt(e);let s=Ct(e);if(!s)return null;let n=s.points.filter(r=>r.date<=t).at(-1);return n?{close:n.close,date:n.date}:null}function pn(e,t){let s=P(t.price,t.currency),n=t.priceDate?o("lookup.close",{date:W(t.priceDate),symbol:e,price:s}):o("lookup.latest",{symbol:e,price:s}),r=t.currency===b?"":` \xB7 ${ge(t.fxRate,4)} ${b}/${t.currency}${t.fxDate?"":` ${o("lookup.currentRate")}`}`;return`${n}${r}.`}function Ht(e){let t=Number(e);return Number.isFinite(t)?String(Number(t.toFixed(t<10?4:2))):""}function Ee(e){let t=Number(e);return!Number.isFinite(t)||t<=0?"":String(Number(t.toFixed(4)))}async function fn(e,t={}){let s=j(e);if(!s)throw new Error(o("errors.symbolMissing"));if(!d.watchlist.some(n=>n.symbol===s)){let n={symbol:s,addedAt:new Date().toISOString()};await us(n),d.watchlist=[...d.watchlist,n].sort((r,a)=>r.symbol.localeCompare(a.symbol))}await mn(s),t.quiet||(d.notice=o("watch.added",{symbol:s}))}async function Fr(e){let t=j(e);await ds(t),d.watchlist=d.watchlist.filter(s=>s.symbol!==t)}async function mn(e){let t=await He([e]),s=t.quotes?.[0];if(!s)throw new Error(ie(t.errors?.[0],o("errors.noQuote",{symbol:e})));let n=await Kt(s);return await bn([n],{required:!0}),await wn(n.symbol,!0),await yn(),n}async function gn(e={}){let t=Qt(),s=vn().map(Gt);if(!(t.length===0&&s.length===0)&&!d.refreshing){d.refreshing=!0,e.quiet||(d.error="");try{let n=await He([...t,...s]),r=[];for(let a of n.quotes??[])r.push(await Kt(a));await bn(r,{required:!1}),await yn();for(let a of t.slice(0,24))await wn(a,e.forceHistory).catch(()=>{});n.errors?.length&&!e.quiet&&(d.error=n.errors.map(a=>`${a.symbol}: ${ie(a)}`).join(" / "))}catch(n){e.quiet||(d.error=n.message)}finally{d.refreshing=!1}}}async function yn(){let e=new Date().toISOString();d.settings={...d.settings,lastRefresh:e},await ht("lastRefresh",e)}async function Kt(e){let t=Ie(e.rawCurrency??e.currency),s=r=>Number.isFinite(r)?r/t.divisor:r,n={...e,symbol:j(e.symbol),rawCurrency:e.rawCurrency??e.currency,currency:t.currency,price:s(e.price),previousClose:s(e.previousClose),change:s(e.change),dayHigh:s(e.dayHigh),dayLow:s(e.dayLow),fiftyTwoWeekHigh:s(e.fiftyTwoWeekHigh),fiftyTwoWeekLow:s(e.fiftyTwoWeekLow),updatedAt:new Date().toISOString()};return await hs(n),d.quotes={...d.quotes,[n.symbol]:n},Tr(n),n}async function bn(e,t={}){await Je(e.map(s=>s.currency),t)}async function Je(e,t={}){let n=[...new Set(e.map(N).filter(i=>i&&i!==b))].filter(i=>!Number.isFinite(d.fxRates[i]));if(n.length===0)return;let r=await He(n.map(Gt));for(let i of r.quotes??[])await Kt(i);let a=n.filter(i=>!Number.isFinite(d.fxRates[i]));if(t.required&&a.length)throw new Error(o("errors.fxRate",{currencies:a.join(", "),base:b}))}function vn(){let e=new Set,t=s=>{let n=N(s);n&&n!==b&&e.add(n)};t(X());for(let s of d.lots)t(s.currency);for(let s of d.sales)t(s.currency);for(let s of Qt())t(d.quotes[s]?.currency);return[...e]}function Tr(e){let t=$n(e.symbol);!t||!Number.isFinite(e.price)||(d.fxRates={...d.fxRates,[t]:e.price})}function Ir(e){let t={};for(let s of Object.values(e??{})){let n=$n(s.symbol);n&&Number.isFinite(s.price)&&(t[n]=s.price)}return t}function Gt(e){return`${N(e)}${b}=X`}function $n(e){return j(e).match(/^([A-Z]{3})SEK=X$/)?.[1]??""}function wn(e,t=!1){return Vt(e,{force:t})}function Qt(){return[...new Set([...d.watchlist.map(e=>e.symbol),...xn()])].filter(Boolean)}function xn(){return[...new Set([...d.lots.map(e=>e.symbol),...d.sales.map(e=>e.symbol)])].filter(Boolean)}function Dr(e){return[...d.lots.map(s=>({id:s.id,type:"buy",symbol:s.symbol,date:s.purchasedAt??"",createdAt:s.createdAt??"",record:s,position:e.get(s.symbol)??null,result:null})),...d.sales.map(s=>{let n=e.get(s.symbol)??null;return{id:s.id,type:"sell",symbol:s.symbol,date:s.soldAt??"",createdAt:s.createdAt??"",record:s,position:n,result:n?.ledger.saleResults.get(s.id)??null}})].sort((s,n)=>n.date.localeCompare(s.date)||n.createdAt.localeCompare(s.createdAt))}function Er(){let e=d.settings.lastRefresh;return e?new Intl.DateTimeFormat(pe(),{hour:"2-digit",minute:"2-digit",month:"short",day:"numeric"}).format(new Date(e)):o("refresh.never")}function U(){return new Date().toISOString().slice(0,10)}function Q(e){return o("units.shares",{count:e})}function Ze(e){return o("common.today",{percent:q(e)})}function kn(e){return e==="buy"?o("trade.buy"):o("trade.sell")}function Sn(e,t,s){return o(e==="buy"?"chart.buyAt":"chart.sellAt",{shares:Q(t),price:s})}function Pr(e){return new Intl.NumberFormat(pe(),{style:"percent"}).format(e)}function An(e,t,s){let n=e.querySelector(t);n&&n.value!==s&&(n.value=s)}function Rn(e,t){let s=Ue.includes(e)?Ue:[e,...Ue];return h`
    <select
      class="currency-select"
      aria-label="${o("currency.label")}"
      .value="${e}"
      on-change="${t}"
    >
      ${s.map(n=>D(n,h`
            <option value="${n}" selected="${n===e}">${n}</option>
          `))}
    </select>
  `}function qr(e){let t=yt(e.history?.points??[],180,54),s=e.quote,n=N(s?.currency)||b,r=s&&n!==X();return h`
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
        aria-label="${o("position.trend",{symbol:e.symbol})}"
      >
        <path class="sparkline-grid" d="M0 27 L180 27"></path>
        <path class="${`sparkline-path ${R(e.gain)}`}" d="${t}"></path>
      </svg>
      <div>
        <span class="cell-label">${o("label.quantity")}</span>
        <strong>${ee(e.shares)}</strong>
        <small class="muted">${o("common.avg",{price:C(e.averageCost)})}</small>
      </div>
      <div>
        <span class="cell-label">${o("position.price")}</span>
        <strong>${C(e.price)}</strong>
        <small class="${R(s?.changePercent??0)}">${r?`${P(s.price,n)} \xB7 `:""}${Ze(s?.changePercent??0)}</small>
      </div>
      <div>
        <span class="cell-label">${o("position.value")}</span>
        <strong>${C(e.marketValue)}</strong>
        ${e.sellCount?h`
            <small class="${R(e.realized)}">${o("position.realizedAmount",{amount:B(e.realized)})}</small>
          `:""}
      </div>
      <div>
        <span class="cell-label">${o("position.result")}</span>
        <strong class="${R(e.gain)}">
          ${B(e.gain)}
        </strong>
        <small class="${R(e.gain)}">${q(e.gainPercent)}</small>
      </div>
      <button
        type="button"
        class="sell-button compact"
        on-click="${()=>Pe(e.symbol)}"
      >
        ${o("action.sell")}
      </button>
    </article>
  `}function Mr(e){let{record:t,position:s,result:n}=e,r=e.type==="buy",a=Number(t.quantity)||0,i=Number(t.price)||0,l=Number(t.fees)||0,c=Ce(t),u=fe(t),p=c!==b,x=Fe(t,e.type),m=s?.quote,k=N(m?.currency)||b,v=!r||i<=0?null:m&&k===c&&m.price>0?(m.price-i)/i*100:s&&s.price>0?(s.price-_e(t))/_e(t)*100:null,y=n?.gain??0;return h`
    <article class="${`transaction-row ${e.type}`}">
      <div class="tx-identity">
        <span class="${`badge ${e.type}`}">${kn(e.type)}</span>
        <div>
          <strong>${t.symbol}</strong>
          <span>${t.note||s?.name||t.symbol}</span>
        </div>
      </div>
      <div>
        <span class="cell-label">${o("label.date")}</span>
        <strong>${W(e.date)}</strong>
      </div>
      <div>
        <span class="cell-label">${o("label.quantity")}</span>
        <strong>${ee(a)}</strong>
      </div>
      <div>
        <span class="cell-label">${o("label.price")}</span>
        <strong>${P(i,c)}</strong>
        <small class="muted">${[p?`\xD7 ${ge(u,4)} = ${C(i*u)}`:"",l>0?o("transactions.fee",{amount:P(l,c)}):""].filter(Boolean).join(" \xB7 ")}</small>
      </div>
      <div>
        <span class="cell-label">${r?o("label.cost"):o("label.proceeds")}</span>
        <strong>${C(x)}</strong>
      </div>
      <div>
        <span class="cell-label">${r?o("transactions.priceSinceBuy"):o("label.realized")}</span>
        ${r?h`
            <strong class="${R(v??0)}">${v===null?"\u2013":q(v)}</strong>
            <small class="muted">${v===null?o("common.waitingForPrice"):o("transactions.now",{price:m&&k===c?P(m.price,c):C(s?.price??0)})}</small>
          `:h`
            <strong class="${R(y)}">${B(y)}</strong>
            <small class="${R(y)}">${q(n?.gainPercent??0)} · ${o("common.avg",{price:C(n?.averageCost??0)})}</small>
          `}
      </div>
      <button
        type="button"
        class="danger-button compact"
        on-click="${()=>r?Nr(t):Cr(t)}"
      >
        ${o("common.delete")}
      </button>
    </article>
  `}function Dt(e,t,s){return h`
    <button
      type="button"
      class="${`chip ${e.typeFilter===t?"active":""}`}"
      on-click="${()=>e.typeFilter=t}"
    >
      ${s}
    </button>
  `}function jr(e){let t=e.quote,s=yt(e.history?.points??[],240,72),n=N(t?.currency)||b,r=t&&n!==X();return h`
    <article class="watch-card">
      <div class="watch-card-head">
        <div>
          <strong>${e.symbol}</strong>
          <span>${e.name}</span>
        </div>
        ${e.isHolding?h`
            <div class="card-actions">
              <span class="pill">${Q(e.shares)}</span>
              <button
                type="button"
                class="sell-button compact"
                on-click="${()=>Pe(e.symbol)}"
              >
                ${o("action.sell")}
              </button>
            </div>
          `:e.isClosed?h`
            <span class="pill closed">${o("watch.closed")}</span>
          `:h`
            <button on-click="${()=>Fr(e.symbol)}">${o("watch.stop")}</button>
          `}
      </div>
      <svg
        class="watch-chart"
        viewBox="0 0 240 72"
        role="img"
        aria-label="${o("watch.chart",{symbol:e.symbol})}"
      >
        <path class="sparkline-grid" d="M0 36 L240 36"></path>
        <path class="${`sparkline-path ${R(t?.change??0)}`}" d="${s}"></path>
      </svg>
      <div class="watch-stats">
        <span>
          <small>${o("watch.last")}</small>
          <strong>${C(e.price)}</strong>
          ${r?h`
              <em class="muted">${P(t.price,n)}</em>
            `:""}
        </span>
        <span>
          <small>${o("watch.change")}</small>
          <strong class="${R(t?.change??0)}">
            ${q(t?.changePercent??0)}
          </strong>
        </span>
        <span>
          <small>${e.sellCount?o("label.realized"):o("watch.updated")}</small>
          ${e.sellCount?h`
              <strong class="${R(e.realized)}">${B(e.realized)}</strong>
            `:h`
              <strong>${t?.marketTime?Br(t.marketTime):o("watch.waiting")}</strong>
            `}
        </span>
      </div>
    </article>
  `}function Or(e,t){return h`
    <div class="allocation-list">
      ${e.map(s=>{let n=t>0?s.marketValue/t*100:0;return D(s.symbol,h`
            <div class="allocation-row">
              <div>
                <strong>${s.symbol}</strong>
                <span>${C(s.marketValue)}</span>
              </div>
              <div class="allocation-track">
                <span style="${`width: ${Math.max(2,n).toFixed(2)}%`}"></span>
              </div>
              <b>${ge(n,1)}%</b>
            </div>
          `)})}
    </div>
  `}function Lr(e){return h`
    <div class="realized-list">
      ${e.map(t=>D(t.symbol,h`
            <div class="realized-row">
              <div>
                <strong>${t.symbol}</strong>
                <span>${o("realized.sold",{count:t.soldShares})} · ${t.isClosed?o("realized.closed"):o("realized.remaining",{count:t.shares})}</span>
              </div>
              <div class="realized-value">
                <strong class="${R(t.realized)}">${B(t.realized)}</strong>
                <small class="${R(t.realized)}">${q(t.realizedPercent)}</small>
              </div>
            </div>
          `))}
    </div>
  `}function nn(e,t){return h`
    <article class="mover-card">
      <span>${e}</span>
      <strong>${t.symbol}</strong>
      <p class="${R(t.gain)}">
        ${B(t.gain)} ${q(t.gainPercent)}
      </p>
    </article>
  `}function K(e){return h`
    <div class="empty-state">${e}</div>
  `}function Br(e){return new Intl.DateTimeFormat(pe(),{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(e))}function zr(e){if(!e||typeof e!="object"||Array.isArray(e))throw new Error(o("import.invalid"));if(!Array.isArray(e.lots))throw new Error(o("import.noBuys"));if(e.sales!==void 0&&!Array.isArray(e.sales))throw new Error(o("import.badSales"));if(!Array.isArray(e.watchlist))throw new Error(o("import.noWatchlist"));let t=e.lots.map(u=>rn(u,"purchasedAt")),s=(e.sales??[]).map(u=>rn(u,"soldAt")),n=e.watchlist.map(_r),r=Object.values(e.quotes&&typeof e.quotes=="object"?e.quotes:{}).map(Hr),a={},i=e.settings&&typeof e.settings=="object"?e.settings:{};he.includes(N(i.displayCurrency))&&(a.displayCurrency=N(i.displayCurrency)),be(i.lastRefresh)&&(a.lastRefresh=i.lastRefresh);let l=u=>u.filter(Boolean),c=[t,s,n,r].reduce((u,p)=>u+p.filter(x=>!x).length,0);return{lots:an(l(t)),sales:an(l(s)),watchlist:l(n),quotes:l(r),settings:a,skipped:c}}var Ur=/^\d{4}-\d{2}-\d{2}$/;function rn(e,t){if(!e||typeof e!="object")return null;let s=Yt(e.symbol),n=G(Number(e.quantity)),r=Number(e.price),a=String(e[t]??"");if(!s||!(n>0)||!Number.isFinite(r)||r<0||!Ur.test(a)||Number.isNaN(Date.parse(a)))return null;let i=N(e.currency)||b,l=Number(e.fxRate),c=Number(e.fees),u=new Date().toISOString();return{id:typeof e.id=="string"&&e.id.length>0&&e.id.length<=64?e.id:crypto.randomUUID(),symbol:s,quantity:n,price:r,currency:i.slice(0,8),fxRate:i===b?1:Number.isFinite(l)&&l>0?l:1,[t]:a,fees:Number.isFinite(c)&&c>0?c:0,note:typeof e.note=="string"?e.note.slice(0,500):"",createdAt:be(e.createdAt)?e.createdAt:u,updatedAt:be(e.updatedAt)?e.updatedAt:u}}function _r(e){let t=Yt(e?.symbol);return t?{symbol:t,addedAt:be(e.addedAt)?e.addedAt:new Date().toISOString()}:null}function Hr(e){if(!e||typeof e!="object")return null;let t=Yt(e.symbol),s=Number(e.price);if(!t||!Number.isFinite(s)||s<=0)return null;let n=r=>Number.isFinite(r)?r:void 0;return{symbol:t,name:typeof e.name=="string"?e.name.slice(0,120):t,price:s,previousClose:n(e.previousClose),change:n(e.change),changePercent:n(e.changePercent),currency:N(e.currency).slice(0,8)||b,rawCurrency:typeof e.rawCurrency=="string"?e.rawCurrency.slice(0,8):void 0,exchange:typeof e.exchange=="string"?e.exchange.slice(0,80):"",marketTime:be(e.marketTime)?e.marketTime:"",updatedAt:be(e.updatedAt)?e.updatedAt:new Date().toISOString()}}function Yt(e){let t=j(e);return/^[A-Z0-9.^=_-]{1,24}$/.test(t)?t:""}function be(e){return typeof e=="string"&&e.length<=40&&!Number.isNaN(Date.parse(e))}function an(e){let t=new Set;return e.filter(s=>t.has(s.id)?!1:(t.add(s.id),!0))}
//# sourceMappingURL=app.js.map
