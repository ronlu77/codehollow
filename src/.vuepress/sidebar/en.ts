import { sidebar } from "vuepress-theme-hope";

export const enSidebar = sidebar({
  "/": [
    {
      text: "前端学习",
      icon: "book",
      prefix: "fronted/",
      collapsible: true,
      children: [
        {
          text: "Vue", 
          prefix: "vue/", 
          collapsible: true,
          children: [
            {
              text: "Vue 2", link: "Vue2.md"
            },
            {
              text: "Vue 3", link: "Vue3.md"
            }
          ]
        },
        {
          text: "前端工程化",
          prefix: "engineering/",
          collapsible: true,
          children: [
            {
              text: "浅析npm、yarn、pnpm", link: "package-manage.md"
            },
          ]
        },
      ],
    },
    {
      text: "算法专栏",
      icon: "",
      collapsible: true,
      children: [

      ]
    },
    {
      text: "其他",
      prefix: "other/",
      collapsible: true,
      children: [
        {
          text: "Markdown语法", link: "markdown1.md"
        }
      ]
    }
  ],
});
