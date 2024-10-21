const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['fixed', 'percentage'] },
  discoundValue: { type: Number, required: true },
  minCartValue: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
});
const coupon = mongoose.model('Coupon',couponSchema);

module.exports=coupon