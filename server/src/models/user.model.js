import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MAX_STORAGE = process.env.MAX_STORAGE_SIZE || 1073741824; // 1 GB default

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Adds an index for faster email lookups
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.googleId;
        },
        "Password is required for email/password sign up",
      ],
      select: false, // Don't return password by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Ensures uniqueness only for users who have a googleId
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
    storageQuota: {
      type: Number,
      default: MAX_STORAGE,
    },
    rootDirectory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Directory",
    },
    hasVault: {
      type: Boolean,
      default: false,
    },
    vaultPin: {
      type: String,
      select: false, // Don't return PIN by default
    },
    rootVaultDirectory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Directory",
    },
    rootTrashDirectory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Directory",
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving the user document
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare candidate password with the stored hashed password.
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
