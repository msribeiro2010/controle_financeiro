document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const activateButton = document.getElementById('activateAgent');
    const dashboardContent = document.getElementById('dashboardContent');
    const promotionsInput = document.getElementById('promotionsInput');
    const searchPromotionsButton = document.getElementById('searchPromotions');

    // Set focus on input field and add helpful placeholder
    userInput.placeholder = 'Digite o nome do produto (ex: iPhone, Smart TV, Notebook)';
    userInput.focus();

    // Add suggestions as user types
    userInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length >= 3) {
            try {
                const suggestions = await getProductSuggestions(query);
                showSuggestions(suggestions);
            } catch (error) {
                console.error('Erro ao buscar sugestões:', error);
            }
        }
    }, 300));

    // Add click event to the search button
    activateButton.addEventListener('click', async () => {
        const searchQuery = userInput.value.trim();
        
        if (!searchQuery) {
            alert('Por favor, digite o produto que deseja buscar!');
            return;
        }

        try {
            // Show loading state
            activateButton.disabled = true;
            activateButton.textContent = 'Buscando...';
            dashboardContent.innerHTML = '<div class="loading"><div class="spinner"></div><p>Buscando produtos em todas as lojas...</p></div>';

            // Search products across all marketplaces
            const response = await searchProducts(searchQuery);
            console.log('Search response:', response); // Debug log

            // Update dashboard with the response
            updateDashboard(response);
        } catch (error) {
            console.error('Search error:', error); // Debug log
            dashboardContent.innerHTML = `<p class="error">Erro: ${error.message}</p>`;
        } finally {
            // Reset button state
            activateButton.disabled = false;
            activateButton.textContent = 'Comparar Preços';
        }
    });

    // Also trigger search on Enter key
    userInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            activateButton.click();
        }
    });

    // Add click event to the promotions search button
    searchPromotionsButton.addEventListener('click', async () => {
        const searchQuery = promotionsInput.value.trim();
        
        if (!searchQuery) {
            alert('Por favor, digite o produto que deseja buscar em promoção!');
            return;
        }

        try {
            // Show loading state
            searchPromotionsButton.disabled = true;
            searchPromotionsButton.textContent = 'Buscando...';
            dashboardContent.innerHTML = '<div class="loading"><div class="spinner"></div><p>Buscando promoções em todas as lojas...</p></div>';

            // Search products with promotions
            const response = await searchPromotions(searchQuery);
            console.log('Promotions response:', response);

            // Update dashboard with the response
            updatePromotionsDashboard(response);
        } catch (error) {
            console.error('Promotions search error:', error);
            dashboardContent.innerHTML = `<p class="error">Erro: ${error.message}</p>`;
        } finally {
            // Reset button state
            searchPromotionsButton.disabled = false;
            searchPromotionsButton.textContent = 'Buscar Promoções';
        }
    });

    // Also trigger promotions search on Enter key
    promotionsInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            searchPromotionsButton.click();
        }
    });

    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Get product suggestions as user types
    async function getProductSuggestions(query) {
        // Simulated API call for suggestions
        const suggestions = [
            'iPhone',
            'Samsung Galaxy',
            'Smart TV',
            'Notebook',
            'PlayStation 5',
            'Xbox Series X',
            'Tablet',
            'Headphone',
            'Câmera Digital',
            'Smartwatch'
        ].filter(item => item.toLowerCase().includes(query));

        return suggestions;
    }

    // Show suggestions dropdown
    function showSuggestions(suggestions) {
        let suggestionsDiv = document.getElementById('suggestions');
        if (!suggestionsDiv) {
            suggestionsDiv = document.createElement('div');
            suggestionsDiv.id = 'suggestions';
            userInput.parentNode.appendChild(suggestionsDiv);
        }

        if (suggestions.length > 0) {
            const html = suggestions.map(s => `
                <div class="suggestion-item" onclick="document.getElementById('userInput').value='${s}'; document.getElementById('activateAgent').click();">
                    ${s}
                </div>
            `).join('');
            suggestionsDiv.innerHTML = html;
            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.style.display = 'none';
        }
    }

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        const suggestionsDiv = document.getElementById('suggestions');
        if (suggestionsDiv && !userInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });

    // Search products across all marketplaces
    async function searchProducts(query) {
        try {
            // Simulated product categories and their base characteristics
            const productCategories = {
                'iphone': {
                    basePrice: 5000,
                    priceRange: 1000,
                    images: {
                        'mercado livre': 'https://http2.mlstatic.com/D_NQ_NP_2X_851739-MLA47781882564_102021-F.webp',
                        'amazon': 'https://m.media-amazon.com/images/I/61l9ppRIiqL._AC_SX679_.jpg',
                        'magazine luiza': 'https://a-static.mlcdn.com.br/450x450/iphone-13-apple-128gb/magazineluiza/231507500/a7e5425a8670f21f33f33f3f9bee6cb2.jpg',
                        'americanas': 'https://images-americanas.b2w.io/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'casas bahia': 'https://images.casasbahia.com.br/55042007/1xg.jpg',
                        'submarino': 'https://images.submarino.com.br/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'shopee': 'https://cf.shopee.com.br/file/br-11134207-23030-31j8lj2kvyov57'
                    }
                },
                'samsung': {
                    basePrice: 4000,
                    priceRange: 800,
                    images: {
                        'mercado livre': 'https://http2.mlstatic.com/D_NQ_NP_2X_847906-MLA52221635395_102022-F.webp',
                        'amazon': 'https://m.media-amazon.com/images/I/61aVLMqYPxL._AC_SX679_.jpg',
                        'magazine luiza': 'https://a-static.mlcdn.com.br/450x450/smartphone-samsung-galaxy-s23/magazineluiza/236702000/42dd97b1dde10b878f11e1a0f1fac22a.jpg',
                        'americanas': 'https://images-americanas.b2w.io/produtos/01/00/img/5346840/1/5346840134_1GG.jpg',
                        'casas bahia': 'https://images.casasbahia.com.br/55042890/1xg.jpg',
                        'submarino': 'https://images.submarino.com.br/produtos/01/00/img/5346840/1/5346840134_1GG.jpg',
                        'shopee': 'https://cf.shopee.com.br/file/br-11134207-23030-samsung-s23'
                    }
                },
                'smart tv': {
                    basePrice: 2500,
                    priceRange: 500,
                    images: {
                        'mercado livre': 'https://http2.mlstatic.com/D_NQ_NP_2X_968571-MLA53087544829_122022-F.webp',
                        'amazon': 'https://m.media-amazon.com/images/I/71LJJrKbezL._AC_SX679_.jpg',
                        'magazine luiza': 'https://a-static.mlcdn.com.br/450x450/smart-tv-50-crystal-4k-samsung/magazineluiza/231463500/44bf629ad1472f3b7c3f41c6c807cb36.jpg',
                        'americanas': 'https://images-americanas.b2w.io/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'casas bahia': 'https://images.casasbahia.com.br/55042007/1xg.jpg',
                        'submarino': 'https://images.submarino.com.br/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'shopee': 'https://cf.shopee.com.br/file/br-11134207-23030-smart-tv'
                    }
                },
                'notebook': {
                    basePrice: 3500,
                    priceRange: 700,
                    images: {
                        'mercado livre': 'https://http2.mlstatic.com/D_NQ_NP_2X_925192-MLA48632024724_122021-F.webp',
                        'amazon': 'https://m.media-amazon.com/images/I/61onZO+CPmL._AC_SX679_.jpg',
                        'magazine luiza': 'https://a-static.mlcdn.com.br/450x450/notebook-dell-inspiron-15-3000/magazineluiza/231463500/44bf629ad1472f3b7c3f41c6c807cb36.jpg',
                        'americanas': 'https://images-americanas.b2w.io/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'casas bahia': 'https://images.casasbahia.com.br/55042007/1xg.jpg',
                        'submarino': 'https://images.submarino.com.br/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'shopee': 'https://cf.shopee.com.br/file/br-11134207-23030-notebook'
                    }
                }
            };

            const stores = ['mercado livre', 'amazon', 'magazine luiza', 'americanas', 'casas bahia', 'submarino', 'shopee'];
            const results = {};
            
            // Find the most relevant category for the search query
            const normalizedQuery = query.toLowerCase();
            const category = Object.keys(productCategories).find(cat => normalizedQuery.includes(cat)) || 'outros';
            
            // Use category data or default values
            const productData = productCategories[category] || {
                basePrice: 1000,
                priceRange: 300,
                images: {}
            };

            // Generate results for each store
            stores.forEach(store => {
                const basePrice = productData.basePrice;
                const variation = (Math.random() * productData.priceRange) - (productData.priceRange / 2);
                const price = parseFloat((basePrice + variation).toFixed(2));

                // Generate store-specific product URLs
                const storeUrl = store.replace(/\s+/g, '');
                const productSlug = query.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-');

                // Store-specific URL patterns
                const urlPatterns = {
                    'mercado livre': `https://lista.mercadolivre.com.br/${productSlug}`,
                    'amazon': `https://www.amazon.com.br/s?k=${encodeURIComponent(query)}`,
                    'magazine luiza': `https://www.magazineluiza.com.br/busca/${encodeURIComponent(query)}`,
                    'americanas': `https://www.americanas.com.br/busca/${encodeURIComponent(query)}`,
                    'casas bahia': `https://www.casasbahia.com.br/${encodeURIComponent(query)}/b`,
                    'submarino': `https://www.submarino.com.br/busca/${encodeURIComponent(query)}`,
                    'shopee': `https://shopee.com.br/search?keyword=${encodeURIComponent(query)}`
                };

                results[store] = {
                    title: `${query} - ${store.charAt(0).toUpperCase() + store.slice(1)}`,
                    price: price,
                    thumbnail: productData.images[store] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(store)}`,
                    link: urlPatterns[store],
                    rating: (4 + Math.random()).toFixed(1),
                    seller: `${store.charAt(0).toUpperCase() + store.slice(1)} Oficial`
                };
            });

            const lowestPrice = Math.min(...Object.values(results).map(item => item.price));
            
            return {
                status: 'success',
                query: query,
                results: results,
                lowestPrice: lowestPrice,
                timestamp: new Date().toLocaleString()
            };
        } catch (error) {
            console.error('Error in searchProducts:', error);
            throw new Error('Erro ao buscar produtos. Por favor, tente novamente.');
        }
    }

    // Update dashboard with the results
    function updateDashboard(response) {
        if (response.status === 'success') {
            const resultsHtml = Object.entries(response.results).map(([site, product]) => `
                <div class="product-item ${product.price === response.lowestPrice ? 'best-price' : ''}">
                    <div class="store-badge">${site.toUpperCase()}</div>
                    ${product.price === response.lowestPrice ? '<div class="best-price-badge">Melhor Preço!</div>' : ''}
                    <img src="${product.thumbnail}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x300?text=Imagem+Indisponível'">
                    <h3>${product.title}</h3>
                    <div class="product-details">
                        <p class="seller">Vendido por: ${product.seller}</p>
                        <p class="rating">★ ${product.rating}</p>
                        <p class="price ${product.price === response.lowestPrice ? 'best-price-text' : ''}">
                            R$ ${product.price.toFixed(2)}
                        </p>
                    </div>
                    <a href="${product.link}" target="_blank" class="product-link">Ver na Loja</a>
                </div>
            `).join('');

            const html = `
                <div class="response-item">
                    <h3>Resultados para: ${response.query}</h3>
                    <p><strong>Atualizado em:</strong> ${response.timestamp}</p>
                    <p class="lowest-price">Menor preço encontrado: R$ ${response.lowestPrice.toFixed(2)}</p>
                    <div class="products-grid">
                        ${resultsHtml}
                    </div>
                </div>
            `;
            
            dashboardContent.innerHTML = html;
        } else {
            dashboardContent.innerHTML = `<p class="error">Erro ao buscar produtos</p>`;
        }
    }

    // Search promotions across all marketplaces
    async function searchPromotions(query) {
        try {
            // Reuse the same product categories from searchProducts
            const productCategories = {
                'iphone': {
                    basePrice: 5000,
                    priceRange: 1000,
                    images: {
                        'mercado livre': 'https://http2.mlstatic.com/D_NQ_NP_2X_851739-MLA47781882564_102021-F.webp',
                        'amazon': 'https://m.media-amazon.com/images/I/61l9ppRIiqL._AC_SX679_.jpg',
                        'magazine luiza': 'https://a-static.mlcdn.com.br/450x450/iphone-13-apple-128gb/magazineluiza/231507500/a7e5425a8670f21f33f33f3f9bee6cb2.jpg',
                        'americanas': 'https://images-americanas.b2w.io/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'casas bahia': 'https://images.casasbahia.com.br/55042007/1xg.jpg',
                        'submarino': 'https://images.submarino.com.br/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'shopee': 'https://cf.shopee.com.br/file/br-11134207-23030-31j8lj2kvyov57'
                    }
                },
                'samsung': {
                    basePrice: 4000,
                    priceRange: 800,
                    images: {
                        'mercado livre': 'https://http2.mlstatic.com/D_NQ_NP_2X_847906-MLA52221635395_102022-F.webp',
                        'amazon': 'https://m.media-amazon.com/images/I/61aVLMqYPxL._AC_SX679_.jpg',
                        'magazine luiza': 'https://a-static.mlcdn.com.br/450x450/smartphone-samsung-galaxy-s23/magazineluiza/236702000/42dd97b1dde10b878f11e1a0f1fac22a.jpg',
                        'americanas': 'https://images-americanas.b2w.io/produtos/01/00/img/5346840/1/5346840134_1GG.jpg',
                        'casas bahia': 'https://images.casasbahia.com.br/55042890/1xg.jpg',
                        'submarino': 'https://images.submarino.com.br/produtos/01/00/img/5346840/1/5346840134_1GG.jpg',
                        'shopee': 'https://cf.shopee.com.br/file/br-11134207-23030-samsung-s23'
                    }
                },
                'smart tv': {
                    basePrice: 2500,
                    priceRange: 500,
                    images: {
                        'mercado livre': 'https://http2.mlstatic.com/D_NQ_NP_2X_968571-MLA53087544829_122022-F.webp',
                        'amazon': 'https://m.media-amazon.com/images/I/71LJJrKbezL._AC_SX679_.jpg',
                        'magazine luiza': 'https://a-static.mlcdn.com.br/450x450/smart-tv-50-crystal-4k-samsung/magazineluiza/231463500/44bf629ad1472f3b7c3f41c6c807cb36.jpg',
                        'americanas': 'https://images-americanas.b2w.io/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'casas bahia': 'https://images.casasbahia.com.br/55042007/1xg.jpg',
                        'submarino': 'https://images.submarino.com.br/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'shopee': 'https://cf.shopee.com.br/file/br-11134207-23030-smart-tv'
                    }
                },
                'notebook': {
                    basePrice: 3500,
                    priceRange: 700,
                    images: {
                        'mercado livre': 'https://http2.mlstatic.com/D_NQ_NP_2X_925192-MLA48632024724_122021-F.webp',
                        'amazon': 'https://m.media-amazon.com/images/I/61onZO+CPmL._AC_SX679_.jpg',
                        'magazine luiza': 'https://a-static.mlcdn.com.br/450x450/notebook-dell-inspiron-15-3000/magazineluiza/231463500/44bf629ad1472f3b7c3f41c6c807cb36.jpg',
                        'americanas': 'https://images-americanas.b2w.io/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'casas bahia': 'https://images.casasbahia.com.br/55042007/1xg.jpg',
                        'submarino': 'https://images.submarino.com.br/produtos/01/00/img/3234340/1/3234340134_1GG.jpg',
                        'shopee': 'https://cf.shopee.com.br/file/br-11134207-23030-notebook'
                    }
                }
            };

            const stores = ['mercado livre', 'amazon', 'magazine luiza', 'americanas', 'casas bahia', 'submarino', 'shopee'];
            const results = {};
            
            // Find the most relevant category for the search query
            const normalizedQuery = query.toLowerCase();
            const category = Object.keys(productCategories).find(cat => normalizedQuery.includes(cat)) || 'outros';
            
            // Use category data or default values
            const productData = productCategories[category] || {
                basePrice: 1000,
                priceRange: 300,
                images: {}
            };

            // Generate promotional results for each store
            stores.forEach(store => {
                const basePrice = productData.basePrice;
                // Bigger discount for promotions (30-50% off)
                const discountPercent = 30 + Math.floor(Math.random() * 20);
                const discountedPrice = parseFloat((basePrice * (1 - discountPercent/100)).toFixed(2));
                
                const productSlug = query.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-');

                // Create a more descriptive product title
                let productTitle = query;
                
                // Add model specifics based on category
                if (category === 'iphone') {
                    productTitle = `iPhone ${normalizedQuery.includes('pro') ? 'Pro' : ''} ${normalizedQuery.includes('max') ? 'Max' : ''} - ${store.charAt(0).toUpperCase() + store.slice(1)}`;
                } else if (category === 'samsung') {
                    productTitle = `Samsung Galaxy ${normalizedQuery.includes('s23') ? 'S23' : normalizedQuery.includes('s22') ? 'S22' : 'S21'} - ${store.charAt(0).toUpperCase() + store.slice(1)}`;
                } else if (category === 'smart tv') {
                    productTitle = `Smart TV ${normalizedQuery.includes('samsung') ? 'Samsung' : 'LG'} ${normalizedQuery.includes('50') ? '50"' : '43"'} 4K - ${store.charAt(0).toUpperCase() + store.slice(1)}`;
                } else if (category === 'notebook') {
                    productTitle = `Notebook ${normalizedQuery.includes('dell') ? 'Dell' : normalizedQuery.includes('lenovo') ? 'Lenovo' : 'Acer'} ${normalizedQuery.includes('i7') ? 'i7' : 'i5'} - ${store.charAt(0).toUpperCase() + store.slice(1)}`;
                } else {
                    productTitle = `${query} - ${store.charAt(0).toUpperCase() + store.slice(1)}`;
                }

                // Store-specific promotional URL patterns
                const urlPatterns = {
                    'mercado livre': `https://lista.mercadolivre.com.br/${productSlug}_Promocoes`,
                    'amazon': `https://www.amazon.com.br/s?k=${encodeURIComponent(query)}&rh=n%3A17276928011`,
                    'magazine luiza': `https://www.magazineluiza.com.br/busca/${encodeURIComponent(query)}/?filters=promotion`,
                    'americanas': `https://www.americanas.com.br/busca/${encodeURIComponent(query)}?filter=%7B"id"%3A"discount"%2C"value"%3A"true"%7D`,
                    'casas bahia': `https://www.casasbahia.com.br/${encodeURIComponent(query)}/b?filtro=promocao`,
                    'submarino': `https://www.submarino.com.br/busca/${encodeURIComponent(query)}?filter=%7B"id"%3A"discount"%2C"value"%3A"true"%7D`,
                    'shopee': `https://shopee.com.br/search?keyword=${encodeURIComponent(query)}&promotionId=1`
                };

                results[store] = {
                    title: `${productTitle} - PROMOÇÃO ${discountPercent}% OFF`,
                    originalPrice: basePrice,
                    price: discountedPrice,
                    discount: discountPercent,
                    thumbnail: productData.images[store] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(store)}`,
                    link: urlPatterns[store],
                    rating: (4 + Math.random()).toFixed(1),
                    seller: `${store.charAt(0).toUpperCase() + store.slice(1)} Oficial`,
                    promoTag: `OFERTA DO DIA: ${discountPercent}% OFF`
                };
            });

            const lowestPrice = Math.min(...Object.values(results).map(item => item.price));
            
            return {
                status: 'success',
                query: query,
                results: results,
                lowestPrice: lowestPrice,
                timestamp: new Date().toLocaleString()
            };
        } catch (error) {
            console.error('Error in searchPromotions:', error);
            throw new Error('Erro ao buscar promoções. Por favor, tente novamente.');
        }
    }

    // Update dashboard with promotion results
    function updatePromotionsDashboard(response) {
        if (response.status === 'success') {
            console.log('Promotion response:', response);
            
            const resultsHtml = Object.entries(response.results).map(([site, product]) => {
                console.log(`Product for ${site}:`, product);
                
                return `
                <div class="product-item promotion ${product.price === response.lowestPrice ? 'best-price' : ''}">
                    <div class="store-badge">${site.toUpperCase()}</div>
                    <div class="promo-badge">${product.promoTag}</div>
                    ${product.price === response.lowestPrice ? '<div class="best-price-badge">Melhor Preço!</div>' : ''}
                    <img src="${product.thumbnail}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x300?text=Imagem+Indisponível'">
                    <h3>${product.title.replace(' - PROMOÇÃO', '<br><span class="promotion-text">PROMOÇÃO')}</span></h3>
                    <div class="product-details">
                        <p class="seller">Vendido por: ${product.seller}</p>
                        <p class="rating">★ ${product.rating}</p>
                        <div class="price-container">
                            <p class="original-price">De: R$ ${product.originalPrice.toFixed(2)}</p>
                            <p class="price promotion ${product.price === response.lowestPrice ? 'best-price-text' : ''}">
                                Por: R$ ${product.price.toFixed(2)}
                            </p>
                            <p class="discount-tag">Economia de ${product.discount}%</p>
                        </div>
                    </div>
                    <a href="${product.link}" target="_blank" class="product-link promotion">Ver Oferta</a>
                </div>
            `;
            }).join('');

            const html = `
                <div class="response-item promotions">
                    <h3>Promoções para: ${response.query}</h3>
                    <p><strong>Atualizado em:</strong> ${response.timestamp}</p>
                    <p class="lowest-price">Menor preço em promoção: R$ ${response.lowestPrice.toFixed(2)}</p>
                    <div class="products-grid">
                        ${resultsHtml}
                    </div>
                </div>
            `;
            
            dashboardContent.innerHTML = html;
        } else {
            dashboardContent.innerHTML = `<p class="error">Erro ao buscar promoções</p>`;
        }
    }
}); 