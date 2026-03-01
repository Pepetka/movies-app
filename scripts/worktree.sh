#!/bin/bash

# Create git worktree with automatic .env files copying
# Usage: source ./scripts/worktree.sh <branch-name> [base-branch]
# Example: source ./scripts/worktree.sh feat/new-auth main
# Note: use 'source' or '.' to auto-cd into the new worktree

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_NAME=$(basename "$(pwd)")
BRANCH_NAME="${1:-}"
BASE_BRANCH="${2:-$(git branch --show-current)}"

if [ -z "$BRANCH_NAME" ]; then
    echo -e "${RED}Error: branch name is required${NC}"
    echo "Usage: ./scripts/worktree.sh <branch-name> [base-branch]"
    echo "Example: ./scripts/worktree.sh feat/new-auth main"
    exit 1
fi

PARENT_DIR=$(dirname "$(pwd)")
NEW_WORKTREE_PATH="${PARENT_DIR}/${PROJECT_NAME}-${BRANCH_NAME//\//-}"

if git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}"; then
    echo -e "${YELLOW}Branch '${BRANCH_NAME}' already exists, using it${NC}"
    git worktree add "$NEW_WORKTREE_PATH" "$BRANCH_NAME"
else
    echo -e "${GREEN}Creating new branch '${BRANCH_NAME}' from '${BASE_BRANCH}'${NC}"
    git worktree add "$NEW_WORKTREE_PATH" -b "$BRANCH_NAME" "$BASE_BRANCH"
fi

echo -e "${GREEN}Worktree created: ${NEW_WORKTREE_PATH}${NC}"

ENV_FILES=(".env" ".env.local" ".env.development" ".env.development.local" ".envrc")

for env_file in "${ENV_FILES[@]}"; do
    if [ -f "$env_file" ]; then
        cp "$env_file" "${NEW_WORKTREE_PATH}/${env_file}"
        echo -e "${GREEN}Copied: ${env_file}${NC}"
    fi
done

for app_dir in "apps/web" "apps/api"; do
    if [ -d "$app_dir" ]; then
        for env_file in "${ENV_FILES[@]}"; do
            if [ -f "${app_dir}/${env_file}" ]; then
                cp "${app_dir}/${env_file}" "${NEW_WORKTREE_PATH}/${app_dir}/${env_file}"
                echo -e "${GREEN}Copied: ${app_dir}/${env_file}${NC}"
            fi
        done
    fi
done

echo ""
echo -e "${GREEN}Done!${NC}"
echo -e "Install dependencies: ${YELLOW}pnpm install${NC}"

cd "$NEW_WORKTREE_PATH"
echo -e "${GREEN}Switched to: ${NEW_WORKTREE_PATH}${NC}"
