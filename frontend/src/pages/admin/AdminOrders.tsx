import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useOrder } from "../../contexts/OrderContext";
import { Order } from "../../types";
import AdminOrderDetails from "./AdminOrderDetail";

export default function AdminOrders() {
  const {
    orders,
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    isLoading,
    error,
  } = useOrder();
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (getAllOrders) getAllOrders();
  }, []);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (!updateOrderStatus) return;
    updateOrderStatus(orderId, newStatus);
  };

  const handleViewDetail = async (order: Order) => {
    if (!getOrderDetails) return;
    const detailedOrder = await getOrderDetails(order.id);
    if (detailedOrder) {
      setSelectedOrders([detailedOrder]);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (isLoading) return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-600">
        Có lỗi xảy ra: {error.message || "Không xác định"}
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="text-center py-8 text-gray-600">Chưa có đơn hàng</div>
    );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Quản lý đơn hàng
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Mã đơn
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Ngày
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #{order.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {order.address.fullName}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                  {formatPrice(order.total)}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <option value="pending">{getStatusLabel("pending")}</option>
                    <option value="processing">
                      {getStatusLabel("processing")}
                    </option>
                    <option value="shipped">{getStatusLabel("shipped")}</option>
                    <option value="delivered">
                      {getStatusLabel("delivered")}
                    </option>
                    <option value="cancelled">
                      {getStatusLabel("cancelled")}
                    </option>
                  </select>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleViewDetail(order)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Modal hiển thị chi tiết */}
          {selectedOrders.length > 0 && (
            <AdminOrderDetails
              orders={selectedOrders}
              onClose={() => setSelectedOrders([])}
            />
          )}
        </table>
      </div>
    </div>
  );
}
