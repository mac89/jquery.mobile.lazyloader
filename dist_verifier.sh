#!/bin/bash
set -e #Set errors to fail explicitly

# build dev
grunt dev

# build dist
grunt dist

if [[ `git status --porcelain dist/` ]]; then
    # Changes
    echo "ERROR: Distribution files were not generated properly. Please run the 'grunt dist' command and commit the files in the 'dist' directory."
    exit 1;
else
	# No changes
	echo "Distribution files successfully validated."
fi