#!/usr/bin/env python3
"""Generate VGGT histogram + KDE data and optional sampled image pairs."""

import argparse
import io
import json
import random
import shutil
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import numpy as np
from PIL import Image
from scipy import stats


def _load_overlap_errors(path: Path, overlap: str) -> np.ndarray:
    overlap = overlap.lower()
    raw = np.load(path, allow_pickle=True)
    data = raw.item() if hasattr(raw, "item") else raw

    if isinstance(data, dict):
        for key in [
            "rot_errors_by_overlap",
            "rot_errors_deg_by_overlap",
            "errors_by_overlap",
        ]:
            if key in data and isinstance(data[key], dict):
                if overlap in data[key]:
                    return np.asarray(data[key][overlap], dtype=float).ravel()

        results = data.get("results")
        if isinstance(results, dict):
            for key in [
                "rot_errors_by_overlap",
                "rot_errors_deg_by_overlap",
                "errors_by_overlap",
            ]:
                if key in results and isinstance(results[key], dict):
                    if overlap in results[key]:
                        return np.asarray(results[key][overlap], dtype=float).ravel()

    if isinstance(data, dict):
        for value in data.values():
            try:
                arr = np.asarray(value, dtype=float).ravel()
                if arr.size:
                    return arr
            except Exception:
                continue

    if isinstance(data, np.ndarray):
        return np.asarray(data, dtype=float).ravel()

    raise KeyError(f"Could not locate rotation errors in {path} for overlap '{overlap}'")


def _histogram(values: np.ndarray, bins: Iterable[float]) -> Tuple[np.ndarray, np.ndarray]:
    clipped = np.clip(values, bins[0], bins[-1])
    counts, edges = np.histogram(clipped, bins=bins)
    total = counts.sum()
    if total > 0:
        counts = counts.astype(float) / float(total)
    return counts, edges


def _summaries(values: np.ndarray) -> Dict[str, float]:
    if values.size == 0:
        return {"count": 0, "mean": None, "median": None}
    return {
        "count": int(values.size),
        "mean": float(np.mean(values)),
        "median": float(np.median(values)),
    }


def _compute_kde(
    values: np.ndarray,
    x_grid: np.ndarray,
    bin_width: float,
    bw_factor: float,
) -> np.ndarray:
    kde = stats.gaussian_kde(values, bw_method=lambda s: s.scotts_factor() * bw_factor)
    density = kde(x_grid) * bin_width
    return density


def _load_overlap_pairs(test_data_path: Path, overlap: str) -> List[Tuple[str, dict]]:
    raw = np.load(test_data_path, allow_pickle=True)
    test_data = raw.item() if hasattr(raw, "item") else raw

    pairs: List[Tuple[str, dict]] = []
    for pair_idx, pair_data in test_data.items():
        ov = str(pair_data.get("overlap_amount", "")).lower()
        if ov == overlap.lower():
            pairs.append((str(pair_idx), pair_data))
    return pairs


def _match_pairs_with_errors(
    pairs: List[Tuple[str, dict]],
    base_errors: np.ndarray,
    ft_errors: np.ndarray,
) -> List[Dict]:
    if len(base_errors) < len(pairs) or len(ft_errors) < len(pairs):
        raise ValueError("Error arrays shorter than pair list; cannot align results.")

    matched = []
    for idx, (pair_idx, pair_data) in enumerate(pairs):
        matched.append(
            {
                "pair_idx": pair_idx,
                "pair_data": pair_data,
                "base_error": float(base_errors[idx]),
                "finetuned_error": float(ft_errors[idx]),
            }
        )
    return matched


def _compute_bin_index(value: float, bins: np.ndarray) -> int:
    idx = np.searchsorted(bins, value, side="right") - 1
    return int(np.clip(idx, 0, len(bins) - 2))


def _save_image_under_limit(src: Path, dest: Path, max_kb: int) -> bool:
    try:
        img = Image.open(src).convert("RGB")
    except Exception as err:
        print(f"⚠️  Could not open image {src}: {err}")
        return False

    max_bytes = max_kb * 1024
    scale = 1.0
    quality = 92

    for _ in range(30):
        buffer = io.BytesIO()
        resized = img.resize(
            (max(1, int(img.width * scale)), max(1, int(img.height * scale))),
            Image.Resampling.LANCZOS,
        )
        resized.save(buffer, format="JPEG", quality=quality, optimize=True)
        if buffer.tell() <= max_bytes or (quality <= 45 and scale <= 0.5):
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(buffer.getvalue())
            return True

        if quality > 45:
            quality -= 7
        else:
            scale *= 0.9

    print(f"⚠️  Could not shrink {src} below {max_kb}KB")
    return False


def sample_pairs_and_export_images(
    matched_pairs: List[Dict],
    bin_edges: np.ndarray,
    image_output_dir: Path,
    num_pairs: int,
    max_kb: int,
    seed: int,
    max_deg: float = 160.0,
) -> List[Dict]:
    if num_pairs <= 0:
        return []

    if image_output_dir.exists():
        shutil.rmtree(image_output_dir)
    image_output_dir.mkdir(parents=True, exist_ok=True)

    # Filter out pairs with rotation errors above max_deg (both pre-trained and fine-tuned)
    filtered_pairs = [
        entry for entry in matched_pairs
        if entry["base_error"] <= max_deg and entry["finetuned_error"] <= max_deg
    ]

    # Cap num_pairs at max possible (max_deg / 2)
    max_possible_pairs = int(max_deg / 2)
    num_pairs = min(num_pairs, max_possible_pairs)

    rng = random.Random(seed)
    min_spacing = 2.0

    # Shuffle for randomness, then select pairs with spacing constraint
    shuffled = filtered_pairs.copy()
    rng.shuffle(shuffled)

    exported: List[Dict] = []
    selected_errors = []  # Track error values of selected pairs

    for entry in shuffled:
        if len(exported) >= num_pairs:
            break

        ft_error = entry["finetuned_error"]
        
        # Check if this pair is at least min_spacing away from all selected pairs
        too_close = False
        for selected_error in selected_errors:
            if abs(ft_error - selected_error) < min_spacing:
                too_close = True
                break

        if too_close:
            continue

        pair_idx = entry["pair_idx"]
        pair_data = entry["pair_data"]
        img1_src = Path(pair_data["img1"]["path"])
        img2_src = Path(pair_data["img2"]["path"])

        img1_dest = image_output_dir / f"pair_{pair_idx}_img1.jpg"
        img2_dest = image_output_dir / f"pair_{pair_idx}_img2.jpg"

        ok1 = _save_image_under_limit(img1_src, img1_dest, max_kb)
        ok2 = _save_image_under_limit(img2_src, img2_dest, max_kb)
        if not (ok1 and ok2):
            continue

        # Extract scene name from image path
        img1_path_str = str(img1_src)
        scene_name = "Unknown"
        if "dense_dgpp" in img1_path_str:
            parts = img1_path_str.split("/")
            try:
                dense_idx = parts.index("dense_dgpp")
                if dense_idx + 1 < len(parts):
                    scene_name = parts[dense_idx + 1].replace("_", " ")
            except ValueError:
                pass

        exported.append(
            {
                "pairIdx": pair_idx,
                "binIndex": _compute_bin_index(entry["finetuned_error"], bin_edges),
                "baseError": entry["base_error"],
                "finetunedError": entry["finetuned_error"],
                "sceneName": scene_name,
                "image1": f"./static/images/histogram_images/{img1_dest.name}",
                "image2": f"./static/images/histogram_images/{img2_dest.name}",
            }
        )
        selected_errors.append(ft_error)

    if len(exported) < num_pairs:
        filtered_count = len(matched_pairs) - len(filtered_pairs)
        reason = "image issues"
        if filtered_count > 0:
            reason += f" and {filtered_count} pairs filtered (pre-trained or fine-tuned error > {max_deg}°)"
        print(
            f"⚠️  Requested {num_pairs} pairs but only exported {len(exported)} due to {reason}."
        )
    else:
        filtered_count = len(matched_pairs) - len(filtered_pairs)
        if filtered_count > 0:
            print(f"✅ Exported {len(exported)} pairs to {image_output_dir} (filtered {filtered_count} pairs with pre-trained or fine-tuned error > {max_deg}°)")
        else:
            print(f"✅ Exported {len(exported)} pairs to {image_output_dir}")
    return exported


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate histogram JS data for VGGT results.")
    parser.add_argument(
        "--base",
        type=Path,
        default="/home/yz864/vggt/pairwise_test_sets/welp_t/vggt/base/welp_test_results_20251115_162954.npy",
        help="Path to the base model results .npy",
    )
    parser.add_argument(
        "--finetune",
        type=Path,
        default="/home/yz864/vggt/pairwise_test_sets/welp_t/vggt/finetune/welp_test_results_20251115_163027.npy",
        help="Path to the finetuned model results .npy",
    )
    parser.add_argument(
        "--test_data",
        type=Path,
        default="/home/yz864/vggt/pairwise_test_sets/welp_t/welp_t_final.npy",
        help="Test data .npy used to locate image paths",
    )
    parser.add_argument(
        "--dataset_key",
        default="vggt_unscenepairs_t",
        help="Key used inside window.HISTOGRAM_DATA",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default="/home/yz864/Ext-3DFMs.github.io/static/histogram/vggt_unscenepairs_t.js",
        help="Destination JS file",
    )
    parser.add_argument(
        "--images_dir",
        type=Path,
        default="/home/yz864/Ext-3DFMs.github.io/static/images/histogram_images",
        help="Directory to export sampled pair images",
    )
    parser.add_argument(
        "--num_pairs",
        type=int,
        default=0,
        help="Number of example pairs to export (0 disables sampling)",
    )
    parser.add_argument(
        "--pairs_seed",
        type=int,
        default=4210,
        help="Random seed for pair sampling",
    )
    parser.add_argument(
        "--max_image_kb",
        type=int,
        default=100,
        help="Maximum size per exported image (KB)",
    )
    parser.add_argument(
        "--bins",
        type=int,
        default=40,
        help="Number of histogram bins (default: 40)",
    )
    parser.add_argument(
        "--max_deg",
        type=float,
        default=160.0,
        help="Upper bound for rotation errors in degrees (default: 160)",
    )
    parser.add_argument(
        "--overlap",
        default="none",
        help="Overlap category to extract (default: none)",
    )
    parser.add_argument(
        "--kde_points",
        type=int,
        default=400,
        help="Number of KDE samples across the x-axis",
    )
    parser.add_argument(
        "--bw_factor",
        type=float,
        default=0.5,
        help="Bandwidth factor multiplier (Scott's rule * factor)",
    )
    parser.add_argument(
        "--kde_gain",
        type=float,
        default=1.2,
        help="Additional gain applied to KDE curves after peak matching",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    base_errors = _load_overlap_errors(args.base, args.overlap)
    ft_errors = _load_overlap_errors(args.finetune, args.overlap)

    bin_edges = np.linspace(0.0, args.max_deg, args.bins + 1)
    base_counts, _ = _histogram(base_errors, bin_edges)
    ft_counts, _ = _histogram(ft_errors, bin_edges)
    bin_width = float(bin_edges[1] - bin_edges[0])

    x_grid = np.linspace(0.0, args.max_deg, args.kde_points)
    base_kde = _compute_kde(base_errors, x_grid, bin_width, args.bw_factor)
    ft_kde = _compute_kde(ft_errors, x_grid, bin_width, args.bw_factor)

    max_hist_base = float(np.max(base_counts)) if base_counts.size else 1.0
    max_hist_ft = float(np.max(ft_counts)) if ft_counts.size else 1.0
    max_kde_base = float(np.max(base_kde)) if base_kde.size else 1.0
    max_kde_ft = float(np.max(ft_kde)) if ft_kde.size else 1.0
    if max_kde_base > 1e-9:
        base_kde *= max_hist_base / max_kde_base
    if max_kde_ft > 1e-9:
        ft_kde *= max_hist_ft / max_kde_ft
    if args.kde_gain != 1.0:
        base_kde *= args.kde_gain
        ft_kde *= args.kde_gain

    payload = {
        "dataset": args.dataset_key,
        "overlap": args.overlap,
        "bins": bin_edges.tolist(),
        "baseHistFractions": base_counts.tolist(),
        "finetunedHistFractions": ft_counts.tolist(),
        "kdeX": x_grid.tolist(),
        "baseKdeFractions": base_kde.tolist(),
        "finetunedKdeFractions": ft_kde.tolist(),
        "baseSummary": _summaries(base_errors),
        "finetunedSummary": _summaries(ft_errors),
        "source": {
            "base": str(args.base),
            "finetuned": str(args.finetune),
        },
    }

    # Clean image directory when regenerating
    if args.images_dir.exists():
        shutil.rmtree(args.images_dir)
        print(f"🗑️  Cleaned existing image directory: {args.images_dir}")

    if args.num_pairs > 0:
        overlap_pairs = _load_overlap_pairs(args.test_data, args.overlap)
        matched_pairs = _match_pairs_with_errors(overlap_pairs, base_errors, ft_errors)
        exported_pairs = sample_pairs_and_export_images(
            matched_pairs,
            bin_edges,
            args.images_dir,
            args.num_pairs,
            args.max_image_kb,
            args.pairs_seed,
            args.max_deg,
        )
        payload["pairs"] = exported_pairs

    args.output.parent.mkdir(parents=True, exist_ok=True)
    js_blob = (
        "window.HISTOGRAM_DATA = window.HISTOGRAM_DATA || {};\n"
        f'window.HISTOGRAM_DATA["{args.dataset_key}"] = {json.dumps(payload, indent=2)};\n'
    )
    args.output.write_text(js_blob)
    print(f"✅ Wrote histogram data to {args.output}")


if __name__ == "__main__":
    main()