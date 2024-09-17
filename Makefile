.DELETE_ON_ERROR:

SHELL:=bash

SRC:=src
LIB_SRC:=$(SRC)/lib
BIN_SRC:=$(SRC)/cli
DIST:=dist
QA:=qa

ALL_JS_FILES_SRC:=$(shell find $(SRC) -name "*.js" -o -name "*.cjs" -o -name "*.mjs")

BABEL_CONFIG_DIST:=$(DIST)/babel/babel-shared.config.cjs $(DIST)/babel/babel.config.cjs
BABEL_PKG:=$(shell npm explore @liquid-labs/sdlc-resource-babel-and-rollup -- pwd)
# BABEL_CONFIG_SRC:=$(BABEL_PKG)/dist/babel/babel-shared.config.cjs $(BABEL_PKG)/dist/babel/babel.config.cjs

CONFIG_FILES_SRC:=$(LIB_SRC)/eslint.config.mjs
CONFIG_FILES_DIST:=$(patsubst $(LIB_SRC)/%, $(DIST)/%, $(CONFIG_FILES_SRC))

# BIN_SRC_FILES:=$(LIB_SRC)/fandl.sh
# BIN_DIST:=$(patsubst $(LIB_SRC)/%, $(DIST)/%, $(BIN_SRC_FILES))

default: all

$(CONFIG_FILES_DIST): $(DIST)/%: $(LIB_SRC)/%
	mkdir -p $(dir $@)
	cp $< $@

$(BABEL_CONFIG_DIST): $(DIST)/babel/%: $(BABEL_PKG)/dist/babel/%
	mkdir -p $(dir $@)
	cp $< $@

$(BIN_DIST): $(DIST)/%: $(BIN_SRC)/%
	mkdir -p $(dir $@)
	cp $< $@
	chmod a+x $@

JEST:=NODE_OPTIONS='$(NODE_OPTIONS) --experimental-vm-modules' npx jest
TEST_REPORT:=$(QA)/unit-test.txt
TEST_PASS_MARKER:=$(QA)/.unit-test.passed
BUILD_TARGETS:=$(CONFIG_FILES_DIST) $(BABEL_CONFIG_DIST) $(BIN_DIST)
PRECIOUS_TARGETS+=$(TEST_REPORT)

$(TEST_REPORT) $(TEST_PASS_MARKER) &: package.json $(ALL_JS_FILES_SRC) # $(BUILD_TARGETS)
	mkdir -p $(dir $@)
	echo -n 'Test git rev: ' > $(TEST_REPORT)
	git rev-parse HEAD >> $(TEST_REPORT)
	( set -e; set -o pipefail; \
		$(JEST) \
		--testRegex '(/__tests__/.*|(\.|/)(test|spec))\.m?[jt]sx?$\' \
		| tee -a $(TEST_REPORT); \
		touch $(TEST_PASS_MARKER) )

# FANDL:=./dist/fandl.sh
LINT_REPORT:=$(QA)/lint.txt
LINT_PASS_MARKER:=$(QA)/.lint.passed
PRECIOUS_TARGETS+=$(LINT_REPORT)

$(LINT_REPORT) $(LINT_PASS_MARKER) &: $(ALL_JS_FILES_SRC) $(BUILD_TARGETS)
	mkdir -p $(dir $@)
	echo -n 'Test git rev: ' > $(LINT_REPORT)
	git rev-parse HEAD >> $(LINT_REPORT)
	( set -e; set -o pipefail; \
		$(FANDL) --check \
	    | tee -a $(LINT_REPORT); \
	  touch $(LINT_PASS_MARKER) )

lint-fix: $(ALL_JS_FILES_SRC) $(BUILD_TARGETS)
	@( set -e; set -o pipefail; \
	  $(FANDL) )

test: $(TEST_REPORT) $(TEST_PASS_MARKER)

lint: $(LINT_REPORT) $(LINT_PASS_MARKER)

qa: test lint

build: $(CONFIG_FILES_DIST) $(BABEL_CONFIG_DIST) $(BIN_DIST)

all: build

default: all

.PHONY: all build default lint qa

.PRECIOUS: $(LINT_REPORT)