import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsApi, bmiApi } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import type { Product, User } from '../lib/api';
import { herbalifeProducts } from '../data/herbalife-products';
import { getProductImage } from '../lib/productImages';
import { getRecommendation, normalizeBmiCategory } from '../lib/recommendations';
import type { BmiCategory } from '../types';

interface ProductsPageProps { user?: User | null; }

const CATEGORIES = ['All', 'Shake', 'Tea', 'Bar', 'Suplemen', 'Program'];

function resolveProductImage(name: string, imageUrl?: string | null): string {
  if (imageUrl && !imageUrl.includes('placehold.co') && !imageUrl.includes('placeholder')) {
    return imageUrl;
  }
  return getProductImage(name);
}

function mapStaticProduct(p: (typeof herbalifeProducts)[0]): Product {
  const base = p.basePrice;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    imageUrl: resolveProductImage(p.name, p.image),
    isAvailable: true,
    basePrice: base,
    pricing: { discountPercentage: 0, discountAmount: 0, finalPrice: base, membershipApplied: false },
  };
}

function formatPrice(n: number | undefined | null) {
  return `Rp ${(n ?? 0).toLocaleString('id-ID')}`;
}

export default function ProductsPage({ user }: ProductsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const bmiCategoryParam = searchParams.get('bmiCategory') as BmiCategory | null;
  const searchParam = searchParams.get('search');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const { addToCart, isInCart, isLoading: cartLoading } = useCart();

  const [showOnlyRecommended, setShowOnlyRecommended] = useState(true);
  const [dismissedRecommendation, setDismissedRecommendation] = useState(false);

  const [savedBmi, setSavedBmi] = useState<{ category: string; value?: string | number } | null>(() => {
    try {
      const cat = localStorage.getItem('nc_user_bmi_category');
      const val = localStorage.getItem('nc_user_bmi_value');
      if (cat) return { category: cat, value: val || undefined };
    } catch {}
    return null;
  });

  useEffect(() => {
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    if (user) {
      bmiApi.history().then(res => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          const latest = list[0];
          const cat = latest.bmiCategory || (latest as any).category;
          if (cat) {
            const norm = normalizeBmiCategory(cat) || cat;
            const val = latest.bmiValue ?? (latest as any).bmi;
            setSavedBmi({ category: norm, value: val });
            try {
              localStorage.setItem('nc_user_bmi_category', norm);
              if (val) localStorage.setItem('nc_user_bmi_value', String(val));
            } catch {}
          }
        }
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    productsApi.list().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        setRawProducts(res.data.map(p => ({
          ...p,
          isAvailable: true,
          basePrice: p.basePrice ?? p.price ?? 0,
          imageUrl: resolveProductImage(p.name, p.imageUrl),
        })));
      } else {
        setRawProducts(herbalifeProducts.map(mapStaticProduct));
      }
    }).catch(() => {
      setRawProducts(herbalifeProducts.map(mapStaticProduct));
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const activeCategoryName = !dismissedRecommendation
    ? (normalizeBmiCategory(bmiCategoryParam) || normalizeBmiCategory(savedBmi?.category))
    : null;

  const recommendation = activeCategoryName ? getRecommendation(activeCategoryName) : null;
  const recProductIds = new Set(recommendation?.productIds ?? []);
  const recProductNames = new Set(
    herbalifeProducts
      .filter(hp => recProductIds.has(hp.id))
      .map(hp => hp.name.toLowerCase().trim())
  );

  const isRecommendedProduct = (p: Product) => {
    if (!activeCategoryName) return false;
    if (recProductIds.has(p.id)) return true;
    if (p.name && recProductNames.has(p.name.toLowerCase().trim())) return true;
    return false;
  };

  const baseProducts = (rawProducts.length > 0 ? rawProducts : herbalifeProducts.map(mapStaticProduct))
    .map(p => ({ ...p, isAvailable: true }))
    .filter(p => category === 'All' || p.category === category)
    .filter(p => search === '' || p.name.toLowerCase().includes(search.toLowerCase()));

  const displayedProducts = (activeCategoryName && showOnlyRecommended)
    ? baseProducts.filter(p => isRecommendedProduct(p))
    : recProductIds.size > 0
      ? [...baseProducts].sort((a, b) => {
          const aRec = isRecommendedProduct(a);
          const bRec = isRecommendedProduct(b);
          if (aRec && !bRec) return -1;
          if (!aRec && bRec) return 1;
          return 0;
        })
      : baseProducts;

  const handleAdd = (product: Product) => {
    const final = product.pricing?.finalPrice ?? product.basePrice;
    addToCart({ id: product.id, name: product.name, price: final, imageUrl: product.imageUrl });
    setAddedIds(prev => new Set([...prev, product.id]));
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; }), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
        <div>
          <div className="text-emerald-700 text-sm tracking-[3px] font-medium">NC MULIA OFFICIAL STORE</div>
          <h1 className="text-6xl font-semibold tracking-[-2.5px] mt-1">Herbalife Shop</h1>
          <p className="text-slate-600 mt-2">Informasi produk Herbalife , terus 100% Original</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-emerald-600">{displayedProducts.length} Produk</div>
        </div>
      </div>

      {activeCategoryName ? (
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/30">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                  Rekomendasi Berdasarkan Hasil BMI
                </span>
                {savedBmi?.value && (
                  <span className="text-xs font-medium text-emerald-100">
                    (Skor BMI: {savedBmi.value})
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold mt-1 text-white">Produk Pilihan: Kategori {activeCategoryName}</h2>
              <p className="text-xs text-emerald-100 mt-1 max-w-2xl leading-relaxed">
                {recommendation?.description ?? 'Produk yang disesuaikan khusus untuk mendukung nutrisi ideal Anda.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              onClick={() => setShowOnlyRecommended(prev => !prev)}
              className="bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all"
            >
              {showOnlyRecommended ? 'Lihat Semua Katalog' : 'Filter Rekomendasi Saja'}
            </button>
            <Link
              to="/bmi"
              className="bg-emerald-800/60 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1"
            >
              🔄 Hitung Ulang BMI
            </Link>
            <button
              onClick={() => {
                setDismissedRecommendation(true);
                searchParams.delete('bmiCategory');
                searchParams.delete('search');
                setSearchParams(searchParams);
              }}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-white/20 transition-all"
              title="Tutup Filter Rekomendasi"
            >
              ✕ Tutup
            </button>
          </div>
        </div>
      ) : savedBmi?.category ? (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-emerald-900">
            <span>✨ Terdeteksi hasil BMI Anda sebelumnya: <strong>{savedBmi.category}</strong> {savedBmi.value ? `(BMI: ${savedBmi.value})` : ''}</span>
          </div>
          <button
            onClick={() => setDismissedRecommendation(false)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Aktifkan Rekomendasi BMI
          </button>
        </div>
      ) : (
        <div className="mb-8 p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl flex-shrink-0">
              💡
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Ingin rekomendasi produk yang paling sesuai?</h3>
              <p className="text-xs text-slate-300 mt-0.5">Hitung Kalkulator BMI Anda untuk mendapatkan saran produk yang dipersonalisasi khusus tubuh Anda.</p>
            </div>
          </div>
          <Link
            to="/bmi"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all self-start sm:self-auto flex-shrink-0 flex items-center gap-1.5"
          >
            👉 Hitung BMI Sekarang
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-20 z-40 bg-white py-4 border-b">
        <input
          type="text"
          placeholder="Cari produk Herbalife..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-slate-300 focus:border-emerald-500 px-5 py-3 rounded-2xl text-sm focus:outline-none"
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-3 text-sm rounded-2xl border transition-all ${category === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-emerald-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : displayedProducts.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Tidak ada produk yang cocok.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map(product => {
            const isRecommended = isRecommendedProduct(product);
            const inCart = isInCart(product.id);
            const justAdded = addedIds.has(product.id);
            const pricing = product.pricing ?? { discountPercentage: 0, discountAmount: 0, finalPrice: product.basePrice, membershipApplied: false };
            const hasDiscount = pricing.membershipApplied && pricing.discountPercentage > 0;
            const basePrice = product.basePrice;
            const finalPrice = pricing.finalPrice;
            return (
              <div key={product.id} className={`bg-white rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all border ${isRecommended ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/80'} group`}>
                <div className="relative cursor-pointer" onClick={() => setSelectedDetailProduct(product)}>
                  {product.imageUrl ? (
                    <div className="w-full h-60 bg-[#F5FAF7] flex items-center justify-center overflow-hidden border-b border-slate-200 shadow-sm">
                      <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="w-full h-60 bg-emerald-50 flex items-center justify-center">
                      <span className="text-5xl font-bold text-emerald-200">{product.name[0]}</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 text-xs font-semibold tracking-wider rounded-full shadow">
                    {product.category}
                  </div>
                  {isRecommended && (
                    <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 text-xs font-bold rounded-full shadow-md z-10 flex items-center gap-1">
                      ⭐ Rekomendasi BMI
                    </div>
                  )}
                  {hasDiscount && !isRecommended && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                      -{pricing.discountPercentage}%
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="font-semibold tracking-tight text-lg leading-tight mb-1 cursor-pointer hover:text-emerald-700 transition-colors" onClick={() => setSelectedDetailProduct(product)}>
                    {product.name}
                  </div>
                  {hasDiscount ? (
                    <div className="mb-1">
                      <span className="text-slate-400 line-through text-sm">{formatPrice(basePrice)}</span>
                      <div className="text-red-500 text-xs font-medium mt-0.5">Diskon Member {pricing.discountPercentage}%</div>
                    </div>
                  ) : null}
                  <div className="text-emerald-700 text-2xl font-semibold mb-3">{formatPrice(finalPrice)}</div>
                  <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-2">{product.description}</p>

                  <button
                    onClick={() => setSelectedDetailProduct(product)}
                    className="text-xs font-semibold text-emerald-700 hover:underline text-left mb-4 inline-flex items-center gap-1"
                  >
                    🔍 Lihat Detail Produk
                  </button>

                  {inCart ? (
                    <div className="w-full bg-emerald-100 text-emerald-700 py-3 rounded-2xl text-sm font-medium text-center flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Sudah di Keranjang
                    </div>
                  ) : justAdded ? (
                    <div className="w-full bg-emerald-500 text-white py-3 rounded-2xl text-sm font-medium text-center font-bold">Ditambahkan!</div>
                  ) : (
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={cartLoading}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white py-3 rounded-2xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
                    >
                      + Tambah ke Keranjang
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedDetailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedDetailProduct(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Detail Produk · {selectedDetailProduct.category}
              </span>
              <button onClick={() => setSelectedDetailProduct(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="w-full h-64 bg-[#F5FAF7] rounded-2xl flex items-center justify-center overflow-hidden mb-4 border border-slate-100">
              <img src={selectedDetailProduct.imageUrl || ''} alt={selectedDetailProduct.name} className="max-w-full max-h-full object-contain p-2" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedDetailProduct.name}</h3>

            <div className="mb-4">
              {selectedDetailProduct.pricing?.membershipApplied && selectedDetailProduct.pricing.discountPercentage > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-emerald-700">{formatPrice(selectedDetailProduct.pricing.finalPrice)}</span>
                  <span className="text-slate-400 line-through text-sm">{formatPrice(selectedDetailProduct.basePrice)}</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">Diskon Member -{selectedDetailProduct.pricing.discountPercentage}%</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-emerald-700">{formatPrice(selectedDetailProduct.basePrice)}</span>
              )}
            </div>

            <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi Produk</div>
              <p className="text-sm text-slate-600 leading-relaxed">{selectedDetailProduct.description}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setSelectedDetailProduct(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium">Tutup</button>
              {isInCart(selectedDetailProduct.id) ? (
                <div className="bg-emerald-100 text-emerald-700 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
                  ✓ Sudah di Keranjang
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleAdd(selectedDetailProduct);
                    setSelectedDetailProduct(null);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md"
                >
                  + Tambah ke Keranjang
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-14 text-center text-xs text-slate-500 tracking-widest">Semua produk Herbalife dijamin ORIGINAL</div>
    </div>
  );
}
