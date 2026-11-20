# Progressive, declarative UI system, powered by Sass placeholder selectors.

Flair is a Sass library for building web interfaces from shared styles. It gives you controls, forms, navigation and layouts that you can compose in your own stylesheets, using your own HTML class names.

Flair is part of [PHPGT] and is intended to be used with WebEngine projects. It takes its name from [Bright Flair], where it was originally built for use across the company's projects.

You can start with a single button or compose a whole interface. The default theme is deliberately black and white, so you can work on layout structure and content before choosing colours, fonts and branding.

***

## Example usage: A place to start

Let's give a small welcome panel some shared styles. The HTML uses names that describe its purpose:

```html
<section class="welcome">
	<h1>Make yourself at home</h1>
	<p>Here's where you can find your projects and start something new.</p>
	<a class="view-projects" href="/projects">View your projects</a>
</section>
```

In your Sass, choose the definitions you need:

```scss
@use "flair";
@use "theme/base" as theme;

:root {
	@include theme.base;
}

body {
	@include flair.typography;
}

.welcome {
	@extend %o-card;
}

.view-projects {
	@extend %o-button;
}
```

The `%` names are Sass placeholders: reusable definitions that become CSS when you extend them. Here, `.welcome` gets the card styles and `.view-projects` gets the button styles, while the link keeps its ordinary navigation behaviour.

Importing Flair alone produces no CSS. Extending a definition brings in the styles it depends on. Native typography and form control styles are available as optional mixins, so you can choose where they apply.

## Using Flair in your project

Flair needs a Sass compiler with support for `@use`. The examples here use Dart Sass. The PHP dependencies in this repository run the example website; your application only needs the Sass library.

For a local checkout, add `style/lib/` to your Sass load path. For example, with Flair checked out beside your project:

```sh
npx sass --load-path=../flair/style/lib style/style.scss www/style.css
```

Link the compiled CSS from your HTML as usual. Your application supplies any fonts and icon files it uses.

See the [library reference] for configuration, available definitions and further examples.

## Choosing a theme

Every preset starts from the same neutral base. To try Bright, replace the base theme import and include in the example above:

```scss
@use "theme/bright" as theme;

:root {
	@include theme.bright;
}
```

The available presets are `base` (Monochrome), `bright`, `github`, `clean` and `gt`. You can also build your own theme by changing inherited CSS properties:

```scss
:root {
	--theme-font-body: "Ubuntu", sans-serif;
	--theme-color-tint: light-dark(#6236b5, #c4a7ff);
}
```

Load the chosen font in your application. Themes define values for appearance; layout and page composition stay in your stylesheet.

Light and dark colours use CSS `light-dark()`, so your visitors need a browser that supports it. The base theme follows their system preference. Set `data-theme="light"` or `data-theme="dark"` on the HTML element to choose a scheme explicitly.

## Features at a glance

+ **Choose how much you use.** Importing the library emits no CSS, font downloads or JavaScript. Extend the definitions and include the mixins your interface needs.
+ **Keep meaningful HTML.** Compose styles in Sass and attach them to your own selectors. Flair does not require a set of framework class names in your templates.
+ **Design structure and appearance separately.** Review an interface in black and white, then choose a theme or add your own visual design.
+ **Share styles with clear responsibilities.** Decorations handle appearance, objects describe individual UI units, patterns relate those units, and layouts arrange larger regions.
+ **Adjust values where you need them.** Most customisation uses inherited CSS properties. Sass configuration covers compile-time choices such as breakpoints and icon paths.
+ **Build on native HTML.** Controls, links and disclosures retain their native behaviour. Shared styles include focus and interaction states; your application provides its behaviour and accessible content.

## How the library is organised

The reusable library lives in `style/lib/`, with `flair.scss` as its entry point. Each placeholder has one matching file and declares its dependencies.

Applications compose those definitions into their own components and pages. Styles elsewhere in this repository belong to the example website.

The [architecture guide] explains the responsibilities of each layer. If you've used an earlier checkout, the [migration guide] covers the renamed definitions and theme changes.

## Working on Flair

Install the development dependencies and run the automated checks:

```sh
npm ci
npm test
```

The checks cover Sass compilation, independent definitions, theme boundaries and the files included in the library package. The [library reference] also describes the optional browser checks.

If you have a question, find a problem or want to suggest an improvement, please [open an issue]. Examples from your own projects help us understand what a shared definition needs to do.

[PHPGT]: https://www.php.gt/
[Bright Flair]: https://www.brightflair.com/
[library reference]: docs/library.md
[architecture guide]: docs/architecture.md
[migration guide]: docs/migration.md
[open an issue]: https://github.com/phpgt/Flair/issues
