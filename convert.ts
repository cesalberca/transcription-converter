interface SubtitleEntry {
  id: number;
  timeframe: string;
  speaker: string;
  text: string;
}

async function parseSrtxFile(filePath: string): Promise<SubtitleEntry[]> {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split("\n");
  const entries: SubtitleEntry[] = [];
  let currentEntry: Partial<SubtitleEntry> = {
    id: 1,
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    if (/^\d{2}[;:]\d{2}[;:]\d{2}[;:]\d{2}\s+-\s+\d{2}[;:]\d{2}[;:]\d{2}[;:]\d{2}$/.test(trimmedLine) || trimmedLine.includes('-->')) {
      if (currentEntry.timeframe) {
        if (!currentEntry.text && currentEntry.speaker) {
          currentEntry.text = currentEntry.speaker;
          currentEntry.speaker = '';
        }
        entries.push(currentEntry as SubtitleEntry);
        currentEntry = { id: entries.length + 1 };
      }
      currentEntry.timeframe = trimmedLine;
    } else if (/^\d+$/.test(trimmedLine) && !currentEntry.timeframe) {
      currentEntry.id = parseInt(trimmedLine);
    } else {
      if (!currentEntry.speaker) {
        currentEntry.speaker = trimmedLine;
      } else {
        if (!currentEntry.text) {
          currentEntry.text = trimmedLine;
        } else {
          currentEntry.text += ' ' + trimmedLine;
        }
      }
    }
  }

  if (currentEntry.timeframe) {
    if (!currentEntry.text && currentEntry.speaker) {
      currentEntry.text = currentEntry.speaker;
      currentEntry.speaker = "";
    }
    entries.push(currentEntry as SubtitleEntry);
  }

  return entries;
}

function groupBySpeaker(entries: SubtitleEntry[]): string {
  let output = "";
  let currentSpeaker = "";
  let currentText = "";

  for (const entry of entries) {
    const entrySpeaker = entry.speaker || "Unknown";
    if (currentSpeaker !== entrySpeaker) {
      if (currentText) {
        output += `**${currentSpeaker}**: ${currentText.trim()}\n\n`;
        currentText = "";
      }
      currentSpeaker = entrySpeaker;
    }
    currentText += (entry.text || "") + " ";
  }

  // Add the last speaker's text
  if (currentText) {
    output += `**${currentSpeaker}**: ${currentText.trim()}`;
  }

  return output.trim();
}

async function convertSrtxToTxt(inputPath: string, outputPath: string) {
  try {
    const entries = await parseSrtxFile(inputPath);
    const formattedOutput = groupBySpeaker(entries);

    await Deno.writeTextFile(outputPath, formattedOutput);
    console.log(`Successfully converted ${inputPath} to ${outputPath}`);
  } catch (error) {
    console.error("Error converting file:", error);
  }
}

// Get command line arguments
const args = Deno.args;
let inputFile = "";
let outputFile = "";

for (let i = 0; i < args.length; i++) {
  if (!inputFile) {
    inputFile = args[i];
  } else if (!outputFile) {
    outputFile = args[i];
  }
}

if (!inputFile || !outputFile) {
  console.error("Usage: deno run --allow-read --allow-write convert.ts <input.srtx> <output.txt>");
  Deno.exit(1);
}

await convertSrtxToTxt(inputFile, outputFile);

// Make this file a module
export {}; 
