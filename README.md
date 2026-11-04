# Busca especializada

Aplicação da atividade **Busca especializada** (Unifor): login, busca de documentos acadêmicos, acesso rápido, agenda e perfil. Agora com **banco MySQL** e uma **API Node/Express** entre o React e o banco.

```
React (Vite)  ──/api──▶  Express (server/)  ──mysql2──▶  MySQL 8
```

## Como rodar

Requisitos: Node.js 18+ e **MySQL 8** (a collation `utf8mb4_0900_ai_ci`, que ignora acentos, não existe no MariaDB).

```bash
npm install
cp .env.example .env      # ajuste DB_USER / DB_PASSWORD
npm run db:setup          # cria o banco busca_especializada, as tabelas e os dados iniciais
npm run api               # terminal 1: API em http://localhost:3001
npm run dev               # terminal 2: front em http://localhost:5173
```

Login de demonstração (criado pelo seed): `gabriel@edu.unifor.br` / `123456` (ou matrícula `2110482`).

Produção: `npm run build && npm start` — a API serve o front gerado em `dist/`.

Sem o script, também dá para rodar `server/schema.mysql.sql` e depois `server/seed.mysql.sql` direto no MySQL Workbench.

## O que mudou

| Antes | Agora |
| --- | --- |
| `src/data/mockData.js` | Tabelas MySQL (`server/schema.mysql.sql`) + seed (`server/seed.mysql.sql`) |
| Sessão no `localStorage` | Tabela `sessoes` + cookie httpOnly |
| Filtro `.includes()` no navegador | `GET /api/documentos` (SQL com `LIKE`, sem acento/maiúsculas) |
| "Populares" fixo | View `termos_populares`, calculada do `historico_buscas` |
| Cards de Acesso Rápido por texto livre | Filtro exato por fonte (`recursos_rapidos.filtro_fonte_id`) |
| Perfil salvo só em memória | `PUT /api/me` grava dados, interesses e notificações |

## API

| Rota | O que faz |
| --- | --- |
| `POST /api/auth/signup` · `login` · `logout` | Conta e sessão. `login` aceita e-mail ou matrícula |
| `POST /api/auth/forgot` · `reset` | Redefinição de senha (o link aparece no console da API; ainda sem envio de e-mail) |
| `GET /api/me` · `PUT /api/me` | Perfil do usuário logado |
| `GET /api/catalogo` | Áreas, buscas populares, acesso rápido e agenda |
| `GET /api/documentos?q=&fonte=` | Busca de documentos (grava em `historico_buscas`) |

## Estrutura

```
server/index.js            # API Express (rotas, sessão, buscas)
server/db.js               # conexão MySQL (variáveis do .env)
server/db-setup.js         # npm run db:setup
server/schema.mysql.sql    # tabelas, view e triggers
server/seed.mysql.sql      # dados do antigo mockData.js
src/api.js                 # cliente fetch da API
src/context/AppContext.jsx # estado do app (usuário, busca, catálogo)
src/components/            # telas e cabeçalho
prototipos/                # HTMLs e TSX originais
```

## Pendências conhecidas

- **Login por matrícula:** hoje valida a senha cadastrada no próprio sistema. Para usar a senha institucional, integrar com o SSO/LDAP da Unifor.
- **E-mails:** redefinição de senha e alertas de novos documentos gravam no banco (`tokens_redefinicao_senha`, `notificacoes`), mas falta um serviço de envio.
- **Tela de nova senha:** a rota `POST /api/auth/reset` existe; falta a tela que recebe o link `/?reset=...`.
- **Lista de notificações:** o sino do cabeçalho ainda não abre a lista (`notificacoes` já recebe os alertas).
