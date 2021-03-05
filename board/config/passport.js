var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; // strategy 들은 대부분 require 다음 '.strategy가 붙는다
var User = require('../models/User');

// serialize User
// 로그인 시 DB에서 발견한 user를 어떻게 session에 저장할지를 정하는 부분
passport.serializeUser(function(user, done) {
    done(null, user.id); //정보 수정이 되는 경우 세션의 정보를 변경해주어야 하는 등 문제와 사이트의 성능을 위해 id만 저장한다
});

// deserializeUser 함수
/* request 시에 session에서 어떻게 user object를 만들지 정한다
* 매번 req 마다 user 정보를 db에서 새로 읽어오는데, 바로 정보 반영이 된다는 장점과 매번 db에서 정보를 가져와야 하는 단점이 있다. 
*/
passport.deserializeUser(function(id, done) {
    User.findOne({_id:id}, function(err, user) {
        done(err, user);
    });
});

// local strategy 설정
passport.use('local-login',
    new LocalStrategy({
        usernameField: 'username',//로그인 폼의 항목 이름(name)이 다르면 이렇게 따로 설정해준다
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, username, password, done) {//로그인 시 호출된다 
        User.findOne({username:username})
        .select({password:1})
        .exec(function(err, user) {
            if(err) return done(err);

            if (user && user.authenticate(password)) { //password가 저장된 password hash와 같은지 비교한다
                return done(null, user);
            } else {//일치하지 않으면 falsh 생성
                req.flash('username', username);
                req.flash('errors', {login: '이름이나 비밀번호가 정확하지 않습니다'});
                return done(null, false); //user가 전달도지 않으면 local-strategy 는 실패한다
                /* done함수의 1번째 인자는 항상 error를 담기 위한 것, 에러가 없으면 null을 담는다 */
            }
        });
    })
);

module.exports = passport;