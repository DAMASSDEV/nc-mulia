import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { cartApi, transactionApi } from '../lib/api';
import type { User } from '../lib/api';
import type { CartProduct } from '../types/index.js';

export interface CartProductInfo {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  product: CartProductInfo;
  qty: number;
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalUnitPrice: number;
  subtotal: number;
}

interface CartContextValue {
  cart: CartItem[];
  cartCount: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (product: CartProductInfo, qty?: number) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<{ success: boolean; message: string; transactionId?: string }>;
  isInCart: (productId: string) => boolean;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const LOCAL_STORAGE_KEY = 'nc_mulia_guest_cart';

function buildCartItem(productId: string, productName: string, basePrice: number, qty: number): CartItem {
  const discountPercentage = 0;
  const discountAmount = 0;
  const finalUnitPrice = basePrice;
  const subtotal = finalUnitPrice * qty;
  return {
    product: { id: productId, name: productName, price: finalUnitPrice },
    qty,
    basePrice,
    discountPercentage,
    discountAmount,
    finalUnitPrice,
    subtotal,
  };
}

function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children, user }: { children: ReactNode; user: User | null }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  // Load initial cart: guest cart from localStorage, or fetch from API if logged in
  useEffect(() => {
    if (user) {
      // Logged in — fetch from backend
      cartApi.get().then(res => {
        if (res.success && res.data) {
          setCart(res.data.map((item: CartProduct) => ({
            product: { id: item.productId, name: item.productName, price: item.finalUnitPrice },
            qty: item.quantity,
            basePrice: item.basePrice,
            discountPercentage: item.discountPercentage,
            discountAmount: item.discountAmount,
            finalUnitPrice: item.finalUnitPrice,
            subtotal: item.subtotal,
          })));
        }
      }).catch(() => {}).finally(() => setSynced(true));
    } else {
      // Guest — load from localStorage
      setCart(loadGuestCart());
      setSynced(true);
    }
  }, [user]);

  const addToCart = useCallback(async (product: CartProductInfo, qty = 1) => {
    setError(null);
    setIsLoading(true);
    try {
      if (user) {
        // Logged in — sync with backend
        const res = await cartApi.addItem({ productId: product.id, quantity: qty });
        if (res.success && res.data) {
          setCart(res.data.map((item: CartProduct) => ({
            product: { id: item.productId, name: item.productName, price: item.finalUnitPrice },
            qty: item.quantity,
            basePrice: item.basePrice,
            discountPercentage: item.discountPercentage,
            discountAmount: item.discountAmount,
            finalUnitPrice: item.finalUnitPrice,
            subtotal: item.subtotal,
          })));
        }
      } else {
        // Guest — update localStorage
        setCart(prev => {
          const existing = prev.find(i => i.product.id === product.id);
          let next: CartItem[];
          if (existing) {
            next = prev.map(i =>
              i.product.id === product.id
                ? { ...i, qty: i.qty + qty, subtotal: i.finalUnitPrice * (i.qty + qty) }
                : i
            );
          } else {
            next = [...prev, buildCartItem(product.id, product.name, product.price, qty)];
          }
          saveGuestCart(next);
          return next;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menambahkan ke keranjang.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateQty = useCallback(async (productId: string, qty: number) => {
    setError(null);
    if (qty < 1) return;
    setIsLoading(true);
    try {
      if (user) {
        const res = await cartApi.updateItem(productId, qty);
        if (res.success && res.data) {
          setCart(res.data.map((item: CartProduct) => ({
            product: { id: item.productId, name: item.productName, price: item.finalUnitPrice },
            qty: item.quantity,
            basePrice: item.basePrice,
            discountPercentage: item.discountPercentage,
            discountAmount: item.discountAmount,
            finalUnitPrice: item.finalUnitPrice,
            subtotal: item.subtotal,
          })));
        }
      } else {
        setCart(prev => {
          const next = prev.map(i =>
            i.product.id === productId
              ? { ...i, qty, subtotal: i.finalUnitPrice * qty }
              : i
          );
          saveGuestCart(next);
          return next;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memperbarui jumlah.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const removeFromCart = useCallback(async (productId: string) => {
    setError(null);
    setIsLoading(true);
    try {
      if (user) {
        const res = await cartApi.removeItem(productId);
        if (res.success && res.data) {
          setCart(res.data.map((item: CartProduct) => ({
            product: { id: item.productId, name: item.productName, price: item.finalUnitPrice },
            qty: item.quantity,
            basePrice: item.basePrice,
            discountPercentage: item.discountPercentage,
            discountAmount: item.discountAmount,
            finalUnitPrice: item.finalUnitPrice,
            subtotal: item.subtotal,
          })));
        }
      } else {
        setCart(prev => {
          const next = prev.filter(i => i.product.id !== productId);
          saveGuestCart(next);
          return next;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus item.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (user) {
        await cartApi.clear();
      }
      setCart([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengosongkan keranjang.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const checkout = useCallback(async () => {
    if (cart.length === 0) return { success: false, message: 'Keranjang kosong.' };
    if (!user) return { success: false, message: 'checkout_requires_login' };
    setError(null);
    setIsLoading(true);
    try {
      const items = cart.map(i => ({ productId: i.product.id, quantity: i.qty }));
      const res = await transactionApi.create(items);
      if (res.success && res.data) {
        await clearCart();
        return { success: true, message: 'Transaksi berhasil dibuat.', transactionId: res.data.id };
      }
      return { success: false, message: res.message || 'Checkout gagal.' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Checkout gagal.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, [cart, user]);

  const isInCart = useCallback((productId: string) => cart.some(i => i.product.id === productId), [cart]);

  const clearError = useCallback(() => setError(null), []);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, isLoading, error, addToCart, updateQty, removeFromCart, clearCart, checkout, isInCart, clearError, setUser: () => {} }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
