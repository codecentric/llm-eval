# Frontend Semantic Versioning

This document describes the semantic versioning workflow for the LLM-Eval frontend.

## Overview

The frontend now supports proper semantic versioning with automated Docker image builds and GitHub releases. The versioning system creates multiple image tags to support different deployment scenarios.

## Versioning Workflow

### Automatic Release from package.json

The simplest way to create a release is to update the version in `frontend/package.json`:

1. Update the version in `frontend/package.json` (e.g., from `0.1.0` to `0.2.0`)
2. Commit and push the change
3. Manually trigger the "Frontend Release" workflow in GitHub Actions
4. The workflow will:
   - Create a git tag `frontend-v0.2.0`
   - Build and push Docker images with semantic version tags
   - Create a GitHub release

### Manual Release with Custom Version

You can also create a release with a custom version:

1. Go to GitHub Actions → "Frontend Release" workflow
2. Click "Run workflow"
3. Enter the desired version (e.g., `1.0.0`)
4. The workflow will use this version instead of package.json

### Tag-based Release

Creating a git tag will automatically trigger a release:

```bash
git tag frontend-v1.0.0
git push origin frontend-v1.0.0
```

## Docker Image Tags

For each release (e.g., version `1.2.3`), the following Docker image tags are created:

- `ghcr.io/codecentric/llm-eval/rag-eval-ui:1.2.3` - Exact version
- `ghcr.io/codecentric/llm-eval/rag-eval-ui:v1.2.3` - Exact version with 'v' prefix
- `ghcr.io/codecentric/llm-eval/rag-eval-ui:1.2` - Minor version (latest patch)
- `ghcr.io/codecentric/llm-eval/rag-eval-ui:1` - Major version (latest minor and patch)
- `ghcr.io/codecentric/llm-eval/rag-eval-ui:latest` - Latest release

## Deployment Strategies

### Development/Testing
Use SHA-based images from the main branch:
```yaml
image: ghcr.io/codecentric/llm-eval/rag-eval-ui:abc12345
```

### Production with Pinned Version
Use exact version for reproducible deployments:
```yaml
image: ghcr.io/codecentric/llm-eval/rag-eval-ui:1.2.3
```

### Production with Auto-Updates
Use major or minor version tags for automatic updates:
```yaml
image: ghcr.io/codecentric/llm-eval/rag-eval-ui:1.2  # Gets patches automatically
image: ghcr.io/codecentric/llm-eval/rag-eval-ui:1    # Gets minor and patches automatically
```

### Latest Release
Use for development or testing the latest features:
```yaml
image: ghcr.io/codecentric/llm-eval/rag-eval-ui:latest
```

## Pre-release Versions

Pre-release versions (containing `alpha`, `beta`, or `rc`) are marked as pre-releases in GitHub and get the same image tags but are not considered stable.

Example: `1.0.0-beta.1` creates:
- `ghcr.io/codecentric/llm-eval/rag-eval-ui:1.0.0-beta.1`
- `ghcr.io/codecentric/llm-eval/rag-eval-ui:v1.0.0-beta.1`
- etc.

## Updating Docker Compose

To use semantic versioning in docker-compose.yaml:

```yaml
services:
  frontend:
    image: ghcr.io/codecentric/llm-eval/rag-eval-ui:1.2
    # ... other configuration
```

## Version Management Best Practices

1. **Follow Semantic Versioning**: Use `MAJOR.MINOR.PATCH` format
   - MAJOR: Breaking changes
   - MINOR: New features (backward compatible)
   - PATCH: Bug fixes (backward compatible)

2. **Update package.json**: Keep the version in `frontend/package.json` up to date

3. **Tag Naming**: Use `frontend-v` prefix for frontend-specific tags to avoid conflicts

4. **Testing**: Test releases in development environments before production deployment

## Troubleshooting

### Workflow Fails
- Check that the version format is valid (e.g., `1.2.3`, not `v1.2.3`)
- Ensure you have push permissions to the repository
- Verify that the package.json syntax is valid

### Missing Images
- Check the GitHub Actions logs for build failures
- Verify that the GitHub Container Registry permissions are correct
- Ensure the workflow completed successfully

### Version Conflicts
- If a tag already exists, the workflow will skip tag creation
- Delete the existing tag if you need to recreate it:
  ```bash
  git tag -d frontend-v1.0.0
  git push origin :refs/tags/frontend-v1.0.0
  ```