# FitPreneur Agency website

Static HTML/CSS/JS site. No build step. Currently hosted on GitHub Pages.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `about.html` | About Us |
| `services.html` | Services |
| `case-studies.html` | Case Studies |
| `contact.html` | Contact Us |
| `privacy.html`, `cookies.html` | Legal pages |
| `404.html` | Not-found page |

Shared assets: `assets/css/styles.css` (colours are CSS variables at the top), `assets/js/main.js`, images in `assets/img/`.

The header and footer are repeated in every page. If you change the nav or footer, change it in all `.html` files.

## Forms (contact + newsletter)

Both forms post to [FormSubmit](https://formsubmit.co), which emails each submission to james@fitpreneuragency.com. No account needed.

**First-time setup:** submit the contact form once on the live site. FormSubmit sends an activation email to james@fitpreneuragency.com. Click the link in it, and every submission after that arrives in your inbox.

To send newsletter sign-ups to a different address or service, change the form `action` in `index.html` (search for `formsubmit.co`).

## About page video

The play button on the About page is hidden until there's a video to play. In `about.html`, find `data-video=""` and add either:
- a YouTube embed URL, e.g. `https://www.youtube.com/embed/VIDEO_ID`
- a Vimeo embed URL, e.g. `https://player.vimeo.com/video/VIDEO_ID`
- or a path to an `.mp4` file in the repo

## Hosting

**GitHub Pages (current):** Settings > Pages > Deploy from branch > `main` / root. All links are relative so the site works at `repshealth.github.io/fitpreneur/`.
`404.html` uses `/fitpreneur/` paths because GitHub serves it from any URL. If you move to a custom domain, change `/fitpreneur/` to `/` in that file.

**Cloudflare Pages (later):** connect the repo, framework preset None, no build command, output directory `/`. `functions/api/subscribe.js` is an optional MailerLite integration for the newsletter if you move there (set `MAILERLITE_API_KEY` and optionally `MAILERLITE_GROUP_ID`, then point the newsletter form `action` at `api/subscribe`).

## Local preview

```
python3 -m http.server 8000
```
Then open http://localhost:8000
