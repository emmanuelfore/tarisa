import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {

  // Swagger Setup
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Civic App API',
        version: '1.0.0',
        description: 'API documentation for the Civic Application',
      },
      servers: [
        {
          url: '/api',
          description: 'API Server'
        },
      ],
    },
    apis: [path.resolve(process.cwd(), "server", "routes.ts")], // Absolute path to the API docs
  };


  const swaggerSpec = await import('swagger-jsdoc').then(m => m.default(swaggerOptions));
  const swaggerUi = await import('swagger-ui-express');

  // Ensure we get the correct middleware functions
  // In some environments 'serve' is a named export, in others it's on 'default'
  // We prioritize the named export if available as seen in debug output
  const serve = swaggerUi.serve || swaggerUi.default?.serve;
  const setup = swaggerUi.setup || swaggerUi.default?.setup;

  // Debug to file
  // Debug to file
  const fs = await import('fs');
  // path is already imported at top level
  const debugLogPath = path.resolve(process.cwd(), 'debug-serve.log');

  fs.writeFileSync(debugLogPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    hasServe: !!serve,
    serveType: Array.isArray(serve) ? 'array' : typeof serve,
    serveLength: Array.isArray(serve) ? serve.length : 'N/A',
    hasSetup: !!setup,
    specInfo: swaggerSpec?.info?.title,
    specPaths: Object.keys(swaggerSpec?.paths || {}).length
  }, null, 2));

  // Simple verify route to check express routing
  app.get('/verify-docs', (req, res) => {
    res.json({ message: "Routing is working", swaggerPaths: Object.keys(swaggerSpec?.paths || {}).length });
  });

  if (serve && setup) {
    app.use('/api-docs', serve, setup(swaggerSpec));
    console.log("Swagger UI successfully registered at /api-docs");
  } else {
    console.error("CRITICAL: Failed to initialize Swagger UI. 'serve' or 'setup' missing in import.");
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
