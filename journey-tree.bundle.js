(()=>{var ei={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},ni={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Bc=0,Sa=1,zc=2;var ba=1,kc=2,Mn=3,Nn=0,ze=1,Sn=2,Fn=0,pi=1,Us=2,Ea=3,Ta=4,Vc=5,$n=100,Hc=101,Gc=102,Wc=103,Xc=104,Yc=200,qc=201,Zc=202,$c=203,mr=204,gr=205,Jc=206,Kc=207,jc=208,Qc=209,tl=210,el=211,nl=212,il=213,sl=214,kr=0,Vr=1,Hr=2,mi=3,Gr=4,Wr=5,Xr=6,Yr=7,wa=0,rl=1,ol=2,fn=0,al=1,cl=2,ll=3,hl=4,ul=5,dl=6,fl=7;var Aa=300,yi=301,Mi=302,qr=303,Zr=304,Ns=306,_r=1e3,Zn=1001,xr=1002,nn=1003,pl=1004;var Fs=1005;var dn=1006,$r=1007;var ii=1008;var bn=1009,Ra=1010,Ca=1011,$i=1012,Jr=1013,si=1014,En=1015,Ji=1016,Kr=1017,jr=1018,Ki=1020,Pa=35902,Ia=1021,Da=1022,an=1023,Gi=1026,ji=1027,La=1028,Qr=1029,Ua=1030,to=1031;var eo=1033,Os=33776,Bs=33777,zs=33778,ks=33779,no=35840,io=35841,so=35842,ro=35843,oo=36196,ao=37492,co=37496,lo=37808,ho=37809,uo=37810,fo=37811,po=37812,mo=37813,go=37814,_o=37815,xo=37816,vo=37817,yo=37818,Mo=37819,So=37820,bo=37821,Vs=36492,Eo=36494,To=36495,Na=36283,wo=36284,Ao=36285,Ro=36286;var fs=2300,vr=2301,pr=2302,pa=2400,ma=2401,ga=2402;var ml=3200,gl=3201;var _l=0,xl=1,On="",Oe="srgb",gi="srgb-linear",ps="linear",de="srgb";var di=7680;var _a=519,vl=512,yl=513,Ml=514,Fa=515,Sl=516,bl=517,El=518,Tl=519,xa=35044;var Oa="300 es",mn=2e3,ms=2001;var gn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},De=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],gc=1234567,us=Math.PI/180,Wi=180/Math.PI;function Qi(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(De[i&255]+De[i>>8&255]+De[i>>16&255]+De[i>>24&255]+"-"+De[t&255]+De[t>>8&255]+"-"+De[t>>16&15|64]+De[t>>24&255]+"-"+De[e&63|128]+De[e>>8&255]+"-"+De[e>>16&255]+De[e>>24&255]+De[n&255]+De[n>>8&255]+De[n>>16&255]+De[n>>24&255]).toLowerCase()}function Kt(i,t,e){return Math.max(t,Math.min(e,i))}function Ba(i,t){return(i%t+t)%t}function kh(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function Vh(i,t,e){return i!==t?(e-i)/(t-i):0}function ds(i,t,e){return(1-e)*i+e*t}function Hh(i,t,e,n){return ds(i,t,1-Math.exp(-e*n))}function Gh(i,t=1){return t-Math.abs(Ba(i,t*2)-t)}function Wh(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function Xh(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function Yh(i,t){return i+Math.floor(Math.random()*(t-i+1))}function qh(i,t){return i+Math.random()*(t-i)}function Zh(i){return i*(.5-Math.random())}function $h(i){i!==void 0&&(gc=i);let t=gc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Jh(i){return i*us}function Kh(i){return i*Wi}function jh(i){return(i&i-1)===0&&i!==0}function Qh(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function tu(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function eu(i,t,e,n,s){let r=Math.cos,o=Math.sin,a=r(e/2),c=o(e/2),l=r((t+n)/2),h=o((t+n)/2),u=r((t-n)/2),p=o((t-n)/2),f=r((n-t)/2),g=o((n-t)/2);switch(s){case"XYX":i.set(a*h,c*u,c*p,a*l);break;case"YZY":i.set(c*p,a*h,c*u,a*l);break;case"ZXZ":i.set(c*u,c*p,a*h,a*l);break;case"XZX":i.set(a*h,c*g,c*f,a*l);break;case"YXY":i.set(c*f,a*h,c*g,a*l);break;case"ZYZ":i.set(c*g,c*f,a*h,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Vi(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Fe(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Jt={DEG2RAD:us,RAD2DEG:Wi,generateUUID:Qi,clamp:Kt,euclideanModulo:Ba,mapLinear:kh,inverseLerp:Vh,lerp:ds,damp:Hh,pingpong:Gh,smoothstep:Wh,smootherstep:Xh,randInt:Yh,randFloat:qh,randFloatSpread:Zh,seededRandom:$h,degToRad:Jh,radToDeg:Kh,isPowerOfTwo:jh,ceilPowerOfTwo:Qh,floorPowerOfTwo:tu,setQuaternionFromProperEuler:eu,normalize:Fe,denormalize:Vi},Yt=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Kt(this.x,t.x,e.x),this.y=Kt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Kt(this.x,t,e),this.y=Kt(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Kt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},sn=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let c=n[s+0],l=n[s+1],h=n[s+2],u=n[s+3],p=r[o+0],f=r[o+1],g=r[o+2],x=r[o+3];if(a===0){t[e+0]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u;return}if(a===1){t[e+0]=p,t[e+1]=f,t[e+2]=g,t[e+3]=x;return}if(u!==x||c!==p||l!==f||h!==g){let m=1-a,d=c*p+l*f+h*g+u*x,E=d>=0?1:-1,b=1-d*d;if(b>Number.EPSILON){let U=Math.sqrt(b),R=Math.atan2(U,d*E);m=Math.sin(m*R)/U,a=Math.sin(a*R)/U}let S=a*E;if(c=c*m+p*S,l=l*m+f*S,h=h*m+g*S,u=u*m+x*S,m===1-a){let U=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=U,l*=U,h*=U,u*=U}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],c=n[s+1],l=n[s+2],h=n[s+3],u=r[o],p=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+h*u+c*f-l*p,t[e+1]=c*g+h*p+l*u-a*f,t[e+2]=l*g+h*f+a*p-c*u,t[e+3]=h*g-a*u-c*p-l*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(n/2),h=a(s/2),u=a(r/2),p=c(n/2),f=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=p*h*u+l*f*g,this._y=l*f*u-p*h*g,this._z=l*h*g+p*f*u,this._w=l*h*u-p*f*g;break;case"YXZ":this._x=p*h*u+l*f*g,this._y=l*f*u-p*h*g,this._z=l*h*g-p*f*u,this._w=l*h*u+p*f*g;break;case"ZXY":this._x=p*h*u-l*f*g,this._y=l*f*u+p*h*g,this._z=l*h*g+p*f*u,this._w=l*h*u-p*f*g;break;case"ZYX":this._x=p*h*u-l*f*g,this._y=l*f*u+p*h*g,this._z=l*h*g-p*f*u,this._w=l*h*u+p*f*g;break;case"YZX":this._x=p*h*u+l*f*g,this._y=l*f*u+p*h*g,this._z=l*h*g-p*f*u,this._w=l*h*u-p*f*g;break;case"XZY":this._x=p*h*u-l*f*g,this._y=l*f*u-p*h*g,this._z=l*h*g+p*f*u,this._w=l*h*u+p*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],c=e[9],l=e[2],h=e[6],u=e[10],p=n+a+u;if(p>0){let f=.5/Math.sqrt(p+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(o-s)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(h-c)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+l)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(r-l)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(c+h)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-s)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Kt(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,c=e._y,l=e._z,h=e._w;return this._x=n*h+o*a+s*l-r*c,this._y=s*h+o*c+r*a-n*l,this._z=r*h+o*l+n*c-s*a,this._w=o*h-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let c=1-a*a;if(c<=Number.EPSILON){let f=1-e;return this._w=f*o+e*this._w,this._x=f*n+e*this._x,this._y=f*s+e*this._y,this._z=f*r+e*this._z,this.normalize(),this}let l=Math.sqrt(c),h=Math.atan2(l,a),u=Math.sin((1-e)*h)/l,p=Math.sin(e*h)/l;return this._w=o*u+this._w*p,this._x=n*u+this._x*p,this._y=s*u+this._y*p,this._z=r*u+this._z*p,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},w=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(_c.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(_c.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*s-a*n),h=2*(a*e-r*s),u=2*(r*n-o*e);return this.x=e+c*l+o*u-a*h,this.y=n+c*h+a*l-r*u,this.z=s+c*u+r*h-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Kt(this.x,t.x,e.x),this.y=Kt(this.y,t.y,e.y),this.z=Kt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Kt(this.x,t,e),this.y=Kt(this.y,t,e),this.z=Kt(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,c=e.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Yo.copy(this).projectOnVector(t),this.sub(Yo)}reflect(t){return this.sub(Yo.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Kt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Yo=new w,_c=new sn,Zt=class i{constructor(t,e,n,s,r,o,a,c,l){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,l)}set(t,e,n,s,r,o,a,c,l){let h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=c,h[6]=n,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],h=n[4],u=n[7],p=n[2],f=n[5],g=n[8],x=s[0],m=s[3],d=s[6],E=s[1],b=s[4],S=s[7],U=s[2],R=s[5],I=s[8];return r[0]=o*x+a*E+c*U,r[3]=o*m+a*b+c*R,r[6]=o*d+a*S+c*I,r[1]=l*x+h*E+u*U,r[4]=l*m+h*b+u*R,r[7]=l*d+h*S+u*I,r[2]=p*x+f*E+g*U,r[5]=p*m+f*b+g*R,r[8]=p*d+f*S+g*I,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8];return e*o*h-e*a*l-n*r*h+n*a*c+s*r*l-s*o*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],u=h*o-a*l,p=a*c-h*r,f=l*r-o*c,g=e*u+n*p+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return t[0]=u*x,t[1]=(s*l-h*n)*x,t[2]=(a*n-s*o)*x,t[3]=p*x,t[4]=(h*e-s*c)*x,t[5]=(s*r-a*e)*x,t[6]=f*x,t[7]=(n*c-l*e)*x,t[8]=(o*e-n*r)*x,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+t,-s*l,s*c,-s*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(qo.makeScale(t,e)),this}rotate(t){return this.premultiply(qo.makeRotation(-t)),this}translate(t,e){return this.premultiply(qo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},qo=new Zt;function za(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function gs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function wl(){let i=gs("canvas");return i.style.display="block",i}var xc={};function _i(i){i in xc||(xc[i]=!0,console.warn(i))}function Al(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function Rl(i){let t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Cl(i){let t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}var vc=new Zt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),yc=new Zt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function nu(){let i={enabled:!0,workingColorSpace:gi,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===de&&(s.r=Un(s.r),s.g=Un(s.g),s.b=Un(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===de&&(s.r=Hi(s.r),s.g=Hi(s.g),s.b=Hi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===On?ps:this.spaces[s].transfer},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return _i("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return _i("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[gi]:{primaries:t,whitePoint:n,transfer:ps,toXYZ:vc,fromXYZ:yc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Oe},outputColorSpaceConfig:{drawingBufferColorSpace:Oe}},[Oe]:{primaries:t,whitePoint:n,transfer:de,toXYZ:vc,fromXYZ:yc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Oe}}}),i}var ae=nu();function Un(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Hi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ci,yr=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Ci===void 0&&(Ci=gs("canvas")),Ci.width=t.width,Ci.height=t.height;let s=Ci.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=Ci}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=gs("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Un(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Un(e[n]/255)*255):e[n]=Un(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},iu=0,Xi=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:iu++}),this.uuid=Qi(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Zo(s[o].image)):r.push(Zo(s[o]))}else r=Zo(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Zo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?yr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var su=0,$o=new w,Ze=class i extends gn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Zn,s=Zn,r=dn,o=ii,a=an,c=bn,l=i.DEFAULT_ANISOTROPY,h=On){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:su++}),this.uuid=Qi(),this.name="",this.source=new Xi(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new Yt(0,0),this.repeat=new Yt(1,1),this.center=new Yt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize($o).x}get height(){return this.source.getSize($o).y}get depth(){return this.source.getSize($o).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Aa)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case _r:t.x=t.x-Math.floor(t.x);break;case Zn:t.x=t.x<0?0:1;break;case xr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case _r:t.y=t.y-Math.floor(t.y);break;case Zn:t.y=t.y<0?0:1;break;case xr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ze.DEFAULT_IMAGE=null;Ze.DEFAULT_MAPPING=Aa;Ze.DEFAULT_ANISOTROPY=1;var be=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,l=c[0],h=c[4],u=c[8],p=c[1],f=c[5],g=c[9],x=c[2],m=c[6],d=c[10];if(Math.abs(h-p)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+p)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+d-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let b=(l+1)/2,S=(f+1)/2,U=(d+1)/2,R=(h+p)/4,I=(u+x)/4,A=(g+m)/4;return b>S&&b>U?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=R/n,r=I/n):S>U?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=R/s,r=A/s):U<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(U),n=I/r,s=A/r),this.set(n,s,r,e),this}let E=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(p-h)*(p-h));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(u-x)/E,this.z=(p-h)/E,this.w=Math.acos((l+f+d-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Kt(this.x,t.x,e.x),this.y=Kt(this.y,t.y,e.y),this.z=Kt(this.z,t.z,e.z),this.w=Kt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Kt(this.x,t,e),this.y=Kt(this.y,t,e),this.z=Kt(this.z,t,e),this.w=Kt(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Mr=class extends gn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:dn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new be(0,0,t,e),this.scissorTest=!1,this.viewport=new be(0,0,t,e);let s={width:t,height:e,depth:n.depth},r=new Ze(s);this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(t={}){let e={minFilter:dn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Xi(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},_n=class extends Mr{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},_s=class extends Ze{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=nn,this.minFilter=nn,this.wrapR=Zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Sr=class extends Ze{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=nn,this.minFilter=nn,this.wrapR=Zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var rn=class{constructor(t=new w(1/0,1/0,1/0),e=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(ln.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(ln.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=ln.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,ln):ln.fromBufferAttribute(r,o),ln.applyMatrix4(t.matrixWorld),this.expandByPoint(ln);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Zs.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Zs.copy(n.boundingBox)),Zs.applyMatrix4(t.matrixWorld),this.union(Zs)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,ln),ln.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(as),$s.subVectors(this.max,as),Pi.subVectors(t.a,as),Ii.subVectors(t.b,as),Di.subVectors(t.c,as),Vn.subVectors(Ii,Pi),Hn.subVectors(Di,Ii),ci.subVectors(Pi,Di);let e=[0,-Vn.z,Vn.y,0,-Hn.z,Hn.y,0,-ci.z,ci.y,Vn.z,0,-Vn.x,Hn.z,0,-Hn.x,ci.z,0,-ci.x,-Vn.y,Vn.x,0,-Hn.y,Hn.x,0,-ci.y,ci.x,0];return!Jo(e,Pi,Ii,Di,$s)||(e=[1,0,0,0,1,0,0,0,1],!Jo(e,Pi,Ii,Di,$s))?!1:(Js.crossVectors(Vn,Hn),e=[Js.x,Js.y,Js.z],Jo(e,Pi,Ii,Di,$s))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,ln).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(ln).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Cn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Cn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Cn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Cn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Cn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Cn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Cn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Cn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Cn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Cn=[new w,new w,new w,new w,new w,new w,new w,new w],ln=new w,Zs=new rn,Pi=new w,Ii=new w,Di=new w,Vn=new w,Hn=new w,ci=new w,as=new w,$s=new w,Js=new w,li=new w;function Jo(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){li.fromArray(i,r);let a=s.x*Math.abs(li.x)+s.y*Math.abs(li.y)+s.z*Math.abs(li.z),c=t.dot(li),l=e.dot(li),h=n.dot(li);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}var ru=new rn,cs=new w,Ko=new w,xi=class{constructor(t=new w,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):ru.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;cs.subVectors(t,this.center);let e=cs.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(cs,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ko.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(cs.copy(t.center).add(Ko)),this.expandByPoint(cs.copy(t.center).sub(Ko))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Pn=new w,jo=new w,Ks=new w,Gn=new w,Qo=new w,js=new w,ta=new w,xn=class{constructor(t=new w,e=new w(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Pn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Pn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Pn.copy(this.origin).addScaledVector(this.direction,e),Pn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){jo.copy(t).add(e).multiplyScalar(.5),Ks.copy(e).sub(t).normalize(),Gn.copy(this.origin).sub(jo);let r=t.distanceTo(e)*.5,o=-this.direction.dot(Ks),a=Gn.dot(this.direction),c=-Gn.dot(Ks),l=Gn.lengthSq(),h=Math.abs(1-o*o),u,p,f,g;if(h>0)if(u=o*c-a,p=o*a-c,g=r*h,u>=0)if(p>=-g)if(p<=g){let x=1/h;u*=x,p*=x,f=u*(u+o*p+2*a)+p*(o*u+p+2*c)+l}else p=r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*c)+l;else p=-r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*c)+l;else p<=-g?(u=Math.max(0,-(-o*r+a)),p=u>0?-r:Math.min(Math.max(-r,-c),r),f=-u*u+p*(p+2*c)+l):p<=g?(u=0,p=Math.min(Math.max(-r,-c),r),f=p*(p+2*c)+l):(u=Math.max(0,-(o*r+a)),p=u>0?r:Math.min(Math.max(-r,-c),r),f=-u*u+p*(p+2*c)+l);else p=o>0?-r:r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(jo).addScaledVector(Ks,p),f}intersectSphere(t,e){Pn.subVectors(t.center,this.origin);let n=Pn.dot(this.direction),s=Pn.dot(Pn)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,c,l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,p=this.origin;return l>=0?(n=(t.min.x-p.x)*l,s=(t.max.x-p.x)*l):(n=(t.max.x-p.x)*l,s=(t.min.x-p.x)*l),h>=0?(r=(t.min.y-p.y)*h,o=(t.max.y-p.y)*h):(r=(t.max.y-p.y)*h,o=(t.min.y-p.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(t.min.z-p.z)*u,c=(t.max.z-p.z)*u):(a=(t.max.z-p.z)*u,c=(t.min.z-p.z)*u),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Pn)!==null}intersectTriangle(t,e,n,s,r){Qo.subVectors(e,t),js.subVectors(n,t),ta.crossVectors(Qo,js);let o=this.direction.dot(ta),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Gn.subVectors(this.origin,t);let c=a*this.direction.dot(js.crossVectors(Gn,js));if(c<0)return null;let l=a*this.direction.dot(Qo.cross(Gn));if(l<0||c+l>o)return null;let h=-a*Gn.dot(ta);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Me=class i{constructor(t,e,n,s,r,o,a,c,l,h,u,p,f,g,x,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,l,h,u,p,f,g,x,m)}set(t,e,n,s,r,o,a,c,l,h,u,p,f,g,x,m){let d=this.elements;return d[0]=t,d[4]=e,d[8]=n,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=c,d[2]=l,d[6]=h,d[10]=u,d[14]=p,d[3]=f,d[7]=g,d[11]=x,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,s=1/Li.setFromMatrixColumn(t,0).length(),r=1/Li.setFromMatrixColumn(t,1).length(),o=1/Li.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let p=o*h,f=o*u,g=a*h,x=a*u;e[0]=c*h,e[4]=-c*u,e[8]=l,e[1]=f+g*l,e[5]=p-x*l,e[9]=-a*c,e[2]=x-p*l,e[6]=g+f*l,e[10]=o*c}else if(t.order==="YXZ"){let p=c*h,f=c*u,g=l*h,x=l*u;e[0]=p+x*a,e[4]=g*a-f,e[8]=o*l,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=x+p*a,e[10]=o*c}else if(t.order==="ZXY"){let p=c*h,f=c*u,g=l*h,x=l*u;e[0]=p-x*a,e[4]=-o*u,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=x-p*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){let p=o*h,f=o*u,g=a*h,x=a*u;e[0]=c*h,e[4]=g*l-f,e[8]=p*l+x,e[1]=c*u,e[5]=x*l+p,e[9]=f*l-g,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){let p=o*c,f=o*l,g=a*c,x=a*l;e[0]=c*h,e[4]=x-p*u,e[8]=g*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-l*h,e[6]=f*u+g,e[10]=p-x*u}else if(t.order==="XZY"){let p=o*c,f=o*l,g=a*c,x=a*l;e[0]=c*h,e[4]=-u,e[8]=l*h,e[1]=p*u+x,e[5]=o*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=a*h,e[10]=x*u+p}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ou,t,au)}lookAt(t,e,n){let s=this.elements;return Xe.subVectors(t,e),Xe.lengthSq()===0&&(Xe.z=1),Xe.normalize(),Wn.crossVectors(n,Xe),Wn.lengthSq()===0&&(Math.abs(n.z)===1?Xe.x+=1e-4:Xe.z+=1e-4,Xe.normalize(),Wn.crossVectors(n,Xe)),Wn.normalize(),Qs.crossVectors(Xe,Wn),s[0]=Wn.x,s[4]=Qs.x,s[8]=Xe.x,s[1]=Wn.y,s[5]=Qs.y,s[9]=Xe.y,s[2]=Wn.z,s[6]=Qs.z,s[10]=Xe.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],h=n[1],u=n[5],p=n[9],f=n[13],g=n[2],x=n[6],m=n[10],d=n[14],E=n[3],b=n[7],S=n[11],U=n[15],R=s[0],I=s[4],A=s[8],M=s[12],y=s[1],D=s[5],Y=s[9],G=s[13],$=s[2],et=s[6],W=s[10],K=s[14],H=s[3],lt=s[7],ht=s[11],Mt=s[15];return r[0]=o*R+a*y+c*$+l*H,r[4]=o*I+a*D+c*et+l*lt,r[8]=o*A+a*Y+c*W+l*ht,r[12]=o*M+a*G+c*K+l*Mt,r[1]=h*R+u*y+p*$+f*H,r[5]=h*I+u*D+p*et+f*lt,r[9]=h*A+u*Y+p*W+f*ht,r[13]=h*M+u*G+p*K+f*Mt,r[2]=g*R+x*y+m*$+d*H,r[6]=g*I+x*D+m*et+d*lt,r[10]=g*A+x*Y+m*W+d*ht,r[14]=g*M+x*G+m*K+d*Mt,r[3]=E*R+b*y+S*$+U*H,r[7]=E*I+b*D+S*et+U*lt,r[11]=E*A+b*Y+S*W+U*ht,r[15]=E*M+b*G+S*K+U*Mt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],c=t[9],l=t[13],h=t[2],u=t[6],p=t[10],f=t[14],g=t[3],x=t[7],m=t[11],d=t[15];return g*(+r*c*u-s*l*u-r*a*p+n*l*p+s*a*f-n*c*f)+x*(+e*c*f-e*l*p+r*o*p-s*o*f+s*l*h-r*c*h)+m*(+e*l*u-e*a*f-r*o*u+n*o*f+r*a*h-n*l*h)+d*(-s*a*h-e*c*u+e*a*p+s*o*u-n*o*p+n*c*h)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],u=t[9],p=t[10],f=t[11],g=t[12],x=t[13],m=t[14],d=t[15],E=u*m*l-x*p*l+x*c*f-a*m*f-u*c*d+a*p*d,b=g*p*l-h*m*l-g*c*f+o*m*f+h*c*d-o*p*d,S=h*x*l-g*u*l+g*a*f-o*x*f-h*a*d+o*u*d,U=g*u*c-h*x*c-g*a*p+o*x*p+h*a*m-o*u*m,R=e*E+n*b+s*S+r*U;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let I=1/R;return t[0]=E*I,t[1]=(x*p*r-u*m*r-x*s*f+n*m*f+u*s*d-n*p*d)*I,t[2]=(a*m*r-x*c*r+x*s*l-n*m*l-a*s*d+n*c*d)*I,t[3]=(u*c*r-a*p*r-u*s*l+n*p*l+a*s*f-n*c*f)*I,t[4]=b*I,t[5]=(h*m*r-g*p*r+g*s*f-e*m*f-h*s*d+e*p*d)*I,t[6]=(g*c*r-o*m*r-g*s*l+e*m*l+o*s*d-e*c*d)*I,t[7]=(o*p*r-h*c*r+h*s*l-e*p*l-o*s*f+e*c*f)*I,t[8]=S*I,t[9]=(g*u*r-h*x*r-g*n*f+e*x*f+h*n*d-e*u*d)*I,t[10]=(o*x*r-g*a*r+g*n*l-e*x*l-o*n*d+e*a*d)*I,t[11]=(h*a*r-o*u*r-h*n*l+e*u*l+o*n*f-e*a*f)*I,t[12]=U*I,t[13]=(h*x*s-g*u*s+g*n*p-e*x*p-h*n*m+e*u*m)*I,t[14]=(g*a*s-o*x*s-g*n*c+e*x*c+o*n*m-e*a*m)*I,t[15]=(o*u*s-h*a*s+h*n*c-e*u*c-o*n*p+e*a*p)*I,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,c=t.z,l=r*o,h=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,h*a+n,h*c-s*o,0,l*c-s*a,h*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,c=e._w,l=r+r,h=o+o,u=a+a,p=r*l,f=r*h,g=r*u,x=o*h,m=o*u,d=a*u,E=c*l,b=c*h,S=c*u,U=n.x,R=n.y,I=n.z;return s[0]=(1-(x+d))*U,s[1]=(f+S)*U,s[2]=(g-b)*U,s[3]=0,s[4]=(f-S)*R,s[5]=(1-(p+d))*R,s[6]=(m+E)*R,s[7]=0,s[8]=(g+b)*I,s[9]=(m-E)*I,s[10]=(1-(p+x))*I,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements,r=Li.set(s[0],s[1],s[2]).length(),o=Li.set(s[4],s[5],s[6]).length(),a=Li.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],hn.copy(this);let l=1/r,h=1/o,u=1/a;return hn.elements[0]*=l,hn.elements[1]*=l,hn.elements[2]*=l,hn.elements[4]*=h,hn.elements[5]*=h,hn.elements[6]*=h,hn.elements[8]*=u,hn.elements[9]*=u,hn.elements[10]*=u,e.setFromRotationMatrix(hn),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=mn){let c=this.elements,l=2*r/(e-t),h=2*r/(n-s),u=(e+t)/(e-t),p=(n+s)/(n-s),f,g;if(a===mn)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===ms)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=h,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=mn){let c=this.elements,l=1/(e-t),h=1/(n-s),u=1/(o-r),p=(e+t)*l,f=(n+s)*h,g,x;if(a===mn)g=(o+r)*u,x=-2*u;else if(a===ms)g=r*u,x=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-p,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-f,c[2]=0,c[6]=0,c[10]=x,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Li=new w,hn=new Me,ou=new w(0,0,0),au=new w(1,1,1),Wn=new w,Qs=new w,Xe=new w,Mc=new Me,Sc=new sn,vn=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],h=s[9],u=s[2],p=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(Kt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(p,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Kt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Kt(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Kt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(p,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(Kt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Kt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Mc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Mc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Sc.setFromEuler(this),this.setFromQuaternion(Sc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};vn.DEFAULT_ORDER="XYZ";var Yi=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},cu=0,bc=new w,Ui=new sn,In=new Me,tr=new w,ls=new w,lu=new w,hu=new sn,Ec=new w(1,0,0),Tc=new w(0,1,0),wc=new w(0,0,1),Ac={type:"added"},uu={type:"removed"},Ni={type:"childadded",child:null},ea={type:"childremoved",child:null},$e=class i extends gn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:cu++}),this.uuid=Qi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new w,e=new vn,n=new sn,s=new w(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Me},normalMatrix:{value:new Zt}}),this.matrix=new Me,this.matrixWorld=new Me,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Yi,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ui.setFromAxisAngle(t,e),this.quaternion.multiply(Ui),this}rotateOnWorldAxis(t,e){return Ui.setFromAxisAngle(t,e),this.quaternion.premultiply(Ui),this}rotateX(t){return this.rotateOnAxis(Ec,t)}rotateY(t){return this.rotateOnAxis(Tc,t)}rotateZ(t){return this.rotateOnAxis(wc,t)}translateOnAxis(t,e){return bc.copy(t).applyQuaternion(this.quaternion),this.position.add(bc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Ec,t)}translateY(t){return this.translateOnAxis(Tc,t)}translateZ(t){return this.translateOnAxis(wc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(In.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?tr.copy(t):tr.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ls.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?In.lookAt(ls,tr,this.up):In.lookAt(tr,ls,this.up),this.quaternion.setFromRotationMatrix(In),s&&(In.extractRotation(s.matrixWorld),Ui.setFromRotationMatrix(In),this.quaternion.premultiply(Ui.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Ac),Ni.child=t,this.dispatchEvent(Ni),Ni.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(uu),ea.child=t,this.dispatchEvent(ea),ea.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),In.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),In.multiply(t.parent.matrixWorld)),t.applyMatrix4(In),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Ac),Ni.child=t,this.dispatchEvent(Ni),Ni.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ls,t,lu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ls,hu,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let u=c[l];r(t.shapes,u)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(t.materials,this.material[c]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(t.animations,c))}}if(e){let a=o(t.geometries),c=o(t.materials),l=o(t.textures),h=o(t.images),u=o(t.shapes),p=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),p.length>0&&(n.skeletons=p),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let c=[];for(let l in a){let h=a[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};$e.DEFAULT_UP=new w(0,1,0);$e.DEFAULT_MATRIX_AUTO_UPDATE=!0;$e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var un=new w,Dn=new w,na=new w,Ln=new w,Fi=new w,Oi=new w,Rc=new w,ia=new w,sa=new w,ra=new w,oa=new be,aa=new be,ca=new be,qn=class i{constructor(t=new w,e=new w,n=new w){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),un.subVectors(t,e),s.cross(un);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){un.subVectors(s,e),Dn.subVectors(n,e),na.subVectors(t,e);let o=un.dot(un),a=un.dot(Dn),c=un.dot(na),l=Dn.dot(Dn),h=Dn.dot(na),u=o*l-a*a;if(u===0)return r.set(0,0,0),null;let p=1/u,f=(l*c-a*h)*p,g=(o*h-a*c)*p;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Ln)===null?!1:Ln.x>=0&&Ln.y>=0&&Ln.x+Ln.y<=1}static getInterpolation(t,e,n,s,r,o,a,c){return this.getBarycoord(t,e,n,s,Ln)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Ln.x),c.addScaledVector(o,Ln.y),c.addScaledVector(a,Ln.z),c)}static getInterpolatedAttribute(t,e,n,s,r,o){return oa.setScalar(0),aa.setScalar(0),ca.setScalar(0),oa.fromBufferAttribute(t,e),aa.fromBufferAttribute(t,n),ca.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(oa,r.x),o.addScaledVector(aa,r.y),o.addScaledVector(ca,r.z),o}static isFrontFacing(t,e,n,s){return un.subVectors(n,e),Dn.subVectors(t,e),un.cross(Dn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return un.subVectors(this.c,this.b),Dn.subVectors(this.a,this.b),un.cross(Dn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;Fi.subVectors(s,n),Oi.subVectors(r,n),ia.subVectors(t,n);let c=Fi.dot(ia),l=Oi.dot(ia);if(c<=0&&l<=0)return e.copy(n);sa.subVectors(t,s);let h=Fi.dot(sa),u=Oi.dot(sa);if(h>=0&&u<=h)return e.copy(s);let p=c*u-h*l;if(p<=0&&c>=0&&h<=0)return o=c/(c-h),e.copy(n).addScaledVector(Fi,o);ra.subVectors(t,r);let f=Fi.dot(ra),g=Oi.dot(ra);if(g>=0&&f<=g)return e.copy(r);let x=f*l-c*g;if(x<=0&&l>=0&&g<=0)return a=l/(l-g),e.copy(n).addScaledVector(Oi,a);let m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return Rc.subVectors(r,s),a=(u-h)/(u-h+(f-g)),e.copy(s).addScaledVector(Rc,a);let d=1/(m+x+p);return o=x*d,a=p*d,e.copy(n).addScaledVector(Fi,o).addScaledVector(Oi,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Pl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xn={h:0,s:0,l:0},er={h:0,s:0,l:0};function la(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var $t=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Oe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ae.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=ae.workingColorSpace){return this.r=t,this.g=e,this.b=n,ae.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=ae.workingColorSpace){if(t=Ba(t,1),e=Kt(e,0,1),n=Kt(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=la(o,r,t+1/3),this.g=la(o,r,t),this.b=la(o,r,t-1/3)}return ae.colorSpaceToWorking(this,s),this}setStyle(t,e=Oe){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Oe){let n=Pl[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Un(t.r),this.g=Un(t.g),this.b=Un(t.b),this}copyLinearToSRGB(t){return this.r=Hi(t.r),this.g=Hi(t.g),this.b=Hi(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Oe){return ae.workingToColorSpace(Le.copy(this),t),Math.round(Kt(Le.r*255,0,255))*65536+Math.round(Kt(Le.g*255,0,255))*256+Math.round(Kt(Le.b*255,0,255))}getHexString(t=Oe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ae.workingColorSpace){ae.workingToColorSpace(Le.copy(this),e);let n=Le.r,s=Le.g,r=Le.b,o=Math.max(n,s,r),a=Math.min(n,s,r),c,l,h=(a+o)/2;if(a===o)c=0,l=0;else{let u=o-a;switch(l=h<=.5?u/(o+a):u/(2-o-a),o){case n:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-n)/u+2;break;case r:c=(n-s)/u+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=ae.workingColorSpace){return ae.workingToColorSpace(Le.copy(this),e),t.r=Le.r,t.g=Le.g,t.b=Le.b,t}getStyle(t=Oe){ae.workingToColorSpace(Le.copy(this),t);let e=Le.r,n=Le.g,s=Le.b;return t!==Oe?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Xn),this.setHSL(Xn.h+t,Xn.s+e,Xn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Xn),t.getHSL(er);let n=ds(Xn.h,er.h,e),s=ds(Xn.s,er.s,e),r=ds(Xn.l,er.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Le=new $t;$t.NAMES=Pl;var du=0,Jn=class extends gn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:du++}),this.uuid=Qi(),this.name="",this.type="Material",this.blending=pi,this.side=Nn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=mr,this.blendDst=gr,this.blendEquation=$n,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new $t(0,0,0),this.blendAlpha=0,this.depthFunc=mi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=_a,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=di,this.stencilZFail=di,this.stencilZPass=di,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==pi&&(n.blending=this.blending),this.side!==Nn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==mr&&(n.blendSrc=this.blendSrc),this.blendDst!==gr&&(n.blendDst=this.blendDst),this.blendEquation!==$n&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==mi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==_a&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==di&&(n.stencilFail=this.stencilFail),this.stencilZFail!==di&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==di&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Kn=class extends Jn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new $t(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vn,this.combine=wa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var Ee=new w,nr=new Yt,fu=0,Pe=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:fu++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=xa,this.updateRanges=[],this.gpuType=En,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)nr.fromBufferAttribute(this,e),nr.applyMatrix3(t),this.setXY(e,nr.x,nr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.applyMatrix3(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.applyMatrix4(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.applyNormalMatrix(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.transformDirection(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Vi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Fe(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Vi(e,this.array)),e}setX(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Vi(e,this.array)),e}setY(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Vi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Vi(e,this.array)),e}setW(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array),s=Fe(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array),s=Fe(s,this.array),r=Fe(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==xa&&(t.usage=this.usage),t}},xs=class extends Pe{constructor(t,e,n){super(new Int8Array(t),e,n)}},yn=class extends Pe{constructor(t,e,n){super(new Uint8Array(t),e,n)}};var vs=class extends Pe{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var ys=class extends Pe{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var qe=class extends Pe{constructor(t,e,n){super(new Float32Array(t),e,n)}},pu=0,tn=new Me,ha=new $e,Bi=new w,Ye=new rn,hs=new rn,Ce=new w,on=class i extends gn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:pu++}),this.uuid=Qi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(za(t)?ys:vs)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Zt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return tn.makeRotationFromQuaternion(t),this.applyMatrix4(tn),this}rotateX(t){return tn.makeRotationX(t),this.applyMatrix4(tn),this}rotateY(t){return tn.makeRotationY(t),this.applyMatrix4(tn),this}rotateZ(t){return tn.makeRotationZ(t),this.applyMatrix4(tn),this}translate(t,e,n){return tn.makeTranslation(t,e,n),this.applyMatrix4(tn),this}scale(t,e,n){return tn.makeScale(t,e,n),this.applyMatrix4(tn),this}lookAt(t){return ha.lookAt(t),ha.updateMatrix(),this.applyMatrix4(ha.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Bi).negate(),this.translate(Bi.x,Bi.y,Bi.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new qe(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new rn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];Ye.setFromBufferAttribute(r),this.morphTargetsRelative?(Ce.addVectors(this.boundingBox.min,Ye.min),this.boundingBox.expandByPoint(Ce),Ce.addVectors(this.boundingBox.max,Ye.max),this.boundingBox.expandByPoint(Ce)):(this.boundingBox.expandByPoint(Ye.min),this.boundingBox.expandByPoint(Ye.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new xi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new w,1/0);return}if(t){let n=this.boundingSphere.center;if(Ye.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];hs.setFromBufferAttribute(a),this.morphTargetsRelative?(Ce.addVectors(Ye.min,hs.min),Ye.expandByPoint(Ce),Ce.addVectors(Ye.max,hs.max),Ye.expandByPoint(Ce)):(Ye.expandByPoint(hs.min),Ye.expandByPoint(hs.max))}Ye.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)Ce.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Ce));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Ce.fromBufferAttribute(a,l),c&&(Bi.fromBufferAttribute(t,l),Ce.add(Bi)),s=Math.max(s,n.distanceToSquared(Ce))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Pe(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],c=[];for(let A=0;A<n.count;A++)a[A]=new w,c[A]=new w;let l=new w,h=new w,u=new w,p=new Yt,f=new Yt,g=new Yt,x=new w,m=new w;function d(A,M,y){l.fromBufferAttribute(n,A),h.fromBufferAttribute(n,M),u.fromBufferAttribute(n,y),p.fromBufferAttribute(r,A),f.fromBufferAttribute(r,M),g.fromBufferAttribute(r,y),h.sub(l),u.sub(l),f.sub(p),g.sub(p);let D=1/(f.x*g.y-g.x*f.y);isFinite(D)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(D),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(D),a[A].add(x),a[M].add(x),a[y].add(x),c[A].add(m),c[M].add(m),c[y].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:t.count}]);for(let A=0,M=E.length;A<M;++A){let y=E[A],D=y.start,Y=y.count;for(let G=D,$=D+Y;G<$;G+=3)d(t.getX(G+0),t.getX(G+1),t.getX(G+2))}let b=new w,S=new w,U=new w,R=new w;function I(A){U.fromBufferAttribute(s,A),R.copy(U);let M=a[A];b.copy(M),b.sub(U.multiplyScalar(U.dot(M))).normalize(),S.crossVectors(R,M);let D=S.dot(c[A])<0?-1:1;o.setXYZW(A,b.x,b.y,b.z,D)}for(let A=0,M=E.length;A<M;++A){let y=E[A],D=y.start,Y=y.count;for(let G=D,$=D+Y;G<$;G+=3)I(t.getX(G+0)),I(t.getX(G+1)),I(t.getX(G+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Pe(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let p=0,f=n.count;p<f;p++)n.setXYZ(p,0,0,0);let s=new w,r=new w,o=new w,a=new w,c=new w,l=new w,h=new w,u=new w;if(t)for(let p=0,f=t.count;p<f;p+=3){let g=t.getX(p+0),x=t.getX(p+1),m=t.getX(p+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,x),o.fromBufferAttribute(e,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,x),l.fromBufferAttribute(n,m),a.add(h),c.add(h),l.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let p=0,f=e.count;p<f;p+=3)s.fromBufferAttribute(e,p+0),r.fromBufferAttribute(e,p+1),o.fromBufferAttribute(e,p+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(p+0,h.x,h.y,h.z),n.setXYZ(p+1,h.x,h.y,h.z),n.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ce.fromBufferAttribute(t,e),Ce.normalize(),t.setXYZ(e,Ce.x,Ce.y,Ce.z)}toNonIndexed(){function t(a,c){let l=a.array,h=a.itemSize,u=a.normalized,p=new l.constructor(c.length*h),f=0,g=0;for(let x=0,m=c.length;x<m;x++){a.isInterleavedBufferAttribute?f=c[x]*a.data.stride+a.offset:f=c[x]*h;for(let d=0;d<h;d++)p[g++]=l[f++]}return new Pe(p,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let c=s[a],l=t(c,n);e.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let h=0,u=l.length;h<u;h++){let p=l[h],f=t(p,n);c.push(f)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let l=n[c];t.data.attributes[c]=l.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let u=0,p=l.length;u<p;u++){let f=l[u];h.push(f.toJSON(t.data))}h.length>0&&(s[c]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let l in s){let h=s[l];this.setAttribute(l,h.clone(e))}let r=t.morphAttributes;for(let l in r){let h=[],u=r[l];for(let p=0,f=u.length;p<f;p++)h.push(u[p].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let l=0,h=o.length;l<h;l++){let u=o[l];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Cc=new Me,hi=new xn,ir=new xi,Pc=new w,sr=new w,rr=new w,or=new w,ua=new w,ar=new w,Ic=new w,cr=new w,Be=class extends $e{constructor(t=new on,e=new Kn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){ar.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=a[c],u=r[c];h!==0&&(ua.fromBufferAttribute(u,t),o?ar.addScaledVector(ua,h):ar.addScaledVector(ua.sub(e),h))}e.add(ar)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ir.copy(n.boundingSphere),ir.applyMatrix4(r),hi.copy(t.ray).recast(t.near),!(ir.containsPoint(hi.origin)===!1&&(hi.intersectSphere(ir,Pc)===null||hi.origin.distanceToSquared(Pc)>(t.far-t.near)**2))&&(Cc.copy(r).invert(),hi.copy(t.ray).applyMatrix4(Cc),!(n.boundingBox!==null&&hi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,hi)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,p=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=p.length;g<x;g++){let m=p[g],d=o[m.materialIndex],E=Math.max(m.start,f.start),b=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let S=E,U=b;S<U;S+=3){let R=a.getX(S),I=a.getX(S+1),A=a.getX(S+2);s=lr(this,d,t,n,l,h,u,R,I,A),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let m=g,d=x;m<d;m+=3){let E=a.getX(m),b=a.getX(m+1),S=a.getX(m+2);s=lr(this,o,t,n,l,h,u,E,b,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,x=p.length;g<x;g++){let m=p[g],d=o[m.materialIndex],E=Math.max(m.start,f.start),b=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let S=E,U=b;S<U;S+=3){let R=S,I=S+1,A=S+2;s=lr(this,d,t,n,l,h,u,R,I,A),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),x=Math.min(c.count,f.start+f.count);for(let m=g,d=x;m<d;m+=3){let E=m,b=m+1,S=m+2;s=lr(this,o,t,n,l,h,u,E,b,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function mu(i,t,e,n,s,r,o,a){let c;if(t.side===ze?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,t.side===Nn,a),c===null)return null;cr.copy(a),cr.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(cr);return l<e.near||l>e.far?null:{distance:l,point:cr.clone(),object:i}}function lr(i,t,e,n,s,r,o,a,c,l){i.getVertexPosition(a,sr),i.getVertexPosition(c,rr),i.getVertexPosition(l,or);let h=mu(i,t,e,n,sr,rr,or,Ic);if(h){let u=new w;qn.getBarycoord(Ic,sr,rr,or,u),s&&(h.uv=qn.getInterpolatedAttribute(s,a,c,l,u,new Yt)),r&&(h.uv1=qn.getInterpolatedAttribute(r,a,c,l,u,new Yt)),o&&(h.normal=qn.getInterpolatedAttribute(o,a,c,l,u,new w),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let p={a,b:c,c:l,normal:new w,materialIndex:0};qn.getNormal(sr,rr,or,p.normal),h.face=p,h.barycoord=u}return h}var jn=class i extends on{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],h=[],u=[],p=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new qe(l,3)),this.setAttribute("normal",new qe(h,3)),this.setAttribute("uv",new qe(u,2));function g(x,m,d,E,b,S,U,R,I,A,M){let y=S/I,D=U/A,Y=S/2,G=U/2,$=R/2,et=I+1,W=A+1,K=0,H=0,lt=new w;for(let ht=0;ht<W;ht++){let Mt=ht*D-G;for(let Pt=0;Pt<et;Pt++){let Qt=Pt*y-Y;lt[x]=Qt*E,lt[m]=Mt*b,lt[d]=$,l.push(lt.x,lt.y,lt.z),lt[x]=0,lt[m]=0,lt[d]=R>0?1:-1,h.push(lt.x,lt.y,lt.z),u.push(Pt/I),u.push(1-ht/A),K+=1}}for(let ht=0;ht<A;ht++)for(let Mt=0;Mt<I;Mt++){let Pt=p+Mt+et*ht,Qt=p+Mt+et*(ht+1),J=p+(Mt+1)+et*(ht+1),rt=p+(Mt+1)+et*ht;c.push(Pt,Qt,rt),c.push(Qt,J,rt),H+=6}a.addGroup(f,H,M),f+=H,p+=K}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Si(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Ne(i){let t={};for(let e=0;e<i.length;e++){let n=Si(i[e]);for(let s in n)t[s]=n[s]}return t}function gu(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function ka(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ae.workingColorSpace}var Il={clone:Si,merge:Ne},_u=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,xu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Je=class extends Jn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=_u,this.fragmentShader=xu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Si(t.uniforms),this.uniformsGroups=gu(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},Ms=class extends $e{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Me,this.projectionMatrix=new Me,this.projectionMatrixInverse=new Me,this.coordinateSystem=mn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Yn=new w,Dc=new Yt,Lc=new Yt,Ue=class extends Ms{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Wi*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(us*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Wi*2*Math.atan(Math.tan(us*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Yn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Yn.x,Yn.y).multiplyScalar(-t/Yn.z),Yn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yn.x,Yn.y).multiplyScalar(-t/Yn.z)}getViewSize(t,e){return this.getViewBounds(t,Dc,Lc),e.subVectors(Lc,Dc)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(us*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,e-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},zi=-90,ki=1,br=class extends $e{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ue(zi,ki,t,e);s.layers=this.layers,this.add(s);let r=new Ue(zi,ki,t,e);r.layers=this.layers,this.add(r);let o=new Ue(zi,ki,t,e);o.layers=this.layers,this.add(o);let a=new Ue(zi,ki,t,e);a.layers=this.layers,this.add(a);let c=new Ue(zi,ki,t,e);c.layers=this.layers,this.add(c);let l=new Ue(zi,ki,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,c]=e;for(let l of e)this.remove(l);if(t===mn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===ms)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,h]=this.children,u=t.getRenderTarget(),p=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,c),t.setRenderTarget(n,4,s),t.render(e,l),n.texture.generateMipmaps=x,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(u,p,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Ss=class extends Ze{constructor(t=[],e=yi,n,s,r,o,a,c,l,h){super(t,e,n,s,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Er=class extends _n{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Ss(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new jn(5,5,5),r=new Je({name:"CubemapFromEquirect",uniforms:Si(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:ze,blending:Fn});r.uniforms.tEquirect.value=e;let o=new Be(s,r),a=e.minFilter;return e.minFilter===ii&&(e.minFilter=dn),new br(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}},fi=class extends $e{constructor(){super(),this.isGroup=!0,this.type="Group"}},vu={type:"move"},qi=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new fi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new fi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new fi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(let x of t.hand.values()){let m=e.getJointPose(x,n),d=this._getHandJoint(l,x);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],p=h.position.distanceTo(u.position),f=.02,g=.005;l.inputState.pinching&&p>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&p<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(vu)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new fi;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}};var bs=class extends $e{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new vn,this.environmentIntensity=1,this.environmentRotation=new vn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}};var da=new w,yu=new w,Mu=new Zt,en=class{constructor(t=new w(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=da.subVectors(n,e).cross(yu.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(da),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Mu.getNormalMatrix(t),s=this.coplanarPoint(da).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},ui=new xi,Su=new Yt(.5,.5),hr=new w,Es=class{constructor(t=new en,e=new en,n=new en,s=new en,r=new en,o=new en){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=mn){let n=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],c=s[3],l=s[4],h=s[5],u=s[6],p=s[7],f=s[8],g=s[9],x=s[10],m=s[11],d=s[12],E=s[13],b=s[14],S=s[15];if(n[0].setComponents(c-r,p-l,m-f,S-d).normalize(),n[1].setComponents(c+r,p+l,m+f,S+d).normalize(),n[2].setComponents(c+o,p+h,m+g,S+E).normalize(),n[3].setComponents(c-o,p-h,m-g,S-E).normalize(),n[4].setComponents(c-a,p-u,m-x,S-b).normalize(),e===mn)n[5].setComponents(c+a,p+u,m+x,S+b).normalize();else if(e===ms)n[5].setComponents(a,u,x,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ui.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ui.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ui)}intersectsSprite(t){ui.center.set(0,0,0);let e=Su.distanceTo(t.center);return ui.radius=.7071067811865476+e,ui.applyMatrix4(t.matrixWorld),this.intersectsSphere(ui)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(hr.x=s.normal.x>0?t.max.x:t.min.x,hr.y=s.normal.y>0?t.max.y:t.min.y,hr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(hr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Tr=class extends Jn{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new $t(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Uc=new Me,va=new xn,ur=new xi,dr=new w,Ts=class extends $e{constructor(t=new on,e=new Tr){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ur.copy(n.boundingSphere),ur.applyMatrix4(s),ur.radius+=r,t.ray.intersectsSphere(ur)===!1)return;Uc.copy(s).invert(),va.copy(t.ray).applyMatrix4(Uc);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,u=n.attributes.position;if(l!==null){let p=Math.max(0,o.start),f=Math.min(l.count,o.start+o.count);for(let g=p,x=f;g<x;g++){let m=l.getX(g);dr.fromBufferAttribute(u,m),Nc(dr,m,c,s,t,e,this)}}else{let p=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=p,x=f;g<x;g++)dr.fromBufferAttribute(u,g),Nc(dr,g,c,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Nc(i,t,e,n,s,r,o){let a=va.distanceSqToPoint(i);if(a<e){let c=new w;va.closestPointToPoint(i,c),c.applyMatrix4(n);let l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var ws=class extends Ze{constructor(t,e,n=si,s,r,o,a=nn,c=nn,l,h=Gi,u=1){if(h!==Gi&&h!==ji)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let p={width:t,height:e,depth:u};super(p,s,r,o,a,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Xi(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}};var wr=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=n[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===o)return s/(r-1);let h=n[s],p=n[s+1]-h,f=(o-h)/p;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),c=e||(o.isVector2?new Yt:new w);return c.copy(a).sub(o).normalize(),c}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new w,s=[],r=[],o=[],a=new w,c=new Me;for(let f=0;f<=t;f++){let g=f/t;s[f]=this.getTangentAt(g,new w)}r[0]=new w,o[0]=new w;let l=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),p=Math.abs(s[0].z);h<=l&&(l=h,n.set(1,0,0)),u<=l&&(l=u,n.set(0,1,0)),p<=l&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(Kt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(Kt(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(c.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}};function bu(i,t){let e=1-i;return e*e*e*t}function Eu(i,t){let e=1-i;return 3*e*e*i*t}function Tu(i,t){return 3*(1-i)*i*i*t}function wu(i,t){return i*i*i*t}function fa(i,t,e,n,s){return bu(i,t)+Eu(i,e)+Tu(i,n)+wu(i,s)}var As=class extends wr{constructor(t=new w,e=new w,n=new w,s=new w){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new w){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(fa(t,s.x,r.x,o.x,a.x),fa(t,s.y,r.y,o.y,a.y),fa(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}};var Rs=class i extends on{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),c=Math.floor(s),l=a+1,h=c+1,u=t/a,p=e/c,f=[],g=[],x=[],m=[];for(let d=0;d<h;d++){let E=d*p-o;for(let b=0;b<l;b++){let S=b*u-r;g.push(S,-E,0),x.push(0,0,1),m.push(b/a),m.push(1-d/c)}}for(let d=0;d<c;d++)for(let E=0;E<a;E++){let b=E+l*d,S=E+l*(d+1),U=E+1+l*(d+1),R=E+1+l*d;f.push(b,S,R),f.push(S,U,R)}this.setIndex(f),this.setAttribute("position",new qe(g,3)),this.setAttribute("normal",new qe(x,3)),this.setAttribute("uv",new qe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var Cs=class i extends on{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,h=[],u=new w,p=new w,f=[],g=[],x=[],m=[];for(let d=0;d<=n;d++){let E=[],b=d/n,S=0;d===0&&o===0?S=.5/e:d===n&&c===Math.PI&&(S=-.5/e);for(let U=0;U<=e;U++){let R=U/e;u.x=-t*Math.cos(s+R*r)*Math.sin(o+b*a),u.y=t*Math.cos(o+b*a),u.z=t*Math.sin(s+R*r)*Math.sin(o+b*a),g.push(u.x,u.y,u.z),p.copy(u).normalize(),x.push(p.x,p.y,p.z),m.push(R+S,1-b),E.push(l++)}h.push(E)}for(let d=0;d<n;d++)for(let E=0;E<e;E++){let b=h[d][E+1],S=h[d][E],U=h[d+1][E],R=h[d+1][E+1];(d!==0||o>0)&&f.push(b,S,R),(d!==n-1||c<Math.PI)&&f.push(S,U,R)}this.setIndex(f),this.setAttribute("position",new qe(g,3)),this.setAttribute("normal",new qe(x,3)),this.setAttribute("uv",new qe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Ar=class extends Jn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ml,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Rr=class extends Jn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function fr(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Au(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var vi=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Cr=class extends vi{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:pa,endingEnd:pa}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case ma:r=t,a=2*e-n;break;case ga:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case ma:o=t,c=2*n-e;break;case ga:o=1,c=n+s[1]-s[0];break;default:o=t-1,c=e}let l=(n-e)*.5,h=this.valueSize;this._weightPrev=l/(e-a),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=this._offsetPrev,u=this._offsetNext,p=this._weightPrev,f=this._weightNext,g=(n-e)/(s-e),x=g*g,m=x*g,d=-p*m+2*p*x-p*g,E=(1+p)*m+(-1.5-2*p)*x+(-.5+p)*g+1,b=(-1-f)*m+(1.5+f)*x+.5*g,S=f*m-f*x;for(let U=0;U!==a;++U)r[U]=d*o[h+U]+E*o[l+U]+b*o[c+U]+S*o[u+U];return r}},Pr=class extends vi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=(n-e)/(s-e),u=1-h;for(let p=0;p!==a;++p)r[p]=o[l+p]*u+o[c+p]*h;return r}},Ir=class extends vi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Ke=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=fr(e,this.TimeBufferType),this.values=fr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:fr(t.times,Array),values:fr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Ir(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Pr(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Cr(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case fs:e=this.InterpolantFactoryMethodDiscrete;break;case vr:e=this.InterpolantFactoryMethodLinear;break;case pr:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return fs;case this.InterpolantFactoryMethodLinear:return vr;case this.InterpolantFactoryMethodSmooth:return pr}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),t=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),t=!1;break}o=c}if(s!==void 0&&Au(s))for(let a=0,c=s.length;a!==c;++a){let l=s[a];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===pr,r=t.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=t[a],h=t[a+1];if(l!==h&&(a!==1||l!==t[0]))if(s)c=!0;else{let u=a*n,p=u-n,f=u+n;for(let g=0;g!==n;++g){let x=e[u+g];if(x!==e[p+g]||x!==e[f+g]){c=!0;break}}}if(c){if(a!==o){t[o]=t[a];let u=a*n,p=o*n;for(let f=0;f!==n;++f)e[p+f]=e[u+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)e[c+l]=e[a+l];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};Ke.prototype.ValueTypeName="";Ke.prototype.TimeBufferType=Float32Array;Ke.prototype.ValueBufferType=Float32Array;Ke.prototype.DefaultInterpolation=vr;var Qn=class extends Ke{constructor(t,e,n){super(t,e,n)}};Qn.prototype.ValueTypeName="bool";Qn.prototype.ValueBufferType=Array;Qn.prototype.DefaultInterpolation=fs;Qn.prototype.InterpolantFactoryMethodLinear=void 0;Qn.prototype.InterpolantFactoryMethodSmooth=void 0;var Dr=class extends Ke{constructor(t,e,n,s){super(t,e,n,s)}};Dr.prototype.ValueTypeName="color";var Lr=class extends Ke{constructor(t,e,n,s){super(t,e,n,s)}};Lr.prototype.ValueTypeName="number";var Ur=class extends vi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-e)/(s-e),l=t*a;for(let h=l+a;l!==h;l+=4)sn.slerpFlat(r,0,o,l-a,o,l,c);return r}},Ps=class extends Ke{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new Ur(this.times,this.values,this.getValueSize(),t)}};Ps.prototype.ValueTypeName="quaternion";Ps.prototype.InterpolantFactoryMethodSmooth=void 0;var ti=class extends Ke{constructor(t,e,n){super(t,e,n)}};ti.prototype.ValueTypeName="string";ti.prototype.ValueBufferType=Array;ti.prototype.DefaultInterpolation=fs;ti.prototype.InterpolantFactoryMethodLinear=void 0;ti.prototype.InterpolantFactoryMethodSmooth=void 0;var Nr=class extends Ke{constructor(t,e,n,s){super(t,e,n,s)}};Nr.prototype.ValueTypeName="vector";var Fr=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){let u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,p=l.length;u<p;u+=2){let f=l[u],g=l[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null}}},Dl=new Fr,Or=class{constructor(t){this.manager=t!==void 0?t:Dl,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};Or.DEFAULT_MATERIAL_NAME="__DEFAULT";var Br=class extends Ms{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}};var zr=class extends Ue{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}},Is=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=performance.now();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};var Va="\\[\\]\\.:\\/",Ru=new RegExp("["+Va+"]","g"),Ha="[^"+Va+"]",Cu="[^"+Va.replace("\\.","")+"]",Pu=/((?:WC+[\/:])*)/.source.replace("WC",Ha),Iu=/(WCOD+)?/.source.replace("WCOD",Cu),Du=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ha),Lu=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ha),Uu=new RegExp("^"+Pu+Iu+Du+Lu+"$"),Nu=["material","materials","bones","map"],ya=class{constructor(t,e,n){let s=n||ye.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},ye=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Ru,"")}static parseTrackName(t){let e=Uu.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Nu.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let c=n(a.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===l){l=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(l!==void 0){if(t[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let o=t[s];if(o===void 0){let l=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ye.Composite=ya;ye.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ye.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ye.prototype.GetterByBindingType=[ye.prototype._getValue_direct,ye.prototype._getValue_array,ye.prototype._getValue_arrayElement,ye.prototype._getValue_toArray];ye.prototype.SetterByBindingTypeAndVersioning=[[ye.prototype._setValue_direct,ye.prototype._setValue_direct_setNeedsUpdate,ye.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ye.prototype._setValue_array,ye.prototype._setValue_array_setNeedsUpdate,ye.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ye.prototype._setValue_arrayElement,ye.prototype._setValue_arrayElement_setNeedsUpdate,ye.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ye.prototype._setValue_fromArray,ye.prototype._setValue_fromArray_setNeedsUpdate,ye.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var _0=new Float32Array(1);var Fc=new Me,Ds=class{constructor(t,e,n=0,s=1/0){this.ray=new xn(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new Yi,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Fc.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Fc),this}intersectObject(t,e=!0,n=[]){return Ma(t,this,n,e),n.sort(Oc),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Ma(t[s],this,n,e);return n.sort(Oc),n}};function Oc(i,t){return i.distance-t.distance}function Ma(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Ma(r[o],t,e,!0)}}var Zi=class{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Kt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(Kt(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Ls=class extends gn{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){if(t===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function Ga(i,t,e,n){let s=Fu(n);switch(e){case Ia:return i*t;case La:return i*t/s.components*s.byteLength;case Qr:return i*t/s.components*s.byteLength;case Ua:return i*t*2/s.components*s.byteLength;case to:return i*t*2/s.components*s.byteLength;case Da:return i*t*3/s.components*s.byteLength;case an:return i*t*4/s.components*s.byteLength;case eo:return i*t*4/s.components*s.byteLength;case Os:case Bs:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case zs:case ks:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case io:case ro:return Math.max(i,16)*Math.max(t,8)/4;case no:case so:return Math.max(i,8)*Math.max(t,8)/2;case oo:case ao:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case co:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case lo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ho:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case uo:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case fo:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case po:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case mo:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case go:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case _o:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case xo:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case vo:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case yo:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Mo:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case So:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case bo:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Vs:case Eo:case To:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Na:case wo:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Ao:case Ro:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Fu(i){switch(i){case bn:case Ra:return{byteLength:1,components:1};case $i:case Ca:case Ji:return{byteLength:2,components:1};case Kr:case jr:return{byteLength:2,components:4};case si:case Jr:case En:return{byteLength:4,components:1};case Pa:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"178"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="178");function nh(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Bu(i){let t=new WeakMap;function e(a,c){let l=a.array,h=a.usage,u=l.byteLength,p=i.createBuffer();i.bindBuffer(c,p),i.bufferData(c,l,h),a.onUploadCallback();let f;if(l instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=i.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=i.SHORT;else if(l instanceof Uint32Array)f=i.UNSIGNED_INT;else if(l instanceof Int32Array)f=i.INT;else if(l instanceof Int8Array)f=i.BYTE;else if(l instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:p,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,c,l){let h=c.array,u=c.updateRanges;if(i.bindBuffer(l,a),u.length===0)i.bufferSubData(l,0,h);else{u.sort((f,g)=>f.start-g.start);let p=0;for(let f=1;f<u.length;f++){let g=u[p],x=u[f];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++p,u[p]=x)}u.length=p+1;for(let f=0,g=u.length;f<g;f++){let x=u[f];i.bufferSubData(l,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=t.get(a);c&&(i.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var zu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ku=`#ifdef USE_ALPHAHASH
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
#endif`,Vu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Hu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Gu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Wu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Xu=`#ifdef USE_AOMAP
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
#endif`,Yu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,qu=`#ifdef USE_BATCHING
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
#endif`,Zu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,$u=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ju=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ku=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,ju=`#ifdef USE_IRIDESCENCE
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
#endif`,Qu=`#ifdef USE_BUMPMAP
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
#endif`,td=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,ed=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,nd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,id=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,sd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,rd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,od=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,ad=`#if defined( USE_COLOR_ALPHA )
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
#endif`,cd=`#define PI 3.141592653589793
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
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
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
} // validated`,ld=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,hd=`vec3 transformedNormal = objectNormal;
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
#endif`,ud=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,dd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,fd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,pd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,md="gl_FragColor = linearToOutputTexel( gl_FragColor );",gd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,_d=`#ifdef USE_ENVMAP
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
#endif`,xd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,vd=`#ifdef USE_ENVMAP
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
#endif`,yd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Md=`#ifdef USE_ENVMAP
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
#endif`,Sd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,bd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Ed=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Td=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,wd=`#ifdef USE_GRADIENTMAP
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
}`,Ad=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Rd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Cd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Pd=`uniform bool receiveShadow;
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
#endif`,Id=`#ifdef USE_ENVMAP
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
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
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
#endif`,Dd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ld=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ud=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Nd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Fd=`PhysicalMaterial material;
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
#endif`,Od=`struct PhysicalMaterial {
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
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
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
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
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
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
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
}`,Bd=`
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
#endif`,zd=`#if defined( RE_IndirectDiffuse )
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
#endif`,kd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Vd=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Hd=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gd=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Wd=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Xd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Yd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,qd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Zd=`#if defined( USE_POINTS_UV )
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
#endif`,$d=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Jd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Kd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,jd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Qd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,tf=`#ifdef USE_MORPHTARGETS
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
#endif`,ef=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,nf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,sf=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,rf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,of=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,af=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,cf=`#ifdef USE_NORMALMAP
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
#endif`,lf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,hf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,uf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,df=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,ff=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,pf=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,mf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,gf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,_f=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,xf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,vf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,yf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Mf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
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
#endif`,Sf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,bf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Ef=`float getShadowMask() {
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
}`,Tf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,wf=`#ifdef USE_SKINNING
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
#endif`,Af=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Rf=`#ifdef USE_SKINNING
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
#endif`,Cf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Pf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,If=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Df=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Lf=`#ifdef USE_TRANSMISSION
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
#endif`,Uf=`#ifdef USE_TRANSMISSION
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
#endif`,Nf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Ff=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Of=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Bf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,zf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,kf=`uniform sampler2D t2D;
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
}`,Vf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Hf=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Gf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Wf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xf=`#include <common>
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
}`,Yf=`#if DEPTH_PACKING == 3200
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
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,qf=`#define DISTANCE
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
}`,Zf=`#define DISTANCE
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
}`,$f=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Jf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kf=`uniform float scale;
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
}`,jf=`uniform vec3 diffuse;
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
}`,Qf=`#include <common>
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
}`,tp=`uniform vec3 diffuse;
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
}`,ep=`#define LAMBERT
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
}`,np=`#define LAMBERT
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
}`,ip=`#define MATCAP
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
}`,sp=`#define MATCAP
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
}`,rp=`#define NORMAL
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
}`,op=`#define NORMAL
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
}`,ap=`#define PHONG
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
}`,cp=`#define PHONG
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
}`,lp=`#define STANDARD
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
}`,hp=`#define STANDARD
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
}`,up=`#define TOON
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
}`,dp=`#define TOON
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
}`,fp=`uniform float size;
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
}`,pp=`uniform vec3 diffuse;
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
}`,mp=`#include <common>
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
}`,gp=`uniform vec3 color;
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
}`,_p=`uniform float rotation;
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
}`,xp=`uniform vec3 diffuse;
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
}`,jt={alphahash_fragment:zu,alphahash_pars_fragment:ku,alphamap_fragment:Vu,alphamap_pars_fragment:Hu,alphatest_fragment:Gu,alphatest_pars_fragment:Wu,aomap_fragment:Xu,aomap_pars_fragment:Yu,batching_pars_vertex:qu,batching_vertex:Zu,begin_vertex:$u,beginnormal_vertex:Ju,bsdfs:Ku,iridescence_fragment:ju,bumpmap_pars_fragment:Qu,clipping_planes_fragment:td,clipping_planes_pars_fragment:ed,clipping_planes_pars_vertex:nd,clipping_planes_vertex:id,color_fragment:sd,color_pars_fragment:rd,color_pars_vertex:od,color_vertex:ad,common:cd,cube_uv_reflection_fragment:ld,defaultnormal_vertex:hd,displacementmap_pars_vertex:ud,displacementmap_vertex:dd,emissivemap_fragment:fd,emissivemap_pars_fragment:pd,colorspace_fragment:md,colorspace_pars_fragment:gd,envmap_fragment:_d,envmap_common_pars_fragment:xd,envmap_pars_fragment:vd,envmap_pars_vertex:yd,envmap_physical_pars_fragment:Id,envmap_vertex:Md,fog_vertex:Sd,fog_pars_vertex:bd,fog_fragment:Ed,fog_pars_fragment:Td,gradientmap_pars_fragment:wd,lightmap_pars_fragment:Ad,lights_lambert_fragment:Rd,lights_lambert_pars_fragment:Cd,lights_pars_begin:Pd,lights_toon_fragment:Dd,lights_toon_pars_fragment:Ld,lights_phong_fragment:Ud,lights_phong_pars_fragment:Nd,lights_physical_fragment:Fd,lights_physical_pars_fragment:Od,lights_fragment_begin:Bd,lights_fragment_maps:zd,lights_fragment_end:kd,logdepthbuf_fragment:Vd,logdepthbuf_pars_fragment:Hd,logdepthbuf_pars_vertex:Gd,logdepthbuf_vertex:Wd,map_fragment:Xd,map_pars_fragment:Yd,map_particle_fragment:qd,map_particle_pars_fragment:Zd,metalnessmap_fragment:$d,metalnessmap_pars_fragment:Jd,morphinstance_vertex:Kd,morphcolor_vertex:jd,morphnormal_vertex:Qd,morphtarget_pars_vertex:tf,morphtarget_vertex:ef,normal_fragment_begin:nf,normal_fragment_maps:sf,normal_pars_fragment:rf,normal_pars_vertex:of,normal_vertex:af,normalmap_pars_fragment:cf,clearcoat_normal_fragment_begin:lf,clearcoat_normal_fragment_maps:hf,clearcoat_pars_fragment:uf,iridescence_pars_fragment:df,opaque_fragment:ff,packing:pf,premultiplied_alpha_fragment:mf,project_vertex:gf,dithering_fragment:_f,dithering_pars_fragment:xf,roughnessmap_fragment:vf,roughnessmap_pars_fragment:yf,shadowmap_pars_fragment:Mf,shadowmap_pars_vertex:Sf,shadowmap_vertex:bf,shadowmask_pars_fragment:Ef,skinbase_vertex:Tf,skinning_pars_vertex:wf,skinning_vertex:Af,skinnormal_vertex:Rf,specularmap_fragment:Cf,specularmap_pars_fragment:Pf,tonemapping_fragment:If,tonemapping_pars_fragment:Df,transmission_fragment:Lf,transmission_pars_fragment:Uf,uv_pars_fragment:Nf,uv_pars_vertex:Ff,uv_vertex:Of,worldpos_vertex:Bf,background_vert:zf,background_frag:kf,backgroundCube_vert:Vf,backgroundCube_frag:Hf,cube_vert:Gf,cube_frag:Wf,depth_vert:Xf,depth_frag:Yf,distanceRGBA_vert:qf,distanceRGBA_frag:Zf,equirect_vert:$f,equirect_frag:Jf,linedashed_vert:Kf,linedashed_frag:jf,meshbasic_vert:Qf,meshbasic_frag:tp,meshlambert_vert:ep,meshlambert_frag:np,meshmatcap_vert:ip,meshmatcap_frag:sp,meshnormal_vert:rp,meshnormal_frag:op,meshphong_vert:ap,meshphong_frag:cp,meshphysical_vert:lp,meshphysical_frag:hp,meshtoon_vert:up,meshtoon_frag:dp,points_vert:fp,points_frag:pp,shadow_vert:mp,shadow_frag:gp,sprite_vert:_p,sprite_frag:xp},mt={common:{diffuse:{value:new $t(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Zt}},envmap:{envMap:{value:null},envMapRotation:{value:new Zt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Zt},normalScale:{value:new Yt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new $t(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new $t(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0},uvTransform:{value:new Zt}},sprite:{diffuse:{value:new $t(16777215)},opacity:{value:1},center:{value:new Yt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}}},Tn={basic:{uniforms:Ne([mt.common,mt.specularmap,mt.envmap,mt.aomap,mt.lightmap,mt.fog]),vertexShader:jt.meshbasic_vert,fragmentShader:jt.meshbasic_frag},lambert:{uniforms:Ne([mt.common,mt.specularmap,mt.envmap,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.fog,mt.lights,{emissive:{value:new $t(0)}}]),vertexShader:jt.meshlambert_vert,fragmentShader:jt.meshlambert_frag},phong:{uniforms:Ne([mt.common,mt.specularmap,mt.envmap,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.fog,mt.lights,{emissive:{value:new $t(0)},specular:{value:new $t(1118481)},shininess:{value:30}}]),vertexShader:jt.meshphong_vert,fragmentShader:jt.meshphong_frag},standard:{uniforms:Ne([mt.common,mt.envmap,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.roughnessmap,mt.metalnessmap,mt.fog,mt.lights,{emissive:{value:new $t(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:jt.meshphysical_vert,fragmentShader:jt.meshphysical_frag},toon:{uniforms:Ne([mt.common,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.gradientmap,mt.fog,mt.lights,{emissive:{value:new $t(0)}}]),vertexShader:jt.meshtoon_vert,fragmentShader:jt.meshtoon_frag},matcap:{uniforms:Ne([mt.common,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.fog,{matcap:{value:null}}]),vertexShader:jt.meshmatcap_vert,fragmentShader:jt.meshmatcap_frag},points:{uniforms:Ne([mt.points,mt.fog]),vertexShader:jt.points_vert,fragmentShader:jt.points_frag},dashed:{uniforms:Ne([mt.common,mt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:jt.linedashed_vert,fragmentShader:jt.linedashed_frag},depth:{uniforms:Ne([mt.common,mt.displacementmap]),vertexShader:jt.depth_vert,fragmentShader:jt.depth_frag},normal:{uniforms:Ne([mt.common,mt.bumpmap,mt.normalmap,mt.displacementmap,{opacity:{value:1}}]),vertexShader:jt.meshnormal_vert,fragmentShader:jt.meshnormal_frag},sprite:{uniforms:Ne([mt.sprite,mt.fog]),vertexShader:jt.sprite_vert,fragmentShader:jt.sprite_frag},background:{uniforms:{uvTransform:{value:new Zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:jt.background_vert,fragmentShader:jt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Zt}},vertexShader:jt.backgroundCube_vert,fragmentShader:jt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:jt.cube_vert,fragmentShader:jt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:jt.equirect_vert,fragmentShader:jt.equirect_frag},distanceRGBA:{uniforms:Ne([mt.common,mt.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:jt.distanceRGBA_vert,fragmentShader:jt.distanceRGBA_frag},shadow:{uniforms:Ne([mt.lights,mt.fog,{color:{value:new $t(0)},opacity:{value:1}}]),vertexShader:jt.shadow_vert,fragmentShader:jt.shadow_frag}};Tn.physical={uniforms:Ne([Tn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Zt},clearcoatNormalScale:{value:new Yt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Zt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Zt},sheen:{value:0},sheenColor:{value:new $t(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Zt},transmissionSamplerSize:{value:new Yt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Zt},attenuationDistance:{value:0},attenuationColor:{value:new $t(0)},specularColor:{value:new $t(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Zt},anisotropyVector:{value:new Yt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Zt}}]),vertexShader:jt.meshphysical_vert,fragmentShader:jt.meshphysical_frag};var Co={r:0,b:0,g:0},bi=new vn,vp=new Me;function yp(i,t,e,n,s,r,o){let a=new $t(0),c=r===!0?0:1,l,h,u=null,p=0,f=null;function g(b){let S=b.isScene===!0?b.background:null;return S&&S.isTexture&&(S=(b.backgroundBlurriness>0?e:t).get(S)),S}function x(b){let S=!1,U=g(b);U===null?d(a,c):U&&U.isColor&&(d(U,1),S=!0);let R=i.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,o):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(b,S){let U=g(S);U&&(U.isCubeTexture||U.mapping===Ns)?(h===void 0&&(h=new Be(new jn(1,1,1),new Je({name:"BackgroundCubeMaterial",uniforms:Si(Tn.backgroundCube.uniforms),vertexShader:Tn.backgroundCube.vertexShader,fragmentShader:Tn.backgroundCube.fragmentShader,side:ze,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(R,I,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),bi.copy(S.backgroundRotation),bi.x*=-1,bi.y*=-1,bi.z*=-1,U.isCubeTexture&&U.isRenderTargetTexture===!1&&(bi.y*=-1,bi.z*=-1),h.material.uniforms.envMap.value=U,h.material.uniforms.flipEnvMap.value=U.isCubeTexture&&U.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(vp.makeRotationFromEuler(bi)),h.material.toneMapped=ae.getTransfer(U.colorSpace)!==de,(u!==U||p!==U.version||f!==i.toneMapping)&&(h.material.needsUpdate=!0,u=U,p=U.version,f=i.toneMapping),h.layers.enableAll(),b.unshift(h,h.geometry,h.material,0,0,null)):U&&U.isTexture&&(l===void 0&&(l=new Be(new Rs(2,2),new Je({name:"BackgroundMaterial",uniforms:Si(Tn.background.uniforms),vertexShader:Tn.background.vertexShader,fragmentShader:Tn.background.fragmentShader,side:Nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=U,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=ae.getTransfer(U.colorSpace)!==de,U.matrixAutoUpdate===!0&&U.updateMatrix(),l.material.uniforms.uvTransform.value.copy(U.matrix),(u!==U||p!==U.version||f!==i.toneMapping)&&(l.material.needsUpdate=!0,u=U,p=U.version,f=i.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function d(b,S){b.getRGB(Co,ka(i)),n.buffers.color.setClear(Co.r,Co.g,Co.b,S,o)}function E(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(b,S=1){a.set(b),c=S,d(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(b){c=b,d(a,c)},render:x,addToRenderList:m,dispose:E}}function Mp(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=p(null),r=s,o=!1;function a(y,D,Y,G,$){let et=!1,W=u(G,Y,D);r!==W&&(r=W,l(r.object)),et=f(y,G,Y,$),et&&g(y,G,Y,$),$!==null&&t.update($,i.ELEMENT_ARRAY_BUFFER),(et||o)&&(o=!1,S(y,D,Y,G),$!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get($).buffer))}function c(){return i.createVertexArray()}function l(y){return i.bindVertexArray(y)}function h(y){return i.deleteVertexArray(y)}function u(y,D,Y){let G=Y.wireframe===!0,$=n[y.id];$===void 0&&($={},n[y.id]=$);let et=$[D.id];et===void 0&&(et={},$[D.id]=et);let W=et[G];return W===void 0&&(W=p(c()),et[G]=W),W}function p(y){let D=[],Y=[],G=[];for(let $=0;$<e;$++)D[$]=0,Y[$]=0,G[$]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:Y,attributeDivisors:G,object:y,attributes:{},index:null}}function f(y,D,Y,G){let $=r.attributes,et=D.attributes,W=0,K=Y.getAttributes();for(let H in K)if(K[H].location>=0){let ht=$[H],Mt=et[H];if(Mt===void 0&&(H==="instanceMatrix"&&y.instanceMatrix&&(Mt=y.instanceMatrix),H==="instanceColor"&&y.instanceColor&&(Mt=y.instanceColor)),ht===void 0||ht.attribute!==Mt||Mt&&ht.data!==Mt.data)return!0;W++}return r.attributesNum!==W||r.index!==G}function g(y,D,Y,G){let $={},et=D.attributes,W=0,K=Y.getAttributes();for(let H in K)if(K[H].location>=0){let ht=et[H];ht===void 0&&(H==="instanceMatrix"&&y.instanceMatrix&&(ht=y.instanceMatrix),H==="instanceColor"&&y.instanceColor&&(ht=y.instanceColor));let Mt={};Mt.attribute=ht,ht&&ht.data&&(Mt.data=ht.data),$[H]=Mt,W++}r.attributes=$,r.attributesNum=W,r.index=G}function x(){let y=r.newAttributes;for(let D=0,Y=y.length;D<Y;D++)y[D]=0}function m(y){d(y,0)}function d(y,D){let Y=r.newAttributes,G=r.enabledAttributes,$=r.attributeDivisors;Y[y]=1,G[y]===0&&(i.enableVertexAttribArray(y),G[y]=1),$[y]!==D&&(i.vertexAttribDivisor(y,D),$[y]=D)}function E(){let y=r.newAttributes,D=r.enabledAttributes;for(let Y=0,G=D.length;Y<G;Y++)D[Y]!==y[Y]&&(i.disableVertexAttribArray(Y),D[Y]=0)}function b(y,D,Y,G,$,et,W){W===!0?i.vertexAttribIPointer(y,D,Y,$,et):i.vertexAttribPointer(y,D,Y,G,$,et)}function S(y,D,Y,G){x();let $=G.attributes,et=Y.getAttributes(),W=D.defaultAttributeValues;for(let K in et){let H=et[K];if(H.location>=0){let lt=$[K];if(lt===void 0&&(K==="instanceMatrix"&&y.instanceMatrix&&(lt=y.instanceMatrix),K==="instanceColor"&&y.instanceColor&&(lt=y.instanceColor)),lt!==void 0){let ht=lt.normalized,Mt=lt.itemSize,Pt=t.get(lt);if(Pt===void 0)continue;let Qt=Pt.buffer,J=Pt.type,rt=Pt.bytesPerElement,bt=J===i.INT||J===i.UNSIGNED_INT||lt.gpuType===Jr;if(lt.isInterleavedBufferAttribute){let gt=lt.data,It=gt.stride,yt=lt.offset;if(gt.isInstancedInterleavedBuffer){for(let Lt=0;Lt<H.locationSize;Lt++)d(H.location+Lt,gt.meshPerAttribute);y.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=gt.meshPerAttribute*gt.count)}else for(let Lt=0;Lt<H.locationSize;Lt++)m(H.location+Lt);i.bindBuffer(i.ARRAY_BUFFER,Qt);for(let Lt=0;Lt<H.locationSize;Lt++)b(H.location+Lt,Mt/H.locationSize,J,ht,It*rt,(yt+Mt/H.locationSize*Lt)*rt,bt)}else{if(lt.isInstancedBufferAttribute){for(let gt=0;gt<H.locationSize;gt++)d(H.location+gt,lt.meshPerAttribute);y.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=lt.meshPerAttribute*lt.count)}else for(let gt=0;gt<H.locationSize;gt++)m(H.location+gt);i.bindBuffer(i.ARRAY_BUFFER,Qt);for(let gt=0;gt<H.locationSize;gt++)b(H.location+gt,Mt/H.locationSize,J,ht,Mt*rt,Mt/H.locationSize*gt*rt,bt)}}else if(W!==void 0){let ht=W[K];if(ht!==void 0)switch(ht.length){case 2:i.vertexAttrib2fv(H.location,ht);break;case 3:i.vertexAttrib3fv(H.location,ht);break;case 4:i.vertexAttrib4fv(H.location,ht);break;default:i.vertexAttrib1fv(H.location,ht)}}}}E()}function U(){A();for(let y in n){let D=n[y];for(let Y in D){let G=D[Y];for(let $ in G)h(G[$].object),delete G[$];delete D[Y]}delete n[y]}}function R(y){if(n[y.id]===void 0)return;let D=n[y.id];for(let Y in D){let G=D[Y];for(let $ in G)h(G[$].object),delete G[$];delete D[Y]}delete n[y.id]}function I(y){for(let D in n){let Y=n[D];if(Y[y.id]===void 0)continue;let G=Y[y.id];for(let $ in G)h(G[$].object),delete G[$];delete Y[y.id]}}function A(){M(),o=!0,r!==s&&(r=s,l(r.object))}function M(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:A,resetDefaultState:M,dispose:U,releaseStatesOfGeometry:R,releaseStatesOfProgram:I,initAttributes:x,enableAttribute:m,disableUnusedAttributes:E}}function Sp(i,t,e){let n;function s(l){n=l}function r(l,h){i.drawArrays(n,l,h),e.update(h,n,1)}function o(l,h,u){u!==0&&(i.drawArraysInstanced(n,l,h,u),e.update(h,n,u))}function a(l,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];e.update(f,n,1)}function c(l,h,u,p){if(u===0)return;let f=t.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<l.length;g++)o(l[g],h[g],p[g]);else{f.multiDrawArraysInstancedWEBGL(n,l,0,h,0,p,0,u);let g=0;for(let x=0;x<u;x++)g+=h[x]*p[x];e.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function bp(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let I=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(I){return!(I!==an&&n.convert(I)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(I){let A=I===Ji&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(I!==bn&&n.convert(I)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==En&&!A)}function c(I){if(I==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp",h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let u=e.logarithmicDepthBuffer===!0,p=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),E=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),U=g>0,R=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:u,reverseDepthBuffer:p,maxTextures:f,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:E,maxVaryings:b,maxFragmentUniforms:S,vertexTextures:U,maxSamples:R}}function Ep(i){let t=this,e=null,n=0,s=!1,r=!1,o=new en,a=new Zt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,p){let f=u.length!==0||p||n!==0||s;return s=p,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,p){e=h(u,p,0)},this.setState=function(u,p,f){let g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,d=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):l();else{let E=r?0:n,b=E*4,S=d.clippingState||null;c.value=S,S=h(g,p,b,f);for(let U=0;U!==b;++U)S[U]=e[U];d.clippingState=S,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=E}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,p,f,g){let x=u!==null?u.length:0,m=null;if(x!==0){if(m=c.value,g!==!0||m===null){let d=f+x*4,E=p.matrixWorldInverse;a.getNormalMatrix(E),(m===null||m.length<d)&&(m=new Float32Array(d));for(let b=0,S=f;b!==x;++b,S+=4)o.copy(u[b]).applyMatrix4(E,a),o.normal.toArray(m,S),m[S+3]=o.constant}c.value=m,c.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,m}}function Tp(i){let t=new WeakMap;function e(o,a){return a===qr?o.mapping=yi:a===Zr&&(o.mapping=Mi),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===qr||a===Zr)if(t.has(o)){let c=t.get(o).texture;return e(c,o.mapping)}else{let c=o.image;if(c&&c.height>0){let l=new Er(c.height);return l.fromEquirectangularTexture(i,o),t.set(o,l),o.addEventListener("dispose",s),e(l.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let c=t.get(a);c!==void 0&&(t.delete(a),c.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var es=4,Ll=[.125,.215,.35,.446,.526,.582],wi=20,Wa=new Br,Ul=new $t,Xa=null,Ya=0,qa=0,Za=!1,Ti=(1+Math.sqrt(5))/2,ts=1/Ti,Nl=[new w(-Ti,ts,0),new w(Ti,ts,0),new w(-ts,0,Ti),new w(ts,0,Ti),new w(0,Ti,-ts),new w(0,Ti,ts),new w(-1,1,-1),new w(1,1,-1),new w(-1,1,1),new w(1,1,1)],wp=new w,Do=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100,r={}){let{size:o=256,position:a=wp}=r;Xa=this._renderer.getRenderTarget(),Ya=this._renderer.getActiveCubeFace(),qa=this._renderer.getActiveMipmapLevel(),Za=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,n,s,c,a),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Bl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ol(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Xa,Ya,qa),this._renderer.xr.enabled=Za,t.scissorTest=!1,Po(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===yi||t.mapping===Mi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Xa=this._renderer.getRenderTarget(),Ya=this._renderer.getActiveCubeFace(),qa=this._renderer.getActiveMipmapLevel(),Za=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:dn,minFilter:dn,generateMipmaps:!1,type:Ji,format:an,colorSpace:gi,depthBuffer:!1},s=Fl(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Fl(t,e,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Ap(r)),this._blurMaterial=Rp(r,t,e)}return s}_compileMaterial(t){let e=new Be(this._lodPlanes[0],t);this._renderer.compile(e,Wa)}_sceneToCubeUV(t,e,n,s,r){let c=new Ue(90,1,e,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,p=u.autoClear,f=u.toneMapping;u.getClearColor(Ul),u.toneMapping=fn,u.autoClear=!1;let g=new Kn({name:"PMREM.Background",side:ze,depthWrite:!1,depthTest:!1}),x=new Be(new jn,g),m=!1,d=t.background;d?d.isColor&&(g.color.copy(d),t.background=null,m=!0):(g.color.copy(Ul),m=!0);for(let E=0;E<6;E++){let b=E%3;b===0?(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[E],r.y,r.z)):b===1?(c.up.set(0,0,l[E]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[E],r.z)):(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[E]));let S=this._cubeSize;Po(s,b*S,E>2?S:0,S,S),u.setRenderTarget(s),m&&u.render(x,c),u.render(t,c)}x.geometry.dispose(),x.material.dispose(),u.toneMapping=f,u.autoClear=p,t.background=d}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===yi||t.mapping===Mi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Bl()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ol());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new Be(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;let c=this._cubeSize;Po(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(o,Wa)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Nl[(s-r-1)%Nl.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new Be(this._lodPlanes[s],l),p=l.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*wi-1),x=r/g,m=isFinite(r)?1+Math.floor(h*x):wi;m>wi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${wi}`);let d=[],E=0;for(let I=0;I<wi;++I){let A=I/x,M=Math.exp(-A*A/2);d.push(M),I===0?E+=M:I<m&&(E+=2*M)}for(let I=0;I<d.length;I++)d[I]=d[I]/E;p.envMap.value=t.texture,p.samples.value=m,p.weights.value=d,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);let{_lodMax:b}=this;p.dTheta.value=g,p.mipInt.value=b-n;let S=this._sizeLods[s],U=3*S*(s>b-es?s-b+es:0),R=4*(this._cubeSize-S);Po(e,U,R,3*S,2*S),c.setRenderTarget(e),c.render(u,Wa)}};function Ap(i){let t=[],e=[],n=[],s=i,r=i-es+1+Ll.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);e.push(a);let c=1/a;o>i-es?c=Ll[o-i+es-1]:o===0&&(c=0),n.push(c);let l=1/(a-2),h=-l,u=1+l,p=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,x=3,m=2,d=1,E=new Float32Array(x*g*f),b=new Float32Array(m*g*f),S=new Float32Array(d*g*f);for(let R=0;R<f;R++){let I=R%3*2/3-1,A=R>2?0:-1,M=[I,A,0,I+2/3,A,0,I+2/3,A+1,0,I,A,0,I+2/3,A+1,0,I,A+1,0];E.set(M,x*g*R),b.set(p,m*g*R);let y=[R,R,R,R,R,R];S.set(y,d*g*R)}let U=new on;U.setAttribute("position",new Pe(E,x)),U.setAttribute("uv",new Pe(b,m)),U.setAttribute("faceIndex",new Pe(S,d)),t.push(U),s>es&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Fl(i,t,e){let n=new _n(i,t,e);return n.texture.mapping=Ns,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Po(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Rp(i,t,e){let n=new Float32Array(wi),s=new w(0,1,0);return new Je({name:"SphericalGaussianBlur",defines:{n:wi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:sc(),fragmentShader:`

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
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function Ol(){return new Je({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:sc(),fragmentShader:`

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
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function Bl(){return new Je({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:sc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function sc(){return`

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
	`}function Cp(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){let c=a.mapping,l=c===qr||c===Zr,h=c===yi||c===Mi;if(l||h){let u=t.get(a),p=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return e===null&&(e=new Do(i)),u=l?e.fromEquirectangular(a,u):e.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),u.texture;if(u!==void 0)return u.texture;{let f=a.image;return l&&f&&f.height>0||h&&f&&s(f)?(e===null&&(e=new Do(i)),u=l?e.fromEquirectangular(a):e.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let c=0,l=6;for(let h=0;h<l;h++)a[h]!==void 0&&c++;return c===l}function r(a){let c=a.target;c.removeEventListener("dispose",r);let l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function Pp(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&_i("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Ip(i,t,e,n){let s={},r=new WeakMap;function o(u){let p=u.target;p.index!==null&&t.remove(p.index);for(let g in p.attributes)t.remove(p.attributes[g]);p.removeEventListener("dispose",o),delete s[p.id];let f=r.get(p);f&&(t.remove(f),r.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,e.memory.geometries--}function a(u,p){return s[p.id]===!0||(p.addEventListener("dispose",o),s[p.id]=!0,e.memory.geometries++),p}function c(u){let p=u.attributes;for(let f in p)t.update(p[f],i.ARRAY_BUFFER)}function l(u){let p=[],f=u.index,g=u.attributes.position,x=0;if(f!==null){let E=f.array;x=f.version;for(let b=0,S=E.length;b<S;b+=3){let U=E[b+0],R=E[b+1],I=E[b+2];p.push(U,R,R,I,I,U)}}else if(g!==void 0){let E=g.array;x=g.version;for(let b=0,S=E.length/3-1;b<S;b+=3){let U=b+0,R=b+1,I=b+2;p.push(U,R,R,I,I,U)}}else return;let m=new(za(p)?ys:vs)(p,1);m.version=x;let d=r.get(u);d&&t.remove(d),r.set(u,m)}function h(u){let p=r.get(u);if(p){let f=u.index;f!==null&&p.version<f.version&&l(u)}else l(u);return r.get(u)}return{get:a,update:c,getWireframeAttribute:h}}function Dp(i,t,e){let n;function s(p){n=p}let r,o;function a(p){r=p.type,o=p.bytesPerElement}function c(p,f){i.drawElements(n,f,r,p*o),e.update(f,n,1)}function l(p,f,g){g!==0&&(i.drawElementsInstanced(n,f,r,p*o,g),e.update(f,n,g))}function h(p,f,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,p,0,g);let m=0;for(let d=0;d<g;d++)m+=f[d];e.update(m,n,1)}function u(p,f,g,x){if(g===0)return;let m=t.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<p.length;d++)l(p[d]/o,f[d],x[d]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,p,0,x,0,g);let d=0;for(let E=0;E<g;E++)d+=f[E]*x[E];e.update(d,n,1)}}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Lp(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Up(i,t,e){let n=new WeakMap,s=new be;function r(o,a,c){let l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,p=n.get(a);if(p===void 0||p.count!==u){let M=function(){I.dispose(),n.delete(a),a.removeEventListener("dispose",M)};p!==void 0&&p.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],E=a.morphAttributes.color||[],b=0;f===!0&&(b=1),g===!0&&(b=2),x===!0&&(b=3);let S=a.attributes.position.count*b,U=1;S>t.maxTextureSize&&(U=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);let R=new Float32Array(S*U*4*u),I=new _s(R,S,U,u);I.type=En,I.needsUpdate=!0;let A=b*4;for(let y=0;y<u;y++){let D=m[y],Y=d[y],G=E[y],$=S*U*4*y;for(let et=0;et<D.count;et++){let W=et*A;f===!0&&(s.fromBufferAttribute(D,et),R[$+W+0]=s.x,R[$+W+1]=s.y,R[$+W+2]=s.z,R[$+W+3]=0),g===!0&&(s.fromBufferAttribute(Y,et),R[$+W+4]=s.x,R[$+W+5]=s.y,R[$+W+6]=s.z,R[$+W+7]=0),x===!0&&(s.fromBufferAttribute(G,et),R[$+W+8]=s.x,R[$+W+9]=s.y,R[$+W+10]=s.z,R[$+W+11]=G.itemSize===4?s.w:1)}}p={count:u,texture:I,size:new Yt(S,U)},n.set(a,p),a.addEventListener("dispose",M)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let f=0;for(let x=0;x<l.length;x++)f+=l[x];let g=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(i,"morphTargetBaseInfluence",g),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",p.texture,e),c.getUniforms().setValue(i,"morphTargetsTextureSize",p.size)}return{update:r}}function Np(i,t,e,n){let s=new WeakMap;function r(c){let l=n.render.frame,h=c.geometry,u=t.get(c,h);if(s.get(u)!==l&&(t.update(u),s.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),s.get(c)!==l&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){let p=c.skeleton;s.get(p)!==l&&(p.update(),s.set(p,l))}return u}function o(){s=new WeakMap}function a(c){let l=c.target;l.removeEventListener("dispose",a),e.remove(l.instanceMatrix),l.instanceColor!==null&&e.remove(l.instanceColor)}return{update:r,dispose:o}}var ih=new Ze,zl=new ws(1,1),sh=new _s,rh=new Sr,oh=new Ss,kl=[],Vl=[],Hl=new Float32Array(16),Gl=new Float32Array(9),Wl=new Float32Array(4);function is(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=kl[s];if(r===void 0&&(r=new Float32Array(s),kl[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Te(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function we(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function Uo(i,t){let e=Vl[t];e===void 0&&(e=new Int32Array(t),Vl[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Fp(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Op(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2fv(this.addr,t),we(e,t)}}function Bp(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Te(e,t))return;i.uniform3fv(this.addr,t),we(e,t)}}function zp(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4fv(this.addr,t),we(e,t)}}function kp(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),we(e,t)}else{if(Te(e,n))return;Wl.set(n),i.uniformMatrix2fv(this.addr,!1,Wl),we(e,n)}}function Vp(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),we(e,t)}else{if(Te(e,n))return;Gl.set(n),i.uniformMatrix3fv(this.addr,!1,Gl),we(e,n)}}function Hp(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),we(e,t)}else{if(Te(e,n))return;Hl.set(n),i.uniformMatrix4fv(this.addr,!1,Hl),we(e,n)}}function Gp(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Wp(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2iv(this.addr,t),we(e,t)}}function Xp(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;i.uniform3iv(this.addr,t),we(e,t)}}function Yp(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4iv(this.addr,t),we(e,t)}}function qp(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Zp(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2uiv(this.addr,t),we(e,t)}}function $p(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;i.uniform3uiv(this.addr,t),we(e,t)}}function Jp(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4uiv(this.addr,t),we(e,t)}}function Kp(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(zl.compareFunction=Fa,r=zl):r=ih,e.setTexture2D(t||r,s)}function jp(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||rh,s)}function Qp(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||oh,s)}function tm(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||sh,s)}function em(i){switch(i){case 5126:return Fp;case 35664:return Op;case 35665:return Bp;case 35666:return zp;case 35674:return kp;case 35675:return Vp;case 35676:return Hp;case 5124:case 35670:return Gp;case 35667:case 35671:return Wp;case 35668:case 35672:return Xp;case 35669:case 35673:return Yp;case 5125:return qp;case 36294:return Zp;case 36295:return $p;case 36296:return Jp;case 35678:case 36198:case 36298:case 36306:case 35682:return Kp;case 35679:case 36299:case 36307:return jp;case 35680:case 36300:case 36308:case 36293:return Qp;case 36289:case 36303:case 36311:case 36292:return tm}}function nm(i,t){i.uniform1fv(this.addr,t)}function im(i,t){let e=is(t,this.size,2);i.uniform2fv(this.addr,e)}function sm(i,t){let e=is(t,this.size,3);i.uniform3fv(this.addr,e)}function rm(i,t){let e=is(t,this.size,4);i.uniform4fv(this.addr,e)}function om(i,t){let e=is(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function am(i,t){let e=is(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function cm(i,t){let e=is(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function lm(i,t){i.uniform1iv(this.addr,t)}function hm(i,t){i.uniform2iv(this.addr,t)}function um(i,t){i.uniform3iv(this.addr,t)}function dm(i,t){i.uniform4iv(this.addr,t)}function fm(i,t){i.uniform1uiv(this.addr,t)}function pm(i,t){i.uniform2uiv(this.addr,t)}function mm(i,t){i.uniform3uiv(this.addr,t)}function gm(i,t){i.uniform4uiv(this.addr,t)}function _m(i,t,e){let n=this.cache,s=t.length,r=Uo(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||ih,r[o])}function xm(i,t,e){let n=this.cache,s=t.length,r=Uo(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||rh,r[o])}function vm(i,t,e){let n=this.cache,s=t.length,r=Uo(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||oh,r[o])}function ym(i,t,e){let n=this.cache,s=t.length,r=Uo(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||sh,r[o])}function Mm(i){switch(i){case 5126:return nm;case 35664:return im;case 35665:return sm;case 35666:return rm;case 35674:return om;case 35675:return am;case 35676:return cm;case 5124:case 35670:return lm;case 35667:case 35671:return hm;case 35668:case 35672:return um;case 35669:case 35673:return dm;case 5125:return fm;case 36294:return pm;case 36295:return mm;case 36296:return gm;case 35678:case 36198:case 36298:case 36306:case 35682:return _m;case 35679:case 36299:case 36307:return xm;case 35680:case 36300:case 36308:case 36293:return vm;case 36289:case 36303:case 36311:case 36292:return ym}}var Ja=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=em(e.type)}},Ka=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Mm(e.type)}},ja=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},$a=/(\w+)(\])?(\[|\.)?/g;function Xl(i,t){i.seq.push(t),i.map[t.id]=t}function Sm(i,t,e){let n=i.name,s=n.length;for($a.lastIndex=0;;){let r=$a.exec(n),o=$a.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){Xl(e,l===void 0?new Ja(a,i,t):new Ka(a,i,t));break}else{let u=e.map[a];u===void 0&&(u=new ja(a),Xl(e,u)),e=u}}}var ns=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);Sm(r,o,this)}}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function Yl(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var bm=37297,Em=0;function Tm(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var ql=new Zt;function wm(i){ae._getMatrix(ql,ae.workingColorSpace,i);let t=`mat3( ${ql.elements.map(e=>e.toFixed(4))} )`;switch(ae.getTransfer(i)){case ps:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Zl(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+Tm(i.getShaderSource(t),o)}else return s}function Am(i,t){let e=wm(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function Rm(i,t){let e;switch(t){case al:e="Linear";break;case cl:e="Reinhard";break;case ll:e="Cineon";break;case hl:e="ACESFilmic";break;case dl:e="AgX";break;case fl:e="Neutral";break;case ul:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Io=new w;function Cm(){ae.getLuminanceCoefficients(Io);let i=Io.x.toFixed(4),t=Io.y.toFixed(4),e=Io.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Pm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Hs).join(`
`)}function Im(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Dm(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Hs(i){return i!==""}function $l(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Jl(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Lm=/^[ \t]*#include +<([\w\d./]+)>/gm;function Qa(i){return i.replace(Lm,Nm)}var Um=new Map;function Nm(i,t){let e=jt[t];if(e===void 0){let n=Um.get(t);if(n!==void 0)e=jt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Qa(e)}var Fm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Kl(i){return i.replace(Fm,Om)}function Om(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function jl(i){let t=`precision ${i.precision} float;
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
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Bm(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===ba?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===kc?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Mn&&(t="SHADOWMAP_TYPE_VSM"),t}function zm(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case yi:case Mi:t="ENVMAP_TYPE_CUBE";break;case Ns:t="ENVMAP_TYPE_CUBE_UV";break}return t}function km(i){let t="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===Mi&&(t="ENVMAP_MODE_REFRACTION"),t}function Vm(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case wa:t="ENVMAP_BLENDING_MULTIPLY";break;case rl:t="ENVMAP_BLENDING_MIX";break;case ol:t="ENVMAP_BLENDING_ADD";break}return t}function Hm(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function Gm(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,c=Bm(e),l=zm(e),h=km(e),u=Vm(e),p=Hm(e),f=Pm(e),g=Im(r),x=s.createProgram(),m,d,E=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Hs).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Hs).join(`
`),d.length>0&&(d+=`
`)):(m=[jl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Hs).join(`
`),d=[jl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==fn?"#define TONE_MAPPING":"",e.toneMapping!==fn?jt.tonemapping_pars_fragment:"",e.toneMapping!==fn?Rm("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",jt.colorspace_pars_fragment,Am("linearToOutputTexel",e.outputColorSpace),Cm(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Hs).join(`
`)),o=Qa(o),o=$l(o,e),o=Jl(o,e),a=Qa(a),a=$l(a,e),a=Jl(a,e),o=Kl(o),a=Kl(a),e.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",e.glslVersion===Oa?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Oa?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let b=E+m+o,S=E+d+a,U=Yl(s,s.VERTEX_SHADER,b),R=Yl(s,s.FRAGMENT_SHADER,S);s.attachShader(x,U),s.attachShader(x,R),e.index0AttributeName!==void 0?s.bindAttribLocation(x,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function I(D){if(i.debug.checkShaderErrors){let Y=s.getProgramInfoLog(x).trim(),G=s.getShaderInfoLog(U).trim(),$=s.getShaderInfoLog(R).trim(),et=!0,W=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(et=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,U,R);else{let K=Zl(s,U,"vertex"),H=Zl(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+D.name+`
Material Type: `+D.type+`

Program Info Log: `+Y+`
`+K+`
`+H)}else Y!==""?console.warn("THREE.WebGLProgram: Program Info Log:",Y):(G===""||$==="")&&(W=!1);W&&(D.diagnostics={runnable:et,programLog:Y,vertexShader:{log:G,prefix:m},fragmentShader:{log:$,prefix:d}})}s.deleteShader(U),s.deleteShader(R),A=new ns(s,x),M=Dm(s,x)}let A;this.getUniforms=function(){return A===void 0&&I(this),A};let M;this.getAttributes=function(){return M===void 0&&I(this),M};let y=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(x,bm)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Em++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=U,this.fragmentShader=R,this}var Wm=0,tc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new ec(t),e.set(t,n)),n}},ec=class{constructor(t){this.id=Wm++,this.code=t,this.usedTimes=0}};function Xm(i,t,e,n,s,r,o){let a=new Yi,c=new tc,l=new Set,h=[],u=s.logarithmicDepthBuffer,p=s.vertexTextures,f=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(M){return l.add(M),M===0?"uv":`uv${M}`}function m(M,y,D,Y,G){let $=Y.fog,et=G.geometry,W=M.isMeshStandardMaterial?Y.environment:null,K=(M.isMeshStandardMaterial?e:t).get(M.envMap||W),H=K&&K.mapping===Ns?K.image.height:null,lt=g[M.type];M.precision!==null&&(f=s.getMaxPrecision(M.precision),f!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",f,"instead."));let ht=et.morphAttributes.position||et.morphAttributes.normal||et.morphAttributes.color,Mt=ht!==void 0?ht.length:0,Pt=0;et.morphAttributes.position!==void 0&&(Pt=1),et.morphAttributes.normal!==void 0&&(Pt=2),et.morphAttributes.color!==void 0&&(Pt=3);let Qt,J,rt,bt;if(lt){let se=Tn[lt];Qt=se.vertexShader,J=se.fragmentShader}else Qt=M.vertexShader,J=M.fragmentShader,c.update(M),rt=c.getVertexShaderID(M),bt=c.getFragmentShaderID(M);let gt=i.getRenderTarget(),It=i.state.buffers.depth.getReversed(),yt=G.isInstancedMesh===!0,Lt=G.isBatchedMesh===!0,he=!!M.map,re=!!M.matcap,ie=!!K,P=!!M.aoMap,Se=!!M.lightMap,ee=!!M.bumpMap,ne=!!M.normalMap,At=!!M.displacementMap,qt=!!M.emissiveMap,Dt=!!M.metalnessMap,Bt=!!M.roughnessMap,ge=M.anisotropy>0,T=M.clearcoat>0,_=M.dispersion>0,O=M.iridescence>0,j=M.sheen>0,tt=M.transmission>0,Z=ge&&!!M.anisotropyMap,Rt=T&&!!M.clearcoatMap,ut=T&&!!M.clearcoatNormalMap,_t=T&&!!M.clearcoatRoughnessMap,Tt=O&&!!M.iridescenceMap,nt=O&&!!M.iridescenceThicknessMap,xt=j&&!!M.sheenColorMap,Vt=j&&!!M.sheenRoughnessMap,zt=!!M.specularMap,dt=!!M.specularColorMap,Xt=!!M.specularIntensityMap,L=tt&&!!M.transmissionMap,ft=tt&&!!M.thicknessMap,it=!!M.gradientMap,St=!!M.alphaMap,ot=M.alphaTest>0,Q=!!M.alphaHash,wt=!!M.extensions,kt=fn;M.toneMapped&&(gt===null||gt.isXRRenderTarget===!0)&&(kt=i.toneMapping);let fe={shaderID:lt,shaderType:M.type,shaderName:M.name,vertexShader:Qt,fragmentShader:J,defines:M.defines,customVertexShaderID:rt,customFragmentShaderID:bt,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:f,batching:Lt,batchingColor:Lt&&G._colorsTexture!==null,instancing:yt,instancingColor:yt&&G.instanceColor!==null,instancingMorph:yt&&G.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:gt===null?i.outputColorSpace:gt.isXRRenderTarget===!0?gt.texture.colorSpace:gi,alphaToCoverage:!!M.alphaToCoverage,map:he,matcap:re,envMap:ie,envMapMode:ie&&K.mapping,envMapCubeUVHeight:H,aoMap:P,lightMap:Se,bumpMap:ee,normalMap:ne,displacementMap:p&&At,emissiveMap:qt,normalMapObjectSpace:ne&&M.normalMapType===xl,normalMapTangentSpace:ne&&M.normalMapType===_l,metalnessMap:Dt,roughnessMap:Bt,anisotropy:ge,anisotropyMap:Z,clearcoat:T,clearcoatMap:Rt,clearcoatNormalMap:ut,clearcoatRoughnessMap:_t,dispersion:_,iridescence:O,iridescenceMap:Tt,iridescenceThicknessMap:nt,sheen:j,sheenColorMap:xt,sheenRoughnessMap:Vt,specularMap:zt,specularColorMap:dt,specularIntensityMap:Xt,transmission:tt,transmissionMap:L,thicknessMap:ft,gradientMap:it,opaque:M.transparent===!1&&M.blending===pi&&M.alphaToCoverage===!1,alphaMap:St,alphaTest:ot,alphaHash:Q,combine:M.combine,mapUv:he&&x(M.map.channel),aoMapUv:P&&x(M.aoMap.channel),lightMapUv:Se&&x(M.lightMap.channel),bumpMapUv:ee&&x(M.bumpMap.channel),normalMapUv:ne&&x(M.normalMap.channel),displacementMapUv:At&&x(M.displacementMap.channel),emissiveMapUv:qt&&x(M.emissiveMap.channel),metalnessMapUv:Dt&&x(M.metalnessMap.channel),roughnessMapUv:Bt&&x(M.roughnessMap.channel),anisotropyMapUv:Z&&x(M.anisotropyMap.channel),clearcoatMapUv:Rt&&x(M.clearcoatMap.channel),clearcoatNormalMapUv:ut&&x(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:_t&&x(M.clearcoatRoughnessMap.channel),iridescenceMapUv:Tt&&x(M.iridescenceMap.channel),iridescenceThicknessMapUv:nt&&x(M.iridescenceThicknessMap.channel),sheenColorMapUv:xt&&x(M.sheenColorMap.channel),sheenRoughnessMapUv:Vt&&x(M.sheenRoughnessMap.channel),specularMapUv:zt&&x(M.specularMap.channel),specularColorMapUv:dt&&x(M.specularColorMap.channel),specularIntensityMapUv:Xt&&x(M.specularIntensityMap.channel),transmissionMapUv:L&&x(M.transmissionMap.channel),thicknessMapUv:ft&&x(M.thicknessMap.channel),alphaMapUv:St&&x(M.alphaMap.channel),vertexTangents:!!et.attributes.tangent&&(ne||ge),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!et.attributes.color&&et.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!et.attributes.uv&&(he||St),fog:!!$,useFog:M.fog===!0,fogExp2:!!$&&$.isFogExp2,flatShading:M.flatShading===!0&&M.wireframe===!1,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:It,skinning:G.isSkinnedMesh===!0,morphTargets:et.morphAttributes.position!==void 0,morphNormals:et.morphAttributes.normal!==void 0,morphColors:et.morphAttributes.color!==void 0,morphTargetsCount:Mt,morphTextureStride:Pt,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&D.length>0,shadowMapType:i.shadowMap.type,toneMapping:kt,decodeVideoTexture:he&&M.map.isVideoTexture===!0&&ae.getTransfer(M.map.colorSpace)===de,decodeVideoTextureEmissive:qt&&M.emissiveMap.isVideoTexture===!0&&ae.getTransfer(M.emissiveMap.colorSpace)===de,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Sn,flipSided:M.side===ze,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:wt&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(wt&&M.extensions.multiDraw===!0||Lt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return fe.vertexUv1s=l.has(1),fe.vertexUv2s=l.has(2),fe.vertexUv3s=l.has(3),l.clear(),fe}function d(M){let y=[];if(M.shaderID?y.push(M.shaderID):(y.push(M.customVertexShaderID),y.push(M.customFragmentShaderID)),M.defines!==void 0)for(let D in M.defines)y.push(D),y.push(M.defines[D]);return M.isRawShaderMaterial===!1&&(E(y,M),b(y,M),y.push(i.outputColorSpace)),y.push(M.customProgramCacheKey),y.join()}function E(M,y){M.push(y.precision),M.push(y.outputColorSpace),M.push(y.envMapMode),M.push(y.envMapCubeUVHeight),M.push(y.mapUv),M.push(y.alphaMapUv),M.push(y.lightMapUv),M.push(y.aoMapUv),M.push(y.bumpMapUv),M.push(y.normalMapUv),M.push(y.displacementMapUv),M.push(y.emissiveMapUv),M.push(y.metalnessMapUv),M.push(y.roughnessMapUv),M.push(y.anisotropyMapUv),M.push(y.clearcoatMapUv),M.push(y.clearcoatNormalMapUv),M.push(y.clearcoatRoughnessMapUv),M.push(y.iridescenceMapUv),M.push(y.iridescenceThicknessMapUv),M.push(y.sheenColorMapUv),M.push(y.sheenRoughnessMapUv),M.push(y.specularMapUv),M.push(y.specularColorMapUv),M.push(y.specularIntensityMapUv),M.push(y.transmissionMapUv),M.push(y.thicknessMapUv),M.push(y.combine),M.push(y.fogExp2),M.push(y.sizeAttenuation),M.push(y.morphTargetsCount),M.push(y.morphAttributeCount),M.push(y.numDirLights),M.push(y.numPointLights),M.push(y.numSpotLights),M.push(y.numSpotLightMaps),M.push(y.numHemiLights),M.push(y.numRectAreaLights),M.push(y.numDirLightShadows),M.push(y.numPointLightShadows),M.push(y.numSpotLightShadows),M.push(y.numSpotLightShadowsWithMaps),M.push(y.numLightProbes),M.push(y.shadowMapType),M.push(y.toneMapping),M.push(y.numClippingPlanes),M.push(y.numClipIntersection),M.push(y.depthPacking)}function b(M,y){a.disableAll(),y.supportsVertexTextures&&a.enable(0),y.instancing&&a.enable(1),y.instancingColor&&a.enable(2),y.instancingMorph&&a.enable(3),y.matcap&&a.enable(4),y.envMap&&a.enable(5),y.normalMapObjectSpace&&a.enable(6),y.normalMapTangentSpace&&a.enable(7),y.clearcoat&&a.enable(8),y.iridescence&&a.enable(9),y.alphaTest&&a.enable(10),y.vertexColors&&a.enable(11),y.vertexAlphas&&a.enable(12),y.vertexUv1s&&a.enable(13),y.vertexUv2s&&a.enable(14),y.vertexUv3s&&a.enable(15),y.vertexTangents&&a.enable(16),y.anisotropy&&a.enable(17),y.alphaHash&&a.enable(18),y.batching&&a.enable(19),y.dispersion&&a.enable(20),y.batchingColor&&a.enable(21),y.gradientMap&&a.enable(22),M.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reverseDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),M.push(a.mask)}function S(M){let y=g[M.type],D;if(y){let Y=Tn[y];D=Il.clone(Y.uniforms)}else D=M.uniforms;return D}function U(M,y){let D;for(let Y=0,G=h.length;Y<G;Y++){let $=h[Y];if($.cacheKey===y){D=$,++D.usedTimes;break}}return D===void 0&&(D=new Gm(i,y,M,r),h.push(D)),D}function R(M){if(--M.usedTimes===0){let y=h.indexOf(M);h[y]=h[h.length-1],h.pop(),M.destroy()}}function I(M){c.remove(M)}function A(){c.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:S,acquireProgram:U,releaseProgram:R,releaseShaderCache:I,programs:h,dispose:A}}function Ym(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function qm(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Ql(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function th(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(u,p,f,g,x,m){let d=i[t];return d===void 0?(d={id:u.id,object:u,geometry:p,material:f,groupOrder:g,renderOrder:u.renderOrder,z:x,group:m},i[t]=d):(d.id=u.id,d.object=u,d.geometry=p,d.material=f,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=x,d.group=m),t++,d}function a(u,p,f,g,x,m){let d=o(u,p,f,g,x,m);f.transmission>0?n.push(d):f.transparent===!0?s.push(d):e.push(d)}function c(u,p,f,g,x,m){let d=o(u,p,f,g,x,m);f.transmission>0?n.unshift(d):f.transparent===!0?s.unshift(d):e.unshift(d)}function l(u,p){e.length>1&&e.sort(u||qm),n.length>1&&n.sort(p||Ql),s.length>1&&s.sort(p||Ql)}function h(){for(let u=t,p=i.length;u<p;u++){let f=i[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:c,finish:h,sort:l}}function Zm(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new th,i.set(n,[o])):s>=r.length?(o=new th,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function $m(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new w,color:new $t};break;case"SpotLight":e={position:new w,direction:new w,color:new $t,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new w,color:new $t,distance:0,decay:0};break;case"HemisphereLight":e={direction:new w,skyColor:new $t,groundColor:new $t};break;case"RectAreaLight":e={color:new $t,position:new w,halfWidth:new w,halfHeight:new w};break}return i[t.id]=e,e}}}function Jm(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Yt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Yt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Yt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Km=0;function jm(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Qm(i){let t=new $m,e=Jm(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new w);let s=new w,r=new Me,o=new Me;function a(l){let h=0,u=0,p=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let f=0,g=0,x=0,m=0,d=0,E=0,b=0,S=0,U=0,R=0,I=0;l.sort(jm);for(let M=0,y=l.length;M<y;M++){let D=l[M],Y=D.color,G=D.intensity,$=D.distance,et=D.shadow&&D.shadow.map?D.shadow.map.texture:null;if(D.isAmbientLight)h+=Y.r*G,u+=Y.g*G,p+=Y.b*G;else if(D.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(D.sh.coefficients[W],G);I++}else if(D.isDirectionalLight){let W=t.get(D);if(W.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let K=D.shadow,H=e.get(D);H.shadowIntensity=K.intensity,H.shadowBias=K.bias,H.shadowNormalBias=K.normalBias,H.shadowRadius=K.radius,H.shadowMapSize=K.mapSize,n.directionalShadow[f]=H,n.directionalShadowMap[f]=et,n.directionalShadowMatrix[f]=D.shadow.matrix,E++}n.directional[f]=W,f++}else if(D.isSpotLight){let W=t.get(D);W.position.setFromMatrixPosition(D.matrixWorld),W.color.copy(Y).multiplyScalar(G),W.distance=$,W.coneCos=Math.cos(D.angle),W.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),W.decay=D.decay,n.spot[x]=W;let K=D.shadow;if(D.map&&(n.spotLightMap[U]=D.map,U++,K.updateMatrices(D),D.castShadow&&R++),n.spotLightMatrix[x]=K.matrix,D.castShadow){let H=e.get(D);H.shadowIntensity=K.intensity,H.shadowBias=K.bias,H.shadowNormalBias=K.normalBias,H.shadowRadius=K.radius,H.shadowMapSize=K.mapSize,n.spotShadow[x]=H,n.spotShadowMap[x]=et,S++}x++}else if(D.isRectAreaLight){let W=t.get(D);W.color.copy(Y).multiplyScalar(G),W.halfWidth.set(D.width*.5,0,0),W.halfHeight.set(0,D.height*.5,0),n.rectArea[m]=W,m++}else if(D.isPointLight){let W=t.get(D);if(W.color.copy(D.color).multiplyScalar(D.intensity),W.distance=D.distance,W.decay=D.decay,D.castShadow){let K=D.shadow,H=e.get(D);H.shadowIntensity=K.intensity,H.shadowBias=K.bias,H.shadowNormalBias=K.normalBias,H.shadowRadius=K.radius,H.shadowMapSize=K.mapSize,H.shadowCameraNear=K.camera.near,H.shadowCameraFar=K.camera.far,n.pointShadow[g]=H,n.pointShadowMap[g]=et,n.pointShadowMatrix[g]=D.shadow.matrix,b++}n.point[g]=W,g++}else if(D.isHemisphereLight){let W=t.get(D);W.skyColor.copy(D.color).multiplyScalar(G),W.groundColor.copy(D.groundColor).multiplyScalar(G),n.hemi[d]=W,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=mt.LTC_FLOAT_1,n.rectAreaLTC2=mt.LTC_FLOAT_2):(n.rectAreaLTC1=mt.LTC_HALF_1,n.rectAreaLTC2=mt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=p;let A=n.hash;(A.directionalLength!==f||A.pointLength!==g||A.spotLength!==x||A.rectAreaLength!==m||A.hemiLength!==d||A.numDirectionalShadows!==E||A.numPointShadows!==b||A.numSpotShadows!==S||A.numSpotMaps!==U||A.numLightProbes!==I)&&(n.directional.length=f,n.spot.length=x,n.rectArea.length=m,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=S,n.spotShadowMap.length=S,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=S+U-R,n.spotLightMap.length=U,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=I,A.directionalLength=f,A.pointLength=g,A.spotLength=x,A.rectAreaLength=m,A.hemiLength=d,A.numDirectionalShadows=E,A.numPointShadows=b,A.numSpotShadows=S,A.numSpotMaps=U,A.numLightProbes=I,n.version=Km++)}function c(l,h){let u=0,p=0,f=0,g=0,x=0,m=h.matrixWorldInverse;for(let d=0,E=l.length;d<E;d++){let b=l[d];if(b.isDirectionalLight){let S=n.directional[u];S.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),u++}else if(b.isSpotLight){let S=n.spot[f];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),f++}else if(b.isRectAreaLight){let S=n.rectArea[g];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(m),o.identity(),r.copy(b.matrixWorld),r.premultiply(m),o.extractRotation(r),S.halfWidth.set(b.width*.5,0,0),S.halfHeight.set(0,b.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){let S=n.point[p];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(m),p++}else if(b.isHemisphereLight){let S=n.hemi[x];S.direction.setFromMatrixPosition(b.matrixWorld),S.direction.transformDirection(m),x++}}}return{setup:a,setupView:c,state:n}}function eh(i){let t=new Qm(i),e=[],n=[];function s(h){l.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function o(h){n.push(h)}function a(){t.setup(e)}function c(h){t.setupView(e,h)}let l={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function tg(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new eh(i),t.set(s,[a])):r>=o.length?(a=new eh(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var eg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ng=`uniform sampler2D shadow_pass;
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
}`;function ig(i,t,e){let n=new Es,s=new Yt,r=new Yt,o=new be,a=new Ar({depthPacking:gl}),c=new Rr,l={},h=e.maxTextureSize,u={[Nn]:ze,[ze]:Nn,[Sn]:Sn},p=new Je({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Yt},radius:{value:4}},vertexShader:eg,fragmentShader:ng}),f=p.clone();f.defines.HORIZONTAL_PASS=1;let g=new on;g.setAttribute("position",new Pe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Be(g,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ba;let d=this.type;this.render=function(R,I,A){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;let M=i.getRenderTarget(),y=i.getActiveCubeFace(),D=i.getActiveMipmapLevel(),Y=i.state;Y.setBlending(Fn),Y.buffers.color.setClear(1,1,1,1),Y.buffers.depth.setTest(!0),Y.setScissorTest(!1);let G=d!==Mn&&this.type===Mn,$=d===Mn&&this.type!==Mn;for(let et=0,W=R.length;et<W;et++){let K=R[et],H=K.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);let lt=H.getFrameExtents();if(s.multiply(lt),r.copy(H.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/lt.x),s.x=r.x*lt.x,H.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/lt.y),s.y=r.y*lt.y,H.mapSize.y=r.y)),H.map===null||G===!0||$===!0){let Mt=this.type!==Mn?{minFilter:nn,magFilter:nn}:{};H.map!==null&&H.map.dispose(),H.map=new _n(s.x,s.y,Mt),H.map.texture.name=K.name+".shadowMap",H.camera.updateProjectionMatrix()}i.setRenderTarget(H.map),i.clear();let ht=H.getViewportCount();for(let Mt=0;Mt<ht;Mt++){let Pt=H.getViewport(Mt);o.set(r.x*Pt.x,r.y*Pt.y,r.x*Pt.z,r.y*Pt.w),Y.viewport(o),H.updateMatrices(K,Mt),n=H.getFrustum(),S(I,A,H.camera,K,this.type)}H.isPointLightShadow!==!0&&this.type===Mn&&E(H,A),H.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(M,y,D)};function E(R,I){let A=t.update(x);p.defines.VSM_SAMPLES!==R.blurSamples&&(p.defines.VSM_SAMPLES=R.blurSamples,f.defines.VSM_SAMPLES=R.blurSamples,p.needsUpdate=!0,f.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new _n(s.x,s.y)),p.uniforms.shadow_pass.value=R.map.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(I,null,A,p,x,null),f.uniforms.shadow_pass.value=R.mapPass.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(I,null,A,f,x,null)}function b(R,I,A,M){let y=null,D=A.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(D!==void 0)y=D;else if(y=A.isPointLight===!0?c:a,i.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let Y=y.uuid,G=I.uuid,$=l[Y];$===void 0&&($={},l[Y]=$);let et=$[G];et===void 0&&(et=y.clone(),$[G]=et,I.addEventListener("dispose",U)),y=et}if(y.visible=I.visible,y.wireframe=I.wireframe,M===Mn?y.side=I.shadowSide!==null?I.shadowSide:I.side:y.side=I.shadowSide!==null?I.shadowSide:u[I.side],y.alphaMap=I.alphaMap,y.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,y.map=I.map,y.clipShadows=I.clipShadows,y.clippingPlanes=I.clippingPlanes,y.clipIntersection=I.clipIntersection,y.displacementMap=I.displacementMap,y.displacementScale=I.displacementScale,y.displacementBias=I.displacementBias,y.wireframeLinewidth=I.wireframeLinewidth,y.linewidth=I.linewidth,A.isPointLight===!0&&y.isMeshDistanceMaterial===!0){let Y=i.properties.get(y);Y.light=A}return y}function S(R,I,A,M,y){if(R.visible===!1)return;if(R.layers.test(I.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&y===Mn)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,R.matrixWorld);let G=t.update(R),$=R.material;if(Array.isArray($)){let et=G.groups;for(let W=0,K=et.length;W<K;W++){let H=et[W],lt=$[H.materialIndex];if(lt&&lt.visible){let ht=b(R,lt,M,y);R.onBeforeShadow(i,R,I,A,G,ht,H),i.renderBufferDirect(A,null,G,ht,R,H),R.onAfterShadow(i,R,I,A,G,ht,H)}}}else if($.visible){let et=b(R,$,M,y);R.onBeforeShadow(i,R,I,A,G,et,null),i.renderBufferDirect(A,null,G,et,R,null),R.onAfterShadow(i,R,I,A,G,et,null)}}let Y=R.children;for(let G=0,$=Y.length;G<$;G++)S(Y[G],I,A,M,y)}function U(R){R.target.removeEventListener("dispose",U);for(let A in l){let M=l[A],y=R.target.uuid;y in M&&(M[y].dispose(),delete M[y])}}}var sg={[kr]:Vr,[Hr]:Xr,[Gr]:Yr,[mi]:Wr,[Vr]:kr,[Xr]:Hr,[Yr]:Gr,[Wr]:mi};function rg(i,t){function e(){let L=!1,ft=new be,it=null,St=new be(0,0,0,0);return{setMask:function(ot){it!==ot&&!L&&(i.colorMask(ot,ot,ot,ot),it=ot)},setLocked:function(ot){L=ot},setClear:function(ot,Q,wt,kt,fe){fe===!0&&(ot*=kt,Q*=kt,wt*=kt),ft.set(ot,Q,wt,kt),St.equals(ft)===!1&&(i.clearColor(ot,Q,wt,kt),St.copy(ft))},reset:function(){L=!1,it=null,St.set(-1,0,0,0)}}}function n(){let L=!1,ft=!1,it=null,St=null,ot=null;return{setReversed:function(Q){if(ft!==Q){let wt=t.get("EXT_clip_control");Q?wt.clipControlEXT(wt.LOWER_LEFT_EXT,wt.ZERO_TO_ONE_EXT):wt.clipControlEXT(wt.LOWER_LEFT_EXT,wt.NEGATIVE_ONE_TO_ONE_EXT),ft=Q;let kt=ot;ot=null,this.setClear(kt)}},getReversed:function(){return ft},setTest:function(Q){Q?gt(i.DEPTH_TEST):It(i.DEPTH_TEST)},setMask:function(Q){it!==Q&&!L&&(i.depthMask(Q),it=Q)},setFunc:function(Q){if(ft&&(Q=sg[Q]),St!==Q){switch(Q){case kr:i.depthFunc(i.NEVER);break;case Vr:i.depthFunc(i.ALWAYS);break;case Hr:i.depthFunc(i.LESS);break;case mi:i.depthFunc(i.LEQUAL);break;case Gr:i.depthFunc(i.EQUAL);break;case Wr:i.depthFunc(i.GEQUAL);break;case Xr:i.depthFunc(i.GREATER);break;case Yr:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}St=Q}},setLocked:function(Q){L=Q},setClear:function(Q){ot!==Q&&(ft&&(Q=1-Q),i.clearDepth(Q),ot=Q)},reset:function(){L=!1,it=null,St=null,ot=null,ft=!1}}}function s(){let L=!1,ft=null,it=null,St=null,ot=null,Q=null,wt=null,kt=null,fe=null;return{setTest:function(se){L||(se?gt(i.STENCIL_TEST):It(i.STENCIL_TEST))},setMask:function(se){ft!==se&&!L&&(i.stencilMask(se),ft=se)},setFunc:function(se,We,je){(it!==se||St!==We||ot!==je)&&(i.stencilFunc(se,We,je),it=se,St=We,ot=je)},setOp:function(se,We,je){(Q!==se||wt!==We||kt!==je)&&(i.stencilOp(se,We,je),Q=se,wt=We,kt=je)},setLocked:function(se){L=se},setClear:function(se){fe!==se&&(i.clearStencil(se),fe=se)},reset:function(){L=!1,ft=null,it=null,St=null,ot=null,Q=null,wt=null,kt=null,fe=null}}}let r=new e,o=new n,a=new s,c=new WeakMap,l=new WeakMap,h={},u={},p=new WeakMap,f=[],g=null,x=!1,m=null,d=null,E=null,b=null,S=null,U=null,R=null,I=new $t(0,0,0),A=0,M=!1,y=null,D=null,Y=null,G=null,$=null,et=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,K=0,H=i.getParameter(i.VERSION);H.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(H)[1]),W=K>=1):H.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),W=K>=2);let lt=null,ht={},Mt=i.getParameter(i.SCISSOR_BOX),Pt=i.getParameter(i.VIEWPORT),Qt=new be().fromArray(Mt),J=new be().fromArray(Pt);function rt(L,ft,it,St){let ot=new Uint8Array(4),Q=i.createTexture();i.bindTexture(L,Q),i.texParameteri(L,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(L,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let wt=0;wt<it;wt++)L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY?i.texImage3D(ft,0,i.RGBA,1,1,St,0,i.RGBA,i.UNSIGNED_BYTE,ot):i.texImage2D(ft+wt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ot);return Q}let bt={};bt[i.TEXTURE_2D]=rt(i.TEXTURE_2D,i.TEXTURE_2D,1),bt[i.TEXTURE_CUBE_MAP]=rt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),bt[i.TEXTURE_2D_ARRAY]=rt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),bt[i.TEXTURE_3D]=rt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),gt(i.DEPTH_TEST),o.setFunc(mi),ee(!1),ne(Sa),gt(i.CULL_FACE),P(Fn);function gt(L){h[L]!==!0&&(i.enable(L),h[L]=!0)}function It(L){h[L]!==!1&&(i.disable(L),h[L]=!1)}function yt(L,ft){return u[L]!==ft?(i.bindFramebuffer(L,ft),u[L]=ft,L===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ft),L===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ft),!0):!1}function Lt(L,ft){let it=f,St=!1;if(L){it=p.get(ft),it===void 0&&(it=[],p.set(ft,it));let ot=L.textures;if(it.length!==ot.length||it[0]!==i.COLOR_ATTACHMENT0){for(let Q=0,wt=ot.length;Q<wt;Q++)it[Q]=i.COLOR_ATTACHMENT0+Q;it.length=ot.length,St=!0}}else it[0]!==i.BACK&&(it[0]=i.BACK,St=!0);St&&i.drawBuffers(it)}function he(L){return g!==L?(i.useProgram(L),g=L,!0):!1}let re={[$n]:i.FUNC_ADD,[Hc]:i.FUNC_SUBTRACT,[Gc]:i.FUNC_REVERSE_SUBTRACT};re[Wc]=i.MIN,re[Xc]=i.MAX;let ie={[Yc]:i.ZERO,[qc]:i.ONE,[Zc]:i.SRC_COLOR,[mr]:i.SRC_ALPHA,[tl]:i.SRC_ALPHA_SATURATE,[jc]:i.DST_COLOR,[Jc]:i.DST_ALPHA,[$c]:i.ONE_MINUS_SRC_COLOR,[gr]:i.ONE_MINUS_SRC_ALPHA,[Qc]:i.ONE_MINUS_DST_COLOR,[Kc]:i.ONE_MINUS_DST_ALPHA,[el]:i.CONSTANT_COLOR,[nl]:i.ONE_MINUS_CONSTANT_COLOR,[il]:i.CONSTANT_ALPHA,[sl]:i.ONE_MINUS_CONSTANT_ALPHA};function P(L,ft,it,St,ot,Q,wt,kt,fe,se){if(L===Fn){x===!0&&(It(i.BLEND),x=!1);return}if(x===!1&&(gt(i.BLEND),x=!0),L!==Vc){if(L!==m||se!==M){if((d!==$n||S!==$n)&&(i.blendEquation(i.FUNC_ADD),d=$n,S=$n),se)switch(L){case pi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Us:i.blendFunc(i.ONE,i.ONE);break;case Ea:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ta:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case pi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Us:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Ea:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ta:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}E=null,b=null,U=null,R=null,I.set(0,0,0),A=0,m=L,M=se}return}ot=ot||ft,Q=Q||it,wt=wt||St,(ft!==d||ot!==S)&&(i.blendEquationSeparate(re[ft],re[ot]),d=ft,S=ot),(it!==E||St!==b||Q!==U||wt!==R)&&(i.blendFuncSeparate(ie[it],ie[St],ie[Q],ie[wt]),E=it,b=St,U=Q,R=wt),(kt.equals(I)===!1||fe!==A)&&(i.blendColor(kt.r,kt.g,kt.b,fe),I.copy(kt),A=fe),m=L,M=!1}function Se(L,ft){L.side===Sn?It(i.CULL_FACE):gt(i.CULL_FACE);let it=L.side===ze;ft&&(it=!it),ee(it),L.blending===pi&&L.transparent===!1?P(Fn):P(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),o.setFunc(L.depthFunc),o.setTest(L.depthTest),o.setMask(L.depthWrite),r.setMask(L.colorWrite);let St=L.stencilWrite;a.setTest(St),St&&(a.setMask(L.stencilWriteMask),a.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),a.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),qt(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?gt(i.SAMPLE_ALPHA_TO_COVERAGE):It(i.SAMPLE_ALPHA_TO_COVERAGE)}function ee(L){y!==L&&(L?i.frontFace(i.CW):i.frontFace(i.CCW),y=L)}function ne(L){L!==Bc?(gt(i.CULL_FACE),L!==D&&(L===Sa?i.cullFace(i.BACK):L===zc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):It(i.CULL_FACE),D=L}function At(L){L!==Y&&(W&&i.lineWidth(L),Y=L)}function qt(L,ft,it){L?(gt(i.POLYGON_OFFSET_FILL),(G!==ft||$!==it)&&(i.polygonOffset(ft,it),G=ft,$=it)):It(i.POLYGON_OFFSET_FILL)}function Dt(L){L?gt(i.SCISSOR_TEST):It(i.SCISSOR_TEST)}function Bt(L){L===void 0&&(L=i.TEXTURE0+et-1),lt!==L&&(i.activeTexture(L),lt=L)}function ge(L,ft,it){it===void 0&&(lt===null?it=i.TEXTURE0+et-1:it=lt);let St=ht[it];St===void 0&&(St={type:void 0,texture:void 0},ht[it]=St),(St.type!==L||St.texture!==ft)&&(lt!==it&&(i.activeTexture(it),lt=it),i.bindTexture(L,ft||bt[L]),St.type=L,St.texture=ft)}function T(){let L=ht[lt];L!==void 0&&L.type!==void 0&&(i.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function _(){try{i.compressedTexImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function O(){try{i.compressedTexImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function j(){try{i.texSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function tt(){try{i.texSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Z(){try{i.compressedTexSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Rt(){try{i.compressedTexSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ut(){try{i.texStorage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function _t(){try{i.texStorage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Tt(){try{i.texImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function nt(){try{i.texImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function xt(L){Qt.equals(L)===!1&&(i.scissor(L.x,L.y,L.z,L.w),Qt.copy(L))}function Vt(L){J.equals(L)===!1&&(i.viewport(L.x,L.y,L.z,L.w),J.copy(L))}function zt(L,ft){let it=l.get(ft);it===void 0&&(it=new WeakMap,l.set(ft,it));let St=it.get(L);St===void 0&&(St=i.getUniformBlockIndex(ft,L.name),it.set(L,St))}function dt(L,ft){let St=l.get(ft).get(L);c.get(ft)!==St&&(i.uniformBlockBinding(ft,St,L.__bindingPointIndex),c.set(ft,St))}function Xt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},lt=null,ht={},u={},p=new WeakMap,f=[],g=null,x=!1,m=null,d=null,E=null,b=null,S=null,U=null,R=null,I=new $t(0,0,0),A=0,M=!1,y=null,D=null,Y=null,G=null,$=null,Qt.set(0,0,i.canvas.width,i.canvas.height),J.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:gt,disable:It,bindFramebuffer:yt,drawBuffers:Lt,useProgram:he,setBlending:P,setMaterial:Se,setFlipSided:ee,setCullFace:ne,setLineWidth:At,setPolygonOffset:qt,setScissorTest:Dt,activeTexture:Bt,bindTexture:ge,unbindTexture:T,compressedTexImage2D:_,compressedTexImage3D:O,texImage2D:Tt,texImage3D:nt,updateUBOMapping:zt,uniformBlockBinding:dt,texStorage2D:ut,texStorage3D:_t,texSubImage2D:j,texSubImage3D:tt,compressedTexSubImage2D:Z,compressedTexSubImage3D:Rt,scissor:xt,viewport:Vt,reset:Xt}}function og(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Yt,h=new WeakMap,u,p=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,_){return f?new OffscreenCanvas(T,_):gs("canvas")}function x(T,_,O){let j=1,tt=ge(T);if((tt.width>O||tt.height>O)&&(j=O/Math.max(tt.width,tt.height)),j<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let Z=Math.floor(j*tt.width),Rt=Math.floor(j*tt.height);u===void 0&&(u=g(Z,Rt));let ut=_?g(Z,Rt):u;return ut.width=Z,ut.height=Rt,ut.getContext("2d").drawImage(T,0,0,Z,Rt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+Z+"x"+Rt+")."),ut}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),T;return T}function m(T){return T.generateMipmaps}function d(T){i.generateMipmap(T)}function E(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(T,_,O,j,tt=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let Z=_;if(_===i.RED&&(O===i.FLOAT&&(Z=i.R32F),O===i.HALF_FLOAT&&(Z=i.R16F),O===i.UNSIGNED_BYTE&&(Z=i.R8)),_===i.RED_INTEGER&&(O===i.UNSIGNED_BYTE&&(Z=i.R8UI),O===i.UNSIGNED_SHORT&&(Z=i.R16UI),O===i.UNSIGNED_INT&&(Z=i.R32UI),O===i.BYTE&&(Z=i.R8I),O===i.SHORT&&(Z=i.R16I),O===i.INT&&(Z=i.R32I)),_===i.RG&&(O===i.FLOAT&&(Z=i.RG32F),O===i.HALF_FLOAT&&(Z=i.RG16F),O===i.UNSIGNED_BYTE&&(Z=i.RG8)),_===i.RG_INTEGER&&(O===i.UNSIGNED_BYTE&&(Z=i.RG8UI),O===i.UNSIGNED_SHORT&&(Z=i.RG16UI),O===i.UNSIGNED_INT&&(Z=i.RG32UI),O===i.BYTE&&(Z=i.RG8I),O===i.SHORT&&(Z=i.RG16I),O===i.INT&&(Z=i.RG32I)),_===i.RGB_INTEGER&&(O===i.UNSIGNED_BYTE&&(Z=i.RGB8UI),O===i.UNSIGNED_SHORT&&(Z=i.RGB16UI),O===i.UNSIGNED_INT&&(Z=i.RGB32UI),O===i.BYTE&&(Z=i.RGB8I),O===i.SHORT&&(Z=i.RGB16I),O===i.INT&&(Z=i.RGB32I)),_===i.RGBA_INTEGER&&(O===i.UNSIGNED_BYTE&&(Z=i.RGBA8UI),O===i.UNSIGNED_SHORT&&(Z=i.RGBA16UI),O===i.UNSIGNED_INT&&(Z=i.RGBA32UI),O===i.BYTE&&(Z=i.RGBA8I),O===i.SHORT&&(Z=i.RGBA16I),O===i.INT&&(Z=i.RGBA32I)),_===i.RGB&&O===i.UNSIGNED_INT_5_9_9_9_REV&&(Z=i.RGB9_E5),_===i.RGBA){let Rt=tt?ps:ae.getTransfer(j);O===i.FLOAT&&(Z=i.RGBA32F),O===i.HALF_FLOAT&&(Z=i.RGBA16F),O===i.UNSIGNED_BYTE&&(Z=Rt===de?i.SRGB8_ALPHA8:i.RGBA8),O===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),O===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function S(T,_){let O;return T?_===null||_===si||_===Ki?O=i.DEPTH24_STENCIL8:_===En?O=i.DEPTH32F_STENCIL8:_===$i&&(O=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===si||_===Ki?O=i.DEPTH_COMPONENT24:_===En?O=i.DEPTH_COMPONENT32F:_===$i&&(O=i.DEPTH_COMPONENT16),O}function U(T,_){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==nn&&T.minFilter!==dn?Math.log2(Math.max(_.width,_.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?_.mipmaps.length:1}function R(T){let _=T.target;_.removeEventListener("dispose",R),A(_),_.isVideoTexture&&h.delete(_)}function I(T){let _=T.target;_.removeEventListener("dispose",I),y(_)}function A(T){let _=n.get(T);if(_.__webglInit===void 0)return;let O=T.source,j=p.get(O);if(j){let tt=j[_.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&M(T),Object.keys(j).length===0&&p.delete(O)}n.remove(T)}function M(T){let _=n.get(T);i.deleteTexture(_.__webglTexture);let O=T.source,j=p.get(O);delete j[_.__cacheKey],o.memory.textures--}function y(T){let _=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(_.__webglFramebuffer[j]))for(let tt=0;tt<_.__webglFramebuffer[j].length;tt++)i.deleteFramebuffer(_.__webglFramebuffer[j][tt]);else i.deleteFramebuffer(_.__webglFramebuffer[j]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[j])}else{if(Array.isArray(_.__webglFramebuffer))for(let j=0;j<_.__webglFramebuffer.length;j++)i.deleteFramebuffer(_.__webglFramebuffer[j]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let j=0;j<_.__webglColorRenderbuffer.length;j++)_.__webglColorRenderbuffer[j]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[j]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let O=T.textures;for(let j=0,tt=O.length;j<tt;j++){let Z=n.get(O[j]);Z.__webglTexture&&(i.deleteTexture(Z.__webglTexture),o.memory.textures--),n.remove(O[j])}n.remove(T)}let D=0;function Y(){D=0}function G(){let T=D;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),D+=1,T}function $(T){let _=[];return _.push(T.wrapS),_.push(T.wrapT),_.push(T.wrapR||0),_.push(T.magFilter),_.push(T.minFilter),_.push(T.anisotropy),_.push(T.internalFormat),_.push(T.format),_.push(T.type),_.push(T.generateMipmaps),_.push(T.premultiplyAlpha),_.push(T.flipY),_.push(T.unpackAlignment),_.push(T.colorSpace),_.join()}function et(T,_){let O=n.get(T);if(T.isVideoTexture&&Dt(T),T.isRenderTargetTexture===!1&&T.version>0&&O.__version!==T.version){let j=T.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{bt(O,T,_);return}}e.bindTexture(i.TEXTURE_2D,O.__webglTexture,i.TEXTURE0+_)}function W(T,_){let O=n.get(T);if(T.version>0&&O.__version!==T.version){bt(O,T,_);return}e.bindTexture(i.TEXTURE_2D_ARRAY,O.__webglTexture,i.TEXTURE0+_)}function K(T,_){let O=n.get(T);if(T.version>0&&O.__version!==T.version){bt(O,T,_);return}e.bindTexture(i.TEXTURE_3D,O.__webglTexture,i.TEXTURE0+_)}function H(T,_){let O=n.get(T);if(T.version>0&&O.__version!==T.version){gt(O,T,_);return}e.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+_)}let lt={[_r]:i.REPEAT,[Zn]:i.CLAMP_TO_EDGE,[xr]:i.MIRRORED_REPEAT},ht={[nn]:i.NEAREST,[pl]:i.NEAREST_MIPMAP_NEAREST,[Fs]:i.NEAREST_MIPMAP_LINEAR,[dn]:i.LINEAR,[$r]:i.LINEAR_MIPMAP_NEAREST,[ii]:i.LINEAR_MIPMAP_LINEAR},Mt={[vl]:i.NEVER,[Tl]:i.ALWAYS,[yl]:i.LESS,[Fa]:i.LEQUAL,[Ml]:i.EQUAL,[El]:i.GEQUAL,[Sl]:i.GREATER,[bl]:i.NOTEQUAL};function Pt(T,_){if(_.type===En&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===dn||_.magFilter===$r||_.magFilter===Fs||_.magFilter===ii||_.minFilter===dn||_.minFilter===$r||_.minFilter===Fs||_.minFilter===ii)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,lt[_.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,lt[_.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,lt[_.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,ht[_.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,ht[_.minFilter]),_.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,Mt[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===nn||_.minFilter!==Fs&&_.minFilter!==ii||_.type===En&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let O=t.get("EXT_texture_filter_anisotropic");i.texParameterf(T,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function Qt(T,_){let O=!1;T.__webglInit===void 0&&(T.__webglInit=!0,_.addEventListener("dispose",R));let j=_.source,tt=p.get(j);tt===void 0&&(tt={},p.set(j,tt));let Z=$(_);if(Z!==T.__cacheKey){tt[Z]===void 0&&(tt[Z]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,O=!0),tt[Z].usedTimes++;let Rt=tt[T.__cacheKey];Rt!==void 0&&(tt[T.__cacheKey].usedTimes--,Rt.usedTimes===0&&M(_)),T.__cacheKey=Z,T.__webglTexture=tt[Z].texture}return O}function J(T,_,O){return Math.floor(Math.floor(T/O)/_)}function rt(T,_,O,j){let Z=T.updateRanges;if(Z.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,O,j,_.data);else{Z.sort((nt,xt)=>nt.start-xt.start);let Rt=0;for(let nt=1;nt<Z.length;nt++){let xt=Z[Rt],Vt=Z[nt],zt=xt.start+xt.count,dt=J(Vt.start,_.width,4),Xt=J(xt.start,_.width,4);Vt.start<=zt+1&&dt===Xt&&J(Vt.start+Vt.count-1,_.width,4)===dt?xt.count=Math.max(xt.count,Vt.start+Vt.count-xt.start):(++Rt,Z[Rt]=Vt)}Z.length=Rt+1;let ut=i.getParameter(i.UNPACK_ROW_LENGTH),_t=i.getParameter(i.UNPACK_SKIP_PIXELS),Tt=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let nt=0,xt=Z.length;nt<xt;nt++){let Vt=Z[nt],zt=Math.floor(Vt.start/4),dt=Math.ceil(Vt.count/4),Xt=zt%_.width,L=Math.floor(zt/_.width),ft=dt,it=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Xt),i.pixelStorei(i.UNPACK_SKIP_ROWS,L),e.texSubImage2D(i.TEXTURE_2D,0,Xt,L,ft,it,O,j,_.data)}T.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,ut),i.pixelStorei(i.UNPACK_SKIP_PIXELS,_t),i.pixelStorei(i.UNPACK_SKIP_ROWS,Tt)}}function bt(T,_,O){let j=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(j=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(j=i.TEXTURE_3D);let tt=Qt(T,_),Z=_.source;e.bindTexture(j,T.__webglTexture,i.TEXTURE0+O);let Rt=n.get(Z);if(Z.version!==Rt.__version||tt===!0){e.activeTexture(i.TEXTURE0+O);let ut=ae.getPrimaries(ae.workingColorSpace),_t=_.colorSpace===On?null:ae.getPrimaries(_.colorSpace),Tt=_.colorSpace===On||ut===_t?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Tt);let nt=x(_.image,!1,s.maxTextureSize);nt=Bt(_,nt);let xt=r.convert(_.format,_.colorSpace),Vt=r.convert(_.type),zt=b(_.internalFormat,xt,Vt,_.colorSpace,_.isVideoTexture);Pt(j,_);let dt,Xt=_.mipmaps,L=_.isVideoTexture!==!0,ft=Rt.__version===void 0||tt===!0,it=Z.dataReady,St=U(_,nt);if(_.isDepthTexture)zt=S(_.format===ji,_.type),ft&&(L?e.texStorage2D(i.TEXTURE_2D,1,zt,nt.width,nt.height):e.texImage2D(i.TEXTURE_2D,0,zt,nt.width,nt.height,0,xt,Vt,null));else if(_.isDataTexture)if(Xt.length>0){L&&ft&&e.texStorage2D(i.TEXTURE_2D,St,zt,Xt[0].width,Xt[0].height);for(let ot=0,Q=Xt.length;ot<Q;ot++)dt=Xt[ot],L?it&&e.texSubImage2D(i.TEXTURE_2D,ot,0,0,dt.width,dt.height,xt,Vt,dt.data):e.texImage2D(i.TEXTURE_2D,ot,zt,dt.width,dt.height,0,xt,Vt,dt.data);_.generateMipmaps=!1}else L?(ft&&e.texStorage2D(i.TEXTURE_2D,St,zt,nt.width,nt.height),it&&rt(_,nt,xt,Vt)):e.texImage2D(i.TEXTURE_2D,0,zt,nt.width,nt.height,0,xt,Vt,nt.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){L&&ft&&e.texStorage3D(i.TEXTURE_2D_ARRAY,St,zt,Xt[0].width,Xt[0].height,nt.depth);for(let ot=0,Q=Xt.length;ot<Q;ot++)if(dt=Xt[ot],_.format!==an)if(xt!==null)if(L){if(it)if(_.layerUpdates.size>0){let wt=Ga(dt.width,dt.height,_.format,_.type);for(let kt of _.layerUpdates){let fe=dt.data.subarray(kt*wt/dt.data.BYTES_PER_ELEMENT,(kt+1)*wt/dt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ot,0,0,kt,dt.width,dt.height,1,xt,fe)}_.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ot,0,0,0,dt.width,dt.height,nt.depth,xt,dt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ot,zt,dt.width,dt.height,nt.depth,0,dt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else L?it&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,ot,0,0,0,dt.width,dt.height,nt.depth,xt,Vt,dt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,ot,zt,dt.width,dt.height,nt.depth,0,xt,Vt,dt.data)}else{L&&ft&&e.texStorage2D(i.TEXTURE_2D,St,zt,Xt[0].width,Xt[0].height);for(let ot=0,Q=Xt.length;ot<Q;ot++)dt=Xt[ot],_.format!==an?xt!==null?L?it&&e.compressedTexSubImage2D(i.TEXTURE_2D,ot,0,0,dt.width,dt.height,xt,dt.data):e.compressedTexImage2D(i.TEXTURE_2D,ot,zt,dt.width,dt.height,0,dt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?it&&e.texSubImage2D(i.TEXTURE_2D,ot,0,0,dt.width,dt.height,xt,Vt,dt.data):e.texImage2D(i.TEXTURE_2D,ot,zt,dt.width,dt.height,0,xt,Vt,dt.data)}else if(_.isDataArrayTexture)if(L){if(ft&&e.texStorage3D(i.TEXTURE_2D_ARRAY,St,zt,nt.width,nt.height,nt.depth),it)if(_.layerUpdates.size>0){let ot=Ga(nt.width,nt.height,_.format,_.type);for(let Q of _.layerUpdates){let wt=nt.data.subarray(Q*ot/nt.data.BYTES_PER_ELEMENT,(Q+1)*ot/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Q,nt.width,nt.height,1,xt,Vt,wt)}_.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,xt,Vt,nt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,zt,nt.width,nt.height,nt.depth,0,xt,Vt,nt.data);else if(_.isData3DTexture)L?(ft&&e.texStorage3D(i.TEXTURE_3D,St,zt,nt.width,nt.height,nt.depth),it&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,xt,Vt,nt.data)):e.texImage3D(i.TEXTURE_3D,0,zt,nt.width,nt.height,nt.depth,0,xt,Vt,nt.data);else if(_.isFramebufferTexture){if(ft)if(L)e.texStorage2D(i.TEXTURE_2D,St,zt,nt.width,nt.height);else{let ot=nt.width,Q=nt.height;for(let wt=0;wt<St;wt++)e.texImage2D(i.TEXTURE_2D,wt,zt,ot,Q,0,xt,Vt,null),ot>>=1,Q>>=1}}else if(Xt.length>0){if(L&&ft){let ot=ge(Xt[0]);e.texStorage2D(i.TEXTURE_2D,St,zt,ot.width,ot.height)}for(let ot=0,Q=Xt.length;ot<Q;ot++)dt=Xt[ot],L?it&&e.texSubImage2D(i.TEXTURE_2D,ot,0,0,xt,Vt,dt):e.texImage2D(i.TEXTURE_2D,ot,zt,xt,Vt,dt);_.generateMipmaps=!1}else if(L){if(ft){let ot=ge(nt);e.texStorage2D(i.TEXTURE_2D,St,zt,ot.width,ot.height)}it&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,xt,Vt,nt)}else e.texImage2D(i.TEXTURE_2D,0,zt,xt,Vt,nt);m(_)&&d(j),Rt.__version=Z.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function gt(T,_,O){if(_.image.length!==6)return;let j=Qt(T,_),tt=_.source;e.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+O);let Z=n.get(tt);if(tt.version!==Z.__version||j===!0){e.activeTexture(i.TEXTURE0+O);let Rt=ae.getPrimaries(ae.workingColorSpace),ut=_.colorSpace===On?null:ae.getPrimaries(_.colorSpace),_t=_.colorSpace===On||Rt===ut?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t);let Tt=_.isCompressedTexture||_.image[0].isCompressedTexture,nt=_.image[0]&&_.image[0].isDataTexture,xt=[];for(let Q=0;Q<6;Q++)!Tt&&!nt?xt[Q]=x(_.image[Q],!0,s.maxCubemapSize):xt[Q]=nt?_.image[Q].image:_.image[Q],xt[Q]=Bt(_,xt[Q]);let Vt=xt[0],zt=r.convert(_.format,_.colorSpace),dt=r.convert(_.type),Xt=b(_.internalFormat,zt,dt,_.colorSpace),L=_.isVideoTexture!==!0,ft=Z.__version===void 0||j===!0,it=tt.dataReady,St=U(_,Vt);Pt(i.TEXTURE_CUBE_MAP,_);let ot;if(Tt){L&&ft&&e.texStorage2D(i.TEXTURE_CUBE_MAP,St,Xt,Vt.width,Vt.height);for(let Q=0;Q<6;Q++){ot=xt[Q].mipmaps;for(let wt=0;wt<ot.length;wt++){let kt=ot[wt];_.format!==an?zt!==null?L?it&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,wt,0,0,kt.width,kt.height,zt,kt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,wt,Xt,kt.width,kt.height,0,kt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,wt,0,0,kt.width,kt.height,zt,dt,kt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,wt,Xt,kt.width,kt.height,0,zt,dt,kt.data)}}}else{if(ot=_.mipmaps,L&&ft){ot.length>0&&St++;let Q=ge(xt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,St,Xt,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(nt){L?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,xt[Q].width,xt[Q].height,zt,dt,xt[Q].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Xt,xt[Q].width,xt[Q].height,0,zt,dt,xt[Q].data);for(let wt=0;wt<ot.length;wt++){let fe=ot[wt].image[Q].image;L?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,wt+1,0,0,fe.width,fe.height,zt,dt,fe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,wt+1,Xt,fe.width,fe.height,0,zt,dt,fe.data)}}else{L?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,zt,dt,xt[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Xt,zt,dt,xt[Q]);for(let wt=0;wt<ot.length;wt++){let kt=ot[wt];L?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,wt+1,0,0,zt,dt,kt.image[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,wt+1,Xt,zt,dt,kt.image[Q])}}}m(_)&&d(i.TEXTURE_CUBE_MAP),Z.__version=tt.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function It(T,_,O,j,tt,Z){let Rt=r.convert(O.format,O.colorSpace),ut=r.convert(O.type),_t=b(O.internalFormat,Rt,ut,O.colorSpace),Tt=n.get(_),nt=n.get(O);if(nt.__renderTarget=_,!Tt.__hasExternalTextures){let xt=Math.max(1,_.width>>Z),Vt=Math.max(1,_.height>>Z);tt===i.TEXTURE_3D||tt===i.TEXTURE_2D_ARRAY?e.texImage3D(tt,Z,_t,xt,Vt,_.depth,0,Rt,ut,null):e.texImage2D(tt,Z,_t,xt,Vt,0,Rt,ut,null)}e.bindFramebuffer(i.FRAMEBUFFER,T),qt(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,tt,nt.__webglTexture,0,At(_)):(tt===i.TEXTURE_2D||tt>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,j,tt,nt.__webglTexture,Z),e.bindFramebuffer(i.FRAMEBUFFER,null)}function yt(T,_,O){if(i.bindRenderbuffer(i.RENDERBUFFER,T),_.depthBuffer){let j=_.depthTexture,tt=j&&j.isDepthTexture?j.type:null,Z=S(_.stencilBuffer,tt),Rt=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ut=At(_);qt(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ut,Z,_.width,_.height):O?i.renderbufferStorageMultisample(i.RENDERBUFFER,ut,Z,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,Z,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Rt,i.RENDERBUFFER,T)}else{let j=_.textures;for(let tt=0;tt<j.length;tt++){let Z=j[tt],Rt=r.convert(Z.format,Z.colorSpace),ut=r.convert(Z.type),_t=b(Z.internalFormat,Rt,ut,Z.colorSpace),Tt=At(_);O&&qt(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Tt,_t,_.width,_.height):qt(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Tt,_t,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,_t,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Lt(T,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,T),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let j=n.get(_.depthTexture);j.__renderTarget=_,(!j.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),et(_.depthTexture,0);let tt=j.__webglTexture,Z=At(_);if(_.depthTexture.format===Gi)qt(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,tt,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,tt,0);else if(_.depthTexture.format===ji)qt(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,tt,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,tt,0);else throw new Error("Unknown depthTexture format")}function he(T){let _=n.get(T),O=T.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==T.depthTexture){let j=T.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),j){let tt=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,j.removeEventListener("dispose",tt)};j.addEventListener("dispose",tt),_.__depthDisposeCallback=tt}_.__boundDepthTexture=j}if(T.depthTexture&&!_.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");let j=T.texture.mipmaps;j&&j.length>0?Lt(_.__webglFramebuffer[0],T):Lt(_.__webglFramebuffer,T)}else if(O){_.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[j]),_.__webglDepthbuffer[j]===void 0)_.__webglDepthbuffer[j]=i.createRenderbuffer(),yt(_.__webglDepthbuffer[j],T,!1);else{let tt=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=_.__webglDepthbuffer[j];i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,tt,i.RENDERBUFFER,Z)}}else{let j=T.texture.mipmaps;if(j&&j.length>0?e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),yt(_.__webglDepthbuffer,T,!1);else{let tt=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,tt,i.RENDERBUFFER,Z)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function re(T,_,O){let j=n.get(T);_!==void 0&&It(j.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),O!==void 0&&he(T)}function ie(T){let _=T.texture,O=n.get(T),j=n.get(_);T.addEventListener("dispose",I);let tt=T.textures,Z=T.isWebGLCubeRenderTarget===!0,Rt=tt.length>1;if(Rt||(j.__webglTexture===void 0&&(j.__webglTexture=i.createTexture()),j.__version=_.version,o.memory.textures++),Z){O.__webglFramebuffer=[];for(let ut=0;ut<6;ut++)if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer[ut]=[];for(let _t=0;_t<_.mipmaps.length;_t++)O.__webglFramebuffer[ut][_t]=i.createFramebuffer()}else O.__webglFramebuffer[ut]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer=[];for(let ut=0;ut<_.mipmaps.length;ut++)O.__webglFramebuffer[ut]=i.createFramebuffer()}else O.__webglFramebuffer=i.createFramebuffer();if(Rt)for(let ut=0,_t=tt.length;ut<_t;ut++){let Tt=n.get(tt[ut]);Tt.__webglTexture===void 0&&(Tt.__webglTexture=i.createTexture(),o.memory.textures++)}if(T.samples>0&&qt(T)===!1){O.__webglMultisampledFramebuffer=i.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ut=0;ut<tt.length;ut++){let _t=tt[ut];O.__webglColorRenderbuffer[ut]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,O.__webglColorRenderbuffer[ut]);let Tt=r.convert(_t.format,_t.colorSpace),nt=r.convert(_t.type),xt=b(_t.internalFormat,Tt,nt,_t.colorSpace,T.isXRRenderTarget===!0),Vt=At(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Vt,xt,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.RENDERBUFFER,O.__webglColorRenderbuffer[ut])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(O.__webglDepthRenderbuffer=i.createRenderbuffer(),yt(O.__webglDepthRenderbuffer,T,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Z){e.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),Pt(i.TEXTURE_CUBE_MAP,_);for(let ut=0;ut<6;ut++)if(_.mipmaps&&_.mipmaps.length>0)for(let _t=0;_t<_.mipmaps.length;_t++)It(O.__webglFramebuffer[ut][_t],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,_t);else It(O.__webglFramebuffer[ut],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0);m(_)&&d(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Rt){for(let ut=0,_t=tt.length;ut<_t;ut++){let Tt=tt[ut],nt=n.get(Tt);e.bindTexture(i.TEXTURE_2D,nt.__webglTexture),Pt(i.TEXTURE_2D,Tt),It(O.__webglFramebuffer,T,Tt,i.COLOR_ATTACHMENT0+ut,i.TEXTURE_2D,0),m(Tt)&&d(i.TEXTURE_2D)}e.unbindTexture()}else{let ut=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ut=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ut,j.__webglTexture),Pt(ut,_),_.mipmaps&&_.mipmaps.length>0)for(let _t=0;_t<_.mipmaps.length;_t++)It(O.__webglFramebuffer[_t],T,_,i.COLOR_ATTACHMENT0,ut,_t);else It(O.__webglFramebuffer,T,_,i.COLOR_ATTACHMENT0,ut,0);m(_)&&d(ut),e.unbindTexture()}T.depthBuffer&&he(T)}function P(T){let _=T.textures;for(let O=0,j=_.length;O<j;O++){let tt=_[O];if(m(tt)){let Z=E(T),Rt=n.get(tt).__webglTexture;e.bindTexture(Z,Rt),d(Z),e.unbindTexture()}}}let Se=[],ee=[];function ne(T){if(T.samples>0){if(qt(T)===!1){let _=T.textures,O=T.width,j=T.height,tt=i.COLOR_BUFFER_BIT,Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Rt=n.get(T),ut=_.length>1;if(ut)for(let Tt=0;Tt<_.length;Tt++)e.bindFramebuffer(i.FRAMEBUFFER,Rt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Tt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Rt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Tt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Rt.__webglMultisampledFramebuffer);let _t=T.texture.mipmaps;_t&&_t.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Rt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Rt.__webglFramebuffer);for(let Tt=0;Tt<_.length;Tt++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(tt|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(tt|=i.STENCIL_BUFFER_BIT)),ut){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Rt.__webglColorRenderbuffer[Tt]);let nt=n.get(_[Tt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,nt,0)}i.blitFramebuffer(0,0,O,j,0,0,O,j,tt,i.NEAREST),c===!0&&(Se.length=0,ee.length=0,Se.push(i.COLOR_ATTACHMENT0+Tt),T.depthBuffer&&T.resolveDepthBuffer===!1&&(Se.push(Z),ee.push(Z),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ee)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Se))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ut)for(let Tt=0;Tt<_.length;Tt++){e.bindFramebuffer(i.FRAMEBUFFER,Rt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Tt,i.RENDERBUFFER,Rt.__webglColorRenderbuffer[Tt]);let nt=n.get(_[Tt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Rt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Tt,i.TEXTURE_2D,nt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Rt.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&c){let _=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function At(T){return Math.min(s.maxSamples,T.samples)}function qt(T){let _=n.get(T);return T.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function Dt(T){let _=o.render.frame;h.get(T)!==_&&(h.set(T,_),T.update())}function Bt(T,_){let O=T.colorSpace,j=T.format,tt=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||O!==gi&&O!==On&&(ae.getTransfer(O)===de?(j!==an||tt!==bn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),_}function ge(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(l.width=T.naturalWidth||T.width,l.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(l.width=T.displayWidth,l.height=T.displayHeight):(l.width=T.width,l.height=T.height),l}this.allocateTextureUnit=G,this.resetTextureUnits=Y,this.setTexture2D=et,this.setTexture2DArray=W,this.setTexture3D=K,this.setTextureCube=H,this.rebindTextures=re,this.setupRenderTarget=ie,this.updateRenderTargetMipmap=P,this.updateMultisampleRenderTarget=ne,this.setupDepthRenderbuffer=he,this.setupFrameBufferTexture=It,this.useMultisampledRTT=qt}function ag(i,t){function e(n,s=On){let r,o=ae.getTransfer(s);if(n===bn)return i.UNSIGNED_BYTE;if(n===Kr)return i.UNSIGNED_SHORT_4_4_4_4;if(n===jr)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Pa)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Ra)return i.BYTE;if(n===Ca)return i.SHORT;if(n===$i)return i.UNSIGNED_SHORT;if(n===Jr)return i.INT;if(n===si)return i.UNSIGNED_INT;if(n===En)return i.FLOAT;if(n===Ji)return i.HALF_FLOAT;if(n===Ia)return i.ALPHA;if(n===Da)return i.RGB;if(n===an)return i.RGBA;if(n===Gi)return i.DEPTH_COMPONENT;if(n===ji)return i.DEPTH_STENCIL;if(n===La)return i.RED;if(n===Qr)return i.RED_INTEGER;if(n===Ua)return i.RG;if(n===to)return i.RG_INTEGER;if(n===eo)return i.RGBA_INTEGER;if(n===Os||n===Bs||n===zs||n===ks)if(o===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Os)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Bs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===zs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ks)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Os)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Bs)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===zs)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ks)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===no||n===io||n===so||n===ro)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===no)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===io)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===so)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ro)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===oo||n===ao||n===co)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===oo||n===ao)return o===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===co)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===lo||n===ho||n===uo||n===fo||n===po||n===mo||n===go||n===_o||n===xo||n===vo||n===yo||n===Mo||n===So||n===bo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===lo)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ho)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===uo)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===fo)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===po)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===mo)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===go)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===_o)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===xo)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===vo)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===yo)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Mo)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===So)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===bo)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Vs||n===Eo||n===To)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Vs)return o===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Eo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===To)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Na||n===wo||n===Ao||n===Ro)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Vs)return r.COMPRESSED_RED_RGTC1_EXT;if(n===wo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ao)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ro)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ki?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var cg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,lg=`
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

}`,nc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){let s=new Ze,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!==n.depthNear||e.depthFar!==n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new Je({vertexShader:cg,fragmentShader:lg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Be(new Rs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ic=class extends gn{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,u=null,p=null,f=null,g=null,x=new nc,m=e.getContextAttributes(),d=null,E=null,b=[],S=[],U=new Yt,R=null,I=new Ue;I.viewport=new be;let A=new Ue;A.viewport=new be;let M=[I,A],y=new zr,D=null,Y=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let rt=b[J];return rt===void 0&&(rt=new qi,b[J]=rt),rt.getTargetRaySpace()},this.getControllerGrip=function(J){let rt=b[J];return rt===void 0&&(rt=new qi,b[J]=rt),rt.getGripSpace()},this.getHand=function(J){let rt=b[J];return rt===void 0&&(rt=new qi,b[J]=rt),rt.getHandSpace()};function G(J){let rt=S.indexOf(J.inputSource);if(rt===-1)return;let bt=b[rt];bt!==void 0&&(bt.update(J.inputSource,J.frame,l||o),bt.dispatchEvent({type:J.type,data:J.inputSource}))}function $(){s.removeEventListener("select",G),s.removeEventListener("selectstart",G),s.removeEventListener("selectend",G),s.removeEventListener("squeeze",G),s.removeEventListener("squeezestart",G),s.removeEventListener("squeezeend",G),s.removeEventListener("end",$),s.removeEventListener("inputsourceschange",et);for(let J=0;J<b.length;J++){let rt=S[J];rt!==null&&(S[J]=null,b[J].disconnect(rt))}D=null,Y=null,x.reset(),t.setRenderTarget(d),f=null,p=null,u=null,s=null,E=null,Qt.stop(),n.isPresenting=!1,t.setPixelRatio(R),t.setSize(U.width,U.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){a=J,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(J){l=J},this.getBaseLayer=function(){return p!==null?p:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(d=t.getRenderTarget(),s.addEventListener("select",G),s.addEventListener("selectstart",G),s.addEventListener("selectend",G),s.addEventListener("squeeze",G),s.addEventListener("squeezestart",G),s.addEventListener("squeezeend",G),s.addEventListener("end",$),s.addEventListener("inputsourceschange",et),m.xrCompatible!==!0&&await e.makeXRCompatible(),R=t.getPixelRatio(),t.getSize(U),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let bt=null,gt=null,It=null;m.depth&&(It=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,bt=m.stencil?ji:Gi,gt=m.stencil?Ki:si);let yt={colorFormat:e.RGBA8,depthFormat:It,scaleFactor:r};u=new XRWebGLBinding(s,e),p=u.createProjectionLayer(yt),s.updateRenderState({layers:[p]}),t.setPixelRatio(1),t.setSize(p.textureWidth,p.textureHeight,!1),E=new _n(p.textureWidth,p.textureHeight,{format:an,type:bn,depthTexture:new ws(p.textureWidth,p.textureHeight,gt,void 0,void 0,void 0,void 0,void 0,void 0,bt),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{let bt={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,bt),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),E=new _n(f.framebufferWidth,f.framebufferHeight,{format:an,type:bn,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),Qt.setContext(s),Qt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function et(J){for(let rt=0;rt<J.removed.length;rt++){let bt=J.removed[rt],gt=S.indexOf(bt);gt>=0&&(S[gt]=null,b[gt].disconnect(bt))}for(let rt=0;rt<J.added.length;rt++){let bt=J.added[rt],gt=S.indexOf(bt);if(gt===-1){for(let yt=0;yt<b.length;yt++)if(yt>=S.length){S.push(bt),gt=yt;break}else if(S[yt]===null){S[yt]=bt,gt=yt;break}if(gt===-1)break}let It=b[gt];It&&It.connect(bt)}}let W=new w,K=new w;function H(J,rt,bt){W.setFromMatrixPosition(rt.matrixWorld),K.setFromMatrixPosition(bt.matrixWorld);let gt=W.distanceTo(K),It=rt.projectionMatrix.elements,yt=bt.projectionMatrix.elements,Lt=It[14]/(It[10]-1),he=It[14]/(It[10]+1),re=(It[9]+1)/It[5],ie=(It[9]-1)/It[5],P=(It[8]-1)/It[0],Se=(yt[8]+1)/yt[0],ee=Lt*P,ne=Lt*Se,At=gt/(-P+Se),qt=At*-P;if(rt.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(qt),J.translateZ(At),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),It[10]===-1)J.projectionMatrix.copy(rt.projectionMatrix),J.projectionMatrixInverse.copy(rt.projectionMatrixInverse);else{let Dt=Lt+At,Bt=he+At,ge=ee-qt,T=ne+(gt-qt),_=re*he/Bt*Dt,O=ie*he/Bt*Dt;J.projectionMatrix.makePerspective(ge,T,_,O,Dt,Bt),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function lt(J,rt){rt===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(rt.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let rt=J.near,bt=J.far;x.texture!==null&&(x.depthNear>0&&(rt=x.depthNear),x.depthFar>0&&(bt=x.depthFar)),y.near=A.near=I.near=rt,y.far=A.far=I.far=bt,(D!==y.near||Y!==y.far)&&(s.updateRenderState({depthNear:y.near,depthFar:y.far}),D=y.near,Y=y.far),I.layers.mask=J.layers.mask|2,A.layers.mask=J.layers.mask|4,y.layers.mask=I.layers.mask|A.layers.mask;let gt=J.parent,It=y.cameras;lt(y,gt);for(let yt=0;yt<It.length;yt++)lt(It[yt],gt);It.length===2?H(y,I,A):y.projectionMatrix.copy(I.projectionMatrix),ht(J,y,gt)};function ht(J,rt,bt){bt===null?J.matrix.copy(rt.matrixWorld):(J.matrix.copy(bt.matrixWorld),J.matrix.invert(),J.matrix.multiply(rt.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(rt.projectionMatrix),J.projectionMatrixInverse.copy(rt.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Wi*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(p===null&&f===null))return c},this.setFoveation=function(J){c=J,p!==null&&(p.fixedFoveation=J),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=J)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(y)};let Mt=null;function Pt(J,rt){if(h=rt.getViewerPose(l||o),g=rt,h!==null){let bt=h.views;f!==null&&(t.setRenderTargetFramebuffer(E,f.framebuffer),t.setRenderTarget(E));let gt=!1;bt.length!==y.cameras.length&&(y.cameras.length=0,gt=!0);for(let Lt=0;Lt<bt.length;Lt++){let he=bt[Lt],re=null;if(f!==null)re=f.getViewport(he);else{let P=u.getViewSubImage(p,he);re=P.viewport,Lt===0&&(t.setRenderTargetTextures(E,P.colorTexture,P.depthStencilTexture),t.setRenderTarget(E))}let ie=M[Lt];ie===void 0&&(ie=new Ue,ie.layers.enable(Lt),ie.viewport=new be,M[Lt]=ie),ie.matrix.fromArray(he.transform.matrix),ie.matrix.decompose(ie.position,ie.quaternion,ie.scale),ie.projectionMatrix.fromArray(he.projectionMatrix),ie.projectionMatrixInverse.copy(ie.projectionMatrix).invert(),ie.viewport.set(re.x,re.y,re.width,re.height),Lt===0&&(y.matrix.copy(ie.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),gt===!0&&y.cameras.push(ie)}let It=s.enabledFeatures;if(It&&It.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&u){let Lt=u.getDepthInformation(bt[0]);Lt&&Lt.isValid&&Lt.texture&&x.init(t,Lt,s.renderState)}}for(let bt=0;bt<b.length;bt++){let gt=S[bt],It=b[bt];gt!==null&&It!==void 0&&It.update(gt,rt,l||o)}Mt&&Mt(J,rt),rt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:rt}),g=null}let Qt=new nh;Qt.setAnimationLoop(Pt),this.setAnimationLoop=function(J){Mt=J},this.dispose=function(){}}},Ei=new vn,hg=new Me;function ug(i,t){function e(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,ka(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,E,b,S){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),p(m,d),d.isMeshPhysicalMaterial&&f(m,d,S)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),x(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?c(m,d,E,b):d.isSpriteMaterial?l(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,e(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===ze&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,e(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===ze&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,e(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,e(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,e(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let E=t.get(d),b=E.envMap,S=E.envMapRotation;b&&(m.envMap.value=b,Ei.copy(S),Ei.x*=-1,Ei.y*=-1,Ei.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(Ei.y*=-1,Ei.z*=-1),m.envMapRotation.value.setFromMatrix4(hg.makeRotationFromEuler(Ei)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,e(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,e(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function c(m,d,E,b){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*E,m.scale.value=b*.5,d.map&&(m.map.value=d.map,e(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function l(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function p(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,e(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,e(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function f(m,d,E){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,e(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,e(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,e(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,e(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,e(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===ze&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,e(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,e(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,e(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,e(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,e(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,e(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,e(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function x(m,d){let E=t.get(d).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function dg(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,b){let S=b.program;n.uniformBlockBinding(E,S)}function l(E,b){let S=s[E.id];S===void 0&&(g(E),S=h(E),s[E.id]=S,E.addEventListener("dispose",m));let U=b.program;n.updateUBOMapping(E,U);let R=t.render.frame;r[E.id]!==R&&(p(E),r[E.id]=R)}function h(E){let b=u();E.__bindingPointIndex=b;let S=i.createBuffer(),U=E.__size,R=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,U,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,b,S),S}function u(){for(let E=0;E<a;E++)if(o.indexOf(E)===-1)return o.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(E){let b=s[E.id],S=E.uniforms,U=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let R=0,I=S.length;R<I;R++){let A=Array.isArray(S[R])?S[R]:[S[R]];for(let M=0,y=A.length;M<y;M++){let D=A[M];if(f(D,R,M,U)===!0){let Y=D.__offset,G=Array.isArray(D.value)?D.value:[D.value],$=0;for(let et=0;et<G.length;et++){let W=G[et],K=x(W);typeof W=="number"||typeof W=="boolean"?(D.__data[0]=W,i.bufferSubData(i.UNIFORM_BUFFER,Y+$,D.__data)):W.isMatrix3?(D.__data[0]=W.elements[0],D.__data[1]=W.elements[1],D.__data[2]=W.elements[2],D.__data[3]=0,D.__data[4]=W.elements[3],D.__data[5]=W.elements[4],D.__data[6]=W.elements[5],D.__data[7]=0,D.__data[8]=W.elements[6],D.__data[9]=W.elements[7],D.__data[10]=W.elements[8],D.__data[11]=0):(W.toArray(D.__data,$),$+=K.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,Y,D.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(E,b,S,U){let R=E.value,I=b+"_"+S;if(U[I]===void 0)return typeof R=="number"||typeof R=="boolean"?U[I]=R:U[I]=R.clone(),!0;{let A=U[I];if(typeof R=="number"||typeof R=="boolean"){if(A!==R)return U[I]=R,!0}else if(A.equals(R)===!1)return A.copy(R),!0}return!1}function g(E){let b=E.uniforms,S=0,U=16;for(let I=0,A=b.length;I<A;I++){let M=Array.isArray(b[I])?b[I]:[b[I]];for(let y=0,D=M.length;y<D;y++){let Y=M[y],G=Array.isArray(Y.value)?Y.value:[Y.value];for(let $=0,et=G.length;$<et;$++){let W=G[$],K=x(W),H=S%U,lt=H%K.boundary,ht=H+lt;S+=lt,ht!==0&&U-ht<K.storage&&(S+=U-ht),Y.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),Y.__offset=S,S+=K.storage}}}let R=S%U;return R>0&&(S+=U-R),E.__size=S,E.__cache={},this}function x(E){let b={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(b.boundary=4,b.storage=4):E.isVector2?(b.boundary=8,b.storage=8):E.isVector3||E.isColor?(b.boundary=16,b.storage=12):E.isVector4?(b.boundary=16,b.storage=16):E.isMatrix3?(b.boundary=48,b.storage=48):E.isMatrix4?(b.boundary=64,b.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),b}function m(E){let b=E.target;b.removeEventListener("dispose",m);let S=o.indexOf(b.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function d(){for(let E in s)i.deleteBuffer(s[E]);o=[],s={},r={}}return{bind:c,update:l,dispose:d}}var Lo=class{constructor(t={}){let{canvas:e=wl(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:p=!1}=t;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;let g=new Uint32Array(4),x=new Int32Array(4),m=null,d=null,E=[],b=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=fn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let S=this,U=!1;this._outputColorSpace=Oe;let R=0,I=0,A=null,M=-1,y=null,D=new be,Y=new be,G=null,$=new $t(0),et=0,W=e.width,K=e.height,H=1,lt=null,ht=null,Mt=new be(0,0,W,K),Pt=new be(0,0,W,K),Qt=!1,J=new Es,rt=!1,bt=!1,gt=new Me,It=new Me,yt=new w,Lt=new be,he={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},re=!1;function ie(){return A===null?H:1}let P=n;function Se(v,F){return e.getContext(v,F)}try{let v={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"178"}`),e.addEventListener("webglcontextlost",St,!1),e.addEventListener("webglcontextrestored",ot,!1),e.addEventListener("webglcontextcreationerror",Q,!1),P===null){let F="webgl2";if(P=Se(F,v),P===null)throw Se(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(v){throw console.error("THREE.WebGLRenderer: "+v.message),v}let ee,ne,At,qt,Dt,Bt,ge,T,_,O,j,tt,Z,Rt,ut,_t,Tt,nt,xt,Vt,zt,dt,Xt,L;function ft(){ee=new Pp(P),ee.init(),dt=new ag(P,ee),ne=new bp(P,ee,t,dt),At=new rg(P,ee),ne.reverseDepthBuffer&&p&&At.buffers.depth.setReversed(!0),qt=new Lp(P),Dt=new Ym,Bt=new og(P,ee,At,Dt,ne,dt,qt),ge=new Tp(S),T=new Cp(S),_=new Bu(P),Xt=new Mp(P,_),O=new Ip(P,_,qt,Xt),j=new Np(P,O,_,qt),xt=new Up(P,ne,Bt),_t=new Ep(Dt),tt=new Xm(S,ge,T,ee,ne,Xt,_t),Z=new ug(S,Dt),Rt=new Zm,ut=new tg(ee),nt=new yp(S,ge,T,At,j,f,c),Tt=new ig(S,j,ne),L=new dg(P,qt,ne,At),Vt=new Sp(P,ee,qt),zt=new Dp(P,ee,qt),qt.programs=tt.programs,S.capabilities=ne,S.extensions=ee,S.properties=Dt,S.renderLists=Rt,S.shadowMap=Tt,S.state=At,S.info=qt}ft();let it=new ic(S,P);this.xr=it,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let v=ee.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=ee.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(v){v!==void 0&&(H=v,this.setSize(W,K,!1))},this.getSize=function(v){return v.set(W,K)},this.setSize=function(v,F,V=!0){if(it.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}W=v,K=F,e.width=Math.floor(v*H),e.height=Math.floor(F*H),V===!0&&(e.style.width=v+"px",e.style.height=F+"px"),this.setViewport(0,0,v,F)},this.getDrawingBufferSize=function(v){return v.set(W*H,K*H).floor()},this.setDrawingBufferSize=function(v,F,V){W=v,K=F,H=V,e.width=Math.floor(v*V),e.height=Math.floor(F*V),this.setViewport(0,0,v,F)},this.getCurrentViewport=function(v){return v.copy(D)},this.getViewport=function(v){return v.copy(Mt)},this.setViewport=function(v,F,V,k){v.isVector4?Mt.set(v.x,v.y,v.z,v.w):Mt.set(v,F,V,k),At.viewport(D.copy(Mt).multiplyScalar(H).round())},this.getScissor=function(v){return v.copy(Pt)},this.setScissor=function(v,F,V,k){v.isVector4?Pt.set(v.x,v.y,v.z,v.w):Pt.set(v,F,V,k),At.scissor(Y.copy(Pt).multiplyScalar(H).round())},this.getScissorTest=function(){return Qt},this.setScissorTest=function(v){At.setScissorTest(Qt=v)},this.setOpaqueSort=function(v){lt=v},this.setTransparentSort=function(v){ht=v},this.getClearColor=function(v){return v.copy(nt.getClearColor())},this.setClearColor=function(){nt.setClearColor(...arguments)},this.getClearAlpha=function(){return nt.getClearAlpha()},this.setClearAlpha=function(){nt.setClearAlpha(...arguments)},this.clear=function(v=!0,F=!0,V=!0){let k=0;if(v){let N=!1;if(A!==null){let ct=A.texture.format;N=ct===eo||ct===to||ct===Qr}if(N){let ct=A.texture.type,pt=ct===bn||ct===si||ct===$i||ct===Ki||ct===Kr||ct===jr,Et=nt.getClearColor(),vt=nt.getClearAlpha(),Ht=Et.r,Wt=Et.g,Nt=Et.b;pt?(g[0]=Ht,g[1]=Wt,g[2]=Nt,g[3]=vt,P.clearBufferuiv(P.COLOR,0,g)):(x[0]=Ht,x[1]=Wt,x[2]=Nt,x[3]=vt,P.clearBufferiv(P.COLOR,0,x))}else k|=P.COLOR_BUFFER_BIT}F&&(k|=P.DEPTH_BUFFER_BIT),V&&(k|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",St,!1),e.removeEventListener("webglcontextrestored",ot,!1),e.removeEventListener("webglcontextcreationerror",Q,!1),nt.dispose(),Rt.dispose(),ut.dispose(),Dt.dispose(),ge.dispose(),T.dispose(),j.dispose(),Xt.dispose(),L.dispose(),tt.dispose(),it.dispose(),it.removeEventListener("sessionstart",Gs),it.removeEventListener("sessionend",Ws),An.stop()};function St(v){v.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),U=!0}function ot(){console.log("THREE.WebGLRenderer: Context Restored."),U=!1;let v=qt.autoReset,F=Tt.enabled,V=Tt.autoUpdate,k=Tt.needsUpdate,N=Tt.type;ft(),qt.autoReset=v,Tt.enabled=F,Tt.autoUpdate=V,Tt.needsUpdate=k,Tt.type=N}function Q(v){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function wt(v){let F=v.target;F.removeEventListener("dispose",wt),kt(F)}function kt(v){fe(v),Dt.remove(v)}function fe(v){let F=Dt.get(v).programs;F!==void 0&&(F.forEach(function(V){tt.releaseProgram(V)}),v.isShaderMaterial&&tt.releaseShaderCache(v))}this.renderBufferDirect=function(v,F,V,k,N,ct){F===null&&(F=he);let pt=N.isMesh&&N.matrixWorld.determinant()<0,Et=Ys(v,F,V,k,N);At.setMaterial(k,pt);let vt=V.index,Ht=1;if(k.wireframe===!0){if(vt=O.getWireframeAttribute(V),vt===void 0)return;Ht=2}let Wt=V.drawRange,Nt=V.attributes.position,te=Wt.start*Ht,le=(Wt.start+Wt.count)*Ht;ct!==null&&(te=Math.max(te,ct.start*Ht),le=Math.min(le,(ct.start+ct.count)*Ht)),vt!==null?(te=Math.max(te,0),le=Math.min(le,vt.count)):Nt!=null&&(te=Math.max(te,0),le=Math.min(le,Nt.count));let ve=le-te;if(ve<0||ve===1/0)return;Xt.setup(N,k,Et,V,vt);let me,ue=Vt;if(vt!==null&&(me=_.get(vt),ue=zt,ue.setIndex(me)),N.isMesh)k.wireframe===!0?(At.setLineWidth(k.wireframeLinewidth*ie()),ue.setMode(P.LINES)):ue.setMode(P.TRIANGLES);else if(N.isLine){let Ot=k.linewidth;Ot===void 0&&(Ot=1),At.setLineWidth(Ot*ie()),N.isLineSegments?ue.setMode(P.LINES):N.isLineLoop?ue.setMode(P.LINE_LOOP):ue.setMode(P.LINE_STRIP)}else N.isPoints?ue.setMode(P.POINTS):N.isSprite&&ue.setMode(P.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)_i("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ue.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(ee.get("WEBGL_multi_draw"))ue.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{let Ot=N._multiDrawStarts,_e=N._multiDrawCounts,oe=N._multiDrawCount,Ie=vt?_.get(vt).bytesPerElement:1,Rn=Dt.get(k).currentProgram.getUniforms();for(let C=0;C<oe;C++)Rn.setValue(P,"_gl_DrawID",C),ue.render(Ot[C]/Ie,_e[C])}else if(N.isInstancedMesh)ue.renderInstances(te,ve,N.count);else if(V.isInstancedBufferGeometry){let Ot=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,_e=Math.min(V.instanceCount,Ot);ue.renderInstances(te,ve,_e)}else ue.render(te,ve)};function se(v,F,V){v.transparent===!0&&v.side===Sn&&v.forceSinglePass===!1?(v.side=ze,v.needsUpdate=!0,Ri(v,F,V),v.side=Nn,v.needsUpdate=!0,Ri(v,F,V),v.side=Sn):Ri(v,F,V)}this.compile=function(v,F,V=null){V===null&&(V=v),d=ut.get(V),d.init(F),b.push(d),V.traverseVisible(function(N){N.isLight&&N.layers.test(F.layers)&&(d.pushLight(N),N.castShadow&&d.pushShadow(N))}),v!==V&&v.traverseVisible(function(N){N.isLight&&N.layers.test(F.layers)&&(d.pushLight(N),N.castShadow&&d.pushShadow(N))}),d.setupLights();let k=new Set;return v.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;let ct=N.material;if(ct)if(Array.isArray(ct))for(let pt=0;pt<ct.length;pt++){let Et=ct[pt];se(Et,V,N),k.add(Et)}else se(ct,V,N),k.add(ct)}),d=b.pop(),k},this.compileAsync=function(v,F,V=null){let k=this.compile(v,F,V);return new Promise(N=>{function ct(){if(k.forEach(function(pt){Dt.get(pt).currentProgram.isReady()&&k.delete(pt)}),k.size===0){N(v);return}setTimeout(ct,10)}ee.get("KHR_parallel_shader_compile")!==null?ct():setTimeout(ct,10)})};let We=null;function je(v){We&&We(v)}function Gs(){An.stop()}function Ws(){An.start()}let An=new nh;An.setAnimationLoop(je),typeof self<"u"&&An.setContext(self),this.setAnimationLoop=function(v){We=v,it.setAnimationLoop(v),v===null?An.stop():An.start()},it.addEventListener("sessionstart",Gs),it.addEventListener("sessionend",Ws),this.render=function(v,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(U===!0)return;if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),it.enabled===!0&&it.isPresenting===!0&&(it.cameraAutoUpdate===!0&&it.updateCamera(F),F=it.getCamera()),v.isScene===!0&&v.onBeforeRender(S,v,F,A),d=ut.get(v,b.length),d.init(F),b.push(d),It.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),J.setFromProjectionMatrix(It),bt=this.localClippingEnabled,rt=_t.init(this.clippingPlanes,bt),m=Rt.get(v,E.length),m.init(),E.push(m),it.enabled===!0&&it.isPresenting===!0){let ct=S.xr.getDepthSensingMesh();ct!==null&&Ai(ct,F,-1/0,S.sortObjects)}Ai(v,F,0,S.sortObjects),m.finish(),S.sortObjects===!0&&m.sort(lt,ht),re=it.enabled===!1||it.isPresenting===!1||it.hasDepthSensing()===!1,re&&nt.addToRenderList(m,v),this.info.render.frame++,rt===!0&&_t.beginShadows();let V=d.state.shadowsArray;Tt.render(V,v,F),rt===!0&&_t.endShadows(),this.info.autoReset===!0&&this.info.reset();let k=m.opaque,N=m.transmissive;if(d.setupLights(),F.isArrayCamera){let ct=F.cameras;if(N.length>0)for(let pt=0,Et=ct.length;pt<Et;pt++){let vt=ct[pt];ss(k,N,v,vt)}re&&nt.render(v);for(let pt=0,Et=ct.length;pt<Et;pt++){let vt=ct[pt];Xs(m,v,vt,vt.viewport)}}else N.length>0&&ss(k,N,v,F),re&&nt.render(v),Xs(m,v,F);A!==null&&I===0&&(Bt.updateMultisampleRenderTarget(A),Bt.updateRenderTargetMipmap(A)),v.isScene===!0&&v.onAfterRender(S,v,F),Xt.resetDefaultState(),M=-1,y=null,b.pop(),b.length>0?(d=b[b.length-1],rt===!0&&_t.setGlobalState(S.clippingPlanes,d.state.camera)):d=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function Ai(v,F,V,k){if(v.visible===!1)return;if(v.layers.test(F.layers)){if(v.isGroup)V=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(F);else if(v.isLight)d.pushLight(v),v.castShadow&&d.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||J.intersectsSprite(v)){k&&Lt.setFromMatrixPosition(v.matrixWorld).applyMatrix4(It);let pt=j.update(v),Et=v.material;Et.visible&&m.push(v,pt,Et,V,Lt.z,null)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||J.intersectsObject(v))){let pt=j.update(v),Et=v.material;if(k&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),Lt.copy(v.boundingSphere.center)):(pt.boundingSphere===null&&pt.computeBoundingSphere(),Lt.copy(pt.boundingSphere.center)),Lt.applyMatrix4(v.matrixWorld).applyMatrix4(It)),Array.isArray(Et)){let vt=pt.groups;for(let Ht=0,Wt=vt.length;Ht<Wt;Ht++){let Nt=vt[Ht],te=Et[Nt.materialIndex];te&&te.visible&&m.push(v,pt,te,V,Lt.z,Nt)}}else Et.visible&&m.push(v,pt,Et,V,Lt.z,null)}}let ct=v.children;for(let pt=0,Et=ct.length;pt<Et;pt++)Ai(ct[pt],F,V,k)}function Xs(v,F,V,k){let N=v.opaque,ct=v.transmissive,pt=v.transparent;d.setupLightsView(V),rt===!0&&_t.setGlobalState(S.clippingPlanes,V),k&&At.viewport(D.copy(k)),N.length>0&&Bn(N,F,V),ct.length>0&&Bn(ct,F,V),pt.length>0&&Bn(pt,F,V),At.buffers.depth.setTest(!0),At.buffers.depth.setMask(!0),At.buffers.color.setMask(!0),At.setPolygonOffset(!1)}function ss(v,F,V,k){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[k.id]===void 0&&(d.state.transmissionRenderTarget[k.id]=new _n(1,1,{generateMipmaps:!0,type:ee.has("EXT_color_buffer_half_float")||ee.has("EXT_color_buffer_float")?Ji:bn,minFilter:ii,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ae.workingColorSpace}));let ct=d.state.transmissionRenderTarget[k.id],pt=k.viewport||D;ct.setSize(pt.z*S.transmissionResolutionScale,pt.w*S.transmissionResolutionScale);let Et=S.getRenderTarget(),vt=S.getActiveCubeFace(),Ht=S.getActiveMipmapLevel();S.setRenderTarget(ct),S.getClearColor($),et=S.getClearAlpha(),et<1&&S.setClearColor(16777215,.5),S.clear(),re&&nt.render(V);let Wt=S.toneMapping;S.toneMapping=fn;let Nt=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),d.setupLightsView(k),rt===!0&&_t.setGlobalState(S.clippingPlanes,k),Bn(v,V,k),Bt.updateMultisampleRenderTarget(ct),Bt.updateRenderTargetMipmap(ct),ee.has("WEBGL_multisampled_render_to_texture")===!1){let te=!1;for(let le=0,ve=F.length;le<ve;le++){let me=F[le],ue=me.object,Ot=me.geometry,_e=me.material,oe=me.group;if(_e.side===Sn&&ue.layers.test(k.layers)){let Ie=_e.side;_e.side=ze,_e.needsUpdate=!0,rs(ue,V,k,Ot,_e,oe),_e.side=Ie,_e.needsUpdate=!0,te=!0}}te===!0&&(Bt.updateMultisampleRenderTarget(ct),Bt.updateRenderTargetMipmap(ct))}S.setRenderTarget(Et,vt,Ht),S.setClearColor($,et),Nt!==void 0&&(k.viewport=Nt),S.toneMapping=Wt}function Bn(v,F,V){let k=F.isScene===!0?F.overrideMaterial:null;for(let N=0,ct=v.length;N<ct;N++){let pt=v[N],Et=pt.object,vt=pt.geometry,Ht=pt.group,Wt=pt.material;Wt.allowOverride===!0&&k!==null&&(Wt=k),Et.layers.test(V.layers)&&rs(Et,F,V,vt,Wt,Ht)}}function rs(v,F,V,k,N,ct){v.onBeforeRender(S,F,V,k,N,ct),v.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),N.onBeforeRender(S,F,V,k,v,ct),N.transparent===!0&&N.side===Sn&&N.forceSinglePass===!1?(N.side=ze,N.needsUpdate=!0,S.renderBufferDirect(V,F,k,N,v,ct),N.side=Nn,N.needsUpdate=!0,S.renderBufferDirect(V,F,k,N,v,ct),N.side=Sn):S.renderBufferDirect(V,F,k,N,v,ct),v.onAfterRender(S,F,V,k,N,ct)}function Ri(v,F,V){F.isScene!==!0&&(F=he);let k=Dt.get(v),N=d.state.lights,ct=d.state.shadowsArray,pt=N.state.version,Et=tt.getParameters(v,N.state,ct,F,V),vt=tt.getProgramCacheKey(Et),Ht=k.programs;k.environment=v.isMeshStandardMaterial?F.environment:null,k.fog=F.fog,k.envMap=(v.isMeshStandardMaterial?T:ge).get(v.envMap||k.environment),k.envMapRotation=k.environment!==null&&v.envMap===null?F.environmentRotation:v.envMapRotation,Ht===void 0&&(v.addEventListener("dispose",wt),Ht=new Map,k.programs=Ht);let Wt=Ht.get(vt);if(Wt!==void 0){if(k.currentProgram===Wt&&k.lightsStateVersion===pt)return os(v,Et),Wt}else Et.uniforms=tt.getUniforms(v),v.onBeforeCompile(Et,S),Wt=tt.acquireProgram(Et,vt),Ht.set(vt,Wt),k.uniforms=Et.uniforms;let Nt=k.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(Nt.clippingPlanes=_t.uniform),os(v,Et),k.needsLights=qs(v),k.lightsStateVersion=pt,k.needsLights&&(Nt.ambientLightColor.value=N.state.ambient,Nt.lightProbe.value=N.state.probe,Nt.directionalLights.value=N.state.directional,Nt.directionalLightShadows.value=N.state.directionalShadow,Nt.spotLights.value=N.state.spot,Nt.spotLightShadows.value=N.state.spotShadow,Nt.rectAreaLights.value=N.state.rectArea,Nt.ltc_1.value=N.state.rectAreaLTC1,Nt.ltc_2.value=N.state.rectAreaLTC2,Nt.pointLights.value=N.state.point,Nt.pointLightShadows.value=N.state.pointShadow,Nt.hemisphereLights.value=N.state.hemi,Nt.directionalShadowMap.value=N.state.directionalShadowMap,Nt.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Nt.spotShadowMap.value=N.state.spotShadowMap,Nt.spotLightMatrix.value=N.state.spotLightMatrix,Nt.spotLightMap.value=N.state.spotLightMap,Nt.pointShadowMap.value=N.state.pointShadowMap,Nt.pointShadowMatrix.value=N.state.pointShadowMatrix),k.currentProgram=Wt,k.uniformsList=null,Wt}function zn(v){if(v.uniformsList===null){let F=v.currentProgram.getUniforms();v.uniformsList=ns.seqWithValue(F.seq,v.uniforms)}return v.uniformsList}function os(v,F){let V=Dt.get(v);V.outputColorSpace=F.outputColorSpace,V.batching=F.batching,V.batchingColor=F.batchingColor,V.instancing=F.instancing,V.instancingColor=F.instancingColor,V.instancingMorph=F.instancingMorph,V.skinning=F.skinning,V.morphTargets=F.morphTargets,V.morphNormals=F.morphNormals,V.morphColors=F.morphColors,V.morphTargetsCount=F.morphTargetsCount,V.numClippingPlanes=F.numClippingPlanes,V.numIntersection=F.numClipIntersection,V.vertexAlphas=F.vertexAlphas,V.vertexTangents=F.vertexTangents,V.toneMapping=F.toneMapping}function Ys(v,F,V,k,N){F.isScene!==!0&&(F=he),Bt.resetTextureUnits();let ct=F.fog,pt=k.isMeshStandardMaterial?F.environment:null,Et=A===null?S.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:gi,vt=(k.isMeshStandardMaterial?T:ge).get(k.envMap||pt),Ht=k.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,Wt=!!V.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Nt=!!V.morphAttributes.position,te=!!V.morphAttributes.normal,le=!!V.morphAttributes.color,ve=fn;k.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(ve=S.toneMapping);let me=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,ue=me!==void 0?me.length:0,Ot=Dt.get(k),_e=d.state.lights;if(rt===!0&&(bt===!0||v!==y)){let at=v===y&&k.id===M;_t.setState(k,v,at)}let oe=!1;k.version===Ot.__version?(Ot.needsLights&&Ot.lightsStateVersion!==_e.state.version||Ot.outputColorSpace!==Et||N.isBatchedMesh&&Ot.batching===!1||!N.isBatchedMesh&&Ot.batching===!0||N.isBatchedMesh&&Ot.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Ot.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Ot.instancing===!1||!N.isInstancedMesh&&Ot.instancing===!0||N.isSkinnedMesh&&Ot.skinning===!1||!N.isSkinnedMesh&&Ot.skinning===!0||N.isInstancedMesh&&Ot.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Ot.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Ot.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Ot.instancingMorph===!1&&N.morphTexture!==null||Ot.envMap!==vt||k.fog===!0&&Ot.fog!==ct||Ot.numClippingPlanes!==void 0&&(Ot.numClippingPlanes!==_t.numPlanes||Ot.numIntersection!==_t.numIntersection)||Ot.vertexAlphas!==Ht||Ot.vertexTangents!==Wt||Ot.morphTargets!==Nt||Ot.morphNormals!==te||Ot.morphColors!==le||Ot.toneMapping!==ve||Ot.morphTargetsCount!==ue)&&(oe=!0):(oe=!0,Ot.__version=k.version);let Ie=Ot.currentProgram;oe===!0&&(Ie=Ri(k,F,N));let Rn=!1,C=!1,B=!1,z=Ie.getUniforms(),st=Ot.uniforms;if(At.useProgram(Ie.program)&&(Rn=!0,C=!0,B=!0),k.id!==M&&(M=k.id,C=!0),Rn||y!==v){At.buffers.depth.getReversed()?(gt.copy(v.projectionMatrix),Rl(gt),Cl(gt),z.setValue(P,"projectionMatrix",gt)):z.setValue(P,"projectionMatrix",v.projectionMatrix),z.setValue(P,"viewMatrix",v.matrixWorldInverse);let X=z.map.cameraPosition;X!==void 0&&X.setValue(P,yt.setFromMatrixPosition(v.matrixWorld)),ne.logarithmicDepthBuffer&&z.setValue(P,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&z.setValue(P,"isOrthographic",v.isOrthographicCamera===!0),y!==v&&(y=v,C=!0,B=!0)}if(N.isSkinnedMesh){z.setOptional(P,N,"bindMatrix"),z.setOptional(P,N,"bindMatrixInverse");let at=N.skeleton;at&&(at.boneTexture===null&&at.computeBoneTexture(),z.setValue(P,"boneTexture",at.boneTexture,Bt))}N.isBatchedMesh&&(z.setOptional(P,N,"batchingTexture"),z.setValue(P,"batchingTexture",N._matricesTexture,Bt),z.setOptional(P,N,"batchingIdTexture"),z.setValue(P,"batchingIdTexture",N._indirectTexture,Bt),z.setOptional(P,N,"batchingColorTexture"),N._colorsTexture!==null&&z.setValue(P,"batchingColorTexture",N._colorsTexture,Bt));let q=V.morphAttributes;if((q.position!==void 0||q.normal!==void 0||q.color!==void 0)&&xt.update(N,V,Ie),(C||Ot.receiveShadow!==N.receiveShadow)&&(Ot.receiveShadow=N.receiveShadow,z.setValue(P,"receiveShadow",N.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(st.envMap.value=vt,st.flipEnvMap.value=vt.isCubeTexture&&vt.isRenderTargetTexture===!1?-1:1),k.isMeshStandardMaterial&&k.envMap===null&&F.environment!==null&&(st.envMapIntensity.value=F.environmentIntensity),C&&(z.setValue(P,"toneMappingExposure",S.toneMappingExposure),Ot.needsLights&&pn(st,B),ct&&k.fog===!0&&Z.refreshFogUniforms(st,ct),Z.refreshMaterialUniforms(st,k,H,K,d.state.transmissionRenderTarget[v.id]),ns.upload(P,zn(Ot),st,Bt)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(ns.upload(P,zn(Ot),st,Bt),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&z.setValue(P,"center",N.center),z.setValue(P,"modelViewMatrix",N.modelViewMatrix),z.setValue(P,"normalMatrix",N.normalMatrix),z.setValue(P,"modelMatrix",N.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){let at=k.uniformsGroups;for(let X=0,Ct=at.length;X<Ct;X++){let Ft=at[X];L.update(Ft,Ie),L.bind(Ft,Ie)}}return Ie}function pn(v,F){v.ambientLightColor.needsUpdate=F,v.lightProbe.needsUpdate=F,v.directionalLights.needsUpdate=F,v.directionalLightShadows.needsUpdate=F,v.pointLights.needsUpdate=F,v.pointLightShadows.needsUpdate=F,v.spotLights.needsUpdate=F,v.spotLightShadows.needsUpdate=F,v.rectAreaLights.needsUpdate=F,v.hemisphereLights.needsUpdate=F}function qs(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(v,F,V){let k=Dt.get(v);k.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),Dt.get(v.texture).__webglTexture=F,Dt.get(v.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:V,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,F){let V=Dt.get(v);V.__webglFramebuffer=F,V.__useDefaultFramebuffer=F===void 0};let Vo=P.createFramebuffer();this.setRenderTarget=function(v,F=0,V=0){A=v,R=F,I=V;let k=!0,N=null,ct=!1,pt=!1;if(v){let vt=Dt.get(v);if(vt.__useDefaultFramebuffer!==void 0)At.bindFramebuffer(P.FRAMEBUFFER,null),k=!1;else if(vt.__webglFramebuffer===void 0)Bt.setupRenderTarget(v);else if(vt.__hasExternalTextures)Bt.rebindTextures(v,Dt.get(v.texture).__webglTexture,Dt.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let Nt=v.depthTexture;if(vt.__boundDepthTexture!==Nt){if(Nt!==null&&Dt.has(Nt)&&(v.width!==Nt.image.width||v.height!==Nt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Bt.setupDepthRenderbuffer(v)}}let Ht=v.texture;(Ht.isData3DTexture||Ht.isDataArrayTexture||Ht.isCompressedArrayTexture)&&(pt=!0);let Wt=Dt.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(Wt[F])?N=Wt[F][V]:N=Wt[F],ct=!0):v.samples>0&&Bt.useMultisampledRTT(v)===!1?N=Dt.get(v).__webglMultisampledFramebuffer:Array.isArray(Wt)?N=Wt[V]:N=Wt,D.copy(v.viewport),Y.copy(v.scissor),G=v.scissorTest}else D.copy(Mt).multiplyScalar(H).floor(),Y.copy(Pt).multiplyScalar(H).floor(),G=Qt;if(V!==0&&(N=Vo),At.bindFramebuffer(P.FRAMEBUFFER,N)&&k&&At.drawBuffers(v,N),At.viewport(D),At.scissor(Y),At.setScissorTest(G),ct){let vt=Dt.get(v.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+F,vt.__webglTexture,V)}else if(pt){let vt=Dt.get(v.texture),Ht=F;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,vt.__webglTexture,V,Ht)}else if(v!==null&&V!==0){let vt=Dt.get(v.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,vt.__webglTexture,V)}M=-1},this.readRenderTargetPixels=function(v,F,V,k,N,ct,pt,Et=0){if(!(v&&v.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let vt=Dt.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&pt!==void 0&&(vt=vt[pt]),vt){At.bindFramebuffer(P.FRAMEBUFFER,vt);try{let Ht=v.textures[Et],Wt=Ht.format,Nt=Ht.type;if(!ne.textureFormatReadable(Wt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ne.textureTypeReadable(Nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=v.width-k&&V>=0&&V<=v.height-N&&(v.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+Et),P.readPixels(F,V,k,N,dt.convert(Wt),dt.convert(Nt),ct))}finally{let Ht=A!==null?Dt.get(A).__webglFramebuffer:null;At.bindFramebuffer(P.FRAMEBUFFER,Ht)}}},this.readRenderTargetPixelsAsync=async function(v,F,V,k,N,ct,pt,Et=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let vt=Dt.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&pt!==void 0&&(vt=vt[pt]),vt)if(F>=0&&F<=v.width-k&&V>=0&&V<=v.height-N){At.bindFramebuffer(P.FRAMEBUFFER,vt);let Ht=v.textures[Et],Wt=Ht.format,Nt=Ht.type;if(!ne.textureFormatReadable(Wt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ne.textureTypeReadable(Nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let te=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,te),P.bufferData(P.PIXEL_PACK_BUFFER,ct.byteLength,P.STREAM_READ),v.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+Et),P.readPixels(F,V,k,N,dt.convert(Wt),dt.convert(Nt),0);let le=A!==null?Dt.get(A).__webglFramebuffer:null;At.bindFramebuffer(P.FRAMEBUFFER,le);let ve=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Al(P,ve,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,te),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,ct),P.deleteBuffer(te),P.deleteSync(ve),ct}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,F=null,V=0){let k=Math.pow(2,-V),N=Math.floor(v.image.width*k),ct=Math.floor(v.image.height*k),pt=F!==null?F.x:0,Et=F!==null?F.y:0;Bt.setTexture2D(v,0),P.copyTexSubImage2D(P.TEXTURE_2D,V,0,0,pt,Et,N,ct),At.unbindTexture()};let kn=P.createFramebuffer(),Ho=P.createFramebuffer();this.copyTextureToTexture=function(v,F,V=null,k=null,N=0,ct=null){ct===null&&(N!==0?(_i("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ct=N,N=0):ct=0);let pt,Et,vt,Ht,Wt,Nt,te,le,ve,me=v.isCompressedTexture?v.mipmaps[ct]:v.image;if(V!==null)pt=V.max.x-V.min.x,Et=V.max.y-V.min.y,vt=V.isBox3?V.max.z-V.min.z:1,Ht=V.min.x,Wt=V.min.y,Nt=V.isBox3?V.min.z:0;else{let q=Math.pow(2,-N);pt=Math.floor(me.width*q),Et=Math.floor(me.height*q),v.isDataArrayTexture?vt=me.depth:v.isData3DTexture?vt=Math.floor(me.depth*q):vt=1,Ht=0,Wt=0,Nt=0}k!==null?(te=k.x,le=k.y,ve=k.z):(te=0,le=0,ve=0);let ue=dt.convert(F.format),Ot=dt.convert(F.type),_e;F.isData3DTexture?(Bt.setTexture3D(F,0),_e=P.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(Bt.setTexture2DArray(F,0),_e=P.TEXTURE_2D_ARRAY):(Bt.setTexture2D(F,0),_e=P.TEXTURE_2D),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,F.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,F.unpackAlignment);let oe=P.getParameter(P.UNPACK_ROW_LENGTH),Ie=P.getParameter(P.UNPACK_IMAGE_HEIGHT),Rn=P.getParameter(P.UNPACK_SKIP_PIXELS),C=P.getParameter(P.UNPACK_SKIP_ROWS),B=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,me.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,me.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Ht),P.pixelStorei(P.UNPACK_SKIP_ROWS,Wt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Nt);let z=v.isDataArrayTexture||v.isData3DTexture,st=F.isDataArrayTexture||F.isData3DTexture;if(v.isDepthTexture){let q=Dt.get(v),at=Dt.get(F),X=Dt.get(q.__renderTarget),Ct=Dt.get(at.__renderTarget);At.bindFramebuffer(P.READ_FRAMEBUFFER,X.__webglFramebuffer),At.bindFramebuffer(P.DRAW_FRAMEBUFFER,Ct.__webglFramebuffer);for(let Ft=0;Ft<vt;Ft++)z&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Dt.get(v).__webglTexture,N,Nt+Ft),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Dt.get(F).__webglTexture,ct,ve+Ft)),P.blitFramebuffer(Ht,Wt,pt,Et,te,le,pt,Et,P.DEPTH_BUFFER_BIT,P.NEAREST);At.bindFramebuffer(P.READ_FRAMEBUFFER,null),At.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(N!==0||v.isRenderTargetTexture||Dt.has(v)){let q=Dt.get(v),at=Dt.get(F);At.bindFramebuffer(P.READ_FRAMEBUFFER,kn),At.bindFramebuffer(P.DRAW_FRAMEBUFFER,Ho);for(let X=0;X<vt;X++)z?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,q.__webglTexture,N,Nt+X):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,q.__webglTexture,N),st?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,at.__webglTexture,ct,ve+X):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,at.__webglTexture,ct),N!==0?P.blitFramebuffer(Ht,Wt,pt,Et,te,le,pt,Et,P.COLOR_BUFFER_BIT,P.NEAREST):st?P.copyTexSubImage3D(_e,ct,te,le,ve+X,Ht,Wt,pt,Et):P.copyTexSubImage2D(_e,ct,te,le,Ht,Wt,pt,Et);At.bindFramebuffer(P.READ_FRAMEBUFFER,null),At.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else st?v.isDataTexture||v.isData3DTexture?P.texSubImage3D(_e,ct,te,le,ve,pt,Et,vt,ue,Ot,me.data):F.isCompressedArrayTexture?P.compressedTexSubImage3D(_e,ct,te,le,ve,pt,Et,vt,ue,me.data):P.texSubImage3D(_e,ct,te,le,ve,pt,Et,vt,ue,Ot,me):v.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,ct,te,le,pt,Et,ue,Ot,me.data):v.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,ct,te,le,me.width,me.height,ue,me.data):P.texSubImage2D(P.TEXTURE_2D,ct,te,le,pt,Et,ue,Ot,me);P.pixelStorei(P.UNPACK_ROW_LENGTH,oe),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Ie),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Rn),P.pixelStorei(P.UNPACK_SKIP_ROWS,C),P.pixelStorei(P.UNPACK_SKIP_IMAGES,B),ct===0&&F.generateMipmaps&&P.generateMipmap(_e),At.unbindTexture()},this.copyTextureToTexture3D=function(v,F,V=null,k=null,N=0){return _i('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(v,F,V,k,N)},this.initRenderTarget=function(v){Dt.get(v).__webglFramebuffer===void 0&&Bt.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?Bt.setTextureCube(v,0):v.isData3DTexture?Bt.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?Bt.setTexture2DArray(v,0):Bt.setTexture2D(v,0),At.unbindTexture()},this.resetState=function(){R=0,I=0,A=null,At.reset(),Xt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=ae._getDrawingBufferColorSpace(t),e.unpackColorSpace=ae._getUnpackColorSpace()}};var ch={type:"change"},oc={type:"start"},hh={type:"end"},No=new xn,lh=new en,fg=Math.cos(70*Jt.DEG2RAD),Ae=new w,He=2*Math.PI,pe={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},rc=1e-6,Fo=class extends Ls{constructor(t,e=null){super(t,e),this.state=pe.NONE,this.target=new w,this.cursor=new w,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:ei.ROTATE,MIDDLE:ei.DOLLY,RIGHT:ei.PAN},this.touches={ONE:ni.ROTATE,TWO:ni.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new w,this._lastQuaternion=new sn,this._lastTargetPosition=new w,this._quat=new sn().setFromUnitVectors(t.up,new w(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Zi,this._sphericalDelta=new Zi,this._scale=1,this._panOffset=new w,this._rotateStart=new Yt,this._rotateEnd=new Yt,this._rotateDelta=new Yt,this._panStart=new Yt,this._panEnd=new Yt,this._panDelta=new Yt,this._dollyStart=new Yt,this._dollyEnd=new Yt,this._dollyDelta=new Yt,this._dollyDirection=new w,this._mouse=new Yt,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=mg.bind(this),this._onPointerDown=pg.bind(this),this._onPointerUp=gg.bind(this),this._onContextMenu=bg.bind(this),this._onMouseWheel=vg.bind(this),this._onKeyDown=yg.bind(this),this._onTouchStart=Mg.bind(this),this._onTouchMove=Sg.bind(this),this._onMouseDown=_g.bind(this),this._onMouseMove=xg.bind(this),this._interceptControlDown=Eg.bind(this),this._interceptControlUp=Tg.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ch),this.update(),this.state=pe.NONE}update(t=null){let e=this.object.position;Ae.copy(e).sub(this.target),Ae.applyQuaternion(this._quat),this._spherical.setFromVector3(Ae),this.autoRotate&&this.state===pe.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=He:n>Math.PI&&(n-=He),s<-Math.PI?s+=He:s>Math.PI&&(s-=He),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Ae.setFromSpherical(this._spherical),Ae.applyQuaternion(this._quatInverse),e.copy(this.target).add(Ae),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Ae.length();o=this._clampDistance(a*this._scale);let c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){let a=new w(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;let l=new w(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=Ae.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(No.origin.copy(this.object.position),No.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(No.direction))<fg?this.object.lookAt(this.target):(lh.setFromNormalAndCoplanarPoint(this.object.up,this.target),No.intersectPlane(lh,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>rc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>rc||this._lastTargetPosition.distanceToSquared(this.target)>rc?(this.dispatchEvent(ch),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?He/60*this.autoRotateSpeed*t:He/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Ae.setFromMatrixColumn(e,0),Ae.multiplyScalar(-t),this._panOffset.add(Ae)}_panUp(t,e){this.screenSpacePanning===!0?Ae.setFromMatrixColumn(e,1):(Ae.setFromMatrixColumn(e,0),Ae.crossVectors(this.object.up,Ae)),Ae.multiplyScalar(t),this._panOffset.add(Ae)}_pan(t,e){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Ae.copy(s).sub(this.target);let r=Ae.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(He*this._rotateDelta.x/e.clientHeight),this._rotateUp(He*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(He*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-He*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(He*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-He*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(He*this._rotateDelta.x/e.clientHeight),this._rotateUp(He*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new Yt,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function pg(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function mg(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function gg(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(hh),this.state=pe.NONE;break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function _g(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case ei.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=pe.DOLLY;break;case ei.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=pe.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=pe.ROTATE}break;case ei.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=pe.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=pe.PAN}break;default:this.state=pe.NONE}this.state!==pe.NONE&&this.dispatchEvent(oc)}function xg(i){switch(this.state){case pe.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case pe.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case pe.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function vg(i){this.enabled===!1||this.enableZoom===!1||this.state!==pe.NONE||(i.preventDefault(),this.dispatchEvent(oc),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(hh))}function yg(i){this.enabled!==!1&&this._handleKeyDown(i)}function Mg(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case ni.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=pe.TOUCH_ROTATE;break;case ni.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=pe.TOUCH_PAN;break;default:this.state=pe.NONE}break;case 2:switch(this.touches.TWO){case ni.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=pe.TOUCH_DOLLY_PAN;break;case ni.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=pe.TOUCH_DOLLY_ROTATE;break;default:this.state=pe.NONE}break;default:this.state=pe.NONE}this.state!==pe.NONE&&this.dispatchEvent(oc)}function Sg(i){switch(this._trackPointer(i),this.state){case pe.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case pe.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case pe.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case pe.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=pe.NONE}}function bg(i){this.enabled!==!1&&i.preventDefault()}function Eg(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Tg(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var uh=`
  uniform float u_time;
  uniform float uPointScale;
  uniform float uPointSizeGain;
  uniform float uEdgeDissolveStrength;
  uniform float uEdgeFlowScale;
  uniform float uMotionStrength;
  uniform float uRepelRadius;
  uniform float uRepelDepth;
  uniform float uRepelStrength;
  uniform vec3 uMouseWorld;
  uniform vec3 uMouseRayOrigin;
  uniform vec3 uMouseRayDirection;

  // Public wind controls. Tune these in createParticleTree() without rebuilding
  // geometry or moving a single particle on the CPU.
  uniform float uWindSpeed;
  uniform float uWindStrength;
  uniform float uWindFrequency;
  uniform float uWindExponent;
  uniform float uWindBaseHeight;
  uniform float uWindTopHeight;
  uniform float uWindTrunkRadius;
  uniform float uWindOuterRadius;

  attribute float aSize;
  attribute float aPhase;
  attribute float aBrightness;
  attribute float aWindMask;
  attribute float aSurface;
  attribute vec3 aDrift;
  attribute vec3 aColor;

  varying float vBrightness;
  varying float vSurface;
  varying float vPhase;
  varying float vDepthFlow;
  varying float vEdgeVisibility;
  varying float vEdgeFlow;
  varying vec3 vColor;

  void main() {
    vec3 originalPosition = position;

    // WIND GRADIENT ---------------------------------------------------------
    // Height and X/Z radius are normalized independently, combined, and then
    // raised to an exponent. Motion collapses near the center trunk and grows
    // rapidly toward high outer terminals. aWindMask is exactly zero for roots
    // and main-trunk grains, which makes them immutable anchors.
    float height01 = smoothstep(
      uWindBaseHeight,
      uWindTopHeight,
      originalPosition.y
    );
    float radial01 = smoothstep(
      uWindTrunkRadius,
      uWindOuterRadius,
      length(originalPosition.xz)
    );
    float gradientBase = clamp(height01 * 0.62 + radial01 * 0.72, 0.0, 1.0);
    // aWindMask 0.12 is reserved for roots so their exposed shells can flow
    // without making the root structure sway. Branch wind begins above 0.24.
    float windStructureMask = smoothstep(0.22, 0.46, aWindMask);
    float windGradient = pow(gradientBase, uWindExponent) * windStructureMask;

    // FLUID WIND ------------------------------------------------------------
    // Two broad spatial waves replace the two full 3D simplex evaluations that
    // previously ran for every particle, every frame. The result is still a
    // coherent volumetric cross-flow, at a small fraction of the GPU cost.
    float windTime = u_time * uWindSpeed;
    vec3 waveCoordinate = originalPosition * uWindFrequency;
    float primaryFlow = sin(
      dot(waveCoordinate, vec3(0.72, 1.11, 0.46)) + windTime * 0.72
    );
    float crossFlow = sin(
      dot(waveCoordinate, vec3(1.04, -0.38, 0.86)) - windTime * 0.51
    );
    float gust = 0.82 + 0.18 * sin(windTime * 0.37 + originalPosition.y * 0.22);
    vec3 fluidDirection = vec3(
      primaryFlow,
      crossFlow * 0.24,
      (crossFlow - primaryFlow * 0.35) * 0.62
    );
    vec3 windOffset = fluidDirection
      * uWindStrength
      * windGradient
      * gust;

    // DEPTH-LAYER FLOW ------------------------------------------------------
    // The reference animation behaves like a depth map slowly breathing apart:
    // contour grains drift more than the dark core, but never lose the form.
    float depthFlow = 0.5 + 0.5 * sin(
      originalPosition.y * 0.92
      + originalPosition.z * 1.38
      + primaryFlow * 1.75
      + aPhase * 6.28318
      - u_time * 0.44
    );
    vec3 encodedDriftDirection = normalize(aDrift + vec3(0.0001));
    float depthFlowStrength = mix(0.004, 0.026, windStructureMask)
      * mix(0.32, 1.0, aSurface)
      * (0.28 + depthFlow * 0.72);
    windOffset += encodedDriftDirection * depthFlowStrength;

    // EDGE RELEASE ---------------------------------------------------------
    // aWindMask separates the generated structures without another buffer:
    // trunk is 0, roots are 0.12, branches are 0.39-0.84, and leaves are 1.
    // A broad exposed-shell band makes the stream readable over the complete
    // tree. Structure-specific travel remains trunk < roots < branches < leaves.
    float contourSurfaceMask = smoothstep(0.68, 0.93, aSurface);
    float trunkContourMask = 1.0 - smoothstep(0.03, 0.08, aWindMask);
    float rootContourMask = smoothstep(0.06, 0.1, aWindMask)
      * (1.0 - smoothstep(0.16, 0.22, aWindMask));
    float branchContourMask = smoothstep(0.24, 0.46, aWindMask)
      * (1.0 - smoothstep(0.86, 0.96, aWindMask));
    float leafContourMask = smoothstep(0.94, 1.0, aWindMask);
    float branchOrLeafContour = max(branchContourMask, leafContourMask);
    float structureContourMask = max(
      max(trunkContourMask, rootContourMask),
      branchOrLeafContour
    );
    float edgeReleaseMask = contourSurfaceMask
      * structureContourMask
      * uEdgeDissolveStrength;
    vEdgeVisibility = 1.0;
    vEdgeFlow = 0.0;
    float edgePointGain = 1.0;
    if (edgeReleaseMask > 0.001) {
      // Uniformly distributed phases form a continuous hourglass-like stream:
      // while older contour grains accelerate outward and vanish, other grains
      // complete their invisible wrap and refill the exact source edge quickly.
      float edgeCycle = fract(aPhase + u_time * 0.22);
      float spawnVisibility = smoothstep(0.0, 0.06, edgeCycle);
      float travelProgress = smoothstep(0.02, 0.96, edgeCycle);
      float fadeVisibility = 1.0 - smoothstep(0.84, 0.995, edgeCycle);
      float filament = sin(
        u_time * 1.15
        + aPhase * 43.0
        + originalPosition.y * 0.78
        + originalPosition.x * 0.31
      );
      float verticalOutward = originalPosition.y - uWindBaseHeight;
      verticalOutward *= verticalOutward < 0.0 ? 0.28 : 0.18;
      vec3 outwardDirection = normalize(vec3(
        originalPosition.x,
        verticalOutward,
        originalPosition.z
      ) + encodedDriftDirection * 0.12 + vec3(0.0001));
      float rootToBranchDistance = mix(
        0.42,
        0.62,
        smoothstep(0.2, 0.5, aWindMask)
      );
      float trunkToRootDistance = mix(
        0.30,
        rootToBranchDistance,
        rootContourMask
      );
      float nonLeafFlowDistance = mix(
        trunkToRootDistance,
        rootToBranchDistance,
        smoothstep(0.22, 0.46, aWindMask)
      );
      float flowDistanceLimit = mix(
        nonLeafFlowDistance,
        1.02,
        leafContourMask
      );
      float flowDistance = travelProgress * travelProgress * flowDistanceLimit * uEdgeFlowScale;
      vec3 edgeReleaseOffset = outwardDirection * flowDistance;
      edgeReleaseOffset += encodedDriftDirection
        * filament
        * mix(0.012, 0.034, travelProgress);
      windOffset += edgeReleaseOffset * edgeReleaseMask;
      vEdgeVisibility = mix(
        1.0,
        spawnVisibility * fadeVisibility,
        edgeReleaseMask
      );
      float flowEmphasis = edgeReleaseMask
        * spawnVisibility
        * fadeVisibility
        * smoothstep(0.08, 0.52, travelProgress);
      edgePointGain = 1.0 + flowEmphasis * 0.58;
      vEdgeFlow = flowEmphasis;
    }

    windOffset *= uMotionStrength;
    vec3 windPosition = originalPosition + windOffset;
    vec4 worldPosition = modelMatrix * vec4(windPosition, 1.0);

    // MOUSE REPULSION -------------------------------------------------------
    // The uniform branch lets idle frames skip all ray-distance work. During
    // interaction, cheap phase hashes replace seven per-particle sine calls.
    vec3 mouseRepulsionOffset = vec3(0.0);
    if (uRepelStrength > 0.001) {
      vec3 safeRayDirection = normalize(uMouseRayDirection + vec3(0.00001));
      vec3 fromRayOrigin = worldPosition.xyz - uMouseRayOrigin;
      float rayT = max(dot(fromRayOrigin, safeRayDirection), 0.0);
      vec3 closestRayPoint = uMouseRayOrigin + safeRayDirection * rayT;
      vec3 away = worldPosition.xyz - closestRayPoint;
      float mouseDistance = length(away);
      float depthDistance = distance(closestRayPoint, uMouseWorld);
      float depthMask = 1.0 - smoothstep(
        uRepelDepth * 0.42,
        uRepelDepth,
        depthDistance
      );
      float phaseHash = fract(aPhase * 17.31 + 0.37) * 2.0 - 1.0;
      float irregularity = phaseHash * uRepelRadius * 0.085;
      float repel = 1.0 - smoothstep(
        0.0,
        uRepelRadius,
        mouseDistance + irregularity
      );
      repel = pow(max(repel, 0.0), 1.45) * depthMask * 0.72;

      vec3 hashFlow = vec3(
        fract(aPhase * 13.17 + 0.11),
        fract(aPhase * 29.73 + 0.47),
        fract(aPhase * 47.91 + 0.79)
      ) * 2.0 - 1.0;
      vec3 localFlow = normalize(aDrift * 2.5 + hashFlow * 0.22);
      vec3 radialDirection = normalize(away + localFlow * 0.035 + vec3(0.0001));
      vec3 tangentDirection = normalize(
        cross(safeRayDirection, radialDirection) + localFlow * 0.08
      );
      vec3 magneticDirection = normalize(
        radialDirection * 0.42
        + localFlow * 0.46
        + tangentDirection * phaseHash * 0.14
      );
      float interactionMask = mix(0.4, 1.0, aWindMask);
      mouseRepulsionOffset = magneticDirection
        * repel
        * uRepelRadius
        * 0.28
        * uRepelStrength
        * interactionMask;
    }

    // Final composition used by gl_Position:
    // originalPosition + windOffset (local) + mouseRepulsionOffset (world).
    vec3 finalWorldPosition = worldPosition.xyz + mouseRepulsionOffset;
    vec4 viewPosition = viewMatrix * vec4(finalWorldPosition, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    float perspective = uPointScale / max(1.0, -viewPosition.z);
    float decodedSize = mix(0.56, 1.18, aSize) * mix(0.9, 1.1, aSurface);
    // Preserve visible grains during the close camera flight instead of
    // clamping every zoomed particle to the old 1.55 px ceiling.
    float closeUpCeiling = mix(1.82, 2.28, aSize);
    gl_PointSize = clamp(
      decodedSize * perspective * uPointSizeGain * edgePointGain,
      0.68 * uPointSizeGain,
      closeUpCeiling * uPointSizeGain * edgePointGain
    );
    vBrightness = aBrightness;
    vSurface = aSurface;
    vPhase = aPhase;
    vDepthFlow = depthFlow;
    vColor = aColor;
  }
`,dh=`
  uniform float uOpacity;
  uniform float uDensityGain;

  varying float vBrightness;
  varying float vSurface;
  varying float vPhase;
  varying float vDepthFlow;
  varying float vEdgeVisibility;
  varying float vEdgeFlow;
  varying vec3 vColor;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float radius = length(centered);
    if (radius > 0.5) discard;

    // A compact opaque core and a narrow one-pixel falloff keep each grain
    // distinct. The previous broad falloff blended distant foliage into haze.
    float edge = 1.0 - smoothstep(0.4, 0.5, radius);
    float core = 1.0 - smoothstep(0.08, 0.34, radius);
    float pin = 1.0 - smoothstep(0.0, 0.12, radius);
    float shell = pow(clamp(vSurface, 0.0, 1.0), 0.72);
    float depthShimmer = 0.88 + vDepthFlow * 0.12;

    // Preserve the golden-brown gradient in close-up. Surface grains receive
    // only a warm amber lift; the video reference contributes motion, not color.
    vec3 warmHighlight = vec3(1.0, 0.64, 0.2);
    vec3 stardustColor = mix(vColor, warmHighlight, shell * 0.22);
    float microVariation = 0.94 + 0.08 * fract(vPhase * 17.13 + 0.37);
    stardustColor *= microVariation;

    // Denser geometry now carries the silhouette. A restrained core lift makes
    // grains legible without restoring the old cotton-like additive bloom.
    float opacityWeight = mix(0.7, 1.0, shell);
    float alpha = (0.13 + core * 0.2 + pin * 0.15)
      * edge
      * vBrightness
      * opacityWeight
      * depthShimmer
      * uDensityGain
      * uOpacity
      * vEdgeVisibility;
    // Released contour grains receive a restrained size, brightness, and alpha
    // lift so their outward travel reads from the full-tree camera distance.
    alpha *= 1.0 + vEdgeFlow * 0.78;
    stardustColor *= (0.88 + pin * 0.22) * (1.0 + vEdgeFlow * 0.22);

    gl_FragColor = vec4(stardustColor, alpha);
    #include <colorspace_fragment>
  }
`;var Ge=Object.freeze({seed:130671,trunkSegments:5,trunkSegmentLength:1.02,sideBranchDepth:5,crownBranchDepth:5,rootCount:7,rootDepth:3,branchLengthDecay:.76,branchRadiusDecay:.7,rootLengthDecay:.7,forkAngleMin:Jt.degToRad(24),forkAngleMax:Jt.degToRad(43)}),fh=Object.freeze({seedling:Object.freeze({botanicalModel:"dicot-seedling"}),growing:Object.freeze({botanicalModel:"branching-tree",trunkSegments:4,trunkSegmentLength:.9,sideBranchDepth:3,crownBranchDepth:3,sideBranches:!0,crownCount:2,rootCount:5,rootDepth:2}),mature:Object.freeze({botanicalModel:"branching-tree",trunkSegments:Ge.trunkSegments,trunkSegmentLength:Ge.trunkSegmentLength,sideBranchDepth:Ge.sideBranchDepth,crownBranchDepth:Ge.crownBranchDepth,rootCount:Ge.rootCount,rootDepth:Ge.rootDepth,sideBranches:!0,crownCount:2})});function wg(i){return fh[i]||fh.mature}var Ag=new $t("#4a1f0b"),ph=new $t("#9b4e1c"),Rg=new $t("#d08a2f"),xh=new $t("#d77a1e"),Cg=new $t("#e6a13a"),Pg=new $t("#ffd36b"),Ig=new $t("#8a4d26"),Dg=2.5,Lg=.42,Ug=.82,Ng=1.18,Fg=1.24,mh=1.04,vh=32e4;function Og(i=Ge.seed){let t=i>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Gt(i,t,e){return t+(e-t)*i()}function ri(i){let t=Math.max(i(),1e-7),e=Math.max(i(),1e-7);return Math.sqrt(-2*Math.log(t))*Math.cos(2*Math.PI*e)}function oi(i){let t=i.clone().normalize(),e=Math.abs(t.y)<.9?new w(0,1,0):new w(1,0,0),n=new w().crossVectors(t,e).normalize(),s=new w().crossVectors(t,n).normalize();return{tangent:t,normal:n,binormal:s}}function wn(i,t,e,n,s,r,o,a){let{tangent:c,normal:l,binormal:h}=oi(t),u=Gt(a,-.13,.13)*e,p=Gt(a,-.11,.11)*e,f=i.clone().addScaledVector(c,e).addScaledVector(l,u).addScaledVector(h,p),g=i.clone().addScaledVector(c,e*.32).addScaledVector(l,u*.12),x=i.clone().addScaledVector(c,e*.72).addScaledVector(l,u*.78).addScaledVector(h,p*.55);return{curve:new As(i.clone(),g,x,f),radiusStart:n,radiusEnd:s,depth:r,kind:o,grainPhase:a()*Math.PI*2}}function cc(i,t,e,n,s,r,o,a){let c=wn(t,e,n,s,s*Ge.branchRadiusDecay,r,"branch",a);i.segments.push(c);let l=c.curve.getPoint(1),h=c.curve.getTangent(1).normalize();if(r>=o){i.terminals.push({position:l,direction:h,depth:r});return}let{normal:u,binormal:p}=oi(h),f=a()*Math.PI*2,g=Gt(a,Ge.forkAngleMin,Ge.forkAngleMax);for(let x=0;x<2;x+=1){let m=f+x*Math.PI+Gt(a,-.18,.18),d=u.clone().multiplyScalar(Math.cos(m)).addScaledVector(p,Math.sin(m)).normalize(),E=h.clone().applyAxisAngle(d,g*Gt(a,.84,1.08)).addScaledVector(new w(0,1,0),Math.max(.03,.13-r*.02)).normalize();cc(i,l,E,n*Ge.branchLengthDecay*Gt(a,.96,1.04),s*Ge.branchRadiusDecay,r+1,o,a)}}function yh(i,t,e,n,s,r,o,a){let c=wn(t,e,n,s,s*.66,r,"root",a);if(i.segments.push(c),r>=o)return;let l=c.curve.getPoint(1),h=c.curve.getTangent(1).normalize(),{normal:u,binormal:p}=oi(h),f=a()*Math.PI*2;for(let g=0;g<2;g+=1){let x=f+g*Math.PI,m=u.clone().multiplyScalar(Math.cos(x)).addScaledVector(p,Math.sin(x)).normalize(),d=h.clone().applyAxisAngle(m,Gt(a,.18,.38)).add(new w(0,-.12,0)).normalize();yh(i,l,d,n*Ge.rootLengthDecay,s*.66,r+1,o,a)}}function Oo(i,t,e){let n=t.direction.clone().normalize(),s=(t.normal||new w(0,0,1)).clone();s.addScaledVector(n,-s.dot(n)),s.lengthSq()<.001&&s.copy(oi(n).normal),s.normalize();let r=new w().crossVectors(s,n).normalize(),o=wn(t.attachment,n,t.petioleLength,t.role==="cotyledon"?.018:.013,.004,0,"branch",e);o.botanicalPart="petiole",i.segments.push(o);let c=o.curve.getPoint(1).clone().addScaledVector(n,t.length*.48);return{index:t.index,terminalIndex:t.index,chapter:null,isChapterCanopy:!1,botanicalRole:t.role,center:c,forward:n,side:r,normal:s,length:t.length,width:t.width,widthPeak:t.role==="cotyledon"?.5:.41,baseExponent:t.role==="cotyledon"?.62:.88,tipExponent:t.role==="cotyledon"?.72:1.5,sideAsymmetry:t.role==="cotyledon"?1:Gt(e,.97,1.03),toothCount:t.role==="cotyledon"?0:9,serrationAmplitude:t.role==="cotyledon"?0:.012,phase:0,labelAnchor:c.clone().addScaledVector(n,t.length*.3).addScaledVector(r,t.width*.68)}}function Bg(i){let t={segments:[],terminals:[]},e=new w(0,-.26,0),n=wn(e,new w(.025,1,.012),.72,.11,.072,0,"trunk",i);n.botanicalPart="hypocotyl",t.segments.push(n);let s=n.curve.getPoint(1),r=wn(s,new w(-.018,1,.01),.44,.07,.038,1,"trunk",i);r.botanicalPart="epicotyl",t.segments.push(r);let o=r.curve.getPoint(1),a=wn(e,new w(.018,-1,-.012),1.34,.105,.025,0,"root",i);a.botanicalPart="radicle",t.segments.push(a);for(let l=0;l<6;l+=1){let h=.2+l*.115,u=a.curve.getPointAt(h),p=l%2===0?-1:1,f=l*1.73,g=new w(p*Gt(i,.72,.94),Gt(i,-.44,-.22),Math.sin(f)*.34).normalize(),x=wn(u,g,Gt(i,.38,.62)*(1-l*.045),Gt(i,.026,.038),.008,1,"root",i);x.botanicalPart="lateral-root",t.segments.push(x)}let c=[Oo(t,{index:0,attachment:s,direction:new w(-1,.2,.055),normal:new w(.02,.04,1),petioleLength:.15,length:.76,width:.235,role:"cotyledon"},i),Oo(t,{index:1,attachment:s,direction:new w(1,.2,-.055),normal:new w(-.02,.04,1),petioleLength:.15,length:.76,width:.235,role:"cotyledon"},i),Oo(t,{index:2,attachment:o,direction:new w(-.42,.91,.11),normal:new w(.08,.03,1),petioleLength:.09,length:.64,width:.17,role:"true-leaf"},i),Oo(t,{index:3,attachment:o,direction:new w(.42,.91,-.11),normal:new w(-.08,.03,1),petioleLength:.09,length:.64,width:.17,role:"true-leaf"},i)];return t.terminals=c.map(l=>({position:l.center.clone().addScaledVector(l.forward,l.length*.5),direction:l.forward.clone(),depth:0})),{skeleton:t,leaves:c}}function zg(i,t){let e={segments:[],terminals:[]},n=new w(0,-2.05,0),s=n.clone(),r=new w(.04,1,.02).normalize(),o=.38,a=t.trunkSegmentLength;for(let l=0;l<t.trunkSegments;l+=1){let h=wn(s,r,a,o,o*.84,l,"trunk",i);if(e.segments.push(h),s=h.curve.getPoint(1),r=h.curve.getTangent(1).normalize(),l>=1&&t.sideBranches!==!1){let{normal:u,binormal:p}=oi(r),f=l*Math.PI*(3-Math.sqrt(5)),g=u.clone().multiplyScalar(Math.cos(f)).addScaledVector(p,Math.sin(f)).normalize(),x=r.clone().applyAxisAngle(g,Gt(i,.58,.82)).normalize();cc(e,s,x,a*Gt(i,.98,1.18),o*.62,0,t.sideBranchDepth,i)}o*=.84,a*=.92}let c=oi(r);for(let l=0;l<(t.crownCount||2);l+=1){let h=r.clone().applyAxisAngle(c.normal,l===0?.48:-.48).normalize();cc(e,s,h,a,o,0,t.crownBranchDepth,i)}for(let l=0;l<t.rootCount;l+=1){let h=l/t.rootCount*Math.PI*2+Gt(i,-.16,.16),u=new w(Math.cos(h)*.9,Gt(i,-.6,-.38),Math.sin(h)*.64).normalize();yh(e,n,u,Gt(i,.7,.94),.17,0,t.rootDepth,i)}return e}function kg(i,t){if(!t.length||!i.length)return new Map;if(t.length>i.length)return new Map;let e=[i.reduce((n,s)=>s.position.y>n.position.y?s:n)];for(;e.length<t.length;){let n=null,s=-1/0;for(let r of i){if(e.includes(r))continue;let o=Math.min(...e.map(a=>{let c=r.position.x-a.position.x,l=r.position.y-a.position.y,h=r.position.z-a.position.z;return c*c+l*l+h*h*.22}));o>s&&(s=o,n=r)}e.push(n)}return e.sort((n,s)=>n.position.y-s.position.y),new Map(e.map((n,s)=>[n,t[s]]))}function Vg(i,t){if(!t.length||!i.length)return[];let e=[],n=Math.min(i.length,t.length),s=0;for(let r=1;r<i.length;r+=1)i[r].center.y>i[s].center.y&&(s=r);for(e.push(s);e.length<n;){let r=-1,o=-1/0;for(let a=0;a<i.length;a+=1){if(e.includes(a))continue;let c=i[a].center,l=Math.min(...e.map(h=>{let u=i[h].center,p=c.x-u.x,f=c.y-u.y,g=c.z-u.z;return p*p+f*f+g*g*.28}));l>o&&(o=l,r=a)}if(r<0)break;e.push(r)}return e.sort((r,o)=>i[o].center.y-i[r].center.y),t.map((r,o)=>{let a=i[e[o%e.length]],c=Math.floor(o/e.length),l=o*Math.PI*(3-Math.sqrt(5)),h=c>0?new w(Math.cos(l),.22,Math.sin(l)).multiplyScalar(.08*c):new w;return{...a,chapter:r,center:a.center.clone().add(h),labelAnchor:a.labelAnchor.clone().add(h)}})}function Hg(i,t,e){let{terminals:n}=i,s=kg(n,t),r=new w(0,1,0),o=Math.PI*(3-Math.sqrt(5)),a=Math.min(...n.map(u=>u.position.y)),c=Math.max(...n.map(u=>u.position.y)),l=1/Math.max(.001,c-a),h=[];return n.forEach((u,p)=>{let f=s.get(u)??null;if(!f&&e()<.12)return;let g=oi(u.direction),x=e()<.24?2:1;for(let m=0;m<x;m+=1){let d=u.direction.clone().addScaledVector(g.normal,Gt(e,-.16,.16)).addScaledVector(g.binormal,Gt(e,-.13,.13)).addScaledVector(r,Gt(e,.015,.075)).normalize();if(m>0){let I=g.normal.clone().multiplyScalar(Math.cos(p*1.71)).addScaledVector(g.binormal,Math.sin(p*1.71)).normalize();d.applyAxisAngle(I,Gt(e,.27,.46)).normalize()}let E=Gt(e,.42,.7)*(m===0?1:Gt(e,.58,.76)),b=wn(u.position,d,E,m===0?.019:.014,.006,u.depth+1,"branch",e);i.segments.push(b);let S=m===0?f?6+Math.floor(e()*4):4+Math.floor(e()*4):3+Math.floor(e()*2),U=Math.min(S-1,Math.floor(S*.64)),R=e()*Math.PI*2+p*.07+m*1.63;for(let I=0;I<S;I+=1){let A=f&&m===0&&I===U?f:null,M=Jt.clamp((I+.45+Gt(e,-.12,.12))/(S+.35),.06,.94),y=b.curve.getPointAt(M),D=b.curve.getTangentAt(M).normalize(),Y=oi(D),G=R+I*o+Gt(e,-.15,.15),$=Y.normal.clone().multiplyScalar(Math.cos(G)).addScaledVector(Y.binormal,Math.sin(G)).normalize(),et=$.clone().multiplyScalar(.52).addScaledVector(D,.46).addScaledVector(r,.08+Gt(e,-.08,.08)).normalize(),W=Gt(e,.27,.42)*Jt.lerp(.9,1.08,M)*(A?1.03:1),K=W*Gt(e,.23,.29),H=Jt.clamp((y.y-a)*l,0,1),lt;H<.34?lt=Gt(e,12,28):H<.68?lt=Gt(e,25,45):lt=Gt(e,42,65),lt=Jt.degToRad(lt+Gt(e,-11,11));let ht=r.clone().multiplyScalar(Math.cos(lt)).addScaledVector($,Math.sin(lt));ht.addScaledVector(et,-ht.dot(et)),ht.lengthSq()<.001&&ht.copy(Y.binormal),ht.normalize();let Mt=new w().crossVectors(ht,et).normalize(),Pt=Gt(e,.035,.065),Qt=wn(y,et,Pt,.006,.0025,u.depth+2,"branch",e);i.segments.push(Qt);let rt=Qt.curve.getPoint(1).clone().addScaledVector(et,W*.49);h.push({index:h.length,terminalIndex:p,chapter:A,isChapterCanopy:!!f,center:rt,forward:et,side:Mt,normal:ht,length:W,width:K,widthPeak:Gt(e,.38,.46),baseExponent:Gt(e,.78,.96),tipExponent:Gt(e,1.18,1.45),sideAsymmetry:Gt(e,.95,1.05),toothCount:10+Math.floor(e()*7),serrationAmplitude:.015,phase:e()*Math.PI*2,labelAnchor:rt.clone().addScaledVector(et,W*.34).addScaledVector(Mt,K*.74)})}}}),h}function lc(){let i=navigator.deviceMemory??4,t=navigator.hardwareConcurrency??4;return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||i<=4||t<=4?12e4:i<=8||t<=8?22e4:vh}function Gg(i){return{positions:new Float32Array(i*3),drifts:new Int8Array(i*3),colors:new Uint8Array(i*3),sizes:new Uint8Array(i),phases:new Uint8Array(i),brightness:new Uint8Array(i),windMasks:new Uint8Array(i),surfaces:new Uint8Array(i)}}function ac(i,t,e,n,s={}){let r=t*3;i.positions[r]=e.x,i.positions[r+1]=e.y,i.positions[r+2]=e.z;let o=Gt(n,-1,1),a=Gt(n,-1,1),c=Gt(n,-1,1),l=Math.hypot(o,a,c)||1,h=127*(s.drift??.35)/Dg/l;o*=h,a*=h,c*=h,i.drifts[r]=Math.round(o),i.drifts[r+1]=Math.round(a),i.drifts[r+2]=Math.round(c);let u=s.color??xh;i.colors[r]=Math.round(Jt.clamp(u.r,0,1)*255),i.colors[r+1]=Math.round(Jt.clamp(u.g,0,1)*255),i.colors[r+2]=Math.round(Jt.clamp(u.b,0,1)*255);let p=Gt(n,s.sizeMin??.62,s.sizeMax??1.18);i.sizes[t]=Math.round(Jt.clamp((p-Lg)/Ug,0,1)*255),i.phases[t]=Math.round(n()*255);let f=Gt(n,s.brightnessMin??.42,s.brightnessMax??1);i.brightness[t]=Math.round(Jt.clamp(f,0,1)*255),i.windMasks[t]=Math.round(Jt.clamp(s.windMask??1,0,1)*255),i.surfaces[t]=Math.round(Jt.clamp(s.surface??.4,0,1)*255)}function Wg(){return{tangent:new w,helper:new w,normal:new w,binormal:new w}}function gh(i,t,e,n){let s=t();i.curve.getPointAt(s,e);let{tangent:r,helper:o,normal:a,binormal:c}=n;i.curve.getTangentAt(s,r).normalize(),o.set(0,1,0),Math.abs(r.y)>=.9&&o.set(1,0,0),a.crossVectors(r,o).normalize(),c.crossVectors(r,a).normalize();let l=Jt.lerp(i.radiusStart,i.radiusEnd,s),h=t()<.72?Gt(t,.76,1):Math.sqrt(t())*.76,u=.9+Math.sin(s*22+i.grainPhase)*.1,p=l*h*u,f=t()*Math.PI*2+s*5;return e.addScaledVector(a,Math.cos(f)*p).addScaledVector(c,Math.sin(f)*p),t()<.045&&e.addScaledVector(a,ri(t)*l*.35).addScaledVector(c,ri(t)*l*.35),h}function _h(i,t,e){let n=t(),s=0,r;if(n<.08)s=1,r=Gt(t,.02,.98);else if(n<.2)s=2,r=Gt(t,.01,.995);else if(n<.3){s=3;let E=Math.floor(t()*5),b=t();r=.2+E*.125+b*.055}else r=(t()+t())*.5;let o=(r-.5)*i.length,a=r<=i.widthPeak?Math.pow(r/i.widthPeak,i.baseExponent):Math.pow((1-r)/(1-i.widthPeak),i.tipExponent),c=Number.isFinite(i.serrationAmplitude)?i.serrationAmplitude:.015,l=1+Math.sin(r*Math.PI*2*i.toothCount+i.phase)*c,h=i.width*a*l,u=h*i.sideAsymmetry,p=h*(2-i.sideAsymmetry),f;if(s===1)f=ri(t)*Math.max(h,i.width*.08)*.025;else if(s===2){let E=t()<.5?-1:1,b=E>0?u:p;f=E*b*Gt(t,.982,1.008)}else if(s===3){let E=t()<.5?-1:1,b=t(),S=E>0?u:p;f=E*S*b*.88+ri(t)*i.width*.008}else f=Gt(t,-p,u);let g=f>=0?u:p,x=g>1e-4?f/g:0,m=Math.sin(Math.PI*r)*x*i.width*.05,d=ri(t)*.0025;return e.copy(i.center).addScaledVector(i.forward,o).addScaledVector(i.side,f).addScaledVector(i.normal,m+d),s}function Xg(i,t,e,n,s){let r=Gg(e),o=Math.floor(e*(s==="seedling"?.4:.42)),a=Math.floor(e*.997),c=new w,l=new $t,h=Wg(),u=0,p=new rn;for(let A of i.segments)p.expandByPoint(A.curve.getPoint(0)),p.expandByPoint(A.curve.getPoint(.5)),p.expandByPoint(A.curve.getPoint(1));for(let A of t)for(let M of[-1,1])for(let y of[-1,1])p.expandByPoint(A.center.clone().addScaledVector(A.forward,A.length*.54*M).addScaledVector(A.side,A.width*1.08*y));p.expandByScalar(s==="seedling"?.2:.28);let f=1/Math.max(.001,p.max.y-p.min.y),g=i.segments.map(A=>{let M=A.botanicalPart==="radicle"?1.75:A.kind==="trunk"?1.5:A.kind==="root"?1.15:1;return A.curve.getLength()*(A.radiusStart+A.radiusEnd)*M}),x=g.reduce((A,M)=>A+M,0);i.segments.forEach((A,M)=>{let y=M===i.segments.length-1?o:u+Math.max(42,Math.floor(o*g[M]/x));for(;u<Math.min(y,o);){let D=gh(A,n,c,h),Y=Jt.clamp((c.y-p.min.y)*f,0,1);A.kind==="root"?l.lerpColors(Ag,ph,Gt(n,.05,.24)):l.lerpColors(ph,Rg,Math.pow(Y,.82)),ac(r,u,c,n,{drift:A.kind==="root"?.18:.26,sizeMin:A.botanicalPart==="radicle"?.74:.68,sizeMax:A.kind==="trunk"?1.22:1.08,brightnessMin:A.kind==="root"?.28:.32,brightnessMax:A.kind==="root"?.64:A.kind==="trunk"?.8:.82,color:l,surface:Jt.clamp((D-.42)/.58,.08,1),windMask:A.kind==="root"?.12:A.kind==="branch"?Math.min(.84,.28+A.depth*.11):0}),u+=1}});let m=a-o,d=t.map(A=>A.length*A.width),E=d.reduce((A,M)=>A+M,0),b=new Map;t.forEach((A,M)=>{A.isChapterCanopy&&(b.has(A.terminalIndex)||b.set(A.terminalIndex,[]),b.get(A.terminalIndex).push(M))});let S=Math.min(7e4,Math.floor(m*.027)),U=Math.max(0,m-S*b.size),R=d.map(A=>Math.floor(U*A/E));for(let A of b.values()){let M=A.reduce((y,D)=>y+d[D],0);for(let y of A)R[y]+=Math.floor(S*d[y]/M)}let I=m-R.reduce((A,M)=>A+M,0);for(let A=0;I>0;A=(A+1)%t.length)R[A]+=1,I-=1;for(t.forEach((A,M)=>{let y=u+R[M];for(;u<Math.min(y,a);){let D=_h(A,n,c),Y=D>0,G=Jt.clamp(n()*.74,0,.84);l.lerpColors(A.botanicalRole==="cotyledon"?Cg:xh,Pg,G),ac(r,u,c,n,{drift:s==="seedling"?.28:.42,sizeMin:Y?.62:.54,sizeMax:Y?1:.9,brightnessMin:A.isChapterCanopy?Y?.2:.16:Y?.56:.48,brightnessMax:A.isChapterCanopy?Y?.42:.34:Y?.92:.8,color:l,surface:D===2?1:D===1?.88:D===3?.72:.24,windMask:1}),u+=1}});u<e;){if(n()<.68){let y=t[Math.floor(n()*t.length)];_h(y,n,c)}else{let y=i.segments[Math.floor(n()*i.segments.length)];gh(y,n,c,h)}let A=n()<.02?1.45:1,M=Gt(n,.015,.085)*A;c.x+=ri(n)*M,c.y+=ri(n)*M*.72,c.z+=ri(n)*M,ac(r,u,c,n,{drift:1.25,sizeMin:.42,sizeMax:.66,brightnessMin:.08,brightnessMax:.2,color:Ig,surface:.08,windMask:1}),u+=1}return{attributes:r,bounds:p}}function hc(i,t,e={}){let n=Number(e.seed),s=Og(Number.isFinite(n)?n:Ge.seed),r=e.growthStage==="seedling"||e.growthStage==="growing"?e.growthStage:"mature",o=wg(r),a=o.botanicalModel==="dicot-seedling"?Bg(s):null,c=a?.skeleton||zg(s,o),l=a?.leaves||Hg(c,[],s),h=Vg(l,i),u=Number(e.particleBudget),p=Number.isFinite(u)?Math.min(vh,Math.max(2e3,Math.round(u))):lc(),{attributes:f,bounds:g}=Xg(c,l,p,s,r),x=new on;x.setAttribute("position",new Pe(f.positions,3)),x.setAttribute("aDrift",new xs(f.drifts,3,!0)),x.setAttribute("aColor",new yn(f.colors,3,!0)),x.setAttribute("aSize",new yn(f.sizes,1,!0)),x.setAttribute("aPhase",new yn(f.phases,1,!0)),x.setAttribute("aBrightness",new yn(f.brightness,1,!0)),x.setAttribute("aWindMask",new yn(f.windMasks,1,!0)),x.setAttribute("aSurface",new yn(f.surfaces,1,!0)),x.computeBoundingSphere();let m=Math.max(.001,g.max.y-g.min.y),d=Math.max(Math.abs(g.min.x),Math.abs(g.max.x),Math.abs(g.min.z),Math.abs(g.max.z),1),E={u_time:{value:0},uPointScale:{value:17*t.getPixelRatio()},uPointSizeGain:{value:r==="seedling"?Fg:Ng},uEdgeDissolveStrength:{value:Number.isFinite(Number(e.edgeDissolveStrength))?Jt.clamp(Number(e.edgeDissolveStrength),0,1):1},uEdgeFlowScale:{value:r==="seedling"?.48:r==="growing"?.74:1},uMotionStrength:{value:Number.isFinite(Number(e.motionStrength))?Jt.clamp(Number(e.motionStrength),0,1):1},uRepelRadius:{value:.52},uRepelDepth:{value:1.25},uRepelStrength:{value:0},uMouseWorld:{value:new w(1e3,1e3,1e3)},uMouseRayOrigin:{value:new w(1e3,1e3,1e3)},uMouseRayDirection:{value:new w(0,0,-1)},uOpacity:{value:Number.isFinite(Number(e.opacity))?Number(e.opacity):0},uDensityGain:{value:r==="seedling"?1.35:Jt.clamp(Math.sqrt(125e4/p),1.35,2)},uWindSpeed:{value:.24},uWindStrength:{value:.11},uWindFrequency:{value:.42},uWindExponent:{value:2.05},uWindBaseHeight:{value:g.min.y+m*.28},uWindTopHeight:{value:g.max.y},uWindTrunkRadius:{value:.48},uWindOuterRadius:{value:d}},b=new Je({uniforms:E,vertexShader:uh,fragmentShader:dh,transparent:!0,depthWrite:!1,depthTest:!0,blending:Us,toneMapped:!1}),S=new Ts(x,b);return S.name="Algorithmic stardust learning tree",S.scale.setScalar(mh),b.sizeAttenuation=!0,b.userData.sizeAttenuation=!0,{points:S,uniforms:E,particleBudget:p,skeleton:c,leaves:l,chapterLeaves:h,bounds:g,growthStage:r,spatialScale:mh}}var Yg=1e3/30,qg=26e4,Zg=.72,Fh=18e3,Mh=4e3,$g=.24,Bo=2.15,Sh=28,Jg=.085,bh=.25,ai=18,Kg=112,jg=4,Qg=2.75,t0=.16,e0=2.2,n0=9,i0=5.2,s0=44,r0=10,Eh=18,Th=9,wh=Object.freeze({plot:1.45,seedling:1.8,growing:3,mature:3.8}),Ah=-1.64,Rh=.62,o0=.38,Ch=.98,Ph=.58,Ih=.18,a0=Object.freeze({seedling:.26,growing:.72,mature:1});function ko(i){let t=new Date(i);return Number.isNaN(t.getTime())?"UNDATED":t.toLocaleDateString(void 0,{month:"short",day:"2-digit"}).toUpperCase()}function c0(i,t,e,n){let s=document.createElement("button");s.type="button",s.className=`forest-label forest-label--${t}`,s.dataset.recordId=i.id;let r=document.createElement("span");r.className="forest-label__eyebrow";let o=t==="note";r.textContent=o?i.eyebrow||"VISUAL NOTE":t==="concept"&&i.role||ko(i.createdAt);let a=document.createElement("span");a.className="forest-label__title",a.textContent=o?i.title:t==="concept"?i.label:i.name,s.append(r,a),s.setAttribute("aria-label",o?`Open Visual Note ${i.title}`:t==="concept"?`${i.label}${i.role?`, ${i.role}`:""}`:`${i.name}, created ${ko(i.createdAt)}`);let c=null,l={x:0,y:0};return s.addEventListener("pointerdown",h=>{h.isPrimary===!1||h.button!==0||(c=h.pointerId,l={x:h.clientX,y:h.clientY},n?.(),s.setPointerCapture?.(h.pointerId))}),s.addEventListener("pointerup",h=>{if(h.pointerId!==c)return;let u=Math.hypot(h.clientX-l.x,h.clientY-l.y);c=null,s.hasPointerCapture?.(h.pointerId)&&s.releasePointerCapture(h.pointerId),u<=12&&e()}),s.addEventListener("pointercancel",()=>{c=null}),s.addEventListener("click",h=>{h.detail===0&&e()}),s}function l0(i){let t=document.createElementNS("http://www.w3.org/2000/svg","path");return t.classList.add("forest-connector"),t.setAttribute("marker-end","url(#forest-arrowhead)"),i.append(t),t}function Dh(i,t){t&&(i.remove(t.points),t.points.geometry.dispose(),t.points.material.dispose())}function h0(i,t){t.removeFromParent(),t.geometry.dispose(),t.material.dispose()}function zo(i,t,e,n){return Jt.lerp(i,t,1-Math.exp(-e*n))}function u0(i){return Math.max(1,Math.ceil(i/4))}function Lh(i,t=1){let e=Array.isArray(i)?i:[],n=e.length;if(n<=0)return[];let s=u0(n),r=Math.floor(n/s),o=n%s,a=Array.from({length:s},(p,f)=>r+(f<o?1:0)),c=Jt.clamp(t,.72,1.65),l=e0*Jt.lerp(1.18,1,(c-.72)/.93),h=[],u=0;return a.forEach((p,f)=>{let x=e.slice(u,u+p).map(R=>wh[R?.growthStage]||wh.mature),m=[],d=0;x.forEach(R=>{m.push(d+R),d+=R*2+l});let E=Math.max(0,d-l),b=m.map(R=>R-E/2),S=f%2===0?1:-1,U=f===0?0:(f%2===0?-1:1)*i0;for(let R=0;R<p;R+=1){let I=S===1?R:p-1-R;h.push({index:u,row:f,x:b[I]+U,y:0,z:(f-(s-1)/2)*n0}),u+=1}}),h}function d0(i,t,e,n,s=!1){let r=i.filter(f=>f.shouldShow);if(!r.length)return i;let o=s?46:t<=560?92:Jt.clamp(t*.11,96,132),a=o+r0,c=s?44:t<=560?76:88,l=o/2+8,u=r.reduce((f,g)=>Math.max(f,g.row),0)/2;if(r.forEach(f=>{let g=f.screenY,x=(f.row-u)*(s?28:s0),m=!s&&f.hasLiveTree?Math.max(x,Eh):x;f.minimumScreenY=!s&&f.hasLiveTree?Math.min(n,g+Eh):e,f.screenX=Jt.clamp(f.screenX,l,t-l),f.screenY=Jt.clamp(f.screenY+m,e,n)}),s){let f=Math.max(1,Math.floor((t-l*2)/a)+1),g=Math.max(1,Math.floor((n-e)/c)+1),x=f>1?(t-l*2)/(f-1):0,m=g>1?(n-e)/(g-1):0,d=[];for(let E=0;E<g;E+=1)for(let b=0;b<f;b+=1)d.push({x:l+b*x,y:e+E*m});return[...r].sort((E,b)=>Number(b.isSelected)-Number(E.isSelected)).forEach(E=>{let b=0,S=1/0;d.forEach((R,I)=>{let A=R.x-E.screenX,M=R.y-E.screenY,y=A*A+M*M*1.35;y<S&&(S=y,b=I)});let[U]=d.splice(b,1);U&&(E.screenX=U.x,E.screenY=U.y)}),i}let p=[];return r.forEach(f=>{for(let g=0;g<r.length*2;g+=1){let x=p.find(b=>Math.abs(f.screenX-b.screenX)<a&&Math.abs(f.screenY-b.screenY)<c);if(!x)break;let m=f.row>=x.row,d=[x.screenY+(m?c:-c),x.screenY+(m?-c:c)].filter(b=>b>=f.minimumScreenY&&b<=n);if(d.length){d.sort((b,S)=>Math.abs(b-f.screenY)-Math.abs(S-f.screenY)),f.screenY=d[0];continue}let E=[x.screenX-a,x.screenX+a].filter(b=>b>=l&&b<=t-l);if(!E.length)break;E.sort((b,S)=>Math.abs(b-f.screenX)-Math.abs(S-f.screenX)),f.screenX=E[0]}p.push(f)}),i}function Uh(i){return i.growthStage==="plot"?"Empty plot":i.growthStage==="seedling"?"Seedling":i.growthStage==="growing"?"Normal tree":"Huge tree"}function Nh(i){let t=Number(i.growthUnitCount)||0,e=Number(i.visualNoteCount)||0,n=Number(i.sourceCount)||0;return`${t} growth ${t===1?"unit":"units"} \xB7 ${e} Visual ${e===1?"Note":"Notes"} \xB7 ${n} ${n===1?"source":"sources"}`}function f0(i,t,e=!1){if(i.growthStage==="plot")return 0;let n=a0[i.growthStage]||1,s=Math.max(18e3,Math.round(t*n));return e?Math.min(18e4,s):s}function p0(i,t,e={}){let n=i.filter(p=>p.growthStage!=="plot");if(!n.length)return new Map;let s=Math.max(2e3,Math.floor(Number(e.minimumTreeBudget)||Fh)),r=Number.isFinite(Number(e.poolLimit)),o=Math.min(t,r?Math.max(0,Math.min(Math.round(Number(e.poolLimit)),Math.round(t))):Math.max(s*n.length,Math.min(qg,Math.round(t*Zg))));if(!o)return new Map;let a=Math.min(s,Math.floor(o/n.length)),c={seedling:1,growing:2,mature:3},l={seedling:48e3,growing:112e3,mature:18e4},h=Math.max(0,o-a*n.length),u=n.reduce((p,f)=>p+(c[f.growthStage]||1),0);return new Map(n.map(p=>{let f=h*(c[p.growthStage]||1)/Math.max(1,u),g=Math.min(l[p.growthStage]||l.mature,Math.floor(a+f));return[p.id,g]}))}function m0(i){if(!i.length)return"";if(i.length===1){let e=i[0];return`M ${(e.x-30).toFixed(1)} ${e.y.toFixed(1)} L ${(e.x+30).toFixed(1)} ${e.y.toFixed(1)}`}let t=`M ${i[0].x.toFixed(1)} ${i[0].y.toFixed(1)}`;for(let e=0;e<i.length-1;e+=1){let n=i[Math.max(0,e-1)],s=i[e],r=i[e+1],o=i[Math.min(i.length-1,e+2)],a=s.x+(r.x-n.x)/6,c=s.y+(r.y-n.y)/6,l=r.x-(o.x-s.x)/6,h=r.y-(o.y-s.y)/6;t+=` C ${a.toFixed(1)} ${c.toFixed(1)}, ${l.toFixed(1)} ${h.toFixed(1)}, ${r.x.toFixed(1)} ${r.y.toFixed(1)}`}return t}function g0(i,t,e){i.points.updateMatrixWorld(!0);let n=i.bounds,s=n.getCenter(new w),r=new w,o=1/0,a=-1/0,c=[[n.min.x,s.y,s.z],[n.max.x,s.y,s.z],[s.x,s.y,n.min.z],[s.x,s.y,n.max.z]];for(let[l,h,u]of c){r.set(l,h,u).applyMatrix4(i.points.matrixWorld).project(t);let p=(r.x*.5+.5)*e;o=Math.min(o,p),a=Math.max(a,p)}return{left:Jt.clamp(o,0,e),right:Jt.clamp(a,0,e)}}function Oh(i,t={}){if(!i)throw new Error("Learning Forest requires a root element.");let e=i.querySelector("#forestScene"),n=i.querySelector("#forestLabels"),s=i.querySelector("#forestConnectors"),r=i.querySelector("#forestRibbon"),o=i.querySelector("#forestRibbonBed"),a=i.querySelector("#forestRibbonPath"),c=i.querySelector("#forestRibbonPlots"),l=i.querySelector("#forestChapterIndex"),h=i.querySelector("#forestRibbonStatus"),u=i.querySelector("#forestLoading"),p=i.querySelector("#forestWebglError"),f=i.querySelector("#forestParticleCount");if(!e||!n||!s||!r||!o||!a||!c||!l||!h)throw new Error("Learning Forest markup is incomplete.");let g;try{g=new Lo({antialias:!0,alpha:!0,powerPreference:"high-performance"})}catch(C){return i.dataset.renderer="fallback",u.hidden=!0,p.hidden=!1,t.onWebglError?.(C),{isWebGLAvailable:!1,setTrees(){},focusTree(){},focusVisualNote(){},clearVisualNoteFocus(){},showOverview(){},setMotionPaused(){},destroy(){}}}i.dataset.renderer="ready",g.setClearColor(0,0),g.outputColorSpace=Oe,g.toneMapping=fn;let x=(navigator.deviceMemory??4)<=4||(navigator.hardwareConcurrency??4)<=4;g.setPixelRatio(x?1:Math.min(window.devicePixelRatio,1.75)),e.append(g.domElement);let m=new bs,d=new Ue(43,1,.1,160),E=new Fo(d,g.domElement);E.enableDamping=!0,E.dampingFactor=.06,E.enablePan=!1,E.minDistance=1.6,E.maxDistance=90,E.rotateSpeed=.48,E.zoomSpeed=.65,E.autoRotate=!1,E.enabled=!0;let b=new w(0,.12,0),S=new w(.15,.22,14.1),U=S.clone(),R=b.clone();d.position.copy(S),E.target.copy(b);let I=new Yt(2,2),A=new Ds,M=new xn,y=new Me,D=new w,Y=new w,G=new Is,$=lc(),et=window.matchMedia?.("(prefers-reduced-motion: reduce)"),W=!!et?.matches,K=[],H=[],lt=null,ht=[],Mt=[],Pt=[],Qt=[],J="",rt="",bt="",gt=S.clone(),It=b.clone(),yt="empty",Lt=!1,he=!1,re=W,ie=!W,P=0,Se=!1,ee=!1,ne=!1,At="mouse",qt="",Dt=new Set,Bt=0,ge={x:0,y:0,time:0},T=0,_=-1/0,O=!1,j=!0;function tt(){return!O&&!document.hidden&&(document.hasFocus?.()??!0)&&j&&!i.hidden&&i.getClientRects().length>0&&i.getAttribute("aria-hidden")!=="true"}function Z(){return tt()&&!W}function Rt(){T&&(cancelAnimationFrame(T),T=0)}function ut(){T||!Z()||(T=requestAnimationFrame(oe))}function _t(){if(!tt()){Rt();return}if(W){_e(performance.now(),!0);return}ut()}function Tt(){if(!tt()){Rt();return}_=-1/0,_t()}function nt(){Rt()}function xt(C){W=!!C.matches,i.dataset.reducedMotion=W?"true":"false",W&&k(""),W&&Lt&&(d.position.copy(U),E.target.copy(R),Lt=!1),Rt(),Tt()}function Vt(){Mt.forEach(C=>{C.button.remove(),C.connector.remove()}),Mt=[]}function zt(){ht.forEach(C=>h0(m,C)),ht=[]}function dt(){Pt=[],Qt=[],J="",Dt.clear(),delete i.dataset.ribbonMotionTrees,c.replaceChildren(),l.replaceChildren(),o.setAttribute("d",""),a.setAttribute("d",""),h.textContent=""}function Xt(){qt="",delete i.dataset.activeParticleTree,delete i.dataset.activeMotionTrees,i.dataset.particleMotion="idle",H.forEach(C=>Dh(m,C.system)),H=[]}function L(){Dh(m,lt?.system),lt=null}function ft(){bt="",delete i.dataset.focusedVisualNote,Vt(),zt(),Xt(),L(),dt()}function it(C,B=""){yt=C,i.dataset.mode=C,rt=B,qt="",Dt.clear(),Bt=0,delete i.dataset.activeParticleTree,delete i.dataset.ribbonMotionTrees,Q(),E.enabled=C==="overview"||C==="focus",t.onModeChange?.({mode:yt,treeId:B})}function St(){let C=new Set;return yt!=="overview"||re||W||(rt&&C.add(rt),Dt.forEach(B=>C.add(B)),qt&&C.add(qt)),C}function ot(C){!C||C.hasInteracted||(C.hasInteracted=!0,C.targetMotionStrength=1,C.system.uniforms.uEdgeDissolveStrength.value=1)}function Q(){let C=St();H.forEach(B=>{C.has(B.record.id)&&ot(B)}),i.dataset.motion=re?"paused":yt==="overview"?C.size?"active":"waiting":"playing",i.dataset.particleMotion=C.size?"active":"idle",C.size?i.dataset.activeMotionTrees=[...C].join(" "):delete i.dataset.activeMotionTrees,Dt.size?i.dataset.ribbonMotionTrees=[...Dt].join(" "):delete i.dataset.ribbonMotionTrees}function wt(C){return re=!!C,re?(k(""),Bt=0):(ie=!0,yt==="overview"&&Se&&N(),yt!=="overview"&&kn().forEach(B=>{B.system.uniforms.uEdgeDissolveStrength.value=1})),Q(),_t(),re}function kt(C,B){if(U.copy(C),R.copy(B),W){d.position.copy(C),E.target.copy(B),Lt=!1,_t();return}Lt=!0}function fe(){if(!Qt.length)return;let C=new rn,B=new Map(H.map(Ut=>[Ut.record.id,Ut]));Pt.forEach(Ut=>{let ce=B.get(Ut.record.id);if(!ce){C.expandByPoint(Ut.position);return}ce.system.points.updateMatrixWorld(!0),C.union(ce.system.bounds.clone().applyMatrix4(ce.system.points.matrixWorld))}),C.isEmpty()&&Qt.forEach(Ut=>C.expandByPoint(new w(Ut.x,0,Ut.z))),C.expandByVector(new w(1.7,2.2,1.7));let z=C.getSize(new w),st=C.getCenter(new w),q=Jt.degToRad(d.fov),at=z.y/(2*Math.tan(q/2)),X=z.x/(2*Math.tan(q/2)*Math.max(d.aspect,.1)),Ct=Math.max(at,X,z.z*1.22,10)*1.24,Ft=new w(st.x,st.y+Math.max(7.2,z.z*.92),st.z+Ct);kt(Ft,st.clone().add(new w(0,-.6,0)))}function se(C=""){J=C,Pt.forEach(B=>{let z=!!(C&&B.record.id===C);B.plot.classList.toggle("is-linked",z),B.indexButton.classList.toggle("is-linked",z)}),H.forEach(B=>{let z=yt==="focus"?Ih:B.record.id===rt?Ch:Ph;B.targetOpacity=C&&B.record.id===C?1:z}),_t()}function We(C,B){let z=String(C||"");z&&(B&&yt==="overview"?Dt.add(z):Dt.delete(z),Q(),_t())}function je(C,B,{motionPreview:z=!1}={}){let st=!1,q=!1,at=!1,X=!1,Ct=()=>{let Ft=st||q||at;!z||Ft===X||(X=Ft,We(B,Ft))};C.addEventListener("pointerenter",()=>{st=!0,se(B),Ct()}),C.addEventListener("pointerleave",()=>{st=!1,J===B&&se(""),Ct()}),C.addEventListener("pointerdown",Ft=>{q=!0,Ft.pointerType==="touch"&&(st=!1),se(B),Ct()}),C.addEventListener("pointerup",Ft=>{q=!1,Ft.pointerType==="touch"&&(st=!1),Ct()}),C.addEventListener("pointercancel",()=>{st=!1,q=!1,Ct()}),C.addEventListener("focus",()=>{at=!0,se(B),Ct()}),C.addEventListener("blur",()=>{at=!1,J===B&&se(""),Ct()})}function Gs(C,B){if(!["ArrowLeft","ArrowRight","Home","End"].includes(C.key))return;C.preventDefault();let z=B;C.key==="ArrowLeft"&&(z=Math.max(0,B-1)),C.key==="ArrowRight"&&(z=Math.min(Pt.length-1,B+1)),C.key==="Home"&&(z=0),C.key==="End"&&(z=Pt.length-1),Pt[z]?.indexButton.focus({preventScroll:!0})}function Ws(C,B){let z=document.createElement("button");z.type="button",z.className="forest-ribbon__plot",z.dataset.treeId=C.id,z.dataset.growth=C.growthStage,z.dataset.status=C.status,z.title=C.name,z.setAttribute("aria-label",`Open chapter ${B+1}, ${C.name}. ${Uh(C)}. ${Nh(C)}.`);let st=document.createElement("span");st.className="forest-ribbon__plot-number",st.textContent=String(B+1).padStart(2,"0");let q=document.createElement("span");q.className="forest-ribbon__plant",q.setAttribute("aria-hidden","true");let at=document.createElement("span");at.className="forest-ribbon__plant-crown";let X=document.createElement("span");X.className="forest-ribbon__plant-stem";let Ct=document.createElement("span");Ct.className="forest-ribbon__plant-base";let Ft=document.createElement("span");Ft.className="forest-ribbon__completion-pulse",q.append(at,X,Ct,Ft);let Ut=document.createElement("span");Ut.className="forest-ribbon__plot-title",Ut.textContent=C.name;let ce=document.createElement("span");return ce.className="forest-ribbon__plot-meta",ce.textContent=`${C.visualNoteCount||0} ${(C.visualNoteCount||0)===1?"note":"notes"} \xB7 ${C.sourceCount||0} ${(C.sourceCount||0)===1?"source":"sources"}`,z.append(st,q,Ut,ce),z.addEventListener("click",()=>pn(C.id)),je(z,C.id),z}function An(C,B){let z=document.createElement("button");z.type="button",z.className="forest-ribbon__index-button",z.dataset.treeId=C.id,z.dataset.status=C.status,z.setAttribute("aria-label",`Chapter ${B+1}: ${C.name}`);let st=document.createElement("span");st.textContent=String(B+1).padStart(2,"0");let q=document.createElement("span");return q.textContent=C.name,z.append(st,q),z.addEventListener("click",()=>pn(C.id)),z.addEventListener("keydown",at=>Gs(at,B)),je(z,C.id,{motionPreview:!0}),z}function Ai(C,B){Qt=Lh(K,d.aspect||1),r.hidden=!1,r.dataset.presentation=B,r.dataset.density=K.length>=Th?"compact":"comfortable",Pt=K.map((q,at)=>{let X=Ws(q,at),Ct=An(q,at);return c.append(X),l.append(Ct),{record:q,plot:X,indexButton:Ct,position:new w(Qt[at].x,0,Qt[at].z),layoutRow:Qt[at].row,projected:new w}});let z=Math.max(0,K.findIndex(q=>q.id===C));Pt.forEach((q,at)=>{let X=q.record.id===C;q.plot.classList.toggle("is-selected",X),q.indexButton.classList.toggle("is-selected",X),q.plot.setAttribute("aria-current",X?"step":"false"),q.indexButton.setAttribute("aria-current",X?"step":"false"),q.plot.hidden=!1,q.plot.dataset.live=q.record.growthStage==="plot"?"false":"true"});let st=K[z];st&&(h.textContent=`${z+1} of ${K.length} \xB7 ${Uh(st)} \xB7 ${Nh(st)}`,requestAnimationFrame(()=>{let q=Pt[z]?.indexButton;if(!q)return;let at=q.offsetLeft-l.clientWidth/2+q.offsetWidth/2;l.scrollTo({left:Math.max(0,at),behavior:W?"auto":"smooth"})}))}function Xs(C,B,z,st){let q=B.bounds.getSize(new w).multiplyScalar(st),at=new Be(new jn(Math.max(1.1,q.x),Math.max(1.4,q.y),Math.max(1.1,q.z)),new Kn({transparent:!0,opacity:0,depthWrite:!1,colorWrite:!1})),X=B.bounds.getCenter(new w).multiplyScalar(st);return at.position.copy(z).add(X),at.userData={kind:"tree",treeId:C.id},m.add(at),ht.push(at),at}function ss({excludeTreeId:C="",highlightedTreeId:B="",dimmed:z=!1,poolLimit:st,minimumTreeBudget:q=Fh}={}){let at=p0(K.filter(Ct=>Ct.id!==C),$,{poolLimit:st,minimumTreeBudget:q}),X=0;return Pt.forEach(Ct=>{let Ft=Ct.record,Ut=at.get(Ft.id)||0;if(!Ut||Ft.id===C)return;let ce=hc([],g,{seed:Ft.seed,particleBudget:Ut,growthStage:Ft.growthStage,opacity:0,edgeDissolveStrength:yt==="overview"?0:ie?1:0,motionStrength:yt==="overview"?0:1}),ke=!z&&Ft.id===B,Ve=(ke?Rh:o0)*ce.spatialScale;ce.points.scale.setScalar(Ve),ce.points.position.copy(Ct.position),m.add(ce.points);let Qe={record:Ft,system:ce,isHighlighted:ke,targetOpacity:z?Ih:ke?Ch:Ph,targetScale:Ve,targetMotionStrength:yt==="overview"?0:1,motionElapsed:0,hasInteracted:yt!=="overview"};Qe.hitTarget=Xs(Ft,ce,Ct.position,Ve),H.push(Qe),X+=Ut}),X}function Bn(C,B){let z=C?.spatialScale||1,st=C?C.bounds.getCenter(new w).multiplyScalar(z).add(B):B.clone().add(new w(0,-1.25,0)),q=C?C.bounds.getSize(new w).multiplyScalar(z):new w(2.4,2.2,2.4),at=Jt.clamp(Math.max(q.y*1.78,q.x*1.95,5.8),5.8,17);return{position:st.clone().add(new w(.16,q.y*.04,at)),target:st.clone().add(new w(0,-q.y*.015,0))}}function rs(C=rt){let B=K.find(st=>st.id===C)||K[0];if(ft(),!K.length){it("empty"),r.hidden=!0,u.hidden=!0,f&&(f.textContent="No grains");return}it("overview",B.id),u.hidden=!1,u.querySelector("span:last-child").textContent="Growing the learning forest",Ai(B.id,"overview");let z=ss({highlightedTreeId:B.id});f&&(f.textContent=z?`${Math.round(z/1e3)}K forest grains`:"Bare learning plots"),fe(),u.hidden=!0,_t()}function Ri(C,B){B.chapterLeaves.forEach(z=>{let st=C.visualNotes.find(Ct=>Ct.id===z.chapter.id);if(!st)return;let q=l0(s),at=c0(st,"note",()=>zn(C.id,st.id),()=>{Lt=!1});n.append(at),Mt.push({type:"note",id:st.id,record:st,treeRecord:C,leaf:z,system:B,points:B.points,button:at,connector:q,projected:new w});let X=new Be(new Cs(Math.max(.28,z.length*.72),12,8),new Kn({transparent:!0,opacity:0,depthWrite:!1,colorWrite:!1}));X.position.copy(z.center),X.userData={kind:"visual-note",treeId:C.id,artifactId:st.id},B.points.add(X),ht.push(X)})}function zn(C,B){let z=K.find(Ct=>Ct.id===C),st=z?.visualNotes.find(Ct=>Ct.id===B);if(!z||!st)return!1;(!lt||rt!==z.id)&&pn(z.id);let q=Mt.find(Ct=>Ct.type==="note"&&Ct.treeRecord.id===z.id&&Ct.id===st.id);if(!q)return!1;let{cameraDestination:at,framingTarget:X}=os(q);return bt=st.id,i.dataset.focusedVisualNote=st.id,Mt.forEach(Ct=>Ct.button.classList.toggle("is-selected",Ct.id===st.id)),kt(at,X),t.onSelectVisualNote?.({treeId:z.id,artifactId:st.id}),_t(),!0}function os(C){C.points.updateMatrixWorld(!0);let B=C.leaf.center.clone().applyMatrix4(C.points.matrixWorld),z=d.position.clone().sub(B);z.lengthSq()<1e-4&&z.set(.12,.06,1),z.normalize();let st=B.clone().addScaledVector(z,Qg).add(new w(0,.08,0)),q=B.clone().add(new w(0,-t0,0));return{cameraDestination:st,framingTarget:q}}function Ys(){return bt?(bt="",delete i.dataset.focusedVisualNote,Mt.forEach(C=>C.button.classList.remove("is-selected")),kt(gt,It),_t(),!0):!1}function pn(C){let B=K.find(xe=>xe.id===C);if(!B)return!1;let z=yt==="overview",st=H.find(xe=>xe.record.id===B.id)?.system.points.scale.x,q=Pt.find(xe=>xe.record.id===B.id)?.position.clone();ft(),it("focus",B.id),u.hidden=!1,u.querySelector("span:last-child").textContent=`Opening ${B.name}`,Ai(B.id,"focus");let at=Pt.find(xe=>xe.record.id===B.id)?.position.clone()||q||new w,X=K.filter(xe=>xe.id!==B.id&&xe.growthStage!=="plot").length,Ct=f0(B,$,!1),Ft=Math.min(Math.round($*$g),X*Mh),Ut=B.growthStage==="plot"?0:Math.max(18e3,Math.min(Ct,$-Ft)),ce=ss({excludeTreeId:B.id,dimmed:!0,poolLimit:Math.max(0,$-Ut),minimumTreeBudget:Mh});if(B.growthStage==="plot"){let xe=Bn(null,at);return gt.copy(xe.position),It.copy(xe.target),kt(xe.position,xe.target),f&&(f.textContent=ce?`${Math.round(ce/1e3)}K background grains`:"Bare learning plot"),u.hidden=!0,t.onSelectTree?.({treeId:B.id}),_t(),!0}let ke=B.visualNotes.map(xe=>({id:xe.id,date:ko(xe.createdAt||B.createdAt),subheader:xe.title})),Re=hc(ke,g,{seed:B.seed,particleBudget:Ut,growthStage:B.growthStage,opacity:0,edgeDissolveStrength:ie?1:0,motionStrength:1}),Ve=Re.spatialScale,Qe=z?st||Rh*Re.spatialScale:Ve;Re.points.position.copy(at),Re.points.scale.setScalar(Qe),m.add(Re.points),lt={record:B,system:Re,targetOpacity:1,targetPosition:at.clone(),targetScale:Ve,targetMotionStrength:1},Ri(B,Re),W&&Re.points.scale.setScalar(Ve);let cn=Bn(Re,at);return gt.copy(cn.position),It.copy(cn.target),kt(cn.position,cn.target),f&&(f.textContent=Ut>=1e6?`${(Ut/1e6).toFixed(2)}M focused grains`:`${Math.round(Ut/1e3)}K focused grains`),u.hidden=!0,t.onSelectTree?.({treeId:B.id}),_t(),!0}function qs(){if(K.length<=1){K[0]&&pn(K[0].id);return}rs(rt)}function Vo(C){let B=rt,z=bt,st=yt==="focus";if(K=Array.isArray(C)?C.filter(q=>q?.id&&q?.name).map(q=>{let at=(q.concepts||[]).slice(0,7),X=Array.isArray(q.visualNotes)?q.visualNotes.filter(ke=>ke?.id&&ke?.title):[],Ct=Number.isFinite(Number(q.visualNoteCount))?Math.max(0,Math.floor(Number(q.visualNoteCount))):X.length,Ft=Math.max(0,Math.floor(Number(q.sourceCount)||0)),Ut=Number.isFinite(Number(q.growthUnitCount))?Math.max(0,Math.floor(Number(q.growthUnitCount))):Ct+Ft,ce=["plot","seedling","growing","mature"].includes(q.growthStage)?q.growthStage:Ut===0?"plot":Ut<=2?"seedling":Ut<=5?"growing":"mature";return{...q,concepts:at,visualNotes:X,visualNoteCount:Ct,sourceCount:Ft,growthUnitCount:Ut,growthStage:ce}}):[],!K.length){ft(),it("empty"),r.hidden=!0,u.hidden=!0,_t();return}if(K.length===1){pn(K[0].id),z&&K[0].visualNotes.some(q=>q.id===z)&&zn(K[0].id,z);return}if(st&&K.some(q=>q.id===B)){pn(B),z&&K.find(q=>q.id===B)?.visualNotes.some(q=>q.id===z)&&zn(B,z);return}rs(K.some(q=>q.id===B)?B:K[0].id)}function kn(){return lt?[...H,lt]:H}function Ho(){A.setFromCamera(I,d);let C=A.ray.origin,B=A.ray.direction,z=C.clone().addScaledVector(B,Math.max(1.5,d.position.distanceTo(E.target)));kn().forEach(st=>{st.system.uniforms.uMouseRayOrigin.value.copy(C),st.system.uniforms.uMouseRayDirection.value.copy(B),st.system.uniforms.uMouseWorld.value.copy(z)})}function v(C){let B=g.domElement.getBoundingClientRect();I.x=(C.clientX-B.left)/Math.max(1,B.width)*2-1,I.y=-((C.clientY-B.top)/Math.max(1,B.height))*2+1,Ho()}function F(C){let B=C?.system?.points,z=B?.geometry?.getAttribute("position");if(!B||!z?.count)return!1;B.updateWorldMatrix(!0,!1),y.copy(B.matrixWorld).invert(),M.copy(A.ray).applyMatrix4(y),B.getWorldScale(Y);let st=Math.max(Math.abs(Y.x),Math.abs(Y.y),Math.abs(Y.z),.001),q=Jg/st,at=q*q;for(let X=0;X<z.count;X+=1)if(D.fromBufferAttribute(z,X),M.distanceSqToPoint(D)<=at)return!0;return!1}function V(){if(yt!=="overview"||re||W||!Se)return null;let C=H.map(z=>z.hitTarget).filter(z=>z?.parent);C.forEach(z=>z.updateWorldMatrix(!0,!1));let B=A.intersectObjects(C,!1);for(let z of B){let st=H.find(q=>q.hitTarget===z.object);if(st&&F(st))return st}return null}function k(C=""){let B=yt==="overview"&&!re&&!W?String(C||""):"";if(Bt=B?Bo:0,B===qt){Q();return}if(qt=B,qt){let z=H.find(st=>st.record.id===qt);ot(z),i.dataset.activeParticleTree=qt}else delete i.dataset.activeParticleTree;Q(),_t()}function N(){if(ne||he&&!ee)return k(""),null;let C=V();return k(C?.record.id||""),C}function ct(C){Se=!0,At=C.pointerType||"mouse",v(C),yt==="overview"?N():Bt=he||C.buttons!==0?0:Bo}function pt(C){if(Se){if(At=C.pointerType||At,ee&&Math.hypot(C.clientX-ge.x,C.clientY-ge.y)>7&&(ne=!0),v(C),yt==="overview"){N();return}Bt=he||C.buttons!==0?0:Bo}}function Et(){Se=!1,ee=!1,ne=!1,Bt=0,k(""),I.set(2,2)}function vt(C){Se=!0,ee=!0,ne=!1,At=C.pointerType||"mouse",ge={x:C.clientX,y:C.clientY,time:performance.now()},v(C),yt==="overview"?N():Bt=0}function Ht(C){let z=Math.hypot(C.clientX-ge.x,C.clientY-ge.y)<=7&&performance.now()-ge.time<=650;if(v(C),ee=!1,yt==="overview"&&(C.pointerType==="touch"||ne?k(""):N()),ne=!1,!z)return;A.setFromCamera(I,d);let st=A.intersectObjects(ht,!1)[0];if(!st)return;let q=st.object.userData;q.kind==="tree"&&pn(q.treeId),q.kind==="visual-note"&&zn(q.treeId,q.artifactId)}function Wt(){Et()}function Nt(){Lt=!1,he=!0,Bt=0,yt==="overview"&&(!ee||ne)&&k("")}function te(){he=!1,yt==="overview"?At==="touch"||ne?k(""):N():Bt=Se?Bo:0,ne=!1}function le(C){if(C.key==="Escape"&&bt){Ys();return}C.key==="Escape"&&yt==="focus"&&K.length>1&&qs()}function ve(){let{width:C,height:B}=e.getBoundingClientRect();if(!C||!B)return;d.aspect=C/B,d.updateProjectionMatrix(),g.setSize(C,B,!1),s.setAttribute("viewBox",`0 0 ${C} ${B}`);let z=Math.min(19,Math.max(13,B*.018))*g.getPixelRatio();if(kn().forEach(st=>{st.system.uniforms.uPointScale.value=z}),a.ownerSVGElement?.setAttribute("viewBox",`0 0 ${C} ${B}`),(yt==="overview"||yt==="focus")&&K.length){let st=Lh(K,d.aspect||1);if(Qt=st,Pt.forEach((q,at)=>{let X=st[at];q.position.set(X.x,0,X.z),q.layoutRow=X.row}),H.forEach(q=>{let at=Pt.find(Ct=>Ct.record.id===q.record.id);if(!at)return;q.system.points.position.copy(at.position);let X=q.system.bounds.getCenter(new w).multiplyScalar(q.system.points.scale.x);q.hitTarget?.position.copy(at.position).add(X)}),yt==="overview")fe();else{let q=Pt.find(X=>X.record.id===rt);if(!q)return;lt&&(lt.targetPosition.copy(q.position),lt.system.points.position.copy(q.position),lt.system.points.updateMatrixWorld(!0));let at=bt?Mt.find(X=>X.id===bt):null;if(at){let X=os(at);kt(X.cameraDestination,X.framingTarget)}else{let X=Bn(lt?.system||null,q.position);gt.copy(X.position),It.copy(X.target),kt(X.position,X.target)}}}_t()}function me(C){let B=kn().find(z=>z.record.id===C.record.id);if(B){B.system.points.updateMatrixWorld(!0);let z=B.system.bounds,st=z.getCenter(new w);return new w(st.x,z.min.y-.08,st.z).applyMatrix4(B.system.points.matrixWorld)}return yt==="focus"&&C.record.id===rt?C.position.clone().add(new w(0,Ah,0)):C.position.clone().add(new w(0,Ah,0))}function ue(){let C=e.clientWidth,B=e.clientHeight;if(!C||!B||!Pt.length)return;let z=l.parentElement?.getBoundingClientRect().top??B,st=C<=560?208:C<=860?150:112,q=Math.max(st,z-54),at=Pt.length>=Th||C<=640&&Pt.length>=6;r.dataset.density=at?"compact":"comfortable";let X=[],Ct=Pt.map(Ut=>{let ce=me(Ut);Ut.projected.copy(ce).project(d);let ke=Ut.projected.z>-1&&Ut.projected.z<1&&Math.abs(Ut.projected.x)<1.3&&Math.abs(Ut.projected.y)<1.3,Re=(Ut.projected.x*.5+.5)*C,Ve=(-Ut.projected.y*.5+.5)*B,Qe=Jt.clamp(Ve,st,q);return{entry:Ut,row:Ut.layoutRow||0,screenX:Re,screenY:Qe,routeX:Jt.clamp(Re,0,C),routeY:Qe,shouldShow:ke,isSelected:Ut.record.id===rt,hasLiveTree:Ut.record.growthStage!=="plot",isBackgroundPlot:yt==="focus"&&Ut.record.id!==rt}});d0(Ct,C,st,q,at).forEach(Ut=>{let{entry:ce,screenX:ke,screenY:Re,routeX:Ve,routeY:Qe,shouldShow:cn,isBackgroundPlot:xe}=Ut;ce.plot.style.transform=`translate3d(${ke}px, ${Re}px, 0) translate(-50%, -50%)`,ce.plot.style.opacity=cn?xe?"0.32":"1":"0",ce.plot.style.visibility=cn?"visible":"hidden",yt==="overview"&&cn&&X.push({x:Ve,y:Qe})});let Ft=yt==="overview"?m0(X):"";o.setAttribute("d",Ft),a.setAttribute("d",Ft)}function Ot(){let C=e.clientWidth,B=e.clientHeight;if(!C||!B)return;let z=[],st=new Map;kn().forEach(X=>{st.set(X.system,g0(X.system,d,C))}),Mt.forEach(X=>{let Ct=X.leaf.labelAnchor;X.projected.copy(Ct).applyMatrix4(X.points.matrixWorld).project(d);let Ft=Math.abs(X.projected.x)<1.26&&Math.abs(X.projected.y)<1.26&&X.projected.z>-1&&X.projected.z<1;X.leafScreenX=(X.projected.x*.5+.5)*C,X.leafScreenY=(-X.projected.y*.5+.5)*B;let Ut=st.get(X.system),ce=Ut?(Ut.left+Ut.right)*.5:C*.5;X.placeAtRight=X.leafScreenX>=ce,X.screenY=X.leafScreenY,X.isVisible=Ft&&!bt,X.isVisible&&z.push(X)});let q=C<=560?238:C<=860?150:140;[z.filter(X=>!X.placeAtRight),z.filter(X=>X.placeAtRight)].forEach(X=>{X.sort((Ft,Ut)=>Ft.screenY-Ut.screenY);let Ct=q-48;X.forEach(Ft=>{Ft.screenY=Math.max(Ft.screenY,q,Ct+48),Ft.screenY=Math.min(Ft.screenY,B-58),Ct=Ft.screenY})}),Mt.forEach(X=>{let Ct=X.button.offsetWidth||136,Ft=st.get(X.system),Ut=X.placeAtRight?C-ai:ai;if(Ft)if(X.placeAtRight){let Wo=Math.max(0,C-ai-Ft.right),Xo=Ft.right+Wo*bh;Ut=Jt.clamp(Xo+Ct,ai+Ct,C-ai)}else{let Wo=Math.max(0,Ft.left-ai),Xo=Ft.left-Wo*bh;Ut=Jt.clamp(Xo-Ct,ai,C-ai-Ct)}X.button.classList.toggle("is-left",X.placeAtRight),X.button.style.transform=X.placeAtRight?`translate3d(${Ut}px, ${X.screenY}px, 0) translate(-100%, -50%)`:`translate3d(${Ut}px, ${X.screenY}px, 0) translate(0, -50%)`,X.button.style.opacity=X.isVisible?"1":"0",X.button.style.visibility=X.isVisible?"visible":"hidden";let ce=X.placeAtRight?Ut-Ct:Ut+Ct,ke=X.screenY,Re=Jt.clamp(X.leafScreenX,8,C-8),Ve=Jt.clamp(X.leafScreenY,8,B-8),Qe=Re-ce,cn=Ve-ke,xe=Math.max(1,Math.hypot(Qe,cn)),uc=Qe/xe,dc=cn/xe,Go=Math.min(jg,xe*.2),fc=Math.min(xe-Go,Kg),pc=Re-uc*Go,mc=Ve-dc*Go,Bh=pc-uc*fc,zh=mc-dc*fc;X.connector.setAttribute("d",`M ${Bh.toFixed(1)} ${zh.toFixed(1)} L ${pc.toFixed(1)} ${mc.toFixed(1)}`),X.connector.style.opacity=X.isVisible?"1":"0"})}function _e(C=0,B=!1){let z=Math.min(G.getDelta(),.05);_=C,Lt&&(B?(d.position.copy(U),E.target.copy(R),Lt=!1):(d.position.lerp(U,1-Math.exp(-4.6*z)),E.target.lerp(R,1-Math.exp(-5.4*z))),Lt&&d.position.distanceTo(U)<.01&&E.target.distanceTo(R)<.01&&(d.position.copy(U),E.target.copy(R),Lt=!1)),E.update(),!re&&!B&&yt!=="overview"&&(P+=z);let st=P,q=St();kn().forEach(at=>{let X=at.system.uniforms,Ct=yt==="overview"&&q.has(at.record.id),Ft=yt==="overview"&&!re&&at.record.id===qt;if(Ct&&ot(at),at.targetPosition&&(B?at.system.points.position.copy(at.targetPosition):at.system.points.position.lerp(at.targetPosition,1-Math.exp(-4.8*z))),Number.isFinite(at.targetScale)){let ce=B?at.targetScale:zo(at.system.points.scale.x,at.targetScale,4.8,z);at.system.points.scale.setScalar(ce)}yt==="overview"?(Ct&&!B&&(at.motionElapsed+=z),X.u_time.value=at.motionElapsed||0):X.u_time.value=st,Number.isFinite(at.targetMotionStrength)&&(X.uMotionStrength.value=B?at.targetMotionStrength:zo(X.uMotionStrength.value,at.targetMotionStrength,Sh,z));let Ut=yt==="overview"?Ft?Bt:0:Bt;X.uRepelStrength.value=B?0:zo(X.uRepelStrength.value,Ut,Sh,z),X.uOpacity.value=B?at.targetOpacity:zo(X.uOpacity.value,at.targetOpacity,5,z)}),ue(),Ot(),g.render(m,d)}function oe(C=0){if(T=0,!!Z()){if(C-_<Yg){ut();return}_e(C),ut()}}let Ie=new ResizeObserver(ve);Ie.observe(e);let Rn=typeof IntersectionObserver=="function"?new IntersectionObserver(([C])=>{j=!!C?.isIntersecting,Tt()}):null;return Rn?.observe(i),g.domElement.addEventListener("pointerenter",ct),g.domElement.addEventListener("pointermove",pt),g.domElement.addEventListener("pointerleave",Et),g.domElement.addEventListener("pointerdown",vt),g.domElement.addEventListener("pointerup",Ht),g.domElement.addEventListener("pointercancel",Wt),E.addEventListener("start",Nt),E.addEventListener("end",te),window.addEventListener("keydown",le),window.addEventListener("focus",Tt),window.addEventListener("blur",nt),document.addEventListener("visibilitychange",Tt),et?.addEventListener?.("change",xt),i.dataset.reducedMotion=W?"true":"false",ve(),wt(re),Tt(),{isWebGLAvailable:!0,setTrees:Vo,focusTree:pn,focusVisualNote:zn,clearVisualNoteFocus:Ys,showOverview:qs,setMotionPaused:wt,destroy(){O||(O=!0,Rt(),Ie.disconnect(),Rn?.disconnect(),E.dispose(),g.domElement.removeEventListener("pointerenter",ct),g.domElement.removeEventListener("pointermove",pt),g.domElement.removeEventListener("pointerleave",Et),g.domElement.removeEventListener("pointerdown",vt),g.domElement.removeEventListener("pointerup",Ht),g.domElement.removeEventListener("pointercancel",Wt),E.removeEventListener("start",Nt),E.removeEventListener("end",te),window.removeEventListener("keydown",le),window.removeEventListener("focus",Tt),window.removeEventListener("blur",nt),document.removeEventListener("visibilitychange",Tt),et?.removeEventListener?.("change",xt),ft(),g.dispose(),g.domElement.remove(),i.dataset.renderer="destroyed")}}}globalThis.NeatMindLearningForest=Object.freeze({mount:Oh});})();
