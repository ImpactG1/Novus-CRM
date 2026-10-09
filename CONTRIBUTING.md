# Contributing to Novus CRM

Thank you for your interest in contributing to **Novus CRM**! We welcome all contributions from bug reports and documentation updates to new features and architectural enhancements.

---

## 🛠️ Development Setup

1. **Fork the repository** on GitHub:
   [https://github.com/ImpactG1/Novus-CRM](https://github.com/ImpactG1/Novus-CRM)

2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/<your-username>/Novus-CRM.git
   cd Novus-CRM
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

5. **Run the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

6. **Validate the build**:
   ```bash
   npm run build
   ```

---

## 🌿 Branching & Git Workflow

- Create a feature branch with a descriptive name:
  ```bash
  git checkout -b feature/your-feature-name
  # or
  git checkout -b fix/issue-description
  ```
- Write clear, concise commit messages following [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add WhatsApp bulk messaging webhook listener`
  - `fix: resolve GST calculation rounding on invoices`
  - `docs: update deployment instructions for Supabase`

---

## 📋 Pull Request Guidelines

1. Ensure the code compiles cleanly (`npm run build`).
2. Keep PRs focused on a single responsibility.
3. Include screenshots or screen recordings for any visual changes.
4. Reference any linked issues in your PR description (e.g., `Closes #12`).

---

## 💬 Community & Code of Conduct

- Be welcoming, respectful, and constructive in all discussions, issues, and reviews.
- Focus on what is best for the open-source community and users of Novus CRM.
