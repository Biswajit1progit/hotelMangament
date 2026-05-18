 const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();
exports.verifySignature = (
  order_id,
  payment_id,
  signature,
  secret
) => {
  const body = order_id + "|" + payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expected === signature;
};