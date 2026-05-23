import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const uploadDir = path.join(rootDir, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mkgrup";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:8080";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadDir));

const commonSchemaOptions = {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.password_hash;
      return ret;
    },
  },
};

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true, trim: true },
    avatar_url: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  commonSchemaOptions,
);

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    photo_url: { type: String, default: null },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    bio: { type: String, default: null },
    rating: { type: Number, default: 5 },
  },
  commonSchemaOptions,
);

const landSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    image_url: { type: String, default: null },
    gallery: { type: [String], default: [] },
    price: { type: Number, required: true },
    square_feet: { type: Number, required: true },
    location: { type: String, required: true, trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    nearby_places: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
    video_url: { type: String, default: null },
  },
  {
    ...commonSchemaOptions,
    toJSON: {
      ...commonSchemaOptions.toJSON,
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.price_per_sqft = ret.square_feet ? ret.price / ret.square_feet : null;
        ret.seller_id = ret.seller_id ? ret.seller_id.toString() : null;
        delete ret._id;
        return ret;
      },
    },
  },
);

const reviewSchema = new mongoose.Schema(
  {
    land_id: { type: mongoose.Schema.Types.ObjectId, ref: "Land", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  commonSchemaOptions,
);

const contactMessageSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  commonSchemaOptions,
);

const User = mongoose.model("User", userSchema);
const Seller = mongoose.model("Seller", sellerSchema);
const Land = mongoose.model("Land", landSchema);
const Review = mongoose.model("Review", reviewSchema);
const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  user_metadata: { full_name: user.full_name, avatar_url: user.avatar_url },
  role: user.role,
});

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required" });
  const payload = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(payload.id);
  if (!user) return res.status(401).json({ message: "Invalid session" });
  req.user = user;
  next();
});

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith("image/"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user), isAdmin: req.user.role === "admin" });
});

app.post("/api/auth/signup", asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) return res.status(400).json({ message: "Name, email and password are required" });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "An account already exists with this email" });
  const userCount = await User.countDocuments();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const role = userCount === 0 || adminEmail === email.toLowerCase() ? "admin" : "user";
  const user = await User.create({
    email,
    full_name: fullName,
    password_hash: await bcrypt.hash(password, 12),
    role,
  });
  res.status(201).json({ user: publicUser(user), token: signToken(user), isAdmin: role === "admin" });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase() });
  if (!user || !(await bcrypt.compare(String(password || ""), user.password_hash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json({ user: publicUser(user), token: signToken(user), isAdmin: user.role === "admin" });
}));

app.post("/api/auth/reset-password", asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  res.json({ message: "If that email exists, please contact the site admin to reset the password." });
}));

app.post("/api/auth/update-password", requireAuth, asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
  req.user.password_hash = await bcrypt.hash(password, 12);
  await req.user.save();
  res.json({ message: "Password updated" });
}));

app.get("/api/lands", asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.location) filter.location = { $regex: String(req.query.location), $options: "i" };
  if (req.query.minPrice || req.query.maxPrice) filter.price = {};
  if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
  if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  if (req.query.minSqft || req.query.maxSqft) filter.square_feet = {};
  if (req.query.minSqft) filter.square_feet.$gte = Number(req.query.minSqft);
  if (req.query.maxSqft) filter.square_feet.$lte = Number(req.query.maxSqft);
  const limit = req.query.limit ? Number(req.query.limit) : 0;
  const query = Land.find(filter).sort({ featured: -1, created_at: -1 });
  if (limit) query.limit(limit);
  res.json(await query);
}));

app.post("/api/lands", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  res.status(201).json(await Land.create(req.body));
}));

app.get("/api/lands/:id", asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);
  if (!land) return res.status(404).json({ message: "Land not found" });
  res.json(land);
}));

app.put("/api/lands/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const land = await Land.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!land) return res.status(404).json({ message: "Land not found" });
  res.json(land);
}));

app.delete("/api/lands/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  await Land.findByIdAndDelete(req.params.id);
  await Review.deleteMany({ land_id: req.params.id });
  res.status(204).end();
}));

app.get("/api/sellers", asyncHandler(async (_req, res) => {
  res.json(await Seller.find().sort({ created_at: -1 }));
}));

app.post("/api/sellers", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  res.status(201).json(await Seller.create(req.body));
}));

app.get("/api/sellers/:id", asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) return res.status(404).json({ message: "Seller not found" });
  res.json(seller);
}));

app.put("/api/sellers/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const seller = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!seller) return res.status(404).json({ message: "Seller not found" });
  res.json(seller);
}));

app.delete("/api/sellers/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  await Seller.findByIdAndDelete(req.params.id);
  await Land.updateMany({ seller_id: req.params.id }, { seller_id: null });
  res.status(204).end();
}));

app.get("/api/lands/:id/reviews", asyncHandler(async (req, res) => {
  const reviews = await Review.find({ land_id: req.params.id }).populate("user_id").sort({ created_at: -1 });
  res.json(reviews.map((review) => ({
    id: review.id,
    land_id: review.land_id?.toString() ?? null,
    user_id: review.user_id?.id,
    rating: review.rating,
    text: review.text,
    created_at: review.created_at,
    author_name: review.user_id?.full_name ?? null,
    author_avatar: review.user_id?.avatar_url ?? null,
  })));
}));

app.post("/api/lands/:id/reviews", requireAuth, asyncHandler(async (req, res) => {
  const review = await Review.create({
    land_id: req.params.id,
    user_id: req.user.id,
    rating: Number(req.body.rating),
    text: req.body.text,
  });
  res.status(201).json(review);
}));

app.post("/api/contact-messages", requireAuth, asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: "All fields are required" });
  res.status(201).json(await ContactMessage.create({ user_id: req.user.id, name, email, message }));
}));

app.post("/api/uploads", requireAuth, requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image file is required" });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

const distDir = path.join(rootDir, "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (_req, res) => res.sendFile(path.join(distDir, "index.html")));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.name === "ValidationError" || err.name === "CastError" ? 400 : 500;
  res.status(status).json({ message: err.message || "Server error" });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
