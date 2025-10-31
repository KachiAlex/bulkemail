/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDMERSIVE_API_KEY?: string;
  readonly VITE_ABSTRACT_API_KEY?: string;
  readonly VITE_EMAIL_VERIFICATION_API_KEY?: string;
  readonly VITE_EMAIL_VERIFICATION_PROVIDER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

