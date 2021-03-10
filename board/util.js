//function
/*
* mongoose 와 mongoDB에서 내는 에러 메시지 형태를 통일시킨다
*/

var util = {};

util.parseError = function(errors) {

    var parsed = {};
    if(errors.name == 'ValidationError') {
        for(var name in errors.errors) {
            var validationError = errors.errors[name];
            parsed[name] = { message: validationError.message };
        }
    } else if (errors.code == '11000' && errors.errmsg.indexOf('username') > 0 ) {
        parsed.username = {message: '이미 로그아웃한 회원입니다.'}
    } else {
        parsed.unhandled = JSON.stringify(errors);
    }

    return parsed;

}

util.isLoggedin = function(req, res, next) {
    if( req.isAuthenticated() ) {
        next();
    } else {
        req.flash('errors', {login: "먼저 로그인을 해주세요."});
        res.redirect('/login');
    }
}

util.noPermission = function(req, res) {
    req.flash('errors', {login: "접근할 수 없습니다."});
    req.logout();
    res.redirect('/login');
}

util.getPostQueryString = function(req, res, next) {//req.query로 전달받은 쿼리에서 page, limit을 추출해 다시 한 줄의 문자열로 만들어 반환한다
    res.locals.getPostQueryString = function(isAppended=false, overwrites={}) {
        var queryString = '';
        var queryArray = [];
        var page = overwrites.page?overwrites.page:(req.query.page?req.query.page:'');
        var limit = overwrites.limit?overwrites.limit:(req.query.limit?req.query.limit:'');
        var searchType = overwrites.searchType?overwrites.searchType:(req.query.searchType?req.query.searchType:'');
        var searchText = overwrites.searchText?overwrites.searchText:(req.query.searchText?req.query.searchText:'');

        if (page) queryArray.push('page='+page);
        if (limit) queryArray.push('limit='+limit);
        if (searchType) queryArray.push('searchType='+searchType);
        if (searchText) queryArray.push('searchText='+searchText);

        if(queryArray.length>0) queryString = (isAppended?'&':'?') + queryArray.join('&');

        return queryString;
    }

    next();
} /*res.locals에 getPostQueryString함수를 추가하는 미들웨어이다
* res.locals에 추가된 변수나 함수는 view에서 바로 사용할 수 있고,
* res.locals.getPostQueryString의 형식으로 route에서도 사용할 수 있게 된다. 
*/

util.convertToTrees = function(array, idFieldName, parentIdFieldName, childrenFieldName) {
    var cloned = array.slice();

    for(var i=cloned.length-1; i>=1; i--) {
        var parentId = cloned[i][parentIdFieldName];

        if(parentId) {
            var filtered = array.filter(function(elem) {
                return elem[idFieldName].toString() == parentId.toString();
            });

            if(filtered.length) {
                var parent = filtered[0];

                if(parent[childrenFieldName]) {
                    parent[childrenFieldName].push(cloned[i]);
                } else {
                    parent[childrenFieldName] = [cloned[i]];
                }
            }

            cloned.splice(i,1);
        }
    }

    return cloned;
}


module.exports = util;