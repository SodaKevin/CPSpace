import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { chatWithAI, generateChatTitle } from "./chatbot/chatController.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", chatWithAI);
app.post("/api/chat-title", generateChatTitle);

app.get("/", (req, res) => {
  res.send("CPSpace server running");
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
