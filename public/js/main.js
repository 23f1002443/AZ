/**
 * Main JavaScript file for All Zone Corporate Website
 * Performance-optimized with proper event delegation and debouncing
 * Replaces both script.js and inline footer JavaScript
 */

// ===== PERFORMANCE UTILITIES =====
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ===== POPUP MANAGEMENT =====
class PopupManager {
    constructor() {
        this.popupElement = null;
        this.popupTimer = null;
        this.popupInterval = null;
        this.init();
    }

    init() {
        this.popupElement = document.getElementById('popupOverlay');
        if (!this.popupElement) return;

        this.bindEvents();
        this.schedulePopup();
    }

    bindEvents() {
        // Close button
        const closeBtn = document.getElementById('popupClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePopup(true));
        }

        // Click outside to close
        this.popupElement.addEventListener('click', (e) => {
            if (e.target === this.popupElement) {
                this.hidePopup(true);
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popupElement.classList.contains('active')) {
                this.hidePopup(true);
            }
        });

        // Hijack consultation buttons
        this.hijackConsultationButtons();
    }

    schedulePopup() {
        // Show first popup after 10 seconds
        this.popupTimer = setTimeout(() => {
            this.showPopup();
            
            // Then show popup every 30 seconds
            this.startRecurringPopups();
        }, 10000);
    }

    startRecurringPopups() {
        this.popupInterval = setInterval(() => {
            this.showPopup();
        }, 30000);
    }

    showPopup() {
        if (!this.popupElement || this.popupElement.classList.contains('active')) {
            return;
        }
        
        this.popupElement.classList.add('active');
    }

    hidePopup(userDismissed = false) {
        if (this.popupElement) {
            this.popupElement.classList.remove('active');
        }
        
        // Don't stop recurring popups when user dismisses
        // Popup will continue to show every 30 seconds
    }

    hijackConsultationButtons() {
        // Only select buttons with popup-trigger class - be more specific
        const popupButtons = document.querySelectorAll('.popup-trigger');
        
        popupButtons.forEach(button => {
            // Don't remove href, just prevent default on click
            button.style.cursor = 'pointer';
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPopup();
            }, { passive: false });
        });
    }
}

// ===== FORM VALIDATION =====
class FormValidator {
    constructor() {
        this.emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        this.init();
    }

    init() {
        this.resetFormsOnLoad();
        this.bindValidationEvents();
    }

    resetFormsOnLoad() {
        const allInputs = document.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            input.style.borderColor = '';
            input.setCustomValidity('');
            input.title = '';
            input.classList.remove('invalid', 'error', 'valid');

            // Temporarily remove validation attributes
            if (input.hasAttribute('required')) {
                input.setAttribute('data-required', 'true');
                input.removeAttribute('required');
            }
            if (input.hasAttribute('pattern')) {
                input.setAttribute('data-pattern', input.getAttribute('pattern'));
                input.removeAttribute('pattern');
            }
        });

        // Reset forms (except after successful submission)
        const allForms = document.querySelectorAll('form');
        allForms.forEach(form => {
            if (!window.location.search.includes('success') && !document.referrer.includes('formsubmit')) {
                form.reset();
            }
        });

        // Restore validation attributes after brief delay
        setTimeout(() => {
            allInputs.forEach(input => {
                if (input.hasAttribute('data-required')) {
                    input.setAttribute('required', 'true');
                    input.removeAttribute('data-required');
                }
                if (input.hasAttribute('data-pattern')) {
                    input.setAttribute('pattern', input.getAttribute('data-pattern'));
                    input.removeAttribute('data-pattern');
                }
            });
        }, 100);
    }

    bindValidationEvents() {
        // Clear validation styling on focus/input
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.clearValidationStyling(e.target);
            }
        }, true);

        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                if (e.target.style.borderColor === 'rgb(255, 68, 68)' || e.target.style.borderColor === '#ff4444') {
                    this.clearValidationStyling(e.target);
                }
            }
        });

        // Email validation
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input[type="email"]')) {
                this.validateEmail(e.target);
            }
        }, true);

        // Phone validation
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="tel"]')) {
                // Remove non-digit characters
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target.matches('input[type="tel"]')) {
                this.validatePhoneNumber(e.target);
            }
        }, true);

        // Country code change
        document.addEventListener('change', (e) => {
            if (e.target.matches('.country-code')) {
                const phoneInput = e.target.closest('form').querySelector('input[type="tel"]');
                if (phoneInput && phoneInput.value) {
                    this.validatePhoneNumber(phoneInput);
                }
            }
        });

        // Form submission validation
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                this.validateForm(e);
            }
        });
    }

    clearValidationStyling(element) {
        element.style.borderColor = '';
        element.setCustomValidity('');
        element.title = '';
    }

    validateEmail(emailInput) {
        const email = emailInput.value;
        if (email && !this.emailRegex.test(email)) {
            emailInput.style.borderColor = '#ff4444';
            emailInput.setCustomValidity('Please enter a valid email address');
        } else {
            this.clearValidationStyling(emailInput);
        }
    }

    validatePhoneNumber(phoneInput) {
        const phone = phoneInput.value;
        const countrySelect = phoneInput.closest('form').querySelector('.country-code');
        const countryCode = countrySelect ? countrySelect.value : '+91';
        
        let isValid = true;
        let errorMessage = '';
        
        if (phone) {
            if (countryCode === '+91' && phone.length !== 10) {
                isValid = false;
                errorMessage = 'Please enter exactly 10 digits for Indian phone number';
            } else if (countryCode === '+971' && phone.length !== 9) {
                isValid = false;
                errorMessage = 'Please enter exactly 9 digits for UAE phone number';
            }
        }
        
        if (!isValid) {
            phoneInput.style.borderColor = '#ff4444';
            phoneInput.setCustomValidity(errorMessage);
            phoneInput.title = errorMessage;
        } else {
            this.clearValidationStyling(phoneInput);
        }
    }

    validateForm(e) {
        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const phoneInput = form.querySelector('input[type="tel"]');
        
        let isValid = true;
        
        // Check email
        if (emailInput && emailInput.value) {
            if (!this.emailRegex.test(emailInput.value)) {
                this.validateEmail(emailInput);
                isValid = false;
            }
        }
        
        // Check phone
        if (phoneInput && phoneInput.value) {
            this.validatePhoneNumber(phoneInput);
            if (phoneInput.style.borderColor === '#ff4444') {
                isValid = false;
            }
        }
        
        if (!isValid) {
            e.preventDefault();
            return false;
        }
        
        // If validation passes, form will submit normally to FormSubmit
        // Add loading state to submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
        }
        
        // Form will redirect to FormSubmit automatically
        return true;
    }
}

// ===== AGENCIES SLIDER =====
class AgenciesSlider {
    constructor() {
        this.slider = document.querySelector('.agencies-slider');
        this.prevBtn = document.querySelector('.slider-btn.prev');
        this.nextBtn = document.querySelector('.slider-btn.next');
        this.scrollAmount = 240; // Width of one agency item + gap
        
        if (this.slider && this.prevBtn && this.nextBtn) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.updateButtonStates();
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => {
            this.slider.scrollBy({
                left: -this.scrollAmount,
                behavior: 'smooth'
            });
        });

        this.nextBtn.addEventListener('click', () => {
            this.slider.scrollBy({
                left: this.scrollAmount,
                behavior: 'smooth'
            });
        });

        // Update button states on scroll
        this.slider.addEventListener('scroll', debounce(() => {
            this.updateButtonStates();
        }, 100));

        window.addEventListener('resize', debounce(() => {
            this.updateButtonStates();
        }, 250));
    }

    updateButtonStates() {
        const maxScroll = this.slider.scrollWidth - this.slider.clientWidth;
        this.prevBtn.disabled = this.slider.scrollLeft <= 0;
        this.nextBtn.disabled = this.slider.scrollLeft >= maxScroll;
    }
}

// ===== MOBILE NAVIGATION =====
class MobileNavigation {
    constructor() {
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.mobileSidebar = document.getElementById('mobile-sidebar');
        this.mobileOverlay = document.getElementById('mobile-sidebar-overlay');
        this.dropdownTriggers = document.querySelectorAll('.mobile-dropdown-trigger');
        
        if (this.mobileToggle && this.mobileSidebar) {
            this.init();
        }
    }

    init() {
        // Toggle sidebar
        this.mobileToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Close sidebar when clicking overlay
        this.mobileOverlay.addEventListener('click', () => {
            this.closeSidebar();
        });

        // Handle dropdown menus in sidebar
        this.dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const dropdownId = 'mobile-' + trigger.dataset.dropdown;
                const dropdown = document.getElementById(dropdownId);
                
                if (dropdown) {
                    // Close other dropdowns
                    document.querySelectorAll('.mobile-dropdown').forEach(d => {
                        if (d !== dropdown) {
                            d.classList.remove('active');
                        }
                    });
                    
                    // Toggle current dropdown
                    dropdown.classList.toggle('active');
                }
            });
        });

        // Close sidebar when clicking internal links
        const sidebarLinks = this.mobileSidebar.querySelectorAll('a:not(.mobile-dropdown-trigger)');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeSidebar();
            });
        });
    }

    toggleSidebar() {
        this.mobileSidebar.classList.toggle('active');
        this.mobileOverlay.classList.toggle('active');
        this.mobileToggle.classList.toggle('active');
        document.body.style.overflow = this.mobileSidebar.classList.contains('active') ? 'hidden' : '';
    }

    closeSidebar() {
        this.mobileSidebar.classList.remove('active');
        this.mobileOverlay.classList.remove('active');
        this.mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== DROPDOWN MENUS =====
class DropdownMenus {
    constructor() {
        this.dropdownToggle = document.querySelector('.dropdown-toggle');
        if (this.dropdownToggle) {
            this.init();
        }
    }

    init() {
        this.dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = this.dropdownToggle.nextElementSibling;
            if (dropdown) {
                dropdown.classList.toggle('show');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-toggle')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    }
}

// ===== SMOOTH SCROLLING =====
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }
}

// ===== INITIALIZATION =====
class App {
    constructor() {
        this.components = [];
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        // Initialize all components
        const popupManager = new PopupManager();
        
        this.components.push(
            popupManager,
            new FormValidator(),
            new AgenciesSlider(),
            new MobileNavigation(),
            new DropdownMenus(),
            new SmoothScroll()
        );

        console.log('All Zone Corporate - JavaScript initialized successfully');
    }

    // Cleanup method for SPA scenarios
    destroy() {
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
    }
}

// Initialize the application
new App();

