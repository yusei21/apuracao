# Apuração presidencial — Eleições 2026

Painel estático, responsivo, **apenas presidente da República (2º turno)**. Dados em JSON publicados pelo Tribunal Superior Eleitoral (TSE); não há pesquisas, projeções nem simulações.

## Executar
Abra `index.html` em um servidor HTTP estático (GitHub Pages, Netlify, Vercel ou `python3 -m http.server 8000`).

No GitHub Pages: Settings > Pages > Deploy from a branch e selecione a branch em que este arquivo estiver publicado.

## Dados
O sistema tenta ler a configuração oficial `https://resultados.tse.jus.br/oficial/comum/config/ele-c.json`, seleciona o pleito 3221 e a eleição federal 6258, e busca o EA20 Brasil em `https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br/br-c0001-e006258-u.json`.

Atualização a cada 5 segundos enquanto a aba estiver visível, com ETag/Last-Modified quando houver. Os campos são extraídos do formato EA20 (`carg[].agr[].par[].cand[]`). Erros de rede não apagam a última apuração válida.

**Importante:** a distribuição CDN do TSE pode não permitir requisições CORS feitas diretamente pelo navegador. Se aparecer erro de rede apesar de a URL oficial abrir normalmente, hospede um proxy/cache no mesmo domínio que o site e altere a constante `ROOT` em `index.html`. Não configure um proxy aberto; mantenha somente os caminhos do TSE necessários. O painel não consegue acessar dados ainda não liberados pelo TSE.

Documentação: https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados

## Licença
Consulte o arquivo LICENSE do repositório.
