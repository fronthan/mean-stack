var mongoose = require('mongoose');

//DB schema
var contactSchema = mongoose.Schema({
    name: {type:String, required:true, unique:true},
    email:{type:String},
    phone:{type:String}
});

var Contact = mongoose.model('contact', contactSchema); //contact모델 생성. 'contact'는 몽고디비에서 사용되는 컬렉션 이름, contactSchema는 위에 생성한 스키마 오브젝트

module.exports = Contact;