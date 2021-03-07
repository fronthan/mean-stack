var express = require('express');
var router = express.Router();
var Post = require('../models/Post');
var util = require('../util');

//Index
router.get('/', async function(req, res){
    var page = Math.max(1, parseInt(req.query.page));//query string은 문자열로 전달되기 때문에, 숫자가 아닐 경우를 위해 소수점까지 없애는 parseInt 사용한다
    var limit = Math.max(1, parseInt(req.query.limit)); //Page, limit은 양수이어야 하고, 최소 1이어야 하므로 math.max함수를 사용
    page = !isNaN(page)?page:1; //정수로 변환될 수 없는 값이 올 경우 기본값 설정
    limit = !isNaN(limit)?limit:10; //쿼리스트링이 없는 경우에도 사용한다. 

    var skip = (page-1)*limit; //무시할 게시물의 수를 담는다. (현재 페이지를 표현하는 방법)
    var count = await Post.countDocuments({});// {}는 조건이 없음, 모든 post의 수를 db에서 읽어온다. 
    var maxPage = Math.ceil(count/limit); //전체 페이지 수, 한 페이지당 표시될 게시물 갯수와 전체 게시물 수를 이용해 계산
    var posts = await Post.find({})
    .populate('author') //model.populate()함수 : relationship이 형성돼있는 항목의 값을 생성한다 
    .sort('-createdAt')
    .skip(skip) 
    .limit(limit)
    .exec(); //await를 사용하면 Post.find({})를 변수에 담을 수 있다. 
//skip: 일정한 수만큼 검색된 결과를 무시하는 함수
//limit: 일정한 수만큼만 검색된 결과를 보여주는 함수
    res.render('posts/index',{//view/posts/index로 전달해 post 페이지를 정상적으로 보여줄 수 있다. 
        posts:posts,
        currentPage:page,
        maxPage:maxPage,
        limit:limit
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
        res.redirect('/posts/'+req.params.id);
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

