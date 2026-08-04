import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  isHealthFocused: { type: Boolean, default: false },
  price: { type: Number },
  hasSizes: { type: Boolean, default: false },
  sizes: [
    {
      size: { type: String, enum: ['Regular', 'Medium', 'Large'] },
      price: { type: Number, required: true }
    }
  ],
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
