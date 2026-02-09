import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { getTokenFromCookie } from '@/lib/cookie-utils';
import { Copy, Check } from 'lucide-react';

/**
 * Компонент для отображения токена
 */
export function TokenDisplay() {
  const [token, setToken] = useState<string | null>(null);
  const [exchangeName, setExchangeName] = useState<string>('Загрузка...');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadToken();
  }, []);

  /**
   * Загружает токен из куки
   */
  const loadToken = async () => {
    setIsLoading(true);
    try {
      const result = await getTokenFromCookie();
      setToken(result.token);
      setExchangeName(result.exchangeName);
    } catch (error) {
      console.error('Ошибка загрузки токена:', error);
      setExchangeName('Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Копирует токен в буфер обмена
   */
  const copyToClipboard = async () => {
    if (!token) return;

    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-[400px] space-y-2">
        <h2 className="text-lg font-semibold leading-none">Token Extractor</h2>
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  const isUnsupported = !token && exchangeName === 'Не поддерживается';

  return (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-none">Token Extractor</h2>
        <p className="text-sm text-muted-foreground">
          {exchangeName}
        </p>
      </div>
      {isUnsupported ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>Эта биржа не поддерживается</p>
          <p className="text-xs mt-2">
            Поддерживаемые: MEXC, KCEX, OurBit, Lite Invest
          </p>
        </div>
      ) : token ? (
        <div className="space-y-2">
          <div className="relative">
            <textarea
              readOnly
              value={token}
              className="w-full p-3 rounded-md border bg-input text-sm font-mono resize-none text-foreground"
              rows={4}
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={copyToClipboard}
              title="Копировать"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Токен скопирован из куки текущей вкладки
          </p>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <p>Токен не найден</p>
          <p className="text-xs mt-2">
            Убедитесь, что вы авторизованы на бирже
          </p>
        </div>
      )}
      <Button
        variant="outline"
        className="w-full"
        onClick={loadToken}
        disabled={isLoading}
      >
        Обновить
      </Button>
    </div>
  );
}

