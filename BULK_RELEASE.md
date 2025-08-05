# Bulk Release System

This document describes the automated bulk release system implemented for both frontend and backend components using zx-bulk-release.

## Overview

The repository now uses [zx-bulk-release](https://github.com/semrel-extra/zx-bulk-release) to automatically generate semantic versions for multiple packages based on conventional commit messages and create GitHub releases.

## How It Works

### Conventional Commits

The versioning is triggered by conventional commit messages on the `main` branch:

- **`fix:`** → **Patch version** (e.g., 1.0.0 → 1.0.1)
  - Bug fixes and patches
  - Example: `fix: resolve navigation issue in sidebar`

- **`feat:`** → **Minor version** (e.g., 1.0.0 → 1.1.0)
  - New features and enhancements
  - Example: `feat: add dark mode support`

- **`feat!:`** or **`BREAKING CHANGE:`** → **Major version** (e.g., 1.0.0 → 2.0.0)
  - Breaking changes and major updates
  - Example: `feat!: redesign user authentication system`

### Workflow Integration

The bulk release system is integrated into the CI/CD pipeline:

1. **Individual component workflows** (frontend and backend) run tests, linting, and security scans
2. **Bulk Release** analyzes all commits and determines which packages need releases
3. **Build and Push** workflows are triggered only for packages that have new releases
4. **Docker images** are tagged with both semantic versions and component-prefixed versions

### Automated Actions

When a release is triggered, the system automatically:

- ✅ Analyzes commit messages since the last release for each package
- ✅ Determines the next version number for each changed package
- ✅ Updates `package.json` versions
- ✅ Generates changelogs
- ✅ Creates GitHub releases with release notes
- ✅ Tags Docker images with semantic versions
- ✅ Commits version changes back to the repository

## Package Structure

The repository manages two main packages:

### Frontend (rag-eval-ui)
- Location: `frontend/`
- Package name: `rag-eval-ui`
- Technologies: Next.js, React, TypeScript

### Backend (llm-eval-backend)
- Location: `backend/`
- Package name: `llm-eval-backend`
- Technologies: Python, FastAPI, Poetry

## Docker Image Tagging

Images are tagged with multiple tags:

### Frontend Images
- **Short SHA**: `ghcr.io/codecentric/llm-eval/rag-eval-ui:a1b2c3d4` (always)
- **Semantic Version**: `ghcr.io/codecentric/llm-eval/rag-eval-ui:0.1.0` (when release is created)
- **Component Version**: `ghcr.io/codecentric/llm-eval/rag-eval-ui:frontend-v0.1.0` (when release is created)

### Backend Images
- **Short SHA**: `ghcr.io/codecentric/llm-eval/llm-eval-backend:a1b2c3d4` (always)
- **Semantic Version**: `ghcr.io/codecentric/llm-eval/llm-eval-backend:0.1.0` (when release is created)
- **Component Version**: `ghcr.io/codecentric/llm-eval/llm-eval-backend:backend-v0.1.0` (when release is created)

## Configuration Files

- **`.releaserc.json`**: zx-bulk-release configuration (root level)
- **`package.json`**: Root workspace configuration with both frontend and backend
- **`frontend/package.json`**: Frontend package configuration
- **`backend/package.json`**: Backend package configuration (for release detection)
- **`backend/pyproject.toml`**: Python package configuration (Poetry)
- **`.github/workflows/bulk-release.yaml`**: Main bulk release workflow
- **`.github/workflows/frontend-build-and-push.yaml`**: Frontend build workflow
- **`.github/workflows/backend-build-and-push.yaml`**: Backend build workflow

## Development Workflow

### For Pull Requests
- Commits can use any message format
- No releases are created
- Docker images are still built and tagged with SHA

### For Main Branch
- Use conventional commit messages
- Bulk releases are created automatically based on changes in each package
- Only packages with changes get new releases
- Docker images get semantic version tags for released packages

### Example Commit Messages

```bash
# Frontend patch release
git commit -m "fix(frontend): resolve memory leak in chart component"

# Backend minor release  
git commit -m "feat(backend): add new evaluation endpoint"

# Both packages major release
git commit -m "feat!: migrate to new API endpoints

BREAKING CHANGE: API endpoints have changed from /api/v1 to /api/v2"

# Specific package changes
git commit -m "feat(frontend): add export functionality to evaluation results"
git commit -m "fix(backend): resolve database connection timeout"
```

## Benefits

- 🔄 **Automated bulk versioning** - No manual version management for multiple packages
- 📝 **Automatic changelog** - Generated from commit messages
- 🏷️ **Consistent tagging** - Docker images tagged with semantic versions
- 📊 **Release tracking** - GitHub releases with detailed notes
- 🚀 **CI/CD integration** - Seamless workflow integration
- 🎯 **Selective releases** - Only packages with changes get released
- 🔗 **Coordinated releases** - Cross-package dependency management

## Troubleshooting

### No Release Created
- Ensure commits follow conventional format
- Check that you're pushing to `main` branch
- Verify the commit introduces changes worthy of a release for the specific package
- Check that the commit path affects the package you expect

### Failed Release
- Check GitHub Actions logs in the `Bulk Release` workflow
- Ensure `GITHUB_TOKEN` has sufficient permissions
- Verify all dependencies are properly installed
- Check for package configuration issues in `package.json` files

### Package Not Detected
- Ensure the package has a `package.json` file
- Check that the package is listed in the root `workspaces` configuration
- Verify the package is not marked as `private: true` (unless using `--include-private`)
- Check that conventional commits affect files in the package directory