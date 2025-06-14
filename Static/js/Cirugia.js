document.addEventListener('DOMContentLoaded', function() {
    // Función para manejar las animaciones de fade-in
    function handleScrollAnimation() {
        // Manejar secciones generales
        const sections = document.querySelectorAll('.fade-in-section');
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight * 0.75) {
                section.classList.add('is-visible');
            }
        });

        // Manejar iconos sociales de forma secuencial
        const socialSection = document.querySelector('.social-section');
        if (socialSection) {
            const sectionTop = socialSection.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight * 0.75) {
                const socialIcons = document.querySelectorAll('.social-icon');
                socialIcons.forEach((icon, index) => {
                    setTimeout(() => {
                        icon.classList.add('is-visible');
                    }, 200 * (index + 1)); // Aumentamos el delay entre cada icono
                });
            }
        }
    }

    // Escuchar el evento scroll
    window.addEventListener('scroll', handleScrollAnimation);
    // Ejecutar una vez al cargar la página
    handleScrollAnimation();

    // Función para manejar el clic en el botón de contacto
    function handleContactClick(cirugia) {
        const mensaje = encodeURIComponent(`Hola, me gustaría obtener más información sobre la cirugía de ${cirugia}.`);
        const whatsappUrl = `https://wa.me/+573188042578?text=${mensaje}`; // Reemplazar con el número real
        window.open(whatsappUrl, '_blank');
    }

    // Agregar event listeners a todos los botones de contacto
    const contactButtons = document.querySelectorAll('.contactar-btn');
    contactButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const cirugia = this.getAttribute('data-cirugia');
            handleContactClick(cirugia);
        });
    });
});
