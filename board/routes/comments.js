var express = require('express');
var router = express.Router();
var Comment = require('../models/Comment');
var Post = require('../models/Post');
var util = require('../util');

//create
router.post('/', util.isLoggedin, checkPostId, function(req, res) {
    var post  = res.locals.post; //찾은 post를 'res.locals'로 보관해 다음 콜백함수에서 계속 사용할 수 있다. 

    req.body.author = req.user._id;
    req.body.post = post._id;

    Comment.create(req.body, function(err, comment) {
        if(err) {
            req.flash('commentForm', { _id:null, form:req.body });
            req.flash('commentError', { _id: null, parentComment:req.body.parentComment, errors:util.parseError(err)});//comment의 flash 는 post flash와 다르게 _id항목을 가지고, form error와 같은 하위 항목에 실제 폼과 에러 데이터를 저장한다. (게시물과는 다르게 하나의 view 페이지에 여러 개의 form 이 생기기 때문이다)
        }
        return res.redirect('/posts/'+post._id+res.locals.getPostQueryString()); 
        //댓글을 생성할 때, post ID를 찾아야 하는데, [POST] /comments?postId=postId의 route로 댓글을 생성한다.
        //생성된 후 댓글이 달린 게시물로 돌아간다 
    });
});

//update
router.put('/:id', util.isLoggedin, checkPermission, checkPostId, function(req, res) {
    var post = res.locals.post;

    req.body.updatedAt = Date.now();
    Comment.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, comment) {
        if(err) {
            req.flash('commentForm', {_id:req.params.id, form:req.body});
            req.flash('commentError', {_id: req.params.id, parentComment:req.body.parentComment, errors:util.parseError(err)});
        }
        /* 에러가 있는 경우 commentForm, commentError 플래시에 id를 전달해준다 (post update와 다르다)
         * 하나의 페이지에 여러 edit form이 존재하기 때문에 꼭 필요하다 */
        // 대댓글의 생성 과정에는 _id 값이 없지만, parentComment 값은 있다
        return res.redirect('/posts/'+post._id+res.locals.getPostQueryString());
    });
});

//destroy
router.delete('/:id', util.isLoggedin, checkPermission, checkPostId, function(req, res) {
    var post = res.locals.post;

    Comment.findOne({_id: req.params.id}, function(err, comment) {
        if(err) return res.json(err);

        //save updated comment
        comment.isDeleted = true;
        comment.save(function(err, comment) {
            if(err) return res.json(err);

            return res.redirect('/posts/'+post._id+res.locals.getPostQueryString());
        });
    });
})

module.exports = router;

//private functions
function checkPermission(req, res, next) {//작성자만 댓글을 삭제할 수 있도록 판단하는 미들웨어
    Comment.findOne({_id:req.params.id}, function(err, comment){
        if(err) return res.json(err);
        if(comment.author != req.user.id) return util.noPermission(req, res);

        next();
    });
}

function checkPostId(req, res, next) {
    //이 함수는 postId=postId가 있는지, 전달받은 postId가 실제 DB에 존재하는지를 확인하는 미들웨어
    Post.findOne({ _id:req.query.postId}, function(err, post) {
        if(err) return res.json(err);

        res.locals.post = post; 
        next();
    });
}