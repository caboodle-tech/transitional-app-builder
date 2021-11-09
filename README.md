# Transitional App Builder (TAB)
Transitional App Builder, also referred to as *A* Transitional App Builder (atab), is a modern reimagining of how a framework can be used to build and manage web based projects: web applications **and** websites. This means multi-page applications (MPA), single-page applications (SPA), and progressive web applications (PWA). You should consider using TAB if:

:heavy_check_mark:&nbsp; Your project is primarily a static website or application.

:heavy_check_mark:&nbsp; You want a lightweight easy to use templating framework when other tools would just be overkill or unnecessary.

:heavy_check_mark:&nbsp; You want to build a SPA or MPA fast.

:heavy_check_mark:&nbsp; You prefer to develop in vanilla languages; HTML, CSS (less or sass), and JavaScript.

:heavy_check_mark:&nbsp; Your project is highly dynamic and you are conformable managing SPA or PWA on your own; or you have a tool in mind that would work well with TAB.

## The TAB Manifesto
TAB was created because I saw a need for a simple lightweight framework that could do three things:

1. Encourage rising developers to learn more about languages and less about tooling.
2. Improve development time and morale for small teams or solo developers.
3. Encourage using the best tool instead of a familiar tool for a given project.

Please read the [full manifesto](MANIFESTO.md) if you would like to know more &ndash; I have a lot to say &ndash; and visit the documentation website for a live demonstration of TAB. (Coming Soon)

## Installation & Usage

### Installation
TAB can be installed globally (recommended) or locally to a specific project. For a global install run the following command from your terminal:

```javascript
npm install atab -g
```

For a local install you should setup your projects directory first and then add TAB as a development dependency. Open a terminal at your projects location and run the following commands:

```javascript
npm init
npm install atab --save-dev
```

### Usage
TAB should always be run with `npx` &ndash; the Node Package Execute binary &ndash; from your projects root directory. Open a terminal at your projects root to run the following commands:

**Print the Manual**<br>
```javascript
npx atab man
// or
npx atab --help
```

**Initialize a new TAB Project**<br>
```javascript
npx atab init
```

**Start the TAB Server / Auto Compiler**<br>
```javascript
npx atab watch
// or
npx atab serve
```

**Compile (Build) Your Project**<br>
```javascript
// This does a one time compile and does not start the TAB server or auto compiler.
npx atab compile
// or
npx atab build
```

**Release a new Version of Your Project**<br>
(Coming Soon)

This will run `compile` and then package the build in a zip folder for you.

## Changelog

The [current changelog is here](./changelogs/v1.md). All [other changelogs are here](./changelogs).

## Contributions

TAB is an open source community supported project, if you would like to help please consider <a href="https://github.com/caboodle-tech/transitional-app-builder/issues" target="_blank">tackling an issue</a> or <a href="https://ko-fi.com/caboodletech" target="_blank">making a donation</a> to keep the project alive.