#!/bin/bash
echo "Buscando posibles secretos en el historial de git..."

# Palabras clave comunes para secretos
PATTERNS="key|token|secret|password|api|bearer|authorization|pat-"

# Buscar en todo el historial
git grep -I -i -n -e "$PATTERNS" $(git rev-list --all) | tee secrets_found.txt

if [ -s secrets_found.txt ]; then
  echo "⚠️  Posibles secretos encontrados. Revisa el archivo secrets_found.txt"
else
  echo "✅ No se encontraron posibles secretos en el historial."
  rm secrets_found.txt
fi