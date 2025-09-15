import html
import re

def highlight_xml_strings(xml1, xml2, diffs):
    """
    Enhanced highlighting function that provides better visual feedback
    """
    def escape_html(text):
        return html.escape(text)
    
    def apply_highlights(xml_content, diff_list, content_type):
        # Escape HTML first
        highlighted = escape_html(xml_content)
        
        # Group differences by type for better highlighting
        tag_highlights = {}
        
        for diff in diff_list:
            diff_type = diff['Difference Type']
            tag_path = diff['Tag Path']
            attribute = diff['Attribute']
            
            # Extract the actual tag name from the path
            tag_match = re.search(r'/([^/\[]+)', tag_path)
            if tag_match:
                tag_name = tag_match.group(1)
                
                if diff_type == "Tag missing" and content_type == "left":
                    tag_highlights[tag_name] = "highlight-remove"
                elif diff_type == "Extra tag" and content_type == "right":
                    tag_highlights[tag_name] = "highlight-add"
                elif "mismatch" in diff_type.lower():
                    tag_highlights[tag_name] = "highlight-mismatch"
        
        # Apply highlights to tags
        for tag_name, css_class in tag_highlights.items():
            # Highlight opening tags
            pattern = f'&lt;{re.escape(tag_name)}(?=[\\s&gt;])'
            replacement = f'<span class="{css_class}">&lt;{tag_name}</span>'
            highlighted = re.sub(pattern, replacement, highlighted)
            
            # Highlight closing tags
            pattern = f'&lt;/{re.escape(tag_name)}&gt;'
            replacement = f'<span class="{css_class}">&lt;/{tag_name}&gt;</span>'
            highlighted = re.sub(pattern, replacement, highlighted)
        
        return highlighted
    
    # Process both XML strings
    highlighted_left = apply_highlights(xml1, diffs, "left")
    highlighted_right = apply_highlights(xml2, diffs, "right")
    
    return highlighted_left, highlighted_right
