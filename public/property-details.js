// Property Details Page JavaScript

// Image Gallery Functionality
function changeMainImage(thumbnail, imageNumber) {
    const mainImage = document.getElementById('mainImage');
    const currentImageSpan = document.getElementById('currentImage');
    
    // Remove active class from all thumbnails
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    
    // Add active class to clicked thumbnail
    thumbnail.classList.add('active');
    
    // Change main image source
    mainImage.src = thumbnail.src.replace('w=300', 'w=1200');
    
    // Update image counter
    currentImageSpan.textContent = imageNumber;
    
    // Add smooth transition effect
    mainImage.style.opacity = '0';
    setTimeout(() => {
        mainImage.style.opacity = '1';
    }, 150);
}

// Mortgage Calculator
function calculateMortgage() {
    const homePrice = parseFloat(document.getElementById('homePrice').value) || 0;
    const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
    const annualRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const loanTermYears = parseInt(document.getElementById('loanTerm').value) || 30;
    
    // Calculate loan amount
    const loanAmount = homePrice - downPayment;
    
    // Convert annual rate to monthly rate
    const monthlyRate = annualRate / 100 / 12;
    
    // Calculate number of payments
    const numPayments = loanTermYears * 12;
    
    // Calculate monthly payment using mortgage formula
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
        monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
        monthlyPayment = loanAmount / numPayments;
    }
    
    // Update result display
    const resultElement = document.getElementById('calcResult');
    resultElement.innerHTML = `
        <div class="result-item">
            <span>Loan Amount:</span>
            <span class="amount">$${loanAmount.toLocaleString()}</span>
        </div>
        <div class="result-item">
            <span>Monthly Payment:</span>
            <span class="amount">$${Math.round(monthlyPayment).toLocaleString()}</span>
        </div>
        <div class="result-item">
            <span>Total Interest:</span>
            <span class="amount">$${Math.round((monthlyPayment * numPayments) - loanAmount).toLocaleString()}</span>
        </div>
    `;
    
    // Add animation to result
    resultElement.style.opacity = '0';
    setTimeout(() => {
        resultElement.style.opacity = '1';
    }, 100);
}

// Quick Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const quickContactForm = document.querySelector('.quick-contact-form');
    
    if (quickContactForm) {
        quickContactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.innerHTML = '<span class="loading"></span> Sending...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Get property title for context
            const propertyTitle = document.querySelector('.property-title')?.textContent || 'Property';
            
            // Prepare data for API
            const leadData = {
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                interest: 'buy', // Default to buy, could be enhanced to detect from page context
                message: `${data.message}\n\nProperty of Interest: ${propertyTitle}`,
                source: 'property_detail_form'
            };
            
            try {
                // Detect API URL based on environment
                const apiUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:3000/api/leads' 
                    : '/api/leads';
                    
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(leadData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success message
                    showNotification('Message sent successfully! Marco will contact you soon.', 'success');
                    this.reset();
                } else {
                    throw new Error(result.message || 'Failed to send message');
                }
                
            } catch (error) {
                console.error('Error submitting form:', error);
                showNotification('Sorry, there was an error. Please try calling directly.', 'error');
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Initialize mortgage calculator with default values
    calculateMortgage();
    
    // Add event listeners to calculator inputs
    const calcInputs = document.querySelectorAll('#homePrice, #downPayment, #interestRate, #loanTerm');
    calcInputs.forEach(input => {
        input.addEventListener('input', calculateMortgage);
        input.addEventListener('change', calculateMortgage);
    });
});

// Image Gallery Keyboard Navigation
document.addEventListener('keydown', function(e) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const activeThumbnail = document.querySelector('.thumbnail.active');
    
    if (!activeThumbnail) return;
    
    const activeIndex = Array.from(thumbnails).indexOf(activeThumbnail);
    let newIndex = activeIndex;
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        newIndex = activeIndex > 0 ? activeIndex - 1 : thumbnails.length - 1;
        e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        newIndex = activeIndex < thumbnails.length - 1 ? activeIndex + 1 : 0;
        e.preventDefault();
    }
    
    if (newIndex !== activeIndex) {
        changeMainImage(thumbnails[newIndex], newIndex + 1);
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 90;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
        }
    });
}, observerOptions);

// Add fade-in animations
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll(
        '.overview-item, .feature-category, .sidebar-section, .place-category'
    );
    
    elementsToAnimate.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        observer.observe(el);
    });
});

// Add CSS for fade-in animation
const style = document.createElement('style');
style.textContent = `
    .fade-in-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Share Property Functionality
function shareProperty() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Check out this amazing property!',
            url: window.location.href
        });
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('Property link copied to clipboard!', 'success');
        });
    }
}

// Save Property to Favorites (Local Storage)
function toggleFavorite() {
    const propertyId = 'property-1'; // This would be dynamic in a real app
    let favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]');
    
    const index = favorites.indexOf(propertyId);
    if (index > -1) {
        favorites.splice(index, 1);
        showNotification('Property removed from favorites', 'info');
    } else {
        favorites.push(propertyId);
        showNotification('Property added to favorites!', 'success');
    }
    
    localStorage.setItem('favoriteProperties', JSON.stringify(favorites));
    updateFavoriteButton();
}

function updateFavoriteButton() {
    const propertyId = 'property-1';
    const favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]');
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    if (favoriteBtn) {
        if (favorites.includes(propertyId)) {
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Saved';
            favoriteBtn.classList.add('favorited');
        } else {
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Save';
            favoriteBtn.classList.remove('favorited');
        }
    }
}

// Print Property Details
function printProperty() {
    window.print();
}

// Schedule Viewing Modal (if you want to add this feature)
function scheduleViewing() {
    // This would open a modal or redirect to a scheduling page
    showNotification('Viewing scheduling feature coming soon! Please call Marco directly.', 'info');
}

// Virtual Tour Functionality
document.addEventListener('DOMContentLoaded', function() {
    const virtualTourBtn = document.querySelector('.virtual-tour .btn');
    if (virtualTourBtn) {
        virtualTourBtn.addEventListener('click', function() {
            // This would integrate with a virtual tour service
            showNotification('Virtual tour feature coming soon! Please contact Marco for a live virtual showing.', 'info');
        });
    }
    
    // Google Maps integration
    const mapBtn = document.querySelector('.map-placeholder .btn');
    if (mapBtn) {
        mapBtn.addEventListener('click', function() {
            const address = '123 Oak Street, Riverside, CA 92501';
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            window.open(mapsUrl, '_blank');
        });
    }
    
    // Initialize favorite button state
    updateFavoriteButton();
});

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Error handling for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.src = 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Image+Not+Available';
    });
});

// Notification system (reuse from main script)
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

console.log('Property details page loaded successfully!');
