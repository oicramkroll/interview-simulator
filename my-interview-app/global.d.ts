// global.d.ts

/// <reference lib="speechapi" />
declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
  }
  
  export {};