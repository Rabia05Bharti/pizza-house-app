import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: String },
  name: { type: String, required: true },
  category: { type: String },
  selectedSize: { type: String, default: '' },
  extraToppings: [{ type: String }],
  extraToppingCost: { type: Number, default: 0 },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalItemPrice: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    tableOrAddress: { type: String, required: true },
    orderType: { type: String, enum: ['Dine-In', 'Takeaway', 'Delivery'], default: 'Dine-In' }
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true }, // WYSWYP final amount (no added tax)
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Cash', 'Hold'], default: 'Pending' },
  paymentDetails: {
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    paymentMethod: { type: String, default: 'Razorpay' }
  },
  orderStatus: { 
    type: String, 
    enum: ['Received', 'Preparing', 'Ready', 'Delivered', 'Cancelled'], 
    default: 'Received' 
  }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
