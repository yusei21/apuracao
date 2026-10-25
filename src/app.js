import {CARGOS,REFRESH_MS,optionsFor,resultUrl} from './config.js';
import {requestTse} from './tse.js';
import {el,fillSelect,setState,clear,summary,candidatesList} from './ui.js';
const state={candidates:[],url:'',etag:'',modified:'',controller:null,sequence:0};
function selection(){return {turn:el('turno').value,cargo:el('cargo').value,uf:el('uf').value}}
function updateProposalVisibility(){
 const isPresident=selection().cargo==='1';
 el('propostas').hidden=!isPresident;
 document.querySelector('a[href="#propostas"]').hidden=!isPresident;
 if(!isPresident&&location.hash==='#propostas')history.replaceState(null,'',location.pathname+location.search+'#resultados');
}
function updateOptions(){
 const selected=selection(),options=optionsFor(selected.turn,selected.cargo,selected.uf);
 fillSelect(el('cargo'),options.cargos,options.cargo);
 fillSelect(el('uf'),options.estados,options.uf);
 updateProposalVisibility();
}
async function refresh(){
 const url=resultUrl(selection()),seq=++state.sequence;
 if(state.controller)state.controller.abort();
 const changed=url!==state.url;
 if(changed){state.url=url;state.candidates=[];state.etag='';state.modified='';clear()}
 el('source').href=url;const controller=new AbortController();state.controller=controller;
 setState('Consultando TSE...');
 try{
  const response=await requestTse(url,{etag:state.etag,modified:state.modified,signal:controller.signal});
  if(seq!==state.sequence)return;
  if(response.unchanged){setState('Sem alterações · consulta em dia',true);return}
  state.etag=response.etag;state.modified=response.modified;state.candidates=response.data.candidates;
  summary(response.data);candidatesList(state.candidates,el('search').value);
  setState('Atualizado · '+new Date().toLocaleTimeString('pt-BR'),true);
  el('message').textContent='Consulta automática a cada minuto enquanto esta página estiver aberta. Fonte: TSE. Arquivos de alguns cargos e regiões podem ainda não estar disponíveis.';
 }catch(err){
  if(seq!==state.sequence||err.name==='AbortError')return;
  setState('Não foi possível consultar o TSE');
  el('message').textContent='Falha na leitura dos dados oficiais ('+err.message+'). O arquivo pode não estar disponível ou sofrer bloqueio CORS. Nenhum número é estimado.';
 }finally{if(state.controller===controller)state.controller=null}
}
el('turno').addEventListener('change',()=>{updateOptions();refresh()});
el('cargo').addEventListener('change',()=>{updateOptions();refresh()});
el('uf').addEventListener('change',refresh);
el('search').addEventListener('input',()=>candidatesList(state.candidates,el('search').value));
el('update').addEventListener('click',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
updateOptions();refresh();setInterval(()=>{if(!document.hidden)refresh()},REFRESH_MS);
