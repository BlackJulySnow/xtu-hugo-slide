import importlib.util
from pathlib import Path

import fitz
from PIL import Image


MODULE_PATH = Path(__file__).with_name("crop_pdf_images.py")
SPEC = importlib.util.spec_from_file_location("crop_pdf_images", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_parse_page_index_and_image_refs():
    assert MODULE.parse_page_index("doc_12.md") == 12
    markdown = (
        '<img src="imgs/img_in_image_box_10_20_110_220.jpg" />\n'
        '<img src="imgs/img_in_table_box_30_40_130_240.jpg" />\n'
    )
    refs = MODULE.extract_image_refs(markdown)
    assert refs == [
        "imgs/img_in_image_box_10_20_110_220.jpg",
        "imgs/img_in_table_box_30_40_130_240.jpg",
    ]


def test_parse_bbox_and_mapping():
    bbox = MODULE.parse_bbox_from_ref("imgs/img_in_image_box_100_200_300_500.jpg")
    assert bbox["kind"] == "image"
    assert bbox["x1"] == 100
    rect = MODULE.map_bbox_to_pdf_rect(bbox, (1000, 1000), fitz.Rect(0, 0, 1000, 500))
    assert rect.x0 == 100
    assert rect.y0 == 100
    assert rect.x1 == 300
    assert rect.y1 == 250


def test_parse_bbox_and_mapping_with_side_by_side_reference():
    bbox = MODULE.parse_bbox_from_ref("imgs/img_in_image_box_100_200_300_500.jpg")
    rect = MODULE.map_bbox_to_pdf_rect(bbox, (2000, 1000), fitz.Rect(0, 0, 1000, 1000))
    assert rect.x0 == 100
    assert rect.y0 == 200
    assert rect.x1 == 300
    assert rect.y1 == 500


def test_get_reference_image_path_prefers_layout_then_region_then_overall(tmp_path):
    structure_dir = tmp_path / "structure"
    structure_dir.mkdir()

    overall = structure_dir / "overall_ocr_res_0.jpg"
    region = structure_dir / "region_det_res_0.jpg"
    layout = structure_dir / "layout_det_res_0.jpg"

    Image.new("RGB", (10, 10), "white").save(overall)
    assert MODULE.get_reference_image_path(structure_dir, 0) == overall

    Image.new("RGB", (10, 10), "white").save(region)
    assert MODULE.get_reference_image_path(structure_dir, 0) == region

    Image.new("RGB", (10, 10), "white").save(layout)
    assert MODULE.get_reference_image_path(structure_dir, 0) == layout


def test_crop_from_structure_output_creates_png(tmp_path):
    pdf_path = tmp_path / "sample.pdf"
    structure_dir = tmp_path / "structure"
    output_dir = tmp_path / "cropped"
    structure_dir.mkdir()

    doc = fitz.open()
    page = doc.new_page(width=1000, height=500)
    page.draw_rect(fitz.Rect(100, 100, 400, 300), color=(1, 0, 0), fill=(1, 0, 0))
    doc.save(pdf_path)
    doc.close()

    (structure_dir / "doc_0.md").write_text(
        '<img src="imgs/img_in_image_box_200_200_800_600.jpg" />',
        encoding="utf-8",
    )

    ref_image = Image.new("RGB", (2000, 1000), "white")
    ref_image.save(structure_dir / "overall_ocr_res_0.jpg")

    written = MODULE.crop_from_structure_output(pdf_path, structure_dir, output_dir, scale=2)
    assert len(written) == 1
    assert written[0].exists()
    with Image.open(written[0]) as cropped:
        assert cropped.size[0] > 0
        assert cropped.size[1] > 0
