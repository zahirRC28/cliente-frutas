import { useState } from 'react';

export const InputMensaje = ({ onSend, startTyping, stopTyping }) => {
  const [texto, setTexto] = useState('');

  const enviar = () => {
    if (texto.trim() === '') return;
    onSend(texto);
    setTexto('');
    stopTyping(); // Detener typing al enviar
  };

  const handleChange = (e) => {
    setTexto(e.target.value);
    if (startTyping) startTyping();
    if (stopTyping) {
      // Detener typing si no escribe por 1.5s
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => stopTyping(), 1500);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') enviar();
  };

  return (
    <div className="input-mensaje">
      <input
        type="text"
        value={texto}
        onChange={handleChange}
        onKeyDown={handleKey}
        placeholder="Escribe un mensaje..."
      />
      <button onClick={enviar}>Enviar</button>
    </div>
  );
};


