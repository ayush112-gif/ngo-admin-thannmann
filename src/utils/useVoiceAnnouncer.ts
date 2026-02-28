export function unlockVoice() {
  const utter = new SpeechSynthesisUtterance("");
  window.speechSynthesis.speak(utter);
}

export function announceDonation(name: string, amount: number) {
  const text = `${name} donated ${amount} rupees. Thank you!`;

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  utter.volume = 1;

  window.speechSynthesis.speak(utter);
}