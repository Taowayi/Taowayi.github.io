![License](https://img.shields.io/github/license/Taowayi/Taowayi.github.io)

# Moyu's Personal Homepage | 末玉的个人主页

## 预览 | Preview
访问主页：[https://taowayi.github.io](https://taowayi.github.io)

## 介绍 | Introduction

这是 **Moyu (末玉)** 的个人主页，展示了我的学术成果、工作经历、获奖情况等信息。

本项目基于开源模板修改而成，原始模板来自 [Yixin Huang 的通用个人主页模板](https://github.com/Yixin0313/personal-homepage-template)，该模板又源自 [Sen Li 的学术主页模板](https://github.com/senli1073/senli1073.github.io)。

This is **Moyu's** personal homepage, showcasing my academic achievements, work experience, awards, and more.

This project is built upon an open-source template, originally from [Yixin Huang's personal homepage template](https://github.com/Yixin0313/personal-homepage-template), which was modified from [Sen Li's academic template](https://github.com/senli1073/senli1073.github.io).

## 项目结构 | Project Structure

本项目包含以下主要板块：
- **首页 (Home)**: 个人简介和核心信息
- **工作经历 (Experience)**: 工作和实习经历
- **发表论文 (Publications)**: 学术成果展示
- **获奖情况 (Awards)**: 荣誉与奖项

The project includes the following sections:
- **Home**: Personal introduction and core information
- **Experience**: Work and internship history
- **Publications**: Academic achievements
- **Awards**: Honors and awards

## 技术说明 | Technical Details

### 本地开发 | Local Development

直接用浏览器打开 `index.html` 即可预览主页效果。

Simply open `index.html` in your browser to preview the homepage.

### 内容编辑 | Content Editing

所有内容均以 Markdown 格式存储在 `contents/` 目录下：
- `home.md` - 首页内容
- `experience.md` - 工作经历
- `publications.md` - 发表论文
- `awards.md` - 获奖情况
- `config.yml` - 网站配置（标题、版权等）

All content is stored in Markdown format in the `contents/` directory:
- `home.md` - Homepage content
- `experience.md` - Work experience
- `publications.md` - Publications
- `awards.md` - Awards
- `config.yml` - Website configuration (title, copyright, etc.)

### 自定义样式 | Customization

- 修改样式：编辑 `static/css/` 目录下的 CSS 文件
- 替换图片：将新图片放入 `static/assets/img/` 目录
- 调整脚本：修改 `static/js/scripts.js`

To customize:
- Modify styles: Edit CSS files in `static/css/`
- Replace images: Place new images in `static/assets/img/`
- Adjust scripts: Modify `static/js/scripts.js`

## 快速开始 | Getting Start

### 1. Fork 该仓库 | Fork this repository

如果你想使用此模板创建自己的主页，建议 fork 原始模板仓库：[Yixin Huang 的个人主页模板](https://github.com/Yixin0313/personal-homepage-template)

仓库名称应命名为 `<用户名>.github.io`，这样你的个人网站地址将是 `https://<用户名>.github.io/`。

If you want to use this template to create your own homepage, it's recommended to fork the original template repository: [Yixin Huang's personal homepage template](https://github.com/Yixin0313/personal-homepage-template)

The repository name should be `<username>.github.io`, which will also be your website's URL.

### 2. 编辑页面内容 | Edit page content

(1) 进入你想存放项目的文件夹，并克隆新的仓库 | Go to the folder where you want to store your project, and clone the new repository:

```bash
git clone https://github.com/<username>/<username>.github.io.git
```

项目的目录结构如下 | The directory structure is as follows:

```text
.
├── contents
└── static
    ├── assets
    │   └── img
    ├── css
    └── js
```

(2) 修改各个板块的内容 | Modify the content of each section, which corresponds to `contents/*.md`.

(3) 调整网站设置 | Adjust the title, copyright information, and other text of the website in `contents/config.yml`

(4) 替换图片 | Replace background image and photo with new ones for your web pages in `static/assets/img/`

(5) 提交更改 | Push it:

```bash
git commit -am 'init'
git push
```


### 3. 访问你的网站 | Enjoy

打开浏览器，访问 https://<用户名>.github.io，即可查看你的个人主页

Fire up a browser and go to `https://<username>.github.io`

## License

本项目基于 MIT 许可协议。原始模板版权归 Yixin Huang 所有。
