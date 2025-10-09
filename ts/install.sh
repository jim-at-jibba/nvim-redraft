#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Installing nvim-redraft TypeScript service..."

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Building TypeScript service..."
npm run build

echo "Installation complete!"
echo ""
echo "Don't forget to set your MORPH_API_KEY environment variable:"
echo "  export MORPH_API_KEY=\"your-api-key-here\""
