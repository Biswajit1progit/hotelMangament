 import { useState } from "react";




function ReviewForm({ hotelId,reviews, onReviewAdded }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const user =JSON.parse(sessionStorage.getItem("user"));
  const alreadyReviewed =
   user &&
   reviews?.length > 0 &&
   reviews.some(
    (r) =>
      // AFTER
      String(r.userId?._id || r.userId) === String(user?.id)
   );

  const handleSubmit = async () => {
  try {
  const token = sessionStorage.getItem("token");

    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hotelId,
        rating,
        text,
      }),
    });

    const data = await res.json();
    console.log("Review response:", data);

    setText("");
await onReviewAdded();

  } catch (err) {
    console.error(err);
    alert("Review failed");
  }
};

 

  return (
   /*  <div className="flex gap-2 items-center mb-4">

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write review..."
        className="border p-2 flex-1 rounded"
      />

      <select value={rating} onChange={(e) => setRating(e.target.value)}>
        {[1,2,3,4,5].map(n => (
          <option key={n}>{n}</option>
        ))}
      </select>

      <button
        onClick={handleSubmit} disabled={alreadyReviewed}
        className="bg-blue-600 text-white px-3 py-2 rounded text-xs sm:text-sm md:text-base w-full sm:w-auto whitespace-nowrap"
      >
        {alreadyReviewed ? " Reviewed" : "Add"}
      </button>

    </div> */
    // BEFORE
<div className="flex gap-2 items-center mb-4 w-full overflow-hidden">
  <input
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Write review..."
    className="border p-2 flex-1 rounded"
  />
  <select value={rating} onChange={(e) => setRating(e.target.value)}>
    {[1,2,3,4,5].map(n => (
      <option key={n}>{n}</option>
    ))}
  </select>
  <button
    onClick={handleSubmit} disabled={alreadyReviewed}
   // AFTER
className="bg-blue-600 text-white px-3 py-2 rounded text-xs sm:text-sm w-full sm:w-auto whitespace-nowrap disabled:opacity-60"
  >
    {alreadyReviewed ? "Reviewed" : "Add"}
  </button>
</div>
  );
}

export default ReviewForm;