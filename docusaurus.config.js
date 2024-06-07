// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "EventStoreDB v5 Documentation",
  tagline: "",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://your-docusaurus-site.example.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "EventStore", // Usually your GitHub org/user name.
  projectName: "esdb-docs-v5", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          routeBasePath: "docs",
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "http-api",
        path: "http-api",
        routeBasePath: "http-api",
        sidebarPath: "./sidebarsHttp.js",
        // ... other options
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/es-logo.png",
      navbar: {
        logo: {
          alt: "Event Store Logo",
          src: "img/eventstore-inverse.svg",
          href: "https://www.eventstore.com",
          height: "40px",
        },
        items: [
          { to: "/docs", label: "v5 Home" },
          {
            to: "/http-api",
            label: "HTTP API",
            position: "right",
          },
          {
            href: "https://developers.eventstore.com/introduction",
            label: "Current ESDB versions",
            position: "right",
          },
          {
            href: "https://developers.eventstore.com/deprecated-clients",
            label: "TCP clients",
            position: "right",
          },
          {
            href: "https://developers.eventstore.com/clients",
            label: "gRPC clients",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Event Store resources",
            items: [
              {
                label: "Our company",
                href: "https://www.eventstore.com/about",
              },
              {
                label: "Downloads",
                href: "https://www.eventstore.com/downloads",
              },
              {
                label: "Release Notes",
                href: "https://www.eventstore.com/blog/release-notes",
              },
              {
                label: "Blog",
                href: "https://www.eventstore.com/blog",
              },
              {
                label: "YouTube",
                href: "https://www.youtube.com/c/EventStoreLtd",
              },
              {
                label: "GitHub",
                href: "https://github.com/EventStore/EventStore",
              },
            ],
          },
          {
            title: "Docs",
            items: [
              {
                label: "Server",
                href: "https://developers.eventstore.com/docs/intro",
                target: "_self",
              },
              {
                label: "Cloud",
                href: "https://developers.eventstore.com/cloud",
                target: "_self",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "LinkedIn",
                href: "https://www.linkedin.com/company/eventstore/",
              },
              {
                label: "Discord",
                href: "https://discord.gg/Phn9pmCw3t",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/eventstore",
              },
            ],
          },
          {
            title: "Customer logins",
            items: [
              {
                label: "Cloud sign in",
                href: "https://console.eventstore.cloud/",
              },
              {
                label: "Support log in",
                href: "https://eventstore.freshdesk.com/",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Event Store Ltd. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
