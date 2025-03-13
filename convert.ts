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
  let currentEntry: Partial<SubtitleEntry> = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;

    if (/^\d+$/.test(trimmedLine)) {
      if (Object.keys(currentEntry).length > 0) {
        entries.push(currentEntry as SubtitleEntry);
      }
      currentEntry = { id: parseInt(trimmedLine) };
    } else if (trimmedLine.includes("-->")) {
      currentEntry.timeframe = trimmedLine;
    } else {
      if (!currentEntry.speaker) {
        currentEntry.speaker = trimmedLine;
      } else {
        currentEntry.text = trimmedLine;
      }
    }
  }

  if (Object.keys(currentEntry).length > 0) {
    entries.push(currentEntry as SubtitleEntry);
  }

  return entries;
}

function groupBySpeaker(entries: SubtitleEntry[]): string {
  let output = "";
  let currentSpeaker = "";
  let currentText = "";

  for (const entry of entries) {
    if (currentSpeaker !== entry.speaker) {
      if (currentText) {
        output += `**${currentSpeaker}**: ${currentText.trim()}\n\n`;
        currentText = "";
      }
      currentSpeaker = entry.speaker;
    }
    currentText += entry.text + " ";
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
const inputFile = args[0];
const outputFile = args[1];

if (!inputFile || !outputFile) {
  console.error("Usage: deno run --allow-read --allow-write convert.ts <input.srtx> <output.txt>");
  Deno.exit(1);
}

await convertSrtxToTxt(inputFile, outputFile);

// Make this file a module
export {}; 