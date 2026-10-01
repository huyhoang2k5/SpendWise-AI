import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 4
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  googleId: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    trim: true,
    default: 'Người dùng'
  },
  roleCode: {
    type: String,
    default: 'other'
  },
  avatar: {
    type: String,    // Base64 hoặc URL
    default: ''
  },
  monthlyBudget: {
    type: Number,
    default: 10000000
  },
  categoryBudgets: {
    type: Map,
    of: Number,
    default: {}
  },
  categoryCustomNames: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true   // Tự thêm createdAt, updatedAt
});

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method kiểm tra password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Không trả về password trong JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
