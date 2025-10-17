(function(){
  function speak(text, opts={}){
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = opts.lang || 'es-AR';
      utter.rate = opts.rate || 1;
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
})();
