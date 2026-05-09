// ===== Configuration =====
const API_BASE = '/api';

// ===== Session Management =====
function getSessionId() {
    let sessionId = localStorage.getItem('cartSession');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('cartSession', sessionId);
    }
    return sessionId;
}

// ===== API Helper =====
async function api(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': getSessionId(),
            ...options.headers
        },
        ...options
    };
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }
    const res = await fetch(url, config);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Cart Count =====
async function updateCartCount() {
    try {
        const data = await api('/cart');
        const count = data.items ? data.items.reduce((sum, i) => sum + i.quantity, 0) : 0;
        document.querySelectorAll('#cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline' : 'none';
        });
    } catch (e) {
        console.error('Cart count error:', e);
    }
}

// ===== Homepage: Load Books =====
async function loadBooks(search = '', category = 'all') {
    const grid = document.getElementById('books-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading books...</div>';

    try {
        const endpoint = search ? `/books?search=${encodeURIComponent(search)}` : '/books';
        const books = await api(endpoint);

        const filtered = category === 'all' 
            ? books 
            : books.filter(b => b.category === category);

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="loading">No books found.</div>';
            return;
        }

        grid.innerHTML = filtered.map(book => `
            <div class="book-card" onclick="window.location.href='/book.html?id=${book.id}'">
                <img src="${book.imageUrl}" alt="${book.title}" loading="lazy"
                    onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
                <div class="book-card-body">
                    <div class="book-category">${book.category}</div>
                    <h3>${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <div class="book-footer">
                        <span class="book-price">$${book.price.toFixed(2)}</span>
                        <button class="btn-add" onclick="event.stopPropagation(); addToCart(${book.id}, '${book.title.replace(/'/g, "\'")}', '${book.author.replace(/'/g, "\'")}', ${book.price}, '${book.imageUrl}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        grid.innerHTML = `<div class="loading">Error loading books: ${e.message}</div>`;
    }
}

// ===== Add to Cart =====
async function addToCart(bookId, title, author, price, imageUrl) {
    try {
        await api('/cart', {
            method: 'POST',
            body: { bookId, title, author, price, quantity: 1, imageUrl }
        });
        showToast(`"${title}" added to cart!`);
        updateCartCount();
    } catch (e) {
        showToast('Failed to add to cart', 'error');
    }
}

// ===== Book Detail Page =====
async function loadBookDetail() {
    const container = document.getElementById('book-detail');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        container.innerHTML = '<div class="loading">Book ID not provided.</div>';
        return;
    }

    try {
        const book = await api(`/books/${id}`);
        container.innerHTML = `
            <img src="${book.imageUrl}" alt="${book.title}"
                onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
            <div class="book-detail-info">
                <div class="book-category">${book.category}</div>
                <h1>${book.title}</h1>
                <p class="author">by ${book.author}</p>
                <p class="price">$${book.price.toFixed(2)}</p>
                <p class="description">${book.description}</p>
                <button class="btn-primary" onclick="addToCart(${book.id}, '${book.title.replace(/'/g, "\'")}', '${book.author.replace(/'/g, "\'")}', ${book.price}, '${book.imageUrl}')">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        loadReviews(id);
    } catch (e) {
        container.innerHTML = `<div class="loading">Book not found.</div>`;
    }
}

// ===== Reviews =====
async function loadReviews(bookId) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    try {
        const reviews = await api(`/books/${bookId}/reviews`);
        if (reviews.length === 0) {
            list.innerHTML = '<div class="loading">No reviews yet. Be the first to review!</div>';
            return;
        }
        list.innerHTML = reviews.map(r => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${r.userName}</span>
                    <span class="review-date">${r.date}</span>
                </div>
                <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                <p class="review-text">${r.comment}</p>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = '<div class="loading">Failed to load reviews.</div>';
    }
}

function setupReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) return;

    const stars = document.querySelectorAll('.star-rating i');
    const ratingInput = document.getElementById('review-rating');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            ratingInput.value = rating;
            stars.forEach((s, i) => {
                s.classList.toggle('selected', i < rating);
                s.classList.toggle('far', i >= rating);
                s.classList.toggle('fas', i < rating);
            });
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get('id');
        const name = document.getElementById('review-name').value;
        const rating = parseInt(document.getElementById('review-rating').value);
        const comment = document.getElementById('review-comment').value;

        if (rating === 0) {
            showToast('Please select a rating', 'error');
            return;
        }

        try {
            await api(`/books/${bookId}/reviews`, {
                method: 'POST',
                body: { userName: name, rating, comment }
            });
            showToast('Review submitted!');
            form.reset();
            stars.forEach(s => {
                s.classList.remove('selected', 'fas');
                s.classList.add('far');
            });
            ratingInput.value = 0;
            loadReviews(bookId);
        } catch (err) {
            showToast('Failed to submit review', 'error');
        }
    });
}

// ===== Cart Page =====
async function loadCart() {
    const container = document.getElementById('cart-content');
    if (!container) return;

    try {
        const data = await api('/cart');
        const items = data.items || [];

        if (items.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-basket"></i>
                    <h3>Your cart is empty</h3>
                    <p>Browse our collection and add some books!</p>
                    <a href="/" class="btn-primary"><i class="fas fa-book"></i> Browse Books</a>
                </div>
            `;
            return;
        }

        const itemsHtml = items.map(item => `
            <div class="cart-item">
                <img src="${item.imageUrl}" alt="${item.title}"
                    onerror="this.src='https://via.placeholder.com/80x100?text=No+Image'">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p>${item.author} &middot; Qty: ${item.quantity}</p>
                </div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="btn-remove" onclick="removeFromCart(${item.bookId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = `
            ${itemsHtml}
            <div class="cart-summary">
                <div class="cart-total">Total: <span>$${data.total.toFixed(2)}</span></div>
                <a href="/checkout.html" class="btn-primary">
                    <i class="fas fa-credit-card"></i> Proceed to Checkout
                </a>
            </div>
        `;
    } catch (e) {
        container.innerHTML = `<div class="loading">Error loading cart: ${e.message}</div>`;
    }
}

async function removeFromCart(bookId) {
    try {
        await api(`/cart/${bookId}`, { method: 'DELETE' });
        showToast('Item removed from cart');
        loadCart();
        updateCartCount();
    } catch (e) {
        showToast('Failed to remove item', 'error');
    }
}

// ===== Checkout Page =====
async function loadCheckoutSummary() {
    const summary = document.getElementById('order-summary');
    if (!summary) return;

    try {
        const data = await api('/cart');
        const items = data.items || [];

        if (items.length === 0) {
            summary.innerHTML = '<p>Your cart is empty. <a href="/">Browse books</a></p>';
            return;
        }

        const itemsHtml = items.map(item => `
            <div class="order-summary-item">
                <span>${item.title} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        summary.innerHTML = `
            ${itemsHtml}
            <div class="order-summary-item">
                <span>Total</span>
                <span>$${data.total.toFixed(2)}</span>
            </div>
        `;
    } catch (e) {
        summary.innerHTML = '<p>Error loading summary.</p>';
    }
}

function setupCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        try {
            const result = await api('/checkout', { method: 'POST' });
            document.getElementById('checkout-content').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
            document.getElementById('order-id').textContent = result.orderId;
            document.getElementById('order-total').textContent = '$' + result.total.toFixed(2);
            updateCartCount();
        } catch (e) {
            showToast(e.message || 'Checkout failed', 'error');
            btn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
            btn.disabled = false;
        }
    });
}

// ===== Search & Filters =====
function setupSearch() {
    const input = document.getElementById('search-input');
    const btn = document.getElementById('search-btn');
    if (!input) return;

    const doSearch = () => loadBooks(input.value.trim());

    btn?.addEventListener('click', doSearch);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch();
    });
}

function setupFilters() {
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            const search = document.getElementById('search-input')?.value || '';
            loadBooks(search, tag.dataset.category);
        });
    });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    const path = window.location.pathname;

    if (path === '/' || path === '/index.html') {
        loadBooks();
        setupSearch();
        setupFilters();
    } else if (path === '/book.html') {
        loadBookDetail();
        setupReviewForm();
    } else if (path === '/cart.html') {
        loadCart();
    } else if (path === '/checkout.html') {
        loadCheckoutSummary();
        setupCheckoutForm();
    }
});
