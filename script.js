// Navigation Manager Class
class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.lastScrollTop = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleScroll();
    }

    setupEventListeners() {
        // Mobile menu toggle
        this.navToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Handle scroll events
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Enhanced liquid glass effect on scroll
        if (scrollTop > 50) {
            this.navbar.style.background = 'linear-gradient(135deg, rgba(26, 43, 32, 0.25) 0%, rgba(63, 78, 64, 0.2) 100%)';
            this.navbar.style.backdropFilter = 'blur(25px) saturate(200%)';
            this.navbar.style.boxShadow = '0 12px 40px rgba(26, 43, 32, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(26, 43, 32, 0.2)';
        } else {
            this.navbar.style.background = 'linear-gradient(135deg, rgba(26, 43, 32, 0.15) 0%, rgba(63, 78, 64, 0.1) 100%)';
            this.navbar.style.backdropFilter = 'blur(20px) saturate(180%)';
            this.navbar.style.boxShadow = '0 8px 32px rgba(26, 43, 32, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(26, 43, 32, 0.1)';
        }

        this.lastScrollTop = scrollTop;
    }
}

// Form Handler Class
class FormHandler {
    constructor() {
        this.form = document.getElementById('quote-form');
        this.submitButton = this.form.querySelector('.form-submit');
        this.originalButtonText = this.submitButton.textContent;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupValidation();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    setupValidation() {
        // Add custom validation styles
        const style = document.createElement('style');
        style.textContent = `
            .form-group.error input,
            .form-group.error select,
            .form-group.error textarea {
                border-color: #ef4444;
                box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
            }
            
            .form-group.success input,
            .form-group.success select,
            .form-group.success textarea {
                border-color: var(--brand-200);
                box-shadow: 0 0 0 4px rgba(126, 138, 109, 0.1);
            }
            
            .error-message {
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: block;
            }
        `;
        document.head.appendChild(style);
    }

    validateField(field) {
        const formGroup = field.closest('.form-group');
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Validation rules
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'tel':
                const phoneRegex = /^[\d\s\-\(\)\+]+$/;
                if (!phoneRegex.test(value) || value.length < 10) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
            default:
                if (field.hasAttribute('required') && !value) {
                    isValid = false;
                    errorMessage = 'This field is required';
                }
        }

        // Update UI
        if (isValid && value) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
        } else if (!isValid) {
            formGroup.classList.remove('success');
            formGroup.classList.add('error');
            
            const errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            formGroup.appendChild(errorElement);
        } else {
            formGroup.classList.remove('error', 'success');
        }

        return isValid;
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error');
        
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            this.showMessage('Please fix the errors above', 'error');
            return;
        }

        // Show loading state
        this.submitButton.disabled = true;
        this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            // Simulate API call
            await this.simulateFormSubmission();
            
            // Success
            this.showMessage('Thank you! We\'ll get back to you soon.', 'success');
            this.form.reset();
            this.clearAllValidationStates();
            
        } catch (error) {
            this.showMessage('Something went wrong. Please try again.', 'error');
        } finally {
            // Reset button
            this.submitButton.disabled = false;
            this.submitButton.textContent = this.originalButtonText;
        }
    }

    simulateFormSubmission() {
        return new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
    }

    showMessage(message, type) {
        // Remove existing message
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Add styles for message
        const styles = {
            padding: '1rem',
            borderRadius: '0.5rem',
            marginTop: '1rem',
            textAlign: 'center',
            fontWeight: '500'
        };

        if (type === 'success') {
            styles.backgroundColor = 'rgba(126, 138, 109, 0.1)';
            styles.color = 'var(--brand-400)';
            styles.border = '1px solid var(--brand-200)';
        } else {
            styles.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            styles.color = '#ef4444';
            styles.border = '1px solid #ef4444';
        }

        Object.assign(messageElement.style, styles);
        this.form.appendChild(messageElement);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }

    clearAllValidationStates() {
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            const errorMessage = group.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    }
}

// Scroll Animation Manager Class
class ScrollAnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.addAnimationClasses();
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, this.observerOptions);
    }

    addAnimationClasses() {
        // Add animation classes to elements
        const animatedElements = document.querySelectorAll(`
            .service-card,
            .service-card-detailed,
            .project-card,
            .gallery-item,
            .testimonial-card,
            .about-text,
            .about-image
        `);

        animatedElements.forEach((element, index) => {
            element.classList.add('fade-in');
            element.style.transitionDelay = `${index * 0.1}s`;
            this.observer.observe(element);
        });
    }
}

// Smooth Scroll Manager Class
class SmoothScrollManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScroll();
    }

    setupSmoothScroll() {
        // Handle navigation link clicks
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip empty or just hash links
                if (href === '#' || href === '') {
                    return;
                }

                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    this.scrollToElement(targetElement);
                }
            });
        });
    }

    scrollToElement(element) {
        const offsetTop = element.offsetTop - 80; // Account for fixed navbar
        
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Project Gallery Manager Class
class ProjectGalleryManager {
    constructor() {
        this.projectCards = document.querySelectorAll('.project-card, .gallery-item');
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.projectCards.forEach(card => {
            card.addEventListener('click', () => {
                this.handleCardClick(card);
            });
        });
    }

    handleCardClick(card) {
        // Add click animation
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // You can add more functionality here like opening a modal
        console.log('Project card clicked:', card);
    }
}

// Utility Functions
class Utils {
    static debounce(func, wait) {
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

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

// Main Application Class
class VertexPlumbingApp {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize all components
            this.components.navigation = new NavigationManager();
            this.components.form = new FormHandler();
            this.components.scrollAnimation = new ScrollAnimationManager();
            this.components.smoothScroll = new SmoothScrollManager();
            this.components.projectGallery = new ProjectGalleryManager();

            // Add loading complete class
            document.body.classList.add('loaded');

            console.log('Vertex Plumbing website initialized successfully');
        } catch (error) {
            console.error('Error initializing website components:', error);
        }
    }

    // Public method to get component instances
    getComponent(name) {
        return this.components[name];
    }
}

// Initialize the application
const app = new VertexPlumbingApp();

// Export for potential external use
window.VertexPlumbingApp = app;
