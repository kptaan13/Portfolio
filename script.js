// ── CURTAIN INTRO ─────────────────────────────────────────────────────────────
(function(){
  const c=document.getElementById('curtain');
  if(!c) return;
  // Always play on every page load
  setTimeout(()=>c.classList.add('away'),850);
  setTimeout(()=>c.remove(),1850);
})();

// ── SCROLL PROGRESS BAR ───────────────────────────────────────────────────────
const prog=document.getElementById('prog');
window.addEventListener('scroll',()=>{
  if(!prog) return;
  prog.style.width=(scrollY/(document.documentElement.scrollHeight-innerHeight)*100)+'%';
},{passive:true});

// On Windows laptops, `maxTouchPoints` can be > 0 even when using a mouse.
// Use hover/pointer capabilities instead so the custom cursor isn't accidentally disabled.
let isTouchDevice = window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches ?? false;

// ── 1. CURSOR + GLOW TRAIL ──────────────────────────────────────────────────
const c1=document.getElementById('cur'),c2=document.getElementById('cur2');
let mx=0,my=0,rx=0,ry=0;
// ── SPOTLIGHT / TORCH EFFECT (desktop only) ──────────────────────────────────
if(!isTouchDevice){
  document.addEventListener('mousemove',e=>{
    document.body.style.background=`radial-gradient(ellipse 380px 380px at ${e.clientX}px ${e.clientY}px,rgba(28,24,18,.97) 0%,var(--bg) 68%)`;
  },{passive:true});
}

if(!isTouchDevice && c1 && c2){
  // Trail canvas
  const tc=document.getElementById('trail-canvas');
  const tcx=tc?.getContext?.('2d');
  let TW,TH;
  function rszt(){
    if(!tc) return;
    TW=tc.width=innerWidth;
    TH=tc.height=innerHeight;
  }
  rszt();
  window.addEventListener('resize',rszt,{passive:true});
  const trail=[];
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    c1.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
    trail.push({x:mx,y:my,r:14,o:.55,t:Date.now()});
    if(trail.length>32)trail.shift();
  },{passive:true});
  (function trailLoop(){
    if(!tcx) return;
    tcx.clearRect(0,0,TW,TH);
    const now=Date.now();
    for(let i=0;i<trail.length;i++){
      const pt=trail[i],age=(now-pt.t)/500,fade=Math.max(0,1-age);
      const grad=tcx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,pt.r*(1+age));
      grad.addColorStop(0,`rgba(212,175,55,${.38*fade})`);
      grad.addColorStop(.5,`rgba(201,165,90,${.12*fade})`);
      grad.addColorStop(1,'rgba(201,165,90,0)');
      tcx.beginPath();tcx.arc(pt.x,pt.y,pt.r*(1+age),0,Math.PI*2);
      tcx.fillStyle=grad;tcx.fill();
    }
    // clean old
    const cutoff=Date.now()-500;
    while(trail.length&&trail[0].t<cutoff)trail.shift();
    requestAnimationFrame(trailLoop);
  })();
  (function loop(){
    rx+=(mx-rx)*.1;
    ry+=(my-ry)*.1;
    c2.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,.pill,.ti,.val,.cp,.hf-tag').forEach(el=>{
    el.addEventListener('mouseenter',()=>c2.classList.add('h'));
    el.addEventListener('mouseleave',()=>c2.classList.remove('h'));
  });
  document.addEventListener('mousedown',()=>burst(mx,my));
} else {
  // hide cursors on touch
  if(c1) c1.style.display='none';
  if(c2) c2.style.display='none';
  const t=document.getElementById('trail-canvas');
  if(t) t.style.display='none';
  // ensure the default cursor remains usable if we disable the custom one
  document.body.style.cursor='auto';
}

// If a real mouse/trackpad moves, force-enable the custom cursor (fixes false touch detection)
document.addEventListener('mousemove',()=>{
  if(!isTouchDevice) return;
  isTouchDevice = false;
  document.body.style.cursor='none';
  if(c1) c1.style.display='';
  if(c2) c2.style.display='';
  const t=document.getElementById('trail-canvas');
  if(t) t.style.display='';
},{passive:true, once:true});

function burst(x,y){
  for(let i=0;i<10;i++){
    const p=document.createElement('div');
    p.className='particle';
    const a=Math.random()*Math.PI*2,d=35+Math.random()*55,s=2+Math.random()*3;
    p.style.cssText=`left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${Math.random()>.5?'rgba(201,165,90,.8)':'rgba(240,236,226,.5)'};--tx:${Math.cos(a)*d}px;--ty:${Math.sin(a)*d}px;`;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),650);
  }
}

// ── 8. STAR PARTICLES + MOUSE PARALLAX ─────────────────────────────────────
const cv=document.getElementById('stars'),cx=cv?.getContext?.('2d');
let W,H,S=[],pmx=0,pmy=0,targPX=0,targPY=0;
function rsz(){
  if(!cv) return;
  W=cv.width=innerWidth;
  H=cv.height=innerHeight;
}
rsz();
window.addEventListener('resize',rsz,{passive:true});
function initS(){
  if(!cv) return;
  S=[];
  for(let i=0;i<140;i++)S.push({
    bx:Math.random()*W,by:Math.random()*H,
    x:0,y:0,
    r:.2+Math.random()*1.1,
    vx:(Math.random()-.5)*.14,vy:(Math.random()-.5)*.14,
    o:.1+Math.random()*.45,p:Math.random()*Math.PI*2,
    depth:.2+Math.random()*.8   // parallax depth factor
  });
}
initS();
if(!isTouchDevice){
  document.addEventListener('mousemove',e=>{
    targPX=(e.clientX/W-.5)*28;
    targPY=(e.clientY/H-.5)*18;
  },{passive:true});
}
(function draw(){
  if(!cx) return;
  pmx+=(targPX-pmx)*.04;pmy+=(targPY-pmy)*.04;
  cx.clearRect(0,0,W,H);
  S.forEach(s=>{
    s.bx+=s.vx;s.by+=s.vy;s.p+=.012;
    if(s.bx<0)s.bx=W;if(s.bx>W)s.bx=0;
    if(s.by<0)s.by=H;if(s.by>H)s.by=0;
    // parallax offset
    s.x=s.bx+pmx*s.depth;
    s.y=s.by+pmy*s.depth;
    const op=s.o*(.65+.35*Math.sin(s.p));
    cx.beginPath();cx.arc(s.x,s.y,s.r,0,Math.PI*2);
    cx.fillStyle=`rgba(201,165,90,${op})`;cx.fill();
  });
  for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++){
    const dx=S[i].x-S[j].x,dy=S[i].y-S[j].y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<85){
      cx.beginPath();cx.moveTo(S[i].x,S[i].y);cx.lineTo(S[j].x,S[j].y);
      cx.strokeStyle=`rgba(201,165,90,${.055*(1-d/85)})`;
      cx.lineWidth=.5;cx.stroke();
    }
  }
  requestAnimationFrame(draw);
})();

// ── 2. TYPEWRITER ───────────────────────────────────────────────────────────
const phrases=['Creative Developer','Full-Stack Engineer','UI Craftsman','React Specialist'];
let pi=0,ci=0,del=false;
const tw=document.getElementById('tw');
function type(){
  if(!tw) return;
  const cur=phrases[pi];
  tw.textContent=del?cur.slice(0,ci--):cur.slice(0,ci++);
  if(!del&&ci>cur.length){del=true;setTimeout(type,2200);return;}
  if(del&&ci<0){del=false;pi=(pi+1)%phrases.length;}
  setTimeout(type,del?75:140);
}
setTimeout(type,2200);

// ── NAV SCROLL ──────────────────────────────────────────────────────────────
window.addEventListener('scroll',()=>{
  const nav=document.getElementById('nav');
  if(!nav) return;
  nav.classList.toggle('s',scrollY>60);
},{passive:true});

// ── GENERAL REVEAL OBSERVER ─────────────────────────────────────────────────
const obs=new IntersectionObserver(es=>{
  es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on');});
},{threshold:.1});
document.querySelectorAll('.rv,.rv-l,.rv-r,.sk-item,.ei').forEach(el=>obs.observe(el));

// ── 3. STAT COUNTER ─────────────────────────────────────────────────────────
const sObs=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting){
      document.querySelectorAll('[data-c]').forEach(el=>{
        const t=+el.dataset.c;let start=null;
        const step=ts=>{
          if(!start)start=ts;
          const p=Math.min((ts-start)/1200,1),ease=1-Math.pow(1-p,3);
          el.textContent=Math.round(ease*t)+(t===100?'%':'+');
          if(p<1)requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      sObs.disconnect();
    }
  });
},{threshold:.3});
const st=document.querySelector('.stats');if(st)sObs.observe(st);

// ── 5. 3D TILT (desktop only) ───────────────────────────────────────────────
if(!isTouchDevice){
  document.querySelectorAll('.pcard').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateY(${x*14}deg) rotateX(${-y*14}deg) scale(1.025)`;
      card.style.transition='transform .06s ease';
    },{passive:true});
    card.addEventListener('mouseleave',()=>{card.style.transform='';card.style.transition='transform .65s ease';});
  });
}

// ── 6. TIMELINE DRAW ────────────────────────────────────────────────────────
const expLine=document.querySelector('.exp-line');
if(expLine){
  const tlObs=new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.isIntersecting){expLine.classList.add('drawn');tlObs.disconnect();}
    });
  },{threshold:.05});
  tlObs.observe(expLine.parentElement);
}

// ── 7. TEXT SCRAMBLE ────────────────────────────────────────────────────────
const SCRAMBLE_SPEED = 0.85; // faster (smaller = slower)
class TextScramble{
  constructor(el){this.el=el;this.chars='!<>-_\\/[]{}—=+*^?#@$%&~';this.update=this.update.bind(this);}
  setText(newText){
    const old=this.el.innerText,len=Math.max(old.length,newText.length);
    return new Promise(res=>{
      this.queue=[];
      for(let i=0;i<len;i++){
        const from=old[i]||'',to=newText[i]||'';
        // Larger ranges = longer, slower scramble
        const start=Math.floor(Math.random()*34);
        const end=start+Math.floor(Math.random()*34)+14;
        this.queue.push({from,to,start,end});
      }
      cancelAnimationFrame(this.raf);
      this.frame=0;this.resolve=res;this.update();
    });
  }
  update(){
    let out='',done=0;
    this.queue.forEach(({from,to,start,end})=>{
      if(this.frame>=end){done++;out+=to;}
      else if(this.frame>=start){
        const g=this.chars[Math.floor(Math.random()*this.chars.length)];
        out+=`<span style="color:var(--gold);opacity:.45">${g}</span>`;
      } else out+=from;
    });
    this.el.innerHTML=out;
    if(done===this.queue.length){this.resolve();return;}
    this.frame+=SCRAMBLE_SPEED;this.raf=requestAnimationFrame(this.update);
  }
}

// Apply scramble to all .sec-h elements on scroll-in
const scrambleObs=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(!e.isIntersecting)return;
    const heading=e.target;
    const plainText=heading.innerText;
    const ts=new TextScramble(heading);
    ts.setText(plainText).then(()=>{heading.innerHTML=heading.innerHTML;});
    scrambleObs.unobserve(heading);
  });
},{threshold:.4});
document.querySelectorAll('.sec-h,.contact-h').forEach(h=>scrambleObs.observe(h));

// ── DRAG SCROLL ─────────────────────────────────────────────────────────────
const ps=document.getElementById('ps');let drag=false,dsx,dsl;
if(ps){
  ps.addEventListener('mousedown',e=>{drag=true;dsx=e.pageX-ps.offsetLeft;dsl=ps.scrollLeft;});
  ps.addEventListener('mouseleave',()=>drag=false);
  ps.addEventListener('mouseup',()=>drag=false);
  ps.addEventListener('mousemove',e=>{if(!drag)return;e.preventDefault();ps.scrollLeft=dsl-(e.pageX-ps.offsetLeft-dsx)*1.5;});
}
window.scrollP = function scrollP(d){ps?.scrollBy?.({left:d*420,behavior:'smooth'});}

// ── ABOUT CODE ──────────────────────────────────────────────────────────────
const code=`const rohan = {\n  name: "Rohan Kakkar",\n  role: "Creative Developer",\n  skills: ["React","Next.js","Node.js","Python","HTML/CSS","Figma"],\n  passion: "Building beautiful things",\n  available: true,\n  contact: {\n    email: "rohan61034kakkar@gmail.com",\n    github: "kptaan13",\n    linkedin: "thekrohankakkar"\n  }\n};\n\nfunction createExperience(client) {\n  return {\n    design: rohan.passion,\n    code: rohan.skills,\n    deliver: "On time, every time"\n  };\n}\n\nexport default rohan;\n// Always building.\n`;
const af=document.getElementById('afCode');
if(af) af.textContent=code+'\n'+code;

// ── CODE BLOCK ──────────────────────────────────────────────────────────────
const lines=[
  {d:.1,h:'<span class="cm">// Custom particle system hook</span>'},
  {d:.2,h:'<span class="kw">const</span> <span class="fn">useParticles</span> = (<span class="vr">count</span> = 80) => {'},
  {d:.3,h:'  <span class="kw">const</span> <span class="vr">ref</span> = <span class="fn">useRef</span>(null);'},
  {d:.4,h:'  <span class="kw">const</span> <span class="vr">pts</span> = <span class="fn">useRef</span>([]);'},
  {d:.5,h:''},
  {d:.6,h:'  <span class="fn">useEffect</span>(() => {'},
  {d:.7,h:'    <span class="kw">const</span> <span class="vr">ctx</span> = ref.current.<span class="fn">getContext</span>(<span class="st">\'2d\'</span>);'},
  {d:.8,h:'    pts.current = <span class="fn">Array.from</span>('},
  {d:.9,h:'      { length: <span class="vr">count</span> }, () => <span class="fn">init</span>(ctx)'},
  {d:1.0,h:'    );'},
  {d:1.1,h:''},
  {d:1.2,h:'    <span class="kw">const</span> <span class="fn">loop</span> = () => {'},
  {d:1.3,h:'      <span class="fn">requestAnimationFrame</span>(loop);'},
  {d:1.4,h:'      <span class="fn">render</span>(ctx, pts.current);'},
  {d:1.5,h:'    };'},
  {d:1.6,h:'    <span class="fn">loop</span>();'},
  {d:1.7,h:'  }, []);'},
  {d:1.8,h:''},
  {d:1.9,h:'  <span class="kw">return</span> <span class="vr">ref</span>;'},
  {d:2.0,h:'};'}
];
const co=document.getElementById('codeOut');
if(co){
  lines.forEach((l,i)=>{
    const s=document.createElement('span');
    s.className='cl';
    s.innerHTML=`<span class="ln">${String(i+1).padStart(2,'0')}</span>${l.h}`;
    s.style.animationDelay=`${l.d+1.6}s`;
    co.appendChild(s);
  });
}

// ── WATCH CLOCK ─────────────────────────────────────────────────────────────
function tickWatch(){
  const n=new Date(),
    h=(n.getHours()%12+n.getMinutes()/60)*30,
    m=(n.getMinutes()+n.getSeconds()/60)*6,
    s=n.getSeconds()*6;
  const wh=document.getElementById('wHour'),
    wm=document.getElementById('wMin'),
    ws=document.getElementById('wSec');
  if(wh)wh.style.transform=`translateX(-50%) rotate(${h}deg)`;
  if(wm)wm.style.transform=`translateX(-50%) rotate(${m}deg)`;
  if(ws)ws.style.transform=`translateX(-50%) rotate(${s}deg)`;
}
tickWatch();
setInterval(tickWatch,1000);

// ── CONTACT FORM ────────────────────────────────────────────────────────────
window.doForm = async function doForm(e){
  e.preventDefault();
  const btn=e.target.querySelector('.form-btn'),orig=btn.innerHTML;
  btn.innerHTML='<span>Sending…</span>';
  btn.disabled=true;
  const fd=new FormData(e.target);
  const payload={};
  fd.forEach((val,key)=>payload[key]=val);
  try{
    const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const json=await res.json();
    btn.innerHTML=orig;
    btn.disabled=false;
    const ok=document.getElementById('formOk');
    if(json.success){
      e.target.reset();
      ok.style.display='block';
      ok.style.color='#4ade80';
      ok.textContent='✓ Message received! I\'ll reply within 24 hours.';
    }else{
      ok.style.display='block';
      ok.style.color='#f87171';
      ok.textContent='✗ Something went wrong. Please email me directly.';
    }
    setTimeout(()=>ok.style.display='none',6000);
  }catch(err){
    btn.innerHTML=orig;
    btn.disabled=false;
    const ok=document.getElementById('formOk');
    ok.style.display='block';
    ok.style.color='#f87171';
    ok.textContent='✗ Network error. Please email rohan61034kakkar@gmail.com';
    setTimeout(()=>ok.style.display='none',6000);
  }
}

// ── HAMBURGER ───────────────────────────────────────────────────────────────
window.toggleMenu = function toggleMenu(){
  document.getElementById('ham')?.classList.toggle('open');
  document.getElementById('mobMenu')?.classList.toggle('open');
}

// ── ACTIVE NAV ──────────────────────────────────────────────────────────────
window.addEventListener('scroll',()=>{
  let cur='';
  document.querySelectorAll('section[id]').forEach(s=>{if(scrollY>=s.offsetTop-220)cur=s.id;});
  document.querySelectorAll('.nav-links a').forEach(a=>{
    a.style.color=a.getAttribute('href')==='#'+cur?'var(--gold)':'';
  });
},{passive:true});
