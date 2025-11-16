import { Package, Truck, CheckCircle } from "lucide-react";
import { useOrders } from "../contexts/OrderContext";
import { Order } from "../types";

interface OrdersPageProps {
  onNavigateHome: () => void;
}

export default function OrdersPage({ onNavigateHome }: OrdersPageProps) {
  const { orders } = useOrders();

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

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return {
          text: "Chờ xử lý",
          color: "bg-yellow-100 text-yellow-800",
          icon: Package,
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
          icon: Truck,
        };
      case "delivered":
        return {
          text: "Đã giao",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
        };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Chưa có đơn hàng
            </h2>
            <p className="text-gray-600 mb-8">Bạn chưa có đơn hàng nào</p>
            <button
              onClick={onNavigateHome}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Mua sắm ngay
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
          Đơn hàng của tôi
        </h1>

        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
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
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${statusInfo.color}`}
                    >
                      <StatusIcon size={18} />
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

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
