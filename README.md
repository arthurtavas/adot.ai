# 🐶 Adot.ai

## Sobre o projeto

O **Adot.ai** é um sistema web desenvolvido para facilitar o processo de adoção de cachorros, permitindo visualizar animais disponíveis e registrar pessoas interessadas na adoção.

## Funcionalidades

- Cadastro, edição e exclusão de cachorros.
- Visualização dos animais disponíveis.
- Upload de fotos dos animais.
- Cadastro de pessoas interessadas na adoção.
- Área administrativa com autenticação de funcionários.

## Tecnologias utilizadas

- Node.js
- Express
- MySQL
- EJS
- HTML, CSS e JavaScript

## Como executar o projeto

**1. Clone o repositório:**

```bash
git clone https://github.com/arthurtavas/adot.ai.git
```

**2. Entre na pasta:**

```bash
cd adot.ai
```

**3. Instale as dependências:**

```bash
npm install
```

**4. Configure o banco de dados:**

Abra o MySQL Workbench e execute o arquivo `script.sql` para criar o banco de dados e as tabelas necessárias.

**5. Configure o ambiente:**

Copie o arquivo `.env.example`, crie um arquivo chamado `.env` na raiz do projeto e preencha as configurações necessárias, incluindo os dados de acesso ao MySQL.

**6. Gere as credenciais administrativas:**

Execute o comando:

```bash
npm run gerar-credenciais
```

Copie as linhas geradas e coloque os valores correspondentes nas variáveis `ADMIN_PASSWORD_HASH` e `SESSION_SECRET` do arquivo `.env`.

**7. Inicie a aplicação:**

```bash
npm start
```

Acesse pelo navegador:

`http://localhost:3000`

## Integrantes

- Luiz Augusto Pavan Junior
- Laura Gomes Rodrigues
- Arthur Tavares da Silva
- Rebeca Cristiny Francisco

---

**Projeto desenvolvido para fins acadêmicos.**
