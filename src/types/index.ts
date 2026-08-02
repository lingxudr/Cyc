export type PageRoute = 'dashboard' | 'translate' | 'history' | 'settings' | 'about';

export interface TranslationJob {
  id: string;
  filename: string;
  fileType: 'image' | 'pdf' | 'archive';
  fileSize: string;
  targetLang: string;
  provider: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export interface EngineStats {
  version: string;
  engineAvailable: boolean;
  supportedFormats: string[];
  providers: string[];
  defaultLang: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  defaultProvider: string;
  defaultTargetLang: string;
  autoDownload: boolean;
  preserveQuality: boolean;
  apiKeyGemini?: string;
  apiKeyOpenAI?: string;
}
