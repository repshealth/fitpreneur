# FitPreneur Agency website

Static HTML/CSS/JS site, built for GitHub + Cloudflare Pages. No build step.

## Structure

```
index.html              Homepage
privacy.html            Privacy Policy  (served at /privacy)
cookies.html            Cookie Policy   (served at /cookies)
404.html                Not-found page
assets/css/styles.css   All styles (colours are CSS variables at the top)
assets/js/main.js       Menu, carousels, timeline, stat counters, newsletter form
assets/img/             Logo, favicon, creator photos, feature images (WebP)
functions/api/subscribe.js   Cloudflare Pages Function: newsletter form -> MailerLite
_headers                Security + caching headers for Cloudflare
robots.txt, sitemap.xml SEO
```

## Deploy

1. Create a new GitHub repo (e.g. `fitpreneur-website`) and push this folder to it:
   ```
   git init
   git add .
   git commit -m "FitPreneur website"
   git branch -M main
   git remote add origin https://github.com/<you>/fitpreneur-website.git
   git push -u origin main
   ```
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git > pick the repo.
3. Build settings: Framework preset **None**, build command **empty**, output directory **/** (root).
4. Deploy. Then Pages project > Custom domains > add `fitpreneuragency.com` (and `www`).

## Newsletter (MailerLite)

The "Join our growth newsletter" form posts to `/api/subscribe`, which adds the person to MailerLite.

In Cloudflare: Pages project > Settings > Environment variables (Production), add:

| Variable | Value |
| --- | --- |
| `MAILERLITE_API_KEY` | MailerLite > Integrations > API > generate token (set as encrypted) |
| `MAILERLITE_GROUP_ID` | Optional. The ID of the group new subscribers should join |

Redeploy after adding them. Until the key is set, the form shows a friendly "not configured yet" message.

## Things to update

- **CTA buttons** ("Talk to Us!", "Work with us", "Get more info") currently open an email to james@fitpreneuragency.com. To send people to a booking page instead, search `index.html` for `mailto:james@fitpreneuragency.com?subject=` and replace those hrefs with your calendar link.
- **Nav links** scroll to sections on the homepage: About Us = the process timeline, Services = features, Contact Us = newsletter/contact.
- **Legal pages** are sensible starting templates. Give them a once-over before launch.
- **Domain**: canonical/OG/sitemap URLs assume `https://fitpreneuragency.com`. Change them if you use another domain.

## Local preview

```
python3 -m http.server 8000
```
Then open http://localhost:8000 (the newsletter API only works on Cloudflare, or locally with `npx wrangler pages dev .`).
