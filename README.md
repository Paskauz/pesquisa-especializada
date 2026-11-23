# Busca especializada

Aplicação de busca acadêmica da Unifor. O Firebase é o backend do sistema:

- **Firebase Authentication** gerencia cadastro, login, sessão e redefinição de senha.
- **Cloud Firestore** armazena perfis, histórico de buscas e o catálogo pesquisável.
- **Firebase Hosting** publica o front-end; não há servidor Express nem banco SQL.

Requisitos: Node.js 18 ou superior e um projeto Firebase configurado.

## Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Em **Authentication → Sign-in method**, habilite **E-mail/senha**.
3. Crie o banco em **Firestore Database**.
4. Registre um app Web nas configurações do projeto e copie os valores para `.env`:

   ```bash
   cp .env.example .env
   ```

5. Publique as regras do Firestore antes de usar os dados:

   ```bash
   npx firebase-tools deploy --only firestore:rules
   ```

As regras em `firestore.rules` permitem leitura pública do catálogo inicial, mas só permitem que cada usuário autenticado leia e altere o próprio perfil e histórico.

## Desenvolvimento

```bash
npm install
npm run dev
```

O front-end conecta diretamente ao Firebase; não é necessário iniciar uma API ou um banco local. Sem as variáveis Firebase, o app informa a configuração faltante e não ativa usuário ou dados fictícios.

## Carregar o catálogo inicial

O catálogo inicial está em `src/data/catalogSeed.js` e é carregado no Firestore pelo script administrativo. Documentos da coleção `documents` precisam ter `title`, `type`, `author`, `year`, `area`, `source` e `searchTokens` (tokens em minúsculas e sem acentos). Gere uma chave privada em **Configurações do projeto → Contas de serviço** e mantenha o JSON fora do repositório:

```bash
FIREBASE_SERVICE_ACCOUNT=/caminho/seguro/service-account.json npm run seed:firebase
```

O script é idempotente e carrega as coleções `areas`, `popularSearches`, `quickResources`, `events` e `documents`. A conta de serviço é necessária somente para esse carregamento; nunca use sua chave privada no front-end ou a publique no Git.

## Publicação

Associe o diretório ao projeto Firebase e publique hosting e regras:

```bash
npx firebase-tools login
npx firebase-tools use --add
npm run build
npx firebase-tools deploy --only hosting,firestore:rules
```

Cadastre o domínio de produção em **Authentication → Settings → Authorized domains**. As credenciais Web do Firebase são públicas por natureza; proteja os dados com as regras do Firestore e restrições da chave de API.

## Estrutura

```text
src/firebase.js             # inicialização de Authentication e Firestore
src/firebaseData.js         # acesso ao perfil, catálogo e buscas no Firestore
src/context/AppContext.jsx  # autenticação e estado da aplicação
src/data/catalogSeed.js     # conteúdo de catálogo usado pelo seed administrativo
scripts/seed-firebase.js    # carga idempotente do catálogo via Firebase Admin
firestore.rules             # autorização por usuário e leitura do catálogo
firebase.json               # configuração de Hosting e regras
```

O login institucional por matrícula/SSO e o envio de foto de perfil não estão integrados; o acesso usa e-mail e senha do Firebase Authentication.
