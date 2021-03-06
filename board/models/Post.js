var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    title: {type:String, required:[true, '제목은 필입니다.']},
    body: {type:String, required:[true, '내용을 입력해주세요.']},
    createdAt: {type:Date, default:Date.now},
    updatedAt: {type:Date},
    author: {type:mongoose.Schema.Types.ObjectId, ref:'user', required:true}, //ref 는 몽고디비의 컬렉션 이름, types로 user collection의 objectID와 연결된다는 것을 mongoose에 선언 (포스트와 글 작성자 간 연결-relationship)
});


var Post = mongoose.model('post', postSchema);
module.exports = Post;