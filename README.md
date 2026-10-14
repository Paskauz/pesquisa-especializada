# Busca especializada

Frontend unificado da atividade **Busca especializada** (Unifor). O projeto reúne os protótipos de login, tela principal e perfil em uma aplicação **React + Vite**, organizada em **HTML5**, **CSS3** e **JavaScript**.

Não há backend: a demonstração usa dados fictícios e sessão no `localStorage`.

## O que foi unificado

Os arquivos originais ficaram em `prototipos/` para referência:

- `busca-especializada-login.html` — entrar, criar conta, recuperar senha e matrícula Unifor
- `Tela Principal.html` — busca, acesso rápido e agenda
- `tela_de_perfil.html` — dados do aluno, interesses e notificações
- `Busca_Especializada.tsx` — rascunho React com as três telas no mesmo arquivo

A versão atual separa estrutura, estilo e comportamento:

| Camada | Onde está |
| --- | --- |
| HTML5 | `index.html` e a marcação dos componentes React |
| CSS3 | `src/styles/` (`tokens`, `base`, `components`, `auth`, `home`, `profile`) |
| JavaScript | `src/` (React, contexto da demo e dados mock) |

## Como rodar a demonstração

Requisitos: [Node.js](https://nodejs.org/) 18+ e npm.

```bash
npm install
npm run dev
```

O Vite abre o endereço local (em geral `http://localhost:5173`).

Outros comandos:

```bash
npm run build    # gera a pasta dist/
npm run preview  # serve o build para apresentar sem modo de desenvolvimento
```

## Roteiro rápido para apresentar

1. Na tela **Entrar**, use `gabriel@edu.unifor.br` / `123456` (ou qualquer valor preenchido).
2. Pesquise termos como `Inteligência Artificial`, `Medicina` ou `Direito`.
3. Abra **Meu Perfil**, altere nome/interesses e clique em **Salvar Alterações**.
4. Use **Sair da Conta** para voltar ao login.

A sessão permanece no navegador até você sair. Nada é enviado a um servidor.

## Estrutura

```
index.html                 # documento HTML5
src/main.jsx               # inicia o React
src/App.jsx                # escolhe a tela (login, início ou perfil)
src/context/AppContext.jsx # estado da demo (usuário, busca, toast)
src/data/mockData.js       # documentos, eventos e usuário fictício
src/components/            # telas e cabeçalho
src/styles/                # CSS3 separado por responsabilidade
prototipos/                # HTMLs e TSX originais
```

## Próximo passo (fora deste projeto)

Integração com API real de autenticação, acervo e perfil. Este repositório para na camada de frontend para poder ser demonstrado agora.
