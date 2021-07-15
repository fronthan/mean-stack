const express = require('express');
const nunjucks = require('nunjucks');
const logger = require('morgan');
const bodyParser = require('body-parser');

const admin = require('./routes/admin');
const contacts = require('./routes/contacts');

const app = express();
const port = 3000;

nunjucks.configure('template', {
  autoescape:true,
  express:app
}); //template은 폴더명
//autoescape true는 태그를 글자로 바꿔준다

//미들웨어 셋팅
app.use( logger('dev') ); 
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: false }) );
// app.use( (req,res, next) => {
//   req.body = {

//   }
// });
app.use('/uploads', express.static('uploads')); //앞에는 url, static은 정적파일을 뜻함, 뒤의 uploads는 폴더명

app.use( (req,res,next) => {
  app.locals.isLogin = true; //글로벌 변수
  app.locals.req_path = req.path;
  next();
});

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

//사용 안하는 매개변수는 언더바로 처리한다
app.use ( (req, res, _ )=> {
  res.status(400).render('common/404.html')
});
app.use ( (req, res, _ )=> {
  res.status(500).render('common/500.html')
});

app.listen(port, ()=> {
  console.log('express listening on port', port);
});