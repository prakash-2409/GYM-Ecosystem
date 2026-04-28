# Contributing to GymOS

Welcome to GymOS! We are thrilled that you'd like to contribute. This document will help you navigate the process of contributing to our project, specifically during **GirlScript Summer of Code (GSSoC)**.

## 🌟 Code of Conduct
By participating in this project, you agree to abide by our Code of Conduct. We expect all contributors to be respectful and constructive in their communications.

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Docker & Docker Compose](https://www.docker.com/) (for PostgreSQL database)
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (if contributing to the mobile app)

### Setup Instructions

1. **Fork the Repository**
   Click the "Fork" button at the top right of the repository page.

2. **Clone your Fork**
   ```bash
   git clone https://github.com/<your-username>/GymOS.git
   cd GymOS
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your required local variables
   ```

4. **Start the Database**
   ```bash
   docker-compose up -d
   ```

5. **Install Dependencies**
   ```bash
   npm install
   ```

6. **Initialize the Database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

7. **Run the Application**
   - Web & API: `npm run dev`
   - Mobile: `cd apps/mobile && flutter pub get && flutter run`

## 🛠️ How to Contribute

### 1. Find an Issue
Look for open issues labeled with `gssoc`, `good first issue`, `level1`, `level2`, or `level3`. Comment on the issue to get it assigned to you.

### 2. Create a Branch
Create a new branch for your work:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Changes
Write your code, following the existing style and architecture. Make sure to document your changes and test them locally.

### 4. Commit your Changes
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat: added new dashboard charts`
- `fix: resolved check-in qr bug`
- `docs: updated README setup instructions`

### 5. Open a Pull Request
Push your branch to your fork and open a Pull Request against the `main` branch of this repository. Fill out the Pull Request template provided.

## 📈 Branching Strategy
- `main`: Stable production-ready code.
- `development` (if exists): Integration branch.
- Feature branches should be branched off `main` and merged back via Pull Requests.

Thank you for contributing to GymOS! We appreciate your efforts in making gym management better.
