
import { useState } from "react";
import api from "../services/apiClient"; // ⚠️ ADJUST THIS PATH to wherever your axios instance (api.js) actually lives

function ReviewList({ reviews, onReviewAdded }) {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  // ✅ FIXED — was reading token from sessionStorage, but the access token
  // lives in-memory only (see api.js). sessionStorage.getItem("token") was
  // always null, so this sent "Authorization: Bearer null" and 401'd.
  // Using the shared `api` instance attaches the real in-memory token via
  // its request interceptor, and gets silent-refresh-on-401 for free.
  const handleEditSave = async (reviewId) => {
    try {
      await api.put(`/api/reviews/${reviewId}`, {
        text: editText,
        rating: editRating,
      });
      setEditingId(null);
      await onReviewAdded(); // refresh reviews
    } catch (err) {
      console.error("Failed to save review:", err);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      {reviews.map((r) => {
        const isMyReview =
          user && String(r.userId?._id || r.userId) === String(user?.id);
        return (
          <div
            key={r._id}
            className={`border p-2 rounded ${
              isMyReview ? "border-blue-500 bg-blue-50" : ""
            }`}
          >
            {/* Name + badge + edit button */}
            <div className="flex justify-between items-center">
              <p>
                <b>{r.userId?.name}</b>
                {isMyReview && (
                  <span className="ml-2 text-xs text-blue-600 font-semibold">
                    (Your Review)
                  </span>
                )}
              </p>

              {/* Edit button — only for own review */}
              {isMyReview && editingId !== r._id && (
                <button
                  onClick={() => {
                    setEditingId(r._id);
                    setEditText(r.text);
                    setEditRating(r.rating);
                  }}
                  className="text-xs text-blue-500 hover:underline"
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            {/* Edit mode */}
            {editingId === r._id ? (
              // mobile stacks, sm and above stays single row
              <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                {/* input + rating — always together */}
                <div className="flex gap-2 min-w-0 flex-1">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="border p-1 rounded text-sm min-w-0 flex-1"
                  />
                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    className="border rounded text-sm p-1 w-14"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </div>

                {/* buttons — below on mobile, inline on sm+ */}
                <div className="flex gap-2 sm:flex-nowrap">
                  <button
                    onClick={() => handleEditSave(r._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm flex-1 sm:flex-none whitespace-nowrap"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-300 text-black px-3 py-1 rounded text-sm flex-1 sm:flex-none whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>⭐ {r.rating}</p>
                <p>{typeof r.text === "string" ? r.text : JSON.stringify(r.text)}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ReviewList;