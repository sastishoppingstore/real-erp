import{j as e}from"./ui-2_2xY0sS.js";import{g as mn,r as R}from"./vendor-Dj4APJbq.js";import{c as pn,K as U,B as oe,au as xn,a9 as Q,aj as vn,ak as bn,al as yn,am as wn,P as jn,aw as Nn}from"./index-uIBye_Cj.js";import{L as W}from"./label-ClRMHrDT.js";import{t as D}from"./index-C7Qn3gX3.js";import{S as xt,a as vt,b as bt,c as yt,d as ne}from"./select-Dkof6dHC.js";import{I as wt}from"./ImageUpload-BmoRqfws.js";import{P as Me}from"./plus-XhlEyg3Z.js";import{T as Cn}from"./trash-2-4gYd38aJ.js";import{P as An}from"./printer-DAxUQ-2p.js";import"./query-C_GIT_zP.js";import"./charts-CClYrlZQ.js";const Sn=[["path",{d:"M5 12h14",key:"1ays0h"}]],Tn=pn("minus",Sn);var le={},Re,jt;function kn(){return jt||(jt=1,Re=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then}),Re}var ze={},ee={},Nt;function re(){if(Nt)return ee;Nt=1;let t;const r=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];return ee.getSymbolSize=function(i){if(!i)throw new Error('"version" cannot be null or undefined');if(i<1||i>40)throw new Error('"version" should be in range from 1 to 40');return i*4+17},ee.getSymbolTotalCodewords=function(i){return r[i]},ee.getBCHDigit=function(a){let i=0;for(;a!==0;)i++,a>>>=1;return i},ee.setToSJISFunction=function(i){if(typeof i!="function")throw new Error('"toSJISFunc" is not a valid function.');t=i},ee.isKanjiModeEnabled=function(){return typeof t<"u"},ee.toSJIS=function(i){return t(i)},ee}var De={},Ct;function rt(){return Ct||(Ct=1,(function(t){t.L={bit:1},t.M={bit:0},t.Q={bit:3},t.H={bit:2};function r(a){if(typeof a!="string")throw new Error("Param is not a string");switch(a.toLowerCase()){case"l":case"low":return t.L;case"m":case"medium":return t.M;case"q":case"quartile":return t.Q;case"h":case"high":return t.H;default:throw new Error("Unknown EC Level: "+a)}}t.isValid=function(i){return i&&typeof i.bit<"u"&&i.bit>=0&&i.bit<4},t.from=function(i,n){if(t.isValid(i))return i;try{return r(i)}catch{return n}}})(De)),De}var Le,At;function En(){if(At)return Le;At=1;function t(){this.buffer=[],this.length=0}return t.prototype={get:function(r){const a=Math.floor(r/8);return(this.buffer[a]>>>7-r%8&1)===1},put:function(r,a){for(let i=0;i<a;i++)this.putBit((r>>>a-i-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(r){const a=Math.floor(this.length/8);this.buffer.length<=a&&this.buffer.push(0),r&&(this.buffer[a]|=128>>>this.length%8),this.length++}},Le=t,Le}var qe,St;function Pn(){if(St)return qe;St=1;function t(r){if(!r||r<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=r,this.data=new Uint8Array(r*r),this.reservedBit=new Uint8Array(r*r)}return t.prototype.set=function(r,a,i,n){const s=r*this.size+a;this.data[s]=i,n&&(this.reservedBit[s]=!0)},t.prototype.get=function(r,a){return this.data[r*this.size+a]},t.prototype.xor=function(r,a,i){this.data[r*this.size+a]^=i},t.prototype.isReserved=function(r,a){return this.reservedBit[r*this.size+a]},qe=t,qe}var Fe={},Tt;function In(){return Tt||(Tt=1,(function(t){const r=re().getSymbolSize;t.getRowColCoords=function(i){if(i===1)return[];const n=Math.floor(i/7)+2,s=r(i),d=s===145?26:Math.ceil((s-13)/(2*n-2))*2,o=[s-7];for(let l=1;l<n-1;l++)o[l]=o[l-1]-d;return o.push(6),o.reverse()},t.getPositions=function(i){const n=[],s=t.getRowColCoords(i),d=s.length;for(let o=0;o<d;o++)for(let l=0;l<d;l++)o===0&&l===0||o===0&&l===d-1||o===d-1&&l===0||n.push([s[o],s[l]]);return n}})(Fe)),Fe}var Ue={},kt;function Bn(){if(kt)return Ue;kt=1;const t=re().getSymbolSize,r=7;return Ue.getPositions=function(i){const n=t(i);return[[0,0],[n-r,0],[0,n-r]]},Ue}var _e={},Et;function Mn(){return Et||(Et=1,(function(t){t.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const r={N1:3,N2:3,N3:40,N4:10};t.isValid=function(n){return n!=null&&n!==""&&!isNaN(n)&&n>=0&&n<=7},t.from=function(n){return t.isValid(n)?parseInt(n,10):void 0},t.getPenaltyN1=function(n){const s=n.size;let d=0,o=0,l=0,h=null,u=null;for(let f=0;f<s;f++){o=l=0,h=u=null;for(let m=0;m<s;m++){let g=n.get(f,m);g===h?o++:(o>=5&&(d+=r.N1+(o-5)),h=g,o=1),g=n.get(m,f),g===u?l++:(l>=5&&(d+=r.N1+(l-5)),u=g,l=1)}o>=5&&(d+=r.N1+(o-5)),l>=5&&(d+=r.N1+(l-5))}return d},t.getPenaltyN2=function(n){const s=n.size;let d=0;for(let o=0;o<s-1;o++)for(let l=0;l<s-1;l++){const h=n.get(o,l)+n.get(o,l+1)+n.get(o+1,l)+n.get(o+1,l+1);(h===4||h===0)&&d++}return d*r.N2},t.getPenaltyN3=function(n){const s=n.size;let d=0,o=0,l=0;for(let h=0;h<s;h++){o=l=0;for(let u=0;u<s;u++)o=o<<1&2047|n.get(h,u),u>=10&&(o===1488||o===93)&&d++,l=l<<1&2047|n.get(u,h),u>=10&&(l===1488||l===93)&&d++}return d*r.N3},t.getPenaltyN4=function(n){let s=0;const d=n.data.length;for(let l=0;l<d;l++)s+=n.data[l];return Math.abs(Math.ceil(s*100/d/5)-10)*r.N4};function a(i,n,s){switch(i){case t.Patterns.PATTERN000:return(n+s)%2===0;case t.Patterns.PATTERN001:return n%2===0;case t.Patterns.PATTERN010:return s%3===0;case t.Patterns.PATTERN011:return(n+s)%3===0;case t.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(s/3))%2===0;case t.Patterns.PATTERN101:return n*s%2+n*s%3===0;case t.Patterns.PATTERN110:return(n*s%2+n*s%3)%2===0;case t.Patterns.PATTERN111:return(n*s%3+(n+s)%2)%2===0;default:throw new Error("bad maskPattern:"+i)}}t.applyMask=function(n,s){const d=s.size;for(let o=0;o<d;o++)for(let l=0;l<d;l++)s.isReserved(l,o)||s.xor(l,o,a(n,l,o))},t.getBestMask=function(n,s){const d=Object.keys(t.Patterns).length;let o=0,l=1/0;for(let h=0;h<d;h++){s(h),t.applyMask(h,n);const u=t.getPenaltyN1(n)+t.getPenaltyN2(n)+t.getPenaltyN3(n)+t.getPenaltyN4(n);t.applyMask(h,n),u<l&&(l=u,o=h)}return o}})(_e)),_e}var je={},Pt;function Xt(){if(Pt)return je;Pt=1;const t=rt(),r=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],a=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];return je.getBlocksCount=function(n,s){switch(s){case t.L:return r[(n-1)*4+0];case t.M:return r[(n-1)*4+1];case t.Q:return r[(n-1)*4+2];case t.H:return r[(n-1)*4+3];default:return}},je.getTotalCodewordsCount=function(n,s){switch(s){case t.L:return a[(n-1)*4+0];case t.M:return a[(n-1)*4+1];case t.Q:return a[(n-1)*4+2];case t.H:return a[(n-1)*4+3];default:return}},je}var Ve={},pe={},It;function Rn(){if(It)return pe;It=1;const t=new Uint8Array(512),r=new Uint8Array(256);return(function(){let i=1;for(let n=0;n<255;n++)t[n]=i,r[i]=n,i<<=1,i&256&&(i^=285);for(let n=255;n<512;n++)t[n]=t[n-255]})(),pe.log=function(i){if(i<1)throw new Error("log("+i+")");return r[i]},pe.exp=function(i){return t[i]},pe.mul=function(i,n){return i===0||n===0?0:t[r[i]+r[n]]},pe}var Bt;function zn(){return Bt||(Bt=1,(function(t){const r=Rn();t.mul=function(i,n){const s=new Uint8Array(i.length+n.length-1);for(let d=0;d<i.length;d++)for(let o=0;o<n.length;o++)s[d+o]^=r.mul(i[d],n[o]);return s},t.mod=function(i,n){let s=new Uint8Array(i);for(;s.length-n.length>=0;){const d=s[0];for(let l=0;l<n.length;l++)s[l]^=r.mul(n[l],d);let o=0;for(;o<s.length&&s[o]===0;)o++;s=s.slice(o)}return s},t.generateECPolynomial=function(i){let n=new Uint8Array([1]);for(let s=0;s<i;s++)n=t.mul(n,new Uint8Array([1,r.exp(s)]));return n}})(Ve)),Ve}var He,Mt;function Dn(){if(Mt)return He;Mt=1;const t=zn();function r(a){this.genPoly=void 0,this.degree=a,this.degree&&this.initialize(this.degree)}return r.prototype.initialize=function(i){this.degree=i,this.genPoly=t.generateECPolynomial(this.degree)},r.prototype.encode=function(i){if(!this.genPoly)throw new Error("Encoder not initialized");const n=new Uint8Array(i.length+this.degree);n.set(i);const s=t.mod(n,this.genPoly),d=this.degree-s.length;if(d>0){const o=new Uint8Array(this.degree);return o.set(s,d),o}return s},He=r,He}var Oe={},Qe={},We={},Rt;function $t(){return Rt||(Rt=1,We.isValid=function(r){return!isNaN(r)&&r>=1&&r<=40}),We}var Z={},zt;function en(){if(zt)return Z;zt=1;const t="[0-9]+",r="[A-Z $%*+\\-./:]+";let a="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";a=a.replace(/u/g,"\\u");const i="(?:(?![A-Z0-9 $%*+\\-./:]|"+a+`)(?:.|[\r
]))+`;Z.KANJI=new RegExp(a,"g"),Z.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),Z.BYTE=new RegExp(i,"g"),Z.NUMERIC=new RegExp(t,"g"),Z.ALPHANUMERIC=new RegExp(r,"g");const n=new RegExp("^"+a+"$"),s=new RegExp("^"+t+"$"),d=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");return Z.testKanji=function(l){return n.test(l)},Z.testNumeric=function(l){return s.test(l)},Z.testAlphanumeric=function(l){return d.test(l)},Z}var Dt;function ie(){return Dt||(Dt=1,(function(t){const r=$t(),a=en();t.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},t.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},t.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},t.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},t.MIXED={bit:-1},t.getCharCountIndicator=function(s,d){if(!s.ccBits)throw new Error("Invalid mode: "+s);if(!r.isValid(d))throw new Error("Invalid version: "+d);return d>=1&&d<10?s.ccBits[0]:d<27?s.ccBits[1]:s.ccBits[2]},t.getBestModeForData=function(s){return a.testNumeric(s)?t.NUMERIC:a.testAlphanumeric(s)?t.ALPHANUMERIC:a.testKanji(s)?t.KANJI:t.BYTE},t.toString=function(s){if(s&&s.id)return s.id;throw new Error("Invalid mode")},t.isValid=function(s){return s&&s.bit&&s.ccBits};function i(n){if(typeof n!="string")throw new Error("Param is not a string");switch(n.toLowerCase()){case"numeric":return t.NUMERIC;case"alphanumeric":return t.ALPHANUMERIC;case"kanji":return t.KANJI;case"byte":return t.BYTE;default:throw new Error("Unknown mode: "+n)}}t.from=function(s,d){if(t.isValid(s))return s;try{return i(s)}catch{return d}}})(Qe)),Qe}var Lt;function Ln(){return Lt||(Lt=1,(function(t){const r=re(),a=Xt(),i=rt(),n=ie(),s=$t(),d=7973,o=r.getBCHDigit(d);function l(m,g,C){for(let k=1;k<=40;k++)if(g<=t.getCapacity(k,C,m))return k}function h(m,g){return n.getCharCountIndicator(m,g)+4}function u(m,g){let C=0;return m.forEach(function(k){const M=h(k.mode,g);C+=M+k.getBitsLength()}),C}function f(m,g){for(let C=1;C<=40;C++)if(u(m,C)<=t.getCapacity(C,g,n.MIXED))return C}t.from=function(g,C){return s.isValid(g)?parseInt(g,10):C},t.getCapacity=function(g,C,k){if(!s.isValid(g))throw new Error("Invalid QR Code version");typeof k>"u"&&(k=n.BYTE);const M=r.getSymbolTotalCodewords(g),A=a.getTotalCodewordsCount(g,C),P=(M-A)*8;if(k===n.MIXED)return P;const p=P-h(k,g);switch(k){case n.NUMERIC:return Math.floor(p/10*3);case n.ALPHANUMERIC:return Math.floor(p/11*2);case n.KANJI:return Math.floor(p/13);case n.BYTE:default:return Math.floor(p/8)}},t.getBestVersionForData=function(g,C){let k;const M=i.from(C,i.M);if(Array.isArray(g)){if(g.length>1)return f(g,M);if(g.length===0)return 1;k=g[0]}else k=g;return l(k.mode,k.getLength(),M)},t.getEncodedBits=function(g){if(!s.isValid(g)||g<7)throw new Error("Invalid QR Code version");let C=g<<12;for(;r.getBCHDigit(C)-o>=0;)C^=d<<r.getBCHDigit(C)-o;return g<<12|C}})(Oe)),Oe}var Ke={},qt;function qn(){if(qt)return Ke;qt=1;const t=re(),r=1335,a=21522,i=t.getBCHDigit(r);return Ke.getEncodedBits=function(s,d){const o=s.bit<<3|d;let l=o<<10;for(;t.getBCHDigit(l)-i>=0;)l^=r<<t.getBCHDigit(l)-i;return(o<<10|l)^a},Ke}var Je={},Ye,Ft;function Fn(){if(Ft)return Ye;Ft=1;const t=ie();function r(a){this.mode=t.NUMERIC,this.data=a.toString()}return r.getBitsLength=function(i){return 10*Math.floor(i/3)+(i%3?i%3*3+1:0)},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(i){let n,s,d;for(n=0;n+3<=this.data.length;n+=3)s=this.data.substr(n,3),d=parseInt(s,10),i.put(d,10);const o=this.data.length-n;o>0&&(s=this.data.substr(n),d=parseInt(s,10),i.put(d,o*3+1))},Ye=r,Ye}var Ze,Ut;function Un(){if(Ut)return Ze;Ut=1;const t=ie(),r=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function a(i){this.mode=t.ALPHANUMERIC,this.data=i}return a.getBitsLength=function(n){return 11*Math.floor(n/2)+6*(n%2)},a.prototype.getLength=function(){return this.data.length},a.prototype.getBitsLength=function(){return a.getBitsLength(this.data.length)},a.prototype.write=function(n){let s;for(s=0;s+2<=this.data.length;s+=2){let d=r.indexOf(this.data[s])*45;d+=r.indexOf(this.data[s+1]),n.put(d,11)}this.data.length%2&&n.put(r.indexOf(this.data[s]),6)},Ze=a,Ze}var Ge,_t;function _n(){if(_t)return Ge;_t=1;const t=ie();function r(a){this.mode=t.BYTE,typeof a=="string"?this.data=new TextEncoder().encode(a):this.data=new Uint8Array(a)}return r.getBitsLength=function(i){return i*8},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(a){for(let i=0,n=this.data.length;i<n;i++)a.put(this.data[i],8)},Ge=r,Ge}var Xe,Vt;function Vn(){if(Vt)return Xe;Vt=1;const t=ie(),r=re();function a(i){this.mode=t.KANJI,this.data=i}return a.getBitsLength=function(n){return n*13},a.prototype.getLength=function(){return this.data.length},a.prototype.getBitsLength=function(){return a.getBitsLength(this.data.length)},a.prototype.write=function(i){let n;for(n=0;n<this.data.length;n++){let s=r.toSJIS(this.data[n]);if(s>=33088&&s<=40956)s-=33088;else if(s>=57408&&s<=60351)s-=49472;else throw new Error("Invalid SJIS character: "+this.data[n]+`
Make sure your charset is UTF-8`);s=(s>>>8&255)*192+(s&255),i.put(s,13)}},Xe=a,Xe}var $e={exports:{}},Ht;function Hn(){return Ht||(Ht=1,(function(t){var r={single_source_shortest_paths:function(a,i,n){var s={},d={};d[i]=0;var o=r.PriorityQueue.make();o.push(i,0);for(var l,h,u,f,m,g,C,k,M;!o.empty();){l=o.pop(),h=l.value,f=l.cost,m=a[h]||{};for(u in m)m.hasOwnProperty(u)&&(g=m[u],C=f+g,k=d[u],M=typeof d[u]>"u",(M||k>C)&&(d[u]=C,o.push(u,C),s[u]=h))}if(typeof n<"u"&&typeof d[n]>"u"){var A=["Could not find a path from ",i," to ",n,"."].join("");throw new Error(A)}return s},extract_shortest_path_from_predecessor_list:function(a,i){for(var n=[],s=i;s;)n.push(s),a[s],s=a[s];return n.reverse(),n},find_path:function(a,i,n){var s=r.single_source_shortest_paths(a,i,n);return r.extract_shortest_path_from_predecessor_list(s,n)},PriorityQueue:{make:function(a){var i=r.PriorityQueue,n={},s;a=a||{};for(s in i)i.hasOwnProperty(s)&&(n[s]=i[s]);return n.queue=[],n.sorter=a.sorter||i.default_sorter,n},default_sorter:function(a,i){return a.cost-i.cost},push:function(a,i){var n={value:a,cost:i};this.queue.push(n),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};t.exports=r})($e)),$e.exports}var Ot;function On(){return Ot||(Ot=1,(function(t){const r=ie(),a=Fn(),i=Un(),n=_n(),s=Vn(),d=en(),o=re(),l=Hn();function h(A){return unescape(encodeURIComponent(A)).length}function u(A,P,p){const S=[];let z;for(;(z=A.exec(p))!==null;)S.push({data:z[0],index:z.index,mode:P,length:z[0].length});return S}function f(A){const P=u(d.NUMERIC,r.NUMERIC,A),p=u(d.ALPHANUMERIC,r.ALPHANUMERIC,A);let S,z;return o.isKanjiModeEnabled()?(S=u(d.BYTE,r.BYTE,A),z=u(d.KANJI,r.KANJI,A)):(S=u(d.BYTE_KANJI,r.BYTE,A),z=[]),P.concat(p,S,z).sort(function(N,y){return N.index-y.index}).map(function(N){return{data:N.data,mode:N.mode,length:N.length}})}function m(A,P){switch(P){case r.NUMERIC:return a.getBitsLength(A);case r.ALPHANUMERIC:return i.getBitsLength(A);case r.KANJI:return s.getBitsLength(A);case r.BYTE:return n.getBitsLength(A)}}function g(A){return A.reduce(function(P,p){const S=P.length-1>=0?P[P.length-1]:null;return S&&S.mode===p.mode?(P[P.length-1].data+=p.data,P):(P.push(p),P)},[])}function C(A){const P=[];for(let p=0;p<A.length;p++){const S=A[p];switch(S.mode){case r.NUMERIC:P.push([S,{data:S.data,mode:r.ALPHANUMERIC,length:S.length},{data:S.data,mode:r.BYTE,length:S.length}]);break;case r.ALPHANUMERIC:P.push([S,{data:S.data,mode:r.BYTE,length:S.length}]);break;case r.KANJI:P.push([S,{data:S.data,mode:r.BYTE,length:h(S.data)}]);break;case r.BYTE:P.push([{data:S.data,mode:r.BYTE,length:h(S.data)}])}}return P}function k(A,P){const p={},S={start:{}};let z=["start"];for(let x=0;x<A.length;x++){const N=A[x],y=[];for(let v=0;v<N.length;v++){const T=N[v],w=""+x+v;y.push(w),p[w]={node:T,lastCount:0},S[w]={};for(let j=0;j<z.length;j++){const b=z[j];p[b]&&p[b].node.mode===T.mode?(S[b][w]=m(p[b].lastCount+T.length,T.mode)-m(p[b].lastCount,T.mode),p[b].lastCount+=T.length):(p[b]&&(p[b].lastCount=T.length),S[b][w]=m(T.length,T.mode)+4+r.getCharCountIndicator(T.mode,P))}}z=y}for(let x=0;x<z.length;x++)S[z[x]].end=0;return{map:S,table:p}}function M(A,P){let p;const S=r.getBestModeForData(A);if(p=r.from(P,S),p!==r.BYTE&&p.bit<S.bit)throw new Error('"'+A+'" cannot be encoded with mode '+r.toString(p)+`.
 Suggested mode is: `+r.toString(S));switch(p===r.KANJI&&!o.isKanjiModeEnabled()&&(p=r.BYTE),p){case r.NUMERIC:return new a(A);case r.ALPHANUMERIC:return new i(A);case r.KANJI:return new s(A);case r.BYTE:return new n(A)}}t.fromArray=function(P){return P.reduce(function(p,S){return typeof S=="string"?p.push(M(S,null)):S.data&&p.push(M(S.data,S.mode)),p},[])},t.fromString=function(P,p){const S=f(P,o.isKanjiModeEnabled()),z=C(S),x=k(z,p),N=l.find_path(x.map,"start","end"),y=[];for(let v=1;v<N.length-1;v++)y.push(x.table[N[v]].node);return t.fromArray(g(y))},t.rawSplit=function(P){return t.fromArray(f(P,o.isKanjiModeEnabled()))}})(Je)),Je}var Qt;function Qn(){if(Qt)return ze;Qt=1;const t=re(),r=rt(),a=En(),i=Pn(),n=In(),s=Bn(),d=Mn(),o=Xt(),l=Dn(),h=Ln(),u=qn(),f=ie(),m=On();function g(x,N){const y=x.size,v=s.getPositions(N);for(let T=0;T<v.length;T++){const w=v[T][0],j=v[T][1];for(let b=-1;b<=7;b++)if(!(w+b<=-1||y<=w+b))for(let E=-1;E<=7;E++)j+E<=-1||y<=j+E||(b>=0&&b<=6&&(E===0||E===6)||E>=0&&E<=6&&(b===0||b===6)||b>=2&&b<=4&&E>=2&&E<=4?x.set(w+b,j+E,!0,!0):x.set(w+b,j+E,!1,!0))}}function C(x){const N=x.size;for(let y=8;y<N-8;y++){const v=y%2===0;x.set(y,6,v,!0),x.set(6,y,v,!0)}}function k(x,N){const y=n.getPositions(N);for(let v=0;v<y.length;v++){const T=y[v][0],w=y[v][1];for(let j=-2;j<=2;j++)for(let b=-2;b<=2;b++)j===-2||j===2||b===-2||b===2||j===0&&b===0?x.set(T+j,w+b,!0,!0):x.set(T+j,w+b,!1,!0)}}function M(x,N){const y=x.size,v=h.getEncodedBits(N);let T,w,j;for(let b=0;b<18;b++)T=Math.floor(b/3),w=b%3+y-8-3,j=(v>>b&1)===1,x.set(T,w,j,!0),x.set(w,T,j,!0)}function A(x,N,y){const v=x.size,T=u.getEncodedBits(N,y);let w,j;for(w=0;w<15;w++)j=(T>>w&1)===1,w<6?x.set(w,8,j,!0):w<8?x.set(w+1,8,j,!0):x.set(v-15+w,8,j,!0),w<8?x.set(8,v-w-1,j,!0):w<9?x.set(8,15-w-1+1,j,!0):x.set(8,15-w-1,j,!0);x.set(v-8,8,1,!0)}function P(x,N){const y=x.size;let v=-1,T=y-1,w=7,j=0;for(let b=y-1;b>0;b-=2)for(b===6&&b--;;){for(let E=0;E<2;E++)if(!x.isReserved(T,b-E)){let V=!1;j<N.length&&(V=(N[j]>>>w&1)===1),x.set(T,b-E,V),w--,w===-1&&(j++,w=7)}if(T+=v,T<0||y<=T){T-=v,v=-v;break}}}function p(x,N,y){const v=new a;y.forEach(function(E){v.put(E.mode.bit,4),v.put(E.getLength(),f.getCharCountIndicator(E.mode,x)),E.write(v)});const T=t.getSymbolTotalCodewords(x),w=o.getTotalCodewordsCount(x,N),j=(T-w)*8;for(v.getLengthInBits()+4<=j&&v.put(0,4);v.getLengthInBits()%8!==0;)v.putBit(0);const b=(j-v.getLengthInBits())/8;for(let E=0;E<b;E++)v.put(E%2?17:236,8);return S(v,x,N)}function S(x,N,y){const v=t.getSymbolTotalCodewords(N),T=o.getTotalCodewordsCount(N,y),w=v-T,j=o.getBlocksCount(N,y),b=v%j,E=j-b,V=Math.floor(v/j),G=Math.floor(w/j),xe=G+1,se=V-G,ce=new l(se);let de=0;const X=new Array(j),ve=new Array(j);let $=0;const Ne=new Uint8Array(x.buffer);for(let J=0;J<j;J++){const ae=J<E?G:xe;X[J]=Ne.slice(de,de+ae),ve[J]=ce.encode(X[J]),de+=ae,$=Math.max($,ae)}const K=new Uint8Array(v);let ue=0,O,H;for(O=0;O<$;O++)for(H=0;H<j;H++)O<X[H].length&&(K[ue++]=X[H][O]);for(O=0;O<se;O++)for(H=0;H<j;H++)K[ue++]=ve[H][O];return K}function z(x,N,y,v){let T;if(Array.isArray(x))T=m.fromArray(x);else if(typeof x=="string"){let V=N;if(!V){const G=m.rawSplit(x);V=h.getBestVersionForData(G,y)}T=m.fromString(x,V||40)}else throw new Error("Invalid data");const w=h.getBestVersionForData(T,y);if(!w)throw new Error("The amount of data is too big to be stored in a QR Code");if(!N)N=w;else if(N<w)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+w+`.
`);const j=p(N,y,T),b=t.getSymbolSize(N),E=new i(b);return g(E,N),C(E),k(E,N),A(E,y,0),N>=7&&M(E,N),P(E,j),isNaN(v)&&(v=d.getBestMask(E,A.bind(null,E,y))),d.applyMask(v,E),A(E,y,v),{modules:E,version:N,errorCorrectionLevel:y,maskPattern:v,segments:T}}return ze.create=function(N,y){if(typeof N>"u"||N==="")throw new Error("No input text");let v=r.M,T,w;return typeof y<"u"&&(v=r.from(y.errorCorrectionLevel,r.M),T=h.from(y.version),w=d.from(y.maskPattern),y.toSJISFunc&&t.setToSJISFunction(y.toSJISFunc)),z(N,T,v,w)},ze}var et={},tt={},Wt;function tn(){return Wt||(Wt=1,(function(t){function r(a){if(typeof a=="number"&&(a=a.toString()),typeof a!="string")throw new Error("Color should be defined as hex string");let i=a.slice().replace("#","").split("");if(i.length<3||i.length===5||i.length>8)throw new Error("Invalid hex color: "+a);(i.length===3||i.length===4)&&(i=Array.prototype.concat.apply([],i.map(function(s){return[s,s]}))),i.length===6&&i.push("F","F");const n=parseInt(i.join(""),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:n&255,hex:"#"+i.slice(0,6).join("")}}t.getOptions=function(i){i||(i={}),i.color||(i.color={});const n=typeof i.margin>"u"||i.margin===null||i.margin<0?4:i.margin,s=i.width&&i.width>=21?i.width:void 0,d=i.scale||4;return{width:s,scale:s?4:d,margin:n,color:{dark:r(i.color.dark||"#000000ff"),light:r(i.color.light||"#ffffffff")},type:i.type,rendererOpts:i.rendererOpts||{}}},t.getScale=function(i,n){return n.width&&n.width>=i+n.margin*2?n.width/(i+n.margin*2):n.scale},t.getImageWidth=function(i,n){const s=t.getScale(i,n);return Math.floor((i+n.margin*2)*s)},t.qrToImageData=function(i,n,s){const d=n.modules.size,o=n.modules.data,l=t.getScale(d,s),h=Math.floor((d+s.margin*2)*l),u=s.margin*l,f=[s.color.light,s.color.dark];for(let m=0;m<h;m++)for(let g=0;g<h;g++){let C=(m*h+g)*4,k=s.color.light;if(m>=u&&g>=u&&m<h-u&&g<h-u){const M=Math.floor((m-u)/l),A=Math.floor((g-u)/l);k=f[o[M*d+A]?1:0]}i[C++]=k.r,i[C++]=k.g,i[C++]=k.b,i[C]=k.a}}})(tt)),tt}var Kt;function Wn(){return Kt||(Kt=1,(function(t){const r=tn();function a(n,s,d){n.clearRect(0,0,s.width,s.height),s.style||(s.style={}),s.height=d,s.width=d,s.style.height=d+"px",s.style.width=d+"px"}function i(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}t.render=function(s,d,o){let l=o,h=d;typeof l>"u"&&(!d||!d.getContext)&&(l=d,d=void 0),d||(h=i()),l=r.getOptions(l);const u=r.getImageWidth(s.modules.size,l),f=h.getContext("2d"),m=f.createImageData(u,u);return r.qrToImageData(m.data,s,l),a(f,h,u),f.putImageData(m,0,0),h},t.renderToDataURL=function(s,d,o){let l=o;typeof l>"u"&&(!d||!d.getContext)&&(l=d,d=void 0),l||(l={});const h=t.render(s,d,l),u=l.type||"image/png",f=l.rendererOpts||{};return h.toDataURL(u,f.quality)}})(et)),et}var nt={},Jt;function Kn(){if(Jt)return nt;Jt=1;const t=tn();function r(n,s){const d=n.a/255,o=s+'="'+n.hex+'"';return d<1?o+" "+s+'-opacity="'+d.toFixed(2).slice(1)+'"':o}function a(n,s,d){let o=n+s;return typeof d<"u"&&(o+=" "+d),o}function i(n,s,d){let o="",l=0,h=!1,u=0;for(let f=0;f<n.length;f++){const m=Math.floor(f%s),g=Math.floor(f/s);!m&&!h&&(h=!0),n[f]?(u++,f>0&&m>0&&n[f-1]||(o+=h?a("M",m+d,.5+g+d):a("m",l,0),l=0,h=!1),m+1<s&&n[f+1]||(o+=a("h",u),u=0)):l++}return o}return nt.render=function(s,d,o){const l=t.getOptions(d),h=s.modules.size,u=s.modules.data,f=h+l.margin*2,m=l.color.light.a?"<path "+r(l.color.light,"fill")+' d="M0 0h'+f+"v"+f+'H0z"/>':"",g="<path "+r(l.color.dark,"stroke")+' d="'+i(u,h,l.margin)+'"/>',C='viewBox="0 0 '+f+" "+f+'"',M='<svg xmlns="http://www.w3.org/2000/svg" '+(l.width?'width="'+l.width+'" height="'+l.width+'" ':"")+C+' shape-rendering="crispEdges">'+m+g+`</svg>
`;return typeof o=="function"&&o(null,M),M},nt}var Yt;function Jn(){if(Yt)return le;Yt=1;const t=kn(),r=Qn(),a=Wn(),i=Kn();function n(s,d,o,l,h){const u=[].slice.call(arguments,1),f=u.length,m=typeof u[f-1]=="function";if(!m&&!t())throw new Error("Callback required as last argument");if(m){if(f<2)throw new Error("Too few arguments provided");f===2?(h=o,o=d,d=l=void 0):f===3&&(d.getContext&&typeof h>"u"?(h=l,l=void 0):(h=l,l=o,o=d,d=void 0))}else{if(f<1)throw new Error("Too few arguments provided");return f===1?(o=d,d=l=void 0):f===2&&!d.getContext&&(l=o,o=d,d=void 0),new Promise(function(g,C){try{const k=r.create(o,l);g(s(k,d,l))}catch(k){C(k)}})}try{const g=r.create(o,l);h(null,s(g,d,l))}catch(g){h(g)}}return le.create=r.create,le.toCanvas=n.bind(null,a.render),le.toDataURL=n.bind(null,a.renderToDataURL),le.toString=n.bind(null,function(s,d,o){return i.render(s,o)}),le}var Yn=Jn();const Zn=mn(Yn),Gn="SAR";function _(t){return Number(t??0)}function q(t){return _(t).toLocaleString("en-SA",{minimumFractionDigits:2,maximumFractionDigits:2})}function Xn(t){return t==="simplified"}function $n(t){if(t===0)return"Zero";const r=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],a=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],i=["","Thousand","Million","Billion"];function n(u){if(u===0)return"";const f=[];return u>=100&&(f.push(r[Math.floor(u/100)]+" Hundred"),u%=100),u>=20&&(f.push(a[Math.floor(u/10)]),u%=10),u>0&&f.push(r[u]),f.join(" ")}const s=Math.floor(t),d=Math.round((t-s)*100);let o="",l=0,h=s;for(;h>0;){const u=h%1e3;u>0&&(o=n(u)+(i[l]?" "+i[l]:"")+(o?" "+o:"")),h=Math.floor(h/1e3),l++}return o=o||"Zero",d>0&&(o+=` and ${d}/100`),o.trim()+" Saudi Riyals"}function er(t){if(t===0)return"صفر";const r=[["",""],["واحد","واحدة"],["اثنان","اثنتان"],["ثلاثة","ثلاث"],["أربعة","أربع"],["خمسة","خمس"],["ستة","ست"],["سبعة","سبع"],["ثمانية","ثمان"],["تسعة","تسع"],["عشرة","عشر"],["أحد عشر","إحدى عشرة"],["اثنا عشر","اثنتا عشرة"],["ثلاثة عشر","ثلاث عشرة"],["أربعة عشر","أربع عشرة"],["خمسة عشر","خمس عشرة"],["ستة عشر","ست عشرة"],["سبعة عشر","سبع عشرة"],["ثمانية عشر","ثماني عشرة"],["تسعة عشر","تسع عشرة"]],a=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],i=["","ألف","مليون","مليار"];function n(f,m){if(f===0)return"";const g=m?1:0,C=[];if(f>=100){const k=Math.floor(f/100);k===1?C.push("مائة"):k===2?C.push("مائتان"):C.push(r[k][0]+" مائة"),f%=100}return f>=20&&(C.push(a[Math.floor(f/10)]),f%=10),f>0&&C.push(r[f][g]),C.join(" و ")}const s=Math.floor(t),d=Math.round((t-s)*100);let o="",l=0,h=s;const u=[!1,!0,!1,!1];for(;h>0;){const f=h%1e3;if(f>0){const m=n(f,u[l]);f===1&&l===1?o="ألف"+(o?" "+o:""):f===2&&l===1?o="ألفان"+(o?" "+o:""):o=m+(i[l]?" "+i[l]:"")+(o?" و "+o:"")}h=Math.floor(h/1e3),l++}return o=o||"صفر",d>0&&(o+=` و ${d}/100`),o.trim()+" ريال سعودي"}function tr(t){if(!t)return"";try{return new Date(t).toLocaleDateString("ar-SA-u-ca-islamic",{year:"numeric",month:"long",day:"numeric"})}catch{return""}}const Zt={draft:{label:"Draft",labelAr:"مسودة",color:"#64748b"},sent:{label:"Sent",labelAr:"مُرسلة",color:"#3b82f6"},paid:{label:"Paid",labelAr:"مدفوعة",color:"#10b981"},partial:{label:"Partial",labelAr:"جزئي",color:"#f59e0b"},overdue:{label:"Overdue",labelAr:"متأخرة",color:"#ef4444"},cancelled:{label:"Cancelled",labelAr:"ملغاة",color:"#6b7280"}},Gt={cleared:{label:"Cleared",color:"#10b981"},reported:{label:"Reported",color:"#3b82f6"},pending:{label:"Pending",color:"#f59e0b"},failed:{label:"Failed",color:"#ef4444"}},nr=R.forwardRef(({invoice:t,company:r,customer:a,items:i,className:n=""},s)=>{const[d,o]=R.useState("");R.useEffect(()=>{if(!t.zatcaQrCode){o("");return}Zn.toDataURL(t.zatcaQrCode,{errorCorrectionLevel:"M",margin:1,width:180,color:{dark:"#0f172a",light:"#ffffff"}}).then(o).catch(()=>o(""))},[t.zatcaQrCode]);const l=r.defaultCurrency??Gn,h=Xn(t.invoiceType),u=Zt[t.status??"draft"]??Zt.draft,f=Gt[t.zatcaStatus??"pending"]??Gt.pending,m=_(t.taxPercent??15),g=_(t.subTotal),C=_(t.taxAmount),k=_(t.totalAmount),M=_(t.paidAmount),A=k-M,P=tr(t.date);return e.jsxs("div",{ref:s,className:`saudi-invoice-root ${n}`,style:{fontFamily:"'Segoe UI', Tahoma, Arial, sans-serif"},children:[e.jsx("style",{children:`
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
        `}),e.jsxs("div",{className:"inv-page",children:[e.jsx("div",{className:"inv-header",children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1},children:[e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"flex-start"},children:[e.jsx("div",{className:"inv-logo-box",children:r.logo?e.jsx("img",{src:r.logo,alt:"logo"}):e.jsx("span",{style:{color:"white",fontWeight:800,fontSize:20},children:(r.companyName??"YA").slice(0,2).toUpperCase()})}),e.jsxs("div",{children:[e.jsx("div",{style:{color:"white",fontWeight:800,fontSize:20,lineHeight:1.2},children:r.companyName??"Company Name"}),r.companyNameAr&&e.jsx("div",{style:{color:"rgba(255,255,255,.8)",fontWeight:600,fontSize:14,direction:"rtl",marginTop:2},children:r.companyNameAr}),e.jsxs("div",{style:{color:"rgba(255,255,255,.65)",fontSize:11,marginTop:6,lineHeight:1.7},children:[r.address&&e.jsxs("div",{children:[r.address,r.city?`, ${r.city}`:""]}),r.phone&&e.jsx("div",{children:r.phone}),r.email&&e.jsx("div",{children:r.email})]})]})]}),e.jsxs("div",{style:{textAlign:"right"},children:[e.jsxs("div",{className:"inv-title-badge",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:"2.5",children:[e.jsx("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),e.jsx("polyline",{points:"14 2 14 8 20 8"})]}),e.jsx("span",{style:{color:"white",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"},children:h?"Simplified Tax Invoice":"Tax Invoice"})]}),e.jsx("div",{style:{color:"rgba(255,255,255,.9)",fontWeight:800,fontSize:18,direction:"rtl",marginBottom:4},children:h?"فاتورة ضريبية مبسطة":"فاتورة ضريبية"}),e.jsx("div",{style:{color:"rgba(255,255,255,.7)",fontFamily:"monospace",fontSize:16,fontWeight:700},children:t.invoiceNumber??"INV-000000"}),t.zatcaStatus&&e.jsx("div",{style:{marginTop:10},children:e.jsxs("span",{className:"inv-badge",style:{background:`${f.color}22`,border:`1.5px solid ${f.color}44`,color:f.color},children:[e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",background:f.color,display:"inline-block"}}),"ZATCA ",f.label]})}),e.jsx("div",{style:{marginTop:8},children:e.jsxs("span",{className:"inv-badge",style:{background:`${u.color}22`,border:`1.5px solid ${u.color}44`,color:u.color},children:[u.label," / ",u.labelAr]})})]})]})}),e.jsxs("div",{className:"inv-stats",children:[e.jsxs("div",{className:"inv-stat-box inv-stat-box-subtotal",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#2563eb"},children:"Subtotal / المجموع"}),e.jsx("div",{className:"inv-stat-value",style:{color:"#1d4ed8"},children:q(g)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#3b82f6"},children:l})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-vat",children:[e.jsxs("div",{className:"inv-stat-label",style:{color:"#059669"},children:["VAT ",m,"% / ضريبة القيمة"]}),e.jsx("div",{className:"inv-stat-value",style:{color:"#047857"},children:q(C)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#10b981"},children:l})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-total",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"rgba(255,255,255,.75)"},children:"TOTAL / الإجمالي"}),e.jsx("div",{className:"inv-stat-value",style:{color:"white"},children:q(k)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"rgba(255,255,255,.7)"},children:l})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-paid",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#d97706"},children:"Amount Due / المستحق"}),e.jsx("div",{className:"inv-stat-value",style:{color:A>0?"#dc2626":"#16a34a"},children:q(A)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#f59e0b"},children:l})]})]}),e.jsxs("div",{className:"inv-body",children:[e.jsxs("div",{className:"inv-info-grid",children:[e.jsxs("div",{className:"inv-info-card inv-info-card-seller",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#059669"},children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#059669",strokeWidth:"2.5",children:e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"})}),"Seller / البائع"]}),e.jsx("div",{className:"inv-card-name",children:r.companyName??"—"}),r.companyNameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#065f46"},children:r.companyNameAr}),e.jsxs("div",{className:"inv-card-text",children:[r.address&&e.jsxs("div",{children:[r.address,r.city?`, ${r.city}`:""]}),r.country&&e.jsx("div",{children:r.country}),r.phone&&e.jsxs("div",{children:["📞 ",r.phone]}),r.email&&e.jsxs("div",{children:["✉ ",r.email]})]}),r.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46"},children:["🏛 VAT: ",r.taxNumber]}),r.crNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46",marginTop:4},children:["📋 CR: ",r.crNumber]})]}),e.jsxs("div",{className:"inv-info-card inv-info-card-buyer",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#2563eb"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#2563eb",strokeWidth:"2.5",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),"Bill To / العميل"]}),e.jsx("div",{className:"inv-card-name",children:a.name??"—"}),a.nameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#1e40af"},children:a.nameAr}),e.jsxs("div",{className:"inv-card-text",children:[a.address&&e.jsxs("div",{children:[a.address,a.city?`, ${a.city}`:""]}),a.phone&&e.jsxs("div",{children:["📞 ",a.phone]}),a.email&&e.jsxs("div",{children:["✉ ",a.email]})]}),a.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#dbeafe",color:"#1e40af"},children:["🏛 Customer VAT: ",a.taxNumber]})]})]}),e.jsxs("div",{className:"inv-meta-row",style:{gridTemplateColumns:"repeat(6, 1fr)"},children:[e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",children:[e.jsx("div",{className:"inv-meta-label",children:"Invoice Type"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#0f172a",fontSize:10},children:t.invoiceType==="simplified"?"Simplified / مبسطة":t.invoiceType==="zatca"?"ZATCA / فاتورة ذاتكا":"Standard / قياسية"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",children:[e.jsx("div",{className:"inv-meta-label",children:"Issue Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#c2410c",fontSize:11},children:t.date??"—"}),P&&e.jsx("div",{style:{fontSize:9,color:"#9a3412",direction:"rtl",marginTop:1},children:P})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",style:{background:"#f0fdf4",borderColor:"#bbf7d0"},children:[e.jsx("div",{className:"inv-meta-label",children:"Issue Time"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#065f46",fontSize:11},children:t.time??"—"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-due",children:[e.jsx("div",{className:"inv-meta-label",children:"Due Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#b91c1c",fontSize:11},children:t.dueDate??"Upon Receipt"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-uuid",style:{background:"#faf5ff",borderColor:"#e9d5ff"},children:[e.jsx("div",{className:"inv-meta-label",children:t.workedMonth?"Worked Month":"Payment Method"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#6d28d9",fontSize:10},children:t.workedMonth??t.paymentMethod??"—"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",style:{background:"#fff7ed",borderColor:"#fed7aa"},children:[e.jsx("div",{className:"inv-meta-label",children:t.poNumber?"PO No.":t.cashier?"Cashier":"Created By"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#9a3412",fontSize:10},children:t.poNumber??t.cashier??t.createdBy??"—"})]})]}),(t.contractNumber||t.projectReference)&&e.jsxs("div",{style:{display:"flex",gap:12,marginBottom:16},children:[t.contractNumber&&e.jsxs("div",{style:{fontSize:11,color:"#475569",background:"#f1f5f9",padding:"4px 12px",borderRadius:6},children:[e.jsx("strong",{children:"Contract:"})," ",t.contractNumber]}),t.projectReference&&e.jsxs("div",{style:{fontSize:11,color:"#475569",background:"#f1f5f9",padding:"4px 12px",borderRadius:6},children:[e.jsx("strong",{children:"Project:"})," ",t.projectReference]})]}),e.jsx("div",{className:"inv-table-wrap",children:e.jsxs("table",{className:"inv-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:32,textAlign:"center"},children:"#"}),t.invoiceMode==="labor"||t.invoiceMode==="construction"?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Worker / Job Description"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Total Hrs"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Rate/Hour"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]}):t.invoiceMode==="service"?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Service Description"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Rate"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"SKU / Description / الوصف"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Unit Price"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Disc %"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]})]})}),e.jsx("tbody",{children:i.map((p,S)=>{const z=_(p.quantity),x=t.invoiceMode==="labor"||t.invoiceMode==="construction"?_(p.ratePerHour??p.unitPrice):_(p.unitPrice),N=_(p.totalHours??z),y=t.invoiceMode==="labor"||t.invoiceMode==="construction"?N*x:z*x,v=_(p.discountPercent??0),T=y*(v/100),w=y-T,j=_(p.taxPercent),b=w*(j/100),E=p.totalAmount&&_(p.totalAmount)||w+b;return e.jsxs("tr",{children:[e.jsx("td",{style:{textAlign:"center"},children:e.jsx("span",{className:"inv-row-num",children:S+1})}),e.jsxs("td",{children:[e.jsxs("div",{className:"inv-item-desc",children:[p.sku&&e.jsxs("span",{style:{color:"#64748b",fontFamily:"monospace",fontSize:11},children:["[",p.sku,"] "]}),p.description]}),p.descriptionAr&&e.jsx("div",{className:"inv-item-desc-ar",children:p.descriptionAr})]}),t.invoiceMode==="labor"||t.invoiceMode==="construction"?e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:p.unit||"d"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:N.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(x)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(b)}),e.jsx("td",{className:"inv-table-number",children:q(w+b)})]}):t.invoiceMode==="service"?e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:p.unit||"service"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:z.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(x)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(b)}),e.jsx("td",{className:"inv-table-number",children:q(w+b)})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:p.unit||"pcs"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:z.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(x)}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:v>0?`${v}%`:"—"}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(b)}),e.jsx("td",{className:"inv-table-number",children:q(E)})]})]},p.id??S)})})]})}),e.jsxs("div",{className:"inv-footer-grid",children:[e.jsxs("div",{children:[e.jsx("div",{className:"inv-totals",style:{marginBottom:12},children:e.jsxs("div",{className:"inv-totals-row",style:{background:"#f8fafc",flexDirection:"column",alignItems:"flex-start",gap:4},children:[e.jsx("span",{className:"inv-totals-label",style:{fontSize:10,textTransform:"uppercase",letterSpacing:".05em"},children:"Amount in Words / المبلغ بالكلمات"}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#1e293b",lineHeight:1.4},children:$n(k)}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#1e293b",direction:"rtl",lineHeight:1.4},children:er(k)})]})}),(t.notes||t.terms||r.invoiceTerms)&&e.jsxs("div",{className:"inv-notes",children:[e.jsx("div",{style:{fontWeight:700,marginBottom:6,color:"#6d28d9"},children:"Terms & Notes / الشروط والملاحظات"}),e.jsx("div",{style:{lineHeight:1.7},children:t.notes||t.terms||r.invoiceTerms})]})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{className:"inv-totals",children:[e.jsxs("div",{className:"inv-totals-row inv-totals-row-sub",children:[e.jsx("span",{className:"inv-totals-label",children:"Subtotal / المجموع الفرعي"}),e.jsxs("span",{className:"inv-totals-value",children:[q(g)," ",l]})]}),_(t.discountAmount)>0&&e.jsxs("div",{className:"inv-totals-row",style:{background:"#fefce8"},children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Discount / الخصم"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#ca8a04"},children:["-",q(t.discountAmount)," ",l]})]}),e.jsxs("div",{className:"inv-totals-row",style:{background:"#f8fafc"},children:[e.jsx("span",{className:"inv-totals-label",children:"Taxable Amount / المبلغ الخاضع للضريبة"}),e.jsxs("span",{className:"inv-totals-value",children:[q(_(t.taxableAmount)||g)," ",l]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-vat",children:[e.jsxs("span",{className:"inv-totals-label",children:["VAT ",m,"% / ضريبة القيمة المضافة"]}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#059669"},children:[q(C)," ",l]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-total",children:[e.jsx("span",{className:"inv-totals-label-white",children:"GRAND TOTAL / الإجمالي الكلي"}),e.jsxs("span",{className:"inv-totals-value-big",children:[q(k)," ",l]})]}),M>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-paid",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Paid / المدفوع"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#854d0e"},children:[q(M)," ",l]})]}),_(t.balanceDue)>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[q(t.balanceDue)," ",l]})]}),M<=0&&_(t.balanceDue)<=0&&A>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[q(A)," ",l]})]})]}),d&&e.jsxs("div",{className:"inv-qr-box",children:[e.jsx("img",{src:d,alt:"ZATCA QR",className:"inv-qr-img"}),e.jsx("div",{className:"inv-qr-label",children:"ZATCA Phase 2 QR Code"}),e.jsx("div",{className:"inv-qr-label-ar",children:"رمز الاستجابة السريعة - هيئة الزكاة والضريبة"})]})]})]}),e.jsxs("div",{className:"inv-compliance",children:[e.jsx("div",{style:{textAlign:"center",marginBottom:14},children:e.jsx("span",{style:{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#64748b",background:"#f1f5f9",padding:"4px 16px",borderRadius:100},children:"⚖️ Saudi Arabia — ZATCA Compliance Information / معلومات الامتثال الضريبي"})}),e.jsxs("div",{className:"inv-compliance-grid",children:[e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-zatca",children:[e.jsx("div",{className:"inv-compliance-label",children:"🏛 ZATCA VAT Number"}),e.jsx("div",{className:"inv-compliance-value",children:r.taxNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"الرقم الضريبي للبائع"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-vat",children:[e.jsx("div",{className:"inv-compliance-label",children:"📋 Commercial Registration"}),e.jsx("div",{className:"inv-compliance-value",children:r.crNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"السجل التجاري"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-cr",children:[e.jsx("div",{className:"inv-compliance-label",children:"🔐 ZATCA Status"}),e.jsxs("div",{className:"inv-compliance-value",style:{color:f.color},children:[f.label," / ",t.zatcaStatus??"Pending"]}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"حالة ZATCA"})]})]}),t.hash&&e.jsxs("div",{style:{marginTop:14,padding:"8px 14px",borderRadius:10,background:"#f8fafc",border:"1px solid #e2e8f0",fontSize:10,color:"#64748b",wordBreak:"break-all",textAlign:"center"},children:[e.jsx("strong",{children:"Invoice Hash / تجزئة الفاتورة:"})," ",t.hash]})]}),r.website&&e.jsx("div",{style:{textAlign:"center",marginTop:16,fontSize:11,color:"#64748b"},children:r.website}),e.jsxs("div",{className:"inv-watermark",children:["This invoice was generated in compliance with Saudi Arabia's ZATCA e-Invoicing Phase 2 regulations.",e.jsx("br",{}),"تم إنشاء هذه الفاتورة وفقًا لأنظمة الفوترة الإلكترونية للمرحلة الثانية من هيئة الزكاة والضريبة والجمارك"]})]})]})]})});nr.displayName="SaudiInvoicePrint";function pr(){const{data:t,refetch:r}=U.sales.invoiceList.useQuery(void 0),{data:a}=U.sales.customerList.useQuery(void 0),{data:i,refetch:n}=U.inventory.productList.useQuery(void 0),{data:s,refetch:d}=U.inventory.categoryList.useQuery(void 0),{data:o}=U.settings.companySettingsGet.useQuery(),l=U.sales.invoiceCreate.useMutation({onSuccess:()=>{r(),D.success("Bill created"),mt()},onError:c=>D.error(c.message)}),h=U.sales.invoiceUpdate.useMutation({onSuccess:()=>{r(),D.success("Invoice updated")},onError:c=>D.error(c.message)});U.sales.invoiceDelete.useMutation({onSuccess:()=>{r(),D.success("Invoice deleted")},onError:c=>D.error(c.message)}),U.sales.invoiceUpdateStatus.useMutation({onSuccess:()=>r()}),U.zatca.generateXml.useMutation({onSuccess:()=>{D.success("ZATCA UBL XML generated"),r()},onError:c=>D.error(c.message)}),U.zatca.generateQrCode.useMutation({onSuccess:()=>{D.success("ZATCA QR generated"),r()},onError:c=>D.error(c.message)}),U.zatca.signInvoice.useMutation({onSuccess:()=>{D.success("Invoice signed"),r()},onError:c=>D.error(c.message)}),U.zatca.clearanceInvoice.useMutation({onSuccess:()=>D.success("ZATCA clearance logged"),onError:c=>D.error(c.message)}),U.zatca.reportInvoice.useMutation({onSuccess:()=>D.success("ZATCA reporting logged"),onError:c=>D.error(c.message)}),U.zatca.syncStatus.useMutation({onSuccess:()=>D.success("ZATCA status synced"),onError:c=>D.error(c.message)}),U.whatsapp.sendInvoiceCreated.useMutation({onSuccess:()=>D.success("Invoice sent on WhatsApp"),onError:c=>D.error(c.message)});const u=U.inventory.productCreate.useMutation({onSuccess:()=>{n(),D.success("Product added")},onError:c=>D.error(c.message)}),f=U.inventory.categoryCreate.useMutation({onSuccess:()=>{d(),D.success("Category created")},onError:c=>D.error(c.message)}),[m,g]=R.useState([]),[C,k]=R.useState(0),[M,A]=R.useState(""),[P,p]=R.useState(""),[S,z]=R.useState(""),[x,N]=R.useState(""),[y,v]=R.useState(0),[T,w]=R.useState(""),[j,b]=R.useState(""),[E,V]=R.useState(!1),[G,xe]=R.useState(-1),se=R.useRef(null),[ce,de]=R.useState(null),[X,ve]=R.useState(null),[$,Ne]=R.useState(""),[K,ue]=R.useState("standard"),[O,H]=R.useState(!1),[J,ae]=R.useState(""),[it,st]=R.useState(""),[at,ot]=R.useState(""),[lt,ct]=R.useState(""),[Ce,Ae]=R.useState(void 0),[nn,be]=R.useState(!1),[Se,Te]=R.useState(""),[dt,ke]=R.useState("");R.useRef(null);const rn=U.sales.invoiceGet.useQuery({id:ce},{enabled:!!ce}),Y=o?.defaultCurrency||"SAR",he=Number(o?.vatRate??15),Ee=o?.companyName||o?.companyNameAr||"Company Name",Pe=o?.companyNameAr||"",ut=o?.address||"",ht=o?.phone||"",Ie=o?.taxNumber||o?.vatNumber||"",ft=o?.logo||"";o?.country;const ye=m.reduce((c,I)=>c+I.price*I.qty,0),Be=Math.max(0,ye-y),fe=Be*he/100,we=Be+fe,sn=(i||[]).filter(c=>!j||(c.name||"").toLowerCase().includes(j.toLowerCase())),ge=(a||[]).filter(c=>!M||(c.name||"").toLowerCase().includes(M.toLowerCase())).slice(0,10);R.useEffect(()=>{const c=I=>{se.current&&!se.current.contains(I.target)&&V(!1)};return document.addEventListener("click",c),()=>document.removeEventListener("click",c)},[]);const an=c=>{g(I=>I.find(B=>B.id===c.id)?I.map(B=>B.id===c.id?{...B,qty:B.qty+1}:B):[...I,{id:c.id,name:c.name||"Item",price:Number(c.price||0),qty:1,sku:c.sku}])},gt=(c,I)=>{g(F=>F.map((B,L)=>L===c?{...B,qty:Math.max(1,B.qty+I)}:B))},on=(c,I)=>{g(F=>F.map((B,L)=>L===c?{...B,price:Math.max(0,parseFloat(I)||0)}:B))},ln=(c,I)=>{g(F=>F.map((B,L)=>L===c?{...B,name:I}:B))},cn=c=>{g(I=>I.filter((F,B)=>B!==c))},mt=()=>{g([]),k(0),A(""),p(""),z(""),N(""),v(0),w("")},pt=c=>{k(c.id),A(c.name||""),z(c.address||""),N(c.vatNumber||""),p(c.phone||""),V(!1)},dn=()=>{const c=Se.trim();c&&f.mutate({name:c,image:dt||void 0},{onSuccess:I=>{Ae(I.id),be(!1),Te(""),ke("")}})},un=()=>{const c=J.trim();if(!c){D.error("Enter product name");return}u.mutate({sku:`PRD-${Date.now().toString().slice(-6)}`,name:c,purchasePrice:it||"0",salePrice:at||"0",image:lt||void 0,categoryId:Ce},{onSuccess:()=>{H(!1),ae(""),st(""),ot(""),ct(""),Ae(void 0),be(!1),Te(""),ke("")}})},hn=c=>{if(c.preventDefault(),!m.length){D.error("Add at least one item to the cart");return}M.trim();const I=m.map(B=>({description:`[${B.id}] ${B.name}`,quantity:B.qty,unitPrice:B.price.toString(),taxPercent:he.toString(),totalAmount:(B.price*B.qty).toFixed(2),unit:"pcs",sku:B.sku})),F={invoiceNumber:`BILL-${Date.now().toString().slice(-6)}`,customerId:C||0,date:new Date().toISOString().slice(0,10),dueDate:"",invoiceType:K,invoiceMode:"product",subTotal:ye.toFixed(2),taxAmount:fe.toFixed(2),taxPercent:he.toString(),totalAmount:we.toFixed(2),discountAmount:y.toString(),taxableAmount:Be.toFixed(2),notes:T,items:I};X?h.mutate({id:X,...F}):l.mutate(F)},fn=()=>{const c=m.length>0?m.map((L,te)=>({no:te+1,name:L.name,qty:L.qty,rate:L.price,total:L.price*L.qty})):[];if(c.length===0&&!ce){D.error("Add items to cart before printing");return}const I=btoa(JSON.stringify({seller:Pe||Ee,vat:Ie,total:we.toFixed(2),tax:fe.toFixed(2),date:new Date().toISOString()})),F=`<!DOCTYPE html>
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
<h1>${Ee}</h1>${Pe?`<h2>${Pe}</h2>`:""}
${ft?`<img src="${ft}" style="max-width:60px;max-height:40px">`:""}
${ut?`<div class="info-line">${ut}</div>`:""}
${ht?`<div class="info-line">${ht}</div>`:""}
${Ie?`<div class="info-line"><strong>VAT: ${Ie}</strong></div>`:""}
</div>
<div class="qr-section" style="width:120px">
<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(I)}" style="width:100px;height:100px">
<p>${K==="zatca"?"ZATCA QR":"Invoice QR"}</p>
</div>
</div>
<div class="title">TAX INVOICE / فاتورة ضريبية<span class="badge">${K==="zatca"?"ZATCA":"Standard"}</span></div>
<div class="customer">
<h3>Customer / العميل</h3>
<p><strong>${M||"Walk-in Customer"}</strong></p>
${P?`<p>Phone: ${P}</p>`:""}
${S?`<p>Address: ${S}</p>`:""}
${x?`<p>VAT: ${x}</p>`:""}
</div>
<table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
${c.map(L=>`<tr><td>${L.no}</td><td>${L.name}</td><td>${L.qty}</td><td>${L.rate.toFixed(2)}</td><td>${L.total.toFixed(2)}</td></tr>`).join("")}
</tbody></table>
<div class="totals">
<div class="total-row"><span>Subtotal:</span><span>${Y} ${ye.toFixed(2)}</span></div>
${y>0?`<div class="total-row"><span>Discount:</span><span>-${Y} ${y.toFixed(2)}</span></div>`:""}
<div class="total-row"><span>VAT ${he}%:</span><span>${Y} ${fe.toFixed(2)}</span></div>
<div class="total-row grand"><span>TOTAL:</span><span>${Y} ${we.toFixed(2)}</span></div>
</div>
${T?`<div style="margin-top:15px;padding:10px;background:#f9f9fa;border-radius:5px;font-size:13px"><strong>Note:</strong> ${T}</div>`:""}
<div class="footer">شكراً لتعاملكم معنا / Thank You For Your Business!</div>
</div>
<script>window.onload=function(){window.print();}<\/script></body></html>`,B=window.open("","_blank");if(!B){const L=new Blob([F],{type:"text/html"}),te=URL.createObjectURL(L),me=document.createElement("a");me.href=te,me.target="_blank",me.click(),URL.revokeObjectURL(te);return}B.document.write(F),B.document.close()},gn=t?.filter(c=>!$||$==="all"||c.status===$)||[];return rn.data?.invoice?.id,e.jsxs("div",{className:"h-screen flex flex-col",children:[e.jsx("div",{className:"p-4 border-b bg-white",children:e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold",children:"Invoices / فواتير"}),e.jsxs("p",{className:"text-slate-500 text-sm",children:[gn.length," invoices"]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(xt,{value:$,onValueChange:Ne,children:[e.jsx(vt,{className:"w-36",children:e.jsx(bt,{placeholder:"Filter by status"})}),e.jsxs(yt,{children:[e.jsx(ne,{value:"all",children:"All Status"}),e.jsx(ne,{value:"draft",children:"Draft"}),e.jsx(ne,{value:"sent",children:"Sent"}),e.jsx(ne,{value:"paid",children:"Paid"}),e.jsx(ne,{value:"overdue",children:"Overdue"})]})]}),e.jsx(oe,{variant:"outline",size:"sm",onClick:()=>{mt(),ve(null),de(null)},children:"New Bill"})]})]})}),e.jsxs("div",{className:"flex-1 overflow-hidden flex",children:[e.jsxs("div",{className:"w-1/2 border-r p-4 overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-4",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx(xn,{className:"absolute left-3 top-2.5 h-4 w-4 text-slate-400"}),e.jsx(Q,{className:"pl-9",placeholder:"Search products...",value:j,onChange:c=>b(c.target.value)})]}),e.jsxs(oe,{variant:"outline",size:"sm",onClick:()=>H(!0),children:[e.jsx(Me,{className:"h-4 w-4 mr-1"})," Add Product"]})]}),e.jsx(vn,{open:O,onOpenChange:H,children:e.jsxs(bn,{children:[e.jsx(yn,{children:e.jsx(wn,{children:"Add Product"})}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx(W,{className:"text-xs",children:"Product Name"}),e.jsx(Q,{value:J,onChange:c=>ae(c.target.value),placeholder:"e.g. Office Chair"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsxs(W,{className:"text-xs",children:["Buying Price (",Y,")"]}),e.jsx(Q,{type:"number",value:it,onChange:c=>st(c.target.value),placeholder:"0.00"})]}),e.jsxs("div",{children:[e.jsxs(W,{className:"text-xs",children:["Sale Price (",Y,")"]}),e.jsx(Q,{type:"number",value:at,onChange:c=>ot(c.target.value),placeholder:"0.00"})]})]}),e.jsxs("div",{children:[e.jsx(W,{className:"text-xs",children:"Cover Image"}),e.jsx(wt,{value:lt,onChange:ct})]}),e.jsxs("div",{children:[e.jsx(W,{className:"text-xs",children:"Category"}),e.jsxs(xt,{value:Ce?String(Ce):void 0,onValueChange:c=>{if(c==="__new"){be(!0);return}Ae(Number(c)),be(!1)},children:[e.jsx(vt,{children:e.jsx(bt,{placeholder:"Select category"})}),e.jsxs(yt,{children:[s?.map(c=>e.jsx(ne,{value:String(c.id),children:c.name},c.id)),e.jsx(ne,{value:"__new",children:"+ New Category"})]})]}),nn&&e.jsxs("div",{className:"mt-2 space-y-2",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx(Q,{value:Se,onChange:c=>Te(c.target.value),placeholder:"Category name",className:"h-8 text-xs"}),e.jsx(oe,{size:"sm",onClick:dn,disabled:!Se.trim()||f.isPending,children:"Add"})]}),e.jsx(wt,{value:dt,onChange:ke})]})]}),e.jsxs(oe,{className:"w-full",onClick:un,disabled:!J.trim()||u.isPending,children:[e.jsx(Me,{className:"h-4 w-4 mr-2"})," Add Product"]})]})]})}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3",children:[!i?.length&&e.jsxs("div",{className:"col-span-full text-center py-10 text-slate-400",children:["No products yet.",e.jsx("br",{}),e.jsx("span",{className:"text-blue-500 font-medium",children:'Click "Add Product" to create one.'})]}),sn.map(c=>e.jsxs("button",{onClick:()=>an({id:String(c.id),name:c.name||"",price:Number(c.salePrice||c.price||0),sku:c.sku}),className:"border-2 border-slate-200 rounded-lg p-3 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors active:scale-95",children:[c.image?e.jsx("img",{src:c.image,alt:c.name,className:"w-full h-20 object-cover rounded-md mb-1.5"}):e.jsx("div",{className:"w-full h-20 rounded-md mb-1.5 bg-slate-100 flex items-center justify-center text-slate-300",children:e.jsx(jn,{className:"h-8 w-8"})}),c.category&&e.jsx("div",{className:"text-[10px] text-slate-400 mb-1",children:c.category}),e.jsx("div",{className:"text-xs font-semibold text-slate-700 line-clamp-2 min-h-[32px]",children:c.name}),e.jsxs("div",{className:"text-sm font-bold text-emerald-600 mt-2",children:[Y," ",Number(c.salePrice||c.price||0).toFixed(2)]})]},c.id))]})]}),e.jsxs("div",{className:"w-1/2 p-4 overflow-y-auto",children:[e.jsx("h3",{className:"font-semibold text-slate-800 mb-3",children:"Create Bill"}),e.jsxs("div",{className:"mb-3 relative",ref:se,children:[e.jsx(W,{className:"text-xs",children:"Customer Name"}),e.jsx(Q,{placeholder:"Type customer name...",value:M,onChange:c=>{A(c.target.value),V(c.target.value.length>=2)},onKeyDown:c=>{!E||!ge.length||(c.key==="ArrowDown"?(c.preventDefault(),xe(I=>Math.min(I+1,ge.length-1))):c.key==="ArrowUp"?(c.preventDefault(),xe(I=>Math.max(I-1,0))):c.key==="Enter"&&G>=0?(c.preventDefault(),pt(ge[G])):c.key==="Escape"&&V(!1))}}),E&&ge.length>0&&e.jsx("div",{className:"absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-b-lg max-h-40 overflow-y-auto z-50 shadow-lg",children:ge.map((c,I)=>e.jsxs("div",{className:`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 ${I===G?"bg-blue-50":""}`,onClick:()=>pt({id:c.id,name:c.name,address:c.address,vatNumber:c.vatNumber,phone:c.phone}),children:[e.jsx("div",{className:"font-medium",children:c.name}),e.jsxs("div",{className:"text-[11px] text-slate-400",children:[c.vatNumber?`VAT: ${c.vatNumber}`:""," ",c.address?`· ${c.address}`:""]})]},c.id))})]}),e.jsxs("div",{className:"space-y-1 mb-3",children:[e.jsx(W,{className:"text-xs",children:"Phone"}),e.jsx(Q,{value:P,onChange:c=>p(c.target.value),placeholder:"Optional"})]}),e.jsxs("div",{className:"space-y-1 mb-3",children:[e.jsx(W,{className:"text-xs",children:"Address"}),e.jsx(Q,{value:S,onChange:c=>z(c.target.value),placeholder:"Optional"})]}),e.jsxs("div",{className:"space-y-1 mb-3",children:[e.jsx(W,{className:"text-xs",children:"Customer VAT Reg. No. (رقم ضريبي)"}),e.jsx(Q,{value:x,onChange:c=>N(c.target.value),placeholder:"e.g. 311777758600003"})]}),e.jsxs("div",{className:"border-t pt-3 max-h-[300px] overflow-y-auto space-y-2",children:[m.length===0&&e.jsxs("div",{className:"text-center py-8 text-slate-400 text-sm",children:["Cart is empty.",e.jsx("br",{}),"Select products or add custom item."]}),m.map((c,I)=>e.jsxs("div",{className:"flex items-center gap-2 border-b pb-2",children:[e.jsx("input",{className:"flex-1 min-w-0 border rounded px-2 py-1 text-xs font-medium",value:c.name,onChange:F=>ln(I,F.target.value)}),e.jsx("input",{type:"number",className:"w-16 text-center border rounded px-1 py-1 text-xs",value:c.price,onChange:F=>on(I,F.target.value)}),e.jsx("button",{onClick:()=>gt(I,-1),className:"w-6 h-6 border rounded flex items-center justify-center hover:bg-slate-100",children:e.jsx(Tn,{className:"h-3 w-3"})}),e.jsx("input",{type:"number",className:"w-10 text-center border rounded px-1 py-1 text-xs",value:c.qty,onChange:F=>{const B=Math.max(1,parseInt(F.target.value)||1);g(L=>L.map((te,me)=>me===I?{...te,qty:B}:te))}}),e.jsx("button",{onClick:()=>gt(I,1),className:"w-6 h-6 border rounded flex items-center justify-center hover:bg-slate-100",children:e.jsx(Me,{className:"h-3 w-3"})}),e.jsx("div",{className:"text-xs font-semibold text-slate-700 w-16 text-right",children:(c.price*c.qty).toFixed(2)}),e.jsx("button",{onClick:()=>cn(I),className:"text-red-500 hover:text-red-700",children:e.jsx(Cn,{className:"h-3.5 w-3.5"})})]},I))]}),e.jsxs("div",{className:"border-t pt-3 space-y-1 text-sm",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Subtotal:"}),e.jsxs("span",{children:[Y," ",ye.toFixed(2)]})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:"Discount:"}),e.jsx(Q,{type:"number",className:"w-20 h-7 text-xs text-right",value:y,onChange:c=>v(parseFloat(c.target.value)||0)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("span",{children:["VAT (",he,"%):"]}),e.jsxs("span",{children:[Y," ",fe.toFixed(2)]})]}),e.jsxs("div",{className:"flex justify-between font-bold text-base border-t pt-2",children:[e.jsx("span",{children:"Total:"}),e.jsxs("span",{className:"text-emerald-600",children:[Y," ",we.toFixed(2)]})]})]}),e.jsxs("div",{className:"mt-3",children:[e.jsx(W,{className:"text-xs",children:"Note"}),e.jsx(Q,{value:T,onChange:c=>w(c.target.value),placeholder:"Optional",className:"h-8 text-xs"})]}),e.jsxs("div",{className:"mt-3 p-3 rounded-lg border bg-slate-50",children:[e.jsx(W,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Invoice Type / نوع الفاتورة"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:()=>ue("standard"),className:`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition-all ${K==="standard"?"bg-blue-600 text-white border-blue-600":"bg-white text-slate-600 border-slate-300 hover:bg-slate-100"}`,children:"📄 Standard"}),e.jsx("button",{type:"button",onClick:()=>ue("zatca"),className:`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition-all ${K==="zatca"?"bg-emerald-600 text-white border-emerald-600":"bg-white text-slate-600 border-slate-300 hover:bg-slate-100"}`,children:"🇸🇦 ZATCA"})]}),e.jsx("p",{className:"text-[10px] text-slate-400 mt-1",children:K==="zatca"?"ZATCA compliant (TLV QR + XML). Requires valid VAT number in Settings.":"Standard invoice with QR code. Works without ZATCA setup."})]}),e.jsxs("div",{className:"flex gap-2 mt-4",children:[e.jsxs(oe,{className:"flex-1",onClick:hn,disabled:l.isPending||h.isPending,children:[e.jsx(Nn,{className:"h-4 w-4 mr-2"})," ",X?"Update":"Create Bill"]}),e.jsx(oe,{variant:"outline",onClick:fn,disabled:!m.length,children:e.jsx(An,{className:"h-4 w-4"})})]})]})]})]})}export{pr as default};
