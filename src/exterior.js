import {resultUrl,REFRESH_MS} from './config.js';
import {requestTse,numeral,format} from './tse.js';
const status=document.getElementById('exterior-status');
const people=document.getElementById('exterior-candidates');
const pct=n=>n===null?'—':n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
let generation=0;
function reset(){document.getElementById('exterior-progress').textContent='—';document.getElementById('exterior-valid').textContent='—';document.getElementById('exterior-progress-bar').style.width='0%';people.replaceChildren()}
async function refreshExterior(){
 const id=++generation,turn=document.getElementById('turno').value;
 document.getElementById('exterior-turn').textContent=turn==='1'?'1º turno':'2º turno';
 status.textContent='Consultando dados oficiais…';
 try{
  const response=await requestTse(resultUrl({turn,cargo:'1',uf:'ZZ'}));
  if(id!==generation)return;
  const data=response.data;
  document.getElementById('exterior-progress').textContent=pct(data.progress);
  document.getElementById('exterior-progress-bar').style.width=Math.max(0,Math.min(100,data.progress??0))+'%';
  document.getElementById('exterior-valid').textContent=data.valid==null?'—':format(data.valid);
  people.replaceChildren();
  const finalists=data.candidates.filter(c=>['13','22'].includes(String(c.n))).sort((a,b)=>numeral(b.vap)-numeral(a.vap));
  for(const candidate of finalists){
   const isLula=String(candidate.n)==='13';
   const article=document.createElement('article');article.className='exterior-candidate '+(isLula?'exterior-lula':'exterior-flavio');
   const top=document.createElement('div');top.className='exterior-candidate-top';
   const left=document.createElement('div');const title=document.createElement('strong');title.textContent=isLula?'Lula (PT)':'Flávio Bolsonaro (PL)';
   const votes=document.createElement('div');votes.className='exterior-votes';votes.textContent=format(candidate.vap)+' votos';
   left.append(title,votes);
   const value=document.createElement('strong');value.className='exterior-percentage';value.textContent=pct(numeral(candidate.pvap));
   top.append(left,value);
   const track=document.createElement('div');track.className='exterior-candidate-track';const fill=document.createElement('div');fill.className='exterior-candidate-fill';
   fill.style.width=Math.max(0,Math.min(100,numeral(candidate.pvap)??0))+'%';track.append(fill);
   article.append(top,track);people.append(article);
  }
  if(!finalists.length)people.textContent='Nenhum resultado de candidatos disponível.';
  status.textContent='Atualizado às '+new Date().toLocaleTimeString('pt-BR')+' · Fonte: TSE';
 }catch(err){
  if(id!==generation)return;
  reset();
  status.textContent='Dados do exterior indisponíveis: '+err.message;
 }
}
document.getElementById('turno').addEventListener('change',refreshExterior);
document.getElementById('update').addEventListener('click',refreshExterior);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshExterior()});
refreshExterior();setInterval(()=>{if(!document.hidden)refreshExterior()},REFRESH_MS);
