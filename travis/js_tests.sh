#!/bin/bash

status=0

function run_test {
    "$@"
    local test_status=$?
    if [ $test_status -ne 0 ]; then
        status=$test_status
    fi
    return $status
}

run_test docker run -t travis-watch npm run coverage
run_test docker run -t travis-watch npm run lint
run_test docker run -t travis-watch npm run scss_lint
run_test docker run -t travis-watch npm run flow
run_test docker run -e "NODE_ENV=production" -t travis-watch ./webpack_if_prod.sh

exit $status
