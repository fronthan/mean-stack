var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'uploadedFiles/'}); //multer를 이용해 파일이 저장될 위치를 설정한다
var Post = require('../models/Post');
var User = require('../models/User'); //username 으로 해당 user를 DB에서 찾고, id를 author로 가지는 post를 찾는 방식으로 작성자를 검색하기 위해서
var Comment = require('../models/Comment');
var File = require('../models/File');
var util = require('../util');

//Index
router.get('/', async function(req, res){
    var page = Math.max(1, parseInt(req.query.page));//query string은 문자열로 전달되기 때문에, 숫자가 아닐 경우를 위해 소수점까지 없애는 parseInt 사용한다
    var limit = Math.max(1, parseInt(req.query.limit)); //Page, limit은 양수이어야 하고, 최소 1이어야 하므로 math.max함수를 사용
    page = !isNaN(page)?page:1; //정수로 변환될 수 없는 값이 올 경우 기본값 설정
    limit = !isNaN(limit)?limit:10; //쿼리스트링이 없는 경우에도 사용한다. 
    
    var skip = (page-1)*limit; //무시할 게시물의 수를 담는다. (현재 페이지를 표현하는 방법)
    /*var count = await Post.countDocuments({});// {}는 조건이 없음, 모든 post의 수를 db에서 읽어온다. */
    var maxPage = 0;
    var searchQuery = await createSearchQuery(req.query); // 실제 게시물 검색은 Post.find(검색쿼리객체)에 어떤 검색쿼리객체에 결정된다 - 예, {title:'test title'} 이라는 객체가 들어가면 제목이 정확히 test title인 게시물이 검색되는 것
    var posts = [];

    if(searchQuery) {
        var count = await Post.countDocuments(searchQuery); //전체 게시물 수와 게시물을 구한다. searchQuery가 있는 경우에만 post 검색하도록  제한한다
        maxPage = Math.ceil(count/limit); //전체 페이지 수, 한 페이지당 표시될 게시물 갯수와 전체 게시물 수를 이용해 계산

        /* aggregate 댓글수 작업 이전 코드
        // posts = await Post.find(searchQuery)
        //     .populate('author')
        //     .sort('-createdAt')            
        //     .skip(skip)
        //     .limit(limit)
        //     .exec();
        * 나중에 생성된 데이터가 위로 오게 정렬한다
        * 원래 모양은
        * 모델.find({}).exec(function(err, posts){...})
        * sort() 함수는 string or object를 받아서 데이터 정렬 방법을 정의하고, 문자열로 항목명을 넣으면 오름차순으로 정렬하고, 내림차순인 경우 '-'를 앞에 붙인다.. 두 가지 이상의 조건으로 정렬한다면 빈칸을 넣고 항목을 적는다. object를 넣는 경우 {createdAt:1} (오름차순), {createdAt:-1}(내림차순) 이런 식으로 적는다
        */
         
        /* model간 연결 시 Populate를 사용하지만, post에는 comment의 정보가 없기 때문에 comment를 읽어올 수 없다
        * 그래서 mongoose의 aggregate()함수로 모델에 대한 aggregation을 mongodb로 전달 
        * collection_name.aggregate([query obj1, query obj2, query obj3 ...]) */
        posts = await Post.aggregate([//mongoDB의 aggregation 문서 참조
            { $match: searchQuery }, //모델.find() 함수와 동일
            { $lookup: { //컬렉션과 컬렉션을 이어준다. 아래 4가지는 필수값
                from: 'users', //다른 컬렉션 이름
                localField: 'author', //현재 컬렉션의 항목
                foreignField: '_id', // 다른 컬렉션의 가져올 항목
                as: 'author' //다른 컬렉션을 담을 항목 이름, 이 이름으로 다른 컬렉션의 데이터가 생성된다
            }},//post.author의 값을 가지는 user._id 들을 모두 찾아 post.author 로 덮어쓴다. (배열, 1개도 없으면 빈배열)
            { $unwind: '$author'}, //배열을 flat하게. ($lookup-배열로 가져왔으므로)
            //aggregate에서 값으로 $가 사용되면, 현재 document의 항목을 나타낸다
            { $sort: { createdAt: -1}}, //aggregate함수 안에서는 sort를 : -1 의 형태로만 사용 가능하다
            { $skip: skip},
            { $limit: limit },
            { $lookup: {//comments.post의 값을 가지는 post._id를 모두 찾아 comments라는 이름으로 저장한다
                from:'comments',
                localField: '_id',
                foreignField:'post',
                as:'comments'
            }},
            { $lookup : {//files._id의 값을 가지는 _id.attchment를 찾아 attachment라는 이름으로 저장한다
                from:'files',
                localField:'attachment',
                foreignField: '_id',
                as:'attachment'
            }},
            { $unwind: {//2
                path: '$attachment',
                preserveNullAndEmptyArrays: true
                }
                //unwind는 배열을 플랫하게 풀어주는 대신에, 배열의 수만큼 오브젝트를 생성한다. author는 모든 post에 반드시 존재하므로, 단순히 unwind하면 되지만
                // 첨부파일은 몇 개일지 알 수 없다. 첨부파일이 없는 post는 unwind하면 $lookup으로 생성된 attachment 배열의 길이가 0이므로, 해당 post가 사라진다. 배열의 길이가 0이거나 배열이 없는 항목을 unwind 하는 경우 기존 오브젝트를 삭제하지 않도록 하는 설정이 preserveNullAndEmptyArrays이다
            },  
            { $project: { //데이터를 원하는 형태로 가공한다. 값으로 들어가는 1은 보여주기 원하는 항목을 나타낸다. (_id는 숨길 수 없다)
                title: 1,
                author: {
                    username: 1
                },
                views:1,
                numId:1,
                attachment: { $cond: [{$and: ['$attachment', {$not: '$attachment.isDeleted'}]}, true, false ]},
                // { $cond: [조건, 조건이 참일 때 값, 조건이 거짓일 때 값] }
                //위 조건을 푼다면, $attachment && !$attachment.isDeleted ? true:false;
                createdAt : 1,
                commentCount: { $size: '$comments'} //댓글의 수를 가져온다
            }}
        ]).exec();
    }
    
    //model.populate()함수 : relationship이 형성돼있는 항목의 값을 생성한다 
    //await를 사용하면 Post.find({})를 변수에 담을 수 있다. 
    //skip: 일정한 수만큼 검색된 결과를 무시하는 함수
    //limit: 일정한 수만큼만 검색된 결과를 보여주는 함수
    res.render('posts/index',{
        posts:posts,
        currentPage:page,
        maxPage:maxPage,
        limit:limit,
        searchType:req.query.searchType,
        searchText:req.query.searchText
    });//view/posts/index로 전달해 post 페이지를 정상적으로 보여줄 수 있다. 
    
   
});

//New
router.get('/new', util.isLoggedin, function(req, res) {
    var post = req.flash('post')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('posts/new', { post:post, errors:errors });
});

//create
router.post('/', util.isLoggedin, upload.single('attachment'), async function(req, res){
    //미들웨어 upload.single(form input name) 은 파일 하나를 form으로부터 읽어온다. 읽어온 파일은 변수 'upload'에 설정한 폴더에 저장되고그 정보가 req.file에 담긴다. 
    var attachment = req.file?await File.createNewInstance(req.file, req.user._id):undefined; //첨부된 파일이 존재하면, file 모델의 인스턴스를 생성한다 (파일 인스턴스란, 하나의 file document를 조작할 수 있게 오브젝트로 만든 것이다)
    req.body.attachment = attachment; //위에서 만들어진 파일 모델을 req.body.attachment에 담아서 post가 생성될 때 저장될 수 있게 한다

    req.body.author = req.user._id; //글을 처음 작성할 때, user의 id를 author에 기록
    Post.create(req.body, function(err, post){
        if(err) {
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/new'+res.locals.getPostQueryString());; //res.locals.getPostQueryString함수의 기본역할은 req.query로 전달받은 쿼리에서 page, limit을 추출해 다시 한 줄의 문자열로 만들어 반환한다.
            //이 새로운 게시물 작성에서는 무조건 쿼리스트링에 추가되는게 아니라(isAppended=false) 파라미터 전달 없이 호출한다. 
        }

        if(attachment) {//post가 생성된 후, post._id를 file.postId에 담고 DB에 저장한다
            attachment.postId = post._id;
            attachment.save();
        }
        //post의 route에서 redirect가 있는 경우, query string을 계속 유지하도록 해당 route로 page, limit query string을 view에서 전달해줘야 한다 
        res.redirect('/posts'+res.locals.getPostQueryString(false, {page:1, searchText:'' })); // 새글을 작성한 후 무조건 첫번째 page를 보여주도록 overwrite를 해준다. 
        
    });
});


//show
/* 댓글은 게시물과 함께 post>show 뷰에 표시된다. 즉 show route는 하나의 게시물과 모든 댓글들을 모두 읽어온 후 렌더링해야 한다.
* DB에서 2개 이상의 데이터를 가져와야 하는 경우 Promise.all 함수를 사용한다.
* Promise.all함수 : Promise 배열을 인자로 받고, 전달받은 모든 프라미스들이 resolve될 때까지 기다렸다가 데이터들을 같은 순서의 배열로 만들어 다음 콜백으로 전달한다
//그래서 아래 then() 안의 배열이 post, comments 순서가 된다. 
*/
router.get('/:id', function(req, res){
    var commentForm = req.flash('commentForm')[0] || {_id: null, form: {}};
    var commentError = req.flash('commentError')[0] || {_id:null, parentComment:null, errors:{}};
    
    //populate로 File.attachment가 하위 객체로 생성, 삭제되지 않은 파일만 생성한다
    Promise.all([
        Post.findOne({_id:req.params.id}).populate({path:'author', select:'username'}).populate({path:'attachment', match:{isDeleted:false}}),
        Comment.find({post:req.params.id}).sort('createdAt').populate({path:'author', select:'username'})
    ])
    .then(([post, comments]) => {// comment 모델을 tree 구조로 변환하고 post show view에 전달한다.
        post.views++;
        post.save();
        var commentTrees = util.convertToTrees(comments, '_id', 'parentComment', 'childComments');
        res.render('posts/show', {post:post, commentTrees:commentTrees, commentForm:commentForm, commentError:commentError });
    })
    .catch((err) => {
        return res.json(err);
    });
});

//edit
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res){
    var post = req.flash('post')[0];
    var errors = req.flash('errors')[0] || {};

    if ( !post ) {//1
        Post.findOne({_id: req.params.id})
        .populate({path:'attachment', match:{isDeleted:false}})
        .exec(function(err, post){
            if(err) return res.json(err);
            res.render('posts/edit', {post:post, errors:errors })
        });
    } else {
        post._id = req.params.id;
        res.render('posts/edit', { post:post, errors: errors });
    }
});

//update
router.put('/:id', util.isLoggedin, checkPermission, upload.single('newAttachment'), async function(req, res){
    var post = await Post.findOne({_id:req.params.id})
    .populate({path:'attachment', match:{isDeleted:false}});//첨부파일의 비교를 위해 기존의 post를 불러온다

    if(post.attachment && (req.file || !req.body.attachment)) {//edit 전 첨부파일이 존재했지만, 현재 multer를 통해 req.file이 생성됐거나 form body의 attachmen가 없다며 함수 호출
        post.attachment.processDelete();
    }

    req.body.attachment = req.file?await File.createNewInstance(req.file, req.user._id, req.params.id):post.attachment; //새로운 인스턴스 생성
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

async function createSearchQuery(queries) {
    var searchQuery = {};
    if(queries.searchType && queries.searchText && queries.searchText.length >= 3) {
        var searchTypes = queries.searchType.toLowerCase().split(',');
        var postQueries = [];

        if(searchTypes.indexOf('title')>=0) {
            postQueries.push({title: { $regex: new RegExp(queries.searchText, 'i')}});
        }
        if(searchTypes.indexOf('body')>=0) {
            postQueries.push({body: { $regex: new RegExp(queries.searchText, 'i')}});
        }
        if(postQueries.length > 0) searchQuery = {$or:postQueries};
/*query에 searchType, searchText가 존재하고, text가 3자 이상인 경우에만 search query를 만들고, 이외의 경우는 {} 를 전달해 모든 게시물이 검새되게 한다
// {$regex: regex object}로 regex검색을 한다. i는 대소문자를 구별하지 않는다는 옵션. 참고 문서 https://docs.mongodb.com/manual/reference/operator/query/regex 
//{$or: 검색 쿼리 오브젝트_배열} 을 사용해 'or' 검색을 할 수 있다. 참고 문서 https://docs.mongodb.com/manual/reference/operator/query/or 같이 and, nor, not 도 공부하자 */

        if(searchTypes.indexOf('author!') >= 0) {//일치하는 1명의 유저만 찾아 검색 쿼리에 추가한다
            var user = await User.findOne({username: queries.searchText }).exec();
            if(user) postQueries.push({author: user._id});
        } else if(searchTypes.indexOf('author') >= 0) {// searchText가 username의 일부분인 user를 모두 찾아 개별적으로 $in operator를 사용해 검색 쿼리를 만든다. 
            var users = await User.find({username: {$regex: new RegExp(queries.searchText, 'i' )}}).exec();
            var userIds = [];
            for(var user of users) {
                userIds.push(user._id);
            }
            if(userIds.length>0) postQueries.push({author: {$in:userIds}});
        }

        if(postQueries.length > 0) searchQuery = {$or: postQueries};
        else searchQuery = null; //작성자 검색은, 해당 user가 검색된 경우에만 postQueries에 조건이 추가된다. 만약 조건에 맞는 user가 없다면, 게시물 검색결과는 없어야 한다. 그래서 else null 을 넣는다
    } 

    return searchQuery; 
}