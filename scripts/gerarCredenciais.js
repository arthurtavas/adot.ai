#!/usr/bin/env node
/**
 * Gera as duas linhas de configuração da área da loja:
 *   ADMIN_PASSWORD_HASH  (hash bcrypt da senha que você digitar)
 *   SESSION_SECRET       (segredo aleatório para assinar o cookie de login)
 *
 * Uso:  npm run gerar-credenciais
 * Depois copie as linhas impressas para o arquivo .env (que NÃO vai para o GitHub).
 *
 * A senha é digitada sem aparecer na tela e nunca é gravada em lugar nenhum;
 * só o hash é exibido. (Não passe a senha como argumento: ela ficaria no histórico do terminal.)
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const CUSTO_BCRYPT = 12;   // ~250 ms por verificação: caro o bastante para atrapalhar força bruta
const MIN_SENHA = 8;
const MAX_SENHA = 72;      // o bcrypt ignora tudo depois de 72 bytes

function lerSenhaOculta(pergunta) {
  return new Promise((resolve, reject) => {
    const entrada = process.stdin;

    // Entrada redirecionada (ex.: echo "senha" | npm run ...): lê uma linha normalmente.
    if (!entrada.isTTY) {
      let dados = '';
      entrada.setEncoding('utf8');
      entrada.on('data', (parte) => { dados += parte; });
      entrada.on('end', () => resolve(dados.split(/\r?\n/)[0]));
      entrada.on('error', reject);
      return;
    }

    process.stdout.write(pergunta);
    let senha = '';
    entrada.setRawMode(true);
    entrada.resume();
    entrada.setEncoding('utf8');

    const finalizar = () => {
      entrada.setRawMode(false);
      entrada.pause();
      entrada.removeListener('data', aoReceber);
      process.stdout.write('\n');
    };

    function aoReceber(texto) {
      for (const c of texto) {
        if (c === '\r' || c === '\n' || c === '\u0004') { finalizar(); return resolve(senha); }
        if (c === '\u0003') { finalizar(); process.exit(130); }           // Ctrl+C
        if (c === '\u007f' || c === '\b') senha = senha.slice(0, -1);     // backspace
        else senha += c;
      }
    }
    entrada.on('data', aoReceber);
  });
}

(async () => {
  const senha = await lerSenhaOculta(`Nova senha da área da loja (${MIN_SENHA} a ${MAX_SENHA} caracteres): `);

  if (senha.length < MIN_SENHA) {
    console.error(`Senha curta demais: use pelo menos ${MIN_SENHA} caracteres (o ideal é 12 ou mais).`);
    process.exit(1);
  }
  if (Buffer.byteLength(senha) > MAX_SENHA) {
    console.error(`Senha longa demais: o bcrypt só considera os primeiros ${MAX_SENHA} bytes. Use uma senha menor.`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(senha, CUSTO_BCRYPT);
  const segredo = crypto.randomBytes(48).toString('hex');

  console.log('\nCopie estas linhas para o seu arquivo .env (as aspas simples são importantes por causa dos "$"):\n');
  console.log(`ADMIN_PASSWORD_HASH='${hash}'`);
  console.log(`SESSION_SECRET='${segredo}'`);
  console.log('\nLembre-se: nunca envie o .env para o GitHub. Trocar a senha invalida todos os logins ativos.');
})();
