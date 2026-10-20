#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$DIR/.node/bin:$PATH"

echo "🎵 Starting GrooveWorth Discogs Music Collection Valuator..."
echo "📍 Access web app at: http://localhost:3000"
echo ""

npm run dev
