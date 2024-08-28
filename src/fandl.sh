#!/usr/bin/env bash

if [[ -L "$0" ]]; then
  SELF="$(readlink -f "$0")"
else
  SELF="$0"
fi

BASE_DIR="$(dirname ${SELF})"
ESLINT_CONFIG="${BASE_DIR}/eslint.config.cjs"
PRETTIER_CONFIG="${BASE_DIR}/prettierrc.yaml"
PRETTIER_IGNORE="${BASE_DIR}/prettierignore"

PRETTIER='npx prettier'
ESLINT='npx eslint'

if [[ -n ${FORMAT_FILES} ]]; then
  SRC_PATTERN="${FORMAT_FILES}"
elif [[ -f ./index.js ]] || [[ -f ./index.mjs ]] || [[ -f ./index.cjs ]]; then
  SRC_PATTERN='**/*'
else
  SRC_PATTERN='src/**/*'
fi

PRETTIER_IGNORE_OPTIONS='--ignore-path ./.gitignore'
if [[ -z ${CHECK_DATA_FILES} ]]; then
  PRETTIER_IGNORE_OPTIONS="${PRETTIER_IGNORE_OPTIONS} --ignore-path ${PRETTIER_IGNORE}"
fi

if [[ $1 == '--check' ]]; then
  # only run eslint check; prettier is guaranteed to fail because we don't actually follow it's format
  ESLINT_USE_FLAT_CONFIG=true ${ESLINT} \
    --config "${ESLINT_CONFIG}" \
    .
else
  ${PRETTIER} \
    --config "${PRETTIER_CONFIG}" \
    ${PRETTIER_IGNORE_OPTIONS} \
    --write \
    "${SRC_PATTERN}"

  ESLINT_USE_FLAT_CONFIG=true ${ESLINT} \
    --config "${ESLINT_CONFIG}" \
    --fix \
    .
fi
