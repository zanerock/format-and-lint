.DELETE_ON_ERROR:

SHELL:=bash

SRC:=src
DIST:=dist
QA:=qa

ALL_JS_FILES_SRC:=$(shell find $(SRC) -name "*.js")

BABEL_CONFIG_DIST:=$(DIST)/babel/babel-shared.config.cjs $(DIST)/babel/babel.config.cjs
BABEL_PKG:=$(shell npm explore @liquid-labs/catalyst-resource-babel-and-rollup -- pwd)
# BABEL_CONFIG_SRC:=$(BABEL_PKG)/dist/babel/babel-shared.config.cjs $(BABEL_PKG)/dist/babel/babel.config.cjs

CONFIG_FILES_SRC:=$(SRC)/eslint.config.js
CONFIG_FILES_DIST:=$(patsubst $(SRC)/%, $(DIST)/%, $(CONFIG_FILES_SRC))

default: all

$(CONFIG_FILES_DIST): $(DIST)/%: $(SRC)/%
	mkdir -p $(dir $@)
	cp $< $@

$(BABEL_CONFIG_DIST): $(DIST)/babel/%: $(BABEL_PKG)/dist/babel/%
	mkdir -p $(dir $@)
	cp $< $@

JEST:=npx jest
TEST_REPORT:=$(QA)/unit-test.txt
TEST_PASS_MARKER:=$(QA)/.unit-test-passed
PRECIOUS_TARGETS+=$(TEST_REPORT)

$(TEST_REPORT) $(TEST_PASS_MARKER) &: package.json $(ALL_JS_FILES_SRC)
	mkdir -p $(dir $@)
	echo -n 'Test git rev: ' > $(TEST_REPORT)
	git rev-parse HEAD >> $(TEST_REPORT)
	( set -e; set -o pipefail; \
		$(JEST) \
		| tee -a $(TEST_REPORT); \
		touch $(TEST_PASS_MARKER) )

ESLINT:=npx eslint
LINT_REPORT:=$(QA)/lint.txt
LINT_PASS_MARKER:=$(QA)/.lint.passed
PRECIOUS_TARGETS+=$(LINT_REPORT)

LINT_IGNORE_PATTERNS:=--ignore-pattern '$(DIST)/**/*' \
  --ignore-pattern '$(SRC)/test/data/**/*'

$(LINT_REPORT) $(LINT_PASS_MARKER) &: $(ALL_JS_FILES_SRC)
	mkdir -p $(dir $@)
	echo -n 'Test git rev: ' > $(LINT_REPORT)
	git rev-parse HEAD >> $(LINT_REPORT)
	( set -e; set -o pipefail; \
	  $(ESLINT) \
	    --ext .cjs,.js,.mjs,.cjs,.xjs \
	    $(LINT_IGNORE_PATTERNS) \
	    . \
	    | tee -a $(LINT_REPORT); \
	  touch $(LINT_PASS_MARKER) )

lint-fix:
	@( set -e; set -o pipefail; \
	  $(ESLINT) \
	    --ext .js,.mjs,.cjs,.xjs \
	    $(LINT_IGNORE_PATTERNS) \
	    --fix . )

test: $(TEST_REPORT) $(TEST_PASS_MARKER)

lint: $(LINT_REPORT) $(LINT_PASS_MARKER)

qa: tost lint

build: $(CONFIG_FILES_DIST) $(BABEL_CONFIG_DIST)

all: build

default: all

.PHONY: all build default lint qa

.PRECIOUS: $(LINT_REPORT)