# SongCode Converter

[![npm version](https://img.shields.io/npm/v/@livenotes/songcode-converter.svg)](https://www.npmjs.com/package/@livenotes/songcode-converter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-205%20passing-brightgreen.svg)](#)
[![Coverage](https://img.shields.io/badge/coverage-92.47%25-brightgreen.svg)](#)

Convert SongCode (`.sc`) files to Livenotes JSON format.

> **SongCode** is a human-friendly text format for writing chord charts with lyrics. This package converts SongCode to structured JSON for music applications.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [Documentation](#documentation)
- [Error Handling](#error-handling)
- [Example](#example)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install @livenotes/songcode-converter
```

## Quick Start

```typescript
import { SongCodeConverter } from '@livenotes/songcode-converter';

// Read a SongCode file
const songCodeContent = fs.readFileSync('song.sc', 'utf-8');

// Convert to Livenotes JSON
const converter = new SongCodeConverter();
const result = converter.convert(songCodeContent);

console.log(result); // Livenotes JSON object
```

## Features

- ✅ Full SongCode syntax support
- ✅ Pattern definitions with loops and modifiers
- ✅ Metadata parsing (tempo, time signature, capo, etc.)
- ✅ Section parsing with lyrics
- ✅ Comprehensive error messages
- ✅ TypeScript support with full type definitions
- ✅ Thoroughly tested (>90% coverage)

## Documentation

For complete SongCode language documentation, see:
- [Language Reference](https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/songcode-language-reference.md)
- [Parser Specification](https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/parser-generator-specification.md)
- [JSON Structure](https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/livenotes-json-structure-reference.md)
- [Quick Start Tutorial](https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/songcode-quick-start-tutorial.md)

## Error Handling

The converter throws `SongCodeError` for all parsing and validation errors. Each error includes:
- **Error code** (e.g., `E1.2.1`) - Maps to the error catalog in the specification
- **Message** - Human-readable description
- **Line number** - Where the error occurred (when applicable)
- **Context** - Additional context about the error

```typescript
import { SongCodeConverter, SongCodeError } from '@livenotes/songcode-converter';

const converter = new SongCodeConverter();

try {
  const result = converter.convert(songCode);
} catch (error) {
  if (error instanceof SongCodeError) {
    console.error(`Error ${error.code}: ${error.message}`);
    if (error.line) {
      console.error(`  at line ${error.line}`);
    }
    if (error.context) {
      console.error(`  context: ${error.context}`);
    }
  }
}
```

### Common Error Codes

- `E1.1.1` - Invalid UTF-8 encoding
- `E1.2.1` - Invalid BPM value
- `E1.2.2` - Invalid time signature
- `E1.3.1` - Invalid pattern definition
- `E1.4.1` - Invalid section header
- `E2.1.1` - Invalid chord notation
- `E3.1.1` - Measure doesn't fit time signature
- `E3.2.1` - Lyric measure count mismatch

See the [Error Catalog](https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/parser-generator-specification.md#comprehensive-error-catalog) for a complete list.

## Example

**Input** (`song.sc`):
```songcode
@name Simple Song
@artist The Band
@bpm 120

$1
G;C;D;G

Verse
$1
--
First line of the verse _2
Second line of the verse _2

Chorus
Em;C;G;D
--
This is the chorus _4
```

**Output** (JSON):
```json
{
  "meta": {
    "name": "Simple Song",
    "artist": "The Band",
    "bpm": 120,
    "time": {
      "numerator": 4,
      "denominator": 4
    }
  },
  "patterns": {
    "A": {
      "sc": "G;C;D;G",
      "json": [[["G", ""]], [["C", ""]], [["D", ""]], [["G", ""]]],
      "measures": 4
    }
  },
  "sections": [...],
  "prompter": [...]
}
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:unit
npm run test:integration

# Build
npm run build

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
```

### Project Structure

```
src/
├── phase1/         # First pass parsing
│   ├── FileReader.ts
│   ├── MetadataParser.ts
│   ├── PatternParser.ts
│   └── SectionParser.ts
├── phase2/         # Pattern transformation
│   ├── ChordParser.ts
│   ├── PatternTransformer.ts
│   └── MeasureCounter.ts
├── phase3/         # Validation
│   ├── TimeSignatureValidator.ts
│   ├── MeasureValidator.ts
│   └── LyricTimingValidator.ts
├── phase4/         # Prompter generation
│   ├── PatternExpander.ts
│   ├── MeasureStacker.ts
│   ├── LyricPairer.ts
│   └── PromptItemBuilder.ts
├── types/          # TypeScript type definitions
├── errors/         # Error classes
└── index.ts        # Main converter
```

### Testing

This project follows Test-Driven Development (TDD). Tests are organized by phase:

- `tests/unit/phase1/` - First pass parsing tests
- `tests/unit/phase2/` - Pattern transformation tests
- `tests/unit/phase3/` - Validation tests
- `tests/unit/phase4/` - Prompter generation tests
- `tests/integration/` - End-to-end conversion tests

All test cases are defined in the [Test Suite Specification](https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/test-suite-specification.md).

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Ensure code is properly formatted (`npm run format`)
6. Ensure linting passes (`npm run lint`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details (coming soon).

## License

MIT © Philip Gazagnes

See [LICENSE](LICENSE) file for details.

## Links

- [GitHub Repository](https://github.com/PhilipGazagnes/livenotes-sc-converter)
- [Documentation](https://github.com/PhilipGazagnes/livenotes-documentation)
- [Issues](https://github.com/PhilipGazagnes/livenotes-sc-converter/issues)
- [NPM Package](https://www.npmjs.com/package/@livenotes/songcode-converter)
- [Changelog](CHANGELOG.md)

---

**Made with ❤️ for musicians and developers**
