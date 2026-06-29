# Contributing to PrepEntrance

Thank you for contributing to PrepEntrance! Following these guidelines ensures a clean, maintainable, and robust codebase.

## Branch Naming Conventions

Always branch off from `testing` (or `main` if it's a critical hotfix).
Prefix your branch names accurately:

- `feature/description-of-feature` (e.g., `feature/practice-center`)
- `bugfix/description-of-bug` (e.g., `bugfix/login-crash`)
- `hotfix/description-of-issue` (e.g., `hotfix/server-error`)
- `docs/description` (e.g., `docs/update-readme`)

## Commit Message Conventions

We use conventional commits to automatically generate our changelog.

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (white-space, formatting)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests

*Example*: `feat: add AI knowledge engine UI`

## Pull Request Checklist

Before submitting a PR, ensure:
- [ ] You have merged the latest `testing` branch into your branch.
- [ ] `npm run lint` passes with 0 errors.
- [ ] `npx tsc --noEmit` passes with 0 typing errors.
- [ ] The code runs locally without console errors.
- [ ] Unnecessary `console.log` statements have been removed.

## Coding Style

- Use **TypeScript** strictly. Avoid `any` types.
- Follow **ESLint** and **Prettier** rules automatically applied by the project.
- Use **Tailwind CSS** for all styling; avoid custom CSS unless absolutely necessary.
- Build components using **Shadcn UI** primitives and follow the existing design system.

## Review Process

1. Open a PR against `testing`.
2. Vercel will automatically generate a Preview URL.
3. Reviewers will check the code quality and test the Preview URL.
4. At least 1 approving review is required before merging.
