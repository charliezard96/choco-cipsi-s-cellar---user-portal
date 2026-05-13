import { useEffect } from 'react';

const BASE_TITLE = 'DeCacao Cellar';

export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;

    const setMeta = (name: string, content: string, prop?: boolean) => {
      const selector = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        if (prop) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
    }
    if (title) {
      setMeta('og:title', `${title} — ${BASE_TITLE}`, true);
    }
  }, [title, description]);
}
