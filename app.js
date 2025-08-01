// Global variables
let cart = [];
let isLoggedIn = false;
let currentUser = null;

// DOM elements
const loginModal = document.getElementById('loginModal');
const cartModal = document.getElementById('cartModal');
const cartCount = document.querySelector('.cart-count');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    animateOnScroll();
    animateStats();
});

// Initialize application
function initializeApp() {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('aquatech_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    // Load user session
    const savedUser = localStorage.getItem('aquatech_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateLoginUI();
    }

    // Add scroll effect to header
    window.addEventListener('scroll', handleHeaderScroll);
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            closeLoginModal();
        }
        if (event.target === cartModal) {
            closeCartModal();
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

// Header scroll effect
function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
}

// Login functionality
function openLoginModal() {
    loginModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    loginModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation (in a real app, this would be server-side)
    if (email && password) {
        // Simulate login
        currentUser = {
            email: email,
            name: email.split('@')[0],
            loginTime: new Date().toISOString()
        };
        
        isLoggedIn = true;
        localStorage.setItem('aquatech_user', JSON.stringify(currentUser));
        
        updateLoginUI();
        closeLoginModal();
        
        // Show success message
        showNotification('¡Bienvenido! Has iniciado sesión correctamente.', 'success');
    } else {
        showNotification('Por favor, completa todos los campos.', 'error');
    }
}

function updateLoginUI() {
    const loginBtn = document.querySelector('.btn-login');
    if (isLoggedIn && currentUser) {
        loginBtn.innerHTML = `
            <i class="fas fa-user-check"></i>
            <span>Hola, ${currentUser.name}</span>
        `;
        loginBtn.onclick = logout;
    } else {
        loginBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>Iniciar Sesión</span>
        `;
        loginBtn.onclick = openLoginModal;
    }
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('aquatech_user');
    updateLoginUI();
    showNotification('Has cerrado sesión correctamente.', 'info');
}

// Cart functionality
function openCartModal() {
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    updateCartDisplay();
}

function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function addToCart(productId, productName, price) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartUI();
    saveCart();
    showNotification(`${productName} agregado al carrito`, 'success');
    
    // Add animation to cart button
    const cartBtn = document.querySelector('.btn-cart');
    cartBtn.style.transform = 'scale(1.1)';
    setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
    }, 200);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    updateCartDisplay();
    saveCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
            updateCartDisplay();
            saveCart();
        }
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

function updateCartDisplay() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        cartTotal.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 50;
        const total = subtotal + shipping;
        
        subtotalElement.textContent = `$${subtotal}`;
        totalElement.textContent = `$${total}`;
        cartTotal.style.display = 'block';
    }
}

function saveCart() {
    localStorage.setItem('aquatech_cart', JSON.stringify(cart));
}

function checkout() {
    if (!isLoggedIn) {
        closeCartModal();
        openLoginModal();
        showNotification('Debes iniciar sesión para continuar con la compra.', 'info');
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío.', 'error');
        return;
    }
    
    // Simulate checkout process
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50;
    
    showNotification(`¡Compra realizada por $${total}! Recibirás un email de confirmación.`, 'success');
    
    // Clear cart
    cart = [];
    updateCartUI();
    updateCartDisplay();
    saveCart();
    closeCartModal();
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#3b82f6';
    }
}

// Animation on scroll
function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.about-item, .product-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

// Animate statistics counters
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 40);
}

// Register form functionality (for future implementation)
function showRegisterForm() {
    const modalBody = document.querySelector('#loginModal .modal-body');
    modalBody.innerHTML = `
        <form id="registerForm">
            <div class="form-group">
                <label for="regName">Nombre completo</label>
                <input type="text" id="regName" name="name" required>
            </div>
            <div class="form-group">
                <label for="regEmail">Email</label>
                <input type="email" id="regEmail" name="email" required>
            </div>
            <div class="form-group">
                <label for="regPassword">Contraseña</label>
                <input type="password" id="regPassword" name="password" required>
            </div>
            <div class="form-group">
                <label for="regConfirmPassword">Confirmar contraseña</label>
                <input type="password" id="regConfirmPassword" name="confirmPassword" required>
            </div>
            <button type="submit" class="btn-primary full-width">Crear Cuenta</button>
        </form>
        <div class="modal-footer">
            <p>¿Ya tienes cuenta? <a href="#" onclick="showLoginForm()">Inicia sesión aquí</a></p>
        </div>
    `;
    
    document.querySelector('.modal-header h2').textContent = 'Crear Cuenta';
    
    // Add event listener for register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

function showLoginForm() {
    const modalBody = document.querySelector('#loginModal .modal-body');
    modalBody.innerHTML = `
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn-primary full-width">Iniciar Sesión</button>
        </form>
        <div class="modal-footer">
            <p>¿No tienes cuenta? <a href="#" onclick="showRegisterForm()">Regístrate aquí</a></p>
        </div>
    `;
    
    document.querySelector('.modal-header h2').textContent = 'Iniciar Sesión';
    
    // Add event listener for login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Por favor, completa todos los campos.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
    }
    
    // Simulate registration
    currentUser = {
        name: name,
        email: email,
        registerTime: new Date().toISOString()
    };
    
    isLoggedIn = true;
    localStorage.setItem('aquatech_user', JSON.stringify(currentUser));
    
    updateLoginUI();
    closeLoginModal();
    
    showNotification(`¡Bienvenido ${name}! Tu cuenta ha sido creada exitosamente.`, 'success');
}

// Product filtering and search (for future enhancement)
function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC key to close modals
    if (e.key === 'Escape') {
        if (loginModal.style.display === 'block') {
            closeLoginModal();
        }
        if (cartModal.style.display === 'block') {
            closeCartModal();
        }
    }
    
    // Ctrl/Cmd + K to open search (future feature)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Future: open search modal
    }
});

// Performance optimization: Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Service Worker registration for PWA capabilities (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Analytics tracking (placeholder for future implementation)
function trackEvent(eventName, eventData) {
    // Future: integrate with analytics service
    console.log('Event tracked:', eventName, eventData);
}

// Track product views
function trackProductView(productId, productName) {
    trackEvent('product_view', {
        product_id: productId,
        product_name: productName,
        timestamp: new Date().toISOString()
    });
}

// Track add to cart events
function trackAddToCart(productId, productName, price) {
    trackEvent('add_to_cart', {
        product_id: productId,
        product_name: productName,
        price: price,
        timestamp: new Date().toISOString()
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Future: send error reports to monitoring service
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // Future: send error reports to monitoring service
});