export const UFS=["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
export const CARGOS=[['1','Presidente'],['3','Governador'],['5','Senador'],['6','Deputado federal'],['7','Deputado estadual'],['8','Deputado distrital']];
export const REFRESH_MS=60000;
export function optionsFor(turno,cargo,uf){
 const cargos=CARGOS.filter(([id])=>turno==='1'||['1','3'].includes(id));
 const validCargo=cargos.some(([id])=>id===cargo)?cargo:'1';
 const estados=validCargo==='1'?[['BR','Brasil (nacional)'],...UFS.map(u=>[u,u])]:validCargo==='8'?[['DF','Distrito Federal']]:[['','Selecione um estado'],...UFS.filter(u=>validCargo!=='7'||u!=='DF').map(u=>[u,u])];
 const selected=estados.some(([u])=>u===uf&&u!=='')?uf:validCargo==='1'?'BR':estados.find(([u])=>u!=='')?.[0]||'DF';
 return {cargos,estados,cargo:validCargo,uf:selected};
}
export function resultUrl({turn,cargo,uf}){
 const election=cargo==='1'?(turn==='1'?'6257':'6258'):(turn==='1'?'6259':'6260');
 const area=(uf||'BR').toLowerCase();
 return 'https://resultados.tse.jus.br/oficial/ele2026/'+election+'/dados/'+area+'/'+area+'-c'+String(cargo).padStart(4,'0')+'-e'+String(election).padStart(6,'0')+'-u.json';
}
