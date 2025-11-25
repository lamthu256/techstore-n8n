import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";
import { ProductProvider } from "./contexts/ProductContext";
import { ReviewProvider } from "./contexts/ReviewContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { DiscountProvider } from "./contexts/DiscountContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminProductForm from "./pages/admin/AdminProductForm";
import { Product } from "./types";

type Page =
  | "home"
  | "product-detail"
  | "cart"
  | "checkout"
  | "login"
  | "register"
  | "profile"
  | "orders"
  | "admin-dashboard"
  | "admin-orders"
  | "admin-products"
  | "admin-customers"
  | "admin-product-form";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const handleNavigate = (page: Page) => {
    if (
      (page.startsWith("admin-") ||
        page === "profile" ||
        page === "orders" ||
        page === "checkout") &&
      !user
    ) {
      setCurrentPage("login");
      return;
    }
    if (page.startsWith("admin-") && !isAdmin) {
      setCurrentPage("home");
      return;
    }
    setCurrentPage(page);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage("product-detail");
  };

  const handleLoginSuccess = () => {
    setCurrentPage("home");
  };

  const handleCheckoutComplete = () => {
    setCurrentPage("orders");
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage("admin-product-form");
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setCurrentPage("admin-product-form");
  };

  if (currentPage === "login") {
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        onNavigateRegister={() => setCurrentPage("register")}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <RegisterPage
        onSuccess={handleLoginSuccess}
        onNavigateLogin={() => setCurrentPage("login")}
      />
    );
  }

  const adminNavbar = (
    <div className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button
          onClick={() => setCurrentPage("home")}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Quay về cửa hàng
        </button>
      </div>
      <div className="bg-gray-700 px-4 sm:px-6 lg:px-8 py-3 flex gap-6">
        <button
          onClick={() => handleNavigate("admin-dashboard")}
          className={`px-4 py-2 rounded transition-colors ${
            currentPage === "admin-dashboard"
              ? "bg-blue-600"
              : "hover:bg-gray-600"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => handleNavigate("admin-orders")}
          className={`px-4 py-2 rounded transition-colors ${
            currentPage === "admin-orders" ? "bg-blue-600" : "hover:bg-gray-600"
          }`}
        >
          Đơn hàng
        </button>
        <button
          onClick={() => handleNavigate("admin-products")}
          className={`px-4 py-2 rounded transition-colors ${
            currentPage === "admin-products" ||
            currentPage === "admin-product-form"
              ? "bg-blue-600"
              : "hover:bg-gray-600"
          }`}
        >
          Sản phẩm
        </button>
        <button
          onClick={() => handleNavigate("admin-customers")}
          className={`px-4 py-2 rounded transition-colors ${
            currentPage === "admin-customers"
              ? "bg-blue-600"
              : "hover:bg-gray-600"
          }`}
        >
          Khách hàng
        </button>
      </div>
    </div>
  );

  if (currentPage.startsWith("admin-")) {
    return (
      <DashboardProvider>
        <div className="min-h-screen bg-gray-50">
          {adminNavbar}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {currentPage === "admin-dashboard" && (
              <AdminDashboard
                onNavigate={(page) => handleNavigate(page as Page)}
              />
            )}
            {currentPage === "admin-orders" && <AdminOrders />}
            {currentPage === "admin-products" && (
              <AdminProducts
                onEditProduct={handleEditProduct}
                onAddProduct={handleAddProduct}
              />
            )}
            {currentPage === "admin-product-form" && (
              <AdminProductForm
                product={selectedProduct || undefined}
                onBack={() => setCurrentPage("admin-products")}
              />
            )}
            {currentPage === "admin-customers" && (
              <CustomerProvider>
                <AdminCustomers onViewDetail={() => {}} />
              </CustomerProvider>
            )}
          </div>
        </div>
      </DashboardProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onNavigate={(page) => handleNavigate(page as Page)}
        currentPage={currentPage}
        isAdmin={user?.role === "admin"}
      />

      {currentPage === "home" && <HomePage onViewDetail={handleViewProduct} />}

      {currentPage === "product-detail" && selectedProduct && (
        <ReviewProvider productId={selectedProduct.id}>
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => setCurrentPage("home")}
          />
        </ReviewProvider>
      )}

      {currentPage === "cart" && (
        <CartPage
          onCheckout={() => handleNavigate("checkout")}
          onContinueShopping={() => setCurrentPage("home")}
        />
      )}

      {currentPage === "checkout" && (
        <CheckoutPage onComplete={handleCheckoutComplete} />
      )}

      {currentPage === "profile" && <ProfilePage />}

      {currentPage === "orders" && (
        <OrdersPage onNavigateHome={() => setCurrentPage("home")} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <DiscountProvider>
          <OrderProvider>
            <ProductProvider>
              <AppContent />
            </ProductProvider>
          </OrderProvider>
        </DiscountProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
