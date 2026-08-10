import{j as e}from"./ui-2_2xY0sS.js";import{g as dn,r as R}from"./vendor-Dj4APJbq.js";import{u as un}from"./query-CzjcNskh.js";import{K as q,B as Q,a9 as ae,aw as fn,aj as hn,ak as gn,am as mn,aD as pn,at as xn}from"./index-_HiTONTV.js";import{L as le}from"./label-BuWygagz.js";import{t as M}from"./index-C7Qn3gX3.js";import{E as bn}from"./eye-CzZ30aTz.js";import{P as at}from"./pencil-BI5WFdU9.js";import{T as lt}from"./trash-2-6mz8bBqF.js";import"./charts-CClYrlZQ.js";var ce={},Ee,ct;function vn(){return ct||(ct=1,Ee=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then}),Ee}var Pe={},X={},dt;function ie(){if(dt)return X;dt=1;let t;const r=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];return X.getSymbolSize=function(i){if(!i)throw new Error('"version" cannot be null or undefined');if(i<1||i>40)throw new Error('"version" should be in range from 1 to 40');return i*4+17},X.getSymbolTotalCodewords=function(i){return r[i]},X.getBCHDigit=function(o){let i=0;for(;o!==0;)i++,o>>>=1;return i},X.setToSJISFunction=function(i){if(typeof i!="function")throw new Error('"toSJISFunc" is not a valid function.');t=i},X.isKanjiModeEnabled=function(){return typeof t<"u"},X.toSJIS=function(i){return t(i)},X}var ke={},ut;function $e(){return ut||(ut=1,(function(t){t.L={bit:1},t.M={bit:0},t.Q={bit:3},t.H={bit:2};function r(o){if(typeof o!="string")throw new Error("Param is not a string");switch(o.toLowerCase()){case"l":case"low":return t.L;case"m":case"medium":return t.M;case"q":case"quartile":return t.Q;case"h":case"high":return t.H;default:throw new Error("Unknown EC Level: "+o)}}t.isValid=function(i){return i&&typeof i.bit<"u"&&i.bit>=0&&i.bit<4},t.from=function(i,n){if(t.isValid(i))return i;try{return r(i)}catch{return n}}})(ke)),ke}var Be,ft;function yn(){if(ft)return Be;ft=1;function t(){this.buffer=[],this.length=0}return t.prototype={get:function(r){const o=Math.floor(r/8);return(this.buffer[o]>>>7-r%8&1)===1},put:function(r,o){for(let i=0;i<o;i++)this.putBit((r>>>o-i-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(r){const o=Math.floor(this.length/8);this.buffer.length<=o&&this.buffer.push(0),r&&(this.buffer[o]|=128>>>this.length%8),this.length++}},Be=t,Be}var Re,ht;function wn(){if(ht)return Re;ht=1;function t(r){if(!r||r<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=r,this.data=new Uint8Array(r*r),this.reservedBit=new Uint8Array(r*r)}return t.prototype.set=function(r,o,i,n){const s=r*this.size+o;this.data[s]=i,n&&(this.reservedBit[s]=!0)},t.prototype.get=function(r,o){return this.data[r*this.size+o]},t.prototype.xor=function(r,o,i){this.data[r*this.size+o]^=i},t.prototype.isReserved=function(r,o){return this.reservedBit[r*this.size+o]},Re=t,Re}var Me={},gt;function Nn(){return gt||(gt=1,(function(t){const r=ie().getSymbolSize;t.getRowColCoords=function(i){if(i===1)return[];const n=Math.floor(i/7)+2,s=r(i),c=s===145?26:Math.ceil((s-13)/(2*n-2))*2,l=[s-7];for(let a=1;a<n-1;a++)l[a]=l[a-1]-c;return l.push(6),l.reverse()},t.getPositions=function(i){const n=[],s=t.getRowColCoords(i),c=s.length;for(let l=0;l<c;l++)for(let a=0;a<c;a++)l===0&&a===0||l===0&&a===c-1||l===c-1&&a===0||n.push([s[l],s[a]]);return n}})(Me)),Me}var ze={},mt;function jn(){if(mt)return ze;mt=1;const t=ie().getSymbolSize,r=7;return ze.getPositions=function(i){const n=t(i);return[[0,0],[n-r,0],[0,n-r]]},ze}var Le={},pt;function An(){return pt||(pt=1,(function(t){t.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const r={N1:3,N2:3,N3:40,N4:10};t.isValid=function(n){return n!=null&&n!==""&&!isNaN(n)&&n>=0&&n<=7},t.from=function(n){return t.isValid(n)?parseInt(n,10):void 0},t.getPenaltyN1=function(n){const s=n.size;let c=0,l=0,a=0,u=null,f=null;for(let h=0;h<s;h++){l=a=0,u=f=null;for(let x=0;x<s;x++){let g=n.get(h,x);g===u?l++:(l>=5&&(c+=r.N1+(l-5)),u=g,l=1),g=n.get(x,h),g===f?a++:(a>=5&&(c+=r.N1+(a-5)),f=g,a=1)}l>=5&&(c+=r.N1+(l-5)),a>=5&&(c+=r.N1+(a-5))}return c},t.getPenaltyN2=function(n){const s=n.size;let c=0;for(let l=0;l<s-1;l++)for(let a=0;a<s-1;a++){const u=n.get(l,a)+n.get(l,a+1)+n.get(l+1,a)+n.get(l+1,a+1);(u===4||u===0)&&c++}return c*r.N2},t.getPenaltyN3=function(n){const s=n.size;let c=0,l=0,a=0;for(let u=0;u<s;u++){l=a=0;for(let f=0;f<s;f++)l=l<<1&2047|n.get(u,f),f>=10&&(l===1488||l===93)&&c++,a=a<<1&2047|n.get(f,u),f>=10&&(a===1488||a===93)&&c++}return c*r.N3},t.getPenaltyN4=function(n){let s=0;const c=n.data.length;for(let a=0;a<c;a++)s+=n.data[a];return Math.abs(Math.ceil(s*100/c/5)-10)*r.N4};function o(i,n,s){switch(i){case t.Patterns.PATTERN000:return(n+s)%2===0;case t.Patterns.PATTERN001:return n%2===0;case t.Patterns.PATTERN010:return s%3===0;case t.Patterns.PATTERN011:return(n+s)%3===0;case t.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(s/3))%2===0;case t.Patterns.PATTERN101:return n*s%2+n*s%3===0;case t.Patterns.PATTERN110:return(n*s%2+n*s%3)%2===0;case t.Patterns.PATTERN111:return(n*s%3+(n+s)%2)%2===0;default:throw new Error("bad maskPattern:"+i)}}t.applyMask=function(n,s){const c=s.size;for(let l=0;l<c;l++)for(let a=0;a<c;a++)s.isReserved(a,l)||s.xor(a,l,o(n,a,l))},t.getBestMask=function(n,s){const c=Object.keys(t.Patterns).length;let l=0,a=1/0;for(let u=0;u<c;u++){s(u),t.applyMask(u,n);const f=t.getPenaltyN1(n)+t.getPenaltyN2(n)+t.getPenaltyN3(n)+t.getPenaltyN4(n);t.applyMask(u,n),f<a&&(a=f,l=u)}return l}})(Le)),Le}var Ne={},xt;function Ft(){if(xt)return Ne;xt=1;const t=$e(),r=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],o=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];return Ne.getBlocksCount=function(n,s){switch(s){case t.L:return r[(n-1)*4+0];case t.M:return r[(n-1)*4+1];case t.Q:return r[(n-1)*4+2];case t.H:return r[(n-1)*4+3];default:return}},Ne.getTotalCodewordsCount=function(n,s){switch(s){case t.L:return o[(n-1)*4+0];case t.M:return o[(n-1)*4+1];case t.Q:return o[(n-1)*4+2];case t.H:return o[(n-1)*4+3];default:return}},Ne}var De={},ge={},bt;function Cn(){if(bt)return ge;bt=1;const t=new Uint8Array(512),r=new Uint8Array(256);return(function(){let i=1;for(let n=0;n<255;n++)t[n]=i,r[i]=n,i<<=1,i&256&&(i^=285);for(let n=255;n<512;n++)t[n]=t[n-255]})(),ge.log=function(i){if(i<1)throw new Error("log("+i+")");return r[i]},ge.exp=function(i){return t[i]},ge.mul=function(i,n){return i===0||n===0?0:t[r[i]+r[n]]},ge}var vt;function Sn(){return vt||(vt=1,(function(t){const r=Cn();t.mul=function(i,n){const s=new Uint8Array(i.length+n.length-1);for(let c=0;c<i.length;c++)for(let l=0;l<n.length;l++)s[c+l]^=r.mul(i[c],n[l]);return s},t.mod=function(i,n){let s=new Uint8Array(i);for(;s.length-n.length>=0;){const c=s[0];for(let a=0;a<n.length;a++)s[a]^=r.mul(n[a],c);let l=0;for(;l<s.length&&s[l]===0;)l++;s=s.slice(l)}return s},t.generateECPolynomial=function(i){let n=new Uint8Array([1]);for(let s=0;s<i;s++)n=t.mul(n,new Uint8Array([1,r.exp(s)]));return n}})(De)),De}var qe,yt;function Tn(){if(yt)return qe;yt=1;const t=Sn();function r(o){this.genPoly=void 0,this.degree=o,this.degree&&this.initialize(this.degree)}return r.prototype.initialize=function(i){this.degree=i,this.genPoly=t.generateECPolynomial(this.degree)},r.prototype.encode=function(i){if(!this.genPoly)throw new Error("Encoder not initialized");const n=new Uint8Array(i.length+this.degree);n.set(i);const s=t.mod(n,this.genPoly),c=this.degree-s.length;if(c>0){const l=new Uint8Array(this.degree);return l.set(s,c),l}return s},qe=r,qe}var Fe={},Ue={},Ve={},wt;function Ut(){return wt||(wt=1,Ve.isValid=function(r){return!isNaN(r)&&r>=1&&r<=40}),Ve}var Z={},Nt;function Vt(){if(Nt)return Z;Nt=1;const t="[0-9]+",r="[A-Z $%*+\\-./:]+";let o="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";o=o.replace(/u/g,"\\u");const i="(?:(?![A-Z0-9 $%*+\\-./:]|"+o+`)(?:.|[\r
]))+`;Z.KANJI=new RegExp(o,"g"),Z.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),Z.BYTE=new RegExp(i,"g"),Z.NUMERIC=new RegExp(t,"g"),Z.ALPHANUMERIC=new RegExp(r,"g");const n=new RegExp("^"+o+"$"),s=new RegExp("^"+t+"$"),c=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");return Z.testKanji=function(a){return n.test(a)},Z.testNumeric=function(a){return s.test(a)},Z.testAlphanumeric=function(a){return c.test(a)},Z}var jt;function se(){return jt||(jt=1,(function(t){const r=Ut(),o=Vt();t.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},t.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},t.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},t.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},t.MIXED={bit:-1},t.getCharCountIndicator=function(s,c){if(!s.ccBits)throw new Error("Invalid mode: "+s);if(!r.isValid(c))throw new Error("Invalid version: "+c);return c>=1&&c<10?s.ccBits[0]:c<27?s.ccBits[1]:s.ccBits[2]},t.getBestModeForData=function(s){return o.testNumeric(s)?t.NUMERIC:o.testAlphanumeric(s)?t.ALPHANUMERIC:o.testKanji(s)?t.KANJI:t.BYTE},t.toString=function(s){if(s&&s.id)return s.id;throw new Error("Invalid mode")},t.isValid=function(s){return s&&s.bit&&s.ccBits};function i(n){if(typeof n!="string")throw new Error("Param is not a string");switch(n.toLowerCase()){case"numeric":return t.NUMERIC;case"alphanumeric":return t.ALPHANUMERIC;case"kanji":return t.KANJI;case"byte":return t.BYTE;default:throw new Error("Unknown mode: "+n)}}t.from=function(s,c){if(t.isValid(s))return s;try{return i(s)}catch{return c}}})(Ue)),Ue}var At;function In(){return At||(At=1,(function(t){const r=ie(),o=Ft(),i=$e(),n=se(),s=Ut(),c=7973,l=r.getBCHDigit(c);function a(x,g,v){for(let w=1;w<=40;w++)if(g<=t.getCapacity(w,v,x))return w}function u(x,g){return n.getCharCountIndicator(x,g)+4}function f(x,g){let v=0;return x.forEach(function(w){const B=u(w.mode,g);v+=B+w.getBitsLength()}),v}function h(x,g){for(let v=1;v<=40;v++)if(f(x,v)<=t.getCapacity(v,g,n.MIXED))return v}t.from=function(g,v){return s.isValid(g)?parseInt(g,10):v},t.getCapacity=function(g,v,w){if(!s.isValid(g))throw new Error("Invalid QR Code version");typeof w>"u"&&(w=n.BYTE);const B=r.getSymbolTotalCodewords(g),A=o.getTotalCodewordsCount(g,v),E=(B-A)*8;if(w===n.MIXED)return E;const p=E-u(w,g);switch(w){case n.NUMERIC:return Math.floor(p/10*3);case n.ALPHANUMERIC:return Math.floor(p/11*2);case n.KANJI:return Math.floor(p/13);case n.BYTE:default:return Math.floor(p/8)}},t.getBestVersionForData=function(g,v){let w;const B=i.from(v,i.M);if(Array.isArray(g)){if(g.length>1)return h(g,B);if(g.length===0)return 1;w=g[0]}else w=g;return a(w.mode,w.getLength(),B)},t.getEncodedBits=function(g){if(!s.isValid(g)||g<7)throw new Error("Invalid QR Code version");let v=g<<12;for(;r.getBCHDigit(v)-l>=0;)v^=c<<r.getBCHDigit(v)-l;return g<<12|v}})(Fe)),Fe}var _e={},Ct;function En(){if(Ct)return _e;Ct=1;const t=ie(),r=1335,o=21522,i=t.getBCHDigit(r);return _e.getEncodedBits=function(s,c){const l=s.bit<<3|c;let a=l<<10;for(;t.getBCHDigit(a)-i>=0;)a^=r<<t.getBCHDigit(a)-i;return(l<<10|a)^o},_e}var He={},Oe,St;function Pn(){if(St)return Oe;St=1;const t=se();function r(o){this.mode=t.NUMERIC,this.data=o.toString()}return r.getBitsLength=function(i){return 10*Math.floor(i/3)+(i%3?i%3*3+1:0)},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(i){let n,s,c;for(n=0;n+3<=this.data.length;n+=3)s=this.data.substr(n,3),c=parseInt(s,10),i.put(c,10);const l=this.data.length-n;l>0&&(s=this.data.substr(n),c=parseInt(s,10),i.put(c,l*3+1))},Oe=r,Oe}var Qe,Tt;function kn(){if(Tt)return Qe;Tt=1;const t=se(),r=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function o(i){this.mode=t.ALPHANUMERIC,this.data=i}return o.getBitsLength=function(n){return 11*Math.floor(n/2)+6*(n%2)},o.prototype.getLength=function(){return this.data.length},o.prototype.getBitsLength=function(){return o.getBitsLength(this.data.length)},o.prototype.write=function(n){let s;for(s=0;s+2<=this.data.length;s+=2){let c=r.indexOf(this.data[s])*45;c+=r.indexOf(this.data[s+1]),n.put(c,11)}this.data.length%2&&n.put(r.indexOf(this.data[s]),6)},Qe=o,Qe}var We,It;function Bn(){if(It)return We;It=1;const t=se();function r(o){this.mode=t.BYTE,typeof o=="string"?this.data=new TextEncoder().encode(o):this.data=new Uint8Array(o)}return r.getBitsLength=function(i){return i*8},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(o){for(let i=0,n=this.data.length;i<n;i++)o.put(this.data[i],8)},We=r,We}var Ke,Et;function Rn(){if(Et)return Ke;Et=1;const t=se(),r=ie();function o(i){this.mode=t.KANJI,this.data=i}return o.getBitsLength=function(n){return n*13},o.prototype.getLength=function(){return this.data.length},o.prototype.getBitsLength=function(){return o.getBitsLength(this.data.length)},o.prototype.write=function(i){let n;for(n=0;n<this.data.length;n++){let s=r.toSJIS(this.data[n]);if(s>=33088&&s<=40956)s-=33088;else if(s>=57408&&s<=60351)s-=49472;else throw new Error("Invalid SJIS character: "+this.data[n]+`
Make sure your charset is UTF-8`);s=(s>>>8&255)*192+(s&255),i.put(s,13)}},Ke=o,Ke}var Je={exports:{}},Pt;function Mn(){return Pt||(Pt=1,(function(t){var r={single_source_shortest_paths:function(o,i,n){var s={},c={};c[i]=0;var l=r.PriorityQueue.make();l.push(i,0);for(var a,u,f,h,x,g,v,w,B;!l.empty();){a=l.pop(),u=a.value,h=a.cost,x=o[u]||{};for(f in x)x.hasOwnProperty(f)&&(g=x[f],v=h+g,w=c[f],B=typeof c[f]>"u",(B||w>v)&&(c[f]=v,l.push(f,v),s[f]=u))}if(typeof n<"u"&&typeof c[n]>"u"){var A=["Could not find a path from ",i," to ",n,"."].join("");throw new Error(A)}return s},extract_shortest_path_from_predecessor_list:function(o,i){for(var n=[],s=i;s;)n.push(s),o[s],s=o[s];return n.reverse(),n},find_path:function(o,i,n){var s=r.single_source_shortest_paths(o,i,n);return r.extract_shortest_path_from_predecessor_list(s,n)},PriorityQueue:{make:function(o){var i=r.PriorityQueue,n={},s;o=o||{};for(s in i)i.hasOwnProperty(s)&&(n[s]=i[s]);return n.queue=[],n.sorter=o.sorter||i.default_sorter,n},default_sorter:function(o,i){return o.cost-i.cost},push:function(o,i){var n={value:o,cost:i};this.queue.push(n),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};t.exports=r})(Je)),Je.exports}var kt;function zn(){return kt||(kt=1,(function(t){const r=se(),o=Pn(),i=kn(),n=Bn(),s=Rn(),c=Vt(),l=ie(),a=Mn();function u(A){return unescape(encodeURIComponent(A)).length}function f(A,E,p){const T=[];let z;for(;(z=A.exec(p))!==null;)T.push({data:z[0],index:z.index,mode:E,length:z[0].length});return T}function h(A){const E=f(c.NUMERIC,r.NUMERIC,A),p=f(c.ALPHANUMERIC,r.ALPHANUMERIC,A);let T,z;return l.isKanjiModeEnabled()?(T=f(c.BYTE,r.BYTE,A),z=f(c.KANJI,r.KANJI,A)):(T=f(c.BYTE_KANJI,r.BYTE,A),z=[]),E.concat(p,T,z).sort(function(C,S){return C.index-S.index}).map(function(C){return{data:C.data,mode:C.mode,length:C.length}})}function x(A,E){switch(E){case r.NUMERIC:return o.getBitsLength(A);case r.ALPHANUMERIC:return i.getBitsLength(A);case r.KANJI:return s.getBitsLength(A);case r.BYTE:return n.getBitsLength(A)}}function g(A){return A.reduce(function(E,p){const T=E.length-1>=0?E[E.length-1]:null;return T&&T.mode===p.mode?(E[E.length-1].data+=p.data,E):(E.push(p),E)},[])}function v(A){const E=[];for(let p=0;p<A.length;p++){const T=A[p];switch(T.mode){case r.NUMERIC:E.push([T,{data:T.data,mode:r.ALPHANUMERIC,length:T.length},{data:T.data,mode:r.BYTE,length:T.length}]);break;case r.ALPHANUMERIC:E.push([T,{data:T.data,mode:r.BYTE,length:T.length}]);break;case r.KANJI:E.push([T,{data:T.data,mode:r.BYTE,length:u(T.data)}]);break;case r.BYTE:E.push([{data:T.data,mode:r.BYTE,length:u(T.data)}])}}return E}function w(A,E){const p={},T={start:{}};let z=["start"];for(let m=0;m<A.length;m++){const C=A[m],S=[];for(let b=0;b<C.length;b++){const I=C[b],N=""+m+b;S.push(N),p[N]={node:I,lastCount:0},T[N]={};for(let j=0;j<z.length;j++){const y=z[j];p[y]&&p[y].node.mode===I.mode?(T[y][N]=x(p[y].lastCount+I.length,I.mode)-x(p[y].lastCount,I.mode),p[y].lastCount+=I.length):(p[y]&&(p[y].lastCount=I.length),T[y][N]=x(I.length,I.mode)+4+r.getCharCountIndicator(I.mode,E))}}z=S}for(let m=0;m<z.length;m++)T[z[m]].end=0;return{map:T,table:p}}function B(A,E){let p;const T=r.getBestModeForData(A);if(p=r.from(E,T),p!==r.BYTE&&p.bit<T.bit)throw new Error('"'+A+'" cannot be encoded with mode '+r.toString(p)+`.
 Suggested mode is: `+r.toString(T));switch(p===r.KANJI&&!l.isKanjiModeEnabled()&&(p=r.BYTE),p){case r.NUMERIC:return new o(A);case r.ALPHANUMERIC:return new i(A);case r.KANJI:return new s(A);case r.BYTE:return new n(A)}}t.fromArray=function(E){return E.reduce(function(p,T){return typeof T=="string"?p.push(B(T,null)):T.data&&p.push(B(T.data,T.mode)),p},[])},t.fromString=function(E,p){const T=h(E,l.isKanjiModeEnabled()),z=v(T),m=w(z,p),C=a.find_path(m.map,"start","end"),S=[];for(let b=1;b<C.length-1;b++)S.push(m.table[C[b]].node);return t.fromArray(g(S))},t.rawSplit=function(E){return t.fromArray(h(E,l.isKanjiModeEnabled()))}})(He)),He}var Bt;function Ln(){if(Bt)return Pe;Bt=1;const t=ie(),r=$e(),o=yn(),i=wn(),n=Nn(),s=jn(),c=An(),l=Ft(),a=Tn(),u=In(),f=En(),h=se(),x=zn();function g(m,C){const S=m.size,b=s.getPositions(C);for(let I=0;I<b.length;I++){const N=b[I][0],j=b[I][1];for(let y=-1;y<=7;y++)if(!(N+y<=-1||S<=N+y))for(let P=-1;P<=7;P++)j+P<=-1||S<=j+P||(y>=0&&y<=6&&(P===0||P===6)||P>=0&&P<=6&&(y===0||y===6)||y>=2&&y<=4&&P>=2&&P<=4?m.set(N+y,j+P,!0,!0):m.set(N+y,j+P,!1,!0))}}function v(m){const C=m.size;for(let S=8;S<C-8;S++){const b=S%2===0;m.set(S,6,b,!0),m.set(6,S,b,!0)}}function w(m,C){const S=n.getPositions(C);for(let b=0;b<S.length;b++){const I=S[b][0],N=S[b][1];for(let j=-2;j<=2;j++)for(let y=-2;y<=2;y++)j===-2||j===2||y===-2||y===2||j===0&&y===0?m.set(I+j,N+y,!0,!0):m.set(I+j,N+y,!1,!0)}}function B(m,C){const S=m.size,b=u.getEncodedBits(C);let I,N,j;for(let y=0;y<18;y++)I=Math.floor(y/3),N=y%3+S-8-3,j=(b>>y&1)===1,m.set(I,N,j,!0),m.set(N,I,j,!0)}function A(m,C,S){const b=m.size,I=f.getEncodedBits(C,S);let N,j;for(N=0;N<15;N++)j=(I>>N&1)===1,N<6?m.set(N,8,j,!0):N<8?m.set(N+1,8,j,!0):m.set(b-15+N,8,j,!0),N<8?m.set(8,b-N-1,j,!0):N<9?m.set(8,15-N-1+1,j,!0):m.set(8,15-N-1,j,!0);m.set(b-8,8,1,!0)}function E(m,C){const S=m.size;let b=-1,I=S-1,N=7,j=0;for(let y=S-1;y>0;y-=2)for(y===6&&y--;;){for(let P=0;P<2;P++)if(!m.isReserved(I,y-P)){let W=!1;j<C.length&&(W=(C[j]>>>N&1)===1),m.set(I,y-P,W),N--,N===-1&&(j++,N=7)}if(I+=b,I<0||S<=I){I-=b,b=-b;break}}}function p(m,C,S){const b=new o;S.forEach(function(P){b.put(P.mode.bit,4),b.put(P.getLength(),h.getCharCountIndicator(P.mode,m)),P.write(b)});const I=t.getSymbolTotalCodewords(m),N=l.getTotalCodewordsCount(m,C),j=(I-N)*8;for(b.getLengthInBits()+4<=j&&b.put(0,4);b.getLengthInBits()%8!==0;)b.putBit(0);const y=(j-b.getLengthInBits())/8;for(let P=0;P<y;P++)b.put(P%2?17:236,8);return T(b,m,C)}function T(m,C,S){const b=t.getSymbolTotalCodewords(C),I=l.getTotalCodewordsCount(C,S),N=b-I,j=l.getBlocksCount(C,S),y=b%j,P=j-y,W=Math.floor(b/j),G=Math.floor(N/j),Xe=G+1,je=W-G,Ae=new a(je);let me=0;const de=new Array(j),ue=new Array(j);let $=0;const J=new Uint8Array(m.buffer);for(let Y=0;Y<j;Y++){const pe=Y<P?G:Xe;de[Y]=J.slice(me,me+pe),ue[Y]=Ae.encode(de[Y]),me+=pe,$=Math.max($,pe)}const ee=new Uint8Array(b);let te=0,H,O;for(H=0;H<$;H++)for(O=0;O<j;O++)H<de[O].length&&(ee[te++]=de[O][H]);for(H=0;H<je;H++)for(O=0;O<j;O++)ee[te++]=ue[O][H];return ee}function z(m,C,S,b){let I;if(Array.isArray(m))I=x.fromArray(m);else if(typeof m=="string"){let W=C;if(!W){const G=x.rawSplit(m);W=u.getBestVersionForData(G,S)}I=x.fromString(m,W||40)}else throw new Error("Invalid data");const N=u.getBestVersionForData(I,S);if(!N)throw new Error("The amount of data is too big to be stored in a QR Code");if(!C)C=N;else if(C<N)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+N+`.
`);const j=p(C,S,I),y=t.getSymbolSize(C),P=new i(y);return g(P,C),v(P),w(P,C),A(P,S,0),C>=7&&B(P,C),E(P,j),isNaN(b)&&(b=c.getBestMask(P,A.bind(null,P,S))),c.applyMask(b,P),A(P,S,b),{modules:P,version:C,errorCorrectionLevel:S,maskPattern:b,segments:I}}return Pe.create=function(C,S){if(typeof C>"u"||C==="")throw new Error("No input text");let b=r.M,I,N;return typeof S<"u"&&(b=r.from(S.errorCorrectionLevel,r.M),I=u.from(S.version),N=c.from(S.maskPattern),S.toSJISFunc&&t.setToSJISFunction(S.toSJISFunc)),z(C,I,b,N)},Pe}var Ye={},Ze={},Rt;function _t(){return Rt||(Rt=1,(function(t){function r(o){if(typeof o=="number"&&(o=o.toString()),typeof o!="string")throw new Error("Color should be defined as hex string");let i=o.slice().replace("#","").split("");if(i.length<3||i.length===5||i.length>8)throw new Error("Invalid hex color: "+o);(i.length===3||i.length===4)&&(i=Array.prototype.concat.apply([],i.map(function(s){return[s,s]}))),i.length===6&&i.push("F","F");const n=parseInt(i.join(""),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:n&255,hex:"#"+i.slice(0,6).join("")}}t.getOptions=function(i){i||(i={}),i.color||(i.color={});const n=typeof i.margin>"u"||i.margin===null||i.margin<0?4:i.margin,s=i.width&&i.width>=21?i.width:void 0,c=i.scale||4;return{width:s,scale:s?4:c,margin:n,color:{dark:r(i.color.dark||"#000000ff"),light:r(i.color.light||"#ffffffff")},type:i.type,rendererOpts:i.rendererOpts||{}}},t.getScale=function(i,n){return n.width&&n.width>=i+n.margin*2?n.width/(i+n.margin*2):n.scale},t.getImageWidth=function(i,n){const s=t.getScale(i,n);return Math.floor((i+n.margin*2)*s)},t.qrToImageData=function(i,n,s){const c=n.modules.size,l=n.modules.data,a=t.getScale(c,s),u=Math.floor((c+s.margin*2)*a),f=s.margin*a,h=[s.color.light,s.color.dark];for(let x=0;x<u;x++)for(let g=0;g<u;g++){let v=(x*u+g)*4,w=s.color.light;if(x>=f&&g>=f&&x<u-f&&g<u-f){const B=Math.floor((x-f)/a),A=Math.floor((g-f)/a);w=h[l[B*c+A]?1:0]}i[v++]=w.r,i[v++]=w.g,i[v++]=w.b,i[v]=w.a}}})(Ze)),Ze}var Mt;function Dn(){return Mt||(Mt=1,(function(t){const r=_t();function o(n,s,c){n.clearRect(0,0,s.width,s.height),s.style||(s.style={}),s.height=c,s.width=c,s.style.height=c+"px",s.style.width=c+"px"}function i(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}t.render=function(s,c,l){let a=l,u=c;typeof a>"u"&&(!c||!c.getContext)&&(a=c,c=void 0),c||(u=i()),a=r.getOptions(a);const f=r.getImageWidth(s.modules.size,a),h=u.getContext("2d"),x=h.createImageData(f,f);return r.qrToImageData(x.data,s,a),o(h,u,f),h.putImageData(x,0,0),u},t.renderToDataURL=function(s,c,l){let a=l;typeof a>"u"&&(!c||!c.getContext)&&(a=c,c=void 0),a||(a={});const u=t.render(s,c,a),f=a.type||"image/png",h=a.rendererOpts||{};return u.toDataURL(f,h.quality)}})(Ye)),Ye}var Ge={},zt;function qn(){if(zt)return Ge;zt=1;const t=_t();function r(n,s){const c=n.a/255,l=s+'="'+n.hex+'"';return c<1?l+" "+s+'-opacity="'+c.toFixed(2).slice(1)+'"':l}function o(n,s,c){let l=n+s;return typeof c<"u"&&(l+=" "+c),l}function i(n,s,c){let l="",a=0,u=!1,f=0;for(let h=0;h<n.length;h++){const x=Math.floor(h%s),g=Math.floor(h/s);!x&&!u&&(u=!0),n[h]?(f++,h>0&&x>0&&n[h-1]||(l+=u?o("M",x+c,.5+g+c):o("m",a,0),a=0,u=!1),x+1<s&&n[h+1]||(l+=o("h",f),f=0)):a++}return l}return Ge.render=function(s,c,l){const a=t.getOptions(c),u=s.modules.size,f=s.modules.data,h=u+a.margin*2,x=a.color.light.a?"<path "+r(a.color.light,"fill")+' d="M0 0h'+h+"v"+h+'H0z"/>':"",g="<path "+r(a.color.dark,"stroke")+' d="'+i(f,u,a.margin)+'"/>',v='viewBox="0 0 '+h+" "+h+'"',B='<svg xmlns="http://www.w3.org/2000/svg" '+(a.width?'width="'+a.width+'" height="'+a.width+'" ':"")+v+' shape-rendering="crispEdges">'+x+g+`</svg>
`;return typeof l=="function"&&l(null,B),B},Ge}var Lt;function Fn(){if(Lt)return ce;Lt=1;const t=vn(),r=Ln(),o=Dn(),i=qn();function n(s,c,l,a,u){const f=[].slice.call(arguments,1),h=f.length,x=typeof f[h-1]=="function";if(!x&&!t())throw new Error("Callback required as last argument");if(x){if(h<2)throw new Error("Too few arguments provided");h===2?(u=l,l=c,c=a=void 0):h===3&&(c.getContext&&typeof u>"u"?(u=a,a=void 0):(u=a,a=l,l=c,c=void 0))}else{if(h<1)throw new Error("Too few arguments provided");return h===1?(l=c,c=a=void 0):h===2&&!c.getContext&&(a=l,l=c,c=void 0),new Promise(function(g,v){try{const w=r.create(l,a);g(s(w,c,a))}catch(w){v(w)}})}try{const g=r.create(l,a);u(null,s(g,c,a))}catch(g){u(g)}}return ce.create=r.create,ce.toCanvas=n.bind(null,o.render),ce.toDataURL=n.bind(null,o.renderToDataURL),ce.toString=n.bind(null,function(s,c,l){return i.render(s,l)}),ce}var Un=Fn();const Vn=dn(Un),_n="SAR";function V(t){return Number(t??0)}function F(t){return V(t).toLocaleString("en-SA",{minimumFractionDigits:2,maximumFractionDigits:2})}function Hn(t){return t==="simplified"}function On(t){if(t===0)return"Zero";const r=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],o=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],i=["","Thousand","Million","Billion"];function n(f){if(f===0)return"";const h=[];return f>=100&&(h.push(r[Math.floor(f/100)]+" Hundred"),f%=100),f>=20&&(h.push(o[Math.floor(f/10)]),f%=10),f>0&&h.push(r[f]),h.join(" ")}const s=Math.floor(t),c=Math.round((t-s)*100);let l="",a=0,u=s;for(;u>0;){const f=u%1e3;f>0&&(l=n(f)+(i[a]?" "+i[a]:"")+(l?" "+l:"")),u=Math.floor(u/1e3),a++}return l=l||"Zero",c>0&&(l+=` and ${c}/100`),l.trim()+" Saudi Riyals"}function Qn(t){if(t===0)return"صفر";const r=[["",""],["واحد","واحدة"],["اثنان","اثنتان"],["ثلاثة","ثلاث"],["أربعة","أربع"],["خمسة","خمس"],["ستة","ست"],["سبعة","سبع"],["ثمانية","ثمان"],["تسعة","تسع"],["عشرة","عشر"],["أحد عشر","إحدى عشرة"],["اثنا عشر","اثنتا عشرة"],["ثلاثة عشر","ثلاث عشرة"],["أربعة عشر","أربع عشرة"],["خمسة عشر","خمس عشرة"],["ستة عشر","ست عشرة"],["سبعة عشر","سبع عشرة"],["ثمانية عشر","ثماني عشرة"],["تسعة عشر","تسع عشرة"]],o=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],i=["","ألف","مليون","مليار"];function n(h,x){if(h===0)return"";const g=x?1:0,v=[];if(h>=100){const w=Math.floor(h/100);w===1?v.push("مائة"):w===2?v.push("مائتان"):v.push(r[w][0]+" مائة"),h%=100}return h>=20&&(v.push(o[Math.floor(h/10)]),h%=10),h>0&&v.push(r[h][g]),v.join(" و ")}const s=Math.floor(t),c=Math.round((t-s)*100);let l="",a=0,u=s;const f=[!1,!0,!1,!1];for(;u>0;){const h=u%1e3;if(h>0){const x=n(h,f[a]);h===1&&a===1?l="ألف"+(l?" "+l:""):h===2&&a===1?l="ألفان"+(l?" "+l:""):l=x+(i[a]?" "+i[a]:"")+(l?" و "+l:"")}u=Math.floor(u/1e3),a++}return l=l||"صفر",c>0&&(l+=` و ${c}/100`),l.trim()+" ريال سعودي"}function Wn(t){if(!t)return"";try{return new Date(t).toLocaleDateString("ar-SA-u-ca-islamic",{year:"numeric",month:"long",day:"numeric"})}catch{return""}}const Dt={draft:{label:"Draft",labelAr:"مسودة",color:"#64748b"},sent:{label:"Sent",labelAr:"مُرسلة",color:"#3b82f6"},paid:{label:"Paid",labelAr:"مدفوعة",color:"#10b981"},partial:{label:"Partial",labelAr:"جزئي",color:"#f59e0b"},overdue:{label:"Overdue",labelAr:"متأخرة",color:"#ef4444"},cancelled:{label:"Cancelled",labelAr:"ملغاة",color:"#6b7280"}},qt={cleared:{label:"Cleared",color:"#10b981"},reported:{label:"Reported",color:"#3b82f6"},pending:{label:"Pending",color:"#f59e0b"},failed:{label:"Failed",color:"#ef4444"}},Kn=R.forwardRef(({invoice:t,company:r,customer:o,items:i,className:n=""},s)=>{const[c,l]=R.useState("");R.useEffect(()=>{if(!t.zatcaQrCode){l("");return}Vn.toDataURL(t.zatcaQrCode,{errorCorrectionLevel:"M",margin:1,width:180,color:{dark:"#0f172a",light:"#ffffff"}}).then(l).catch(()=>l(""))},[t.zatcaQrCode]);const a=r.defaultCurrency??_n,u=Hn(t.invoiceType),f=Dt[t.status??"draft"]??Dt.draft,h=qt[t.zatcaStatus??"pending"]??qt.pending,x=V(t.taxPercent??15),g=V(t.subTotal),v=V(t.taxAmount),w=V(t.totalAmount),B=V(t.paidAmount),A=w-B,E=Wn(t.date);return e.jsxs("div",{ref:s,className:`saudi-invoice-root ${n}`,style:{fontFamily:"'Segoe UI', Tahoma, Arial, sans-serif"},children:[e.jsx("style",{children:`
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
        `}),e.jsxs("div",{className:"inv-page",children:[e.jsx("div",{className:"inv-header",children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1},children:[e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"flex-start"},children:[e.jsx("div",{className:"inv-logo-box",children:r.logo?e.jsx("img",{src:r.logo,alt:"logo"}):e.jsx("span",{style:{color:"white",fontWeight:800,fontSize:20},children:(r.companyName??"YA").slice(0,2).toUpperCase()})}),e.jsxs("div",{children:[e.jsx("div",{style:{color:"white",fontWeight:800,fontSize:20,lineHeight:1.2},children:r.companyName??"Company Name"}),r.companyNameAr&&e.jsx("div",{style:{color:"rgba(255,255,255,.8)",fontWeight:600,fontSize:14,direction:"rtl",marginTop:2},children:r.companyNameAr}),e.jsxs("div",{style:{color:"rgba(255,255,255,.65)",fontSize:11,marginTop:6,lineHeight:1.7},children:[r.address&&e.jsxs("div",{children:[r.address,r.city?`, ${r.city}`:""]}),r.phone&&e.jsx("div",{children:r.phone}),r.email&&e.jsx("div",{children:r.email})]})]})]}),e.jsxs("div",{style:{textAlign:"right"},children:[e.jsxs("div",{className:"inv-title-badge",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:"2.5",children:[e.jsx("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),e.jsx("polyline",{points:"14 2 14 8 20 8"})]}),e.jsx("span",{style:{color:"white",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"},children:u?"Simplified Tax Invoice":"Tax Invoice"})]}),e.jsx("div",{style:{color:"rgba(255,255,255,.9)",fontWeight:800,fontSize:18,direction:"rtl",marginBottom:4},children:u?"فاتورة ضريبية مبسطة":"فاتورة ضريبية"}),e.jsx("div",{style:{color:"rgba(255,255,255,.7)",fontFamily:"monospace",fontSize:16,fontWeight:700},children:t.invoiceNumber??"INV-000000"}),t.zatcaStatus&&e.jsx("div",{style:{marginTop:10},children:e.jsxs("span",{className:"inv-badge",style:{background:`${h.color}22`,border:`1.5px solid ${h.color}44`,color:h.color},children:[e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",background:h.color,display:"inline-block"}}),"ZATCA ",h.label]})}),e.jsx("div",{style:{marginTop:8},children:e.jsxs("span",{className:"inv-badge",style:{background:`${f.color}22`,border:`1.5px solid ${f.color}44`,color:f.color},children:[f.label," / ",f.labelAr]})})]})]})}),e.jsxs("div",{className:"inv-stats",children:[e.jsxs("div",{className:"inv-stat-box inv-stat-box-subtotal",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#2563eb"},children:"Subtotal / المجموع"}),e.jsx("div",{className:"inv-stat-value",style:{color:"#1d4ed8"},children:F(g)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#3b82f6"},children:a})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-vat",children:[e.jsxs("div",{className:"inv-stat-label",style:{color:"#059669"},children:["VAT ",x,"% / ضريبة القيمة"]}),e.jsx("div",{className:"inv-stat-value",style:{color:"#047857"},children:F(v)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#10b981"},children:a})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-total",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"rgba(255,255,255,.75)"},children:"TOTAL / الإجمالي"}),e.jsx("div",{className:"inv-stat-value",style:{color:"white"},children:F(w)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"rgba(255,255,255,.7)"},children:a})]}),e.jsxs("div",{className:"inv-stat-box inv-stat-box-paid",children:[e.jsx("div",{className:"inv-stat-label",style:{color:"#d97706"},children:"Amount Due / المستحق"}),e.jsx("div",{className:"inv-stat-value",style:{color:A>0?"#dc2626":"#16a34a"},children:F(A)}),e.jsx("div",{className:"inv-stat-currency",style:{color:"#f59e0b"},children:a})]})]}),e.jsxs("div",{className:"inv-body",children:[e.jsxs("div",{className:"inv-info-grid",children:[e.jsxs("div",{className:"inv-info-card inv-info-card-seller",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#059669"},children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#059669",strokeWidth:"2.5",children:e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"})}),"Seller / البائع"]}),e.jsx("div",{className:"inv-card-name",children:r.companyName??"—"}),r.companyNameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#065f46"},children:r.companyNameAr}),e.jsxs("div",{className:"inv-card-text",children:[r.address&&e.jsxs("div",{children:[r.address,r.city?`, ${r.city}`:""]}),r.country&&e.jsx("div",{children:r.country}),r.phone&&e.jsxs("div",{children:["📞 ",r.phone]}),r.email&&e.jsxs("div",{children:["✉ ",r.email]})]}),r.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46"},children:["🏛 VAT: ",r.taxNumber]}),r.crNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#d1fae5",color:"#065f46",marginTop:4},children:["📋 CR: ",r.crNumber]})]}),e.jsxs("div",{className:"inv-info-card inv-info-card-buyer",children:[e.jsxs("div",{className:"inv-card-tag",style:{color:"#2563eb"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"#2563eb",strokeWidth:"2.5",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),"Bill To / العميل"]}),e.jsx("div",{className:"inv-card-name",children:o.name??"—"}),o.nameAr&&e.jsx("div",{className:"inv-card-name-ar",style:{color:"#1e40af"},children:o.nameAr}),e.jsxs("div",{className:"inv-card-text",children:[o.address&&e.jsxs("div",{children:[o.address,o.city?`, ${o.city}`:""]}),o.phone&&e.jsxs("div",{children:["📞 ",o.phone]}),o.email&&e.jsxs("div",{children:["✉ ",o.email]})]}),o.taxNumber&&e.jsxs("div",{className:"inv-vat-badge",style:{background:"#dbeafe",color:"#1e40af"},children:["🏛 Customer VAT: ",o.taxNumber]})]})]}),e.jsxs("div",{className:"inv-meta-row",style:{gridTemplateColumns:"repeat(6, 1fr)"},children:[e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",children:[e.jsx("div",{className:"inv-meta-label",children:"Invoice Type"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#0f172a",fontSize:10},children:t.invoiceType==="simplified"?"Simplified / مبسطة":t.invoiceType==="zatca"?"ZATCA / فاتورة ذاتكا":"Standard / قياسية"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",children:[e.jsx("div",{className:"inv-meta-label",children:"Issue Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#c2410c",fontSize:11},children:t.date??"—"}),E&&e.jsx("div",{style:{fontSize:9,color:"#9a3412",direction:"rtl",marginTop:1},children:E})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-type",style:{background:"#f0fdf4",borderColor:"#bbf7d0"},children:[e.jsx("div",{className:"inv-meta-label",children:"Issue Time"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#065f46",fontSize:11},children:t.time??"—"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-due",children:[e.jsx("div",{className:"inv-meta-label",children:"Due Date"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#b91c1c",fontSize:11},children:t.dueDate??"Upon Receipt"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-uuid",style:{background:"#faf5ff",borderColor:"#e9d5ff"},children:[e.jsx("div",{className:"inv-meta-label",children:t.workedMonth?"Worked Month":"Payment Method"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#6d28d9",fontSize:10},children:t.workedMonth??t.paymentMethod??"—"})]}),e.jsxs("div",{className:"inv-meta-pill inv-meta-pill-date",style:{background:"#fff7ed",borderColor:"#fed7aa"},children:[e.jsx("div",{className:"inv-meta-label",children:t.poNumber?"PO No.":t.cashier?"Cashier":"Created By"}),e.jsx("div",{className:"inv-meta-value",style:{color:"#9a3412",fontSize:10},children:t.poNumber??t.cashier??t.createdBy??"—"})]})]}),(t.contractNumber||t.projectReference)&&e.jsxs("div",{style:{display:"flex",gap:12,marginBottom:16},children:[t.contractNumber&&e.jsxs("div",{style:{fontSize:11,color:"#475569",background:"#f1f5f9",padding:"4px 12px",borderRadius:6},children:[e.jsx("strong",{children:"Contract:"})," ",t.contractNumber]}),t.projectReference&&e.jsxs("div",{style:{fontSize:11,color:"#475569",background:"#f1f5f9",padding:"4px 12px",borderRadius:6},children:[e.jsx("strong",{children:"Project:"})," ",t.projectReference]})]}),e.jsx("div",{className:"inv-table-wrap",children:e.jsxs("table",{className:"inv-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:32,textAlign:"center"},children:"#"}),t.invoiceMode==="labor"||t.invoiceMode==="construction"?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Worker / Job Description"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Total Hrs"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Rate/Hour"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]}):t.invoiceMode==="service"?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Service Description"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Rate"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"SKU / Description / الوصف"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Unit"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"Unit Price"}),e.jsx("th",{style:{textAlign:"right",width:70},children:"Disc %"}),e.jsx("th",{style:{textAlign:"right",width:80},children:"VAT %"}),e.jsx("th",{style:{textAlign:"right",width:100},children:"VAT Amt"}),e.jsx("th",{style:{textAlign:"right",width:110},children:"Total / الإجمالي"})]})]})}),e.jsx("tbody",{children:i.map((p,T)=>{const z=V(p.quantity),m=t.invoiceMode==="labor"||t.invoiceMode==="construction"?V(p.ratePerHour??p.unitPrice):V(p.unitPrice),C=V(p.totalHours??z),S=t.invoiceMode==="labor"||t.invoiceMode==="construction"?C*m:z*m,b=V(p.discountPercent??0),I=S*(b/100),N=S-I,j=V(p.taxPercent),y=N*(j/100),P=p.totalAmount&&V(p.totalAmount)||N+y;return e.jsxs("tr",{children:[e.jsx("td",{style:{textAlign:"center"},children:e.jsx("span",{className:"inv-row-num",children:T+1})}),e.jsxs("td",{children:[e.jsxs("div",{className:"inv-item-desc",children:[p.sku&&e.jsxs("span",{style:{color:"#64748b",fontFamily:"monospace",fontSize:11},children:["[",p.sku,"] "]}),p.description]}),p.descriptionAr&&e.jsx("div",{className:"inv-item-desc-ar",children:p.descriptionAr})]}),t.invoiceMode==="labor"||t.invoiceMode==="construction"?e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:p.unit||"d"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:C.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(m)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(y)}),e.jsx("td",{className:"inv-table-number",children:F(N+y)})]}):t.invoiceMode==="service"?e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:p.unit||"service"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:z.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(m)}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(y)}),e.jsx("td",{className:"inv-table-number",children:F(N+y)})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{style:{textAlign:"right"},children:p.unit||"pcs"}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:z.toLocaleString()}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(m)}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:b>0?`${b}%`:"—"}),e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("span",{style:{background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700},children:[j,"%"]})}),e.jsx("td",{style:{textAlign:"right"},className:"inv-table-number",children:F(y)}),e.jsx("td",{className:"inv-table-number",children:F(P)})]})]},p.id??T)})})]})}),e.jsxs("div",{className:"inv-footer-grid",children:[e.jsxs("div",{children:[e.jsx("div",{className:"inv-totals",style:{marginBottom:12},children:e.jsxs("div",{className:"inv-totals-row",style:{background:"#f8fafc",flexDirection:"column",alignItems:"flex-start",gap:4},children:[e.jsx("span",{className:"inv-totals-label",style:{fontSize:10,textTransform:"uppercase",letterSpacing:".05em"},children:"Amount in Words / المبلغ بالكلمات"}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#1e293b",lineHeight:1.4},children:On(w)}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#1e293b",direction:"rtl",lineHeight:1.4},children:Qn(w)})]})}),(t.notes||t.terms||r.invoiceTerms)&&e.jsxs("div",{className:"inv-notes",children:[e.jsx("div",{style:{fontWeight:700,marginBottom:6,color:"#6d28d9"},children:"Terms & Notes / الشروط والملاحظات"}),e.jsx("div",{style:{lineHeight:1.7},children:t.notes||t.terms||r.invoiceTerms})]})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{className:"inv-totals",children:[e.jsxs("div",{className:"inv-totals-row inv-totals-row-sub",children:[e.jsx("span",{className:"inv-totals-label",children:"Subtotal / المجموع الفرعي"}),e.jsxs("span",{className:"inv-totals-value",children:[F(g)," ",a]})]}),V(t.discountAmount)>0&&e.jsxs("div",{className:"inv-totals-row",style:{background:"#fefce8"},children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Discount / الخصم"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#ca8a04"},children:["-",F(t.discountAmount)," ",a]})]}),e.jsxs("div",{className:"inv-totals-row",style:{background:"#f8fafc"},children:[e.jsx("span",{className:"inv-totals-label",children:"Taxable Amount / المبلغ الخاضع للضريبة"}),e.jsxs("span",{className:"inv-totals-value",children:[F(V(t.taxableAmount)||g)," ",a]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-vat",children:[e.jsxs("span",{className:"inv-totals-label",children:["VAT ",x,"% / ضريبة القيمة المضافة"]}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#059669"},children:[F(v)," ",a]})]}),e.jsxs("div",{className:"inv-totals-row inv-totals-row-total",children:[e.jsx("span",{className:"inv-totals-label-white",children:"GRAND TOTAL / الإجمالي الكلي"}),e.jsxs("span",{className:"inv-totals-value-big",children:[F(w)," ",a]})]}),B>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-paid",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#854d0e"},children:"Paid / المدفوع"}),e.jsxs("span",{className:"inv-totals-value",style:{color:"#854d0e"},children:[F(B)," ",a]})]}),V(t.balanceDue)>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[F(t.balanceDue)," ",a]})]}),B<=0&&V(t.balanceDue)<=0&&A>0&&e.jsxs("div",{className:"inv-totals-row inv-totals-row-due",children:[e.jsx("span",{className:"inv-totals-label",style:{color:"#991b1b"},children:"Balance Due / المبلغ المستحق"}),e.jsxs("span",{className:"inv-totals-value inv-totals-value-due",children:[F(A)," ",a]})]})]}),c&&e.jsxs("div",{className:"inv-qr-box",children:[e.jsx("img",{src:c,alt:"ZATCA QR",className:"inv-qr-img"}),e.jsx("div",{className:"inv-qr-label",children:"ZATCA Phase 2 QR Code"}),e.jsx("div",{className:"inv-qr-label-ar",children:"رمز الاستجابة السريعة - هيئة الزكاة والضريبة"})]})]})]}),e.jsxs("div",{className:"inv-compliance",children:[e.jsx("div",{style:{textAlign:"center",marginBottom:14},children:e.jsx("span",{style:{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#64748b",background:"#f1f5f9",padding:"4px 16px",borderRadius:100},children:"⚖️ Saudi Arabia — ZATCA Compliance Information / معلومات الامتثال الضريبي"})}),e.jsxs("div",{className:"inv-compliance-grid",children:[e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-zatca",children:[e.jsx("div",{className:"inv-compliance-label",children:"🏛 ZATCA VAT Number"}),e.jsx("div",{className:"inv-compliance-value",children:r.taxNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"الرقم الضريبي للبائع"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-vat",children:[e.jsx("div",{className:"inv-compliance-label",children:"📋 Commercial Registration"}),e.jsx("div",{className:"inv-compliance-value",children:r.crNumber??"—"}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"السجل التجاري"})]}),e.jsxs("div",{className:"inv-compliance-item inv-compliance-item-cr",children:[e.jsx("div",{className:"inv-compliance-label",children:"🔐 ZATCA Status"}),e.jsxs("div",{className:"inv-compliance-value",style:{color:h.color},children:[h.label," / ",t.zatcaStatus??"Pending"]}),e.jsx("div",{style:{marginTop:4,fontSize:10},children:"حالة ZATCA"})]})]}),t.hash&&e.jsxs("div",{style:{marginTop:14,padding:"8px 14px",borderRadius:10,background:"#f8fafc",border:"1px solid #e2e8f0",fontSize:10,color:"#64748b",wordBreak:"break-all",textAlign:"center"},children:[e.jsx("strong",{children:"Invoice Hash / تجزئة الفاتورة:"})," ",t.hash]})]}),r.website&&e.jsx("div",{style:{textAlign:"center",marginTop:16,fontSize:11,color:"#64748b"},children:r.website}),e.jsxs("div",{className:"inv-watermark",children:["This invoice was generated in compliance with Saudi Arabia's ZATCA e-Invoicing Phase 2 regulations.",e.jsx("br",{}),"تم إنشاء هذه الفاتورة وفقًا لأنظمة الفوترة الإلكترونية للمرحلة الثانية من هيئة الزكاة والضريبة والجمارك"]})]})]})]})});Kn.displayName="SaudiInvoicePrint";function Ht(t){const{companyName:r,companyNameAr:o,companyLogo:i,companyAddress:n,companyPhone:s,companyVat:c,currency:l,taxPercent:a,note:u,pSub:f,pDisc:h,pVat:x,pTotal:g,pCustName:v,pCustPhone:w,pCustAddr:B,pCustVat:A,pType:E,printItems:p}=t,T=JSON.stringify({seller:o||r,vat:c,total:g.toFixed(2),tax:x.toFixed(2),date:new Date().toISOString()}),z=btoa(unescape(encodeURIComponent(T)));return`<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><title>Bill - ${r}</title>
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
<h1>${r}</h1>${o?`<h2>${o}</h2>`:""}
${i?`<img src="${i}" style="max-width:60px;max-height:40px">`:""}
${n?`<div class="info-line">${n}</div>`:""}
${s?`<div class="info-line">${s}</div>`:""}
${c?`<div class="info-line"><strong>VAT: ${c}</strong></div>`:""}
</div>
<div class="qr-section" style="width:120px">
<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(z)}" style="width:100px;height:100px">
<p>${E==="zatca"?"ZATCA QR":"Invoice QR"}</p>
</div>
</div>
<div class="title">TAX INVOICE / فاتورة ضريبية<span class="badge">${E==="zatca"?"ZATCA":"Standard"}</span></div>
<div class="customer">
<h3>Customer / العميل</h3>
<p><strong>${v}</strong></p>
${w?`<p>Phone: ${w}</p>`:""}
${B?`<p>Address: ${B}</p>`:""}
${A?`<p>VAT: ${A}</p>`:""}
</div>
<table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
${p.map(m=>`<tr><td>${m.no}</td><td>${m.name}</td><td>${m.qty}</td><td>${m.rate.toFixed(2)}</td><td>${m.total.toFixed(2)}</td></tr>`).join("")}
</tbody></table>
<div class="totals">
<div class="total-row"><span>Subtotal:</span><span>${l} ${f.toFixed(2)}</span></div>
${h>0?`<div class="total-row"><span>Discount:</span><span>-${l} ${h.toFixed(2)}</span></div>`:""}
<div class="total-row"><span>VAT ${a}%:</span><span>${l} ${x.toFixed(2)}</span></div>
<div class="total-row grand"><span>TOTAL:</span><span>${l} ${g.toFixed(2)}</span></div>
</div>
${u?`<div style="margin-top:15px;padding:10px;background:#f9f9ff;border-radius:5px;font-size:13px"><strong>Note:</strong> ${u}</div>`:""}
<div class="footer">شكراً لتعاملكم معنا / Thank You For Your Business!</div>
</div>
<script>window.onload=function(){window.print();}<\/script></body></html>`}function Jn({detail:t}){if(!t?.invoice)return null;const r=t.invoice,o=(t.items||[]).map((B,A)=>({no:A+1,name:B.description||`Item #${B.productId||B.id}`,qty:Number(B.quantity||1),rate:Number(B.unitPrice||0),total:Number(B.totalAmount||0)})),i=t.customer,n=Number(r.subTotal||0),s=Number(r.discountAmount||0),c=Number(r.taxAmount||0),l=Number(r.totalAmount||0),a=i?.name||i?.nameAr||"Walk-in Customer",u=i?.phone||"",f=i?.address||"",h=i?.vatNumber||i?.taxNumber||"",x=r.invoiceType==="zatca"?"zatca":"standard",g=Ht({companyName:r.companyName||"",companyNameAr:r.companyNameAr,companyLogo:r.companyLogo,companyAddress:r.companyAddress,companyPhone:r.companyPhone,companyVat:r.companyVat,currency:r.currency||"SAR",taxPercent:r.taxPercent||"15",note:r.notes||"",pSub:n,pDisc:s,pVat:c,pTotal:l,pCustName:a,pCustPhone:u,pCustAddr:f,pCustVat:h,pType:x,printItems:o}),v=new Blob([g],{type:"text/html"}),w=URL.createObjectURL(v);return e.jsx("iframe",{src:w,className:"w-full h-full border-0 bg-white rounded-lg shadow-lg",style:{minHeight:"85vh"},title:"Invoice Preview",onLoad:()=>setTimeout(()=>URL.revokeObjectURL(w),1e4)})}function Cr(){const t=un(),{data:r,refetch:o}=q.sales.invoiceList.useQuery(void 0),{data:i}=q.sales.customerList.useQuery(void 0),{data:n,refetch:s}=q.inventory.productList.useQuery(void 0),{data:c,refetch:l}=q.inventory.categoryList.useQuery(void 0),{data:a}=q.settings.companySettingsGet.useQuery(),u=q.sales.invoiceCreate.useMutation({onSuccess:d=>{t.invalidateQueries(),M.success("Bill created"),rt();const k=d?.id;k&&I.trim()&&x.mutate({invoiceId:k,to:I.trim()}),k&&setTimeout(()=>it(k),400)},onError:d=>M.error(d.message)}),f=q.sales.invoiceUpdate.useMutation({onSuccess:()=>{t.invalidateQueries({queryKey:[["sales","invoiceList"]]}),t.invalidateQueries({queryKey:[["sales","invoiceGet"]]}),M.success("Invoice updated")},onError:d=>M.error(d.message)});q.sales.invoiceDelete.useMutation({onSuccess:()=>{t.invalidateQueries({queryKey:[["sales","invoiceList"]]}),t.invalidateQueries({queryKey:[["sales","invoiceGet"]]}),M.success("Invoice deleted"),J(null)},onError:d=>M.error(d.message)}),q.sales.invoiceUpdateStatus.useMutation({onSuccess:()=>o()}),q.zatca.generateXml.useMutation({onSuccess:()=>{M.success("ZATCA UBL XML generated"),o()},onError:d=>M.error(d.message)}),q.zatca.generateQrCode.useMutation({onSuccess:()=>{M.success("ZATCA QR generated"),o()},onError:d=>M.error(d.message)}),q.zatca.signInvoice.useMutation({onSuccess:()=>{M.success("Invoice signed"),o()},onError:d=>M.error(d.message)}),q.zatca.clearanceInvoice.useMutation({onSuccess:()=>M.success("ZATCA clearance logged"),onError:d=>M.error(d.message)}),q.zatca.reportInvoice.useMutation({onSuccess:()=>M.success("ZATCA reporting logged"),onError:d=>M.error(d.message)}),q.zatca.syncStatus.useMutation({onSuccess:()=>M.success("ZATCA status synced"),onError:d=>M.error(d.message)});const h=q.whatsapp.sendInvoiceCreated.useMutation({onSuccess:()=>M.success("Invoice sent on WhatsApp"),onError:d=>M.error(d.message)}),x=q.email.sendInvoice.useMutation({onSuccess:()=>M.success("Invoice sent via email"),onError:d=>M.error("Email failed: "+d.message)});q.inventory.productCreate.useMutation({onSuccess:()=>{s(),M.success("Product added")},onError:d=>M.error(d.message)}),q.inventory.categoryCreate.useMutation({onSuccess:()=>{l(),M.success("Category created")},onError:d=>M.error(d.message)});const g=q.thermalPrint.generateThermal.useMutation({onSuccess:d=>{try{const k=atob(d.data),_=new Uint8Array(k.length);for(let oe=0;oe<k.length;oe++)_[oe]=k.charCodeAt(oe);const L=new Blob([_],{type:"application/octet-stream"}),re=URL.createObjectURL(L),he=document.createElement("a");he.href=re,he.download=`receipt-${d.format}.bin`,he.click(),M.success(`Thermal receipt (${d.format}) ready to print`)}catch{M.error("Failed to process thermal data")}},onError:d=>M.error(d.message)}),[v,w]=R.useState([]),[B,A]=R.useState(0),[E,p]=R.useState(""),[T,z]=R.useState(""),[m,C]=R.useState(""),[S,b]=R.useState(""),[I,N]=R.useState(""),[j,y]=R.useState(0),[P,W]=R.useState(""),[G,Xe]=R.useState(""),[je,Ae]=R.useState(!1),[me,de]=R.useState(-1),ue=R.useRef(null),[$,J]=R.useState(null),[ee,te]=R.useState(null),[H,O]=R.useState(null),[Y,pe]=R.useState(""),[xe,be]=R.useState("create"),[et,Yn]=R.useState("standard"),[Zn,Gn]=R.useState(!1),[$n,Xn]=R.useState(""),[er,tr]=R.useState(""),[nr,rr]=R.useState(""),[ir,sr]=R.useState(""),[or,ar]=R.useState(void 0),[lr,cr]=R.useState(!1),[dr,ur]=R.useState(""),[fr,hr]=R.useState("");R.useRef(null);const K=q.sales.invoiceGet.useQuery({id:$??H},{enabled:!!$||!!H}),ne=a?.defaultCurrency||"SAR",fe=Number(a?.vatRate??15),tt=a?.companyName||a?.companyNameAr||"Company Name",Ot=a?.companyNameAr||"",Qt=a?.address||"",nt=a?.phone||"",Wt=a?.taxNumber||a?.vatNumber||"",Kt=a?.logo||"";a?.country;const ve=v.reduce((d,k)=>d+k.price*k.qty,0),Ce=Math.max(0,ve-j),ye=Ce*fe/100,Se=Ce+ye;(n||[]).filter(d=>!G||(d.name||"").toLowerCase().includes(G.toLowerCase())),(i||[]).filter(d=>!E||(d.name||"").toLowerCase().includes(E.toLowerCase())).slice(0,10),R.useEffect(()=>{const d=k=>{ue.current&&!ue.current.contains(k.target)&&Ae(!1)};return document.addEventListener("click",d),()=>document.removeEventListener("click",d)},[]),R.useEffect(()=>{if(!H)return;const d=K.data;if(!d||!d.invoice||d.invoice.id!==H)return;const k=d.invoice;te(k.id),O(null),be("create"),w((d.items||[]).map((_,L)=>({id:String(_.productId||`-${L}`),name:(_.description||"Item").replace(/^\[\d+\]\s*/,""),price:Number(_.unitPrice||0),qty:Number(_.quantity||1),sku:_.sku}))),A(d.customer?.id||0),p(d.customer?.name||""),z(d.customer?.phone||""),C(d.customer?.address||""),b(d.customer?.vatNumber||d.customer?.taxNumber||""),N(d.customer?.email||""),y(Number(k.discountAmount||0)),W(k.notes||"")},[H,K.data]);const Jt=d=>{w(k=>k.find(L=>L.id===d.id)?k.map(L=>L.id===d.id?{...L,qty:L.qty+1}:L):[...k,{id:d.id,name:d.name||"Item",price:Number(d.price||0),qty:1,sku:d.sku}])},rt=()=>{w([]),A(0),p(""),z(""),C(""),b(""),y(0),W("")},Yt=d=>{if(d.preventDefault(),!v.length){M.error("Add at least one item to the cart");return}E.trim();const k=v.map(L=>({description:`[${L.id}] ${L.name}`,quantity:L.qty,unitPrice:L.price.toString(),taxPercent:fe.toString(),totalAmount:(L.price*L.qty).toFixed(2),unit:"pcs",sku:L.sku})),_={invoiceNumber:`BILL-${Date.now().toString().slice(-6)}`,customerId:B||0,date:new Date().toISOString().slice(0,10),dueDate:"",invoiceType:et,invoiceMode:"product",subTotal:ve.toFixed(2),taxAmount:ye.toFixed(2),taxPercent:fe.toString(),totalAmount:Se.toFixed(2),discountAmount:j.toString(),taxableAmount:Ce.toFixed(2),notes:P,items:k};ee?f.mutate({id:ee,..._}):u.mutate(_)},Zt=()=>{const d=!!$&&!!K.data,k=d?K.data.invoice:null,_=d?K.data.items||[]:[],L=d?K.data.customer:null,re=d?_.map((U,Ie)=>({no:Ie+1,name:U.description||`Item #${U.productId||U.id}`,qty:Number(U.quantity||1),rate:Number(U.unitPrice||0),total:Number(U.totalAmount||0)})):v.map((U,Ie)=>({no:Ie+1,name:U.name,qty:U.qty,rate:U.price,total:U.price*U.qty}));if(re.length===0){M.error("Add items to cart before printing");return}const he=d?Number(k?.subTotal||0):ve,oe=d?Number(k?.discountAmount||0):j,en=d?Number(k?.taxAmount||0):ye,tn=d?Number(k?.totalAmount||0):Se,nn=d?L?.name||L?.nameAr||"Walk-in Customer":E||"Walk-in Customer",rn=d?L?.phone:T,sn=d?L?.address:m,on=d?L?.vatNumber||L?.taxNumber:S,an=d?k?.invoiceType==="zatca"?"zatca":"standard":et,ln=Ht({companyName:tt,companyNameAr:Ot,companyLogo:Kt,companyAddress:Qt,companyPhone:nt,companyVat:Wt,currency:ne,taxPercent:fe,note:P,pSub:he,pDisc:oe,pVat:en,pTotal:tn,pCustName:nn,pCustPhone:rn,pCustAddr:sn,pCustVat:on,pType:an,printItems:re}),cn=new Blob([ln],{type:"text/html"}),Te=URL.createObjectURL(cn);if(!window.open(Te,"_blank")){const U=document.createElement("a");U.href=Te,U.target="_blank",document.body.appendChild(U),U.click(),document.body.removeChild(U)}setTimeout(()=>URL.revokeObjectURL(Te),1e4)},Gt=()=>{if(!D?.invoice)return;const d=D.invoice,k=D.customer?.name||"Walk-in Customer",_=Number(d.totalAmount||0).toFixed(2),L=`*${tt}*
*Invoice: ${d.invoiceNumber}*
Customer: ${k}
Total: ${ne} ${_}
Date: ${d.date}`,re=D.customer?.phone||nt;re?window.open(`https://wa.me/${re.replace(/\D/g,"")}?text=${encodeURIComponent(L)}`,"_blank"):window.open(`https://wa.me/?text=${encodeURIComponent(L)}`,"_blank"),h.mutate({invoiceId:d.id})},$t=()=>{if(!D?.invoice)return;const d=D.invoice,k=D.customer?.email||"";if(!k){M.error("No customer email. Add email to customer record first.");return}x.mutate({invoiceId:d.id,to:k})},it=d=>{J(d),te(null),w([]),A(0),p(""),z(""),C(""),b(""),N(""),y(0),W("")},st=d=>{O(d),J(null)},ot=(d,k="a4")=>{k==="thermal"?g.mutate({invoiceId:d,format:"80mm"}):J(d)},Xt={draft:"bg-slate-100 text-slate-700",sent:"bg-blue-100 text-blue-700",paid:"bg-emerald-100 text-emerald-700",partial:"bg-amber-100 text-amber-700",overdue:"bg-red-100 text-red-700",cancelled:"bg-gray-100 text-gray-700"},we=r?.filter(d=>!Y||Y==="all"||d.status===Y)||[],D=K.data;return D?.invoice?.id,e.jsxs("div",{className:"h-screen flex flex-col",children:[e.jsx("div",{className:"p-4 border-b bg-white",children:e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold",children:"Invoices / فواتير"}),e.jsxs("p",{className:"text-slate-500 text-sm",children:[we.length," invoices"]})]}),e.jsxs("div",{className:"flex gap-2 items-center",children:[e.jsxs("div",{className:"flex bg-slate-100 rounded-lg p-1",children:[e.jsx("button",{type:"button",onClick:()=>{be("create"),J(null),te(null)},className:`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${xe==="create"?"bg-white shadow text-blue-700":"text-slate-500 hover:text-slate-700"}`,children:"Create Bill"}),e.jsxs("button",{type:"button",onClick:()=>be("history"),className:`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${xe==="history"?"bg-white shadow text-blue-700":"text-slate-500 hover:text-slate-700"}`,children:["Invoice History (",we.length,")"]})]}),e.jsx(Q,{variant:"outline",size:"sm",onClick:()=>{rt(),te(null),J(null),be("create")},children:"New Bill"})]})]})}),e.jsxs("div",{className:"flex-1 flex overflow-hidden",children:[xe==="create"&&e.jsxs("div",{className:"flex-1 flex",children:[e.jsxs("div",{className:"w-80 border-r bg-white p-4 space-y-4 overflow-y-auto",children:[e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Customer / العميل"}),e.jsx(ae,{value:E,onChange:d=>p(d.target.value),placeholder:"Type customer name...",className:"h-8 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Phone (optional)"}),e.jsx(ae,{value:T,onChange:d=>z(d.target.value),placeholder:"Optional",className:"h-8 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Address (optional)"}),e.jsx(ae,{value:m,onChange:d=>C(d.target.value),placeholder:"Optional",className:"h-8 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Customer VAT (optional)"}),e.jsx(ae,{value:S,onChange:d=>b(d.target.value),placeholder:"e.g. 311777758600003",className:"h-8 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Customer Email (for auto-send bill)"}),e.jsx(ae,{type:"email",value:I,onChange:d=>N(d.target.value),placeholder:"customer@email.com",className:"h-8 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{className:"text-xs font-semibold text-slate-600 block mb-2",children:"Discount"}),e.jsx(ae,{type:"number",className:"w-20 h-7 text-xs text-right",value:j,onChange:d=>y(parseFloat(value)||0)})]})]}),e.jsx("div",{className:"flex-1 p-4 overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",children:n?.map(d=>e.jsxs("button",{onClick:()=>Jt(d),className:"border-2 border-slate-200 rounded-lg p-3 text-left hover:border-blue-400 hover:shadow-md transition-all",children:[e.jsx("div",{className:"text-xs font-bold text-slate-700 truncate",children:d.name}),e.jsx("div",{className:"text-xs text-slate-500",children:d.sku}),e.jsxs("div",{className:"text-sm font-bold text-blue-600",children:[ne," ",Number(d.salePrice).toFixed(2)]})]},d.id))})}),e.jsxs("div",{className:"w-80 border-l bg-white p-4 flex flex-col",children:[e.jsx("h3",{className:"font-semibold text-slate-800 mb-3",children:"Cart"}),e.jsx("div",{className:"flex-1 overflow-y-auto space-y-2",children:v.length===0?e.jsx("p",{className:"text-xs text-slate-400 text-center py-8",children:"No items in cart"}):v.map((d,k)=>e.jsxs("div",{className:"flex items-center gap-2 p-2 bg-slate-50 rounded text-xs",children:[e.jsx("span",{className:"flex-1 truncate",children:d.name}),e.jsx("span",{className:"font-bold",children:d.price.toFixed(2)})]},k))}),e.jsxs("div",{className:"border-t pt-3 space-y-1 text-xs",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Subtotal:"}),e.jsxs("span",{children:[ne," ",ve.toFixed(2)]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("span",{children:["VAT (",fe,"%):"]}),e.jsxs("span",{children:[ne," ",ye.toFixed(2)]})]}),e.jsxs("div",{className:"flex justify-between font-bold text-sm",children:[e.jsx("span",{children:"TOTAL:"}),e.jsxs("span",{children:[ne," ",Se.toFixed(2)]})]})]}),e.jsxs(Q,{className:"w-full mt-3",onClick:Yt,disabled:u.isPending||f.isPending||v.length===0,children:[e.jsx(fn,{className:"h-4 w-4 mr-2"})," ",ee?"Update":"Create Bill"]})]})]}),xe==="history"&&e.jsx("div",{className:"flex-1 overflow-y-auto p-4",children:we.length===0?e.jsx("div",{className:"text-center py-16 text-slate-400",children:"No invoices found."}):e.jsx("div",{className:"grid md:grid-cols-2 xl:grid-cols-3 gap-4",children:we.map(d=>e.jsxs("div",{className:"border rounded-xl p-4 bg-white hover:shadow-md transition-shadow",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"font-mono text-sm font-bold text-blue-700",children:d.invoiceNumber}),e.jsx("span",{className:`text-xs px-2 py-0.5 rounded-full font-medium ${Xt[d.status]||"bg-slate-100 text-slate-700"}`,children:d.status})]}),e.jsxs("div",{className:"text-xs text-slate-500 mb-3",children:[new Date(d.date).toLocaleDateString()," · ",d.invoiceType]}),e.jsx("div",{className:"text-sm text-slate-700 mb-1",children:d.customerName||"Walk-in Customer"}),e.jsxs("div",{className:"text-lg font-bold text-emerald-600 mb-3",children:[ne," ",Number(d.totalAmount||0).toFixed(2)]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(Q,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>it(d.id),children:[e.jsx(bn,{className:"h-3.5 w-3.5 mr-1"})," View"]}),e.jsxs(Q,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>st(d.id),children:[e.jsx(at,{className:"h-3.5 w-3.5 mr-1"})," Edit"]}),e.jsx(Q,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>ot(d.id,"a4"),title:"A4 PDF",children:"📄 A4"}),e.jsx(Q,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>ot(d.id,"thermal"),disabled:g.isPending,title:"80mm Receipt",children:"🖨️ 80mm"}),e.jsx(Q,{size:"sm",variant:"outline",className:"text-red-500 hover:text-red-600 hover:border-red-300",onClick:()=>handleDeleteInvoice(d.id),children:e.jsx(lt,{className:"h-3.5 w-3.5"})})]})]},d.id))})})]}),e.jsx(hn,{open:!!$,onOpenChange:d=>{d||(J(null),O(null))},children:e.jsxs(gn,{"data-invoice-view":"true",className:"overflow-hidden flex flex-col p-0","aria-describedby":"invoice-view-desc",children:[e.jsx(mn,{className:"sr-only",children:"Invoice View"}),e.jsx("p",{id:"invoice-view-desc",className:"sr-only",children:"Invoice details with actions: edit, print, delete, send via WhatsApp"}),e.jsxs("div",{className:"flex items-center justify-between p-4 border-b bg-white shrink-0 shadow-sm",children:[e.jsxs("h2",{className:"text-lg font-bold",children:["Invoice ",D?.invoice?.invoiceNumber||"Loading..."]}),e.jsxs("div",{className:"flex gap-2 flex-wrap",children:[e.jsx(Q,{size:"sm",variant:"default",onClick:Zt,disabled:K.isPending||!D?.invoice||g.isPending,title:"Print A4 PDF",children:"📄 A4 Print"}),e.jsx(Q,{size:"sm",variant:"outline",disabled:K.isPending||!D?.invoice||g.isPending,onClick:()=>D?.invoice&&g.mutate({invoiceId:D.invoice.id,format:"80mm"}),title:"Print 80mm Thermal Receipt",children:"🖨️ Thermal"}),e.jsxs(Q,{size:"sm",variant:"outline",onClick:()=>D?.invoice&&st(D.invoice.id),disabled:K.isPending||!D?.invoice,children:[e.jsx(at,{className:"h-4 w-4 mr-1"})," Edit"]}),e.jsxs(Q,{size:"sm",variant:"outline",onClick:Gt,disabled:!D?.invoice,children:[e.jsx(pn,{className:"h-4 w-4 mr-1"})," WhatsApp"]}),e.jsxs(Q,{size:"sm",variant:"outline",onClick:$t,disabled:!D?.invoice||x.isPending,title:"Send invoice via email",children:["✉️ ",x.isPending?"...":"Email"]}),e.jsxs(Q,{size:"sm",variant:"outline",className:"text-red-500 hover:text-red-600 hover:border-red-300",onClick:()=>D?.invoice&&handleDeleteFromView(D.invoice.id),disabled:!D?.invoice,children:[e.jsx(lt,{className:"h-4 w-4"})," Delete"]}),e.jsx(Q,{size:"sm",variant:"ghost",onClick:()=>{J(null),O(null)},children:"✕ Close"})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto bg-slate-100 p-4",children:[e.jsx(Jn,{detail:D}),!D?.invoice&&!K.isPending&&e.jsx("div",{className:"py-16 text-center text-slate-400",children:"Loading invoice..."}),K.isPending&&e.jsxs("div",{className:"py-16 text-center text-slate-400",children:[e.jsx(xn,{className:"h-8 w-8 animate-spin mx-auto mb-3 text-blue-500"}),"Loading invoice details..."]})]})]})})]})}export{Cr as default};
