import { ShoppingCart, Star } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetail,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const finalPrice =
    product.final_price !== undefined ? product.final_price : product.price;

  const hasFlashSale =
    product.final_price !== undefined && product.final_price < product.price;

  const flashPercent = product.flash_discount_percent ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div
        className="relative pb-[75%] overflow-hidden bg-gray-100 cursor-pointer"
        onClick={() => onViewDetail(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Chỉ còn {product.stock}
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Hết hàng
          </span>
        )}

        {hasFlashSale && (
          <span className="absolute bottom-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
            Flash Sale {flashPercent > 0 ? `-${flashPercent}%` : ""}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3
          className="font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onViewDetail(product)}
        >
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-1 mb-3">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-sm">{product.rating}</span>
          <span className="text-gray-500 text-sm">
            ({product.reviewsCount} đánh giá)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(finalPrice)}
            </span>

            {hasFlashSale && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={18} />
            <span className="text-sm font-medium">Thêm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
