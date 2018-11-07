import { NextFunction, Request, Response } from 'express';

export interface LanguageNegotiatorOptions {
  priority: Array<'cookie' | 'query' | 'acceptLanguage'>;
  languages: string[];
  defaultLanguage: string;
  cookieName?: string;
  queryParamName?: string;
}

declare global {
  namespace Express {
    export interface Request {
      language?: string;
    }
  }
}

export function negotiateLanguage(
  options: LanguageNegotiatorOptions
): (req: Request, res: Response, next: NextFunction) => void {
  if (options.languages.length === 0) {
    throw new Error('Please provide at least 1 supported language');
  }

  // @ts-ignore
  return (req: Request, res: Response, next: NextFunction) => {
    let language = options.defaultLanguage;
    let match: string | null = null;

    function contains(lang: string): boolean {
      return options.languages.indexOf(lang) > -1;
    }

    for (const method of options.priority) {
      switch (method) {
        case 'cookie': {
          if (req.cookies) {
            const cookie = req.cookies[options.cookieName || 'language'];
            if (cookie && contains(cookie)) {
              match = cookie;
            }
          }
          break;
        }

        case 'query': {
          if (req.query) {
            const query = req.query[options.queryParamName || 'language'];
            if (query && contains(query)) {
              match = query;
            }
          }
          break;
        }

        case 'acceptLanguage': {
          if (req.headers['accept-language']) {
            const acceptedLanguages = req.acceptsLanguages();

            const directMatch = acceptedLanguages.find(
              lang => options.languages.findIndex(l => l === lang) > -1
            );
            if (directMatch) {
              match = directMatch;
              break;
            }

            const acceptedLanguagesIndirect = acceptedLanguages.map(lang =>
              lang.substring(0, 2)
            );
            const languages = options.languages.map(lang =>
              lang.substring(0, 2)
            );
            const indirectMatch = acceptedLanguagesIndirect.find(
              lang => languages.findIndex(l => lang === l) > -1
            );

            if (indirectMatch) {
              match = indirectMatch;
              break;
            }
          }
          break;
        }
      }

      if (match) {
        break;
      }
    }

    if (match) {
      language = match;
    }

    req.language = language;
    next();
  };
}
