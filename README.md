# HexNemesis YouTube Kit

Creator-focused tools and templates for building YouTube end screens that turn one view into a binge.

## GitHub Pages

The static creator landing page is deployed automatically from `public/` whenever `master` changes:

**https://moneywizard.github.io/hexnemesis-youtube-kit/**

The page includes a link back to this repository in the navigation and footer.

To enable it the first time, open **Settings → Pages** in the repository and set **Source** to **GitHub Actions**. The workflow is in `.github/workflows/pages.yml`.

The forms use the Render Node service at `hexnemesis-youtube-kit.onrender.com`. Valid leads are always written to the Render server log; SMTP credentials are optional and add email delivery when configured. If the Render service is suspended or unavailable, the GitHub Pages form cannot submit until it is running again.

## Local development

```bash
npm install
npm start
```

The local server runs on `http://localhost:3000`.
