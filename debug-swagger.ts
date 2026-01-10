import * as swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

(async () => {
    console.log("TS Import * as swaggerUi:", Object.keys(swaggerUi));
    // @ts-ignore
    console.log("TS Import default keys:", swaggerUi.default ? Object.keys(swaggerUi.default) : "no default");

    const dynamicUi = await import('swagger-ui-express');
    console.log("Dynamic Import keys:", Object.keys(dynamicUi));
    // @ts-ignore
    console.log("Dynamic Import default keys:", dynamicUi.default ? Object.keys(dynamicUi.default) : "no default");

    const routePath = path.resolve(process.cwd(), "server", "routes.ts");
    console.log("Checking route path:", routePath);

    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Civic App API',
                version: '1.0.0',
            },
        },
        apis: [routePath],
    };

    try {
        const spec = swaggerJsdoc(swaggerOptions);
        console.log("Spec Generated paths count:", Object.keys(spec.paths || {}).length);
        console.log("Spec Info:", spec.info);
        if (Object.keys(spec.paths || {}).length === 0) {
            console.warn("WARNING: No paths found! Check if routes.ts has @swagger annotations.");
        }
    } catch (e) {
        console.error("Error generating spec:", e);
    }
})();
