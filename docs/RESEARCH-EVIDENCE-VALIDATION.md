# Document Research — Evidence Validation Contract

## Purpose
Prevent a model-generated paraphrase or fabricated sentence from being presented as a source quotation in the structured document-research response.

## Contract
- A supported finding must include an evidence excerpt copied from extracted document text.
- Validation normalizes whitespace only, then requires the complete normalized excerpt to occur in the normalized extracted text. Wording and punctuation are otherwise preserved.
- Excerpts shorter than 8 normalized characters or longer than 3,000 characters are rejected.
- A non-null page/heading reference must independently occur in extracted text.
- An unsupported finding must use an empty evidence string, a null reference, and confidence `insufficient_evidence`.
- The response reports `evidence_validation: normalized_verbatim_match` for validated excerpts or `none` for an explicit insufficient-evidence result.

## Limitations
This is a source-span check, not a semantic entailment proof. A verbatim excerpt can still be irrelevant to or insufficient for a claim. High-impact claims still require human review or a separate entailment/evidence-quality assessment. Document research is not live web research.

## Tests
The regression suite covers valid source excerpts, absent references, paraphrased evidence with an otherwise valid reference, explicit insufficient-evidence handling, malformed model output, and authorization boundaries.
