import test from 'ava';
import { LanguageNegotiatorOptions, negotiateLanguage } from './language-negotiator';
import { Request, Response } from 'express';

const options: LanguageNegotiatorOptions = {
  priority: ['cookie', 'query', 'acceptLanguage'],
  languages: ['en', 'ja'],
  defaultLanguage: 'default',
  cookieName: 'language',
  queryParamName: 'language'
};

test('cookie', t => {
  const req: Request = {
    cookies: {
      [options.cookieName]: 'en'
    },
    query: {},
    headers: {},
    acceptsLanguages: () => []
  } as unknown as Request;
  negotiateLanguage(options)(req, {} as Response, () => {
    t.is(req.language, 'en');
  });
});

test('query', t => {
  const req: Request = {
    cookies: {},
    query: {
      [options.queryParamName]: 'en'
    },
    headers: {},
    acceptsLanguages: () => []
  } as unknown as Request;
  negotiateLanguage(options)(req, {} as Response, () => {
    t.is(req.language, 'en');
  });
});

test('acceptLanguage', t => {
  const req: Request = {
    cookies: {},
    query: {},
    headers: {
      'accept-language': 'en-US,en;q=0.5'
    },
    acceptsLanguages: () => ['en-US']
  } as unknown as Request;
  negotiateLanguage(options)(req, {} as Response, () => {
    t.is(req.language, 'en');
  });
});

test('acceptLanguage with unknown lang', t => {
  const req: Request = {
    cookies: {},
    query: {},
    headers: {
      'accept-language': 'ru-RU;q=0.5, ja-JP, ja;q=0.4'
    },
    acceptsLanguages: () => ['ru-RU', 'ja-JP']
  } as unknown as Request;
  negotiateLanguage(options)(req, {} as Response, () => {
    t.is(req.language, 'ja');
  });
});

test('default', t => {
  const req: Request = {
    cookies: {},
    query: {},
    headers: {
      'accept-language': 'ru-RU;q=0.5, de-DE, de;q=0.4'
    },
    acceptsLanguages: () => ['ru-RU', 'de-DE']
  } as unknown as Request;
  negotiateLanguage(options)(req, {} as Response, () => {
    t.is(req.language, 'default');
  });
});
