# globals directory

This directory is for all your global variables. Any JavaScript (`.js`) file in this directory will be loaded and made available to every template file in the templates directory and every file being compiled from the app directory.

## Creating a Global Variable

Global variables should be exported in the CommonJS module format and always exported as an `Object`.

Here is a simple example of a global variable being created and exported:

```javascript
const company = "Caboodle Tech Inc.";

module.exports = { company };
```

You can also create multiple global variables in a single file and export them together:

```javascript
const companyName = "Caboodle Tech Inc.";
const companyFounding = 2013;

module.exports = { companyName, companyFounding };
```

**Warning:** Global variables are loaded randomly and will quietly overwrite other global variables with the same name. Take care when naming global variables. You may want to adopt the naming convention used by templates if your organization is using a large amount of global variables.

## Calling a Global Variable

Global variables are called using the following format:

```text
${g:[global variable name]}
```

Using the examples from the last section here is how we would call `companyName` and `companyFounding`:

```text
${g:companyName}
${g:companyFounding}
```

In an actual HTML file if might look something like this:

```html
<p>${g:companyName} was founded in ${g:companyFounding}...</p>
```
