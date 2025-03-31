# Live Theory

A tool for visualizing and exploring theoretical concepts interactively.

## Setup

### Clone the repository with submodules

```bash
git clone https://github.com/yourusername/live_theory1.git
cd live_theory1
git submodule update --init --recursive
```

### Apply custom modifications to Loopy

We use a customized version of the Loopy visualization tool with additional features like:
- Mouse wheel zooming
- Sidebar minimization
- UI improvements

To apply these customizations, run:

```bash
./scripts/apply_loopy_patch.sh
```

This script will automatically apply our custom modifications to the Loopy submodule.

### When to run the patch script

Run the patch script:
- After initially cloning the repository
- After updating the Loopy submodule
- If you see any issues with custom features in Loopy

## Development

[Add your development instructions here]

## Features

[Describe your application's features here] 