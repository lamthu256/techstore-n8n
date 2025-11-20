import { Order } from "../../types";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";

interface OrderDetailModalProps {
  orders: Order[];
  onClose: () => void;
}

interface StatusInfo {
  text: string;
  color: string;
  icon?: React.ElementType;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusInfo = (status: string): StatusInfo | null => {
  switch (status) {
    case "pending":
      return {
        text: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      };
    case "processing":
      return {
        text: "Đang xử lý",
        color: "bg-blue-100 text-blue-800",
        icon: Package,
      };
    case "shipped":
      return {
        text: "Đang giao",
        color: "bg-purple-100 text-purple-800",
        icon: Package,
      };
    case "delivered":
      return {
        text: "Đã giao",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    case "cancelled":
      return {
        text: "Đã hủy",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      };
    default:
      return null;
  }
};

export default function OrderDetailModal({
  orders,
  onClose,
}: OrderDetailModalProps) {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start overflow-auto z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl mt-12 p-6 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl font-bold"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4">Chi tiết đơn hàng</h2>

        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo?.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border"
              >
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Mã đơn hàng: #{order.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {statusInfo && (
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${statusInfo.color}`}
                      >
                        {StatusIcon && <StatusIcon size={18} />}
                        {statusInfo.text}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.name}</h3>
                          <p className="text-gray-600 text-sm">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Address & Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Địa chỉ giao hàng:
                        </p>
                        <p className="font-medium">{order.address.fullName}</p>
                        <p className="text-sm text-gray-600">
                          {order.address.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.address.street}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Tổng cộng:</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
