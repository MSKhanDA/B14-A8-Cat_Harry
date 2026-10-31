import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import multer from "multer";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
const jwtSecret = process.env.JWT_SECRET;
const cookieName = "studiospace_token";

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required. Add it to the server environment.");
}

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(passport.initialize());

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    photoUrl: { type: String, default: "" },
    passwordHash: { type: String, default: "" },
    googleId: { type: String, default: "" },
  },
  { timestamps: true },
);

const studioSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    hourlyRate: { type: Number, required: true, min: 1 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    maxCapacity: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    galleryImages: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    overview: { type: String, required: true },
    ownerEmail: { type: String, required: true, lowercase: true },
    ownerName: { type: String, required: true },
    ownerPhoto: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const bookingSchema = new Schema(
  {
    studioId: { type: Schema.Types.ObjectId, ref: "Studio", required: true },
    studioTitle: { type: String, required: true },
    studioImage: { type: String, required: true },
    ownerEmail: { type: String, required: true, lowercase: true },
    guestEmail: { type: String, required: true, lowercase: true },
    guestName: { type: String, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    hours: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

const reviewSchema = new Schema(
  {
    studioId: { type: Schema.Types.ObjectId, ref: "Studio", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    guestEmail: { type: String, required: true, lowercase: true },
    guestName: { type: String, required: true },
    guestPhoto: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1200 },
  },
  { timestamps: true },
);

const User = mongoose.models.User ?? mongoose.model("User", userSchema);
const Studio = mongoose.models.Studio ?? mongoose.model("Studio", studioSchema);
const Booking = mongoose.models.Booking ?? mongoose.model("Booking", bookingSchema);
const Review = mongoose.models.Review ?? mongoose.model("Review", reviewSchema);

type AuthUser = { id: string; email: string; name: string; photoUrl: string };

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      photoUrl: string;
    }
  }
}

type AuthRequest = Request;

function signToken(user: AuthUser) {
  return jwt.sign(user, jwtSecret as string, { expiresIn: "7d" });
}

function setAuthCookie(res: Response, user: AuthUser) {
  res.cookie(cookieName, signToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  if (!token) {
    res.status(401).json({ message: "Please sign in to continue." });
    return;
  }
  try {
    req.user = jwt.verify(token, jwtSecret as string) as AuthUser;
    next();
  } catch {
    res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
}

const userFrom = (user: { _id: mongoose.Types.ObjectId; email: string; name: string; photoUrl?: string }): AuthUser => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  photoUrl: user.photoUrl ?? "",
});

const credentialsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(6).max(128).regex(/[a-z]/).regex(/[A-Z]/),
  photoUrl: z.string().trim().url().or(z.literal("")).optional(),
});

const studioInputSchema = z.object({
  title: z.string().trim().min(3).max(100),
  category: z.string().trim().min(2).max(50),
  hourlyRate: z.coerce.number().min(1).max(10000),
  securityDeposit: z.coerce.number().min(0).max(100000),
  maxCapacity: z.coerce.number().int().min(1).max(1000),
  location: z.string().trim().min(3).max(160),
  imageUrl: z.string().url(),
  galleryImages: z.array(z.string().url()).max(8).default([]),
  amenities: z.array(z.string().trim().min(1).max(40)).max(30),
  overview: z.string().trim().min(20).max(5000),
});
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, done) => {
    if (!file.mimetype.startsWith("image/")) {
      done(new Error("Choose an image file."));
      return;
    }
    done(null, true);
  },
});

function parseStudioImage(req: Request, res: Response, next: NextFunction) {
  imageUpload.single("image")(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        message: error.code === "LIMIT_FILE_SIZE" ? "Choose an image smaller than 8 MB." : error.message,
      });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    next();
  });
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/images", requireAuth, parseStudioImage, async (req: AuthRequest, res, next) => {
  try {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      res.status(503).json({ message: "Image uploads aren't configured yet. Add IMGBB_API_KEY to the server environment." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "Choose an image to upload." });
      return;
    }
    const form = new FormData();
    form.set("image", new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype }), req.file.originalname);
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body: form,
    });
    const result = await response.json() as { success?: boolean; data?: { url?: string }; error?: { message?: string } };
    if (!response.ok || !result.success || !result.data?.url) {
      res.status(502).json({ message: result.error?.message ?? "The image host could not upload this file." });
      return;
    }
    res.status(201).json({ imageUrl: result.data.url });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Check your details. Passwords need an uppercase letter, a lowercase letter, and at least 6 characters." });
      return;
    }
    const { name, email, password, photoUrl } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      res.status(409).json({ message: "An account with that email already exists." });
      return;
    }
    let user;
    try {
      user = await User.create({
        name,
        email: normalizedEmail,
        photoUrl: photoUrl ?? "",
        passwordHash: await bcrypt.hash(password, 12),
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        res.status(409).json({ message: "An account with that email already exists." });
        return;
      }
      throw error;
    }
    res.status(201).json({ user: userFrom(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Enter a valid email and password." });
      return;
    }
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user || !user.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      res.status(401).json({ message: "That email and password combination doesn't match." });
      return;
    }
    setAuthCookie(res, userFrom(user));
    res.json({ user: userFrom(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", requireAuth, (req: AuthRequest, res) => res.json({ user: req.user }));
app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.json({ ok: true });
});

app.get("/api/auth/google/status", (_req, res) => {
  res.json({ configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) });
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL ?? "http://localhost:4000"}/api/auth/google/callback`,
      },
      (_accessToken, _refreshToken, profile, done) => {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          done(new Error("Your Google account did not provide an email address."));
          return;
        }
        User.findOneAndUpdate(
          { email },
          {
            $set: { name: profile.displayName, photoUrl: profile.photos?.[0]?.value ?? "", googleId: profile.id },
            $setOnInsert: { email },
          },
          { new: true, upsert: true, runValidators: true },
        )
          .then((user) => done(null, user))
          .catch(done);
      },
    ),
  );
}

app.get("/api/auth/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res.status(503).json({ message: "Google sign-in isn't configured yet." });
    return;
  }
  passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});

app.get("/api/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (error: Error | null, user?: InstanceType<typeof User>) => {
    if (error || !user) {
      res.redirect(`${clientUrl}/login?error=google`);
      return;
    }
    setAuthCookie(res, userFrom(user));
    res.redirect(clientUrl);
  })(req, res, next);
});

app.get("/api/studios", async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = {};
    if (typeof req.query.category === "string" && req.query.category !== "All spaces") {
      filter.category = req.query.category;
    }
    if (typeof req.query.q === "string" && req.query.q.trim()) {
      const escaped = req.query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ title: { $regex: escaped, $options: "i" } }, { location: { $regex: escaped, $options: "i" } }];
    }
    const studios = await Studio.find(filter).sort({ featured: -1, createdAt: -1 }).limit(100).lean();
    res.json({ studios });
  } catch (error) {
    next(error);
  }
});

app.get("/api/studios/featured", async (_req, res, next) => {
  try {
    const studios = await Studio.find().sort({ featured: -1, rating: -1, createdAt: -1 }).limit(6).lean();
    res.json({ studios });
  } catch (error) {
    next(error);
  }
});

app.get("/api/studios/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(404).json({ message: "This studio could not be found." });
      return;
    }
    const studio = await Studio.findById(req.params.id).lean();
    if (!studio) {
      res.status(404).json({ message: "This studio could not be found." });
      return;
    }
    res.json({ studio });
  } catch (error) {
    next(error);
  }
});

app.get("/api/studios/:id/reviews", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(404).json({ message: "This studio could not be found." });
      return;
    }
    const reviews = await Review.find({ studioId: req.params.id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

app.post("/api/studios/:id/reviews", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(404).json({ message: "This studio could not be found." });
      return;
    }
    const parsed = z.object({
      bookingId: z.string().refine(mongoose.isValidObjectId),
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().trim().min(10).max(1200),
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Choose a rating and write a review of at least 10 characters." });
      return;
    }
    const [studio, booking] = await Promise.all([
      Studio.findById(req.params.id),
      Booking.findOne({
        _id: parsed.data.bookingId,
        studioId: req.params.id,
        guestEmail: req.user!.email,
        status: "Completed",
        endsAt: { $lte: new Date() },
      }),
    ]);
    if (!studio) {
      res.status(404).json({ message: "This studio could not be found." });
      return;
    }
    if (!booking) {
      res.status(403).json({ message: "A completed booking is required to review this studio." });
      return;
    }
    try {
      const review = await Review.create({
        studioId: studio._id,
        bookingId: booking._id,
        guestEmail: req.user!.email,
        guestName: req.user!.name,
        guestPhoto: req.user!.photoUrl,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      });
      const [rating] = await Review.aggregate<{ average: number; count: number }>([
        { $match: { studioId: studio._id } },
        { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      await Studio.updateOne(
        { _id: studio._id },
        { rating: rating.average, reviewCount: rating.count },
      );
      res.status(201).json({ review });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        res.status(409).json({ message: "You’ve already reviewed this completed booking." });
        return;
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/studios", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const parsed = studioInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Please check that every studio field is complete and valid." });
      return;
    }
    const studio = await Studio.create({
      ...parsed.data,
      ownerEmail: req.user!.email,
      ownerName: req.user!.name,
      ownerPhoto: req.user!.photoUrl,
    });

    res.status(201).json({ studio });
  } catch (error) {
    next(error);
  }
});

app.get("/api/my-listings", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const studios = await Studio.find({ ownerEmail: req.user!.email }).sort({ createdAt: -1 }).lean();
    res.json({ studios });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/studios/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const parsed = studioInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Please check that every studio field is complete and valid." });
      return;
    }
    const studio = await Studio.findOneAndUpdate(
      { _id: req.params.id, ownerEmail: req.user!.email },
      parsed.data,
      { new: true, runValidators: true },
    );
    if (!studio) {
      res.status(404).json({ message: "Studio not found or you don't have permission to edit it." });
      return;
    }
    res.json({ studio });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/studios/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const studio = await Studio.findOneAndDelete({ _id: req.params.id, ownerEmail: req.user!.email });
    if (!studio) {
      res.status(404).json({ message: "Studio not found or you don't have permission to remove it." });
      return;
    }
    await Booking.deleteMany({ studioId: studio._id, status: { $in: ["Pending", "Confirmed"] } });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const parsed = z.object({
      studioId: z.string().refine(mongoose.isValidObjectId),
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime(),
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Choose a studio and valid start and end times." });
      return;
    }
    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(parsed.data.endsAt);
    const hours = (endsAt.getTime() - startsAt.getTime()) / 3_600_000;
    if (startsAt.getTime() <= Date.now()) {
      res.status(400).json({ message: "Choose a start time in the future." });
      return;
    }
    if (hours < 1 || hours > 24) {
      res.status(400).json({ message: "Bookings must be between 1 and 24 hours." });
      return;
    }
    const studio = await Studio.findById(parsed.data.studioId);
    if (!studio) {
      res.status(404).json({ message: "This studio is no longer available." });
      return;
    }
    if (studio.ownerEmail === req.user!.email) {
      res.status(400).json({ message: "You can't book your own studio." });
      return;
    }
    const collision = await Booking.exists({
      studioId: studio._id,
      status: "Confirmed",
      startsAt: { $lt: endsAt },
      endsAt: { $gt: startsAt },
    });
    if (collision) {
      res.status(409).json({ message: "Those hours overlap a confirmed booking. Please choose another time." });
      return;
    }
    const booking = await Booking.create({
      studioId: studio._id,
      studioTitle: studio.title,
      studioImage: studio.imageUrl,
      ownerEmail: studio.ownerEmail,
      guestEmail: req.user!.email,
      guestName: req.user!.name,
      startsAt,
      endsAt,
      hours,
      total: Math.round(hours * studio.hourlyRate * 100) / 100,
      status: "Pending",
    });
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
});

app.get("/api/my-bookings", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const bookings = await Booking.find({ guestEmail: req.user!.email }).sort({ createdAt: -1 }).lean();
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

app.get("/api/host-bookings", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const bookings = await Booking.find({ ownerEmail: req.user!.email }).sort({ createdAt: -1 }).lean();
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/bookings/:id/cancel", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, guestEmail: req.user!.email, status: "Pending" },
      { status: "Cancelled" },
      { new: true },
    );
    if (!booking) {
      res.status(404).json({ message: "Only your pending bookings can be cancelled." });
      return;
    }
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/bookings/:id/status", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const parsed = z.object({ status: z.enum(["Confirmed", "Completed", "Cancelled"]) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Choose a valid booking status." });
      return;
    }
    const booking = await Booking.findOne({ _id: req.params.id, ownerEmail: req.user!.email });
    if (!booking) {
      res.status(404).json({ message: "Booking not found or you are not the studio host." });
      return;
    }
    if (parsed.data.status === "Completed" && booking.endsAt.getTime() > Date.now()) {
      res.status(400).json({ message: "A booking can only be completed after its scheduled end time." });
      return;
    }
    if (parsed.data.status === "Confirmed") {
      const collision = await Booking.exists({
        _id: { $ne: booking._id },
        studioId: booking.studioId,
        status: "Confirmed",
        startsAt: { $lt: booking.endsAt },
        endsAt: { $gt: booking.startsAt },
      });
      if (collision) {
        res.status(409).json({ message: "Another confirmed booking already uses some of those hours." });
        return;
      }
    }
    booking.status = parsed.data.status;
    await booking.save();
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong on our end. Please try again." });
});

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.");
  }
  await mongoose.connect(mongoUri);
  app.listen(port, () => console.log(`StudioSpace API listening on http://localhost:${port}`));
}

start().catch((error: unknown) => {
  console.error("Could not start StudioSpace API:", error);
  process.exitCode = 1;
});
