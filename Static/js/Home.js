/* Scripts Home */
// Funcionalidad del Carrusel
class Carousel {
    constructor() {
        this.slides = [];
        this.currentSlide = 0;
        this.slidesContainer = document.getElementById('carouselSlides');
        this.indicatorsContainer = document.getElementById('carouselIndicators');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.autoSlideInterval = null;
        this.autoSlideDelay = 5000; // 5 segundos
        
        this.init();
    }

    init() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Auto-slide
        this.startAutoSlide();
        
        // Pausar auto-slide al hover
        const carousel = document.querySelector('.carousel');
        carousel.addEventListener('mouseenter', () => this.stopAutoSlide());
        carousel.addEventListener('mouseleave', () => this.startAutoSlide());
    }

    addSlide(type, src, content = '') {
        const slide = {
            type: type, // 'image' o 'video'
            src: src,
            content: content
        };
        
        this.slides.push(slide);
        this.renderSlides();
        this.renderIndicators();
        this.updateCarousel();
    }

    renderSlides() {
        this.slidesContainer.innerHTML = '';
        
        this.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'carousel-slide';
            
            let mediaElement = '';
            if (slide.type === 'image') {
                mediaElement = `<img src="${slide.src}" alt="Slide ${index + 1}">`;
            } else if (slide.type === 'video') {
                mediaElement = `<video src="${slide.src}" autoplay muted loop playsinline></video>`;
            }
            
            slideElement.innerHTML = `
                ${mediaElement}
                <div class="carousel-overlay"></div>
                <div class="carousel-content">
                    ${slide.content}
                </div>
            `;
            
            this.slidesContainer.appendChild(slideElement);
        });
    }

    renderIndicators() {
        this.indicatorsContainer.innerHTML = '';
        
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            if (index === this.currentSlide) {
                indicator.classList.add('active');
            }
            
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(indicator);
        });
    }

    updateCarousel() {
        if (this.slides.length === 0) return;
        
        const translateX = -this.currentSlide * 100;
        this.slidesContainer.style.transform = `translateX(${translateX}%)`;
        
        // Actualizar indicadores
        const indicators = this.indicatorsContainer.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    nextSlide() {
        if (this.slides.length === 0) return;
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateCarousel();
    }

    prevSlide() {
        if (this.slides.length === 0) return;
        this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.updateCarousel();
    }

    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentSlide = index;
            this.updateCarousel();
        }
    }

    startAutoSlide() {
        this.stopAutoSlide();
        if (this.slides.length > 1) {
            this.autoSlideInterval = setInterval(() => {
                this.nextSlide();
            }, this.autoSlideDelay);
        }
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    // Método para eliminar todas las slides
    clearSlides() {
        this.slides = [];
        this.currentSlide = 0;
        this.renderSlides();
        this.renderIndicators();
        this.stopAutoSlide();
    }
}

// Inicializar el carrusel
const carousel = new Carousel();

// Ejemplo de cómo agregar slides (puedes usar estas funciones):
carousel.addSlide('video', '../Imagenes/1videocarrusel.mp4');
carousel.addSlide('image', '../Imagenes/Carrusel2.png');
carousel.addSlide('image', '../Imagenes/Carrusel3.png');
carousel.addSlide('image', '../Imagenes/Carrusel4.png');
carousel.addSlide('image', '../Imagenes/2.png');
carousel.addSlide('image', '../Imagenes/2.png');
// carousel.addSlide('video', '../Videos/video1.mp4', '<h2>Video Título</h2>');

         // Hacer disponible globalmente para agregar slides desde otros scripts
 window.carousel = carousel;

 // Animaciones Fade-in al hacer scroll
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

 // Observar todas las secciones y tarjetas con fade-in
 document.addEventListener('DOMContentLoaded', () => {
     const fadeElements = document.querySelectorAll('.fade-in-section, .fade-in-card');
     fadeElements.forEach(element => {
         observer.observe(element);
     });
 });