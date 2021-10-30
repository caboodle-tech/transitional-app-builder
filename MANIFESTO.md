# The TAB Manifesto

### Introduction
The idea for a Transitional App Builder (TAB/atab) was born out of my frustrations with modern software development. If your interested in understanding where these frustrations come from, and to help you appreciate my point of view better, here is a brief summary of my history with software development and the IT field. Skip the blockquotes if your not interested:

> I started my development career as a self taught web designer building simple websites from scratch in Highschool. At the time Adobe Dreamweaver was my favorite IDE and I thought its templating regions were all I ever would need. When I entered my first year of college however I learned about better IDE's, frameworks, design patterns and principles, and so on. Before graduating with my Associates Degree I had started running my own software development and tech consulting business, Caboodle Tech Inc. Over time my skills and experiences grew as clients entrusted me with more complex projects and responsibilities. Now, a decade later I have transitioned into teaching. For three years now &ndash; as of the time of this writing &ndash; I continue to work part-time in industry and part-time teaching these skills as an adjunct professor at Brigham Young University Idaho (BYUI).

> I share this background with you **not** to claim that I know everything, or to profess some authority on my point of view, but simply to help you understand that I have seen a thing or two running my own business, working in industry, and working in academia. I know a little about a lot, and a lot about nothing. What I do know know for sure though, is during this entire time I have noticed an annoying, and possibly alarming, trend in the software development business:

1. Many software and website projects use and rely on frameworks, tools, and/or libraries that in reality are overkill or unnecessary for the projects end goal.
2. Many organizations, and sometimes academic institutions, encourage tooling over languages.

Without turning this introduction into an exhaustive essay, let me share some simple examples to support these two claims. **1.** I have consistently seen projects use, or require to be used, a library/framework like Angular, React, or Vue, when it really should be considered unnecessary. A small five page website, or an SPA, that will receive only a yearly update or two for the life of the site does not need these bulky solutions. **2.** I have had the privilege to work along side many different developers, including developers who I would consider more experienced or near evangelists for tools; libraries, frameworks, and so on. Yet, sometimes these developers don't even understand the basics of the language(s) we are using or how the `dom` works. The tooling seems to have abstracted to much away from the developer.

**\~ Christopher Keers** (*29 Oct 2021*)

### Manifesto
TAB was born out of the frustrations discussed in the introduction. It was created because there is need for a simple lightweight framework that could do three things:

1. Improve development time and morale for individuals/teams.
2. Help individuals/organizations use a better tool for a given project.
3. Encourage rising developers to learn more about languages and less about tooling.

To clarify these points, TAB:

- can be a better tool to use than ones your currently using, but this is always project dependent. Some projects would be better suited by a different tool. Challenge yourself to check!
- is all about using the best tool for the job and not fitting a job into a tool. I can go off-roading in a two wheel drive car if I want, but a four wheel drive lifted truck would offer a better experience. 
- is also here to encourage developers to start vanilla and add tools/frameworks only when necessary. MongoDB compliments TAB perfectly for example, but you'll have to add it into the TAB workflow on your own, in a way that fits your team/organization.

### Why Name It TAB?
This is actually a super simple answer:

1. TAB is an easy to remember acronym and `atab` is nice and short for command line usage as an NPM package.
2. I spent months trying to understand what exactly I had made and how I should name it, when Rich Harris gave me the answer: [Have Single-Page Apps Ruined the Web? | Transitional Apps](https://youtu.be/860d8usGC0o)

Quoting the synopsis to Rich's 2021 Jamstack Conference talk:

> Transitional apps samples elements from both traditional and modern architecture. The term is borrowed from interior design’s framing of “transitional design.” Transitional apps are, like multi-page apps, server-side rendered for fast initial loads, resilient since they work without JS by default, and provide a consistent experience with accessibility features built in. But like a single-page application, they also have a single codebase, fast navigation, persistent elements, and client-side state management.

Ignoring the part about *accessibility features built in*, I felt I had developed a Transitional App. More accurately, I felt that I had created a framework that would encourage the *building* of Transitional Apps. And that is how I decided on the name `TAB`.

So a big thank you to Rich Harris for `#transitionalapps`.

### How Can I Help?
TAB is an open source community supported project, if you would like to help please consider <a href="https://github.com/caboodle-tech/transitional-app-builder/issues" target="_blank">tackling an issue</a> or <a href="https://ko-fi.com/caboodletech" target="_blank">making a donation</a> to keep the project alive.

TAB can also use a hand in building out new features. For example, it was never envisioned to handle accessibility features for the developer, but maybe there is a way to stay true to TAB's goals **and** be more Transitional App like?