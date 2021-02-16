var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var app = express();

//DB setting
/*
몽구스의 글로벌 설정. 빠지면 서버 실행시 경고를 나타냄
*/
mongoose.set('useNewUrlParser',true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGO_DB); //process.env 오브젝트는 환경변수를 가지고 있는 객체. Node.js에서 기본 제공
var db = mongoose.connection; // 몽구스의 DB object를 가져와 변수에 넣는다. DB와 관련된 이벤트 리스너 함수들이 들어있다.

//앱이 연결될 때 단 한 번만 실행되므로 once를 사용
//db.once('이벤트이름', 콜백함수)
db.once('open', function(){
    console.log('DB 연결됨');
});

//에러는 어느 때든 발생할 수 있으므로 on 을 사용
//db.on('이벤트이름', 콜백함수)
db.on('error', function(err) {
    console.log('DB ERROR: ', err);
});


//Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
/* 아래 두 줄이 있어야 웹브라우저 form 에 입력한 데이터를 bodyParser를 통해 req.body으로 생성이 된다 */
app.use(bodyParser.json()); //json 형태로 데이터를 받는다. route의 콜백함수의 req.body에서 form으로 입력받은 데이터를 사용할 수 있다
app.use(bodyParser.urlencoded({extended:true})); //urlencoded data를 extended 알고리즘을 이용해 분석한다는 설정
app.use(methodOverride('_method')); // _method 의 query로 들어오는 값으로 http method를 바꾼다
//url?_method=delete 라고 받으면, delete를 읽어 http method를 바꾼다


//Routes
app.use('/', require('./routes/home'));
app.use('/contacts', require('./routes/contacts'));
/* app.use('route', 콜백함수) : 해당 라우트에 요청이 오는 경우에만 콜백함수를 호출한다 */


//Port setting
var port = 3000;
app.listen(port, function(){
    console.log('server on! localhost:'+port);
})