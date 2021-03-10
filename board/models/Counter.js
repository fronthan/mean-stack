var mongoose = require('mongoose');

//Schema
var counterSchema = mongoose.Schema({
    name: {type:String, required:true},//이 사이트에서는 name 에 값이 무조건 'posts'이다. 그리고 counter model에 document는 단 하나만 생성된다
    count:{type:Number, default:0}
});

//model & export
var Counter = mongoose.model('counter', counterSchema);
module.exports = Counter;