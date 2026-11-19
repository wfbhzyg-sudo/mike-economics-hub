function Ph(i){let e=i.get("deskPage");return/^(0|[1-9]\d{0,3})$/.test(e)?Number(e):null}function Lh(i,e){let t=new URL(i,"https://desk.invalid");return t.searchParams.set("deskPage",String(e)),t.pathname+t.search+t.hash}var iu=0,ul=1,su=2;var dl=1,ru=2,yn=3,ni=0,Yt=1,bn=2,Hn=0,Gi=1,fl=2,pl=3,ml=4,au=5,_i=100,ou=101,cu=102,lu=103,hu=104,uu=200,du=201,fu=202,pu=203,Sa=204,wa=205,mu=206,xu=207,gu=208,_u=209,vu=210,yu=211,bu=212,Mu=213,Su=214,ja=0,eo=1,to=2,Hi=3,no=4,io=5,so=6,ro=7,xl=0,wu=1,Tu=2,ri=0,Au=1,Eu=2,Cu=3,ao=4,Ru=5,Iu=6,Pu=7;var gl=300,Yi=301,Zi=302,oo=303,co=304,Dr=306,Ta=1e3,kn=1001,As=1002,en=1003,Lu=1004;var Ur=1005;var pn=1006,lo=1007;var Si=1008;var Fn=1009,_l=1010,vl=1011,ks=1012,ho=1013,wi=1014,Wn=1015,Ji=1016,uo=1017,fo=1018,Vs=1020,yl=35902,bl=35899,Ml=1021,Sl=1022,Mn=1023,Es=1026,Gs=1027,wl=1028,po=1029,mo=1030,xo=1031;var go=1033,Nr=33776,Fr=33777,Or=33778,Br=33779,_o=35840,vo=35841,yo=35842,bo=35843,Mo=36196,So=37492,wo=37496,To=37808,Ao=37809,Eo=37810,Co=37811,Ro=37812,Io=37813,Po=37814,Lo=37815,Do=37816,Uo=37817,No=37818,Fo=37819,Oo=37820,Bo=37821,zo=36492,ko=36494,Vo=36495,Go=36283,Ho=36284,Wo=36285,Xo=36286;var lr=2300,Aa=2301,Ma=2302,nl=2400,il=2401,sl=2402;var Du=3200,Uu=3201;var Tl=0,Nu=1,ai="",Vt="srgb",Wi="srgb-linear",hr="linear",nt="srgb";var Vi=7680;var rl=519,Fu=512,Ou=513,Bu=514,Al=515,zu=516,ku=517,Vu=518,Gu=519,al=35044;var El="300 es",Dn=2e3,ur=2001;function Cl(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function dr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Hu(){let i=dr("canvas");return i.style.display="block",i}var Dh={},Cs=null;function Rl(...i){let e="THREE."+i.shift();Cs?Cs("log",e,...i):console.log(e,...i)}function Ue(...i){let e="THREE."+i.shift();Cs?Cs("warn",e,...i):console.warn(e,...i)}function We(...i){let e="THREE."+i.shift();Cs?Cs("error",e,...i):console.error(e,...i)}function Rs(...i){let e=i.join(" ");e in Dh||(Dh[e]=!0,Ue(...i))}function Wu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var ii=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Dt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Uh=1234567,rr=Math.PI/180,Is=180/Math.PI;function Hs(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Dt[i&255]+Dt[i>>8&255]+Dt[i>>16&255]+Dt[i>>24&255]+"-"+Dt[e&255]+Dt[e>>8&255]+"-"+Dt[e>>16&15|64]+Dt[e>>24&255]+"-"+Dt[t&63|128]+Dt[t>>8&255]+"-"+Dt[t>>16&255]+Dt[t>>24&255]+Dt[n&255]+Dt[n>>8&255]+Dt[n>>16&255]+Dt[n>>24&255]).toLowerCase()}function Xe(i,e,t){return Math.max(e,Math.min(t,i))}function Il(i,e){return(i%e+e)%e}function pf(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function mf(i,e,t){return i!==e?(t-i)/(e-i):0}function ar(i,e,t){return(1-t)*i+t*e}function xf(i,e,t,n){return ar(i,e,1-Math.exp(-t*n))}function gf(i,e=1){return e-Math.abs(Il(i,e*2)-e)}function _f(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function vf(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function yf(i,e){return i+Math.floor(Math.random()*(e-i+1))}function bf(i,e){return i+Math.random()*(e-i)}function Mf(i){return i*(.5-Math.random())}function Sf(i){i!==void 0&&(Uh=i);let e=Uh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function wf(i){return i*rr}function Tf(i){return i*Is}function Af(i){return(i&i-1)===0&&i!==0}function Ef(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Cf(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Rf(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),d=a((e-n)/2),p=r((n-e)/2),x=a((n-e)/2);switch(s){case"XYX":i.set(o*h,l*u,l*d,o*c);break;case"YZY":i.set(l*d,o*h,l*u,o*c);break;case"ZXZ":i.set(l*u,l*d,o*h,o*c);break;case"XZX":i.set(o*h,l*x,l*p,o*c);break;case"YXY":i.set(l*p,o*h,l*x,o*c);break;case"ZYZ":i.set(l*x,l*p,o*h,o*c);break;default:Ue("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ws(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function kt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Ti={DEG2RAD:rr,RAD2DEG:Is,generateUUID:Hs,clamp:Xe,euclideanModulo:Il,mapLinear:pf,inverseLerp:mf,lerp:ar,damp:xf,pingpong:gf,smoothstep:_f,smootherstep:vf,randInt:yf,randFloat:bf,randFloatSpread:Mf,seededRandom:Sf,degToRad:wf,radToDeg:Tf,isPowerOfTwo:Af,ceilPowerOfTwo:Ef,floorPowerOfTwo:Cf,setQuaternionFromProperEuler:Rf,normalize:kt,denormalize:ws},we=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},si=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],d=r[a+0],p=r[a+1],x=r[a+2],_=r[a+3];if(o<=0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(o>=1){e[t+0]=d,e[t+1]=p,e[t+2]=x,e[t+3]=_;return}if(u!==_||l!==d||c!==p||h!==x){let m=l*d+c*p+h*x+u*_;m<0&&(d=-d,p=-p,x=-x,_=-_,m=-m);let f=1-o;if(m<.9995){let T=Math.acos(m),M=Math.sin(T);f=Math.sin(f*T)/M,o=Math.sin(o*T)/M,l=l*f+d*o,c=c*f+p*o,h=h*f+x*o,u=u*f+_*o}else{l=l*f+d*o,c=c*f+p*o,h=h*f+x*o,u=u*f+_*o;let T=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=T,c*=T,h*=T,u*=T}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],d=r[a+1],p=r[a+2],x=r[a+3];return e[t]=o*x+h*u+l*p-c*d,e[t+1]=l*x+h*d+c*u-o*p,e[t+2]=c*x+h*p+o*d-l*u,e[t+3]=h*x-o*u-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),d=l(n/2),p=l(s/2),x=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*p*x,this._y=c*p*u-d*h*x,this._z=c*h*x+d*p*u,this._w=c*h*u-d*p*x;break;case"YXZ":this._x=d*h*u+c*p*x,this._y=c*p*u-d*h*x,this._z=c*h*x-d*p*u,this._w=c*h*u+d*p*x;break;case"ZXY":this._x=d*h*u-c*p*x,this._y=c*p*u+d*h*x,this._z=c*h*x+d*p*u,this._w=c*h*u-d*p*x;break;case"ZYX":this._x=d*h*u-c*p*x,this._y=c*p*u+d*h*x,this._z=c*h*x-d*p*u,this._w=c*h*u+d*p*x;break;case"YZX":this._x=d*h*u+c*p*x,this._y=c*p*u+d*h*x,this._z=c*h*x-d*p*u,this._w=c*h*u-d*p*x;break;case"XZY":this._x=d*h*u-c*p*x,this._y=c*p*u-d*h*x,this._z=c*h*x+d*p*u,this._w=c*h*u+d*p*x;break;default:Ue("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>u){let p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>u){let p=2*Math.sqrt(1+o-n-u);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+u-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Nh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Nh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),u=2*(r*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ic.copy(this).projectOnVector(e),this.sub(Ic)}reflect(e){return this.sub(Ic.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ic=new P,Nh=new si,ze=class i{constructor(e,t,n,s,r,a,o,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],x=n[8],_=s[0],m=s[3],f=s[6],T=s[1],M=s[4],A=s[7],C=s[2],S=s[5],R=s[8];return r[0]=a*_+o*T+l*C,r[3]=a*m+o*M+l*S,r[6]=a*f+o*A+l*R,r[1]=c*_+h*T+u*C,r[4]=c*m+h*M+u*S,r[7]=c*f+h*A+u*R,r[2]=d*_+p*T+x*C,r[5]=d*m+p*M+x*S,r[8]=d*f+p*A+x*R,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*r,p=c*r-a*l,x=t*u+n*d+s*p;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/x;return e[0]=u*_,e[1]=(s*c-h*n)*_,e[2]=(o*n-s*a)*_,e[3]=d*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=p*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Pc.makeScale(e,t)),this}rotate(e){return this.premultiply(Pc.makeRotation(-e)),this}translate(e,t){return this.premultiply(Pc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Pc=new ze,Fh=new ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Oh=new ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function If(){let i={enabled:!0,workingColorSpace:Wi,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===nt&&(s.r=ti(s.r),s.g=ti(s.g),s.b=ti(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===nt&&(s.r=Ts(s.r),s.g=Ts(s.g),s.b=Ts(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ai?hr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Rs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Rs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Wi]:{primaries:e,whitePoint:n,transfer:hr,toXYZ:Fh,fromXYZ:Oh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Vt},outputColorSpaceConfig:{drawingBufferColorSpace:Vt}},[Vt]:{primaries:e,whitePoint:n,transfer:nt,toXYZ:Fh,fromXYZ:Oh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Vt}}}),i}var Qe=If();function ti(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ts(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var ds,Ea=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ds===void 0&&(ds=dr("canvas")),ds.width=e.width,ds.height=e.height;let s=ds.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=ds}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=dr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=ti(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ti(t[n]/255)*255):t[n]=ti(t[n]);return{data:t,width:e.width,height:e.height}}else return Ue("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Pf=0,Ps=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Pf++}),this.uuid=Hs(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Lc(s[a].image)):r.push(Lc(s[a]))}else r=Lc(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Lc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ea.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Ue("Texture: Unable to serialize Texture."),{})}var Lf=0,Dc=new P,Wt=class i extends ii{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=kn,s=kn,r=pn,a=Si,o=Mn,l=Fn,c=i.DEFAULT_ANISOTROPY,h=ai){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Lf++}),this.uuid=Hs(),this.name="",this.source=new Ps(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new we(0,0),this.repeat=new we(1,1),this.center=new we(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Dc).x}get height(){return this.source.getSize(Dc).y}get depth(){return this.source.getSize(Dc).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Ue(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Ue(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==gl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ta:e.x=e.x-Math.floor(e.x);break;case kn:e.x=e.x<0?0:1;break;case As:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ta:e.y=e.y-Math.floor(e.y);break;case kn:e.y=e.y<0?0:1;break;case As:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Wt.DEFAULT_IMAGE=null;Wt.DEFAULT_MAPPING=gl;Wt.DEFAULT_ANISOTROPY=1;var tt=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],x=l[9],_=l[2],m=l[6],f=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(x-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(x+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let M=(c+1)/2,A=(p+1)/2,C=(f+1)/2,S=(h+d)/4,R=(u+_)/4,N=(x+m)/4;return M>A&&M>C?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=S/n,r=R/n):A>C?A<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(A),n=S/s,r=N/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=R/r,s=N/r),this.set(n,s,r,t),this}let T=Math.sqrt((m-x)*(m-x)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(T)<.001&&(T=1),this.x=(m-x)/T,this.y=(u-_)/T,this.z=(d-h)/T,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this.w=Xe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this.w=Xe(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ca=class extends ii{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:pn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);let s={width:e,height:t,depth:n.depth},r=new Wt(s);this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:pn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ps(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Vn=class extends Ca{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},fr=class extends Wt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=en,this.minFilter=en,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ra=class extends Wt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=en,this.minFilter=en,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var vi=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(In.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(In.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=In.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,In):In.fromBufferAttribute(r,a),In.applyMatrix4(e.matrixWorld),this.expandByPoint(In);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ia.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ia.copy(n.boundingBox)),ia.applyMatrix4(e.matrixWorld),this.union(ia)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,In),In.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(er),sa.subVectors(this.max,er),fs.subVectors(e.a,er),ps.subVectors(e.b,er),ms.subVectors(e.c,er),ui.subVectors(ps,fs),di.subVectors(ms,ps),Oi.subVectors(fs,ms);let t=[0,-ui.z,ui.y,0,-di.z,di.y,0,-Oi.z,Oi.y,ui.z,0,-ui.x,di.z,0,-di.x,Oi.z,0,-Oi.x,-ui.y,ui.x,0,-di.y,di.x,0,-Oi.y,Oi.x,0];return!Uc(t,fs,ps,ms,sa)||(t=[1,0,0,0,1,0,0,0,1],!Uc(t,fs,ps,ms,sa))?!1:(ra.crossVectors(ui,di),t=[ra.x,ra.y,ra.z],Uc(t,fs,ps,ms,sa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,In).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(In).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:($n[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),$n[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),$n[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),$n[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),$n[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),$n[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),$n[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),$n[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints($n),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},$n=[new P,new P,new P,new P,new P,new P,new P,new P],In=new P,ia=new vi,fs=new P,ps=new P,ms=new P,ui=new P,di=new P,Oi=new P,er=new P,sa=new P,ra=new P,Bi=new P;function Uc(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Bi.fromArray(i,r);let o=s.x*Math.abs(Bi.x)+s.y*Math.abs(Bi.y)+s.z*Math.abs(Bi.z),l=e.dot(Bi),c=t.dot(Bi),h=n.dot(Bi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Df=new vi,tr=new P,Nc=new P,Ls=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Df.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;tr.subVectors(e,this.center);let t=tr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(tr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Nc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(tr.copy(e.center).add(Nc)),this.expandByPoint(tr.copy(e.center).sub(Nc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Kn=new P,Fc=new P,aa=new P,fi=new P,Oc=new P,oa=new P,Bc=new P,pr=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Kn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Kn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Kn.copy(this.origin).addScaledVector(this.direction,t),Kn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Fc.copy(e).add(t).multiplyScalar(.5),aa.copy(t).sub(e).normalize(),fi.copy(this.origin).sub(Fc);let r=e.distanceTo(t)*.5,a=-this.direction.dot(aa),o=fi.dot(this.direction),l=-fi.dot(aa),c=fi.lengthSq(),h=Math.abs(1-a*a),u,d,p,x;if(h>0)if(u=a*l-o,d=a*o-l,x=r*h,u>=0)if(d>=-x)if(d<=x){let _=1/h;u*=_,d*=_,p=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d<=-x?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c):d<=x?(u=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Fc).addScaledVector(aa,d),p}intersectSphere(e,t){Kn.subVectors(e.center,this.origin);let n=Kn.dot(this.direction),s=Kn.dot(Kn)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Kn)!==null}intersectTriangle(e,t,n,s,r){Oc.subVectors(t,e),oa.subVectors(n,e),Bc.crossVectors(Oc,oa);let a=this.direction.dot(Bc),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;fi.subVectors(this.origin,e);let l=o*this.direction.dot(oa.crossVectors(fi,oa));if(l<0)return null;let c=o*this.direction.dot(Oc.cross(fi));if(c<0||l+c>a)return null;let h=-o*fi.dot(Bc);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ft=class i{constructor(e,t,n,s,r,a,o,l,c,h,u,d,p,x,_,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,u,d,p,x,_,m)}set(e,t,n,s,r,a,o,l,c,h,u,d,p,x,_,m){let f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=s,f[1]=r,f[5]=a,f[9]=o,f[13]=l,f[2]=c,f[6]=h,f[10]=u,f[14]=d,f[3]=p,f[7]=x,f[11]=_,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/xs.setFromMatrixColumn(e,0).length(),r=1/xs.setFromMatrixColumn(e,1).length(),a=1/xs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=a*h,p=a*u,x=o*h,_=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+x*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=x+p*c,t[10]=a*l}else if(e.order==="YXZ"){let d=l*h,p=l*u,x=c*h,_=c*u;t[0]=d+_*o,t[4]=x*o-p,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=p*o-x,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){let d=l*h,p=l*u,x=c*h,_=c*u;t[0]=d-_*o,t[4]=-a*u,t[8]=x+p*o,t[1]=p+x*o,t[5]=a*h,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let d=a*h,p=a*u,x=o*h,_=o*u;t[0]=l*h,t[4]=x*c-p,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=p*c-x,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let d=a*l,p=a*c,x=o*l,_=o*c;t[0]=l*h,t[4]=_-d*u,t[8]=x*u+p,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*u+x,t[10]=d-_*u}else if(e.order==="XZY"){let d=a*l,p=a*c,x=o*l,_=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=a*h,t[9]=p*u-x,t[2]=x*u-p,t[6]=o*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Uf,e,Nf)}lookAt(e,t,n){let s=this.elements;return un.subVectors(e,t),un.lengthSq()===0&&(un.z=1),un.normalize(),pi.crossVectors(n,un),pi.lengthSq()===0&&(Math.abs(n.z)===1?un.x+=1e-4:un.z+=1e-4,un.normalize(),pi.crossVectors(n,un)),pi.normalize(),ca.crossVectors(un,pi),s[0]=pi.x,s[4]=ca.x,s[8]=un.x,s[1]=pi.y,s[5]=ca.y,s[9]=un.y,s[2]=pi.z,s[6]=ca.z,s[10]=un.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],x=n[2],_=n[6],m=n[10],f=n[14],T=n[3],M=n[7],A=n[11],C=n[15],S=s[0],R=s[4],N=s[8],b=s[12],y=s[1],L=s[5],O=s[9],B=s[13],V=s[2],W=s[6],X=s[10],te=s[14],H=s[3],ne=s[7],ae=s[11],be=s[15];return r[0]=a*S+o*y+l*V+c*H,r[4]=a*R+o*L+l*W+c*ne,r[8]=a*N+o*O+l*X+c*ae,r[12]=a*b+o*B+l*te+c*be,r[1]=h*S+u*y+d*V+p*H,r[5]=h*R+u*L+d*W+p*ne,r[9]=h*N+u*O+d*X+p*ae,r[13]=h*b+u*B+d*te+p*be,r[2]=x*S+_*y+m*V+f*H,r[6]=x*R+_*L+m*W+f*ne,r[10]=x*N+_*O+m*X+f*ae,r[14]=x*b+_*B+m*te+f*be,r[3]=T*S+M*y+A*V+C*H,r[7]=T*R+M*L+A*W+C*ne,r[11]=T*N+M*O+A*X+C*ae,r[15]=T*b+M*B+A*te+C*be,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],p=e[14],x=e[3],_=e[7],m=e[11],f=e[15];return x*(+r*l*u-s*c*u-r*o*d+n*c*d+s*o*p-n*l*p)+_*(+t*l*p-t*c*d+r*a*d-s*a*p+s*c*h-r*l*h)+m*(+t*c*u-t*o*p-r*a*u+n*a*p+r*o*h-n*c*h)+f*(-s*o*h-t*l*u+t*o*d+s*a*u-n*a*d+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],p=e[11],x=e[12],_=e[13],m=e[14],f=e[15],T=u*m*c-_*d*c+_*l*p-o*m*p-u*l*f+o*d*f,M=x*d*c-h*m*c-x*l*p+a*m*p+h*l*f-a*d*f,A=h*_*c-x*u*c+x*o*p-a*_*p-h*o*f+a*u*f,C=x*u*l-h*_*l-x*o*d+a*_*d+h*o*m-a*u*m,S=t*T+n*M+s*A+r*C;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let R=1/S;return e[0]=T*R,e[1]=(_*d*r-u*m*r-_*s*p+n*m*p+u*s*f-n*d*f)*R,e[2]=(o*m*r-_*l*r+_*s*c-n*m*c-o*s*f+n*l*f)*R,e[3]=(u*l*r-o*d*r-u*s*c+n*d*c+o*s*p-n*l*p)*R,e[4]=M*R,e[5]=(h*m*r-x*d*r+x*s*p-t*m*p-h*s*f+t*d*f)*R,e[6]=(x*l*r-a*m*r-x*s*c+t*m*c+a*s*f-t*l*f)*R,e[7]=(a*d*r-h*l*r+h*s*c-t*d*c-a*s*p+t*l*p)*R,e[8]=A*R,e[9]=(x*u*r-h*_*r-x*n*p+t*_*p+h*n*f-t*u*f)*R,e[10]=(a*_*r-x*o*r+x*n*c-t*_*c-a*n*f+t*o*f)*R,e[11]=(h*o*r-a*u*r-h*n*c+t*u*c+a*n*p-t*o*p)*R,e[12]=C*R,e[13]=(h*_*s-x*u*s+x*n*d-t*_*d-h*n*m+t*u*m)*R,e[14]=(x*o*s-a*_*s-x*n*l+t*_*l+a*n*m-t*o*m)*R,e[15]=(a*u*s-h*o*s+h*n*l-t*u*l-a*n*d+t*o*d)*R,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,d=r*c,p=r*h,x=r*u,_=a*h,m=a*u,f=o*u,T=l*c,M=l*h,A=l*u,C=n.x,S=n.y,R=n.z;return s[0]=(1-(_+f))*C,s[1]=(p+A)*C,s[2]=(x-M)*C,s[3]=0,s[4]=(p-A)*S,s[5]=(1-(d+f))*S,s[6]=(m+T)*S,s[7]=0,s[8]=(x+M)*R,s[9]=(m-T)*R,s[10]=(1-(d+_))*R,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=xs.set(s[0],s[1],s[2]).length(),a=xs.set(s[4],s[5],s[6]).length(),o=xs.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Pn.copy(this);let c=1/r,h=1/a,u=1/o;return Pn.elements[0]*=c,Pn.elements[1]*=c,Pn.elements[2]*=c,Pn.elements[4]*=h,Pn.elements[5]*=h,Pn.elements[6]*=h,Pn.elements[8]*=u,Pn.elements[9]*=u,Pn.elements[10]*=u,t.setFromRotationMatrix(Pn),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=Dn,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(n-s),d=(t+e)/(t-e),p=(n+s)/(n-s),x,_;if(l)x=r/(a-r),_=a*r/(a-r);else if(o===Dn)x=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===ur)x=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=x,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Dn,l=!1){let c=this.elements,h=2/(t-e),u=2/(n-s),d=-(t+e)/(t-e),p=-(n+s)/(n-s),x,_;if(l)x=1/(a-r),_=a/(a-r);else if(o===Dn)x=-2/(a-r),_=-(a+r)/(a-r);else if(o===ur)x=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=x,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},xs=new P,Pn=new ft,Uf=new P(0,0,0),Nf=new P(1,1,1),pi=new P,ca=new P,un=new P,Bh=new ft,zh=new si,Un=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(Xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Xe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Xe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Xe(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Xe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Xe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:Ue("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Bh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Bh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return zh.setFromEuler(this),this.setFromQuaternion(zh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Un.DEFAULT_ORDER="XYZ";var Ds=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Ff=0,kh=new P,gs=new si,Qn=new ft,la=new P,nr=new P,Of=new P,Bf=new si,Vh=new P(1,0,0),Gh=new P(0,1,0),Hh=new P(0,0,1),Wh={type:"added"},zf={type:"removed"},_s={type:"childadded",child:null},zc={type:"childremoved",child:null},Nt=class i extends ii{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ff++}),this.uuid=Hs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new P,t=new Un,n=new si,s=new P(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ft},normalMatrix:{value:new ze}}),this.matrix=new ft,this.matrixWorld=new ft,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ds,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return gs.setFromAxisAngle(e,t),this.quaternion.multiply(gs),this}rotateOnWorldAxis(e,t){return gs.setFromAxisAngle(e,t),this.quaternion.premultiply(gs),this}rotateX(e){return this.rotateOnAxis(Vh,e)}rotateY(e){return this.rotateOnAxis(Gh,e)}rotateZ(e){return this.rotateOnAxis(Hh,e)}translateOnAxis(e,t){return kh.copy(e).applyQuaternion(this.quaternion),this.position.add(kh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Vh,e)}translateY(e){return this.translateOnAxis(Gh,e)}translateZ(e){return this.translateOnAxis(Hh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Qn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?la.copy(e):la.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),nr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Qn.lookAt(nr,la,this.up):Qn.lookAt(la,nr,this.up),this.quaternion.setFromRotationMatrix(Qn),s&&(Qn.extractRotation(s.matrixWorld),gs.setFromRotationMatrix(Qn),this.quaternion.premultiply(gs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(We("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Wh),_s.child=e,this.dispatchEvent(_s),_s.child=null):We("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(zf),zc.child=e,this.dispatchEvent(zc),zc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Qn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Qn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Qn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Wh),_s.child=e,this.dispatchEvent(_s),_s.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(nr,e,Of),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(nr,Bf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),p=a(e.animations),x=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),x.length>0&&(n.nodes=x)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};Nt.DEFAULT_UP=new P(0,1,0);Nt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Nt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ln=new P,jn=new P,kc=new P,ei=new P,vs=new P,ys=new P,Xh=new P,Vc=new P,Gc=new P,Hc=new P,Wc=new tt,Xc=new tt,qc=new tt,gi=class i{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Ln.subVectors(e,t),s.cross(Ln);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Ln.subVectors(s,t),jn.subVectors(n,t),kc.subVectors(e,t);let a=Ln.dot(Ln),o=Ln.dot(jn),l=Ln.dot(kc),c=jn.dot(jn),h=jn.dot(kc),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,p=(c*l-o*h)*d,x=(a*h-o*l)*d;return r.set(1-p-x,x,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,ei)===null?!1:ei.x>=0&&ei.y>=0&&ei.x+ei.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,ei)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ei.x),l.addScaledVector(a,ei.y),l.addScaledVector(o,ei.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Wc.setScalar(0),Xc.setScalar(0),qc.setScalar(0),Wc.fromBufferAttribute(e,t),Xc.fromBufferAttribute(e,n),qc.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Wc,r.x),a.addScaledVector(Xc,r.y),a.addScaledVector(qc,r.z),a}static isFrontFacing(e,t,n,s){return Ln.subVectors(n,t),jn.subVectors(e,t),Ln.cross(jn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ln.subVectors(this.c,this.b),jn.subVectors(this.a,this.b),Ln.cross(jn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;vs.subVectors(s,n),ys.subVectors(r,n),Vc.subVectors(e,n);let l=vs.dot(Vc),c=ys.dot(Vc);if(l<=0&&c<=0)return t.copy(n);Gc.subVectors(e,s);let h=vs.dot(Gc),u=ys.dot(Gc);if(h>=0&&u<=h)return t.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(vs,a);Hc.subVectors(e,r);let p=vs.dot(Hc),x=ys.dot(Hc);if(x>=0&&p<=x)return t.copy(r);let _=p*c-l*x;if(_<=0&&c>=0&&x<=0)return o=c/(c-x),t.copy(n).addScaledVector(ys,o);let m=h*x-p*u;if(m<=0&&u-h>=0&&p-x>=0)return Xh.subVectors(r,s),o=(u-h)/(u-h+(p-x)),t.copy(s).addScaledVector(Xh,o);let f=1/(m+_+d);return a=_*f,o=d*f,t.copy(n).addScaledVector(vs,a).addScaledVector(ys,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Xu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},mi={h:0,s:0,l:0},ha={h:0,s:0,l:0};function Yc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var qe=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Vt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Qe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Qe.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Qe.workingColorSpace){if(e=Il(e,1),t=Xe(t,0,1),n=Xe(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Yc(a,r,e+1/3),this.g=Yc(a,r,e),this.b=Yc(a,r,e-1/3)}return Qe.colorSpaceToWorking(this,s),this}setStyle(e,t=Vt){function n(r){r!==void 0&&parseFloat(r)<1&&Ue("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ue("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Ue("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Vt){let n=Xu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Ue("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ti(e.r),this.g=ti(e.g),this.b=ti(e.b),this}copyLinearToSRGB(e){return this.r=Ts(e.r),this.g=Ts(e.g),this.b=Ts(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Vt){return Qe.workingToColorSpace(Ut.copy(this),e),Math.round(Xe(Ut.r*255,0,255))*65536+Math.round(Xe(Ut.g*255,0,255))*256+Math.round(Xe(Ut.b*255,0,255))}getHexString(e=Vt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Qe.workingColorSpace){Qe.workingToColorSpace(Ut.copy(this),t);let n=Ut.r,s=Ut.g,r=Ut.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Qe.workingColorSpace){return Qe.workingToColorSpace(Ut.copy(this),t),e.r=Ut.r,e.g=Ut.g,e.b=Ut.b,e}getStyle(e=Vt){Qe.workingToColorSpace(Ut.copy(this),e);let t=Ut.r,n=Ut.g,s=Ut.b;return e!==Vt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(mi),this.setHSL(mi.h+e,mi.s+t,mi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(mi),e.getHSL(ha);let n=ar(mi.h,ha.h,t),s=ar(mi.s,ha.s,t),r=ar(mi.l,ha.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ut=new qe;qe.NAMES=Xu;var kf=0,yi=class extends ii{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:kf++}),this.uuid=Hs(),this.name="",this.type="Material",this.blending=Gi,this.side=ni,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Sa,this.blendDst=wa,this.blendEquation=_i,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new qe(0,0,0),this.blendAlpha=0,this.depthFunc=Hi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=rl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Vi,this.stencilZFail=Vi,this.stencilZPass=Vi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Ue(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Ue(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Gi&&(n.blending=this.blending),this.side!==ni&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Sa&&(n.blendSrc=this.blendSrc),this.blendDst!==wa&&(n.blendDst=this.blendDst),this.blendEquation!==_i&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Hi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==rl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Vi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Vi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Vi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Nn=class extends yi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new qe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Un,this.combine=xl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var At=new P,ua=new we,Vf=0,Ht=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Vf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=al,this.updateRanges=[],this.gpuType=Wn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ua.fromBufferAttribute(this,t),ua.applyMatrix3(e),this.setXY(t,ua.x,ua.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.applyMatrix3(e),this.setXYZ(t,At.x,At.y,At.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.applyMatrix4(e),this.setXYZ(t,At.x,At.y,At.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.applyNormalMatrix(e),this.setXYZ(t,At.x,At.y,At.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.transformDirection(e),this.setXYZ(t,At.x,At.y,At.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ws(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=kt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ws(t,this.array)),t}setX(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ws(t,this.array)),t}setY(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ws(t,this.array)),t}setZ(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ws(t,this.array)),t}setW(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array),s=kt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array),s=kt(s,this.array),r=kt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==al&&(e.usage=this.usage),e}};var mr=class extends Ht{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var xr=class extends Ht{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var St=class extends Ht{constructor(e,t,n){super(new Float32Array(e),t,n)}},Gf=0,gn=new ft,Zc=new Nt,bs=new P,dn=new vi,ir=new vi,Rt=new P,Xt=class i extends ii{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Gf++}),this.uuid=Hs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Cl(e)?xr:mr)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ze().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return gn.makeRotationFromQuaternion(e),this.applyMatrix4(gn),this}rotateX(e){return gn.makeRotationX(e),this.applyMatrix4(gn),this}rotateY(e){return gn.makeRotationY(e),this.applyMatrix4(gn),this}rotateZ(e){return gn.makeRotationZ(e),this.applyMatrix4(gn),this}translate(e,t,n){return gn.makeTranslation(e,t,n),this.applyMatrix4(gn),this}scale(e,t,n){return gn.makeScale(e,t,n),this.applyMatrix4(gn),this}lookAt(e){return Zc.lookAt(e),Zc.updateMatrix(),this.applyMatrix4(Zc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(bs).negate(),this.translate(bs.x,bs.y,bs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new St(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ue("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new vi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];dn.setFromBufferAttribute(r),this.morphTargetsRelative?(Rt.addVectors(this.boundingBox.min,dn.min),this.boundingBox.expandByPoint(Rt),Rt.addVectors(this.boundingBox.max,dn.max),this.boundingBox.expandByPoint(Rt)):(this.boundingBox.expandByPoint(dn.min),this.boundingBox.expandByPoint(dn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&We('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ls);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){let n=this.boundingSphere.center;if(dn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];ir.setFromBufferAttribute(o),this.morphTargetsRelative?(Rt.addVectors(dn.min,ir.min),dn.expandByPoint(Rt),Rt.addVectors(dn.max,ir.max),dn.expandByPoint(Rt)):(dn.expandByPoint(ir.min),dn.expandByPoint(ir.max))}dn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Rt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Rt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Rt.fromBufferAttribute(o,c),l&&(bs.fromBufferAttribute(e,c),Rt.add(bs)),s=Math.max(s,n.distanceToSquared(Rt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&We('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){We("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ht(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let N=0;N<n.count;N++)o[N]=new P,l[N]=new P;let c=new P,h=new P,u=new P,d=new we,p=new we,x=new we,_=new P,m=new P;function f(N,b,y){c.fromBufferAttribute(n,N),h.fromBufferAttribute(n,b),u.fromBufferAttribute(n,y),d.fromBufferAttribute(r,N),p.fromBufferAttribute(r,b),x.fromBufferAttribute(r,y),h.sub(c),u.sub(c),p.sub(d),x.sub(d);let L=1/(p.x*x.y-x.x*p.y);isFinite(L)&&(_.copy(h).multiplyScalar(x.y).addScaledVector(u,-p.y).multiplyScalar(L),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-x.x).multiplyScalar(L),o[N].add(_),o[b].add(_),o[y].add(_),l[N].add(m),l[b].add(m),l[y].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let N=0,b=T.length;N<b;++N){let y=T[N],L=y.start,O=y.count;for(let B=L,V=L+O;B<V;B+=3)f(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let M=new P,A=new P,C=new P,S=new P;function R(N){C.fromBufferAttribute(s,N),S.copy(C);let b=o[N];M.copy(b),M.sub(C.multiplyScalar(C.dot(b))).normalize(),A.crossVectors(S,b);let L=A.dot(l[N])<0?-1:1;a.setXYZW(N,M.x,M.y,M.z,L)}for(let N=0,b=T.length;N<b;++N){let y=T[N],L=y.start,O=y.count;for(let B=L,V=L+O;B<V;B+=3)R(e.getX(B+0)),R(e.getX(B+1)),R(e.getX(B+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ht(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);let s=new P,r=new P,a=new P,o=new P,l=new P,c=new P,h=new P,u=new P;if(e)for(let d=0,p=e.count;d<p;d+=3){let x=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,x),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,x),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(x,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Rt.fromBufferAttribute(e,t),Rt.normalize(),e.setXYZ(t,Rt.x,Rt.y,Rt.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h),p=0,x=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?p=l[_]*o.data.stride+o.offset:p=l[_]*h;for(let f=0;f<h;f++)d[x++]=c[p++]}return new Ht(d,h,u)}if(this.index===null)return Ue("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){let d=c[h],p=e(d,n);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},qh=new ft,zi=new pr,da=new Ls,Yh=new P,fa=new P,pa=new P,ma=new P,Jc=new P,xa=new P,Zh=new P,ga=new P,qt=class extends Nt{constructor(e=new Xt,t=new Nn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){xa.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],u=r[l];h!==0&&(Jc.fromBufferAttribute(u,e),a?xa.addScaledVector(Jc,h):xa.addScaledVector(Jc.sub(t),h))}t.add(xa)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),da.copy(n.boundingSphere),da.applyMatrix4(r),zi.copy(e.ray).recast(e.near),!(da.containsPoint(zi.origin)===!1&&(zi.intersectSphere(da,Yh)===null||zi.origin.distanceToSquared(Yh)>(e.far-e.near)**2))&&(qh.copy(r).invert(),zi.copy(e.ray).applyMatrix4(qh),!(n.boundingBox!==null&&zi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,zi)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let x=0,_=d.length;x<_;x++){let m=d[x],f=a[m.materialIndex],T=Math.max(m.start,p.start),M=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let A=T,C=M;A<C;A+=3){let S=o.getX(A),R=o.getX(A+1),N=o.getX(A+2);s=_a(this,f,e,n,c,h,u,S,R,N),s&&(s.faceIndex=Math.floor(A/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let x=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let m=x,f=_;m<f;m+=3){let T=o.getX(m),M=o.getX(m+1),A=o.getX(m+2);s=_a(this,a,e,n,c,h,u,T,M,A),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let x=0,_=d.length;x<_;x++){let m=d[x],f=a[m.materialIndex],T=Math.max(m.start,p.start),M=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let A=T,C=M;A<C;A+=3){let S=A,R=A+1,N=A+2;s=_a(this,f,e,n,c,h,u,S,R,N),s&&(s.faceIndex=Math.floor(A/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let x=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=x,f=_;m<f;m+=3){let T=m,M=m+1,A=m+2;s=_a(this,a,e,n,c,h,u,T,M,A),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Hf(i,e,t,n,s,r,a,o){let l;if(e.side===Yt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===ni,o),l===null)return null;ga.copy(o),ga.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(ga);return c<t.near||c>t.far?null:{distance:c,point:ga.clone(),object:i}}function _a(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,fa),i.getVertexPosition(l,pa),i.getVertexPosition(c,ma);let h=Hf(i,e,t,n,fa,pa,ma,Zh);if(h){let u=new P;gi.getBarycoord(Zh,fa,pa,ma,u),s&&(h.uv=gi.getInterpolatedAttribute(s,o,l,c,u,new we)),r&&(h.uv1=gi.getInterpolatedAttribute(r,o,l,c,u,new we)),a&&(h.normal=gi.getInterpolatedAttribute(a,o,l,c,u,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new P,materialIndex:0};gi.getNormal(fa,pa,ma,d.normal),h.face=d,h.barycoord=u}return h}var Gn=class i extends Xt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],u=[],d=0,p=0;x("z","y","x",-1,-1,n,t,e,a,r,0),x("z","y","x",1,-1,n,t,-e,a,r,1),x("x","z","y",1,1,e,n,t,s,a,2),x("x","z","y",1,-1,e,n,-t,s,a,3),x("x","y","z",1,-1,e,t,n,s,r,4),x("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new St(c,3)),this.setAttribute("normal",new St(h,3)),this.setAttribute("uv",new St(u,2));function x(_,m,f,T,M,A,C,S,R,N,b){let y=A/R,L=C/N,O=A/2,B=C/2,V=S/2,W=R+1,X=N+1,te=0,H=0,ne=new P;for(let ae=0;ae<X;ae++){let be=ae*L-B;for(let _e=0;_e<W;_e++){let Ve=_e*y-O;ne[_]=Ve*T,ne[m]=be*M,ne[f]=V,c.push(ne.x,ne.y,ne.z),ne[_]=0,ne[m]=0,ne[f]=S>0?1:-1,h.push(ne.x,ne.y,ne.z),u.push(_e/R),u.push(1-ae/N),te+=1}}for(let ae=0;ae<N;ae++)for(let be=0;be<R;be++){let _e=d+be+W*ae,Ve=d+be+W*(ae+1),Ke=d+(be+1)+W*(ae+1),it=d+(be+1)+W*ae;l.push(_e,Ve,it),l.push(Ve,Ke,it),H+=6}o.addGroup(p,H,b),p+=H,d+=te}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function $i(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(Ue("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Ft(i){let e={};for(let t=0;t<i.length;t++){let n=$i(i[t]);for(let s in n)e[s]=n[s]}return e}function Wf(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Pl(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}var qu={clone:$i,merge:Ft},Xf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,qf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,_n=class extends yi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Xf,this.fragmentShader=qf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=$i(e.uniforms),this.uniformsGroups=Wf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},gr=class extends Nt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ft,this.projectionMatrix=new ft,this.projectionMatrixInverse=new ft,this.coordinateSystem=Dn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},xi=new P,Jh=new we,$h=new we,Gt=class extends gr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Is*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(rr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Is*2*Math.atan(Math.tan(rr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){xi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(xi.x,xi.y).multiplyScalar(-e/xi.z),xi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(xi.x,xi.y).multiplyScalar(-e/xi.z)}getViewSize(e,t){return this.getViewBounds(e,Jh,$h),t.subVectors($h,Jh)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(rr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ms=-90,Ss=1,Ia=class extends Nt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Gt(Ms,Ss,e,t);s.layers=this.layers,this.add(s);let r=new Gt(Ms,Ss,e,t);r.layers=this.layers,this.add(r);let a=new Gt(Ms,Ss,e,t);a.layers=this.layers,this.add(a);let o=new Gt(Ms,Ss,e,t);o.layers=this.layers,this.add(o);let l=new Gt(Ms,Ss,e,t);l.layers=this.layers,this.add(l);let c=new Gt(Ms,Ss,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===Dn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ur)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,d,p),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},_r=class extends Wt{constructor(e=[],t=Yi,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Pa=class extends Vn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new _r(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Gn(5,5,5),r=new _n({name:"CubemapFromEquirect",uniforms:$i(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Yt,blending:Hn});r.uniforms.tEquirect.value=t;let a=new qt(s,r),o=t.minFilter;return t.minFilter===Si&&(t.minFilter=pn),new Ia(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}},fn=class extends Nt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Yf={type:"move"},Us=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new fn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new fn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new fn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),f=this._getHandJoint(c,_);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,x=.005;c.inputState.pinching&&d>p+x?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-x&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Yf)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new fn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}};var vr=class extends Nt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Un,this.environmentIntensity=1,this.environmentRotation=new Un,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var La=class extends Wt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=en,h=en,u,d){super(null,a,o,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var $c=new P,Zf=new P,Jf=new ze,zn=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=$c.subVectors(n,t).cross(Zf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta($c),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Jf.getNormalMatrix(e),s=this.coplanarPoint($c).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},ki=new Ls,$f=new we(.5,.5),va=new P,Ns=class{constructor(e=new zn,t=new zn,n=new zn,s=new zn,r=new zn,a=new zn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Dn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],p=r[7],x=r[8],_=r[9],m=r[10],f=r[11],T=r[12],M=r[13],A=r[14],C=r[15];if(s[0].setComponents(c-a,p-h,f-x,C-T).normalize(),s[1].setComponents(c+a,p+h,f+x,C+T).normalize(),s[2].setComponents(c+o,p+u,f+_,C+M).normalize(),s[3].setComponents(c-o,p-u,f-_,C-M).normalize(),n)s[4].setComponents(l,d,m,A).normalize(),s[5].setComponents(c-l,p-d,f-m,C-A).normalize();else if(s[4].setComponents(c-l,p-d,f-m,C-A).normalize(),t===Dn)s[5].setComponents(c+l,p+d,f+m,C+A).normalize();else if(t===ur)s[5].setComponents(l,d,m,A).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ki.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ki.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ki)}intersectsSprite(e){ki.center.set(0,0,0);let t=$f.distanceTo(e.center);return ki.radius=.7071067811865476+t,ki.applyMatrix4(e.matrixWorld),this.intersectsSphere(ki)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(va.x=s.normal.x>0?e.max.x:e.min.x,va.y=s.normal.y>0?e.max.y:e.min.y,va.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(va)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Fs=class extends Wt{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},yr=class extends Wt{constructor(e,t,n=wi,s,r,a,o=en,l=en,c,h=Es,u=1){if(h!==Es&&h!==Gs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ps(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},br=class extends Wt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var Os=class i extends Xt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],p=[],x=0,_=[],m=n/2,f=0;T(),a===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new St(u,3)),this.setAttribute("normal",new St(d,3)),this.setAttribute("uv",new St(p,2));function T(){let A=new P,C=new P,S=0,R=(t-e)/n;for(let N=0;N<=r;N++){let b=[],y=N/r,L=y*(t-e)+e;for(let O=0;O<=s;O++){let B=O/s,V=B*l+o,W=Math.sin(V),X=Math.cos(V);C.x=L*W,C.y=-y*n+m,C.z=L*X,u.push(C.x,C.y,C.z),A.set(W,R,X).normalize(),d.push(A.x,A.y,A.z),p.push(B,1-y),b.push(x++)}_.push(b)}for(let N=0;N<s;N++)for(let b=0;b<r;b++){let y=_[b][N],L=_[b+1][N],O=_[b+1][N+1],B=_[b][N+1];(e>0||b!==0)&&(h.push(y,L,B),S+=3),(t>0||b!==r-1)&&(h.push(L,O,B),S+=3)}c.addGroup(f,S,0),f+=S}function M(A){let C=x,S=new we,R=new P,N=0,b=A===!0?e:t,y=A===!0?1:-1;for(let O=1;O<=s;O++)u.push(0,m*y,0),d.push(0,y,0),p.push(.5,.5),x++;let L=x;for(let O=0;O<=s;O++){let V=O/s*l+o,W=Math.cos(V),X=Math.sin(V);R.x=b*X,R.y=m*y,R.z=b*W,u.push(R.x,R.y,R.z),d.push(0,y,0),S.x=W*.5+.5,S.y=X*.5*y+.5,p.push(S.x,S.y),x++}for(let O=0;O<s;O++){let B=C+O,V=L+O;A===!0?h.push(V,V+1,B):h.push(V+1,V,B),N+=3}c.addGroup(f,N,A===!0?1:2),f+=N}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var vn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ue("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let h=n[s],d=n[s+1]-h,p=(a-h)/d;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new we:new P);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new P,s=[],r=[],a=[],o=new P,l=new ft;for(let p=0;p<=e;p++){let x=p/e;s[p]=this.getTangentAt(x,new P)}r[0]=new P,a[0]=new P;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(s[p-1],s[p]),o.length()>Number.EPSILON){o.normalize();let x=Math.acos(Xe(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(o,x))}a[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(Xe(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(p=-p);for(let x=1;x<=e;x++)r[x].applyMatrix4(l.makeRotationAxis(s[x],p*x)),a[x].crossVectors(s[x],r[x])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Mr=class extends vn{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new we){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*h-p*u+this.aX,c=d*u+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Da=class extends Mr{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Ll(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,p*=h,s(a,o,d,p)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var ya=new P,Kc=new Ll,Qc=new Ll,jc=new Ll,Bs=class extends vn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new P){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(ya.subVectors(s[0],s[1]).add(s[0]),c=ya);let u=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(ya.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=ya),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,x=Math.pow(c.distanceToSquared(u),p),_=Math.pow(u.distanceToSquared(d),p),m=Math.pow(d.distanceToSquared(h),p);_<1e-4&&(_=1),x<1e-4&&(x=_),m<1e-4&&(m=_),Kc.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,x,_,m),Qc.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,x,_,m),jc.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,x,_,m)}else this.curveType==="catmullrom"&&(Kc.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Qc.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),jc.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(Kc.calc(l),Qc.calc(l),jc.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new P().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Kh(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function Kf(i,e){let t=1-i;return t*t*e}function Qf(i,e){return 2*(1-i)*i*e}function jf(i,e){return i*i*e}function or(i,e,t,n){return Kf(i,e)+Qf(i,t)+jf(i,n)}function ep(i,e){let t=1-i;return t*t*t*e}function tp(i,e){let t=1-i;return 3*t*t*i*e}function np(i,e){return 3*(1-i)*i*i*e}function ip(i,e){return i*i*i*e}function cr(i,e,t,n,s){return ep(i,e)+tp(i,t)+np(i,n)+ip(i,s)}var Ua=class extends vn{constructor(e=new we,t=new we,n=new we,s=new we){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new we){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(cr(e,s.x,r.x,a.x,o.x),cr(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Na=class extends vn{constructor(e=new P,t=new P,n=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new P){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(cr(e,s.x,r.x,a.x,o.x),cr(e,s.y,r.y,a.y,o.y),cr(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Fa=class extends vn{constructor(e=new we,t=new we){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new we){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new we){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Oa=class extends vn{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ba=class extends vn{constructor(e=new we,t=new we,n=new we){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new we){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(or(e,s.x,r.x,a.x),or(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Sr=class extends vn{constructor(e=new P,t=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new P){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(or(e,s.x,r.x,a.x),or(e,s.y,r.y,a.y),or(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},za=class extends vn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new we){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],u=s[a>s.length-3?s.length-1:a+2];return n.set(Kh(o,l.x,c.x,h.x,u.x),Kh(o,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new we().fromArray(s))}return this}},sp=Object.freeze({__proto__:null,ArcCurve:Da,CatmullRomCurve3:Bs,CubicBezierCurve:Ua,CubicBezierCurve3:Na,EllipseCurve:Mr,LineCurve:Fa,LineCurve3:Oa,QuadraticBezierCurve:Ba,QuadraticBezierCurve3:Sr,SplineCurve:za});var tn=class i extends Xt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=e/o,d=t/l,p=[],x=[],_=[],m=[];for(let f=0;f<h;f++){let T=f*d-a;for(let M=0;M<c;M++){let A=M*u-r;x.push(A,-T,0),_.push(0,0,1),m.push(M/o),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let T=0;T<o;T++){let M=T+c*f,A=T+c*(f+1),C=T+1+c*(f+1),S=T+1+c*f;p.push(M,A,S),p.push(A,C,S)}this.setIndex(p),this.setAttribute("position",new St(x,3)),this.setAttribute("normal",new St(_,3)),this.setAttribute("uv",new St(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var wr=class i extends Xt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],u=new P,d=new P,p=[],x=[],_=[],m=[];for(let f=0;f<=n;f++){let T=[],M=f/n,A=0;f===0&&a===0?A=.5/t:f===n&&l===Math.PI&&(A=-.5/t);for(let C=0;C<=t;C++){let S=C/t;u.x=-e*Math.cos(s+S*r)*Math.sin(a+M*o),u.y=e*Math.cos(a+M*o),u.z=e*Math.sin(s+S*r)*Math.sin(a+M*o),x.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),m.push(S+A,1-M),T.push(c++)}h.push(T)}for(let f=0;f<n;f++)for(let T=0;T<t;T++){let M=h[f][T+1],A=h[f][T],C=h[f+1][T],S=h[f+1][T+1];(f!==0||a>0)&&p.push(M,A,S),(f!==n-1||l<Math.PI)&&p.push(A,C,S)}this.setIndex(p),this.setAttribute("position",new St(x,3)),this.setAttribute("normal",new St(_,3)),this.setAttribute("uv",new St(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Tr=class i extends Xt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);let a=[],o=[],l=[],c=[],h=new P,u=new P,d=new P;for(let p=0;p<=n;p++)for(let x=0;x<=s;x++){let _=x/s*r,m=p/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(_),u.y=(e+t*Math.cos(m))*Math.sin(_),u.z=t*Math.sin(m),o.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(x/s),c.push(p/n)}for(let p=1;p<=n;p++)for(let x=1;x<=s;x++){let _=(s+1)*p+x-1,m=(s+1)*(p-1)+x-1,f=(s+1)*(p-1)+x,T=(s+1)*p+x;a.push(_,m,T),a.push(m,f,T)}this.setIndex(a),this.setAttribute("position",new St(o,3)),this.setAttribute("normal",new St(l,3)),this.setAttribute("uv",new St(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Ar=class i extends Xt{constructor(e=new Sr(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new P,l=new P,c=new we,h=new P,u=[],d=[],p=[],x=[];_(),this.setIndex(x),this.setAttribute("position",new St(u,3)),this.setAttribute("normal",new St(d,3)),this.setAttribute("uv",new St(p,2));function _(){for(let M=0;M<t;M++)m(M);m(r===!1?t:0),T(),f()}function m(M){h=e.getPointAt(M/t,h);let A=a.normals[M],C=a.binormals[M];for(let S=0;S<=s;S++){let R=S/s*Math.PI*2,N=Math.sin(R),b=-Math.cos(R);l.x=b*A.x+N*C.x,l.y=b*A.y+N*C.y,l.z=b*A.z+N*C.z,l.normalize(),d.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,u.push(o.x,o.y,o.z)}}function f(){for(let M=1;M<=t;M++)for(let A=1;A<=s;A++){let C=(s+1)*(M-1)+(A-1),S=(s+1)*M+(A-1),R=(s+1)*M+A,N=(s+1)*(M-1)+A;x.push(C,S,N),x.push(S,R,N)}}function T(){for(let M=0;M<=t;M++)for(let A=0;A<=s;A++)c.x=M/t,c.y=A/s,p.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new sp[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Er=class extends yi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new qe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new qe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Tl,this.normalScale=new we(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Un,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var ka=class extends yi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Du,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Va=class extends yi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ba(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function rp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Xi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Ga=class extends Xi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:nl,endingEnd:nl}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case il:r=e,o=2*t-n;break;case sl:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case il:a=e,l=2*n-t;break;case sl:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,p=this._weightNext,x=(n-t)/(s-t),_=x*x,m=_*x,f=-d*m+2*d*_-d*x,T=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*x+1,M=(-1-p)*m+(1.5+p)*_+.5*x,A=p*m-p*_;for(let C=0;C!==o;++C)r[C]=f*a[h+C]+T*a[c+C]+M*a[l+C]+A*a[u+C];return r}},Ha=class extends Xi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(s-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*u+a[l+d]*h;return r}},Wa=class extends Xi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},mn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ba(t,this.TimeBufferType),this.values=ba(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ba(e.times,Array),values:ba(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Wa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ha(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ga(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case lr:t=this.InterpolantFactoryMethodDiscrete;break;case Aa:t=this.InterpolantFactoryMethodLinear;break;case Ma:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Ue("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return lr;case this.InterpolantFactoryMethodLinear:return Aa;case this.InterpolantFactoryMethodSmooth:return Ma}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(We("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(We("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){We("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){We("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&rp(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){We("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ma,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let u=o*n,d=u-n,p=u+n;for(let x=0;x!==n;++x){let _=t[u+x];if(_!==t[d+x]||_!==t[p+x]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let u=o*n,d=a*n;for(let p=0;p!==n;++p)t[d+p]=t[u+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};mn.prototype.ValueTypeName="";mn.prototype.TimeBufferType=Float32Array;mn.prototype.ValueBufferType=Float32Array;mn.prototype.DefaultInterpolation=Aa;var bi=class extends mn{constructor(e,t,n){super(e,t,n)}};bi.prototype.ValueTypeName="bool";bi.prototype.ValueBufferType=Array;bi.prototype.DefaultInterpolation=lr;bi.prototype.InterpolantFactoryMethodLinear=void 0;bi.prototype.InterpolantFactoryMethodSmooth=void 0;var Xa=class extends mn{constructor(e,t,n,s){super(e,t,n,s)}};Xa.prototype.ValueTypeName="color";var qa=class extends mn{constructor(e,t,n,s){super(e,t,n,s)}};qa.prototype.ValueTypeName="number";var Ya=class extends Xi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)si.slerpFlat(r,0,a,c-o,a,c,l);return r}},Cr=class extends mn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Ya(this.times,this.values,this.getValueSize(),e)}};Cr.prototype.ValueTypeName="quaternion";Cr.prototype.InterpolantFactoryMethodSmooth=void 0;var Mi=class extends mn{constructor(e,t,n){super(e,t,n)}};Mi.prototype.ValueTypeName="string";Mi.prototype.ValueBufferType=Array;Mi.prototype.DefaultInterpolation=lr;Mi.prototype.InterpolantFactoryMethodLinear=void 0;Mi.prototype.InterpolantFactoryMethodSmooth=void 0;var Za=class extends mn{constructor(e,t,n,s){super(e,t,n,s)}};Za.prototype.ValueTypeName="vector";var Ja=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let p=c[u],x=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Yu=new Ja,$a=class{constructor(e){this.manager=e!==void 0?e:Yu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};$a.DEFAULT_MATERIAL_NAME="__DEFAULT";var zs=class extends Nt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new qe(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Rr=class extends zs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Nt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new qe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},el=new ft,Qh=new P,jh=new P,Ka=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new we(512,512),this.mapType=Fn,this.map=null,this.mapPass=null,this.matrix=new ft,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ns,this._frameExtents=new we(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Qh.setFromMatrixPosition(e.matrixWorld),t.position.copy(Qh),jh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(jh),t.updateMatrixWorld(),el.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(el,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(el)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var eu=new ft,sr=new P,tl=new P,ol=class extends Ka{constructor(){super(new Gt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new we(4,2),this._viewportCount=6,this._viewports=[new tt(2,1,1,1),new tt(0,1,1,1),new tt(3,1,1,1),new tt(1,1,1,1),new tt(3,0,1,1),new tt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),sr.setFromMatrixPosition(e.matrixWorld),n.position.copy(sr),tl.copy(n.position),tl.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(tl),n.updateMatrixWorld(),s.makeTranslation(-sr.x,-sr.y,-sr.z),eu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(eu,n.coordinateSystem,n.reversedDepth)}},Ir=class extends zs{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new ol}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},qi=class extends gr{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},cl=class extends Ka{constructor(){super(new qi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Pr=class extends zs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Nt.DEFAULT_UP),this.updateMatrix(),this.target=new Nt,this.shadow=new cl}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Qa=class extends Gt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Dl="\\[\\]\\.:\\/",ap=new RegExp("["+Dl+"]","g"),Ul="[^"+Dl+"]",op="[^"+Dl.replace("\\.","")+"]",cp=/((?:WC+[\/:])*)/.source.replace("WC",Ul),lp=/(WCOD+)?/.source.replace("WCOD",op),hp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ul),up=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ul),dp=new RegExp("^"+cp+lp+hp+up+"$"),fp=["material","materials","bones","map"],ll=class{constructor(e,t,n){let s=n||dt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},dt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(ap,"")}static parseTrackName(e){let t=dp.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);fp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Ue("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){We("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){We("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){We("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){We("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){We("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){We("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){We("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;We("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){We("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){We("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};dt.Composite=ll;dt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};dt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};dt.prototype.GetterByBindingType=[dt.prototype._getValue_direct,dt.prototype._getValue_array,dt.prototype._getValue_arrayElement,dt.prototype._getValue_toArray];dt.prototype.SetterByBindingTypeAndVersioning=[[dt.prototype._setValue_direct,dt.prototype._setValue_direct_setNeedsUpdate,dt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_array,dt.prototype._setValue_array_setNeedsUpdate,dt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_arrayElement,dt.prototype._setValue_arrayElement_setNeedsUpdate,dt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_fromArray,dt.prototype._setValue_fromArray_setNeedsUpdate,dt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var k_=new Float32Array(1);var tu=new ft,Lr=class{constructor(e,t,n=0,s=1/0){this.ray=new pr(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Ds,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):We("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return tu.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(tu),this}intersectObject(e,t=!0,n=[]){return hl(e,this,n,t),n.sort(nu),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)hl(e[s],this,n,t);return n.sort(nu),n}};function nu(i,e){return i.distance-e.distance}function hl(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)hl(r[a],e,t,!0)}}function Nl(i,e,t,n){let s=pp(n);switch(t){case Ml:return i*e;case wl:return i*e/s.components*s.byteLength;case po:return i*e/s.components*s.byteLength;case mo:return i*e*2/s.components*s.byteLength;case xo:return i*e*2/s.components*s.byteLength;case Sl:return i*e*3/s.components*s.byteLength;case Mn:return i*e*4/s.components*s.byteLength;case go:return i*e*4/s.components*s.byteLength;case Nr:case Fr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Or:case Br:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case vo:case bo:return Math.max(i,16)*Math.max(e,8)/4;case _o:case yo:return Math.max(i,8)*Math.max(e,8)/2;case Mo:case So:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case wo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case To:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ao:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Eo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Co:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ro:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Io:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Po:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Lo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Do:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Uo:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case No:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Fo:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Oo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Bo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case zo:case ko:case Vo:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Go:case Ho:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Wo:case Xo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function pp(i){switch(i){case Fn:case _l:return{byteLength:1,components:1};case ks:case vl:case Ji:return{byteLength:2,components:1};case uo:case fo:return{byteLength:2,components:4};case wi:case ho:case Wn:return{byteLength:4,components:1};case yl:case bl:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"181"}}));typeof window<"u"&&(window.__THREE__?Ue("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="181");function xd(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function xp(i){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,x)=>p.start-x.start);let d=0;for(let p=1;p<u.length;p++){let x=u[d],_=u[p];_.start<=x.start+x.count+1?x.count=Math.max(x.count,_.start+_.count-x.start):(++d,u[d]=_)}u.length=d+1;for(let p=0,x=u.length;p<x;p++){let _=u[p];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var gp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,_p=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,vp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,yp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Mp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Sp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT )
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN )
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,wp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Tp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Ap=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ep=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Cp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Rp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ip=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Pp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Lp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Dp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Up=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Np=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Fp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Op=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Bp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,zp=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,kp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Vp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Gp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Hp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Wp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Xp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,qp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Yp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Zp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Jp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,$p=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Kp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Qp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,jp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,em=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,tm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,nm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,im=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,sm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,rm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,am=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,om=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,hm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,um=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,dm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,fm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,pm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,mm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 uv = vec2( roughness, dotNV );
	return texture2D( dfgLUT, uv ).rg;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNV * dotNV), 0.0, dotNV), material.roughness );
	vec2 dfgL = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNL * dotNL), 0.0, dotNL), material.roughness );
	vec3 FssEss_V = material.specularColor * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColor * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColor + ( 1.0 - material.specularColor ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,xm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,gm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,_m=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,vm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ym=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,bm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Mm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Sm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,wm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Tm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Am=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Em=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Cm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Rm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Im=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Pm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Lm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Dm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Um=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Nm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Fm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Om=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Bm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,zm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,km=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Vm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Gm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Hm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Wm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Xm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,qm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ym=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Zm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Jm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,$m=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Km=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Qm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;

		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,jm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,e0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,t0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,n0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,i0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,s0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,r0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,a0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,o0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,c0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,l0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,h0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,u0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,d0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,f0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,p0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,m0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,x0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,g0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,v0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,y0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,b0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,M0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,S0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,w0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,T0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,A0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,E0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,C0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,R0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,I0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,P0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,L0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,D0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,U0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,N0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,F0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,O0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,B0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,z0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,k0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,V0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,G0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,H0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,W0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,X0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,q0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Y0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Z0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,J0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,He={alphahash_fragment:gp,alphahash_pars_fragment:_p,alphamap_fragment:vp,alphamap_pars_fragment:yp,alphatest_fragment:bp,alphatest_pars_fragment:Mp,aomap_fragment:Sp,aomap_pars_fragment:wp,batching_pars_vertex:Tp,batching_vertex:Ap,begin_vertex:Ep,beginnormal_vertex:Cp,bsdfs:Rp,iridescence_fragment:Ip,bumpmap_pars_fragment:Pp,clipping_planes_fragment:Lp,clipping_planes_pars_fragment:Dp,clipping_planes_pars_vertex:Up,clipping_planes_vertex:Np,color_fragment:Fp,color_pars_fragment:Op,color_pars_vertex:Bp,color_vertex:zp,common:kp,cube_uv_reflection_fragment:Vp,defaultnormal_vertex:Gp,displacementmap_pars_vertex:Hp,displacementmap_vertex:Wp,emissivemap_fragment:Xp,emissivemap_pars_fragment:qp,colorspace_fragment:Yp,colorspace_pars_fragment:Zp,envmap_fragment:Jp,envmap_common_pars_fragment:$p,envmap_pars_fragment:Kp,envmap_pars_vertex:Qp,envmap_physical_pars_fragment:lm,envmap_vertex:jp,fog_vertex:em,fog_pars_vertex:tm,fog_fragment:nm,fog_pars_fragment:im,gradientmap_pars_fragment:sm,lightmap_pars_fragment:rm,lights_lambert_fragment:am,lights_lambert_pars_fragment:om,lights_pars_begin:cm,lights_toon_fragment:hm,lights_toon_pars_fragment:um,lights_phong_fragment:dm,lights_phong_pars_fragment:fm,lights_physical_fragment:pm,lights_physical_pars_fragment:mm,lights_fragment_begin:xm,lights_fragment_maps:gm,lights_fragment_end:_m,logdepthbuf_fragment:vm,logdepthbuf_pars_fragment:ym,logdepthbuf_pars_vertex:bm,logdepthbuf_vertex:Mm,map_fragment:Sm,map_pars_fragment:wm,map_particle_fragment:Tm,map_particle_pars_fragment:Am,metalnessmap_fragment:Em,metalnessmap_pars_fragment:Cm,morphinstance_vertex:Rm,morphcolor_vertex:Im,morphnormal_vertex:Pm,morphtarget_pars_vertex:Lm,morphtarget_vertex:Dm,normal_fragment_begin:Um,normal_fragment_maps:Nm,normal_pars_fragment:Fm,normal_pars_vertex:Om,normal_vertex:Bm,normalmap_pars_fragment:zm,clearcoat_normal_fragment_begin:km,clearcoat_normal_fragment_maps:Vm,clearcoat_pars_fragment:Gm,iridescence_pars_fragment:Hm,opaque_fragment:Wm,packing:Xm,premultiplied_alpha_fragment:qm,project_vertex:Ym,dithering_fragment:Zm,dithering_pars_fragment:Jm,roughnessmap_fragment:$m,roughnessmap_pars_fragment:Km,shadowmap_pars_fragment:Qm,shadowmap_pars_vertex:jm,shadowmap_vertex:e0,shadowmask_pars_fragment:t0,skinbase_vertex:n0,skinning_pars_vertex:i0,skinning_vertex:s0,skinnormal_vertex:r0,specularmap_fragment:a0,specularmap_pars_fragment:o0,tonemapping_fragment:c0,tonemapping_pars_fragment:l0,transmission_fragment:h0,transmission_pars_fragment:u0,uv_pars_fragment:d0,uv_pars_vertex:f0,uv_vertex:p0,worldpos_vertex:m0,background_vert:x0,background_frag:g0,backgroundCube_vert:_0,backgroundCube_frag:v0,cube_vert:y0,cube_frag:b0,depth_vert:M0,depth_frag:S0,distanceRGBA_vert:w0,distanceRGBA_frag:T0,equirect_vert:A0,equirect_frag:E0,linedashed_vert:C0,linedashed_frag:R0,meshbasic_vert:I0,meshbasic_frag:P0,meshlambert_vert:L0,meshlambert_frag:D0,meshmatcap_vert:U0,meshmatcap_frag:N0,meshnormal_vert:F0,meshnormal_frag:O0,meshphong_vert:B0,meshphong_frag:z0,meshphysical_vert:k0,meshphysical_frag:V0,meshtoon_vert:G0,meshtoon_frag:H0,points_vert:W0,points_frag:X0,shadow_vert:q0,shadow_frag:Y0,sprite_vert:Z0,sprite_frag:J0},oe={common:{diffuse:{value:new qe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ze}},envmap:{envMap:{value:null},envMapRotation:{value:new ze},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ze},normalScale:{value:new we(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new qe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new qe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0},uvTransform:{value:new ze}},sprite:{diffuse:{value:new qe(16777215)},opacity:{value:1},center:{value:new we(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}}},Xn={basic:{uniforms:Ft([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:Ft([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new qe(0)}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:Ft([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new qe(0)},specular:{value:new qe(1118481)},shininess:{value:30}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:Ft([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new qe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:Ft([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new qe(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:Ft([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:Ft([oe.points,oe.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:Ft([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:Ft([oe.common,oe.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:Ft([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:Ft([oe.sprite,oe.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ze}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distanceRGBA:{uniforms:Ft([oe.common,oe.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distanceRGBA_vert,fragmentShader:He.distanceRGBA_frag},shadow:{uniforms:Ft([oe.lights,oe.fog,{color:{value:new qe(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};Xn.physical={uniforms:Ft([Xn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ze},clearcoatNormalScale:{value:new we(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ze},sheen:{value:0},sheenColor:{value:new qe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ze},transmissionSamplerSize:{value:new we},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ze},attenuationDistance:{value:0},attenuationColor:{value:new qe(0)},specularColor:{value:new qe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ze},anisotropyVector:{value:new we},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ze}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};var qo={r:0,b:0,g:0},Ki=new Un,$0=new ft;function K0(i,e,t,n,s,r,a){let o=new qe(0),l=r===!0?0:1,c,h,u=null,d=0,p=null;function x(M){let A=M.isScene===!0?M.background:null;return A&&A.isTexture&&(A=(M.backgroundBlurriness>0?t:e).get(A)),A}function _(M){let A=!1,C=x(M);C===null?f(o,l):C&&C.isColor&&(f(C,1),A=!0);let S=i.xr.getEnvironmentBlendMode();S==="additive"?n.buffers.color.setClear(0,0,0,1,a):S==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||A)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(M,A){let C=x(A);C&&(C.isCubeTexture||C.mapping===Dr)?(h===void 0&&(h=new qt(new Gn(1,1,1),new _n({name:"BackgroundCubeMaterial",uniforms:$i(Xn.backgroundCube.uniforms),vertexShader:Xn.backgroundCube.vertexShader,fragmentShader:Xn.backgroundCube.fragmentShader,side:Yt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(S,R,N){this.matrixWorld.copyPosition(N.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Ki.copy(A.backgroundRotation),Ki.x*=-1,Ki.y*=-1,Ki.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(Ki.y*=-1,Ki.z*=-1),h.material.uniforms.envMap.value=C,h.material.uniforms.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4($0.makeRotationFromEuler(Ki)),h.material.toneMapped=Qe.getTransfer(C.colorSpace)!==nt,(u!==C||d!==C.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=C,d=C.version,p=i.toneMapping),h.layers.enableAll(),M.unshift(h,h.geometry,h.material,0,0,null)):C&&C.isTexture&&(c===void 0&&(c=new qt(new tn(2,2),new _n({name:"BackgroundMaterial",uniforms:$i(Xn.background.uniforms),vertexShader:Xn.background.vertexShader,fragmentShader:Xn.background.fragmentShader,side:ni,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=C,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.toneMapped=Qe.getTransfer(C.colorSpace)!==nt,C.matrixAutoUpdate===!0&&C.updateMatrix(),c.material.uniforms.uvTransform.value.copy(C.matrix),(u!==C||d!==C.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=C,d=C.version,p=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function f(M,A){M.getRGB(qo,Pl(i)),n.buffers.color.setClear(qo.r,qo.g,qo.b,A,a)}function T(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(M,A=1){o.set(M),l=A,f(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(M){l=M,f(o,l)},render:_,addToRenderList:m,dispose:T}}function Q0(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,a=!1;function o(y,L,O,B,V){let W=!1,X=u(B,O,L);r!==X&&(r=X,c(r.object)),W=p(y,B,O,V),W&&x(y,B,O,V),V!==null&&e.update(V,i.ELEMENT_ARRAY_BUFFER),(W||a)&&(a=!1,A(y,L,O,B),V!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function l(){return i.createVertexArray()}function c(y){return i.bindVertexArray(y)}function h(y){return i.deleteVertexArray(y)}function u(y,L,O){let B=O.wireframe===!0,V=n[y.id];V===void 0&&(V={},n[y.id]=V);let W=V[L.id];W===void 0&&(W={},V[L.id]=W);let X=W[B];return X===void 0&&(X=d(l()),W[B]=X),X}function d(y){let L=[],O=[],B=[];for(let V=0;V<t;V++)L[V]=0,O[V]=0,B[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:O,attributeDivisors:B,object:y,attributes:{},index:null}}function p(y,L,O,B){let V=r.attributes,W=L.attributes,X=0,te=O.getAttributes();for(let H in te)if(te[H].location>=0){let ae=V[H],be=W[H];if(be===void 0&&(H==="instanceMatrix"&&y.instanceMatrix&&(be=y.instanceMatrix),H==="instanceColor"&&y.instanceColor&&(be=y.instanceColor)),ae===void 0||ae.attribute!==be||be&&ae.data!==be.data)return!0;X++}return r.attributesNum!==X||r.index!==B}function x(y,L,O,B){let V={},W=L.attributes,X=0,te=O.getAttributes();for(let H in te)if(te[H].location>=0){let ae=W[H];ae===void 0&&(H==="instanceMatrix"&&y.instanceMatrix&&(ae=y.instanceMatrix),H==="instanceColor"&&y.instanceColor&&(ae=y.instanceColor));let be={};be.attribute=ae,ae&&ae.data&&(be.data=ae.data),V[H]=be,X++}r.attributes=V,r.attributesNum=X,r.index=B}function _(){let y=r.newAttributes;for(let L=0,O=y.length;L<O;L++)y[L]=0}function m(y){f(y,0)}function f(y,L){let O=r.newAttributes,B=r.enabledAttributes,V=r.attributeDivisors;O[y]=1,B[y]===0&&(i.enableVertexAttribArray(y),B[y]=1),V[y]!==L&&(i.vertexAttribDivisor(y,L),V[y]=L)}function T(){let y=r.newAttributes,L=r.enabledAttributes;for(let O=0,B=L.length;O<B;O++)L[O]!==y[O]&&(i.disableVertexAttribArray(O),L[O]=0)}function M(y,L,O,B,V,W,X){X===!0?i.vertexAttribIPointer(y,L,O,V,W):i.vertexAttribPointer(y,L,O,B,V,W)}function A(y,L,O,B){_();let V=B.attributes,W=O.getAttributes(),X=L.defaultAttributeValues;for(let te in W){let H=W[te];if(H.location>=0){let ne=V[te];if(ne===void 0&&(te==="instanceMatrix"&&y.instanceMatrix&&(ne=y.instanceMatrix),te==="instanceColor"&&y.instanceColor&&(ne=y.instanceColor)),ne!==void 0){let ae=ne.normalized,be=ne.itemSize,_e=e.get(ne);if(_e===void 0)continue;let Ve=_e.buffer,Ke=_e.type,it=_e.bytesPerElement,q=Ke===i.INT||Ke===i.UNSIGNED_INT||ne.gpuType===ho;if(ne.isInterleavedBufferAttribute){let J=ne.data,de=J.stride,Ie=ne.offset;if(J.isInstancedInterleavedBuffer){for(let ge=0;ge<H.locationSize;ge++)f(H.location+ge,J.meshPerAttribute);y.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let ge=0;ge<H.locationSize;ge++)m(H.location+ge);i.bindBuffer(i.ARRAY_BUFFER,Ve);for(let ge=0;ge<H.locationSize;ge++)M(H.location+ge,be/H.locationSize,Ke,ae,de*it,(Ie+be/H.locationSize*ge)*it,q)}else{if(ne.isInstancedBufferAttribute){for(let J=0;J<H.locationSize;J++)f(H.location+J,ne.meshPerAttribute);y.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let J=0;J<H.locationSize;J++)m(H.location+J);i.bindBuffer(i.ARRAY_BUFFER,Ve);for(let J=0;J<H.locationSize;J++)M(H.location+J,be/H.locationSize,Ke,ae,be*it,be/H.locationSize*J*it,q)}}else if(X!==void 0){let ae=X[te];if(ae!==void 0)switch(ae.length){case 2:i.vertexAttrib2fv(H.location,ae);break;case 3:i.vertexAttrib3fv(H.location,ae);break;case 4:i.vertexAttrib4fv(H.location,ae);break;default:i.vertexAttrib1fv(H.location,ae)}}}}T()}function C(){N();for(let y in n){let L=n[y];for(let O in L){let B=L[O];for(let V in B)h(B[V].object),delete B[V];delete L[O]}delete n[y]}}function S(y){if(n[y.id]===void 0)return;let L=n[y.id];for(let O in L){let B=L[O];for(let V in B)h(B[V].object),delete B[V];delete L[O]}delete n[y.id]}function R(y){for(let L in n){let O=n[L];if(O[y.id]===void 0)continue;let B=O[y.id];for(let V in B)h(B[V].object),delete B[V];delete O[y.id]}}function N(){b(),a=!0,r!==s&&(r=s,c(r.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:N,resetDefaultState:b,dispose:C,releaseStatesOfGeometry:S,releaseStatesOfProgram:R,initAttributes:_,enableAttribute:m,disableUnusedAttributes:T}}function j0(i,e,t){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function o(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let x=0;x<u;x++)p+=h[x];t.update(p,n,1)}function l(c,h,u,d){if(u===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let x=0;x<c.length;x++)a(c[x],h[x],d[x]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let x=0;for(let _=0;_<u;_++)x+=h[_]*d[_];t.update(x,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function ex(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let R=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==Mn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let N=R===Ji&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==Fn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==Wn&&!N)}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Ue("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),T=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),A=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=x>0,S=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:x,maxTextureSize:_,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:T,maxVaryings:M,maxFragmentUniforms:A,vertexTextures:C,maxSamples:S}}function tx(i){let e=this,t=null,n=0,s=!1,r=!1,a=new zn,o=new ze,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let p=u.length!==0||d||n!==0||s;return s=d,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,p){let x=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,f=i.get(u);if(!s||x===null||x.length===0||r&&!m)r?h(null):c();else{let T=r?0:n,M=T*4,A=f.clippingState||null;l.value=A,A=h(x,d,M,p);for(let C=0;C!==M;++C)A[C]=t[C];f.clippingState=A,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,p,x){let _=u!==null?u.length:0,m=null;if(_!==0){if(m=l.value,x!==!0||m===null){let f=p+_*4,T=d.matrixWorldInverse;o.getNormalMatrix(T),(m===null||m.length<f)&&(m=new Float32Array(f));for(let M=0,A=p;M!==_;++M,A+=4)a.copy(u[M]).applyMatrix4(T,o),a.normal.toArray(m,A),m[A+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function nx(i){let e=new WeakMap;function t(a,o){return o===oo?a.mapping=Yi:o===co&&(a.mapping=Zi),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===oo||o===co)if(e.has(a)){let l=e.get(a).texture;return t(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let c=new Pa(l.height);return c.fromEquirectangularTexture(i,a),e.set(a,c),a.addEventListener("dispose",s),t(c.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var Ai=4,Zu=[.125,.215,.35,.446,.526,.582],ji=20,ix=256,zr=new qi,Ju=new qe,Fl=null,Ol=0,Bl=0,zl=!1,sx=new P,Zo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=sx}=r;Fl=this._renderer.getRenderTarget(),Ol=this._renderer.getActiveCubeFace(),Bl=this._renderer.getActiveMipmapLevel(),zl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Qu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ku(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Fl,Ol,Bl),this._renderer.xr.enabled=zl,e.scissorTest=!1,Ws(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Yi||e.mapping===Zi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Fl=this._renderer.getRenderTarget(),Ol=this._renderer.getActiveCubeFace(),Bl=this._renderer.getActiveMipmapLevel(),zl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:pn,minFilter:pn,generateMipmaps:!1,type:Ji,format:Mn,colorSpace:Wi,depthBuffer:!1},s=$u(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=$u(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=rx(r)),this._blurMaterial=ox(r,e,t),this._ggxMaterial=ax(r,e,t)}return s}_compileMaterial(e){let t=new qt(new Xt,e);this._renderer.compile(t,zr)}_sceneToCubeUV(e,t,n,s,r){let l=new Gt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,p=u.toneMapping;u.getClearColor(Ju),u.toneMapping=ri,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new qt(new Gn,new Nn({name:"PMREM.Background",side:Yt,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,m=_.material,f=!1,T=e.background;T?T.isColor&&(m.color.copy(T),e.background=null,f=!0):(m.color.copy(Ju),f=!0);for(let M=0;M<6;M++){let A=M%3;A===0?(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[M],r.y,r.z)):A===1?(l.up.set(0,0,c[M]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[M],r.z)):(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[M]));let C=this._cubeSize;Ws(s,A*C,M>2?C:0,C,C),u.setRenderTarget(s),f&&u.render(_,l),u.render(e,l)}u.toneMapping=p,u.autoClear=d,e.background=T}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Yi||e.mapping===Zi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Qu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ku());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;Ws(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,zr)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=.05+c*.95,p=u*d,{_lodMax:x}=this,_=this._sizeLods[n],m=3*_*(n>x-Ai?n-x+Ai:0),f=4*(this._cubeSize-_);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=x-t,Ws(r,m,f,3*_,2*_),s.setRenderTarget(r),s.render(o,zr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=x-n,Ws(e,m,f,3*_,2*_),s.setRenderTarget(e),s.render(o,zr)}_blur(e,t,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&We("blur direction must be either latitudinal or longitudinal!");let h=3,u=this._lodMeshes[s];u.material=c;let d=c.uniforms,p=this._sizeLods[n]-1,x=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ji-1),_=r/x,m=isFinite(r)?1+Math.floor(h*_):ji;m>ji&&Ue(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ji}`);let f=[],T=0;for(let R=0;R<ji;++R){let N=R/_,b=Math.exp(-N*N/2);f.push(b),R===0?T+=b:R<m&&(T+=2*b)}for(let R=0;R<f.length;R++)f[R]=f[R]/T;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=f,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:M}=this;d.dTheta.value=x,d.mipInt.value=M-n;let A=this._sizeLods[s],C=3*A*(s>M-Ai?s-M+Ai:0),S=4*(this._cubeSize-A);Ws(t,C,S,3*A,2*A),l.setRenderTarget(t),l.render(u,zr)}};function rx(i){let e=[],t=[],n=[],s=i,r=i-Ai+1+Zu.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let l=1/o;a>i-Ai?l=Zu[a-i+Ai-1]:a===0&&(l=0),t.push(l);let c=1/(o-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,x=6,_=3,m=2,f=1,T=new Float32Array(_*x*p),M=new Float32Array(m*x*p),A=new Float32Array(f*x*p);for(let S=0;S<p;S++){let R=S%3*2/3-1,N=S>2?0:-1,b=[R,N,0,R+2/3,N,0,R+2/3,N+1,0,R,N,0,R+2/3,N+1,0,R,N+1,0];T.set(b,_*x*S),M.set(d,m*x*S);let y=[S,S,S,S,S,S];A.set(y,f*x*S)}let C=new Xt;C.setAttribute("position",new Ht(T,_)),C.setAttribute("uv",new Ht(M,m)),C.setAttribute("faceIndex",new Ht(A,f)),n.push(new qt(C,null)),s>Ai&&s--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function $u(i,e,t){let n=new Vn(i,e,t);return n.texture.mapping=Dr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ws(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function ax(i,e,t){return new _n({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:ix,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:$o(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function ox(i,e,t){let n=new Float32Array(ji),s=new P(0,1,0);return new _n({name:"SphericalGaussianBlur",defines:{n:ji,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:$o(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function Ku(){return new _n({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:$o(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function Qu(){return new _n({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:$o(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function $o(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function cx(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){let l=o.mapping,c=l===oo||l===co,h=l===Yi||l===Zi;if(c||h){let u=e.get(o),d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new Zo(i)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{let p=o.image;return c&&p&&p.height>0||h&&p&&s(p)?(t===null&&(t=new Zo(i)),u=c?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0,c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){let l=o.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function lx(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Rs("WebGLRenderer: "+n+" extension not supported."),s}}}function hx(i,e,t,n){let s={},r=new WeakMap;function a(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let x in d.attributes)e.remove(d.attributes[x]);d.removeEventListener("dispose",a),delete s[d.id];let p=r.get(d);p&&(e.remove(p),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,t.memory.geometries++),d}function l(u){let d=u.attributes;for(let p in d)e.update(d[p],i.ARRAY_BUFFER)}function c(u){let d=[],p=u.index,x=u.attributes.position,_=0;if(p!==null){let T=p.array;_=p.version;for(let M=0,A=T.length;M<A;M+=3){let C=T[M+0],S=T[M+1],R=T[M+2];d.push(C,S,S,R,R,C)}}else if(x!==void 0){let T=x.array;_=x.version;for(let M=0,A=T.length/3-1;M<A;M+=3){let C=M+0,S=M+1,R=M+2;d.push(C,S,S,R,R,C)}}else return;let m=new(Cl(d)?xr:mr)(d,1);m.version=_;let f=r.get(u);f&&e.remove(f),r.set(u,m)}function h(u){let d=r.get(u);if(d){let p=u.index;p!==null&&d.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function ux(i,e,t){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,p){i.drawElements(n,p,r,d*a),t.update(p,n,1)}function c(d,p,x){x!==0&&(i.drawElementsInstanced(n,p,r,d*a,x),t.update(p,n,x))}function h(d,p,x){if(x===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,d,0,x);let m=0;for(let f=0;f<x;f++)m+=p[f];t.update(m,n,1)}function u(d,p,x,_){if(x===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<d.length;f++)c(d[f]/a,p[f],_[f]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,d,0,_,0,x);let f=0;for(let T=0;T<x;T++)f+=p[T]*_[T];t.update(f,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function dx(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:We("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function fx(i,e,t){let n=new WeakMap,s=new tt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(o);if(d===void 0||d.count!==u){let b=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",b)};d!==void 0&&d.texture.dispose();let p=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],f=o.morphAttributes.normal||[],T=o.morphAttributes.color||[],M=0;p===!0&&(M=1),x===!0&&(M=2),_===!0&&(M=3);let A=o.attributes.position.count*M,C=1;A>e.maxTextureSize&&(C=Math.ceil(A/e.maxTextureSize),A=e.maxTextureSize);let S=new Float32Array(A*C*4*u),R=new fr(S,A,C,u);R.type=Wn,R.needsUpdate=!0;let N=M*4;for(let y=0;y<u;y++){let L=m[y],O=f[y],B=T[y],V=A*C*4*y;for(let W=0;W<L.count;W++){let X=W*N;p===!0&&(s.fromBufferAttribute(L,W),S[V+X+0]=s.x,S[V+X+1]=s.y,S[V+X+2]=s.z,S[V+X+3]=0),x===!0&&(s.fromBufferAttribute(O,W),S[V+X+4]=s.x,S[V+X+5]=s.y,S[V+X+6]=s.z,S[V+X+7]=0),_===!0&&(s.fromBufferAttribute(B,W),S[V+X+8]=s.x,S[V+X+9]=s.y,S[V+X+10]=s.z,S[V+X+11]=B.itemSize===4?s.w:1)}}d={count:u,texture:R,size:new we(A,C)},n.set(o,d),o.addEventListener("dispose",b)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let _=0;_<c.length;_++)p+=c[_];let x=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function px(i,e,t,n){let s=new WeakMap;function r(l){let c=n.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return u}function a(){s=new WeakMap}function o(l){let c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}var gd=new Wt,ju=new yr(1,1),_d=new fr,vd=new Ra,yd=new _r,ed=[],td=[],nd=new Float32Array(16),id=new Float32Array(9),sd=new Float32Array(4);function qs(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=ed[s];if(r===void 0&&(r=new Float32Array(s),ed[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Et(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Ct(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Ko(i,e){let t=td[e];t===void 0&&(t=new Int32Array(e),td[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function mx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function xx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2fv(this.addr,e),Ct(t,e)}}function gx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;i.uniform3fv(this.addr,e),Ct(t,e)}}function _x(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4fv(this.addr,e),Ct(t,e)}}function vx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,n))return;sd.set(n),i.uniformMatrix2fv(this.addr,!1,sd),Ct(t,n)}}function yx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,n))return;id.set(n),i.uniformMatrix3fv(this.addr,!1,id),Ct(t,n)}}function bx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,n))return;nd.set(n),i.uniformMatrix4fv(this.addr,!1,nd),Ct(t,n)}}function Mx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Sx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2iv(this.addr,e),Ct(t,e)}}function wx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;i.uniform3iv(this.addr,e),Ct(t,e)}}function Tx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4iv(this.addr,e),Ct(t,e)}}function Ax(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Ex(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2uiv(this.addr,e),Ct(t,e)}}function Cx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;i.uniform3uiv(this.addr,e),Ct(t,e)}}function Rx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4uiv(this.addr,e),Ct(t,e)}}function Ix(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(ju.compareFunction=Al,r=ju):r=gd,t.setTexture2D(e||r,s)}function Px(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||vd,s)}function Lx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||yd,s)}function Dx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||_d,s)}function Ux(i){switch(i){case 5126:return mx;case 35664:return xx;case 35665:return gx;case 35666:return _x;case 35674:return vx;case 35675:return yx;case 35676:return bx;case 5124:case 35670:return Mx;case 35667:case 35671:return Sx;case 35668:case 35672:return wx;case 35669:case 35673:return Tx;case 5125:return Ax;case 36294:return Ex;case 36295:return Cx;case 36296:return Rx;case 35678:case 36198:case 36298:case 36306:case 35682:return Ix;case 35679:case 36299:case 36307:return Px;case 35680:case 36300:case 36308:case 36293:return Lx;case 36289:case 36303:case 36311:case 36292:return Dx}}function Nx(i,e){i.uniform1fv(this.addr,e)}function Fx(i,e){let t=qs(e,this.size,2);i.uniform2fv(this.addr,t)}function Ox(i,e){let t=qs(e,this.size,3);i.uniform3fv(this.addr,t)}function Bx(i,e){let t=qs(e,this.size,4);i.uniform4fv(this.addr,t)}function zx(i,e){let t=qs(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function kx(i,e){let t=qs(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Vx(i,e){let t=qs(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Gx(i,e){i.uniform1iv(this.addr,e)}function Hx(i,e){i.uniform2iv(this.addr,e)}function Wx(i,e){i.uniform3iv(this.addr,e)}function Xx(i,e){i.uniform4iv(this.addr,e)}function qx(i,e){i.uniform1uiv(this.addr,e)}function Yx(i,e){i.uniform2uiv(this.addr,e)}function Zx(i,e){i.uniform3uiv(this.addr,e)}function Jx(i,e){i.uniform4uiv(this.addr,e)}function $x(i,e,t){let n=this.cache,s=e.length,r=Ko(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||gd,r[a])}function Kx(i,e,t){let n=this.cache,s=e.length,r=Ko(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||vd,r[a])}function Qx(i,e,t){let n=this.cache,s=e.length,r=Ko(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||yd,r[a])}function jx(i,e,t){let n=this.cache,s=e.length,r=Ko(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||_d,r[a])}function eg(i){switch(i){case 5126:return Nx;case 35664:return Fx;case 35665:return Ox;case 35666:return Bx;case 35674:return zx;case 35675:return kx;case 35676:return Vx;case 5124:case 35670:return Gx;case 35667:case 35671:return Hx;case 35668:case 35672:return Wx;case 35669:case 35673:return Xx;case 5125:return qx;case 36294:return Yx;case 36295:return Zx;case 36296:return Jx;case 35678:case 36198:case 36298:case 36306:case 35682:return $x;case 35679:case 36299:case 36307:return Kx;case 35680:case 36300:case 36308:case 36293:return Qx;case 36289:case 36303:case 36311:case 36292:return jx}}var Vl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Ux(t.type)}},Gl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=eg(t.type)}},Hl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},kl=/(\w+)(\])?(\[|\.)?/g;function rd(i,e){i.seq.push(e),i.map[e.id]=e}function tg(i,e,t){let n=i.name,s=n.length;for(kl.lastIndex=0;;){let r=kl.exec(n),a=kl.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){rd(t,c===void 0?new Vl(o,i,e):new Gl(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new Hl(o),rd(t,u)),t=u}}}var Xs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);tg(r,a,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function ad(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var ng=37297,ig=0;function sg(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var od=new ze;function rg(i){Qe._getMatrix(od,Qe.workingColorSpace,i);let e=`mat3( ${od.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(i)){case hr:return[e,"LinearTransferOETF"];case nt:return[e,"sRGBTransferOETF"];default:return Ue("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function cd(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+sg(i.getShaderSource(e),o)}else return r}function ag(i,e){let t=rg(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function og(i,e){let t;switch(e){case Au:t="Linear";break;case Eu:t="Reinhard";break;case Cu:t="Cineon";break;case ao:t="ACESFilmic";break;case Iu:t="AgX";break;case Pu:t="Neutral";break;case Ru:t="Custom";break;default:Ue("WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Yo=new P;function cg(){Qe.getLuminanceCoefficients(Yo);let i=Yo.x.toFixed(4),e=Yo.y.toFixed(4),t=Yo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function lg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(kr).join(`
`)}function hg(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function ug(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function kr(i){return i!==""}function ld(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function hd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var dg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wl(i){return i.replace(dg,pg)}var fg=new Map;function pg(i,e){let t=He[e];if(t===void 0){let n=fg.get(e);if(n!==void 0)t=He[n],Ue('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Wl(t)}var mg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ud(i){return i.replace(mg,xg)}function xg(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function dd(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function gg(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===dl?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===ru?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===yn&&(e="SHADOWMAP_TYPE_VSM"),e}function _g(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Yi:case Zi:e="ENVMAP_TYPE_CUBE";break;case Dr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function vg(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Zi:e="ENVMAP_MODE_REFRACTION";break}return e}function yg(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case xl:e="ENVMAP_BLENDING_MULTIPLY";break;case wu:e="ENVMAP_BLENDING_MIX";break;case Tu:e="ENVMAP_BLENDING_ADD";break}return e}function bg(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Mg(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=gg(t),c=_g(t),h=vg(t),u=yg(t),d=bg(t),p=lg(t),x=hg(r),_=s.createProgram(),m,f,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(kr).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(kr).join(`
`),f.length>0&&(f+=`
`)):(m=[dd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(kr).join(`
`),f=[dd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ri?"#define TONE_MAPPING":"",t.toneMapping!==ri?He.tonemapping_pars_fragment:"",t.toneMapping!==ri?og("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,ag("linearToOutputTexel",t.outputColorSpace),cg(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(kr).join(`
`)),a=Wl(a),a=ld(a,t),a=hd(a,t),o=Wl(o),o=ld(o,t),o=hd(o,t),a=ud(a),o=ud(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===El?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===El?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let M=T+m+a,A=T+f+o,C=ad(s,s.VERTEX_SHADER,M),S=ad(s,s.FRAGMENT_SHADER,A);s.attachShader(_,C),s.attachShader(_,S),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function R(L){if(i.debug.checkShaderErrors){let O=s.getProgramInfoLog(_)||"",B=s.getShaderInfoLog(C)||"",V=s.getShaderInfoLog(S)||"",W=O.trim(),X=B.trim(),te=V.trim(),H=!0,ne=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(H=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,C,S);else{let ae=cd(s,C,"vertex"),be=cd(s,S,"fragment");We("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+W+`
`+ae+`
`+be)}else W!==""?Ue("WebGLProgram: Program Info Log:",W):(X===""||te==="")&&(ne=!1);ne&&(L.diagnostics={runnable:H,programLog:W,vertexShader:{log:X,prefix:m},fragmentShader:{log:te,prefix:f}})}s.deleteShader(C),s.deleteShader(S),N=new Xs(s,_),b=ug(s,_)}let N;this.getUniforms=function(){return N===void 0&&R(this),N};let b;this.getAttributes=function(){return b===void 0&&R(this),b};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(_,ng)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=ig++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=C,this.fragmentShader=S,this}var Sg=0,Xl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new ql(e),t.set(e,n)),n}},ql=class{constructor(e){this.id=Sg++,this.code=e,this.usedTimes=0}};function wg(i,e,t,n,s,r,a){let o=new Ds,l=new Xl,c=new Set,h=[],u=s.logarithmicDepthBuffer,d=s.vertexTextures,p=s.precision,x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(b){return c.add(b),b===0?"uv":`uv${b}`}function m(b,y,L,O,B){let V=O.fog,W=B.geometry,X=b.isMeshStandardMaterial?O.environment:null,te=(b.isMeshStandardMaterial?t:e).get(b.envMap||X),H=te&&te.mapping===Dr?te.image.height:null,ne=x[b.type];b.precision!==null&&(p=s.getMaxPrecision(b.precision),p!==b.precision&&Ue("WebGLProgram.getParameters:",b.precision,"not supported, using",p,"instead."));let ae=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,be=ae!==void 0?ae.length:0,_e=0;W.morphAttributes.position!==void 0&&(_e=1),W.morphAttributes.normal!==void 0&&(_e=2),W.morphAttributes.color!==void 0&&(_e=3);let Ve,Ke,it,q;if(ne){let st=Xn[ne];Ve=st.vertexShader,Ke=st.fragmentShader}else Ve=b.vertexShader,Ke=b.fragmentShader,l.update(b),it=l.getVertexShaderID(b),q=l.getFragmentShaderID(b);let J=i.getRenderTarget(),de=i.state.buffers.depth.getReversed(),Ie=B.isInstancedMesh===!0,ge=B.isBatchedMesh===!0,Ce=!!b.map,Tt=!!b.matcap,Fe=!!te,ht=!!b.aoMap,E=!!b.lightMap,Ge=!!b.bumpMap,ke=!!b.normalMap,ct=!!b.displacementMap,xe=!!b.emissiveMap,xt=!!b.metalnessMap,Se=!!b.roughnessMap,Be=b.anisotropy>0,w=b.clearcoat>0,g=b.dispersion>0,F=b.iridescence>0,Y=b.sheen>0,$=b.transmission>0,G=Be&&!!b.anisotropyMap,ye=w&&!!b.clearcoatMap,ce=w&&!!b.clearcoatNormalMap,Te=w&&!!b.clearcoatRoughnessMap,ve=F&&!!b.iridescenceMap,K=F&&!!b.iridescenceThicknessMap,ie=Y&&!!b.sheenColorMap,Pe=Y&&!!b.sheenRoughnessMap,Ee=!!b.specularMap,ue=!!b.specularColorMap,Ne=!!b.specularIntensityMap,I=$&&!!b.transmissionMap,le=$&&!!b.thicknessMap,se=!!b.gradientMap,re=!!b.alphaMap,Q=b.alphaTest>0,Z=!!b.alphaHash,pe=!!b.extensions,Oe=ri;b.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(Oe=i.toneMapping);let ut={shaderID:ne,shaderType:b.type,shaderName:b.name,vertexShader:Ve,fragmentShader:Ke,defines:b.defines,customVertexShaderID:it,customFragmentShaderID:q,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:p,batching:ge,batchingColor:ge&&B._colorsTexture!==null,instancing:Ie,instancingColor:Ie&&B.instanceColor!==null,instancingMorph:Ie&&B.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:J===null?i.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:Wi,alphaToCoverage:!!b.alphaToCoverage,map:Ce,matcap:Tt,envMap:Fe,envMapMode:Fe&&te.mapping,envMapCubeUVHeight:H,aoMap:ht,lightMap:E,bumpMap:Ge,normalMap:ke,displacementMap:d&&ct,emissiveMap:xe,normalMapObjectSpace:ke&&b.normalMapType===Nu,normalMapTangentSpace:ke&&b.normalMapType===Tl,metalnessMap:xt,roughnessMap:Se,anisotropy:Be,anisotropyMap:G,clearcoat:w,clearcoatMap:ye,clearcoatNormalMap:ce,clearcoatRoughnessMap:Te,dispersion:g,iridescence:F,iridescenceMap:ve,iridescenceThicknessMap:K,sheen:Y,sheenColorMap:ie,sheenRoughnessMap:Pe,specularMap:Ee,specularColorMap:ue,specularIntensityMap:Ne,transmission:$,transmissionMap:I,thicknessMap:le,gradientMap:se,opaque:b.transparent===!1&&b.blending===Gi&&b.alphaToCoverage===!1,alphaMap:re,alphaTest:Q,alphaHash:Z,combine:b.combine,mapUv:Ce&&_(b.map.channel),aoMapUv:ht&&_(b.aoMap.channel),lightMapUv:E&&_(b.lightMap.channel),bumpMapUv:Ge&&_(b.bumpMap.channel),normalMapUv:ke&&_(b.normalMap.channel),displacementMapUv:ct&&_(b.displacementMap.channel),emissiveMapUv:xe&&_(b.emissiveMap.channel),metalnessMapUv:xt&&_(b.metalnessMap.channel),roughnessMapUv:Se&&_(b.roughnessMap.channel),anisotropyMapUv:G&&_(b.anisotropyMap.channel),clearcoatMapUv:ye&&_(b.clearcoatMap.channel),clearcoatNormalMapUv:ce&&_(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Te&&_(b.clearcoatRoughnessMap.channel),iridescenceMapUv:ve&&_(b.iridescenceMap.channel),iridescenceThicknessMapUv:K&&_(b.iridescenceThicknessMap.channel),sheenColorMapUv:ie&&_(b.sheenColorMap.channel),sheenRoughnessMapUv:Pe&&_(b.sheenRoughnessMap.channel),specularMapUv:Ee&&_(b.specularMap.channel),specularColorMapUv:ue&&_(b.specularColorMap.channel),specularIntensityMapUv:Ne&&_(b.specularIntensityMap.channel),transmissionMapUv:I&&_(b.transmissionMap.channel),thicknessMapUv:le&&_(b.thicknessMap.channel),alphaMapUv:re&&_(b.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(ke||Be),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!W.attributes.uv&&(Ce||re),fog:!!V,useFog:b.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:b.flatShading===!0&&b.wireframe===!1,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:de,skinning:B.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:be,morphTextureStride:_e,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:Oe,decodeVideoTexture:Ce&&b.map.isVideoTexture===!0&&Qe.getTransfer(b.map.colorSpace)===nt,decodeVideoTextureEmissive:xe&&b.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(b.emissiveMap.colorSpace)===nt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===bn,flipSided:b.side===Yt,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:pe&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(pe&&b.extensions.multiDraw===!0||ge)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return ut.vertexUv1s=c.has(1),ut.vertexUv2s=c.has(2),ut.vertexUv3s=c.has(3),c.clear(),ut}function f(b){let y=[];if(b.shaderID?y.push(b.shaderID):(y.push(b.customVertexShaderID),y.push(b.customFragmentShaderID)),b.defines!==void 0)for(let L in b.defines)y.push(L),y.push(b.defines[L]);return b.isRawShaderMaterial===!1&&(T(y,b),M(y,b),y.push(i.outputColorSpace)),y.push(b.customProgramCacheKey),y.join()}function T(b,y){b.push(y.precision),b.push(y.outputColorSpace),b.push(y.envMapMode),b.push(y.envMapCubeUVHeight),b.push(y.mapUv),b.push(y.alphaMapUv),b.push(y.lightMapUv),b.push(y.aoMapUv),b.push(y.bumpMapUv),b.push(y.normalMapUv),b.push(y.displacementMapUv),b.push(y.emissiveMapUv),b.push(y.metalnessMapUv),b.push(y.roughnessMapUv),b.push(y.anisotropyMapUv),b.push(y.clearcoatMapUv),b.push(y.clearcoatNormalMapUv),b.push(y.clearcoatRoughnessMapUv),b.push(y.iridescenceMapUv),b.push(y.iridescenceThicknessMapUv),b.push(y.sheenColorMapUv),b.push(y.sheenRoughnessMapUv),b.push(y.specularMapUv),b.push(y.specularColorMapUv),b.push(y.specularIntensityMapUv),b.push(y.transmissionMapUv),b.push(y.thicknessMapUv),b.push(y.combine),b.push(y.fogExp2),b.push(y.sizeAttenuation),b.push(y.morphTargetsCount),b.push(y.morphAttributeCount),b.push(y.numDirLights),b.push(y.numPointLights),b.push(y.numSpotLights),b.push(y.numSpotLightMaps),b.push(y.numHemiLights),b.push(y.numRectAreaLights),b.push(y.numDirLightShadows),b.push(y.numPointLightShadows),b.push(y.numSpotLightShadows),b.push(y.numSpotLightShadowsWithMaps),b.push(y.numLightProbes),b.push(y.shadowMapType),b.push(y.toneMapping),b.push(y.numClippingPlanes),b.push(y.numClipIntersection),b.push(y.depthPacking)}function M(b,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),y.gradientMap&&o.enable(22),b.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reversedDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),b.push(o.mask)}function A(b){let y=x[b.type],L;if(y){let O=Xn[y];L=qu.clone(O.uniforms)}else L=b.uniforms;return L}function C(b,y){let L;for(let O=0,B=h.length;O<B;O++){let V=h[O];if(V.cacheKey===y){L=V,++L.usedTimes;break}}return L===void 0&&(L=new Mg(i,y,b,r),h.push(L)),L}function S(b){if(--b.usedTimes===0){let y=h.indexOf(b);h[y]=h[h.length-1],h.pop(),b.destroy()}}function R(b){l.remove(b)}function N(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:A,acquireProgram:C,releaseProgram:S,releaseShaderCache:R,programs:h,dispose:N}}function Tg(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Ag(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function fd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function pd(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(u,d,p,x,_,m){let f=i[e];return f===void 0?(f={id:u.id,object:u,geometry:d,material:p,groupOrder:x,renderOrder:u.renderOrder,z:_,group:m},i[e]=f):(f.id=u.id,f.object=u,f.geometry=d,f.material=p,f.groupOrder=x,f.renderOrder=u.renderOrder,f.z=_,f.group=m),e++,f}function o(u,d,p,x,_,m){let f=a(u,d,p,x,_,m);p.transmission>0?n.push(f):p.transparent===!0?s.push(f):t.push(f)}function l(u,d,p,x,_,m){let f=a(u,d,p,x,_,m);p.transmission>0?n.unshift(f):p.transparent===!0?s.unshift(f):t.unshift(f)}function c(u,d){t.length>1&&t.sort(u||Ag),n.length>1&&n.sort(d||fd),s.length>1&&s.sort(d||fd)}function h(){for(let u=e,d=i.length;u<d;u++){let p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function Eg(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new pd,i.set(n,[a])):s>=r.length?(a=new pd,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Cg(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new qe};break;case"SpotLight":t={position:new P,direction:new P,color:new qe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new qe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new qe,groundColor:new qe};break;case"RectAreaLight":t={color:new qe,position:new P,halfWidth:new P,halfHeight:new P};break}return i[e.id]=t,t}}}function Rg(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Ig=0;function Pg(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Lg(i){let e=new Cg,t=Rg(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new P);let s=new P,r=new ft,a=new ft;function o(c){let h=0,u=0,d=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let p=0,x=0,_=0,m=0,f=0,T=0,M=0,A=0,C=0,S=0,R=0;c.sort(Pg);for(let b=0,y=c.length;b<y;b++){let L=c[b],O=L.color,B=L.intensity,V=L.distance,W=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)h+=O.r*B,u+=O.g*B,d+=O.b*B;else if(L.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(L.sh.coefficients[X],B);R++}else if(L.isDirectionalLight){let X=e.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let te=L.shadow,H=t.get(L);H.shadowIntensity=te.intensity,H.shadowBias=te.bias,H.shadowNormalBias=te.normalBias,H.shadowRadius=te.radius,H.shadowMapSize=te.mapSize,n.directionalShadow[p]=H,n.directionalShadowMap[p]=W,n.directionalShadowMatrix[p]=L.shadow.matrix,T++}n.directional[p]=X,p++}else if(L.isSpotLight){let X=e.get(L);X.position.setFromMatrixPosition(L.matrixWorld),X.color.copy(O).multiplyScalar(B),X.distance=V,X.coneCos=Math.cos(L.angle),X.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),X.decay=L.decay,n.spot[_]=X;let te=L.shadow;if(L.map&&(n.spotLightMap[C]=L.map,C++,te.updateMatrices(L),L.castShadow&&S++),n.spotLightMatrix[_]=te.matrix,L.castShadow){let H=t.get(L);H.shadowIntensity=te.intensity,H.shadowBias=te.bias,H.shadowNormalBias=te.normalBias,H.shadowRadius=te.radius,H.shadowMapSize=te.mapSize,n.spotShadow[_]=H,n.spotShadowMap[_]=W,A++}_++}else if(L.isRectAreaLight){let X=e.get(L);X.color.copy(O).multiplyScalar(B),X.halfWidth.set(L.width*.5,0,0),X.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=X,m++}else if(L.isPointLight){let X=e.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity),X.distance=L.distance,X.decay=L.decay,L.castShadow){let te=L.shadow,H=t.get(L);H.shadowIntensity=te.intensity,H.shadowBias=te.bias,H.shadowNormalBias=te.normalBias,H.shadowRadius=te.radius,H.shadowMapSize=te.mapSize,H.shadowCameraNear=te.camera.near,H.shadowCameraFar=te.camera.far,n.pointShadow[x]=H,n.pointShadowMap[x]=W,n.pointShadowMatrix[x]=L.shadow.matrix,M++}n.point[x]=X,x++}else if(L.isHemisphereLight){let X=e.get(L);X.skyColor.copy(L.color).multiplyScalar(B),X.groundColor.copy(L.groundColor).multiplyScalar(B),n.hemi[f]=X,f++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=oe.LTC_FLOAT_1,n.rectAreaLTC2=oe.LTC_FLOAT_2):(n.rectAreaLTC1=oe.LTC_HALF_1,n.rectAreaLTC2=oe.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let N=n.hash;(N.directionalLength!==p||N.pointLength!==x||N.spotLength!==_||N.rectAreaLength!==m||N.hemiLength!==f||N.numDirectionalShadows!==T||N.numPointShadows!==M||N.numSpotShadows!==A||N.numSpotMaps!==C||N.numLightProbes!==R)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=m,n.point.length=x,n.hemi.length=f,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=A,n.spotShadowMap.length=A,n.directionalShadowMatrix.length=T,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=A+C-S,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=S,n.numLightProbes=R,N.directionalLength=p,N.pointLength=x,N.spotLength=_,N.rectAreaLength=m,N.hemiLength=f,N.numDirectionalShadows=T,N.numPointShadows=M,N.numSpotShadows=A,N.numSpotMaps=C,N.numLightProbes=R,n.version=Ig++)}function l(c,h){let u=0,d=0,p=0,x=0,_=0,m=h.matrixWorldInverse;for(let f=0,T=c.length;f<T;f++){let M=c[f];if(M.isDirectionalLight){let A=n.directional[u];A.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(m),u++}else if(M.isSpotLight){let A=n.spot[p];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(m),A.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(m),p++}else if(M.isRectAreaLight){let A=n.rectArea[x];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(m),a.identity(),r.copy(M.matrixWorld),r.premultiply(m),a.extractRotation(r),A.halfWidth.set(M.width*.5,0,0),A.halfHeight.set(0,M.height*.5,0),A.halfWidth.applyMatrix4(a),A.halfHeight.applyMatrix4(a),x++}else if(M.isPointLight){let A=n.point[d];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(m),d++}else if(M.isHemisphereLight){let A=n.hemi[_];A.direction.setFromMatrixPosition(M.matrixWorld),A.direction.transformDirection(m),_++}}}return{setup:o,setupView:l,state:n}}function md(i){let e=new Lg(i),t=[],n=[];function s(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}let c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function Dg(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new md(i),e.set(s,[o])):r>=a.length?(o=new md(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Ug=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ng=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Fg(i,e,t){let n=new Ns,s=new we,r=new we,a=new tt,o=new ka({depthPacking:Uu}),l=new Va,c={},h=t.maxTextureSize,u={[ni]:Yt,[Yt]:ni,[bn]:bn},d=new _n({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new we},radius:{value:4}},vertexShader:Ug,fragmentShader:Ng}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let x=new Xt;x.setAttribute("position",new Ht(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new qt(x,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=dl;let f=this.type;this.render=function(S,R,N){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;let b=i.getRenderTarget(),y=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),O=i.state;O.setBlending(Hn),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);let B=f!==yn&&this.type===yn,V=f===yn&&this.type!==yn;for(let W=0,X=S.length;W<X;W++){let te=S[W],H=te.shadow;if(H===void 0){Ue("WebGLShadowMap:",te,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);let ne=H.getFrameExtents();if(s.multiply(ne),r.copy(H.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ne.x),s.x=r.x*ne.x,H.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ne.y),s.y=r.y*ne.y,H.mapSize.y=r.y)),H.map===null||B===!0||V===!0){let be=this.type!==yn?{minFilter:en,magFilter:en}:{};H.map!==null&&H.map.dispose(),H.map=new Vn(s.x,s.y,be),H.map.texture.name=te.name+".shadowMap",H.camera.updateProjectionMatrix()}i.setRenderTarget(H.map),i.clear();let ae=H.getViewportCount();for(let be=0;be<ae;be++){let _e=H.getViewport(be);a.set(r.x*_e.x,r.y*_e.y,r.x*_e.z,r.y*_e.w),O.viewport(a),H.updateMatrices(te,be),n=H.getFrustum(),A(R,N,H.camera,te,this.type)}H.isPointLightShadow!==!0&&this.type===yn&&T(H,N),H.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(b,y,L)};function T(S,R){let N=e.update(_);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,p.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new Vn(s.x,s.y)),d.uniforms.shadow_pass.value=S.map.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(R,null,N,d,_,null),p.uniforms.shadow_pass.value=S.mapPass.texture,p.uniforms.resolution.value=S.mapSize,p.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(R,null,N,p,_,null)}function M(S,R,N,b){let y=null,L=N.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(L!==void 0)y=L;else if(y=N.isPointLight===!0?l:o,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let O=y.uuid,B=R.uuid,V=c[O];V===void 0&&(V={},c[O]=V);let W=V[B];W===void 0&&(W=y.clone(),V[B]=W,R.addEventListener("dispose",C)),y=W}if(y.visible=R.visible,y.wireframe=R.wireframe,b===yn?y.side=R.shadowSide!==null?R.shadowSide:R.side:y.side=R.shadowSide!==null?R.shadowSide:u[R.side],y.alphaMap=R.alphaMap,y.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,y.map=R.map,y.clipShadows=R.clipShadows,y.clippingPlanes=R.clippingPlanes,y.clipIntersection=R.clipIntersection,y.displacementMap=R.displacementMap,y.displacementScale=R.displacementScale,y.displacementBias=R.displacementBias,y.wireframeLinewidth=R.wireframeLinewidth,y.linewidth=R.linewidth,N.isPointLight===!0&&y.isMeshDistanceMaterial===!0){let O=i.properties.get(y);O.light=N}return y}function A(S,R,N,b,y){if(S.visible===!1)return;if(S.layers.test(R.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&y===yn)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,S.matrixWorld);let B=e.update(S),V=S.material;if(Array.isArray(V)){let W=B.groups;for(let X=0,te=W.length;X<te;X++){let H=W[X],ne=V[H.materialIndex];if(ne&&ne.visible){let ae=M(S,ne,b,y);S.onBeforeShadow(i,S,R,N,B,ae,H),i.renderBufferDirect(N,null,B,ae,S,H),S.onAfterShadow(i,S,R,N,B,ae,H)}}}else if(V.visible){let W=M(S,V,b,y);S.onBeforeShadow(i,S,R,N,B,W,null),i.renderBufferDirect(N,null,B,W,S,null),S.onAfterShadow(i,S,R,N,B,W,null)}}let O=S.children;for(let B=0,V=O.length;B<V;B++)A(O[B],R,N,b,y)}function C(S){S.target.removeEventListener("dispose",C);for(let N in c){let b=c[N],y=S.target.uuid;y in b&&(b[y].dispose(),delete b[y])}}}var Og={[ja]:eo,[to]:so,[no]:ro,[Hi]:io,[eo]:ja,[so]:to,[ro]:no,[io]:Hi};function Bg(i,e){function t(){let I=!1,le=new tt,se=null,re=new tt(0,0,0,0);return{setMask:function(Q){se!==Q&&!I&&(i.colorMask(Q,Q,Q,Q),se=Q)},setLocked:function(Q){I=Q},setClear:function(Q,Z,pe,Oe,ut){ut===!0&&(Q*=Oe,Z*=Oe,pe*=Oe),le.set(Q,Z,pe,Oe),re.equals(le)===!1&&(i.clearColor(Q,Z,pe,Oe),re.copy(le))},reset:function(){I=!1,se=null,re.set(-1,0,0,0)}}}function n(){let I=!1,le=!1,se=null,re=null,Q=null;return{setReversed:function(Z){if(le!==Z){let pe=e.get("EXT_clip_control");Z?pe.clipControlEXT(pe.LOWER_LEFT_EXT,pe.ZERO_TO_ONE_EXT):pe.clipControlEXT(pe.LOWER_LEFT_EXT,pe.NEGATIVE_ONE_TO_ONE_EXT),le=Z;let Oe=Q;Q=null,this.setClear(Oe)}},getReversed:function(){return le},setTest:function(Z){Z?J(i.DEPTH_TEST):de(i.DEPTH_TEST)},setMask:function(Z){se!==Z&&!I&&(i.depthMask(Z),se=Z)},setFunc:function(Z){if(le&&(Z=Og[Z]),re!==Z){switch(Z){case ja:i.depthFunc(i.NEVER);break;case eo:i.depthFunc(i.ALWAYS);break;case to:i.depthFunc(i.LESS);break;case Hi:i.depthFunc(i.LEQUAL);break;case no:i.depthFunc(i.EQUAL);break;case io:i.depthFunc(i.GEQUAL);break;case so:i.depthFunc(i.GREATER);break;case ro:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}re=Z}},setLocked:function(Z){I=Z},setClear:function(Z){Q!==Z&&(le&&(Z=1-Z),i.clearDepth(Z),Q=Z)},reset:function(){I=!1,se=null,re=null,Q=null,le=!1}}}function s(){let I=!1,le=null,se=null,re=null,Q=null,Z=null,pe=null,Oe=null,ut=null;return{setTest:function(st){I||(st?J(i.STENCIL_TEST):de(i.STENCIL_TEST))},setMask:function(st){le!==st&&!I&&(i.stencilMask(st),le=st)},setFunc:function(st,Bn,Rn){(se!==st||re!==Bn||Q!==Rn)&&(i.stencilFunc(st,Bn,Rn),se=st,re=Bn,Q=Rn)},setOp:function(st,Bn,Rn){(Z!==st||pe!==Bn||Oe!==Rn)&&(i.stencilOp(st,Bn,Rn),Z=st,pe=Bn,Oe=Rn)},setLocked:function(st){I=st},setClear:function(st){ut!==st&&(i.clearStencil(st),ut=st)},reset:function(){I=!1,le=null,se=null,re=null,Q=null,Z=null,pe=null,Oe=null,ut=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,h={},u={},d=new WeakMap,p=[],x=null,_=!1,m=null,f=null,T=null,M=null,A=null,C=null,S=null,R=new qe(0,0,0),N=0,b=!1,y=null,L=null,O=null,B=null,V=null,W=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,te=0,H=i.getParameter(i.VERSION);H.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(H)[1]),X=te>=1):H.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),X=te>=2);let ne=null,ae={},be=i.getParameter(i.SCISSOR_BOX),_e=i.getParameter(i.VIEWPORT),Ve=new tt().fromArray(be),Ke=new tt().fromArray(_e);function it(I,le,se,re){let Q=new Uint8Array(4),Z=i.createTexture();i.bindTexture(I,Z),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let pe=0;pe<se;pe++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(le,0,i.RGBA,1,1,re,0,i.RGBA,i.UNSIGNED_BYTE,Q):i.texImage2D(le+pe,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Q);return Z}let q={};q[i.TEXTURE_2D]=it(i.TEXTURE_2D,i.TEXTURE_2D,1),q[i.TEXTURE_CUBE_MAP]=it(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[i.TEXTURE_2D_ARRAY]=it(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),q[i.TEXTURE_3D]=it(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),J(i.DEPTH_TEST),a.setFunc(Hi),Ge(!1),ke(ul),J(i.CULL_FACE),ht(Hn);function J(I){h[I]!==!0&&(i.enable(I),h[I]=!0)}function de(I){h[I]!==!1&&(i.disable(I),h[I]=!1)}function Ie(I,le){return u[I]!==le?(i.bindFramebuffer(I,le),u[I]=le,I===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=le),I===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=le),!0):!1}function ge(I,le){let se=p,re=!1;if(I){se=d.get(le),se===void 0&&(se=[],d.set(le,se));let Q=I.textures;if(se.length!==Q.length||se[0]!==i.COLOR_ATTACHMENT0){for(let Z=0,pe=Q.length;Z<pe;Z++)se[Z]=i.COLOR_ATTACHMENT0+Z;se.length=Q.length,re=!0}}else se[0]!==i.BACK&&(se[0]=i.BACK,re=!0);re&&i.drawBuffers(se)}function Ce(I){return x!==I?(i.useProgram(I),x=I,!0):!1}let Tt={[_i]:i.FUNC_ADD,[ou]:i.FUNC_SUBTRACT,[cu]:i.FUNC_REVERSE_SUBTRACT};Tt[lu]=i.MIN,Tt[hu]=i.MAX;let Fe={[uu]:i.ZERO,[du]:i.ONE,[fu]:i.SRC_COLOR,[Sa]:i.SRC_ALPHA,[vu]:i.SRC_ALPHA_SATURATE,[gu]:i.DST_COLOR,[mu]:i.DST_ALPHA,[pu]:i.ONE_MINUS_SRC_COLOR,[wa]:i.ONE_MINUS_SRC_ALPHA,[_u]:i.ONE_MINUS_DST_COLOR,[xu]:i.ONE_MINUS_DST_ALPHA,[yu]:i.CONSTANT_COLOR,[bu]:i.ONE_MINUS_CONSTANT_COLOR,[Mu]:i.CONSTANT_ALPHA,[Su]:i.ONE_MINUS_CONSTANT_ALPHA};function ht(I,le,se,re,Q,Z,pe,Oe,ut,st){if(I===Hn){_===!0&&(de(i.BLEND),_=!1);return}if(_===!1&&(J(i.BLEND),_=!0),I!==au){if(I!==m||st!==b){if((f!==_i||A!==_i)&&(i.blendEquation(i.FUNC_ADD),f=_i,A=_i),st)switch(I){case Gi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case fl:i.blendFunc(i.ONE,i.ONE);break;case pl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ml:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:We("WebGLState: Invalid blending: ",I);break}else switch(I){case Gi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case fl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case pl:We("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ml:We("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:We("WebGLState: Invalid blending: ",I);break}T=null,M=null,C=null,S=null,R.set(0,0,0),N=0,m=I,b=st}return}Q=Q||le,Z=Z||se,pe=pe||re,(le!==f||Q!==A)&&(i.blendEquationSeparate(Tt[le],Tt[Q]),f=le,A=Q),(se!==T||re!==M||Z!==C||pe!==S)&&(i.blendFuncSeparate(Fe[se],Fe[re],Fe[Z],Fe[pe]),T=se,M=re,C=Z,S=pe),(Oe.equals(R)===!1||ut!==N)&&(i.blendColor(Oe.r,Oe.g,Oe.b,ut),R.copy(Oe),N=ut),m=I,b=!1}function E(I,le){I.side===bn?de(i.CULL_FACE):J(i.CULL_FACE);let se=I.side===Yt;le&&(se=!se),Ge(se),I.blending===Gi&&I.transparent===!1?ht(Hn):ht(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);let re=I.stencilWrite;o.setTest(re),re&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),xe(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?J(i.SAMPLE_ALPHA_TO_COVERAGE):de(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ge(I){y!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),y=I)}function ke(I){I!==iu?(J(i.CULL_FACE),I!==L&&(I===ul?i.cullFace(i.BACK):I===su?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):de(i.CULL_FACE),L=I}function ct(I){I!==O&&(X&&i.lineWidth(I),O=I)}function xe(I,le,se){I?(J(i.POLYGON_OFFSET_FILL),(B!==le||V!==se)&&(i.polygonOffset(le,se),B=le,V=se)):de(i.POLYGON_OFFSET_FILL)}function xt(I){I?J(i.SCISSOR_TEST):de(i.SCISSOR_TEST)}function Se(I){I===void 0&&(I=i.TEXTURE0+W-1),ne!==I&&(i.activeTexture(I),ne=I)}function Be(I,le,se){se===void 0&&(ne===null?se=i.TEXTURE0+W-1:se=ne);let re=ae[se];re===void 0&&(re={type:void 0,texture:void 0},ae[se]=re),(re.type!==I||re.texture!==le)&&(ne!==se&&(i.activeTexture(se),ne=se),i.bindTexture(I,le||q[I]),re.type=I,re.texture=le)}function w(){let I=ae[ne];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function g(){try{i.compressedTexImage2D(...arguments)}catch(I){I("WebGLState:",I)}}function F(){try{i.compressedTexImage3D(...arguments)}catch(I){I("WebGLState:",I)}}function Y(){try{i.texSubImage2D(...arguments)}catch(I){I("WebGLState:",I)}}function $(){try{i.texSubImage3D(...arguments)}catch(I){I("WebGLState:",I)}}function G(){try{i.compressedTexSubImage2D(...arguments)}catch(I){I("WebGLState:",I)}}function ye(){try{i.compressedTexSubImage3D(...arguments)}catch(I){I("WebGLState:",I)}}function ce(){try{i.texStorage2D(...arguments)}catch(I){I("WebGLState:",I)}}function Te(){try{i.texStorage3D(...arguments)}catch(I){I("WebGLState:",I)}}function ve(){try{i.texImage2D(...arguments)}catch(I){I("WebGLState:",I)}}function K(){try{i.texImage3D(...arguments)}catch(I){I("WebGLState:",I)}}function ie(I){Ve.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),Ve.copy(I))}function Pe(I){Ke.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),Ke.copy(I))}function Ee(I,le){let se=c.get(le);se===void 0&&(se=new WeakMap,c.set(le,se));let re=se.get(I);re===void 0&&(re=i.getUniformBlockIndex(le,I.name),se.set(I,re))}function ue(I,le){let re=c.get(le).get(I);l.get(le)!==re&&(i.uniformBlockBinding(le,re,I.__bindingPointIndex),l.set(le,re))}function Ne(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},ne=null,ae={},u={},d=new WeakMap,p=[],x=null,_=!1,m=null,f=null,T=null,M=null,A=null,C=null,S=null,R=new qe(0,0,0),N=0,b=!1,y=null,L=null,O=null,B=null,V=null,Ve.set(0,0,i.canvas.width,i.canvas.height),Ke.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:J,disable:de,bindFramebuffer:Ie,drawBuffers:ge,useProgram:Ce,setBlending:ht,setMaterial:E,setFlipSided:Ge,setCullFace:ke,setLineWidth:ct,setPolygonOffset:xe,setScissorTest:xt,activeTexture:Se,bindTexture:Be,unbindTexture:w,compressedTexImage2D:g,compressedTexImage3D:F,texImage2D:ve,texImage3D:K,updateUBOMapping:Ee,uniformBlockBinding:ue,texStorage2D:ce,texStorage3D:Te,texSubImage2D:Y,texSubImage3D:$,compressedTexSubImage2D:G,compressedTexSubImage3D:ye,scissor:ie,viewport:Pe,reset:Ne}}function zg(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new we,h=new WeakMap,u,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(w,g){return p?new OffscreenCanvas(w,g):dr("canvas")}function _(w,g,F){let Y=1,$=Be(w);if(($.width>F||$.height>F)&&(Y=F/Math.max($.width,$.height)),Y<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){let G=Math.floor(Y*$.width),ye=Math.floor(Y*$.height);u===void 0&&(u=x(G,ye));let ce=g?x(G,ye):u;return ce.width=G,ce.height=ye,ce.getContext("2d").drawImage(w,0,0,G,ye),Ue("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+G+"x"+ye+")."),ce}else return"data"in w&&Ue("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),w;return w}function m(w){return w.generateMipmaps}function f(w){i.generateMipmap(w)}function T(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function M(w,g,F,Y,$=!1){if(w!==null){if(i[w]!==void 0)return i[w];Ue("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let G=g;if(g===i.RED&&(F===i.FLOAT&&(G=i.R32F),F===i.HALF_FLOAT&&(G=i.R16F),F===i.UNSIGNED_BYTE&&(G=i.R8)),g===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(G=i.R8UI),F===i.UNSIGNED_SHORT&&(G=i.R16UI),F===i.UNSIGNED_INT&&(G=i.R32UI),F===i.BYTE&&(G=i.R8I),F===i.SHORT&&(G=i.R16I),F===i.INT&&(G=i.R32I)),g===i.RG&&(F===i.FLOAT&&(G=i.RG32F),F===i.HALF_FLOAT&&(G=i.RG16F),F===i.UNSIGNED_BYTE&&(G=i.RG8)),g===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(G=i.RG8UI),F===i.UNSIGNED_SHORT&&(G=i.RG16UI),F===i.UNSIGNED_INT&&(G=i.RG32UI),F===i.BYTE&&(G=i.RG8I),F===i.SHORT&&(G=i.RG16I),F===i.INT&&(G=i.RG32I)),g===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(G=i.RGB8UI),F===i.UNSIGNED_SHORT&&(G=i.RGB16UI),F===i.UNSIGNED_INT&&(G=i.RGB32UI),F===i.BYTE&&(G=i.RGB8I),F===i.SHORT&&(G=i.RGB16I),F===i.INT&&(G=i.RGB32I)),g===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(G=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(G=i.RGBA16UI),F===i.UNSIGNED_INT&&(G=i.RGBA32UI),F===i.BYTE&&(G=i.RGBA8I),F===i.SHORT&&(G=i.RGBA16I),F===i.INT&&(G=i.RGBA32I)),g===i.RGB&&(F===i.UNSIGNED_INT_5_9_9_9_REV&&(G=i.RGB9_E5),F===i.UNSIGNED_INT_10F_11F_11F_REV&&(G=i.R11F_G11F_B10F)),g===i.RGBA){let ye=$?hr:Qe.getTransfer(Y);F===i.FLOAT&&(G=i.RGBA32F),F===i.HALF_FLOAT&&(G=i.RGBA16F),F===i.UNSIGNED_BYTE&&(G=ye===nt?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(G=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(G=i.RGB5_A1)}return(G===i.R16F||G===i.R32F||G===i.RG16F||G===i.RG32F||G===i.RGBA16F||G===i.RGBA32F)&&e.get("EXT_color_buffer_float"),G}function A(w,g){let F;return w?g===null||g===wi||g===Vs?F=i.DEPTH24_STENCIL8:g===Wn?F=i.DEPTH32F_STENCIL8:g===ks&&(F=i.DEPTH24_STENCIL8,Ue("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):g===null||g===wi||g===Vs?F=i.DEPTH_COMPONENT24:g===Wn?F=i.DEPTH_COMPONENT32F:g===ks&&(F=i.DEPTH_COMPONENT16),F}function C(w,g){return m(w)===!0||w.isFramebufferTexture&&w.minFilter!==en&&w.minFilter!==pn?Math.log2(Math.max(g.width,g.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?g.mipmaps.length:1}function S(w){let g=w.target;g.removeEventListener("dispose",S),N(g),g.isVideoTexture&&h.delete(g)}function R(w){let g=w.target;g.removeEventListener("dispose",R),y(g)}function N(w){let g=n.get(w);if(g.__webglInit===void 0)return;let F=w.source,Y=d.get(F);if(Y){let $=Y[g.__cacheKey];$.usedTimes--,$.usedTimes===0&&b(w),Object.keys(Y).length===0&&d.delete(F)}n.remove(w)}function b(w){let g=n.get(w);i.deleteTexture(g.__webglTexture);let F=w.source,Y=d.get(F);delete Y[g.__cacheKey],a.memory.textures--}function y(w){let g=n.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),n.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(g.__webglFramebuffer[Y]))for(let $=0;$<g.__webglFramebuffer[Y].length;$++)i.deleteFramebuffer(g.__webglFramebuffer[Y][$]);else i.deleteFramebuffer(g.__webglFramebuffer[Y]);g.__webglDepthbuffer&&i.deleteRenderbuffer(g.__webglDepthbuffer[Y])}else{if(Array.isArray(g.__webglFramebuffer))for(let Y=0;Y<g.__webglFramebuffer.length;Y++)i.deleteFramebuffer(g.__webglFramebuffer[Y]);else i.deleteFramebuffer(g.__webglFramebuffer);if(g.__webglDepthbuffer&&i.deleteRenderbuffer(g.__webglDepthbuffer),g.__webglMultisampledFramebuffer&&i.deleteFramebuffer(g.__webglMultisampledFramebuffer),g.__webglColorRenderbuffer)for(let Y=0;Y<g.__webglColorRenderbuffer.length;Y++)g.__webglColorRenderbuffer[Y]&&i.deleteRenderbuffer(g.__webglColorRenderbuffer[Y]);g.__webglDepthRenderbuffer&&i.deleteRenderbuffer(g.__webglDepthRenderbuffer)}let F=w.textures;for(let Y=0,$=F.length;Y<$;Y++){let G=n.get(F[Y]);G.__webglTexture&&(i.deleteTexture(G.__webglTexture),a.memory.textures--),n.remove(F[Y])}n.remove(w)}let L=0;function O(){L=0}function B(){let w=L;return w>=s.maxTextures&&Ue("WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+s.maxTextures),L+=1,w}function V(w){let g=[];return g.push(w.wrapS),g.push(w.wrapT),g.push(w.wrapR||0),g.push(w.magFilter),g.push(w.minFilter),g.push(w.anisotropy),g.push(w.internalFormat),g.push(w.format),g.push(w.type),g.push(w.generateMipmaps),g.push(w.premultiplyAlpha),g.push(w.flipY),g.push(w.unpackAlignment),g.push(w.colorSpace),g.join()}function W(w,g){let F=n.get(w);if(w.isVideoTexture&&xt(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&F.__version!==w.version){let Y=w.image;if(Y===null)Ue("WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)Ue("WebGLRenderer: Texture marked for update but image is incomplete");else{q(F,w,g);return}}else w.isExternalTexture&&(F.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+g)}function X(w,g){let F=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&F.__version!==w.version){q(F,w,g);return}else w.isExternalTexture&&(F.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+g)}function te(w,g){let F=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&F.__version!==w.version){q(F,w,g);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+g)}function H(w,g){let F=n.get(w);if(w.version>0&&F.__version!==w.version){J(F,w,g);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+g)}let ne={[Ta]:i.REPEAT,[kn]:i.CLAMP_TO_EDGE,[As]:i.MIRRORED_REPEAT},ae={[en]:i.NEAREST,[Lu]:i.NEAREST_MIPMAP_NEAREST,[Ur]:i.NEAREST_MIPMAP_LINEAR,[pn]:i.LINEAR,[lo]:i.LINEAR_MIPMAP_NEAREST,[Si]:i.LINEAR_MIPMAP_LINEAR},be={[Fu]:i.NEVER,[Gu]:i.ALWAYS,[Ou]:i.LESS,[Al]:i.LEQUAL,[Bu]:i.EQUAL,[Vu]:i.GEQUAL,[zu]:i.GREATER,[ku]:i.NOTEQUAL};function _e(w,g){if(g.type===Wn&&e.has("OES_texture_float_linear")===!1&&(g.magFilter===pn||g.magFilter===lo||g.magFilter===Ur||g.magFilter===Si||g.minFilter===pn||g.minFilter===lo||g.minFilter===Ur||g.minFilter===Si)&&Ue("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,ne[g.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,ne[g.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,ne[g.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,ae[g.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,ae[g.minFilter]),g.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,be[g.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(g.magFilter===en||g.minFilter!==Ur&&g.minFilter!==Si||g.type===Wn&&e.has("OES_texture_float_linear")===!1)return;if(g.anisotropy>1||n.get(g).__currentAnisotropy){let F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(w,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(g.anisotropy,s.getMaxAnisotropy())),n.get(g).__currentAnisotropy=g.anisotropy}}}function Ve(w,g){let F=!1;w.__webglInit===void 0&&(w.__webglInit=!0,g.addEventListener("dispose",S));let Y=g.source,$=d.get(Y);$===void 0&&($={},d.set(Y,$));let G=V(g);if(G!==w.__cacheKey){$[G]===void 0&&($[G]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,F=!0),$[G].usedTimes++;let ye=$[w.__cacheKey];ye!==void 0&&($[w.__cacheKey].usedTimes--,ye.usedTimes===0&&b(g)),w.__cacheKey=G,w.__webglTexture=$[G].texture}return F}function Ke(w,g,F){return Math.floor(Math.floor(w/F)/g)}function it(w,g,F,Y){let G=w.updateRanges;if(G.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,g.width,g.height,F,Y,g.data);else{G.sort((K,ie)=>K.start-ie.start);let ye=0;for(let K=1;K<G.length;K++){let ie=G[ye],Pe=G[K],Ee=ie.start+ie.count,ue=Ke(Pe.start,g.width,4),Ne=Ke(ie.start,g.width,4);Pe.start<=Ee+1&&ue===Ne&&Ke(Pe.start+Pe.count-1,g.width,4)===ue?ie.count=Math.max(ie.count,Pe.start+Pe.count-ie.start):(++ye,G[ye]=Pe)}G.length=ye+1;let ce=i.getParameter(i.UNPACK_ROW_LENGTH),Te=i.getParameter(i.UNPACK_SKIP_PIXELS),ve=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,g.width);for(let K=0,ie=G.length;K<ie;K++){let Pe=G[K],Ee=Math.floor(Pe.start/4),ue=Math.ceil(Pe.count/4),Ne=Ee%g.width,I=Math.floor(Ee/g.width),le=ue,se=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ne),i.pixelStorei(i.UNPACK_SKIP_ROWS,I),t.texSubImage2D(i.TEXTURE_2D,0,Ne,I,le,se,F,Y,g.data)}w.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,ce),i.pixelStorei(i.UNPACK_SKIP_PIXELS,Te),i.pixelStorei(i.UNPACK_SKIP_ROWS,ve)}}function q(w,g,F){let Y=i.TEXTURE_2D;(g.isDataArrayTexture||g.isCompressedArrayTexture)&&(Y=i.TEXTURE_2D_ARRAY),g.isData3DTexture&&(Y=i.TEXTURE_3D);let $=Ve(w,g),G=g.source;t.bindTexture(Y,w.__webglTexture,i.TEXTURE0+F);let ye=n.get(G);if(G.version!==ye.__version||$===!0){t.activeTexture(i.TEXTURE0+F);let ce=Qe.getPrimaries(Qe.workingColorSpace),Te=g.colorSpace===ai?null:Qe.getPrimaries(g.colorSpace),ve=g.colorSpace===ai||ce===Te?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,g.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,g.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve);let K=_(g.image,!1,s.maxTextureSize);K=Se(g,K);let ie=r.convert(g.format,g.colorSpace),Pe=r.convert(g.type),Ee=M(g.internalFormat,ie,Pe,g.colorSpace,g.isVideoTexture);_e(Y,g);let ue,Ne=g.mipmaps,I=g.isVideoTexture!==!0,le=ye.__version===void 0||$===!0,se=G.dataReady,re=C(g,K);if(g.isDepthTexture)Ee=A(g.format===Gs,g.type),le&&(I?t.texStorage2D(i.TEXTURE_2D,1,Ee,K.width,K.height):t.texImage2D(i.TEXTURE_2D,0,Ee,K.width,K.height,0,ie,Pe,null));else if(g.isDataTexture)if(Ne.length>0){I&&le&&t.texStorage2D(i.TEXTURE_2D,re,Ee,Ne[0].width,Ne[0].height);for(let Q=0,Z=Ne.length;Q<Z;Q++)ue=Ne[Q],I?se&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,ue.width,ue.height,ie,Pe,ue.data):t.texImage2D(i.TEXTURE_2D,Q,Ee,ue.width,ue.height,0,ie,Pe,ue.data);g.generateMipmaps=!1}else I?(le&&t.texStorage2D(i.TEXTURE_2D,re,Ee,K.width,K.height),se&&it(g,K,ie,Pe)):t.texImage2D(i.TEXTURE_2D,0,Ee,K.width,K.height,0,ie,Pe,K.data);else if(g.isCompressedTexture)if(g.isCompressedArrayTexture){I&&le&&t.texStorage3D(i.TEXTURE_2D_ARRAY,re,Ee,Ne[0].width,Ne[0].height,K.depth);for(let Q=0,Z=Ne.length;Q<Z;Q++)if(ue=Ne[Q],g.format!==Mn)if(ie!==null)if(I){if(se)if(g.layerUpdates.size>0){let pe=Nl(ue.width,ue.height,g.format,g.type);for(let Oe of g.layerUpdates){let ut=ue.data.subarray(Oe*pe/ue.data.BYTES_PER_ELEMENT,(Oe+1)*pe/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,Oe,ue.width,ue.height,1,ie,ut)}g.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,K.depth,ie,ue.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,Ee,ue.width,ue.height,K.depth,0,ue.data,0,0);else Ue("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else I?se&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,K.depth,ie,Pe,ue.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Q,Ee,ue.width,ue.height,K.depth,0,ie,Pe,ue.data)}else{I&&le&&t.texStorage2D(i.TEXTURE_2D,re,Ee,Ne[0].width,Ne[0].height);for(let Q=0,Z=Ne.length;Q<Z;Q++)ue=Ne[Q],g.format!==Mn?ie!==null?I?se&&t.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,ue.width,ue.height,ie,ue.data):t.compressedTexImage2D(i.TEXTURE_2D,Q,Ee,ue.width,ue.height,0,ue.data):Ue("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):I?se&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,ue.width,ue.height,ie,Pe,ue.data):t.texImage2D(i.TEXTURE_2D,Q,Ee,ue.width,ue.height,0,ie,Pe,ue.data)}else if(g.isDataArrayTexture)if(I){if(le&&t.texStorage3D(i.TEXTURE_2D_ARRAY,re,Ee,K.width,K.height,K.depth),se)if(g.layerUpdates.size>0){let Q=Nl(K.width,K.height,g.format,g.type);for(let Z of g.layerUpdates){let pe=K.data.subarray(Z*Q/K.data.BYTES_PER_ELEMENT,(Z+1)*Q/K.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Z,K.width,K.height,1,ie,Pe,pe)}g.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,ie,Pe,K.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ee,K.width,K.height,K.depth,0,ie,Pe,K.data);else if(g.isData3DTexture)I?(le&&t.texStorage3D(i.TEXTURE_3D,re,Ee,K.width,K.height,K.depth),se&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,ie,Pe,K.data)):t.texImage3D(i.TEXTURE_3D,0,Ee,K.width,K.height,K.depth,0,ie,Pe,K.data);else if(g.isFramebufferTexture){if(le)if(I)t.texStorage2D(i.TEXTURE_2D,re,Ee,K.width,K.height);else{let Q=K.width,Z=K.height;for(let pe=0;pe<re;pe++)t.texImage2D(i.TEXTURE_2D,pe,Ee,Q,Z,0,ie,Pe,null),Q>>=1,Z>>=1}}else if(Ne.length>0){if(I&&le){let Q=Be(Ne[0]);t.texStorage2D(i.TEXTURE_2D,re,Ee,Q.width,Q.height)}for(let Q=0,Z=Ne.length;Q<Z;Q++)ue=Ne[Q],I?se&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,ie,Pe,ue):t.texImage2D(i.TEXTURE_2D,Q,Ee,ie,Pe,ue);g.generateMipmaps=!1}else if(I){if(le){let Q=Be(K);t.texStorage2D(i.TEXTURE_2D,re,Ee,Q.width,Q.height)}se&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ie,Pe,K)}else t.texImage2D(i.TEXTURE_2D,0,Ee,ie,Pe,K);m(g)&&f(Y),ye.__version=G.version,g.onUpdate&&g.onUpdate(g)}w.__version=g.version}function J(w,g,F){if(g.image.length!==6)return;let Y=Ve(w,g),$=g.source;t.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+F);let G=n.get($);if($.version!==G.__version||Y===!0){t.activeTexture(i.TEXTURE0+F);let ye=Qe.getPrimaries(Qe.workingColorSpace),ce=g.colorSpace===ai?null:Qe.getPrimaries(g.colorSpace),Te=g.colorSpace===ai||ye===ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,g.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,g.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);let ve=g.isCompressedTexture||g.image[0].isCompressedTexture,K=g.image[0]&&g.image[0].isDataTexture,ie=[];for(let Z=0;Z<6;Z++)!ve&&!K?ie[Z]=_(g.image[Z],!0,s.maxCubemapSize):ie[Z]=K?g.image[Z].image:g.image[Z],ie[Z]=Se(g,ie[Z]);let Pe=ie[0],Ee=r.convert(g.format,g.colorSpace),ue=r.convert(g.type),Ne=M(g.internalFormat,Ee,ue,g.colorSpace),I=g.isVideoTexture!==!0,le=G.__version===void 0||Y===!0,se=$.dataReady,re=C(g,Pe);_e(i.TEXTURE_CUBE_MAP,g);let Q;if(ve){I&&le&&t.texStorage2D(i.TEXTURE_CUBE_MAP,re,Ne,Pe.width,Pe.height);for(let Z=0;Z<6;Z++){Q=ie[Z].mipmaps;for(let pe=0;pe<Q.length;pe++){let Oe=Q[pe];g.format!==Mn?Ee!==null?I?se&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pe,0,0,Oe.width,Oe.height,Ee,Oe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pe,Ne,Oe.width,Oe.height,0,Oe.data):Ue("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pe,0,0,Oe.width,Oe.height,Ee,ue,Oe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pe,Ne,Oe.width,Oe.height,0,Ee,ue,Oe.data)}}}else{if(Q=g.mipmaps,I&&le){Q.length>0&&re++;let Z=Be(ie[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,re,Ne,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(K){I?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,ie[Z].width,ie[Z].height,Ee,ue,ie[Z].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Ne,ie[Z].width,ie[Z].height,0,Ee,ue,ie[Z].data);for(let pe=0;pe<Q.length;pe++){let ut=Q[pe].image[Z].image;I?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pe+1,0,0,ut.width,ut.height,Ee,ue,ut.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pe+1,Ne,ut.width,ut.height,0,Ee,ue,ut.data)}}else{I?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Ee,ue,ie[Z]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Ne,Ee,ue,ie[Z]);for(let pe=0;pe<Q.length;pe++){let Oe=Q[pe];I?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pe+1,0,0,Ee,ue,Oe.image[Z]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pe+1,Ne,Ee,ue,Oe.image[Z])}}}m(g)&&f(i.TEXTURE_CUBE_MAP),G.__version=$.version,g.onUpdate&&g.onUpdate(g)}w.__version=g.version}function de(w,g,F,Y,$,G){let ye=r.convert(F.format,F.colorSpace),ce=r.convert(F.type),Te=M(F.internalFormat,ye,ce,F.colorSpace),ve=n.get(g),K=n.get(F);if(K.__renderTarget=g,!ve.__hasExternalTextures){let ie=Math.max(1,g.width>>G),Pe=Math.max(1,g.height>>G);$===i.TEXTURE_3D||$===i.TEXTURE_2D_ARRAY?t.texImage3D($,G,Te,ie,Pe,g.depth,0,ye,ce,null):t.texImage2D($,G,Te,ie,Pe,0,ye,ce,null)}t.bindFramebuffer(i.FRAMEBUFFER,w),xe(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Y,$,K.__webglTexture,0,ct(g)):($===i.TEXTURE_2D||$>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Y,$,K.__webglTexture,G),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ie(w,g,F){if(i.bindRenderbuffer(i.RENDERBUFFER,w),g.depthBuffer){let Y=g.depthTexture,$=Y&&Y.isDepthTexture?Y.type:null,G=A(g.stencilBuffer,$),ye=g.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=ct(g);xe(g)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ce,G,g.width,g.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ce,G,g.width,g.height):i.renderbufferStorage(i.RENDERBUFFER,G,g.width,g.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ye,i.RENDERBUFFER,w)}else{let Y=g.textures;for(let $=0;$<Y.length;$++){let G=Y[$],ye=r.convert(G.format,G.colorSpace),ce=r.convert(G.type),Te=M(G.internalFormat,ye,ce,G.colorSpace),ve=ct(g);F&&xe(g)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ve,Te,g.width,g.height):xe(g)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ve,Te,g.width,g.height):i.renderbufferStorage(i.RENDERBUFFER,Te,g.width,g.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ge(w,g){if(g&&g.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,w),!(g.depthTexture&&g.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let Y=n.get(g.depthTexture);Y.__renderTarget=g,(!Y.__webglTexture||g.depthTexture.image.width!==g.width||g.depthTexture.image.height!==g.height)&&(g.depthTexture.image.width=g.width,g.depthTexture.image.height=g.height,g.depthTexture.needsUpdate=!0),W(g.depthTexture,0);let $=Y.__webglTexture,G=ct(g);if(g.depthTexture.format===Es)xe(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,$,0,G):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,$,0);else if(g.depthTexture.format===Gs)xe(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,$,0,G):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,$,0);else throw new Error("Unknown depthTexture format")}function Ce(w){let g=n.get(w),F=w.isWebGLCubeRenderTarget===!0;if(g.__boundDepthTexture!==w.depthTexture){let Y=w.depthTexture;if(g.__depthDisposeCallback&&g.__depthDisposeCallback(),Y){let $=()=>{delete g.__boundDepthTexture,delete g.__depthDisposeCallback,Y.removeEventListener("dispose",$)};Y.addEventListener("dispose",$),g.__depthDisposeCallback=$}g.__boundDepthTexture=Y}if(w.depthTexture&&!g.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");let Y=w.texture.mipmaps;Y&&Y.length>0?ge(g.__webglFramebuffer[0],w):ge(g.__webglFramebuffer,w)}else if(F){g.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(t.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer[Y]),g.__webglDepthbuffer[Y]===void 0)g.__webglDepthbuffer[Y]=i.createRenderbuffer(),Ie(g.__webglDepthbuffer[Y],w,!1);else{let $=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,G=g.__webglDepthbuffer[Y];i.bindRenderbuffer(i.RENDERBUFFER,G),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,G)}}else{let Y=w.texture.mipmaps;if(Y&&Y.length>0?t.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer),g.__webglDepthbuffer===void 0)g.__webglDepthbuffer=i.createRenderbuffer(),Ie(g.__webglDepthbuffer,w,!1);else{let $=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,G=g.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,G),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,G)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Tt(w,g,F){let Y=n.get(w);g!==void 0&&de(Y.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Ce(w)}function Fe(w){let g=w.texture,F=n.get(w),Y=n.get(g);w.addEventListener("dispose",R);let $=w.textures,G=w.isWebGLCubeRenderTarget===!0,ye=$.length>1;if(ye||(Y.__webglTexture===void 0&&(Y.__webglTexture=i.createTexture()),Y.__version=g.version,a.memory.textures++),G){F.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(g.mipmaps&&g.mipmaps.length>0){F.__webglFramebuffer[ce]=[];for(let Te=0;Te<g.mipmaps.length;Te++)F.__webglFramebuffer[ce][Te]=i.createFramebuffer()}else F.__webglFramebuffer[ce]=i.createFramebuffer()}else{if(g.mipmaps&&g.mipmaps.length>0){F.__webglFramebuffer=[];for(let ce=0;ce<g.mipmaps.length;ce++)F.__webglFramebuffer[ce]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(ye)for(let ce=0,Te=$.length;ce<Te;ce++){let ve=n.get($[ce]);ve.__webglTexture===void 0&&(ve.__webglTexture=i.createTexture(),a.memory.textures++)}if(w.samples>0&&xe(w)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let ce=0;ce<$.length;ce++){let Te=$[ce];F.__webglColorRenderbuffer[ce]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[ce]);let ve=r.convert(Te.format,Te.colorSpace),K=r.convert(Te.type),ie=M(Te.internalFormat,ve,K,Te.colorSpace,w.isXRRenderTarget===!0),Pe=ct(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,Pe,ie,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,F.__webglColorRenderbuffer[ce])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),Ie(F.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(G){t.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),_e(i.TEXTURE_CUBE_MAP,g);for(let ce=0;ce<6;ce++)if(g.mipmaps&&g.mipmaps.length>0)for(let Te=0;Te<g.mipmaps.length;Te++)de(F.__webglFramebuffer[ce][Te],w,g,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Te);else de(F.__webglFramebuffer[ce],w,g,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);m(g)&&f(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ye){for(let ce=0,Te=$.length;ce<Te;ce++){let ve=$[ce],K=n.get(ve),ie=i.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(ie=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ie,K.__webglTexture),_e(ie,ve),de(F.__webglFramebuffer,w,ve,i.COLOR_ATTACHMENT0+ce,ie,0),m(ve)&&f(ie)}t.unbindTexture()}else{let ce=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(ce=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ce,Y.__webglTexture),_e(ce,g),g.mipmaps&&g.mipmaps.length>0)for(let Te=0;Te<g.mipmaps.length;Te++)de(F.__webglFramebuffer[Te],w,g,i.COLOR_ATTACHMENT0,ce,Te);else de(F.__webglFramebuffer,w,g,i.COLOR_ATTACHMENT0,ce,0);m(g)&&f(ce),t.unbindTexture()}w.depthBuffer&&Ce(w)}function ht(w){let g=w.textures;for(let F=0,Y=g.length;F<Y;F++){let $=g[F];if(m($)){let G=T(w),ye=n.get($).__webglTexture;t.bindTexture(G,ye),f(G),t.unbindTexture()}}}let E=[],Ge=[];function ke(w){if(w.samples>0){if(xe(w)===!1){let g=w.textures,F=w.width,Y=w.height,$=i.COLOR_BUFFER_BIT,G=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ye=n.get(w),ce=g.length>1;if(ce)for(let ve=0;ve<g.length;ve++)t.bindFramebuffer(i.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ve,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ye.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ve,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ye.__webglMultisampledFramebuffer);let Te=w.texture.mipmaps;Te&&Te.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ye.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ye.__webglFramebuffer);for(let ve=0;ve<g.length;ve++){if(w.resolveDepthBuffer&&(w.depthBuffer&&($|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&($|=i.STENCIL_BUFFER_BIT)),ce){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ye.__webglColorRenderbuffer[ve]);let K=n.get(g[ve]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,K,0)}i.blitFramebuffer(0,0,F,Y,0,0,F,Y,$,i.NEAREST),l===!0&&(E.length=0,Ge.length=0,E.push(i.COLOR_ATTACHMENT0+ve),w.depthBuffer&&w.resolveDepthBuffer===!1&&(E.push(G),Ge.push(G),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Ge)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,E))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ce)for(let ve=0;ve<g.length;ve++){t.bindFramebuffer(i.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ve,i.RENDERBUFFER,ye.__webglColorRenderbuffer[ve]);let K=n.get(g[ve]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ye.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ve,i.TEXTURE_2D,K,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ye.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.resolveDepthBuffer===!1&&l){let g=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[g])}}}function ct(w){return Math.min(s.maxSamples,w.samples)}function xe(w){let g=n.get(w);return w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&g.__useRenderToTexture!==!1}function xt(w){let g=a.render.frame;h.get(w)!==g&&(h.set(w,g),w.update())}function Se(w,g){let F=w.colorSpace,Y=w.format,$=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||F!==Wi&&F!==ai&&(Qe.getTransfer(F)===nt?(Y!==Mn||$!==Fn)&&Ue("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):We("WebGLTextures: Unsupported texture color space:",F)),g}function Be(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=O,this.setTexture2D=W,this.setTexture2DArray=X,this.setTexture3D=te,this.setTextureCube=H,this.rebindTextures=Tt,this.setupRenderTarget=Fe,this.updateRenderTargetMipmap=ht,this.updateMultisampleRenderTarget=ke,this.setupDepthRenderbuffer=Ce,this.setupFrameBufferTexture=de,this.useMultisampledRTT=xe}function kg(i,e){function t(n,s=ai){let r,a=Qe.getTransfer(s);if(n===Fn)return i.UNSIGNED_BYTE;if(n===uo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===fo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===yl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===bl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===_l)return i.BYTE;if(n===vl)return i.SHORT;if(n===ks)return i.UNSIGNED_SHORT;if(n===ho)return i.INT;if(n===wi)return i.UNSIGNED_INT;if(n===Wn)return i.FLOAT;if(n===Ji)return i.HALF_FLOAT;if(n===Ml)return i.ALPHA;if(n===Sl)return i.RGB;if(n===Mn)return i.RGBA;if(n===Es)return i.DEPTH_COMPONENT;if(n===Gs)return i.DEPTH_STENCIL;if(n===wl)return i.RED;if(n===po)return i.RED_INTEGER;if(n===mo)return i.RG;if(n===xo)return i.RG_INTEGER;if(n===go)return i.RGBA_INTEGER;if(n===Nr||n===Fr||n===Or||n===Br)if(a===nt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Nr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Fr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Or)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Nr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Fr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Or)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===_o||n===vo||n===yo||n===bo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===_o)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===vo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===yo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===bo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Mo||n===So||n===wo)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Mo||n===So)return a===nt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===wo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===To||n===Ao||n===Eo||n===Co||n===Ro||n===Io||n===Po||n===Lo||n===Do||n===Uo||n===No||n===Fo||n===Oo||n===Bo)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===To)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ao)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Eo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Co)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ro)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Io)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Po)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Lo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Do)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Uo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===No)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Fo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Oo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Bo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===zo||n===ko||n===Vo)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===zo)return a===nt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ko)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Vo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Go||n===Ho||n===Wo||n===Xo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Go)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ho)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Wo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Xo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Vs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Vg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Gg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Yl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new br(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new _n({vertexShader:Vg,fragmentShader:Gg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new qt(new tn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Zl=class extends ii{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,p=null,x=null,_=typeof XRWebGLBinding<"u",m=new Yl,f={},T=t.getContextAttributes(),M=null,A=null,C=[],S=[],R=new we,N=null,b=new Gt;b.viewport=new tt;let y=new Gt;y.viewport=new tt;let L=[b,y],O=new Qa,B=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let J=C[q];return J===void 0&&(J=new Us,C[q]=J),J.getTargetRaySpace()},this.getControllerGrip=function(q){let J=C[q];return J===void 0&&(J=new Us,C[q]=J),J.getGripSpace()},this.getHand=function(q){let J=C[q];return J===void 0&&(J=new Us,C[q]=J),J.getHandSpace()};function W(q){let J=S.indexOf(q.inputSource);if(J===-1)return;let de=C[J];de!==void 0&&(de.update(q.inputSource,q.frame,c||a),de.dispatchEvent({type:q.type,data:q.inputSource}))}function X(){s.removeEventListener("select",W),s.removeEventListener("selectstart",W),s.removeEventListener("selectend",W),s.removeEventListener("squeeze",W),s.removeEventListener("squeezestart",W),s.removeEventListener("squeezeend",W),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",te);for(let q=0;q<C.length;q++){let J=S[q];J!==null&&(S[q]=null,C[q].disconnect(J))}B=null,V=null,m.reset();for(let q in f)delete f[q];e.setRenderTarget(M),p=null,d=null,u=null,s=null,A=null,it.stop(),n.isPresenting=!1,e.setPixelRatio(N),e.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&Ue("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&Ue("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return x},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(M=e.getRenderTarget(),s.addEventListener("select",W),s.addEventListener("selectstart",W),s.addEventListener("selectend",W),s.addEventListener("squeeze",W),s.addEventListener("squeezestart",W),s.addEventListener("squeezeend",W),s.addEventListener("end",X),s.addEventListener("inputsourceschange",te),T.xrCompatible!==!0&&await t.makeXRCompatible(),N=e.getPixelRatio(),e.getSize(R),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let de=null,Ie=null,ge=null;T.depth&&(ge=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,de=T.stencil?Gs:Es,Ie=T.stencil?Vs:wi);let Ce={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Ce),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),A=new Vn(d.textureWidth,d.textureHeight,{format:Mn,type:Fn,depthTexture:new yr(d.textureWidth,d.textureHeight,Ie,void 0,void 0,void 0,void 0,void 0,void 0,de),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let de={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,de),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),A=new Vn(p.framebufferWidth,p.framebufferHeight,{format:Mn,type:Fn,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}A.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),it.setContext(s),it.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function te(q){for(let J=0;J<q.removed.length;J++){let de=q.removed[J],Ie=S.indexOf(de);Ie>=0&&(S[Ie]=null,C[Ie].disconnect(de))}for(let J=0;J<q.added.length;J++){let de=q.added[J],Ie=S.indexOf(de);if(Ie===-1){for(let Ce=0;Ce<C.length;Ce++)if(Ce>=S.length){S.push(de),Ie=Ce;break}else if(S[Ce]===null){S[Ce]=de,Ie=Ce;break}if(Ie===-1)break}let ge=C[Ie];ge&&ge.connect(de)}}let H=new P,ne=new P;function ae(q,J,de){H.setFromMatrixPosition(J.matrixWorld),ne.setFromMatrixPosition(de.matrixWorld);let Ie=H.distanceTo(ne),ge=J.projectionMatrix.elements,Ce=de.projectionMatrix.elements,Tt=ge[14]/(ge[10]-1),Fe=ge[14]/(ge[10]+1),ht=(ge[9]+1)/ge[5],E=(ge[9]-1)/ge[5],Ge=(ge[8]-1)/ge[0],ke=(Ce[8]+1)/Ce[0],ct=Tt*Ge,xe=Tt*ke,xt=Ie/(-Ge+ke),Se=xt*-Ge;if(J.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Se),q.translateZ(xt),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),ge[10]===-1)q.projectionMatrix.copy(J.projectionMatrix),q.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{let Be=Tt+xt,w=Fe+xt,g=ct-Se,F=xe+(Ie-Se),Y=ht*Fe/w*Be,$=E*Fe/w*Be;q.projectionMatrix.makePerspective(g,F,Y,$,Be,w),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function be(q,J){J===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(J.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let J=q.near,de=q.far;m.texture!==null&&(m.depthNear>0&&(J=m.depthNear),m.depthFar>0&&(de=m.depthFar)),O.near=y.near=b.near=J,O.far=y.far=b.far=de,(B!==O.near||V!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),B=O.near,V=O.far),O.layers.mask=q.layers.mask|6,b.layers.mask=O.layers.mask&3,y.layers.mask=O.layers.mask&5;let Ie=q.parent,ge=O.cameras;be(O,Ie);for(let Ce=0;Ce<ge.length;Ce++)be(ge[Ce],Ie);ge.length===2?ae(O,b,y):O.projectionMatrix.copy(b.projectionMatrix),_e(q,O,Ie)};function _e(q,J,de){de===null?q.matrix.copy(J.matrixWorld):(q.matrix.copy(de.matrixWorld),q.matrix.invert(),q.matrix.multiply(J.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(J.projectionMatrix),q.projectionMatrixInverse.copy(J.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Is*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=q)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(q){return f[q]};let Ve=null;function Ke(q,J){if(h=J.getViewerPose(c||a),x=J,h!==null){let de=h.views;p!==null&&(e.setRenderTargetFramebuffer(A,p.framebuffer),e.setRenderTarget(A));let Ie=!1;de.length!==O.cameras.length&&(O.cameras.length=0,Ie=!0);for(let Fe=0;Fe<de.length;Fe++){let ht=de[Fe],E=null;if(p!==null)E=p.getViewport(ht);else{let ke=u.getViewSubImage(d,ht);E=ke.viewport,Fe===0&&(e.setRenderTargetTextures(A,ke.colorTexture,ke.depthStencilTexture),e.setRenderTarget(A))}let Ge=L[Fe];Ge===void 0&&(Ge=new Gt,Ge.layers.enable(Fe),Ge.viewport=new tt,L[Fe]=Ge),Ge.matrix.fromArray(ht.transform.matrix),Ge.matrix.decompose(Ge.position,Ge.quaternion,Ge.scale),Ge.projectionMatrix.fromArray(ht.projectionMatrix),Ge.projectionMatrixInverse.copy(Ge.projectionMatrix).invert(),Ge.viewport.set(E.x,E.y,E.width,E.height),Fe===0&&(O.matrix.copy(Ge.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),Ie===!0&&O.cameras.push(Ge)}let ge=s.enabledFeatures;if(ge&&ge.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=n.getBinding();let Fe=u.getDepthInformation(de[0]);Fe&&Fe.isValid&&Fe.texture&&m.init(Fe,s.renderState)}if(ge&&ge.includes("camera-access")&&_){e.state.unbindTexture(),u=n.getBinding();for(let Fe=0;Fe<de.length;Fe++){let ht=de[Fe].camera;if(ht){let E=f[ht];E||(E=new br,f[ht]=E);let Ge=u.getCameraImage(ht);E.sourceTexture=Ge}}}}for(let de=0;de<C.length;de++){let Ie=S[de],ge=C[de];Ie!==null&&ge!==void 0&&ge.update(Ie,J,c||a)}Ve&&Ve(q,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),x=null}let it=new xd;it.setAnimationLoop(Ke),this.setAnimationLoop=function(q){Ve=q},this.dispose=function(){}}},Qi=new Un,Hg=new ft;function Wg(i,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,Pl(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,T,M,A){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(m,f):f.isMeshToonMaterial?(r(m,f),u(m,f)):f.isMeshPhongMaterial?(r(m,f),h(m,f)):f.isMeshStandardMaterial?(r(m,f),d(m,f),f.isMeshPhysicalMaterial&&p(m,f,A)):f.isMeshMatcapMaterial?(r(m,f),x(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),_(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?l(m,f,T,M):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Yt&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Yt&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let T=e.get(f),M=T.envMap,A=T.envMapRotation;M&&(m.envMap.value=M,Qi.copy(A),Qi.x*=-1,Qi.y*=-1,Qi.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Qi.y*=-1,Qi.z*=-1),m.envMapRotation.value.setFromMatrix4(Hg.makeRotationFromEuler(Qi)),m.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,T,M){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*T,m.scale.value=M*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function u(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function d(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,T){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Yt&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=T.texture,m.transmissionSamplerSize.value.set(T.width,T.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function x(m,f){f.matcap&&(m.matcap.value=f.matcap)}function _(m,f){let T=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(T.matrixWorld),m.nearDistance.value=T.shadow.camera.near,m.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Xg(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(T,M){let A=M.program;n.uniformBlockBinding(T,A)}function c(T,M){let A=s[T.id];A===void 0&&(x(T),A=h(T),s[T.id]=A,T.addEventListener("dispose",m));let C=M.program;n.updateUBOMapping(T,C);let S=e.render.frame;r[T.id]!==S&&(d(T),r[T.id]=S)}function h(T){let M=u();T.__bindingPointIndex=M;let A=i.createBuffer(),C=T.__size,S=T.usage;return i.bindBuffer(i.UNIFORM_BUFFER,A),i.bufferData(i.UNIFORM_BUFFER,C,S),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,A),A}function u(){for(let T=0;T<o;T++)if(a.indexOf(T)===-1)return a.push(T),T;return We("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(T){let M=s[T.id],A=T.uniforms,C=T.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let S=0,R=A.length;S<R;S++){let N=Array.isArray(A[S])?A[S]:[A[S]];for(let b=0,y=N.length;b<y;b++){let L=N[b];if(p(L,S,b,C)===!0){let O=L.__offset,B=Array.isArray(L.value)?L.value:[L.value],V=0;for(let W=0;W<B.length;W++){let X=B[W],te=_(X);typeof X=="number"||typeof X=="boolean"?(L.__data[0]=X,i.bufferSubData(i.UNIFORM_BUFFER,O+V,L.__data)):X.isMatrix3?(L.__data[0]=X.elements[0],L.__data[1]=X.elements[1],L.__data[2]=X.elements[2],L.__data[3]=0,L.__data[4]=X.elements[3],L.__data[5]=X.elements[4],L.__data[6]=X.elements[5],L.__data[7]=0,L.__data[8]=X.elements[6],L.__data[9]=X.elements[7],L.__data[10]=X.elements[8],L.__data[11]=0):(X.toArray(L.__data,V),V+=te.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,O,L.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(T,M,A,C){let S=T.value,R=M+"_"+A;if(C[R]===void 0)return typeof S=="number"||typeof S=="boolean"?C[R]=S:C[R]=S.clone(),!0;{let N=C[R];if(typeof S=="number"||typeof S=="boolean"){if(N!==S)return C[R]=S,!0}else if(N.equals(S)===!1)return N.copy(S),!0}return!1}function x(T){let M=T.uniforms,A=0,C=16;for(let R=0,N=M.length;R<N;R++){let b=Array.isArray(M[R])?M[R]:[M[R]];for(let y=0,L=b.length;y<L;y++){let O=b[y],B=Array.isArray(O.value)?O.value:[O.value];for(let V=0,W=B.length;V<W;V++){let X=B[V],te=_(X),H=A%C,ne=H%te.boundary,ae=H+ne;A+=ne,ae!==0&&C-ae<te.storage&&(A+=C-ae),O.__data=new Float32Array(te.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=A,A+=te.storage}}}let S=A%C;return S>0&&(A+=C-S),T.__size=A,T.__cache={},this}function _(T){let M={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(M.boundary=4,M.storage=4):T.isVector2?(M.boundary=8,M.storage=8):T.isVector3||T.isColor?(M.boundary=16,M.storage=12):T.isVector4?(M.boundary=16,M.storage=16):T.isMatrix3?(M.boundary=48,M.storage=48):T.isMatrix4?(M.boundary=64,M.storage=64):T.isTexture?Ue("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Ue("WebGLRenderer: Unsupported uniform value type.",T),M}function m(T){let M=T.target;M.removeEventListener("dispose",m);let A=a.indexOf(M.__bindingPointIndex);a.splice(A,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function f(){for(let T in s)i.deleteBuffer(s[T]);a=[],s={},r={}}return{bind:l,update:c,dispose:f}}var qg=new Uint16Array([11481,15204,11534,15171,11808,15015,12385,14843,12894,14716,13396,14600,13693,14483,13976,14366,14237,14171,14405,13961,14511,13770,14605,13598,14687,13444,14760,13305,14822,13066,14876,12857,14923,12675,14963,12517,14997,12379,15025,12230,15049,12023,15070,11843,15086,11687,15100,11551,15111,11433,15120,11330,15127,11217,15132,11060,15135,10922,15138,10801,15139,10695,15139,10600,13012,14923,13020,14917,13064,14886,13176,14800,13349,14666,13513,14526,13724,14398,13960,14230,14200,14020,14383,13827,14488,13651,14583,13491,14667,13348,14740,13132,14803,12908,14856,12713,14901,12542,14938,12394,14968,12241,14992,12017,15010,11822,15024,11654,15034,11507,15041,11380,15044,11269,15044,11081,15042,10913,15037,10764,15031,10635,15023,10520,15014,10419,15003,10330,13657,14676,13658,14673,13670,14660,13698,14622,13750,14547,13834,14442,13956,14317,14112,14093,14291,13889,14407,13704,14499,13538,14586,13389,14664,13201,14733,12966,14792,12758,14842,12577,14882,12418,14915,12272,14940,12033,14959,11826,14972,11646,14980,11490,14983,11355,14983,11212,14979,11008,14971,10830,14961,10675,14950,10540,14936,10420,14923,10315,14909,10204,14894,10041,14089,14460,14090,14459,14096,14452,14112,14431,14141,14388,14186,14305,14252,14130,14341,13941,14399,13756,14467,13585,14539,13430,14610,13272,14677,13026,14737,12808,14790,12617,14833,12449,14869,12303,14896,12065,14916,11845,14929,11655,14937,11490,14939,11347,14936,11184,14930,10970,14921,10783,14912,10621,14900,10480,14885,10356,14867,10247,14848,10062,14827,9894,14805,9745,14400,14208,14400,14206,14402,14198,14406,14174,14415,14122,14427,14035,14444,13913,14469,13767,14504,13613,14548,13463,14598,13324,14651,13082,14704,12858,14752,12658,14795,12483,14831,12330,14860,12106,14881,11875,14895,11675,14903,11501,14905,11351,14903,11178,14900,10953,14892,10757,14880,10589,14865,10442,14847,10313,14827,10162,14805,9965,14782,9792,14757,9642,14731,9507,14562,13883,14562,13883,14563,13877,14566,13862,14570,13830,14576,13773,14584,13689,14595,13582,14613,13461,14637,13336,14668,13120,14704,12897,14741,12695,14776,12516,14808,12358,14835,12150,14856,11910,14870,11701,14878,11519,14882,11361,14884,11187,14880,10951,14871,10748,14858,10572,14842,10418,14823,10286,14801,10099,14777,9897,14751,9722,14725,9567,14696,9430,14666,9309,14702,13604,14702,13604,14702,13600,14703,13591,14705,13570,14707,13533,14709,13477,14712,13400,14718,13305,14727,13106,14743,12907,14762,12716,14784,12539,14807,12380,14827,12190,14844,11943,14855,11727,14863,11539,14870,11376,14871,11204,14868,10960,14858,10748,14845,10565,14829,10406,14809,10269,14786,10058,14761,9852,14734,9671,14705,9512,14674,9374,14641,9253,14608,9076,14821,13366,14821,13365,14821,13364,14821,13358,14821,13344,14821,13320,14819,13252,14817,13145,14815,13011,14814,12858,14817,12698,14823,12539,14832,12389,14841,12214,14850,11968,14856,11750,14861,11558,14866,11390,14867,11226,14862,10972,14853,10754,14840,10565,14823,10401,14803,10259,14780,10032,14754,9820,14725,9635,14694,9473,14661,9333,14627,9203,14593,8988,14557,8798,14923,13014,14922,13014,14922,13012,14922,13004,14920,12987,14919,12957,14915,12907,14909,12834,14902,12738,14894,12623,14888,12498,14883,12370,14880,12203,14878,11970,14875,11759,14873,11569,14874,11401,14872,11243,14865,10986,14855,10762,14842,10568,14825,10401,14804,10255,14781,10017,14754,9799,14725,9611,14692,9445,14658,9301,14623,9139,14587,8920,14548,8729,14509,8562,15008,12672,15008,12672,15008,12671,15007,12667,15005,12656,15001,12637,14997,12605,14989,12556,14978,12490,14966,12407,14953,12313,14940,12136,14927,11934,14914,11742,14903,11563,14896,11401,14889,11247,14879,10992,14866,10767,14851,10570,14833,10400,14812,10252,14789,10007,14761,9784,14731,9592,14698,9424,14663,9279,14627,9088,14588,8868,14548,8676,14508,8508,14467,8360,15080,12386,15080,12386,15079,12385,15078,12383,15076,12378,15072,12367,15066,12347,15057,12315,15045,12253,15030,12138,15012,11998,14993,11845,14972,11685,14951,11530,14935,11383,14920,11228,14904,10981,14887,10762,14870,10567,14850,10397,14827,10248,14803,9997,14774,9771,14743,9578,14710,9407,14674,9259,14637,9048,14596,8826,14555,8632,14514,8464,14471,8317,14427,8182,15139,12008,15139,12008,15138,12008,15137,12007,15135,12003,15130,11990,15124,11969,15115,11929,15102,11872,15086,11794,15064,11693,15041,11581,15013,11459,14987,11336,14966,11170,14944,10944,14921,10738,14898,10552,14875,10387,14850,10239,14824,9983,14794,9758,14762,9563,14728,9392,14692,9244,14653,9014,14611,8791,14569,8597,14526,8427,14481,8281,14436,8110,14391,7885,15188,11617,15188,11617,15187,11617,15186,11618,15183,11617,15179,11612,15173,11601,15163,11581,15150,11546,15133,11495,15110,11427,15083,11346,15051,11246,15024,11057,14996,10868,14967,10687,14938,10517,14911,10362,14882,10206,14853,9956,14821,9737,14787,9543,14752,9375,14715,9228,14675,8980,14632,8760,14589,8565,14544,8395,14498,8248,14451,8049,14404,7824,14357,7630,15228,11298,15228,11298,15227,11299,15226,11301,15223,11303,15219,11302,15213,11299,15204,11290,15191,11271,15174,11217,15150,11129,15119,11015,15087,10886,15057,10744,15024,10599,14990,10455,14957,10318,14924,10143,14891,9911,14856,9701,14820,9516,14782,9352,14744,9200,14703,8946,14659,8725,14615,8533,14568,8366,14521,8220,14472,7992,14423,7770,14374,7578,14315,7408,15260,10819,15260,10819,15259,10822,15258,10826,15256,10832,15251,10836,15246,10841,15237,10838,15225,10821,15207,10788,15183,10734,15151,10660,15120,10571,15087,10469,15049,10359,15012,10249,14974,10041,14937,9837,14900,9647,14860,9475,14820,9320,14779,9147,14736,8902,14691,8688,14646,8499,14598,8335,14549,8189,14499,7940,14448,7720,14397,7529,14347,7363,14256,7218,15285,10410,15285,10411,15285,10413,15284,10418,15282,10425,15278,10434,15272,10442,15264,10449,15252,10445,15235,10433,15210,10403,15179,10358,15149,10301,15113,10218,15073,10059,15033,9894,14991,9726,14951,9565,14909,9413,14865,9273,14822,9073,14777,8845,14730,8641,14682,8459,14633,8300,14583,8129,14531,7883,14479,7670,14426,7482,14373,7321,14305,7176,14201,6939,15305,9939,15305,9940,15305,9945,15304,9955,15302,9967,15298,9989,15293,10010,15286,10033,15274,10044,15258,10045,15233,10022,15205,9975,15174,9903,15136,9808,15095,9697,15053,9578,15009,9451,14965,9327,14918,9198,14871,8973,14825,8766,14775,8579,14725,8408,14675,8259,14622,8058,14569,7821,14515,7615,14460,7435,14405,7276,14350,7108,14256,6866,14149,6653,15321,9444,15321,9445,15321,9448,15320,9458,15317,9470,15314,9490,15310,9515,15302,9540,15292,9562,15276,9579,15251,9577,15226,9559,15195,9519,15156,9463,15116,9389,15071,9304,15025,9208,14978,9023,14927,8838,14878,8661,14827,8496,14774,8344,14722,8206,14667,7973,14612,7749,14556,7555,14499,7382,14443,7229,14385,7025,14322,6791,14210,6588,14100,6409,15333,8920,15333,8921,15332,8927,15332,8943,15329,8965,15326,9002,15322,9048,15316,9106,15307,9162,15291,9204,15267,9221,15244,9221,15212,9196,15175,9134,15133,9043,15088,8930,15040,8801,14990,8665,14938,8526,14886,8391,14830,8261,14775,8087,14719,7866,14661,7664,14603,7482,14544,7322,14485,7178,14426,6936,14367,6713,14281,6517,14166,6348,14054,6198,15341,8360,15341,8361,15341,8366,15341,8379,15339,8399,15336,8431,15332,8473,15326,8527,15318,8585,15302,8632,15281,8670,15258,8690,15227,8690,15191,8664,15149,8612,15104,8543,15055,8456,15001,8360,14948,8259,14892,8122,14834,7923,14776,7734,14716,7558,14656,7397,14595,7250,14534,7070,14472,6835,14410,6628,14350,6443,14243,6283,14125,6135,14010,5889,15348,7715,15348,7717,15348,7725,15347,7745,15345,7780,15343,7836,15339,7905,15334,8e3,15326,8103,15310,8193,15293,8239,15270,8270,15240,8287,15204,8283,15163,8260,15118,8223,15067,8143,15014,8014,14958,7873,14899,7723,14839,7573,14778,7430,14715,7293,14652,7164,14588,6931,14524,6720,14460,6531,14396,6362,14330,6210,14207,6015,14086,5781,13969,5576,15352,7114,15352,7116,15352,7128,15352,7159,15350,7195,15348,7237,15345,7299,15340,7374,15332,7457,15317,7544,15301,7633,15280,7703,15251,7754,15216,7775,15176,7767,15131,7733,15079,7670,15026,7588,14967,7492,14906,7387,14844,7278,14779,7171,14714,6965,14648,6770,14581,6587,14515,6420,14448,6269,14382,6123,14299,5881,14172,5665,14049,5477,13929,5310,15355,6329,15355,6330,15355,6339,15355,6362,15353,6410,15351,6472,15349,6572,15344,6688,15337,6835,15323,6985,15309,7142,15287,7220,15260,7277,15226,7310,15188,7326,15142,7318,15090,7285,15036,7239,14976,7177,14914,7045,14849,6892,14782,6736,14714,6581,14645,6433,14576,6293,14506,6164,14438,5946,14369,5733,14270,5540,14140,5369,14014,5216,13892,5043,15357,5483,15357,5484,15357,5496,15357,5528,15356,5597,15354,5692,15351,5835,15347,6011,15339,6195,15328,6317,15314,6446,15293,6566,15268,6668,15235,6746,15197,6796,15152,6811,15101,6790,15046,6748,14985,6673,14921,6583,14854,6479,14785,6371,14714,6259,14643,6149,14571,5946,14499,5750,14428,5567,14358,5401,14242,5250,14109,5111,13980,4870,13856,4657,15359,4555,15359,4557,15358,4573,15358,4633,15357,4715,15355,4841,15353,5061,15349,5216,15342,5391,15331,5577,15318,5770,15299,5967,15274,6150,15243,6223,15206,6280,15161,6310,15111,6317,15055,6300,14994,6262,14928,6208,14860,6141,14788,5994,14715,5838,14641,5684,14566,5529,14492,5384,14418,5247,14346,5121,14216,4892,14079,4682,13948,4496,13822,4330,15359,3498,15359,3501,15359,3520,15359,3598,15358,3719,15356,3860,15355,4137,15351,4305,15344,4563,15334,4809,15321,5116,15303,5273,15280,5418,15250,5547,15214,5653,15170,5722,15120,5761,15064,5763,15002,5733,14935,5673,14865,5597,14792,5504,14716,5400,14640,5294,14563,5185,14486,5041,14410,4841,14335,4655,14191,4482,14051,4325,13918,4183,13790,4012,15360,2282,15360,2285,15360,2306,15360,2401,15359,2547,15357,2748,15355,3103,15352,3349,15345,3675,15336,4020,15324,4272,15307,4496,15285,4716,15255,4908,15220,5086,15178,5170,15128,5214,15072,5234,15010,5231,14943,5206,14871,5166,14796,5102,14718,4971,14639,4833,14559,4687,14480,4541,14402,4401,14315,4268,14167,4142,14025,3958,13888,3747,13759,3556,15360,923,15360,925,15360,946,15360,1052,15359,1214,15357,1494,15356,1892,15352,2274,15346,2663,15338,3099,15326,3393,15309,3679,15288,3980,15260,4183,15226,4325,15185,4437,15136,4517,15080,4570,15018,4591,14950,4581,14877,4545,14800,4485,14720,4411,14638,4325,14556,4231,14475,4136,14395,3988,14297,3803,14145,3628,13999,3465,13861,3314,13729,3177,15360,263,15360,264,15360,272,15360,325,15359,407,15358,548,15356,780,15352,1144,15347,1580,15339,2099,15328,2425,15312,2795,15292,3133,15264,3329,15232,3517,15191,3689,15143,3819,15088,3923,15025,3978,14956,3999,14882,3979,14804,3931,14722,3855,14639,3756,14554,3645,14470,3529,14388,3409,14279,3289,14124,3173,13975,3055,13834,2848,13701,2658,15360,49,15360,49,15360,52,15360,75,15359,111,15358,201,15356,283,15353,519,15348,726,15340,1045,15329,1415,15314,1795,15295,2173,15269,2410,15237,2649,15197,2866,15150,3054,15095,3140,15032,3196,14963,3228,14888,3236,14808,3224,14725,3191,14639,3146,14553,3088,14466,2976,14382,2836,14262,2692,14103,2549,13952,2409,13808,2278,13674,2154,15360,4,15360,4,15360,4,15360,13,15359,33,15358,59,15357,112,15353,199,15348,302,15341,456,15331,628,15316,827,15297,1082,15272,1332,15241,1601,15202,1851,15156,2069,15101,2172,15039,2256,14970,2314,14894,2348,14813,2358,14728,2344,14640,2311,14551,2263,14463,2203,14376,2133,14247,2059,14084,1915,13930,1761,13784,1609,13648,1464,15360,0,15360,0,15360,0,15360,3,15359,18,15358,26,15357,53,15354,80,15348,97,15341,165,15332,238,15318,326,15299,427,15275,529,15245,654,15207,771,15161,885,15108,994,15046,1089,14976,1170,14900,1229,14817,1266,14731,1284,14641,1282,14550,1260,14460,1223,14370,1174,14232,1116,14066,1050,13909,981,13761,910,13623,839]),oi=null;function Yg(){return oi===null&&(oi=new La(qg,32,32,mo,Ji),oi.minFilter=pn,oi.magFilter=pn,oi.wrapS=kn,oi.wrapT=kn,oi.generateMipmaps=!1,oi.needsUpdate=!0),oi}var Jo=class{constructor(e={}){let{canvas:t=Hu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;let x=new Set([go,xo,po]),_=new Set([Fn,wi,ks,Vs,uo,fo]),m=new Uint32Array(4),f=new Int32Array(4),T=null,M=null,A=[],C=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ri,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let S=this,R=!1;this._outputColorSpace=Vt;let N=0,b=0,y=null,L=-1,O=null,B=new tt,V=new tt,W=null,X=new qe(0),te=0,H=t.width,ne=t.height,ae=1,be=null,_e=null,Ve=new tt(0,0,H,ne),Ke=new tt(0,0,H,ne),it=!1,q=new Ns,J=!1,de=!1,Ie=new ft,ge=new P,Ce=new tt,Tt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Fe=!1;function ht(){return y===null?ae:1}let E=n;function Ge(v,D){return t.getContext(v,D)}try{let v={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"181"}`),t.addEventListener("webglcontextlost",Q,!1),t.addEventListener("webglcontextrestored",Z,!1),t.addEventListener("webglcontextcreationerror",pe,!1),E===null){let D="webgl2";if(E=Ge(D,v),E===null)throw Ge(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(v){throw v("WebGLRenderer: "+v.message),v}let ke,ct,xe,xt,Se,Be,w,g,F,Y,$,G,ye,ce,Te,ve,K,ie,Pe,Ee,ue,Ne,I,le;function se(){ke=new lx(E),ke.init(),Ne=new kg(E,ke),ct=new ex(E,ke,e,Ne),xe=new Bg(E,ke),ct.reversedDepthBuffer&&d&&xe.buffers.depth.setReversed(!0),xt=new dx(E),Se=new Tg,Be=new zg(E,ke,xe,Se,ct,Ne,xt),w=new nx(S),g=new cx(S),F=new xp(E),I=new Q0(E,F),Y=new hx(E,F,xt,I),$=new px(E,Y,F,xt),Pe=new fx(E,ct,Be),ve=new tx(Se),G=new wg(S,w,g,ke,ct,I,ve),ye=new Wg(S,Se),ce=new Eg,Te=new Dg(ke),ie=new K0(S,w,g,xe,$,p,l),K=new Fg(S,$,ct),le=new Xg(E,xt,ct,xe),Ee=new j0(E,ke,xt),ue=new ux(E,ke,xt),xt.programs=G.programs,S.capabilities=ct,S.extensions=ke,S.properties=Se,S.renderLists=ce,S.shadowMap=K,S.state=xe,S.info=xt}se();let re=new Zl(S,E);this.xr=re,this.getContext=function(){return E},this.getContextAttributes=function(){return E.getContextAttributes()},this.forceContextLoss=function(){let v=ke.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=ke.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return ae},this.setPixelRatio=function(v){v!==void 0&&(ae=v,this.setSize(H,ne,!1))},this.getSize=function(v){return v.set(H,ne)},this.setSize=function(v,D,z=!0){if(re.isPresenting){Ue("WebGLRenderer: Can't change size while VR device is presenting.");return}H=v,ne=D,t.width=Math.floor(v*ae),t.height=Math.floor(D*ae),z===!0&&(t.style.width=v+"px",t.style.height=D+"px"),this.setViewport(0,0,v,D)},this.getDrawingBufferSize=function(v){return v.set(H*ae,ne*ae).floor()},this.setDrawingBufferSize=function(v,D,z){H=v,ne=D,ae=z,t.width=Math.floor(v*z),t.height=Math.floor(D*z),this.setViewport(0,0,v,D)},this.getCurrentViewport=function(v){return v.copy(B)},this.getViewport=function(v){return v.copy(Ve)},this.setViewport=function(v,D,z,k){v.isVector4?Ve.set(v.x,v.y,v.z,v.w):Ve.set(v,D,z,k),xe.viewport(B.copy(Ve).multiplyScalar(ae).round())},this.getScissor=function(v){return v.copy(Ke)},this.setScissor=function(v,D,z,k){v.isVector4?Ke.set(v.x,v.y,v.z,v.w):Ke.set(v,D,z,k),xe.scissor(V.copy(Ke).multiplyScalar(ae).round())},this.getScissorTest=function(){return it},this.setScissorTest=function(v){xe.setScissorTest(it=v)},this.setOpaqueSort=function(v){be=v},this.setTransparentSort=function(v){_e=v},this.getClearColor=function(v){return v.copy(ie.getClearColor())},this.setClearColor=function(){ie.setClearColor(...arguments)},this.getClearAlpha=function(){return ie.getClearAlpha()},this.setClearAlpha=function(){ie.setClearAlpha(...arguments)},this.clear=function(v=!0,D=!0,z=!0){let k=0;if(v){let U=!1;if(y!==null){let ee=y.texture.format;U=x.has(ee)}if(U){let ee=y.texture.type,he=_.has(ee),me=ie.getClearColor(),fe=ie.getClearAlpha(),Re=me.r,De=me.g,Me=me.b;he?(m[0]=Re,m[1]=De,m[2]=Me,m[3]=fe,E.clearBufferuiv(E.COLOR,0,m)):(f[0]=Re,f[1]=De,f[2]=Me,f[3]=fe,E.clearBufferiv(E.COLOR,0,f))}else k|=E.COLOR_BUFFER_BIT}D&&(k|=E.DEPTH_BUFFER_BIT),z&&(k|=E.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),E.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Q,!1),t.removeEventListener("webglcontextrestored",Z,!1),t.removeEventListener("webglcontextcreationerror",pe,!1),ie.dispose(),ce.dispose(),Te.dispose(),Se.dispose(),w.dispose(),g.dispose(),$.dispose(),I.dispose(),le.dispose(),G.dispose(),re.dispose(),re.removeEventListener("sessionstart",wh),re.removeEventListener("sessionend",Th),Ni.stop()};function Q(v){v.preventDefault(),Rl("WebGLRenderer: Context Lost."),R=!0}function Z(){Rl("WebGLRenderer: Context Restored."),R=!1;let v=xt.autoReset,D=K.enabled,z=K.autoUpdate,k=K.needsUpdate,U=K.type;se(),xt.autoReset=v,K.enabled=D,K.autoUpdate=z,K.needsUpdate=k,K.type=U}function pe(v){We("WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function Oe(v){let D=v.target;D.removeEventListener("dispose",Oe),ut(D)}function ut(v){st(v),Se.remove(v)}function st(v){let D=Se.get(v).programs;D!==void 0&&(D.forEach(function(z){G.releaseProgram(z)}),v.isShaderMaterial&&G.releaseShaderCache(v))}this.renderBufferDirect=function(v,D,z,k,U,ee){D===null&&(D=Tt);let he=U.isMesh&&U.matrixWorld.determinant()<0,me=cf(v,D,z,k,U);xe.setMaterial(k,he);let fe=z.index,Re=1;if(k.wireframe===!0){if(fe=Y.getWireframeAttribute(z),fe===void 0)return;Re=2}let De=z.drawRange,Me=z.attributes.position,Ye=De.start*Re,rt=(De.start+De.count)*Re;ee!==null&&(Ye=Math.max(Ye,ee.start*Re),rt=Math.min(rt,(ee.start+ee.count)*Re)),fe!==null?(Ye=Math.max(Ye,0),rt=Math.min(rt,fe.count)):Me!=null&&(Ye=Math.max(Ye,0),rt=Math.min(rt,Me.count));let bt=rt-Ye;if(bt<0||bt===1/0)return;I.setup(U,k,me,z,fe);let Mt,ot=Ee;if(fe!==null&&(Mt=F.get(fe),ot=ue,ot.setIndex(Mt)),U.isMesh)k.wireframe===!0?(xe.setLineWidth(k.wireframeLinewidth*ht()),ot.setMode(E.LINES)):ot.setMode(E.TRIANGLES);else if(U.isLine){let Ae=k.linewidth;Ae===void 0&&(Ae=1),xe.setLineWidth(Ae*ht()),U.isLineSegments?ot.setMode(E.LINES):U.isLineLoop?ot.setMode(E.LINE_LOOP):ot.setMode(E.LINE_STRIP)}else U.isPoints?ot.setMode(E.POINTS):U.isSprite&&ot.setMode(E.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)Rs("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ot.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(ke.get("WEBGL_multi_draw"))ot.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{let Ae=U._multiDrawStarts,gt=U._multiDrawCounts,et=U._multiDrawCount,ln=fe?F.get(fe).bytesPerElement:1,us=Se.get(k).currentProgram.getUniforms();for(let hn=0;hn<et;hn++)us.setValue(E,"_gl_DrawID",hn),ot.render(Ae[hn]/ln,gt[hn])}else if(U.isInstancedMesh)ot.renderInstances(Ye,bt,U.count);else if(z.isInstancedBufferGeometry){let Ae=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,gt=Math.min(z.instanceCount,Ae);ot.renderInstances(Ye,bt,gt)}else ot.render(Ye,bt)};function Bn(v,D,z){v.transparent===!0&&v.side===bn&&v.forceSinglePass===!1?(v.side=Yt,v.needsUpdate=!0,na(v,D,z),v.side=ni,v.needsUpdate=!0,na(v,D,z),v.side=bn):na(v,D,z)}this.compile=function(v,D,z=null){z===null&&(z=v),M=Te.get(z),M.init(D),C.push(M),z.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(M.pushLight(U),U.castShadow&&M.pushShadow(U))}),v!==z&&v.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(M.pushLight(U),U.castShadow&&M.pushShadow(U))}),M.setupLights();let k=new Set;return v.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;let ee=U.material;if(ee)if(Array.isArray(ee))for(let he=0;he<ee.length;he++){let me=ee[he];Bn(me,z,U),k.add(me)}else Bn(ee,z,U),k.add(ee)}),M=C.pop(),k},this.compileAsync=function(v,D,z=null){let k=this.compile(v,D,z);return new Promise(U=>{function ee(){if(k.forEach(function(he){Se.get(he).currentProgram.isReady()&&k.delete(he)}),k.size===0){U(v);return}setTimeout(ee,10)}ke.get("KHR_parallel_shader_compile")!==null?ee():setTimeout(ee,10)})};let Rn=null;function of(v){Rn&&Rn(v)}function wh(){Ni.stop()}function Th(){Ni.start()}let Ni=new xd;Ni.setAnimationLoop(of),typeof self<"u"&&Ni.setContext(self),this.setAnimationLoop=function(v){Rn=v,re.setAnimationLoop(v),v===null?Ni.stop():Ni.start()},re.addEventListener("sessionstart",wh),re.addEventListener("sessionend",Th),this.render=function(v,D){if(D!==void 0&&D.isCamera!==!0){We("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(re.cameraAutoUpdate===!0&&re.updateCamera(D),D=re.getCamera()),v.isScene===!0&&v.onBeforeRender(S,v,D,y),M=Te.get(v,C.length),M.init(D),C.push(M),Ie.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),q.setFromProjectionMatrix(Ie,Dn,D.reversedDepth),de=this.localClippingEnabled,J=ve.init(this.clippingPlanes,de),T=ce.get(v,A.length),T.init(),A.push(T),re.enabled===!0&&re.isPresenting===!0){let ee=S.xr.getDepthSensingMesh();ee!==null&&Cc(ee,D,-1/0,S.sortObjects)}Cc(v,D,0,S.sortObjects),T.finish(),S.sortObjects===!0&&T.sort(be,_e),Fe=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,Fe&&ie.addToRenderList(T,v),this.info.render.frame++,J===!0&&ve.beginShadows();let z=M.state.shadowsArray;K.render(z,v,D),J===!0&&ve.endShadows(),this.info.autoReset===!0&&this.info.reset();let k=T.opaque,U=T.transmissive;if(M.setupLights(),D.isArrayCamera){let ee=D.cameras;if(U.length>0)for(let he=0,me=ee.length;he<me;he++){let fe=ee[he];Eh(k,U,v,fe)}Fe&&ie.render(v);for(let he=0,me=ee.length;he<me;he++){let fe=ee[he];Ah(T,v,fe,fe.viewport)}}else U.length>0&&Eh(k,U,v,D),Fe&&ie.render(v),Ah(T,v,D);y!==null&&b===0&&(Be.updateMultisampleRenderTarget(y),Be.updateRenderTargetMipmap(y)),v.isScene===!0&&v.onAfterRender(S,v,D),I.resetDefaultState(),L=-1,O=null,C.pop(),C.length>0?(M=C[C.length-1],J===!0&&ve.setGlobalState(S.clippingPlanes,M.state.camera)):M=null,A.pop(),A.length>0?T=A[A.length-1]:T=null};function Cc(v,D,z,k){if(v.visible===!1)return;if(v.layers.test(D.layers)){if(v.isGroup)z=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(D);else if(v.isLight)M.pushLight(v),v.castShadow&&M.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||q.intersectsSprite(v)){k&&Ce.setFromMatrixPosition(v.matrixWorld).applyMatrix4(Ie);let he=$.update(v),me=v.material;me.visible&&T.push(v,he,me,z,Ce.z,null)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||q.intersectsObject(v))){let he=$.update(v),me=v.material;if(k&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),Ce.copy(v.boundingSphere.center)):(he.boundingSphere===null&&he.computeBoundingSphere(),Ce.copy(he.boundingSphere.center)),Ce.applyMatrix4(v.matrixWorld).applyMatrix4(Ie)),Array.isArray(me)){let fe=he.groups;for(let Re=0,De=fe.length;Re<De;Re++){let Me=fe[Re],Ye=me[Me.materialIndex];Ye&&Ye.visible&&T.push(v,he,Ye,z,Ce.z,Me)}}else me.visible&&T.push(v,he,me,z,Ce.z,null)}}let ee=v.children;for(let he=0,me=ee.length;he<me;he++)Cc(ee[he],D,z,k)}function Ah(v,D,z,k){let{opaque:U,transmissive:ee,transparent:he}=v;M.setupLightsView(z),J===!0&&ve.setGlobalState(S.clippingPlanes,z),k&&xe.viewport(B.copy(k)),U.length>0&&ta(U,D,z),ee.length>0&&ta(ee,D,z),he.length>0&&ta(he,D,z),xe.buffers.depth.setTest(!0),xe.buffers.depth.setMask(!0),xe.buffers.color.setMask(!0),xe.setPolygonOffset(!1)}function Eh(v,D,z,k){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;M.state.transmissionRenderTarget[k.id]===void 0&&(M.state.transmissionRenderTarget[k.id]=new Vn(1,1,{generateMipmaps:!0,type:ke.has("EXT_color_buffer_half_float")||ke.has("EXT_color_buffer_float")?Ji:Fn,minFilter:Si,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qe.workingColorSpace}));let ee=M.state.transmissionRenderTarget[k.id],he=k.viewport||B;ee.setSize(he.z*S.transmissionResolutionScale,he.w*S.transmissionResolutionScale);let me=S.getRenderTarget(),fe=S.getActiveCubeFace(),Re=S.getActiveMipmapLevel();S.setRenderTarget(ee),S.getClearColor(X),te=S.getClearAlpha(),te<1&&S.setClearColor(16777215,.5),S.clear(),Fe&&ie.render(z);let De=S.toneMapping;S.toneMapping=ri;let Me=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),M.setupLightsView(k),J===!0&&ve.setGlobalState(S.clippingPlanes,k),ta(v,z,k),Be.updateMultisampleRenderTarget(ee),Be.updateRenderTargetMipmap(ee),ke.has("WEBGL_multisampled_render_to_texture")===!1){let Ye=!1;for(let rt=0,bt=D.length;rt<bt;rt++){let Mt=D[rt],{object:ot,geometry:Ae,material:gt,group:et}=Mt;if(gt.side===bn&&ot.layers.test(k.layers)){let ln=gt.side;gt.side=Yt,gt.needsUpdate=!0,Ch(ot,z,k,Ae,gt,et),gt.side=ln,gt.needsUpdate=!0,Ye=!0}}Ye===!0&&(Be.updateMultisampleRenderTarget(ee),Be.updateRenderTargetMipmap(ee))}S.setRenderTarget(me,fe,Re),S.setClearColor(X,te),Me!==void 0&&(k.viewport=Me),S.toneMapping=De}function ta(v,D,z){let k=D.isScene===!0?D.overrideMaterial:null;for(let U=0,ee=v.length;U<ee;U++){let he=v[U],{object:me,geometry:fe,group:Re}=he,De=he.material;De.allowOverride===!0&&k!==null&&(De=k),me.layers.test(z.layers)&&Ch(me,D,z,fe,De,Re)}}function Ch(v,D,z,k,U,ee){v.onBeforeRender(S,D,z,k,U,ee),v.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),U.onBeforeRender(S,D,z,k,v,ee),U.transparent===!0&&U.side===bn&&U.forceSinglePass===!1?(U.side=Yt,U.needsUpdate=!0,S.renderBufferDirect(z,D,k,U,v,ee),U.side=ni,U.needsUpdate=!0,S.renderBufferDirect(z,D,k,U,v,ee),U.side=bn):S.renderBufferDirect(z,D,k,U,v,ee),v.onAfterRender(S,D,z,k,U,ee)}function na(v,D,z){D.isScene!==!0&&(D=Tt);let k=Se.get(v),U=M.state.lights,ee=M.state.shadowsArray,he=U.state.version,me=G.getParameters(v,U.state,ee,D,z),fe=G.getProgramCacheKey(me),Re=k.programs;k.environment=v.isMeshStandardMaterial?D.environment:null,k.fog=D.fog,k.envMap=(v.isMeshStandardMaterial?g:w).get(v.envMap||k.environment),k.envMapRotation=k.environment!==null&&v.envMap===null?D.environmentRotation:v.envMapRotation,Re===void 0&&(v.addEventListener("dispose",Oe),Re=new Map,k.programs=Re);let De=Re.get(fe);if(De!==void 0){if(k.currentProgram===De&&k.lightsStateVersion===he)return Ih(v,me),De}else me.uniforms=G.getUniforms(v),v.onBeforeCompile(me,S),De=G.acquireProgram(me,fe),Re.set(fe,De),k.uniforms=me.uniforms;let Me=k.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(Me.clippingPlanes=ve.uniform),Ih(v,me),k.needsLights=hf(v),k.lightsStateVersion=he,k.needsLights&&(Me.ambientLightColor.value=U.state.ambient,Me.lightProbe.value=U.state.probe,Me.directionalLights.value=U.state.directional,Me.directionalLightShadows.value=U.state.directionalShadow,Me.spotLights.value=U.state.spot,Me.spotLightShadows.value=U.state.spotShadow,Me.rectAreaLights.value=U.state.rectArea,Me.ltc_1.value=U.state.rectAreaLTC1,Me.ltc_2.value=U.state.rectAreaLTC2,Me.pointLights.value=U.state.point,Me.pointLightShadows.value=U.state.pointShadow,Me.hemisphereLights.value=U.state.hemi,Me.directionalShadowMap.value=U.state.directionalShadowMap,Me.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Me.spotShadowMap.value=U.state.spotShadowMap,Me.spotLightMatrix.value=U.state.spotLightMatrix,Me.spotLightMap.value=U.state.spotLightMap,Me.pointShadowMap.value=U.state.pointShadowMap,Me.pointShadowMatrix.value=U.state.pointShadowMatrix),k.currentProgram=De,k.uniformsList=null,De}function Rh(v){if(v.uniformsList===null){let D=v.currentProgram.getUniforms();v.uniformsList=Xs.seqWithValue(D.seq,v.uniforms)}return v.uniformsList}function Ih(v,D){let z=Se.get(v);z.outputColorSpace=D.outputColorSpace,z.batching=D.batching,z.batchingColor=D.batchingColor,z.instancing=D.instancing,z.instancingColor=D.instancingColor,z.instancingMorph=D.instancingMorph,z.skinning=D.skinning,z.morphTargets=D.morphTargets,z.morphNormals=D.morphNormals,z.morphColors=D.morphColors,z.morphTargetsCount=D.morphTargetsCount,z.numClippingPlanes=D.numClippingPlanes,z.numIntersection=D.numClipIntersection,z.vertexAlphas=D.vertexAlphas,z.vertexTangents=D.vertexTangents,z.toneMapping=D.toneMapping}function cf(v,D,z,k,U){D.isScene!==!0&&(D=Tt),Be.resetTextureUnits();let ee=D.fog,he=k.isMeshStandardMaterial?D.environment:null,me=y===null?S.outputColorSpace:y.isXRRenderTarget===!0?y.texture.colorSpace:Wi,fe=(k.isMeshStandardMaterial?g:w).get(k.envMap||he),Re=k.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,De=!!z.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Me=!!z.morphAttributes.position,Ye=!!z.morphAttributes.normal,rt=!!z.morphAttributes.color,bt=ri;k.toneMapped&&(y===null||y.isXRRenderTarget===!0)&&(bt=S.toneMapping);let Mt=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,ot=Mt!==void 0?Mt.length:0,Ae=Se.get(k),gt=M.state.lights;if(J===!0&&(de===!0||v!==O)){let zt=v===O&&k.id===L;ve.setState(k,v,zt)}let et=!1;k.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==gt.state.version||Ae.outputColorSpace!==me||U.isBatchedMesh&&Ae.batching===!1||!U.isBatchedMesh&&Ae.batching===!0||U.isBatchedMesh&&Ae.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Ae.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Ae.instancing===!1||!U.isInstancedMesh&&Ae.instancing===!0||U.isSkinnedMesh&&Ae.skinning===!1||!U.isSkinnedMesh&&Ae.skinning===!0||U.isInstancedMesh&&Ae.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Ae.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Ae.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Ae.instancingMorph===!1&&U.morphTexture!==null||Ae.envMap!==fe||k.fog===!0&&Ae.fog!==ee||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==ve.numPlanes||Ae.numIntersection!==ve.numIntersection)||Ae.vertexAlphas!==Re||Ae.vertexTangents!==De||Ae.morphTargets!==Me||Ae.morphNormals!==Ye||Ae.morphColors!==rt||Ae.toneMapping!==bt||Ae.morphTargetsCount!==ot)&&(et=!0):(et=!0,Ae.__version=k.version);let ln=Ae.currentProgram;et===!0&&(ln=na(k,D,U));let us=!1,hn=!1,js=!1,_t=ln.getUniforms(),Qt=Ae.uniforms;if(xe.useProgram(ln.program)&&(us=!0,hn=!0,js=!0),k.id!==L&&(L=k.id,hn=!0),us||O!==v){xe.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),_t.setValue(E,"projectionMatrix",v.projectionMatrix),_t.setValue(E,"viewMatrix",v.matrixWorldInverse);let jt=_t.map.cameraPosition;jt!==void 0&&jt.setValue(E,ge.setFromMatrixPosition(v.matrixWorld)),ct.logarithmicDepthBuffer&&_t.setValue(E,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&_t.setValue(E,"isOrthographic",v.isOrthographicCamera===!0),O!==v&&(O=v,hn=!0,js=!0)}if(U.isSkinnedMesh){_t.setOptional(E,U,"bindMatrix"),_t.setOptional(E,U,"bindMatrixInverse");let zt=U.skeleton;zt&&(zt.boneTexture===null&&zt.computeBoneTexture(),_t.setValue(E,"boneTexture",zt.boneTexture,Be))}U.isBatchedMesh&&(_t.setOptional(E,U,"batchingTexture"),_t.setValue(E,"batchingTexture",U._matricesTexture,Be),_t.setOptional(E,U,"batchingIdTexture"),_t.setValue(E,"batchingIdTexture",U._indirectTexture,Be),_t.setOptional(E,U,"batchingColorTexture"),U._colorsTexture!==null&&_t.setValue(E,"batchingColorTexture",U._colorsTexture,Be));let xn=z.morphAttributes;if((xn.position!==void 0||xn.normal!==void 0||xn.color!==void 0)&&Pe.update(U,z,ln),(hn||Ae.receiveShadow!==U.receiveShadow)&&(Ae.receiveShadow=U.receiveShadow,_t.setValue(E,"receiveShadow",U.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(Qt.envMap.value=fe,Qt.flipEnvMap.value=fe.isCubeTexture&&fe.isRenderTargetTexture===!1?-1:1),k.isMeshStandardMaterial&&k.envMap===null&&D.environment!==null&&(Qt.envMapIntensity.value=D.environmentIntensity),Qt.dfgLUT!==void 0&&(Qt.dfgLUT.value=Yg()),hn&&(_t.setValue(E,"toneMappingExposure",S.toneMappingExposure),Ae.needsLights&&lf(Qt,js),ee&&k.fog===!0&&ye.refreshFogUniforms(Qt,ee),ye.refreshMaterialUniforms(Qt,k,ae,ne,M.state.transmissionRenderTarget[v.id]),Xs.upload(E,Rh(Ae),Qt,Be)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Xs.upload(E,Rh(Ae),Qt,Be),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&_t.setValue(E,"center",U.center),_t.setValue(E,"modelViewMatrix",U.modelViewMatrix),_t.setValue(E,"normalMatrix",U.normalMatrix),_t.setValue(E,"modelMatrix",U.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){let zt=k.uniformsGroups;for(let jt=0,Rc=zt.length;jt<Rc;jt++){let Fi=zt[jt];le.update(Fi,ln),le.bind(Fi,ln)}}return ln}function lf(v,D){v.ambientLightColor.needsUpdate=D,v.lightProbe.needsUpdate=D,v.directionalLights.needsUpdate=D,v.directionalLightShadows.needsUpdate=D,v.pointLights.needsUpdate=D,v.pointLightShadows.needsUpdate=D,v.spotLights.needsUpdate=D,v.spotLightShadows.needsUpdate=D,v.rectAreaLights.needsUpdate=D,v.hemisphereLights.needsUpdate=D}function hf(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return b},this.getRenderTarget=function(){return y},this.setRenderTargetTextures=function(v,D,z){let k=Se.get(v);k.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),Se.get(v.texture).__webglTexture=D,Se.get(v.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:z,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,D){let z=Se.get(v);z.__webglFramebuffer=D,z.__useDefaultFramebuffer=D===void 0};let uf=E.createFramebuffer();this.setRenderTarget=function(v,D=0,z=0){y=v,N=D,b=z;let k=!0,U=null,ee=!1,he=!1;if(v){let fe=Se.get(v);if(fe.__useDefaultFramebuffer!==void 0)xe.bindFramebuffer(E.FRAMEBUFFER,null),k=!1;else if(fe.__webglFramebuffer===void 0)Be.setupRenderTarget(v);else if(fe.__hasExternalTextures)Be.rebindTextures(v,Se.get(v.texture).__webglTexture,Se.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let Me=v.depthTexture;if(fe.__boundDepthTexture!==Me){if(Me!==null&&Se.has(Me)&&(v.width!==Me.image.width||v.height!==Me.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Be.setupDepthRenderbuffer(v)}}let Re=v.texture;(Re.isData3DTexture||Re.isDataArrayTexture||Re.isCompressedArrayTexture)&&(he=!0);let De=Se.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(De[D])?U=De[D][z]:U=De[D],ee=!0):v.samples>0&&Be.useMultisampledRTT(v)===!1?U=Se.get(v).__webglMultisampledFramebuffer:Array.isArray(De)?U=De[z]:U=De,B.copy(v.viewport),V.copy(v.scissor),W=v.scissorTest}else B.copy(Ve).multiplyScalar(ae).floor(),V.copy(Ke).multiplyScalar(ae).floor(),W=it;if(z!==0&&(U=uf),xe.bindFramebuffer(E.FRAMEBUFFER,U)&&k&&xe.drawBuffers(v,U),xe.viewport(B),xe.scissor(V),xe.setScissorTest(W),ee){let fe=Se.get(v.texture);E.framebufferTexture2D(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_CUBE_MAP_POSITIVE_X+D,fe.__webglTexture,z)}else if(he){let fe=D;for(let Re=0;Re<v.textures.length;Re++){let De=Se.get(v.textures[Re]);E.framebufferTextureLayer(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0+Re,De.__webglTexture,z,fe)}}else if(v!==null&&z!==0){let fe=Se.get(v.texture);E.framebufferTexture2D(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,fe.__webglTexture,z)}L=-1},this.readRenderTargetPixels=function(v,D,z,k,U,ee,he,me=0){if(!(v&&v.isWebGLRenderTarget)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let fe=Se.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&he!==void 0&&(fe=fe[he]),fe){xe.bindFramebuffer(E.FRAMEBUFFER,fe);try{let Re=v.textures[me],De=Re.format,Me=Re.type;if(!ct.textureFormatReadable(De)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ct.textureTypeReadable(Me)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=v.width-k&&z>=0&&z<=v.height-U&&(v.textures.length>1&&E.readBuffer(E.COLOR_ATTACHMENT0+me),E.readPixels(D,z,k,U,Ne.convert(De),Ne.convert(Me),ee))}finally{let Re=y!==null?Se.get(y).__webglFramebuffer:null;xe.bindFramebuffer(E.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(v,D,z,k,U,ee,he,me=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let fe=Se.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&he!==void 0&&(fe=fe[he]),fe)if(D>=0&&D<=v.width-k&&z>=0&&z<=v.height-U){xe.bindFramebuffer(E.FRAMEBUFFER,fe);let Re=v.textures[me],De=Re.format,Me=Re.type;if(!ct.textureFormatReadable(De))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ct.textureTypeReadable(Me))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ye=E.createBuffer();E.bindBuffer(E.PIXEL_PACK_BUFFER,Ye),E.bufferData(E.PIXEL_PACK_BUFFER,ee.byteLength,E.STREAM_READ),v.textures.length>1&&E.readBuffer(E.COLOR_ATTACHMENT0+me),E.readPixels(D,z,k,U,Ne.convert(De),Ne.convert(Me),0);let rt=y!==null?Se.get(y).__webglFramebuffer:null;xe.bindFramebuffer(E.FRAMEBUFFER,rt);let bt=E.fenceSync(E.SYNC_GPU_COMMANDS_COMPLETE,0);return E.flush(),await Wu(E,bt,4),E.bindBuffer(E.PIXEL_PACK_BUFFER,Ye),E.getBufferSubData(E.PIXEL_PACK_BUFFER,0,ee),E.deleteBuffer(Ye),E.deleteSync(bt),ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,D=null,z=0){let k=Math.pow(2,-z),U=Math.floor(v.image.width*k),ee=Math.floor(v.image.height*k),he=D!==null?D.x:0,me=D!==null?D.y:0;Be.setTexture2D(v,0),E.copyTexSubImage2D(E.TEXTURE_2D,z,0,0,he,me,U,ee),xe.unbindTexture()};let df=E.createFramebuffer(),ff=E.createFramebuffer();this.copyTextureToTexture=function(v,D,z=null,k=null,U=0,ee=null){ee===null&&(U!==0?(Rs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ee=U,U=0):ee=0);let he,me,fe,Re,De,Me,Ye,rt,bt,Mt=v.isCompressedTexture?v.mipmaps[ee]:v.image;if(z!==null)he=z.max.x-z.min.x,me=z.max.y-z.min.y,fe=z.isBox3?z.max.z-z.min.z:1,Re=z.min.x,De=z.min.y,Me=z.isBox3?z.min.z:0;else{let xn=Math.pow(2,-U);he=Math.floor(Mt.width*xn),me=Math.floor(Mt.height*xn),v.isDataArrayTexture?fe=Mt.depth:v.isData3DTexture?fe=Math.floor(Mt.depth*xn):fe=1,Re=0,De=0,Me=0}k!==null?(Ye=k.x,rt=k.y,bt=k.z):(Ye=0,rt=0,bt=0);let ot=Ne.convert(D.format),Ae=Ne.convert(D.type),gt;D.isData3DTexture?(Be.setTexture3D(D,0),gt=E.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(Be.setTexture2DArray(D,0),gt=E.TEXTURE_2D_ARRAY):(Be.setTexture2D(D,0),gt=E.TEXTURE_2D),E.pixelStorei(E.UNPACK_FLIP_Y_WEBGL,D.flipY),E.pixelStorei(E.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),E.pixelStorei(E.UNPACK_ALIGNMENT,D.unpackAlignment);let et=E.getParameter(E.UNPACK_ROW_LENGTH),ln=E.getParameter(E.UNPACK_IMAGE_HEIGHT),us=E.getParameter(E.UNPACK_SKIP_PIXELS),hn=E.getParameter(E.UNPACK_SKIP_ROWS),js=E.getParameter(E.UNPACK_SKIP_IMAGES);E.pixelStorei(E.UNPACK_ROW_LENGTH,Mt.width),E.pixelStorei(E.UNPACK_IMAGE_HEIGHT,Mt.height),E.pixelStorei(E.UNPACK_SKIP_PIXELS,Re),E.pixelStorei(E.UNPACK_SKIP_ROWS,De),E.pixelStorei(E.UNPACK_SKIP_IMAGES,Me);let _t=v.isDataArrayTexture||v.isData3DTexture,Qt=D.isDataArrayTexture||D.isData3DTexture;if(v.isDepthTexture){let xn=Se.get(v),zt=Se.get(D),jt=Se.get(xn.__renderTarget),Rc=Se.get(zt.__renderTarget);xe.bindFramebuffer(E.READ_FRAMEBUFFER,jt.__webglFramebuffer),xe.bindFramebuffer(E.DRAW_FRAMEBUFFER,Rc.__webglFramebuffer);for(let Fi=0;Fi<fe;Fi++)_t&&(E.framebufferTextureLayer(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,Se.get(v).__webglTexture,U,Me+Fi),E.framebufferTextureLayer(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,Se.get(D).__webglTexture,ee,bt+Fi)),E.blitFramebuffer(Re,De,he,me,Ye,rt,he,me,E.DEPTH_BUFFER_BIT,E.NEAREST);xe.bindFramebuffer(E.READ_FRAMEBUFFER,null),xe.bindFramebuffer(E.DRAW_FRAMEBUFFER,null)}else if(U!==0||v.isRenderTargetTexture||Se.has(v)){let xn=Se.get(v),zt=Se.get(D);xe.bindFramebuffer(E.READ_FRAMEBUFFER,df),xe.bindFramebuffer(E.DRAW_FRAMEBUFFER,ff);for(let jt=0;jt<fe;jt++)_t?E.framebufferTextureLayer(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,xn.__webglTexture,U,Me+jt):E.framebufferTexture2D(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,xn.__webglTexture,U),Qt?E.framebufferTextureLayer(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,zt.__webglTexture,ee,bt+jt):E.framebufferTexture2D(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,zt.__webglTexture,ee),U!==0?E.blitFramebuffer(Re,De,he,me,Ye,rt,he,me,E.COLOR_BUFFER_BIT,E.NEAREST):Qt?E.copyTexSubImage3D(gt,ee,Ye,rt,bt+jt,Re,De,he,me):E.copyTexSubImage2D(gt,ee,Ye,rt,Re,De,he,me);xe.bindFramebuffer(E.READ_FRAMEBUFFER,null),xe.bindFramebuffer(E.DRAW_FRAMEBUFFER,null)}else Qt?v.isDataTexture||v.isData3DTexture?E.texSubImage3D(gt,ee,Ye,rt,bt,he,me,fe,ot,Ae,Mt.data):D.isCompressedArrayTexture?E.compressedTexSubImage3D(gt,ee,Ye,rt,bt,he,me,fe,ot,Mt.data):E.texSubImage3D(gt,ee,Ye,rt,bt,he,me,fe,ot,Ae,Mt):v.isDataTexture?E.texSubImage2D(E.TEXTURE_2D,ee,Ye,rt,he,me,ot,Ae,Mt.data):v.isCompressedTexture?E.compressedTexSubImage2D(E.TEXTURE_2D,ee,Ye,rt,Mt.width,Mt.height,ot,Mt.data):E.texSubImage2D(E.TEXTURE_2D,ee,Ye,rt,he,me,ot,Ae,Mt);E.pixelStorei(E.UNPACK_ROW_LENGTH,et),E.pixelStorei(E.UNPACK_IMAGE_HEIGHT,ln),E.pixelStorei(E.UNPACK_SKIP_PIXELS,us),E.pixelStorei(E.UNPACK_SKIP_ROWS,hn),E.pixelStorei(E.UNPACK_SKIP_IMAGES,js),ee===0&&D.generateMipmaps&&E.generateMipmap(gt),xe.unbindTexture()},this.initRenderTarget=function(v){Se.get(v).__webglFramebuffer===void 0&&Be.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?Be.setTextureCube(v,0):v.isData3DTexture?Be.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?Be.setTexture2DArray(v,0):Be.setTexture2D(v,0),xe.unbindTexture()},this.resetState=function(){N=0,b=0,y=null,xe.reset(),I.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Dn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Qe._getUnpackColorSpace()}};var Md=`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="152" viewBox="0 0 200 152" fill="none" stroke="#43564d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m32 33 134-5 2 78-136 4z" fill="#a8bba2"/><path d="m44 97-1-54m1 54 105-3m-94-9 75-36" fill="none"/><path d="m58 53 69 28" stroke="#bc785d"/><path d="m54 110-8 14m91-17 10 14"/></svg>
`;var Sd=`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="152" viewBox="0 0 200 152" fill="none" stroke="#43564d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m48 26 92 3-6 100-95-6z" fill="#ecc57f"/><path d="m55 19 88 7-9 94-90-6z" fill="#fff0ce"/><path d="m67 48 6 6 10-12m6 7 31 2m-55 23 7 6 12-13m4 8 29 2"/><path d="m100 100 9-17 42-45 9 8-44 46z" fill="#c98365"/><path d="m100 100 9-17 7 9z" fill="#edd6a0"/></svg>
`;var wd=`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="152" viewBox="0 0 200 152" fill="none" stroke="#43564d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m38 89 62-24 60 14-64 29z" fill="#8faba7"/><path d="m38 89 58 19 64-29-1 12-63 28-58-17z" fill="#f4e5c2"/><path d="m47 67 60-26 54 13-63 28z" fill="#c68973"/><path d="m47 67 51 15 63-28-1 13-61 27-52-15z" fill="#f7e9c9"/><path d="m48 64 59-26 54 14M62 99l27 8" stroke="#88785f" stroke-width="1.3"/></svg>
`;var Td=`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="152" viewBox="0 0 200 152" fill="none" stroke="#43564d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m28 48 42-16 36 17 39-13 22 64-40 18-36-17-41 19z" fill="#e9dba8"/><path d="m70 33 21 68m15-52 21 67" stroke="#9a9872"/><path d="m55 81 11-12 17 5 14-14 13 5" stroke="#aa6c51" stroke-dasharray="4 5"/><circle cx="141" cy="97" r="22" fill="#b3cac0"/><path d="m149 81-4 21-14 11 6-21z" fill="#bd806a"/></svg>
`;function Qo(i,e,t){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 152"><path fill="${t}" d="${e}"/><path fill="none" stroke="#22354a" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" d="${i}"/></svg>`}var Ad=Qo("M35 67l8-26h42l10 11h63l-8 54H43z M44 70h121l-16 36H43z M54 62l3-46 65 6 3 27 M66 30l42 4 M66 37l36 4 M65 45l29 3 M66 83h62 M68 92h44 M61 110h76","M44 70h121l-16 36H43z","#bca580"),Qg=Qo("M33 21v100h137 M48 109l34-25 24 8 47-56 M136 35l18-2-1 17 M61 92V62 M55 70h12v14H55z M87 78V41 M81 50h12v17H81z M113 84V53 M107 63h12v13h-12z M139 63V23 M133 30h12v16h-12z","M55 70h12v14H55z M81 50h12v17H81z M107 63h12v13h-12z M133 30h12v16h-12z","#b96f5d"),jg=Qo("M33 28v93h139 M50 101l102-63 M51 38l101 63 M103 69v51 M34 69h69 M89 59l14 10 13 10 M149 36l-3 5 7-2 M187 123v-7 M38 18v3","M43 33l8 5 102 63-5 4-104-67z","#8ca791"),e_=Qo("M38 23v97h132 M56 116V92h20v24 M86 116V73h20v43 M116 116V58h20v58 M146 116V34h20v82 M56 79l26-15 24 1 43-37 M140 27l11-2-2 11","M56 116V92h20v24 M86 116V73h20v43 M116 116V58h20v58 M146 116V34h20v82","#8e99be"),Ei=(i,e,t,n,s,r)=>({id:i,title:e,category:t,description:n,tint:s,svg:r}),t_=[{name:"\u5B66\u4E60\u5DE5\u4F5C\u53F0",entries:[Ei("teacher","\u6559\u5E08\u5DE5\u4F5C\u53F0","TEACHING","\u5907\u8BFE\u3001\u73ED\u7EA7\u4E0E\u6559\u5B66\u8BB0\u5F55","#e2ad91",Md),Ei("homework","\u7535\u5B50\u4F5C\u4E1A\u5DE5\u4F5C\u53F0","ASSIGNMENTS","\u4F5C\u7B54\u3001\u63D0\u4EA4\u4E0E\u8BA2\u6B63","#edd79a",Sd),Ei("bookself","Bookself","READING","\u6559\u6750\u9605\u8BFB\u4E0E\u7ECF\u6D4E\u5B66\u6A21\u578B","#b3cad9",wd),Ei("econquest","EconQuest","FIELD QUEST","\u7ECF\u6D4E\u5B66\u95EF\u5173\u4E0E\u63A2\u7D22","#bfcda8",Td)]},{name:"\u8D44\u6E90\u4E0E\u6D3B\u52A8",entries:[Ei("resources","\u8D44\u6599\u5E93","ARCHIVE","\u8003\u7EB2\u3001\u771F\u9898\u4E0E\u590D\u4E60\u8D44\u6E90","#dfc59d",Ad),Ei("nebs","NEBS \u6A21\u62DF\u80A1\u7968\u5927\u8D5B","TRADING","\u6A21\u62DF\u6295\u8D44\u4E0E\u4EA4\u6613","#e0a792",Qg),Ei("micro","AP \u5FAE\u89C2\u5B66\u4E60\u6750\u6599","AP MICRO","\u5FAE\u89C2\u8BFE\u7A0B\u4E0E\u590D\u4E60\u8D44\u6599","#b7cfba",jg),Ei("macro","AP \u5B8F\u89C2\u5B66\u4E60\u6750\u6599","AP MACRO","\u5B8F\u89C2\u8BFE\u7A0B\u4E0E\u590D\u4E60\u8D44\u6599","#bbc7e0",e_)]}],n_={teacher:"teacher-workspace",homework:"homework-submit",micro:"micro-materials",macro:"macro-materials"};function Jl(i){let e=new Map(i.map(r=>[r.id,r])),t=new Set,n=t_.map((r,a)=>{let o=r.entries.map(l=>{let c=n_[l.id]||l.id,h=e.get(c);return h?(t.add(c),{...l,href:h.href,id:c}):null});if(a===0){let[l,c,h,u]=o,d=l||c;return{name:l?"\u6559\u5B66\u4E0E\u73ED\u7EA7":c?"\u4F5C\u4E1A\u4E0E\u8BA2\u6B63":r.name,entries:[d,null,h,u]}}return{name:r.name,entries:o}}),s=i.filter(r=>!t.has(r.id));for(let r=0;r<s.length;r+=4)n.push({name:"\u62D3\u5C55\u8D44\u6E90",entries:s.slice(r,r+4).map(a=>({...a,category:"",title:a.name,tint:"#bbc7e0",svg:Ad}))});return n.push({kind:"end",name:"\u5185\u5BB9\u66F4\u65B0\u4E2D\u3002\u3002\u3002",entries:[]}),n}var jo=(i,e,t)=>t===0?e===0?i.name:"\u9605\u8BFB\u4E0E\u63A2\u7D22":t===1?e===0?"\u8D44\u6599\u4E0E\u7ADE\u8D5B":"AP \u5B66\u4E60\u6750\u6599":i.name;var ec={date:{size:24,weight:400,color:"#625e50",height:38},title:{size:33,weight:650,color:"#223f3a",height:47},item:{size:28,weight:650,color:"#374b40",height:42},body:{size:26,weight:400,color:"#333a37",height:38}},Ed=i=>`${ec[i].weight} ${ec[i].size}px system-ui,sans-serif`;var Vr=new P;function Sn(i,e,t,n,s,r){let a=2*Math.PI*s/4,o=Math.max(r-2*s,0),l=Math.PI/4;Vr.copy(e),Vr[n]=0,Vr.normalize();let c=.5*a/(a+o),h=1-Vr.angleTo(i)/l;return Math.sign(Vr[t])===1?h*c:o/(a+o)+c+c*(1-h)}var tc=class i extends Gn{constructor(e=1,t=1,n=1,s=2,r=.1){let a=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let l=new P,c=new P,h=new P(e,t,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,p=this.attributes.uv.array,x=u.length/6,_=new P,m=.5/a;for(let f=0,T=0;f<u.length;f+=3,T+=2)switch(l.fromArray(u,f),c.copy(l),c.x-=Math.sign(c.x)*m,c.y-=Math.sign(c.y)*m,c.z-=Math.sign(c.z)*m,c.normalize(),u[f+0]=h.x*Math.sign(l.x)+c.x*r,u[f+1]=h.y*Math.sign(l.y)+c.y*r,u[f+2]=h.z*Math.sign(l.z)+c.z*r,d[f+0]=c.x,d[f+1]=c.y,d[f+2]=c.z,Math.floor(f/x)){case 0:_.set(1,0,0),p[T+0]=Sn(_,c,"z","y",r,n),p[T+1]=1-Sn(_,c,"y","z",r,t);break;case 1:_.set(-1,0,0),p[T+0]=1-Sn(_,c,"z","y",r,n),p[T+1]=1-Sn(_,c,"y","z",r,t);break;case 2:_.set(0,1,0),p[T+0]=1-Sn(_,c,"x","z",r,e),p[T+1]=Sn(_,c,"z","x",r,n);break;case 3:_.set(0,-1,0),p[T+0]=1-Sn(_,c,"x","z",r,e),p[T+1]=1-Sn(_,c,"z","x",r,n);break;case 4:_.set(0,0,1),p[T+0]=1-Sn(_,c,"x","y",r,e),p[T+1]=1-Sn(_,c,"y","x",r,t);break;case 5:_.set(0,0,-1),p[T+0]=Sn(_,c,"x","y",r,e),p[T+1]=1-Sn(_,c,"y","x",r,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}};var qn="#253b44",nc="#6b4b30",sc="#396852",Gr="#a44b3e",ic="#496783",i_='"Desk Hand","Kaiti SC",KaiTi,serif';function pt(i,e,t,n=2){i.beginPath(),e.forEach(([s,r],a)=>a?i.lineTo(s,r):i.moveTo(s,r)),i.strokeStyle=t,i.lineWidth=n,i.lineCap="round",i.lineJoin="round",i.stroke()}function On(i,e,t,n,s,r=qn,a=i_){i.fillStyle=r,i.font="400 "+s+"px "+a,i.fillText(e,t,n)}function rc(i,e,t){i.beginPath(),e.forEach(([n,s],r)=>r?i.lineTo(n,s):i.moveTo(n,s)),i.closePath(),i.fillStyle=t,i.fill()}function es(i,e,t,n,s){i.beginPath(),i.arc(e,t,n,0,Math.PI*2),i.fillStyle=s,i.fill()}function ac(i,e,t,n){pt(i,[[e-28,t],[e,t],[e-9,t-7]],n,3),pt(i,[[e,t],[e-9,t+7]],n,3)}function Cd(i,e,t,n,s,r){let a=r<s?sc:Gr;pt(i,[[e,t],[e,n]],a,3),i.fillStyle=a,i.fillRect(e-9,Math.min(s,r),18,Math.abs(s-r))}function s_(i){rc(i,[[24,59],[606,43],[611,110],[25,118]],"#b89c74"),rc(i,[[32,46],[596,34],[597,99],[34,115]],"#faf2d9");for(let e of[55,63])pt(i,[[295,e],[576,e-5]],"#c5b89b",1.5);rc(i,[[0,94],[166,94],[192,70],[680,70],[680,374],[0,374]],"#cda876"),pt(i,[[0,94],[166,94],[192,70],[680,70]],nc,3),i.save(),i.translate(51,134),i.rotate(-.022),i.fillStyle="#a7875d",i.fillRect(2,4,349,158),i.fillStyle="#f4e9ce",i.fillRect(0,0,349,158),i.strokeStyle="#988360",i.lineWidth=2,i.strokeRect(9,9,331,140),On(i,"ARCHIVE",24,44,20,nc,"Georgia"),On(i,"\u8D44\u6599\u5E93",22,119,68,qn),i.restore();for(let e of[156,248])es(i,523,e,24,"#966c42"),es(i,523,e,19,"#bc8d56"),es(i,523,e,6,nc);pt(i,[[522,156],[540,170],[506,232],[522,251],[538,237],[507,171],[520,157]],"#785633",3),pt(i,[[518,247],[497,271],[482,276]],"#785633",3),ac(i,630,322,nc)}function r_(i,e){On(i,"NEBS",31,87,69,Gr,"Georgia"),On(i,"\u6A21\u62DF\u80A1\u7968\u5927\u8D5B",253,84,52),pt(i,[[31,105],[647,105]],qn,3),pt(i,[[31,112],[647,112]],qn,1);for(let n of[159,209,259,309])pt(i,[[47,n],[590,n]],"#b6aa90",1.4);let t=[[75,220,318,246,287],[138,234,332,298,257],[201,194,289,262,220],[264,197,272,217,248],[327,170,259,236,193],[390,150,222,202,174],[453,161,243,183,213]];for(let n of t)Cd(i,...n);Cd(e,516,122,227,207,153),pt(i,[[346,121],[336,205],[341,330]],"#ab987d48",3),pt(i,[[350,122],[340,205],[345,331]],"#fff7de99",2),i.save(),i.setLineDash([4,6]),pt(i,[[496,0],[496,374]],"#927858",2),i.restore(),On(i,"NEBS",550,151,23,Gr,"Georgia"),ac(i,636,323,qn)}function a_(i,e){for(let t=0;t<680;t+=25)pt(i,[[t,0],[t,374]],"#779e922c",1.2);for(let t=0;t<374;t+=25)pt(i,[[0,t],[680,t]],"#779e9244",1.2);pt(i,[[31,0],[31,374]],"#c18a7366",2),On(i,"AP \u5FAE\u89C2\u5B66\u4E60\u6750\u6599",55,90,52),pt(i,[[109,136],[109,312],[532,312]],qn,3),On(i,"P",85,145,23,qn,"Georgia"),On(i,"Q",537,322,23,qn,"Georgia"),i.setLineDash([5,7]),pt(i,[[110,220],[308,220],[308,311]],"#6d827b",1.7),i.setLineDash([]),pt(e,[[148,148],[308,220],[468,292]],Gr,5),pt(e,[[148,292],[308,220],[468,148]],sc,5),es(e,308,220,7,qn),On(i,"S",480,154,24,sc,"Georgia"),On(i,"D",480,295,24,Gr,"Georgia"),ac(i,636,323,sc)}function o_(i){i.fillStyle="#607a8c",i.fillRect(0,0,36,374);for(let t of[57,179,304])es(i,18,t,6,"#334b59"),es(i,18,t-1,3,"#c5c4b2");On(i,"AP \u5B8F\u89C2\u5B66\u4E60\u6750\u6599",62,90,52),pt(i,[[60,111],[646,111]],ic,2);let e=[[86,279],[138,258],[183,266],[241,216],[288,230],[342,187],[390,201],[448,150],[505,169],[563,135]];for(let t of[167,220,274])pt(i,[[82,t],[609,t]],"#73899b5c",1.2);rc(i,[...e,[563,295],[86,295]],"#a2baca75"),pt(i,e,ic,4.5);for(let[t,n]of e.filter((s,r)=>r%3===0))es(i,t,n,4,ic);pt(i,[[82,139],[82,297],[604,297]],qn,2),ac(i,636,323,ic)}var c_={resources:{stock:"#dfbd8a",paint:s_},nebs:{stock:"#f3e4ce",paint:r_,axis:"up"},"micro-materials":{stock:"#e6edda",paint:a_,axis:"right"},"macro-materials":{stock:"#dbe4e7",paint:o_}};function Rd(i){return c_[i]}function Id(i,e){let t=document.createElement("canvas");t.width=680,t.height=374;let n=t.getContext("2d");n.fillStyle=e.stock,n.fillRect(0,0,680,374);let s,r;return e.axis&&(s=document.createElement("canvas"),s.width=340,s.height=187,r=s.getContext("2d"),r.scale(.5,.5)),e.paint(n,r),n.globalCompositeOperation="multiply",n.globalAlpha=.33,n.drawImage(i,0,0,680,374),{face:t,inkCanvas:s}}var Pd=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="500" viewBox="0 0 360 250" stroke="#384e4b" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path fill="#c9b188" stroke="none" d="m40 184 260-6-6 9-247 9Z"/><path fill="#c9ab84" d="m60 39 228-7 8 147-235 8Z"/><path fill="#adc2a7" d="m67 47 214-7 6 132-217 8Z"/><path d="m91 188-14 32m170-37 21 30m-171-17 145-5"/><path d="m101 70 2 74 131-3" stroke="#3d5555"/><path d="M115 84q36 12 105 45" stroke="#a96255" stroke-width="4"/><path d="M117 131q52-22 103-61" stroke="#4e7185" stroke-width="4"/><circle cx="167" cy="105" r="4" fill="#f8e9be"/><path d="m167 113 .3 24m-58-29 48-2" stroke-dasharray="4 6" stroke-width="1.5"/><path d="m243 165 20-.6" stroke="#ffefd2" stroke-width="4"/><path d="m71 48 68-2m116 121 22-1M80 213l5-11" stroke="#6b6656" stroke-width="1" opacity=".72"/></svg>
`;var Ze=3.32,nn=4.7,Ci=2.67,Ys=1.48,th=[[-1,-1],[1,-1],[-1,1],[1,1]],lc=new P(-4.07,1.52,.38),Wr=new P(3.98,-.86,.11),eh="#263546",Dd='"Songti SC","Noto Serif CJK SC","STSong",Georgia,serif',$l=new P,Ri='"Desk Hand","Kaiti SC",KaiTi,serif',ns=.04,Xr=ns+.049;function nh(i){let e=Math.abs(i);return .036*Math.exp(-((e-.23)**2)/.031)-.019*Math.exp(-e*e/.0025)}function Ii(i,e){return Object.assign(document.createElement("canvas"),{width:i,height:e})}function wn(i){let e=new Fs(i);return e.colorSpace=Vt,e.anisotropy=4,e}function hc(i,e,t,n){let s=Ii(e,t),r=s.getContext("2d");return r.drawImage(i,0,0,e,t),n&&(r.globalCompositeOperation="multiply",r.fillStyle=n,r.fillRect(0,0,e,t),r.globalCompositeOperation="source-over"),s}function Tn(i,e,t,n,s,{align:r="left",font:a=Dd,color:o=eh,weight:l=600}={}){i.fillStyle=o,i.font=`${l} ${s}px ${a}`,i.textAlign=r,i.fillText(e,t,n)}function Ot(i,e,t,n=1){i.strokeStyle=t,i.lineWidth=n,i.beginPath(),e.forEach(([s,r],a)=>a?i.lineTo(s,r):i.moveTo(s,r)),i.stroke()}function cc(i,e,t,n,s,r,a,o){i.strokeStyle=a,i.lineWidth=o,i.beginPath(),i.roundRect(e,t,n,s,r),i.stroke()}function h_(i){let e=hc(i,1360,1920),t=e.getContext("2d");t.scale(2,2),t.fillStyle="#302b251b",t.fillRect(0,0,680,960);let n=t.createLinearGradient(0,0,90,0);n.addColorStop(0,"#626e67"),n.addColorStop(.79,"#707e72"),n.addColorStop(.88,"#58675f"),n.addColorStop(1,"#705c4c00"),t.fillStyle=n,t.fillRect(0,0,90,960),cc(t,61,23,593,914,21,"#2c1c129e",2),cc(t,72,34,571,891,16,"#e1b685a8",1);for(let s=45;s<919;s+=13)Ot(t,[[28,s],[34,s+5]],"#d7af7c9a",2.5);t.save(),t.translate(357,170);for(let[s,r]of[[55,"#2c231a"],[63,"#d7ad7f"]])t.beginPath(),t.ellipse(0,0,s,s*.84,0,0,2*Math.PI),t.lineWidth=1.9,t.strokeStyle=r,t.stroke();return Ot(t,[[-31,-22],[-31,25],[34,25]],"#282723",2),Ot(t,[[-25,17],[26,-21]],"#2a2e2c",2.8),Ot(t,[[-25,-15],[28,17]],"#50301d",2.8),t.restore(),Tn(t,"Mike \u7684\u7ECF\u6D4E\u4E00\u9875\u901A",357,293,59,{align:"center",font:Ri,color:"#3f342e",weight:400}),Ot(t,[[236,325],[478,325]],"#433227a0",1),e}function u_(i,e,t,n){let s=hc(i,600,848),r=s.getContext("2d"),a=t===0?600:0,o=t===0?543:57,l=r.createLinearGradient(a,0,o,0);l.addColorStop(0,"#49351948"),l.addColorStop(.3,"#49351b21"),l.addColorStop(1,"#49351b00"),r.fillStyle=l,r.fillRect(0,0,600,848);let c=a===0?600:0,h=r.createLinearGradient(c,0,a===0?572:28,0);h.addColorStop(0,"#9e846633"),h.addColorStop(1,"#9e846600"),r.fillStyle=h,r.fillRect(0,0,600,848),e.kind!=="end"&&(e.kind!=="journal"||e.pages[t])&&Tn(r,jo(e,t,n),49,77,39,{font:Ri,weight:400,color:"#31433a"}),r.save(),t===0&&(r.translate(600,0),r.scale(-1,1));for(let d of[106,265,424,583,742])r.fillStyle="#654e39",r.beginPath(),r.ellipse(8,d+3,2,4,-.24,0,2*Math.PI),r.fill(),r.strokeStyle="#7c674c",r.lineWidth=3.3,r.beginPath(),r.moveTo(0,d),r.quadraticCurveTo(4,d-1,8,d+3),r.stroke(),r.strokeStyle="#e0cba4",r.lineWidth=1.6,r.stroke();r.restore(),Ot(r,[[49,102],[551,102]],"#8e816d93"),Ot(r,[[49,752],[551,752]],"#9d8b71a8");let u=e.pages?.[t];if(u)for(let d of u.lines)r.font=Ed(d.kind),r.fillStyle=ec[d.kind].color,r.textAlign="left",r.fillText(d.text,56,d.y);return e.kind==="end"&&t===1&&Tn(r,"\u5185\u5BB9\u66F4\u65B0\u4E2D\u3002\u3002\u3002",300,429,42,{align:"center",font:Ri,weight:400}),(e.kind!=="journal"||u)&&Tn(r,String(u?.number??n*2+t+1).padStart(2,"0"),300,802,22,{align:"center",font:"Georgia",color:"#5b5144"}),s}function ih(i){let e=new Image;return e.src=i,e.decode().then(()=>e)}async function d_(i,e){let t=hc(i,680,374,e.tint),n=t.getContext("2d"),s=await ih("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(e.svg)),r=n.createLinearGradient(0,0,0,65);r.addColorStop(0,"#fff7de53"),r.addColorStop(1,"#fff7de00"),n.fillStyle=r,n.fillRect(0,0,680,65),Ot(n,[[35,40],[645,38]],"#26354659",1.2);let a={bookself:"\u4E92\u52A8\u6559\u6750",econquest:"\u7ECF\u6D4E\u95EF\u5173"}[e.id];n.drawImage(s,34,103,231,182);let o=e.title.length>=10?36:44,l=e.title;e.id==="nebs"&&(l="NEBS \u80A1\u7968\u4EA4\u6613\u5927\u8D5B");let c=()=>(n.font=`400 ${o}px ${Ri}`,n.measureText(l).width);return c()>370?(n.save(),n.translate(272,a?176:202),n.scale(370/c(),1),Tn(n,l,0,0,o,{font:Ri,weight:400}),n.restore()):Tn(n,l,272,a?176:202,o,{font:Ri,weight:400}),a&&Tn(n,a,275,223,24,{color:"#35453f",weight:500}),Ot(n,[[37,296],[639,297]],"#26354655",1.25),Ot(n,[[592,326],[626,326],[615,316]],eh,2.2),Ot(n,[[626,326],[615,336]],eh,2.2),t}async function f_(i,e){let s=hc(i,960,1160),r=s.getContext("2d"),a=e.id==="teacher-workspace",o=await ih("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(a?Pd:e.svg));return r.fillStyle=a?"#e7ebd7":"#f8e9c5",r.fillRect(0,0,960,1160),r.globalCompositeOperation="multiply",r.globalAlpha=.35,r.drawImage(i,0,0,960,1160),r.globalAlpha=1,r.drawImage(o,110,113,740,740*o.height/o.width),r.globalCompositeOperation="source-over",cc(r,25,25,910,1110,3,"#796a4988",3),cc(r,36,36,888,1088,2,"#84745466",1),Tn(r,e.title,70,863,a?96:82,{font:Ri,weight:400}),Ot(r,[[72,918],[884,918]],"#7b705d",1.8),Ot(r,[[811,1060],[871,1060],[854,1045]],"#314b42",3),Ot(r,[[871,1060],[854,1075]],"#314b42",3),s}function p_(i){let e=i.image.getContext("2d"),t=e.getImageData(63,924,738,189);return n=>{e.putImageData(t,63,924);let s=[],r=n.length>1;for(let[a,o]of n.entries()){let l=72+a*365,c=52,h=o.detail?992:1024,u=r?328:704;e.font=`500 ${c}px ${Dd}`;let d=Array.from(o.label),p=o.label;for(;d.length&&e.measureText(p).width>u;)d.pop(),p=d.join("")+"\u2026";let x=e.measureText(p).width;Tn(e,p,l,h,c,{color:"#314d43",weight:500}),Ot(e,[[l,h+9],[l+x,h+9]],"#556c5a",2.5),o.detail&&Tn(e,o.detail,l,1080,39,{color:"#465843",weight:500});let _=h-c*.34,m=o.detail?68:84;s.push([l-9,_-m,l+x+12,_+m])}return i.needsUpdate=!0,s}}function vt(i,e=null,t={}){return new Er({color:i,map:e,roughness:.9,...t})}function sn(i,e,t,n,s,r,a=!0){let o=new qt(e,t);return o.position.set(n,s,r),o.castShadow=a,o.receiveShadow=!0,i.add(o),o}function oc(i,e,t,n,s,r,a,o,l){return sn(i,new tc(r,a,o,3,l),e,t,n,s)}function ts(i,e,t,n,s,r,a,o=!0){return sn(i,new tn(r,a),e,t,n,s,o)}function Hr(i,e,t,n,s,r,a,o,l=48){let c=sn(i,new Os(r,a,o,l),e,t,n,s);return c.rotation.x=Math.PI/2,c}function Ld(i,e,t,n,s,r,a){return sn(i,new Tr(r,a,10,64),e,t,n,s)}function Kl(i=Ci,e=Ys,t=""){let n=new tn(i,e,32,24),s=n.attributes.position;for(let r=0;r<s.count;r++){let a=s.getX(r),o=s.getY(r),l=a/i+.5,c=o/e+.5,h=0;t==="resources"?h=-.1*Math.min(1,Math.max(0,(l-.24)*16))*c**5:t==="nebs"&&(h=.024*(r%2)*(1-c)**9),s.setY(r,o+h),(Math.abs(a)>i/2-.01||Math.abs(o)>e/2-.01)&&s.setXY(r,a+Math.sin(o*47)*.0035,o+h+Math.cos(a*51)*.0035)}return n.morphAttributes.position=[.94,2.05].flatMap((r,a)=>th.map(([o,l])=>{let c=a===0?1.25:2.63,h=r/c,u=new Float32Array(s.count*3);for(let d=0;d<s.count;d++){let p=s.getX(d),x=s.getY(d),_=(i/2-o*p)*.72+(e/2-l*x)*.7;if(t==="resources"&&a===0){let T=x/e+.5,M=.19*T*T;u.set([p,-e/2+(x+e/2)*Math.cos(M),Math.sin(M)*(x+e/2)],d*3);continue}let m=Math.max(0,1-_/r)*c,f=h*(m-Math.sin(m));u.set([p-f*o*.72,x-f*l*.7,h*(1-Math.cos(m))],d*3)}return new Ht(u,3)})),n.morphAttributes.normal=n.morphAttributes.position.map(r=>{let a=new Xt;return a.setIndex(n.index),a.setAttribute("position",r),a.computeVertexNormals(),a.attributes.normal}),n}var m_=-.003;function Ql(i){let e=i.clone(),t=e.index.array;for(let n=0;n<t.length;n+=3)[t[n+1],t[n+2]]=[t[n+2],t[n+1]];for(let n of[e.attributes.normal,...e.morphAttributes.normal])for(let s=0;s<n.array.length;s++)n.array[s]*=-1;return e}function x_(){let i=Ii(160,100),e=i.getContext("2d");return e.shadowColor="#4937229c",e.shadowBlur=9,e.shadowOffsetX=2,e.shadowOffsetY=3,e.fillStyle="#49382348",e.beginPath(),e.roundRect(9,10,142,77,3),e.fill(),wn(i)}function jl(i,e,t,n,s,r,a,o=Ci,l=Ys){let c=new fn;i.add(c),c.rotation.order="YXZ";let h=sn(c,s,vt("#ffffff",n),0,0,0),u=sn(c,r,vt(e.tint,null,{roughness:1}),0,0,m_,!1);u.morphTargetInfluences=h.morphTargetInfluences;let d=ts(c,new Nn({map:a,transparent:!0,depthWrite:!1,opacity:.6}),.006,-.014,-.02,o*1.145,l*1.17,!1);return d.receiveShadow=!1,{root:c,rect:h,rear:u,shadow:d,flatGeo:s,item:e,y:t%2===0?.88:-.81,w:o,h:l,angle:[.027,-.037,-.021,.032][t],corner:1,lift:0}}function g_(i,e,t){let n={value:0},s=wn(e);return i.onBeforeCompile=r=>{r.uniforms.paperInk={value:s},r.uniforms.paperAmount=n,r.fragmentShader=`uniform sampler2D paperInk;
uniform float paperAmount;
`+r.fragmentShader,r.fragmentShader=r.fragmentShader.replace("#include <map_fragment>",`#include <map_fragment>
      vec4 mark=texture2D(paperInk,vMapUv);
      float distanceInMark=${t==="right"?"(vMapUv.x-.20)/.51":"(vMapUv.y-.38)/.31"};
      float shown=1.0-smoothstep(paperAmount-.025,paperAmount+.025,distanceInMark);
      diffuseColor.rgb=mix(diffuseColor.rgb,mark.rgb,mark.a*shown);`)},i.customProgramCacheKey=()=>"paper-ink-"+t,{amount:n,started:null}}function sh(i,e,t){let n=Math.PI*e,s=Math.sin(Math.PI*e)*1.08/Ze;return Math.abs(s)<1e-5?t.set(i*Math.cos(n),0,i*Math.sin(n)):t.set((Math.sin(n+s*i)-Math.sin(n))/s,0,(Math.cos(n)-Math.cos(n+s*i))/s)}var rh=(i,e)=>Math.PI*e+Math.sin(Math.PI*e)*1.08*i/Ze;function __(i){let e=new tn(Ze,nn,64,18);e.translate(Ze/2,0,0);let t=e.clone(),n=t.index.array,s=t.attributes.uv;for(let a=0;a<s.count;a++)s.setX(a,1-s.getX(a));for(let a=0;a<n.length;a+=3)[n[a+1],n[a+2]]=[n[a+2],n[a+1]];return{faces:[sn(i,e,vt("#fffaf0"),0,0,0),sn(i,t,vt("#fffaf0"),0,0,0,!1)],base:e.attributes.position.array.slice()}}function ah(i,e,t,n){let s=Math.max(0,(t*i/Ze-.19)/.31),r=Math.max(0,(-e/nn-.32)/.18);return .26*n*s*s*r*r}function Ud(i,e,t){for(let[n,s]of i.faces.entries()){let r=s.geometry,a=r.attributes.position,o=r.attributes.normal,l=n===0?.001:-.001;for(let c=0;c<a.count;c++){let h=i.base[3*c],u=rh(h,e),d=-Math.sin(u),p=Math.cos(u);sh(h,e,$l);let x=i.base[3*c+1],_=ah(h-Ze/2,x,1,t)+nh(h)*Math.cos(Math.PI*e);a.setXYZ(c,$l.x+d*(l+_),x,$l.z+p*(l+_)),o.setXYZ(c,n?-d:d,0,n?-p:p)}a.needsUpdate=!0,o.needsUpdate=!0,r.computeBoundingSphere(),s.frustumCulled=!1}}function v_(i,e){let t=Ii(1280,850);t.getContext("2d").drawImage(e,0,0,1280,850);let s=wn(t);s.wrapS=s.wrapT=As,s.repeat.set(5,5);let r=ts(i,vt("#817468",s),0,0,-.21,72,48,!1),a=Ii(200,200),o=a.getContext("2d"),l=o.createRadialGradient(100,100,15,100,100,100);l.addColorStop(0,"#ffe1aa80"),l.addColorStop(.32,"#f7ca965c"),l.addColorStop(.65,"#dbad762a"),l.addColorStop(1,"#ae886500"),o.fillStyle=l,o.fillRect(0,0,200,200);let c=ts(i,new Nn({map:wn(a),transparent:!0,depthWrite:!1}),-2.7,1.76,-.195,7.4,6.6,!1);return c.receiveShadow=!1,{top:r,pool:c}}function y_(i){let e=new fn;e.position.copy(lc),e.position.z=0,i.add(e);let t=vt("#d4ab6f"),n=vt("#3a3b33"),s=vt("#849d8c");Hr(e,n,-.23,.4,-.08,.48,.56,.15),Hr(e,t,-.23,.4,.022,.51,.5,.054),Hr(e,s,-.23,.4,.079,.47,.49,.069);let r=new Bs([new P(-.31,.48,.15),new P(-.45,.44,.52),new P(-.2,.25,.82),new P(.39,-.06,.85)]);sn(e,new Ar(r,22,.059,10,!1),t,0,0,0);let a=sn(e,new wr(.52,42,20,0,2*Math.PI,0,Math.PI*.53),s,.36,-.26,.61);a.rotation.x=Math.PI/2,Ld(e,t,.36,-.26,.59,.512,.025);let o=Hr(e,vt("#fff1ce",null,{emissive:"#e5a76a",emissiveIntensity:.3}),.36,-.26,.57,.495,.495,.034);Ld(e,t,.36,-.26,1.112,.085,.021);let l=Hr(e,t,-.24,.66,.16,.091,.103,.055),c=new Ir("#ffd0a3",10,8,2);return c.position.set(-3.28,1.22,2.23),i.add(c),{root:e,bulb:c,shadeUnder:o,button:l}}function b_(i){let e=new fn;i.add(e),e.position.copy(Wr),e.rotation.z=-1.1;let t=vt("#c8934e"),n=vt("#dab882"),s=vt("#263141"),r=vt("#afa6a2",null,{metalness:.04,roughness:.92}),a=vt("#995b56"),o=(u,d,p,x,_,m=6)=>{let f=sn(e,new Os(p,x,_,m),u,d,0,0);return f.rotation.z=Math.PI/2,f};o(t,.02,.063,.063,1.36),o(n,-.783,.017,.064,.245),o(s,-.925,.002,.022,.085),o(r,.745,.071,.07,.17,18),o(a,.866,.061,.062,.14,18);for(let u of[.69,.74,.79])o(r,u,.072,.072,.018,18);let l=Ii(128,48),c=l.getContext("2d");c.scale(64,24);let h=c.createRadialGradient(1,1,0,1,1,1);return h.addColorStop(0,"#382b23bf"),h.addColorStop(.48,"#382b2366"),h.addColorStop(1,"#382b2300"),c.fillStyle=h,c.fillRect(0,0,2,2),e.userData.shade=ts(i,new Nn({map:wn(l),transparent:!0,depthWrite:!1}),0,0,0,2.08,.24,!1),e}function M_(i){let e=Ii(384,200),t=e.getContext("2d"),n=wn(e),s=1.02,r=.53,a=sn(i,new tn(s,r),vt("#fff8eb",n,{alphaTest:.5}),0,0,-.052,!1);a.name="Notebook journal bookmark",a.rotation.z=.025,a.visible=!1;let o=t.createLinearGradient(0,0,0,e.height);o.addColorStop(0,"#ead39b"),o.addColorStop(.63,"#d9b375"),o.addColorStop(1,"#a98753");function l(c,h){t.clearRect(0,0,e.width,e.height),t.beginPath(),t.moveTo(12,13),t.lineTo(336,3),t.lineTo(377,38),t.lineTo(374,200),t.lineTo(7,200),t.closePath(),t.fillStyle=o,t.fill(),t.strokeStyle="#83653e",t.lineWidth=5,t.stroke(),t.beginPath(),t.moveTo(336,3),t.lineTo(340,41),t.lineTo(377,38),t.fillStyle="#bc9b60",t.fill(),Tn(t,c,h?171:192,86,47,{align:"center",color:"#443019"}),h&&(t.beginPath(),t.arc(306,57,12,0,2*Math.PI),t.fillStyle="#ab3327",t.fill()),n.needsUpdate=!0}return{ribbon:a,paint:l,width:s,height:r}}async function Nd(i,e){let[t,n,s]=await Promise.all([...["desk-grain","cover-cloth","folio-paper"].map(B=>ih("/assets/notebook/"+B+".svg")),document.fonts.load('400 32px "Desk Hand"',"\u6559\u5B66\u4E0E\u73ED\u7EA7 Mike").catch(()=>{})]),r=new vr;r.background=new qe("#342720");let{pool:a}=v_(r,t),o=y_(r),l=b_(r),c=new fn;c.name="Notebook",r.add(c);let h=new fn;h.position.z=.14,c.add(h);let u=vt("#785133"),d=vt("#d3bda1"),p=vt("#e9dcc2"),x=oc(c,u,Ze/2,0,-.1,Ze+.17,nn+.18,.16,.075),_=oc(h,u,-Ze/2,0,-.1,Ze+.17,nn+.18,.15,.075),m=h_(n),f=Ii(340,480),T=f.getContext("2d");T.fillStyle="#888",T.fillRect(0,0,340,480),T.scale(.5,.5),Tn(T,"Mike \u7684\u7ECF\u6D4E\u4E00\u9875\u901A",357,293,59,{align:"center",font:Ri,color:"#555",weight:400}),Ot(T,[[61,23],[61,937]],"#676767",4);let M=ts(h,vt("#fffaf1",wn(m)),-Ze/2,0,-.178,Ze+.115,nn+.13,!1);e||(M.material.bumpMap=new Fs(f),M.material.bumpScale=.008),M.rotation.y=Math.PI,oc(c,vt("#463427"),0,0,-.09,.18,nn+.11,.15,.055);for(let[B,V]of[[h,-1],[c,1]])for(let W=0;W<7;W++){let X=(W%3-1)*.009;oc(B,W%2===0?p:d,V*(Ze/2+X),X,-.033+W*.009,Ze+.01,nn+.01,.01,.005)}let A=Kl(),C=Ql(A),S=x_(),R=(B,V=0)=>Promise.all(B.map(async(W,X)=>{let te=V+X,H=[0,1].map(_e=>wn(u_(s,W,_e,te))),ne=H.map((_e,Ve)=>{let Ke=sn(c,new tn(Ze,nn,64,12),vt("#fffdf9",_e),Ve===0?-Ze/2:Ze/2,0,ns,!1);return Ke.frustumCulled=!1,Ke}),be=(await Promise.all(W.entries.map(async(_e,Ve)=>{if(!_e)return null;if(te===0&&Ve===0){let Ie=Kl(2.98,3.6),ge=jl(c,_e,Ve,wn(await f_(s,_e)),Ie,Ql(Ie),S,2.98,3.6);return{...ge,paintTask:p_(ge.rect.material.map),slot:Ve,y:-.04,angle:.009}}let Ke=Rd(_e.id);if(Ke){let{face:J,inkCanvas:de}=Id(s,Ke),Ie=_e.id==="resources"||_e.id==="nebs",ge=Ie?Kl(Ci,Ys,_e.id):A,Ce=jl(c,_e,Ve,wn(J),ge,Ie?Ql(ge):C,S);if(Ce.rear.material.color.set(Ke.stock),_e.id==="resources"&&ts(Ce.root,vt("#f2e5c9"),0,.09,-.009,Ci*.95,Ys*.87,!1),_e.id==="nebs"){let Tt=J.width*.73,Fe=Ii(J.width-Tt,J.height);Fe.getContext("2d").drawImage(J,Tt,0,Fe.width,Fe.height,0,0,Fe.width,Fe.height),Ce.stub=ts(Ce.root,vt("#ffffff",wn(Fe)),Ci*.365,0,.007,Ci*.27,Ys,!1);let E=new tn(Ci*.73,Ys),Ge=E.attributes.uv;for(let ke=0;ke<Ge.count;ke++)Ge.setX(ke,Ge.getX(ke)*.73);Ce.ticketBody=sn(Ce.root,E,Ce.rect.material,-Ci*.135,0,.001,!1),Ce.stub.visible=Ce.ticketBody.visible=!1}return de&&(Ce.ink=g_(Ce.rect.material,de,Ke.axis)),{...Ce,slot:Ve}}let it=await d_(s,_e);return{...jl(c,_e,Ve,wn(it),A,C,S),slot:Ve}}))).filter(Boolean);for(let _e of be){let Ve=_e.slot<2;_e.root.position.set(Ve?-Ze/2:Ze/2,_e.y,Xr),_e.root.rotation.z=_e.angle}return{sides:ne,surfaces:H,cards:be}})),N=await R(i),b=__(c),y=M_(c),L=new Pr("#efe5d2",.93);L.position.set(-4.2,4.3,8.2),L.castShadow=!0,L.shadow.mapSize.setScalar(e?1024:2048),L.shadow.camera.left=-7,L.shadow.camera.right=7,L.shadow.camera.top=6,L.shadow.camera.bottom=-6,L.shadow.bias=-4e-4,L.shadow.normalBias=.024,L.shadow.radius=6,L.shadow.blurSamples=7;let O=new Rr("#e1e3e4","#a18b75",1.1);return r.add(L,O),{scene:r,book:c,hinge:h,boards:[x,_,M],spreads:N,addSpreads:R,leaf:b,bookmark:y,lamp:o,pencil:l,pool:a,key:L,room:O,coverArt:m}}var Fd=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 185" fill="none" stroke="#506358" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#d7b784" d="M32 131q63-24 123-9 59-28 127-24l-3 13q-63-1-123 25-75-15-124 5z"/><path fill="#f9ebca" d="M37 61q68-13 116 9 44-32 119-34l10 61q-62 1-127 29-59-21-122 5z"/><path d="m153 70 2 54m-91-39q28-4 58 5m58-17q31-16 62-17" opacity=".65"/><path d="m200 120 9-13 52-37 6 7-55 38z" fill="#c88e64"/></svg>
`;var je=i=>document.getElementById(i),wc=je("desk"),Jn=je("scene"),lh=je("desk-cover"),w_=je("fallback"),T_=je("hotspots"),Wd=je("desk-start"),$t=je("penSpot"),on=je("news-tab"),as=je("prev"),Tc=je("next"),gc=je("lampSpot"),_c="mike:notebook:return",yt=[],Pi=!1,rn=0,Zn=null,Pt=()=>yt[Je]?.kind==="journal",vc=i=>yt[i]?.kind==="end"?1:0,Cn=matchMedia("(prefers-reduced-motion: reduce)"),Xd=matchMedia("(hover:hover) and (pointer:fine)"),Lt=()=>innerWidth<=720&&innerHeight>innerWidth,Js=i=>i*i*(3-2*i),It=Ti.lerp,yc=i=>Ti.clamp(i,0,1),qr=new P,oh=new P,Le="cover",j=null,mt=null,at=null,hi=0,pc=0,Yn=0,Je=0,$e=0,cn=0,wt=null,ss=null,Jr=null,ch=1,Bt=0,An=0,$r=0,En=!1,os=0,hh=!0,Yr=!0,ci=1,Zt=Wr.clone(),rs=-1.1,an=null,Di=!1,uh=!1,Jt=null,$s=0,dh=null,ls=!1,cs=0,ph=0,Kr=!1,uc=document.hidden?performance.now():null,Ks=new Map,Zr=[],Od,Bd="";je("sketch").innerHTML=Fd;je("sketch").querySelectorAll("path").forEach(i=>i.setAttribute("pathLength","1"));function lt(){!document.hidden&&!hi&&j&&mt&&(hi=requestAnimationFrame(B_))}function Kt(i,e){Le=i,document.body.dataset.phase=i,e&&(je("status").textContent=e),jr(),lt()}function Li(){return j?.spreads[Je]?.cards||[]}function qd(){let i=yt[Je].entries;return(Lt()?i.slice($e*2,$e*2+2):i).filter(Boolean)}function bc(i){return yt[i].kind==="end"?1:yt[i].kind==="journal"?yt[i].pages[1]?1:0:yt[i].entries.slice(2).some(Boolean)?1:0}function Ac(i,e){return Lt()?Math.max(vc(i),Math.min(bc(i),e)):0}function mh(){return Lt()&&$e<bc(Je)||Je<(Pt()?yt.length:rn)-1}function Qr(){return Lt()&&$e>vc(Je)||Je>(Pt()?rn:0)}function jr(){let i=Le==="open"&&!Pi,e=["open","turning","shifting"].includes(Le);on.hidden=Pi||!mt||Le==="loading";let t=Pt()&&(!Zn?.cover||Le==="open");on.toggleAttribute("data-return",t),on.disabled=!i&&Le!=="cover",on.setAttribute("aria-label",t?"\u8FD4\u56DE\u539F\u9875":on.dataset.loadState==="error"?"\u66F4\u65B0\u65E5\u5FD7\u672A\u8F7D\u5165\uFF0C\u91CD\u8BD5":"\u6700\u65B0\u53D8\u5316"+(on.hasAttribute("data-unread")?"\uFF0C\u6709\u672A\u8BFB\u66F4\u65B0":"")),as.hidden=!i||!mt;let n=Qr()?"\u4E0A\u4E00\u9875":Pt()?"\u8FD4\u56DE\u539F\u9875":"\u5408\u4E0A\u7B14\u8BB0\u672C";as.setAttribute("aria-label",n),as.title=n,Tc.hidden=!i||!mh()||!mt,je("rail").hidden=!e,je("sectionName").textContent=Lt()?jo(yt[Je],$e,Je):yt[Je].name;let s=yt[Je],r=s.pages?.[0]?.number??Je*2+1,a=je("journal-transcript");a.textContent=Pt()?(Lt()?[s.pages[$e]]:s.pages).filter(Boolean).flatMap(c=>c.lines.map(h=>h.text)).join(`
`):"",je("pageNumber").textContent=Lt()||Pt()&&!s.pages[1]?String(r+$e).padStart(2,"0"):`${String(r).padStart(2,"0")}\u2013${String(r+1).padStart(2,"0")}`,document.body.dataset.spread=String(Je),document.body.dataset.side=String($e),document.body.dataset.bookSection=s.kind||"entries",lh.hidden=Pi||Le!=="cover"||!mt;let o=!j||!mt;w_.hidden=!o,Jn.hidden=o;let l=new Set(qd());for(let[c,h]of Ks)h.hidden=o||!i||!l.has(c),h.tabIndex=h.hidden?-1:0;for(let{action:c,card:h}of Zr)c.hidden=Ks.get(h.item).hidden;o&&(je("rail").hidden=!0),gc.setAttribute("aria-pressed",String(Yr)),gc.hidden=$t.hidden=o||Le==="loading"}function Ec(i,e,t,n){wt={kind:i,seconds:e,step:t,end:n,started:performance.now(),origin:0,rate:1},(!mt||!j||Cn.matches)&&(wt=null,t(1),n()),lt()}function hs(i,e){if(i&&Le!=="cover"||!mt||!i&&Le!=="open")return;Qs(),Bt=An=0,En=!1,Ui();let t=Yn,n=i?1:0,s=os;Kt(i?"opening":"closing",i?"\u6B63\u5728\u7FFB\u5F00\u7B14\u8BB0\u672C":"\u6B63\u5728\u5408\u4E0A\u7B14\u8BB0\u672C"),Ec("cover",i?.68:.63,r=>{Yn=It(t,n,Js(r)),os=s*(1-r)},()=>{i?(Kt("open",yt[Je].name),Yd&&Zd()):(Jr=null,Je=$e=cn=0,Zn=null,_h(),ea(),Kt("cover","\u5DF2\u56DE\u5230\u5C01\u9762"),je("open-cover").focus({preventScroll:!0})),e?.()})}var Yd=!1;function xh(i,e=!1){if(!mt||Le!=="open"||i>0&&!mh())return;if(i<0&&!Qr()){Pt()?vh():hs(!1);return}Qs(),Ui(),En=!1;let t=Math.max(0,An*i);if(Bt=An=0,ls=!0,ph=i,Kr=e,Lt()&&(i>0&&$e<bc(Je)||i<0&&$e>vc(Je))){let s=cn,r=$e+i;Kt("shifting"),Ec("side",.49,a=>{let o=Js(a);cn=It(s,r,o),$r=(t*(1-o)+Math.sin(Math.PI*o)*.9)*i},()=>{cn=$e=r,$r=0,yh(i,e)});return}let n=Je+i;gh(n,Lt()?i<0?bc(n):vc(n):0,i,e,t)}async function gh(i,e,t,n,s=0,r){if(Qs(),Ui(),Bt=An=0,!j.spreads[i]){Kt("binding");try{[j.spreads[i]]=await j.addSpreads([yt[i]],i)}catch{ls=!1,cs=0,Kt("open","\u65E5\u5FD7\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u91CD\u8BD5\u3002"),Pt()||document.dispatchEvent(new Event("notebook:journal-error"));return}if(!mt)return}let a=cn,o=t>0?0:1,l=1-o,c=Math.min(Je,i),h=Math.max(Je,i);Kt("turning",t>0?"\u5F80\u540E\u7FFB\u9875":"\u5F80\u524D\u7FFB\u9875"),I_(c,h),Vd(c,h,o,s),Ec("page",.66,u=>{let d=Js(u);Vd(c,h,It(o,l,d),s*(1-d)),cn=It(a,e,d)},()=>{Je=i,cn=$e=e,_h(),yh(t,n),r?.()})}function _h(){for(let i=rn;i<j.spreads.length;i++){let e=j.spreads[i];if(!(i===Je||!e)){for(let t of e.sides)t.removeFromParent(),t.geometry.dispose(),t.material.map.dispose(),t.material.dispose();delete j.spreads[i]}}}document.addEventListener("notebook:journal",async({detail:{pages:i,onRead:e}})=>{if(Pi||!mt||!["open","cover"].includes(Le)||Pt())return;Zn={index:Je,side:$e,cover:Le==="cover"},yt.length=rn;for(let n=0;n<i.length;n+=2)yt.push({kind:"journal",name:"\u66F4\u65B0\u65E5\u5FD7",entries:[],pages:i.slice(n,n+2)});let t=()=>{if(!mt||!Pt())return;e(),on.focus({preventScroll:!0});let n=j.spreads[rn]?.surfaces[0];if(!n)return;let s=n.image.getContext("2d"),r=performance.now(),a=0,o=l=>{if(!mt||Le!=="open"||Je!==rn||j.spreads[rn]?.surfaces[0]!==n)return;let c=Cn.matches?1:Math.min(1,(l-r)/220);s.save(),s.strokeStyle="#996b47",s.lineWidth=2,s.beginPath(),s.moveTo(50+126*a,88),s.lineTo(50+126*c,88),s.stroke(),s.restore(),a=c,n.needsUpdate=!0,lt(),c<1&&requestAnimationFrame(o)};requestAnimationFrame(o)};if(!Zn.cover){gh(rn,0,1,!1,0,t);return}Kt("binding");try{[j.spreads[rn]]=await j.addSpreads([yt[rn]],rn)}catch{Kt("cover","\u65E5\u5FD7\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u91CD\u8BD5\u3002"),document.dispatchEvent(new Event("notebook:journal-error"));return}mt&&(Je=rn,$e=cn=0,Kt("cover"),hs(!0,t))});function vh(){if(Le!=="open"||!Zn||!Pt())return;if(Zn.cover){hs(!1);return}let i=Zn;gh(i.index,Ac(i.index,i.side),-1,!1,0,()=>{Zn=null,on.focus({preventScroll:!0})})}document.addEventListener("notebook:return",vh);function ea(i=!1){try{let e=new URL(location.href);i?e.searchParams.set("deskPage",String(2*Je+$e)):e.searchParams.delete("deskPage"),history.replaceState({...history.state,notebookSpread:Pt()?Zn?.index:Je,notebookSide:Pt()?Zn?.side:$e},"",e)}catch{}}function yh(i,e){e=e||Kr,Kr=!1;let t=cs;if(cs=0,ls=!1,$e=Ac(Je,$e),cn=$e,Kt("open"),je("status").textContent=je("sectionName").textContent+"\uFF0C\u7B2C "+je("pageNumber").textContent+" \u9875\u3002",ea(),t){xh(t,e);return}if(e){let n=i>0?Tc:as;n.hidden?Zd():n.focus({preventScroll:!0})}}function Zd(){let i=qd()[0];(Ks.get(i)||as).focus({preventScroll:!0})}function Qs(){ss=null,lt()}function zd(i,e){let t=e.getBoundingClientRect();return(i.clientX>=t.left+t.width/2?1:0)+(i.clientY<t.top+t.height/2?2:0)}function Jd(){for(let i of yt.flatMap(e=>e.entries).filter(Boolean)){let e=document.createElement("a");e.className="hot entry",e.href=i.href,e.hidden=!0,e.setAttribute("aria-label","\u8FDB\u5165 "+i.title),e.dataset.entry=i.id,e.onpointerenter=t=>{if(!Xd.matches||t.pointerType==="touch"||Le!=="open")return;let n=Li().find(s=>s.item===i);n&&(n.corner=zd(t,e)),ss=i,lt()},e.onpointerleave=()=>{ss===i&&Qs()},e.onfocus=()=>{if(!e.matches(":focus-visible"))return;let t=Li().find(n=>n.item===i);t&&(t.corner=3),ss=i,lt()},e.onblur=()=>{ss===i&&Qs()},e.onpointerdown=t=>{t.pointerType==="touch"&&Le==="open"&&jd(i)},e.onclick=t=>{if(t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return;t.preventDefault();let n=Li().find(s=>s.item===i);E_(i,t.detail===0?3:ss===i&&n?n.corner:zd(t,e),e)},Ks.set(i,e),T_.append(e)}}je("open-cover").onclick=i=>{Yd=i.detail===0,hs(!0)};for(let[i,e]of[[as,-1],[Tc,1]])i.onclick=t=>xh(e,t.detail===0),i.onpointerenter=t=>{Xd.matches&&t.pointerType!=="touch"&&(Bt=e,En=e<0&&!Pt()&&!Qr(),lt())},i.onpointerleave=()=>{Bt===e&&(Bt=0,En=!1,lt())},i.onfocus=()=>{i.matches(":focus-visible")&&(Bt=e,En=e<0&&!Pt()&&!Qr(),lt())},i.onblur=()=>{Bt===e&&(Bt=0,En=!1,lt())};gc.onclick=()=>{Yr=!Yr,jr(),je("status").textContent=Yr?"\u53F0\u706F\u5DF2\u6253\u5F00":"\u53F0\u706F\u5DF2\u5173\u95ED",lt()};function $d(){Di=!0,$t.setAttribute("aria-pressed","true"),lt()}function Ui(){if(!Di&&!an)return;let i=an?.id;an=null,Di=!1,$t.setAttribute("aria-pressed","false"),i!==void 0&&$t.hasPointerCapture(i)&&$t.releasePointerCapture(i),lt()}function A_(){return(at.top-at.bottom)/Jn.clientHeight}function Kd(i,e){Zt.x=Ti.clamp(i,at.position.x+at.left+.82,at.position.x+at.right-.82),Zt.y=Ti.clamp(e,at.position.y+at.bottom+.38,at.position.y+at.top-.38),uh=!0,lt()}$t.onpointerdown=i=>{!j||!i.isPrimary||i.button!==0||!["open","cover"].includes(Le)||(an={id:i.pointerId,x:i.clientX,y:i.clientY,px:j.pencil.position.x,py:j.pencil.position.y,angle:rs},Jt=null,$t.setPointerCapture(i.pointerId),$d())};$t.onpointermove=i=>{if(!an||an.id!==i.pointerId)return;let e=i.clientX-an.x,t=i.clientY-an.y,n=A_();Math.hypot(e,t)<3||(Kd(an.px+e*n,an.py-t*n),rs=an.angle+Ti.clamp(e*.002,-.2,.2))};$t.onpointerup=$t.onpointercancel=$t.onlostpointercapture=i=>{an?.id===i.pointerId&&Ui()};$t.onclick=i=>{i.detail===0&&!an&&(Di?Ui():$d())};$t.onblur=()=>{an||Ui()};wc.addEventListener("touchstart",i=>{if(Jt=null,!mt||!ls&&Le!=="open"||i.touches.length!==1||i.target.closest("#masthead,.prop,.page-corner,#news-tab"))return;let{identifier:e,clientX:t,clientY:n}=i.touches[0];Le==="open"&&($s=0),Jt={identifier:e,x:t,y:n,moved:!1}},{passive:!0});wc.addEventListener("touchmove",i=>{if(!Jt)return;let e=Array.from(i.touches).find(s=>s.identifier===Jt.identifier);if(!e||i.touches.length!==1){Jt=null,Bt=0,En=!1,lt();return}let t=e.clientX-Jt.x,n=e.clientY-Jt.y;if(Math.hypot(t,n)>12&&(Jt.moved=!0),Le==="open"&&!Cn.matches){let s=Math.abs(t)>Math.abs(n)*1.45,r=t<0?1:-1;Bt=s&&Jt.moved&&(r<0||mh())?r*Math.min(.94,Math.abs(t)/105):0,En=Bt<0&&!Qr()&&!Pt(),lt()}},{passive:!0});wc.addEventListener("touchend",i=>{if(!Jt)return;let e=Jt;Jt=null,Bt=0,En=!1,lt();let t=Array.from(i.changedTouches).find(a=>a.identifier===e.identifier);if(!t||i.touches.length)return;let n=t.clientX-e.x,s=t.clientY-e.y;(e.moved||Math.hypot(n,s)>12)&&($s=performance.now()+470,i.cancelable&&i.preventDefault());let r=Ti.clamp(Jn.clientWidth*.145,42,64);Math.abs(n)>r&&Math.abs(n)>Math.abs(s)*1.45&&($s=performance.now()+470,Qd(n<0?1:-1))},{passive:!1});wc.addEventListener("touchcancel",()=>{Jt=null,Bt=0,En=!1,lt(),$s=performance.now()+470},{passive:!0});function Qd(i,e=!1){if(!ls){xh(i,e);return}if(Kr=e,!wt||!["page","side"].includes(wt.kind)){cs=i;return}let t=i===ph?1:-1;if(cs=t===1&&wt.rate===1?i:0,t===wt.rate)return;let n=performance.now();wt.origin=af(wt,n),wt.started=n,wt.rate=t,lt()}document.addEventListener("keydown",i=>{if(!(!mt||Pi||i.defaultPrevented||i.ctrlKey||i.altKey||i.metaKey||i.target.closest("input,textarea,select, [contenteditable], .portal-account")||i.target.id==="mike-companion")){if(i.target===$t&&Di&&i.key.startsWith("Arrow")){i.preventDefault();let e={ArrowLeft:[-.24,0],ArrowRight:[.24,0],ArrowUp:[0,.24],ArrowDown:[0,-.24]},[t,n]=e[i.key];Kd(Zt.x+t,Zt.y+n);return}if(i.key==="Escape"){if(Di){Ui();return}Le==="loading"?ef():Le==="open"&&(Pt()?vh():hs(!1))}(Le==="open"||ls)&&["ArrowLeft","ArrowRight"].includes(i.key)&&(i.preventDefault(),Qd(i.key==="ArrowRight"?1:-1,!0))}});var Mc=new Set,Sc=new Map([["/homework/","/homework/style.css"],["/teacher/","/teacher/style.css"]]);function jd(i){if(navigator.connection?.saveData)return;let e=new URL(i.href,location.href),t=e.origin===location.origin?Sc.get(e.pathname):e.origin;if(!t||Mc.has(t))return;Mc.add(t);let n=document.createElement("link");n.rel=e.origin===location.origin?"prefetch":"preconnect",n.href=t,document.head.append(n)}function E_(i,e,t){if(Le!=="open"||performance.now()<$s)return;Jr=i,ch=e,dh=t;let n=Li().find(c=>c.item===i),s=n?.lift||0;Qs(),jd(i);let r=new URL(i.href,location.href);if(r.origin===location.origin&&Sc.has(r.pathname)&&!navigator.connection?.saveData){let c=r.pathname+"app.js";if(!Mc.has(c)){Mc.add(c);let h=document.createElement("link");h.rel="modulepreload",h.href=c,document.head.append(h)}}Kt("peeling","\u6B63\u5728\u63ED\u4E0B\u4FBF\u7B7E");let a=!1,o=()=>{a||Le!=="peeling"||Jr!==i||(a=!0,clearTimeout(l),wt?.kind==="peel"&&(wt=null),C_(i))},l=setTimeout(o,360);Ec("peel",.32,c=>{if(!n)return;let h=Js(c),[u,d]=th[ch];if(Mh(n,n.slot),n.stub){n.ticketBody.visible=!0,n.rect.visible=!1,n.stub.visible=!0,n.stub.position.set(n.w*(.365+.27*h),-.1*h,.009+.48*h),n.stub.rotation.z=-.18*h,n.ticketBody.rotation.z=.012*Math.sin(h*Math.PI),n.rear.visible=!1;return}bh(n,ch,s*(1-h),h),n.shadow.visible=h<.99,n.shadow.material.opacity=.6*(1-h)*(1-h),n.shadow.position.set(.006+u*.29*h,-.014+d*.3*h,-.02-.98*h),n.root.position.add(new P(-u*.29*h,-d*.3*h,.98*h)),n.root.rotation.z+=u*.17*h},o)}function C_(i){je("loading").hidden=!1,je("destination").textContent=i.title;try{let e=new URL(i.href,location.href);e.origin===location.origin&&Sc.has(e.pathname)&&sessionStorage.setItem("mike:arrival",JSON.stringify({path:e.pathname,at:Date.now()}))}catch{}Kt("loading","\u6B63\u5728\u6253\u5F00 "+i.title),ea(Sc.has(new URL(i.href,location.href).pathname));try{sessionStorage.setItem(_c,JSON.stringify({spreadIndex:Je,side:$e,at:Date.now()}))}catch{}requestAnimationFrame(()=>setTimeout(()=>{Le==="loading"&&location.assign(i.href)},0))}function ef(){try{sessionStorage.removeItem(_c)}catch{}Jr=null,je("loading").hidden=!0,Kt("open","\u5DF2\u56DE\u5230\u8FD9\u4E00\u9875"),dh?.focus({preventScroll:!0}),dh=null}window.addEventListener("pageshow",i=>{i.persisted&&Le==="loading"&&ef()});function bh(i,e,t,n){let s=i.rect.morphTargetInfluences;s.fill(0),s[e]=t,s[4+e]=n,s[(e+2)%4]=.14*(1-t)*(1-n)}function tf(i,e,t,n,s,r=0){i.parent!==e&&e.add(i),i.position.set(t,n,s),i.rotation.set(0,0,r)}function Mh(i,e,t=!1){i.stub&&(i.stub.visible=i.ticketBody.visible=!1,i.rect.visible=!0);let n=e<2;i.rect.geometry=i.flatGeo,i.rect.frustumCulled=!0,i.rear.visible=!0,i.shadow.visible=!0,i.shadow.material.opacity=.6,i.shadow.position.set(.006,-.014,-.02),i.root.scale.setScalar(1),tf(i.root,t&&n?j.hinge:j.book,n?-Ze/2:Ze/2,i.y,Xr,i.angle)}function R_(i){let e=Le==="opening"||Le==="closing"||Le==="cover";for(let[t,n]of j.spreads.entries()){if(!n)continue;let s=t===Je;for(let[r,a]of n.sides.entries())if(a.visible=s,s){tf(a,e&&r===0?j.hinge:j.book,r===0?-Ze/2:Ze/2,0,ns);let o=Le==="shifting"?$r:An,l=Lt()&&o&&r===$e?Math.sign(o):r===0?-1:1;nf(a,l,Lt()&&r!==$e?0:o)}for(let r of n.cards){if(r.root.visible=s,!s||Le==="peeling"&&r.item===Jr)continue;Mh(r,r.slot,e);let a=Le==="open"&&ss===r.item&&!Cn.matches?1:0;r.lift=It(r.lift,a,1-Math.exp(-18*i)),Math.abs(r.lift-a)<.003&&(r.lift=a);let o=e?.22*Math.sin(Math.PI*Yn):0;bh(r,r.corner,Math.max(r.lift,o),0)}}j.leaf.faces.forEach(t=>{t.visible=!1})}function I_(i,e){for(let[n,s]of j.spreads.entries())s&&(s.sides.forEach((r,a)=>{r.visible=n===i&&a===0||n===e&&a===1}),s.cards.forEach(r=>{r.root.visible=n===i||n===e,r.root.visible&&(Mh(r,r.slot),r.lift=0,bh(r,r.corner,0,0))}));let t=[j.spreads[i].surfaces[1],j.spreads[e].surfaces[0]];j.leaf.faces.forEach((n,s)=>{n.visible=!0,n.material.map=t[s]})}function kd(i,e,t,n){i.curvedGeo||(i.curvedGeo=i.flatGeo.clone(),i.curvedGeo.morphAttributes={}),i.rect.geometry=i.curvedGeo,i.rect.frustumCulled=!1,i.rear.visible=!1,i.shadow.visible=!1,i.root.position.set(0,0,0),i.root.scale.set(1,1,1),i.root.rotation.set(0,0,0);let s=i.flatGeo.attributes.position,r=i.curvedGeo.attributes.position,a=Math.cos(i.angle),o=Math.sin(i.angle),l=n?-1:1,c=.052*Math.sin(Math.PI*e);for(let h=0;h<r.count;h++){let u=s.getX(h),d=s.getY(h),p=Ze/2+l*(a*u-o*d),x=i.y+o*u+a*d,_=rh(p,e);sh(p,e,oh);let m=(.5-d/i.h)**2*(.6+.4*u/i.w),f=l*(Xr-ns+c*m);r.setXYZ(h,oh.x-Math.sin(_)*f,x,oh.z+t+Math.cos(_)*f)}r.needsUpdate=!0,i.curvedGeo.computeVertexNormals(),i.curvedGeo.computeBoundingSphere()}function nf(i,e,t){let n=Math.max(0,t*e);if(i.userData.curl===n&&i.userData.direction===e)return;i.userData.direction=e,i.userData.curl=n;let s=i.geometry.attributes.position;for(let r=0;r<s.count;r++)s.setZ(r,nh(s.getX(r)+i.position.x)+ah(s.getX(r),s.getY(r),e,n));s.needsUpdate=!0,i.geometry.computeVertexNormals()}function Vd(i,e,t,n){Ud(j.leaf,t,n);let s=ns;j.leaf.faces.forEach(r=>{r.position.z=s});for(let[r,a,o]of[[i,0,-.075*Js(yc((t-.53)/.47))],[e,1,-.075*Js(yc((.47-t)/.47))]]){let l=j.spreads[r].sides[a];nf(l,a===0?-1:1,0),l.position.z=ns+o;for(let c of j.spreads[r].cards)Math.floor(c.slot/2)===a&&(c.root.position.z=Xr+o)}j.spreads[i].cards.filter(r=>r.slot>=2).forEach(r=>kd(r,t,s,!1)),j.spreads[e].cards.filter(r=>r.slot<2).forEach(r=>kd(r,t,s,!0))}function Sh(){let i=j?.spreads[0]?.cards.find(r=>r.paintTask);if(!i)return;let e=document.querySelector("#flat-list [data-task]")?.dataset.task;if(e===Od)return;Od=e;for(let{action:r}of Zr)r.remove();let t=e?JSON.parse(e):[],n=i.paintTask(t),s=Ks.get(i.item);Zr=t.map((r,a)=>{let o=document.createElement("a");o.className="hot desk-task";let l=j.spreads.findIndex(c=>c?.cards.includes(i))*2+(i.slot>=2?1:0);return o.href=Lh(r.href,l),o.setAttribute("aria-label",r.label),o.title=r.label,r.detail&&o.setAttribute("aria-description",r.detail),o.hidden=s.hidden,o.onclick=c=>{if(Le!=="open"||performance.now()<$s){c.preventDefault();return}c.button===0&&!c.ctrlKey&&!c.metaKey&&!c.altKey&&!c.shiftKey&&ea(!0)},{action:o,card:i,rect:n[a]}}),s.after(...Zr.map(r=>r.action)),lt()}document.addEventListener("notebook:task",Sh);function P_(){let i=sf=Jn.clientWidth,e=rf=Jn.clientHeight,t=i/e,n=Lt(),s=n?Math.max(5.86,3.86/t):Math.max(5.78,10.24/t),r=n?Math.max(6.1,3.82/t):Math.max(6,10.68/t),a=It(s,r,Yn),o=n?It(-Ze/2,Ze/2,cn):0;at.top=a/2,at.bottom=-a/2,at.left=-a*t/2,at.right=-at.left,at.position.set(It(n?Ze/2:.13,o,Yn),n?-.04:0,15),at.updateProjectionMatrix(),at.updateMatrixWorld(),j.hinge.position.z=.14*(1-Yn),j.hinge.rotation.y=(1-Yn)*Math.PI-os*.025;let l=a/e,c=n?at.position.x+at.left+37*l:lc.x-.23,h=n?nn/2+.14+30*l:lc.y,u=n?Math.min(.48,42*l):1;j.lamp.root.position.set(c,h,0),j.lamp.root.scale.setScalar(u),j.lamp.bulb.position.set(c+u*.82,h-u*.75,2.6),j.pool.position.set(c+u*1.16,h-u*.87,-.195),j.pool.rotation.z=-.39,j.pencil.scale.setScalar(n?.67:1);let d=n?at.position.x+Ze*.18:Wr.x,p=n?-2.64:Wr.y;!Di&&(!uh||Le!=="open"&&Le!=="cover"&&Math.abs(Zt.x-at.position.x)>at.right-.66)&&(Zt.x=d,Zt.y=p,rs=n?-.16:-1.1,uh=!1,(n||hh)&&(j.pencil.position.x=d,j.pencil.position.y=p));let{ribbon:x,paint:_}=j.bookmark;if(x.visible=!on.hidden,x.visible){let m=Ze/2+.46,f=n?o+.46:.55,T=It(m,f,Yn),M=at.position.x+at.right-111*l-j.bookmark.width/2;x.position.set(n?Math.min(T,M):T,nn/2+It(.21,.15,Yn),-.052);let A=on.hasAttribute("data-return"),C=!A&&on.hasAttribute("data-unread"),S=A?"\u8FD4\u56DE\u539F\u9875":on.dataset.loadState==="error"?"\u91CD\u8BD5\u65E5\u5FD7":"\u6700\u65B0\u53D8\u5316",R=S+C;R!==Bd&&(_(S,C),Bd=R)}j.scene.updateMatrixWorld(!0)}new MutationObserver(lt).observe(on,{attributes:!0,attributeFilter:["data-unread","data-load-state"]});var sf=1,rf=1;function is(i){return i.project(at),[(i.x+1)*sf/2,(1-i.y)*rf/2]}function Zs(i,e,t=0){let n=e.map(([u])=>u),s=e.map(([,u])=>u),r=Math.min(...n),a=Math.min(...s),o=Math.max(...n)-r,l=Math.max(...s)-a,c=Math.max(o,t),h=Math.max(l,t);Object.assign(i.style,{left:r+(o-c)/2+"px",top:a+(l-h)/2+"px",width:c+"px",height:h+"px"})}function L_(){if(Le==="cover"){let[s,r]=is(qr.set(Ze*.86,-nn*.413,.318));lh.style.left=s+"px",lh.style.top=r+"px"}if(Le==="open")for(let s of Li()){let r=Ks.get(s.item);if(r.hidden)continue;let a=[[-1,-1],[-1,1],[1,1],[1,-1]].map(([o,l])=>is(s.root.localToWorld(new P(o*s.w/2,l*s.h/2,0))));Zs(r,a);for(let{action:o,rect:l,card:c}of Zr){if(c!==s)continue;let[h,u,d,p]=l,x=[[h,u],[d,u],[h,p],[d,p]].map(([_,m])=>is(s.root.localToWorld(new P((_/960-.5)*s.w,(.5-m/1160)*s.h,0))));Zs(o,x)}}if(Le==="open")for(let[s,r]of[[as,-1],[Tc,1]]){let a=Lt()?($e===0?-Ze/2:Ze/2)+r*Ze*.37:r*Ze*.89;Zs(s,[is(qr.set(a,-nn*.431,.2))],44)}let{ribbon:i,width:e,height:t}=j.bookmark;if(i.visible){let s=[[-e/2,0],[e/2,t/2]].map(([r,a])=>is(i.localToWorld(qr.set(r,a,0))));Zs(on,s,44)}Zs(gc,[is(Lt()?j.lamp.root.localToWorld(qr.set(.12,-.08,.5)):j.lamp.button.getWorldPosition(qr))],44);let n=[[-1,-.1],[-1,.1],[1,.1],[1,-.1]].map(([s,r])=>is(j.pencil.localToWorld(new P(s,r,0))));Zs($t,n,44)}function D_(i){let e=Yr?1:0,t=Cn.matches?1:1-Math.exp(-11*i);ci=It(ci,e,t);let n=Math.abs(ci-e)>.006;n||(ci=e);let s=ci*.032+.045;j.lamp.button.scale.y=1+s,j.lamp.bulb.intensity=ci*14,j.key.intensity=.59+.35*ci,j.lamp.shadeUnder.material.emissiveIntensity=ci*.79,j.pool.material.opacity=ci,j.pencil.position.x=It(j.pencil.position.x,Zt.x,t),j.pencil.position.y=It(j.pencil.position.y,Zt.y,t),j.pencil.rotation.z=It(j.pencil.rotation.z,rs,t),Math.hypot(j.pencil.position.x-Zt.x,j.pencil.position.y-Zt.y)<.003&&(j.pencil.position.x=Zt.x,j.pencil.position.y=Zt.y),Math.abs(j.pencil.rotation.z-rs)<.003&&(j.pencil.rotation.z=rs);let r=Cn.matches?0:Bt;An=It(An,r,1-Math.exp(-24*i)),Math.abs(An-r)<.004&&(An=r);let a=En&&!Cn.matches?1:0;return Le==="open"&&(os=It(os,a,1-Math.exp(-24*i))),Math.abs(os-a)>.004&&Le==="open"||An!==r||n||Math.hypot(j.pencil.position.x-Zt.x,j.pencil.position.y-Zt.y)>.003||Math.abs(j.pencil.rotation.z-rs)>.003}var fh=new Lr;fh.ray.direction.set(0,0,-1);var dc=[],Gd=new WeakMap,fc=new P,U_=new Nn({side:bn});function N_(i){let e=i.geometry,t=Gd.get(i);t||(t=new WeakMap,Gd.set(i,t));let n=t.get(e);if(!n){let a=e.parameters,o,l=[];if(e.type==="PlaneGeometry"){let c=Math.min(a.widthSegments,16),h=Math.min(a.heightSegments,6);o=new tn(1,1,c,h);for(let u=0;u<=h;u++)for(let d=0;d<=c;d++)l.push(Math.round(u*a.heightSegments/h)*(a.widthSegments+1)+Math.round(d*a.widthSegments/c))}else{e.computeBoundingBox();let c=e.boundingBox.getSize(new P);o=new Gn(c.x,c.y,c.z)}n={mesh:new qt(o,U_),indices:l},t.set(e,n)}let s=n.mesh;s.matrixWorld.copy(i.matrixWorld);let r=s.geometry.attributes.position;for(let[a,o]of n.indices.entries())i.getVertexPosition(o,fc),r.setXYZ(a,fc.x,fc.y,fc.z);return n.indices.length&&s.geometry.computeBoundingSphere(),s}var li=null;function F_(i){let e=j.pencil,t=e.scale.x,n=-.21,s=Le==="open"&&!An&&!os&&!$r&&Li().every(M=>!M.lift),{x:r,y:a}=e.position,o=e.rotation.z,l=s&&li?.spread===Je&&li.side===$e&&li.x===r&&li.y===a&&li.angle===o&&li.scale===t;if(l)n=li.height;else if(Math.abs(r)<Ze+t+.12&&Math.abs(a)<nn/2+t+.12){let M=[...j.boards,...j.leaf.faces.filter(R=>R.visible)];for(let R of j.spreads)if(R){for(let N of R.sides)N.visible&&M.push(N);for(let N of R.cards)N.root.visible&&M.push(N.rect)}let A=M.map(N_),C=Math.cos(e.rotation.z),S=Math.sin(e.rotation.z);for(let R=0;R<=12;R++){let N=(-.97+R*1.91/12)*t;fh.ray.origin.set(e.position.x+N*C,e.position.y+N*S,8),dc.length=0,fh.intersectObjects(A,!1,dc),dc.length&&(n=Math.max(n,dc[0].point.z))}}s?l||(li={spread:Je,side:$e,x:r,y:a,angle:o,scale:t,height:n}):li=null;let c=n+.085*t,h=c+(Di?.29:0),u=Math.max(c,It(e.position.z,h,Cn.matches?1:1-Math.exp(-18*i))),d=Math.abs(u-h)>.001;e.position.z=d?u:h;let p=e.userData.shade,x=Math.min(1,Math.max(0,(e.position.z-c)/.29)),_=e.position.x-j.lamp.bulb.position.x,m=e.position.y-j.lamp.bulb.position.y,f=Math.max(.5,Math.hypot(_,m)),T=.025+.11*x;return p.position.set(e.position.x+T*_/f,e.position.y+T*m/f,n+.004),p.rotation.z=e.rotation.z,p.scale.set(t*(1+.09*x),t*(.72+x*1.6),1),p.material.opacity=.48-.29*x,d}function O_(i){let e=!1;for(let t of Li()){let n=t.ink;if(!n||n.amount.value===1)continue;let s=Le==="open"&&(!Lt()||Math.floor(t.slot/2)===$e);if(Cn.matches||!s&&n.started!==null){n.amount.value=1;continue}s&&(n.started??(n.started=i),n.amount.value=1-(1-yc((i-n.started)/480))**2,e||(e=n.amount.value<1))}return e}Cn.addEventListener("change",lt);function af(i,e){return yc(i.origin+i.rate*(e-i.started)/(1e3*i.seconds))}document.addEventListener("visibilitychange",()=>{if(document.hidden){uc=performance.now(),hi&&cancelAnimationFrame(hi),hi=0,Jt=null,Bt=0,En=!1;return}uc!==null&&wt&&(wt.started+=performance.now()-Math.max(uc,wt.started)),uc=null,pc=0,lt()});function B_(i){hi=0;let e=Math.min(.04,(i-(pc||i-16))/1e3);if(pc=i,wt){let a=wt,o=a.rate>0?1:0,l=Cn.matches?o:af(a,i);a.step(l),l===o&&(wt=null,o===1?a.end():($r=An=0,cn=$e,cs=0,_h(),yh(-ph,Kr)))}let t=D_(e);Le!=="turning"&&R_(e),P_();let n=F_(e),s=O_(i);try{mt.render(j.scene,at)}catch(a){console.warn("Notebook rendering was interrupted.",a),mc();return}L_(),hh&&(hh=!1,Wd.hidden=!0,document.body.dataset.ready="3d",je("masthead").hidden=!1,Le==="cover"&&xc&&requestAnimationFrame(()=>hs(!0)));let r=Le==="open"&&Li().some(a=>a.lift>0&&a.lift<1);t||wt||r||n||s?lt():pc=0}function Hd(){!mt||!j||(mt.setPixelRatio(Math.min(devicePixelRatio,Lt()?1.35:1.65)),mt.setSize(Jn.clientWidth,Jn.clientHeight,!1),wt||($e=Ac(Je,$e),cn=$e),jr(),lt())}function mc(){hi&&cancelAnimationFrame(hi),hi=0,mt=null,wt=null,ls=!1,cs=0,Wd.hidden=!0,document.body.dataset.ready="2d",Le="open",je("masthead").hidden=!0,je("rail").hidden=!0,je("loading").hidden=!0,jr(),je("rail").hidden=!0}var xc=!1;async function EM(i,e,t,n=!1){Pi=n,yt=Jl(i),rn=yt.length;let s=n?null:Ph(new URLSearchParams(location.search)),r=null;if(!n)try{let l=JSON.parse(sessionStorage.getItem(_c));sessionStorage.removeItem(_c),!e&&l&&Date.now()-l.at<45*6e4&&(r=l)}catch{}let a=s===null?history.state?.notebookSpread??r?.spreadIndex:Math.floor(s/2),o=s===null?history.state?.notebookSide??r?.side:s%2;Je=Math.min(yt.length-1,Math.max(0,Number(a)||0)),$e=Ac(Je,Number(o)||0),cn=$e,Jd();try{let l=Jn.getContext("webgl2",{antialias:!0,alpha:!1,powerPreference:"low-power"});if(!l){mc();return}let c=new Jo({canvas:Jn,context:l});if(c.shadowMap.enabled=!0,c.shadowMap.type=yn,c.toneMapping=ao,c.toneMappingExposure=1.12,j=await Nd(n?[]:yt,Lt()),!t()){c.dispose();return}Sh(),mt=c,at=new qi(-6,6,4,-4,.01,40),Jn.addEventListener("webglcontextlost",h=>{h.preventDefault(),mc()}),window.addEventListener("resize",Hd),xc=s===null&&e&&!Cn.matches,Yn=n||xc?0:1,Kt(n||xc?"cover":"open"),s!==null&&ea(),Hd()}catch(l){console.warn("Notebook view is unavailable.",l),mc()}}async function CM(i,e){if(!Pi||!mt||!j)throw Error("Cover is unavailable");let t=Jl(i),n=await j.addSpreads(t);if(!mt)throw Error("Cover lost its graphics context");yt=t,rn=yt.length,j.spreads=n,Je=$e=cn=0,Jd(),Sh(),Ui(),Pi=!1,e(),jr(),hs(!0)}export{EM as start,CM as unlock};
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
