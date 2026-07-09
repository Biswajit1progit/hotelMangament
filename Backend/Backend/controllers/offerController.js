const Offer = require("../models/Offer");
const OfferRedemption = require("../models/OfferRedemption");
const Hotel = require("../models/hotel");

// ---------- CREATE ----------
// Admin: can create platform or hotel-scoped offers for any hotel
// Owner: can create only hotel-scoped offers for hotels they own
exports.createOffer = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      scope,
      hotel,
      discountType,
      value,
      maxDiscountAmount,
      minBookingAmount,
      applicableMethods,
      validFrom,
      validTill,
      usageLimit,
      perUserLimit,
    } = req.body;

    const isAdmin = req.user.role === "admin";

    if (!isAdmin) {
      // Owners can only create hotel-scoped offers
      if (scope !== "hotel") {
        return res.status(403).json({ message: "Owners can only create hotel-specific offers" });
      }
      if (!hotel) {
        return res.status(400).json({ message: "hotel is required" });
      }
      const hotelDoc = await Hotel.findById(hotel);
      if (!hotelDoc) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      // FIXED: Hotel model uses `ownerId`, not `owner`
      if (hotelDoc.ownerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You do not own this hotel" });
      }
    }

    const offer = await Offer.create({
      code: code || undefined,
      title,
      description,
      scope,
      hotel: scope === "hotel" ? hotel : null,
      createdBy: req.user._id,
      discountType,
      value,
      maxDiscountAmount: maxDiscountAmount ?? null,
      minBookingAmount: minBookingAmount ?? 0,
      applicableMethods: applicableMethods && applicableMethods.length ? applicableMethods : ["any"],
      validFrom,
      validTill,
      usageLimit: usageLimit ?? null,
      perUserLimit: perUserLimit ?? 1,
    });

    return res.status(201).json({ message: "Offer created", offer });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Offer code already exists" });
    }
    console.error("createOffer error:", err);
    return res.status(500).json({ message: err.message || "Failed to create offer" });
  }
};

// ---------- UPDATE ----------
exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin) {
      if (offer.scope !== "hotel") {
        return res.status(403).json({ message: "Not authorized" });
      }
      const hotelDoc = await Hotel.findById(offer.hotel);
      // FIXED: ownerId instead of owner
      if (!hotelDoc || hotelDoc.ownerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You do not own this hotel" });
      }
    }

    const allowedFields = [
      "title",
      "description",
      "discountType",
      "value",
      "maxDiscountAmount",
      "minBookingAmount",
      "applicableMethods",
      "validFrom",
      "validTill",
      "usageLimit",
      "perUserLimit",
      "isActive",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) offer[field] = req.body[field];
    });

    await offer.save();
    return res.json({ message: "Offer updated", offer });
  } catch (err) {
    console.error("updateOffer error:", err);
    return res.status(500).json({ message: err.message || "Failed to update offer" });
  }
};

// ---------- DELETE ----------
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin) {
      const hotelDoc = await Hotel.findById(offer.hotel);
      // FIXED: ownerId instead of owner
      if (!hotelDoc || hotelDoc.ownerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You do not own this hotel" });
      }
    }

    await Offer.findByIdAndDelete(id);
    return res.json({ message: "Offer deleted" });
  } catch (err) {
    console.error("deleteOffer error:", err);
    return res.status(500).json({ message: "Failed to delete offer" });
  }
};

// ---------- GET: Admin - all offers ----------
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().populate("hotel", "name").sort({ createdAt: -1 });
    return res.json({ offers });
  } catch (err) {
    console.error("getAllOffers error:", err);
    return res.status(500).json({ message: "Failed to fetch offers" });
  }
};

// ---------- GET: Owner - offers for hotels they own ----------
exports.getOwnerOffers = async (req, res) => {
  try {
    // FIXED: ownerId instead of owner
    const hotels = await Hotel.find({ ownerId: req.user._id }).select("_id");
    const hotelIds = hotels.map((h) => h._id);

    const offers = await Offer.find({ hotel: { $in: hotelIds } })
      .populate("hotel", "name")
      .sort({ createdAt: -1 });

    return res.json({ offers });
  } catch (err) {
    console.error("getOwnerOffers error:", err);
    return res.status(500).json({ message: "Failed to fetch offers" });
  }
};

// ---------- GET: Public - active offers for a specific hotel (platform + hotel-scoped) ----------
exports.getOffersForHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const now = new Date();

    const offers = await Offer.find({
      isActive: true,
      validFrom: { $lte: now },
      validTill: { $gte: now },
      $or: [{ scope: "platform" }, { scope: "hotel", hotel: hotelId }],
    }).select("-createdBy");

    return res.json({ offers });
  } catch (err) {
    console.error("getOffersForHotel error:", err);
    return res.status(500).json({ message: "Failed to fetch offers" });
  }
};

// ---------- VALIDATE (at checkout, before Razorpay order is created) ----------
// paymentMethod is optional here — pass it in if your checkout UI asks the user
// to pick a payment method before applying the coupon. If not known yet, the
// method check is skipped here and enforced for real in confirmOfferForPayment.
exports.validateOffer = async (req, res) => {
  try {
    const { code, hotelId, bookingAmount, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!code || !hotelId || bookingAmount == null) {
      return res.status(400).json({ message: "code, hotelId and bookingAmount are required" });
    }

    const now = new Date();
    const offer = await Offer.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: now },
      validTill: { $gte: now },
      $or: [{ scope: "platform" }, { scope: "hotel", hotel: hotelId }],
    });

    if (!offer) {
      return res.status(404).json({ message: "Invalid or expired offer code" });
    }

    if (bookingAmount < offer.minBookingAmount) {
      return res.status(400).json({
        message: `Minimum booking amount for this offer is ₹${offer.minBookingAmount}`,
      });
    }

    if (offer.usageLimit !== null && offer.usedCount >= offer.usageLimit) {
      return res.status(400).json({ message: "This offer has reached its usage limit" });
    }

    const userRedemptions = await OfferRedemption.countDocuments({
      offer: offer._id,
      user: userId,
    });
    if (userRedemptions >= offer.perUserLimit) {
      return res.status(400).json({ message: "You have already used this offer" });
    }

    if (
      paymentMethod &&
      !offer.applicableMethods.includes("any") &&
      !offer.applicableMethods.includes(paymentMethod)
    ) {
      return res.status(400).json({
        message: `This offer is only valid for: ${offer.applicableMethods.join(", ")}`,
      });
    }

    const discount = calculateDiscount(offer, bookingAmount);
    const finalAmount = Math.round((bookingAmount - discount) * 100) / 100;

    return res.json({
      valid: true,
      offerId: offer._id,
      discount,
      finalAmount,
      applicableMethods: offer.applicableMethods,
    });
  } catch (err) {
    console.error("validateOffer error:", err);
    return res.status(500).json({ message: "Failed to validate offer" });
  }
};

// Shared discount math — used by validateOffer and confirmOfferForPayment
function calculateDiscount(offer, bookingAmount) {
  let discount = 0;
  if (offer.discountType === "flat") {
    discount = offer.value;
  } else {
    discount = (bookingAmount * offer.value) / 100;
    if (offer.maxDiscountAmount != null) {
      discount = Math.min(discount, offer.maxDiscountAmount);
    }
  }
  return Math.min(discount, bookingAmount);
}

// Call this from paymentController.verifyPayment, AFTER Razorpay confirms payment
// and you know the real `method` used. This is the actual enforcement point —
// validateOffer above is only a pre-payment UX check.
exports.confirmOfferForPayment = async ({ offerId, bookingAmount, paymentMethod }) => {
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new Error("Offer not found");
  }

  if (!offer.applicableMethods.includes("any") && !offer.applicableMethods.includes(paymentMethod)) {
    throw new Error(
      `Offer '${offer.code || offer.title}' is not valid for payment method '${paymentMethod}'`
    );
  }

  const discount = calculateDiscount(offer, bookingAmount);
  return { offer, discount };
};

// Call this from paymentController.verifyPayment, right after confirmOfferForPayment
// succeeds. Not exposed as a public route — must only run after a real payment.
exports.redeemOfferInternal = async ({ offerId, userId, bookingId, discountApplied }) => {
  const updatedOffer = await Offer.findOneAndUpdate(
    {
      _id: offerId,
      $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );

  if (!updatedOffer) {
    throw new Error("Offer usage limit reached");
  }

  await OfferRedemption.create({
    offer: offerId,
    user: userId,
    booking: bookingId,
    discountApplied,
  });

  return updatedOffer;
};