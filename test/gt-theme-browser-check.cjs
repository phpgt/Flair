// Optional browser setup: see docs/library.md. No running website is required.
const {chromium} = require('playwright');
const sass = require('sass');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
 const css = sass.compileString(`
  @use "flair";
  @use "theme/base";
  @use "theme/gt";
  :root { @include base.base; }
  :root[data-flair-theme="gt"] { @include gt.gt; }
  html { font-size: var(--theme-root-font-size, 1rem); background: var(--theme-color-page); }
  @include flair.init;
  @include flair.typography;
  @include flair.controls;
  body { @extend %d-typography; }
  .brand { font-family: var(--theme-font-brand, var(--theme-font-heading)); }
  .panel { @extend %d-surface; --theme-surface-background: var(--theme-color-surface-disabled); padding: 1rem; }
  .navigation { @extend %p-side-navigation; @extend %d-sidebar-contrast; }
  pre { @extend %o-code-block; }
 `, {loadPaths: [path.resolve(__dirname, '../style/lib')]}).css;
 const browser = await chromium.launch({executablePath: process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
 try {
  const page = await browser.newPage();
  await page.setContent(`<html lang="en" data-flair-theme="gt"><head><title>GT theme regression</title><style>${css}</style></head><body>
   <h1 class="brand">GT</h1><p><a id="link" href="#example">Documentation</a></p>
   <nav class="navigation"><ul><li><a id="current" href="#example" aria-current="page">Current page</a></li><li><a id="other" href="#other">Other page</a></li></ul></nav>
   <section class="panel"><label for="field">Email</label><input id="field" type="email"><button>Save</button></section>
   <pre id="example"><code>echo "Hello";</code></pre>
  </body></html>`);
  const property = (selector, name) => page.locator(selector).evaluate((e, key) => getComputedStyle(e)[key], name);
  const tokenColour = token => page.evaluate(name => {
   const probe = document.createElement('span');
   probe.style.color = `var(${name})`;
   document.body.appendChild(probe);
   const colour = getComputedStyle(probe).color;
   probe.remove();
   return colour;
  }, token);
  for(const scheme of ['light', 'dark']) {
   await page.emulateMedia({colorScheme: scheme});
   await page.locator('html').evaluate(e => e.dataset.flairTheme = 'gt');
   assert.equal(await property('html', 'fontSize'), '18px');
   assert.match(await property('body', 'fontFamily'), /Ubuntu/);
   assert.match(await property('.brand', 'fontFamily'), /Ubuntu Condensed/);
   assert.match(await property('pre', 'fontFamily'), /Ubuntu Mono/);
   assert.equal(await property('pre', 'borderTopColor'), await tokenColour('--theme-code-outline'));
   const selection = await page.locator('body').evaluate(e => {
    const style = getComputedStyle(e, '::selection');
    return {background: style.backgroundColor, text: style.color};
   });
   assert.equal(selection.background, await tokenColour('--theme-selection-background'));
   assert.equal(selection.text, await tokenColour('--theme-selection-text'));
   assert.equal(await property('#current', 'color'), await tokenColour('--theme-color-primary'));
   await page.locator('#other').hover();
   assert.equal(await property('#other', 'color'), await tokenColour('--theme-nav-hover-text'));
   await page.locator('#link').hover();
   assert.equal(await property('#link', 'color'), await tokenColour('--theme-link-hover-color'));
   assert.notEqual(await property('#field', 'backgroundColor'), await property('.panel', 'backgroundColor'), `${scheme}: text field must remain visible on a tinted panel`);
   assert.equal(await property('#field', 'borderTopColor'), await tokenColour('--theme-color-muted'));
   await page.locator('#field').focus();
   assert.equal(await property('#field', 'backgroundColor'), await property('html', 'backgroundColor'));
   assert.ok(parseFloat(await property('#field', 'outlineWidth')) > 0);
   await page.locator('#field').blur();
   await page.locator('html').evaluate(e => e.removeAttribute('data-flair-theme'));
   assert.equal(await property('html', 'fontSize'), '16px');
   assert.doesNotMatch(await property('body', 'fontFamily'), /Ubuntu/);
   assert.equal(await property('pre', 'borderTopColor'), await tokenColour('--theme-color-border'));
   assert.equal(await page.locator('body').evaluate(e => getComputedStyle(e, '::selection').backgroundColor), await tokenColour('--theme-color-primary'));
   await page.locator('#link').hover();
   assert.equal(await property('#link', 'color'), await tokenColour('--theme-color-accent'));
  }
  console.log('Passed GT light/dark typography, text selection, link and navigation hover colours, code outlines, visible form fields, focus state and clean base fallback.');
 } finally {
  await browser.close();
 }
})().catch(error => { console.error(error); process.exitCode = 1; });
