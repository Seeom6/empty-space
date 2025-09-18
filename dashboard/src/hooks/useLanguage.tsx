'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
}

// Simple translations - in a real app, you'd load these from files
const translations: Record<Language, Record<string, string>> = {
  en: {
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember me',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.update': 'Update',
  },
  es: {
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Registrarse',
    'auth.logout': 'Cerrar Sesión',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.rememberMe': 'Recordarme',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.update': 'Actualizar',
  },
  fr: {
    'auth.login': 'Connexion',
    'auth.register': 'S\'inscrire',
    'auth.logout': 'Déconnexion',
    'auth.email': 'E-mail',
    'auth.password': 'Mot de passe',
    'auth.forgotPassword': 'Mot de passe oublié?',
    'auth.rememberMe': 'Se souvenir de moi',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.create': 'Créer',
    'common.update': 'Mettre à jour',
  },
  de: {
    'auth.login': 'Anmelden',
    'auth.register': 'Registrieren',
    'auth.logout': 'Abmelden',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.forgotPassword': 'Passwort vergessen?',
    'auth.rememberMe': 'Angemeldet bleiben',
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.create': 'Erstellen',
    'common.update': 'Aktualisieren',
  },
  zh: {
    'auth.login': '登录',
    'auth.register': '注册',
    'auth.logout': '登出',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.forgotPassword': '忘记密码？',
    'auth.rememberMe': '记住我',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.create': '创建',
    'common.update': '更新',
  },
  ja: {
    'auth.login': 'ログイン',
    'auth.register': '登録',
    'auth.logout': 'ログアウト',
    'auth.email': 'メール',
    'auth.password': 'パスワード',
    'auth.forgotPassword': 'パスワードを忘れましたか？',
    'auth.rememberMe': 'ログイン状態を保持',
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.create': '作成',
    'common.update': '更新',
  },
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'en',
  storageKey = 'language',
}) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  useEffect(() => {
    // Load language from localStorage
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(storageKey) as Language;
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      }
    }
  }, [storageKey]);

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newLanguage);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
