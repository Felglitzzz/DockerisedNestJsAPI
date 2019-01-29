#!/bin/bash

if psql -lt | cut -d\| -f 1 | grep -qw test; then
  echo "database exists or doesn't"
fi

