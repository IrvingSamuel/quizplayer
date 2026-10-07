#!/usr/bin/env bash
# Publica os pacotes @quizplayer/* no npm a partir da máquina local.
# Alternativa ao workflow release.yml quando o GitHub Actions não está disponível.
#
# Uso: NPM_TOKEN=npm_xxx scripts/publish-npm.sh [--dry-run]
#
# Idempotente: versões já publicadas são puladas.
set -euo pipefail

REGISTRY=https://registry.npmjs.org/
PACKAGES=(core react vue server)   # core primeiro: os demais dependem dele
DRY_RUN=${1:-}

: "${NPM_TOKEN:?defina NPM_TOKEN (token granular do npm com escrita no escopo @quizplayer)}"

cd "$(dirname "$0")/.."

NPMRC=$(mktemp)
trap 'rm -f "$NPMRC"' EXIT
printf 'registry=%s\n//registry.npmjs.org/:_authToken=%s\n' "$REGISTRY" "$NPM_TOKEN" > "$NPMRC"
export npm_config_userconfig=$NPMRC

echo "→ npm: autenticado como $(npm whoami --registry "$REGISTRY")"

npm ci --no-audit --no-fund
npm run build
npm test

for p in "${PACKAGES[@]}"; do
  name="@quizplayer/$p"
  version=$(node -p "require('./packages/${p/server/node}/package.json').version")
  if npm view "$name@$version" version --registry "$REGISTRY" >/dev/null 2>&1; then
    echo "→ $name@$version já publicado, pulando"
    continue
  fi
  echo "→ publicando $name@$version"
  npm publish -w "$name" --access public --registry "$REGISTRY" ${DRY_RUN:+--dry-run}
done

echo "✓ concluído"
