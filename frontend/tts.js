(function(){
  function speak(text, opts={}){
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = opts.lang || 'es-AR';
      utter.rate = opts.rate || 0.9;
      utter.pitch = opts.pitch || 1;
      speechSynthesis.speak(utter);
    } catch(e){
      console.error('TTS error:', e);
    }
  }
  
  window.ttsSpeakById = function(id){
    const el = document.getElementById(id);
    if (!el) return;
    const text = (el.innerText || el.textContent || '').trim();
    speak(text);
  }
  
  window.ttsSpeakText = function(text){
    speak(String(text||'').trim());
  }
  
  // Función auxiliar para crear un botón de audio
  window.ttsCreateButton = function(text, options = {}) {
    const {
      size = 'w-7 h-7',
      className = '',
      ariaLabel = 'Escuchar texto',
      position = 'inline'
    } = options;
    
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `inline-flex items-center justify-center ${size} rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 ${className}`;
    button.innerHTML = '🔊';
    button.setAttribute('aria-label', ariaLabel);
    button.setAttribute('title', ariaLabel);
    
    button.onclick = function(e) {
      e.stopPropagation();
      const textToSpeak = typeof text === 'function' ? text() : (text || '').trim();
      if (textToSpeak) {
        speak(textToSpeak);
      }
    };
    
    return button;
  }
  
  // Función para agregar botón de audio a un elemento
  window.ttsAddButtonToElement = function(element, textOrSelector, options = {}) {
    if (!element) return null;
    
    const text = typeof textOrSelector === 'string' && textOrSelector.startsWith('#') 
      ? () => {
          const target = document.querySelector(textOrSelector);
          return target ? (target.innerText || target.textContent || '').trim() : '';
        }
      : typeof textOrSelector === 'function' 
      ? textOrSelector
      : () => (element.innerText || element.textContent || '').trim();
    
    const button = window.ttsCreateButton(text, {
      size: options.size || 'w-6 h-6',
      className: options.className || 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      ariaLabel: options.ariaLabel || 'Escuchar texto',
      ...options
    });
    
    // Agregar el botón al elemento
    if (options.position === 'before') {
      element.parentNode?.insertBefore(button, element);
    } else if (options.position === 'after') {
      element.parentNode?.insertBefore(button, element.nextSibling);
    } else {
      // Inline - agregar junto al elemento
      if (element.parentNode) {
        const wrapper = document.createElement('span');
        wrapper.className = 'inline-flex items-center gap-2';
        element.parentNode.replaceChild(wrapper, element);
        wrapper.appendChild(element);
        wrapper.appendChild(button);
      }
    }
    
    return button;
  }
})();
