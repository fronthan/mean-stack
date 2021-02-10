var express = require('express');
var app = express();

/* get method 와 라우트 의 기본 예 */
// app.get('/', function(req, res) {
//     res.send('Hello world');
// });

app.set('view engine', 'ejs'); //ejs 를 사용하기 위해서 express의 view engine에 ejs 를 set한다

app.use(express.static(__dirname + '/public'));
/*app.use(콜백함수)
* req, res, next 가 콜백함수로 자동 전달된다.
* http method나 route에 상관없이 서버에 요청이 올 때마다 무조건 콜백함수가 실행된다
* express.static 함수는 실제 사용될 콜백함수가 리턴된다
* __dirname은 node.js 에서 실행중인 파일의 위치를 나타내는 global 변수이다
******* 즉, '현재위치/public 루트를 스태틱 폴더로 지정하라는 뜻!
* 파일 이름을 지정하지 않고 '/' route 에 접속하면, '현재위치/public/index.html'에 자동으로 접근한다
*/

app.get('/hello', function(req, res) {
    res.render('hello', {name:req.query.nameQuery});
}); /*query를 통해 이름을 받는다. 모든 query는 req.query에 저장된다.
* 여기서 쿼리란, 주소 뒤에 붙는 '?' 키=값 으로 오는 것. nameQuery가 키를 뜻한다. */
/* ejs파일을 사용하기 위해서 res.render 함수를 사용하고, 첫째 파라미터는 ejs의 이름, 둘째 파라미터는 ejs에서 사용될 object를 전달한다.
* res.render함수는 ejs를 /views 폴더에서 찾으므로 폴더 이름 변경은 하면 안 된다 */

app.get('/hello/:nameParam', function(req, res) {
    res.render('hello', {name: req.params.nameParam});
}); // route parameter를 통해 이름을 받는다. 콜론으로 시작되는 route 는 해당 부분에 입력되는 route의 텍스트가 req.params에 저장된다. 


var port = 3000;
app.listen(port, function(){
    console.log('server on! localhost'+port);
})