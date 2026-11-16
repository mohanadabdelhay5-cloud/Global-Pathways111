(function(){
'use strict';
var ROUTES=['home','journey','philosophy','safety','conduct','faq','inquire'];
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasG=!!window.gsap&&!reduce;
var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var body=document.body, root=document.documentElement, hdr=$('#hdr'), veil=$('#veil'), cur=$('#cur'), current=null, busy=false, ctx=null;
if(hasG){gsap.registerPlugin(ScrollTrigger); if(window.SplitText) gsap.registerPlugin(SplitText)}

/* copy each hero symbol inline so its shapes can move */
$$('.hero__art svg.art').forEach(function(svg){var u=svg.querySelector('use'); if(!u) return; var sym=document.querySelector(u.getAttribute('href')); if(!sym) return; svg.removeChild(u); Array.prototype.forEach.call(sym.childNodes,function(n){svg.appendChild(n.cloneNode(true))})});

/* course filter */
$$('.fbtn').forEach(function(b){b.addEventListener('click',function(){
  $$('.fbtn').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});
  var f=b.dataset.f, shown=[]; $$('.course').forEach(function(c){var on=f==='all'||c.dataset.cat===f; c.hidden=!on; if(on) shown.push(c)});
  if(hasG){gsap.fromTo(shown,{y:18,autoAlpha:0},{y:0,autoAlpha:1,duration:.5,ease:'power3.out',stagger:.03,overwrite:true}); ScrollTrigger.refresh()}
})});
/* tabbed panels: trivium and traits */
function tabs(btnSel,panSel,key){$$(btnSel).forEach(function(b){b.addEventListener('click',function(){
  $$(btnSel).forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});
  $$(panSel).forEach(function(p){var on=p.dataset[key]===b.dataset[key]; p.classList.toggle('is-on',on); if(on&&hasG) gsap.from(p.children,{y:14,autoAlpha:0,duration:.45,ease:'power3.out',stagger:.05})});
})})}
tabs('.triv__tab','.triv__pan','s'); tabs('.tbtn','.tpan','t');

/* contact: build the email from the form and address it to the right team; the visitor sends it */
var cform=$('#cform');
if(cform){
  var TO={'Family':'admissions@gp.academy','School / Administrator':'partnerships@gp.academy','Other':'info@gp.academy'}, csend=$('#csend'), cprev=$('#cprev'), cto=$('#cto'), ccopy=$('#ccopy');
  var csync=function(){
    var to=TO[$('#c-role').value]||'info@gp.academy', lines=[];
    $$('[data-k]',cform).forEach(function(i){var v=i.value.replace(/[ \t]+/g,' ').trim(); if(v) lines.push(i.dataset.k+': '+v)});
    var text=lines.join('\n'); cprev.textContent=text; cto.textContent=to;
    csend.href='mailto:'+to+'?subject='+encodeURIComponent('Inquiry from the Academy website')+'&body='+encodeURIComponent(text);
  };
  cform.addEventListener('input',csync); cform.addEventListener('change',csync); cform.addEventListener('submit',function(e){e.preventDefault()}); csync();
  ccopy.addEventListener('click',function(){var ok=function(){ccopy.textContent='Copied'},no=function(){var r=document.createRange();r.selectNodeContents(cprev);var s=getSelection();s.removeAllRanges();s.addRange(r);ccopy.textContent='Selected. Press Ctrl/⌘+C'};try{navigator.clipboard.writeText(cprev.textContent).then(ok,no)}catch(err){no()}});
}

/* the journey: ten days under a sun that crosses the sky */
(function(){
  var D=(window.GPI||{}).days||[], CD=(window.GPI||{}).cats||{}, btns=$$('.jday'), out=$('#jout'), sun=$('#sun'), say=$('#catsay'); if(!btns.length) return;
  function place(i){var t=i/(btns.length-1), x=4+t*92, y=100-(1-Math.pow(2*t-1,2))*105+ -7; sun.style.left=x+'%'; sun.style.top=y+'%'}
  function pick(i,quiet){
    btns.forEach(function(b,k){b.classList.toggle('is-on',k===i);b.setAttribute('aria-selected',k===i?'true':'false')}); place(i);
    var d=D[i], set=function(){out.innerHTML='<span class="num">Day '+(i<9?'0':'')+(i+1)+'</span><h3>'+d.t+'</h3><div class="chips">'+(d.c.length?d.c.map(function(c){return '<span class="chip">'+c+'</span>'}).join(''):'<span class="chip">Travel day</span>')+'</div>'};
    if(hasG&&!quiet){gsap.timeline().to(out.children,{y:-14,autoAlpha:0,duration:.2,ease:'power2.in'}).add(set).add(function(){gsap.fromTo(out.children,{y:20,autoAlpha:0},{y:0,autoAlpha:1,duration:.5,ease:'power3.out',stagger:.05})})} else set();
  }
  btns.forEach(function(b,i){b.addEventListener('click',function(){pick(i)})});
  $$('#cats .fbtn').forEach(function(f){f.addEventListener('click',function(){
    $$('#cats .fbtn').forEach(function(x){x.setAttribute('aria-pressed',x===f?'true':'false')});
    var c=f.dataset.c, n=0; btns.forEach(function(b){var hit=!c||(' '+b.dataset.c+' ').indexOf(' '+c+' ')>=0; b.classList.toggle('is-dim',!hit); b.classList.toggle('is-hit',!!c&&hit); if(c&&hit)n++});
    say.textContent=c?(CD[c]+' '+n+(n===1?' day.':' days.')):'Choose a theme to light up its days.';
  })});
  pick(0,true);
})();

function initView(el,intro){
  if(!hasG) return;
  ctx=gsap.context(function(){
    var d=intro?.15:.05;
    $$('[data-split]',el).forEach(function(h){ if(window.SplitText){var sp=SplitText.create(h,{type:'lines',mask:'lines',linesClass:'ln'}); gsap.from(sp.lines,{yPercent:115,duration:1.2,ease:'power4.out',stagger:.11,delay:d})} else gsap.from(h,{y:40,autoAlpha:0,duration:1,delay:d}) });
    gsap.from($$('.hero .crumb',el),{y:18,autoAlpha:0,duration:.9,ease:'power3.out',delay:d});
    gsap.from($$('.hero [data-rise]',el),{y:26,autoAlpha:0,duration:1,ease:'power3.out',stagger:.1,delay:d+.35});
    $$('.hero__art',el).forEach(function(fig){
      var im=fig.firstElementChild, parts=$$('g > *',im).slice(1);
      gsap.from(fig,{autoAlpha:0,y:30,duration:1.1,ease:'power3.out',delay:d+.1});
      gsap.from(parts,{y:70,scale:.5,autoAlpha:0,transformOrigin:'50% 100%',duration:1,ease:'back.out(1.5)',stagger:.09,delay:d+.45});
      parts.forEach(function(p){ if(p.tagName==='circle'&&p.getAttribute('fill')==='#C9A24B') gsap.to(p,{y:-10,duration:3,ease:'sine.inOut',yoyo:true,repeat:-1,delay:d+2}) });
      gsap.to(fig,{yPercent:-10,ease:'none',scrollTrigger:{trigger:fig.parentNode,start:'top top',end:'bottom top',scrub:true}});
    });
    var items=$$('.blk .head,.blk .row,.blk .cards,.blk .panel,.blk .band,.blk .facts,.blk .acc,.blk .stats,.blk .way,.blk .filter,.blk .courses,.blk .chips,.blk .triv,.blk .traits,.blk .roster,.blk .sub,.blk .mails,.blk .bigwords,.blk .ticks,.blk .jr,.blk .strata',el);
    gsap.set(items,{autoAlpha:0,y:38});
    ScrollTrigger.batch(items,{start:'top 92%',once:true,onEnter:function(b){gsap.to(b,{autoAlpha:1,y:0,duration:1,ease:'power3.out',stagger:.08,overwrite:true})}});
    $$('[data-words]',el).forEach(function(p){ if(!window.SplitText) return; var s=SplitText.create(p,{type:'words',wordsClass:'w'}); gsap.to(s.words,{opacity:1,ease:'none',stagger:.08,scrollTrigger:{trigger:p,start:'top 86%',end:'bottom 58%',scrub:.6}}) });
    $$('[data-lit]',el).forEach(function(bw){var sp=$$('span',bw); ScrollTrigger.create({trigger:bw,start:'top 82%',end:'bottom 45%',scrub:true,onUpdate:function(self){var n=Math.round(self.progress*sp.length); sp.forEach(function(s,i){s.classList.toggle('is-lit',i<n)})}})});
    $$('[data-to]',el).forEach(function(n){var o={v:0},to=+n.dataset.to,suf=n.dataset.suf||''; if(!to) return; gsap.to(o,{v:to,duration:1.6,ease:'power2.out',scrollTrigger:{trigger:n,start:'top 92%',once:true},onUpdate:function(){n.textContent=Math.round(o.v)+suf}})});
    $$('.band .mk',el).forEach(function(mk){gsap.fromTo(mk,{rotate:-14,yPercent:12},{rotate:8,yPercent:-6,ease:'none',scrollTrigger:{trigger:mk.parentNode,start:'top bottom',end:'bottom top',scrub:true}})});
  },el);
  requestAnimationFrame(function(){ScrollTrigger.refresh()});
}
function show(name,intro){
  $$('.view').forEach(function(v){v.classList.toggle('is-active',v.dataset.view===name)});
  $$('[data-go]').forEach(function(a){a.classList.toggle('is-on',a.dataset.go===name)});
  current=name; window.scrollTo(0,0); hdr.classList.remove('is-solid'); initView($('.view[data-view="'+name+'"]'),intro);
}
function go(name){
  if(ROUTES.indexOf(name)<0) name='home';
  closeMenu(); if(cur) cur.classList.remove('is-on');
  if(name===current){window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});return}
  if(busy) return;
  try{ if(location.hash!=='#'+name) location.hash=name }catch(e){}
  if(!hasG){show(name,false);return}
  busy=true;
  var el=$('.view[data-view="'+name+'"]'), idx=ROUTES.indexOf(name), vs=$('#veilSvg');
  $('#veilName').textContent=el.dataset.title; $('#veilNo').textContent=idx?('0'+idx):'Global Pathways';
  $('#veilUse').setAttribute('href','#art-'+name); vs.setAttribute('viewBox','0 0 400 520'); vs.classList.add('is-art');
  var A='inset(100% 0% 0% 0% round 50vw 50vw 0vw 0vw)',B='inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)',C='inset(0% 0% 100% 0% round 0vw 0vw 0vw 0vw)';
  gsap.timeline({onComplete:function(){busy=false}})
    .set(veil,{visibility:'visible',clipPath:A})
    .fromTo('.veil__in',{y:60,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,ease:'power3.out'},.25)
    .to(veil,{clipPath:B,duration:.85,ease:'power4.inOut'},0)
    .add(function(){ if(ctx){ctx.revert();ctx=null} show(name,true) })
    .to('.veil__in',{y:-40,autoAlpha:0,duration:.45,ease:'power2.in'},'+=.18')
    .to(veil,{clipPath:C,duration:.85,ease:'power4.inOut'},'-=.2')
    .set(veil,{visibility:'hidden'});
}
function closeMenu(){ if(body.classList.contains('menu-open')){body.classList.remove('menu-open');$('#burger').setAttribute('aria-expanded','false')} }
$('#burger').addEventListener('click',function(){var o=body.classList.toggle('menu-open');this.setAttribute('aria-expanded',o?'true':'false')});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-go]'); if(a){e.preventDefault();go(a.dataset.go)}});
window.addEventListener('hashchange',function(){var n=location.hash.replace('#','')||'home'; if(n!==current) go(n)});
document.addEventListener('keydown',function(e){if(e.metaKey||e.ctrlKey||e.altKey)return;var t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;if(e.key>='0'&&e.key<='6')go(ROUTES[+e.key])});
var prog=$('#prog'),badge=$('#badge'),bgp=reduce?null:$('#bgp');
badge.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduce?'auto':'smooth'})});
window.addEventListener('scroll',function(){
  var y=window.scrollY||root.scrollTop, max=root.scrollHeight-window.innerHeight, pr=max>0?Math.min(1,y/max):0;
  hdr.classList.toggle('is-solid',y>24); if(bgp) bgp.style.setProperty('--sy',y);
  prog.style.strokeDashoffset=169.65*(1-pr); badge.classList.toggle('is-on',y>320); badge.querySelector('.badge__mk').style.transform='rotate('+(pr*360)+'deg)';
},{passive:true});
if(cur&&hasG&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  var qx=gsap.quickTo(cur,'x',{duration:.35,ease:'power3'}),qy=gsap.quickTo(cur,'y',{duration:.35,ease:'power3'}),lab=$('span',cur);
  window.addEventListener('pointermove',function(e){qx(e.clientX);qy(e.clientY);var w=e.target.closest&&e.target.closest('.way'); if(w) lab.textContent='Enter'; cur.classList.toggle('is-on',!!w)},{passive:true});
}
var first=(location.hash||'').replace('#',''); if(ROUTES.indexOf(first)<0) first='home';
if(hasG){
  show(first,true);
  gsap.timeline({onComplete:function(){root.classList.remove('intro')}})
    .set(veil,{visibility:'visible',clipPath:'inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)'})
    .from('.veil__in',{y:40,autoAlpha:0,duration:.7,ease:'power3.out'})
    .to('.veil__in',{y:-40,autoAlpha:0,duration:.45,ease:'power2.in'},'+=.45')
    .to(veil,{clipPath:'inset(0% 0% 100% 0% round 0vw 0vw 50vw 50vw)',duration:.95,ease:'power4.inOut'},'-=.15')
    .set(veil,{visibility:'hidden'});
} else { root.classList.remove('intro'); show(first,false); }
})();
