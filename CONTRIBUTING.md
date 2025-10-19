# 🤝 Contributing to HarmonyShield

**Thank you for your interest in contributing to HarmonyShield!**

This document provides guidelines for invited contributors to help maintain code quality, consistency, and security standards.

---

## 🔐 Access & Permissions

### Private Repository
HarmonyShield is a **private repository** with restricted access. Contributions are only accepted from **invited collaborators** who have been granted access by the repository administrators.

### Getting Access
If you're interested in contributing but don't have access:
1. Contact the project maintainers
2. Provide your GitHub username
3. Wait for invitation approval
4. Accept the repository invitation

### Collaboration Levels
- **Read Access**: View code and documentation
- **Write Access**: Create branches and submit pull requests
- **Admin Access**: Manage repository settings (core team only)

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Security Guidelines](#security-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Communication](#communication)

---

## 📜 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior
- Be respectful and professional
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other contributors
- Maintain confidentiality of private information

### Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing private information without consent
- Any conduct that could be considered inappropriate in a professional setting

### Reporting
Report any unacceptable behavior to the project maintainers privately.

---

## 🚀 Getting Started

### Prerequisites
Before contributing, ensure you have:
- Node.js (v18 or higher) installed
- Git configured with your GitHub account
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Supabase
- Understanding of security best practices

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/harmonyshield/harmonyshield-ai.git
   cd harmonyshield
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   - Contact maintainers for Supabase credentials
   - Never commit `.env` files
   - Use the provided `.env.example` as template

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Verify setup**
   - Navigate to `http://localhost:5173`
   - Ensure the application loads correctly
   - Test authentication flow

### Repository Structure
Familiarize yourself with the project structure documented in [README.md](README.md#project-structure).

---

## 🔄 Development Workflow

### 1. Choose a Task
- Review [TODO.md](TODO.md) for available tasks
- Check [GitHub Issues](../../issues) for reported bugs
- Coordinate with team to avoid duplicate work
- Get task assignment confirmation

### 2. Create a Branch
```bash
# Always branch from main
git checkout main
git pull origin main

# Create a feature branch with descriptive name
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Branch Naming Conventions
- **Features**: `feature/feature-name`
- **Bug Fixes**: `fix/bug-description`
- **Improvements**: `improve/what-you-improve`
- **Documentation**: `docs/what-you-document`
- **Refactoring**: `refactor/what-you-refactor`

### 3. Make Changes
- Write clean, readable code
- Follow coding standards (below)
- Test your changes thoroughly
- Commit frequently with clear messages

### 4. Commit Your Changes
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add social media monitoring dashboard"
```

### Commit Message Format
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): implement two-factor authentication
fix(scanner): resolve URL validation issue
docs(readme): update installation instructions
refactor(dashboard): optimize component rendering
```

### 5. Push Your Branch
```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request
- Go to GitHub repository
- Click "New Pull Request"
- Select your branch
- Fill out PR template completely
- Request review from maintainers

---

## 💻 Coding Standards

### TypeScript
- **Use TypeScript** for all new code
- **Strict mode**: Enable strict type checking
- **No `any`**: Use proper types instead of `any`
- **Interfaces**: Prefer interfaces over types for object shapes
- **Type safety**: Ensure proper type inference

```typescript
// ❌ Bad
const handleSubmit = (data: any) => {
  // ...
}

// ✅ Good
interface SubmitData {
  email: string;
  password: string;
}

const handleSubmit = (data: SubmitData) => {
  // ...
}
```

### React Best Practices
- **Functional components**: Use hooks, not class components
- **Custom hooks**: Extract reusable logic into hooks
- **Component size**: Keep components small and focused
- **Props typing**: Always type component props
- **Key props**: Use stable, unique keys in lists

```typescript
// ✅ Good component structure
interface UserCardProps {
  user: User;
  onEdit: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  // Component logic
  return (
    // JSX
  );
};
```

### File Organization
- **One component per file** (with its types)
- **Group related files** in directories
- **Index exports**: Use index files for clean imports
- **Naming conventions**:
  - Components: `PascalCase.tsx`
  - Hooks: `useCamelCase.ts`
  - Utils: `camelCase.ts`
  - Types: `PascalCase.ts` or inline

### CSS and Styling
- **Use Tailwind CSS** utility classes
- **Semantic tokens**: Use design system colors
- **No inline styles** unless absolutely necessary
- **Responsive design**: Mobile-first approach
- **Dark mode**: Support both themes

```tsx
// ❌ Bad: Direct colors
<div className="bg-blue-500 text-white">

// ✅ Good: Semantic tokens
<div className="bg-primary text-primary-foreground">
```

### Code Quality
- **DRY principle**: Don't Repeat Yourself
- **SOLID principles**: Follow object-oriented design principles
- **Descriptive names**: Use clear, meaningful variable/function names
- **Comments**: Document complex logic, not obvious code
- **Error handling**: Always handle errors gracefully
- **Loading states**: Show feedback for async operations

### ESLint and Formatting
- Follow the project's ESLint configuration
- Format code before committing
- Run linter: `npm run lint`
- Auto-fix issues: `npm run lint:fix`

---

## 🔒 Security Guidelines

### Critical Rules
1. **Never commit secrets**
   - No API keys in code
   - No passwords or tokens
   - Use environment variables
   - Add sensitive files to `.gitignore`

2. **Validate all inputs**
   - Sanitize user input
   - Use Zod for validation
   - Check for XSS vulnerabilities
   - Prevent SQL injection

3. **Implement proper RLS**
   - All tables must have RLS policies
   - Test policies thoroughly
   - Never expose sensitive data
   - Use admin checks server-side only

4. **Authentication security**
   - Never check roles client-side
   - Always verify on server/database
   - Use secure session management
   - Implement proper password requirements

### Security Checklist
Before submitting code that touches security:
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] RLS policies tested
- [ ] No client-side role checks
- [ ] Error messages don't leak info
- [ ] Audit logs for sensitive operations
- [ ] Rate limiting considered
- [ ] XSS prevention applied

### Reporting Security Issues
**DO NOT** create public issues for security vulnerabilities.

Contact maintainers privately with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

---

## 🧪 Testing Requirements

### Test Coverage
- Write tests for new features
- Update tests when modifying existing code
- Aim for meaningful coverage, not just numbers
- Focus on critical user flows

### Testing Tools
```bash
# Run all tests
npm test

# Run specific test file
npm test -- UserDashboard.test.tsx

# Run with coverage
npm test -- --coverage
```

### Types of Tests
1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user flows
4. **Manual Testing**: Always test in browser

### Testing Checklist
- [ ] Unit tests for utilities
- [ ] Component rendering tests
- [ ] User interaction tests
- [ ] Error handling tests
- [ ] Edge cases covered
- [ ] Responsive design tested
- [ ] Dark mode tested
- [ ] Accessibility tested

---

## 🔍 Pull Request Process

### Before Submitting
1. **Self-review your code**
   - Read through all changes
   - Remove debug code
   - Check for console.logs
   - Verify formatting

2. **Test thoroughly**
   - Test all new functionality
   - Test existing features for regression
   - Test on different screen sizes
   - Test both light and dark mode

3. **Update documentation**
   - Update README if needed
   - Add/update code comments
   - Update TODO.md if completing tasks
   - Update CHANGELOG.md for significant changes

### PR Template
When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #(issue number)

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Responsive design verified
- [ ] Dark mode tested

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tests passing
```

### Review Process
1. **Automated checks**: Must pass CI/CD
2. **Code review**: At least one approval required
3. **Testing**: Reviewers will test functionality
4. **Feedback**: Address all comments
5. **Approval**: PR approved by maintainer
6. **Merge**: Maintainer merges to main

### After Merge
- Delete your feature branch
- Update your local main branch
- Monitor for any issues
- Be available for follow-up questions

---

## 📚 Documentation

### Code Documentation
- **Comment complex logic**: Explain why, not what
- **JSDoc for functions**: Document public APIs
- **Type annotations**: Let types be documentation
- **README updates**: Update when adding major features

### Examples
```typescript
/**
 * Validates and sanitizes user input for deep search
 * @param query - Raw search query from user
 * @param type - Type of search (social, email, phone)
 * @returns Sanitized query string
 * @throws {ValidationError} If query format is invalid
 */
export const sanitizeSearchQuery = (
  query: string,
  type: SearchType
): string => {
  // Implementation
};
```

### Documentation Updates
When adding features, update:
- README.md (if user-facing)
- TODO.md (mark as complete)
- CHANGELOG.md (for releases)
- Inline comments (for complex code)
- Type definitions (for APIs)

---

## 💬 Communication

### Channels
- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code review and discussion
- **Private Messages**: Security issues and sensitive topics
- **Team Chat**: Daily communication (if applicable)

### Best Practices
- **Be clear and concise**
- **Provide context** in discussions
- **Ask questions** when unsure
- **Share knowledge** with the team
- **Update status** on assigned tasks
- **Respond promptly** to feedback

### Getting Help
- Review documentation first
- Search existing issues
- Ask specific questions
- Provide error messages and context
- Share code snippets (without secrets)

---

## 🎯 Priority Areas

We especially welcome contributions in:

### High Priority
- Social Management feature implementation
- Mobile responsiveness improvements
- Performance optimizations
- Security enhancements
- Bug fixes

### Medium Priority
- UI/UX improvements
- Documentation updates
- Test coverage
- Accessibility enhancements
- Refactoring tasks

### Ongoing
- Code reviews
- Bug reports
- Feature suggestions
- Documentation improvements

---

## 🏆 Recognition

### Contributors
All contributors will be:
- Listed in CHANGELOG.md
- Acknowledged in release notes
- Credited for significant features
- Part of the project's success

### Becoming a Core Contributor
Regular contributors may be invited to:
- Join the core team
- Get increased repository access
- Participate in planning discussions
- Review pull requests

---

## 📋 Checklist for First Contribution

- [ ] Read this entire document
- [ ] Set up development environment
- [ ] Explore the codebase
- [ ] Pick a good first issue
- [ ] Create a feature branch
- [ ] Make your changes
- [ ] Write/update tests
- [ ] Update documentation
- [ ] Self-review your code
- [ ] Submit pull request
- [ ] Address review feedback

---

## ❓ Questions?

If you have questions about contributing:
1. Check if it's already answered in this guide
2. Search existing GitHub issues
3. Create a new issue with the "question" label
4. Contact maintainers directly for private matters

---

## 📄 License

By contributing to HarmonyShield, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## 🙏 Thank You!

Your contributions make HarmonyShield better for everyone. We appreciate your time, effort, and dedication to creating a safer digital world.

**Happy coding! 🚀**

---

**Last Updated**: January 2025  
**Version**: 1.0.0

For questions or clarifications, please contact the project maintainers.
