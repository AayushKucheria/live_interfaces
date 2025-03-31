#!/bin/bash

# Script to apply custom modifications to the loopy submodule
# Run this after cloning the repository or updating the submodule

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
PATCH_FILE="$REPO_ROOT/public/loopy.diff"
LOOPY_DIR="$REPO_ROOT/public/loopy"

echo "Applying custom modifications to loopy submodule..."

# Check if loopy directory exists
if [ ! -d "$LOOPY_DIR" ]; then
    echo "Error: Loopy directory not found at $LOOPY_DIR"
    echo "Please make sure you've initialized submodules with: git submodule update --init --recursive"
    exit 1
fi

# Check if the patch file exists
if [ ! -f "$PATCH_FILE" ]; then
    echo "Error: Patch file not found at $PATCH_FILE"
    exit 1
fi

# Navigate to loopy directory
cd "$LOOPY_DIR" || exit 1

# Apply the patch
if git apply --check "../loopy.diff" > /dev/null 2>&1; then
    echo "Applying patch..."
    if git apply "../loopy.diff"; then
        echo "✅ Successfully applied custom modifications to loopy!"
        exit 0
    else
        echo "❌ Failed to apply patch"
        exit 1
    fi
else
    echo "⚠️ Patch already applied or cannot be applied cleanly"
    echo "If you're seeing this after a fresh clone, the patch may conflict with the current state of the loopy submodule."
    exit 0
fi 