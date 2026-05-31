# Vortic Website Builder

Vortic is a Next.js-based visual website builder with a block-based editor, template system, and publishing pipeline.

## Current State

This project is a work-in-progress website builder. It includes:

- Visual editor with drag & drop
- 165+ templates across different niches
- Basic publishing flow
- Form submission handling
- Analytics collection (demo)
- Multi-tenant routing

**Note:** Many features are either partially implemented or exist as architectural scaffolding. The project is not yet production-ready.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Prisma + PostgreSQL
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Type Safety**: TypeScript

## Main Features

### Visual Editor
- Located at `/editor`
- Block-based page building
- Template selection
- Basic properties panel

### Templates
- Available at `/templates`
- Contains a large number of pre-defined templates
- Templates can be applied in the editor

### Published Sites
- Multi-tenant routing via `/_sites/[site]/[slug]`
- Basic static rendering of published pages

### Forms
- Form submissions are handled at `/api/forms/submit`
- Data is saved to the database (Lead model)

## Project Structure

```
src/
├── app/                    # Next.js routes and API endpoints
├── components/
│   ├── editor/            # Visual editor components
│   └── renderer/          # Block rendering components
├── lib/
│   ├── publishing/        # Publishing and compilation logic
│   ├── security/          # Security utilities
│   └── theme/             # Templates and theming
└── store/                 # Zustand state management
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (see `.env.example`)

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Known Limitations

- Authentication is not fully implemented
- Some editor features are incomplete
- Collaboration is simulated
- Analytics data is mostly demo data
- Several advanced publishing features are not production-tested

## License

This project is provided as-is for educational and development purposes.