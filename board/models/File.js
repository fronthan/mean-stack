var mongoose = require('mongoose');
var fs = require('fs');//file system의 약어, 컴퓨터의 파일을 조작할 수 있는 node.js 기본 제공 모듈
var path = require('path'); //path도 폴더 및 파일의 path를 조작할 수 있는 node.js 기본 제공 모듈

// Schema
var fileSchema = mongoose.Schema({
    originalFileName: {type:String},
    serverFileName: {type:String},
    size: {type:Number},
    uploadedBy: {type:mongoose.Schema.Types.ObjectId, ref:'user', required:true}, //로그인된 유저만 (게시물 작성)업로드할 수 있으므로 required
    postId: {type:mongoose.Schema.Types.ObjectId, ref:'post'},
    isDeleted:{type:Boolean, default:false}
});

//instance methods
//instance 함수는 모델의 메소드 객체에 추가할 수 있다. 이 함수 안에서의 this는 인스턴스 자체를 가리킨다
fileSchema.methods.processDelete = function() {
    this.isDeleted = true;
    this.save();
}

fileSchema.methods.getFileStream = function() {
    var stream;
    var filePath = path.join(__dirname, '..', 'uploadedFiles', this.serverFileName); //파일 경로를 스트링으로
    var fileExists = fs.existsSync(filePath); //existsSynd함수는 파일위치에 파일 존재하면 true를 반환
    if(fileExists) { 
        stream = fs.createReadStream(filePath); //파일의 읽기 전용 스트림을 생성한다
    } else { //파일이 없다면 삭제(된 것처럼) 처리.
        this.processDelete();
    }

    return stream; //파일이 없다면 streamd은 undefined 
}

//model & export
var File = mongoose.model('file', fileSchema);

//model methods
File.createNewInstance = async function(file, uploadedBy, postId) {//file모델의 객체를 DB에 생성하고, 생성한 객체를 반환한다
    //함수에 전달되는 file인자는 multer로 생성된 파일 정보가 들어있는 객체이다
    return await File.create({
        originalFileName: file.originalname,
        serverFileName:file.filename,//같은 이름이 업로드되는 경우를 대비
        size:file.size,
        uploadedBy:uploadedBy,
        postId:postId
    });
}

module.exports = File;