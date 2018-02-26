#!/bin/bash
set -e #Set errors to fail explicitly

# build dev
grunt dev

# build dist
grunt dist

if git diff-index --quiet HEAD -- dist/; then
	echo "Distribution files successfully validated."
    # No changes
else
    # Changes
    echo "ERROR: Distribution files were not generated properly. Please run the 'grunt dist' command and commit the files in the 'dist' directory."
    exit 1;
fi