const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        name: { type: String, required: true }, // Product name at time of purchase
        image: { type: String }, // Product image at time of purchase
      },
    ],
    // Financial breakdown
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 50 },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    // Customer information
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String },

    // Payment information
    paymentMethod: {
      type: String,
      enum: ["bkash", "cash-on-delivery", "card"],
      default: "cash-on-delivery",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    // Order status tracking
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],

    // Shipping information
    trackingNumber: { type: String },
    carrier: { type: String },
    estimatedDelivery: { type: Date },

    // bKash specific fields
    bkashAccountNumber: String,
    bkashTransactionId: String,
    bkashReferenceId: String,
    bkashPaymentDate: Date,

    // Administrative fields
    orderNumber: { type: String, unique: true }, // Custom order number like ORD-2024-001
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted order date
orderSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for order summary
orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to generate order number
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${new Date().getFullYear()}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

// Pre-save middleware to update status history
orderSchema.pre("save", function (next) {
  if (this.isModified("orderStatus")) {
    this.statusHistory = this.statusHistory || [];
    this.statusHistory.push({
      status: this.orderStatus,
      note: `Status changed to ${this.orderStatus}`,
    });
  }

  // Update timestamps based on status changes
  if (this.isModified("orderStatus")) {
    if (this.orderStatus === "delivered" && !this.deliveredAt) {
      this.deliveredAt = new Date();
    } else if (this.orderStatus === "cancelled" && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }

  if (
    this.isModified("paymentStatus") &&
    this.paymentStatus === "completed" &&
    !this.paidAt
  ) {
    this.paidAt = new Date();
    this.isPaid = true;
  }

  next();
});

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model("Order", orderSchema);
