import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, Product } from "../types";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_URL = "https://backend-n8n-94uk.onrender.com";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Lấy token từ localStorage (hoặc nơi bạn lưu)
  const token = localStorage.getItem("token");

  // Load cart từ backend
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch(`${API_URL}/cart`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
      }
    }
    if (token) fetchCart();
  }, [token]);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      const updatedItem = await res.json();

      setItems((currentItems) => {
        const exists = currentItems.find(
          (item) => item.product.id === product.id
        );
        if (exists) {
          return currentItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: updatedItem.quantity }
              : item
          );
        }
        return [
          ...currentItems,
          { id: updatedItem.id, product, quantity: updatedItem.quantity },
        ];
      });
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const item = items.find((i) => i.product.id === productId);
      if (!item) return;
      const res = await fetch(`${API_URL}/cart/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove item");
      setItems((currentItems) =>
        currentItems.filter((i) => i.product.id !== productId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const item = items.find((i) => i.product.id === productId);
      if (!item) return;
      const res = await fetch(`${API_URL}/cart/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      const updatedItem = await res.json();
      setItems((currentItems) =>
        currentItems.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: updatedItem.quantity }
            : i
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to clear cart");
      setItems([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
