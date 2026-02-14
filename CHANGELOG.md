# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-14

### Initial Release 🎉

This is the first stable release of the SongCode to Livenotes JSON converter.

#### Added

**Core Functionality**
- ✅ Complete SongCode parser with all 16 bricks across 6 phases
- ✅ Full support for SongCode syntax (v1.0)
- ✅ TypeScript implementation with comprehensive type definitions
- ✅ Error handling with detailed error codes and messages

**Phase 1: First Pass Parsing**
- UTF-8 file reading with validation
- Metadata parsing (`@bpm`, `@time`, `@original`, etc.)
- Pattern definition parsing (`$1`, `$2`, etc.)
- Section parsing with modifiers and lyrics

**Phase 1.5: Pattern Organization**
- Automatic pattern ID assignment (A, B, C...)
- Pattern deduplication and reuse detection

**Phase 2: Pattern Transformation**
- Chord parsing with base/extension splitting
- Pattern-to-JSON array conversion
- Loop syntax support (`[pattern]N`)
- Multi-chord measure support
- Special symbols (`%`, `_`, `=`)
- Measure counting with loop expansion

**Phase 3: Validation**
- Time signature validation
- Measure count validation
- Lyric timing validation
- Section modifier validation

**Phase 3.5: Lyric Transformation**
- Lyric string to object transformation
- Style detection (normal, info, musician)
- Measure count association

**Phase 4: Prompter Generation**
- Pattern expansion and loop resolution
- Measure stacking with modifiers
- `_before` and `_after` support
- `_cutStart` and `_cutEnd` support
- `_repeat` modifier support
- `%` repeat symbol resolution
- Lyric-to-measure pairing
- Pattern optimization algorithm
- Tempo change tracking

**Features**
- 📦 Zero runtime dependencies
- 🎯 205 comprehensive tests (100% passing)
- 📊 >92% code coverage
- ⚡ High performance (1-3ms per song conversion)
- 🔒 Strict TypeScript types
- 📚 Complete JSDoc documentation
- 🎸 Real-world tested (AC/DC's "Highway to Hell")

**Supported SongCode Features**
- All metadata keys (@bpm, @time, @original, @capo, @pitch, @name, @artist, @warning, @end)
- Pattern definitions with loops: `[A;G;C;D]3`
- Multi-chord measures: `A B G D`
- Line breaks in patterns: `:`
- Special symbols: `%` (repeat), `_` (empty), `=` (remover)
- Section modifiers: `_repeat`, `_cutStart`, `_cutEnd`, `_before`, `_after`
- Section overrides: `@bpm`, `@time`
- Lyric timing: `_N` (measure counts)
- Lyric styles: `***info***`, `:::musician:::`
- Comments: `!comment text`

#### Technical Details

**Architecture**
- Modular brick-based design
- Six-phase pipeline processing
- Clean separation of concerns
- Comprehensive error handling

**Quality Metrics**
- Test Coverage: 92.47% statements, 93.75% lines, 97.87% functions
- Test Count: 205 tests (192 unit, 13 integration)
- Integration Examples: 12/12 passing
- TypeScript Strict Mode: Enabled
- ESLint: Zero warnings

**Documentation**
- Complete language reference
- Parser/generator specification
- JSON structure reference
- Quick start tutorial
- 12 conversion examples
- JSDoc on all public APIs

#### Development

**Test-Driven Development**
- Followed strict TDD methodology
- Red-Green-Refactor cycle
- Comprehensive test suite specification
- All tests written before implementation

**Tools & Setup**
- TypeScript 5.x
- Jest for testing
- ESLint + Prettier
- Node.js 18+

---

## Links

- [Documentation](https://github.com/PhilipGazagnes/livenotes-documentation)
- [Language Reference](https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/songcode-language-reference.md)
- [Parser Specification](https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/parser-generator-specification.md)
- [GitHub Repository](https://github.com/PhilipGazagnes/livenotes-sc-converter)
- [Issues](https://github.com/PhilipGazagnes/livenotes-sc-converter/issues)

[1.0.0]: https://github.com/PhilipGazagnes/livenotes-sc-converter/releases/tag/v1.0.0
