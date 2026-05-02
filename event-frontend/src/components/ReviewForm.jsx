import React, { useState } from "react";
import { addReview } from "../services/reviewService";
import "./ReviewForm.css";

export default function ReviewForm({ eventId, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a rating."); return; }
    setError("");
    setSubmitting(true);
    try {
      await addReview({
        eventId,
        rating,      // byte 1-5
        comment,
      });
      setMessage("✅ Review submitted successfully!");
      setRating(0);
      setComment("");
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review. Make sure you have a valid ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-box">
      <h4>Rate this event</h4>

      {/* Stars */}
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= (hover || rating) ? "on" : "off"}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        placeholder="Write your feedback..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />

      {error && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{error}</p>}
      {message && <p style={{ color: "#10b981", fontSize: "13px", marginTop: "4px" }}>{message}</p>}

      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}
