var express = require('express');
var router = express.Router();
var Contact = require('../models/Contact');

//Index
router.get('/', function(req, res) {
    Contact.find({}, function(err, contacts) {
        if(err) return res.json(err);
        res.render('contacts/index', {contacts: contacts});
    });
});

//new
router.get('/new', function(req, res){
    res.render('contacts/new');
    //새로운 주소록을 만드는 폼이 있는 new.ejs를 렌더링
});

//create
router.post('/contacts', function(req, res) {
    //contacts/new에서 폼을 전달받는 경우
    Contact.create(req.body, function(err,contact){
        //디비에 req.body라는 object로 받아 데이터를 생성한다
        //콜백함수의 2번째 파라미터는 생성된 데이터
        if(err) return res.json(err);
        res.redirect('/contacts');
    });
});


//show
router.get('/:id', function(req, res) {
    //콜론을 사용하면 해당 위치의 값을 받아 params에 넣는다
    Contact.findOne({_id: req.params.id}, function(err, contact){
        if(err) return res.json(err);
        //findOne은 결과를 object로 전달하고, 빈값이면 null을 전달한다
        res.render('contacts/show', {contact: contact});
    });
});

//edit
router.get('/:id/edit', function(req, res) {
    Contact.findOne({_id:req.params.id}, function(err, contact) {
        if(err) return res.json(err);
        res.render('contacts/edit', {contact:contact});
    });
});

//update
router.put('/:id', function(req, res) {
    Contact.findOneAndUpdate({_id:req.params.id}, req.body, function(err, contact){
        //data를 하나 찾아서 수정하는 함수
        //두번째 파라미터가 update할 정보를 object로 받는다
        //콜백함수로 넘겨지는 값은 수정하기 전의 값이다, 업데이트 후 데이터를 보고 싶으면 콜백함수 전에 '{new:true}'를 넣는다.
        if(err) return res.json(err);
        res.redirect('/contacts/'+req.params.id);
    });
});

//deestroy
router.delete('/:id', function(req, res) {
    Contact.deleteOne({_id: req.params.id}, function(err){
        //조건, 콜백함수
        if(err) return res.json(err);
        //삭제 후 페이지 전환
        res.redirect('/contacts');
    });
});

/*
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

*/

module.exports = router;





