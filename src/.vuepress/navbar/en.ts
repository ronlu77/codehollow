import { navbar } from "vuepress-theme-hope";

export const enNavbar = navbar([
  "/",
  {
    text: "Blogs",
    icon: "laptop-code",
    prefix: "/",
    children: [
      {
        text: "前端学习",
        link: "fronted/"
      },
      {
        text: "算法专栏",
        link: "algorithms/",
      },
      {
        text: "其他",
        link: "other/"
      }
    ],
  },
  {
    text: "Read",
    icon: "book",
    link: "/read/"
  },
  {
    text: "Friendly links",
    icon: "link",
    link: "/friendlylinks"
  },
]);
