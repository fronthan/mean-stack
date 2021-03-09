var express = require('express');
var router = express.Router();
var Comment = require('../models/Comment');
var Post = require('../models/Post');
var util = require('../util');

//create
router.post('/', util.isLoggedin, checkPostId, function(req, res) {
    var post  = res.locals.post; //찾은 post를 보관해 다음 콜백함수에서 계속 사용할 수 있다. 

    req.body.author = req.user._id;
    req.body.post = post._id;

    Comment.create(req.body, function(err, comment) {
        if(err) {
            req.flash('commentForm', { _id:null, form:req.body });
            req.flash('commentError', { _id: null, errors:util.parseError(err)});//comment의 flash 는 post flash와 다르게 _id항목을 가지고, form error와 같은 하위 항목에 실제 폼과 에러 데이터를 저장한다. 게시물과는 다르게 하나의 view 페이지에 여러 개의 form 이 생기기 때문이다
        }
        return res.redirect('/posts/'+post._id+res.locals.getPostQueryString()); 
    });
});

module.exports = router;

//private functions
function checkPostId(req, res, next) {//대댓글 작성시 post ID 를 찾아야 하는데, 댓글을 생성할 때 [post]/comments?postId=postId 의 route로 생성한다.
    //이 함수는 postId=postId가 있는지, 전달받은 id가 실제 DB에 존재하는지를 확인하는 미들웨어
    Post.findOne({ _id:req.query.postId}, function(err, post) {
        if(err) return res.json(err);

        res.locals.post = post; 
        next();
    });
}