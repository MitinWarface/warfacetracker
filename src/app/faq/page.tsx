// src/app/faq/page.tsx
"use client";

import { HelpCircle, Book, Search } from "lucide-react";
import Link from "next/link";

const FAQ_SECTIONS = [
  {
    id: "registration",
    title: "Регистрация и вход",
    icon: HelpCircle,
    questions: [
      {
        q: "Как зарегистрироваться?",
        a: "Нажмите кнопку «Войти» в верхней панели, переключитесь на вкладку «Зарегистрироваться» и заполните форму. Требуется email, пароль (минимум 6 символов) и уникальное имя пользователя.",
      },
      {
        q: "Как войти в аккаунт?",
        a: "Нажмите «Войти» в навигации, введите email и пароль, затем нажмите кнопку входа.",
      },
      {
        q: "Как выйти из аккаунта?",
        a: "Нажмите на свой аватар в навигации и выберите «Выйти» в выпадающем меню.",
      },
      {
        q: "Что делать, если забыл пароль?",
        a: "Восстановление пароля через email. Нажмите «Забыли пароль?» на странице входа и следуйте инструкциям.",
      },
    ],
  },
  {
    id: "profile",
    title: "Профиль игрока",
    icon: Book,
    questions: [
      {
        q: "Как привязать Warface ник?",
        a: "Зайдите в Личный кабинет (/dashboard), вкладка «Основное». Введите ваш ник в Warface и нажмите «Привязать». Ник должен существовать в API Warface!",
      },
      {
        q: "Как посмотреть свой профиль?",
        a: "URL формата /u/ВашUsername или через меню → «Мой профиль».",
      },
      {
        q: "Что показывает профиль?",
        a: "K/D Ratio, победы, точность, время в игре, статистику по классам, оружие и достижения.",
      },
      {
        q: "Почему не обновляется статистика?",
        a: "Данные кэшируются на 15 минут. Откройте Личный кабинет и нажмите «Очистить кэш» для принудительного обновления.",
      },
    ],
  },
  {
    id: "customization",
    title: "Кастомизация",
    icon: HelpCircle,
    questions: [
      {
        q: "Как изменить фон профиля?",
        a: "Личный кабинет → вкладка «Профиль». Выберите цвет через палитру или введите HEX код (например, #0f172a).",
      },
      {
        q: "Как загрузить аватар?",
        a: "Личный кабинет → «Профиль» → раздел «Аватар». Выберите файл (макс. 5MB, JPG/PNG/GIF).",
      },
      {
        q: "Как загрузить баннер?",
        a: "Личный кабинет → «Профиль» → раздел «Баннер». Рекомендуемый размер: 1920x400px.",
      },
      {
        q: "Можно ли вернуть настройки по умолчанию?",
        a: "Да, нажмите «Сбросить настройки» в конце страницы профиля.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Приватность",
    icon: Book,
    questions: [
      {
        q: "Что можно скрыть?",
        a: "Вкладка «Приватность» в Личном кабинете позволяет скрыть: K/D Ratio, победы, точность, время в игре, биографию.",
      },
      {
        q: "Кто видит скрытые данные?",
        a: "Никто! Даже вы сами не увидите их на публичном профиле. Данные полностью скрыты.",
      },
      {
        q: "Можно ли скрыть профиль полностью?",
        a: "Скройте все поля в настройках приватности — профиль будет показывать только ник и ранг.",
      },
    ],
  },
  {
    id: "friends",
    title: "Друзья",
    icon: HelpCircle,
    questions: [
      {
        q: "Как добавить друга?",
        a: "Личный кабинет → «Друзья» → введите username пользователя → «Отправить запрос».",
      },
      {
        q: "Как принять запрос в друзья?",
        a: "Раздел «Друзья» → найдите входящий запрос → нажмите «Принять» или «Отклонить».",
      },
      {
        q: "Как удалить друга?",
        a: "Список друзей → кнопка «Удалить» рядом с пользователем.",
      },
      {
        q: "Есть ли лимит на количество друзей?",
        a: "Нет, количество друзей не ограничено.",
      },
    ],
  },
  {
    id: "achievements",
    title: "Достижения",
    icon: Book,
    questions: [
      {
        q: "Какие есть достижения?",
        a: [
          "🎉 Первый вход — первый вход на сайт",
          "🔗 Привязка ника — привязать Warface ник",
          "✅ Верифицирован — пройти верификацию",
          "🎨 Дизайнер — настроить профиль",
          "👥 Новый друг — добавить первого друга",
          "⭐ Популярный — 10 друзей",
          "💬 Комментатор — первый комментарий",
          "🏆 Топ-100 — попасть в топ-100",
          "🎖️ Ветеран — 100 часов в игре",
          "🎯 Снайпер — 1000 хедшотов",
        ],
      },
      {
        q: "Как получить достижения?",
        a: "Достижения выдаются автоматически при выполнении условий. Проверьте Личный кабинет → «Достижения».",
      },
      {
        q: "Можно ли скрыть достижения?",
        a: "Да, в настройках приватности можно скрыть раздел достижений.",
      },
    ],
  },
  {
    id: "ratings",
    title: "Рейтинги",
    icon: HelpCircle,
    questions: [
      {
        q: "Какие есть рейтинги?",
        a: "Топ-100 игроков (по классам), Рейтинг кланов, Ежемесячный рейтинг, PvE рейтинг.",
      },
      {
        q: "Как попасть в топ-100?",
        a: "Играйте в Warface и занимайте места по K/D в своём классе. Рейтинг обновляется автоматически.",
      },
      {
        q: "Как посмотреть рейтинг?",
        a: "Меню → «Рейтинги» или /ratings?tab=players.",
      },
      {
        q: "Как считается место в рейтинге?",
        a: "По K/D Ratio среди игроков выбранного класса. Учитываются только игроки с привязанным ником.",
      },
    ],
  },
  {
    id: "weapons",
    title: "Оружие",
    icon: Book,
    questions: [
      {
        q: "Как посмотреть топ по оружию?",
        a: "Меню → «Оружие» или /weapons-leaderboard.",
      },
      {
        q: "Что показывает топ оружия?",
        a: "Убийства с каждого оружия, количество игроков, точность, K/D с оружием.",
      },
      {
        q: "Как посмотреть своё оружие?",
        a: "Профиль игрока → вкладка «Оружие».",
      },
      {
        q: "Почему нет характеристик оружия?",
        a: "API Warface не предоставляет характеристики (урон, скорострельность). Используйте официальную вики.",
      },
    ],
  },
  {
    id: "pve",
    title: "PvE",
    icon: HelpCircle,
    questions: [
      {
        q: "Что такое PvE гильдия?",
        a: "Рейтинг игроков по PvE статистике: убийства в PvE, победы в миссиях, K/D в PvE.",
      },
      {
        q: "Как посмотреть PvE рейтинг?",
        a: "Меню → «PvE Рейтинг» или /ratings/pve.",
      },
      {
        q: "Как считается место в PvE рейтинге?",
        a: "По количеству убийств в PvE среди всех игроков.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Проблемы и решения",
    icon: Book,
    questions: [
      {
        q: "«Игрок не найден»",
        a: "Причина: неверный ник или игрока нет в API. Проверьте правильность ника и убедитесь, что игрок существует.",
      },
      {
        q: "«Ошибка загрузки изображения»",
        a: "Файл слишком большой или неверный формат. Максимум 5MB, только JPG/PNG/GIF.",
      },
      {
        q: "«Ник уже привязан»",
        a: "Этот Warface ник привязан к другому аккаунту. Используйте другой ник или войдите в тот аккаунт.",
      },
      {
        q: "«Не работает загрузка файлов»",
        a: "Не настроен Imgur API. Добавьте IMGUR_CLIENT_ID в .env или используйте прямые URL изображений.",
      },
      {
        q: "API Warface недоступно",
        a: "Подождите несколько минут. API может быть временно недоступно. Попробуйте позже.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-wf-accent" />
            <h1 className="text-3xl font-bold">FAQ</h1>
          </div>
          <p className="text-wf-muted_text text-lg">
            Часто задаваемые вопросы и руководство пользователя
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wf-muted_text" />
            <input
              type="text"
              placeholder="Поиск по вопросам..."
              className="w-full pl-12 pr-4 py-3 bg-wf-card border border-wf-border rounded-lg text-wf-text placeholder:text-wf-muted_text focus:outline-none focus:border-wf-accent focus:ring-2 focus:ring-wf-accent/20 transition-all"
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
                document.querySelectorAll("[data-faq-item]").forEach((el) => {
                  const text = el.textContent?.toLowerCase() || "";
                  (el as HTMLElement).style.display = text.includes(query) ? "block" : "none";
                });
              }}
            />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {FAQ_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-wf-card border border-wf-border rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <div className="bg-wf-muted/20 border-b border-wf-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <section.icon className="w-5 h-5 text-wf-accent" />
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>
              </div>

              {/* Questions */}
              <div className="divide-y divide-wf-border">
                {section.questions.map((faq, i) => (
                  <details
                    key={i}
                    className="group px-6 py-4 hover:bg-wf-muted/10 transition-colors"
                    data-faq-item
                  >
                    <summary className="flex items-start gap-3 cursor-pointer list-none">
                      <HelpCircle className="w-5 h-5 text-wf-accent flex-shrink-0 mt-0.5" />
                      <span className="font-medium flex-1">{faq.q}</span>
                      <span className="text-wf-muted_text group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3 ml-8 text-wf-muted_text space-y-2">
                      {Array.isArray(faq.a) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {faq.a.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{faq.a}</p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-6 bg-wf-accent/10 border border-wf-accent/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Book className="w-5 h-5 text-wf-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Не нашли ответ?</h3>
              <p className="text-sm text-wf-muted_text mb-3">
                Если вы не нашли ответ на свой вопрос, обратитесь в поддержку:
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 bg-wf-accent text-black rounded text-sm font-medium hover:bg-wf-accent/90 transition-colors"
                >
                  Личный кабинет
                </Link>
                <a
                  href="mailto:support@wftracker.ru"
                  className="px-3 py-1.5 bg-wf-card border border-wf-border rounded text-sm hover:bg-wf-muted/50 transition-colors"
                >
                  support@wftracker.ru
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-wf-muted_text">
          <p>Версия: 2.0.0 | Последнее обновление: 19 марта 2026</p>
        </div>
      </div>
    </main>
  );
}
