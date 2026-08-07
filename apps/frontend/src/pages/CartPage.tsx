import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../lib/formatters';
import { getProductImage } from '../lib/productImages';

interface CartPageProps {
  openLogin: () => void;
}

export default function CartPage({ openLogin }: CartPageProps) {
  const { cart, updateQty, removeFromCart, clearCart, checkout, isLoading, error, clearError } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discountAmount * item.qty, 0);

  const handleCheckout = async () => {
    clearError();
    setIsCheckingOut(true);
    const result = await checkout();
    setIsCheckingOut(false);
    if (result.message === 'checkout_requires_login') {
      openLogin();
      return;
    }
    if (result.success && result.transactionId) {
      const tx = {
        id: result.transactionId,
        finalTotal: total,
        items: cart.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.qty,
          basePrice: i.basePrice,
          discountPercentage: i.discountPercentage,
          discountAmount: i.discountAmount,
          finalUnitPrice: i.finalUnitPrice,
          subtotal: i.subtotal
        })),
        normalTotal: total + totalDiscount,
        totalDiscount,
        membershipStatusSnapshot: 'regular' as const,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('pendingTransaction', JSON.stringify(tx));
      navigate('/pembayaran');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-5xl font-semibold tracking-tighter">Keranjang Belanja</h2>
        {cart.length > 0 && (
          <button onClick={clearCart} className="text-sm text-slate-400 hover:text-red-500 transition">
            Kosongkan keranjang
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-3xl text-slate-400">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="mb-6 text-lg">Keranjang kosong</p>
          <Link to="/produk-herbalife" className="inline-flex items-center justify-center px-8 py-3 bg-emerald-700 text-white rounded-2xl font-medium hover:bg-emerald-800 transition-all">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <>
          {error && error !== 'checkout_requires_login' && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
              <button onClick={clearError} className="ml-2 underline">Tutup</button>
            </div>
          )}

          <div className="bg-white border rounded-3xl p-9 mb-8">
            {cart.map((item) => {
              const imgSrc = (item.product.imageUrl && (item.product.imageUrl.startsWith('http') || item.product.imageUrl.startsWith('/')))
                ? item.product.imageUrl
                : getProductImage(item.product.name);
              return (
                <div key={item.product.id} className="flex justify-between items-center py-4 border-b last:border-none">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-50/80 border border-emerald-100/60 rounded-2xl p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={imgSrc}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/menu/formula-1-vanilla.png';
                        }}
                      />
                    </div>
                    <div>
                    <div className="font-medium">{item.product.name}</div>
                    {item.discountPercentage > 0 && (
                      <div className="text-xs text-emerald-600 mt-0.5">Diskon {item.discountPercentage}%</div>
                    )}
                    <div className="text-emerald-600 text-sm">{formatPrice(item.finalUnitPrice)} x {item.qty}</div>
                    {item.discountAmount > 0 && (
                      <div className="text-slate-400 text-xs line-through">{formatPrice(item.basePrice)} x {item.qty}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => updateQty(item.product.id, item.qty - 1)} disabled={item.qty <= 1 || isLoading}
                    className="w-8 h-8 border rounded hover:bg-slate-100 transition disabled:opacity-30">
                    &minus;
                  </button>
                  <div className="font-mono w-6 text-center">{item.qty}</div>
                  <button onClick={() => updateQty(item.product.id, item.qty + 1)} disabled={isLoading}
                    className="w-8 h-8 border rounded hover:bg-slate-100 transition">
                    +
                  </button>
                  <button onClick={() => removeFromCart(item.product.id)} disabled={isLoading}
                    className="text-red-400 hover:text-red-600 ml-3 text-sm transition disabled:opacity-50">
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
          </div>

          <div className="flex justify-between items-center text-3xl font-semibold px-2 mb-4">
            <div>Total</div>
            <div className="text-emerald-600">{formatPrice(total)}</div>
          </div>
          {totalDiscount > 0 && (
            <div className="text-right text-sm text-emerald-600 mb-4 px-2">
              Hemat Rp {totalDiscount.toLocaleString('id-ID')}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <p className="text-sm text-amber-800">
              Setelah checkout, Anda akan memilih metode pembayaran. Tim NC MULIA akan menghubungi Anda via WhatsApp untuk konfirmasi pesanan.
            </p>
          </div>

          <button onClick={handleCheckout} disabled={isCheckingOut}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white py-4 rounded-2xl text-lg font-semibold transition-all flex items-center justify-center gap-2">
            {isCheckingOut ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </>
            ) : 'Checkout Sekarang'}
          </button>

          <div className="text-center mt-4">
            <Link to="/produk-herbalife" className="text-sm text-slate-400 hover:text-emerald-600 transition">
              &larr; Lanjut Belanja
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
