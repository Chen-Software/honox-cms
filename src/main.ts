import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
	args: Bun.argv.slice(2),
	options: {
		port: {
			type: "string",
			short: "p",
			default: "3000",
		},
		static: {
			type: "boolean",
		},
	},
	strict: true,
});

const port = Number.parseInt(values.port ?? "3000", 10);

if (values.static) {
	const distPath = join(process.cwd(), "dist");
	if (!existsSync(distPath)) {
		console.log("Building for static production...");
		const build = Bun.spawnSync(["bun", "run", "build"]);
		if (!build.success) {
			console.error("Build failed");
			process.exit(1);
		}
	} else {
		console.log("Using existing dist folder...");
	}

	// Map for file extensions to MIME types
	const getMimeType = (filePath: string): string => {
		if (filePath.endsWith(".js")) return "application/javascript";
		if (filePath.endsWith(".css")) return "text/css";
		if (filePath.endsWith(".html")) return "text/html";
		if (filePath.endsWith(".json")) return "application/json";
		if (filePath.endsWith(".svg")) return "image/svg+xml";
		if (filePath.endsWith(".png")) return "image/png";
		if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg"))
			return "image/jpeg";
		if (filePath.endsWith(".gif")) return "image/gif";
		if (filePath.endsWith(".ico")) return "image/x-icon";
		if (filePath.endsWith(".woff")) return "font/woff";
		if (filePath.endsWith(".woff2")) return "font/woff2";
		if (filePath.endsWith(".ttf")) return "font/ttf";
		if (filePath.endsWith(".eot")) return "application/vnd.ms-fontobject";
		return "application/octet-stream";
	};

	const server = Bun.serve({
		port,
		fetch(req) {
			const url = new URL(req.url);
			const pathname = url.pathname;

			const pathsToTry = [
				join(process.cwd(), "dist", pathname),
				join(process.cwd(), "dist", `${pathname}.html`),
				join(process.cwd(), "dist", pathname, "index.html"),
			];

			for (const path of pathsToTry) {
				if (existsSync(path) && !path.endsWith("/")) {
					const file = Bun.file(path);
					const mimeType = getMimeType(path);
					return new Response(file, {
						headers: { "Content-Type": mimeType },
					});
				}
			}

			return new Response("Not Found", { status: 404 });
		},
	});

	console.log(`Static server running at ${server.url}`);
} else {
	const { createServer } = await import("vite");

	const vite = await createServer({
		server: { middlewareMode: true, hmr: false },
		appType: "custom",
	});

	const { default: app } = await vite.ssrLoadModule("./app/server.ts");

	const server = Bun.serve({
		fetch: async (request) => {
			const url = new URL(request.url);

			return new Promise<Response>((resolve) => {
				const req = {
					url: url.pathname + url.search,
					method: request.method,
					headers: Object.fromEntries(request.headers),
				};
				const res = {
					statusCode: 200,
					headers: {} as Record<string, string>,
					getHeader(name: string) {
						return this.headers[name.toLowerCase()];
					},
					setHeader(name: string, value: string) {
						this.headers[name.toLowerCase()] = value;
					},
					writeHead(status: number, headers: any) {
						this.statusCode = status;
						if (headers) {
							for (const [k, v] of Object.entries(headers)) {
								this.setHeader(k, v as string);
							}
						}
					},
					end(content: any) {
						resolve(
							new Response(content, {
								status: this.statusCode,
								headers: this.headers,
							}),
						);
					},
				};
				vite.middlewares(req as any, res as any, () => {
					resolve(app.fetch(request));
				});
			});
		},
		port,
	});

	console.log(`Dev server running at ${server.url}`);
}
