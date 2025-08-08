
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    "/lib/**/*", // Ignorar los archivos compilados.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "object-curly-spacing": ["error", "always"],
    "max-len": ["error", { "code": 140, "ignoreComments": true, "ignoreUrls": true }],
    "@typescript-eslint/no-explicit-any": "off",
    "require-jsdoc": "off",
  },
};
// Configuración de ESLint para funciones de Firebase
// Esta configuración está diseñada para trabajar con TypeScript y Google JavaScript Style Guide.
// Incluye reglas para la indentación, comillas, espacios en objetos y longitud máxima de línea.
// También se desactivan algunas reglas específicas como no permitir 'any' y requerir JSDoc.
// Se ignoran los archivos compilados en la carpeta 'lib'.
// Asegúrate de tener instalados los plugins necesarios: eslint, @typescript-eslint/parser
