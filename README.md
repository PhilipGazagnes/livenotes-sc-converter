# SongCode Converter

Convert SongCode (`.sc`) files to Livenotes JSON format.

## Installation

```bash
npm install @livenotes/songcode-converter
```

## Usage

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

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Ensure code is properly formatted (`npm run format`)
6. Ensure linting passes (`npm run lint`)
7. Submit a pull request

## License

MIT © Philip Gazagnes

## Links

- [GitHub Repository](https://github.com/PhilipGazagnes/livenotes-sc-converter)
- [Documentation](https://github.com/PhilipGazagnes/livenotes-documentation)
- [Issues](https://github.com/PhilipGazagnes/livenotes-sc-converter/issues)
- [NPM Package](https://www.npmjs.com/package/@livenotes/songcode-converter)
