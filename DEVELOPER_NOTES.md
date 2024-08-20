# Developer Notes

## Dropping standard rules

When we upgraded to the latest ['@stylistic'](https://eslint.style/) plugin and ruleset, we dropped the 'standard' rules.

## Weird dependency

In order to get the test running, we had to add `@babel/plugin-proposal-class-properties` and `@babel/plugin-proposal-optional-chaining` as developer dependencies. Otherwise we would get an error from babel (7.23.0) that it could not load these dependencies. As far as we can tell, the dependency load is coming from within babel and not based on any config of ours.

```
"Parsing error: Cannot resolve module '@babel/plugin-proposal-optional-chaining' from paths ['/Users/zane/.liq/playground/liquid-labs/catalyst-resource-eslint/dist/babel'] from /Users/zane/.liq/playground/liquid-labs/catalyst-resource-eslint/node_modules/@babel/core/lib/config/files/plugins.js\n" +
          '- Did you mean "@babel/plugin-transform-optional-chaining"?\n' +
          '\n' +
          'Make sure that all the Babel plugins and presets you are using\n' +
          'are defined as dependencies or devDependencies in your package.json\n' +
          "file. It's possible that the missing plugin is loaded by a preset\n" +
          'you are using that forgot to add the plugin to its dependencies: you\n' +
          'can workaround this problem by explicitly adding the missing package\n' +
          'to your top-level package.json.',
```

This has been captured in [issue #2](https://github.com/liquid-labs/catalyst-resource-eslint/issues/2).
