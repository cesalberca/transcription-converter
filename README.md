# SRTX to TXT Converter

A Deno script that converts SRTX subtitle files to formatted TXT files, grouping text by speaker.

## Requirements

- [Deno](https://deno.land/) version 1.37.0 or higher

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/transcription-converter.git
cd transcription-converter
```

2. No additional installation is needed since Deno includes all dependencies.

## Usage

Convert a single SRTX file to TXT:

```bash
deno task start interview.srtx output.txt
```

Or run directly with permissions:

```bash
deno run --allow-read --allow-write convert.ts input.srtx output.txt
```

### Development Mode

Run with file watching (auto-reloads on changes):

```bash
deno task dev input.srtx output.txt
```

## Input Format

The script expects SRTX files in the following format:

```
1
00:00:01,334 --> 00:00:04,004
Speaker
Text content

2
00:00:04,004 --> 00:00:06,806
Speaker
More text content
```

## Output Format

The output will be formatted as:

```
**Speaker**: Text content More text content

**Another Speaker**: Their text content
```

## License

MIT 
