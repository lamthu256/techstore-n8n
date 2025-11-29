import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useOrder } from "../contexts/OrderContext";
import { useDiscount } from "../contexts/DiscountContext";
import { Address } from "../types";
import { CheckCircle } from "lucide-react";
import { toggleDiscountCode } from "../api/discountService";
import { notifyInviteUsed } from "../api/refShareService";

type CheckoutPageProps = {
  onComplete: () => void;
};

export default function CheckoutPage({ onComplete }: CheckoutPageProps) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrder();
  const { appliedDiscount, setAppliedDiscount } = useDiscount();
  const [showSuccess, setShowSuccess] = useState(false);
  const [address, setAddress] = useState<Address>({
    fullName: user?.name || "",
    phone: "",
    street: "",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const discountAmount = appliedDiscount
        ? (cartTotal * appliedDiscount.discount) / 100
        : 0;

      const orderPayload = {
        items: cartItems.map((item) => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
          },
          quantity: item.quantity,
        })),
        total: cartTotal - discountAmount,
        address,
      };

      const createdOrderId = await createOrder(orderPayload);

      if (appliedDiscount && user?.email) {
        try {
          await notifyInviteUsed({
            customerEmail: user.email,
            discountCode: appliedDiscount.code,
            orderId: createdOrderId ?? undefined,
            total: cartTotal - discountAmount,
          });
        } catch (refErr) {
          console.error("Notify referral failed:", refErr);
        }
      }

      // Thay đổi trạng thái mã giảm giá nếu có
      if (appliedDiscount) {
        try {
          await toggleDiscountCode(appliedDiscount.code, false);
          setAppliedDiscount(null);
        } catch (discountError) {
          console.error("Failed to toggle discount code:", discountError);
        }
      }

      clearCart();
      setShowSuccess(true);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Đặt hàng thất bại. Vui lòng thử lại.");
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Đặt hàng thành công!
            </h2>
            <p className="text-gray-600 mb-8">
              Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong
              thời gian sớm nhất.
            </p>
            <button
              onClick={onComplete}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Xem đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Thông tin giao hàng</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) =>
                      setAddress({ ...address, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg mt-6"
                >
                  Đặt hàng
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Đơn hàng của bạn</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-gray-600 text-sm">x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Giảm giá ({appliedDiscount.discount}%)</span>
                    <span>
                      -
                      {formatPrice(
                        (cartTotal * appliedDiscount.discount) / 100
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">
                    {formatPrice(
                      cartTotal -
                        (appliedDiscount
                          ? (cartTotal * appliedDiscount.discount) / 100
                          : 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
