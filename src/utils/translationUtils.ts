// Local translation utilities using keyword mapping for security terms
// This avoids external API dependencies while providing multilingual support

export interface TranslationPattern {
  [key: string]: string;
}

export const securityTranslations = {
  es: {
    // Security terms
    'security': 'seguridad',
    'threat': 'amenaza', 
    'warning': 'advertencia',
    'danger': 'peligro',
    'safe': 'seguro',
    'unsafe': 'inseguro',
    'risk': 'riesgo',
    'scan': 'escanear',
    'analysis': 'análisis',
    'protection': 'protección',
    
    // File and URL terms
    'file': 'archivo',
    'url': 'enlace',
    'link': 'enlace',
    'download': 'descargar',
    'upload': 'subir',
    
    // Status terms
    'clean': 'limpio',
    'infected': 'infectado',
    'suspicious': 'sospechoso',
    'verified': 'verificado',
    
    // Actions
    'scanning': 'escaneando',
    'analyzing': 'analizando',
    'checking': 'verificando',
    
    // Common phrases
    'please wait': 'por favor espere',
    'scan complete': 'escaneo completo',
    'no threats found': 'no se encontraron amenazas',
    'threat detected': 'amenaza detectada'
  },
  
  fr: {
    // Security terms
    'security': 'sécurité',
    'threat': 'menace',
    'warning': 'avertissement', 
    'danger': 'danger',
    'safe': 'sûr',
    'unsafe': 'dangereux',
    'risk': 'risque',
    'scan': 'scanner',
    'analysis': 'analyse',
    'protection': 'protection',
    
    // File and URL terms
    'file': 'fichier',
    'url': 'lien',
    'link': 'lien',
    'download': 'télécharger',
    'upload': 'téléverser',
    
    // Status terms
    'clean': 'propre',
    'infected': 'infecté',
    'suspicious': 'suspect',
    'verified': 'vérifié',
    
    // Actions
    'scanning': 'analyse en cours',
    'analyzing': 'analyse',
    'checking': 'vérification',
    
    // Common phrases
    'please wait': 'veuillez patienter',
    'scan complete': 'analyse terminée',
    'no threats found': 'aucune menace trouvée',
    'threat detected': 'menace détectée'
  },
  
  de: {
    // Security terms
    'security': 'Sicherheit',
    'threat': 'Bedrohung',
    'warning': 'Warnung',
    'danger': 'Gefahr', 
    'safe': 'sicher',
    'unsafe': 'unsicher',
    'risk': 'Risiko',
    'scan': 'scannen',
    'analysis': 'Analyse',
    'protection': 'Schutz',
    
    // File and URL terms
    'file': 'Datei',
    'url': 'Link',
    'link': 'Link', 
    'download': 'herunterladen',
    'upload': 'hochladen',
    
    // Status terms
    'clean': 'sauber',
    'infected': 'infiziert',
    'suspicious': 'verdächtig',
    'verified': 'verifiziert',
    
    // Actions
    'scanning': 'Scannen',
    'analyzing': 'Analysieren',
    'checking': 'Überprüfung',
    
    // Common phrases
    'please wait': 'bitte warten',
    'scan complete': 'Scan abgeschlossen',
    'no threats found': 'keine Bedrohungen gefunden',
    'threat detected': 'Bedrohung erkannt'
  },

  it: {
    // Security terms
    'security': 'sicurezza',
    'threat': 'minaccia',
    'warning': 'avvertimento',
    'danger': 'pericolo',
    'safe': 'sicuro',
    'unsafe': 'non sicuro',
    'risk': 'rischio',
    'scan': 'scansione',
    'analysis': 'analisi',
    'protection': 'protezione',
    
    // File and URL terms
    'file': 'file',
    'url': 'collegamento',
    'link': 'link',
    'download': 'scaricare',
    'upload': 'caricare',
    
    // Status terms
    'clean': 'pulito',
    'infected': 'infetto',
    'suspicious': 'sospetto',
    'verified': 'verificato',
    
    // Actions
    'scanning': 'scansione',
    'analyzing': 'analizzando',
    'checking': 'controllo',
    
    // Common phrases
    'please wait': 'attendere prego',
    'scan complete': 'scansione completata',
    'no threats found': 'nessuna minaccia trovata',
    'threat detected': 'minaccia rilevata'
  }
};

export const detectLanguage = (text: string): string => {
  // Simple language detection based on common words and patterns
  const spanishWords = ['es', 'hola', 'gracias', 'por favor', 'sí', 'no', 'donde', 'que', 'como'];
  const frenchWords = ['fr', 'bonjour', 'merci', 's\'il vous plaît', 'oui', 'non', 'où', 'que', 'comment'];
  const germanWords = ['de', 'hallo', 'danke', 'bitte', 'ja', 'nein', 'wo', 'was', 'wie'];
  const italianWords = ['it', 'ciao', 'grazie', 'per favore', 'sì', 'no', 'dove', 'che', 'come'];
  
  const lowerText = text.toLowerCase();
  
  if (spanishWords.some(word => lowerText.includes(word))) return 'es';
  if (frenchWords.some(word => lowerText.includes(word))) return 'fr';
  if (germanWords.some(word => lowerText.includes(word))) return 'de';
  if (italianWords.some(word => lowerText.includes(word))) return 'it';
  
  return 'en'; // Default to English
};

export const translateSecurityText = (text: string, targetLanguage: string): string => {
  if (targetLanguage === 'en' || !securityTranslations[targetLanguage as keyof typeof securityTranslations]) {
    return text;
  }
  
  try {
    const translations = securityTranslations[targetLanguage as keyof typeof securityTranslations];
    let translatedText = text;
    
    // Apply translations for exact matches and word boundaries
    Object.entries(translations).forEach(([english, translated]) => {
      // Handle both exact phrases and individual words
      const exactPhraseRegex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(exactPhraseRegex, translated);
    });
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

export const getSecurityResponseTemplate = (language: string) => {
  const templates = {
    en: {
      scanning: "Scanning your file for threats...",
      analyzing: "Analyzing the content for security risks...",
      safe: "✅ File appears to be safe. No threats detected.",
      threat: "⚠️ Potential threat detected. Please be cautious.",
      error: "❌ Unable to complete scan. Please try again.",
      help: "I can help you scan files and URLs for security threats. Upload a file or share a link to get started."
    },
    es: {
      scanning: "Escaneando tu archivo en busca de amenazas...",
      analyzing: "Analizando el contenido en busca de riesgos de seguridad...",
      safe: "✅ El archivo parece estar seguro. No se detectaron amenazas.",
      threat: "⚠️ Amenaza potencial detectada. Ten cuidado.",
      error: "❌ No se pudo completar el escaneo. Inténtalo de nuevo.",
      help: "Puedo ayudarte a escanear archivos y URLs en busca de amenazas de seguridad. Sube un archivo o comparte un enlace para comenzar."
    },
    fr: {
      scanning: "Analyse de votre fichier pour détecter les menaces...",
      analyzing: "Analyse du contenu pour les risques de sécurité...",
      safe: "✅ Le fichier semble être sûr. Aucune menace détectée.",
      threat: "⚠️ Menace potentielle détectée. Soyez prudent.",
      error: "❌ Impossible de terminer l'analyse. Veuillez réessayer.",
      help: "Je peux vous aider à analyser les fichiers et URL pour détecter les menaces de sécurité. Téléversez un fichier ou partagez un lien pour commencer."
    },
    de: {
      scanning: "Scannen Ihrer Datei nach Bedrohungen...",
      analyzing: "Analysieren des Inhalts auf Sicherheitsrisiken...",
      safe: "✅ Die Datei scheint sicher zu sein. Keine Bedrohungen erkannt.",
      threat: "⚠️ Potenzielle Bedrohung erkannt. Seien Sie vorsichtig.",
      error: "❌ Scan konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
      help: "Ich kann Ihnen beim Scannen von Dateien und URLs nach Sicherheitsbedrohungen helfen. Laden Sie eine Datei hoch oder teilen Sie einen Link, um zu beginnen."
    },
    it: {
      scanning: "Scansione del file per minacce...",
      analyzing: "Analisi del contenuto per rischi di sicurezza...",
      safe: "✅ Il file sembra essere sicuro. Nessuna minaccia rilevata.",
      threat: "⚠️ Minaccia potenziale rilevata. Fai attenzione.",
      error: "❌ Impossibile completare la scansione. Riprova.",
      help: "Posso aiutarti a scansionare file e URL per minacce di sicurezza. Carica un file o condividi un link per iniziare."
    }
  };
  
  return templates[language as keyof typeof templates] || templates.en;
};