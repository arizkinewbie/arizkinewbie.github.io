import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://arganaphang.dev/",
  author: "Argana Phangquestian",
  desc: "Argana Phangquestian personal website",
  title: "Personal",
  ogImage: "astropaper-og.jpg", // TODO: Update this with my own image
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/arganaphang",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/argana-phangquestian",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:arganaphangquestian@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
];
