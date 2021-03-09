var mongoose = require('mongoose');

//schema
var commentSchema = mongoose.Schema({
    post: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required:true
    },
    author: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    parentComment: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'comment'
    },
    text: {
        type:String, required: [true, '내용을 작성해주세요!']
    },
    isDeleted:{type:Boolean},
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt: {
        type:Date
    }
},{
    toObject:{virtuals:true}
});//post & author - 댓글 작성자와 댓글이 달리는 게시물을 연결
//parentComment - 대댓글은 다른 댓글에 달리는 것으로, 댓글 간 관계 형성이 필요하다.
//isDeleted: true - 댓글-대댓글-대댓글 .. 이 있을 때, 중간 댓글이 삭제된다면, 하위 댓글들의 ParentComment를 잃게 된다. (orphaned) 이를 방지하기 위해 db에서 삭제하는 게 아니라, 웹사이트상 표시되지 않게 한다.

//db상에는 대댓글의 부모정보만 저장하지만, 웹사이트에 사용할 때는 부모로부터 자식들을 찾아 내려가는 것이 더 편리하므로, 자식 댓글들의 정보를 가지는 항목을 가상으로 추가하도록 처리한다 
commentSchema.virtual('childComments')
.get(function(){ return this._childComments; })
.set(function(value){ this._childComments=value });

var Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;