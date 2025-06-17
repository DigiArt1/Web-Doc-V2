/**
 * Alfred-IA Chat Widget - Versión standalone para integrar en cualquier página web
 * Autor: Bot Alfred
 * Versión: 1.0.0
 */

(function() {
    'use strict';

    // Configuración por defecto
    const DEFAULT_CONFIG = {
        apiKey: 'AIzaSyCiZqCvJrm7he0rSRnZxtbOCTboNMNX0II',
        position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
        theme: 'default', // default, dark, minimal, pink
        autoOpen: false,
        autoRead: true, // Lectura automática activada por defecto
        voiceRate: 0.9, // Velocidad de lectura
        voicePitch: 1.0, // Tono de voz
        voiceVolume: 0.8, // Volumen
        greeting: '¡Hola! Soy Eva, tu asistente de IA. ¿En qué puedo ayudarte hoy?',
        placeholder: 'Escribe tu mensaje aquí...',
        title: 'Eva - Asistente IA'
    };

    class AlfredWidget {
        constructor(config = {}) {
            this.config = { ...DEFAULT_CONFIG, ...config };
            this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
            this.isOpen = false;
            this.isTyping = false;
            this.messageCount = 0;
            this.autoRead = this.config.autoRead;
            
            this.injectStyles();
            this.createWidget();
            this.attachEventListeners();
            this.initializeVoice();
            
            if (this.config.autoOpen) {
                setTimeout(() => this.openChat(), 1000);
            }
        }

        injectStyles() {
            const styleId = 'alfred-chat-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = this.getStyles();
            document.head.appendChild(style);

            // Cargar Font Awesome si no está presente
            if (!document.querySelector('link[href*="font-awesome"]')) {
                const fontAwesome = document.createElement('link');
                fontAwesome.rel = 'stylesheet';
                fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
                document.head.appendChild(fontAwesome);
            }
        }

        getStyles() {
            const position = this.getPositionStyles();
            const theme = this.getThemeStyles();
            
            return `
                /* Alfred Chat Widget Styles */
                .alfred-chat-button {
                    position: fixed;
                    ${position.button}
                    width: 60px;
                    height: 60px;
                    background: ${theme.primary};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 20px ${theme.shadow};
                    transition: all 0.3s ease;
                    z-index: 999999;
                    border: none;
                    outline: none;
                    animation: alfred-pulse 2s infinite;
                }

                .alfred-chat-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px ${theme.shadowHover};
                }

                .alfred-chat-button i {
                    color: white;
                    font-size: 24px;
                }

                @keyframes alfred-pulse {
                    0% { 
                        box-shadow: 0 4px 20px ${theme.shadow};
                        transform: scale(1);
                    }
                    50% { 
                        box-shadow: 0 4px 20px ${theme.shadowHover}, 0 0 30px ${theme.primaryLight}40;
                        transform: scale(1.05);
                    }
                    100% { 
                        box-shadow: 0 4px 20px ${theme.shadow};
                        transform: scale(1);
                    }
                }

                /* Efecto de resplandor adicional */
                .alfred-chat-button.alfred-glow {
                    animation: alfred-glow 2s ease-in-out infinite alternate;
                }

                @keyframes alfred-glow {
                    from {
                        box-shadow: 0 4px 20px ${theme.shadow}, 0 0 20px ${theme.primaryLight}60;
                    }
                    to {
                        box-shadow: 0 6px 25px ${theme.shadowHover}, 0 0 40px ${theme.primaryLight}80, 0 0 60px ${theme.primaryLight}40;
                    }
                }

                .alfred-chat-window {
                    position: fixed;
                    ${position.window}
                    width: 350px;
                    height: 500px;
                    background: ${theme.background};
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    display: none;
                    flex-direction: column;
                    z-index: 1000000;
                    overflow: hidden;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .alfred-chat-window.alfred-show {
                    display: flex;
                    animation: alfred-slideUp 0.3s ease;
                }

                @keyframes alfred-slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .alfred-chat-header {
                    background: ${theme.primary};
                    color: white;
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .alfred-chat-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .alfred-control-btn {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .alfred-control-btn:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }

                .alfred-control-btn.alfred-active {
                    background-color: rgba(255, 255, 255, 0.3);
                }

                .alfred-control-btn.alfred-muted {
                    opacity: 0.5;
                }

                .alfred-chat-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                    font-size: 16px;
                }

                .alfred-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 50%;
                    transition: background-color 0.3s ease;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .alfred-close-btn:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }

                .alfred-chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    background: ${theme.background};
                }

                .alfred-chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .alfred-chat-messages::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }

                .alfred-chat-messages::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                }

                .alfred-message {
                    display: flex;
                    gap: 10px;
                    max-width: 85%;
                    animation: alfred-messageSlide 0.3s ease;
                    font-size: 14px;
                }

                @keyframes alfred-messageSlide {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .alfred-user-message {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }

                .alfred-user-message .alfred-message-content {
                    background: ${theme.primary};
                    color: white;
                }

                .alfred-bot-message .alfred-message-content {
                    background: ${theme.botMessage};
                    color: ${theme.text};
                    border: 1px solid ${theme.border};
                }

                .alfred-message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    background: ${theme.primary};
                    color: white;
                    font-size: 14px;
                }

                .alfred-user-message .alfred-message-avatar {
                    background: #6B696B;
                }

                .alfred-message-content {
                    padding: 12px 16px;
                    border-radius: 18px;
                    line-height: 1.4;
                    word-wrap: break-word;
                    position: relative;
                }

                .alfred-message-actions {
                    display: flex;
                    gap: 5px;
                    margin-top: 8px;
                }

                .alfred-bot-message .alfred-message-actions {
                    opacity: 1;
                }

                .alfred-user-message .alfred-message-actions {
                    display: none;
                }

                .alfred-message:hover .alfred-message-actions {
                    opacity: 1;
                }

                .alfred-message-action-btn {
                    background: rgba(0, 0, 0, 0.1);
                    border: none;
                    border-radius: 12px;
                    padding: 4px 8px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s ease;
                    color: inherit;
                }

                .alfred-bot-message .alfred-message-action-btn {
                    background: ${theme.primaryLight}20;
                    color: ${theme.primaryLight};
                }

                .alfred-bot-message .alfred-message-action-btn:hover {
                    background: ${theme.primaryLight}30;
                }

                .alfred-user-message .alfred-message-action-btn {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .alfred-user-message .alfred-message-action-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .alfred-message-action-btn:hover {
                    transform: scale(1.05);
                }

                .alfred-message-action-btn i {
                    margin-right: 4px;
                }

                .alfred-typing-indicator {
                    display: none;
                    padding: 12px 16px;
                    background: ${theme.botMessage};
                    border-radius: 18px;
                    margin-left: 42px;
                    margin-bottom: 10px;
                    width: fit-content;
                }

                .alfred-typing-indicator.alfred-show {
                    display: block;
                }

                .alfred-typing-indicator span {
                    height: 8px;
                    width: 8px;
                    background: #999;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 5px;
                    animation: alfred-typing 1.4s infinite;
                }

                .alfred-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
                .alfred-typing-indicator span:nth-child(3) { animation-delay: 0.4s; margin-right: 0; }

                @keyframes alfred-typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                    30% { transform: translateY(-10px); opacity: 1; }
                }

                .alfred-chat-input-container {
                    padding: 15px 20px;
                    border-top: 1px solid ${theme.border};
                    background: ${theme.background};
                }

                .alfred-input-wrapper {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .alfred-chat-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid ${theme.inputBorder};
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                    background: ${theme.inputBackground};
                    color: ${theme.text};
                }

                .alfred-chat-input:focus {
                    border-color: ${theme.primaryLight};
                }

                .alfred-send-btn {
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: ${theme.primary};
                    color: white;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
                }

                .alfred-send-btn:hover {
                    transform: scale(1.1);
                }

                .alfred-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .alfred-chat-button {
                        width: 55px;
                        height: 55px;
                        bottom: 20px;
                        right: 20px;
                    }
                    
                    .alfred-chat-window {
                        bottom: 85px;
                        right: 15px;
                        left: 15px;
                        top: auto;
                        width: auto;
                        height: 70vh;
                        max-height: 500px;
                        border-radius: 15px;
                    }
                }

                @media (max-width: 480px) {
                    .alfred-chat-button {
                        width: 50px;
                        height: 50px;
                    }
                    
                    .alfred-chat-window {
                        bottom: 80px;
                        right: 10px;
                        left: 10px;
                        height: 65vh;
                        max-height: 450px;
                    }
                    
                    .alfred-message {
                        max-width: 90%;
                    }
                }

                /* Para pantallas muy pequeñas */
                @media (max-width: 360px) {
                    .alfred-chat-window {
                        height: 60vh;
                        max-height: 400px;
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }

                /* Mensaje desplegable de llamada a la acción */
                .alfred-cta-message {
                    position: fixed;
                    ${position.ctaMessage || 'bottom: 100px; right: 100px;'}
                    background: white;
                    color: #333;
                    padding: 12px 16px;
                    border-radius: 20px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    font-size: 14px;
                    font-weight: 500;
                    max-width: 250px;
                    opacity: 0;
                    transform: translateY(10px) scale(0.9);
                    transition: all 0.3s ease;
                    z-index: 999998;
                    border: 2px solid ${theme.primaryLight}20;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .alfred-cta-message.alfred-show {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    animation: alfred-bounce 0.6s ease;
                }

                .alfred-cta-message::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    right: 30px;
                    width: 0;
                    height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 8px solid white;
                }

                @keyframes alfred-bounce {
                    0% { transform: translateY(10px) scale(0.9); }
                    60% { transform: translateY(-5px) scale(1.02); }
                    100% { transform: translateY(0) scale(1); }
                }

                .alfred-cta-close {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: ${theme.primaryLight};
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .alfred-cta-close:hover {
                    background: ${theme.primaryLight};
                    transform: scale(1.1);
                }

                /* Responsive para el mensaje CTA */
                @media (max-width: 768px) {
                    .alfred-cta-message {
                        bottom: 85px;
                        right: 20px;
                        left: 20px;
                        max-width: none;
                    }
                    
                    .alfred-cta-message::after {
                        right: 50px;
                    }
                }
            `;
        }

        getPositionStyles() {
            const positions = {
                'bottom-right': {
                    button: 'bottom: 30px; right: 30px;',
                    window: 'bottom: 100px; right: 30px;',
                    ctaMessage: 'bottom: 100px; right: 100px;'
                },
                'bottom-left': {
                    button: 'bottom: 30px; left: 30px;',
                    window: 'bottom: 100px; left: 30px;',
                    ctaMessage: 'bottom: 100px; left: 100px;'
                },
                'top-right': {
                    button: 'top: 30px; right: 30px;',
                    window: 'top: 100px; right: 30px;',
                    ctaMessage: 'top: 100px; right: 100px;'
                },
                'top-left': {
                    button: 'top: 30px; left: 30px;',
                    window: 'top: 100px; left: 30px;',
                    ctaMessage: 'top: 100px; left: 100px;'
                }
            };
            return positions[this.config.position] || positions['bottom-right'];
        }

        getThemeStyles() {
            const themes = {
                default: {
                    primary: 'linear-gradient(135deg, #E3217F 0%, #E982B3 100%)',
                    primaryLight: '#E3217F',
                    background: 'white',
                    text: '#333',
                    botMessage: '#f8f9fa',
                    border: '#e9ecef',
                    inputBorder: '#ddd',
                    inputBackground: 'white',
                    shadow: 'rgba(227, 33, 127, 0.4)',
                    shadowHover: 'rgba(227, 33, 127, 0.6)'
                },
                dark: {
                    primary: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                    primaryLight: '#4a5568',
                    background: '#1a202c',
                    text: '#e2e8f0',
                    botMessage: '#2d3748',
                    border: '#4a5568',
                    inputBorder: '#4a5568',
                    inputBackground: '#2d3748',
                    shadow: 'rgba(74, 85, 104, 0.4)',
                    shadowHover: 'rgba(74, 85, 104, 0.6)'
                },
                minimal: {
                    primary: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    primaryLight: '#48bb78',
                    background: '#f7fafc',
                    text: '#2d3748',
                    botMessage: '#edf2f7',
                    border: '#e2e8f0',
                    inputBorder: '#cbd5e0',
                    inputBackground: 'white',
                    shadow: 'rgba(72, 187, 120, 0.4)',
                    shadowHover: 'rgba(72, 187, 120, 0.6)'
                },
                pink: {
                    primary: 'linear-gradient(135deg, #E3217F 0%, #E982B3 100%)',
                    primaryLight: '#E3217F',
                    background: '#FFFFFF',
                    text: '#6B696B',
                    botMessage: 'rgba(233, 130, 179, 0.1)',
                    border: 'rgba(227, 33, 127, 0.2)',
                    inputBorder: 'rgba(227, 33, 127, 0.3)',
                    inputBackground: '#FFFFFF',
                    shadow: 'rgba(227, 33, 127, 0.4)',
                    shadowHover: 'rgba(227, 33, 127, 0.6)'
                }
            };
            return themes[this.config.theme] || themes.default;
        }

        createWidget() {
            const widgetHTML = `
                <button class="alfred-chat-button alfred-glow" id="alfred-chat-button-${Date.now()}">
                    <i class="fas fa-robot"></i>
                </button>
                
                <div class="alfred-cta-message" id="alfred-cta-message-${Date.now()}">
                    <button class="alfred-cta-close">×</button>
                    ¿Necesitas ayuda? ¡Habla con nuestro asistente Alfred!
                </div>
                
                <div class="alfred-chat-window" id="alfred-chat-window-${Date.now()}">
                    <div class="alfred-chat-header">
                        <div class="alfred-chat-title">
                            <i class="fas fa-robot"></i>
                            <span>${this.config.title}</span>
                        </div>
                        <div class="alfred-chat-controls">
                            <button class="alfred-control-btn alfred-auto-read-toggle" title="Lectura automática">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <button class="alfred-close-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="alfred-chat-messages">
                        <div class="alfred-message alfred-bot-message">
                            <div class="alfred-message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="alfred-message-content">
                                ${this.config.greeting}
                            </div>
                        </div>
                    </div>
                    
                    <div class="alfred-chat-input-container">
                        <div class="alfred-typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div class="alfred-input-wrapper">
                            <input type="text" class="alfred-chat-input" placeholder="${this.config.placeholder}" maxlength="1000">
                            <button class="alfred-send-btn">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', widgetHTML);

            // Obtener referencias a los elementos
            this.chatButton = document.querySelector('.alfred-chat-button');
            this.chatWindow = document.querySelector('.alfred-chat-window');
            this.closeButton = document.querySelector('.alfred-close-btn');
            this.chatInput = document.querySelector('.alfred-chat-input');
            this.sendButton = document.querySelector('.alfred-send-btn');
            this.chatMessages = document.querySelector('.alfred-chat-messages');
            this.typingIndicator = document.querySelector('.alfred-typing-indicator');
            this.autoReadToggle = document.querySelector('.alfred-auto-read-toggle');
            this.ctaMessage = document.querySelector('.alfred-cta-message');
            this.ctaCloseButton = document.querySelector('.alfred-cta-close');
            
            // Mostrar mensaje CTA después de unos segundos
            this.showCtaMessage();
        }

        attachEventListeners() {
            this.chatButton.addEventListener('click', () => this.toggleChat());
            this.closeButton.addEventListener('click', () => this.closeChat());
            this.sendButton.addEventListener('click', () => this.sendMessage());
            
            // Cerrar mensaje CTA
            this.ctaCloseButton.addEventListener('click', () => this.hideCtaMessage());
            this.ctaMessage.addEventListener('click', () => {
                this.hideCtaMessage();
                this.openChat();
            });
            
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            this.chatInput.addEventListener('input', () => this.handleInputChange());
            
            // Control de lectura automática
            this.autoReadToggle.addEventListener('click', () => this.toggleAutoRead());

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeChat();
                }
            });
        }

        toggleChat() {
            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        }

        openChat() {
            this.isOpen = true;
            this.chatWindow.classList.add('alfred-show');
            this.chatButton.style.transform = 'scale(0.8)';
            
            // Ocultar mensaje CTA y remover efecto de resplandor
            this.hideCtaMessage();
            this.chatButton.classList.remove('alfred-glow');
            
            // Detener el intervalo cuando se abre el chat
            if (this.ctaInterval) {
                clearInterval(this.ctaInterval);
            }
            
            setTimeout(() => {
                this.chatInput.focus();
            }, 300);
            
            this.scrollToBottom();
        }

        closeChat() {
            this.isOpen = false;
            this.chatWindow.classList.remove('alfred-show');
            this.chatButton.style.transform = 'scale(1)';
            
            // Restaurar efecto de resplandor después de cerrar
            setTimeout(() => {
                this.chatButton.classList.add('alfred-glow');
            }, 1000);
            
            // Reiniciar el intervalo cuando se cierra el chat
            this.showCtaMessage();
        }

        handleInputChange() {
            const isEmpty = this.chatInput.value.trim().length === 0;
            this.sendButton.disabled = isEmpty || this.isTyping;
        }

        async sendMessage() {
            const message = this.chatInput.value.trim();
            if (!message || this.isTyping) return;

            this.chatInput.value = '';
            this.handleInputChange();
            this.addMessage(message, 'user');
            this.showTyping();

            try {
                const response = await this.callGeminiAPI(message);
                this.hideTyping();
                this.addMessage(response, 'bot');
            } catch (error) {
                this.hideTyping();
                this.addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.', 'bot');
                console.error('Alfred Chat Error:', error);
            }
        }

        async callGeminiAPI(message) {
            const requestBody = {
                contents: [{
                    parts: [{
                        text: `Eres Alfred, un asistente de IA útil y amigable. Responde de manera clara y concisa en español. 
                        Puedes ayudar con preguntas sobre la web, tecnología, consejos generales, y cualquier tema de conocimiento general.
                        Sé conversacional pero profesional. Aquí está la pregunta del usuario: ${message}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            };

            const response = await fetch(`${this.apiUrl}?key=${this.config.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Respuesta inválida de la API');
            }
        }

        addMessage(content, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `alfred-message alfred-${type}-message`;

            const avatar = document.createElement('div');
            avatar.className = 'alfred-message-avatar';
            avatar.innerHTML = type === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

            const messageContent = document.createElement('div');
            messageContent.className = 'alfred-message-content';
            messageContent.innerHTML = this.processMessageContent(content);
            
            // Crear botones de acción solo para mensajes del bot
            if (type === 'bot') {
                const messageActions = document.createElement('div');
                messageActions.className = 'alfred-message-actions';
                
                // Botón de leer
                const readBtn = document.createElement('button');
                readBtn.className = 'alfred-message-action-btn alfred-read-btn';
                readBtn.innerHTML = '<i class="fas fa-volume-up"></i>Leer';
                readBtn.addEventListener('click', () => this.readMessage(content));
                
                // Botón de copiar
                const copyBtn = document.createElement('button');
                copyBtn.className = 'alfred-message-action-btn alfred-copy-btn';
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>Copiar';
                copyBtn.addEventListener('click', () => this.copyMessage(content, copyBtn));
                
                messageActions.appendChild(readBtn);
                messageActions.appendChild(copyBtn);
                messageContent.appendChild(messageActions);
            }

            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);

            this.chatMessages.appendChild(messageDiv);
            this.scrollToBottom();
            this.messageCount++;
            
            // Lectura automática solo para mensajes del bot
            if (type === 'bot' && this.autoRead) {
                setTimeout(() => this.readMessage(content), 500);
            }
        }

        processMessageContent(content) {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            content = content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
            content = content.replace(/\n/g, '<br>');
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
            return content;
        }

        showTyping() {
            this.isTyping = true;
            this.typingIndicator.classList.add('alfred-show');
            this.sendButton.disabled = true;
            this.scrollToBottom();
        }

        hideTyping() {
            this.isTyping = false;
            this.typingIndicator.classList.remove('alfred-show');
            this.handleInputChange();
        }

        scrollToBottom() {
            setTimeout(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }, 100);
        }

        // API pública
        destroy() {
            if (this.chatButton) this.chatButton.remove();
            if (this.chatWindow) this.chatWindow.remove();
            if (this.ctaMessage) this.ctaMessage.remove();
            const styles = document.getElementById('alfred-chat-styles');
            if (styles) styles.remove();
            
            // Limpiar el intervalo al destruir el widget
            if (this.ctaInterval) {
                clearInterval(this.ctaInterval);
            }
        }

        setApiKey(apiKey) {
            this.config.apiKey = apiKey;
        }

        setGreeting(greeting) {
            this.config.greeting = greeting;
            const firstMessage = this.chatMessages.querySelector('.alfred-bot-message .alfred-message-content');
            if (firstMessage) firstMessage.textContent = greeting;
        }
        
        // Métodos para control de voz
        initializeVoice() {
            // Cargar ResponsiveVoice si no está presente
            if (typeof responsiveVoice === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://code.responsivevoice.org/responsivevoice.js?key=1qC1pvxd';
                script.onload = () => {
                    console.log('ResponsiveVoice cargado correctamente');
                    this.updateAutoReadButton();
                };
                document.head.appendChild(script);
            } else {
                console.log('ResponsiveVoice ya disponible');
                this.updateAutoReadButton();
            }
        }
        
        toggleAutoRead() {
            this.autoRead = !this.autoRead;
            this.updateAutoReadButton();
            
            // Detener cualquier lectura en curso
            if (!this.autoRead && typeof responsiveVoice !== 'undefined') {
                responsiveVoice.cancel();
            }
            
            // Mostrar notificación
            const status = this.autoRead ? 'activada' : 'desactivada';
            this.showNotification(`Lectura automática ${status}`);
        }
        
        updateAutoReadButton() {
            if (this.autoReadToggle) {
                if (this.autoRead) {
                    this.autoReadToggle.classList.add('alfred-active');
                    this.autoReadToggle.classList.remove('alfred-muted');
                    this.autoReadToggle.title = 'Desactivar lectura automática';
                } else {
                    this.autoReadToggle.classList.remove('alfred-active');
                    this.autoReadToggle.classList.add('alfred-muted');
                    this.autoReadToggle.title = 'Activar lectura automática';
                }
            }
        }
        
        readMessage(content) {
            if (typeof responsiveVoice === 'undefined') {
                console.warn('ResponsiveVoice no está disponible');
                return;
            }
            
            // Limpiar el contenido HTML y obtener solo el texto
            const cleanContent = this.cleanTextForSpeech(content);
            
            // Detener cualquier lectura anterior
            responsiveVoice.cancel();
            
            // Leer el mensaje
            responsiveVoice.speak(cleanContent, 'Spanish Female', {
                rate: this.config.voiceRate,
                pitch: this.config.voicePitch,
                volume: this.config.voiceVolume,
                onstart: () => {
                    console.log('Iniciando lectura...');
                },
                onend: () => {
                    console.log('Lectura completada');
                },
                onerror: (error) => {
                    console.error('Error en la lectura:', error);
                }
            });
        }
        
        cleanTextForSpeech(content) {
            // Remover HTML tags
            let cleanText = content.replace(/<[^>]*>/g, ' ');
            
            // Reemplazar entidades HTML comunes
            cleanText = cleanText.replace(/&nbsp;/g, ' ');
            cleanText = cleanText.replace(/&amp;/g, '&');
            cleanText = cleanText.replace(/&lt;/g, '<');
            cleanText = cleanText.replace(/&gt;/g, '>');
            cleanText = cleanText.replace(/&quot;/g, '"');
            
            // Eliminar caracteres especiales y símbolos que no deben ser leídos
            cleanText = cleanText
                .replace(/[¡!¿?]/g, '') // Eliminar signos de exclamación e interrogación
                .replace(/\*+/g, '') // Eliminar asteriscos
                .replace(/_{2,}/g, '') // Eliminar guiones bajos múltiples
                .replace(/\|/g, '') // Eliminar barras verticales
                .replace(/[""]/g, '') // Eliminar comillas especiales
                .replace(/['']/g, '') // Eliminar comillas simples especiales
                .replace(/[()[\]{}]/g, '') // Eliminar paréntesis, corchetes y llaves
                .replace(/\s+/g, ' ') // Limpiar espacios múltiples
                .trim(); // Eliminar espacios al inicio y final
            
            return cleanText;
        }
        
        async copyMessage(content, button) {
            try {
                const cleanContent = this.cleanTextForSpeech(content);
                await navigator.clipboard.writeText(cleanContent);
                
                // Cambiar temporalmente el texto del botón
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i>¡Copiado!';
                button.style.background = 'rgba(34, 197, 94, 0.2)';
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.style.background = '';
                }, 2000);
                
            } catch (error) {
                console.error('Error al copiar:', error);
                this.showNotification('No se pudo copiar el mensaje');
            }
        }
        
        showNotification(message) {
            // Crear notificación temporal
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${this.getThemeStyles().primary};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 1000001;
                animation: slideInRight 0.3s ease;
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        showCtaMessage() {
            // Mostrar mensaje cada 10 segundos si el chat no está abierto
            this.ctaInterval = setInterval(() => {
                if (!this.isOpen && this.ctaMessage && !this.ctaMessage.classList.contains('alfred-show')) {
                    this.ctaMessage.classList.add('alfred-show');
                    
                    // Auto-ocultar después de 5 segundos
                    setTimeout(() => {
                        if (this.ctaMessage && this.ctaMessage.classList.contains('alfred-show')) {
                            this.hideCtaMessage();
                        }
                    }, 5000);
                }
            }, 10000);
            
            // Mostrar el primer mensaje después de 3 segundos
            setTimeout(() => {
                if (!this.isOpen && this.ctaMessage) {
                    this.ctaMessage.classList.add('alfred-show');
                    
                    // Auto-ocultar después de 5 segundos
                    setTimeout(() => {
                        if (this.ctaMessage && this.ctaMessage.classList.contains('alfred-show')) {
                            this.hideCtaMessage();
                        }
                    }, 5000);
                }
            }, 3000);
        }

        hideCtaMessage() {
            if (this.ctaMessage) {
                this.ctaMessage.classList.remove('alfred-show');
            }
        }
    }

    // API Global
    window.AlfredChat = {
        instances: [],
        
        init: function(config = {}) {
            const instance = new AlfredWidget(config);
            this.instances.push(instance);
            return instance;
        },
        
        destroyAll: function() {
            this.instances.forEach(instance => instance.destroy());
            this.instances = [];
        }
    };

    // Auto-inicialización si hay configuración global
    if (window.alfredConfig) {
        document.addEventListener('DOMContentLoaded', function() {
            window.AlfredChat.init(window.alfredConfig);
        });
    }

})(); 
