const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  restaurantName: { type: String, default: '' },
  restaurantImage: { type: String, default: '' },
  products: { type: Array, required: true },
  totalPrice: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// retrieve all orders
orderSchema.statics.getAllOrders = function () {
  return this.find();
};

// find a specific order by its unique ID
orderSchema.statics.getOrderById = function (id) {
  return this.findById(id).catch(() => null);
};

orderSchema.statics.getOrdersByUserId = function (userId) {
  return this.find({ userId });
};

// create a new order and add it to the storage
orderSchema.statics.createOrder = function (data) {
  return this.create(data);
};

// partially update fields of an existing order by ID
orderSchema.statics.updateOrder = async function (id, data) {
  const allowed = ['products', 'totalPrice', 'status'];
  const update = {};
  allowed.forEach(f => { if (data[f] !== undefined) update[f] = data[f]; });
  return this.findByIdAndUpdate(id, update, { new: true });
};

// remove an order by its ID
orderSchema.statics.deleteOrder = function (id) {
  return this.findByIdAndDelete(id);
};

// Export the Order class so it can be imported and used in controllers
module.exports = mongoose.model('Order', orderSchema);