# The TAB Manifesto

## Introduction
The idea for a Transitional App Builder (TAB/atab) was born out of my frustrations with modern software development. To avoid this manifesto becoming an essay let me provide you with a **TLDR;** of my background. These experiences have formed the point of view that has led to TAB being created. I make no claims that this point of view is better than another, only that from my spot on the mountain this is what makes the journey easier for me.

#### **TLDR; Background**
- Self-taught computer programmer since High School.
    - PHP, MySQL, HTML, CSS, and JavaScript.
    - I learned these later at University and on my own: Java, C++, Python, SQL, SQLite, MondoDB, LESS/SASS, etc.
- A.S. Computer Programming (RCC), B.S. Computer Information Technology (BYUI), and M.S. Software Development (BU) *70% completed*.
- Small business owner for over a decade:
    - Webmaster, web design, software development, tech consulating, small networks/ servers, etc.
- Adjunct professor at BYUI.
    - Programming, web design, information security, and general advising.
- Part-time senior full-stack developer for a logistics company; direct employee not a client of my business.

#### **Point of View**
Given my background I have come to believe in the following two points:

1. Software and website projects have a tendency to use and rely on frameworks, tools, and/or libraries that in reality are overkill or unnecessary for the projects end goal. This is often done out of familiarity, the dev team is familiar with a tool or process, or because of time, time is money in business so we choose the *fastest* development route.
2. Some business organizations, and sometimes academic institutions, have developed the habit of encouraging tooling over languages. Teaching and hiring developers based on tools or frameworks instead of languages.

Here are two real-life examples that clarify these points:

1. I have worked on projects that use, or require to be used, a library/framework like Angular, React, Vue, and so on, when it really should be considered unnecessary. A small five page website, a SPA that will receive only a yearly update for its entire life, or a static information only page, does not need these bulky solutions.
2. I have had the privilege to work along side many different developers, including developers who I would consider more experienced or near evangelists for their process: tools, libraries, frameworks, and so on. Yet, sometimes these developers don't even understand the basics of the language(s) we are using, for example the `DOM` in web development. The tooling seems to have abstracted so much away from the developer they forgot how to develop natively.

#### **Concession**
Having owned my own business for over a decade I understand and conceded to the fact that business processes are necessary. Time and budget constraints are just a few of the factors that determine what languages and tooling needs to be used on a project. If your company has invested time, money, and resources into a development team that uses XYZ languages and tools, then XYZ languages and tools are the go to for new projects.

#### **Conclusion**

My goal however is to encourage individuals and teams to not only consider alternatives, but to provide a solution that overcomes some of the concerns and hurdles caused by these business processes and investments. TAB will not be the best solution for everyone, but it could be a better tool than what your using for some projects. If your a student or relatively new developer TAB is the perfect blend of learning native languages and tooling, a stepping stone that will in my option better prepare you to use advanced tools later. Some people may even find TAB as a better replacement for rapid static site development than bigger tools offering features you will never use.

**\~ Christopher Keers** (*6 Nov 2021*)

## Manifesto
TAB was born out of the frustrations discussed in the introduction. It was created because there is need for a simple lightweight framework that could do three things:

1. Encourage rising developers to learn more about languages and less about tooling.
2. Improve development time and morale for small teams or solo developers.
3. Encourage using the best tool instead of a familiar tool for a given project.

To clarify these points, TAB:

- can be a better tool to use than ones your currently using, but this is always project dependent. Some projects would be better suited by a different tool. Challenge yourself to check!
- is all about using the best tool for the job and not fitting a job into a tool. You can off-roading in a two wheel drive car if I want, but a four wheel drive lifted truck would offer a better experience.
- is here to encourage developers to start vanilla and add tools/frameworks only when necessary. MongoDB compliments TAB perfectly for example, but you'll have to add it into the TAB workflow on your own, in a way that fits your team or organization.

## Why Name It TAB?
This is actually a super simple answer:

1. TAB is an easy to remember acronym and `atab` is nice and short for command line usage as an NPM package.
2. I spent months trying to understand what exactly I had made and how I should name it, when Rich Harris gave me the answer: [Have Single-Page Apps Ruined the Web? | Transitional Apps](https://youtu.be/860d8usGC0o)

Quoting the synopsis to Rich's 2021 Jamstack Conference talk:

> Transitional apps samples elements from both traditional and modern architecture. The term is borrowed from interior design’s framing of “transitional design.” Transitional apps are, like multi-page apps, server-side rendered for fast initial loads, resilient since they work without JS by default, and provide a consistent experience with accessibility features built in. But like a single-page application, they also have a single codebase, fast navigation, persistent elements, and client-side state management.

Ignoring the part about *accessibility features built in*, I felt I had developed a Transitional App. More accurately, I felt that I had created a framework that would encourage the *building* of Transitional Apps. And that is how I decided on the name `TAB`.

So a big thank you to Rich Harris for `#transitionalapps`.

## How Can I Help?
TAB is an open source community supported project, if you would like to help please consider <a href="https://github.com/caboodle-tech/transitional-app-builder/issues" target="_blank">tackling an issue</a> or <a href="https://ko-fi.com/caboodletech" target="_blank">making a donation</a> to keep the project alive.

TAB can also use a hand in building out new features. For example, it was never envisioned to handle accessibility features for the developer, but maybe there is a way to stay true to TAB's goals **and** be more Transitional App like?