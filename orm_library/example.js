var mongoose = require('mongoose');
var mongodb = "mongodb+srv://fronthan:happy30ryan@cluster0.1aald.mongodb.net/node-react?retryWrites=true&w=majority";

var studentSchema = mongoose.Schema({
    name: {type:String, required:true},
    age: {type:Number, required:true}
});

var Student = mongoose.model('student', studentSchema);

mongoose.Promise = global.Promise;
mongoose.connect(mongodb);
var db = mongoose.connection;

db.once('open', function() {
    Student.create({name: "Jane", age:20}, function(error, student) {
        console.log('Student.create:', student);

        Student.find({}, function(error, students) {
            console.log("Student.find:", students);
        });
    });
});

