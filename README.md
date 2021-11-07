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
(Coming soon)

For the time being you can clone this repo and run the following command to initialize a new project:

```javascript
node ./bin/atab init
```

Unfortunately this will install the project inside the repo files, but everything will still work. Run this command to start the TAB application:

```javascript
node ./bin/atab watch
```

You will have to `ctrl` + `c` to stop the application. If you would like to initialize TAB with different settings including moving it to a different directory run this:

```javascript
node ./bin/atab --help
```