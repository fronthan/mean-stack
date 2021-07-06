const http = require('http'); //내장 모듈

http.createServer((requst, response) => {
  response.writeHead(200, {'Content-Type' : 'text/plain'});
  response.write('Hello Server');
  response.end();
}).listen(3000);

/*http 상태코드
1xx 조건부응답
2xx 응답성공
3xx 리다이렉션
4xx 요청 오류
5xx 서버 오류
*/

// 1. express 사용하지 않고 내장 모듈인 http 사용해서 웹서버 띄우기