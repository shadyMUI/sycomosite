import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    // Cose che non sono il sito e non vanno neanche lintati
    ignores: [
      "e2e/**",
      ".next-pages/**",
      "unsloth-tmp/**",
      ".agents/**",
    ],
  },
];

export default config;
