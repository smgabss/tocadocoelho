# Toca do Coelho - Loja de Vantagens

Esta é uma aplicação Single Page Application (SPA) para uma mesa de RPG chamada "Toca do Coelho". Serve como uma loja interativa onde os jogadores podem comprar vantagens usando "Pontos de Sangue", com sincronização em tempo real via Firebase.
<!--
## Configuração do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Crie um novo projeto.
3. No painel do projeto, clique no ícone da Web `</>` para registrar o aplicativo.
4. O Firebase fornecerá um objeto `firebaseConfig`. Copie as variáveis desse objeto.
5. Abra o arquivo `js/firebase-config.js` e cole os valores do `firebaseConfig` nas variáveis correspondentes que estão vazias.

### Banco de Dados (Firestore)

1. No Firebase Console, vá em **Firestore Database** no menu lateral esquerdo e clique em **Create database**.
2. Você pode iniciar em "Test Mode" por enquanto ou configurar regras customizadas (recomendado para produção).
3. Habilite o banco de dados.

#### Estrutura de Regras de Segurança (Firestore Rules)
Para começar, uma regra simples permitindo leitura e gravação autenticada. Como nossa autenticação é baseada em campos (Mock auth) por usuário, para uso entre amigos em uma mesa de RPG e ambiente estático local/GitHub Pages sem custom Auth Provider complexo, podemos deixar aberto (Atenção: apenas para essa escala de aplicação para amigos).

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Altere para regras restritas se desejar segurança!
    }
  }
}
```

#### Seeding Inicial (Criar Usuários)
Você deve criar a estrutura da coleção `users` no Firestore.
Para cada usuário, crie um Documento com ID automático na coleção `users` com os seguintes campos:

1. **Mestre**
   - `codinome` (string): 'Mestre'
   - `password` (string): 'v4l3n3gr0'
   - `role` (string): 'mestre'
   - `theme` (string): 'theme-mestre'
   - `pontosDeSangue` (number): 0
   - `vantagens` (array): []

2. **A Oráculo**
   - `codinome` (string): 'A Oráculo'
   - `password` (string): '123'
   - `role` (string): 'player'
   - `theme` (string): 'theme-a-oraculo'
   - `pontosDeSangue` (number): 0
   - `vantagens` (array): []

3. **A Sanguessuga**
   - `codinome` (string): 'A Sanguessuga'
   - `password` (string): '123'
   - `role` (string): 'player'
   - `theme` (string): 'theme-a-sanguessuga'
   - `pontosDeSangue` (number): 0
   - `vantagens` (array): []

4. **O Pilantra**
   - `codinome` (string): 'O Pilantra'
   - `password` (string): '123'
   - `role` (string): 'player'
   - `theme` (string): 'theme-o-pilantra'
   - `pontosDeSangue` (number): 0
   - `vantagens` (array): []

5. **A Angustiada**
   - `codinome` (string): 'A Angustiada'
   - `password` (string): '123'
   - `role` (string): 'player'
   - `theme` (string): 'theme-a-angustiada'
   - `pontosDeSangue` (number): 0
   - `vantagens` (array): []

6. **O Revoltado**
   - `codinome` (string): 'O Revoltado'
   - `password` (string): '123'
   - `role` (string): 'player'
   - `theme` (string): 'theme-o-revoltado'
   - `pontosDeSangue` (number): 0
   - `vantagens` (array): []

## Como hospedar no GitHub Pages

1. Inicialize um repositório git na pasta base (onde está o `index.html`).
2. Faça commit de todos os arquivos.
3. Suba (push) para um repositório no GitHub.
4. No GitHub, vá nas opções (Settings) do seu repositório.
5. Na lateral esquerda, clique em "Pages".
6. Em "Build and deployment", selecione a branch `main` e a pasta `/ (root)`. Clique em Save.
7. Após alguns minutos, seu app estará rodando em `<seu-usuario>.github.io/<nome-do-repo>`.
-->
