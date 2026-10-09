#!/usr/bin/env python3
"""ptree: print a project directory tree while honoring .gitignore rules."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

try:
    import pathspec
except ImportError:
    print("Missing dependency: pathspec\nInstall it with: py -m pip install pathspec", file=sys.stderr)
    raise SystemExit(2)


DEFAULT_EXCLUDES = {".git", ".hg", ".svn"}


def load_ignore_spec(directory: Path):
    """Load .gitignore patterns from this directory, if present."""
    ignore_file = directory / ".gitignore"
    if not ignore_file.is_file():
        return None
    try:
        lines = ignore_file.read_text(encoding="utf-8-sig").splitlines()
    except (OSError, UnicodeError):
        return None
    return pathspec.GitIgnoreSpec.from_lines(lines)


def is_ignored(path: Path, relative_to: Path, is_dir: bool, specs):
    """Check all applicable .gitignore files from root down to the path's parent."""
    try:
        rel = path.relative_to(relative_to).as_posix()
    except ValueError:
        return False

    # Built-in VCS metadata exclusions.
    if any(part in DEFAULT_EXCLUDES for part in path.relative_to(relative_to).parts):
        return True

    # Evaluate ignore files in each ancestor directory. A nested .gitignore
    # applies only within its own directory. Parent ignores cannot be negated
    # from a child directory, matching Git's behavior for excluded directories.
    parts = path.relative_to(relative_to).parts
    ignored = False
    for i in range(len(parts)):
        parent = relative_to.joinpath(*parts[:i])
        spec = specs.get(parent)
        if spec is None:
            continue
        candidate = Path(*parts[i:]).as_posix()
        candidate_is_dir = is_dir if i == len(parts) - 1 else True
        if spec.match_file(candidate + ("/" if candidate_is_dir else "")):
            ignored = True
    return ignored


def build_tree(root: Path, show_all: bool = True, max_depth: int | None = None):
    root = root.resolve()
    specs = {}

    def walk(directory: Path, prefix: str, depth: int):
        try:
            children = list(directory.iterdir())
        except PermissionError:
            return [prefix + "└── [permission denied]"]

        visible = []
        for child in children:
            if not show_all and child.name.startswith("."):
                continue
            if child.is_symlink():
                # Show symlinks, but never follow them.
                pass
            is_dir = child.is_dir() and not child.is_symlink()
            if is_ignored(child, root, is_dir, specs):
                continue
            visible.append(child)

        visible.sort(key=lambda p: (not (p.is_dir() and not p.is_symlink()), p.name.casefold()))
        lines = []
        for index, child in enumerate(visible):
            last = index == len(visible) - 1
            branch = "└── " if last else "├── "
            lines.append(prefix + branch + child.name + ("/" if child.is_dir() and not child.is_symlink() else ""))

            is_dir = child.is_dir() and not child.is_symlink()
            if is_dir:
                specs[child.parent] = load_ignore_spec(child.parent)
                if max_depth is None or depth < max_depth:
                    extension = "    " if last else "│   "
                    lines.extend(walk(child, prefix + extension, depth + 1))
        return lines

    specs[root] = load_ignore_spec(root)
    return [root.name + "/", *walk(root, "", 1)]


def main():
    parser = argparse.ArgumentParser(
        prog="ptree",
        description="Print a directory tree while respecting .gitignore files.",
    )
    parser.add_argument("path", nargs="?", default=".", help="project directory (default: current directory)")
    parser.add_argument("-o", "--output", help="write output to a file, e.g. STRUCTURE.md")
    parser.add_argument("--no-hidden", action="store_true", help="hide dotfiles and dot-directories")
    parser.add_argument("-L", "--level", type=int, help="maximum directory depth below the root")
    args = parser.parse_args()

    root = Path(args.path).expanduser()
    if not root.exists() or not root.is_dir():
        print(f"Error: not a directory: {root}", file=sys.stderr)
        return 2
    if args.level is not None and args.level < 0:
        parser.error("--level must be zero or greater")

    lines = build_tree(root, show_all=not args.no_hidden, max_depth=args.level)
    output = "\n".join(lines) + "\n"
    if args.output:
        out_path = Path(args.output).expanduser()
        try:
            out_path.write_text(output, encoding="utf-8")
        except OSError as exc:
            print(f"Error writing {out_path}: {exc}", file=sys.stderr)
            return 1
        print(f"Saved tree to {out_path}")
    else:
        print(output, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
