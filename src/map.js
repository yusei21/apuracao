import {UFS,resultUrl} from './config.js';
import {requestTse,numeral,format} from './tse.js';
const GEO='https://raw.githubusercontent.com/codeforgermany/click_that_hood/master/public/data/brazil-states.geojson';
const colors={lula:'#e34b55',flavio:'#4089e8',none:'#444650'};
const labels={lula:'Lula',flavio:'Flávio Bolsonaro',none:'Sem dados'};
const root=document.getElementById('mapa'),svg=document.getElementById('brazil-map'),list=document.getElementById('map-list'),info=document.getElementById('map-info'),status=document.getElementById('map-status');
let features=[],results={},currentTurn='',requestId=0;
const percent=n=>n==null?'—':Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
function leader(candidates){
 const ordered=[...candidates].sort((a,b)=>(numeral(b.vap)||0)-(numeral(a.vap)||0));
 const c=ordered[0];if(!c||!(numeral(c.vap)>0))return 'none';
 const no=String(c.n??'');const name=String(c.nm||'').toLowerCase();
 if(no==='13'||name.includes('lula'))return 'lula';
 if(no==='22'||name.includes('flávio')||name.includes('flavio'))return 'flavio';
 return 'none';
}
function selectState(uf){
 const record=results[uf];info.textContent=uf+' · '+(record?.error?'Dados indisponíveis':record?labels[record.winner]+' · '+percent(record.progress)+' das seções · '+(record.candidates.map(c=>String(c.nm||'')+': '+format(c.vap)+' votos ('+percent(numeral(c.pvap))+')').join(' · ')||'Sem votos disponíveis'):'Aguardando consulta');
 if(!record||record.error)return;
 const filter=document.getElementById('uf'),cargo=document.getElementById('cargo');
 if(cargo.value==='1'){filter.value=uf;filter.dispatchEvent(new Event('change'))}
}
function draw(){
 if(!features.length)return;
 const all=[];for(const f of features){const visit=a=>{if(typeof a[0]==='number')all.push(a);else a.forEach(visit)};visit(f.geometry.coordinates)}
 let lo=Infinity,hi=-Infinity,bottom=Infinity,top=-Infinity;for(const p of all){if(p[0]<lo)lo=p[0];if(p[0]>hi)hi=p[0];if(p[1]<bottom)bottom=p[1];if(p[1]>top)top=p[1];}
 const W=750,H=720,pad=18,scale=Math.min((W-2*pad)/(hi-lo),(H-2*pad)/((top-bottom)*1.13));
 const project=p=>[(p[0]-lo)*scale+pad,(top-p[1])*scale*1.13+pad];
 svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.replaceChildren();
 for(const f of features){const uf=f.properties.sigla,rec=results[uf],winner=rec?.winner||'none';
  const rings=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;let d='';
  for(const poly of rings)for(const ring of poly){d+=ring.map((p,i)=>{const v=project(p);return (i?'L':'M')+v[0].toFixed(1)+','+v[1].toFixed(1)}).join(' ')+'Z'}
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);path.setAttribute('fill',colors[winner]);path.setAttribute('stroke','#15161b');path.setAttribute('stroke-width','1.25');path.setAttribute('tabindex','0');path.setAttribute('role','button');path.setAttribute('aria-label',uf+', '+labels[winner]+', '+percent(rec?.progress)+' apurado');
  const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=uf+' — '+labels[winner]+' — '+percent(rec?.progress)+' apurado';path.append(title);
  path.addEventListener('click',()=>selectState(uf));path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectState(uf)}});svg.append(path);
 }
}
function renderList(){
 list.replaceChildren();
 for(const uf of UFS){const r=results[uf],button=document.createElement('button');button.className='map-state';button.type='button';
 const dot=document.createElement('span');dot.className='map-swatch';dot.style.background=colors[r?.winner||'none'];
 const name=document.createElement('strong');name.textContent=uf;
 const p=document.createElement('span');p.textContent=r?.error?'Indisponível':percent(r?.progress);
 const win=document.createElement('small');win.textContent=labels[r?.winner||'none'];
 button.append(dot,name,p,win);button.addEventListener('click',()=>selectState(uf));list.append(button)}
 draw();
}
async function loadMap(){try{const response=await fetch(GEO);if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();features=data.features.filter(f=>UFS.includes(f.properties.sigla));draw()}catch(e){status.textContent='Geometria do mapa indisponível ('+e.message+'). A lista de estados permanece disponível.'}}
async function refreshMap(){
 const turn=document.getElementById('turno').value,id=++requestId;currentTurn=turn;
 status.textContent='Consultando os 27 estados no TSE…';
 const next={};let completed=0;
 async function worker(queue){while(queue.length){const uf=queue.shift();try{const result=await requestTse(resultUrl({turn,cargo:'1',uf}));if(id!==requestId)return;next[uf]={...result.data,winner:leader(result.data.candidates)}}catch(e){if(id!==requestId)return;next[uf]={error:true,winner:'none'}}completed++;status.textContent='Consultando TSE: '+completed+'/27 estados';}}
 const queue=[...UFS];await Promise.all(Array.from({length:5},()=>worker(queue)));
 if(id!==requestId)return;results=next;renderList();
 const ok=Object.values(next).filter(x=>!x.error).length;status.textContent=ok+'/27 estados com resposta · atualização '+new Date().toLocaleTimeString('pt-BR')+'. Estados cinza não possuem liderança confirmada.';
}
if(root){loadMap();refreshMap();document.getElementById('turno').addEventListener('change',refreshMap);document.getElementById('update').addEventListener('click',refreshMap);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshMap()});setInterval(()=>{if(!document.hidden)refreshMap()},60000)}
