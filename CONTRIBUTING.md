# Contributing to SongCode Converter

Thank you for your interest in contributing to the SongCode Converter! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Running Tests](#running-tests)
- [Code Style](#code-style)
- [Making Changes](#making-changes)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows a standard code of conduct. Be respectful, inclusive, and constructive in all interactions.

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- Git
- A text editor or IDE (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/livenotes-sc-converter.git
   cd livenotes-sc-converter
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/PhilipGazagnes/livenotes-sc-converter.git
   ```

---

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Run tests in watch mode:**
   ```bash
   npm run test:watch
   ```

5. **Check test coverage:**
   ```bash
   npm run test:coverage
   ```

---

## Running Tests

The project uses Jest for testing with comprehensive test coverage.

### Test Structure

- **Unit Tests**: Located in `tests/unit/` organized by phase
  - Phase 1: First Pass Parsing
  - Phase 1.5: Pattern Organization
  - Phase 2: Pattern Transformation
  - Phase 3: Validation
  - Phase 3.5: Lyric Transformation
  - Phase 4: Prompter Generation

- **Integration Tests**: Located in `tests/integration/`
  - Tests complete SongCode files from documentation examples
  - Validates end-to-end conversion accuracy

### Running Specific Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- PatternParser.test.ts

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Test Specifications

Refer to the [Test Suite Specification](../livenotes-documentation/songcode/test-suite-specification.md) in the documentation repository for detailed test case descriptions.

---

## Code Style

### TypeScript Guidelines

- **Strict mode enabled**: All TypeScript strict checks are enforced
- **No implicit any**: Always specify types
- **Explicit return types**: Add return types to functions
- **Use interfaces**: Prefer interfaces over type aliases for object shapes

### Naming Conventions

- **Classes**: PascalCase (e.g., `SongCodeConverter`, `PatternParser`)
- **Functions/Methods**: camelCase (e.g., `parseMetadata`, `validateChords`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ERROR_CODES`, `MAX_BPM`)
- **Interfaces**: PascalCase, no "I" prefix (e.g., `MetadataResult`, not `IMetadataResult`)
- **Files**: kebab-case (e.g., `pattern-parser.ts`)

### Code Formatting

The project uses ESLint and Prettier:

```bash
# Check linting
npm run lint

# Format code
npm run format
```

### Documentation

- Add JSDoc comments to public APIs
- Include `@param`, `@returns`, and `@throws` tags
- Provide usage examples for complex functions

Example:
```typescript
/**
 * Converts a SongCode string to Livenotes JSON format.
 * 
 * @param songCode - The SongCode content as a string
 * @returns The converted Livenotes JSON object
 * @throws {SongCodeError} If the SongCode contains syntax or validation errors
 * 
 * @example
 * ```typescript
 * const converter = new SongCodeConverter();
 * const result = converter.convert(songCode);
 * ```
 */
public convert(songCode: string): LivenotesJSON {
  // ...
}
```

---

## Making Changes

### Branching Strategy

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Write tests** for new functionality:
   - Add unit tests for individual functions
   - Add integration tests for complete workflows
   - Aim for >90% code coverage

4. **Run tests and linting:**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add support for new SongCode feature"
   ```

### Commit Message Format

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `chore:` Maintenance tasks

Examples:
```
feat: add support for 6/8 time signature
fix: resolve % symbol in multi-chord measures
docs: update README with new examples
test: add edge cases for pattern validation
```

---

## Submitting Pull Requests

1. **Update your fork:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Include test results
   - Add screenshots for UI changes (if applicable)

4. **PR Checklist:**
   - [ ] Tests pass locally
   - [ ] Code follows style guidelines
   - [ ] Documentation updated (if needed)
   - [ ] CHANGELOG.md updated (for notable changes)
   - [ ] No console.log or debug statements
   - [ ] Commit messages follow conventions

5. **Address review feedback:**
   - Make requested changes
   - Push updates to the same branch
   - Respond to comments

---

## Reporting Bugs

Found a bug? Please create an issue with:

1. **Clear title** describing the problem
2. **Steps to reproduce** the issue
3. **Expected behavior** vs actual behavior
4. **Sample SongCode** that triggers the bug (if applicable)
5. **Environment details**:
   - Node.js version
   - npm version
   - Package version
   - Operating system

**Example:**

```markdown
### Bug: Invalid chord parsing for Bb7

**Steps to reproduce:**
1. Convert SongCode with chord `Bb7`
2. Expected: `["Bb", "7"]`
3. Actual: Error "Invalid chord notation"

**SongCode:**
\`\`\`
Verse
Bb7;F;C;G
\`\`\`

**Environment:**
- Node.js: 18.12.0
- Package: @livenotes/songcode-converter@1.0.0
- OS: macOS 13.0
```

---

## Suggesting Features

Have an idea for a new feature? Create an issue with:

1. **Feature description**: What should it do?
2. **Use case**: Why is this feature needed?
3. **Example**: Show how it would work
4. **SongCode syntax** (if proposing new syntax)

**Example:**

```markdown
### Feature: Support for fermata symbols

**Description:**
Add support for fermata (hold) symbols in measures.

**Use case:**
Musicians need to indicate held notes at the end of phrases.

**Proposed syntax:**
\`\`\`
Verse
C;G;Am;F^
\`\`\`

Where `^` indicates a fermata on the F chord.
```

---

## Architecture Overview

The converter uses a **6-phase pipeline architecture**:

1. **Phase 1: First Pass Parsing** - Parse file structure
2. **Phase 1.5: Pattern Organization** - Assign pattern IDs
3. **Phase 2: Pattern Transformation** - Convert patterns to JSON
4. **Phase 3: Validation** - Validate timing and structure
5. **Phase 3.5: Lyric Transformation** - Transform lyric strings
6. **Phase 4: Prompter Generation** - Build final output

Each phase is implemented as a separate "brick" (module) in the `src/` directory.

For detailed specifications, see:
- [Parser/Generator Specification](https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/parser-generator-specification.md)
- [Test Suite Specification](https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/test-suite-specification.md)

---

## Questions?

- Open an issue for technical questions
- Check existing issues and pull requests
- Review the [documentation](https://github.com/PhilipGazagnes/livenotes-documentation/tree/main/songcode)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SongCode Converter! 🎸
