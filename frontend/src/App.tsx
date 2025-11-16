import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProductProvider } from "./contexts/ProductContext";
import { OrderProvider } from "./contexts/OrderContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import { Product } from "./types";

export type Page =
  | "home"
  | "product-detail"
  | "cart"
  | "checkout"
  | "login"
  | "register"
  | "profile"
  | "orders";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuth();

  const handleNavigate = (page: Page) => {
    if (
      (page === "profile" || page === "orders" || page === "checkout") &&
      !user
    ) {
      setCurrentPage("login");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {currentPage === "home" && <HomePage onViewDetail={handleViewProduct} />}

      {currentPage === "product-detail" && selectedProduct && (
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => setCurrentPage("home")}
        />
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
        <ProductProvider>
          <OrderProvider>
            <AppContent />
          </OrderProvider>
        </ProductProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
