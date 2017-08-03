const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    }
});

userSchema.virtual('password')
.get(function() {
  return null
})
.set(function(value) {
  const hash = bcrypt.hashSync(value, 8);
  this.passwordHash = hash;
})
userSchema.methods.authenticate = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
}
userSchema.statics.authenticate = function(userName, userPass, done) {
  this.findOne({
    username: userName
  }, function(err, user) {
      if (err) {
        done(err, false)
      } else if (user && user.authenticate(userPass)) {
        done(null, user)
      } else {
        done(null, false)
      }
    })
};

const User = mongoose.model('User', userSchema);
module.exports = {
  User: User
};
