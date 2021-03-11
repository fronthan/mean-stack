var mongoose = require('mongoose');
var Counter = require('./Counter');

var postSchema = mongoose.Schema({
    title: {type:String, required:[true, '제목은 필수입니다.']},
    body: {type:String, required:[true, '내용을 입력해주세요.']},
    author: {type:mongoose.Schema.Types.ObjectId, ref:'user', required:true}, //ref 는 몽고디비의 컬렉션 이름, types로 user collection의 objectID와 연결된다는 것을 mongoose에 선언 (포스트와 글 작성자 간 연결-relationship)
    views: {type:Number, default:0}, //조회수를 위해서
    numId: {type:Number}, //글 번호를 위해서
    attachment:{type:mongoose.Schema.Types.ObjectId, ref:'file'}, //파일의 id 를 가져와 post와 연결한다 
    createdAt: {type:Date, default:Date.now},
    updatedAt: {type:Date},
});

postSchema.pre('save', async function(next) {
    var post = this;

    if(post.isNew) {
        counter = await Counter.findOne({name: 'posts'}).exec();
        if(!counter) counter = await Counter.create({name: 'posts'});
        counter.count++;
        counter.save();
        post.numId = counter.count;
    }
    return next();
});

var Post = mongoose.model('post', postSchema);
module.exports = Post;