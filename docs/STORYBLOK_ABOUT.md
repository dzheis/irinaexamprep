# Секция «Обо мне» (AboutSection) в Storyblok

Этот документ описывает, как настроить в Storyblok блок **section_about** (рекомендуемое имя; работает и старое имя **about**), который питает компонент `AboutSection.tsx` на главной странице. Имена блоков привязаны к секциям — см. таблицу в [STORYBLOK_PLAN.md](../STORYBLOK_PLAN.md) (раздел «Именование блоков»).

---

## Что показывает секция на сайте

- **Заголовок** (например «Обо мне»).
- **Фото** преподавателя: на десктопе — фон карточки, на мобильном — сверху в карточке.
- **Несколько абзацев** текста (про преподавателя).
- **Сетка сертификатов**: первые 3 — в колонке справа на десктопе, остальные и все на мобильном — в ряд внизу. По клику на сертификат открывается просмотр в полном размере.

Если блок **section_about** (или **about**) в Storyblok не добавлен или поля пустые, секция показывает заголовок «Обо мне», дефолтные абзацы и плейсхолдеры сертификатов из кода.

---

## Что нужно создать в Storyblok

Три типа блоков (вложенные — в БЭМ-стиле, привязаны к родителю section_about):

| Блок | Назначение |
|------|------------|
| **section_about_paragraph** | Один абзац текста (поле `text`). |
| **section_about_certificate** | Один сертификат: картинка + подпись (`image`, `alt`). |
| **section_about** | Секция целиком: заголовок, список абзацев, список сертификатов, фото. (В UI можно подписать «Секция „Обо мне“».) |

Блок **section_about** добавляется в историю **home** в поле **Body**.

---

## Config в интерфейсе (Technical name, Display name, Description)

Когда в Block library открываешь блок для правки (Edit), во вкладке **Config** заполни так:

**section_about** (родительский блок секции «Обо мне»):

| Поле в Config | Значение |
|---------------|----------|
| **Technical name** | `section_about` |
| **Display name** | `Section About` или «Секция „Обо мне“» |
| **Description** | Секция «Обо мне» на главной: заголовок, список абзацев о преподавателе, фото и сетка сертификатов. |
| **Block type** | Nestable block |

**section_about_paragraph** (один абзац):

| Поле в Config | Значение |
|---------------|----------|
| **Technical name** | `section_about_paragraph` |
| **Display name** | `Paragraph` или «Абзац» |
| **Description** | Один абзац текста в секции «Обо мне». Используется в списке paragraphs. |
| **Block type** | Nestable block |

**section_about_certificate** (один сертификат):

| Поле в Config | Значение |
|---------------|----------|
| **Technical name** | `section_about_certificate` |
| **Display name** | `Certificate` или «Сертификат» |
| **Description** | Один сертификат в секции «Обо мне»: картинка и подпись. По клику открывается в полном размере. |
| **Block type** | Nestable block |

---

## Шаг 1. Блок `section_about_paragraph`

**Block Library** → **+ New Block** → имя блока: **section_about_paragraph** (БЭМ: элемент paragraph родителя section_about).

| Key (имя поля) | Тип поля в Storyblok | Обязательность |
|----------------|----------------------|----------------|
| **text** | Multi-line / Textarea | да |

Сохранить блок.

---

## Шаг 2. Блок `section_about_certificate`

**Block Library** → **+ New Block** → имя блока: **section_about_certificate** (БЭМ: элемент certificate родителя section_about).

| Key | Тип поля в Storyblok | Обязательность |
|-----|----------------------|----------------|
| **image** | Asset (Image) | да (иначе плейсхолдер) |
| **alt** | Single line | нет (по умолчанию «Сертификат») |

Сохранить блок.

---

## Шаг 3. Блок `section_about`

**Block Library** → **+ New Block** → имя блока: **section_about** (Display name при желании: «Секция „Обо мне“»).

| Key | Тип поля в Storyblok | Разрешённые блоки / примечание |
|-----|----------------------|---------------------------------|
| **title** | Single line | Заголовок секции. Если пусто — на сайте «Обо мне». |
| **paragraphs** | Blocks | Разрешить только блок **section_about_paragraph** (или **paragraph**). |
| **certificates** | Blocks | Разрешить только блок **section_about_certificate** (или **certificate**). |
| **image** | Asset (Image) | Фото преподавателя. Если пусто — используется фото по умолчанию из кода. |

Сохранить блок **section_about**.

---

## Шаг 4. Добавить блок на главную

1. **Content** → открыть историю **home** (slug должен быть **home**).
2. В контенте истории найти **Body** (или область, куда добавляются блоки).
3. **+ Add block** → в списке выбрать **section_about** (или «Секция „Обо мне“», если задан Display name).
4. Заполнить:
   - **title** — например «Обо мне».
   - **image** — загрузить или выбрать фото преподавателя.
   - **paragraphs** — добавить элементы **section_about_paragraph**; в каждом заполнить поле **text** (один абзац). Порядок = порядок на сайте. Можно любое количество абзацев.
   - **certificates** — добавить элементы **section_about_certificate**; в каждом указать **image** и **alt** (например «Сертификат CELTA»). Первые три — в колонке справа на десктопе, остальные — в ряд внизу.
5. **Save** → **Publish**.

---

## Соответствие полей коду

Компонент `AboutSection.tsx` ожидает данные типа `AboutBlockContent`:

- **title** → заголовок секции (`data?.title`).
- **paragraphs** → массив абзацев. В Storyblok приходят как блоки с полем **text** (или **content**); код нормализует в `string[]`.
- **certificates** → массив сертификатов. В Storyblok — блоки с полями **image** (Asset) и **alt**; код берёт `image.filename` (или `filename`) и `alt`, пустые URL подменяет плейсхолдером.
- **image** → фото секции; код использует `image.filename`, при пустом — локальное фото по умолчанию.

Типы описаны в `src/lib/storyblok-types.ts` (`AboutBlockContent`). Данные приходят из истории **home**: блок с `component: "section_about"` (или `"about"`) извлекается в `app/page.tsx` (константа `HOME_BLOCK_NAMES.about`) и передаётся в `HomeClient` → `AboutSection` как `data={about}`.
