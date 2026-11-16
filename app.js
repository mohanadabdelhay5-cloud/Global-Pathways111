(function(){
'use strict';
var ROUTES=['home','about','academy','bible','immersion','task-force','give','contact'];
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasG=!!window.gsap&&!reduce;
var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var cur=document.getElementById('cur'), body=document.body, hdr=$('#hdr'), veil=$('#veil'), current=null, busy=false, ctx=null, stopCanvas=null, lenis=null;

if(hasG){
  gsap.registerPlugin(ScrollTrigger);
  if(window.SplitText) gsap.registerPlugin(SplitText);
}
function toTop(){ if(lenis){lenis.scrollTo(0,{immediate:true,force:true})} window.scrollTo(0,0) }

/* ---------------- canvas line art ---------------- */
function startCanvas(cv){
  var c=cv.getContext('2d'), mode=cv.dataset.mode||'orbit', seed=+(cv.dataset.seed||1), raf=0, t0=performance.now(), mx=0, my=0, tx=0, ty=0;
  var cs=getComputedStyle(document.documentElement);
  var INK='15,42,34', LEAF=cs.getPropertyValue('--leaf').trim()||'#1E7A52', GOLD=cs.getPropertyValue('--gold').trim()||'#A8843A';
  function size(){var r=cv.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);cv.width=Math.max(2,r.width*d);cv.height=Math.max(2,r.height*d);c.setTransform(d,0,0,d,0,0);return r}
  var box=size();
  function dot(x,y,r,col){c.beginPath();c.arc(x,y,r,0,6.2832);c.fillStyle=col;c.fill()}
  function draw(now){
    var t=(now-t0)/1000, w=box.width, h=box.height, cx=w/2, cy=h/2, R=Math.min(w,h)*.42, i;
    mx+=(tx-mx)*.05; my+=(ty-my)*.05;
    c.clearRect(0,0,w,h); c.lineWidth=1;
    if(mode==='orbit'){
      var tilt=-.36+mx*.12+seed*.05;
      c.save();c.translate(cx,cy);c.rotate(tilt);
      c.strokeStyle='rgba('+INK+',.22)';c.beginPath();c.arc(0,0,R,0,6.2832);c.stroke();
      var N=9;
      for(i=0;i<N;i++){var a=(i/N)*Math.PI+t*.07*(1+seed*.03), rx=Math.abs(Math.sin(a))*R;
        c.strokeStyle='rgba('+INK+','+(.07+.1*Math.abs(Math.cos(a)))+')';c.beginPath();c.ellipse(0,0,Math.max(rx,.5),R,0,0,6.2832);c.stroke();
        var p=t*.25+i*1.7; dot(Math.cos(p)*rx,Math.sin(p)*R,2,'rgba('+INK+',.55)');}
      for(i=1;i<4;i++){var yy=(i/4-.5)*2*R*.82, rr=Math.sqrt(Math.max(R*R-yy*yy,0));c.strokeStyle='rgba('+INK+',.08)';c.beginPath();c.ellipse(0,yy,rr,rr*.16,0,0,6.2832);c.stroke()}
      c.restore();
      c.save();c.translate(cx,cy);c.rotate(-.42+my*.1);
      c.strokeStyle=LEAF;c.globalAlpha=.75;c.lineWidth=1.4;c.beginPath();c.ellipse(0,0,R*1.18,R*.5,0,0,6.2832);c.stroke();c.globalAlpha=1;
      var q=t*.35+seed; dot(Math.cos(q)*R*1.18,Math.sin(q)*R*.5,5,GOLD);
      c.strokeStyle='rgba('+INK+',.12)';c.lineWidth=1;c.beginPath();c.ellipse(0,0,R*1.36,R*.7,0,0,6.2832);c.stroke();
      var q2=-t*.2+2; dot(Math.cos(q2)*R*1.36,Math.sin(q2)*R*.7,3,'rgba('+INK+',.6)');
      c.restore();
    } else if(mode==='arch'){
      var base=cy+R*.95, n=8;
      for(i=0;i<n;i++){var k=(i+1)/n, rw=R*k*(1+.015*Math.sin(t*.8+i)), top=base-R*1.75*k- rw*.0;
        c.strokeStyle=i===n-3?LEAF:'rgba('+INK+','+(.1+.12*k)+')';c.lineWidth=i===n-3?1.4:1;
        c.beginPath();c.moveTo(cx-rw+mx*8*k,base);c.lineTo(cx-rw+mx*8*k,top+rw);c.arc(cx+mx*8*k,top+rw,rw,Math.PI,0);c.lineTo(cx+rw+mx*8*k,base);c.stroke();
        var pa=Math.PI+((t*.18+i*.37)%1)*Math.PI; dot(cx+mx*8*k+Math.cos(pa)*rw,top+rw+Math.sin(pa)*rw,i===n-3?4.5:2,i===n-3?GOLD:'rgba('+INK+',.5)');}
      c.strokeStyle='rgba('+INK+',.2)';c.beginPath();c.moveTo(cx-R*1.2,base);c.lineTo(cx+R*1.2,base);c.stroke();
    } else if(mode==='rings'){
      var m=9;
      for(i=0;i<m;i++){var r=R*(.18+.82*(i/(m-1))), s=t*(.12+.03*i)*(i%2?1:-1)+i*seed, len=1.2+((i*seed*1.3)%3.4);
        c.strokeStyle='rgba('+INK+',.08)';c.lineWidth=1;c.beginPath();c.arc(cx+mx*10,cy+my*10,r,0,6.2832);c.stroke();
        c.strokeStyle=i===5?LEAF:'rgba('+INK+',.32)';c.lineWidth=i===5?1.6:1;c.beginPath();c.arc(cx+mx*10,cy+my*10,r,s,s+len);c.stroke();
        dot(cx+mx*10+Math.cos(s+len)*r,cy+my*10+Math.sin(s+len)*r,i===5?5:2.2,i===5?GOLD:'rgba('+INK+',.55)');}
    } else { /* wave */
      var sunY=cy-R*.35; c.strokeStyle=GOLD;c.lineWidth=1.4;c.beginPath();c.arc(cx+R*.2+mx*14,sunY,R*.34,0,6.2832);c.stroke();
      c.strokeStyle='rgba('+INK+',.1)';c.lineWidth=1;c.beginPath();c.arc(cx+R*.2+mx*14,sunY,R*.5,0,6.2832);c.stroke();
      for(i=0;i<12;i++){var y0=cy+R*.08+i*R*.085, amp=6+i*1.6, x;
        c.strokeStyle=i===3?LEAF:'rgba('+INK+','+(.1+i*.018)+')';c.lineWidth=i===3?1.4:1;c.beginPath();
        for(x=cx-R*1.25;x<=cx+R*1.25;x+=6){var y=y0+Math.sin(x*.012+t*(.5+i*.04)+i*.8)*amp+Math.sin(x*.004-t*.3)*amp*.6; if(x===cx-R*1.25)c.moveTo(x,y);else c.lineTo(x,y)}
        c.stroke();}
    }
    if(!reduce) raf=requestAnimationFrame(draw);
  }
  function onMove(e){tx=(e.clientX/window.innerWidth-.5)*2;ty=(e.clientY/window.innerHeight-.5)*2}
  function onSize(){box=size(); if(reduce)draw(performance.now())}
  window.addEventListener('pointermove',onMove,{passive:true});window.addEventListener('resize',onSize);
  raf=requestAnimationFrame(draw);
  return function(){cancelAnimationFrame(raf);window.removeEventListener('pointermove',onMove);window.removeEventListener('resize',onSize)};
}

/* ---------------- hero art: copy each symbol inline so its shapes can be animated ---------------- */
$$('.hero__art svg.art').forEach(function(svg){
  var u=svg.querySelector('use'); if(!u) return; var sym=document.querySelector(u.getAttribute('href')); if(!sym) return;
  svg.removeChild(u); Array.prototype.forEach.call(sym.childNodes,function(n){svg.appendChild(n.cloneNode(true))});
});
/* ---------------- time of day: the light in the door follows the visitor's clock ---------------- */
(function(){
  var hr=new Date().getHours(), g=hr<5?'Good evening.':hr<12?'Good morning.':hr<18?'Good afternoon.':'Good evening.';
  var L=hr>=5&&hr<11?['#FFFBE8','#F7E3A4','#FFF4D2']:hr>=11&&hr<17?['#FFFDF2','#FBEDB4','#FFF6DA']:hr>=17&&hr<21?['#FFEFC4','#F0BC62','#FFE9BE']:['#F6EED6','#DCC58A','#F5ECD2'];
  var gr=document.getElementById('greet'); if(gr) gr.textContent=g;
  var st=document.querySelectorAll('#doorlight stop'); if(st.length===2){st[0].setAttribute('stop-color',L[0]);st[1].setAttribute('stop-color',L[1])}
  document.documentElement.style.setProperty('--light',L[2]);
})();
/* ---------------- clocks ---------------- */
function tick(){
  $$('[data-tz]').forEach(function(b){try{var o={hour:'numeric',minute:'2-digit'}; if(b.dataset.tz) o.timeZone=b.dataset.tz; b.textContent=new Intl.DateTimeFormat('en-US',o).format(new Date())}catch(e){b.textContent=''}});
}
tick(); setInterval(tick,20000);
/* ---------------- pathway finder ---------------- */
var who=$('#who'), whoOut=$('#whoOut'), doorsEl=$('.doors');
var NAMES={academy:'Global Pathways Academy',bible:'GPBible','immersion':'GP Immersion','task-force':'the Education Task Force',give:'the giving page'};
if(who) who.addEventListener('change',function(){
  var v=who.value; $$('.door',doorsEl).forEach(function(d){d.classList.toggle('is-open',d.dataset.go===v)});
  doorsEl.classList.toggle('has-pick',!!v&&v!=='give');
  whoOut.innerHTML=v?('Your door is '+NAMES[v]+'. <a href="#'+v+'" data-go="'+v+'">Step in</a>'):'';
});

/* ---------------- per-view setup ---------------- */
function initView(el,intro){
  var cv=$('.orbits',el); if(stopCanvas){stopCanvas();stopCanvas=null} if(cv) stopCanvas=startCanvas(cv);
  if(!hasG) return;
  ctx=gsap.context(function(){
    var d=intro?.15:.05;
    $$('[data-split]',el).forEach(function(h){
      if(window.SplitText){var sp=SplitText.create(h,{type:'lines',mask:'lines',linesClass:'ln'});
        gsap.from(sp.lines,{yPercent:115,duration:1.25,ease:'power4.out',stagger:.11,delay:d});}
      else gsap.from(h,{y:40,autoAlpha:0,duration:1,ease:'power3.out',delay:d});
    });
    gsap.from($$('.hero .eyebrow,.hero .crumb,.hero .goal',el),{y:18,autoAlpha:0,duration:.9,ease:'power3.out',delay:d});
    gsap.from($$('.hero [data-rise]',el),{y:26,autoAlpha:0,duration:1,ease:'power3.out',stagger:.1,delay:d+.35});
    if(cv) gsap.from(cv,{autoAlpha:0,scale:.92,duration:1.8,ease:'power2.out',delay:d});

    var items=$$('.blk .head,.blk .row,.blk .cards,.blk .door,.blk .person,.blk .panel,.blk .band,.blk .facts,.blk .tl__item,.blk .acc,.blk .days,.blk .sub,.blk .stats',el);
    gsap.set(items,{autoAlpha:0,y:38});
    ScrollTrigger.batch(items,{start:'top 92%',once:true,onEnter:function(b){gsap.to(b,{autoAlpha:1,y:0,duration:1,ease:'power3.out',stagger:.09,overwrite:true})}});

    $$('[data-words]',el).forEach(function(p){
      if(!window.SplitText) return;
      var s=SplitText.create(p,{type:'words',wordsClass:'w'});
      gsap.to(s.words,{opacity:1,ease:'none',stagger:.08,scrollTrigger:{trigger:p,start:'top 86%',end:'bottom 58%',scrub:.6}});
    });
    $$('[data-tl]',el).forEach(function(tl){
      gsap.to($('.tl__line i',tl),{scaleY:1,ease:'none',scrollTrigger:{trigger:tl,start:'top 70%',end:'bottom 70%',scrub:.5}});
    });
    $$('[data-lit]',el).forEach(function(bw){
      var sp=$$('span',bw);
      ScrollTrigger.create({trigger:bw,start:'top 82%',end:'bottom 45%',scrub:true,onUpdate:function(self){
        var n=Math.round(self.progress*sp.length); sp.forEach(function(s,i){s.classList.toggle('is-lit',i<n)});}});
    });
    $$('[data-to]',el).forEach(function(n){
      var o={v:0},to=+n.dataset.to,suf=n.dataset.suf||'';
      gsap.to(o,{v:to,duration:1.8,ease:'power2.out',scrollTrigger:{trigger:n,start:'top 92%',once:true},onUpdate:function(){n.textContent=Math.round(o.v)+suf}});
    });
    $$('.hero__art',el).forEach(function(fig){
      var im=fig.firstElementChild, parts=$$('g > *',im).slice(1);
      gsap.from(fig,{autoAlpha:0,y:30,duration:1.1,ease:'power3.out',delay:d+.1});
      gsap.from(parts,{y:70,scale:.5,autoAlpha:0,transformOrigin:'50% 100%',duration:1,ease:'back.out(1.5)',stagger:.1,delay:d+.45});
      parts.forEach(function(p){ if(p.tagName==='circle'&&p.getAttribute('fill')==='#C9A24B') gsap.to(p,{y:-10,duration:3,ease:'sine.inOut',yoyo:true,repeat:-1,delay:d+2}); });
      gsap.to(fig,{yPercent:-12,ease:'none',scrollTrigger:{trigger:fig.parentNode,start:'top top',end:'bottom top',scrub:true}});
    });
    $$('[data-enter]',el).forEach(function(sec){
      var stage=$('.enter',sec),text=$('.enter__text',sec),fig=$('.enter__art',sec),im=fig.firstElementChild,light=$('.enter__light',sec);
      gsap.from(fig,{autoAlpha:0,y:40,duration:1.6,ease:'power3.out',delay:d+.1});
      var mm=gsap.matchMedia();
      mm.add('(min-width: 900px)',function(){
        var dx=0,dy=0;
        function measure(){gsap.set(im,{x:0,y:0,scale:1});var r=im.getBoundingClientRect(),s=stage.getBoundingClientRect();dx=s.left+s.width/2-(r.left+r.width*.48);dy=s.top+s.height*.48-(r.top+r.height*.48)}
        measure();
        gsap.timeline({scrollTrigger:{trigger:sec,pin:stage,start:'top top',end:'+=150%',scrub:.7,invalidateOnRefresh:true,onRefreshInit:measure}})
          .to($('.leafg',im),{scaleX:.1,svgOrigin:'316 300',duration:.34,ease:'power2.inOut'},0)
          .to(text,{autoAlpha:0,y:-70,duration:.28,ease:'power1.in'},.1)
          .to(im,{x:function(){return dx},y:function(){return dy},scale:11,duration:.86,ease:'power2.in'},.2)
          .to(light,{autoAlpha:1,duration:.3,ease:'none'},.74);
      });
    });
    $$('[data-story]',el).forEach(function(st){
      var pin=$('.story__pin',st),track=$('.story__track',st),bar=$('.story__bar i',st),yrs=$$('.yr',st);
      var mm=gsap.matchMedia();
      mm.add('(min-width: 900px)',function(){
        var dist=function(){return Math.max(0,track.scrollWidth-window.innerWidth)};
        gsap.to(track,{x:function(){return -dist()},ease:'none',scrollTrigger:{trigger:pin,pin:true,start:'top top',end:function(){return '+='+dist()},scrub:.7,invalidateOnRefresh:true,
          onUpdate:function(self){gsap.set(bar,{scaleX:self.progress});var k=Math.min(yrs.length-1,Math.floor(self.progress*yrs.length*.999));yrs.forEach(function(y,i){y.classList.toggle('is-now',i<=k)})}}});
      });
    });
    $$('.band .mk',el).forEach(function(mk){
      gsap.fromTo(mk,{rotate:-14,yPercent:12},{rotate:8,yPercent:-6,ease:'none',scrollTrigger:{trigger:mk.parentNode,start:'top bottom',end:'bottom top',scrub:true}});
    });
  },el);
  requestAnimationFrame(function(){ if(lenis) lenis.resize(); ScrollTrigger.refresh(); });
}
function show(name,intro){
  $$('.view').forEach(function(v){v.classList.toggle('is-active',v.dataset.view===name)});
  $$('[data-go]').forEach(function(a){a.classList.toggle('is-on',a.dataset.go===name)});
  current=name; toTop(); hdr.classList.remove('is-solid');
  initView($('.view[data-view="'+name+'"]'),intro);
}
function go(name){
  if(ROUTES.indexOf(name)<0) name='home';
  closeMenu(); if(cur) cur.classList.remove('is-on');
  if(name===current){ if(lenis) lenis.scrollTo(0); else window.scrollTo({top:0,behavior:'smooth'}); return; }
  if(busy) return;
  try{ if(location.hash!=='#'+name) location.hash=name; }catch(e){}
  if(!hasG){ show(name,false); return; }
  busy=true;
  var el=$('.view[data-view="'+name+'"]'), idx=ROUTES.indexOf(name);
  $('#veilName').textContent=el.dataset.title;
  var art={about:'about',academy:'academy',bible:'bible',immersion:'immersion','task-force':'taskforce',give:'give',contact:'contact'}[name], vs=$('#veilSvg');
  $('#veilUse').setAttribute('href',art?'#art-'+art:'#gp-mark'); vs.setAttribute('viewBox',art?'0 0 400 520':'0 0 560 530'); vs.classList.toggle('is-art',!!art); $('#veilNo').textContent=idx?('0'+idx):'Foundation';
  var A='inset(100% 0% 0% 0% round 50vw 50vw 0vw 0vw)', B='inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)', C='inset(0% 0% 100% 0% round 0vw 0vw 0vw 0vw)';
  gsap.timeline({onComplete:function(){busy=false}})
    .set(veil,{visibility:'visible',clipPath:A})
    .fromTo('.veil__in',{y:60,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,ease:'power3.out'},.25)
    .to(veil,{clipPath:B,duration:.85,ease:'power4.inOut'},0)
    .add(function(){ if(ctx){ctx.revert();ctx=null} show(name,true); })
    .to('.veil__in',{y:-40,autoAlpha:0,duration:.45,ease:'power2.in'},'+=.18')
    .to(veil,{clipPath:C,duration:.85,ease:'power4.inOut'},'-=.2')
    .set(veil,{visibility:'hidden'});
}

/* ---------------- chrome ---------------- */
function closeMenu(){ if(body.classList.contains('menu-open')){body.classList.remove('menu-open');$('#burger').setAttribute('aria-expanded','false'); if(lenis)lenis.start();} }
$('#burger').addEventListener('click',function(){
  var open=body.classList.toggle('menu-open'); this.setAttribute('aria-expanded',open?'true':'false');
  if(lenis){open?lenis.stop():lenis.start()}
});
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('[data-go]');
  if(a){e.preventDefault();go(a.dataset.go);return}
  var s=e.target.closest&&e.target.closest('[data-scroll]');
  if(s){var t=$(s.dataset.scroll); if(t){ if(lenis) lenis.scrollTo(t,{offset:-70,duration:1.4}); else t.scrollIntoView({behavior:reduce?'auto':'smooth'}); }}
});
window.addEventListener('hashchange',function(){var n=location.hash.replace('#','')||'home'; if(n!==current) go(n)});
var prog=$('#prog'),badge=$('#badge');var bgp=reduce?null:$('#bgp');
badge.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduce?'auto':'smooth'})});
var glow=$('#glow');
if(glow&&hasG&&matchMedia('(hover:hover) and (pointer:fine)').matches){var gx=gsap.quickTo(glow,'x',{duration:.9,ease:'power3'}),gy=gsap.quickTo(glow,'y',{duration:.9,ease:'power3'});window.addEventListener('pointermove',function(e){gx(e.clientX);gy(e.clientY)},{passive:true})}
document.addEventListener('keydown',function(e){if(e.metaKey||e.ctrlKey||e.altKey)return;var t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;if(e.key>='0'&&e.key<='7')go(ROUTES[+e.key])});
window.addEventListener('scroll',function(){
  var y=window.scrollY||document.documentElement.scrollTop, max=document.documentElement.scrollHeight-window.innerHeight;
  hdr.classList.toggle('is-solid',y>24); if(bgp) bgp.style.transform='translate3d(0,'+(-((y*.07)%300))+'px,0)'; var pr=max>0?Math.min(1,y/max):0;
  if(prog){prog.style.strokeDashoffset=169.65*(1-pr); badge.classList.toggle('is-on',y>320); badge.querySelector('.badge__mk').style.transform='rotate('+(pr*360)+'deg)';}
},{passive:true});
if(cur&&hasG&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  var qx=gsap.quickTo(cur,'x',{duration:.35,ease:'power3'}),qy=gsap.quickTo(cur,'y',{duration:.35,ease:'power3'}),lab=$('span',cur);
  window.addEventListener('pointermove',function(e){qx(e.clientX);qy(e.clientY);
    var dr=e.target.closest&&e.target.closest('.door'); if(dr){lab.textContent='Enter'} cur.classList.toggle('is-on',!!dr);},{passive:true});
}

/* ---------------- immersion days ---------------- */
var DAYS=['Arrival and Orientation','History and Culture','Farm Immersion','Church and Health','Science and Adventure','Adventure, Science and Service','Leadership, Science and Adventure','Farm-to-Table','Service and Farewell','Departure'];
$$('[data-days]').forEach(function(w){
  var dial=$('.days__dial',w), out=$('.days__out',w), no=$('.num',out), h=$('h3',out);
  DAYS.forEach(function(name,i){
    var b=document.createElement('button'); b.className='day'+(i?'':' is-on'); b.type='button'; b.textContent=(i<9?'0':'')+(i+1);
    b.setAttribute('role','tab'); b.setAttribute('aria-label','Day '+(i+1)+': '+name); b.setAttribute('aria-selected',i?'false':'true');
    b.addEventListener('click',function(){
      $$('.day',dial).forEach(function(x){x.classList.remove('is-on');x.setAttribute('aria-selected','false')}); b.classList.add('is-on'); b.setAttribute('aria-selected','true');
      var set=function(){no.textContent='Day '+(i<9?'0':'')+(i+1); h.textContent=name};
      if(hasG){gsap.timeline().to([no,h],{y:-16,autoAlpha:0,duration:.22,ease:'power2.in'}).add(set).fromTo([no,h],{y:22,autoAlpha:0},{y:0,autoAlpha:1,duration:.55,ease:'power3.out',stagger:.05})} else set();
    });
    dial.appendChild(b);
  });
});

/* ---------------- forms: prepare a message, never pretend to send ---------------- */
$$('form[data-form]').forEach(function(f){
  var draft=f.parentNode.querySelector('.draft'), pre=$('pre',draft), mail=$('[data-mail]',draft), copy=$('[data-copy]',draft);
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var lines=[], subj=f.dataset.form;
    $$('input,select,textarea',f).forEach(function(i){ if(i.value.trim()){ if(i.name==='Subject') subj=i.value.trim(); else lines.push(i.name+': '+i.value.trim()); } });
    var text=lines.join('\n'); pre.textContent=text;
    mail.href='mailto:hello@globalpathways.org?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(text);
    draft.classList.add('is-on'); copy.textContent='Copy message';
    if(lenis) lenis.resize(); if(hasG) ScrollTrigger.refresh();
  });
  copy.addEventListener('click',function(){
    var done=function(){copy.textContent='Copied'}, fail=function(){var r=document.createRange();r.selectNodeContents(pre);var s=getSelection();s.removeAllRanges();s.addRange(r);copy.textContent='Selected. Press Ctrl/⌘+C'};
    try{navigator.clipboard.writeText(pre.textContent).then(done,fail)}catch(err){fail()}
  });
});

/* ---------------- start ---------------- */
var first=(location.hash||'').replace('#',''); if(ROUTES.indexOf(first)<0) first='home';
if(hasG){
  show(first,true);
  gsap.timeline({onComplete:function(){document.documentElement.classList.remove('intro')}})
    .set(veil,{visibility:'visible',clipPath:'inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)'})
    .from('.veil__in',{y:40,autoAlpha:0,duration:.7,ease:'power3.out'})
    .to('.veil__in',{y:-40,autoAlpha:0,duration:.45,ease:'power2.in'},'+=.45')
    .to(veil,{clipPath:'inset(0% 0% 100% 0% round 0vw 0vw 50vw 50vw)',duration:.95,ease:'power4.inOut'},'-=.15')
    .set(veil,{visibility:'hidden'});
} else { document.documentElement.classList.remove('intro'); show(first,false); }
})();
