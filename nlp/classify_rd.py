import os
import re
import json
import pandas as pd


# ============================================================
# CONFIG
# ============================================================

INPUT_FILE = "data/raw/satyabhama/master_projects.csv"

OUTPUT_DIR = "data/processed/satyabhama_nlp_v10"

PROJECT_OUTPUT = os.path.join(
    OUTPUT_DIR,
    "satyabhama_projects_classified.csv"
)

INVESTIGATOR_OUTPUT = os.path.join(
    OUTPUT_DIR,
    "satyabhama_project_investigators.csv"
)

ALL_ROWS_OUTPUT = os.path.join(
    OUTPUT_DIR,
    "satyabhama_all_rows_classified.csv"
)

SUMMARY_OUTPUT = os.path.join(
    OUTPUT_DIR,
    "classification_summary.json"
)


# ============================================================
# MINERAL ONTOLOGY
#
# IMPORTANT:
# Do NOT put short chemical symbols such as:
#   in, si, ge, sn, ni, co, cu
# here.
#
# They are handled separately by the explicit chemical-list
# detector below.
# ============================================================

MINERAL_KEYWORDS = {

    "Lithium": [
        "lithium",
        "li-ion",
        "li ion",
        "lithium-ion",
        "lithium ion",
        "lifepo4",
    ],

    "Cobalt": [
        "cobalt",
        "lco",
    ],

    "Nickel": [
        "nickel",
        "nmc",
        "nca",
    ],

    "Copper": [
        "copper",
    ],

    "Graphite": [
        "graphite",
    ],

    "Rare Earth Elements": [
        "rare earth",
        "rare-earth",
        "rare earth elements",
        "rare-earth elements",
        "ree",
        "neodymium",
        "praseodymium",
        "dysprosium",
        "terbium",
        "yttrium",
        "erbium",
        "ytterbium",
        "lutetium",
        "samarium",
        "europium",
        "gadolinium",
        "holmium",
        "thulium",
        "cerium",
        "lanthanum",
        "ndfeb",
    ],

    "Vanadium": [
        "vanadium",
    ],

    "Tungsten": [
        "tungsten",
        "wolfram",
    ],

    "Titanium": [
        "titanium",
    ],

    "Zirconium": [
        "zirconium",
    ],

    "Niobium": [
        "niobium",
    ],

    "Tantalum": [
        "tantalum",
    ],

    "Gallium": [
        "gallium",
    ],

    "Germanium": [
        "germanium",
    ],

    "Indium": [
        "indium",
    ],

    "Molybdenum": [
        "molybdenum",
    ],

    "Rhenium": [
        "rhenium",
    ],

    "Beryllium": [
        "beryllium",
    ],

    "Bismuth": [
        "bismuth",
    ],

    "Antimony": [
        "antimony",
    ],

    "Selenium": [
        "selenium",
    ],

    "Cadmium": [
        "cadmium",
    ],

    "Silicon": [
        "silicon",
    ],

    "Phosphorus": [
        "phosphorus",
        "phosphorous",
    ],

    "Tin": [
        "tin",
    ],

    "Hafnium": [
        "hafnium",
    ],

    "Platinum Group Metals": [
        "platinum group",
        "platinum group metals",
        "pgm",
        "platinum",
        "palladium",
        "rhodium",
        "iridium",
        "osmium",
        "ruthenium",
    ],

    "Zinc": [
        "zinc",
    ],

    "Manganese": [
        "manganese",
    ],
}


# ============================================================
# CHEMICAL SYMBOL ONTOLOGY
#
# These are ONLY used when symbols occur in an explicit
# chemical-style list.
#
# Example:
#   (In, Sn, Ge, Si, Ag)
#
# NOT:
#   "in mining"
#   "in recovery"
#   "silicon"
# ============================================================

CHEMICAL_ABBREVIATIONS = {

    "Li": "Lithium",
    "Ni": "Nickel",
    "Co": "Cobalt",
    "Cu": "Copper",
    "V": "Vanadium",
    "Ti": "Titanium",

    "In": "Indium",
    "Sn": "Tin",
    "Ge": "Germanium",
    "Si": "Silicon",

    "Zn": "Zinc",
    "Mn": "Manganese",
    "Nb": "Niobium",
    "Ta": "Tantalum",
    "Ga": "Gallium",
    "Mo": "Molybdenum",
    "Re": "Rhenium",
    "Cd": "Cadmium",
    "Sb": "Antimony",
    "Se": "Selenium",
    "Hf": "Hafnium",

    "Zr": "Zirconium",
    "Be": "Beryllium",
    "Bi": "Bismuth",
}


# ============================================================
# EXPLICIT CHEMICAL SYMBOL DETECTOR
# ============================================================

def detect_chemical_abbreviations(text):

    if not text:
        return set()

    text = str(text)

    found = set()

    # --------------------------------------------------------
    # Helper
    # --------------------------------------------------------

    def process_symbol_list(section):

        recognized = []

        # IMPORTANT:
        # Chemical symbols MUST have proper capitalization.
        #
        # Valid:
        #   In
        #   Sn
        #   Ge
        #   Si
        #
        # Invalid:
        #   in
        #   sn
        #   ge
        #   si
        #
        # This is what prevents ordinary English words
        # from becoming mineral detections.
        tokens = re.findall(
            r"(?<![A-Za-z])([A-Z][a-z]?)(?![A-Za-z])",
            section
        )

        for token in tokens:

            if token in CHEMICAL_ABBREVIATIONS:
                recognized.append(token)

        # Need at least TWO recognized chemical symbols.
        #
        # This prevents isolated:
        #   In
        #
        # from being interpreted as Indium.
        if len(set(recognized)) < 2:
            return

        for symbol in set(recognized):

            found.add(
                CHEMICAL_ABBREVIATIONS[symbol]
            )

    # --------------------------------------------------------
    # 1. Parenthesized lists
    # --------------------------------------------------------

    parenthesized_sections = re.findall(
        r"\(([^()]*)\)",
        text
    )

    for section in parenthesized_sections:

        # Require list-like punctuation.
        #
        # Examples:
        #   In, Sn, Ge, Si
        #   Li/Ni/Co
        #
        # We don't want arbitrary parenthetical prose.
        if "," in section or "/" in section:

            process_symbol_list(section)

    # --------------------------------------------------------
    # 2. Slash-separated lists outside parentheses
    # --------------------------------------------------------

    slash_sections = re.findall(
        r"(?<![A-Za-z])"
        r"([A-Z][a-z]?(?:\s*/\s*[A-Z][a-z]?)+)"
        r"(?![A-Za-z])",
        text
    )

    for section in slash_sections:

        process_symbol_list(section)

    # --------------------------------------------------------
    # 3. Comma-separated chemical lists outside parentheses
    #
    # Example:
    #   In, Sn, Ge, Si recovery
    #
    # Must contain at least two valid symbols.
    # --------------------------------------------------------

    comma_sections = re.findall(
        r"(?<![A-Za-z])"
        r"([A-Z][a-z]?(?:\s*,\s*[A-Z][a-z]?)+)"
        r"(?![A-Za-z])",
        text
    )

    for section in comma_sections:

        process_symbol_list(section)

    return found


# ============================================================
# NORMALIZATION
# ============================================================

ABBREVIATION_EXPANSIONS = {
    "Li": "Lithium",
    "Ni": "Nickel",
    "Co": "Cobalt",
    "Cu": "Copper",
    "V": "Vanadium",
    "Ti": "Titanium",
}


def normalize_title(text):

    if text is None:
        return ""

    text = str(text)

    normalized = text

    for short, full in ABBREVIATION_EXPANSIONS.items():

        normalized = re.sub(
            rf"(?<![A-Za-z0-9]){re.escape(short)}(?![A-Za-z0-9])",
            full,
            normalized,
            flags=re.IGNORECASE
        )

    return normalized.lower()


# ============================================================
# SAFE TERM MATCHING
# ============================================================

def contains_term(text, term):

    if text is None:
        return False

    text = str(text).lower()
    term = str(term).lower().strip()

    if not term:
        return False

    escaped = re.escape(term)

    return bool(
        re.search(
            rf"(?<![a-z0-9]){escaped}(?![a-z0-9])",
            text,
            flags=re.IGNORECASE
        )
    )


# ============================================================
# TECHNOLOGY PATTERNS
# ============================================================

TECHNOLOGY_PATTERNS = {

    "Hydrometallurgy": [
        "hydrometallurgy",
        "hydrometallurgical",
    ],

    "Acid Leaching": [
        "acid leaching",
        "acid leach",
    ],

    "Alkaline Leaching": [
        "alkaline leaching",
        "alkaline leach",
    ],

    "Bioleaching": [
        "bioleaching",
        "bio-leaching",
    ],

    "Solvent Extraction": [
        "solvent extraction",
    ],

    "Ion Exchange": [
        "ion exchange",
    ],

    "Adsorption": [
        "adsorption",
        "adsorbent",
    ],

    "Membrane Separation": [
        "membrane separation",
        "membrane technology",
    ],

    "Electrodialysis": [
        "electrodialysis",
    ],

    "Nanofiltration": [
        "nanofiltration",
    ],

    "Ultrafiltration": [
        "ultrafiltration",
    ],

    "Reverse Osmosis": [
        "reverse osmosis",
    ],

    "Chelation": [
        "chelation",
        "chelating",
    ],

    "Complexation": [
        "complexation",
        "complexing",
    ],

    "Precipitation": [
        "precipitation",
    ],

    "Crystallization": [
        "crystallization",
        "crystallisation",
    ],

    "Cementation": [
        "cementation",
    ],

    "Pyrometallurgy": [
        "pyrometallurgy",
        "pyrometallurgical",
    ],

    "Roasting": [
        "roasting",
    ],

    "Calcination": [
        "calcination",
        "calcining",
    ],

    "Thermal Processing": [
        "thermal processing",
        "thermal treatment",
    ],

    "Thermal Reduction": [
        "thermal reduction",
    ],

    "Smelting": [
        "smelting",
    ],

    "Sintering": [
        "sintering",
    ],

    "Microwave Processing": [
        "microwave processing",
        "microwave assisted",
    ],

    "Plasma Processing": [
        "plasma processing",
    ],

    "Molten Salt Processing": [
        "molten salt",
    ],

    "Mineral/Ore Processing": [
        "mineral processing",
        "ore processing",
    ],

    "Beneficiation": [
        "beneficiation",
        "beneficiate",
    ],

    "Flotation": [
        "flotation",
        "froth flotation",
    ],

    "Magnetic Separation": [
        "magnetic separation",
    ],

    "High-Gradient Magnetic Separation": [
        "high gradient magnetic separation",
    ],

    "Eddy Current Separation": [
        "eddy current separation",
    ],

    "Gravity Separation": [
        "gravity separation",
    ],

    "Dense-Media Separation": [
        "dense media separation",
        "dense-medium separation",
        "heavy media separation",
        "heavy-media separation",
    ],

    "Electrostatic Separation": [
        "electrostatic separation",
        "tribo-electrostatic",
        "triboelectrostatic",
    ],

    "Centrifugal Separation": [
        "centrifugal separation",
    ],

    "Sensor-Based Separation": [
        "sensor-based separation",
        "sensor based separation",
        "hyperspectral sorting",
        "hyperspectral imaging",
        "laser induced breakdown spectroscopy",
        "libs sorting",
    ],

    "Electrochemical Processing": [
        "electrochemical processing",
    ],

    "Electrowinning": [
        "electrowinning",
    ],

    "Electrodeposition": [
        "electrodeposition",
    ],

    "Electrorefining": [
        "electrorefining",
    ],

    "Battery Recycling": [
        "battery recycling",
        "spent battery recycling",
    ],

    "Battery Material Recovery": [
        "battery material recovery",
    ],

    "Black Mass Processing": [
        "black mass processing",
        "black mass recovery",
    ],

    "E-Waste Processing": [
        "e-waste processing",
        "e-waste recycling",
        "e waste processing",
        "e waste recycling",
        "electronic waste processing",
        "electronic waste recycling",
    ],

    "Scrap Recycling": [
        "scrap recycling",
        "metal scrap recycling",
    ],

    "Waste-to-Resource Recovery": [
        "waste-to-resource",
        "waste to resource",
    ],

    "Waste Processing": [
        "waste processing",
        "waste treatment",
    ],

    "Selective Separation": [
        "selective separation",
        "selective recovery",
    ],

    "Liquid-Liquid Extraction": [
        "liquid-liquid extraction",
        "liquid liquid extraction",
    ],

    "Metallurgical Processing": [
        "metallurgical processing",
        "metallurgical treatment",
    ],

    "Chemical Reduction": [
        "chemical reduction",
    ],

    "Carbothermal Reduction": [
        "carbothermal reduction",
    ],

    "Oxidation": [
        "oxidation",
        "oxidative",
    ],

    "Chlorination": [
        "chlorination",
    ],

    "Sulfation": [
        "sulfation",
        "sulphation",
    ],

    "Material/Nanomaterial Synthesis": [
        "nanomaterial synthesis",
        "material synthesis",
        "nanoparticle synthesis",
    ],

    "Alloy/Composite/Ceramic Processing": [
        "alloy processing",
        "composite processing",
        "ceramic processing",
    ],

    "Powder Metallurgy": [
        "powder metallurgy",
    ],

    "Additive Manufacturing": [
        "additive manufacturing",
        "3d printing",
        "3-d printing",
    ],

    "Surface Modification": [
        "surface modification",
    ],

    "Coating": [
        "coating",
        "coatings",
    ],

    "Carbonization": [
        "carbonization",
        "carbonisation",
    ],
}


# ============================================================
# PROCESS PATTERNS
# ============================================================

PROCESS_PATTERNS = {

    "Extraction": [
        "extraction",
        "extract",
        "extracting",
    ],

    "Recovery": [
        "recovery",
        "recover",
        "recovering",
    ],

    "Separation": [
        "separation",
        "separating",
        "sorting",
    ],

    "Refining": [
        "refining",
        "refine",
    ],

    "Purification": [
        "purification",
        "purify",
    ],

    "Leaching": [
        "leaching",
        "leach",
    ],

    "Recycling": [
        "recycling",
        "recycle",
        "recycled",
    ],

    "Beneficiation": [
        "beneficiation",
        "beneficiate",
    ],

    "Smelting": [
        "smelting",
        "smelt",
    ],

    "Roasting": [
        "roasting",
    ],

    "Calcination": [
        "calcination",
        "calcining",
    ],

    "Sintering": [
        "sintering",
    ],

    "Reduction": [
        "reduction",
        "reducing",
    ],

    "Treatment": [
        "treatment",
        "treating",
    ],

    "Concentration": [
        "concentration",
        "concentrating",
    ],

    "Precipitation": [
        "precipitation",
        "precipitate",
    ],

    "Electrochemical Recovery": [
        "electrochemical recovery",
    ],
}


# ============================================================
# APPLICATION PATTERNS
# ============================================================

APPLICATION_PATTERNS = {

    "Battery": [
        "battery",
        "batteries",
        "lithium-ion battery",
        "li-ion battery",
        "energy storage",
    ],

    "Catalyst": [
        "catalyst",
        "catalysts",
        "catalytic",
    ],

    "Medical/Pharmaceutical": [
        "medical",
        "pharmaceutical",
        "medicine",
        "drug",
        "clinical",
    ],

    "Solar/Semiconductor": [
        "solar cell",
        "solar panel",
        "photovoltaic",
        "semiconductor",
        "semiconductors",
    ],

    "Sensor": [
        "sensor",
        "sensors",
        "sensing",
    ],

    "Alloy/Advanced Materials": [
        "alloy",
        "alloys",
        "advanced material",
        "advanced materials",
        "composite",
        "ceramic",
    ],
}


# ============================================================
# MATERIAL PATTERNS
# ============================================================

MATERIAL_PATTERNS = [
    "ore",
    "ores",
    "mineral",
    "minerals",
    "concentrate",
    "concentrates",
    "tailings",
    "slag",
    "brine",
    "residue",
    "residues",
    "scrap",
    "waste",
    "e-waste",
    "e waste",
    "spent battery",
    "spent batteries",
    "black mass",
    "metal-bearing",
    "metal bearing",
    "metal-containing",
    "metal containing",
    "leachate",
    "bleach liquor",
    "process liquor",
    "solution",
    "solutions",
    "precipitate",
    "precipitates",
    "oxide",
    "oxides",
    "hydroxide",
    "hydroxides",
    "sulfate",
    "sulfates",
    "sulphate",
    "sulphates",
    "chloride",
    "chlorides",
    "carbonate",
    "carbonates",
    "silicate",
    "silicates",
]


# ============================================================
# STRONG CONTEXT
# ============================================================

STRONG_CONTEXT_PATTERNS = [
    "mineral processing",
    "ore processing",
    "mineral extraction",
    "ore extraction",
    "mineral recovery",
    "ore recovery",
    "mineral refining",
    "ore refining",
    "mineral purification",
    "metallurgical processing",
    "metallurgical treatment",
    "hydrometallurgy",
    "pyrometallurgy",
    "beneficiation",
    "recovery from waste",
    "recovery from scrap",
    "recovery from residue",
    "recovery from spent",
    "secondary resource",
    "critical mineral",
    "critical minerals",
]


# ============================================================
# STRONG PROCESSES
# ============================================================

STRONG_PROCESS_PATTERNS = [
    "extraction",
    "recovery",
    "recycling",
    "separation",
    "beneficiation",
    "leaching",
    "refining",
    "purification",
]


# ============================================================
# BIOMEDICAL NEGATIVE TERMS
# ============================================================

BIOMEDICAL_PATTERNS = [
    "blood",
    "bodily fluid",
    "urine",
    "saliva",
    "serum",
    "plasma",
    "tissue",
    "cancer",
    "tumour",
    "tumor",
    "drug",
    "pharmaceutical",
    "medicine",
    "protein",
    "dna",
    "rna",
    "pathogen",
    "clinical",
]


# ============================================================
# CLASSIFICATION HELPERS
# ============================================================

def classify_minerals(original_text):

    found = set()

    # --------------------------------------------------------
    # 1. Full mineral names
    # --------------------------------------------------------

    normalized = normalize_title(original_text)

    for mineral, keywords in MINERAL_KEYWORDS.items():

        for keyword in keywords:

            if contains_term(normalized, keyword):

                found.add(mineral)
                break

    # --------------------------------------------------------
    # 2. Explicit chemical-symbol lists
    # --------------------------------------------------------

    abbreviation_matches = detect_chemical_abbreviations(
        original_text
    )

    found.update(abbreviation_matches)

    return sorted(found)


def classify_pattern_group(text, patterns):

    found = set()

    for label, keywords in patterns.items():

        for keyword in keywords:

            if contains_term(text, keyword):

                found.add(label)
                break

    return sorted(found)


def contains_any(text, patterns):

    for pattern in patterns:

        if contains_term(text, pattern):
            return True

    return False


# ============================================================
# CLASSIFY ONE PROJECT
# ============================================================

def classify_project(title):

    original_title = (
        ""
        if pd.isna(title)
        else str(title)
    )

    text = normalize_title(
        original_title
    )

    minerals = classify_minerals(
        original_title
    )

    technologies = classify_pattern_group(
        text,
        TECHNOLOGY_PATTERNS
    )

    processes = classify_pattern_group(
        text,
        PROCESS_PATTERNS
    )

    applications = classify_pattern_group(
        text,
        APPLICATION_PATTERNS
    )

    material_hits = [
        pattern
        for pattern in MATERIAL_PATTERNS
        if contains_term(text, pattern)
    ]

    strong_context = contains_any(
        text,
        STRONG_CONTEXT_PATTERNS
    )

    strong_process = contains_any(
        text,
        STRONG_PROCESS_PATTERNS
    )

    biomedical = contains_any(
        text,
        BIOMEDICAL_PATTERNS
    )

    # --------------------------------------------------------
    # SCORE
    # --------------------------------------------------------

    score = 0

    if minerals:
        score += 3

    if strong_context:
        score += 3

    if technologies:
        score += 2

    if processes:
        score += 2

    if material_hits:
        score += 1

    if applications:
        score += 1

    if strong_process:
        score += 1

    if biomedical:
        score -= 4

    # --------------------------------------------------------
    # RELEVANCE
    # --------------------------------------------------------

    if score >= 6:

        relevance = "Relevant"

    elif score >= 3:

        relevance = "Potentially Relevant"

    else:

        relevance = "Not Relevant"

    return {
        "Relevance": relevance,
        "Relevance Score": score,
        "Minerals": "; ".join(minerals),
        "Technologies": "; ".join(technologies),
        "Processes": "; ".join(processes),
        "Applications": "; ".join(applications),
    }


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("CMIH PS02 - SATYABHAMA R&D CLASSIFIER V10")
    print("=" * 70)

    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True
    )

    print()
    print(f"[+] Loading: {INPUT_FILE}")

    df = pd.read_csv(
        INPUT_FILE,
        dtype=str
    )

    print(
        f"[+] Rows loaded: {len(df):,}"
    )

    print(
        f"[+] Columns: {len(df.columns)}"
    )

    title_column = "Title of The Projects"

    if title_column not in df.columns:

        raise ValueError(
            f"Missing column: {title_column}"
        )

    # --------------------------------------------------------
    # CLASSIFY
    # --------------------------------------------------------

    print()
    print("[+] Classifying rows...")

    classifications = []

    for title in df[title_column]:

        classifications.append(
            classify_project(title)
        )

    classified_df = pd.DataFrame(
        classifications
    )

    df_all = pd.concat(
        [
            df,
            classified_df
        ],
        axis=1
    )

    # --------------------------------------------------------
    # PROJECT LEVEL
    # --------------------------------------------------------

    print()
    print("[+] Building project-level dataset...")

    project_key = "Project Number"

    if project_key not in df_all.columns:

        raise ValueError(
            f"Missing column: {project_key}"
        )

    project_df = (
        df_all
        .drop_duplicates(
            subset=[project_key],
            keep="first"
        )
        .copy()
    )

    # --------------------------------------------------------
    # INVESTIGATOR RELATION
    # --------------------------------------------------------

    print()
    print("[+] Building investigator relation...")

    investigator_columns = [
        "Project Number",
        "PI Name",
        "PI Institute",
        "Department",
        "Designation",
        "Organisation Type",
    ]

    available_investigator_columns = [
        col
        for col in investigator_columns
        if col in df_all.columns
    ]

    investigators_df = (
        df_all[
            available_investigator_columns
        ]
        .drop_duplicates()
        .copy()
    )

    # --------------------------------------------------------
    # REMOVE PERSONAL PHONE DATA
    # --------------------------------------------------------

    df_all = df_all.drop(
        columns=["Mobile No"],
        errors="ignore"
    )

    project_df = project_df.drop(
        columns=["Mobile No"],
        errors="ignore"
    )

    # --------------------------------------------------------
    # CLEAN NULLS
    # --------------------------------------------------------

    df_all = df_all.fillna("")
    project_df = project_df.fillna("")
    investigators_df = investigators_df.fillna("")

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    print()
    print("[+] Saving outputs...")

    df_all.to_csv(
        ALL_ROWS_OUTPUT,
        index=False
    )

    project_df.to_csv(
        PROJECT_OUTPUT,
        index=False
    )

    investigators_df.to_csv(
        INVESTIGATOR_OUTPUT,
        index=False
    )

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    relevance_counts = (
        project_df["Relevance"]
        .value_counts()
        .to_dict()
    )

    mineral_counts = {}

    for minerals in project_df["Minerals"]:

        if not minerals:
            continue

        for mineral in minerals.split(";"):

            mineral = mineral.strip()

            if mineral:

                mineral_counts[mineral] = (
                    mineral_counts.get(mineral, 0) + 1
                )

    technology_counts = {}

    for technologies in project_df["Technologies"]:

        if not technologies:
            continue

        for technology in technologies.split(";"):

            technology = technology.strip()

            if technology:

                technology_counts[technology] = (
                    technology_counts.get(technology, 0) + 1
                )

    process_counts = {}

    for processes in project_df["Processes"]:

        if not processes:
            continue

        for process in processes.split(";"):

            process = process.strip()

            if process:

                process_counts[process] = (
                    process_counts.get(process, 0) + 1
                )

    application_counts = {}

    for applications in project_df["Applications"]:

        if not applications:
            continue

        for application in applications.split(";"):

            application = application.strip()

            if application:

                application_counts[application] = (
                    application_counts.get(application, 0) + 1
                )

    summary = {
        "rows_loaded": len(df),
        "unique_projects": len(project_df),
        "investigator_rows": len(investigators_df),

        "relevance": relevance_counts,

        "minerals": dict(
            sorted(
                mineral_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )
        ),

        "technologies": dict(
            sorted(
                technology_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )
        ),

        "processes": dict(
            sorted(
                process_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )
        ),

        "applications": dict(
            sorted(
                application_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )
        ),
    }

    with open(
        SUMMARY_OUTPUT,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            summary,
            f,
            indent=2,
            ensure_ascii=False
        )

    # --------------------------------------------------------
    # CONSOLE OUTPUT
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("CLASSIFICATION COMPLETE")
    print("=" * 70)

    print()
    print(
        f"Rows loaded:       {len(df):,}"
    )

    print(
        f"Unique projects:   {len(project_df):,}"
    )

    print(
        f"Investigator rows: {len(investigators_df):,}"
    )

    print()
    print("Relevance:")

    for label in [
        "Not Relevant",
        "Potentially Relevant",
        "Relevant",
    ]:

        print(
            f"  {label:<25}"
            f"{relevance_counts.get(label, 0):>6}"
        )

    print()
    print("Minerals:")

    for mineral, count in sorted(
        mineral_counts.items(),
        key=lambda x: x[1],
        reverse=True
    ):

        print(
            f"  {mineral:<30}"
            f"{count:>4}"
        )

    print()
    print("Technologies:")

    for technology, count in sorted(
        technology_counts.items(),
        key=lambda x: x[1],
        reverse=True
    ):

        print(
            f"  {technology:<35}"
            f"{count:>4}"
        )

    print()
    print("Processes:")

    for process, count in sorted(
        process_counts.items(),
        key=lambda x: x[1],
        reverse=True
    ):

        print(
            f"  {process:<30}"
            f"{count:>4}"
        )

    print()
    print("Applications:")

    for application, count in sorted(
        application_counts.items(),
        key=lambda x: x[1],
        reverse=True
    ):

        print(
            f"  {application:<30}"
            f"{count:>4}"
        )

    print()
    print("Outputs:")

    print(
        f"  {PROJECT_OUTPUT}"
    )

    print(
        f"  {INVESTIGATOR_OUTPUT}"
    )

    print(
        f"  {ALL_ROWS_OUTPUT}"
    )

    print(
        f"  {SUMMARY_OUTPUT}"
    )


if __name__ == "__main__":
    main()