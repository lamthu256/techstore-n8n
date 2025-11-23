import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { CartItem } from "../types";
import * as cartApi from "../api/cartService";
import { useAuth } from "./AuthContext"; // cần biết user hiện tại

export interface CartContextType {
  cartItems: CartItem[];
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  cartTotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await cartApi.getCart(user.id);
      setCartItems(data || []);
    } catch (err) {
      console.error("Failed to load cart:", err);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  const addItem = async (productId: string, quantity: number) => {
    if (!user) return;
    try {
      await cartApi.addToCart(user.id, productId, quantity);
      await loadCart();
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  };

  const updateItemQuantity = async (productId: string, quantity: number) => {
    if (!user) return;
    try {
      if (quantity <= 0) {
        await removeItem(productId);
        return;
      }
      await cartApi.updateCartItem(user.id, productId, quantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error("Failed to update item quantity:", err);
    }
  };

  const removeItem = async (productId: string) => {
    if (!user) return;
    try {
      await cartApi.removeFromCart(user.id, productId);
      setCartItems((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await Promise.all(
        cartItems.map((item) =>
          cartApi.removeFromCart(user.id, item.product.id)
        )
      );
      setCartItems([]);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        totalItems,
        cartTotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
