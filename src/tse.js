export const numeral=x=>{const n=Number(String(x??'').replace(',','.'));return Number.isFinite(n)?n:null};
export const format=n=>Number(n||0).toLocaleString('pt-BR');
export function candidates(data){
 const rows=[];
 for(const cargo of data.carg||[])for(const group of cargo.agr||[]){
   for(const party of group.par||[])for(const c of party.cand||[])rows.push(c);
   for(const c of group.cand||[])rows.push(c);
 }
 return rows.sort((a,b)=>(numeral(b.vap)||0)-(numeral(a.vap)||0));
}
export function parseResults(data){
 if(!Array.isArray(data.carg))throw Error('Arquivo TSE sem a estrutura EA20 esperada');
 return {candidates:candidates(data),progress:numeral(data.s?.pst??data.pst),valid:data.v?.vv??data.v?.vvc??data.vvc,blank:data.v?.vb??null,nullVotes:data.v?.tvn??data.v?.vn??null,blankPct:data.v?.pvb??null,nullPct:data.v?.ptvn??null,generated:[data.dg,data.hg].filter(Boolean).join(' · ')||'Não informado'};
}
export async function requestTse(url,{etag='',modified='',signal}={}){
 const headers={};if(etag)headers['If-None-Match']=etag;if(modified)headers['If-Modified-Since']=modified;
 const response=await fetch(url,{headers,cache:'no-cache',signal});
 if(response.status===304)return {unchanged:true};
 if(!response.ok)throw Error('HTTP '+response.status);
 return {data:parseResults(await response.json()),etag:response.headers.get('ETag')||'',modified:response.headers.get('Last-Modified')||''};
}
