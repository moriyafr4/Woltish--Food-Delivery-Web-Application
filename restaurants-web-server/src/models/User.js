const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  profileImage: { type: String, default: null },
  role: { type: String, default: 'user' },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null }
});

// find a specific user by its unique ID
userSchema.statics.getUserById = function (id) {
  return this.findById(id).catch(() => null);
};

  // find a specific user by its unique username
  userSchema.statics.getUserByUsername = function (username) {
    return this.findOne({ username });
  };

  // create a new user instance and add it to the storage
  userSchema.statics.createUser = function (data) {
    return this.create(data);
  };

  // check if a user with the given username and password exists
  userSchema.statics.isExistingUser = function (username, password) {
    return this.findOne({ username, password });
  };

// Export the UserModel class so it can be imported and used in controllers
module.exports = mongoose.model('User', userSchema);