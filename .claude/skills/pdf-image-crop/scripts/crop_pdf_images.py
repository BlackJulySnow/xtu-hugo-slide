#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "pymupdf>=1.24.0",
#   "pillow>=10.0.0",
# ]
# ///

import argparse
import re
import sys
from pathlib import Path

import fitz
from PIL import Image


DOC_PATTERN = re.compile(r"^doc_(\d+)\.md$")
IMG_PATTERN = re.compile(
    r"(?P<ref>imgs/(?P<name>img_in_(?P<kind>[a-z]+)_box_(?P<x1>\d+)_(?P<y1>\d+)_(?P<x2>\d+)_(?P<y2>\d+)\.(?:jpg|jpeg|png)))"
)


def parse_page_index(doc_path: str | Path) -> int:
    match = DOC_PATTERN.match(Path(doc_path).name)
    if not match:
        raise ValueError(f"Invalid doc filename: {doc_path}")
    return int(match.group(1))


def extract_image_refs(markdown_text: str) -> list[str]:
    seen = []
    for match in IMG_PATTERN.finditer(markdown_text):
        ref = match.group("ref")
        if ref not in seen:
            seen.append(ref)
    return seen


def parse_bbox_from_ref(image_ref: str) -> dict:
    match = IMG_PATTERN.search(image_ref)
    if not match:
        raise ValueError(f"Invalid image ref: {image_ref}")
    return {
        "ref": match.group("ref"),
        "name": match.group("name"),
        "kind": match.group("kind"),
        "x1": int(match.group("x1")),
        "y1": int(match.group("y1")),
        "x2": int(match.group("x2")),
        "y2": int(match.group("y2")),
    }


def get_reference_image_path(structure_dir: str | Path, page_index: int) -> Path:
    structure_dir = Path(structure_dir)
    candidates = [
        structure_dir / f"layout_det_res_{page_index}.jpg",
        structure_dir / f"region_det_res_{page_index}.jpg",
        structure_dir / f"overall_ocr_res_{page_index}.jpg",
    ]
    for ref_path in candidates:
        if ref_path.exists():
            return ref_path
    raise FileNotFoundError(f"Reference OCR image not found for page {page_index} in {structure_dir}")


def get_reference_image_size(structure_dir: str | Path, page_index: int) -> tuple[int, int]:
    ref_path = get_reference_image_path(structure_dir, page_index)
    with Image.open(ref_path) as img:
        return img.size


def get_effective_reference_size(ref_size: tuple[int, int], page_rect: fitz.Rect) -> tuple[int, int]:
    ref_w, ref_h = ref_size
    if ref_w <= 0 or ref_h <= 0:
        raise ValueError("Reference image size must be positive")

    expected_page_w = round(ref_h * (page_rect.width / page_rect.height))
    if expected_page_w > 0 and ref_w >= expected_page_w * 1.8:
        return expected_page_w, ref_h
    return ref_w, ref_h


def map_bbox_to_pdf_rect(bbox: dict, ref_size: tuple[int, int], page_rect: fitz.Rect) -> fitz.Rect:
    ref_w, ref_h = get_effective_reference_size(ref_size, page_rect)

    scale_x = page_rect.width / ref_w
    scale_y = page_rect.height / ref_h

    x1 = bbox["x1"] * scale_x
    y1 = bbox["y1"] * scale_y
    x2 = bbox["x2"] * scale_x
    y2 = bbox["y2"] * scale_y
    return fitz.Rect(x1, y1, x2, y2)


def iter_doc_files(structure_dir: str | Path) -> list[Path]:
    docs = []
    for path in Path(structure_dir).iterdir():
        if path.is_file() and DOC_PATTERN.match(path.name):
            docs.append(path)
    return sorted(docs, key=lambda p: parse_page_index(p))


def crop_from_structure_output(pdf_path: str | Path, structure_dir: str | Path, output_dir: str | Path, scale: float) -> list[Path]:
    pdf_path = Path(pdf_path)
    structure_dir = Path(structure_dir)
    output_dir = Path(output_dir)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    if not structure_dir.exists():
        raise FileNotFoundError(f"Structure dir not found: {structure_dir}")

    output_dir.mkdir(parents=True, exist_ok=True)
    written = []

    doc = fitz.open(pdf_path)
    try:
        for doc_file in iter_doc_files(structure_dir):
            page_index = parse_page_index(doc_file)
            if page_index >= len(doc):
                raise IndexError(f"Page index {page_index} out of range for PDF with {len(doc)} pages")

            markdown_text = doc_file.read_text(encoding="utf-8")
            refs = extract_image_refs(markdown_text)
            if not refs:
                continue

            page = doc[page_index]
            ref_size = get_reference_image_size(structure_dir, page_index)

            for ref in refs:
                bbox = parse_bbox_from_ref(ref)
                clip = map_bbox_to_pdf_rect(bbox, ref_size, page.rect)
                pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip, alpha=False)
                out_name = f"page_{page_index:03d}_{bbox['name'].rsplit('.', 1)[0]}_x{scale:g}.png"
                out_path = output_dir / out_name
                pix.save(out_path)
                print(f"Saved: {out_path}")
                written.append(out_path)
    finally:
        doc.close()

    return written


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Crop high-resolution images from a PDF using paddle-structure outputs.")
    parser.add_argument("--pdf", required=True, help="Original PDF path.")
    parser.add_argument("--structure-dir", required=True, help="Directory produced by paddle-structure.")
    parser.add_argument("--output-dir", required=True, help="Directory for cropped PNG images.")
    parser.add_argument("--scale", type=float, default=10.0, help="Render scale multiplier. Default: 10.")
    return parser


def main() -> None:
    parser = build_arg_parser()
    args = parser.parse_args()
    try:
        crop_from_structure_output(args.pdf, args.structure_dir, args.output_dir, args.scale)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
