import{j as e}from"./ui-2_2xY0sS.js";import{g as Yn,r as M}from"./vendor-Dj4APJbq.js";import{c as Zn,K as _,B as Q,au as Gn,a9 as Z,aj as Ut,ak as _t,al as Vt,am as Ht,P as Xn,aw as $n,at as er}from"./index-D0ATQLW2.js";import{L as G}from"./label-7HkNZsLX.js";import{t as R}from"./index-C7Qn3gX3.js";import{S as Ot,a as Qt,b as Wt,c as Kt,d as de}from"./select-Dvty8OHC.js";import{I as Jt}from"./ImageUpload-BlKD0KzZ.js";import{P as We}from"./plus-DiYfD4MY.js";import{T as Yt}from"./trash-2-B97hcRqb.js";import{P as Ke}from"./printer-D1W4VhYa.js";import{E as tr}from"./eye-CbrIhfNW.js";import{P as Zt}from"./pencil-ByuRs_y1.js";import"./query-C_GIT_zP.js";import"./charts-CClYrlZQ.js";const nr=[["path",{d:"M5 12h14",key:"1ays0h"}]],rr=Zn("minus",nr);var be={},Je,Gt;function sr(){return Gt||(Gt=1,Je=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then}),Je}var Ye={},oe={},Xt;function ue(){if(Xt)return oe;Xt=1;let t;const r=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];return oe.getSymbolSize=function(i){if(!i)throw new Error('"version" cannot be null or undefined');if(i<1||i>40)throw new Error('"version" should be in range from 1 to 40');return i*4+17},oe.getSymbolTotalCodewords=function(i){return r[i]},oe.getBCHDigit=function(l){let i=0;for(;l!==0;)i++,l>>>=1;return i},oe.setToSJISFunction=function(i){if(typeof i!="function")throw new Error('"toSJISFunc" is not a valid function.');t=i},oe.isKanjiModeEnabled=function(){return typeof t<"u"},oe.toSJIS=function(i){return t(i)},oe}var Ze={},$t;function pt(){return $t||($t=1,(function(t){t.L={bit:1},t.M={bit:0},t.Q={bit:3},t.H={bit:2};function r(l){if(typeof l!="string")throw new Error("Param is not a string");switch(l.toLowerCase()){case"l":case"low":return t.L;case"m":case"medium":return t.M;case"q":case"quartile":return t.Q;case"h":case"high":return t.H;default:throw new Error("Unknown EC Level: "+l)}}t.isValid=function(i){return i&&typeof i.bit<"u"&&i.bit>=0&&i.bit<4},t.from=function(i,n){if(t.isValid(i))return i;try{return r(i)}catch{return n}}})(Ze)),Ze}var Ge,en;function ir(){if(en)return Ge;en=1;function t(){this.buffer=[],this.length=0}return t.prototype={get:function(r){const l=Math.floor(r/8);return(this.buffer[l]>>>7-r%8&1)===1},put:function(r,l){for(let i=0;i<l;i++)this.putBit((r>>>l-i-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(r){const l=Math.floor(this.length/8);this.buffer.length<=l&&this.buffer.push(0),r&&(this.buffer[l]|=128>>>this.length%8),this.length++}},Ge=t,Ge}var Xe,tn;function ar(){if(tn)return Xe;tn=1;function t(r){if(!r||r<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=r,this.data=new Uint8Array(r*r),this.reservedBit=new Uint8Array(r*r)}return t.prototype.set=function(r,l,i,n){const a=r*this.size+l;this.data[a]=i,n&&(this.reservedBit[a]=!0)},t.prototype.get=function(r,l){return this.data[r*this.size+l]},t.prototype.xor=function(r,l,i){this.data[r*this.size+l]^=i},t.prototype.isReserved=function(r,l){return this.reservedBit[r*this.size+l]},Xe=t,Xe}var $e={},nn;function or(){return nn||(nn=1,(function(t){const r=ue().getSymbolSize;t.getRowColCoords=function(i){if(i===1)return[];const n=Math.floor(i/7)+2,a=r(i),d=a===145?26:Math.ceil((a-13)/(2*n-2))*2,o=[a-7];for(let c=1;c<n-1;c++)o[c]=o[c-1]-d;return o.push(6),o.reverse()},t.getPositions=function(i){const n=[],a=t.getRowColCoords(i),d=a.length;for(let o=0;o<d;o++)for(let c=0;c<d;c++)o===0&&c===0||o===0&&c===d-1||o===d-1&&c===0||n.push([a[o],a[c]]);return n}})($e)),$e}var et={},rn;function lr(){if(rn)return et;rn=1;const t=ue().getSymbolSize,r=7;return et.getPositions=function(i){const n=t(i);return[[0,0],[n-r,0],[0,n-r]]},et}var tt={},sn;function cr(){return sn||(sn=1,(function(t){t.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const r={N1:3,N2:3,N3:40,N4:10};t.isValid=function(n){return n!=null&&n!==""&&!isNaN(n)&&n>=0&&n<=7},t.from=function(n){return t.isValid(n)?parseInt(n,10):void 0},t.getPenaltyN1=function(n){const a=n.size;let d=0,o=0,c=0,u=null,h=null;for(let f=0;f<a;f++){o=c=0,u=h=null;for(let v=0;v<a;v++){let g=n.get(f,v);g===u?o++:(o>=5&&(d+=r.N1+(o-5)),u=g,o=1),g=n.get(v,f),g===h?c++:(c>=5&&(d+=r.N1+(c-5)),h=g,c=1)}o>=5&&(d+=r.N1+(o-5)),c>=5&&(d+=r.N1+(c-5))}return d},t.getPenaltyN2=function(n){const a=n.size;let d=0;for(let o=0;o<a-1;o++)for(let c=0;c<a-1;c++){const u=n.get(o,c)+n.get(o,c+1)+n.get(o+1,c)+n.get(o+1,c+1);(u===4||u===0)&&d++}return d*r.N2},t.getPenaltyN3=function(n){const a=n.size;let d=0,o=0,c=0;for(let u=0;u<a;u++){o=c=0;for(let h=0;h<a;h++)o=o<<1&2047|n.get(u,h),h>=10&&(o===1488||o===93)&&d++,c=c<<1&2047|n.get(h,u),h>=10&&(c===1488||c===93)&&d++}return d*r.N3},t.getPenaltyN4=function(n){let a=0;const d=n.data.length;for(let c=0;c<d;c++)a+=n.data[c];return Math.abs(Math.ceil(a*100/d/5)-10)*r.N4};function l(i,n,a){switch(i){case t.Patterns.PATTERN000:return(n+a)%2===0;case t.Patterns.PATTERN001:return n%2===0;case t.Patterns.PATTERN010:return a%3===0;case t.Patterns.PATTERN011:return(n+a)%3===0;case t.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(a/3))%2===0;case t.Patterns.PATTERN101:return n*a%2+n*a%3===0;case t.Patterns.PATTERN110:return(n*a%2+n*a%3)%2===0;case t.Patterns.PATTERN111:return(n*a%3+(n+a)%2)%2===0;default:throw new Error("bad maskPattern:"+i)}}t.applyMask=function(n,a){const d=a.size;for(let o=0;o<d;o++)for(let c=0;c<d;c++)a.isReserved(c,o)||a.xor(c,o,l(n,c,o))},t.getBestMask=function(n,a){const d=Object.keys(t.Patterns).length;let o=0,c=1/0;for(let u=0;u<d;u++){a(u),t.applyMask(u,n);const h=t.getPenaltyN1(n)+t.getPenaltyN2(n)+t.getPenaltyN3(n)+t.getPenaltyN4(n);t.applyMask(u,n),h<c&&(c=h,o=u)}return o}})(tt)),tt}var Ie={},an;function kn(){if(an)return Ie;an=1;const t=pt(),r=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],l=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];return Ie.getBlocksCount=function(n,a){switch(a){case t.L:return r[(n-1)*4+0];case t.M:return r[(n-1)*4+1];case t.Q:return r[(n-1)*4+2];case t.H:return r[(n-1)*4+3];default:return}},Ie.getTotalCodewordsCount=function(n,a){switch(a){case t.L:return l[(n-1)*4+0];case t.M:return l[(n-1)*4+1];case t.Q:return l[(n-1)*4+2];case t.H:return l[(n-1)*4+3];default:return}},Ie}var nt={},Ne={},on;function dr(){if(on)return Ne;on=1;const t=new Uint8Array(512),r=new Uint8Array(256);return(function(){let i=1;for(let n=0;n<255;n++)t[n]=i,r[i]=n,i<<=1,i&256&&(i^=285);for(let n=255;n<512;n++)t[n]=t[n-255]})(),Ne.log=function(i){if(i<1)throw new Error("log("+i+")");return r[i]},Ne.exp=function(i){return t[i]},Ne.mul=function(i,n){return i===0||n===0?0:t[r[i]+r[n]]},Ne}var ln;function ur(){return ln||(ln=1,(function(t){const r=dr();t.mul=function(i,n){const a=new Uint8Array(i.length+n.length-1);for(let d=0;d<i.length;d++)for(let o=0;o<n.length;o++)a[d+o]^=r.mul(i[d],n[o]);return a},t.mod=function(i,n){let a=new Uint8Array(i);for(;a.length-n.length>=0;){const d=a[0];for(let c=0;c<n.length;c++)a[c]^=r.mul(n[c],d);let o=0;for(;o<a.length&&a[o]===0;)o++;a=a.slice(o)}return a},t.generateECPolynomial=function(i){let n=new Uint8Array([1]);for(let a=0;a<i;a++)n=t.mul(n,new Uint8Array([1,r.exp(a)]));return n}})(nt)),nt}var rt,cn;function hr(){if(cn)return rt;cn=1;const t=ur();function r(l){this.genPoly=void 0,this.degree=l,this.degree&&this.initialize(this.degree)}return r.prototype.initialize=function(i){this.degree=i,this.genPoly=t.generateECPolynomial(this.degree)},r.prototype.encode=function(i){if(!this.genPoly)throw new Error("Encoder not initialized");const n=new Uint8Array(i.length+this.degree);n.set(i);const a=t.mod(n,this.genPoly),d=this.degree-a.length;if(d>0){const o=new Uint8Array(this.degree);return o.set(a,d),o}return a},rt=r,rt}var st={},it={},at={},dn;function Pn(){return dn||(dn=1,at.isValid=function(r){return!isNaN(r)&&r>=1&&r<=40}),at}var ee={},un;function En(){if(un)return ee;un=1;const t="[0-9]+",r="[A-Z $%*+\\-./:]+";let l="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";l=l.replace(/u/g,"\\u");const i="(?:(?![A-Z0-9 $%*+\\-./:]|"+l+`)(?:.|[\r
]))+`;ee.KANJI=new RegExp(l,"g"),ee.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),ee.BYTE=new RegExp(i,"g"),ee.NUMERIC=new RegExp(t,"g"),ee.ALPHANUMERIC=new RegExp(r,"g");const n=new RegExp("^"+l+"$"),a=new RegExp("^"+t+"$"),d=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");return ee.testKanji=function(c){return n.test(c)},ee.testNumeric=function(c){return a.test(c)},ee.testAlphanumeric=function(c){return d.test(c)},ee}var hn;function he(){return hn||(hn=1,(function(t){const r=Pn(),l=En();t.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},t.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},t.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},t.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},t.MIXED={bit:-1},t.getCharCountIndicator=function(a,d){if(!a.ccBits)throw new Error("Invalid mode: "+a);if(!r.isValid(d))throw new Error("Invalid version: "+d);return d>=1&&d<10?a.ccBits[0]:d<27?a.ccBits[1]:a.ccBits[2]},t.getBestModeForData=function(a){return l.testNumeric(a)?t.NUMERIC:l.testAlphanumeric(a)?t.ALPHANUMERIC:l.testKanji(a)?t.KANJI:t.BYTE},t.toString=function(a){if(a&&a.id)return a.id;throw new Error("Invalid mode")},t.isValid=function(a){return a&&a.bit&&a.ccBits};function i(n){if(typeof n!="string")throw new Error("Param is not a string");switch(n.toLowerCase()){case"numeric":return t.NUMERIC;case"alphanumeric":return t.ALPHANUMERIC;case"kanji":return t.KANJI;case"byte":return t.BYTE;default:throw new Error("Unknown mode: "+n)}}t.from=function(a,d){if(t.isValid(a))return a;try{return i(a)}catch{return d}}})(it)),it}var fn;function fr(){return fn||(fn=1,(function(t){const r=ue(),l=kn(),i=pt(),n=he(),a=Pn(),d=7973,o=r.getBCHDigit(d);function c(v,g,w){for(let N=1;N<=40;N++)if(g<=t.getCapacity(N,w,v))return N}function u(v,g){return n.getCharCountIndicator(v,g)+4}function h(v,g){let w=0;return v.forEach(function(N){const L=u(N.mode,g);w+=L+N.getBitsLength()}),w}function f(v,g){for(let w=1;w<=40;w++)if(h(v,w)<=t.getCapacity(w,g,n.MIXED))return w}t.from=function(g,w){return a.isValid(g)?parseInt(g,10):w},t.getCapacity=function(g,w,N){if(!a.isValid(g))throw new Error("Invalid QR Code version");typeof N>"u"&&(N=n.BYTE);const L=r.getSymbolTotalCodewords(g),S=l.getTotalCodewordsCount(g,w),I=(L-S)*8;if(N===n.MIXED)return I;const m=I-u(N,g);switch(N){case n.NUMERIC:return Math.floor(m/10*3);case n.ALPHANUMERIC:return Math.floor(m/11*2);case n.KANJI:return Math.floor(m/13);case n.BYTE:default:return Math.floor(m/8)}},t.getBestVersionForData=function(g,w){let N;const L=i.from(w,i.M);if(Array.isArray(g)){if(g.length>1)return f(g,L);if(g.length===0)return 1;N=g[0]}else N=g;return c(N.mode,N.getLength(),L)},t.getEncodedBits=function(g){if(!a.isValid(g)||g<7)throw new Error("Invalid QR Code version");let w=g<<12;for(;r.getBCHDigit(w)-o>=0;)w^=d<<r.getBCHDigit(w)-o;return g<<12|w}})(st)),st}var ot={},gn;function gr(){if(gn)return ot;gn=1;const t=ue(),r=1335,l=21522,i=t.getBCHDigit(r);return ot.getEncodedBits=function(a,d){const o=a.bit<<3|d;let c=o<<10;for(;t.getBCHDigit(c)-i>=0;)c^=r<<t.getBCHDigit(c)-i;return(o<<10|c)^l},ot}var lt={},ct,mn;function mr(){if(mn)return ct;mn=1;const t=he();function r(l){this.mode=t.NUMERIC,this.data=l.toString()}return r.getBitsLength=function(i){return 10*Math.floor(i/3)+(i%3?i%3*3+1:0)},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(i){let n,a,d;for(n=0;n+3<=this.data.length;n+=3)a=this.data.substr(n,3),d=parseInt(a,10),i.put(d,10);const o=this.data.length-n;o>0&&(a=this.data.substr(n),d=parseInt(a,10),i.put(d,o*3+1))},ct=r,ct}var dt,xn;function xr(){if(xn)return dt;xn=1;const t=he(),r=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function l(i){this.mode=t.ALPHANUMERIC,this.data=i}return l.getBitsLength=function(n){return 11*Math.floor(n/2)+6*(n%2)},l.prototype.getLength=function(){return this.data.length},l.prototype.getBitsLength=function(){return l.getBitsLength(this.data.length)},l.prototype.write=function(n){let a;for(a=0;a+2<=this.data.length;a+=2){let d=r.indexOf(this.data[a])*45;d+=r.indexOf(this.data[a+1]),n.put(d,11)}this.data.length%2&&n.put(r.indexOf(this.data[a]),6)},dt=l,dt}var ut,pn;function pr(){if(pn)return ut;pn=1;const t=he();function r(l){this.mode=t.BYTE,typeof l=="string"?this.data=new TextEncoder().encode(l):this.data=new Uint8Array(l)}return r.getBitsLength=function(i){return i*8},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(l){for(let i=0,n=this.data.length;i<n;i++)l.put(this.data[i],8)},ut=r,ut}var ht,bn;function br(){if(bn)return ht;bn=1;const t=he(),r=ue();function l(i){this.mode=t.KANJI,this.data=i}return l.getBitsLength=function(n){return n*13},l.prototype.getLength=function(){return this.data.length},l.prototype.getBitsLength=function(){return l.getBitsLength(this.data.length)},l.prototype.write=function(i){let n;for(n=0;n<this.data.length;n++){let a=r.toSJIS(this.data[n]);if(a>=33088&&a<=40956)a-=33088;else if(a>=57408&&a<=60351)a-=49472;else throw new Error("Invalid SJIS character: "+this.data[n]+`
Make sure your charset is UTF-8`);a=(a>>>8&255)*192+(a&255),i.put(a,13)}},ht=l,ht}var ft={exports:{}},vn;function vr(){return vn||(vn=1,(function(t){var r={single_source_shortest_paths:function(l,i,n){var a={},d={};d[i]=0;var o=r.PriorityQueue.make();o.push(i,0);for(var c,u,h,f,v,g,w,N,L;!o.empty();){c=o.pop(),u=c.value,f=c.cost,v=l[u]||{};for(h in v)v.hasOwnProperty(h)&&(g=v[h],w=f+g,N=d[h],L=typeof d[h]>"u",(L||N>w)&&(d[h]=w,o.push(h,w),a[h]=u))}if(typeof n<"u"&&typeof d[n]>"u"){var S=["Could not find a path from ",i," to ",n,"."].join("");throw new Error(S)}return a},extract_shortest_path_from_predecessor_list:function(l,i){for(var n=[],a=i;a;)n.push(a),l[a],a=l[a];return n.reverse(),n},find_path:function(l,i,n){var a=r.single_source_shortest_paths(l,i,n);return r.extract_shortest_path_from_predecessor_list(a,n)},PriorityQueue:{make:function(l){var i=r.PriorityQueue,n={},a;l=l||{};for(a in i)i.hasOwnProperty(a)&&(n[a]=i[a]);return n.queue=[],n.sorter=l.sorter||i.default_sorter,n},default_sorter:function(l,i){return l.cost-i.cost},push:function(l,i){var n={value:l,cost:i};this.queue.push(n),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};t.exports=r})(ft)),ft.exports}var yn;function yr(){return yn||(yn=1,(function(t){const r=he(),l=mr(),i=xr(),n=pr(),a=br(),d=En(),o=ue(),c=vr();function u(S){return unescape(encodeURIComponent(S)).length}function h(S,I,m){const P=[];let z;for(;(z=S.exec(m))!==null;)P.push({data:z[0],index:z.index,mode:I,length:z[0].length});return P}function f(S){const I=h(d.NUMERIC,r.NUMERIC,S),m=h(d.ALPHANUMERIC,r.ALPHANUMERIC,S);let P,z;return o.isKanjiModeEnabled()?(P=h(d.BYTE,r.BYTE,S),z=h(d.KANJI,r.KANJI,S)):(P=h(d.BYTE_KANJI,r.BYTE,S),z=[]),I.concat(m,P,z).sort(function(C,A){return C.index-A.index}).map(function(C){return{data:C.data,mode:C.mode,length:C.length}})}function v(S,I){switch(I){case r.NUMERIC:return l.getBitsLength(S);case r.ALPHANUMERIC:return i.getBitsLength(S);case r.KANJI:return a.getBitsLength(S);case r.BYTE:return n.getBitsLength(S)}}function g(S){return S.reduce(function(I,m){const P=I.length-1>=0?I[I.length-1]:null;return P&&P.mode===m.mode?(I[I.length-1].data+=m.data,I):(I.push(m),I)},[])}function w(S){const I=[];for(let m=0;m<S.length;m++){const P=S[m];switch(P.mode){case r.NUMERIC:I.push([P,{data:P.data,mode:r.ALPHANUMERIC,length:P.length},{data:P.data,mode:r.BYTE,length:P.length}]);break;case r.ALPHANUMERIC:I.push([P,{data:P.data,mode:r.BYTE,length:P.length}]);break;case r.KANJI:I.push([P,{data:P.data,mode:r.BYTE,length:u(P.data)}]);break;case r.BYTE:I.push([{data:P.data,mode:r.BYTE,length:u(P.data)}])}}return I}function N(S,I){const m={},P={start:{}};let z=["start"];for(let p=0;p<S.length;p++){const C=S[p],A=[];for(let x=0;x<C.length;x++){const T=C[x],y=""+p+x;A.push(y),m[y]={node:T,lastCount:0},P[y]={};for(let j=0;j<z.length;j++){const b=z[j];m[b]&&m[b].node.mode===T.mode?(P[b][y]=v(m[b].lastCount+T.length,T.mode)-v(m[b].lastCount,T.mode),m[b].lastCount+=T.length):(m[b]&&(m[b].lastCount=T.length),P[b][y]=v(T.length,T.mode)+4+r.getCharCountIndicator(T.mode,I))}}z=A}for(let p=0;p<z.length;p++)P[z[p]].end=0;return{map:P,table:m}}function L(S,I){let m;const P=r.getBestModeForData(S);if(m=r.from(I,P),m!==r.BYTE&&m.bit<P.bit)throw new Error('"'+S+'" cannot be encoded with mode '+r.toString(m)+`.
 Suggested mode is: `+r.toString(P));switch(m===r.KANJI&&!o.isKanjiModeEnabled()&&(m=r.BYTE),m){case r.NUMERIC:return new l(S);case r.ALPHANUMERIC:return new i(S);case r.KANJI:return new a(S);case r.BYTE:return new n(S)}}t.fromArray=function(I){return I.reduce(function(m,P){return typeof P=="string"?m.push(L(P,null)):P.data&&m.push(L(P.data,P.mode)),m},[])},t.fromString=function(I,m){const P=f(I,o.isKanjiModeEnabled()),z=w(P),p=N(z,m),C=c.find_path(p.map,"start","end"),A=[];for(let x=1;x<C.length-1;x++)A.push(p.table[C[x]].node);return t.fromArray(g(A))},t.rawSplit=function(I){return t.fromArray(f(I,o.isKanjiModeEnabled()))}})(lt)),lt}var wn;function wr(){if(wn)return Ye;wn=1;const t=ue(),r=pt(),l=ir(),i=ar(),n=or(),a=lr(),d=cr(),o=kn(),c=hr(),u=fr(),h=gr(),f=he(),v=yr();function g(p,C){const A=p.size,x=a.getPositions(C);for(let T=0;T<x.length;T++){const y=x[T][0],j=x[T][1];for(let b=-1;b<=7;b++)if(!(y+b<=-1||A<=y+b))for(let E=-1;E<=7;E++)j+E<=-1||A<=j+E||(b>=0&&b<=6&&(E===0||E===6)||E>=0&&E<=6&&(b===0||b===6)||b>=2&&b<=4&&E>=2&&E<=4?p.set(y+b,j+E,!0,!0):p.set(y+b,j+E,!1,!0))}}function w(p){const C=p.size;for(let A=8;A<C-8;A++){const x=A%2===0;p.set(A,6,x,!0),p.set(6,A,x,!0)}}function N(p,C){const A=n.getPositions(C);for(let x=0;x<A.length;x++){const T=A[x][0],y=A[x][1];for(let j=-2;j<=2;j++)for(let b=-2;b<=2;b++)j===-2||j===2||b===-2||b===2||j===0&&b===0?p.set(T+j,y+b,!0,!0):p.set(T+j,y+b,!1,!0)}}function L(p,C){const A=p.size,x=u.getEncodedBits(C);let T,y,j;for(let b=0;b<18;b++)T=Math.floor(b/3),y=b%3+A-8-3,j=(x>>b&1)===1,p.set(T,y,j,!0),p.set(y,T,j,!0)}function S(p,C,A){const x=p.size,T=h.getEncodedBits(C,A);let y,j;for(y=0;y<15;y++)j=(T>>y&1)===1,y<6?p.set(y,8,j,!0):y<8?p.set(y+1,8,j,!0):p.set(x-15+y,8,j,!0),y<8?p.set(8,x-y-1,j,!0):y<9?p.set(8,15-y-1+1,j,!0):p.set(8,15-y-1,j,!0);p.set(x-8,8,1,!0)}function I(p,C){const A=p.size;let x=-1,T=A-1,y=7,j=0;for(let b=A-1;b>0;b-=2)for(b===6&&b--;;){for(let E=0;E<2;E++)if(!p.isReserved(T,b-E)){let X=!1;j<C.length&&(X=(C[j]>>>y&1)===1),p.set(T,b-E,X),y--,y===-1&&(j++,y=7)}if(T+=x,T<0||A<=T){T-=x,x=-x;break}}}function m(p,C,A){const x=new l;A.forEach(function(E){x.put(E.mode.bit,4),x.put(E.getLength(),f.getCharCountIndicator(E.mode,p)),E.write(x)});const T=t.getSymbolTotalCodewords(p),y=o.getTotalCodewordsCount(p,C),j=(T-y)*8;for(x.getLengthInBits()+4<=j&&x.put(0,4);x.getLengthInBits()%8!==0;)x.putBit(0);const b=(j-x.getLengthInBits())/8;for(let E=0;E<b;E++)x.put(E%2?17:236,8);return P(x,p,C)}function P(p,C,A){const x=t.getSymbolTotalCodewords(C),T=o.getTotalCodewordsCount(C,A),y=x-T,j=o.getBlocksCount(C,A),b=x%j,E=j-b,X=Math.floor(x/j),ie=Math.floor(y/j),fe=ie+1,ge=X-ie,je=new c(ge);let le=0;const $=new Array(j),te=new Array(j);let ce=0;const me=new Uint8Array(p.buffer);for(let Y=0;Y<j;Y++){const re=Y<E?ie:fe;$[Y]=me.slice(le,le+re),te[Y]=je.encode($[Y]),le+=re,ce=Math.max(ce,re)}const ne=new Uint8Array(x);let xe=0,O,J;for(O=0;O<ce;O++)for(J=0;J<j;J++)O<$[J].length&&(ne[xe++]=$[J][O]);for(O=0;O<ge;O++)for(J=0;J<j;J++)ne[xe++]=te[J][O];return ne}function z(p,C,A,x){let T;if(Array.isArray(p))T=v.fromArray(p);else if(typeof p=="string"){let X=C;if(!X){const ie=v.rawSplit(p);X=u.getBestVersionForData(ie,A)}T=v.fromString(p,X||40)}else throw new Error("Invalid data");const y=u.getBestVersionForData(T,A);if(!y)throw new Error("The amount of data is too big to be stored in a QR Code");if(!C)C=y;else if(C<y)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+y+`.
`);const j=m(C,A,T),b=t.getSymbolSize(C),E=new i(b);return g(E,C),w(E),N(E,C),S(E,A,0),C>=7&&L(E,C),I(E,j),isNaN(x)&&(x=d.getBestMask(E,S.bind(null,E,A))),d.applyMask(x,E),S(E,A,x),{modules:E,version:C,errorCorrectionLevel:A,maskPattern:x,segments:T}}return Ye.create=function(C,A){if(typeof C>"u"||C==="")throw new Error("No input text");let x=r.M,T,y;return typeof A<"u"&&(x=r.from(A.errorCorrectionLevel,r.M),T=u.from(A.version),y=d.from(A.maskPattern),A.toSJISFunc&&t.setToSJISFunction(A.toSJISFunc)),z(C,T,x,y)},Ye}var gt={},mt={},Nn;function In(){return Nn||(Nn=1,(function(t){function r(l){if(typeof l=="number"&&(l=l.toString()),typeof l!="string")throw new Error("Color should be defined as hex string");let i=l.slice().replace("#","").split("");if(i.length<3||i.length===5||i.length>8)throw new Error("Invalid hex color: "+l);(i.length===3||i.length===4)&&(i=Array.prototype.concat.apply([],i.map(function(a){return[a,a]}))),i.length===6&&i.push("F","F");const n=parseInt(i.join(""),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:n&255,hex:"#"+i.slice(0,6).join("")}}t.getOptions=function(i){i||(i={}),i.color||(i.color={});const n=typeof i.margin>"u"||i.margin===null||i.margin<0?4:i.margin,a=i.width&&i.width>=21?i.width:void 0,d=i.scale||4;return{width:a,scale:a?4:d,margin:n,color:{dark:r(i.color.dark||"#000000ff"),light:r(i.color.light||"#ffffffff")},type:i.type,rendererOpts:i.rendererOpts||{}}},t.getScale=function(i,n){return n.width&&n.width>=i+n.margin*2?n.width/(i+n.margin*2):n.scale},t.getImageWidth=function(i,n){const a=t.getScale(i,n);return Math.floor((i+n.margin*2)*a)},t.qrToImageData=function(i,n,a){const d=n.modules.size,o=n.modules.data,c=t.getScale(d,a),u=Math.floor((d+a.margin*2)*c),h=a.margin*c,f=[a.color.light,a.color.dark];for(let v=0;v<u;v++)for(let g=0;g<u;g++){let w=(v*u+g)*4,N=a.color.light;if(v>=h&&g>=h&&v<u-h&&g<u-h){const L=Math.floor((v-h)/c),S=Math.floor((g-h)/c);N=f[o[L*d+S]?1:0]}i[w++]=N.r,i[w++]=N.g,i[w++]=N.b,i[w]=N.a}}})(mt)),mt}var jn;function Nr(){return jn||(jn=1,(function(t){const r=In();function l(n,a,d){n.clearRect(0,0,a.width,a.height),a.style||(a.style={}),a.height=d,a.width=d,a.style.height=d+"px",a.style.width=d+"px"}function i(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}t.render=function(a,d,o){let c=o,u=d;typeof c>"u"&&(!d||!d.getContext)&&(c=d,d=void 0),d||(u=i()),c=r.getOptions(c);const h=r.getImageWidth(a.modules.size,c),f=u.getContext("2d"),v=f.createImageData(h,h);return r.qrToImageData(v.data,a,c),l(f,u,h),f.putImageData(v,0,0),u},t.renderToDataURL=function(a,d,o){let c=o;typeof c>"u"&&(!d||!d.getContext)&&(c=d,d=void 0),c||(c={});const u=t.render(a,d,c),h=c.type||"image/png",f=c.rendererOpts||{};return u.toDataURL(h,f.quality)}})(gt)),gt}var xt={},Cn;function jr(){if(Cn)return xt;Cn=1;const t=In();function r(n,a){const d=n.a/255,o=a+'="'+n.hex+'"';return d<1?o+" "+a+'-opacity="'+d.toFixed(2).slice(1)+'"':o}function l(n,a,d){let o=n+a;return typeof d<"u"&&(o+=" "+d),o}function i(n,a,d){let o="",c=0,u=!1,h=0;for(let f=0;f<n.length;f++){const v=Math.floor(f%a),g=Math.floor(f/a);!v&&!u&&(u=!0),n[f]?(h++,f>0&&v>0&&n[f-1]||(o+=u?l("M",v+d,.5+g+d):l("m",c,0),c=0,u=!1),v+1<a&&n[f+1]||(o+=l("h",h),h=0)):c++}return o}return xt.render=function(a,d,o){const c=t.getOptions(d),u=a.modules.size,h=a.modules.data,f=u+c.margin*2,v=c.color.light.a?"<path "+r(c.color.light,"fill")+' d="M0 0h'+f+"v"+f+'H0z"/>':"",g="<path "+r(c.color.dark,"stroke")+' d="'+i(h,u,c.margin)+'"/>',w='viewBox="0 0 '+f+" "+f+'"',L='<svg xmlns="http://www.w3.org/2000/svg" '+(c.width?'width="'+c.width+'" height="'+c.width+'" ':"")+w+' shape-rendering="crispEdges">'+v+g+`</svg>
`;return typeof o=="function"&&o(null,L),L},xt}var An;function Cr(){if(An)return be;An=1;const t=sr(),r=wr(),l=Nr(),i=jr();function n(a,d,o,c,u){const h=[].slice.call(arguments,1),f=h.length,v=typeof h[f-1]=="function";if(!v&&!t())throw new Error("Callback required as last argument");if(v){if(f<2)throw new Error("Too few arguments provided");f===2?(u=o,o=d,d=c=void 0):f===3&&(d.getContext&&typeof u>"u"?(u=c,c=void 0):(u=c,c=o,o=d,d=void 0))}else{if(f<1)throw new Error("Too few arguments provided");return f===1?(o=d,d=c=void 0):f===2&&!d.getContext&&(c=o,o=d,d=void 0),new Promise(function(g,w){try{const N=r.create(o,c);g(a(N,d,c))}catch(N){w(N)}})}try{const g=r.create(o,c);u(null,a(g,d,c))}catch(g){u(g)}}return be.create=r.create,be.toCanvas=n.bind(null,l.render),be.toDataURL=n.bind(null,l.renderToDataURL),be.toString=n.bind(null,function(a,d,o){return i.render(a,o)}),be}var Ar=Cr();const Sr=Yn(Ar),Tr="SAR";function H(t){return Number(t??0)}function F(t){return H(t).toLocaleString("en-SA",{minimumFractionDigits:2,maximumFractionDigits:2})}function kr(t){return t==="simplified"}function Pr(t){if(t===0)return"Zero";const r=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],l=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],i=["","Thousand","Million","Billion"];function n(h){if(h===0)return"";const f=[];return h>=100&&(f.push(r[Math.floor(h/100)]+" Hundred"),h%=100),h>=20&&(f.push(l[Math.floor(h/10)]),h%=10),h>0&&f.push(r[h]),f.join(" ")}const a=Math.floor(t),d=Math.round((t-a)*100);let o="",c=0,u=a;for(;u>0;){const h=u%1e3;h>0&&(o=n(h)+(i[c]?" "+i[c]:"")+(o?" "+o:"")),u=Math.floor(u/1e3),c++}return o=o||"Zero",d>0&&(o+=` and ${d}/100`),o.trim()+" Saudi Riyals"}function Er(t){if(t===0)return"صفر";const r=[["",""],["واحد","واحدة"],["اثنان","اثنتان"],["ثلاثة","ثلاث"],["أربعة","أربع"],["خمسة","خمس"],["ستة","ست"],["سبعة","سبع"],["ثمانية","ثمان"],["تسعة","تسع"],["عشرة","عشر"],["أحد عشر","إحدى عشرة"],["اثنا عشر","اثنتا عشرة"],["ثلاثة عشر","ثلاث عشرة"],["أربعة عشر","أربع عشرة"],["خمسة عشر","خمس عشرة"],["ستة عشر","ست عشرة"],["سبعة عشر","سبع عشرة"],["ثمانية عشر","ثماني عشرة"],["تسعة عشر","تسع عشرة"]],l=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],i=["","ألف","مليون","مليار"];function n(f,v){if(f===0)return"";const g=v?1:0,w=[];if(f>=100){const N=Math.floor(f/100);N===1?w.push("مائة"):N===2?w.push("مائتان"):w.push(r[N][0]+" مائة"),f%=100}return f>=20&&(w.push(l[Math.floor(f/10)]),f%=10),f>0&&w.push(r[f][g]),w.join(" و ")}const a=Math.floor(t),d=Math.round((t-a)*100);let o="",c=0,u=a;const h=[!1,!0,!1,!1];for(;u>0;){const f=u%1e3;if(f>0){const v=n(f,h[c]);f===1&&c===1?o="ألف"+(o?" "+o:""):f===2&&c===1?o="ألفان"+(o?" "+o:""):o=v+(i[c]?" "+i[c]:"")+(o?" و "+o:"")}u=Math.floor(u/1e3),c++}return o=o||"صفر",d>0&&(o+=` و ${d}/100`),o.trim()+" ريال سعودي"}function Ir(t){if(!t)return"";try{return new Date(t).toLocaleDateString("ar-SA-u-ca-islamic",{year:"numeric",month:"long",day:"numeric"})}catch{return""}}const Sn={draft:{label:"Draft",labelAr:"مسودة",color:"#64748b"},sent:{label:"Sent",labelAr:"مُرسلة",color:"#3b82f6"},paid:{label:"Paid",labelAr:"مدفوعة",color:"#10b981"},partial:{label:"Partial",labelAr:"جزئي",color:"#f59e0b"},overdue:{label:"Overdue",labelAr:"متأخرة",color:"#ef4444"},cancelled:{label:"Cancelled",labelAr:"ملغاة",color:"#6b7280"}},Tn={cleared:{label:"Cleared",color:"#10b981"},reported:{label:"Reported",color:"#3b82f6"},pending:{label:"Pending",color:"#f59e0b"},failed:{label:"Failed",color:"#ef4444"}},Bn=M.forwardRef(({invoice:t,company:r,customer:l,items:i,className:n=""},a)=>{const[d,o]=M.useState("");M.useEffect(()=>{if(!t.zatcaQrCode){o("");return}Sr.toDataURL(t.zatcaQrCode,{errorCorrectionLevel:"M",margin:1,width:180,color:{dark:"#0f172a",light:"#ffffff"}}).then(o).catch(()=>o(""))},[t.zatcaQrCode]);const c=r.defaultCurrency??Tr,u=kr(t.invoiceType),h=Sn[t.status??"draft"]??Sn.draft,f=Tn[t.zatcaStatus??"pending"]??Tn.pending,v=H(t.taxPercent??15),g=H(t.subTotal),w=H(t.taxAmount),N=H(t.totalAmount),L=H(t.paidAmount),S=N-L,I=Ir(t.date);return e.jsxs("div",{ref:a,className:`saudi-invoice-root ${n}`,style:{fontFamily:"'Segoe UI', Tahoma, Arial, sans-serif"},children:[e.jsx("style",{children:`
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
          .saudi-invoice-root { font-family: 'Tajawal', 'Segoe UI', sans-serif; background: #f8fafc; }

          /* ── Page ── */
          .inv-page {
            max-width: 860px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow:
              0 25px 50px -12px rgba(0,0,0,.15),
              0 0 0 1px rgba(0,0,0,.04),
              inset 0 1px 0 rgba(255,255,255,.8);
          }

          /* ── Header gradient ── */
          .inv-header {
            background: linear-gradient(135deg, #0f4c35 0%, #1a7a56 40%, #0d6e4e 70%, #063d26 100%);
            padding: 32px 36px 28px;
            position: relative;
            overflow: hidden;
          }
          .inv-header::before {
            content: '';
            position: absolute;
            top: -60px; right: -60px;
            width: 220px; height: 220px;
            border-radius: 50%;
            background: rgba(255,255,255,.06);
          }
          .inv-header::after {
            content: '';
            position: absolute;
            bottom: -40px; left: -40px;
            width: 180px; height: 180px;
            border-radius: 50%;
            background: rgba(255,255,255,.04);
          }

          /* ── Logo box ── */
          .inv-logo-box {
            width: 72px; height: 72px;
            border-radius: 16px;
            background: rgba(255,255,255,.15);
            border: 2px solid rgba(255,255,255,.25);
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(4px);
            overflow: hidden;
            flex-shrink: 0;
          }
          .inv-logo-box img { width: 100%; height: 100%; object-fit: contain; }

          /* ── Title badge ── */
          .inv-title-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255,255,255,.15);
            border: 1px solid rgba(255,255,255,.3);
            border-radius: 100px;
            padding: 4px 14px;
            backdrop-filter: blur(4px);
            margin-bottom: 6px;
          }

          /* ── Color stat boxes ── */
          .inv-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
          }
          .inv-stat-box {
            padding: 20px 24px;
            position: relative;
          }
          .inv-stat-box:not(:last-child)::after {
            content: '';
            position: absolute;
            right: 0; top: 16px; bottom: 16px;
            width: 1px;
            background: rgba(0,0,0,.07);
          }
          .inv-stat-box-subtotal { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
          .inv-stat-box-vat      { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
          .inv-stat-box-total    { background: linear-gradient(135deg, #0f4c35, #1a7a56); }
          .inv-stat-box-paid     { background: linear-gradient(135deg, #fefce8, #fef9c3); }

          .inv-stat-label {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .05em;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .inv-stat-value {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -.5px;
            line-height: 1.1;
          }
          .inv-stat-currency {
            font-size: 11px;
            font-weight: 600;
            margin-top: 2px;
          }

          /* ── Body ── */
          .inv-body { padding: 28px 36px; }

          /* ── Info cards ── */
          .inv-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          .inv-info-card {
            border-radius: 14px;
            padding: 18px 20px;
            border: 1.5px solid;
            position: relative;
            overflow: hidden;
          }
          .inv-info-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            border-radius: 14px 14px 0 0;
          }
          .inv-info-card-seller {
            background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
            border-color: #bbf7d0;
          }
          .inv-info-card-seller::before { background: linear-gradient(90deg, #10b981, #059669); }
          .inv-info-card-buyer {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border-color: #bfdbfe;
          }
          .inv-info-card-buyer::before { background: linear-gradient(90deg, #3b82f6, #2563eb); }

          .inv-card-tag {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .1em;
            text-transform: uppercase;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .inv-card-name {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .inv-card-name-ar {
            font-size: 14px;
            font-weight: 600;
            direction: rtl;
            margin-bottom: 4px;
          }
          .inv-card-text {
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
          }
          .inv-vat-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            margin-top: 8px;
          }

          /* ── Meta row ── */
          .inv-meta-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .inv-meta-pill {
            border-radius: 12px;
            padding: 12px 16px;
            text-align: center;
            border: 1.5px solid;
          }
          .inv-meta-pill-type  { background: #f8fafc; border-color: #e2e8f0; }
          .inv-meta-pill-date  { background: #fff7ed; border-color: #fed7aa; }
          .inv-meta-pill-due   { background: #fef2f2; border-color: #fecaca; }
          .inv-meta-pill-uuid  { background: #faf5ff; border-color: #e9d5ff; }
          .inv-meta-label { font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #64748b; }
          .inv-meta-value { font-size: 13px; font-weight: 700; margin-top: 3px; word-break: break-all; }

          /* ── Items table ── */
          .inv-table-wrap {
            border-radius: 14px;
            border: 1.5px solid #e2e8f0;
            overflow: hidden;
            margin-bottom: 24px;
          }
          .inv-table { width: 100%; border-collapse: collapse; }
          .inv-table thead { background: linear-gradient(135deg, #0f4c35, #1a7a56); }
          .inv-table thead th {
            padding: 14px 16px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .06em;
            text-transform: uppercase;
            color: rgba(255,255,255,.9);
          }
          .inv-table thead th:last-child { text-align: right; }
          .inv-table tbody tr { border-bottom: 1px solid #f1f5f9; }
          .inv-table tbody tr:last-child { border-bottom: none; }
          .inv-table tbody tr:nth-child(even) { background: #f8fafc; }
          .inv-table tbody tr:hover { background: #f0fdf4; }
          .inv-table td {
            padding: 14px 16px;
            font-size: 13px;
            color: #1e293b;
          }
          .inv-table td:last-child { text-align: right; font-weight: 700; }
          .inv-item-desc { font-weight: 600; }
          .inv-item-desc-ar { font-size: 11px; color: #64748b; direction: rtl; }
          .inv-table-number { font-variant-numeric: tabular-nums; }
          .inv-row-num {
            width: 28px; height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            font-size: 11px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          /* ── Footer section ── */
          .inv-footer-grid {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
            align-items: start;
          }

          /* ── Totals box ── */
          .inv-totals {
            border-radius: 16px;
            overflow: hidden;
            border: 1.5px solid #e2e8f0;
          }
          .inv-totals-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 18px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
          }
          .inv-totals-row:last-child { border-bottom: none; }
          .inv-totals-row-sub   { background: #f8fafc; }
          .inv-totals-row-vat   { background: #f0fdf4; }
          .inv-totals-row-total {
            background: linear-gradient(135deg, #0f4c35, #1a7a56);
            color: white;
            padding: 16px 18px;
          }
          .inv-totals-row-paid  { background: #fefce8; }
          .inv-totals-row-due   { background: #fef2f2; }
          .inv-totals-label { font-weight: 600; color: #475569; }
          .inv-totals-label-white { font-weight: 700; color: rgba(255,255,255,.85); }
          .inv-totals-value { font-weight: 700; font-variant-numeric: tabular-nums; }
          .inv-totals-value-big { font-size: 20px; font-weight: 800; color: white; }
          .inv-totals-value-due { color: #ef4444; font-weight: 800; }

          /* ── QR box ── */
          .inv-qr-box {
            border-radius: 16px;
            border: 1.5px solid #bbf7d0;
            background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
            padding: 20px;
            text-align: center;
          }
          .inv-qr-img {
            width: 140px; height: 140px;
            object-fit: contain;
            border-radius: 12px;
            padding: 8px;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,.1);
            margin: 0 auto 12px;
            display: block;
          }
          .inv-qr-label {
            font-size: 11px;
            font-weight: 700;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: .05em;
          }
          .inv-qr-label-ar {
            font-size: 13px;
            font-weight: 600;
            color: #047857;
            direction: rtl;
            margin-top: 2px;
          }

          /* ── Notes / Terms ── */
          .inv-notes {
            margin-top: 20px;
            border-radius: 14px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #faf5ff, #f3e8ff);
            border: 1.5px solid #e9d5ff;
            font-size: 12px;
            color: #4c1d95;
          }

          /* ── Compliance footer ── */
          .inv-compliance {
            margin-top: 24px;
            border-top: 2px dashed #e2e8f0;
            padding-top: 20px;
          }
          .inv-compliance-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          .inv-compliance-item {
            border-radius: 10px;
            padding: 12px 14px;
            font-size: 11px;
            text-align: center;
          }
          .inv-compliance-item-zatca { background: #f0fdf4; border: 1px solid #bbf7d0; color: #065f46; }
          .inv-compliance-item-vat   { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
          .inv-compliance-item-cr    { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }
          .inv-compliance-label { font-weight: 700; letter-spacing: .05em; text-transform: uppercase; margin-bottom: 4px; }
          .inv-compliance-value { font-weight: 600; word-break: break-all; }

          /* ── Watermark ── */
          .inv-watermark {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            font-size: 10px;
            color: #cbd5e1;
            letter-spacing: .05em;
          }

          /* ── Badge ── */
          .inv-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 700;
          }

          /* ── Print ── */
          @media print {
            .saudi-invoice-root { background: white; }
            .inv-page { box-shadow: none; border-radius: 0; }
            .inv-body { padding: 20px; }
          }
        `}),e.jsxs("div",{className:"inv-page",children:[e.jsx("div",{className:"inv-header",children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1},children:[e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"flex-start"},children:[e.jsx("div",{className:"inv-logo-box",children:r.logo?e.jsx("img",{src:r.logo,alt:"logo"}):e.jsx("span",{style:{color:"white",fontWeight:800,fontSize:20},children:(r.companyName??"YA").slice(0,2).toUpperCase()})}),e.jsxs("div",{children:[e.jsx("div",{style:{color:"white",fontWeight:800,fontSize:20,lineHeight:1.2},children:r.companyName??"Company Name"}),r.companyNameAr&&e.jsx("div",{style:{color:"rgba(255,255,255,.8)",fontWeight:600,fontSize:14,direction:"rtl",marginTop:2},children:r.companyNameAr}),e.jsxs("div",{style:{color:"rgba(255,255,255,.65)",fontSize:11,marginTop:6,lineHeight:1.7},children:[r.address&&e.jsxs("div",{children:[r.address,r.city?`, ${r.city}`:""]}),r.phone&&e.jsx("div",{children:r.phone}),r.email&&e.jsx("div",{children:r.email})]})]})]}),e.jsxs("div",{style:{textAlign:"right"},children:[e.jsxs("div",{className:"inv-title-badge",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:"2.5",children:[e.jsx("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),e.jsx("polyline",{points:"14 2 14 8 20 8"})]}),e.jsx("span",{style:{color:"white",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"},children:u?"Simplified Tax Invoice":"Tax Invoice"})]}),e.jsx("div",{style:{color:"rgba(255,255,255,.9)",fontWeight:800,fontSize:18,direction:"rtl",marginBottom:4},children:u?"فاتورة ضريبية مبسطة":"فاتورة ضريبية"}),e.jsx("div",{style:{color:"rgba(255,255,255,.7)",fontFamily:"monospace",fontSize:16,fontWeight:700},children:t.invoiceNumber??"INV-000000"}),t.zatcaStatus&&e.jsx("div",{style:{marginTop:10},children:e.jsxs("span",{className:"inv-badge",style:{background:`${f.color}22`,border:`1.5px solid ${f.color}44`,color:f.color},children:[e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",background:f.color,display:"inline-block"}}),"ZATCA ",f.label]})}),e.jsx("div",{style:{marginTop:8},children:e.jsxs("span",{className:"inv-badge",style:{background:`${h.color}22`,border:`1.5px solid ${h.color}44`,color:h.color},children:[h.label," / ",h.labelAr]})})]})]})}),e.jsxs("div",{className:"inv-stats",children:[e.jsxs("div",{className:"inv-stat-box inv-stat-box-subtotal",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#2563eb"},children:"Subtotal / المجموع"}),e.jsx("div",{className:"inv-stat-value",style:{color:"#1d4ed8"},children:F(g)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#3b82f6"},children:c})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-vat",children:[e.jsxs("div",{className:"inv-stat-label",style:{color:"#059669"},children:["VAT ",v,"% / ضريبة القيمة"]}),e.jsx("div",{className:"inv-stat-value",style:{color:"#047857"},children:F(w)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#10b981"},children:c})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-total",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"rgba(255,255,255,.75)"},children:"TOTAL / الإجمالي"}),e.jsx("div",{className:"inv-stat-value",style:{color:"white"},children:F(N)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"rgba(255,255,255,.7)"},children:c})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-paid",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#d97706"},children:"Amount Due / المستحق"}),e.jsx("div",{className:"inv-stat-value",style:{color:S>0?"#dc2626":"#16a34a"},children:F(S)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#f59e0b"},children:c})]})]}),e.jsxs("div",{className:"inv-body",children:[e.jsxs("div",{className:"inv-info-grid",children:[e.jsxs("div",{className:"inv-info-card inv-info-card-seller",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#059669"},children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#059669",strokeWidth:"2.5",children:e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"})}),"Seller / البائع"]}),e.jsx("div",{className:"inv-card-name",children:r.companyName??"—"}),r.companyNameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#065f46"},children:r.companyNameAr}),e.jsxs("div",{className:"inv-card-text",children:[r.address&&e.jsxs("div",{children:[r.address,r.city?`, ${r.city}`:""]}),r.country&&e.jsx("div",{children:r.country}),r.phone&&e.jsxs("div",{children:["📞 ",r.phone]}),r.email&&e.jsxs("div",{children:["✉ ",r.email]})]}),r.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46"},children:["🏛 VAT: ",r.taxNumber]}),r.crNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46",marginTop:4},children:["📋 CR: ",r.crNumber]})]}),e.jsxs("div",{className:"inv-info-card inv-info-card-buyer",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#2563eb"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#2563eb",strokeWidth:"2.5",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),"Bill To / العميل"]}),e.jsx("div",{className:"inv-card-name",children:l.name??"—"}),l.nameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#1e40af"},children:l.nameAr}),e.jsxs("div",{className:"inv-card-text",children:[l.address&&e.jsxs("div",{children:[l.address,l.city?`, ${l.city}`:""]}),l.phone&&e.jsxs("div",{children:["📞 ",l.phone]}),l.email&&e.jsxs("div",{children:["✉ ",l.email]})]}),l.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#dbeafe",color:"#1e40af"},children:["🏛 Customer VAT: ",l.taxNumber]})]})]}),e.jsxs("div",{className:"inv-meta-row",style:{gridTemplateColumns:"repeat(6, 1fr)"},children:[e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",children:[e.jsx("div",{className:"inv-meta-label",children:"Invoice Type"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#0f172a",fontSize:10},children:t.invoiceType==="simplified"?"Simplified / مبسطة":t.invoiceType==="zatca"?"ZATCA / فاتورة ذاتكا":"Standard / قياسية"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",children:[e.jsx("div",{className:"inv-meta-label",children:"Issue Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#c2410c",fontSize:11},children:t.date??"—"}),I&&e.jsx("div",{style:{fontSize:9,color:"#9a3412",direction:"rtl",marginTop:1},children:I})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",style:{background:"#f0fdf4",borderColor:"#bbf7d0"},children:[e.jsx("div",{className:"inv-meta-label",children:"Issue Time"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#065f46",fontSize:11},children:t.time??"—"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-due",children:[e.jsx("div",{className:"inv-meta-label",children:"Due Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#b91c1c",fontSize:11},children:t.dueDate??"Upon Receipt"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-uuid",style:{background:"#faf5ff",borderColor:"#e9d5ff"},children:[e.jsx("div",{className:"inv-meta-label",children:t.workedMonth?"Worked Month":"Payment Method"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#6d28d9",fontSize:10},children:t.workedMonth??t.paymentMethod??"—"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",style:{background:"#fff7ed",borderColor:"#fed7aa"},children:[e.jsx("div",{className:"inv-meta-label",children:t.poNumber?"PO No.":t.cashier?"Cashier":"Created By"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#9a3412",fontSize:10},children:t.poNumber??t.cashier??t.createdBy??"—"})]})]}),(t.contractNumber||t.projectReference)&&e.jsxs("div",{style:{display:"flex",gap:12,marginBottom:16},children:[t.contractNumber&&e.jsxs("div",{style:{fontSize:11,color:"#475569",background:"#f1f5f9",padding:"4px 12px",borderRadius:6},children:[e.jsx("strong",{children:"Contract:"})," ",t.contractNumber]}),t.projectReference&&e.jsxs("div",{style:{fontSize:11,color:"#475569",background:"#f1f5f9",padding:"4px 12px",borderRadius:6},children:[e.jsx("strong",{children:"Project:"})," ",t.projectReference]})]}),e.jsx("div",{className:"inv-table-wrap",children:e.jsxs("table",{className:"inv-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:32,textAlign:"center"},children:"#"}),t.invoiceMode==="labor"||t.invoiceMode==="construction"?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Worker / Job Description"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Total Hrs"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Rate/Hour"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]}):t.invoiceMode==="service"?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Service Description"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Rate"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"SKU / Description / الوصف"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Unit Price"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Disc %"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]})]})}),e.jsx("tbody",{children:i.map((m,P)=>{const z=H(m.quantity),p=t.invoiceMode==="labor"||t.invoiceMode==="construction"?H(m.ratePerHour??m.unitPrice):H(m.unitPrice),C=H(m.totalHours??z),A=t.invoiceMode==="labor"||t.invoiceMode==="construction"?C*p:z*p,x=H(m.discountPercent??0),T=A*(x/100),y=A-T,j=H(m.taxPercent),b=y*(j/100),E=m.totalAmount&&H(m.totalAmount)||y+b;return e.jsxs("tr",{children:[e.jsx("td",{style:{textAlign:"center"},children:e.jsx("span",{className:"inv-row-num",children:P+1})}),e.jsxs("td",{children:[e.jsxs("div",{className:"inv-item-desc",children:[m.sku&&e.jsxs("span",{style:{color:"#64748b",fontFamily:"monospace",fontSize:11},children:["[",m.sku,"] "]}),m.description]}),m.descriptionAr&&e.jsx("div",{className:"inv-item-desc-ar",children:m.descriptionAr})]}),t.invoiceMode==="labor"||t.invoiceMode==="construction"?e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:m.unit||"d"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:C.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(p)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(b)}),e.jsx("td",{className:"inv-table-number",children:F(y+b)})]}):t.invoiceMode==="service"?e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:m.unit||"service"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:z.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(p)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(b)}),e.jsx("td",{className:"inv-table-number",children:F(y+b)})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:m.unit||"pcs"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:z.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(p)}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:x>0?`${x}%`:"—"}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(b)}),e.jsx("td",{className:"inv-table-number",children:F(E)})]})]},m.id??P)})})]})}),e.jsxs("div",{className:"inv-footer-grid",children:[e.jsxs("div",{children:[e.jsx("div",{className:"inv-totals",style:{marginBottom:12},children:e.jsxs("div",{className:"inv-totals-row",style:{background:"#f8fafc",flexDirection:"column",alignItems:"flex-start",gap:4},children:[e.jsx("span",{className:"inv-totals-label",style:{fontSize:10,textTransform:"uppercase",letterSpacing:".05em"},children:"Amount in Words / المبلغ بالكلمات"}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#1e293b",lineHeight:1.4},children:Pr(N)}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#1e293b",direction:"rtl",lineHeight:1.4},children:Er(N)})]})}),(t.notes||t.terms||r.invoiceTerms)&&e.jsxs("div",{className:"inv-notes",children:[e.jsx("div",{style:{fontWeight:700,marginBottom:6,color:"#6d28d9"},children:"Terms & Notes / الشروط والملاحظات"}),e.jsx("div",{style:{lineHeight:1.7},children:t.notes||t.terms||r.invoiceTerms})]})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{className:"inv-totals",children:[e.jsxs("div",{className:"inv-totals-row inv-totals-row-sub",children:[e.jsx("span",{className:"inv-totals-label",children:"Subtotal / المجموع الفرعي"}),e.jsxs("span",{className:"inv-totals-value",children:[F(g)," ",c]})]}),H(t.discountAmount)>0&&e.jsxs("div",{className:"inv-totals-row",style:{background:"#fefce8"},children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Discount / الخصم"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#ca8a04"},children:["-",F(t.discountAmount)," ",c]})]}),e.jsxs("div",{className:"inv-totals-row",style:{background:"#f8fafc"},children:[e.jsx("span",{className:"inv-totals-label",children:"Taxable Amount / المبلغ الخاضع للضريبة"}),e.jsxs("span",{className:"inv-totals-value",children:[F(H(t.taxableAmount)||g)," ",c]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-vat",children:[e.jsxs("span",{className:"inv-totals-label",children:["VAT ",v,"% / ضريبة القيمة المضافة"]}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#059669"},children:[F(w)," ",c]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-total",children:[e.jsx("span",{className:"inv-totals-label-white",children:"GRAND TOTAL / الإجمالي الكلي"}),e.jsxs("span",{className:"inv-totals-value-big",children:[F(N)," ",c]})]}),L>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-paid",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Paid / المدفوع"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#854d0e"},children:[F(L)," ",c]})]}),H(t.balanceDue)>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[F(t.balanceDue)," ",c]})]}),L<=0&&H(t.balanceDue)<=0&&S>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[F(S)," ",c]})]})]}),d&&e.jsxs("div",{className:"inv-qr-box",children:[e.jsx("img",{src:d,alt:"ZATCA QR",className:"inv-qr-img"}),e.jsx("div",{className:"inv-qr-label",children:"ZATCA Phase 2 QR Code"}),e.jsx("div",{className:"inv-qr-label-ar",children:"رمز الاستجابة السريعة - هيئة الزكاة والضريبة"})]})]})]}),e.jsxs("div",{className:"inv-compliance",children:[e.jsx("div",{style:{textAlign:"center",marginBottom:14},children:e.jsx("span",{style:{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#64748b",background:"#f1f5f9",padding:"4px 16px",borderRadius:100},children:"⚖️ Saudi Arabia — ZATCA Compliance Information / معلومات الامتثال الضريبي"})}),e.jsxs("div",{className:"inv-compliance-grid",children:[e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-zatca",children:[e.jsx("div",{className:"inv-compliance-label",children:"🏛 ZATCA VAT Number"}),e.jsx("div",{className:"inv-compliance-value",children:r.taxNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"الرقم الضريبي للبائع"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-vat",children:[e.jsx("div",{className:"inv-compliance-label",children:"📋 Commercial Registration"}),e.jsx("div",{className:"inv-compliance-value",children:r.crNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"السجل التجاري"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-cr",children:[e.jsx("div",{className:"inv-compliance-label",children:"🔐 ZATCA Status"}),e.jsxs("div",{className:"inv-compliance-value",style:{color:f.color},children:[f.label," / ",t.zatcaStatus??"Pending"]}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"حالة ZATCA"})]})]}),t.hash&&e.jsxs("div",{style:{marginTop:14,padding:"8px 14px",borderRadius:10,background:"#f8fafc",border:"1px solid #e2e8f0",fontSize:10,color:"#64748b",wordBreak:"break-all",textAlign:"center"},children:[e.jsx("strong",{children:"Invoice Hash / تجزئة الفاتورة:"})," ",t.hash]})]}),r.website&&e.jsx("div",{style:{textAlign:"center",marginTop:16,fontSize:11,color:"#64748b"},children:r.website}),e.jsxs("div",{className:"inv-watermark",children:["This invoice was generated in compliance with Saudi Arabia's ZATCA e-Invoicing Phase 2 regulations.",e.jsx("br",{}),"تم إنشاء هذه الفاتورة وفقًا لأنظمة الفوترة الإلكترونية للمرحلة الثانية من هيئة الزكاة والضريبة والجمارك"]})]})]})]})});Bn.displayName="SaudiInvoicePrint";function Wr(){const{data:t,refetch:r}=_.sales.invoiceList.useQuery(void 0),{data:l}=_.sales.customerList.useQuery(void 0),{data:i,refetch:n}=_.inventory.productList.useQuery(void 0),{data:a,refetch:d}=_.inventory.categoryList.useQuery(void 0),{data:o}=_.settings.companySettingsGet.useQuery(),c=_.sales.invoiceCreate.useMutation({onSuccess:()=>{R.success("Bill created"),kt(),r()},onError:s=>R.error(s.message)}),u=_.sales.invoiceUpdate.useMutation({onSuccess:()=>{r(),R.success("Invoice updated")},onError:s=>R.error(s.message)}),h=_.sales.invoiceDelete.useMutation({onSuccess:()=>{r(),R.success("Invoice deleted")},onError:s=>R.error(s.message)});_.sales.invoiceUpdateStatus.useMutation({onSuccess:()=>r()}),_.zatca.generateXml.useMutation({onSuccess:()=>{R.success("ZATCA UBL XML generated"),r()},onError:s=>R.error(s.message)}),_.zatca.generateQrCode.useMutation({onSuccess:()=>{R.success("ZATCA QR generated"),r()},onError:s=>R.error(s.message)}),_.zatca.signInvoice.useMutation({onSuccess:()=>{R.success("Invoice signed"),r()},onError:s=>R.error(s.message)}),_.zatca.clearanceInvoice.useMutation({onSuccess:()=>R.success("ZATCA clearance logged"),onError:s=>R.error(s.message)}),_.zatca.reportInvoice.useMutation({onSuccess:()=>R.success("ZATCA reporting logged"),onError:s=>R.error(s.message)}),_.zatca.syncStatus.useMutation({onSuccess:()=>R.success("ZATCA status synced"),onError:s=>R.error(s.message)}),_.whatsapp.sendInvoiceCreated.useMutation({onSuccess:()=>R.success("Invoice sent on WhatsApp"),onError:s=>R.error(s.message)});const f=_.inventory.productCreate.useMutation({onSuccess:()=>{n(),R.success("Product added")},onError:s=>R.error(s.message)}),v=_.inventory.categoryCreate.useMutation({onSuccess:()=>{d(),R.success("Category created")},onError:s=>R.error(s.message)}),g=_.thermalPrint.generateThermal.useMutation({onSuccess:s=>{try{const k=atob(s.data),D=new Uint8Array(k.length);for(let se=0;se<k.length;se++)D[se]=k.charCodeAt(se);const B=new Blob([D],{type:"application/octet-stream"}),K=URL.createObjectURL(B),ae=document.createElement("a");ae.href=K,ae.download=`receipt-${s.format}.bin`,ae.click(),R.success(`Thermal receipt (${s.format}) ready to print`)}catch{R.error("Failed to process thermal data")}},onError:s=>R.error(s.message)}),[w,N]=M.useState([]),[L,S]=M.useState(0),[I,m]=M.useState(""),[P,z]=M.useState(""),[p,C]=M.useState(""),[A,x]=M.useState(""),[T,y]=M.useState(0),[j,b]=M.useState(""),[E,X]=M.useState(""),[ie,fe]=M.useState(!1),[ge,je]=M.useState(-1),le=M.useRef(null),[$,te]=M.useState(null),[ce,me]=M.useState(null),[ne,xe]=M.useState(null),[O,J]=M.useState(""),[Y,re]=M.useState("create"),[ve,bt]=M.useState("standard"),[Mn,Be]=M.useState(!1),[Me,vt]=M.useState(""),[yt,wt]=M.useState(""),[Nt,jt]=M.useState(""),[Ct,At]=M.useState(""),[Re,ze]=M.useState(void 0),[Rn,Ce]=M.useState(!1),[De,Le]=M.useState(""),[St,qe]=M.useState("");M.useRef(null);const V=_.sales.invoiceGet.useQuery({id:$??ne},{enabled:!!$||!!ne}),W=o?.defaultCurrency||"SAR",ye=Number(o?.vatRate??15),Ae=o?.companyName||o?.companyNameAr||"Company Name",Se=o?.companyNameAr||"",Fe=o?.address||"",Ue=o?.phone||"",Te=o?.taxNumber||o?.vatNumber||"",_e=o?.logo||"",zn=o?.country||"",ke=w.reduce((s,k)=>s+k.price*k.qty,0),Ve=Math.max(0,ke-T),Pe=Ve*ye/100,He=Ve+Pe,Dn=(i||[]).filter(s=>!E||(s.name||"").toLowerCase().includes(E.toLowerCase())),we=(l||[]).filter(s=>!I||(s.name||"").toLowerCase().includes(I.toLowerCase())).slice(0,10);M.useEffect(()=>{const s=k=>{le.current&&!le.current.contains(k.target)&&fe(!1)};return document.addEventListener("click",s),()=>document.removeEventListener("click",s)},[]);const Ln=s=>{N(k=>k.find(B=>B.id===s.id)?k.map(B=>B.id===s.id?{...B,qty:B.qty+1}:B):[...k,{id:s.id,name:s.name||"Item",price:Number(s.price||0),qty:1,sku:s.sku}])},Tt=(s,k)=>{N(D=>D.map((B,K)=>K===s?{...B,qty:Math.max(1,B.qty+k)}:B))},qn=(s,k)=>{N(D=>D.map((B,K)=>K===s?{...B,price:Math.max(0,parseFloat(k)||0)}:B))},Fn=(s,k)=>{N(D=>D.map((B,K)=>K===s?{...B,name:k}:B))},Un=s=>{N(k=>k.filter((D,B)=>B!==s))},kt=()=>{N([]),S(0),m(""),z(""),C(""),x(""),y(0),b("")},Pt=s=>{S(s.id),m(s.name||""),C(s.address||""),x(s.vatNumber||""),z(s.phone||""),fe(!1)},_n=()=>{const s=De.trim();s&&v.mutate({name:s,image:St||void 0},{onSuccess:k=>{ze(k.id),Ce(!1),Le(""),qe("")}})},Vn=()=>{const s=Me.trim();if(!s){R.error("Enter product name");return}f.mutate({sku:`PRD-${Date.now().toString().slice(-6)}`,name:s,purchasePrice:yt||"0",salePrice:Nt||"0",image:Ct||void 0,categoryId:Re},{onSuccess:()=>{Be(!1),vt(""),wt(""),jt(""),At(""),ze(void 0),Ce(!1),Le(""),qe("")}})},Hn=s=>{if(s.preventDefault(),!w.length){R.error("Add at least one item to the cart");return}I.trim();const k=w.map(B=>({description:`[${B.id}] ${B.name}`,quantity:B.qty,unitPrice:B.price.toString(),taxPercent:ye.toString(),totalAmount:(B.price*B.qty).toFixed(2),unit:"pcs",sku:B.sku})),D={invoiceNumber:`BILL-${Date.now().toString().slice(-6)}`,customerId:L||0,date:new Date().toISOString().slice(0,10),dueDate:"",invoiceType:ve,invoiceMode:"product",subTotal:ke.toFixed(2),taxAmount:Pe.toFixed(2),taxPercent:ye.toString(),totalAmount:He.toFixed(2),discountAmount:T.toString(),taxableAmount:Ve.toFixed(2),notes:j,items:k};ce?u.mutate({id:ce,...D}):c.mutate(D)},Et=()=>{const s=!!$&&!!V.data,k=s?V.data.invoice:null,D=s?V.data.items||[]:[],B=s?V.data.customer:null,K=s?D.map((U,pe)=>({no:pe+1,name:U.description||`Item #${U.productId||U.id}`,qty:Number(U.quantity||1),rate:Number(U.unitPrice||0),total:Number(U.totalAmount||0)})):w.map((U,pe)=>({no:pe+1,name:U.name,qty:U.qty,rate:U.price,total:U.price*U.qty}));if(K.length===0){R.error("Add items to cart before printing");return}const ae=s?Number(k?.subTotal||0):ke,se=s?Number(k?.discountAmount||0):T,Mt=s?Number(k?.taxAmount||0):Pe,Rt=s?Number(k?.totalAmount||0):He,Kn=s?B?.name||B?.nameAr||"Walk-in Customer":I||"Walk-in Customer",zt=s?B?.phone:P,Dt=s?B?.address:p,Lt=s?B?.vatNumber||B?.taxNumber:A,qt=s?k?.invoiceType==="zatca"?"zatca":"standard":ve,Jn=btoa(JSON.stringify({seller:Se||Ae,vat:Te,total:Rt.toFixed(2),tax:Mt.toFixed(2),date:new Date().toISOString()})),Ft=`<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><title>Bill - ${Ae}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#f5f5f5;padding:10mm}
.invoice{max-width:800px;margin:0 auto;background:#fff;padding:20mm;box-shadow:0 0 10px rgba(0,0,0,.1)}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #1e3c72;padding-bottom:15px;margin-bottom:20px;gap:20px}
.qr-code{width:80px;height:80px;border:2px solid #000;padding:3px}
.company-info h1{font-size:20px;color:#1e3c72;font-weight:900}
.company-info h2{font-size:16px;color:#d4af37;font-weight:700}
.info-line{font-size:12px;color:#333;margin:2px 0}
.title{text-align:center;background:linear-gradient(135deg,#1e3c72,#2a5298);color:#fff;padding:12px;margin:15px 0;font-size:18px;font-weight:700;border-radius:5px}
.badge{display:inline-block;background:#d4af37;color:#1e3c72;font-size:10px;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px}
.customer{border:1px solid #ddd;padding:15px;margin:15px 0;border-radius:5px}
.customer h3{color:#1e3c72;margin-bottom:8px}
.customer p{margin:3px 0;font-size:13px}
table{width:100%;border-collapse:collapse;margin:20px 0}
thead{background:#1e3c72;color:#fff}
th{padding:10px;text-align:center;border:1px solid #fff;font-size:12px}
td{padding:8px;text-align:center;border:1px solid #ddd;font-size:12px}
tr:nth-child(even){background:#f9f9f9}
.totals{margin-top:20px;padding:15px;background:#f5f5f5;border-radius:5px}
.total-row{display:flex;justify-content:space-between;padding:8px 15px;font-size:14px}
.total-row.grand{background:linear-gradient(135deg,#d4af37,#f9d423);color:#1e3c72;font-weight:900;font-size:18px;border-radius:5px;margin-top:10px}
.qr-section{text-align:center;margin:15px 0;padding:15px;border:1px dashed #ccc;border-radius:5px}
.qr-section p{font-size:11px;color:#666;margin-top:5px}
.footer{margin-top:20px;text-align:center;padding:15px;border-top:2px solid #ddd;font-size:16px;font-weight:700;color:#1e3c72}
@media print{body{background:#fff;padding:0}.invoice{box-shadow:none;margin:0}}
</style></head><body>
<div class="invoice">
<div class="header">
<div class="company-info">
<h1>${Ae}</h1>${Se?`<h2>${Se}</h2>`:""}
${_e?`<img src="${_e}" style="max-width:60px;max-height:40px">`:""}
${Fe?`<div class="info-line">${Fe}</div>`:""}
${Ue?`<div class="info-line">${Ue}</div>`:""}
${Te?`<div class="info-line"><strong>VAT: ${Te}</strong></div>`:""}
</div>
<div class="qr-section" style="width:120px">
<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(Jn)}" style="width:100px;height:100px">
<p>${qt==="zatca"?"ZATCA QR":"Invoice QR"}</p>
</div>
</div>
<div class="title">TAX INVOICE / فاتورة ضريبية<span class="badge">${qt==="zatca"?"ZATCA":"Standard"}</span></div>
<div class="customer">
<h3>Customer / العميل</h3>
<p><strong>${Kn}</strong></p>
${zt?`<p>Phone: ${zt}</p>`:""}
${Dt?`<p>Address: ${Dt}</p>`:""}
${Lt?`<p>VAT: ${Lt}</p>`:""}
</div>
<table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
${K.map(U=>`<tr><td>${U.no}</td><td>${U.name}</td><td>${U.qty}</td><td>${U.rate.toFixed(2)}</td><td>${U.total.toFixed(2)}</td></tr>`).join("")}
</tbody></table>
<div class="totals">
<div class="total-row"><span>Subtotal:</span><span>${W} ${ae.toFixed(2)}</span></div>
${se>0?`<div class="total-row"><span>Discount:</span><span>-${W} ${se.toFixed(2)}</span></div>`:""}
<div class="total-row"><span>VAT ${ye}%:</span><span>${W} ${Mt.toFixed(2)}</span></div>
<div class="total-row grand"><span>TOTAL:</span><span>${W} ${Rt.toFixed(2)}</span></div>
</div>
${j?`<div style="margin-top:15px;padding:10px;background:#f9f9fa;border-radius:5px;font-size:13px"><strong>Note:</strong> ${j}</div>`:""}
<div class="footer">شكراً لتعاملكم معنا / Thank You For Your Business!</div>
</div>
<script>window.onload=function(){window.print();}<\/script></body></html>`,Oe=window.open("","_blank");if(!Oe){const U=new Blob([Ft],{type:"text/html"}),pe=URL.createObjectURL(U),Qe=document.createElement("a");Qe.href=pe,Qe.target="_blank",Qe.click(),URL.revokeObjectURL(pe);return}Oe.document.write(Ft),Oe.document.close()},On=s=>{te(s),me(null),N([]),S(0),m(""),z(""),C(""),x(""),y(0),b("")},It=s=>{xe(s),te(null)};M.useEffect(()=>{if(!ne)return;const s=V.data;if(!s||!s.invoice||s.invoice.id!==ne)return;const k=s.invoice;me(k.id),xe(null),re("create"),N((s.items||[]).map((D,B)=>({id:String(D.productId||`-${B}`),name:(D.description||"Item").replace(/^\[\d+\]\s*/,""),price:Number(D.unitPrice||0),qty:Number(D.quantity||1),sku:D.sku}))),S(s.customer?.id||0),m(s.customer?.name||""),z(s.customer?.phone||""),C(s.customer?.address||""),x(s.customer?.vatNumber||s.customer?.taxNumber||""),y(Number(k.discountAmount||0)),b(k.notes||"")},[ne,V.data]);const Bt=(s,k="a4")=>{k==="thermal"?g.mutate({invoiceId:s,format:"80mm"}):te(s)},Qn=s=>{window.confirm("Delete this invoice? This cannot be undone.")&&h.mutate(s)},Wn={draft:"bg-slate-100 text-slate-700",sent:"bg-blue-100 text-blue-700",paid:"bg-emerald-100 text-emerald-700",partial:"bg-amber-100 text-amber-700",overdue:"bg-red-100 text-red-700",cancelled:"bg-gray-100 text-gray-700"},Ee=t?.filter(s=>!O||O==="all"||s.status===O)||[],q=V.data;return q?.invoice?.id,e.jsxs("div",{className:"h-screen flex flex-col",children:[e.jsx("div",{className:"p-4 border-b bg-white",children:e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold",children:"Invoices / فواتير"}),e.jsxs("p",{className:"text-slate-500 text-sm",children:[Ee.length," invoices"]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(Ot,{value:O,onValueChange:J,children:[e.jsx(Qt,{className:"w-36",children:e.jsx(Wt,{placeholder:"Filter by status"})}),e.jsxs(Kt,{children:[e.jsx(de,{value:"all",children:"All Status"}),e.jsx(de,{value:"draft",children:"Draft"}),e.jsx(de,{value:"sent",children:"Sent"}),e.jsx(de,{value:"paid",children:"Paid"}),e.jsx(de,{value:"overdue",children:"Overdue"})]})]}),e.jsxs("div",{className:"flex items-center gap-1 bg-slate-100 rounded-lg p-0.5",children:[e.jsx("button",{type:"button",onClick:()=>{re("create"),te(null),me(null)},className:`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${Y==="create"?"bg-white shadow text-blue-700":"text-slate-500 hover:text-slate-700"}`,children:"Create Bill"}),e.jsxs("button",{type:"button",onClick:()=>re("history"),className:`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${Y==="history"?"bg-white shadow text-blue-700":"text-slate-500 hover:text-slate-700"}`,children:["Invoice History (",Ee.length,")"]})]}),e.jsx(Q,{variant:"outline",size:"sm",onClick:()=>{kt(),me(null),te(null),re("create")},children:"New Bill"})]})]})}),Y==="create"&&e.jsxs("div",{className:"flex-1 overflow-hidden flex",children:[e.jsxs("div",{className:"w-1/2 border-r p-4 overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-4",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx(Gn,{className:"absolute left-3 top-2.5 h-4 w-4 text-slate-400"}),e.jsx(Z,{className:"pl-9",placeholder:"Search products...",value:E,onChange:s=>X(s.target.value)})]}),e.jsxs(Q,{variant:"outline",size:"sm",onClick:()=>Be(!0),children:[e.jsx(We,{className:"h-4 w-4 mr-1"})," Add Product"]})]}),e.jsx(Ut,{open:Mn,onOpenChange:Be,children:e.jsxs(_t,{children:[e.jsx(Vt,{children:e.jsx(Ht,{children:"Add Product"})}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx(G,{className:"text-xs",children:"Product Name"}),e.jsx(Z,{value:Me,onChange:s=>vt(s.target.value),placeholder:"e.g. Office Chair"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsxs(G,{className:"text-xs",children:["Buying Price (",W,")"]}),e.jsx(Z,{type:"number",value:yt,onChange:s=>wt(s.target.value),placeholder:"0.00"})]}),e.jsxs("div",{children:[e.jsxs(G,{className:"text-xs",children:["Sale Price (",W,")"]}),e.jsx(Z,{type:"number",value:Nt,onChange:s=>jt(s.target.value),placeholder:"0.00"})]})]}),e.jsxs("div",{children:[e.jsx(G,{className:"text-xs",children:"Cover Image"}),e.jsx(Jt,{value:Ct,onChange:At})]}),e.jsxs("div",{children:[e.jsx(G,{className:"text-xs",children:"Category"}),e.jsxs(Ot,{value:Re?String(Re):void 0,onValueChange:s=>{if(s==="__new"){Ce(!0);return}ze(Number(s)),Ce(!1)},children:[e.jsx(Qt,{children:e.jsx(Wt,{placeholder:"Select category"})}),e.jsxs(Kt,{children:[a?.map(s=>e.jsx(de,{value:String(s.id),children:s.name},s.id)),e.jsx(de,{value:"__new",children:"+ New Category"})]})]}),Rn&&e.jsxs("div",{className:"mt-2 space-y-2",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx(Z,{value:De,onChange:s=>Le(s.target.value),placeholder:"Category name",className:"h-8 text-xs"}),e.jsx(Q,{size:"sm",onClick:_n,disabled:!De.trim()||v.isPending,children:"Add"})]}),e.jsx(Jt,{value:St,onChange:qe})]})]}),e.jsxs(Q,{className:"w-full",onClick:Vn,disabled:!Me.trim()||f.isPending,children:[e.jsx(We,{className:"h-4 w-4 mr-2"})," Add Product"]})]})]})}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3",children:[!i?.length&&e.jsxs("div",{className:"col-span-full text-center py-10 text-slate-400",children:["No products yet.",e.jsx("br",{}),e.jsx("span",{className:"text-blue-500 font-medium",children:'Click "Add Product" to create one.'})]}),Dn.map(s=>e.jsxs("button",{onClick:()=>Ln({id:String(s.id),name:s.name||"",price:Number(s.salePrice||s.price||0),sku:s.sku}),className:"border-2 border-slate-200 rounded-lg p-3 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors active:scale-95",children:[s.image?e.jsx("img",{src:s.image,alt:s.name,className:"w-full h-20 object-cover rounded-md mb-1.5"}):e.jsx("div",{className:"w-full h-20 rounded-md mb-1.5 bg-slate-100 flex items-center justify-center text-slate-300",children:e.jsx(Xn,{className:"h-8 w-8"})}),s.category&&e.jsx("div",{className:"text-[10px] text-slate-400 mb-1",children:s.category}),e.jsx("div",{className:"text-xs font-semibold text-slate-700 line-clamp-2 min-h-[32px]",children:s.name}),e.jsxs("div",{className:"text-sm font-bold text-emerald-600 mt-2",children:[W," ",Number(s.salePrice||s.price||0).toFixed(2)]})]},s.id))]})]}),e.jsxs("div",{className:"w-1/2 p-4 overflow-y-auto",children:[e.jsx("h3",{className:"font-semibold text-slate-800 mb-3",children:"Create Bill"}),e.jsxs("div",{className:"mb-3 relative",ref:le,children:[e.jsx(G,{className:"text-xs",children:"Customer Name"}),e.jsx(Z,{placeholder:"Type customer name...",value:I,onChange:s=>{m(s.target.value),fe(s.target.value.length>=2)},onKeyDown:s=>{!ie||!we.length||(s.key==="ArrowDown"?(s.preventDefault(),je(k=>Math.min(k+1,we.length-1))):s.key==="ArrowUp"?(s.preventDefault(),je(k=>Math.max(k-1,0))):s.key==="Enter"&&ge>=0?(s.preventDefault(),Pt(we[ge])):s.key==="Escape"&&fe(!1))}}),ie&&we.length>0&&e.jsx("div",{className:"absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-b-lg max-h-40 overflow-y-auto z-50 shadow-lg",children:we.map((s,k)=>e.jsxs("div",{className:`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 ${k===ge?"bg-blue-50":""}`,onClick:()=>Pt({id:s.id,name:s.name,address:s.address,vatNumber:s.vatNumber,phone:s.phone}),children:[e.jsx("div",{className:"font-medium",children:s.name}),e.jsxs("div",{className:"text-[11px] text-slate-400",children:[s.vatNumber?`VAT: ${s.vatNumber}`:""," ",s.address?`· ${s.address}`:""]})]},s.id))})]}),e.jsxs("div",{className:"space-y-1 mb-3",children:[e.jsx(G,{className:"text-xs",children:"Phone"}),e.jsx(Z,{value:P,onChange:s=>z(s.target.value),placeholder:"Optional"})]}),e.jsxs("div",{className:"space-y-1 mb-3",children:[e.jsx(G,{className:"text-xs",children:"Address"}),e.jsx(Z,{value:p,onChange:s=>C(s.target.value),placeholder:"Optional"})]}),e.jsxs("div",{className:"space-y-1 mb-3",children:[e.jsx(G,{className:"text-xs",children:"Customer VAT Reg. No. (رقم ضريبي)"}),e.jsx(Z,{value:A,onChange:s=>x(s.target.value),placeholder:"e.g. 311777758600003"})]}),e.jsxs("div",{className:"border-t pt-3 max-h-[300px] overflow-y-auto space-y-2",children:[w.length===0&&e.jsxs("div",{className:"text-center py-8 text-slate-400 text-sm",children:["Cart is empty.",e.jsx("br",{}),"Select products or add custom item."]}),w.map((s,k)=>e.jsxs("div",{className:"flex items-center gap-2 border-b pb-2",children:[e.jsx("input",{className:"flex-1 min-w-0 border rounded px-2 py-1 text-xs font-medium",value:s.name,onChange:D=>Fn(k,D.target.value)}),e.jsx("input",{type:"number",className:"w-16 text-center border rounded px-1 py-1 text-xs",value:s.price,onChange:D=>qn(k,D.target.value)}),e.jsx("button",{onClick:()=>Tt(k,-1),className:"w-6 h-6 border rounded flex items-center justify-center hover:bg-slate-100",children:e.jsx(rr,{className:"h-3 w-3"})}),e.jsx("input",{type:"number",className:"w-10 text-center border rounded px-1 py-1 text-xs",value:s.qty,onChange:D=>{const B=Math.max(1,parseInt(D.target.value)||1);N(K=>K.map((ae,se)=>se===k?{...ae,qty:B}:ae))}}),e.jsx("button",{onClick:()=>Tt(k,1),className:"w-6 h-6 border rounded flex items-center justify-center hover:bg-slate-100",children:e.jsx(We,{className:"h-3 w-3"})}),e.jsx("div",{className:"text-xs font-semibold text-slate-700 w-16 text-right",children:(s.price*s.qty).toFixed(2)}),e.jsx("button",{onClick:()=>Un(k),className:"text-red-500 hover:text-red-700",children:e.jsx(Yt,{className:"h-3.5 w-3.5"})})]},k))]}),e.jsxs("div",{className:"border-t pt-3 space-y-1 text-sm",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Subtotal:"}),e.jsxs("span",{children:[W," ",ke.toFixed(2)]})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:"Discount:"}),e.jsx(Z,{type:"number",className:"w-20 h-7 text-xs text-right",value:T,onChange:s=>y(parseFloat(s.target.value)||0)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("span",{children:["VAT (",ye,"%):"]}),e.jsxs("span",{children:[W," ",Pe.toFixed(2)]})]}),e.jsxs("div",{className:"flex justify-between font-bold text-base border-t pt-2",children:[e.jsx("span",{children:"Total:"}),e.jsxs("span",{className:"text-emerald-600",children:[W," ",He.toFixed(2)]})]})]}),e.jsxs("div",{className:"mt-3",children:[e.jsx(G,{className:"text-xs",children:"Note"}),e.jsx(Z,{value:j,onChange:s=>b(s.target.value),placeholder:"Optional",className:"h-8 text-xs"})]}),e.jsxs("div",{className:"mt-3 p-3 rounded-lg border bg-slate-50",children:[e.jsx(G,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Invoice Type / نوع الفاتورة"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:()=>bt("standard"),className:`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition-all ${ve==="standard"?"bg-blue-600 text-white border-blue-600":"bg-white text-slate-600 border-slate-300 hover:bg-slate-100"}`,children:"📄 Standard"}),e.jsx("button",{type:"button",onClick:()=>bt("zatca"),className:`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition-all ${ve==="zatca"?"bg-emerald-600 text-white border-emerald-600":"bg-white text-slate-600 border-slate-300 hover:bg-slate-100"}`,children:"🇸🇦 ZATCA"})]}),e.jsx("p",{className:"text-[10px] text-slate-400 mt-1",children:ve==="zatca"?"ZATCA compliant (TLV QR + XML). Requires valid VAT number in Settings.":"Standard invoice with QR code. Works without ZATCA setup."})]}),e.jsxs("div",{className:"flex gap-2 mt-4",children:[e.jsxs(Q,{className:"flex-1",onClick:Hn,disabled:c.isPending||u.isPending,children:[e.jsx($n,{className:"h-4 w-4 mr-2"})," ",ce?"Update":"Create Bill"]}),e.jsx(Q,{variant:"outline",onClick:Et,disabled:!w.length&&!($&&V.data),children:e.jsx(Ke,{className:"h-4 w-4"})})]})]})]}),Y==="history"&&e.jsx("div",{className:"flex-1 overflow-y-auto p-4",children:Ee.length===0?e.jsxs("div",{className:"text-center py-16 text-slate-400",children:["No invoices found.",e.jsx("br",{}),e.jsx("span",{className:"text-blue-500 font-medium cursor-pointer",onClick:()=>re("create"),children:"Click here to create a new bill"})]}):e.jsx("div",{className:"grid md:grid-cols-2 xl:grid-cols-3 gap-4",children:Ee.map(s=>e.jsxs("div",{className:"border rounded-xl p-4 bg-white hover:shadow-md transition-shadow",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"font-mono text-sm font-bold text-blue-700",children:s.invoiceNumber}),e.jsx("span",{className:`text-xs px-2 py-0.5 rounded-full font-medium ${Wn[s.status]||"bg-slate-100 text-slate-700"}`,children:s.status})]}),e.jsxs("div",{className:"text-xs text-slate-500 mb-3",children:[new Date(s.date).toLocaleDateString()," · ",s.invoiceType]}),e.jsx("div",{className:"text-sm text-slate-700 mb-1",children:s.customerName||"Walk-in Customer"}),e.jsxs("div",{className:"text-lg font-bold text-emerald-600 mb-3",children:[W," ",Number(s.totalAmount||0).toFixed(2)]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(Q,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>On(s.id),children:[e.jsx(tr,{className:"h-3.5 w-3.5 mr-1"})," View"]}),e.jsxs(Q,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>It(s.id),children:[e.jsx(Zt,{className:"h-3.5 w-3.5 mr-1"})," Edit"]}),e.jsxs("div",{className:"relative group flex-1",children:[e.jsxs(Q,{size:"sm",variant:"outline",className:"w-full",disabled:g.isPending,children:[e.jsx(Ke,{className:"h-3.5 w-3.5 mr-1"})," ",g.isPending?"...":"Print"]}),e.jsxs("div",{className:"absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50",children:[e.jsx("button",{className:"block w-full text-left px-3 py-2 text-xs hover:bg-blue-50 font-medium",onClick:()=>Bt(s.id,"a4"),children:"📄 A4 PDF"}),e.jsx("button",{className:"block w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 border-t font-medium",onClick:()=>Bt(s.id,"thermal"),children:"🖨️ 80mm Receipt"})]})]}),e.jsx(Q,{size:"sm",variant:"outline",className:"text-red-500 hover:text-red-600 hover:border-red-300",onClick:()=>Qn(s.id),children:e.jsx(Yt,{className:"h-3.5 w-3.5"})})]})]},s.id))})}),e.jsx(Ut,{open:!!$,onOpenChange:s=>{s||(te(null),xe(null))},children:e.jsxs(_t,{className:"max-w-4xl max-h-[90vh] overflow-y-auto",children:[e.jsx(Vt,{children:e.jsxs(Ht,{className:"flex items-center justify-between",children:[e.jsxs("span",{children:["Invoice ",q?.invoice?.invoiceNumber||"Loading..."]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("div",{className:"relative group",children:[e.jsxs(Q,{size:"sm",variant:"outline",disabled:V.isPending||!q?.invoice||g.isPending,children:[e.jsx(Ke,{className:"h-4 w-4 mr-1"})," ",g.isPending?"...":"Print"]}),e.jsxs("div",{className:"absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50",children:[e.jsx("button",{className:"block w-full text-left px-3 py-2 text-xs hover:bg-blue-50 font-medium",onClick:Et,children:"📄 A4 PDF"}),e.jsx("button",{className:"block w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 border-t font-medium",disabled:!q?.invoice,onClick:()=>q?.invoice&&g.mutate({invoiceId:q.invoice.id,format:"80mm"}),children:"🖨️ 80mm Receipt"})]})]}),e.jsxs(Q,{size:"sm",variant:"outline",onClick:()=>q?.invoice&&It(q.invoice.id),disabled:V.isPending||!q?.invoice,children:[e.jsx(Zt,{className:"h-4 w-4 mr-1"})," Edit"]})]})]})}),V.isPending&&e.jsxs("div",{className:"py-12 text-center",children:[e.jsx("div",{className:"inline-block animate-spin",children:e.jsx(er,{className:"h-8 w-8 text-blue-500"})}),e.jsx("p",{className:"mt-3 text-slate-600 font-medium",children:"Loading invoice details..."})]}),V.isError&&e.jsxs("div",{className:"py-8 px-4 bg-red-50 border border-red-200 rounded-lg",children:[e.jsx("p",{className:"text-red-700 font-medium",children:"Error loading invoice"}),e.jsx("p",{className:"text-red-600 text-sm mt-1",children:V.error?.message||"Failed to fetch invoice details"}),e.jsx(Q,{size:"sm",className:"mt-3",onClick:()=>V.refetch(),children:"Retry"})]}),q?.invoice&&!V.isPending&&e.jsx(Bn,{invoice:q.invoice,company:{companyName:Ae,companyNameAr:Se,address:Fe,city:o?.city,country:zn,phone:Ue,taxNumber:Te,crNumber:o?.crNumber,logo:_e,defaultCurrency:W},customer:{name:q.customer?.name||"Walk-in Customer",nameAr:q.customer?.nameAr,address:q.customer?.address,city:q.customer?.city,phone:q.customer?.phone,email:q.customer?.email,taxNumber:q.customer?.vatNumber||q.customer?.taxNumber,crNumber:q.customer?.crNumber},items:(q.items||[]).map(s=>({id:s.id,description:s.description||"",quantity:Number(s.quantity||1),unitPrice:s.unitPrice,taxPercent:s.taxPercent,totalAmount:s.totalAmount,unit:s.unit,sku:s.sku,discountPercent:s.discountPercent}))}),!q?.invoice&&!V.isPending&&!V.isError&&e.jsx("div",{className:"py-8 text-center text-slate-500",children:e.jsx("p",{children:"No invoice data available"})})]})})]})}export{Wr as default};
