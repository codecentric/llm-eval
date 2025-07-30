# Frontend Semantic Versioning

This document describes the automated semantic versioning system implemented for the frontend component.

## Overview

The frontend now uses [semantic-release](https://github.com/semantic-release/semantic-release) to automatically generate semantic versions based on conventional commit messages and create GitHub releases.

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

The semantic versioning is integrated into the CI/CD pipeline:

1. **Lint, Security Scan, and Tests** run in parallel
2. **Semantic Release** runs only on `main` branch pushes (after successful tests)
3. **Build and Push** uses the semantic version for Docker image tagging

### Automated Actions

When a release is triggered, the system automatically:

- ✅ Analyzes commit messages since the last release
- ✅ Determines the next version number
- ✅ Updates `package.json` version
- ✅ Generates `CHANGELOG.md`
- ✅ Creates a GitHub release with release notes
- ✅ Tags Docker images with the semantic version
- ✅ Commits version changes back to the repository

## Docker Image Tagging

Images are tagged with multiple tags:

- **Short SHA**: `ghcr.io/codecentric/llm-eval/rag-eval-ui:a1b2c3d4` (always)
- **Semantic Version**: `ghcr.io/codecentric/llm-eval/rag-eval-ui:1.2.3` (when semantic release creates a new version)
- **Git Tag**: `ghcr.io/codecentric/llm-eval/rag-eval-ui:v1.2.3` (for manual git tags)

## Configuration Files

- **`.releaserc.json`**: Semantic-release configuration
- **`frontend-semantic-release.yaml`**: GitHub workflow for semantic release
- **`frontend-build-and-push.yaml`**: Updated to support semantic versioning
- **`frontend.yaml`**: Main workflow orchestrating the entire pipeline

## Development Workflow

### For Pull Requests
- Commits can use any message format
- No releases are created
- Docker images are still built and tagged with SHA

### For Main Branch
- Use conventional commit messages
- Semantic releases are created automatically
- Docker images get semantic version tags

### Example Commit Messages

```bash
# Patch release (1.0.0 → 1.0.1)
git commit -m "fix: resolve memory leak in chart component"

# Minor release (1.0.0 → 1.1.0)  
git commit -m "feat: add export functionality to evaluation results"

# Major release (1.0.0 → 2.0.0)
git commit -m "feat!: migrate to new API endpoints

BREAKING CHANGE: API endpoints have changed from /api/v1 to /api/v2"
```

## Benefits

- 🔄 **Automated versioning** - No manual version management
- 📝 **Automatic changelog** - Generated from commit messages
- 🏷️ **Consistent tagging** - Docker images tagged with semantic versions
- 📊 **Release tracking** - GitHub releases with detailed notes
- 🚀 **CI/CD integration** - Seamless workflow integration

## Troubleshooting

### No Release Created
- Ensure commits follow conventional format
- Check that you're pushing to `main` branch
- Verify the commit introduces changes worthy of a release

### Failed Release
- Check GitHub Actions logs in the `Semantic Release` workflow
- Ensure `GITHUB_TOKEN` has sufficient permissions
- Verify all dependencies are properly installed