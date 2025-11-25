#!/usr/bin/env python3
"""
Generate final-layer attention samples for VGGT base model pairs.

For each overlap category (large/small/none) we pick a handful of pairs
with the lowest base (pretrained) rotation error and extract the L23
cross-view attention weights in the original order (img1 -> img2).
For every 3x3 sampled region in image 1 we record how image 2 attends
to that region, saving both the raw attention grid and a heatmap overlay.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
from io import BytesIO
import tempfile
from PIL import Image

# -----------------------------------------------------------------------------
# Resolve paths so we can reuse the existing VGGT attention utilities
# -----------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parents[1]
VGGT_ROOT = Path("/home/yz864/vggt")
ATTN_UTIL_ROOT = VGGT_ROOT / "attention_viz"

sys.path.append(str(ATTN_UTIL_ROOT))

from extract_tokens import VGGTTokenExtractor  # noqa: E402

# -----------------------------------------------------------------------------
# Default paths
# -----------------------------------------------------------------------------
DEFAULT_TEST_DATA = "/home/yz864/vggt/pairwise_test_sets/welp/welp_final.npy"
DEFAULT_BASE_RESULTS = (
    "/home/yz864/vggt/pairwise_test_sets/welp/vggt/base/"
    "welp_test_results_20251111_185219.npy"
)
DEFAULT_OUTPUT_ROOT = REPO_ROOT / "static" / "attention_vis"
MAX_PNG_BYTES = 50 * 1024


# -----------------------------------------------------------------------------
# Helper utilities
# -----------------------------------------------------------------------------
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate last-layer attention samples for selected pairs."
    )
    parser.add_argument(
        "--test_data",
        type=Path,
        default=Path(DEFAULT_TEST_DATA),
        help="Path to welp_final.npy test set.",
    )
    parser.add_argument(
        "--base_results",
        type=Path,
        default=Path(DEFAULT_BASE_RESULTS),
        help="Path to pretrained VGGT evaluation results (np.load-able dict).",
    )
    parser.add_argument(
        "--output_root",
        type=Path,
        default=Path(DEFAULT_OUTPUT_ROOT),
        help="Directory where per-pair attention data will be stored.",
    )
    parser.add_argument(
        "--pairs_per_overlap",
        type=int,
        default=20,
        help="How many pairs to keep per overlap category.",
    )
    parser.add_argument(
        "--max_pairs",
        type=int,
        default=None,
        help="Optional cap on total processed pairs (debugging).",
    )
    parser.add_argument(
        "--specific_pairs",
        type=int,
        nargs="+",
        default=None,
        help="Generate only these specific pair indices (overrides normal selection).",
    )
    return parser.parse_args()


def load_test_data(path: Path) -> Dict[int, dict]:
    if not path.exists():
        raise FileNotFoundError(f"Test data file not found: {path}")
    data = np.load(path, allow_pickle=True).item()
    return data


def load_base_errors(path: Path) -> Dict[str, List[float]]:
    if not path.exists():
        raise FileNotFoundError(f"Base results file not found: {path}")
    results = np.load(path, allow_pickle=True).item()
    if "rot_errors_by_overlap" not in results:
        raise KeyError("Expected 'rot_errors_by_overlap' in base results.")
    base_errors = results["rot_errors_by_overlap"]
    # Normalize keys to lowercase for convenience
    return {k.lower(): v for k, v in base_errors.items()}


def get_image_base_path(pair_data: dict) -> Path:
    """Match pair image path to the correct root folder."""
    rel_path = pair_data["img1"]["path"].lower()
    if "welp" in rel_path:
        return Path("/home/yz864/vggt/metadata/images_to_npys/test_scenes_images/welp")
    if "selp" in rel_path or "greatcourt" in rel_path:
        return Path("/home/yz864/vggt/metadata/images_to_npys/test_scenes_images/selp")
    return Path("/home/yz864/vggt/metadata/images_to_npys/test_scenes_images/selp")


def resolve_image_paths(pair_data: dict) -> Tuple[Path, Path]:
    base_path = get_image_base_path(pair_data)
    img1_path = base_path / pair_data["img1"]["path"]
    img2_path = base_path / pair_data["img2"]["path"]
    if not img1_path.exists() or not img2_path.exists():
        raise FileNotFoundError(f"Missing images for pair: {pair_data['img1']['path']}")
    return img1_path, img2_path


def is_four_three(image_meta: dict, tol: float = 0.05) -> bool:
    w = image_meta.get("width")
    h = image_meta.get("height")
    if not w or not h:
        return False
    ratio = w / h
    target = 4 / 3
    return abs(ratio - target) <= tol


def is_pair_four_three(pair_data: dict, tol: float = 0.05) -> bool:
    return is_four_three(pair_data["img1"], tol) and is_four_three(pair_data["img2"], tol)


def get_scene_name(pair_data: dict) -> str:
    """Extract scene name from pair data, similar to generate_histogram_data.py."""
    img1_path_str = str(pair_data.get("img1", {}).get("path", ""))
    scene_name = "Unknown"
    
    # Check for dense_dgpp pattern (from histogram script)
    if "dense_dgpp" in img1_path_str:
        parts = img1_path_str.split("/")
        try:
            dense_idx = parts.index("dense_dgpp")
            if dense_idx + 1 < len(parts):
                scene_name = parts[dense_idx + 1].replace("_", " ")
        except ValueError:
            pass
    
    # If still unknown, extract from path structure
    if scene_name == "Unknown":
        parts = img1_path_str.split("/")
        # Scene name is typically after welp/selp/greatcourt in the path
        for i, part in enumerate(parts):
            part_lower = part.lower()
            if "welp" in part_lower or "selp" in part_lower or "greatcourt" in part_lower:
                if i + 1 < len(parts):
                    scene_name = parts[i + 1].replace("_", " ")
                    break
        
        # Fallback: use first meaningful part of path
        if scene_name == "Unknown":
            for part in parts:
                if part and part not in ["", ".", ".."] and not part.endswith((".jpg", ".png", ".jpeg")):
                    scene_name = part.replace("_", " ")
                    break
    
    return scene_name


def select_pairs(
    test_data: Dict[int, dict],
    base_errors: Dict[str, List[float]],
    pairs_per_overlap: int,
    aspect_tol: float = 0.05,
) -> Dict[str, List[Tuple[int, float]]]:
    """
    Map overlap category -> list of (pair_idx, base_error) sorted by error.
    Ensures ALL pairs across all overlap categories are from different scenes.
    """
    overlap_to_pairs: Dict[str, List[int]] = defaultdict(list)
    for pair_idx, pair_data in test_data.items():
        overlap = pair_data.get("overlap_amount", "unknown")
        overlap_to_pairs[overlap.lower()].append(pair_idx)

    selected: Dict[str, List[Tuple[int, float]]] = {}
    # Global set to track used scenes across ALL overlap categories
    global_used_scenes = set()
    
    for overlap in ("large", "small", "none"):
        errors = base_errors.get(overlap, [])
        pair_indices = overlap_to_pairs.get(overlap, [])

        usable_len = min(len(errors), len(pair_indices))
        if usable_len == 0:
            print(f"[WARN] No data for overlap '{overlap}', skipping.")
            selected[overlap] = []
            continue

        raw_candidates = [
            (pair_indices[i], float(errors[i])) for i in range(usable_len)
        ]
        candidates = [
            (idx, err)
            for idx, err in raw_candidates
            if is_pair_four_three(test_data[idx], aspect_tol)
        ]
        candidates.sort(key=lambda item: item[1])
        
        # Filter to ensure pairs are from different scenes (globally across all categories)
        selected_pairs = []
        for idx, err in candidates:
            scene_name = get_scene_name(test_data[idx])
            if scene_name not in global_used_scenes:
                selected_pairs.append((idx, err))
                global_used_scenes.add(scene_name)
                if len(selected_pairs) >= pairs_per_overlap:
                    break
        
        if len(selected_pairs) < pairs_per_overlap:
            print(f"[WARN] Only found {len(selected_pairs)} pairs from different scenes for overlap '{overlap}' (requested {pairs_per_overlap})")
        
        selected[overlap] = selected_pairs
    
    total_pairs = sum(len(pairs) for pairs in selected.values())
    total_scenes = len(global_used_scenes)
    if total_pairs == total_scenes:
        print(f"[INFO] Selected {total_pairs} pairs from {total_scenes} different scenes across all overlap categories.")
    else:
        print(f"[WARN] Selected {total_pairs} pairs but only {total_scenes} unique scenes (expected {total_pairs}).")
    
    return selected


def ensure_output_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def clear_directory(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)


def copy_images(pair_dir: Path, img1_path: Path, img2_path: Path) -> None:
    shutil.copy2(img1_path, pair_dir / "img1.png")
    shutil.copy2(img2_path, pair_dir / "img2.png")


def extract_tokens_for_pair(
    extractor: VGGTTokenExtractor,
    img1_path: Path,
    img2_path: Path,
    token_dir: Path,
) -> None:
    """Extract tokens (final layer only) and store them under token_dir."""
    ensure_output_dir(token_dir)
    extractor.extract_tokens([str(img1_path), str(img2_path)], final_layer_only=True)
    extractor.save_tokens(str(token_dir))


def create_attention_heatmap(attention_grid, output_path, sample_info, model_name,
                             order_type, pair_idx, start_row, start_col, patch_size,
                             overlay_img_path=None):
    """Copied from generate_single_pair.py to ensure identical visualization."""
    import matplotlib.pyplot as plt
    from PIL import Image
    import numpy as np
    import cv2

    if overlay_img_path:
        try:
            overlay_img = Image.open(overlay_img_path).convert('RGB')
            Hp, Wp = attention_grid.shape
            patch_size_pixels = 14
            img_width = Wp * patch_size_pixels
            img_height = Hp * patch_size_pixels

            overlay_img_resized = overlay_img.resize((img_width, img_height))
            overlay_img_array = np.array(overlay_img_resized)

            H, W = overlay_img_array.shape[:2]
            heatmap_resized = cv2.resize(attention_grid.astype(np.float32), (W, H), interpolation=cv2.INTER_NEAREST)

            if heatmap_resized.max() > heatmap_resized.min():
                heatmap_norm = (heatmap_resized - heatmap_resized.min()) / (heatmap_resized.max() - heatmap_resized.min())
            else:
                heatmap_norm = np.zeros_like(heatmap_resized)

            cmap = plt.cm.get_cmap('jet')
            heatmap_colored = cmap(heatmap_norm)[:, :, :3]

            image_norm = overlay_img_array.astype(np.float32) / 255.0
            heatmap_colored = heatmap_colored.astype(np.float32)

            alpha = 0.4
            overlay = (1 - alpha) * image_norm + alpha * heatmap_colored
            overlay = (overlay * 255).astype(np.uint8)

            fig, ax = plt.subplots(1, 1, figsize=(8, 6))
            ax.imshow(overlay)

        except Exception as e:
            print(f"        [warn] Could not load original image for overlay: {e}")
            fig, ax = plt.subplots(1, 1, figsize=(8, 6))
            ax.imshow(attention_grid, cmap='jet', interpolation='nearest')
    else:
        fig, ax = plt.subplots(1, 1, figsize=(8, 6))
        ax.imshow(attention_grid, cmap='jet', interpolation='nearest')

    ax.axis('off')
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

    def save_with_limit(fig):
        current_fig = fig
        current_scale = 1.0
        while True:
            bio = BytesIO()
            current_fig.savefig(
                bio,
                format="png",
                dpi=int(150 * current_scale),
                bbox_inches='tight',
                pad_inches=0,
            )
            size = bio.tell()
            if size <= MAX_PNG_BYTES or current_scale <= 0.4:
                with output_path.open("wb") as f:
                    f.write(bio.getvalue())
                break
            current_scale *= 0.85

    save_with_limit(fig)
    plt.close(fig)


def generate_sample_patches(
    pair_dir: Path,
    token_dir: Path,
    pair_idx: int,
    img1_overlay: Path,
    img2_overlay: Path,
):
    """Generate only the sample patch heatmaps/arrays (no JSON metadata)."""
    print(f"    [samples] Generating attention data for 3x3 patch sampling...")

    sample_dir = pair_dir / "sample_patches"
    sample_dir.mkdir(exist_ok=True)

    patch_size = 3
    sample_ids = list(range(1, 29))
    sample_records: List[dict] = []

    attention_weights_path = token_dir / "L23_global_attention_weights.npy"
    metadata_path = token_dir / "metadata.json"

    if not attention_weights_path.exists():
        print(f"        [warn] No attention weights found at {attention_weights_path}")
        return
    if not metadata_path.exists():
        print(f"        [warn] No metadata found at {metadata_path}")
        return

    attention_weights = np.load(attention_weights_path)
    with open(metadata_path, "r") as f:
        token_metadata = json.load(f)

    Hp, Wp = token_metadata["patch_grid"]
    N_patches = Hp * Wp
    total_tokens = attention_weights.shape[-1]

    special_per_frame = token_metadata.get("patch_start_idx", 5)
    found = False
    for spf in [10, 9, 8, 7, 6, 5]:
        expected_total = 2 * (spf + N_patches)
        if total_tokens == expected_total:
            special_per_frame = spf
            found = True
            break
    if not found:
        print("        [warn] Could not determine token structure for base original")
        return

    img1_start = special_per_frame
    img1_end = img1_start + N_patches
    img2_start = special_per_frame + N_patches + special_per_frame
    img2_end = img2_start + N_patches

    max_regions_h = Hp - patch_size + 1
    max_regions_w = Wp - patch_size + 1
    def evenly_spaced_indices(max_idx: int, count: int, patch_sz: int) -> List[int]:
        """Return `count` indices with identical gaps, clamped to valid range."""
        if count <= 1 or max_idx <= 0:
            return [0]

        step = max(1, max_idx // (count - 1))
        max_start = max_idx - step * (count - 1)
        desired_offset = patch_sz // 2
        start = max(0, min(desired_offset, max_start))
        return [start + i * step for i in range(count)]

    row_indices = evenly_spaced_indices(max_regions_h - 1, 4, patch_size)
    # Horizontal indices: 2, 7, 12, 17, 22, 27, 32
    col_indices = [2 + i * 5 for i in range(7)]
    # Clamp to valid range
    col_indices = [min(col, max_regions_w - patch_size) for col in col_indices]

    region_positions = [(row_idx, col_idx) for row_idx in row_indices for col_idx in col_indices]

    for i, patch_id in enumerate(sample_ids):
        start_row, start_col = region_positions[i]
        start_row = min(start_row, Hp - patch_size)
        start_col = min(start_col, Wp - patch_size)

        region_patch_indices = []
        for r in range(patch_size):
            for c in range(patch_size):
                patch_row = start_row + r
                patch_col = start_col + c
                patch_idx = patch_row * Wp + patch_col
                region_patch_indices.append(patch_idx)

        img1_patch_indices = [img1_start + idx for idx in region_patch_indices]
        attention_to_region = attention_weights[0, :, img2_start:img2_end, img1_patch_indices]

        attention_scores = attention_to_region.mean(axis=1).mean(axis=0)
        attention_grid = attention_scores.reshape(Hp, Wp)

        overlay_img_path = img2_overlay
        heatmap_file = sample_dir / f"base_original_sample_{patch_id}_heatmap.png"
        rel_heatmap = Path("sample_patches") / f"base_original_sample_{patch_id}_heatmap.png"
        create_attention_heatmap(
            attention_grid,
            heatmap_file,
            {"id": patch_id},
            "base",
            "original",
            pair_idx,
            start_row,
            start_col,
            patch_size,
            overlay_img_path,
        )

        sample_records.append(
            {
                "sample_id": patch_id,
                "region_position": [int(start_row), int(start_col)],
                "patch_size": patch_size,
                "heatmap": str(rel_heatmap),
                "stats": {
                    "min": float(attention_scores.min()),
                    "max": float(attention_scores.max()),
                    "mean": float(attention_scores.mean()),
                    "std": float(attention_scores.std()),
                },
            }
        )

    output_data = {
        "pair_idx": pair_idx,
        "patch_grid": token_metadata.get("patch_grid", [Hp, Wp]),
        "samples": sample_records,
    }
    js_path = pair_dir / "sample_patches.js"
    js_content = (
        "const samplePatchesData = "
        + json.dumps(output_data, indent=2)
        + ";\nexport default samplePatchesData;\n"
    )
    js_path.write_text(js_content)

    print(f"    [samples] Saved {len(sample_ids)} heatmaps for pair {pair_idx}")


def process_pair(
    extractor: VGGTTokenExtractor,
    pair_idx: int,
    pair_data: dict,
    base_error: float,
    output_root: Path,
) -> None:
    pair_dir = output_root / f"pair_{pair_idx}"
    clear_directory(pair_dir)
    ensure_output_dir(pair_dir)

    img1_path, img2_path = resolve_image_paths(pair_data)
    copy_images(pair_dir, img1_path, img2_path)

    with tempfile.TemporaryDirectory() as tmpdir:
        token_dir = Path(tmpdir)
        extract_tokens_for_pair(extractor, img1_path, img2_path, token_dir)

        local_img1 = pair_dir / "img1.png"
        local_img2 = pair_dir / "img2.png"
        generate_sample_patches(pair_dir, token_dir, pair_idx, local_img1, local_img2)

    print(
        f"[OK] Pair {pair_idx}: wrote attention data to {pair_dir} "
        f"(base error {base_error:.2f}°)."
    )


# -----------------------------------------------------------------------------
# Main entry point
# -----------------------------------------------------------------------------
def main() -> None:
    args = parse_args()
    test_data = load_test_data(args.test_data)
    base_errors = load_base_errors(args.base_results)
    
    # Don't clear directory if generating specific pairs (to preserve existing data)
    if args.specific_pairs is None:
        clear_directory(args.output_root)
    ensure_output_dir(args.output_root)

    extractor = VGGTTokenExtractor(checkpoint_path=None)
    processed = 0
    pairs_metadata = []

    if args.specific_pairs:
        # Generate only specified pairs
        print(f"===> Generating {len(args.specific_pairs)} specific pair(s)")
        for pair_idx in args.specific_pairs:
            if pair_idx not in test_data:
                print(f"[WARN] Pair {pair_idx} not found in test data, skipping.")
                continue
            
            pair_data = test_data[pair_idx]
            overlap = pair_data.get("overlap_amount", "unknown").lower()
            
            # Find the error for this pair
            error = 0.0
            if overlap in base_errors:
                overlap_pairs = [idx for idx, _ in select_pairs(test_data, base_errors, 1000).get(overlap, [])]
                if pair_idx in overlap_pairs:
                    idx_in_list = overlap_pairs.index(pair_idx)
                    errors = base_errors[overlap]
                    if idx_in_list < len(errors):
                        error = float(errors[idx_in_list])
            
            process_pair(
                extractor,
                pair_idx,
                pair_data,
                error,
                args.output_root,
            )
            pairs_metadata.append({
                "pair_idx": pair_idx,
                "overlap": overlap,
                "base_error": error,
                "path": f"pair_{pair_idx}"
            })
            processed += 1
    else:
        # Normal selection process
        selections = select_pairs(test_data, base_errors, args.pairs_per_overlap)
        total_pairs = sum(len(lst) for lst in selections.values())
        if args.max_pairs is not None:
            total_pairs = min(total_pairs, args.max_pairs)
        if total_pairs == 0:
            print("No pairs selected. Nothing to do.")
            return

        for overlap in ("large", "small", "none"):
            pairs = selections.get(overlap, [])
            if not pairs:
                continue
            print(f"===> Overlap '{overlap}': processing {len(pairs)} pair(s)")
            for pair_idx, error in pairs:
                if args.max_pairs is not None and processed >= args.max_pairs:
                    break
                pair_data = test_data[pair_idx]
                process_pair(
                    extractor,
                    pair_idx,
                    pair_data,
                    error,
                    args.output_root,
                )
                pairs_metadata.append({
                    "pair_idx": pair_idx,
                    "overlap": overlap,
                    "base_error": float(error),
                    "path": f"pair_{pair_idx}"
                })
                processed += 1

    extractor.remove_hooks()
    
    # Update metadata file (append if specific pairs, replace if full generation)
    metadata_path = args.output_root / "pairs_metadata.js"
    
    if args.specific_pairs and metadata_path.exists():
        # Load existing metadata and merge
        try:
            existing_content = metadata_path.read_text()
            # Extract existing pairs (simple parsing)
            import re
            existing_pairs = []
            for match in re.finditer(r'"pair_idx":\s*(\d+)', existing_content):
                existing_pairs.append(int(match.group(1)))
            
            # Remove duplicates and add new pairs
            all_pair_indices = set(existing_pairs) | set(args.specific_pairs)
            
            # Rebuild metadata from all existing pairs + new ones
            pairs_metadata = []
            for pair_idx in sorted(all_pair_indices):
                if pair_idx not in test_data:
                    continue
                pair_data = test_data[pair_idx]
                overlap = pair_data.get("overlap_amount", "unknown").lower()
                
                # Find error
                error = 0.0
                if overlap in base_errors:
                    overlap_pairs = [idx for idx, _ in select_pairs(test_data, base_errors, 1000).get(overlap, [])]
                    if pair_idx in overlap_pairs:
                        idx_in_list = overlap_pairs.index(pair_idx)
                        errors = base_errors[overlap]
                        if idx_in_list < len(errors):
                            error = float(errors[idx_in_list])
                
                pairs_metadata.append({
                    "pair_idx": pair_idx,
                    "overlap": overlap,
                    "base_error": error,
                    "path": f"pair_{pair_idx}"
                })
        except Exception as e:
            print(f"[WARN] Could not merge existing metadata: {e}, regenerating...")
    
    # Sort by overlap order (large, small, none) then by pair index
    overlap_order = {"large": 0, "small": 1, "none": 2}
    pairs_metadata.sort(key=lambda x: (overlap_order.get(x["overlap"], 99), x["pair_idx"]))
    
    js_content = (
        "const pairsMetadata = "
        + json.dumps(pairs_metadata, indent=2)
        + ";\nexport default pairsMetadata;\n"
    )
    metadata_path.write_text(js_content)
    print(f"Generated pairs metadata at {metadata_path}")
    
    print(f"Done. Generated attention data for {processed} pair(s).")


if __name__ == "__main__":
    main()

