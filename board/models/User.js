var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // 비밀번호 암호화를 위해

//schema
/*
select:false 는 DB에서 해당 모델을 읽어올 때 값을 읽어오지 않는다.
* trim은 문자열 앞뒤의 공백을 제거해준다
*/
var userSchema = mongoose.Schema({
    username: {type:String, required:[true, '이름은 필수입니다.'], match:[/^.{4,12}$/,'4-12자이어야 합니다.'], trim:true, unique:true},
    password:{type:String, required:[true, 'Password is required!'], select:false},
    name:{type:String, required:[true, 'Name is required'], match:[/^.{4,12}$/,'4-12자이어야 합니다.'], trim:true},
    email:{type:String, match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'이메일 주소를 정확하게 입력해주세요.'], trim:true}
}, {
    toObject:{virtuals:true}
});

//virtuals
/*
 * DB에 저장되는 값 이외의 항목을 virtual로 만든다.
 * 회원정보를 수정할 때 필요한 항목이지만 저장할 필요는 없는 것들을 다룬다. 
 */
userSchema.virtual('passwordConfirmation')
.get(function(){ return this._passwordConfirmation; })
.set(function(value){ this._passwordConfirmation=value;});

userSchema.virtual('originalPassword')
.get(function(){ return this._originalPassword; })
.set(function(value){this._originalPassword=value;});

userSchema.virtual('currentPassword')
.get(function(){ return this._currentPassword;})
.set(function(value){ this._currentPassword=value;});

userSchema.virtual('newPassword')
.get(function(){ return this._newPassword;})
.set(function(value){ this._newPassword=value;});

//password validation
/*
 * password를 DB에 생성, 수정하기 전에 값이 유효한지 확인한다 
 * model.invalidate함수 (항목이름, 에러메시지)
 */
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = '최소 8글자의 알파벳과 숫자를 혼용해주세요.';
userSchema.path('password').validate(function(v){
    var user = this; //validate 콜백함수 속의 this는 user model이다

    //create user
    if(user.isNew) { //isNew는 생성될 경우 true 반환, 회원가입 단계
        //passwordConfirmation 값이 없는 경우, 다른 경우 invalidate 처리 한다.
        if(!user._passwordConfirmation) {
            user.invalidate('passwordConfirmation', '비밀번호 확인은 필수입니다.');
        }

        if (!passwordRegex.test(user.password)) {//false라면 실행
            user.invalidate('password', passwordRegexErrorMessage);
        } else if(user.password !== user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', '두 개의 비밀번호가 일치하지 않습니다.')
        }
    }

    //update user
    if(!user.isNew) {//정보 수정 단계
        if(!user.currentPassword) {
            user.invalidate('currentPassword', '비밀번호는 필수값입니다.')
        } else if (!bcrypt.compareSync(user.currentPassword, user.originalPassword)) {// password hash 값 비교
            user.invalidate('currentPassword', '현재 비밀번호가 일치하지 않습니다.');
        }

        if (user.newPassword && !passwordRegex.test(user.newPassword)) {
            user.invalidate('newPassword', passwordRegexErrorMessage);
        } else if(user.newPassword !== user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', '비밀번호가 일치하지 않습니다.')
        }
    }
});

//hash password
userSchema.pre('save', function(next) {//save 가 되기 전에 발생하는 함수, user 생성 (회원가입) 또는 user 수정 후 save (정보 수정)
    var user = this;
    if(!user.isModified('password')) { // 비번이 수정되지 않았을 때, isModified는 해당 값이 변경된 경우 true, 변경안되면 false를 반환하는 함수. 변경이 안 된 경우라면 해시를 만들지 않는다.
        return next();
    } else {
        user.password = bcrypt.hashSync(user.password); // 새로운 user를 생성하거나 비번 수정 시 hash값으로 변환한다. 
        return next();
    }
});

//model methods 
userSchema.methods.authenticate = function(password) {
    var user = this;
    return bcrypt.compareSync(password,user.password);
}

//model & export
var User = mongoose.model('user', userSchema);
module.exports = User;