<template><h2 style="margin:0">업무</h2></template>

<script setup>
import { GoogleGenAI } from "@google/genai";

// 1. Vite 환경 변수 가져오기
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 2. GoogleGenAI 생성자에 API 키 전달
const ai = new GoogleGenAI(geminiApiKey);

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();
</script>