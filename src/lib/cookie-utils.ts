/**
 * Определяет тип биржи по URL
 */
export type ExchangeType = 'mexc' | 'kcex' | 'ourbit' | 'unsupported';

/**
 * Определяет тип биржи по домену
 */
export function getExchangeType(url: string): ExchangeType {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('mexc.com')) {
      return 'mexc';
    }
    if (hostname.includes('kcex.com')) {
      return 'kcex';
    }
    if (hostname.includes('ourbit.com')) {
      return 'ourbit';
    }
    
    return 'unsupported';
  } catch {
    return 'unsupported';
  }
}

/**
 * Получает токен из куки для текущей вкладки
 */
export async function getTokenFromCookie(): Promise<{
  token: string | null;
  exchange: ExchangeType;
  exchangeName: string;
}> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url) {
      return { token: null, exchange: 'unsupported', exchangeName: 'Неизвестная биржа' };
    }

    const exchange = getExchangeType(tab.url);
    
    if (exchange === 'unsupported') {
      return { token: null, exchange: 'unsupported', exchangeName: 'Не поддерживается' };
    }

    const url = new URL(tab.url);
    const domain = url.hostname;
    
    let cookieName: string;
    let exchangeName: string;
    
    switch (exchange) {
      case 'mexc':
        cookieName = 'u_id';
        exchangeName = 'MEXC';
        break;
      case 'kcex':
        cookieName = 'Authorization';
        exchangeName = 'KCEX';
        break;
      case 'ourbit':
        cookieName = 'u_id';
        exchangeName = 'OurBit';
        break;
      default:
        return { token: null, exchange: 'unsupported', exchangeName: 'Не поддерживается' };
    }

    // Пробуем получить куку с разных протоколов
    let cookie = await chrome.cookies.get({
      url: `https://${domain}`,
      name: cookieName,
    });

    if (!cookie) {
      cookie = await chrome.cookies.get({
        url: `http://${domain}`,
        name: cookieName,
      });
    }

    // Если кука не найдена, пробуем получить с корневого домена
    if (!cookie && domain.startsWith('www.')) {
      const rootDomain = domain.replace('www.', '');
      cookie = await chrome.cookies.get({
        url: `https://${rootDomain}`,
        name: cookieName,
      });
    }

    return {
      token: cookie?.value || null,
      exchange,
      exchangeName,
    };
  } catch (error) {
    console.error('Ошибка при получении токена:', error);
    return { token: null, exchange: 'unsupported', exchangeName: 'Ошибка' };
  }
}

