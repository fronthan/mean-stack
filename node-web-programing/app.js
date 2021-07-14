const express = require('express');
const nunjucks = require('nunjucks');
const logger = require('morgan');

const admin = require('./routes/admin');
const contacts = require('./routes/contacts');

const app = express();
const port = 3000;

nunjucks.configure('template', {
  autoescape:true,
  express:app
}); //template은 폴더명
//autoescape true는 태그를 글자로 바꿔준다

app.use( logger('dev') ); //미들웨어 셋팅

app.get('/', (req, res) => {
  res.send('hello express');
});

function vipMiddleware(req, res, next) {
  console.log('최우선 미들웨어');
  next();
}

app.use('/admin', vipMiddleware, admin); 
app.use('/contacts', contacts);
//모든 미들웨어가 순서대로 거친다음에 최종적으로 라우트 함수에 들어간다

app.listen(port, ()=> {
  console.log('express listening on port', port);
});