import xml.etree.ElementTree as ET
import re

def strip_ns(tag):
    return tag.split('}', 1)[-1] if '}' in tag else tag

# Optionally extend these for alias mapping
TAG_MAPPING = {}
ATTR_MAPPING = {}

IGNORE_TAGS = {
    "ApplicationArea", "Process", "ActionCriteria", "ActionExpression",
}

def canonical_tag(local):
    return TAG_MAPPING.get(local, local)

def canonical_attr(local):
    return ATTR_MAPPING.get(local, local)

def validate_xml_structure(xml_string):
    """
    Pre-validation to catch common XML structure issues
    """
    xml_string = xml_string.strip()
    
    if not xml_string:
        return False, "XML content is empty"
    
    # Check for basic XML structure
    if not xml_string.startswith('<'):
        return False, "XML must start with an opening tag"
    
    if not xml_string.endswith('>'):
        return False, "XML must end with a closing tag"
    
    # Count opening and closing tags to detect obvious imbalances
    opening_tags = len(re.findall(r'<[^/!?][^>]*[^/]>', xml_string))
    self_closing_tags = len(re.findall(r'<[^/!?][^>]*/>', xml_string))
    closing_tags = len(re.findall(r'</[^>]+>', xml_string))
    
    # Basic tag balance check (not perfect but catches obvious issues)
    if opening_tags != closing_tags:
        if opening_tags > closing_tags:
            return False, f"Found {opening_tags - closing_tags} unclosed tag(s)"
        else:
            return False, f"Found {closing_tags - opening_tags} extra closing tag(s)"
    
    # Check for multiple potential root elements (basic check)
    # Remove XML declaration, comments, and processing instructions
    content = re.sub(r'<\?xml[^>]*\?>', '', xml_string)
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    content = re.sub(r'<\?[^>]*\?>', '', content)
    content = content.strip()
    
    # Find top-level elements (not nested)
    top_level_elements = []
    depth = 0
    in_tag = False
    current_tag = ""
    
    i = 0
    while i < len(content):
        char = content[i]
        if char == '<':
            in_tag = True
            current_tag = ""
            if i + 1 < len(content) and content[i + 1] == '/':
                # Closing tag
                depth -= 1
            elif i + 1 < len(content) and content[i + 1] not in ['!', '?']:
                # Opening tag
                if depth == 0:
                    # This is a top-level element
                    tag_end = content.find('>', i)
                    if tag_end != -1:
                        tag_content = content[i:tag_end + 1]
                        if not tag_content.endswith('/>'):
                            top_level_elements.append(tag_content)
                        depth += 1
                else:
                    depth += 1
        elif char == '>' and in_tag:
            in_tag = False
            if current_tag.endswith('/'):
                depth -= 1
        i += 1
    
    if len(top_level_elements) > 1:
        return False, f"Multiple root elements detected ({len(top_level_elements)} found). XML must have exactly one root element."
    
    return True, None

def parse_xml_from_string(xml_string):
    """
    Enhanced XML parsing with better error detection
    """
    try:
        # Remove leading/trailing whitespace
        xml_string = xml_string.strip()
        
        if not xml_string:
            return None, "XML content is empty"
        
        # Pre-validation to catch common issues
        is_valid_structure, structure_error = validate_xml_structure(xml_string)
        if not is_valid_structure:
            return None, structure_error
        
        # Parse the XML
        root = ET.fromstring(xml_string)
        
        # Additional validation - check if we actually got an element
        if root is None:
            return None, "No root element found in XML"
            
        return root, None
        
    except ET.ParseError as e:
        # Extract and clean up error messages with line information
        error_msg = str(e).lower()
        original_error = str(e)
        
        # Extract line number if available
        line_number = None
        line_match = re.search(r'line (\d+)', original_error)
        if line_match:
            line_number = int(line_match.group(1))
        
        # Create line reference string
        line_ref = f" (line {line_number})" if line_number else ""
        
        if "not well-formed" in error_msg:
            return None, f"XML is not well-formed - check for unclosed tags or invalid syntax{line_ref}"
        elif "no element found" in error_msg:
            return None, "No XML elements found"
        elif "junk after document element" in error_msg:
            return None, "Multiple root elements detected - XML must have exactly one root element"
        elif "unclosed token" in error_msg:
            return None, f"Unclosed XML tag detected{line_ref}"
        elif "mismatched tag" in error_msg:
            # Try to extract tag names from the error
            if "Opening and ending tag mismatch:" in original_error:
                # Extract tag names for clearer error
                match = re.search(r"Opening and ending tag mismatch: (\w+).*?and (\w+)", original_error)
                if match:
                    return None, f"Tag mismatch: opening tag '{match.group(1)}' does not match closing tag '{match.group(2)}'{line_ref}"
            return None, f"Mismatched XML tags - check that opening and closing tags match{line_ref}"
        elif "expected" in error_msg and ">" in error_msg:
            return None, f"Missing '>' in XML tag{line_ref}"
        elif "xml declaration" in error_msg:
            return None, f"Invalid XML declaration{line_ref}"
        elif "starttag" in error_msg:
            return None, f"Invalid start tag{line_ref}"
        elif "endtag" in error_msg:
            return None, f"Invalid end tag{line_ref}"
        else:
            # For other errors, try to extract the meaningful part
            error_parts = original_error.split(":")
            if len(error_parts) > 1:
                clean_error = error_parts[-1].strip()
                if clean_error and len(clean_error) < 100:  # Reasonable error message length
                    return None, f"XML Parse Error: {clean_error}{line_ref}"
            return None, f"Invalid XML syntax{line_ref}"
    except Exception as e:
        return None, f"Unexpected error parsing XML: {e}"

def flatten_elements(root: ET.Element) -> dict:
    elements = {}

    def recurse(elem: ET.Element, path="", sib_counter=None):
        if sib_counter is None:
            sib_counter = {}

        local = strip_ns(elem.tag)
        canon = canonical_tag(local)

        if canon in IGNORE_TAGS:
            return

        attribs = {canonical_attr(strip_ns(k)): v for k, v in elem.attrib.items()}
        name_attr = attribs.get("name")

        if canon in {"ProtocolData", "UserDataField"} and name_attr:
            new_path = f"{path}/{canon}[@name='{name_attr}']"
        else:
            idx = sib_counter.get(canon, 0) + 1
            sib_counter[canon] = idx
            new_path = f"{path}/{canon}[{idx}]" if path else f"/{canon}[{idx}]"

        elements[new_path] = {
            "attrib": attribs,
            "text": (elem.text or "").strip()
        }

        child_counts = {}
        for child in elem:
            recurse(child, new_path, child_counts)

    recurse(root)
    return elements

def compare_xml(wcs_dict: dict, micro_dict: dict):
    diffs = []

    for path, wcs_elem in wcs_dict.items():
        if path not in micro_dict:
            diffs.append({
                "Difference Type": "Tag missing",
                "Tag Path": path,
                "Attribute": "-"
            })
            continue

        micro_elem = micro_dict[path]

        for attr, wcs_val in wcs_elem["attrib"].items():
            mic_val = micro_elem["attrib"].get(attr)
            if mic_val is None:
                diffs.append({
                    "Difference Type": "Attribute missing",
                    "Tag Path": path,
                    "Attribute": attr
                })
            elif mic_val != wcs_val:
                diffs.append({
                    "Difference Type": "Attribute mismatch",
                    "Tag Path": path,
                    "Attribute": attr
                })

        if wcs_elem["text"] != micro_elem["text"]:
            diffs.append({
                "Difference Type": "Text mismatch",
                "Tag Path": path,
                "Attribute": "(text)"
            })

    for path in micro_dict:
        if path not in wcs_dict:
            diffs.append({
                "Difference Type": "Extra tag",
                "Tag Path": path,
                "Attribute": "-"
            })

    return diffs
