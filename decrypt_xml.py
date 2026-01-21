#!/usr/bin/env python3

import base64
import re
import sys
from pathlib import Path


HEADER_RE = re.compile(r"^ENCRYPTED\((?P<hash>[0-9a-f]+)\)::\s*(?P<b64>[\s\S]+)$")


def simple_hash(text: str) -> str:
    """
    Port of the TypeScript simpleHash function:

    let hash = 0;
    for each char:
      hash = ((hash << 5) - hash) + charCode
      hash = hash & hash
    return Math.abs(hash).toString(16)
    """
    hash_val = 0
    for ch in text:
        hash_val = ((hash_val << 5) - hash_val) + ord(ch)
        hash_val = hash_val & 0xFFFFFFFF  # force 32-bit

    # convert to signed 32-bit
    if hash_val & 0x80000000:
        hash_val = -((~hash_val & 0xFFFFFFFF) + 1)

    return format(abs(hash_val), "x")


def decrypt_file(path: Path, password: str) -> str:
    content = path.read_text(encoding="utf-8")

    match = HEADER_RE.match(content.strip())
    if not match:
        raise ValueError("Invalid encrypted file format")

    stored_hash = match.group("hash")
    base64_data = match.group("b64").strip()

    if stored_hash != simple_hash(password):
        raise ValueError("Invalid password")

    decoded_bytes = base64.b64decode(base64_data)
    return decoded_bytes.decode("utf-8")


def main():
    if len(sys.argv) != 3:
        print("Usage: python decrypt.py <filename.xml> <password>", file=sys.stderr)
        sys.exit(1)

    filename = Path(sys.argv[1])
    password = sys.argv[2]

    if not filename.exists():
        print(f"File not found: {filename}", file=sys.stderr)
        sys.exit(1)

    try:
        xml = decrypt_file(filename, password)
        print(xml)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
