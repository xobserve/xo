import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
// https://vitejs.dev/config/

export default ({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    return defineConfig({
        server: {
            host: "192.168.50.105"
        },
        define: {
            "process.env": env,
        },
        plugins: [
            react({
                jsxRuntime: 'classic' // Add this line
            }),
            viteTsconfigPaths(),
            svgrPlugin()
        ],
        base: '/',
        publicDir: './public',
        build: {
            outDir: 'build',
            assetsDir: 'static',
            commonjsOptions: {
                // Ensure we transform modules that contain a mix of ES imports
                // and CommonJS require() calls to avoid stray require() calls in production.
                transformMixedEsModules: true,
            },
        },
        //   resolve: {
        //     alias: {
        //       "@": fileURLToPath(new URL("./src", import.meta.url)),
        //     },
        //   },
    });
};

