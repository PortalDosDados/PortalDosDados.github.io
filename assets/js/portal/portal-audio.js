/**
 * assets/js/portal/portal-audio.js
 * Sintetizador nativo de áudio arcade (Web Audio API) para gamificação do Portal do Aluno.
 * Zero dependências externas e zero arquivos de áudio pesados.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PortalAudio = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let audioCtx = null;
  let somAtivo = true;

  function obterAudioContext() {
    if (!audioCtx && typeof window !== 'undefined' && typeof window.AudioContext !== 'undefined') {
      audioCtx = new window.AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function emitirTom(frequencia, tipo, duracao, delay, volume) {
    if (!somAtivo || typeof window === 'undefined') return;
    try {
      const ctx = obterAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + (delay || 0);
      osc.type = tipo;
      osc.frequency.setValueAtTime(frequencia, t);
      gain.gain.setValueAtTime(volume || 0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duracao);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duracao);
    } catch (e) {
      // Ignora erro em browsers com autoplay restrito
    }
  }

  function acerto() {
    emitirTom(523.25, 'sine', 0.1, 0, 0.15);
    emitirTom(659.25, 'sine', 0.15, 0.08, 0.18);
    emitirTom(783.99, 'sine', 0.25, 0.16, 0.2);
  }

  function erro() {
    emitirTom(260, 'sawtooth', 0.15, 0, 0.12);
    emitirTom(196, 'sawtooth', 0.25, 0.1, 0.15);
  }

  function vitoria() {
    [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
      emitirTom(f, 'triangle', 0.2, i * 0.1, 0.2);
    });
  }

  function toggle() {
    somAtivo = !somAtivo;
    return somAtivo;
  }

  function isAtivo() {
    return somAtivo;
  }

  return {
    acerto: acerto,
    erro: erro,
    vitoria: vitoria,
    toggle: toggle,
    isAtivo: isAtivo,
  };
});
