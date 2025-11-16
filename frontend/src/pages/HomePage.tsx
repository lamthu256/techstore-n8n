import { useState } from "react";
import { Search } from "lucide-react";
import { useProducts } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";

interface HomePageProps {
  onViewDetail: (product: Product) => void;
}

export default function HomePage({ onViewDetail }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addToCart } = useCart();
  const { products, loading, error } = useProducts();

  const categories = [
    { id: "all", name: "Tất cả" },
    { id: "laptop", name: "Laptop" },
    { id: "phone", name: "Điện thoại" },
    { id: "tablet", name: "Máy tính bảng" },
    { id: "audio", name: "Âm thanh" },
    { id: "wearable", name: "Đồng hồ thông minh" },
    { id: "monitor", name: "Màn hình" },
    { id: "accessory", name: "Phụ kiện" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Chào mừng đến TechStore
          </h1>
          <p className="text-xl text-center mb-8 text-blue-100">
            Khám phá những sản phẩm công nghệ tốt nhất
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-16">
            Đang tải sản phẩm...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 py-16">{error}</p>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredProducts.length} sản phẩm
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetail={onViewDetail}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-gray-500">
                  Không tìm thấy sản phẩm nào
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
