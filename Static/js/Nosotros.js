/* Scripts Nosotros */

// Función para animaciones de entrada al hacer scroll
function handleScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in-section, .fade-in-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar animaciones de scroll
    handleScrollAnimations();
    
    // Animación inicial de la sección principal
    setTimeout(() => {
        const nosotrosSection = document.querySelector('.nosotros-section');
        if (nosotrosSection) {
            nosotrosSection.classList.add('visible');
        }
    }, 300);
});

// Smooth scroll para enlaces internos
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

// Efecto hover para los iconos de servicios
document.addEventListener('DOMContentLoaded', function() {
    const servicioItems = document.querySelectorAll('.servicio-item');
    
    servicioItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

