---
name: pdf-image-crop
description: Use when extracting high-resolution image crops from an original PDF based on paddle-structure markdown outputs and OCR page renderings.
---

# PDF Image Crop

Use this skill after `paddle-structure` has already parsed a PDF and produced `doc_<i>.md` plus `overall_ocr_res_<i>.jpg`.

## Command

```bash
uv run {baseDir}/scripts/crop_pdf_images.py \
  --pdf "/absolute/path/to/paper.pdf" \
  --structure-dir "output/paddle-structure-test" \
  --output-dir "output/paddle-structure-highres" \
  --scale 10
```

## What it does

- reads `doc_<i>.md`
- finds `imgs/img_in_*_box_x1_y1_x2_y2.jpg`
- maps those pixel coordinates from `overall_ocr_res_<i>.jpg` onto the original PDF page
- crops high-resolution PNG files from the PDF

## Output

Each crop is saved as a PNG with page number and original box info in the filename.

## Notes

- this skill depends on existing `paddle-structure` output
- it uses `overall_ocr_res_<i>.jpg` as the coordinate reference image
- default scale is `10`
