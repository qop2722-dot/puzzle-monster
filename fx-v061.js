(()=>{'use strict';
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
const stage=document.createElement('div');stage.id='fxStage';stage.innerHTML='<div class="fx-screen"></div>';document.body.appendChild(stage);
const screen=stage.firstElementChild,boss=$('#bossPanel'),board=$('#boardwrap'),combo=$('#comboText');
const ver=$('.ver');if(ver)ver.textContent='v0.6.1';
const name=$('.bossName');if(name&&!$('.fx-boss-avatar')){const a=document.createElement('span');a.className='fx-boss-avatar';a.textContent='👹';name.prepend(a)}
let ready=false,prev={boss:0,hp:0,shield:0,combo:0,attack:'',board:[]},scheduled=false,lastAction=0;
const num=t=>Number(String(t||'').replace(/[^0-9.-]/g,''))||0;
const vib=p=>{try{navigator.vibrate?.(p)}catch(_){}};
function rect(el){return el?.getBoundingClientRect?.()||{left:innerWidth/2,top:innerHeight/2,width:0,height:0,right:innerWidth/2,bottom:innerHeight/2}}
function pulse(el,cls,ms=520){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),ms)}
function flash(color){screen.className=`fx-screen ${color}`;void screen.offsetWidth;screen.classList.add('show');setTimeout(()=>screen.classList.remove('show'),380)}
function float(text,cls,x,y){const e=document.createElement('div');e.className=`fx-float ${cls}`;e.textContent=text;e.style.left=`${x}px`;e.style.top=`${y}px`;stage.appendChild(e);setTimeout(()=>e.remove(),900)}
function burst(x,y,color,n=14,spread=100){for(let i=0;i<n;i++){const p=document.createElement('i');p.className='fx-particle';p.style.color=color;p.style.left=`${x}px`;p.style.top=`${y}px`;p.style.setProperty('--dx',`${(Math.random()-.5)*spread}px`);p.style.setProperty('--dy',`${(Math.random()-.5)*spread}px`);stage.appendChild(p);setTimeout(()=>p.remove(),800)}}
function slash(){const r=rect(board),e=document.createElement('div');e.className='fx-slash';e.style.left=`${r.left-r.width*.1}px`;e.style.top=`${r.top+r.height*.46}px`;e.style.width=`${r.width*1.2}px`;stage.appendChild(e);setTimeout(()=>e.remove(),650)}
function ring(){const r=rect(board),e=document.createElement('div'),s=Math.min(r.width,r.height)*.42;e.className='fx-ring';e.style.width=e.style.height=`${s}px`;e.style.left=`${r.left+r.width/2-s/2}px`;e.style.top=`${r.top+r.height/2-s/2}px`;stage.appendChild(e);setTimeout(()=>e.remove(),700)}
function fire(){const r=rect(board),e=document.createElement('div');e.className='fx-fire';e.style.left=`${r.left-r.width*.08}px`;e.style.top=`${r.top-r.height*.05}px`;e.style.width=`${r.width*1.16}px`;e.style.height=`${r.height*1.1}px`;stage.appendChild(e);setTimeout(()=>e.remove(),750)}
function curse(){const r=rect(board),e=document.createElement('div'),s=Math.min(r.width,r.height)*.24;e.className='fx-curse';e.style.width=e.style.height=`${s}px`;e.style.left=`${r.left+Math.random()*(r.width-s)}px`;e.style.top=`${r.top+Math.random()*(r.height-s)}px`;stage.appendChild(e);setTimeout(()=>e.remove(),750)}
function boardState(){return all('#board .cell').map(c=>c.className+'|'+c.textContent)}
function addCellFx(next,old){const cells=all('#board .cell'),r=rect(board),cw=r.width/6,ch=r.height/9;let added=0,removed=0;next.forEach((v,i)=>{const was=old[i]||'',nowFilled=v.includes('filled'),oldFilled=was.includes('filled');if(nowFilled&&!oldFilled){cells[i]?.classList.add('fx-new');added++;setTimeout(()=>cells[i]?.classList.remove('fx-new'),500)}if(!nowFilled&&oldFilled){removed++;const x=r.left+(i%6+.5)*cw,y=r.top+(Math.floor(i/6)+.5)*ch;burst(x,y,'#fda4af',4,55)}});if(added){const rr=rect(board);burst(rr.left+rr.width/2,rr.top+rr.height*.38,'#c4b5fd',Math.min(18,added*3),rr.width*.7)}return{added,removed}}
function attackFx(label){if(label.includes('火焰')){pulse(board,'fx-board-fire');fire();flash('red')}else if(label.includes('地震')){pulse(board,'fx-board-quake');ring();flash('yellow')}else if(label.includes('詛咒')){pulse(board,'fx-board-hit');curse();flash('blue')}else{pulse(board,'fx-board-hit');slash();flash('red')}}
function sync(){scheduled=false;const next={boss:num($('#coreText')?.textContent),hp:num($('#playerText')?.textContent),shield:num($('#shieldText')?.textContent),combo:num($('#comboText')?.textContent),attack:$('#attack')?.textContent||'',board:boardState()};if(!ready){prev=next;ready=true;return}
const br=rect(boss),sr=rect($('.status')),cr=rect(combo);if(next.boss<prev.boss){const d=prev.boss-next.boss;pulse(boss,'fx-boss-hit');float(`-${d}`,'damage',br.left+br.width*.58,br.top+br.height*.62);burst(br.left+br.width*.58,br.top+br.height*.55,'#fb7185',16,120);vib([15,18,24]);const filled=all('#board .cell.filled');filled.slice(-Math.min(5,filled.length)).forEach(c=>{c.classList.add('fx-match');setTimeout(()=>c.classList.remove('fx-match'),700)})}
if(next.hp<prev.hp){const d=prev.hp-next.hp;float(`-${d}`,'damage',sr.left+sr.width*.35,sr.top+sr.height*.7);attackFx(prev.attack);vib(prev.attack.includes('地震')?[45,25,45]:[25,18,25])}else if(next.hp>prev.hp){const d=next.hp-prev.hp;float(`+${d}`,'heal',sr.left+sr.width*.35,sr.top+sr.height*.7);flash('green');burst(sr.left+sr.width*.35,sr.top+sr.height*.5,'#86efac',12,90);vib(18)}
if(next.shield>prev.shield){const d=next.shield-prev.shield;float(`+${d}`,'shield',sr.left+sr.width*.7,sr.top+sr.height*.7);flash('blue');burst(sr.left+sr.width*.7,sr.top+sr.height*.5,'#93c5fd',12,85)}
if(next.combo>prev.combo&&next.combo>0){pulse(combo,'fx-combo-hit');float(`COMBO ×${next.combo}`,'combo',cr.left+cr.width/2,cr.top+10);burst(cr.left+cr.width/2,cr.top+cr.height/2,'#fde68a',10+next.combo*2,110);vib([12,18,12])}
addCellFx(next.board,prev.board);prev=next}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(sync)}}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style','class']});
document.addEventListener('pointerdown',e=>{const p=e.target.closest?.('.piece,.part,.restart,.actions button,.wide');if(!p)return;lastAction=Date.now();if(p.classList.contains('part')){p.classList.add('fx-select');setTimeout(()=>p.classList.remove('fx-select'),380)}vib(8)},{passive:true});
document.addEventListener('pointerup',e=>{if(e.target.closest?.('.piece')&&Date.now()-lastAction>90)vib(12)},{passive:true});
schedule();
})();
