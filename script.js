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
        const windowHeight = window.innerHeight;
        const scrollPercentage = (scrollTop / windowHeight) * 100;
        
        // Transition to liquid glass at 15% scroll
        if (scrollPercentage >= 15) {
            this.navbar.classList.add('scrolled');
            this.navMenu.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
            this.navMenu.classList.remove('scrolled');
        }

        this.lastScrollTop = scrollTop;
    }
}

// Form Handler Class
class FormHandler {
    constructor() {
        // Support both quote-form (homepage) and contact-form (contact page)
        this.form = document.getElementById('quote-form') || document.getElementById('contact-form');
        if (!this.form) return;
        
        this.submitButton = this.form.querySelector('.form-submit');
        if (!this.submitButton) return;
        
        this.originalButtonText = this.submitButton.textContent;
        
        this.init();
    }

    init() {
        if (!this.form) return;
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
            // Collect form data
            const formData = this.collectFormData();
            
            // Send to backend
            await this.sendQuoteRequest(formData);
            
            // Success
            this.showMessage('Thank you! We\'ll get back to you soon.', 'success');
            this.form.reset();
            this.clearAllValidationStates();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('Something went wrong. Please try again or call us at (305) 766-5526.', 'error');
        } finally {
            // Reset button
            this.submitButton.disabled = false;
            this.submitButton.textContent = this.originalButtonText;
        }
    }

    collectFormData() {
        const formData = {};
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                formData[input.name] = input.value.trim();
            }
        });
        
        return formData;
    }

    async sendQuoteRequest(formData) {
        const response = await fetch('/api/send-quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('API Error Details:', responseData);
            throw new Error(responseData.error || 'Failed to send quote request');
        }

        return responseData;
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

// Testimonial Carousel Manager Class
class TestimonialCarouselManager {
    constructor() {
        this.carousel = document.querySelector('.testimonial-carousel');
        this.slides = document.querySelectorAll('.testimonial-slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.currentSlide = 0;
        this.autoSlideInterval = null;
        
        this.init();
    }

    init() {
        if (!this.carousel) return;
        
        this.setupEventListeners();
        this.startAutoSlide();
    }

    setupEventListeners() {
        // Previous button
        this.prevBtn.addEventListener('click', () => {
            this.goToSlide(this.currentSlide - 1);
            this.resetAutoSlide();
        });

        // Next button
        this.nextBtn.addEventListener('click', () => {
            this.goToSlide(this.currentSlide + 1);
            this.resetAutoSlide();
        });

        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.resetAutoSlide();
            });
        });

        // Pause auto-slide on hover
        this.carousel.addEventListener('mouseenter', () => {
            this.stopAutoSlide();
        });

        this.carousel.addEventListener('mouseleave', () => {
            this.startAutoSlide();
        });
    }

    goToSlide(slideIndex) {
        // Handle wraparound
        if (slideIndex >= this.slides.length) {
            slideIndex = 0;
        } else if (slideIndex < 0) {
            slideIndex = this.slides.length - 1;
        }

        // Remove active class from current slide and dot
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');

        // Add active class to new slide and dot
        this.currentSlide = slideIndex;
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }

    startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
            this.goToSlide(this.currentSlide + 1);
        }, 5000); // Change slide every 5 seconds
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    resetAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }
}

// Main Application Class
class TickTockPlumbingApp {
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
            this.components.testimonialCarousel = new TestimonialCarouselManager();

            // Add loading complete class
            document.body.classList.add('loaded');

            console.log('TickTock Plumbing website initialized successfully');
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
const app = new TickTockPlumbingApp();

// Export for potential external use
window.TickTockPlumbingApp = app;
