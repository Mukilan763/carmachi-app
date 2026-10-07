import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceTextInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

// Add TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceTextInput: React.FC<VoiceTextInputProps> = ({ value, onChange, placeholder }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentTranscript += transcript + ' ';
            }
          }
          if (currentTranscript) {
            onChange((value + ' ' + currentTranscript).trim());
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onChange, value]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error('Could not start recording', e);
      }
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        className="w-full min-h-[120px] p-4 pr-14 text-gray-800 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        placeholder={placeholder || "E.g., I want an automatic SUV under 15 lakhs for daily city commute..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={toggleListening}
        className={`absolute bottom-4 right-4 p-3 rounded-full flex items-center justify-center transition-colors shadow-sm ${
          isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
      </button>
    </div>
  );
};

export default VoiceTextInput;
