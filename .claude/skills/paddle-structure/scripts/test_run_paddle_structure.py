import importlib.util
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("run_paddle_structure.py")
SPEC = importlib.util.spec_from_file_location("run_paddle_structure", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_detect_file_type_for_pdf_and_image():
    assert MODULE.detect_file_type("paper.pdf") == 0
    assert MODULE.detect_file_type("figure.png") == 1


def test_build_payload_contains_expected_flags():
    payload = MODULE.build_payload("abc123", 0)
    assert payload == {
        "file": "abc123",
        "fileType": 0,
        "useDocOrientationClassify": False,
        "useDocUnwarping": False,
        "useTextlineOrientation": False,
        "useChartRecognition": False,
    }


def test_save_layout_parsing_results_writes_markdown_and_downloads_images(tmp_path):
    requested_urls = []

    class FakeResponse:
        def __init__(self, content: bytes):
            self.content = content

        def raise_for_status(self):
            return None

    class FakeSession:
        def get(self, url, timeout=60):
            requested_urls.append((url, timeout))
            return FakeResponse(f"binary-from:{url}".encode("utf-8"))

    result = {
        "layoutParsingResults": [
            {
                "markdown": {
                    "text": "# Title\n\ncontent",
                    "images": {
                        "images/img-1.png": "https://example.com/markdown-img.png",
                    },
                },
                "outputImages": {
                    "layout": "https://example.com/layout.jpg",
                },
            }
        ]
    }

    MODULE.save_layout_parsing_results(result, tmp_path, session=FakeSession())

    assert (tmp_path / "doc_0.md").read_text(encoding="utf-8") == "# Title\n\ncontent"
    assert (tmp_path / "images" / "img-1.png").read_bytes() == b"binary-from:https://example.com/markdown-img.png"
    assert (tmp_path / "layout_0.jpg").read_bytes() == b"binary-from:https://example.com/layout.jpg"
    assert requested_urls == [
        ("https://example.com/markdown-img.png", 60),
        ("https://example.com/layout.jpg", 60),
    ]
