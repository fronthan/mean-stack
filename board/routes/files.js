var express = require('express');
var router = express.Router();
var File = require('../models/File');

router.get('/:serverFileName/:originalFileName', function(req, res) {
    File.findOne({serverFileName: req.params.serverFileName, originalFileName: req.params.originalFileName}, function(err, file) {
        //라우터로 받은 파일이름들을 이용해 DB에서 찾는다
        if(err) return res.json(err);

        var stream = file.getFileStream(); //서버 파일의 스트림을 가져온다
        //console.log(stream);
        if(stream) { 
            res.writeHead(200, {//response 헤더를 파일 다운로드에 맞도록 설정
                'Content-Type': 'application/octet-stream; charset=utf-8',
                'Content-Disposition' : 'attachment; filename=' + encodeURI(file.originalFileName)
            });
            stream.pipe(res); //파일 스트림과 response를 연결한다. 이렇게 하면 서버파일의 스트림을 response에 연결해서 클라이언트에 파일을 보낼 수 있다
        } else {//스트림이 없으면 찾을 수 없음으로 설정, 아무것도 전달하지 않고 끝낸다
            res.statusCode = 404;
            res.end();
        }
    });
});

module.exports = router;