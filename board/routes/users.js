var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');

/*
// Index
router.get('/', function(req, res) {
    User.find({})
    .sort({username:1})
    .exec(function(err, users){
        if(err) return res.json(err);
        res.render('users/index', {users:users});
    }); //찾은 값을 오름차순으로 정렬
});
*/

// New
router.get('/new', function(req, res) {
    var user = req.flash('user')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('users/new', {user:user, errors:errors});
});

// create
router.post('/', function(req, res) {
    User.create(req.body, function(err, user) {
        if(err) {
            req.flash('user', req.body);
            req.flash('errors', util.parseError(err)); 
            return res.redirect('/users/new');
        }
        res.redirect('/login');
    });
});

// show
router.get('/:username', util.isLoggedin, checkPermission, function(req, res) {
    User.findOne({username:req.params.username}, function(err, user) {
        if(err) return res.json(err);
        res.render('users/show', {user:user});
    });
});

//edit
router.get('/:username/edit', util.isLoggedin, checkPermission, function(req, res) {
    var user = req.flash('user')[0];//user 플래시값이 있으면 오류가 있을 때, 값이 없으면 처음 들어온 경우
    var errors = req.flash('errors')[0] || {};

    if(!user) {//user flash 값이 없다, 처음 들어온 경우
        User.findOne({username:req.params.username}, function(err, user) {
            if(err) return res.json(err);
            res.render('users/edit', {username:req.params.username, user:user, errors:errors }); //flash 값이라면 username 이 달라질 수 있으므로 req.params.username으로 한다
        });
    } else {
        res.render('users/edit', { username: req.params.username, user:user, errors:errors });
    }
});

// Update
router.put('/:username', util.isLoggedin, checkPermission, function(req,res,next){
    User.findOne({username: req.params.username})
    .select('password')
    .exec(function(err, user){
        //useer model에서 password의 select를 false로 기본으로 설정했지만, select('password')가 있으니 true로 비번을 읽어오게 된다.
        // 반대로 읽어오게 설정한 것을 안 읽어오게 할 수도 있는데 그것이 'select('-name')' 과 같이 하면 된다. 
        if(err) return res.json(err);

        // update user object
        user.originalPassword = user.password;
        user.password = req.body.newPassword ? req.body.newPassword : user.password; //비번을 수정했을 때와 하지 않았을 때 입력되는 값이 다르다

        for(var p in req.body) {//user가 db에서 읽어온 값이고, req.body가 form에 입력된 새로운 값으로, 덮어쓴다
            user[p] = req.body[p]
        }

        // save updated user
        user.save(function(err, user) {
            if(err) {
                req.flash('user', req.body);
                req.flash('errors',util.parseError(err));   
                return res.redirect('/users/'+req.params.username+'/edit'); //1
            }
            res.redirect('/users/'+user.username);
        });
    });
});

/*
//destroy
router.delete('/:username', function(req, res){
    User.deleteOne({username:req.params.username}, function(err) {
        if(err) return res.json(err);
        res.redirect('/users')
    });
});
*/

module.exports = router;

//private functions 2
function checkPermission(req, res, next) {
    User.findOne({username:req.params.username}, function(err, user){
        if(err) return res.json(err);
        if(user.id != req.user.id) return util.noPermission(req, res);

        next();
    });
}