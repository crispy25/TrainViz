import fs from "fs/promises";


function extractInt(text: string): number {
  const match = text.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

export function dictKeysToInt(data: { [id: string] : any }) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[extractInt(key)] = value;
    return acc;
  }, {} as { [id: number] : any });
}

export async function readJSON(filePath: string) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}
