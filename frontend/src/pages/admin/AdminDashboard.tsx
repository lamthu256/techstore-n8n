import { BarChart3, Package, Users, ShoppingCart, XCircle } from "lucide-react";
import { useDashboard } from "../../contexts/DashboardContext";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  // THAY THẾ: Xóa useState, useEffect, fetchStats
  const { stats, isLoading, error } = useDashboard();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const StatCard = ({ icon: Icon, label, value, onClick }: any) => (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          {/* Đảm bảo giá trị hiển thị là số hoặc chuỗi */}
          <p className="text-3xl font-bold mt-2">
            {label === "Tổng doanh thu"
              ? formatPrice(stats?.totalRevenue || 0)
              : value}
          </p>
        </div>
        <Icon size={40} className="text-blue-600 opacity-20" />
      </div>
    </div>
  );

  // --- XỬ LÝ TRẠNG THÁI LOADING VÀ ERROR ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <div className="text-gray-600">Đang tải dữ liệu tổng quan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <XCircle size={32} className="mx-auto text-red-500 mb-2" />
        <h2 className="text-xl font-bold text-red-800 mb-2">
          Lỗi tải Dashboard
        </h2>
        <p className="text-red-600">
          {(error as Error).message || "Không thể tải dữ liệu thống kê."}
        </p>
      </div>
    );
  }
  // --- END XỬ LÝ TRẠNG THÁI ---

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Tổng quan về hoạt động cửa hàng</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={ShoppingCart}
          label="Tổng đơn hàng"
          value={stats?.totalOrders}
          onClick={() => onNavigate("admin-orders")}
        />
        <StatCard
          icon={Package}
          label="Tổng sản phẩm"
          value={stats?.totalProducts}
          onClick={() => onNavigate("admin-products")}
        />
        <StatCard
          icon={Users}
          label="Tổng khách hàng"
          value={stats?.totalCustomers}
          onClick={() => onNavigate("admin-customers")}
        />
        <StatCard
          icon={BarChart3}
          label="Tổng doanh thu"
          value={formatPrice(stats?.totalRevenue || 0)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">Quản lý nhanh</h2>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate("admin-products")}
              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-blue-600"
            >
              Quản lý sản phẩm
            </button>
            <button
              onClick={() => onNavigate("admin-orders")}
              className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors font-medium text-green-600"
            >
              Quản lý đơn hàng
            </button>
            <button
              onClick={() => onNavigate("admin-customers")}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors font-medium text-purple-600"
            >
              Quản lý khách hàng
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">Thông tin hệ thống</h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Cập nhật cuối:</span> Vừa xong
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Trạng thái:</span>{" "}
              <span className="text-green-600">Hoạt động</span>
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Phiên bản:</span> 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
