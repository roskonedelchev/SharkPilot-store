# SharkPilot-store

Статичен магазин-каталог за Shark Pilot, подготвен за **GitHub + Cloudflare Pages**.

## Какво има във V1
- BG / EN версии (`/bg/` и `/en/`)
- тъмен storefront дизайн
- продуктови карти
- продуктова детайлна страница
- количка с `localStorage`
- глобални отстъпки:
  - 3+ артикула = 5%
  - над 200 EUR = 10%
  - кодът за отстъпка е с приоритет
- временен вариант **C** за заявка:
  - копиране на готова заявка
  - `mailto:` бутон към `roskonedelchev@gmail.com`

## Структура
- `public/` — всичко, което се deploy-ва
- `public/data/products.json` — продуктите
- `public/data/categories.json` — категориите
- `public/data/discount-codes.json` — кодовете за отстъпка
- `public/data/settings.json` — общите настройки
- `public/assets/img/products/` — продуктови снимки
- `public/assets/js/` — логиката на магазина

## Как да сменяш продукти и снимки
### Продуктови данни
Редактирай:
- `public/data/products.json`

### Снимки
Сложи новите изображения в:
- `public/assets/img/products/`

После смени пътя в `products.json`, например:
```json
"image": "/assets/img/products/my-new-product.jpg"
```

Можеш и просто да замениш файл със същото име.

## Статуси 
    "stockStatus": "in_stock", "on_request",
    "badge": "best_seller", "new", "none",
    "featured": true, false,
    "newProduct": true, false,

## Бележка за имейла
В тази версия сайтът **не изпраща автоматично имейл от сървъра**. Използва се временен вариант:
- копиране на заявката
- отваряне на имейл клиент чрез `mailto:`

За V2 може да се добави:
- Cloudflare + домейн
- или външен email provider
