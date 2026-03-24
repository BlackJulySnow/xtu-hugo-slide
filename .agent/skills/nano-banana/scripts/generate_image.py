#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "openai>=1.0.0",
#     "pillow>=10.0.0",
# ]
# ///
"""
Generate images using Gemini image preview models via OpenRouter.

Usage:
    uv run generate_image.py --prompt "your image description" --filename "output.png" [--resolution 1K|2K|4K] [--api-key KEY]

Multi-image editing (up to 14 images):
    uv run generate_image.py --prompt "combine these images" --filename "output.png" -i img1.png -i img2.png -i img3.png
"""

import argparse
import os
import sys
import base64
from pathlib import Path
from io import BytesIO
from PIL import Image as PILImage
from openai import OpenAI

SUPPORTED_MODELS = [
    "google/gemini-3-pro-image-preview",
    "google/gemini-3.1-flash-image-preview",
]
DEFAULT_MODEL = "google/gemini-3.1-flash-image-preview"

SUPPORTED_ASPECT_RATIOS = [
    "1:1",
    "2:3",
    "3:2",
    "3:4",
    "4:3",
    "4:5",
    "5:4",
    "9:16",
    "16:9",
    "21:9",
]


def get_api_key(provided_key: str | None) -> str | None:
    """Get API key from argument first, then environment."""
    if provided_key:
        return provided_key
    return os.environ.get("OPENROUTER_API_KEY")


def auto_detect_resolution(max_input_dim: int) -> str:
    """Infer output resolution from the largest input image dimension."""
    if max_input_dim >= 3000:
        return "4K"
    if max_input_dim >= 1500:
        return "2K"
    return "1K"


def choose_output_resolution(
    requested_resolution: str | None,
    max_input_dim: int,
    has_input_images: bool,
) -> tuple[str, bool]:
    """Choose final resolution.

    Default to 1K unless user explicitly specifies a different resolution.
    """
    if requested_resolution is not None:
        return requested_resolution, False

    if has_input_images:
        return auto_detect_resolution(max_input_dim), True

    return "1K", False


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generate images using Gemini image preview models via OpenRouter"
    )
    parser.add_argument(
        "--prompt", "-p",
        required=True,
        help="Image description/prompt"
    )
    parser.add_argument(
        "--filename", "-f",
        required=True,
        help="Output filename (e.g., sunset-mountains.png)"
    )
    parser.add_argument(
        "--input-image", "-i",
        action="append",
        dest="input_images",
        metavar="IMAGE",
        help="Input image path(s) for editing/composition. Can be specified multiple times (up to 14 images)."
    )
    parser.add_argument(
        "--resolution", "-r",
        choices=["1K", "2K", "4K"],
        default=None,
        help="Output resolution: 1K (default), 2K, or 4K."
    )
    parser.add_argument(
        "--aspect-ratio", "-a",
        choices=SUPPORTED_ASPECT_RATIOS,
        default=None,
        help=f"Output aspect ratio (default: model decides). Options: {', '.join(SUPPORTED_ASPECT_RATIOS)}"
    )
    parser.add_argument(
        "--model", "-m",
        choices=SUPPORTED_MODELS,
        default=DEFAULT_MODEL,
        help="Gemini image preview model to use."
    )
    parser.add_argument(
        "--api-key", "-k",
        help="OpenRouter API key (overrides OPENROUTER_API_KEY env var)"
    )
    return parser


def create_openrouter_client(api_key: str) -> OpenAI:
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
        default_headers={
            "HTTP-Referer": "https://github.com/anthropics/claude-code",
            "X-Title": "Nano Banana Skill"
        }
    )


def image_to_data_uri(img_path: str) -> str:
    """Convert an image file to base64 data URI."""
    with PILImage.open(img_path) as img:
        # Convert to PNG to ensure consistent format
        buffer = BytesIO()
        if img.mode == 'RGBA':
            rgb_image = PILImage.new('RGB', img.size, (255, 255, 255))
            rgb_image.paste(img, mask=img.split()[3])
            rgb_image.save(buffer, format='PNG')
        else:
            img.convert('RGB').save(buffer, format='PNG')
        img_bytes = buffer.getvalue()
        base64_str = base64.b64encode(img_bytes).decode('utf-8')
        return f"data:image/png;base64,{base64_str}"


def main():
    parser = build_arg_parser()
    args = parser.parse_args()

    # Get API key
    api_key = get_api_key(args.api_key)
    if not api_key:
        print("Error: No API key provided.", file=sys.stderr)
        print("Please either:", file=sys.stderr)
        print("  1. Provide --api-key argument", file=sys.stderr)
        print("  2. Set OPENROUTER_API_KEY environment variable", file=sys.stderr)
        sys.exit(1)

    # Initialise OpenRouter client
    client = create_openrouter_client(api_key)

    # Set up output path
    output_path = Path(args.filename)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Load input images if provided (up to 14 supported by Nano Banana Pro)
    input_image_uris = []
    max_input_dim = 0
    if args.input_images:
        if len(args.input_images) > 14:
            print(f"Error: Too many input images ({len(args.input_images)}). Maximum is 14.", file=sys.stderr)
            sys.exit(1)

        for img_path in args.input_images:
            try:
                with PILImage.open(img_path) as img:
                    width, height = img.size
                data_uri = image_to_data_uri(img_path)
                input_image_uris.append(data_uri)
                print(f"Loaded input image: {img_path}")

                # Track largest dimension for auto-resolution
                max_input_dim = max(max_input_dim, width, height)
            except Exception as e:
                print(f"Error loading input image '{img_path}': {e}", file=sys.stderr)
                sys.exit(1)

    output_resolution, _ = choose_output_resolution(
        requested_resolution=args.resolution,
        max_input_dim=max_input_dim,
        has_input_images=bool(input_image_uris),
    )

    # Build content array
    content = []
    # Add input images first
    for uri in input_image_uris:
        content.append({
            "type": "image_url",
            "image_url": {"url": uri}
        })
    # Add prompt
    content.append({
        "type": "text",
        "text": args.prompt
    })

    img_count = len(input_image_uris)
    if img_count > 0:
        print(f"Processing {img_count} image{'s' if img_count > 1 else ''} with resolution {output_resolution}...")
    else:
        print(f"Generating image with resolution {output_resolution}...")

    try:
        # Build extra body parameters for Gemini-specific options
        extra_body = {
            "modalities": ["image", "text"],
            "image_config": {
                "image_size": output_resolution
            }
        }
        if args.aspect_ratio:
            extra_body["image_config"]["aspect_ratio"] = args.aspect_ratio

        response = client.chat.completions.create(
            model=args.model,
            messages=[{"role": "user", "content": content}],
            extra_body=extra_body
        )

        # Process response
        image_saved = False
        message = response.choices[0].message

        # Print text response if exists
        if message.content:
            print(f"Model response: {message.content}")

        # Get images from response (OpenRouter returns images in message.images)
        if not hasattr(message, 'images') or not message.images:
            print(f"Error: No images returned from model", file=sys.stderr)
            print(f"Model: {response.model}", file=sys.stderr)
            print(f"Finish reason: {response.choices[0].finish_reason}", file=sys.stderr)
            sys.exit(1)

        # Process the first image
        image_data = None
        for image in message.images:
            img_url = image['image_url']['url']
            if img_url.startswith('data:image'):
                # Base64 data URL
                _, data = img_url.split(',', 1)
                image_data = base64.b64decode(data)
            else:
                # Remote URL, download it
                import requests
                img_response = requests.get(img_url)
                img_response.raise_for_status()
                image_data = img_response.content
            break  # Use first image

        if not image_data:
            print("Error: Failed to get image data from response", file=sys.stderr)
            sys.exit(1)

        # Open image from data
        image = PILImage.open(BytesIO(image_data))

        # Save the image
        if image.mode == 'RGBA':
            rgb_image = PILImage.new('RGB', image.size, (255, 255, 255))
            rgb_image.paste(image, mask=image.split()[3])
            rgb_image.save(str(output_path), 'PNG')
        elif image.mode == 'RGB':
            image.save(str(output_path), 'PNG')
        else:
            image.convert('RGB').save(str(output_path), 'PNG')
        image_saved = True

        if image_saved:
            full_path = output_path.resolve()
            print(f"\nImage saved: {full_path}")
            # OpenClaw parses MEDIA: tokens and will attach the file on
            # supported chat providers. Emit the canonical MEDIA:<path> form.
            print(f"MEDIA:{full_path}")
        else:
            print("Error: No image was generated in the response.", file=sys.stderr)
            sys.exit(1)

    except Exception as e:
        print(f"Error generating image: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
