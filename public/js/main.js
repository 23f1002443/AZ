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
        let hasInteracted = false;
        
        // OPTIMIZED: Show popup after user scrolls (Zero CLS impact)
        const showPopupAfterInteraction = () => {
            if (hasInteracted) return;
            hasInteracted = true;
            
            // Small delay to feel natural
            setTimeout(() => {
                this.showPopup();
                this.startRecurringPopups();
            }, 2000);
        };
        
        // Trigger on scroll (Google doesn't measure CLS after scroll)
        const scrollHandler = () => {
            showPopupAfterInteraction();
            window.removeEventListener('scroll', scrollHandler);
        };
        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        // Also trigger on any click (for users who don't scroll)
        document.addEventListener('click', () => {
            if (!hasInteracted) {
                hasInteracted = true;
                clearTimeout(fallbackTimer);
                setTimeout(() => {
                    this.showPopup();
                    this.startRecurringPopups();
                }, 1000);
            }
        }, { once: true, passive: true });
        
        // Fallback: Show after 15 seconds if no interaction
        const fallbackTimer = setTimeout(() => {
            if (!hasInteracted) {
                // Wait for fonts to load before showing
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => {
                        showPopupAfterInteraction();
                    });
                } else {
                    showPopupAfterInteraction();
                }
            }
        }, 15000);
    }

    startRecurringPopups() {
        // Clear any existing interval first
        if (this.popupInterval) {
            clearInterval(this.popupInterval);
        }
        
        // Start interval for subsequent popups (every 50 seconds)
        this.popupInterval = setInterval(() => {
            this.showPopup();
        }, 60000);
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
        
        popupButtons.forEach((button, index) => {
            // Don't remove href, just prevent default on click
            button.style.cursor = 'pointer';
            button.style.position = 'relative';
            button.style.zIndex = '10000';
            button.style.pointerEvents = 'auto';
            button.style.touchAction = 'manipulation';
            
            // Add both click and touchstart for mobile
            const showPopupHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showPopup();
            };
            
            button.addEventListener('click', showPopupHandler, { passive: false });
            button.addEventListener('touchstart', showPopupHandler, { passive: false });
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
        this.prevBtn = document.querySelector('.slider-btn.prev-btn');
        this.nextBtn = document.querySelector('.slider-btn.next-btn');
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
        // OPTIMIZED: Batch all DOM reads together to prevent forced reflow
        const scrollLeft = this.slider.scrollLeft;
        const scrollWidth = this.slider.scrollWidth;
        const clientWidth = this.slider.clientWidth;
        
        // Now do the writes
        const maxScroll = scrollWidth - clientWidth;
        this.prevBtn.disabled = scrollLeft <= 0;
        this.nextBtn.disabled = scrollLeft >= maxScroll;
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

// ===== NAVBAR SCROLL BEHAVIOR =====
class NavbarScroll {
    constructor() {
        this.navbar = document.querySelector('.sleek-header');
        this.lastScrollTop = 0;
        this.scrollThreshold = 10; // Minimum scroll distance to trigger
        this.navbarHeight = 0;
        
        if (this.navbar) {
            this.init();
        }
    }

    init() {
        // Get navbar height
        this.navbarHeight = this.navbar.offsetHeight;
        console.log('NavbarScroll initialized, height:', this.navbarHeight);
        
        // Bind scroll event with debouncing for performance
        window.addEventListener('scroll', debounce(() => {
            this.handleScroll();
        }, 10), { passive: true });
    }

    handleScroll() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Don't hide navbar when at top of page
        if (currentScrollTop <= this.navbarHeight) {
            this.showNavbar();
            this.lastScrollTop = currentScrollTop;
            return;
        }
        
        // Check scroll direction
        if (Math.abs(currentScrollTop - this.lastScrollTop) < this.scrollThreshold) {
            return; // Not enough scroll movement
        }
        
        if (currentScrollTop > this.lastScrollTop) {
            // Scrolling down - hide navbar

            this.hideNavbar();
        } else {
            // Scrolling up - show navbar

            this.showNavbar();
        }
        
        this.lastScrollTop = currentScrollTop;
    }

    hideNavbar() {
        this.navbar.style.transform = `translateY(-${this.navbarHeight}px)`;
    }

    showNavbar() {
        this.navbar.style.transform = 'translateY(0)';
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
            new PromotionalSlider(),
            new MobileNavigation(),
            new DropdownMenus(),
            new NavbarScroll(),
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

// ===== PROMOTIONAL OFFERS SLIDER =====
function clamp(n, min, max) { return Math.max(min, Math.min(n, max)); }

class PromotionalSlider {
    constructor() {
        this.slider = document.querySelector('.offers-slider');
        this.prevBtn = document.querySelector('.offers-prev');
        this.nextBtn = document.querySelector('.offers-next');
        if (this.slider && this.prevBtn && this.nextBtn) {
            this.init();
        }
    }

    init() {
        // We rely on clientWidth so ensure images have loaded where possible
        this.bindEvents();
        this.updateButtonStates();
        window.addEventListener('resize', debounce(() => this.updateButtonStates(), 200));
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.scrollBy(-1));
        this.nextBtn.addEventListener('click', () => this.scrollBy(1));

        // Allow swipe/drag on touch devices by tracking pointer
        let isDown = false, startX = 0, scrollLeft = 0;
        this.slider.addEventListener('pointerdown', (e) => {
            isDown = true;
            startX = e.pageX - this.slider.offsetLeft;
            scrollLeft = this.slider.scrollLeft;
            this.slider.setPointerCapture(e.pointerId);
        });

        this.slider.addEventListener('pointermove', (e) => {
            if (!isDown) return;
            const x = e.pageX - this.slider.offsetLeft;
            const walk = (startX - x);
            this.slider.scrollLeft = scrollLeft + walk;
        });

        this.slider.addEventListener('pointerup', (e) => { isDown = false; this.updateButtonStates(); });
        this.slider.addEventListener('pointercancel', (e) => { isDown = false; this.updateButtonStates(); });

        this.slider.addEventListener('scroll', debounce(() => this.updateButtonStates(), 100));
    }

    scrollBy(direction) {
        // direction: 1 => next, -1 => prev
        // OPTIMIZED: Batch all reads before any writes to prevent forced reflow
        const width = this.slider.clientWidth;
        const currentScroll = this.slider.scrollLeft;
        
        // Now do the write
        const target = currentScroll + direction * width;
        this.slider.scrollTo({ left: target, behavior: 'smooth' });
        
        // update after short delay
        setTimeout(() => this.updateButtonStates(), 300);
    }

    updateButtonStates() {
        // OPTIMIZED: Batch all DOM reads together to prevent forced reflow
        const scrollLeft = this.slider.scrollLeft;
        const scrollWidth = this.slider.scrollWidth;
        const clientWidth = this.slider.clientWidth;
        
        // Now do the writes
        const max = scrollWidth - clientWidth;
        this.prevBtn.disabled = scrollLeft <= 1;
        this.nextBtn.disabled = scrollLeft >= max - 1;
    }
}

