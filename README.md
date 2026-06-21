# kmartfire.com

Simple static GitHub Pages site for `kmartfire.com`, plus a standalone counter page that can also be deployed to `howlonghasitbeensincethe.kmartfire.com`.

## What's in this repo

- `index.html`, `styles.css`, `app.js`: the main landing page
- `counter/`: a self-contained counter page
- `CNAME`: custom domain file for the main site

## Local structure

The counter is available in two ways:

- As part of the main site at `/counter/`
- As a standalone mini-site if you copy the files in `counter/` to the root of a second repository

## Main site setup on GitHub Pages

1. Create a public GitHub repository for this code.
2. Push this repo to the `main` branch.
3. In GitHub, open the repository, then go to `Settings` -> `Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Set the branch to `main` and the folder to `/ (root)`.
6. Wait for the initial Pages build to finish.
7. Confirm that the custom domain in Pages is `kmartfire.com`.
8. Once GitHub offers it, enable `Enforce HTTPS`.

## DNS for `kmartfire.com`

At your DNS provider, create these records for the apex domain:

- `A` record for `@` -> `185.199.108.153`
- `A` record for `@` -> `185.199.109.153`
- `A` record for `@` -> `185.199.110.153`
- `A` record for `@` -> `185.199.111.153`

Optional IPv6 records:

- `AAAA` record for `@` -> `2606:50c0:8000::153`
- `AAAA` record for `@` -> `2606:50c0:8001::153`
- `AAAA` record for `@` -> `2606:50c0:8002::153`
- `AAAA` record for `@` -> `2606:50c0:8003::153`

Recommended redirect-friendly record:

- `CNAME` record for `www` -> `YOUR-GITHUB-USERNAME.github.io`

## Subdomain setup for `howlonghasitbeensincethe.kmartfire.com`

GitHub Pages is simplest here if you use a second Pages repository for the counter.

1. Create a second public repository, for example `kmartfire-counter`.
2. Copy the contents of `counter/` into the root of that second repository.
3. Add a `CNAME` file in the second repository containing:

```text
howlonghasitbeensincethe.kmartfire.com
```

4. In that second repository, go to `Settings` -> `Pages`.
5. Set `Deploy from a branch`, branch `main`, folder `/ (root)`.
6. In the Pages custom domain field, enter `howlonghasitbeensincethe.kmartfire.com`.
7. At your DNS provider, add:

```text
Type: CNAME
Host: howlonghasitbeensincethe
Value: YOUR-GITHUB-USERNAME.github.io
```

8. Wait for DNS propagation and then enable `Enforce HTTPS`.

Important: for GitHub Pages custom subdomains, the `CNAME` should point to `YOUR-GITHUB-USERNAME.github.io`, not to the repository URL and not to `kmartfire.com`.

## Editing the fire start time

Right now both counters use:

```text
1982-06-21T00:00:00-04:00
```

If you confirm a better start time, update `FIRE_START_ISO` in:

- `app.js`
- `counter/counter.js`

## Useful next additions

- Add source citations and scanned primary documents
- Add a map, photographs, or newspaper archive references
- Add a short historical timeline once you have sourced details
