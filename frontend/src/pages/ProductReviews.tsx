import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useReview } from "../contexts/ReviewContext";

interface ProductReviewsProps {
  productId: string;
}

interface ReviewFormData {
  rating: number;
  comment: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const { reviews, isLoading, addReview, deleteReview } = useReview();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: "",
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await addReview(productId, {
        rating: formData.rating,
        comment: formData.comment,
      });
      setFormData({ rating: 5, comment: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa bình luận này?")) return;
    setIsDeleting(true);
    try {
      await deleteReview(reviewId);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Xóa bình luận thất bại. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Tính toán Rating trung bình (sử dụng reviews từ Hook)
  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Đánh giá và bình luận</h2>
        {/* Chỉ hiển thị nút khi đã đăng nhập và chưa mở form */}
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Viết đánh giá
          </button>
        )}
      </div>

      {reviews && reviews.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">
              {avgRating}
            </div>
            <div className="flex gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.floor(parseFloat(avgRating.toString()))
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {reviews.length} đánh giá
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Viết đánh giá của bạn</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <Star
                      size={28}
                      className={
                        star <= formData.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bình luận
              </label>
              <textarea
                required
                rows={4}
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Thông báo đăng nhập */}
      {!user && !showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800">
            <button
              onClick={() => alert("Chuyển hướng đến trang Đăng nhập")}
              className="font-medium hover:underline"
            >
              Đăng nhập
            </button>{" "}
            để viết đánh giá
          </p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-600">
            Đang tải bình luận...
          </div>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {review.userName} •{" "}
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                {user?.id === review.userId && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    disabled={isDeleting}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-600">
            Chưa có bình luận nào
          </div>
        )}
      </div>
    </div>
  );
}
