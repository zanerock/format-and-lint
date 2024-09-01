# @liquid-labs/sdlc-resource-eslint

Pre-configured formatting and style tool combining prettier and eslint.

## Formatting overview

- The code is run through prettier first mainly because it does a much better job adding and removing line breaks to fit code within a target width (80 chars).[^1]
- We then run the code through eslint for reformatting as well. This is because prettier is highly opinionated and we don't agree (nor think you should be forced to agree) with all the prettier opinions. In particular, our default configuration:
  - places operators at the beginning of the next line rather than the end of the previous line in multi-line expressions; e.g.:
  ```js
  const foo = bar // our way
    && baz
  // vs
  const foo = bar && // prettier way
    baz
  ```
  Our approach is generally accepted to be more readable.
  - places `else if`/`else`/`catch`, etc. on a newline; e.g.:
  ```js
  if { // our way
    ...
  }
  else {

  }
  // vs
  if { // prettier way
    ...
  } else {

  }
  ```
  While prettier's approach is more compact, we like the consistency of our approach and the ability to add ending comments associated with the preceding block.
  - aligns the colons in object declarations; e.g.:
  ```js
  { // our approach
    foo           : 'hey',
    longFieldName : 'how are you?',
  }
  // vs
  { // prettier way
    foo : 'hey',
    longFieldName : 'how are you?',
  }
  ```
  Again, we think our approach is more readable and also just looks cool.
- The dual-formatting is also compatible with the eslint configuration, so the code run through prettier + eslint for reformatting will also pass eslint when just checking (bot not changing) the code format.

[^1]: I remember eslint actually doing a better job of this, but for whatever reason (maybe when we upgraded to use the new '@stylistic' plugin that replaces the old core ruleset) we noticed two issues with the latest eslint based reformatting. First, it was miscounting the correct indention level where '(' was involved. Second, it seemed that eslint was failing to break up long lines automatically. (@stylistic/eslint-plugin: 2.6.4, eslint: 8.50.0)