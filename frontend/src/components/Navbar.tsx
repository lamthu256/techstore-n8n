import { ShoppingCart, User, LogOut, Package, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  isAdmin?: boolean;
}

export default function Navbar({
  onNavigate,
  currentPage,
  isAdmin,
}: NavbarProps) {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate("home")}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              TechStore
            </button>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate("profile")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === "profile"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User size={20} />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                <>
                  <button
                    onClick={() => onNavigate("orders")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === "orders"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Package size={20} />
                    <span className="hidden sm:inline">Đơn hàng</span>
                  </button>
                  <button
                    onClick={() => onNavigate("cart")}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <ShoppingCart size={20} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </>

                {isAdmin && (
                  <button
                    onClick={() => onNavigate("admin-dashboard")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage.startsWith("admin-")
                        ? "bg-yellow-50 text-yellow-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Settings size={20} />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}

                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("login")}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
