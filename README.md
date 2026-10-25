# Apuração 2026 — painel eleitoral

Site estático com interface clara inspirada na hierarquia, tipografia e espaçamento do Notion. Compatível com celulares, tablets e computadores.

## Funcionalidades

- Atualização automática a cada **60 segundos** enquanto a aba permanece aberta; consulta ao retornar para a aba e botão de atualização manual.
- Seleção do **1º ou 2º turno** de 2026.
- Filtros por cargo e unidade da federação: presidente; governador; senador; deputado federal, estadual e distrital.
- No 2º turno apenas presidente e governador, pois os demais cargos são definidos no 1º.
- Lista de candidatos com busca, votos e percentuais do arquivo oficial EA20.
- Comunicação HTTPS direta com a CDN pública do TSE; consulta condicional com ETag/Last-Modified quando disponíveis. Sem API key.
- Nenhum dado fictício ou estimativa.

## Como publicar

Faça merge deste PR na branch `main`. GitHub Pages: Settings > Pages > Deploy from branch > `main` / `(root)`.

Endereço após publicação: https://yusei21.github.io/apuracao/

## Fonte dos dados

https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados

Eleições federais 6257 (1º turno), 6258 (2º turno); eleições estaduais 6259 (1º turno), 6260 (2º turno). O aplicativo monta caminhos EA20 conforme abrangência/cargo, por exemplo `https://resultados.tse.jus.br/oficial/ele2026/6257/dados/br/br-c0001-e006257-u.json`.

**Limitações importantes**:

1. Os arquivos de alguns cargos/abrangências podem não estar disponíveis; um HTTP 404 não significa zero votos.
2. O navegador pode bloquear chamadas à CDN por **CORS**. Se ocorrer, será necessário adicionar backend/proxy com cache ou gerar snapshots periódicos no GitHub Actions. O GitHub Pages sozinho não serve como proxy.
3. Os dados só são publicados no horário legal de divulgação do TSE. Consultar com mais frequência não antecipa a liberação.
4. O painel usa arquivo de resultado por UF (presidente pode ser consultado nacionalmente). Não há seleção municipal e nem uma lista única nacional para todos os deputados, cuja totalização é estadual.
5. Para audiência grande, prefira cache compartilhado de 60 segundos em vez de cada navegador requisitar diretamente ao TSE.
6. Não foi feito teste de ponta a ponta contra todos os arquivos da CDN em produção. Valide conteúdo e URLs para cada cargo antes de tratar o site como serviço de alta confiabilidade.

## Tecnologia

HTML, CSS e JavaScript sem dependências ou etapas de compilação. 

## Licença

Ver `LICENSE`.
