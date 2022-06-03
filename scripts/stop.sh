#!/bin/bash
cd /app
if ! npm stop; then
    echo "servidor parado"
fi
