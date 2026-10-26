const mongoose = require('mongoose');
const productSchema = require('./Product');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  phone: { type: String, default: '' },
  category: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  products: [productSchema]
});

// retrieve all restaurants
restaurantSchema.statics.getAllRestaurants = function () {
  return this.find();
};

// find a specific restaurant by its unique ID
restaurantSchema.statics.getRestaurantById = function (id) {
  return this.findById(id).catch(() => null);
};

// find restaurants of a specific owner
restaurantSchema.statics.getRestaurantsByOwner = function (ownerId) {
  return this.find({ ownerId });
};

// create a new restaurant instance and add it to the storage
restaurantSchema.statics.createRestaurant = function (data) {
  return this.create(data);
};

restaurantSchema.statics.getProductById = async function (restaurantId, productId) {
  const restaurant = await this.getRestaurantById(restaurantId);
  if (!restaurant) return null;
  return restaurant.products.find(p => p._id.toString() === productId) || null;
};

restaurantSchema.statics.addProductToRestaurant = async function (restaurantId, productData) {
  const restaurant = await this.getRestaurantById(restaurantId);
  if (!restaurant) return false;
  restaurant.products.push(productData);
  await restaurant.save();
  return restaurant.products[restaurant.products.length - 1];
};

// partially update fields of an existing restaurant by ID
restaurantSchema.statics.updateRestaurant = async function (id, data) {
  const allowed = ['name', 'description', 'address', 'phone', 'category', 'imageUrl'];
  const update = {};
  allowed.forEach(f => { if (data[f] !== undefined) update[f] = data[f]; });
  return this.findByIdAndUpdate(id, update, { new: true });
};

// remove a restaurant by its ID
restaurantSchema.statics.deleteRestaurant = function (id) {
  return this.findByIdAndDelete(id);
};

// Export the Restaurant class so it can be imported and used in controllers
module.exports = mongoose.model('Restaurant', restaurantSchema);