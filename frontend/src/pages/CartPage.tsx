import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useDiscount } from "../contexts/DiscountContext";
import { validateDiscountCode } from "../api/discountService";

export default function CartPage({
  onCheckout,
  onContinueShopping,
}: {
  onCheckout: () => void;
  onContinueShopping: () => void;
}) {
  const { cartItems, cartTotal, updateItemQuantity, removeItem, totalItems } =
    useCart();
  const { appliedDiscount, setAppliedDiscount } = useDiscount();
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsValidating(true);
    setDiscountError("");

    try {
      const result = await validateDiscountCode(discountCode);
      setAppliedDiscount({
        code: result.code,
        discount: result.discount,
      });
    } catch (error: any) {
      setDiscountError("Mã giảm giá không hợp lệ");
    } finally {
      setIsValidating(false);
    }
  };

  const discountAmount = appliedDiscount
    ? (cartTotal * appliedDiscount.discount) / 100
    : 0;
  const finalTotal = cartTotal - discountAmount;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-8">
              Hãy thêm sản phẩm vào giỏ hàng của bạn
            </p>
            <button
              onClick={onContinueShopping}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Giỏ hàng ({totalItems} sản phẩm)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-lg shadow-md p-6 flex gap-4"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {item.product.name}
                  </h3>
                  <p className="text-blue-600 font-bold mb-4">
                    {formatPrice(item.product.price)}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateItemQuantity(item.product.id, item.quantity - 1)
                      }
                      className="p-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-semibold w-12 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateItemQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="p-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <p className="font-bold text-lg">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>

              {/* Mã giảm giá */}
              <div className="mb-6 pb-6 border-b">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    disabled={!!appliedDiscount}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={
                      !discountCode.trim() || !!appliedDiscount || isValidating
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {isValidating
                      ? "..."
                      : appliedDiscount
                      ? "Đã áp dụng"
                      : "Áp dụng"}
                  </button>
                </div>
                {discountError && (
                  <p className="mt-2 text-sm text-red-600">{discountError}</p>
                )}
                {appliedDiscount && (
                  <button
                    onClick={() => {
                      setAppliedDiscount(null);
                      setDiscountCode("");
                      setDiscountError("");
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Hủy mã giảm giá
                  </button>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Giảm giá ({appliedDiscount.discount}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg mb-3"
              >
                Thanh toán
              </button>

              <button
                onClick={onContinueShopping}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
