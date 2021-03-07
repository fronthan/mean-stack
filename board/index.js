var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport'); //nodemodules에서 가져오는 게 아니라 config/passport 라는 것에 주의
var app = express();
//var ejsLint = require('ejs-lint');

//DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;

db.once('open', function(){
    console.log('DB connected')
});
db.on('error', function(err){
    console.log('DB ERROR: ', err)
});

//Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash()); // flash 초기화. req.flash(문자열, 저장할 값)의 형태로 해당 문자열에 저장한다. 저장할 값 -> 숫자, 문자열, 오브젝트 등 가능. flash는 배열로 저장된다. 
/* req.flash(문자열)인 경우, 해당 문자열에 저장된 값을 배열로 불러온다. 저장된 값이 없어도 빈 배열 [] 을 반환한다. */
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true})); //secret은 세션을 해시화한다, 비밀번호같은 것. 환경변수에 저장한다면 안전하다

// Passport
app.use(passport.initialize());//passport 초기화
app.use(passport.session()); //passport를 session과 연결해주는 함수

// Custom Middlewares
/* middleware 란 app.use에 함수를 넣은 것
* app.use에 있는 함수는 request가 올 때마다 route에 상관없이 무조건 해당 함수가 실행된다.
* app.use에 들어가는 함수는 route에 들어가는 함수와 동일한 req, res, next의 3개의 파라미터를 가진다
*/
app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated(); //isAuthenticated()는 passport에서 제공하는 함수로, 현재 로그인 여부를 true, false로 반환해준다
    res.locals.currentUser = req.user; //passport에서 추가하는 항목으로 로그인이 되면 session으로부터 user를 deserialize해 생성된다 (~currentUser는 로그인된 user의 정보를 불러오는 데 사용)
    // res.locals에 담겨진 변수는 ejs에서 바로 사용 가능하다 
    next();
});

//Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));

//Port setting
var port = 3000;
app.listen(port, function(){
    console.log('server on! localhose:'+port)
});