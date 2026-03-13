# udemy-rag

![TypeScript](https://img.shields.io/badge/-TypeScript-blue?logo=typescript&logoColor=white)

## 📝 Description

udemy-rag is a sophisticated web application that leverages Retrieval-Augmented Generation (RAG) to transform how users interact with Udemy course data. Developed with a robust Express.js and TypeScript backend, this project provides a seamless interface for performing intelligent, context-aware queries against educational content, ensuring learners can quickly find precise answers and insights from their courses.

## ✨ Features

- 🕸️ Web


## 🛠️ Tech Stack

- 🚀 Express.js
- 📜 TypeScript


## 📦 Key Dependencies

```
@getzep/zep-cloud: ^3.5.0
@google/genai: ^1.22.0
@google/generative-ai: ^0.24.1
@pinecone-database/pinecone: ^6.1.2
@prisma/client: ^6.16.3
adm-zip: ^0.5.16
body-parser: ^2.2.0
cors: ^2.8.5
dotenv: ^17.2.3
express: ^4.18.2
form-data: ^4.0.4
langchain: ^0.3.35
node-fetch: ^3.3.2
pdf-lib: ^1.17.1
pdf-parse: ^1.1.1
```

## 🚀 Run Commands

- **dev**: `npm run dev`
- **down**: `npm run down`
- **unzip**: `npm run unzip`
- **record**: `npm run record`
- **build**: `npm run build`
- **start**: `npm run start`


## 📁 Project Structure

```
.
├── Backend
│   ├── docker-compose.yaml
│   ├── eng.traineddata
│   ├── package.json
│   ├── prisma
│   │   ├── migrations
│   │   │   ├── 20251007104334_ww
│   │   │   │   └── migration.sql
│   │   │   └── migration_lock.toml
│   │   └── schema.prisma
│   ├── python
│   │   ├── __init__.py
│   │   ├── fallback_pipeline.py
│   │   ├── main.py
│   │   └── output.json
│   ├── src
│   │   ├── RAG
│   │   │   ├── extraction
│   │   │   │   ├── image.extraction.ts
│   │   │   │   ├── summary.extraction.ts
│   │   │   │   └── tesseract_text.extraction.ts
│   │   │   ├── geminiEmbedding.ts
│   │   │   ├── insertion
│   │   │   │   ├── image.insertion.ts
│   │   │   │   ├── sectionDetails.insertion.ts
│   │   │   │   └── text.insertion.ts
│   │   │   └── retrival
│   │   │       ├── extractSources.ts
│   │   │       ├── extractText.ts
│   │   │       ├── geminiSummarizer.ts
│   │   │       ├── query.ts
│   │   │       └── retrival_main.ts
│   │   ├── index.ts
│   │   ├── lib
│   │   │   └── pinecone.ts
│   │   ├── n.txt
│   │   ├── services
│   │   │   ├── filedownloader.ts
│   │   │   ├── playwrightScraper.ts
│   │   │   ├── playwrightVideoNoScraper.ts
│   │   │   └── zipfileopener.ts
│   │   ├── thread
│   │   │   ├── thread.controller.ts
│   │   │   ├── thread.route.ts
│   │   │   └── thread.service.ts
│   │   ├── trail.ts
│   │   └── zep
│   │       └── zepMemory.ts
│   └── tsconfig.json
└── frontend-udemy-rag
    ├── bun.lockb
    ├── components.json
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── public
    │   ├── favicon.ico
    │   ├── placeholder.svg
    │   └── robots.txt
    ├── src
    │   ├── App.tsx
    │   ├── components
    │   │   ├── AppSidebar.tsx
    │   │   ├── chatbot
    │   │   │   └── ChatMessage.tsx
    │   │   ├── scraping
    │   │   │   ├── FileTree.tsx
    │   │   │   └── StatusIndicator.tsx
    │   │   └── ui
    │   │       ├── accordion.tsx
    │   │       ├── alert-dialog.tsx
    │   │       ├── alert.tsx
    │   │       ├── aspect-ratio.tsx
    │   │       ├── avatar.tsx
    │   │       ├── badge.tsx
    │   │       ├── breadcrumb.tsx
    │   │       ├── button.tsx
    │   │       ├── calendar.tsx
    │   │       ├── card.tsx
    │   │       ├── carousel.tsx
    │   │       ├── chart.tsx
    │   │       ├── checkbox.tsx
    │   │       ├── collapsible.tsx
    │   │       ├── command.tsx
    │   │       ├── context-menu.tsx
    │   │       ├── dialog.tsx
    │   │       ├── drawer.tsx
    │   │       ├── dropdown-menu.tsx
    │   │       ├── form.tsx
    │   │       ├── hover-card.tsx
    │   │       ├── input-otp.tsx
    │   │       ├── input.tsx
    │   │       ├── label.tsx
    │   │       ├── menubar.tsx
    │   │       ├── navigation-menu.tsx
    │   │       ├── pagination.tsx
    │   │       ├── popover.tsx
    │   │       ├── progress.tsx
    │   │       ├── radio-group.tsx
    │   │       ├── resizable.tsx
    │   │       ├── scroll-area.tsx
    │   │       ├── select.tsx
    │   │       ├── separator.tsx
    │   │       ├── sheet.tsx
    │   │       ├── sidebar.tsx
    │   │       ├── skeleton.tsx
    │   │       ├── slider.tsx
    │   │       ├── sonner.tsx
    │   │       ├── switch.tsx
    │   │       ├── table.tsx
    │   │       ├── tabs.tsx
    │   │       ├── textarea.tsx
    │   │       ├── toast.tsx
    │   │       ├── toaster.tsx
    │   │       ├── toggle-group.tsx
    │   │       ├── toggle.tsx
    │   │       ├── tooltip.tsx
    │   │       └── use-toast.ts
    │   ├── hooks
    │   │   ├── use-mobile.tsx
    │   │   └── use-toast.ts
    │   ├── index.css
    │   ├── lib
    │   │   ├── api.ts
    │   │   └── utils.ts
    │   ├── main.tsx
    │   ├── pages
    │   │   ├── ChatbotPage.tsx
    │   │   ├── NotFound.tsx
    │   │   └── ScrapingPage.tsx
    │   └── vite-env.d.ts
    ├── tailwind.config.ts
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
```

## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/arpan9422/udemy-rag.git`
3. **Create** a new branch: `git checkout -b feature/your-feature`
4. **Commit** your changes: `git commit -am 'Add some feature'`
5. **Push** to your branch: `git push origin feature/your-feature`
6. **Open** a pull request

Please ensure your code follows the project's style guidelines and includes tests where applicable.

---
*This README was generated with ❤️ by ReadmeBuddy*
