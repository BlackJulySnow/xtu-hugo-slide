import importlib.util
import sys
import base64
from pathlib import Path

import pytest

MODULE_PATH = Path(__file__).with_name("generate_image.py")
SPEC = importlib.util.spec_from_file_location("generate_image", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


@pytest.mark.parametrize(
    ("max_input_dim", "expected"),
    [
        (0, "1K"),
        (1499, "1K"),
        (1500, "2K"),
        (2999, "2K"),
        (3000, "4K"),
    ],
)
def test_auto_detect_resolution_thresholds(max_input_dim, expected):
    assert MODULE.auto_detect_resolution(max_input_dim) == expected


def test_choose_output_resolution_auto_detects_when_resolution_omitted():
    assert MODULE.choose_output_resolution(None, 2200, True) == ("2K", True)


def test_choose_output_resolution_defaults_to_1k_without_inputs():
    assert MODULE.choose_output_resolution(None, 0, False) == ("1K", False)


def test_choose_output_resolution_respects_explicit_1k_with_large_input():
    assert MODULE.choose_output_resolution("1K", 3500, True) == ("1K", False)


def test_supported_models_are_exposed():
    assert MODULE.SUPPORTED_MODELS == [
        "google/gemini-3-pro-image-preview",
        "google/gemini-3.1-flash-image-preview",
    ]
    assert MODULE.DEFAULT_MODEL == "google/gemini-3.1-flash-image-preview"


def test_arg_parser_defaults_to_flash_image_preview():
    parser = MODULE.build_arg_parser()
    args = parser.parse_args(["--prompt", "test", "--filename", "out.png"])
    assert args.model == "google/gemini-3.1-flash-image-preview"


def test_arg_parser_accepts_explicit_flash_image_preview():
    parser = MODULE.build_arg_parser()
    args = parser.parse_args([
        "--prompt", "test",
        "--filename", "out.png",
        "--model", "google/gemini-3.1-flash-image-preview",
    ])
    assert args.model == "google/gemini-3.1-flash-image-preview"


def test_main_uses_flash_model_when_explicitly_requested(tmp_path, monkeypatch, capsys):
    output_path = tmp_path / "flash.png"
    pixel_png = base64.b64encode(
        bytes.fromhex(
            "89504E470D0A1A0A0000000D4948445200000001000000010802000000907753DE"
            "0000000C49444154789C63606060000000040001F61738550000000049454E44AE426082"
        )
    ).decode("ascii")
    requested = {}

    class FakeCompletions:
        def create(self, **kwargs):
            requested.update(kwargs)
            return type("Resp", (), {
                "model": kwargs["model"],
                "choices": [type("Choice", (), {
                    "finish_reason": "stop",
                    "message": type("Msg", (), {
                        "content": "ok",
                        "images": [{"image_url": {"url": f"data:image/png;base64,{pixel_png}"}}],
                    })(),
                })()],
            })()

    class FakeChat:
        def __init__(self):
            self.completions = FakeCompletions()

    class FakeClient:
        def __init__(self, *_args, **_kwargs):
            self.chat = FakeChat()

    monkeypatch.setattr(MODULE, "create_openrouter_client", lambda api_key: FakeClient())
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "generate_image.py",
            "--prompt", "test prompt",
            "--filename", str(output_path),
            "--model", "google/gemini-3.1-flash-image-preview",
            "--api-key", "dummy",
        ],
    )

    MODULE.main()

    out = capsys.readouterr().out
    assert requested["model"] == "google/gemini-3.1-flash-image-preview"
    assert output_path.exists()
    assert "MEDIA:" in out
