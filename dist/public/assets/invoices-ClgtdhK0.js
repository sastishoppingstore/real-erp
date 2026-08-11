import{j as e}from"./ui-2_2xY0sS.js";import{g as un,r as B}from"./vendor-Dj4APJbq.js";import{u as fn}from"./query-CzjcNskh.js";import{M as F,B as Q,ab as ae,ay as hn,al as gn,am as mn,ao as pn,aF as xn,ap as vn,av as bn}from"./index-BFMJpqkn.js";import{L as le}from"./label-DjOqqD2g.js";import{t as R}from"./index-C7Qn3gX3.js";import{E as yn}from"./eye-j591psUG.js";import{P as ft}from"./pencil-B6f0FtHN.js";import{T as ht}from"./trash-2-BawVjfOL.js";import"./charts-CClYrlZQ.js";var ce={},ke,gt;function wn(){return gt||(gt=1,ke=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then}),ke}var Be={},ee={},mt;function re(){if(mt)return ee;mt=1;let t;const i=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];return ee.getSymbolSize=function(r){if(!r)throw new Error('"version" cannot be null or undefined');if(r<1||r>40)throw new Error('"version" should be in range from 1 to 40');return r*4+17},ee.getSymbolTotalCodewords=function(r){return i[r]},ee.getBCHDigit=function(o){let r=0;for(;o!==0;)r++,o>>>=1;return r},ee.setToSJISFunction=function(r){if(typeof r!="function")throw new Error('"toSJISFunc" is not a valid function.');t=r},ee.isKanjiModeEnabled=function(){return typeof t<"u"},ee.toSJIS=function(r){return t(r)},ee}var Re={},pt;function et(){return pt||(pt=1,(function(t){t.L={bit:1},t.M={bit:0},t.Q={bit:3},t.H={bit:2};function i(o){if(typeof o!="string")throw new Error("Param is not a string");switch(o.toLowerCase()){case"l":case"low":return t.L;case"m":case"medium":return t.M;case"q":case"quartile":return t.Q;case"h":case"high":return t.H;default:throw new Error("Unknown EC Level: "+o)}}t.isValid=function(r){return r&&typeof r.bit<"u"&&r.bit>=0&&r.bit<4},t.from=function(r,n){if(t.isValid(r))return r;try{return i(r)}catch{return n}}})(Re)),Re}var Me,xt;function Nn(){if(xt)return Me;xt=1;function t(){this.buffer=[],this.length=0}return t.prototype={get:function(i){const o=Math.floor(i/8);return(this.buffer[o]>>>7-i%8&1)===1},put:function(i,o){for(let r=0;r<o;r++)this.putBit((i>>>o-r-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(i){const o=Math.floor(this.length/8);this.buffer.length<=o&&this.buffer.push(0),i&&(this.buffer[o]|=128>>>this.length%8),this.length++}},Me=t,Me}var ze,vt;function jn(){if(vt)return ze;vt=1;function t(i){if(!i||i<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=i,this.data=new Uint8Array(i*i),this.reservedBit=new Uint8Array(i*i)}return t.prototype.set=function(i,o,r,n){const s=i*this.size+o;this.data[s]=r,n&&(this.reservedBit[s]=!0)},t.prototype.get=function(i,o){return this.data[i*this.size+o]},t.prototype.xor=function(i,o,r){this.data[i*this.size+o]^=r},t.prototype.isReserved=function(i,o){return this.reservedBit[i*this.size+o]},ze=t,ze}var Le={},bt;function An(){return bt||(bt=1,(function(t){const i=re().getSymbolSize;t.getRowColCoords=function(r){if(r===1)return[];const n=Math.floor(r/7)+2,s=i(r),c=s===145?26:Math.ceil((s-13)/(2*n-2))*2,l=[s-7];for(let a=1;a<n-1;a++)l[a]=l[a-1]-c;return l.push(6),l.reverse()},t.getPositions=function(r){const n=[],s=t.getRowColCoords(r),c=s.length;for(let l=0;l<c;l++)for(let a=0;a<c;a++)l===0&&a===0||l===0&&a===c-1||l===c-1&&a===0||n.push([s[l],s[a]]);return n}})(Le)),Le}var De={},yt;function Cn(){if(yt)return De;yt=1;const t=re().getSymbolSize,i=7;return De.getPositions=function(r){const n=t(r);return[[0,0],[n-i,0],[0,n-i]]},De}var Fe={},wt;function Sn(){return wt||(wt=1,(function(t){t.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const i={N1:3,N2:3,N3:40,N4:10};t.isValid=function(n){return n!=null&&n!==""&&!isNaN(n)&&n>=0&&n<=7},t.from=function(n){return t.isValid(n)?parseInt(n,10):void 0},t.getPenaltyN1=function(n){const s=n.size;let c=0,l=0,a=0,f=null,u=null;for(let h=0;h<s;h++){l=a=0,f=u=null;for(let p=0;p<s;p++){let g=n.get(h,p);g===f?l++:(l>=5&&(c+=i.N1+(l-5)),f=g,l=1),g=n.get(p,h),g===u?a++:(a>=5&&(c+=i.N1+(a-5)),u=g,a=1)}l>=5&&(c+=i.N1+(l-5)),a>=5&&(c+=i.N1+(a-5))}return c},t.getPenaltyN2=function(n){const s=n.size;let c=0;for(let l=0;l<s-1;l++)for(let a=0;a<s-1;a++){const f=n.get(l,a)+n.get(l,a+1)+n.get(l+1,a)+n.get(l+1,a+1);(f===4||f===0)&&c++}return c*i.N2},t.getPenaltyN3=function(n){const s=n.size;let c=0,l=0,a=0;for(let f=0;f<s;f++){l=a=0;for(let u=0;u<s;u++)l=l<<1&2047|n.get(f,u),u>=10&&(l===1488||l===93)&&c++,a=a<<1&2047|n.get(u,f),u>=10&&(a===1488||a===93)&&c++}return c*i.N3},t.getPenaltyN4=function(n){let s=0;const c=n.data.length;for(let a=0;a<c;a++)s+=n.data[a];return Math.abs(Math.ceil(s*100/c/5)-10)*i.N4};function o(r,n,s){switch(r){case t.Patterns.PATTERN000:return(n+s)%2===0;case t.Patterns.PATTERN001:return n%2===0;case t.Patterns.PATTERN010:return s%3===0;case t.Patterns.PATTERN011:return(n+s)%3===0;case t.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(s/3))%2===0;case t.Patterns.PATTERN101:return n*s%2+n*s%3===0;case t.Patterns.PATTERN110:return(n*s%2+n*s%3)%2===0;case t.Patterns.PATTERN111:return(n*s%3+(n+s)%2)%2===0;default:throw new Error("bad maskPattern:"+r)}}t.applyMask=function(n,s){const c=s.size;for(let l=0;l<c;l++)for(let a=0;a<c;a++)s.isReserved(a,l)||s.xor(a,l,o(n,a,l))},t.getBestMask=function(n,s){const c=Object.keys(t.Patterns).length;let l=0,a=1/0;for(let f=0;f<c;f++){s(f),t.applyMask(f,n);const u=t.getPenaltyN1(n)+t.getPenaltyN2(n)+t.getPenaltyN3(n)+t.getPenaltyN4(n);t.applyMask(f,n),u<a&&(a=u,l=f)}return l}})(Fe)),Fe}var Ne={},Nt;function Ot(){if(Nt)return Ne;Nt=1;const t=et(),i=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],o=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];return Ne.getBlocksCount=function(n,s){switch(s){case t.L:return i[(n-1)*4+0];case t.M:return i[(n-1)*4+1];case t.Q:return i[(n-1)*4+2];case t.H:return i[(n-1)*4+3];default:return}},Ne.getTotalCodewordsCount=function(n,s){switch(s){case t.L:return o[(n-1)*4+0];case t.M:return o[(n-1)*4+1];case t.Q:return o[(n-1)*4+2];case t.H:return o[(n-1)*4+3];default:return}},Ne}var qe={},ge={},jt;function Tn(){if(jt)return ge;jt=1;const t=new Uint8Array(512),i=new Uint8Array(256);return(function(){let r=1;for(let n=0;n<255;n++)t[n]=r,i[r]=n,r<<=1,r&256&&(r^=285);for(let n=255;n<512;n++)t[n]=t[n-255]})(),ge.log=function(r){if(r<1)throw new Error("log("+r+")");return i[r]},ge.exp=function(r){return t[r]},ge.mul=function(r,n){return r===0||n===0?0:t[i[r]+i[n]]},ge}var At;function In(){return At||(At=1,(function(t){const i=Tn();t.mul=function(r,n){const s=new Uint8Array(r.length+n.length-1);for(let c=0;c<r.length;c++)for(let l=0;l<n.length;l++)s[c+l]^=i.mul(r[c],n[l]);return s},t.mod=function(r,n){let s=new Uint8Array(r);for(;s.length-n.length>=0;){const c=s[0];for(let a=0;a<n.length;a++)s[a]^=i.mul(n[a],c);let l=0;for(;l<s.length&&s[l]===0;)l++;s=s.slice(l)}return s},t.generateECPolynomial=function(r){let n=new Uint8Array([1]);for(let s=0;s<r;s++)n=t.mul(n,new Uint8Array([1,i.exp(s)]));return n}})(qe)),qe}var Ue,Ct;function En(){if(Ct)return Ue;Ct=1;const t=In();function i(o){this.genPoly=void 0,this.degree=o,this.degree&&this.initialize(this.degree)}return i.prototype.initialize=function(r){this.degree=r,this.genPoly=t.generateECPolynomial(this.degree)},i.prototype.encode=function(r){if(!this.genPoly)throw new Error("Encoder not initialized");const n=new Uint8Array(r.length+this.degree);n.set(r);const s=t.mod(n,this.genPoly),c=this.degree-s.length;if(c>0){const l=new Uint8Array(this.degree);return l.set(s,c),l}return s},Ue=i,Ue}var Ve={},_e={},He={},St;function Qt(){return St||(St=1,He.isValid=function(i){return!isNaN(i)&&i>=1&&i<=40}),He}var Z={},Tt;function Wt(){if(Tt)return Z;Tt=1;const t="[0-9]+",i="[A-Z $%*+\\-./:]+";let o="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";o=o.replace(/u/g,"\\u");const r="(?:(?![A-Z0-9 $%*+\\-./:]|"+o+`)(?:.|[\r
]))+`;Z.KANJI=new RegExp(o,"g"),Z.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),Z.BYTE=new RegExp(r,"g"),Z.NUMERIC=new RegExp(t,"g"),Z.ALPHANUMERIC=new RegExp(i,"g");const n=new RegExp("^"+o+"$"),s=new RegExp("^"+t+"$"),c=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");return Z.testKanji=function(a){return n.test(a)},Z.testNumeric=function(a){return s.test(a)},Z.testAlphanumeric=function(a){return c.test(a)},Z}var It;function se(){return It||(It=1,(function(t){const i=Qt(),o=Wt();t.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},t.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},t.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},t.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},t.MIXED={bit:-1},t.getCharCountIndicator=function(s,c){if(!s.ccBits)throw new Error("Invalid mode: "+s);if(!i.isValid(c))throw new Error("Invalid version: "+c);return c>=1&&c<10?s.ccBits[0]:c<27?s.ccBits[1]:s.ccBits[2]},t.getBestModeForData=function(s){return o.testNumeric(s)?t.NUMERIC:o.testAlphanumeric(s)?t.ALPHANUMERIC:o.testKanji(s)?t.KANJI:t.BYTE},t.toString=function(s){if(s&&s.id)return s.id;throw new Error("Invalid mode")},t.isValid=function(s){return s&&s.bit&&s.ccBits};function r(n){if(typeof n!="string")throw new Error("Param is not a string");switch(n.toLowerCase()){case"numeric":return t.NUMERIC;case"alphanumeric":return t.ALPHANUMERIC;case"kanji":return t.KANJI;case"byte":return t.BYTE;default:throw new Error("Unknown mode: "+n)}}t.from=function(s,c){if(t.isValid(s))return s;try{return r(s)}catch{return c}}})(_e)),_e}var Et;function Pn(){return Et||(Et=1,(function(t){const i=re(),o=Ot(),r=et(),n=se(),s=Qt(),c=7973,l=i.getBCHDigit(c);function a(p,g,b){for(let y=1;y<=40;y++)if(g<=t.getCapacity(y,b,p))return y}function f(p,g){return n.getCharCountIndicator(p,g)+4}function u(p,g){let b=0;return p.forEach(function(y){const M=f(y.mode,g);b+=M+y.getBitsLength()}),b}function h(p,g){for(let b=1;b<=40;b++)if(u(p,b)<=t.getCapacity(b,g,n.MIXED))return b}t.from=function(g,b){return s.isValid(g)?parseInt(g,10):b},t.getCapacity=function(g,b,y){if(!s.isValid(g))throw new Error("Invalid QR Code version");typeof y>"u"&&(y=n.BYTE);const M=i.getSymbolTotalCodewords(g),C=o.getTotalCodewordsCount(g,b),E=(M-C)*8;if(y===n.MIXED)return E;const m=E-f(y,g);switch(y){case n.NUMERIC:return Math.floor(m/10*3);case n.ALPHANUMERIC:return Math.floor(m/11*2);case n.KANJI:return Math.floor(m/13);case n.BYTE:default:return Math.floor(m/8)}},t.getBestVersionForData=function(g,b){let y;const M=r.from(b,r.M);if(Array.isArray(g)){if(g.length>1)return h(g,M);if(g.length===0)return 1;y=g[0]}else y=g;return a(y.mode,y.getLength(),M)},t.getEncodedBits=function(g){if(!s.isValid(g)||g<7)throw new Error("Invalid QR Code version");let b=g<<12;for(;i.getBCHDigit(b)-l>=0;)b^=c<<i.getBCHDigit(b)-l;return g<<12|b}})(Ve)),Ve}var Oe={},Pt;function kn(){if(Pt)return Oe;Pt=1;const t=re(),i=1335,o=21522,r=t.getBCHDigit(i);return Oe.getEncodedBits=function(s,c){const l=s.bit<<3|c;let a=l<<10;for(;t.getBCHDigit(a)-r>=0;)a^=i<<t.getBCHDigit(a)-r;return(l<<10|a)^o},Oe}var Qe={},We,kt;function Bn(){if(kt)return We;kt=1;const t=se();function i(o){this.mode=t.NUMERIC,this.data=o.toString()}return i.getBitsLength=function(r){return 10*Math.floor(r/3)+(r%3?r%3*3+1:0)},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(r){let n,s,c;for(n=0;n+3<=this.data.length;n+=3)s=this.data.substr(n,3),c=parseInt(s,10),r.put(c,10);const l=this.data.length-n;l>0&&(s=this.data.substr(n),c=parseInt(s,10),r.put(c,l*3+1))},We=i,We}var Ke,Bt;function Rn(){if(Bt)return Ke;Bt=1;const t=se(),i=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function o(r){this.mode=t.ALPHANUMERIC,this.data=r}return o.getBitsLength=function(n){return 11*Math.floor(n/2)+6*(n%2)},o.prototype.getLength=function(){return this.data.length},o.prototype.getBitsLength=function(){return o.getBitsLength(this.data.length)},o.prototype.write=function(n){let s;for(s=0;s+2<=this.data.length;s+=2){let c=i.indexOf(this.data[s])*45;c+=i.indexOf(this.data[s+1]),n.put(c,11)}this.data.length%2&&n.put(i.indexOf(this.data[s]),6)},Ke=o,Ke}var Je,Rt;function Mn(){if(Rt)return Je;Rt=1;const t=se();function i(o){this.mode=t.BYTE,typeof o=="string"?this.data=new TextEncoder().encode(o):this.data=new Uint8Array(o)}return i.getBitsLength=function(r){return r*8},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(o){for(let r=0,n=this.data.length;r<n;r++)o.put(this.data[r],8)},Je=i,Je}var Ye,Mt;function zn(){if(Mt)return Ye;Mt=1;const t=se(),i=re();function o(r){this.mode=t.KANJI,this.data=r}return o.getBitsLength=function(n){return n*13},o.prototype.getLength=function(){return this.data.length},o.prototype.getBitsLength=function(){return o.getBitsLength(this.data.length)},o.prototype.write=function(r){let n;for(n=0;n<this.data.length;n++){let s=i.toSJIS(this.data[n]);if(s>=33088&&s<=40956)s-=33088;else if(s>=57408&&s<=60351)s-=49472;else throw new Error("Invalid SJIS character: "+this.data[n]+`
Make sure your charset is UTF-8`);s=(s>>>8&255)*192+(s&255),r.put(s,13)}},Ye=o,Ye}var Ze={exports:{}},zt;function Ln(){return zt||(zt=1,(function(t){var i={single_source_shortest_paths:function(o,r,n){var s={},c={};c[r]=0;var l=i.PriorityQueue.make();l.push(r,0);for(var a,f,u,h,p,g,b,y,M;!l.empty();){a=l.pop(),f=a.value,h=a.cost,p=o[f]||{};for(u in p)p.hasOwnProperty(u)&&(g=p[u],b=h+g,y=c[u],M=typeof c[u]>"u",(M||y>b)&&(c[u]=b,l.push(u,b),s[u]=f))}if(typeof n<"u"&&typeof c[n]>"u"){var C=["Could not find a path from ",r," to ",n,"."].join("");throw new Error(C)}return s},extract_shortest_path_from_predecessor_list:function(o,r){for(var n=[],s=r;s;)n.push(s),o[s],s=o[s];return n.reverse(),n},find_path:function(o,r,n){var s=i.single_source_shortest_paths(o,r,n);return i.extract_shortest_path_from_predecessor_list(s,n)},PriorityQueue:{make:function(o){var r=i.PriorityQueue,n={},s;o=o||{};for(s in r)r.hasOwnProperty(s)&&(n[s]=r[s]);return n.queue=[],n.sorter=o.sorter||r.default_sorter,n},default_sorter:function(o,r){return o.cost-r.cost},push:function(o,r){var n={value:o,cost:r};this.queue.push(n),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};t.exports=i})(Ze)),Ze.exports}var Lt;function Dn(){return Lt||(Lt=1,(function(t){const i=se(),o=Bn(),r=Rn(),n=Mn(),s=zn(),c=Wt(),l=re(),a=Ln();function f(C){return unescape(encodeURIComponent(C)).length}function u(C,E,m){const T=[];let z;for(;(z=C.exec(m))!==null;)T.push({data:z[0],index:z.index,mode:E,length:z[0].length});return T}function h(C){const E=u(c.NUMERIC,i.NUMERIC,C),m=u(c.ALPHANUMERIC,i.ALPHANUMERIC,C);let T,z;return l.isKanjiModeEnabled()?(T=u(c.BYTE,i.BYTE,C),z=u(c.KANJI,i.KANJI,C)):(T=u(c.BYTE_KANJI,i.BYTE,C),z=[]),E.concat(m,T,z).sort(function(w,S){return w.index-S.index}).map(function(w){return{data:w.data,mode:w.mode,length:w.length}})}function p(C,E){switch(E){case i.NUMERIC:return o.getBitsLength(C);case i.ALPHANUMERIC:return r.getBitsLength(C);case i.KANJI:return s.getBitsLength(C);case i.BYTE:return n.getBitsLength(C)}}function g(C){return C.reduce(function(E,m){const T=E.length-1>=0?E[E.length-1]:null;return T&&T.mode===m.mode?(E[E.length-1].data+=m.data,E):(E.push(m),E)},[])}function b(C){const E=[];for(let m=0;m<C.length;m++){const T=C[m];switch(T.mode){case i.NUMERIC:E.push([T,{data:T.data,mode:i.ALPHANUMERIC,length:T.length},{data:T.data,mode:i.BYTE,length:T.length}]);break;case i.ALPHANUMERIC:E.push([T,{data:T.data,mode:i.BYTE,length:T.length}]);break;case i.KANJI:E.push([T,{data:T.data,mode:i.BYTE,length:f(T.data)}]);break;case i.BYTE:E.push([{data:T.data,mode:i.BYTE,length:f(T.data)}])}}return E}function y(C,E){const m={},T={start:{}};let z=["start"];for(let x=0;x<C.length;x++){const w=C[x],S=[];for(let v=0;v<w.length;v++){const I=w[v],j=""+x+v;S.push(j),m[j]={node:I,lastCount:0},T[j]={};for(let A=0;A<z.length;A++){const N=z[A];m[N]&&m[N].node.mode===I.mode?(T[N][j]=p(m[N].lastCount+I.length,I.mode)-p(m[N].lastCount,I.mode),m[N].lastCount+=I.length):(m[N]&&(m[N].lastCount=I.length),T[N][j]=p(I.length,I.mode)+4+i.getCharCountIndicator(I.mode,E))}}z=S}for(let x=0;x<z.length;x++)T[z[x]].end=0;return{map:T,table:m}}function M(C,E){let m;const T=i.getBestModeForData(C);if(m=i.from(E,T),m!==i.BYTE&&m.bit<T.bit)throw new Error('"'+C+'" cannot be encoded with mode '+i.toString(m)+`.
 Suggested mode is: `+i.toString(T));switch(m===i.KANJI&&!l.isKanjiModeEnabled()&&(m=i.BYTE),m){case i.NUMERIC:return new o(C);case i.ALPHANUMERIC:return new r(C);case i.KANJI:return new s(C);case i.BYTE:return new n(C)}}t.fromArray=function(E){return E.reduce(function(m,T){return typeof T=="string"?m.push(M(T,null)):T.data&&m.push(M(T.data,T.mode)),m},[])},t.fromString=function(E,m){const T=h(E,l.isKanjiModeEnabled()),z=b(T),x=y(z,m),w=a.find_path(x.map,"start","end"),S=[];for(let v=1;v<w.length-1;v++)S.push(x.table[w[v]].node);return t.fromArray(g(S))},t.rawSplit=function(E){return t.fromArray(h(E,l.isKanjiModeEnabled()))}})(Qe)),Qe}var Dt;function Fn(){if(Dt)return Be;Dt=1;const t=re(),i=et(),o=Nn(),r=jn(),n=An(),s=Cn(),c=Sn(),l=Ot(),a=En(),f=Pn(),u=kn(),h=se(),p=Dn();function g(x,w){const S=x.size,v=s.getPositions(w);for(let I=0;I<v.length;I++){const j=v[I][0],A=v[I][1];for(let N=-1;N<=7;N++)if(!(j+N<=-1||S<=j+N))for(let P=-1;P<=7;P++)A+P<=-1||S<=A+P||(N>=0&&N<=6&&(P===0||P===6)||P>=0&&P<=6&&(N===0||N===6)||N>=2&&N<=4&&P>=2&&P<=4?x.set(j+N,A+P,!0,!0):x.set(j+N,A+P,!1,!0))}}function b(x){const w=x.size;for(let S=8;S<w-8;S++){const v=S%2===0;x.set(S,6,v,!0),x.set(6,S,v,!0)}}function y(x,w){const S=n.getPositions(w);for(let v=0;v<S.length;v++){const I=S[v][0],j=S[v][1];for(let A=-2;A<=2;A++)for(let N=-2;N<=2;N++)A===-2||A===2||N===-2||N===2||A===0&&N===0?x.set(I+A,j+N,!0,!0):x.set(I+A,j+N,!1,!0)}}function M(x,w){const S=x.size,v=f.getEncodedBits(w);let I,j,A;for(let N=0;N<18;N++)I=Math.floor(N/3),j=N%3+S-8-3,A=(v>>N&1)===1,x.set(I,j,A,!0),x.set(j,I,A,!0)}function C(x,w,S){const v=x.size,I=u.getEncodedBits(w,S);let j,A;for(j=0;j<15;j++)A=(I>>j&1)===1,j<6?x.set(j,8,A,!0):j<8?x.set(j+1,8,A,!0):x.set(v-15+j,8,A,!0),j<8?x.set(8,v-j-1,A,!0):j<9?x.set(8,15-j-1+1,A,!0):x.set(8,15-j-1,A,!0);x.set(v-8,8,1,!0)}function E(x,w){const S=x.size;let v=-1,I=S-1,j=7,A=0;for(let N=S-1;N>0;N-=2)for(N===6&&N--;;){for(let P=0;P<2;P++)if(!x.isReserved(I,N-P)){let K=!1;A<w.length&&(K=(w[A]>>>j&1)===1),x.set(I,N-P,K),j--,j===-1&&(A++,j=7)}if(I+=v,I<0||S<=I){I-=v,v=-v;break}}}function m(x,w,S){const v=new o;S.forEach(function(P){v.put(P.mode.bit,4),v.put(P.getLength(),h.getCharCountIndicator(P.mode,x)),P.write(v)});const I=t.getSymbolTotalCodewords(x),j=l.getTotalCodewordsCount(x,w),A=(I-j)*8;for(v.getLengthInBits()+4<=A&&v.put(0,4);v.getLengthInBits()%8!==0;)v.putBit(0);const N=(A-v.getLengthInBits())/8;for(let P=0;P<N;P++)v.put(P%2?17:236,8);return T(v,x,w)}function T(x,w,S){const v=t.getSymbolTotalCodewords(w),I=l.getTotalCodewordsCount(w,S),j=v-I,A=l.getBlocksCount(w,S),N=v%A,P=A-N,K=Math.floor(v/A),G=Math.floor(j/A),tt=G+1,je=K-G,Ae=new a(je);let me=0;const de=new Array(A),ue=new Array(A);let $=0;const J=new Uint8Array(x.buffer);for(let Y=0;Y<A;Y++){const pe=Y<P?G:tt;de[Y]=J.slice(me,me+pe),ue[Y]=Ae.encode(de[Y]),me+=pe,$=Math.max($,pe)}const te=new Uint8Array(v);let ne=0,H,O;for(H=0;H<$;H++)for(O=0;O<A;O++)H<de[O].length&&(te[ne++]=de[O][H]);for(H=0;H<je;H++)for(O=0;O<A;O++)te[ne++]=ue[O][H];return te}function z(x,w,S,v){let I;if(Array.isArray(x))I=p.fromArray(x);else if(typeof x=="string"){let K=w;if(!K){const G=p.rawSplit(x);K=f.getBestVersionForData(G,S)}I=p.fromString(x,K||40)}else throw new Error("Invalid data");const j=f.getBestVersionForData(I,S);if(!j)throw new Error("The amount of data is too big to be stored in a QR Code");if(!w)w=j;else if(w<j)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+j+`.
`);const A=m(w,S,I),N=t.getSymbolSize(w),P=new r(N);return g(P,w),b(P),y(P,w),C(P,S,0),w>=7&&M(P,w),E(P,A),isNaN(v)&&(v=c.getBestMask(P,C.bind(null,P,S))),c.applyMask(v,P),C(P,S,v),{modules:P,version:w,errorCorrectionLevel:S,maskPattern:v,segments:I}}return Be.create=function(w,S){if(typeof w>"u"||w==="")throw new Error("No input text");let v=i.M,I,j;return typeof S<"u"&&(v=i.from(S.errorCorrectionLevel,i.M),I=f.from(S.version),j=c.from(S.maskPattern),S.toSJISFunc&&t.setToSJISFunction(S.toSJISFunc)),z(w,I,v,j)},Be}var Ge={},$e={},Ft;function Kt(){return Ft||(Ft=1,(function(t){function i(o){if(typeof o=="number"&&(o=o.toString()),typeof o!="string")throw new Error("Color should be defined as hex string");let r=o.slice().replace("#","").split("");if(r.length<3||r.length===5||r.length>8)throw new Error("Invalid hex color: "+o);(r.length===3||r.length===4)&&(r=Array.prototype.concat.apply([],r.map(function(s){return[s,s]}))),r.length===6&&r.push("F","F");const n=parseInt(r.join(""),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:n&255,hex:"#"+r.slice(0,6).join("")}}t.getOptions=function(r){r||(r={}),r.color||(r.color={});const n=typeof r.margin>"u"||r.margin===null||r.margin<0?4:r.margin,s=r.width&&r.width>=21?r.width:void 0,c=r.scale||4;return{width:s,scale:s?4:c,margin:n,color:{dark:i(r.color.dark||"#000000ff"),light:i(r.color.light||"#ffffffff")},type:r.type,rendererOpts:r.rendererOpts||{}}},t.getScale=function(r,n){return n.width&&n.width>=r+n.margin*2?n.width/(r+n.margin*2):n.scale},t.getImageWidth=function(r,n){const s=t.getScale(r,n);return Math.floor((r+n.margin*2)*s)},t.qrToImageData=function(r,n,s){const c=n.modules.size,l=n.modules.data,a=t.getScale(c,s),f=Math.floor((c+s.margin*2)*a),u=s.margin*a,h=[s.color.light,s.color.dark];for(let p=0;p<f;p++)for(let g=0;g<f;g++){let b=(p*f+g)*4,y=s.color.light;if(p>=u&&g>=u&&p<f-u&&g<f-u){const M=Math.floor((p-u)/a),C=Math.floor((g-u)/a);y=h[l[M*c+C]?1:0]}r[b++]=y.r,r[b++]=y.g,r[b++]=y.b,r[b]=y.a}}})($e)),$e}var qt;function qn(){return qt||(qt=1,(function(t){const i=Kt();function o(n,s,c){n.clearRect(0,0,s.width,s.height),s.style||(s.style={}),s.height=c,s.width=c,s.style.height=c+"px",s.style.width=c+"px"}function r(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}t.render=function(s,c,l){let a=l,f=c;typeof a>"u"&&(!c||!c.getContext)&&(a=c,c=void 0),c||(f=r()),a=i.getOptions(a);const u=i.getImageWidth(s.modules.size,a),h=f.getContext("2d"),p=h.createImageData(u,u);return i.qrToImageData(p.data,s,a),o(h,f,u),h.putImageData(p,0,0),f},t.renderToDataURL=function(s,c,l){let a=l;typeof a>"u"&&(!c||!c.getContext)&&(a=c,c=void 0),a||(a={});const f=t.render(s,c,a),u=a.type||"image/png",h=a.rendererOpts||{};return f.toDataURL(u,h.quality)}})(Ge)),Ge}var Xe={},Ut;function Un(){if(Ut)return Xe;Ut=1;const t=Kt();function i(n,s){const c=n.a/255,l=s+'="'+n.hex+'"';return c<1?l+" "+s+'-opacity="'+c.toFixed(2).slice(1)+'"':l}function o(n,s,c){let l=n+s;return typeof c<"u"&&(l+=" "+c),l}function r(n,s,c){let l="",a=0,f=!1,u=0;for(let h=0;h<n.length;h++){const p=Math.floor(h%s),g=Math.floor(h/s);!p&&!f&&(f=!0),n[h]?(u++,h>0&&p>0&&n[h-1]||(l+=f?o("M",p+c,.5+g+c):o("m",a,0),a=0,f=!1),p+1<s&&n[h+1]||(l+=o("h",u),u=0)):a++}return l}return Xe.render=function(s,c,l){const a=t.getOptions(c),f=s.modules.size,u=s.modules.data,h=f+a.margin*2,p=a.color.light.a?"<path "+i(a.color.light,"fill")+' d="M0 0h'+h+"v"+h+'H0z"/>':"",g="<path "+i(a.color.dark,"stroke")+' d="'+r(u,f,a.margin)+'"/>',b='viewBox="0 0 '+h+" "+h+'"',M='<svg xmlns="http://www.w3.org/2000/svg" '+(a.width?'width="'+a.width+'" height="'+a.width+'" ':"")+b+' shape-rendering="crispEdges">'+p+g+`</svg>
`;return typeof l=="function"&&l(null,M),M},Xe}var Vt;function Vn(){if(Vt)return ce;Vt=1;const t=wn(),i=Fn(),o=qn(),r=Un();function n(s,c,l,a,f){const u=[].slice.call(arguments,1),h=u.length,p=typeof u[h-1]=="function";if(!p&&!t())throw new Error("Callback required as last argument");if(p){if(h<2)throw new Error("Too few arguments provided");h===2?(f=l,l=c,c=a=void 0):h===3&&(c.getContext&&typeof f>"u"?(f=a,a=void 0):(f=a,a=l,l=c,c=void 0))}else{if(h<1)throw new Error("Too few arguments provided");return h===1?(l=c,c=a=void 0):h===2&&!c.getContext&&(a=l,l=c,c=void 0),new Promise(function(g,b){try{const y=i.create(l,a);g(s(y,c,a))}catch(y){b(y)}})}try{const g=i.create(l,a);f(null,s(g,c,a))}catch(g){f(g)}}return ce.create=i.create,ce.toCanvas=n.bind(null,o.render),ce.toDataURL=n.bind(null,o.renderToDataURL),ce.toString=n.bind(null,function(s,c,l){return r.render(s,l)}),ce}var _n=Vn();const Hn=un(_n),On="SAR";function V(t){return Number(t??0)}function q(t){return V(t).toLocaleString("en-SA",{minimumFractionDigits:2,maximumFractionDigits:2})}function Qn(t){return t==="simplified"}function Wn(t){if(t===0)return"Zero";const i=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],o=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],r=["","Thousand","Million","Billion"];function n(u){if(u===0)return"";const h=[];return u>=100&&(h.push(i[Math.floor(u/100)]+" Hundred"),u%=100),u>=20&&(h.push(o[Math.floor(u/10)]),u%=10),u>0&&h.push(i[u]),h.join(" ")}const s=Math.floor(t),c=Math.round((t-s)*100);let l="",a=0,f=s;for(;f>0;){const u=f%1e3;u>0&&(l=n(u)+(r[a]?" "+r[a]:"")+(l?" "+l:"")),f=Math.floor(f/1e3),a++}return l=l||"Zero",c>0&&(l+=` and ${c}/100`),l.trim()+" Saudi Riyals"}function Kn(t){if(t===0)return"صفر";const i=[["",""],["واحد","واحدة"],["اثنان","اثنتان"],["ثلاثة","ثلاث"],["أربعة","أربع"],["خمسة","خمس"],["ستة","ست"],["سبعة","سبع"],["ثمانية","ثمان"],["تسعة","تسع"],["عشرة","عشر"],["أحد عشر","إحدى عشرة"],["اثنا عشر","اثنتا عشرة"],["ثلاثة عشر","ثلاث عشرة"],["أربعة عشر","أربع عشرة"],["خمسة عشر","خمس عشرة"],["ستة عشر","ست عشرة"],["سبعة عشر","سبع عشرة"],["ثمانية عشر","ثماني عشرة"],["تسعة عشر","تسع عشرة"]],o=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],r=["","ألف","مليون","مليار"];function n(h,p){if(h===0)return"";const g=p?1:0,b=[];if(h>=100){const y=Math.floor(h/100);y===1?b.push("مائة"):y===2?b.push("مائتان"):b.push(i[y][0]+" مائة"),h%=100}return h>=20&&(b.push(o[Math.floor(h/10)]),h%=10),h>0&&b.push(i[h][g]),b.join(" و ")}const s=Math.floor(t),c=Math.round((t-s)*100);let l="",a=0,f=s;const u=[!1,!0,!1,!1];for(;f>0;){const h=f%1e3;if(h>0){const p=n(h,u[a]);h===1&&a===1?l="ألف"+(l?" "+l:""):h===2&&a===1?l="ألفان"+(l?" "+l:""):l=p+(r[a]?" "+r[a]:"")+(l?" و "+l:"")}f=Math.floor(f/1e3),a++}return l=l||"صفر",c>0&&(l+=` و ${c}/100`),l.trim()+" ريال سعودي"}function Jn(t){if(!t)return"";try{return new Date(t).toLocaleDateString("ar-SA-u-ca-islamic",{year:"numeric",month:"long",day:"numeric"})}catch{return""}}const _t={draft:{label:"Draft",labelAr:"مسودة",color:"#64748b"},sent:{label:"Sent",labelAr:"مُرسلة",color:"#3b82f6"},paid:{label:"Paid",labelAr:"مدفوعة",color:"#10b981"},partial:{label:"Partial",labelAr:"جزئي",color:"#f59e0b"},overdue:{label:"Overdue",labelAr:"متأخرة",color:"#ef4444"},cancelled:{label:"Cancelled",labelAr:"ملغاة",color:"#6b7280"}},Ht={cleared:{label:"Cleared",color:"#10b981"},reported:{label:"Reported",color:"#3b82f6"},pending:{label:"Pending",color:"#f59e0b"},failed:{label:"Failed",color:"#ef4444"}},Yn=B.forwardRef(({invoice:t,company:i,customer:o,items:r,className:n=""},s)=>{const[c,l]=B.useState("");B.useEffect(()=>{if(!t.zatcaQrCode){l("");return}Hn.toDataURL(t.zatcaQrCode,{errorCorrectionLevel:"M",margin:1,width:180,color:{dark:"#0f172a",light:"#ffffff"}}).then(l).catch(()=>l(""))},[t.zatcaQrCode]);const a=i.defaultCurrency??On,f=Qn(t.invoiceType),u=_t[t.status??"draft"]??_t.draft,h=Ht[t.zatcaStatus??"pending"]??Ht.pending,p=V(t.taxPercent??15),g=V(t.subTotal),b=V(t.taxAmount),y=V(t.totalAmount),M=V(t.paidAmount),C=y-M,E=Jn(t.date);return e.jsxs("div",{ref:s,className:`saudi-invoice-root ${n}`,style:{fontFamily:"'Segoe UI', Tahoma, Arial, sans-serif"},children:[e.jsx("style",{children:`
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
        `}),e.jsxs("div",{className:"inv-page",children:[e.jsx("div",{className:"inv-header",children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1},children:[e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"flex-start"},children:[e.jsx("div",{className:"inv-logo-box",children:i.logo?e.jsx("img",{src:i.logo,alt:"logo"}):e.jsx("span",{style:{color:"white",fontWeight:800,fontSize:20},children:(i.companyName??"YA").slice(0,2).toUpperCase()})}),e.jsxs("div",{children:[e.jsx("div",{style:{color:"white",fontWeight:800,fontSize:20,lineHeight:1.2},children:i.companyName??"Company Name"}),i.companyNameAr&&e.jsx("div",{style:{color:"rgba(255,255,255,.8)",fontWeight:600,fontSize:14,direction:"rtl",marginTop:2},children:i.companyNameAr}),e.jsxs("div",{style:{color:"rgba(255,255,255,.65)",fontSize:11,marginTop:6,lineHeight:1.7},children:[i.address&&e.jsxs("div",{children:[i.address,i.city?`, ${i.city}`:""]}),i.phone&&e.jsx("div",{children:i.phone}),i.email&&e.jsx("div",{children:i.email})]})]})]}),e.jsxs("div",{style:{textAlign:"right"},children:[e.jsxs("div",{className:"inv-title-badge",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:"2.5",children:[e.jsx("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),e.jsx("polyline",{points:"14 2 14 8 20 8"})]}),e.jsx("span",{style:{color:"white",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"},children:f?"Simplified Tax Invoice":"Tax Invoice"})]}),e.jsx("div",{style:{color:"rgba(255,255,255,.9)",fontWeight:800,fontSize:18,direction:"rtl",marginBottom:4},children:f?"فاتورة ضريبية مبسطة":"فاتورة ضريبية"}),e.jsx("div",{style:{color:"rgba(255,255,255,.7)",fontFamily:"monospace",fontSize:16,fontWeight:700},children:t.invoiceNumber??"INV-000000"}),t.zatcaStatus&&e.jsx("div",{style:{marginTop:10},children:e.jsxs("span",{className:"inv-badge",style:{background:`${h.color}22`,border:`1.5px solid ${h.color}44`,color:h.color},children:[e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",background:h.color,display:"inline-block"}}),"ZATCA ",h.label]})}),e.jsx("div",{style:{marginTop:8},children:e.jsxs("span",{className:"inv-badge",style:{background:`${u.color}22`,border:`1.5px solid ${u.color}44`,color:u.color},children:[u.label," / ",u.labelAr]})})]})]})}),e.jsxs("div",{className:"inv-stats",children:[e.jsxs("div",{className:"inv-stat-box inv-stat-box-subtotal",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#2563eb"},children:"Subtotal / المجموع"}),e.jsx("div",{className:"inv-stat-value",style:{color:"#1d4ed8"},children:q(g)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#3b82f6"},children:a})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-vat",children:[e.jsxs("div",{className:"inv-stat-label",style:{color:"#059669"},children:["VAT ",p,"% / ضريبة القيمة"]}),e.jsx("div",{className:"inv-stat-value",style:{color:"#047857"},children:q(b)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#10b981"},children:a})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-total",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"rgba(255,255,255,.75)"},children:"TOTAL / الإجمالي"}),e.jsx("div",{className:"inv-stat-value",style:{color:"white"},children:q(y)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"rgba(255,255,255,.7)"},children:a})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-paid",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#d97706"},children:"Amount Due / المستحق"}),e.jsx("div",{className:"inv-stat-value",style:{color:C>0?"#dc2626":"#16a34a"},children:q(C)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#f59e0b"},children:a})]})]}),e.jsxs("div",{className:"inv-body",children:[e.jsxs("div",{className:"inv-info-grid",children:[e.jsxs("div",{className:"inv-info-card inv-info-card-seller",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#059669"},children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#059669",strokeWidth:"2.5",children:e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"})}),"Seller / البائع"]}),e.jsx("div",{className:"inv-card-name",children:i.companyName??"—"}),i.companyNameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#065f46"},children:i.companyNameAr}),e.jsxs("div",{className:"inv-card-text",children:[i.address&&e.jsxs("div",{children:[i.address,i.city?`, ${i.city}`:""]}),i.country&&e.jsx("div",{children:i.country}),i.phone&&e.jsxs("div",{children:["📞 ",i.phone]}),i.email&&e.jsxs("div",{children:["✉ ",i.email]})]}),i.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46"},children:["🏛 VAT: ",i.taxNumber]}),i.crNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46",marginTop:4},children:["📋 CR: ",i.crNumber]})]}),e.jsxs("div",{className:"inv-info-card inv-info-card-buyer",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#2563eb"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#2563eb",strokeWidth:"2.5",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),"Bill To / العميل"]}),e.jsx("div",{className:"inv-card-name",children:o.name??"—"}),o.nameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#1e40af"},children:o.nameAr}),e.jsxs("div",{className:"inv-card-text",children:[o.address&&e.jsxs("div",{children:[o.address,o.city?`, ${o.city}`:""]}),o.phone&&e.jsxs("div",{children:["📞 ",o.phone]}),o.email&&e.jsxs("div",{children:["✉ ",o.email]})]}),o.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#dbeafe",color:"#1e40af"},children:["🏛 Customer VAT: ",o.taxNumber]})]})]}),e.jsxs("div",{className:"inv-meta-row",style:{gridTemplateColumns:"repeat(6, 1fr)"},children:[e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",children:[e.jsx("div",{className:"inv-meta-label",children:"Invoice Type"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#0f172a",fontSize:10},children:t.invoiceType==="simplified"?"Simplified / مبسطة":t.invoiceType==="zatca"?"ZATCA / فاتورة ذاتكا":"Standard / قياسية"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",children:[e.jsx("div",{className:"inv-meta-label",children:"Issue Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#c2410c",fontSize:11},children:t.date??"—"}),E&&e.jsx("div",{style:{fontSize:9,color:"#9a3412",direction:"rtl",marginTop:1},children:E})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",style:{background:"#f0fdf4",borderColor:"#bbf7d0"},children:[e.jsx("div",{className:"inv-meta-label",children:"Issue Time"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#065f46",fontSize:11},children:t.time??"—"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-due",children:[e.jsx("div",{className:"inv-meta-label",children:"Due Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#b91c1c",fontSize:11},children:t.dueDate??"Upon Receipt"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-uuid",style:{background:"#faf5ff",borderColor:"#e9d5ff"},children:[e.jsx("div",{className:"inv-meta-label",children:t.workedMonth?"Worked Month":"Payment Method"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#6d28d9",fontSize:10},children:t.workedMonth??t.paymentMethod??"—"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",style:{background:"#fff7ed",borderColor:"#fed7aa"},children:[e.jsx("div",{className:"inv-meta-label",children:t.poNumber?"PO No.":t.cashier?"Cashier":"Created By"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#9a3412",fontSize:10},children:t.poNumber??t.cashier??t.createdBy??"—"})]})]}),(t.contractNumber||t.projectReference)&&e.jsxs("div",{style:{display:"flex",gap:12,marginBottom:16},children:[t.contractNumber&&e.jsxs("div",{style:{fontSize:11,color:"#475569",background:"#f1f5f9",padding:"4px 12px",borderRadius:6},children:[e.jsx("strong",{children:"Contract:"})," ",t.contractNumber]}),t.projectReference&&e.jsxs("div",{style:{fontSize:11,color:"#475569",background:"#f1f5f9",padding:"4px 12px",borderRadius:6},children:[e.jsx("strong",{children:"Project:"})," ",t.projectReference]})]}),e.jsx("div",{className:"inv-table-wrap",children:e.jsxs("table",{className:"inv-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:32,textAlign:"center"},children:"#"}),t.invoiceMode==="labor"||t.invoiceMode==="construction"?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Worker / Job Description"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Total Hrs"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Rate/Hour"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]}):t.invoiceMode==="service"?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Service Description"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Rate"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"SKU / Description / الوصف"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Unit Price"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Disc %"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]})]})}),e.jsx("tbody",{children:r.map((m,T)=>{const z=V(m.quantity),x=t.invoiceMode==="labor"||t.invoiceMode==="construction"?V(m.ratePerHour??m.unitPrice):V(m.unitPrice),w=V(m.totalHours??z),S=t.invoiceMode==="labor"||t.invoiceMode==="construction"?w*x:z*x,v=V(m.discountPercent??0),I=S*(v/100),j=S-I,A=V(m.taxPercent),N=j*(A/100),P=m.totalAmount&&V(m.totalAmount)||j+N;return e.jsxs("tr",{children:[e.jsx("td",{style:{textAlign:"center"},children:e.jsx("span",{className:"inv-row-num",children:T+1})}),e.jsxs("td",{children:[e.jsxs("div",{className:"inv-item-desc",children:[m.sku&&e.jsxs("span",{style:{color:"#64748b",fontFamily:"monospace",fontSize:11},children:["[",m.sku,"] "]}),m.description]}),m.descriptionAr&&e.jsx("div",{className:"inv-item-desc-ar",children:m.descriptionAr})]}),t.invoiceMode==="labor"||t.invoiceMode==="construction"?e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:m.unit||"d"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:w.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(x)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[A,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(N)}),e.jsx("td",{className:"inv-table-number",children:q(j+N)})]}):t.invoiceMode==="service"?e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:m.unit||"service"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:z.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(x)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[A,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(N)}),e.jsx("td",{className:"inv-table-number",children:q(j+N)})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:m.unit||"pcs"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:z.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(x)}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:v>0?`${v}%`:"—"}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[A,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:q(N)}),e.jsx("td",{className:"inv-table-number",children:q(P)})]})]},m.id??T)})})]})}),e.jsxs("div",{className:"inv-footer-grid",children:[e.jsxs("div",{children:[e.jsx("div",{className:"inv-totals",style:{marginBottom:12},children:e.jsxs("div",{className:"inv-totals-row",style:{background:"#f8fafc",flexDirection:"column",alignItems:"flex-start",gap:4},children:[e.jsx("span",{className:"inv-totals-label",style:{fontSize:10,textTransform:"uppercase",letterSpacing:".05em"},children:"Amount in Words / المبلغ بالكلمات"}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#1e293b",lineHeight:1.4},children:Wn(y)}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#1e293b",direction:"rtl",lineHeight:1.4},children:Kn(y)})]})}),(t.notes||t.terms||i.invoiceTerms)&&e.jsxs("div",{className:"inv-notes",children:[e.jsx("div",{style:{fontWeight:700,marginBottom:6,color:"#6d28d9"},children:"Terms & Notes / الشروط والملاحظات"}),e.jsx("div",{style:{lineHeight:1.7},children:t.notes||t.terms||i.invoiceTerms})]})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{className:"inv-totals",children:[e.jsxs("div",{className:"inv-totals-row inv-totals-row-sub",children:[e.jsx("span",{className:"inv-totals-label",children:"Subtotal / المجموع الفرعي"}),e.jsxs("span",{className:"inv-totals-value",children:[q(g)," ",a]})]}),V(t.discountAmount)>0&&e.jsxs("div",{className:"inv-totals-row",style:{background:"#fefce8"},children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Discount / الخصم"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#ca8a04"},children:["-",q(t.discountAmount)," ",a]})]}),e.jsxs("div",{className:"inv-totals-row",style:{background:"#f8fafc"},children:[e.jsx("span",{className:"inv-totals-label",children:"Taxable Amount / المبلغ الخاضع للضريبة"}),e.jsxs("span",{className:"inv-totals-value",children:[q(V(t.taxableAmount)||g)," ",a]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-vat",children:[e.jsxs("span",{className:"inv-totals-label",children:["VAT ",p,"% / ضريبة القيمة المضافة"]}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#059669"},children:[q(b)," ",a]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-total",children:[e.jsx("span",{className:"inv-totals-label-white",children:"GRAND TOTAL / الإجمالي الكلي"}),e.jsxs("span",{className:"inv-totals-value-big",children:[q(y)," ",a]})]}),M>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-paid",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Paid / المدفوع"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#854d0e"},children:[q(M)," ",a]})]}),V(t.balanceDue)>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[q(t.balanceDue)," ",a]})]}),M<=0&&V(t.balanceDue)<=0&&C>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[q(C)," ",a]})]})]}),c&&e.jsxs("div",{className:"inv-qr-box",children:[e.jsx("img",{src:c,alt:"ZATCA QR",className:"inv-qr-img"}),e.jsx("div",{className:"inv-qr-label",children:"ZATCA Phase 2 QR Code"}),e.jsx("div",{className:"inv-qr-label-ar",children:"رمز الاستجابة السريعة - هيئة الزكاة والضريبة"})]})]})]}),e.jsxs("div",{className:"inv-compliance",children:[e.jsx("div",{style:{textAlign:"center",marginBottom:14},children:e.jsx("span",{style:{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#64748b",background:"#f1f5f9",padding:"4px 16px",borderRadius:100},children:"⚖️ Saudi Arabia — ZATCA Compliance Information / معلومات الامتثال الضريبي"})}),e.jsxs("div",{className:"inv-compliance-grid",children:[e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-zatca",children:[e.jsx("div",{className:"inv-compliance-label",children:"🏛 ZATCA VAT Number"}),e.jsx("div",{className:"inv-compliance-value",children:i.taxNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"الرقم الضريبي للبائع"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-vat",children:[e.jsx("div",{className:"inv-compliance-label",children:"📋 Commercial Registration"}),e.jsx("div",{className:"inv-compliance-value",children:i.crNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"السجل التجاري"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-cr",children:[e.jsx("div",{className:"inv-compliance-label",children:"🔐 ZATCA Status"}),e.jsxs("div",{className:"inv-compliance-value",style:{color:h.color},children:[h.label," / ",t.zatcaStatus??"Pending"]}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"حالة ZATCA"})]})]}),t.hash&&e.jsxs("div",{style:{marginTop:14,padding:"8px 14px",borderRadius:10,background:"#f8fafc",border:"1px solid #e2e8f0",fontSize:10,color:"#64748b",wordBreak:"break-all",textAlign:"center"},children:[e.jsx("strong",{children:"Invoice Hash / تجزئة الفاتورة:"})," ",t.hash]})]}),i.website&&e.jsx("div",{style:{textAlign:"center",marginTop:16,fontSize:11,color:"#64748b"},children:i.website}),e.jsxs("div",{className:"inv-watermark",children:["This invoice was generated in compliance with Saudi Arabia's ZATCA e-Invoicing Phase 2 regulations.",e.jsx("br",{}),"تم إنشاء هذه الفاتورة وفقًا لأنظمة الفوترة الإلكترونية للمرحلة الثانية من هيئة الزكاة والضريبة والجمارك"]})]})]})]})});Yn.displayName="SaudiInvoicePrint";function Jt(t){const{companyName:i,companyNameAr:o,companyLogo:r,companyStamp:n,companyAddress:s,companyPhone:c,companyVat:l,currency:a,taxPercent:f,note:u,pSub:h,pDisc:p,pVat:g,pTotal:b,pCustName:y,pCustPhone:M,pCustAddr:C,pCustVat:E,pType:m,printItems:T}=t,z=JSON.stringify({seller:o||i,vat:l,total:b.toFixed(2),tax:g.toFixed(2),date:new Date().toISOString()}),x=btoa(unescape(encodeURIComponent(z)));return`<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><title>Bill - ${i}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#f5f5f5;padding:10mm}
.invoice{max-width:800px;margin:0 auto;background:#fff;padding:20mm;box-shadow:0 0 10px rgba(0,0,0,.1)}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #1e3a8a;padding-bottom:15px;margin-bottom:20px;gap:20px}
.qr-code{width:80px;height:80px;border:2px solid #000;padding:3px}
.company-info h1{font-size:20px;color:#1e3a8a;font-weight:900}
.company-info h2{font-size:16px;color:#1d4ed8;font-weight:700}
.info-line{font-size:12px;color:#333;margin:2px 0}
.title{text-align:center;background:linear-gradient(135deg,#1e3a8a,#1d4ed8);color:#fff;padding:12px;margin:15px 0;font-size:18px;font-weight:700;border-radius:5px}
.badge{display:inline-block;background:#1d4ed8;color:#fff;font-size:10px;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px}
.customer{border:1px solid #ddd;padding:15px;margin:15px 0;border-radius:5px}
.customer h3{color:#1e3a8a;margin-bottom:8px}
.customer p{margin:3px 0;font-size:13px}
table{width:100%;border-collapse:collapse;margin:20px 0}
thead{background:#1e3a8a;color:#fff}
th{padding:10px;text-align:center;border:1px solid #fff;font-size:12px}
td{padding:8px;text-align:center;border:1px solid #ddd;font-size:12px}
tr:nth-child(even){background:#f9f9ff}
.totals{margin-top:20px;padding:15px;background:#f5f5ff;border-radius:5px}
.total-row{display:flex;justify-content:space-between;padding:8px 15px;font-size:14px}
.total-row.grand{background:linear-gradient(135deg,#1d4ed8,#1e3a8a);color:#fff;font-weight:900;font-size:18px;border-radius:5px;margin-top:10px}
.qr-section{text-align:center;margin:15px 0;padding:15px;border:1px dashed #ccc;border-radius:5px}
.qr-section p{font-size:11px;color:#666;margin-top:5px}
.footer{margin-top:20px;text-align:center;padding:15px;border-top:2px solid #ddd;font-size:16px;font-weight:700;color:#1e3a8a}
@media print{body{background:#fff;padding:0}.invoice{box-shadow:none;margin:0}}
</style></head><body>
<div class="invoice">
<div class="header">
<div class="company-info">
<h1>${i}</h1>${o?`<h2>${o}</h2>`:""}
${r?`<img src="${r}" style="max-width:60px;max-height:40px">`:""}
${s?`<div class="info-line">${s}</div>`:""}
${c?`<div class="info-line">${c}</div>`:""}
${l?`<div class="info-line"><strong>VAT: ${l}</strong></div>`:""}
</div>
<div class="qr-section" style="width:120px">
<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(x)}" style="width:100px;height:100px">
<p>${m==="zatca"?"ZATCA QR":"Invoice QR"}</p>
</div>
</div>
<div class="title">TAX INVOICE / فاتورة ضريبية<span class="badge">${m==="zatca"?"ZATCA":"Standard"}</span></div>
<div class="customer">
<h3>Customer / العميل</h3>
<p><strong>${y}</strong></p>
${M?`<p>Phone: ${M}</p>`:""}
${C?`<p>Address: ${C}</p>`:""}
${E?`<p>VAT: ${E}</p>`:""}
</div>
<table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
${T.map(w=>`<tr><td>${w.no}</td><td>${w.name}</td><td>${w.qty}</td><td>${w.rate.toFixed(2)}</td><td>${w.total.toFixed(2)}</td></tr>`).join("")}
</tbody></table>
<div class="totals">
<div class="total-row"><span>Subtotal:</span><span>${a} ${h.toFixed(2)}</span></div>
${p>0?`<div class="total-row"><span>Discount:</span><span>-${a} ${p.toFixed(2)}</span></div>`:""}
<div class="total-row"><span>VAT ${f}%:</span><span>${a} ${g.toFixed(2)}</span></div>
<div class="total-row grand"><span>TOTAL:</span><span>${a} ${b.toFixed(2)}</span></div>
</div>
${u?`<div style="margin-top:15px;padding:10px;background:#f9f9ff;border-radius:5px;font-size:13px"><strong>Note:</strong> ${u}</div>`:""}
<div class="footer">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:15px">
    <div>${n?`<img src="${n}" style="max-width:80px;max-height:80px;opacity:0.8">`:""}</div>
    <div>شكراً لتعاملكم معنا / Thank You For Your Business!</div>
  </div>
</div>
</div>
<script>window.onload=function(){window.print();}<\/script></body></html>`}function Zn({detail:t,companyData:i}){if(!t?.invoice)return null;const o=t.invoice,r=(t.items||[]).map((y,M)=>({no:M+1,name:y.description||`Item #${y.productId||y.id}`,qty:Number(y.quantity||1),rate:Number(y.unitPrice||0),total:Number(y.totalAmount||0)})),n=t.customer,s=Number(o.subTotal||0),c=Number(o.discountAmount||0),l=Number(o.taxAmount||0),a=Number(o.totalAmount||0),f=n?.name||n?.nameAr||"Walk-in Customer",u=n?.phone||"",h=n?.address||"",p=n?.vatNumber||n?.taxNumber||"",g=o.invoiceType==="zatca"?"zatca":"standard",b=Jt({companyName:i.companyName||"Company Name",companyNameAr:i.companyNameAr||"",companyLogo:i.companyLogo||"",companyStamp:i.companyStamp||"",companyAddress:i.companyAddress||"",companyPhone:i.companyPhone||"",companyVat:i.companyVat||"",currency:i.currency||"SAR",taxPercent:o.taxPercent||"15",note:o.notes||"",pSub:s,pDisc:c,pVat:l,pTotal:a,pCustName:f,pCustPhone:u,pCustAddr:h,pCustVat:p,pType:g,printItems:r});return e.jsx("div",{className:"invoice-preview-container",style:{minHeight:"85vh"},dangerouslySetInnerHTML:{__html:b}})}function Ti(){const t=fn(),{data:i,refetch:o}=F.sales.invoiceList.useQuery(void 0),{data:r}=F.sales.customerList.useQuery(void 0),{data:n,refetch:s}=F.inventory.productList.useQuery(void 0),{data:c,refetch:l}=F.inventory.categoryList.useQuery(void 0),{data:a}=F.settings.companySettingsGet.useQuery(),f=F.sales.invoiceCreate.useMutation({onSuccess:d=>{t.invalidateQueries(),R.success("Bill created"),lt();const k=d?.id;k&&I.trim()&&p.mutate({invoiceId:k,to:I.trim()}),k&&setTimeout(()=>ct(k),400)},onError:d=>R.error(d.message)}),u=F.sales.invoiceUpdate.useMutation({onSuccess:()=>{t.invalidateQueries({queryKey:[["sales","invoiceList"]]}),t.invalidateQueries({queryKey:[["sales","invoiceGet"]]}),R.success("Invoice updated")},onError:d=>R.error(d.message)});F.sales.invoiceDelete.useMutation({onSuccess:()=>{t.invalidateQueries({queryKey:[["sales","invoiceList"]]}),t.invalidateQueries({queryKey:[["sales","invoiceGet"]]}),R.success("Invoice deleted"),J(null)},onError:d=>R.error(d.message)}),F.sales.invoiceUpdateStatus.useMutation({onSuccess:()=>o()}),F.zatca.generateXml.useMutation({onSuccess:()=>{R.success("ZATCA UBL XML generated"),o()},onError:d=>R.error(d.message)}),F.zatca.generateQrCode.useMutation({onSuccess:()=>{R.success("ZATCA QR generated"),o()},onError:d=>R.error(d.message)}),F.zatca.signInvoice.useMutation({onSuccess:()=>{R.success("Invoice signed"),o()},onError:d=>R.error(d.message)}),F.zatca.clearanceInvoice.useMutation({onSuccess:()=>R.success("ZATCA clearance logged"),onError:d=>R.error(d.message)}),F.zatca.reportInvoice.useMutation({onSuccess:()=>R.success("ZATCA reporting logged"),onError:d=>R.error(d.message)}),F.zatca.syncStatus.useMutation({onSuccess:()=>R.success("ZATCA status synced"),onError:d=>R.error(d.message)});const h=F.whatsapp.sendInvoiceCreated.useMutation({onSuccess:()=>R.success("Invoice sent on WhatsApp"),onError:d=>R.error(d.message)}),p=F.email.sendInvoice.useMutation({onSuccess:()=>R.success("Invoice sent via email"),onError:d=>R.error("Email failed: "+d.message)});F.inventory.productCreate.useMutation({onSuccess:()=>{s(),R.success("Product added")},onError:d=>R.error(d.message)}),F.inventory.categoryCreate.useMutation({onSuccess:()=>{l(),R.success("Category created")},onError:d=>R.error(d.message)});const g=F.thermalPrint.generateThermal.useMutation({onSuccess:d=>{try{const k=atob(d.data),_=new Uint8Array(k.length);for(let oe=0;oe<k.length;oe++)_[oe]=k.charCodeAt(oe);const L=new Blob([_],{type:"application/octet-stream"}),ie=URL.createObjectURL(L),he=document.createElement("a");he.href=ie,he.download=`receipt-${d.format}.bin`,he.click(),R.success(`Thermal receipt (${d.format}) ready to print`)}catch{R.error("Failed to process thermal data")}},onError:d=>R.error(d.message)}),[b,y]=B.useState([]),[M,C]=B.useState(0),[E,m]=B.useState(""),[T,z]=B.useState(""),[x,w]=B.useState(""),[S,v]=B.useState(""),[I,j]=B.useState(""),[A,N]=B.useState(0),[P,K]=B.useState(""),[G,tt]=B.useState(""),[je,Ae]=B.useState(!1),[me,de]=B.useState(-1),ue=B.useRef(null),[$,J]=B.useState(null),[te,ne]=B.useState(null),[H,O]=B.useState(null),[Y,pe]=B.useState(""),[xe,ve]=B.useState("create"),[nt,Gn]=B.useState("standard"),[$n,Xn]=B.useState(!1),[ei,ti]=B.useState(""),[ni,ii]=B.useState(""),[ri,si]=B.useState(""),[oi,ai]=B.useState(""),[li,ci]=B.useState(void 0),[di,ui]=B.useState(!1),[fi,hi]=B.useState(""),[gi,mi]=B.useState("");B.useRef(null);const W=F.sales.invoiceGet.useQuery({id:$??H},{enabled:!!$||!!H}),X=a?.defaultCurrency||"SAR",fe=Number(a?.vatRate??15),Ce=a?.companyName||a?.companyNameAr||"Company Name",it=a?.companyNameAr||"",rt=a?.address||"",Se=a?.phone||"",st=a?.taxNumber||a?.vatNumber||"",ot=a?.logo||"",at=a?.stamp||"";a?.country;const be=b.reduce((d,k)=>d+k.price*k.qty,0),Te=Math.max(0,be-A),ye=Te*fe/100,Ie=Te+ye;(n||[]).filter(d=>!G||(d.name||"").toLowerCase().includes(G.toLowerCase())),(r||[]).filter(d=>!E||(d.name||"").toLowerCase().includes(E.toLowerCase())).slice(0,10),B.useEffect(()=>{const d=k=>{ue.current&&!ue.current.contains(k.target)&&Ae(!1)};return document.addEventListener("click",d),()=>document.removeEventListener("click",d)},[]),B.useEffect(()=>{if(!H)return;const d=W.data;if(!d||!d.invoice||d.invoice.id!==H)return;const k=d.invoice;ne(k.id),O(null),ve("create"),y((d.items||[]).map((_,L)=>({id:String(_.productId||`-${L}`),name:(_.description||"Item").replace(/^\[\d+\]\s*/,""),price:Number(_.unitPrice||0),qty:Number(_.quantity||1),sku:_.sku}))),C(d.customer?.id||0),m(d.customer?.name||""),z(d.customer?.phone||""),w(d.customer?.address||""),v(d.customer?.vatNumber||d.customer?.taxNumber||""),j(d.customer?.email||""),N(Number(k.discountAmount||0)),K(k.notes||"")},[H,W.data]);const Yt=d=>{y(k=>k.find(L=>L.id===d.id)?k.map(L=>L.id===d.id?{...L,qty:L.qty+1}:L):[...k,{id:d.id,name:d.name||"Item",price:Number(d.price||0),qty:1,sku:d.sku}])},lt=()=>{y([]),C(0),m(""),z(""),w(""),v(""),N(0),K("")},Zt=d=>{if(d.preventDefault(),!b.length){R.error("Add at least one item to the cart");return}E.trim();const k=b.map(L=>({description:`[${L.id}] ${L.name}`,quantity:L.qty,unitPrice:L.price.toString(),taxPercent:fe.toString(),totalAmount:(L.price*L.qty).toFixed(2),unit:"pcs",sku:L.sku})),_={invoiceNumber:`BILL-${Date.now().toString().slice(-6)}`,customerId:M||0,date:new Date().toISOString().slice(0,10),dueDate:"",invoiceType:nt,invoiceMode:"product",subTotal:be.toFixed(2),taxAmount:ye.toFixed(2),taxPercent:fe.toString(),totalAmount:Ie.toFixed(2),discountAmount:A.toString(),taxableAmount:Te.toFixed(2),notes:P,items:k};te?u.mutate({id:te,..._}):f.mutate(_)},Gt=()=>{const d=!!$&&!!W.data,k=d?W.data.invoice:null,_=d?W.data.items||[]:[],L=d?W.data.customer:null,ie=d?_.map((U,Pe)=>({no:Pe+1,name:U.description||`Item #${U.productId||U.id}`,qty:Number(U.quantity||1),rate:Number(U.unitPrice||0),total:Number(U.totalAmount||0)})):b.map((U,Pe)=>({no:Pe+1,name:U.name,qty:U.qty,rate:U.price,total:U.price*U.qty}));if(ie.length===0){R.error("Add items to cart before printing");return}const he=d?Number(k?.subTotal||0):be,oe=d?Number(k?.discountAmount||0):A,tn=d?Number(k?.taxAmount||0):ye,nn=d?Number(k?.totalAmount||0):Ie,rn=d?L?.name||L?.nameAr||"Walk-in Customer":E||"Walk-in Customer",sn=d?L?.phone:T,on=d?L?.address:x,an=d?L?.vatNumber||L?.taxNumber:S,ln=d?k?.invoiceType==="zatca"?"zatca":"standard":nt,cn=Jt({companyName:Ce,companyNameAr:it,companyLogo:ot,companyStamp:at,companyAddress:rt,companyPhone:Se,companyVat:st,currency:X,taxPercent:fe,note:P,pSub:he,pDisc:oe,pVat:tn,pTotal:nn,pCustName:rn,pCustPhone:sn,pCustAddr:on,pCustVat:an,pType:ln,printItems:ie}),dn=new Blob([cn],{type:"text/html"}),Ee=URL.createObjectURL(dn);if(!window.open(Ee,"_blank")){const U=document.createElement("a");U.href=Ee,U.target="_blank",document.body.appendChild(U),U.click(),document.body.removeChild(U)}setTimeout(()=>URL.revokeObjectURL(Ee),1e4)},$t=()=>{if(!D?.invoice)return;const d=D.invoice,k=D.customer?.name||"Walk-in Customer",_=Number(d.totalAmount||0).toFixed(2),L=`*${Ce}*
*Invoice: ${d.invoiceNumber}*
Customer: ${k}
Total: ${X} ${_}
Date: ${d.date}`,ie=D.customer?.phone||Se;ie?window.open(`https://wa.me/${ie.replace(/\D/g,"")}?text=${encodeURIComponent(L)}`,"_blank"):window.open(`https://wa.me/?text=${encodeURIComponent(L)}`,"_blank"),h.mutate({invoiceId:d.id})},Xt=()=>{if(!D?.invoice)return;const d=D.invoice,k=D.customer?.email||"";if(!k){R.error("No customer email. Add email to customer record first.");return}p.mutate({invoiceId:d.id,to:k})},ct=d=>{J(d),ne(null),y([]),C(0),m(""),z(""),w(""),v(""),j(""),N(0),K("")},dt=d=>{O(d),J(null)},ut=(d,k="a4")=>{k==="thermal"?g.mutate({invoiceId:d,format:"80mm"}):J(d)},en={draft:"bg-slate-100 text-slate-700",sent:"bg-blue-100 text-blue-700",paid:"bg-emerald-100 text-emerald-700",partial:"bg-amber-100 text-amber-700",overdue:"bg-red-100 text-red-700",cancelled:"bg-gray-100 text-gray-700"},we=i?.filter(d=>!Y||Y==="all"||d.status===Y)||[],D=W.data;return D?.invoice?.id,e.jsxs("div",{className:"h-screen flex flex-col",children:[e.jsx("div",{className:"p-4 border-b bg-white",children:e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold",children:"Invoices / فواتير"}),e.jsxs("p",{className:"text-slate-500 text-sm",children:[we.length," invoices"]})]}),e.jsxs("div",{className:"flex gap-2 items-center",children:[e.jsxs("div",{className:"flex bg-slate-100 rounded-lg p-1",children:[e.jsx("button",{type:"button",onClick:()=>{ve("create"),J(null),ne(null)},className:`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${xe==="create"?"bg-white shadow text-blue-700":"text-slate-500 hover:text-slate-700"}`,children:"Create Bill"}),e.jsxs("button",{type:"button",onClick:()=>ve("history"),className:`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${xe==="history"?"bg-white shadow text-blue-700":"text-slate-500 hover:text-slate-700"}`,children:["Invoice History (",we.length,")"]})]}),e.jsx(Q,{variant:"outline",size:"sm",onClick:()=>{lt(),ne(null),J(null),ve("create")},children:"New Bill"})]})]})}),e.jsxs("div",{className:"flex-1 flex overflow-hidden",children:[xe==="create"&&e.jsxs("div",{className:"flex-1 flex",children:[e.jsxs("div",{className:"w-80 border-r bg-white p-4 space-y-4 overflow-y-auto",children:[e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Customer / العميل"}),e.jsx(ae,{value:E,onChange:d=>m(d.target.value),placeholder:"Type customer name...",className:"h-8 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Phone (optional)"}),e.jsx(ae,{value:T,onChange:d=>z(d.target.value),placeholder:"Optional",className:"h-8 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Address (optional)"}),e.jsx(ae,{value:x,onChange:d=>w(d.target.value),placeholder:"Optional",className:"h-8 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Customer VAT (optional)"}),e.jsx(ae,{value:S,onChange:d=>v(d.target.value),placeholder:"e.g. 311777758600003",className:"h-8 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Customer Email (for auto-send bill)"}),e.jsx(ae,{type:"email",value:I,onChange:d=>j(d.target.value),placeholder:"customer@email.com",className:"h-8 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Discount"}),e.jsx(ae,{type:"number",className:"w-20 h-7 text-xs text-right",value:A,onChange:d=>N(parseFloat(value)||0)})]})]}),e.jsx("div",{className:"flex-1 p-4 overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",children:n?.map(d=>e.jsxs("button",{onClick:()=>Yt(d),className:"border-2 border-slate-200 rounded-lg p-3 text-left hover:border-blue-400 hover:shadow-md transition-all",children:[e.jsx("div",{className:"text-xs font-bold text-slate-700 truncate",children:d.name}),e.jsx("div",{className:"text-xs text-slate-500",children:d.sku}),e.jsxs("div",{className:"text-sm font-bold text-blue-600",children:[X," ",Number(d.salePrice).toFixed(2)]})]},d.id))})}),e.jsxs("div",{className:"w-80 border-l bg-white p-4 flex flex-col",children:[e.jsx("h3",{className:"font-semibold text-slate-800 mb-3",children:"Cart"}),e.jsx("div",{className:"flex-1 overflow-y-auto space-y-2",children:b.length===0?e.jsx("p",{className:"text-xs text-slate-400 text-center py-8",children:"No items in cart"}):b.map((d,k)=>e.jsxs("div",{className:"flex items-center gap-2 p-2 bg-slate-50 rounded text-xs",children:[e.jsx("span",{className:"flex-1 truncate",children:d.name}),e.jsx("span",{className:"font-bold",children:d.price.toFixed(2)})]},k))}),e.jsxs("div",{className:"border-t pt-3 space-y-1 text-xs",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Subtotal:"}),e.jsxs("span",{children:[X," ",be.toFixed(2)]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("span",{children:["VAT (",fe,"%):"]}),e.jsxs("span",{children:[X," ",ye.toFixed(2)]})]}),e.jsxs("div",{className:"flex justify-between font-bold text-sm",children:[e.jsx("span",{children:"TOTAL:"}),e.jsxs("span",{children:[X," ",Ie.toFixed(2)]})]})]}),e.jsxs(Q,{className:"w-full mt-3",onClick:Zt,disabled:f.isPending||u.isPending||b.length===0,children:[e.jsx(hn,{className:"h-4 w-4 mr-2"})," ",te?"Update":"Create Bill"]})]})]}),xe==="history"&&e.jsx("div",{className:"flex-1 overflow-y-auto p-4",children:we.length===0?e.jsx("div",{className:"text-center py-16 text-slate-400",children:"No invoices found."}):e.jsx("div",{className:"grid md:grid-cols-2 xl:grid-cols-3 gap-4",children:we.map(d=>e.jsxs("div",{className:"border rounded-xl p-4 bg-white hover:shadow-md transition-shadow",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"font-mono text-sm font-bold text-blue-700",children:d.invoiceNumber}),e.jsx("span",{className:`text-xs px-2 py-0.5 rounded-full font-medium ${en[d.status]||"bg-slate-100 text-slate-700"}`,children:d.status})]}),e.jsxs("div",{className:"text-xs text-slate-500 mb-3",children:[new Date(d.date).toLocaleDateString()," · ",d.invoiceType]}),e.jsx("div",{className:"text-sm text-slate-700 mb-1",children:d.customerName||"Walk-in Customer"}),e.jsxs("div",{className:"text-lg font-bold text-emerald-600 mb-3",children:[X," ",Number(d.totalAmount||0).toFixed(2)]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(Q,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>ct(d.id),children:[e.jsx(yn,{className:"h-3.5 w-3.5 mr-1"})," View"]}),e.jsxs(Q,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>dt(d.id),children:[e.jsx(ft,{className:"h-3.5 w-3.5 mr-1"})," Edit"]}),e.jsx(Q,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>ut(d.id,"a4"),title:"A4 PDF",children:"📄 A4"}),e.jsx(Q,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>ut(d.id,"thermal"),disabled:g.isPending,title:"80mm Receipt",children:"🖨️ 80mm"}),e.jsx(Q,{size:"sm",variant:"outline",className:"text-red-500 hover:text-red-600 hover:border-red-300",onClick:()=>handleDeleteInvoice(d.id),children:e.jsx(ht,{className:"h-3.5 w-3.5"})})]})]},d.id))})})]}),e.jsx(gn,{open:!!$,onOpenChange:d=>{d||(J(null),O(null))},children:e.jsxs(mn,{"data-invoice-view":"true",className:"overflow-hidden flex flex-col p-0","aria-describedby":"invoice-view-desc",children:[e.jsx(pn,{className:"sr-only",children:"Invoice View"}),e.jsx("p",{id:"invoice-view-desc",className:"sr-only",children:"Invoice details with actions: edit, print, delete, send via WhatsApp"}),e.jsxs("div",{className:"flex items-center justify-between p-4 border-b bg-white shrink-0 shadow-sm",children:[e.jsxs("h2",{className:"text-lg font-bold",children:["Invoice ",D?.invoice?.invoiceNumber||"Loading..."]}),e.jsxs("div",{className:"flex gap-2 flex-wrap",children:[e.jsx(Q,{size:"sm",variant:"default",onClick:Gt,disabled:W.isPending||!D?.invoice||g.isPending,title:"Print A4 PDF",children:"📄 A4 Print"}),e.jsx(Q,{size:"sm",variant:"outline",disabled:W.isPending||!D?.invoice||g.isPending,onClick:()=>D?.invoice&&g.mutate({invoiceId:D.invoice.id,format:"80mm"}),title:"Print 80mm Thermal Receipt",children:"🖨️ Thermal"}),e.jsxs(Q,{size:"sm",variant:"outline",onClick:()=>D?.invoice&&dt(D.invoice.id),disabled:W.isPending||!D?.invoice,children:[e.jsx(ft,{className:"h-4 w-4 mr-1"})," Edit"]}),e.jsxs(Q,{size:"sm",variant:"outline",onClick:$t,disabled:!D?.invoice,children:[e.jsx(xn,{className:"h-4 w-4 mr-1"})," WhatsApp"]}),e.jsxs(Q,{size:"sm",variant:"outline",onClick:Xt,disabled:!D?.invoice||p.isPending,title:"Send invoice via email",children:["✉️ ",p.isPending?"...":"Email"]}),e.jsxs(Q,{size:"sm",variant:"outline",className:"text-red-500 hover:text-red-600 hover:border-red-300",onClick:()=>D?.invoice&&handleDeleteFromView(D.invoice.id),disabled:!D?.invoice,children:[e.jsx(ht,{className:"h-4 w-4"})," Delete"]}),e.jsx(Q,{size:"sm",variant:"ghost",onClick:()=>{J(null),O(null)},children:"✕ Close"})]})]}),e.jsx(vn,{id:"invoice-view-desc",className:"sr-only",children:"Invoice preview - what you see is what you print"}),e.jsxs("div",{className:"flex-1 overflow-y-auto bg-slate-100 p-4",children:[D?.invoice&&!W.isPending&&e.jsx(Zn,{detail:D,companyData:{companyName:Ce,companyNameAr:it,companyLogo:ot,companyStamp:at,companyAddress:rt,companyPhone:Se,companyVat:st,currency:X}}),!D?.invoice&&!W.isPending&&e.jsx("div",{className:"py-16 text-center text-slate-400",children:"Loading invoice..."}),W.isPending&&e.jsxs("div",{className:"py-16 text-center text-slate-400",children:[e.jsx(bn,{className:"h-8 w-8 animate-spin mx-auto mb-3 text-blue-500"}),"Loading invoice details..."]})]})]})})]})}export{Ti as default};
