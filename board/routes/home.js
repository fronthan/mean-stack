var express = require('express');
var router = express.Router();
var passport = require('../config/passport'); //index.js에서만 require 해도 된다

//Home
router.get('/', function(req, res){
    res.render('home/welcome')
});
router.get('/about', function(req, res){
    res.render('home/about')
});

// Login 뷰 라우터
router.get('/login', function(req, res) {
    var username = req.flash('username')[0];
    var errors = req.flash('errors')[0] || {};
    res.render('home/login', {
        username: username,
        errors:errors
    })
 });

 // Post Login 
 router.post('/login', function(req, res, next) {//콜백1은 form의 validation을 위한 것, 에러가 있으면 flash를 만들고 login view로 이동
    var errors = {};
    var isValid = true;

    if(!req.body.username) {
        isValid = false;
        errors.username = 'username은 필수값입니다'
    }
    if(!req.body.password) {
        isValid = false;
        errors.password = '비밀번호는 필수값입니다'
    }

    if (isValid) {
        next();
    } else {
        req.flash('errors', errors);
        res.redirect('/login')
    }
 },
 passport.authenticate('local-login', {//콜백2는 passport local strategy를 호출해서 auth진행
     successRedirect : '/posts',
     failureRedirect: '/login'
 })
);

// Logout 라우터
router.get('/logout', function(req, res) {
    req.logout();//passport에서 제공되는 함수
    res.redirect('/');
});

module.exports = router;