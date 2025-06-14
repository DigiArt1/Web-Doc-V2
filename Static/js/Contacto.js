// Contacto.js - Funcionalidades de la página de contacto

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas las funcionalidades
    initializeContactForm();
    initializeAnimations();
});

// Función para manejar el formulario de contacto
function initializeContactForm() {
    const form = document.querySelector('.contacto-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener los valores del formulario
            const formData = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                servicio: document.getElementById('servicio').value,
                mensaje: document.getElementById('mensaje').value
            };
            
            // Validar formulario
            if (validateForm(formData)) {
                // Mostrar mensaje de éxito
                showSuccessMessage();
                
                // Limpiar formulario
                form.reset();
                
                // Aquí se podría enviar el formulario a un servidor
                // Por ejemplo: sendFormData(formData);
            }
        });
    }
}

// Función para validar el formulario
function validateForm(data) {
    const errors = [];
    
    // Validar nombre
    if (!data.nombre || data.nombre.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Por favor ingresa un email válido');
    }
    
    // Validar teléfono
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!data.telefono || !phoneRegex.test(data.telefono) || data.telefono.length < 7) {
        errors.push('Por favor ingresa un teléfono válido');
    }
    
    // Validar servicio
    if (!data.servicio) {
        errors.push('Por favor selecciona un servicio');
    }
    
    // Validar mensaje
    if (!data.mensaje || data.mensaje.trim().length < 10) {
        errors.push('El mensaje debe tener al menos 10 caracteres');
    }
    
    // Mostrar errores si los hay
    if (errors.length > 0) {
        showErrorMessage(errors);
        return false;
    }
    
    return true;
}

// Función para mostrar mensaje de éxito
function showSuccessMessage() {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <h4>¡Mensaje Enviado!</h4>
            <p>Gracias por contactarnos. Te responderemos pronto.</p>
        </div>
    `;
    
    // Estilos para el mensaje
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        text-align: center;
        border: 2px solid #e91e63;
    `;
    
    // Agregar al DOM
    document.body.appendChild(messageDiv);
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;
    document.body.appendChild(overlay);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        document.body.removeChild(messageDiv);
        document.body.removeChild(overlay);
    }, 3000);
}

// Función para mostrar mensaje de error
function showErrorMessage(errors) {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <h4>Error en el formulario</h4>
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Estilos para el mensaje
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        text-align: left;
        border: 2px solid #f44336;
        max-width: 400px;
    `;
    
    // Agregar al DOM
    document.body.appendChild(messageDiv);
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;
    document.body.appendChild(overlay);
    
    // Remover al hacer clic en el overlay
    overlay.addEventListener('click', () => {
        document.body.removeChild(messageDiv);
        document.body.removeChild(overlay);
    });
    
    // Remover después de 5 segundos
    setTimeout(() => {
        if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
            document.body.removeChild(overlay);
        }
    }, 5000);
}

// Función para inicializar las animaciones
function initializeAnimations() {
    // Configurar el observador de intersección para las animaciones
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observar todas las secciones con animación
    const animatedElements = document.querySelectorAll('.fade-in-section, .fade-in-card');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Función para enviar datos del formulario (ejemplo)
function sendFormData(formData) {
    // Esta función se puede usar para enviar los datos a un servidor
    console.log('Datos del formulario:', formData);
    
    // Ejemplo de envío con fetch (comentado porque no hay servidor)
    /*
    fetch('/api/contacto', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respuesta del servidor:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
    */
}

// Función para formatear el número de teléfono mientras se escribe
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('telefono');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remover todos los caracteres que no sean números
            let value = e.target.value.replace(/\D/g, '');
            
            // Formatear el número
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = value.slice(0, 3) + ' ' + value.slice(3);
                } else {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 10);
                }
            }
            
            e.target.value = value;
        });
    }
});
