"""
Mineral-processing patent NLP classifier (V9)

FINAL RULE-BASED VERSION

V9 keeps the broad V8 technology taxonomy while tightening:
    1. Technology evidence gates
    2. Application-vs-processing distinction
    3. Technology confidence scoring

Output:
    data/processed/nlp_v9/

V8 is not overwritten.
"""

from __future__ import annotations

import argparse
import bisect
import json
import re
from collections import Counter
from pathlib import Path


# ============================================================
# MINERALS
# ============================================================

MINERAL_KEYWORDS = {
    "Lithium": ["lithium"],
    "Cobalt": ["cobalt"],
    "Nickel": ["nickel"],
    "Copper": ["copper"],
    "Graphite": ["graphite"],

    "Rare Earth Elements": [
        "rare earth",
        "rare-earth",
        "rare earth element",
        "rare-earth element",
        "lanthanide",
        "lanthanides",
    ],

    "Vanadium": ["vanadium"],
    "Tungsten": ["tungsten", "wolfram"],
    "Titanium": ["titanium"],
    "Zirconium": ["zirconium"],
    "Niobium": ["niobium", "columbium"],
    "Tantalum": ["tantalum"],
    "Gallium": ["gallium"],
    "Germanium": ["germanium"],
    "Indium": ["indium"],
    "Molybdenum": ["molybdenum"],
    "Rhenium": ["rhenium"],
    "Beryllium": ["beryllium"],
    "Bismuth": ["bismuth"],
    "Antimony": ["antimony"],
    "Selenium": ["selenium"],
    "Cadmium": ["cadmium"],

    "Silicon": [
        "silicon",
        "silica",
        "silicon dioxide",
    ],

    "Phosphorus": [
        "phosphorus",
        "phosphate",
    ],

    "Tin": ["tin"],
    "Hafnium": ["hafnium"],
}


# ============================================================
# PROCESS PATTERNS
# ============================================================

PROCESS_PATTERNS = {

    "Extraction": [
        r"\bextraction\b",
        r"\bextract(?:ed|ing)\b",
        r"\bmineral extraction\b",
        r"\bmetal extraction\b",
    ],

    "Recovery": [
        r"\brecovery\b",
        r"\brecover(?:ed|ing)\b",
        r"\breclaim(?:ed|ing)\b",
        r"\breclamation\b",
        r"\bregeneration\b",
    ],

    "Separation": [
        r"\bseparation\b",
        r"\bseparate(?:d|s|ing)?\b",
        r"\bselective separation\b",
        r"\bphase separation\b",
        r"\bsolid[- ]liquid separation\b",
        r"\bliquid[- ]liquid separation\b",
    ],

    "Refining": [
        r"\brefining\b",
        r"\brefine(?:d|s|ing)?\b",
        r"\brefinement\b",
    ],

    "Purification": [
        r"\bpurification\b",
        r"\bpurif(?:y|ied|ying)\b",
    ],

    "Leaching": [
        r"\bleach(?:ed|ing)?\b",
        r"\bleachate\b",
        r"\bleaching\b",
    ],

    "Recycling": [
        r"\brecycling\b",
        r"\brecycled\b",
        r"\brecycle(?:d|s|ing)?\b",
    ],

    "Beneficiation": [
        r"\bbeneficiation\b",
        r"\bbeneficiat(?:e|ed|ing)\b",
        r"\bore dressing\b",
        r"\bmineral dressing\b",
    ],

    "Smelting": [
        r"\bsmelting\b",
        r"\bsmelt(?:ed|ing)?\b",
    ],

    "Roasting": [
        r"\broasting\b",
        r"\broast(?:ed|ing)?\b",
    ],

    "Calcination": [
        r"\bcalcination\b",
        r"\bcalc(?:ine|ined|ining)\b",
    ],

    "Sintering": [
        r"\bsintering\b",
        r"\bsinter(?:ed|ing)\b",
    ],

    "Carbonization": [
        r"\bcarbonization\b",
        r"\bcarbonisation\b",
        r"\bcarboniz(?:e|ed|ing)\b",
        r"\bcarbonis(?:e|ed|ing)\b",
    ],

    "Electrochemical Recovery": [
        r"\belectrowinning\b",
        r"\belectrodeposition\b",
        r"\belectrochemical recovery\b",
        r"\belectrochemical extraction\b",
        r"\belectro[- ]recovery\b",
    ],

    "Reduction": [
        r"\breduction of\b",
        r"\breduced to\b",
        r"\bchemical reduction\b",
        r"\bcarbothermal reduction\b",
    ],

    "Dissolution": [
        r"\bdissolution\b",
        r"\bdissolv(?:e|ed|ing)\b",
    ],

    "Precipitation": [
        r"\bprecipitation\b",
        r"\bprecipitat(?:e|ed|ing)\b",
    ],

    "Concentration": [
        r"\bconcentration\b",
        r"\bconcentrat(?:e|ed|ing)\b",
    ],

    "Treatment": [
        r"\btreatment\b",
        r"\btreat(?:ed|ing)\b",
    ],
}


# ============================================================
# TECHNOLOGY TAXONOMY
# ============================================================

TECHNOLOGY_PATTERNS = {

    # --------------------------------------------------------
    # Hydrometallurgy
    # --------------------------------------------------------

    "Hydrometallurgy": [
        r"\bhydrometallurg(?:y|ical)\b",
    ],

    "Acid Leaching": [
        r"\bacid leaching\b",
        r"\bacid leach\b",
        r"\bacid[- ]leach\b",
        r"\bleaching with acid\b",
    ],

    "Alkaline Leaching": [
        r"\balkaline leaching\b",
        r"\balkaline leach\b",
        r"\balkali leaching\b",
        r"\bleaching with alkali\b",
    ],

    "Bioleaching": [
        r"\bbioleaching\b",
        r"\bbio[- ]leaching\b",
        r"\bmicrobial leaching\b",
    ],

    "Solvent Extraction": [
        r"\bsolvent extraction\b",
        r"\bsolvent[- ]extraction\b",
        r"\bliquid[- ]liquid extraction\b",
    ],

    "Ion Exchange": [
        r"\bion exchange\b",
        r"\bion[- ]exchange\b",
        r"\bion exchange resin\b",
    ],

    "Adsorption": [
        r"\badsorption\b",
        r"\badsorbent\b",
        r"\badsorptive separation\b",
    ],

    "Membrane Separation": [
        r"\bmembrane separation\b",
        r"\bmembrane[- ]based separation\b",
        r"\bmembrane filtration\b",
        r"\bmembrane extraction\b",
    ],

    "Electrodialysis": [
        r"\belectrodialysis\b",
        r"\belectrodialytic\b",
    ],

    "Chelation": [
        r"\bchelation\b",
        r"\bchelating agent\b",
        r"\bchelate\b",
    ],

    "Complexation": [
        r"\bcomplexation\b",
        r"\bcomplexing agent\b",
        r"\bcomplex formation\b",
    ],

    "Precipitation": [
        r"\bselective precipitation\b",
        r"\bprecipitation process\b",
        r"\bprecipitation method\b",
        r"\bprecipitating agent\b",
    ],

    "Crystallization": [
        r"\bcrystallization\b",
        r"\bcrystallisation\b",
        r"\bfractional crystallization\b",
        r"\bfractional crystallisation\b",
    ],

    "Cementation": [
        r"\bcementation\b",
        r"\bcementation process\b",
    ],

    # --------------------------------------------------------
    # Pyrometallurgical / Thermal
    # --------------------------------------------------------

    "Pyrometallurgy": [
        r"\bpyrometallurg(?:y|ical)\b",
    ],

    "Roasting": [
        r"\broasting\b",
        r"\broasted\b",
    ],

    "Calcination": [
        r"\bcalcination\b",
        r"\bcalcined\b",
        r"\bcalcining\b",
    ],

    "Roasting / Calcination": [
        r"\broasting and calcination\b",
        r"\bcalcination and roasting\b",
    ],

    "Thermal Processing": [
        r"\bthermal processing\b",
        r"\bthermal treatment\b",
        r"\bthermal decomposition\b",
        r"\bthermal conversion\b",
    ],

    "Thermal Reduction": [
        r"\bthermal reduction\b",
        r"\bcarbothermal reduction\b",
    ],

    "Smelting": [
        r"\bsmelting\b",
        r"\bsmelted\b",
    ],

    "Sintering": [
        r"\bsintering\b",
        r"\bsintered\b",
    ],

    "Microwave Processing": [
        r"\bmicrowave processing\b",
        r"\bmicrowave treatment\b",
        r"\bmicrowave heating\b",
    ],

    "Plasma Processing": [
        r"\bplasma processing\b",
        r"\bplasma treatment\b",
        r"\bplasma arc\b",
    ],

    "Molten Salt Processing": [
        r"\bmolten salt\b",
        r"\bmolten[- ]salt electrolysis\b",
        r"\bmolten[- ]salt process\b",
    ],

    # --------------------------------------------------------
    # Physical Separation
    # --------------------------------------------------------

    "Mineral Processing": [
        r"\bmineral processing\b",
        r"\bmineral[- ]processing\b",
    ],

    "Ore Processing": [
        r"\bore processing\b",
        r"\bore[- ]processing\b",
        r"\bprocessing of ore\b",
    ],

    "Beneficiation": [
        r"\bbeneficiation\b",
        r"\bmineral beneficiation\b",
    ],

    "Flotation": [
        r"\bflotation\b",
        r"\bfroth flotation\b",
        r"\bflotation process\b",
    ],

    "Magnetic Separation": [
        r"\bmagnetic separation\b",
        r"\bmagnetic separator\b",
    ],

    "High-Gradient Magnetic Separation": [
        r"\bhigh[- ]gradient magnetic separation\b",
        r"\bhigh[- ]intensity magnetic separation\b",
    ],

    "Eddy Current Separation": [
        r"\beddy current separation\b",
        r"\beddy[- ]current separator\b",
    ],

    "Gravity Separation": [
        r"\bgravity separation\b",
        r"\bgravity concentration\b",
        r"\bspiral concentrator\b",
        r"\bjig separation\b",
    ],

    "Dense-Media Separation": [
        r"\bdense media separation\b",
        r"\bdense[- ]medium separation\b",
    ],

    "Electrostatic Separation": [
        r"\belectrostatic separation\b",
        r"\belectrostatic separator\b",
    ],

    "Screening / Classification": [
        r"\bparticle classification\b",
        r"\bparticle size classification\b",
        r"\bscreening process\b",
        r"\bsize classification\b",
    ],

    "Centrifugal Separation": [
        r"\bcentrifugal separation\b",
        r"\bcentrifugal separator\b",
    ],

    "Sensor-Based Sorting": [
        r"\bsensor[- ]based sorting\b",
        r"\bsensor based sorting\b",
        r"\boptical sorting\b",
        r"\bsensor sorting\b",
    ],

    # --------------------------------------------------------
    # Electrochemical
    # --------------------------------------------------------

    "Electrochemical Processing": [
        r"\belectrochemical processing\b",
        r"\belectrochemical treatment\b",
        r"\belectrochemical recovery\b",
        r"\belectrochemical extraction\b",
        r"\belectrolysis\b",
    ],

    "Electrowinning": [
        r"\belectrowinning\b",
    ],

    "Electrodeposition": [
        r"\belectrodeposition\b",
        r"\belectrodeposit(?:ed|ing)\b",
    ],

    "Electrorefining": [
        r"\belectrorefining\b",
        r"\belectro[- ]refining\b",
    ],

    "Electrochemical Leaching": [
        r"\belectrochemical leaching\b",
        r"\belectrochemical leach\b",
    ],

    # --------------------------------------------------------
    # Recycling / Secondary Resources
    # --------------------------------------------------------

    "Battery Recycling": [
        r"\bbattery recycling\b",
        r"\brecycling of .*batter(?:y|ies)\b",
        r"\brecovery from .*batter(?:y|ies)\b",
    ],

    "Battery Material Recovery": [
        r"\brecovery of .*battery material\b",
        r"\brecovery of .*cathode material\b",
        r"\brecovery of .*anode material\b",
        r"\bbattery material recovery\b",
    ],

    "Black Mass Processing": [
        r"\bblack mass processing\b",
        r"\bprocessing of black mass\b",
        r"\brecovery from black mass\b",
        r"\bblack mass recovery\b",
    ],

    "E-Waste Processing": [
        r"\be[- ]waste processing\b",
        r"\belectronic waste processing\b",
        r"\bprocessing of electronic waste\b",
    ],

    "Scrap Recycling": [
        r"\bscrap recycling\b",
        r"\brecycling of scrap\b",
        r"\bscrap recovery\b",
    ],

    "Spent Catalyst Recycling": [
        r"\bspent catalyst recycling\b",
        r"\brecovery from spent catalyst\b",
        r"\brecycling of spent catalyst\b",
    ],

    "Waste-to-Resource Recovery": [
        r"\bwaste[- ]to[- ]resource\b",
        r"\bwaste to resource recovery\b",
        r"\bresource recovery from waste\b",
    ],

    "Waste Processing": [
        r"\bwaste processing\b",
        r"\bwaste treatment\b",
        r"\bprocessing of waste\b",
    ],

    # --------------------------------------------------------
    # Separation / Purification
    # --------------------------------------------------------

    "Selective Separation": [
        r"\bselective separation\b",
        r"\bselective recovery\b",
    ],

    "Liquid-Liquid Extraction": [
        r"\bliquid[- ]liquid extraction\b",
        r"\bliquid liquid extraction\b",
    ],

    "Chromatographic Separation": [
        r"\bchromatograph(?:y|ic) separation\b",
        r"\bchromatographic purification\b",
        r"\bion chromatography\b",
    ],

    "Nanofiltration": [
        r"\bnanofiltration\b",
    ],

    "Ultrafiltration": [
        r"\bultrafiltration\b",
    ],

    "Reverse Osmosis": [
        r"\breverse osmosis\b",
    ],

    "Membrane Technology": [
        r"\bmembrane technology\b",
        r"\bmembrane[- ]based technology\b",
    ],

    # --------------------------------------------------------
    # Metallurgical / Chemical Conversion
    # --------------------------------------------------------

    "Metallurgical Processing": [
        r"\bmetallurgical processing\b",
        r"\bmetallurgical treatment\b",
        r"\bmetallurgical recovery\b",
        r"\bmetallurgical extraction\b",
    ],

    "Chemical Reduction": [
        r"\bchemical reduction\b",
        r"\breduction process\b",
    ],

    "Carbothermal Reduction": [
        r"\bcarbothermal reduction\b",
    ],

    "Oxidation": [
        r"\boxidation process\b",
        r"\boxidative treatment\b",
        r"\boxidative leaching\b",
    ],

    "Chlorination": [
        r"\bchlorination\b",
        r"\bchlorinating\b",
        r"\bchlorination process\b",
    ],

    "Sulfation": [
        r"\bsulfation\b",
        r"\bsulphation\b",
        r"\bsulfating\b",
        r"\bsulphating\b",
    ],

    # --------------------------------------------------------
    # Materials / Advanced Processing
    # --------------------------------------------------------

    "Material Synthesis": [
        r"\bmaterial synthesis\b",
        r"\bsynthesis of [^.]{0,120}\bmaterial\b",
        r"\bsynthesis of [^.]{0,120}\balloy\b",
        r"\bsynthesis of [^.]{0,120}\bcomposite\b",
        r"\bsynthesis of [^.]{0,120}\belectrode\b",
    ],

    "Nanomaterial Synthesis": [
        r"\bnanomaterial synthesis\b",
        r"\bsynthesis of nanomaterial\b",
        r"\bsynthesis of nanoparticles\b",
        r"\bnanoparticle synthesis\b",
    ],

    "Alloy Processing": [
        r"\balloy processing\b",
        r"\balloy production\b",
        r"\balloy preparation\b",
    ],

    "Composite Processing": [
        r"\bcomposite processing\b",
        r"\bcomposite preparation\b",
        r"\bcomposite fabrication\b",
    ],

    "Ceramic Processing": [
        r"\bceramic processing\b",
        r"\bceramic preparation\b",
    ],

    "Powder Metallurgy": [
        r"\bpowder metallurgy\b",
        r"\bpowder metallurgical\b",
    ],

    "Additive Manufacturing": [
        r"\badditive manufacturing\b",
        r"\b3d printing\b",
        r"\bmetal additive manufacturing\b",
    ],

    "Surface Modification": [
        r"\bsurface modification\b",
        r"\bsurface treatment\b",
        r"\bsurface functionalization\b",
    ],

    "Coating": [
        r"\bcoating\b",
        r"\bcoated\b",
        r"\bcoating process\b",
    ],

    "Carbonization": [
        r"\bcarbonization\b",
        r"\bcarbonisation\b",
        r"\bcarbonizing\b",
        r"\bcarbonising\b",
    ],
}


# ============================================================
# APPLICATION TYPES
# ============================================================

APPLICATION_PATTERNS = {

    "Battery": [
        r"\bbattery\b",
        r"\bbatteries\b",
        r"\blithium[- ]ion battery\b",
        r"\brechargeable battery\b",
        r"\banode\b",
        r"\bcathode\b",
        r"\belectrode material\b",
        r"\benergy storage\b",
    ],

    "Catalyst": [
        r"\bcatalyst\b",
        r"\bcatalytic\b",
        r"\bcatalysis\b",
    ],

    "Medical / Pharmaceutical": [
        r"\bpharmaceutical\b",
        r"\bmedicine\b",
        r"\bmedical\b",
        r"\btherapeutic\b",
        r"\bdrug delivery\b",
        r"\bcancer\b",
        r"\btumou?r\b",
        r"\bdiagnostic\b",
        r"\bbiomedical\b",
    ],

    "Solar / Semiconductor": [
        r"\bsolar cell\b",
        r"\bphotovoltaic\b",
        r"\bsemiconductor\b",
        r"\bsemiconducting\b",
        r"\bsolar panel\b",
        r"\bphotodetector\b",
    ],

    "Sensor": [
        r"\bsensor\b",
        r"\bsensing\b",
        r"\bdetector\b",
        r"\bbiosensor\b",
    ],

    "Alloy / Advanced Materials": [
        r"\balloy\b",
        r"\bcomposite\b",
        r"\bnanocomposite\b",
        r"\bnanomaterial\b",
        r"\bnanoparticle\b",
        r"\bceramic\b",
        r"\badvanced material\b",
        r"\bmetal matrix composite\b",
    ],
}


# ============================================================
# MATERIAL / FEEDSTOCK
# ============================================================

MATERIAL_PATTERNS = [

    r"\bore\b",
    r"\bmineral\b",
    r"\bminerals\b",
    r"\bconcentrate\b",
    r"\bconcentrates\b",
    r"\btailings?\b",
    r"\bslag\b",
    r"\bbrine\b",
    r"\bresidue\b",
    r"\bresidues\b",
    r"\bscrap\b",
    r"\bwaste\b",
    r"\be[- ]waste\b",
    r"\belectronic waste\b",
    r"\bindustrial waste\b",
    r"\bspent battery\b",
    r"\bspent batteries\b",
    r"\bblack mass\b",
    r"\bmetal[- ]bearing\b",
    r"\bmetal[- ]containing\b",
    r"\bleachate\b",
    r"\bleach liquor\b",
    r"\bprocess liquor\b",
    r"\bsolution\b",
    r"\bprecipitate\b",
    r"\boxide\b",
    r"\boxides\b",
    r"\bhydroxide\b",
    r"\bsulfate\b",
    r"\bsulphate\b",
    r"\bchloride\b",
    r"\bcarbonate\b",
    r"\bsilicate\b",
    r"\brefinery residue\b",
    r"\bmetallurgical residue\b",
]


# ============================================================
# STRONG PROCESSING CONTEXT
# ============================================================

STRONG_CONTEXT_PATTERNS = [

    r"\bmineral processing\b",
    r"\bore processing\b",
    r"\bmineral extraction\b",
    r"\bmetal extraction\b",
    r"\bmineral recovery\b",
    r"\bmetal recovery\b",
    r"\bmetal refining\b",
    r"\bmineral refining\b",
    r"\bmetal purification\b",
    r"\bmineral purification\b",
    r"\bmetallurgical processing\b",
    r"\bmetallurgical treatment\b",
    r"\bmetallurgical recovery\b",
    r"\bhydrometallurg",
    r"\bpyrometallurg",
    r"\bbeneficiation\b",
    r"\brecovery from waste\b",
    r"\brecovery from scrap\b",
    r"\brecovery from residue\b",
    r"\brecovery from spent\b",
    r"\bsecondary resource\b",
]


# ============================================================
# NEGATIVE CONTEXT
# ============================================================

NEGATIVE_PATTERNS = [

    r"\bblood\b",
    r"\bbodily fluid\b",
    r"\burine\b",
    r"\bsaliva\b",
    r"\bserum\b",
    r"\bplasma\b",
    r"\btissue\b",
    r"\bcancer\b",
    r"\btumou?r\b",
    r"\bdrug\b",
    r"\bpharmaceutical\b",
    r"\bmedicine\b",
    r"\bprotein\b",
    r"\bdna\b",
    r"\brna\b",
    r"\bpathogen\b",
    r"\bclinical\b",
]


NEGATIVE_CONTEXT_WINDOW = 300
NEGATIVE_CONTEXT_PENALTY = 3


# ============================================================
# GENERIC TECHNOLOGIES
# ============================================================

# These technologies are real technologies, but their words are
# too generic to establish mineral-processing relevance by
# themselves.

GENERIC_TECHNOLOGIES = {
    "Coating",
    "Surface Modification",
    "Adsorption",
    "Complexation",
    "Chelation",
    "Chemical Reduction",
    "Oxidation",
    "Material Synthesis",
    "Alloy Processing",
    "Composite Processing",
    "Ceramic Processing",
    "Thermal Processing",
    "Precipitation",
    "Crystallization",
    "Reduction",
    "Sintering",
    "Carbonization",
}


# Technologies that require explicit feedstock/process context.

FEEDSTOCK_TECHNOLOGIES = {
    "Battery Recycling",
    "Battery Material Recovery",
    "Black Mass Processing",
    "E-Waste Processing",
    "Scrap Recycling",
    "Spent Catalyst Recycling",
    "Waste-to-Resource Recovery",
    "Waste Processing",
}


# Technologies whose terminology is highly diagnostic.

DIAGNOSTIC_TECHNOLOGIES = {
    "Hydrometallurgy",
    "Pyrometallurgy",
    "Solvent Extraction",
    "Ion Exchange",
    "Membrane Separation",
    "Electrodialysis",
    "Bioleaching",
    "Flotation",
    "Magnetic Separation",
    "High-Gradient Magnetic Separation",
    "Eddy Current Separation",
    "Gravity Separation",
    "Dense-Media Separation",
    "Electrostatic Separation",
    "Centrifugal Separation",
    "Sensor-Based Sorting",
    "Electrowinning",
    "Electrodeposition",
    "Electrorefining",
    "Electrochemical Leaching",
    "Molten Salt Processing",
    "Powder Metallurgy",
    "Nanofiltration",
    "Ultrafiltration",
    "Reverse Osmosis",
    "Chromatographic Separation",
    "Chlorination",
    "Sulfation",
    "Carbothermal Reduction",
    "Microwave Processing",
    "Plasma Processing",
}


# ============================================================
# PROCESS GROUPS
# ============================================================

STRONG_PROCESSES = {
    "Leaching",
    "Beneficiation",
    "Smelting",
    "Roasting",
    "Calcination",
    "Sintering",
    "Carbonization",
    "Electrochemical Recovery",
}


CONTEXT_REQUIRED_PROCESSES = {
    "Extraction",
    "Recovery",
    "Separation",
    "Refining",
    "Purification",
    "Recycling",
    "Reduction",
    "Dissolution",
    "Precipitation",
    "Concentration",
    "Treatment",
}


# ============================================================
# REGEX COMPILATION
# ============================================================

def compile_dict(pattern_dict):

    return {
        label: [
            re.compile(
                pattern,
                re.IGNORECASE,
            )
            for pattern in patterns
        ]
        for label, patterns in pattern_dict.items()
    }


COMPILED_PROCESS = compile_dict(
    PROCESS_PATTERNS
)

COMPILED_TECHNOLOGY = compile_dict(
    TECHNOLOGY_PATTERNS
)

COMPILED_APPLICATION = compile_dict(
    APPLICATION_PATTERNS
)

COMPILED_MINERALS = {
    mineral: [
        re.compile(
            rf"\b{re.escape(keyword)}\b",
            re.IGNORECASE,
        )
        for keyword in keywords
    ]
    for mineral, keywords in MINERAL_KEYWORDS.items()
}

COMPILED_MATERIAL = [
    re.compile(
        pattern,
        re.IGNORECASE,
    )
    for pattern in MATERIAL_PATTERNS
]

COMPILED_STRONG_CONTEXT = [
    re.compile(
        pattern,
        re.IGNORECASE,
    )
    for pattern in STRONG_CONTEXT_PATTERNS
]

COMPILED_NEGATIVE = [
    re.compile(
        pattern,
        re.IGNORECASE,
    )
    for pattern in NEGATIVE_PATTERNS
]


# ============================================================
# JSON
# ============================================================

def load_json(path: Path) -> list[dict]:

    with path.open(
        "r",
        encoding="utf-8",
    ) as file:

        data = json.load(file)

    if isinstance(data, list):
        return data

    if isinstance(data, dict):

        for key in (
            "patents",
            "data",
            "results",
        ):

            if isinstance(
                data.get(key),
                list,
            ):

                return data[key]

        if any(
            key in data
            for key in (
                "title",
                "Title",
                "application_number",
                "ApplicationNumber",
            )
        ):

            return [data]

    return []


# ============================================================
# TEXT
# ============================================================

def get_text(patent: dict) -> str:

    fields = [
        "title",
        "Title",

        "abstract",
        "Abstract",

        "field_of_invention",
        "Field Of Invention",
        "fieldOfInvention",

        "complete_specification",
        "Complete Specification",
    ]

    parts = []

    for field in fields:

        value = patent.get(
            field
        )

        if value is None:
            continue

        if isinstance(
            value,
            list,
        ):

            value = " ".join(
                str(item)
                for item in value
            )

        parts.append(
            str(value)
        )

    return " ".join(
        parts
    ).lower()


# ============================================================
# MINERALS
# ============================================================

def detect_minerals(text):

    minerals = []
    positions = []

    for mineral, patterns in (
        COMPILED_MINERALS.items()
    ):

        found = []

        for pattern in patterns:

            found.extend(
                match.start()
                for match in pattern.finditer(
                    text
                )
            )

        if found:

            minerals.append(
                mineral
            )

            positions.extend(
                (position, mineral)
                for position in found
            )

    positions.sort()

    return (
        minerals,
        positions,
    )


# ============================================================
# APPLICATIONS
# ============================================================

def detect_applications(text):

    results = []

    for label, patterns in (
        COMPILED_APPLICATION.items()
    ):

        if any(
            pattern.search(text)
            for pattern in patterns
        ):

            results.append(
                label
            )

    return results


# ============================================================
# MATCHES
# ============================================================

def get_matches(
    text,
    patterns,
):

    matches = []

    for pattern in patterns:

        matches.extend(
            match.start()
            for match in pattern.finditer(
                text
            )
        )

    matches.sort()

    return matches


# ============================================================
# DISTANCE
# ============================================================

def nearest_distance(
    position,
    sorted_positions,
):

    if not sorted_positions:

        return float("inf")

    index = bisect.bisect_left(
        sorted_positions,
        position,
    )

    candidates = []

    if index < len(
        sorted_positions
    ):

        candidates.append(
            sorted_positions[index]
        )

    if index > 0:

        candidates.append(
            sorted_positions[
                index - 1
            ]
        )

    return min(
        abs(
            position - candidate
        )
        for candidate in candidates
    )


# ============================================================
# LOCAL CONTEXT
# ============================================================

def local_context(
    text,
    position,
    window=300,
):

    start = max(
        0,
        position - window,
    )

    end = min(
        len(text),
        position + window,
    )

    return text[
        start:end
    ]


def has_pattern_nearby(
    text,
    position,
    patterns,
    window=300,
):

    context = local_context(
        text,
        position,
        window,
    )

    return any(
        pattern.search(context)
        for pattern in patterns
    )


# ============================================================
# PROCESSING SCORE
# ============================================================

def processing_score(
    text,
    mineral_positions,
):

    if not mineral_positions:

        return (
            0,
            [],
            False,
        )

    mineral_only_positions = [
        position
        for position, _ in mineral_positions
    ]

    material_positions = get_matches(
        text,
        COMPILED_MATERIAL,
    )

    strong_context_positions = get_matches(
        text,
        COMPILED_STRONG_CONTEXT,
    )

    negative_positions = get_matches(
        text,
        COMPILED_NEGATIVE,
    )

    score = 1

    evidence = [
        "mineral identified"
    ]

    strong_near_mineral = any(
        nearest_distance(
            position,
            mineral_only_positions,
        ) <= 500
        for position in (
            strong_context_positions
        )
    )

    if strong_near_mineral:

        score += 4

        evidence.append(
            "strong processing context near mineral"
        )

    material_near_mineral = any(
        nearest_distance(
            position,
            mineral_only_positions,
        ) <= 350
        for position in (
            material_positions
        )
    )

    if material_near_mineral:

        score += 2

        evidence.append(
            "mineral + material/feedstock context"
        )

    negative_near_mineral = any(
        nearest_distance(
            position,
            negative_positions,
        ) <= NEGATIVE_CONTEXT_WINDOW
        for position in (
            mineral_only_positions
        )
    )

    if negative_near_mineral:

        score -= NEGATIVE_CONTEXT_PENALTY

        evidence.append(
            "biomedical/non-industrial context nearby"
        )

    return (
        score,
        evidence,
        negative_near_mineral,
    )


# ============================================================
# PROCESS DETECTION
# ============================================================

def detect_processes(
    text,
    mineral_positions,
):

    results = []

    mineral_only_positions = [
        position
        for position, _ in mineral_positions
    ]

    if not mineral_only_positions:

        return results

    for process, patterns in (
        COMPILED_PROCESS.items()
    ):

        matches = get_matches(
            text,
            patterns,
        )

        if not matches:

            continue

        for position in matches:

            distance = nearest_distance(
                position,
                mineral_only_positions,
            )

            if process in STRONG_PROCESSES:

                if distance <= 300:

                    results.append(
                        process
                    )

                    break

                if (
                    distance <= 500
                    and has_pattern_nearby(
                        text,
                        position,
                        COMPILED_MATERIAL,
                        300,
                    )
                ):

                    results.append(
                        process
                    )

                    break

            elif process in (
                CONTEXT_REQUIRED_PROCESSES
            ):

                if distance > 300:

                    continue

                context = local_context(
                    text,
                    position,
                    350,
                )

                local_material = any(
                    pattern.search(context)
                    for pattern in (
                        COMPILED_MATERIAL
                    )
                )

                local_strong = any(
                    pattern.search(context)
                    for pattern in (
                        COMPILED_STRONG_CONTEXT
                    )
                )

                if (
                    local_material
                    or local_strong
                ):

                    results.append(
                        process
                    )

                    break

    return results


# ============================================================
# TECHNOLOGY EVIDENCE
# ============================================================

def technology_evidence(
    technology,
    text,
    position,
    mineral_positions,
    processes,
):
    """
    Return:
        accepted,
        confidence,
        evidence list
    """

    mineral_only_positions = [
        p
        for p, _ in mineral_positions
    ]

    distance = nearest_distance(
        position,
        mineral_only_positions,
    )

    if distance > 450:

        return (
            False,
            "LOW",
            [],
        )

    context = local_context(
        text,
        position,
        350,
    )

    local_material = any(
        pattern.search(context)
        for pattern in (
            COMPILED_MATERIAL
        )
    )

    local_strong = any(
        pattern.search(context)
        for pattern in (
            COMPILED_STRONG_CONTEXT
        )
    )

    local_process = any(
        pattern.search(context)
        for pattern_group in (
            COMPILED_PROCESS.values()
        )
        for pattern in pattern_group
        if pattern.search(context)
    )

    evidence = []

    if distance <= 200:

        evidence.append(
            "technology close to mineral"
        )

    elif distance <= 350:

        evidence.append(
            "technology moderately close to mineral"
        )

    if local_material:

        evidence.append(
            "local material/feedstock evidence"
        )

    if local_strong:

        evidence.append(
            "local strong processing context"
        )

    if local_process:

        evidence.append(
            "local process evidence"
        )

    # --------------------------------------------------------
    # FEEDSTOCK TECHNOLOGIES
    # --------------------------------------------------------

    if technology in FEEDSTOCK_TECHNOLOGIES:

        if (
            not local_process
            and not local_strong
        ):

            return (
                False,
                "LOW",
                evidence,
            )

        if distance <= 250:

            return (
                True,
                "HIGH",
                evidence,
            )

        return (
            True,
            "MEDIUM",
            evidence,
        )

    # --------------------------------------------------------
    # GENERIC TECHNOLOGIES
    # --------------------------------------------------------

    if technology in GENERIC_TECHNOLOGIES:

        # Generic technology requires BOTH mineral proximity
        # and meaningful processing/material evidence.

        if not (
            local_material
            or local_strong
        ):

            return (
                False,
                "LOW",
                evidence,
            )

        # Strongest case:
        # mineral + process + technology
        if (
            local_process
            and distance <= 250
        ):

            return (
                True,
                "HIGH",
                evidence,
            )

        # Mineral + material + technology
        if (
            local_material
            and distance <= 250
        ):

            return (
                True,
                "MEDIUM",
                evidence,
            )

        # Strong context slightly farther away.
        if (
            local_strong
            and distance <= 350
        ):

            return (
                True,
                "MEDIUM",
                evidence,
            )

        return (
            False,
            "LOW",
            evidence,
        )

    # --------------------------------------------------------
    # DIAGNOSTIC TECHNOLOGIES
    # --------------------------------------------------------

    if technology in DIAGNOSTIC_TECHNOLOGIES:

        if not (
            local_material
            or local_strong
            or local_process
        ):

            return (
                False,
                "LOW",
                evidence,
            )

        if (
            distance <= 250
            and (
                local_strong
                or local_process
            )
        ):

            return (
                True,
                "HIGH",
                evidence,
            )

        if (
            distance <= 350
            and (
                local_material
                or local_strong
                or local_process
            )
        ):

            return (
                True,
                "MEDIUM",
                evidence,
            )

        return (
            False,
            "LOW",
            evidence,
        )

    # --------------------------------------------------------
    # OTHER TECHNOLOGIES
    # --------------------------------------------------------

    if (
        distance <= 300
        and (
            local_material
            or local_strong
            or local_process
        )
    ):

        return (
            True,
            "MEDIUM",
            evidence,
        )

    return (
        False,
        "LOW",
        evidence,
    )


# ============================================================
# TECHNOLOGY DETECTION
# ============================================================

def detect_technologies(
    text,
    mineral_positions,
    processes,
):

    results = []
    confidence_map = {}
    evidence_map = {}

    for technology, patterns in (
        COMPILED_TECHNOLOGY.items()
    ):

        matches = get_matches(
            text,
            patterns,
        )

        if not matches:

            continue

        best_confidence = None
        best_evidence = []
        accepted = False

        confidence_rank = {
            "HIGH": 3,
            "MEDIUM": 2,
            "LOW": 1,
        }

        for position in matches:

            (
                is_valid,
                confidence,
                evidence,
            ) = technology_evidence(
                technology,
                text,
                position,
                mineral_positions,
                processes,
            )

            if not is_valid:

                continue

            accepted = True

            if (
                best_confidence is None
                or confidence_rank[
                    confidence
                ]
                >
                confidence_rank[
                    best_confidence
                ]
            ):

                best_confidence = (
                    confidence
                )

                best_evidence = (
                    evidence
                )

        if accepted:

            results.append(
                technology
            )

            confidence_map[
                technology
            ] = best_confidence

            evidence_map[
                technology
            ] = best_evidence

    return (
        results,
        confidence_map,
        evidence_map,
    )


# ============================================================
# APPLICATION DOMINANCE
# ============================================================

def application_dominates(
    applications,
    processes,
    technologies,
    processing_score_value,
):

    if not applications:

        return False

    # If there is strong processing evidence,
    # processing should dominate application labels.
    if (
        processing_score_value >= 5
        and (
            processes
            or technologies
        )
    ):

        return False

    # Medical/pharmaceutical is particularly prone
    # to mineral false positives.
    if (
        "Medical / Pharmaceutical"
        in applications
        and not processes
        and not technologies
    ):

        return True

    # Application-heavy patents with no real processing
    # evidence remain application patents.
    if (
        processing_score_value < 5
        and not processes
    ):

        return True

    return False


# ============================================================
# RELEVANCE
# ============================================================

def classify_relevance(
    minerals,
    processes,
    technologies,
    applications,
    score,
    negative_present,
):

    if not minerals:

        return "INCIDENTAL"

    if application_dominates(
        applications,
        processes,
        technologies,
        score,
    ):

        return "APPLICATION"

    has_processing_labels = (
        bool(processes)
        or bool(technologies)
    )

    # --------------------------------------------------------
    # CORE
    # --------------------------------------------------------

    if has_processing_labels:

        if score >= 5:

            if negative_present:

                if processes:

                    return "CORE"

                return "APPLICATION"

            return "CORE"

        # ----------------------------------------------------
        # ADJACENT
        # ----------------------------------------------------

        if score >= 3:

            return "ADJACENT"

        if negative_present:

            if applications:

                return "APPLICATION"

            return "INCIDENTAL"

        return "ADJACENT"

    # --------------------------------------------------------
    # No processing labels
    # --------------------------------------------------------

    if negative_present:

        if applications:

            return "APPLICATION"

        return "INCIDENTAL"

    if applications:

        return "APPLICATION"

    return "INCIDENTAL"


# ============================================================
# PROCESS ONE PATENT
# ============================================================

def process_patent(
    patent,
):

    text = get_text(
        patent
    )

    minerals, mineral_positions = (
        detect_minerals(text)
    )

    applications = detect_applications(
        text
    )

    (
        score,
        evidence,
        negative_present,
    ) = processing_score(
        text,
        mineral_positions,
    )

    processes = detect_processes(
        text,
        mineral_positions,
    )

    (
        technologies,
        technology_confidence_map,
        technology_evidence_map,
    ) = detect_technologies(
        text,
        mineral_positions,
        processes,
    )

    relevance = classify_relevance(
        minerals=minerals,
        processes=processes,
        technologies=technologies,
        applications=applications,
        score=score,
        negative_present=negative_present,
    )

    result = dict(
        patent
    )

    result["nlp_v9"] = {

        "minerals": minerals,

        "processes": processes,

        "technologies": technologies,

        "technology_confidence": (
            technology_confidence_map
        ),

        "technology_evidence": (
            technology_evidence_map
        ),

        "applications": applications,

        "relevance": relevance,

        "processing_score": score,

        "evidence": evidence,

        "classifier": "v9",
    }

    return result


# ============================================================
# ARGUMENTS
# ============================================================

def parse_args():

    parser = argparse.ArgumentParser(
        description=(
            "Classify critical-mineral patents "
            "using the final V9 NLP classifier."
        )
    )

    parser.add_argument(
        "--input-dir",
        type=Path,
        default=Path(
            "data/processed"
        ),
    )

    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
    )

    return parser.parse_args()


# ============================================================
# MAIN
# ============================================================

def main():

    args = parse_args()

    input_dir = args.input_dir

    output_dir = (
        args.output_dir
        or input_dir / "nlp_v9"
    )

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    json_files = sorted(
        path
        for path in input_dir.glob(
            "*_patents.json"
        )
        if path.name != "ipindia_patents.json"
        and "_nlp_" not in path.name
    )

    if not json_files:

        print(
            "No patent JSON files found."
        )

        return

    total = 0
    dataset_failures = 0
    patent_failures = 0

    relevance_counter = Counter()
    process_counter = Counter()
    technology_counter = Counter()
    technology_confidence_counter = Counter()
    application_counter = Counter()
    mineral_counter = Counter()

    process_patents = 0
    technology_patents = 0

    print(
        f"Found {len(json_files)} datasets."
    )

    print()

    for dataset_index, input_path in enumerate(
        json_files,
        start=1,
    ):

        try:

            patents = load_json(
                input_path
            )

        except Exception as error:

            dataset_failures += 1

            print(
                f"[{dataset_index}/"
                f"{len(json_files)}] "
                f"{input_path.stem}: "
                f"FAILED TO LOAD: "
                f"{error}"
            )

            continue

        dataset_total = len(
            patents
        )

        processed = []

        print(
            f"[{dataset_index}/"
            f"{len(json_files)}] "
            f"{input_path.stem} "
            f"({dataset_total} patents)"
        )

        for patent_index, patent in enumerate(
            patents,
            start=1,
        ):

            if not isinstance(
                patent,
                dict,
            ):

                patent_failures += 1

                continue

            try:

                result = process_patent(
                    patent
                )

            except Exception as error:

                patent_failures += 1

                print(
                    f"    patent "
                    f"{patent_index}/"
                    f"{dataset_total} "
                    f"FAILED: "
                    f"{error}"
                )

                continue

            processed.append(
                result
            )

            total += 1

            nlp = result[
                "nlp_v9"
            ]

            relevance_counter[
                nlp["relevance"]
            ] += 1

            if nlp["processes"]:

                process_patents += 1

            if nlp["technologies"]:

                technology_patents += 1

            for process in nlp[
                "processes"
            ]:

                process_counter[
                    process
                ] += 1

            for technology in nlp[
                "technologies"
            ]:

                technology_counter[
                    technology
                ] += 1

                confidence = nlp[
                    "technology_confidence"
                ].get(
                    technology,
                    "LOW",
                )

                technology_confidence_counter[
                    confidence
                ] += 1

            for application in nlp[
                "applications"
            ]:

                application_counter[
                    application
                ] += 1

            for mineral in nlp[
                "minerals"
            ]:

                mineral_counter[
                    mineral
                ] += 1

            if (
                patent_index % 100 == 0
                or patent_index == dataset_total
            ):

                print(
                    f"    "
                    f"{patent_index}/"
                    f"{dataset_total}"
                )

        output_path = (
            output_dir
            / f"{input_path.stem}"
            f"_nlp_v9.json"
        )

        try:

            with output_path.open(
                "w",
                encoding="utf-8",
            ) as file:

                json.dump(
                    processed,
                    file,
                    indent=2,
                    ensure_ascii=False,
                )

        except Exception as error:

            dataset_failures += 1

            print(
                f"    FAILED TO WRITE OUTPUT: "
                f"{error}"
            )

    # ========================================================
    # SUMMARY
    # ========================================================

    print()

    print(
        "=" * 60
    )

    print(
        "NLP V9 PROCESSING COMPLETE"
    )

    print(
        "=" * 60
    )

    print(
        f"Datasets attempted : "
        f"{len(json_files)}"
    )

    print(
        f"Dataset failures   : "
        f"{dataset_failures}"
    )

    print(
        f"Patent failures    : "
        f"{patent_failures}"
    )

    print(
        f"Total patents      : "
        f"{total}"
    )

    # ========================================================
    # RELEVANCE
    # ========================================================

    print()

    print(
        "RELEVANCE"
    )

    for label in (
        "CORE",
        "ADJACENT",
        "APPLICATION",
        "INCIDENTAL",
    ):

        count = relevance_counter[
            label
        ]

        percentage = (
            count / total * 100
            if total
            else 0
        )

        print(
            f"{label:<14}: "
            f"{count:5d} "
            f"({percentage:6.2f}%)"
        )

    # ========================================================
    # PROCESSES
    # ========================================================

    print()

    print(
        "PROCESS COVERAGE"
    )

    print(
        f"Patents with process labels : "
        f"{process_patents}"
    )

    print()

    print(
        "TOP PROCESSES"
    )

    for label, count in (
        process_counter.most_common()
    ):

        print(
            f"{label:<32}: "
            f"{count}"
        )

    # ========================================================
    # TECHNOLOGIES
    # ========================================================

    print()

    print(
        "TECHNOLOGY COVERAGE"
    )

    print(
        f"Patents with technology labels : "
        f"{technology_patents}"
    )

    print()

    print(
        "TOP TECHNOLOGIES"
    )

    for label, count in (
        technology_counter.most_common()
    ):

        print(
            f"{label:<36}: "
            f"{count}"
        )

    # ========================================================
    # TECHNOLOGY CONFIDENCE
    # ========================================================

    print()

    print(
        "TECHNOLOGY CONFIDENCE"
    )

    for label in (
        "HIGH",
        "MEDIUM",
        "LOW",
    ):

        count = technology_confidence_counter[
            label
        ]

        print(
            f"{label:<14}: "
            f"{count}"
        )

    # ========================================================
    # APPLICATIONS
    # ========================================================

    print()

    print(
        "APPLICATION TYPES"
    )

    for label, count in (
        application_counter.most_common()
    ):

        print(
            f"{label:<36}: "
            f"{count}"
        )

    # ========================================================
    # MINERALS
    # ========================================================

    print()

    print(
        "MINERAL COUNTS"
    )

    for label, count in (
        mineral_counter.most_common()
    ):

        print(
            f"{label:<28}: "
            f"{count}"
        )

    print()

    print(
        f"Outputs: {output_dir}"
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()