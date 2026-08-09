import{j as e}from"./ui-2_2xY0sS.js";import{g as hn,r as R}from"./vendor-Dj4APJbq.js";import{c as gn,K as q,B as ae,au as mn,a9 as Q,aj as pn,ak as xn,al as vn,am as bn,P as yn,aw as wn}from"./index-pNl0IAyz.js";import{L as W}from"./label-CReZ9-n8.js";import{t as D}from"./index-C7Qn3gX3.js";import{S as gt,a as mt,b as pt,c as xt,d as ee}from"./select-D9_zdCTo.js";import{I as vt}from"./ImageUpload-FG_-8jbb.js";import{P as Be}from"./plus-DxMiDM8O.js";import{T as jn}from"./trash-2-C8L4F4G4.js";import{P as Nn}from"./printer-BrNCoy4a.js";import"./query-C_GIT_zP.js";import"./charts-CClYrlZQ.js";const Cn=[["path",{d:"M5 12h14",key:"1ays0h"}]],An=gn("minus",Cn);var oe={},Me,bt;function Sn(){return bt||(bt=1,Me=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then}),Me}var Re={},$={},yt;function te(){if(yt)return $;yt=1;let t;const r=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];return $.getSymbolSize=function(i){if(!i)throw new Error('"version" cannot be null or undefined');if(i<1||i>40)throw new Error('"version" should be in range from 1 to 40');return i*4+17},$.getSymbolTotalCodewords=function(i){return r[i]},$.getBCHDigit=function(a){let i=0;for(;a!==0;)i++,a>>>=1;return i},$.setToSJISFunction=function(i){if(typeof i!="function")throw new Error('"toSJISFunc" is not a valid function.');t=i},$.isKanjiModeEnabled=function(){return typeof t<"u"},$.toSJIS=function(i){return t(i)},$}var ze={},wt;function nt(){return wt||(wt=1,(function(t){t.L={bit:1},t.M={bit:0},t.Q={bit:3},t.H={bit:2};function r(a){if(typeof a!="string")throw new Error("Param is not a string");switch(a.toLowerCase()){case"l":case"low":return t.L;case"m":case"medium":return t.M;case"q":case"quartile":return t.Q;case"h":case"high":return t.H;default:throw new Error("Unknown EC Level: "+a)}}t.isValid=function(i){return i&&typeof i.bit<"u"&&i.bit>=0&&i.bit<4},t.from=function(i,n){if(t.isValid(i))return i;try{return r(i)}catch{return n}}})(ze)),ze}var De,jt;function Tn(){if(jt)return De;jt=1;function t(){this.buffer=[],this.length=0}return t.prototype={get:function(r){const a=Math.floor(r/8);return(this.buffer[a]>>>7-r%8&1)===1},put:function(r,a){for(let i=0;i<a;i++)this.putBit((r>>>a-i-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(r){const a=Math.floor(this.length/8);this.buffer.length<=a&&this.buffer.push(0),r&&(this.buffer[a]|=128>>>this.length%8),this.length++}},De=t,De}var Le,Nt;function En(){if(Nt)return Le;Nt=1;function t(r){if(!r||r<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=r,this.data=new Uint8Array(r*r),this.reservedBit=new Uint8Array(r*r)}return t.prototype.set=function(r,a,i,n){const s=r*this.size+a;this.data[s]=i,n&&(this.reservedBit[s]=!0)},t.prototype.get=function(r,a){return this.data[r*this.size+a]},t.prototype.xor=function(r,a,i){this.data[r*this.size+a]^=i},t.prototype.isReserved=function(r,a){return this.reservedBit[r*this.size+a]},Le=t,Le}var Fe={},Ct;function Pn(){return Ct||(Ct=1,(function(t){const r=te().getSymbolSize;t.getRowColCoords=function(i){if(i===1)return[];const n=Math.floor(i/7)+2,s=r(i),c=s===145?26:Math.ceil((s-13)/(2*n-2))*2,o=[s-7];for(let l=1;l<n-1;l++)o[l]=o[l-1]-c;return o.push(6),o.reverse()},t.getPositions=function(i){const n=[],s=t.getRowColCoords(i),c=s.length;for(let o=0;o<c;o++)for(let l=0;l<c;l++)o===0&&l===0||o===0&&l===c-1||o===c-1&&l===0||n.push([s[o],s[l]]);return n}})(Fe)),Fe}var qe={},At;function kn(){if(At)return qe;At=1;const t=te().getSymbolSize,r=7;return qe.getPositions=function(i){const n=t(i);return[[0,0],[n-r,0],[0,n-r]]},qe}var Ue={},St;function In(){return St||(St=1,(function(t){t.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const r={N1:3,N2:3,N3:40,N4:10};t.isValid=function(n){return n!=null&&n!==""&&!isNaN(n)&&n>=0&&n<=7},t.from=function(n){return t.isValid(n)?parseInt(n,10):void 0},t.getPenaltyN1=function(n){const s=n.size;let c=0,o=0,l=0,f=null,u=null;for(let h=0;h<s;h++){o=l=0,f=u=null;for(let p=0;p<s;p++){let g=n.get(h,p);g===f?o++:(o>=5&&(c+=r.N1+(o-5)),f=g,o=1),g=n.get(p,h),g===u?l++:(l>=5&&(c+=r.N1+(l-5)),u=g,l=1)}o>=5&&(c+=r.N1+(o-5)),l>=5&&(c+=r.N1+(l-5))}return c},t.getPenaltyN2=function(n){const s=n.size;let c=0;for(let o=0;o<s-1;o++)for(let l=0;l<s-1;l++){const f=n.get(o,l)+n.get(o,l+1)+n.get(o+1,l)+n.get(o+1,l+1);(f===4||f===0)&&c++}return c*r.N2},t.getPenaltyN3=function(n){const s=n.size;let c=0,o=0,l=0;for(let f=0;f<s;f++){o=l=0;for(let u=0;u<s;u++)o=o<<1&2047|n.get(f,u),u>=10&&(o===1488||o===93)&&c++,l=l<<1&2047|n.get(u,f),u>=10&&(l===1488||l===93)&&c++}return c*r.N3},t.getPenaltyN4=function(n){let s=0;const c=n.data.length;for(let l=0;l<c;l++)s+=n.data[l];return Math.abs(Math.ceil(s*100/c/5)-10)*r.N4};function a(i,n,s){switch(i){case t.Patterns.PATTERN000:return(n+s)%2===0;case t.Patterns.PATTERN001:return n%2===0;case t.Patterns.PATTERN010:return s%3===0;case t.Patterns.PATTERN011:return(n+s)%3===0;case t.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(s/3))%2===0;case t.Patterns.PATTERN101:return n*s%2+n*s%3===0;case t.Patterns.PATTERN110:return(n*s%2+n*s%3)%2===0;case t.Patterns.PATTERN111:return(n*s%3+(n+s)%2)%2===0;default:throw new Error("bad maskPattern:"+i)}}t.applyMask=function(n,s){const c=s.size;for(let o=0;o<c;o++)for(let l=0;l<c;l++)s.isReserved(l,o)||s.xor(l,o,a(n,l,o))},t.getBestMask=function(n,s){const c=Object.keys(t.Patterns).length;let o=0,l=1/0;for(let f=0;f<c;f++){s(f),t.applyMask(f,n);const u=t.getPenaltyN1(n)+t.getPenaltyN2(n)+t.getPenaltyN3(n)+t.getPenaltyN4(n);t.applyMask(f,n),u<l&&(l=u,o=f)}return o}})(Ue)),Ue}var we={},Tt;function Yt(){if(Tt)return we;Tt=1;const t=nt(),r=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],a=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];return we.getBlocksCount=function(n,s){switch(s){case t.L:return r[(n-1)*4+0];case t.M:return r[(n-1)*4+1];case t.Q:return r[(n-1)*4+2];case t.H:return r[(n-1)*4+3];default:return}},we.getTotalCodewordsCount=function(n,s){switch(s){case t.L:return a[(n-1)*4+0];case t.M:return a[(n-1)*4+1];case t.Q:return a[(n-1)*4+2];case t.H:return a[(n-1)*4+3];default:return}},we}var _e={},he={},Et;function Bn(){if(Et)return he;Et=1;const t=new Uint8Array(512),r=new Uint8Array(256);return(function(){let i=1;for(let n=0;n<255;n++)t[n]=i,r[i]=n,i<<=1,i&256&&(i^=285);for(let n=255;n<512;n++)t[n]=t[n-255]})(),he.log=function(i){if(i<1)throw new Error("log("+i+")");return r[i]},he.exp=function(i){return t[i]},he.mul=function(i,n){return i===0||n===0?0:t[r[i]+r[n]]},he}var Pt;function Mn(){return Pt||(Pt=1,(function(t){const r=Bn();t.mul=function(i,n){const s=new Uint8Array(i.length+n.length-1);for(let c=0;c<i.length;c++)for(let o=0;o<n.length;o++)s[c+o]^=r.mul(i[c],n[o]);return s},t.mod=function(i,n){let s=new Uint8Array(i);for(;s.length-n.length>=0;){const c=s[0];for(let l=0;l<n.length;l++)s[l]^=r.mul(n[l],c);let o=0;for(;o<s.length&&s[o]===0;)o++;s=s.slice(o)}return s},t.generateECPolynomial=function(i){let n=new Uint8Array([1]);for(let s=0;s<i;s++)n=t.mul(n,new Uint8Array([1,r.exp(s)]));return n}})(_e)),_e}var Ve,kt;function Rn(){if(kt)return Ve;kt=1;const t=Mn();function r(a){this.genPoly=void 0,this.degree=a,this.degree&&this.initialize(this.degree)}return r.prototype.initialize=function(i){this.degree=i,this.genPoly=t.generateECPolynomial(this.degree)},r.prototype.encode=function(i){if(!this.genPoly)throw new Error("Encoder not initialized");const n=new Uint8Array(i.length+this.degree);n.set(i);const s=t.mod(n,this.genPoly),c=this.degree-s.length;if(c>0){const o=new Uint8Array(this.degree);return o.set(s,c),o}return s},Ve=r,Ve}var He={},Oe={},Qe={},It;function Zt(){return It||(It=1,Qe.isValid=function(r){return!isNaN(r)&&r>=1&&r<=40}),Qe}var J={},Bt;function Gt(){if(Bt)return J;Bt=1;const t="[0-9]+",r="[A-Z $%*+\\-./:]+";let a="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";a=a.replace(/u/g,"\\u");const i="(?:(?![A-Z0-9 $%*+\\-./:]|"+a+`)(?:.|[\r
]))+`;J.KANJI=new RegExp(a,"g"),J.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),J.BYTE=new RegExp(i,"g"),J.NUMERIC=new RegExp(t,"g"),J.ALPHANUMERIC=new RegExp(r,"g");const n=new RegExp("^"+a+"$"),s=new RegExp("^"+t+"$"),c=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");return J.testKanji=function(l){return n.test(l)},J.testNumeric=function(l){return s.test(l)},J.testAlphanumeric=function(l){return c.test(l)},J}var Mt;function ne(){return Mt||(Mt=1,(function(t){const r=Zt(),a=Gt();t.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},t.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},t.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},t.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},t.MIXED={bit:-1},t.getCharCountIndicator=function(s,c){if(!s.ccBits)throw new Error("Invalid mode: "+s);if(!r.isValid(c))throw new Error("Invalid version: "+c);return c>=1&&c<10?s.ccBits[0]:c<27?s.ccBits[1]:s.ccBits[2]},t.getBestModeForData=function(s){return a.testNumeric(s)?t.NUMERIC:a.testAlphanumeric(s)?t.ALPHANUMERIC:a.testKanji(s)?t.KANJI:t.BYTE},t.toString=function(s){if(s&&s.id)return s.id;throw new Error("Invalid mode")},t.isValid=function(s){return s&&s.bit&&s.ccBits};function i(n){if(typeof n!="string")throw new Error("Param is not a string");switch(n.toLowerCase()){case"numeric":return t.NUMERIC;case"alphanumeric":return t.ALPHANUMERIC;case"kanji":return t.KANJI;case"byte":return t.BYTE;default:throw new Error("Unknown mode: "+n)}}t.from=function(s,c){if(t.isValid(s))return s;try{return i(s)}catch{return c}}})(Oe)),Oe}var Rt;function zn(){return Rt||(Rt=1,(function(t){const r=te(),a=Yt(),i=nt(),n=ne(),s=Zt(),c=7973,o=r.getBCHDigit(c);function l(p,g,C){for(let E=1;E<=40;E++)if(g<=t.getCapacity(E,C,p))return E}function f(p,g){return n.getCharCountIndicator(p,g)+4}function u(p,g){let C=0;return p.forEach(function(E){const M=f(E.mode,g);C+=M+E.getBitsLength()}),C}function h(p,g){for(let C=1;C<=40;C++)if(u(p,C)<=t.getCapacity(C,g,n.MIXED))return C}t.from=function(g,C){return s.isValid(g)?parseInt(g,10):C},t.getCapacity=function(g,C,E){if(!s.isValid(g))throw new Error("Invalid QR Code version");typeof E>"u"&&(E=n.BYTE);const M=r.getSymbolTotalCodewords(g),A=a.getTotalCodewordsCount(g,C),k=(M-A)*8;if(E===n.MIXED)return k;const m=k-f(E,g);switch(E){case n.NUMERIC:return Math.floor(m/10*3);case n.ALPHANUMERIC:return Math.floor(m/11*2);case n.KANJI:return Math.floor(m/13);case n.BYTE:default:return Math.floor(m/8)}},t.getBestVersionForData=function(g,C){let E;const M=i.from(C,i.M);if(Array.isArray(g)){if(g.length>1)return h(g,M);if(g.length===0)return 1;E=g[0]}else E=g;return l(E.mode,E.getLength(),M)},t.getEncodedBits=function(g){if(!s.isValid(g)||g<7)throw new Error("Invalid QR Code version");let C=g<<12;for(;r.getBCHDigit(C)-o>=0;)C^=c<<r.getBCHDigit(C)-o;return g<<12|C}})(He)),He}var Ke={},zt;function Dn(){if(zt)return Ke;zt=1;const t=te(),r=1335,a=21522,i=t.getBCHDigit(r);return Ke.getEncodedBits=function(s,c){const o=s.bit<<3|c;let l=o<<10;for(;t.getBCHDigit(l)-i>=0;)l^=r<<t.getBCHDigit(l)-i;return(o<<10|l)^a},Ke}var We={},Je,Dt;function Ln(){if(Dt)return Je;Dt=1;const t=ne();function r(a){this.mode=t.NUMERIC,this.data=a.toString()}return r.getBitsLength=function(i){return 10*Math.floor(i/3)+(i%3?i%3*3+1:0)},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(i){let n,s,c;for(n=0;n+3<=this.data.length;n+=3)s=this.data.substr(n,3),c=parseInt(s,10),i.put(c,10);const o=this.data.length-n;o>0&&(s=this.data.substr(n),c=parseInt(s,10),i.put(c,o*3+1))},Je=r,Je}var Ye,Lt;function Fn(){if(Lt)return Ye;Lt=1;const t=ne(),r=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function a(i){this.mode=t.ALPHANUMERIC,this.data=i}return a.getBitsLength=function(n){return 11*Math.floor(n/2)+6*(n%2)},a.prototype.getLength=function(){return this.data.length},a.prototype.getBitsLength=function(){return a.getBitsLength(this.data.length)},a.prototype.write=function(n){let s;for(s=0;s+2<=this.data.length;s+=2){let c=r.indexOf(this.data[s])*45;c+=r.indexOf(this.data[s+1]),n.put(c,11)}this.data.length%2&&n.put(r.indexOf(this.data[s]),6)},Ye=a,Ye}var Ze,Ft;function qn(){if(Ft)return Ze;Ft=1;const t=ne();function r(a){this.mode=t.BYTE,typeof a=="string"?this.data=new TextEncoder().encode(a):this.data=new Uint8Array(a)}return r.getBitsLength=function(i){return i*8},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(a){for(let i=0,n=this.data.length;i<n;i++)a.put(this.data[i],8)},Ze=r,Ze}var Ge,qt;function Un(){if(qt)return Ge;qt=1;const t=ne(),r=te();function a(i){this.mode=t.KANJI,this.data=i}return a.getBitsLength=function(n){return n*13},a.prototype.getLength=function(){return this.data.length},a.prototype.getBitsLength=function(){return a.getBitsLength(this.data.length)},a.prototype.write=function(i){let n;for(n=0;n<this.data.length;n++){let s=r.toSJIS(this.data[n]);if(s>=33088&&s<=40956)s-=33088;else if(s>=57408&&s<=60351)s-=49472;else throw new Error("Invalid SJIS character: "+this.data[n]+`
Make sure your charset is UTF-8`);s=(s>>>8&255)*192+(s&255),i.put(s,13)}},Ge=a,Ge}var Xe={exports:{}},Ut;function _n(){return Ut||(Ut=1,(function(t){var r={single_source_shortest_paths:function(a,i,n){var s={},c={};c[i]=0;var o=r.PriorityQueue.make();o.push(i,0);for(var l,f,u,h,p,g,C,E,M;!o.empty();){l=o.pop(),f=l.value,h=l.cost,p=a[f]||{};for(u in p)p.hasOwnProperty(u)&&(g=p[u],C=h+g,E=c[u],M=typeof c[u]>"u",(M||E>C)&&(c[u]=C,o.push(u,C),s[u]=f))}if(typeof n<"u"&&typeof c[n]>"u"){var A=["Could not find a path from ",i," to ",n,"."].join("");throw new Error(A)}return s},extract_shortest_path_from_predecessor_list:function(a,i){for(var n=[],s=i;s;)n.push(s),a[s],s=a[s];return n.reverse(),n},find_path:function(a,i,n){var s=r.single_source_shortest_paths(a,i,n);return r.extract_shortest_path_from_predecessor_list(s,n)},PriorityQueue:{make:function(a){var i=r.PriorityQueue,n={},s;a=a||{};for(s in i)i.hasOwnProperty(s)&&(n[s]=i[s]);return n.queue=[],n.sorter=a.sorter||i.default_sorter,n},default_sorter:function(a,i){return a.cost-i.cost},push:function(a,i){var n={value:a,cost:i};this.queue.push(n),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};t.exports=r})(Xe)),Xe.exports}var _t;function Vn(){return _t||(_t=1,(function(t){const r=ne(),a=Ln(),i=Fn(),n=qn(),s=Un(),c=Gt(),o=te(),l=_n();function f(A){return unescape(encodeURIComponent(A)).length}function u(A,k,m){const S=[];let z;for(;(z=A.exec(m))!==null;)S.push({data:z[0],index:z.index,mode:k,length:z[0].length});return S}function h(A){const k=u(c.NUMERIC,r.NUMERIC,A),m=u(c.ALPHANUMERIC,r.ALPHANUMERIC,A);let S,z;return o.isKanjiModeEnabled()?(S=u(c.BYTE,r.BYTE,A),z=u(c.KANJI,r.KANJI,A)):(S=u(c.BYTE_KANJI,r.BYTE,A),z=[]),k.concat(m,S,z).sort(function(N,y){return N.index-y.index}).map(function(N){return{data:N.data,mode:N.mode,length:N.length}})}function p(A,k){switch(k){case r.NUMERIC:return a.getBitsLength(A);case r.ALPHANUMERIC:return i.getBitsLength(A);case r.KANJI:return s.getBitsLength(A);case r.BYTE:return n.getBitsLength(A)}}function g(A){return A.reduce(function(k,m){const S=k.length-1>=0?k[k.length-1]:null;return S&&S.mode===m.mode?(k[k.length-1].data+=m.data,k):(k.push(m),k)},[])}function C(A){const k=[];for(let m=0;m<A.length;m++){const S=A[m];switch(S.mode){case r.NUMERIC:k.push([S,{data:S.data,mode:r.ALPHANUMERIC,length:S.length},{data:S.data,mode:r.BYTE,length:S.length}]);break;case r.ALPHANUMERIC:k.push([S,{data:S.data,mode:r.BYTE,length:S.length}]);break;case r.KANJI:k.push([S,{data:S.data,mode:r.BYTE,length:f(S.data)}]);break;case r.BYTE:k.push([{data:S.data,mode:r.BYTE,length:f(S.data)}])}}return k}function E(A,k){const m={},S={start:{}};let z=["start"];for(let x=0;x<A.length;x++){const N=A[x],y=[];for(let v=0;v<N.length;v++){const T=N[v],w=""+x+v;y.push(w),m[w]={node:T,lastCount:0},S[w]={};for(let j=0;j<z.length;j++){const b=z[j];m[b]&&m[b].node.mode===T.mode?(S[b][w]=p(m[b].lastCount+T.length,T.mode)-p(m[b].lastCount,T.mode),m[b].lastCount+=T.length):(m[b]&&(m[b].lastCount=T.length),S[b][w]=p(T.length,T.mode)+4+r.getCharCountIndicator(T.mode,k))}}z=y}for(let x=0;x<z.length;x++)S[z[x]].end=0;return{map:S,table:m}}function M(A,k){let m;const S=r.getBestModeForData(A);if(m=r.from(k,S),m!==r.BYTE&&m.bit<S.bit)throw new Error('"'+A+'" cannot be encoded with mode '+r.toString(m)+`.
 Suggested mode is: `+r.toString(S));switch(m===r.KANJI&&!o.isKanjiModeEnabled()&&(m=r.BYTE),m){case r.NUMERIC:return new a(A);case r.ALPHANUMERIC:return new i(A);case r.KANJI:return new s(A);case r.BYTE:return new n(A)}}t.fromArray=function(k){return k.reduce(function(m,S){return typeof S=="string"?m.push(M(S,null)):S.data&&m.push(M(S.data,S.mode)),m},[])},t.fromString=function(k,m){const S=h(k,o.isKanjiModeEnabled()),z=C(S),x=E(z,m),N=l.find_path(x.map,"start","end"),y=[];for(let v=1;v<N.length-1;v++)y.push(x.table[N[v]].node);return t.fromArray(g(y))},t.rawSplit=function(k){return t.fromArray(h(k,o.isKanjiModeEnabled()))}})(We)),We}var Vt;function Hn(){if(Vt)return Re;Vt=1;const t=te(),r=nt(),a=Tn(),i=En(),n=Pn(),s=kn(),c=In(),o=Yt(),l=Rn(),f=zn(),u=Dn(),h=ne(),p=Vn();function g(x,N){const y=x.size,v=s.getPositions(N);for(let T=0;T<v.length;T++){const w=v[T][0],j=v[T][1];for(let b=-1;b<=7;b++)if(!(w+b<=-1||y<=w+b))for(let P=-1;P<=7;P++)j+P<=-1||y<=j+P||(b>=0&&b<=6&&(P===0||P===6)||P>=0&&P<=6&&(b===0||b===6)||b>=2&&b<=4&&P>=2&&P<=4?x.set(w+b,j+P,!0,!0):x.set(w+b,j+P,!1,!0))}}function C(x){const N=x.size;for(let y=8;y<N-8;y++){const v=y%2===0;x.set(y,6,v,!0),x.set(6,y,v,!0)}}function E(x,N){const y=n.getPositions(N);for(let v=0;v<y.length;v++){const T=y[v][0],w=y[v][1];for(let j=-2;j<=2;j++)for(let b=-2;b<=2;b++)j===-2||j===2||b===-2||b===2||j===0&&b===0?x.set(T+j,w+b,!0,!0):x.set(T+j,w+b,!1,!0)}}function M(x,N){const y=x.size,v=f.getEncodedBits(N);let T,w,j;for(let b=0;b<18;b++)T=Math.floor(b/3),w=b%3+y-8-3,j=(v>>b&1)===1,x.set(T,w,j,!0),x.set(w,T,j,!0)}function A(x,N,y){const v=x.size,T=u.getEncodedBits(N,y);let w,j;for(w=0;w<15;w++)j=(T>>w&1)===1,w<6?x.set(w,8,j,!0):w<8?x.set(w+1,8,j,!0):x.set(v-15+w,8,j,!0),w<8?x.set(8,v-w-1,j,!0):w<9?x.set(8,15-w-1+1,j,!0):x.set(8,15-w-1,j,!0);x.set(v-8,8,1,!0)}function k(x,N){const y=x.size;let v=-1,T=y-1,w=7,j=0;for(let b=y-1;b>0;b-=2)for(b===6&&b--;;){for(let P=0;P<2;P++)if(!x.isReserved(T,b-P)){let V=!1;j<N.length&&(V=(N[j]>>>w&1)===1),x.set(T,b-P,V),w--,w===-1&&(j++,w=7)}if(T+=v,T<0||y<=T){T-=v,v=-v;break}}}function m(x,N,y){const v=new a;y.forEach(function(P){v.put(P.mode.bit,4),v.put(P.getLength(),h.getCharCountIndicator(P.mode,x)),P.write(v)});const T=t.getSymbolTotalCodewords(x),w=o.getTotalCodewordsCount(x,N),j=(T-w)*8;for(v.getLengthInBits()+4<=j&&v.put(0,4);v.getLengthInBits()%8!==0;)v.putBit(0);const b=(j-v.getLengthInBits())/8;for(let P=0;P<b;P++)v.put(P%2?17:236,8);return S(v,x,N)}function S(x,N,y){const v=t.getSymbolTotalCodewords(N),T=o.getTotalCodewordsCount(N,y),w=v-T,j=o.getBlocksCount(N,y),b=v%j,P=j-b,V=Math.floor(v/j),Y=Math.floor(w/j),ge=Y+1,re=V-Y,me=new l(re);let le=0;const G=new Array(j),pe=new Array(j);let X=0;const je=new Uint8Array(x.buffer);for(let Z=0;Z<j;Z++){const se=Z<P?Y:ge;G[Z]=je.slice(le,le+se),pe[Z]=me.encode(G[Z]),le+=se,X=Math.max(X,se)}const ce=new Uint8Array(v);let ie=0,H,O;for(H=0;H<X;H++)for(O=0;O<j;O++)H<G[O].length&&(ce[ie++]=G[O][H]);for(H=0;H<re;H++)for(O=0;O<j;O++)ce[ie++]=pe[O][H];return ce}function z(x,N,y,v){let T;if(Array.isArray(x))T=p.fromArray(x);else if(typeof x=="string"){let V=N;if(!V){const Y=p.rawSplit(x);V=f.getBestVersionForData(Y,y)}T=p.fromString(x,V||40)}else throw new Error("Invalid data");const w=f.getBestVersionForData(T,y);if(!w)throw new Error("The amount of data is too big to be stored in a QR Code");if(!N)N=w;else if(N<w)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+w+`.
`);const j=m(N,y,T),b=t.getSymbolSize(N),P=new i(b);return g(P,N),C(P),E(P,N),A(P,y,0),N>=7&&M(P,N),k(P,j),isNaN(v)&&(v=c.getBestMask(P,A.bind(null,P,y))),c.applyMask(v,P),A(P,y,v),{modules:P,version:N,errorCorrectionLevel:y,maskPattern:v,segments:T}}return Re.create=function(N,y){if(typeof N>"u"||N==="")throw new Error("No input text");let v=r.M,T,w;return typeof y<"u"&&(v=r.from(y.errorCorrectionLevel,r.M),T=f.from(y.version),w=c.from(y.maskPattern),y.toSJISFunc&&t.setToSJISFunction(y.toSJISFunc)),z(N,T,v,w)},Re}var $e={},et={},Ht;function Xt(){return Ht||(Ht=1,(function(t){function r(a){if(typeof a=="number"&&(a=a.toString()),typeof a!="string")throw new Error("Color should be defined as hex string");let i=a.slice().replace("#","").split("");if(i.length<3||i.length===5||i.length>8)throw new Error("Invalid hex color: "+a);(i.length===3||i.length===4)&&(i=Array.prototype.concat.apply([],i.map(function(s){return[s,s]}))),i.length===6&&i.push("F","F");const n=parseInt(i.join(""),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:n&255,hex:"#"+i.slice(0,6).join("")}}t.getOptions=function(i){i||(i={}),i.color||(i.color={});const n=typeof i.margin>"u"||i.margin===null||i.margin<0?4:i.margin,s=i.width&&i.width>=21?i.width:void 0,c=i.scale||4;return{width:s,scale:s?4:c,margin:n,color:{dark:r(i.color.dark||"#000000ff"),light:r(i.color.light||"#ffffffff")},type:i.type,rendererOpts:i.rendererOpts||{}}},t.getScale=function(i,n){return n.width&&n.width>=i+n.margin*2?n.width/(i+n.margin*2):n.scale},t.getImageWidth=function(i,n){const s=t.getScale(i,n);return Math.floor((i+n.margin*2)*s)},t.qrToImageData=function(i,n,s){const c=n.modules.size,o=n.modules.data,l=t.getScale(c,s),f=Math.floor((c+s.margin*2)*l),u=s.margin*l,h=[s.color.light,s.color.dark];for(let p=0;p<f;p++)for(let g=0;g<f;g++){let C=(p*f+g)*4,E=s.color.light;if(p>=u&&g>=u&&p<f-u&&g<f-u){const M=Math.floor((p-u)/l),A=Math.floor((g-u)/l);E=h[o[M*c+A]?1:0]}i[C++]=E.r,i[C++]=E.g,i[C++]=E.b,i[C]=E.a}}})(et)),et}var Ot;function On(){return Ot||(Ot=1,(function(t){const r=Xt();function a(n,s,c){n.clearRect(0,0,s.width,s.height),s.style||(s.style={}),s.height=c,s.width=c,s.style.height=c+"px",s.style.width=c+"px"}function i(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}t.render=function(s,c,o){let l=o,f=c;typeof l>"u"&&(!c||!c.getContext)&&(l=c,c=void 0),c||(f=i()),l=r.getOptions(l);const u=r.getImageWidth(s.modules.size,l),h=f.getContext("2d"),p=h.createImageData(u,u);return r.qrToImageData(p.data,s,l),a(h,f,u),h.putImageData(p,0,0),f},t.renderToDataURL=function(s,c,o){let l=o;typeof l>"u"&&(!c||!c.getContext)&&(l=c,c=void 0),l||(l={});const f=t.render(s,c,l),u=l.type||"image/png",h=l.rendererOpts||{};return f.toDataURL(u,h.quality)}})($e)),$e}var tt={},Qt;function Qn(){if(Qt)return tt;Qt=1;const t=Xt();function r(n,s){const c=n.a/255,o=s+'="'+n.hex+'"';return c<1?o+" "+s+'-opacity="'+c.toFixed(2).slice(1)+'"':o}function a(n,s,c){let o=n+s;return typeof c<"u"&&(o+=" "+c),o}function i(n,s,c){let o="",l=0,f=!1,u=0;for(let h=0;h<n.length;h++){const p=Math.floor(h%s),g=Math.floor(h/s);!p&&!f&&(f=!0),n[h]?(u++,h>0&&p>0&&n[h-1]||(o+=f?a("M",p+c,.5+g+c):a("m",l,0),l=0,f=!1),p+1<s&&n[h+1]||(o+=a("h",u),u=0)):l++}return o}return tt.render=function(s,c,o){const l=t.getOptions(c),f=s.modules.size,u=s.modules.data,h=f+l.margin*2,p=l.color.light.a?"<path "+r(l.color.light,"fill")+' d="M0 0h'+h+"v"+h+'H0z"/>':"",g="<path "+r(l.color.dark,"stroke")+' d="'+i(u,f,l.margin)+'"/>',C='viewBox="0 0 '+h+" "+h+'"',M='<svg xmlns="http://www.w3.org/2000/svg" '+(l.width?'width="'+l.width+'" height="'+l.width+'" ':"")+C+' shape-rendering="crispEdges">'+p+g+`</svg>
`;return typeof o=="function"&&o(null,M),M},tt}var Kt;function Kn(){if(Kt)return oe;Kt=1;const t=Sn(),r=Hn(),a=On(),i=Qn();function n(s,c,o,l,f){const u=[].slice.call(arguments,1),h=u.length,p=typeof u[h-1]=="function";if(!p&&!t())throw new Error("Callback required as last argument");if(p){if(h<2)throw new Error("Too few arguments provided");h===2?(f=o,o=c,c=l=void 0):h===3&&(c.getContext&&typeof f>"u"?(f=l,l=void 0):(f=l,l=o,o=c,c=void 0))}else{if(h<1)throw new Error("Too few arguments provided");return h===1?(o=c,c=l=void 0):h===2&&!c.getContext&&(l=o,o=c,c=void 0),new Promise(function(g,C){try{const E=r.create(o,l);g(s(E,c,l))}catch(E){C(E)}})}try{const g=r.create(o,l);f(null,s(g,c,l))}catch(g){f(g)}}return oe.create=r.create,oe.toCanvas=n.bind(null,a.render),oe.toDataURL=n.bind(null,a.renderToDataURL),oe.toString=n.bind(null,function(s,c,o){return i.render(s,o)}),oe}var Wn=Kn();const Jn=hn(Wn),Yn="SAR";function _(t){return Number(t??0)}function L(t){return _(t).toLocaleString("en-SA",{minimumFractionDigits:2,maximumFractionDigits:2})}function Zn(t){return t==="simplified"}function Gn(t){if(t===0)return"Zero";const r=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],a=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],i=["","Thousand","Million","Billion"];function n(u){if(u===0)return"";const h=[];return u>=100&&(h.push(r[Math.floor(u/100)]+" Hundred"),u%=100),u>=20&&(h.push(a[Math.floor(u/10)]),u%=10),u>0&&h.push(r[u]),h.join(" ")}const s=Math.floor(t),c=Math.round((t-s)*100);let o="",l=0,f=s;for(;f>0;){const u=f%1e3;u>0&&(o=n(u)+(i[l]?" "+i[l]:"")+(o?" "+o:"")),f=Math.floor(f/1e3),l++}return o=o||"Zero",c>0&&(o+=` and ${c}/100`),o.trim()+" Saudi Riyals"}function Xn(t){if(t===0)return"صفر";const r=[["",""],["واحد","واحدة"],["اثنان","اثنتان"],["ثلاثة","ثلاث"],["أربعة","أربع"],["خمسة","خمس"],["ستة","ست"],["سبعة","سبع"],["ثمانية","ثمان"],["تسعة","تسع"],["عشرة","عشر"],["أحد عشر","إحدى عشرة"],["اثنا عشر","اثنتا عشرة"],["ثلاثة عشر","ثلاث عشرة"],["أربعة عشر","أربع عشرة"],["خمسة عشر","خمس عشرة"],["ستة عشر","ست عشرة"],["سبعة عشر","سبع عشرة"],["ثمانية عشر","ثماني عشرة"],["تسعة عشر","تسع عشرة"]],a=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],i=["","ألف","مليون","مليار"];function n(h,p){if(h===0)return"";const g=p?1:0,C=[];if(h>=100){const E=Math.floor(h/100);E===1?C.push("مائة"):E===2?C.push("مائتان"):C.push(r[E][0]+" مائة"),h%=100}return h>=20&&(C.push(a[Math.floor(h/10)]),h%=10),h>0&&C.push(r[h][g]),C.join(" و ")}const s=Math.floor(t),c=Math.round((t-s)*100);let o="",l=0,f=s;const u=[!1,!0,!1,!1];for(;f>0;){const h=f%1e3;if(h>0){const p=n(h,u[l]);h===1&&l===1?o="ألف"+(o?" "+o:""):h===2&&l===1?o="ألفان"+(o?" "+o:""):o=p+(i[l]?" "+i[l]:"")+(o?" و "+o:"")}f=Math.floor(f/1e3),l++}return o=o||"صفر",c>0&&(o+=` و ${c}/100`),o.trim()+" ريال سعودي"}function $n(t){if(!t)return"";try{return new Date(t).toLocaleDateString("ar-SA-u-ca-islamic",{year:"numeric",month:"long",day:"numeric"})}catch{return""}}const Wt={draft:{label:"Draft",labelAr:"مسودة",color:"#64748b"},sent:{label:"Sent",labelAr:"مُرسلة",color:"#3b82f6"},paid:{label:"Paid",labelAr:"مدفوعة",color:"#10b981"},partial:{label:"Partial",labelAr:"جزئي",color:"#f59e0b"},overdue:{label:"Overdue",labelAr:"متأخرة",color:"#ef4444"},cancelled:{label:"Cancelled",labelAr:"ملغاة",color:"#6b7280"}},Jt={cleared:{label:"Cleared",color:"#10b981"},reported:{label:"Reported",color:"#3b82f6"},pending:{label:"Pending",color:"#f59e0b"},failed:{label:"Failed",color:"#ef4444"}},er=R.forwardRef(({invoice:t,company:r,customer:a,items:i,className:n=""},s)=>{const[c,o]=R.useState("");R.useEffect(()=>{if(!t.zatcaQrCode){o("");return}Jn.toDataURL(t.zatcaQrCode,{errorCorrectionLevel:"M",margin:1,width:180,color:{dark:"#0f172a",light:"#ffffff"}}).then(o).catch(()=>o(""))},[t.zatcaQrCode]);const l=r.defaultCurrency??Yn,f=Zn(t.invoiceType),u=Wt[t.status??"draft"]??Wt.draft,h=Jt[t.zatcaStatus??"pending"]??Jt.pending,p=_(t.taxPercent??15),g=_(t.subTotal),C=_(t.taxAmount),E=_(t.totalAmount),M=_(t.paidAmount),A=E-M,k=$n(t.date);return e.jsxs("div",{ref:s,className:`saudi-invoice-root ${n}`,style:{fontFamily:"'Segoe UI', Tahoma, Arial, sans-serif"},children:[e.jsx("style",{children:`
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
        `}),e.jsxs("div",{className:"inv-page",children:[e.jsx("div",{className:"inv-header",children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1},children:[e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"flex-start"},children:[e.jsx("div",{className:"inv-logo-box",children:r.logo?e.jsx("img",{src:r.logo,alt:"logo"}):e.jsx("span",{style:{color:"white",fontWeight:800,fontSize:20},children:(r.companyName??"YA").slice(0,2).toUpperCase()})}),e.jsxs("div",{children:[e.jsx("div",{style:{color:"white",fontWeight:800,fontSize:20,lineHeight:1.2},children:r.companyName??"Company Name"}),r.companyNameAr&&e.jsx("div",{style:{color:"rgba(255,255,255,.8)",fontWeight:600,fontSize:14,direction:"rtl",marginTop:2},children:r.companyNameAr}),e.jsxs("div",{style:{color:"rgba(255,255,255,.65)",fontSize:11,marginTop:6,lineHeight:1.7},children:[r.address&&e.jsxs("div",{children:[r.address,r.city?`, ${r.city}`:""]}),r.phone&&e.jsx("div",{children:r.phone}),r.email&&e.jsx("div",{children:r.email})]})]})]}),e.jsxs("div",{style:{textAlign:"right"},children:[e.jsxs("div",{className:"inv-title-badge",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:"2.5",children:[e.jsx("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),e.jsx("polyline",{points:"14 2 14 8 20 8"})]}),e.jsx("span",{style:{color:"white",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"},children:f?"Simplified Tax Invoice":"Tax Invoice"})]}),e.jsx("div",{style:{color:"rgba(255,255,255,.9)",fontWeight:800,fontSize:18,direction:"rtl",marginBottom:4},children:f?"فاتورة ضريبية مبسطة":"فاتورة ضريبية"}),e.jsx("div",{style:{color:"rgba(255,255,255,.7)",fontFamily:"monospace",fontSize:16,fontWeight:700},children:t.invoiceNumber??"INV-000000"}),t.zatcaStatus&&e.jsx("div",{style:{marginTop:10},children:e.jsxs("span",{className:"inv-badge",style:{background:`${h.color}22`,border:`1.5px solid ${h.color}44`,color:h.color},children:[e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",background:h.color,display:"inline-block"}}),"ZATCA ",h.label]})}),e.jsx("div",{style:{marginTop:8},children:e.jsxs("span",{className:"inv-badge",style:{background:`${u.color}22`,border:`1.5px solid ${u.color}44`,color:u.color},children:[u.label," / ",u.labelAr]})})]})]})}),e.jsxs("div",{className:"inv-stats",children:[e.jsxs("div",{className:"inv-stat-box inv-stat-box-subtotal",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#2563eb"},children:"Subtotal / المجموع"}),e.jsx("div",{className:"inv-stat-value",style:{color:"#1d4ed8"},children:L(g)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#3b82f6"},children:l})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-vat",children:[e.jsxs("div",{className:"inv-stat-label",style:{color:"#059669"},children:["VAT ",p,"% / ضريبة القيمة"]}),e.jsx("div",{className:"inv-stat-value",style:{color:"#047857"},children:L(C)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#10b981"},children:l})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-total",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"rgba(255,255,255,.75)"},children:"TOTAL / الإجمالي"}),e.jsx("div",{className:"inv-stat-value",style:{color:"white"},children:L(E)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"rgba(255,255,255,.7)"},children:l})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-paid",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#d97706"},children:"Amount Due / المستحق"}),e.jsx("div",{className:"inv-stat-value",style:{color:A>0?"#dc2626":"#16a34a"},children:L(A)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#f59e0b"},children:l})]})]}),e.jsxs("div",{className:"inv-body",children:[e.jsxs("div",{className:"inv-info-grid",children:[e.jsxs("div",{className:"inv-info-card inv-info-card-seller",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#059669"},children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#059669",strokeWidth:"2.5",children:e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"})}),"Seller / البائع"]}),e.jsx("div",{className:"inv-card-name",children:r.companyName??"—"}),r.companyNameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#065f46"},children:r.companyNameAr}),e.jsxs("div",{className:"inv-card-text",children:[r.address&&e.jsxs("div",{children:[r.address,r.city?`, ${r.city}`:""]}),r.country&&e.jsx("div",{children:r.country}),r.phone&&e.jsxs("div",{children:["📞 ",r.phone]}),r.email&&e.jsxs("div",{children:["✉ ",r.email]})]}),r.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46"},children:["🏛 VAT: ",r.taxNumber]}),r.crNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46",marginTop:4},children:["📋 CR: ",r.crNumber]})]}),e.jsxs("div",{className:"inv-info-card inv-info-card-buyer",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#2563eb"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#2563eb",strokeWidth:"2.5",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),"Bill To / العميل"]}),e.jsx("div",{className:"inv-card-name",children:a.name??"—"}),a.nameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#1e40af"},children:a.nameAr}),e.jsxs("div",{className:"inv-card-text",children:[a.address&&e.jsxs("div",{children:[a.address,a.city?`, ${a.city}`:""]}),a.phone&&e.jsxs("div",{children:["📞 ",a.phone]}),a.email&&e.jsxs("div",{children:["✉ ",a.email]})]}),a.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#dbeafe",color:"#1e40af"},children:["🏛 Customer VAT: ",a.taxNumber]})]})]}),e.jsxs("div",{className:"inv-meta-row",style:{gridTemplateColumns:"repeat(6, 1fr)"},children:[e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",children:[e.jsx("div",{className:"inv-meta-label",children:"Invoice Type"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#0f172a",fontSize:10},children:t.invoiceType==="simplified"?"Simplified / مبسطة":t.invoiceType==="zatca"?"ZATCA / فاتورة ذاتكا":"Standard / قياسية"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",children:[e.jsx("div",{className:"inv-meta-label",children:"Issue Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#c2410c",fontSize:11},children:t.date??"—"}),k&&e.jsx("div",{style:{fontSize:9,color:"#9a3412",direction:"rtl",marginTop:1},children:k})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",style:{background:"#f0fdf4",borderColor:"#bbf7d0"},children:[e.jsx("div",{className:"inv-meta-label",children:"Issue Time"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#065f46",fontSize:11},children:t.time??"—"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-due",children:[e.jsx("div",{className:"inv-meta-label",children:"Due Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#b91c1c",fontSize:11},children:t.dueDate??"Upon Receipt"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-uuid",style:{background:"#faf5ff",borderColor:"#e9d5ff"},children:[e.jsx("div",{className:"inv-meta-label",children:t.workedMonth?"Worked Month":"Payment Method"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#6d28d9",fontSize:10},children:t.workedMonth??t.paymentMethod??"—"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",style:{background:"#fff7ed",borderColor:"#fed7aa"},children:[e.jsx("div",{className:"inv-meta-label",children:t.poNumber?"PO No.":t.cashier?"Cashier":"Created By"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#9a3412",fontSize:10},children:t.poNumber??t.cashier??t.createdBy??"—"})]})]}),(t.contractNumber||t.projectReference)&&e.jsxs("div",{style:{display:"flex",gap:12,marginBottom:16},children:[t.contractNumber&&e.jsxs("div",{style:{fontSize:11,color:"#475569",background:"#f1f5f9",padding:"4px 12px",borderRadius:6},children:[e.jsx("strong",{children:"Contract:"})," ",t.contractNumber]}),t.projectReference&&e.jsxs("div",{style:{fontSize:11,color:"#475569",background:"#f1f5f9",padding:"4px 12px",borderRadius:6},children:[e.jsx("strong",{children:"Project:"})," ",t.projectReference]})]}),e.jsx("div",{className:"inv-table-wrap",children:e.jsxs("table",{className:"inv-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:32,textAlign:"center"},children:"#"}),t.invoiceMode==="labor"||t.invoiceMode==="construction"?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Worker / Job Description"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Total Hrs"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Rate/Hour"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]}):t.invoiceMode==="service"?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Service Description"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Rate"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"SKU / Description / الوصف"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Unit Price"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Disc %"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]})]})}),e.jsx("tbody",{children:i.map((m,S)=>{const z=_(m.quantity),x=t.invoiceMode==="labor"||t.invoiceMode==="construction"?_(m.ratePerHour??m.unitPrice):_(m.unitPrice),N=_(m.totalHours??z),y=t.invoiceMode==="labor"||t.invoiceMode==="construction"?N*x:z*x,v=_(m.discountPercent??0),T=y*(v/100),w=y-T,j=_(m.taxPercent),b=w*(j/100),P=m.totalAmount&&_(m.totalAmount)||w+b;return e.jsxs("tr",{children:[e.jsx("td",{style:{textAlign:"center"},children:e.jsx("span",{className:"inv-row-num",children:S+1})}),e.jsxs("td",{children:[e.jsxs("div",{className:"inv-item-desc",children:[m.sku&&e.jsxs("span",{style:{color:"#64748b",fontFamily:"monospace",fontSize:11},children:["[",m.sku,"] "]}),m.description]}),m.descriptionAr&&e.jsx("div",{className:"inv-item-desc-ar",children:m.descriptionAr})]}),t.invoiceMode==="labor"||t.invoiceMode==="construction"?e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:m.unit||"d"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:N.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:L(x)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:L(b)}),e.jsx("td",{className:"inv-table-number",children:L(w+b)})]}):t.invoiceMode==="service"?e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:m.unit||"service"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:z.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:L(x)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:L(b)}),e.jsx("td",{className:"inv-table-number",children:L(w+b)})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:m.unit||"pcs"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:z.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:L(x)}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:v>0?`${v}%`:"—"}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:L(b)}),e.jsx("td",{className:"inv-table-number",children:L(P)})]})]},m.id??S)})})]})}),e.jsxs("div",{className:"inv-footer-grid",children:[e.jsxs("div",{children:[e.jsx("div",{className:"inv-totals",style:{marginBottom:12},children:e.jsxs("div",{className:"inv-totals-row",style:{background:"#f8fafc",flexDirection:"column",alignItems:"flex-start",gap:4},children:[e.jsx("span",{className:"inv-totals-label",style:{fontSize:10,textTransform:"uppercase",letterSpacing:".05em"},children:"Amount in Words / المبلغ بالكلمات"}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#1e293b",lineHeight:1.4},children:Gn(E)}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#1e293b",direction:"rtl",lineHeight:1.4},children:Xn(E)})]})}),(t.notes||t.terms||r.invoiceTerms)&&e.jsxs("div",{className:"inv-notes",children:[e.jsx("div",{style:{fontWeight:700,marginBottom:6,color:"#6d28d9"},children:"Terms & Notes / الشروط والملاحظات"}),e.jsx("div",{style:{lineHeight:1.7},children:t.notes||t.terms||r.invoiceTerms})]})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{className:"inv-totals",children:[e.jsxs("div",{className:"inv-totals-row inv-totals-row-sub",children:[e.jsx("span",{className:"inv-totals-label",children:"Subtotal / المجموع الفرعي"}),e.jsxs("span",{className:"inv-totals-value",children:[L(g)," ",l]})]}),_(t.discountAmount)>0&&e.jsxs("div",{className:"inv-totals-row",style:{background:"#fefce8"},children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Discount / الخصم"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#ca8a04"},children:["-",L(t.discountAmount)," ",l]})]}),e.jsxs("div",{className:"inv-totals-row",style:{background:"#f8fafc"},children:[e.jsx("span",{className:"inv-totals-label",children:"Taxable Amount / المبلغ الخاضع للضريبة"}),e.jsxs("span",{className:"inv-totals-value",children:[L(_(t.taxableAmount)||g)," ",l]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-vat",children:[e.jsxs("span",{className:"inv-totals-label",children:["VAT ",p,"% / ضريبة القيمة المضافة"]}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#059669"},children:[L(C)," ",l]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-total",children:[e.jsx("span",{className:"inv-totals-label-white",children:"GRAND TOTAL / الإجمالي الكلي"}),e.jsxs("span",{className:"inv-totals-value-big",children:[L(E)," ",l]})]}),M>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-paid",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Paid / المدفوع"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#854d0e"},children:[L(M)," ",l]})]}),_(t.balanceDue)>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[L(t.balanceDue)," ",l]})]}),M<=0&&_(t.balanceDue)<=0&&A>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[L(A)," ",l]})]})]}),c&&e.jsxs("div",{className:"inv-qr-box",children:[e.jsx("img",{src:c,alt:"ZATCA QR",className:"inv-qr-img"}),e.jsx("div",{className:"inv-qr-label",children:"ZATCA Phase 2 QR Code"}),e.jsx("div",{className:"inv-qr-label-ar",children:"رمز الاستجابة السريعة - هيئة الزكاة والضريبة"})]})]})]}),e.jsxs("div",{className:"inv-compliance",children:[e.jsx("div",{style:{textAlign:"center",marginBottom:14},children:e.jsx("span",{style:{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#64748b",background:"#f1f5f9",padding:"4px 16px",borderRadius:100},children:"⚖️ Saudi Arabia — ZATCA Compliance Information / معلومات الامتثال الضريبي"})}),e.jsxs("div",{className:"inv-compliance-grid",children:[e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-zatca",children:[e.jsx("div",{className:"inv-compliance-label",children:"🏛 ZATCA VAT Number"}),e.jsx("div",{className:"inv-compliance-value",children:r.taxNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"الرقم الضريبي للبائع"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-vat",children:[e.jsx("div",{className:"inv-compliance-label",children:"📋 Commercial Registration"}),e.jsx("div",{className:"inv-compliance-value",children:r.crNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"السجل التجاري"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-cr",children:[e.jsx("div",{className:"inv-compliance-label",children:"🔐 ZATCA Status"}),e.jsxs("div",{className:"inv-compliance-value",style:{color:h.color},children:[h.label," / ",t.zatcaStatus??"Pending"]}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"حالة ZATCA"})]})]}),t.hash&&e.jsxs("div",{style:{marginTop:14,padding:"8px 14px",borderRadius:10,background:"#f8fafc",border:"1px solid #e2e8f0",fontSize:10,color:"#64748b",wordBreak:"break-all",textAlign:"center"},children:[e.jsx("strong",{children:"Invoice Hash / تجزئة الفاتورة:"})," ",t.hash]})]}),r.website&&e.jsx("div",{style:{textAlign:"center",marginTop:16,fontSize:11,color:"#64748b"},children:r.website}),e.jsxs("div",{className:"inv-watermark",children:["This invoice was generated in compliance with Saudi Arabia's ZATCA e-Invoicing Phase 2 regulations.",e.jsx("br",{}),"تم إنشاء هذه الفاتورة وفقًا لأنظمة الفوترة الإلكترونية للمرحلة الثانية من هيئة الزكاة والضريبة والجمارك"]})]})]})]})});er.displayName="SaudiInvoicePrint";function gr(){const{data:t,refetch:r}=q.sales.invoiceList.useQuery(void 0),{data:a}=q.sales.customerList.useQuery(void 0),{data:i,refetch:n}=q.inventory.productList.useQuery(void 0),{data:s,refetch:c}=q.inventory.categoryList.useQuery(void 0),{data:o}=q.settings.companySettingsGet.useQuery(),l=q.sales.invoiceCreate.useMutation({onSuccess:()=>{r(),D.success("Bill created"),ft()},onError:d=>D.error(d.message)}),f=q.sales.invoiceUpdate.useMutation({onSuccess:()=>{r(),D.success("Invoice updated")},onError:d=>D.error(d.message)});q.sales.invoiceDelete.useMutation({onSuccess:()=>{r(),D.success("Invoice deleted")},onError:d=>D.error(d.message)}),q.sales.invoiceUpdateStatus.useMutation({onSuccess:()=>r()}),q.zatca.generateXml.useMutation({onSuccess:()=>{D.success("ZATCA UBL XML generated"),r()},onError:d=>D.error(d.message)}),q.zatca.generateQrCode.useMutation({onSuccess:()=>{D.success("ZATCA QR generated"),r()},onError:d=>D.error(d.message)}),q.zatca.signInvoice.useMutation({onSuccess:()=>{D.success("Invoice signed"),r()},onError:d=>D.error(d.message)}),q.zatca.clearanceInvoice.useMutation({onSuccess:()=>D.success("ZATCA clearance logged"),onError:d=>D.error(d.message)}),q.zatca.reportInvoice.useMutation({onSuccess:()=>D.success("ZATCA reporting logged"),onError:d=>D.error(d.message)}),q.zatca.syncStatus.useMutation({onSuccess:()=>D.success("ZATCA status synced"),onError:d=>D.error(d.message)}),q.whatsapp.sendInvoiceCreated.useMutation({onSuccess:()=>D.success("Invoice sent on WhatsApp"),onError:d=>D.error(d.message)});const u=q.inventory.productCreate.useMutation({onSuccess:()=>{n(),D.success("Product added")},onError:d=>D.error(d.message)}),h=q.inventory.categoryCreate.useMutation({onSuccess:()=>{c(),D.success("Category created")},onError:d=>D.error(d.message)}),[p,g]=R.useState([]),[C,E]=R.useState(0),[M,A]=R.useState(""),[k,m]=R.useState(""),[S,z]=R.useState(""),[x,N]=R.useState(""),[y,v]=R.useState(0),[T,w]=R.useState(""),[j,b]=R.useState(""),[P,V]=R.useState(!1),[Y,ge]=R.useState(-1),re=R.useRef(null),[me,le]=R.useState(null),[G,pe]=R.useState(null),[X,je]=R.useState(""),[ce,ie]=R.useState(!1),[H,O]=R.useState(""),[Z,se]=R.useState(""),[rt,it]=R.useState(""),[st,at]=R.useState(""),[Ne,Ce]=R.useState(void 0),[$t,xe]=R.useState(!1),[Ae,Se]=R.useState(""),[ot,Te]=R.useState("");R.useRef(null);const en=q.sales.invoiceGet.useQuery({id:me},{enabled:!!me}),K=o?.defaultCurrency||"SAR",de=Number(o?.vatRate??15),Ee=o?.companyName||o?.companyNameAr||"Company Name",Pe=o?.companyNameAr||"",lt=o?.address||"",ct=o?.phone||"",ke=o?.taxNumber||o?.vatNumber||"",dt=o?.logo||"";o?.country;const ve=p.reduce((d,I)=>d+I.price*I.qty,0),Ie=Math.max(0,ve-y),ue=Ie*de/100,be=Ie+ue,tn=(i||[]).filter(d=>!j||(d.name||"").toLowerCase().includes(j.toLowerCase())),fe=(a||[]).filter(d=>!M||(d.name||"").toLowerCase().includes(M.toLowerCase())).slice(0,10);R.useEffect(()=>{const d=I=>{re.current&&!re.current.contains(I.target)&&V(!1)};return document.addEventListener("click",d),()=>document.removeEventListener("click",d)},[]);const nn=d=>{g(I=>I.find(B=>B.id===d.id)?I.map(B=>B.id===d.id?{...B,qty:B.qty+1}:B):[...I,{id:d.id,name:d.name||"Item",price:Number(d.price||0),qty:1,sku:d.sku}])},ut=(d,I)=>{g(U=>U.map((B,F)=>F===d?{...B,qty:Math.max(1,B.qty+I)}:B))},rn=(d,I)=>{g(U=>U.map((B,F)=>F===d?{...B,price:Math.max(0,parseFloat(I)||0)}:B))},sn=(d,I)=>{g(U=>U.map((B,F)=>F===d?{...B,name:I}:B))},an=d=>{g(I=>I.filter((U,B)=>B!==d))},ft=()=>{g([]),E(0),A(""),m(""),z(""),N(""),v(0),w("")},ht=d=>{E(d.id),A(d.name||""),z(d.address||""),N(d.vatNumber||""),m(d.phone||""),V(!1)},on=()=>{const d=Ae.trim();d&&h.mutate({name:d,image:ot||void 0},{onSuccess:I=>{Ce(I.id),xe(!1),Se(""),Te("")}})},ln=()=>{const d=H.trim();if(!d){D.error("Enter product name");return}u.mutate({sku:`PRD-${Date.now().toString().slice(-6)}`,name:d,purchasePrice:Z||"0",salePrice:rt||"0",image:st||void 0,categoryId:Ne},{onSuccess:()=>{ie(!1),O(""),se(""),it(""),at(""),Ce(void 0),xe(!1),Se(""),Te("")}})},cn=d=>{if(d.preventDefault(),!p.length){D.error("Cart is empty");return}if(!M){D.error("Enter customer name");return}const I=p.map(B=>({description:`[${B.id}] ${B.name}`,quantity:B.qty,unitPrice:B.price.toString(),taxPercent:de.toString(),totalAmount:(B.price*B.qty).toFixed(2),unit:"pcs",sku:B.sku})),U={invoiceNumber:`BILL-${Date.now().toString().slice(-6)}`,customerId:C,date:new Date().toISOString().slice(0,10),dueDate:"",invoiceType:"standard",invoiceMode:"product",subTotal:ve.toFixed(2),taxAmount:ue.toFixed(2),taxPercent:de.toString(),totalAmount:be.toFixed(2),discountAmount:y.toString(),taxableAmount:Ie.toFixed(2),notes:T,items:I};G?f.mutate({id:G,...U}):l.mutate(U)},dn=()=>{const d=p.map((F,ye)=>({no:ye+1,name:F.name,qty:F.qty,rate:F.price,total:F.price*F.qty})),I=btoa(JSON.stringify({seller:Pe||Ee,vat:ke,total:be.toFixed(2),tax:ue.toFixed(2),date:new Date().toISOString()})),U=`<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><title>Bill - ${Ee}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#f5f5f5;padding:10mm}
.invoice{max-width:800px;margin:0 auto;background:#fff;padding:20mm;box-shadow:0 0 10px rgba(0,0,0,.1)}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #1e3c72;padding-bottom:15px;margin-bottom:20px;gap:20px}
.qr-code{width:80px;height:80px;border:2px solid #000;padding:3px}
.company-info h1{font-size:20px;color:#1e3c72;font-weight:900}
.company-info h2{font-size:16px;color:#d4af37;font-weight:700}
.info-line{font-size:12px;color:#333;margin:2px 0}
.title{text-align:center;background:linear-gradient(135deg,#1e3c72,#2a5298);color:#fff;padding:12px;margin:15px 0;font-size:18px;font-weight:700;border-radius:5px}
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
.footer{margin-top:20px;text-align:center;padding:15px;border-top:2px solid #ddd;font-size:16px;font-weight:700;color:#1e3c72}
@media print{body{background:#fff;padding:0}.invoice{box-shadow:none;margin:0}}
</style></head><body>
<div class="invoice">
<div class="header">
<div class="qr-code"><img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(I)}" style="width:100%"></div>
<div class="company-info">
<h1>${Ee}</h1>${Pe?`<h2>${Pe}</h2>`:""}
${dt?`<img src="${dt}" style="max-width:60px;max-height:40px">`:""}
${lt?`<div class="info-line">${lt}</div>`:""}
${ct?`<div class="info-line">${ct}</div>`:""}
${ke?`<div class="info-line"><strong>VAT: ${ke}</strong></div>`:""}
</div>
</div>
<div class="title">TAX INVOICE / فاتورة ضريبية</div>
<div class="customer">
<h3>Customer / العميل</h3>
<p><strong>${M||"Walk-in Customer"}</strong></p>
${k?`<p>Phone: ${k}</p>`:""}
${S?`<p>Address: ${S}</p>`:""}
${x?`<p>VAT: ${x}</p>`:""}
</div>
<table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
${d.map(F=>`<tr><td>${F.no}</td><td>${F.name}</td><td>${F.qty}</td><td>${F.rate.toFixed(2)}</td><td>${F.total.toFixed(2)}</td></tr>`).join("")}
</tbody></table>
<div class="totals">
<div class="total-row"><span>Subtotal:</span><span>${K} ${ve.toFixed(2)}</span></div>
${y>0?`<div class="total-row"><span>Discount:</span><span>-${K} ${y.toFixed(2)}</span></div>`:""}
<div class="total-row"><span>Sales Tax ${de}%:</span><span>${K} ${ue.toFixed(2)}</span></div>
<div class="total-row grand"><span>TOTAL:</span><span>${K} ${be.toFixed(2)}</span></div>
</div>
${T?`<div style="margin-top:15px;padding:10px;background:#f9f9fa;border-radius:5px;font-size:13px"><strong>Note:</strong> ${T}</div>`:""}
<div class="footer">شكراً لتعاملكم معنا / Thank You For Your Business!</div>
</div>
<script>window.print();<\/script></body></html>`,B=window.open("","_blank");B&&(B.document.write(U),B.document.close())},un=t?.filter(d=>!X||X==="all"||d.status===X)||[];return en.data?.invoice?.id,e.jsxs("div",{className:"h-screen flex flex-col",children:[e.jsx("div",{className:"p-4 border-b bg-white",children:e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold",children:"Invoices / فواتير"}),e.jsxs("p",{className:"text-slate-500 text-sm",children:[un.length," invoices"]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(gt,{value:X,onValueChange:je,children:[e.jsx(mt,{className:"w-36",children:e.jsx(pt,{placeholder:"Filter by status"})}),e.jsxs(xt,{children:[e.jsx(ee,{value:"all",children:"All Status"}),e.jsx(ee,{value:"draft",children:"Draft"}),e.jsx(ee,{value:"sent",children:"Sent"}),e.jsx(ee,{value:"paid",children:"Paid"}),e.jsx(ee,{value:"overdue",children:"Overdue"})]})]}),e.jsx(ae,{variant:"outline",size:"sm",onClick:()=>{ft(),pe(null),le(null)},children:"New Bill"})]})]})}),e.jsxs("div",{className:"flex-1 overflow-hidden flex",children:[e.jsxs("div",{className:"w-1/2 border-r p-4 overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-4",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx(mn,{className:"absolute left-3 top-2.5 h-4 w-4 text-slate-400"}),e.jsx(Q,{className:"pl-9",placeholder:"Search products...",value:j,onChange:d=>b(d.target.value)})]}),e.jsxs(ae,{variant:"outline",size:"sm",onClick:()=>ie(!0),children:[e.jsx(Be,{className:"h-4 w-4 mr-1"})," Add Product"]})]}),e.jsx(pn,{open:ce,onOpenChange:ie,children:e.jsxs(xn,{children:[e.jsx(vn,{children:e.jsx(bn,{children:"Add Product"})}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx(W,{className:"text-xs",children:"Product Name"}),e.jsx(Q,{value:H,onChange:d=>O(d.target.value),placeholder:"e.g. Office Chair"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsxs(W,{className:"text-xs",children:["Buying Price (",K,")"]}),e.jsx(Q,{type:"number",value:Z,onChange:d=>se(d.target.value),placeholder:"0.00"})]}),e.jsxs("div",{children:[e.jsxs(W,{className:"text-xs",children:["Sale Price (",K,")"]}),e.jsx(Q,{type:"number",value:rt,onChange:d=>it(d.target.value),placeholder:"0.00"})]})]}),e.jsxs("div",{children:[e.jsx(W,{className:"text-xs",children:"Cover Image"}),e.jsx(vt,{value:st,onChange:at})]}),e.jsxs("div",{children:[e.jsx(W,{className:"text-xs",children:"Category"}),e.jsxs(gt,{value:Ne?String(Ne):void 0,onValueChange:d=>{if(d==="__new"){xe(!0);return}Ce(Number(d)),xe(!1)},children:[e.jsx(mt,{children:e.jsx(pt,{placeholder:"Select category"})}),e.jsxs(xt,{children:[s?.map(d=>e.jsx(ee,{value:String(d.id),children:d.name},d.id)),e.jsx(ee,{value:"__new",children:"+ New Category"})]})]}),$t&&e.jsxs("div",{className:"mt-2 space-y-2",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx(Q,{value:Ae,onChange:d=>Se(d.target.value),placeholder:"Category name",className:"h-8 text-xs"}),e.jsx(ae,{size:"sm",onClick:on,disabled:!Ae.trim()||h.isPending,children:"Add"})]}),e.jsx(vt,{value:ot,onChange:Te})]})]}),e.jsxs(ae,{className:"w-full",onClick:ln,disabled:!H.trim()||u.isPending,children:[e.jsx(Be,{className:"h-4 w-4 mr-2"})," Add Product"]})]})]})}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3",children:[!i?.length&&e.jsxs("div",{className:"col-span-full text-center py-10 text-slate-400",children:["No products yet.",e.jsx("br",{}),e.jsx("span",{className:"text-blue-500 font-medium",children:'Click "Add Product" to create one.'})]}),tn.map(d=>e.jsxs("button",{onClick:()=>nn({id:String(d.id),name:d.name||"",price:Number(d.salePrice||d.price||0),sku:d.sku}),className:"border-2 border-slate-200 rounded-lg p-3 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors active:scale-95",children:[d.image?e.jsx("img",{src:d.image,alt:d.name,className:"w-full h-20 object-cover rounded-md mb-1.5"}):e.jsx("div",{className:"w-full h-20 rounded-md mb-1.5 bg-slate-100 flex items-center justify-center text-slate-300",children:e.jsx(yn,{className:"h-8 w-8"})}),d.category&&e.jsx("div",{className:"text-[10px] text-slate-400 mb-1",children:d.category}),e.jsx("div",{className:"text-xs font-semibold text-slate-700 line-clamp-2 min-h-[32px]",children:d.name}),e.jsxs("div",{className:"text-sm font-bold text-emerald-600 mt-2",children:[K," ",Number(d.salePrice||d.price||0).toFixed(2)]})]},d.id))]})]}),e.jsxs("div",{className:"w-1/2 p-4 overflow-y-auto",children:[e.jsx("h3",{className:"font-semibold text-slate-800 mb-3",children:"Create Bill"}),e.jsxs("div",{className:"mb-3 relative",ref:re,children:[e.jsx(W,{className:"text-xs",children:"Customer Name"}),e.jsx(Q,{placeholder:"Type customer name...",value:M,onChange:d=>{A(d.target.value),V(d.target.value.length>=2)},onKeyDown:d=>{!P||!fe.length||(d.key==="ArrowDown"?(d.preventDefault(),ge(I=>Math.min(I+1,fe.length-1))):d.key==="ArrowUp"?(d.preventDefault(),ge(I=>Math.max(I-1,0))):d.key==="Enter"&&Y>=0?(d.preventDefault(),ht(fe[Y])):d.key==="Escape"&&V(!1))}}),P&&fe.length>0&&e.jsx("div",{className:"absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-b-lg max-h-40 overflow-y-auto z-50 shadow-lg",children:fe.map((d,I)=>e.jsxs("div",{className:`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 ${I===Y?"bg-blue-50":""}`,onClick:()=>ht({id:d.id,name:d.name,address:d.address,vatNumber:d.vatNumber,phone:d.phone}),children:[e.jsx("div",{className:"font-medium",children:d.name}),e.jsxs("div",{className:"text-[11px] text-slate-400",children:[d.vatNumber?`VAT: ${d.vatNumber}`:""," ",d.address?`· ${d.address}`:""]})]},d.id))})]}),e.jsxs("div",{className:"space-y-1 mb-3",children:[e.jsx(W,{className:"text-xs",children:"Phone"}),e.jsx(Q,{value:k,onChange:d=>m(d.target.value),placeholder:"Optional"})]}),e.jsxs("div",{className:"space-y-1 mb-3",children:[e.jsx(W,{className:"text-xs",children:"Address"}),e.jsx(Q,{value:S,onChange:d=>z(d.target.value),placeholder:"Optional"})]}),e.jsxs("div",{className:"space-y-1 mb-3",children:[e.jsx(W,{className:"text-xs",children:"Customer VAT Reg. No. (رقم ضريبي)"}),e.jsx(Q,{value:x,onChange:d=>N(d.target.value),placeholder:"e.g. 311777758600003"})]}),e.jsxs("div",{className:"border-t pt-3 max-h-[300px] overflow-y-auto space-y-2",children:[p.length===0&&e.jsxs("div",{className:"text-center py-8 text-slate-400 text-sm",children:["Cart is empty.",e.jsx("br",{}),"Select products or add custom item."]}),p.map((d,I)=>e.jsxs("div",{className:"flex items-center gap-2 border-b pb-2",children:[e.jsx("input",{className:"flex-1 min-w-0 border rounded px-2 py-1 text-xs font-medium",value:d.name,onChange:U=>sn(I,U.target.value)}),e.jsx("input",{type:"number",className:"w-16 text-center border rounded px-1 py-1 text-xs",value:d.price,onChange:U=>rn(I,U.target.value)}),e.jsx("button",{onClick:()=>ut(I,-1),className:"w-6 h-6 border rounded flex items-center justify-center hover:bg-slate-100",children:e.jsx(An,{className:"h-3 w-3"})}),e.jsx("input",{type:"number",className:"w-10 text-center border rounded px-1 py-1 text-xs",value:d.qty,onChange:U=>{const B=Math.max(1,parseInt(U.target.value)||1);g(F=>F.map((ye,fn)=>fn===I?{...ye,qty:B}:ye))}}),e.jsx("button",{onClick:()=>ut(I,1),className:"w-6 h-6 border rounded flex items-center justify-center hover:bg-slate-100",children:e.jsx(Be,{className:"h-3 w-3"})}),e.jsx("div",{className:"text-xs font-semibold text-slate-700 w-16 text-right",children:(d.price*d.qty).toFixed(2)}),e.jsx("button",{onClick:()=>an(I),className:"text-red-500 hover:text-red-700",children:e.jsx(jn,{className:"h-3.5 w-3.5"})})]},I))]}),e.jsxs("div",{className:"border-t pt-3 space-y-1 text-sm",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Subtotal:"}),e.jsxs("span",{children:[K," ",ve.toFixed(2)]})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:"Discount:"}),e.jsx(Q,{type:"number",className:"w-20 h-7 text-xs text-right",value:y,onChange:d=>v(parseFloat(d.target.value)||0)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("span",{children:["VAT (",de,"%):"]}),e.jsxs("span",{children:[K," ",ue.toFixed(2)]})]}),e.jsxs("div",{className:"flex justify-between font-bold text-base border-t pt-2",children:[e.jsx("span",{children:"Total:"}),e.jsxs("span",{className:"text-emerald-600",children:[K," ",be.toFixed(2)]})]})]}),e.jsxs("div",{className:"mt-3",children:[e.jsx(W,{className:"text-xs",children:"Note"}),e.jsx(Q,{value:T,onChange:d=>w(d.target.value),placeholder:"Optional",className:"h-8 text-xs"})]}),e.jsxs("div",{className:"flex gap-2 mt-4",children:[e.jsxs(ae,{className:"flex-1",onClick:cn,disabled:l.isPending||f.isPending,children:[e.jsx(wn,{className:"h-4 w-4 mr-2"})," ",G?"Update":"Create Bill"]}),e.jsx(ae,{variant:"outline",onClick:dn,disabled:!p.length,children:e.jsx(Nn,{className:"h-4 w-4"})})]})]})]})]})}export{gr as default};
