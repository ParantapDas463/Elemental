import json
import sys
from pathlib import Path

from parsers.ipindia_parser import IPIndiaParser


RAW_BASE_DIR = Path("data/raw/patents")
OUTPUT_DIR = Path("data/processed")


def main():
    # ---------------------------------------------------------
    # Dataset selection
    # ---------------------------------------------------------

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python process_raw.py <dataset>")
        print()
        print("Examples:")
        print("  python process_raw.py cobalt")
        print("  python process_raw.py lithium")
        return

    dataset_name = sys.argv[1].strip().lower()

    # ---------------------------------------------------------
    # Paths
    # ---------------------------------------------------------

    dataset_dir = RAW_BASE_DIR / dataset_name
    output_file = OUTPUT_DIR / f"{dataset_name}_patents.json"

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if not dataset_dir.exists():
        print(f"No raw patent directory found for: {dataset_name}")
        print(f"Expected: {dataset_dir}")
        return

    html_files = sorted(dataset_dir.glob("*.html"))

    if not html_files:
        print(f"No raw patent HTML files found in: {dataset_dir}")
        return

    # ---------------------------------------------------------
    # Processing
    # ---------------------------------------------------------

    print("=" * 70)
    print("IP INDIA RAW → JSON PROCESSOR")
    print("=" * 70)
    print(f"Dataset         : {dataset_name}")
    print(f"Raw files found : {len(html_files)}")
    print()

    patents = []
    failures = []

    for index, html_file in enumerate(html_files, start=1):

        print(
            f"[{index}/{len(html_files)}] "
            f"Parsing {html_file.name}"
        )

        try:
            html = html_file.read_text(
                encoding="utf-8",
                errors="replace"
            )

            parser = IPIndiaParser(html)
            patent = parser.get_patent()

            # Keep track of where this record came from.
            patent["source"] = "IP India"
            patent["raw_file"] = str(
                html_file.relative_to(RAW_BASE_DIR)
            )

            patents.append(patent)

        except Exception as e:
            print(f"  ERROR: {e}")

            failures.append({
                "file": str(
                    html_file.relative_to(RAW_BASE_DIR)
                ),
                "error": str(e)
            })

    # ---------------------------------------------------------
    # Basic duplicate check
    # ---------------------------------------------------------

    seen = set()
    unique_patents = []

    for patent in patents:

        application_number = patent.get("application_number")

        if application_number:
            if application_number in seen:
                continue

            seen.add(application_number)

        unique_patents.append(patent)

    # ---------------------------------------------------------
    # Save JSON
    # ---------------------------------------------------------

    output = {
        "source": "IP India",
        "dataset": dataset_name,
        "record_count": len(unique_patents),
        "failed_count": len(failures),
        "patents": unique_patents,
        "failures": failures
    }

    output_file.write_text(
        json.dumps(
            output,
            indent=2,
            ensure_ascii=False
        ),
        encoding="utf-8"
    )

    # ---------------------------------------------------------
    # Summary
    # ---------------------------------------------------------

    print()
    print("=" * 70)
    print("PROCESSING COMPLETE")
    print("=" * 70)

    print(f"Dataset        : {dataset_name}")
    print(f"Raw HTML files : {len(html_files)}")
    print(f"Parsed patents : {len(patents)}")
    print(f"Unique patents : {len(unique_patents)}")
    print(f"Failures       : {len(failures)}")
    print()
    print(f"Output         : {output_file}")
    print("=" * 70)


if __name__ == "__main__":
    main()
