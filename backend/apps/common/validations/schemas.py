from dataclasses import dataclass
from typing import Dict


@dataclass
class ValidationResult:
    """
    バリデーション結果
    """

    is_valid: bool

    errors: Dict[str, str]
