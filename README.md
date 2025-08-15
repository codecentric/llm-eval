# LLM-Eval

A flexible, extensible, and reproducible framework for evaluating LLM workflows, applications, retrieval-augmented generation pipelines, and standalone models across custom and standard datasets.

## 🚀 Key Features

- 📚 **Document-Based Q&A Generation**: Transform your technical documentation, guides, and knowledge bases into comprehensive question-answer test catalogs
- 📊 **Multi-Dimensional Evaluation Metrics**:
  - ✅ **Answer Relevancy**: Measures how well responses address the actual question
  - 🧠 **G-Eval**: Sophisticated evaluation using other LLMs as judges
  - 🔍 **Faithfulness**: Assesses adherence to source material facts
  - 🚫 **Hallucination Detection**: Identifies fabricated information not present in source documents
- 📈 **Long-Term Quality Tracking**:
  - 📆 **Temporal Performance Analysis**: Monitor model degradation or improvement over time
  - 🔄 **Regression Testing**: Automatically detect when model updates negatively impact performance
  - 📊 **Trend Visualization**: Track quality metrics across model versions with interactive charts
- 🔄 **Universal Compatibility**: Seamlessly works with all OpenAI-compatible endpoints including local solutions like Ollama
- 🏷️ **Version Control for Q&A Catalogs**: Easily track changes in your evaluation sets over time
- 📊 **Comparative Analysis**: Visualize performance differences between models on identical question sets
- 🚀 **Batch Processing**: Evaluate multiple models simultaneously for efficient workflows
- 🔌 **Extensible Plugin System**: Add new providers, metrics, and dataset generation techniques

### Available Providers

- **OpenAI**: Integrate and evaluate models from OpenAI's API, including support for custom base URLs, temperature, and language control
- **Azure OpenAI**: Use Azure-hosted OpenAI models with deployment, API version, and custom language output support
- **C4**: Connect to C4 endpoints for LLM evaluation with custom configuration and API key support

## 📖 Table of Contents

1. [🚀 Key Features](#-key-features)
2. [📖 Table of Contents](#-table-of-contents)
3. [📝 Introduction](#-introduction)
4. [Getting Started](#getting-started)
   1. [Running LLM-Eval Locally](#running-llm-eval-locally)
      - [Prerequisites](#prerequisites)
      - [Quick Start - for local usage](#quick-start---for-local-usage)
   2. [Development Setup](#development-setup)
      - [Development prerequisites](#development-prerequisites)
      - [Installation & Local Development](#installation--local-development)
      - [Keycloak Setup (Optional if you want to override defaults)](#keycloak-setup-optional-if-you-want-to-override-defaults)
      - [Troubleshooting](#troubleshooting)
5. [🤝 Contributing & Code of Conduct](#-contributing--code-of-conduct)
6. [📜 License](#-license)

## 📝 Introduction

LLM-Eval is an open-source toolkit designed to evaluate large language model workflows, applications, retrieval-augmented generation pipelines, and standalone models. Whether you're developing a conversational agent, a summarization service, or a RAG-based search tool, LLM-Eval provides a clear, reproducible framework to test and compare performance across providers, metrics, and datasets.

_Key benefits include:_ end-to-end evaluation of real-world applications, reproducible reports, and an extensible platform for custom metrics and datasets.

## Getting Started

### Running LLM-Eval Locally

To run LLM-Eval locally (for evaluation and usage, not development), use our pre-configured Docker Compose setup.

#### Prerequisites

- Docker
- Docker Compose

#### Quick Start - for local usage

1. **Clone the repository:**

   ```bash
   git clone <LLM-Eval github url>
   cd llm-eval
   ```

2. **Copy and configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env to add your API keys and secrets as needed
   ```

   **Required:**

   - Generate the encryption keys set to `CHANGEME` with the respective commands commented next to them in `.env`
   - Don't forget to set azure openai keys and the `AZURE_OPENAI_EMBEDDING_DEPLOYMENT=`, without these the catalog generation will fail.

3. **Enable host networking in docker desktop (for macos users):**

   Go to `Settings -> Resources -> Network` and check `Enable host networking`, without this step on macos, the frontend wouldn't be reachable on localhost.

4. **Start the stack:**

   ```bash
   docker compose -f docker-compose.yaml -f docker-compose.local.yaml up -d
   ```

5. **Access the application:**

   - Web UI: [http://localhost:3000](http://localhost:3000) (Default login: `username`:`password`)
   - API: [http://localhost:8070/docs](http://localhost:8070/docs)

6. **Login using default user**:

   Default user for llmeval username: `username`, password: `password`.

To stop the app:

```bash
docker compose -f docker-compose.yaml -f docker-compose.local.yaml down
```

### Development Setup

If you want to contribute to LLM-Eval or run it in a development environment, follow these steps:

#### Development prerequisites

- Python 3.12
- [Poetry](https://python-poetry.org/docs/#installation)
- Docker (for required services)
- Node.js & npm (for frontend)

#### Installation & Local Development

```bash
git clone <LLM-Eval github url>
cd llm-eval
poetry install --only=main,dev,test
poetry self add poetry-plugin-shell
```

- Install Git pre-commit hook:

  ```bash
  pre-commit install
  ```

1. **Start Poetry shell:**

   ```bash
   poetry shell
   ```

2. **Copy and configure environment:**

   ```bash
   cp .env.example .env
   # Add your API keys and secrets to .env
   # Fill CHANGEME with appropriate keys
   ```

3. **Comment the following in .env**

   from

   ```bash
   # container variables
   KEYCLOAK_HOST=keycloak
   CELERY_BROKER_HOST=rabbit-mq
   PG_HOST=eval-db
   ```

   to

   ```bash
   # container variables
   # KEYCLOAK_HOST=keycloak
   # CELERY_BROKER_HOST=rabbit-mq
   # PG_HOST=eval-db
   ```

4. **Start databases and other services:**

   ```bash
   docker compose up -d
   ```

5. **Start backend:**

   ```bash
   cd backend
   uvicorn llm_eval.main:app --host 0.0.0.0 --port 8070 --reload
   ```

6. **Start Celery worker:**

   ```bash
   cd backend
   celery -A llm_eval.tasks worker --loglevel=INFO --concurrency=4
   ```

7. **Start frontend:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

8. **Login using default user**:

   Default user for llmeval username: `username`, password: `password`.

#### Keycloak Setup (Optional if you want to override defaults)

User access is managed through Keycloak, available at [localhost:8080](localhost:8080) (Default admin credentials: `admin`:`admin`). Select the `llm-eval` realm to manage users.

- If you want to adjust keycloak manually see [docs/keycloak-setup-guide.md](docs/keycloak-setup-guide.md) for step-by-step guide.
- Otherwise it will use default configuration found in [keycloak-config](.devcontainer/import/keycloak/llm-eval-realm.json), when docker compose launchs.

##### Acquiring tokens from keycloak

Once keycloak is up and running, tokens might be requested by calling:

**Without session** by service client `dev-ide` (direct backend api calls):

```shell
$ curl -X POST \
  'http://localhost:8080/realms/llm-eval/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=dev-ide' \
  -d 'client_secret=dev-ide' \
  -d 'grant_type=client_credentials' | jq
```

Or **with session** using client `llm-eval-ui` (frontend calls) :

```shell
$ curl -X POST \
  'http://localhost:8080/realms/llm-eval/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=llm-eval-ui' \
  -d 'client_secret=llm-eval-ui' \
  -d 'username=username' \
  -d 'password=password' \
  -d 'grant_type=password' | jq
```

## 🤝 Contributing & Code of Conduct

As the repo isn't fully prepared for contributions, we aren't open for them for the moment.

## 📜 License

This project is licensed under the [Apache 2.0 License](LICENSE).
