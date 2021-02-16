var express = require('express');
var router = express.Router(); //express가 제공하는 router 함수로 초기화한다

//Home
router.get('/',function(req, res) {
    res.redirect('/contacts');
});

module.exports = router; // 변수에 담은 router object를 모듈화한다.