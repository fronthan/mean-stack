var express = require('express');
var router = express.Router();
var Post = require('../models/Post');
var util = require('../util');

//Index
router.get('/', function(req, res){
    Post.find({})
    .populate('author') //model.populate()함수 : relationship이 형성돼있는 항목의 값을 생성한다 
    .sort('-createdAt')
    .exec(function(err, posts){
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts});
    });
    /*
    * 나중에 생성됝 데이터가 위로 오게 정렬한다
    * 원래 모양은
    * 모델.find({}).exec(function(err, posts){...})
    * sort() 함수는 string or object를 받아서 데이터 정렬 방법을 정의하고, 문자열로 항목명을 넣으면 오름차순으로 정렬하고, 내림차순인 경우 '-'를 앞에 붙인다.. 두 가지 이상의 조건으로 정렬한다면 빈칸을 넣고 항목을 적는다. object를 넣는 경우 {createdAt:1} (오름차순), {createdAt:-1}(내림차순) 이런 식으로 적는다
    */
});

//New
router.get('/new', util.isLoggedin, function(req, res) {
    var post = req.flash('post')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('posts/new', { post:post, errors:errors });
});

//create
router.post('/', util.isLoggedin, function(req, res){
    req.body.author = req.user._id; //글을 처음 작성할 때, user의 id를 author에 기록
    Post.create(req.body, function(err, post){
        if(err) {
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/new');
        }
        res.redirect('/posts');
    });
});

//show
router.get('/:id', function(req, res){
    Post.findOne({_id:req.params.id})
    .populate('author')
    .exec(function(err, post){
        if(err) return res.json(err);
        res.render('posts/show', {post:post});
    });
});

//edit
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res){
    var post = req.flash('post')[0];
    var errors = req.flash('errors')[0] || {};

    if ( !post ) {
        Post.findOne({_id: req.params.id}, function(err, post){
            if(err) return res.json(err);
            res.render('posts/edit', {post:post, errors:errors })
        });
    } else {
        post._id = req.params.id;
        res.render('posts/edit', { post:post, errors: errors });
    }
});

//update
router.put('/:id', util.isLoggedin, checkPermission, function(req, res){
    req.body.updatedAt = Date.now();
    Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){//findOneAndUpdate는 기본설정이 스키마에 있는 validation을 작동하지 않도록 돼있기 때문에 작동하게 해줘야 한다. 
        if(err) {
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/'+req.params.id+'/edit');
        }
        res.redirect("/posts/"+req.params.id)
    });
});

//destroy
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res){
    Post.deleteOne({_id:req.params.id}, function(err){
        if(err) return res.json(err);
        res.redirect('/posts')
    });
});

module.exports = router;

//private functions 1
function checkPermission(req, res, next) {
    Post.findOne({_id:req.params.id}, function(err, post) {
        if(err) return res.json(err);
        if(post.author != req.user.id) return util.noPermission(req, res);

        next();
    });
}