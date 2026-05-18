/*  function ReviewList({ reviews }) {
  return (
    <div className="mt-4 space-y-2">
      {reviews.map((r) => (
        <div key={r._id} className="border p-2 rounded">
          <p><b>{r.userId?.name}</b></p> 

          <p>⭐ {r.rating}</p>
          <p>{typeof r.text === "string" ? r.text : JSON.stringify(r.text)}</p>
        </div>
      ))}
    </div>
  );
}

export default ReviewList; */

// AFTER — highlight logged-in user's review, zero other changes
/* function ReviewList({ reviews }) {
  const user = JSON.parse(sessionStorage.getItem("user")); // ✅ get logged-in user

  return (
    <div className="mt-4 space-y-2">
      {reviews.map((r) => {
        const isMyReview =
          user && (r.userId?._id || r.userId) === user._id; // ✅ check ownership

        return (
          <div
            key={r._id}
            className={`border p-2 rounded ${
              isMyReview ? "border-blue-500 bg-blue-50" : "" // ✅ highlight
            }`}
          >
            <p>
              <b>{r.userId?.name}</b>
              {isMyReview && ( // ✅ badge for own review
                <span className="ml-2 text-xs text-blue-600 font-semibold">
                  (Your Review)
                </span>
              )}
            </p>
            <p>⭐ {r.rating}</p>
            <p>{typeof r.text === "string" ? r.text : JSON.stringify(r.text)}</p>
          </div>
        );
      })}
    </div>
  );
}

export default ReviewList; */


import { useState } from "react";

function ReviewList({ reviews, onReviewAdded }) {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  reviews.forEach(r => {
   
  });
  const handleEditSave = async (reviewId) => {
    const token = sessionStorage.getItem("token");

    await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: editText, rating: editRating }),
    });

    setEditingId(null);
    await onReviewAdded(); // ✅ refresh reviews
  };

  return (
    <div className="mt-4 space-y-2">
      {reviews.map((r) => {
        // AFTER — stringify both sides to avoid ObjectId vs string mismatch
        // AFTER — use user.id instead of user._id
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

              {/* ✅ Edit button — only for own review */}
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

            {/* ✅ Edit mode */}
            {editingId === r._id ? (
              // AFTER
             /*   <div className="flex flex-wrap gap-2 items-center mt-2 w-full">
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
  <div className="flex gap-2">
    <button
      onClick={() => handleEditSave(r._id)}
      className="bg-green-600 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
    >
      Save
    </button>
    <button
      onClick={() => setEditingId(null)}
      className="bg-gray-300 text-black px-3 py-1 rounded text-sm whitespace-nowrap"
    >
      Cancel
    </button>
  </div>
               </div> */
               // AFTER — mobile stacks, sm and above stays single row
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