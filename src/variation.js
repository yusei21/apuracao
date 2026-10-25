import {resultUrl,REFRESH_MS} from './config.js';
import {requestTse,numeral,format} from './tse.js';
const target=document.getElementById('variation-content');
const section=document.getElementById('variacao');
let sequence=0;
const pct=x=>x.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
function candidateNumber(c){return String(c.n??'').trim()}
async function refreshVariation(){
 const id=++sequence,turn=document.getElementById('turno').value,cargo=document.getElementById('cargo').value,uf=document.getElementById('uf').value;
 section.hidden=turn!=='2'||cargo!=='1';
 if(section.hidden)return;
 target.textContent='Consultando dados oficiais dos dois turnos…';
 try{
  const [first,second]=await Promise.all(['1','2'].map(t=>requestTse(resultUrl({turn:t,cargo:'1',uf}))));
  if(id!==sequence)return;
  const earlier=first.data.candidates,now=second.data.candidates;
  if(!earlier.length||!now.length)throw Error('Os resultados dos candidatos não estão disponíveis.');
  target.replaceChildren();
  const table=document.createElement('div');table.className='variation-grid';
  let shown=0;
  for(const candidate of now.filter(c=>['13','22'].includes(candidateNumber(c))).sort((a,b)=>candidateNumber(a)==='13'?-1:1)){
   const previous=earlier.find(x=>candidateNumber(x)===candidateNumber(candidate));
   if(!previous)continue;
   const p1=numeral(previous.pvap),p2=numeral(candidate.pvap),v1=numeral(previous.vap),v2=numeral(candidate.vap);
   if(p1===null||p2===null||v1===null||v2===null)continue;
   const delta=p2-p1,vdelta=v2-v1;
   const row=document.createElement('article');row.className='variation-item';
   const name=document.createElement('strong');name.textContent=candidateNumber(candidate)==='13'?'Lula (PT)':'Flávio Bolsonaro (PL)';
   const measures=document.createElement('div');measures.className='variation-values';
   measures.textContent='1º turno: '+pct(p1)+'% · 2º turno: '+pct(p2)+'%';
   const diff=document.createElement('div');diff.className='variation-delta';
   diff.textContent=(delta>=0?'+':'')+pct(delta)+' p.p. · '+(vdelta>=0?'+':'')+format(vdelta)+' votos';
   row.append(name,measures,diff);table.append(row);shown++;
  }
  if(!shown){target.textContent='Não há dados comparáveis dos mesmos candidatos nos dois turnos.';return}
  const explanation=document.createElement('p');explanation.className='small';
  explanation.textContent='1º turno: '+pct(first.data.progress??0)+'% das seções · 2º turno: '+pct(second.data.progress??0)+'% das seções. Diferença de votos absolutos entre uma apuração parcial e outra completa não representa transferência individual de votos.';
  target.append(table,explanation);
 }catch(e){if(id===sequence)target.textContent='Comparação indisponível: '+e.message}
}
for(const field of ['turno','cargo','uf'])document.getElementById(field).addEventListener('change',refreshVariation);
document.getElementById('update').addEventListener('click',refreshVariation);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshVariation()});
refreshVariation();setInterval(()=>{if(!document.hidden)refreshVariation()},REFRESH_MS);
