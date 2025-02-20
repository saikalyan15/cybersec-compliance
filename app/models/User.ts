// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Clear any existing models
if (mongoose.models.User) {
  delete mongoose.models.User;
}

// Define the User Schema with all required fields
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'owner'],
      default: 'user',
      required: true,
    },
  },
  {
    timestamps: true,
    // This ensures that when converting to JSON/Object, virtuals are included
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch {
    // Removed unused parameter
    next(new Error('Failed to hash password'));
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch {
    // Removed unused parameter
    throw new Error('Error comparing passwords');
  }
};

// Ensure all fields are selected by default
const User = mongoose.model('User', userSchema);

// Add this to help with debugging
if (process.env.NODE_ENV !== 'production') {
  User.watch().on('change', (data) => {
    console.log('User collection change:', data);
  });
}

export default User;
