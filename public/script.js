// Mobile navigation functionality
function initializeMobileNav() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('main-nav');
    
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }
}

// Popup functionality
function initializePopup() {
    const popupClose = document.getElementById('popupClose');
    const popupOverlay = document.getElementById('popupOverlay');
    
    if (popupClose) {
        popupClose.addEventListener('click', closePopup);
    }
    
    if (popupOverlay) {
        popupOverlay.addEventListener('click', function(event) {
            if (event.target === popupOverlay) {
                closePopup();
            }
        });
    }
    
    // Show popup after 30 seconds if not shown before
    setTimeout(() => {
        showPopup();
    }, 30000);
}

function showPopup() {
    const popup = document.getElementById('popupOverlay');
    if (popup && !localStorage.getItem('popupShown')) {
        popup.style.display = 'flex';
        localStorage.setItem('popupShown', 'true');
    }
}

function closePopup() {
    const popup = document.getElementById('popupOverlay');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile navigation
    initializeMobileNav();
    
    // Load properties immediately since components are now server-side rendered
    if (typeof loadFeaturedProperties === 'function') {
        loadFeaturedProperties();
    }
    
    // Initialize popup functionality
    initializePopup();
    
    if (popupClose) {
        popupClose.addEventListener('click', closePopup);
    }
    
    if (popupOverlay) {
        popupOverlay.addEventListener('click', function(event) {
            if (event.target === popupOverlay) {
                closePopup();
            }
        });
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile Dropdown Functionality
document.querySelectorAll('.dropdown > .nav-link').forEach(dropdownToggle => {
    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = dropdownToggle.parentElement;
        
        // Close other dropdowns
        document.querySelectorAll('.dropdown').forEach(otherDropdown => {
            if (otherDropdown !== dropdown) {
                otherDropdown.classList.remove('active');
            }
        });
        
        // Toggle current dropdown
        dropdown.classList.toggle('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add fade-in class to elements and observe them
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll(
        '.service-card, .property-card, .testimonial-card, .about-content, .stats, .section-header'
    );
    
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Contact Form Handling
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) {
        console.error('Contact form not found');
        return;
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="loading"></span> Sending...';
        submitBtn.disabled = true;
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Map service to interest type for API
    const serviceMapping = {
        'buy': 'buy',
        'rent': 'rent', 
        'lease': 'lease'
    };
    
    // Prepare data for API
    const leadData = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        interest: serviceMapping[data.service] || 'buy',
        message: data.message,
        source: 'main_contact_form'
    };
    
    try {
        // Save to localStorage if SimpleAPI is available
        if (typeof SimpleAPI !== 'undefined') {
            const contactData = {
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                subject: `${data.service} inquiry`,
                message: data.message,
                source: 'main_contact_form'
            };
            SimpleAPI.addContact(contactData);
        }
        
        // Send email via Netlify function
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Show success message
            showNotification('Message sent successfully! We will get back to you soon.', 'success');
            contactForm.reset();
        } else {
            throw new Error(result.message || 'Failed to send message');
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        // If email fails but we saved to localStorage, still show partial success
        if (typeof SimpleAPI !== 'undefined') {
            showNotification('Your message has been saved. We will get back to you soon.', 'success');
            contactForm.reset();
        } else {
            showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
        }
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
    });
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeNotification(notification);
    });
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Property Card Interactions
document.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Service Card Interactions
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const icon = card.querySelector('.service-icon');
        icon.style.transform = 'scale(1.1) rotate(5deg)';
    });
    
    card.addEventListener('mouseleave', () => {
        const icon = card.querySelector('.service-icon');
        icon.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Statistics Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat h4');
    const speed = 200; // Lower = faster
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const suffix = counter.textContent.replace(/[\d]/g, '');
        let count = 0;
        const increment = target / speed;
        
        const updateCounter = () => {
            if (count < target) {
                count += increment;
                counter.textContent = Math.ceil(count) + suffix;
                setTimeout(updateCounter, 1);
            } else {
                counter.textContent = target + suffix;
            }
        };
        
        updateCounter();
    });
}

// Trigger counter animation when stats section is visible
const statsSection = document.querySelector('.stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
}

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Lazy Loading for Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Active Navigation Link Highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add active class styles
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: #3498db !important;
    }
    .nav-link.active::after {
        width: 100% !important;
    }
`;
document.head.appendChild(style);

// Search Functionality (if you want to add a property search)
function initializePropertySearch() {
    const searchInput = document.getElementById('property-search');
    const propertyCards = document.querySelectorAll('.property-card');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            propertyCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const location = card.querySelector('.location').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || location.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePropertySearch);

// Performance optimization: Debounce scroll events
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

// Apply debouncing to scroll-heavy functions
const debouncedScrollHandler = debounce(() => {
    // Scroll-dependent functions here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Initialize all features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Marco Real Estate website loaded successfully!');
    
    // Add any initialization code here
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => el.style.display = 'none');
});

// Error handling for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.src = 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Image+Not+Available';
    });
});

// Popup Contact Form Functionality
class PopupManager {
    constructor() {
        this.popup = document.getElementById('popupOverlay');
        this.popupForm = document.getElementById('popupContactForm');
        this.closeBtn = document.getElementById('popupClose');
        this.hasShown = false;
        this.userInteracted = false;
        
        this.init();
    }
    
    init() {
        // Show popup after 1 minute (60000ms)
        setTimeout(() => {
            if (!this.hasShown && !this.userInteracted) {
                this.showPopup();
            }
        }, 60000);
        
        // Track user interaction
        document.addEventListener('scroll', () => this.userInteracted = true, { once: true });
        document.addEventListener('click', () => this.userInteracted = true, { once: true });
        
        // Close popup events
        this.closeBtn?.addEventListener('click', () => this.hidePopup());
        this.popup?.addEventListener('click', (e) => {
            if (e.target === this.popup) this.hidePopup();
        });
        
        // Handle form submission
        this.popupForm?.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popup?.classList.contains('active')) {
                this.hidePopup();
            }
        });
    }
    
    showPopup() {
        if (this.hasShown) return;
        
        this.popup?.classList.add('active');
        this.hasShown = true;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Track popup view (optional analytics)
        console.log('Popup shown after 1 minute');
    }
    
    hidePopup() {
        this.popup?.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = this.popupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="loading"></span> Sending...';
        submitBtn.disabled = true;
        
        // Get form data
        const formData = new FormData(this.popupForm);
        const data = Object.fromEntries(formData);
        
        // Prepare data for API
        const leadData = {
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            interest: data.service,
            message: data.message || 'Popup form submission - interested in real estate services',
            source: 'popup_form'
        };
        
        try {
            // Send email via Netlify function
            const response = await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Show success message
                showNotification('Thank you! We will contact you within 24 hours.', 'success');
                this.popupForm.reset();
                this.hidePopup();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
            
        } catch (error) {
            console.error('Error submitting popup form:', error);
            showNotification('Sorry, there was an error. Please try again or call directly.', 'error');
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Load featured properties from localStorage
function loadFeaturedProperties() {
    console.log('loadFeaturedProperties: Starting...');
    const propertiesGrid = document.getElementById('featuredPropertiesGrid');
    if (!propertiesGrid) {
        console.error('loadFeaturedProperties: Grid element not found!');
        return;
    }
    
    console.log('loadFeaturedProperties: Grid found');
    
    // Check if SimpleAPI is available (fallback to static content if not)
    if (typeof SimpleAPI === 'undefined') {
        console.log('SimpleAPI not available, keeping static properties');
        return;
    }
    
    console.log('loadFeaturedProperties: SimpleAPI available');
    const properties = SimpleAPI.getProperties();
    console.log('loadFeaturedProperties: Found', properties.length, 'properties');
    
    // If no properties in localStorage, add some default ones
    if (properties.length === 0) {
        const defaultProperties = [
            {
                title: "Modern Family Home",
                location: "123 Oak Street, Riverside",
                price: "$750,000",
                bedrooms: 4,
                bathrooms: 3,
                sqft: 2500,
                status: "for-sale",
                images: ["https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"],
                description: "Beautiful modern family home in a quiet neighborhood"
            },
            {
                title: "Luxury Villa",
                location: "456 Pine Avenue, Hillcrest",
                price: "$1,250,000",
                bedrooms: 5,
                bathrooms: 4,
                sqft: 3800,
                status: "sold",
                images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"],
                description: "Stunning luxury villa with premium finishes"
            },
            {
                title: "Downtown Condo",
                location: "789 Main Street, Downtown",
                price: "$2,800/month",
                bedrooms: 2,
                bathrooms: 2,
                sqft: 1200,
                status: "for-rent",
                images: ["https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"],
                description: "Modern downtown condo with city views"
            }
        ];
        
        // Add default properties
        defaultProperties.forEach(property => {
            SimpleAPI.addProperty(property);
        });
        
        // Reload properties
        const allProperties = SimpleAPI.getProperties();
        displayProperties(allProperties.slice(0, 3), propertiesGrid);
    } else {
        // Show first 3 properties as featured
        displayProperties(properties.slice(0, 3), propertiesGrid);
    }
}

function displayProperties(properties, container) {
    container.innerHTML = properties.map(property => {
        const statusBadge = {
            'for-sale': 'For Sale',
            'for-rent': 'For Rent',
            'sold': 'Sold',
            'rented': 'Rented'
        }[property.status] || 'Available';
        
        const badgeClass = property.status === 'sold' || property.status === 'rented' ? 'sold' : '';
        const primaryImage = property.images && property.images.length > 0 ? property.images[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        
        return `
            <div class="property-card" style="cursor: pointer;">
                <div class="property-image">
                    <img src="${primaryImage}" alt="${property.title}">
                    <div class="property-badge ${badgeClass}">${statusBadge}</div>
                </div>
                <div class="property-info">
                    <h3>${property.title}</h3>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                    <div class="property-features">
                        <span><i class="fas fa-bed"></i> ${property.bedrooms} Beds</span>
                        <span><i class="fas fa-bath"></i> ${property.bathrooms} Baths</span>
                        <span><i class="fas fa-expand-arrows-alt"></i> ${property.sqft ? property.sqft.toLocaleString() : 'N/A'} sq ft</span>
                    </div>
                    <div class="property-price">${property.price}</div>
                </div>
            </div>
        `;
    }).join('');
}
