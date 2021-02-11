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

//DB schema
var contactSchema = mongoose.Schema({
    name: {type:String, required:true, unique:true},
    email:{type:String},
    phone:{type:String}
});
var Contact = mongoose.model('contact', contactSchema); //contact모델 생성. 'contact'는 몽고디비에서 사용되는 컬렉션 이름, contactSchema는 위에 생성한 스키마 오브젝트

//Routes
//Home
app.get('/',function(req, res) {
    res.redirect('/contacts');
});

app.get('/contacts', function(req, res) {
    Contact.find({}, function(err, contacts){
        //모델.find(검색조건, 콜백함수(에러, 검색결과))
        //{} -> object 형태로 전달된다. 이처럼 빈값이라면, 검색조건 없음으로 모든 데이터 리턴.
        //검색결과가 하나도 없더라도 빈 array 리턴
        if(err) return res.json(err);
        res.render('contacts/index', {contacts:contacts});
        //에러가 없다면 - res.render
        //'views/contacts/index.ejs'를 render한다
    });
});

app.get('/contacts/new', function(req, res){
    res.render('contacts/new');
    //새로운 주소록을 만드는 폼이 있는 new.ejs를 렌더링
});

app.post('/contacts', function(req, res) {
    //contacts/new에서 폼을 전달받는 경우
    Contact.create(req.body, function(err,contact){
        //디비에 req.body라는 object로 받아 데이터를 생성한다
        //콜백함수의 2번째 파라미터는 생성된 데이터
        if(err) return res.json(err);
        res.redirect('/contacts');
    });
});

//show
app.get('/contacts/:id', function(req, res) {
    //콜론을 사용하면 해당 위치의 값을 받아 params에 넣는다
    Contact.findOne({_id: req.params.id}, function(err, contact){
        if(err) return res.json(err);
        //findOne은 결과를 object로 전달하고, 빈값이면 null을 전달한다
        res.render('contacts/show', {contact: contact});
    });
});

//edit
app.get('/contacts/:id/edit', function(req, res) {
    Contact.findOne({_id:req.params.id}, function(err, contact) {
        if(err) return res.json(err);
        res.render('contacts/edit', {contact:contact});
    });
});

//update
app.put('/contacts/:id', function(req, res) {
    Contact.findOneAndUpdate({_id:req.params.id}, req.body, function(err, contact){
        //data를 하나 찾아서 수정하는 함수
        //두번째 파라미터가 update할 정보를 object로 받는다
        //콜백함수로 넘겨지는 값은 수정하기 전의 값이다, 업데이트 후 데이터를 보고 싶으면 콜백함수 전에 '{new:true}'를 넣는다.
        if(err) return res.json(err);
        res.redirect('/contacts/'+req.params.id);
    });
});

//deestroy
app.delete('/contacts/:id', function(req, res) {
    Contact.deleteOne({_id: req.params.id}, function(err){
        //조건, 콜백함수
        if(err) return res.json(err);
        //삭제 후 페이지 전환
        res.redirect('/contacts');
    });
});

//Port setting
var port = 3000;
app.listen(port, function(){
    console.log('server on! localhost:'+port);
})