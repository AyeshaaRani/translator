import React, { useState, useEffect, useCallback } from 'react';
import { FaVolumeUp, FaExchangeAlt, FaCopy } from "react-icons/fa";
import { languages } from '../Languages';

const Translator = () => {
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('ar');
  const [debouncedText, setDebouncedText] = useState(fromText);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedText(fromText);
    }, 500);

    return () => clearTimeout(timerId);
  }, [fromText]);

  const handleTranslate = useCallback(() => {
    if (!debouncedText) return;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(debouncedText)}&langpair=${fromLang}|${toLang}`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.responseData) {
          setToText(data.responseData.translatedText);
        } else {
          setToText("Translation not available.");
        }
      })
      .catch(error => {
        console.error("Error during translation:", error);
        setToText("An error occurred.");
      });
  }, [debouncedText, fromLang, toLang]);

  useEffect(() => {
    handleTranslate();
  }, [debouncedText, fromLang, toLang, handleTranslate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  const speakText = (text, lang) => {
    if (!('speechSynthesis' in window)) { // Fixed unsafe negation
      alert("Speech synthesis not supported in this browser.");
      return;
    }

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    const voices = speechSynthesis.getVoices();
    const matchingVoice = voices.find(voice => voice.lang.startsWith(lang));

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.rate = 1;
    utterance.onend = () => console.log("Speech finished.");
    utterance.onerror = (e) => console.error("Speech error:", e);

    speechSynthesis.speak(utterance);
  };

  return (
 

    <div className="w-screen pt-5 flex flex-col justify-center items-center bg-gradient-to-r from-blue-50 via-gray-100 to-blue-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-10">Translator</h1>
      <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-4xl">
        <div className="flex flex-col p-5 w-full md:w-1/2">
          <textarea
            className="border border-gray-300 rounded-lg p-3 w-full h-40 resize-none focus:border-blue-500 focus:outline-none transition-all shadow-sm"
            name="from"
            placeholder="Enter text"
            value={fromText}
            onChange={(e) => setFromText(e.target.value)}
          ></textarea>
          <div className="flex items-center mt-3 space-x-3">
            <button 
              className="p-2 text-gray-600 hover:text-blue-500 transition duration-300" 
              onClick={() => speakText(fromText, fromLang)}
            >
              <FaVolumeUp size={20} />
            </button>
            <button 
              className="p-2 text-gray-600 hover:text-blue-500 transition duration-300" 
              onClick={() => copyToClipboard(fromText)}
            >
              <FaCopy size={20} />
            </button>
            <select 
              value={fromLang} 
              onChange={(e) => setFromLang(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 ml-auto text-gray-700 bg-white"
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>{language.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-center my-4 md:my-0">
          <button 
            className="bg-blue-500 text-white rounded-full p-3 shadow-md hover:bg-blue-600 transition duration-300 transform hover:scale-110"
            onClick={() => {
              const tempLang = fromLang;
              setFromLang(toLang);
              setToLang(tempLang);
              setFromText(toText);
              setToText('');
            }}
          >
            <FaExchangeAlt size={20} />
          </button>
        </div>

        <div className="flex flex-col p-5 w-full md:w-1/2">
          <textarea
            className="border border-gray-300 rounded-lg p-3 w-full h-40 resize-none bg-gray-100 focus:outline-none shadow-sm"
            name="to"
            placeholder="Translation"
            value={toText}
            readOnly
          ></textarea>
          <div className="flex items-center mt-3 space-x-3">
            <button 
              className="p-2 text-gray-600 hover:text-blue-500 transition duration-300" 
              onClick={() => speakText(toText, toLang)}
            >
              <FaVolumeUp size={20} />
            </button>
            <button 
              className="p-2 text-gray-600 hover:text-blue-500 transition duration-300" 
              onClick={() => copyToClipboard(toText)}
            >
              <FaCopy size={20} />
            </button>
            <select 
              value={toLang} 
              onChange={(e) => setToLang(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 ml-auto text-gray-700 bg-white"
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>{language.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <button 
        className="bg-blue-500 text-white px-6 py-3 mt-5 rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
        onClick={handleTranslate}
      >
        Translate Text
      </button>
    </div>
  );
};

export default Translator;
