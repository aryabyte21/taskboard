#!/bin/bash

echo "🚀 Setting up frontend with pnpm..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null
then
    echo "📦 pnpm not found. Installing pnpm globally..."
    npm install -g pnpm
    echo "✅ pnpm installed!"
else
    echo "✅ pnpm already installed"
fi

echo ""
echo "📦 Installing dependencies with pnpm..."
pnpm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the frontend:"
echo "  pnpm run dev"
echo ""
