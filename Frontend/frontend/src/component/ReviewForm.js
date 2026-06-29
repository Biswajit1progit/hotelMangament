import { useState } from "react";
import { addReview } from "../services/reviewserve"; // ⚠️ ADJUST THIS PATH to wherever reviewApi.js actually lives

function ReviewForm({ hotelId, reviews, onReviewAdded }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const alreadyReviewed =
    user &&
    reviews?.length > 0 &&
    reviews.some(
      (r) =>
        // AFTER
        String(r.userId?._id || r.userId) === String(user?.id)
    );

  // ✅ FIXED — was reading token from sessionStorage via raw fetch, but the
  // access token lives in-memory only (see apiClient.js). That meant this
  // always sent "Authorization: Bearer null" and 401'd.
  // Using addReview() from reviewApi.js routes through the shared `api`
  // instance, which attaches the real in-memory token automatically and
  // gets silent-refresh-on-401 for free.
  const handleSubmit = async () => {
    try {
      await addReview({ hotelId, rating, text });

      setText("");
      await onReviewAdded();
    } catch (err) {
      console.error(err);
      alert("Review failed");
    }
  };

  return (
    <div className="flex gap-2 items-center mb-4 w-full overflow-hidden">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write review..."
        className="border p-2 flex-1 rounded"
      />
      <select value={rating} onChange={(e) => setRating(e.target.value)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        disabled={alreadyReviewed}
        className="bg-blue-600 text-white px-3 py-2 rounded text-xs sm:text-sm w-full sm:w-auto whitespace-nowrap disabled:opacity-60"
      >
        {alreadyReviewed ? "Reviewed" : "Add"}
      </button>
    </div>
  );
}

export default ReviewForm;