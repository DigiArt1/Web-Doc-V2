// Función para animaciones de entrada al hacer scroll
function handleScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in-section, .social-icon');
    
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
        const servicioSection = document.querySelector('.servicio-section');
        if (servicioSection) {
            servicioSection.classList.add('visible');
        }
    }, 300);
});
