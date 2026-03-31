/**
 * Utility functions for audio alerts using Web Audio API
 * No external audio files required
 */

/**
 * Play critical alert sound - 3 urgent beeps
 * Used for: refused publications, blocked content, late posts, urgent messages
 */
export function playCriticalAlertSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (startTime: number, frequency: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    };
    
    const now = audioContext.currentTime;
    playBeep(now, 880);        // First beep (A5)
    playBeep(now + 0.35, 880); // Second beep (A5)
    playBeep(now + 0.7, 1100); // Third beep (higher pitch)
  } catch (error) {
    console.warn("Unable to play critical alert sound:", error);
  }
}

/**
 * Play message notification sound - 1 soft beep
 * Used for: new messages, new conversations
 */
export function playMessageNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 660; // E5 - softer note
    oscillator.type = "sine";
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  } catch (error) {
    console.warn("Unable to play message notification sound:", error);
  }
}

/**
 * Play general notification sound - 2 ascending notes
 * Used for: new notifications, system alerts, validation updates
 */
export function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playNote = (startTime: number, frequency: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    };

    const now = audioContext.currentTime;
    playNote(now, 523);       // C5
    playNote(now + 0.18, 784); // G5 - ascending
  } catch (error) {
    console.warn("Unable to play notification sound:", error);
  }
}

/**
 * Play urgent message sound - 2 rapid high beeps
 * Used for: urgent internal messages
 */
export function playUrgentMessageSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playBeep = (startTime: number, frequency: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = "square";

      gainNode.gain.setValueAtTime(0.25, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    };

    const now = audioContext.currentTime;
    playBeep(now, 988);        // B5
    playBeep(now + 0.2, 1175); // D6
  } catch (error) {
    console.warn("Unable to play urgent message sound:", error);
  }
}
