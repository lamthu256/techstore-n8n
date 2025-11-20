import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { useCustomer } from "../../contexts/CustomerContext";
import { CustomerProfile } from "../../types";

interface AdminCustomersProps {
  onViewDetail: (customer: CustomerProfile) => void;
}

export default function AdminCustomers({ onViewDetail }: AdminCustomersProps) {
  const { customers, getAllProfiles, isLoading } = useCustomer();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllProfiles();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Quản lý khách hàng
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Tên khách hàng
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Số đơn
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Tổng chi tiêu
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Ngày tham gia
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {customer.user.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {customer.user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {customer.totalOrders}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                  {formatPrice(customer.totalSpent)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(customer.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewDetail(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          {searchTerm ? "Không tìm thấy khách hàng" : "Chưa có khách hàng"}
        </div>
      )}
    </div>
  );
}
