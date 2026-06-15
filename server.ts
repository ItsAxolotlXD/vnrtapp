import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini client lazily inside the handler to support key updates without server restart
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse body
  app.use(express.json());

  // HEALTH CHECK
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // V-Intelligence AI Endpoint
  app.post("/api/vplay/ai", async (req, res) => {
    try {
      const { prompt, history } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({ 
          text: "Xin lỗi quý khách, khóa API Gemini (GEMINI_API_KEY) chưa được thiết lập trong cài đặt của ứng dụng Vplay này. Vui lòng thiết lập khóa API để bắt đầu sử dụng trợ lý V-Intelligence." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let contents: any[] = [];
      if (history && Array.isArray(history)) {
        contents = history.map((msg: any) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content || msg.text || "" }]
        }));
      }

      if (prompt) {
        contents.push({
          role: "user",
          parts: [{ text: prompt }]
        });
      }

      if (contents.length === 0) {
        return res.status(400).json({ error: "Yêu cầu không được bỏ trống." });
      }

      // Gemini multi-turn format requirements:
      // 1. Must alternate "user" <-> "model"
      // 2. Must start with "user"
      let sanitizedContents: any[] = [];
      for (const turn of contents) {
        if (sanitizedContents.length === 0) {
          // Skip any models or empty turns until we hit a user turn
          if (turn.role === "user" && turn.parts[0]?.text) {
            sanitizedContents.push(turn);
          }
        } else {
          const lastTurn = sanitizedContents[sanitizedContents.length - 1];
          if (turn.parts[0]?.text) {
            if (lastTurn.role !== turn.role) {
              sanitizedContents.push(turn);
            } else {
              // Merge adjacent turns of the same role
              lastTurn.parts[0].text = `${lastTurn.parts[0].text}\n\n${turn.parts[0].text}`;
            }
          }
        }
      }

      // Fallback if sanitization left it empty (e.g. only assistant greeting was sent)
      if (sanitizedContents.length === 0 && prompt) {
        sanitizedContents.push({
          role: "user",
          parts: [{ text: prompt }]
        });
      }

      if (sanitizedContents.length === 0) {
        return res.status(200).json({ text: "V-Intelligence đã sẵn sàng! Hãy hỏi tôi bất cứ điều gì nhé." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: sanitizedContents,
        config: {
          systemInstruction: "Bạn là V-Intelligence, Trợ lý Trí tuệ Nhân tạo tối tân tích hợp bên trong ứng dụng truyền hình Vplay. Hãy luôn xưng hô lịch sự, thân thiện, và chuyên nghiệp với người dùng truyền hình. Bạn biết cách trả lời tinh tế, ngắn gọn, có cấu trúc đẹp mắt bằng tiếng Việt (thường dùng font chữ sang trọng có markdown). Giới thiệu về mình là trợ lý V-Intelligence của Vplay và sử dụng công nghệ của Gemini API.",
        }
      });

      const replyText = response.text || "Xin lỗi, V-Intelligence không thể sinh phản hồi lúc này.";
      res.json({ text: replyText });
    } catch (e: any) {
      console.error("V-Intelligence endpoint error:", e);
      res.status(500).json({ error: e.message || "Lỗi xảy ra trong quá trình gọi AI." });
    }
  });

  // CORS PROXY FOR HLS
  app.use("/proxy", (req, res, next) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) return res.status(400).send("No URL provided");

    const urlObj = new URL(targetUrl);
    const proxy = createProxyMiddleware({
      target: urlObj.origin,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const actualTarget = url.searchParams.get('url');
        if (actualTarget) {
          const targetPath = new URL(actualTarget).pathname + new URL(actualTarget).search;
          return targetPath;
        }
        return path;
      },
      on: {
        proxyRes: (proxyRes) => {
          proxyRes.headers["access-control-allow-origin"] = "*";
          proxyRes.headers["access-control-allow-methods"] = "GET, POST, OPTIONS";
          proxyRes.headers["access-control-allow-headers"] = "Content-Type, Authorization";
        },
      },
    });

    return proxy(req, res, next);
  });

  // Proxy removed - not needed since we moved to imported static assets.

  // VITE MIDDLEWARE
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
