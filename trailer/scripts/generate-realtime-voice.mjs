import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const here = path.dirname(fileURLToPath(import.meta.url));
const trailerRoot = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(trailerRoot, "manifest.json"), "utf8"));
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required.");
}

const script = manifest.scenes.map((scene) => scene.narration).join("\n\n");
const outputDir = path.join(trailerRoot, "public", "audio");
const outputPath = path.join(outputDir, "narration.wav");
const chunks = [];
let settled = false;

function wavHeader(byteLength, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + byteLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(byteLength, 40);
  return header;
}

function finish(socket) {
  if (settled) return;
  settled = true;
  clearTimeout(generationTimeout);
  const pcm = Buffer.concat(chunks);
  if (pcm.length === 0) throw new Error("Realtime response completed without audio bytes.");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.concat([wavHeader(pcm.length), pcm]));
  const duration = pcm.length / (24000 * 2);
  process.stdout.write(`Wrote ${outputPath}\nDuration: ${duration.toFixed(2)} seconds\n`);
  socket.close();
}

const socket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-realtime-2.1", {
  headers: { Authorization: `Bearer ${apiKey}` },
});

socket.on("open", () => {
  socket.send(JSON.stringify({
    type: "session.update",
    session: {
      type: "realtime",
      model: "gpt-realtime-2.1",
      output_modalities: ["audio"],
      audio: {
        output: {
          format: { type: "audio/pcm", rate: 24000 },
          voice: "marin",
        },
      },
      instructions: "You are a calm, emotionally present documentary narrator. Speak at roughly 145 words per minute with natural sentence rhythm and no theatrical gaps. Begin immediately with the supplied first word. Do not introduce the reading, describe the task, add commentary, omit words, or rephrase anything.",
    },
  }));
  socket.send(JSON.stringify({
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [{
        type: "input_text",
        text: `The text between NARRATION_START and NARRATION_END is the entire voiceover. Speak only that text, beginning immediately with its first word.\n\nNARRATION_START\n${script}\nNARRATION_END`,
      }],
    },
  }));
  socket.send(JSON.stringify({
    type: "response.create",
    response: {
      output_modalities: ["audio"],
      instructions: "Speak only the narration between the markers. Use connected documentary pacing, natural emotion, and brief sentence-level breaths. Do not speak the markers or add a preamble or sign-off.",
    },
  }));
});

socket.on("message", (payload) => {
  const event = JSON.parse(payload.toString());
  if (event.type === "response.output_audio.delta" && event.delta) {
    chunks.push(Buffer.from(event.delta, "base64"));
  } else if (event.type === "response.done") {
    if (event.response?.status === "failed") {
      const message = event.response?.status_details?.error?.message || "Realtime response failed.";
      throw new Error(message);
    }
    finish(socket);
  } else if (event.type === "error") {
    throw new Error(event.error?.message || "Realtime API error.");
  }
});

socket.on("error", (error) => {
  if (!settled) throw new Error(`Realtime connection failed: ${error.message}`);
});

const generationTimeout = setTimeout(() => {
  if (!settled) {
    socket.close();
    throw new Error("Realtime narration timed out.");
  }
}, 300000);
