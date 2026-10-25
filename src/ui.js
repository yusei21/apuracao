import {format,numeral} from './tse.js';
export const el=id=>document.getElementById(id);
export function fillSelect(node,items,selected){
 node.replaceChildren();for(const [value,name] of items)node.add(new Option(name,value));
 node.value=selected;
}
export function setState(text,ok=false){el('status').textContent=text;el('dot').classList.toggle('ok',ok)}
export function clear(){
 el('people').replaceChildren();el('sections').textContent='—';el('valid').textContent='—';el('time').textContent='—';el('sectionbar').style.width='0';el('count').textContent='—';
}
export function summary(d){
 const p=d.progress;el('sections').textContent=p===null?'—':p.toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
 el('sectionbar').style.width=Math.max(0,Math.min(100,p||0))+'%';
 el('valid').textContent=d.valid==null?'—':format(d.valid);el('time').textContent=d.generated;
}
export function candidatesList(items,term=''){
 const query=term.trim().toLowerCase(),shown=items.filter(c=>!query||String(c.nm||'').toLowerCase().includes(query)||String(c.n||'').includes(query));
 el('count').textContent=shown.length+' candidatos exibidos';const container=el('people');container.replaceChildren();
 if(!shown.length){const empty=document.createElement('div');empty.className='alert';empty.textContent='Nenhum candidato encontrado nos dados recebidos.';container.append(empty);return}
 for(const c of shown){
  const item=document.createElement('article');item.className='person';
  const head=document.createElement('div');head.className='row';
  const person=document.createElement('div'),name=document.createElement('div'),meta=document.createElement('div');
  name.className='person-title';name.textContent=c.nm||'Candidato sem nome';meta.className='metadata';meta.textContent='Número '+(c.n??'—')+(c.st?' · '+c.st:'');person.append(name,meta);
  const p=numeral(c.pvap),percent=document.createElement('div');percent.className='pct';percent.textContent=p===null?'—':p.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
  head.append(person,percent);
  const votes=document.createElement('div');votes.className='metadata';votes.textContent=format(c.vap)+' votos';
  const track=document.createElement('div'),fill=document.createElement('div');track.className='progress';fill.className='fill';fill.style.width=Math.min(100,Math.max(0,p||0))+'%';track.append(fill);
  item.append(head,votes,track);container.append(item);
 }
}
