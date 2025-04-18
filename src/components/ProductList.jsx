import React, { useEffect, useState } from 'react';
import './../styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('https://fakestoreapi.com/products');
        const data = await res.json();

       
        const translatedProducts = await Promise.all(
          data.map(async (product) => {
            const translatedTitle = await translateText(product.title);
            const translatedCategory = await translateText(product.category);
            return {
              ...product,
              translatedTitle,
              translatedCategory,
            };
          })
        );

        setProducts(translatedProducts);
      } catch (err) {
        console.error("Ürün alma hatası:", err);
        setError('Ürünler alınırken bir hata oluştu.');
      }
    };

    fetchProducts();
  }, []);

  
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch(
          'https://api.exchangerate-api.com/v4/latest/USD'
        );
        const data = await res.json();
        setExchangeRate(data.rates.TRY);
        setLoading(false);
      } catch (err) {
        console.error("Döviz hatası:", err);
        setError('Döviz kuru alınamadı.');
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, []);

  const translateText = async (text) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|tr`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.responseData.translatedText;
    } catch {
      return text;
    }
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-list">
      <h1>Ürün Listesi</h1>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.image} alt={product.translatedTitle} />
            <h2>{product.translatedTitle}</h2>
            <p>Kategori: {product.translatedCategory}</p>
            <p>Fiyat: {(product.price * exchangeRate).toFixed(2)} TL</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
