var express = require('express');
var router = express.Router();
var Post = require('../models/Post');

//Index
router.get('/', function(req, res){
    Post.find({})
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
router.get('/new', function(req, res) {
    res.render('posts/new');
});

//create
router.post('/', function(req, res){
    Post.create(req.body, function(err, post){
        if(err) return res.json(err);
        res.redirect('/posts')
    });
});

//show
router.get('/:id', function(req, res){
    Post.findOne({_id:req.params.id}, function(err, post){
        if(err) return res.json(err);
        res.render('posts/show', {post:post});
    });
});

//edit
router.get('/:id/edit', function(req, res){
    Post.findOne({_id: req.params.id}, function(err, post){
        if(err) return res.json(err);
        res.render('posts/edit', {post:post})
    });
});

//update
router.put('/:id', function(req, res){
    req.body.updatedAt = Date.now();
    Post.findOneAndUpdate({_id:req.params.id}, req.body, function(err, post){
        if(err) return res.json(err);
        res.redirect("/posts/"+req.params.id)
    });
});

//destroy
router.delete('/:id', function(req, res){
    Post.deleteOne({_id:req.params.id}, function(err){
        if(err) return res.json(err);
        res.redirect('/posts')
    });
});

module.exports = router;