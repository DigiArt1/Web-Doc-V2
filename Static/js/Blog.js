document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la primera sección como activa
    const firstSection = document.querySelector('.blog-cards');
    if (firstSection) {
        firstSection.classList.add('active');
    }

    // Manejar la navegación entre secciones
    const navButtons = document.querySelectorAll('.blog-nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase activa de todos los botones
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase activa al botón clickeado
            this.classList.add('active');

            // Mostrar la sección correspondiente
            const targetSection = this.getAttribute('data-section');
            const sections = document.querySelectorAll('.blog-cards');
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.getAttribute('data-section') === targetSection) {
                    section.classList.add('active');
                    // Reiniciar las animaciones de las tarjetas
                    initializeCardAnimations(section);
                    // Reiniciar la paginación
                    resetPagination(section);
                }
            });
        });
    });

    // Manejar la paginación
    const paginationButtons = document.querySelectorAll('.pagination-button');
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.closest('.blog-cards');
            const page = this.getAttribute('data-page');
            
            // Actualizar botones de paginación
            section.querySelectorAll('.pagination-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // Actualizar páginas
            section.querySelectorAll('.blog-page').forEach(p => {
                p.classList.remove('active');
                if (p.getAttribute('data-page') === page) {
                    p.classList.add('active');
                    initializeCardAnimations(p);
                }
            });
        });
    });

    // Función para inicializar las animaciones de las tarjetas
    function initializeCardAnimations(container) {
        const cards = container.querySelectorAll('.blog-card');
        cards.forEach((card, index) => {
            card.classList.remove('visible');
            card.style.transitionDelay = `${index * 0.1}s`;
            setTimeout(() => {
                card.classList.add('visible');
            }, 100);
        });
    }

    // Función para reiniciar la paginación
    function resetPagination(section) {
        const paginationButtons = section.querySelectorAll('.pagination-button');
        const pages = section.querySelectorAll('.blog-page');
        
        paginationButtons.forEach(btn => btn.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));
        
        if (paginationButtons[0]) paginationButtons[0].classList.add('active');
        if (pages[0]) pages[0].classList.add('active');
    }

    // Inicializar las animaciones de las tarjetas de la primera sección
    initializeCardAnimations(firstSection);

    // Animaciones al hacer scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Si es la sección social, inicializar las animaciones de los iconos
                if (entry.target.classList.contains('social-section')) {
                    const socialIcons = entry.target.querySelectorAll('.social-icon');
                    socialIcons.forEach((icon, index) => {
                        setTimeout(() => {
                            icon.classList.add('visible');
                        }, index * 200); // Más delay para los iconos sociales
                    });
                }
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });
});
