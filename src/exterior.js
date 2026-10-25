import {resultUrl,REFRESH_MS} from './config.js';
import {requestTse,numeral,format} from './tse.js';
const section=document.getElementById('exterior'),status=document.getElementById('exterior-status'),people=document.getElementById('exterior-candidates');
const pct=n=>n===null?'—':n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
let generation=0;
async function refreshExterior(){
 const id=++generation,turn=document.getElementById('turno').value;
 status.textContent='Consultando o TSE…';
 try{
  const response=await requestTse(resultUrl({turn,cargo:'1',uf:'ZZ'}));
  if(id!==generation)return;
  const data=response.data;
  document.getElementById('exterior-progress').textContent=pct(data.progress);
  document.getElementById('exterior-valid').textContent=data.valid==null?'—':format(data.valid);
  people.replaceChildren();
  const finalists=data.candidates.filter(c=>['13','22'].includes(String(c.n)));
  for(const c of finalists){
   const article=document.createElement('article');article.className='variation-item';
   const title=document.createElement('strong');title.textContent=String(c.n)==='13'?'Lula (PT)':'Flávio Bolsonaro (PL)';
   const value=document.createElement('div');value.className='variation-delta';value.textContent=pct(numeral(c.pvap));
   const votes=document.createElement('div');votes.className='variation-values';votes.textContent=format(c.vap)+' votos';
   article.append(title,value,votes);people.append(article);
  }
  if(!finalists.length)people.textContent='Nenhum resultado de candidatos disponível.';
  status.textContent='Atualizado às '+new Date().toLocaleTimeString('pt-BR')+' · TSE · '+(turn==='1'?'1º':'2º')+' turno';
 }catch(err){
  if(id!==generation)return;
  status.textContent='Dados do exterior indisponíveis no momento: '+err.message;
  people.replaceChildren();document.getElementById('exterior-progress').textContent='—';document.getElementById('exterior-valid').textContent='—';
 }
}
document.getElementById('turno').addEventListener('change',refreshExterior);
document.getElementById('update').addEventListener('click',refreshExterior);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshExterior()});
refreshExterior();setInterval(()=>{if(!document.hidden)refreshExterior()},REFRESH_MS);
