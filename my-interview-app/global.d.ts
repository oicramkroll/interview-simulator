/// <reference lib="speechapi" />
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }

  interface BeforeInstallPromptEvent extends Event {
    prompt: () => void;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }

  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export {};