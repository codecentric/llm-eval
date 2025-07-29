# Security Scanning

This repository includes automated security scanning through GitHub Actions that replaces the previous GitLab CI security scans.

## Security Workflow

The `security-scan.yaml` workflow provides:

### Secret Detection
- **Tool**: TruffleHog OSS
- **Purpose**: Scans for secrets, API keys, and sensitive data
- **Trigger**: Pull requests to main branch, manual dispatch
- **Output**: `secret-detection-report.json` artifact

### Static Application Security Testing (SAST)
- **Tool**: Semgrep
- **Purpose**: Identifies security vulnerabilities in code
- **Trigger**: Pull requests to main branch, manual dispatch
- **Output**: `sast-report.json` artifact

### Report Analysis
- Automatically analyzes security scan results
- **Fails the workflow if**:
  - Any secrets are detected
  - Critical or high severity vulnerabilities are found
- Provides detailed summaries in GitHub Actions UI

## Running Security Scans

### Automatic
Security scans run automatically on:
- Pull requests targeting the `main` branch

### Manual
To run security scans manually:
1. Go to Actions → Security Scan
2. Click "Run workflow"
3. Select the branch to scan

## Configuration

### Semgrep
The workflow uses Semgrep's `--config=auto` which includes:
- Security-focused rules
- Language-specific vulnerability detection
- Best practice recommendations

To use custom Semgrep rules, set the `SEMGREP_APP_TOKEN` secret and modify the workflow configuration.

### TruffleHog
Currently configured to:
- Only report verified secrets (reduces false positives)
- Scan against the default branch as baseline
- Output detailed JSON reports for analysis

## Security Reports

Security scan artifacts are retained for 30 days and include:
- `secret-detection-report.json` - Detected secrets and sensitive data
- `sast-report.json` - Static analysis security findings

These reports can be downloaded from the Actions run for detailed review.
