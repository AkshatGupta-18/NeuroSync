import pymupdf

from .measurement_extraction import extract_measurements


MAX_PDF_PAGES = 50
MIN_EXTRACTED_CHARACTERS = 30

EXTRACTION_METHOD = "pymupdf_text"


class PDFExtractionError(Exception):
    """Base exception for safe PDF extraction failures."""


class ScannedPDFError(PDFExtractionError):
    """Raised when a PDF has no meaningful selectable text."""


class EncryptedPDFError(PDFExtractionError):
    """Raised when a PDF requires a password."""


class PDFPageLimitError(PDFExtractionError):
    """Raised when a PDF exceeds the supported page limit."""


def extract_pdf_report(file_object):
    """
    Extract selectable text and measurements from one PDF opening.

    This function does not perform OCR or clinical interpretation.
    """

    original_position = None
    document = None

    try:
        if hasattr(file_object, "tell"):
            original_position = file_object.tell()

        file_object.seek(0)
        pdf_bytes = file_object.read()

        if not pdf_bytes or not pdf_bytes.startswith(b"%PDF-"):
            raise PDFExtractionError(
                "The uploaded document is not a valid PDF."
            )

        try:
            document = pymupdf.open(
                stream=pdf_bytes,
                filetype="pdf",
            )
        except Exception as exc:
            raise PDFExtractionError(
                "The PDF could not be opened. It may be damaged or invalid."
            ) from exc

        if document.needs_pass:
            raise EncryptedPDFError(
                "Password-protected PDFs are not supported yet."
            )

        page_count = len(document)

        if page_count == 0:
            raise PDFExtractionError(
                "The PDF does not contain any pages."
            )

        if page_count > MAX_PDF_PAGES:
            raise PDFPageLimitError(
                f"PDFs cannot exceed {MAX_PDF_PAGES} pages."
            )

        extracted_pages = []

        for page_index, page in enumerate(document):
            page_text = page.get_text(
                "text",
                sort=True,
            ).strip()

            if page_text:
                extracted_pages.append(
                    f"[Page {page_index + 1}]\n{page_text}"
                )

        extracted_text = "\n\n".join(extracted_pages)

        meaningful_characters = len(
            "".join(extracted_text.split())
        )

        if meaningful_characters < MIN_EXTRACTED_CHARACTERS:
            raise ScannedPDFError(
                "This PDF appears to contain scanned pages or "
                "no selectable text. OCR support is not enabled yet."
            )

        measurement_result = extract_measurements(document)

        return {
            "text": extracted_text,
            "page_count": page_count,
            "extraction_method": EXTRACTION_METHOD,
            "measurements": measurement_result["measurements"],
            "measurement_count": measurement_result["measurement_count"],
            "warnings": measurement_result["warnings"],
        }

    except PDFExtractionError:
        raise

    except Exception as exc:
        raise PDFExtractionError(
            "An unexpected error occurred while processing the PDF."
        ) from exc

    finally:
        if document is not None:
            document.close()

        if original_position is not None:
            try:
                file_object.seek(original_position)
            except Exception:
                pass


def extract_pdf_text(file_object):
    """
    Backward-compatible text-only extraction interface.
    """

    result = extract_pdf_report(file_object)

    return {
        "text": result["text"],
        "page_count": result["page_count"],
        "extraction_method": result["extraction_method"],
    }