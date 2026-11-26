// Carrega o .env logo na entrada da aplicação (config/db.js também carrega; chamar duas vezes é inofensivo).
require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { PASTA_UPLOADS } = require('./utils/fotos');

const app = express();
const emProducao = app.get('env') === 'production';

// Não anuncia "X-Powered-By: Express" nas respostas
app.disable('x-powered-by');

// Atrás de proxy reverso (Nginx, Cloudflare, Render, Heroku...), defina TRUST_PROXY=<nº de proxies, ex.: 1>
// no .env. Sem isso, req.ip seria o IP do proxy e o limite por IP bloquearia TODOS os visitantes juntos.
// Com o valor errado, quem controla o cabeçalho X-Forwarded-For poderia forjar o próprio IP; por isso é um número, não "true".
if (process.env.TRUST_PROXY) {
  const hops = Number(process.env.TRUST_PROXY);
  app.set('trust proxy', Number.isInteger(hops) ? hops : process.env.TRUST_PROXY);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger(emProducao ? 'combined' : 'dev'));

// Os formulários do site são pequenos; limitar o corpo evita gastar memória com payloads gigantes.
// (Upload de foto é multipart e tem o próprio limite de 5 MB no multer.)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

// Fotos têm nome único e nunca mudam: o navegador pode guardá-las por muito tempo (menos tráfego e requisições).
app.use('/uploads', express.static(PASTA_UPLOADS, { maxAge: '30d', immutable: true }));
// CSS/imagens do site: cache curto em produção (para o CSS novo chegar logo após um deploy).
app.use(express.static(path.join(__dirname, 'public'), { maxAge: emProducao ? '1h' : 0 }));

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));

// error handler
app.use(errorHandler);

module.exports = app;
