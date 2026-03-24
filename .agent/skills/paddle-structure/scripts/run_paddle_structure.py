#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "requests>=2.31.0",
# ]
# ///

import argparse
import base64
import os
import sys
from pathlib import Path

import requests


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}


def detect_file_type(file_path: str | Path) -> int:
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return 0
    if ext in IMAGE_EXTENSIONS:
        return 1
    raise ValueError(f"Unsupported file type: {ext}")


def read_file_as_base64(file_path: str | Path) -> str:
    with open(file_path, "rb") as file:
        return base64.b64encode(file.read()).decode("ascii")


def build_payload(file_data: str, file_type: int) -> dict:
    return {
        "file": file_data,
        "fileType": file_type,
        "useDocOrientationClassify": False,
        "useDocUnwarping": False,
        "useTextlineOrientation": False,
        "useChartRecognition": False,
    }


def get_config(args: argparse.Namespace) -> tuple[str, str]:
    token = args.token or os.environ.get("PADDLE_STRUCTURE_TOKEN")
    url = args.url or os.environ.get("PADDLE_STRUCTURE_URL")

    if not token:
        raise ValueError("Missing token. Set PADDLE_STRUCTURE_TOKEN or use --token.")
    if not url:
        raise ValueError("Missing URL. Set PADDLE_STRUCTURE_URL or use --url.")

    return token, url


def download_binary(url: str, session=requests) -> bytes:
    response = session.get(url, timeout=60)
    response.raise_for_status()
    return response.content


def save_binary_file(file_path: Path, content: bytes) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_bytes(content)
    print(f"Saved: {file_path}")


def save_layout_parsing_results(result: dict, output_dir: str | Path, session=requests) -> None:
    out_root = Path(output_dir)
    out_root.mkdir(parents=True, exist_ok=True)

    for i, res in enumerate(result.get("layoutParsingResults", [])):
        md_path = out_root / f"doc_{i}.md"
        md_text = res.get("markdown", {}).get("text", "")
        md_path.write_text(md_text, encoding="utf-8")
        print(f"Saved: {md_path}")

        markdown_images = res.get("markdown", {}).get("images", {})
        for img_path, img_url in markdown_images.items():
            full_img_path = out_root / img_path
            save_binary_file(full_img_path, download_binary(img_url, session=session))

        output_images = res.get("outputImages", {})
        for img_name, img_url in output_images.items():
            filename = out_root / f"{img_name}_{i}.jpg"
            save_binary_file(filename, download_binary(img_url, session=session))


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run Paddle Structure layout parsing on a local PDF or image.")
    parser.add_argument("--file", "-f", required=True, help="Local PDF or image path.")
    parser.add_argument("--output-dir", "-o", required=True, help="Directory for markdown and extracted images.")
    parser.add_argument("--token", help="Override PADDLE_STRUCTURE_TOKEN.")
    parser.add_argument("--url", help="Override PADDLE_STRUCTURE_URL.")
    return parser


def main() -> None:
    parser = build_arg_parser()
    args = parser.parse_args()

    file_path = Path(args.file)
    if not file_path.exists():
        print(f"File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    try:
        token, url = get_config(args)
        file_type = detect_file_type(file_path)
        file_data = read_file_as_base64(file_path)
        payload = build_payload(file_data, file_type)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)

    headers = {
        "Authorization": f"token {token}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, json=payload, headers=headers, timeout=300)
    print(response.status_code)
    if response.status_code != 200:
        print(response.text, file=sys.stderr)
        sys.exit(1)

    result = response.json()["result"]
    save_layout_parsing_results(result, args.output_dir)


if __name__ == "__main__":
    main()
