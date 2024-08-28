#!/usr/bin/env bash

BASE_DIR="$(npm explore @liquid-labs/sdlc-resource-eslint -- pwd)"
ESLINT_CONFIG="${BASE_DIR}/dist/eslint.config.cjs"
PRETTIER_CONFIG="${BASE_DIR}/dist/prettierrc.yaml"

PRETTIER='npx prettier'
ESLINT='npx eslint'

if [[ -f ./index.js ]] || [[ -f ./index.mjs ]] || [[ -f ./index.cjs ]]; then
  SRC_PATTERN='**/*'
else
  SRC_PATTERN='src/**/*'
fi

if [[ $1 == '--check' ]]; then
  ESLINT_USE_FLAT_CONFIG=true ${ESLINT} \
    --config "${ESLINT_CONFIG}" \
    .
else
  ${PRETTIER} \
    --config "${PRETTIER_CONFIG}" \
    --write "${SRC_PATTERN}"

  ESLINT_USE_FLAT_CONFIG=true ${ESLINT} \
    --config "${ESLINT_CONFIG}" \
    --fix \
    .
fi
