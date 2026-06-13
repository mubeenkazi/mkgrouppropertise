import "dotenv/config";
import dns from "node:dns";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { del, put } from "@vercel/blob";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const uploadDir = process.env.VERCEL ? path.join("/tmp", "uploads") : path.join(rootDir, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mkgrup";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:8080";
const allowedOrigins = CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const hasBlobStorage = Boolean(BLOB_TOKEN);

dns.setServers(["8.8.8.8", "8.8.4.4"]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(["/uploads", "/api/uploads"], express.static(uploadDir));

let dbConnection;
const connectDb = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!dbConnection) dbConnection = mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  return dbConnection;
};

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
    boundary_left: { type: String, default: null },
    boundary_right: { type: String, default: null },
    boundary_front: { type: String, default: null },
    boundary_back: { type: String, default: null },
    road_distance: { type: String, default: null },
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

landSchema.index({ featured: -1, created_at: -1 });
landSchema.index({ price: 1 });
landSchema.index({ square_feet: 1 });
landSchema.index({ location: 1 });
reviewSchema.index({ land_id: 1, created_at: -1 });

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
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const publicLand = (land) => ({
  ...land,
  id: land._id.toString(),
  price_per_sqft: land.square_feet ? land.price / land.square_feet : null,
  seller_id: land.seller_id ? land.seller_id.toString() : null,
  _id: undefined,
});
const getUploadPath = (url) => {
  if (!url || typeof url !== "string" || !url.startsWith("/uploads/")) return null;
  const filename = path.basename(url);
  const resolved = path.resolve(uploadDir, filename);
  return resolved.startsWith(uploadDir) ? resolved : null;
};
const deleteUploadedFile = async (url) => {
  if (typeof url === "string" && url.startsWith("data:")) return;
  if (hasBlobStorage && typeof url === "string" && url.includes(".blob.vercel-storage.com/")) {
    await del(url);
    return;
  }
  const filePath = getUploadPath(url);
  if (!filePath) return;
  await fs.promises.rm(filePath, { force: true });
};
const deleteUploadedFiles = async (urls) => {
  await Promise.all([...new Set(urls.filter(Boolean))].map((url) => deleteUploadedFile(url)));
};
const landUploadUrls = (land) => [land?.image_url, ...(land?.gallery ?? [])];

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required" });
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Your session expired. Please log in again." });
  }
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
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Please upload an image file"));
    cb(null, true);
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api", asyncHandler(async (_req, _res, next) => {
  await connectDb();
  next();
}));

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
  if (req.query.location) {
    const location = escapeRegex(String(req.query.location).trim());
    filter.$or = [
      { location: { $regex: location, $options: "i" } },
      { title: { $regex: location, $options: "i" } },
      { nearby_places: { $elemMatch: { $regex: location, $options: "i" } } },
    ];
  }
  if (req.query.minPrice || req.query.maxPrice) filter.price = {};
  if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
  if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  if (req.query.minSqft || req.query.maxSqft) filter.square_feet = {};
  if (req.query.minSqft) filter.square_feet.$gte = Number(req.query.minSqft);
  if (req.query.maxSqft) filter.square_feet.$lte = Number(req.query.maxSqft);
  const limit = req.query.limit ? Number(req.query.limit) : 0;
  const query = Land.find(filter).sort({ featured: -1, created_at: -1 });
  if (req.query.summary === "1") {
    query.select("title image_url price square_feet location featured seller_id created_at");
  }
  if (limit) query.limit(limit);
  const lands = await query.lean();
  res.json(lands.map(publicLand));
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
  const current = await Land.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Land not found" });
  const land = await Land.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!land) return res.status(404).json({ message: "Land not found" });
  const nextUrls = new Set(landUploadUrls(land));
  const removedUrls = landUploadUrls(current).filter((url) => url && !nextUrls.has(url));
  await deleteUploadedFiles(removedUrls);
  res.json(land);
}));

app.delete("/api/lands/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const land = await Land.findByIdAndDelete(req.params.id);
  if (land) await deleteUploadedFiles(landUploadUrls(land));
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
  const current = await Seller.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Seller not found" });
  const seller = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!seller) return res.status(404).json({ message: "Seller not found" });
  if (current.photo_url && current.photo_url !== seller.photo_url) {
    await deleteUploadedFile(current.photo_url);
  }
  res.json(seller);
}));

app.delete("/api/sellers/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const seller = await Seller.findByIdAndDelete(req.params.id);
  if (seller?.photo_url) await deleteUploadedFile(seller.photo_url);
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

app.post("/api/uploads", requireAuth, requireAdmin, upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image file is required" });
  const bucket = req.body.bucket === "seller-images" ? "seller-images" : "land-images";
  const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  if (hasBlobStorage) {
    try {
      const blob = await put(`${bucket}/${Date.now()}-${safeName}`, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
        addRandomSuffix: true,
        token: BLOB_TOKEN,
      });
      return res.status(201).json({ url: blob.url });
    } catch (error) {
      console.error("Blob upload failed:", error);
      return res.status(201).json({ url: dataUrl });
    }
  }
  if (process.env.VERCEL) return res.status(201).json({ url: dataUrl });
  const filename = `${Date.now()}-${safeName}`;
  await fs.promises.writeFile(path.join(uploadDir, filename), req.file.buffer);
  res.status(201).json({ url: `/uploads/${filename}` });
}));

const distDir = path.join(rootDir, "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (_req, res) => res.sendFile(path.join(distDir, "index.html")));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 8MB or smaller" : "Image upload failed";
    return res.status(400).json({ message });
  }
  const isClientError = err.name === "ValidationError" || err.name === "CastError" || err.message === "Please upload an image file";
  const status = isClientError ? 400 : 500;
  const message = isClientError ? "Please check the details and try again." : "Something went wrong. Please try again later.";
  res.status(status).json({ message });
});

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] || "").href;

if (isDirectRun) {
  connectDb()
    .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      process.exit(1);
    });
}

export default app;
